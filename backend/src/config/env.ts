import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),
  MONGODB_URI: z.string().min(1).default("mongodb://localhost:27017/ai-interview-coach"),
  JWT_ACCESS_SECRET: z.string().min(24).default("dev-access-secret-change-this-value"),
  JWT_REFRESH_SECRET: z.string().min(24).default("dev-refresh-secret-change-this-value"),
  OPENAI_API_KEY: z.string().optional(),
  SMTP_FROM: z.string().email().default("noreply@aiinterviewcoach.local")
});

export const env = envSchema.parse(process.env);
