import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import * as controller from "../controllers/resume.controller.js";
import { uploadRateLimiter } from "../middleware/security.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'));
    }
  }
});

export const resumeRouter = Router();
resumeRouter.use(requireAuth);
resumeRouter.get("/", controller.getResume);
resumeRouter.post("/", uploadRateLimiter, upload.single("resume"), controller.uploadResume);
