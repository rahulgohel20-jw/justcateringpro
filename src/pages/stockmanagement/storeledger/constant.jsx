import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onDelete) => [
  {
    accessorKey: "date",
    header: <FormattedMessage id="STORE_LEDGER.DATE" defaultMessage="Date" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "vno",
    header: <FormattedMessage id="STORE_LEDGER.VNO" defaultMessage="VNo" />,
    meta: {
      headerClassName: "w-[14%]",
      cellClassName: "w-[14%]",
    },
  },
  {
    accessorKey: "supplier_name",
    header: (
      <FormattedMessage
        id="STORE_LEDGER.SUPPLIER_NAME"
        defaultMessage="Supplier / Party Name"
      />
    ),
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },
  {
    accessorKey: "bill_no",
    header: (
      <FormattedMessage id="STORE_LEDGER.BILL_NO" defaultMessage="Bill No" />
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "purchase",
    header: (
      <FormattedMessage
        id="STORE_LEDGER.PURCHASE"
        defaultMessage="Purchase"
      />
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "purchase_return",
    header: (
      <FormattedMessage
        id="STORE_LEDGER.PURCHASE_RETURN"
        defaultMessage="Purchase Return"
      />
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "sale",
    header: (
      <FormattedMessage id="STORE_LEDGER.STORE" defaultMessage="Store" />
    ),
    meta: {
      headerClassName: "w-[7%]",
      cellClassName: "w-[7%]",
    },
  },
  {
    accessorKey: "sale_return",
    header: (
      <FormattedMessage
        id="STORE_LEDGER.STORE_RETURN"
        defaultMessage="Store Return"
      />
    ),
    meta: {
      headerClassName: "w-[9%]",
      cellClassName: "w-[9%]",
    },
    
  },
  {
  accessorKey: "increase",
  header: (
    <FormattedMessage
      id="STORE_LEDGER.INCREASE"
      defaultMessage="Increase"
    />
  ),
  cell: ({ row }) => (
    <span className="font-semibold text-green-600">
      {row.original.increase ?? 0}
    </span>
  ),
  meta: {
    headerClassName: "w-[9%]",
    cellClassName: "w-[9%]",
  },
},
{
  accessorKey: "wastage",
  header: (
    <FormattedMessage
      id="STORE_LEDGER.WASTAGE"
      defaultMessage="Wastage"
    />
  ),
  cell: ({ row }) => (
    <span className="font-semibold text-red-600">
      {row.original.wastage ?? 0}
    </span>
  ),
  meta: {
    headerClassName: "w-[9%]",
    cellClassName: "w-[9%]",
  },
},
  // {
  //   accessorKey: "increase_qty",
  //   header: (
  //     <FormattedMessage
  //       id="STORE_LEDGER.INCREASE_QTY"
  //       defaultMessage="Increase Qty"
  //     />
  //   ),
  //   meta: {
  //     headerClassName: "w-[9%]",
  //     cellClassName: "w-[9%]",
  //   },
  // },
  // {
  //   accessorKey: "wastage_qty",
  //   header: (
  //     <FormattedMessage
  //       id="STORE_LEDGER.WASTAGE_QTY"
  //       defaultMessage="Wastage Qty"
  //     />
  //   ),
  //   meta: {
  //     headerClassName: "w-[9%]",
  //     cellClassName: "w-[9%]",
  //   },
  // },
  {
    accessorKey: "balance",
    header: (
      <FormattedMessage id="STORE_LEDGER.BALANCE" defaultMessage="Balance" />
    ),
    cell: ({ row }) => (
      <span className="font-semibold">{row.original.balance}</span>
    ),
    meta: {
      headerClassName: "w-[9%]",
      cellClassName: "w-[9%]",
    },
  },
  // {
  //   accessorKey: "action",
  //   header: (
  //     <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />
  //   ),
  //   cell: ({ row }) => (
  //     <div className="flex items-center gap-1">
  //       <Tooltip title="Delete">
  //         <button
  //           className="btn btn-sm btn-icon btn-clear"
  //           title="Delete"
  //           onClick={() => onDelete(row.index)}
  //         >
  //           <i className="ki-filled ki-trash text-danger"></i>
  //         </button>
  //       </Tooltip>
  //     </div>
  //   ),
  //   meta: {
  //     headerClassName: "w-[5%]",
  //     cellClassName: "w-[5%]",
  //   },
  // },
];

export const defaultData = [
  {
    date: "25-02-2026",
    vno: "-",
    supplier_name: "OPB",
    bill_no: "-",
    purchase: 0,
    purchase_return: 0,
    sale: 0,
    sale_return: 0,
    increase_qty: 0,
    wastage_qty: 0,
    balance: "5.611 KG",
  },
];