import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";
import { authRateLimiter } from "../middleware/security.js";
import { validate } from "../middleware/validate.js";

export const authRouter = Router();

authRouter.post("/signup", authRateLimiter, validate(controller.signupSchema), controller.signup);
authRouter.post("/login", authRateLimiter, validate(controller.loginSchema), controller.login);
authRouter.post("/refresh", controller.refresh);
authRouter.post("/verify-email", controller.verifyEmail);
authRouter.post("/forgot-password", authRateLimiter, controller.forgotPassword);
authRouter.post("/reset-password", authRateLimiter, controller.resetPassword);
