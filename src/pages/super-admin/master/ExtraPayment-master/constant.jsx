import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, permissions) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No#" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "description",
    header: (
      <FormattedMessage
        id="USER.MASTER.DESCRIPTION"
        defaultMessage="Description"
      />
    ),
    meta: {
      headerClassName: "w-[35%]",
      cellClassName: "w-[35%]",
    },
  },
  {
    accessorKey: "name",
    header: <FormattedMessage id="USER.MASTER.NAME" defaultMessage="Name" />,
    meta: {
      headerClassName: "w-[25%]",
      cellClassName: "w-[25%]",
    },
  },
  {
    accessorKey: "price",
    header: <FormattedMessage id="USER.MASTER.PRICE" defaultMessage="Price" />,
    cell: ({ row }) => {
      return (
        <span>
          {new Intl.NumberFormat("en-US", {
            style: "decimal",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(row.original.price)}
        </span>
      );
    },
    meta: {
      headerClassName: "w-[15%]",
      cellClassName: "w-[15%]",
    },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          {permissions.edit && (
            <Tooltip className="cursor-pointer" title="Edit Payment">
              <button
                className="btn btn-sm btn-icon btn-clear"
                title="Edit"
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
                title="Delete"
                onClick={() => onDelete(row.original.id)}
              >
                <i className="ki-filled ki-trash text-danger"></i>
              </button>
            </Tooltip>
          )}
        </div>
      );
    },
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
];
