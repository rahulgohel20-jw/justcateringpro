import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

const show = (v) => (v === null || v === undefined || v === "" ? "—" : v);

export const columns = (onEdit, onDelete) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No." />,
    meta: { headerClassName: "w-[5%]", cellClassName: "w-[5%]" },
  },
  {
    accessorKey: "voucher", // mapped from pocode in the list component
    header: (
      <FormattedMessage id="NORMAL_PO.VOUCHER_NO" defaultMessage="PO Code" />
    ),
    meta: { headerClassName: "w-[13%]", cellClassName: "w-[13%]" },
    cell: ({ row }) => show(row.original.voucher),
  },
  {
    accessorKey: "podate",
    header: <FormattedMessage id="COMMON.DATE" defaultMessage="Date" />,
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    cell: ({ row }) => show(row.original.podate),
  },
  {
    accessorKey: "billno",
    header: <FormattedMessage id="NORMAL_PO.BILL_NO" defaultMessage="Bill No." />,
    meta: { headerClassName: "w-[9%]", cellClassName: "w-[9%]" },
    cell: ({ row }) => show(row.original.billno),
  },
  {
    accessorKey: "supplierId",
    header: (
      <FormattedMessage id="NORMAL_PO.VENDOR_NAME" defaultMessage="Vendor" />
    ),
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
    cell: ({ row }) =>
      show(
        row.original.supplierName ||
          row.original.vendorName ||
          row.original.supplierId,
      ),
  },
  {
    accessorKey: "eventId",
    header: <FormattedMessage id="NORMAL_PO.EVENT" defaultMessage="Event" />,
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
    cell: ({ row }) =>
      show(row.original.eventName || row.original.eventId),
  },
  {
    accessorKey: "stockTypeId",
    header: <FormattedMessage id="NORMAL_PO.TYPE" defaultMessage="Type" />,
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
    cell: ({ row }) =>
      show(row.original.stockTypeName || row.original.stockTypeId),
  },
  {
    accessorKey: "remark",
    header: <FormattedMessage id="NORMAL_PO.REMARK" defaultMessage="Remark" />,
    meta: { headerClassName: "w-[13%]", cellClassName: "w-[13%]" },
    cell: ({ row }) => show(row.original.remark),
  },
  {
    accessorKey: "grandTotal",
    header: (
      <FormattedMessage id="NORMAL_PO.GRAND_TOTAL" defaultMessage="Grand Total" />
    ),
    meta: { headerClassName: "w-[10%] text-end", cellClassName: "w-[10%] text-end" },
    cell: ({ row }) => Number(row.original.grandTotal ?? 0).toFixed(2),
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {onEdit && (
          <Tooltip
            title={<FormattedMessage id="COMMON.EDIT" defaultMessage="Edit" />}
          >
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onEdit(row.original)}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip
            title={
              <FormattedMessage id="COMMON.DELETE" defaultMessage="Delete" />
            }
          >
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onDelete(row.original)}
            >
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
        )}
        {!onEdit && !onDelete && (
          <span className="text-xs text-gray-400">—</span>
        )}
      </div>
    ),
  },
];