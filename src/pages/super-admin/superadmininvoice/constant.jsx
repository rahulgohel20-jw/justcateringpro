import { DataGridColumnHeader } from "@/components";
import { Link } from "react-router-dom";
import { Tooltip } from "antd";

const StatusBadge = ({ status }) => {
  const s = status?.toLowerCase();

  const config = {
    pending: {
      label: "Pending",
      className: "text-yellow-700 bg-yellow-50 border-yellow-200",
    },
    confirm: {
      label: "Confirm",
      className: "text-green-600 bg-green-50 border-green-200",
    },
    advance: {
      label: "Advance",
      className: "text-blue-600 bg-blue-50 border-blue-200",
    },
    paid: {
      label: "Paid",
      className: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    overdue: {
      label: "Overdue",
      className: "text-red-600 bg-red-50 border-red-200",
    },
    cancelled: {
      label: "Cancelled",
      className: "text-gray-500 bg-gray-100 border-gray-200",
    },
    partial: {
      label: "Partial",
      className: "text-orange-600 bg-orange-50 border-orange-200",
    },
  };

  const match = config[s] ?? {
    label: status || "Unknown",
    className: "text-gray-600 bg-gray-50 border-gray-200",
  };

  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap border ${match.className}`}
    >
      {match.label}
    </span>
  );
};

export const columns = (onDelete, onRecordPayment, onView, permissions) => [
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
    meta: { headerClassName: "w-[2%]", cellClassName: "w-[2%]" },
  },
  {
    accessorKey: "billingName",
    header: ({ column }) => (
      <DataGridColumnHeader title="Company Name" column={column} />
    ),
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "invoiceDate",
    header: ({ column }) => (
      <DataGridColumnHeader title="Invoice Date" column={column} />
    ),
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "plan",
    header: ({ column }) => (
      <DataGridColumnHeader title="Items" column={column} />
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "TotalAmount",
    header: ({ column }) => (
      <DataGridColumnHeader title="Total Amount" column={column} />
    ),
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },

  {
    accessorKey: "paidamount",
    header: ({ column }) => (
      <DataGridColumnHeader title="Total Paid" column={column} />
    ),
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "BalanceDue",
    header: ({ column }) => (
      <DataGridColumnHeader title="Remaining" column={column} />
    ),
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "DueDate",
    header: ({ column }) => (
      <DataGridColumnHeader title="Due Date" column={column} />
    ),
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataGridColumnHeader title="Status" column={column} />
    ),
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },

    cell: ({ row }) => <StatusBadge status={row.original?.status} />,
  },
  {
    header: "Action",
    accessorKey: "action",
    cell: ({ row }) => {
      const id = row.original?.id;

      return (
        <div className="flex gap-2">
          {/* View Button */}
          {permissions.view && (
            <Tooltip title="View Invoice">
              <Link to={`/super/invoice-preview/${id}`}>
                <button className="btn btn-sm btn-icon text-primary">
                  <i className="ki-filled ki-eye text-purple-700"></i>
                </button>
              </Link>
            </Tooltip>
          )}
          <Tooltip title="Record Payment">
            {permissions.edit && (
              <button
                className="btn btn-sm btn-icon text-success"
                onClick={() => onRecordPayment(row.original)}
              >
                <i className="ki-filled ki-abstract-10 text-green-600"></i>
              </button>
            )}
          </Tooltip>

          {/* Edit Button (opens Add Invoice with invoice id) */}

          <Tooltip title="Edit Invoice">
            <Link to={`/addInvoice?id=${id}`}>
              {permissions.edit && (
                <button className="btn btn-sm btn-icon text-success">
                  <i className="ki-filled ki-pencil text-green-600"></i>
                </button>
              )}
            </Link>
          </Tooltip>
          <Tooltip title="Delete Invoice">
            {permissions.delete && (
              <button onClick={() => onDelete(row.original?.id)}>
                <i className="ki-filled ki-trash text-red-600"></i>
              </button>
            )}
          </Tooltip>

          <Tooltip title="View Document">
            {permissions.view && (
              <button
                onClick={() => onView(row.original?.docPath)}
                className="btn btn-sm btn-icon"
                disabled={!row.original?.docPath}
              >
                <i
                  className={`ki-filled ki-document text-blue-500 ${!row.original?.docPath ? "opacity-30" : ""}`}
                ></i>
              </button>
            )}
          </Tooltip>
        </div>
      );
    },
  },
];

export const currentMonthPaidColumns = (onRowClick) => [
  {
    accessorKey: "Invoice",
    header: "INVOICE NO",
    cell: ({ row }) => (
      <button
        onClick={() => onRowClick(row.original.id)}
        className="text-sm font-medium text-blue-600 hover:underline"
      >
        {row.original.Invoice}
      </button>
    ),
  },

  {
    accessorKey: "billingName",
    header: "Billing Name",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">{row.original.billingName}</span>
    ),
  },

  {
    accessorKey: "TotalAmount",
    header: "Total Amount",
    cell: ({ row }) => (
      <span className="text-sm text-gray-800">{row.original.TotalAmount}</span>
    ),
  },
  {
    accessorKey: "paidamount",
    header: "Paid Amount",
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-green-600">
        {row.original.paidamount}
      </span>
    ),
  },
  {
    accessorKey: "invoiceDate",
    header: "Invoice Date",
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">{row.original.invoiceDate}</span>
    ),
  },
];

export const defaultData = [];
