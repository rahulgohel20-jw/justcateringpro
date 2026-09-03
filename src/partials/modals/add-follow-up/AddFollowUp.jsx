import { useState, useEffect } from "react";

import { CustomModal } from "@/components/custom-modal/CustomModal";
import { DatePicker as AntDatePicker } from "antd";
import dayjs from "dayjs";

const AddFollowUp = ({ isModalOpen, setIsModalOpen }) => {
  // ✅ Static Client Data
  const clientData = {
    id: 1,
    name: "John Doe",
    mobile: "9876543210",
    email: "john@example.com",
    leadCode: "LD1001",
  };
  const [followupdate, setFollowUpDate] = useState(null);
  const [followUpType, setFollowUpType] = useState("Call");
  const [isReminderEnabled, setIsReminderEnabled] = useState(false);
  const [reminders, setReminders] = useState([{ time: "", type: "Call" }]);
  const [followUpData, setFollowUpData] = useState({ customerName: "" });

  useEffect(() => {
    if (isModalOpen && clientData?.clientName) {
      setFollowUpData((prev) => ({
        ...prev,
        customerName: clientData.clientName || "",
        email: clientData.emailId || "",
        phone: clientData.contactNumber || "",
      }));
    }
  }, [isModalOpen, clientData]);

  const handleFollowUpTypeChange = (type) => {
    setFollowUpType(type);
  };

  const handleReminderToggle = () => {
    setIsReminderEnabled(!isReminderEnabled);
  };

  const handleAddReminder = () => {
    setReminders([...reminders, { time: "", type: "Call" }]);
  };

  const handleRemoveReminder = (index) => {
    if (reminders.length > 1) {
      setReminders(reminders.filter((_, i) => i !== index));
    }
  };

  const handleReminderChange = (index, field, value) => {
    const updatedReminders = [...reminders];
    updatedReminders[index][field] = value;
    setReminders(updatedReminders);
  };

  const handleAddFollowUp = () => {
    const followUpObj = {
      customer: "Customer 1", // Replace with selected customer
      description: "", // Replace with textarea value
      type: followUpType,
      date: followupdate,
      reminders: reminders,
    };

    onSave(followUpObj); // pass back to parent
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="Add Follow Up"
        width={540}
        footer={[
          <div className="flex justify-between" key={"footer-buttons"}>
            <button
              key="cancel"
              className="btn btn-light"
              onClick={handleModalClose}
              title="Cancel"
            >
              Cancel
            </button>
            <button key="add" className="btn btn btn-success" title="Save">
              Save
            </button>
          </div>,
        ]}
      >
        <div className="flex flex-col gap-y-3">
          <style>
            {`
                .bg-theme-red { background-color: #B81C2C; }
                .text-theme-red { color: #B81C2C; }
                .hover\\:bg-theme-red-dark:hover { background-color: #9A1724; }
                .hover\\:text-theme-red-dark:hover { color: #9A1724; }
                .focus\\:ring-theme-red { --tw-ring-color: #B81C2C; }
              `}
          </style>
          <div className="flex flex-col">
            <label className="form-label mb-1">Customer Nameeeee</label>
            <input
              type="text"
              className="input"
              placeholder="Enter customer name"
              value={followUpData?.customerName || ""} // or a separate state
              onChange={(e) =>
                setFollowUpData((prev) => ({
                  ...prev,
                  customerName: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex flex-col">
            <textarea
              rows={4}
              className="textarea h-full"
              placeholder="Follow Up Description"
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <label className="form-label mb-0">Follow Up Type</label>
            <div className="flex space-x-2">
              <button
                onClick={() => handleFollowUpTypeChange("Call")}
                className={`btn btn-md rounded-full ${
                  followUpType === "Call"
                    ? "bg-success text-white"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-success hover:text-white transition-colors duration-200 flex items-center space-x-2`}
                title="Call"
              >
                {followUpType === "Call" && (
                  <i className="ki-filled ki-check me-1"></i>
                )}
                Call
              </button>
              <button
                onClick={() => handleFollowUpTypeChange("WhatsApp")}
                className={`btn btn-md rounded-full ${
                  followUpType === "WhatsApp"
                    ? "bg-success text-white"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-success hover:text-white transition-colors duration-200 flex items-center space-x-2`}
                title="WhatsApp"
              >
                {followUpType === "WhatsApp" && (
                  <i className="ki-filled ki-check me-1"></i>
                )}
                WhatsApp
              </button>
              <button
                onClick={() => handleFollowUpTypeChange("Email")}
                className={`btn btn-md rounded-full ${
                  followUpType === "Email"
                    ? "bg-success text-white"
                    : "bg-gray-200 text-gray-700"
                } hover:bg-success hover:text-white transition-colors duration-200 flex items-center space-x-2`}
                title="Email"
              >
                {followUpType === "Email" && (
                  <i className="ki-filled ki-check me-1"></i>
                )}
                Email
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <label className="form-label">Followup Date</label>
            <AntDatePicker
              className="input w-full"
              value={followupdate ? dayjs(followupdate) : null}
              onChange={(date) =>
                setFollowUpDate(date ? date.toISOString() : null)
              }
              getPopupContainer={() => document.body}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold">
                Add Followup Reminders ({reminders.length})
              </h3>
            </div>
            <div className="flex flex-col max-h-80 overflow-auto scrollable-y">
              {reminders.map((reminder, index) => (
                <div className="flex flex-col gap-y-2 mb-2 " key={index}>
                  <div className="flex items-end gap-3">
                    <div className="w-full flex flex-col">
                      <label className="form-label">
                        Reminder Follow Up Type
                      </label>
                      <select
                        className="select pe-7.5"
                        value={reminder.type}
                        onChange={(e) =>
                          handleReminderChange(index, "type", e.target.value)
                        }
                      >
                        <option value="Call">Call</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Email">Email</option>
                      </select>
                    </div>
                    <div className="w-full flex flex-col">
                      <label className="form-label">Reminder Time</label>
                      <div className="input">
                        <i className="ki-filled ki-time"></i>
                        <input
                          className="h-full"
                          type="time"
                          value={reminder.time}
                          onChange={(e) =>
                            handleReminderChange(index, "time", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    {index === 0 ? (
                      <div className="flex mb-1">
                        <button
                          className="btn btn-success w-8 h-8 p-0 inline-flex items-center justify-center rounded-full"
                          title="Add Reminder"
                          onClick={handleAddReminder}
                        >
                          <i className="ki-filled ki-plus"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="flex">
                        <button
                          className="btn btn-danger w-8 h-8 p-0 inline-flex items-center justify-center rounded-full"
                          title="Remove Reminder"
                          onClick={() => handleRemoveReminder(index)}
                        >
                          <i className="ki-filled ki-cross"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CustomModal>
    )
  );
};
export default AddFollowUp;
