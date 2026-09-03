import { useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { message } from "antd";

const TABLET_CONDITION_OPTIONS = [
  {
    value: "good",
    label: "Good Condition",
    color: "text-green-600 border-green-400 bg-green-50",
  },
  {
    value: "average",
    label: "Average",
    color: "text-yellow-600 border-yellow-400 bg-yellow-50",
  },
  {
    value: "bad",
    label: "Bad Condition",
    color: "text-red-600 border-red-400 bg-red-50",
  },
];

const STATIC_MEMBERS = [
  { id: 1, name: "Rajesh Sharma", role: "Captain" },
  { id: 2, name: "Priya Patel", role: "Manager" },
  { id: 3, name: "Amit Verma", role: "Executive" },
  { id: 4, name: "Sneha Joshi", role: "Coordinator" },
  { id: 5, name: "Karan Mehta", role: "Executive" },
  { id: 6, name: "Divya Singh", role: "Coordinator" },
];

const defaultForm = {
  checkInTime: "",
  checkOutTime: "",
  venue: "",
  clientName: "",
  tabletsAssigned: "",
  tabletCondition: "",
  isSelfCaption: false,
  selectedCaptionId: null,
  selectedClientIds: [],
  manager: "",
  date: "",
  eventStatus: "",
};

const MultiSelectMembers = ({ members, selectedIds = [], onChange, label }) => {
  const safeIds = selectedIds ?? [];

  const toggle = (id) => {
    if (safeIds.includes(id)) {
      onChange(safeIds.filter((s) => s !== id));
    } else {
      onChange([...safeIds, id]);
    }
  };

  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 mb-2 block">
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {members.map((m) => {
          const selected = safeIds.includes(m.id);
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 text-sm font-medium transition-all ${
                selected
                  ? "border-primary bg-blue-50 text-primary"
                  : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"
              }`}
            >
              <span
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition ${
                  selected ? "bg-primary border-primary" : "border-gray-300"
                }`}
              >
                {selected && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
              <span>{m.name}</span>
              <span className="text-[10px] text-gray-400 font-normal">
                ({m.role})
              </span>
            </button>
          );
        })}
      </div>
      {safeIds.length > 0 && (
        <p className="text-xs text-gray-400 mt-1.5">
          {safeIds.length} selected:{" "}
          {members
            .filter((m) => safeIds.includes(m.id))
            .map((m) => m.name)
            .join(", ")}
        </p>
      )}
    </div>
  );
};

const JustTabModal = ({ open, onClose, onSubmit }) => {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);

  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (
      !form.checkInTime ||
      !form.checkOutTime ||
      !form.venue ||
      !form.clientName
    ) {
      message.warning("Please fill in all required fields.");
      return;
    }
    if (!form.tabletCondition) {
      message.warning("Please select tablet condition.");
      return;
    }
    if (!form.eventStatus) {
      message.warning("Please select event status.");
      return;
    }
    if (!form.isSelfCaption && !form.selectedCaptionId) {
      message.warning("Please select a caption or mark yourself as caption.");
      return;
    }

    setLoading(true);
    try {
      await onSubmit?.(form);
      message.success("Just Tab record submitted successfully!");
      setForm(defaultForm);
      onClose();
    } catch {
      message.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(defaultForm);
    onClose();
  };

  return (
    <CustomModal
      open={open}
      onClose={handleClose}
      title="Just Tab — Event Entry"
      width={820}
      footer={
        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={handleClose}
            className="px-5 py-2 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-blue-800 transition disabled:opacity-60"
          >
            {loading ? "Submitting..." : "Submit Entry"}
          </button>
        </div>
      }
    >
      <div className="flex gap-0 min-h-[500px] -mx-6 -mb-4">
        {/* ── LEFT SIDEBAR ── */}
        <div className="w-52 flex-shrink-0 bg-gray-50 border-r border-gray-100 px-4 py-5 flex flex-col gap-1 rounded-bl-lg">
          {[
            { icon: "🕐", label: "Check In / Out" },
            { icon: "📍", label: "Venue & Client" },
            { icon: "📱", label: "Tablet Info" },
            { icon: "👤", label: "Caption & Clients" },
            { icon: "📅", label: "Date & Status" },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600"
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* ── RIGHT FORM ── */}
        <div className="flex-1 px-6 py-5 overflow-y-auto space-y-6">
          {/* Section 1: Check In / Out */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              🕐 Check In / Check Out
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Check In Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.checkInTime}
                  onChange={(e) => set("checkInTime", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Check Out Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.checkOutTime}
                  onChange={(e) => set("checkOutTime", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 2: Venue & Client */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              📍 Venue & Client
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Venue <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter venue name"
                  value={form.venue}
                  onChange={(e) => set("venue", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition placeholder-gray-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter client name"
                  value={form.clientName}
                  onChange={(e) => set("clientName", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition placeholder-gray-300"
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 3: Tablet Info */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              📱 Tablet Info
            </h3>
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                How Many Tablets Assigned?
              </label>
              <input
                type="tel"
                min="0"
                placeholder="e.g. 5"
                value={form.tabletsAssigned}
                onChange={(e) => set("tabletsAssigned", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition placeholder-gray-300"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Tablet Condition <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3 flex-wrap">
                {TABLET_CONDITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => set("tabletCondition", opt.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.tabletCondition === opt.value
                        ? opt.color
                        : "border-gray-200 text-gray-500 bg-white hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        form.tabletCondition === opt.value
                          ? "border-current"
                          : "border-gray-300"
                      }`}
                    >
                      {form.tabletCondition === opt.value && (
                        <span className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 4: Caption & Clients */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              👤 Caption & Clients
            </h3>

            {/* Caption */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-gray-600 mb-2 block">
                Caption <span className="text-red-500">*</span>
              </label>

              {/* Self toggle */}
            </div>

            {/* Multi-select clients */}
            <MultiSelectMembers
              members={STATIC_MEMBERS}
              selectedIds={form.selectedClientIds}
              onChange={(ids) => set("selectedClientIds", ids)}
              label="Caption Attending (select multiple)"
            />

            <hr className="border-gray-100 my-4" />

            {/* Manager */}
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">
                Manager Name
              </label>
              <input
                type="text"
                placeholder="Enter manager name"
                value={form.manager}
                onChange={(e) => set("manager", e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition placeholder-gray-300"
              />
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Section 5: Date & Event Status */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
              📅 Date & Event Status
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2 block">
                  Event Status <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => set("eventStatus", "successful")}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.eventStatus === "successful"
                        ? "border-green-400 bg-green-50 text-green-600"
                        : "border-gray-200 text-gray-500 bg-white"
                    }`}
                  >
                    <span className="text-base">✅</span> Successful
                  </button>
                  <button
                    type="button"
                    onClick={() => set("eventStatus", "unsuccessful")}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                      form.eventStatus === "unsuccessful"
                        ? "border-red-400 bg-red-50 text-red-600"
                        : "border-gray-200 text-gray-500 bg-white"
                    }`}
                  >
                    <span className="text-base">❌</span> Unsuccessful
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </CustomModal>
  );
};

export { JustTabModal };
