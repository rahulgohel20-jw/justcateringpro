import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

const getDisplayName = (item, locale) => {
  if (!item) return "-";

  switch (locale) {
    case "hi":
      return item.nameHindi || item.nameEnglish || "-";
    case "gu":
      return item.nameGujarati || item.nameEnglish || "-";
    default:
      return item.nameEnglish || "-";
  }
};

export const columns = (onEdit, onDelete, permissions, locale = "en") => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr. No." />,
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "name",
    header: <FormattedMessage id="COMMON.NAME" defaultMessage="Name" />,
    cell: ({ row }) => <span className="font-medium">{getDisplayName(row.original, locale)}</span>,
    meta: { headerClassName: "w-[35%]", cellClassName: "w-[35%]" },
  },
  {
    accessorKey: "nameEnglish",
    header: <FormattedMessage id="COMMON.NAME_ENGLISH" defaultMessage="English" />,
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
  {
    accessorKey: "nameGujarati",
    header: <FormattedMessage id="COMMON.NAME_GUJARATI" defaultMessage="Gujarati" />,
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
  {
    accessorKey: "nameHindi",
    header: <FormattedMessage id="COMMON.NAME_HINDI" defaultMessage="Hindi" />,
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {permissions.edit && (
          <Tooltip title="Edit">
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
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
        )}
      </div>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
];

export const defaultData = [];
