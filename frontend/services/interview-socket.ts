import type { Feedback, Question } from "@/types";

export type SocketEvent =
  | { type: "session_ready"; question: Question; aiText: string }
  | { type: "transcript_received"; text: string }
  | { type: "feedback"; feedback: Feedback }
  | { type: "ai_response"; question?: Question; aiText: string }
  | { type: "ai_interrupted" }
  | { type: "error"; message: string };

export class InterviewSocket {
  private socket?: WebSocket;

  connect(token: string, onEvent: (event: SocketEvent) => void) {
    const base = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000/ws/interview";
    this.socket = new WebSocket(`${base}?token=${token}`);
    this.socket.onmessage = (event) => onEvent(JSON.parse(event.data));
    this.socket.onclose = () => onEvent({ type: "error", message: "Interview connection closed" });
  }

  send(payload: Record<string, unknown>) {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(payload));
  }

  close() {
    this.socket?.close();
  }
}
