import { useState, useEffect } from "react";
import { addleadsubsource, updateLeadSubSource } from "@/services/apiServices";
import Swal from "sweetalert2";

const AddSubSource = ({
  isOpen,
  onClose,
  editData = null,
  onSuccess,
  sourceOptions = [],
}) => {
  const [leadSourceId, setLeadSourceId] = useState("");
  const [subSourceName, setSubSourceName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const userId = localStorage.getItem("userId");
  const isEditMode = !!editData;

  // Convert "21/02/2026 12:20:20" → "2026-02-21T12:20" for datetime-local input
  const parseToDateTimeLocal = (dateStr) => {
    if (!dateStr) return "";

    // If already in datetime-local format, return as-is
    if (dateStr.includes("T")) return dateStr.slice(0, 16);

    // Parse "DD/MM/YYYY HH:mm:ss"
    const [datePart, timePart] = dateStr.split(" ");
    if (!datePart || !timePart) return "";
    const [dd, mm, yyyy] = datePart.split("/");
    const [hh, min] = timePart.split(":");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  useEffect(() => {
    if (editData) {
      setLeadSourceId(editData.leadSourceId || "");
      setSubSourceName(editData.subSourceName || "");
      setEventDate(parseToDateTimeLocal(editData.dateTime || "")); // ✅ fix
      setDescription(editData.description || "");
    } else {
      setLeadSourceId("");
      setSubSourceName("");
      setEventDate("");
      setDescription("");
    }
    setError("");
  }, [editData, isOpen]);

  const handleClose = () => {
    onClose(false);
  };
  const formatDateTime = (dateTimeLocal) => {
    const date = new Date(dateTimeLocal);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${dd}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
  };
  const handleSubmit = async () => {
    if (!leadSourceId) return setError("Please select a source.");
    if (!subSourceName.trim()) return setError("Sub Source name is required.");
    if (!eventDate) return setError("Date & Time is required.");

    setError("");
    setLoading(true);

    try {
      const payload = {
        leadSourceId: Number(leadSourceId),
        name: subSourceName.trim(),
        dateTime: formatDateTime(eventDate), 
        description: description.trim(),
        userId:userId,
      };

      const res = isEditMode
        ? await updateLeadSubSource(editData.leadSubSourceId, payload)
        : await addleadsubsource(payload);

      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text:
            res?.data?.msg ||
            `Sub Source ${isEditMode ? "updated" : "added"} successfully`,
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
            `Failed to ${isEditMode ? "update" : "add"} sub source.`,
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Something went wrong. Please try again.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">
            {isEditMode ? "Edit Sub Source" : "Add Sub Source"}
          </h2>
          <button
            onClick={handleClose}
            className="text-2xl text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        {/* Source Dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1.5">
            Source
          </label>
          <select
            value={leadSourceId}
            onChange={(e) => setLeadSourceId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            <option value="">Select Source</option>
            {sourceOptions.map((src) => (
              <option key={src.leadSourceId} value={src.leadSourceId}>
                {src.sourceName}
              </option>
            ))}
          </select>
        </div>

        {/* Sub Source Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1.5">
            Sub Source Name
          </label>
          <input
            type="text"
            value={subSourceName}
            onChange={(e) => setSubSourceName(e.target.value)}
            placeholder="e.g. April Webinar"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* Date & Time */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1.5">
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1.5">
            Description <span className="text-gray-400">(Optional)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter details..."
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>

        {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

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
                ? "Update Sub Source"
                : "Add Sub Source"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubSource;
