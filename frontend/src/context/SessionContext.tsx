import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { LeadProfile, AgentActivity, ConversationMessage } from '../types';
import { chatAPI } from '../utils/api';

interface SessionContextValue {
  leadId: string | null;
  leadProfile: LeadProfile | null;
  messages: ConversationMessage[];
  agentActivity: AgentActivity[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (message: string) => Promise<void>;
  resetSession: () => void;
  loadDemoScenario: (scenario: number) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [leadId, setLeadId] = useState<string | null>(null);
  const [leadProfile, setLeadProfile] = useState<LeadProfile | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [agentActivity, setAgentActivity] = useState<AgentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    setError(null);

    // Optimistically add user message
    const userMsg: ConversationMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await chatAPI.sendMessage({
        lead_id: leadId ?? undefined,
        message,
      });

      setLeadId(response.lead_id);
      setLeadProfile(response.lead_profile);

      // Add AI response
      const aiMsg: ConversationMessage = {
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        agent: response.agent_used,
      };
      setMessages(prev => [...prev, aiMsg]);

      // Append new agent activities
      setAgentActivity(prev => [...prev, ...response.agent_activity]);

    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(errorMsg);

      // Remove the optimistic user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  const resetSession = useCallback(() => {
    setLeadId(null);
    setLeadProfile(null);
    setMessages([]);
    setAgentActivity([]);
    setError(null);
  }, []);

  const loadDemoScenario = useCallback((scenario: number) => {
    const scenarios = [
      {
        lead_id: 'demo-priya',
        name: 'Priya Ramesh',
        email: 'priya.ramesh@example.com',
        phone: '9876543210',
        education: 'Final-year BCom',
        current_role: 'Student',
        experience_years: 0,
        career_goal: 'Get a performance marketing job at an agency or startup',
        budget: '₹44,999 open to EMI',
        timeline: '1 month',
        message_count: 6,
        intent_signals: ['fee', 'enroll'],
        lead_score: 80,
        lead_category: 'HOT' as const,
        score_breakdown: { goal_clarity: 23, urgency: 15, budget_readiness: 16, engagement: 11, career_motivation: 10, purchase_intent: 10 },
        recommended_course: 'Performance Marketing Pro',
        recommended_course_id: 'performance_pro',
        confidence_score: 94,
        career_path: ['Digital Marketing Intern (0–6 months)', 'Performance Marketing Executive (6–18 months)', 'Senior Performance Marketer (2–4 years)', 'Growth Marketing Manager (4–6 years)', 'Head of Growth (6+ years)'],
        objections: [],
        conversation_history: [],
        escalated: true,
        escalation_reasons: ['Lead score 80/100 (HOT lead)', 'Explicit enrollment intent detected'],
        escalation_priority: 'HIGH' as const,
      },
      {
        lead_id: 'demo-arjun',
        name: 'Arjun Mehta',
        email: 'arjun.mehta@example.com',
        phone: '9123456789',
        education: 'B.Tech',
        current_role: 'Software Developer',
        experience_years: 3,
        career_goal: 'Switch to marketing analytics career',
        budget: '₹64,999',
        timeline: '2-3 months',
        message_count: 5,
        intent_signals: ['demo'],
        lead_score: 63,
        lead_category: 'WARM' as const,
        score_breakdown: { goal_clarity: 25, urgency: 10, budget_readiness: 20, engagement: 11, career_motivation: 5, purchase_intent: 4 },
        recommended_course: 'Digital Marketing + Analytics Combo',
        recommended_course_id: 'analytics_combo',
        confidence_score: 87,
        career_path: ['Marketing Analyst (0–6 months)', 'Data-Driven Marketer (6–18 months)', 'Analytics Manager (2–4 years)', 'Director of Analytics (4–6 years)', 'CMO (6+ years)'],
        objections: [],
        conversation_history: [],
        escalated: false,
        escalation_reasons: [],
        escalation_priority: 'LOW' as const,
      },
      {
        lead_id: 'demo-sunita',
        name: 'Sunita Kapoor',
        email: 'sunita.kapoor@example.com',
        phone: '9988776655',
        education: 'BCom',
        current_role: 'Business Owner',
        experience_years: 5,
        career_goal: 'Run own digital ads without hiring an agency',
        budget: '₹29,999',
        timeline: 'flexible',
        message_count: 4,
        intent_signals: ['brochure'],
        lead_score: 67,
        lead_category: 'WARM' as const,
        score_breakdown: { goal_clarity: 25, urgency: 2, budget_readiness: 12, engagement: 11, career_motivation: 10, purchase_intent: 4 },
        recommended_course: 'Performance Marketing Bootcamp',
        recommended_course_id: 'business_bootcamp',
        confidence_score: 91,
        career_path: ['Running Own Ads (Week 4)', 'Profitable Campaigns (Month 2)', 'Full Digital Presence (Month 3)', 'Scale Revenue Online', 'Launch D2C Brand'],
        objections: [],
        conversation_history: [],
        escalated: false,
        escalation_reasons: [],
        escalation_priority: 'LOW' as const,
      }
    ];

    const demoLead = scenarios[scenario - 1] || scenarios[0];
    setLeadId(demoLead.lead_id);
    setLeadProfile(demoLead as LeadProfile);
    setMessages([]);
    setAgentActivity([]);
  }, []);

  return (
    <SessionContext.Provider value={{
      leadId,
      leadProfile,
      messages,
      agentActivity,
      isLoading,
      error,
      sendMessage,
      resetSession,
      loadDemoScenario,
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
