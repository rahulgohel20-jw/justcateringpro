import { useEffect, useState, useRef } from "react";
import { Loader2, ChevronDown } from "lucide-react";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  GetbankdetailsbyuserId,
  CashAccountGetAll,
  AddEventAdvancePayment,
  GetAllMemberByUserId,
  GetEventMasterById,
} from "@/services/apiServices";
import { Select } from "antd";
import { FormattedMessage, useIntl } from "react-intl";

const AddAdvancePaymentForm = ({
  eventId,
  userId,
  editingPayment,
  onCancel,
  onSaved,
}) => {
  const intl = useIntl();
  const [paymentDate, setPaymentDate] = useState(null);
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("")
  const [cashId, setCashAccountId] = useState(""); 
  const [referenceId, setReferenceId] = useState("");
  const [remark, setRemark] = useState("");
  const [saving, setSaving] = useState(false);
const [depositTo, setDepositTo] = useState(""); 
  const [bankList, setBankList] = useState([]);
  const [cashList, setCashList] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [entryBy, setEntryBy] = useState("");
  const [loadingBank, setLoadingBank] = useState(false);
  const [loadingCash, setLoadingCash] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [functionList, setFunctionList] = useState([]);
  const [functionId, setFunctionId] = useState("");
  const [banquetHallId, setBanquetHallId] = useState("");
  const [loadingFunctions, setLoadingFunctions] = useState(false);

  useEffect(() => {
    if (editingPayment) {
      let parsed = null;
      if (editingPayment.paymentDate) {
        const parts = editingPayment.paymentDate.split("/");
        if (parts.length === 3) {
          parsed = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
      }
      setPaymentDate(parsed);
      setAmount(String(editingPayment.amount ?? ""));
      setPaymentMode(editingPayment.paymentMode ?? "");
      setDepositTo(String(editingPayment.bankId ?? ""));
      setCashAccountId(String(editingPayment.cashId ?? ""));
      setReferenceId(editingPayment.referenceId ?? "");
      setRemark(editingPayment.remark ?? "");
      setEntryBy(String(editingPayment.entryBy ?? ""));
     setFunctionId(editingPayment.eventFunctionId ? String(editingPayment.eventFunctionId) : "");
     setBanquetHallId(editingPayment.banquetHallId ? String(editingPayment.banquetHallId) : "");
    } else {
      setPaymentDate(null);
      setAmount("");
      setPaymentMode("");
      setDepositTo("");
      setCashAccountId("");
      setReferenceId("");
      setRemark("");
      setEntryBy("");
      setFunctionId("");
      setBanquetHallId("");
    }
  }, [editingPayment]);

useEffect(() => {
  if (bankList.length > 0 && !depositTo && paymentMode && paymentMode !== "Cash" && !editingPayment) {
    const primary = getPrimaryAccount(bankList);
    if (primary) setDepositTo(String(primary.id));
  }
}, [bankList]);

useEffect(() => {
  if (cashList.length > 0 && !cashId && paymentMode === "Cash" && !editingPayment) {
    const primary = getPrimaryAccount(cashList);
    if (primary) setCashAccountId(String(primary.id));
  }
}, [cashList]);

  useEffect(() => {
    if (paymentMode === "Cash" && !referenceId) {
      setReferenceId("CASH");
    }
  }, [paymentMode]);

  
  useEffect(() => {
    const fetchBank = async () => {
      try {
        setLoadingBank(true);
        const res = await GetbankdetailsbyuserId(userId);
        setBankList(res?.data?.data || []);
      } catch {
        setBankList([]);
      } finally {
        setLoadingBank(false);
      }
    };
    const fetchCash = async () => {
      try {
        setLoadingCash(true);
        const res = await CashAccountGetAll(userId);
        setCashList(res?.data?.data || []);
      } catch {
        setCashList([]);
      } finally {
        setLoadingCash(false);
      }
    };
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true);
        const res = await GetAllMemberByUserId(userId);
        const raw = res?.data?.data;
        const list =
          raw?.userDetails?.UserDetails ||
          raw?.UserDetails ||
          (Array.isArray(raw) ? raw : []);
        setMemberList(list);
      } catch {
        setMemberList([]);
      } finally {
        setLoadingMembers(false);
      }
    };
    if (userId) {
      fetchBank();
      fetchCash();
      fetchMembers();
    }
  }, [userId]);

  useEffect(() => {
    const fetchFunctions = async () => {
      try {
        setLoadingFunctions(true);
        const res = await GetEventMasterById(eventId);
        const eventDetails = res?.data?.data?.["Event Details"]?.[0];
        const functions = eventDetails?.eventFunctions || [];
        setFunctionList(functions);
      } catch {
        setFunctionList([]);
      } finally {
        setLoadingFunctions(false);
      }
    };
    if (eventId) fetchFunctions();
  }, [eventId]);

useEffect(() => {
  if (functionList.length > 0 && editingPayment?.eventFunctionId) {
    setFunctionId(String(editingPayment.eventFunctionId));
  }
}, [functionList]);

const buildFunctionLabels = (f) => {
  const functionName =
    f.function?.nameEnglish || f.function?.nameHindi || "Function";

  const start = f.functionStartDateTime || "";
  const end = f.functionEndDateTime || "";
  const timeRange = [start, end].filter(Boolean).join(" - ");
  const functionPart = timeRange ? `${functionName}, ${timeRange}` : functionName;

  let venueEntries = [];

  if (f.banquetHallShifts && f.banquetHallShifts.length > 0) {
    venueEntries = f.banquetHallShifts.map((shift) => {
      const hallName = shift.banquetHallName?.trim() || "No Venue";
      const venuePart = shift.shiftName ? `${hallName} (${shift.shiftName})` : hallName;
      return { venuePart, banquetHallId: shift.banquetHallId ?? null };
    });
  } else {
    venueEntries = [{ venuePart: "No Venue", banquetHallId: null }];
  }

  return venueEntries.map(({ venuePart, banquetHallId }) => ({
    label: `${venuePart} (${functionPart})`,
    banquetHallId,
  }));
};

  const formatDate = (date) => {
    if (!date) return "";
    const d = date.getDate().toString().padStart(2, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const handleSave = async () => {
    if (!paymentDate || !amount || !paymentMode || !entryBy) {
      Swal.fire({
        icon: "warning",
        title: intl.formatMessage({
          id: "USER.ADVANCE_PAYMENT.FORM.FILL_REQUIRED_FIELDS",
          defaultMessage: "Please fill all required fields",
        }),
      });
      return;
    }
      if (!functionId) {
    Swal.fire({
      icon: "warning",
      title: intl.formatMessage({
        id: "USER.ADVANCE_PAYMENT.FORM.SELECT_VENUE_WARNING",
        defaultMessage: "Please select a Venue",
      }),
    });
    return;
  }
    if (paymentMode === "Cash" && !cashId) {
      Swal.fire({
        icon: "warning",
        title: intl.formatMessage({
          id: "USER.ADVANCE_PAYMENT.FORM.SELECT_CASH_ACCOUNT_WARNING",
          defaultMessage: "Please select a Cash Account",
        }),
      });
      return;
    }
    if (paymentMode !== "Cash" && !depositTo) {
      Swal.fire({
        icon: "warning",
        title: intl.formatMessage({
          id: "USER.ADVANCE_PAYMENT.FORM.SELECT_BANK_WARNING",
          defaultMessage: "Please select a Bank",
        }),
      });
      return;
    }

    const payload = {
      id: editingPayment?.id || -1,
      eventId: Number(eventId),
      userId: Number(userId),
      entryBy: Number(entryBy),
      eventFunctionId: functionId ? Number(functionId) : null,
       banquetHallId: banquetHallId ? Number(banquetHallId) : null,
      amount: Number(amount),
      paymentMode,
      bankId: paymentMode !== "Cash" ? Number(depositTo) || null: null,
      cashId: paymentMode === "Cash" ? Number(cashId) || null : null,
      paymentDate: formatDate(paymentDate),
      referenceId,
      remark,
    };

    try {
      setSaving(true);
      const resp = await AddEventAdvancePayment(payload);
      if (resp?.data?.success) {
        Swal.fire({
          icon: "success",
          title: editingPayment
            ? intl.formatMessage({
                id: "USER.ADVANCE_PAYMENT.FORM.PAYMENT_UPDATED",
                defaultMessage: "Payment updated!",
              })
            : intl.formatMessage({
                id: "USER.ADVANCE_PAYMENT.FORM.PAYMENT_ADDED",
                defaultMessage: "Payment added!",
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
              id: "USER.ADVANCE_PAYMENT.FORM.SAVE_FAILED",
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
            id: "USER.ADVANCE_PAYMENT.FORM.SOMETHING_WRONG",
            defaultMessage: "Something went wrong",
          }),
      });
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelCls = "text-xs font-semibold text-gray-600 uppercase tracking-wide";

  const getPrimaryAccount = (list) => {
  if (!list || list.length === 0) return null;
  return list.find((a) => a.isPrimary === 1 || a.isPrimary === true) || list[0];
};
const selectedVenueValue = functionId
  ? `${functionId}|${banquetHallId || "null"}`
  : undefined;
  return (
    <div className="flex flex-col gap-4">
      {/* Date + Amount */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            <FormattedMessage id="USER.ADVANCE_PAYMENT.FORM.DATE_LABEL" defaultMessage="Date" />{" "}
            <span className="text-red-500">*</span>
          </label>
          <DatePicker
            selected={paymentDate}
            onChange={setPaymentDate}
            dateFormat="dd/MM/yyyy"
            placeholderText={intl.formatMessage({
              id: "USER.ADVANCE_PAYMENT.FORM.SELECT_DATE_PLACEHOLDER",
              defaultMessage: "Select date",
            })}
            className={inputCls}
            wrapperClassName="w-full"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            <FormattedMessage id="USER.ADVANCE_PAYMENT.FORM.AMOUNT_LABEL" defaultMessage="Amount" />{" "}
            <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={0}
            className={inputCls}
            placeholder={intl.formatMessage({
              id: "USER.ADVANCE_PAYMENT.FORM.ENTER_AMOUNT_PLACEHOLDER",
              defaultMessage: "Enter amount",
            })}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
      </div>

    
{/* Function (Venue / Banquet) */}
<div className="flex flex-col gap-1.5">
  <label className={labelCls}>
    <FormattedMessage id="USER.ADVANCE_PAYMENT.FORM.VENUE_LABEL" defaultMessage="Venue" />{" "}
    <span className="text-red-500">*</span>
  </label>
  {loadingFunctions ? (
    <Select
      loading
      
      disabled
      placeholder={intl.formatMessage({
        id: "USER.ADVANCE_PAYMENT.FORM.LOADING",
        defaultMessage: "Loading...",
      })}
      className="w-full"
      size="large"
    />
  ) : (
    (() => {
      const venueOptions = functionList.flatMap((f) =>
  buildFunctionLabels(f).map(({ label, banquetHallId: hallId }) => ({
    value: `${f.id}|${hallId}`,
    label,
  }))
);

      if (venueOptions.length === 0) {
        return (
          <div className={`${inputCls} bg-gray-50 text-gray-400 flex items-center`}>
            <FormattedMessage id="USER.ADVANCE_PAYMENT.FORM.NO_VENUE_AVAILABLE" defaultMessage="No Venue Available" />
          </div>
        );
      }

      return (
        <Select
          value={selectedVenueValue}
          onChange={(val) => {
            if (!val) {
              setFunctionId("");
              setBanquetHallId("");
              return;
            }
            const [fId, hallId] = String(val).split("|");
            setFunctionId(fId);
            setBanquetHallId(hallId || "");
          }}
          placeholder={intl.formatMessage({
            id: "USER.ADVANCE_PAYMENT.FORM.SELECT_VENUE_PLACEHOLDER",
            defaultMessage: "Select venue",
          })}
          allowClear
          size="large"
          className="w-full"
          popupMatchSelectWidth={false}
          options={venueOptions}
        />
      );
    })()
  )}
</div>
      {/* Payment Mode */}
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>
          <FormattedMessage id="USER.ADVANCE_PAYMENT.FORM.PAYMENT_MODE_LABEL" defaultMessage="Payment Mode" />{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
   <select
  value={paymentMode}
onChange={(e) => {
  const mode = e.target.value;
  setPaymentMode(mode);
  setReferenceId(""); 
  if (mode === "Cash") {
    setDepositTo("");
    const primaryCash = getPrimaryAccount(cashList);
    if (primaryCash) setCashAccountId(String(primaryCash.id));
  } else {
    setCashAccountId("");
    const primaryBank = getPrimaryAccount(bankList);
    if (primaryBank) setDepositTo(String(primaryBank.id));
  }
}}
  className={`${inputCls} pr-9 appearance-none bg-white`}
>
            <option value="">
              {intl.formatMessage({
                id: "USER.ADVANCE_PAYMENT.FORM.SELECT_MODE_OPTION",
                defaultMessage: "Select Mode",
              })}
            </option>
            <option>
              {intl.formatMessage({
                id: "USER.ADVANCE_PAYMENT.FORM.MODE_BANK_TRANSFER",
                defaultMessage: "Bank Transfer",
              })}
            </option>
            <option>
              {intl.formatMessage({
                id: "USER.ADVANCE_PAYMENT.FORM.MODE_CASH",
                defaultMessage: "Cash",
              })}
            </option>
            <option>
              {intl.formatMessage({
                id: "USER.ADVANCE_PAYMENT.FORM.MODE_UPI",
                defaultMessage: "UPI",
              })}
            </option>
            <option>
              {intl.formatMessage({
                id: "USER.ADVANCE_PAYMENT.FORM.MODE_CHEQUE",
                defaultMessage: "Cheque",
              })}
            </option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Entry By */}
      <div className="flex flex-col gap-1.5">
        <label className={labelCls}>
          <FormattedMessage id="USER.ADVANCE_PAYMENT.FORM.ENTRY_BY_LABEL" defaultMessage="Entry By" />{" "}
          <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            value={entryBy}
            onChange={(e) => setEntryBy(e.target.value)}
            disabled={loadingMembers}
            className={`${inputCls} pr-9 appearance-none bg-white disabled:opacity-60`}
          >
            <option value="">
              {loadingMembers
                ? intl.formatMessage({
                    id: "USER.ADVANCE_PAYMENT.FORM.LOADING",
                    defaultMessage: "Loading...",
                  })
                : intl.formatMessage({
                    id: "USER.ADVANCE_PAYMENT.FORM.SELECT_MEMBER_PLACEHOLDER",
                    defaultMessage: "Select member",
                  })}
            </option>
            {memberList.map((m) => {
              const id = m.id ?? m.userId;
              const name = [m.firstName, m.lastName].filter(Boolean).join(" ").trim()
                || m.userName || m.name || `Member #${id}`;
              return (
                <option key={id} value={id}>{name}</option>
              );
            })}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Bank / Cash Account */}
      {/* {paymentMode && (
        <div className="flex flex-col gap-1.5">
          {paymentMode === "Cash" ? (
            <>
              <label className={labelCls}>Cash Account <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  value={cashId}
                  onChange={(e) => setCashAccountId(e.target.value)}
                  className={`${inputCls} pr-9 appearance-none bg-white`}
                  disabled={loadingCash}
                >
                  <option value="">
                    {loadingCash ? "Loading..." : "Select Cash Account"}
                  </option>
                  {cashList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.accountName ?? c.name ?? `Cash #${c.id}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </>
          ) : (
            <>
              <label className={labelCls}>Bank <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  value={depositTo}
                  onChange={(e) => setDepositTo(e.target.value)}
                  className={`${inputCls} pr-9 appearance-none bg-white`}
                  disabled={loadingBank}
                >
                  <option value="">
                    {loadingBank ? "Loading..." : "Select Bank"}
                  </option>
                  {bankList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bankName} ({b.accountNo?.slice(-4)})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </>
          )}
        </div>
      )} */}

      {/* Reference ID + Remarks */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            <FormattedMessage id="USER.ADVANCE_PAYMENT.FORM.TRANSACTION_ID_LABEL" defaultMessage="Transcation ID" />
          </label>
          <input
            type="text"
            className={inputCls}
            placeholder={intl.formatMessage({
              id: "USER.ADVANCE_PAYMENT.FORM.TRAN_ID_PLACEHOLDER",
              defaultMessage: "Tran ID",
            })}
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelCls}>
            <FormattedMessage id="USER.ADVANCE_PAYMENT.FORM.REMARKS_LABEL" defaultMessage="Remarks" />
          </label>
          <input
            type="text"
            className={inputCls}
            placeholder={intl.formatMessage({
              id: "USER.ADVANCE_PAYMENT.FORM.REMARKS_PLACEHOLDER",
              defaultMessage: "Remarks",
            })}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-1">
        <button type="button" className="btn btn-light text-sm" onClick={onCancel}>
          <FormattedMessage id="USER.ADVANCE_PAYMENT.FORM.CANCEL_BTN" defaultMessage="Cancel" />
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={handleSave}
          className="btn btn-primary text-sm flex items-center gap-2 disabled:opacity-50"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {editingPayment ? (
            <FormattedMessage id="USER.ADVANCE_PAYMENT.FORM.UPDATE_BTN" defaultMessage="Update" />
          ) : (
            <FormattedMessage id="USER.ADVANCE_PAYMENT.FORM.SAVE_BTN" defaultMessage="Save" />
          )}
        </button>
      </div>
    </div>
  );
};

export default AddAdvancePaymentForm;