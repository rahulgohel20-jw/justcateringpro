import { useState, useEffect } from "react";
import { AddandUpdateTerms, Translateapi  } from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputBox";
import { Select } from "antd";



const AddUserTerms = ({
  isModalOpen,
  setIsModalOpen,
  refreshData = () => {},
  selectedEvent,
}) => {
  if (!isModalOpen) return null;


  const getLangConfig = () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth-storage"));
      const lang = auth?.state?.user?.lang || "Gujarati";
      const langMap = {
        Gujarati:  { label: "Name (ગુજરાતી)", placeholder: "ગુજરાતી નામ",  descLabel: "Gujarati", descPlaceholder: "ગુજરાતી", lng: "gu", apiKey: "gujarati" },
        Tamil:     { label: "Name (தமிழ்)",   placeholder: "தமிழ் பெயர்",  descLabel: "Tamil",    descPlaceholder: "தமிழ்",   lng: "ta", apiKey: "ta"       },
        Telugu:    { label: "Name (తెలుగు)",  placeholder: "తెలుగు పేరు",  descLabel: "Telugu",   descPlaceholder: "తెలుగు",  lng: "te", apiKey: "te"       },
        Malayalam: { label: "Name (മലയാളം)",  placeholder: "മലയാളം പേര്",  descLabel: "Malayalam",descPlaceholder: "മലയാളം",  lng: "ml", apiKey: "ml"       },
        Marathi:   { label: "Name (मराठी)",   placeholder: "मराठी नाव",    descLabel: "Marathi",  descPlaceholder: "मराठी",   lng: "mr", apiKey: "mr"       },
      };
      return langMap[lang] || langMap["Gujarati"];
    } catch {
      return { label: "Name (ગુજરાતી)", placeholder: "ગુજરાતી નામ", descLabel: "Gujarati", descPlaceholder: "ગુજરાતી", lng: "gu", apiKey: "gujarati" };
    }
  };

  const langConfig = getLangConfig();

  const initialFormState = {
    nameEnglish: "",
  nameGujarati: "",
  nameHindi: "",
    termsAndConditionFeatures: [
      { description: "", description_gujarati: "", description_hindi: "" },
    ],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [debounceTimers, setDebounceTimers] = useState({});
  const [showRegionalLangs, setShowRegionalLangs] = useState(false);
const [nameDebounceTimer, setNameDebounceTimer] = useState(null);
const [translatingCount, setTranslatingCount] = useState(0);

const handleModuleChange = (value) => {
  setFormData((prev) => ({
    ...prev,
    nameEnglish: value || "",
    nameGujarati: "",
    nameHindi: "",
  }));

  if (!value) return;

  if (nameDebounceTimer) clearTimeout(nameDebounceTimer);
  const timer = setTimeout(() => {
    setTranslatingCount((c) => c + 1);
    Translateapi(value)
      .then((res) => {
        setFormData((prev) => ({
          ...prev,
          nameGujarati: res.data[langConfig.apiKey] || "",
          nameHindi: res.data.hindi || "",
        }));
      })
      .catch((err) => console.error("Translation error:", err))
      .finally(() => setTranslatingCount((c) => c - 1));
  }, 300);
  setNameDebounceTimer(timer);
};

 const triggerTranslate = (text, index) => {
  if (!text?.trim()) return;
  if (debounceTimers[index]) clearTimeout(debounceTimers[index]);

  const timer = setTimeout(() => {
    setTranslatingCount((c) => c + 1);
    Translateapi(text)
      .then((res) => {
        setFormData((prev) => {
          const updated = [...prev.termsAndConditionFeatures];
          updated[index] = {
            ...updated[index],
            description_gujarati: res.data[langConfig.apiKey] || "",
            description_hindi: res.data.hindi || "",
          };
          return { ...prev, termsAndConditionFeatures: updated };
        });
      })
      .catch((err) => console.error("Translation error:", err))
      .finally(() => setTranslatingCount((c) => c - 1));
  }, 500);

  setDebounceTimers((prev) => ({ ...prev, [index]: timer }));
};

  const handleDescriptionChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.termsAndConditionFeatures];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, termsAndConditionFeatures: updated };
    });

    // Only auto-translate when English field changes
    if (field === "description") {
      triggerTranslate(value, index);
    }
  };

  const addRow = () => {
    setFormData((prev) => ({
      ...prev,
      termsAndConditionFeatures: [
        ...prev.termsAndConditionFeatures,
        { description: "", description_gujarati: "", description_hindi: "" },
      ],
    }));
  };

  const removeRow = (index) => {
    setFormData((prev) => ({
      ...prev,
      termsAndConditionFeatures: prev.termsAndConditionFeatures.filter(
        (_, i) => i !== index,
      ),
    }));
  };

  useEffect(() => {
    if (selectedEvent) {
  setFormData({
    nameEnglish: selectedEvent.nameEnglish || "",
    nameGujarati: selectedEvent.nameGujarati || "",
    nameHindi: selectedEvent.nameHindi || "",
    termsAndConditionFeatures:
      selectedEvent.description?.length > 0
        ? selectedEvent.description.map((desc) =>
            typeof desc === "object"
              ? {
                  description: desc.description || "",
                  description_gujarati: desc.description_gujarati || "",
                  description_hindi: desc.description_hindi || "",
                }
              : {
                  description: desc,
                  description_gujarati: "",
                  description_hindi: "",
                },
          )
        : [{ description: "", description_gujarati: "", description_hindi: "" }],
  });
} else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [selectedEvent]);

  const handleSubmit = async () => {
   if (!formData.nameEnglish) {
  Swal.fire("Required", "Please select a module name", "warning");
  return;
}
    // if (
    //   formData.termsAndConditionFeatures.every(
    //     (item) => !item.description.trim(),
    //   )
    // ) {
    //   Swal.fire("Required", "Please add at least one description", "warning");
    //   return;
    // }

    const userId = localStorage.getItem("userId");
   const payload = {
  id: selectedEvent?.id || -1,
  nameEnglish: formData.nameEnglish,
  nameGujarati: formData.nameGujarati,
  nameHindi: formData.nameHindi,
  termsAndConditionFeatures: formData.termsAndConditionFeatures.filter(
    (item) => item.description.trim() !== "",
  ),
  userId: Number(userId),
};

    try {
      const res = await AddandUpdateTerms(payload);

      if (res?.data?.success === false && res.data.msg?.includes("exists")) {
        Swal.fire(
          "Already Exists",
          `Terms with this name already exists.`,
          "warning",
        );
        return;
      }

      if (res?.data?.success === false) {
        Swal.fire("Failed", res.data.msg || "Could not save", "error");
        return;
      }

      Swal.fire("Success!", "Terms & Conditions saved successfully", "success");
      setFormData(initialFormState);
      setIsModalOpen(false);
      refreshData(!selectedEvent?.id);
    } catch (err) {
      console.error("API Error:", err);
      Swal.fire("Error", err.response?.data?.msg || "Database error", "error");
    }
  };
const handleNameChange = (field, value) => {
  setFormData((prev) => ({ ...prev, [field]: value }));
};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#F2F7FB] rounded-xl w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">
            {selectedEvent ? (
              <FormattedMessage
                id="USER.MASTER.EDIT_EVENT_TYPE"
                defaultMessage="Edit Terms & Condition"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.ADD_EVENT_TYPE"
                defaultMessage="Create Terms & Condition"
              />
            )}
          </h2>
          <button
            onClick={() => setIsModalOpen(false)}
            className="text-2xl text-gray-600"
          >
            &times;
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
  {/* English */}
  <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Module Name <span className="text-red-500">*</span>
  </label>
  <Select
    className="w-full"
    style={{ height: 38 }}
    placeholder="Select Module"
    allowClear
    value={formData.nameEnglish || undefined}
    onChange={handleModuleChange}
    options={[
      { value: "Invoice", label: "Invoice" },
      { value: "Quotation", label: "Quotation" },
      { value: "Menu Report", label: "Menu Report" },
      {value : "Advance Receipts" , label :"Advance Receipts"}
    ]}
  />
</div>

  {/* Gujarati */}
  <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    {langConfig.label}         
  </label>
  <input
    type="text"
    className="input w-full"
    placeholder={langConfig.placeholder}  
    value={formData.nameGujarati}
    onChange={(e) => handleNameChange("nameGujarati", e.target.value)}
  />
</div>

  {/* Hindi */}
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Name (हिंदी)
    </label>
    <input
      type="text"
      className="input w-full"
      placeholder="हिंदी नाम"
      value={formData.nameHindi}
      onChange={(e) => handleNameChange("nameHindi", e.target.value)}
    />
  </div>
</div>

       
        {/* Descriptions */}
<div className="mb-3">
  <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
    <label className="text-black font-medium">Descriptions</label>

    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <span className="text-sm font-medium text-gray-700">
          Show हिंदी &amp; {langConfig.label.replace("Name ", "")}
        </span>
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={showRegionalLangs}
            onChange={() => setShowRegionalLangs((v) => !v)}
          />
          <div
            className={`w-9 h-5 rounded-full transition-colors ${showRegionalLangs ? "bg-primary" : "bg-gray-300"}`}
          />
          <div
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${showRegionalLangs ? "translate-x-4" : ""}`}
          />
        </div>
      </label>

      <button
        type="button"
        onClick={addRow}
        className="px-3 py-1.5 bg-green-500 text-white rounded-md text-sm"
      >
        + Add Row
      </button>
    </div>
  </div>

  {showRegionalLangs ? (
    // Full multi-lang cards
    <div className="space-y-4">
      {formData.termsAndConditionFeatures.map((item, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg p-3 bg-white relative"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Row {index + 1}
            </span>
            {formData.termsAndConditionFeatures.length > 1 && (
              <button type="button" onClick={() => removeRow(index)}>
                <i className="ki-filled ki-trash text-danger"></i>
              </button>
            )}
          </div>

          <MultiLangInputBox
            type="textarea"
            keyPrefix={`row-${index}-`}
            label="Description"
            formData={{
              description: item.description,
              description_gujarati: item.description_gujarati,
              description_hindi: item.description_hindi,
            }}
            setFormData={(updated) => {
              setFormData((prev) => {
                const updatedRows = [...prev.termsAndConditionFeatures];
                updatedRows[index] = {
                  ...updatedRows[index],
                  description: updated.description,
                  description_gujarati: updated.description_gujarati,
                  description_hindi: updated.description_hindi,
                };
                return { ...prev, termsAndConditionFeatures: updatedRows };
              });

              if (updated.description !== item.description) {
                triggerTranslate(updated.description, index);
              }
            }}
            cols={1}
            keys={{
              english: "description",
              regional: "description_gujarati",
              hindi: "description_hindi",
            }}
          />
        </div>
      ))}
    </div>
  ) : (
    // Simple single-language view
    <div className="border border-gray-200 rounded-lg bg-white divide-y divide-gray-100 overflow-hidden">
      {formData.termsAndConditionFeatures.map((item, index) => (
        <div key={index} className="flex items-start gap-3 p-4">
          <span className="flex-shrink-0 w-7 h-7 mt-0.5 rounded-full bg-gray-100 text-gray-500 text-sm font-semibold flex items-center justify-center">
            {index + 1}
          </span>
          <textarea
            rows={3}
            className="input flex-1 resize-y py-2.5 min-h-[80px]"
            placeholder="Enter description"
            value={item.description}
            onChange={(e) => {
              const value = e.target.value;
              handleDescriptionChange(index, "description", value);
            }}
          />
          {formData.termsAndConditionFeatures.length > 1 && (
            <button
              type="button"
              onClick={() => removeRow(index)}
              className="flex-shrink-0 mt-0.5 p-1.5 rounded hover:bg-gray-100"
              title="Remove row"
            >
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          )}
        </div>
      ))}
    </div>
  )}
</div>

        {/* Footer Buttons */}
        <div className="flex w-full justify-end mt-6 gap-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
          </button>
         <button
  type="button"
  className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
  onClick={handleSubmit}
  disabled={translatingCount > 0}
>
  {selectedEvent ? (
    <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
  ) : (
    <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
  )}
</button>
        </div>
      </div>
    </div>
  );
};

export default AddUserTerms;
