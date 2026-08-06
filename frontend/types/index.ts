export type User = {
  id: string;
  name: string;
  email: string;
  role: "candidate" | "admin";
  isEmailVerified: boolean;
  profile?: Record<string, string>;
  subscription?: {
    plan: "free" | "basic" | "premium";
    status: "active" | "inactive" | "cancelled" | "expired";
    startDate?: string;
    endDate?: string;
    razorpaySubscriptionId?: string;
  };
  isPremiumUser?: boolean;
};

export type InterviewMode = "hr" | "technical" | "behavioral" | "custom" | "company";

export type Interview = {
  _id: string;
  mode: InterviewMode;
  status: "draft" | "active" | "completed" | "abandoned";
  config: Record<string, unknown>;
  questions: Question[];
  responses: InterviewResponse[];
  feedback: Feedback[];
  summary?: {
    averageScore: number;
    strongTopics: string[];
    weakTopics: string[];
    overallFeedback: string;
    nextSteps: string[];
  };
  createdAt: string;
};

export type Question = {
  _id: string;
  prompt: string;
  topic: string;
  difficulty: string;
  expectedSignals: string[];
  followUps: string[];
};

export type InterviewResponse = {
  _id: string;
  transcript: string;
  durationSeconds: number;
  fillerWords: string[];
};

export type Feedback = {
  communicationScore: number;
  technicalScore: number;
  confidenceScore: number;
  clarityScore: number;
  completenessScore: number;
  grammarScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  modelAnswer: string;
};
