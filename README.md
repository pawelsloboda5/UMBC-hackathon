# 🚀 CyberCane Workflow

## 1. Seamless Gmail Integration  
CyberCane securely connects to your Gmail soon for now can automatically go through thousands of phishing emails in a csv no manual upload, no friction.  

## 2. Phase-1: Deterministic Defense  
Every email is first scanned with traditional rule-based checks:  
- DNS lookups  
- SPF/DMARC alignment  
- Urgency keyword spotting  
- Suspicious URL detection  

This acts as a **fast, deterministic firewall**.  

## 3. Phase-2: AI-Powered Judgment with RAG  
The email is embedded and compared against our **corpus of 100,000+ labeled phishing emails** using a Retrieval-Augmented Generation (RAG) pipeline.  

- If the email closely matches known attacks, we flag it.  
- An LLM provides **contextual reasoning**, explaining how this email aligns with real phishing attempts.  

## 4. Human-in-the-Loop Assurance  
For low-confidence cases, CyberCane escalates to a **human reviewer** directly inside the workflow.  

- They can block the sender, trigger alerts, or safely ignore.  
- Each decision feeds back into the system, strengthening the AI over time.  

## 5. Explainability + Data Flywheel  
Users don’t just see *“Phish”* or *“Safe.”* They see **why**:  
- Mismatched domains  
- Threatening language  
- Nearest-neighbor examples from the phishing corpus  

Every flagged or confirmed case expands the dataset, creating an **automatic data flywheel** where the system continuously improves.  

---

## 🎯 Judge Takeaway  
CyberCane isn’t just an AI spam filter.  
It’s a **closed-loop, explainable security platform** that combines:  
- Deterministic checks  
- A massive phishing knowledge base  
- Adaptive AI  
- Human oversight  
## 📸 Screenshots

### 1. Scanning a Suspicious Email  
Phase-1 flags missing MX + DMARC. AI confirms phishing with high similarity. Automated runs through all CSV rows.   
![Scan Example 1](/web/public/pic1.png)  
*Why it matters: Users immediately see both the technical red flags and the AI’s verdict, building trust in the system.*

---

### 2. Spoofing Detection in Action  
CyberCane catches mismatched domains (navyfederal.org vs mynfcu.org) and explains the spoof.  
![Scan Example 2](/web/public/pic2.png)  
*Why it matters: Spoofed domains are one of the hardest tricks for humans to spot — CyberCane reveals them instantly.*

---

### 3. Nearest Neighbors + PII Redaction  
Emails are embedded and compared with known phish. All PII (emails, phones, CCs) are safely redacted. 100k phishing emails labeled. 
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
