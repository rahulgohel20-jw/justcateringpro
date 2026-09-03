import { DataGridColumnHeader } from "@/components";
export const columns = [
  {
    accessorKey: "Employee",
    header: ({ column }) => (
      <DataGridColumnHeader title="Roles" column={column} />
    ),
  },
  {
    accessorKey: "Status",
    header: ({ column }) => (
      <DataGridColumnHeader title="Roles" column={column} />
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ cell }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          <button className="btn btn-sm btn-icon btn-clear" title="Delete">
            <i className="ki-filled ki-trash"></i>
          </button>
        </div>
      );
    },
  },
];
export const defaultData = [];
