import { Fragment, useState, useEffect, useCallback } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { useLocation, useParams } from "react-router-dom";
import {
  GetSummaryManagerTask,
  GetEventFunctionManagerTask,
  AssignEventFunctionManagerTask,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  CheckCircle2,
  Clock,
  ListChecks,
  Zap,
  RotateCcw,
  UploadCloud,
  Trash2,
  Save,
  Search,
} from "lucide-react";

const TABS = [
  { key: "PRE", label: "Pre Task", sub: "Prepare everything before event", icon: ListChecks, accent: "indigo" },
  { key: "RUNNING", label: "Running Task", sub: "Tasks currently in progress", icon: Zap, accent: "amber" },
  { key: "POST", label: "Post Task", sub: "Tasks after event completion", icon: RotateCcw, accent: "emerald" },
];

const ACCENTS = {
  indigo: { bar: "bg-indigo-500", bg: "bg-indigo-50", text: "text-indigo-600", ring: "ring-indigo-200", iconBg: "bg-indigo-100" },
  amber: { bar: "bg-amber-500", bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-200", iconBg: "bg-amber-100" },
  emerald: { bar: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200", iconBg: "bg-emerald-100" },
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "INPROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCEL", label: "Cancelled" },
];

// Empty/default shape for the per-tab summary stats returned by the API
// (totalTasks, totalPending, ..., completedPercentage, etc.)
const EMPTY_TAB_STATS = {
  totalTasks: 0,
  totalPending: 0,
  totalInProgress: 0,
  totalCompleted: 0,
  totalCancel: 0,
  pendingPercentage: 0,
  inProgressPercentage: 0,
  completedPercentage: 0,
  cancelPercentage: 0,
};

const PIE_COLORS = {
  Pending: "#f59e0b",
  "In Progress": "#3b82f6",
  Completed: "#10b981",
  Cancelled: "#ef4444",
};

const normalizeStatusKey = (raw) => {
  switch ((raw || "").toUpperCase().replace("_", "")) {
    case "COMPLETED":
      return "completed";
    case "INPROGRESS":
      return "in-progress";
    case "CANCEL":
      return "cancelled";
    default:
      return "pending";
  }
};

const extractManagerTasksPayload = (res) => {
  const raw = res?.data?.data;
  const meta = raw?.ManagerTasks ?? raw ?? null;
  const list = Array.isArray(meta?.functionManagerTasks)
    ? meta.functionManagerTasks
    : Array.isArray(meta)
      ? meta
      : [];
  return { meta, list };
};

const extractSummaryPayload = (res) => {
  const raw = res?.data?.data;
  return raw?.ManagerTaskSummary ?? raw?.ManagerTasks ?? raw ?? null;
};

const mapTabStats = (meta, list) => ({
  totalTasks: meta?.totalTasks ?? list.length,
  totalPending: meta?.totalPending ?? 0,
  totalInProgress: meta?.totalInProgress ?? 0,
  totalCompleted: meta?.totalCompleted ?? 0,
  totalCancel: meta?.totalCancel ?? 0,
  pendingPercentage: meta?.pendingPercentage ?? 0,
  inProgressPercentage: meta?.inProgressPercentage ?? 0,
  completedPercentage: meta?.completedPercentage ?? 0,
  cancelPercentage: meta?.cancelPercentage ?? 0,
});


const mapTask = (t) => ({
  id: t.id ?? t.eventFunctionManagerTaskId,
  managerTaskId: t.managerTaskId,
  title: t.name ?? t.taskNameEnglish ?? t.taskName ?? t.title ?? "—",
  description: t.description ?? "",
  assignee: t.assigneeName ?? t.managerName ?? t.assignee ?? "—",
  managerId: t.managerId,
  eventFunctionId: t.eventFunctionId,
  eventId: t.eventId,
  remarks: t.remarks ?? "",
  latitude: t.latitude ?? null,
  longitude: t.longitude ?? null,
  rawStatus: t.status ?? "PENDING",
  status: normalizeStatusKey(t.status),
  priority: t.priority,
  type: t.type,
  files: (t.files || []).map((f) => ({
    fileKey: `existing-file-${f.id}`,
    id: f.id,
    file: null,
    name: f.fileName || f.name || f.imagePath?.split("/").pop() || `File #${f.id}`,
    url: f.fileUrl || f.url || f.imagePath || null,
  })),
  due: t.dueDate
    ? new Date(t.dueDate).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : t.due ?? "—",
});

export default function ManagerTask() {
  const { eventId: eventIdParam } = useParams();
  const location = useLocation();
  const { eventFunctionId, managerId, managerName, functionName, eventId: eventIdState } =
    location.state ?? {};
  const eventId = eventIdState ?? eventIdParam;

  const [activeTab, setActiveTab] = useState("PRE");

  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Cache task lists per tab so switching back to a tab already loaded
  // doesn't re-hit the API, but still shows a loader on first visit.
  const [tasksByTab, setTasksByTab] = useState({});
  // Cache each tab's own summary stats (totals + percentages) as returned
  // by GetEventFunctionManagerTask for that tab.
  const [tabStatsByTab, setTabStatsByTab] = useState({});
  const [tabLoading, setTabLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search box for filtering the currently visible tab's task list by title.
  const [searchTerm, setSearchTerm] = useState("");

  // ── View Details drawer state ─────────────────────────────────────────────
  const [detailTask, setDetailTask] = useState(null);
  const [draftDescription, setDraftDescription] = useState("");
  const [draftRemarks, setDraftRemarks] = useState("");
  const [draftStatus, setDraftStatus] = useState("PENDING");
  const [draftFiles, setDraftFiles] = useState([]);
  const [draftLatitude, setDraftLatitude] = useState("");
  const [draftLongitude, setDraftLongitude] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [isSavingDetail, setIsSavingDetail] = useState(false);

  // ---- Summary (overall progress / completed / pending) ----
  useEffect(() => {
    if (!eventFunctionId || !managerId) return;

    const fetchSummary = async () => {
      setSummaryLoading(true);
      try {
        const res = await GetSummaryManagerTask(eventFunctionId, managerId);
        const meta = extractSummaryPayload(res);

        if (!meta) {
          setSummary(null);
        } else {
          setSummary({
            totalCount: meta.totalTasks ?? 0,
            completedCount: meta.totalCompleted ?? 0,
            pendingCount: meta.totalPending ?? 0,
            inProgressCount: meta.totalInProgress ?? 0,
            cancelCount: meta.totalCancel ?? 0,
            completedPercentage: meta.completedPercentage ?? 0,
            pendingPercentage: meta.pendingPercentage ?? 0,
            inProgressPercentage: meta.inProgressPercentage ?? 0,
            cancelPercentage: meta.cancelPercentage ?? 0,
          });
        }
      } catch (err) {
        console.error("Failed to fetch manager task summary:", err);
        setError("Failed to load task summary.");
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchSummary();
  }, [eventFunctionId, managerId]);

  // ---- Per-tab task list + per-tab summary stats ----
  const fetchTasksForTab = useCallback(
    async (tabKey) => {
      if (!eventFunctionId || !managerId) return;
      setTabLoading(true);
      try {
        const res = await GetEventFunctionManagerTask(
          eventFunctionId,
          managerId,
          tabKey,
        );
        const { meta, list } = extractManagerTasksPayload(res);
        // Filter to this tab's type client-side as a safety net, in case
        // the endpoint ever returns the full unfiltered list instead of
        // just this tab's tasks.
        const filtered = list.filter(
          (t) => (t.type || "").toUpperCase() === tabKey,
        );
        setTasksByTab((prev) => ({
          ...prev,
          [tabKey]: filtered.map(mapTask),
        }));
        setTabStatsByTab((prev) => ({
          ...prev,
          [tabKey]: mapTabStats(meta, filtered),
        }));
      } catch (err) {
        console.error(`Failed to fetch ${tabKey} tasks:`, err);
        setError("Failed to load tasks for this tab.");
      } finally {
        setTabLoading(false);
      }
    },
    [eventFunctionId, managerId],
  );

  // Load the active tab whenever it changes (including first mount).
  useEffect(() => {
    fetchTasksForTab(activeTab);
  }, [activeTab, fetchTasksForTab]);

  // Reset the search box whenever the active tab changes, so a search typed
  // on one tab doesn't silently hide everything on the next.
  useEffect(() => {
    setSearchTerm("");
  }, [activeTab]);

  const allVisibleTasks = tasksByTab[activeTab] ?? [];
  const visibleTasks = searchTerm.trim()
    ? allVisibleTasks.filter((t) =>
        t.title.toLowerCase().includes(searchTerm.trim().toLowerCase()),
      )
    : allVisibleTasks;

  const activeTabMeta = TABS.find((t) => t.key === activeTab);
  const activeStats = tabStatsByTab[activeTab] ?? EMPTY_TAB_STATS;

  const pieData = [
    { name: "Pending", value: activeStats.pendingPercentage },
    { name: "In Progress", value: activeStats.inProgressPercentage },
    { name: "Completed", value: activeStats.completedPercentage },
    { name: "Cancelled", value: activeStats.cancelPercentage },
  ].filter((d) => d.value > 0);

  const completedCount = summary?.completedCount ?? 0;
  const pendingCount = summary?.pendingCount ?? 0;
  const total = summary?.totalCount ?? 0;
  const progressPct =
    summary?.completedPercentage ??
    (total ? Math.round((completedCount / total) * 100) : 0);

  // Tab badge counts come from each tab's own cached stats (populated once
  // that tab has been visited/fetched at least once).
  const counts = {
    PRE: tabStatsByTab.PRE?.totalTasks ?? 0,
    RUNNING: tabStatsByTab.RUNNING?.totalTasks ?? 0,
    POST: tabStatsByTab.POST?.totalTasks ?? 0,
  };

  // ── Drawer handlers ────────────────────────────────────────────────────────
  const handleOpenDetail = (task) => {
    setDetailTask(task);
    setDraftDescription(task.description || "");
    setDraftRemarks(task.remarks || "");
    setDraftStatus(task.rawStatus || "PENDING");
    setDraftFiles(task.files || []);
    setDraftLatitude(task.latitude != null ? String(task.latitude) : "");
    setDraftLongitude(task.longitude != null ? String(task.longitude) : "");
  };

  const handleCloseDetail = () => {
    if (isSavingDetail) return;
    setDetailTask(null);
    setDraftDescription("");
    setDraftRemarks("");
    setDraftStatus("PENDING");
    setDraftFiles([]);
    setDraftLatitude("");
    setDraftLongitude("");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire(
        "Not supported",
        "Your browser doesn't support location access.",
        "info",
      );
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDraftLatitude(String(position.coords.latitude));
        setDraftLongitude(String(position.coords.longitude));
        setIsLocating(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setIsLocating(false);
        Swal.fire(
          "Location unavailable",
          err?.code === 1
            ? "Location permission was denied. Please allow location access and try again."
            : "Couldn't fetch your current location. Please try again.",
          "error",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleAddDetailFiles = (fileList) => {
    const newFiles = Array.from(fileList || []).map((file) => ({
      fileKey: `file-${Math.random().toString(36).slice(2)}`,
      id: 0,
      file,
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    if (newFiles.length === 0) return;
    setDraftFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveDetailFile = (fileKey) => {
    setDraftFiles((prev) => prev.filter((f) => f.fileKey !== fileKey));
  };

  const handleSaveTaskDetails = async () => {
    if (!detailTask) return;
    if (!draftStatus) {
      Swal.fire("Status required", "Please select a status.", "info");
      return;
    }

    setIsSavingDetail(true);
    try {
      const userId = localStorage.getItem("userId");
      const formData = new FormData();
      formData.append("userId", parseInt(userId));

      const prefix = "eventFunctionManagerTasks[0]";
      formData.append(`${prefix}.id`, detailTask.id);
      formData.append(
        `${prefix}.eventFunctionId`,
        detailTask.eventFunctionId ?? eventFunctionId,
      );
      formData.append(`${prefix}.eventId`, detailTask.eventId ?? eventId);
      formData.append(
        `${prefix}.managerId`,
        detailTask.managerId ?? managerId,
      );
      formData.append(`${prefix}.managerTaskId`, detailTask.managerTaskId);
      formData.append(`${prefix}.status`, draftStatus);
      formData.append(`${prefix}.description`, draftDescription || "");
      formData.append(`${prefix}.remarks`, draftRemarks || "");
      formData.append(`${prefix}.latitude`, draftLatitude || "");
      formData.append(`${prefix}.longitude`, draftLongitude || "");

      draftFiles.forEach((f, j) => {
        const filePrefix = `${prefix}.files[${j}]`;
        formData.append(`${filePrefix}.id`, f.id || 0);
        if (f.file) {
          formData.append(`${filePrefix}.file`, f.file);
        }
      });

      await AssignEventFunctionManagerTask(formData);

      // Reflect the change locally across every cached tab without
      // re-fetching (the task may have moved tabs on the backend, e.g.
      // PRE -> RUNNING, but we keep it visible where it already loaded).
      setTasksByTab((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((tabKey) => {
          updated[tabKey] = (updated[tabKey] || []).map((t) =>
            t.id === detailTask.id
              ? {
                  ...t,
                  description: draftDescription,
                  remarks: draftRemarks,
                  rawStatus: draftStatus,
                  status: normalizeStatusKey(draftStatus),
                  files: draftFiles,
                  latitude: draftLatitude ? Number(draftLatitude) : null,
                  longitude: draftLongitude ? Number(draftLongitude) : null,
                }
              : t,
          );
        });
        return updated;
      });

      Swal.fire({
        title: "Saved",
        text: "Task details updated successfully!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      // Status/percentages may now be stale for the active tab since a
      // status just changed — refetch it to keep the pie chart and stat
      // cards accurate. Also refresh the overall summary cards.
      fetchTasksForTab(activeTab);

      handleCloseDetail();
    } catch (err) {
      console.error("Save task details error:", err);
      Swal.fire(
        "Error",
        "Failed to save task details. Please try again.",
        "error",
      );
    } finally {
      setIsSavingDetail(false);
    }
  };

  return (
    <Fragment>
      <Container>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">All Tasks</h1>
            <p className="text-sm text-gray-400">{functionName ?? "—"}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Top summary: progress + stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {/* Overall progress */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-center">
            <p className="text-sm text-gray-500 mb-1">Overall progress</p>
            <p className="text-4xl font-bold text-gray-900 mb-4">
              {summaryLoading ? "—" : `${progressPct}%`}
            </p>
            <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Completed */}
          <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-700">
                {summaryLoading ? "—" : completedCount}
              </p>
              <p className="text-sm text-emerald-700/80">Completed</p>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">
                {summaryLoading ? "—" : pendingCount}
              </p>
              <p className="text-sm text-amber-700/80">Pending</p>
            </div>
          </div>
        </div>

        {/* Task category tabs */}
        <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase mb-3">
          Task categories
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const accent = ACCENTS[tab.accent];
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative text-left bg-white rounded-2xl border p-4 flex items-center gap-3 transition-all overflow-hidden
                  ${isActive ? `ring-2 ${accent.ring} border-transparent shadow-md` : "border-gray-100 hover:shadow-sm"}
                `}
              >
                <span className={`absolute left-0 top-0 h-full w-1 ${accent.bar}`} />
                <div className={`w-11 h-11 rounded-full ${accent.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${accent.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{tab.label}</p>
                  <p className="text-xs text-gray-400 truncate">{tab.sub}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${accent.bg} ${accent.text}`}>
                  {counts[tab.key]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Per-tab stats + pie chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-4">
              {activeTabMeta.label} Breakdown
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: "Total", value: activeStats.totalTasks, cls: "text-gray-900 bg-gray-50" },
                { label: "Pending", value: activeStats.totalPending, cls: "text-amber-700 bg-amber-50" },
                { label: "In Progress", value: activeStats.totalInProgress, cls: "text-blue-700 bg-blue-50" },
                { label: "Completed", value: activeStats.totalCompleted, cls: "text-emerald-700 bg-emerald-50" },
                { label: "Cancelled", value: activeStats.totalCancel, cls: "text-red-700 bg-red-50" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl px-3 py-3 ${s.cls}`}>
                  <p className="text-xl font-bold">
                    {tabLoading && !tabStatsByTab[activeTab] ? "—" : s.value}
                  </p>
                  <p className="text-xs opacity-80">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="h-56">
            {tabLoading && !tabStatsByTab[activeTab] ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                Loading chart...
              </div>
            ) : pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-gray-400">
                No status data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={PIE_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Task list for the selected tab */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">{activeTabMeta.label}</h2>
              <span className="text-xs text-gray-400">
                {visibleTasks.length} task{visibleTasks.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search task..."
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <TableComponent
            columns={columns(handleOpenDetail)}
            data={visibleTasks}
            paginationSize={10}
            loading={tabLoading && !tasksByTab[activeTab]}
          />
        </div>
      </Container>

      {/* ── View Details Drawer ── */}
      {detailTask && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50"
            onClick={handleCloseDetail}
          />
          <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
              <button
                onClick={handleCloseDetail}
                disabled={isSavingDetail}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-50"
              >
                <i className="ki-filled ki-arrow-left text-sm" />
              </button>
              <h3 className="text-base font-bold text-gray-900">
                {activeTabMeta.label} Details
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800">
                {detailTask.title}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Work Description
                </p>
                <textarea
                  rows={4}
                  readOnly
                  maxLength={500}
                  value={draftDescription}
                  onChange={(e) => setDraftDescription(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Describe the work done..."
                />
                <p className="text-[11px] text-gray-400 text-right mt-1">
                  {draftDescription.length}/500
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-800">Location</p>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={isLocating}
                    className="text-xs font-semibold text-primary hover:underline disabled:opacity-50 flex items-center gap-1"
                  >
                    <i className="ki-filled ki-geolocation text-xs" />
                    {isLocating ? "Locating..." : "Use Current Location"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={draftLatitude}
                      onChange={(e) => setDraftLatitude(e.target.value)}
                      placeholder="e.g. 23.0225"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide block mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      inputMode="decimal"
                      value={draftLongitude}
                      onChange={(e) => setDraftLongitude(e.target.value)}
                      placeholder="e.g. 72.5714"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {draftLatitude && draftLongitude && (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <iframe
                      title="task-location-preview"
                      width="100%"
                      height="160"
                      style={{ border: 0 }}
                      loading="lazy"
                      src={`https://maps.google.com/maps?q=${draftLatitude},${draftLongitude}&z=15&output=embed`}
                    />
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Upload Work Proof
                </p>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-6 cursor-pointer hover:border-primary/40 transition text-gray-400">
                  <UploadCloud className="w-6 h-6" />
                  <span className="text-sm">Tap to upload photos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      handleAddDetailFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>

                {draftFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {draftFiles.map((f) => (
                      <div
                        key={f.fileKey}
                        className="relative rounded-lg overflow-hidden border border-gray-200 aspect-square bg-gray-100"
                      >
                        {f.url ? (
                          <img
                            src={f.url}
                            alt={f.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 px-1 text-center">
                            {f.name}
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveDetailFile(f.fileKey)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Remarks
                </p>
                <textarea
                  rows={4}
                  maxLength={500}
                  value={draftRemarks}
                  onChange={(e) => setDraftRemarks(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Add remarks about this task..."
                />
                <p className="text-[11px] text-gray-400 text-right mt-1">
                  {draftRemarks.length}/500
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Status <span className="text-red-500">*</span>
                </p>
                <select
                  value={draftStatus}
                  onChange={(e) => setDraftStatus(e.target.value)}
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleSaveTaskDetails}
                disabled={isSavingDetail}
                className="w-full bg-primary disabled:opacity-60 text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition"
              >
                <Save size={16} />
                {isSavingDetail ? "Saving..." : "Save Details"}
              </button>
            </div>
          </div>
        </>
      )}
    </Fragment>
  );
}