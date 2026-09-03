import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AddInquiry } from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import { Select } from "antd";

const AddInquiryForm = ({ userId, editingInquiry, onCancel, onSaved }) => {
  const intl = useIntl();
  const [guestName, setGuestName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [emailId, setEmailId] = useState("");
  const [functionName, setFunctionName] = useState("");
  const [guestAddress, setGuestAddress] = useState("");
 const [referralSource, setReferralSource] = useState("");
const [customReferralSource, setCustomReferralSource] = useState("");

const [inquiryDate, setInquiryDate] = useState(new Date());
const [tentativeDates, setTentativeDates] = useState([]);
  const [saving, setSaving] = useState(false);

  const parseDate = (value) => {
    if (!value) return null;
    const parts = value.split("/");
    if (parts.length === 3) {
      return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
    const d = new Date(value);
    return isNaN(d) ? null : d;
  };


  const parseMultipleDates = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((date) => parseDate(date))
      .filter(Boolean);
  }

  return value
    .split(",")
    .map((date) => parseDate(date.trim()))
    .filter(Boolean);
};

useEffect(() => {
  if (editingInquiry) {
    setGuestName(editingInquiry.guestName || "");
    setMobileNo(editingInquiry.mobileNo || "");
    setEmailId(editingInquiry.emailId || "");
    setFunctionName(editingInquiry.function || "");
    setGuestAddress(editingInquiry.guestAddress || "");

    const referral = editingInquiry.referralSource || "";

    const predefinedReferralSources = [
      "Friends",
      "Relatives",
      "Social Media",
      "Advertisement",
    ];

    if (predefinedReferralSources.includes(referral)) {
      setReferralSource(referral);
      setCustomReferralSource("");
    } else if (referral) {
      setReferralSource("Other");
      setCustomReferralSource(referral);
    } else {
      setReferralSource("");
      setCustomReferralSource("");
    }

    setInquiryDate(
      parseDate(editingInquiry.inquiryDate) || new Date()
    );

    setTentativeDates(
      parseMultipleDates(editingInquiry.tentativeDate)
    );
  } else {
    setGuestName("");
    setMobileNo("");
    setEmailId("");
    setFunctionName("");
    setGuestAddress("");

    setReferralSource("");
    setCustomReferralSource("");

    setInquiryDate(new Date());
    setTentativeDates([]);
  }
}, [editingInquiry]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

const formatMultipleDates = (dates) => {
  if (!dates || !Array.isArray(dates)) return "";

  return [...dates]
    .filter(Boolean)
    .sort((a, b) => a.getTime() - b.getTime())
    .map((date) => formatDate(date))
    .join(",");
};
  const inputCls =
    "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelCls = "text-xs font-semibold text-gray-600 uppercase tracking-wide";


  const handleTentativeDateChange = (date) => {
  if (!date) return;

  setTentativeDates((prevDates) => {
    const alreadySelected = prevDates.some(
      (selectedDate) =>
        selectedDate.toDateString() === date.toDateString()
    );

    if (alreadySelected) {
      // Remove date if clicked again
      return prevDates.filter(
        (selectedDate) =>
          selectedDate.toDateString() !== date.toDateString()
      );
    }

    // Add new date
    return [...prevDates, date];
  });
};

  const handleSave = async () => {
    if (!guestName.trim() || !mobileNo.trim() || !inquiryDate) {
      Swal.fire({
        icon: "warning",
        title: intl.formatMessage({
          id: "USER.INQUIRY.FORM.FILL_REQUIRED_FIELDS",
          defaultMessage: "Please fill all required fields",
        }),
      });
      return;
    }

    const payload = {
      id: editingInquiry?.id || -1,
      userId: Number(userId),
      guestName,
      mobileNo,
      emailId,
      function: functionName,
      guestAddress,
      referralSource:
  referralSource === "Other"
    ? customReferralSource.trim()
    : referralSource,

inquiryDate: formatDate(inquiryDate),

tentativeDate: formatMultipleDates(tentativeDates),
    };

    try {
      setSaving(true);
      const resp = await AddInquiry(payload);
      if (resp?.data?.success) {
        Swal.fire({
          icon: "success",
          title: editingInquiry
            ? intl.formatMessage({
                id: "USER.INQUIRY.FORM.UPDATED_TITLE",
                defaultMessage: "Inquiry updated!",
              })
            : intl.formatMessage({
                id: "USER.INQUIRY.FORM.ADDED_TITLE",
                defaultMessage: "Inquiry added!",
              }),
          timer: 1200,
          showConfirmButton: false,
        });
        onSaved?.();
      } else {
        Swal.fire({
          icon: "error",
          title:
            resp?.data?.msg ||
            intl.formatMessage({
              id: "USER.INQUIRY.FORM.SAVE_FAILED",
              defaultMessage: "Failed to save",
            }),
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title:
          err?.response?.data?.msg ||
          intl.formatMessage({
            id: "USER.INQUIRY.FORM.SOMETHING_WRONG",
            defaultMessage: "Something went wrong",
          }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            <FormattedMessage id="USER.INQUIRY.FORM.GUEST_NAME_LABEL" defaultMessage="Guest Name" />{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={inputCls}
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder={intl.formatMessage({
              id: "USER.INQUIRY.FORM.GUEST_NAME_PLACEHOLDER",
              defaultMessage: "Enter guest name",
            })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            <FormattedMessage id="USER.INQUIRY.FORM.MOBILE_LABEL" defaultMessage="Mobile No" />{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className={inputCls}
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            placeholder={intl.formatMessage({
              id: "USER.INQUIRY.FORM.MOBILE_PLACEHOLDER",
              defaultMessage: "Enter mobile number",
            })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            <FormattedMessage id="USER.INQUIRY.FORM.EMAIL_LABEL" defaultMessage="Email" />
          </label>
          <input
            type="email"
            className={inputCls}
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            placeholder={intl.formatMessage({
              id: "USER.INQUIRY.FORM.EMAIL_PLACEHOLDER",
              defaultMessage: "Enter email",
            })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            <FormattedMessage id="USER.INQUIRY.FORM.FUNCTION_LABEL" defaultMessage="Function" />
          </label>
          <input
            type="text"
            className={inputCls}
            value={functionName}
            onChange={(e) => setFunctionName(e.target.value)}
            placeholder={intl.formatMessage({
              id: "USER.INQUIRY.FORM.FUNCTION_PLACEHOLDER",
              defaultMessage: "e.g. Wedding, Birthday",
            })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>
          <FormattedMessage id="USER.INQUIRY.FORM.ADDRESS_LABEL" defaultMessage="Guest Address" />
        </label>
        <input
          type="text"
          className={inputCls}
          value={guestAddress}
          onChange={(e) => setGuestAddress(e.target.value)}
          placeholder={intl.formatMessage({
            id: "USER.INQUIRY.FORM.ADDRESS_PLACEHOLDER",
            defaultMessage: "Enter guest address",
          })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            <FormattedMessage id="USER.INQUIRY.FORM.INQUIRY_DATE_LABEL" defaultMessage="Inquiry Date" />{" "}
            <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={inquiryDate}
            onChange={setInquiryDate}
            dateFormat="dd/MM/yyyy"
            className={inputCls}
            wrapperClassName="w-full"
            placeholderText={intl.formatMessage({
              id: "USER.INQUIRY.FORM.SELECT_DATE_PLACEHOLDER",
              defaultMessage: "Select date",
            })}
          />
        </div>
       <div className="flex flex-col gap-1.5">
  <label className={labelCls}>
    <FormattedMessage
      id="USER.INQUIRY.FORM.TENTATIVE_DATE_LABEL"
      defaultMessage="Tentative Dates"
    />
  </label>

  <DatePicker
    selected={null}
    onChange={handleTentativeDateChange}
    dateFormat="dd/MM/yyyy"
    className={inputCls}
    wrapperClassName="w-full"
    placeholderText="Select tentative dates"
  />

  {/* Selected Dates */}
  {tentativeDates.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-2">
      {tentativeDates.map((date) => (
        <div
          key={date.toISOString()}
          className="flex items-center gap-2 px-2.5 py-1.5 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700"
        >
          <span>{formatDate(date)}</span>

          <button
            type="button"
            onClick={() => {
              setTentativeDates((prevDates) =>
                prevDates.filter(
                  (d) =>
                    d.toDateString() !== date.toDateString()
                )
              );
            }}
            className="text-blue-500 hover:text-red-500 font-bold"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )}
</div>
      </div>

     <div className="flex flex-col gap-1.5">
  <label className={labelCls}>
    <FormattedMessage
      id="USER.INQUIRY.FORM.REFERRAL_LABEL"
      defaultMessage="Referral Source"
    />
  </label>

  <Select
    value={referralSource || undefined}
    onChange={(value) => {
      setReferralSource(value);

      if (value !== "Other") {
        setCustomReferralSource("");
      }
    }}
    placeholder="Select referral source"
    className="w-full"
    size="large"
    options={[
      {
        value: "Friends",
        label: "Friends",
      },
      {
        value: "Relatives",
        label: "Relatives",
      },
      {
        value: "Social Media",
        label: "Social Media",
      },
      {
        value: "Advertisement",
        label: "Advertisement",
      },
      {
        value: "Other",
        label: "Other",
      },
    ]}
  />

  {referralSource === "Other" && (
    <input
      type="text"
      className={inputCls}
      value={customReferralSource}
      onChange={(e) => setCustomReferralSource(e.target.value)}
      placeholder="Enter referral source"
    />
  )}
</div>

      <div className="flex justify-end gap-2 mt-1">
        <button type="button" className="btn btn-light text-sm" onClick={onCancel}>
          <FormattedMessage id="USER.INQUIRY.FORM.CANCEL_BTN" defaultMessage="Cancel" />
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="btn btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {editingInquiry ? (
            <FormattedMessage id="USER.INQUIRY.FORM.UPDATE_BTN" defaultMessage="Update" />
          ) : (
            <FormattedMessage id="USER.INQUIRY.FORM.SAVE_BTN" defaultMessage="Save" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AddInquiryForm;