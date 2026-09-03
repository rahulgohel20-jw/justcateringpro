import React, { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
const SpeechToText = ({
  name,
  placeholder,
  value,
  onChange,
  type = "input", // 'input' | 'textarea'
  className = "",
  lang = "en-US",
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  useEffect(() => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("Speech Recognition not supported in this browser.");
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.lang = lang;
    recog.onstart = () => setIsListening(true);
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
        onChange({
          target: {
            name,
            value: (value + " " + finalText).trim(),
          },
        });
      }
      if (speakingNow) {
        setIsSpeaking(true);
        resetSilenceTimeout();
      }
    };
    recog.onend = () => {
      setIsListening(false);
      setIsSpeaking(false);
      clearTimeout(silenceTimeoutRef.current);
    };
    recognitionRef.current = recog;
    return () => {
      recog.abort();
      clearTimeout(silenceTimeoutRef.current);
    };
  }, [name, value, onChange]);
  const resetSilenceTimeout = () => {
    clearTimeout(silenceTimeoutRef.current);
    silenceTimeoutRef.current = setTimeout(() => {
      recognitionRef.current?.stop();
    }, 3000);
  };
  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };
  const renderField = () => {
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
        onClick={toggleMic}
        // className="sga__btn me-1.5 btn btn-success flex items-center justify-center rounded-full p-0 w-8 h-8"
        className="sga__btn me-1 btn btn-primary flex items-center justify-center rounded-full p-0 w-8 h-8"
      >
        {
          isListening && isSpeaking && ""
          // <span className="absolute w-full h-full rounded-full bg-purple-400 opacity-30 animate-ping z-0"></span>
        }
        {/* <span className="me-1.5 btn btn-light flex items-center justify-center rounded-full p-0 w-8 h-8"> */}
        {isListening ? <Square size={18} /> : <Mic size={18} />}
        {/* </span> */}
      </button>
    </div>
  );
};

export default SpeechToText;
