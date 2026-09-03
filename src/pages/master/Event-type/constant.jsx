import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, permissions = {}) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No" />,
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "event_type",
    header: (
      <FormattedMessage id="USER.MASTER.EVENT_TYPE" defaultMessage="Name" />
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },

  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center  gap-1">
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
                onClick={() => onDelete(row.original.eventid)}
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

export const defaultData = [
  { sr_no: 1, event_type: "Friend" },
  { sr_no: 2, event_type: "Colleague" },
  { sr_no: 3, event_type: "Relative" },
  { sr_no: 4, event_type: "Business Manager" },
  { sr_no: 5, event_type: "Friend" },
  { sr_no: 6, event_type: "Friend" },
  { sr_no: 7, event_type: "Colleague" },
  { sr_no: 8, event_type: "Sales Man" },
];
