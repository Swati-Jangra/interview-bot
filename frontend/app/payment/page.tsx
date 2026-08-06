"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CreditCard, Check, Crown, Zap, Shield, HeadphonesIcon, Star, Loader2, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type Plan = "free" | "basic" | "premium";

const plans = {
  free: {
    name: "Free",
    price: 0,
    duration: "forever",
    features: [
      "5 AI interviews per month",
      "Basic feedback",
      "Resume analysis (1/month)",
      "Standard support"
    ],
    icon: Star,
    color: "from-gray-500 to-gray-600"
  },
  basic: {
    name: "Basic",
    price: 499,
    duration: "month",
    features: [
      "25 AI interviews per month",
      "Advanced feedback with scores",
      "Unlimited resume analysis",
      "Priority support",
      "Interview history tracking",
      "Custom interview modes"
    ],
    icon: Zap,
    color: "from-blue-500 to-blue-600"
  },
  premium: {
    name: "Premium",
    price: 999,
    duration: "month",
    features: [
      "Unlimited AI interviews",
      "Premium AI feedback",
      "Unlimited resume analysis",
      "24/7 priority support",
      "Human agent access (5 sessions/month)",
      "Interview history tracking",
      "Custom interview modes",
      "Advanced analytics",
      "Mock interviews with real experts"
    ],
    icon: Crown,
    color: "from-purple-500 to-pink-500"
  }
};

export default function PaymentPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [selectedPlan, setSelectedPlan] = useState<Plan>("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [razerpayLoaded, setRazerpayLoaded] = useState(false);

  const currentPlan = user?.subscription?.plan || "free";
  const isSubscribed = user?.subscription?.status === "active";

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazerpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  async function handlePayment(plan: Plan) {
    if (plan === "free") {
      router.push("/dashboard");
      return;
    }

    if (!razerpayLoaded) {
      setError("Payment gateway is loading. Please wait...");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // In production, you would call your backend to create an order
      // const order = await api.createPaymentOrder({ plan, amount: plans[plan].price });
      
      // For demo purposes, we'll simulate the payment flow
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_demo",
        amount: plans[plan].price * 100, // Amount in paise
        currency: "INR",
        name: "InterviewAI",
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Subscription`,
        image: "/logo.png",
        handler: function (response: any) {
          // Verify payment on backend
          verifyPayment(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature, plan);
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: user?.profile?.phone
        },
        theme: {
          color: "#6366f1"
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (err) {
      setError("Unable to initiate payment. Please try again.");
      setLoading(false);
    }
  }

  async function verifyPayment(paymentId: string, orderId: string, signature: string, plan: Plan) {
    try {
      // In production, call your backend to verify the payment
      // await api.verifyPayment({ paymentId, orderId, signature, plan });
      
      // For demo, simulate successful payment
      setLoading(false);
      alert("Payment successful! Your subscription is now active.");
      router.push("/dashboard");
    } catch (err) {
      setError("Payment verification failed. Please contact support.");
      setLoading(false);
    }
  }

  async function handleCancelSubscription() {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    setLoading(true);
    try {
      // In production, call your backend to cancel subscription
      // await api.cancelSubscription();
      
      // For demo, simulate cancellation
      setLoading(false);
      alert("Subscription cancelled successfully.");
      router.push("/dashboard");
    } catch (err) {
      setError("Failed to cancel subscription. Please try again.");
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold gradient-text">Choose Your Plan</h1>
          <p className="mt-2 text-muted-foreground">Unlock premium features to accelerate your interview preparation</p>
        </div>

        {isSubscribed && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      Active {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Subscription
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your subscription is valid until {user?.subscription?.endDate ? new Date(user.subscription.endDate).toLocaleDateString() : "lifetime"}
                    </p>
                  </div>
                </div>
                {currentPlan !== "free" && (
                  <Button variant="outline" onClick={handleCancelSubscription} disabled={loading}>
                    Cancel Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle size={16} />
                <p className="text-sm">{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {(Object.keys(plans) as Plan[]).map((plan) => {
            const planData = plans[plan];
            const Icon = planData.icon;
            const isCurrentPlan = currentPlan === plan;
            const isPopular = plan === "premium";

            return (
              <motion.div
                key={plan}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: plan === "basic" ? 0.1 : plan === "premium" ? 0.2 : 0 }}
              >
                <Card className={`relative ${isPopular ? "border-primary shadow-lg scale-105" : ""} ${isCurrentPlan ? "ring-2 ring-green-500" : ""}`}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </span>
                    </div>
                  )}
                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4">
                      <span className="rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                        Current Plan
                      </span>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${planData.color} flex items-center justify-center`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <CardTitle className="text-2xl">₹{planData.price}</CardTitle>
                        <CardDescription>/{planData.duration}</CardDescription>
                      </div>
                    </div>
                    <CardTitle className="mt-4">{planData.name} Plan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {planData.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={isCurrentPlan ? "outline" : isPopular ? "primary" : "default"}
                      onClick={() => handlePayment(plan)}
                      disabled={loading || isCurrentPlan}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : isCurrentPlan ? (
                        "Current Plan"
                      ) : plan === "free" ? (
                        "Continue with Free"
                      ) : (
                        `Subscribe to ${planData.name}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} /> Payment Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium">Secure Payments</p>
                  <p className="text-sm text-muted-foreground">Powered by Razorpay</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="font-medium">Multiple Options</p>
                  <p className="text-sm text-muted-foreground">Cards, UPI, Net Banking</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HeadphonesIcon className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-medium">24/7 Support</p>
                  <p className="text-sm text-muted-foreground">Always here to help</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>By subscribing, you agree to our Terms of Service and Privacy Policy.</p>
          <p className="mt-1">Subscriptions auto-renew. You can cancel anytime from your account settings.</p>
        </div>
      </div>
    </AppShell>
  );
}
