import { useState, useEffect } from "react";
import {
  LogOut,
  Banknote,
  SquareKanban,
  UtensilsCrossed,
  CalendarPlus,
  ReceiptText,
  LogInIcon,
  Package,
  ClipboardList,
  ChefHat,
  FileText,
  RefreshCw,
  Truck,
} from "lucide-react";
import { GetUserlogs } from "@/services/apiServices";

const TYPE_CONFIG = {
  LOGIN: {
    icon: LogInIcon,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    badge: "bg-green-50 text-green-600 border border-green-200",
  },
  LOGOUT: {
    icon: LogOut,
    iconBg: "bg-rose-50",
    iconColor: "text-rose-500",
    badge: "bg-rose-50 text-rose-500 border border-rose-200",
  },
  EVENT_CREATED: {
    icon: CalendarPlus,
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    badge: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  },
  INVOICE_CREATED: {
    icon: Banknote,
    iconBg: "bg-sky-50",
    iconColor: "text-sky-600",
    badge: "bg-sky-50 text-sky-600 border border-sky-200",
  },
  DISH_COSTING: {
    icon: ReceiptText,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    badge: "bg-violet-50 text-violet-600 border border-violet-200",
  },

  // ✅ NEW — from your API logs
  "MENU PLANNING UPDATE": {
    icon: UtensilsCrossed,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  "MENU PLANNING SAVE": {
    icon: UtensilsCrossed,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  "MENU EXECUTION UPDATE": {
    icon: ChefHat,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-500",
    badge: "bg-orange-50 text-orange-600 border border-orange-200",
  },
  "RAW MATERIAL DISTRIBUTION UPDATE": {
    icon: Truck,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    badge: "bg-blue-50 text-blue-600 border border-blue-200",
  },
  "RAW MATERIAL UPDATE": {
    icon: Package,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    badge: "bg-teal-50 text-teal-600 border border-teal-200",
  },
  "DISH COSTING": {
    icon: ReceiptText,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    badge: "bg-violet-50 text-violet-600 border border-violet-200",
  },
};

const DEFAULT_CONFIG = {
  icon: ClipboardList,
  iconBg: "bg-slate-50",
  iconColor: "text-slate-500",
  badge: "bg-slate-50 text-slate-500 border border-slate-200",
};
function getConfig(type) {
  return TYPE_CONFIG[type?.toUpperCase()] || DEFAULT_CONFIG;
}

export default function ClientInsightRightLog({ selectedUser }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [stats, setStats] = useState({ total: 0, events: 0, invoices: 0 });
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!selectedUser?.email) {
      setLogs([]);
      setStats({ total: 0, events: 0, invoices: 0 });
      return;
    }
    fetchLogs();
  }, [selectedUser, startDate, endDate]);

  // Replace the useEffect for dates
  useEffect(() => {
    const today = new Date();
    const formatInputDate = (date) => date.toISOString().split("T")[0];
    const todayStr = formatInputDate(today);
    setEndDate(todayStr);
    setStartDate(todayStr); // ← both set to today
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";

    // Already in "DD/MM/YYYY HH:MM AM/PM" format — split and return date + time
    if (dateStr.includes("/")) {
      const [datePart, timePart, meridiem] = dateStr.split(" ");
      return `${datePart} · ${timePart} ${meridiem}`;
    }

    // Fallback for ISO strings
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const mins = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} · ${hours}:${mins}`;
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const formatToDDMMYYYY = (dateStr) => {
        if (!dateStr) return formatDate(new Date());
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
      };

      const end = formatToDDMMYYYY(endDate);
      const start = formatToDDMMYYYY(startDate);

      const res = await GetUserlogs(selectedUser.email, end, start, "", userId);
      const data = res?.data?.data || res?.data?.logs || [];

      setLogs(data);
      setStats({
        total: data.length,
        events: data.filter((l) => l.eventType?.toLowerCase() === "login")
          .length,
        invoices: data.filter(
          (l) => l.eventType?.toLowerCase() === "invoice_created",
        ).length,
      });
    } catch (e) {
      console.error(e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((log) => {
    const q = search.toLowerCase();
    return (
      log.description?.toLowerCase().includes(q) ||
      log.user?.toLowerCase().includes(q) ||
      log.eventType?.toLowerCase().includes(q)
    );
  });

  const statsCards = [
    {
      label: "Total Activities",
      value: stats.total,
      icon: SquareKanban,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Events Created",
      value: stats.events,
      icon: CalendarPlus,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      label: "Invoices Created",
      value: stats.invoices,
      icon: ReceiptText,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
  ];

  // No user selected
  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen text-slate-400 gap-2">
        <SquareKanban className="w-10 h-10 text-slate-200" />
        <p className="text-sm">Select a member to view their activity logs</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col font-sans">
      {/* Stats Cards */}
      <div className="px-6 pt-6 pb-4">
        {/* Selected user label */}
        <div className="mb-3 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-[11px] font-semibold text-white">
            {selectedUser.avatar || selectedUser.name?.[0]}
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-700">
              {selectedUser.name}
            </span>
            <span className="ml-2 text-xs text-slate-400">
              {selectedUser.email}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4"></div>
      </div>

      {/* Timeline Section */}
      <div className="flex-1 px-6 pb-6">
        {/* Header + Filters */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h3 className="text-lg font-bold text-slate-800">
            Detailed Activity Timeline
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex gap-2">
              <div className="flex flex-col">
                <label className="text-xs text-slate-500 mb-1">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs text-slate-500 mb-1">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              {/* <button
                onClick={() => { setStartDate(""); setEndDate(""); }}
                className="self-end px-3 py-2 text-xs font-semibold bg-slate-100 rounded-lg hover:bg-slate-200 transition"
              >
                Reset
              </button> */}
            </div>
            <button className="flex items-center gap-1.5 text-sm font-semibold text-green-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:border-slate-300 transition-colors self-end">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search activity logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition"
          />
        </div>

        {/* Loader */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Timeline */}
        {!loading && (
          <div className="relative space-y-3">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 z-0" />

            {filtered
              .slice()
              .reverse()
              .map((log, idx) => {
                const cfg = getConfig(log.eventType);
                const Icon = cfg.icon;

                // Parse "30/03/2026 11:27 AM"
                const [datePart, timePart, meridiem] = (
                  log.createAt || ""
                ).split(" ");

                return (
                  <div key={log.id || idx} className="relative flex gap-4 pl-0">
                    <div className="relative z-99 flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-2xl ${cfg.iconBg} flex items-center justify-center`}
                      >
                        <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
                      </div>
                    </div>
                    <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}
                          >
                            {log.eventType?.toUpperCase()}
                          </span>
                          <p className="text-sm font-bold text-slate-800">
                            {log.description === "No Description"
                              ? log.eventType
                              : log.description}
                          </p>
                        </div>
                        <span className="text-sm text-slate-600 font-medium whitespace-nowrap text-right leading-relaxed flex-shrink-0">
                          {datePart}
                          <br />
                          {timePart} {meridiem}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <svg
                          className="w-4 h-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="text-xs text-slate-500">
                          {log.user}
                        </span>
                        {log.ipAddress && (
                          <span className="text-xs text-slate-400">
                            · {log.ipAddress}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-400 text-sm">
                No activity logs found for this user.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
