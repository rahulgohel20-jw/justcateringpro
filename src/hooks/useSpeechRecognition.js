import { useState, useRef, useCallback, useEffect } from "react";

// Your app stores lang as en / hi / gu
const LANG_MAP = { en: "en-IN", hi: "hi-IN", gu: "gu-IN" };

export default function useSpeechRecognition({ onResult } = {}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);

  // Keep the latest callback without recreating the recognizer
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice search isn't supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const appLang = localStorage.getItem("lang") || "en";
    const recognition = new SR();
    recognition.lang = LANG_MAP[appLang] || "en-IN";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e) => {
      console.error("Speech error:", e.error);
      setIsListening(false);
    };
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      onResultRef.current?.(transcript.trim());
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const toggle = useCallback(() => {
    isListening ? stop() : start();
  }, [isListening, start, stop]);

  // Stop the mic if the component unmounts
  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { isListening, toggle, stop };
}