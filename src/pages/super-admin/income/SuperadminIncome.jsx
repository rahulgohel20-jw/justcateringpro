import { Fragment, useState, useEffect, useRef } from "react";
import { Container } from "@/components/container";
import { useLanguage } from "@/i18n";
import { useAuthContext } from "@/auth";
import DateRangePicker from "@/components/form-inputs/DatePicker/Daterangepicker";
import { TableComponent } from "@/components/table/TableComponent";
import { Modal } from "antd";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import {
  GetBankDetails,
  GetAllIncome,
  GenrateSuperIncomeReport,
  GETAllByuserIdincomeExpensetype,
} from "@/services/apiServices";
import { clientColumns } from "./constant";
import useCloseDate from "@/hooks/useCloseDate";
import { usePermission } from "../../../hooks/usePermission";

const getMonthRange = (month, year) => {
  const mm = String(month + 1).padStart(2, "0");
  const lastDay = new Date(year, month + 1, 0).getDate();
  return {
    startDate: `01/${mm}/${year}`,
    endDate: `${lastDay}/${mm}/${year}`,
  };
};

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

const getActiveMonthIndex = (today, closeDay) => {
  const day = today.getDate();
  let month = today.getMonth();
  let year = today.getFullYear();
  if (day <= closeDay) {
    month = month - 1;
    if (month < 0) {
      month = 11;
      year = year - 1;
    }
  }
  return { month, year };
};

const getClosePeriod = (monthIndex, year, closeDay) => {
  if (closeDay == null) {
    return {
      start: new Date(year, monthIndex, 1),
      end: new Date(year, monthIndex + 1, 0),
    };
  }
  return {
    start: new Date(year, monthIndex, closeDay - 1),
    end: new Date(year, monthIndex + 1, closeDay),
  };
};

const MONTH_NAMES = [
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

const StyledSelect = ({ value, onChange, children }) => (
  <div className="relative inline-flex items-center">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="appearance-none h-9 pl-3 pr-9 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer transition-colors hover:border-gray-300"
    >
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-2.5 w-3.5 h-3.5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  </div>
);

const StatCard = ({ title, value, icon, iconBg, onClick, isActive }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border w-full min-w-0 transition-all
      ${onClick ? "cursor-pointer hover:shadow-md" : ""}
      ${isActive ? "border-primary ring-2 ring-primary/20" : "border-gray-100"}
    `}
  >
    <div className="flex flex-col gap-0.5 min-w-0 flex-1 pr-2">
      <p className="text-[11px] sm:text-xs font-medium leading-tight line-clamp-2">
        {title}
      </p>
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate mt-0.5">
        {value ?? "—"}
      </h2>
    </div>
    <div
      className={`w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full shadow-sm flex-shrink-0 ${iconBg}`}
    >
      {icon}
    </div>
  </div>
);

const ClientPerformanceTable = ({ data, paymentFilter }) => {
  const [search, setSearch] = useState("");

  const filtered = data.filter((d) => {
    const matchesSearch =
      d.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      d.invoiceCode?.toLowerCase().includes(search.toLowerCase());
    const matchesPayment =
      paymentFilter === "All" ||
      d.paymentMode?.toUpperCase() === paymentFilter.toUpperCase();
    return matchesSearch && matchesPayment;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-gray-100 gap-3">
        <h3 className="text-base font-semibold text-gray-800">Payment</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <svg
              className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 w-full sm:w-44"
              placeholder="Search Clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <TableComponent
          columns={clientColumns}
          data={filtered}
          paginationSize={25}
        />
      </div>
    </div>
  );
};

const icons = {
  users: (
    <svg
      className="w-5 h-5 text-blue-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5v-2a4 4 0 00-5-3.874M9 20H4v-2a4 4 0 015-3.874m6-4.126a4 4 0 10-8 0 4 4 0 008 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  check: (
    <svg
      className="w-5 h-5 text-green-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  x: (
    <svg
      className="w-5 h-5 text-red-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  noInvoice: (
    <svg
      className="w-5 h-5 text-orange-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2M6 12h.01M6 16h.01M10 12h8M10 16h4"
      />
    </svg>
  ),
  cash: (
    <svg
      className="w-5 h-5 text-yellow-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 9V7a4 4 0 00-8 0v2M5 12h14l-1 7H6l-1-7z"
      />
    </svg>
  ),
  upi: (
    <svg
      className="w-5 h-5 text-purple-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  ),
  bank: (
    <svg
      className="w-5 h-5 text-blue-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
      />
    </svg>
  ),
  cheque: (
    <svg
      className="w-5 h-5 text-pink-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
};

const dmyToDate = (str) => {
  if (!str) return new Date();
  const [d, m, y] = str.split("/");
  return new Date(Number(y), Number(m) - 1, Number(d));
};

const SuperadminIncome = () => {
  const permissions = usePermission("Plans");

  const now = new Date();
  const { auth } = useAuthContext();
  const userId = auth?.userId ?? null;
  const roleId = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("auth-storage"));
      const user = parsed?.state?.user;
      return user?.userBasicDetails?.role?.id ?? user?.role?.id ?? null;
    } catch {
      return null;
    }
  })();

  const [paymentsData, setPaymentsData] = useState(null);
  const { isRTL } = useLanguage();

  const [selected, setSelected] = useState({
    month: now.getMonth(),
    year: now.getFullYear(),
  });
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [selectedBank, setSelectedBank] = useState("");
  const [bankList, setBankList] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState(
    Math.floor(now.getFullYear() / 12) * 12,
  );
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [isYearly, setIsYearly] = useState(false);
  const [incomeTypes, setIncomeTypes] = useState([]);
  const [selectedIncomeType, setSelectedIncomeType] = useState(null);
  const pdfPlugin = defaultLayoutPlugin();

  const {
    monthCloseDates,
    isLoading: isCloseDateLoading,
    saveCloseDate,
  } = useCloseDate(selected.month, selected.year);

  const hasAutoSelected = useRef(false);
  const initialLoadDoneRef = useRef(false);

  const [savedCloseStart, setSavedCloseStart] = useState(null);
  const [savedCloseEnd, setSavedCloseEnd] = useState(null);

  // ── Auto-select active month on first load ──────────────────────────────────
  useEffect(() => {
    if (hasAutoSelected.current) return;
    if (Object.keys(monthCloseDates).length === 0) return;

    hasAutoSelected.current = true;
    initialLoadDoneRef.current = true;

    const activeEntry = Object.values(monthCloseDates).find(
      (e) => e.isActive && e.year === now.getFullYear(),
    );

    if (activeEntry) {
      setSelected({ month: activeEntry.month - 1, year: activeEntry.year });
      setIsYearly(false);
      setSavedCloseStart(activeEntry.startDate);
      setSavedCloseEnd(activeEntry.closeDate);
    } else {
      // fallback: use current month so API still fires
      const { startDate, endDate } = getMonthRange(
        now.getMonth(),
        now.getFullYear(),
      );
      setSavedCloseStart(startDate);
      setSavedCloseEnd(endDate);
    }
  }, [monthCloseDates]);

  // ── Handle month button click — updates dates so API fires ─────────────────
  const handleMonthSelect = (monthIndex, year = selected.year) => {
    setIsYearly(false);
    setSelected((prev) => ({ ...prev, month: monthIndex }));

    const key = `${year}-${monthIndex + 1}`;
    const entry = monthCloseDates[key];

    if (entry?.startDate && entry?.closeDate) {
      setSavedCloseStart(entry.startDate);
      setSavedCloseEnd(entry.closeDate);
    } else {
      const { startDate, endDate } = getMonthRange(monthIndex, year);
      setSavedCloseStart(startDate);
      setSavedCloseEnd(endDate);
    }
  };

  const currentKey = `${selected.year}-${selected.month + 1}`;
  const currentEntry = monthCloseDates[currentKey] ?? null;

  const activeMonthEntry =
    Object.values(monthCloseDates).find(
      (e) => e.isActive && e.year === selected.year,
    ) ?? null;
  const activeMonth = activeMonthEntry ? activeMonthEntry.month - 1 : null;
  const closeDayOfMonth = currentEntry?.closeDay ?? null;

  // ── Income types ────────────────────────────────────────────────────────────
  useEffect(() => {
    const uid = localStorage.getItem("userId");
    if (!uid) return;
    GETAllByuserIdincomeExpensetype(uid, "income")
      .then((res) => {
        if (res?.data?.success) setIncomeTypes(res.data.data || []);
      })
      .catch((err) => console.error("Income type fetch error:", err));
  }, []);

  // ── Fetch income data — fires whenever dates or filters change ──────────────
  useEffect(() => {
    if (!savedCloseStart || !savedCloseEnd || !userId) return;

    GetAllIncome({
      cashAccountId: "",
      accountType: "",
      bankAccountId: selectedBank,
      startDate: savedCloseStart,
      endDate: savedCloseEnd,
      paymentMode: paymentFilter === "All" ? "" : paymentFilter,
      typeId: selectedIncomeType ?? "",
      userId,
    })
      .then((res) => {
        if (res?.data?.success) setPaymentsData(res.data.data);
      })
      .catch((err) => console.error("Income fetch error:", err));
  }, [
    savedCloseStart,
    savedCloseEnd,
    selectedBank,
    paymentFilter,
    userId,
    isYearly,
    selectedIncomeType,
  ]);

  // ── Fetch bank list ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;
    GetBankDetails(userId)
      .then((res) => setBankList(res?.data?.data || []))
      .catch((err) => console.error("Bank fetch error:", err));
  }, [userId]);

  // Clear bank selection when filter changes away from Bank
  useEffect(() => {
    if (paymentFilter !== "Bank") setSelectedBank("");
  }, [paymentFilter]);

  const getMonthStatus = (index) => {
    if (activeMonth === null) return "";
    if (index === activeMonth) return "active";
    if (index < activeMonth) return "locked";
    return "upcoming";
  };

  const getPeriodLabelFromMap = (monthIndex, year) => {
    const key = `${year}-${monthIndex + 1}`;
    const entry = monthCloseDates[key];
    if (entry?.startDate && entry?.closeDate) {
      const start = dmyToDate(entry.startDate);
      const end = dmyToDate(entry.closeDate);
      const fmt = (d) => `${d.getDate()} ${monthShort[d.getMonth()]}`;
      return `${fmt(start)} → ${fmt(end)}`;
    }
    const { start, end } = getClosePeriod(monthIndex, year, closeDayOfMonth);
    const fmt = (d) => `${d.getDate()} ${monthShort[d.getMonth()]}`;
    return `${fmt(start)} → ${fmt(end)}`;
  };

  const handleGenerateReport = async () => {
    try {
      setLoadingPdf(true);
      setPdfUrl("");
      setIsPdfModalVisible(false);
      const res = await GenrateSuperIncomeReport({
        startDate: savedCloseStart,
        endDate: savedCloseEnd,
        bankAccountId: selectedBank,
        paymentMode: paymentFilter === "All" ? "" : paymentFilter,
        accountType: "",
        typeId: selectedIncomeType ?? "",
        userId,
        cashAccountId: "",
      });
      if (res?.data?.report_path) {
        setPdfUrl(res.data.report_path + `?t=${Date.now()}`);
        setIsPdfModalVisible(true);
      }
    } catch (err) {
      console.error("PDF error", err);
    } finally {
      setLoadingPdf(false);
    }
  };

  const infoStats = [
    {
      title: "Invoice Created",
      value: paymentsData?.totalInvoiceCreated ?? "—",
      icon: icons.check,
      iconBg: "bg-green-50",
    },
    {
      title: "Total Revenue",
      value: paymentsData?.totalRevenue
        ? `₹${paymentsData.totalRevenue.toLocaleString()}`
        : "—",
      icon: icons.users,
      iconBg: "bg-blue-50",
    },
    {
      title: "Total Active User",
      value: paymentsData?.totalActiveUsers ?? "—",
      icon: icons.noInvoice,
      iconBg: "bg-yellow-50",
    },
    {
      title: "Pending Amount",
      value: paymentsData?.totalPendingAmount
        ? `₹${paymentsData.totalPendingAmount.toLocaleString()}`
        : "—",
      icon: icons.x,
      iconBg: "bg-red-50",
    },
    {
      title: "No Invoice",
      value: paymentsData?.totalNoInvoiceCreated ?? "—",
      icon: icons.noInvoice,
      iconBg: "bg-orange-50",
    },
  ];

  const paymentStats = [
    {
      title: "All",
      value: `₹${(
        (paymentsData?.paymentModeAmount?.CASH || 0) +
        (paymentsData?.paymentModeAmount?.UPI || 0) +
        (paymentsData?.paymentModeAmount?.BANK_TRANSFER || 0) +
        (paymentsData?.paymentModeAmount?.CHEQUE || 0)
      ).toLocaleString()}`,
      icon: icons.users,
      iconBg: "bg-gray-50",
      filter: "All",
    },
    {
      title: "Cash",
      value: paymentsData?.paymentModeAmount?.CASH
        ? `₹${paymentsData.paymentModeAmount.CASH.toLocaleString()}`
        : "₹0",
      icon: icons.cash,
      iconBg: "bg-yellow-50",
      filter: "CASH",
    },
    {
      title: "UPI",
      value: paymentsData?.paymentModeAmount?.UPI
        ? `₹${paymentsData.paymentModeAmount.UPI.toLocaleString()}`
        : "₹0",
      icon: icons.upi,
      iconBg: "bg-purple-50",
      filter: "UPI",
    },
    {
      title: "Bank Transfer",
      value: paymentsData?.paymentModeAmount?.BANK_TRANSFER
        ? `₹${paymentsData.paymentModeAmount.BANK_TRANSFER.toLocaleString()}`
        : "₹0",
      icon: icons.bank,
      iconBg: "bg-blue-50",
      filter: "BANK_TRANSFER",
    },
    {
      title: "Cheque",
      value: paymentsData?.paymentModeAmount?.CHEQUE
        ? `₹${paymentsData.paymentModeAmount.CHEQUE.toLocaleString()}`
        : "₹0",
      icon: icons.cheque,
      iconBg: "bg-pink-50",
      filter: "CHEQUE",
    },
  ];

  return (
    <Fragment>
      <Container>
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-xl font-medium text-black">Income Overview</h1>

          <div
            className="bg-white rounded-xl px-3 py-2 shadow-sm flex items-center gap-2 border border-gray-100 cursor-pointer hover:shadow-md transition"
            onClick={() => setShowDatePicker(true)}
          >
            <div>
              <p className="text-[10px] text-gray-400 font-medium mb-1">
                Month Close Date
              </p>
              <div className="flex items-center gap-1.5">
                <div className="bg-gray-50 rounded-lg px-2 py-1">
                  <p className="text-[9px] text-gray-400">Start</p>
                  <p className="text-xs font-bold text-gray-800 whitespace-nowrap">
                    {savedCloseStart ?? "dd/mm/yyyy"}
                  </p>
                </div>
                <svg
                  className="w-3 h-3 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
                <div className="bg-gray-50 rounded-lg px-2 py-1">
                  <p className="text-[9px] text-gray-400">End</p>
                  <p className="text-xs font-bold text-gray-800 whitespace-nowrap">
                    {savedCloseEnd ?? "dd/mm/yyyy"}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg
                className="w-3.5 h-3.5 text-blue-500"
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
        </div>

        {showDatePicker && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDatePicker(false);
            }}
          >
            <DateRangePicker
              startDate={savedCloseStart}
              endDate={savedCloseEnd}
              onCancel={() => setShowDatePicker(false)}
              onApply={(dmy_start, dmy_end) => {
                setShowDatePicker(false);
                setSavedCloseStart(dmy_start);
                setSavedCloseEnd(dmy_end);
                saveCloseDate({ startDate: dmy_start, endDate: dmy_end });
              }}
            />
          </div>
        )}
      </Container>

      <Container>
        <div className="flex flex-col gap-4 lg:gap-6 w-full max-w-full overflow-x-hidden">
          {/* ── Month Selector ── */}
          <div className="grid grid-cols-7 gap-3 mb-4">
            {/* Year picker */}
            <div className="relative">
              <button
                onClick={() => setShowYearPicker((v) => !v)}
                className="px-2 py-1 rounded-lg bg-primary text-white font-medium min-h-[55px] min-w-[150px] text-sm"
              >
                {selected.year}
              </button>
              {showYearPicker && (
                <div className="absolute top-11 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-[260px]">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <button
                      onClick={() => setYearRangeStart((p) => p - 12)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
                    >
                      ‹
                    </button>
                    <span className="text-sm font-semibold text-gray-700">
                      {yearRangeStart} – {yearRangeStart + 11}
                    </span>
                    <button
                      onClick={() => setYearRangeStart((p) => p + 12)}
                      className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
                    >
                      ›
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from(
                      { length: 12 },
                      (_, i) => yearRangeStart + i,
                    ).map((year) => (
                      <button
                        key={year}
                        onClick={() => {
                          setSelected((prev) => ({ ...prev, year }));
                          setShowYearPicker(false);
                          // re-derive dates for the currently selected month in the new year
                          handleMonthSelect(selected.month, year);
                        }}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                          selected.year === year
                            ? "bg-gray-800 text-white"
                            : "hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {year}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Jan – Jun */}
            {MONTH_NAMES.slice(0, 6).map((month, index) => {
              const isSelected = !isYearly && selected.month === index;
              const periodLabel = getPeriodLabelFromMap(index, selected.year);
              return (
                <button
                  key={index}
                  onClick={() => handleMonthSelect(index)}
                  className={`relative flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-50 text-black border-gray-200 hover:border-primary hover:text-primary"
                  }`}
                >
                  <span className="font-semibold">{month}</span>
                  <span
                    className={`text-[10px] mt-0.5 ${isSelected ? "text-blue-100" : "text-black"}`}
                  >
                    {monthCloseDates[`${selected.year}-${index + 1}`]
                      ? periodLabel
                      : ""}
                  </span>
                </button>
              );
            })}

            {/* All (yearly) */}
            <button
              onClick={() => {
                setIsYearly(true);
                const { startDate } = getMonthRange(0, selected.year);
                const { endDate } = getMonthRange(11, selected.year);
                setSavedCloseStart(startDate);
                setSavedCloseEnd(endDate);
              }}
              className={`flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all w-full h-full ${
                isYearly
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              <span className="font-semibold">All</span>
              <span
                className={`text-[10px] mt-0.5 ${isYearly ? "text-blue-100" : "text-black"}`}
              >
                Jan → Dec
              </span>
            </button>

            {/* Jul – Dec */}
            {MONTH_NAMES.slice(6, 12).map((month, index) => {
              const realIndex = index + 6;
              const isSelected = !isYearly && selected.month === realIndex;
              const periodLabel = getPeriodLabelFromMap(
                realIndex,
                selected.year,
              );
              return (
                <button
                  key={realIndex}
                  onClick={() => handleMonthSelect(realIndex)}
                  className={`relative flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${
                    isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-gray-50 text-black border-gray-200 hover:border-primary hover:text-primary"
                  }`}
                >
                  <span className="font-semibold">{month}</span>
                  <span
                    className={`text-[10px] mt-0.5 ${isSelected ? "text-blue-100" : "text-black"}`}
                  >
                    {monthCloseDates[`${selected.year}-${realIndex + 1}`]
                      ? periodLabel
                      : ""}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Stats Section ── */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                title="Revenue Generated"
                value={
                  paymentsData?.totalRevenue
                    ? `₹${paymentsData.totalRevenue.toLocaleString()}`
                    : "—"
                }
                icon={icons.users}
                iconBg="bg-blue-50"
              />
              {roleId !== 2 && (
                <StatCard
                  title="Total Active Users"
                  value={paymentsData?.totalActiveUsers ?? "—"}
                  icon={icons.check}
                  iconBg="bg-yellow-50"
                />
              )}
              {roleId !== 2 && (
                <StatCard
                  title="No Invoice"
                  value={paymentsData?.totalNoInvoiceCreated ?? "—"}
                  icon={icons.noInvoice}
                  iconBg="bg-orange-50"
                />
              )}
              <StatCard
                title="Total Amount"
                value={
                  paymentsData?.totalAmount
                    ? `₹${paymentsData.totalAmount.toLocaleString()}`
                    : "—"
                }
                icon={icons.x}
                iconBg="bg-red-50"
              />
            </div>

            {/* Current Month */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h3 className="text-sm font-bold text-gray-700">
                  Current Month
                </h3>
                <span className="ml-auto text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-lg">
                  {new Date().toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: "Invoices Created",
                    value: paymentsData?.totalInvoiceCreatedThisMonth ?? "—",
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                    icon: icons.check,
                  },
                  {
                    label: "Total Amount Invoice",
                    value: paymentsData?.totalInvoiceAmountThisMonth
                      ? `₹${paymentsData.totalInvoiceAmountThisMonth.toLocaleString()}`
                      : "—",
                    color: "text-gray-800",
                    bg: "bg-gray-50",
                    icon: icons.users,
                  },
                  {
                    label: "Paid Amount Invoice",
                    value: paymentsData?.totalInvoicePaidAmountThisMonth
                      ? `₹${paymentsData.totalInvoicePaidAmountThisMonth.toLocaleString()}`
                      : "—",
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                    icon: icons.check,
                  },
                  {
                    label: "Unpaid Amount Invoice",
                    value: paymentsData?.totalInvoiceUnpaidAmountThisMonth
                      ? `₹${paymentsData.totalInvoiceUnpaidAmountThisMonth.toLocaleString()}`
                      : "—",
                    color: "text-red-500",
                    bg: "bg-red-50",
                    icon: icons.x,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-xl p-3 ${s.bg} flex items-center justify-between gap-2`}
                  >
                    <div>
                      <p className="text-[11px] font-medium leading-tight">
                        {s.label}
                      </p>
                      <p className={`text-base font-bold mt-0.5 ${s.color}`}>
                        {s.value}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center flex-shrink-0">
                      {s.icon}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Previous All Month */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <h3 className="text-sm font-bold text-gray-700">
                  Previous All Month
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {
                    label: "Invoices Created",
                    value: paymentsData?.totalInvoiceCreatedPrevAllMonth ?? "—",
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                    icon: icons.check,
                  },
                  {
                    label: "Total Amount Invoice",
                    value: paymentsData?.totalInvoiceAmountPrevAllMonth
                      ? `₹${paymentsData.totalInvoiceAmountPrevAllMonth.toLocaleString()}`
                      : "—",
                    color: "text-gray-800",
                    bg: "bg-gray-50",
                    icon: icons.users,
                  },
                  {
                    label: "Paid Amount Invoice",
                    value: paymentsData?.totalInvoicePaidAmountPrevAllMonth
                      ? `₹${paymentsData.totalInvoicePaidAmountPrevAllMonth.toLocaleString()}`
                      : "—",
                    color: "text-emerald-600",
                    bg: "bg-emerald-50",
                    icon: icons.check,
                  },
                  {
                    label: "Unpaid Amount Invoice",
                    value: paymentsData?.totalInvoiceUnpaidAmountPrevAllMonth
                      ? `₹${paymentsData.totalInvoiceUnpaidAmountPrevAllMonth.toLocaleString()}`
                      : "—",
                    color: "text-red-500",
                    bg: "bg-red-50",
                    icon: icons.x,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-xl p-3 ${s.bg} flex items-center justify-between gap-2`}
                  >
                    <div>
                      <p className="text-[11px] font-medium leading-tight">
                        {s.label}
                      </p>
                      <p className={`text-base font-bold mt-0.5 ${s.color}`}>
                        {s.value}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center flex-shrink-0">
                      {s.icon}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Payment Mode Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
            {paymentStats.map((s) => (
              <StatCard
                key={s.title}
                {...s}
                isActive={paymentFilter === s.filter}
                onClick={() => setPaymentFilter(s.filter)}
              />
            ))}
          </div>

          {/* ── Income Type Tabs ── */}
          <div className="w-full overflow-x-auto">
            <div className="flex items-center gap-2 pb-1 min-w-max sm:min-w-0">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedIncomeType(null)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap ${
                    selectedIncomeType === null
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-gray-600 border-gray-200"
                  }`}
                >
                  All
                </button>
                {incomeTypes.map((t) => (
                  <button
                    key={t.typeId}
                    onClick={() => setSelectedIncomeType(t.typeId)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap ${
                      selectedIncomeType === t.typeId
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-600 border-gray-200"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>

              <div className="ml-auto">
                <button
                  onClick={handleGenerateReport}
                  disabled={loadingPdf}
                  className="flex items-center gap-2 bg-primary hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition disabled:opacity-60"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeWidth={2}
                      d="M7 7h10M7 11h10M7 15h6M5 3h10l4 4v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"
                    />
                  </svg>
                  {loadingPdf ? "Generating…" : "Generate PDF"}
                </button>
              </div>
            </div>
          </div>

          <ClientPerformanceTable
            data={paymentsData?.payments || []}
            paymentFilter={paymentFilter}
            selectedBank={selectedBank}
          />
        </div>

        <Modal
          title="Invoice Report"
          open={isPdfModalVisible}
          onCancel={() => setIsPdfModalVisible(false)}
          width="70%"
          footer={null}
        >
          <div style={{ height: "80vh" }}>
            {pdfUrl && (
              <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                <Viewer fileUrl={pdfUrl} plugins={[pdfPlugin]} />
              </Worker>
            )}
          </div>
        </Modal>
      </Container>
    </Fragment>
  );
};

export default SuperadminIncome;
