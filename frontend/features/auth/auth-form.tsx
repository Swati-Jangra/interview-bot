"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import { useAuthStore } from "@/store/auth-store";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      const body = Object.fromEntries(formData.entries()) as any;
      const session: any = mode === "login" ? await api.login(body) : await api.signup(body);
      setSession(session);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="mx-auto mt-20 w-full max-w-md">
      <h1 className="text-2xl font-semibold">{mode === "login" ? "Welcome back" : "Create account"}</h1>
      <form action={submit} className="mt-6 space-y-4">
        {mode === "signup" && <Input name="name" placeholder="Full name" required />}
        <Input name="email" type="email" placeholder="Email" required />
        <Input name="password" type="password" placeholder="Password" required />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button className="w-full" disabled={loading}>{loading ? "Working..." : mode === "login" ? "Login" : "Sign up"}</Button>
      </form>
    </Card>
  );
}
