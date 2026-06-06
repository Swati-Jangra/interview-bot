import type { AuthRequest } from "../middleware/auth.js";
import { Analytics } from "../models/Analytics.js";
import { Interview } from "../models/Interview.js";
import { asyncHandler } from "../utils/errors.js";

export const getAnalytics = asyncHandler<AuthRequest>(async (req, res) => {
  const analytics = await Analytics.findOne({ userId: req.user!.id });
  res.json(analytics ?? { totalInterviews: 0, totalSpeakingSeconds: 0, averageScore: 0, topicPerformance: [] });
});

export const getDashboard = asyncHandler<AuthRequest>(async (req, res) => {
  const [analytics, recentInterviews] = await Promise.all([
    Analytics.findOne({ userId: req.user!.id }),
    Interview.find({ userId: req.user!.id }).sort({ createdAt: -1 }).limit(8)
  ]);
  res.json({
    analytics: analytics ?? { totalInterviews: 0, totalSpeakingSeconds: 0, averageScore: 0, topicPerformance: [] },
    recentInterviews,
    weakTopics: recentInterviews.flatMap((item: any) => item.summary?.weakTopics ?? []).slice(0, 5),
    strongTopics: recentInterviews.flatMap((item: any) => item.summary?.strongTopics ?? []).slice(0, 5)
  });
});
