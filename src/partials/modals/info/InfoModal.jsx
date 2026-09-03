import { useState, useEffect } from "react";
import { AddInfoAutoManualPO } from "../../../services/apiServices";
import Swal from "sweetalert2";

export default function InfoModal({ isOpen, onClose, data, onSuccess }) {
  const [form, setForm] = useState({
    challanNo: "",
    eventName: "",
    deliveryVenue: "",
    deliveryTime: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  if (isOpen && data) {
    setForm({
      challanNo: data?.challanNo || "",
      eventName: data?.eventName || "",
      deliveryVenue: data?.deliveryVenue || "",
      deliveryTime: data?.deliveryTime || "",
      remarks: data?.remarks || "",
    });
  }
}, [data, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        challanNo: form.challanNo,
        deliveryTime: form.deliveryTime,
        deliveryVenue: form.deliveryVenue,
        eventName: form.eventName,
        remarks: form.remarks,
        sotPoId: data?.id || data?.sotPoId || 0,
      };
      await AddInfoAutoManualPO(payload);
      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Info has been saved successfully.",
        confirmButtonColor: "#005BA8",
        timer: 2000,
        showConfirmButton: false,
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Failed to save info.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setLoading(false);
    }
  };

 const handleClose = () => {
  onClose();
};

  const fields = [
    { label: "Challan No", name: "challanNo", type: "text", multiline: false },
    { label: "Event Name", name: "eventName", type: "text", multiline: false },
    { label: "Delivery Venue", name: "deliveryVenue", type: "text", multiline: false },
    { label: "Delivery Time", name: "deliveryTime", type: "text", multiline: false },
    { label: "Remarks", name: "remarks", type: "text", multiline: true },
  ];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg flex flex-col border border-slate-200 overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-[15px] font-semibold text-slate-900">PO Info</h2>
            {data?.voucherNo && (
              <p className="text-xs text-slate-400 mt-0.5">Voucher: {data.voucherNo}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-100 cursor-pointer text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {fields.map((field) => (
            <div key={field.name} className="flex items-start gap-4">
              <label className="w-36 text-right text-sm font-medium text-slate-700 pt-2 flex-shrink-0">
                {field.label} :
              </label>
              {field.multiline ? (
                <textarea
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  rows={3}
                  className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition resize-none"
                />
              ) : (
                <input
                  type={field.type}
                  name={field.name}
                  value={form[field.name]}
                  onChange={handleChange}
                  className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition"
                />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3 bg-slate-50 border-t border-slate-200">
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-100 transition"
          >
            CLOSE
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-primary  text-white text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            SAVE CHANGES
          </button>
        </div>
      </div>
    </div>
  );
}