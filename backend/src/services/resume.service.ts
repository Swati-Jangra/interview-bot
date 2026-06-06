import pdfParse from "pdf-parse";
import { ResumeData } from "../models/ResumeData.js";

const skillDictionary = ["React", "JavaScript", "TypeScript", "Node.js", "MongoDB", "AWS", "Docker", "System Design", "SQL"];

export async function processResume(userId: string, file: Express.Multer.File) {
  const parsed = await pdfParse(file.buffer);
  const rawText = parsed.text;
  const skills = skillDictionary.filter((skill) => new RegExp(`\\b${skill.replace(".", "\\.")}\\b`, "i").test(rawText));
  const suggestedTopics = [...new Set([...skills, "Behavioral", "Project deep dive"])];

  return ResumeData.create({
    userId,
    fileName: file.originalname,
    rawText,
    skills,
    roles: extractLines(rawText, ["engineer", "developer", "manager"]),
    projects: extractLines(rawText, ["project", "built", "designed"]),
    suggestedTopics
  });
}

function extractLines(text: string, keywords: string[]) {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => keywords.some((keyword) => line.toLowerCase().includes(keyword)))
    .slice(0, 8);
}
