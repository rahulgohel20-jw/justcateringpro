import { useEffect, useState, useRef } from "react";
import { Translateapi } from "@/services/apiServices";
import { extractTranslations } from "@/utils/langConfig";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputbox";

const TranslateInstructionModal = ({
  isOpen,
  onClose,
  sourceText,
  valueHindi,
  valueGujarati,
  onChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    instructions: "",
    instructionsHindi: "",
    instructionsGujarati: "",
  });
  const translateTimer = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    setFormData({
      instructions: sourceText || "",
      instructionsHindi: valueHindi || "",
      instructionsGujarati: valueGujarati || "",
    });

    if (sourceText?.trim() && !valueHindi && !valueGujarati) {
      handleTranslate(sourceText.trim());
    }
  }, [isOpen, sourceText, valueHindi, valueGujarati]);

  // ── Translation ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (translateTimer.current) clearTimeout(translateTimer.current);

    if (!formData.instructions?.trim()) {
      setFormData((prev) => ({ ...prev, instructionsHindi: "", instructionsGujarati: "" }));
      return;
    }

    translateTimer.current = setTimeout(() => {
      handleTranslate(formData.instructions);
    }, 600);

    return () => clearTimeout(translateTimer.current);
  }, [formData.instructions]);

  const handleTranslate = async (text) => {
    if (!text?.trim()) return;
    setLoading(true);
    try {
      const res = await Translateapi(text.trim());
      const { regional, hindi } = extractTranslations(res?.data?.data || res?.data || {});
      setFormData((prev) => ({ ...prev, instructionsHindi: hindi, instructionsGujarati: regional }));
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <i className="ki-filled ki-message-text text-primary"></i>
            Instruction
          </h2>
          <button onClick={onClose} className="text-2xl text-gray-400 hover:text-gray-600 leading-none">
            &times;
          </button>
        </div>

        <MultiLangInputBox
          formData={formData}
          setFormData={setFormData}
          label="Instruction"
          cols={1}
          type="textarea"
          keys={{
            english: "instructions",
            regional: "instructionsGujarati",
            hindi: "instructionsHindi",
          }}
        />

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-100 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { onChange(formData); onClose(); }}
            disabled={loading}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
          >
            {loading ? "Translating..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslateInstructionModal;