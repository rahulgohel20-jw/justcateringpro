import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, permissions = {}) => [
  {
    id: "srno",
    header: (
      <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No" />
    ),
    cell: ({ row }) => <span>{row.index + 1}</span>,
  },

  {
    accessorKey: "TitleName",
    header: (
      <FormattedMessage
        id="COMMON.TITLE_NAME"
        defaultMessage="Title Name"
      />
    ),
    cell: ({ row }) => <span>{row.original.TitleName}</span>,
  },

  {
    accessorKey: "type",
    header: (
      <FormattedMessage id="COMMON.TYPE" defaultMessage="Type" />
    ),
    cell: ({ row }) => <span>{row.original.type}</span>,
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
              onClick={() => onEdit(row.original)}
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
              onClick={() => onDelete(row.original)}
            >
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          )}
        </Tooltip>
      </div>
    ),
  },
];