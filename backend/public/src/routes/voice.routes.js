import { Router } from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";
import * as controller from "../controllers/voice.controller.js";
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });
export const voiceRouter = Router();
voiceRouter.use(requireAuth);
voiceRouter.post("/transcribe", upload.single("audio"), controller.transcribe);
voiceRouter.post("/tts", controller.textToSpeech);
