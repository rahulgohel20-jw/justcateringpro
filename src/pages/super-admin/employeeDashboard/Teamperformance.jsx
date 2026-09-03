import { useState, useCallback, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Select, Checkbox, Progress, Tag, Tooltip } from "antd";
import { GetEmployeeDashBoard } from "@/services/apiServices";

const { Option } = Select;

// ─── Constants with NO state/JSX — safe outside component ────────────────────

const RANK_STYLES = [
  "bg-amber-100 text-amber-800",
  "bg-gray-200 text-gray-700",
  "bg-orange-100 text-orange-800",
  "bg-blue-100 text-blue-800",
  "bg-gray-100 text-gray-600",
];

const MEMBER_COLORS = [
  "#111111",
  "#2563eb",
  "#7c3aed",
  "#ea580c",
  "#16a34a",
  "#dc2626",
  "#6b7280",
  "#0891b2",
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function TeamPerformance() {
  // ── State ──
  const [activeTab, setActiveTab] = useState(1);
  const [showUnderperf, setShowUnderperf] = useState(false);
  const [timePeriod, setTimePeriod] = useState("This Month");
  const [sortBy, setSortBy] = useState("Completed Tasks");
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [statValues, setStatValues] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0,
  });
  const [workload, setWorkload] = useState([]);
  const [teamAverages, setTeamAverages] = useState({
    onTimeDelivery: 0,
    qualityScore: 0,
  });

  // ✅ STAT_CARDS — inside component, AFTER statValues state
  const STAT_CARDS = [
    {
      label: "Completed Leads",
      value: statValues.completed,
      color: "text-green-600",
      bg: "bg-green-50",
      icon: <CheckCircle2 size={18} className="text-green-600" />,
      desc: "Total completed by team",
    },
    {
      label: "In Progress",
      value: statValues.inProgress,
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: <Loader2 size={18} className="text-blue-600" />,
      desc: "Currently being worked on",
    },
    {
      label: "New Inquiries",
      value: statValues.pending,
      color: "text-gray-800",
      bg: "bg-gray-50",
      icon: <Clock size={18} className="text-gray-500" />,
      desc: "Not yet started",
    },
    {
      label: "Overdue",
      value: statValues.overdue,
      color: "text-red-600",
      bg: "bg-red-50",
      icon: <AlertCircle size={18} className="text-red-600" />,
      desc: "Requires attention",
    },
  ];

  // ── Date range helper — inside component to access timePeriod/customRange ──
  const getDateRange = useCallback(() => {
    switch (timePeriod) {
      case "This Month": {
        const now = new Date();
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1)
            .toISOString()
            .split("T")[0],
          end: new Date().toISOString().split("T")[0],
        };
      }
      case "Last 30 Days": {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 30);
        return {
          start: start.toISOString().split("T")[0],
          end: end.toISOString().split("T")[0],
        };
      }
      case "Custom Range":
        return customRange;
      default:
        return { start: "", end: "" }; // All Time
    }
  }, [timePeriod, customRange]);

  // ── Fetch dashboard data ──
  const fetchDashboard = useCallback(async (startDate = "", endDate = "") => {
    const userId =
      localStorage.getItem("id") || localStorage.getItem("mainId") || "";
    if (!userId) return;
    try {
      setIsLoading(true);
      const response = await GetEmployeeDashBoard(startDate, endDate, userId);
      const data = response?.data?.data;

      if (!data) return;

      // Map API → stat cards
      setStatValues({
        completed: data.completed_leads ?? 0,
        inProgress: data.in_progress_leads ?? 0,
        pending: data.new_inquiry_leads ?? 0,
        overdue: data.overdue_leads ?? 0,
      });

      // Map API → lead distribution workload bars
      const maxLeads = Math.max(
        ...data.lead_distribution.map((m) => m.totalLeads),
        1,
      );
      setWorkload(
        data.lead_distribution.map((m, i) => ({
          name: m.assignName,
          completed: m.completedLeads,
          pending: m.pendingLeads,
          count: m.totalLeads,
          pct: Math.round((m.totalLeads / maxLeads) * 100),
          color: MEMBER_COLORS[i % MEMBER_COLORS.length],
        })),
      );

      // Map API → team averages
      setTeamAverages({
        onTimeDelivery: data.on_time_delivery ?? 0,
        qualityScore: data.quality_score ?? 0,
      });

      setDashboardData(data);
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch on timePeriod change (skip Custom Range — needs Apply)
  useEffect(() => {
    if (timePeriod === "Custom Range") return;
    const { start, end } = getDateRange();
    fetchDashboard(start, end);
  }, [timePeriod]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle timePeriod dropdown change
  const handleTimePeriodChange = (value) => {
    setTimePeriod(value);
    if (value !== "Custom Range") {
      setCustomRange({ start: "", end: "" });
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen text-gray-900">
      <main className="px-4 sm:px-9 py-5 sm:py-8">
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-5 sm:mb-7">
  <div>
    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight leading-none m-0">
              DashBoard
            </h1>
            <p className="text-sm text-gray-800 mt-1 mb-0">
              Monitor team productivity and quality metrics
            </p>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex items-end gap-4 mb-6 flex-wrap">
          {/* Time Period */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-widest">
              Time Period
            </span>
            <Select
              value={timePeriod}
              onChange={handleTimePeriodChange}
              style={{ width: "100%", maxWidth: 160 }}
              loading={isLoading}
            >
              {["This Month", "Last 30 Days", "Custom Range"].map((o) => (
                <Option key={o} value={o}>
                  {o}
                </Option>
              ))}
            </Select>

            {/* Custom date pickers */}
            {timePeriod === "Custom Range" && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2">
                <input
                  type="date"
                  className="input w-full sm:w-auto"
                  value={customRange.start}
                  onChange={(e) =>
                    setCustomRange((prev) => ({
                      ...prev,
                      start: e.target.value,
                    }))
                  }
                />
                <span className="text-gray-500 text-xs hidden sm:inline">to</span>
                <input
                  type="date"
                  className="input w-full sm:w-auto"
                  value={customRange.end}
                  onChange={(e) =>
                    setCustomRange((prev) => ({ ...prev, end: e.target.value }))
                  }
                />
                <button
                  className="btn btn-primary w-full sm:w-auto"
                  disabled={!customRange.start || !customRange.end || isLoading}
                  onClick={() =>
                    fetchDashboard(customRange.start, customRange.end)
                  }
                >
                  {isLoading ? "Loading..." : "Apply"}
                </button>
              </div>
            )}
          </div>

          {/* Sort By */}
          {/* <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-gray-700 uppercase tracking-widest">
              Sort By
            </span>
            <Select value={sortBy} onChange={setSortBy} style={{ width: 180 }}>
              {[
                "Completed Tasks",
                "On-Time Delivery",
                "Quality Score",
                "Task Efficiency",
              ].map((o) => (
                <Option key={o} value={o}>
                  {o}
                </Option>
              ))}
            </Select>
          </div> */}
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-3.5 mb-5">
          {STAT_CARDS.map((card) => (
            <div
              key={card.label}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">
                  {card.label}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}
                >
                  {card.icon}
                </div>
              </div>
              <div className={`text-2xl sm:text-4xl font-bold leading-none mb-1.5 ${card.color}`}>
                {isLoading ? (
                  <span className="text-2xl text-gray-300 animate-pulse">
                    —
                  </span>
                ) : (
                  card.value
                )}
              </div>
              <div className="text-xs text-gray-700">{card.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Team Averages ── */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 mb-4">
          <div className="text-base font-bold mb-0.5">Team Averages</div>
          <div className="text-xs text-gray-700 mb-5">
            Average performance metrics across all team members
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
            {[
              {
                label: "On-Time Delivery",
                value: `${teamAverages.onTimeDelivery}%`,
                pct: teamAverages.onTimeDelivery,
                stroke: "#2563eb",
                neg: false,
              },
              // {
              //   label: "efficiency",
              //   value: `${teamAverages.qualityScore}/100`,
              //   pct: teamAverages.qualityScore,
              //   stroke:
              //     teamAverages.qualityScore >= 75
              //       ? "#16a34a"
              //       : teamAverages.qualityScore >= 50
              //         ? "#f59e0b"
              //         : "#dc2626",
              //   neg: false,
              // },
              {
                label: "Quality Score",
                value: `${teamAverages.qualityScore}/100`,
                pct: teamAverages.qualityScore,
                stroke:
                  teamAverages.qualityScore >= 75
                    ? "#16a34a"
                    : teamAverages.qualityScore >= 50
                      ? "#f59e0b"
                      : "#dc2626",
                neg: false,
              },
            ].map((avg) => (
              <div key={avg.label}>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span className="text-gray-900">{avg.label}</span>
                  <span
                    className={`font-bold ${avg.neg ? "text-red-500" : "text-gray-900"}`}
                  >
                    {avg.value}
                  </span>
                </div>
                <Progress
                  percent={avg.pct}
                  showInfo={false}
                  strokeColor={avg.stroke}
                  trailColor="#e8e8e8"
                />
              </div>
            ))}
          </div>

          <div className="mt-6">
            <div className="text-[10px] font-semibold text-gray-700 uppercase tracking-widest mb-2">
              Completion Trend (Last 8 Weeks)
            </div>
          </div>
        </div>

        {/* ── Bottom Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {/* Top Performers — from workload data sorted by completedLeads */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-0.5">
              <TrendingUp size={16} className="text-green-500" />
              <span className="text-base font-bold">Top Performers</span>
            </div>
            <div className="text-xs text-gray-700 mb-4">
              Team members with highest completed leads
            </div>
            <div className="space-y-0.5">
              {[...workload]
                .sort((a, b) => b.completed - a.completed)
                .map((m, i) => (
                  <div
                    key={m.name}
                    className="flex items-center gap-3.5 px-3 py-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        RANK_STYLES[i] || "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">
                        {m.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {m.completed} completed • {m.pending} pending
                      </div>
                    </div>
                    <Tag
                      color={m.completed > 0 ? "success" : "default"}
                      className="font-mono font-semibold flex-shrink-0"
                    >
                      {m.count} total
                    </Tag>
                  </div>
                ))}
              {workload.length === 0 && !isLoading && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No data available
                </p>
              )}
              {isLoading && (
                <p className="text-sm text-gray-400 text-center py-4 animate-pulse">
                  Loading...
                </p>
              )}
            </div>
          </div>

          {/* Lead Distribution */}
          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-0.5">
              <TrendingDown size={16} className="text-orange-500" />
              <span className="text-base font-bold">Lead Distribution</span>
            </div>
            <div className="text-xs text-gray-700 mb-5">
              Active lead count per team member
            </div>
            <div className="space-y-3">
              {workload.map((w) => (
                <div key={w.name} className="flex items-center gap-3">
                  <span className="w-20 sm:w-28 text-sm font-medium text-gray-600 flex-shrink-0 truncate">
                    {w.name}
                  </span>
                  <div className="flex-1">
                    <Progress
                      percent={w.pct}
                      showInfo={false}
                      strokeColor={w.color}
                      trailColor="#f3f4f6"
                      size="small"
                    />
                  </div>
                  <span className="w-7 text-right text-xs font-semibold text-gray-400 font-mono">
                    {w.count}
                  </span>
                </div>
              ))}
              {workload.length === 0 && !isLoading && (
                <p className="text-sm text-gray-400 text-center py-4">
                  No data available
                </p>
              )}
              {isLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="flex items-center gap-3 animate-pulse"
                    >
                      <div className="w-28 h-4 bg-gray-200 rounded" />
                      <div className="flex-1 h-2 bg-gray-200 rounded" />
                      <div className="w-7 h-4 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── All Members Table placeholder ── */}
      </main>
    </div>
  );
}
