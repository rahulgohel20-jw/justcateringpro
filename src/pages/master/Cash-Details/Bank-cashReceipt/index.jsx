import { useState, useEffect } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { cashReceiptColumns, bankReceiptColumns } from "./constant";
import Swal from "sweetalert2";
import {
  GETallbytypereciptpayment,
  GetbankdetailsbyuserId,
  CashAccountGetAll,
  Getbyidreciptpayment,
  DeleteReciptPayment,
} from "@/services/apiServices";
import dayjs from "dayjs";
import ReceiptModal from "../../../../partials/modals/add-cash-account/ReceiptModal";
import useCloseDate from "@/hooks/useCloseDate";

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

const ReceiptManagement = () => {
  const [tab, setTab] = useState("cash");
  const [paymentMode, setPaymentMode] = useState("");
  const [subTab, setSubTab] = useState("all");
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState(
    Math.floor(new Date().getFullYear() / 12) * 12,
  );
  const [modalState, setModalState] = useState({
    open: false,
    mode: "add",
    data: null,
  });
  const [cashSubTabs, setCashSubTabs] = useState([]);
  const [bankSubTabs, setBankSubTabs] = useState([]);
  const subTabs = tab === "cash" ? cashSubTabs : bankSubTabs;

  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const userId = JSON.parse(localStorage.getItem("userId"));

  const { monthCloseDates, isLoading: closeDateLoading } = useCloseDate(
    month,
    year,
  );

  const formatCloseDate = (dateStr) => {
    if (!dateStr) return "";
    return dayjs(dateStr, "DD/MM/YYYY").format("D MMM");
  };

  const activeDateEntry = monthCloseDates[`${year}-${month + 1}`] ?? null;

  useEffect(() => {
    const loadSubTabs = async () => {
      try {
        if (tab === "cash") {
          const res = await CashAccountGetAll(1);
          const accounts = res?.data?.data || [];

          setCashSubTabs([
            { key: "all", label: "All", id: -1 },
            ...accounts.map((c) => ({
              key: String(c.id),
              label: c.accountName || c.cashTypeName || c.name,
              id: c.id,
            })),
          ]);

          setSubTab("all");
        } else {
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
        }
      } catch (err) {
        console.error("❌ SubTabs load error →", err);
      }
    };

    loadSubTabs();
  }, [tab]);

  const fetchReceipts = async () => {
    const startDate = activeDateEntry?.startDate
      ? activeDateEntry.startDate
      : dayjs(new Date(year, month, 1)).format("DD/MM");

    const endDate = activeDateEntry?.closeDate
      ? activeDateEntry.closeDate
      : dayjs(new Date(year, month + 1, 0)).format("DD/MM");

    try {
      setTableLoading(true);

      const selectedTab = subTabs.find((s) => s.key === subTab);

      // ✅ If subTabs not loaded yet or "all" selected, use -1
      const selectedId =
        !selectedTab || selectedTab?.id === -1 ? -1 : selectedTab?.id || "";

      const res = await GETallbytypereciptpayment({
        accountType: tab === "cash" ? "CASH" : "BANK",
        bankAccountId: tab === "bank" ? selectedId : "",
        cashTypeId: tab === "cash" ? selectedId : "",
        endDate,
        entryType: "RECEIPT",
        paymentMode: tab === "cash" ? "CASH" : paymentMode,
        startDate,
        userId: userId,
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
  };

  useEffect(() => {
    if (subTab && !closeDateLoading && subTabs.length > 0) fetchReceipts();
  }, [
    tab,
    subTab,
    month,
    year,
    closeDateLoading,
    activeDateEntry,
    subTabs,
    paymentMode,
  ]);

  const handleAction = async (rowData, mode) => {
    if (mode === "delete") {
      Swal.fire({
        title: "Are you sure?",
        text: `Delete receipt ${rowData.voucherNo || ""}? This cannot be undone.`,
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
    } catch (err) {
      console.error("❌ Fetch by ID error →", err);
      setModalState({ open: true, mode, data: rowData });
    }
  };

  const closeModal = () =>
    setModalState({ open: false, mode: "add", data: null });

  const handleModalSuccess = () => {
    closeModal();
    fetchReceipts();
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
            // ✅ Show close date range on month button if available
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
            // ✅ Show close date range on month button if available
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
            <h2 className="text-2xl font-bold text-gray-900">Receipts</h2>
            <p className="text-sm text-black mt-0.5">
              Manage and audit institutional capital inflows
            </p>
          </div>
          <button
            onClick={() =>
              setModalState({ open: true, mode: "add", data: null })
            }
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
            New Receipt
          </button>
        </div>

        {/* ── Filters + Tabs ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-1">
              {[
                { key: "cash", label: "Cash Receipts", icon: "ki-dollar" },
                { key: "bank", label: "Bank Receipts", icon: "ki-bank" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => {
                    setTab(t.key);
                    setSubTab("all");
                    setPaymentMode("");
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    tab === t.key
                      ? "bg-primary text-white shadow-sm"
                      : "text-black hover:bg-gray-100"
                  }`}
                >
                  <i className={`ki-filled ${t.icon} text-base`}></i>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative">
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
                placeholder="Search receipts..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 w-52 transition"
              />
            </div>
          </div>

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
          {/* ── Payment Mode Filter ── */}
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

          <TableComponent
            columns={
              tab === "cash"
                ? cashReceiptColumns(handleAction)
                : bankReceiptColumns(handleAction)
            }
            data={tableData}
            loading={tableLoading || closeDateLoading} // ✅ show loading while close dates fetch too
          />
        </div>
      </div>

      <ReceiptModal
        open={modalState.open}
        onClose={closeModal}
        mode={modalState.mode}
        initialData={modalState.data}
        type={tab}
        userId={userId}
        onSuccess={handleModalSuccess}
      />
    </Container>
  );
};

export default ReceiptManagement;
