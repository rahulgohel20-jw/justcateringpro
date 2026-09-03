import { WhatsAppOutlined } from "@ant-design/icons";
import { FormattedMessage } from "react-intl";

// ── Conditional Action Buttons ────────────────────────────────────────────────
// isAccepted = true  (status !== "PENDING") → RETURN SOT + STORE REPORT
// isAccepted = false (status === "PENDING") → ACCEPT SOT + DELETE + GENERATE AUTO/MANUAL PO

const ActionCell = ({
  row,
  onAccept,
  onReturn,
  onDelete,
  onStoreReport,
  onGeneratePO,
   permission,
   onWhatsApp

}) => {
  const isAccepted = row.original.status;

  if (isAccepted === "INVOICE_GENERATED" || isAccepted === "PO_GENERATED") {
    return (
      <div className="flex items-center gap-2 flex-wrap">
           {permission?.edit && (
        <button
          onClick={() => onReturn && onReturn(row.original)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold tracking-wide transition-all shadow-sm"
          style={{ background: "linear-gradient(135deg,#ea580c,#c2410c)" }}
        >
          RETURN SOT
        </button>
           )}
              {permission?.view && (
        <button
          onClick={() => onStoreReport && onStoreReport(row.original)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold tracking-wide transition-all shadow-sm"
          style={{ background: "linear-gradient(135deg,#0284c7,#0369a1)" }}
        >
          STORE REPORT
        </button>
        
              )}

               {permission?.view && (
          <button
            onClick={() => onWhatsApp && onWhatsApp(row.original)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold tracking-wide transition-all shadow-sm"
            style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}
          >
            <WhatsAppOutlined size={24}  />
            
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {permission?.add && (
      <button
        onClick={() => onAccept && onAccept(row.original)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold tracking-wide transition-all shadow-sm"
        style={{ background: "linear-gradient(135deg,#16a34a,#15803d)" }}
      >
        ACCEPT SOT
      </button>
      )}
      {permission?.delete && (
      <button
        onClick={() => onDelete && onDelete(row.original.id)}
        className="inline-flex items-center gap-1.5 bg-red-800 px-3 py-1.5 rounded-lg text-white text-xs font-bold tracking-wide transition-all shadow-sm"
        
      >
        Withdraw
      </button>
      )}
      {permission?.add && (
      <button
        onClick={() => onGeneratePO && onGeneratePO(row.original)}
        disabled={isAccepted === "PENDING"}
        className={`inline-flex ${isAccepted === "PENDING"?"cursor-not-allowed":""}  items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold tracking-wide transition-all shadow-sm`}
        style={{ background: "linear-gradient(135deg,#0284c7,#0369a1)" }}
      >
        GENERATE AUTO / MANUAL PO
      </button>
      )}
    </div>
  );
};

// ── Status Badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
    ACCEPTED: "bg-green-50 text-green-700 border-green-200",
    RETURNED: "bg-orange-50 text-orange-700 border-orange-200",
  };
  const cls = styles[status] ?? "bg-gray-50 text-gray-600 border-gray-200";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}
    >
      {status}
    </span>
  );
};

// ── Columns ───────────────────────────────────────────────────────────────────
// NOTE: selectedRows / onSelectRow / onSelectAll / isAllSelected now come from the
// parent component's own state — not from table/row selection internals.
export const columns = (
  onAccept,
  onReturn,
  onDelete,
  onStoreReport,
  onGeneratePO,
  permission,
  selectedRows = [],
  onSelectRow = () => {},
  onSelectAll = () => {},
  isAllSelected = false,
  onWhatsApp = () => {},
) => [
{
  id: "select",
  header: () => {
    // only rows eligible for selection should count toward "select all"
    const eligibleCount = selectedRows.__eligibleTotal ?? 0; // see note below
    return (
      <input
        type="checkbox"
        checked={isAllSelected}
        onChange={(e) => onSelectAll(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-blue-600"
      />
    );
  },
  cell: ({ row }) => {
    const status = row.original.status;
    const isSelectable = status !== "PO_GENERATED";

    if (!isSelectable) {
      return null; // no checkbox for PO_GENERATED rows
    }

    const id = row.original.id;
    const checked = selectedRows.includes(id);
    return (
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onSelectRow(id, e.target.checked)}
        className="h-4 w-4 rounded border-gray-300 cursor-pointer accent-blue-600"
      />
    );
  },
  meta: {
    headerClassName: "w-[3%]",
    cellClassName: "w-[3%]",
  },
},
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No." />,
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%] text-gray-500 font-medium",
    },
  },
  {
    accessorKey: "sotNo",
    header: <FormattedMessage id="SOT.SOT_NO" defaultMessage="SOT No" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm text-gray-800">
        {row.original.sotNo}
      </span>
    ),
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "eventName",
    header: <FormattedMessage id="SOT.EVENT" defaultMessage="Event" />,
    cell: ({ row }) => (
      <span className="font-semibold text-gray-800 text-sm">
        {row.original.eventName}
      </span>
    ),
    meta: { headerClassName: "w-[24%]", cellClassName: "w-[24%]" },
  },
  {
    accessorKey: "eventDate",
    header: <FormattedMessage id="SOT.EVENT" defaultMessage="EventDate" />,
    cell: ({ row }) => (
      <span className="font-semibold text-gray-800 text-sm">
        {row.original.eventDate}
      </span>
    ),
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "status",
    header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "createdAt",
    header: <FormattedMessage id="COMMON.DATE" defaultMessage="Date" />,
    cell: ({ row }) => {
      const d = row.original.createdAt;
      if (!d) return <span className="text-gray-400">—</span>;
      const formatted = new Date(d).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return <span className="text-sm text-gray-600">{formatted}</span>;
    },
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => (
      <ActionCell
        row={row}
        onAccept={onAccept}
        onReturn={onReturn}
        onDelete={onDelete}
        onStoreReport={onStoreReport}
        onGeneratePO={onGeneratePO}
        onWhatsApp={onWhatsApp}
        permission={permission}
      />
    ),
    meta: { headerClassName: "w-[40%]", cellClassName: "w-[40%]" },
  },
];