"""
Objection Handling Agent — Gemini gemini-2.5-flash-lite, temperature 0.3
Detects objections and generates empathetic, persuasive responses.
Returns structured JSON only.
"""
import json
import os
import google.generativeai as genai
from typing import Dict, Any, Optional


OBJECTION_PATTERNS = {
    "fee_concern": [
        "expensive", "costly", "too much", "can't afford", "price is high",
        "fees are high", "cost is high", "budget", "money", "financial",
        "cheaper", "less cost", "reduce", "discount"
    ],
    "time_constraint": [
        "no time", "busy", "working", "job", "schedule", "can't manage",
        "tight schedule", "don't have time", "time constraint", "hectic"
    ],
    "no_prior_experience": [
        "no experience", "never done", "complete beginner", "zero knowledge",
        "don't know anything", "know nothing", "new to this", "don't know digital"
    ],
    "job_uncertainty": [
        "will i get a job", "job guarantee", "placement guarantee", "sure about job",
        "what if i don't get", "no job", "guarantee", "assured"
    ],
    "career_change_fear": [
        "scared", "nervous", "afraid", "risk", "risky", "leave my job",
        "career change", "too late", "old", "too old", "fear"
    ],
    "family_pressure": [
        "family", "parents", "wife", "husband", "spouse", "convince",
        "permission", "they don't support", "family doesn't agree"
    ],
    "comparing_institutes": [
        "other institute", "competitor", "upgrad", "simplilearn", "coursera",
        "udemy", "compared to", "vs", "better than", "why not", "why dmi"
    ]
}


def detect_objection(user_message: str) -> Optional[str]:
    """Detect the type of objection in the message."""
    message_lower = user_message.lower()
    for objection_type, keywords in OBJECTION_PATTERNS.items():
        if any(kw in message_lower for kw in keywords):
            return objection_type
    return None


def run_objection_agent(
    lead: Dict[str, Any],
    user_message: str,
    knowledge_base: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Detect objection and use Gemini to generate empathetic response.
    Returns parsed JSON — never raw text.
    """
    objection_type = detect_objection(user_message)

    if not objection_type:
        return {
            "success": False,
            "objection_detected": False,
            "findings": {"objection_detected": False}
        }

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash-lite",
        generation_config={"temperature": 0.3}
    )

    # Get relevant course data
    lead_summary = {
        "name": lead.get("name", "the lead"),
        "career_goal": lead.get("career_goal"),
        "budget": lead.get("budget"),
        "timeline": lead.get("timeline"),
        "education": lead.get("education"),
        "current_role": lead.get("current_role"),
        "recommended_course": lead.get("recommended_course"),
    }

    # Relevant institute data for objection context
    placements = knowledge_base.get("placements", {})
    courses = knowledge_base.get("courses", [])
    relevant_course = next(
        (c for c in courses if c["id"] == lead.get("recommended_course_id")),
        courses[1] if len(courses) > 1 else {}
    )

    objection_context = {
        "objection_type": objection_type,
        "user_message": user_message,
        "lead_profile": lead_summary,
        "institute_stats": {
            "overall_placement_rate": f"{placements.get('overall_rate_percent', 91)}%",
            "total_students_placed": placements.get("total_placed", 3800),
            "avg_salary": f"₹{placements.get('avg_salary_lpa', 4.2)} LPA",
            "highest_package": f"₹{placements.get('highest_package_lpa', 9)} LPA",
        },
        "relevant_course": {
            "name": relevant_course.get("name"),
            "fee": relevant_course.get("fee"),
            "emi": relevant_course.get("emi"),
            "placement_rate": f"{relevant_course.get('placement_rate_percent', 90)}%",
            "avg_salary": relevant_course.get("avg_salary_lpa"),
        }
    }

    prompt = f"""You are an expert, empathetic admission counselor at DMI — Digital Marketing Institute.

A prospective student has expressed a concern. Your job is to address this with empathy and data.

Objection Context:
{json.dumps(objection_context, indent=2)}

Guidelines:
- Be warm, empathetic, and human — not salesy
- Use specific data points (placement rate, salary, EMI) to build credibility
- Acknowledge their concern before addressing it
- Keep the response conversational, 2–3 short paragraphs
- End with a soft, inviting next step

Return ONLY a valid JSON object. No markdown. No explanation. No preamble.

Format:
{{
  "objection_type": "{objection_type}",
  "response": "Your empathetic, data-backed response here (plain text, no markdown inside this field)",
  "supporting_data": "Key data points used: EMI amount, placement rate, salary range etc."
}}"""

    try:
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
            raw_text = raw_text.strip()

        result = json.loads(raw_text)

        findings = {
            "objection_detected": True,
            "objection_type": objection_type,
            "supporting_data": result.get("supporting_data")
        }

        return {
            "success": True,
            "objection_detected": True,
            "objection_type": objection_type,
            "result": result,
            "findings": findings
        }

    except json.JSONDecodeError as e:
        return {
            "success": False,
            "objection_detected": True,
            "objection_type": objection_type,
            "error": f"JSON parse error: {str(e)}",
            "findings": {"objection_detected": True, "error": "Parse error"}
        }
    except Exception as e:
        return {
            "success": False,
            "objection_detected": True,
            "objection_type": objection_type,
            "error": str(e),
            "findings": {"objection_detected": True, "error": str(e)}
        }
