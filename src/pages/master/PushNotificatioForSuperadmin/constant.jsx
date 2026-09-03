// ── Change: export a function not a const array ──
export const getPushNotificationColumns = ({
  handleView,
  handleEdit,
  handlePush,
}) => [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-900">
        {row.original.title}
      </span>
    ),
  },
  {
    accessorKey: "audience",
    header: "Audience",
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">{row.original.audience}</span>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">{row.original.date}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusConfig = {
        Sent: { bg: "#f0fdf4", color: "#3b6d11", dot: "#3b6d11" },
        Draft: { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8" },
        Pending: { bg: "#fff7ed", color: "#854f0b", dot: "#f59e0b" },
      };
      const s = row.original.status;
      const cfg = statusConfig[s] ?? statusConfig.Draft;
      return (
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: cfg.bg, color: cfg.color }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: cfg.dot }}
          />
          {s}
        </span>
      );
    },
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {/* View */}
        <button
          onClick={() => handleView(row.original)}
          className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-green-50 border border-gray-100 flex items-center justify-center transition-colors group"
          title="View"
        >
          <i className="ki-filled ki-eye text-gray-400 group-hover:text-green-600 text-sm" />
        </button>
        {/* Edit */}
        <button
          onClick={() => handleEdit(row.original)}
          className="w-7 h-7 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-100 flex items-center justify-center transition-colors group"
          title="Edit"
        >
          <i className="ki-filled ki-notepad-edit text-gray-400 group-hover:text-blue-600 text-sm" />
        </button>
      </div>
    ),
  },
  {
    accessorKey: "send",
    header: "Send",
    cell: ({ row }) => (
      <button
        onClick={() => handlePush(row.original)}
        className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
      >
        Push
      </button>
    ),
  },
];
