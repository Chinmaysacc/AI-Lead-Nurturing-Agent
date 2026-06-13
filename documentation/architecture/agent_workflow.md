# Agent Workflow

## Execution Order (per user message)

```
User Message
     │
     ▼ STEP 1
Qualification Agent (rule-based)
  - Extract: name, email, phone, education, role, goal, budget, timeline
  - Detect intent signals: enroll, fee, emi, demo, discount
  - Output: updated lead dict + next question

     │
     ▼ STEP 2
Lead Intelligence Agent (rule-based)
  - Compute deterministic 0–100 score
  - Assign category: HOT (≥80) / WARM (50–79) / COLD (<50)
  - Output: score + breakdown

     │
     ▼ STEP 3
Escalation Agent (rule-based)
  - Check: score ≥ 80, enrollment keywords, negotiation keywords,
           callback requests, urgency expressions
  - Output: should_escalate, reasons, priority, next_action

     │
     ▼ STEP 4 (if message is a question)
Knowledge Agent (JSON lookup)
  - Match keywords against FAQs in knowledge_base.json
  - Output: matched answer OR "no match"

     │
     ▼ STEP 5 (if objection keywords detected)
Objection Handling Agent (Gemini)
  - Detect objection type from keyword patterns
  - Send to Gemini with lead profile + course data
  - Parse JSON response → empathetic reply

     │
     ▼ STEP 6 (if enough profile data collected)
Recommendation Agent (Gemini)
  - Send lead profile + all courses to Gemini
  - Parse JSON → recommended course + confidence + career path

     │
     ▼ STEP 7 (if score computed + course recommended)
Follow-Up Agent (Gemini)
  - Python computes timing: HOT=1 day, WARM=3 days, COLD=7 days
  - Gemini generates WhatsApp + email messages
  - Parse JSON → follow-up content

     │
     ▼ STEP 8
Persist to SQLite
  - Upsert full lead profile
  - Update conversation history
  - Trigger summary every 10 messages

     │
     ▼
Return to Frontend
  - reply (composed from highest-priority agent output)
  - agent_activity log (for real-time timeline)
  - updated lead_profile (for score gauge + career path)
```

## Reply Priority Logic

1. **Escalation triggered** → escalation message + counselor assignment notice
2. **Objection detected** → empathetic objection response
3. **FAQ matched** → fact-based answer from knowledge base
4. **Course recommended** → recommendation with reasoning
5. **Fields missing** → next qualification question

## Agent Type Classification

| Agent | Type | Calls Gemini? |
|---|---|---|
| Qualification Agent | Rule-based Python | ❌ No |
| Lead Intelligence Agent | Rule-based Python | ❌ No |
| Knowledge Agent | JSON lookup | ❌ No |
| Escalation Agent | Rule-based Python | ❌ No |
| Recommendation Agent | Gemini | ✅ Yes |
| Objection Handling Agent | Gemini | ✅ Yes |
| Follow-Up Agent | Gemini | ✅ Yes |
