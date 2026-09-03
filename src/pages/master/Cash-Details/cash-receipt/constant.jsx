import { FormattedMessage } from "react-intl";
import { Tooltip } from "antd";

// ── Cash Receipt Columns ──────────────────────────────────────────────────────
export const cashReceiptColumns = (onAction, permissions) => [
  {
    id: "srNo",
    header: "SR NO.",
    cell: ({ row }) => row.index + 1,
  },
  {
    id: "voucherNo",
    header: "Voucher No",
    accessorKey: "voucherNo",
    cell: ({ row }) => (
      <span className="font-semibold text-primary font-mono text-sm">
        {row.original.voucherNo || "—"}
      </span>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    id: "date",
    header: "Date",
    accessorKey: "date",
    cell: ({ row }) => (
      <span className="text-gray-500 text-sm">{row.original.date || "—"}</span>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
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
    cell: ({ row }) => (
      <span className="px-2 py-0.5 text-xs rounded font-semibold bg-green-100 text-green-700">
        {row.original.cashType?.accountName || "—"}
      </span>
    ),
    meta: { headerClassName: "w-[13%]", cellClassName: "w-[13%]" },
  },
  {
    id: "amount",
    header: "Amount (₹)",
    accessorKey: "amount",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900 font-mono">
        ₹ {row.original.amount?.toLocaleString("en-IN") || 0}
      </span>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    id: "incomeExpenseTypeName",
    header: "Income Type",
    cell: ({ row }) => `${row.original.incomeExpenseTypeName || "—"}`,
  },
  {
    id: "referenceNo",
    header: "Reference No",
    accessorKey: "referenceNo",
    cell: ({ row }) => (
      <span className="text-gray-600 text-sm">
        {row.original.referenceNo || "—"}
      </span>
    ),
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    id: "createdAt",
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <span className="text-gray-500 text-sm">
        {row.original.createdAt || "—"}
      </span>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
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
            {permissions.edit && (
              <button
                className="btn btn-sm btn-icon btn-clear"
                onClick={() =>
                  !isInvoicePayment && onAction(row.original, "edit")
                }
                disabled={isInvoicePayment}
                style={{
                  opacity: isInvoicePayment ? 0.3 : 1,
                  cursor: isInvoicePayment ? "not-allowed" : "pointer",
                }}
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
                onClick={() =>
                  !isInvoicePayment && onAction(row.original, "delete")
                }
                disabled={isInvoicePayment}
                style={{
                  opacity: isInvoicePayment ? 0.3 : 1,
                  cursor: isInvoicePayment ? "not-allowed" : "pointer",
                }}
              >
                <i className="ki-filled ki-trash text-red-400 hover:text-red-600"></i>
              </button>
            )}
          </Tooltip>
        </div>
      );
    },
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
];

// ── Bank Receipt Columns ──────────────────────────────────────────────────────
export const bankReceiptColumns = (onAction) => [
  {
    id: "voucherNo",
    header: "Voucher No",
    accessorKey: "voucherNo",
    cell: ({ row }) => (
      <span className="font-semibold text-primary font-mono text-sm">
        {row.original.voucherNo || "—"}
      </span>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    id: "date",
    header: "Date",
    accessorKey: "date",
    cell: ({ row }) => (
      <span className="text-gray-500 text-sm">{row.original.date || "—"}</span>
    ),
    meta: { headerClassName: "w-[9%]", cellClassName: "w-[9%]" },
  },
  {
    id: "partyName",
    header: "Party",
    accessorKey: "partyName",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <i className="ki-filled ki-user text-primary text-sm"></i>
        </div>
        <span className="font-semibold text-gray-900 text-sm">
          {row.original.partyName || "—"}
        </span>
      </div>
    ),
    meta: { headerClassName: "w-[13%]", cellClassName: "w-[13%]" },
  },
  {
    id: "bankName",
    header: "Bank",
    cell: ({ row }) => (
      <span className="px-2 py-0.5 text-xs rounded font-semibold bg-blue-100 text-blue-700">
        {row.original.bankDetails?.bankName || "—"}
      </span>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    id: "accountNo",
    header: "Account No",
    cell: ({ row }) => (
      <span className="text-gray-600 text-sm font-mono">
        {row.original.bankDetails?.accountNo || "—"}
      </span>
    ),
    meta: { headerClassName: "w-[11%]", cellClassName: "w-[11%]" },
  },
  {
    id: "paymentMode",
    header: "Payment Mode",
    accessorKey: "paymentMode",
    cell: ({ row }) => {
      const modeColors = {
        UPI: "bg-purple-100 text-purple-700",
        CHEQUE: "bg-yellow-100 text-yellow-700",
        BANK_TRANSFER: "bg-blue-100 text-blue-700",
        IMPS_NEFT: "bg-green-100 text-green-700",
      };
      const mode = row.original.paymentMode || "";
      return (
        <span
          className={`px-2 py-0.5 text-xs rounded font-semibold ${modeColors[mode] || "bg-gray-100 text-gray-600"}`}
        >
          {mode || "—"}
        </span>
      );
    },
    meta: { headerClassName: "w-[11%]", cellClassName: "w-[11%]" },
  },
  {
    id: "amount",
    header: "Amount (₹)",
    accessorKey: "amount",
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900 font-mono">
        ₹ {row.original.amount?.toLocaleString("en-IN") || 0}
      </span>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    id: "referenceNo",
    header: "Reference No",
    accessorKey: "referenceNo",
    cell: ({ row }) => (
      <span className="text-gray-600 text-sm">
        {row.original.referenceNo || "—"}
      </span>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    id: "createdAt",
    header: "Created At",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <span className="text-gray-500 text-sm">
        {row.original.createdAt || "—"}
      </span>
    ),
    meta: { headerClassName: "w-[9%]", cellClassName: "w-[9%]" },
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
              onClick={() =>
                !isInvoicePayment && onAction(row.original, "edit")
              }
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
                !isInvoicePayment && onAction(row.original, "delete")
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
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
];
