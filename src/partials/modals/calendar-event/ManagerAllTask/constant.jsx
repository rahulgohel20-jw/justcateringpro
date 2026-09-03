// src/partials/modals/calendar-event/ManagerAllTask/constant.js
import { ChevronRight } from "lucide-react";

const STATUS_STYLES = {
  completed: { label: "Completed", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-700 border-amber-100" },
  "in-progress": { label: "In Progress", cls: "bg-blue-50 text-blue-700 border-blue-100" },
  cancelled: { label: "Cancelled", cls: "bg-red-50 text-red-700 border-red-100" },
};

// TanStack React Table column defs.
// `onViewDetails` is injected from the page so the Actions column can open
// the details drawer without this file needing component state.
export const columns = (onViewDetails) => [
  {
    id: "title",
    accessorKey: "title",
    header: "Task",
    cell: ({ row }) => (
      <span className="font-medium text-gray-900">{row.original.title}</span>
    ),
  },
  {
    id: "priority",
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => row.original.priority || "—",
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const statusMeta = STATUS_STYLES[row.original.status] ?? STATUS_STYLES.pending;
      return (
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusMeta.cls}`}>
          {statusMeta.label}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => onViewDetails(row.original)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-white  bg-primary rounded-3xl p-3"
        >
          View Details
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    ),
  },
];