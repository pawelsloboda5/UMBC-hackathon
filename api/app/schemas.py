from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, EmailStr

class PingOut(BaseModel):
    id: int
    msg: str


class EmailIn(BaseModel):
    """
    Minimal email payload for the Scan Lab and backend pipeline.
    - sender/receiver: email addresses
    - subject/body: message fields
    - url: 1 if email contains at least one link, else 0 (from dataset semantics)
    """

    sender: EmailStr
    receiver: Optional[EmailStr] = None
    subject: str
    body: str
    url: int


class RedactionsOut(BaseModel):
    """
    Summary of PII redactions performed. Raw PII is never returned.
    """

    types: Dict[str, int]
    count: int


class ScanOut(BaseModel):
    """
    Output of deterministic classifier pipeline.
    verdict: one of benign | needs_review | phishing
    reasons: human-readable explanations for UI transparency
    indicators: key boolean/numeric indicators used in decisioning
    """

    verdict: Literal["benign", "needs_review", "phishing"]
    score: int
    reasons: List[str]
    indicators: Dict[str, Any]
    redactions: RedactionsOut
    redacted_body: str

