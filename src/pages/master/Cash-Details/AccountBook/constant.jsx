import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const cashColumns = (onEdit, permissions = {}) => [
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">
        {row.original.reference}
      </span>
    ),
    meta: { headerClassName: "w-[15%]" },
  },

  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-gray-700">{row.original.date}</span>
    ),
    meta: { headerClassName: "w-[12%]" },
  },

  {
    accessorKey: "particular",
    header: "Particular",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.particular}</span>
        <span className="text-xs text-gray-500">{row.original.subTitle}</span>
      </div>
    ),
    meta: { headerClassName: "w-[30%]" },
  },

  {
    accessorKey: "cashIn",
    header: "Cash In (DR)",
    cell: ({ row }) => (
      <span className="text-green-600 font-semibold">
        {row.original.cashIn ? `₹${row.original.cashIn}` : "-"}
      </span>
    ),
    meta: { headerClassName: "w-[12%]" },
  },

  {
    accessorKey: "cashOut",
    header: "Cash Out (CR)",
    cell: ({ row }) => (
      <span className="text-red-500 font-semibold">
        {row.original.cashOut ? `₹${row.original.cashOut}` : "-"}
      </span>
    ),
    meta: { headerClassName: "w-[12%]" },
  },

  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {permissions.edit && (
          <Tooltip title="Edit">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onEdit(row.original)}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
        )}
      </div>
    ),
    meta: { headerClassName: "w-[8%]" },
  },
];

export const bankColumns = (onEdit) => [
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.reference}</span>
    ),
  },

  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => <span>{row.original.date}</span>,
  },

  {
    accessorKey: "particular",
    header: "Particular",
    cell: ({ row }) => <span>{row.original.particular}</span>,
  },

  {
    accessorKey: "bankIn",
    header: "Bank In (DR)",
    cell: ({ row }) => (
      <span className="text-green-600 font-semibold">
        {row.original.bankIn ? `₹${row.original.bankIn}` : "-"}
      </span>
    ),
  },

  {
    accessorKey: "bankOut",
    header: "Bank Out (CR)",
    cell: ({ row }) => (
      <span className="text-red-500 font-semibold">
        {row.original.bankOut ? `₹${row.original.bankOut}` : "-"}
      </span>
    ),
  },

  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => (
      <span className="font-semibold">₹{row.original.balance}</span>
    ),
  },
];

export const bankAccounts = [
  { label: "HDFC Current - **** 8821", value: "hdfc_8821" },
  { label: "ICICI Savings - **** 4402", value: "icici_4402" },
  { label: "SBI Business - **** 7731", value: "sbi_7731" },
];
