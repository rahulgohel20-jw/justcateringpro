import { Fragment, useEffect, useState, useRef } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { getColumns, defaultData } from "./constant";
import AddTransferModal from "../../../partials/modals/add-cash-account/AddTransferModal";
import { GETalltransfer, Deletetranferbyid } from "@/services/apiServices";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import useCloseDate from "@/hooks/useCloseDate";
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

const getMonthRange = (m, y) => {
  const start = new Date(y, m, 1);
  const end = new Date(y, m + 1, 0);
  const fmt = (d) =>
    d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  return { startLabel: fmt(start), endLabel: fmt(end) };
};

const Transfers = () => {
  const permissions = usePermission("Transfer");
  const [data, setData] = useState(defaultData);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [search, setSearch] = useState("");
  const sourceAccount = "all";
  const destination = "all";
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState(
    Math.floor(new Date().getFullYear() / 12) * 12,
  );
  const { monthCloseDates, isLoading: closeDateLoading } = useCloseDate(
    month,
    year,
  );
  const userId = localStorage.getItem("userId");

  // Suggestions state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  const formatCloseDate = (dateStr) => {
    if (!dateStr) return "";
    return dayjs(dateStr, "DD/MM/YYYY").format("D MMM");
  };

  const activeDateEntry = monthCloseDates[`${year}-${month + 1}`] ?? null;

  const fetchTransfers = async () => {
    try {
      const startDate = activeDateEntry?.startDate
        ? activeDateEntry.startDate
        : dayjs(new Date(year, month, 1)).format("DD/MM");
      const endDate = activeDateEntry?.closeDate
        ? activeDateEntry.closeDate
        : dayjs(new Date(year, month + 1, 0)).format("DD/MM");

      const res = await GETalltransfer(endDate, startDate, userId);
      const list = res?.data?.data;
      const arr = Array.isArray(list) ? list : [];
      setData(arr);
      const words = extractDictWords(arr, [
        "fromAccountName",
        "toAccountName",
        "notes",
        "fromType",
        "toType",
      ]);
      setDictWords(words);
    } catch (error) {
      console.error("Failed to fetch transfers:", error);
    }
  };

  useEffect(() => {
    if (!closeDateLoading) fetchTransfers();
  }, [month, year, closeDateLoading, activeDateEntry]);

  // Build suggestions while typing
  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false;
      return;
    }
    const q = (search || "").trim().toLowerCase();
    if (q.length < 2 || dictWords.length === 0) {
      setSpellSuggestions([]);
      setShowSpell(false);
      return;
    }
    const timer = setTimeout(() => {
      const suggestions = buildSpellSuggestions(q, dictWords, 6);
      setSpellSuggestions(suggestions);
      setShowSpell(suggestions.length > 0);
      setSpellIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
  }, [search, dictWords]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSpell(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const applySpellSuggestion = (word) => {
    skipSuggestRef.current = true;
    setSearch(word);
    setShowSpell(false);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSpell || spellSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev < spellSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev > 0 ? prev - 1 : spellSuggestions.length - 1
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

  const handleDelete = async (id) => {
    try {
      await Deletetranferbyid(id);
      Swal.fire("Deleted!", "Transfer has been deleted.", "success");
      fetchTransfers();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEdit = (row) => {
    setEditRow(row);
    setOpenTransfer(true);
  };

  const handleClose = () => {
    setOpenTransfer(false);
    setEditRow(null);
    fetchTransfers();
  };

  const filteredData = data.filter((item) => {
    if (item.isDelete) return false;

    const matchSource =
      sourceAccount === "all" || item.fromType === sourceAccount;
    const matchDest = destination === "all" || item.toType === destination;

    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      [
        item.date,
        item.fromType,
        item.toType,
        item.fromAccountName,
        item.toAccountName,
        item.notes,
        item.amount,
      ]
        .filter(Boolean)
        .some((field) => field.toString().toLowerCase().includes(q));

    return matchSource && matchDest && matchSearch;
  });

  const columns = getColumns(handleEdit, handleDelete, permissions);

  return (
    <Fragment>
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
                        (_, i) => yearRangeStart + i,
                      ).map((y) => (
                        <button
                          key={y}
                          onClick={() => {
                            setYear(y);
                            setShowYearPicker(false);
                          }}
                          className={`py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer transition ${
                            y === year
                              ? "bg-primary text-white"
                              : "bg-gray-50 text-gray-700 hover:bg-gray-100"
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

            {MONTHS.slice(0, 6).map((m, i) => {
              const { startLabel, endLabel } = getMonthRange(i, year);
              const isSelected = month === i;
              const entry = monthCloseDates[`${year}-${i + 1}`];
              return (
                <button
                  key={m}
                  onClick={() => setMonth(i)}
                  className={`relative flex flex-col items-start px-3 py-2 rounded-2xl border transition-all text-left ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white text-gray-800 border-gray-200 hover:border-primary hover:shadow-sm"
                  }`}
                >
                  <span className="font-bold text-sm">{m}</span>
                  <span
                    className={`text-[11px] mt-1 ${isSelected ? "text-blue-100" : "text-black"}`}
                  >
                    {entry
                      ? `${formatCloseDate(entry.startDate)} → ${formatCloseDate(entry.closeDate)}`
                      : `${startLabel} → ${endLabel}`}
                  </span>
                </button>
              );
            })}

            <div />

            {MONTHS.slice(6, 12).map((m, i) => {
              const realIndex = i + 6;
              const { startLabel, endLabel } = getMonthRange(realIndex, year);
              const isSelected = month === realIndex;
              const entry = monthCloseDates[`${year}-${realIndex + 1}`];
              return (
                <button
                  key={m}
                  onClick={() => setMonth(realIndex)}
                  className={`relative flex flex-col items-start px-3 py-2 rounded-2xl border transition-all text-left ${
                    isSelected
                      ? "bg-primary text-white border-primary shadow-md"
                      : "bg-white text-gray-800 border-gray-200 hover:border-primary hover:shadow-sm"
                  }`}
                >
                  <span className="font-bold text-sm">{m}</span>
                  <span
                    className={`text-[11px] mt-1 ${isSelected ? "text-blue-100" : "text-black"}`}
                  >
                    {entry
                      ? `${formatCloseDate(entry.startDate)} → ${formatCloseDate(entry.closeDate)}`
                      : `${startLabel} → ${endLabel}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Page Header ── */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Transfers</h2>
              <p className="text-sm text-black mt-0.5">
                Internal fund movement between Cash and Bank accounts
              </p>
            </div>
            {permissions.add && (
              <button
                onClick={() => {
                  setEditRow(null);
                  setOpenTransfer(true);
                }}
                className="flex items-center gap-2 bg-primary hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm"
              >
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                New Transfer
              </button>
            )}
          </div>

          {/* ── Filters + Table ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-gray-100">
              <div className="relative" ref={searchBoxRef}>
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
                  placeholder="Search reference..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 w-52 transition"
                />
                {showSpell && spellSuggestions.length > 0 && (
                  <div className="absolute left-0 top-full mt-1 w-[260px] bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="px-3 pt-2 pb-1 text-xs text-gray-400">
                      Suggestions:
                    </div>
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
            <TableComponent columns={columns} data={filteredData} />
          </div>
        </div>

        <AddTransferModal
          open={openTransfer}
          onClose={handleClose}
          editData={editRow}
        />
      </Container>
    </Fragment>
  );
};

export default Transfers;
