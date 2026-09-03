import { DataGridColumnHeader } from "@/components";
import { FormattedMessage } from "react-intl";

export const columns = [
  {
    accessorKey: "srNo",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={
          <FormattedMessage
            id="COMMON.SR_NO"
            defaultMessage="Sr No."
          />
        }
      />
    ),
  },
  {
    accessorKey: "voucherNo",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={
          <FormattedMessage
            id="COMMON.VOUCHER_NO"
            defaultMessage="Voucher No"
          />
        }
      />
    ),
  },
  {
    accessorKey: "voucherdate",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={
          <FormattedMessage
            id="COMMON.VOUCHER_DATE"
            defaultMessage="Voucher Date"
          />
        }
      />
    ),
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={
          <FormattedMessage
            id="COMMON.AMOUNT"
            defaultMessage="Amount"
          />
        }
      />
    ),
    cell: ({ row }) => {
      const amount = Number(row.original.total) || 0;
      return (
        <span className="font-medium text-gray-900">
          ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      );
    },
  },
];