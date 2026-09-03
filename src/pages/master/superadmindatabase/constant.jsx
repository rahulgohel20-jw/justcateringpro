import { DataGridColumnHeader } from "@/components";

export const getColumns = (onPlusClick, onAddCustomerDb, onViewDatabase) => [
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
    accessorKey: "state",
    header: ({ column }) => (
      <DataGridColumnHeader title="State" column={column} />
    ),
  },
  {
    accessorKey: "version",
    header: ({ column }) => (
      <DataGridColumnHeader title="Version" column={column} />
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
            title="View"
            onClick={() => onViewDatabase(row)}
          >
            <i className="ki-filled ki-eye text-success"></i>
          </button>

          <button
            className="btn btn-sm btn-icon btn-clear"
            title="Edit"
            onClick={() => onAddCustomerDb(row.original)}
          >
            <i className="ki-filled ki-user text-primary"></i>
          </button>

          {/* <button
            className="btn btn-sm btn-icon btn-clear"
            title="Menu Preparation"
            onClick={() => onPlusClick(row.original)}
          >
            <i className="ki-filled ki-plus text-primary"></i>
          </button> */}
        </div>
      );
    },
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
];
