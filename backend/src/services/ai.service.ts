import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { env } from "../config/env.js";
import { evaluationPrompt, interviewSystemPrompt, questionGenerationPrompt } from "../prompts/interview.js";

const client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

const fallbackQuestions = [
  "Tell me about yourself and the role you are targeting.",
  "Describe a challenging project and the tradeoffs you made.",
  "How do you handle unclear requirements?",
  "Walk me through a recent technical decision you are proud of."
];

export async function generateQuestions(mode: any, config: Record<string, unknown>) {
  if (!client) {
    return fallbackQuestions.map((prompt) => ({
      prompt,
      topic: String(config.domain ?? mode),
      difficulty: String(config.difficulty ?? "medium"),
      expectedSignals: ["structure", "specificity", "impact"],
      followUps: ["Can you quantify the result?", "What would you improve next time?"]
    }));
  }

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: interviewSystemPrompt(mode) },
      { role: "user", content: questionGenerationPrompt(config) }
    ]
  });
  const parsed = JSON.parse(completion.choices[0]?.message.content ?? "{}");
  return parsed.questions ?? parsed;
}

export async function evaluateAnswer(question: string, answer: string) {
  if (!client) {
    return {
      communicationScore: 78,
      technicalScore: 74,
      confidenceScore: 72,
      clarityScore: 80,
      completenessScore: 76,
      grammarScore: 84,
      strengths: ["Clear structure", "Relevant example"],
      weaknesses: ["Add measurable outcomes", "Reduce filler words"],
      suggestions: ["Use STAR framing", "End with concrete impact"],
      modelAnswer: "A strong answer states the context, explains the action taken, and quantifies the result."
    };
  }

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: evaluationPrompt(question, answer) }]
  });
  return JSON.parse(completion.choices[0]?.message.content ?? "{}");
}

export async function synthesizeSpeech(text: string) {
  if (!client) return Buffer.from(text);
  const speech = await client.audio.speech.create({ model: "gpt-4o-mini-tts", voice: "alloy", input: text });
  return Buffer.from(await speech.arrayBuffer());
}

export async function transcribeAudio(audio: Buffer) {
  if (!client) return "Transcription unavailable in local fallback mode.";
  const file = await toFile(audio, "answer.webm", { type: "audio/webm" });
  const transcription = await client.audio.transcriptions.create({ file, model: "gpt-4o-mini-transcribe" });
  return transcription.text;
}
