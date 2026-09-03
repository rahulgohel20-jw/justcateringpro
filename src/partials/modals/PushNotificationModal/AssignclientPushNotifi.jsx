import { useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { Search } from "lucide-react";

const AVATAR_COLORS = [
  { bg: "#eff6ff", color: "#1e40af" },
  { bg: "#f0fdf4", color: "#3b6d11" },
  { bg: "#fdf4ff", color: "#534ab7" },
  { bg: "#fff7ed", color: "#854f0b" },
  { bg: "#fdf2f8", color: "#993556" },
  { bg: "#faeeda", color: "#854f0b" },
];

const ALL_CLIENTS = [
  { id: 1, name: "Alex Ingram", email: "alex.ingram@globaltech.com" },
  { id: 2, name: "Sarah Miller", email: "s.miller@summitmedia.io" },
  { id: 3, name: "Robert Kallis", email: "robert@luminadigital.com" },
  { id: 4, name: "David Vance", email: "dvance@horizon.co" },
  { id: 5, name: "Elena Loft", email: "elena@nexus.com" },
  { id: 6, name: "Mark Chen", email: "m.chen@starlight.io" },
];

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-blue-700" : "bg-gray-200"}`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
    />
  </button>
);

const AssignClientPushNoti = ({ open, onClose, onPush, notificationTitle }) => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(
    new Set(
      ALL_CLIENTS.filter((_, i) => [0, 1, 3].includes(i)).map((c) => c.id),
    ),
  );

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = (val) =>
    setSelected(val ? new Set(ALL_CLIENTS.map((c) => c.id)) : new Set());

  const filtered = ALL_CLIENTS.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()),
  );

  const allSelected = selected.size === ALL_CLIENTS.length;

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      width={520}
      centered
      title={
        <div>
          <p className="text-base font-semibold text-gray-900">
            {notificationTitle ?? "Catering Operations"} — Recipient Selection
          </p>
          <p className="text-xs text-gray-400 font-normal mt-0.5">
            Choose clients to receive the event notification
          </p>
        </div>
      }
      footer={
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing {filtered.length} of 248 clients
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onPush?.(Array.from(selected))}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors"
            >
              Push Notification
            </button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-3 py-2">
        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-8 pr-4 py-2.5 text-sm border border-gray-200 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Select all row */}
        <div className="flex items-center justify-between py-1">
          <p className="text-sm font-medium text-gray-700">
            Select All ({selected.size} selected)
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => toggleAll(!allSelected)}
              className="text-sm font-medium text-blue-700"
            >
              Select All
            </button>
            <Toggle checked={allSelected} onChange={toggleAll} />
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Client list */}
        <div className="flex flex-col gap-0.5 max-h-72 overflow-y-auto">
          {filtered.map((c, i) => {
            const initials = c.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const cfg = AVATAR_COLORS[i % AVATAR_COLORS.length];
            const isOn = selected.has(c.id);
            return (
              <div
                key={c.id}
                className="flex items-center justify-between py-2.5 px-1"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {c.name}
                    </p>
                    <p className="text-xs text-gray-400">{c.email}</p>
                  </div>
                </div>
                <Toggle checked={isOn} onChange={() => toggle(c.id)} />
              </div>
            );
          })}
        </div>
      </div>
    </CustomModal>
  );
};

export default AssignClientPushNoti;
