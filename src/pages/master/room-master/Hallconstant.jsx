import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, permissions = {}, onToggleStatus) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No" />,
    meta: {
      headerClassName: "w-[5%]",
      cellClassName: "w-[5%]",
    },
  },
  {
    accessorKey: "tier_label",
    header: (
      <FormattedMessage
        id="ROOM_PACKAGE.TIER_LABEL"
        defaultMessage="Tier Label"
      />
    ),
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
  {
    accessorKey: "hall_name",
    header: (
      <FormattedMessage
        id="ROOM_PACKAGE.HALL_NAME"
        defaultMessage="Hall"
      />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "package_name_english",
    header: (
      <FormattedMessage
        id="ROOM_PACKAGE.PACKAGE_NAME_ENGLISH"
        defaultMessage="Package (English)"
      />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "package_name_hindi",
    header: (
      <FormattedMessage
        id="ROOM_PACKAGE.PACKAGE_NAME_HINDI"
        defaultMessage="Package (Hindi)"
      />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "package_name_gujarati",
    header: (
      <FormattedMessage
        id="ROOM_PACKAGE.PACKAGE_NAME_GUJARATI"
        defaultMessage="Package (Gujarati)"
      />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "min_guests",
    header: (
      <FormattedMessage
        id="ROOM_PACKAGE.PAX"
        defaultMessage="Pax"
      />
    ),
    meta: {
      headerClassName: "w-[7%]",
      cellClassName: "w-[7%]",
    },
  },
  {
    accessorKey: "price",
    header: (
      <FormattedMessage
        id="COMMON.PRICE"
        defaultMessage="Price"
      />
    ),
    cell: ({ getValue }) => {
      const val = getValue();
      return val !== undefined && val !== "-"
        ? `₹ ${Number(val).toLocaleString("en-IN")}`
        : "-";
    },
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "isActive",
    header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <label className="switch switch-lg">
          <input
            type="checkbox"
            checked={row.original.isActive}
            onChange={(e) => {
              onToggleStatus(row.original.id, e.target.checked);
            }}
          />
        </label>
      </div>
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        {permissions.edit && (
          <Tooltip
            title={<FormattedMessage id="COMMON.EDIT" defaultMessage="Edit" />}
          >
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onEdit(row.original)}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
        )}

        {permissions.delete && (
          <Tooltip
            title={<FormattedMessage id="COMMON.DELETE" defaultMessage="Delete" />}
          >
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
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
];