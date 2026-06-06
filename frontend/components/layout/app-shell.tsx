"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!token) router.push("/login");
  }, [router, token]);

  return (
    <div>
      <Sidebar />
      <main className="min-h-screen px-4 py-4 md:ml-64 md:px-8">{children}</main>
    </div>
  );
}
