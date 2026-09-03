import { useState, useEffect,useRef } from "react";
import { Mic } from "lucide-react";
import { Translateapi } from "@/services/apiServices";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";

const CategoryNotes = ({ isOpen, onClose, notes, onSave }) => {
  const langConfig = getLangConfig();
  const [debounceTimer, setDebounceTimer] = useState(null);
  const isUserTypingRef = useRef(false);

  const [localNotes, setLocalNotes] = useState({
    categoryNotesEnglish: "",
    categoryNotesHindi: "",
    categoryNotesGujarati: "",
    categorySlogan: "",
  });

  /* ------------------ PREFILL DATA ------------------ */
  useEffect(() => {
    if (isOpen) {
      isUserTypingRef.current = false; // 👈 reset
      setLocalNotes({
        categoryNotesEnglish: notes?.notesEnglish || "",
        categoryNotesHindi: notes?.notesHindi || "",
        categoryNotesGujarati: notes?.notesGujarati || "",
        categorySlogan: notes?.slogan || "",
      });
    }
  }, [isOpen, notes]);
  
  /* ------------------ INPUT CHANGE ------------------ */
  const handleChange = (field, value) => {
    if (field === "categoryNotesEnglish") {
      isUserTypingRef.current = true; 
    }
  
    setLocalNotes((prev) => ({ ...prev, [field]: value }));
  };
  

  /* ------------------ TRANSLATE FUNCTION ------------------ */
  const triggerTranslate = (text) => {
    if (!text?.trim()) return;

    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(async () => {
      try {
        const res = await Translateapi(text);
const { regional, hindi } = extractTranslations(res.data);
setLocalNotes((prev) => ({
  ...prev,
  categoryNotesHindi: hindi,
  categoryNotesGujarati: regional,
}));
      } catch (error) {
        console.error("Translation failed:", error);
      }
    }, 500);

    setDebounceTimer(timer);
  };

  /* ------------------ AUTO TRANSLATE ON TYPE ------------------ */
  useEffect(() => {
    if (
      isOpen &&
      isUserTypingRef.current && // 👈 IMPORTANT
      localNotes.categoryNotesEnglish?.trim()
    ) {
      triggerTranslate(localNotes.categoryNotesEnglish);
    }
  }, [localNotes.categoryNotesEnglish]);
  

  /* ------------------ CLEANUP DEBOUNCE ------------------ */
  useEffect(() => {
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [debounceTimer]);

  /* ------------------ SAVE ------------------ */
  const handleSave = () => {
    onSave({
      notesEnglish: localNotes.categoryNotesEnglish,
      notesHindi: localNotes.categoryNotesHindi,
      notesGujarati: localNotes.categoryNotesGujarati,
      slogan: localNotes.categorySlogan,
    });
  };

  /* ------------------ SAFE CONDITIONAL RENDER ------------------ */
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add Notes And Slogan</h2>
          <button onClick={onClose} className="text-2xl text-gray-600">
            &times;
          </button>
        </div>

        {/* Notes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputWithIcon
            label="Category Notes (English)"
            value={localNotes.categoryNotesEnglish}
            onChange={(e) =>
              handleChange("categoryNotesEnglish", e.target.value)
            }
            onMicClick={() => triggerTranslate(localNotes.categoryNotesEnglish)}
          />
<InputWithIcon
  label={`Category Notes (${langConfig.script})`}
  value={localNotes.categoryNotesGujarati}
  onChange={(e) => handleChange("categoryNotesGujarati", e.target.value)}
/>


          <InputWithIcon
            label="Category Notes (हिंदी)"
            value={localNotes.categoryNotesHindi}
            onChange={(e) => handleChange("categoryNotesHindi", e.target.value)}
          />

          
        </div>

        {/* Slogan */}
        <div className="mt-4">
          <InputWithIcon
            label="Category Slogan"
            value={localNotes.categorySlogan}
            onChange={(e) => handleChange("categorySlogan", e.target.value)}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-6 gap-3">
          <button
            onClick={onClose}
            className="border border-gray-300 px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-primary text-white px-5 py-2 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------ INPUT COMPONENT ------------------ */
const InputWithIcon = ({ label, value, onChange, onMicClick }) => (
  <div className="relative w-full">
    <label className="block text-gray-600 mb-1">{label}</label>

    <input
      type="text"
      className="border border-gray-300 rounded-lg p-2 pr-10 w-full"
      placeholder={label}
      value={value}
      onChange={onChange}
    />

    {onMicClick && (
      <button
        type="button"
        onClick={onMicClick}
        title="Translate"
        className="absolute top-[70%] right-2 transform -translate-y-1/2 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center"
      >
        <Mic size={18} />
      </button>
    )}
  </div>
);

export default CategoryNotes;
