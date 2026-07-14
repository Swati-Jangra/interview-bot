import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as controller from "../controllers/analytics.controller.js";
export const analyticsRouter = Router();
analyticsRouter.use(requireAuth);
analyticsRouter.get("/", controller.getAnalytics);
analyticsRouter.get("/dashboard", controller.getDashboard);
