import { Fragment, useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { Container } from "@/components/container";
import { useLanguage } from "@/i18n";
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from "@/layouts/demo1/toolbar";
import { Popover, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { TableComponent } from "@/components/table/TableComponent";
import {
  getAllByRoleIdData,
  SuperAdminDashboardTotalUserAndPlan,
  GetAllPlans,
  SuperAdmingetChartData,
} from "../../services/apiServices";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { clientColumns } from "./constant";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  iconBg,
  positive,
}) => (
  <div className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 w-full min-w-0">
    <div className="flex flex-col gap-1 min-w-0 pr-2">
      <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
        {title}
      </p>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
        {value ?? "—"}
      </h2>
      {change !== undefined && (
        <span
          className={`text-xs font-medium flex items-center flex-wrap gap-1 ${positive ? "text-green-500" : "text-red-400"}`}
        >
          <span>
            {positive ? "▲" : "▼"} {Math.abs(change)}%
          </span>
          <span className="text-gray-400 font-normal hidden sm:inline">
            {changeLabel}
          </span>
        </span>
      )}
    </div>
    <div
      className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full shadow-sm flex-shrink-0 ${iconBg}`}
    >
      {icon}
    </div>
  </div>
);

// ─── Plan Chart ───────────────────────────────────────────────────────────────
const PlanChart = () => {
  const [view, setView] = useState("yearly");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartLoading, setChartLoading] = useState(false);

  const monthNames = [
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
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  // Fetch plans for dropdown
  useEffect(() => {
    GetAllPlans()
      .then((res) => {
        if (res?.data?.success) {
          const raw = res.data.data["Plan Details"];
          const planList = Array.isArray(raw) ? raw : [];
          setPlans(planList);
          // Auto-select first plan
          if (planList.length > 0) {
            setSelectedPlan(planList[0].id);
          }
        }
      })
      .catch(console.error);
  }, []);
  // Fetch chart data whenever view/month/year/plan changes
  useEffect(() => {
    if (!selectedPlan) return; // wait until first plan is loaded

    const fetchChartData = async () => {
      try {
        setChartLoading(true);

        let startDate, endDate;

        if (view === "monthly") {
          const firstDay = 1;
          const lastDay = daysInMonth[currentMonth];
          const month = currentMonth + 1;
          startDate = `${firstDay}/${month}/${currentYear}`;
          endDate = `${lastDay}/${month}/${currentYear}`;
        } else {
          startDate = `1/1/${currentYear}`;
          endDate = `31/12/${currentYear}`;
        }

        const res = await SuperAdmingetChartData(
          startDate,
          endDate,
          selectedPlan,
        ); // ← planId passed

        if (res?.data?.success) {
          const raw = res.data.data;

          if (view === "monthly") {
            const mapped = Array.isArray(raw)
              ? raw.map((item) => ({
                  label: item.date.split("/")[0],
                  value: item.totalCount ?? 0,
                }))
              : [];
            setChartData(mapped);
          } else {
            const monthLabels = [
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
            const monthTotals = Array(12).fill(0);
            if (Array.isArray(raw)) {
              raw.forEach((item) => {
                const monthIndex = parseInt(item.date.split("/")[1], 10) - 1;
                if (monthIndex >= 0 && monthIndex < 12) {
                  monthTotals[monthIndex] += item.totalCount ?? 0;
                }
              });
            }
            const mapped = monthLabels.map((label, i) => ({
              label,
              value: monthTotals[i],
            }));
            setChartData(mapped);
          }
        } else {
          setChartData([]);
        }
      } catch (err) {
        console.error("Chart fetch error:", err);
        setChartData([]);
      } finally {
        setChartLoading(false);
      }
    };

    fetchChartData();
  }, [view, currentMonth, currentYear, selectedPlan]);
  const planOptions = Array.isArray(plans) ? plans : [];
  const barSize = view === "yearly" ? 28 : 6;
  const monthlyXTicks = [
    "1",
    "5",
    "10",
    "15",
    "20",
    "25",
    String(daysInMonth[currentMonth]),
  ];

  // Dynamic Y axis domain based on real data
  const maxValue =
    chartData.length > 0 ? Math.max(...chartData.map((d) => d.value), 5) : 20;
  const yDomain = [0, Math.ceil(maxValue * 1.2)];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-gray-800">Plan chart</h3>
          <p className="text-xs text-gray-400 mt-0.5">Active plans over time</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            className="btn btn-sm btn-light"
          >
            {planOptions.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>

          {view === "monthly" && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  if (currentMonth === 0) {
                    setCurrentMonth(11);
                    setCurrentYear((y) => y - 1);
                  } else {
                    setCurrentMonth((m) => m - 1);
                  }
                }}
                className="w-7 h-7 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm flex items-center justify-center"
              >
                ‹
              </button>
              <span className="text-xs font-medium text-gray-700 w-28 text-center">
                {monthNames[currentMonth]} {currentYear}
              </span>
              <button
                onClick={() => {
                  if (currentMonth === 11) {
                    setCurrentMonth(0);
                    setCurrentYear((y) => y + 1);
                  } else {
                    setCurrentMonth((m) => m + 1);
                  }
                }}
                className="w-7 h-7 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm flex items-center justify-center"
              >
                ›
              </button>
            </div>
          )}

          {view === "yearly" && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentYear((y) => y - 1)}
                className="w-7 h-7 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm flex items-center justify-center"
              >
                ‹
              </button>
              <span className="text-xs font-medium text-gray-700 w-16 text-center">
                {currentYear}
              </span>
              <button
                onClick={() => setCurrentYear((y) => y + 1)}
                className="w-7 h-7 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm flex items-center justify-center"
              >
                ›
              </button>
            </div>
          )}

          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            {["monthly", "yearly"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize
                  ${view === v ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-40 sm:h-52">
        {chartLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              barCategoryGap={view === "monthly" ? "15%" : "30%"}
              barSize={barSize}
            >
              <CartesianGrid vertical={false} stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 9, fill: "#9ca3af" }}
                interval={0}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                domain={yDomain}
                width={30}
              />
              <Tooltip
                cursor={{ fill: "rgba(99,102,241,0.08)" }}
                contentStyle={{
                  borderRadius: 8,
                  border: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  fontSize: 12,
                }}
                labelFormatter={(l) =>
                  view === "monthly"
                    ? `Day ${l}, ${monthNames[currentMonth]} ${currentYear}`
                    : `${l} ${currentYear}`
                }
                formatter={(v) => [v, "Member"]}
              />
              <Bar
                dataKey="value"
                fill="rgba(0, 91, 168, 1)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

const ClientPerformanceTable = ({
  data,
  title = "All Clients", // ← default kept
  description = "Manage your active clients and track.",
}) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("all");
  const pageSize = 25;

  const planOptions = [
    { id: "all", name: "All Plans" },
    ...(Array.isArray(plans) ? plans : []),
  ];

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await GetAllPlans();
        if (res?.data?.success) {
          const raw = res.data.data;
          setPlans(Array.isArray(raw) ? raw : []);
        }
      } catch (err) {
        console.error("Error fetching plans:", err);
      }
    };
    fetchPlans();
  }, []);

  const filtered = data.filter(
    (d) =>
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.company_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.city?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleExport = () => {
    const csv = [
      [
        "User Code",
        "Company",
        "Client Name",
        "City",
        "Mobile No.",
        "Start Date",
        "End Date",
        "Database",
        "Status",
      ],
      ...filtered.map((d) => [
        d.userCode,
        d.company_name,
        d.name,
        d.city,
        d.phone,
        d.planstartdate,
        d.planenddate,
        d.database,
        d.is_active ? "Active" : "Inactive",
      ]),
    ]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "client_performance.csv";
    a.click();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-gray-100 gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <svg
              className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-400 w-full sm:w-44"
              placeholder="Search Clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Export */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs bg-primary text-white rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
              />
            </svg>
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <TableComponent
          columns={clientColumns}
          data={filtered}
          paginationSize={25}
        />
      </div>
    </div>
  );
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const icons = {
  users: (
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
        d="M17 20h5v-2a4 4 0 00-5-3.874M9 20H4v-2a4 4 0 015-3.874m6-4.126a4 4 0 10-8 0 4 4 0 008 0zm6 0a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  calendar: (
    <svg
      className="w-5 h-5 text-yellow-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  check: (
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
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  x: (
    <svg
      className="w-5 h-5 text-red-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  plan: (
    <svg
      className="w-5 h-5 text-orange-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  ),
  chart: (
    <svg
      className="w-5 h-5 text-purple-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  fork: (
    <svg
      className="w-5 h-5 text-teal-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
      />
    </svg>
  ),
  dollar: (
    <svg
      className="w-5 h-5 text-indigo-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  building: (
    <svg
      className="w-5 h-5 text-pink-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  ),
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [date, setDate] = useState({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(new Date().getFullYear(), 11, 31),
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [teamsData, setTeamsData] = useState([]);
  const [demoTeamsData, setDemoTeamsData] = useState([]);
  const { isRTL } = useLanguage();

  useEffect(() => {
    SuperAdminDashboardTotalUserAndPlan()
      .then((res) => {
        if (res?.data?.success === true) setDashboardData(res.data.data);
      })
      .catch((err) => console.error(err));
  }, []);
  const mapUsers = (users) =>
    users
      .map((user) => ({
        id: user.id,
        userCode: user.userCode,
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        phone: user.contactNo || user.userBasicDetails?.officeNo || "N/A",
        company_name: user["userBasicDetails"]?.companyName || "N/A",
        city: user["userBasicDetails"]?.city?.name || "N/A",
        is_active: user.isActive ?? false,
        planstartdate: user.userPlan.startDate,
        planenddate: user.userPlan.endDate,
        database: "",
        created_at: user.createdAt || user.userBasicDetails?.createdAt || "N/A",
        created_at_iso: user.createdAt
          ? new Date(
              user.createdAt.split("/").reverse().join("-"),
            ).toISOString()
          : null,
      }))
      .sort((a, b) => {
        if (!a.created_at_iso) return 1;
        if (!b.created_at_iso) return -1;
        return new Date(b.created_at_iso) - new Date(a.created_at_iso);
      });

  // ─── fetch member clients ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await getAllByRoleIdData(2, "member");
        if (res?.data?.success === true) {
          const users = res?.data?.data?.["User Details"].users || [];
          setTeamsData(mapUsers(users));
        }
      } catch (err) {
        console.error("Error fetching member team:", err);
      }
    };
    fetchTeam();
  }, []);

  // ─── fetch demo clients ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchDemoTeam = async () => {
      try {
        const res = await getAllByRoleIdData(2, "demo"); // ← type: "demo"
        if (res?.data?.success === true) {
          const users = res?.data?.data?.["User Details"].users || [];
          setDemoTeamsData(mapUsers(users));
        }
      } catch (err) {
        console.error("Error fetching demo team:", err);
      }
    };
    fetchDemoTeam();
  }, []);

  const topStats = [
    {
      title: "Total Users",
      value: dashboardData?.totalAllUser ?? "—",
      icon: icons.users,
      iconBg: "bg-blue-50",
      positive: true,
    },
    {
      title: "Total Amount",
      value: dashboardData?.allUserTotalAmount
        ? `₹${dashboardData.allUserTotalAmount}`
        : "—",
      icon: icons.check,
      iconBg: "bg-green-50",
      positive: true,
    },
    {
      title: "Total Paid Amount",
      value: dashboardData?.allUserPaidAmount
        ? `₹${dashboardData.allUserPaidAmount}`
        : "—",
      icon: icons.check,
      iconBg: "bg-green-50",
      positive: true,
    },
    {
      title: "Total Unpaid Amount",
      value: dashboardData?.allUserUnPaidAmount
        ? `₹${dashboardData.allUserUnPaidAmount}`
        : "—",
      icon: icons.x,
      iconBg: "bg-red-50",
      positive: true,
    },
  ];

  return (
    <Fragment>
      <Container>
        <Toolbar>
          <ToolbarHeading
            title={
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_LANGUAGE"
                defaultMessage="Overview Dashboard"
              />
            }
            description={
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_DESCRIPTION"
                defaultMessage="Real-time catering operations highlights and predictive analytics."
              />
            }
          />
          <ToolbarActions>
            <Popover>
              <PopoverContent
                className="w-auto p-0 max-w-[calc(100vw-2rem)]"
                align="end"
              >
                {/* Two months — desktop */}
                <div className="hidden sm:block">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </div>
                {/* One month — mobile */}
                <div className="sm:hidden">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={1}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </ToolbarActions>
        </Toolbar>
      </Container>

      <Container>
        <div className="flex flex-col gap-4 lg:gap-6 w-full max-w-full overflow-x-hidden">
          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4">
            {topStats.map((s) => (
              <StatCard key={s.title} {...s} />
            ))}
          </div>
          <PlanChart />
          <ClientPerformanceTable data={teamsData} />
          <ClientPerformanceTable
            data={demoTeamsData}
            title="Demo Clients"
            description="Manage your demo clients and track."
          />
        </div>
      </Container>
    </Fragment>
  );
};

export default Dashboard;
