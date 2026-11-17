import React, { useState, useEffect } from "react";
import {
  getallassignfunctionbyevent,
  getCurrentAttendance,
} from "@/services/apiServices";
import { TableComponent } from "@/components/table/TableComponent";
import { useNavigate, useParams } from "react-router-dom";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import FeedbackModal from "./FeedbackModal";
import { Users2, ChefHat, ListChecks, NotebookPen, MessageSquare } from "lucide-react";
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

const ViewAssignMember = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();

  const [eventData, setEventData] = useState(null);
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Row whose "Task Views" icon was clicked. Modal shows while non-null.
  const [selectedFunction, setSelectedFunction] = useState(null);

  // Attendance modal state
  const [attendanceFn, setAttendanceFn] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null);

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

  // Click on a manager name -> open attendance modal for that manager
  const handleAttendanceClick = async (fn, mgr) => {
    setAttendanceFn({ ...fn, clickedManagerName: mgr?.managerName });
    setAttendance(null);
    setAttendanceError(null);
    setAttendanceLoading(true);

    try {
      // managerId of the clicked manager. To always use the stored value instead:
      // const managerId = localStorage.getItem("mainId");
      const managerId = mgr?.managerId;
      const res = await getCurrentAttendance(fn.eventFunctionId, managerId);
      setAttendance(res?.data?.data ?? res?.data ?? null);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
      setAttendanceError("Failed to load attendance.");
    } finally {
      setAttendanceLoading(false);
    }
  };

  const closeAttendanceModal = () => {
    setAttendanceFn(null);
    setAttendance(null);
    setAttendanceError(null);
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-2">
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

            <div
              onClick={() => handleSpecialNotesViewClick(selectedFunction)}
              className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col items-center justify-center min-h-[130px] cursor-pointer hover:shadow-md hover:border-amber-200 transition"
            >
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                <NotebookPen size={32} className="text-primary" />
              </div>
              <p className="font-semibold text-gray-700 text-center">
                Special Notes
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

      {/* Attendance modal */}
      {attendanceFn && (
        <CustomModal
          open={!!attendanceFn}
          onClose={closeAttendanceModal}
          title={`Attendance${attendanceFn.clickedManagerName ? ` - ${attendanceFn.clickedManagerName}` : ""}`}
          width={520}
        >
          <div className="p-2">
            {attendanceLoading ? (
              <div className="flex items-center justify-center py-10 text-sm text-gray-400">
                Loading attendance...
              </div>
            ) : attendanceError ? (
              <div className="flex items-center justify-center py-10 text-sm text-red-400">
                {attendanceError}
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
            )}
          </div>
        </CustomModal>
      )}
    </div>
  );
};

export default ViewAssignMember;