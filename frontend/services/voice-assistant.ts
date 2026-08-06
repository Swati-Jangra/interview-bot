class VoiceAssistant {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening: boolean = false;
  private isSpeaking: boolean = false;
  private onTranscriptCallback: ((transcript: string) => void) | null = null;
  private onSpeakingCallback: ((isSpeaking: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.synthesis = window.speechSynthesis;
      this.initSpeechRecognition();
    }
  }

  private initSpeechRecognition() {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      this.recognition = new (window as any).webkitSpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

      this.recognition.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript && this.onTranscriptCallback) {
          this.onTranscriptCallback(finalTranscript);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        if (event.error === "no-speech" || event.error === "audio-capture") {
          this.stopListening();
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          // Restart if still supposed to be listening
          this.recognition.start();
        }
      };
    }
  }

  startListening(callback: (transcript: string) => void) {
    if (!this.recognition) {
      console.error("Speech recognition not supported");
      return false;
    }

    this.onTranscriptCallback = callback;
    this.isListening = true;
    
    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error("Failed to start speech recognition:", error);
      this.isListening = false;
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.isListening = false;
      this.recognition.stop();
    }
  }

  speak(text: string, voiceSettings?: { rate?: number; pitch?: number; volume?: number }) {
    if (!this.synthesis) {
      console.error("Speech synthesis not supported");
      return Promise.reject("Speech synthesis not supported");
    }

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synthesis!.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Apply voice settings
      if (voiceSettings) {
        utterance.rate = voiceSettings.rate || 1;
        utterance.pitch = voiceSettings.pitch || 1;
        utterance.volume = voiceSettings.volume || 1;
      }

      // Try to get a good voice
      const voices = this.synthesis!.getVoices();
      const preferredVoice = voices.find((voice: SpeechSynthesisVoice) => 
        voice.name.includes("Google") || 
        voice.name.includes("Samantha") ||
        voice.name.includes("Daniel")
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        this.isSpeaking = true;
        if (this.onSpeakingCallback) {
          this.onSpeakingCallback(true);
        }
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        if (this.onSpeakingCallback) {
          this.onSpeakingCallback(false);
        }
        resolve(true);
      };

      utterance.onerror = (error) => {
        this.isSpeaking = false;
        if (this.onSpeakingCallback) {
          this.onSpeakingCallback(false);
        }
        reject(error);
      };

      this.synthesis!.speak(utterance);
    });
  }

  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      if (this.onSpeakingCallback) {
        this.onSpeakingCallback(false);
      }
    }
  }

  isCurrentlyListening(): boolean {
    return this.isListening;
  }

  isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }

  onSpeakingStateChange(callback: (isSpeaking: boolean) => void) {
    this.onSpeakingCallback = callback;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.synthesis) return [];
    return this.synthesis!.getVoices();
  }

  isSupported(): boolean {
    return !!(typeof window !== "undefined" && 
              ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) &&
              window.speechSynthesis);
  }
}

// Singleton instance
export const voiceAssistant = new VoiceAssistant();
