import { Switch } from "@/components/ui/switch";
import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (
  onEdit,
  onDelete,
  onStatusChange,
  permissions = {},
) => [
  {
    id: "sr_no",
    accessorKey: "sr_no",
    header: (
      <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No" />
    ),
    meta: { size: 60 },
  },
  {
    id: "package_name",
    accessorKey: "package_name",
    header: (
      <FormattedMessage id="COMMON.NAME" defaultMessage="Name" />
    ),
    meta: { size: 200 },
  },
  {
    id: "price",
    accessorKey: "price",
    header: (
      <FormattedMessage id="COMMON.PRICE" defaultMessage="Price" />
    ),
    meta: { size: 120 },
    cell: ({ getValue }) => <span>₹{getValue() ?? 0}</span>,
  },
  {
    id: "total_items",
    accessorKey: "total_items",
    header: (
      <FormattedMessage
        id="COMMON.TOTAL_ITEMS"
        defaultMessage="Total Items"
      />
    ),
    meta: { size: 140 },
  },
  {
    id: "sequence",
    accessorKey: "sequence",
    header: (
      <FormattedMessage
        id="COMMON.SEQUENCE"
        defaultMessage="Sequence"
      />
    ),
    meta: { size: 100 },
  },
  {
    id: "isActive",
    accessorKey: "isActive",
    header: (
      <FormattedMessage
        id="COMMON.STATUS"
        defaultMessage="Status"
      />
    ),
    meta: { size: 120 },
    cell: ({ row }) =>
      permissions.edit ? (
        <Switch
          checked={!!row.original.isActive}
          onCheckedChange={(checked) =>
            onStatusChange(row.original.packageid, checked ? 1 : 0)
          }
        />
      ) : (
        <span
          className={`badge ${
            row.original.isActive ? "badge-success" : "badge-danger"
          }`}
        >
          {row.original.isActive ? (
            <FormattedMessage
              id="COMMON.ACTIVE"
              defaultMessage="Active"
            />
          ) : (
            <FormattedMessage
              id="COMMON.INACTIVE"
              defaultMessage="Inactive"
            />
          )}
        </span>
      ),
  },
  {
    id: "action",
    accessorKey: "action",
    header: (
      <FormattedMessage
        id="COMMON.ACTION"
        defaultMessage="Action"
      />
    ),
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
    cell: ({ row }) => {
      const packageId = row.original.packageid;

      return (
        <div className="flex items-center gap-1">
          {permissions.edit && (
            <Tooltip
              title={
                <FormattedMessage
                  id="COMMON.EDIT_PACKAGE"
                  defaultMessage="Edit Package"
                />
              }
            >
              <button
                className="btn btn-sm btn-icon btn-clear"
                onClick={() => {
                  if (packageId == null) return;
                  onEdit(packageId);
                }}
              >
                <i className="ki-filled ki-notepad-edit text-primary"></i>
              </button>
            </Tooltip>
          )}

          {permissions.delete && (
            <Tooltip
              title={
                <FormattedMessage
                  id="COMMON.DELETE"
                  defaultMessage="Delete"
                />
              }
            >
              <button
                className="btn btn-sm btn-icon btn-clear"
                onClick={() => {
                  if (packageId == null) return;
                  onDelete(packageId);
                }}
              >
                <i className="ki-filled ki-trash text-danger"></i>
              </button>
            </Tooltip>
          )}
        </div>
      );
    },
  },
];