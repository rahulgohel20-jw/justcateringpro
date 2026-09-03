import { Popconfirm, Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, permissions = {}) => [
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
      <FormattedMessage id="TABLE.SHIFT_NAME" defaultMessage="Shift name" />
    ),
    meta: {
      headerClassName: "w-[25%]",
      cellClassName: "w-[25%]",
    },
  },
  {
    accessorKey: "shift_time",
    header: (
      <FormattedMessage id="TABLE.SHIFT_TIME" defaultMessage="Shift Time" />
    ),
    meta: {
      headerClassName: "w-[30%]",
      cellClassName: "w-[30%]",
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
        >
          <label className="switch switch-lg">
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
    shift_name: "Morning",
    shift_time: "08:00 AM - 12:00 PM",
    isActive: true,
  },
  {
    id: 2,
    sr_no: 2,
    shift_name: "Afternoon",
    shift_time: "12:00 PM - 04:00 PM",
    isActive: true,
  },
  {
    id: 3,
    sr_no: 3,
    shift_name: "Evening",
    shift_time: "04:00 PM - 08:00 PM",
    isActive: false,
  },
  {
    id: 4,
    sr_no: 4,
    shift_name: "Night",
    shift_time: "08:00 PM - 12:00 AM",
    isActive: true,
  },
];
