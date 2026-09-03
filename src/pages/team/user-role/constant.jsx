import { DataGridColumnHeader } from "@/components";
import { Tooltip } from "antd";
import { EyeIcon, KeySquareIcon } from "lucide-react";
export const columns = [
  {
    accessorKey: "role_name",
    header: ({ column }) => (
      <DataGridColumnHeader title="Role" column={column} />
    ),
  },
  {
    accessorKey: "access",
    header: ({ column }) => (
      <DataGridColumnHeader title="Access" column={column} />
    ),
  },
  {
    accessorKey: "users",

    header: ({ column }) => (
      <DataGridColumnHeader title="Users" column={column} />
    ),
    cell: ({ cell }) => {
      return (
        <div className="flex items-center gap-2">
          <EyeIcon className="h-4 w-4 text-gray-500 hover:text-gray-700 cursor-pointer" />
          <span>{cell.getValue()}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ cell }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="Edit">
            <button
              className="btn btn-sm btn-icon btn-clear"
              title="Edit"
              onClick={() =>
                cell.row.original.handleEditClick(cell.row.original)
              }
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
          <Tooltip title="Delete">
            <button
              className="btn btn-sm btn-icon btn-clear"
              title="Delete"
              onClick={() =>
                cell.row.original.removeRole(cell.row.original.role_id)
              }
            >
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
        </div>
      );
    },
  },
];
export const defaultData = [
  {
    role: "Developer",
    access: "Task Management",
    users: "2",
  },
  {
    role: "Designer",
    access: "Design System",
    users: "1",
  },
  {
    role: "Project Manager",
    access: "Reports",
    users: "1",
  },
  {
    role: "Tester",
    access: "Bug Tracking",
    users: "2",
  },
];
