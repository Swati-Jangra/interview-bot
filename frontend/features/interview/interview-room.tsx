"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mic, MicOff, PhoneOff, Radio, Volume2, VolumeX, Settings, Play, Pause, RotateCcw, Brain, FileText, BarChart3, Zap } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/services/api";
import { InterviewSocket, type SocketEvent } from "@/services/interview-socket";
import { useAuthStore } from "@/store/auth-store";
import type { Feedback, Interview, Question } from "@/types";
import { Waveform } from "./waveform";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((error: any) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
};

type VoiceOption = {
  name: string;
  lang: string;
  voiceURI: string;
};

export function InterviewRoom({ id }: { id: string }) {
  const token = useAuthStore((state) => state.accessToken);
  const { data: interview } = useQuery({ queryKey: ["interview", id], queryFn: () => api.getInterview(id) as Promise<Interview> });
  const socket = useMemo(() => new InterviewSocket(), []);
  const [connected, setConnected] = useState(false);
  const [recording, setRecording] = useState(false);
  const [muted, setMuted] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | undefined>();
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback | undefined>();
  const [aiText, setAiText] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [speechError, setSpeechError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const startedAtRef = useRef<number>(Date.now());
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!token) return;
    socket.connect(token, handleEvent);
    setConnected(true);
    return () => socket.close();
  }, [token, socket]);

  useEffect(() => {
    // Load available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis?.getVoices() || [];
      const voiceOptions: VoiceOption[] = voices.map((voice) => ({
        name: voice.name,
        lang: voice.lang,
        voiceURI: voice.voiceURI
      }));
      setAvailableVoices(voiceOptions);
      if (voiceOptions.length > 0 && !selectedVoice) {
        setSelectedVoice(voiceOptions[0].voiceURI);
      }
    };

    loadVoices();
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [selectedVoice]);

  function speakText(text: string) {
    if (!text || muted) return;
    
    window.speechSynthesis?.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      const voice = availableVoices.find((v) => v.voiceURI === selectedVoice);
      if (voice) {
        utterance.voice = window.speechSynthesis?.getVoices().find((v) => v.voiceURI === voice.voiceURI) || null;
      }
    }
    
    utterance.rate = speechRate;
    utterance.pitch = speechPitch;
    utterance.lang = (interview?.config?.language as string) || "en-US";
    
    utterance.onstart = () => setAiSpeaking(true);
    utterance.onend = () => setAiSpeaking(false);
    utterance.onerror = () => setAiSpeaking(false);
    
    speechSynthesisRef.current = utterance;
    window.speechSynthesis?.speak(utterance);
  }

  function handleEvent(event: SocketEvent) {
    if (event.type === "session_ready" || event.type === "ai_response") {
      setCurrentQuestion(event.question);
      setAiText(event.aiText);
      speakText(event.aiText);
    }
    if (event.type === "transcript_received") setTranscripts((items) => [event.text, ...items]);
    if (event.type === "feedback") setFeedback(event.feedback);
  }

  async function start() {
    await api.startInterview(id);
    socket.send({ type: "join", interviewId: id });
    startSpeechRecognition();
    setRecording(true);
  }

  function startSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("Speech recognition is not supported in this browser");
      return;
    }
    const recognition = new SpeechRecognition() as SpeechRecognitionLike;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = String(interview?.config?.language ?? "en-US");
    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const text = result?.[0]?.transcript?.trim();
      if (result?.isFinal && text && currentQuestion) {
        socket.send({
          type: "transcript",
          questionId: currentQuestion._id,
          text,
          durationSeconds: Math.round((Date.now() - startedAtRef.current) / 1000)
        });
        startedAtRef.current = Date.now();
        setInterimTranscript("");
      } else if (!result?.isFinal) {
        setInterimTranscript(text || "");
      }
    };
    recognition.onerror = (error: any) => {
      setSpeechError(`Speech recognition error: ${error.error || "Unknown error"}`);
      setRecording(false);
    };
    recognition.onstart = () => {
      setSpeechError("");
      setRecording(true);
    };
    recognition.onend = () => {
      if (recording) {
        // Restart if still supposed to be recording
        try {
          recognition.start();
        } catch (e) {
          setRecording(false);
        }
      }
    };
    recognition.start();
    recognitionRef.current = recognition;
  }

  function submitTranscript() {
    const text = prompt("Paste a transcript if browser speech recognition is unavailable");
    if (text && currentQuestion) socket.send({ type: "transcript", questionId: currentQuestion._id, text, durationSeconds: 90 });
  }

  function pauseAiSpeech() {
    window.speechSynthesis?.pause();
  }

  function resumeAiSpeech() {
    window.speechSynthesis?.resume();
  }

  function stopAiSpeech() {
    window.speechSynthesis?.cancel();
    setAiSpeaking(false);
  }

  function replayAiSpeech() {
    if (aiText) speakText(aiText);
  }

  async function stop() {
    setRecording(false);
    recognitionRef.current?.stop();
    stopAiSpeech();
    await api.completeInterview(id);
  }

  return (
    <AppShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <section className="space-y-6">
          {/* Main Interview Card */}
          <Card className="glass">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {interview?.mode ?? "Technical"} Interview
                    </span>
                    <div className={`flex items-center gap-1.5 text-xs ${connected ? "text-green-600" : "text-yellow-600"}`}>
                      <div className={`h-2 w-2 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`} />
                      {connected ? "Connected" : "Connecting"}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{currentQuestion?.prompt ?? "Ready when you are"}</CardTitle>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="h-9 w-9">
                  <Settings size={18} />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Voice Settings Panel */}
              {showSettings && (
                <div className="rounded-xl border border-border bg-muted/50 p-6 space-y-6 animate-fade-in">
                  <h3 className="font-semibold">Voice Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground/70">AI Voice</label>
                      <select 
                        value={selectedVoice} 
                        onChange={(e) => setSelectedVoice(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring"
                      >
                        {availableVoices.map((voice) => (
                          <option key={voice.voiceURI} value={voice.voiceURI}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70">Speech Rate: {speechRate.toFixed(1)}x</label>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2" 
                        step="0.1" 
                        value={speechRate}
                        onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                        className="mt-2 w-full"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground/70">Speech Pitch: {speechPitch.toFixed(1)}x</label>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="2" 
                        step="0.1" 
                        value={speechPitch}
                        onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                        className="mt-2 w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* AI Response Section */}
              <div className="rounded-xl border border-border bg-background p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      aiSpeaking ? "gradient-bg" : "bg-muted"
                    }`}>
                      {aiSpeaking ? <Brain className="h-5 w-5 text-white" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium mb-1 ${aiSpeaking ? "text-primary" : "text-muted-foreground"}`}>
                        AI Interviewer
                      </p>
                      <p className={`text-sm leading-relaxed ${aiSpeaking ? "text-foreground" : "text-muted-foreground"}`}>
                        {aiText || "The AI interviewer will speak the next prompt here."}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={pauseAiSpeech} disabled={!aiSpeaking}>
                      <Pause size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={resumeAiSpeech} disabled={!aiSpeaking}>
                      <Play size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={stopAiSpeech} disabled={!aiSpeaking}>
                      <VolumeX size={16} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={replayAiSpeech} disabled={!aiText}>
                      <RotateCcw size={16} />
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <Waveform active={aiSpeaking} />
                </div>
              </div>

              {/* Error Display */}
              {speechError && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive animate-fade-in">
                  {speechError}
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button onClick={start} disabled={recording} variant={recording ? "outline" : "primary"} className="gap-2">
                  <Mic size={18} /> {recording ? "Recording..." : "Start Recording"}
                </Button>
                <Button variant="outline" onClick={() => setMuted((value) => !value)} className="gap-2">
                  {muted ? <MicOff size={18} /> : <Mic size={18} />} {muted ? "Unmute" : "Mute"}
                </Button>
                <Button variant="outline" onClick={submitTranscript} className="gap-2">
                  <FileText size={18} /> Fallback Transcript
                </Button>
                <Button variant="danger" onClick={stop} className="gap-2">
                  <PhoneOff size={18} /> End Interview
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Transcript Card */}
          <Card>
            <CardHeader>
              <CardTitle>Real-time Transcript</CardTitle>
              <CardDescription>Your answers appear here as you speak</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {interimTranscript && (
                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 animate-fade-in">
                    <p className="text-sm text-primary/90 italic">{interimTranscript}</p>
                  </div>
                )}
                {transcripts.length === 0 && !interimTranscript && (
                  <div className="text-center py-8">
                    <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Start recording to see your transcript here</p>
                  </div>
                )}
                {transcripts.map((text, index) => (
                  <div key={index} className="rounded-lg bg-muted/50 border border-border p-4">
                    <p className="text-sm">{text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Live Feedback Card */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">Live Feedback</CardTitle>
              <CardDescription>Real-time performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              {feedback ? (
                <div className="space-y-4">
                  <Score label="Communication" value={feedback.communicationScore} />
                  <Score label="Technical" value={feedback.technicalScore} />
                  <Score label="Confidence" value={feedback.confidenceScore} />
                  <Score label="Clarity" value={feedback.clarityScore} />
                  <div className="pt-4 border-t border-border">
                    <p className="text-sm font-medium mb-2">Suggestions</p>
                    <div className="space-y-2">
                      {feedback.suggestions.map((item) => (
                        <p key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <BarChart3 className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Answer a question to see live feedback</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Questions</span>
                <span className="font-medium">{interview?.questions.length ?? 0}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{interview?.status ?? "draft"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recording</span>
                <span className={`font-medium ${recording ? "text-green-600" : "text-muted-foreground"}`}>
                  {recording ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">AI Speaking</span>
                <span className={`font-medium ${aiSpeaking ? "text-primary" : "text-muted-foreground"}`}>
                  {aiSpeaking ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{Math.round((Date.now() - startedAtRef.current) / 60000)}m</span>
              </div>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Pro Tip</p>
                  <p className="text-xs text-muted-foreground">
                    Speak clearly and at a moderate pace for better transcription accuracy.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </AppShell>
  );
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between"><span>{label}</span><span>{value}%</span></div>
      <div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${value}%` }} /></div>
    </div>
  );
}
