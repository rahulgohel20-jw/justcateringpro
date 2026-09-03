// import { SIMPLE_TYPES } from "./expenseConstants"; // or inline if you prefer

export const getExpenseColumns = (isSimple) => [
  {
    accessorKey: "sr_no",
    header: "#",
    cell: ({ row }) => row.index + 1,
  },
  {
    accessorKey: "user.name",
    header: isSimple ? "Title" : "Trip",
    cell: ({ row }) => (
      <div>
        <p className="text-sm font-semibold text-gray-800">
          {row.original.user?.name}
        </p>
        {row.original.user?.username && (
          <p className="text-xs text-gray-400">{row.original.user.username}</p>
        )}
      </div>
    ),
  },
  ...(!isSimple ? [{ accessorKey: "userName", header: "Member" }] : []),
  {
    accessorKey: "totalAmount",
    header: "Amount",
    cell: ({ getValue }) => `₹${(getValue() ?? 0).toLocaleString()}`,
  },
  {
    accessorKey: "paidAmount",
    header: "Paid",
    cell: ({ getValue }) => (
      <span className="text-emerald-600 font-medium">
        ₹{(getValue() ?? 0).toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: "remainingAmount",
    header: "Remaining",
    cell: ({ getValue }) => (
      <span className="text-red-500 font-medium">
        ₹{(getValue() ?? 0).toLocaleString()}
      </span>
    ),
  },
  ...(!isSimple
    ? [
        { accessorKey: "startDate", header: "From" },
        {
          accessorKey: "toDate",
          header: "To",
          cell: ({ getValue }) => getValue() ?? "-",
        },
      ]
    : [{ accessorKey: "startDate", header: "Date" }]),
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ getValue }) => {
      const val = getValue();
      return (
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-lg capitalize ${
            val === "paid"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {val}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <button
          onClick={() => console.log("Edit", row.original)}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"
          title="Edit"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </button>
        <button
          onClick={() => console.log("Delete", row.original.id)}
          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition"
          title="Delete"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
        <button
          onClick={() => console.log("Payout", row.original)}
          className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-500 transition"
          title="Payout"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
        </button>
      </div>
    ),
  },
];
