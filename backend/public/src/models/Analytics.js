import mongoose, { Schema } from "mongoose";
const analyticsSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    totalInterviews: { type: Number, default: 0 },
    totalSpeakingSeconds: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    accuracyTrend: [{ date: Date, score: Number }],
    topicPerformance: [{ topic: String, score: Number, attempts: Number }],
    fillerWordCount: { type: Number, default: 0 }
}, { timestamps: true });
export const Analytics = mongoose.model("Analytics", analyticsSchema);
