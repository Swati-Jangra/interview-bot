"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    
    // Check if email is verified
    if (user && !user.isEmailVerified) {
      router.push("/verify-email?email=" + encodeURIComponent(user.email));
      return;
    }
  }, [router, token, user]);

  // Don't render children if not authenticated or email not verified
  if (!token || (user && !user.isEmailVerified)) {
    return null;
  }

  return (
    <div>
      <Sidebar />
      <main className="min-h-screen px-4 py-4 md:ml-64 md:px-8">{children}</main>
    </div>
  );
}
