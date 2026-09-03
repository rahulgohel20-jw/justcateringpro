import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, permissions = {}, intl) => [
  {
    accessorKey: "accountName",
    header: <FormattedMessage id="CASH_ACCOUNT.ACCOUNT_NAME" defaultMessage="Account Name" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
          <i className="ki-filled ki-bank text-gray-600"></i>
        </div>

        <div className="flex flex-col">
          <span className="font-semibold text-gray-900">
            {row.original.accountName}
          </span>
          <span className="text-xs text-gray-500 uppercase">
            {row.original.subTitle}
          </span>
        </div>
      </div>
    ),
    meta: {
      headerClassName: "w-[25%]",
      cellClassName: "w-[25%]",
    },
  },

  {
    accessorKey: "cashType",
    header: <FormattedMessage id="CASH_ACCOUNT.CASH_TYPE" defaultMessage="Cash Type" />,
    cell: ({ row }) => (
      <div className="flex flex-col gap-1">
        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded w-fit">
          {row.original.cashType}
        </span>
      </div>
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },

  {
    accessorKey: "openingBalance",
    header: <FormattedMessage id="CASH_ACCOUNT.OPENING_BALANCE" defaultMessage="Opening Balance" />,
    cell: ({ row }) => (
      <span className="font-medium text-gray-800">
        {row.original.openingBalance}
      </span>
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },

  {
    accessorKey: "currentBalance",
    header: <FormattedMessage id="CASH_ACCOUNT.CURRENT_BALANCE" defaultMessage="Current Balance" />,
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900">
        {row.original.currentBalance}
      </span>
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "isPrimary",
    header: (
      <FormattedMessage id="BANK.PRIMARY_ACCOUNT" defaultMessage="Primary" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          {row.original.isPrimary ? (
            <span className="badge badge-sm badge-success">
              <i className="ki-filled ki-check"></i>{" "}
              <FormattedMessage id="BANK.PRIMARY_ACCOUNT" defaultMessage="Primary" />
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      );
    },
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },

  // {
  //   accessorKey: "status",
  //   header: "Status",
  //   cell: ({ row }) => (
  //     <span className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1 w-fit">
  //       <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
  //       {row.original.status || "ACTIVE"}
  //     </span>
  //   ),
  //   meta: {
  //     headerClassName: "w-[10%]",
  //     cellClassName: "w-[10%]",
  //   },
  // },

  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          {permissions.edit && (
            <Tooltip
              title={intl.formatMessage({
                id: "CASH_ACCOUNT.EDIT_TOOLTIP",
                defaultMessage: "Edit Bank Details",
              })}
            >
              <button
                className="btn btn-sm btn-icon btn-clear"
                title={intl.formatMessage({ id: "COMMON.EDIT", defaultMessage: "Edit" })}
                onClick={() => onEdit(row.original)}
              >
                <i className="ki-filled ki-notepad-edit text-primary"></i>
              </button>
            </Tooltip>
          )}
          {permissions.delete && (
            <Tooltip
              title={intl.formatMessage({
                id: "CASH_ACCOUNT.DELETE_TOOLTIP",
                defaultMessage: "Delete Cash Account",
              })}
            >
              <button
                className="btn btn-sm btn-icon btn-clear"
                onClick={() => onDelete(row.original)}
              >
                <i className="ki-filled ki-trash text-danger"></i>
              </button>
            </Tooltip>
          )}
        </div>
      );
    },
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
];