import re
from dataclasses import dataclass
from typing import Any, Dict, List, Tuple
import dns.resolver
import dns.exception

FREEMAIL_DOMAINS = {
    "gmail.com",
    "yahoo.com",
    "outlook.com",
    "hotmail.com",
    "aol.com",
    "proton.me",
}

URL_SHORTENERS = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "ow.ly",
    "buff.ly",
}

URGENCY_KEYWORDS = {
    "urgent",
    "immediate action",
    "verify your account",
    "password expires",
    "suspend",
    "pay now",
    "update your information",
}

CREDENTIAL_KEYWORDS = {
    "password",
    "login",
    "ssn",
    "social security",
    "credit card",
    "bank account",
}


def _extract_domain(addr: str) -> str:
    if "@" not in addr:
        return ""
    return addr.rsplit("@", 1)[1].lower().strip()


_URL_HOST_RE = re.compile(r"https?://([^/\s]+)")
_IP_LIT_RE = re.compile(r"^\d{1,3}(?:\.\d{1,3}){3}$")


def _hosts_in_text(text: str) -> List[str]:
    hosts: List[str] = []
    for m in _URL_HOST_RE.finditer(text):
        host = m.group(1).lower()
        # strip brackets for IPv6 or ports
        host = host.split(":")[0].strip("[]")
        hosts.append(host)
    return hosts


def _is_confusable(a: str, b: str) -> bool:
    # Extremely lightweight placeholder for confusable detection.
    # We normalize some common substitutions to catch basic lookalikes.
    simple_map = str.maketrans({"0": "o", "1": "l", "3": "e", "5": "s", "7": "t"})
    na = a.translate(simple_map)
    nb = b.translate(simple_map)
    return na == nb and a != b


def _has_mx(domain: str) -> bool:
    try:
        answers = dns.resolver.resolve(domain, "MX")
        return len(answers) > 0
    except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer, dns.resolver.NoNameservers, dns.exception.DNSException):
        return False


def _spf_record(domain: str) -> str | None:
    try:
        answers = dns.resolver.resolve(domain, "TXT")
        for rdata in answers:
            txt = b"".join(rdata.strings).decode("utf-8", "ignore") if hasattr(rdata, "strings") else str(rdata)
            if txt.lower().startswith("v=spf1"):
                return txt
    except Exception:
        return None
    return None


def _dmarc_record(domain: str) -> str | None:
    query = f"_dmarc.{domain}"
    try:
        answers = dns.resolver.resolve(query, "TXT")
        for rdata in answers:
            txt = b"".join(rdata.strings).decode("utf-8", "ignore") if hasattr(rdata, "strings") else str(rdata)
            if txt.lower().startswith("v=dmarc1"):
                return txt
    except Exception:
        return None
    return None


def _parse_dmarc_policy(txt: str | None) -> str | None:
    if not txt:
        return None
    parts = [p.strip() for p in txt.split(";")]
    for p in parts:
        if p.startswith("p="):
            return p.split("=", 1)[1]
    return None


def _auth_results_for_domain(domain: str) -> Dict[str, Any]:
    has_mx = _has_mx(domain)
    spf = _spf_record(domain)
    dmarc = _dmarc_record(domain)
    dmarc_policy = _parse_dmarc_policy(dmarc)
    return {
        "has_mx": has_mx,
        "spf_present": bool(spf),
        "dmarc_present": bool(dmarc),
        "dmarc_policy": dmarc_policy or "none",
    }


@dataclass
class Decision:
    verdict: str
    score: int
    reasons: List[str]
    indicators: Dict[str, Any]


RULE_WEIGHTS: Dict[str, int] = {
    "freemail_brand_claim": 2,
    "lookalike_domain": 2,
    "ip_literal_link": 2,
    "shortened_url": 1,
    "urgency": 1,
    "creds_request": 1,
    "missing_mx": 2,
    "no_spf": 2,
    "no_dmarc": 1,
    "strict_dmarc_missing_align": 3,
}


def score_email(*, sender: str, subject: str, body: str, url_flag: int,
                allowed_brand_domains: List[str] | None = None,
                rule_weights: Dict[str, int] | None = None,
                enable_dns_checks: bool = True) -> Decision:
    allowed_brand_domains = allowed_brand_domains or []
    weights = rule_weights or RULE_WEIGHTS
    reasons: List[str] = []
    indicators: Dict[str, Any] = {}
    score = 0

    sender_domain = _extract_domain(sender)
    indicators["sender_domain"] = sender_domain

    # DNS/Auth checks
    auth: Dict[str, Any] = {"has_mx": None, "spf_present": None, "dmarc_present": None, "dmarc_policy": None}
    if enable_dns_checks and sender_domain:
        auth = _auth_results_for_domain(sender_domain)
        indicators["auth"] = auth
        if not auth.get("has_mx"):
            score += weights.get("missing_mx", 0)
            reasons.append("Sender domain missing MX record")
        if not auth.get("spf_present"):
            score += weights.get("no_spf", 0)
            reasons.append("SPF not present for sender domain")
        if not auth.get("dmarc_present"):
            score += weights.get("no_dmarc", 0)
            reasons.append("DMARC not present for sender domain")

    # 1) Freemail claiming corporate
    if sender_domain in FREEMAIL_DOMAINS:
        for brand in allowed_brand_domains:
            if brand in subject.lower() or brand in body.lower():
                score += weights.get("freemail_brand_claim", 0)
                reasons.append("Freemail sender claims corporate brand")
                indicators["freemail_brand_claim"] = True
                break

    # 2) Lookalike domains
    for brand in allowed_brand_domains:
        if _is_confusable(sender_domain, brand):
            score += weights.get("lookalike_domain", 0)
            reasons.append("Sender domain looks like brand domain (confusable)")
            indicators.setdefault("lookalike", []).append({"sender": sender_domain, "brand": brand})
            break

    # 3) URL-based checks if url_flag indicates links
    if url_flag == 1:
        hosts = _hosts_in_text(body)
        indicators["link_hosts"] = hosts
        for h in hosts:
            if _IP_LIT_RE.match(h):
                score += weights.get("ip_literal_link", 0)
                reasons.append("Link points to IP literal host")
            if any(h.endswith(s) for s in URL_SHORTENERS):
                score += weights.get("shortened_url", 0)
                reasons.append("Shortened URL detected")

    # 4) Content cues: urgency + credentials
    low_body = body.lower()
    if any(k in low_body for k in URGENCY_KEYWORDS):
        score += weights.get("urgency", 0)
        reasons.append("Urgency language detected")
        indicators["urgency"] = True

    if any(k in low_body for k in CREDENTIAL_KEYWORDS):
        score += weights.get("creds_request", 0)
        reasons.append("Credentials/PII request language detected")
        indicators["creds_request"] = True

    # Thresholds per PLAN.md
    if score < 2:
        verdict = "benign"
    elif score < 5:
        verdict = "needs_review"
    else:
        verdict = "phishing"

    return Decision(verdict=verdict, score=score, reasons=reasons, indicators=indicators)


