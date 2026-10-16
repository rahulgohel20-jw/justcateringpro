import { useState, useEffect } from "react";
import { X, Plus, Trash2, StickyNote } from "lucide-react";
import {
  AddNote,
  UpdateNote,
  DeleteNoteHeading,
} from "../../../services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";

const EMPTY_HEADING = { id: null, heading: "", description: "" };

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "RUNNING", label: "Running" },
  { value: "COMPLETED", label: "Completed" },
];

const normalizeStatus = (raw) => {
  const key = String(raw ?? "").trim().toUpperCase();
  return STATUS_OPTIONS.some((o) => o.value === key) ? key : "PENDING";
};

export default function AddNoteModal({
  isOpen,
  onClose,
  refreshData,
  noteDetails = null,
  userId,
}) {
const [form, setForm] = useState({ title: "", status: "PENDING" });
  const [headings, setHeadings] = useState([{ ...EMPTY_HEADING }]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const isEdit = !!noteDetails;

  // Populate form when editing
  useEffect(() => {
    if (!isOpen) return;
    if (noteDetails) {
      setForm({
    title: noteDetails.title || "",
    status: noteDetails.status || "PENDING",
  });
      setHeadings(
        noteDetails.headings?.length > 0
          ? noteDetails.headings.map((h) => ({
            id: h.id,
            heading: h.heading || "",
            description: h.description || "",
          }))
          : [{ ...EMPTY_HEADING }]
      );
    } else {
     setForm({ title: "", status: "PENDING" });
  setHeadings([{ ...EMPTY_HEADING }]);
    }
    setErrors({});
  }, [isOpen, noteDetails]);

  if (!isOpen) return null;

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const handleHeadingChange = (index, field, value) => {
    setHeadings((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    );
  };

  const addHeading = () => {
    setHeadings((prev) => [...prev, { ...EMPTY_HEADING }]);
  };

  const removeHeading = async (index) => {
    const heading = headings[index];
    // If it's an existing heading (has an id), delete from server
    if (heading.id) {
      const result = await Swal.fire({
        title: "Delete Heading?",
        text: "This heading will be permanently removed.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });
      if (!result.isConfirmed) return;
      try {
        await DeleteNoteHeading(heading.id, userId);
        Swal.fire({ icon: "success", title: "Heading Deleted!", timer: 1200, showConfirmButton: false });
      } catch {
        Swal.fire({ icon: "error", title: "Failed to delete heading." });
        return;
      }
    }
    setHeadings((prev) => prev.filter((_, i) => i !== index));
    if (headings.length === 1) {
      setHeadings([{ ...EMPTY_HEADING }]);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Note title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const filteredHeadings = headings
        .filter((h) => h.heading.trim())
        .map((h) => ({
          id: h.id || null,
          heading: h.heading,
          description: h.description,
        }));

      const payload = {
        title: form.title.trim(),
        status: form.status,
        headings: filteredHeadings,
      };

      if (isEdit) {
        const res = await UpdateNote(noteDetails.id, userId, payload);
        if (res?.data?.success === false) {
          Swal.fire({ icon: "error", title: "Failed!", text: res.data.msg || "Update failed." });
          return;
        }
      } else {
        const res = await AddNote(userId, payload);
        if (res?.data?.success === false) {
          Swal.fire({ icon: "error", title: "Failed!", text: res.data.msg || "Create failed." });
          return;
        }
      }

      refreshData?.();
      onClose(false);

      Swal.fire({
        icon: "success",
        title: isEdit ? "Note Updated!" : "Note Created!",
        text: isEdit
          ? "Note details have been updated successfully."
          : "New note has been added successfully.",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Save failed:", err);
      Swal.fire({
        icon: "error",
        title: "Failed!",
        text: "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = (err) =>
    `w-full border rounded-lg px-3 py-2 text-sm text-gray-800 outline-none transition-colors
     ${err ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-primary bg-white"}`;

  const labelCls =
    "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1";

  const SectionTitle = ({ title }) => (
    <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-3 pb-1 border-b-2 border-primary inline-block">
      {title}
    </p>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 no-scrollbar"
      style={{
        backgroundColor: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
      }}
      onClick={() => onClose(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden no-scrollbar"
        style={{ maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit
                ? <FormattedMessage id="NOTES.FORM.EDIT_TITLE" defaultMessage="Edit Note" />
                : <FormattedMessage id="NOTES.FORM.ADD_TITLE" defaultMessage="Add New Note" />}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              <FormattedMessage id="NOTES.FORM.SUBTITLE" defaultMessage="Create and organize your notes with headings and descriptions." />
            </p>
          </div>
          <button
            onClick={() => onClose(false)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6 no-scrollbar">
          {/* Note Details */}
          <div>
            <SectionTitle title={<FormattedMessage id="NOTES.FORM.SECTION.NOTE_DETAILS" defaultMessage="Note Details" />} />
            <div>
              <label className={labelCls}>
                <StickyNote className="w-3 h-3" /> <FormattedMessage id="NOTES.FORM.LABEL.TITLE" defaultMessage="Note Title" /> <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Meeting Notes"
                className={inputCls(errors.title)}
              />
              {errors.title && (
                <p className="text-red-500 text-[10px] mt-0.5">{errors.title}</p>
              )}
            </div>
            <div>
    <label className={labelCls}>
      <FormattedMessage id="NOTES.FORM.LABEL.STATUS" defaultMessage="Status" />
    </label>
    <select
      value={form.status}
      onChange={(e) => set("status", e.target.value)}
      className={inputCls(false)}
    >
      {STATUS_OPTIONS.map((s) => (
  <option key={s.value} value={s.value}>
    {s.label}
  </option>
))}
    </select>
  </div>
          </div>

          {/* Headings & Descriptions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle title={<FormattedMessage id="NOTES.FORM.SECTION.HEADINGS" defaultMessage="Headings & Descriptions" />} />
              <button
                type="button"
                onClick={addHeading}
                className="flex items-center gap-1 text-xs font-semibold text-white bg-primary hover:bg-primary/90 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> <FormattedMessage id="NOTES.FORM.ADD_HEADING" defaultMessage="Add Heading" />
              </button>
            </div>

            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[5%]">#</th>
                    <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[30%]">Heading</th>
                    <th className="text-left px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="text-center px-3 py-2.5 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-[8%]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {headings.map((h, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0">
                      <td className="px-3 py-2 text-gray-500 font-medium">{i + 1}</td>
                      <td className="px-3 py-2">
                        <input
                          value={h.heading}
                          onChange={(e) => handleHeadingChange(i, "heading", e.target.value)}
                          placeholder="Enter heading"
                          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-primary bg-white transition-colors"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          value={h.description}
                          onChange={(e) => handleHeadingChange(i, "description", e.target.value)}
                          placeholder="Enter description"
                          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-800 outline-none focus:border-primary bg-white transition-colors"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeHeading(i)}
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors mx-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0 bg-gray-50">
          <button
            onClick={() => onClose(false)}
            className="px-5 py-2 rounded-lg border border-gray-200 bg-white text-sm text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            <FormattedMessage id="NOTES.FORM.CANCEL" defaultMessage="Cancel" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {saving
              ? <FormattedMessage id="NOTES.FORM.SAVING" defaultMessage="Saving…" />
              : isEdit
                ? <FormattedMessage id="NOTES.FORM.UPDATE_BTN" defaultMessage="Update Note" />
                : <FormattedMessage id="NOTES.FORM.CREATE_BTN" defaultMessage="Save" />}
          </button>
        </div>
      </div>
    </div>
  );
}