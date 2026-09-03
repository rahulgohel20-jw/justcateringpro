import { Fragment, useState, useEffect, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { Container } from "@/components/container";
import { Toolbar, ToolbarHeading } from "@/layouts/demo1/toolbar";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import DateRangePicker from "@/components/form-inputs/DatePicker/Daterangepicker";
import { TableComponent } from "@/components/table/TableComponent";
import {
  GetAllProfitandloss,
  GETALLexpense,
  saveclosedate,
} from "@/services/apiServices";
import { useCloseDateAll, useSaveCloseDate } from "@/hooks/useCloseDate"; 

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

const DONUT_COLORS = [
  "rgb(0, 90, 184)",
  "rgb(46, 137, 235)",
  "rgb(122, 170, 220)",
  "rgb(178, 209, 241)",
  "rgb(219, 228, 237)",
];
const REVENUE_COLORS = ["rgb(37, 99, 235)", "rgb(96, 165, 250)"];
const PAYMENT_MODE_COLORS = {
  BANK_TRANSFER: "bg-blue-50 text-blue-600",
  CASH: "bg-green-50 text-green-600",
  CHEQUE: "bg-purple-50 text-purple-600",
  UPI: "bg-orange-50 text-orange-600",
};

const pad = (n) => String(n).padStart(2, "0");

const dmyToDate = (str) => {
  if (!str) return new Date();
  const [d, m, y] = str.split("/");
  return new Date(Number(y), Number(m) - 1, Number(d));
};

const formatDateStr = (d) => {
  if (!d) return "";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

const formatINR = (val) => {
  if (val === null || val === undefined) return "—";
  const abs = Math.abs(val);
  let formatted;
  if (abs >= 100000) formatted = `₹${(abs / 100000).toFixed(1)}L`;
  else if (abs >= 1000) formatted = `₹${(abs / 1000).toFixed(0)}K`;
  else formatted = `₹${abs}`;
  return val < 0 ? `-${formatted}` : formatted;
};

const monthShort = [
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


const getPeriodLabelFromMap = (monthIndex, year, monthCloseDates) => {
  const key = `${year}-${monthIndex + 1}`; // 
  const entry = monthCloseDates?.[key];

  if (entry?.startDate && entry?.closeDate) {
    const start = dmyToDate(entry.startDate);
    const end = dmyToDate(entry.closeDate);
    const fmt = (d) => `${d.getDate()} ${monthShort[d.getMonth()]}`;
    return `${fmt(start)} → ${fmt(end)}`;
  }

  return ""; 
};

const detectActiveMonthFromMap = (monthCloseDates) => {
  const today = new Date();
  for (const entry of Object.values(monthCloseDates)) {
    if (!entry?.startDate || !entry?.closeDate) continue;
    const start = dmyToDate(entry.startDate);
    const end = dmyToDate(entry.closeDate);
    if (today >= start && today <= end) {
      return entry; 
    }
  }
  return null;
};

const CloseDatePanel = ({
  selectedYear,
  selectedMonth,
  savedCloseStart,
  savedCloseEnd,
  onSave,
}) => {
  const [saving, setSaving] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [localCloseEnd, setLocalCloseEnd] = useState(null);
  const [localCloseStart, setLocalCloseStart] = useState(null);

  const displayStart = localCloseStart ?? savedCloseStart ?? "dd/mm/yyyy";
  const displayEnd = localCloseEnd ?? savedCloseEnd ?? "dd/mm/yyyy";

  return (
    <div className="flex items-center gap-3 relative">
      <div
        className="bg-white rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3 border border-gray-100 cursor-pointer hover:shadow-md transition"
        onClick={() => setShowPicker((v) => !v)}
      >
        <div className="flex-1">
          <p className="text-xs text-gray-400 font-medium mb-2">
            Month Close Date
          </p>
          <div className="flex items-center gap-2">
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-xs text-gray-400 mb-0.5">Start</p>
              <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                {displayStart}
              </p>
            </div>
            <svg
              className="w-4 h-4 text-gray-300 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
            <div className="bg-gray-50 rounded-xl px-3 py-2">
              <p className="text-xs text-gray-400 mb-0.5">End</p>
              <p className="text-sm font-bold text-gray-800 whitespace-nowrap">
                {displayEnd}
              </p>
            </div>
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <svg
            className="w-4 h-4 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>

      {showPicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPicker(false);
          }}
        >
          <DateRangePicker
            startDate={savedCloseStart}
            endDate={localCloseEnd ?? savedCloseEnd}
            onCancel={() => setShowPicker(false)}
            onApply={(dmy_start, dmy_end) => {
              setShowPicker(false);
              setSaving(true);
              saveclosedate(dmy_start, dmy_end)
                .then((res) => {
                  if (res?.data?.success) {
                    setLocalCloseStart(dmy_start);
                    setLocalCloseEnd(dmy_end);
                    Swal.fire({
                      title: "Updated!",
                      text: `Range: ${dmy_start} → ${dmy_end}`,
                      icon: "success",
                      timer: 2000,
                      showConfirmButton: false,
                      customClass: { popup: "!rounded-2xl" },
                    });
                    onSave?.(dmy_start, dmy_end);
                  }
                })
                .catch(() => {
                  Swal.fire({
                    title: "Failed!",
                    text: "Could not update close date.",
                    icon: "error",
                    confirmButtonColor: "#1d4ed8",
                    customClass: {
                      popup: "!rounded-2xl",
                      confirmButton: "!rounded-xl",
                    },
                  });
                })
                .finally(() => setSaving(false));
            }}
          />
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, iconBg, valueClass }) => (
  <div className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 w-full min-w-0">
    <div className="flex flex-col gap-1 min-w-0 pr-2">
      <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
        {title}
      </p>
      <h2
        className={`text-xl sm:text-2xl font-bold ${valueClass || "text-gray-900"}`}
      >
        {value ?? "—"}
      </h2>
    </div>
    <div
      className={`w-10 h-10 sm:w-10 sm:h-10 flex items-center justify-center rounded-full shadow-sm flex-shrink-0 ${iconBg}`}
    >
      {icon}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-gray-800">{name}</p>
      <p className="text-gray-500">₹{value.toLocaleString("en-IN")}</p>
    </div>
  );
};

const ExpenseBreakdownChart = ({ expenseData, loading }) => {
  const items = [
    { name: "Trip", value: expenseData?.totalTripExpense ?? 0 },
    { name: "Employee", value: expenseData?.totalEmployeeExpense ?? 0 },
    { name: "Office", value: expenseData?.totalOfficeExpense ?? 0 },
    { name: "Server", value: expenseData?.totalServerExpense ?? 0 },
    { name: "Other", value: expenseData?.totalOtherExpense ?? 0 },
  ].filter((i) => i.value > 0);

  const total = items.reduce((s, i) => s + i.value, 0);

  const CenterLabel = ({ viewBox }) => {
    if (!viewBox) return null;
    const { cx, cy } = viewBox;
    return (
      <g>
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize={10}
        >
          TOTAL
        </text>
        <text
          x={cx}
          y={cy + 12}
          textAnchor="middle"
          fill="#111827"
          fontSize={17}
          fontWeight="500"
        >
          {formatINR(total)}
        </text>
      </g>
    );
  };

  return (
    <div className="bg-white flex-1 rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm font-semibold text-gray-800 mb-4">
<FormattedMessage
  id="COMMON.EXPENSE_BREAKDOWN"
  defaultMessage="Expense Breakdown"
/>
      </p>
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-10">
          No expense data for this period
        </p>
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-[180px] h-[180px] flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={items}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  strokeWidth={0}
                >
                  {items.map((_, i) => (
                    <Cell
                      key={i}
                      fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                    />
                  ))}
                  <CenterLabel />
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2.5 flex-1 w-full">
            {items.map((item, i) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-800">
                  ₹{item.value.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


const RevenueBreakdownChart = ({ dashboardData, loading }) => {
  const items = [
    { name: "Total Revenue", value: dashboardData?.totalRevenue ?? 0 },
    { name: "Total Expenses", value: dashboardData?.totalExpence ?? 0 },
  ].filter((i) => i.value > 0);

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="bg-white flex-1 rounded-2xl shadow-sm border border-gray-100 p-5">
      <p className="text-sm font-semibold text-gray-800 mb-4">
<FormattedMessage
  id="COMMON.REVENUE_VS_EXPENSES"
  defaultMessage="Revenue vs Expenses"
/>      </p>
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {items.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-10">
                No data for this period
              </p>
            ) : (
              items.map((item, i) => (
                <div key={item.name}>
                  <p className="text-xs text-gray-500 mb-1.5">{item.name}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-100 rounded-md h-7 overflow-hidden">
                      <div
                        className="h-full rounded-md transition-all duration-500"
                        style={{
                          width: `${(item.value / max) * 100}%`,
                          background: REVENUE_COLORS[i % REVENUE_COLORS.length],
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-800 w-24 text-right shrink-0">
                      ₹{item.value.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {items.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-5 pt-4 border-t border-gray-100">
              {items.map((item, i) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{
                      background: REVENUE_COLORS[i % REVENUE_COLORS.length],
                    }}
                  />
                  <span className="text-xs text-gray-500">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};


const paymentColumns = [
  {
    header: <FormattedMessage id="COMMON.CLIENT_NAME" defaultMessage="Client Name" />,
    accessorKey: "clientName",
    cell: ({ row }) => (
      <span className="text-gray-700 whitespace-nowrap">
        {row.original.clientName}
      </span>
    ),
  },
  {
    header: <FormattedMessage id="COMMON.INVOICE_CODE" defaultMessage="Invoice Code" />,
    accessorKey: "invoiceCode",
    cell: ({ row }) => (
      <span className="text-gray-500 whitespace-nowrap font-mono">
        {row.original.invoiceCode}
      </span>
    ),
  },
  {
    header: <FormattedMessage id="COMMON.AMOUNT" defaultMessage="Amount" />,
    accessorKey: "amount",
    cell: ({ row }) => (
      <span className="text-gray-700 whitespace-nowrap font-medium">
        ₹{row.original.amount?.toLocaleString("en-IN")}
      </span>
    ),
  },
  {
    header: <FormattedMessage id="COMMON.DATE" defaultMessage="Date" />,
    accessorKey: "date",
    cell: ({ row }) => (
      <span className="text-gray-500 whitespace-nowrap">
        {row.original.date}
      </span>
    ),
  },
  {
    header: <FormattedMessage id="COMMON.PAYMENT_MODE" defaultMessage="Payment Mode" />,
    accessorKey: "paymentMode",
    cell: ({ row }) => (
      <span
        className={`px-2 py-0.5 rounded-full font-medium text-[10px] ${PAYMENT_MODE_COLORS[row.original.paymentMode] ?? "bg-gray-50 text-gray-600"}`}
      >
        {row.original.paymentMode?.replace("_", " ")}
      </span>
    ),
  },
];

const PaymentsTable = ({ payments = [] }) => {
  const [search, setSearch] = useState("");

  const filtered = payments.filter(
    (p) =>
      p.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceCode?.toLowerCase().includes(search.toLowerCase()) ||
      p.paymentMode?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleExport = () => {
    const csv = [
      ["Client Name", "Invoice Code", "Amount", "Date", "Payment Mode"],
      ...filtered.map((p) => [
        p.clientName,
        p.invoiceCode,
        p.amount,
        p.date,
        p.paymentMode,
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments.csv";
    a.click();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
        <p className="text-sm font-semibold text-gray-800">
 <FormattedMessage
    id="COMMON.PAYMENT_TRANSACTIONS"
    defaultMessage="Payment Transactions"
  />        </p>
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white focus:outline-none flex-1 sm:flex-none"
          />
          {/* <button
            onClick={handleExport}
            className="text-xs bg-blue-50 text-blue-600 font-medium px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap"
          >
            Export CSV
          </button> */}
        </div>
      </div>
      <div className="overflow-x-auto">
        <TableComponent
          columns={paymentColumns}
          data={filtered}
          paginationSize={25}
        />
      </div>
    </div>
  );
};


const icons = {
  revenue: (
    <svg
      className="w-5 h-5 text-blue-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8c-2.21 0-4 .79-4 2s1.79 2 4 2 4 .79 4 2-1.79 2-4 2m0-8V6m0 12v-2m8-6a8 8 0 11-16 0 8 8 0 0116 0z"
      />
    </svg>
  ),
  expense: (
    <svg
      className="w-5 h-5 text-red-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 9l-5 5-5-5m10 6H7"
      />
    </svg>
  ),
  profit: (
    <svg
      className="w-5 h-5 text-green-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3 17l6-6 4 4 8-8M14 7h7v7"
      />
    </svg>
  ),
  loss: (
    <svg
      className="w-5 h-5 text-red-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 7l6 6 4-4 8 8M14 17h7v-7"
      />
    </svg>
  ),
};

const ProfitnLoss = () => {
  const now = new Date();


  const [userId, setUserId] = useState(null);
  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setUserId(Number(id));
  }, []);

  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth()); 
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [yearRangeStart, setYearRangeStart] = useState(
    Math.floor(now.getFullYear() / 12) * 12,
  );
  const [savedCloseStart, setSavedCloseStart] = useState(null);
  const [savedCloseEnd, setSavedCloseEnd] = useState(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [payments, setPayments] = useState([]);
  const [plLoading, setPlLoading] = useState(false);
  const [expenseData, setExpenseData] = useState(null);
  const [expLoading, setExpLoading] = useState(false);

  const {
    monthCloseDates,
    isLoading: closeDatesLoading,
    refetch: refetchCloseDates,
  } = useCloseDateAll(selectedYear, userId);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (
      closeDatesLoading ||
      !monthCloseDates ||
      Object.keys(monthCloseDates).length === 0
    )
      return;
    if (initializedRef.current) return;

    const active = detectActiveMonthFromMap(monthCloseDates);
    if (active) {
      setSelectedMonth(active.month - 1);
      setSavedCloseStart(active.startDate);
      setSavedCloseEnd(active.closeDate);
      fetchPL(active.startDate, active.closeDate);
      fetchExp(active.startDate, active.closeDate);
    }

    initializedRef.current = true;
  }, [monthCloseDates, closeDatesLoading]);

  useEffect(() => {
    if (!initializedRef.current) return;
    if (selectedMonth === null) return;
    if (!monthCloseDates) return;

    const key = `${selectedYear}-${selectedMonth + 1}`;
    const entry = monthCloseDates[key];
    if (!entry?.startDate || !entry?.closeDate) return;

    setSavedCloseStart(entry.startDate);
    setSavedCloseEnd(entry.closeDate);
    fetchPL(entry.startDate, entry.closeDate);
    fetchExp(entry.startDate, entry.closeDate);
  }, [selectedMonth, monthCloseDates, selectedYear]);

  useEffect(() => {
    if (!initializedRef.current) return;
    refetchCloseDates();
  }, [selectedYear]);

  const fetchPL = (startDate, endDate, uid = userId) => {
    if (!uid) return;
    setPlLoading(true);
    GetAllProfitandloss({ startDate, endDate, userId: uid })
      .then((res) => {
        if (res?.data?.success) {
          setDashboardData(res.data.data);
          setPayments(res.data.data.payments ?? []);
        }
      })
      .catch((err) => console.error("P&L fetch error:", err))
      .finally(() => setPlLoading(false));
  };
  const fetchExp = (startDate, endDate) => {
    if (!userId) return;
    setExpLoading(true);
    GETALLexpense(endDate, startDate, userId,-1)
      .then((res) => {
        if (res?.data?.success) setExpenseData(res.data.data);
      })
      .catch((err) => console.error("Expense fetch error:", err))
      .finally(() => setExpLoading(false));
  };

  const handleViewAll = () => {
    setSelectedMonth(null);
    const start = `01/01/${selectedYear}`;
    const end = `31/12/${selectedYear}`;
    setSavedCloseStart(start);
    setSavedCloseEnd(end);
    fetchPL(start, end);
    fetchExp(start, end);
  };

  const handleCloseDateSave = (start, end) => {
    setSavedCloseStart(start);
    setSavedCloseEnd(end);
    refetchCloseDates(); 
    fetchPL(start, end);
    fetchExp(start, end);
  };


  const topStats = [
    {
      title: "Total Revenue",
      value:
        dashboardData?.totalRevenue != null
          ? `₹${dashboardData.totalRevenue.toLocaleString("en-IN")}`
          : "0",
      icon: icons.revenue,
      iconBg: "bg-blue-50",
    },
    {
      title: "Total Expenses",
      value:
        dashboardData?.totalExpence != null
          ? `₹${dashboardData.totalExpence.toLocaleString("en-IN")}`
          : "0",
      icon: icons.expense,
      iconBg: "bg-red-50",
    },
    {
      title: "Net Profit",
      value:
        dashboardData?.netProfit != null
          ? dashboardData.netProfit < 0
            ? `-₹${Math.abs(dashboardData.netProfit).toLocaleString("en-IN")}`
            : `₹${dashboardData.netProfit.toLocaleString("en-IN")}`
          : "0",
      valueClass:
        dashboardData?.netProfit < 0 ? "text-red-600" : "text-green-600",
      icon: dashboardData?.netProfit < 0 ? icons.loss : icons.profit,
      iconBg: dashboardData?.netProfit < 0 ? "bg-red-50" : "bg-green-50",
    },
    {
      title: "Profit Margin",
      value:
        dashboardData?.profitMargin != null
          ? `${dashboardData.profitMargin.toFixed(2)}%`
          : "0",
      icon: icons.loss,
      iconBg: "bg-red-50",
    },
  ];

  return (
    <Fragment>
      <Container>
        {/* ── Top bar ── */}
        <div className="flex items-start justify-between gap-3 pt-4 pb-2 flex-nowrap">
          <div className="flex flex-col gap-1">
            <Toolbar>
              <ToolbarHeading
  title={
    <FormattedMessage
      id="COMMON.PROFIT_AND_LOSS"
      defaultMessage="Profit and Loss"
    />
  }
/>
            </Toolbar>
          </div>
          <CloseDatePanel
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            savedCloseStart={savedCloseStart}
            savedCloseEnd={savedCloseEnd}
            onSave={handleCloseDateSave}
          />
        </div>

        {/* ── Year + Month grid ── */}
        <div className="grid grid-cols-7 gap-3 mt-3 mb-4">
          {/* Year picker */}
          <div className="relative">
            <button
              onClick={() => setShowYearPicker((v) => !v)}
              className="px-2 py-1 rounded-lg bg-primary text-white font-medium min-h-[55px] min-w-[150px] text-sm"
            >
              {selectedYear}
            </button>
            {showYearPicker && (
              <div className="absolute top-11 left-0 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-[260px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <button
                    onClick={() => setYearRangeStart((p) => p - 12)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
                  >
                    ‹
                  </button>
                  <span className="text-sm font-semibold text-gray-700">
                    {yearRangeStart} – {yearRangeStart + 11}
                  </span>
                  <button
                    onClick={() => setYearRangeStart((p) => p + 12)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
                  >
                    ›
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map(
                    (year) => (
                      <button
                        key={year}
                        onClick={() => {
                          setSelectedYear(year);
                          setShowYearPicker(false);
                        }}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${selectedYear === year ? "bg-gray-800 text-white" : "hover:bg-gray-100 text-gray-700"}`}
                      >
                        {year}
                      </button>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Jan – Jun */}
          {MONTH_NAMES.slice(0, 6).map((month, index) => {
            const isSelected = selectedMonth === index;
            // ✅ Reads directly from the hook's map — no closeDayOfMonth needed
            const periodLabel = getPeriodLabelFromMap(
              index,
              selectedYear,
              monthCloseDates,
            );
            return (
              <button
                key={index}
                onClick={() => setSelectedMonth(index)}
                className={`relative flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-gray-50 text-black border-gray-200 hover:border-primary hover:text-primary"
                }`}
              >
                <span className="font-semibold">{month}</span>
                <span
                  className={`text-[10px] mt-0.5 ${isSelected ? "text-blue-100" : "text-black"}`}
                >
                  {closeDatesLoading ? "..." : periodLabel}
                </span>
              </button>
            );
          })}

          {/* All button */}
          <button
            onClick={handleViewAll}
            className={`flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all w-full h-full ${
              selectedMonth === null
                ? "bg-primary text-white border-primary"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:border-primary hover:text-primary"
            }`}
          >
            <span className="font-semibold">All</span>
            <span
              className={`text-[10px] mt-0.5 ${selectedMonth === null ? "text-blue-100" : "text-black"}`}
            >
              Jan → Dec
            </span>
          </button>

          {/* Jul – Dec */}
          {MONTH_NAMES.slice(6, 12).map((month, index) => {
            const realIndex = index + 6;
            const isSelected = selectedMonth === realIndex;
            // ✅ Reads directly from the hook's map
            const periodLabel = getPeriodLabelFromMap(
              realIndex,
              selectedYear,
              monthCloseDates,
            );
            return (
              <button
                key={realIndex}
                onClick={() => setSelectedMonth(realIndex)}
                className={`relative flex flex-col items-start px-3 py-2 rounded-xl text-sm border transition-all ${
                  isSelected
                    ? "bg-primary text-white border-primary"
                    : "bg-gray-50 text-black border-gray-200 hover:border-primary hover:text-primary"
                }`}
              >
                <span className="font-semibold">{month}</span>
                <span
                  className={`text-[10px] mt-0.5 ${isSelected ? "text-blue-100" : "text-black"}`}
                >
                  {closeDatesLoading ? "..." : periodLabel}
                </span>
              </button>
            );
          })}
        </div>
      </Container>

      <Container>
        <div className="flex flex-col gap-4 lg:gap-6 w-full max-w-full overflow-x-hidden mt-2">
          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {plLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm animate-pulse h-24"
                  />
                ))
              : topStats.map((s) => <StatCard key={s.title} {...s} />)}
          </div>

          {/* ── Charts ── */}
          <div className="flex flex-col lg:flex-row gap-4">
            <ExpenseBreakdownChart
              expenseData={expenseData}
              loading={expLoading}
            />
            <RevenueBreakdownChart
              dashboardData={dashboardData}
              loading={plLoading}
            />
          </div>

          {/* ── Payments Table ── */}
          <PaymentsTable payments={payments} />
        </div>
      </Container>
    </Fragment>
  );
};

export default ProfitnLoss;
