import { useState } from "react";
import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";
import { FileDown, Eye, UserRoundPen } from "lucide-react";
import ClientViewIssueModal from "../../../partials/modals/TicketModal/ClientViewIssueModal";

const ActionCell = ({ row, onExport, onReassign }) => {
  const [viewOpen, setViewOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-0.5">
        {/* View Issue */}
        <Tooltip title="View Issue Details">
          <button
            type="button"
            className="btn btn-sm btn-icon btn-clear"
            onClick={() => setViewOpen(true)}
          >
            <Eye size={18} />
          </button>
        </Tooltip>

        {/* Export */}

        {/* Reassign — only visible when row is completed */}
        {row.original.isCompleted && (
          <Tooltip title="Reassign Issue">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onReassign?.(row.original)}
            >
              <UserRoundPen size={18} />
            </button>
          </Tooltip>
        )}
      </div>

      {/*
        ✅ Mount only when viewOpen is true.
        This prevents modalRef.current from being undefined
        on the initial render inside a table cell.
      */}
      {viewOpen && (
        <ClientViewIssueModal
          open={viewOpen}
          onClose={() => setViewOpen(false)}
          issue={row.original}
        />
      )}
    </>
  );
};

export const QUERIES_TABLE_COLUMNS_CONFIG = [
  { accessorKey: "moduleName", header: "Module Name" },
  { accessorKey: "priority", header: "Priority" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "createdDate", header: "Created Date" },
  { accessorKey: "expectedDate", header: "Expected Date" },
  { accessorKey: "expectedTime", header: "Expected Time" },
];

export const getQueriesTableColumnsConfig = ({ onExport, onReassign } = {}) => [
  ...QUERIES_TABLE_COLUMNS_CONFIG,
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
    cell: ({ row }) => (
      <ActionCell row={row} onExport={onExport} onReassign={onReassign} />
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
];
