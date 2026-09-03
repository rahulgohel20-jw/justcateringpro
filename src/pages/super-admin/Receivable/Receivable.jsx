import { useState, useEffect } from "react";
import { TableComponent } from "@/components/table/TableComponent";
import { receivableColumns } from "./constant";
import { getreceivablepayable } from "@/services/apiServices";

const fmt = (n) =>
  "₹" +
  Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const StatusBadge = ({ status }) => {
  const map = {
    PAID: "bg-green-100 text-green-700",
    PARTIAL: "bg-orange-100 text-orange-700",
    PENDING: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status?.toUpperCase()] ?? "bg-gray-100 text-gray-600"}`}
    >
      {status}
    </span>
  );
};

const MetricCard = ({ label, value, iconBg, icon }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-black tracking-widest uppercase">
        {label}
      </span>
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}
      >
        {icon}
      </div>
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

const BarChart = ({ data }) => {
  const bars = data.slice(0, 3).map((item) => ({
    label: item.month?.slice(0, 3) || "—",
    invoiced: item.totalAmount || 0,
    collected: item.paidAmount || 0,
  }));

  const max = Math.max(...bars.flatMap((b) => [b.invoiced, b.collected]), 1);

  // return (
  //   // <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
  //   //   <div className="flex items-center justify-between mb-4">
  //   //     <h3 className="text-sm font-semibold text-gray-700">
  //   //       Receivables Cash Flow
  //   //     </h3>
  //   //     <div className="flex items-center gap-4 text-xs text-gray-500">
  //   //       <span className="flex items-center gap-1.5">
  //   //         <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />{" "}
  //   //         Invoiced
  //   //       </span>
  //   //       <span className="flex items-center gap-1.5">
  //   //         <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block" />{" "}
  //   //         Collected
  //   //       </span>
  //   //     </div>
  //   //   </div>
  //   //   <div className="flex items-end justify-around gap-4 h-36 px-2">
  //   //     {bars.map((b) => (
  //   //       <div
  //   //         key={b.label}
  //   //         className="flex flex-col items-center gap-1 flex-1"
  //   //       >
  //   //         <div
  //   //           className="flex items-end gap-1.5 w-full justify-center"
  //   //           style={{ height: 112 }}
  //   //         >
  //   //           <div
  //   //             className="bg-blue-500 rounded-t-md w-7 transition-all"
  //   //             style={{ height: `${(b.invoiced / max) * 100}%` }}
  //   //           />
  //   //           <div
  //   //             className="bg-green-500 rounded-t-md w-7 transition-all"
  //   //             style={{ height: `${(b.collected / max) * 100}%` }}
  //   //           />
  //   //         </div>
  //   //         <span className="text-xs text-gray-400">{b.label}</span>
  //   //       </div>
  //   //     ))}
  //   //   </div>
  //   // </div>
  // );
};

const Receivable = () => {
  const [activeTab, setActiveTab] = useState("receivable");
  const [openYear, setOpenYear] = useState(false);
  const [year, setYear] = useState("All Year");
  const YEARS = ["All Year", "2026", "2025", "2024", "2023"];

  const [tableData, setTableData] = useState([]); // months array
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalInvoiceCount: 0,
    totalInvoiceAmount: 0,
    totalPaidInvoiceCount: 0,
    totalPaidInvoiceAmount: 0,
    totalPendingInvoiceCount: 0,
    totalPendingAmount: 0,
  });

  const userId = localStorage.getItem("userId");

  const fetchData = async () => {
    setLoading(true);
    try {
      const entryType = activeTab === "receivable" ? "RECEIPT" : "PAYMENT";

      const res = await getreceivablepayable(userId, "", "", entryType);

     

      // ── new response shape ──────────────────────────────────────────
      // res.data.data = { Payment: { totalAmount, paidAmount, unpaidAmount, months: [...] } }
      //              or { Receipt: { ... } }
      const payload = res?.data?.data ?? {};
      // key is "Payment" or "Receipt" depending on entryType
      const key = Object.keys(payload)[0]; // "Payment" | "Receipt"
      const block = payload[key] ?? {};

      const months = Array.isArray(block.months) ? block.months : [];
      setTableData(months);

      setSummary({
        totalInvoiceCount: block.totalInvoiceCount ?? 0,
        totalInvoiceAmount: block.totalInvoiceAmount ?? 0,
        totalPaidInvoiceCount: block.totalPaidInvoiceCount ?? 0,
        totalPaidInvoiceAmount: block.totalPaidInvoiceAmount ?? 0,
        totalPendingInvoiceCount: block.totalPendingInvoiceCount ?? 0,
        totalPendingAmount: block.totalPendingAmount ?? 0,
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const isReceivable = activeTab === "receivable";

  return (
    <div className="min-h-screen p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-bold text-gray-900">
          {isReceivable ? "Receivable Overview" : "Payable Overview"}
        </h1>
      </div>

      {/* Metric Cards */}
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          label="Total Invoice Count"
          value={summary.totalInvoiceCount}
          iconBg="bg-blue-50"
          icon={
            <svg
              className="w-5 h-5 text-blue-500"
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
          }
        />
        <MetricCard
          label="Total Invoice Amount"
          value={fmt(summary.totalInvoiceAmount)}
          iconBg="bg-blue-50"
          icon={
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
          }
        />
        <MetricCard
          label={isReceivable ? "Total Paid Invoice Count" : "Total Paid Count"}
          value={summary.totalPaidInvoiceCount}
          iconBg="bg-green-50"
          icon={
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <MetricCard
          label={isReceivable ? "Total Received Amount" : "Total Paid Amount"}
          value={fmt(summary.totalPaidInvoiceAmount)}
          iconBg="bg-green-50"
          icon={
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <MetricCard
          label="Total Pending Invoice Count"
          value={summary.totalPendingInvoiceCount}
          iconBg="bg-orange-50"
          icon={
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <MetricCard
          label="Total Pending Amount"
          value={fmt(summary.totalPendingAmount)}
          iconBg="bg-orange-50"
          icon={
            <svg
              className="w-5 h-5 text-orange-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setOpenYear(!openYear)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-600 hover:border-blue-300 transition-all"
          >
            {year}
          </button>
          {openYear && (
            <div className="absolute mt-2 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
              {YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => {
                    setYear(y);
                    setOpenYear(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-gray-50"
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table — columns should map to: month, totalAmount, paidAmount, pendingAmount, status */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            Loading...
          </div>
        ) : (
          <TableComponent
            columns={receivableColumns}
            data={tableData}
            paginationSize={10}
          />
        )}
      </div>

      {/* Chart */}
      <div className="grid">
        <BarChart data={tableData} />
      </div>
    </div>
  );
};

export default Receivable;
