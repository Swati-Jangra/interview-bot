"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, Mic, Target, TrendingUp, Filter, Search, Download, Trash2, Play } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import type { Interview } from "@/types";

export default function HistoryPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ["interviews"], queryFn: () => api.dashboard() as any });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<string>("all");

  const interviews = data?.recentInterviews || [];
  const filteredInterviews = interviews.filter((interview: Interview) => {
    const matchesSearch = interview.mode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         interview.status.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterMode === "all" || interview.mode === filterMode;
    return matchesSearch && matchesFilter;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      active: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      draft: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
      abandoned: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    };
    return styles[status as keyof typeof styles] || styles.draft;
  };

  return (
    <AppShell>
      <div className="max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Interview History</h1>
            <p className="mt-2 text-muted-foreground">Review your past practice sessions and track progress</p>
          </div>
          <Link href="/interview/new">
            <Button variant="primary" className="gap-2">
              <Mic size={18} /> Start New Interview
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Interviews</p>
                  <p className="mt-1 text-2xl font-bold">{interviews.length}</p>
                </div>
                <Mic className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="mt-1 text-2xl font-bold">{interviews.filter((i: Interview) => i.status === "completed").length}</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Score</p>
                  <p className="mt-1 text-2xl font-bold">
                    {data?.analytics?.averageScore ?? 0}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                  <p className="mt-1 text-2xl font-bold">
                    {Math.round((data?.analytics?.totalSpeakingSeconds ?? 0) / 60)}m
                  </p>
                </div>
                <Clock className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search interviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterMode === "all" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilterMode("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterMode === "technical" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilterMode("technical")}
                >
                  Technical
                </Button>
                <Button
                  variant={filterMode === "behavioral" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilterMode("behavioral")}
                >
                  Behavioral
                </Button>
                <Button
                  variant={filterMode === "hr" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setFilterMode("hr")}
                >
                  HR
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="h-24 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-6">
              <p className="text-destructive">Unable to load interview history. Please try again later.</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && !error && (
          <div className="space-y-4">
            {filteredInterviews.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Mic className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
                  <h3 className="text-xl font-semibold">No interviews found</h3>
                  <p className="mt-2 text-muted-foreground">
                    {searchQuery || filterMode !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "Start your first practice session to see your history here"}
                  </p>
                  {!searchQuery && filterMode === "all" && (
                    <Link href="/interview/new" className="mt-6 inline-block">
                      <Button variant="primary" className="gap-2">
                        <Mic size={18} /> Start Interview
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredInterviews.map((interview: Interview, index: number) => (
                <motion.div
                  key={interview._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                            <Mic className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold capitalize">{interview.mode} Interview</h3>
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(interview.status)}`}>
                                {interview.status}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(interview.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {Math.round((interview.responses?.[0]?.durationSeconds || 0) / 60)} min
                              </span>
                              <span className="flex items-center gap-1">
                                <Target size={14} />
                                {interview.questions?.length || 0} questions
                              </span>
                            </div>
                            {interview.summary && (
                              <div className="mt-2 flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Score:</span>
                                  <span className={`text-lg font-bold ${getScoreColor(interview.summary.averageScore)}`}>
                                    {interview.summary.averageScore}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {interview.status === "completed" && (
                            <Link href={`/interview/${interview._id}`}>
                              <Button variant="outline" size="sm" className="gap-2">
                                <Play size={14} /> Review
                              </Button>
                            </Link>
                          )}
                          {interview.status === "draft" && (
                            <Link href={`/interview/${interview._id}`}>
                              <Button variant="primary" size="sm" className="gap-2">
                                <Play size={14} /> Continue
                              </Button>
                            </Link>
                          )}
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Download size={14} />
                          </Button>
                          <Button variant="ghost" size="sm" className="gap-2 text-destructive hover:text-destructive">
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
