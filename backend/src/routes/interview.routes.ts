import { Router } from "express";
import * as controller from "../controllers/interview.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const interviewRouter = Router();

interviewRouter.use(requireAuth);
interviewRouter.get("/", controller.listInterviews);
interviewRouter.post("/", validate(controller.createInterviewSchema), controller.createInterview);
interviewRouter.get("/:id", controller.getInterview);
interviewRouter.post("/:id/start", controller.startInterview);
interviewRouter.post("/:id/answers", controller.submitAnswer);
interviewRouter.post("/:id/complete", controller.completeInterview);
