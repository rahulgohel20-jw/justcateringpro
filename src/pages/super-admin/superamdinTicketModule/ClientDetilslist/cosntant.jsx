import { useState } from "react";
import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";
import { Eye, MessageCircle } from "lucide-react";
import SuperAdminViewModal from "../../../../partials/modals/TicketModal/SuperAdminViewModal";
import SuperAdminNotes from "../../../../partials/modals/TicketModal/SuperAdminNotes";

const AssignCell = ({ row, onAssign, onReassign }) => {
  const { isAssigned, isCompleted } = row.original;

  if (!isAssigned && !isCompleted) {
    return (
      <button
        onClick={() => onAssign?.(row.original)}
        className="px-3 py-1 text-xs bg-primary text-white rounded-md "
      >
        Assign
      </button>
    );
  }

  if (isAssigned && !isCompleted) {
    return (
      <span className="px-3 py-1 text-xs bg-gray-200 text-gray-600 rounded-md">
        Assigned
      </span>
    );
  }

  if (isCompleted) {
    return (
      <button
        onClick={() => onReassign?.(row.original)}
        className="px-3 py-1 text-xs border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
      >
        Reassign
      </button>
    );
  }

  return null;
};

const ActionCell = ({ row }) => {
  const [viewOpen, setViewOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Tooltip title="View Issue Details">
          <button
            className="btn btn-sm btn-icon btn-clear"
            onClick={() => setViewOpen(true)}
          >
            <Eye size={18} />
          </button>
        </Tooltip>

        <Tooltip title="Add Notes">
          <button
            className="btn btn-sm btn-icon btn-clear"
            onClick={() => setNotesOpen(true)} // ✅ opens the notes modal
          >
            <MessageCircle size={18} />
          </button>
        </Tooltip>
      </div>

      {viewOpen && (
        <SuperAdminViewModal
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          issue={row.original}
        />
      )}

      {notesOpen && (
        <SuperAdminNotes
          open={notesOpen}
          onClose={() => setNotesOpen(false)}
          issue={row.original}
          onSubmit={(formData) => {
           
           
            setNotesOpen(false);
          }}
        />
      )}
    </>
  );
};
export const QUERIES_TABLE_COLUMNS_CONFIG = [
  { accessorKey: "moduleName", header: "Module Name" },
  { accessorKey: "Department", header: "Department" },
  { accessorKey: "Assigned to", header: "Assigned to" },
  { accessorKey: "priority", header: "Priority" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "From To ", header: "From To" },
  { accessorKey: "To date", header: "To Date" },
  { accessorKey: "time", header: "Expected Time" },
];

export const getQueriesTableColumnsConfig = ({ onAssign, onReassign } = {}) => [
  ...QUERIES_TABLE_COLUMNS_CONFIG,

  // ✅ Assign Column
  {
    accessorKey: "assign",
    header: "Assign",
    cell: ({ row }) => (
      <AssignCell row={row} onAssign={onAssign} onReassign={onReassign} />
    ),
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },

  // ✅ Actions Column
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
    cell: ({ row }) => <ActionCell row={row} />,
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
];
