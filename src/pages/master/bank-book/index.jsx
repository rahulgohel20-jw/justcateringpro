import { Fragment, useState, useEffect, useRef, useMemo } from "react";
import { Modal, message } from "antd";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { bankBookColumns } from "./constant";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import {
  getbankcashbook,
  GetbankdetailsbyuserId,
  bankcashbookreport,
} from "@/services/apiServices";
import useCloseDate from "@/hooks/useCloseDate"; 
import { FormattedMessage } from "react-intl";

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
  return dmyToDate(dmyStr).toLocaleDateString("en-GB", {
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
    ? `${item.date.split("/")[0]} ${months[parseInt(item.date.split("/")[1], 10) - 1]}`
    : "—",
  dateMonth: item.date ? item.date.split("/")[2] : "—",
  referenceUtr: item.voucherNo || "—",
  particulars: item.particular ?? "—",
  description: "",
  bankIn:
    item.debit > 0
      ? item.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })
      : null,
  bankOut:
    item.credit > 0
      ? item.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })
      : null,
  balance:
    item.balance != null
      ? item.balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })
      : null,
  type: item.debit > 0 ? "in" : item.credit > 0 ? "out" : "in",
});

// ── userId from localStorage ──────────────────────────────────────────────────
const resolveUserId = () => {
  const mainId = Number(localStorage.getItem("mainId"));
  const userId = Number(localStorage.getItem("userId"));
  if (Number.isFinite(userId) && userId > 0) return userId;
  if (Number.isFinite(mainId) && mainId > 0) return mainId;
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────

const BankBook = () => {
  const today = new Date();
  const userId = useMemo(resolveUserId, []); 
  const [selected, setSelected] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState(
    Math.floor(today.getFullYear() / 12) * 12,
  );
  const [filter, setFilter] = useState("all");
  const [paymentMode, setPaymentMode] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [bankAccountsList, setBankAccountsList] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [savedCloseStart, setSavedCloseStart] = useState(null);
  const [savedCloseEnd, setSavedCloseEnd] = useState(null);
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
  const pdfPlugin = defaultLayoutPlugin();
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

  const selectedAccountObj = bankAccountsList.find(
    (a) => a.id === selectedAccount,
  );
const selectedAccountLabel = selectedAccountObj
  ? `${selectedAccountObj.bankName ?? "Bank Account"}${
      selectedAccountObj.accountHolderName ? ` • ${selectedAccountObj.accountHolderName}` : ""
    }${
      selectedAccountObj.accountNo ? ` (${selectedAccountObj.accountNo})` : ""
    }`
  : "Select Bank Account";
  // ── Fetch bank accounts ───────────────────────────────────────────────────
  const fetchAccounts = async () => {
    setAccountsLoading(true);
    try {
      const bankRes = await GetbankdetailsbyuserId(userId);
      const bankList = bankRes?.data?.data ?? bankRes?.data ?? [];
      const list = Array.isArray(bankList) ? bankList : [bankList];
      setBankAccountsList(list);
      const primary = list.find((a) => a.isPrimary) ?? list[0];
      if (primary) setSelectedAccount(primary.id);
      return primary?.id ?? null;
    } catch (err) {
      console.error("BankBook: fetchAccounts error", err);
      setBankAccountsList([]);
      return null;
    } finally {
      setAccountsLoading(false);
    }
  };

  // ── Fetch ledger ──────────────────────────────────────────────────────────
  const fetchLedger = async (startDate, endDate, accountId) => {
    if (!startDate || !endDate) return;
    setLoadingLedger(true);
    setLedgerError(null);
    try {
      const bankAccountId = accountId ?? selectedAccount;
      const res = await getbankcashbook(
        userId,
        startDate,
        paymentMode,
        endDate,
        null,
        bankAccountId || undefined,
        "BANK",
      );
      const responseData = res?.data?.data ?? {};
      setLedgerSummary({
        debit: responseData.debit ?? 0,
        credit: responseData.credit ?? 0,
        totalBalance: responseData.totalBalance ?? 0,
        openingBalance: responseData.openingBalance ?? 0,
      });
      setLedgerData((responseData.transactions ?? []).map(mapApiRow));
    } catch (err) {
      console.error("BankBook: fetchLedger error", err);
      setLedgerError("Failed to load ledger data.");
      setLedgerData([]);
    } finally {
      setLoadingLedger(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);
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
    if (!savedCloseStart || !savedCloseEnd) return;
    if (selectedAccount === null) return; 

    fetchLedger(savedCloseStart, savedCloseEnd);
  }, [savedCloseStart, savedCloseEnd, selectedAccount, paymentMode]);


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

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getPeriodLabel = (monthIndex, year) => {
    const key = `${year}-${monthIndex + 1}`;
    const entry = monthCloseDates?.[key];
    if (entry?.startDate && entry?.closeDate) {
      return `${formatShort(entry.startDate)} → ${formatShort(entry.closeDate)}`;
    }
    return "";
  };

  // ── Table data ────────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (filter === "all") return ledgerData;
    return ledgerData.filter((row) => row.type === filter);
  }, [filter, ledgerData]);

  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const handleExport = async () => {
  if (!savedCloseStart || !savedCloseEnd) {
    message.warning("Please select a date range first.");
    return;
  }

  if (!selectedAccount) {
    message.warning("Please select a bank account first.");
    return;
  }

  setExportLoading(true);
  try {
    const res = await bankcashbookreport(
      userId,
      savedCloseStart,
      savedCloseEnd,
      paymentMode,
      "",
      selectedAccount,
      "BANK",
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
  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Fragment>
      <Container>
        {/* Month/Year Grid */}
        <div className="mb-1">
     <div className="mb-6">
  {/* ── Desktop: 7-col grid ── */}
  <div className="hidden lg:grid grid-cols-7 gap-3">
    {/* Year Button */}
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
                <button key={y} onClick={() => { setSelected((prev) => ({ ...prev, year: y })); setShowYearPicker(false); }}
                  className={`py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer transition ${y === selected.year ? "bg-primary text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>

    {/* Jan–Jun */}
    {MONTH_NAMES.slice(0, 6).map((name, i) => {
      const isSelected = selected.month === i;
      const label = getPeriodLabel(i, selected.year);
      return (
        <button key={name} onClick={() => setSelected((prev) => ({ ...prev, month: i }))}
          className={`relative flex flex-col items-start px-3 py-2 rounded-2xl border transition-all text-left ${isSelected ? "bg-primary text-white border-primary shadow-md" : "bg-white text-gray-800 border-gray-200 hover:border-primary hover:shadow-sm"}`}>
          <span className="font-bold text-sm">{months[i]}</span>
          <span className={`text-xs mt-1 leading-tight ${isSelected ? "text-blue-100" : "text-black"}`}>
            {label || <span className="text-gray-300 italic">No date</span>}
          </span>
        </button>
      );
    })}

    <div />

    {/* Jul–Dec */}
    {MONTH_NAMES.slice(6, 12).map((name, i) => {
      const realIndex = i + 6;
      const isSelected = selected.month === realIndex;
      const label = getPeriodLabel(realIndex, selected.year);
      return (
        <button key={name} onClick={() => setSelected((prev) => ({ ...prev, month: realIndex }))}
          className={`relative flex flex-col items-start px-3 py-2 rounded-2xl border transition-all text-left ${isSelected ? "bg-primary text-white border-primary shadow-md" : "bg-white text-gray-800 border-gray-200 hover:border-primary hover:shadow-sm"}`}>
          <span className="font-bold text-sm">{months[realIndex]}</span>
          <span className={`text-xs mt-1 leading-tight ${isSelected ? "text-blue-100" : "text-black"}`}>
            {label || <span className="text-gray-300 italic">No date</span>}
          </span>
        </button>
      );
    })}
  </div>

  {/* ── Mobile/Tablet: Year + Month dropdowns ── */}
  <div className="flex lg:hidden items-center gap-2">
    {/* Year dropdown */}
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
                <button key={y} onClick={() => { setSelected((prev) => ({ ...prev, year: y })); setShowYearPicker(false); }}
                  className={`py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition ${y === selected.year ? "bg-primary text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}>
                  {y}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>

    {/* Month dropdown */}
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
<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mt-2 mb-4">
  {/* Left */}
  <div className="flex flex-wrap items-end gap-2">
<h1 className="text-xl sm:text-2xl font-bold text-gray-900">
  <FormattedMessage id="COMMON.BANK_BOOK" defaultMessage="Bank Book" />
</h1>


    {/* Bank Account Dropdown */}
    <div className="relative">
      <button
        onClick={() => setShowAccountDropdown((v) => !v)}
        className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors shadow-sm"
      >
        {accountsLoading ? (
          <span className="text-gray-400">Loading...</span>
        ) : (
          selectedAccountLabel
        )}
        <i className="ki-filled ki-down text-xs text-gray-400"></i>
      </button>
      {showAccountDropdown && (
        <div className="absolute z-10 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg min-w-[260px]">
          {bankAccountsList.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">No bank accounts found</div>
          ) : (
            bankAccountsList.map((acc) => (
              <button
                key={acc.id}
                onClick={() => { setSelectedAccount(acc.id); setShowAccountDropdown(false); }}
                className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl ${selectedAccount === acc.id ? "bg-blue-50" : ""}`}
              >
                <div className={`text-sm font-medium ${selectedAccount === acc.id ? "text-blue-600" : "text-gray-800"}`}>
                  {acc.bankName}
                </div>
                {acc.accountHolderName && (
                  <div className="text-xs text-gray-500 mt-0.5">{acc.accountHolderName}</div>
                )}
                {acc.accountNo && (
                  <div className="text-xs text-gray-400 mt-0.5">{acc.accountNo}</div>
                )}
                {acc.isPrimary && (
                  <span className="text-xs text-green-500 font-medium">● Primary</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>

    {/* Custom Date Range */}
    <div className="flex flex-wrap items-end gap-2">
      <div className="flex flex-col gap-0.5">
        <FormattedMessage id="COMMON.FROM" defaultMessage="From" />

        <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white shadow-sm focus:outline-none focus:border-primary" />
      </div>
      <div className="flex flex-col gap-0.5">
          <FormattedMessage id="COMMON.TO" defaultMessage="To" />
        <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white shadow-sm focus:outline-none focus:border-primary" />
      </div>
      <button onClick={() => { if (!customStart || !customEnd) return; setSavedCloseStart(yyyymmddToDmy(customStart)); setSavedCloseEnd(yyyymmddToDmy(customEnd)); }}
        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90">
   <FormattedMessage id="COMMON.APPLY" defaultMessage="Apply" />    
      </button>
      {customStart && customEnd && (
        <button onClick={() => {
          setCustomStart(""); setCustomEnd("");
          const key = `${selected.year}-${selected.month + 1}`;
          const entry = monthCloseDates?.[key] ?? null;
          if (entry?.startDate && entry?.closeDate) { setSavedCloseStart(entry.startDate); setSavedCloseEnd(entry.closeDate); }
          else { const { startDate, endDate } = getMonthRange(selected.month, selected.year); setSavedCloseStart(startDate); setSavedCloseEnd(endDate); }
        }} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200">
           <FormattedMessage id="COMMON.RESET" defaultMessage="Reset" />
        </button>
      )}
    </div>
  </div>

  {/* Right */}
 <button
  onClick={handleExport}
  disabled={exportLoading || !savedCloseStart || !savedCloseEnd || !selectedAccount}
  className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
>
  <i className="ki-filled ki-exit-down"></i>
  <FormattedMessage id="COMMON.EXPORT_PDF" defaultMessage="Export PDF" />
</button>
</div>
</div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          {/* Payment Mode Filter */}
          {/* <div className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
            {PAYMENT_MODES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setPaymentMode(key)}
                className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                  paymentMode === key
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div> */}
        </div>

        {/* Stat Cards */}
        {/* Stat Cards */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
  <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 sm:gap-0">
    <div className="flex items-center gap-1.5 sm:mb-2">
      <i className="ki-filled ki-arrow-down text-green-500 text-sm"></i>
<span className="text-xs uppercase tracking-wide text-gray-500">
  <FormattedMessage id="COMMON.TOTAL_IN_DR" defaultMessage="Total In (DR)" />
</span>    </div>
    <div className="text-lg sm:text-xl font-bold text-gray-900">
      ₹{ledgerSummary.debit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
    </div>
  </div>

  <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 sm:gap-0">
    <div className="flex items-center gap-1.5 sm:mb-2">
      <i className="ki-filled ki-arrow-up text-red-500 text-sm"></i>
<span className="text-xs uppercase tracking-wide text-gray-500">
  <FormattedMessage id="COMMON.TOTAL_OUT_CR" defaultMessage="Total Out (CR)" />
</span>
    </div>
    <div className="text-lg sm:text-xl font-bold text-gray-900">
      ₹{ledgerSummary.credit.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
    </div>
  </div>

  <div className="bg-primary rounded-xl p-4 sm:p-5 shadow-sm flex sm:flex-col items-center sm:items-start justify-between sm:justify-start gap-3 sm:gap-0">
  <span className="text-xs text-white uppercase tracking-wide opacity-80">
  <FormattedMessage id="COMMON.OPENING_BALANCE" defaultMessage="Opening Balance" />
</span>
    <div className="text-xl sm:text-2xl font-bold text-white">
      ₹{(ledgerSummary.openingBalance ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
    </div>
  </div>
</div>

        {/* Transaction Ledger Header */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
  <FormattedMessage
    id="COMMON.TRANSACTION_LEDGER"
    defaultMessage="Transaction Ledger"
  />
</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {savedCloseStart && savedCloseEnd
                ? `Showing entries for ${formatDisplay(savedCloseStart)} – ${formatDisplay(savedCloseEnd)}`
                : "Showing all entries"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* In / Out / All filter */}
            <div className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
              {[
                { key: "all", label: "All" },
                { key: "in", label: "In", dotClass: "bg-green-500" },
                { key: "out", label: "Out", dotClass: "bg-red-400" },
              ].map(({ key, label, dotClass }) => (
                <button
                  key={key}
                  onClick={() => {
                    setFilter(key);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                    filter === key
                      ? "bg-gray-100 text-gray-900 font-medium"
                      : "hover:text-gray-700"
                  }`}
                >
                  {dotClass && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${dotClass}`}
                    ></span>
                  )}
                  {label}
                </button>
              ))}
            </div>

            {/* <button
              onClick={handleExport}
              disabled={exportLoading}
              className="flex items-center gap-1.5 bg-gray-900 text-white text-xs px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium disabled:opacity-60"
            >
              <i className="ki-filled ki-exit-down text-xs"></i>
              {exportLoading ? "Generating..." : "Export Statement"}
            </button> */}
          </div>
        </div>

        {/* Table */}
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
  <FormattedMessage
    id="COMMON.NO_TRANSACTIONS_FOUND_FOR_THIS_PERIOD"
    defaultMessage="No transactions found for this period."
  />
</div>
          ) : (
            <TableComponent
              columns={bankBookColumns({ edit: true })}
              data={paginatedData}
            />
          )}
        </div>

        {/* Pagination */}
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

        {/* Closing Balance */}
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
              {ledgerSummary.totalBalance.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
        {/* PDF Report Modal */}
        <Modal
          title="Bank Book Report"
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

export default BankBook;
