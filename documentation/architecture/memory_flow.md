# Memory Flow

## SQLite Persistence Model

Every lead conversation is persisted in SQLite with full profile state.

### Schema (LeadDB table)

```sql
lead_id              TEXT PRIMARY KEY
name                 TEXT
email                TEXT INDEX
phone                TEXT INDEX
education            TEXT
current_role         TEXT
experience_years     INTEGER
career_goal          TEXT
budget               TEXT
timeline             TEXT
message_count        INTEGER DEFAULT 0
intent_signals       JSON    -- list of strings
lead_score           INTEGER DEFAULT 0
lead_category        TEXT    -- HOT/WARM/COLD
score_breakdown      JSON    -- dict of component scores
recommended_course   TEXT
recommended_course_id TEXT
confidence_score     INTEGER
career_path          JSON    -- list of strings
objections           JSON    -- list of objection types
conversation_history JSON    -- list of {role, content, timestamp, agent}
conversation_summary TEXT    -- Gemini-generated every 5 turns
next_action          TEXT
follow_up_date       TEXT
follow_up_in_days    INTEGER
follow_up_whatsapp   TEXT
follow_up_email_subject TEXT
follow_up_email_body TEXT
escalated            BOOLEAN DEFAULT FALSE
escalation_reasons   JSON
escalation_priority  TEXT    -- HIGH/MEDIUM/LOW
created_at           DATETIME
updated_at           DATETIME
```

## Session Continuity

### New Lead
1. `POST /api/chat` with no `lead_id`
2. New UUID generated
3. Empty profile created in memory
4. Agents start qualification from scratch

### Returning Lead
1. `POST /api/chat` with `lead_id`
2. Full profile loaded from SQLite
3. Conversation history available to orchestrator
4. Already-answered questions are not re-asked
5. Score recomputed with latest data

## Conversation Summary (Gemini)

Every 10 conversation turns (5 user + 5 AI), Gemini generates a 2–3 sentence summary:
- What the lead wants
- Their background
- Key concerns raised
- Decision stage

This summary is stored as `conversation_summary` and included in future Gemini prompts for context compression.

## Upsert Pattern

The orchestrator always upserts (insert-or-update) on every message:

```python
def save_lead_to_db(db: Session, lead: dict):
    existing = db.query(LeadDB).filter(
        LeadDB.lead_id == lead["lead_id"]
    ).first()
    
    if existing:
        # Update all fields
        for key, value in lead.items():
            setattr(existing, key, value)
    else:
        # Create new record
        db.add(LeadDB(**lead))
    
    db.commit()
```
