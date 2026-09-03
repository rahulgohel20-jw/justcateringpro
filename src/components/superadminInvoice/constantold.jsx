import { DataGridColumnHeader } from "@/components";
import { Link } from "react-router-dom";
import { Tooltip } from "antd";

export const columns = (onDelete, onRecordPayment) => [
  {
    accessorKey: "Invoice",
    header: ({ column }) => (
      <DataGridColumnHeader title="Invoicecode" column={column} />
    ),
    cell: ({ row }) => {
      const id = row.original?.id;

      return (
        <Link
          to={`/super/invoice-preview/${id}`}
          className="text-primary font-medium hover:underline"
        >
          {row.original?.Invoice}
        </Link>
      );
    },
  },
  {
    accessorKey: "CustomerName",
    header: ({ column }) => (
      <DataGridColumnHeader title="Customer Name" column={column} />
    ),
  },
  {
    accessorKey: "billingName",
    header: ({ column }) => (
      <DataGridColumnHeader title="Company Name" column={column} />
    ),
  },
  {
    accessorKey: "invoiceDate",
    header: ({ column }) => (
      <DataGridColumnHeader title="Invoice Date" column={column} />
    ),
  },
  {
    accessorKey: "plan",
    header: ({ column }) => (
      <DataGridColumnHeader title="Plan" column={column} />
    ),
  },
  {
    accessorKey: "TotalAmount",
    header: ({ column }) => (
      <DataGridColumnHeader title="Total Amount" column={column} />
    ),
  },

  {
    accessorKey: "paidamount",
    header: ({ column }) => (
      <DataGridColumnHeader title="Total Paid" column={column} />
    ),
  },
  {
    accessorKey: "BalanceDue",
    header: ({ column }) => (
      <DataGridColumnHeader title="Remaining" column={column} />
    ),
  },
  {
    accessorKey: "DueDate",
    header: ({ column }) => (
      <DataGridColumnHeader title="Due Date" column={column} />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataGridColumnHeader title="Status" column={column} />
    ),
  },
  {
    header: "Action",
    accessorKey: "action",
    cell: ({ row }) => {
      const id = row.original?.id;

      return (
        <div className="flex gap-2">
          {/* View Button */}
          <Tooltip title="View Invoice">
            <Link to={`/super/invoice-preview/${id}`}>
              <button className="btn btn-sm btn-icon text-primary">
                <i className="ki-filled ki-eye text-purple-700"></i>
              </button>
            </Link>
          </Tooltip>
          <Tooltip title="Record Payment">
            <button
              className="btn btn-sm btn-icon text-success"
              onClick={() => onRecordPayment(row.original)}
            >
              <i className="ki-filled ki-abstract-10 text-green-600"></i>
            </button>
          </Tooltip>

          {/* Edit Button (opens Add Invoice with invoice id) */}
          <Tooltip title="Edit Invoice">
            <Link to={`/addInvoice?id=${id}`}>
              <button className="btn btn-sm btn-icon text-success">
                <i className="ki-filled ki-pencil text-green-600"></i>
              </button>
            </Link>
          </Tooltip>
          <Tooltip title="Delete Invoice">
            <button onClick={() => onDelete(row.original?.id)}>
              <i className="ki-filled ki-trash text-red-600"></i>
            </button>
          </Tooltip>
        </div>
      );
    },
  },
];

export const defaultData = [];
