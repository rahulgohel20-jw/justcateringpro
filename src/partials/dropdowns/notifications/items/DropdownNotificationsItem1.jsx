import React, { useState } from "react";
import {
  UtensilsCrossed,
  CalendarCheck,
  ClipboardList,
  FileText,
  Receipt,
  Megaphone,
  Bell,
  ImageOff,
  Check,
  MoreVertical,
  X,
} from "lucide-react";

const NOTIF_TYPES = {
  menu_planning: {
    icon: UtensilsCrossed,
    bg: "#eff6ff",
    color: "#1e40af",
    label: "Menu Updates",
  },
  events: {
    icon: CalendarCheck,
    bg: "#f0fdf4",
    color: "#3b6d11",
    label: "Events",
  },
  execution: {
    icon: ClipboardList,
    bg: "#fdf4ff",
    color: "#534ab7",
    label: "Menu Execution",
  },
  quotation: {
    icon: FileText,
    bg: "#fff7ed",
    color: "#854f0b",
    label: "Quotation",
  },
  invoice: { icon: Receipt, bg: "#fdf2f8", color: "#993556", label: "Invoice" },
  announcement: {
    icon: Megaphone,
    bg: "#f0fdf4",
    color: "#3b6d11",
    label: "Announcement",
  },
};

const ALL_NOTIFICATIONS = [
  {
    id: 1,
    type: "menu_planning",
    title: "Seasonal Menu Launch",
    sub: "Winter 2024 seasonal menu items synced successfully",
    time: "2h ago",
    isNew: true,
  },
  {
    id: 2,
    type: "events",
    title: "Event Confirmed",
    sub: "Global Tech Summit reservation finalized for 500 guests on July…",
    time: "5h ago",
    isNew: true,
  },
  {
    id: 3,
    type: "execution",
    title: "Prep Sheet Updated",
    sub: "Kitchen execution plan revised for Saturday's gala dinner",
    time: "6h ago",
    isNew: true,
  },
  {
    id: 4,
    type: "quotation",
    title: "New Quote Requested",
    sub: "Skyline Corp requested a quote for 300-guest corporate lunch",
    time: "7h ago",
    isNew: true,
  },
  {
    id: 5,
    type: "invoice",
    title: "Invoice #1042 Sent",
    sub: "Rs. 48,000 invoice dispatched to Mehta Wedding Group",
    time: "8h ago",
    isNew: true,
  },
  {
    id: 6,
    type: "announcement",
    title: "New Analytics Dashboard",
    sub: "Discover our brand new real-time analytics engine…",
    time: "Yesterday",
    isNew: false,
  },
];

const NotifCard = ({ n, onDismiss }) => {
  const cfg = NOTIF_TYPES[n.type];
  const Icon = cfg.icon;

  return (
    <div
      className={` rounded-3xl p-3.5 bg-white mb-2.5 border border-gray-100 ${n.isNew ? "border-l-4 border-l-blue-700" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.bg }}
        >
          <Icon size={18} style={{ color: cfg.color }} />
        </div>

        {/* Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              {cfg.label}
            </span>
            {/* ✅ Check + X dismiss */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Check size={18} className="text-gray-400" />
              <button
                onClick={() => onDismiss(n.id)}
                className="text-gray-300 hover:text-red-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          <p className="text-sm font-medium text-gray-900 mt-1 mb-0.5">
            {n.title}
          </p>
          <p className="text-xs text-gray-500 leading-snug">{n.sub}</p>
        </div>
      </div>
    </div>
  );
};

const DropdownNotificationsItem1 = () => {
  const [activeTab, setActiveTab] = useState("New");
  const [notifs, setNotifs] = useState(ALL_NOTIFICATIONS);

  const dismiss = (id) => setNotifs((prev) => prev.filter((n) => n.id !== id));
  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, isNew: false })));

  const today = notifs.filter((n) => n.isNew);
  const yesterday = notifs.filter((n) => !n.isNew);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* ── Tabs + mark all as read — sticky ── */}
      <div className=" flex-shrink-0 flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-white">
        <div className="flex gap-4">
          {["New", "Old"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-1.5 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab
                  ? "text-blue-700 border-blue-700"
                  : "text-gray-400 border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <button
          onClick={markAllRead}
          className="text-xs font-medium text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-all"
        >
          Mark all as read
        </button>
      </div>

      {/* ── Scrollable list ── */}
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50">
        {today.length > 0 && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-black mb-2">
              Today
            </p>
            {today.map((n) => (
              <NotifCard key={n.id} n={n} onDismiss={dismiss} />
            ))}
          </>
        )}

        {yesterday.length > 0 && (
          <>
            <p className=" text-[10px] uppercase tracking-widest text-black mt-3 mb-2">
              Yesterday
            </p>
            {yesterday.map((n) => (
              <NotifCard key={n.id} n={n} onDismiss={dismiss} />
            ))}
          </>
        )}

        {notifs.length === 0 && (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-2">
              <ImageOff size={20} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              No more notifications
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              You're all caught up for now!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export { DropdownNotificationsItem1 };
