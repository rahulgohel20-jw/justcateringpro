import { DataGridColumnHeader } from "@/components";

const StatusBadge = ({ active }) => (
  <span
    className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
      active
        ? "text-green-600 bg-green-50 border border-green-200"
        : "text-red-500 bg-red-50 border border-red-200"
    }`}
  >
    {active ? "Active" : "Inactive"}
  </span>
);

export const clientColumns = [
  {
    accessorKey: "userCode",
    header: ({ column }) => (
      <DataGridColumnHeader title="User Code" column={column} />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-primary font-medium">
        {row.original.userCode || "—"}
      </span>
    ),
  },
  {
    accessorKey: "company_name",
    header: ({ column }) => (
      <DataGridColumnHeader title="Company" column={column} />
    ),
    cell: ({ row }) => (
      <span className="text-gray-700">{row.original.company_name || "—"}</span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataGridColumnHeader title="Client Name" column={column} />
    ),
    cell: ({ row }) => (
      <span className="text-primary font-medium cursor-pointer hover:underline">
        {row.original.name || "—"}
      </span>
    ),
  },
  {
    accessorKey: "city",
    header: ({ column }) => (
      <DataGridColumnHeader title="City" column={column} />
    ),
    cell: ({ row }) => (
      <span className="text-gray-600">{row.original.city || "—"}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataGridColumnHeader title="Mobile No." column={column} />
    ),
    cell: ({ row }) => (
      <span className="text-gray-600">{row.original.phone || "—"}</span>
    ),
  },
  {
    accessorKey: "planstartdate",
    header: ({ column }) => (
      <DataGridColumnHeader title="Start Date" column={column} />
    ),
    cell: ({ row }) => (
      <span className="text-gray-600">{row.original.planstartdate || "—"}</span>
    ),
  },
  {
    accessorKey: "planenddate",
    header: ({ column }) => (
      <DataGridColumnHeader title="End Date" column={column} />
    ),
    cell: ({ row }) => (
      <span className="text-gray-600">{row.original.planenddate || "—"}</span>
    ),
  },
  {
    accessorKey: "database",
    header: ({ column }) => (
      <DataGridColumnHeader title="Database" column={column} />
    ),
    cell: ({ row }) => (
      <span className="text-gray-600">{row.original.database || "—"}</span>
    ),
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <DataGridColumnHeader title="Status" column={column} />
    ),
    cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
  },
];
