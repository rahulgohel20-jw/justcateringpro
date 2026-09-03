import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onDelete, onEdit) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No" />,
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "name",
    header: (
      <FormattedMessage id="USER.MASTER.MEAL_NAME" defaultMessage=" Name" />
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "price",
    header: (
      <FormattedMessage id="USER.MASTER.MEAL_PRICE" defaultMessage="Price" />
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
      const rowData = row.original;

      return (
        <div className="flex items-center justify-center gap-1">
          <Tooltip
            title={
              <FormattedMessage id="COMMON.EDIT_EVENT" defaultMessage="Edit Event" />
            }
          >
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onEdit(rowData)}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>

          <Tooltip
            title={
              <FormattedMessage id="COMMON.DELETE" defaultMessage="Delete" />
            }
          >
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onDelete(rowData.id)}
            >
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
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