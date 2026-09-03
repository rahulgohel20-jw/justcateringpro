import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, permissions) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No#" />,
    meta: {
      headerClassName: "w-[6%]",
      cellClassName: "w-[6%]",
    },
  },
  {
    accessorKey: "coupenCode",
    header: (
      <FormattedMessage
        id="USER.MASTER.COUPON_CODE"
        defaultMessage="Coupon Code"
      />
    ),
    meta: {
      headerClassName: "w-[15%]",
      cellClassName: "w-[15%]",
    },
  },
  {
    accessorKey: "coupenName",
    header: (
      <FormattedMessage
        id="USER.MASTER.COUPON_NAME"
        defaultMessage="Coupon Name"
      />
    ),
    meta: {
      headerClassName: "w-[20%]",
      cellClassName: "w-[20%]",
    },
  },
  {
    accessorKey: "expireDate",
    header: (
      <FormattedMessage
        id="USER.MASTER.EXPIRE_DATE"
        defaultMessage="Expire Date"
      />
    ),
    cell: ({ row }) => {
      const date = row.original.expireDate;
      if (!date) return "-";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    meta: {
      headerClassName: "w-[15%]",
      cellClassName: "w-[15%]",
    },
  },
  {
    accessorKey: "maxUser",
    header: (
      <FormattedMessage id="USER.MASTER.MAX_USER" defaultMessage="Max User" />
    ),
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
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
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          {permissions.edit && (
            <Tooltip className="cursor-pointer" title="Edit Coupon">
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
