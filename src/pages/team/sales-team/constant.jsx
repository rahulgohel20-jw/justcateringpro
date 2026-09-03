import { DataGridColumnHeader } from "@/components";
import { Link } from "react-router-dom";
import { underConstruction } from "@/underConstruction";
import { Tooltip , Popconfirm} from "antd";
export const columns = [
  {
    accessorKey: "user",
    header: ({ column }) => (
      <DataGridColumnHeader title="User" column={column} />
    ),
  },
  {
    accessorKey: "mobile",
    header: ({ column }) => (
      <DataGridColumnHeader title="Mobile" column={column} />
    ),
  },
  {
    accessorKey: "report_to",
    header: ({ column }) => (
      <DataGridColumnHeader title="Report to" column={column} />
    ),
  },
  {
    accessorKey: "lead_assigned",
    header: ({ column }) => (
      <DataGridColumnHeader title="Lead Assigned" column={column} />
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => (
      <DataGridColumnHeader title="Role" column={column} />
    ),
  },

  {
    accessorKey: "action",
    header: "Action",
    cell: ({ cell }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          <Tooltip title="View">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-clear text-success"
              title="View"
              onClick={() =>  cell.row.original.handleModalShowOpen() }
            >
              <i className="ki-filled ki-eye"></i>
            </button>


          </Tooltip>
          <Tooltip title="Edit">
            <button
              className="btn btn-sm btn-icon btn-clear text-primary"
              title="Edit"
              onClick={() => cell.row.original.handleModalOpen()}
            >
              <i className="ki-filled ki-notepad-edit"></i>
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
            <button
              className="btn btn-sm btn-icon btn-clear text-danger"
              title="Delete"
            >
              <i className="ki-filled ki-trash"></i>
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
    user: "John Doe",
    mobile: "9876543210",
    report_to: "Sarah Connor",
    lead_assigned: "Marketing Campaign A",
    role: "Sales Executive",
  },
  {
    user: "Emma Watson",
    mobile: "9123456780",
    report_to: "John Smith",
    lead_assigned: "Product Inquiry",
    role: "Customer Support",
  },
  {
    user: "Liam Brown",
    mobile: "9988776655",
    report_to: "Michael Clark",
    lead_assigned: "Service Request",
    role: "Technician",
  },
  {
    user: "Sophia Green",
    mobile: "9012345678",
    report_to: "Sarah Connor",
    lead_assigned: "Subscription Upgrade",
    role: "Account Manager",
  },
  {
    user: "William Black",
    mobile: "8899776655",
    report_to: "John Smith",
    lead_assigned: "New Business Lead",
    role: "Business Development",
  },
];
