import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Play, Star, Users, Zap, Brain, Mic, Code, BarChart3, Shield, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
        
        <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-bg" />
            <span className="text-xl font-bold gradient-text">InterviewAI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary">Get Started Free</Button>
            </Link>
          </div>
        </nav>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:px-12">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <Zap className="h-4 w-4" />
                <span>AI-Powered Interview Platform</span>
              </div>
              <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Practice Like It's the{" "}
                <span className="gradient-text">Real Interview</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Master your interview skills with AI-powered mock interviews, real-time feedback, and personalized coaching.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/signup">
                  <Button size="lg" variant="primary" className="gap-2">
                    Start Free <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2">
                  <Play className="h-4 w-4" /> Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>10,000+ Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  <span>4.9 Rating</span>
                </div>
              </div>
            </div>
            
            <div className="relative animate-scale-in">
              <div className="absolute inset-0 gradient-bg opacity-20 blur-3xl" />
              <Card className="relative glass border-0 shadow-2xl">
                <CardHeader>
                  <CardTitle>Live Interview Session</CardTitle>
                  <CardDescription>AI-powered real-time feedback</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                    <div className="h-10 w-10 rounded-full gradient-bg flex items-center justify-center">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">AI Interviewer</p>
                      <p className="text-xs text-muted-foreground">Technical Round</p>
                    </div>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mic className="h-4 w-4 text-primary" />
                      <span>Voice Analysis Active</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      <span>Real-time Scoring</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-4 w-4 text-primary" />
                      <span>Cheat Detection</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Everything You Need to{" "}
            <span className="gradient-text">Succeed</span>
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Comprehensive tools for interview preparation
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="mb-4 h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <CardTitle>AI Interviewer</CardTitle>
              <CardDescription>
                Multi-agent AI panel with HR, Technical, and Engineering managers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="mb-4 h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Voice Analysis</CardTitle>
              <CardDescription>
                Real-time speech analysis with confidence scoring and feedback
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="mb-4 h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <Code className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Coding Interviews</CardTitle>
              <CardDescription>
                Real-time coding with Monaco editor and AI code review
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="mb-4 h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Cheat Detection</CardTitle>
              <CardDescription>
                Advanced integrity monitoring with tab switching and AI assistance detection
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="mb-4 h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Track progress with detailed performance metrics and insights
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="mb-4 h-12 w-12 rounded-lg gradient-bg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle>Company Specific</CardTitle>
              <CardDescription>
                Practice with questions from Google, Meta, Amazon, and more
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-12">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, Transparent{" "}
            <span className="gradient-text">Pricing</span>
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Start free, upgrade when you're ready
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>5 interviews/month</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Basic AI feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Standard interview types</span>
              </div>
              <Button className="w-full" variant="outline">Get Started</Button>
            </CardContent>
          </Card>

          <Card className="border-primary shadow-lg">
            <CardHeader>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Star className="h-3 w-3" />
                Most Popular
              </div>
              <CardTitle>Pro</CardTitle>
              <CardDescription>For serious job seekers</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Unlimited interviews</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Advanced AI feedback</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>All interview types</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Company-specific packs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Resume analyzer</span>
              </div>
              <Button className="w-full" variant="primary">Upgrade to Pro</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>For teams and organizations</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Everything in Pro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Team management</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Custom questions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Analytics dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Priority support</span>
              </div>
              <Button className="w-full" variant="outline">Contact Sales</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-12">
        <Card className="gradient-bg text-white border-0">
          <CardContent className="py-16 text-center">
            <h2 className="text-4xl font-bold sm:text-5xl">
              Ready to Ace Your Next Interview?
            </h2>
            <p className="mt-4 text-xl opacity-90">
              Join thousands of candidates who landed their dream jobs
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="gap-2">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50">
        <div className="mx-auto max-w-7xl px-6 py-12 md:px-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg gradient-bg" />
                <span className="text-xl font-bold gradient-text">InterviewAI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                AI-powered interview preparation platform for job seekers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Features</Link></li>
                <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
                <li><Link href="#" className="hover:text-foreground">Enterprise</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">About</Link></li>
                <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground">Security</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 InterviewAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
