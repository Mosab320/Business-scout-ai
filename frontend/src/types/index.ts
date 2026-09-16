export interface User {
  id: string;
  name: string;
  email: string;
  plan: "free" | "pro";
  role: "user" | "admin";
  created_at: string;
}

export interface BusinessProfileInput {
  budget: number;
  currency: string;
  country: string;
  city: string;
  business_type?: string;
  skills: string[];
  interests: string[];
  experience: "beginner" | "intermediate" | "experienced";
  risk_level: "low" | "medium" | "high";
  sales_channel:
    | "online_store"
    | "marketplace"
    | "social_media"
    | "physical_store"
    | "b2b"
    | "services";
  goal?: string;
}

export interface ScoreBreakdown {
  market_demand: number;
  competition: number;
  budget_fit: number;
  skill_fit: number;
  scalability: number;
  execution_difficulty: number;
}

export interface Opportunity {
  id: string;
  session_id: string;
  title: string;
  description: string;
  score: number;
  score_breakdown: ScoreBreakdown;
  demand: string;
  competition: string;
  startup_cost: number;
  estimated_margin: string;
  difficulty: string;
  reasoning: string;
  risks: string[];
  market_gaps: string[];
  marketing: Record<string, any>;
  finance: Record<string, any>;
  saved: boolean;
}

export interface ScoutSession {
  id: string;
  status: string;
  created_at: string;
  completed_at?: string | null;
  profile: BusinessProfileInput;
}

export interface ScoutResult {
  session: ScoutSession;
  opportunities: Opportunity[];
  best_opportunity_id: string | null;
  advisor_summary: string | null;
}

export interface DayTask {
  day: number;
  week: number;
  task: string;
  description: string;
  status: string;
}

export interface BusinessPlan {
  id: string;
  opportunity_id: string;
  business_name: string;
  executive_summary: string;
  business_concept: string;
  target_customer: string;
  product_strategy: string;
  pricing_strategy: string;
  competitor_strategy: string;
  marketing_strategy: string;
  sales_channels: string[];
  startup_cost_estimate: Record<string, any>;
  operations: string;
  risks: string[];
  launch_plan: DayTask[];
  created_at: string;
}

export interface DashboardData {
  total_scouting_sessions: number;
  saved_opportunities_count: number;
  business_plans_count: number;
  current_plan: string;
  usage: { used: number; limit: number };
  latest_recommendations: Opportunity[];
}

export interface SubscriptionData {
  plan: string;
  status: string;
  usage: { used: number; limit: number };
  pricing: Record<string, any>;
}
