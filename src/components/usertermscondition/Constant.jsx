import { Tooltip } from "antd";
import { FormattedMessage, useIntl } from "react-intl";

export const columns = (onDelete, onEdit, intl) => [
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
      <FormattedMessage id="USER_TERMS.NAME" defaultMessage="Name" />
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "description",
    header: (
      <FormattedMessage
        id="USER_TERMS.DESCRIPTION"
        defaultMessage="Description"
      />
    ),
    cell: ({ row }) => {
      const desc = row.original.description;
      const list = Array.isArray(desc) ? desc : [];
      return (
        <ul className="list-disc pl-4 space-y-0.5">
          {list.map((d, i) => (
            <li key={i} className="text-sm text-gray-700">
              {typeof d === "object" ? d.description : d}
            </li>
          ))}
        </ul>
      );
    },
    meta: {
      headerClassName: "w-[20%]",
      cellClassName: "w-[20%]",
    },
  },
  {
    accessorKey: "isActive",
    header: (
      <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />
    ),
    cell: ({ row }) => {
      const active = row.original.isActive;
      return (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            active
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-600"
          }`}
        >
          {active ? (
            <FormattedMessage id="COMMON.ACTIVE" defaultMessage="Active" />
          ) : (
            <FormattedMessage id="COMMON.INACTIVE" defaultMessage="Inactive" />
          )}
        </span>
      );
    },
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
        <div className="flex items-center gap-1">
          <Tooltip title={intl.formatMessage({ id: "USER_TERMS.EDIT_EVENT", defaultMessage: "Edit Event" })}>
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onEdit(rowData)}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>

          <Tooltip title={intl.formatMessage({ id: "COMMON.DELETE", defaultMessage: "Delete" })}>
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