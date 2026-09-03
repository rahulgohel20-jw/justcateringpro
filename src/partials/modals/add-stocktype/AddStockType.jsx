import { useState, useEffect, useRef } from "react";
import { Package, X, Save } from "lucide-react";
import { FormattedMessage, useIntl } from "react-intl";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputBox";
import {
  Translateapi,
  AddStockType as AddStockTypeAPI,
  UpdateStockType,
  AddLogs,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";

const getUserEmail = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return "";
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.user?.email || "";
  } catch {
    return "";
  }
};

const getLogDescription = (status, name = "") => {
  switch (status) {
    case "ADD_SUCCESS":  return `Stock Type added successfully: [${name}]`;
    case "EDIT_SUCCESS": return `Stock Type updated successfully: [${name}]`;
    case "ADD_ERROR":    return `Failed to add Stock Type: [${name}]`;
    case "EDIT_ERROR":   return `Failed to update Stock Type: [${name}]`;
    default:             return "Stock Type action performed";
  }
};

const getEventType = (status) => {
  switch (status) {
    case "ADD_SUCCESS":  return "StockType_Add";
    case "EDIT_SUCCESS": return "StockType_Edit";
    case "ADD_ERROR":    return "StockType_Add_Error";
    case "EDIT_ERROR":   return "StockType_Edit_Error";
    default:             return "StockType";
  }
};

const AddStockType = ({ isOpen, onClose, refreshData, stockType }) => {
  const intl = useIntl();
  const langConfig = getLangConfig();
  const debounceRef = useRef(null);
  const userId = JSON.parse(localStorage.getItem("userId")) || 0;

  const [formData, setFormData] = useState({
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
    mainType: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (stockType) {
      setFormData({
        nameEnglish: stockType.nameEnglish || "",
        nameGujarati: stockType.nameGujarati || "",
        nameHindi: stockType.nameHindi || "",
          mainType: stockType.mainType ?? 0,
      });
    } else {
      setFormData({ nameEnglish: "", nameGujarati: "", nameHindi: "" ,  mainType: 0 });
    }
    setError("");
  }, [stockType, isOpen]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const sendLog = async (status, name = "") => {
    try {
      await AddLogs({
        description: getLogDescription(status, name),
        eventType: getEventType(status),
        id: Number(userId) || 0,
        user: getUserEmail(),
      });
    } catch (logErr) {
      console.error("Failed to save log:", logErr);
    }
  };

  const handleTranslate = async (text) => {
    try {
      if (!text.trim()) return;
      const res = await Translateapi(text);
      const { regional, hindi } = extractTranslations(res.data);
      setFormData((prev) => ({ ...prev, nameGujarati: regional, nameHindi: hindi }));
    } catch (err) {
      console.error("Translation failed", err);
    }
  };

  const handleSave = async () => {
    if (!formData.nameEnglish.trim()) {
      setError("English name is required.");
      return;
    }

    try {
      setLoading(true);
      const payload = { ...formData, userId };
      const isEdit = !!stockType?.stocktypeid;

      if (isEdit) {
        await UpdateStockType(stockType.stocktypeid, payload);
        await sendLog("EDIT_SUCCESS", formData.nameEnglish);
        Swal.fire({ icon: "success", title: "Updated!", timer: 1500, showConfirmButton: false });
      } else {
        await AddStockTypeAPI(payload);
        await sendLog("ADD_SUCCESS", formData.nameEnglish);
        Swal.fire({ icon: "success", title: "Added!", timer: 1500, showConfirmButton: false });
      }

      refreshData();
      onClose(false);
    } catch (err) {
      const isEdit = !!stockType?.stocktypeid;
      await sendLog(isEdit ? "EDIT_ERROR" : "ADD_ERROR", formData.nameEnglish);
      Swal.fire({ icon: "error", title: "Save Failed", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
      onClick={() => onClose(false)}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <Package size={18} />
            {stockType ? (
              <FormattedMessage id="STOCK_TYPE.EDIT" defaultMessage="Edit Stock Type" />
            ) : (
              <FormattedMessage id="STOCK_TYPE.ADD" defaultMessage="Add Stock Type" />
            )}
          </h2>
          <button className="text-gray-400 hover:text-gray-600" onClick={() => onClose(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-4">
          <MultiLangInputBox
            label="Name"
            formData={formData}
            setFormData={(updated) => {
              const englishChanged = updated.nameEnglish !== formData.nameEnglish;
              setFormData(updated);

              if (englishChanged && !stockType) {
                if (debounceRef.current) clearTimeout(debounceRef.current);
                if (!updated.nameEnglish.trim()) {
                  setFormData((prev) => ({ ...prev, nameGujarati: "", nameHindi: "" }));
                  return;
                }
                debounceRef.current = setTimeout(() => {
                  handleTranslate(updated.nameEnglish);
                }, 500);
              }
            }}
            cols={1}
            keys={{
              english: "nameEnglish",
              regional: "nameGujarati",
              hindi: "nameHindi",
            }}
            error={error}
          />
          {/* Type dropdown */}
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
  <select
    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    value={formData.mainType}
    onChange={(e) => setFormData((prev) => ({ ...prev, mainType: Number(e.target.value) }))}
  >
    <option value={0}>Godown</option>
    <option value={1}>Kitchen</option>
  </select>
</div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t bg-gray-50 rounded-b-xl">
          <button
            className="flex items-center gap-2 px-5 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:opacity-90 transition disabled:opacity-60"
            onClick={handleSave}
            disabled={loading}
          >
            <Save size={16} />
            {loading ? (
              <FormattedMessage id="COMMON.SAVING" defaultMessage="Saving..." />
            ) : stockType ? (
              <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
            ) : (
              <FormattedMessage id="COMMON.ADD" defaultMessage="Add" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStockType;