"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";
import { Brain } from "lucide-react";

type AuthTab = "signin" | "signup" | "google" | "otp" | "forgot";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<AuthTab>(mode === "login" ? "signin" : "signup");
  const [otpSent, setOtpSent] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  function validatePassword(password: string): boolean {
    return password.length >= 6;
  }

  async function submitSignIn(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      const body = Object.fromEntries(formData.entries()) as any;
      
      if (!validateEmail(body.email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
      
      if (!validatePassword(body.password)) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      
      const session: any = await api.login(body);
      setSession(session);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue");
    } finally {
      setLoading(false);
    }
  }

  async function submitSignUp(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      const body = Object.fromEntries(formData.entries()) as any;
      
      if (!body.name || body.name.trim().length < 2) {
        setError("Name must be at least 2 characters");
        setLoading(false);
        return;
      }
      
      if (!validateEmail(body.email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
      
      if (!validatePassword(body.password)) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
      
      if (body.password !== body.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }
      
      const session: any = await api.signup(body);
      setSession(session);
      
      // Show verification message and redirect to verification page
      router.push("/verify-email?email=" + encodeURIComponent(body.email));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue");
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      const body = Object.fromEntries(formData.entries()) as any;
      
      if (!validateEmail(body.email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
      
      setError("OTP authentication is not yet implemented. Please use email/password sign in.");
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      const body = Object.fromEntries(formData.entries()) as any;
      
      if (!body.otp || body.otp.trim().length < 4) {
        setError("Please enter a valid OTP");
        setLoading(false);
        return;
      }
      
      setError("OTP authentication is not yet implemented. Please use email/password sign in.");
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function sendResetEmail(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      const body = Object.fromEntries(formData.entries()) as any;
      
      if (!validateEmail(body.email)) {
        setError("Please enter a valid email address");
        setLoading(false);
        return;
      }
      
      setError("Password reset is not yet implemented. Please contact support.");
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    setError("");
    try {
      setError("Google sign-in is not yet implemented. Please use email/password sign in.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 p-4">
      <Card className="w-full max-w-md glass shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl gradient-bg flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl">Welcome to InterviewAI</CardTitle>
          <CardDescription>Practice like it's the real interview</CardDescription>
        </CardHeader>
        
        {/* Tab Navigation */}
        <div className="px-6 flex flex-wrap gap-2 border-b border-border pb-4">
          <Button
            variant={activeTab === "signin" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("signin")}
            className={activeTab === "signin" ? "shadow-md" : ""}
          >
            Sign In
          </Button>
          <Button
            variant={activeTab === "signup" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("signup")}
            className={activeTab === "signup" ? "shadow-md" : ""}
          >
            Sign Up
          </Button>
          <Button
            variant={activeTab === "google" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("google")}
            className={activeTab === "google" ? "shadow-md" : ""}
          >
            Google
          </Button>
          <Button
            variant={activeTab === "otp" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("otp")}
            className={activeTab === "otp" ? "shadow-md" : ""}
          >
            OTP
          </Button>
          <Button
            variant={activeTab === "forgot" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("forgot")}
            className={activeTab === "forgot" ? "shadow-md" : ""}
          >
            Forgot Password
          </Button>
        </div>

        <CardContent className="px-6">
          {/* Sign In Form */}
          {activeTab === "signin" && (
            <form action={submitSignIn} className="space-y-4">
              <Input name="email" type="email" placeholder="Email" required />
              <Input name="password" type="password" placeholder="Password" required />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" disabled={loading}>
                {loading ? "Working..." : "Sign In"}
              </Button>
              <button
                type="button"
                onClick={() => setActiveTab("forgot")}
                className="w-full text-sm text-primary hover:underline"
              >
                Forgot Password?
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === "signup" && (
            <form action={submitSignUp} className="space-y-4">
              <Input name="name" placeholder="Full name" required />
              <Input name="email" type="email" placeholder="Email" required />
              <Input name="password" type="password" placeholder="Password" required />
              <Input name="confirmPassword" type="password" placeholder="Confirm Password" required />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" disabled={loading}>
                {loading ? "Working..." : "Sign Up"}
              </Button>
            </form>
          )}

          {/* Google Sign In */}
          {activeTab === "google" && (
            <div className="space-y-4">
              <Button
                className="w-full"
                variant="secondary"
                onClick={handleGoogleSignIn}
                disabled={loading}
              >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? "Connecting..." : "Sign in with Google"}
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}

          {/* OTP Sign In */}
          {activeTab === "otp" && (
            <form action={otpSent ? verifyOtp : sendOtp} className="space-y-4">
              {!otpSent ? (
                <>
                  <Input name="email" type="email" placeholder="Email" required />
                  <Button className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send OTP"}
                  </Button>
                </>
              ) : (
                <>
                  <Input name="otp" type="text" placeholder="Enter OTP" required />
                  <Button className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="w-full text-sm text-primary hover:underline"
                  >
                    Change email
                  </button>
                </>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          )}

          {/* Forgot Password */}
          {activeTab === "forgot" && (
            <form action={sendResetEmail} className="space-y-4">
              {!resetEmailSent ? (
                <>
                  <Input name="email" type="email" placeholder="Enter your email" required />
                  <Button className="w-full" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-foreground">
                    Password reset link has been sent to your email. Please check your inbox.
                  </p>
                  <Button
                    className="w-full"
                    variant="secondary"
                    onClick={() => {
                      setResetEmailSent(false);
                      setActiveTab("signin");
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
