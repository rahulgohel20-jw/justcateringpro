import { Popconfirm, Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, onStatusChange, permissions = {}) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No" />,
    meta: {
      headerClassName: "w-[5%]",
      cellClassName: "w-[5%]",
    },
  },
  {
    accessorKey: "shift_name",
    header: (
      <FormattedMessage
        id="TABLE.BANQUET_SHIFT_NAME"
        defaultMessage="Shift Name"
      />
    ),
    meta: {
      headerClassName: "w-[25%]",
      cellClassName: "w-[25%]",
    },
  },
  {
    accessorKey: "start_time",
    header: (
      <FormattedMessage
        id="TABLE.BANQUET_START_TIME"
        defaultMessage="Start Time"
      />
    ),
    meta: {
      headerClassName: "w-[20%]",
      cellClassName: "w-[20%]",
    },
  },
  {
    accessorKey: "end_time",
    header: (
      <FormattedMessage
        id="TABLE.BANQUET_END_TIME"
        defaultMessage="End Time"
      />
    ),
    meta: {
      headerClassName: "w-[20%]",
      cellClassName: "w-[20%]",
    },
  },
  {
    accessorKey: "isActive",
    header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Popconfirm
          title="Are you sure to change this status?"
          okText="Yes"
          cancelText="No"
          onConfirm={() => onStatusChange(row.original.id)}
        >
          <label className="switch switch-lg" style={{ cursor: "pointer" }}>
            <input type="checkbox" readOnly checked={row.original.isActive} />
          </label>
        </Popconfirm>
      </div>
    ),
    meta: {
      headerClassName: "w-[15%]",
      cellClassName: "w-[15%]",
    },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
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
    meta: {
      headerClassName: "w-[15%]",
      cellClassName: "w-[15%]",
    },
  },
];

// Optional: default data for testing
export const defaultData = [
  {
    id: 1,
    sr_no: 1,
    shift_name: "Morning Banquet",
    start_time: "08:00",
    end_time: "12:00",
    isActive: true,
  },
  {
    id: 2,
    sr_no: 2,
    shift_name: "Afternoon Banquet",
    start_time: "12:00",
    end_time: "16:00",
    isActive: true,
  },
  {
    id: 3,
    sr_no: 3,
    shift_name: "Evening Banquet",
    start_time: "16:00",
    end_time: "20:00",
    isActive: false,
  },
  {
    id: 4,
    sr_no: 4,
    shift_name: "Night Banquet",
    start_time: "20:00",
    end_time: "00:00",
    isActive: true,
  },
];