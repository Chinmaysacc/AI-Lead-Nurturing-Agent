"""
Escalation Agent — Rule-Based Python (NO Gemini)
Determines whether to escalate to a human counselor.
Pure threshold + keyword logic — never probabilistic.
"""
from typing import Dict, Any, List


ENROLLMENT_KEYWORDS = [
    "enroll", "admission", "join", "register", "take admission",
    "i want to join", "how to enroll", "want to register"
]

NEGOTIATION_KEYWORDS = [
    "discount", "negotiate", "reduce fee", "lower price", "offer",
    "scholarship", "waiver", "cheaper", "cut the price", "any deal"
]

CALLBACK_KEYWORDS = [
    "call me", "speak to", "talk to", "counselor", "callback",
    "contact me", "human", "person", "someone call", "please call"
]

URGENCY_KEYWORDS = [
    "urgent", "asap", "today", "immediately", "right now",
    "need to decide", "very soon", "by tomorrow", "deadline"
]


def check_escalation(lead: Dict[str, Any], user_message: str) -> Dict[str, Any]:
    """
    Pure rule-based escalation check.
    Returns escalation decision with reasons.
    """
    message_lower = user_message.lower()
    reasons: List[str] = []

    # Score threshold
    total_score = lead.get("lead_score", 0)
    if total_score >= 80:
        reasons.append(f"Lead score {total_score}/100 (HOT lead)")

    # Enrollment intent
    if any(kw in message_lower for kw in ENROLLMENT_KEYWORDS):
        reasons.append("Explicit enrollment intent detected")

    # Fee negotiation
    if any(kw in message_lower for kw in NEGOTIATION_KEYWORDS):
        reasons.append("Fee negotiation requested")

    # Counselor callback
    if any(kw in message_lower for kw in CALLBACK_KEYWORDS):
        reasons.append("Counselor callback requested")

    # High urgency
    if any(kw in message_lower for kw in URGENCY_KEYWORDS):
        reasons.append("High urgency expressed")

    should_escalate = len(reasons) > 0

    # Priority logic
    if total_score >= 80 and should_escalate:
        priority = "HIGH"
        next_action = "Assign to senior counselor within 2 hours"
    elif should_escalate:
        priority = "MEDIUM"
        next_action = "Schedule counselor call within 4 hours"
    else:
        priority = "LOW"
        next_action = "Continue automated nurture"

    return {
        "should_escalate": should_escalate,
        "reasons": reasons,
        "next_action": next_action,
        "priority": priority,
        "findings": {
            "should_escalate": should_escalate,
            "reasons": reasons,
            "priority": priority,
            "next_action": next_action
        }
    }
