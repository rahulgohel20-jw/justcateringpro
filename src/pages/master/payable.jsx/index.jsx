import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { cashPaymentColumns, bankPaymentColumns } from "./constant";
import {
  GETallbytypereciptpayment,
  GetbankdetailsbyuserId,
  CashAccountGetAll,
  Getbyidreciptpayment,
  DeleteReciptPayment,
} from "@/services/apiServices";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import AddPayable from "../../../partials/modals/add-cash-account/AddPayable";
import { useCloseDateAll } from "@/hooks/useCloseDate";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

const MONTHS = [
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

const getMonthRange = (m, y) => {
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  const fmt = (d) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return { startLabel: fmt(start), endLabel: fmt(end) };
};

const Payable = () => {
  const [tab, setTab] = useState("cash");
  const [subTab, setSubTab] = useState("");
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState(
    Math.floor(new Date().getFullYear() / 12) * 12
  );

  const [modalState, setModalState] = useState({
    open: false,
    mode: "add",
    data: null,
  });
  const [cashSubTabs, setCashSubTabs] = useState([]);
  const [bankSubTabs, setBankSubTabs] = useState([]);
  const subTabs = tab === "cash" ? cashSubTabs : bankSubTabs;
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const { monthCloseDates } = useCloseDateAll(year);

  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const searchBoxRef = useRef(null);
  const skipSuggestRef = useRef(false);

  const formatCloseDate = (dateStr) => {
    if (!dateStr) return "";
    return dayjs(dateStr, "DD/MM/YYYY").format("D MMM");
  };

  // ── Load sub-tabs when main tab changes ──
  useEffect(() => {
    const loadSubTabs = async () => {
      try {
        if (tab === "cash") {
          const res = await CashAccountGetAll(1);
          const accounts = res?.data?.data || [];

          const allOption = {
            key: "all",
            label: "All",
            id: -1,
          };

          setCashSubTabs([
            allOption,
            ...accounts.map((c) => ({
              key: String(c.id),
              label: c.accountName || c.cashTypeName || c.name,
              id: c.id,
            })),
          ]);

          setSubTab("all");
        } else {
          const res = await GetbankdetailsbyuserId(1);
          const accounts = res?.data?.data || [];

          const allOption = {
            key: "all",
            label: "All",
            id: -1,
          };

          setBankSubTabs([
            allOption,
            ...accounts.map((b) => ({
              key: String(b.id),
              label: b.bankName || b.accountName || b.name,
              id: b.id,
            })),
          ]);

          setSubTab("all");
        }
      } catch (err) {
        console.error("❌ Failed to load sub-tabs →", err);
      }
    };

    loadSubTabs();
  }, [tab]);

  // ── Fetch payments ──
  const fetchPayments = useCallback(async () => {
    setTableLoading(true);
    try {
      const selected = subTabs.find((s) => s.key === subTab);
      const accountId = selected?.id ?? -1;

      const payload = {
        month: month + 1,
        year,
        type: tab.toUpperCase(),
        accountId,
        paymentMode,
      };

      const res = await GETallbytypereciptpayment(payload);
      setTableData(res?.data?.data || []);
    } catch (err) {
      console.error("❌ Fetch payments error →", err);
      setTableData([]);
    } finally {
      setTableLoading(false);
    }
  }, [subTabs, subTab, month, year, tab, paymentMode]);

  useEffect(() => {
    if (subTab) fetchPayments();
  }, [subTab, fetchPayments]);

  const dictWords = useMemo(
    () =>
      extractDictWords(tableData, [
        "partyName",
        "voucherNo",
        "referenceNo",
        "paymentMode",
      ]),
    [tableData]
  );

  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const suggestions = buildSpellSuggestions(search, dictWords);
      setSpellSuggestions(suggestions);
      setShowSpell(suggestions.length > 0);
      setSpellIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
  }, [search, dictWords]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSpell(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const applySpellSuggestion = (word) => {
    skipSuggestRef.current = true;
    setSearch(word);
    setShowSpell(false);
    setSpellIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSpell || spellSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSpellIndex((prev) => (prev + 1) % spellSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev <= 0 ? spellSuggestions.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (spellIndex >= 0 && spellIndex < spellSuggestions.length) {
        e.preventDefault();
        applySpellSuggestion(spellSuggestions[spellIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSpell(false);
    }
  };

  const filteredData = useMemo(() => {
    if (!search.trim()) return tableData;
    const q = search.toLowerCase().trim();
    return tableData.filter(
      (item) =>
        item.partyName?.toLowerCase().includes(q) ||
        item.voucherNo?.toLowerCase().includes(q) ||
        item.referenceNo?.toLowerCase().includes(q) ||
        item.paymentMode?.toLowerCase().includes(q)
    );
  }, [tableData, search]);

  // ── Handle view / edit / delete ──
  const handleAction = async (rowData, mode) => {
    if (mode === "delete") {
      Swal.fire({
        title: "Are you sure?",
        text: `Delete payment ${rowData.voucherNo || ""}? This cannot be undone.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (!result.isConfirmed) return;
        try {
          const res = await DeleteReciptPayment(rowData.id);
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: res?.data?.msg || "Deleted successfully",
            confirmButtonColor: "#3085d6",
          });
          fetchPayments();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: err?.response?.data?.msg || "Failed to delete payment",
          });
        }
      });
      return;
    }

    // edit or view — fetch full data by ID
    try {
      const res = await Getbyidreciptpayment(rowData.id);
      const fullData = res?.data?.data || rowData;
      setModalState({ open: true, mode, data: fullData });
    } catch (err) {
      console.error("❌ Fetch by ID error →", err);
      setModalState({ open: true, mode, data: rowData });
    }
  };

  const closeModal = () =>
    setModalState({ open: false, mode: "add", data: null });

  const handleModalSuccess = () => {
    closeModal();
    fetchPayments();
  };

  return (
    <Container>
      <div className="space-y-5">
        {/* ── Year + Month Grid ── */}
        <div className="grid grid-cols-7 gap-3">
          <div className="relative col-span-1 flex flex-col justify-start">
            <button
              onClick={() => setShowYearPicker((v) => !v)}
              className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-bold text-base w-fit min-w-[70px]"
            >
              {year}
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
                      (_, i) => yearRangeStart + i
                    ).map((y) => (
                      <button
                        key={y}
                        onClick={() => {
                          setYear(y);
                          setShowYearPicker(false);
                        }}
                        className={`py-2 rounded-xl text-sm font-semibold transition ${
                          y === year
                            ? "bg-primary text-white shadow"
                            : "hover:bg-gray-100 text-gray-700 border-0 bg-transparent cursor-pointer"
                        }`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="col-span-6 grid grid-cols-6 gap-2">
            {MONTHS.map((m, idx) => {
              const { startLabel, endLabel } = getMonthRange(idx, year);
              const isSelected = month === idx;
              const closeDateRaw = monthCloseDates[idx + 1];
              const closeDateFmt = formatCloseDate(closeDateRaw);

              return (
                <button
                  key={m}
                  onClick={() => setMonth(idx)}
                  className={`relative p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{m}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </div>

                  <p
                    className={`text-[10px] leading-tight ${
                      isSelected ? "text-white/80" : "text-gray-400"
                    }`}
                  >
                    {startLabel} – {endLabel}
                  </p>

                  <div className="mt-1 flex items-center gap-1">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        closeDateFmt ? "bg-red-600" : "bg-emerald-400"
                      }`}
                    />
                    <span
                      className={`text-[9px] font-medium ${
                        isSelected
                          ? closeDateFmt
                            ? "text-red-600"
                            : "text-emerald-300"
                          : closeDateFmt
                            ? "text-red-600"
                            : "text-emerald-600"
                      }`}
                    >
                      {closeDateFmt ? `${closeDateFmt}` : "Open"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Tab Navigation ── */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-2">
          <div className="flex items-center gap-2">
            {[
              { key: "cash", label: "Cash Payment" },
              { key: "bank", label: "Bank Payment" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setTab(t.key);
                  setPaymentMode(t.key === "cash" ? "CASH" : "BANK_TRANSFER");
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  tab === t.key
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              setModalState({ open: true, mode: "add", data: null })
            }
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <i className="ki-filled ki-plus text-xs" />
            Add {tab === "cash" ? "Cash" : "Bank"} Payment
          </button>
        </div>

        {/* ── Content Card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Card Top: Title + Search */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <div>
              <span className="font-bold text-gray-800 text-sm">
                {tab === "cash" ? "Cash Payment" : "Bank Payment"}
              </span>
              <span className="ml-2 text-xs text-gray-400">
                ({filteredData.length} entries)
              </span>
            </div>

            <div ref={searchBoxRef} className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => spellSuggestions.length > 0 && setShowSpell(true)}
                onKeyDown={handleSearchKeyDown}
                autoComplete="off"
                spellCheck={false}
                placeholder="Search payments..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 w-52 transition"
              />
              {showSpell && spellSuggestions.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="px-3 pt-2 pb-1 text-xs text-gray-400">Suggestions:</div>
                  <ul>
                    {spellSuggestions.map((s, i) => (
                      <li
                        key={s}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applySpellSuggestion(s);
                        }}
                        onMouseEnter={() => setSpellIndex(i)}
                        className={`px-3 py-2 cursor-pointer text-sm text-primary capitalize ${
                          i === spellIndex ? "bg-gray-100" : "hover:bg-gray-50"
                        }`}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100 bg-gray-50/50">
            {subTabs.map((s) => (
              <button
                key={s.key}
                onClick={() => setSubTab(s.key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  subTab === s.key
                    ? "bg-white text-primary shadow-sm border border-gray-200"
                    : "text-black hover:text-gray-700 hover:bg-white"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          {/* Payment Mode Filter */}
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100">
            <span className="text-xs text-gray-400 font-medium mr-1">
              Mode:
            </span>
            {(tab === "cash"
              ? [{ key: "CASH", label: "Cash" }]
              : [
                  { key: "BANK_TRANSFER", label: "Bank Transfer" },
                  { key: "UPI", label: "UPI" },
                  { key: "CHEQUE", label: "Cheque" },
                  { key: "IMPS_NEFT", label: "NEFT" },
                ]
            ).map((m) => (
              <button
                key={m.key}
                onClick={() => setPaymentMode(m.key)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  paymentMode === m.key
                    ? "bg-primary text-white shadow-sm"
                    : "text-black hover:text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Table */}
          <TableComponent
            columns={
              tab === "cash"
                ? cashPaymentColumns(handleAction)
                : bankPaymentColumns(handleAction)
            }
            data={filteredData}
            loading={tableLoading}
          />
        </div>
      </div>

      {/* ── Modal (add / edit / view) ── */}
      <AddPayable
        open={modalState.open}
        onClose={closeModal}
        mode={modalState.mode}
        initialData={modalState.data}
        type={tab}
        userId={1}
        onSuccess={handleModalSuccess}
      />
    </Container>
  );
};

export default Payable;
