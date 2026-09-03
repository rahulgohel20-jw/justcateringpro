import { Popconfirm, Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, onStatus, permissions = {}) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr. No." />,
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "file",
    header: <FormattedMessage id="COMMON.IMAGE" defaultMessage="Image" />,
    cell: ({ row }) => {
      const imageUrl = row.original.file;

      // If no image or ends with 'null', show placeholder
      if (
        !imageUrl ||
        imageUrl.endsWith("null") ||
        imageUrl === "http://103.1.101.244:9091null"
      ) {
        return (
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
            <i className="ki-filled ki-picture text-gray-400 text-xl"></i>
          </div>
        );
      }

      return (
        <img
          src={imageUrl}
          alt={row.original.raw_material_name}
          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
        />
      );
    },
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "raw_material_name",
    header: (
      <FormattedMessage
        id="COMMON.RAW_MATERIAL_NAME"
        defaultMessage="Raw Material Name"
      />
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "raw_material_category",
    header: (
      <FormattedMessage
        id="COMMON.RAW_MATERIAL_CATEGORY"
        defaultMessage="Raw Material Category"
      />
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "unit",
    header: <FormattedMessage id="COMMON.UNIT" defaultMessage="Unit" />,
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "rate",
    header: <FormattedMessage id="COMMON.RATE" defaultMessage="Rate" />,
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "isActive",
    header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <Popconfirm
            title="Are you sure to change this status?"
            onConfirm={() =>
              onStatus(
                row.original.raw_material_id,
                row.original.isActive ? false : true,
              )
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
        <div className="flex items-center gap-1">
          {permissions.edit && (
            <Tooltip className="cursor-pointer" title="Edit Raw Material">
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
                onClick={() => onDelete(row.original.raw_material_id)}
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

export const defaultData = [];
