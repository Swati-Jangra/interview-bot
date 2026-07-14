"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, Mic, Target, TrendingUp, Award, Flame, Calendar, BookOpen, Code, Users, Zap, Brain, BarChart3, Star } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import type { Interview } from "@/types";

export function DashboardView() {
  const { data, isLoading, error } = useQuery({ queryKey: ["dashboard"], queryFn: () => api.dashboard() as any });

  return (
    <AppShell>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-4xl font-bold gradient-text">Welcome back!</h1>
            <p className="mt-2 text-lg text-muted-foreground">Track your progress and ace your next interview</p>
          </div>
          <div className="flex gap-3">
            <Link href="/profile">
              <Button variant="outline">Profile</Button>
            </Link>
            <Link href="/interview/new">
              <Button variant="primary" className="gap-2">
                <Mic size={18} /> Start Interview
              </Button>
            </Link>
          </div>
        </div>

        {isLoading && (
          <div className="grid gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="h-32 animate-pulse" />
            ))}
          </div>
        )}
        
        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-6">
              <p className="text-destructive">Unable to load dashboard. Please try again later.</p>
            </CardContent>
          </Card>
        )}

        {data && (
          <>
            {/* Stats Grid */}
            <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Average Score</p>
                        <p className="mt-2 text-3xl font-bold gradient-text">{data.analytics.averageScore ?? 0}%</p>
                      </div>
                      <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                      <TrendingUp className="h-4 w-4" />
                      <span>+12% from last week</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="glass hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Interviews</p>
                        <p className="mt-2 text-3xl font-bold">{data.analytics.totalInterviews ?? 0}</p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-blue-500 flex items-center justify-center">
                        <Mic className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>This month</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="glass hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Speaking Time</p>
                        <p className="mt-2 text-3xl font-bold">{Math.round((data.analytics.totalSpeakingSeconds ?? 0) / 60)}m</p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-purple-500 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="h-4 w-4" />
                      <span>Total practice</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <Card className="glass hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">XP Points</p>
                        <p className="mt-2 text-3xl font-bold">{data.analytics.accuracyTrend?.length ?? 0 * 100}</p>
                      </div>
                      <div className="h-12 w-12 rounded-xl bg-orange-500 flex items-center justify-center">
                        <Award className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4" />
                      <span>Level 12</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            {/* Main Content Grid */}
            <section className="grid gap-6 lg:grid-cols-3">
              {/* Recent Interviews */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.5 }}
                className="lg:col-span-2"
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Recent Interviews</CardTitle>
                      <Link href="/interview/new">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Mic size={16} /> New Interview
                        </Button>
                      </Link>
                    </div>
                    <CardDescription>Your latest practice sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.recentInterviews?.length === 0 ? (
                        <div className="text-center py-8">
                          <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-muted-foreground">No interviews yet. Start your first practice session!</p>
                          <Link href="/interview/new" className="mt-4 inline-block">
                            <Button variant="primary" className="gap-2">
                              <Mic size={18} /> Start Interview
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        data.recentInterviews?.map((item: Interview, index: number) => (
                          <motion.div
                            key={item._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 + index * 0.1 }}
                          >
                            <Link href={`/interview/${item._id}`} className="block">
                              <div className="flex items-center justify-between rounded-lg border border-border p-4 hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-lg gradient-bg flex items-center justify-center">
                                    <Mic className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium capitalize">{item.mode} Interview</p>
                                    <p className="text-sm text-muted-foreground">
                                      {new Date(item.createdAt).toLocaleDateString()} · {item.status}
                                    </p>
                                  </div>
                                </div>
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </Link>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Side Panel */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                {/* Streak */}
                <Card className="glass">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                        <Flame className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">7 Day Streak</p>
                        <p className="text-sm text-muted-foreground">Keep it up!</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Topic Map */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Topic Performance</CardTitle>
                    <CardDescription>Your strong and weak areas</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="mb-2 text-sm font-medium text-green-600">Strong Topics</p>
                      <div className="flex flex-wrap gap-2">
                        {(data.strongTopics ?? ["Structure", "Communication"]).map((topic: string) => (
                          <span key={topic} className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-sm font-medium text-orange-600">Needs Improvement</p>
                      <div className="flex flex-wrap gap-2">
                        {(data.weakTopics ?? ["Specificity", "Technical Depth"]).map((topic: string) => (
                          <span key={topic} className="rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-medium dark:bg-orange-900/30 dark:text-orange-400">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/interview/new" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Code className="h-4 w-4" />
                        Coding Interview
                      </Button>
                    </Link>
                    <Link href="/resume" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <BookOpen className="h-4 w-4" />
                        Resume Analyzer
                      </Button>
                    </Link>
                    <Link href="/profile" className="block">
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Users className="h-4 w-4" />
                        Update Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            </section>

            {/* Recommended Interviews */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.7 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Recommended for You</CardTitle>
                  <CardDescription>Based on your performance and goals</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Link href="/interview/new" className="group">
                      <div className="rounded-lg border border-border p-4 hover:border-primary transition-colors">
                        <div className="mb-3 h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                          <Brain className="h-5 w-5 text-blue-500" />
                        </div>
                        <h3 className="font-medium">System Design</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Practice architecture design</p>
                      </div>
                    </Link>
                    <Link href="/interview/new" className="group">
                      <div className="rounded-lg border border-border p-4 hover:border-primary transition-colors">
                        <div className="mb-3 h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                          <BarChart3 className="h-5 w-5 text-purple-500" />
                        </div>
                        <h3 className="font-medium">Data Analysis</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Improve analytical skills</p>
                      </div>
                    </Link>
                    <Link href="/interview/new" className="group">
                      <div className="rounded-lg border border-border p-4 hover:border-primary transition-colors">
                        <div className="mb-3 h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                          <Users className="h-5 w-5 text-green-500" />
                        </div>
                        <h3 className="font-medium">Behavioral</h3>
                        <p className="mt-1 text-sm text-muted-foreground">HR and soft skills</p>
                      </div>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </div>
    </AppShell>
  );
}
