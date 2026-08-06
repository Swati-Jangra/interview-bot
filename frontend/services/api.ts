"use client";

import { useAuthStore } from "@/store/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const IS_DEMO = process.env.NEXT_PUBLIC_ENABLE_DEMO === "true";

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
  // Authentication APIs
  signup: async (body: { name: string; email: string; password: string }) => {
    return apiFetch("/auth/signup", { method: "POST", body: JSON.stringify(body) });
  },
  login: async (body: { email: string; password: string }) => {
    return apiFetch("/auth/login", { method: "POST", body: JSON.stringify(body) });
  },
  refresh: async (body: { refreshToken: string }) => {
    return apiFetch("/auth/refresh", { method: "POST", body: JSON.stringify(body) });
  },
  verifyEmail: async (body: { token: string }) => {
    return apiFetch("/auth/verify-email", { method: "POST", body: JSON.stringify(body) });
  },
  forgotPassword: async (body: { email: string }) => {
    return apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify(body) });
  },
  resetPassword: async (body: { token: string; password: string }) => {
    return apiFetch("/auth/reset-password", { method: "POST", body: JSON.stringify(body) });
  },

  // Interview APIs
  dashboard: async () => {
    return apiFetch("/analytics/dashboard");
  },
  createInterview: async (body: any) => {
    return apiFetch("/interviews", { method: "POST", body: JSON.stringify(body) });
  },
  getInterview: async (id: string) => {
    return apiFetch(`/interviews/${id}`);
  },
  startInterview: async (id: string) => {
    return apiFetch(`/interviews/${id}/start`, { method: "POST" });
  },
  submitAnswer: async (id: string, body: any) => {
    return apiFetch(`/interviews/${id}/answers`, { method: "POST", body: JSON.stringify(body) });
  },
  completeInterview: async (id: string) => {
    return apiFetch(`/interviews/${id}/complete`, { method: "POST" });
  },
  listInterviews: async () => {
    return apiFetch("/interviews");
  },

  // Resume APIs
  getResume: async () => {
    return apiFetch("/resume");
  },
  uploadResume: async (formData: FormData) => {
    const token = useAuthStore.getState().accessToken;
    const response = await fetch(`${API_URL}/resume`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.error?.message ?? "Resume upload failed");
    }

    return response.json();
  },

  // Voice APIs
  transcribe: async (body: { audio: string }) => {
    return apiFetch("/voice/transcribe", { method: "POST", body: JSON.stringify(body) });
  },
  textToSpeech: async (body: { text: string }) => {
    return apiFetch("/voice/tts", { method: "POST", body: JSON.stringify(body) });
  },

  // Payment APIs
  createPaymentOrder: async (body: { plan: "basic" | "premium" }) => {
    return apiFetch("/payment/create-order", { method: "POST", body: JSON.stringify(body) });
  },
  verifyPayment: async (body: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string; plan: "basic" | "premium" }) => {
    return apiFetch("/payment/verify", { method: "POST", body: JSON.stringify(body) });
  },
  cancelSubscription: async () => {
    return apiFetch("/payment/cancel", { method: "POST" });
  },
  getSubscriptionStatus: async () => {
    return apiFetch("/payment/status");
  }
};
