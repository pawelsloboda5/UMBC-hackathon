from __future__ import annotations

import os
from typing import List, Tuple

import sqlalchemy as sa
from pgvector.sqlalchemy import Vector

from app.db import engine
from app.schemas import EmailIn, ScanOut, AIAnalyzeOut, NeighborOut


def _combine_subject_body(subject: str | None, body: str | None) -> str:
    text_value = f"{subject or ''}\n\n{body or ''}".strip()
    # keep a reasonable cap to avoid oversized payloads
    return text_value[:8000]


def _embed_text(text_value: str, model: str = "text-embedding-3-small") -> List[float]:
    """
    Create a single embedding vector for the given text using OpenAI embeddings API.
    Returns a 1536-dim vector (per model spec) or raises RuntimeError if misconfigured.
    """
    try:
        from openai import OpenAI  # lazy import to avoid hard dep on non-AI paths
    except Exception as e:
        raise RuntimeError(
            "openai package not available. Rebuild the api image after updating requirements.txt"
        ) from e

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY environment variable is not set in api container")

    client = OpenAI(api_key=api_key)
    resp = client.embeddings.create(model=model, input=[text_value])
    return resp.data[0].embedding


def _nearest_neighbors(vec: List[float], limit: int = 8) -> List[NeighborOut]:
    """
    Return top-k neighbors by cosine similarity against messages.doc_emb.
    Uses pgvector with cosine distance operator (<->) and converts to similarity.
    """
    stmt = sa.text(
        """
        SELECT id,
               label,
               subject,
               1 - (doc_emb <-> :q) AS cosine_similarity
        FROM messages
        WHERE doc_emb IS NOT NULL
        ORDER BY doc_emb <-> :q
        LIMIT :lim
        """
    ).bindparams(
        sa.bindparam("q", type_=Vector(1536)),
    )

    rows: List[Tuple[int, int | None, str | None, float]] = []
    with engine.connect() as conn:
        # psycopg binds arrays via pgvector; ensure limit is int
        result = conn.execute(stmt, {"q": vec, "lim": int(limit)})
        rows = list(result.fetchall())

    neighbors: List[NeighborOut] = []
    for _id, label, subject, sim in rows:
        neighbors.append(
            NeighborOut(id=int(_id), label=(int(label) if label is not None else None), subject=subject, similarity=float(sim))
        )
    return neighbors


def _summarize_reasons_with_llm(
    *,
    subject: str,
    body: str,
    phase1: ScanOut,
    neighbors: List[NeighborOut],
    model: str = "gpt-4.1-mini",
) -> List[str]:
    """
    Use OpenAI Responses API to produce 3-5 concise reasons for/against phishing,
    grounded in Phase-1 flags and nearest neighbors.
    If the API is unavailable, fall back to a simple heuristic message.
    """
    try:
        from openai import OpenAI
    except Exception:
        # Fallback if package missing in dev
        return [
            "OpenAI client unavailable; showing deterministic reasons only.",
            *[r for r in phase1.reasons][:3],
        ]

    api_key = os.getenv("OPENAI_API_KEY", "").strip()
    if not api_key:
        return [
            "OPENAI_API_KEY not configured; showing deterministic reasons only.",
            *[r for r in phase1.reasons][:3],
        ]

    neighbor_lines = []
    for n in neighbors[:5]:
        lab = "phish" if (n.label == 1) else ("legit" if n.label == 0 else "unknown")
        neighbor_lines.append(f"id={n.id} label={lab} sim={n.similarity:.2f} subj={ (n.subject or '')[:60] }")

    phase1_summary = (
        f"phase1_verdict={phase1.verdict} score={phase1.score} "
        f"flags={'; '.join(phase1.reasons[:6])}"
    )

    prompt = (
        "You are a security assistant. Given an email and deterministic flags, plus nearest neighbors, "
        "write 3-5 short bullet reasons explaining whether it is phishing or not. "
        "Be concrete (URLs, domain auth, urgency, similarity). Keep each bullet under 18 words."
        "\n\nEmail Subject:\n" + subject[:200] +
        "\nEmail Body (redacted):\n" + body[:800] +
        "\n\nDeterministic Summary:\n" + phase1_summary +
        "\nNearest Neighbors (doc_emb cosine similarity):\n- " + "\n- ".join(neighbor_lines) +
        "\n\nRespond as bullet points only, no preface."
    )

    client = OpenAI(api_key=api_key)
    try:
        resp = client.responses.create(
            model=model,
            input=prompt,
            temperature=0.2,
        )
        text = getattr(resp, "output_text", None)
        if not text:
            # best-effort extraction
            text = str(resp)
    except Exception:
        return [
            "OpenAI Responses API call failed; showing deterministic reasons only.",
            *[r for r in phase1.reasons][:3],
        ]

    # Parse bullets into a list of strings
    lines = [ln.strip(" -\t") for ln in text.splitlines() if ln.strip()]
    # keep 3-5
    reasons = [ln for ln in lines if ln][:5]
    if not reasons:
        reasons = [text.strip()[:200]]
    return reasons


def _decide_ai_verdict(phase1: ScanOut, phish_neighbors: List[NeighborOut]) -> str:
    """
    Lightweight verdict logic combining deterministic outcome with neighbor similarity.
    Simple and conservative: strong phish similarity or phase1 phishing -> phishing;
    some phish neighbors -> needs_review; else benign.
    """
    # Immediate pass-through if already phishing
    if phase1.verdict == "phishing":
        return "phishing"

    top_sim = max((n.similarity for n in phish_neighbors), default=0.0)
    avg_top3 = sum(sorted((n.similarity for n in phish_neighbors), reverse=True)[:3]) / max(
        1, min(3, len(phish_neighbors))
    ) if phish_neighbors else 0.0

    if top_sim >= 0.88 or (phase1.verdict == "needs_review" and avg_top3 >= 0.82):
        return "phishing"
    if top_sim >= 0.75 or avg_top3 >= 0.72:
        return "needs_review"
    return phase1.verdict


def analyze_email(payload: EmailIn, phase1: ScanOut, *, neighbors_k: int = 8) -> AIAnalyzeOut:
    """
    Perform simple RAG analysis: embed input subject+body, retrieve nearest doc_emb neighbors,
    generate concise explanations via OpenAI Responses API, and return an AI verdict.
    """
    doc_text = _combine_subject_body(payload.subject, payload.body)

    try:
        vec = _embed_text(doc_text)
    except Exception:
        # If embeddings are unavailable, return minimal output with deterministic info only
        neighbors: List[NeighborOut] = []
        phish_neighbors: List[NeighborOut] = []
        ai_reasons = [
            "Embeddings unavailable; relying on deterministic analysis only.",
            *[r for r in phase1.reasons][:3],
        ]
        ai_verdict = phase1.verdict
        return AIAnalyzeOut(
            phase1=phase1,
            neighbors=neighbors,
            phish_neighbors=phish_neighbors,
            ai_verdict=ai_verdict,  # type: ignore[arg-type]
            ai_reasons=ai_reasons,
        )

    neighbors = _nearest_neighbors(vec, limit=neighbors_k)
    phish_neighbors = [n for n in neighbors if n.label == 1]

    ai_reasons = _summarize_reasons_with_llm(
        subject=payload.subject,
        body=phase1.redacted_body or payload.body,
        phase1=phase1,
        neighbors=neighbors,
    )
    ai_verdict = _decide_ai_verdict(phase1, phish_neighbors)

    return AIAnalyzeOut(
        phase1=phase1,
        neighbors=neighbors,
        phish_neighbors=phish_neighbors,
        ai_verdict=ai_verdict,  # type: ignore[arg-type]
        ai_reasons=ai_reasons,
    )


