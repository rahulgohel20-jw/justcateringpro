import { useCallback, useEffect, useState, useRef } from "react";
import { X, History, Trash2, Edit } from "lucide-react";
import Swal from "sweetalert2";
import {
  GetAllRevisionHistory,
  DeleteRevisionHistory,
  AddLogs,
} from "@/services/apiServices";
import AddRevisionHistoryForm from "../add-revision-history/AddRevisionHistoryForm";
import { FormattedMessage, useIntl } from "react-intl";

const RevisionHistoryModal = ({ isOpen, onClose, eventId, userId, canEdit }) => {
  const [revisionList, setRevisionList] = useState([]);
  const [revisionLoading, setRevisionLoading] = useState(false);
  const [showAddRevisionForm, setShowAddRevisionForm] = useState(false);
  const [editingRevision, setEditingRevision] = useState(null);
  const intl = useIntl();
  const preSaveListRef = useRef([]);

  const userEmail = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("auth-storage"))?.state?.user?.email || ""
      );
    } catch {
      return "";
    }
  })();

  const fetchRevisionHistory = useCallback(async () => {
    if (!eventId || !userId) return [];
    try {
      setRevisionLoading(true);
      const res = await GetAllRevisionHistory(eventId, userId);
      const history =
        res?.data?.History ||
        res?.data?.data?.History ||
        res?.data?.data ||
        [];
      const finalList = history.map((item, index) => ({ ...item, versionNo: index + 1 }));
      setRevisionList(finalList);
      return finalList; // ← so callers can diff against it
    } catch (err) {
      console.error("Failed to fetch revision history:", err);
      setRevisionList([]);
      return [];
    } finally {
      setRevisionLoading(false);
    }
  }, [eventId, userId]);

  useEffect(() => {
    if (isOpen) {
      fetchRevisionHistory();
    } else {
      setShowAddRevisionForm(false);
      setEditingRevision(null);
    }
  }, [isOpen, fetchRevisionHistory]);

  const openAddForm = () => {
    preSaveListRef.current = revisionList;
    setEditingRevision(null);
    setShowAddRevisionForm(true);
  };

  const openEditForm = (row) => {
    preSaveListRef.current = revisionList;
    setEditingRevision(row);
    setShowAddRevisionForm(true);
  };

  const handleFormClose = () => { setShowAddRevisionForm(false); setEditingRevision(null); };

  const buildRevisionChangeSummary = (prevList, newList, wasEditing) => {
    if (!wasEditing) {
      const prevIds = new Set(prevList.map((r) => r.id));
      const added = newList.find((r) => !prevIds.has(r.id));
      if (added) {
        return `Added: Revision on ${added.revisionDate || "-"}, Approved By: ${
          added.approvedByName || "-"
        }${added.changes ? ` (Changes: ${added.changes})` : ""}`;
      }
      return "New revision added.";
    }

    const prevRow = prevList.find((r) => r.id === wasEditing.id);
    const newRow = newList.find((r) => r.id === wasEditing.id);
    if (!prevRow || !newRow) return "Revision updated.";

    const fields = [
      ["revisionDate", "Date"],
      ["approvedByName", "Approved By"],
      ["changes", "Changes"],
    ];

    const changes = [];
    fields.forEach(([field, label]) => {
      const prevVal = prevRow[field] ?? "-";
      const currVal = newRow[field] ?? "-";
      if (String(prevVal) !== String(currVal)) {
        changes.push(`${label}: ${prevVal} → ${currVal}`);
      }
    });

    return changes.length ? changes.join(", ") : "No field changes detected.";
  };

  const handleFormSaved = async () => {
    const wasEditing = editingRevision; // capture before clearing
    setShowAddRevisionForm(false);
    setEditingRevision(null);

    const newList = await fetchRevisionHistory();

    // ── Non-blocking activity log ──
    try {
      const changeSummary = buildRevisionChangeSummary(
        preSaveListRef.current,
        newList,
        wasEditing,
      );

      await AddLogs({
        id: 0,
        eventId: Number(eventId) || 0,
        description: `Revision History ${wasEditing ? "updated" : "added"} | Saved By: ${
          userEmail || "Unknown User"
        } | ${changeSummary}`,
        eventType: wasEditing ? "Revision History Update" : "Revision History Add",
        user: userEmail,
      });
    } catch (logErr) {
      console.error("Log failed (non-blocking):", logErr);
    }
  };

  const handleDeleteRevision = async (id) => {
    const result = await Swal.fire({
      title: intl.formatMessage({
        id: "USER.REVISION_HISTORY.DELETE_CONFIRM_TITLE",
        defaultMessage: "Delete this revision?",
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: intl.formatMessage({
        id: "USER.REVISION_HISTORY.DELETE_BTN",
        defaultMessage: "Delete",
      }),
      confirmButtonColor: "#d33",
    });
    if (!result.isConfirmed) return;

    const deletedRow = revisionList.find((r) => r.id === id); // ← capture before delete

    try {
      const resp = await DeleteRevisionHistory(id);
      if (resp?.data?.success !== false) {
        Swal.fire({
          icon: "success",
          title: intl.formatMessage({ id: "USER.REVISION_HISTORY.DELETED_TITLE", defaultMessage: "Deleted!" }),
          timer: 1000,
          showConfirmButton: false,
        });

        // ── Non-blocking activity log ──
        try {
          await AddLogs({
            id: 0,
            eventId: Number(eventId) || 0,
            description: `Revision History deleted | Date: ${
              deletedRow?.revisionDate || "-"
            } | Approved By: ${deletedRow?.approvedByName || "-"}${
              deletedRow?.changes ? ` | Changes: ${deletedRow.changes}` : ""
            } | Deleted By: ${userEmail || "Unknown User"}`,
            eventType: "Revision History Delete",
            user: userEmail,
          });
        } catch (logErr) {
          console.error("Log failed (non-blocking):", logErr);
        }

        fetchRevisionHistory();
      } else {
        Swal.fire({ icon: "error", title: resp?.data?.msg || "Delete failed" });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: err?.response?.data?.msg || "Something went wrong" });
    }
  };

  if (!isOpen) return null;



  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      {/* Main Modal */}
      <div
        className="fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl no-scrollbar"
        style={{
          transform: "translate(-50%,-50%)",
          width: "min(1100px,95vw)",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 32px 64px rgba(0,0,0,.18)",
        }}
      >
        {/* Header — sticky so it stays visible while body scrolls */}
        <div className="flex items-center justify-between bg-primary px-6 py-5 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,.2)" }}
            >
              <History size={18} color="#fff" />
            </div>
            <p className="text-white font-bold text-base leading-tight">
              <FormattedMessage id="USER.REVISION_HISTORY.MODAL_TITLE" defaultMessage="Revision History" />
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
            style={{ background: "rgba(255,255,255,.15)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex justify-end">
            {canEdit && (
              <button
                type="button"
                onClick={openAddForm}
                className="btn btn-primary text-sm px-4 py-1.5"
              >
               <FormattedMessage id="USER.REVISION_HISTORY.ADD_REVISION_BTN" defaultMessage="+ Add Revision" /> 
              </button>
            )}
          </div>

          {revisionLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                   <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
  <FormattedMessage id="USER.REVISION_HISTORY.TABLE.VERSION_NO" defaultMessage="Version No" />
</th>
<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
  <FormattedMessage id="USER.REVISION_HISTORY.TABLE.REVISION_DATE" defaultMessage="Revision Date" />
</th>
<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
  <FormattedMessage id="USER.REVISION_HISTORY.TABLE.APPROVED_BY" defaultMessage="Approved By" />
</th>
<th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
  <FormattedMessage id="USER.REVISION_HISTORY.TABLE.CHANGES" defaultMessage="Changes" />
</th>
{canEdit && (
  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
    <FormattedMessage id="USER.REVISION_HISTORY.TABLE.ACTIONS" defaultMessage="Actions" />
  </th>
)}
                  </tr>
                </thead>
                <tbody>
                  {revisionList.length > 0 ? (
                    revisionList.map((item, index) => (
                      <tr key={item.id || index} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-700">{item.versionNo || index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.revisionDate}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.approvedByName}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{item.changes}</td>
                        {canEdit && (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => openEditForm(item)}
                                className="text-primary hover:text-primary/70 transition-colors"
                              >
                                <Edit size={15} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteRevision(item.id)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={canEdit ? 5 : 4}
                        className="text-center py-6 text-gray-400 text-sm"
                      >
                        <FormattedMessage id="USER.REVISION_HISTORY.NO_DATA" defaultMessage="No revision history found" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Revision Form Modal */}
      {showAddRevisionForm && (
        <>
          <div
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }}
            onClick={handleFormClose}
          />
          <div
            className="fixed top-1/2 left-1/2 z-[60] bg-white rounded-2xl no-scrollbar"
            style={{
              transform: "translate(-50%,-50%)",
              width: "min(500px,95vw)",
              maxHeight: "85vh",
              overflowY: "auto",
              boxShadow: "0 32px 64px rgba(0,0,0,.18)",
            }}
          >
            {/* Form Header — sticky */}
            <div className="flex items-center justify-between bg-primary px-6 py-4 rounded-t-2xl sticky top-0 z-10">
              <p className="text-white font-bold text-base">
                {editingRevision ? (
    <FormattedMessage id="USER.REVISION_HISTORY.EDIT_TITLE" defaultMessage="Edit Revision" />
  ) : (
    <FormattedMessage id="USER.REVISION_HISTORY.ADD_NEW_TITLE" defaultMessage="Add New Revision" />
  )}
              </p>
              <button
                onClick={handleFormClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                style={{ background: "rgba(255,255,255,.15)" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Body */}
            <div className="px-6 py-5">
              <AddRevisionHistoryForm
                eventId={eventId}
                userId={userId}
                editingRevision={editingRevision}
                existingCount={revisionList.length}
                onCancel={handleFormClose}
                onSaved={handleFormSaved}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default RevisionHistoryModal;