import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, permissions = {}) => [
  {
    accessorKey: "accountContactId",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No." />,
    cell: ({ row }) => <span>{row.index + 1}</span>,
    meta: {
      headerClassName: "w-[5%]",
      cellClassName: "w-[5%]",
    },
  },

  {
    accessorKey: "name",
    header: (
      <FormattedMessage
        id="COMMON.ACCOUNT_NAME"
        defaultMessage="Account Name"
      />
    ),
    cell: ({ row }) => <span>{row.original.name}</span>,
  },

  {
    accessorKey: "openingBalance",
    header: (
      <FormattedMessage
        id="COMMON.OPENING_BALANCE"
        defaultMessage="Opening Balance"
      />
    ),
    cell: ({ row }) => <span>{row.original.openingBalance}</span>,
  },

  {
    accessorKey: "currentBalance",
    header: (
      <FormattedMessage
        id="COMMON.CURRENT_BALANCE"
        defaultMessage="Current Balance"
      />
    ),
    cell: ({ row }) => <span>{row.original.currentBalance}</span>,
  },

  {
    accessorKey: "openingDate",
    header: (
      <FormattedMessage
        id="COMMON.DATE"
        defaultMessage="Date"
      />
    ),
    cell: ({ row }) => <span>{row.original.openingDate}</span>,
  },

  {
    accessorKey: "entryType",
    header: (
      <FormattedMessage
        id="COMMON.TYPE"
        defaultMessage="Type"
      />
    ),
    cell: ({ row }) => (
      <span>
        {row.original.entryType === "RECEIPT" ? (
          <FormattedMessage id="COMMON.CREDIT" defaultMessage="Credit" />
        ) : (
          <FormattedMessage id="COMMON.DEBIT" defaultMessage="Debit" />
        )}
      </span>
    ),
  },

  {
    accessorKey: "action",
    header: (
      <FormattedMessage
        id="COMMON.ACTIONS"
        defaultMessage="Actions"
      />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <Tooltip
          title={<FormattedMessage id="COMMON.EDIT" defaultMessage="Edit" />}
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
          title={<FormattedMessage id="COMMON.DELETE" defaultMessage="Delete" />}
        >
          {permissions.delete && (
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onDelete(row.original, "delete")}
            >
              <i className="ki-filled ki-trash text-red-400 hover:text-red-600"></i>
            </button>
          )}
        </Tooltip>
      </div>
    ),
  },
];