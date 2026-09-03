import { DataGridColumnHeader } from "@/components";
import { Link } from "react-router-dom";
import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = [
  {
    accessorKey: "Invoice",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={
          <FormattedMessage
            id="INVOICE.SR_NO"
            defaultMessage="Invoice NO."
          />
        }
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
    accessorKey: "invoiceDate",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={
          <FormattedMessage
            id="INVOICE.INVOICE_DATE"
            defaultMessage="Invoice Date"
          />
        }
        column={column}
      />
    ),
  },
  {
    accessorKey: "Amount",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={
          <FormattedMessage
            id="INVOICE.TOTAL_AMOUNT"
            defaultMessage="Total Amount"
          />
        }
        column={column}
      />
    ),
  },
  {
    accessorKey: "Paid",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={
          <FormattedMessage
            id="INVOICE.TOTAL_PAID"
            defaultMessage="Total Paid"
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
  
  // {
  //   accessorKey: "status",
  //   header: (
  //     <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />
  //   ),
  //   cell: ({ row }) => {
  //     const PartyId = row.original?.PartyId;
  //     const eventId = row.original?.EventId;

  //     return (
  //       <div className="flex items-center gap-2">
  //         <Tooltip
  //           title={
  //             <FormattedMessage id="COMMON.VIEW" defaultMessage="વ્યૂ | व्यू" />
  //           }
  //         >
  //           <Link to={`/sales/invoice-list/${PartyId}/${eventId}`}>
  //             <button className="btn btn-sm btn-icon btn-clear text-primary border border-[#E3E3E3]">
  //               <i className="ki-filled ki-eye text-purple-700"></i>
  //             </button>
  //           </Link>
  //         </Tooltip>
  //       </div>
  //     );
  //   },
  // },
];

export const defaultData = [
  {
    Invoice: "INV-0001",
    CustomerName: "John ",
    Eventname: "Wedding Ceremony",
    eventDate: "2023-10-15",
    invoiceDate: "2023-09-30",
    Amount: "₹ 1,00,000.00",
    BalanceDue: "₹ 20,000.00",
  },
];
