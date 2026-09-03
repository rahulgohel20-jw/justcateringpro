import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const paymentColumns = (onEdit, onDelete) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No" />,
    meta: {
      headerClassName: "w-[5%]",
      cellClassName: "w-[5%]",
    },
  },
  {
    accessorKey: "paymentDate",
    header: (
      <FormattedMessage id="PAYMENT.DATE" defaultMessage="Date" />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "invoiceNo",
    header: (
      <FormattedMessage id="PAYMENT.INVOICE_NO" defaultMessage="Invoice #" />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "totalAmount",
    header: (
      <FormattedMessage id="PAYMENT.TOTAL_AMOUNT" defaultMessage="Total Amount" />
    ),
    cell: ({ row }) => `₹ ${row.original.totalAmount.toFixed(2)}`,
    meta: {
      headerClassName: "w-[13%]",
      cellClassName: "w-[13%]",
    },
  },
  {
    accessorKey: "paymentMode",
    header: (
      <FormattedMessage id="PAYMENT.PAYMENT_MODE" defaultMessage="Payment Mode" />
    ),
    meta: {
      headerClassName: "w-[13%]",
      cellClassName: "w-[13%]",
    },
  },
  {
    accessorKey: "reference",
    header: (
      <FormattedMessage id="PAYMENT.REFERENCE" defaultMessage="Reference" />
    ),
    meta: {
      headerClassName: "w-[13%]",
      cellClassName: "w-[13%]",
    },
  },
  {
    accessorKey: "dueAmount",
    header: (
      <FormattedMessage id="PAYMENT.DUE_AMOUNT" defaultMessage="Due Amount" />
    ),
    cell: ({ row }) => (
      <span className={row.original.dueAmount > 0 ? "text-red-600 font-medium" : "text-green-600"}>
        ₹ {row.original.dueAmount.toFixed(2)}
      </span>
    ),
    meta: {
      headerClassName: "w-[13%]",
      cellClassName: "w-[13%]",
    },
  },
  {
    accessorKey: "status",
    header: (
      <FormattedMessage id="PAYMENT.STATUS" defaultMessage="Status" />
    ),
    cell: ({ row }) => {
      const getStatusColor = (status) => {
        switch (status) {
          case "confirm":
            return "bg-green-100 text-green-700";
          case "pending":
            return "bg-yellow-100 text-yellow-700";
          case "Draft":
            return "bg-gray-100 text-gray-700";
          default:
            return "bg-blue-100 text-blue-700";
        }
      };

      return (
        <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(row.original.status)}`}>
          {row.original.status}
        </span>
      );
    },
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <Tooltip title="Edit Payment">
            <button
              className="btn btn-sm btn-icon btn-clear"
              title="Edit"
              onClick={() => onEdit(row.original)}
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
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
        </div>
      );
    },
    meta: {
      headerClassName: "w-[9%]",
      cellClassName: "w-[9%]",
    },
  },
];