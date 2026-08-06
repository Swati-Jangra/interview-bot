"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Mail, CheckCircle, AlertCircle, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const setSession = useAuthStore((state) => state.setSession);
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [manualToken, setManualToken] = useState("");
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    // Auto-verify if token is in URL
    if (token) {
      verifyEmailToken(token);
    }
  }, [token]);

  useEffect(() => {
    // Countdown for resend button
    let interval: NodeJS.Timeout;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  async function verifyEmailToken(verificationToken: string) {
    setVerifying(true);
    setMessage("");
    try {
      const result = await api.verifyEmail({ token: verificationToken });
      
      // Update user verification status in store
      if (user && accessToken && refreshToken) {
        setSession({
          user: { ...user, isEmailVerified: true },
          accessToken,
          refreshToken
        });
      }
      
      setStatus("success");
      setMessage("Email verified successfully! Redirecting to dashboard...");
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      setStatus("error");
      setMessage("Invalid or expired verification link. Please request a new one.");
    } finally {
      setVerifying(false);
    }
  }

  async function handleManualVerify() {
    if (!manualToken.trim()) {
      setMessage("Please enter the verification code");
      setStatus("error");
      return;
    }
    verifyEmailToken(manualToken);
  }

  async function handleResendEmail() {
    setLoading(true);
    setMessage("");
    try {
      // In production, call your backend API
      // await api.resendVerificationEmail({ email });
      
      // Simulate resend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setStatus("success");
      setMessage("Verification email sent successfully! Please check your inbox.");
      setCountdown(60);
    } catch (err) {
      setStatus("error");
      setMessage("Failed to send verification email. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <RefreshCw className="mx-auto h-16 w-16 animate-spin text-primary" />
            <h2 className="mt-4 text-xl font-semibold">Verifying your email...</h2>
            <p className="mt-2 text-sm text-muted-foreground">Please wait while we confirm your email address</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success" && !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">Email Sent!</h2>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Button 
              onClick={() => router.push("/dashboard")} 
              className="mt-6 gap-2"
              variant="primary"
            >
              Go to Dashboard <ArrowRight size={18} />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-xl gradient-bg flex items-center justify-center">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Verify Your Email</CardTitle>
          <CardDescription>
            {email ? `We sent a verification link to ${email}` : "Please check your email for a verification link"}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {message && (
            <div className={`rounded-lg p-4 text-sm ${
              status === "success" 
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}>
              <div className="flex items-center gap-2">
                {status === "success" ? (
                  <CheckCircle size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                {message}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-muted/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Click the link in the verification email we sent you to activate your account.
              The link will expire in 24 hours.
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-center">Or enter verification code manually:</p>
            <Input
              placeholder="Enter verification code"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="text-center tracking-widest"
            />
            <Button 
              onClick={handleManualVerify} 
              disabled={verifying || !manualToken.trim()}
              className="w-full"
              variant="primary"
            >
              {verifying ? "Verifying..." : "Verify Code"}
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Didn't receive the email?
            </p>
            <Button 
              onClick={handleResendEmail} 
              disabled={loading || countdown > 0}
              variant="outline"
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                <>
                  <RefreshCw size={18} />
                  Resend Email
                </>
              )}
            </Button>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-primary hover:underline"
            >
              Back to Login
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-12 text-center">
            <RefreshCw className="mx-auto h-16 w-16 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
