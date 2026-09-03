import { useState, useRef, useEffect } from "react";
import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";
import ReactDOM from "react-dom";
// import PayoutModal from "../../../partials/modals/add-payout-expense/PayoutModal";
import { FileDown } from "lucide-react";

const avatarColors = [
  "bg-violet-500",
  "bg-pink-400",
  "bg-teal-500",
  "bg-amber-400",
  "bg-sky-400",
  "bg-rose-400",
  "bg-indigo-400",
  "bg-lime-500",
];

const Avatar = ({ name = "", index = 0 }) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${avatarColors[index % avatarColors.length]}`}
    >
      {initials}
    </div>
  );
};
const statusStyles = {
  confirm: {
    text: "text-emerald-600",
    border: "border-emerald-400",
    dot: "bg-emerald-500",
  },
  pending: {
    text: "text-orange-500",
    border: "border-orange-400",
    dot: "bg-orange-400",
  },
  unpaid: {
    text: "text-red-500",
    border: "border-red-400",
    dot: "bg-red-500",
  },
};

const StatusBadge = ({ status }) => {
  const key = status?.toLowerCase();

  const s = statusStyles[key] || {
    text: "text-gray-500",
    border: "border-gray-300",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold border bg-white ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

// ─── Payout Button ────────────────────────────────────────────────────────────

const DROPDOWN_W = 176; // Fixed width for dropdown menu
// Add this at the top of the file, outside the components
const isSuperAdmin = () => Number(localStorage.getItem("mainId")) === 1;
const PayoutButton = ({ onPayout, rowAmount = 0 }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [view, setView] = useState("menu");
  const [pendingAmount, setPendingAmount] = useState("");
  const btnRef = useRef(null);

  // Reference to dropdown element
  const dropRef = useRef(null);
  const handleConfirmAmount = () => {
    const amt = parseFloat(pendingAmount);

    if (!pendingAmount || isNaN(amt) || amt <= 0) return;

    const payoutType = view === "paid-input" ? "confirm" : "pending";

    onPayout?.(payoutType, amt);
    setOpen(false);
  };

  // ─── Calculate Dropdown Position ───────────────────────────────────────
  // Prevents dropdown from overflowing screen
  const reposition = (currentView) => {
    if (!btnRef.current) return;

    const rect = btnRef.current.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;

    // Different height depending on view
    const dropH = currentView === "pending-input" ? 116 : 132;

    // Show above button if not enough space below
    const top =
      rect.bottom + dropH + 6 > vh ? rect.top - dropH - 4 : rect.bottom + 4;

    // Keep dropdown within horizontal viewport
    const left = Math.min(
      Math.max(rect.right - DROPDOWN_W, 8),
      vw - DROPDOWN_W - 8,
    );

    setPos({ top, left });
  };

  const openDropdown = () => {
    if (open) {
      setOpen(false);
      return;
    }

    setView("menu");
    setPendingAmount("");

    requestAnimationFrame(() => {
      reposition("menu");
      setOpen(true);
    });
  };

  // Recalculate position when view changes
  useEffect(() => {
    if (open) reposition(view);
  }, [view]);

  // ─── Close Dropdown on Outside Click or Scroll ─────────────────────────
  useEffect(() => {
    if (!open) return;

    const handleOutside = (e) => {
      if (
        dropRef.current &&
        !dropRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    const handleScroll = () => setOpen(false);

    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  const handleSelect = (status) => {
    if (status === "Paid") {
      setView("paid-input");
      setPendingAmount(rowAmount?.toString() || "");
    } else if (status === "Unpaid") {
      onPayout?.("unpaid", 0); // ✅ backend value
      setOpen(false);
    } else if (status === "Pending") {
      setView("pending-input");
      setPendingAmount("");
    }
  };

  return (
    <>
      <Tooltip title="Update Payout Status">
        <button
          ref={btnRef}
          type="button"
          onClick={openDropdown}
          className="btn btn-sm btn-icon btn-clear"
        >
          <i className="ki-filled ki-wallet text-blue-600" />
        </button>
      </Tooltip>

      {/* Dropdown Portal (renders outside table for proper layering) */}
      {open &&
        ReactDOM.createPortal(
          <div
            ref={dropRef}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: DROPDOWN_W,
              zIndex: 9999,
            }}
            className="bg-white rounded-xl shadow-xl border border-gray-100 p-2"
          >
            {/* ─── Status Selection Menu ───────────────────────────── */}
            {view === "menu" ? (
              <>
                {/* Paid Option */}
                <button
                  onClick={() => handleSelect("Paid")}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-emerald-50 text-emerald-600 font-medium"
                >
                  ✅ Paid
                  <span className="block text-[10px] text-emerald-400 font-normal leading-none mt-0.5">
                    ₹{rowAmount?.toLocaleString()} (full)
                  </span>
                </button>

                {/* Pending Option */}
                <button
                  onClick={() => handleSelect("Pending")}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-orange-50 text-orange-600 font-medium"
                >
                  ⏳ Pending
                  <span className="block text-[10px] text-orange-400 font-normal leading-none mt-0.5">
                    Enter partial amount →
                  </span>
                </button>

                {/* Unpaid Option */}
                <button
                  onClick={() => handleSelect("Unpaid")}
                  className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-red-600 font-medium"
                >
                  ❌ Unpaid
                  <span className="block text-[10px] text-red-400 font-normal leading-none mt-0.5">
                    ₹0
                  </span>
                </button>
              </>
            ) : (
              /* ─── Amount Input View ───────────────────────────── */
              <div className="px-1 py-1">
                {/* Back Button */}
                <button
                  onClick={() => setView("menu")}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 mb-2 bg-transparent border-0 cursor-pointer p-0"
                >
                  ← Back
                </button>

                {/* Input Title */}
                <p
                  className={`text-xs font-semibold mb-2 ${
                    view === "paid-input"
                      ? "text-emerald-600"
                      : "text-orange-600"
                  }`}
                >
                  {view === "paid-input"
                    ? "✅ Enter Paid Amount"
                    : "⏳ Enter Pending Amount"}
                </p>

                {/* Amount Input Field */}
                <div className="relative mb-2">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
                    ₹
                  </span>
                  <input
                    type="tel"
                    min="0"
                    step="any"
                    autoFocus
                    value={pendingAmount}
                    onChange={(e) => setPendingAmount(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleConfirmAmount()
                    }
                    placeholder="0.00"
                    className="w-full pl-5 pr-2 py-1.5 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 bg-gray-50"
                  />
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handleConfirmAmount}
                  disabled={
                    !pendingAmount ||
                    isNaN(parseFloat(pendingAmount)) ||
                    parseFloat(pendingAmount) <= 0
                  }
                  className="w-full py-1.5 text-xs font-semibold rounded-lg bg-orange-500 hover:bg-orange-600 text-white border-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
};

export const columns = (
  onEdit,
  onDelete,
  onStatusChange,
  onPayout,
  onUserClick,
  onExport,
  onOpenPayout,
) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No#" />,
    cell: ({ row }) => (
      <span className="text-sm text-gray-400 font-medium">
        {row.original.sr_no}
      </span>
    ),
    meta: { headerClassName: "w-[4%]", cellClassName: "w-[4%]" },
  },

  {
    accessorKey: "user",
    header: <FormattedMessage id="EXPENSE.USER" defaultMessage="Employee" />,
    cell: ({ row, table }) => {
      const index = table
        .getCoreRowModel()
        .rows.findIndex((r) => r.id === row.id);
      const user = row.original.user ?? {};
      return (
        <button
          type="button"
          onClick={() => onUserClick?.(row.original)}
          className="flex items-center gap-3 group bg-transparent border-0 cursor-pointer text-left p-0 w-full"
        >
          <Avatar name={user.username ?? ""} index={index} />
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
              {user.username}
            </p>
          </div>
        </button>
      );
    },
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },

  {
    accessorKey: "title",
    header: <FormattedMessage id="EXPENSE.TITLE" defaultMessage="Trip Title" />,
    cell: ({ row }) => {
      const user = row.original.user ?? {};
      return (
        <button
          type="button"
          onClick={() => onUserClick?.(row.original)}
          className="flex items-start gap-3 group bg-transparent border-0 cursor-pointer text-left p-0 w-full"
        >
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              {row.original.title}
            </span>
            <span className="text-xs text-gray-500">{user.name}</span>
          </div>
        </button>
      );
    },
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },

  {
    accessorKey: "amount",
    header: <FormattedMessage id="EXPENSE.AMOUNT" defaultMessage="Amount" />,
    cell: ({ row }) => (
      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
        ₹{row.original.amount?.toLocaleString()}/-
      </span>
    ),
    meta: { headerClassName: "w-[9%]", cellClassName: "w-[9%]" },
  },

  {
    accessorKey: "paidAmount",
    header: <FormattedMessage id="EXPENSE.PAID_AMOUNT" defaultMessage="Paid" />,
    cell: ({ row }) => (
      <span className="text-sm font-medium text-emerald-600 whitespace-nowrap">
        ₹{(row.original.paidAmount ?? 0).toLocaleString()}/-
      </span>
    ),
    meta: { headerClassName: "w-[9%]", cellClassName: "w-[9%]" },
  },

  {
    accessorKey: "remainingAmount",
    header: (
      <FormattedMessage id="EXPENSE.REMAINING" defaultMessage="Remaining" />
    ),
    cell: ({ row }) => {
      const remaining =
        (row.original.amount ?? 0) - (row.original.paidAmount ?? 0);
      return (
        <span className="text-sm font-medium text-red-500 whitespace-nowrap">
          ₹{remaining.toLocaleString()}/-
        </span>
      );
    },
    meta: { headerClassName: "w-[9%]", cellClassName: "w-[9%]" },
  },

  {
    accessorKey: "remarks",
    header: <FormattedMessage id="EXPENSE.REMARKS" defaultMessage="Remarks" />,
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">{row.original.remarks}</span>
    ),
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },

  {
    accessorKey: "startDate",
    header: (
      <FormattedMessage id="EXPENSE.START_DATE" defaultMessage="Start Date" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-gray-500 whitespace-nowrap">
        {row.original.startDate}
      </span>
    ),
    meta: { headerClassName: "w-[9%]", cellClassName: "w-[9%]" },
  },

  {
    accessorKey: "dueDate",
    header: (
      <FormattedMessage id="EXPENSE.DUE_DATE" defaultMessage="Due Date" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-gray-500 whitespace-nowrap">
        {row.original.dueDate}
      </span>
    ),
    meta: { headerClassName: "w-[9%]", cellClassName: "w-[9%]" },
  },

  {
    accessorKey: "status",
    header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
    meta: { headerClassName: "w-[13%]", cellClassName: "w-[13%]" },
  },
  {
    accessorKey: "amountdesc",
    header: (
      <FormattedMessage
        id="EXPENSE.AMOUNT_DESC"
        defaultMessage="Amount Description"
      />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-gray-500">{row.original.amountdesc}</span>
    ),
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-0.5">
        <Tooltip title="Edit Expense">
          <button
            type="button"
            className="btn btn-sm btn-icon btn-clear"
            onClick={() => onEdit?.(row.original)}
          >
            <i className="ki-filled ki-notepad-edit text-primary" />
          </button>
        </Tooltip>
        <Tooltip title="Delete Expense">
          <button
            type="button"
            className="btn btn-sm btn-icon btn-clear"
            onClick={() => onDelete?.(row.original.id)}
          >
            <i className="ki-filled ki-trash text-danger" />
          </button>
        </Tooltip>
        <Tooltip title="View Expense Report">
          <button
            type="button"
            className="btn btn-sm btn-icon btn-clear"
            onClick={() => onExport?.(row.original)}
          >
            <FileDown size={18} />
          </button>
        </Tooltip>
        {isSuperAdmin() && (
          <Tooltip title="Record Payout">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onOpenPayout?.(row.original)}
            >
              <i className="ki-filled ki-wallet text-blue-600" />
            </button>
          </Tooltip>
        )}
      </div>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
];

export const simpleColumns = (
  onEdit,
  onDelete,
  onStatusChange,
  onPayout,
  onUserClick,
  expenseType,
  onOpenPayout,
) => {
  const isServe = expenseType === "serve";

  const cols = [
    {
      accessorKey: "sr_no",
      header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No#" />,
      cell: ({ row }) => (
        <span className="text-sm text-gray-400 font-medium">
          {row.original.sr_no}
        </span>
      ),
      meta: { headerClassName: "w-[5%]", cellClassName: "w-[5%]" },
    },

    !isServe && {
      accessorKey: "user",
      header: (
        <FormattedMessage id="EXPENSE.USER" defaultMessage="Employee Name" />
      ),
      cell: ({ row, table }) => {
        const index = table
          .getCoreRowModel()
          .rows.findIndex((r) => r.id === row.id);
        const user = row.original.user ?? {};
        return (
          <button
            type="button"
            onClick={() => onUserClick?.(row.original)}
            className="flex items-center gap-3 group bg-transparent border-0 cursor-pointer text-left p-0 w-full"
          >
            <Avatar name={row.original.userName ?? ""} index={index} />
            <p className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
              {row.original.userName}
            </p>
          </button>
        );
      },
      meta: { headerClassName: "w-[18%]", cellClassName: "w-[18%]" },
    },

    {
      accessorKey: "remarks",
      header: (
        <FormattedMessage id="EXPENSE.REMARKS" defaultMessage="Description" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {row.original.remarks || "—"}
        </span>
      ),
      meta: { headerClassName: "w-[18%]", cellClassName: "w-[18%]" },
    },
    {
      accessorKey: "startDate",
      header: (
        <FormattedMessage id="EXPENSE.START_DATE" defaultMessage="Start Date" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {row.original.startDate}
        </span>
      ),
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
    {
      accessorKey: "dueDate",
      header: (
        <FormattedMessage id="EXPENSE.DUE_DATE" defaultMessage="Due Date" />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {row.original.dueDate}
        </span>
      ),
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
    {
      accessorKey: "amount",
      header: <FormattedMessage id="EXPENSE.AMOUNT" defaultMessage="Amount" />,
      cell: ({ row }) => (
        <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
          ₹{row.original.amount?.toLocaleString()}/-
        </span>
      ),
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
    {
      accessorKey: "paidAmount",
      header: (
        <FormattedMessage id="EXPENSE.PAID_AMOUNT" defaultMessage="Paid" />
      ),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-emerald-600 whitespace-nowrap">
          ₹{(row.original.paidAmount ?? 0).toLocaleString()}/-
        </span>
      ),
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
    {
      accessorKey: "remainingAmount",
      header: (
        <FormattedMessage id="EXPENSE.REMAINING" defaultMessage="Remaining" />
      ),
      cell: ({ row }) => {
        const remaining =
          (row.original.amount ?? 0) - (row.original.paidAmount ?? 0);
        return (
          <span className="text-sm font-medium text-red-500 whitespace-nowrap">
            ₹{remaining.toLocaleString()}/-
          </span>
        );
      },
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
    {
      accessorKey: "status",
      header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
    {
      accessorKey: "action",
      header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-0.5">
          <Tooltip title="Edit Expense">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onEdit?.(row.original)}
            >
              <i className="ki-filled ki-notepad-edit text-primary" />
            </button>
          </Tooltip>
          <Tooltip title="Delete Expense">
            <button
              type="button"
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onDelete?.(row.original.id)}
            >
              <i className="ki-filled ki-trash text-danger" />
            </button>
          </Tooltip>
          {isSuperAdmin() && (
            <Tooltip title="Record Payout">
              <button
                type="button"
                className="btn btn-sm btn-icon btn-clear"
                onClick={() => onOpenPayout?.(row.original)}
              >
                <i className="ki-filled ki-wallet text-blue-600" />
              </button>
            </Tooltip>
          )}
        </div>
      ),
      meta: { headerClassName: "w-[9%]", cellClassName: "w-[9%]" },
    },
  ].filter(Boolean); // ← removes the `false` entry when isServe

  return cols;
};
