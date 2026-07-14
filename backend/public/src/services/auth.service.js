import bcrypt from "bcryptjs";
import crypto from "crypto";
import { User } from "../models/User.js";
import { AppError } from "../utils/errors.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";
import { sendPasswordResetEmail, sendVerificationEmail } from "./email.service.js";
function publicUser(user) {
    return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        profile: user.profile
    };
}
export async function signup(input) {
    const existing = await User.findOne({ email: input.email });
    if (existing)
        throw new AppError(409, "Email is already registered", "EMAIL_EXISTS");
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const user = await User.create({
        name: input.name,
        email: input.email,
        passwordHash: await bcrypt.hash(input.password, 12),
        verificationToken
    });
    await sendVerificationEmail(user.email, verificationToken);
    return issueTokens(user);
}
export async function login(email, password) {
    const user = await User.findOne({ email }).select("+passwordHash +refreshTokenHash");
    if (!user || !(await user.comparePassword(password))) {
        throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }
    return issueTokens(user);
}
export async function issueTokens(user) {
    const payload = { sub: user._id.toString(), role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    user.refreshTokenHash = await bcrypt.hash(refreshToken, 12);
    await user.save();
    return { user: publicUser(user), accessToken, refreshToken };
}
export async function refresh(refreshToken) {
    const payload = verifyRefreshToken(refreshToken);
    const user = await User.findById(payload.sub).select("+refreshTokenHash");
    if (!user?.refreshTokenHash || !(await bcrypt.compare(refreshToken, user.refreshTokenHash))) {
        throw new AppError(401, "Invalid refresh token", "INVALID_REFRESH_TOKEN");
    }
    return issueTokens(user);
}
export async function verifyEmail(token) {
    const user = await User.findOne({ verificationToken: token }).select("+verificationToken");
    if (!user)
        throw new AppError(400, "Invalid verification token", "INVALID_TOKEN");
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();
    return publicUser(user);
}
export async function forgotPassword(email) {
    const user = await User.findOne({ email }).select("+passwordResetToken +passwordResetExpires");
    if (!user)
        return;
    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 1000 * 60 * 30);
    await user.save();
    await sendPasswordResetEmail(email, token);
}
export async function resetPassword(token, password) {
    const user = await User.findOne({
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() }
    }).select("+passwordResetToken +passwordResetExpires");
    if (!user)
        throw new AppError(400, "Invalid or expired reset token", "INVALID_TOKEN");
    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
}
