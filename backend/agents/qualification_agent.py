"""
Qualification Agent — Rule-Based Python (NO Gemini)
Parses structured fields from conversation history.
"""
import re
from typing import Dict, Any, Optional


FIELD_QUESTIONS = {
    "name": "Could you please share your name?",
    "email": "What's your email address so I can send you course details?",
    "phone": "What's your WhatsApp number for quick updates?",
    "education": "What's your educational background? (e.g., 12th grade, BCom, BTech, etc.)",
    "current_role": "What's your current role or occupation? (Student / Working professional / Business owner / Other)",
    "career_goal": "What's your main career goal? What would you like to achieve through this course?",
    "budget": "What's your budget range for the course? (We have options from ₹18,999 to ₹64,999 with EMI)",
    "timeline": "When are you looking to start? (Immediately / Within a month / 1–3 months / 3–6 months)",
}

FIELD_ORDER = ["name", "email", "phone", "education", "current_role", "career_goal", "budget", "timeline"]


def extract_email(text: str) -> Optional[str]:
    pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(pattern, text)
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    pattern = r'\b(?:\+91[-\s]?)?[6-9]\d{9}\b'
    match = re.search(pattern, text)
    return match.group(0) if match else None


def extract_experience_years(text: str) -> Optional[int]:
    patterns = [
        r'(\d+)\s*(?:year|yr)s?\s*(?:of\s*)?(?:experience|exp)',
        r'(\d+)\s*(?:year|yr)s?\s*(?:in|at|working)',
        r'experience\s*(?:of\s*)?(\d+)',
    ]
    for p in patterns:
        m = re.search(p, text.lower())
        if m:
            return int(m.group(1))
    # Handle "fresher" / "no experience"
    if any(w in text.lower() for w in ["fresher", "no experience", "zero experience", "fresh graduate", "just graduated"]):
        return 0
    return None


def extract_timeline(text: str) -> Optional[str]:
    text_l = text.lower()
    if any(w in text_l for w in ["immediately", "right now", "today", "asap", "this week"]):
        return "immediately"
    if any(w in text_l for w in ["next month", "1 month", "one month", "within a month"]):
        return "1 month"
    if any(w in text_l for w in ["2 weeks", "two weeks", "fortnight"]):
        return "2 weeks"
    if any(w in text_l for w in ["1-3 months", "1 to 3", "couple of months", "2 months", "3 months"]):
        return "1-3 months"
    if any(w in text_l for w in ["3-6 months", "3 to 6", "6 months", "later"]):
        return "3-6 months"
    if any(w in text_l for w in ["flexible", "not sure", "anytime", "no hurry"]):
        return "flexible"
    return None


def extract_budget(text: str) -> Optional[str]:
    text_l = text.lower()
    # Check for EMI mentions
    if "emi" in text_l:
        return "open to EMI"
    # Check for specific amounts
    amounts = re.findall(r'(?:₹|rs\.?\s*|inr\s*)?(\d{2,3}(?:,\d{3})?(?:\.\d+)?)\s*(?:k|thousand|lpa|lakh)?', text_l)
    for amt in amounts:
        clean = amt.replace(",", "")
        val = float(clean)
        if val < 1000:
            val *= 1000  # assume "18k" = 18000
        if 15000 <= val <= 25000:
            return "₹18,999–₹22,999"
        if 25001 <= val <= 35000:
            return "₹29,999"
        if 35001 <= val <= 50000:
            return "₹44,999"
        if 50001 <= val <= 70000:
            return "₹64,999"
    if any(w in text_l for w in ["not decided", "not sure", "depends", "flexible"]):
        return "not decided"
    return None


def extract_name(text: str, existing_name: Optional[str]) -> Optional[str]:
    if existing_name:
        return existing_name
    # Simple heuristic: if message is short and looks like a name
    text = text.strip()
    words = text.split()
    if 1 <= len(words) <= 3 and all(w[0].isupper() or w.istitle() for w in words if w):
        if not any(c in text for c in ["?", "!", ".", "@", "₹"]):
            return text
    # "My name is X" / "I am X" / "I'm X"
    patterns = [
        r"(?:my name is|i am|i'm|call me|name's)\s+([A-Za-z]+(?: [A-Za-z]+)?)",
    ]
    for p in patterns:
        m = re.search(p, text, re.IGNORECASE)
        if m:
            return m.group(1).strip().title()
    return None


def extract_education(text: str) -> Optional[str]:
    edu_keywords = {
        "btech": "B.Tech", "be ": "B.E.", "bcom": "BCom", "bca": "BCA",
        "bsc": "BSc", "ba ": "BA", "mba": "MBA", "mca": "MCA",
        "mtech": "M.Tech", "12th": "12th grade", "10+2": "12th grade",
        "graduate": "Graduate", "post graduate": "Post Graduate",
        "diploma": "Diploma", "engineering": "Engineering graduate",
        "commerce": "Commerce graduate", "arts": "Arts graduate",
        "final year": "Final year student", "pursuing": "Currently pursuing degree"
    }
    text_l = text.lower()
    for key, val in edu_keywords.items():
        if key in text_l:
            return val
    return None


def extract_current_role(text: str) -> Optional[str]:
    text_l = text.lower()
    role_keywords = {
        "student": "Student", "fresher": "Fresher", "working": "Working professional",
        "developer": "Software Developer", "engineer": "Engineer",
        "business owner": "Business Owner", "entrepreneur": "Entrepreneur",
        "freelancer": "Freelancer", "manager": "Manager",
        "analyst": "Analyst", "teacher": "Teacher", "housewife": "Homemaker",
        "marketing": "Marketing professional", "sales": "Sales professional",
        "intern": "Intern", "job": "Job seeker"
    }
    for key, val in role_keywords.items():
        if key in text_l:
            return val
    return None


def extract_career_goal(text: str) -> Optional[str]:
    text_l = text.lower()
    goal_indicators = [
        "want to", "looking to", "goal is", "aim is", "hoping to",
        "plan to", "interested in", "career in", "job in", "work in",
        "switch to", "transition to", "become a", "get into"
    ]
    if any(ind in text_l for ind in goal_indicators):
        return text.strip()
    # Check for specific roles
    role_terms = ["performance marketing", "digital marketing", "analytics", "social media",
                  "seo", "content", "freelance", "agency", "startup", "own business"]
    for term in role_terms:
        if term in text_l:
            return text.strip()
    return None


def extract_intent_signals(text: str) -> list:
    signals = []
    text_l = text.lower()
    signal_map = {
        "enroll": "enroll", "admission": "admission", "join": "join",
        "register": "register", "fee": "fee", "emi": "emi",
        "demo": "demo", "brochure": "brochure", "syllabus": "brochure",
        "discount": "discount", "scholarship": "scholarship",
        "placement": "placement", "job": "job"
    }
    for keyword, signal in signal_map.items():
        if keyword in text_l and signal not in signals:
            signals.append(signal)
    return signals


def run_qualification_agent(lead: Dict[str, Any], user_message: str) -> Dict[str, Any]:
    """
    Parse user message and update lead profile fields.
    Returns updated lead dict and next question to ask.
    """
    updates = {}

    # Extract fields from this message
    extracted_name = extract_name(user_message, lead.get("name"))
    if extracted_name and not lead.get("name"):
        updates["name"] = extracted_name

    extracted_email = extract_email(user_message)
    if extracted_email:
        updates["email"] = extracted_email

    extracted_phone = extract_phone(user_message)
    if extracted_phone:
        updates["phone"] = extracted_phone

    extracted_edu = extract_education(user_message)
    if extracted_edu and not lead.get("education"):
        updates["education"] = extracted_edu

    extracted_role = extract_current_role(user_message)
    if extracted_role and not lead.get("current_role"):
        updates["current_role"] = extracted_role

    extracted_goal = extract_career_goal(user_message)
    if extracted_goal and not lead.get("career_goal"):
        updates["career_goal"] = extracted_goal

    extracted_budget = extract_budget(user_message)
    if extracted_budget and not lead.get("budget"):
        updates["budget"] = extracted_budget

    extracted_timeline = extract_timeline(user_message)
    if extracted_timeline and not lead.get("timeline"):
        updates["timeline"] = extracted_timeline

    extracted_exp = extract_experience_years(user_message)
    if extracted_exp is not None and lead.get("experience_years") is None:
        updates["experience_years"] = extracted_exp

    # Intent signals — accumulate
    new_signals = extract_intent_signals(user_message)
    existing_signals = lead.get("intent_signals", [])
    for sig in new_signals:
        if sig not in existing_signals:
            existing_signals.append(sig)
    updates["intent_signals"] = existing_signals

    # Increment message count
    updates["message_count"] = lead.get("message_count", 0) + 1

    # Merge updates into lead
    updated_lead = {**lead, **updates}

    # Determine next question
    next_question = None
    for field in FIELD_ORDER:
        if not updated_lead.get(field):
            next_question = FIELD_QUESTIONS[field]
            break

    # Build findings for agent timeline
    collected = {k: v for k, v in updates.items()
                 if k not in ("intent_signals", "message_count") and v is not None}

    findings = {
        "fields_collected": collected,
        "total_fields_filled": sum(1 for f in FIELD_ORDER if updated_lead.get(f)),
        "next_question": next_question,
        "profile_complete": next_question is None
    }

    return {
        "updated_lead": updated_lead,
        "next_question": next_question,
        "findings": findings
    }
