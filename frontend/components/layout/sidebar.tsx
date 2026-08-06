"use client";

import Link from "next/link";
import { BarChart3, FileText, LayoutDashboard, LogOut, Mic, Settings, CreditCard, User, Code2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/interview/new", label: "Practice", icon: Mic },
  { href: "/coding", label: "Coding", icon: Code2 },
  { href: "/mentor", label: "AI Mentor", icon: Sparkles },
  { href: "/history", label: "History", icon: BarChart3 },
  { href: "/resume", label: "Resume", icon: FileText },
  { href: "/agent", label: "Human Agent", icon: User },
  { href: "/payment", label: "Upgrade", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-card p-4 md:flex md:flex-col">
      <Link href="/dashboard" className="mb-8 text-xl font-semibold">AI Interview Coach</Link>
      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted">
            <item.icon size={18} /> {item.label}
          </Link>
        ))}
      </nav>
      <Button variant="ghost" onClick={logout} className="justify-start"><LogOut size={18} /> Logout</Button>
    </aside>
  );
}
