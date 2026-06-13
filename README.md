# AdmissionIQ — AI-Powered Multi-Agent Admission Counselor Platform

> Built for **DMI — Digital Marketing Institute, Pune**  
> 7 AI Agents · Gemini 2.5 Flash · FastAPI · React · SQLite

---

## 🚀 Run Commands

### Terminal 1 — Backend (FastAPI)

```powershell
# From the project root (d:\Lead_Nurturing_Agent)
.\venv\Scripts\Activate.ps1

cd admissioniq\backend

$env:PYTHONIOENCODING="utf-8"
uvicorn main:app --reload --port 8000
```

Backend runs at → **http://localhost:8000**  
API docs available at → **http://localhost:8000/docs**

---

### Terminal 2 — Frontend (React + Vite)

```powershell
# Open a second terminal — no venv needed
cd admissioniq\frontend

npm run dev
```

Frontend runs at → **http://localhost:5173**

---

## 🔑 Required: Add Gemini API Key

Before running, edit `admissioniq/backend/.env`:

```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
DATABASE_URL=sqlite:///./admissioniq.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Get your key at → https://aistudio.google.com/app/apikey

> **Note:** Rule-based agents (scoring, qualification, escalation, knowledge) work immediately without a key. Gemini agents (recommendation, objection handling, follow-up) require the key.

---

## 📁 Project Structure

```
d:\Lead_Nurturing_Agent\
├── venv\                          ← Python virtual environment
└── admissioniq\
    ├── frontend\                  ← React app (Vite + TypeScript + Tailwind)
    │   ├── src\
    │   │   ├── pages\
    │   │   │   ├── LandingPage.tsx
    │   │   │   ├── ConsultationStart.tsx
    │   │   │   ├── WorkspacePage.tsx
    │   │   │   └── DashboardPage.tsx
    │   │   ├── components\
    │   │   │   ├── ChatPanel.tsx
    │   │   │   ├── AgentTimeline.tsx
    │   │   │   ├── LeadScoreGauge.tsx
    │   │   │   ├── CareerPathTimeline.tsx
    │   │   │   └── FollowUpCard.tsx
    │   │   ├── context\
    │   │   │   └── SessionContext.tsx
    │   │   ├── types\
    │   │   │   └── index.ts
    │   │   └── utils\
    │   │       ├── api.ts
    │   │       └── helpers.ts
    │   ├── tailwind.config.ts
    │   ├── vite.config.ts
    │   └── package.json
    │
    ├── backend\                   ← FastAPI app (Python)
    │   ├── agents\
    │   │   ├── orchestrator.py              ← Master pipeline controller
    │   │   ├── qualification_agent.py       ← Rule-based (NO Gemini)
    │   │   ├── lead_intelligence_agent.py   ← Deterministic scoring (NO Gemini)
    │   │   ├── knowledge_agent.py           ← JSON lookup (NO Gemini)
    │   │   ├── escalation_agent.py          ← Threshold rules (NO Gemini)
    │   │   ├── recommendation_agent.py      ← Gemini 2.5 Flash
    │   │   ├── objection_agent.py           ← Gemini 2.5 Flash
    │   │   └── followup_agent.py            ← Gemini 2.5 Flash
    │   ├── models\
    │   │   └── lead.py                      ← Pydantic models
    │   ├── database\
    │   │   └── db.py                        ← SQLAlchemy + SQLite
    │   ├── data\
    │   │   └── knowledge_base.json          ← DMI courses, FAQs, placements
    │   ├── main.py                          ← FastAPI app entry point
    │   ├── .env                             ← Your secrets (add Gemini key here)
    │   ├── .env.example                     ← Template
    │   └── requirements.txt
    │
    └── documentation\
        ├── README.md                        ← This file
        └── architecture\
            ├── system_architecture.md
            ├── agent_workflow.md
            ├── lead_journey.md
            └── memory_flow.md
```

---

## 🤖 The 7 Agents

| # | Agent | Type | Uses Gemini? | Purpose |
|---|---|---|---|---|
| 1 | Qualification Agent | Rule-Based Python | ❌ No | Extracts name, email, phone, education, role, goal, budget, timeline from messages |
| 2 | Lead Intelligence Agent | Rule-Based Python | ❌ No | Computes deterministic 0–100 lead score from profile fields |
| 3 | Knowledge Agent | JSON Dict Lookup | ❌ No | Answers FAQs by keyword-matching against knowledge_base.json |
| 4 | Escalation Agent | Rule-Based Python | ❌ No | Flags HOT leads and enrollment/negotiation/callback intent |
| 5 | Recommendation Agent | Gemini 2.5 Flash | ✅ Yes | Matches lead profile to best course with confidence % |
| 6 | Objection Handling Agent | Gemini 2.5 Flash | ✅ Yes | Detects concerns, generates empathetic data-backed responses |
| 7 | Follow-Up Agent | Gemini 2.5 Flash | ✅ Yes | Generates personalized WhatsApp + email follow-ups |

**Master Orchestrator** sequences all 7 agents per message:  
`Qualification → Scoring → Escalation → Knowledge → Objection → Recommendation → Follow-Up → SQLite`

---

## 📊 Lead Scoring Formula (Deterministic — Never Delegated to AI)

```python
Goal Clarity   max 25   (career goal present + specific)
Urgency        max 20   (immediately=20, 1 month=15, 1-3 months=10, 3-6 months=6)
Budget         max 20   (₹64,999=20, ₹44,999=16, ₹29,999=12, ₹18,999=8)
Engagement     max 15   (8+ messages=15, 5+=11, 3+=7)
Motivation     max 10   (job/switch/agency/startup keywords)
Intent         max 10   (enroll/join=10, fee/emi=7, demo/brochure=4)
─────────────────────────
Total          max 100

HOT  ≥ 80   →  Follow-up in 1 day
WARM 50–79  →  Follow-up in 3 days
COLD < 50   →  Follow-up in 7 days
```

---

## 🎯 Escalation Rules (Deterministic — Never Delegated to AI)

Escalation triggers when **any** of the following are true:
- Lead score ≥ 80 (HOT lead)
- Message contains enrollment keywords: `enroll, admission, join, register`
- Message contains negotiation keywords: `discount, scholarship, reduce fee`
- Message contains callback keywords: `call me, speak to, counselor`
- Message contains urgency keywords: `urgent, asap, today, immediately`

---

## 🏫 DMI Courses (from knowledge_base.json)

| Course | Fee | EMI | Duration | Placement Rate |
|---|---|---|---|---|
| Digital Marketing Starter | ₹18,999 | ₹3,200×6 | 3 months | 82% |
| Performance Marketing Pro | ₹44,999 | ₹4,500×10 | 5 months | 94% |
| Digital Marketing + Analytics Combo | ₹64,999 | ₹6,500×10 | 8 months | 89% |
| Performance Marketing Bootcamp | ₹29,999 | ₹5,000×6 | 3 months | — (business owners) |
| Social Media Marketing Specialist | ₹22,999 | ₹3,800×6 | 3 months | 80% |

---

## 🧪 Demo Scenarios (pre-loaded in UI)

| Scenario | Lead | Category | Score | Recommended Course |
|---|---|---|---|---|
| 1 | Priya Ramesh — BCom Final Year | 🔴 HOT | 80 | Performance Marketing Pro |
| 2 | Arjun Mehta — Software Developer (3 yrs) | 🟡 WARM | 63 | Analytics Combo |
| 3 | Sunita Kapoor — Boutique Store Owner | 🟡 WARM | 67 | Business Bootcamp |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `GET` | `/health` | Knowledge base + DB status |
| `POST` | `/api/chat` | Main chat — runs all 7 agents |
| `GET` | `/api/leads` | List all leads (filter: `?category=HOT&escalated=true`) |
| `GET` | `/api/leads/{id}` | Get single lead by ID |
| `GET` | `/api/dashboard/stats` | Aggregated stats for dashboard |
| `POST` | `/api/leads/demo?scenario=1` | Load a demo lead (scenario 1, 2, or 3) |
| `GET` | `/api/knowledge-base` | Return full knowledge base JSON |
| `GET` | `/docs` | Swagger UI (FastAPI auto-generated) |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript |
| Build tool | Vite |
| Styling | TailwindCSS + custom glassmorphism |
| Animations | Framer Motion |
| Charts | Recharts |
| HTTP client | Axios |
| Server state | React Query (@tanstack/react-query) |
| Backend | FastAPI (Python) |
| Database | SQLite via SQLAlchemy |
| AI model | Google Gemini `gemini-2.5-flash-lite` (temperature 0.3) |
| AI SDK | `google-generativeai` Python package |
| Knowledge base | `knowledge_base.json` — loaded into memory at startup |

---

## ⚙️ Gemini Configuration (all 3 AI agents use this)

```python
import google.generativeai as genai

genai.configure(api_key=GEMINI_API_KEY)
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash-lite",
    generation_config={"temperature": 0.3}
)

response = model.generate_content(prompt)
result = json.loads(response.text)   # Always parsed — never returned as raw text
```

---

## 🗄 Database Schema (SQLite — `admissioniq.db`)

Created automatically on first run at `admissioniq/backend/admissioniq.db`

Key fields stored per lead:
- Full profile: name, email, phone, education, role, goal, budget, timeline
- Lead score + category + breakdown
- Recommended course + career path
- Full conversation history (JSON)
- Follow-up schedule + WhatsApp/email messages
- Escalation status + reasons
- Timestamps (created_at, updated_at)
