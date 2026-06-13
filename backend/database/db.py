from sqlalchemy import create_engine, Column, String, Integer, Boolean, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./admissioniq.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class LeadDB(Base):
    __tablename__ = "leads"

    lead_id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=True, index=True)
    phone = Column(String, nullable=True, index=True)
    education = Column(String, nullable=True)
    current_role = Column(String, nullable=True)
    experience_years = Column(Integer, nullable=True)
    career_goal = Column(String, nullable=True)
    budget = Column(String, nullable=True)
    timeline = Column(String, nullable=True)
    message_count = Column(Integer, default=0)
    intent_signals = Column(JSON, default=list)
    lead_score = Column(Integer, default=0)
    lead_category = Column(String, default="COLD")
    score_breakdown = Column(JSON, default=dict)
    recommended_course = Column(String, nullable=True)
    recommended_course_id = Column(String, nullable=True)
    confidence_score = Column(Integer, nullable=True)
    career_path = Column(JSON, default=list)
    objections = Column(JSON, default=list)
    conversation_history = Column(JSON, default=list)
    conversation_summary = Column(Text, nullable=True)
    next_action = Column(String, nullable=True)
    follow_up_date = Column(String, nullable=True)
    follow_up_in_days = Column(Integer, nullable=True)
    follow_up_whatsapp = Column(Text, nullable=True)
    follow_up_email_subject = Column(String, nullable=True)
    follow_up_email_body = Column(Text, nullable=True)
    escalated = Column(Boolean, default=False)
    escalation_reasons = Column(JSON, default=list)
    escalation_priority = Column(String, default="LOW")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    Base.metadata.create_all(bind=engine)
