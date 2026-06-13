"""
Recommendation Agent — Gemini gemini-2.5-flash-lite, temperature 0.3
Matches lead profile to the best course using AI reasoning.
Returns structured JSON only.
"""
import json
import os
import google.generativeai as genai
from typing import Dict, Any


def run_recommendation_agent(
    lead: Dict[str, Any],
    knowledge_base: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Use Gemini to recommend the best course based on lead profile.
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

    # Prepare a clean lead summary for the prompt
    lead_summary = {
        "name": lead.get("name"),
        "education": lead.get("education"),
        "current_role": lead.get("current_role"),
        "experience_years": lead.get("experience_years"),
        "career_goal": lead.get("career_goal"),
        "budget": lead.get("budget"),
        "timeline": lead.get("timeline"),
        "lead_score": lead.get("lead_score", 0),
        "lead_category": lead.get("lead_category", "COLD"),
    }

    courses_summary = [
        {
            "id": c["id"],
            "name": c["name"],
            "target_audience": c["target_audience"],
            "fee": c["fee"],
            "emi": c["emi"],
            "duration_months": c["duration_months"],
            "placement_rate_percent": c.get("placement_rate_percent"),
            "avg_salary_lpa": c.get("avg_salary_lpa"),
            "certifications": c.get("certifications", []),
        }
        for c in knowledge_base.get("courses", [])
    ]

    prompt = f"""You are an expert admission counselor AI at DMI — Digital Marketing Institute.

Lead Profile:
{json.dumps(lead_summary, indent=2)}

Available Courses:
{json.dumps(courses_summary, indent=2)}

Based on this lead's profile, career goal, budget, and background, recommend the SINGLE BEST course for them.

Return ONLY a valid JSON object. No markdown. No explanation outside the JSON. No preamble.

Format:
{{
  "recommended_course_id": "course_id_here",
  "recommended_course_name": "Full Course Name Here",
  "confidence_score": 94,
  "reasoning": "Concise 2-3 sentence explanation of why this course fits the lead.",
  "expected_outcomes": "Specific career outcome and salary range within a timeframe.",
  "career_path": [
    "Step 1 (timeframe)",
    "Step 2 (timeframe)",
    "Step 3 (timeframe)",
    "Step 4 (timeframe)",
    "Step 5 (timeframe)"
  ]
}}"""

    try:
        response = model.generate_content(prompt)
        raw_text = response.text.strip()

        # Strip markdown code blocks if Gemini wraps the JSON
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
            raw_text = raw_text.strip()

        result = json.loads(raw_text)

        findings = {
            "recommended_course": result.get("recommended_course_name"),
            "recommended_course_id": result.get("recommended_course_id"),
            "confidence_score": result.get("confidence_score"),
            "reasoning": result.get("reasoning"),
            "expected_outcomes": result.get("expected_outcomes"),
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
