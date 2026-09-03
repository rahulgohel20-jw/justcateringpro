import { Fragment, useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { Container } from "@/components/container";
import { useLanguage } from "@/i18n";
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from "@/layouts/demo1/toolbar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { addDays, format } from "date-fns";
import { cn } from "@/lib/utils";
import { KeenIcon } from "@/components/keenicons";
import { TableComponent } from "@/components/table/TableComponent";
import {
  getAllByRoleIdData,
  SuperAdminDashboardTotalUserAndPlan,
  GetAllPlans,
  SuperAdmingetChartData,
} from "@/services/apiServices";
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

const ClientPerformanceTable = ({ data }) => {
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-gray-100 gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-800">
            Active Clients
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage your active clients and track.
          </p>
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

      {/* TableComponent — handles pagination internally */}
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

const SuperInvoiceDashboard = () => {
  const [date, setDate] = useState({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(new Date().getFullYear(), 11, 31),
  });
  const [dashboardData, setDashboardData] = useState(null);
  const [teamsData, setTeamsData] = useState([]);
  const { isRTL } = useLanguage();

  useEffect(() => {
    SuperAdminDashboardTotalUserAndPlan()
      .then((res) => {
        if (res?.data?.success === true) setDashboardData(res.data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const role = 2;
        const type = "member";
        const res = await getAllByRoleIdData(role, type);
        if (res?.data?.success === true) {
          const users = res?.data?.data?.["User Details"] || [];
          const mappedTeams = users
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
              created_at:
                user.createdAt || user.userBasicDetails?.createdAt || "N/A",
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
          setTeamsData(mappedTeams);
        }
      } catch (err) {
        console.error("Error fetching team:", err);
      }
    };
    fetchTeam();
  }, []);

  const topStats = [
    {
      title: "Total Invoice",
      value: dashboardData?.totalAllUser ?? "—",
      icon: icons.users,
      iconBg: "bg-blue-50",
      positive: true,
    },

    {
      title: "Total Invoice  Amount",
      value: dashboardData?.totalAmount ? `₹${dashboardData.totalAmount}` : "—",
      icon: icons.check,
      iconBg: "bg-green-50",
      positive: true,
    },
    {
      title: "Total Paid Invoice",
      value: dashboardData?.paidAmount ? `₹${dashboardData.paidAmount}` : "—",
      icon: icons.x,
      iconBg: "bg-red-50",
      positive: true,
    },
    {
      title: "Total Unpaid Invoice",
      value: dashboardData?.unpaidAmount
        ? `₹${dashboardData.unpaidAmount}`
        : "—",
      icon: icons.plan,
      iconBg: "bg-orange-50",
      positive: false,
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
                defaultMessage="Invoice Overview "
              />
            }
            description={
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_DESCRIPTION"
                defaultMessage="Real-time invoice tracking with clear insights into payments"
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
          {/* Stat Cards — 2 cols mobile, 3 cols sm, 5 cols xl */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {topStats.map((s) => (
              <StatCard key={s.title} {...s} />
            ))}
          </div>
          <ClientPerformanceTable data={teamsData} />
        </div>
      </Container>
    </Fragment>
  );
};

export default SuperInvoiceDashboard;
