import { useState } from "react";
import { Tooltip } from "antd";
import { FileDown, Eye, UserRoundPen } from "lucide-react";
import ClientViewIssueModal from "../../../../partials/modals/TicketModal/ClientViewIssueModal";

const ActionCell = ({ row, onExport, onReassign }) => {
  const [viewOpen, setViewOpen] = useState(false);
  return (
    <>
      <div className="flex items-center gap-0.5">
        <Tooltip title="View Issue Details">
          <button
            type="button"
            className="btn btn-sm btn-icon btn-clear"
            onClick={() => setViewOpen(true)}
          >
            <Eye size={18} />
          </button>
        </Tooltip>
        <Tooltip title="Export">
          <button
            type="button"
            className="btn btn-sm btn-icon btn-clear"
            onClick={() => onExport?.(row.original)}
          >
            <FileDown size={18} />
          </button>
        </Tooltip>
        {row.original.completed && (
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

export const getQueriesTableColumnsConfig = ({
  onExport,
  onReassign,
  onClientClick,
} = {}) => [
  {
    accessorKey: "clientCode",
    header: "Client Code",
    cell: ({ row }) => (
      // ✅ clicking clientCode now calls onClientClick
      <span
        className="text-sm font-medium text-blue-600 cursor-pointer hover:underline"
        onClick={() => onClientClick?.(row.original)}
      >
        {row.original.clientCode}
      </span>
    ),
  },
  {
    accessorKey: "clientName",
    header: "Client Name",
    cell: ({ row }) => {
      const name = row.original.clientName;
      const initials = name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      const colors = [
        "bg-purple-100 text-purple-700",
        "bg-blue-100 text-blue-700",
        "bg-green-100 text-green-700",
        "bg-orange-100 text-orange-700",
        "bg-pink-100 text-pink-700",
      ];
      const color = colors[name.charCodeAt(0) % colors.length];
      return (
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${color}`}
          >
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-800">{name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "priority",
    header: "Priority",
  },
  {
    accessorKey: "AssignedBy",
    header: "Assigned By",
  },
];
