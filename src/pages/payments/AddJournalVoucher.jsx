import {
  ArrowLeft,
  Plus,
  Save,
  FileText,
  Hash,
  Calendar,
  AlignLeft,
  Trash2,
  BookOpen,
  Check,
  CheckCircle2,
} from "lucide-react";
import { Select } from "antd";
import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import {
  GetAllCustomer,
  Addupadtejournalvoucher,
} from "../../services/apiServices";

const CREDIT_DEBIT_OPTIONS = [
  { label: "CR", value: "CR" },
  { label: "DR", value: "DR" },
];

const AddJournalVoucher = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");

  const editData = location.state?.editData || null;
  const isEdit = !!editData;

  const TODAY = new Date();

  const [form, setForm] = useState({
    voucherno: "",
    date: TODAY,
    narration: "",
  });

  const [rows, setRows] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [saving, setSaving] = useState(false);

  const [newAccountId, setNewAccountId] = useState(undefined);
  const [newAccountName, setNewAccountName] = useState("");
  const accountInputRef = useRef(null);

  useEffect(() => {
    setLoadingAccounts(true);
    GetAllCustomer(userId)
      .then((res) => {
        const data = res?.data?.data?.["Party Details"] || [];
        setAccounts(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Failed to fetch accounts:", err))
      .finally(() => setLoadingAccounts(false));
  }, []);

  // ── Populate form when editing ───────────────────────────────────────────
  useEffect(() => {
    if (!editData) return;

    const [day, month, year] = editData.voucherdate.split("/");

    setForm({
      voucherno: editData.voucherNo || "",
      date: new Date(year, month - 1, day),
      narration: editData.narration || "",
    });

    setRows(
      (editData.details || []).map((d) => ({
        accountId: d.partyId,
        accountName: d.partyName,
        amount: d.amount,
        creditDebit: d.creditDebit,
        particular: d.particular || "",
      })),
    );
  }, [editData]);

  // ── Add row from outside account input ───────────────────────────────────
  const handleAddRow = useCallback(() => {
    if (!newAccountId && !newAccountName.trim()) {
      accountInputRef.current?.focus();
      return;
    }
    setRows((prev) => [
      ...prev,
      {
        accountId: newAccountId || "",
        accountName: newAccountName || "",
        amount: "",
        creditDebit: "CR",
        particular: "",
      },
    ]);
    // reset outside input
    setNewAccountId(undefined);
    setNewAccountName("");
    // refocus for quick multi-entry
    setTimeout(() => accountInputRef.current?.focus(), 50);
  }, [newAccountId, newAccountName]);

  const handleAccountKeyDown = (e) => {
    if (e.key === "Enter") handleAddRow();
  };

  // ── Row helpers ──────────────────────────────────────────────────────────
  const updateRow = useCallback((index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  }, []);

  const deleteRow = useCallback((index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Totals ───────────────────────────────────────────────────────────────
  const totalCR = rows
    .filter((r) => r.creditDebit === "CR")
    .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  const totalDR = rows
    .filter((r) => r.creditDebit === "DR")
    .reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);

  const isBalanced = rows.length > 0 && Math.abs(totalCR - totalDR) < 0.01;

  // ── Save ─────────────────────────────────────────────────────────────────
  const formatDateForApi = (date) => {
    if (!date) return "";
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${d}/${m}/${date.getFullYear()}`;
  };

  const handleSave = async () => {
    if (rows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Please add at least one voucher entry.",
      });
      return;
    }

    const incomplete = rows.some(
      (r) => !r.accountId || !r.amount || parseFloat(r.amount) <= 0,
    );

    if (incomplete) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Please fill Account Name and Amount for all rows.",
      });
      return;
    }

    try {
      setSaving(true);

      const payload = {
        id: isEdit ? Number(editData.id) : 0,
        userId: Number(userId),
        narration: form.narration,
        voucherDate: formatDateForApi(form.date),
        details: rows.map((r) => ({
          partyId: Number(r.accountId),
          amount: Number(r.amount),
          creditDebit: r.creditDebit,
          particular: r.particular || "",
        })),
      };

      const response = await Addupadtejournalvoucher(payload);

      if (response?.data?.success === false) {
        Swal.fire({
          icon: "error",
          title: "Validation Error",
          text: response?.data?.msg || "Voucher is not balanced.",
        });
        return;
      }

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: isEdit
          ? "Journal Voucher updated successfully."
          : "Journal Voucher saved successfully.",
        confirmButtonColor: "#16a34a",
      });

      navigate("/journal-voucher");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.msg ||
          error?.message ||
          "Failed to save Journal Voucher.",
      });
    } finally {
      setSaving(false);
    }
  };

  const usedAccountIds = rows.map((r) => r.accountId);

  const fieldClass =
    "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";
  const labelClass =
    "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6 font-sans">
      <div className="mx-auto space-y-5">
        {/* ── Voucher Information Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-teal-600">
                <FileText size={17} className="text-white" />
              </div>
              <h2 className="text-teal-900 font-bold text-base tracking-tight">
                {isEdit ? "Edit Journal Voucher" : "Voucher Information"}
              </h2>
            </div>
            <button
              onClick={() => navigate("/journal-voucher")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors shadow-sm"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
            <div className="col-span-1">
              <label className={labelClass}>
                <Hash size={14} /> Voucher No.
              </label>
              <input
                value={form.voucherno}
                disabled
                placeholder="Auto-generated"
                className={`${fieldClass} bg-slate-50 text-slate-400 cursor-not-allowed`}
              />
            </div>
            <div className="col-span-1">
              <label className={labelClass}>
                <Calendar size={14} /> Date
              </label>
              <DatePicker
                selected={form.date}
                onChange={(date) => setForm((p) => ({ ...p, date }))}
                dateFormat="dd/MM/yyyy"
                className={fieldClass}
                wrapperClassName="w-full"
                autoComplete="off"
              />
            </div>
            <div className="col-span-2">
              <label className={labelClass}>
                <AlignLeft size={14} /> Narration
              </label>
              <input
                value={form.narration}
                onChange={(e) =>
                  setForm((p) => ({ ...p, narration: e.target.value }))
                }
                placeholder="Optional narration…"
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        {/* ── Voucher Details Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Card Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-blue-600">
                <BookOpen size={17} className="text-white" />
              </div>
              <h2 className="text-blue-900 font-bold text-base tracking-tight">
                Voucher Details
              </h2>
              {rows.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {rows.length} {rows.length !== 1 ? "entries" : "entry"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {rows.length > 0 && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${isBalanced ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${isBalanced ? "bg-green-500" : "bg-amber-400"}`}
                  />
                  {isBalanced
                    ? "Balanced"
                    : `Diff: ${Math.abs(totalCR - totalDR).toFixed(2)}`}
                </div>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 shadow-sm bg-green-700 disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? "Saving…" : isEdit ? "Update" : "Save"}
              </button>
            </div>
          </div>

          {/* ── Account Name input bar (OUTSIDE table) ── */}
          <div className="flex items-end gap-3 px-6 py-3 bg-slate-50 border-b border-slate-100">
            <div className="flex-1 max-w-xs">
              <label className={labelClass}>
                <BookOpen size={13} /> Account Name
              </label>
              <Select
                ref={accountInputRef}
                showSearch
                allowClear
                placeholder="Search and select account…"
                loading={loadingAccounts}
                style={{ width: "100%" }}
                value={newAccountId}
                onChange={(val, option) => {
                  setNewAccountId(val);
                  setNewAccountName(option?.label || "");
                }}
                onSelect={(val, option) => {
                  // Auto-add row immediately on selection
                  setRows((prev) => [
                    ...prev,
                    {
                      accountId: val,
                      accountName: option?.label || "",
                      amount: "",
                      creditDebit: "CR",
                      particular: "",
                    },
                  ]);
                  // Reset and refocus for next quick entry
                  setNewAccountId(undefined);
                  setNewAccountName("");
                  setTimeout(() => accountInputRef.current?.focus(), 50);
                }}
                onKeyDown={handleAccountKeyDown}
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
                options={accounts
                  .filter((a) => !usedAccountIds.includes(a.id))
                  .map((a) => ({
                    value: a.id,
                    label: a.nameEnglish || "-",
                  }))}
              />
            </div>
            <button
              onClick={handleAddRow}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus size={15} /> Add Row
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    "#",
                    "Account Name *",
                    "Amount *",
                    "Credit / Debit",
                    "Particular",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-14 text-center text-slate-400 text-sm"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <BookOpen size={36} className="text-slate-200" />
                        <p className="font-medium text-slate-400">
                          No entries yet
                        </p>
                        <p className="text-xs text-slate-300">
                          Select an account above and click "Add Row"
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors group"
                    >
                      {/* # */}
                      <td className="px-4 py-2 text-xs text-slate-400 font-medium w-8">
                        {i + 1}
                      </td>

                      <td className="px-2 py-2 w-74">
                        <span className="font-semibold text-slate-800 text-sm px-1">
                          {row.accountName || "—"}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-2 py-2 w-32">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={row.amount}
                          onChange={(e) => {
                            if (/^\d*\.?\d*$/.test(e.target.value))
                              updateRow(i, "amount", e.target.value);
                          }}
                          placeholder="0.00"
                          className={`w-full px-3 py-1.5 text-sm border rounded-xl text-right transition-all focus:outline-none focus:ring-1
                            ${
                              !row.amount || parseFloat(row.amount) <= 0
                                ? "border-blue-300 bg-blue-50 text-blue-700 placeholder-blue-400 focus:border-blue-400 focus:ring-blue-200"
                                : "border-slate-200 bg-white text-slate-800 focus:border-blue-400 focus:ring-blue-200"
                            }`}
                        />
                      </td>

                      {/* Credit / Debit */}
                      <td className="px-2 py-2 w-36">
                        <Select
                          style={{ width: "100%" }}
                          value={row.creditDebit}
                          onChange={(val) => updateRow(i, "creditDebit", val)}
                          options={CREDIT_DEBIT_OPTIONS}
                        />
                      </td>

                      {/* Particular */}
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          value={row.particular}
                          onChange={(e) =>
                            updateRow(i, "particular", e.target.value)
                          }
                          placeholder="Particular…"
                          className="w-full px-3 py-1.5 text-sm border border-slate-200 bg-white rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:border-blue-400 focus:ring-blue-200 transition-all"
                        />
                      </td>

                      {/* Delete */}
                      <td className="px-4 py-2 w-12">
                        <button
                          onClick={() => deleteRow(i)}
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={13} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* Totals footer */}
              {rows.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-200">
                    <td
                      colSpan={2}
                      className="px-4 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider text-right"
                    >
                      Totals
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-green-700 text-right block">
                          CR: {totalCR.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-blue-700 text-right block">
                          DR: {totalDR.toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td colSpan={3} className="px-4 py-2">
                      {!isBalanced ? (
                        <span className="text-xs text-amber-600 font-semibold">
                          ⚠ Difference: {Math.abs(totalCR - totalDR).toFixed(2)}
                        </span>
                      ) : (
                        <span className="flex gap-1 text-xs text-green-600 font-semibold">
                          <CheckCircle2 size={16} /> Entry is balanced
                        </span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddJournalVoucher;
