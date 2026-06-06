import { z } from "zod";
import type { AuthRequest } from "../middleware/auth.js";
import { Interview } from "../models/Interview.js";
import { asyncHandler } from "../utils/errors.js";
import * as service from "../services/interview.service.js";

export const createInterviewSchema = z.object({
  body: z.object({
    mode: z.enum(["hr", "technical", "behavioral", "custom", "company"]),
    config: z.record(z.unknown()).default({})
  })
});

export const createInterview = asyncHandler<AuthRequest>(async (req, res) => {
  res.status(201).json(await service.createInterview(req.user!.id, req.body));
});

export const listInterviews = asyncHandler<AuthRequest>(async (req, res) => {
  res.json(await Interview.find({ userId: req.user!.id }).sort({ createdAt: -1 }).limit(50));
});

export const getInterview = asyncHandler<AuthRequest>(async (req, res) => {
  res.json(await Interview.findOne({ _id: String(req.params.id), userId: req.user!.id }));
});

export const startInterview = asyncHandler<AuthRequest>(async (req, res) => {
  res.json(await service.startInterview(req.user!.id, String(req.params.id)));
});

export const submitAnswer = asyncHandler<AuthRequest>(async (req, res) => {
  res.status(201).json(await service.submitAnswer(req.user!.id, String(req.params.id), req.body));
});

export const completeInterview = asyncHandler<AuthRequest>(async (req, res) => {
  res.json(await service.completeInterview(req.user!.id, String(req.params.id)));
});
