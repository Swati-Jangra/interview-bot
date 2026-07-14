import mongoose, { Schema } from "mongoose";
const resumeDataSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    fileName: { type: String, required: true },
    rawText: { type: String, required: true },
    skills: [String],
    roles: [String],
    projects: [String],
    suggestedTopics: [String]
}, { timestamps: true });
export const ResumeData = mongoose.model("ResumeData", resumeDataSchema);
