import { Popconfirm, Tooltip, Switch } from "antd";
import { updateCaptainReceipeStatusById } from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, permissions = {}, refreshData, intl) => [
  {
    accessorKey: "sr_no",
    header: intl.formatMessage({ id: "COMMON.SR_NO", defaultMessage: "Sr No" }),
    meta: { headerClassName: "w-[5%]", cellClassName: "w-[5%]" },
  },
  {
    accessorKey: "name",
    header: intl.formatMessage({ id: "COMMON.NAME", defaultMessage: "Name" }),
    meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
  },
  {
    accessorKey: "unitName",
    header: intl.formatMessage({ id: "COMMON.UNIT", defaultMessage: "Unit" }),
    meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
  },
  {
    accessorKey: "rate",
    header: intl.formatMessage({ id: "COMMON.RATE", defaultMessage: "Rate" }),
    meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
  },
  {
    accessorKey: "weight",
    header: intl.formatMessage({ id: "COMMON.WEIGHT", defaultMessage: "Weight" }),
    meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
  },
  {
    accessorKey: "isActive",
    header: intl.formatMessage({ id: "COMMON.STATUS", defaultMessage: "Status" }),
    cell: ({ row }) => {
      const record = row.original;
      const handleToggle = async (checked) => {
        try {
          await updateCaptainReceipeStatusById(record.id, checked);
          refreshData?.();
          Swal.fire({
            icon: "success",
            title: checked
              ? intl.formatMessage({ id: "CAPTAIN_RECIPE.RECIPE_ACTIVATED", defaultMessage: "Recipe Activated" })
              : intl.formatMessage({ id: "CAPTAIN_RECIPE.RECIPE_DEACTIVATED", defaultMessage: "Recipe Deactivated" }),
            timer: 1500,
            showConfirmButton: false,
          });
        } catch (err) {
          console.error("Status update failed:", err);
          Swal.fire({
            icon: "error",
            title: intl.formatMessage({ id: "CAPTAIN_RECIPE.STATUS_UPDATE_FAILED", defaultMessage: "Failed to update status" }),
          });
        }
      };
      return (
        <Tooltip
          title={
            record.isActive
              ? intl.formatMessage({ id: "COMMON.ACTIVE", defaultMessage: "Active" })
              : intl.formatMessage({ id: "COMMON.INACTIVE", defaultMessage: "Inactive" })
          }
        >
          <Switch
            checked={record.isActive}
            onChange={handleToggle}
            checkedChildren={intl.formatMessage({ id: "COMMON.ON", defaultMessage: "On" })}
            unCheckedChildren={intl.formatMessage({ id: "COMMON.OFF", defaultMessage: "Off" })}
            size="small"
          />
        </Tooltip>
      );
    },
    meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
  },
  {
    accessorKey: "actions",
    header: intl.formatMessage({ id: "COMMON.ACTIONS", defaultMessage: "Actions" }),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        {permissions.edit && (
          <Tooltip title={intl.formatMessage({ id: "COMMON.EDIT", defaultMessage: "Edit" })}>
            <button
              className="btn btn-sm btn-icon btn-clear btn-primary"
              onClick={() => onEdit(row.original)}
            >
              <i className="ki-filled ki-notepad-edit" />
            </button>
          </Tooltip>
        )}
        {permissions.delete && (
          <Popconfirm
            title={intl.formatMessage({ id: "CAPTAIN_RECIPE.DELETE_CONFIRM_QUESTION", defaultMessage: "Are you sure to delete this recipe?" })}
            onConfirm={() => onDelete(row.original.id)}
            okText={intl.formatMessage({ id: "COMMON.YES", defaultMessage: "Yes" })}
            cancelText={intl.formatMessage({ id: "COMMON.NO", defaultMessage: "No" })}
          >
            <Tooltip title={intl.formatMessage({ id: "COMMON.DELETE", defaultMessage: "Delete" })}>
              <button className="btn btn-sm btn-icon btn-clear btn-danger">
                <i className="ki-filled ki-trash" />
              </button>
            </Tooltip>
          </Popconfirm>
        )}
      </div>
    ),
    meta: { headerClassName: "w-[25%]", cellClassName: "w-[25%]" },
  },
];