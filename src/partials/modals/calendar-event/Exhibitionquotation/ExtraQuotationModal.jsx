import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const PAYMENT_MODES = ["Bank Transfer (RTGS/NEFT)", "Cash", "Cheque", "UPI", "Card"];
const MODE_TO_API = {
  "Bank Transfer (RTGS/NEFT)": "BANK_TRANSFER",
  Cash: "CASH",
  Cheque: "CHEQUE",
  UPI: "UPI",
  Card: "CARD",
};
const MODE_FROM_API = Object.fromEntries(Object.entries(MODE_TO_API).map(([label, code]) => [code, label]));

const makeRow = (item = {}) => ({
  id: item.id || Date.now() + Math.random(),
  name: item.particularsName || "",
  qty: item.quantity ?? 1,
  rate: item.rate ?? 0,
});

const makePayment = (payment = {}) => ({
  id: payment.id || Date.now() + Math.random(),
  amount: payment.amount ?? 0,
  mode: MODE_FROM_API[payment.paymentMode] || payment.paymentMode || PAYMENT_MODES[0],
  dateTime: payment.paymentDateTime
    ? (dayjs(payment.paymentDateTime, "DD/MM/YYYY hh:mm A", true).isValid()
      ? dayjs(payment.paymentDateTime, "DD/MM/YYYY hh:mm A", true)
      : dayjs(payment.paymentDateTime)).format("YYYY-MM-DDTHH:mm")
    : "",
  description: payment.paymentDescription || "",
});

const amount = (value) => `₹ ${Number(value || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const backendId = (id) => typeof id === "number" && id > 0 && id < 1_000_000 ? id : null;

export default function ExtraQuotationModal({ open, onClose, group, onSave, sectionLabel }) {
  const [rows, setRows] = useState([]);
  const [payments, setPayments] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [gstPercent, setGstPercent] = useState(0);
  const [tdsPercent, setTdsPercent] = useState(0);

  useEffect(() => {
    if (!open) return;
    const module = group?.modules?.[0];
    setRows((module?.items || []).map(makeRow));
    setPayments((group?.payments || []).map(makePayment));
    setDiscountPercent(group?.discountPercent ?? 0);
    setGstPercent(group?.gstPercent ?? 0);
    setTdsPercent(group?.tdsPercent ?? 0);
  }, [open, group]);

  const subtotal = useMemo(() => rows.reduce((sum, row) => sum + Number(row.qty || 0) * Number(row.rate || 0), 0), [rows]);
  const discount = subtotal * Number(discountPercent || 0) / 100;
  const taxable = subtotal - discount;
  const grandTotal = taxable + taxable * Number(gstPercent || 0) / 100 - taxable * Number(tdsPercent || 0) / 100;
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  if (!open) return null;

  const updateRow = (id, field, value) => setRows((current) => current.map((row) => row.id === id ? { ...row, [field]: value } : row));
  const updatePayment = (id, field, value) => setPayments((current) => current.map((payment) => payment.id === id ? { ...payment, [field]: value } : payment));
  const save = () => {
    onSave({
      id: group?.id || null,
      groupType: "EXTRA",
      discountPercent: Number(discountPercent || 0),
      gstPercent: Number(gstPercent || 0),
      tdsPercent: Number(tdsPercent || 0),
      modules: [{
        id: group?.modules?.[0]?.id || null,
        moduleType: "ESTIMATE",
        displayOrder: 1,
        discountPercent: Number(discountPercent || 0),
        cgstPercent: Number(gstPercent || 0) / 2,
        sgstPercent: Number(gstPercent || 0) / 2,
        igstPercent: 0,
        tdsPercent: Number(tdsPercent || 0),
        roundOff: 0,
        scopeDate: "",
        scopeLabel: sectionLabel || "Extra Quotation",
        items: rows.map((row, index) => ({ id: backendId(row.id), displayOrder: index + 1, particularsName: row.name, quantity: Number(row.qty || 0), rate: Number(row.rate || 0) })),
      }],
      payments: payments.map((payment) => ({
        id: backendId(payment.id), amount: Number(payment.amount || 0),
        paymentDateTime: payment.dateTime ? dayjs(payment.dateTime).format("DD/MM/YYYY hh:mm A") : "", paymentDescription: payment.description || "",
        paymentMode: MODE_TO_API[payment.mode] || "BANK_TRANSFER",
      })),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="extra-quotation-title" className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-slate-50 shadow-2xl">
        <header className="flex items-start justify-between border-b bg-white px-5 py-4">
          <div>
            <h2 id="extra-quotation-title" className="font-bold text-slate-800">Extra Quotation</h2>
            <p className="mt-1 text-xs text-slate-500">Additional items, charges, and payment details</p>
          </div>
          <button aria-label="Close" onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </header>
        <div className="overflow-y-auto p-4 sm:p-5">
          <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
            <table className="w-full min-w-[680px] text-left text-xs">
              <thead className="bg-slate-50 uppercase text-[10px] tracking-wide text-slate-500"><tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Particulars</th><th className="px-3 py-2">Quantity</th><th className="px-3 py-2">Rate (₹)</th><th className="px-3 py-2">Total (₹)</th><th className="px-3 py-2">Action</th></tr></thead>
              <tbody>{rows.map((row, index) => <tr key={row.id} className="border-t">
                <td className="px-3 py-2 text-slate-400">{index + 1}</td>
                <td className="px-3 py-2"><input aria-label={`Item ${index + 1}`} value={row.name} onChange={(event) => updateRow(row.id, "name", event.target.value)} placeholder="Item name" className="w-full rounded border px-2 py-1.5" /></td>
                <td className="px-3 py-2"><input aria-label="Quantity" type="number" min="0" value={row.qty} onChange={(event) => updateRow(row.id, "qty", event.target.value)} className="w-16 rounded border px-2 py-1.5 text-right" /></td>
                <td className="px-3 py-2"><input aria-label="Rate" type="number" min="0" value={row.rate} onChange={(event) => updateRow(row.id, "rate", event.target.value)} className="w-24 rounded border px-2 py-1.5 text-right" /></td>
                <td className="px-3 py-2 font-semibold">{amount(Number(row.qty || 0) * Number(row.rate || 0))}</td>
                <td className="px-3 py-2"><button aria-label="Delete item" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} className="text-rose-500"><Trash2 size={14} /></button></td>
              </tr>)}</tbody>
              <tfoot><tr className="border-t bg-slate-50 font-semibold"><td colSpan="4" className="px-3 py-2 text-right text-[10px] uppercase text-slate-500">Subtotal</td><td className="px-3 py-2">{amount(subtotal)}</td><td /></tr></tfoot>
            </table>
            <button onClick={() => setRows((current) => [...current, makeRow()])} className="m-3 inline-flex items-center gap-1 rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700"><Plus size={14} /> Add Item</button>
          </div>

          <div className="mt-4 rounded-lg border bg-white p-4">
            <h3 className="text-sm font-bold">Estimate Amount (Extra Quotation) — Grand Total</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[ ["Discount (%)", discountPercent, setDiscountPercent], ["GST (%)", gstPercent, setGstPercent], ["TDS (%)", tdsPercent, setTdsPercent] ].map(([label, value, setter]) => <label key={label} className="text-[11px] text-slate-500">{label}<input type="number" min="0" value={value} onChange={(event) => setter(event.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm text-slate-800" /></label>)}
            </div>
            <div className="mt-3 flex justify-between rounded bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700"><span>Grand Total</span><span>{amount(grandTotal)}</span></div>
          </div>

          <div className="mt-4 rounded-lg border bg-white p-4">
            <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Payment Details</h3><button onClick={() => setPayments((current) => [...current, makePayment()])} className="inline-flex items-center gap-1 rounded bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white"><Plus size={13} /> Add Advance Payment</button></div>
            {payments.length === 0 && <p className="text-xs text-slate-500">No advance payments added.</p>}
            <div className="space-y-3">{payments.map((payment, index) => <div key={payment.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">Advance Payment {index + 1}<button aria-label="Remove payment" onClick={() => setPayments((current) => current.filter((item) => item.id !== payment.id))} className="text-rose-500"><Trash2 size={14} /></button></div>
              <div className="grid gap-3 sm:grid-cols-2"><label className="text-[11px] text-slate-500">Amount (₹)<input type="number" min="0" value={payment.amount} onChange={(event) => updatePayment(payment.id, "amount", event.target.value)} className="mt-1 w-full rounded border bg-white px-3 py-2 text-sm text-slate-800" /></label><label className="text-[11px] text-slate-500">Payment Mode<select value={payment.mode} onChange={(event) => updatePayment(payment.id, "mode", event.target.value)} className="mt-1 w-full rounded border bg-white px-3 py-2 text-sm text-slate-800">{PAYMENT_MODES.map((mode) => <option key={mode}>{mode}</option>)}</select></label><label className="text-[11px] text-slate-500">Payment Date &amp; Time<input type="datetime-local" value={payment.dateTime} onChange={(event) => updatePayment(payment.id, "dateTime", event.target.value)} className="mt-1 w-full rounded border bg-white px-3 py-2 text-sm text-slate-800" /></label><label className="text-[11px] text-slate-500">Payment Description<input value={payment.description} onChange={(event) => updatePayment(payment.id, "description", event.target.value)} placeholder="Ref: ..." className="mt-1 w-full rounded border bg-white px-3 py-2 text-sm text-slate-800" /></label></div>
            </div>)}</div>
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-3"><div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">Total Paid <span className="float-right">{amount(totalPaid)}</span></div><div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700 sm:col-span-2">Remaining Payment Due <span className="float-right">{amount(grandTotal - totalPaid)}</span></div></div>
        </div>
        <footer className="flex items-center justify-end gap-2 border-t bg-white px-5 py-3"><button onClick={onClose} className="rounded-md border px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button><button onClick={save} className="rounded-md bg-blue-700 px-4 py-2 text-xs font-semibold text-white">Save Changes</button></footer>
      </section>
    </div>
  );
}
