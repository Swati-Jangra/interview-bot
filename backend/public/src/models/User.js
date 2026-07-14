import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["candidate", "admin"], default: "candidate" },
    isEmailVerified: { type: Boolean, default: false },
    avatarUrl: String,
    refreshTokenHash: { type: String, select: false },
    verificationToken: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    profile: {
        headline: String,
        experienceLevel: String,
        targetRole: String,
        preferredLanguage: { type: String, default: "English" }
    }
}, { timestamps: true });
userSchema.methods.comparePassword = function comparePassword(password) {
    return bcrypt.compare(password, this.passwordHash);
};
export const User = mongoose.model("User", userSchema);
