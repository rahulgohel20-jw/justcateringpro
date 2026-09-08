import { useState, useEffect, useRef } from "react";
import { Translateapi } from "../../../services/apiServices";
import { extractTranslations } from "../../../utils/langConfig";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputbox";

const MenuIns = ({ isOpen, onClose, notes = "", onSave, itemId, initialTranslating = false }) => {
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

    // If English has no real text, don't trust stale hindi/gujarati — clear them too
    const div = document.createElement("div");
    div.innerHTML = english;
    const plainEnglish = (div.textContent || div.innerText || "").trim();
    if (!plainEnglish) {
      hindi = "";
      gujarati = "";
    }

    setFormData({ english, hindi, gujarati });
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
      const res = await Translateapi(plainEnglish);
      const { regional, hindi } = extractTranslations(res.data);
      setFormData((prev) => ({ ...prev, hindi, gujarati: regional }));
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setTranslating(false);
    }
  }, 600);

  return () => clearTimeout(translateTimer.current);
}, [formData.english]);
  const stripTrailingNbsp = (str = "") =>
  str.replace(/(&nbsp;|\u00A0|\s)+$/g, "");

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
  const textBefore = preRange.toString();
  const atLineStart = textBefore.length === 0 || textBefore.endsWith("\n");

  document.execCommand("insertText", false, `${atLineStart ? "" : "\n"}• `);
};

  if (!isOpen) return null;
  
const normalizeForSave = (html = "") =>
  html.replace(/&nbsp;|\u00A0/g, " ").trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Item Instruction</h2>
          <button onClick={onClose} className="text-2xl text-gray-600">&times;</button>
        </div>

        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={handleAddBullet}
            className="text-sm flex items-center gap-1 text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition"
          >
            <span className="text-base leading-none">•</span> Add bullet point
          </button>
        </div>

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
            onClick={() => onSave({ english: formData.english, hindi: formData.hindi, gujarati: formData.gujarati })}
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