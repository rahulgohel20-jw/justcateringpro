import { DataGridColumnHeader } from "@/components";
import { Link } from "react-router-dom";
import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const invoicecolumns = [
  {
    accessorKey: "Invoice",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={<FormattedMessage id="INVOICE.SR_NO" defaultMessage="Sr No#" />}
        column={column}
      />
    ),
  },
  {
    accessorKey: "CustomerName",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={
          <FormattedMessage
            id="INVOICE.CUSTOMER_NAME"
            defaultMessage="Customer Name"
          />
        }
        column={column}
      />
    ),
  },
  {
    accessorKey: "Eventname",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={
          <FormattedMessage
            id="INVOICE.EVENT_NAME"
            defaultMessage="Event Name"
          />
        }
        column={column}
      />
    ),
  },
  {
    accessorKey: "eventDate",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={
          <FormattedMessage
            id="INVOICE.EVENT_DATE"
            defaultMessage="Event Date"
          />
        }
        column={column}
      />
    ),
  },
  {
    accessorKey: "BalanceDue",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={
          <FormattedMessage
            id="INVOICE.BALANCE_DUE"
            defaultMessage="Balance Due"
          />
        }
        column={column}
      />
    ),
  },
];

export const defaultinvoiceData = [];
