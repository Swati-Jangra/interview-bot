import crypto from "crypto";
import { Subscription } from "../models/Subscription.js";
import { User } from "../models/User.js";
import { AppError } from "../utils/errors.js";
// Initialize Razorpay instance (will be set from environment variables)
let razorpay = null;
// Initialize Razorpay when environment variables are available
function initRazorpay() {
    if (!razorpay && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        // Dynamic import to avoid types issue
        try {
            const Razorpay = require("razorpay");
            razorpay = new Razorpay({
                key_id: process.env.RAZORPAY_KEY_ID,
                key_secret: process.env.RAZORPAY_KEY_SECRET
            });
        }
        catch (error) {
            console.error("Failed to initialize Razorpay:", error);
        }
    }
    return razorpay;
}
const plans = {
    basic: {
        amount: 49900, // ₹499 in paise
        name: "Basic Plan",
        description: "25 AI interviews per month with advanced feedback",
        duration: 30 // days
    },
    premium: {
        amount: 99900, // ₹999 in paise
        name: "Premium Plan",
        description: "Unlimited AI interviews with premium features",
        duration: 30 // days
    }
};
export async function createPaymentOrder(userId, plan) {
    const planConfig = plans[plan];
    if (!planConfig) {
        throw new AppError(400, "Invalid plan selected", "INVALID_PLAN");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError(404, "User not found", "USER_NOT_FOUND");
    }
    const rzp = initRazorpay();
    if (!rzp) {
        throw new AppError(500, "Payment gateway not configured", "PAYMENT_NOT_CONFIGURED");
    }
    // Create Razorpay order
    const options = {
        amount: planConfig.amount,
        currency: "INR",
        receipt: `receipt_${userId}_${Date.now()}`,
        notes: {
            userId: userId.toString(),
            plan: plan
        }
    };
    try {
        const order = await rzp.orders.create(options);
        return {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.RAZORPAY_KEY_ID,
            plan: plan,
            name: planConfig.name,
            description: planConfig.description
        };
    }
    catch (error) {
        throw new AppError(500, "Failed to create payment order", "PAYMENT_ORDER_FAILED");
    }
}
export async function verifyPayment(userId, razorpayOrderId, razorpayPaymentId, razorpaySignature, plan) {
    const planConfig = plans[plan];
    // Verify signature
    const generatedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");
    if (generatedSignature !== razorpaySignature) {
        throw new AppError(400, "Invalid payment signature", "INVALID_SIGNATURE");
    }
    const rzp = initRazorpay();
    if (!rzp) {
        throw new AppError(500, "Payment gateway not configured", "PAYMENT_NOT_CONFIGURED");
    }
    // Verify payment with Razorpay
    try {
        const payment = await rzp.payments.fetch(razorpayPaymentId);
        if (payment.status !== "captured") {
            throw new AppError(400, "Payment not captured", "PAYMENT_NOT_CAPTURED");
        }
        if (payment.amount !== planConfig.amount) {
            throw new AppError(400, "Payment amount mismatch", "AMOUNT_MISMATCH");
        }
    }
    catch (error) {
        throw new AppError(500, "Payment verification failed", "PAYMENT_VERIFICATION_FAILED");
    }
    // Create subscription record
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + planConfig.duration * 24 * 60 * 60 * 1000);
    // Cancel existing active subscription
    await Subscription.updateMany({ userId, status: "active" }, { status: "cancelled" });
    const subscription = await Subscription.create({
        userId,
        plan,
        status: "active",
        startDate,
        endDate,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        amount: planConfig.amount,
        currency: "INR"
    });
    // Update user subscription
    await User.findByIdAndUpdate(userId, {
        subscription: {
            plan,
            status: "active",
            startDate,
            endDate
        }
    });
    return subscription;
}
export async function cancelSubscription(userId) {
    const subscription = await Subscription.findOne({
        userId,
        status: "active"
    });
    if (!subscription) {
        throw new AppError(404, "No active subscription found", "SUBSCRIPTION_NOT_FOUND");
    }
    // Cancel in Razorpay (if applicable)
    try {
        const rzp = initRazorpay();
        if (rzp && subscription.razorpaySubscriptionId) {
            await rzp.subscriptions.cancel(subscription.razorpaySubscriptionId);
        }
    }
    catch (error) {
        console.error("Razorpay subscription cancellation failed:", error);
    }
    // Update subscription status
    subscription.status = "cancelled";
    await subscription.save();
    // Update user subscription
    await User.findByIdAndUpdate(userId, {
        subscription: {
            plan: "free",
            status: "cancelled",
            endDate: subscription.endDate
        }
    });
    return subscription;
}
export async function getSubscriptionStatus(userId) {
    const subscription = await Subscription.findOne({
        userId,
        status: "active"
    }).sort({ createdAt: -1 });
    if (!subscription) {
        return {
            plan: "free",
            status: "none",
            endDate: null
        };
    }
    // Check if subscription has expired
    if (subscription.endDate < new Date()) {
        subscription.status = "expired";
        await subscription.save();
        await User.findByIdAndUpdate(userId, {
            subscription: {
                plan: "free",
                status: "expired",
                endDate: subscription.endDate
            }
        });
    }
    return {
        plan: subscription.plan,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate
    };
}
