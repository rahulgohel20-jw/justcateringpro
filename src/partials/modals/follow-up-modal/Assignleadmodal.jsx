import React, { useState } from "react";

const AssignLeadModal = ({
  isOpen,
  onClose,
  managers,
  selectedManager,
  setSelectedManager,
  onSave,
  selectedCount,
  closeDate,
  setCloseDate,
  description,
  setDescription,
}) => {
  if (!isOpen) return null;

  // ✅ Format date+time to "DD/MM/YYYY 12:30 PM"
  const handleDateTimeChange = (e) => {
    const raw = e.target.value; // "2026-02-19T07:36"
    if (!raw) {
      setCloseDate("");
      return;
    }
    const [datePart, timePart] = raw.split("T");
    const [y, m, d] = datePart.split("-");
    const [hourStr, minStr] = timePart.split(":");
    let hour = parseInt(hourStr, 10);
    const min = minStr;
    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    const paddedHour = String(hour).padStart(2, "0"); // ✅ adds leading zero → "07"
    const formatted = `${d}/${m}/${y} ${paddedHour}:${min} ${ampm}`;
    setCloseDate(formatted);
  };
  // ✅ Convert stored "DD/MM/YYYY H:MM AM/PM" back to input value "YYYY-MM-DDTHH:MM"
  const toInputValue = (formatted) => {
    if (!formatted) return "";
    try {
      const [datePart, timePart, ampm] = formatted.split(" ");
      const [d, m, y] = datePart.split("/");
      let [hour, min] = timePart.split(":");
      hour = parseInt(hour, 10);
      if (ampm === "PM" && hour !== 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;
      return `${y}-${m}-${d}T${String(hour).padStart(2, "0")}:${min}`;
    } catch {
      return "";
    }
  };

  const isDisabled = !selectedManager || !closeDate || !description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Assign Leads to Member
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <i className="ki-filled ki-cross text-xl"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            You are about to assign{" "}
            <span className="font-semibold text-gray-900">{selectedCount}</span>{" "}
            lead(s) to a Member. Please fill in the details below.
          </p>

          {/* Member Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Member <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedManager}
              onChange={(e) => setSelectedManager(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">-- Select Member --</option>
              {managers.map((manager) => (
                <option key={manager.value} value={manager.value}>
                  {manager.label}
                </option>
              ))}
            </select>
          </div>

          {/* Close Date & Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              close Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={toInputValue(closeDate)}
              onChange={handleDateTimeChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {/* Show formatted value as preview */}
            {closeDate && (
              <p className="text-xs text-gray-500 mt-1">
                Formatted: <strong>{closeDate}</strong>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Enter description..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            />
          </div>

          {/* Info Banner */}
          {selectedManager && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                <i className="ki-filled ki-information-2 mr-2"></i>
                {selectedCount} lead(s) will be assigned to the selected Member.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={isDisabled}
            className={`px-4 py-2 rounded-md transition flex items-center gap-2 ${
              !isDisabled
                ? "bg-primary text-white hover:bg-primary-dark"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <i className="ki-filled ki-check"></i>
            Assign Leads
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignLeadModal;
