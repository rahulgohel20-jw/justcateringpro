import { useState, useEffect } from "react";
import SpeechToText from "@/components/form-inputs/SpeechToText";
import { Translateapi } from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import { useRef } from "react";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputbox";

const AddNotes = ({ isOpen, onClose, initialNotes, onSave }) => {
  const [notes, setNotes] = useState(
    initialNotes || { notesEnglish: "", notesGujarati: "", notesHindi: "" }
  );
  const [debounceTimer, setDebounceTimer] = useState(null);

  const intl = useIntl();
  const langConfig = getLangConfig();

  useEffect(() => {
    setNotes(
      initialNotes || { notesEnglish: "", notesGujarati: "", notesHindi: "" }
    );
  }, [initialNotes, isOpen]);


const debounceRef = useRef(null);

useEffect(() => {
  if (!notes.notesEnglish?.trim()) return;

  
  if (debounceRef.current) {
    clearTimeout(debounceRef.current);
  }

  debounceRef.current = setTimeout(async () => {
    try {
      const res = await Translateapi(notes.notesEnglish);

      const data = res?.data?.data || res?.data || {};
const { regional, hindi } = extractTranslations(data);
setNotes((prev) => ({
  ...prev,
  notesGujarati: regional,
  notesHindi: hindi,
}));
    } catch (err) {
      console.error("Translation error:", err);
    }
  }, 600);

  return () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  };
}, [notes.notesEnglish]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setNotes((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            <FormattedMessage
              id="COMMON.ADD_NOTES"
              defaultMessage="Add Notes"
            />
          </h2>

          <button onClick={onClose} className="text-2xl text-gray-600">
            &times;
          </button>
        </div>
        {/* Form */}
       <MultiLangInputBox
  formData={notes}
  setFormData={setNotes}
  label="Notes"
  cols={3}
  type="textarea"
  keys={{ english: "notesEnglish", regional: "notesGujarati", hindi: "notesHindi" }}
/>
        <div className="flex w-full justify-end mt-6 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
          </button>
          <button
            type="button"
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
            onClick={() => onSave(notes)}
          >
            <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
          </button>
        </div>
      </div>
    </div>
  );
};

const InputWithIcon = ({
  label,
  value,
  onChange,
  name,
  required,
  lang,
  className,
}) => (
  <div className="relative">
    <label className="block text-gray-600 mb-1">{label}</label>
    <SpeechToText
      type="text"
      name={name}
      placeholder={label}
      value={value}
      className={className}
      onChange={onChange}
      required={required}
      lang={lang}
    />
  </div>
);

export default AddNotes;
