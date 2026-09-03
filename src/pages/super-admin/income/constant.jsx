export const clientColumns = [
  {
    header: "Voucher No",
    accessorKey: "voucherNo",
  },
  {
    header: "Client Name",
    accessorKey: "clientName",
  },
  {
    header: "Amount",
    accessorKey: "amount",
    cell: ({ row }) => `₹${row.original.amount?.toLocaleString() ?? 0}`,
  },
  {
    header: "Payment Mode",
    accessorKey: "paymentMode",
    cell: ({ row }) => {
      const mode = row.original.paymentMode ?? "";
      const colors = {
        CASH: "bg-yellow-100 text-yellow-700 border border-yellow-200",
        UPI: "bg-purple-100 text-purple-700 border border-purple-200",
        BANK_TRANSFER: "bg-blue-100 text-blue-700 border border-blue-200",
        CHEQUE: "bg-pink-100 text-pink-700 border border-pink-200",
      };
      return (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-md ${colors[mode] ?? "bg-gray-100 text-gray-600"}`}
        >
          {mode.replace(/_/g, " ")}
        </span>
      );
    },
  },
  {
    header: "Date",
    accessorKey: "date",
  },
];
