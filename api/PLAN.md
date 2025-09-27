## Plan — Implement Deterministic Rules into Backend Pipeline

This plan wires a lightweight, explainable rule engine into the FastAPI backend, using redaction-first processing and clear outputs for the web UI.

### 1) Files and module boundaries
- `api/app/pipeline/pii.py`
  - Keep regex-based PII detector and redactor (SSN, CC, MRN, DOB, email, phone, address). Provide `redact(text) -> (redacted_text, findings)`.
- `api/app/pipeline/deterministic.py`
  - Implement deterministic rules and scoring as pure functions. Input: structured message fields. Output: `Decision(verdict, score, reasons, indicators)`.
- `api/app/pipeline/classify.py`
  - Orchestrates steps: normalize → redact → deterministic → result. Stub for future AI/RAG handoff on "needs_review" only.
- `api/app/routers/scan.py`
  - Add POST `/scan` to accept payload `{ sender, receiver, subject, body, url }` (matching CSV semantics) and return redactions + decision.

### 2) Data model (in-memory for MVP)
- Define `EmailIn` Pydantic model: `sender, receiver, subject, body, url (int 0/1)`. Optional `headers` for future.
- Define `DecisionOut`: `verdict: oneof("benign","needs_review","phishing"), score: int, reasons: list[str], indicators: dict, redacted_body: str`.

### 3) Deterministic rule set mapping
Implement the research rules as functions returning `(points, reason, key:value indicators)`:
- Auth placeholders (since we don’t fetch live SPF/DKIM/DMARC in MVP):
  - `check_reply_to_mismatch(sender, reply_to)` (future; default none)
- Domain checks:
  - `check_lookalike(sender_domain, allowed_brand_domains)` via confusables map.
  - `check_freemail_claims_corporate(sender, body)`.
- URL checks (when `url == 1`):
  - `check_shortener(host)` for common shorteners.
  - `check_ip_literal(host)`.
  - `check_anchor_mismatch(visible, target)` (future; MVP has body only, so skip or basic regex for `[text](url)` and `<a>`).
- Attachment checks: placeholder (dataset has no attachments; keep interface).
- Content cues:
  - `check_urgency_keywords(body)`.
  - `check_credentials_request(body)`.

Scoring and thresholds:
- Start weights: strong=3, medium=2, weak=1. Thresholds: `<2 benign`, `2–4 needs_review`, `>=5 phishing`.

### 4) Pipeline flow
1. Normalize inputs (trim, lowercase where safe, extract hostnames from URLs in body if present).
2. Redact PII via `pii.redact(body)`; store findings, use redacted body afterwards.
3. Run deterministic checks; collect reasons and indicators; sum score.
4. Decide verdict by threshold; return structured response.

### 5) API contract
- POST `/scan`
  - Request: `{ sender: str, receiver: str, subject: str, body: str, url: int }`
  - Response: `{ verdict, score, reasons, indicators, redactions: { types, count }, redacted_body }`

### 6) Implementation steps
1. Implement minimal helpers in `deterministic.py` (domain parsing, confusables map, url host extraction, keyword sets).
2. Implement scoring functions and aggregator.
3. Create `classify.py` orchestrator.
4. Implement `/scan` router: validate payload, call orchestrator, return JSON.
5. Add unit tests for core rules (URLs present, urgency keywords, freemail corporate claims, lookalikes).

### 7) Tests (MVP)
- Add `tests/test_deterministic.py` cases for:
  - benign with no url, no urgency
  - phishing with url + urgency
  - freemail corporate claim
  - lookalike domain detection

### 8) Non-goals/assumptions (MVP)
- No live DNS/SPF/DKIM/DMARC queries; provide stubs/interfaces for future.
- No attachment inspection in dataset; keep extension hooks.

### 9) Future extensions
- Integrate DNS lookups for MX existence and DMARC/SPF alignment.
- Parse raw RFC822 for `Received`, `Reply-To`, ARC.
- Expand URL analyzer to follow safe HEAD redirects and detect trackers.
- Allow org-configurable allow/deny lists and brand domains.


