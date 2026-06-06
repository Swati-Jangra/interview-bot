import bcrypt from "bcryptjs";
import mongoose, { Schema } from "mongoose";

export type UserRole = "candidate" | "admin";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isEmailVerified: boolean;
  avatarUrl?: string;
  refreshTokenHash?: string;
  verificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  profile: {
    headline?: string;
    experienceLevel?: string;
    targetRole?: string;
    preferredLanguage?: string;
  };
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
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
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = function comparePassword(password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>("User", userSchema);
