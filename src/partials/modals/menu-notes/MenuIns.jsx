import { useState, useEffect, useRef } from "react";
import { Translateapi } from "../../../services/apiServices";
import { extractTranslations } from "../../../utils/langConfig";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputbox";
import { displayHtmlToPayload, sanitizeToAllowedTags } from "../../../components/form-inputs/RichTextEditable/index"

const MenuIns = ({ isOpen, onClose, notes = "", onSave, itemId, initialTranslating = false, mode = "menu"  }) => {
  const [formData, setFormData] = useState({ english: "", gujarati: "", hindi: "" });
  const [translating, setTranslating] = useState(false);
  const translateTimer = useRef(null);
  const containerRef = useRef(null);
  const skipNextTranslateRef = useRef(false); // ← NEW

  useEffect(() => {
  if (isOpen) {
    skipNextTranslateRef.current = true;

    let english, hindi, gujarati;
    if (typeof notes === "object" && notes !== null) {
      english = notes.english || "";
      hindi = notes.hindi || "";
      gujarati = notes.gujarati || "";
    } else {
      english = notes || "";
      hindi = "";
      gujarati = "";
    }

    // Legacy-data safety net: strip any disallowed tags (e.g. <i> saved
    // before formatting was locked down) the moment old notes are loaded,
    // so opening + re-saving without edits can no longer carry them forward.
    english = displayHtmlToPayload(english);
    hindi = displayHtmlToPayload(hindi);
    gujarati = displayHtmlToPayload(gujarati);

    // If English has no real text, don't trust stale hindi/gujarati — clear them too
    const div = document.createElement("div");
    div.innerHTML = english;
    const plainEnglish = (div.textContent || div.innerText || "").trim();
    if (!plainEnglish) {
      hindi = "";
      gujarati = "";
    }

    setFormData({ english, hindi: toEditorText(hindi), gujarati: toEditorText(gujarati) });
    setTranslating(initialTranslating);
    if (translateTimer.current) clearTimeout(translateTimer.current);
  }
}, [isOpen, itemId, initialTranslating]);

  useEffect(() => {
    if (!isOpen) return;
    if (translateTimer.current) clearTimeout(translateTimer.current);

    if (skipNextTranslateRef.current) {
      skipNextTranslateRef.current = false;
      return;
    }

    const div = document.createElement("div");
    div.innerHTML = formData.english || "";
    const plainEnglish = (div.textContent || div.innerText || "").trim();

    if (!plainEnglish) {
      setFormData((prev) => ({ ...prev, hindi: "", gujarati: "" }));
      setTranslating(false);
      return;
    }

    setTranslating(true);
    translateTimer.current = setTimeout(async () => {
      try {
        const { hindi, gujarati } = await translateInstruction(formData.english || "");
        setFormData((prev) => ({ ...prev, hindi, gujarati }));
      } catch (err) {
        console.error("Translation error:", err);
      } finally {
        setTranslating(false);
      }
    }, 600);

    return () => clearTimeout(translateTimer.current);
  }, [formData.english]);

  const translateInstruction = async (english) => {
  const linesHtml = english.split(/<br\s*\/?>/i);

  const translatedLines = await Promise.all(
    linesHtml.map(async (lineHtml) => {
      const bullet = lineHtml.match(/^(\s*(•|·|▪|-|\*)\s*)/);
      const prefix = bullet?.[0] || "";
      const rest = lineHtml.slice(prefix.length);

      const div = document.createElement("div");
      div.innerHTML = rest;

      const segments = Array.from(div.childNodes).map((node) => ({
        bold: node.nodeType === 1 && node.tagName === "B",
        text: node.textContent || "",
      }));

      const translatedSegments = await Promise.all(
        segments.map(async (seg) => {
          if (!seg.text.trim()) return seg;
          const res = await Translateapi(seg.text);
          const { regional, hindi } = extractTranslations(res.data);
          return { ...seg, hindiText: hindi, gujaratiText: regional };
        })
      );

      const wrap = (bold, text) => (bold ? `<b>${text}</b>` : text);
      const hindiLine = prefix + translatedSegments.map((s) => wrap(s.bold, s.hindiText || s.text)).join("");
      const gujaratiLine = prefix + translatedSegments.map((s) => wrap(s.bold, s.gujaratiText || s.text)).join("");

      return { hindi: hindiLine, gujarati: gujaratiLine };
    })
  );

  return {
    hindi: translatedLines.map((l) => l.hindi).join("<br>"),
    gujarati: translatedLines.map((l) => l.gujarati).join("<br>"),
  };
};

  const stripTrailingNbsp = (str = "") =>
    str.replace(/(&nbsp;|\u00A0|\s)+$/g, "");

  const toEditorText = (value = "") => {
    if (!value) return "";
    const str = String(value);
    const htmlWithBr = str.replace(/\r\n?/g, "\n").replace(/\n/g, "<br>");
    const div = document.createElement("div");
    div.innerHTML = htmlWithBr;
    div.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    div.querySelectorAll("div, p, li").forEach((block) => {
      if (block.nextSibling) block.insertAdjacentText("afterend", "\n");
    });
    return div.textContent || div.innerText || "";
  };

 const toSavedHtml = (value = "") => {
  const str = String(value).replace(/\r\n?/g, "\n");
  const lines = str.split("\n");

  const hasBullet = lines.some((line) => /^\s*(•|·|▪|-|\*)\s*/.test(line));
  const joined = hasBullet ? lines.join("<br>") : lines.join("\n");

  return sanitizeToAllowedTags(joined)   
    .replace(/(&nbsp;|\u00A0)/gi, " ")
    .replace(/&amp;/gi, "&")
    .trim();
};
 

  // ── Find the underlying English input (textarea OR contentEditable div) ──
  const getEnglishEditor = () => {
    if (!containerRef.current) return null;
    return containerRef.current.querySelector('[name="english"]');
  };

  // ── Insert a bullet point at the current cursor position ───────────────
  const handleAddBullet = () => {
    const editor = getEnglishEditor();

    if (!editor) {
      setFormData((prev) => {
        const trimmed = stripTrailingNbsp(prev.english || "");
        return { ...prev, english: `${trimmed}${trimmed ? "\n" : ""}• ` };
      });
      return;
    }

    editor.focus();

    // Plain <textarea> path (formatting disabled) — unchanged old logic
    if (editor.tagName === "TEXTAREA") {
      const start = editor.selectionStart ?? formData.english.length;
      const end = editor.selectionEnd ?? formData.english.length;
      const current = formData.english || "";

      const before = stripTrailingNbsp(current.slice(0, start));
      const after = current.slice(end);
      const needsNewlineBefore = before.length > 0 && !before.endsWith("\n");
      const bullet = `${needsNewlineBefore ? "\n" : ""}• `;
      const newValue = `${before}${bullet}${after}`;
      const newCursorPos = before.length + bullet.length;

      setFormData((prev) => ({ ...prev, english: newValue }));

      requestAnimationFrame(() => {
        const ta = getEnglishEditor();
        if (ta) {
          ta.focus();
          ta.setSelectionRange(newCursorPos, newCursorPos);
        }
      });
      return;
    }

    // contentEditable <div> path (rich text on)
    const sel = window.getSelection();
    if (!sel) return;

    if (sel.rangeCount === 0 || !editor.contains(sel.anchorNode)) {
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false); // put cursor at the end
      sel.removeAllRanges();
      sel.addRange(range);
    }

    const range = sel.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(editor);
    preRange.setEnd(range.startContainer, range.startOffset);
    const beforeContainer = document.createElement("div");
    beforeContainer.appendChild(preRange.cloneContents());
    beforeContainer.querySelectorAll("br").forEach((br) => br.replaceWith("\n"));
    beforeContainer.querySelectorAll("div, p, li").forEach((block) => {
      if (block.nextSibling) block.insertAdjacentText("afterend", "\n");
    });
    const textBefore = beforeContainer.textContent || beforeContainer.innerText || "";
    const atLineStart = textBefore.length === 0 || textBefore.endsWith("\n");
    const currentBlock = range.startContainer.nodeType === Node.ELEMENT_NODE
      ? range.startContainer
      : range.startContainer.parentElement;
    const currentBlockIsEmpty = currentBlock?.textContent?.trim() === "";

    // A browser newline can create <div>/<p> blocks, leaving large gaps between
    // bullets. A <br> keeps every entry on a normal, compact line.
    range.deleteContents();
    const fragment = document.createDocumentFragment();
    if (!atLineStart && !currentBlockIsEmpty) fragment.appendChild(document.createElement("br"));
    const bulletText = document.createTextNode("• ");
    fragment.appendChild(bulletText);
    range.insertNode(fragment);

    const cursor = document.createRange();
    cursor.setStart(bulletText, bulletText.length);
    cursor.collapse(true);
    sel.removeAllRanges();
    sel.addRange(cursor);
    editor.dispatchEvent(new Event("input", { bubbles: true }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Item Instruction</h2>
          <button onClick={onClose} className="text-2xl text-gray-600">&times;</button>
        </div>
      {mode === "decor" && (
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={handleAddBullet}
            onMouseDown={(e) => e.preventDefault()}
            className="text-sm flex items-center gap-1 text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition"
          >
            <span className="text-base leading-none">•</span> Add bullet point
          </button>
        </div>
      )}

        <div ref={containerRef}>
          <MultiLangInputBox
            formData={formData}
            setFormData={setFormData}
            enableFormatting={true}
            label="Instruction"
            cols={1}
            type="textarea"
            keys={{ english: "english", regional: "gujarati", hindi: "hindi" }}
          />
        </div>

        <div className="flex w-full justify-end mt-6 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            type="button"
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
            onClick={() => onSave({
              english: toSavedHtml(formData.english),
              hindi: toSavedHtml(formData.hindi),
              gujarati: toSavedHtml(formData.gujarati),
            })}
            disabled={translating}
          >
            {translating ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="31.4" strokeDashoffset="10" />
                </svg>
                Translating...
              </span>
            ) : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuIns;
