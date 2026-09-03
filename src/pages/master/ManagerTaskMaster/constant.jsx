import { Popconfirm, Tooltip } from "antd";
import { useState } from "react";
import { FormattedMessage } from "react-intl";
import { DeleteManagerTask } from "@/services/apiServices";
import Swal from "sweetalert2";

const PRIORITY_STYLES = {
  HIGH: "bg-red-100 text-red-700 border-red-300",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-300",
  LOW: "bg-green-100 text-green-700 border-green-300",
};

const TYPE_STYLES = {
  PRE: "bg-blue-100 text-blue-700 border-blue-300",
  POST: "bg-purple-100 text-purple-700 border-purple-300",
  RUNNING: "bg-teal-100 text-teal-700 border-teal-300",
};

const DeleteCell = ({ row, onRefresh }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await DeleteManagerTask(row.original.id);
      const data = res?.data;
      if (data?.success !== false) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: data?.msg || "Task deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
        onRefresh && onRefresh();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data?.msg || "Something went wrong.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Something went wrong.",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Popconfirm
      title="Are you sure you want to delete this task?"
      onConfirm={handleDelete}
      okText="Yes"
      cancelText="No"
      okButtonProps={{ danger: true, loading: deleting }}
    >
      <Tooltip title="Delete Task">
        <button className="btn btn-sm btn-icon btn-clear" disabled={deleting}>
          <i className="ki-filled ki-trash text-danger"></i>
        </button>
      </Tooltip>
    </Popconfirm>
  );
};

export const columns = (onEdit, onRefresh, permissions = {}) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr. No." />,
    meta: { headerClassName: "w-[6%]", cellClassName: "w-[6%]" },
  },
  {
    accessorKey: "name",
    header: <FormattedMessage id="COMMON.NAME" defaultMessage="Name" />,
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
  {
    accessorKey: "description",
    header: (
      <FormattedMessage id="COMMON.DESCRIPTION" defaultMessage="Description" />
    ),
    meta: { headerClassName: "w-[26%]", cellClassName: "w-[26%]" },
  },
  {
    accessorKey: "type",
    header: <FormattedMessage id="TASK.TYPE" defaultMessage="Type" />,
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full border ${TYPE_STYLES[type] || "bg-gray-100 text-gray-600 border-gray-300"}`}
        >
          {type || "-"}
        </span>
      );
    },
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "priority",
    header: <FormattedMessage id="TASK.PRIORITY" defaultMessage="Priority" />,
    cell: ({ row }) => {
      const priority = row.original.priority;
      return (
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full border ${PRIORITY_STYLES[priority] || "bg-gray-100 text-gray-600 border-gray-300"}`}
        >
          {priority || "-"}
        </span>
      );
    },
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
//   {
//     accessorKey: "sequence",
//     header: <FormattedMessage id="COMMON.SEQUENCE" defaultMessage="Sequence" />,
//     meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
//   },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        {permissions.edit && (
          <Tooltip title="Edit Task">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onEdit(row.original)}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
        )}
        {permissions.delete && <DeleteCell row={row} onRefresh={onRefresh} />}
      </div>
    ),
    meta: { headerClassName: "w-[18%]", cellClassName: "w-[18%]" },
  },
];

export const defaultData = [];