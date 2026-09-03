import { useState, useRef, useEffect } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import Swal from "sweetalert2";

const INTERACTION_OPTIONS = ["Complaint", "Query", "Request", "Feedback"];
const TICKET_FROM_OPTIONS = ["Call", "Email", "WhatsApp", "Walk-in", "Portal"];
const DEPARTMENT_OPTIONS = [
  "Super Admin",
  "Frontend Developer",
  "Backend Developer",
  "UI/UX Designer",
  "QA",
];
const ASSIGN_TO_OPTIONS = [
  "Aarya",
  "Chirag Koshti",
  "Deep Jain",
  "Digvijay Kataria",
  "Tushar New",
  "Sahil Webminds",
];

const SuperAdminNewIssue = ({ open, onClose, onSubmit }) => {
  const [interaction, setInteraction] = useState("Complaint");
  const [ticketFrom, setTicketFrom] = useState("Call");
  const [interactionRemarks, setInteractionRemarks] = useState("");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [actualCloseDate, setActualCloseDate] = useState("");
  const [timing, setTiming] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [memberMessage, setMemberMessage] = useState("");
  const [department, setDepartment] = useState("Super Admin");
  const [assignTo, setAssignTo] = useState("Aarya");
  const [errors, setErrors] = useState({});

  const validate = () => {
    const err = {};
    if (!interaction) err.interaction = "Required";
    if (!ticketFrom) err.ticketFrom = "Required";
    if (!interactionRemarks.trim())
      err.interactionRemarks = "Remarks are required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const formData = new FormData();
    formData.append("interaction", interaction);
    formData.append("ticketFrom", ticketFrom);
    formData.append("interactionRemarks", interactionRemarks);
    formData.append("expectedCloseDate", expectedCloseDate);
    formData.append("actualCloseDate", actualCloseDate);
    formData.append("timing", timing);
    formData.append("userMessage", userMessage);
    formData.append("memberMessage", memberMessage);
    formData.append("department", department);
    formData.append("assignTo", assignTo);
    onSubmit?.(formData);
  };

  const resetForm = () => {
    setInteraction("Complaint");
    setTicketFrom("Call");
    setInteractionRemarks("");
    setExpectedCloseDate("");
    setActualCloseDate("");
    setTiming("");
    setUserMessage("");
    setMemberMessage("");
    setDepartment("Super Admin");
    setAssignTo("Aarya");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ── Reusable select ──────────────────────────────────────────────────────
  const SelectField = ({ value, onChange, options, error }) => (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${
          error ? "border-red-400" : "border-gray-200"
        }`}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title={
        <div>
          <p className="text-base font-bold text-gray-900">Ticket Details</p>
        </div>
      }
      width={560}
      centered
      styles={{
        body: {
          maxHeight: "calc(100vh - 220px)",
          overflowY: "auto",
          overflowX: "hidden",
        },
        wrapper: { overflow: "hidden" },
      }}
      footer={[
        <div
          key="footer"
          className="flex items-center justify-end gap-3 w-full"
        >
          <button
            onClick={handleClose}
            className="px-5 py-2 text-sm  border border-gray-200 rounded-lg hover:bg-gray-50 transition"
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
            Save and Upload
          </button>
        </div>,
      ]}
    >
      <div className="flex flex-col gap-5 p-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs  mb-1.5">Interaction</label>
            <SelectField
              value={interaction}
              onChange={(v) => {
                setInteraction(v);
                setErrors((p) => ({ ...p, interaction: "" }));
              }}
              options={INTERACTION_OPTIONS}
              error={errors.interaction}
            />
          </div>
          <div>
            <label className="block text-xs  mb-1.5">Ticket From</label>
            <SelectField
              value={ticketFrom}
              onChange={(v) => {
                setTicketFrom(v);
                setErrors((p) => ({ ...p, ticketFrom: "" }));
              }}
              options={TICKET_FROM_OPTIONS}
              error={errors.ticketFrom}
            />
          </div>
        </div>

        {/* INTERACTION REMARKS */}
        <div>
          <label className="block text-xs  mb-1.5">Interaction Remarks</label>
          <textarea
            rows={3}
            value={interactionRemarks}
            onChange={(e) => {
              setInteractionRemarks(e.target.value);
              setErrors((p) => ({ ...p, interactionRemarks: "" }));
            }}
            placeholder="Enter notes about the interaction..."
            className={`w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.interactionRemarks ? "border-red-400" : "border-gray-200"
            }`}
          />
          {errors.interactionRemarks && (
            <p className="text-red-500 text-xs mt-1">
              {errors.interactionRemarks}
            </p>
          )}
        </div>

        {/* ROW 2: Expected Close Date + Actual Close Date + Timing */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs  mb-1.5">Accepted Date</label>
            <input
              type="date"
              value={expectedCloseDate}
              onChange={(e) => setExpectedCloseDate(e.target.value)}
              placeholder="mm/dd/yyyy"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs  mb-1.5">Timing</label>
            <input
              type="time"
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              placeholder="e.g. 14:00"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        {/* ROW 3: User Message + Member Message */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs  mb-1.5">User Message</label>
            <textarea
              rows={3}
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="Client message details..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs  mb-1.5">Member Message</label>
            <textarea
              rows={3}
              value={memberMessage}
              onChange={(e) => setMemberMessage(e.target.value)}
              placeholder="Internal team notes..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ROW 4: Department + Assign To */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs  mb-1.5">Department</label>
            <SelectField
              value={department}
              onChange={setDepartment}
              options={DEPARTMENT_OPTIONS}
            />
          </div>
          <div>
            <label className="block text-xs  mb-1.5">Assign To</label>
            <SelectField
              value={assignTo}
              onChange={setAssignTo}
              options={ASSIGN_TO_OPTIONS}
            />
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default SuperAdminNewIssue;
