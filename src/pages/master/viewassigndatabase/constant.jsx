import { DataGridColumnHeader } from "@/components";

export const getColumns = () => [
  {
    accessorKey: "sr_no",
    header: ({ column }) => (
      <DataGridColumnHeader title="SR_NO" column={column} />
    ),
  },
  {
    accessorKey: "database_name",
    header: ({ column }) => (
      <DataGridColumnHeader title="Database Name" column={column} />
    ),
  },
  {
    accessorKey: "customer_name",
    header: ({ column }) => (
      <DataGridColumnHeader title="Customer Name" column={column} />
    ),
  },
  {
    accessorKey: "state",
    header: ({ column }) => (
      <DataGridColumnHeader title="State" column={column} />
    ),
  },

  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          <button
            className="btn btn-sm btn-icon btn-clear"
            title="database lock"
          >
            <i className="ki-filled ki-lock text-primary"></i>
          </button>
        </div>
      );
    },
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
];

export const data = [
  {
    sr_no: 1,
    database_name: "WeddingDB_001",
    customer_name: "John Doe",
    state: "Gujarat",
  },
];
