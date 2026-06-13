"""
Lead Intelligence Agent — Rule-Based Python (NO Gemini)
Computes a deterministic lead score from the lead profile.
Same input ALWAYS produces same output.
"""
from typing import Dict, Any


def compute_score(lead: Dict[str, Any]) -> Dict[str, Any]:
    lead = {k: (v if v is not None else "") for k, v in lead.items()}
    # ── Goal Clarity — max 25 ──────────────────────────────────────────────
    goal_clarity = 0
    if lead.get("career_goal"):
        goal_clarity += 15
        if lead["career_goal"].lower() not in ["not sure", "exploring", "don't know"]:
            goal_clarity += 10

    # ── Urgency — max 20 ──────────────────────────────────────────────────
    urgency = 0
    timeline = (lead.get("timeline") or "").lower()
    if "immediately" in timeline or "this week" in timeline:
        urgency = 20
    elif "2 weeks" in timeline or "2weeks" in timeline:
        urgency = 15
    elif "1 month" in timeline or "month" in timeline:
        urgency = 15
    elif "1-3 months" in timeline or "3 months" in timeline or "couple" in timeline:
        urgency = 10
    elif "3-6 months" in timeline:
        urgency = 6
    else:
        urgency = 2

    # ── Budget Readiness — max 20 ──────────────────────────────────────────
    budget = 0
    budget_str = (lead.get("budget") or "").lower()
    if "emi" in budget_str or "64" in budget_str:
        budget = 20
    elif "44" in budget_str or "40" in budget_str or "45" in budget_str:
        budget = 16
    elif "29" in budget_str or "30" in budget_str:
        budget = 12
    elif "18" in budget_str or "22" in budget_str:
        budget = 8
    elif "not decided" in budget_str or "not sure" in budget_str:
        budget = 4

    # ── Engagement — max 15 ────────────────────────────────────────────────
    engagement = 0
    message_count = lead.get("message_count", 0)
    if message_count >= 8:
        engagement = 15
    elif message_count >= 5:
        engagement = 11
    elif message_count >= 3:
        engagement = 7
    else:
        engagement = 3

    # ── Career Motivation — max 10 ─────────────────────────────────────────
    motivation = 0
    goal = (lead.get("career_goal") or "").lower()
    high_motivation_keywords = ["job", "switch", "agency", "startup", "business", "freelance", "career change"]
    if any(word in goal for word in high_motivation_keywords):
        motivation = 10
    else:
        motivation = 5

    # ── Purchase Intent — max 10 ───────────────────────────────────────────
    intent = 0
    intent_signals = lead.get("intent_signals", [])
    if any(s in intent_signals for s in ["enroll", "admission", "join", "register"]):
        intent = 10
    elif any(s in intent_signals for s in ["fee", "emi"]):
        intent = 7
    elif any(s in intent_signals for s in ["demo", "brochure"]):
        intent = 4
    else:
        intent = 1

    total = goal_clarity + urgency + budget + engagement + motivation + intent
    total = min(100, max(0, total))

    category = "HOT" if total >= 80 else "WARM" if total >= 50 else "COLD"

    # Conversion readiness text
    if total >= 80:
        conversion_readiness = "Ready to Enroll"
    elif total >= 65:
        conversion_readiness = "High Interest"
    elif total >= 50:
        conversion_readiness = "Nurturing Required"
    else:
        conversion_readiness = "Early Stage"

    return {
        "total_score": total,
        "category": category,
        "conversion_readiness": conversion_readiness,
        "breakdown": {
            "goal_clarity": goal_clarity,
            "urgency": urgency,
            "budget_readiness": budget,
            "engagement": engagement,
            "career_motivation": motivation,
            "purchase_intent": intent
        }
    }


def run_lead_intelligence_agent(lead: Dict[str, Any]) -> Dict[str, Any]:
    """Run deterministic scoring and return result with findings for the timeline."""
    score_result = compute_score(lead)

    findings = {
        "total_score": score_result["total_score"],
        "category": score_result["category"],
        "conversion_readiness": score_result["conversion_readiness"],
        "breakdown": score_result["breakdown"]
    }

    return {
        "score_result": score_result,
        "findings": findings
    }
