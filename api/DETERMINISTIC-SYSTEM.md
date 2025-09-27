## Deterministic Phishing Detection System — Research Summary

This document summarizes deterministic (rule-based) techniques to flag suspicious senders and emails. Focus is on signals that can be computed from headers, addresses, domains, URLs, and content without ML. Where possible, guidance is aligned to relevant standards.

### 1) Sender authentication and header integrity
- SPF alignment check (mail-from/return-path vs. `From:` domain). Misaligned/failed SPF is a strong signal. See RFC 7208 (Sender Policy Framework).
- DKIM signature verified and aligned with `From:` domain. See RFC 6376 (DKIM).
- DMARC policy evaluation (p=none/quarantine/reject) plus identifier alignment (SPF or DKIM aligned is required). Failing both with a strong DMARC policy is high risk. See RFC 7489 (DMARC).
- ARC chain presence/validity for forwarded mail; broken ARC when message claims trusted forwarder is suspicious. See RFC 8617 (ARC).
- Reply-To mismatch: `Reply-To:` domain differs from visible `From:` domain without a legitimate reason.
- Display name impersonation: display name matches high-profile brand or internal executive while the underlying address is off-domain.
- Return-Path anomalies: null/suspicious envelope-from inconsistent with header `From:`.

Deterministic rules:
- Fail if DMARC=fail AND SPF=fail AND DKIM=fail.
- Elevate if DMARC=fail and `From:` domain claims to be a high-value brand or your own org domain.
- Elevate if `Reply-To` domain != `From` domain and not on allowlist.

### 2) Domain trust and look-alike analysis
- Exact domain reputation: allowlist known partner domains; denylist known bad.
- Look-alike domains (IDN and ASCII) using confusable character mapping per Unicode TR39. Examples: `paypaI.com` (uppercase i), `cont0so.com` (zero for o), homoglyphs via IDN.
- Newly registered/low-age domains (if available via WHOIS feed). If unavailable, heuristics: uncommon TLD for brand, excessive subdomain depth.
- Freemail senders claiming corporate identity (e.g., display name “Bank of America” from `@gmail.com`).

Deterministic rules:
- Elevate if sender domain is confusable with allowlisted brand domains but not an exact match.
- Elevate if sender uses freemail domain while content claims corporate authority.

### 3) URL/link heuristics (when `url` present)
- Anchor-text vs href mismatch: visible link text shows one domain but target is different.
- Multiple redirects or URL shorteners (bit.ly, tinyurl, etc.). Expand and compare if possible.
- Non-HTTPS to credential pages.
- IP-address URLs, punycode hostnames, or excessive tracking parameters.

Deterministic rules:
- Elevate if anchor text domain != destination domain (and not a legitimate redirector).
- Elevate if shortened URL domain not in allowlist.
- Elevate if URL host is an IP literal.

### 4) Attachment and file heuristics
- High-risk extensions: executable, script, archive with double extensions (e.g., `invoice.pdf.exe`), macro-enabled Office docs.
- Password-protected archives advertised in body.

Deterministic rules:
- Elevate on any high-risk extension unless sender is on allowlist.

### 5) Content and language cues (deterministic patterns)
- Urgency and transactional lures: “verify your account,” “password expires,” “urgent payment,” “your account will be suspended.”
- Credential/PII requests: asking for SSN, DOB, card numbers (coordinate with PII detector to avoid storing raw PII).
- Brand misuse: mentions brand X while sender domain is not brand X nor an authorized domain.

Deterministic rules:
- Elevate if body contains strong-urgency keywords AND links present.
- Elevate if request for credentials/PII detected AND links present.

### 6) Behavioral/header path anomalies
- Received chain inconsistencies (internal mail claiming to originate externally without expected gateways).
- From domain MX mismatch: domain has no MX but sends mail.

Deterministic rules:
- Elevate if sending domain missing MX records.

### 7) Scoring and decisioning
- Each rule contributes points; strong failures (DMARC/SPF/DKIM) weigh higher than soft heuristics (phrasing).
- Example thresholds:
  - score < 2 → benign
  - 2 ≤ score < 5 → needs_review
  - score ≥ 5 → phishing

### Privacy and safety
- Redact PII before logging or AI handoff. Avoid storing full URLs with secrets; store host + path hash if needed.

### References (authoritative)
- SPF: RFC 7208 — Sender Policy Framework (SPF) for Authorizing Use of Domains in Email.
- DKIM: RFC 6376 — DomainKeys Identified Mail (DKIM) Signatures.
- DMARC: RFC 7489 — Domain-based Message Authentication, Reporting, and Conformance (DMARC).
- ARC: RFC 8617 — Authenticated Received Chain (ARC).
- Unicode Security: Unicode Technical Report #39 — Security Mechanisms (confusables / IDN homograph).


