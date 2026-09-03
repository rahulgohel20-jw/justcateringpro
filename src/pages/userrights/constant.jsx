import { DataGridColumnHeader } from "@/components";

export const columns = (handleOpenPermission, handleOpenReportRights) => [
  {
    accessorKey: "sr_no",
    header: ({ column }) => (
      <DataGridColumnHeader title="Sr No#" column={column} />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataGridColumnHeader title="Role" column={column} />
    ),
  },
  {
    accessorKey: "created_date",
    header: ({ column }) => (
      <DataGridColumnHeader title="Created Date" column={column} />
    ),
  },
  {
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <button
          className="btn btn-primary"
          onClick={() => handleOpenPermission(row.original)}
        >
          Rights
        </button>
        <button
          className="btn btn-success"
          onClick={() => handleOpenReportRights(row.original)}
        >
          Report Rights
        </button>
      </div>
    ),
  },
];