import { Switch, Tooltip } from "antd";
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
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "customer",
    header: (
      <FormattedMessage id="USER.MASTER.CUSTOMER_NAME" defaultMessage=" Name" />
    ),
    meta: {
      headerClassName: "w-[18%]",
      cellClassName: "w-[18%]",
    },
  },
  {
    accessorKey: "address",
    header: <FormattedMessage id="USER.MASTER.ADDRESS" defaultMessage="City" />,
    meta: {
      headerClassName: "w-[18%]",
      cellClassName: "w-[18%]",
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
    accessorKey: "connectivity",
    header: (
      <FormattedMessage
        id="USER.MASTER.ADDRESS"
        defaultMessage="Connectivity"
      />
    ),
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
  {
    accessorKey: "connectivity",
    header: (
      <FormattedMessage id="USER.MASTER.ADDRESS" defaultMessage="ON/OFF" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex justify-center">
          <Switch
            checked={row.original.connectivity}
            onChange={(checked) => {
              console.log("Toggle:", checked, row.original);
            }}
          />
        </div>
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
              {/* <Link to="/menu-allocation"> */}
              <button
                className="btn btn-sm btn-icon btn-clear"
                title="Delete"
                onClick={() => onDelete(row.original.customerid)}
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
