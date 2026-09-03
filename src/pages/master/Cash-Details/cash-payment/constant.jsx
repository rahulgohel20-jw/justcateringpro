import { FormattedMessage } from "react-intl";
import { Tooltip } from "antd";

export const cashPaymentColumns = (onEdit, permissions) => [
  {
    id: "srNo",
    header: "SR NO.",
    cell: ({ row }) => row.index + 1,
  },
  {
    id: "voucherNo",
    header: "Payment No",
    accessorKey: "voucherNo",
    cell: ({ row }) => row.original.voucherNo || "—",
  },
  {
    id: "date",
    header: "Date",
    accessorKey: "date",
  },
  {
    id: "accountContactName",
    header: "Pay To",
    accessorKey: "accountContactName",
    cell: ({ row }) => (
      <span className="font-medium text-gray-800">
        {row.original.accountContactName || "-"}
      </span>
    ),
  },
  {
    id: "cashType",
    header: "Paid From (Cash)",
    cell: ({ row }) => row.original.cashType?.accountName || "—",
  },
  {
    id: "amount",
    header: "Amount (₹)",
    accessorKey: "amount",
    cell: ({ row }) => `₹ ${row.original.amount?.toLocaleString("en-IN") || 0}`,
  },
  {
    id: "referenceNo",
    header: "Reference No",
    accessorKey: "referenceNo",
    cell: ({ row }) => row.original.referenceNo || "—",
  },
  {
    id: "createdAt",
    header: "Created At",
    accessorKey: "createdAt",
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Tooltip
          title={
            <FormattedMessage id="COMMON.EDIT" defaultMessage="Edit Payment" />
          }
        >
          {permissions.edit && (
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onEdit(row.original, "edit")}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          )}
        </Tooltip>

        <Tooltip
          title={
            <FormattedMessage id="COMMON.DELETE" defaultMessage="Delete" />
          }
        >
          {permissions.delete && (
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onEdit(row.original, "delete")}
            >
              <i className="ki-filled ki-trash text-red-400 hover:text-red-600"></i>
            </button>
          )}
        </Tooltip>
      </div>
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
];

export const bankPaymentColumns = (onEdit) => [
  {
    id: "voucherNo",
    header: "Payment No",
    accessorKey: "voucherNo",
    cell: ({ row }) => row.original.voucherNo || "—",
  },
  {
    id: "date",
    header: "Date",
    accessorKey: "date",
  },
  {
    id: "partyName",
    header: "Pay To",
    accessorKey: "partyName",
  },
  {
    id: "bankName",
    header: "Paid From (Bank)",
    cell: ({ row }) => row.original.bankDetails?.bankName || "—",
  },
  {
    id: "accountNo",
    header: "Account No",
    cell: ({ row }) => row.original.bankDetails?.accountNo || "—",
  },
  {
    id: "paymentMode",
    header: "Payment Mode",
    accessorKey: "paymentMode",
  },
  {
    id: "amount",
    header: "Amount (₹)",
    accessorKey: "amount",
    cell: ({ row }) => `₹ ${row.original.amount?.toLocaleString("en-IN") || 0}`,
  },
  {
    id: "referenceNo",
    header: "Reference No",
    accessorKey: "referenceNo",
  },
  {
    id: "createdAt",
    header: "Created At",
    accessorKey: "createdAt",
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Tooltip
          title={
            <FormattedMessage id="COMMON.EDIT" defaultMessage="Edit Payment" />
          }
        >
          {permissions.edit && (
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onEdit(row.original, "edit")}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          )}
        </Tooltip>

        <Tooltip
          title={
            <FormattedMessage id="COMMON.DELETE" defaultMessage="Delete" />
          }
        >
          {permissions.delete && (
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onEdit(row.original, "delete")}
            >
              <i className="ki-filled ki-trash text-red-400 hover:text-red-600"></i>
            </button>
          )}
        </Tooltip>
      </div>
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
];
