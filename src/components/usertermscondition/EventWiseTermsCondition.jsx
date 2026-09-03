import { useState, useEffect, useRef } from "react";
import { ADDupadteeventwisetermscondition, GETALleventwisetermcondition, Translateapi, AddLogs  } from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl  } from "react-intl";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputBox";
import { Select } from "antd";

const EventWiseTermsCondition = ({
  isModalOpen,
  setIsModalOpen,
  refreshData = () => {},
  selectedEvent,   
  eventId, 
}) => {
  if (!isModalOpen) return null;
  const intl = useIntl();
  const getLangConfig = () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth-storage"));
      const lang = auth?.state?.user?.lang || "Gujarati";
      const langMap = {
        Gujarati:  { label: "Name (ગુજરાતી)", placeholder: "ગુજરાતી નામ",  lng: "gu", apiKey: "gujarati" },
        Tamil:     { label: "Name (தமிழ்)",   placeholder: "தமிழ் பெயர்",  lng: "ta", apiKey: "ta"       },
        Telugu:    { label: "Name (తెలుగు)",  placeholder: "తెలుగు పేరు",  lng: "te", apiKey: "te"       },
        Malayalam: { label: "Name (മലയാളം)",  placeholder: "മലയാളം പേര്",  lng: "ml", apiKey: "ml"       },
        Marathi:   { label: "Name (मराठी)",   placeholder: "मराठी नाव",    lng: "mr", apiKey: "mr"       },
      };
      return langMap[lang] || langMap["Gujarati"];
    } catch {
      return { label: "Name (ગુજરાતી)", placeholder: "ગુજરાતી નામ", lng: "gu", apiKey: "gujarati" };
    }
  };

  const langConfig = getLangConfig();

  const emptyRow = { description: "", descriptionGujarati: "", descriptionHindi: "", eventTermsConditionId: 0 };

  const initialFormState = {
    nameEnglish: "Menu Report",
    nameGujarati: "",
    nameHindi: "",
    features: [{ ...emptyRow }],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [debounceTimers, setDebounceTimers] = useState({});
  const [nameDebounceTimer, setNameDebounceTimer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showRegionalLangs, setShowRegionalLangs] = useState(false);
  const [translatingCount, setTranslatingCount] = useState(0);
  const removedDescriptionsRef = useRef([]);
  const initialFormDataRef = useRef(null);

const userEmail = (() => {
  try {
    return (
      JSON.parse(localStorage.getItem("auth-storage"))?.state?.user?.email || ""
    );
  } catch {
    return "";
  }
})();

  // ─── Translate name ───────────────────────────────────────────────────────
  const handleModuleChange = (value) => {
  setFormData((prev) => ({ ...prev, nameEnglish: value || "", nameGujarati: "", nameHindi: "" }));
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

  const handleNameChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ─── Translate description rows ───────────────────────────────────────────
 const triggerTranslate = (text, index) => {
  if (!text?.trim()) return;
  if (debounceTimers[index]) clearTimeout(debounceTimers[index]);
  const timer = setTimeout(() => {
    setTranslatingCount((c) => c + 1);
    Translateapi(text)
      .then((res) => {
        setFormData((prev) => {
          const updated = [...prev.features];
          updated[index] = {
            ...updated[index],
            descriptionGujarati: res.data[langConfig.apiKey] || "",
            descriptionHindi: res.data.hindi || "",
          };
          return { ...prev, features: updated };
        });
      })
      .catch((err) => console.error("Translation error:", err))
      .finally(() => setTranslatingCount((c) => c - 1));
  }, 500);
  setDebounceTimers((prev) => ({ ...prev, [index]: timer }));
};

  // ─── Row management ───────────────────────────────────────────────────────
  const addRow = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, { ...emptyRow }] }));
  };

  const removeRow = (index) => {
  setFormData((prev) => {
    const removed = prev.features[index];
    if (removed?.description?.trim()) {
      removedDescriptionsRef.current.push(removed.description.trim());
    }
    return { ...prev, features: prev.features.filter((_, i) => i !== index) };
  });
};

  // ─── Load existing data via GET ───────────────────────────────────────────
useEffect(() => {
  if (!isModalOpen || !eventId) return;

  setLoading(true);
  removedDescriptionsRef.current = [];
  GETALleventwisetermcondition(eventId)
    .then((res) => {
      const rawData = res?.data?.data || res?.data || [];
      const data = Array.isArray(rawData) && rawData.length > 0 ? rawData[0] : null;

      if (data && (data.nameEnglish || data.features?.length > 0)) {
        const loaded = {
          id: data.id || 0,
          nameEnglish: data.nameEnglish || "Menu Report",
          nameGujarati: data.nameGujarati || "",
          nameHindi: data.nameHindi || "",
          features:
            data.features?.length > 0
              ? data.features.map((f) => ({
                  description: f.description || "",
                  descriptionGujarati: f.descriptionGujarati || "",
                  descriptionHindi: f.descriptionHindi || "",
                  eventTermsConditionId: f.eventTermsConditionId || f.id || 0,
                }))
              : [{ ...emptyRow }],
        };
        setFormData(loaded);
        initialFormDataRef.current = JSON.parse(JSON.stringify(loaded)); // ← add
      } else {
        setFormData(initialFormState);
        initialFormDataRef.current = JSON.parse(JSON.stringify(initialFormState)); // ← add
        translateDefault();
      }
    })
    .catch(() => {
      setFormData(initialFormState);
      initialFormDataRef.current = JSON.parse(JSON.stringify(initialFormState)); // ← add
      translateDefault();
    })
    .finally(() => setLoading(false));

  setErrors({});
}, [isModalOpen, eventId]);

  const translateDefault = () => {
  setTranslatingCount((c) => c + 1);
  Translateapi("Menu Report")
    .then((res) => {
      setFormData((prev) => ({
        ...prev,
        nameGujarati: res.data[langConfig.apiKey] || "",
        nameHindi: res.data.hindi || "",
      }));
    })
    .catch((err) => console.error("Translation error:", err))
    .finally(() => setTranslatingCount((c) => c - 1));
};



const buildTermsChangeSummary = (prev, current, removedDescriptions = []) => {
  if (!prev) return "Initial save — no prior data to compare.";

  const parts = [];

  if ((prev.nameEnglish || "") !== (current.nameEnglish || "")) {
    parts.push(`Module Name: "${prev.nameEnglish || ""}" → "${current.nameEnglish || ""}"`);
  }

  const prevRows = (prev.features || []).filter((f) => (f.description || "").trim() !== "");
  const currRows = (current.features || []).filter((f) => (f.description || "").trim() !== "");

  const added = [];
  const changed = [];

  currRows.forEach((row) => {
    const key = row.eventTermsConditionId || null;
    const prevRow = key ? prevRows.find((p) => p.eventTermsConditionId === key) : null;

    if (!prevRow) {
      added.push(`"${row.description}"`);
      return;
    }

    if ((prevRow.description || "") !== (row.description || "")) {
      changed.push(`"${prevRow.description}" → "${row.description}"`);
    }
  });

  if (added.length) parts.push(`Descriptions Added: ${added.join(", ")}`);
  if (removedDescriptions.length) parts.push(`Descriptions Removed: ${removedDescriptions.map((d) => `"${d}"`).join(", ")}`);
  if (changed.length) parts.push(`Descriptions Changed: ${changed.join(", ")}`);

  return parts.length ? parts.join(" | ") : "No changes detected.";
};



  // ─── Submit ───────────────────────────────────────────────────────────────
 const handleSubmit = async () => {
  if (!formData.nameEnglish) {
    Swal.fire(
      intl.formatMessage({ id: "USER.EVENT_TERMS.REQUIRED_TITLE", defaultMessage: "Required" }),
      intl.formatMessage({ id: "USER.EVENT_TERMS.SELECT_MODULE_TEXT", defaultMessage: "Please select a module name" }),
      "warning"
    );
    return;
  }

  const userId = localStorage.getItem("userId");
  const payload = {
    id: formData.id || -1,
    eventId: Number(eventId),
    nameEnglish: formData.nameEnglish,
    nameGujarati: formData.nameGujarati,
    nameHindi: formData.nameHindi,
    features: formData.features
      .filter((item) => item.description.trim() !== "")
      .map((item) => ({
        description: item.description,
        descriptionGujarati: item.descriptionGujarati,
        descriptionHindi: item.descriptionHindi,
        eventTermsConditionId: item.eventTermsConditionId || 0,
      })),
    userId: Number(userId),
  };

  try {
    const res = await ADDupadteeventwisetermscondition(payload);

    if (res?.data?.success === false && res.data.msg?.includes("exists")) {
      Swal.fire(
        intl.formatMessage({ id: "USER.EVENT_TERMS.ALREADY_EXISTS_TITLE", defaultMessage: "Already Exists" }),
        intl.formatMessage({ id: "USER.EVENT_TERMS.ALREADY_EXISTS_TEXT", defaultMessage: "Terms with this name already exists." }),
        "warning"
      );
      return;
    }
    if (res?.data?.success === false) {
      Swal.fire(
        intl.formatMessage({ id: "USER.EVENT_TERMS.FAILED_TITLE", defaultMessage: "Failed" }),
        res.data.msg || intl.formatMessage({ id: "USER.EVENT_TERMS.COULD_NOT_SAVE", defaultMessage: "Could not save" }),
        "error"
      );
      return;
    }

    // ── Non-blocking activity log ──
    try {
      const isUpdate = !!(formData.id && formData.id !== 0);
      const changeSummary = buildTermsChangeSummary(initialFormDataRef.current, formData,removedDescriptionsRef.current,);

      await AddLogs({
        id: 0,
        eventId: Number(eventId) || 0,
        description: `Terms & Conditions ${isUpdate ? "updated" : "saved"} | Module: ${
          formData.nameEnglish || "-"
        } | Saved By: ${userEmail || "Unknown User"} | Total Rows: ${
          formData.features.filter((f) => f.description.trim() !== "").length
        } | Changes: ${changeSummary}`,
        eventType: isUpdate ? "Terms & Conditions Update" : "Terms & Conditions Save",
        user: userEmail,
      });
      removedDescriptionsRef.current = [];
    } catch (logErr) {
      console.error("Log failed (non-blocking):", logErr);
    }

    Swal.fire(
      intl.formatMessage({ id: "USER.EVENT_TERMS.SUCCESS_TITLE", defaultMessage: "Success!" }),
      intl.formatMessage({ id: "USER.EVENT_TERMS.SAVED_TEXT", defaultMessage: "Terms & Conditions saved successfully" }),
      "success"
    );
    setFormData(initialFormState);
    setIsModalOpen(false);
    refreshData();
  } catch (err) {
    console.error("API Error:", err);
    Swal.fire(
      intl.formatMessage({ id: "USER.EVENT_TERMS.ERROR_TITLE", defaultMessage: "Error" }),
      err.response?.data?.msg || intl.formatMessage({ id: "USER.EVENT_TERMS.DATABASE_ERROR", defaultMessage: "Database error" }),
      "error"
    );
  }
};
  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#F2F7FB] rounded-xl w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-black">
  {selectedEvent?.id ? (
    <FormattedMessage id="USER.EVENT_TERMS.EDIT_TITLE" defaultMessage="Edit Terms & Condition" />
  ) : (
    <FormattedMessage id="USER.EVENT_TERMS.ADD_TITLE" defaultMessage="Create Terms & Condition" />
  )}
</h2>
          <button onClick={() => setIsModalOpen(false)} className="text-2xl text-gray-600">&times;</button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-10 text-gray-500"><FormattedMessage id="USER.EVENT_TERMS.LOADING" defaultMessage="Loading..." /></div>
        ) : (
          <>
            {/* Name Fields */}
            {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
             
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
                    { value: "Menu Report", label: "Menu Report" },
                  ]}
                />
              </div>

              
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

             
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name (हिंदी)</label>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="हिंदी नाम"
                  value={formData.nameHindi}
                  onChange={(e) => handleNameChange("nameHindi", e.target.value)}
                />
              </div>
            </div> */}

      
<div className="mb-3">
  <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
    <label className="text-black font-medium"><FormattedMessage id="USER.EVENT_TERMS.DESCRIPTIONS_LABEL" defaultMessage="Descriptions" /></label>

    <div className="flex items-center gap-3">
   
      <label className="flex items-center gap-2 cursor-pointer select-none">
       <span className="text-sm font-medium text-gray-700">
  <FormattedMessage
    id="USER.EVENT_TERMS.SHOW_REGIONAL_LABEL"
    defaultMessage="Show हिंदी & {regionalLang}"
    values={{ regionalLang: langConfig.label.replace("Name ", "") }}
  />
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
        <FormattedMessage id="USER.EVENT_TERMS.ADD_ROW_BTN" defaultMessage="+ Add Row" />
      </button>
    </div>
  </div>

  {showRegionalLangs ? (
    // Full multi-lang cards — unchanged
    <div className="space-y-4">
      {formData.features.map((item, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-3 bg-white relative">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              <FormattedMessage id="USER.EVENT_TERMS.ROW_LABEL" defaultMessage="Row {number}" values={{ number: index + 1 }} />
            </span>
            {formData.features.length > 1 && (
              <button type="button" onClick={() => removeRow(index)}>
                <i className="ki-filled ki-trash text-danger"></i>
              </button>
            )}
          </div>

          <MultiLangInputBox
            keyPrefix={`row-${index}-`}
            label="Description"
            type="textarea"
            formData={{
              description: item.description,
              description_gujarati: item.descriptionGujarati,
              description_hindi: item.descriptionHindi,
            }}
            setFormData={(updated) => {
              setFormData((prev) => {
                const updatedRows = [...prev.features];
                updatedRows[index] = {
                  ...updatedRows[index],
                  description: updated.description,
                  descriptionGujarati: updated.description_gujarati,
                  descriptionHindi: updated.description_hindi,
                };
                return { ...prev, features: updatedRows };
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
   
<div className="border border-gray-200 rounded-lg bg-white divide-y divide-gray-100 overflow-hidden">
  {formData.features.map((item, index) => (
    <div key={index} className="flex items-start gap-3 p-4">
      <span className="flex-shrink-0 w-7 h-7 mt-0.5 rounded-full bg-gray-100 text-gray-500 text-sm font-semibold flex items-center justify-center">
        {index + 1}
      </span>
      <textarea
  rows={3}
  className="input flex-1 resize-y py-2.5 min-h-[80px]"
  placeholder={intl.formatMessage({ id: "USER.EVENT_TERMS.ENTER_DESCRIPTION_PLACEHOLDER", defaultMessage: "Enter description" })}
  value={item.description}
  onChange={(e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const updatedRows = [...prev.features];
      updatedRows[index] = { ...updatedRows[index], description: value };
      return { ...prev, features: updatedRows };
    });
    triggerTranslate(value, index);
  }}
/>
{formData.features.length > 1 && (
  <button
    type="button"
    onClick={() => removeRow(index)}
    className="flex-shrink-0 mt-0.5 p-1.5 rounded hover:bg-gray-100"
    title={intl.formatMessage({ id: "USER.EVENT_TERMS.REMOVE_ROW_TITLE", defaultMessage: "Remove row" })}
  >
    <i className="ki-filled ki-trash text-danger"></i>
  </button>
)}
    </div>
  ))}
</div>
  )}
</div>

            {/* Footer */}
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
  {selectedEvent?.id ? (
    <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
  ) : (
    <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
  )}
</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventWiseTermsCondition;