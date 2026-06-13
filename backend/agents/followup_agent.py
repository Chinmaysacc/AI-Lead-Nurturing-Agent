"""
Follow-Up Agent — Gemini gemini-2.5-flash-lite, temperature 0.3
Generates personalized WhatsApp and email follow-up messages.
Follow-up timing computed by Python (never by Gemini).
"""
import json
import os
from datetime import datetime, timedelta
import google.generativeai as genai
from typing import Dict, Any


def compute_followup_days(category: str) -> int:
    """Pure Python — timing is deterministic, never AI-generated."""
    if category == "HOT":
        return 1
    elif category == "WARM":
        return 3
    else:
        return 7


def run_followup_agent(
    lead: Dict[str, Any],
    knowledge_base: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Generate personalized follow-up messages via Gemini.
    Returns parsed JSON — never raw text.
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set")

    genai.configure(api_key=api_key)
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash-lite",
        generation_config={"temperature": 0.3}
    )

    category = lead.get("lead_category", "COLD")
    follow_up_days = compute_followup_days(category)
    follow_up_date = (datetime.now() + timedelta(days=follow_up_days)).strftime("%Y-%m-%d")

    lead_summary = {
        "name": lead.get("name", "there"),
        "career_goal": lead.get("career_goal"),
        "recommended_course": lead.get("recommended_course"),
        "lead_score": lead.get("lead_score", 0),
        "lead_category": category,
        "budget": lead.get("budget"),
        "timeline": lead.get("timeline"),
        "objections": lead.get("objections", []),
    }

    # Get recommended course details
    courses = knowledge_base.get("courses", [])
    recommended = next(
        (c for c in courses if c["id"] == lead.get("recommended_course_id")),
        None
    )
    course_context = {
        "name": recommended.get("name") if recommended else lead.get("recommended_course", "our course"),
        "fee": recommended.get("fee") if recommended else None,
        "emi": recommended.get("emi") if recommended else None,
        "placement_rate": f"{recommended.get('placement_rate_percent', 91)}%" if recommended else "91%",
        "avg_salary": recommended.get("avg_salary_lpa") if recommended else "3.5–5.5",
        "certifications": recommended.get("certifications", []) if recommended else []
    }

    batch_info = knowledge_base.get("batch_schedule", {})

    prompt = f"""You are a friendly, professional admission counselor at DMI — Digital Marketing Institute.

You need to write a follow-up for a prospective student who had a conversation with our AI counselor.

Lead Profile:
{json.dumps(lead_summary, indent=2)}

Recommended Course:
{json.dumps(course_context, indent=2)}

Batch Info: New batches start on {batch_info.get("new_batches_start", "1st and 15th of every month")}.

Guidelines:
- WhatsApp message: Short, warm, personal. 3–4 sentences. Use first name. Mention specific course and one key benefit.
- Email subject: Compelling, specific, not clickbait. Mention the course name.
- Email body: Professional yet warm. 3–4 short paragraphs. Include key course benefits, placement data, and a clear CTA.
- Keep both personalized to their career goal and objections if any.

Return ONLY a valid JSON object. No markdown. No explanation. No preamble.

Format:
{{
  "whatsapp_message": "Your short, warm WhatsApp message here",
  "email_subject": "Compelling email subject line",
  "email_body": "Full email body here (use \\n for line breaks)",
  "follow_up_in_days": {follow_up_days},
  "follow_up_date": "{follow_up_date}"
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

        # Ensure timing fields are set correctly by Python (not trusting Gemini for these)
        result["follow_up_in_days"] = follow_up_days
        result["follow_up_date"] = follow_up_date

        findings = {
            "follow_up_in_days": follow_up_days,
            "follow_up_date": follow_up_date,
            "category": category,
            "whatsapp_preview": result.get("whatsapp_message", "")[:80] + "...",
            "email_subject": result.get("email_subject")
        }

        return {
            "success": True,
            "result": result,
            "findings": findings
        }

    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": f"JSON parse error: {str(e)}",
            "findings": {"error": "Failed to parse Gemini response"}
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "findings": {"error": str(e)}
        }
