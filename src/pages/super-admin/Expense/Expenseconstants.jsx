// ─── expenseConstants.jsx ─────────────────────────────────────────────────────

import React from "react";
import { DataGridColumnHeader } from "@/components";

// ─── Layout switch ────────────────────────────────────────────────────────────
export const isSimpleType = (key) =>
  (key ?? "").toLowerCase().trim() !== "trip";

// ─── Month labels ─────────────────────────────────────────────────────────────
export const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// ─── API → Tab mapper ─────────────────────────────────────────────────────────
export const mapApiTypeToTab = (apiItem) => ({
  key: String(apiItem.name ?? apiItem.typeId)
    .toLowerCase()
    .trim(),
  label: String(apiItem.name ?? "Expense").trim(),
  id: apiItem.typeId,
});

// ─── Color cycling ────────────────────────────────────────────────────────────
export const CATEGORY_COLOR_MAP = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-100",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
  },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100" },
  cyan: { bg: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-100" },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
  },
};
const COLOR_CYCLE = Object.keys(CATEGORY_COLOR_MAP);
export const getTabColor = (index) => COLOR_CYCLE[index % COLOR_CYCLE.length];

// ─── getPeriodLabel (uses live close dates passed in, no static map) ──────────
export const getPeriodLabel = (monthIndex, year, monthCloseDates = {}) => {
  const entry = monthCloseDates[`${year}-${monthIndex + 1}`];
  if (!entry?.startDate || !entry?.closeDate) return "";
  return `${entry.startDate.slice(0, 5)} → ${entry.closeDate.slice(0, 5)}`;
};

// ─── Status cell (shared) ─────────────────────────────────────────────────────
const headerClass = "text-black font-semibold uppercase tracking-wide text-xs";

const StatusCell = ({ value }) => {
  const styles = {
    paid: "bg-emerald-100 text-emerald-700",
    confirm: "bg-green-100 text-green-700", // ← add
    pending: "bg-amber-100 text-amber-700", // ← add
    unpaid: "bg-red-100 text-red-600",
  };

  const cls = styles[value?.toLowerCase()] ?? "bg-red-100 text-red-600";

  return (
    <span
      className={`text-xs font-semibold px-2 py-1 rounded-lg capitalize whitespace-nowrap ${cls}`}
    >
      {value ?? "unpaid"}
    </span>
  );
};

// ─── Action cell (ki-filled icons + permission flags) ────────────────────────
const ActionCell = ({ row, handlers, permissions = {} }) => {
  const item = row.original;
  const { onView, onEdit, onDelete, onPayout, onReport } = handlers;

  return (
    <div className="flex items-center gap-1">
      {permissions.view && (
        <button
          className="btn btn-sm btn-icon btn-clear"
          title="View details"
          onClick={() => onView(item)}
        >
          <i className="ki-filled ki-eye text-success" />
        </button>
      )}

      {permissions.edit && (
        <button
          className="btn btn-sm btn-icon btn-clear"
          title="Edit"
          onClick={() => onEdit(item)}
        >
          <i className="ki-filled ki-notepad-edit text-primary" />
        </button>
      )}

      {permissions.delete && (
        <button
          className="btn btn-sm btn-icon btn-clear"
          title="Delete"
          onClick={() => onDelete(item.id)}
        >
          <i className="ki-filled ki-trash text-danger" />
        </button>
      )}

      {permissions.edit && (
        <button
          className="btn btn-sm btn-icon btn-clear"
          title="Payout"
          onClick={() => onPayout(item)}
        >
          <i className="ki-filled ki-wallet text-warning" />
        </button>
      )}

      {permissions.report && (
        <button
          className="btn btn-sm btn-icon btn-clear"
          title="Export report"
          onClick={() => onReport(item)}
        >
          <i className="ki-filled ki-chart text-info" />
        </button>
      )}
    </div>
  );
};

// ─── Shared columns (present in both trip and simple layouts) ─────────────────
const srNoCol = {
  accessorKey: "sr_no",
  header: ({ column }) => <DataGridColumnHeader title="#" column={column} />,
  size: 48,
  cell: ({ row }) => (
    <span className="text-sm text-gray-500">{row.index + 1}</span>
  ),
};

const amountCol = (key, label, colorClass = "text-gray-700") => ({
  accessorKey: key,
  header: ({ column }) => (
    <DataGridColumnHeader title={label} column={column} />
  ),
  cell: ({ getValue }) => (
    <span className={`text-sm font-medium ${colorClass}`}>
      ₹{(getValue() ?? 0).toLocaleString()}
    </span>
  ),
});

const statusCol = {
  accessorKey: "status",
  header: ({ column }) => (
    <DataGridColumnHeader title="Status" column={column} />
  ),
  cell: ({ getValue }) => <StatusCell value={getValue()} />,
};

export const buildColumns = (isTrip, handlers, permissions = {}) => {
  const titleCol = {
    accessorKey: "title",
    header: ({ column }) => (
      <DataGridColumnHeader title="Title" column={column} />
    ),
    cell: ({ row }) => (
      <button
        onClick={() => handlers.onView(row.original)}
        className="text-sm font-semibold text-blue-600 hover:underline text-left"
      >
        {row.original.title || row.original.remarks || "-"}
      </button>
    ),
  };

  const memberCol = {
    accessorKey: "memberName",
    header: ({ column }) => (
      <DataGridColumnHeader title="Member" column={column} />
    ),
    cell: ({ getValue }) => (
      <span className="text-sm text-gray-600">{getValue() || "-"}</span>
    ),
  };

  const actionCol = {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <ActionCell
        row={row}
        handlers={handlers}
        permissions={{ ...permissions, report: isTrip && permissions.report }}
      />
    ),
  };

  if (isTrip) {
    return [
      srNoCol,
      titleCol,
      memberCol,
      {
        accessorKey: "startDate",
        header: ({ column }) => (
          <DataGridColumnHeader title="From Date" column={column} />
        ),
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {getValue()}
          </span>
        ),
      },
      amountCol("totalAmount", "Amount", "text-gray-700"),
      amountCol("paidAmount", "Paid", "text-emerald-600"),
      amountCol("remainingAmount", "Unpaid", "text-red-500"),
      statusCol,
      actionCol,
    ];
  }

  // Simple layout — all non-trip tabs
  return [
    srNoCol,
    titleCol,
    memberCol,
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <DataGridColumnHeader title="Expense Date" column={column} />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {getValue()}
        </span>
      ),
    },
    amountCol("totalAmount", "Amount", "text-gray-700"),
    amountCol("paidAmount", "Paid", "text-emerald-600"),
    amountCol("remainingAmount", "Unpaid", "text-red-500"),
    statusCol,
    actionCol,
  ];
};

// ─── Sub-table headers (All tab breakdowns) ───────────────────────────────────
export const EXPENSE_TABLE_HEADERS = [
  "#",
  "Remarks",
  "Member",
  "Amount",
  "Paid",
  "Remaining",
  "Date",
  "Mode",
  "Status",
];
