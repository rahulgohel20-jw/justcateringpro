import { Popconfirm, Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, onstatus, permissions = {}) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr. No." />,
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "name",
    header: <FormattedMessage id="COMMON.NAME" defaultMessage="Name" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "rawtype",
    header: <FormattedMessage id="COMMON.TYPE" defaultMessage="Type" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "priority",
    header: <FormattedMessage id="COMMON.PRIORITY" defaultMessage="Sequence" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "status",
    header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
    cell: ({ row }) => {
      return (
        <Popconfirm
          title={`Are you sure you want to ${
            row.original.status ? "Deactivate" : "Activate"
          } this menu item?`}
          okText="Yes"
          cancelText="No"
          onConfirm={() => {
            onstatus(row.original.rawCatid, row.original.status);
            message.success(" Status updated successfully!");
          }}
        >
          <div className="flex items-center gap-1 cursor-pointer">
            <label className="switch switch-lg">
              <input type="checkbox" checked={row.original.status} readOnly />
            </label>
          </div>
        </Popconfirm>
      );
    },

    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },

  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          {permissions.edit && (
            <Tooltip className="cursor-pointer" title="Edit Contact">
              <button
                className="btn btn-sm btn-icon btn-clear"
                title="Edit"
                onClick={() => onEdit(row.original)}
              >
                <i className="ki-filled ki-notepad-edit text-primary"></i>
              </button>
            </Tooltip>
          )}
          {permissions.delete && (
            <Tooltip title="Delete">
              {/* <Link to="/menu-allocation"> */}
              <button
                className="btn btn-sm btn-icon btn-clear"
                title="Delete"
                onClick={() => onDelete(row.original.rawCatid)}
              >
                <i className="ki-filled ki-trash  text-danger"></i>
              </button>
              {/* </Link> */}
            </Tooltip>
          )}
        </div>
      );
    },
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
];

export const defaultData = [
  { sr_no: 1, contact_name: "Friend" },
  { sr_no: 2, contact_name: "Colleague" },
  { sr_no: 3, contact_name: "Relative" },
  { sr_no: 4, contact_name: "Business Manager" },
  { sr_no: 5, contact_name: "Friend" },
  { sr_no: 6, contact_name: "Friend" },
  { sr_no: 7, contact_name: "Colleague" },
  { sr_no: 8, contact_name: "Sales Man" },
];
