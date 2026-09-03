import { Fragment, useState, useEffect, useRef, useMemo } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { bankColumns, cashColumns, bankAccounts } from "./constant";
import { Closedate, saveclosedate } from "@/services/apiServices";
import DateRangePicker from "@/components/form-inputs/DatePicker/Daterangepicker";

const ITEMS_PER_PAGE = 5;

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
  return { startDate: `01/${mm}/${year}`, endDate: `${lastDay}/${mm}/${year}` };
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
const dmyToIso = (str) => {
  if (!str) return "";
  const [d, m, y] = str.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
};
const isoToDmy = (str) => {
  if (!str) return "";
  const [y, m, d] = str.split("-");
  return `${d}/${m}/${y}`;
};

const BookPage = () => {
  const today = new Date();
  const [activeTab, setActiveTab] = useState("bank");
  const [bankBookData, setBankBookData] = useState([]);
  const [cashBookData, setCashBookData] = useState([]);
  const [bankBookPageTotals, setBankBookPageTotals] = useState(null);
  const [pageTotals, setPageTotals] = useState(null);

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

  const [savedCloseStart, setSavedCloseStart] = useState(null);
  const [savedCloseEnd, setSavedCloseEnd] = useState(null);
  const [closeDayOfMonth, setCloseDayOfMonth] = useState(null);
  const [monthCloseDates, setMonthCloseDates] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedAccount, setSelectedAccount] = useState(bankAccounts[0].value);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const mountedRef = useRef(false);
  const selectedAccountLabel = bankAccounts.find(
    (a) => a.value === selectedAccount,
  )?.label;

  // ── Close date helpers ────────────────────────────────────────────────────
  const fetchAllCloseDates = async (year) => {
    try {
      const res = await Closedate(-1, year);
      const dates = res?.data?.closeDate?.dates ?? [];
      if (dates.length === 0) return null;
      const newMap = {};
      dates.forEach((d) => {
        const key = `${d.year}-${d.month}`;
        newMap[key] = {
          key,
          monthIndex: d.month - 1,
          startDate: d.startDate,
          closeDate: d.closeDate,
          closeDay: d.closeDate
            ? parseInt(d.closeDate.split("/")[0], 10)
            : null,
        };
      });
      setMonthCloseDates(newMap);
      return newMap;
    } catch (err) {
      return null;
    }
  };

  const fetchSingleMonthCloseDate = async (monthIndex, year) => {
    try {
      const res = await Closedate(monthIndex + 1, year);
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
      return null;
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
    if (entry?.startDate && entry?.closeDate)
      return `${formatShort(entry.startDate)} → ${formatShort(entry.closeDate)}`;
    return "";
  };

  // ── On mount ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      const map = await fetchAllCloseDates(selected.year);
      if (!map) return;
      let activeEntry = null;
      for (const entry of Object.values(map)) {
        if (!entry.startDate || !entry.closeDate) continue;
        const start = dmyToDate(entry.startDate);
        const end = dmyToDate(entry.closeDate);
        if (today >= start && today <= end) {
          activeEntry = entry;
          break;
        }
      }
      if (!activeEntry) {
        const fallbackKey = `${selected.year}-${today.getMonth() + 1}`;
        activeEntry = map[fallbackKey] ?? null;
      }
      if (!activeEntry)
        activeEntry = await fetchSingleMonthCloseDate(
          today.getMonth(),
          today.getFullYear(),
        );
      if (!activeEntry) return;
      setSelected({
        month: activeEntry.monthIndex,
        year: parseInt(activeEntry.key.split("-")[0], 10),
      });
      applyEntry(activeEntry);
      mountedRef.current = true;
    };
    init();
  }, []);

  useEffect(() => {
    if (!mountedRef.current) return;
    const key = `${selected.year}-${selected.month + 1}`;
    const cached = monthCloseDates[key];
    if (cached?.closeDate) {
      applyEntry(cached);
    } else {
      fetchSingleMonthCloseDate(selected.month, selected.year).then((entry) => {
        if (!entry) {
          const { startDate, endDate } = getMonthRange(
            selected.month,
            selected.year,
          );
          setSavedCloseStart(startDate);
          setSavedCloseEnd(endDate);
          return;
        }
        setMonthCloseDates((prev) => ({ ...prev, [key]: entry }));
        applyEntry(entry);
      });
    }
    setCurrentPage(1);
    setFilter("all");
  }, [selected.month]);

  useEffect(() => {
    if (!mountedRef.current) return;
    fetchAllCloseDates(selected.year).then((map) => {
      if (!map) return;
      const key = `${selected.year}-${selected.month + 1}`;
      const entry = map[key];
      if (entry?.closeDate) applyEntry(entry);
    });
  }, [selected.year]);

  const filteredBankData = useMemo(() => {
    if (filter === "all") return bankBookData;
    return bankBookData.filter((row) => row.type === filter);
  }, [filter, bankBookData]);

  const filteredCashData = useMemo(() => {
    if (filter === "all") return cashBookData;
    return cashBookData.filter((row) => row.type === filter);
  }, [filter, cashBookData]);

  const paginatedData = (
    activeTab === "bank" ? filteredBankData : filteredCashData
  ).slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Fragment>
      <Container>
        {/* Month/Year Grid */}
        <div className="mb-6">
          <div className="grid grid-cols-7 gap-3">
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
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowYearPicker(false)}
                  />
                  <div className="absolute top-12 left-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 w-64">
                    <div className="flex items-center justify-between mb-4">
                      <button
                        onClick={() => setYearRangeStart((y) => y - 12)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-lg border-0 bg-transparent cursor-pointer"
                      >
                        ‹
                      </button>
                      <span className="text-sm font-bold text-gray-700">
                        {yearRangeStart} – {yearRangeStart + 11}
                      </span>
                      <button
                        onClick={() => setYearRangeStart((y) => y + 12)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-lg border-0 bg-transparent cursor-pointer"
                      >
                        ›
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {Array.from(
                        { length: 12 },
                        (_, i) => yearRangeStart + i,
                      ).map((y) => (
                        <button
                          key={y}
                          onClick={() => {
                            setSelected((prev) => ({ ...prev, year: y }));
                            setShowYearPicker(false);
                          }}
                          className={`py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer transition ${y === selected.year ? "bg-primary text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Jan – Jun */}
            {MONTH_NAMES.slice(0, 6).map((name, i) => {
              const isSelected = selected.month === i;
              const label = getPeriodLabel(i, selected.year);
              return (
                <button
                  key={name}
                  onClick={() => setSelected((prev) => ({ ...prev, month: i }))}
                  className={`relative flex flex-col items-start px-3 py-2 rounded-2xl border transition-all text-left ${isSelected ? "bg-primary text-white border-primary shadow-md" : "bg-white text-gray-800 border-gray-200 hover:border-primary hover:shadow-sm"}`}
                >
                  <span className="font-bold text-sm">{months[i]}</span>
                  <span
                    className={`text-xs mt-1 leading-tight ${isSelected ? "text-blue-100" : "text-black"}`}
                  >
                    {label || (
                      <span className="text-gray-300 italic">No date</span>
                    )}
                  </span>
                </button>
              );
            })}

            <div />

            {/* Jul – Dec */}
            {MONTH_NAMES.slice(6, 12).map((name, i) => {
              const realIndex = i + 6;
              const isSelected = selected.month === realIndex;
              const label = getPeriodLabel(realIndex, selected.year);
              return (
                <button
                  key={name}
                  onClick={() =>
                    setSelected((prev) => ({ ...prev, month: realIndex }))
                  }
                  className={`relative flex flex-col items-start px-3 py-2 rounded-2xl border transition-all text-left ${isSelected ? "bg-primary text-white border-primary shadow-md" : "bg-white text-gray-800 border-gray-200 hover:border-primary hover:shadow-sm"}`}
                >
                  <span className="font-bold text-sm">{months[realIndex]}</span>
                  <span
                    className={`text-xs mt-1 leading-tight ${isSelected ? "text-blue-100" : "text-black"}`}
                  >
                    {label || (
                      <span className="text-gray-300 italic">No date</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5">
          {[
            { key: "bank", label: "Bank Receipts", icon: "ki-filled ki-bank" },
            {
              key: "cash",
              label: "Cash Receipts",
              icon: "ki-filled ki-dollar",
            },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveTab(t.key);
                setFilter("all");
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === t.key
                  ? "bg-primary text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <i className={`${t.icon} text-base`}></i>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            {activeTab === "bank" ? (
              <>
                <span className="text-xs text-gray-400 uppercase tracking-wide block mb-1">
                  Select Bank
                </span>
                <div className="relative">
                  <button
                    onClick={() => setShowAccountDropdown((v) => !v)}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    {selectedAccountLabel}
                    <i className="ki-filled ki-down text-xs text-gray-400"></i>
                  </button>
                </div>
              </>
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">Cash Book</h1>
            )}
          </div>

          {/* Month Close Date */}
          <div
            className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 cursor-pointer hover:shadow-md transition"
            onClick={() => setShowDatePicker(true)}
          >
            <span className="text-sm text-black font-medium whitespace-nowrap">
              Month Close Date :
            </span>
            <input
              type="text"
              readOnly
              className="text-sm text-gray-600 outline-none bg-transparent w-[110px] cursor-pointer"
              value={savedCloseStart ? dmyToIso(savedCloseStart) : ""}
            />
            <span className="text-gray-400 px-1">—</span>
            <input
              type="text"
              readOnly
              className="text-sm text-gray-600 outline-none bg-transparent w-[110px] cursor-pointer"
              value={savedCloseEnd ? dmyToIso(savedCloseEnd) : ""}
            />
          </div>
        </div>

        {/* DateRangePicker modal */}
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
        )}

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {activeTab === "bank" ? (
            <>
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <i className="ki-filled ki-arrow-down text-green-500 text-sm"></i>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                    Total In (DR)
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900">₹60,670.</div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-1.5 mb-2">
                  <i className="ki-filled ki-arrow-up text-red-500 text-sm"></i>
                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                    Total Out (CR)
                  </span>
                </div>
                <div className="text-xl font-bold text-gray-900">₹10,604.</div>
              </div>
              <div className="bg-primary rounded-xl p-5 shadow-sm relative overflow-hidden">
                <span className="text-xs text-gray-300 uppercase tracking-wide block mb-2">
                  Total Bank Balance
                </span>
                <div className="text-2xl font-bold text-white">
                  ₹ 1,428,904.50
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="text-xs text-black uppercase tracking-wide mb-2 flex items-center justify-between">
                  <span>Total Cash In</span>
                  <i className="ki-filled ki-arrow-up text-green-400 text-sm"></i>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹142,500.00
                </div>
              </div>
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <div className="text-xs text-black uppercase tracking-wide mb-2 flex items-center justify-between">
                  <span>Total Cash Out</span>
                  <i className="ki-filled ki-arrow-down text-red-400 text-sm"></i>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  ₹98,320.50
                </div>
              </div>
              <div className="bg-primary rounded-xl p-5 shadow-sm relative overflow-hidden">
                <div className="absolute right-4 bottom-4 opacity-10">
                  <i className="ki-filled ki-wallet text-white text-5xl"></i>
                </div>
                <div className="text-xs text-gray-300 uppercase tracking-wide mb-2">
                  Opening Balance
                </div>
                <div className="text-2xl font-bold text-white">₹44,179.50</div>
              </div>
            </>
          )}
        </div>

        {/* ── Transaction Header ── */}
        <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {activeTab === "bank"
                ? "Transaction Ledger"
                : "Transaction History"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {savedCloseStart && savedCloseEnd
                ? `Showing entries for ${formatDisplay(savedCloseStart)} – ${formatDisplay(savedCloseEnd)}`
                : "Showing all entries"}
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-2 py-1.5 bg-white">
            {(activeTab === "bank"
              ? [
                  { key: "all", label: "All" },
                  { key: "in", label: "In", dot: "bg-green-500" },
                  { key: "out", label: "Out", dot: "bg-red-400" },
                ]
              : [
                  { key: "all", label: "All" },
                  { key: "receipt", label: "Receipts", dot: "bg-green-500" },
                  { key: "payment", label: "Payments", dot: "bg-gray-400" },
                ]
            ).map(({ key, label, dot }) => (
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
                {dot && (
                  <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
                )}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm mb-3">
          <TableComponent
            columns={
              activeTab === "bank" ? bankColumns({ edit: true }) : cashColumns()
            }
            data={paginatedData}
          />
        </div>

        {/* ── Closing Balance ── */}
        <div className="flex justify-end">
          <div className="mt-3 bg-primary text-white rounded-xl px-5 py-4 flex justify-between w-[400px] items-center shadow-sm">
            <div>
              <div className="text-xs uppercase opacity-80">
                Closing Balance
              </div>
              <div className="text-xs opacity-70">
                As on {formatDisplay(savedCloseEnd)}
              </div>
            </div>
            <div className="text-2xl font-bold">
              {activeTab === "bank"
                ? bankBookPageTotals?.balance
                : pageTotals?.balance}
            </div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export default BookPage;
