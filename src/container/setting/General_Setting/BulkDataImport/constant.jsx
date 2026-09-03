import { DataGridColumnHeader } from "@/components";
import { Tooltip, Popconfirm } from "antd";
import { underConstruction } from "@/underConstruction";
import { Link } from "react-router-dom";
export const columns = [
  {
    accessorKey: "source",
    header: ({ column }) => (
      <DataGridColumnHeader title="Source" column={column} />
    ),
  },
  {
    accessorKey: "module_name",
    header: ({ column }) => (
      <DataGridColumnHeader title="Module" column={column} />
    ),
  },
  {
    accessorKey: "total_records",
    header: ({ column }) => (
      <DataGridColumnHeader title="No. of Records" column={column} />
    ),
  },
  {
    accessorKey: "imported_by",
    header: ({ column }) => (
      <DataGridColumnHeader title="Imported By" column={column} />
    ),
  },

  {
    accessorKey: "imported_on",
    header: ({ column }) => (
      <DataGridColumnHeader title="Imported on" column={column} />
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
              onClick={() => cell.row.original.handleEditClick()}
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
    source : 'product.doc',
    module_name : 'products',
    total_records : 'products',
    imported_by : 'KBOY',
    imported_on : '2025-08-15',
  },{
    source : 'Lead.doc',
    module_name : 'Leads',
    total_records : 'Leads',
    imported_by : 'KBOY',
    imported_on : '2025-08-20',
  },{
    source : 'contacts.doc',
    module_name : 'contacts',
    total_records : 'contacts',
    imported_by : 'KBOY',
    imported_on : '2025-08-20',
  },
];
