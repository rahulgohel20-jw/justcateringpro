import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, onPrint, onExcel) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No." />,
    meta: { headerClassName: "w-[4%]", cellClassName: "w-[4%]" },
  },
  {
    accessorKey: "voucher",
    header: <FormattedMessage id="PURCHASE.VOUCHER_NO" defaultMessage="Voucher No." />,
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "grnNumber",
    header: <FormattedMessage id="GRNNUMBER" defaultMessage="GRN Number " />,
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "podate",
    header: <FormattedMessage id="PURCHASE.VOUCHER_DATE" defaultMessage="Voucher Date" />,
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "supplierName",
    header: <FormattedMessage id="PURCHASE.PARTY" defaultMessage="Vendor" />,
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
    {
      accessorKey: "finalamount",
      header: <FormattedMessage id="PURCHASE.TOTAL" defaultMessage="Total Price" />,
      meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    },
  {
    accessorKey: "invoicetype",
    header: <FormattedMessage id="PURCHASE.INVOICE_TYPE" defaultMessage="Invoice Type" />,
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "billno",
    header: <FormattedMessage id="PURCHASE.BILL_NO" defaultMessage="Bill No." />,
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
    cell: ({ getValue }) => getValue() || "—",
  },
  {
    accessorKey: "remarks",
    header: <FormattedMessage id="PURCHASE.REMARK" defaultMessage="Remark" />,
    meta: { headerClassName: "w-[16%]", cellClassName: "w-[16%]" },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {onEdit && (
          <Tooltip title={<FormattedMessage id="COMMON.EDIT" defaultMessage="Edit" />}>
            <button className="btn btn-sm btn-icon btn-clear" onClick={() => onEdit(row.original)}>
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title={<FormattedMessage id="COMMON.DELETE" defaultMessage="Delete" />}>
            <button className="btn btn-sm btn-icon btn-clear" onClick={() => onDelete(row.original.id)}>
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
        )}
        {onPrint && (
          <Tooltip title={<FormattedMessage id="COMMON.PRINT" defaultMessage="Print" />}>
            <button className="btn btn-sm btn-icon btn-clear" onClick={() => onPrint(row.original)}>
              <i className="ki-filled ki-printer text-green-700"></i>
            </button>
          </Tooltip>
        )}
        {onExcel && (
          <Tooltip title={<FormattedMessage id="COMMON.EXCEL" defaultMessage="Excel" />}>
            <button className="btn btn-sm btn-icon btn-clear" onClick={() => onExcel(row.original)}>
              <i className="ki-filled ki-file-down text-emerald-600"></i>
            </button>
          </Tooltip>
        )}
        {!onEdit && !onDelete && !onPrint && !onExcel && (
          <span className="text-xs text-gray-400">—</span>
        )}
      </div>
    ),
  },
];

export const getRowClassName = (row) => {
  const hasBillNo = !!String(row?.original?.billno ?? "").trim();
  return hasBillNo
    ? "!bg-blue-50 "
    : "!bg-green-50 ";
};