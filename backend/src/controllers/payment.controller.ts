import { z } from "zod";
import { asyncHandler } from "../utils/errors.js";
import * as paymentService from "../services/payment.service.js";

export const createOrderSchema = z.object({
  body: z.object({
    plan: z.enum(["basic", "premium"])
  })
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpayOrderId: z.string(),
    razorpayPaymentId: z.string(),
    razorpaySignature: z.string(),
    plan: z.enum(["basic", "premium"])
  })
});

export const createOrder = asyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  const { plan } = req.body;
  
  const order = await paymentService.createPaymentOrder(userId, plan);
  res.json(order);
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, plan } = req.body;
  
  const subscription = await paymentService.verifyPayment(
    userId,
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    plan
  );
  
  res.json({
    success: true,
    subscription
  });
});

export const cancelSubscription = asyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  
  const subscription = await paymentService.cancelSubscription(userId);
  res.json({
    success: true,
    subscription
  });
});

export const getSubscriptionStatus = asyncHandler(async (req, res) => {
  const userId = (req as any).user.id;
  
  const status = await paymentService.getSubscriptionStatus(userId);
  res.json(status);
});