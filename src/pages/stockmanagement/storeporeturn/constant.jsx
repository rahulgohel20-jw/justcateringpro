import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";
 
export const columns = (onEdit, onDelete, onPrint, onExcel, onWhatsApp) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No." />,
    meta: { headerClassName: "w-[4%]", cellClassName: "w-[4%]" },
  },
  {
    accessorKey: "issue_return_code",
    header: (
      <FormattedMessage
        id="PURCHASE.ISSUE_RETURN_CODE"
        defaultMessage="Issue Return Code."
      />
    ),
    
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "voucher_code",
    header: (
      <FormattedMessage id="PURCHASE.PO_CODE" defaultMessage="Voucher Code." />
    ),
    
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "voucher_date",
    header: (
      <FormattedMessage
        id="PURCHASE.VOUCHER_DATE"
        defaultMessage="Voucher Date"
      />
    ),
   
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "partyName",
    header: (
      <FormattedMessage id="PURCHASE.PARTY_NAME" defaultMessage="Party Name" />
    ),
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
  {
    accessorKey: "stockTypeName",
    header: <FormattedMessage id="PURCHASE.TYPE" defaultMessage="Type" />,
    meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
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
          <Tooltip title="Edit">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onEdit(row.original)}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
        )}

        {onDelete && (
          <Tooltip title="Delete">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onDelete(row.original.id)}
            >
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
        )}

        {onPrint && (
          <Tooltip title="Print">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onPrint(row.original)}
            >
              <i className="ki-filled ki-printer text-green-700"></i>
            </button>
          </Tooltip>
        )}

        {onExcel && (
          <Tooltip title="Excel">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onExcel(row.original)}
            >
              <i className="ki-filled ki-file-down text-emerald-600"></i>
            </button>
          </Tooltip>
        )}

        {onWhatsApp && (
          <Tooltip title="Send via WhatsApp">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onWhatsApp(row.original)}
            >
              <i className="ki-filled ki-whatsapp text-green-500"></i>
            </button>
          </Tooltip>
        )}

        {!onEdit && !onDelete && !onPrint && !onWhatsApp && (
          <span className="text-xs text-gray-400">—</span>
        )}
      </div>
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
];
 
export const defaultData = [
  {
    sr_no: 1,
    voucher_code: 6,
    voucher_date: "01.12.2024",
    stockTypeName: "Purchase Order",
    remarks: "CHALLAN",
  },
  {
    sr_no: 2,
    voucher_code: 10,
    voucher_date: "02.12.2024",
    stockTypeName: "Store Request",
    remarks: "KASHIMIRA",
  },
  {
    sr_no: 3,
    voucher_code: 1,
    voucher_date: "03.12.2024",
    stockTypeName: "Purchase Order",
    remarks: "KASHIMIRA",
  },
  {
    sr_no: 4,
    voucher_code: 3,
    voucher_date: "03.12.2024",
    stockTypeName: "Store Request",
    remarks: "KASHIMIRA",
  },
  {
    sr_no: 5,
    voucher_code: 5,
    voucher_date: "03.12.2024",
    stockTypeName: "Purchase Order",
    remarks: "",
  },
  {
    sr_no: 6,
    voucher_code: 7,
    voucher_date: "03.12.2024",
    stockTypeName: "Store Transfer",
    remarks: "KASHIMIRA CHALLAN",
  },
  {
    sr_no: 7,
    voucher_code: 36,
    voucher_date: "03.12.2024",
    stockTypeName: "Store Request",
    remarks: "KASHIMIRA",
  },
  
];
