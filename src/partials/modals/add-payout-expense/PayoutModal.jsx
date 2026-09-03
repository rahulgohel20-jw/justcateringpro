import { useState, useEffect, useRef } from "react";
import { Tooltip } from "antd";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import {
  GetbankdetailsbyuserId,
  CashAccountGetAll,
} from "@/services/apiServices";

const PAYMENT_MODES = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "bank", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
];

// Modes that require a bank account selection
const NEEDS_BANK = ["cash", "upi", "bank", "cheque"];
const isSuperAdmin = () => Number(localStorage.getItem("mainId")) === 1;

// ── Small chevron icon ────────────────────────────────────────────────────────
const ChevronDown = ({ open }) => (
  <svg
    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

// ── Payment Mode Dropdown ─────────────────────────────────────────────────────
const PaymentModeDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = PAYMENT_MODES.find((m) => m.value === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-blue-300 transition text-left"
      >
        <span className="flex items-center gap-2">
          {selected ? (
            <>
              <span className="text-base">{selected.icon}</span>
              <span className="text-sm font-medium text-gray-800">
                {selected.label}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400">Select payment mode</span>
          )}
        </span>
        <ChevronDown open={open} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
          {PAYMENT_MODES.map((mode) => {
            const isSelected = value === mode.value;
            return (
              <button
                key={mode.value}
                type="button"
                onClick={() => {
                  onChange(mode.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition
                  ${
                    isSelected
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
              >
                <span className="text-base">{mode.icon}</span>
                <span className="text-sm font-medium">{mode.label}</span>
                {isSelected && (
                  <i className="ki-filled ki-check-circle text-blue-500 text-sm ml-auto" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Bank Account Dropdown ─────────────────────────────────────────────────────
const BankAccountDropdown = ({ value, onChange, bankList, loading }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = bankList.find((b) => String(b.id) === String(value));

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-400">
        <svg
          className="w-3.5 h-3.5 animate-spin text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        Loading bank accounts…
      </div>
    );
  }

  if (bankList.length === 0) {
    return (
      <div className="px-3 py-2.5 rounded-xl border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400 text-center">
        No saved bank accounts found
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:border-blue-300 transition text-left"
      >
        {selected ? (
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-800">
              {selected.bankName}
              {selected.isPrimary && (
                <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">
                  Primary
                </span>
              )}
            </span>
            <span className="text-xs text-black mt-0.5">
              {selected.accountHolderName} · ····{selected.accountNo?.slice(-4)}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Select bank account</span>
        )}
        <ChevronDown open={open} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
          {bankList.map((b) => {
            const isSelected = String(value) === String(b.id);
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  onChange(String(b.id));
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-3 text-left transition border-b border-gray-50 last:border-0
                  ${isSelected ? "bg-blue-50" : "hover:bg-gray-50"}`}
              >
                <div>
                  <p
                    className={`text-sm font-semibold ${isSelected ? "text-blue-700" : "text-gray-800"}`}
                  >
                    {b.bankName}
                    {b.isPrimary && (
                      <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">
                        Primary
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-black mt-0.5">
                    {b.accountHolderName} · ····{b.accountNo?.slice(-4)}
                    {b.ifscCode && ` · ${b.ifscCode}`}
                  </p>
                  {b.upiId && (
                    <p className="text-xs text-gray-400">UPI: {b.upiId}</p>
                  )}
                </div>
                {isSelected && (
                  <i className="ki-filled ki-check-circle text-blue-500 text-base ml-2 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── Main PayoutModal ──────────────────────────────────────────────────────────
const PayoutModal = ({
  rowAmount = 0,
  paidAmount = 0,
  currentStatus = "",
  description = "",
  userId,
  onPayout,
}) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("menu");
  const [amount, setAmount] = useState("");
  const [payMode, setPayMode] = useState(""); // selected payment mode value
  const [bankId, setBankId] = useState(""); // selected bank id (string)
  const [desc, setDesc] = useState("");

  const [bankList, setBankList] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);

  useEffect(() => {
    if (!open || !userId || !payMode) return;

    setLoadingBanks(true);

    const apiCall =
      payMode === "cash"
        ? CashAccountGetAll(userId) // ✅ cash accounts
        : GetbankdetailsbyuserId(userId); // ✅ bank accounts
    apiCall
      .then((res) => {
        if (res?.data?.success) {
          const list = res.data.data || [];

          // ✅ normalize cash accounts
          const normalized =
            payMode === "cash"
              ? list.map((c) => ({
                  id: c.id,
                  bankName: c.accountName, // show name
                  accountHolderName: "Cash Account",
                  accountNo: String(c.id), // fallback
                  isPrimary: c.isPrimary,
                  isCash: true,
                }))
              : list;

          setBankList(normalized);
        } else {
          setBankList([]);
        }
      })
      .catch(() => setBankList([]))
      .finally(() => setLoadingBanks(false));
  }, [open, userId, payMode]);

  const isAlreadyPaid = currentStatus === "Paid" || paidAmount >= rowAmount;
  const remaining = Math.max(0, rowAmount - paidAmount);
  const needsBank = NEEDS_BANK.includes(payMode);

  // Confirm is disabled if:
  // - no amount, or
  // - no payment mode, or
  // - mode needs a bank but none selected
  const isConfirmDisabled =
    !amount ||
    isNaN(parseFloat(amount)) ||
    parseFloat(amount) <= 0 ||
    !payMode ||
    (needsBank && !bankId);

  const handleOpen = () => {
    setView("menu");
    setAmount("");
    setPayMode("");
    setBankId("");
    setDesc("");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setView("menu");
    setAmount("");
    setPayMode("");
    setBankId("");
    setDesc("");
  };

  const handleSelect = (status) => {
    if (status === "Unpaid") {
      onPayout?.(status, 0, "", "");
      handleClose();
      return;
    }
    if (status === "Paid") {
      if (isAlreadyPaid) {
        setView("already-paid");
        return;
      }
      setAmount(rowAmount?.toString() || "");
      setView("paid-input");
    } else {
      if (isAlreadyPaid) return;
      setAmount("");
      setView("pending-input");
    }
  };

  const handleConfirm = () => {
    const amt = parseFloat(amount);
    if (!amount || isNaN(amt) || amt <= 0) return;

    const payoutType = view === "paid-input" ? "Paid" : "Pending";

    // Build a readable label for what was selected
    let paymentLabel = "";
    if (payMode === "cash") {
      paymentLabel = "Cash";
    } else if (needsBank && bankId) {
      const b = bankList.find((b) => String(b.id) === bankId);
      paymentLabel = b
        ? `${b.bankName} (****${b.accountNo?.slice(-4)})`
        : bankId;
    } else {
      paymentLabel =
        PAYMENT_MODES.find((m) => m.value === payMode)?.label || payMode;
    }

    onPayout?.(payoutType, amt, bankId || payMode, desc, payMode, paymentLabel);
    handleClose();
  };

  // ── Payment Selector section (used inside amount modals) ──────────────────
  const PaymentSelector = () => (
    <div className="flex flex-col gap-3">
      {/* Payment Mode dropdown */}
      <div className="flex flex-col gap-1">
        <label className="form-label">
          Payment Mode <span className="text-red-500">*</span>
        </label>
        <PaymentModeDropdown
          value={payMode}
          onChange={(val) => {
            setPayMode(val);
            setBankId(""); // reset bank when mode changes
          }}
        />
      </div>

      {/* Bank Account dropdown — only for UPI / Bank Transfer / Cheque */}
      {needsBank && (
        <div className="flex flex-col gap-1">
          <label className="form-label">
            Bank Account <span className="text-red-500">*</span>
          </label>
          <BankAccountDropdown
            value={bankId}
            onChange={setBankId}
            bankList={bankList}
            loading={loadingBanks}
          />
        </div>
      )}
    </div>
  );

  // ── Footers ───────────────────────────────────────────────────────────────
  const inputFooter = (
    <div className="flex justify-between items-center">
      <button
        type="button"
        onClick={() => setView("menu")}
        className="btn btn-light"
      >
        ← Back
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isConfirmDisabled}
        className={`btn ${view === "paid-input" ? "btn-success" : "btn-warning"} disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        Save
      </button>
    </div>
  );

  const alreadyPaidFooter = (
    <div className="flex justify-between items-center">
      <button
        type="button"
        onClick={() => setView("menu")}
        className="btn btn-light"
      >
        ← Back
      </button>
      <button type="button" onClick={handleClose} className="btn btn-primary">
        Done
      </button>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      {isSuperAdmin() && (
        <Tooltip title="Update Payout Status">
          <button
            type="button"
            onClick={handleOpen}
            className="btn btn-sm btn-icon btn-clear"
          >
            <i className="ki-filled ki-wallet text-blue-600" />
          </button>
        </Tooltip>
      )}

      {/* ── Menu Modal ── */}
      {open && view === "menu" && (
        <CustomModal
          open={open}
          onClose={handleClose}
          title="Update Payout Status"
          width={520}
          footer={null}
        >
          <div className="flex flex-col gap-2 py-2">
            {description && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-1">
                <p className="text-xs text-blue-400 font-medium mb-0.5">
                  Expense
                </p>
                <p className="text-sm font-semibold text-blue-800">
                  {description}
                </p>
              </div>
            )}

            {/* Paid */}
            <button
              type="button"
              onClick={() => handleSelect("Paid")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">✅</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-emerald-700">Paid</p>
                  <p className="text-xs text-emerald-500 mt-0.5">
                    {isAlreadyPaid
                      ? "Already fully paid"
                      : `Full amount · ₹${rowAmount.toLocaleString()}`}
                  </p>
                </div>
              </div>
              {isAlreadyPaid ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-700">
                  PAID
                </span>
              ) : (
                <i className="ki-filled ki-arrow-right text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>

            {/* Pending */}
            <button
              type="button"
              onClick={() => handleSelect("Pending")}
              disabled={isAlreadyPaid}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition group
                ${
                  isAlreadyPaid
                    ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
                    : "border-orange-200 bg-orange-50 hover:bg-orange-100 cursor-pointer"
                }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">⏳</span>
                <div className="text-left">
                  <p
                    className={`text-sm font-semibold ${isAlreadyPaid ? "text-gray-400" : "text-orange-700"}`}
                  >
                    Pending
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${isAlreadyPaid ? "text-gray-400" : "text-orange-400"}`}
                  >
                    {isAlreadyPaid
                      ? "Not available — already fully paid"
                      : "Enter partial amount"}
                  </p>
                </div>
              </div>
              {isAlreadyPaid ? (
                <i className="ki-filled ki-lock text-gray-300 text-xs" />
              ) : (
                <i className="ki-filled ki-arrow-right text-orange-400 group-hover:translate-x-0.5 transition-transform" />
              )}
            </button>

            {/* Unpaid */}
            <button
              type="button"
              onClick={() => handleSelect("Unpaid")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">❌</span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-red-700">Unpaid</p>
                  <p className="text-xs text-red-400 mt-0.5">Mark as ₹0 paid</p>
                </div>
              </div>
              <i className="ki-filled ki-arrow-right text-red-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </CustomModal>
      )}

      {/* ── Already Paid Modal ── */}
      {open && view === "already-paid" && (
        <CustomModal
          open={open}
          onClose={handleClose}
          title="✅ Payment Status"
          width={420}
          footer={alreadyPaidFooter}
        >
          <div className="flex flex-col gap-3 py-2">
            <div className="flex flex-col items-center justify-center bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-6 gap-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-1">
                <i className="ki-filled ki-check-circle text-emerald-500 text-3xl" />
              </div>
              <p className="text-base font-bold text-emerald-700">
                Already Fully Paid
              </p>
              <p className="text-xs text-emerald-500 text-center">
                This expense has been marked as fully paid. No changes can be
                made to the paid amount.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 mb-0.5">Total Amount</p>
                <p className="text-sm font-bold text-gray-900">
                  ₹{rowAmount.toLocaleString()}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl px-4 py-3">
                <p className="text-xs text-emerald-400 mb-0.5">Amount Paid</p>
                <p className="text-sm font-bold text-emerald-700">
                  ₹{paidAmount.toLocaleString()}
                </p>
              </div>
            </div>
            {description && (
              <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                <p className="text-xs text-blue-400 mb-0.5">Expense</p>
                <p className="text-sm font-semibold text-blue-800">
                  {description}
                </p>
              </div>
            )}
          </div>
        </CustomModal>
      )}

      {/* ── Amount Input Modal ── */}
      {open && (view === "paid-input" || view === "pending-input") && (
        <CustomModal
          open={open}
          onClose={handleClose}
          title={view === "paid-input" ? "✅ Paid Amount" : "⏳ Partial Amount"}
          width={460}
          footer={inputFooter}
        >
          <div className="flex flex-col gap-y-4 py-2">
            {/* Summary row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-gray-50 rounded-xl px-3 py-2.5 text-center">
                <p className="text-[10px] text-gray-400 mb-0.5">Total</p>
                <p className="text-sm font-bold text-gray-900">
                  ₹{rowAmount.toLocaleString()}
                </p>
              </div>
              <div className="bg-emerald-50 rounded-xl px-3 py-2.5 text-center">
                <p className="text-[10px] text-emerald-400 mb-0.5">Paid</p>
                <p className="text-sm font-bold text-emerald-700">
                  ₹{paidAmount.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-50 rounded-xl px-3 py-2.5 text-center">
                <p className="text-[10px] text-red-400 mb-0.5">Remaining</p>
                <p className="text-sm font-bold text-red-600">
                  ₹{remaining.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Amount field */}
            <div className="flex flex-col">
              <label className="form-label">
                {view === "paid-input" ? "Paid Amount" : "Partial Amount"}
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  type="input"
                  min="0"
                  step="any"
                  autoFocus={view === "pending-input"}
                  readOnly={view === "paid-input"}
                  value={amount}
                  onChange={(e) =>
                    view === "pending-input" && setAmount(e.target.value)
                  }
                  onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
                  placeholder="0.00"
                  className={`input pl-7 ${view === "paid-input" ? "bg-gray-100 text-gray-500 cursor-not-allowed select-none" : ""}`}
                />
                {view === "paid-input" && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <i className="ki-filled ki-lock text-gray-400 text-xs" />
                  </span>
                )}
              </div>
              {view === "paid-input" && (
                <p className="text-xs text-gray-400 mt-1">
                  Full amount is fixed for a complete payment.
                </p>
              )}
            </div>

            {/* Payment selector */}
            <PaymentSelector />

            {/* Description */}
            <div className="flex flex-col">
              <label className="form-label">Description</label>
              <textarea
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="input resize-none"
              />
            </div>

            {/* Remaining preview */}
            {view === "pending-input" &&
              amount &&
              !isNaN(parseFloat(amount)) &&
              parseFloat(amount) > 0 && (
                <div className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-2.5">
                  <span className="text-xs text-red-500 font-medium">
                    Remaining after this
                  </span>
                  <span className="text-sm font-bold text-red-600">
                    ₹
                    {Math.max(
                      0,
                      rowAmount - parseFloat(amount),
                    ).toLocaleString()}
                  </span>
                </div>
              )}
          </div>
        </CustomModal>
      )}
    </>
  );
};

export default PayoutModal;
