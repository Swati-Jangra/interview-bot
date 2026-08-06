import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import { apiRouter } from "./routes/index.js";
import { corsMiddleware, apiRateLimiter, helmetMiddleware } from "./middleware/security.js";
import { preventParameterPollution, sanitizeInput, validateContentType, limitPayloadSize, addSecurityHeaders, requestTimeout } from "./middleware/security-advanced.js";
import { securityLogger, detectSuspiciousActivity, detectAnomalousIP, monitorRequestSize } from "./middleware/logging.js";
import { errorHandler } from "./utils/errors.js";
export function createApp() {
    const app = express();
    // Security middleware
    app.use(helmetMiddleware);
    app.use(addSecurityHeaders);
    app.use(corsMiddleware);
    // Security monitoring
    app.use(securityLogger);
    app.use(detectAnomalousIP);
    app.use(monitorRequestSize);
    // Rate limiting
    app.use(apiRateLimiter);
    // Request validation and sanitization
    app.use(validateContentType);
    app.use(limitPayloadSize);
    app.use(sanitizeInput);
    app.use(preventParameterPollution);
    app.use(detectSuspiciousActivity);
    // Body parsing with size limits
    app.use(express.json({ limit: "2mb" }));
    app.use(express.urlencoded({ extended: true, limit: "2mb" }));
    app.use(cookieParser());
    // Request timeout (30 seconds)
    app.use(requestTimeout(30000));
    // Logging
    if (process.env.NODE_ENV !== 'test') {
        app.use(morgan("combined"));
    }
    // API routes
    app.use("/api", apiRouter);
    // Error handling
    app.use(errorHandler);
    return app;
}
