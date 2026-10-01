import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { GeneratePaymentReceipt } from "@/services/apiServices";

const Toggle = ({ checked, onChange, label }) => (
  <div className="flex items-center justify-between py-3">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-primary" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

// isPayable: 1 for Payments, 0 for Receipts
const GenerateReceiptModal = ({ isOpen, onClose, paymentId, isPayable = 0 }) => {
  const [isCompanyDetails, setIsCompanyDetails] = useState(true);
  const [loading, setLoading] = useState(false);

  // Reset the toggle each time the modal opens
  useEffect(() => {
    if (isOpen) setIsCompanyDetails(true);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!paymentId) return;
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      const res = await GeneratePaymentReceipt(
        isCompanyDetails ? 1 : 0,
        isPayable,
        userId,
        paymentId,
        
      );

      const fileUrl =
        res?.data?.url ||
        res?.data?.report_path ||
        res?.data?.data?.url ||
        res?.data?.data?.report_path;

      if (fileUrl) {
        window.open(fileUrl, "_blank", "noopener,noreferrer");
        onClose();
      } else {
        Swal.fire({
          title: "No file returned",
          text: "The report didn't return a downloadable file.",
          icon: "warning",
        });
      }
    } catch (err) {
      console.error("Generate report failed:", err);
      Swal.fire({
        title: "Error!",
        text:
          err?.response?.data?.msg ||
          "Failed to generate the report. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-5">
        <h2 className="text-lg font-semibold text-[#111827] mb-1">
          Generate Report
        </h2>
        <p className="text-sm text-gray-500 mb-2">
          Choose what to include in the report.
        </p>

        <div className="divide-y divide-gray-100">
          <Toggle
            checked={isCompanyDetails}
            onChange={setIsCompanyDetails}
            label="Company Details"
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            className="btn btn-light"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateReceiptModal;