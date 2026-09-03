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
    accessorKey: "phonenumber",
    header: <FormattedMessage id="COMMON.PHONE" defaultMessage="Phone No" />,
    meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
  },
  {
    accessorKey: "category",
    header: <FormattedMessage id="COMMON.CATEGORY" defaultMessage="Category" />,
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
   {
    accessorKey: "partyName",
    header: <FormattedMessage id="COMMON.CATEGORY" defaultMessage="Party Name" />,
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
  {
    accessorKey: "aadharcard",
    header: <FormattedMessage id="COMMON.AADHAR" defaultMessage="Aadhar Card" />,
    meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
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
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
];