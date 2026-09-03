import { Popconfirm, Tooltip } from "antd";
import { FormattedMessage } from "react-intl";
export const columns = (
  onEdit,
  onDelete,
  onStatus,
  handleView,
  permissions,
) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr. No." />,
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "imagePath",
    header: <FormattedMessage id="COMMON.IMAGE" defaultMessage="Image" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
    cell: ({ row }) => {
      return (
        <img
          src={row.original.imagePath}
          alt={row.original.nameEnglish}
          className="w-16 h-16 object-cover rounded-md border"
        />
      );
    },
  },
  {
  accessorKey: "displayName",
  header: <FormattedMessage id="COMMON.CATEGORY" defaultMessage="Name" />,
  meta: {
    headerClassName: "w-[8%]",
    cellClassName: "w-[8%]",
  },
},
  {
    accessorKey: "price",
    header: <FormattedMessage id="COMMON.PRICE" defaultMessage="Price" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "sequence",
    header: <FormattedMessage id="COMMON.PRIORITY" defaultMessage="Sequence" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "isActive",
    header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center  gap-1">
          <Popconfirm
            title="Are you sure to change this status?"
            onConfirm={() =>
              onStatus(row.original.id, row.original.isActive ? false : true)
            }
            onCancel={() => console.log("Cancelled")}
            okText="Yes"
            cancelText="No"
          >
            <label className="switch switch-lg">
              <input
                type="checkbox"
                value="1"
                name="check"
                defaultChecked={row.original.isActive}
                readOnly
                checked={row.original.isActive}
              />
            </label>
          </Popconfirm>
        </div>
      );
    },
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center  gap-1">
          {permissions.view && (
            <Tooltip className="cursor-pointer" title="View Contact">
              <button
                className="btn btn-sm btn-icon btn-clear"
                title="View"
                onClick={() => handleView(row.original)}
              >
                <i className="ki-filled ki-eye text-success"></i>
              </button>
            </Tooltip>
          )}

          {permissions.edit && (
            <Tooltip className="cursor-pointer" title="Edit Contact">
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
                <i className="ki-filled ki-trash  text-danger"></i>
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
