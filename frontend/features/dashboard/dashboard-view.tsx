"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Mic, Target, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/services/api";
import type { Interview } from "@/types";

export function DashboardView() {
  const { data, isLoading, error } = useQuery({ queryKey: ["dashboard"], queryFn: () => api.dashboard() as any });

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-semibold">Interview dashboard</h1>
            <p className="mt-1 text-sm text-foreground/65">Track readiness, practice voice interviews, and turn feedback into sharper answers.</p>
          </div>
          <Link href="/interview/new"><Button><Mic size={18} /> New interview</Button></Link>
        </div>

        {isLoading && <Card>Loading dashboard...</Card>}
        {error && <Card className="text-destructive">Unable to load dashboard.</Card>}

        {data && (
          <>
            <section className="grid gap-4 md:grid-cols-4">
              <Metric icon={Target} label="Average score" value={`${data.analytics.averageScore ?? 0}%`} />
              <Metric icon={Mic} label="Interviews" value={data.analytics.totalInterviews ?? 0} />
              <Metric icon={Clock} label="Speaking time" value={`${Math.round((data.analytics.totalSpeakingSeconds ?? 0) / 60)}m`} />
              <Metric icon={TrendingUp} label="Trend points" value={data.analytics.accuracyTrend?.length ?? 0} />
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.4fr_.6fr]">
              <Card id="history">
                <h2 className="mb-4 text-lg font-semibold">Session history</h2>
                <div className="space-y-3">
                  {data.recentInterviews?.map((item: Interview) => (
                    <Link href={`/interview/${item._id}`} key={item._id} className="flex items-center justify-between rounded-md border border-border p-3 hover:bg-muted">
                      <div>
                        <p className="font-medium capitalize">{item.mode} interview</p>
                        <p className="text-sm text-foreground/60">{new Date(item.createdAt).toLocaleDateString()} · {item.status}</p>
                      </div>
                      <ArrowRight size={18} />
                    </Link>
                  ))}
                </div>
              </Card>
              <Card id="resume">
                <h2 className="mb-4 text-lg font-semibold">Topic map</h2>
                <p className="text-sm text-foreground/65">Weak topics</p>
                <div className="mt-2 flex flex-wrap gap-2">{(data.weakTopics ?? ["Specificity"]).map((topic: string) => <span className="rounded-md bg-muted px-2 py-1 text-xs" key={topic}>{topic}</span>)}</div>
                <p className="mt-5 text-sm text-foreground/65">Strong topics</p>
                <div className="mt-2 flex flex-wrap gap-2">{(data.strongTopics ?? ["Structure"]).map((topic: string) => <span className="rounded-md bg-primary/15 px-2 py-1 text-xs" key={topic}>{topic}</span>)}</div>
              </Card>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function Metric({ icon: Icon, label, value }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground/65">{label}</p>
          <Icon size={18} className="text-primary" />
        </div>
        <p className="mt-3 text-3xl font-semibold">{value}</p>
      </Card>
    </motion.div>
  );
}
