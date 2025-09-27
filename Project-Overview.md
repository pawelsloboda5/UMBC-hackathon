# Inbox Guard for Healthcare — Project Overview (MVP)

> **One-liner:**  
> A small, privacy-first app that protects patients from phishing after healthcare data breaches by **flagging risky emails, redacting PII automatically**, and giving hospitals a simple **review dashboard**—with a **compose-time safety check** for outgoing messages.

---

## The problem we’re solving

When a healthcare system is breached, attackers often target patients directly. They send convincing emails that reference real (stolen) details—pushing victims to pay fake bills, share Social Security numbers, or click malware links. Patients need protection **in their inbox**; hospitals need visibility so they can **warn and protect** their communities quickly.

---

## Who it’s for

- **Patients / consumers** who want safer email without becoming experts in security.
- **Healthcare teams** (security, compliance, patient experience) who need a light-weight way to **see phishing waves**, confirm threats, and **send advisories**.

---

## What the product does (at a glance)

1. **Incoming protection (Gmail)**
   - Scans new emails.
   - Runs fast, rule-based checks (sender mismatch, suspicious links, look-alike domains, risky attachments, “urgent/pay now” language).
   - **Redacts personally identifiable information (PII)** before any AI sees the content.
   - Labels the message in Gmail (e.g., **“Phish-Suspected”** or **“Needs Review”**).

2. **Outgoing protection (Chrome)**
   - When a user is about to send an email, a small popup warns if they typed sensitive info (e.g., SSN, insurance ID).
   - One-click **“Redact & Send”** masks the sensitive parts automatically (e.g., `***-**-1234`).

3. **Human-in-the-loop dashboard (web app)**
   - Hospital admins see a **queue** of flagged emails, confirm or dismiss them, and push **advisory messages** to patients.
   - Simple analytics (common lures, spoofed brands, trend over time).

---

## How it works (bird’s-eye flow)

**Incoming email**
1. Gmail notifies our backend about a new message.
2. We fetch only what’s needed, then **strip HTML, extract links, and redact PII**.
3. **Phase 1: Classifier** (first line of defense) decides: _benign_, _phishing_, or _needs review_.
4. If uncertain, **Phase 2: AI + RAG** looks at similar (redacted) examples to boost confidence.
5. The message is **labeled** in Gmail and **logged** for the admin dashboard.

**Outgoing email**
1. In the compose window, the Chrome extension checks for PII as you type.
2. If found, it offers **Redact & Send** or **Send Anyway** (policy-controlled).

---

## Safety & privacy by design

- **Redact-before-AI:** No raw PII goes to models or logs.  
- **Minimal collection:** We keep only what we need (headers, findings, and a redacted copy if allowed).  
- **Clear audit trail:** Every decision (rule hit, AI verdict, admin override) is recorded.  
- **User control:** Quick menu to choose which PII types to auto-redact.  
- **Least privilege:** Access only the inbox scopes necessary to label and read new messages.

---

## What we’ll demo (MVP)

- **Scan Lab** page: paste an email, click **Scan**, see **redactions**, a verdict, and “why” explanations.
- A real inbox receiving a seeded phishing email that becomes **Phish-Suspected** within seconds.
- **Compose-time guard** catching SSN and masking it before sending.
- Admin dashboard: confirm a phish and generate a suggested advisory.
- Lightweight analytics: top lures and spoofed domains this week.

---

## Product surfaces

- **Web app (Vercel)**
  - **Home**: simple launcher and help.
  - **Scan Lab** (`/scan`): paste-to-scan testing tool (safe, local).
  - **Health** (`/health`): backend heartbeat.
  - **Admin** (`/dashboard`): review queue & advisories (coming after MVP).

- **Chrome extension**
  - Compose-time detector & redactor.
  - Small popup to pick PII types and policy.

- **Backend (AWS)**
  - Receives inbox notifications, performs scanning and redaction, applies labels, and feeds the dashboard.

---

## Architecture (plain language)

- **Frontend:** Next.js (React) for a fast, clean web app.  
- **Extension:** Chrome content script that integrates right in the Gmail compose window.  
- **Backend:** A small Python service that does scanning, redaction, and decisions.  
- **Database:** A managed Postgres with a simple schema for messages, results, and (later) embeddings.  
- **Integrations:** Gmail for inbox notifications and labels.  
- **Hosting:** Web on Vercel; backend on a small AWS server; database on a managed AWS instance.

*(MVP capacity: designed for ~1–5 users; easy to scale later.)*

---

## Core decisions (in plain English)

- **Two-stage protection:** Fast **Classifier** first; **AI** only when needed.  
- **Explainable results:** Always show **why** an email was flagged (e.g., “link text didn’t match the destination”).  
- **Human override:** Admins can confirm/undo flags and create simple rules (e.g., “always quarantine this look-alike domain”).  
- **PII first-class:** Everything revolves around protecting sensitive details before anything else happens.

---

## MVP scope

- **Works locally** with a “Scan Lab” page and sample emails.
- **Deterministic checks** that catch most obvious phishing tricks.
- **Solid redaction** (SSN, phone, email, addresses, card numbers, insurance IDs).
- **Chrome compose guard** on a demo page, then Gmail.
- **Labeling** in Gmail for a test account.
- **Basic dashboard queue** (confirm/dismiss), with simple charts.
- **No heavy ops**—just a tiny server and a managed database.

---

## Success metrics (early)

- **Detection rate:** % of true phishing emails flagged.  
- **False positives:** % of benign emails flagged.  
- **Time to flag:** seconds from arrival to label.  
- **Redaction accuracy:** sensitive items masked without over-blocking.

---

## Limitations & assumptions (MVP)

- Gmail only (for now).  
- Desktop Chrome (extension) only (for now).  
- Small user pool (1–5 testers).  
- AI is a **backup**, not the first line of defense.  
- Admin dashboard starts basic; batching and broadcasts are v2.

---

## Roadmap (short)

- **Week 1–2:** Classifier + redaction + Scan Lab; extension on demo page.  
- **Week 3–4:** Gmail notifications and labeling; dashboard queue.  
- **Week 5+:** AI + RAG for harder cases; org policies; advisories at scale; mobile surfaces; Outlook support.

---

## Friendly glossary

- **PII:** Personally Identifiable Information (e.g., SSN, full name + DOB).  
- **Phishing:** A message that tries to trick you into sharing info or money.  
- **Redaction:** Masking sensitive details so they’re unreadable.  
- **Classifier:** A quick decision engine that says “looks safe” or “looks risky.”  
- **RAG:** “Retrieve-and-generate” AI that consults similar past examples before deciding.  
- **Look-alike domain:** A fake address that visually imitates a real one (e.g., `cont0so.com`).

---

## Repo orientation (high level)

