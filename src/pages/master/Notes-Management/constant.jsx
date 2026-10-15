import { Tooltip } from "antd";
import { Eye, Pencil, Trash2, StickyNote } from "lucide-react";


const STATUS_STYLES = {
  pending: "badge-warning",
  running: "badge-primary",
  completed: "badge-success",
};

export const columns = (onView, onEdit, onDelete, permissions, intl) => [
  {
    accessorKey: "sr_no",
    header: intl.formatMessage({ id: "NOTES.COL.SR_NO", defaultMessage: "Sr No." }),
    meta: { headerClassName: "w-[5%]", cellClassName: "w-[5%]" },
  },
  {
    accessorKey: "title",
    header: intl.formatMessage({ id: "NOTES.COL.NOTE_TITLE", defaultMessage: "Note Title" }),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
          <StickyNote className="w-4 h-4 text-primary" />
        </div>
        <span className="font-medium text-gray-800 text-sm">{row.original.title || "—"}</span>
      </div>
    ),
    meta: { headerClassName: "w-[35%]", cellClassName: "w-[35%]" },
  },
  
  {
  accessorKey: "status",
  header: intl.formatMessage({ id: "NOTES.COL.STATUS", defaultMessage: "Status" }),
  cell: ({ row }) => {
    const status = row.original.status;
    if (!status) return <span className="text-sm text-gray-400">—</span>;

    const style = STATUS_STYLES[String(status).toLowerCase()] || "badge-secondary";
    return (
      <span className={`badge badge-sm badge-outline ${style}`}>
        {status}
      </span>
    );
  },
  meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
},
 {
  accessorKey: "action",
  header: intl.formatMessage({ id: "NOTES.COL.ACTIONS", defaultMessage: "Actions" }),
  cell: ({ row }) => (
    <div className="flex items-center gap-1">
      {onView && (
        <Tooltip
          className="cursor-pointer"
          title={intl.formatMessage({ id: "NOTES.ACTION.VIEW", defaultMessage: "View" })}
        >
          <button
            className="btn btn-sm btn-icon btn-clear"
            title="View"
            onClick={() => onView(row.original)}
          >
            <i className="ki-filled ki-eye text-success"></i>
          </button>
        </Tooltip>
      )}

      {onEdit && permissions?.edit && (
        <Tooltip
          className="cursor-pointer"
          title={intl.formatMessage({ id: "NOTES.ACTION.EDIT", defaultMessage: "Edit" })}
        >
          <button
            className="btn btn-sm btn-icon btn-clear"
            title="Edit"
            onClick={() => onEdit(row.original)}
          >
            <i className="ki-filled ki-notepad-edit text-primary"></i>
          </button>
        </Tooltip>
      )}

      {onDelete && permissions?.delete && (
        <Tooltip
          title={intl.formatMessage({ id: "NOTES.ACTION.DELETE", defaultMessage: "Delete" })}
        >
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
  meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
},
];