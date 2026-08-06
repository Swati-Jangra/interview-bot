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
  loginAttempts?: number;
  lockUntil?: Date;
  subscription?: {
    plan: "free" | "basic" | "premium";
    status: "active" | "cancelled" | "expired" | "none";
    startDate?: Date;
    endDate?: Date;
  };
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
    name: { type: String, required: true, trim: true, maxlength: 50 },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      index: true,
      trim: true,
      maxlength: 255
    },
    passwordHash: { type: String, required: true, select: false, minlength: 60 },
    role: { type: String, enum: ["candidate", "admin"], default: "candidate" },
    isEmailVerified: { type: Boolean, default: false, index: true },
    avatarUrl: { type: String, maxlength: 500 },
    refreshTokenHash: { type: String, select: false },
    verificationToken: { type: String, select: false, index: true },
    passwordResetToken: { type: String, select: false, index: true },
    passwordResetExpires: { type: Date, select: false, index: true },
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false, index: true },
    subscription: {
      plan: { type: String, enum: ["free", "basic", "premium"], default: "free" },
      status: { type: String, enum: ["active", "cancelled", "expired", "none"], default: "none" },
      startDate: { type: Date },
      endDate: { type: Date }
    },
    profile: {
      headline: { type: String, maxlength: 200 },
      experienceLevel: { type: String, maxlength: 50 },
      targetRole: { type: String, maxlength: 100 },
      preferredLanguage: { type: String, default: "English", maxlength: 50 }
    }
  },
  { timestamps: true }
);

// Add pre-save middleware for additional security
userSchema.pre('save', function(next) {
  // Ensure email is lowercase
  if (this.isModified('email') && this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

userSchema.methods.comparePassword = function comparePassword(password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser>("User", userSchema);
