import { asyncHandler } from "../utils/errors.js";
import { synthesizeSpeech, transcribeAudio } from "../services/ai.service.js";

export const transcribe = asyncHandler(async (req, res) => {
  const audio = req.file?.buffer;
  const transcript = audio ? await transcribeAudio(audio) : "";
  res.json({ transcript });
});

export const textToSpeech = asyncHandler(async (req, res) => {
  const audio = await synthesizeSpeech(req.body.text);
  res.setHeader("Content-Type", "audio/mpeg");
  res.send(audio);
});
