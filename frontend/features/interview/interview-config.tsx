"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/services/api";
import type { InterviewMode } from "@/types";
import { Brain, Code, Users, BarChart3, Shield, Briefcase, MessageSquare, Database, Globe, Cpu, Lock, FileText, Zap } from "lucide-react";

const interviewTypes = [
  { value: "hr", label: "HR Interview", icon: Users, description: "General HR questions and behavioral assessment" },
  { value: "technical", label: "Technical", icon: Code, description: "Deep technical questions and problem-solving" },
  { value: "behavioral", label: "Behavioral", icon: MessageSquare, description: "Soft skills and situational questions" },
  { value: "coding", label: "Coding", icon: Brain, description: "Live coding challenges and algorithms" },
  { value: "system-design", label: "System Design", icon: Database, description: "Architecture and scalability questions" },
  { value: "case-study", label: "Case Study", icon: BarChart3, description: "Business case analysis and solutions" },
  { value: "managerial", label: "Managerial", icon: Briefcase, description: "Leadership and management scenarios" },
  { value: "leadership", label: "Leadership", icon: Shield, description: "Executive and strategic leadership" },
  { value: "product-manager", label: "Product Manager", icon: Zap, description: "Product strategy and decision-making" },
  { value: "data-analyst", label: "Data Analyst", icon: BarChart3, description: "Data analysis and interpretation" },
  { value: "ai-engineer", label: "AI Engineer", icon: Cpu, description: "Machine learning and AI systems" },
  { value: "frontend", label: "Frontend", icon: Globe, description: "UI/UX and frontend development" },
  { value: "backend", label: "Backend", icon: Database, description: "Server-side and API development" },
  { value: "full-stack", label: "Full Stack", icon: Code, description: "End-to-end development" },
  { value: "devops", label: "DevOps", icon: Shield, description: "Infrastructure and deployment" },
  { value: "cyber-security", label: "Cyber Security", icon: Lock, description: "Security and compliance" },
  { value: "cloud-engineer", label: "Cloud Engineer", icon: Globe, description: "Cloud architecture and services" }
];

const companies = [
  { value: "google", label: "Google" },
  { value: "microsoft", label: "Microsoft" },
  { value: "amazon", label: "Amazon" },
  { value: "meta", label: "Meta" },
  { value: "apple", label: "Apple" },
  { value: "netflix", label: "Netflix" },
  { value: "adobe", label: "Adobe" },
  { value: "oracle", label: "Oracle" },
  { value: "ibm", label: "IBM" },
  { value: "accenture", label: "Accenture" },
  { value: "infosys", label: "Infosys" },
  { value: "tcs", label: "TCS" },
  { value: "wipro", label: "Wipro" },
  { value: "capgemini", label: "Capgemini" }
];

const difficulties = [
  { value: "easy", label: "Easy", description: "Beginner level questions" },
  { value: "medium", label: "Medium", description: "Intermediate level questions" },
  { value: "hard", label: "Hard", description: "Advanced level questions" },
  { value: "expert", label: "Expert", description: "Senior/Lead level questions" }
];

export function InterviewConfig() {
  const router = useRouter();
  const [mode, setMode] = useState<InterviewMode>("technical");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  async function submit(formData: FormData) {
    setLoading(true);
    const config = Object.fromEntries(formData.entries());
    const interview: any = await api.createInterview({ 
      mode, 
      config: { 
        ...config, 
        topics: String(config.topics).split(",").map((x) => x.trim()),
        company: selectedCompany,
        difficulty
      } 
    });
    router.push(`/interview/${interview._id}`);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text">Configure Your Interview</h1>
          <p className="mt-2 text-lg text-muted-foreground">Customize your practice session to match your target role</p>
        </div>

        <form action={submit} className="space-y-8">
          {/* Interview Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Interview Type</CardTitle>
              <CardDescription>Choose the type of interview you want to practice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {interviewTypes.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setMode(item.value as InterviewMode)}
                      className={`group relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-md ${
                        mode === item.value 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className={`mb-3 h-10 w-10 rounded-lg flex items-center justify-center ${
                        mode === item.value ? "gradient-bg" : "bg-muted"
                      }`}>
                        <Icon className={`h-5 w-5 ${mode === item.value ? "text-white" : "text-muted-foreground"}`} />
                      </div>
                      <h3 className="font-medium">{item.label}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Company Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Company-Specific Mode</CardTitle>
              <CardDescription>Practice with questions from your target company (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-5">
                <button
                  type="button"
                  onClick={() => setSelectedCompany("")}
                  className={`rounded-lg border p-3 text-sm transition-colors ${
                    selectedCompany === "" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  }`}
                >
                  General
                </button>
                {companies.map((company) => (
                  <button
                    key={company.value}
                    type="button"
                    onClick={() => setSelectedCompany(company.value)}
                    className={`rounded-lg border p-3 text-sm transition-colors ${
                      selectedCompany === company.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {company.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Difficulty Level */}
          <Card>
            <CardHeader>
              <CardTitle>Difficulty Level</CardTitle>
              <CardDescription>Set the complexity of questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {difficulties.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setDifficulty(item.value)}
                    className={`rounded-lg border p-4 text-left transition-all hover:shadow-md ${
                      difficulty === item.value 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <h3 className="font-medium">{item.label}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
              <CardDescription>Configure the fundamental interview parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input name="durationMinutes" type="number" defaultValue={30} placeholder="30" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Domain/Role</label>
                  <Input name="domain" defaultValue="Software Engineering" placeholder="e.g., Frontend, Backend" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Experience Level</label>
                  <Input name="experienceLevel" defaultValue="Mid-level" placeholder="e.g., Junior, Senior" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Input name="language" defaultValue="English" placeholder="e.g., English, Spanish" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topics</label>
                  <Input name="topics" placeholder="React, JavaScript, System Design" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Number of Questions</label>
                  <Input name="questionCount" type="number" defaultValue={5} placeholder="5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Advanced Settings</CardTitle>
                  <CardDescription>Fine-tune your interview experience</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? "Hide" : "Show"}
                </Button>
              </div>
            </CardHeader>
            {showAdvanced && (
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Voice Style</label>
                    <Input name="voiceStyle" defaultValue="calm-coach" placeholder="e.g., professional, friendly" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">AI Personality</label>
                    <Input name="aiPersonality" defaultValue="balanced" placeholder="e.g., strict, encouraging" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Feedback Style</label>
                    <Input name="feedbackStyle" defaultValue="detailed" placeholder="e.g., concise, detailed" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Follow-up Questions</label>
                    <Input name="followUpEnabled" type="checkbox" defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Real-time Feedback</label>
                    <Input name="realtimeFeedback" type="checkbox" defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Code Review</label>
                    <Input name="codeReview" type="checkbox" defaultChecked />
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Multi-Agent Panel */}
          <Card className="glass">
            <CardHeader>
              <CardTitle>Multi-Agent AI Panel</CardTitle>
              <CardDescription>Enable multiple AI interviewers for comprehensive assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                  <input type="checkbox" name="enableHR" defaultChecked className="h-4 w-4" />
                  <div>
                    <p className="font-medium">HR Manager</p>
                    <p className="text-xs text-muted-foreground">Behavioral and culture fit</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                  <input type="checkbox" name="enableTechnical" defaultChecked className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Senior Engineer</p>
                    <p className="text-xs text-muted-foreground">Technical depth assessment</p>
                  </div>
                </label>
                <label className="flex items-center gap-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50">
                  <input type="checkbox" name="enableManager" className="h-4 w-4" />
                  <div>
                    <p className="font-medium">Engineering Manager</p>
                    <p className="text-xs text-muted-foreground">Leadership and communication</p>
                  </div>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="gap-2">
              {loading ? "Creating..." : "Start Interview"} <Brain className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
