import { useState, useEffect } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { Tooltip } from "antd";
import { TableComponent } from "@/components/table/TableComponent";
import Swal from "sweetalert2";
import {
  CashAccountGetAll,
  GetbankdetailsbyuserId,
  // Trip APIs
  updatepayoutforTrip,
  getAllTripPayoutHistoryByExpenseId,
  getTripPayoutByPayoutId,
  deleteTripPayout,
  // Office/Employee/Serve/Other APIs
  updatepayoutforoffice,
  getAllOfficePayoutHistoryByExpenseId,
  getOfficePayoutByPayoutId,
  deleteOfficePayout,
} from "@/services/apiServices";

// ── Constants ─────────────────────────────────────────────────────────────────

const TRIP_TYPE = "trip";
const SIMPLE_TYPES = ["employees", "office", "serve", "other"];

const STATUS_STYLES = {
  pending: { bg: "#FAEEDA", color: "#BA7517" },
  confirm: { bg: "#EAF3DE", color: "#3B6D11" },
  advanced: { bg: "#E6F1FB", color: "#185FA5" },
};

const PAYMENT_MODES = ["CASH", "UPI", "CHEQUE", "BANK_TRANSFER"];
const BANK_MODES = ["UPI", "CHEQUE", "BANK_TRANSFER"];

const todayISO = () => new Date().toISOString().split("T")[0];
const inputToDMY = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};
const toInputDate = (raw) => {
  if (!raw) return todayISO();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split("/");
    return `${y}-${m}-${d}`;
  }
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : todayISO();
};

const EMPTY_FORM = {
  date: todayISO(),
  mode: "CASH",
  accountId: "",
  reference: "",
  description: "",
  amount: "",
};

// ── API resolver ──────────────────────────────────────────────────────────────
// Returns the correct set of API functions based on expense type.
const getApis = (expenseType) => {
  const isTrip = expenseType === TRIP_TYPE;
  return {
    savePayout: isTrip ? updatepayoutforTrip : updatepayoutforoffice,
    getHistory: isTrip
      ? getAllTripPayoutHistoryByExpenseId
      : getAllOfficePayoutHistoryByExpenseId,
    getPayoutById: isTrip ? getTripPayoutByPayoutId : getOfficePayoutByPayoutId,
    deletePayout: isTrip ? deleteTripPayout : deleteOfficePayout,
    isTrip,
  };
};

// ── Table columns ─────────────────────────────────────────────────────────────
const getPaymentColumns = (onEdit, onDelete) => [
  {
    accessorKey: "srNo",
    header: "Sr No",
    cell: ({ row }) => <span className="text-gray-700">{row.index + 1}</span>,
  },
  {
    accessorKey: "paymentDate",
    header: "Date",
    cell: ({ getValue }) => (
      <span className="text-gray-700 whitespace-nowrap">{getValue()}</span>
    ),
  },
  {
    accessorKey: "dueAmount",
    header: "Due Amount",
    cell: ({ getValue }) => {
      const val = Number(getValue());
      return (
        <span
          className="font-semibold"
          style={{ color: val > 0 ? "#E24B4A" : "#1D9E75" }}
        >
          ₹ {val.toFixed(2)}
        </span>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Paid Amount",
    cell: ({ getValue }) => (
      <span className="text-emerald-600 font-semibold">
        ₹ {Number(getValue() ?? 0).toFixed(2)}
      </span>
    ),
  },
  {
    accessorKey: "paymentMode",
    header: "Mode",
    cell: ({ getValue }) => (
      <span className="text-xs font-semibold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700">
        {getValue()?.replace("_", " ") ?? "-"}
      </span>
    ),
  },
  {
    accessorKey: "cashType",
    header: "Account",
    cell: ({ row }) => {
      const { cashType, bankAccount } = row.original;
      if (cashType) {
        return (
          <span className="text-gray-700">
            {cashType.accountName ?? cashType.name ?? `Cash #${cashType.id}`}
          </span>
        );
      }
      if (bankAccount) {
        const last4 = String(bankAccount.accountNumber ?? "").slice(-4);
        return (
          <span className="text-gray-700">
            {bankAccount.bankName ?? "Bank"}
            {last4 ? ` ****${last4}` : ""}
          </span>
        );
      }
      return <span className="text-gray-400">-</span>;
    },
  },
  {
    accessorKey: "transactionId",
    header: "Reference",
    cell: ({ row }) => {
      const ref = row.original.transactionId || row.original.chequeNo;
      return <span className="text-black">{ref || "-"}</span>;
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ getValue }) => (
      <span className="text-gray-500 text-xs">{getValue() || "-"}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const status = getValue();
      const st = STATUS_STYLES[status] || STATUS_STYLES.pending;
      return (
        <span
          className="px-2.5 py-1 rounded-md text-[11px] font-semibold capitalize"
          style={{ background: st.bg, color: st.color }}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Tooltip title="Edit">
          <button
            className="btn btn-sm btn-icon btn-clear"
            onClick={() => onEdit(row.original)}
          >
            <i className="ki-filled ki-notepad-edit text-primary" />
          </button>
        </Tooltip>
        <Tooltip title="Delete">
          <button
            className="btn btn-sm btn-icon btn-clear"
            onClick={() => onDelete(row.original)}
          >
            <i className="ki-filled ki-trash text-danger" />
          </button>
        </Tooltip>
      </div>
    ),
  },
];

// ── Component ─────────────────────────────────────────────────────────────────
const RecordExpensepayoutModal = ({
  open,
  onClose,
  customerName = "",
  invoiceRef = "",
  receivable = 0,
  onSave,
  expenseId,
  expenseType = "trip", // ← NEW: "trip" | "employees" | "office" | "serve" | "other"
}) => {
  const userId = Number(localStorage.getItem("mainId"));

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingPayoutId, setEditingPayoutId] = useState(null);
  const [cashAccounts, setCashAccounts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Resolve APIs whenever expenseType changes
  const apis = getApis(expenseType);

  // ── Fetch helpers ─────────────────────────────────────────────────────────
  const fetchHistory = async () => {
    if (!expenseId) return;
    setHistoryLoading(true);
    try {
      const res = await apis.getHistory(expenseId);
      const list = res?.data?.data ?? res?.data ?? [];
      setHistory(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch payout history:", err);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchAccounts = async () => {
    setAccountsLoading(true);
    try {
      const [cashRes, bankRes] = await Promise.all([
        CashAccountGetAll(userId),
        GetbankdetailsbyuserId(userId),
      ]);
      const cashList = cashRes?.data?.data ?? cashRes?.data ?? [];
      const bankList = bankRes?.data?.data ?? bankRes?.data ?? [];
      setCashAccounts(Array.isArray(cashList) ? cashList : [cashList]);
      setBankAccounts(Array.isArray(bankList) ? bankList : [bankList]);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
      setCashAccounts([]);
      setBankAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setForm({ ...EMPTY_FORM, date: todayISO() });
    setEditingPayoutId(null);
    fetchAccounts();
    fetchHistory();
  }, [open, expenseId, expenseType]); // re-run if expenseType changes too

  // ── Form handlers ─────────────────────────────────────────────────────────
  const handleChange = (field) => (e) =>
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
      ...(field === "mode" ? { accountId: "" } : {}),
    }));

  const handleEdit = async (row) => {
    try {
      const res = await apis.getPayoutById(row.id);
      const d = res?.data?.data ?? res?.data ?? {};

      const isCash = (d.paymentMode ?? row.paymentMode) === "CASH";
      const accountId = isCash
        ? String(d.cashType?.id ?? row.cashType?.id ?? "")
        : String(d.bankAccount?.id ?? row.bankAccount?.id ?? "");

      setForm({
        date: toInputDate(d.paymentDate ?? row.paymentDate),
        mode: d.paymentMode ?? row.paymentMode ?? "CASH",
        accountId,
        reference: d.transactionId ?? d.chequeNo ?? "",
        description: d.description ?? "",
        amount: String(d.payoutAmount ?? d.amount ?? ""),
      });
      setEditingPayoutId(row.id);
    } catch (err) {
      console.error("Failed to load payout for edit:", err);
      Swal.fire({
        title: "Failed!",
        text: "Could not load payout.",
        icon: "error",
      });
    }
  };

  const handleDelete = async (row) => {
    const { isConfirmed } = await Swal.fire({
      title: "Delete payout?",
      text: "This payout record will be permanently removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1d4ed8",
      cancelButtonColor: "#e5e7eb",
      confirmButtonText: "Yes, delete",
      customClass: {
        popup: "!rounded-2xl",
        confirmButton: "!rounded-xl",
        cancelButton: "!rounded-xl",
      },
    });
    if (!isConfirmed) return;
    try {
      await apis.deletePayout(row.payoutId ?? row.id);
      Swal.fire({
        title: "Deleted!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      fetchHistory();
    } catch (err) {
      console.error("Delete failed:", err);
      Swal.fire({
        title: "Failed!",
        text: "Could not delete payout.",
        icon: "error",
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const isCash = form.mode === "CASH";
      const payoutAmount = Number(form.amount);
      const newDueAmount = remaining - payoutAmount;

      const basePayload = {
        accountType: isCash ? "CASH" : "BANK",
        bankAccountId: isCash ? null : Number(form.accountId),
        cashAccountId: isCash ? Number(form.accountId) : null,
        paymentMode: form.mode,
        chequeNo: form.mode === "CHEQUE" ? form.reference : "",
        transactionId: ["UPI", "BANK_TRANSFER"].includes(form.mode)
          ? form.reference
          : "",
        description: form.description || "",
        paymentDate: inputToDMY(form.date),
        dueAmount: newDueAmount,
        payoutId: editingPayoutId ?? -1,
      };

      // Trip uses `payoutAmount` + `expenseId`
      // Office/Employee/Serve/Other uses `amount` + `officeExpenseId`
      const payload = apis.isTrip
        ? { ...basePayload, payoutAmount, expenseId }
        : { ...basePayload, amount: payoutAmount, officeExpenseId: expenseId };

      const res = await apis.savePayout(payload);
      const responseData = res?.data;

      if (responseData?.success === false) {
        Swal.fire({
          title: "Could not save!",
          text: responseData.msg ?? "Something went wrong.",
          icon: "error",
          confirmButtonColor: "#1d4ed8",
          customClass: { popup: "!rounded-2xl", confirmButton: "!rounded-xl" },
        });
        return;
      }

      Swal.fire({
        title: responseData?.msg ?? "Saved!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      setForm({ ...EMPTY_FORM, date: todayISO() });
      setEditingPayoutId(null);
      fetchHistory();
      onSave?.();
    } catch (err) {
      console.error("Save failed:", err);
      const errMsg = err?.response?.data?.msg ?? "Could not save payout.";
      Swal.fire({
        title: "Failed!",
        text: errMsg,
        icon: "error",
        confirmButtonColor: "#1d4ed8",
        customClass: { popup: "!rounded-2xl", confirmButton: "!rounded-xl" },
      });
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setForm({ ...EMPTY_FORM, date: todayISO() });
    setEditingPayoutId(null);
  };

  // ── Derived ───────────────────────────────────────────────────────────────
  const isCashMode = form.mode === "CASH";
  const isBankMode = BANK_MODES.includes(form.mode);
  const activeAccountList = isCashMode
    ? cashAccounts
    : isBankMode
      ? bankAccounts
      : [];
  const totalPaid = history.reduce(
    (s, r) => s + Number(r.payoutAmount ?? 0),
    0,
  );
  const remaining = receivable - totalPaid;

  const initials = customerName
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const renderAccountOption = (account) => {
    if (isCashMode) {
      return (
        <option key={account.id} value={account.id}>
          {account.accountName ?? account.name ?? `Cash #${account.id}`}
        </option>
      );
    }
    const last4 = String(account.accountNumber ?? "").slice(-4);
    const label = account.bankName
      ? `${account.bankName}${last4 ? ` - ****${last4}` : ""}`
      : (account.accountName ?? `Account #${account.id}`);
    return (
      <option key={account.id} value={account.id}>
        {label}
        {account.isPrimary ? " (Primary)" : ""}
      </option>
    );
  };

  const paymentColumns = getPaymentColumns(handleEdit, handleDelete);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title="Record Expense Payout"
      width={860}
      footer={null}
    >
      <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-1">
        {/* ── Customer info bar ── */}
        <div className="flex items-center justify-between border border-gray-200 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-800">
                {customerName}
              </p>
              <p className="text-xs text-black">Ref: {invoiceRef}</p>
            </div>
          </div>
          <div className="text-right text-sm space-y-0.5">
            <p className="text-black font-medium">
              Payable:{" "}
              <span
                className={
                  remaining - (Number(form.amount) || 0) > 0
                    ? "text-red-500 font-bold"
                    : remaining - (Number(form.amount) || 0) === 0
                      ? "text-emerald-600 font-bold"
                      : "text-orange-500 font-bold"
                }
              >
                ₹ {(remaining - (Number(form.amount) || 0)).toFixed(2)}
              </span>
            </p>
          </div>
        </div>

        {/* ── Payment form ── */}
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">
              {editingPayoutId ? "Edit Payment" : "New Payment"}
            </p>
            {editingPayoutId && (
              <button
                onClick={cancelEdit}
                className="text-xs text-gray-400 hover:text-gray-600 underline"
              >
                Cancel edit
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            {/* Date */}
            <div>
              <label className="text-xs text-black block mb-1">
                Payment Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={handleChange("date")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Mode */}
            <div>
              <label className="text-xs text-black block mb-1">
                Payment Mode
              </label>
              <select
                value={form.mode}
                onChange={handleChange("mode")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100"
              >
                {PAYMENT_MODES.map((m) => (
                  <option key={m} value={m}>
                    {m.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Account */}
            <div>
              <label className="text-xs text-black block mb-1">
                {isCashMode ? "Cash Account" : "Bank Account"}
              </label>
              {accountsLoading ? (
                <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50">
                  Loading accounts…
                </div>
              ) : (
                <select
                  value={form.accountId}
                  onChange={handleChange("accountId")}
                  disabled={activeAccountList.length === 0}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  <option value="">
                    {activeAccountList.length === 0
                      ? "No accounts found"
                      : `Select ${isCashMode ? "cash" : "bank"} account`}
                  </option>
                  {activeAccountList.map(renderAccountOption)}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 items-end">
            {/* Reference */}
            <div>
              <label className="text-xs text-black block mb-1">
                Reference #
              </label>
              <input
                type="text"
                placeholder="Enter transaction reference ID"
                value={form.reference}
                onChange={handleChange("reference")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-xs text-black block mb-1">
                Description
              </label>
              <input
                type="text"
                value={form.description}
                onChange={handleChange("description")}
                placeholder="Enter description"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-xs text-black block mb-1">
                Pay Amount
              </label>
              <input
                type="tel"
                placeholder="₹ 0.00"
                value={form.amount}
                onChange={handleChange("amount")}
                min={0}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="flex justify-end mt-3">
            <button
              onClick={handleSave}
              disabled={saving || !form.amount || !form.accountId}
              className="bg-primary hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2 rounded-xl transition-all"
            >
              {saving ? "Saving…" : editingPayoutId ? "Update" : "Save"}
            </button>
          </div>
        </div>

        {/* ── Payment history table ── */}
        <div className="border border-gray-200 rounded-xl overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
            <span className="text-sm font-semibold text-gray-800">
              Payments made ({history.length})
            </span>
            {historyLoading && (
              <span className="text-xs text-gray-400">Loading…</span>
            )}
          </div>
          <div
            style={{ maxHeight: "260px", overflowY: "auto", overflowX: "auto" }}
          >
            <TableComponent
              columns={paymentColumns}
              data={history}
              hidePagination
              defaultSorting={[{ id: "paymentDate", desc: true }]}
            />
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default RecordExpensepayoutModal;
