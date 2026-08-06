"use client";

import { useState, useRef, useEffect } from "react";
import { Send, BookOpen, FolderOpen, Briefcase, HelpCircle, Sparkles, MessageSquare, Loader2, ChevronDown, ChevronUp, X } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { explainConcept, recommendResources, reviewProject, suggestStrategies, generateQuiz, type Message, type QuizQuestion } from "@/services/ai-mentor-service";

export default function AIMentorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI Mentor. I can help you with:\n\n• Explaining coding concepts\n• Recommending learning resources\n• Reviewing your projects\n• Suggesting interview strategies\n• Conducting quick quizzes\n\nHow can I help you today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<"chat" | "concept" | "resource" | "project" | "strategy" | "quiz">("chat");
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let response: Message;
      
      switch (activeMode) {
        case "concept":
          response = await explainConcept(input);
          break;
        case "resource":
          response = await recommendResources(input);
          break;
        case "project":
          response = await reviewProject(input);
          break;
        case "strategy":
          response = await suggestStrategies(input);
          break;
        case "quiz":
          const quiz = await generateQuiz(input);
          setCurrentQuiz(quiz);
          response = {
            id: Date.now().toString(),
            role: "assistant",
            content: quiz.question,
            type: "quiz",
            metadata: quiz
          };
          break;
        default:
          // Chat mode - auto-detect intent
          const lowerInput = input.toLowerCase();
          if (lowerInput.includes("explain") || lowerInput.includes("what is") || lowerInput.includes("how does")) {
            response = await explainConcept(input);
            setActiveMode("concept");
          } else if (lowerInput.includes("learn") || lowerInput.includes("resource") || lowerInput.includes("tutorial")) {
            response = await recommendResources(input);
            setActiveMode("resource");
          } else if (lowerInput.includes("project") || lowerInput.includes("review") || lowerInput.includes("code review")) {
            response = await reviewProject(input);
            setActiveMode("project");
          } else if (lowerInput.includes("interview") || lowerInput.includes("strategy") || lowerInput.includes("prepare")) {
            response = await suggestStrategies(input);
            setActiveMode("strategy");
          } else if (lowerInput.includes("quiz") || lowerInput.includes("test") || lowerInput.includes("question")) {
            const quiz = await generateQuiz(input);
            setCurrentQuiz(quiz);
            response = {
              id: Date.now().toString(),
              role: "assistant",
              content: quiz.question,
              type: "quiz",
              metadata: quiz
            };
            setActiveMode("quiz");
          } else {
            response = await explainConcept(input);
          }
      }

      setMessages(prev => [...prev, response]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  }

  function handleQuizAnswer(answerIndex: number) {
    setQuizAnswer(answerIndex);
    setShowQuizResult(true);
  }

  function handleNextQuiz() {
    setCurrentQuiz(null);
    setQuizAnswer(null);
    setShowQuizResult(false);
    setInput("Give me another quiz question");
    handleSend();
  }

  function clearChat() {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Hi! I'm your AI Mentor. I can help you with:\n\n• Explaining coding concepts\n• Recommending learning resources\n• Reviewing your projects\n• Suggesting interview strategies\n• Conducting quick quizzes\n\nHow can I help you today?"
      }
    ]);
    setCurrentQuiz(null);
    setQuizAnswer(null);
    setShowQuizResult(false);
  }

  return (
    <AppShell>
      <div className="h-[calc(100vh-2rem)] flex flex-col">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <Sparkles size={24} />
              AI Mentor
            </h1>
            <p className="text-sm text-muted-foreground">Your personal coding assistant and learning guide</p>
          </div>
          <Button onClick={clearChat} variant="outline" size="sm" className="gap-2">
            <X size={16} /> Clear Chat
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid gap-4 lg:grid-cols-4">
          {/* Left Panel - Mode Selection */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-lg">Mentor Modes</CardTitle>
                <CardDescription>Choose how you want to learn</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={() => setActiveMode("chat")}
                  variant={activeMode === "chat" ? "primary" : "outline"}
                  className="w-full justify-start gap-2"
                >
                  <MessageSquare size={18} />
                  Chat Mode
                </Button>
                <Button
                  onClick={() => setActiveMode("concept")}
                  variant={activeMode === "concept" ? "primary" : "outline"}
                  className="w-full justify-start gap-2"
                >
                  <BookOpen size={18} />
                  Explain Concepts
                </Button>
                <Button
                  onClick={() => setActiveMode("resource")}
                  variant={activeMode === "resource" ? "primary" : "outline"}
                  className="w-full justify-start gap-2"
                >
                  <BookOpen size={18} />
                  Learning Resources
                </Button>
                <Button
                  onClick={() => setActiveMode("project")}
                  variant={activeMode === "project" ? "primary" : "outline"}
                  className="w-full justify-start gap-2"
                >
                  <FolderOpen size={18} />
                  Project Review
                </Button>
                <Button
                  onClick={() => setActiveMode("strategy")}
                  variant={activeMode === "strategy" ? "primary" : "outline"}
                  className="w-full justify-start gap-2"
                >
                  <Briefcase size={18} />
                  Interview Strategies
                </Button>
                <Button
                  onClick={() => setActiveMode("quiz")}
                  variant={activeMode === "quiz" ? "primary" : "outline"}
                  className="w-full justify-start gap-2"
                >
                  <HelpCircle size={18} />
                  Quick Quiz
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare size={20} />
                    Conversation
                  </CardTitle>
                  <Badge variant={activeMode === "chat" ? "default" : "secondary"}>
                    {activeMode.charAt(0).toUpperCase() + activeMode.slice(1)} Mode
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 flex flex-col min-h-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}>
                        {message.type === "quiz" && message.metadata ? (
                          <QuizInterface
                            quiz={message.metadata}
                            onAnswer={handleQuizAnswer}
                            showResult={showQuizResult}
                            userAnswer={quizAnswer}
                            onNext={handleNextQuiz}
                          />
                        ) : (
                          <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-4">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder={
                      activeMode === "concept" ? "Ask about a coding concept..." :
                      activeMode === "resource" ? "Ask for learning resources..." :
                      activeMode === "project" ? "Paste your project for review..." :
                      activeMode === "strategy" ? "Ask for interview strategies..." :
                      activeMode === "quiz" ? "Request a quiz topic..." :
                      "Ask me anything about coding..."
                    }
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    disabled={loading}
                  />
                  <Button onClick={handleSend} disabled={loading || !input.trim()} className="gap-2">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function QuizInterface({
  quiz,
  onAnswer,
  showResult,
  userAnswer,
  onNext
}: {
  quiz: QuizQuestion;
  onAnswer: (answer: number) => void;
  showResult: boolean;
  userAnswer: number | null;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      <p className="font-medium">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((option: string, index: number) => (
          <button
            key={index}
            onClick={() => !showResult && onAnswer(index)}
            disabled={showResult}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              showResult
                ? index === quiz.correctAnswer
                  ? "bg-green-100 border-green-500 text-green-900 dark:bg-green-900/30 dark:text-green-100"
                  : index === userAnswer && index !== quiz.correctAnswer
                  ? "bg-red-100 border-red-500 text-red-900 dark:bg-red-900/30 dark:text-red-100"
                  : "bg-muted border-border"
                : "bg-background border-border hover:border-primary"
            }`}
          >
            <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
            {option}
          </button>
        ))}
      </div>
      {showResult && (
        <div className="space-y-3">
          <div className={`p-3 rounded-lg ${
            userAnswer === quiz.correctAnswer
              ? "bg-green-100 text-green-900 dark:bg-green-900/30 dark:text-green-100"
              : "bg-red-100 text-red-900 dark:bg-red-900/30 dark:text-red-100"
          }`}>
            <p className="font-medium">
              {userAnswer === quiz.correctAnswer ? "✓ Correct!" : "✗ Incorrect"}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="font-medium mb-1">Explanation:</p>
            <p className="text-sm">{quiz.explanation}</p>
          </div>
          <Button onClick={onNext} className="w-full gap-2">
            Next Question <ChevronDown size={16} />
          </Button>
        </div>
      )}
    </div>
  );
}
