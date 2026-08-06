import { z } from "zod";
import { asyncHandler } from "../utils/errors.js";
import * as authService from "../services/auth.service.js";
import { validatePassword, validateEmail } from "../middleware/validate.js";
export const signupSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(50).regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
        email: z.string().email().refine(validateEmail, 'Invalid email format'),
        password: z.string().min(8).max(128).refine((password) => validatePassword(password).valid, (password) => ({ message: validatePassword(password).errors.join(', ') }))
    })
});
export const loginSchema = z.object({
    body: z.object({
        email: z.string().email().refine(validateEmail, 'Invalid email format'),
        password: z.string().min(1).max(128)
    })
});
export const signup = asyncHandler(async (req, res) => res.status(201).json(await authService.signup(req.body)));
export const login = asyncHandler(async (req, res) => {
    try {
        const result = await authService.login(req.body.email, req.body.password);
        return res.json(result);
    }
    catch (error) {
        // Record failed login attempt for security
        await authService.recordFailedLogin(req.body.email);
        throw error;
    }
});
export const refresh = asyncHandler(async (req, res) => res.json(await authService.refresh(req.body.refreshToken)));
export const verifyEmail = asyncHandler(async (req, res) => res.json(await authService.verifyEmail(req.body.token)));
export const forgotPassword = asyncHandler(async (req, res) => {
    await authService.forgotPassword(req.body.email);
    res.status(204).send();
});
export const resetPassword = asyncHandler(async (req, res) => {
    const passwordValidation = validatePassword(req.body.password);
    if (!passwordValidation.valid) {
        throw new Error(passwordValidation.errors.join(', '));
    }
    await authService.resetPassword(req.body.token, req.body.password);
    res.status(204).send();
});
