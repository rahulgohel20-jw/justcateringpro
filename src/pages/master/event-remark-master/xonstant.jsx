import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const EVENT_REMARK_COLUMNS = (
  handleEdit,
  handleDelete,
  permissions = {
    edit: true,
    delete: true,
  },
) => [
  {
    accessorKey: "id",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="ID" />,
    cell: ({ row, table }) => {
      const pageIndex = table.getState().pagination.pageIndex;
      const pageSize = table.getState().pagination.pageSize;
      return pageIndex * pageSize + row.index + 1;
    },
    meta: {
      headerClassName: "w-[6%]",
      cellClassName: "w-[6%]",
    },
  },

  {
    accessorKey: "nameEnglish",
    header: (
      <FormattedMessage
        id="EVENT_REMARK.NAME_ENGLISH"
        defaultMessage="English Name"
      />
    ),
    meta: {
      headerClassName: "w-[18%]",
      cellClassName: "w-[18%]",
    },
  },

  {
    accessorKey: "nameHindi",
    header: (
      <FormattedMessage
        id="EVENT_REMARK.NAME_HINDI"
        defaultMessage="Hindi Name"
      />
    ),
    meta: {
      headerClassName: "w-[18%]",
      cellClassName: "w-[18%]",
    },
  },

  {
    accessorKey: "nameGujarati",
    header: (
      <FormattedMessage
        id="EVENT_REMARK.NAME_GUJARATI"
        defaultMessage="Gujarati Name"
      />
    ),
    meta: {
      headerClassName: "w-[18%]",
      cellClassName: "w-[18%]",
    },
  },

  {
    accessorKey: "type",
    header: <FormattedMessage id="COMMON.TYPE" defaultMessage="Type" />,
   cell: ({ row }) => {
  const TYPE_LABELS = {
    pooja_room: <FormattedMessage id="EVENT_REMARK.TYPE_POOJA_ROOM" defaultMessage="Pooja Room" />,
    iron: <FormattedMessage id="EVENT_REMARK.TYPE_IRON" defaultMessage="Iron" />,
    venue: <FormattedMessage id="EVENT_REMARK.TYPE_VENUE" defaultMessage="Venue" />,
  };
  return TYPE_LABELS[row.original.type] || row.original.type || "—";
},
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },

  {
    accessorKey: "isActive",
    header: <FormattedMessage id="COMMON.ACTIVE" defaultMessage="Active" />,
    cell: ({ row }) => (
      <span
        className={`badge ${
          row.original.isActive ? "badge-success" : "badge-danger"
        }`}
      >
{row.original.isActive
  ? <FormattedMessage id="COMMON.YES" defaultMessage="Yes" />
  : <FormattedMessage id="COMMON.NO" defaultMessage="No" />}      </span>
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },

  {
    accessorKey: "isOdc",
    header: <FormattedMessage id="EVENT_REMARK.ODC" defaultMessage="ODC" />,
    cell: ({ row }) => (
      <span
        className={`badge ${
          row.original.isOdc ? "badge-success" : "badge-danger"
        }`}
      >
        {row.original.isOdc ? "Yes" : "No"}
      </span>
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },

  {
    accessorKey: "createdAt",
    header: (
      <FormattedMessage
        id="COMMON.CREATED_DATE"
        defaultMessage="Created Date"
      />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },

  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          {permissions.edit && (
<Tooltip title={<FormattedMessage id="EVENT_REMARK.EDIT_TOOLTIP" defaultMessage="Edit Event Remark" />}>              <button
                className="btn btn-sm btn-icon btn-clear"
                onClick={() => handleEdit(row.original)}
              >
                <i className="ki-filled ki-notepad-edit text-primary"></i>
              </button>
            </Tooltip>
          )}

          {permissions.delete && (
        <Tooltip title={<FormattedMessage id="EVENT_REMARK.DELETE_TOOLTIP" defaultMessage="Delete Event Remark" />}>
              <button
                className="btn btn-sm btn-icon btn-clear"
                onClick={() => handleDelete(row.original.id)}
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
