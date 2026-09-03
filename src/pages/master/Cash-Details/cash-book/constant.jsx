import { FormattedMessage } from "react-intl";
export const cashBookColumns = (permissions = {}) => [
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
    ),    cell: ({ row }) => (
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
    ),    cell: ({ row }) => (
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
    accessorKey: "cashIn",
  header: (
      <FormattedMessage
        id="COMMON.CASH_IN_DR"
        defaultMessage="Cash In (DR)"
      />
    ),    cell: ({ row }) =>
      row.original.cashIn ? (
        <span className="text-sm font-semibold text-green-600">
          ₹{row.original.cashIn}
        </span>
      ) : (
        <span className="text-gray-300 text-sm">—</span>
      ),
    meta: { headerClassName: "w-[13%]", cellClassName: "w-[13%]" },
  },
  {
    accessorKey: "cashOut",
 header: (
      <FormattedMessage
        id="COMMON.CASH_OUT_CR"
        defaultMessage="Cash Out (CR)"
      />
    ),    cell: ({ row }) =>
      row.original.cashOut ? (
        <span className="text-sm font-semibold text-red-500">
          ₹{row.original.cashOut}
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
    ),    cell: ({ row }) =>
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

export const pageTotals = {
  cashIn: "0.00",
  cashOut: "0.00",
  balance: "0.00",
};

// Add cashAccountId to match your backend IDs
export const cashAccounts = [
  {     label: <FormattedMessage id="COMMON.MAIN_CASH_ACCOUNT" defaultMessage="Main Cash Account" />,value: "cash_main", cashAccountId: 1 },
  { label: <FormattedMessage id="COMMON.PETTY_CASH" defaultMessage="Petty Cash" />, value: "cash_petty", cashAccountId: 2 },
  { label: <FormattedMessage id="COMMON.BRANCH_CASH" defaultMessage="Branch Cash" />, value: "cash_branch", cashAccountId: 3 },
];
