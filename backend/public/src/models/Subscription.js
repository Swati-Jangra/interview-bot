import mongoose, { Schema } from "mongoose";
const subscriptionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    plan: { type: String, enum: ["free", "pro", "team"], default: "free" },
    status: { type: String, enum: ["active", "trialing", "past_due", "cancelled"], default: "active" },
    currentPeriodEnd: Date,
    providerCustomerId: String,
    providerSubscriptionId: String
}, { timestamps: true });
export const Subscription = mongoose.model("Subscription", subscriptionSchema);
