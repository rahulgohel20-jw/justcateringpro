import { Fragment, useState, useEffect, useMemo } from "react";
import { Select, Tooltip } from "antd";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils/Assets";
import { TableComponent } from "@/components/table/TableComponent";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { Plus, Edit, Trash2 } from "lucide-react";
import {
  GetEventMasterById,
  GetAllManagerTask,
  GetEventFunctionManagerTask,
  AssignEventFunctionManagerTask,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { usePermission } from "../../../hooks/usePermission";
dayjs.extend(customParseFormat);


const STATUS_MAP = {
  0: { label: "Inquiry", color: "bg-blue-50 text-blue-500 border-blue-200" },
  1: {
    label: "Confirmed",
    color: "bg-green-50 text-green-600 border-green-200",
  },
  2: { label: "Cancelled", color: "bg-red-50 text-red-500 border-red-200" },
};


const STATUS_BADGE = {
  PENDING: "bg-amber-50 text-amber-600",
  IN_PROGRESS: "bg-blue-50 text-blue-600",
  COMPLETED: "bg-green-50 text-green-600",
  CANCELLED: "bg-red-50 text-red-500",
};
const TASK_TYPE_BADGE = {
  PRE: "bg-purple-50 text-purple-600",
  POST: "bg-teal-50 text-teal-600",
  DURING: "bg-indigo-50 text-indigo-600",
};



const buildColumns = ({ taskLabel, onEdit, onDelete }) => [
  {
    id: "task",
    header: "Task",
    accessorKey: "managerTaskId",
    cell: ({ row }) => (
      <span className="text-sm text-gray-800 ">
        {taskLabel(row.original.managerTaskId)}
      </span>
    ),
  },
  {
    id: "type",
    header: "Type",
    accessorKey: "type",
    cell: ({ row }) => {
      const type = row.original.type || "PRE";
      return (
        <span
          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
            TASK_TYPE_BADGE[type] || TASK_TYPE_BADGE.PRE
          }`}
        >
          {type}
        </span>
      );
    },
  },
 {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      <span
        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
          STATUS_BADGE[row.original.status] || STATUS_BADGE.PENDING
        }`}
      >
        {row.original.status}
      </span>
    ),
  },
  {
    id: "action",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-3">
        <Tooltip title="Edit Task">
          <button
            onClick={() => onEdit(row.original, row.index)}
            className="text-blue-700"
            aria-label="Edit task"
          >
            <Edit size={16} />
          </button>
        </Tooltip>
        <Tooltip title="Delete Task">
          <button
            onClick={() => onDelete(row.original, row.index)}
            className="text-red-700"
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </Tooltip>
      </div>
    ),
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────
const EventAssignManagerTask = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    eventFunctionId: lockedFunctionId,
    managerId: lockedManagerId,
    managerName: lockedManagerName,
  } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [eventMeta, setEventMeta] = useState(null);
  const [functionData, setFunctionData] = useState(null);
  const [taskRows, setTaskRows] = useState([]);
  const [tasks, setTasks] = useState([]);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(null);
  const [modalTask, setModalTask] = useState([]);
  const [modalFiles, setModalFiles] = useState([]);

  const AssignManagerPermission = usePermission("Assign Manager");

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!eventId) return;
    fetchAll();
  }, [eventId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");

      const [eventRes, taskRes] = await Promise.all([
        GetEventMasterById(eventId),
        GetAllManagerTask(userId),
      ]);

      const eventList = eventRes?.data?.data?.["Event Details"];
      if (!eventList || eventList.length === 0) {
        Swal.fire("Error", "Event not found", "error");
        return;
      }
      const ev = eventList[0];

      setEventMeta({
        partyName: ev.party?.nameEnglish || "",
        eventType: ev.eventType?.nameEnglish || "",
        mobile: ev.mobileno || "",
        eventNo: ev.eventNo || `#${ev.id}`,
        status: ev.status ?? 0,
        date: dayjs(ev.eventStartDateTime, "DD/MM/YYYY hh:mm A").isValid()
          ? dayjs(ev.eventStartDateTime, "DD/MM/YYYY hh:mm A")
          : null,
        venue: ev.venue?.nameEnglish || ev.address || "",
      });

      const ef = (ev.eventFunctions || []).find(
        (f) => f.id === lockedFunctionId,
      );

      if (ef) {
        const startDayjs = ef.functionStartDateTime
          ? dayjs(ef.functionStartDateTime, "DD/MM/YYYY hh:mm A")
          : null;
        const endDayjs = ef.functionEndDateTime
          ? dayjs(ef.functionEndDateTime, "DD/MM/YYYY hh:mm A")
          : null;
        const timingStr =
          startDayjs?.isValid() && endDayjs?.isValid()
            ? `${startDayjs.format("HH:mm")} - ${endDayjs.format("HH:mm")}`
            : startDayjs?.isValid()
              ? startDayjs.format("HH:mm")
              : "";

        setFunctionData({
          id: ef.id,
          eventFunctionId: ef.id,
          name: ef.function?.nameEnglish || "",
          subtitle: ev.eventType?.nameEnglish || "Event Function",
          venue: ef.function_venue || ev.venue?.nameEnglish || "",
          timing: timingStr,
          startDate: startDayjs?.isValid() ? startDayjs : null,
          pax: ef.pax ?? 0,
        });

        if (lockedManagerId) {
          try {
            const assignedRes = await GetEventFunctionManagerTask(
              ef.id,
              lockedManagerId,
              ""
            );

            const assignedData =
              assignedRes?.data?.data?.ManagerTasks?.functionManagerTasks ||
              assignedRes?.data?.data ||
              [];

            const rows = (Array.isArray(assignedData) ? assignedData : [])
              .map((item) => ({
                rowKey: `existing-${item.id}`,
                id: item.id,
                managerTaskId: item.managerTaskId,
                managerId: item.managerId,
                status: item.status || "PENDING",
                files: (item.files || []).map((f) => ({
                  fileKey: `existing-file-${f.id}`,
                  id: f.id,
                  file: null,
                  name: f.fileName || f.name || f.fileUrl || `File #${f.id}`,
                })),
              }));

            setTaskRows(rows);
          } catch (err) {
            console.error("Failed to fetch assigned tasks:", err);
          }
        }
      } else {
        setFunctionData(null);
      }

      const taskList =
        taskRes?.data?.data["ManagerTasks"] ||
        taskRes?.data?.data ||
        taskRes?.data?.ManagerTask ||
        [];

      setTasks(
        (Array.isArray(taskList) ? taskList : []).map((t) => ({
          value: t.id,
          label: t.nameEnglish || t.name || t.taskName || `Task #${t.id}`,
        })),
      );
    } catch (err) {
      console.error("fetchAll error:", err);
      Swal.fire("Error", "Failed to load event data", "error");
    } finally {
      setLoading(false);
    }
  };

  const taskLabel = (managerTaskId) =>
    tasks.find((t) => t.value === managerTaskId)?.label || "—";

  // ── Modal handlers ────────────────────────────────────────────────────────
 const openAddModal = () => {
  setModalTask([]);
  setModalFiles([]);
  setModalIndex(null);
  setIsModalOpen(true);
};

  const openEditModal = (row, index) => {
  setModalTask(row.managerTaskId ? [row.managerTaskId] : []);
  setModalFiles([]);
  setModalIndex(index);
  setIsModalOpen(true);
};

  const closeModal = () => {
  setIsModalOpen(false);
  setModalTask([]);
  setModalFiles([]);
  setModalIndex(null);
};

  const handleModalSave = () => {
  if (!modalTask || modalTask.length === 0) return;

  const newFileObjs = Array.from(modalFiles || []).map((file) => ({
    fileKey: `file-${Math.random().toString(36).slice(2)}`,
    id: 0,
    file,
  }));

  if (modalIndex === null) {
    // Add mode: one selected task -> one new row each
    const newRows = modalTask.map((taskId) => ({
      rowKey: `new-${Math.random().toString(36).slice(2)}`,
      id: null,
      managerTaskId: taskId,
      managerId: lockedManagerId,
      status: "PENDING",
      files: newFileObjs,
    }));
    setTaskRows((prev) => [...prev, ...newRows]);
  } else {
    // Edit mode: first selected task updates the existing row,
    // any additional selected tasks become new rows
    setTaskRows((prev) => {
      const existingRow = prev[modalIndex];
      const updatedRow = {
        ...existingRow,
        managerTaskId: modalTask[0],
        files: [
          ...(existingRow.files || []).filter((f) => f.id !== 0),
          ...newFileObjs,
        ],
      };
      const extraRows = modalTask.slice(1).map((taskId) => ({
        rowKey: `new-${Math.random().toString(36).slice(2)}`,
        id: null,
        managerTaskId: taskId,
        managerId: lockedManagerId,
        status: "PENDING",
        files: [],
      }));

      return [
        ...prev.slice(0, modalIndex),
        updatedRow,
        ...prev.slice(modalIndex + 1),
        ...extraRows,
      ];
    });
  }

  closeModal();
};

  const handleDeleteRow = (row, index) => {
    Swal.fire({
      title: "Delete this task?",
      text: taskLabel(row.managerTaskId),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444",
    }).then((result) => {
      if (result.isConfirmed) {
        setTaskRows((prev) => prev.filter((_, i) => i !== index));
      }
    });
  };

  const columns = useMemo(
    () =>
      buildColumns({
        taskLabel,
        onEdit: openEditModal,
        onDelete: handleDeleteRow,
      }),
    [tasks, taskRows],
  );

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!functionData) return;

    setIsSaving(true);
    try {
      const userId = localStorage.getItem("userId");

      const eventFunctionManagerTasks = taskRows
        .filter((row) => row.managerTaskId && row.managerId)
        .map((row) => ({
          id: row.id || 0,
          eventFunctionId: functionData.eventFunctionId,
          eventId: parseInt(eventId),
          managerId: row.managerId,
          managerTaskId: row.managerTaskId,
          status: row.status || "PENDING",
          files: row.files || [],
        }));

      if (eventFunctionManagerTasks.length === 0) {
        Swal.fire(
          "Nothing to save",
          "Please add at least one task.",
          "info",
        );
        setIsSaving(false);
        return;
      }

      const formData = new FormData();
      formData.append("userId", parseInt(userId));

      eventFunctionManagerTasks.forEach((task, i) => {
        const prefix = `eventFunctionManagerTasks[${i}]`;
        formData.append(`${prefix}.id`, task.id);
        formData.append(`${prefix}.eventFunctionId`, task.eventFunctionId);
        formData.append(`${prefix}.eventId`, task.eventId);
        formData.append(`${prefix}.managerId`, task.managerId);
        formData.append(`${prefix}.managerTaskId`, task.managerTaskId);
        formData.append(`${prefix}.status`, task.status);

        task.files.forEach((f, j) => {
          const filePrefix = `${prefix}.files[${j}]`;
          formData.append(`${filePrefix}.id`, f.id || 0);
          if (f.file) {
            formData.append(`${filePrefix}.file`, f.file);
          }
        });
      });

      await AssignEventFunctionManagerTask(formData);

      Swal.fire({
        title: "Success",
        text: "Tasks assigned successfully!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate(-1);
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire("Error", "Failed to save. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-primary rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading event details...</p>
        </div>
      </div>
    );
  }

  const { label: statusLabel, color: statusColor } =
    STATUS_MAP[eventMeta?.status ?? 0] || STATUS_MAP[0];

  return (
    <Fragment>
      {isSaving && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <img
            src={toAbsoluteUrl("/media/icons/loading.gif")}
            alt="Saving..."
            className="w-18 rounded-xl shadow-2xl"
          />
        </div>
      )}

      <div className="min-h-screen">
        <div className="p-6 mx-auto pb-28">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h1 className="text-xl font-bold text-gray-900">
              Assign Task
            </h1>
            <div className="flex items-center gap-4">
              {AssignManagerPermission.add && (
                <button
                  onClick={openAddModal}
                  disabled={!functionData}
                  className="btn btn-primary text-sm font-semibold px-4 h-9 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Plus size={15} />
                  Create New
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center gap-2.5 mb-2">
              <h2 className="text-lg font-bold text-gray-900 uppercase">
                {eventMeta?.partyName
                  ? `${eventMeta.partyName} – ${eventMeta.eventType}`
                  : `Event #${eventId}`}
              </h2>
              <span
                className={`border rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}
              >
                {statusLabel}
              </span>
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
              {eventMeta?.mobile && (
                <span className="flex items-center gap-1.5">
                  <i className="ki-filled ki-phone text-primary text-xs" />
                  {eventMeta.mobile}
                </span>
              )}
              {eventMeta?.date && (
                <span className="flex items-center gap-1.5">
                  <i className="ki-filled ki-calendar text-primary text-xs" />
                  {eventMeta.date.format("DD MMM YYYY")}
                </span>
              )}
              {eventMeta?.venue && (
                <span className="flex items-center gap-1.5">
                  <i className="ki-filled ki-geolocation text-primary text-xs" />
                  {eventMeta.venue}
                </span>
              )}
              {eventMeta?.eventNo && (
                <span className="flex items-center gap-1.5">
                  <i className="ki-filled ki-tag text-primary text-xs" />
                  {eventMeta.eventNo}
                </span>
              )}
            </div>
          </div>

          {lockedManagerId ? (
            <div className="mb-5 flex items-center gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
              <i className="ki-filled ki-user text-primary text-base" />
              <p className="text-sm text-gray-700">
                Assigning tasks as{" "}
                <span className="font-semibold text-gray-900">
                  {lockedManagerName || `Manager #${lockedManagerId}`}
                </span>
              </p>
            </div>
          ) : (
            <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <i className="ki-filled ki-information-5 text-red-500 text-base" />
              <p className="text-sm text-red-600">
                No manager context found. Please open this page from the
                "Assign Task" action on a specific function.
              </p>
            </div>
          )}

          {!functionData ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
              Selected function not found for this event.
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <p className="text-base font-bold text-gray-900">
                    {functionData.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {functionData.subtitle}
                  </p>
                </div>
                {functionData.startDate && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-bold text-gray-900 leading-none">
                      {functionData.startDate.format("DD")}
                    </p>
                    <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase mt-0.5">
                      {functionData.startDate.format("MMM")}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-gray-600">
                {functionData.timing && (
                  <span className="flex items-center gap-1.5">
                    <i className="ki-filled ki-time text-primary text-xs" />
                    Timing: {functionData.timing}
                  </span>
                )}
                {functionData.pax != null && (
                  <span className="flex items-center gap-1.5">
                    <i className="ki-filled ki-people text-primary text-xs" />
                    Capacity: {functionData.pax} guests
                  </span>
                )}
                {functionData.venue && (
                  <span className="flex items-center gap-1.5">
                    <i className="ki-filled ki-geolocation-home text-primary text-xs" />
                    Venue: {functionData.venue}
                  </span>
                )}
              </div>
            </div>
          )}

          {functionData && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Assigned Tasks
                </h3>
              </div>

              {taskRows.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-10 text-center">
                  No tasks assigned yet. Click "Create New" to add one.
                </p>
              ) : (
                <TableComponent
                  columns={columns}
                  data={taskRows}
                  paginationSize={10}
                />
              )}
            </div>
          )}
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3.5 flex items-center justify-between z-40">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-1 py-1.5"
          >
            Cancel
          </button>
          <div className="flex items-center gap-2.5">
            {(AssignManagerPermission.add || AssignManagerPermission.edit) && (
              <button
                onClick={handleSave}
                disabled={!lockedManagerId || !functionData}
                className="btn btn-primary text-sm font-semibold px-5 h-9 disabled:opacity-50"
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <CustomModal
  open={isModalOpen}
  onClose={closeModal}
  title={modalIndex === null ? "Assign Task" : "Edit Task"}
  width={520}
>
  <div className="flex flex-col gap-4 p-1">
    <div>
      <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1.5">
        Task
      </p>
      <Select
        mode="multiple"
        className="w-full"
        placeholder="Select tasks"
        value={modalTask }
        options={tasks}
        allowClear
        onChange={(val) => setModalTask(val)}
      />
    </div>

    <div className="flex items-center justify-end gap-2 pt-2">
      <button
        onClick={closeModal}
        className="text-sm font-medium text-gray-600 px-4 py-2"
      >
        Cancel
      </button>
      <button
        onClick={handleModalSave}
        disabled={!modalTask || modalTask.length === 0}
        className="btn btn-primary text-sm font-semibold px-5 py-2 disabled:opacity-50"
      >
        {modalIndex === null ? "Add Task" : "Save Changes"}
      </button>
    </div>
  </div>
</CustomModal>
      )}
    </Fragment>
  );
};

export default EventAssignManagerTask;
