# FastAPI Application (Backend App)

This directory contains the HackUMBC backend application built with FastAPI. It exposes health and scanning endpoints and hosts the deterministic phishing detection pipeline with PII redaction.

## Highlights
- FastAPI app in `app/main.py` with CORS enabled for local dev
- Modular routers in `app/routers/`
- Deterministic pipeline in `app/pipeline/` with PII redaction and DNS/SPF/DMARC checks
- Pydantic schemas in `app/schemas.py`

## Run (via Docker Compose)
From repo root:
```bash
docker compose up --build api db
```
API: `http://localhost:8000`

Health: `GET /health`

## Run (local uvicorn)
In `api/`:
```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Key Files
- `main.py`: creates FastAPI app, mounts routers
- `routers/health.py`: health endpoint
- `routers/scan.py`: scanning endpoint `POST /scan`
- `pipeline/`: redaction and deterministic scoring
- `schemas.py`: Pydantic models for input/output

## API
### POST /scan
Request body (JSON):
```json
{
  "sender": "someone@example.com",
  "receiver": "user@example.com",
  "subject": "Hello",
  "body": "Check this link https://bit.ly/x",
  "url": 1
}
```

Response body (JSON):
```json
{
  "verdict": "needs_review",
  "score": 3,
  "reasons": ["Shortened URL detected", "Urgency language detected"],
  "indicators": {"sender_domain": "example.com", "link_hosts": ["bit.ly"]},
  "redactions": {"types": {"email": 0, "phone": 0, "ssn": 0, "cc": 0, "dob": 0}, "count": 0},
  "redacted_body": "Check this link https://bit.ly/x"
}
```

## Pipeline Overview
Processing order for `POST /scan`:
1. Redact PII in body via `pipeline/pii.py`
2. Score deterministically via `pipeline/deterministic.py`:
   - Domain heuristics (freemail corporate claims, lookalikes)
   - URL heuristics (IP literal, shorteners)
   - Content cues (urgency, credential requests)
   - DNS checks (MX presence, SPF/DMARC TXT presence and DMARC policy)
3. Threshold to verdict: `benign | needs_review | phishing`

## Notes
- DNS checks use `dnspython` and query public DNS for MX/TXT; timeouts/errors are treated as missing records (conservative weighting).
- The rule weights live in `pipeline/deterministic.py` as `RULE_WEIGHTS` and can be adjusted in code.


