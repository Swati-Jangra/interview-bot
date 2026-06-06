import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";
import { verifyAccessToken } from "../utils/tokens.js";

export type AuthRequest = Request & {
  user?: {
    id: string;
    role: "candidate" | "admin";
  };
};

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) throw new AppError(401, "Missing access token", "UNAUTHORIZED");

  const payload = verifyAccessToken(token);
  req.user = { id: payload.sub, role: payload.role };
  next();
}

export function requireAdmin(req: AuthRequest, _res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") throw new AppError(403, "Admin access required", "FORBIDDEN");
  next();
}
