import { useState, useEffect, useRef } from "react";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputBox/index";
import { Translateapi } from "@/services/apiServices";

const RenameItemCat = ({ label, initialValues = {}, onClose, onSave, onLiveChange }) => {
  const [formData, setFormData] = useState({
    english: initialValues.english || "",
    hindi: initialValues.hindi || "",
    gujarati: initialValues.gujarati || "",
  });
  const translateDebounceRef = useRef(null);
  const syncDebounceRef = useRef(null);

  // Independent guards — one per effect, so one flipping doesn't affect the other
  const isFirstRenderTranslate = useRef(true);
  const isFirstRenderSync = useRef(true);

  // ── Translation: only fires on real English edits, not initial mount ──
  useEffect(() => {
    if (isFirstRenderTranslate.current) {
      isFirstRenderTranslate.current = false;
      return;
    }

    if (translateDebounceRef.current) clearTimeout(translateDebounceRef.current);

    if (!formData.english?.trim()) {
      setFormData((prev) => ({ ...prev, hindi: "", gujarati: "" }));
      return;
    }

    translateDebounceRef.current = setTimeout(async () => {
      try {
        const res = await Translateapi(formData.english);
        const data = res?.data || {};
        setFormData((prev) => ({
          ...prev,
          hindi: data.hindi || "",
          gujarati: data.gujarati || "",
        }));
      } catch (err) {
        console.error("Translation error:", err);
      }
    }, 500);

    return () => clearTimeout(translateDebounceRef.current);
  }, [formData.english]);

  // ── Auto-sync to parent state as the user types — never closes the modal ──
  useEffect(() => {
    if (isFirstRenderSync.current) {
      isFirstRenderSync.current = false;
      return;
    }

    if (syncDebounceRef.current) clearTimeout(syncDebounceRef.current);

    syncDebounceRef.current = setTimeout(() => {
      // Only pushes into app state — does NOT close the modal.
      onLiveChange?.({
        english: formData.english,
        hindi: formData.hindi,
        gujarati: formData.gujarati,
      });
    }, 400);

    return () => clearTimeout(syncDebounceRef.current);
  }, [formData.english, formData.hindi, formData.gujarati]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Rename — <span className="text-primary font-bold">{label}</span>
        </h2>

        <MultiLangInputBox
          formData={formData}
          setFormData={setFormData}
          label="Name"
          cols={1}
          keys={{ english: "english", regional: "gujarati", hindi: "hindi" }}
        />

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            Close
          </button>
          <button
            type="button"
            disabled={!formData.english?.trim()}
            onClick={() => {
              // Explicit final flush + close — only user action closes the modal
              onSave({ english: formData.english, hindi: formData.hindi, gujarati: formData.gujarati });
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-primary text-white text-sm hover:opacity-90 disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameItemCat;