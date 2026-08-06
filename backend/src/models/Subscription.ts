import mongoose, { Schema } from "mongoose";

export interface ISubscription extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  plan: "free" | "basic" | "premium";
  status: "active" | "cancelled" | "expired";
  startDate: Date;
  endDate: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  razorpaySubscriptionId?: string;
  amount: number;
  currency: string;
}

const subscriptionSchema = new Schema<ISubscription>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: String, enum: ["free", "basic", "premium"], default: "free" },
    status: { type: String, enum: ["active", "cancelled", "expired"], default: "active" },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    razorpaySubscriptionId: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" }
  },
  { timestamps: true }
);

export const Subscription = mongoose.model<ISubscription>("Subscription", subscriptionSchema);