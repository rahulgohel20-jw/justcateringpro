import { Tooltip } from "antd";
import { FormattedMessage, useIntl } from "react-intl";

export const columns = (onEdit, permissions = {}, intl) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No" />,
    meta: {
      headerClassName: "w-[5%]",
      cellClassName: "w-[5%]",
    },
  },
  {
    accessorKey: "accountHolderName",
    header: (
      <FormattedMessage
        id="BANK.ACCOUNT_HOLDER_NAME"
        defaultMessage="Account Holder Name"
      />
    ),
    meta: {
      headerClassName: "w-[15%]",
      cellClassName: "w-[15%]",
    },
  },
  {
    accessorKey: "accountNo",
    header: (
      <FormattedMessage
        id="BANK.ACCOUNT_NUMBER"
        defaultMessage="Account Number"
      />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "bankName",
    header: <FormattedMessage id="BANK.BANK_NAME" defaultMessage="Bank Name" />,
    meta: {
      headerClassName: "w-[15%]",
      cellClassName: "w-[15%]",
    },
  },
  {
    accessorKey: "branchName",
    header: (
      <FormattedMessage id="BANK.BRANCH_NAME" defaultMessage="Branch Name" />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "ifscCode",
    header: <FormattedMessage id="BANK.IFSC_CODE" defaultMessage="IFSC Code" />,
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
  {
    accessorKey: "upiId",
    header: <FormattedMessage id="BANK.UPI_ID" defaultMessage="UPI ID" />,
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "openingDate",
    header: <FormattedMessage id="BANK.OPENING_DATE_SHORT" defaultMessage="OP Date" />,
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "openingBalance",
    header: <FormattedMessage id="BANK.OPENING_BALANCE_SHORT" defaultMessage="Op Balance" />,
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "currentBalance",
    header: (
      <FormattedMessage id="BANK.CURRENT_BALANCE" defaultMessage="Current Balance" />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "isPrimary",
    header: (
      <FormattedMessage id="BANK.PRIMARY_ACCOUNT" defaultMessage="Primary" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          {row.original.isPrimary ? (
            <span className="badge badge-sm badge-success">
              <i className="ki-filled ki-check"></i>{" "}
              <FormattedMessage id="BANK.PRIMARY_ACCOUNT" defaultMessage="Primary" />
            </span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      );
    },
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-1">
          {permissions.edit && (
            <Tooltip
              title={intl.formatMessage({
                id: "BANK.EDIT_BANK_DETAILS_TOOLTIP",
                defaultMessage: "Edit Bank Details",
              })}
            >
              <button
                className="btn btn-sm btn-icon btn-clear"
                title={intl.formatMessage({ id: "COMMON.EDIT", defaultMessage: "Edit" })}
                onClick={() => onEdit(row.original)}
              >
                <i className="ki-filled ki-notepad-edit text-primary"></i>
              </button>
            </Tooltip>
          )}
          {/* {permissions.delete && (
            <Tooltip title="Delete Bank Details">
              <button
                className="btn btn-sm btn-icon btn-clear"
                title="Delete"
                onClick={() => onDelete(row.original.id)}
              >
                <i className="ki-filled ki-trash text-danger"></i>
              </button>
            </Tooltip>
          )} */}
        </div>
      );
    },
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
];