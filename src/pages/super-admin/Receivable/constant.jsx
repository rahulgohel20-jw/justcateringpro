// ── Status Badge ───────────────────────────────────────
export const StatusBadge = ({ status }) => {
  const map = {
    PAID: "bg-green-100 text-green-700",
    PARTIAL: "bg-orange-100 text-orange-700",
    PENDING: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        map[status?.toUpperCase()] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
};

export const fmt = (n) =>
  "₹" +
  Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ── Columns ────────────────────────────────────────────
export const receivableColumns = [
  {
    accessorKey: "month",
    header: "MONTH",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-700">
        {row.original.month ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "totalInvoiceCount",
    header: "TOTAL INVOICE",
    cell: ({ row }) => (
      <span className="text-sm text-gray-800">
        {row.original.totalInvoiceCount ?? "0"}
      </span>
    ),
  },
  {
    accessorKey: "totalAmount",
    header: "TOTAL AMOUNT",
    cell: ({ row }) => (
      <span className="text-sm text-gray-800">
        {row.original.totalAmount != null ? fmt(row.original.totalAmount) : "—"}
      </span>
    ),
  },
  {
    // ✅ future field — BE will add paidInvoiceCount per month
    accessorKey: "paidInvoiceCount",
    header: "PAID INVOICE",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-green-600">
        {row.original.paidInvoiceCount ?? "0"}
      </span>
    ),
  },
  {
    accessorKey: "paidAmount",
    header: "PAID AMOUNT",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-green-600">
        {row.original.paidAmount != null ? fmt(row.original.paidAmount) : "—"}
      </span>
    ),
  },
  {
    // ✅ future field — BE will add pendingInvoiceCount per month
    accessorKey: "pendingInvoiceCount",
    header: "PENDING INVOICE",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-orange-500">
        {row.original.pendingInvoiceCount ?? "0"}
      </span>
    ),
  },
  {
    accessorKey: "pendingAmount",
    header: "PENDING AMOUNT",
    cell: ({ row }) => (
      <span
        className={`text-sm font-medium ${
          (row.original.pendingAmount ?? 0) > 0
            ? "text-red-500"
            : "text-gray-400"
        }`}
      >
        {row.original.pendingAmount != null
          ? fmt(row.original.pendingAmount)
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];
