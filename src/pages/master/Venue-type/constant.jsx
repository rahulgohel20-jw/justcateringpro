import { Popconfirm, Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, onStatus, permissions = {}) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No#" />,
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
   {
    accessorKey: "venueImg",
    header: <FormattedMessage id="COMMON.IMAGE" defaultMessage="Image" />,
    cell: ({ row }) => {
      const img = row.original.venueImg;
      return img ? (
        <img
          src={img}
          alt={row.original.venue_type}
          className="w-12 h-12 object-cover rounded-md border border-gray-200"
        />
      ) : (
        <div className="w-12 h-12 flex items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-400 text-[10px]">
          No img
        </div>
      );
    },
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "venue_type",
    header: <FormattedMessage id="COMMON.VENUE_TYPE" defaultMessage="Name" />,
    meta: {
      headerClassName: "w-[20%]",
      cellClassName: "w-[20%]",
    },
  },

  // ✅ Status Column (Same design as your example)
  {
    accessorKey: "isActive",
    header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          <Popconfirm
            title="Are you sure you want to change status?"
            onConfirm={() =>
              onStatus(row.original.venueid, row.original.isActive)
            }
            okText="Yes"
            cancelText="No"
          >
            <label className="switch switch-lg">
              <input
                type="checkbox"
                checked={row.original.isActive}
                onChange={() => {}}
                readOnly
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

  // Actions Column
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          {permissions.edit && (
            <Tooltip title="Edit">
              <button
                className="btn btn-sm btn-icon btn-clear"
                onClick={() => onEdit(row.original)}
                title="Edit Venue Type"
              >
                <i className="ki-filled ki-notepad-edit text-primary"></i>
              </button>
            </Tooltip>
          )}
          {permissions.delete && (
            <Tooltip title="Delete">
              <button
                className="btn btn-sm btn-icon btn-clear"
                onClick={() => onDelete(row.original)}
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

// Skeleton Row (Optional)
export const defaultData = [
  { sr_no: 1, venue_type: "Loading...", venueid: 0, isActive: false },
];
