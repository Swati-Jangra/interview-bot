import { Analytics } from "../models/Analytics.js";
import { Interview } from "../models/Interview.js";
import { AppError } from "../utils/errors.js";
import { evaluateAnswer, generateQuestions } from "./ai.service.js";
export async function createInterview(userId, input) {
    const questions = await generateQuestions(input.mode, input.config ?? {});
    return Interview.create({
        userId,
        mode: input.mode,
        config: input.config,
        questions,
        status: "draft"
    });
}
export async function startInterview(userId, interviewId) {
    const interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview)
        throw new AppError(404, "Interview not found", "NOT_FOUND");
    interview.status = "active";
    interview.startedAt = new Date();
    await interview.save();
    return interview;
}
export async function submitAnswer(userId, interviewId, input) {
    const interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview)
        throw new AppError(404, "Interview not found", "NOT_FOUND");
    const question = interview.questions.id(input.questionId) ?? interview.questions[0];
    const response = interview.responses.create({
        questionId: question._id,
        transcript: input.transcript,
        durationSeconds: input.durationSeconds,
        fillerWords: findFillerWords(input.transcript)
    });
    interview.responses.push(response);
    const feedback = await evaluateAnswer(question.prompt, input.transcript);
    interview.feedback.push({ responseId: response._id, ...feedback });
    await interview.save();
    return { response, feedback };
}
export async function completeInterview(userId, interviewId) {
    const interview = await Interview.findOne({ _id: interviewId, userId });
    if (!interview)
        throw new AppError(404, "Interview not found", "NOT_FOUND");
    const feedback = interview.feedback;
    const averageScore = feedback.length
        ? Math.round(feedback.reduce((sum, item) => sum + averageFeedbackScore(item), 0) / feedback.length)
        : 0;
    interview.status = "completed";
    interview.completedAt = new Date();
    interview.summary = {
        averageScore,
        strongTopics: ["Communication", "Structure"],
        weakTopics: ["Specificity", "Quantified impact"],
        overallFeedback: "Good baseline. Improve with concise examples and measurable outcomes.",
        nextSteps: ["Practice STAR answers", "Prepare project metrics", "Record a shorter answer pass"]
    };
    await interview.save();
    await Analytics.findOneAndUpdate({ userId }, {
        $inc: {
            totalInterviews: 1,
            totalSpeakingSeconds: interview.responses.reduce((s, r) => s + (r.durationSeconds ?? 0), 0),
            fillerWordCount: interview.responses.flatMap((r) => r.fillerWords ?? []).length
        },
        $set: { averageScore },
        $push: { accuracyTrend: { date: new Date(), score: averageScore } }
    }, { upsert: true });
    return interview;
}
function averageFeedbackScore(item) {
    const scores = [
        item.communicationScore,
        item.technicalScore,
        item.confidenceScore,
        item.clarityScore,
        item.completenessScore,
        item.grammarScore
    ].filter(Boolean);
    return scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1);
}
function findFillerWords(text) {
    return text.toLowerCase().match(/\b(um|uh|like|basically|actually|you know)\b/g) ?? [];
}
