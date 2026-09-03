// Table columns for AddMenuItem (TanStack Table v8 compatible)
import { Tooltip } from "antd";
export const columns = (onEdit, onDelete) => [
  {
    id: "index",
    header: "#",
    accessorFn: (_, idx) => idx + 1, // you can use accessorFn for index
  },
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
  },

  {
    id: "weight",
    header: "Weight",
    accessorKey: "weight",
  },
  {
    id: "unit",
    header: "Unit",
    accessorKey: "unit",
  },
  {
    id: "rate",
    header: "Rate",
    accessorKey: "rate",
  },
  {
    id: "action",
    header: "Action",
    accessorKey: "action",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <Tooltip className="cursor-pointer" title="Edit Contact">
            <button
              className="btn btn-sm btn-icon btn-clear"
              title="Edit"
              onClick={() => {
                onEdit(row.original);
              }}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>

          <Tooltip title="Delete">
            <button
              className="btn btn-sm btn-icon btn-clear"
              title="Delete"
              onClick={() => onDelete(row.original.id)}
            >
              <i className="ki-filled ki-trash  text-danger"></i>
            </button>
          </Tooltip>
        </div>
      );
    },
  },
];

// Sample empty/default data for initial load
export const defaultData = [
  // Example row:
  // { name: 'Paneer Tikka', weight: '200', unit: 'gm', rate: 150 }
];
