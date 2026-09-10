import { useCallback, useEffect, useState } from "react";
import { X, History, Trash2, Edit } from "lucide-react";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { GetEventFollowUp, DeleteEventFollowUp } from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import AddFollowUpForm from "../add-followup/AddFollowUpForm";
import { getFollowUpColumns } from "./constant";
import { TableComponent } from "../../../components/table/TableComponent";

const FollowUpTrackModal = ({
  isOpen,
  onClose,
  eventId,
  userId,
  canAdd = true,         
  canEdit = true,         
  canDelete = true,       
  eventInfo = null, 
  
}) => {
  const [followUpList, setFollowUpList] = useState([]);
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState(null);
  const intl = useIntl();


  const getFollowupDayFromLocalStorage = () => {
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const day = parsed?.state?.user?.followupDay;

    return day != null ? Number(day) : null;
  } catch (err) {
    console.error("[getFollowupDayFromLocalStorage] Failed:", err);
    return null;
  }
}; 

const fetchFollowUps = useCallback(async () => {
  if (!eventId || !userId) return;
  try {
    setFollowUpLoading(true);

    const followupDay = getFollowupDayFromLocalStorage();

    const startDate = dayjs().format("DD/MM/YYYY");
    const endDate =
      followupDay && followupDay > 0
        ? dayjs().add(followupDay - 1, "day").format("DD/MM/YYYY")
        : dayjs().add(50, "year").format("DD/MM/YYYY"); // fallback if not found

    const res = await GetEventFollowUp(eventId, userId, "", "");
    const list =
      res?.data?.data?.["Event Followup Details"] ||
      res?.data?.data ||
      res?.data ||
      [];
    setFollowUpList(
      Array.isArray(list) ? list.map((item, index) => ({ ...item, srNo: index + 1 })) : [],
    );
  } catch (err) {
    console.error("Failed to fetch follow-up history:", err);
    setFollowUpList([]);
  } finally {
    setFollowUpLoading(false);
  }
}, [eventId, userId]);

  useEffect(() => {
    if (isOpen) {
      fetchFollowUps();
    } else {
      setShowAddForm(false);
      setEditingFollowUp(null);
    }
  }, [isOpen, fetchFollowUps]);

  const openAddForm = () => { setEditingFollowUp(null); setShowAddForm(true); };
  const openEditForm = (row) => { setEditingFollowUp(row); setShowAddForm(true); };
  const handleFormClose = () => { setShowAddForm(false); setEditingFollowUp(null); };
  const handleFormSaved = () => { setShowAddForm(false); setEditingFollowUp(null); fetchFollowUps(); };

  const handleDeleteFollowUp = async (id) => {
    const result = await Swal.fire({
      title: intl.formatMessage({
        id: "USER.FOLLOWUP.DELETE_CONFIRM_TITLE",
        defaultMessage: "Delete this follow-up?",
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: intl.formatMessage({
        id: "USER.FOLLOWUP.DELETE_BTN",
        defaultMessage: "Delete",
      }),
      confirmButtonColor: "#d33",
    });
    if (!result.isConfirmed) return;
    try {
      const resp = await DeleteEventFollowUp(id);
      if (resp?.data?.success !== false) {
        Swal.fire({
          icon: "success",
          title: intl.formatMessage({ id: "USER.FOLLOWUP.DELETED_TITLE", defaultMessage: "Deleted!" }),
          timer: 1000,
          showConfirmButton: false,
        });
        fetchFollowUps();
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
      <div
        className="fixed inset-0 z-50"
        style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      <div
        className="fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl no-scrollbar"
        style={{
          transform: "translate(-50%,-50%)",
          width: "min(1000px,95vw)",
          maxHeight: "85vh",
          overflowY: "auto",
          boxShadow: "0 32px 64px rgba(0,0,0,.18)",
        }}
      >
        <div className="flex items-center justify-between bg-primary px-6 py-5 rounded-t-2xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,.2)" }}
            >
              <History size={18} color="#fff" />
            </div>
            <p className="text-white font-bold text-base leading-tight">
              <FormattedMessage id="USER.FOLLOWUP.MODAL_TITLE" defaultMessage="Follow Up Track" />
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

        {eventInfo && (
  <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-4 gap-2 text-sm">
    <div>
      <span className="text-gray-500 text-xs uppercase tracking-wide block">
        <FormattedMessage id="USER.FOLLOWUP.CLIENT_NAME_LABEL" defaultMessage="Client Name" />
      </span>
      <span className="font-semibold text-gray-800">{eventInfo.customerName || "—"}</span>
    </div>
    <div>
      <span className="text-gray-500 text-xs uppercase tracking-wide block">
        <FormattedMessage id="USER.FOLLOWUP.MOBILE_LABEL" defaultMessage="Mobile" />
      </span>
      <span className="font-semibold text-gray-800">{eventInfo.mobile || "—"}</span>
    </div>
    <div>
      <span className="text-gray-500 text-xs uppercase tracking-wide block">
        <FormattedMessage id="USER.FOLLOWUP.EVENT_NAME_LABEL" defaultMessage="Venue" />
      </span>
      <span className="font-semibold text-gray-800">{eventInfo.eventName || "—"}</span>
    </div>
    <div>
      <span className="text-gray-500 text-xs uppercase tracking-wide block">
        <FormattedMessage id="USER.FOLLOWUP.EVENT_DATE_LABEL" defaultMessage="Event Date" />
      </span>
      <span className="font-semibold text-gray-800">{eventInfo.eventDate || "—"}</span>
    </div>
  </div>
)}

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="flex justify-end">
            {canAdd && (
              <button
                type="button"
                onClick={openAddForm}
                className="btn btn-primary text-sm px-4 py-1.5"
              >
                <FormattedMessage id="USER.FOLLOWUP.ADD_FOLLOWUP_BTN" defaultMessage="+ Add Follow Up" />
              </button>
            )}
          </div>

          {followUpLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
           <TableComponent
  data={followUpList}
  columns={getFollowUpColumns({
    canEdit,
    canDelete,
    onEdit: openEditForm,
    onDelete: handleDeleteFollowUp,
  })}
  loading={followUpLoading}
/>
          )}
        </div>
      </div>

      {showAddForm && (
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
            <div className="flex items-center justify-between bg-primary px-6 py-4 rounded-t-2xl sticky top-0 z-10">
              <p className="text-white font-bold text-base">
                {editingFollowUp ? (
                  <FormattedMessage id="USER.FOLLOWUP.EDIT_TITLE" defaultMessage="Edit Follow Up" />
                ) : (
                  <FormattedMessage id="USER.FOLLOWUP.ADD_NEW_TITLE" defaultMessage="Add Follow Up" />
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

            <div className="px-6 py-5">
              <AddFollowUpForm
                eventId={eventId}
                userId={userId}
                editingFollowUp={editingFollowUp}
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

export default FollowUpTrackModal;