import { FormattedMessage } from "react-intl";
import { Tooltip } from "antd";

export const cashReceiptColumns = (onEdit) => [
  {
    id: "voucherNo",
    header: "Voucher No",
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
    header: "Cash Account",
    cell: ({ row }) => row.original.cashType?.accountName || "—",
  },
  {
    id: "icomeExpenseTpye",
    header: "Income Type",
    cell: ({ row }) => `${row.original.incomeExpenseType?.typeName || "—"}`,
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
    cell: ({ row }) => {
      const isInvoicePayment = row.original.source === "INVOICE PAYMENT";
      return (
        <div className="flex items-center gap-1">
          <Tooltip
            title={
              <FormattedMessage
                id="COMMON.EDIT"
                defaultMessage="Edit Receipt"
              />
            }
          >
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => !isInvoicePayment && onEdit(row.original, "edit")}
              disabled={isInvoicePayment}
              style={{
                opacity: isInvoicePayment ? 0.3 : 1,
                cursor: isInvoicePayment ? "not-allowed" : "pointer",
              }}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>

          <Tooltip
            title={
              <FormattedMessage id="COMMON.DELETE" defaultMessage="Delete" />
            }
          >
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() =>
                !isInvoicePayment && onEdit(row.original, "delete")
              }
              disabled={isInvoicePayment}
              style={{
                opacity: isInvoicePayment ? 0.3 : 1,
                cursor: isInvoicePayment ? "not-allowed" : "pointer",
              }}
            >
              <i className="ki-filled ki-trash text-red-400 hover:text-red-600"></i>
            </button>
          </Tooltip>
        </div>
      );
    },
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
];

export const bankReceiptColumns = (onEdit) => [
  {
    id: "voucherNo",
    header: "Voucher No",
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
    header: "Party Name",
    accessorKey: "partyName",
  },
  {
    id: "bankName",
    header: "Bank",
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
    cell: ({ row }) => {
      const isInvoicePayment = row.original.source === "INVOICE PAYMENT";
      return (
        <div className="flex items-center gap-1">
          <Tooltip
            title={
              <FormattedMessage
                id="COMMON.EDIT"
                defaultMessage="Edit Receipt"
              />
            }
          >
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => !isInvoicePayment && onEdit(row.original, "edit")}
              disabled={isInvoicePayment}
              style={{
                opacity: isInvoicePayment ? 0.3 : 1,
                cursor: isInvoicePayment ? "not-allowed" : "pointer",
              }}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>

          <Tooltip
            title={
              <FormattedMessage id="COMMON.DELETE" defaultMessage="Delete" />
            }
          >
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() =>
                !isInvoicePayment && onEdit(row.original, "delete")
              }
              disabled={isInvoicePayment}
              style={{
                opacity: isInvoicePayment ? 0.3 : 1,
                cursor: isInvoicePayment ? "not-allowed" : "pointer",
              }}
            >
              <i className="ki-filled ki-trash text-red-400 hover:text-red-600"></i>
            </button>
          </Tooltip>
        </div>
      );
    },
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
];
