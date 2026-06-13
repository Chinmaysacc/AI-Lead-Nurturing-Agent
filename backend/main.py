"""
AdmissionIQ FastAPI Backend
Main application entry point.
"""
import json
import uuid
import os
from datetime import datetime
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from dotenv import load_dotenv

load_dotenv()

from database.db import init_db, get_db, LeadDB
from models.lead import ChatRequest, LeadProfile
from agents.orchestrator import run_orchestrator

# ─── App Init ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AdmissionIQ — AI Admission Counselor API",
    description="Multi-agent AI platform for DMI lead qualification and nurturing",
    version="1.0.0"
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Knowledge Base — loaded once at startup into memory ──────────────────────
KNOWLEDGE_BASE: Dict[str, Any] = {}


@app.on_event("startup")
async def startup_event():
    global KNOWLEDGE_BASE
    init_db()
    kb_path = os.path.join(os.path.dirname(__file__), "data", "knowledge_base.json")
    with open(kb_path, "r", encoding="utf-8") as f:
        KNOWLEDGE_BASE = json.load(f)
    print(f"[OK] Knowledge base loaded: {len(KNOWLEDGE_BASE.get('courses', []))} courses, "
          f"{len(KNOWLEDGE_BASE.get('faqs', []))} FAQs")
    print("[OK] Database initialized")
    print("[OK] AdmissionIQ API ready")


# ─── Helper: DB ↔ Dict conversion ─────────────────────────────────────────────
def lead_db_to_dict(lead_db: LeadDB) -> Dict[str, Any]:
    return {
        "lead_id": lead_db.lead_id,
        "name": lead_db.name,
        "email": lead_db.email,
        "phone": lead_db.phone,
        "education": lead_db.education,
        "current_role": lead_db.current_role,
        "experience_years": lead_db.experience_years,
        "career_goal": lead_db.career_goal,
        "budget": lead_db.budget,
        "timeline": lead_db.timeline,
        "message_count": lead_db.message_count or 0,
        "intent_signals": lead_db.intent_signals or [],
        "lead_score": lead_db.lead_score or 0,
        "lead_category": lead_db.lead_category or "COLD",
        "score_breakdown": lead_db.score_breakdown or {},
        "recommended_course": lead_db.recommended_course,
        "recommended_course_id": lead_db.recommended_course_id,
        "confidence_score": lead_db.confidence_score,
        "career_path": lead_db.career_path or [],
        "objections": lead_db.objections or [],
        "conversation_history": lead_db.conversation_history or [],
        "conversation_summary": lead_db.conversation_summary,
        "next_action": lead_db.next_action,
        "follow_up_date": lead_db.follow_up_date,
        "follow_up_in_days": lead_db.follow_up_in_days,
        "follow_up_whatsapp": lead_db.follow_up_whatsapp,
        "follow_up_email_subject": lead_db.follow_up_email_subject,
        "follow_up_email_body": lead_db.follow_up_email_body,
        "escalated": lead_db.escalated or False,
        "escalation_reasons": lead_db.escalation_reasons or [],
        "escalation_priority": lead_db.escalation_priority or "LOW",
        "created_at": lead_db.created_at,
        "updated_at": lead_db.updated_at,
    }


def save_lead_to_db(db: Session, lead: Dict[str, Any]):
    """Upsert lead record in SQLite."""
    existing = db.query(LeadDB).filter(LeadDB.lead_id == lead["lead_id"]).first()

    if existing:
        for key, value in lead.items():
            if hasattr(existing, key) and key not in ("lead_id", "created_at"):
                setattr(existing, key, value)
        existing.updated_at = datetime.utcnow()
    else:
        lead_db = LeadDB(
            lead_id=lead["lead_id"],
            name=lead.get("name"),
            email=lead.get("email"),
            phone=lead.get("phone"),
            education=lead.get("education"),
            current_role=lead.get("current_role"),
            experience_years=lead.get("experience_years"),
            career_goal=lead.get("career_goal"),
            budget=lead.get("budget"),
            timeline=lead.get("timeline"),
            message_count=lead.get("message_count", 0),
            intent_signals=lead.get("intent_signals", []),
            lead_score=lead.get("lead_score", 0),
            lead_category=lead.get("lead_category", "COLD"),
            score_breakdown=lead.get("score_breakdown", {}),
            recommended_course=lead.get("recommended_course"),
            recommended_course_id=lead.get("recommended_course_id"),
            confidence_score=lead.get("confidence_score"),
            career_path=lead.get("career_path", []),
            objections=lead.get("objections", []),
            conversation_history=lead.get("conversation_history", []),
            conversation_summary=lead.get("conversation_summary"),
            next_action=lead.get("next_action"),
            follow_up_date=lead.get("follow_up_date"),
            follow_up_in_days=lead.get("follow_up_in_days"),
            follow_up_whatsapp=lead.get("follow_up_whatsapp"),
            follow_up_email_subject=lead.get("follow_up_email_subject"),
            follow_up_email_body=lead.get("follow_up_email_body"),
            escalated=lead.get("escalated", False),
            escalation_reasons=lead.get("escalation_reasons", []),
            escalation_priority=lead.get("escalation_priority", "LOW"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        db.add(lead_db)

    db.commit()


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "ok", "app": "AdmissionIQ API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "knowledge_base_loaded": bool(KNOWLEDGE_BASE),
        "courses": len(KNOWLEDGE_BASE.get("courses", [])),
        "faqs": len(KNOWLEDGE_BASE.get("faqs", []))
    }


@app.post("/api/chat")
async def chat(request: ChatRequest, db: Session = Depends(get_db)):
    """
    Main chat endpoint. Receives user message, runs all agents, returns reply.
    """
    # Resolve or create lead
    lead: Dict[str, Any] = {}

    if request.lead_id:
        db_lead = db.query(LeadDB).filter(LeadDB.lead_id == request.lead_id).first()
        if db_lead:
            lead = lead_db_to_dict(db_lead)

    if not lead:
        # Try to find by email/phone in message (for returning leads)
        lead = {
            "lead_id": request.lead_id or str(uuid.uuid4()),
            "message_count": 0,
            "intent_signals": [],
            "lead_score": 0,
            "lead_category": "COLD",
            "score_breakdown": {},
            "conversation_history": [],
            "career_path": [],
            "objections": [],
            "escalation_reasons": [],
            "escalated": False,
            "escalation_priority": "LOW",
        }

    # Run orchestrator pipeline
    result = await run_orchestrator(lead, request.message, KNOWLEDGE_BASE, db)

    # Save to DB
    save_lead_to_db(db, result["lead"])

    return {
        "lead_id": result["lead"]["lead_id"],
        "reply": result["reply"],
        "agent_used": result["agent_used"],
        "lead_profile": result["lead"],
        "agent_activity": result["activity_log"],
        "next_question": result.get("next_question"),
        "escalation": result.get("escalation", {}),
    }


@app.get("/api/leads")
async def get_leads(
    category: Optional[str] = None,
    escalated: Optional[bool] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """Get all leads for dashboard."""
    query = db.query(LeadDB)

    if category:
        query = query.filter(LeadDB.lead_category == category.upper())
    if escalated is not None:
        query = query.filter(LeadDB.escalated == escalated)

    total = query.count()
    leads = query.order_by(LeadDB.updated_at.desc()).offset(offset).limit(limit).all()

    return {
        "total": total,
        "leads": [lead_db_to_dict(l) for l in leads]
    }


@app.get("/api/leads/{lead_id}")
async def get_lead(lead_id: str, db: Session = Depends(get_db)):
    """Get a single lead by ID."""
    lead = db.query(LeadDB).filter(LeadDB.lead_id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead_db_to_dict(lead)


@app.get("/api/dashboard/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Aggregate stats for dashboard cards and charts."""
    total = db.query(LeadDB).count()
    hot = db.query(LeadDB).filter(LeadDB.lead_category == "HOT").count()
    warm = db.query(LeadDB).filter(LeadDB.lead_category == "WARM").count()
    cold = db.query(LeadDB).filter(LeadDB.lead_category == "COLD").count()
    escalated = db.query(LeadDB).filter(LeadDB.escalated == True).count()

    today = datetime.utcnow().strftime("%Y-%m-%d")
    follow_up_today = db.query(LeadDB).filter(LeadDB.follow_up_date == today).count()

    # Score distribution buckets
    all_leads = db.query(LeadDB).all()
    score_buckets = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    course_distribution: Dict[str, int] = {}

    for lead in all_leads:
        score = lead.lead_score or 0
        if score <= 20:
            score_buckets["0-20"] += 1
        elif score <= 40:
            score_buckets["21-40"] += 1
        elif score <= 60:
            score_buckets["41-60"] += 1
        elif score <= 80:
            score_buckets["61-80"] += 1
        else:
            score_buckets["81-100"] += 1

        if lead.recommended_course:
            course_distribution[lead.recommended_course] = \
                course_distribution.get(lead.recommended_course, 0) + 1

    return {
        "total_leads": total,
        "hot": hot,
        "warm": warm,
        "cold": cold,
        "escalated": escalated,
        "follow_up_today": follow_up_today,
        "score_distribution": score_buckets,
        "course_distribution": course_distribution,
    }


@app.get("/api/knowledge-base")
async def get_knowledge_base():
    """Return the knowledge base for frontend reference."""
    return KNOWLEDGE_BASE


@app.post("/api/leads/demo")
async def create_demo_lead(scenario: int = 1, db: Session = Depends(get_db)):
    """
    Pre-load a demo scenario lead for demonstration.
    Scenario 1: Priya Ramesh (HOT)
    Scenario 2: Arjun Mehta (WARM)
    Scenario 3: Sunita Kapoor (WARM)
    """
    scenarios = {
        1: {
            "lead_id": f"demo-{uuid.uuid4()}",
            "name": "Priya Ramesh",
            "email": "priya.ramesh@example.com",
            "phone": "9876543210",
            "education": "Final-year BCom",
            "current_role": "Student",
            "experience_years": 0,
            "career_goal": "Get a performance marketing job at an agency or startup",
            "budget": "₹44,999 open to EMI",
            "timeline": "1 month",
            "message_count": 6,
            "intent_signals": ["fee", "enroll"],
            "lead_score": 80,
            "lead_category": "HOT",
            "recommended_course": "Performance Marketing Pro",
            "recommended_course_id": "performance_pro",
            "confidence_score": 94,
            "escalated": True,
            "escalation_reasons": ["Lead score 80/100 (HOT lead)", "Explicit enrollment intent detected"],
            "escalation_priority": "HIGH",
        },
        2: {
            "lead_id": f"demo-{uuid.uuid4()}",
            "name": "Arjun Mehta",
            "email": "arjun.mehta@example.com",
            "phone": "9123456789",
            "education": "B.Tech",
            "current_role": "Software Developer",
            "experience_years": 3,
            "career_goal": "Switch to marketing analytics career",
            "budget": "₹64,999",
            "timeline": "2-3 months",
            "message_count": 5,
            "intent_signals": ["demo"],
            "lead_score": 63,
            "lead_category": "WARM",
            "recommended_course": "Digital Marketing + Analytics Combo",
            "recommended_course_id": "analytics_combo",
            "confidence_score": 87,
            "escalated": False,
            "escalation_reasons": [],
            "escalation_priority": "LOW",
        },
        3: {
            "lead_id": f"demo-{uuid.uuid4()}",
            "name": "Sunita Kapoor",
            "email": "sunita.kapoor@example.com",
            "phone": "9988776655",
            "education": "BCom",
            "current_role": "Business Owner",
            "experience_years": 5,
            "career_goal": "Run own digital ads without hiring an agency",
            "budget": "₹29,999",
            "timeline": "flexible",
            "message_count": 4,
            "intent_signals": ["brochure"],
            "lead_score": 67,
            "lead_category": "WARM",
            "recommended_course": "Performance Marketing Bootcamp",
            "recommended_course_id": "business_bootcamp",
            "confidence_score": 91,
            "escalated": False,
            "escalation_reasons": [],
            "escalation_priority": "LOW",
        }
    }

    demo_data = scenarios.get(scenario, scenarios[1])

    # Fill in defaults
    demo_data.setdefault("score_breakdown", {})
    demo_data.setdefault("career_path", [])
    demo_data.setdefault("objections", [])
    demo_data.setdefault("conversation_history", [])
    demo_data.setdefault("intent_signals", [])
    demo_data.setdefault("escalation_reasons", [])

    save_lead_to_db(db, demo_data)
    return demo_data
