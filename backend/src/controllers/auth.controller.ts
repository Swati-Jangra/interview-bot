import { z } from "zod";
import { asyncHandler } from "../utils/errors.js";
import * as authService from "../services/auth.service.js";

export const signupSchema = z.object({ body: z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(8) }) });
export const loginSchema = z.object({ body: z.object({ email: z.string().email(), password: z.string().min(1) }) });

export const signup = asyncHandler(async (req, res) => res.status(201).json(await authService.signup(req.body)));
export const login = asyncHandler(async (req, res) => res.json(await authService.login(req.body.email, req.body.password)));
export const refresh = asyncHandler(async (req, res) => res.json(await authService.refresh(req.body.refreshToken)));
export const verifyEmail = asyncHandler(async (req, res) => res.json(await authService.verifyEmail(req.body.token)));
export const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  res.status(204).send();
});
export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.password);
  res.status(204).send();
});
