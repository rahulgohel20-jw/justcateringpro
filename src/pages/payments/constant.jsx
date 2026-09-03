import { DataGridColumnHeader } from "@/components";
import { FormattedMessage } from "react-intl";

export const columns = [
  {
    accessorKey: "voucherno",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={
          <FormattedMessage
            id="COMMON.VOUCHERNO"
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
            id="COMMON.VOUCHERDATE"
            defaultMessage="Voucher Date"
          />
        }
      />
    ),
  },
  {
    accessorKey: "bankname",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={
          <FormattedMessage
            id="COMMON.BANKCASHNAME"
            defaultMessage="Bank/Cash Name"
          />
        }
      />
    ),
    cell: ({ row }) => {
      const { bankname, cashname } = row.original;
      const isMissing = !bankname || bankname === "-";
      return <span>{isMissing ? cashname || "-" : bankname}</span>;
    },
  },
  {
    accessorKey: "accountname",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={
          <FormattedMessage
            id="COMMON.ACCOUNTNAME"
            defaultMessage="Account Name"
          />
        }
      />
    ),
  },
  {
    accessorKey: "modeofpayment",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={
          <FormattedMessage
            id="COMMON.MODEOFPAYMENT"
            defaultMessage="Mode Of Payment"
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
            id="COMMON.TOTAL"
            defaultMessage="Total"
          />
        }
      />
    ),
  },
];

export const defaultData = [];