import { Fragment, useState, useEffect, useRef, useMemo } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { cashBookColumns, pageTotals } from "./constant";
import { Modal, message } from "antd";
import useCloseDate from "@/hooks/useCloseDate";
import {
  saveclosedate,
  CashAccountGetAll,
  getbankcashbook,
  bankcashbookreport,
} from "@/services/apiServices";
import DateRangePicker from "@/components/form-inputs/DatePicker/Daterangepicker";
import { FormattedMessage } from "react-intl";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const ITEMS_PER_PAGE = 1000;

const months = [
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

const dmyToDate = (str) => {
  if (!str) return new Date();
  const [d, m, y] = str.split("/");
  return new Date(Number(y), Number(m) - 1, Number(d));
};

const getMonthRange = (month, year) => {
  const mm = String(month + 1).padStart(2, "0");
  const lastDay = new Date(year, month + 1, 0).getDate();
  return {
    startDate: `01/${mm}/${year}`,
    endDate: `${lastDay}/${mm}/${year}`,
  };
};

const formatDisplay = (dmyStr) => {
  if (!dmyStr) return "—";
  const d = dmyToDate(dmyStr);
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatShort = (dmyStr) => {
  if (!dmyStr) return "—";
  const d = dmyToDate(dmyStr);
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

const mapApiRow = (item) => ({
  dateDay: item.date
    ? `${item.date.split("/")[0]} ${
        months[parseInt(item.date.split("/")[1], 10) - 1]
      }`
    : "—",

  dateMonth: item.date ? item.date.split("/")[2] : "—",

  referenceUtr: item.voucherNo || "—",
  particulars: item.particular ?? "—",
  description: "",

  cashIn:
    item.debit > 0
      ? item.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })
      : null,

  cashOut:
    item.credit > 0
      ? item.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })
      : null,

  balance:
    item.balance !== undefined
      ? item.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })
      : null,

  type: item.debit > 0 ? "receipt" : item.credit > 0 ? "payment" : "receipt",
});

const CashBook = () => {
    const pdfPlugin = defaultLayoutPlugin();
  const userId = (() => {
    const mainId = Number(localStorage.getItem("mainId"));
    const userId = Number(localStorage.getItem("userId"));
    return userId || mainId  || null;
  })();
  const today = new Date();

  const [selected, setSelected] = useState({  
    month: today.getMonth(),
    year: today.getFullYear(),
  });
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState(
    Math.floor(today.getFullYear() / 12) * 12,
  );
  const [filter, setFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [cashAccounts, setCashAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null); 
  const [savedCloseStart, setSavedCloseStart] = useState(null);
  const [savedCloseEnd, setSavedCloseEnd] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [closeDayOfMonth, setCloseDayOfMonth] = useState(null);
  const [ledgerData, setLedgerData] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [ledgerError, setLedgerError] = useState(null);
  const [ledgerSummary, setLedgerSummary] = useState({
    debit: 0,
    credit: 0,
    totalBalance: 0,
    openingBalance: 0,
  });
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);
  const mountedRef = useRef(false);
  const initialLoadDoneRef = useRef(false);
  const { monthCloseDates, isLoading: closeDatesLoading } = useCloseDate(
    selected.month,
    selected.year,
    userId,
  );
  const [customStart, setCustomStart] = useState("");
const [customEnd, setCustomEnd] = useState("");

const yyyymmddToDmy = (str) => {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
};

  const selectedAccountObj = cashAccounts.find(
    (a) => (a.id ?? a.cashAccountId) === selectedAccount,
  );
  const selectedAccountLabel =
    selectedAccountObj?.accountName ??
    selectedAccountObj?.name ??
    "Select Account";

  const fetchAccounts = async () => {
    setAccountsLoading(true);
    try {
      const cashRes = await CashAccountGetAll(userId);
      const cashList = cashRes?.data?.data ?? cashRes?.data ?? [];
      const accounts = Array.isArray(cashList) ? cashList : [cashList];
      setCashAccounts(accounts);

      const primary = accounts.find((a) => a.isPrimary) ?? accounts[0] ?? null;
      if (primary) {
        setSelectedAccount(primary.id ?? primary.cashAccountId);
      }
      return primary; 
    } catch (err) {
      console.error("Failed to fetch cash accounts:", err);
      setCashAccounts([]);
      return null;
    } finally {
      setAccountsLoading(false);
    }
  };

  const fetchLedger = async (startDate, endDate, accountObj) => {
    if (!startDate || !endDate) return;
    const resolvedAccount = accountObj ?? selectedAccountObj;
    const cashAccountId =
      resolvedAccount?.id ?? resolvedAccount?.cashAccountId ?? null;

    setLoadingLedger(true);
    setLedgerError(null);
    try {
      const res = await getbankcashbook(
        userId,
        startDate,
        "CASH",
        endDate,
        cashAccountId,
        null,
        "CASH",
      );
      const responseData = res?.data?.data ?? {};

      setLedgerSummary({
        debit: responseData.debit ?? 0,
        credit: responseData.credit ?? 0,
        totalBalance: responseData.totalBalance ?? 0,
        openingBalance: responseData.openingBalance ?? 0,
      });

      const rows = responseData.transactions ?? [];
      setLedgerData(rows.map(mapApiRow));
    } catch (err) {
      console.error("CashBook: fetchLedger error", err);
      setLedgerError("Failed to load ledger data.");
      setLedgerData([]);
    } finally {
      setLoadingLedger(false);
    }
  };

  const applyEntry = (entry) => {
    setSavedCloseStart(entry.startDate);
    setSavedCloseEnd(entry.closeDate);
    setCloseDayOfMonth(entry.closeDay);
  };

  const getPeriodLabel = (monthIndex, year) => {
    const key = `${year}-${monthIndex + 1}`;
    const entry = monthCloseDates[key];
    if (entry?.startDate && entry?.closeDate) {
      return `${formatShort(entry.startDate)} → ${formatShort(entry.closeDate)}`;
    }
    return "";
  };

  useEffect(() => {
    if (!monthCloseDates || Object.keys(monthCloseDates).length === 0) return;
    if (initialLoadDoneRef.current) return; 

    const activeEntry =
      Object.values(monthCloseDates).find((e) => e.isActive) ?? null;
    if (!activeEntry?.startDate || !activeEntry?.closeDate) return;

    initialLoadDoneRef.current = true;
    mountedRef.current = true;

    const monthIndex = (activeEntry.month ?? today.getMonth() + 1) - 1;
    const year = activeEntry.year ?? today.getFullYear();

    setSelected({ month: monthIndex, year });
    setSavedCloseStart(activeEntry.startDate);
    setSavedCloseEnd(activeEntry.closeDate);
  }, [monthCloseDates]);

  useEffect(() => {
    if (!initialLoadDoneRef.current) return; 
    if (!monthCloseDates || Object.keys(monthCloseDates).length === 0) return;

    const key = `${selected.year}-${selected.month + 1}`;
    const entry = monthCloseDates?.[key] ?? null;

    if (entry?.startDate && entry?.closeDate) {
      setSavedCloseStart(entry.startDate);
      setSavedCloseEnd(entry.closeDate);
    } else {
      const { startDate, endDate } = getMonthRange(
        selected.month,
        selected.year,
      );
      setSavedCloseStart(startDate);
      setSavedCloseEnd(endDate);
    }

    setCurrentPage(1);
  }, [selected.month, selected.year]); 

  useEffect(() => {
    if (!savedCloseStart || !savedCloseEnd) return;

    fetchLedger(savedCloseStart, savedCloseEnd);
  }, [selectedAccount, savedCloseStart, savedCloseEnd]);
  useEffect(() => {
    fetchAccounts();
  }, []);
  const filteredData = useMemo(() => {
    if (filter === "all") return ledgerData;
    return ledgerData.filter((row) => row.type === filter);
  }, [filter, ledgerData]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const totalIn = ledgerData
    .reduce(
      (sum, r) => sum + (r.cashIn ? parseFloat(r.cashIn.replace(/,/g, "")) : 0),
      0,
    )
    .toLocaleString("en-IN", { minimumFractionDigits: 2 });

  const totalOut = ledgerData
    .reduce(
      (sum, r) =>
        sum + (r.cashOut ? parseFloat(r.cashOut.replace(/,/g, "")) : 0),
      0,
    )
    .toLocaleString("en-IN", { minimumFractionDigits: 2 });

 const handleExportPDF = async () => {
  if (!savedCloseStart || !savedCloseEnd) {
    message.warning("Please select a date range first.");
    return;
  }

  const cashAccountId =
    selectedAccountObj?.id ?? selectedAccountObj?.cashAccountId ?? undefined;

  if (!cashAccountId) {
    message.warning("Please select a cash account first.");
    return;
  }

  setExportLoading(true);
  try {
    const res = await bankcashbookreport(
      userId,
      savedCloseStart,
      savedCloseEnd,
      "",
      cashAccountId,
      undefined,
      "CASH",
    );

    const reportUrl = res?.data?.report_path;
    if (!reportUrl) {
      message.error("Report URL not found.");
      return;
    }

    setPdfUrl(reportUrl);
    setIsPdfModalVisible(true);
  } catch (err) {
    console.error("Export error:", err);
    message.error("Failed to generate report.");
  } finally {
    setExportLoading(false);
  }
};
  return (
    <Fragment>
      <Container>
      <div className="mb-6">
  {/* ── Desktop: 7-col grid ── */}
  <div className="hidden lg:grid grid-cols-7 gap-3">
    <div className="relative col-span-1 flex flex-col justify-start">
      <button
        onClick={() => setShowYearPicker((v) => !v)}
        className="px-3 py-2 rounded-xl bg-primary text-white font-bold text-sm w-fit min-w-[70px]"
      >
        {selected.year}
      </button>
      {showYearPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowYearPicker(false)} />
          <div className="absolute top-12 left-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64">
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setYearRangeStart((y) => y - 12)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-lg border-0 bg-transparent cursor-pointer">‹</button>
              <span className="text-sm font-bold text-gray-700">{yearRangeStart} – {yearRangeStart + 11}</span>
              <button onClick={() => setYearRangeStart((y) => y + 12)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-lg border-0 bg-transparent cursor-pointer">›</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map((y) => (
                <button key={y}
                  onClick={() => { setSelected((prev) => ({ ...prev, year: y })); setShowYearPicker(false); }}
                  className={`py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer transition ${y === selected.year ? "bg-primary text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>

    {MONTH_NAMES.slice(0, 6).map((name, i) => {
      const isSelected = selected.month === i;
      return (
        <button key={name} disabled={loadingLedger}
          onClick={() => setSelected((prev) => ({ ...prev, month: i }))}
          className={`relative flex flex-col items-start px-3 py-2 rounded-2xl border transition-all text-left
            ${isSelected ? "bg-primary text-white border-primary shadow-md" : "bg-white text-gray-800 border-gray-200 hover:border-primary hover:shadow-sm"}
            ${loadingLedger && !isSelected ? "opacity-50 cursor-not-allowed" : ""}
            ${isSelected && loadingLedger ? "opacity-80 cursor-wait" : ""}`}>
          <span className="font-bold text-sm">{months[i]}</span>
          <span className={`text-xs mt-1 leading-tight ${isSelected ? "text-blue-100" : "text-black"}`}>
            {getPeriodLabel(i, selected.year) || <span className="text-gray-300 italic">No date</span>}
          </span>
        </button>
      );
    })}

    <div />

    {MONTH_NAMES.slice(6, 12).map((name, i) => {
      const realIndex = i + 6;
      const isSelected = selected.month === realIndex;
      return (
        <button key={name} disabled={loadingLedger}
          onClick={() => setSelected((prev) => ({ ...prev, month: realIndex }))}
          className={`relative flex flex-col items-start px-3 py-2 rounded-2xl border transition-all text-left
            ${isSelected ? "bg-primary text-white border-primary shadow-md" : "bg-white text-gray-800 border-gray-200 hover:border-primary hover:shadow-sm"}
            ${loadingLedger && !isSelected ? "opacity-50 cursor-not-allowed" : ""}
            ${isSelected && loadingLedger ? "opacity-80 cursor-wait" : ""}`}>
          <span className="font-bold text-sm">{months[realIndex]}</span>
          <span className={`text-xs mt-1 leading-tight ${isSelected ? "text-blue-100" : "text-black"}`}>
            {getPeriodLabel(realIndex, selected.year) || <span className="text-gray-300 italic">No date</span>}
          </span>
        </button>
      );
    })}
  </div>

  {/* ── Mobile/Tablet: Year + Month dropdowns ── */}
  <div className="flex lg:hidden items-center gap-2">
    <div className="relative">
      <button
        onClick={() => setShowYearPicker((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white font-bold text-sm"
      >
        {selected.year}
        <i className="ki-filled ki-down text-xs opacity-80"></i>
      </button>
      {showYearPicker && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowYearPicker(false)} />
          <div className="absolute top-11 left-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-56">
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => setYearRangeStart((y) => y - 12)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 border-0 bg-transparent cursor-pointer">‹</button>
              <span className="text-xs font-bold text-gray-700">{yearRangeStart} – {yearRangeStart + 11}</span>
              <button onClick={() => setYearRangeStart((y) => y + 12)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 border-0 bg-transparent cursor-pointer">›</button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map((y) => (
                <button key={y}
                  onClick={() => { setSelected((prev) => ({ ...prev, year: y })); setShowYearPicker(false); }}
                  className={`py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition ${y === selected.year ? "bg-primary text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>

    <select
      value={selected.month}
      onChange={(e) => setSelected((prev) => ({ ...prev, month: Number(e.target.value) }))}
      className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 bg-white shadow-sm focus:outline-none focus:border-primary flex-1"
    >
      {MONTH_NAMES.map((name, i) => {
        const label = getPeriodLabel(i, selected.year);
        return (
          <option key={name} value={i}>
            {months[i]}{label ? ` (${label})` : ""}
          </option>
        );
      })}
    </select>
  </div>
</div>

   <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
  {/* Left */}
  <div className="flex flex-wrap items-end gap-2">
<h1 className="text-xl sm:text-2xl font-bold text-gray-900">
  <FormattedMessage id="COMMON.CASH_BOOK" defaultMessage="Cash Book" />
</h1>

    {/* Account Dropdown */}
    <div className="relative">
      <button
        onClick={() => setShowAccountDropdown((v) => !v)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors shadow-sm"
      >
        {accountsLoading ? "Loading..." : selectedAccountLabel}
        <i className="ki-filled ki-down text-xs text-gray-400"></i>
      </button>
      {showAccountDropdown && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg min-w-[220px]">
          {accountsLoading ? (
            <div className="px-4 py-2.5 text-sm text-gray-400">Loading accounts…</div>
          ) : cashAccounts.length === 0 ? (
            <div className="px-4 py-2.5 text-sm text-gray-400">No accounts found</div>
          ) : (
            cashAccounts.map((acc) => {
              const accId = acc.id ?? acc.cashAccountId;
              return (
                <button key={accId}
                  onClick={() => { setSelectedAccount(accId); setShowAccountDropdown(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${selectedAccount === accId ? "text-blue-600 font-medium bg-blue-50" : "text-gray-700"}`}>
                  {acc.accountName ?? acc.name}
                  {acc.isPrimary && <span className="ml-2 text-xs text-blue-400">(Primary)</span>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>

    {/* Custom Date Range */}
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-0.5">
<label className="text-xs text-gray-400 font-medium">
  <FormattedMessage id="COMMON.FROM" defaultMessage="From" />
</label>        <input type="date" value={customStart}
          onChange={(e) => setCustomStart(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white shadow-sm focus:outline-none focus:border-primary" />
      </div>
      <div className="flex flex-col gap-0.5">
  <label className="text-xs text-gray-400 font-medium">
  <FormattedMessage id="COMMON.TO" defaultMessage="To" />
</label>
        <input type="date" value={customEnd}
          onChange={(e) => setCustomEnd(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white shadow-sm focus:outline-none focus:border-primary" />
      </div>
      <button
        onClick={() => {
          if (!customStart || !customEnd) return;
          setSavedCloseStart(yyyymmddToDmy(customStart));
          setSavedCloseEnd(yyyymmddToDmy(customEnd));
        }}
        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90"
      >
  <FormattedMessage id="COMMON.APPLY" defaultMessage="Apply" />      </button>
      {customStart && customEnd && (
      <button
  onClick={() => {
    setCustomStart("");
    setCustomEnd("");
    const key = `${selected.year}-${selected.month + 1}`;
    const entry = monthCloseDates?.[key] ?? null;
    if (entry?.startDate && entry?.closeDate) {
      setSavedCloseStart(entry.startDate);
      setSavedCloseEnd(entry.closeDate);
    } else {
      const { startDate, endDate } = getMonthRange(selected.month, selected.year);
      setSavedCloseStart(startDate);
      setSavedCloseEnd(endDate);
    }
  }}
  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200"
>
  <FormattedMessage id="COMMON.RESET" defaultMessage="Reset" />
</button>
      )}
    </div>
  </div>

  {/* Right */}
<button
  onClick={handleExportPDF}
  disabled={exportLoading || !savedCloseStart || !savedCloseEnd || !selectedAccount}
  className="flex items-center gap-1.5 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
>
  <i className="ki-filled ki-exit-down text-xs"></i>
  <FormattedMessage id="COMMON.EXPORT_PDF" defaultMessage="Export PDF" />
</button>
</div>

        {/* DateRangePicker modal
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
                saveclosedate(dmy_start, dmy_end)
                  .then(() => {
                    setSavedCloseStart(dmy_start);
                    setSavedCloseEnd(dmy_end);
                    setCloseDayOfMonth(parseInt(dmy_end.split("/")[0], 10));
                    fetchAllCloseDates(selected.year);
                  })
                  .catch(() => {});
              }}
            />
          </div>
        )} */}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
  <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 sm:gap-0">
    <div className="text-xs text-black uppercase tracking-wide sm:mb-2 flex items-center gap-1.5">
      <i className="ki-filled ki-arrow-up text-green-400 text-sm"></i>
<span>
  <FormattedMessage id="COMMON.TOTAL_CASH_IN" defaultMessage="Total Cash In" />
</span>    </div>
    <div className="text-lg sm:text-2xl font-bold text-gray-900">
      ₹{ledgerSummary.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
    </div>
  </div>

  <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 sm:gap-0">
    <div className="text-xs text-black uppercase tracking-wide sm:mb-2 flex items-center gap-1.5">
      <i className="ki-filled ki-arrow-down text-red-400 text-sm"></i>
      <span>
  <FormattedMessage id="COMMON.TOTAL_CASH_OUT" defaultMessage="Total Cash Out" />
</span>
    </div>
    <div className="text-lg sm:text-2xl font-bold text-gray-900">
      ₹{ledgerSummary.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
    </div>
  </div>

  <div className="bg-primary rounded-xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 sm:gap-0">
    <div className="absolute right-4 bottom-4 opacity-10 hidden sm:block">
      <i className="ki-filled ki-wallet text-white text-5xl"></i>
    </div>
  <div className="text-xs text-white uppercase tracking-wide opacity-80 sm:mb-2">
  <FormattedMessage id="COMMON.OPENING_BALANCE" defaultMessage="Opening Balance" />
</div>
    <div className="text-xl sm:text-2xl font-bold text-white">
      ₹{ledgerSummary.openingBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
    </div>
  </div>
</div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-900">
            Transaction History
          </h2>
          <div className="flex items-center gap-3 text-xs text-black">
            {[
              { key: "all", label: "All", dot: "bg-gray-400" },
              { key: "receipt", label: "Receipts", dot: "bg-green-500" },
              { key: "payment", label: "Payments", dot: "bg-gray-400" },
            ].map(({ key, label, dot }) => (
              <button
                key={key}
                onClick={() => {
                  setFilter(key);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-1.5 transition-colors ${filter === key ? "text-gray-900 font-medium" : "hover:text-gray-700"}`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${dot} inline-block`}
                ></span>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm mb-3">
          {loadingLedger ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Loading transactions…
            </div>
          ) : ledgerError ? (
            <div className="flex items-center justify-center py-16 text-sm text-red-400">
              {ledgerError}
            </div>
          ) : paginatedData.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-400">
              No transactions found for this period.
            </div>
          ) : (
            <TableComponent columns={cashBookColumns()} data={paginatedData} />
          )}
        </div>

        {!loadingLedger && filteredData.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-end gap-2 mb-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="text-xs text-gray-500">
              Page {currentPage} of{" "}
              {Math.ceil(filteredData.length / ITEMS_PER_PAGE)}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(
                    Math.ceil(filteredData.length / ITEMS_PER_PAGE),
                    p + 1,
                  ),
                )
              }
              disabled={
                currentPage === Math.ceil(filteredData.length / ITEMS_PER_PAGE)
              }
              className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <div className="mt-3 bg-primary text-white rounded-xl px-5 py-4 flex justify-between w-[400px] items-center shadow-sm">
            <div>
             <div className="text-xs uppercase opacity-80">
  <FormattedMessage id="COMMON.CLOSING_BALANCE" defaultMessage="Closing Balance" />
</div>
              <div className="text-xs opacity-70">
                As on {formatDisplay(savedCloseEnd)}
              </div>
            </div>
            <div className="text-2xl font-bold">
              ₹
              {ledgerSummary.totalBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
     <Modal
  title="Cash Book Report"
  open={isPdfModalVisible}
  onCancel={() => {
    setIsPdfModalVisible(false);
    setPdfUrl(null);
  }}
  width="70%"
  footer={null}
  destroyOnClose
>
  <style>{`
    .rpv-core__inner-pages { scrollbar-width: none !important; }
    .rpv-core__inner-pages::-webkit-scrollbar { display: none !important; }
  `}</style>
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

export default CashBook;
