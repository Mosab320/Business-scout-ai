import axios from "axios";
import type {
  BusinessPlan,
  BusinessProfileInput,
  DashboardData,
  Opportunity,
  ScoutResult,
  SubscriptionData,
  User,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("bsa_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("bsa_token");
      localStorage.removeItem("bsa_user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function friendlyError(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.detail || fallback;
  }
  return fallback;
}

// --- Auth ---
export async function registerUser(name: string, email: string, password: string) {
  const { data } = await api.post<{ access_token: string; user: User }>("/api/auth/register", {
    name,
    email,
    password,
  });
  return data;
}

export async function loginUser(email: string, password: string) {
  const { data } = await api.post<{ access_token: string; user: User }>("/api/auth/login", {
    email,
    password,
  });
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<User>("/api/auth/me");
  return data;
}

// --- Scout ---
export async function startScout(profile: BusinessProfileInput) {
  const { data } = await api.post<ScoutResult>("/api/scout", profile);
  return data;
}

export async function getScoutSession(sessionId: string) {
  const { data } = await api.get<ScoutResult>(`/api/scout/${sessionId}`);
  return data;
}

// --- Opportunities ---
export async function listOpportunities() {
  const { data } = await api.get<Opportunity[]>("/api/opportunities");
  return data;
}

export async function getOpportunity(id: string) {
  const { data } = await api.get<Opportunity>(`/api/opportunities/${id}`);
  return data;
}

export async function saveOpportunity(id: string) {
  const { data } = await api.post(`/api/opportunities/${id}/save`);
  return data;
}

export async function unsaveOpportunity(id: string) {
  const { data } = await api.delete(`/api/opportunities/${id}/save`);
  return data;
}

// --- Business Plans ---
export async function generateBusinessPlan(opportunityId: string) {
  const { data } = await api.post<BusinessPlan>("/api/business-plan", {
    opportunity_id: opportunityId,
  });
  return data;
}

export async function listBusinessPlans() {
  const { data } = await api.get<BusinessPlan[]>("/api/business-plans");
  return data;
}

export async function getBusinessPlan(id: string) {
  const { data } = await api.get<BusinessPlan>(`/api/business-plans/${id}`);
  return data;
}

export async function updateTaskStatus(planId: string, day: number, status: string) {
  const { data } = await api.patch(`/api/business-plans/${planId}/tasks`, { day, status });
  return data;
}

export function exportPlanPdfUrl(planId: string) {
  return `${API_URL}/api/business-plans/${planId}/export-pdf`;
}

// --- Dashboard / Subscription ---
export async function getDashboard() {
  const { data } = await api.get<DashboardData>("/api/dashboard");
  return data;
}

export async function getSubscription() {
  const { data } = await api.get<SubscriptionData>("/api/subscription");
  return data;
}

export async function checkout(plan: "pro_monthly" | "one_time_plan") {
  const { data } = await api.post("/api/subscription/checkout", { plan });
  return data;
}
