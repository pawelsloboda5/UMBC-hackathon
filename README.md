# 🛡️ CyberCane – Smarter Phishing Detection

> **Stop phishing before it stops you.**  
> CyberCane is an AI-powered email security platform that combines **deterministic rules**, **vector search**, and **LLM reasoning** to detect and explain phishing attempts in real-time.

---

## 🌟 The Story

Every day, millions of phishing emails land in inboxes. Some are crude, but others look indistinguishably real.  
We asked ourselves: **what if we could make inbox security both *explainable* and *AI-smart***?

That’s how **CyberCane** was born.  
A system where rules and AI work together: rules for speed and clarity, AI for nuance and context.

---

## 🚀 How It Works

1. **Connect Gmail** → CyberCane securely fetches your latest 10 emails.  
2. **Phase-1 Deterministic Scan** → DNS, SPF/DMARC, urgency keywords, suspicious URLs.  
3. **Phase-2 AI Insights** → Embeds the email, finds similar known phish in our DB, and asks an LLM to judge.  
4. **Explainability First** → You don’t just see *“Phish”* or *“Safe”*. You see **why**.

---

## 📸 Screenshots

### 1. Scanning a Suspicious Email  
Phase-1 flags missing MX + DMARC. AI confirms phishing with high similarity.  
![Scan Example 1](/web/public/pic1.png)  
*Why it matters: Users immediately see both the technical red flags and the AI’s verdict, building trust in the system.*

---

### 2. Spoofing Detection in Action  
CyberCane catches mismatched domains (navyfederal.org vs mynfcu.org) and explains the spoof.  
![Scan Example 2](/web/public/pic2.png)  
*Why it matters: Spoofed domains are one of the hardest tricks for humans to spot — CyberCane reveals them instantly.*

---

### 3. Nearest Neighbors + PII Redaction  
Emails are embedded and compared with known phish. All PII (emails, phones, CCs) are safely redacted.  
![Scan Example 3](/web/public/pic3.png)  
*Why it matters: Similarity search makes detection smarter over time, while redaction ensures privacy-first AI calls.*

---

### 4. Real-Time Dashboard  
See your scan history, phishing stats, and system health in one view.  
![Dashboard](/web/public/pic4.png)  
*Why it matters: Users and admins can monitor email safety at a glance, with clear separation of phishing vs legitimate mail.*

---

### 5. Deep Email Analysis  
Compare an email with its closest phishing neighbor — similarity score, redactions, and reasons highlighted.  
![Email Analysis Example 1](/web/public/pic5.png)  
*Why it matters: Context builds confidence — seeing near-identical past phish explains why the model flagged this message.*

---

### 6. Detecting Credential Harvesters  
Another phishing attempt caught. AI explains the tricks and suggests blocking the sender.  
![Email Analysis Example 2](/web/public/pic6.png)  
*Why it matters: CyberCane not only classifies the email but also recommends an action, giving users a clear next step.*

---

## 🧩 Built With

- **Frontend:** Next.js 15 + TailwindCSS + NextAuth (Google OAuth)  
- **Backend:** FastAPI + SQLAlchemy  
- **Database:** PostgreSQL 17 + pgvector (HNSW similarity search)  
- **AI:** OpenAI GPT-4.1-mini for reasoning + `text-embedding-3-small` for vectorization  
- **Infra:** Docker Compose (API, DB, Web)  

---

## 🏆 Why It Stands Out

- ✅ **Explainable Security** – Users see *why* an email was flagged.  
- ✅ **Privacy-First** – All PII is redacted before AI calls.  
- ✅ **Two-Phase Detection** – Rules for speed, AI for nuance.  
- ✅ **Vector-Powered RAG** – Finds similar phishing attempts in our DB.  

---

## 🔄 Human in the Loop

CyberCane is built with **humans at the center**:  
- Users can review flagged emails and confirm phishing verdicts.  
- Every **verified phishing email** is **added back into the vector database**, strengthening the RAG engine.  
- This feedback loop means **the more it’s used, the smarter it gets** — the dataset grows exponentially, making it harder for future phishing emails to slip through.

---

## 🔮 What’s Next

- Gmail push notifications via Pub/Sub (real-time detection).  
- Outlook & enterprise email support.  
- Browser extension for one-click scans.  
- Fine-tuned phishing classifier for higher accuracy.  

---

## 🎥 Demo

👉 *https://www.loom.com/share/bbf84dcad8484863bbf4febc4674518b*  

---

## 💡 Inspiration

Phishing is the #1 cause of breaches. CyberCane makes detection **transparent, explainable, and AI-driven** — so people can feel safe in their inbox again.

---
