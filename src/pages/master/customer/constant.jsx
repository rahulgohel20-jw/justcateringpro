import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (
  onEdit,
  onDelete,
  handleViewCustomer,
  permissions = {},
) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No" />,
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
  {
    accessorKey: "customer",
    header: (
      <FormattedMessage id="USER.MASTER.CUSTOMER_NAME" defaultMessage=" Name" />
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "address",
    header: (
      <FormattedMessage id="USER.MASTER.ADDRESS" defaultMessage="Address" />
    ),
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
  {
    accessorKey: "contact_type",
    header: (
      <FormattedMessage
        id="USER.MASTER.CONTACT_CATEGORY"
        defaultMessage=" Categories"
      />
    ),
    meta: {
      headerClassName: "w-[18%]",
      cellClassName: "w-[18%]",
    },
  },
  {
    accessorKey: "email",
    header: <FormattedMessage id="USER.MASTER.EMAIL" defaultMessage="Email" />,
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "mobile",
    header: (
      <FormattedMessage id="USER.MASTER.MOBILE_NO" defaultMessage="Mobile No" />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "gst",
    header: (
      <FormattedMessage id="USER.MASTER.GST_NO" defaultMessage="GST No" />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
{
    accessorKey: "pan",
    header: (
      <FormattedMessage id="USER.MASTER.GST_NO" defaultMessage="Pan Card" />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "birthdate",
    header: (
      <FormattedMessage id="USER.MASTER.BIRTHDATE" defaultMessage="Birthdate" />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "document",
    header: (
      <FormattedMessage id="USER.MASTER.DOCUMENT" defaultMessage="Document" />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },

  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          {/* <Tooltip className="cursor-pointer" title="View Customer">
            <button
              className="btn btn-sm btn-icon btn-clear"
              title="View"
              onClick={() => handleViewCustomer(row.original)}
            >
              <i className="ki-filled ki-eye text-success"></i>
            </button>
          </Tooltip> */}
          {permissions.edit && (
            <Tooltip className="cursor-pointer" title="Edit Customer">
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
              <button
                className="btn btn-sm btn-icon btn-clear"
                title="Delete"
                onClick={() => onDelete(row.original.customerid)}
              >
                <i className="ki-filled ki-trash  text-danger"></i>
              </button>
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
