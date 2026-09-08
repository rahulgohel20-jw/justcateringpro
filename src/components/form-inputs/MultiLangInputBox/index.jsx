import { useRef, useEffect } from "react";               
import InputToTextLang from "../InputToTextLang";
import { getLangConfig } from "@/utils/langConfig";

const trimPayloadWhitespace = (value = "") =>
  String(value)
    .replace(/&nbsp;/gi, " ")
    .replace(/\u00a0/g, " ")
    .replace(/<b>\s+/gi, "<b>")
    .replace(/\s+<\/b>/gi, "</b>")
    .replace(/<\/b>\s+/gi, "</b>")
    .replace(/\s{2,}/g, " ")
    .replace(/^\s+|\s+$/g, "");

const payloadToDisplayHtml = (text = "") =>
  trimPayloadWhitespace(text).replace(/\n/g, "<br>");

// editable div's raw innerHTML -> payload (only <b> survives, everything else -> \n or plain text)
const displayHtmlToPayload = (html) => {
  const doc = new DOMParser().parseFromString(html || "", "text/html");
  const blockTags = new Set(["div", "p", "li"]);

  const walk = (node) => {
  // Strip HTML comment nodes outright — these are clipboard fragment
  // markers like <!--StartFragment--> / <!--EndFragment--> that
  // Word/Outlook/Chrome inject into copied HTML, not real content.
  if (node.nodeType === 8) {
    node.parentNode?.removeChild(node);
    return;
  }

  Array.from(node.childNodes).forEach(walk);
  if (node.nodeType !== 1) return;

  const tag = node.tagName.toLowerCase();
  const parent = node.parentNode;

    if (tag === "br") {
      node.replaceWith(document.createTextNode("\n"));
      return;
    }

    const isBold =
      tag === "b" ||
      tag === "strong" ||
      node.style?.fontWeight === "bold" ||
      Number(node.style?.fontWeight) >= 600;

    if (isBold) {
      const b = document.createElement("b");
      while (node.firstChild) b.appendChild(node.firstChild);
      node.replaceWith(b);
      return;
    }

    // Enter key in a contentEditable usually wraps new lines in <div>/<p> —
    // treat the boundary as a newline before unwrapping.
    if (blockTags.has(tag) && node.nextSibling) {
      parent.insertBefore(document.createTextNode("\n"), node.nextSibling);
    }
    while (node.firstChild) parent.insertBefore(node.firstChild, node);
    parent.removeChild(node);
  };

  Array.from(doc.body.childNodes).forEach(walk);
  return trimPayloadWhitespace(doc.body.innerHTML); // now only text + <b>...</b>, \n for line breaks
};


// ← ADD THIS ENTIRE COMPONENT (before MultiLangInputBox)
function RichTextEditable({ name, value, onChange }) {
  const ref = useRef(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (isInternalChange.current) {
      isInternalChange.current = false;
      return;
    }
    if (ref.current) {
      const display = payloadToDisplayHtml(value || "");
      if (ref.current.innerHTML !== display) {
        ref.current.innerHTML = display;
      }
    }
  }, [value]);

  const emitChange = () => {
    isInternalChange.current = true;
    onChange(displayHtmlToPayload(ref.current.innerHTML));
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const html = e.clipboardData.getData("text/html");
    const plain = e.clipboardData.getData("text/plain");

    if (html) {
      const cleanPayload = displayHtmlToPayload(html);
      document.execCommand("insertHTML", false, payloadToDisplayHtml(cleanPayload));
    } else {
      document.execCommand("insertText", false, plain);
    }
    emitChange();
  };

 const handleKeyDown = (e) => {
    if (e.key !== "Enter") return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(ref.current);
    preRange.setEnd(range.startContainer, range.startOffset);

    const textBefore = preRange.toString();
    const lineStart = textBefore.lastIndexOf("\n") + 1;
    const currentLine = textBefore.slice(lineStart);

    const bulletMatch = currentLine.match(/^(\s*)•\s/);
    if (!bulletMatch) return; // not on a bullet line — let Enter behave normally

    e.preventDefault();

    // Enter on an empty bullet ("• " with nothing typed after it) exits the list
    if (currentLine.trim() === "•") {
      document.execCommand("insertText", false, "\n");
      return;
    }

    document.execCommand("insertText", false, `\n${bulletMatch[1]}• `);
  };

  return (
    <div
      ref={ref}
      name={name}
      contentEditable
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      suppressContentEditableWarning
      className="min-h-[100px] w-full rounded-b-lg border border-t-0 border-gray-300 p-3 outline-none focus:ring-2 focus:ring-primary"
      onInput={emitChange}
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