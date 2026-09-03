import { useState, useEffect } from "react";
import { Addleadsource, updateLeadSource } from "@/services/apiServices";
import Swal from "sweetalert2";

const AddSource = ({ isOpen, onClose, editData = null, onSuccess }) => {
  const [sourceName, setSourceName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");

  const isEditMode = !!editData;

  useEffect(() => {
    if (editData) {
      setSourceName(editData.SourceName || "");
    } else {
      setSourceName("");
    }
    setError("");
  }, [editData, isOpen]);

  const handleClose = () => {
    setSourceName("");
    setError("");
    onClose(false);
  };

  const handleSubmit = async () => {
    if (!sourceName.trim()) return setError("Source name is required.");

    setError("");
    setLoading(true);

    try {
      const res = isEditMode
        ? await updateLeadSource(
            editData.leadSourceId,
            sourceName.trim(),
            userId,
          )
        : await Addleadsource(sourceName.trim(), userId);
      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text:
            res?.data?.msg ||
            `Source ${isEditMode ? "updated" : "added"} successfully`,
          confirmButtonColor: "#2563eb",
        });
        onSuccess?.();
        handleClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text:
            res?.data?.msg ||
            `Failed to ${isEditMode ? "update" : "add"} source.`,
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.message ||
          `Failed to ${isEditMode ? "update" : "add"} source. Please try again.`,
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">
            {isEditMode ? "Edit Source" : "Add Source"}
          </h2>
          <button
            onClick={handleClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-500 mb-1.5">
            Source Name
          </label>
          <input
            type="text"
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="e.g. website, referral, etc."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {error && <p className="text-xs text-red-500 mb-4">{error}</p>}

        <div className="flex justify-end gap-2.5">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg disabled:opacity-60"
          >
            {loading
              ? isEditMode
                ? "Updating..."
                : "Adding..."
              : isEditMode
                ? "Update Source"
                : "Add Source"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSource;
