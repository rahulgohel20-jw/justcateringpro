import { useState } from "react";
import { TableComponent } from "@/components/table/TableComponent";
import { getQueriesTableColumnsConfig } from "./constant";
import { useNavigate } from "react-router-dom";

const priorityConfig = {
  High: "bg-red-100 text-red-700 border border-red-200",
  Medium: "bg-orange-100 text-orange-600 border border-orange-200",
  Low: "bg-gray-100 text-gray-500 border border-gray-200",
};

const statusConfig = {
  Running: { dot: "bg-blue-500", text: "text-blue-600", label: "Running" },
  Pending: { dot: "bg-gray-400", text: "text-gray-500", label: "Pending" },
  Completed: {
    dot: "bg-green-500",
    text: "text-green-600",
    label: "Completed",
  },
};

const mockData = [
  {
    id: 1,
    module: "Menu Planning",
    dept: "Frontend Developer",
    assignee: "Chirag Koshti",
    priority: "High",
    status: "Pending",
    from: "28/04/2026",
    to: "30/04/2026",
    time: "2 Hours",
    assigned: false,
    completed: false,
    clientCode: "JCX0001",
    clientName: "Mahakali Caterers",
    queryId: "Q-8492",
    createdAgo: "2h ago",
  },
  {
    id: 2,
    module: "Inventory Control",
    dept: "Backend Developer",
    assignee: "Deep Jain",
    priority: "Medium",
    status: "Running",
    from: "28/04/2026",
    to: "30/04/2026",
    time: "2 Hours",
    assigned: true,
    completed: false,
    clientCode: "JCX0002",
    clientName: "Vijay Catering",
    queryId: "Q-8493",
    createdAgo: "3h ago",
  },
  {
    id: 3,
    module: "Billing & Invoicing",
    dept: "UI/UX Designer",
    assignee: "Digvijay Kataria",
    priority: "Low",
    status: "Completed",
    from: "28/04/2026",
    to: "30/04/2026",
    time: "2 Hours",
    assigned: false,
    completed: true,
    clientCode: "JCX0003",
    clientName: "Gourmet Caterers",
    queryId: "Q-8494",
    createdAgo: "5h ago",
  },
  {
    id: 4,
    module: "Workflow Engine",
    dept: "Frontend Developer",
    assignee: "Tushar New",
    priority: "High",
    status: "Pending",
    from: "28/04/2026",
    to: "30/04/2026",
    time: "2 Hours",
    assigned: false,
    completed: false,
    clientCode: "JCX0004",
    clientName: "Aroma Catering",
    queryId: "Q-8495",
    createdAgo: "6h ago",
  },
  {
    id: 5,
    module: "Customer Support",
    dept: "Backend Developer",
    assignee: "Sahil Webminds",
    priority: "Medium",
    status: "Completed",
    from: "28/04/2026",
    to: "30/04/2026",
    time: "2 Hours",
    assigned: false,
    completed: true,
    clientCode: "JCX0005",
    clientName: "Sethi Caterers",
    queryId: "Q-8496",
    createdAgo: "8h ago",
  },
];

const stats = [
  {
    label: "Created",
    value: "12",
    sub: "Pending",
    subColor: "#6366F1",
    bg: "#EEF2FF",
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#6366F1"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
    ),
  },
  {
    label: "Assigned",
    value: "08",
    sub: "In Queue",
    subColor: "#F97316",
    bg: "#FFF7ED",
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#F97316"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
  {
    label: "In Progress",
    value: "05",
    sub: "Active",
    subColor: "#3B82F6",
    bg: "#EFF6FF",
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#3B82F6"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    label: "Completed",
    value: "24",
    sub: "Today",
    subColor: "#22C55E",
    bg: "#F0FDF4",
    icon: (
      <svg
        width="22"
        height="22"
        fill="none"
        viewBox="0 0 24 24"
        stroke="#22C55E"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
];

// ── Cell renderers ────────────────────────────────────────────────────────────
const cellRenderers = {
  priority: ({ row }) => (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-md ${priorityConfig[row.original.priority]}`}
    >
      {row.original.priority}
    </span>
  ),
  status: ({ row }) => {
    const s = statusConfig[row.original.status] ?? statusConfig.Pending;
    return (
      <div className="flex items-center gap-1.5 cursor-pointer">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
        <span className={`text-sm font-medium ${s.text}`}>{s.label}</span>
        <span className="text-gray-400 text-xs">▾</span>
      </div>
    );
  },
};

// ── Build columns — navigate passed in via onClientClick ──────────────────────
const buildColumns = ({ onExport, onReassign, onClientClick } = {}) => {
  const config = getQueriesTableColumnsConfig({
    onExport,
    onReassign,
    onClientClick,
  });

  return config.map((col) => ({
    ...col,
    ...(cellRenderers[col.accessorKey]
      ? { cell: cellRenderers[col.accessorKey] }
      : {}),
  }));
};

// ── Page ──────────────────────────────────────────────────────────────────────
const DevloperDashBoard = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("New Queries");

  // ✅ navigate is in scope — passed as onClientClick callback
  const columns = buildColumns({
    onExport: (row) => console.log("export", row),
    onReassign: (row) => console.log("reassign", row),
    onClientClick: (row) =>
      navigate("/super/ticket/devlopwrdashboard/clientdetil", {
        state: { client: row, allRows: mockData },
      }),
  });

  const filteredData = mockData.filter(
    (item) =>
      item.module.toLowerCase().includes(search.toLowerCase()) ||
      item.clientCode.toLowerCase().includes(search.toLowerCase()) ||
      item.clientName.toLowerCase().includes(search.toLowerCase()),
  );

  const toolbar = (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full p-2 mb-4">
      <div className="relative w-full sm:w-64">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search queries..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>
      <div className="flex items-center gap-2 ml-auto flex-wrap">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option>New Queries</option>
          <option>All Queries</option>
          <option>Pending</option>
          <option>Completed</option>
        </select>
        <button className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 bg-white">
          <svg
            className="w-4 h-4 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Select Date
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Queries</h1>
          <p className="text-sm mt-0.5 text-gray-500">
            Manage and monitor active queries across all system modules.
          </p>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-300 rounded-xl p-4 flex items-center gap-3"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: s.bg }}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-0.5">{s.label}</p>
              <p className="text-2xl font-semibold text-gray-900 leading-none">
                {s.value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: s.subColor }}>
                {s.sub}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <TableComponent
        columns={columns}
        data={filteredData}
        paginationSize={5}
        toolbar={toolbar}
        defaultSorting={[{ id: "clientCode", desc: false }]}
      />
    </div>
  );
};

export default DevloperDashBoard;
