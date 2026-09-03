import { useState, useEffect, useCallback, useRef } from "react";
import { usePermission } from "../../../hooks/usePermission";
import DateRangePicker from "../../../components/form-inputs/DatePicker/Daterangepicker";
import SimpleExpenseForm from "../../../partials/modals/add-super-expense/Simpleexpenseform";
import { JustTabModal } from "../../../partials/modals/add-super-expense/Justtabform";
import ComplexExpenseForm from "../../../partials/modals/add-super-expense/Complexexpenseform";
import UserExpenseDrawer from "../../../partials/modals/add-super-expense/Userexpensedrawer";
import RecordExpensepayoutModal from "../../../partials/modals/add-payout-expense/RecordExpensepayoutModal"; // adjust path
import { TableComponent } from "@/components/table/TableComponent";
import { columns, simpleColumns } from "./constant";
import { toAbsoluteUrl } from "@/utils";
import Swal from "sweetalert2";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Modal } from "antd";
import {
  GEtEmployeeExpensebytype,
  GEtEmpofficeExpensebytype,
  DeleteEmployeeExpenseoffice,
  DeleteEmployeeExpenseTrip,
  GETtripexpenseById,
  GETofficeexpenseById,
  updatepayoutforoffice,
  updatepayoutforTrip,
  Fetchmanager,
  GETALLexpense,
  GenratsupereexpenseReport,
} from "@/services/apiServices";
import useCloseDate from "@/hooks/useCloseDate";

const SIMPLE_TYPES = ["employees", "office", "serve", "other"];

const ALL_TABS = [
  { key: "all", label: "All Expenses" },
  { key: "trip", label: "Trip Expenses" },
  { key: "employees", label: "Employees Expenses" },
  { key: "office", label: "Office Expenses" },
  { key: "serve", label: "Server Expenses" },
  { key: "justtab", label: "Just Tab" },
  { key: "socialmedia", label: "Social Media" },
  { key: "other", label: "Other Expenses" },
];

const RESTRICTED_TABS = [{ key: "trip", label: "Trip Expenses" }];

// ─── Date Utilities ───────────────────────────────────────────────────────────
export const formatDate = (raw) => {
  if (!raw) return "";
  if (typeof raw !== "string") raw = String(raw);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) return raw;
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : raw;
};

export const toInputDate = (raw) => {
  if (!raw) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(raw)) {
    const [d, m, y] = raw.split("/");
    return `${y}-${m}-${d}`;
  }
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
};

const dateToDMY = (date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${date.getFullYear()}`;
};

const dmyToDate = (str) => {
  if (!str) return new Date();
  const [d, m, y] = str.split("/");
  return new Date(Number(y), Number(m) - 1, Number(d));
};

const getDateRange = (closeDateStr, startDateStr) => {
  const endDate = closeDateStr || dateToDMY(new Date());
  const startDate =
    startDateStr ||
    (() => {
      const s = dmyToDate(endDate);
      s.setMonth(s.getMonth() - 1);
      return dateToDMY(s);
    })();
  return { startDate, endDate };
};

const CollapsibleSection = ({
  title,
  dotColor,
  count,
  totalAmount,
  paidAmount,
  remainingAmount,
  children,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-4">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
          <div>
            <h3 className="text-sm font-bold text-gray-900">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {count} record{count !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-sm font-bold text-gray-900">
              ₹{totalAmount.toLocaleString()}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Paid</p>
            <p className="text-sm font-bold text-emerald-600">
              ₹{paidAmount.toLocaleString()}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Remaining</p>
            <p className="text-sm font-bold text-red-500">
              ₹{remainingAmount.toLocaleString()}
            </p>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      {open && <div className="border-t border-gray-100">{children}</div>}
    </div>
  );
};

const IconPlus = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);
const IconDoc = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
    />
  </svg>
);
const IconSearch = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
    />
  </svg>
);
const IconChevron = () => (
  <svg
    className="w-4 h-4 text-gray-400 pointer-events-none"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const Spinner = ({ className = "w-4 h-4" }) => (
  <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
  </svg>
);

const ExpenseSubTable = ({ rows, columns }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50/80">
        <tr>
          {columns.map((c) => (
            <th
              key={c}
              className="px-4 py-2.5 text-left text-xs font-semibold text-black uppercase tracking-wide"
            >
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={row.id ?? i}
            className="border-t border-gray-100 hover:bg-blue-50/30 transition-colors"
          >
            {row.cells.map((cell, j) => (
              <td key={j} className="px-4 py-2.5 text-sm text-gray-700">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const MemberRow = ({ member, formatDate }) => {
  const [open, setOpen] = useState(false);
  const typeColors = {
    trip: "bg-blue-100 text-blue-700",
    employees: "bg-purple-100 text-purple-700",
    office: "bg-amber-100 text-amber-700",
    other: "bg-rose-100 text-rose-700",
  };
  const tripRows = (member.tripExpenses ?? []).map((e) => ({
    id: e.id,
    cells: [
      <span className="text-gray-500 text-xs">{e.remark || "-"}</span>,
      e.title,
      `₹${(e.totalAmount ?? 0).toLocaleString()}`,
      <span className="text-emerald-600 font-medium">
        ₹{(e.payoutAmount ?? 0).toLocaleString()}
      </span>,
      <span className="text-red-500 font-medium">
        ₹{(e.remaingAmount ?? 0).toLocaleString()}
      </span>,
      formatDate(e.fromDate),
      formatDate(e.toDate),
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-lg capitalize ${e.isPayout === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
      >
        {e.isPayout}
      </span>,
    ],
  }));
  const employeeRows = (member.employeeExpenses ?? []).map((e) => ({
    id: e.id,
    cells: [
      <span className="text-gray-500 text-xs">{e.remarks || "-"}</span>,
      `₹${(e.expenseAmount ?? 0).toLocaleString()}`,
      <span className="text-emerald-600 font-medium">
        ₹{(e.payoutAmount ?? 0).toLocaleString()}
      </span>,
      <span className="text-red-500 font-medium">
        ₹{(e.remaingAmount ?? 0).toLocaleString()}
      </span>,
      formatDate(e.expenseDate),
      e.paymentMode,
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-lg capitalize ${e.isPayout === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
      >
        {e.isPayout}
      </span>,
    ],
  }));
  const otherRows = (member.otherExpenses ?? []).map((e) => ({
    id: e.id,
    cells: [
      <span className="text-gray-500 text-xs">{e.remarks || "-"}</span>,
      `₹${(e.expenseAmount ?? 0).toLocaleString()}`,
      <span className="text-emerald-600 font-medium">
        ₹{(e.payoutAmount ?? 0).toLocaleString()}
      </span>,
      <span className="text-red-500 font-medium">
        ₹{(e.remaingAmount ?? 0).toLocaleString()}
      </span>,
      formatDate(e.expenseDate),
      e.paymentMode,
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-lg capitalize ${e.isPayout === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
      >
        {e.isPayout}
      </span>,
    ],
  }));
  const simpleColumnDefs = [
    "Remarks",
    "Amount",
    "Paid",
    "Remaining",
    "Date",
    "Mode",
    "Status",
  ];
  const tripColumnDefs = [
    "Remarks",
    "Title",
    "Amount",
    "Paid",
    "Remaining",
    "From",
    "To",
    "Status",
  ];
  const sections = [
    {
      key: "trip",
      label: "Trip",
      rows: tripRows,
      cols: tripColumnDefs,
      color: "blue",
    },
    {
      key: "employee",
      label: "Employee",
      rows: employeeRows,
      cols: simpleColumnDefs,
      color: "purple",
    },
    {
      key: "other",
      label: "Other",
      rows: otherRows,
      cols: simpleColumnDefs,
      color: "rose",
    },
  ].filter((s) => s.rows.length > 0);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
            {member.memberName?.charAt(0) ?? "?"}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              {member.memberName}
            </p>
            <p className="text-xs text-black mt-0.5">
              {sections.map((s) => `${s.rows.length} ${s.label}`).join(" · ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-sm font-bold text-gray-900">
              ₹{(member.totalAmount ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Paid</p>
            <p className="text-sm font-bold text-emerald-600">
              ₹{(member.totalPaidAmount ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Remaining</p>
            <p className="text-sm font-bold text-red-500">
              ₹{(member.totalUnPaidAmount ?? 0).toLocaleString()}
            </p>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      {open && (
        <div className="border-t border-gray-100 bg-gray-50/40">
          {sections.map((section) => (
            <div key={section.key} className="mb-2 last:mb-0">
              <div className="px-6 py-2 flex items-center gap-2">
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-md ${typeColors[section.key] ?? "bg-gray-100 text-gray-600"}`}
                >
                  {section.label}
                </span>
                <span className="text-xs text-gray-400">
                  {section.rows.length} record
                  {section.rows.length !== 1 ? "s" : ""}
                </span>
              </div>
              <ExpenseSubTable rows={section.rows} columns={section.cols} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TripMemberRow = ({
  memberName,
  exps,
  total,
  paid,
  remaining,
  formatDate,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
            {memberName?.charAt(0) ?? "?"}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{memberName}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {exps.length} trip{exps.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Total</p>
            <p className="text-sm font-bold text-gray-900">
              ₹{total.toLocaleString()}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Paid</p>
            <p className="text-sm font-bold text-emerald-600">
              ₹{paid.toLocaleString()}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-gray-400">Remaining</p>
            <p className="text-sm font-bold text-red-500">
              ₹{remaining.toLocaleString()}
            </p>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>
      {open && (
        <div className="border-t border-gray-100 bg-gray-50/40 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "#",
                  "Title",
                  "Amount",
                  "Paid",
                  "Remaining",
                  "From",
                  "To",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-semibold text-black uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exps.map((exp, i) => (
                <tr
                  key={exp.id}
                  className="border-t border-gray-100 hover:bg-blue-50/30"
                >
                  <td className="px-4 py-2.5 text-sm text-gray-500">{i + 1}</td>
                  <td className="px-4 py-2.5 text-sm font-semibold text-gray-800">
                    {exp.title}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-700">
                    ₹{(exp.totalAmount ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-emerald-600 font-medium">
                    ₹{(exp.payoutAmount ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-red-500 font-medium">
                    ₹{(exp.remaingAmount ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-500">
                    {formatDate(exp.fromDate)}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-gray-500">
                    {formatDate(exp.toDate)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-lg capitalize ${exp.isPayout === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
                    >
                      {exp.isPayout}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const monthShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const YearMonthPicker = ({
  selectedYear,
  selectedMonth,
  onSelect,
  onClose,
}) => {
  const [decadeStart, setDecadeStart] = useState(
    Math.floor(selectedYear / 12) * 12,
  );
  const [view, setView] = useState("year");
  const [pickedYear, setPickedYear] = useState(selectedYear);
  const years = Array.from({ length: 12 }, (_, i) => decadeStart + i);
  return (
    <div
      className="absolute top-12 left-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-72"
      onClick={(e) => e.stopPropagation()}
    >
      {view === "year" ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setDecadeStart((d) => d - 12)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 border-0 bg-transparent cursor-pointer text-lg"
            >
              ‹
            </button>
            <span className="text-sm font-bold text-gray-700">
              {decadeStart}–{decadeStart + 11}
            </span>
            <button
              type="button"
              onClick={() => setDecadeStart((d) => d + 12)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 border-0 bg-transparent cursor-pointer text-lg"
            >
              ›
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {years.map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setPickedYear(y);
                  setView("month");
                }}
                className={`py-2 rounded-xl text-sm font-semibold transition border-0 cursor-pointer ${y === selectedYear ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
              >
                {y}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setView("year")}
              className="text-sm font-bold text-gray-700 hover:text-blue-600 border-0 bg-transparent cursor-pointer flex items-center gap-1"
            >
              ← {pickedYear}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {monthNames.map((m, i) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  onSelect(i, pickedYear);
                  onClose();
                }}
                className={`py-2 rounded-xl text-sm font-semibold transition border-0 cursor-pointer ${i === selectedMonth && pickedYear === selectedYear ? "bg-primary text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
              >
                {m.slice(0, 3)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const AllExpense = () => {
  const userId = Number(localStorage.getItem("mainId"));
  const isSuperAdmin = userId === 1;
  const expenseTabs = isSuperAdmin ? ALL_TABS : RESTRICTED_TABS;

  const [activeTab, setActiveTab] = useState(isSuperAdmin ? "all" : "trip");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalKey, setModalKey] = useState(0);
  const [summary, setSummary] = useState({
    total_expense: 0,
    paid_expense: 0,
    remaing_expense: 0,
  });
  const [managers, setManagers] = useState([]);
  const [selectedManagerId, setSelectedManagerId] = useState("all");
  const [managersLoading, setManagersLoading] = useState(false);

  const [filterMode, setFilterMode] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const [closeDate, setCloseDate] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [closeDayOfMonth, setCloseDayOfMonth] = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);
  const [allExpenseSummary, setAllExpenseSummary] = useState(null);
  const [allExpenseLoading, setAllExpenseLoading] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfPlugin = defaultLayoutPlugin();
  const permissions = usePermission("Expense");
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutModalData, setPayoutModalData] = useState(null);
  const [justTabModalOpen, setJustTabModalOpen] = useState(false);
  const {
    monthCloseDates,
    isLoading: closeDateLoading,
    saveCloseDate,
    isSaving,
    refetch: refetchCloseDates,
  } = useCloseDate(selectedMonth, selectedYear);

  const isInitialLoad = useRef(true);
  const isSimple = SIMPLE_TYPES.includes(activeTab);
  const currentTab = expenseTabs.find((t) => t.key === activeTab);

  const getClosePeriodForMonth = (monthIndex, year) => {
    const key = `${year}-${monthIndex + 1}`;
    const entry = monthCloseDates[key];
    if (!entry?.startDate || !entry?.closeDate) return null; // ← no fallback
    return {
      start: dmyToDate(formatDate(entry.startDate)),
      end: dmyToDate(formatDate(entry.closeDate)),
    };
  };

  const getPeriodLabel = (monthIndex, year) => {
    const key = `${year}-${monthIndex + 1}`;
    const entry = monthCloseDates[key];
    if (!entry?.startDate || !entry?.closeDate) return "";
    const start = dmyToDate(formatDate(entry.startDate));
    const end = dmyToDate(formatDate(entry.closeDate));
    const fmt = (d) => `${d.getDate()} ${monthShort[d.getMonth()]}`;
    return `${fmt(start)} → ${fmt(end)}`;
  };

  const getMonthStatus = (index) => {
    if (activeMonth === null) return "";
    if (index === activeMonth) return "active";
    if (index < activeMonth) return "locked";
    return "upcoming";
  };

  useEffect(() => {
    if (closeDateLoading || Object.keys(monthCloseDates).length === 0) return;
    if (!isInitialLoad.current) return;

    const today = new Date();

    let activeEntry = null;
    for (const entry of Object.values(monthCloseDates)) {
      if (!entry.startDate || !entry.closeDate) continue;
      const start = dmyToDate(formatDate(entry.startDate));
      const end = dmyToDate(formatDate(entry.closeDate));
      if (today >= start && today <= end) {
        activeEntry = entry;
        break;
      }
    }

    if (!activeEntry) {
      let smallest = Infinity;
      for (const entry of Object.values(monthCloseDates)) {
        if (!entry.startDate || !entry.closeDate) continue;
        const diff = Math.abs(dmyToDate(formatDate(entry.startDate)) - today);
        if (diff < smallest) {
          smallest = diff;
          activeEntry = entry;
        }
      }
    }

    if (!activeEntry) return;

    const monthIdx = activeEntry.monthIndex;
    const apiYear = parseInt(activeEntry.key.split("-")[0], 10);

    setSelectedMonth(monthIdx);
    setSelectedYear(apiYear);
    setActiveMonth(monthIdx);
    setCloseDate(formatDate(activeEntry.closeDate));
    setStartDate(formatDate(activeEntry.startDate));
    setCloseDayOfMonth(activeEntry.closeDay);

    const range = {
      startDate: formatDate(activeEntry.startDate),
      endDate: formatDate(activeEntry.closeDate),
    };

    isInitialLoad.current = false;

    if (activeTab === "all") fetchAllExpenses(range);
    else fetchExpenses(activeTab, selectedManagerId, null, range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeDateLoading, monthCloseDates]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    const fetchManagers = async () => {
      setManagersLoading(true);
      try {
        const res = await Fetchmanager(1);
        const userDetails = res?.data?.data?.userDetails ?? [];
        setManagers(
          userDetails.map((man) => ({
            id: man.id,
            name:
              man.firstName ||
              man.fullName ||
              man.username ||
              `Manager #${man.id}`,
          })),
        );
      } catch (err) {
        console.error("Failed to fetch managers:", err);
        setManagers([]);
      } finally {
        setManagersLoading(false);
      }
    };
    fetchManagers();
  }, [isSuperAdmin]);

  const fetchAllExpenses = useCallback(
    async (explicitRange = null) => {
      setAllExpenseLoading(true);
      try {
        const targetUserId =
          isSuperAdmin && selectedManagerId !== "all"
            ? Number(selectedManagerId)
            : userId;
        const { startDate: sd, endDate: ed } =
          explicitRange ?? getDateRange(closeDate, startDate);
        const res = await GETALLexpense(
          typeof ed === "string" ? ed : null,
          typeof sd === "string" ? sd : null,
          targetUserId,
        );
        setAllExpenseSummary(res?.data?.data ?? {});
      } catch (err) {
        console.error("Failed to fetch all expenses:", err);
        setAllExpenseSummary(null);
      } finally {
        setAllExpenseLoading(false);
      }
    },
    [selectedManagerId, closeDate, startDate, isSuperAdmin, userId],
  );

  const fetchExpenses = useCallback(
    async (
      tab = activeTab,
      managerId = selectedManagerId,
      explicitDate = null,
      explicitRange = null,
    ) => {
      setLoading(true);
      setData([]);
      try {
        const simple = SIMPLE_TYPES.includes(tab);
        const targetUserId =
          isSuperAdmin && managerId !== "all" ? Number(managerId) : userId;
        const { startDate: sd, endDate } =
          explicitRange ?? getDateRange(explicitDate ?? closeDate, startDate);
        const endStr = typeof endDate === "string" ? endDate : null;
        const startStr = typeof sd === "string" ? sd : null;
        const res = simple
          ? await GEtEmpofficeExpensebytype(targetUserId, tab, startStr, endStr)
          : await GEtEmployeeExpensebytype(targetUserId, tab, startStr, endStr);
        const payload = res?.data?.data ?? res?.data ?? {};
        setSummary({
          total_expense: payload.total_expense ?? 0,
          paid_expense: payload.paid_expense ?? 0,
          remaing_expense: payload.remaing_expense ?? 0,
        });
        const raw = payload.data;
        const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
        setData(
          list.map((item, index) => ({
            id: item.id,
            sr_no: index + 1,
            userid: Number(localStorage.getItem("mainId")),
            user: {
              username: item.userName,
              name: item.title,
              role: "",
              email: "",
              phone: "",
              avatar: null,
            },
            amount: item.totalAmount ?? item.expenseAmount ?? 0,
            status: item.status ?? item.isPayout ?? "Unpaid",
            remarks: item.remark ?? item.remarks ?? "",
            startDate: formatDate(item.fromDate ?? item.expenseDate),
            dueDate: formatDate(item.dueDate),
            totalAmount: item.totalAmount ?? item.expenseAmount ?? 0,
            paidAmount: item.payoutAmount ?? item.paidAmount ?? 0,
            remainingAmount: item.remaingAmount ?? 0,
            transactions: item.detailRequestDtos ?? [],
            fromCityId: item.fromCityId,
            toCityId: item.toCityId,
            toDate: formatDate(item.toDate),
            expenseType: item.expenseType,
            memberId: item.memberId,
            userName: item.userName,
          })),
        );
      } catch (err) {
        console.error("Failed to fetch expenses:", err);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    [activeTab, selectedManagerId, closeDate, startDate, isSuperAdmin, userId],
  );

  useEffect(() => {
    if (isInitialLoad.current) return;
    if (!startDate || !closeDate) return;
    const range = { startDate, endDate: closeDate };
    if (activeTab === "all") fetchAllExpenses(range);
    else fetchExpenses(activeTab, selectedManagerId, null, range);
  }, [activeTab]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    if (!startDate || !closeDate) return;
    const range = { startDate, endDate: closeDate };
    if (activeTab === "all") fetchAllExpenses(range);
    else fetchExpenses(activeTab, selectedManagerId, null, range);
  }, [selectedManagerId]);

  const handleMonthClick = (index) => {
    setSelectedMonth(index);
    setFilterMode("month");
    isInitialLoad.current = false;

    const key = `${selectedYear}-${index + 1}`;
    const monthData = monthCloseDates[key];

    if (monthData?.closeDate) {
      const fEnd = formatDate(monthData.closeDate);
      const fStart = monthData.startDate
        ? formatDate(monthData.startDate)
        : null;
      setCloseDate(fEnd);
      setStartDate(fStart);
      setCloseDayOfMonth(monthData.closeDay);
      const range = { startDate: fStart, endDate: fEnd };
      if (activeTab === "all") fetchAllExpenses(range);
      else fetchExpenses(activeTab, selectedManagerId, null, range);
    } else {
      console.warn(`No close date configured for key: ${key}`);
      const start = new Date(selectedYear, index, 1);
      const end = new Date(selectedYear, index + 1, 0);
      const range = { startDate: dateToDMY(start), endDate: dateToDMY(end) };
      if (activeTab === "all") fetchAllExpenses(range);
      else fetchExpenses(activeTab, selectedManagerId, null, range);
    }
  };

  const handleCloseDateChange = (dmy_start, dmy_end) => {
    saveCloseDate(
      { startDate: dmy_start, endDate: dmy_end },
      {
        onSuccess: () => {
          setStartDate(dmy_start);
          setCloseDate(dmy_end);
          setFilterMode("month");

          const range = { startDate: dmy_start, endDate: dmy_end };
          if (activeTab === "all") fetchAllExpenses(range);
          else fetchExpenses(activeTab, selectedManagerId, null, range);

          Swal.fire({
            title: "Updated!",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        },
        onError: () => {
          Swal.fire({
            title: "Failed!",
            text: "Could not update the close date.",
            icon: "error",
          });
        },
      },
    );
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const validDoc = (url) =>
    url && !url.endsWith("null") && !url.endsWith("undefined") ? url : null;

  const handleEdit = async (row) => {
    setEditLoading(true);
    try {
      if (isSimple) {
        const { data: res } = await GETofficeexpenseById(row.id);
        const d = res?.data ?? {};
        setEditData({
          id: d.id ?? row.id,
          remarks: d.remarks ?? "",
          title: d.title ?? "-",
          employeeName: d.title ?? "",
          officeName: d.title ?? "",
          serveName: d.title ?? "",
          expenseDate: toInputDate(d.expenseDate),
          amount: d.expenseAmount ?? "",
          paidDate: toInputDate((d.paidDate ?? "").split(" ")[0]),
          dueDate: toInputDate(d.dueDate),
          paymentMethod: d.paymentMode ?? "gpay",
          remark: d.remark ?? "",
          billFile: null,
          existingDocUrl: validDoc(d.docPath),
          employeeId: d.userId ?? null,
        });
      } else {
        const { data: res } = await GETtripexpenseById(row.id);
        const d = res?.data ?? {};
        setEditData({
          id: d.id ?? row.id,
          title: d.title ?? "-",
          tripName: d.title ?? "",
          otherName: d.title ?? "",
          startDate: toInputDate(d.fromDate),
          endDate: toInputDate(d.toDate),
          dueDate: toInputDate(d.dueDate),
          fromCity: d.fromCityId ?? null,
          toCity: d.toCityId ?? null,
          amount: d.totalAmount ?? "",
          remark: d.remark ?? "",
          isPayout: d.status ?? "",
          memberId: d.memberId ?? null,
          expenseRows: (d.detailRequestDtos ?? []).map((tx) => ({
            id: tx.id ?? -1,
            expenseId: tx.expenseId ?? d.id ?? -1,
            date: toInputDate(tx.expenseDate),
            description: tx.perticular ?? "",
            paymentMode: tx.paymentMode ?? "gpay",
            amount: tx.amount ?? "",
            remarks: tx.remarks ?? "",
            file: null,
            km: tx.km ?? "",
            existingDocUrl: validDoc(tx.docPath),
          })),
        });
      }
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch expense for edit:", err);
      Swal.fire({
        title: "Failed!",
        text: "Could not load expense details. Please try again.",
        icon: "error",
        confirmButtonColor: "#1d4ed8",
        customClass: { popup: "!rounded-2xl", confirmButton: "!rounded-xl" },
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditData(null);
    fetchExpenses(activeTab, selectedManagerId);
  };

  const handleUserClick = async (row) => {
    try {
      if (isSimple) {
        const { data: res } = await GETofficeexpenseById(row.id);
        const d = res?.data ?? null;
        setSelectedUser({
          name: d?.title ?? row.user?.name ?? "Unknown",
          role: d?.expenseType ?? "",
          username: null,
          email: null,
          phone: null,
          avatar: null,
          totalAmount: d?.expenseAmount ?? 0,
          paidAmount: d?.payoutAmount ?? 0,
          remainingAmount: d?.remaingAmount ?? 0,
          transactions: d
            ? [
                {
                  date: formatDate(d.expenseDate),
                  type: d.paymentMode ?? "",
                  particular: d.title ?? "",
                  amount: d.expenseAmount ?? 0,
                  status: d.status ?? "Pending",
                  docUrl: d.docPath ?? null,
                },
              ]
            : [],
        });
      } else {
        const { data: res } = await GETtripexpenseById(row.id);
        const d = res?.data ?? null;
        setSelectedUser({
          name: d?.title ?? row.user?.name ?? "Unknown",
          role: d?.expenseType ?? "",
          username: null,
          email: null,
          phone: null,
          avatar: null,
          totalAmount: d?.totalAmount ?? 0,
          paidAmount: d?.payoutAmount ?? 0,
          remainingAmount: d?.remaingAmount ?? 0,
          transactions: (d?.detailRequestDtos ?? []).map((tx) => ({
            date: formatDate(tx.expenseDate),
            type: tx.paymentMode ?? "",
            particular: tx.perticular ?? "",
            amount: tx.amount ?? 0,
            status: tx.status ?? "Pending",
            docUrl: tx.docPath ?? null,
            km: tx.km ?? "-",
          })),
        });
      }
    } catch (err) {
      console.error("Failed to fetch expense detail:", err);
      setSelectedUser({
        name: row.user?.name ?? "Unknown",
        role: "",
        username: null,
        email: null,
        phone: null,
        avatar: null,
        totalAmount: row.totalAmount ?? 0,
        paidAmount: row.paidAmount ?? 0,
        transactions: row.transactions ?? [],
      });
    }
    setDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "This expense will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1d4ed8",
      cancelButtonColor: "#e5e7eb",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "!rounded-2xl",
        confirmButton: "!rounded-xl",
        cancelButton: "!rounded-xl",
      },
    });
    if (!isConfirmed) return;
    try {
      isSimple
        ? await DeleteEmployeeExpenseoffice(id)
        : await DeleteEmployeeExpenseTrip(id);
      setData((prev) => prev.filter((item) => item.id !== id));
      Swal.fire({
        title: "Deleted!",
        text: "Expense deleted successfully.",
        icon: "success",
        confirmButtonColor: "#1d4ed8",
        customClass: { popup: "!rounded-2xl", confirmButton: "!rounded-xl" },
      });
    } catch {
      Swal.fire({
        title: "Failed!",
        text: "Something went wrong.",
        icon: "error",
        confirmButtonColor: "#1d4ed8",
        customClass: { popup: "!rounded-2xl", confirmButton: "!rounded-xl" },
      });
    }
  };

  const handleStatusChange = (id, currentStatus) =>
    setData((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: currentStatus === "Paid" ? "Pending" : "Paid" }
          : item,
      ),
    );

  const handleOpenPayoutModal = (row) => {
    setPayoutModalData({
      customerName: row.user?.username ?? row.user?.name ?? row.userName ?? "—",
      invoiceRef: `EXP-${row.id}`,
      receivable: row.remainingAmount ?? 0,
      description: row.remarks ?? "",
      userId: row.userid,
      expenseId: row.id,
    });
    setPayoutModalOpen(true);
  };

  const handlePayout = async (id, payoutType, payoutAmount) => {
    try {
      isSimple
        ? await updatepayoutforoffice(id, payoutType, payoutAmount)
        : await updatepayoutforTrip(id, payoutType, payoutAmount);
      setData((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: payoutType,
                paidAmount:
                  payoutType === "Paid"
                    ? item.amount
                    : payoutType === "Unpaid"
                      ? 0
                      : Number(payoutAmount),
              }
            : item,
        ),
      );
      Swal.fire({
        title: "Payout Updated!",
        text: `Status set to ${payoutType} · ₹${Number(payoutAmount ?? 0).toLocaleString()}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "!rounded-2xl" },
      });
      fetchExpenses(activeTab, selectedManagerId);
    } catch (err) {
      console.error("Payout failed:", err);
      Swal.fire({
        title: "Failed!",
        text: "Payout could not be processed.",
        icon: "error",
        confirmButtonColor: "#1d4ed8",
        customClass: { popup: "!rounded-2xl", confirmButton: "!rounded-xl" },
      });
    }
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExportRow = async (row) => {
    if (!startDate || !closeDate) {
      Swal.fire({
        title: "No date range",
        text: "Please select a month first.",
        icon: "warning",
      });
      return;
    }
    const type = ["trip", "employees", "office", "serve", "other"].includes(
      activeTab,
    )
      ? activeTab
      : "all";
    const targetUserId =
      isSuperAdmin && selectedManagerId !== "all"
        ? Number(selectedManagerId)
        : userId;
    const memberId = row.memberId ?? targetUserId;
    setPdfLoading(true);
    setPdfUrl(null);
    try {
      const res = await GenratsupereexpenseReport({
        startDate,
        endDate: closeDate,
        memberId,
        expenseId: row.id ?? -1,
        type,
      });
      if (res?.data?.report_path) {
        setPdfUrl(res.data.report_path);
        setPdfViewerOpen(true);
        return;
      }
      setPdfUrl(
        URL.createObjectURL(new Blob([res.data], { type: "application/pdf" })),
      );
      setPdfViewerOpen(true);
    } catch (err) {
      console.error("Row PDF export failed:", err);
      Swal.fire({
        title: "Failed!",
        text: "Could not generate the PDF report.",
        icon: "error",
        confirmButtonColor: "#1d4ed8",
        customClass: { popup: "!rounded-2xl", confirmButton: "!rounded-xl" },
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!startDate || !closeDate) {
      Swal.fire({
        title: "No date range",
        text: "Please select a month first.",
        icon: "warning",
      });
      return;
    }
    const type =
      {
        trip: "trip",
        employees: "employees",
        office: "office",
        serve: "serve",
        other: "other",
        all: "all",
      }[activeTab] ?? "all";
    const targetUserId =
      isSuperAdmin && selectedManagerId !== "all"
        ? Number(selectedManagerId)
        : userId;
    setPdfLoading(true);
    setPdfUrl(null);
    try {
      const res = await GenratsupereexpenseReport({
        startDate,
        endDate: closeDate,
        memberId: targetUserId,
        expenseId: -1,
        type,
      });
      if (res?.data?.report_path) {
        setPdfUrl(res.data.report_path);
        setPdfViewerOpen(true);
        return;
      }
      setPdfUrl(
        URL.createObjectURL(new Blob([res.data], { type: "application/pdf" })),
      );
      setPdfViewerOpen(true);
    } catch (err) {
      console.error("PDF generation failed:", err);
      Swal.fire({
        title: "Failed!",
        text: "Could not generate the PDF report.",
        icon: "error",
        confirmButtonColor: "#1d4ed8",
        customClass: { popup: "!rounded-2xl", confirmButton: "!rounded-xl" },
      });
    } finally {
      setPdfLoading(false);
    }
  };

  const handlePdfViewerClose = () => {
    setPdfViewerOpen(false);
    if (pdfUrl?.startsWith("blob:")) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
  };

  const filteredData = data.filter(
    (e) =>
      e.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.remarks?.toLowerCase().includes(search.toLowerCase()),
  );

  const tableColumns = isSimple
    ? simpleColumns(
        handleEdit,
        handleDelete,
        handleStatusChange,
        handlePayout,
        handleUserClick,
        activeTab,
        handleExportRow,
        handleOpenPayoutModal,
      )
    : columns(
        handleEdit,
        handleDelete,
        handleStatusChange,
        handlePayout,
        handleUserClick,
        handleExportRow,
        handleOpenPayoutModal,
      );

  const summaryCards = [
    {
      label: "Total Expenses",
      value: `₹ ${(activeTab === "all" ? (allExpenseSummary?.totalExpenses ?? 0) : summary.total_expense).toLocaleString()}`,
      icon: toAbsoluteUrl("/media/icons/expense4.png"),
      iconBg: "bg-red-50",
    },
    {
      label: "Total Paid",
      value: `₹ ${(activeTab === "all" ? (allExpenseSummary?.totalPaidAmount ?? 0) : summary.paid_expense).toLocaleString()}`,
      icon: toAbsoluteUrl("/media/icons/expense3.png"),
      iconBg: "bg-emerald-50",
    },
    {
      label: "Total Remaining",
      value: `₹ ${(activeTab === "all" ? (allExpenseSummary?.totalUnPaidAmount ?? 0) : summary.remaing_expense).toLocaleString()}`,
      icon: toAbsoluteUrl("/media/icons/expense2.png"),
      iconBg: "bg-blue-50",
    },
  ];

  const allTripExpenses = (allExpenseSummary?.members ?? []).flatMap((m) =>
    (m.tripExpenses ?? []).map((e) => ({ ...e, memberName: m.memberName })),
  );
  const allEmployeeExpenses = (allExpenseSummary?.members ?? []).flatMap((m) =>
    (m.employeeExpenses ?? []).map((e) => ({ ...e, memberName: m.memberName })),
  );
  const allOfficeExpenses = (allExpenseSummary?.members ?? []).flatMap((m) =>
    (m.officeExpenses ?? []).map((e) => ({ ...e, memberName: m.memberName })),
  );
  const allOtherExpenses = (allExpenseSummary?.members ?? []).flatMap((m) =>
    (m.otherExpenses ?? []).map((e) => ({ ...e, memberName: m.memberName })),
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-3 sm:p-6 min-h-screen">
      <div className="grid grid-cols-7 gap-3 mb-2">
        <div className="relative">
          <button
            onClick={() => setShowYearMonthPicker((v) => !v)}
            className="w-full h-full flex items-center justify-center px-2 py-2 rounded-xl bg-primary text-white font-medium text-sm"
          >
            {selectedYear}
          </button>
          {showYearMonthPicker && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowYearMonthPicker(false)}
              />
              <YearMonthPicker
                selectedYear={selectedYear}
                selectedMonth={selectedMonth}
                onClose={() => setShowYearMonthPicker(false)}
                onSelect={(monthIndex, year) => {
                  setSelectedYear(year);
                  setSelectedMonth(monthIndex);
                  setFilterMode("month");
                  setShowYearMonthPicker(false);
                  const { start, end } = getClosePeriodForMonth(
                    monthIndex,
                    year,
                  );
                  const range = {
                    startDate: dateToDMY(start),
                    endDate: dateToDMY(end),
                  };
                  if (activeTab === "all") fetchAllExpenses(range);
                  else fetchExpenses(activeTab, selectedManagerId, null, range);
                }}
              />
            </>
          )}
        </div>

        {monthShort.slice(0, 6).map((month, index) => {
          const isSelected = filterMode === "month" && selectedMonth === index;
          const periodLabel = getPeriodLabel(index, selectedYear);
          return (
            <button
              key={index}
              onClick={() => handleMonthClick(index)}
              className={`relative flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${isSelected ? "bg-[#005BA8] text-white border-[#005BA8]" : "bg-gray-50 text-black border-gray-200 hover:border-[#005BA8] hover:text-[#005BA8]"}`}
            >
              <span className="font-semibold">{month}</span>
              <span
                className={`text-[10px] mt-0.5 ${isSelected ? "text-blue-100" : "text-black"}`}
              >
                {periodLabel}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-7 gap-3 mb-4">
        {isSuperAdmin && (
          <button
            onClick={() => {
              setActiveTab("all");
              setFilterMode("all");
              setSelectedMonth(null);
              isInitialLoad.current = false;

              const yearStart = `01/01/${selectedYear}`;
              const yearEnd = `31/12/${selectedYear}`;

              setStartDate(yearStart);
              setCloseDate(yearEnd);

              const range = { startDate: yearStart, endDate: yearEnd };
              fetchAllExpenses(range);
            }}
            className={`relative flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${
              activeTab === "all"
                ? "bg-[#005BA8] text-white border-[#005BA8]"
                : "bg-gray-50 text-black border-gray-200 hover:border-[#005BA8] hover:text-[#005BA8]"
            }`}
          >
            <span className="font-semibold">All</span>
            <span
              className={`text-[10px] mt-0.5 ${activeTab === "all" ? "text-blue-100" : "text-black"}`}
            >
              1 Jan → 31 Dec {selectedYear}
            </span>
          </button>
        )}

        {/* Jul – Dec */}
        {monthShort.slice(6, 12).map((month, index) => {
          const realIndex = index + 6;
          const isSelected =
            filterMode === "month" && selectedMonth === realIndex;
          const periodLabel = getPeriodLabel(realIndex, selectedYear);
          return (
            <button
              key={realIndex}
              onClick={() => handleMonthClick(realIndex)}
              className={`relative flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${isSelected ? "bg-[#005BA8] text-white border-[#005BA8]" : "bg-gray-50 text-black border-gray-200 hover:border-[#005BA8] hover:text-[#005BA8]"}`}
            >
              <span className="font-semibold">{month}</span>
              <span
                className={`text-[10px] mt-0.5 ${isSelected ? "text-blue-100" : "text-black"}`}
              >
                {closeDayOfMonth != null ? periodLabel : ""}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 mb-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl px-6 py-5 shadow-sm flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 cursor-default"
          >
            <div>
              <p className="text-sm text-gray-400 font-medium mb-1">
                {card.label}
              </p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}
            >
              <img
                src={card.icon}
                alt={card.label}
                className="w-6 h-6 object-contain"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          </div>
        ))}

        {/* Close date card */}
        {isSuperAdmin && permissions?.view && (
          <div
            className="bg-white rounded-2xl px-3 py-5 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 cursor-pointer relative"
            onClick={() => setShowDatePicker(true)}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-400 font-medium">
                Month Close Date
              </p>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-400 mb-0.5">Start</p>
                <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                  {isSaving ? "Saving…" : (startDate ?? "dd/mm/yyyy")}
                </p>
              </div>
              <svg className="w-4 h-4 text-gray-300 flex-shrink-0" />
              <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
                <p className="text-xs text-gray-400 mb-0.5">End</p>
                <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                  {isSaving ? "Saving…" : (closeDate ?? "dd/mm/yyyy")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Date picker modal */}
        {showDatePicker && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDatePicker(false);
            }}
          >
            <DateRangePicker
              startDate={startDate}
              endDate={closeDate}
              onCancel={() => setShowDatePicker(false)}
              onApply={(dmy_start, dmy_end) => {
                setShowDatePicker(false);
                handleCloseDateChange(dmy_start, dmy_end);
              }}
            />
          </div>
        )}
      </div>

      {/* ── Expense type tabs ── */}
      <div className="bg-white rounded-2xl px-4 py-4 shadow-md mb-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {expenseTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 whitespace-nowrap flex-shrink-0 ${activeTab === tab.key ? "bg-primary text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table or All-Expense cards ── */}
      {activeTab === "all" ? (
        <div className="mt-2">
          {allExpenseLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              <Spinner className="w-5 h-5 mr-2 text-blue-500" /> Loading all
              expenses...
            </div>
          ) : allExpenseSummary ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    All Expenses
                  </h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {startDate && closeDate
                      ? `${startDate} → ${closeDate}`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={pdfLoading}
                  className="flex items-center justify-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer disabled:opacity-60"
                >
                  {pdfLoading ? <Spinner /> : <IconDoc />} Export PDF
                </button>
              </div>

              {/* Category mini-cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-5">
                {[
                  {
                    label: "Trip",
                    total: allExpenseSummary.totalTripExpense ?? 0,
                    paid: allExpenseSummary.totalTripPaidAmount ?? 0,
                    remaining: allExpenseSummary.totalTripUnPaidAmount ?? 0,
                    color: "blue",
                  },
                  {
                    label: "Employee",
                    total: allExpenseSummary.totalEmployeeExpense ?? 0,
                    paid: allExpenseSummary.totalEmployeePaidAmount ?? 0,
                    remaining: allExpenseSummary.totalEmployeeUnPaidAmount ?? 0,
                    color: "purple",
                  },
                  {
                    label: "Office",
                    total: allExpenseSummary.totalOfficeExpense ?? 0,
                    paid: allExpenseSummary.totalOfficePaidAmount ?? 0,
                    remaining: allExpenseSummary.totalOfficeUnPaidAmount ?? 0,
                    color: "amber",
                  },
                  {
                    label: "Server",
                    total: allExpenseSummary.totalServerExpense ?? 0,
                    paid: allExpenseSummary.totalServerPaidAmount ?? 0,
                    remaining: allExpenseSummary.totalServerUnPaidAmount ?? 0,
                    color: "emerald",
                  },
                  {
                    label: "Other",
                    total: allExpenseSummary.totalOtherExpense ?? 0,
                    paid: allExpenseSummary.totalOtherPaidAmount ?? 0,
                    remaining: allExpenseSummary.totalOtherUnPaidAmount ?? 0,
                    color: "rose",
                  },
                ].map((card) => {
                  const colorMap = {
                    blue: {
                      bg: "bg-blue-50",
                      text: "text-blue-600",
                      border: "border-blue-100",
                    },
                    purple: {
                      bg: "bg-purple-50",
                      text: "text-purple-600",
                      border: "border-purple-100",
                    },
                    amber: {
                      bg: "bg-amber-50",
                      text: "text-amber-600",
                      border: "border-amber-100",
                    },
                    emerald: {
                      bg: "bg-emerald-50",
                      text: "text-emerald-600",
                      border: "border-emerald-100",
                    },
                    rose: {
                      bg: "bg-rose-50",
                      text: "text-rose-600",
                      border: "border-rose-100",
                    },
                  };
                  const c = colorMap[card.color];
                  return (
                    <div
                      key={card.label}
                      className={`rounded-2xl px-4 py-4 shadow-sm border ${c.bg} ${c.border}`}
                    >
                      <p className="text-xs font-semibold mb-2 text-gray-500">
                        {card.label}
                      </p>
                      <p className={`text-lg font-bold mb-2 ${c.text}`}>
                        ₹{card.total.toLocaleString()}
                      </p>
                      <div className="flex justify-between text-md">
                        <span className="text-emerald-600">
                          Paid ₹{card.paid.toLocaleString()}
                        </span>
                        <span className="text-red-500">
                          Remaining ₹{card.remaining.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Trip expenses */}
              {allTripExpenses.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-4">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <h3 className="text-sm font-bold text-gray-900">
                      Trip Expenses
                    </h3>
                  </div>
                  {Object.entries(
                    allTripExpenses.reduce((acc, exp) => {
                      const key = exp.memberName;
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(exp);
                      return acc;
                    }, {}),
                  ).map(([memberName, exps]) => (
                    <TripMemberRow
                      key={memberName}
                      memberName={memberName}
                      exps={exps}
                      total={exps.reduce((s, e) => s + (e.totalAmount ?? 0), 0)}
                      paid={exps.reduce((s, e) => s + (e.payoutAmount ?? 0), 0)}
                      remaining={exps.reduce(
                        (s, e) => s + (e.remaingAmount ?? 0),
                        0,
                      )}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}

              {/* Employee expenses */}
              {allEmployeeExpenses.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-4">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <h3 className="text-sm font-bold text-gray-900">
                      Employee Expenses
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {[
                            "#",
                            "Remarks",
                            "Member",
                            "Amount",
                            "Paid",
                            "Remaining",
                            "Date",
                            "Mode",
                            "Status",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allEmployeeExpenses.map((exp, i) => (
                          <tr
                            key={exp.id}
                            className="border-t border-gray-100 hover:bg-gray-50/60"
                          >
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {i + 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {exp.remarks || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">
                              {exp.memberName}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-700">
                              ₹{(exp.expenseAmount ?? 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-emerald-600 font-medium">
                              ₹{(exp.payoutAmount ?? 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-red-500 font-medium">
                              ₹{(exp.remaingAmount ?? 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {formatDate(exp.expenseDate)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                              {exp.paymentMode}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded-lg capitalize ${exp.isPayout === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
                              >
                                {exp.isPayout}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Office expenses */}
              {allOfficeExpenses.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-4">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <h3 className="text-sm font-bold text-gray-900">
                      Office Expenses
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {[
                            "#",
                            "Remarks",
                            "Member",
                            "Amount",
                            "Paid",
                            "Remaining",
                            "Date",
                            "Mode",
                            "Status",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allOfficeExpenses.map((exp, i) => (
                          <tr
                            key={exp.id}
                            className="border-t border-gray-100 hover:bg-gray-50/60"
                          >
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {i + 1}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">
                              {exp.remarks || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">
                              {exp.memberName}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              ₹{(exp.expenseAmount ?? 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-emerald-600 font-medium">
                              ₹{(exp.payoutAmount ?? 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-red-500 font-medium">
                              ₹{(exp.remaingAmount ?? 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {formatDate(exp.expenseDate)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                              {exp.paymentMode}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded-lg capitalize ${exp.isPayout === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
                              >
                                {exp.isPayout}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Other expenses */}
              {allOtherExpenses.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-4">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <h3 className="text-sm font-bold text-gray-900">
                      Other Expenses
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {[
                            "#",
                            "Remarks",
                            "Member",
                            "Amount",
                            "Paid",
                            "Remaining",
                            "Date",
                            "Mode",
                            "Status",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allOtherExpenses.map((exp, i) => (
                          <tr
                            key={exp.id}
                            className="border-t border-gray-100 hover:bg-gray-50/60"
                          >
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {i + 1}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 whitespace-normal break-words">
                              {exp.remarks || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-700">
                              {exp.memberName}
                            </td>

                            <td className="px-4 py-3 text-sm text-gray-700">
                              ₹{(exp.expenseAmount ?? 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-emerald-600 font-medium">
                              ₹{(exp.payoutAmount ?? 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-red-500 font-medium">
                              ₹{(exp.remaingAmount ?? 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {formatDate(exp.expenseDate)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                              {exp.paymentMode}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded-lg capitalize ${exp.isPayout === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
                              >
                                {exp.isPayout}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Server expenses */}
              {(allExpenseSummary.serverExpenses ?? []).length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h3 className="text-sm font-bold text-gray-900">
                      Server Expenses
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          {[
                            "#",
                            "Title",
                            "Amount",
                            "Paid",
                            "Remaining",
                            "Date",
                            "Mode",
                            "Status",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {(allExpenseSummary.serverExpenses ?? []).map(
                          (exp, i) => (
                            <tr
                              key={exp.id}
                              className="border-t border-gray-100 hover:bg-gray-50/60"
                            >
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {i + 1}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                                {exp.title}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                ₹{(exp.expenseAmount ?? 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-emerald-600 font-medium">
                                ₹{(exp.payoutAmount ?? 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-red-500 font-medium">
                                ₹{(exp.remaingAmount ?? 0).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {formatDate(exp.expenseDate)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                                {exp.paymentMode}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded-lg capitalize ${exp.isPayout === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
                                >
                                  {exp.isPayout}
                                </span>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              No data available
            </div>
          )}
        </div>
      ) : (
        <div className="h-auto sm:h-[700px] flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {currentTab?.label}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {filterMode === "month" && closeDayOfMonth != null
                  ? `Showing: ${getPeriodLabel(selectedMonth, selectedYear)}`
                  : `Showing: ${startDate ?? "?"} → ${closeDate ?? "?"}`}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <IconSearch />
                </span>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 w-full sm:w-44 transition placeholder-gray-400"
                />
              </div>
              {isSuperAdmin && (
                <div className="relative">
                  <select
                    value={selectedManagerId}
                    onChange={(e) => setSelectedManagerId(e.target.value)}
                    disabled={managersLoading}
                    className="appearance-none pl-3.5 pr-9 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition cursor-pointer disabled:opacity-60 min-w-[160px]"
                  >
                    <option value="all">All Members</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <IconChevron />
                  </span>
                  {managersLoading && (
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2">
                      <Spinner className="w-3.5 h-3.5 text-blue-500" />
                    </span>
                  )}
                </div>
              )}
              <button
                type="button"
                disabled={editLoading}
                onClick={() => {
                  if (activeTab === "justtab") {
                    setJustTabModalOpen(true); // ✅ open JustTab modal
                    return;
                  }
                  setEditData(null);
                  setModalKey((k) => k + 1);
                  setIsModalOpen(false);
                  setTimeout(() => setIsModalOpen(true), 0);
                }}
                className="flex items-center justify-center gap-1.5 bg-primary hover:bg-blue-800 active:bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-xl w-full sm:w-auto transition cursor-pointer border-0 disabled:opacity-60"
              >
                {editLoading ? <Spinner /> : <IconPlus />} New
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={pdfLoading}
                className="flex items-center justify-center gap-1.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold px-4 py-2 rounded-xl w-full sm:w-auto transition cursor-pointer disabled:opacity-60"
              >
                {pdfLoading ? <Spinner /> : <IconDoc />} Export PDF
              </button>
            </div>
          </div>
          <div className="h-px bg-gray-100" />
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              <Spinner className="w-5 h-5 mr-2 text-blue-500" /> Loading
              expenses...
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto overflow-x-auto [&_table]:border-0 [&_th]:border-0 [&_td]:border-0 [&_thead]:bg-gray-50 [&_thead_tr]:border-0 [&_tbody_tr]:border-t [&_tbody_tr]:border-gray-100 [&_tbody_tr:hover]:bg-gray-50/60 [&_th]:text-xs [&_th]:font-semibold [&_th]:text-gray-500 [&_th]:uppercase [&_th]:tracking-wide [&_th]:py-3 [&_th]:px-4 [&_td]:py-3.5 [&_td]:px-4">
              <TableComponent columns={tableColumns} data={filteredData} />
            </div>
          )}
          <div className="h-px bg-gray-100" />
        </div>
      )}

      {/* ── Modals ── */}
      {isSimple ? (
        <SimpleExpenseForm
          key={modalKey}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          expenseType={activeTab}
          editData={editData}
        />
      ) : (
        <ComplexExpenseForm
          key={modalKey}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          expenseType={activeTab}
          editData={editData}
          fetchExpenses={fetchExpenses}
        />
      )}

      <RecordExpensepayoutModal
        open={payoutModalOpen}
        onClose={() => {
          setPayoutModalOpen(false);
          setPayoutModalData(null);
        }}
        customerName={payoutModalData?.customerName ?? ""}
        expenseId={payoutModalData?.expenseId}
        receivable={payoutModalData?.receivable ?? 0}
        payments={[]}
        expenseType={activeTab}
        onSave={() => {
          if (activeTab === "all") {
            fetchAllExpenses();
          } else {
            fetchExpenses(activeTab, selectedManagerId);
          }
        }}
      />

      <UserExpenseDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={selectedUser}
      />
      <JustTabModal
        open={justTabModalOpen}
        onClose={() => setJustTabModalOpen(false)}
        onSubmit={async (formData) => {
          console.log("JustTab submitted:", formData);
        }}
      />
      <Modal
        title="Expense Report"
        open={pdfViewerOpen}
        onCancel={handlePdfViewerClose}
        width="75%"
        footer={null}
        destroyOnClose
      >
        <div style={{ height: "80vh" }}>
          {pdfLoading && (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              <Spinner className="w-5 h-5 mr-2 text-blue-500" /> Generating
              report...
            </div>
          )}
          {pdfUrl && !pdfLoading && (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer fileUrl={pdfUrl} plugins={[pdfPlugin]} />
            </Worker>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default AllExpense;
