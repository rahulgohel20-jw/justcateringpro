import { Fragment, useState, useEffect, useRef } from "react";
import { Container } from "@/components/container";
import { columns, defaultData, currentMonthPaidColumns } from "./constant";
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
} from "@/services/apiServices";
import { usePermission } from "../../../hooks/usePermission";
import useCloseDate from "@/hooks/useCloseDate";

const SuperadminInvoice = () => {
  const permissions = usePermission("Plans");
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
  const [viewDocUrl, setViewDocUrl] = useState(null);
  const [customerId, setCustomerId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [readyToRender, setReadyToRender] = useState(false);
  const [totals, setTotals] = useState({
    totalInvoicesThisMonth: 0,
    totalAmountThisMonth: 0,
    totalPaidAmountThisMonth: 0,
    totalUnPaidAmountThisMonth: 0,
    totalPaidInvoiceCountThisMonth: 0,
    totalUnpaidInvoiceCountThisMonth: 0,
    totalInvoiceCount: 0,
    totalUnpaidInvoiceCountPrevAllMonth: 0,
    totalUnpaidInvoiceAmountPrevAllMonth: 0,
    totalPaidAmountPrevAllMonth: 0,
    totalRemainingAmountPrevAllMonth: 0,
    totalInvoiceAmount: 0,
    totalUnpaidInvoiceCount: 0,
    totalPaidAmount: 0,
    totalUnpaidAmount: 0,
  });
  const [currentMonthPaidData, setCurrentMonthPaidData] = useState([]);
const [loadingPaidMonth, setLoadingPaidMonth] = useState(false);
const [loadingInvoice, setLoadingInvoice] = useState(false);
  const autoSetDone = useRef(false);

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

  const {
    monthCloseDates,
    isLoading: closeDateLoading,
    saveCloseDate,
    isSaving,
    refetch: refetchCloseDates,
  } = useCloseDate(selectedMonth, selectedYear);

  useEffect(() => {
    if (closeDateLoading) return;
    if (autoSetDone.current) return;
    if (!monthCloseDates || Object.keys(monthCloseDates).length === 0) return;

    const today = new Date();
    let activeEntry = null;

    activeEntry =
      Object.values(monthCloseDates).find((e) => e.isActive === true) ?? null;

    if (!activeEntry) {
      for (const entry of Object.values(monthCloseDates)) {
        if (!entry.startDate || !entry.closeDate) continue;
        const start = dmyToDate(entry.startDate);
        const end = dmyToDate(entry.closeDate);
        if (today >= start && today <= end) {
          activeEntry = entry;
          break;
        }
      }
    }

    if (!activeEntry) {
      const upcoming = Object.values(monthCloseDates)
        .filter((e) => e.startDate)
        .sort((a, b) => dmyToDate(a.startDate) - dmyToDate(b.startDate))
        .find((e) => dmyToDate(e.startDate) >= today);
      activeEntry = upcoming ?? null;
    }

    if (!activeEntry) {
      const sorted = Object.values(monthCloseDates)
        .filter((e) => e.startDate)
        .sort((a, b) => dmyToDate(b.startDate) - dmyToDate(a.startDate));
      activeEntry = sorted[0] ?? null;
    }

    if (activeEntry) {
      const monthIdx = activeEntry.month - 1;
      setSelectedMonth(monthIdx);
      setSelectedYear(activeEntry.year);
      setActiveMonth(monthIdx);
      setCloseStartDate(activeEntry.startDate);
      setCloseEndDate(activeEntry.closeDate);
      setCloseDayOfMonth(activeEntry.closeDay);
      fetchInvoices(activeEntry.startDate, activeEntry.closeDate);
    }

    autoSetDone.current = true;
    setReadyToRender(true);
  }, [monthCloseDates, closeDateLoading]);

  useEffect(() => {
    if (!autoSetDone.current) return;
    if (selectedMonth == null) return;
    const key = `${selectedYear}-${selectedMonth + 1}`;
    const entry = monthCloseDates[key];
    if (entry?.startDate && entry?.closeDate) {
      setCloseStartDate(entry.startDate);
      setCloseEndDate(entry.closeDate);
      setCloseDayOfMonth(entry.closeDay);
    }
  }, [selectedYear, selectedMonth, monthCloseDates]);

  const dmyToDate = (str) => {
    if (!str) return new Date();
    const [d, m, y] = str.split("/");
    return new Date(Number(y), Number(m) - 1, Number(d));
  };

  const formatDateAPI = (date) => {
    const d = new Date(date);
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
    const key = `${year}-${monthIndex + 1}`;
    const entry = monthCloseDates[key];

    if (entry?.startDate && entry?.closeDate) {
      const fmt = (d) => `${d.getDate()} ${monthShort[d.getMonth()]}`;
      return `${fmt(dmyToDate(entry.startDate))} → ${fmt(dmyToDate(entry.closeDate))}`;
    }

    return "";
  };

  const getMonthStatus = (index) => {
    if (activeMonth === null) return "";
    if (index === activeMonth) return "active";
    if (index < activeMonth) return "locked";
    return "upcoming";
  };

  const fetchInvoices = async (
    startDate = "",
    endDate = "",
    planId = selectedPlanId,
    custId = customerId,
  ) => {
    setLoadingInvoice(true);
    try {
      const response = await GetSuperalladmininvoice(
        startDate,
        endDate,
        planId,
        customerId || "",
      );
      const apiData = response?.data?.data;
      if (!apiData) return;

      const mapInvoice = (item) => ({
        id: item.invoiceId,
        invoiceId: item.invoiceId,
        Invoice:
          item.invoiceCode || `INV-${String(item.invoiceId).padStart(4, "0")}`,
        CustomerName: item.customerName || "-",
        billingName: item.billingName || "-",
        plan: Array.isArray(item.items)
          ? item.items.map((i) => i.itemName).join(", ")
          : "-",
        TotalAmount: `₹ ${(item.totalAmount || 0).toLocaleString("en-IN")}`,
        rawTotalAmount: item.totalAmount || 0,
        rawBalanceDue: item.balanceDue || item.totalAmount || 0,
        Amount: `₹ ${(item.subTotal || 0).toLocaleString("en-IN")}`,
        DueDate: item.dueDate || "-",
        paidamount: `₹ ${(item.totalPaidAmount || 0).toLocaleString("en-IN")}`,
        BalanceDue: `₹ ${(item.totalUnpaidAmount || 0).toLocaleString("en-IN")}`,
        invoiceDate: item.invoiceDate || "-",
        status: item.status || "-",
        docPath: item.docPath || null,
      });

      setTableData(
        (Array.isArray(apiData.invoices) ? apiData.invoices : []).map(
          mapInvoice,
        ),
      );
      setCurrentMonthPaidData(
        (Array.isArray(apiData.totalPaidInvoiceThisMonth)
          ? apiData.totalPaidInvoiceThisMonth
          : []
        ).map(mapInvoice),
      );
      setTotals({
        totalInvoicesThisMonth: apiData.totalInvoicesThisMonth ?? 0,
        totalAmountThisMonth: apiData.totalAmountThisMonth ?? 0,
        totalPaidAmountThisMonth: apiData.totalPaidAmountThisMonth ?? 0,
        totalUnPaidAmountThisMonth: apiData.totalUnPaidAmountThisMonth ?? 0,
        totalPaidInvoiceCountThisMonth:
          apiData.totalPaidInvoiceCountThisMonth ?? 0,
        totalUnpaidInvoiceCountThisMonth:
          apiData.totalUnpaidInvoiceCountThisMonth ?? 0,

        totalUnpaidInvoiceCountPrevAllMonth:
          apiData.totalUnpaidInvoiceCountPrevAllMonth ?? 0,
        totalUnpaidInvoiceAmountPrevAllMonth:
          apiData.totalUnpaidInvoiceAmountPrevAllMonth ?? 0,
        totalPaidAmountPrevAllMonth: apiData.totalPaidAmountPrevAllMonth ?? 0,
        totalRemainingAmountPrevAllMonth:
          apiData.totalRemainingAmountPrevAllMonth ?? 0,

        totalInvoiceAmount: apiData.totalInvoiceAmount ?? 0,
        totalUnpaidInvoiceCount: apiData.totalUnpaidInvoiceCount ?? 0,
        totalInvoiceCount: apiData.totalInvoiceCount ?? 0,
        totalPaidAmount: apiData.totalPaidAmount ?? 0,
        totalUnpaidAmount: apiData.totalUnpaidAmount ?? 0,
        totalPendingInvoiceCountThisMonth:
          apiData.totalPendingInvoiceCountThisMonth ?? 0,
      });
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
     finally {
    setLoadingInvoice(false);
  }
  };

  useEffect(() => {
    GetAllPlans()
      .then((res) => {
        const list = res?.data?.data?.["Plan Details"] || [];
        setPlans(Array.isArray(list) ? list : []);
      })
      .catch(() => setPlans([]));
  }, []);

  const filteredTableData = tableData.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      row.Invoice?.toLowerCase().includes(q) ||
      row.CustomerName?.toLowerCase().includes(q) ||
      row.billingName?.toLowerCase().includes(q) ||
      row.invoiceDate?.toLowerCase().includes(q)
    );
  });

  const filteredPaidData = currentMonthPaidData.filter((row) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      row.Invoice?.toLowerCase().includes(q) ||
      row.CustomerName?.toLowerCase().includes(q) ||
      row.billingName?.toLowerCase().includes(q) ||
      row.invoiceDate?.toLowerCase().includes(q)
    );
  });

  const handleRecordPayment = (invoiceRow) => setSelectedInvoice(invoiceRow);
  const handleAddInvoice = () => navigate("/addInvoice");
  const handleViewDoc = (url) => {
    if (url) setViewDocUrl(url);
  };

  const handleMonthFilter = (monthIndex) => {
    setSelectedMonth(monthIndex);

    const key = `${selectedYear}-${monthIndex + 1}`;
    const entry = monthCloseDates[key];

    if (entry?.startDate && entry?.closeDate) {
      setCloseStartDate(entry.startDate);
      setCloseEndDate(entry.closeDate);
      setCloseDayOfMonth(entry.closeDay);
      fetchInvoices(
        entry.startDate,
        entry.closeDate,
        selectedPlanId,
        customerId,
      );
    } else {
      const start = new Date(selectedYear, monthIndex, 1);
      const end = new Date(selectedYear, monthIndex + 1, 0);
      const sd = formatDateAPI(start);
      const ed = formatDateAPI(end);
      setCloseStartDate(sd);
      setCloseEndDate(ed);
      fetchInvoices(sd, ed, selectedPlanId, customerId);
    }
  };

  const handleSelect = (planId) => {
    const finalPlanId = planId === "all" ? -1 : planId;
    setSelectedPlan(planId);
    setSelectedPlanId(finalPlanId);
    if (closeStartDate && closeEndDate) {
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

    saveCloseDate(
      { startDate: dmy_start, endDate: dmy_end },
      {
        onSuccess: () => {
          setCloseStartDate(dmy_start);
          setCloseEndDate(dmy_end);
          const newCloseDay = parseInt(dmy_end.split("/")[0], 10);
          setCloseDayOfMonth(newCloseDay);
          fetchInvoices(dmy_start, dmy_end);
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
            text: "Could not update close date.",
            icon: "error",
          }),
      },
    );
  };

  const YearPicker = () => {
    const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);
    return (
      <div className="relative">
        <button
          onClick={() => setShowYearPicker((v) => !v)}
          className="px-2 py-1 rounded-lg bg-primary text-white font-medium min-h-[55px] min-w-[144px]"
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
                  onClick={() => {
                    setSelectedYear(year);
                    setShowYearPicker(false);
                  
                    if (selectedMonth != null) {
                      const key = `${year}-${selectedMonth + 1}`;
                      const entry = monthCloseDates[key];
                      if (entry?.startDate && entry?.closeDate) {
                        setCloseStartDate(entry.startDate);
                        setCloseEndDate(entry.closeDate);
                        setCloseDayOfMonth(entry.closeDay);
                        fetchInvoices(entry.startDate, entry.closeDate);
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

  const displayStart = closeStartDate ?? "dd/mm/yyyy";
  const displayEnd = closeEndDate ?? "dd/mm/yyyy";

  const steps = [
    {
      title: "Total Invoice Created",
      value: totals.totalInvoicesThisMonth ?? 0,
      icon: <i className="ki-filled ki-wallet text-xl text-primary" />,
    },
    {
      title: "Total Amount",
      value: `₹ ${(totals.totalAmountThisMonth ?? 0).toLocaleString("en-IN")}`,
      icon: <i className="ki-filled ki-credit-cart text-xl text-primary" />,
    },
    // {
    //   title: "Current Month Collections Count",
    //   value: totals.totalPaidInvoiceCountThisMonth ?? 0,
    //   icon: <i className="ki-filled ki-wallet text-xl text-primary" />,
    // },
    {
      title: "Total Paid Amount",
      value: `₹ ${(totals.totalPaidAmountThisMonth ?? 0).toLocaleString("en-IN")}`,
      icon: <i className="ki-filled ki-bill text-xl text-primary" />,
    },
    // {
    //   title: "Partial paid Invoice Count",
    //   value: totals.totalPendingInvoiceCountThisMonth ?? 0, // ✅ no ₹, it's a count
    //   icon: <i className="ki-filled ki-wallet text-xl text-primary" />,
    // },
    // {
    //   title: "Total Remaining Count",
    //   value: totals.totalUnpaidInvoiceCountThisMonth ?? 0,
    //   icon: <i className="ki-filled ki-wallet text-xl text-primary" />,
    // },
    {
      title: "Total Unpaid Amount",
      value: `₹ ${(totals.totalUnPaidAmountThisMonth ?? 0).toLocaleString("en-IN")}`,
      icon: <i className="ki-filled ki-abstract-14 text-xl text-primary" />,
    },
  ];

  const stepspervious = [
    {
      title: " Total Unpaid Invoice  Count",
      value: totals.totalUnpaidInvoiceCountPrevAllMonth ?? 0,
      icon: <i className="ki-filled ki-wallet text-xl text-primary" />,
    },
    {
      title: "Total Unpaid Amount",
      value: `₹ ${(totals.totalUnpaidInvoiceAmountPrevAllMonth ?? 0).toLocaleString("en-IN")}`,
      icon: <i className="ki-filled ki-credit-cart text-xl text-primary" />,
    },
    {
      title: "Total Paid Amount This Month",
      value: `₹ ${(totals.totalPaidAmountPrevAllMonth ?? 0).toLocaleString("en-IN")}`,
      icon: <i className="ki-filled ki-wallet text-xl text-primary" />,
    },
    // {
    //   title: "Still Unpaid Count",
    //   value: totals.totalUnpaidInvoiceCountPrevAllMonth ?? 0,
    //   icon: <i className="ki-filled ki-wallet text-xl text-primary" />,
    // },
    {
      title: "Total Unpaid Amount",
      value: `₹ ${(totals.totalRemainingAmountPrevAllMonth ?? 0).toLocaleString("en-IN")}`,
      icon: <i className="ki-filled ki-abstract-14 text-xl text-primary" />,
    },
  ];

  if (!readyToRender && closeDateLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  const handlePaidInvoiceClick = (invoiceId) => {
    navigate(`/super/invoice-preview/${invoiceId}`, {
      state: { selectedMonth, selectedYear },
    });
  };
  return (
    <Fragment>
      <style>{`
        .user-access-bg { background-image: url('${toAbsoluteUrl("/images/bg_01.png")}'); }
        .dark .user-access-bg { background-image: url('${toAbsoluteUrl("/images/bg_01_dark.png")}'); }
      `}</style>

      <Container>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-medium text-black">Invoice Overview</h1>

          {/* Month Close Date card */}
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

        {/* ── Year + Month grid ── */}
        <div className="grid grid-cols-7 gap-3 mb-2">
          <div>
            <YearPicker />
          </div>
        {monthNames.slice(0, 6).map((month, index) => {
  const isSelected = selectedMonth === index;
  return (
    <button
      key={index}
      disabled={loadingInvoice}
      onClick={() => handleMonthFilter(index)}
      className={`relative flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all
        ${isSelected ? "bg-[#005BA8] text-white border-[#005BA8]" : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#005BA8] hover:text-[#005BA8]"}
        ${loadingInvoice && !isSelected ? "opacity-50 cursor-not-allowed" : ""}
        ${isSelected && loadingInvoice ? "opacity-80 cursor-wait" : ""}
      `}
    >
      <span className="font-semibold">{month}</span>
      <span className={`text-[10px] mt-0.5 ${isSelected ? "text-blue-100" : "text-black"}`}>
        {getPeriodLabel(index, selectedYear)}
      </span>
      {isSelected && loadingInvoice && (
        <span className="absolute top-1.5 right-1.5">
          <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </span>
      )}
    </button>
            );
          })}
        </div>

        <div className="grid grid-cols-7 gap-3 mb-4">
          <button
            onClick={() => {
              setSelectedMonth(null);
              const sd = formatDateAPI(new Date(selectedYear, 0, 1));
              const ed = formatDateAPI(new Date(selectedYear, 11, 31));
              setCloseStartDate(sd);
              setCloseEndDate(ed);
              fetchInvoices(sd, ed, selectedPlanId);
            }}
            className={`flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all w-full h-full ${
              selectedMonth === null
                ? "bg-[#005BA8] text-white border-[#005BA8]"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#005BA8] hover:text-[#005BA8]"
            }`}
          >
            <span className="font-semibold">All</span>
            <span
              className={`text-[10px] mt-0.5 ${selectedMonth === null ? "text-blue-100" : "text-black"}`}
            >
              1 Jan → 31 Dec
            </span>
          </button>

          {monthNames.slice(6, 12).map((month, index) => {
  const realIndex = index + 6;
  const isSelected = selectedMonth === realIndex;
  return (
    <button
      key={realIndex}
      disabled={loadingInvoice}
      onClick={() => handleMonthFilter(realIndex)}
      className={`relative flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all
        ${isSelected ? "bg-[#005BA8] text-white border-[#005BA8]" : "bg-gray-50 text-black border-gray-200 hover:border-[#005BA8] hover:text-[#005BA8]"}
        ${loadingInvoice && !isSelected ? "opacity-50 cursor-not-allowed" : ""}
        ${isSelected && loadingInvoice ? "opacity-80 cursor-wait" : ""}
      `}
    >
      <span className="font-semibold">{month}</span>
      <span className={`text-[10px] mt-0.5 ${isSelected ? "text-blue-100" : "text-black"}`}>
        {getPeriodLabel(realIndex, selectedYear)}
      </span>
      {isSelected && loadingInvoice && (
        <span className="absolute top-1.5 right-1.5">
          <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </span>
      )}
    </button>
            );
          })}
        </div>

        {/* ── Plan tabs ── */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center bg-gray-100 rounded-full p-1 gap-1">
            <button
              onClick={() => handleSelect("all")}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${selectedPlan === "all" ? "bg-[#005BA8] text-white shadow-sm" : "text-black hover:text-[#005BA8]"}`}
            >
              All
            </button>
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handleSelect(plan.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${selectedPlan === plan.id ? "bg-[#005BA8] text-white shadow-sm" : "text-black hover:text-[#005BA8]"}`}
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
          </button>
        </div>

        {/* ── Search + Add ── */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3 mt-3">
          <div className="filItems relative">
            <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3" />
            <input
              className="input pl-8"
              placeholder="Search by invoice, customer, company, date..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute top-1/2 right-0 -translate-y-1/2 me-3 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {permissions.add && (
              <button className="btn btn-primary" onClick={handleAddInvoice}>
                Add Invoice
              </button>
            )}
          </div>
        </div>

        {/* ── Summary cards ── */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Current month
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Invoices created and collected in the current billing period
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
            {monthNames[selectedMonth ?? new Date().getMonth()]} {selectedYear}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 mb-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className="card min-w-full p-4 [background-position:center_center] bg-no-repeat bg-[length:460px] user-access-bg"
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              Previous months
            </h2>
            <p className="text-xs  mt-0.5">
              Cumulative dues and collections from all prior billing periods
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
            Historical
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 mb-2">
          {stepspervious.map((step, index) => (
            <div
              key={index}
              className="card min-w-full p-4 [background-position:center_center] bg-no-repeat bg-[length:460px] user-access-bg"
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
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 mb-4">
          <div className="grid grid-cols-4 gap-3 mb-2 text-center">
            <div className="flex flex-col items-center justify-center">
              <p className="text-xs text-blue-500 mb-1">Total Invoices</p>
              <p className="text-lg font-semibold text-blue-900">
                {totals.totalInvoiceCount ?? 0}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <p className="text-xs text-blue-500 mb-1">Total Amount</p>
              <p className="text-lg font-semibold text-blue-900">
                ₹ {(totals.totalInvoiceAmount ?? 0).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <p className="text-xs text-blue-500 mb-1">Total Paid Amount</p>
              <p className="text-lg font-semibold text-blue-900">
                ₹ {(totals.totalPaidAmount ?? 0).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center">
              <p className="text-xs text-blue-500 mb-1">Total Unpaid Amount</p>
              <p className="text-lg font-semibold text-blue-900">
                ₹ {(totals.totalUnpaidAmount ?? 0).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-base font-semibold text-gray-800">
            Invoice list
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            All invoices for the selected period
          </p>
        </div>
        <TableComponent
          key={`${closeStartDate}-${closeEndDate}`}
          columns={columns(
            handleDelete,
            handleRecordPayment,
            handleViewDoc,
            permissions,
          )}
          data={filteredTableData}
        />

        <PaymentCombinedModal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          invoiceData={selectedInvoice}
        />

        {/* ── Paid this month ── */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Paid Invoices — Current Month
              </h2>
              <p className="text-xs mt-0.5">
                All invoices marked as Paid in the current calendar month
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
              {currentMonthPaidData.length} invoices
            </span>
          </div>
          {loadingPaidMonth ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-400 bg-white rounded-2xl border border-gray-100">
              Loading...
            </div>
          ) : currentMonthPaidData.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-sm bg-white rounded-2xl border border-gray-100">
              No paid invoices found for the current month.
            </div>
          ) : (
            <TableComponent
              key={`paid-${closeStartDate}-${closeEndDate}`}
              columns={currentMonthPaidColumns(handlePaidInvoiceClick)}
              data={filteredPaidData}
              paginationSize={10}
            />
          )}
        </div>

        {/* ── Doc viewer ── */}
        {viewDocUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setViewDocUrl(null)}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-3xl mx-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800 text-base">
                  Invoice Document
                </h3>
                <div className="flex items-center gap-2">
                  <a
                    href={viewDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <i className="ki-filled ki-external-link text-sm" /> Open in
                    new tab
                  </a>
                  <button
                    onClick={() => setViewDocUrl(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400"
                  >
                    ✕
                  </button>
                </div>
              </div>
              {/\.(jpg|jpeg|png|gif|webp)$/i.test(viewDocUrl) ? (
                <img
                  src={viewDocUrl}
                  alt="Invoice"
                  className="w-full max-h-[75vh] object-contain rounded-xl border border-gray-100"
                />
              ) : /\.pdf$/i.test(viewDocUrl) ? (
                <iframe
                  src={viewDocUrl}
                  title="Invoice"
                  className="w-full h-[75vh] rounded-xl border border-gray-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-500">
                  <i className="ki-filled ki-document text-4xl text-gray-300" />
                  <p className="text-sm">Preview not available.</p>
                  <a
                    href={viewDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary text-sm"
                  >
                    Download / Open File
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </Container>
    </Fragment>
  );

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
        fetchInvoices(closeStartDate, closeEndDate, selectedPlanId);
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

export default SuperadminInvoice;
