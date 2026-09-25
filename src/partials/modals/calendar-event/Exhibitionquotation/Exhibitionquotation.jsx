import { useState } from "react";
import {
  Trash2,
  Lock,
  Plus,
  Calendar,
  ChevronDown,
  FilePlus2,
  Settings,
  Printer,
  Save,
  ClipboardList,
  Palette,
  Pencil,
  User,
  MapPin,
  Phone,
  Wallet,
  IndianRupee,
  Clock,
  Bell,
  Presentation,
  Store,
} from "lucide-react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const DATE_FORMAT = "DD/MM/YYYY";
const initialA = [
  { id: 1, name: "Main Exhibition Hall A", qty: 2, rate: 45000 },
  { id: 2, name: "Stall Octanorm No. 12", qty: 15, rate: 3500 },
  { id: 3, name: "Fascia Board & Lighting", qty: 6, rate: 1200 },
];

const initialDays = [];

function money(n) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Shared totals calc so the per-estimate card and the combined summary
// never drift apart.
function calcTotals(rows) {
  const subtotal = rows.reduce(
    (sum, row) => sum + Number(row.qty || 0) * Number(row.rate || 0),
    0
  );
  const discount = 0;
  const amountAfterDiscount = subtotal - discount;
  const tds = amountAfterDiscount * 0.02;
  const cgst = amountAfterDiscount * 0.025;
  const sgst = amountAfterDiscount * 0.025;
  const igst = 0;
  const roundOff = 0;
  const grandTotal = amountAfterDiscount + cgst + sgst + igst - tds + roundOff;

  return { subtotal, discount, amountAfterDiscount, tds, cgst, sgst, igst, roundOff, grandTotal };
}

function EstimateTable({ title, tag, rows, setRows, onDeleteEstimate, canDelete }) {
  const { subtotal, amountAfterDiscount, tds, cgst, sgst, igst, roundOff, grandTotal } = calcTotals(rows);
 const [open, setOpen] = useState(true); 
  const updateRow = (id, field, value) => {
    setRows(
      rows.map((row) =>
        row.id === id
          ? { ...row, [field]: field === "qty" || field === "rate" ? Number(value) : value }
          : row
      )
    );
  };

  const deleteRow = (id) => {
    setRows(rows.filter((row) => row.id !== id));
  };

  const addRow = () => {
    setRows([...rows, { id: Date.now(), name: "", qty: 1, rate: 0 }]);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 mt-2.5">
      {/* Estimate Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div
  className="text-[15px] font-bold flex items-center gap-2 cursor-pointer select-none"
  onClick={() => setOpen(!open)}
>
  <ChevronDown size={16} className={`text-slate-500 transition-transform ${open ? "" : "-rotate-90"}`} />
  {title}
  <span className="bg-indigo-50 text-indigo-700 text-[11px] px-2 py-0.5 rounded-full font-semibold">
    {tag}
  </span>
</div>

        <div className="flex items-center gap-2">
          <div className="text-right mr-2">
            <div className="text-[10.5px] text-slate-500">Grand Total</div>
            <div className="text-base font-bold text-blue-700">{money(grandTotal)}</div>
          </div>

          {canDelete && (
            <button
              onClick={onDeleteEstimate}
              className="text-slate-400 hover:text-red-600 p-1"
              title="Delete Estimate"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
<div className={open ? "" : "hidden"}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 my-2.5 flex-wrap">
        <input
          className="flex-1 min-w-[140px] border border-slate-200 rounded-lg px-2.5 py-1.5 text-sm text-slate-500"
          placeholder="Search function..."
        />
        <div className="flex items-center gap-2.5">
        
          <button
            onClick={addRow}
            className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium flex items-center gap-1"
          >
            <Plus size={13} />
            Add Row
          </button>
         
        </div>
      </div>

      {/* Estimate Rows */}
      <div className="overflow-x-auto scroll-visible">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            {["SR.NO.", "NAME", "QUANTITY", "RATE (₹)", "TOTAL AMOUNT (₹)", ""].map((header) => (
              <th
                key={header}
                className={`text-left text-slate-500 font-semibold text-[11px] py-2 px-1.5 border-b border-slate-200 ${
                  header.includes("RATE") || header.includes("TOTAL") ? "text-right" : ""
                }`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td className="py-2 px-1.5 border-b border-slate-200">{String(index + 1).padStart(2, "0")}</td>
              <td className="py-2 px-1.5 border-b border-slate-200">
                <input
                  className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-[13px]"
                  value={row.name}
                  onChange={(e) => updateRow(row.id, "name", e.target.value)}
                />
              </td>
              <td className="py-2 px-1.5 border-b border-slate-200">
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-[13px] text-center"
                  value={row.qty}
                  onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                />
              </td>
              <td className="py-2 px-1.5 border-b border-slate-200">
                <input
                  type="number"
                  className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-[13px] text-right"
                  value={row.rate}
                  onChange={(e) => updateRow(row.id, "rate", e.target.value)}
                />
              </td>
              <td className="py-2 px-1.5 border-b border-slate-200 text-right font-medium">
                {money(Number(row.qty || 0) * Number(row.rate || 0))}
              </td>
              <td className="py-2 px-1.5 border-b border-slate-200 text-center">
                <button onClick={() => deleteRow(row.id)} className="text-slate-400 hover:text-red-600">
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <button onClick={addRow} className="text-primary text-[13px] font-semibold py-2 px-1">
        + Add Row
      </button>

      {/* SUMMARY */}
      <div className="mt-3 border border-slate-200 rounded-xl p-3.5">
        <div className="text-[12px]">
          <div className="flex justify-between items-center py-1">
            <span className="font-semibold text-blue-700">Subtotal</span>
            <span className="font-bold text-slate-800">{money(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <div>
              <div className="text-red-500 font-semibold">Discount</div>
              <div className="text-[10px] text-slate-400">
                Click % to add discount by percentage, or ₹ to add discount by amount.
              </div>
            </div>
            <div className="flex gap-1.5">
              <input className="w-12 border border-slate-200 rounded-md px-2 py-1 text-xs text-center" defaultValue="%" />
              <input className="w-24 border border-slate-200 rounded-md px-2 py-1 text-xs text-right" defaultValue="₹ 0.00" />
            </div>
          </div>

          <div className="flex justify-between items-center bg-blue-50 rounded-lg px-3 py-2 mb-1">
            <span className="font-semibold text-slate-600">Amount after Discount</span>
            <span className="font-bold text-blue-700">{money(amountAfterDiscount)}</span>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span>TDS u/s 194C @ 2%</span>
            <span className="text-red-500 font-semibold">-{money(tds)}</span>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span>CGST</span>
            <div className="flex items-center gap-2">
              <span className="border border-slate-200 rounded-md px-3 py-1">2.5</span>
              <span>%</span>
              <span className="border border-slate-200 rounded-md px-3 py-1 min-w-[105px] text-right">{money(cgst)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span>SGST</span>
            <div className="flex items-center gap-2">
              <span className="border border-slate-200 rounded-md px-3 py-1">2.5</span>
              <span>%</span>
              <span className="border border-slate-200 rounded-md px-3 py-1 min-w-[105px] text-right">{money(sgst)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span>IGST</span>
            <div className="flex items-center gap-2">
              <span className="border border-slate-200 rounded-md px-3 py-1">0</span>
              <span>%</span>
              <span className="border border-slate-200 rounded-md px-3 py-1 min-w-[105px] text-right">{money(igst)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span>Round Off</span>
            <span className="border border-slate-200 rounded-md px-3 py-1 min-w-[170px] text-right">{roundOff}</span>
          </div>

          <div className="flex justify-between items-center border-t border-slate-200 mt-1 pt-2">
            <span className="font-bold text-[13px]">Grand Total</span>
            <span className="font-bold text-blue-700 text-[15px]">{money(grandTotal)}</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}



function DayCard({ day, onToggle, onUpdateRow, onDeleteRow, onAddRow, onUpdateField }) {
  const total = day.rows.reduce((s, r) => s + r.qty * r.rate, 0);
  const totalQty = day.rows.reduce((s, r) => s + r.qty, 0);
  const totalRate = day.rows.reduce((s, r) => s + r.rate, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 mt-2.5">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="relative">
           {/* AFTER */}
<DatePicker
  value={day.date ? dayjs(day.date, DATE_FORMAT) : null}
  format={DATE_FORMAT}
  placeholder="Select date"
  allowClear={false}
  onChange={(_, dateString) => onUpdateField(day.id, "date", dateString)}
  style={{ width: 150, fontWeight: 700 }}
/>
          </div>
          <input
            type="text"
            value={day.label}
            onChange={(e) => onUpdateField(day.id, "label", e.target.value)}
            placeholder="Scope label"
            className="bg-slate-100 text-slate-500 text-[11px] px-2.5 py-1.5 rounded-full border-none w-[170px] font-medium"
          />
        </div>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onToggle(day.id)}>
          <div className="text-right">
            <div className="text-[10.5px] text-slate-500">Day Subtotal</div>
            <div className="text-[15px] font-bold text-blue-700">{money(total)}</div>
          </div>
          <ChevronDown size={16} className={`text-slate-500 transition-transform ${day.open ? "" : "-rotate-90"}`} />
        </div>
      </div>

      {day.open && (
        <div className="mt-3">
          <div className="overflow-x-auto scroll-visible">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                {["PARTICULARS NAME", "QUANTITY", "RATE", "TOTAL AMOUNT", ""].map((h) => (
                  <th key={h} className="text-left text-slate-500 font-semibold text-[11px] py-2 px-1.5 border-b border-slate-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {day.rows.map((r) => (
                <tr key={r.id}>
                  <td className="py-2 px-1.5 border-b border-slate-200">
                    <input
                      className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-[13px]"
                      value={r.name}
                      onChange={(e) => onUpdateRow(day.id, r.id, "name", e.target.value)}
                    />
                  </td>
                  <td className="py-2 px-1.5 border-b border-slate-200">
                    <input
                      type="number"
                      className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-[13px] text-center"
                      value={r.qty}
                      onChange={(e) => onUpdateRow(day.id, r.id, "qty", Number(e.target.value))}
                    />
                  </td>
                  <td className="py-2 px-1.5 border-b border-slate-200">
                    <input
                      type="number"
                      className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-[13px] text-right"
                      value={r.rate}
                      onChange={(e) => onUpdateRow(day.id, r.id, "rate", Number(e.target.value))}
                    />
                  </td>
                  <td className="py-2 px-1.5 border-b border-slate-200 text-right font-medium">
                    {money(r.qty * r.rate)}
                  </td>
                  <td className="py-2 px-1.5 border-b border-slate-200 text-center">
                    <button onClick={() => onDeleteRow(day.id, r.id)} className="text-slate-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <button onClick={() => onAddRow(day.id)} className="text-primary text-[13px] font-semibold py-2 px-1">
            + Add Particulars Row
          </button>
          <div className="flex justify-between items-center text-[12.5px] mt-2">
<span className="text-slate-500 font-semibold">{day.date || "Select date"} — Total:</span>            <span className="text-slate-500">
              Total Quantity: <span className="font-semibold text-slate-700">{totalQty}</span>
              &nbsp;&nbsp; Total Rate: <span className="font-semibold text-slate-700">{money(totalRate)}</span>
              &nbsp;&nbsp; Total Amount: <span className="font-bold text-blue-700">{money(total)}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
function SectionHeader({ no, title, open, onToggle, right }) {
  return (
    <div className="flex justify-between items-center text-[12px] font-bold text-primary tracking-wide mt-5 mb-2">
      <button type="button" onClick={onToggle} className="flex items-center gap-2 text-left">
        <ChevronDown size={16} className={`text-slate-500 transition-transform ${open ? "" : "-rotate-90"}`} />
        <span className="text-[13px] font-extrabold text-blue-800 tracking-tight">
          SECTION {no}
          <span className="mx-2 text-slate-300">•</span>
          <span className="text-[13px] font-bold text-black">{title}</span>
        </span>
      </button>
      {right}
    </div>
  );
}

export default function ExhibitionQuotation() {
  const [estimates, setEstimates] = useState([
    {
      id: "estimate-a",
      title: "Estimate A",
      tag: "Primary Hall Scope",
      rows: initialA,
    },
  ]);
  const [days, setDays] = useState(initialDays);
  const [notes, setNotes] = useState(
    "Standard interstate GST levied at 18% (9% CGST + 9% SGST). TDS deductible under Section 194C @ 2% on contractor payments."
  );
const [openSections, setOpenSections] = useState({ s1: true, s2: true, s3: true, s4: true });
const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
const [payments, setPayments] = useState([
    {
      id: 1,
      amount: 100000,
      mode: "Bank Transfer (RTGS/NEFT)",
      dateTime: "18/02/2026 04:50 PM",
      description: "Ref: Advance Hall Booking #TXN-4921",
    },
  ]);

  const addPayment = () => {
    setPayments((prev) => [
      ...prev,
      { id: Date.now(), amount: 0, mode: "Bank Transfer (RTGS/NEFT)", dateTime: "", description: "" },
    ]);
  };

  const updatePayment = (id, field, value) => {
    setPayments((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removePayment = (id) => {
    setPayments((prev) => prev.filter((p) => p.id !== id));
  };

  const addEstimate = () => {
    setEstimates((prev) => {
      const nextIndex = prev.length;
      const letter = String.fromCharCode(65 + nextIndex);
      return [
        ...prev,
        {
          id: `estimate-${letter.toLowerCase()}-${Date.now()}`,
          title: `Estimate ${letter}`,
          tag: "Additional Scope",
          rows: [{ id: Date.now(), name: "", qty: 1, rate: 0 }],
        },
      ];
    });
  };

  const updateEstimateRows = (estimateId, newRows) => {
    setEstimates((prev) =>
      prev.map((estimate) => (estimate.id === estimateId ? { ...estimate, rows: newRows } : estimate))
    );
  };

  const deleteEstimate = (estimateId) => {
    setEstimates((prev) => prev.filter((estimate) => estimate.id !== estimateId));
  };

  // Combined totals across every estimate currently on the page.
  const allRows = estimates.flatMap((e) => e.rows);
  const combinedSubtotal = allRows.reduce(
    (sum, r) => sum + Number(r.qty || 0) * Number(r.rate || 0),
    0
  );
  const combinedGST = combinedSubtotal * 0.18;
  const combinedTDS = combinedSubtotal * 0.02;
  const combinedGrandTotal = combinedSubtotal + combinedGST - combinedTDS;
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
// Section 03 (date-wise) total
const otherTotal = days.reduce(
  (sum, d) => sum + d.rows.reduce((s, r) => s + Number(r.qty || 0) * Number(r.rate || 0), 0),
  0
);

// Section 04 final totals
const finalGrandTotal = combinedGrandTotal + otherTotal;
const remaining = finalGrandTotal - totalPaid;
  const toggleDay = (id) => setDays(days.map((d) => (d.id === id ? { ...d, open: !d.open } : d)));
  const updateDayRow = (dayId, rowId, field, value) =>
    setDays(
      days.map((d) =>
        d.id === dayId
          ? { ...d, rows: d.rows.map((r) => (r.id === rowId ? { ...r, [field]: value } : r)) }
          : d
      )
    );
  const deleteDayRow = (dayId, rowId) =>
    setDays(days.map((d) => (d.id === dayId ? { ...d, rows: d.rows.filter((r) => r.id !== rowId) } : d)));
  const addDayRow = (dayId) =>
    setDays(
      days.map((d) =>
        d.id === dayId ? { ...d, rows: [...d.rows, { id: Date.now(), name: "", qty: 1, rate: 0 }] } : d
      )
    );
  const updateDayField = (dayId, field, value) =>
    setDays(days.map((d) => (d.id === dayId ? { ...d, [field]: value } : d)));
  const addDate = () => {
    setDays((prev) => [
      ...prev,
      {
        id: `day-${Date.now()}`,
        date: "",
        label: "New Scope",
        open: true,
        rows: [{ id: Date.now(), name: "", qty: 1, rate: 0 }],
      },
    ]);
  };

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <style>{`
        .scroll-visible {
          scrollbar-width: thin;
          scrollbar-color: #94a3b8 #f1f5f9;
        }
        .scroll-visible::-webkit-scrollbar {
          height: 8px;
        }
        .scroll-visible::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 9999px;
        }
        .scroll-visible::-webkit-scrollbar-thumb {
          background: #94a3b8;
          border-radius: 9999px;
        }
        .scroll-visible::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 flex items-center justify-between px-4 py-3 gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
  <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
    <Store  size={18} strokeWidth={2.2} />
  </div>

  <div>
    <div className="font-bold text-[15px]">
      Exhibition Quotation
    </div>

    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
    </div>
  </div>
</div>
        <div className="flex gap-2 flex-wrap">

  <button className="border border-slate-200 rounded-lg px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5">
    <FilePlus2 size={14} />
    Extra Quotation
  </button>

  <button className="border border-slate-200 rounded-lg px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5">
    <Settings size={14} />
    Setup
  </button>

  <button className="border border-slate-200 rounded-lg px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5">
    <Printer size={14} />
    Print
  </button>

  <button className="bg-primary text-white rounded-lg px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5">
    <Save size={14} />
    Save
  </button>

</div>
      </div>

      <div className="mx-auto px-4 pb-10 pt-4">
        {/* Event info */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5">
          <div className="flex justify-between items-center flex-wrap gap-2.5">
            <div>
              <div className="text-[11px] text-slate-500 tracking-wide">EVENT NAME</div>
              <div className="text-xl font-bold mt-0.5">Reception</div>
            </div>
            <div className="flex gap-2">

  <button className="border border-slate-200 rounded-lg px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5">
    <ClipboardList size={14} />
    Menu Planning
  </button>

  <button className="bg-primary text-white rounded-lg px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5">
    <Palette size={14} />
    Decor Quotation
  </button>

  <button className="border border-slate-200 rounded-lg px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5">
    <Pencil size={14} />
    Edit Event
  </button>

  <button className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium flex items-center gap-1.5">
    <Lock size={13} />
    Lock
  </button>

</div>
          </div>

       <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3">

  {[
    ["Party Name", "AVSAR SIR", User],
    ["Venue Name", "Swambhoomi Party Plot", MapPin],
    ["Event Date", "09 September 2026", Calendar],
    ["Mobile Number", "08153985521", Phone],
    ["Quotation Date", "18/02/2026", Calendar],
  ].map(([label, value, Icon]) => (
    <div key={label}>

      <div className="text-[11px] text-slate-500 flex items-center gap-1">
        <Icon size={12} className="text-slate-400" />
        {label}
      </div>

      <div className="text-[13.5px] font-semibold mt-0.5">
        {value}
      </div>

    </div>
  ))}

</div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            <div>
              <div className="text-[11px] text-slate-500 mb-0.5">Billing Name</div>
              <input className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13.5px]" defaultValue="AVSAR SIR / Corporate" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 mb-0.5">GST Number</div>
              <input className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13.5px]" defaultValue="24ABCDE1234F1Z5" />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 mb-0.5">Due Date</div>
              <input type="date" className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13.5px]" defaultValue="2026-02-18" />
            </div>
          </div>
        </div>

        {/* Section 01 */}
<SectionHeader
  no="01"
  title="Estimates Breakdown"
  open={openSections.s1}
  onToggle={() => toggleSection("s1")}
  right={
    <div className="flex items-center gap-2 text-[12px]">
      <span className="text-slate-500 font-medium">
        {estimates.length} {estimates.length === 1 ? "Estimate" : "Estimates"} Active
      </span>
    
    </div>
  }
/>

<div className={openSections.s1 ? "" : "hidden"}>
  {estimates.map((estimate) => (
    <EstimateTable
      key={estimate.id}
      title={estimate.title}
      tag={estimate.tag}
      rows={estimate.rows}
      setRows={(newRows) => updateEstimateRows(estimate.id, newRows)}
      canDelete={estimates.length > 1}
      onDeleteEstimate={() => deleteEstimate(estimate.id)}
    />
  ))}

  {/* Shared notes for Section 01 as a whole, instead of repeating per estimate */}
  <div className="border border-slate-200 rounded-lg p-3 text-[11.5px] leading-relaxed text-slate-500 mt-2.5">
    <div className="text-[11px] font-semibold text-slate-400 tracking-wide mb-2">
      TAX &amp; STATUTORY NOTES
    </div>
    <textarea
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
      rows={3}
      placeholder="Add tax & statutory notes..."
      className="w-full resize-y border border-slate-200 rounded-lg px-2.5 py-2 text-[11.5px] leading-relaxed text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
    />
  </div>

    <button onClick={addEstimate} className="w-full border border-dashed border-slate-300 bg-white rounded-lg py-3 text-[13px] text-primary font-semibold mt-2.5 flex items-center justify-center gap-2">
    <Calendar size={15} /> Add Estimate
  </button>
</div>

        {/* Section 02 */}
       {/* Section 02 */}
<SectionHeader
  no="02"
  title="Overall Estimate Summary & Payment Settlement"
  open={openSections.s2}
  onToggle={() => toggleSection("s2")}
/>
<div className={`border border-blue-100 rounded-lg p-3 ${openSections.s2 ? "" : "hidden"}`}>
  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
    <div className="flex justify-between py-1.5 text-[13.5px]">
      <span>Combined Subtotal</span>
      <span>{money(combinedSubtotal)}</span>
    </div>
    <div className="flex justify-between py-1.5 text-[13.5px]">
      <span>Consolidated GST (18%)</span>
      <span>{money(combinedGST)}</span>
    </div>
    <div className="flex justify-between py-1.5 text-[13.5px] text-red-600">
      <span>Total Statutory TDS Deduction</span>
      <span>-{money(combinedTDS)}</span>
    </div>
    <div className="flex justify-between py-2 mt-0.5 border-t border-slate-200 font-bold text-lg text-blue-700">
      <span>Combined Grand Total</span>
      <span>{money(combinedGrandTotal)}</span>
    </div>
  </div>
</div>

        {/* Payment Details — dynamic list of advance payments */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 mt-3">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 text-primary font-bold text-[13px]">
              <Wallet size={15} />
              Payment Details
            </div>
            <button
              onClick={addPayment}
              className="bg-primary text-white rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1 hover:bg-blue-700"
            >
              <Plus size={13} />
              Add Advance Payment
            </button>
          </div>

          {payments.length === 0 && (
            <div className="text-center text-slate-400 text-[12.5px] py-4">No advance payments added yet.</div>
          )}

          {payments.map((p) => (
            <div key={p.id} className="border border-slate-200 rounded-lg p-3 mb-3 last:mb-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-[11px] text-slate-500 mb-0.5">Advance Payment (₹):</div>
                  <div className="relative">
                    <IndianRupee size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      className="w-full border border-slate-200 rounded-lg pl-7 pr-2.5 py-2 text-[13.5px]"
                      value={p.amount}
                      onChange={(e) => updatePayment(p.id, "amount", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-0.5">Payment Mode:</div>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13.5px] bg-white"
                    value={p.mode}
                    onChange={(e) => updatePayment(p.id, "mode", e.target.value)}
                  >
                    <option>Bank Transfer (RTGS/NEFT)</option>
                    <option>Cash</option>
                    <option>Cheque</option>
                    <option>UPI</option>
                    <option>Card</option>
                  </select>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-0.5">Payment Date &amp; Time:</div>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full border border-slate-200 rounded-lg px-2.5 pr-8 py-2 text-[13.5px]"
                      value={p.dateTime}
                      onChange={(e) => updatePayment(p.id, "dateTime", e.target.value)}
                      placeholder="DD/MM/YYYY HH:MM"
                    />
                    <Clock size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-0.5">Payment Description:</div>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13.5px]"
                    value={p.description}
                    onChange={(e) => updatePayment(p.id, "description", e.target.value)}
                    placeholder="Ref: ..."
                  />
                </div>
              </div>

              <button
                onClick={() => removePayment(p.id)}
                className="mt-3 text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1 hover:bg-red-100"
              >
                <Trash2 size={13} />
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center bg-green-50 border border-green-200 rounded-xl px-3.5 py-3 mt-3">
          <span className="flex items-center gap-2 text-[13.5px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Total Paid
          </span>
          <span className="font-bold text-green-600 text-[15px]">{money(totalPaid)}</span>
        </div>

        <div className="flex justify-between items-center bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 mt-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center flex-none">
              <Bell size={14} />
            </div>
            <div>
              <div className="text-[13.5px] font-semibold text-red-600">Remaining Payment Due</div>
              <div className="text-[11px] text-slate-500">
                Grand Total ({money(combinedGrandTotal)}) minus Advance Paid ({money(totalPaid)})
              </div>
            </div>
          </div>
          <span className="font-bold text-red-600 text-[15px]">{money(remaining)}</span>
        </div>
</div>

       {/* Section 03 */}
<SectionHeader
  no="03"
  title="Estimate Amount (Other)"
  open={openSections.s3}
  onToggle={() => toggleSection("s3")}
  right={
    <span className="text-slate-500  font-medium flex items-center gap-1.5 text-[12px]">
      <Calendar size={13} className="text-slate-400" />
      {days.length} Dates Specified
    </span>
  }
/>

<div className={`border m-3 border-blue-100 rounded-lg p-3 ${openSections.s3 ? "" : "hidden"}`}>
  {days.length === 0 && (
    <div className="text-center text-slate-400 text-[12.5px] py-4">
      No dates added yet — use the button below to add one.
    </div>
  )}
  {days.map((day) => (
    <DayCard
      key={day.id}
      day={day}
      onToggle={toggleDay}
      onUpdateRow={updateDayRow}
      onDeleteRow={deleteDayRow}
      onAddRow={addDayRow}
      onUpdateField={updateDayField}
    />
  ))}
  <button onClick={addDate} className="w-full border border-dashed border-slate-300 bg-white rounded-lg py-3 text-[13px] text-primary font-semibold mt-2.5 flex items-center justify-center gap-2">
    <Calendar size={15} /> Add Date Particulars Scope
  </button>
</div>
      {/* Section 04 */}

  <div className="flex justify-between items-center flex-wrap gap-2 pb-3 mb-3 border-b border-slate-100">
    <button type="button" onClick={() => toggleSection("s4")} className="flex items-center gap-2 text-left">
      <ChevronDown size={16} className={`text-slate-500 transition-transform ${openSections.s4 ? "" : "-rotate-90"}`} />
      <span className="text-[13px] font-extrabold text-blue-800 tracking-tight">
        SECTION 04
        <span className="mx-2 text-slate-300">•</span>
        <span className="text-[13px] font-bold text-black">Estimate Amount (Other) — Grand Total</span>
      </span>
    </button>
    <span className="bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-medium px-2.5 py-1 rounded-full">
      {estimates.length === 1 ? "Estimate A" : `All ${estimates.length} Estimates`} + Date-wise Scope Aggregated
    </span>
  </div>
 <div className={openSections.s4 ? "" : "hidden"}>  
  {/* Combined Grand Total */}
  <div className="flex m-3 justify-between items-center bg-blue-50 border border-blue-100 rounded-xl px-3.5 py-3">
    <span className="text-[13px] font-semibold text-blue-800">Combined Grand Total</span>
    <span className="text-lg font-bold text-blue-700">{money(finalGrandTotal)}</span>
  </div>

  {/* Payment Details */}
  <div className="bg-white border border-slate-200 rounded-xl m-2 p-3.5 mt-3">
    <div className="flex justify-between items-center mb-3">
      <div className="flex items-center gap-2 text-primary font-bold text-[13px]">
        <Wallet size={15} />
        Payment Details
      </div>
      <button
        onClick={addPayment}
        className="bg-primary text-white rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1 hover:bg-blue-700"
      >
        <Plus size={13} />
        Add Advance Payment
      </button>
    </div>

    {payments.length === 0 && (
      <div className="text-center text-slate-400 text-[12.5px] py-4">No advance payments added yet.</div>
    )}

    {payments.map((p) => (
      <div key={p.id} className="border border-slate-200 rounded-lg p-3 mb-3 last:mb-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] text-slate-500 mb-0.5">Advance Payment (₹):</div>
            <div className="relative">
              <IndianRupee size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                className="w-full border border-slate-200 rounded-lg pl-7 pr-2.5 py-2 text-[13.5px]"
                value={p.amount}
                onChange={(e) => updatePayment(p.id, "amount", e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 mb-0.5">Payment Mode:</div>
            <select
              className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13.5px] bg-white"
              value={p.mode}
              onChange={(e) => updatePayment(p.id, "mode", e.target.value)}
            >
              <option>Bank Transfer (RTGS/NEFT)</option>
              <option>Cash</option>
              <option>Cheque</option>
              <option>UPI</option>
              <option>Card</option>
            </select>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 mb-0.5">Payment Date &amp; Time:</div>
            <div className="relative">
              <input
                type="text"
                className="w-full border border-slate-200 rounded-lg px-2.5 pr-8 py-2 text-[13.5px]"
                value={p.dateTime}
                onChange={(e) => updatePayment(p.id, "dateTime", e.target.value)}
                placeholder="DD/MM/YYYY HH:MM"
              />
              <Clock size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 mb-0.5">Payment Description:</div>
            <input
              type="text"
              className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13.5px]"
              value={p.description}
              onChange={(e) => updatePayment(p.id, "description", e.target.value)}
              placeholder="Ref: ..."
            />
          </div>
        </div>

        <button
          onClick={() => removePayment(p.id)}
          className="mt-3 text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-xs font-semibold flex items-center gap-1 hover:bg-red-100"
        >
          <Trash2 size={13} />
          Remove
        </button>
      </div>
    ))}
  </div>

  {/* Total Paid */}
  <div className="m-3 flex justify-between items-center bg-green-50 border border-green-200 rounded-xl px-3.5 py-3 mt-3">
    <span className="flex items-center gap-2 text-[15px] font-semibold">
      <span className="w-2 h-2 rounded-full bg-green-500" />
      Total Paid
    </span>
    <span className="font-bold text-green-600 text-lg">{money(totalPaid)}</span>
  </div>

  {/* Remaining */}
  <div className="m-3 flex justify-between items-center bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 mt-2.5">
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center flex-none">
        <Bell size={14} />
      </div>
      <div>
        <div className="text-[13.5px] font-semibold text-red-600">Remaining Payment Due</div>
        <div className="text-[11px] text-slate-500">
          Grand Total ({money(finalGrandTotal)}) minus Advance Paid ({money(totalPaid)})
        </div>
      </div>
    </div>
    <span className="font-bold text-red-600 text-lg">{money(remaining)}</span>
  </div>      
  </div>        
</div>          
    
  );
}