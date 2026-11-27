import { useState, useEffect, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { Translateapi } from "@/services/apiServices";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputbox";

const DEBOUNCE_MS = 600;

// Adjust these keys to match the real /transliterate response
const extractTranslations = (res) => {
  const d = res?.data?.data ?? res?.data ?? {};
  return {
    gujarati: d.gujarati ?? d.Gujarati ?? d.guj ?? d.notesGujarati ?? "",
    hindi: d.hindi ?? d.Hindi ?? d.hin ?? d.notesHindi ?? "",
  };
};

const toFormData = (initialNotes) =>
  typeof initialNotes === "string"
    ? { notesEnglish: initialNotes, notesGujarati: "", notesHindi: "" }
    : {
        notesEnglish: initialNotes?.notesEnglish || "",
        notesGujarati: initialNotes?.notesGujarati || "",
        notesHindi: initialNotes?.notesHindi || "",
      };

// Mounted fresh every time the modal opens, so state starts from the saved data
const AddNotesContent = ({ onClose, initialNotes, onSave }) => {
  const [formData, setFormData] = useState(() => toFormData(initialNotes));
  const [translating, setTranslating] = useState(false);

  // English text that came from the API/props: never translate this
  const loadedEnglishRef = useRef(formData.notesEnglish);
  // What we last auto-filled, to tell if the user edited a box by hand
  const lastAutoRef = useRef({ gujarati: "", hindi: "" });
  const requestIdRef = useRef(0);

  useEffect(() => {
    const text = formData.notesEnglish.trim();

    // Unchanged from the loaded value -> just use the data as-is
    if (formData.notesEnglish === loadedEnglishRef.current) return;

    const auto = lastAutoRef.current;
    const canFillGuj =
      !formData.notesGujarati.trim() || formData.notesGujarati === auto.gujarati;
    const canFillHindi =
      !formData.notesHindi.trim() || formData.notesHindi === auto.hindi;
    if (!canFillGuj && !canFillHindi) return;

    // English cleared -> clear auto-filled boxes
    if (!text) {
      requestIdRef.current += 1;
      setTranslating(false);
      setFormData((prev) => ({
        ...prev,
        notesGujarati: canFillGuj ? "" : prev.notesGujarati,
        notesHindi: canFillHindi ? "" : prev.notesHindi,
      }));
      lastAutoRef.current = { gujarati: "", hindi: "" };
      return;
    }

    const timer = setTimeout(async () => {
      const myId = ++requestIdRef.current;
      setTranslating(true);
      try {
        const res = await Promise.race([
          Translateapi(text),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Translate request timed out")), 15000)
          ),
        ]);
        if (myId !== requestIdRef.current) return;

        const { gujarati, hindi } = extractTranslations(res);

        setFormData((prev) => {
          const a = lastAutoRef.current;
          const guj =
            !prev.notesGujarati.trim() || prev.notesGujarati === a.gujarati
              ? gujarati
              : prev.notesGujarati;
          const hin =
            !prev.notesHindi.trim() || prev.notesHindi === a.hindi
              ? hindi
              : prev.notesHindi;
          lastAutoRef.current = {
            gujarati: guj === gujarati ? gujarati : a.gujarati,
            hindi: hin === hindi ? hindi : a.hindi,
          };
          return { ...prev, notesGujarati: guj, notesHindi: hin };
        });
      } catch (err) {
        console.error("[AddNotes] Translate failed:", err);
      } finally {
        if (myId === requestIdRef.current) setTranslating(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.notesEnglish]);

  const handleSave = () => {
    onSave({
      notesEnglish: formData.notesEnglish.trim(),
      notesGujarati: formData.notesGujarati.trim(),
      notesHindi: formData.notesHindi.trim(),
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl p-6 relative shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            <FormattedMessage id="COMMON.ADD_NOTES" defaultMessage="Add Notes" />
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition text-xl cursor-pointer"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <MultiLangInputBox
          formData={formData}
          setFormData={setFormData}
          label="Notes"
          type="textarea"
          cols={1}
          required={false}
          keys={{
            english: "notesEnglish",
            regional: "notesGujarati",
            hindi: "notesHindi",
          }}
        />

        {/* Actions */}
        <div className="flex w-full justify-between items-center mt-6 gap-3">
          <span className="text-xs text-gray-500">
            {translating ? "Translating..." : ""}
          </span>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
            >
              <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
            </button>
            <button
              type="button"
              disabled={translating}
              className="bg-primary text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition shadow-xs cursor-pointer disabled:opacity-50"
              onClick={handleSave}
            >
              <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddNotes = ({ isOpen, ...props }) =>
  isOpen ? <AddNotesContent {...props} /> : null;

export default AddNotes;