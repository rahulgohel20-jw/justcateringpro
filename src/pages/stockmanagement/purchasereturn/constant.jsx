import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";
 
export const columns = (onEdit, onDelete, onPrint, onExcel) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No." />,
    meta: { headerClassName: "w-[4%]", cellClassName: "w-[4%]" },
  },
  {
    accessorKey: "voucher_no",
    header: (
      <FormattedMessage id="PURCHASE.VOUCHER_NO" defaultMessage="Voucher No." />
    ),
    
    meta: { headerClassName: "w-[16%]", cellClassName: "w-[16%]" },
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
    accessorKey: "party",
    header: <FormattedMessage id="PURCHASE.PARTY" defaultMessage="Party" />,
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
  {
    accessorKey: "total",
    header: (
      <FormattedMessage id="PURCHASE.TOTAL" defaultMessage="Total Price" />
    ),
   
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "bill_no",
    header: (
      <FormattedMessage id="PURCHASE.BILL_NO" defaultMessage="Bill No." />
    ),
  
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "remark",
    header: <FormattedMessage id="PURCHASE.REMARK" defaultMessage="Remark" />,
    meta: { headerClassName: "w-[16%]", cellClassName: "w-[16%]" },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        {/* Edit — only if onEdit handler provided */}
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
 
        {/* Delete — only if onDelete handler provided */}
        {onDelete && (
          <Tooltip title="Delete">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onDelete(row.original.purchaseid)}
            >
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
        )}
 
        {/* Print — always visible */}
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
          <Tooltip
            title={
              <FormattedMessage id="COMMON.EXCEL" defaultMessage="Excel" />
            }
          >
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onExcel(row.original)}
            >
              <i className="ki-filled ki-file-down text-emerald-600"></i>
            </button>
          </Tooltip>
        )}
 
        {/* Fallback when no actions available */}
        {!onEdit && !onDelete && !onPrint && (
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
    purchaseid: 1,
    voucher_no: 6,
    voucher_date: "01.12.2024",
    party: "VERTEX ENTERPRISES",
    total: 0,
    bill_no: "12",
    remark: "CHALLAN",
  },
  {
    sr_no: 2,
    purchaseid: 2,
    voucher_no: 10,
    voucher_date: "02.12.2024",
    party: "M STYLE UNIFORM",
    total: 47250,
    bill_no: "234",
    remark: "KASHIMIRA",
  },
  {
    sr_no: 3,
    purchaseid: 3,
    voucher_no: 1,
    voucher_date: "03.12.2024",
    party: "NOBLE SALES (NESTLE)",
    total: 43200,
    bill_no: "NS24/9323",
    remark: "KASHIMIRA",
  },
  {
    sr_no: 4,
    purchaseid: 4,
    voucher_no: 3,
    voucher_date: "03.12.2024",
    party: "FARIDI IMPEX",
    total: 50471.48,
    bill_no: "24-25/F015044",
    remark: "KASHIMIRA",
  },
  {
    sr_no: 5,
    purchaseid: 5,
    voucher_no: 5,
    voucher_date: "03.12.2024",
    party: "RATAN MARKETING",
    total: 134313.28,
    bill_no: "RM/3224/24-25",
    remark: "",
  },
  {
    sr_no: 6,
    purchaseid: 6,
    voucher_no: 7,
    voucher_date: "03.12.2024",
    party: "I CON UNIFORMS",
    total: 0,
    bill_no: "561",
    remark: "KASHIMIRA CHALLAN",
  },
  {
    sr_no: 7,
    purchaseid: 7,
    voucher_no: 36,
    voucher_date: "03.12.2024",
    party: "PATNI AGENCY",
    total: 9150,
    bill_no: "013335",
    remark: "KASHIMIRA",
  },
];
 