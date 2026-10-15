import { Tooltip } from "antd";
import { Eye, Pencil, Trash2, StickyNote } from "lucide-react";
import { FormattedMessage } from "react-intl";

export const columns = (onView, onEdit, onDelete, permissions, intl) => [
  {
    accessorKey: "sr_no",
    header: intl.formatMessage({ id: "NOTES.COL.SR_NO", defaultMessage: "Sr No." }),
    meta: { headerClassName: "w-[5%]", cellClassName: "w-[5%]" },
  },
  {
    accessorKey: "moduleName",
    header: intl.formatMessage({ id: "NOTES.COL.MODULE", defaultMessage: "Module" }),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <StickyNote className="w-4 h-4 text-primary" />
        </div>
        <span className="font-medium text-gray-800 text-sm">{row.original.moduleName || "—"}</span>
      </div>
    ),
    meta: { headerClassName: "w-[14%]", cellClassName: "w-[14%]" },
  },
  {
    accessorKey: "pageName",
    header: intl.formatMessage({ id: "NOTES.COL.PAGE", defaultMessage: "Page" }),
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">{row.original.pageName || "—"}</span>
    ),
    meta: { headerClassName: "w-[14%]", cellClassName: "w-[14%]" },
  },
  {
    accessorKey: "title",
    header: intl.formatMessage({ id: "NOTES.COL.NOTE_TITLE", defaultMessage: "Note Title" }),
    cell: ({ row }) => (
      <span className="text-sm font-medium text-gray-800">{row.original.title || "—"}</span>
    ),
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
  {
    accessorKey: "createdByName",
    header: intl.formatMessage({ id: "NOTES.COL.CREATED_BY", defaultMessage: "Created By" }),
    cell: ({ row }) => (
      <span className="text-sm text-gray-700">{row.original.createdByName || "—"}</span>
    ),
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "createdAt",
    header: intl.formatMessage({ id: "NOTES.COL.CREATED_AT", defaultMessage: "Created At" }),
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">{row.original.createdAt || "—"}</span>
    ),
    meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
  },
  {
    accessorKey: "action",
    header: intl.formatMessage({ id: "NOTES.COL.ACTIONS", defaultMessage: "Actions" }),
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {onView && (
          <Tooltip title={intl.formatMessage({ id: "NOTES.ACTION.VIEW", defaultMessage: "View" })}>
            <button className="btn btn-sm btn-icon btn-clear" onClick={() => onView(row.original)}>
              <Eye className="w-4 h-4 text-primary" />
            </button>
          </Tooltip>
        )}
        {onEdit && permissions?.edit && (
          <Tooltip title={intl.formatMessage({ id: "NOTES.ACTION.EDIT", defaultMessage: "Edit" })}>
            <button className="btn btn-sm btn-icon btn-clear" onClick={() => onEdit(row.original)}>
              <Pencil className="w-4 h-4 text-primary" />
            </button>
          </Tooltip>
        )}
        {onDelete && permissions?.delete && (
          <Tooltip title={intl.formatMessage({ id: "NOTES.ACTION.DELETE", defaultMessage: "Delete" })}>
            <button className="btn btn-sm btn-icon btn-clear" onClick={() => onDelete(row.original.id)}>
              <Trash2 className="w-4 h-4 text-danger" />
            </button>
          </Tooltip>
        )}
      </div>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
];
