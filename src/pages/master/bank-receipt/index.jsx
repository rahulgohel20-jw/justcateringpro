/* eslint-disable react/prop-types */
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { bankReceiptColumns } from "./constant";
import { FormattedMessage, useIntl } from "react-intl";
import Swal from "sweetalert2";
import {
  GETallbytypereciptpayment,
  GetbankdetailsbyuserId,
  Getbyidreciptpayment,
  DeleteReciptPayment,
} from "@/services/apiServices";
import dayjs from "dayjs";
import AddBankReceiptModal from "../../../partials/modals/add-bank-details/AddBankReceiptModal";
import { useCloseDateAll } from "@/hooks/useCloseDate";
import { usePermission } from "../../../hooks/usePermission";
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

const PAYMENT_MODES = [
  { key: "BANK_TRANSFER", label: "Bank Transfer" },
  { key: "UPI", label: "UPI" },
  { key: "CHEQUE", label: "Cheque" },
];

const BankReceipts = () => {
  const permissions = usePermission("BankRecipet");
  const intl = useIntl();
  const userId = JSON.parse(localStorage.getItem("userId"));

  const [subTab, setSubTab] = useState("all");
  const [bankSubTabs, setBankSubTabs] = useState([]);
  const [paymentMode, setPaymentMode] = useState("");
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [autoMonthSet, setAutoMonthSet] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState(
    Math.floor(new Date().getFullYear() / 12) * 12
  );
  const [modalState, setModalState] = useState({
    open: false,
    mode: "add",
    data: null,
  });
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const searchBoxRef = useRef(null);
  const skipSuggestRef = useRef(false);

  // ── Fetch ALL year's close dates from API ──
  const { monthCloseDates, isLoading: closeDateLoading } =
    useCloseDateAll(year);

  const formatCloseDate = (dateStr) => {
    if (!dateStr) return "";
    return dayjs(dateStr, "DD/MM/YYYY").format("D MMM");
  };

  // ── Dates from API only ──
  const getMonthDisplay = (m, y) => {
    const key = `${y}-${m + 1}`;
    const entry = monthCloseDates?.[key];
    if (!entry?.startDate || !entry?.closeDate) return "—";
    return `${formatCloseDate(entry.startDate)} → ${formatCloseDate(entry.closeDate)}`;
  };

  const getIsActive = (m, y) => {
    const key = `${y}-${m + 1}`;
    return monthCloseDates?.[key]?.isActive ?? false;
  };

  // ── Auto-select isActive month from API ──
  useEffect(() => {
    if (autoMonthSet || closeDateLoading || !monthCloseDates) return;
    const activeEntry = Object.values(monthCloseDates).find((e) => e.isActive);
    if (activeEntry) {
      setMonth(activeEntry.month - 1);
      setYear(activeEntry.year);
      setAutoMonthSet(true);
    }
  }, [monthCloseDates, closeDateLoading, autoMonthSet]);

  // ── Load bank sub-tabs ──
  useEffect(() => {
    const loadSubTabs = async () => {
      try {
        const res = await GetbankdetailsbyuserId(userId);
        const accounts = res?.data?.data || [];
        setBankSubTabs([
          { key: "all", label: "All", id: -1 },
          ...accounts.map((b) => ({
            key: String(b.id),
            label: b.bankName || b.name,
            id: b.id,
          })),
        ]);
        setSubTab("all");
      } catch (err) {
        console.error("❌ SubTabs load error →", err);
      }
    };
    loadSubTabs();
  }, [userId]);

  // ── Fetch Bank Receipts ──
  const fetchReceipts = useCallback(async () => {
    const key = `${year}-${month + 1}`;
    const entry = monthCloseDates?.[key];

    const startDate = entry?.startDate
      ? entry.startDate
      : dayjs(new Date(year, month, 1)).format("DD/MM/YYYY");
    const endDate = entry?.closeDate
      ? entry.closeDate
      : dayjs(new Date(year, month + 1, 0)).format("DD/MM/YYYY");

    try {
      setTableLoading(true);
      const selectedTab = bankSubTabs.find((s) => s.key === subTab);
      const selectedId =
        !selectedTab || selectedTab?.id === -1 ? -1 : selectedTab?.id;

      const res = await GETallbytypereciptpayment({
        accountType: "BANK",
        bankAccountId: selectedId,
        cashTypeId: "",
        endDate,
        entryType: "RECEIPT",
        paymentMode,
        startDate,
        userId,
        voucherNo: "",
        partyName: "",
      });

      setTableData(res?.data?.data || []);
    } catch (err) {
      console.error("❌ Fetch receipts error →", err);
      setTableData([]);
    } finally {
      setTableLoading(false);
    }
  }, [year, month, monthCloseDates, bankSubTabs, subTab, paymentMode, userId]);

  useEffect(() => {
    if (subTab && !closeDateLoading && bankSubTabs.length > 0) fetchReceipts();
  }, [
    subTab,
    closeDateLoading,
    bankSubTabs.length,
    fetchReceipts,
  ]);

  const dictWords = useMemo(
    () => extractDictWords(tableData, ["partyName", "voucherNo", "referenceNo"]),
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

  // ── Handle Action ──
  const handleAction = async (rowData, mode) => {
    if (mode === "delete") {
      Swal.fire({
        title: intl.formatMessage({
          id: "RECEIPT.DELETE_TITLE",
          defaultMessage: "Are you sure?",
        }),
        text: intl.formatMessage(
          {
            id: "RECEIPT.DELETE_TEXT",
            defaultMessage:
              "Delete receipt {voucherNo}? This cannot be undone.",
          },
          { voucherNo: rowData.voucherNo || "" }
        ),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: intl.formatMessage({
          id: "RECEIPT.YES_DELETE",
          defaultMessage: "Yes, delete it!",
        }),
      }).then(async (result) => {
        if (!result.isConfirmed) return;
        try {
          const res = await DeleteReciptPayment(rowData.id);
          Swal.fire({
            icon: "success",
            title: intl.formatMessage({
              id: "RECEIPT.DELETED",
              defaultMessage: "Deleted!",
            }),
            text:
              res?.data?.msg ||
              intl.formatMessage({
                id: "RECEIPT.DELETE_SUCCESS",
                defaultMessage: "Receipt deleted successfully",
              }),
            confirmButtonColor: "#3085d6",
          });
          fetchReceipts();
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: err?.response?.data?.msg || "Failed to delete receipt",
          });
        }
      });
      return;
    }

    try {
      const res = await Getbyidreciptpayment(rowData.id);
      const fullData = res?.data?.data || rowData;
      setModalState({ open: true, mode, data: fullData });
    } catch {
      setModalState({ open: true, mode, data: rowData });
    }
  };

  const closeModal = () =>
    setModalState({ open: false, mode: "add", data: null });
  const handleModalSuccess = () => {
    closeModal();
    fetchReceipts();
  };

  const filteredData = tableData.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.voucherNo?.toLowerCase().includes(q) ||
      item.partyName?.toLowerCase().includes(q) ||
      item.referenceNo?.toLowerCase().includes(q) ||
      item.date?.toLowerCase().includes(q)
    );
  });

  // ── MonthButton (matches SuperCashReceipt pattern) ──
  const MonthButton = ({ m, index }) => {
    const isSelected = month === index;
    const isActive = getIsActive(index, year);
    return (
      <button
        onClick={() => setMonth(index)}
        className={`relative flex flex-col items-start px-3 py-2 rounded-2xl border transition-all text-left ${
          isSelected
            ? "border-primary bg-primary text-white shadow-md shadow-primary/20"
            : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50/60"
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <span
            className={`text-xs font-bold ${
              isSelected ? "text-white" : "text-gray-800"
            }`}
          >
            {m}
          </span>
          <span
            className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
              isSelected
                ? "bg-white/20 text-white"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <span
          className={`text-[9px] mt-0.5 truncate w-full ${
            isSelected ? "text-white/80" : "text-gray-400"
          }`}
        >
          {getMonthDisplay(index, year)}
        </span>
        <span
          className={`text-[9px] font-semibold mt-1 px-1.5 py-0.2 rounded-full ${
            isSelected
              ? "bg-white/25 text-white"
              : isActive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-500"
          }`}
        >
          {isActive ? "Open" : "Closed"}
        </span>
      </button>
    );
  };

  return (
    <Container>
      <div className="space-y-4">
        {/* ── Year + Month Grid ── */}
        <div className="grid grid-cols-7 gap-2">
          {/* Year selector button + popup */}
          <div className="relative col-span-1 flex flex-col justify-start">
            <button
              onClick={() => setShowYearPicker((v) => !v)}
              className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-bold w-fit min-w-[70px]"
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

          {/* Month buttons (col 2–7) */}
          <div className="col-span-6 grid grid-cols-6 gap-2">
            {MONTHS.map((m, idx) => (
              <MonthButton key={m} m={m} index={idx} />
            ))}
          </div>
        </div>

        {/* ── Action Bar: Title + Add Button ── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              <FormattedMessage
                id="RECEIPT.BANK_RECEIPTS"
                defaultMessage="Bank Receipts"
              />
            </h2>
            <p className="text-xs text-gray-400">
              {MONTHS[month]} {year} • {filteredData.length} records
            </p>
          </div>

          {permissions.add && (
            <button
              onClick={() =>
                setModalState({ open: true, mode: "add", data: null })
              }
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold shadow-sm transition"
            >
              <i className="ki-filled ki-plus text-xs" />
              <FormattedMessage
                id="RECEIPT.ADD_BANK_RECEIPT"
                defaultMessage="Add Bank Receipt"
              />
            </button>
          )}
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Bank Account SubTabs + Search */}
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100 bg-gray-50/50">
            {bankSubTabs.map((s) => (
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
            <div ref={searchBoxRef} className="relative ml-auto">
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
                placeholder={intl.formatMessage({
                  id: "RECEIPT.SEARCH_RECEIPTS",
                  defaultMessage: "Search receipts...",
                })}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 w-52 transition"
              />
              {showSpell && spellSuggestions.length > 0 && (
                <div className="absolute right-0 top-full mt-1 w-[260px] bg-white border border-gray-200 rounded-md shadow-lg z-50">
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

          {/* Payment Mode Filter */}
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100">
            <span className="text-xs text-gray-400 font-medium mr-1">
              Mode:
            </span>
            {PAYMENT_MODES.map((m) => (
              <button
                key={m.key}
                onClick={() =>
                  setPaymentMode((prev) => (prev === m.key ? "" : m.key))
                }
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

          <TableComponent
            columns={bankReceiptColumns(handleAction)}
            data={filteredData}
            loading={tableLoading}
          />
        </div>
      </div>

      <AddBankReceiptModal
        open={modalState.open}
        onClose={closeModal}
        mode={modalState.mode}
        initialData={modalState.data}
        onSuccess={handleModalSuccess}
      />
    </Container>
  );
};

export default BankReceipts;
