import { Switch } from "@/components/ui/switch";
import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";
 
export const columns = (
  onEdit,
  onDelete,
  onStatusChange,
  permissions = {},
  onViewPdf,
) => [
  {
    id: "sr_no",
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No" />,
    size: 60,
  },
  {
    id: "package_name",
    accessorKey: "package_name",
    header: (
      <FormattedMessage id="USER.MASTER.EVENT_TYPE" defaultMessage="Name" />
    ),
    size: 200,
  },
  {
    id: "price",
    accessorKey: "price",
    header: <FormattedMessage id="PACKAGE.PRICE" defaultMessage="Price" />,
    size: 120,
    cell: ({ getValue }) => <span>₹{getValue() ?? 0}</span>,
  },
  {
    id: "total_items",
    accessorKey: "total_items",
    header: (
      <FormattedMessage id="PACKAGE.TOTAL_ITEMS" defaultMessage="Total Item" />
    ),
    size: 140,
  },
  {
    id: "isActive",
    accessorKey: "isActive",
    header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
    size: 120,
    cell: ({ row }) => (
      <Switch
        checked={!!row.original.isActive}
        onCheckedChange={(checked) =>
          onStatusChange(row.original.packageid, checked ? 1 : 0)
        }
      />
    ),
  },
  {
    id: "action",
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => {
      const packageId = row.original.packageid;
 
      return (
        <div className="flex items-center gap-1">
          {permissions.edit && (
            <Tooltip className="cursor-pointer" title="Edit Package">
              <button
                className="btn btn-sm btn-icon btn-clear"
                title="Edit"
                onClick={() => {
                  if (packageId === undefined || packageId === null) {
                    console.error("❌ Package ID is undefined/null!");
                    return;
                  }
                  onEdit(packageId);
                }}
              >
                <i className="ki-filled ki-notepad-edit text-primary"></i>
              </button>
            </Tooltip>
          )}
 
          <Tooltip title="View PDF">
            <button
              className="btn btn-sm btn-icon btn-clear"
              title="View PDF"
              onClick={() => {
                if (packageId === undefined || packageId === null) {
                  console.error("❌ Package ID is undefined/null!");
                  return;
                }
                onViewPdf(packageId);
              }}
            >
              <i className="ki-filled ki-file-down text-success"></i>
            </button>
          </Tooltip>
 
          {permissions.delete && (
            <Tooltip title="Delete">
              <button
                className="btn btn-sm btn-icon btn-clear"
                title="Delete"
                onClick={() => {
                  if (packageId === undefined || packageId === null) {
                    console.error("❌ Package ID is undefined/null!");
                    return;
                  }
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
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
];