import { useEffect, useState, useRef } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { GetParentUser, AddRevisionHistory } from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";

const AddRevisionHistoryForm = ({
  eventId,
  userId,
  editingRevision,
  existingCount,
  onCancel,
  onSaved,
}) => {
  const [revisionDate, setRevisionDate] = useState(null);
  const [revisionChanges, setRevisionChanges] = useState("");
  const [selectedApprovedBy, setSelectedApprovedBy] = useState(null);
  const [approvedByOptions, setApprovedByOptions] = useState([]);
  const [approvedByLoading, setApprovedByLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const intl = useIntl();
  const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
  const roleId = authStorage?.state?.user?.userBasicDetails?.role?.id;
  const loggedInUser = {
  userId: authStorage?.state?.user?.userBasicDetails?.id || userId,
  userName:
    authStorage?.state?.user?.userBasicDetails?.name ||
    authStorage?.state?.user?.userBasicDetails?.userName ||
    "Current User",
};

  useEffect(() => {
    if (editingRevision) {
      setRevisionDate(
        editingRevision.revisionDate
          ? new Date(editingRevision.revisionDate)
          : null,
      );
      setRevisionChanges(editingRevision.changes || "");
      setSelectedApprovedBy(
        editingRevision.approvedBy
          ? {
              userId: editingRevision.approvedBy,
              userName: editingRevision.approvedByName || "",
            }
          : null,
      );
    } else {
  setRevisionDate(null);
  setRevisionChanges("");
  setSelectedApprovedBy(roleId === 2 ? loggedInUser : null);
}
  }, [editingRevision]);

  useEffect(() => {
    const fetchApprovedByUsers = async () => {
      if (!userId) return;
      try {
        setApprovedByLoading(true);
        const res = await GetParentUser(roleId, userId);
        const list = res?.data?.data || [];
const options = Array.isArray(list) && list.length > 0
  ? list
  : roleId === 2 ? [loggedInUser] : [];
setApprovedByOptions(options);
      } catch (err) {
  console.error("Failed to fetch approved-by users:", err);
  setApprovedByOptions(roleId === 2 ? [loggedInUser] : []);
} finally {
        setApprovedByLoading(false);
      }
    };
    fetchApprovedByUsers();
  }, [roleId, userId]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredOptions = approvedByOptions.filter((u) => {
    const name = (u.userName || "").toLowerCase();
    return name.includes(searchTerm.toLowerCase());
  });

  const handleSelect = (user) => {
    setSelectedApprovedBy({
      userId: user.userId,
      userName: user.userName || "",
    });
    setDropdownOpen(false);
    setSearchTerm("");
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    let h = date.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const hh = h.toString().padStart(2, "0");
    const mm = date.getMinutes().toString().padStart(2, "0");
    return `${d}/${m}/${y} ${hh}:${mm} ${ampm}`;
  };

  const handleSave = async () => {
    if (!revisionDate || !selectedApprovedBy || !revisionChanges.trim()) {
      Swal.fire({
  icon: "warning",
  title: intl.formatMessage({
    id: "USER.REVISION_HISTORY.FILL_ALL_FIELDS",
    defaultMessage: "Please fill all fields",
  }),
});
      return;
    }

    const payload = {
      id: editingRevision?.id || 0,
      eventId: Number(eventId),
      userId: Number(userId),
      approvedBy: Number(selectedApprovedBy.userId) || userId,
      revisionDate: formatDate(revisionDate),
      changes: revisionChanges,
    };

    try {
      setSaving(true);
      const resp = await AddRevisionHistory(payload);
      if (resp?.data?.success) {
       Swal.fire({
  icon: "success",
  title: editingRevision
    ? intl.formatMessage({ id: "USER.REVISION_HISTORY.UPDATED_TITLE", defaultMessage: "Revision updated!" })
    : intl.formatMessage({ id: "USER.REVISION_HISTORY.ADDED_TITLE", defaultMessage: "Revision added!" }),
  timer: 1200,
  showConfirmButton: false,
});
        onSaved?.();
      } else {
        Swal.fire({
          icon: "error",
          title: resp?.data?.msg || "Failed to save revision",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err?.response?.data?.msg || "Something went wrong",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <FormattedMessage id="USER.REVISION_HISTORY.REVISION_DATE_LABEL" defaultMessage="Revision Date" />
        </label>
        <DatePicker
          selected={revisionDate}
          onChange={(date) => setRevisionDate(date)}
          dateFormat="dd/MM/yyyy hh:mm aa"
          showTimeSelect
          timeFormat="hh:mm aa"
          timeIntervals={1}
          timeCaption="Time"
          className="input input-md w-full"
          placeholderText={intl.formatMessage({
            id: "USER.REVISION_HISTORY.DATE_PLACEHOLDER",
            defaultMessage: "Select date and time",
          })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <FormattedMessage id="USER.REVISION_HISTORY.APPROVED_BY_LABEL" defaultMessage="Approved By" />
        </label>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            disabled={approvedByLoading}
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="input input-md w-full flex items-center justify-between text-left disabled:opacity-50"
          >
            <span className={selectedApprovedBy ? "text-gray-900" : "text-gray-400"}>
              {approvedByLoading ? (
                <FormattedMessage id="USER.REVISION_HISTORY.LOADING" defaultMessage="Loading…" />
              ) : (
                selectedApprovedBy?.userName || (
                  <FormattedMessage id="USER.REVISION_HISTORY.SELECT_USER" defaultMessage="Select user" />
                )
              )}
            </span>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
              style={{ zIndex: 9999, maxHeight: 200, overflowY: "auto" }}
            >
              <div className="sticky top-0 bg-white px-3 py-2 border-b border-gray-100">
                <input
                  type="text"
                  autoFocus
                  className="w-full text-sm outline-none bg-transparent"
                  placeholder={intl.formatMessage({
                    id: "USER.REVISION_HISTORY.SEARCH_USER_PLACEHOLDER",
                    defaultMessage: "Search user…",
                  })}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {filteredOptions.length === 0 ? (
                <div className="px-3 py-3 text-sm text-gray-400 text-center">
                  <FormattedMessage id="USER.REVISION_HISTORY.NO_USERS_FOUND" defaultMessage="No users found" />
                </div>
              ) : (
                filteredOptions.map((user) => (
                  <div
                    key={user.userId}
                    className={`px-3 py-2.5 text-sm cursor-pointer flex items-center justify-between
                      ${selectedApprovedBy?.userId === user.userId ? "bg-primary/10 text-primary font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(user);
                    }}
                  >
                    <span>{user.userName}</span>
                    {selectedApprovedBy?.userId === user.userId && (
                      <span className="text-primary text-xs">✓</span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <FormattedMessage id="USER.REVISION_HISTORY.CHANGES_LABEL" defaultMessage="Changes" />
        </label>
        <textarea
          className="input input-md w-full"
          rows={3}
          value={revisionChanges}
          onChange={(e) => setRevisionChanges(e.target.value)}
          placeholder={intl.formatMessage({
            id: "USER.REVISION_HISTORY.CHANGES_PLACEHOLDER",
            defaultMessage: "Describe the changes made…",
          })}
        />
      </div>

      <div className="flex justify-end gap-2 mt-2">
        <button type="button" className="btn btn-light text-sm" onClick={onCancel}>
          <FormattedMessage id="USER.REVISION_HISTORY.CANCEL_BTN" defaultMessage="Cancel" />
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="btn btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          <FormattedMessage id="USER.REVISION_HISTORY.SAVE_BTN" defaultMessage="Save" />
        </button>
      </div>
    </div>
  );
};

export default AddRevisionHistoryForm;
