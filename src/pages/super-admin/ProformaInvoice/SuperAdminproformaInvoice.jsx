import { Fragment, useState, useEffect, useRef } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { columns, defaultData } from "./constant";
import { useNavigate } from "react-router-dom";
import { CommonHexagonBadge } from "@/partials/common";
import { toAbsoluteUrl } from "@/utils";
import { TableComponent } from "@/components/table/TableComponent";
import PaymentCombinedModal from "../../../components/RecordPayment/PaymentCombinedModal";
import Swal from "sweetalert2";
import DateRangePicker from "../../../components/form-inputs/DatePicker/Daterangepicker";
import {
  GetSuperalladmininvoice,
  DELETEsuperadmininvoicenyid,
  GetAllPlans,
  Closedate,
  saveclosedate,
} from "@/services/apiServices";

const SuperAdminproformaInvoice = () => {
  const navigate = useNavigate();
  const [tableData, setTableData] = useState(defaultData);
  const [filterType, setFilterType] = useState("0");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [customRange, setCustomRange] = useState({ start: "", end: "" });
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState(
    Math.floor(new Date().getFullYear() / 12) * 12,
  );
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [closeStartDate, setCloseStartDate] = useState(null);
  const [closeEndDate, setCloseEndDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(-1);
  const [closeDayOfMonth, setCloseDayOfMonth] = useState(null);
  const [activeMonth, setActiveMonth] = useState(null);

  const [monthCloseDates, setMonthCloseDates] = useState({});
  const [totals, setTotals] = useState({
    totalInvoices: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalUnpaid: 0,
  });
  const isInitialLoad = useRef(true);
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

  // ─── Helpers ────────────────────────────────────────────────────────────────
  const dmyToDate = (str) => {
    if (!str) return new Date();
    const [d, m, y] = str.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const getActiveMonthIndex = (today, closeDay) => {
    const day = today.getDate();
    let month = today.getMonth();
    let year = today.getFullYear();

    // If today is BEFORE or equal close day → go to previous month
    if (day <= closeDay) {
      month = month - 1;
      if (month < 0) {
        month = 11;
        year = year - 1;
      }
    }

    return { month, year };
  };

  const getMonthStatus = (index) => {
    if (activeMonth === null) return "";

    if (index === activeMonth) return "active";
    if (index < activeMonth) return "locked";
    return "upcoming";
  };

  const formatDateAPI = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isoToDMY = (dateStr) => {
    if (!dateStr) return null;
    if (dateStr.includes("/")) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d)) return null;
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
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
  const getPeriodLabel = (monthIndex, year) => {
    const key = `${year}-${monthIndex + 1}`; // API is 1-indexed
    const entry = monthCloseDates[key];
    if (entry?.startDate && entry?.closeDate) {
      const start = dmyToDate(entry.startDate);
      const end = dmyToDate(entry.closeDate);
      const fmt = (d) => `${d.getDate()} ${monthShort[d.getMonth()]}`;
      return `${fmt(start)} → ${fmt(end)}`;
    }
    // Fallback: use closeDayOfMonth calculation
    const { start, end } = getClosePeriod(monthIndex, year, closeDayOfMonth);
    const fmt = (d) => `${d.getDate()} ${monthShort[d.getMonth()]}`;
    return `${fmt(start)} → ${fmt(end)}`;
  };

  // ─── Year Picker ────────────────────────────────────────────────────────────

  const YearPicker = () => {
    const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);
    return (
      <div className="relative">
        <button
          onClick={() => setShowYearPicker((v) => !v)}
          className="px-2 py-1 rounded-lg bg-primary text-white font-medium min-w-[40px]"
        >
          {selectedYear}
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
              {years.map((year) => (
                <button
                  key={year}
                  onClick={async () => {
                    setSelectedYear(year);
                    setShowYearPicker(false);

                    // Re-fetch close dates for new year
                    const map = await fetchAllCloseDates(year);

                    if (selectedMonth !== null && map) {
                      const key = `${year}-${selectedMonth + 1}`;
                      const monthData = map[key];
                      if (monthData?.closeDate) {
                        setCloseStartDate(monthData.startDate);
                        setCloseEndDate(monthData.closeDate);
                        setCloseDayOfMonth(monthData.closeDay);
                        fetchInvoices(monthData.startDate, monthData.closeDate);
                      }
                    }
                  }}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedYear === year
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
    );
  };

  // ─── API calls ──────────────────────────────────────────────────────────────

  const fetchInvoices = async (
    startDate = "",
    endDate = "",
    planId = selectedPlanId,
  ) => {
    try {
      const response = await GetSuperalladmininvoice(
        startDate,
        endDate,
        planId,
      );
      const apiData = response?.data?.data;
      if (!apiData) return;

      const list = Array.isArray(apiData.invoices) ? apiData.invoices : [];
      const invoiceList = list.map((item) => ({
        id: item.invoiceId,
        invoiceId: item.invoiceId,
        Invoice:
          item.invoiceCode || `INV-${String(item.invoiceId).padStart(4, "0")}`,
        CustomerName: item.customerName || "-",
        billingName: item.billingName || "-",
        plan: item.items?.map((i) => i.itemName).join(", ") || "-",
        TotalAmount: `₹ ${item.totalAmount?.toLocaleString("en-IN") || 0}`,
        rawTotalAmount: item.totalAmount || 0,
        rawBalanceDue: item.balanceDue || item.totalAmount || 0,
        Amount: `₹ ${item.subTotal?.toLocaleString("en-IN") || 0}`,
        DueDate: item.dueDate || "-",
        paidamount: `₹ ${(item.totalPaidAmount || 0).toLocaleString("en-IN")}`,
        BalanceDue: `₹ ${(item.totalUnpaidAmount || 0).toLocaleString("en-IN")}`,
        invoiceDate: item.invoiceDate || "-",
        status: item.status || "-",
      }));

      setTableData(invoiceList);
      setTotals({
        totalInvoices: apiData.totalInvoices || 0,
        totalAmount: apiData.totalAmount || 0,
        totalPaid: apiData.totalPaidAmount || 0,
        totalUnpaid: apiData.totalUnPaidAmount || 0,
      });
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const fetchAllCloseDates = async (year) => {
    try {
      const res = await Closedate(-1, year);
      const dates = res?.data?.closeDate?.dates ?? [];
      if (dates.length === 0) return null;

      const newMap = {};
      dates.forEach((d) => {
        const key = `${d.year}-${d.month}`; // e.g. "2026-4"
        const closeDay = d.closeDate
          ? parseInt(d.closeDate.split("/")[0], 10)
          : null;
        newMap[key] = {
          key,
          monthIndex: d.month - 1, // 0-indexed for JS
          startDate: d.startDate, // "10/04/2026"
          closeDate: d.closeDate, // "11/05/2026"
          closeDay,
        };
      });

      setMonthCloseDates(newMap);
      return newMap;
    } catch (err) {
      console.error("Failed to fetch all close dates:", err);
      return null;
    }
  };

  // ── Fetch single month close date ─────────────────────────────────────────
  const fetchSingleMonthCloseDate = async (monthIndex, year) => {
    try {
      const res = await Closedate(monthIndex + 1, year); // 0-index → 1-index
      const d = res?.data?.closeDate ?? null;
      if (!d) return null;
      return {
        key: `${d.year}-${d.month}`,
        monthIndex: d.month - 1,
        startDate: d.startDate,
        closeDate: d.closeDate,
        closeDay: d.closeDate ? parseInt(d.closeDate.split("/")[0], 10) : null,
      };
    } catch (err) {
      console.error("Failed to fetch single month close date:", err);
      return null;
    }
  };

  // ── On mount: fetch all → find active period → load invoices ─────────────
  useEffect(() => {
    const init = async () => {
      const map = await fetchAllCloseDates(selectedYear);
      if (!map) return;

      const today = new Date();
      let activeEntry = null;

      // Find which period today falls into
      for (const entry of Object.values(map)) {
        if (!entry.startDate || !entry.closeDate) continue;
        const start = dmyToDate(entry.startDate);
        const end = dmyToDate(entry.closeDate);
        if (today >= start && today <= end) {
          activeEntry = entry;
          break;
        }
      }

      // Fallback: use current calendar month from map
      if (!activeEntry) {
        const fallbackKey = `${selectedYear}-${today.getMonth() + 1}`;
        activeEntry = map[fallbackKey] ?? null;
      }

      // Last resort: fetch single month
      if (!activeEntry) {
        activeEntry = await fetchSingleMonthCloseDate(
          today.getMonth(),
          today.getFullYear(),
        );
      }

      if (!activeEntry) return;

      const monthIdx = activeEntry.monthIndex;
      const apiYear = parseInt(activeEntry.key.split("-")[0], 10);

      setSelectedMonth(monthIdx);
      setSelectedYear(apiYear);
      setActiveMonth(monthIdx);
      setCloseStartDate(activeEntry.startDate);
      setCloseEndDate(activeEntry.closeDate);
      setCloseDayOfMonth(activeEntry.closeDay);

      isInitialLoad.current = false;

      fetchInvoices(activeEntry.startDate, activeEntry.closeDate);
    };

    init();
  }, []);

  useEffect(() => {
    GetAllPlans()
      .then((res) => {
        const list = res?.data?.data?.["Plan Details"] || [];
        setPlans(Array.isArray(list) ? list : []);
      })
      .catch(() => setPlans([]));
  }, []);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleRecordPayment = (invoiceRow) => setSelectedInvoice(invoiceRow);
  const handleAddInvoice = () => navigate("/addInvoice");

  const handleMonthFilter = async (monthIndex) => {
    isInitialLoad.current = false;
    setSelectedMonth(monthIndex);

    const key = `${selectedYear}-${monthIndex + 1}`; // API is 1-indexed
    let monthData = monthCloseDates[key];

    // Not in cache? fetch single month
    if (!monthData?.closeDate) {
      monthData = await fetchSingleMonthCloseDate(monthIndex, selectedYear);
      if (monthData) {
        // Add to cache
        setMonthCloseDates((prev) => ({ ...prev, [key]: monthData }));
      }
    }

    if (monthData?.closeDate) {
      setCloseStartDate(monthData.startDate);
      setCloseEndDate(monthData.closeDate);
      setCloseDayOfMonth(monthData.closeDay);
      fetchInvoices(monthData.startDate, monthData.closeDate);
    } else {
      // Hard fallback: calendar month
      const start = new Date(selectedYear, monthIndex, 1);
      const end = new Date(selectedYear, monthIndex + 1, 0);
      fetchInvoices(formatDateAPI(start), formatDateAPI(end));
    }
  };

  const handleSelect = (planId) => {
    const finalPlanId = planId === "all" ? -1 : planId;
    setSelectedPlan(planId);
    setSelectedPlanId(finalPlanId);

    if (closeStartDate && closeEndDate) {
      // ← use the currently active date range directly
      fetchInvoices(closeStartDate, closeEndDate, finalPlanId);
    } else {
      fetchInvoices("", "", finalPlanId);
    }
  };

  const handleCloseDateChange = async (dmy_start, dmy_end) => {
    if (!dmy_start || !dmy_end) return;
    const { isConfirmed } = await Swal.fire({
      title: "Change Close Date?",
      text: `Set range: ${dmy_start} → ${dmy_end}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1d4ed8",
      cancelButtonColor: "#e5e7eb",
      confirmButtonText: "Yes, update it",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "!rounded-2xl",
        confirmButton: "!rounded-xl",
        cancelButton: "!rounded-xl",
      },
    });
    if (!isConfirmed) return;

    try {
      await saveclosedate(dmy_start, dmy_end);

      // ✅ Update display dates immediately
      setCloseStartDate(dmy_start);
      setCloseEndDate(dmy_end);

      const [d] = dmy_end.split("/");
      const newCloseDay = parseInt(d, 10);
      setCloseDayOfMonth(newCloseDay);

      // ✅ Compute new active month and snap to it
      const { month: activeM, year: activeY } = getActiveMonthIndex(
        new Date(),
        newCloseDay,
      );
      setActiveMonth(activeM);
      setSelectedMonth(activeM); // ✅ select the active month, don't set null
      setSelectedYear(activeY);

      // ✅ Fetch invoices for the new active month using saved dates
      fetchInvoices(dmy_start, dmy_end);

      Swal.fire({
        title: "Updated!",
        text: `Range: ${dmy_start} → ${dmy_end}`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        title: "Failed!",
        text: "Could not update close date.",
        icon: "error",
        confirmButtonColor: "#1d4ed8",
      });
    }
  };
  const displayStart = closeStartDate ?? "dd/mm/yyyy";
  const displayEnd = closeEndDate ?? "dd/mm/yyyy";

  const steps = [
    {
      title: "Total Invoice Created",
      value: totals.totalInvoices || 0,
      icon: <i className="ki-filled ki-wallet text-xl text-primary"></i>,
    },
    {
      title: "Total Amount",
      value: `₹ ${(totals.totalAmount || 0).toLocaleString("en-IN")}`,
      icon: <i className="ki-filled ki-credit-cart text-xl text-primary"></i>,
    },
    {
      title: "Total Paid",
      value: `₹ ${(totals.totalPaid || 0).toLocaleString("en-IN")}`,
      icon: <i className="ki-filled ki-bill text-xl text-primary"></i>,
    },
    {
      title: "Total Remaining",
      value: `₹ ${(totals.totalUnpaid || 0).toLocaleString("en-IN")}`,
      icon: <i className="ki-filled ki-abstract-14 text-xl text-primary"></i>,
    },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <Fragment>
      <style>
        {`
          .user-access-bg {
            background-image: url('${toAbsoluteUrl("/images/bg_01.png")}');
          }
          .dark .user-access-bg {
            background-image: url('${toAbsoluteUrl("/images/bg_01_dark.png")}');
          }
        `}
      </style>

      <Container>
        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-medium text-black">Proforma Invoice</h1>
            {/* <button
              onClick={() => {
                setSelectedMonth(null);
                if (closeStartDate && closeEndDate) {
                  fetchInvoices(closeStartDate, closeEndDate);
                } else {
                  fetchInvoices("", "");
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-sm w-fit ${
                selectedMonth === null
                  ? "bg-[#005BA8] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              Close Date
            </button> */}
          </div>

          {/* Financial period card */}
          <div
            className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 border border-gray-100 cursor-pointer hover:shadow-md transition"
            onClick={() => setShowDatePicker(true)}
          >
            <div className="flex-1">
              <p className="text-xs text-gray-400 font-medium mb-2">
                Month Close Date
              </p>
              <div className="flex items-center gap-2">
                <div className="bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-400 mb-0.5">Start</p>
                  <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                    {displayStart}
                  </p>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-gray-300 flex-shrink-0"
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
                <div className="bg-gray-50 rounded-xl px-3 py-2">
                  <p className="text-xs text-gray-400 mb-0.5">End</p>
                  <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                    {displayEnd}
                  </p>
                </div>
              </div>
            </div>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
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

          {showDatePicker && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowDatePicker(false);
              }}
            >
              <DateRangePicker
                startDate={closeStartDate}
                endDate={closeEndDate}
                onCancel={() => setShowDatePicker(false)}
                onApply={(dmy_start, dmy_end) => {
                  setShowDatePicker(false);
                  handleCloseDateChange(dmy_start, dmy_end);
                }}
              />
            </div>
          )}
        </div>

        {/* ── Year Picker + Month cards ── */}
        <div className="grid grid-cols-7 gap-3 mb-4">
          {/* Year (Column 1, Row 1) */}
          <div>
            <YearPicker />
          </div>

          {/* First 6 Months (Row 1, Col 2–7) */}
          {monthNames.slice(0, 6).map((month, index) => {
            const isSelected = selectedMonth === index;
            const status = getMonthStatus(index);
            const periodLabel = getPeriodLabel(index, selectedYear);

            return (
              <button
                key={index}
                onClick={() => handleMonthFilter(index)}
                className={`relative flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${
                  isSelected
                    ? "bg-[#005BA8] text-white border-[#005BA8]"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#005BA8] hover:text-[#005BA8]"
                }`}
              >
                <span className="font-semibold">{month}</span>

                <span
                  className={`text-[10px] mt-0.5 ${
                    isSelected ? "text-blue-100" : "text-black"
                  }`}
                >
                  {closeDayOfMonth != null ? periodLabel : ""}
                </span>
              </button>
            );
          })}

          {/* Next 6 Months (Row 2, Col 2–7) */}
          {monthNames.slice(6, 12).map((month, index) => {
            const realIndex = index + 6;
            const isSelected = selectedMonth === realIndex;

            const periodLabel = getPeriodLabel(
              realIndex,
              selectedYear,
              closeDayOfMonth,
            );

            return (
              <button
                key={realIndex}
                onClick={() => handleMonthFilter(realIndex)}
                className={`flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${
                  isSelected
                    ? "bg-[#005BA8] text-white border-[#005BA8]"
                    : "bg-gray-50 text-black border-gray-200 hover:border-[#005BA8] hover:text-[#005BA8]"
                }`}
              >
                <span className="font-semibold">{month}</span>
                <span
                  className={`text-[10px] mt-0.5 ${isSelected ? "text-blue-100" : "text-black-400"}`}
                >
                  {closeDayOfMonth != null ? periodLabel : ""}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Plan Tabs + View Overall ── */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center bg-gray-100 rounded-full p-1 gap-1">
            <button
              onClick={() => handleSelect("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                selectedPlan === "all"
                  ? "bg-[#005BA8] text-white shadow-sm"
                  : "text-black hover:text-[#005BA8]"
              }`}
            >
              All Plans
            </button>
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleSelect(plan.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                  selectedPlan === plan.id
                    ? "bg-[#005BA8] text-white shadow-sm"
                    : "text-black hover:text-[#005BA8]"
                }`}
              >
                {plan.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setSelectedPlan("all");
              setSelectedMonth(null);
              fetchInvoices();
            }}
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-gray-200 bg-white text-[#005BA8] font-semibold text-sm hover:shadow-sm transition-all"
          >
            View Overall Data
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </button>
        </div>

        {/* ── Filters + Actions ── */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3 mt-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder="Search invoice"
                type="text"
              />
            </div>
            {filterType === "3" && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  className="input"
                  value={customRange.start}
                  onChange={(e) =>
                    setCustomRange((p) => ({ ...p, start: e.target.value }))
                  }
                />
                <input
                  type="date"
                  className="input"
                  value={customRange.end}
                  onChange={(e) =>
                    setCustomRange((p) => ({ ...p, end: e.target.value }))
                  }
                />
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    fetchInvoices(
                      formatDateAPI(customRange.start),
                      formatDateAPI(customRange.end),
                    )
                  }
                >
                  Apply
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {/* <button className="btn btn-primary" title="Download">
              Download
            </button> */}
            <button className="btn btn-primary" onClick={handleAddInvoice}>
              Add Invoice
            </button>
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4 mb-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="card min-w-full p-4 rtl:[background-position:-center_center] [background-position:center_center] bg-no-repeat bg-[length:460px] user-access-bg"
            >
              <div className="flex flex-col items-center justify-center w-full gap-2">
                <CommonHexagonBadge
                  stroke="stroke-primary-clarity"
                  fill="fill-light"
                  size="size-[50px]"
                  badge={step.icon}
                />
                <div className="flex flex-col items-center justify-center w-full">
                  <p className="form-info text-gray-700 font-normal text-center mb-0">
                    {step.title}
                  </p>
                  <h3 className="text-xl font-semibold text-primary mb-0">
                    {step.value}
                  </h3>
                </div>
              </div>
            </div>
          ))}
        </div>

        <TableComponent
          columns={columns(handleDelete, handleRecordPayment)}
          data={tableData}
        />

        <PaymentCombinedModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoiceData={selectedInvoice}
        />
      </Container>
    </Fragment>
  );

  // handleDelete kept accessible in scope for columns()
  async function handleDelete(id) {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This invoice will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });
    if (result.isConfirmed) {
      try {
        await DELETEsuperadmininvoicenyid(id);
        Swal.fire({
          title: "Deleted!",
          text: "Invoice has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchInvoices();
      } catch {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete invoice.",
          icon: "error",
        });
      }
    }
  }
};

export default SuperAdminproformaInvoice;
