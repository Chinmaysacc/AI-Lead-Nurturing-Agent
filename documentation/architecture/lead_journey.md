# Lead Journey

## Full Prospect Lifecycle

### Stage 1: First Contact
- Lead clicks ad, fills form, or chats on WhatsApp
- AdmissionIQ session opens
- Qualification Agent begins collecting fields

### Stage 2: Profiling
- As lead responds, Qualification Agent extracts:
  - Name, email, phone
  - Education level
  - Current role
  - Career goal
  - Budget range
  - Timeline to enroll
- Each message increments `message_count`
- Intent signals accumulate (fee, emi, enroll, demo)

### Stage 3: Scoring
- Lead Intelligence Agent runs after every message
- Score updates in real time (visible on dashboard)
- Score components: goal clarity (25) + urgency (20) + budget (20) + engagement (15) + motivation (10) + intent (10)

### Stage 4: Classification
- **HOT (≥80)**: Ready to enroll, high intent, immediate follow-up
- **WARM (50–79)**: Interested but needs nurturing, 3-day follow-up
- **COLD (<50)**: Early stage, 7-day follow-up

### Stage 5: Recommendation
- Once ≥2 profile fields collected, Recommendation Agent runs
- Gemini matches profile to best course from knowledge base
- Career path generated for that course

### Stage 6: Objection Handling
- If lead expresses concern (fee, time, experience, etc.)
- Objection Agent detects type via keyword matching
- Gemini generates empathetic, data-backed response

### Stage 7: Escalation (HOT leads)
- Score ≥80, OR enrollment/negotiation/callback intent detected
- Escalation Agent marks lead as `escalated = True`
- Priority assigned: HIGH or MEDIUM
- CRM notification sent (future integration point)
- Senior counselor assigned within 2 hours

### Stage 8: Follow-Up
- Follow-Up Agent generates personalized messages
- WhatsApp message + email (subject + body)
- Follow-up date scheduled based on category

### Stage 9: Memory
- Full conversation history stored in SQLite
- Returning leads resume context — no re-questioning
- Conversation summarized every 5 turns via Gemini

## State Transitions

```
COLD → WARM → HOT → ESCALATED
  ↑      ↑      ↑
Score  Score  Score ≥ 80
< 50  50–79     + intent
```
