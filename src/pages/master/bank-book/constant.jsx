import { FormattedMessage } from "react-intl";

export const bankBookColumns = (permissions = {}) => [
  {
    accessorKey: "date",
    header: <FormattedMessage id="COMMON.DATE" defaultMessage="Date" />,
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-800">
          {row.original.dateDay}
        </span>
        <span className="text-xs text-gray-400">{row.original.dateMonth}</span>
      </div>
    ),
    meta: { headerClassName: "w-[9%]", cellClassName: "w-[9%]" },
  },
  {
    accessorKey: "referenceUtr",
    header: (
      <FormattedMessage
        id="COMMON.VOUCHER_NO"
        defaultMessage="Voucher No."
      />
    ),
    cell: ({ row }) => (
      <span className="text-xs text-blue-500 font-mono">
        {row.original.referenceUtr}
      </span>
    ),
    meta: { headerClassName: "w-[14%]", cellClassName: "w-[14%]" },
  },
  {
    accessorKey: "particulars",
    header: (
      <FormattedMessage
        id="COMMON.PARTICULARS"
        defaultMessage="Particulars"
      />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-gray-900">
          {row.original.particulars}
        </span>
        <span className="text-xs text-gray-400">
          {row.original.description}
        </span>
      </div>
    ),
    meta: { headerClassName: "w-[26%]", cellClassName: "w-[26%]" },
  },
  {
    accessorKey: "bankIn",
    header: (
      <FormattedMessage
        id="COMMON.BANK_IN_DR"
        defaultMessage="Bank In (DR)"
      />
    ),
    cell: ({ row }) =>
      row.original.bankIn ? (
        <span className="text-sm font-semibold text-green-600">
          ₹{row.original.bankIn}
        </span>
      ) : (
        <span className="text-gray-300 text-sm">—</span>
      ),
    meta: { headerClassName: "w-[13%]", cellClassName: "w-[13%]" },
  },
  {
    accessorKey: "bankOut",
    header: (
      <FormattedMessage
        id="COMMON.BANK_OUT_CR"
        defaultMessage="Bank Out (CR)"
      />
    ),
    cell: ({ row }) =>
      row.original.bankOut ? (
        <span className="text-sm font-semibold text-red-500">
          ₹{row.original.bankOut}
        </span>
      ) : (
        <span className="text-gray-300 text-sm">—</span>
      ),
    meta: { headerClassName: "w-[13%]", cellClassName: "w-[13%]" },
  },
  {
    accessorKey: "balance",
    header: (
      <FormattedMessage
        id="COMMON.BALANCE"
        defaultMessage="Balance"
      />
    ),
    cell: ({ row }) =>
      row.original.balance ? (
        <span className="text-sm font-semibold text-gray-900">
          ₹{row.original.balance}
        </span>
      ) : (
        <span className="text-gray-300 text-sm">—</span>
      ),
    meta: { headerClassName: "w-[13%]", cellClassName: "w-[13%]" },
  },
];

export const bankAccounts = [
  {
    label: <FormattedMessage id="COMMON.HDFC_CURRENT_8821" defaultMessage="HDFC Current - **** 8821" />,
    value: "hdfc_8821",
    bankAccountId: 1,
  },
  {
    label: <FormattedMessage id="COMMON.ICICI_SAVINGS_4402" defaultMessage="ICICI Savings - **** 4402" />,
    value: "icici_4402",
    bankAccountId: 2,
  },
  {
    label: <FormattedMessage id="COMMON.SBI_BUSINESS_7731" defaultMessage="SBI Business - **** 7731" />,
    value: "sbi_7731",
    bankAccountId: 3,
  },
];