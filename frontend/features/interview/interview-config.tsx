"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import type { InterviewMode } from "@/types";

const modes: { value: InterviewMode; label: string }[] = [
  { value: "hr", label: "HR" },
  { value: "technical", label: "Technical" },
  { value: "behavioral", label: "Behavioral" },
  { value: "custom", label: "Custom" },
  { value: "company", label: "Company" }
];

export function InterviewConfig() {
  const router = useRouter();
  const [mode, setMode] = useState<InterviewMode>("technical");
  const [loading, setLoading] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    const config = Object.fromEntries(formData.entries());
    const interview: any = await api.createInterview({ mode, config: { ...config, topics: String(config.topics).split(",").map((x) => x.trim()) } });
    router.push(`/interview/${interview._id}`);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-semibold">Configure interview</h1>
        <form action={submit} className="mt-6 grid gap-5">
          <Card>
            <p className="mb-3 text-sm font-medium">Interview mode</p>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
              {modes.map((item) => (
                <button type="button" key={item.value} onClick={() => setMode(item.value)} className={`rounded-md border p-3 text-sm ${mode === item.value ? "border-primary bg-primary/10" : "border-border"}`}>
                  {item.label}
                </button>
              ))}
            </div>
          </Card>
          <Card className="grid gap-4 md:grid-cols-2">
            <Input name="durationMinutes" type="number" defaultValue={30} placeholder="Duration minutes" />
            <Input name="difficulty" defaultValue="medium" placeholder="Difficulty" />
            <Input name="domain" defaultValue="Frontend Engineering" placeholder="Domain" />
            <Input name="experienceLevel" defaultValue="Mid-level" placeholder="Experience level" />
            <Input name="language" defaultValue="English" placeholder="Language" />
            <Input name="voiceStyle" defaultValue="calm-coach" placeholder="Voice style" />
            <Input name="company" placeholder="Company name" />
            <Input name="topics" placeholder="React, JavaScript, System Design" />
          </Card>
          <Button disabled={loading} className="w-fit">{loading ? "Creating..." : "Start setup"}</Button>
        </form>
      </div>
    </AppShell>
  );
}
