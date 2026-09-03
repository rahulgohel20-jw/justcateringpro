import { useState, useEffect } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { bankPaymentColumns } from "./constant";
import {
  GETallbytypereciptpayment,
  GetbankdetailsbyuserId,
  Getbyidreciptpayment,
  DeleteReciptPayment,
} from "@/services/apiServices";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import AddPayable from "../../../partials/modals/add-cash-account/AddPayable";
import { useCloseDateAll } from "@/hooks/useCloseDate";
import { usePermission } from "../../../hooks/usePermission";

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

const BANK_MODES = [
  { key: "", label: "All" },
  { key: "BANK_TRANSFER", label: "Bank Transfer" },
  { key: "UPI", label: "UPI" },
  { key: "CHEQUE", label: "Cheque" },
];

const SuperBankPayment = () => {
  const permissions = usePermission("Bankpayment");
  const userId = JSON.parse(localStorage.getItem("userId"));

  const [subTab, setSubTab] = useState("all");
  const [bankSubTabs, setBankSubTabs] = useState([]);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());
  const [autoMonthSet, setAutoMonthSet] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState(
    Math.floor(new Date().getFullYear() / 12) * 12,
  );
  const [paymentMode, setPaymentMode] = useState("");
  const [modalState, setModalState] = useState({
    open: false,
    mode: "add",
    data: null,
  });
  const [tableData, setTableData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);

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
  }, [monthCloseDates, closeDateLoading]);

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
  }, []);

  const fetchPayments = async () => {
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
        entryType: "PAYMENT",
        paymentMode,
        startDate,
        userId,
        voucherNo: "",
      });

      setTableData(res?.data?.data || []);
    } catch (err) {
      console.error("❌ Fetch payments error →", err);
      setTableData([]);
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (subTab && !closeDateLoading && bankSubTabs.length > 0) fetchPayments();
  }, [
    subTab,
    month,
    year,
    closeDateLoading,
    monthCloseDates,
    bankSubTabs,
    paymentMode,
  ]);

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
    try {
      const res = await Getbyidreciptpayment(rowData.id);
      setModalState({ open: true, mode, data: res?.data?.data || rowData });
    } catch {
      setModalState({ open: true, mode, data: rowData });
    }
  };

  const closeModal = () =>
    setModalState({ open: false, mode: "add", data: null });
  const handleModalSuccess = () => {
    closeModal();
    fetchPayments();
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
            ? "bg-primary text-white border-primary shadow-md"
            : "bg-white text-gray-800 border-gray-200 hover:border-primary hover:shadow-sm"
        }`}
      >
        {isActive && (
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-green-400" />
        )}
        <span className="font-bold text-sm">{m}</span>
        <span
          className={`text-[11px] mt-1 ${isSelected ? "text-blue-100" : "text-gray-500"}`}
        >
          {getMonthDisplay(index, year)}
        </span>
      </button>
    );
  };

  return (
    <Container>
      <div className="">
        {/* ── Mobile: dropdowns ── */}
        <div className="flex flex-wrap items-center gap-3 md:hidden mb-4">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 bg-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          >
            {Array.from(
              { length: 10 },
              (_, i) => new Date().getFullYear() - 5 + i,
            ).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-800 bg-white cursor-pointer outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>
          <span className="text-xs text-gray-500">
            {getMonthDisplay(month, year)}
          </span>
        </div>

        {/* ── Desktop: Year + Month grid ── */}
        <div className="hidden md:grid grid-cols-7 gap-3 mb-4">
          {/* Year picker */}
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
                      (_, i) => yearRangeStart + i,
                    ).map((y) => (
                      <button
                        key={y}
                        onClick={() => {
                          setYear(y);
                          setShowYearPicker(false);
                        }}
                        className={`py-2 rounded-xl text-sm font-semibold border-0 cursor-pointer transition ${y === year ? "bg-primary text-white" : "bg-gray-50 text-gray-700 hover:bg-gray-100"}`}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Jan–Jun */}
          {MONTHS.slice(0, 6).map((m, i) => (
            <MonthButton key={m} m={m} index={i} />
          ))}

          <div />

          {/* Jul–Dec */}
          {MONTHS.slice(6, 12).map((m, i) => (
            <MonthButton key={m} m={m} index={i + 6} />
          ))}
        </div>

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bank Payments</h2>
            <p className="text-sm text-black mt-0.5 mb-2">
              Manage and audit bank capital outflows
            </p>
          </div>
          {permissions.add && (
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
              New Bank Payment
            </button>
          )}
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Sub-tabs + Search */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
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
                placeholder="Search payments..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 w-52 transition"
              />
            </div>
          </div>

          {/* Payment Mode Filter */}
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-gray-100">
            <span className="text-xs text-gray-400 font-medium mr-1">
              Mode:
            </span>
            {BANK_MODES.map((m) => (
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
            columns={bankPaymentColumns(handleAction, permissions)}
            data={filteredData}
            loading={tableLoading || closeDateLoading}
            paginationSize={10}
          />
        </div>
      </div>

      <AddPayable
        open={modalState.open}
        onClose={closeModal}
        mode={modalState.mode}
        initialData={modalState.data}
        type="bank"
        userId={userId}
        onSuccess={handleModalSuccess}
      />
    </Container>
  );
};

export default SuperBankPayment;
