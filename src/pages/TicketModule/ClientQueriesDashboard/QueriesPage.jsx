import { useState } from "react";
import { TableComponent } from "@/components/table/TableComponent";
import { getQueriesTableColumnsConfig } from "./constant";
import ClientRaiseNewIssue from "../../../partials/modals/TicketModal/ClientRaiseNewIssue";

// ── Status config ────────────────────────────────────────────────────────────
const statusConfig = {
  Running: { dot: "bg-blue-500", text: "text-blue-600", label: "Running" },
  Pending: { dot: "bg-gray-400", text: "text-gray-500", label: "Pending" },
  Completed: {
    dot: "bg-green-500",
    text: "text-green-600",
    label: "Completed",
  },
};

// ── Priority config ──────────────────────────────────────────────────────────
const priorityConfig = {
  High: "bg-red-100 text-red-600 border border-red-200",
  Medium: "bg-orange-100 text-orange-500 border border-orange-200",
  Low: "bg-gray-100 text-gray-500 border border-gray-200",
};

// ── Module icons ─────────────────────────────────────────────────────────────
const moduleIcons = {
  "Menu Planning": (
    <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0">
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h7"
        />
      </svg>
    </div>
  ),
  "Inventory Control": (
    <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0">
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
    </div>
  ),
  "Billing & Invoicing": (
    <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0">
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    </div>
  ),
  "Workflow Engine": (
    <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0">
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </div>
  ),
  "Customer Support": (
    <div className="w-8 h-8 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0">
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        />
      </svg>
    </div>
  ),
};

// ── Mock data ────────────────────────────────────────────────────────────────
const mockData = [
  {
    id: 1,
    moduleName: "Menu Planning",
    queryId: "Q-8492",
    createdAgo: "2h ago",
    priority: "High",
    status: "Running",
    createdDate: "28/04/2026",
    expectedDate: "30/04/2026",
    expectedTime: "04:00 PM",
    isCompleted: false,
  },
  {
    id: 2,
    moduleName: "Inventory Control",
    queryId: "Q-8492",
    createdAgo: "2h ago",
    priority: "Medium",
    status: "Pending",
    createdDate: "28/04/2026",
    expectedDate: "30/04/2026",
    expectedTime: "04:00 PM",
    isCompleted: false,
  },
  {
    id: 3,
    moduleName: "Billing & Invoicing",
    queryId: "Q-8492",
    createdAgo: "2h ago",
    priority: "Low",
    status: "Completed",
    createdDate: "28/04/2026",
    expectedDate: "30/04/2026",
    expectedTime: "04:00 PM",
    isCompleted: true,
  },
  {
    id: 4,
    moduleName: "Workflow Engine",
    queryId: "Q-8492",
    createdAgo: "2h ago",
    priority: "High",
    status: "Pending",
    createdDate: "28/04/2026",
    expectedDate: "30/04/2026",
    expectedTime: "04:00 PM",
    isCompleted: false,
  },
  {
    id: 5,
    moduleName: "Customer Support",
    queryId: "Q-8492",
    createdAgo: "2h ago",
    priority: "Medium",
    status: "Running",
    createdDate: "28/04/2026",
    expectedDate: "30/04/2026",
    expectedTime: "04:00 PM",
    isCompleted: false,
  },
];

// ── Stats ────────────────────────────────────────────────────────────────────
const stats = [
  {
    label: "Total Queries",
    value: "1,284",
    bg: "bg-blue-50",
    icon: (
      <svg
        className="w-5 h-5 text-blue-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    label: "Pending",
    value: "42",
    bg: "bg-orange-50",
    icon: (
      <svg
        className="w-5 h-5 text-orange-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    label: "Completed",
    value: "1,190",
    bg: "bg-green-50",
    icon: (
      <svg
        className="w-5 h-5 text-green-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    label: "Regenerated",
    value: "52",
    bg: "bg-purple-50",
    icon: (
      <svg
        className="w-5 h-5 text-purple-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
  },
];

// ── Cell renderers (action col is owned by ActionCell in constant.jsx) ────────
const cellRenderers = {
  moduleName: ({ row }) => (
    <div className="flex items-center gap-2 min-w-0">
      {moduleIcons[row.original.moduleName] ?? (
        <div className="w-8 h-8 rounded-md bg-gray-100 flex-shrink-0" />
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">
          {row.original.moduleName}
        </p>
        <p className="text-xs text-gray-400">
          {row.original.queryId} · Created {row.original.createdAgo}
        </p>
      </div>
    </div>
  ),

  priority: ({ row }) => (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-md ${priorityConfig[row.original.priority]}`}
    >
      {row.original.priority}
    </span>
  ),

  status: ({ row }) => {
    const s = statusConfig[row.original.status];
    return (
      <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
        <span className={`text-sm font-medium ${s.text}`}>{s.label}</span>
      </div>
    );
  },

  createdDate: ({ row }) => (
    <span className="text-sm text-gray-600">{row.original.createdDate}</span>
  ),
  expectedDate: ({ row }) => (
    <span className="text-sm text-gray-600">{row.original.expectedDate}</span>
  ),
  expectedTime: ({ row }) => (
    <span className="text-sm text-gray-600">{row.original.expectedTime}</span>
  ),
};

// ── Build columns ─────────────────────────────────────────────────────────────
const buildColumns = ({ onExport, onReassign } = {}) => {
  const config = getQueriesTableColumnsConfig({ onExport, onReassign });
  return config.map((col) => ({
    ...col,
    ...(cellRenderers[col.accessorKey]
      ? { cell: cellRenderers[col.accessorKey] }
      : {}),
  }));
};

// ── Page ──────────────────────────────────────────────────────────────────────
const QueriesPage = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("New Queries");
  const [isNewIssueOpen, setIsNewIssueOpen] = useState(false);

  // ClientViewIssueModal is NOT here — it lives inside ActionCell per row
  const columns = buildColumns({
    onExport: (row) => console.log("export", row),
    onReassign: (row) => console.log("reassign", row),
  });

  const filteredData = mockData.filter((item) =>
    item.moduleName.toLowerCase().includes(search.toLowerCase()),
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
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <button className="flex items-center gap-1.5 text-sm border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50 transition bg-white">
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Mahakali Caterers Queries
          </h1>
          <p className="text-sm mt-0.5 text-gray-500">
            Manage and monitor active queries across all system modules.
          </p>
        </div>
        <button
          onClick={() => setIsNewIssueOpen(true)}
          className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition self-start sm:self-auto"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create New Query
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 pb-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition"
          >
            <div
              className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center flex-shrink-0`}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-black">{s.label}</p>
              <p className="text-xl font-bold text-black">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/*
        ✅ ClientRaiseNewIssue — mounted only when button is clicked.
           Prevents unnecessary DOM from existing on initial load.
      */}
      {isNewIssueOpen && (
        <ClientRaiseNewIssue
          open={isNewIssueOpen}
          onClose={() => setIsNewIssueOpen(false)}
          moduleOptions={[
            { label: "Menu Planning", value: "menu" },
            { label: "Inventory Control", value: "inventory" },
            { label: "Billing & Invoicing", value: "billing" },
          ]}
          onSubmit={(formData) => {
          
            setIsNewIssueOpen(false);
          }}
        />
      )}

      {/* Table */}
      <TableComponent
        columns={columns}
        data={filteredData}
        paginationSize={5}
        toolbar={toolbar}
        defaultSorting={[{ id: "moduleName", desc: false }]}
      />
    </div>
  );
};

export default QueriesPage;
