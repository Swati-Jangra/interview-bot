"use client";

import { useRef, useState } from "react";

export function useMediaRecorder(onChunk: (blob: Blob) => void) {
  const recorder = useRef<MediaRecorder | null>(null);
  const [isRecording, setRecording] = useState(false);
  const [isMuted, setMuted] = useState(false);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder.current = new MediaRecorder(stream, { mimeType: "audio/webm" });
    recorder.current.ondataavailable = (event) => event.data.size > 0 && onChunk(event.data);
    recorder.current.start(1200);
    setRecording(true);
  }

  function stop() {
    recorder.current?.stop();
    recorder.current?.stream.getTracks().forEach((track) => track.stop());
    setRecording(false);
  }

  function toggleMute() {
    recorder.current?.stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setMuted(!track.enabled);
    });
  }

  return { isRecording, isMuted, start, stop, toggleMute };
}
