import { useState, useRef, useEffect } from "react";
import { TableComponent } from "@/components/table/TableComponent";

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmtINR = (n) =>
  "₹ " +
  Number(n ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtPlain = (n) =>
  Number(n ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const MONTH_NAMES = [
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

// Static close-date periods matching SuperadminInvoice pattern
const STATIC_PERIODS = {
  0: { start: "1 Jan", end: "28 Feb" },
  1: { start: "10 Feb", end: "10 Mar" },
  2: { start: "11 Mar", end: "12 Apr" },
  3: { start: "13 Apr", end: "12 May" },
  4: { start: "13 May", end: "12 Jun" },
  5: { start: "13 Jun", end: "12 Jul" },
  6: { start: "13 Jul", end: "12 Aug" },
  7: { start: "1 Aug", end: "31 Aug" },
  8: { start: "1 Sep", end: "30 Sep" },
  9: { start: "1 Oct", end: "31 Oct" },
  10: { start: "1 Nov", end: "30 Nov" },
  11: { start: "1 Dec", end: "31 Dec" },
};

// ── Static party list ─────────────────────────────────────────────────────────
const STATIC_PARTIES = [
  { id: 1, name: "Corporate Operating Account - Chase 9021" },
  { id: 2, name: "Savings Account - HDFC 4523" },
  { id: 3, name: "Current Account - SBI 7890" },
  { id: 4, name: "Zenith Corp" },
  { id: 5, name: "Cloud Systems Inc." },
];

// ── Static ledger rows ────────────────────────────────────────────────────────
const STATIC_LEDGER = [
  {
    id: 1,
    date: "Jan 01, 2024",
    voucherType: null,
    voucherNo: null,
    particulars: "Opening Balance",
    debit: null,
    credit: null,
    balance: 124500.0,
    balanceType: "DR",
    isOpening: true,
  },
  {
    id: 2,
    date: "Jan 04, 2024",
    voucherType: "INVOICE",
    voucherNo: "INV-2024-001",
    particulars: "Revenue from Zenith Corp – Phase 1",
    debit: 25000.0,
    credit: null,
    balance: 149500.0,
    balanceType: "DR",
  },
  {
    id: 3,
    date: "Jan 12, 2024",
    voucherType: "EXPENSE",
    voucherNo: "EXP-8892",
    particulars: "Office Rental – January HQ",
    debit: null,
    credit: 8500.0,
    balance: 141000.0,
    balanceType: "DR",
  },
  {
    id: 4,
    date: "Jan 15, 2024",
    voucherType: "PAYMENT",
    voucherNo: "PAY-4410",
    particulars: "Vendor Payout: Cloud Systems Inc.",
    debit: null,
    credit: 4440.0,
    balance: 136560.0,
    balanceType: "DR",
  },
  {
    id: 5,

    date: "Jan 22, 2024",
    voucherType: "INVOICE",
    voucherNo: "INV-2024-009",
    particulars: "Consulting Fee – Project Alpha",
    debit: 20280.5,
    credit: null,
    balance: 156840.5,
    balanceType: "DR",
  },
];

// ── Voucher type badge ────────────────────────────────────────────────────────
const VoucherBadge = ({ type }) => {
  if (!type) return <span className="text-gray-400 text-xs">—</span>;
  const map = {
    INVOICE: "bg-green-100 text-green-700",
    EXPENSE: "bg-orange-100 text-orange-700",
    PAYMENT: "bg-blue-50 text-[#005BA8]",
    RECEIPT: "bg-purple-100 text-purple-700",
  };
  return (
    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold">
      {type}
    </span>
  );
};

// ── Table columns definition ──────────────────────────────────────────────────
const LEDGER_COLUMNS = [
  {
    accessorKey: "id",
    header: "Sr no",
    cell: ({ row }) => <VoucherBadge type={row.original.id} />,
  },
  {
    accessorKey: "date",
    header: "DATE",
    cell: ({ row }) => (
      <span
        className={`text-xs whitespace-nowrap ${
          row.original.isOpening ? "font-bold text-gray-900" : "text-gray-600"
        }`}
      >
        {row.original.date}
      </span>
    ),
  },
  {
    accessorKey: "voucherType",
    header: "VOUCHER TYPE",
    cell: ({ row }) => <VoucherBadge type={row.original.voucherType} />,
  },
  {
    accessorKey: "voucherNo",
    header: "VOUCHER NO",
    cell: ({ row }) =>
      row.original.voucherNo ? (
        <span className="text-[#005BA8] text-xs font-semibold">
          {row.original.voucherNo}
        </span>
      ) : (
        <span className="text-gray-400 text-xs">—</span>
      ),
  },
  {
    accessorKey: "particulars",
    header: "PARTICULARS",
    cell: ({ row }) => (
      <span
        className={`text-sm ${
          row.original.isOpening
            ? "font-bold italic text-gray-900"
            : "text-gray-700"
        }`}
      >
        {row.original.particulars}
      </span>
    ),
  },
  {
    accessorKey: "debit",
    header: "DEBIT (₹)",
    cell: ({ row }) =>
      row.original.debit != null ? (
        <span className="text-sm font-semibold text-gray-800">
          {fmtPlain(row.original.debit)}
        </span>
      ) : (
        <span className="text-gray-300 text-xs">—</span>
      ),
  },
  {
    accessorKey: "credit",
    header: "CREDIT (₹)",
    cell: ({ row }) =>
      row.original.credit != null ? (
        <span className="text-sm font-semibold text-red-500">
          {fmtPlain(row.original.credit)}
        </span>
      ) : (
        <span className="text-gray-300 text-xs">—</span>
      ),
  },
  {
    accessorKey: "balance",
    header: "BALANCE (₹)",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-bold text-gray-900">
          {fmtPlain(row.original.balance)}
        </span>
        {row.original.balanceType && (
          <span
            className={`text-[10px] font-bold px-1 py-0.5 rounded ${
              row.original.balanceType === "CR"
                ? "bg-green-100 text-green-700"
                : "bg-blue-50 text-[#005BA8]"
            }`}
          ></span>
        )}
      </div>
    ),
  },
];

// ── Summary top card ──────────────────────────────────────────────────────────
const SummaryCard = ({
  label,
  value,
  valueColor,
  tag,
  tagColor,
  icon,
  borderLeft,
}) => (
  <div
    className={`bg-white rounded-xl border shadow-sm p-4 flex flex-col gap-1 ${
      borderLeft
        ? "border-l-4 border-l-[#005BA8] border-gray-100"
        : "border-gray-100"
    }`}
  >
    <p className="text-[11px] font-semibold  uppercase tracking-wider">
      {label}
    </p>
    <div className="flex items-center gap-2 mt-1">
      <span className={`text-xl font-bold ${valueColor ?? "text-gray-900"}`}>
        {value}
      </span>
      {tag && (
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${tagColor}`}
        >
          {tag}
        </span>
      )}
      {icon && <span className="text-lg leading-none">{icon}</span>}
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AccountLedgerSuperadmin = () => {
  const [selectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const [parties] = useState(STATIC_PARTIES);
  const [selectedParty, setSelectedParty] = useState(null);
  const [partySearch, setPartySearch] = useState("");
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);
  const partyRef = useRef(null);

  const [fromDate, setFromDate] = useState("2024-01-01");
  const [toDate, setToDate] = useState("2024-03-31");
  const [ledgerData, setLedgerData] = useState([]);

  // Derived totals
  const totalDebit = ledgerData.reduce((s, r) => s + (r.debit ?? 0), 0);
  const totalCredit = ledgerData.reduce((s, r) => s + (r.credit ?? 0), 0);
  const openingBal = ledgerData.find((r) => r.isOpening)?.balance ?? 0;
  const closingBal =
    ledgerData.length > 0 ? ledgerData[ledgerData.length - 1].balance : 0;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (partyRef.current && !partyRef.current.contains(e.target))
        setShowPartyDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMonthClick = (monthIndex) => {
    setSelectedMonth(monthIndex);
    // In real integration: update dates and call fetchLedger
  };

  const handleSearch = () => {
    // In real integration: call API. Using static data here.
    if (!selectedParty) return;
    setLedgerData(STATIC_LEDGER);
  };

  const handleReset = () => {
    setSelectedParty(null);
    setPartySearch("");
    setFromDate("2024-01-01");
    setToDate("2024-03-31");
    setLedgerData([]);
  };

  const filteredParties = parties.filter((p) =>
    p.name.toLowerCase().includes(partySearch.toLowerCase()),
  );

  return (
    <div className="min-h-screen  p-2 md:p-4 space-y-4">
      {/* ── Breadcrumb + Header ─────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Account Ledger</h1>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:shadow-sm transition">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export to Excel
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:shadow-sm transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>

      {/* ── Year + Month Selector ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="grid grid-cols-7 gap-2">
          {/* Year pill */}
          <div className="flex items-center justify-center rounded-xl bg-[#005BA8] text-white font-bold text-lg min-h-[62px]">
            {selectedYear}
          </div>

          {/* Jan – Jun */}
          {MONTH_NAMES.slice(0, 6).map((m, i) => {
            const isSelected = selectedMonth === i;
            const p = STATIC_PERIODS[i];
            return (
              <button
                key={i}
                onClick={() => handleMonthClick(i)}
                className={`flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${
                  isSelected
                    ? "bg-[#005BA8] text-white border-[#005BA8]"
                    : "bg-gray-50  border-gray-200 hover:border-[#005BA8] hover:text-[#005BA8]"
                }`}
              >
                <span className="font-semibold">{m}</span>
                <span
                  className={`text-[10px] mt-0.5 whitespace-nowrap ${isSelected ? "text-blue-100" : "text-black"}`}
                >
                  {p.start} → {p.end}
                </span>
              </button>
            );
          })}

          {/* Empty slot (row 2 col 1) */}
          <div />

          {/* Jul – Dec */}
          {MONTH_NAMES.slice(6, 12).map((m, i) => {
            const realIndex = i + 6;
            const isSelected = selectedMonth === realIndex;
            const p = STATIC_PERIODS[realIndex];
            return (
              <button
                key={realIndex}
                onClick={() => handleMonthClick(realIndex)}
                className={`flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${
                  isSelected
                    ? "bg-[#005BA8] text-white border-[#005BA8]"
                    : "bg-gray-50 text-gray-700 border-gray-200 hover:border-[#005BA8] hover:text-[#005BA8]"
                }`}
              >
                <span className="font-semibold">{m}</span>
                <span
                  className={`text-[10px] mt-0.5 whitespace-nowrap ${isSelected ? "text-blue-100" : "text-black"}`}
                >
                  {p.start} → {p.end}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="bg-gray-50 rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Account Name */}
          <div ref={partyRef} className="relative">
            <label className="block text-xs font-semibold  uppercase tracking-wider mb-1.5">
              Account Name
            </label>
            <button
              onClick={() => setShowPartyDropdown((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm hover:border-[#005BA8] transition"
            >
              <span
                className={
                  selectedParty
                    ? "text-gray-900 font-medium truncate"
                    : "text-gray-400"
                }
              >
                {selectedParty?.name || "Select Party"}
              </span>
              <svg
                className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showPartyDropdown && (
              <div className="absolute top-full mt-1 left-0 right-0 z-50 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                <div className="p-2 sticky top-0 bg-white border-b border-gray-100">
                  <input
                    autoFocus
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-[#005BA8]"
                    placeholder="Search party..."
                    value={partySearch}
                    onChange={(e) => setPartySearch(e.target.value)}
                  />
                </div>
                {filteredParties.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-4">
                    No parties found
                  </p>
                ) : (
                  filteredParties.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedParty(p);
                        setPartySearch("");
                        setShowPartyDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 hover:text-[#005BA8] transition"
                    >
                      {p.name}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* From Date */}
          <div>
            <label className="block text-xs font-semibold  uppercase tracking-wider mb-1.5">
              From Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#005BA8] transition"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs font-semibold  uppercase tracking-wider mb-1.5">
              To Date
            </label>
            <input
              type="date"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-700 outline-none focus:border-[#005BA8] transition"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#005BA8] text-white text-sm font-semibold hover:bg-[#004d90] transition"
            >
              Search
            </button>
            <button
              onClick={handleReset}
              title="Reset"
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 bg-white  hover:border-gray-400 transition"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Opening Balance"
          value={fmtINR(openingBal)}
          tag="DR"
          tagColor="bg-blue-50 text-[#005BA8]"
        />
        <SummaryCard
          label="Total Debit"
          value={fmtINR(totalDebit)}
          valueColor="text-[#005BA8]"
          icon="↗"
        />
        <SummaryCard
          label="Total Credit"
          value={fmtINR(totalCredit)}
          valueColor="text-red-500"
          icon="↘"
        />
        <SummaryCard
          label="Closing Balance"
          value={fmtINR(closingBal)}
          tag="CR"
          tagColor="bg-green-100 text-green-700"
          borderLeft
        />
      </div>

      {/* ── Ledger Table ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {!selectedParty || ledgerData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
            <svg
              className="w-10 h-10 text-gray-200"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">
              {!selectedParty
                ? "Please select a party to view ledger."
                : "No ledger entries found."}
            </p>
          </div>
        ) : (
          <TableComponent
            columns={LEDGER_COLUMNS}
            data={ledgerData}
            paginationSize={10}
          />
        )}

        {/* ── Closing balance footer bar ── */}
        <div className="border-t border-gray-100 bg-[#005BA8] px-6 py-3.5 flex items-center justify-between">
          <span className="text-sm font-bold text-white uppercase tracking-wider">
            Closing Balance
          </span>
          <div className="flex items-center gap-12">
            <span className="text-sm font-bold text-blue-200">
              {fmtPlain(totalDebit)}
            </span>
            <span className="text-sm font-bold text-blue-200">
              {fmtPlain(totalCredit)}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">
                {fmtPlain(closingBal)}
              </span>
              <button className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white font-bold hover:bg-white/30 transition text-sm">
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLedgerSuperadmin;
