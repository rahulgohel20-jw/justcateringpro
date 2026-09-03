import { FormattedMessage } from "react-intl";
import { Tooltip } from "antd";

export const columns = (onEdit, onDelete, permissions = {}) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No" />,
    meta: { headerClassName: "w-[5%]", cellClassName: "w-[5%]" },
  },
  {
    accessorKey: "name",
    header: <FormattedMessage id="COMMON.NAME" defaultMessage="Name" />,
    meta: { headerClassName: "w-[25%]", cellClassName: "w-[25%]" },
  },
  {
    accessorKey: "contactNo",
    header: (
      <FormattedMessage id="COMMON.CONTACT_NO" defaultMessage="Contact No" />
    ),
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
  {
    accessorKey: "email",
    header: <FormattedMessage id="COMMON.EMAIL" defaultMessage="Email" />,
    meta: { headerClassName: "w-[25%]", cellClassName: "w-[25%]" },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
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
        {permissions.delete && (
          <Tooltip title="Delete">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onDelete(row.original.id)}
            >
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
        )}
      </div>
    ),
  },
];