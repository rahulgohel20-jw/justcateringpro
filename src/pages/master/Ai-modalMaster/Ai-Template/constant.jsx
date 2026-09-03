// constant.js
import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";
import { useState, useEffect } from "react";
import { isactiveforAimodule } from "@/services/apiServices";
import Swal from "sweetalert2";

const StatusToggle = ({ isActive, id, onToggled }) => {
  const [active, setActive] = useState(isActive);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!loading) {
      setActive(isActive);
    }
  }, [isActive]);

  const handleToggle = async () => {
    const newValue = !active;

    const result = await Swal.fire({
      title: newValue ? "Activate Module?" : "Deactivate Module?",
      text: newValue
        ? "This module will become active."
        : "This module will become inactive.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: newValue ? "Yes, Activate" : "Yes, Deactivate",
      cancelButtonText: "Cancel",
      confirmButtonColor: newValue ? "#10b981" : "#ef4444",
      cancelButtonColor: "#6b7280",
      customClass: { popup: "!rounded-2xl" },
    });

    if (!result.isConfirmed) return;

    setLoading(true);

    try {
      const res = await isactiveforAimodule(id, newValue);

      setActive(newValue);

      Swal.fire({
        icon: "success",
        title: "Success",
        text:
          res?.data?.msg || res?.data?.message || "Status updated successfully",
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: "!rounded-2xl" },
      });

      onToggled?.();
    } catch (err) {
      console.error("Toggle failed:", err);

      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Unable to update status.",
        customClass: { popup: "!rounded-2xl" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex items-center gap-2 cursor-pointer select-none ${
        loading ? "opacity-50 pointer-events-none" : ""
      }`}
      onClick={handleToggle}
    >
      {/* Toggle Switch */}
      <div
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${
          active ? "" : "bg-gray-300"
        }`}
        style={
          active
            ? {
                background: "linear-gradient(135deg, #594CEB 0%, #4BCBEB 100%)",
              }
            : {}
        }
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            active ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </div>

      {/* Status Badge */}
      <span
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
          active
            ? "bg-emerald-50 text-emerald-600"
            : "bg-gray-100 text-gray-400"
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            active ? "bg-emerald-500" : "bg-gray-400"
          }`}
        />
        {loading ? "Updating..." : active ? "Active" : "Inactive"}
      </span>
    </div>
  );
};

const BillingBadge = ({ cycle }) => {
  if (!cycle) return <span className="text-gray-400 text-xs">N/A</span>;

  const isMonthly = cycle.toLowerCase().includes("month");

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        isMonthly
          ? "bg-violet-50 text-violet-600"
          : "bg-amber-50 text-amber-600"
      }`}
    >
      {cycle}
    </span>
  );
};

export const columns = (onEdit, onDelete, permissions, onToggled) => [
  {
    accessorKey: "name",
    header: "MODULE ENTITY",
    cell: ({ row }) => (
      <div>
        <p className="font-semibold">{row.original.name}</p>
        <p className="text-xs text-gray-400">{row.original.aiModel || "-"}</p>
      </div>
    ),
  },
  {
    accessorKey: "isActive",
    header: "STATUS",
    cell: ({ row }) => (
      <StatusToggle
        isActive={row.original.isActive}
        id={row.original.id}
        onToggled={onToggled}
      />
    ),
  },
  {
    accessorKey: "billingCycle",
    header: "BILLING PERIOD",
    cell: ({ row }) => <BillingBadge cycle={row.original.billingCycle} />,
  },
  {
    accessorKey: "price",
    header: "PRICE",
    cell: ({ row }) => (
      <div className="font-medium">
        ₹{Number(row.original.price || 0).toLocaleString("en-IN")}
      </div>
    ),
  },
  {
    accessorKey: "action",
    header: "ACTIONS",
    cell: ({ row }) => (
      <div className="flex gap-3">
        {permissions.edit && (
          <Tooltip title="Edit">
            <button onClick={() => onEdit(row.original)}>
              <i className="ki-filled ki-notepad-edit text-primary text-xl" />
            </button>
          </Tooltip>
        )}
        {permissions.delete && (
          <Tooltip title="Delete">
            <button onClick={() => onDelete(row.original.id)}>
              <i className="ki-filled ki-trash text-red-400 hover:text-red-600 text-xl" />
            </button>
          </Tooltip>
        )}
      </div>
    ),
  },
];
