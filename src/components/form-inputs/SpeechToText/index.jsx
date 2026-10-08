import React, { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import RichTextEditable from "@/components/form-inputs/RichTextEditable";

const LANG_MAP = {
  en: "en-IN",
  hi: "hi-IN",
  gu: "gu-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  ml: "ml-IN",
};

const SpeechToText = ({
  name,
  placeholder,
  value,
  onChange,
  type = "input", // 'input' | 'textarea'
  className = "",
  lang = "en-US",
  enableFormatting = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const resolvedLang = LANG_MAP[lang] || (lang?.length === 2 ? `${lang}-IN` : lang) || "en-IN";

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = resolvedLang;

    recog.onstart = () => {
      setIsListening(true);
    };

    recog.onresult = (event) => {
      let finalText = "";
      let speakingNow = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          finalText += transcript;
        } else {
          speakingNow = true;
        }
      }
      if (finalText.trim()) {
        const prevVal = valueRef.current || "";
        const newVal = prevVal ? `${prevVal} ${finalText.trim()}` : finalText.trim();
        onChangeRef.current?.({
          target: {
            name,
            value: newVal,
          },
        });
      }
      if (speakingNow) {
        setIsSpeaking(true);
        resetSilenceTimeout();
      }
    };

    recog.onerror = (event) => {
      console.warn("Speech Recognition Error:", event.error);
      setIsListening(false);
      setIsSpeaking(false);
      if (event.error === "not-allowed") {
        alert("Microphone permission denied. Please allow microphone access in your browser settings (click the lock/tune icon in the address bar).");
      } else if (event.error === "network") {
        alert("Speech recognition network error. Please check your internet connection (Chrome requires internet for speech-to-text).");
      }
    };

    recog.onend = () => {
      setIsListening(false);
      setIsSpeaking(false);
      clearTimeout(silenceTimeoutRef.current);
    };

    recognitionRef.current = recog;

    return () => {
      try {
        recog.abort();
      } catch {
        // ignore
      }
      clearTimeout(silenceTimeoutRef.current);
    };
  }, [name, resolvedLang]);

  const resetSilenceTimeout = () => {
    clearTimeout(silenceTimeoutRef.current);
    silenceTimeoutRef.current = setTimeout(() => {
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore
      }
    }, 3000);
  };

  const toggleMic = async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch (err) {
        console.error("Mic stop error:", err);
      }
      return;
    }

    // Try requesting permission with getUserMedia to trigger the browser prompt if not yet granted
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (err) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          alert("Microphone permission is blocked.\n\nTo allow it:\n1. Click 'Site settings' in the popup on your screen\n2. Change 'Microphone' to 'Allow'\n3. Refresh this page.");
          return;
        }
      }
    }

    try {
      recognitionRef.current?.start();
    } catch (err) {
      console.error("Mic toggle error:", err);
      try {
        recognitionRef.current?.abort();
        setTimeout(() => recognitionRef.current?.start(), 100);
      } catch {}
    }
  };

  const renderField = () => {
    if (enableFormatting) {
      return (
        <RichTextEditable
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={(val) => onChange?.({ target: { name, value: val } })}
          minHeight={type === "textarea" ? "min-h-[100px]" : "min-h-[42px]"}
          className="flex-1"
        />
      );
    }

    const commonProps = {
      className: `input ${className}`,
      name,
      placeholder,
      value,
      onChange,
    };
    return type === "textarea" ? (
      <textarea rows={4} {...commonProps} />
    ) : (
      <input type="text" {...commonProps} />
    );
  };

  return (
    <div className="sg__inner flex items-center gap-1 relative">
      {renderField()}
      <button
        type="button"
        title={isListening ? "Stop listening" : "Click to speak"}
        onClick={toggleMic}
        className={`sga__btn me-1 btn flex items-center justify-center rounded-full p-0 w-8 h-8 flex-shrink-0 transition-colors ${
          isListening
            ? "btn-danger bg-red-500 text-white animate-pulse"
            : "btn-primary"
        }`}
      >
        {isListening ? <Square size={16} /> : <Mic size={18} />}
      </button>
    </div>
  );
};

export default SpeechToText;
