import { useEffect, useRef, useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import CheckboxButtonComponent from "@/components/form-components/CheckboxButtonComponent";
import MultiLangInputBox from "../../.././components/form-inputs/MultiLangInputBox";
import { Translateapi, Addupdategroundtask } from "@/services/apiServices"; 
import { getLangConfig } from "@/utils/langConfig";

const AddTask = ({ isModalOpen, setIsModalOpen, editData, onSuccess }) => {
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const formDataRef = useRef({});
  const hindiInteractedRef = useRef(false);
  const regionalInteractedRef = useRef(false);
  const debounceRef = useRef(null);

  const langConfig = getLangConfig();

  const typeOptions = [
    { label: "Labour", value: "LABOUR" },
    { label: "Outside", value: "OUTSIDE" },
    { label: "Chef", value: "CHEF" },
    // {label : "Inside" , value: " INSIDE"},

  ];

  useEffect(() => {
    formDataRef.current = formData || {};
  }, [formData]);

  const handleTypeChange = (value) => {
    setFormData({ ...formData, type: value });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
  
      setFormData({
        id: editData?.id || -1,
        titleEnglish: editData?.nameEnglish || "",
        titleRegional: editData?.nameGujarati || "",
        titleHindi: editData?.nameHindi || "",
        type: editData?.resourceType || "",
      });
      
      hindiInteractedRef.current = !!editData?.nameHindi;
      regionalInteractedRef.current = !!editData?.nameGujarati;
    } else {
      setFormData(null);
      hindiInteractedRef.current = false;
      regionalInteractedRef.current = false;
    }
  }, [isModalOpen, editData]);

 const handleFormDataChange = (next) => {
  const prev = formDataRef.current;

  if (next.titleRegional !== prev.titleRegional) {
    regionalInteractedRef.current = next.titleRegional?.trim() !== "";
  }
  if (next.titleHindi !== prev.titleHindi) {
    hindiInteractedRef.current = next.titleHindi?.trim() !== "";
  }
  setFormData(next);
};

useEffect(() => {
  const english = formData?.titleEnglish?.trim();

  if (!english) {
    regionalInteractedRef.current = false;
    hindiInteractedRef.current = false;
    return;
  }

  if (regionalInteractedRef.current && hindiInteractedRef.current) return;

  if (debounceRef.current) clearTimeout(debounceRef.current);

  debounceRef.current = setTimeout(async () => {
    try {
      const res = await Translateapi(english);
      const translations = res?.data || res;
      if (!translations) return;

      const updates = {};
      if (!regionalInteractedRef.current && translations.gujarati) {
        updates.titleRegional = translations.gujarati;
      }
      if (!hindiInteractedRef.current && translations.hindi) {
        updates.titleHindi = translations.hindi;
      }

      if (Object.keys(updates).length > 0) {
        setFormData((prevData) => ({ ...prevData, ...updates }));
      }
    } catch (err) {
      console.error("Translation failed:", err);
    }
  }, 500);

  return () => clearTimeout(debounceRef.current);
}, [formData?.titleEnglish, langConfig.lang]);

  const saveData = async () => {
  if (!formData?.titleEnglish || !formData?.type) return;

  const userId = localStorage.getItem("userId");

  const payload = {
    id: formData.id || 0,
    nameEnglish: formData.titleEnglish || "",
    nameGujarati: formData.titleRegional || "",
    nameHindi: formData.titleHindi || "",
    resourceType: formData.type || "",
    userId: Number(userId) || 0,
  };

  setSaving(true);
  try {
    const response = await Addupdategroundtask(payload);
    if (response?.data?.success !== false) {
      onSuccess?.(response?.data);
      setIsModalOpen(false);
    }
  } catch (err) {
    console.error("Error saving task:", err);
  } finally {
    setSaving(false);
  }
};

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="Add Task"
        width={560}
        footer={[
          <div className="flex justify-between" key={"footer-buttons"}>
            <button
              key="cancel"
              className="btn btn-light"
              onClick={handleModalClose}
              title="Cancel"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              key="save"
              className="btn btn-success"
              title="Save Task"
              onClick={saveData}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Task"}
            </button>
          </div>,
        ]}
      >
        <div className="flex flex-col gap-y-4">
          {/* Task Title — English / Regional / Hindi */}
          <MultiLangInputBox
            formData={formData || {}}
            setFormData={handleFormDataChange}
            label="Task Title"
            cols={1}
            keys={{
              english: "titleEnglish",
              regional: "titleRegional",
              hindi: "titleHindi",
            }}
          />

          {/* Type */}
          <div className="flex items-center justify-between">
            <label className="form-label">Type</label>
            <CheckboxButtonComponent
              options={typeOptions}
              onChange={handleTypeChange}
              value={formData && formData.type}
            />
          </div>
        </div>
      </CustomModal>
    )
  );
};

export default AddTask;