import { useRef, useEffect } from "react";               // ← ADD THIS LINE
import InputToTextLang from "../InputToTextLang";
import { getLangConfig } from "@/utils/langConfig";

// ← ADD THIS ENTIRE COMPONENT (before MultiLangInputBox)
function RichTextEditable({ name, value, onChange }) {
  const ref = useRef(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  return (
    <div
      ref={ref}
      name={name}
      contentEditable
      suppressContentEditableWarning
      className="min-h-[100px] w-full rounded-b-lg border border-t-0 border-gray-300 p-3 outline-none focus:ring-2 focus:ring-primary"
      onInput={(e) => {
        isInternalChange.current = true;
        onChange(e.currentTarget.innerHTML);
      }}
    />
  );
}

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
        // BOLD EDITOR - ONLY WHEN enableFormatting=true
        // ==========================================
        if (type === "textarea" && enableFormatting && index === 0) {
          return (
            <div key={item.key} className="flex flex-col gap-1">
              <label className="text-sm font-normal text-black">
                {label} ({item.label})
                {required && (
                  <span className="text-red-500 ms-0.5">*</span>
                )}
              </label>

              {/* Toolbar */}
              {/* <div className="flex gap-1 rounded-t-lg border border-gray-300 bg-gray-50 p-2">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    document.execCommand("bold", false, null);
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 bg-white font-bold hover:bg-gray-100"
                  title="Bold"
                >
                  B
                </button>
              </div> */}

              {/* Editable content — THIS LINE CHANGED */}
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

              {error && (
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
          <InputToTextLang
            key={item.key}
            type={type}
            label={`${label} (${item.label})`}
            name={item.key}
            placeholder={label}
            value={formData[item.key] || ""}
            className="w-full rounded-lg border border-gray-300 p-2"
            onChange={(e) =>
              setFormData({
                ...formData,
                [item.key]: e.target.value,
              })
            }
            required={required && index === 0}
            lang={item.lang}
            error={index === 0 ? error : undefined}
          />
        );
      })}
    </div>
  );
};

export default MultiLangInputBox;