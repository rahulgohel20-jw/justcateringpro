import { useEffect, useState, useRef } from "react";
import {
  GETALLAssignaskmanager,
  addupdateeventvendordata,
  Translateapi,
} from "@/services/apiServices";
import ViewAllTask from "./Viewalltask";
import AddTask from "../../../../partials/modals/add-task/AddTask";
import Swal from "sweetalert2";
import { usePermission } from "../../../../hooks/usePermission";

// ─── Constants ────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  PENDING:   { bg: "bg-slate-100",  text: "text-slate-600",  dot: "bg-slate-400"  },
  RUNNING:   { bg: "bg-amber-50",   text: "text-amber-600",  dot: "bg-amber-400"  },
  CONFIRMED: { bg: "bg-green-50", text: "text-green-600",dot: "bg-green-500" },
  DONE:      { bg: "bg-blue-50",    text: "text-primary",   dot: "bg-blue-500"   },
  COMPLETED: { bg: "bg-green-50",    text: "text-green",   dot: "bg-green-500"   },
};

const RESOURCE_COLORS = {
  LABOUR:  { bg: "bg-violet-50",  text: "text-violet-600",  ring: "ring-violet-200" },
  OUTSIDE: { bg: "bg-orange-50",  text: "text-orange-600",  ring: "ring-orange-200" },
  CHEF:    { bg: "bg-blue-50",    text: "text-primary",    ring: "ring-blue-200"   },
  INSIDE:  { bg: "bg-teal-50",    text: "text-teal-600",    ring: "ring-teal-200"   },
};

const RESOURCE_TYPE_LABELS = {
  LABOUR: "Labour",
  OUTSIDE: "Outside",
  CHEF: "Chef",
  INSIDE: "Inside",
};

const INLINE_TASK_LIMIT = 3;

// ─── Helpers ──────────────────────────────────────────────────────────────

const getPhotoUrl = (photo) =>
  typeof photo === "string"
    ? photo
    : photo?.url ?? photo?.imageUrl ?? photo?.path ?? "";

const formatTimeToAMPM = (time24) => {
  if (!time24) return "";
  const [hoursStr, minutesStr = "00"] = time24.split(":");
  let hours = parseInt(hoursStr, 10);
  if (Number.isNaN(hours)) return time24;
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${String(hours).padStart(2, "0")}:${minutesStr} ${period}`;
};

const formatAMPMToTime24 = (timeStr) => {
  if (!timeStr) return "";
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return timeStr;
  const [, hoursStr, minutes, period] = match;
  if (!period) return timeStr;
  let hours = parseInt(hoursStr, 10);
  const upperPeriod = period.toUpperCase();
  if (upperPeriod === "PM" && hours !== 12) hours += 12;
  if (upperPeriod === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}`;
};

// Returns "HH:MM" in 24h from current time
const getNow24 = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
};

const formatDDMMYYYYWithTime = (d) => {
  const day   = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year  = d.getFullYear();
  let hours   = d.getHours();
  const mins  = String(d.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${day}/${month}/${year} ${String(hours).padStart(2, "0")}:${mins} ${period}`;
};

// ─── Sub-components ───────────────────────────────────────────────────────

/** Small info pill */
const InfoPill = ({ icon, label, value, className = "" }) => (
  <div className={`flex items-start gap-2.5 ${className}`}>
    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-primary truncate mt-0.5">{value || "—"}</p>
    </div>
  </div>
);

/** Single task row */
const TaskRow = ({ task, isComplete, onToggle, onDelete, onRemarksChange, AssignManagerPermission }) => {
  const resColor = RESOURCE_COLORS[task.resourceType] ?? RESOURCE_COLORS.CHEF;
  return (
    <div
      className={`rounded-xl border transition-all duration-200 ${
        isComplete
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3 px-3 py-3">
        {/* Checkbox circle */}
        <button
          onClick={() => onToggle(task.id)}
          className={`w-5 h-5 mt-0.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
            isComplete
              ? "bg-green-500 shadow-sm"
              : "border-2 border-gray-300 hover:border-green-400 bg-white"
          }`}
          title={isComplete ? "Mark pending" : "Mark done"}
        >
          {isComplete && (
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`text-sm font-semibold truncate ${isComplete ? "text-green-700 line-through decoration-green-400" : "text-gray-800"}`}>
              {task.nameEnglish}
            </p>
            {!task.isCommonTask && (
              <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">
                Custom
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ${resColor.bg} ${resColor.text} ${resColor.ring}`}>
              {RESOURCE_TYPE_LABELS[task.resourceType] || task.resourceType}
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${isComplete ? "text-green-500" : "text-gray-400"}`}>
              {isComplete ? "✓ Done" : "Pending"}
            </span>
          </div>
          <input
            type="text"
            value={task.remarks || ""}
            onChange={(e) => onRemarksChange(task.id, e.target.value, task.isCommonTask)}
            placeholder="Add remark…"
            className="mt-2 w-full text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        {/* Delete — frontend only */}
        {AssignManagerPermission.delete && (
        <button
          onClick={() => onDelete(task._uid ?? task.id, task.isCommonTask)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 flex-shrink-0 transition-colors mt-0.5"
          title="Remove task"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3M4 7h16" />
          </svg>
        </button>
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────

export default function ChefTaskSidebar({ isOpen, onClose, order, onArrivalTimeUpdated }) {
  const data = order?.raw ?? order ?? {};
  const photos = Array.isArray(data.vendorImages) ? data.vendorImages : [];

  // ── Task state ──
  const [predefinedTasks, setPredefinedTasks]         = useState([]);
  const [loadingPredefinedTasks, setLoadingPredefined] = useState(false);
  const [customTasks, setCustomTasks]                  = useState([]);
  const [completedPredefinedIds, setCompletedIds]      = useState(new Set());

  // ── Modal state ──
  const [isViewAllOpen, setIsViewAllOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const AssignManagerPermission = usePermission("Assign Manager")

  // ── Arrival / Punch-in ──
  // `hasPunchedIn` tracks whether the user already hit "Punch In" this session.
  // Once true, the button stays disabled; the time input stays editable.
  const [arrivalTimeValue, setArrivalTimeValue] = useState(
    formatAMPMToTime24(data.arrivalTime) || ""
  );
  const [hasPunchedIn, setHasPunchedIn] = useState(!!data.arrivalTime);

  // ── Upload ──
  const [uploadFiles, setUploadFiles]     = useState([]);
  const [uploadPreviews, setUploadPreviews] = useState([]);

  // ── Save state ──
  const [savingTasks, setSavingTasks]   = useState(false);
  const [savingPhotos, setSavingPhotos] = useState(false);

  // ── Quick add task ──
  const [quickTaskName, setQuickTaskName]   = useState("");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [pendingTranslations, setPendingTranslations] = useState(0);

  // ── Other fields ──
  const [confirmedQtyValue, setConfirmedQtyValue] = useState(data.labour?.confirmedQty ?? "");
  const [remarksValue, setRemarksValue]           = useState(data.remarks || "");

  // ── Sync when order prop changes ──
  useEffect(() => {
    setArrivalTimeValue(formatAMPMToTime24(data.arrivalTime) || "");
    setHasPunchedIn(!!data.arrivalTime);
  }, [data.arrivalTime]);

  useEffect(() => { setConfirmedQtyValue(data.labour?.confirmedQty ?? ""); }, [data.labour?.confirmedQty]);
  useEffect(() => { setRemarksValue(data.remarks || ""); }, [data.remarks]);

  // ── Lock body scroll ──
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── Load tasks ──
  useEffect(() => {
    if (!isOpen) return;

    const existingVendorTasks = Array.isArray(data.vendorTasks) ? data.vendorTasks : [];

    if (existingVendorTasks.length > 0) {
      const completedIds = new Set();
      const predefined = [];
      const custom = [];

      existingVendorTasks.forEach((vt) => {
        const mapped = {
          id: vt.taskId,
          // _uid: stable unique key used for delete — custom tasks from the API
          // can all have taskId=0, so we can't rely on id alone to identify them.
          _uid: vt.isCommonTask ? vt.taskId : `custom_${Date.now()}_${Math.random()}`,
          eventFunctionTaskId: vt.eventFunctionTaskId,
          nameEnglish: vt.taskName,
          nameGujarati: vt.taskNameGujarati,
          nameHindi: vt.taskNameHindi,
          resourceType: data.resourceType || "",
          remarks: vt.remarks || "",
        };
        if (vt.isCompleted) completedIds.add(vt.taskId);
        if (vt.isCommonTask) predefined.push(mapped);
        else custom.push(mapped);
      });

      setPredefinedTasks(predefined);
      setCustomTasks(custom);
      setCompletedIds(completedIds);
      setLoadingPredefined(false);
      return;
    }

    const resourceType = data.resourceType || "";
    const userId = localStorage.getItem("userId");
    setLoadingPredefined(true);
    GETALLAssignaskmanager(true, resourceType, userId)
      .then((res) => {
        const list = res?.data?.data?.TaskDetails;
        setPredefinedTasks(Array.isArray(list) ? list : []);
      })
      .catch((err) => { console.error("Error fetching tasks:", err); setPredefinedTasks([]); })
      .finally(() => setLoadingPredefined(false));
  }, [isOpen, data.id, data.resourceType]);

  // ── Derived ──
  const allTasks   = [
    ...predefinedTasks.map((t) => ({ ...t, isCommonTask: true })),
    ...customTasks.map((t)      => ({ ...t, isCommonTask: false })),
  ];
  const inlineTasks  = allTasks.slice(0, INLINE_TASK_LIMIT);
  const hasMoreTasks = allTasks.length > INLINE_TASK_LIMIT;
  const totalTasks   = allTasks.length;
  const doneTasks    = completedPredefinedIds.size;
  const progress     = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const circumference = 2 * Math.PI * 38; // r=38 matches the big progress ring
  const strokeDash    = (progress / 100) * circumference;

  const statusKey    = (data.status || "").toUpperCase();
  const statusConfig = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;
  const resColor     = RESOURCE_COLORS[data.resourceType] ?? RESOURCE_COLORS.CHEF;

  const orderCode  = `#${data.resourceType ?? "ORD"}-${data.id ?? "—"}`;
  const eventTitle = [data.functionNameEnglish?.trim(), data.eventNameEnglish].filter(Boolean).join(" — ") || "—";
  const chefInitials = (data.vendorNameEnglish || "—")
    .split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  // ── Punch In ──
  const handlePunchIn = () => {
    const now = getNow24();
    setArrivalTimeValue(now);
    setHasPunchedIn(true);
  };

  // ── Tasks ──
  const toggleComplete = (taskId) => {
    setCompletedIds((prev) => {
      const next = new Set(prev);
      next.has(taskId) ? next.delete(taskId) : next.add(taskId);
      return next;
    });
  };

  // Frontend-only delete: just remove from local state
  // Delete by both id AND isCommonTask flag so predefined tasks with id=0
  // (unsaved custom tasks from the API) never accidentally wipe each other out.
  const handleDeleteTask = (taskId, isCommonTask) => {
    if (isCommonTask) {
      setPredefinedTasks((prev) => prev.filter((t) => t.id !== taskId));
    } else {
      // For custom tasks, use object reference equality via a stable _uid
      // because multiple custom tasks can share taskId=0 from the API.
      setCustomTasks((prev) => {
        const idx = prev.findIndex((t) => t._uid === taskId || (!t._uid && t.id === taskId));
        if (idx === -1) return prev;
        return [...prev.slice(0, idx), ...prev.slice(idx + 1)];
      });
    }
    setCompletedIds((prev) => {
      if (!prev.has(taskId)) return prev;
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  };

  const handleTaskRemarksChange = (taskId, value, isCommonTask) => {
    const setter = isCommonTask ? setPredefinedTasks : setCustomTasks;
    setter((prev) => prev.map((t) => (t.id === taskId ? { ...t, remarks: value } : t)));
  };

  const handleQuickAddTask = async () => {
    const name = quickTaskName.trim();
    if (!name) return;

    const uid = `custom_${Date.now()}_${Math.random()}`;
    const newTask = {
      id: -(Date.now() + Math.floor(Math.random() * 1e6)),
      _uid: uid,   // stable identity for delete — never collides
      nameEnglish: name,
      nameGujarati: "",
      nameHindi: "",
      resourceType: data.resourceType || "",
      remarks: "",
    };

    setCustomTasks((prev) => [...prev, newTask]);
    setQuickTaskName("");
    setIsQuickAddOpen(false);

    setPendingTranslations((c) => c + 1);
    try {
      const res = await Translateapi(name);
      const translations = res?.data || res;
      const nameGujarati = translations?.gujarati || "";
      const nameHindi    = translations?.hindi    || "";
      setCustomTasks((prev) =>
        prev.map((t) => (t.id === newTask.id ? { ...t, nameGujarati, nameHindi } : t))
      );
    } catch (err) {
      console.error("Translation failed:", err);
    } finally {
      setPendingTranslations((c) => c - 1);
    }
  };

  // ── Photos ──
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadFiles((prev) => [...prev, ...files]);
    setUploadPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  };

  const handleRemoveNewFile = (index) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
    setUploadPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ── Build FormData ──
  const buildAssignmentFormData = () => {
    const fd = new FormData();
    const base = "assignments[0]";
    const userId = localStorage.getItem("userId") ?? "";

    fd.append(`${base}.arrivalTime`,      formatTimeToAMPM(arrivalTimeValue) || "");
    fd.append(`${base}.eventFunctionId`,  data.eventFunctionId ?? "");
    fd.append(`${base}.eventId`,          data.eventId ?? "");
    fd.append(`${base}.id`,              data.id ?? "");
    fd.append(`${base}.isPresent`,        hasPunchedIn);         // punched-in == present
    fd.append(`${base}.managerId`,        data.managerId ?? userId);
    fd.append(`${base}.remarks`,          remarksValue ?? "");
    fd.append(`${base}.reportingTime`,    data.reportingTime ?? "");
    fd.append(`${base}.resourceType`,     data.resourceType ?? "");
    // Status logic:
    //  • all tasks done  → "Completed"
    //  • some tasks done → "RUNNING"
    //  • none done       → keep original status from data
    const totalTaskCount = allTasks.length;
    const doneTaskCount  = allTasks.filter((t) => completedPredefinedIds.has(t.id)).length;
    const derivedStatus  =
      totalTaskCount > 0 && doneTaskCount === totalTaskCount ? "Completed"
      : doneTaskCount > 0                                    ? "RUNNING"
      : (data.status ?? "");
    fd.append(`${base}.status`, derivedStatus);
    fd.append(`${base}.userId`,           userId);
    fd.append(`${base}.vendorId`,         data.vendorId ?? "");

    fd.append(`${base}.chefLabour.helpers`,       data.chefLabour?.helpers       ?? "");
    fd.append(`${base}.chefLabour.labour`,         data.chefLabour?.labour        ?? "");
    fd.append(`${base}.chefLabour.staffCategory`,  data.chefLabour?.staffCategory ?? "");
    fd.append(`${base}.chefLabour.unitId`,          data.chefLabour?.unitId        ?? "");
    fd.append(`${base}.chefLabour.weight`,          data.chefLabour?.weight        ?? "");

    fd.append(`${base}.labour.assignedQty`,   data.labour?.assignedQty ?? "");
    fd.append(`${base}.labour.confirmedQty`,   confirmedQtyValue ?? "");
    fd.append(`${base}.labour.shift`,          data.labour?.shift ?? "");
    fd.append(`${base}.labour.staffCategory`,  data.labour?.staffCategory ?? "");

    fd.append(`${base}.outside.unitId`, data.outside?.unitId ?? "");
    fd.append(`${base}.outside.weight`, data.outside?.weight ?? "");

    allTasks.forEach((task, i) => {
      const isComplete          = completedPredefinedIds.has(task.id);
      const isUnsavedLocalTask  = !task.isCommonTask && Number(task.id) < 0;
      fd.append(`${base}.vendorTasks[${i}].assignmentId`,      data.id ?? "");
      fd.append(`${base}.vendorTasks[${i}].completedDate`,     isComplete ? formatDDMMYYYYWithTime(new Date()) : "");
      fd.append(`${base}.vendorTasks[${i}].eventFunctionTaskId`, isUnsavedLocalTask ? 0 : task.eventFunctionTaskId ?? task.id ?? "");
      fd.append(`${base}.vendorTasks[${i}].isCommonTask`,      !!task.isCommonTask);
      fd.append(`${base}.vendorTasks[${i}].isCompleted`,       isComplete);
      fd.append(`${base}.vendorTasks[${i}].taskId`,            isUnsavedLocalTask ? 0 : task.id ?? "");
      fd.append(`${base}.vendorTasks[${i}].taskName`,          task.nameEnglish    ?? "");
      fd.append(`${base}.vendorTasks[${i}].taskNameGujarati`,  task.nameGujarati   ?? "");
      fd.append(`${base}.vendorTasks[${i}].taskNameHindi`,     task.nameHindi      ?? "");
      fd.append(`${base}.vendorTasks[${i}].remarks`,           task.remarks        ?? "");
    });

    uploadFiles.forEach((file, i) => {
      fd.append(`${base}.vendorImages[${i}].assignmentId`, data.id ?? "");
      fd.append(`${base}.vendorImages[${i}].file`,         file);
      fd.append(`${base}.vendorImages[${i}].uploadId`,     "0");
    });

    return fd;
  };

  // ── Save all ──
  const handleSaveAll = async () => {
    setSavingTasks(true);
    setSavingPhotos(true);
    try {
      const formData = buildAssignmentFormData();
      const res      = await addupdateeventvendordata(formData);
      const resData  = res?.data;

      if (resData?.success) {
        Swal.fire({ icon: "success", title: "Saved", text: resData?.msg || "Saved successfully", timer: 2000, showConfirmButton: false });
        uploadPreviews.forEach((url) => URL.revokeObjectURL(url));
        setUploadFiles([]);
        setUploadPreviews([]);
        onArrivalTimeUpdated?.();
      } else {
        Swal.fire({ icon: "error", title: "Failed", text: resData?.msg || "Something went wrong" });
      }
    } catch (err) {
      console.error("Save failed:", err);
      Swal.fire({ icon: "error", title: "Failed", text: err?.response?.data?.msg || err?.message || "Something went wrong" });
    } finally {
      setSavingTasks(false);
      setSavingPhotos(false);
    }
  };

  const isSaving = savingTasks || savingPhotos;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full  w-full sm:max-w-xl z-50 bg-white shadow-2xl flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >

       
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0 bg-white">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${resColor.bg} ${resColor.text}`}>
              {chefInitials}
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 leading-tight">{data.vendorNameEnglish || "Chef Task Preview"}</h2>
              <div className="flex items-center gap-2 mt-0.5">
                {/* <span className="text-xs font-mono text-gray-400">{orderCode}</span> */}
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${data.status === "Completed"?"text-green-700":"text-gray-700"} ${statusConfig.dot}`} />
                  {data.status ?? "Pending"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ──────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 no-scrollbar">

          {/* Event info card */}
          <div className="mx-4 mt-4 rounded-2xl bg-white border border-gray-100 shadow-sm p-4 grid grid-cols-2 gap-4">
            <InfoPill
              label="Function / Event"
              value={eventTitle}
              className="col-span-2"
              icon={
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
            <InfoPill
              label="Location"
              value={data.venue}
              icon={
                <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />
            <InfoPill
              label="Resource Type"
              value={RESOURCE_TYPE_LABELS[data.resourceType] || data.resourceType}
              icon={
                <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
          </div>

          {/* ── Timing + Punch-in card ───────────────────────────────── */}
          <div className="mx-4 mt-3 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Timing</p>

            <div className="grid grid-cols-2 gap-3">
              {/* Reporting time — read-only */}
              <div className="bg-gray-50 rounded-xl px-3 py-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Reporting
                </p>
                <p className="text-sm font-bold text-gray-800">{data.reportingTime || "—"}</p>
              </div>

              {/* Arrival — editable input + punch-in button */}
              <div className="bg-gray-50 rounded-xl px-3 py-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Arrival
                </p>
                {/* Time input — always editable */}
                <input
                  type="time"
                  value={arrivalTimeValue}
                  disabled={!AssignManagerPermission.add || AssignManagerPermission.edit}
                  onChange={(e) => setArrivalTimeValue(e.target.value)}
                  className="w-full text-sm font-bold text-gray-800 bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-400 mb-2"
                />
                {(AssignManagerPermission.add || AssignManagerPermission.edit) && (
                <button
                  onClick={handlePunchIn}
                  disabled={hasPunchedIn}
                  title={hasPunchedIn ? `Punched in at ${formatTimeToAMPM(arrivalTimeValue)}` : "Set current time as arrival"}
                  className={`w-full flex items-center justify-center gap-1.5 text-[11px] font-bold py-1.5 rounded-lg transition-all ${
                    hasPunchedIn
                      ? "bg-green-50 text-green-600 border border-green-200 cursor-not-allowed"
                      : "bg-primary text-white hover:bg-blue-700 active:scale-95"
                  }`}
                >
                  {hasPunchedIn ? (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      Punched In · {formatTimeToAMPM(arrivalTimeValue)}
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Punch In Now
                    </>
                  )}
                </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Confirmed Qty (Labour only) ──────────────────────────── */}
          {data.resourceType === "LABOUR" && (
            <div className="mx-4 mt-3 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Confirmed Qty</p>
              <input
                type="number"
                min="0"
                value={confirmedQtyValue}
                onChange={(e) => setConfirmedQtyValue(e.target.value)}
                placeholder="0"
                className="w-32 text-sm font-bold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          )}

          {/* ── Assigned Tasks ───────────────────────────────────────── */}
          <div className="mx-4 mt-3 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            {/* Header row — big progress ring */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Assigned Tasks</h3>
                <p className="text-sm text-gray-700 mt-0.5">
                  {totalTasks > 0
                    ? `${doneTasks} of ${totalTasks} Done`
                    : "No tasks yet"}
                </p>
                {/* Linear progress bar under the label */}
                {totalTasks > 0 && (
                  <div className="mt-2 w-40">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress === 100 ? "bg-green-500" : "bg-primary"
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Big circular progress ring */}
              {totalTasks > 0 && (
                <div className="relative w-20 h-20 flex-shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 88 88">
                    {/* Track */}
                    <circle cx="44" cy="44" r="38" fill="none" stroke="#f3f4f6" strokeWidth="7" />
                    {/* Progress */}
                    <circle
                      cx="44" cy="44" r="38" fill="none"
                      stroke={progress === 100 ? "#28A745" : "#2563eb"}
                      strokeWidth="7"
                      strokeLinecap="round"
                      strokeDasharray={`${strokeDash} ${circumference}`}
                      style={{ transition: "stroke-dasharray 0.5s ease" }}
                    />
                  </svg>
                  {/* Centre label */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-lg font-black leading-none ${progress === 100 ? "text-green-700" : "text-primary"}`}>
                      {progress}%
                    </span>
                 
                  </div>
                </div>
              )}
            </div>

            {/* Task list */}
            {loadingPredefinedTasks ? (
              <div className="flex items-center gap-2 py-6 justify-center">
                <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <span className="text-xs text-gray-400">Loading tasks…</span>
              </div>
            ) : allTasks.length > 0 ? (
              <div className="space-y-2">
                {inlineTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    isComplete={completedPredefinedIds.has(task.id)}
                    onToggle={toggleComplete}
                    onDelete={handleDeleteTask}
                    onRemarksChange={handleTaskRemarksChange}
                    AssignManagerPermission={AssignManagerPermission}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 rounded-xl border-2 border-dashed border-gray-200">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-xs text-gray-400">No tasks for this resource type</p>
              </div>
            )}

            {/* View more / Add task */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
              {hasMoreTasks ? (
                <button
                  onClick={() => setIsViewAllOpen(true)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View all ({allTasks.length - INLINE_TASK_LIMIT} more)
                </button>
              ) : <span />}
              <button
                onClick={() => setIsQuickAddOpen((p) => !p)}
                className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </button>
            </div>

            {/* Quick add input */}
            {isQuickAddOpen && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={quickTaskName}
                  onChange={(e) => setQuickTaskName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); handleQuickAddTask(); }
                    if (e.key === "Escape") { setIsQuickAddOpen(false); setQuickTaskName(""); }
                  }}
                  placeholder="Type task name and press Enter…"
                  autoFocus
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
                <button
                  type="button"
                  onClick={handleQuickAddTask}
                  disabled={!quickTaskName.trim()}
                  className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => { setIsQuickAddOpen(false); setQuickTaskName(""); }}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* ── Remarks ──────────────────────────────────────────────── */}
          <div className="mx-4 mt-3 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Remarks</p>
            <textarea
              value={remarksValue}
              onChange={(e) => setRemarksValue(e.target.value)}
              placeholder="Add remarks…"
              rows={2}
              className="w-full text-sm text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>

          {/* ── Work Proof ───────────────────────────────────────────── */}
          <div className="mx-4 mt-3 mb-6 rounded-2xl bg-white border border-gray-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-900">Work Proof</h3>
              <div className="flex items-center gap-3">
                {photos.length > 0 && (
                  <button className="text-xs font-semibold text-primary hover:underline">View All</button>
                )}
                <label className="text-xs font-semibold text-primary hover:underline cursor-pointer flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Photos
                  <input type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                </label>
              </div>
            </div>

            {photos.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {photos.map((photo, i) => (
                  <div key={i} className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 ring-1 ring-gray-200">
                    <img src={getPhotoUrl(photo)} alt={`proof-${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : uploadPreviews.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-gray-200">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xs text-gray-400">No photos uploaded yet</p>
              </div>
            ) : null}

            {uploadPreviews.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  New ({uploadPreviews.length})
                </p>
                <div className="flex gap-2 flex-wrap">
                  {uploadPreviews.map((url, i) => (
                    <div key={url} className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 group ring-1 ring-gray-200">
                      <img src={url} alt={`new-${i}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleRemoveNewFile(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Sticky footer ────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-gray-100 px-5 py-3.5 bg-white flex items-center justify-between gap-3">
          {/* Progress summary */}
          <p className="text-xs text-gray-400">
            {totalTasks > 0
              ? <><span className="font-semibold text-gray-700">{doneTasks}/{totalTasks} Tasks Done</span> </>
              : "No tasks"}
            {hasPunchedIn && (
              <span className="ml-2 text-green-600 font-semibold">· Punched In</span>
            )}
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-gray-500 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            {(AssignManagerPermission.add || AssignManagerPermission.edit) && (
            <button
              onClick={handleSaveAll}
              disabled={isSaving || pendingTranslations > 0}
              className="text-xs font-bold bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-purple-900 disabled:opacity-50 flex items-center gap-1.5 min-w-[110px] justify-center transition-colors"
            >
              {pendingTranslations > 0 ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Translating…
                </>
              ) : isSaving ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Saving…
                </>
              ) : (
                "Save Changes"
              )}
            </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <ViewAllTask
        isModalOpen={isViewAllOpen}
        setIsModalOpen={setIsViewAllOpen}
        tasks={allTasks}
        completedIds={completedPredefinedIds}
        onToggleComplete={toggleComplete}
        onDeleteTask={handleDeleteTask}
        onTaskRemarksChange={handleTaskRemarksChange}
        resourceType={data.resourceType}
        quickTaskName={quickTaskName}
        setQuickTaskName={setQuickTaskName}
        isQuickAddOpen={isQuickAddOpen}
        setIsQuickAddOpen={setIsQuickAddOpen}
        onQuickAdd={handleQuickAddTask}
      />

      <AddTask
        isModalOpen={isAddTaskOpen}
        setIsModalOpen={setIsAddTaskOpen}
        editData={{ resourceType: data.resourceType }}
        onSuccess={(newTask) => setCustomTasks((prev) => [...prev, newTask])}
      />
    </>
  );
}