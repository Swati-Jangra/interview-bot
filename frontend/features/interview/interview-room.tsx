"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Mic, MicOff, PhoneOff, Radio, Volume2 } from "lucide-react";
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
  onerror: (() => void) | null;
};

export function InterviewRoom({ id }: { id: string }) {
  const token = useAuthStore((state) => state.accessToken);
  const { data: interview } = useQuery({ queryKey: ["interview", id], queryFn: () => api.getInterview(id) as Promise<Interview> });
  const socket = useMemo(() => new InterviewSocket(), []);
  const [connected, setConnected] = useState(false);
  const [recording, setRecording] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | undefined>();
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<Feedback | undefined>();
  const [aiText, setAiText] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const startedAtRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!token) return;
    socket.connect(token, handleEvent);
    setConnected(true);
    return () => socket.close();
  }, [token, socket]);

  function handleEvent(event: SocketEvent) {
    if (event.type === "session_ready" || event.type === "ai_response") {
      setCurrentQuestion(event.question);
      setAiText(event.aiText);
      window.speechSynthesis?.speak(new SpeechSynthesisUtterance(event.aiText));
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
    if (!SpeechRecognition) return;
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
      }
    };
    recognition.onerror = () => setRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
  }

  function submitTranscript() {
    const text = prompt("Paste a transcript if browser speech recognition is unavailable");
    if (text && currentQuestion) socket.send({ type: "transcript", questionId: currentQuestion._id, text, durationSeconds: 90 });
  }

  async function stop() {
    setRecording(false);
    recognitionRef.current?.stop();
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
              <Radio className={connected ? "text-primary" : "text-foreground/30"} />
            </div>
            <div className="mt-8 rounded-md border border-border bg-background p-5">
              <div className="flex items-center gap-3 text-sm"><Volume2 size={18} /> {aiText || "The AI interviewer will speak the next prompt here."}</div>
              <Waveform active={recording} />
            </div>
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
              {transcripts.length === 0 && <p className="text-sm text-foreground/60">Answers will appear as soon as the voice pipeline receives transcript events.</p>}
              {transcripts.map((text, index) => <p key={index} className="rounded-md bg-muted p-3 text-sm">{text}</p>)}
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
