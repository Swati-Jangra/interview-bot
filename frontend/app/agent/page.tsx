"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, Calendar, Clock, MessageSquare, Video, Phone, Star, Lock, Crown, CheckCircle, AlertCircle, Loader2, Send, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

type SessionType = "chat" | "video" | "phone";
type SessionStatus = "available" | "booked" | "completed" | "cancelled";

interface Agent {
  id: string;
  name: string;
  role: string;
  expertise: string[];
  rating: number;
  reviews: number;
  availability: string;
  image: string;
  price: number;
}

const mockAgents: Agent[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    role: "Senior Technical Recruiter",
    expertise: ["Technical Interviews", "System Design", "FAANG Preparation"],
    rating: 4.9,
    reviews: 127,
    availability: "Available Now",
    image: "/api/placeholder/150/150",
    price: 0
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "Engineering Manager",
    expertise: ["Leadership", "Behavioral Interviews", "Career Growth"],
    rating: 4.8,
    reviews: 98,
    availability: "Next Available: 2:00 PM",
    image: "/api/placeholder/150/150",
    price: 0
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    role: "HR Director",
    expertise: ["HR Interviews", "Culture Fit", "Salary Negotiation"],
    rating: 4.7,
    reviews: 85,
    availability: "Next Available: Tomorrow",
    image: "/api/placeholder/150/150",
    price: 0
  }
];

export default function AgentPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [sessionType, setSessionType] = useState<SessionType>("chat");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "agent"; content: string }>>([]);
  const [isChatActive, setIsChatActive] = useState(false);
  const [currentChatAgent, setCurrentChatAgent] = useState<Agent | null>(null);

  const isPremiumUser = user?.subscription?.plan === "premium" && user?.subscription?.status === "active";
  const remainingSessions = user?.subscription?.plan === "premium" ? 5 - Math.floor(Math.random() * 3) : 0;

  if (!isPremiumUser) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <Card className="border-2">
            <CardContent className="p-12 text-center">
              <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Lock className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Premium Feature</h2>
              <p className="text-muted-foreground mb-6">
                Connect with human interview experts to get personalized feedback and guidance.
                This feature is available only for Premium subscribers.
              </p>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    <span className="font-semibold">Premium Benefits:</span>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      5 human agent sessions per month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Chat, video, and phone sessions
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Expert interview coaches from top companies
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Personalized feedback and career guidance
                    </li>
                  </ul>
                </div>
                <Button onClick={() => router.push("/payment")} variant="primary" className="w-full gap-2">
                  <Crown size={18} /> Upgrade to Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    );
  }

  async function handleBookSession() {
    if (!selectedAgent || !bookingDate || !bookingTime) {
      alert("Please select an agent, date, and time");
      return;
    }

    setLoading(true);
    try {
      // Simulate booking
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert("Session booked successfully! You will receive a confirmation email.");
      setSelectedAgent(null);
      setBookingDate("");
      setBookingTime("");
    } catch (err) {
      alert("Failed to book session. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStartChat(agent: Agent) {
    setCurrentChatAgent(agent);
    setIsChatActive(true);
    setChatMessages([
      { role: "agent", content: `Hi! I'm ${agent.name}, your ${agent.role}. How can I help you with your interview preparation today?` }
    ]);
  }

  async function handleSendMessage() {
    if (!message.trim()) return;

    const userMessage = message;
    setMessage("");
    setChatMessages(prev => [...prev, { role: "user", content: userMessage }]);

    // Simulate agent response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: "agent", 
        content: "That's a great question! Based on your profile and the role you're targeting, I'd recommend focusing on highlighting your technical skills while also demonstrating your problem-solving abilities. Would you like me to help you prepare specific examples for your interviews?" 
      }]);
    }, 1000);
  }

  function handleEndChat() {
    setIsChatActive(false);
    setCurrentChatAgent(null);
    setChatMessages([]);
  }

  if (isChatActive && currentChatAgent) {
    return (
      <AppShell>
        <div className="max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full gradient-bg flex items-center justify-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{currentChatAgent.name}</h2>
                <p className="text-sm text-muted-foreground">{currentChatAgent.role}</p>
              </div>
            </div>
            <Button onClick={handleEndChat} variant="outline" className="gap-2">
              <X size={18} /> End Session
            </Button>
          </div>

          <Card className="h-[calc(100vh-200px)] flex flex-col">
            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[70%] rounded-lg p-3 ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted"
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </CardContent>
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!message.trim()}>
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Human Agent Sessions</h1>
          <p className="mt-2 text-muted-foreground">
            Connect with expert interview coaches for personalized guidance
          </p>
        </div>

        {/* Session Info */}
        <Card className="mb-6 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="font-semibold text-purple-900 dark:text-purple-100">
                    Premium Active
                  </p>
                  <p className="text-sm text-purple-700 dark:text-purple-300">
                    {remainingSessions} sessions remaining this month
                  </p>
                </div>
              </div>
              <Button onClick={() => router.push("/payment")} variant="outline">
                View Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Session Type Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Choose Session Type</CardTitle>
            <CardDescription>Select how you'd like to connect with an agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { type: "chat" as SessionType, icon: MessageSquare, label: "Chat Session", desc: "Text-based conversation" },
                { type: "video" as SessionType, icon: Video, label: "Video Call", desc: "Face-to-face video session" },
                { type: "phone" as SessionType, icon: Phone, label: "Phone Call", desc: "Voice-only conversation" }
              ].map((option) => (
                <button
                  key={option.type}
                  onClick={() => setSessionType(option.type)}
                  className={`rounded-lg border-2 p-4 text-left transition-colors ${
                    sessionType === option.type
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <option.icon className={`h-6 w-6 mb-2 ${sessionType === option.type ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="font-medium">{option.label}</p>
                  <p className="text-sm text-muted-foreground">{option.desc}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {sessionType === "chat" ? (
          /* Chat Agents */
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Available Agents</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mockAgents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full gradient-bg flex items-center justify-center">
                          <User className="h-8 w-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <CardDescription>{agent.role}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < Math.floor(agent.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="text-sm text-muted-foreground">({agent.reviews})</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {agent.expertise.slice(0, 2).map((skill) => (
                          <span key={skill} className="rounded-full bg-muted px-2 py-1 text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle size={14} />
                        {agent.availability}
                      </div>
                      <Button
                        onClick={() => handleStartChat(agent)}
                        className="w-full"
                        variant="primary"
                      >
                        Start Chat Session
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* Booking Form for Video/Phone */
          <Card>
            <CardHeader>
              <CardTitle>Book a {sessionType === "video" ? "Video" : "Phone"} Session</CardTitle>
              <CardDescription>Select an agent and choose your preferred time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Agent</label>
                <div className="grid gap-3 md:grid-cols-3">
                  {mockAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className={`rounded-lg border-2 p-4 text-left transition-colors ${
                        selectedAgent?.id === agent.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-10 w-10 rounded-full gradient-bg flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{agent.name}</p>
                          <p className="text-xs text-muted-foreground">{agent.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        <span>{agent.rating}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Date</label>
                  <Input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Time</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                  >
                    <option value="">Choose a time slot</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">2:00 PM</option>
                    <option value="15:00">3:00 PM</option>
                    <option value="16:00">4:00 PM</option>
                    <option value="17:00">5:00 PM</option>
                  </select>
                </div>
              </div>

              {selectedAgent && (
                <div className="rounded-lg bg-muted p-4">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{selectedAgent.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedAgent.role}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleBookSession}
                disabled={loading || !selectedAgent || !bookingDate || !bookingTime}
                className="w-full"
                variant="primary"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Booking...
                  </>
                ) : (
                  "Book Session"
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
