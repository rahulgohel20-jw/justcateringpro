
import { Popconfirm, Tooltip } from "antd";
import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Deleteassignmanger, updateStatusassignmanger } from "@/services/apiServices";
import Swal from "sweetalert2";
const DeleteCell = ({ row, onRefresh }) => {
  const intl = useIntl();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await Deleteassignmanger(row.original.id);
      const data = res?.data;
      if (data?.success === true) {
        Swal.fire({
          icon: "success",
          title: intl.formatMessage({ id: "COMMON.DELETED", defaultMessage: "Deleted" }),
          text: data?.msg || intl.formatMessage({ id: "TASK.DELETED_SUCCESS", defaultMessage: "Task deleted successfully." }),
        });
        onRefresh && onRefresh();
      } else {
        Swal.fire({
          icon: "error",
          title: intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error" }),
          text: data?.msg || intl.formatMessage({ id: "COMMON.SOMETHING_WENT_WRONG", defaultMessage: "Something went wrong." }),
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error" }),
        text:
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          intl.formatMessage({ id: "COMMON.SOMETHING_WENT_WRONG", defaultMessage: "Something went wrong." }),
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Popconfirm
      title={intl.formatMessage({ id: "TASK.DELETE_CONFIRM", defaultMessage: "Are you sure you want to delete this task?" })}
      onConfirm={handleDelete}
      okText={intl.formatMessage({ id: "COMMON.YES", defaultMessage: "Yes" })}
      cancelText={intl.formatMessage({ id: "COMMON.NO", defaultMessage: "No" })}
      okButtonProps={{ danger: true, loading: deleting }}
    >
      <Tooltip title={intl.formatMessage({ id: "TASK.DELETE_TASK", defaultMessage: "Delete Task" })}>
        <button className="btn btn-sm btn-icon btn-clear" disabled={deleting}>
          <i className="ki-filled ki-trash text-danger"></i>
        </button>
      </Tooltip>
    </Popconfirm>
  );
};

const StatusCell = ({ row, onRefresh, permissions }) => {
  const [updating, setUpdating] = useState(false);
  const [checked, setChecked] = useState(row.original.isTrue);

  const canEdit = permissions?.edit ?? false; 

  const handleToggle = async () => {
    if (!canEdit) return; 

    const newValue = !checked;
    // ...rest unchanged
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={updating || !canEdit} 
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-primary" : "bg-gray-300"
      } ${
        updating || !canEdit
          ? "opacity-50 cursor-not-allowed" 
          : "cursor-pointer"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
};



const getResourceTypeLabels = (intl) => ({
  LABOUR: intl.formatMessage({ id: "TASK.LABOUR", defaultMessage: "Labour" }),
  OUTSIDE: intl.formatMessage({ id: "TASK.OUTSIDE", defaultMessage: "Outside" }),
  CHEF: intl.formatMessage({ id: "TASK.CHEF", defaultMessage: "Chef" }),
});

export const columns = (onEdit, onRefresh, permissions = {}, intl) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr. No." />,
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "nameEnglish",
    header: (
      <FormattedMessage id="TASK.NAME_ENGLISH" defaultMessage="Task Name (English)" />
    ),
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
  {
    accessorKey: "nameGujarati",
    header: (
      <FormattedMessage id="TASK.NAME_GUJARATI" defaultMessage="Task Name (Gujarati)" />
    ),
    meta: { headerClassName: "w-[18%]", cellClassName: "w-[18%]" },
  },
  {
    accessorKey: "nameHindi",
    header: (
      <FormattedMessage id="TASK.NAME_HINDI" defaultMessage="Task Name (Hindi)" />
    ),
    meta: { headerClassName: "w-[18%]", cellClassName: "w-[18%]" },
  },
  {
    accessorKey: "resourceType",
    header: <FormattedMessage id="TASK.TYPE" defaultMessage="Type" />,
    cell: ({ row }) => {
      const labels = getResourceTypeLabels(intl);
      return labels[row.original.resourceType] || row.original.resourceType;
    },
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "isTrue",
    header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
    cell: ({ row, table }) => (
      <StatusCell
        row={row}
        onRefresh={table.options.meta?.onRefresh}
        permissions={permissions}
      />
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-1">
        {permissions.edit && (
          <Tooltip title={intl.formatMessage({ id: "TASK.EDIT_TASK", defaultMessage: "Edit Task" })}>
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
    meta: { headerClassName: "w-[14%]", cellClassName: "w-[14%]" },
  },
];

export const defaultData = [];

