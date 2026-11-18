import React, { useState, useEffect, useRef } from "react";
import {
  getallassignfunctionbyevent,
  getCurrentAttendance,
  GetEventFunctionManagerTask,
  GetSpecialNotes,
  GetAllManagerTask,
  geratemangerallreport,
} from "@/services/apiServices";
import { TableComponent } from "@/components/table/TableComponent";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import FeedbackModal from "./FeedbackModal";
import {
  Users2,
  ChefHat,
  ListChecks,
  NotebookPen,
  MessageSquare,
  FileText,
} from "lucide-react";
import Swal from "sweetalert2";
import {
  ASSIGNED_FUNCTIONS_COLUMNS,
  ASSIGNED_FUNCTIONS_DEFAULT_SORTING,
} from "./constant";
import { Tooltip } from "antd";

const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const statusStyles = {
  PUNCHED_IN: "bg-green-100 text-green-700",
  PUNCHED_OUT: "bg-gray-100 text-gray-700",
};

const ITEM_STATUS_BADGE = {
  PENDING: "bg-amber-50 text-amber-600",
  INPROGRESS: "bg-blue-50 text-blue-600",
  IN_PROGRESS: "bg-blue-50 text-blue-600",
  RUNNING: "bg-blue-50 text-blue-600",
  COMPLETED: "bg-green-50 text-green-600",
  CANCEL: "bg-red-50 text-red-500",
  CANCELLED: "bg-red-50 text-red-500",
};

const PRIORITY_BADGE = {
  LOW: "bg-slate-50 text-slate-500 border border-slate-200",
  MEDIUM: "bg-amber-50 text-amber-600 border border-amber-200",
  HIGH: "bg-red-50 text-red-600 border border-red-200",
};

const StatusPill = ({ value }) => {
  const s = String(value || "PENDING").toUpperCase();
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
        ITEM_STATUS_BADGE[s] || ITEM_STATUS_BADGE.PENDING
      }`}
    >
      {s.replaceAll("_", " ")}
    </span>
  );
};

const AttendanceRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
    <span className="text-[13px] text-gray-500">{label}</span>
    <span className="text-[13px] font-semibold text-slate-900 text-right">
      {value ?? "—"}
    </span>
  </div>
);

const mapLink = (lat, lng) =>
  lat != null && lng != null ? (
    <a
      href={`https://www.google.com/maps?q=${lat},${lng}`}
      target="_blank"
      rel="noreferrer"
      className="text-primary hover:underline"
    >
      {lat}, {lng}
    </a>
  ) : (
    "—"
  );

const FileThumbs = ({ files }) => {
  const list = (files || [])
    .map((f) => ({ id: f.id, url: f.imagePath || f.fileUrl || f.url || f.path || "" }))
    .filter((f) => f.url);
  if (!list.length) return null;
  return (
    <div className="flex items-center gap-1.5 flex-wrap mt-2">
      {list.map((f, i) => (
        <a
          key={f.id ?? i}
          href={f.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block h-10 w-10 overflow-hidden rounded-lg ring-1 ring-gray-200 bg-gray-100"
        >
          <img src={f.url} alt={`file-${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
        </a>
      ))}
    </div>
  );
};

const ManagerInfoCard = ({ manager }) => (
  <div className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center justify-between flex-wrap gap-4 mb-7 shadow-sm">
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="text-[18px] font-bold text-slate-900 tracking-[-0.3px]">
          {manager.name}
        </span>

        <span className="bg-blue-100 text-blue-700 text-[11px] font-semibold rounded-full px-3 py-1 uppercase tracking-wide">
          {manager.badge}
        </span>
      </div>

      <div className="flex items-center gap-5 flex-wrap">
        <span className="flex items-center gap-1.5 text-[13px] text-gray-600">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          {manager.eventStartDate}
        </span>

        <span className="flex items-center gap-1.5 text-[13px] text-gray-600">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {manager.location}
        </span>
      </div>
    </div>
  </div>
);

const MODAL_TABS = [
  { key: "attendance", label: "Attendance" },
  { key: "tasks", label: "Tasks" },
  { key: "notes", label: "Special Notes" },
];

const ViewAssignMember = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [eventData, setEventData] = useState(null);
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Row whose "Task Views" icon was clicked. Modal shows while non-null.
  const [selectedFunction, setSelectedFunction] = useState(null);

  // Manager modal state (attendance + tasks + special notes)
  const [attendanceFn, setAttendanceFn] = useState(null);
  const [activeTab, setActiveTab] = useState("attendance");
  const [attendance, setAttendance] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [sectionErrors, setSectionErrors] = useState({});
  const [feedbackModal, setFeedbackModal] = useState(null);

  // Report modal state
  const [reportOpen, setReportOpen] = useState(false);
  const [reportFunctionId, setReportFunctionId] = useState(-1);
  const [reportLoading, setReportLoading] = useState(false);

  // Task master (id -> name), fetched once
  const taskMasterRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getallassignfunctionbyevent(eventId);
        const data = res?.data?.data?.[0];
        if (data) {
          setEventData(data);
          setFunctions(
            (data.eventFunctions ?? []).map((fn) => ({
              eventFunctionId: fn.eventFunctionId,
              functionName: fn.functionNameEnglish,
              venue: fn.venue,
              startDate: formatDateTime(fn.functionStartDate),
              endDate: formatDateTime(fn.functionEndDate),
              pax: fn.pax ?? "—",
              managers: fn.managers?.length
                ? fn.managers.map((m) => m.managerName).join(", ")
                : "No managers assigned",
              // Raw managers list, used for the clickable names and for navigation
              managersRaw: fn.managers ?? [],
              managerId: fn.managers?.[0]?.managerId ?? null,
            })),
          );
        }
      } catch (err) {
        console.error("Failed to fetch event functions:", err);
        setError("Failed to load event data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  const manager = {
    name: eventData
      ? `${eventData.partyNameEnglish} - ${eventData.eventNameEnglish}`
      : "—",
    badge: eventData?.status === "1" ? "Confirmed" : "Inquiry",
    eventStartDate: formatDateTime(eventData?.eventStartDate),
    location: eventData?.venueEnglish ?? "—",
  };

  const handleChefOutsideLabourClick = (fn) => {
    setSelectedFunction(null);
    navigate(`/event-view/assginMemberview/mangerorder`, {
      state: {
        eventId: eventData?.eventId,
        eventFunctionId: fn.eventFunctionId,
        functionName: fn.functionName,
      },
    });
  };

  const handleAllTaskClick = (fn) => {
    setSelectedFunction(null);
    navigate(`/event-view/managertask/${eventData?.eventId}`, {
      state: {
        eventId: eventData?.eventId,
        eventFunctionId: fn.eventFunctionId,
        managerId: fn.managerId,
        functionName: fn.functionName,
      },
    });
  };

  // View existing Special Notes for this function/manager
  const handleSpecialNotesViewClick = (fn) => {
    setSelectedFunction(null);
    navigate(`/event-view/managerspecialnotes/${eventData?.eventId}`, {
      state: {
        eventId: eventData?.eventId,
        eventFunctionId: fn.eventFunctionId,
        managerId: fn.managerId,
        functionName: fn.functionName,
      },
    });
  };

  const handleAssignTaskClick = (fn) => {
    navigate(`/event-view/eventassignmanagertask/${eventData?.eventId}`, {
      state: {
        eventFunctionId: fn.eventFunctionId,
        managerId: fn.managerId,
        managerName: fn.managersRaw?.[0]?.managerName ?? null,
        functionName: fn.functionName,
      },
    });
  };

  // managerName is passed along so the page can show it without fetching the member list
  const handleAssignSpecialNotesClick = (fn) => {
    navigate(`/event-view/eventassignmanagerspecialnotes/${eventData?.eventId}`, {
      state: {
        eventFunctionId: fn.eventFunctionId,
        managerId: fn.managerId,
        managerName: fn.managersRaw?.[0]?.managerName ?? null,
        functionName: fn.functionName,
      },
    });
  };

  const loadTaskMaster = async (userId) => {
    if (taskMasterRef.current) return taskMasterRef.current;
    const res = await GetAllManagerTask(userId);
    const list =
      res?.data?.data?.["ManagerTasks"] || res?.data?.data || res?.data?.ManagerTask || [];
    const map = {};
    (Array.isArray(list) ? list : []).forEach((t) => {
      map[t.id] = t.nameEnglish || t.name || t.taskName || `Task #${t.id}`;
    });
    taskMasterRef.current = map;
    return map;
  };

  // Click on a manager name -> modal with attendance, tasks and special notes
  const handleAttendanceClick = async (fn, mgr) => {
    const userId = localStorage.getItem("userId");

    setAttendanceFn({ ...fn, clickedManagerName: mgr?.managerName, clickedManagerId: mgr?.managerId });
    setActiveTab("attendance");
    setAttendance(null);
    setTasks([]);
    setNotes([]);
    setSectionErrors({});
    setModalLoading(true);

    // One failing call shouldn't blank out the other sections
    const [attRes, taskRes, noteRes, masterRes] = await Promise.allSettled([
      getCurrentAttendance(fn.eventFunctionId, mgr?.managerId),
      GetEventFunctionManagerTask(fn.eventFunctionId, mgr?.managerId, ""),
      GetSpecialNotes(fn.eventFunctionId, mgr?.managerId, userId),
      loadTaskMaster(userId),
    ]);

    const errors = {};

    if (attRes.status === "fulfilled") {
      setAttendance(attRes.value?.data?.data ?? attRes.value?.data ?? null);
    } else {
      console.error("Failed to fetch attendance:", attRes.reason);
      errors.attendance = "Failed to load attendance.";
    }

    if (taskRes.status === "fulfilled") {
      const master = masterRes.status === "fulfilled" ? masterRes.value : {};
      const raw =
        taskRes.value?.data?.data?.ManagerTasks?.functionManagerTasks ||
        taskRes.value?.data?.data ||
        [];
      setTasks(
        (Array.isArray(raw) ? raw : []).map((t, i) => ({
          key: t.id ?? i,
          name:
            master[t.managerTaskId] ||
            t.taskName ||
            t.managerTaskName ||
            t.nameEnglish ||
            `Task #${t.managerTaskId ?? t.id}`,
          status: t.status || "PENDING",
          remarks: t.remarks || "",
          files: t.files || [],
        })),
      );
    } else {
      console.error("Failed to fetch tasks:", taskRes.reason);
      errors.tasks = "Failed to load tasks.";
    }

    if (noteRes.status === "fulfilled") {
      const raw = noteRes.value?.data?.data?.["SpecialNotes"];
      const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
      setNotes(
        list.map((n, i) => ({
          key: n.id ?? i,
          sequence: n.sequence ?? i + 1,
          name: n.name || "",
          description: n.description || "",
          priority: n.priority || "MEDIUM",
          status: n.status || "PENDING",
          remarks: n.remarks || "",
          files: n.files || [],
        })),
      );
    } else {
      console.error("Failed to fetch special notes:", noteRes.reason);
      errors.notes = "Failed to load special notes.";
    }

    setSectionErrors(errors);
    setModalLoading(false);
  };

  const closeAttendanceModal = () => {
    setAttendanceFn(null);
    setAttendance(null);
    setTasks([]);
    setNotes([]);
    setSectionErrors({});
  };

  const openFeedbackModal = (fn) => {
    setFeedbackModal({
      eventFunctionId: fn.eventFunctionId,
      functionName: fn.functionName,
    });
  };

  const closeFeedbackModal = () => {
    setFeedbackModal(null);
  };

  const openReportModal = () => {
    setReportFunctionId(-1); // default: All Functions
    setReportOpen(true);
  };

  const handleGenerateReport = async () => {
    // Open the tab now, inside the click, so the browser doesn't block it after the await
    const win = window.open("", "_blank");
    try {
      setReportLoading(true);
      const userId = localStorage.getItem("userId");
      const res = await geratemangerallreport(
        reportFunctionId,
        eventData?.eventId ?? eventId,
        userId,
      );
      const d = res?.data;
      const url =
        d?.report_path ||
        d?.data?.report_path ||
        d?.file_path ||
        d?.data?.file_path ||
        d?.url ||
        (typeof d?.data === "string" ? d.data : null);

      if (!url) throw new Error(d?.msg || d?.message || "No report URL returned");

      if (win) win.location.href = url;
      else window.open(url, "_blank");
      setReportOpen(false);
    } catch (err) {
      win?.close();
      Swal.fire({
        title: "Error",
        text:
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to generate report.",
        icon: "error",
      });
    } finally {
      setReportLoading(false);
    }
  };

  const columns = ASSIGNED_FUNCTIONS_COLUMNS.map((col) => {
    // Manager column -> clickable names
    if (col.id === "managers") {
      return {
        ...col,
        cell: ({ row }) => {
          const list = row.original.managersRaw ?? [];
          if (!list.length) {
            return <span className="text-gray-400 text-[13px]">No managers assigned</span>;
          }
          return (
            <div className="flex flex-wrap items-center gap-1.5">
              {list.map((m) => (
                <button
                  key={m.managerId}
                  type="button"
                  onClick={() => handleAttendanceClick(row.original, m)}
                  className="bg-gray-100 hover:bg-primary hover:text-white text-primary text-[13px] font-medium rounded-full px-3 py-1 underline underline-offset-2 transition-colors"
                >
                  {m.managerName}
                </button>
              ))}
            </div>
          );
        },
      };
    }

    // Action column
    if (col.id === "action") {
      return {
        ...col,
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-3">
            <Tooltip title="Assign Task">
              <button
                onClick={() => handleAssignTaskClick(row.original)}
                className="text-slate-600 hover:text-primary text-lg transition-colors"
                aria-label="Assign task"
              >
                <Users2 size={17} />
              </button>
            </Tooltip>

            <Tooltip title="Assign Special Notes">
              <button
                onClick={() => handleAssignSpecialNotesClick(row.original)}
                className="text-slate-600 hover:text-primary text-lg transition-colors"
                aria-label="Assign special notes"
              >
                <NotebookPen size={17} />
              </button>
            </Tooltip>

            <Tooltip title="Task Views">
              <button
                onClick={() => setSelectedFunction(row.original)}
                className="text-slate-600 hover:text-primary text-lg transition-colors"
                aria-label="Task views"
              >
                <ListChecks size={17} />
              </button>
            </Tooltip>

            <Tooltip title="Feedback">
              <button
                onClick={() => openFeedbackModal(row.original)}
                className="text-slate-600 hover:text-primary text-lg transition-colors"
                aria-label="Feedback"
              >
                <MessageSquare size={17} />
              </button>
            </Tooltip>
          </div>
        ),
      };
    }

    return col;
  });

  const tabCount = { tasks: tasks.length, notes: notes.length };

  return (
    <div className="min-h-screen p-7">
      <div className="mb-4">
        <Breadcrumbs
          items={[
            { title: "Events", path: "/calendar" },
            { title: "Manager Details" },
          ]}
        />
      </div>

      <ManagerInfoCard manager={manager} />

      <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Assigned Functions
          </h2>

          <p className="text-[13px] text-slate-500 mt-1">
            Overview of functions for{" "}
            {eventData
              ? `${eventData.eventNameEnglish} — ${eventData.partyNameEnglish}`
              : "this event"}
          </p>
        </div>

        <button
          type="button"
          onClick={openReportModal}
          disabled={loading || !!error}
          className="btn btn-primary flex items-center gap-2"
        >
          <FileText size={16} />
          Report
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400 gap-2">
            <svg
              className="animate-spin h-5 w-5 text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading functions...
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-sm text-red-400">
            {error}
          </div>
        ) : functions.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            No functions assigned for this event.
          </div>
        ) : (
          <TableComponent
            columns={columns}
            data={functions}
            defaultSorting={ASSIGNED_FUNCTIONS_DEFAULT_SORTING}
            paginationSize={10}
          />
        )}
      </div>

      {/* Task Views modal */}
      {selectedFunction && (
        <CustomModal
          open={!!selectedFunction}
          onClose={() => setSelectedFunction(null)}
          title="Manager View"
          width={680}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
            <div
              onClick={() => handleAllTaskClick(selectedFunction)}
              className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center min-h-[130px] cursor-pointer hover:shadow-md hover:border-indigo-200 transition"
            >
              <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center mb-3">
                <Users2 size={32} className="text-primary" />
              </div>
              <p className="font-semibold text-gray-700 text-center">All Task</p>
            </div>

            <div
              onClick={() => handleChefOutsideLabourClick(selectedFunction)}
              className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center min-h-[130px] cursor-pointer hover:shadow-md hover:border-emerald-200 transition"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                <ChefHat size={32} className="text-primary" />
              </div>
              <p className="font-semibold text-gray-700 text-center">
                Chef, Outside & Labour View
              </p>
            </div>
          </div>
        </CustomModal>
      )}

      {feedbackModal && (
        <FeedbackModal
          open={!!feedbackModal}
          onClose={closeFeedbackModal}
          eventId={Number(eventData?.eventId ?? eventId ?? 0)}
          eventFunctionId={feedbackModal.eventFunctionId}
          functionName={feedbackModal.functionName}
        />
      )}

      {/* Report modal: pick All Functions (-1) or a single function, then generate */}
      {reportOpen && (
        <CustomModal
          open={reportOpen}
          onClose={() => setReportOpen(false)}
          title="Generate Report"
          width={520}
        >
          <div className="p-2 space-y-4">
            {/* Event details */}
            <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-1">
              <p className="text-sm font-semibold text-slate-900">{manager.name}</p>
              <p className="text-[13px] text-gray-600">{manager.eventStartDate}</p>
              <p className="text-[13px] text-gray-600">{manager.location}</p>
            </div>

            {/* Function select */}
            <div>
              <label className="block text-sm font-semibold mb-2">Select Function</label>
              <select
                className="w-full border rounded-lg px-4 py-2"
                value={reportFunctionId}
                onChange={(e) => setReportFunctionId(Number(e.target.value))}
              >
                <option value={-1}>All Functions</option>
                {functions.map((fn) => (
                  <option key={fn.eventFunctionId} value={fn.eventFunctionId}>
                    {fn.functionName} ({fn.startDate})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReportOpen(false)}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={reportLoading}
                className="btn btn-primary"
              >
                {reportLoading ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>
        </CustomModal>
      )}

      {/* Manager modal: attendance + tasks + special notes */}
      {attendanceFn && (
        <CustomModal
          open={!!attendanceFn}
          onClose={closeAttendanceModal}
          title={attendanceFn.clickedManagerName || "Manager"}
          width={720}
        >
          <div className="p-2">
            <p className="text-[13px] text-gray-500 mb-3">{attendanceFn.functionName}</p>

            {/* Tabs */}
            <div className="flex items-center gap-1 border-b border-gray-200 mb-4">
              {MODAL_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-[13px] font-semibold -mb-px border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {tab.label}
                  {!modalLoading && tabCount[tab.key] !== undefined && (
                    <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600">
                      {tabCount[tab.key]}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-1">
              {modalLoading ? (
                <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                  Loading...
                </div>
              ) : activeTab === "attendance" ? (
                sectionErrors.attendance ? (
                  <div className="flex items-center justify-center py-10 text-sm text-red-400">
                    {sectionErrors.attendance}
                  </div>
                ) : !attendance ? (
                  <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                    No attendance found.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-base font-bold text-slate-900">
                        {attendance.managerName ?? "—"}
                      </span>
                      <span
                        className={`text-[11px] font-semibold rounded-full px-3 py-1 uppercase tracking-wide ${
                          statusStyles[attendance.status] ?? "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {attendance.status?.replaceAll("_", " ") ?? "—"}
                      </span>
                    </div>

                    <AttendanceRow label="Shift" value={attendance.shiftName} />
                    <AttendanceRow label="Punch In" value={attendance.punchInTimeDisplay} />
                    <AttendanceRow label="Punch Out" value={attendance.punchOutTimeDisplay} />
                    <AttendanceRow label="Total Duration" value={attendance.totalDurationDisplay} />
                    <AttendanceRow
                      label="Punch In Location"
                      value={mapLink(attendance.punchInLat, attendance.punchInLng)}
                    />
                    <AttendanceRow
                      label="Punch Out Location"
                      value={mapLink(attendance.punchOutLat, attendance.punchOutLng)}
                    />

                    {attendance.message && (
                      <p className="mt-3 text-[13px] text-gray-600">{attendance.message}</p>
                    )}
                  </>
                )
              ) : activeTab === "tasks" ? (
                sectionErrors.tasks ? (
                  <div className="flex items-center justify-center py-10 text-sm text-red-400">
                    {sectionErrors.tasks}
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                    No tasks assigned.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((t, i) => (
                      <div
                        key={t.key}
                        className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-gray-800">
                            <span className="mr-2 text-gray-400">{i + 1}.</span>
                            {t.name}
                          </p>
                          <StatusPill value={t.status} />
                        </div>
                        {t.remarks && (
                          <p className="mt-1 text-xs text-gray-500">Remarks: {t.remarks}</p>
                        )}
                        <FileThumbs files={t.files} />
                      </div>
                    ))}
                  </div>
                )
              ) : sectionErrors.notes ? (
                <div className="flex items-center justify-center py-10 text-sm text-red-400">
                  {sectionErrors.notes}
                </div>
              ) : notes.length === 0 ? (
                <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                  No special notes.
                </div>
              ) : (
                <div className="space-y-2">
                  {notes.map((n) => (
                    <div
                      key={n.key}
                      className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-gray-800">
                          <span className="mr-2 text-gray-400">{n.sequence}.</span>
                          {n.name}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                              PRIORITY_BADGE[n.priority] || PRIORITY_BADGE.MEDIUM
                            }`}
                          >
                            {n.priority}
                          </span>
                          <StatusPill value={n.status} />
                        </div>
                      </div>
                      {n.description && (
                        <p className="mt-1 text-xs text-gray-600">{n.description}</p>
                      )}
                      {n.remarks && (
                        <p className="mt-1 text-xs text-gray-500">Remarks: {n.remarks}</p>
                      )}
                      <FileThumbs files={n.files} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CustomModal>
      )}
    </div>
  );
};

export default ViewAssignMember;