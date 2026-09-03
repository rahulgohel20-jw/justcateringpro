import { CustomModal } from "@/components/custom-modal/CustomModal";
import { Pencil } from "lucide-react";

const AVATAR_COLORS = [
  { bg: "#eff6ff", color: "#1e40af" },
  { bg: "#f0fdf4", color: "#3b6d11" },
  { bg: "#fdf4ff", color: "#534ab7" },
  { bg: "#fff7ed", color: "#854f0b" },
];

const Avatar = ({ name, index }) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const cfg = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold -ml-2 first:ml-0 border-2 border-white"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {initials}
    </div>
  );
};

const ViewPushNoti = ({ open, onClose, onEdit, notification }) => {
  if (!notification) return null;

  const recipients = notification.recipients ?? ["JD", "AB", "MK"];

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      width={560}
      centered
      title={
        <span className="text-base font-semibold text-gray-900">
          Notification Details
        </span>
      }
      footer={
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => onEdit?.(notification)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors"
          >
            <Pencil size={14} />
            Edit Notification
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 py-2">
        {/* Title row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-1">
              <span className="text-blue-700 text-lg">📣</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-blue-50 text-blue-700">
                  {notification.module ?? "Events Module"}
                </span>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide bg-green-50 text-green-700">
                  {notification.status ?? "Sent"}
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                {notification.title}
              </h3>
            </div>
          </div>
          {/* Timestamp */}
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Timestamp
            </p>
            <p className="text-sm font-medium text-gray-800">
              {notification.date?.split(" - ")[0]}
            </p>
            <p className="text-xs text-gray-400">
              {notification.date?.split(" - ")[1]}
            </p>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Description */}
        <div>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Description
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            {notification.description ??
              "Critical update for the Crystal Ballroom (Oct 27-29): HVAC maintenance in the West Wing restricts primary loading bay access. All catering teams must use Service Entrance B on the north side for deliveries between 6:00 AM and 2:00 PM this Friday. Please update client logistics accordingly."}
          </p>
        </div>

        <hr className="border-gray-100" />

        {/* Recipients */}
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {recipients.map((r, i) => (
              <Avatar key={i} name={r} index={i} />
            ))}
          </div>
          <p className="text-sm text-gray-500">
            Sent to{" "}
            <span className="font-medium text-gray-800">
              {recipients.length} recipients
            </span>{" "}
            in the Operations Group
          </p>
        </div>
      </div>
    </CustomModal>
  );
};

export default ViewPushNoti;
