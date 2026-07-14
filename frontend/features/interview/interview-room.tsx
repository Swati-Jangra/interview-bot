"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mic, MicOff, PhoneOff, Radio, Volume2, VolumeX, Settings, Play, Pause, RotateCcw } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm text-foreground/60">{interview?.mode ?? "Interview"} · {connected ? "Connected" : "Connecting"}</p>
                <h1 className="mt-2 text-2xl font-semibold">{currentQuestion?.prompt ?? "Ready when you are"}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Radio className={connected ? "text-primary" : "text-foreground/30"} />
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setShowSettings(!showSettings)}>
                  <Settings size={18} />
                </Button>
              </div>
            </div>

            {showSettings && (
              <div className="mt-4 rounded-md border border-border bg-muted p-4 space-y-4">
                <h3 className="font-medium">Voice Settings</h3>
                <div>
                  <label className="text-sm text-foreground/70">AI Voice</label>
                  <select 
                    value={selectedVoice} 
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  >
                    {availableVoices.map((voice) => (
                      <option key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-foreground/70">Speech Rate: {speechRate.toFixed(1)}x</label>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2" 
                    step="0.1" 
                    value={speechRate}
                    onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                    className="mt-1 w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-foreground/70">Speech Pitch: {speechPitch.toFixed(1)}x</label>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="2" 
                    step="0.1" 
                    value={speechPitch}
                    onChange={(e) => setSpeechPitch(parseFloat(e.target.value))}
                    className="mt-1 w-full"
                  />
                </div>
              </div>
            )}

            <div className="mt-8 rounded-md border border-border bg-background p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-sm">
                  {aiSpeaking ? <Volume2 size={18} className="text-primary" /> : <VolumeX size={18} className="text-foreground/50" />}
                  <span className={aiSpeaking ? "text-primary" : "text-foreground/70"}>
                    {aiText || "The AI interviewer will speak the next prompt here."}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" className="h-8 w-8 p-0" onClick={pauseAiSpeech} disabled={!aiSpeaking}>
                    <Pause size={16} />
                  </Button>
                  <Button variant="ghost" className="h-8 w-8 p-0" onClick={resumeAiSpeech} disabled={!aiSpeaking}>
                    <Play size={16} />
                  </Button>
                  <Button variant="ghost" className="h-8 w-8 p-0" onClick={stopAiSpeech} disabled={!aiSpeaking}>
                    <VolumeX size={16} />
                  </Button>
                  <Button variant="ghost" className="h-8 w-8 p-0" onClick={replayAiSpeech} disabled={!aiText}>
                    <RotateCcw size={16} />
                  </Button>
                </div>
              </div>
              <Waveform active={aiSpeaking} />
            </div>

            {speechError && (
              <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {speechError}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={start} disabled={recording}><Mic size={18} /> Start</Button>
              <Button variant="secondary" onClick={() => setMuted((value) => !value)}>{muted ? <MicOff size={18} /> : <Mic size={18} />} {muted ? "Unmute" : "Mute"}</Button>
              <Button variant="secondary" onClick={submitTranscript}>Fallback transcript</Button>
              <Button variant="danger" onClick={stop}><PhoneOff size={18} /> Stop</Button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-4 text-lg font-semibold">Real-time transcript</h2>
            <div className="space-y-3">
              {interimTranscript && (
                <p className="rounded-md bg-primary/10 p-3 text-sm text-primary/80 italic">
                  {interimTranscript}
                </p>
              )}
              {transcripts.length === 0 && !interimTranscript && (
                <p className="text-sm text-foreground/60">Answers will appear as soon as the voice pipeline receives transcript events.</p>
              )}
              {transcripts.map((text, index) => (
                <p key={index} className="rounded-md bg-muted p-3 text-sm">{text}</p>
              ))}
            </div>
          </Card>
        </section>

        <aside className="space-y-5">
          <Card>
            <h2 className="text-lg font-semibold">Live feedback</h2>
            {feedback ? (
              <div className="mt-4 space-y-3 text-sm">
                <Score label="Communication" value={feedback.communicationScore} />
                <Score label="Technical" value={feedback.technicalScore} />
                <Score label="Confidence" value={feedback.confidenceScore} />
                <Score label="Clarity" value={feedback.clarityScore} />
                <p className="pt-2 font-medium">Suggestions</p>
                {feedback.suggestions.map((item) => <p key={item} className="text-foreground/70">{item}</p>)}
              </div>
            ) : <p className="mt-3 text-sm text-foreground/60">Submit an answer to receive scoring, weaknesses, strengths, and a model answer.</p>}
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Session summary</h2>
            <p className="mt-3 text-sm text-foreground/65">Questions: {interview?.questions.length ?? 0}</p>
            <p className="text-sm text-foreground/65">Status: {interview?.status ?? "draft"}</p>
            <p className="text-sm text-foreground/65">Recording: {recording ? "Active" : "Inactive"}</p>
            <p className="text-sm text-foreground/65">AI Speaking: {aiSpeaking ? "Yes" : "No"}</p>
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
