# System Architecture

## High-Level Overview

```
User (Browser)
    │
    ▼
React Frontend (Vite + TailwindCSS + Framer Motion)
    │  POST /api/chat
    ▼
FastAPI Backend
    │
    ▼
Master Orchestrator
    │
    ├── Qualification Agent       ← Rule-based Python (NO Gemini)
    ├── Lead Intelligence Agent   ← Deterministic formula (NO Gemini)
    ├── Escalation Agent          ← Threshold keywords (NO Gemini)
    ├── Knowledge Agent           ← JSON dict lookup (NO Gemini)
    ├── Objection Agent           ← Gemini gemini-2.5-flash-lite (temp 0.3)
    ├── Recommendation Agent      ← Gemini gemini-2.5-flash-lite (temp 0.3)
    └── Follow-Up Agent           ← Gemini gemini-2.5-flash-lite (temp 0.3)
         │
         ▼
    SQLite Database (lead profile, conversation history, scores)
```

## Key Architectural Principle

**Gemini is used only for language generation tasks. Deterministic decisions are handled by Python.**

| Decision Type | Handled By |
|---|---|
| Lead scoring | Python arithmetic formula |
| Escalation triggers | Python keyword + threshold logic |
| FAQ answers | JSON dict keyword lookup |
| Course recommendation reasoning | Gemini |
| Objection responses | Gemini |
| Follow-up message generation | Gemini |
| Conversation summarization | Gemini (every 5 turns) |

## Why This Matters

If Gemini computed the lead score, it would return 78 one time and 85 the next for identical input. That is unacceptable in a business context where:
- Counselors need to audit why a lead was escalated
- Sales teams need consistent priority queues
- Management needs reliable conversion metrics

Rule-based scoring gives you auditability, consistency, and speed.

## Gemini Configuration

```python
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash-lite",
    generation_config={"temperature": 0.3}
)
```

Temperature 0.3 ensures focused, consistent responses without being completely deterministic. All Gemini agents:
1. Construct a structured prompt with JSON schema
2. Instruct Gemini to return ONLY valid JSON
3. Parse `response.text` with `json.loads()`
4. Strip any accidental markdown code fences before parsing
5. Never return raw Gemini text to the frontend

## Knowledge Base Strategy

`knowledge_base.json` is loaded once at FastAPI startup into a Python dict:

```python
with open("data/knowledge_base.json", "r") as f:
    KNOWLEDGE_BASE = json.load(f)
```

This dict is passed as a parameter to agents that need it. No vector database, no embeddings, no semantic search. Facts come from the file, not from AI generation.
