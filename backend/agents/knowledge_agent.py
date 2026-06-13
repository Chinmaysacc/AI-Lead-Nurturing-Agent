"""
Knowledge Agent — JSON Dict Lookup (NO Gemini)
Answers factual questions by matching keywords against knowledge_base.json FAQs.
Never generates or infers facts — only returns data that exists in the JSON.
"""
from typing import Dict, Any, Optional, List


def run_knowledge_agent(
    user_message: str,
    knowledge_base: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Match user message against FAQ keywords.
    Returns the matched answer or None if no match.
    """
    message_lower = user_message.lower()
    faqs: List[Dict] = knowledge_base.get("faqs", [])

    best_match = None
    best_match_count = 0

    for faq in faqs:
        keywords = faq.get("keywords", [])
        match_count = sum(1 for kw in keywords if kw.lower() in message_lower)
        if match_count > 0 and match_count > best_match_count:
            best_match_count = match_count
            best_match = faq

    if best_match:
        findings = {
            "faq_matched": best_match["q"],
            "answer": best_match["a"],
            "match_score": best_match_count,
            "source": "knowledge_base.json"
        }
        return {
            "matched": True,
            "answer": best_match["a"],
            "question_matched": best_match["q"],
            "findings": findings
        }

    # Check if it's a course-specific question
    courses = knowledge_base.get("courses", [])
    for course in courses:
        if course["name"].lower() in message_lower or course["id"].lower() in message_lower:
            answer = (
                f"{course['name']}: {course['duration_months']} months, "
                f"₹{course['fee']:,} (EMI: {course['emi']}). "
                f"Placement rate: {course.get('placement_rate_percent', 'N/A')}%. "
                f"Avg salary: ₹{course.get('avg_salary_lpa', 'N/A')} LPA."
            )
            findings = {
                "course_matched": course["name"],
                "answer": answer,
                "source": "knowledge_base.json"
            }
            return {
                "matched": True,
                "answer": answer,
                "question_matched": f"Course info: {course['name']}",
                "findings": findings
            }

    return {
        "matched": False,
        "answer": None,
        "question_matched": None,
        "findings": {
            "matched": False,
            "note": "No FAQ match found — will escalate to counselor if needed"
        }
    }


def is_question(text: str) -> bool:
    """Heuristic to detect if a message is a question."""
    question_indicators = [
        "?", "what", "how", "when", "where", "which", "why", "who",
        "do you", "can i", "is there", "are there", "tell me", "explain",
        "fee", "cost", "price", "duration", "batch", "certification",
        "placement", "salary", "emi", "refund", "schedule", "timing",
        "online", "offline", "guarantee", "experience"
    ]
    text_l = text.lower()
    return any(ind in text_l for ind in question_indicators)
