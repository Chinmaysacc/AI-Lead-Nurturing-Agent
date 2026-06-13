from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class LeadProfile(BaseModel):
    lead_id: str
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    education: Optional[str] = None
    current_role: Optional[str] = None
    experience_years: Optional[int] = None
    career_goal: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    message_count: int = 0
    intent_signals: List[str] = []
    lead_score: int = 0
    lead_category: str = "COLD"
    score_breakdown: Dict[str, int] = {}
    recommended_course: Optional[str] = None
    recommended_course_id: Optional[str] = None
    confidence_score: Optional[int] = None
    career_path: List[str] = []
    objections: List[str] = []
    conversation_history: List[Dict[str, Any]] = []
    conversation_summary: Optional[str] = None
    next_action: Optional[str] = None
    follow_up_date: Optional[str] = None
    follow_up_in_days: Optional[int] = None
    follow_up_whatsapp: Optional[str] = None
    follow_up_email_subject: Optional[str] = None
    follow_up_email_body: Optional[str] = None
    escalated: bool = False
    escalation_reasons: List[str] = []
    escalation_priority: str = "LOW"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ChatRequest(BaseModel):
    lead_id: Optional[str] = None
    message: str
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    lead_id: str
    reply: str
    agent_used: str
    lead_profile: LeadProfile
    agent_activity: List[Dict[str, Any]]
    next_question: Optional[str] = None


class AgentActivity(BaseModel):
    timestamp: str
    agent_name: str
    agent_type: str  # "rule-based" | "gemini" | "json-lookup"
    status: str      # "success" | "skipped" | "error"
    findings: Dict[str, Any] = {}
    icon: str = "✓"
