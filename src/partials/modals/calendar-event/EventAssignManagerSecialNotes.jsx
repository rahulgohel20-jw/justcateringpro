import { Fragment, useState, useEffect, useMemo } from "react";
import { Select, Input, Tooltip } from "antd";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils/Assets";
import { TableComponent } from "@/components/table/TableComponent";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { Pencil, Trash2, Plus, Edit } from "lucide-react";
import {
  GetEventMasterById,
  AddSpecialNotes,
  GetSpecialNotes,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { usePermission } from "../../../hooks/usePermission";
dayjs.extend(customParseFormat);

const { TextArea } = Input;

// ─── Status helpers ────────────────────────────────────────────────────────
const STATUS_MAP = {
  0: { label: "Inquiry", color: "bg-blue-50 text-blue-500 border-blue-200" },
  1: {
    label: "Confirmed",
    color: "bg-green-50 text-green-600 border-green-200",
  },
  2: { label: "Cancelled", color: "bg-red-50 text-red-500 border-red-200" },
};

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
];

const PRIORITY_BADGE = {
  LOW: "bg-slate-50 text-slate-500 border border-slate-200",
  MEDIUM: "bg-amber-50 text-amber-600 border border-amber-200",
  HIGH: "bg-red-50 text-red-600 border border-red-200",
};

const emptyNote = (managerId = null) => ({
  id: null,
  name: "",
  description: "",
  priority: "MEDIUM",
  managerId,
  status: "PENDING",
});

// Normalize whatever shape the GET returns into our note object.
const mapNoteResponse = (raw, fallbackManagerId) => ({
  id: raw.id ?? null,
  name: raw.name ?? "",
  description: raw.description ?? "",
  priority: raw.priority ?? "MEDIUM",
  managerId: raw.managerId ?? fallbackManagerId,
  status: raw.status || "PENDING",
});

// Columns are built inside the component so the action-cell handlers
// (edit/delete) always close over fresh state.
const buildColumns = ({ onEdit, onDelete }) => [
  {
    id: "name",
    header: "Title",
    accessorKey: "name",
    cell: ({ row }) => (
      <span className="text-sm text-gray-800">
        {row.original.name}
      </span>
    ),
  },
  {
    id: "description",
    header: "Description",
    accessorKey: "description",
    cell: ({ row }) => (
      <span className="text-sm text-gray-800  max-w-[320px] ">
        {row.original.description || "—"}
      </span>
    ),
  },
  {
    id: "priority",
    header: "Priority",
    accessorKey: "priority",
    cell: ({ row }) => (
      <span
        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
          PRIORITY_BADGE[row.original.priority] || PRIORITY_BADGE.MEDIUM
        }`}
      >
        {row.original.priority}
      </span>
    ),
  },
//   {
//     id: "status",
//     header: "Status",
//     accessorKey: "status",
//     cell: ({ row }) => (
//       <span className="bg-emerald-50 text-emerald-600 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase">
//         {row.original.id ? "Saved" : "Unsaved"}
//       </span>
//     ),
//   },
  {
    id: "action",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-3">
        <Tooltip title="Edit Note">
          <button
            onClick={() => onEdit(row.original, row.index)}
            className="text-blue-700"
            aria-label="Edit note"
          >
            <Edit size={16} />
          </button>
        </Tooltip>
        <Tooltip title="Delete Note">
          <button
            onClick={() => onDelete(row.original, row.index)}
            className="text-red-700"
            aria-label="Delete note"
          >
            <Trash2 size={16} />
          </button>
        </Tooltip>
      </div>
    ),
  },
];

// ─── Main Component ─────────────────────────────────────────────────────────
// Scoped to a SINGLE event function + manager (passed in via location.state
// from ViewAssignMember's "Assign Special Notes" action). Notes for that
// function are shown in a proper table with Edit / Delete row actions, and a
// single "Add Note" button opens a modal to create a new note.
const EventAssignManagerSpecialNotes = () => {
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
  const [functionData, setFunctionData] = useState(null); // the single selected function
  const [notes, setNotes] = useState([]);

  // Modal state: isModalOpen controls visibility; modalIndex === null means
  // "adding a new note", otherwise it's the index of the note being edited.
  const [modalNote, setModalNote] = useState(null);
  const [modalIndex, setModalIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      const eventRes = await GetEventMasterById(eventId);

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

      // ── Only keep the single selected function ──
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

        // Fetch existing notes for this function + manager
        if (lockedManagerId) {
          try {
            const res = await GetSpecialNotes(ef.id, lockedManagerId, userId);
            const raw = res?.data?.data?.["SpecialNotes"];
            const rawList = Array.isArray(raw) ? raw : raw ? [raw] : [];
            setNotes(rawList.map((n) => mapNoteResponse(n, lockedManagerId)));
          } catch (err) {
            console.error("Failed to fetch special notes:", err);
          }
        }
      } else {
        setFunctionData(null);
      }
    } catch (err) {
      console.error("fetchAll error:", err);
      Swal.fire("Error", "Failed to load event data", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Modal open helpers ───────────────────────────────────────────────────
  const openAddModal = () => {
    setModalNote(emptyNote(lockedManagerId));
    setModalIndex(null);
    setIsModalOpen(true);
  };

  const openEditModal = (note, index) => {
    setModalNote({ ...note });
    setModalIndex(index);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalNote(null);
    setModalIndex(null);
  };

  const handleModalSave = async () => {
  if (!modalNote?.name || !functionData || !lockedManagerId) return;

  const userId = localStorage.getItem("userId");

  setIsSaving(true);
  try {
    const formData = new FormData();
    formData.append("id", modalNote.id || -1);
    formData.append("eventFunctionId", functionData.eventFunctionId);
    formData.append("eventId", parseInt(eventId));
    formData.append("managerId", lockedManagerId);
    formData.append("name", modalNote.name);
    formData.append("description", modalNote.description || "");
    formData.append("priority", modalNote.priority || "MEDIUM");
    formData.append("status", "PENDING");
    formData.append("userId", parseInt(userId));

    const res = await AddSpecialNotes(formData);

    const savedId =
      res?.data?.data?.id ?? res?.data?.data?.["SpecialNotes"]?.id ?? modalNote.id;

    const savedNote = {
      ...modalNote,
      id: savedId ?? modalNote.id,
      managerId: lockedManagerId,
    };

    if (modalIndex === null) {
      setNotes((prev) => [...prev, savedNote]);
    } else {
      setNotes((prev) =>
        prev.map((n, i) => (i === modalIndex ? savedNote : n)),
      );
    }

    Swal.fire({
      title: "Success",
      text: modalIndex === null ? "Note added successfully!" : "Note updated successfully!",
      icon: "success",
      timer: 1200,
      showConfirmButton: false,
    });

    closeModal();
  } catch (err) {
    console.error("Save note error:", err);
    Swal.fire("Error", "Failed to save note. Please try again.", "error");
  } finally {
    setIsSaving(false);
  }
};

  const handleDeleteNote = (note, index) => {
    Swal.fire({
      title: "Delete this note?",
      text: note.name,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#ef4444",
    }).then((result) => {
      if (result.isConfirmed) {
        setNotes((prev) => prev.filter((_, i) => i !== index));
      }
    });
  };

  const columns = useMemo(
    () =>
      buildColumns({
        onEdit: openEditModal,
        onDelete: handleDeleteNote,
      }),
    [notes],
  );

  // ── Save ───────────────────────────────────────────────────────────────────
//   const handleSave = async () => {
//     if (!functionData) return;
//     const userId = localStorage.getItem("userId");

//     const notesToSave = notes.filter((n) => n.name && n.managerId);

//     if (notesToSave.length === 0) {
//       Swal.fire(
//         "Nothing to save",
//         "Please add a special note with a title.",
//         "info",
//       );
//       return;
//     }

//     setIsSaving(true);
//     try {
//       await Promise.all(
//         notesToSave.map((note) => {
//           const formData = new FormData();
//           formData.append("id", note.id || -1);
//           formData.append("eventFunctionId", functionData.eventFunctionId);
//           formData.append("eventId", parseInt(eventId));
//           formData.append("managerId", note.managerId);
//           formData.append("name", note.name);
//           formData.append("description", note.description || "");
//           formData.append("priority", note.priority || "MEDIUM");
//           formData.append("status", "PENDING");
//           formData.append("userId", parseInt(userId));

//           return AddSpecialNotes(formData);
//         }),
//       );

//       Swal.fire({
//         title: "Success",
//         text: "Special notes saved successfully!",
//         icon: "success",
//         timer: 1500,
//         showConfirmButton: false,
//       });

//       navigate(-1);
//     } catch (err) {
//       console.error("Save error:", err);
//       Swal.fire("Error", "Failed to save. Please try again.", "error");
//     } finally {
//       setIsSaving(false);
//     }
//   };

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
      {/* Saving overlay */}
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
          {/* Header row: title + breadcrumb + Create New (matches screenshot) */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
            <h1 className="text-xl font-bold text-gray-900">
              Assign Special Notes
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

          {/* ── Event Header ── */}
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

          {/* ── Fixed Manager Banner ── */}
          {lockedManagerId ? (
            <div className="mb-5 flex items-center gap-2.5 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
              <i className="ki-filled ki-user text-primary text-base" />
              <p className="text-sm text-gray-700">
                Assigning special notes as{" "}
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
                "Assign Special Notes" action on a specific function.
              </p>
            </div>
          )}

          {/* ── Selected Function ── */}
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

          {/* ── Special Notes Table ── */}
          {functionData && (
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <h3 className="text-sm font-bold text-gray-900">
                  Special Notes
                </h3>
                
              </div>

              {notes.length === 0 ? (
                <p className="text-sm text-gray-400 italic py-10 text-center">
                  No special notes yet. Click "Add Note" to create one.
                </p>
              ) : (
                <TableComponent
                  columns={columns}
                  data={notes}
                  paginationSize={10}
                />
              )}
            </div>
          )}
        </div>

          {/* ── Sticky Footer ── */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3.5 flex items-center justify-between z-40">
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-1 py-1.5"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* ── Add / Edit Note Modal ── */}
      {isModalOpen && (
        <CustomModal
          open={isModalOpen}
          onClose={closeModal}
          title={modalIndex === null ? "Add Special Note" : "Edit Special Note"}
          width={560}
        >
          <div className="flex flex-col gap-4 p-1">
            <div>
              <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1.5">
                Title
              </p>
              <input
                type="text"
                autoFocus
                placeholder="Note title"
                value={modalNote?.name || ""}
                onChange={(e) =>
                  setModalNote((n) => ({ ...n, name: e.target.value }))
                }
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1.5">
                Priority
              </p>
              <Select
                className="w-full"
                value={modalNote?.priority || "MEDIUM"}
                options={PRIORITY_OPTIONS}
                onChange={(val) =>
                  setModalNote((n) => ({ ...n, priority: val }))
                }
              />
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1.5">
                Description
              </p>
              <TextArea
                placeholder="Description"
                autoSize={{ minRows: 3, maxRows: 6 }}
                value={modalNote?.description || ""}
                onChange={(e) =>
                  setModalNote((n) => ({
                    ...n,
                    description: e.target.value,
                  }))
                }
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
                disabled={!modalNote?.name}
                className="btn btn-primary text-sm font-semibold px-5 py-2 disabled:opacity-50"
              >
                {modalIndex === null ? "Add Note" : "Save Changes"}
              </button>
            </div>
          </div>
        </CustomModal>
      )}
    </Fragment>
  );
};

export default EventAssignManagerSpecialNotes;