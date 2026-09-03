import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ManagerDropdown from "@/components/dropdowns/ManagerDropdown";
import { Fetchmanager, AddEventFollowUp } from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import dayjs from "dayjs";

const AddFollowUpForm = ({
  eventId,
  userId,
  editingFollowUp,
  onCancel,
  onSaved,
}) => {
  const [description, setDescription] = useState("");
  const [followupDate, setFollowupDate] = useState(null);
  const [managerId, setManagerId] = useState("");
  const [managerList, setManagerList] = useState([]);
  const [managerLoading, setManagerLoading] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const intl = useIntl();

  // ── Fetch managers — same pattern as OtherInfoStep ──────────────────────
  const FetchManager = () => {
    setManagerLoading(true);
    Fetchmanager(userId)
      .then((res) => {
        const managerData = res?.data?.data?.["userDetails"] || [];
        const list = managerData.map((man, index) => ({
          sr_no: index + 1,
          value: man.id,
          label: man.firstName || "-",
        }));
        setManagerList(list);
      })
      .catch((err) => {
        console.error("Failed to fetch managers:", err);
        setManagerList([]);
      })
      .finally(() => setManagerLoading(false));
  };

  useEffect(() => {
    if (userId) FetchManager();
  }, [userId]);

  // ── Prefill when editing ────────────────────────────────────────────────
  useEffect(() => {
    if (editingFollowUp) {
      setDescription(editingFollowUp.description || "");
      const rawDate = editingFollowUp.followDate || editingFollowUp.followupDate;
const parsed = rawDate ? dayjs(rawDate, "DD/MM/YYYY", true) : null;
setFollowupDate(parsed && parsed.isValid() ? parsed.toDate() : null);
     setManagerId(editingFollowUp.managerId ? Number(editingFollowUp.managerId) : "");
      setIsDone(!!editingFollowUp.isDone);
    } else {
      setDescription("");
      setFollowupDate(null);
      setManagerId("");
      setIsDone(false);
    }
  }, [editingFollowUp]);

  const handleManagerChange = (e) => {
    // Matches ManagerDropdown's onChange(event, key) usage seen in OtherInfoStep
    const value = e?.target?.value ?? e;
    setManagerId(value);
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const handleSave = async () => {
    if (!managerId || !description.trim()) {
      Swal.fire({
        icon: "warning",
        title: intl.formatMessage({
          id: "USER.FOLLOWUP.FILL_ALL_FIELDS",
          defaultMessage: "Please fill all required fields",
        }),
      });
      return;
    }

    const payload = {
      id: editingFollowUp?.id || null,
      eventId: Number(eventId),
      userId: Number(userId),
      managerId: Number(managerId),
      description,
      followupDate: formatDate(followupDate),
      isDone,
    };

    try {
      setSaving(true);
      const resp = await AddEventFollowUp(payload);
      if (resp?.data?.success) {
        Swal.fire({
          icon: "success",
          title: editingFollowUp
            ? intl.formatMessage({ id: "USER.FOLLOWUP.UPDATED_TITLE", defaultMessage: "Follow-up updated!" })
            : intl.formatMessage({ id: "USER.FOLLOWUP.ADDED_TITLE", defaultMessage: "Follow-up added!" }),
          timer: 1200,
          showConfirmButton: false,
        });
        onSaved?.();
      } else {
        Swal.fire({ icon: "error", title: resp?.data?.msg || "Failed to save follow-up" });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: err?.response?.data?.msg || "Something went wrong" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <FormattedMessage id="USER.FOLLOWUP.FOLLOW_MANAGER_LABEL" defaultMessage="Follow Manager" />
          <span className="text-red-500 ms-0.5">*</span>
        </label>
        <ManagerDropdown
          value={managerId}
          name="managerId"
          onChange={handleManagerChange}
          options={managerList}
          className="w-full"
          disabled={managerLoading}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <FormattedMessage id="USER.FOLLOWUP.DESCRIPTION_LABEL" defaultMessage="Description" />
          <span className="text-red-500 ms-0.5">*</span>
        </label>
        <textarea
          className="input input-md w-full"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={intl.formatMessage({
            id: "USER.FOLLOWUP.DESCRIPTION_PLACEHOLDER",
            defaultMessage: "Describe the follow-up…",
          })}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          <FormattedMessage id="USER.FOLLOWUP.FOLLOW_DATE_LABEL" defaultMessage="Follow Date" />
        </label>
        <DatePicker
          selected={followupDate}
          onChange={(date) => setFollowupDate(date)}
          dateFormat="dd/MM/yyyy"
          className="input input-md w-full"
          placeholderText={intl.formatMessage({
            id: "USER.FOLLOWUP.FOLLOW_DATE_PLACEHOLDER",
            defaultMessage: "Select follow date",
          })}
          isClearable
        />
        <p className="text-xs text-red-500 mt-0.5">
          <FormattedMessage
            id="USER.FOLLOWUP.FOLLOW_DATE_NOTE"
            defaultMessage="Note: If you leave follow date blank then reminder will not generate."
          />
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={isDone}
          onChange={(e) => setIsDone(e.target.checked)}
        />
        <FormattedMessage id="USER.FOLLOWUP.MARK_DONE_LABEL" defaultMessage="Mark as Done" />
      </label>

      <div className="flex justify-end gap-2 mt-2">
        <button type="button" className="btn btn-light text-sm" onClick={onCancel}>
          <FormattedMessage id="USER.FOLLOWUP.CLOSE_BTN" defaultMessage="Close" />
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="btn btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : null}
          <FormattedMessage id="USER.FOLLOWUP.SAVE_CHANGES_BTN" defaultMessage="Save Changes" />
        </button>
      </div>
    </div>
  );
};

export default AddFollowUpForm;