import { useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";

const FollowupRemindersModal = ({ isOpen, onClose, onSave }) => {
  const [reminders, setReminders] = useState([
    {
      channels: ["Mobile App"],
      amount: "10",
      unit: "minutes",
      timing: "Before",
    },
  ]);

  const CHANNELS = ["Mobile App", "WhatsApp", "Email"];
  const UNITS = ["minutes", "hours", "days"];
  const TIMINGS = ["Before", "After"];

  const toggleChannel = (index, channel) => {
    setReminders((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        const already = r.channels.includes(channel);
        return {
          ...r,
          channels: already
            ? r.channels.filter((c) => c !== channel)
            : [...r.channels, channel],
        };
      }),
    );
  };

  const setField = (index, field, value) => {
    setReminders((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    );
  };

  const addReminder = () => {
    setReminders((prev) => [
      ...prev,
      {
        channels: ["Mobile App"],
        amount: "10",
        unit: "minutes",
        timing: "Before",
      },
    ]);
  };

  const removeReminder = (index) => {
    if (reminders.length === 1) return;
    setReminders((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave?.(reminders);
    onClose();
  };

  return (
    <CustomModal
      open={isOpen}
      onClose={onClose}
      title="Schedule Follow-up Reminders"
      width={480}
      footer={
        <div
          className="flex items-center justify-end gap-3 w-full"
          key="reminder-footer"
        >
          <button
            type="button"
            onClick={addReminder}
            className="btn btn-light flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition"
          >
            <i className="ki-filled ki-plus text-sm"></i>
            Add More
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="btn flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-semibold text-sm transition-all active:scale-[0.98] hover:opacity-90"
            style={{ backgroundColor: "#22C55E" }}
          >
            <i className="ki-filled ki-disk text-sm"></i>
            Save
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-y-5">
        {reminders.map((reminder, index) => (
          <div key={index} className="flex flex-col gap-y-4">
            {/* Divider between reminders */}
            {index > 0 && <hr className="border-gray-200" />}

            {/* Remove button for extra reminders */}
            {index > 0 && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => removeReminder(index)}
                  className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                >
                  <i className="ki-filled ki-cross text-xs"></i>
                  Remove
                </button>
              </div>
            )}

            {/* Where should we remind you? */}
            <div>
              <p className="text-sm text-gray-500 mb-3">
                Where should we remind you?
              </p>
              <div className="flex items-center gap-6">
                {CHANNELS.map((channel) => {
                  const checked = reminder.channels.includes(channel);
                  return (
                    <label
                      key={channel}
                      className="flex items-center gap-2 cursor-pointer select-none"
                      onClick={() => toggleChannel(index, channel)}
                    >
                      {/* Custom circle checkbox */}
                      <span
                        className="flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all flex-shrink-0"
                        style={{
                          borderColor: checked ? "#22C55E" : "#D1D5DB",
                          backgroundColor: checked ? "#22C55E" : "transparent",
                        }}
                      >
                        {checked && (
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>
                      <span className="text-sm text-gray-700">{channel}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* When should we remind you? */}
            <div>
              <p className="text-sm text-gray-500 mb-3">
                When should we remind you?
              </p>
              <div className="flex items-start gap-4">
                {/* Amount + Unit */}
                <div className="flex items-center gap-2">
                  <input
                    type="tel"
                    min="1"
                    className="input w-20 text-center"
                    value={reminder.amount}
                    onChange={(e) => setField(index, "amount", e.target.value)}
                  />
                  <select
                    className="select pe-7.5"
                    value={reminder.unit}
                    onChange={(e) => setField(index, "unit", e.target.value)}
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Before / After */}
                <div className="flex flex-col gap-2 pt-1">
                  {TIMINGS.map((timing) => {
                    const selected = reminder.timing === timing;
                    return (
                      <label
                        key={timing}
                        className="flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => setField(index, "timing", timing)}
                      >
                        <span
                          className="flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all flex-shrink-0"
                          style={{
                            borderColor: selected ? "#22C55E" : "#D1D5DB",
                            backgroundColor: selected
                              ? "#22C55E"
                              : "transparent",
                          }}
                        >
                          {selected && (
                            <svg
                              width="11"
                              height="11"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="white"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>
                        <span className="text-sm text-gray-700">{timing}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </CustomModal>
  );
};

export default FollowupRemindersModal;
