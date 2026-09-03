import { useState } from "react";

const SuperAdminNotes = ({ open, onClose, issue, onSubmit }) => {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!notes.trim()) {
      setError("Notes are required");
      return;
    }
    onSubmit?.({ notes, issue });
    handleClose();
  };

  const handleClose = () => {
    setNotes("");
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[1000]"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <p className="text-base font-bold text-gray-900">Add Remarks</p>
              {issue?.queryId && (
                <p className="text-xs text-gray-400 mt-0.5">
                  {issue.queryId} · {issue.module}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            <label className="block text-xs text-gray-500 font-medium mb-1.5">
              Remark <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setError("");
              }}
              placeholder="Enter your notes here..."
              className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                error ? "border-red-400" : "border-gray-200"
              }`}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100">
            <button
              onClick={handleClose}
              className="px-5 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Save Remaks
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SuperAdminNotes;
