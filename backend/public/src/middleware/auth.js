import { AppError } from "../utils/errors.js";
import { verifyAccessToken } from "../utils/tokens.js";
export function requireAuth(req, _res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token)
        throw new AppError(401, "Missing access token", "UNAUTHORIZED");
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
}
export function requireAdmin(req, _res, next) {
    if (req.user?.role !== "admin")
        throw new AppError(403, "Admin access required", "FORBIDDEN");
    next();
}
