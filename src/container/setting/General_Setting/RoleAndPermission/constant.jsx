import { DataGridColumnHeader } from "@/components";
import { Tooltip, Popconfirm } from "antd";
import { underConstruction } from "@/underConstruction";
export const columns = [
  {
    accessorKey: "role",
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
          <Tooltip title="Edit">
            <button
              className="btn btn-sm btn-icon btn-clear"
              title="Edit"
              onClick={() => cell.row.original.handleModalOpen()}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
          <Popconfirm
              title="Are you sure to delete this item?"
              onConfirm={() => underConstruction()
              }
              onCancel={() => console.log('Cancelled')}
              okText="Yes"
              cancelText="No"
            >
          <Tooltip title="Delete">
            <button className="btn btn-sm btn-icon btn-clear" title="Delete">
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
          </Popconfirm>
        </div>
      );
    },
  },
];
export const defaultData = [
  {
    role: "Developer",
  },
  {
    role: "Designer",
  },
  {
    role: "Project Manager",
  },
  {
    role: "Tester",
  },
];
