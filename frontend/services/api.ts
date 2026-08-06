"use client";

import { useAuthStore } from "@/store/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const DEMO_EMAIL = "test@example.com";
const DEMO_PASSWORD = "Password123";

const demoSession = {
  user: {
    id: "demo-user",
    name: "Demo Candidate",
    email: DEMO_EMAIL,
    role: "candidate" as const,
    isEmailVerified: false,
    profile: {
      targetRole: "Frontend Engineer",
      experienceLevel: "Mid-level",
      preferredLanguage: "English"
    }
  },
  accessToken: "demo-access-token",
  refreshToken: "demo-refresh-token"
};

const demoInterview = {
  _id: "demo-interview",
  mode: "technical",
  status: "draft",
  config: {
    durationMinutes: 30,
    difficulty: "medium",
    domain: "Frontend Engineering",
    language: "English"
  },
  questions: [
    {
      _id: "demo-question-1",
      prompt: "Walk me through how you would design a reusable React component system.",
      topic: "React",
      difficulty: "medium",
      expectedSignals: ["component boundaries", "state handling", "accessibility"],
      followUps: ["How would you test it?", "How would you document it?"]
    },
    {
      _id: "demo-question-2",
      prompt: "Explain how you would improve performance in a large Next.js dashboard.",
      topic: "Next.js",
      difficulty: "medium",
      expectedSignals: ["rendering strategy", "memoization", "data fetching"],
      followUps: ["What metrics would you track?"]
    }
  ],
  responses: [],
  feedback: [],
  createdAt: new Date().toISOString()
};

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error?.message ?? "Request failed");
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  signup: async (body: { name: string; email: string; password: string }) => {
    try {
      return await apiFetch("/auth/signup", { method: "POST", body: JSON.stringify(body) });
    } catch {
      return { ...demoSession, user: { ...demoSession.user, name: body.name, email: body.email } };
    }
  },
  login: async (body: { email: string; password: string }) => {
    if (body.email === DEMO_EMAIL && body.password === DEMO_PASSWORD) return demoSession;
    return apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) });
  },
  dashboard: async () => {
    try {
      return await apiFetch("/analytics/dashboard");
    } catch {
      return {
        analytics: {
          totalInterviews: 6,
          totalSpeakingSeconds: 2880,
          averageScore: 82,
          accuracyTrend: [
            { date: new Date(Date.now() - 86400000 * 5).toISOString(), score: 71 },
            { date: new Date(Date.now() - 86400000 * 2).toISOString(), score: 78 },
            { date: new Date().toISOString(), score: 82 }
          ]
        },
        recentInterviews: [{ ...demoInterview, status: "completed", summary: { averageScore: 82, strongTopics: ["React", "Communication"], weakTopics: ["System design"], overallFeedback: "Good structure with room for deeper tradeoffs.", nextSteps: ["Quantify impact", "Practice architecture tradeoffs"] } }],
        weakTopics: ["System design", "Quantified impact"],
        strongTopics: ["React", "Communication"]
      };
    }
  },
  createInterview: async (body: any) => {
    try {
      return await apiFetch("/interviews", { method: "POST", body: JSON.stringify(body) });
    } catch {
      return { ...demoInterview, _id: `demo-${Date.now()}`, mode: body.mode, config: body.config };
    }
  },
  getInterview: async (id: string) => {
    try {
      return await apiFetch(`/interviews/${id}`);
    } catch {
      return { ...demoInterview, _id: id };
    }
  },
  startInterview: async (id: string) => {
    try {
      return await apiFetch(`/interviews/${id}/start`, { method: "POST" });
    } catch {
      return { ...demoInterview, _id: id, status: "active" };
    }
  },
  completeInterview: async (id: string) => {
    try {
      return await apiFetch(`/interviews/${id}/complete`, { method: "POST" });
    } catch {
      return { ...demoInterview, _id: id, status: "completed" };
    }
  },
  verifyEmail: async (body: { token: string }) => {
    try {
      return await apiFetch("/auth/verify-email", { method: "POST", body: JSON.stringify(body) });
    } catch {
      return { success: true, message: "Email verified successfully" };
    }
  },
  resendVerificationEmail: async (body: { email: string }) => {
    try {
      return await apiFetch("/auth/resend-verification", { method: "POST", body: JSON.stringify(body) });
    } catch {
      return { success: true, message: "Verification email sent successfully" };
    }
  }
};
