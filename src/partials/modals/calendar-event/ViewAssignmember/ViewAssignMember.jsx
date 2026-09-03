import React, { useState, useEffect } from "react";
import { getallassignfunctionbyevent } from "@/services/apiServices";
import { TableComponent } from "@/components/table/TableComponent";
import { useNavigate } from "react-router-dom";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { Users2, ChefHat, ListChecks, NotebookPen } from "lucide-react";
import {
  ASSIGNED_FUNCTIONS_COLUMNS,
  ASSIGNED_FUNCTIONS_DATA,
  ASSIGNED_FUNCTIONS_DEFAULT_SORTING,
} from "./constant";
import { useParams } from "react-router-dom";
import { Tooltip } from "antd";

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
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>

          {manager.location}
        </span>
      </div>
    </div>

    {/* <button className="bg-primary hover:bg-primary-active text-white rounded-lg px-5 py-2.5 text-sm font-semibold transition-all whitespace-nowrap">
      Assign Manager
    </button> */}
  </div>
);


const ViewAssignMember = () => {
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [functions, setFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Holds the row (event function) whose "Task Views" icon was clicked.
  // The modal is shown whenever this is non-null.
  const [selectedFunction, setSelectedFunction] = useState(null);
  const { eventId } = useParams();
  
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
              startDate: fn.functionStartDate
                ? new Date(fn.functionStartDate).toLocaleString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })
                : "—",
              endDate: fn.functionEndDate
                ? new Date(fn.functionEndDate).toLocaleString("en-IN", {
                    day: "2-digit", month: "short", year: "numeric",
                    hour: "2-digit", minute: "2-digit",
                  })
                : "—",
              pax: fn.pax ?? "—",
             managers: fn.managers?.length
  ? fn.managers.map((m) => m.managerName).join(", ")
  : "No managers assigned",
              // Keep the raw managers list around so we can pull a managerId
              // when navigating to the Manager Task view.
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
    eventStartDate: eventData?.eventStartDate
      ? new Date(eventData.eventStartDate).toLocaleString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
      : "—",
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

  // View existing Special Notes for this function/manager (mirrors handleAllTaskClick)
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

  // Navigate to the Special Notes assignment page (mirrors handleAssignTaskClick).
  // managerName is passed along so that page can display it directly without
  // needing to fetch the full member list.
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

  return (
    <div className="min-h-screen  p-7">
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
            columns={ASSIGNED_FUNCTIONS_COLUMNS.map((col) =>
  col.id === "action"
    ? {
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
          </div>
        ),
      }
    : col,
)}
            data={functions}
            defaultSorting={ASSIGNED_FUNCTIONS_DEFAULT_SORTING}
            paginationSize={10}
          />
        )}
      </div>

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
              <p className="font-semibold text-gray-700 text-center">
                All Task
              </p>
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
    </div>
  );
};

export default ViewAssignMember;