import mongoose, { Schema } from "mongoose";
const questionSchema = new Schema({
    prompt: { type: String, required: true },
    topic: String,
    difficulty: String,
    expectedSignals: [String],
    followUps: [String]
}, { timestamps: true });
const responseSchema = new Schema({
    questionId: { type: Schema.Types.ObjectId },
    transcript: { type: String, required: true },
    durationSeconds: Number,
    fillerWords: [String],
    createdAt: { type: Date, default: Date.now }
}, { _id: true });
const feedbackSchema = new Schema({
    responseId: { type: Schema.Types.ObjectId },
    communicationScore: Number,
    technicalScore: Number,
    confidenceScore: Number,
    clarityScore: Number,
    completenessScore: Number,
    grammarScore: Number,
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    modelAnswer: String
}, { timestamps: true });
const interviewSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mode: { type: String, enum: ["hr", "technical", "behavioral", "custom", "company"], required: true },
    status: { type: String, enum: ["draft", "active", "completed", "abandoned"], default: "draft" },
    config: {
        durationMinutes: { type: Number, default: 30 },
        difficulty: { type: String, default: "medium" },
        domain: String,
        experienceLevel: String,
        language: { type: String, default: "English" },
        interviewType: String,
        voiceStyle: { type: String, default: "calm-coach" },
        company: String,
        topics: [String]
    },
    questions: [questionSchema],
    responses: [responseSchema],
    feedback: [feedbackSchema],
    summary: {
        averageScore: Number,
        strongTopics: [String],
        weakTopics: [String],
        overallFeedback: String,
        nextSteps: [String]
    },
    startedAt: Date,
    completedAt: Date
}, { timestamps: true });
export const Interview = mongoose.model("Interview", interviewSchema);
export const Question = mongoose.model("Question", questionSchema);
export const ResponseModel = mongoose.model("Response", responseSchema);
export const Feedback = mongoose.model("Feedback", feedbackSchema);
