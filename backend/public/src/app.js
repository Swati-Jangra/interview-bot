import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import { apiRouter } from "./routes/index.js";
import { corsMiddleware, apiRateLimiter, helmetMiddleware } from "./middleware/security.js";
import { errorHandler } from "./utils/errors.js";
export function createApp() {
    const app = express();
    app.use(helmetMiddleware);
    app.use(corsMiddleware);
    app.use(apiRateLimiter);
    app.use(express.json({ limit: "2mb" }));
    app.use(cookieParser());
    app.use(morgan("dev"));
    app.use("/api", apiRouter);
    app.use(errorHandler);
    return app;
}
