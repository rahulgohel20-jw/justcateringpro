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

export const payableColumns = [
  {
    accessorKey: "month",
    header: "MONTH",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-700">
        {row.original.month}
      </span>
    ),
  },
  {
    accessorKey: "expense",
    header: "TOTAL EXPENSE",
    cell: ({ row }) => (
      <span className="text-sm text-gray-800">{row.original.expense}</span>
    ),
  },
  {
    accessorKey: "paid",
    header: "PAID AMOUNT",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-green-600">
        {row.original.paid}
      </span>
    ),
  },
  {
    accessorKey: "pending",
    header: "PENDING PAYABLE",
    cell: ({ row }) => (
      <span className="text-sm font-medium text-red-500">
        {row.original.pending}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "STATUS",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
];
