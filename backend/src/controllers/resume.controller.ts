import type { AuthRequest } from "../middleware/auth.js";
import { ResumeData } from "../models/ResumeData.js";
import { asyncHandler, AppError } from "../utils/errors.js";
import { processResume } from "../services/resume.service.js";

export const uploadResume = asyncHandler<AuthRequest>(async (req, res) => {
  if (!req.file) throw new AppError(400, "PDF resume is required", "FILE_REQUIRED");
  res.status(201).json(await processResume(req.user!.id, req.file));
});

export const getResume = asyncHandler<AuthRequest>(async (req, res) => {
  res.json(await ResumeData.findOne({ userId: req.user!.id }).sort({ createdAt: -1 }));
});
