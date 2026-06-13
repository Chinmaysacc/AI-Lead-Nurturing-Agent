export interface LeadProfile {
  lead_id: string;
  name?: string;
  email?: string;
  phone?: string;
  education?: string;
  current_role?: string;
  experience_years?: number;
  career_goal?: string;
  budget?: string;
  timeline?: string;
  message_count: number;
  intent_signals: string[];
  lead_score: number;
  lead_category: 'HOT' | 'WARM' | 'COLD';
  score_breakdown: ScoreBreakdown;
  recommended_course?: string;
  recommended_course_id?: string;
  confidence_score?: number;
  career_path: string[];
  objections: string[];
  conversation_history: ConversationMessage[];
  conversation_summary?: string;
  next_action?: string;
  follow_up_date?: string;
  follow_up_in_days?: number;
  follow_up_whatsapp?: string;
  follow_up_email_subject?: string;
  follow_up_email_body?: string;
  escalated: boolean;
  escalation_reasons: string[];
  escalation_priority: 'HIGH' | 'MEDIUM' | 'LOW';
  created_at?: string;
  updated_at?: string;
}

export interface ScoreBreakdown {
  goal_clarity?: number;
  urgency?: number;
  budget_readiness?: number;
  engagement?: number;
  career_motivation?: number;
  purchase_intent?: number;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  agent?: string;
}

export interface AgentActivity {
  timestamp: string;
  agent_name: string;
  agent_type: 'rule-based' | 'gemini' | 'json-lookup';
  status: 'success' | 'skipped' | 'error' | 'escalated' | 'no-match';
  findings: Record<string, unknown>;
  icon: string;
}

export interface ChatRequest {
  lead_id?: string;
  message: string;
}

export interface ChatResponse {
  lead_id: string;
  reply: string;
  agent_used: string;
  lead_profile: LeadProfile;
  agent_activity: AgentActivity[];
  next_question?: string;
  escalation?: {
    should_escalate: boolean;
    reasons: string[];
    priority: string;
    next_action: string;
  };
}

export interface DashboardStats {
  total_leads: number;
  hot: number;
  warm: number;
  cold: number;
  escalated: number;
  follow_up_today: number;
  score_distribution: Record<string, number>;
  course_distribution: Record<string, number>;
}

export interface DemoScenario {
  id: number;
  name: string;
  role: string;
  goal: string;
  budget: string;
  category: 'HOT' | 'WARM' | 'COLD';
  score: number;
  course: string;
  color: string;
}
