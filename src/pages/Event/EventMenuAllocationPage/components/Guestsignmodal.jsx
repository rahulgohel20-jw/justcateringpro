import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { CustomModal } from "../../../../components/custom-modal/CustomModal";
import {
  getallguestsign,
  addupdateguesign,
  getreportguestsign,
} from "../../../../services/apiServices";

const emptyRow = () => ({
  id: `row_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  particulars: "",
  person: "",
  extra: "",
});

const normalizeFunctionId = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : -1;
};

const GuestSignModal = ({
  open,
  onClose,
  initialRows = [],
  onSave = () => {},
  saving = false,
  eventId,
  eventFunctionId,
  eventFunctions = [],
}) => {
  const [rows, setRows] = useState(
    initialRows.length > 0 ? initialRows : [emptyRow()],
  );
  const [selectedFunctionId, setSelectedFunctionId] = useState(
    normalizeFunctionId(eventFunctionId),
  );
  const [loading, setLoading] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isCompanyDetails, setIsCompanyDetails] = useState(true);
  const [reportGenerating, setReportGenerating] = useState(false);
const [isDirty, setIsDirty] = useState(false);
const [originalRows, setOriginalRows] = useState([]);
  const fetchGuestSignRows = async (functionId) => {
    if (!eventId) {
      setRows([emptyRow()]);
      return;
    }

    try {
      setLoading(true);
      const requestFunctionId = normalizeFunctionId(functionId);
      const res = await getallguestsign(requestFunctionId, eventId);
      const success = res?.data?.success ?? res?.success ?? true;
      const msg = res?.data?.msg || res?.msg;

      if (!success && msg) {
        Swal.fire({
          icon: "warning",
          title: "Guest Signature",
          text: msg,
          confirmButtonColor: "#2563eb",
        });
      }

      const payload = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : [];

     const mapped = payload.length
  ? payload.map((row) => ({
      id: row.id ?? `row_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      particulars: row.particulars ?? "",
      person: row.persons ?? row.person ?? "",
      extra: row.extra ?? "",
    }))
  : [emptyRow()];

setRows(mapped);
setOriginalRows(mapped);
setIsDirty(false);

      setRows(mapped);
    }  catch (err) {
  console.error("Failed to load guest signature rows:", err);
  const fallback = [emptyRow()];
  setRows(fallback);
  setOriginalRows(fallback);
  setIsDirty(false);
} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !eventId) return;

    const nextFunctionId =
      selectedFunctionId === -1
        ? -1
        : normalizeFunctionId(
            selectedFunctionId > 0 ? selectedFunctionId : eventFunctionId,
          );

    setSelectedFunctionId((prev) => (prev === nextFunctionId ? prev : nextFunctionId));
    fetchGuestSignRows(nextFunctionId);
  }, [open, eventId, eventFunctionId, selectedFunctionId]);

  const handleGenerateGuestSignatureReport = async () => {
    if (!eventId) {
      Swal.fire({
        icon: "warning",
        title: "Guest Signature",
        text: "Event is required to generate the report.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setReportGenerating(true);

    try {
      const userId = Number(localStorage.getItem("userId") || 0);
      const res = await getreportguestsign(
        Number(eventId),
        isCompanyDetails ? 1 : 0,
        userId,
      );

      const responseData = res?.data ?? res ?? {};
      const fileUrl =
        (typeof responseData === "string" && responseData.startsWith("http"))
          ? responseData
          : responseData?.fileUrl ||
            responseData?.report_path ||
            responseData?.data ||
            res?.fileUrl ||
            res?.report_path;

      if (fileUrl) {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
        setReportModalOpen(false);
        return;
      }

      Swal.fire({
        icon: "error",
        title: "Guest Signature",
        text: res?.data?.msg || "Failed to generate guest signature report.",
        confirmButtonColor: "#2563eb",
      });
    } catch (err) {
      console.error("Failed to generate guest signature report:", err);
      Swal.fire({
        icon: "error",
        title: "Guest Signature",
        text: err?.response?.data?.msg || "Failed to generate guest signature report.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setReportGenerating(false);
    }
  };

  const handleFieldChange = (id, field, value) => {
  setRows((prev) =>
    prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
  );
  setIsDirty(true);
};

const handleAddRow = () => {
  if (!selectedFunctionId || selectedFunctionId === -1) {
    Swal.fire({
      icon: "warning",
      title: "Guest Signature",
      text: "Please select any one function.",
      confirmButtonColor: "#2563eb",
    });
    return;
  }
  setRows((prev) => [...prev, emptyRow()]);
  setIsDirty(true);
};

const handleRemoveRow = (id) => {
  setRows((prev) => {
    const next = prev.filter((r) => r.id !== id);
    return next.length > 0 ? next : [emptyRow()];
  });
  setIsDirty(true);
};

 

 

  const handleSave = async () => {
    if (!eventId) {
      return;
    }

    const cleaned = rows.filter(
      (r) => (r.particulars || "").trim() || r.person !== "" || r.extra !== "",
    );

   

    const saveFunctionId =
      selectedFunctionId > 0 ? selectedFunctionId : normalizeFunctionId(eventFunctionId);

    const payload = cleaned.map((row) => ({
      id: Number.isFinite(Number(row.id)) && Number(row.id) > 0 ? Number(row.id) : -1,
      eventFunctionId: Number(saveFunctionId),
      eventId: Number(eventId),
      particulars: (row.particulars || "").trim(),
      persons: Number(row.person || 0) || 0,
      extra: Number(row.extra || 0) || 0,
      userId: Number(localStorage.getItem("userId") || 0),
    }));

    try {
      const res = await addupdateguesign(
        Number(eventId),
        Number(saveFunctionId),
        payload,
      );
      const responseData = res?.data ?? res ?? {};
      const success = responseData.success !== false;
      const msg = responseData.msg || responseData.message || "Guest signature saved successfully.";

      if (!success) {
        Swal.fire({
          icon: "warning",
          title: "Guest Signature",
          text: msg || "Guest signature not found.",
          confirmButtonColor: "#2563eb",
        });
        return;
      }

      const savedRows = Array.isArray(responseData.data)
        ? responseData.data
        : Array.isArray(responseData)
          ? responseData
          : [];

      if (savedRows.length) {
        const updatedRows = savedRows.map((row) => ({
          ...row,
          id: row.id ?? -1,
          particulars: row.particulars ?? "",
          person: row.persons ?? row.person ?? "",
          extra: row.extra ?? 0,
        }));

        setRows(updatedRows.length ? updatedRows : [emptyRow()]);
      }

      Swal.fire({
        icon: "success",
        title: "Guest Signature",
        text: msg,
        timer: 1500,
        showConfirmButton: false,
      });

      onSave?.(payload);
      onClose();
    } catch (err) {
      console.error("Failed to save guest signature:", err);
      Swal.fire({
        icon: "error",
        title: "Guest Signature",
        text: err?.response?.data?.msg || err?.message || "Failed to save guest signature details.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Guest Signature"
      width={720}
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-success text-white text-sm font-medium "
          >
            Print
          </button>
         <button
  type="button"
  disabled={saving || loading || !selectedFunctionId || selectedFunctionId === -1 || !eventId || !isDirty}
  onClick={handleSave}
  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
>
  {saving || loading ? "Saving..." : "Save"}
</button>
        </div>
      }
    >
      <div className="mb-4">
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
          Select Function
        </label>
        <select
          value={selectedFunctionId}
          onChange={(e) => setSelectedFunctionId(Number(e.target.value))}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value={-1}>All Function</option>
          {eventFunctions.map((func) => (
            <option key={func.id} value={func.id}>
              {func.name || func.function?.nameEnglish || `Function ${func.id}`}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Information
        </span>
        <button
          type="button"
          onClick={handleAddRow}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-blue-50 transition-colors"
        >
          <Plus size={14} /> Add Row
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase">
                Particulars
              </th>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase w-32">
                Person
              </th>
              <th className="px-3 py-2 text-left text-xs font-bold text-gray-500 uppercase w-32">
                Extra
              </th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-gray-100">
                <td className="px-2 py-2">
                <textarea
  value={row.particulars}
  onChange={(e) =>
    handleFieldChange(row.id, "particulars", e.target.value)
  }
  placeholder="Enter particulars..."
  rows={1}
  disabled={selectedFunctionId === -1}
  className="w-full border border-gray-400 rounded-lg px-2 py-1.5 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
/>
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={row.person}
                    onChange={(e) =>
                      handleFieldChange(row.id, "person", e.target.value)
                    }
                    className="w-full border border-gray-400 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </td>
                <td className="px-2 py-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={row.extra}
                    onChange={(e) =>
                      handleFieldChange(row.id, "extra", e.target.value)
                    }
                    className="w-full border border-gray-400 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </td>
                <td className="px-2 py-2 text-center">
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.id)}
                    className="text-red-500 hover:bg-red-50 rounded p-1"
                    title="Remove row"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reportModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Guest Signature Report
            </h3>

            <div className="flex items-center justify-between text-sm font-medium text-gray-700">
              <span>With Company Details</span>
              <button
                type="button"
                role="switch"
                aria-checked={isCompanyDetails}
                onClick={() => setIsCompanyDetails((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
                  isCompanyDetails ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                    isCompanyDetails ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateGuestSignatureReport}
                disabled={reportGenerating}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {reportGenerating ? "Generating..." : "Generate Report"}
              </button>
            </div>
          </div>
        </div>
      )}
    </CustomModal>
  );
};

export default GuestSignModal;
export { GuestSignModal };