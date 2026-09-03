import { Fragment, useState, useEffect, useCallback } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { useLocation, useParams } from "react-router-dom";
import {
  GetSpecialNotes,
  AddSpecialNotes,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import {
  UploadCloud,
  Trash2,
  Save,
  Search,
  Edit,
  Plus,
  ChevronRight,
} from "lucide-react";
import { Tooltip, Select, Input } from "antd";

const { TextArea } = Input;

// ─── Constants ──────────────────────────────────────────────────────────────
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

const STATUS_BADGE = {
  PENDING: "bg-amber-50 text-amber-600",
  IN_PROGRESS: "bg-blue-50 text-blue-600",
  COMPLETED: "bg-green-50 text-green-600",
  CANCELLED: "bg-red-50 text-red-500",
};

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "INPROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCEL", label: "Cancelled" },
];

// ─── Columns builder ────────────────────────────────────────────────────────
const columns = (onEdit) => [
  {
    id: "name",
    header: "Title",
    accessorKey: "name",
    cell: ({ row }) => (
      <span className="text-sm text-gray-800 font-semibold">
        {row.original.name}
      </span>
    ),
  },
  {
    id: "description",
    header: "Description",
    accessorKey: "description",
    cell: ({ row }) => (
      <span className="text-sm text-gray-500 max-w-[280px] truncate block">
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
      <div className="flex items-center justify-center gap-2">
        <Tooltip title="Edit Note">
          <button
            onClick={() => onEdit(row.original)}
            className="flex gap-1 items-center bg-primary text-white rounded-3xl p-2"
            aria-label="Edit note"
          >
            View Details <ChevronRight size={12}/>
          </button>
        </Tooltip>
      </div>
    ),
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────
const mapNote = (n) => ({
  id: n.id ?? null,
  name: n.name ?? "",
  description: n.description ?? "",
  priority: n.priority ?? "MEDIUM",
  managerId: n.managerId,
  eventFunctionId: n.eventFunctionId,
  eventId: n.eventId,
  remarks: n.remarks ?? "",
  status: n.status ?? "PENDING",
  files: (n.files || []).map((f) => ({
    fileKey: `existing-file-${f.id}`,
    id: f.id,
    file: null,
    name: f.fileName || f.name || f.imagePath?.split("/").pop() || `File #${f.id}`,
    url: f.fileUrl || f.url || f.imagePath || null,
  })),
});

export default function ManagerAllSpecialNotes() {
  const { eventId: eventIdParam } = useParams();
  const location = useLocation();
  const {
    eventFunctionId,
    managerId,
    functionName,
    eventId: eventIdState,
  } = location.state ?? {};
  const eventId = eventIdState ?? eventIdParam;
  const userId = localStorage.getItem("userId");

  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [detailNote, setDetailNote] = useState(null);
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [draftPriority, setDraftPriority] = useState("MEDIUM");
  const [draftStatus, setDraftStatus] = useState("PENDING");
  const [draftFiles, setDraftFiles] = useState([]);
  const [isSavingDetail, setIsSavingDetail] = useState(false);
  const [draftRemarks, setDraftRemarks] = useState("");


  const fetchNotes = useCallback(async () => {
    if (!eventFunctionId || !managerId) return;
    setLoading(true);
    try {
      const res = await GetSpecialNotes(eventFunctionId, managerId, userId);
      const raw = res?.data?.data?.["SpecialNotes"];
      const rawList = Array.isArray(raw) ? raw : raw ? [raw] : [];
      setNotes(rawList.map(mapNote));
    } catch (err) {
      console.error("Failed to fetch special notes:", err);
    } finally {
      setLoading(false);
    }
  }, [eventFunctionId, managerId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = searchTerm.trim()
    ? notes.filter((n) =>
        n.name.toLowerCase().includes(searchTerm.trim().toLowerCase()),
      )
    : notes;

  // ── File helpers ──────────────────────────────────────────────────────────
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

  // ── Drawer handlers ───────────────────────────────────────────────────────
  const handleOpenAdd = () => {
    setDetailNote(null);
    setDraftName("");
    setDraftDescription("");
    setDraftPriority("MEDIUM");
    setDraftStatus("PENDING");
    setDraftFiles([]);
    setDraftRemarks("");
  };

  const handleOpenEdit = (note) => {
    setDetailNote(note);
    setDraftName(note.name || "");
    setDraftDescription(note.description || "");
    setDraftPriority(note.priority || "MEDIUM");
    setDraftStatus(note.status || "PENDING");
    setDraftFiles(note.files || []);
    setDraftRemarks(note.remarks || "");
  };

  const handleCloseDetail = () => {
    if (isSavingDetail) return;
    setDetailNote(undefined);
    setDraftName("");
    setDraftDescription("");
    setDraftPriority("MEDIUM");
    setDraftStatus("PENDING");
    setDraftFiles([]);
    setDraftRemarks("");
  };

  const isDrawerOpen = detailNote !== undefined;

  const handleSaveDetail = async () => {
    if (!draftName.trim()) {
      Swal.fire("Title required", "Please enter a note title.", "info");
      return;
    }

    setIsSavingDetail(true);
    try {
      const userId = localStorage.getItem("userId");

      const formData = new FormData();
      formData.append("id", detailNote?.id || -1);
      formData.append("eventFunctionId", eventFunctionId);
      formData.append("eventId", parseInt(eventId));
      formData.append("managerId", managerId);
      formData.append("name", draftName.trim());
      formData.append("description", draftDescription || "");
      formData.append("priority", draftPriority);
      formData.append("status", draftStatus);
      formData.append("userId", parseInt(userId));
      formData.append("remarks", draftRemarks || "");

      draftFiles.forEach((f, j) => {
        formData.append(`files[${j}].id`, f.id || 0);
        if (f.file) {
          formData.append(`files[${j}].file`, f.file);
        }
      });

      await AddSpecialNotes(formData);

      Swal.fire({
        title: "Saved",
        text: detailNote
          ? "Note updated successfully!"
          : "Note added successfully!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      handleCloseDetail();
      fetchNotes();
    } catch (err) {
      console.error("Save note error:", err);
      Swal.fire("Error", "Failed to save note. Please try again.", "error");
    } finally {
      setIsSavingDetail(false);
    }
  };

  return (
    <Fragment>
      <Container>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">Special Notes</h1>
            <p className="text-sm text-gray-400">{functionName ?? "—"}</p>
          </div>
          <button
            onClick={handleOpenAdd}
            className="btn btn-primary text-sm font-semibold px-4 h-9 flex items-center gap-1.5"
          >
            <Plus size={15} />
            Create New
          </button>
        </div>

        {/* Notes list */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-900">All Notes</h2>
              <span className="text-xs text-gray-400">
                {filteredNotes.length} note{filteredNotes.length === 1 ? "" : "s"}
              </span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notes..."
                className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </div>

          <TableComponent
            columns={columns(handleOpenEdit)}
            data={filteredNotes}
            paginationSize={10}
            loading={loading}
          />
        </div>
      </Container>

      {/* ── Add / Edit Detail Drawer ── */}
      {isDrawerOpen && (
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
                {detailNote ? "Edit Note" : "Add Note"}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-5">
              {/* Title */}
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Title <span className="text-red-500">*</span>
                </p>
                <input
                  type="text"
                  autoFocus={!detailNote}
                  readOnly={!!detailNote}
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Note title"
                  maxLength={200}
                  className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                    detailNote ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                  }`}
                />
              </div>

              {/* Priority */}
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Priority
                </p>
                <Select
                  className="w-full"
                  value={draftPriority}
                  options={PRIORITY_OPTIONS}
                  onChange={(val) => setDraftPriority(val)}
                />
              </div>

              {/* Status */}
              <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Status
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

              {/* Description */}
               <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">
                  Description
                </p>
                <textarea
                  rows={5}
                  readOnly
                  value={draftDescription}
                  className="w-full border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-xl p-3 text-sm resize-none"
                />
              </div>

              {/* Remarks */}
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
                  placeholder="Add remarks..."
                />
                <p className="text-[11px] text-gray-400 text-right mt-1">
                  {draftRemarks.length}/500
                </p>
              </div>

              {/* Upload Work Proof */}
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
            </div>

            <div className="px-5 py-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleSaveDetail}
                disabled={isSavingDetail || !draftName.trim()}
                className="w-full bg-primary disabled:opacity-60 text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 transition"
              >
                <Save size={16} />
                {isSavingDetail ? "Saving..." : detailNote ? "Save Changes" : "Add Note"}
              </button>
            </div>
          </div>
        </>
      )}
    </Fragment>
  );
}
