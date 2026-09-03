import { useState, useEffect, useRef, useCallback } from "react";
import { TableComponent } from "@/components/table/TableComponent";
import {
  GETAllByuserIdincomeExpensetype,
  GEtEmployeeExpensebytype,
  GEtEmpofficeExpensebytype,
  GETtripexpenseById,
  GETofficeexpenseById,
  DeleteEmployeeExpenseoffice,
  DeleteEmployeeExpenseTrip,
  updatepayoutforoffice,
  updatepayoutforTrip,
  GETALLexpense,
  GenratsupereexpenseReport,
  GetAllAccountContactMaster,
} from "@/services/apiServices";
import AddExpenseType from "../../../partials/modals/AddExpenseType/AddExpenseType";
import SimpleExpenseForm from "../../../partials/modals/add-super-expense/Simpleexpenseform";
import ComplexExpenseForm from "../../../partials/modals/add-super-expense/Complexexpenseform";
import UserExpenseDrawer from "../../../partials/modals/add-super-expense/Userexpensedrawer";
import RecordExpensepayoutModal from "../../../partials/modals/add-payout-expense/RecordExpensepayoutModal";
import { toAbsoluteUrl } from "@/utils";
import useCloseDate from "@/hooks/useCloseDate";
import DateRangePicker from "../../../components/form-inputs/DatePicker/Daterangepicker";
import Swal from "sweetalert2";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { Modal } from "antd";
import { usePermission } from "@/hooks/usePermission";
import {
  isSimpleType,
  MONTH_SHORT,
  MONTH_NAMES,
  getPeriodLabel,
  mapApiTypeToTab,
  CATEGORY_COLOR_MAP,
  getTabColor,
  EXPENSE_TABLE_HEADERS,
  buildColumns,
} from "./expenseConstants";
import { FormattedMessage } from "react-intl";

// ─── Date helpers ─────────────────────────────────────────────────────────────
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
    const [d, mo, y] = raw.split("/");
    return `${y}-${mo}-${d}`;
  }
  const m = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
};

// ─── Icons ────────────────────────────────────────────────────────────────────
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
const IconChevronToggle = ({ open }) => (
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

// ─── TripMemberRow (for All tab) ──────────────────────────────────────────────
const TripMemberRow = ({ memberName, exps }) => {
  const [open, setOpen] = useState(false);
  const total = exps.reduce((s, e) => s + (e.totalAmount ?? 0), 0);
  const paid = exps.reduce((s, e) => s + (e.payoutAmount ?? 0), 0);
  const remaining = exps.reduce((s, e) => s + (e.remaingAmount ?? 0), 0);
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-6 py-4 hover:bg-gray-50/60 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
            {memberName?.charAt(0) ?? "?"}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{memberName}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {exps.length} trip{exps.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 sm:gap-6">
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
          <div className="text-right">
            <p className="text-xs text-gray-400">Remaining</p>
            <p className="text-sm font-bold text-red-500">
              ₹{remaining.toLocaleString()}
            </p>
          </div>
          <IconChevronToggle open={open} />
        </div>
      </button>
      {open && (
        <div className="border-t border-gray-100 bg-gray-50/40 overflow-x-auto">
          <table className="w-full min-w-[480px]">
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
                      className={`text-xs font-semibold px-2 py-1 rounded-lg capitalize ${
                        exp.isPayout === "paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : exp.isPayout === "confirm"
                            ? "bg-yellow-100 text-yellow-700"
                            : exp.isPayout === "pending"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-600"
                      }`}
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

const SimpleExpenseTable = ({ data, headers, renderRow }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[600px]">
      <thead className="bg-gray-50">
        <tr>
          {headers.map((h) => (
            <th
              key={h}
              className="px-4 py-3 text-left text-xs font-semibold text-black uppercase tracking-wide"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{data.map((exp, i) => renderRow(exp, i))}</tbody>
    </table>
  </div>
);

const TabBar = ({ allTabs, activeTab, onSelect }) => {
  const [page, setPage] = useState(0);
  const [visibleCount, setVisibleCount] = useState(6);
  const containerRef = useRef(null);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 400) setVisibleCount(2);
      else if (w < 640) setVisibleCount(3);
      else if (w < 1024) setVisibleCount(4);
      else setVisibleCount(6);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  const totalPages = Math.ceil(allTabs.length / visibleCount);
  const visibleTabs = allTabs.slice(
    page * visibleCount,
    page * visibleCount + visibleCount,
  );
  useEffect(() => {
    const idx = allTabs.findIndex((t) => t.key === activeTab);
    if (idx !== -1) setPage(Math.floor(idx / visibleCount));
  }, [activeTab, allTabs, visibleCount]);
  useEffect(() => {
    setPage((p) => Math.min(p, Math.max(0, totalPages - 1)));
  }, [totalPages]);
  return (
    <div className="bg-white rounded-2xl shadow-md mb-5" ref={containerRef}>
      <div className="flex items-center gap-1 px-2 py-2">
        <button
          onClick={() => setPage((p) => p - 1)}
          disabled={page === 0}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 text-lg transition disabled:opacity-0 disabled:pointer-events-none hover:bg-gray-50"
        >
          ‹
        </button>
        <div className="flex gap-1.5 flex-1 overflow-hidden">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onSelect(tab.key)}
              title={tab.label}
              className={`flex-1 min-w-0 px-2 py-2 rounded-xl text-xs sm:text-sm font-semibold truncate transition border-0 ${activeTab === tab.key ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              {tab.label}
            </button>
          ))}
          {Array.from({ length: visibleCount - visibleTabs.length }).map(
            (_, i) => (
              <div key={`e-${i}`} className="flex-1" />
            ),
          )}
        </div>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page >= totalPages - 1}
          className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 text-lg transition disabled:opacity-0 disabled:pointer-events-none hover:bg-gray-50"
        >
          ›
        </button>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-center gap-1 pb-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-1.5 rounded-full border-0 cursor-pointer transition-all duration-200 ${i === page ? "bg-primary w-4" : "bg-gray-300 w-1.5"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

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
              className="text-sm font-bold text-gray-700 hover:text-blue-600 border-0 bg-transparent cursor-pointer"
            >
              ← {pickedYear}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MONTH_NAMES.map((m, i) => (
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

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-gray-400">
    <svg
      className="w-12 h-12 mb-3 text-gray-200"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
    <p className="text-sm font-medium">No records found</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ExpensePage = () => {
  const permExpense = usePermission("Expense");
  const userId = localStorage.getItem("mainId");
  const numericUserId = Number(localStorage.getItem("mainId") || userId);
  const [allTabs, setAllTabs] = useState([]);
  const [tabsLoading, setTabsLoading] = useState(true);
  const [tabsError, setTabsError] = useState(null);
  const [activeTab, setActiveTab] = useState(null);
  const [filterMode, setFilterMode] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [startDate, setStartDate] = useState(null);
  const [closeDate, setCloseDate] = useState(null);
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [search, setSearch] = useState("");

  const [data, setData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [summary, setSummary] = useState({
    total_expense: 0,
    paid_expense: 0,
    remaing_expense: 0,
  });
  const [allExpenseSummary, setAllExpenseSummary] = useState(null);
  const [allExpenseLoading, setAllExpenseLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [editData, setEditData] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [payoutModalOpen, setPayoutModalOpen] = useState(false);
  const [payoutModalData, setPayoutModalData] = useState(null);
  const [addTypeOpen, setAddTypeOpen] = useState(false);
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const pdfPlugin = defaultLayoutPlugin();
  const autoSetDone = useRef(false);
  const isInitialLoad = useRef(true);
  const authStorage = JSON.parse(localStorage.getItem("auth-storage"));
const [contacts, setContacts] = useState([]);
const [selectedContact, setSelectedContact] = useState("");
const [reportPanelOpen, setReportPanelOpen] = useState(false);
const [reportRow, setReportRow] = useState(null);
const [reportStartDate, setReportStartDate] = useState(null);
const [reportEndDate, setReportEndDate] = useState(null);
const [reportContactId, setReportContactId] = useState("");
const [showReportDatePicker, setShowReportDatePicker] = useState(false);
  const roleId = authStorage?.state?.roleReportRights?.roleId;
  const toDMY = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const openReportPanel = (row) => {
    setReportRow(row);
    setReportStartDate(startDate);
    setReportEndDate(closeDate);
    setReportContactId(selectedContact);
    setReportPanelOpen(true);
  };
  const fetchData = async () => {
  try {
    const res = await GetAllAccountContactMaster(userId);

    const data = Array.isArray(res?.data?.data)
      ? res.data.data
      : [];

    setContacts(
      data.sort(
        (a, b) => b.accountContactId - a.accountContactId
      )
    );
  } catch (err) {
    console.error("Failed to fetch account contacts", err);
    setContacts([]);
  }
};

useEffect(() => {
  fetchData();
}, [userId]);

  const handlePdfViewerClose = () => {
    setPdfViewerOpen(false);
    setPdfUrl(null);
    setPdfLoading(false);
  };

  const {
    monthCloseDates,
    isLoading: closeDateLoading,
    saveCloseDate,
    isSaving,
  } = useCloseDate(null, selectedYear, numericUserId);
  useEffect(() => {
    if (filterMode !== "month" || selectedMonth == null) return;

    // ✅ Skip sync on initial load — let auto-select handle it
    if (!autoSetDone.current) return;

    const entry = monthCloseDates[`${selectedYear}-${selectedMonth + 1}`];
    if (entry?.startDate && entry?.closeDate) {
      setStartDate(entry.startDate);
      setCloseDate(entry.closeDate);
    } else {
      setStartDate(null);
      setCloseDate(null);
    }
  }, [selectedMonth, selectedYear, monthCloseDates, filterMode]);

  // ── Auto-select active month ──────────────────────────────────────────────
  useEffect(() => {
    if (closeDateLoading) return;
    if (autoSetDone.current) return;
    if (!monthCloseDates || Object.keys(monthCloseDates).length === 0) return;

    const activeEntry = Object.values(monthCloseDates).find(
      (e) => e.isActive === true,
    );

    if (activeEntry) {
      const monthIndex = activeEntry.month - 1;
      const year = activeEntry.year;

      setSelectedYear(year);
      setSelectedMonth(monthIndex);
      setFilterMode("month");
      setStartDate(activeEntry.startDate); // ✅ set dates directly here
      setCloseDate(activeEntry.closeDate); // ✅ no need to rely on sync effect
      autoSetDone.current = true;
    } else {
      autoSetDone.current = true;
    }
  }, [monthCloseDates, closeDateLoading]);
  
  const getLivePeriodLabel = (monthIndex, year) => {
    const entry = monthCloseDates[`${year}-${monthIndex + 1}`];
    if (entry?.startDate && entry?.closeDate) {
      const fmt = (str) => {
        const [d, m] = str.split("/");
        const names = [
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
        return `${parseInt(d)} ${names[parseInt(m) - 1]}`;
      };
      return `${fmt(entry.startDate)} → ${fmt(entry.closeDate)}`;
    }
    return getPeriodLabel(monthIndex, year);
  };

  const handleCloseDateChange = (dmy_start, dmy_end) => {
    saveCloseDate(
      { startDate: dmy_start, endDate: dmy_end },
      {
        onSuccess: () => {
          setStartDate(dmy_start);
          setCloseDate(dmy_end);
          setFilterMode("month");
          Swal.fire({
            title: "Updated!",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        },
        onError: () =>
          Swal.fire({
            title: "Failed!",
            text: "Could not update the close date.",
            icon: "error",
          }),
      },
    );
  };

  useEffect(() => {
    let cancelled = false;
    const fetchTabs = async () => {
      setTabsLoading(true);
      setTabsError(null);
      try {
        const res = await GETAllByuserIdincomeExpensetype(userId, "expense");
        if (cancelled) return;
        const apiTabs = Array.isArray(res?.data?.data)
          ? res.data.data.map(mapApiTypeToTab)
          : [];
        const tabsWithAll = [
          { key: "all", label: "All Expenses", id: null },
          { key: "trip", label: "Trip", id: null },
          ...apiTabs,
        ];
        setAllTabs(tabsWithAll);
        setActiveTab("all");
      } catch (err) {
        if (!cancelled) {
          setTabsError(err?.message ?? "Failed to load expense types");
          setAllTabs([{ key: "all", label: "All Expenses", id: null }]);
          setActiveTab("all");
        }
      } finally {
        if (!cancelled) setTabsLoading(false);
      }
    };
    fetchTabs();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const mapRow = (item, index) => ({
    id: item.id,
    sr_no: index + 1,
    title: item.title ?? item.remarks ?? "-",
    memberName:
      item.accountContactName ?? item.userName ?? item.memberName ?? "-",
    startDate: formatDate(item.fromDate ?? item.expenseDate),
    toDate: formatDate(item.toDate),
    totalAmount: item.totalAmount ?? item.expenseAmount ?? 0,
    paidAmount: item.payoutAmount ?? item.paidAmount ?? 0,
    remainingAmount: item.remaingAmount ?? item.remainingAmount ?? 0,
    status: (item.isPayout ?? item.status ?? "unpaid").toLowerCase(),
    remarks: item.remark ?? item.remarks ?? "",
    memberId: item.memberId,
    userid: numericUserId,
    expenseType: item.expenseType,
    transactions: item.detailRequestDtos ?? [],
    fromCityId: item.fromCityId,
    toCityId: item.toCityId,
    files: item.files ?? [],           // ✅ added
  docUrl: item.files?.[0]?.docPath ?? item.docPath ?? null,
  });

  const fetchTabData = useCallback(
    async (tab, sd, cd, contactId) => {
      if (!tab || tab === "all") return;
      if (!sd || !cd) return;
      setDataLoading(true);
      setData([]);
      try {
        const simple = isSimpleType(tab);
        const tabObj = allTabs.find((t) => t.key === tab);
        const typeId = tabObj?.id ?? null;

        let res;

        if (tab === "trip") {
          res = await GEtEmployeeExpensebytype(contactId || -1, numericUserId, "trip", sd, cd);
        } else if (simple) {
          res = await GEtEmpofficeExpensebytype(numericUserId, typeId, sd, cd, contactId || -1);
        } else {
          res = await GEtEmployeeExpensebytype(contactId || -1, numericUserId, typeId, sd, cd);
        }

        const payload = res?.data?.data ?? res?.data ?? {};
        setSummary({
          total_expense: payload.total_expense ?? 0,
          paid_expense: payload.paid_expense ?? 0,
          remaing_expense: payload.remaing_expense ?? 0,
        });
        const raw = payload.data;
        const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
        setData(list.map(mapRow));
      } catch (err) {
        console.error("fetchTabData error:", err);
        setData([]);
      } finally {
        setDataLoading(false);
      }
    },
    [numericUserId, allTabs],
  );
 const fetchAllExpenses = useCallback(
    async (sd, cd, contactId) => {
      if (!sd || !cd) return;
      setAllExpenseLoading(true);
      try {
        const res = await GETALLexpense(cd, sd, numericUserId, contactId || -1);
        setAllExpenseSummary(res?.data?.data ?? null);
      } catch (err) {
        console.error("fetchAllExpenses error:", err);
        setAllExpenseSummary(null);
      } finally {
        setAllExpenseLoading(false);
      }
    },
    [numericUserId],
  );

useEffect(() => {
    if (!activeTab || !startDate || !closeDate) return;
    if (activeTab === "all") fetchAllExpenses(startDate, closeDate, selectedContact);
    else fetchTabData(activeTab, startDate, closeDate, selectedContact);
  }, [activeTab, startDate, closeDate, selectedContact]);

  const handleMonthClick = (index) => {
    setSelectedMonth(index);
    setFilterMode("month");
    isInitialLoad.current = false;
    const entry = monthCloseDates[`${selectedYear}-${index + 1}`];
    if (entry?.startDate && entry?.closeDate) {
      setStartDate(entry.startDate);
      setCloseDate(entry.closeDate);
    } else {
      const s = new Date(selectedYear, index, 1);
      const e = new Date(selectedYear, index + 1, 0);
      const fmt = (d) =>
        `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      setStartDate(fmt(s));
      setCloseDate(fmt(e));
    }
  };

  const validDoc = (url) =>
    url && !url.endsWith("null") && !url.endsWith("undefined") ? url : null;

 const handleEdit = async (row) => {
  setEditLoading(true);
  try {
    const simple = isSimpleType(activeTab);
    if (simple) {
      const { data: res } = await GETofficeexpenseById(row.id);
      const d = res?.data ?? {};

      // Keep the drawer data (for "view" elsewhere) — unchanged
      setSelectedUser({
        name: d?.title ?? row.title ?? "Unknown",
        role: d?.incomeExpenseTypeName ?? d?.expenseType ?? activeTab,
        accountContactName: d?.accountContactName ?? null,
        username: null,
        email: null,
        phone: null,
        avatar: null,
        totalAmount: d?.expenseAmount ?? 0,
        payoutAmount: d?.payoutAmount ?? 0,
        remaingAmount: d?.remaingAmount ?? 0,
        payoutHistory: d?.payoutHistory ?? [],
        files: d?.files ?? [],
        transactions: d
          ? [
              {
                description: d.description ?? "",
                date: formatDate(d.expenseDate),
                type: d.paymentMode ?? "",
                particular: d.title ?? "",
                amount: d.expenseAmount ?? 0,
                status: d.status ?? "Pending",
                files: d.files ?? [],
              },
            ]
          : [],
      });

      // ✅ NEW — actually populate editData so SimpleExpenseForm opens pre-filled
      setEditData({
        id: d.id ?? row.id,
        title: d.title ?? "",
        accountContactId: d.accountContactId ?? null,
        expenseDate: d.expenseDate ?? "",
        paidDate: d.paidDate ?? "",
        dueDate: d.dueDate ?? "",
        amount: d.expenseAmount ?? "",
        expenseAmount: d.expenseAmount ?? "",
        paymentMode: d.paymentMode ?? "gpay",
        paymentMethod: d.paymentMode ?? "gpay",
        remarks: d.remark ?? d.remarks ?? "",
        incomeExpenseTypeId: d.incomeExpenseTypeId ?? null,
        files: d.files ?? [],           // ✅ existing files
        existingFiles: d.files ?? [],   // ✅ alias, in case form expects this name
      });
    } else {
      const { data: res } = await GETtripexpenseById(row.id);
      const d = res?.data ?? {};
      setEditData({
        id: d.id ?? row.id,
        title: d.title ?? "-",
        tripName: d.title ?? "",
        startDate: toInputDate(d.fromDate),
        endDate: toInputDate(d.toDate),
        dueDate: toInputDate(d.dueDate),
        fromCity: d.fromCityId ?? null,
        toCity: d.toCityId ?? null,
        amount: d.totalAmount ?? "",
        remark: d.remark ?? "",
        isPayout: d.status ?? "",
        memberId: d.accountContactId ?? d.userId ?? null,
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
    setModalKey((k) => k + 1);
    setModalOpen(true);
  } catch (err) {
    console.error("handleEdit error:", err);
    Swal.fire({
      title: "Failed!",
      text: "Could not load expense details.",
      icon: "error",
    });
  } finally {
    setEditLoading(false);
  }
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
      const simple = isSimpleType(activeTab);
      simple
        ? await DeleteEmployeeExpenseoffice(id)
        : await DeleteEmployeeExpenseTrip(id);
      setData((prev) => prev.filter((item) => item.id !== id));
      Swal.fire({
        title: "Deleted!",
        text: "Expense deleted.",
        icon: "success",
        confirmButtonColor: "#1d4ed8",
        customClass: { popup: "!rounded-2xl", confirmButton: "!rounded-xl" },
      });
    } catch {
      Swal.fire({
        title: "Failed!",
        text: "Something went wrong.",
        icon: "error",
      });
    }
  };

  const handleTitleClick = async (row) => {
    try {
      const simple = isSimpleType(activeTab);
      if (simple) {
        const { data: res } = await GETofficeexpenseById(row.id);
        const d = res?.data ?? {};
      

setSelectedUser({
  name: d?.title ?? row.title ?? "Unknown",
  role: d?.incomeExpenseTypeName ?? d?.expenseType ?? activeTab,
  accountContactName: d?.accountContactName ?? null,
  username: null,
  email: null,
  phone: null,
  avatar: null,
  totalAmount: d?.expenseAmount ?? 0,
  payoutAmount: d?.payoutAmount ?? 0,
  remaingAmount: d?.remaingAmount ?? 0,
  payoutHistory: d?.payoutHistory ?? [],
  files: d?.files ?? [],    
  transactions: d
    ? [
        {
          description: d.description ?? "",
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
          name: d?.title ?? row.title ?? "Unknown",
          role: d?.expenseType ?? "trip",
          accountContactName: d?.accountContactName ?? null,
          username: null,
          email: null,
          phone: null,
          avatar: null,
          totalAmount: d?.totalAmount ?? 0,
          payoutAmount: d?.payoutAmount ?? 0,
          remaingAmount: d?.remaingAmount ?? 0,
          payoutHistory: d?.payoutHistory ?? [],
          transactions: (d?.detailRequestDtos ?? []).map((tx) => ({
            description: d.description ?? "",
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
      console.error("handleTitleClick error:", err);
      setSelectedUser({
        name: row.title ?? "Unknown",
        role: "",
        totalAmount: row.totalAmount ?? 0,
        payoutAmount: row.paidAmount ?? 0,
        remaingAmount: 0,
        payoutHistory: [],
        transactions: [],
      });
    }
    setDrawerOpen(true);
  };

  const handleOpenPayout = (row) => {
    setPayoutModalData({
      customerName: row.memberName ?? row.title ?? "—",
      invoiceRef: `EXP-${row.id}`,
      receivable: row.remainingAmount ?? 0,
      description: row.remarks ?? "",
      userId: row.userid,
      expenseId: row.id,
    });
    setPayoutModalOpen(true);
  };

 
  const generateReport = async ({ startDate: rSd, endDate: rEd, expenseId, contactId }) => {
    if (!rSd || !rEd) {
      Swal.fire({
        title: "No date range",
        text: "Please select a start and end date.",
        icon: "warning",
      });
      return;
    }

    setPdfUrl(null);
    setPdfLoading(true);

    try {
      const tabObj = allTabs.find((t) => t.key === activeTab);
      const isTripTab = activeTab === "trip";

      const payload = {
        startDate: rSd,
        endDate: rEd,
        expenseId: expenseId ?? -1,
        userId: numericUserId,
        type: isTripTab ? "trip" : tabObj?.id != null ? "other" : activeTab,
        incomeExpenseTypeId: isTripTab ? "" : (tabObj?.id ?? ""),
        accountContactId: contactId || -1,
      };

      const res = await GenratsupereexpenseReport(payload);
      const url = res?.data?.report_path ?? null;

      if (url) {
        setPdfUrl(url);
        setReportPanelOpen(false);
        setPdfViewerOpen(true);
      } else {
        Swal.fire({
          title: "No report found",
          text: "The server did not return a report URL.",
          icon: "warning",
        });
      }
    } catch (err) {
      console.error("generateReport error:", err);
      Swal.fire({
        title: "Failed!",
        text: "Could not generate report.",
        icon: "error",
      });
    } finally {
      setPdfLoading(false);
    }
  };
const handleReport = () =>
    generateReport({
      startDate: reportStartDate,
      endDate: reportEndDate,
      expenseId: reportRow?.id ?? -1,
      contactId: reportContactId,
    });

  const handleRowReport = (row) =>
    generateReport({
      startDate,
      endDate: closeDate,
      expenseId: row?.id ?? -1,
      contactId: selectedContact,
    });
  const isTrip = activeTab === "trip";

  const tableColumns = buildColumns(
    isTrip,
    {
      onView: handleTitleClick,
      onEdit: handleEdit,
      onDelete: handleDelete,
      onPayout: handleOpenPayout,
       onReport: handleRowReport, 
      onTitleClick: handleTitleClick,
    },
    {
      view: permExpense.view,
      edit: permExpense.edit,
      delete: permExpense.delete,
      payout: permExpense.edit,
      report: permExpense.view,
    },
  );
  const totalExpenses =
    activeTab === "all"
      ? (allExpenseSummary?.totalExpenses ?? 0)
      : summary.total_expense;
  const totalPaid =
    activeTab === "all"
      ? (allExpenseSummary?.totalPaidAmount ?? 0)
      : summary.paid_expense;
  const totalRemaining =
    activeTab === "all"
      ? (allExpenseSummary?.totalUnPaidAmount ?? 0)
      : summary.remaing_expense;
  const expenseGroups = allExpenseSummary?.expenses ?? [];
  const tripExpenses = allExpenseSummary?.tripExpenses ?? [];
  const filteredData = data.filter(
    (row) =>
      (row.title ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (row.memberName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (row.remarks ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const renderExpenseRow = (exp, i) => (
    <tr key={exp.id} className="border-t border-gray-100 hover:bg-gray-50/60">
      <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
      <td className="px-4 py-3 text-sm text-gray-500">{exp.remarks || "-"}</td>
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
  );

  const isSimple = isSimpleType(activeTab);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="p-3 sm:p-6 min-h-screen bg-gray-50/50">
      {/* ── Desktop month grid row 1 ── */}
      <div className="hidden lg:grid grid-cols-7 gap-3 mb-2">
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
                onSelect={(m, y) => {
                  setSelectedYear(y);
                  setSelectedMonth(m);
                  setFilterMode("month");
                  setShowYearMonthPicker(false);
                }}
              />
            </>
          )}
        </div>
        {MONTH_SHORT.slice(0, 6).map((month, index) => {
          const sel = filterMode === "month" && selectedMonth === index;
          return (
            <button
              key={index}
              onClick={() => handleMonthClick(index)}
              className={`flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${sel ? "bg-primary text-white border-primary" : "bg-gray-50 text-black border-gray-200 hover:border-primary hover:text-primary"}`}
            >
              <span className="font-semibold">{month}</span>
              <span
                className={`text-[10px] mt-0.5 ${sel ? "text-blue-100" : "text-black"}`}
              >
                {getLivePeriodLabel(index, selectedYear)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="hidden lg:grid grid-cols-7 gap-3 mb-4">
        <button
          onClick={() => {
            setFilterMode("all");
            setSelectedMonth(null);
            setStartDate(`01/01/${selectedYear}`);
            setCloseDate(`31/12/${selectedYear}`);
          }}
          className={`flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${filterMode === "all" ? "bg-primary text-white border-primary" : "bg-gray-50 text-black border-gray-200 hover:border-primary hover:text-primary"}`}
        >
          <span className="font-semibold">All</span>
          <span
            className={`text-[10px] mt-0.5 ${filterMode === "all" ? "text-blue-100" : "text-black"}`}
          >
            1 Jan → 31 Dec {selectedYear}
          </span>
        </button>
        {MONTH_SHORT.slice(6, 12).map((month, index) => {
          const realIndex = index + 6;
          const sel = filterMode === "month" && selectedMonth === realIndex;
          return (
            <button
              key={realIndex}
              onClick={() => handleMonthClick(realIndex)}
              className={`flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${sel ? "bg-primary text-white border-primary" : "bg-gray-50 text-black border-gray-200 hover:border-primary hover:text-primary"}`}
            >
              <span className="font-semibold">{month}</span>
              <span
                className={`text-[10px] mt-0.5 ${sel ? "text-blue-100" : "text-black"}`}
              >
                {getLivePeriodLabel(realIndex, selectedYear)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="lg:hidden flex items-center gap-3 mb-4">
        <div className="relative flex-shrink-0">
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(Number(e.target.value));
              setFilterMode("month");
            }}
            className="appearance-none pl-3.5 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <IconChevron />
          </span>
        </div>
        <div className="relative flex-1">
          <select
            value={filterMode === "all" ? "all" : String(selectedMonth)}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "all") {
                setFilterMode("all");
                setSelectedMonth(null);
              } else {
                setFilterMode("month");
                setSelectedMonth(Number(v));
              }
            }}
            className="appearance-none w-full pl-3.5 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 bg-white outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            <option value="all">All Months</option>
            {MONTH_NAMES.map((name, i) => {
              const label = getLivePeriodLabel(i, selectedYear);
              return (
                <option key={i} value={String(i)}>
                  {name}
                  {label ? ` (${label})` : ""}
                </option>
              );
            })}
          </select>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <IconChevron />
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 mb-6">
        {[
          {
            label: <FormattedMessage id="COMMON.TOTAL_EXPENSES" defaultMessage="Total Expenses" />,
            value: `₹ ${totalExpenses.toLocaleString()}`,
            iconBg: "bg-red-50",
            icon: toAbsoluteUrl("/media/icons/expense4.png"),
          },
          {
            label: <FormattedMessage id="COMMON.TOTAL_PAID" defaultMessage="Total Paid" />,
            value: `₹ ${totalPaid.toLocaleString()}`,
            icon: toAbsoluteUrl("/media/icons/expense3.png"),
            iconBg: "bg-emerald-50",
          },
          {
            label: <FormattedMessage id="COMMON.TOTAL_REMAINING" defaultMessage="Total Remaining" />,
            value: `₹ ${totalRemaining.toLocaleString()}`,
            icon: toAbsoluteUrl("/media/icons/expense2.png"),
            iconBg: "bg-blue-50",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl px-4 sm:px-6 py-5 shadow-sm flex items-center justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-150"
          >
            <div>
              <p className="text-xs sm:text-sm font-medium mb-1">
                {card.label}
              </p>
              <p className="text-base sm:text-2xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
            <div
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${card.iconBg}`}
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

        {[1, 2].includes(Number(roleId)) && (
        <div
          className="col-span-2 xl:col-span-1 bg-white rounded-2xl px-3 py-5 shadow-sm flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 cursor-pointer"
          onClick={() => setShowDatePicker(true)}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs sm:text-sm font-medium"><FormattedMessage id="COMMON.MONTH_CLOSE_DATE" defaultMessage="Month Close Date" /></p>
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
              <p className="text-xs text-gray-400 mb-0.5"><FormattedMessage id="COMMON.START" defaultMessage="Start" /></p>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {isSaving ? "Saving…" : startDate || "—"}
              </p>
            </div>
            <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5">
              <p className="text-xs text-gray-400 mb-0.5"><FormattedMessage id="COMMON.END" defaultMessage="End" /></p>
              <p className="text-xs sm:text-sm font-bold text-gray-800">
                {isSaving ? "Saving…" : closeDate || "—"}
              </p>
            </div>
          </div>
        </div>
        )} 
      </div>

     {showDatePicker && [1, 2].includes(Number(roleId)) && (
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
            onApply={(s, e) => {
              setShowDatePicker(false);
              handleCloseDateChange(s, e);
            }}
          />
        </div>
      )}

      <div className="flex items-center gap-2 mb-5">
        <div className="flex-1">
          <TabBar
            allTabs={allTabs}
            activeTab={activeTab ?? ""}
            onSelect={(tab) => {
              setActiveTab(tab);
              setSearch("");
            }}
          />
        </div>
        {[1, 2].includes(Number(roleId)) && (
          <button
            type="button"
            onClick={() => setAddTypeOpen(true)}
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-white border-0 cursor-pointer hover:opacity-90 transition shadow-sm"
            title="Add Expense Type"
          >
            <IconPlus />
          </button>
        )}
      </div>

      {tabsError && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 mb-4">
          ⚠ Could not load expense types — {tabsError}
        </p>
      )}

      {activeTab === "all" && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                <FormattedMessage id="COMMON.ALL_EXPENSES" defaultMessage="All Expenses" />All Expenses
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {startDate} → {closeDate}
              </p>
            </div>
            
           <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedContact}
                onChange={(e) => setSelectedContact(e.target.value)}
                className="pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 w-full sm:w-44 cursor-pointer"
              >
                <option value="">All Contacts</option>
                {contacts.map((c) => (
                  <option key={c.accountContactId} value={c.accountContactId}>
                    {c.contactName || c.name}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => openReportPanel({ id: -1 })}
                className="flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                title="Export PDF"
              >
                <IconDoc />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {allExpenseLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
              <Spinner className="w-5 h-5 mr-2 text-blue-500" /> Loading all
              expenses...
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <h3 className="text-sm font-bold text-gray-900">
                      Trip Expenses
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-[10px] text-gray-400">Total</p>
                      <p className="text-sm font-bold text-gray-800">
                        ₹
                        {(
                          allExpenseSummary?.totalTripExpense ?? 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Paid</p>
                      <p className="text-sm font-bold text-emerald-600">
                        ₹
                        {(
                          allExpenseSummary?.totalTripPaidAmount ?? 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400">Unpaid</p>
                      <p className="text-sm font-bold text-red-500">
                        ₹
                        {(
                          allExpenseSummary?.totalTripUnPaidAmount ?? 0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                {tripExpenses.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[560px]">
                      <thead className="bg-gray-50">
                        <tr>
                          {[
                            
  <FormattedMessage id="COMMON.SR_NO" defaultMessage="#" />,
  <FormattedMessage id="COMMON.TITLE" defaultMessage="Title" />,
  <FormattedMessage id="COMMON.FROM" defaultMessage="From" />,
  <FormattedMessage id="COMMON.TO" defaultMessage="To" />,
  <FormattedMessage id="COMMON.TOTAL" defaultMessage="Total" />,
  <FormattedMessage id="COMMON.PAID" defaultMessage="Paid" />,
  <FormattedMessage id="COMMON.REMAINING" defaultMessage="Remaining" />,
  <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,

                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tripExpenses.map((exp, i) => (
                          <tr
                            key={exp.id ?? i}
                            className="border-t border-gray-100 hover:bg-gray-50/60"
                          >
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {i + 1}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                              {exp.title ?? "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {formatDate(exp.fromDate)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {formatDate(exp.toDate)}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              ₹{(exp.totalAmount ?? 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-emerald-600 font-medium">
                              ₹{(exp.payoutAmount ?? 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-red-500 font-medium">
                              ₹{(exp.remaingAmount ?? 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`text-xs font-semibold px-2 py-1 rounded-lg capitalize ${exp.isPayout === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"}`}
                              >
                                {exp.isPayout ?? "unpaid"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 px-5 py-4">
                    No trip expenses.
                  </p>
                )}
              </div>

              {expenseGroups.map((group) => (
                <div
                  key={group.typeId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <h3 className="text-sm font-bold text-gray-900 capitalize">
                        {group.typeName}
                      </h3>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <p className="text-[10px] text-gray-400">Total</p>
                        <p className="text-sm font-bold text-gray-800">
                          ₹{(group.totalExpense ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Paid</p>
                        <p className="text-sm font-bold text-emerald-600">
                          ₹{(group.totalPaidExpense ?? 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">Unpaid</p>
                        <p className="text-sm font-bold text-red-500">
                          ₹{(group.totalUnpaidExpense ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {group.expenses?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[560px]">
                        <thead className="bg-gray-50">
                          <tr>
                            {[
                              "#",
                              "Title",
                              "Member",
                              "Date",
                              "Total",
                              "Paid",
                              "Remaining",
                              "Mode",
                              "Status",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {group.expenses.map((exp, i) => (
                            <tr
                              key={exp.id ?? i}
                              className="border-t border-gray-100 hover:bg-gray-50/60"
                            >
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {i + 1}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                                {exp.title ?? "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {exp.accountContactName ?? "-"}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-500">
                                {exp.expenseDate ?? "-"}
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
                              <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                                {exp.paymentMode ?? "-"}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded-lg capitalize ${
                                    exp.status === "paid"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : exp.status === "confirm"
                                        ? "bg-green-100 text-green-700"
                                        : exp.status === "pending"
                                          ? "bg-amber-100 text-amber-700"
                                          : "bg-red-100 text-red-600"
                                  }`}
                                >
                                  {exp.status ?? "unpaid"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-400 px-5 py-4">
                      No expenses recorded.
                    </p>
                  )}
                </div>
              ))}

              {/* ── Empty state ── */}
              {!allExpenseLoading &&
                expenseGroups.length === 0 &&
                tripExpenses.length === 0 && <EmptyState />}
            </div>
          )}
        </div>
      )}
      {/* ── Individual tab ── */}
      {activeTab && activeTab !== "all" && (
        <div
          className="bg-white rounded-2xl shadow-sm flex flex-col overflow-hidden"
          style={{ minHeight: 400 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {allTabs.find((t) => t.key === activeTab)?.label ?? activeTab}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {startDate && closeDate ? `${startDate} → ${closeDate}` : ""}
              </p>
            </div>
           <div className="flex items-center gap-2 flex-wrap">

  <div className="relative flex-1 sm:flex-none">
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
      <IconSearch />
    </span>
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search..."
      className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 w-full sm:w-44 placeholder-gray-400"
    />
  </div>

  <select
    value={selectedContact}
    onChange={(e) => setSelectedContact(e.target.value)}
    className="pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 w-full sm:w-44 cursor-pointer"
  >
    <option value="">All Contacts</option>
    {contacts.map((c) => (
      <option key={c.accountContactId} value={c.accountContactId}>
        {c.contactName || c.name}
      </option>
    ))}
  </select>

  <div className="flex gap-2 w-full sm:w-auto">
    <button
      type="button"
      onClick={() => openReportPanel({ id: -1 })}
      className="flex items-center justify-center gap-1.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-sm font-semibold px-4 py-2 rounded-xl w-full sm:w-auto transition cursor-pointer"
      title="Export PDF"
    >
      <IconDoc />
      <span className="hidden sm:inline">Export</span>
    </button>
    {permExpense.add && (
    <button
      type="button"
      disabled={editLoading}
      onClick={() => {
        setEditData(null);
        setModalKey((k) => k + 1);
        setModalOpen(true);
      }}
      className="flex items-center justify-center gap-1.5 bg-primary hover:bg-blue-800 active:bg-blue-900 text-white text-sm font-semibold px-4 py-2 rounded-xl w-full sm:w-auto transition cursor-pointer border-0 disabled:opacity-60"
    >
      {editLoading ? <Spinner /> : <IconPlus />} New
    </button>
    )}
  </div>
</div>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex-1 overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto h-full">
              {dataLoading ? (
                <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
                  <Spinner className="w-5 h-5 mr-2 text-blue-500" /> Loading
                  expenses...
                </div>
              ) : filteredData.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="[&_table]:border-0 [&_th]:border-0 [&_td]:border-0 [&_thead]:bg-gray-50 [&_thead_tr]:border-0 [&_tbody_tr]:border-t [&_tbody_tr]:border-gray-100 [&_tbody_tr:hover]:bg-gray-50/60 [&_th]:text-xs [&_th]:font-semibold [&_th]:text-gray-500 [&_th]:uppercase [&_th]:tracking-wide [&_th]:py-3 [&_th]:px-4 [&_td]:py-3.5 [&_td]:px-4">
                  <TableComponent data={filteredData} columns={tableColumns} />
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-gray-100" />
        </div>
      )}

     {modalOpen && activeTab === "trip" && (
        <ComplexExpenseForm
          key={modalKey}
          isOpen={modalOpen}
          expenseType={activeTab}
          editData={editData}
          onClose={() => {
            setModalOpen(false);
            setEditData(null);
            fetchTabData(activeTab, startDate, closeDate, selectedContact);
          }}
        />
      )}
      {modalOpen && activeTab !== "trip" && activeTab !== "all" && (
        <SimpleExpenseForm
          key={modalKey}
          isOpen={modalOpen}
          expenseType={activeTab}
          typeId={allTabs.find((t) => t.key === activeTab)?.id ?? null}
          editData={editData}
          onClose={() => {
            setModalOpen(false);
            setEditData(null);
            fetchTabData(activeTab, startDate, closeDate, selectedContact);
          }}
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
          setPayoutModalOpen(false);
          if (activeTab === "all") fetchAllExpenses(startDate, closeDate, selectedContact);
          else fetchTabData(activeTab, startDate, closeDate, selectedContact);
        }}
      />

      <UserExpenseDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={selectedUser}
      />
      <AddExpenseType
        open={addTypeOpen}
        onClose={() => setAddTypeOpen(false)}
        editData={null}
        onSave={() => {
          setAddTypeOpen(false);
          GETAllByuserIdincomeExpensetype(userId, "expense").then((res) => {
            const apiTabs = Array.isArray(res?.data?.data)
              ? res.data.data.map(mapApiTypeToTab)
              : [];
            setAllTabs([
              { key: "all", label: "All Expenses", id: null },
              { key: "trip", label: "Trip", id: null },
              ...apiTabs,
            ]);
          });
        }}
      />
    {reportPanelOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setReportPanelOpen(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <h3 className="text-sm font-bold text-gray-900 mb-4">
              Generate Report
            </h3>

            <label className="block text-xs text-gray-400 mb-1">Start Date</label>
            <input
              type="date"
              value={toInputDate(reportStartDate)}
              onChange={(e) => setReportStartDate(toDMY(e.target.value))}
              className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            />

            <label className="block text-xs text-gray-400 mb-1">End Date</label>
            <input
              type="date"
              value={toInputDate(reportEndDate)}
              onChange={(e) => setReportEndDate(toDMY(e.target.value))}
              min={toInputDate(reportStartDate) || undefined}
              className="w-full mb-3 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            />

            <label className="block text-xs text-gray-400 mb-1">Contact</label>
            <select
              value={reportContactId}
              onChange={(e) => setReportContactId(e.target.value)}
              className="w-full mb-5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              <option value="">All Contacts</option>
              {contacts.map((c) => (
                <option key={c.accountContactId} value={c.accountContactId}>
                  {c.contactName || c.name}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setReportPanelOpen(false)}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border-0 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReport}
                disabled={pdfLoading}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-blue-800 border-0 cursor-pointer transition disabled:opacity-60"
              >
                {pdfLoading ? <Spinner /> : null} Generate
              </button>
            </div>
          </div>
        </div>
      )}
     <Modal
        title="Expense Report"
        open={pdfViewerOpen}
        onCancel={handlePdfViewerClose}
        width="75%"
        footer={null}
        destroyOnClose
      >
        <div style={{ height: "80vh" }}>
          {pdfUrl && (
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer fileUrl={pdfUrl} plugins={[pdfPlugin]} />
            </Worker>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ExpensePage;
