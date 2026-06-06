import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import * as controller from "../controllers/resume.controller.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype === "application/pdf")
});

export const resumeRouter = Router();
resumeRouter.use(requireAuth);
resumeRouter.get("/", controller.getResume);
resumeRouter.post("/", upload.single("resume"), controller.uploadResume);
