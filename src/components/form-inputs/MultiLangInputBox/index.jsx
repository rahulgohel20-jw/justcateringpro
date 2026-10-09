import { useRef, useEffect } from "react";
import InputToTextLang from "../InputToTextLang";
import RichTextEditable, {
  trimPayloadWhitespace,
  payloadToDisplayHtml,
  displayHtmlToPayload,
} from "../RichTextEditable";
import { getLangConfig } from "@/utils/langConfig";
import { Mic } from "lucide-react";
import useSpeechRecognition from "@/hooks/useSpeechRecognition";

const escapeHtml = (s = "") =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const FieldMic = ({ fieldKey, lang, value, setFormData, className = "", escape = true }) => {
  const baseRef = useRef("");

  const { isListening, toggle, stop } = useSpeechRecognition({
    lang: `${lang}-IN`,
    onResult: (text) => {
      const raw = (text || "").trim();
      const spoken = escape ? escapeHtml(raw) : raw;
      const base = baseRef.current;
      setFormData((prev) => ({
        ...prev,
        [fieldKey]: `${base}${base && spoken ? " " : ""}${spoken}`,
      }));
    },
  });

  useEffect(() => () => stop?.(), []);

  const handleClick = () => {
    if (!isListening) {
      baseRef.current = (value || "").replace(/(&nbsp;|\u00A0|\s)+$/g, "");
    }
    toggle();
  };

  return (
    <button
      type="button"
      title={isListening ? "Stop listening" : "Speak"}
      onClick={handleClick}
      onMouseDown={(e) => e.preventDefault()}
      className={`w-7 h-7 flex items-center justify-center rounded-full transition-colors ${
        isListening
          ? "bg-red-500 text-white animate-pulse"
          : "bg-primary/10 text-primary hover:bg-primary hover:text-white"
      } ${className}`}
    >
      <Mic size={14} />
    </button>
  );
};

const MultiLangInputBox = ({
  formData,
  setFormData,
  label,
  error,
  cols = 3,
  type = "text",
  keys = { english: "", regional: "", hindi: "" },
  required = true,
  enableFormatting = false,
}) => {
  const langConfig = getLangConfig();

  const handleTextareaKeyDown = (e) => {
    if (e.key !== "Enter") return;

    const textarea = e.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value || "";

    const textBefore = value.slice(0, start);
    const lineStart = textBefore.lastIndexOf("\n") + 1;
    const currentLine = textBefore.slice(lineStart);

    const bulletMatch = currentLine.match(/^(\s*)(•|·|▪|-|\*)(\s*)/);
    if (!bulletMatch) return;

    e.preventDefault();

    const indent = bulletMatch[1];
    const bulletSymbol = bulletMatch[2];
    const spacing = bulletMatch[3];
    const bulletPrefix = `${indent}${bulletSymbol}${spacing || " "}`;

    if (currentLine.trim() === bulletSymbol) {
      const beforeLine = value.slice(0, lineStart);
      const afterCursor = value.slice(end);
      const newValue = beforeLine + afterCursor;

      const name = textarea.name;
      setFormData((prev) => ({ ...prev, [name]: newValue }));

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(lineStart, lineStart);
      });
      return;
    }

    const textAfter = value.slice(end);
    const bulletInsert = `\n${bulletPrefix}`;
    const newValue = textBefore + bulletInsert + textAfter;
    const newCursorPos = start + bulletInsert.length;

    const name = textarea.name;
    setFormData((prev) => ({ ...prev, [name]: newValue }));

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    });
  };

  const languages = [
    { key: keys.english, label: "English", lang: "en" },
    { key: keys.regional, label: langConfig.label, lang: langConfig.lang },
    { key: keys.hindi, label: "Hindi", lang: "hi" },
  ];

  const gridClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 lg:grid-cols-3",
  }[cols] || "grid-cols-1 lg:grid-cols-3";

  return (
    <div className={`grid ${gridClass} gap-3`}>
      {languages.map((item, index) => {

        // ==========================================
        // RICH TEXT EDITOR - WHEN enableFormatting=true (all languages)
        // ==========================================
        if (type === "textarea" && enableFormatting) {
          return (
            <div key={item.key} className="flex flex-col gap-1.5">
             <div className="flex items-center justify-between">
  <label className="text-sm font-normal text-black">
    {label} ({item.label})
    {required && index === 0 && (
      <span className="text-red-500 ms-0.5">*</span>
    )}
  </label>
  <FieldMic
    fieldKey={item.key}
    lang={item.lang}
    value={formData[item.key]}
    setFormData={setFormData}
  />
</div>

              <RichTextEditable
                name={item.key}
                value={formData[item.key] || ""}
                onChange={(html) =>
                  setFormData({
                    ...formData,
                    [item.key]: html,
                  })
                }
              />

              {index === 0 && error && (
                <span className="text-sm text-red-500">
                  {error}
                </span>
              )}
            </div>
          );
        }

        // ==========================================
        // NORMAL TEXTAREA
        // ==========================================
        if (type === "textarea") {
          return (
            <div key={item.key} className="flex flex-col gap-1">
              <label className="text-sm font-normal text-black">
                {label} ({item.label})
                {required && index === 0 && (
                  <span className="text-red-500 ms-0.5">*</span>
                )}
              </label>

              <textarea
                name={item.key}
                placeholder={label}
                rows={3}
                value={formData[item.key] || ""}
                onKeyDown={handleTextareaKeyDown}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    [item.key]: e.target.value,
                  })
                }
                className="w-full resize-none rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />

              {index === 0 && error && (
                <span className="text-sm text-red-500">
                  {error}
                </span>
              )}
            </div>
          );
        }

        // ==========================================
        // NORMAL INPUT
        // ==========================================
return (
  <div key={item.key} className="relative">
    <InputToTextLang
      type={type}
      label={`${label} (${item.label})`}
      name={item.key}
      placeholder={label}
      value={formData[item.key] || ""}
      className="w-full rounded-lg border border-gray-300 p-2 pr-10"
      onChange={(e) =>
        setFormData({
          ...formData,
          [item.key]: e.target.value,
        })
      }
      required={required && index === 0}
      lang={item.lang}
      error={index === 0 ? error : undefined}
      enableFormatting={enableFormatting}
    />
    <FieldMic
      fieldKey={item.key}
      lang={item.lang}
      value={formData[item.key]}
      setFormData={setFormData}
      escape={enableFormatting}
      className="absolute right-2 bottom-1.5"
    />
  </div>
        );
      })}
    </div>
  );
};

export default MultiLangInputBox;