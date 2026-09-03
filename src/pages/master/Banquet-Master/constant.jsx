import { Tooltip } from "antd";
import { Eye, Pencil, Trash2, Building2 } from "lucide-react";
import { FormattedMessage } from "react-intl";

export const columns = (onView, onEdit, onDelete, onToggleStatus, permissions, intl) => [
  {
    accessorKey: "sr_no",
    header: intl.formatMessage({ id: "BANQUET.COL.SR_NO", defaultMessage: "Sr No." }),
    meta: { headerClassName: "w-[4%]", cellClassName: "w-[4%]" },
  },
  {
    accessorKey: "banquetName",
    header: intl.formatMessage({ id: "BANQUET.COL.BANQUET_NAME", defaultMessage: "Banquet Name" }),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {row.original.images?.[0] ? (
          <img
            src={row.original.images[0]}
            alt=""
            className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
          />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
        )}
        <span className="font-medium text-gray-800 text-sm">{row.original.banquetName}</span>
      </div>
    ),
    meta: { headerClassName: "w-[16%]", cellClassName: "w-[16%]" },
  },
  {
    accessorKey: "capacity",
    header: intl.formatMessage({ id: "BANQUET.COL.CAPACITY", defaultMessage: "Capacity" }),
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">{row.original.capacity || "—"}</span>
    ),
    meta: { headerClassName: "w-[9%]", cellClassName: "w-[9%]" },
  },
  {
    accessorKey: "morning",
    header: intl.formatMessage({ id: "BANQUET.COL.MORNING", defaultMessage: "Morning (₹)" }),
    cell: ({ row }) => (
      <span className="text-sm">{row.original.morning ? Number(row.original.morning).toLocaleString("en-IN") : "—"}</span>
    ),
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "evening",
    header: intl.formatMessage({ id: "BANQUET.COL.EVENING", defaultMessage: "Evening (₹)" }),
    cell: ({ row }) => (
      <span className="text-sm">{row.original.evening ? Number(row.original.evening).toLocaleString("en-IN") : "—"}</span>
    ),
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "fullDay",
    header: intl.formatMessage({ id: "BANQUET.COL.FULL_DAY", defaultMessage: "Full Day (₹)" }),
    cell: ({ row }) => (
      <span className="text-sm">{row.original.fullDay ? Number(row.original.fullDay).toLocaleString("en-IN") : "—"}</span>
    ),
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "exhibition",
    header: intl.formatMessage({ id: "BANQUET.COL.EXHIBITION", defaultMessage: "Exhibition (₹)" }),
    cell: ({ row }) => (
      <span className="text-sm">{row.original.exhibition ? Number(row.original.exhibition).toLocaleString("en-IN") : "—"}</span>
    ),
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "corporate",
    header: intl.formatMessage({ id: "BANQUET.COL.CORPORATE", defaultMessage: "Corporate (₹)" }),
    cell: ({ row }) => (
      <span className="text-sm">{row.original.corporate ? Number(row.original.corporate).toLocaleString("en-IN") : "—"}</span>
    ),
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "extraPerHr",
    header: intl.formatMessage({ id: "BANQUET.COL.EXTRA_CHG_HR", defaultMessage: "Extra Chg/Hr" }),
    cell: ({ row }) => (
      <span className="text-sm">{row.original.extraPerHr ? Number(row.original.extraPerHr).toLocaleString("en-IN") : "—"}</span>
    ),
    meta: { headerClassName: "w-[7%]", cellClassName: "w-[7%]" },
  },
  {
    accessorKey: "status",
    header: intl.formatMessage({ id: "BANQUET.COL.STATUS", defaultMessage: "Status" }),
    cell: ({ row }) => {
      const active = row.original.status === "Active";
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleStatus(row.original.id, row.original.status)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${
              active ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                active ? "translate-x-4" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-xs font-semibold ${active ? "text-green-600" : "text-gray-400"}`}>
            {row.original.status}
          </span>
        </div>
      );
    },
    meta: { headerClassName: "w-[7%]", cellClassName: "w-[7%]" },
  },
  {
    accessorKey: "action",
    header: intl.formatMessage({ id: "BANQUET.COL.ACTIONS", defaultMessage: "Actions" }),
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {onView && (
          <Tooltip title={intl.formatMessage({ id: "BANQUET.ACTION.VIEW", defaultMessage: "View" })}>
            <button className="btn btn-sm btn-icon btn-clear" onClick={() => onView(row.original)}>
              <Eye className="w-4 h-4 text-primary" />
            </button>
          </Tooltip>
        )}
        {onEdit && permissions?.edit && (
          <Tooltip title={intl.formatMessage({ id: "BANQUET.ACTION.EDIT", defaultMessage: "Edit" })}>
            <button className="btn btn-sm btn-icon btn-clear" onClick={() => onEdit(row.original)}>
              <Pencil className="w-4 h-4 text-primary" />
            </button>
          </Tooltip>
        )}
        {onDelete && permissions?.delete && (
          <Tooltip title={intl.formatMessage({ id: "BANQUET.ACTION.DELETE", defaultMessage: "Delete" })}>
            <button className="btn btn-sm btn-icon btn-clear" onClick={() => onDelete(row.original.id)}>
              <Trash2 className="w-4 h-4 text-danger" />
            </button>
          </Tooltip>
        )}
      </div>
    ),
    meta: { headerClassName: "w-[9%]", cellClassName: "w-[9%]" },
  },
];