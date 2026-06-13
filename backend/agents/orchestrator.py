"""
Master Orchestrator — Coordinates all 7 agents in sequence.
Executes: Qualification → Lead Intelligence → Escalation → Knowledge →
          Objection → Recommendation → Follow-Up → Persist
"""
import json
import os
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

import google.generativeai as genai

from agents.qualification_agent import run_qualification_agent
from agents.lead_intelligence_agent import run_lead_intelligence_agent
from agents.knowledge_agent import run_knowledge_agent, is_question
from agents.escalation_agent import check_escalation
from agents.recommendation_agent import run_recommendation_agent
from agents.objection_agent import run_objection_agent
from agents.followup_agent import run_followup_agent


def _ts() -> str:
    """Return current timestamp string."""
    return datetime.now().strftime("%H:%M:%S")


def _activity(agent_name: str, agent_type: str, status: str, findings: Dict, icon: str = "✓") -> Dict:
    return {
        "timestamp": _ts(),
        "agent_name": agent_name,
        "agent_type": agent_type,
        "status": status,
        "findings": findings,
        "icon": icon
    }


def generate_conversation_summary(lead: Dict[str, Any], conversation_history: List[Dict]) -> Optional[str]:
    """
    Generate a summary every 5 turns using Gemini.
    This is the only non-structured Gemini use — purely for summarization.
    """
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return None
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash-lite",
            generation_config={"temperature": 0.3}
        )
        history_text = "\n".join([
            f"{m['role'].upper()}: {m['content']}"
            for m in conversation_history[-10:]
        ])
        prompt = f"""Summarize this admission counseling conversation in 2–3 sentences.
Focus on: what the lead wants, their background, key concerns, and where they are in the decision process.

Conversation:
{history_text}

Return ONLY the summary text — no JSON, no preamble."""
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return None


def get_contextual_reply(
    lead: Dict[str, Any],
    user_message: str,
    knowledge_result: Dict,
    objection_result: Dict,
    recommendation_result: Dict,
    next_question: Optional[str],
    escalation_result: Dict,
) -> Tuple[str, str]:
    """
    Compose the AI reply and determine which agent to credit.
    Priority: escalation > objection > knowledge > recommendation > next_question
    """
    lead_name = lead.get("name", "")
    greeting = f"{lead_name}, " if lead_name else ""

    # Escalation — highest priority
    if escalation_result.get("should_escalate"):
        reasons = escalation_result.get("reasons", [])
        reason_text = reasons[0] if reasons else "your interest level"
        reply = (
            f"Based on {reason_text}, I'm connecting you with a senior admission counselor "
            f"who can provide personalized guidance and discuss options specifically for you. "
            f"You'll receive a call within 2 hours. "
        )
        if objection_result.get("objection_detected") and objection_result.get("success"):
            obj_response = objection_result["result"].get("response", "")
            if obj_response:
                reply = obj_response + "\n\n" + reply
        return reply, "Escalation Agent"

    # Objection — second priority
    if objection_result.get("objection_detected") and objection_result.get("success"):
        obj_response = objection_result["result"].get("response", "")
        if obj_response:
            if next_question:
                obj_response += f"\n\nTo better help you, {next_question}"
            return obj_response, "Objection Handling Agent"

    # FAQ answer — third priority
    if knowledge_result.get("matched"):
        faq_answer = knowledge_result.get("answer", "")
        if next_question:
            faq_answer += f"\n\n{next_question}"
        return faq_answer, "Knowledge Agent"

    # Course recommendation — fourth priority
    if recommendation_result.get("success"):
        rec = recommendation_result["result"]
        course_name = rec.get("recommended_course_name", "our recommended course")
        confidence = rec.get("confidence_score", 90)
        reasoning = rec.get("reasoning", "")
        outcomes = rec.get("expected_outcomes", "")
        reply = (
            f"Based on your profile, I recommend the **{course_name}** — "
            f"matched with {confidence}% confidence.\n\n"
            f"{reasoning}\n\n"
            f"**Expected outcome:** {outcomes}"
        )
        if next_question:
            reply += f"\n\n{next_question}"
        return reply, "Recommendation Agent"

    # Fall through to next qualifying question
    if next_question:
        return next_question, "Qualification Agent"

    # Profile complete — wrap up
    return (
        f"Thank you for sharing all the details{', ' + lead_name if lead_name else ''}! "
        "Our AI has analyzed your profile and prepared personalized recommendations. "
        "Check the intelligence panel on the right for your lead score, recommended course, "
        "and career path.",
        "Orchestrator"
    )


async def run_orchestrator(
    lead: Dict[str, Any],
    user_message: str,
    knowledge_base: Dict[str, Any],
    db_session=None
) -> Dict[str, Any]:
    """
    Main orchestration pipeline. Runs all agents in sequence.
    Returns final reply, updated lead profile, and agent activity log.
    """
    activity_log: List[Dict] = []

    # ─────────────────────────────────────────────
    # STEP 1: Qualification Agent (rule-based)
    # ─────────────────────────────────────────────
    qual_result = run_qualification_agent(lead, user_message)
    lead = qual_result["updated_lead"]
    next_question = qual_result.get("next_question")

    activity_log.append(_activity(
        "Qualification Agent",
        "rule-based",
        "success",
        qual_result["findings"],
        "✓"
    ))

    # ─────────────────────────────────────────────
    # STEP 2: Lead Intelligence Agent (rule-based)
    # ─────────────────────────────────────────────
    intel_result = run_lead_intelligence_agent(lead)
    score_result = intel_result["score_result"]

    lead["lead_score"] = score_result["total_score"]
    lead["lead_category"] = score_result["category"]
    lead["score_breakdown"] = score_result["breakdown"]

    activity_log.append(_activity(
        "Lead Intelligence Agent",
        "rule-based",
        "success",
        intel_result["findings"],
        "✓"
    ))

    # ─────────────────────────────────────────────
    # STEP 3: Escalation Agent (rule-based)
    # ─────────────────────────────────────────────
    escalation_result = check_escalation(lead, user_message)

    if escalation_result["should_escalate"]:
        lead["escalated"] = True
        lead["escalation_reasons"] = escalation_result["reasons"]
        lead["escalation_priority"] = escalation_result["priority"]
        lead["next_action"] = escalation_result["next_action"]
        icon = "⚡"
        status = "escalated"
    else:
        icon = "✓"
        status = "success"

    activity_log.append(_activity(
        "Escalation Agent",
        "rule-based",
        status,
        escalation_result["findings"],
        icon
    ))

    # ─────────────────────────────────────────────
    # STEP 4: Knowledge Agent (JSON lookup)
    # ─────────────────────────────────────────────
    knowledge_result = {"matched": False, "findings": {"skipped": True}}

    if is_question(user_message):
        knowledge_result = run_knowledge_agent(user_message, knowledge_base)
        activity_log.append(_activity(
            "Knowledge Agent",
            "json-lookup",
            "success" if knowledge_result["matched"] else "no-match",
            knowledge_result["findings"],
            "✓" if knowledge_result["matched"] else "○"
        ))
    else:
        activity_log.append(_activity(
            "Knowledge Agent",
            "json-lookup",
            "skipped",
            {"reason": "Message is not a question"},
            "○"
        ))

    # ─────────────────────────────────────────────
    # STEP 5: Objection Agent (Gemini)
    # ─────────────────────────────────────────────
    objection_result = {"objection_detected": False, "findings": {"skipped": True}}

    try:
        objection_result = run_objection_agent(lead, user_message, knowledge_base)
        if objection_result.get("objection_detected"):
            objection_type = objection_result.get("objection_type", "unknown")
            if objection_type not in lead.get("objections", []):
                lead.setdefault("objections", []).append(objection_type)
            activity_log.append(_activity(
                "Objection Handling Agent",
                "gemini",
                "success" if objection_result.get("success") else "error",
                objection_result["findings"],
                "🛡" if objection_result.get("success") else "✗"
            ))
        else:
            activity_log.append(_activity(
                "Objection Handling Agent",
                "gemini",
                "skipped",
                {"reason": "No objection detected"},
                "○"
            ))
    except Exception as e:
        activity_log.append(_activity(
            "Objection Handling Agent", "gemini", "error",
            {"error": str(e)}, "✗"
        ))

    # ─────────────────────────────────────────────
    # STEP 6: Recommendation Agent (Gemini)
    # Only run when enough profile data is available
    # ─────────────────────────────────────────────
    recommendation_result = {"success": False, "findings": {"skipped": True}}
    fields_collected = sum(1 for f in ["name", "career_goal", "budget", "education"]
                           if lead.get(f))

    if fields_collected >= 2 and not knowledge_result.get("matched"):
        try:
            recommendation_result = run_recommendation_agent(lead, knowledge_base)
            if recommendation_result.get("success"):
                rec = recommendation_result["result"]
                lead["recommended_course"] = rec.get("recommended_course_name")
                lead["recommended_course_id"] = rec.get("recommended_course_id")
                lead["confidence_score"] = rec.get("confidence_score")
                lead["career_path"] = rec.get("career_path", [])

            activity_log.append(_activity(
                "Recommendation Agent",
                "gemini",
                "success" if recommendation_result.get("success") else "error",
                recommendation_result["findings"],
                "✓" if recommendation_result.get("success") else "✗"
            ))
        except Exception as e:
            activity_log.append(_activity(
                "Recommendation Agent", "gemini", "error",
                {"error": str(e)}, "✗"
            ))
    else:
        activity_log.append(_activity(
            "Recommendation Agent",
            "gemini",
            "skipped",
            {"reason": "Insufficient profile data or FAQ already answered"},
            "○"
        ))

    # ─────────────────────────────────────────────
    # STEP 7: Follow-Up Agent (Gemini)
    # Only when score is computed and course is recommended
    # ─────────────────────────────────────────────
    followup_result = {"success": False, "findings": {"skipped": True}}

    if lead.get("lead_score", 0) > 0 and lead.get("recommended_course"):
        try:
            followup_result = run_followup_agent(lead, knowledge_base)
            if followup_result.get("success"):
                fu = followup_result["result"]
                lead["follow_up_date"] = fu.get("follow_up_date")
                lead["follow_up_in_days"] = fu.get("follow_up_in_days")
                lead["follow_up_whatsapp"] = fu.get("whatsapp_message")
                lead["follow_up_email_subject"] = fu.get("email_subject")
                lead["follow_up_email_body"] = fu.get("email_body")

            activity_log.append(_activity(
                "Follow-Up Agent",
                "gemini",
                "success" if followup_result.get("success") else "error",
                followup_result["findings"],
                "✉" if followup_result.get("success") else "✗"
            ))
        except Exception as e:
            activity_log.append(_activity(
                "Follow-Up Agent", "gemini", "error",
                {"error": str(e)}, "✗"
            ))
    else:
        activity_log.append(_activity(
            "Follow-Up Agent",
            "gemini",
            "skipped",
            {"reason": "Awaiting score and recommendation"},
            "○"
        ))

    # ─────────────────────────────────────────────
    # STEP 8: Update conversation history
    # ─────────────────────────────────────────────
    history = lead.get("conversation_history", [])
    history.append({"role": "user", "content": user_message, "timestamp": _ts()})

    # Generate reply
    reply, agent_used = get_contextual_reply(
        lead, user_message,
        knowledge_result, objection_result,
        recommendation_result, next_question,
        escalation_result
    )

    history.append({"role": "assistant", "content": reply, "timestamp": _ts(), "agent": agent_used})
    lead["conversation_history"] = history

    # Summarize every 5 turns
    if len(history) % 10 == 0:
        summary = generate_conversation_summary(lead, history)
        if summary:
            lead["conversation_summary"] = summary

    return {
        "reply": reply,
        "agent_used": agent_used,
        "lead": lead,
        "activity_log": activity_log,
        "next_question": next_question,
        "escalation": escalation_result,
    }
