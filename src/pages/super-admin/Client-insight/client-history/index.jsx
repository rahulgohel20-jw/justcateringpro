import { useState } from "react";
import { TableComponent } from "@/components/table/TableComponent";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";

// ─── Constants ───────────────────────────────────────────────────────────────

const CLIENT = {
  name: "Jonathan Wick",
  company: "Continental Catering Services Ltd.",
  status: "ACTIVE",
  avatar: null,
  initials: "JW",
  clientSince: "Jan 12, 2021",
  lastActivity: "2 hours ago",
  totalEvents: 142,
  daysUsingProduct: 1124,
  lifetimeValue: "$428,940.50",
  lifetimeValueSub: "Top 5% of all clients in 2023",
};

const STAT_CARDS = [
  { id: "planning", label: "PLANNING", value: "84", trend: "+10%", up: true },
  { id: "execution", label: "EXECUTION", value: "112", trend: "+8%", up: true },
  { id: "labour", label: "LABOUR", value: "1.2k", trend: "-2%", up: false },
  { id: "costing", label: "COSTING", value: "432", trend: "+18%", up: true },
  { id: "quotation", label: "QUOTATION", value: "56", trend: "+4%", up: true },
  { id: "invoice", label: "INVOICE", value: "92", trend: "+7%", up: true },
];

const CHART_DATA = [
  { month: "JAN", revenue: 45, invoiced: 30 },
  { month: "FEB", revenue: 55, invoiced: 42 },
  { month: "MAR", revenue: 80, invoiced: 65 },
  { month: "APR", revenue: 70, invoiced: 55 },
  { month: "MAY", revenue: 95, invoiced: 78 },
  { month: "JUN", revenue: 60, invoiced: 50 },
];

const MODULE_ENGAGEMENT = [
  { label: "MENU PLANNING", pct: 92, color: "bg-green-500" },
  { label: "LABOUR MANAGEMENT", pct: 65, color: "bg-blue-600" },
  { label: "COST ANALYSIS", pct: 48, color: "bg-blue-400" },
  { label: "QUOTING ENGINE", pct: 30, color: "bg-blue-300" },
];

const HISTORY_TABS = [
  "Menu Planning",
  "Menu Execution",
  "Labour Allocation",
  "Dish Costing",
  "Quotation",
  "Invoice",
  "Payments",
];

const HISTORY_DATA = [
  {
    id: 1,
    date: "Oct 24, 2023",
    eventName: "Goldman Gala Annual Dinner",
    eventType: "Corporate • Black Tie",
    amount: "$12,450.00",
    status: "CONFIRMED",
    count: "650 Guests",
  },
  {
    id: 2,
    date: "Oct 18, 2023",
    eventName: "Peterson Tech Product Launch",
    eventType: "Concept Service • 12 Staff",
    amount: "$8,200.00",
    status: "PENDING",
    count: "200 Guests",
  },
  {
    id: 3,
    date: "Oct 10, 2023",
    eventName: "Executive Board Annual Retreat",
    eventType: "Private • Fine Dining",
    amount: "$5,750.00",
    status: "CONFIRMED",
    count: "45 Guests",
  },
  {
    id: 4,
    date: "Sep 28, 2023",
    eventName: "Meridian Awards Ceremony",
    eventType: "Gala • Full Service",
    amount: "$22,100.00",
    status: "INVOICED",
    count: "900 Guests",
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const map = {
    CONFIRMED: "bg-green-100 text-green-700 border border-green-200",
    PENDING: "bg-amber-100 text-amber-700 border border-amber-200",
    INVOICED: "bg-blue-100 text-blue-700 border border-blue-200",
  };
  return (
    <span
      className={`text-[10px] font-bold tracking-widest px-2.5 py-1 rounded-full ${map[status] || "bg-gray-100 text-gray-500"}`}
    >
      {status}
    </span>
  );
};

const MiniStatCard = ({ card }) => {
  if (card.dark) {
    return (
      <div className="flex-1 min-w-[90px] rounded-xl p-3 flex flex-col gap-1 bg-gradient-to-br from-blue-900 to-blue-700 border border-black">
        <span className="text-blue-300 text-[9px] font-bold tracking-widest uppercase">
          {card.label}
        </span>
        <span className="text-black text-xl font-extrabold leading-tight">
          {card.value}
        </span>
        <span className="text-blue-200 text-[10px]">{card.trend}</span>
      </div>
    );
  }
  return (
    <div className="flex-1 min-w-[90px] rounded-xl p-3 flex flex-col gap-1 bg-white border border-gray-400 border-t-2 border-t-blue-600">
      <span className="text-gray-400 text-[9px] font-bold tracking-widest uppercase">
        {card.label}
      </span>
      <span className="text-gray-900 text-xl font-extrabold leading-tight">
        {card.value}
      </span>
      <span
        className={`text-[10px] font-semibold ${card.up ? "text-green-500" : "text-red-400"}`}
      >
        {card.trend}
      </span>
    </div>
  );
};

// Bar chart (pure CSS/SVG-free, Tailwind only)
const BarChart = () => {
  const maxVal = 100;
  return (
    <div className="flex items-end gap-2 h-36 w-full">
      {CHART_DATA.map((d) => (
        <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
          <div className="w-full flex items-end gap-0.5 h-28">
            <div
              className="flex-1 bg-blue-200 rounded-t"
              style={{ height: `${(d.invoiced / maxVal) * 100}%` }}
            />
            <div
              className="flex-1 bg-blue-700 rounded-t"
              style={{ height: `${(d.revenue / maxVal) * 100}%` }}
            />
          </div>
          <span className="text-[9px] text-gray-400 font-semibold tracking-wider">
            {d.month}
          </span>
        </div>
      ))}
    </div>
  );
};

// Module engagement bars
const ModuleBar = ({ item }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between items-center">
      <span className="text-[10px] font-bold text-black tracking-widest">
        {item.label}
      </span>
      <span className="text-[10px] font-bold text-black">{item.pct}%</span>
    </div>
    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${item.color}`}
        style={{ width: `${item.pct}%` }}
      />
    </div>
  </div>
);

// ─── Table columns ────────────────────────────────────────────────────────────
const buildColumns = () => [
  {
    accessorKey: "date",
    header: "DATE",
    cell: ({ row }) => (
      <span className="text-[12px] text-gray-500 whitespace-nowrap">
        {row.original.date}
      </span>
    ),
  },
  {
    accessorKey: "eventName",
    header: "EVENT NAME",
    cell: ({ row }) => {
      const r = row.original;
      return (
        <div>
          <div className="text-[13px] font-semibold text-gray-900">
            {r.eventName}
          </div>
          <div className="text-[11px] text-gray-400">{r.eventType}</div>
        </div>
      );
    },
  },

  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "count",
    header: "COUNT",
    cell: ({ row }) => (
      <span className="text-[12px] text-gray-500">{row.original.count}</span>
    ),
  },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ClientInsightHistory() {
  const [activeTab, setActiveTab] = useState("Menu Planning");
  const columns = buildColumns();

  return (
    <div className="bg-white min-h-screen px-6 py-5 font-sans">
      {/* Breadcrumb */}
      <div className="gap-2 pb-2 mb-3">
        <Breadcrumbs items={[{ title: "Client History" }]} />
      </div>
      {/* ── Hero Card ── */}
      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5 mb-4 flex flex-wrap gap-5 items-start">
        {/* Left — identity */}
        <div className="flex items-start gap-4 flex-1 min-w-[220px]">
          <div className="w-16 h-16 rounded-xl bg-blue-900 flex items-center justify-center text-white font-extrabold text-xl shrink-0 border-2 border-blue-200">
            JW
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-extrabold text-gray-900 leading-tight m-0">
                {CLIENT.name}
              </h1>
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-green-200 tracking-widest">
                {CLIENT.status}
              </span>
            </div>
            <p className="text-[12px] text-gray-500 m-0">{CLIENT.company}</p>
            <div className="flex gap-4 mt-1 flex-wrap">
              <div>
                <div className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">
                  CLIENT SINCE
                </div>
                <div className="text-[12px] font-semibold text-gray-700">
                  {CLIENT.clientSince}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">
                  LAST ACTIVITY
                </div>
                <div className="text-[12px] font-semibold text-gray-700">
                  {CLIENT.lastActivity}
                </div>
              </div>
              <div>
                <div className="text-[9px] text-gray-400 font-bold tracking-widest uppercase">
                  TOTAL EVENTS
                </div>
                <div className="text-[12px] font-semibold text-gray-700">
                  {CLIENT.totalEvents}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center — days using */}
        <div className="flex flex-col items-center justify-center px-6 border-l border-r border-gray-700 min-w-[120px]">
          <span className="text-4xl font-extrabold text-blue-700">
            {CLIENT.daysUsingProduct.toLocaleString()}
          </span>
          <span className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase text-center mt-1">
            Days Using
            <br />
            Product
          </span>
        </div>

        {/* Right — lifetime value */}
        {/* <div className="flex flex-col justify-center rounded-xl bg-gradient-to-br from-blue-900 to-blue-700 px-6 py-4 min-w-[190px] border border-blue-600">
          <span className="text-blue-300 text-[9px] font-bold tracking-widest uppercase">
            LIFETIME VALUE
          </span>
          <span className="text-white text-2xl font-extrabold leading-tight mt-1">
            {CLIENT.lifetimeValue}
          </span>
          <span className="text-blue-200 text-[10px] mt-1">
            {CLIENT.lifetimeValueSub}
          </span>
        </div> */}
      </div>

      {/* ── Mini Stat Cards ── */}
      <div className="flex gap-2.5 flex-wrap mb-5">
        {STAT_CARDS.map((card) => (
          <MiniStatCard key={card.id} card={card} />
        ))}
      </div>

      {/* ── Charts Row ── */}
      {/* <div className="grid grid-cols-1 gap-4 mb-5 md:grid-cols-2">
        {/* Financial Performance Trend */}
      {/* <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="mb-1">
            <h3 className="text-[14px] font-extrabold text-gray-900 m-0">
              Financial Performance Trend
            </h3>
            <p className="text-[11px] text-gray-400 m-0 mt-0.5">
              Monthly revenue vs invoice projections
            </p>
          </div>
          <div className="flex items-center gap-3 mb-3 mt-2">
            <span className="flex items-center gap-1 text-[10px] text-gray-500">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-700" />{" "}
              Revenue
            </span>
            <span className="flex items-center gap-1 text-[10px] text-gray-400">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-200" />{" "}
              Invoiced
            </span>
          </div>
          <BarChart />
        </div> */}

      {/* Module Engagement */}
      {/* <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="mb-4">
            <h3 className="text-[14px] font-extrabold text-gray-900 m-0">
              Module Engagement
            </h3>
            <p className="text-[11px] text-gray-400 m-0 mt-0.5">
              Intensity of software usage by category
            </p>
          </div>
          <div className="flex flex-col gap-4">
            {MODULE_ENGAGEMENT.map((item) => (
              <ModuleBar key={item.label} item={item} />
            ))}
          </div>
          <div className="flex justify-end mt-4">
            <button className="w-7 h-7 rounded-full bg-blue-700 text-white text-lg font-bold flex items-center justify-center hover:bg-blue-800 cursor-pointer border-none">
              +
            </button>
          </div>
        </div> */}

      {/* ── History Tabs + Table ── */}
      <div className="rounded-2xl border border-gray-100 bg-white">
        {/* Tab strip */}
        <div className="flex items-center gap-0 border-b border-gray-100 px-4 pt-3 overflow-x-auto">
          {HISTORY_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2.5 text-[12px] font-semibold whitespace-nowrap border-none cursor-pointer transition-all duration-150 border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-b-blue-700 text-blue-700 bg-transparent"
                  : "border-b-transparent text-gray-500 bg-transparent hover:text-gray-700"
              }`}
            >
              {tab}
            </button>
          ))}
          {/* Filter History button */}
          <div className="ml-auto shrink-0 pb-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 text-white text-[11px] font-bold rounded-lg border-none cursor-pointer hover:bg-blue-800 whitespace-nowrap">
              ▼ Filter History
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-4">
          <TableComponent
            columns={columns}
            data={HISTORY_DATA}
            hidePagination={false}
            paginationSize={10}
          />
        </div>
      </div>
    </div>
  );
}
