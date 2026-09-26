import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import Swal from "sweetalert2";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import ExtraQuotationModal from "./ExtraQuotationModal.jsx";
import SetupModal from "./SetupModal.jsx";
// TODO: adjust this import path to match where apiServices actually lives
// relative to this file (e.g. "../../../services/apiServices").
import {
  GetEventMasterById,
  getbyexhibitionevenybuuser,
  updateehibition,
} from "@/services/apiServices";

dayjs.extend(customParseFormat);

const DATE_FORMAT = "DD/MM/YYYY";
const DATE_TIME_FORMAT = "DD/MM/YYYY hh:mm A";

const initialDays = [];

/* =============================================================================
   API PAYLOAD MAPPING
   -----------------------------------------------------------------------------
   These constants/helpers turn the on-screen state (estimates / days / payments)
   into the backend payload shape you shared. Confirmed against a real GET
   response: groupType has three values — ESTIMATE (Section 01), OTHER
   (Section 03 date-wise), and EXTRA (the "Extra Quotation" button, which has
   no UI here yet — its group is round-tripped unchanged so saving from this
   screen doesn't wipe it out). Still worth double-checking:

   1. PAYMENT_MODE_TO_API — only "BANK_TRANSFER" was confirmed; CASH, CHEQUE,
      UPI, CARD are guesses. Confirm these match your backend enum exactly.
   2. Section 01 (estimates) modules now carry their own discountPercent,
      cgstPercent, sgstPercent and roundOff (each estimate is editable
      independently instead of a single hardcoded 2.5%/2.5%/0).
   3. Advance payments are now two separate lists on screen — Section 02's
      list is sent under the ESTIMATE group, Section 04's list is sent under
      the OTHER group. Previously all payments were pooled under ESTIMATE and
      OTHER's payments were always sent as [].
   4. quotationCode/quotationdate have no editable UI — whatever the backend
      returned on fetch is echoed back unchanged on save.
============================================================================= */

const PAYMENT_MODE_TO_API = {
  "Bank Transfer (RTGS/NEFT)": "BANK_TRANSFER",
  "UPI": "UPI",
  "Cash": "CASH",
  "Cheque": "CHEQUE",
  "Other": "OTHER",
  "Card": "CARD",
};
const PAYMENT_MODE_FROM_API = Object.fromEntries(
  Object.entries(PAYMENT_MODE_TO_API).map(([label, code]) => [code, label])
);

const GROUP_TYPE_ESTIMATE = "ESTIMATE";
const GROUP_TYPE_OTHER = "OTHER";
const GROUP_TYPE_EXTRA = "EXTRA"; // "Extra Quotation" button — no UI yet, round-tripped as-is
const MODULE_TYPE_ESTIMATE = "ESTIMATE";
const MODULE_TYPE_OTHER = "OTHER";

// New rows/estimates/days are keyed with Date.now(), which is always far
// bigger than any real DB id — used to tell "not yet saved" apart from
// "already has a backend id" without changing the existing id scheme.
const CLIENT_ID_THRESHOLD = 1_000_000;
const toBackendId = (id) =>
  typeof id === "number" && id > 0 && id < CLIENT_ID_THRESHOLD ? id : null;

function toApiPayment(p) {
  return {
    id: toBackendId(p.id),
    amount: Number(p.amount || 0),
    paymentDateTime: p.dateTime || "",
    paymentDescription: p.description || "",
    paymentMode: PAYMENT_MODE_TO_API[p.mode] || "BANK_TRANSFER",
  };
}

function fromApiPayment(p) {
  return {
    id: p.id || Date.now() + Math.random(),
    amount: p.amount,
    mode: PAYMENT_MODE_FROM_API[p.paymentMode] || p.paymentMode,
    dateTime: p.paymentDateTime,
    description: p.paymentDescription,
  };
}

function itemsToRows(items) {
  return (items || []).map((it) => ({
    id: it.id || Date.now() + Math.random(),
    name: it.particularsName,
    qty: it.quantity,
    rate: it.rate,
  }));
}

function rowsToItems(rows) {
  return rows.map((row, idx) => ({
    id: toBackendId(row.id) || null,
    displayOrder: idx + 1,
    particularsName: row.name,
    quantity: Number(row.qty || 0),
    rate: Number(row.rate || 0),
  }));
}

function money(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Pulls "DD/MM/YYYY hh:mm A" (or plain "DD/MM/YYYY") down to just the date
// part for display in the header card.
function formatEventDate(raw) {
  if (!raw) return "-";
  const datePart = String(raw).split(" ")[0];
  const parsed = dayjs(datePart, "DD/MM/YYYY", true);
  return parsed.isValid() ? parsed.format("DD MMMM YYYY") : datePart;
}

// Shared totals calc so the per-estimate card and the combined summary
// never drift apart. discountPercent/cgstPercent/sgstPercent/roundOff are
// now editable per estimate instead of fixed values.
function calcTotals(
  rows,
  { tdsPercent = 0.0, discountPercent = 0.0, cgstPercent = 2.5, sgstPercent = 2.5, igstPercent = 0, roundOff = 0 } = {}
) {
  const subtotal = rows.reduce(
    (sum, row) => sum + Number(row.qty || 0) * Number(row.rate || 0),
    0
  );
  const discount = subtotal * (Number(discountPercent || 0) / 100);
  const amountAfterDiscount = subtotal - discount;
  const tds = amountAfterDiscount * (Number(tdsPercent || 0) / 100);
  const cgst = amountAfterDiscount * (Number(cgstPercent || 0) / 100);
  const sgst = amountAfterDiscount * (Number(sgstPercent || 0) / 100);
  const igst = amountAfterDiscount * (Number(igstPercent || 0) / 100);
  const roundOffValue = Number(roundOff || 0);
  const grandTotal = amountAfterDiscount + cgst + sgst + igst - tds + roundOffValue;

  return {
    subtotal,
    discount,
    amountAfterDiscount,
    tds,
    cgst,
    sgst,
    igst,
    roundOff: roundOffValue,
    grandTotal,
  };
}

function EstimateTable({
  title,
  tag,
  rows,
  setRows,
  onDeleteEstimate,
  canDelete,
  tdsPercent,
  onTdsPercentChange,
  discountPercent,
  onDiscountPercentChange,
  cgstPercent,
  onCgstPercentChange,
  sgstPercent,
  onSgstPercentChange,
  igstPercent,
  onIgstPercentChange,
  roundOff,
  onRoundOffChange,
}) {
  const { subtotal, discount, amountAfterDiscount, tds, cgst, sgst, igst, grandTotal } = calcTotals(rows, {
    tdsPercent,
    discountPercent,
    cgstPercent,
    sgstPercent,
    igstPercent,
    roundOff,
  });
 const [open, setOpen] = useState(true); 
  const updateRow = (id, field, value) => {
    setRows(
      rows.map((row) =>
        row.id === id
          ? { ...row, [field]: value }
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
        
        <div className="flex items-center gap-2.5">
        
      
         
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
                  type="text"
                  inputMode="decimal"
                  className="w-full border border-slate-200 rounded-md px-2 py-1.5 text-[13px] text-center"
                  value={row.qty}
                  onChange={(e) => updateRow(row.id, "qty", e.target.value)}
                />
              </td>
              <td className="py-2 px-1.5 border-b border-slate-200">
                <input
                  type="text"
                  inputMode="decimal"
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
        <div className="text-[14px]">
          <div className="flex justify-between items-center py-1">
            <span className="font-semibold text-blue-700">Subtotal</span>
            <span className="font-bold text-slate-800">{money(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center py-2">
            <div>
              <div className="text-red-500 font-semibold">Discount</div>
              <div className="text-[10px] text-slate-400">
                Enter a discount percentage — the amount is calculated automatically.
              </div>
            </div>
            <div className="flex gap-1.5 items-center">
              <input
                type="text"
                inputMode="decimal"
                step="0.01"
                min="0"
                className="w-16 border border-slate-200 rounded-md px-2 py-1 text-xs text-center"
                value={discountPercent}
                onChange={(e) => onDiscountPercentChange(e.target.value)}
              />
              <span className="text-xs text-slate-500">%</span>
              <input
                className="w-24 border border-slate-200 bg-slate-50 text-slate-500 rounded-md px-2 py-1 text-xs text-right cursor-not-allowed"
                value={money(discount)}
                disabled
                readOnly
              />
            </div>
          </div>

          <div className="flex justify-between items-center bg-blue-50 rounded-lg px-3 py-2 mb-1">
            <span className="font-semibold text-slate-600">Amount after Discount</span>
            <span className="font-bold text-blue-700">{money(amountAfterDiscount)}</span>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span>TDS u/s 194C</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                className="w-16 border border-slate-200 rounded-md px-2 py-1 text-xs text-center"
                value={tdsPercent}
                onChange={(e) => onTdsPercentChange(e.target.value)}
              />
              <span>%</span>
              <span className="border border-slate-200 bg-slate-50 text-red-500 rounded-md px-3 py-1 min-w-[105px] text-right">-{money(tds)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span>CGST</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                className="w-16 border border-slate-200 rounded-md px-2 py-1 text-xs text-center"
                value={cgstPercent}
                onChange={(e) => onCgstPercentChange(e.target.value)}
              />
              <span>%</span>
              <span className="border border-slate-200 bg-slate-50 text-slate-500 rounded-md px-3 py-1 min-w-[105px] text-right cursor-not-allowed">
                {money(cgst)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span>SGST</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                className="w-16 border border-slate-200 rounded-md px-2 py-1 text-xs text-center"
                value={sgstPercent}
                onChange={(e) => onSgstPercentChange(e.target.value)}
              />
              <span>%</span>
              <span className="border border-slate-200 bg-slate-50 text-slate-500 rounded-md px-3 py-1 min-w-[105px] text-right cursor-not-allowed">
                {money(sgst)}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span>IGST</span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                className="w-16 border border-slate-200 rounded-md px-2 py-1 text-xs text-center"
                value={igstPercent}
                onChange={(e) => onIgstPercentChange(e.target.value)}
              />
              <span>%</span>
              <span className="border border-slate-200 bg-slate-50 text-slate-500 rounded-md px-3 py-1 min-w-[105px] text-right">{money(igst)}</span>
            </div>
          </div>

          <div className="flex justify-between items-center py-1.5">
            <span>Round Off</span>
            <input
              type="text"
              inputMode="decimal"
              className="border border-slate-200 rounded-md px-3 py-1 min-w-[170px] text-right text-xs"
              value={roundOff}
              onChange={(e) => onRoundOffChange(e.target.value)}
            />
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
  // eventId comes from the route, e.g. /exhibition-quotation/:eventId
  const { eventId } = useParams();
  const [isExtraQuotationOpen, setIsExtraQuotationOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
const userId = localStorage.getItem("userId");
   const [estimates, setEstimates] = useState([]);
  const [days, setDays] = useState(initialDays);
  const [notes, setNotes] = useState("");
const [openSections, setOpenSections] = useState({ s1: false, s2: false, s3: false, s4: false });
const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // Section 02 and Section 04 now track their own, independent advance
  // payment lists rather than sharing one array.
  const [paymentsMain, setPaymentsMain] = useState([]); // Section 02 — advance against Section 01 estimates
  const [paymentsFinal, setPaymentsFinal] = useState([]); // Section 04 — advance against the combined final total

  // ---- Fields the update payload needs that were previously uncontrolled
  // (defaultValue) inputs. Wiring these to state doesn't change how they
  // look — it just lets their edited values actually get saved. ----
 const [billingName, setBillingName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [quotationDate, setQuotationDate] = useState("");
  const [quotationCode, setQuotationCode] = useState(""); // backend generates this; we just echo it back

  // Single statutory TDS rate the user can edit (Section 01's "TDS u/s 194C
  // @ X%" input) — drives every estimate's TDS calc, the combined summary,
  // and the ESTIMATE group/module tdsPercent sent in the payload.
  const [tdsPercent, setTdsPercent] = useState(0.0);

  // Backend ids for the top-level groups, filled in once an existing
  // quotation loads (Section 01 estimates = ESTIMATE, Section 03 date-wise
  // scope = OTHER). There's also an EXTRA group (for "Extra Quotation") that
  // has no UI yet — we keep its raw content so saving doesn't wipe it out.
  // null means "not created on the backend yet"; a real id is only ever set
  // from a GET response.
  const [estimateGroupId, setEstimateGroupId] = useState(null);
  const [otherGroupId, setOtherGroupId] = useState(null);
  const [extraGroup, setExtraGroup] = useState({
    id: null,
    discountPercent: 0.0,
    gstPercent: 0.0,
    tdsPercent: 0.0,
    modules: [],
    payments: [],
  });

  // ---- Event header info (party / venue / date / mobile / event name) ----
  const [eventInfo, setEventInfo] = useState(null);
  const [eventInfoLoading, setEventInfoLoading] = useState(false);

  // Existing saved quotation, if any — lets us tell "create" from "update".
  const [quotationId, setQuotationId] = useState(null);
  const [saving, setSaving] = useState(false);

  // Pulled out to component scope (not just inside the effect) so
  // handleSaveQuotation can also call it, to refresh state with the
  // backend's ids/computed totals after a successful save.
  const fetchExistingQuotation = async () => {
    try {
      const res = await getbyexhibitionevenybuuser(eventId, userId);
      const quotation = res?.data?.data ?? res?.data;
      if (quotation) {
        setQuotationId(quotation.id ?? null);

        if (Array.isArray(quotation.groups)) {
          // New (groups-based) schema — same shape the update payload uses.
          const estimateGroup = quotation.groups.find((g) => g.groupType === GROUP_TYPE_ESTIMATE);
          const otherGroup = quotation.groups.find((g) => g.groupType === GROUP_TYPE_OTHER);
          const extra = quotation.groups.find((g) => g.groupType === GROUP_TYPE_EXTRA);
          if (extra) {
            setExtraGroup({
              id: extra.id || null,
              discountPercent: extra.discountPercent || 0.0,
              gstPercent: extra.gstPercent || 0.0,
              tdsPercent: extra.tdsPercent || 0.0,
              modules: extra.modules || [],
              payments: extra.payments || [],
            });
          }

          if (estimateGroup) {
                  setEstimateGroupId(estimateGroup.id || null);
            setTdsPercent(typeof estimateGroup.tdsPercent === "number" ? estimateGroup.tdsPercent : 0);
            const mappedEstimates = (estimateGroup.modules || []).map((m, idx) => ({
              id: `estimate-${idx}`,
              moduleId: m.id || null,
              title: `Estimate ${String.fromCharCode(65 + idx)}`,
             tag: m.scopeLabel || `Estimate ${String.fromCharCode(65 + idx)}`,
             discountPercent: typeof m.discountPercent === "number" ? m.discountPercent : 0.0,
             cgstPercent: typeof m.cgstPercent === "number" ? m.cgstPercent : 2.5,
             sgstPercent: typeof m.sgstPercent === "number" ? m.sgstPercent : 2.5,
             igstPercent: typeof m.igstPercent === "number" ? m.igstPercent : 0.0,
             roundOff: typeof m.roundOff === "number" ? m.roundOff : 0,
             rows: itemsToRows(m.items),
           }));     
                 setEstimates(mappedEstimates);
         }

          if (otherGroup) {
            setOtherGroupId(otherGroup.id || null);
            const mappedDays = (otherGroup.modules || []).map((m) => ({
              id: `day-${m.id || Date.now() + Math.random()}`,
              moduleId: m.id || null,
              date: m.scopeDate || "",
              label: m.scopeLabel || "",
              open: true,
              rows: itemsToRows(m.items),
            }));
            setDays(mappedDays);
          }

          setPaymentsMain((estimateGroup?.payments || []).map(fromApiPayment));
          setPaymentsFinal((otherGroup?.payments || []).map(fromApiPayment));
        } else {
          // Fallback for the older estimates/days shape, in case the GET
          // endpoint hasn't been migrated to the groups schema yet.
          if (Array.isArray(quotation.estimates) && quotation.estimates.length) {
            setEstimates(quotation.estimates);
          }
          if (Array.isArray(quotation.days)) {
            setDays(quotation.days);
          }
          if (Array.isArray(quotation.payments) && quotation.payments.length) {
            setPaymentsMain(quotation.payments);
          }
        }
setNotes(quotation.notes ?? "");
        setBillingName(quotation.billingname ?? "");
        setGstNumber(quotation.gstnumber ?? "");
        setDueDate(quotation.duedate ?? "");
        setQuotationCode(quotation.quotationCode ?? "");
        setQuotationDate(quotation.quotationdate ?? "");
      }
    } catch (err) {
      // No saved quotation yet for this event is an expected case, not an error.
      console.info("No existing exhibition quotation found for this event yet.");
    }
  };

  useEffect(() => {
    if (!eventId) return;

    const fetchEventInfo = async () => {
      setEventInfoLoading(true);
      try {
        const res = await GetEventMasterById(eventId);
        const record = res?.data?.["Event Details"]?.[0] ?? res?.data?.data?.["Event Details"]?.[0];
        if (record) {
          setEventInfo(record);
        } else {
       console.error(res?.msg || "Event not found.");
        }
      } catch (err) {
      console.error("Failed to fetch event master:", err);
      } finally {
        setEventInfoLoading(false);
      }
    };

    fetchEventInfo();
    fetchExistingQuotation();
  },[eventId, userId]);

  const partyName = eventInfo?.party?.nameEnglish || "-";
  const venueName = eventInfo?.venue?.nameEnglish || eventInfo?.banquetHallName || "-";
  const eventDateDisplay = formatEventDate(eventInfo?.eventStartDateTime);
  const mobileNumber = eventInfo?.mobileno || "-";
  const eventNameDisplay = eventInfo?.eventType?.nameEnglish || "-";

 const createPaymentHandlers = (setter) => ({
    add: () =>
      setter((prev) => [
        ...prev,
        { id: Date.now(), amount: 0, mode: "Bank Transfer (RTGS/NEFT)", dateTime: "", description: "" },
      ]),
    update: (id, field, value) => {
      console.log("[payment update]", { id, field, value }); // ← ADD THIS
      setter((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
    },
    remove: (id) => setter((prev) => prev.filter((p) => p.id !== id)),
  });

  const mainPayments = createPaymentHandlers(setPaymentsMain);
  const finalPayments = createPaymentHandlers(setPaymentsFinal);

  const addEstimate = () => {
    setEstimates((prev) => {
      const nextIndex = prev.length;
      const letter = String.fromCharCode(65 + nextIndex);
      return [
        ...prev,
        {
          id: `estimate-${letter.toLowerCase()}-${Date.now()}`,
          moduleId: null,
          title: `Estimate ${letter}`,
          tag: "Additional Scope",
          discountPercent: 0.0,
          cgstPercent: 2.5,
          sgstPercent: 2.5,
          igstPercent: 0.0,
          roundOff: 0,
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

  // Generic scalar-field updater for an estimate — used for discountPercent,
  // cgstPercent, sgstPercent and roundOff.
  const updateEstimateField = (estimateId, field, value) => {
    setEstimates((prev) =>
      prev.map((estimate) => (estimate.id === estimateId ? { ...estimate, [field]: value } : estimate))
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
  const estimateTotals = estimates.map((estimate) => calcTotals(estimate.rows, {
    tdsPercent,
    discountPercent: estimate.discountPercent,
    cgstPercent: estimate.cgstPercent,
    sgstPercent: estimate.sgstPercent,
    igstPercent: estimate.igstPercent,
    roundOff: estimate.roundOff,
  }));
  const combinedGST = estimateTotals.reduce((sum, totals) => sum + totals.cgst + totals.sgst + totals.igst, 0);
  const combinedTDS = estimateTotals.reduce((sum, totals) => sum + totals.tds, 0);
  const combinedGrandTotal = estimateTotals.reduce((sum, totals) => sum + totals.grandTotal, 0);
  const totalPaidMain = paymentsMain.reduce((sum, p) => sum + Number(p.amount || 0), 0);
// Section 03 (date-wise) total
const otherTotal = days.reduce(
  (sum, d) => sum + d.rows.reduce((s, r) => s + Number(r.qty || 0) * Number(r.rate || 0), 0),
  0
);

// Section 04 final totals
const finalGrandTotal = combinedGrandTotal + otherTotal;
const totalPaidFinal = paymentsFinal.reduce((sum, p) => sum + Number(p.amount || 0), 0);
const remainingMain = combinedGrandTotal - totalPaidMain;
const remainingFinal = finalGrandTotal - totalPaidFinal;
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
        moduleId: null,
        date: "",
        label: "New Scope",
        open: true,
        rows: [{ id: Date.now(), name: "", qty: 1, rate: 0 }],
      },
    ]);
  };

  // ---- Build the update-API payload from current state ----
  const buildEstimateModules = () =>
    estimates.map((estimate, idx) => ({
      id: estimate.moduleId || null,
      moduleType: MODULE_TYPE_ESTIMATE,
      displayOrder: idx + 1,
      discountPercent: Number(estimate.discountPercent || 0.0),
      cgstPercent: Number(estimate.cgstPercent ?? 2.5),
      sgstPercent: Number(estimate.sgstPercent ?? 2.5),
      igstPercent: Number(estimate.igstPercent ?? 0.0),
      tdsPercent: Number(tdsPercent || 0.0),
      roundOff: Number(estimate.roundOff || 0),
      scopeDate: "",
      scopeLabel: estimate.tag || estimate.title,
      items: rowsToItems(estimate.rows),
    }));

  const buildOtherModules = () =>
    days.map((day, idx) => ({
      id: day.moduleId || null,
      moduleType: MODULE_TYPE_OTHER,
      displayOrder: idx + 1,
      discountPercent: 0.0,
      cgstPercent: 0.0,
      sgstPercent: 0.0,
      igstPercent: 0.0,
      tdsPercent: 0.0,
      roundOff: 0.0,
      scopeDate: day.date || "",
      scopeLabel: day.label || "",
      items: rowsToItems(day.rows),
    }));

  const buildPayload = () => {
    console.log("[buildPayload] paymentsMain:", paymentsMain); // ← ADD THIS
    console.log("[buildPayload] paymentsFinal:", paymentsFinal); // ← ADD THIS
    console.log("[buildPayload] mapped ESTIMATE payments:", paymentsMain.map(toApiPayment)); // ← ADD THIS
    console.log("[buildPayload] mapped OTHER payments:", paymentsFinal.map(toApiPayment)); // ← ADD THIS

    return {
      billingname: billingName,
      duedate: dueDate,
      eventId: Number(eventId),
      quotationCode,
      quotationdate: quotationDate,
      gstnumber: gstNumber,
      notes,
      userId: Number(userId) || 0,
      groups: [
        {
          id: estimateGroupId || null,
          groupType: GROUP_TYPE_ESTIMATE,
          discountPercent: 0.0,
          gstPercent: 5,
          tdsPercent: Number(tdsPercent || 0.0),
          modules: buildEstimateModules(),
          payments: paymentsMain.map(toApiPayment),
        },
        {
          id: otherGroupId || null,
          groupType: GROUP_TYPE_OTHER,
          discountPercent: 0.0,
          gstPercent: 18,
          tdsPercent: 0.0,
          modules: buildOtherModules(),
          payments: paymentsFinal.map(toApiPayment),
        },
        {
          id: extraGroup.id || null,
          groupType: GROUP_TYPE_EXTRA,
          discountPercent: extraGroup.discountPercent,
          gstPercent: extraGroup.gstPercent,
          tdsPercent: extraGroup.tdsPercent,
          modules: extraGroup.modules,
          payments: extraGroup.payments,
        },
      ],
    };
  };

  // ---- Save / Update the quotation itself ----
 const handleSaveQuotation = async () => {
    if (!eventId) {
       console.error("Event ID missing.");
      return;
    }

  const payload = buildPayload();
    console.log("[handleSaveQuotation] full payload sent to API:", JSON.stringify(payload, null, 2));

    setSaving(true);
    try {
          const response = await updateehibition(quotationId, payload);
          console.log("[handleSaveQuotation] API response:", response);
       const success = response?.data?.success ?? response?.success;
       const message = response?.data?.msg ?? response?.msg ?? "Something went wrong.";
       if (success) {
         Swal.fire({
           icon: "success",
           title: "Success",
           text: message,
         });
         const savedId = response?.data?.data?.id ?? response?.data?.id;

         if (savedId) setQuotationId(savedId);
         await fetchExistingQuotation();
       } else {
        console.error(message);
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: message,
        });
      }
    } catch (err) {
      console.error("Error saving exhibition quotation:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.msg || err?.message || "Something went wrong while saving.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen font-sans text-slate-800">
      <ExtraQuotationModal
        open={isExtraQuotationOpen}
        onClose={() => setIsExtraQuotationOpen(false)}
        group={extraGroup}
        sectionLabel={eventNameDisplay}
        onSave={setExtraGroup}
      />
      <SetupModal
        open={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        eventId={eventId}
        userId={userId}
      />
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

  <button onClick={() => setIsExtraQuotationOpen(true)} className="border border-slate-200 rounded-lg px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5">
    <FilePlus2 size={14} />
    Extra Quotation
  </button>

  <button
    onClick={() => setIsSetupOpen(true)}
    className="border border-slate-200 rounded-lg px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5 hover:bg-slate-50 transition-colors"
  >
    <Settings size={14} />
    Setup
  </button>

  <button className="border border-slate-200 rounded-lg px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5">
    <Printer size={14} />
    Print
  </button>

  <button
    onClick={handleSaveQuotation}
    disabled={saving}
    className="bg-primary text-white rounded-lg px-3 py-1.5 text-[13px] font-medium flex items-center gap-1.5 disabled:opacity-60"
  >
    <Save size={14} />
    {saving ? "Saving..." : "Save"}
  </button>

</div>
      </div>

      <div className="mx-auto px-4 pb-10 pt-4">
        {/* Event info */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5">
          <div className="flex justify-between items-center flex-wrap gap-2.5">
            <div>
              <div className="text-[11px] text-slate-500 tracking-wide">EVENT NAME</div>
              <div className="text-xl font-bold mt-0.5">
                {eventInfoLoading ? "Loading..." : eventNameDisplay}
              </div>
            </div>
            <div className="flex gap-2">

  

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
    ["Party Name", partyName, User],
    ["Venue Name", venueName, MapPin],
    ["Event Date", eventDateDisplay, Calendar],
    ["Mobile Number", mobileNumber, Phone],
    ["Quotation Date", quotationDate, Calendar],
  ].map(([label, value, Icon]) => (
    <div key={label}>

      <div className="text-[11px] text-slate-500 flex items-center gap-1">
        <Icon size={12} className="text-slate-400" />
        {label}
      </div>

      {label === "Quotation Date" ? (
        <DatePicker
          value={quotationDate ? dayjs(quotationDate, [DATE_FORMAT, "YYYY-MM-DD"], true) : null}
          format={DATE_FORMAT}
          placeholder="Select quotation date"
          allowClear={false}
          className="mt-0.5"
          style={{ width: "100%" }}
          onChange={(_, dateString) => setQuotationDate(dateString)}
        />
      ) : (
        <div className="text-[13.5px] font-semibold mt-0.5">
          {eventInfoLoading ? "Loading..." : value}
        </div>
      )}

    </div>
  ))}

</div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
            <div>
              <div className="text-[11px] text-slate-500 mb-0.5">Billing Name</div>
              <input
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13.5px]"
                value={billingName}
                onChange={(e) => setBillingName(e.target.value)}
              />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 mb-0.5">GST Number</div>
              <input
                className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13.5px]"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
              />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 mb-0.5">Due Date</div>
              <DatePicker
                value={dueDate ? dayjs(dueDate, DATE_FORMAT) : null}
                format={DATE_FORMAT}
                placeholder="Select due date"
                allowClear={false}
                style={{ width: "100%" }}
                onChange={(_, dateString) => setDueDate(dateString)}
              />
            </div>
            <div>
              <div className="text-[11px] text-slate-500 mb-0.5">Quotation Code</div>
              <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-2 text-[13.5px] font-medium text-slate-700">
                {quotationCode || "—"}
              </div>
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
      tdsPercent={tdsPercent}
      onTdsPercentChange={setTdsPercent}
      discountPercent={estimate.discountPercent ?? 0.0}
      onDiscountPercentChange={(val) => updateEstimateField(estimate.id, "discountPercent", val)}
      cgstPercent={estimate.cgstPercent ?? 2.5}
      onCgstPercentChange={(val) => updateEstimateField(estimate.id, "cgstPercent", val)}
      sgstPercent={estimate.sgstPercent ?? 2.5}
      onSgstPercentChange={(val) => updateEstimateField(estimate.id, "sgstPercent", val)}
      igstPercent={estimate.igstPercent ?? 0}
      onIgstPercentChange={(val) => updateEstimateField(estimate.id, "igstPercent", val)}
      roundOff={estimate.roundOff ?? 0}
      onRoundOffChange={(val) => updateEstimateField(estimate.id, "roundOff", val)}
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
      <span>Total GST (CGST + SGST + IGST)</span>
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

        {/* Payment Details — Section 02's own advance payments, against the
            Section 01 combined grand total */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 mt-3">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-[13px]">
                <Wallet size={15} />
                Payment Details
              </div>
              <div className="text-[10.5px] text-slate-400 mt-0.5 ml-5">Advance against the combined grand total above</div>
            </div>
            <button
              onClick={mainPayments.add}
              className="bg-primary text-white rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1 hover:bg-blue-700"
            >
              <Plus size={13} />
              Add Advance Payment
            </button>
          </div>

          {paymentsMain.length === 0 && (
            <div className="text-center text-slate-400 text-[12.5px] py-4">No advance payments added yet.</div>
          )}

          {paymentsMain.map((p) => (
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
                      onChange={(e) => mainPayments.update(p.id, "amount", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-0.5">Payment Mode:</div>
                  <select
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13.5px] bg-white"
                    value={p.mode}
                    onChange={(e) => mainPayments.update(p.id, "mode", e.target.value)}
                  >
                    <option>Bank Transfer (RTGS/NEFT)</option>
                    <option>UPI</option>
                    <option>Cash</option>
                    <option>Cheque</option>
                    <option>Other</option>
                    <option>Card</option>
                  </select>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-0.5">Payment Date &amp; Time:</div>
                  <DatePicker
                    showTime={{ format: "hh:mm A" }}
                    format={DATE_TIME_FORMAT}
                    value={p.dateTime ? dayjs(p.dateTime, DATE_TIME_FORMAT) : null}
                    placeholder="Select date & time"
                    allowClear={false}
                    suffixIcon={<Clock size={14} className="text-slate-400" />}
                    style={{ width: "100%" }}
                    onChange={(_, dateString) => mainPayments.update(p.id, "dateTime", dateString)}
                  />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-0.5">Payment Description:</div>
                  <input
                    type="text"
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13.5px]"
                    value={p.description}
                    onChange={(e) => mainPayments.update(p.id, "description", e.target.value)}
                    placeholder="Ref: ..."
                  />
                </div>
              </div>

              <button
                onClick={() => mainPayments.remove(p.id)}
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
          <span className="font-bold text-green-600 text-[15px]">{money(totalPaidMain)}</span>
        </div>

        <div className="flex justify-between items-center bg-red-50 border border-red-200 rounded-xl px-3.5 py-3 mt-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center flex-none">
              <Bell size={14} />
            </div>
            <div>
              <div className="text-[13.5px] font-semibold text-red-600">Remaining Payment Due</div>
              <div className="text-[11px] text-slate-500">
                Grand Total ({money(combinedGrandTotal)}) minus Advance Paid ({money(totalPaidMain)})
              </div>
            </div>
          </div>
          <span className="font-bold text-red-600 text-[15px]">{money(remainingMain)}</span>
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

  {/* Payment Details — Section 04's own advance payments, against the
      final combined grand total (Section 01 + Section 03) */}
  <div className="bg-white border border-slate-200 rounded-xl m-2 p-3.5 mt-3">
    <div className="flex justify-between items-center mb-3">
      <div>
        <div className="flex items-center gap-2 text-primary font-bold text-[13px]">
          <Wallet size={15} />
          Payment Details
        </div>
        <div className="text-[10.5px] text-slate-400 mt-0.5 ml-5">Advance against the final combined grand total</div>
      </div>
      <button
        onClick={finalPayments.add}
        className="bg-primary text-white rounded-full px-3 py-1.5 text-xs font-semibold flex items-center gap-1 hover:bg-blue-700"
      >
        <Plus size={13} />
        Add Advance Payment
      </button>
    </div>

    {paymentsFinal.length === 0 && (
      <div className="text-center text-slate-400 text-[12.5px] py-4">No advance payments added yet.</div>
    )}

    {paymentsFinal.map((p) => (
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
                onChange={(e) => finalPayments.update(p.id, "amount", e.target.value)}
              />
            </div>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 mb-0.5">Payment Mode:</div>
            <select
              className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13.5px] bg-white"
              value={p.mode}
              onChange={(e) => finalPayments.update(p.id, "mode", e.target.value)}
            >
              <option>Bank Transfer (RTGS/NEFT)</option>
              <option>UPI</option>
              <option>Cash</option>
              <option>Cheque</option>
              <option>Other</option>
              <option>Card</option>
            </select>
          </div>
          <div>
            <div className="text-[11px] text-slate-500 mb-0.5">Payment Date &amp; Time:</div>
            <DatePicker
              showTime={{ format: "hh:mm A" }}
              format={DATE_TIME_FORMAT}
              value={p.dateTime ? dayjs(p.dateTime, DATE_TIME_FORMAT) : null}
              placeholder="Select date & time"
              allowClear={false}
              suffixIcon={<Clock size={14} className="text-slate-400" />}
              style={{ width: "100%" }}
              onChange={(_, dateString) => finalPayments.update(p.id, "dateTime", dateString)}
            />
          </div>
          <div>
            <div className="text-[11px] text-slate-500 mb-0.5">Payment Description:</div>
            <input
              type="text"
              className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-[13.5px]"
              value={p.description}
              onChange={(e) => finalPayments.update(p.id, "description", e.target.value)}
              placeholder="Ref: ..."
            />
          </div>
        </div>

        <button
          onClick={() => finalPayments.remove(p.id)}
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
    <span className="font-bold text-green-600 text-lg">{money(totalPaidFinal)}</span>
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
          Grand Total ({money(finalGrandTotal)}) minus Advance Paid ({money(totalPaidFinal)})
        </div>
      </div>
    </div>
    <span className="font-bold text-red-600 text-lg">{money(remainingFinal)}</span>
  </div>      
  </div>        
</div>          
    
  );
}
