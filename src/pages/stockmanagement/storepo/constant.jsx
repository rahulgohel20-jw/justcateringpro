import { Tooltip } from "antd";
import { FileText } from "lucide-react";
import { FormattedMessage } from "react-intl";
 
export const columns = (onEdit, onDelete, onPrint, onExcel, onStorePoPdf) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No." />,
    meta: { headerClassName: "w-[4%]", cellClassName: "w-[4%]" },
  },
  {
    accessorKey: "pocode",
    header: (
      <FormattedMessage id="PURCHASE.PO_CODE" defaultMessage="PO Code." />
    ),
    
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "crcode",
    header: <FormattedMessage id="PURCHASE.CRCODE" defaultMessage="CR Code" />,
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "podate",
    header: (
      <FormattedMessage
        id="PURCHASE.VOUCHER_DATE"
        defaultMessage="Voucher Date"
      />
    ),
    
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "stockTypeName",
    header: <FormattedMessage id="COMMON.GODOWNSIDEBAR_MASTER" defaultMessage="Godown" />,
    meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
  },
  {
    accessorKey: "kitchenTypeName",
    header: <FormattedMessage id="PURCHASE.KITCHEN" defaultMessage="Kitchen" />,
    meta: { headerClassName: "w-[15%]", cellClassName: "w-[15%]" },
  },
 {
    accessorKey: "partyName",
    header: (
      <FormattedMessage id="PURCHASE.EVENTS" defaultMessage="Party Name" />
    ),
  
   cell: ({ row }) => {
     const { partyName, eventName, eventDate } = row.original;

     if (!partyName) {
       return <span className="text-xs text-gray-400">—</span>;
     }

     if (eventName && eventDate) {
       return (
         <span>
           {partyName} ({eventName}) ({eventDate})
         </span>
       );
     }

     return <span>{partyName}</span>;
   },
    meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  },
  {
    accessorKey: "remarks",
    header: <FormattedMessage id="PURCHASE.REMARK" defaultMessage="Remark" />,
    meta: { headerClassName: "w-[16%]", cellClassName: "w-[16%]" },
  },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => {
      const status = String(
        row?.original?.status ||
        row?.original?.issueStatus ||
        row?.original?.statusName ||
        ""
      ).toLowerCase();

      const isCompleted = status === "completed";

      return (
        <div className="flex items-center gap-1">
          {/* Hide Edit when completed */}
          {onEdit && !isCompleted && (
            <Tooltip title="Edit">
              <button
                className="btn btn-sm btn-icon btn-clear"
                onClick={() => onEdit(row.original)}
              >
                <i className="ki-filled ki-notepad-edit text-primary"></i>
              </button>
            </Tooltip>
          )}

          {/* Hide Delete when completed */}
          {onDelete && !isCompleted && (
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

          {onStorePoPdf && (
    <Tooltip title="Issue Return Report">
      <button
        className="btn btn-sm btn-icon btn-clear"
        onClick={() => onStorePoPdf(row.original)}
      >
        <FileText className="w-4 h-4 text-blue-600" />
      </button>
    </Tooltip>
  )}


          {!onPrint && !onExcel && !onStorePoPdf && (!onEdit || isCompleted) && (!onDelete || isCompleted) && (
    <span className="text-xs text-gray-400">—</span>
  )}
        </div>
      );
    },
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
];


export const getRowClassName = (row) => {
  const status = String(
    row?.original?.status ||
    row?.original?.issueStatus ||
    row?.original?.statusName ||
    ""
  ).toLowerCase();

  if (status === "completed") {
    return "completed-row";
  }
  return "";
};


export const defaultData = [
  {
    sr_no: 1,
    purchaseid: 1,
    voucher_no: 6,
    voucher_date: "01.12.2024",
    type: "Purchase Order",
    events: "Annual Catering 2024",
    remark: "CHALLAN",
  },
  {
    sr_no: 2,
    purchaseid: 2,
    voucher_no: 10,
    voucher_date: "02.12.2024",
    type: "Store Request",
    events: "Wedding Reception",
    remark: "KASHIMIRA",
  },
  {
    sr_no: 3,
    purchaseid: 3,
    voucher_no: 1,
    voucher_date: "03.12.2024",
    type: "Purchase Order",
    events: "Corporate Lunch",
    remark: "KASHIMIRA",
  },
  {
    sr_no: 4,
    purchaseid: 4,
    voucher_no: 3,
    voucher_date: "03.12.2024",
    type: "Store Request",
    events: "Birthday Banquet",
    remark: "KASHIMIRA",
  },
  {
    sr_no: 5,
    purchaseid: 5,
    voucher_no: 5,
    voucher_date: "03.12.2024",
    type: "Purchase Order",
    events: "Festival Dinner",
    remark: "",
  },
  {
    sr_no: 6,
    purchaseid: 6,
    voucher_no: 7,
    voucher_date: "03.12.2024",
    type: "Store Transfer",
    events: "Conference Catering",
    remark: "KASHIMIRA CHALLAN",
  },
  {
    sr_no: 7,
    purchaseid: 7,
    voucher_no: 36,
    voucher_date: "03.12.2024",
    type: "Store Request",
    events: "Sports Day Event",
    remark: "KASHIMIRA",
  },
  
];
