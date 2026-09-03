import { DataGridColumnHeader } from "@/components";
import { Link } from "react-router-dom";
import { Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (permissions = {}) => [
  {
    accessorKey: "Invoice",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={<FormattedMessage id="SALES.SR_NO" defaultMessage="Sr No#" />}
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
            id="SALES.CUSTOMER_NAME"
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
          <FormattedMessage id="SALES.EVENT_NAME" defaultMessage="Event Name" />
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
          <FormattedMessage id="SALES.EVENT_DATE" defaultMessage="Event Date" />
        }
        column={column}
      />
    ),
  },
  {
    accessorKey: "QuotationDate",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={
          <FormattedMessage
            id="SALES.QUOTATION_DATE"
            defaultMessage="Quotation Date"
          />
        }
        column={column}
      />
    ),
  },
  {
    accessorKey: "TotalAmount",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={
          <FormattedMessage
            id="SALES.TOTAL_AMOUNT"
            defaultMessage="Total Amount"
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
          <FormattedMessage id="SALES.TOTAL_PAID" defaultMessage="Total Paid" />
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
            id="SALES.BALANCE_DUE"
            defaultMessage="Balance Due"
          />
        }
        column={column}
      />
    ),
  },
  
  // {
  //   accessorKey: "status",
  //   header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
  //   cell: ({ row }) => {
  //     const PartyId = row.original?.PartyId;
  //     const eventId = row.original?.EventId;
  //     return (
  //       <div className="flex items-center gap-2">
  //         {permissions.view && (
  //           <Tooltip title="View">
  //             <Link to={`/sales/quotation-list/${PartyId}/${eventId}`}>
  //               <button
  //                 className="btn btn-sm btn-icon btn-clear text-primary border border-[#E3E3E3]"
  //                 title="View"
  //               >
  //                 <i className="ki-filled ki-eye text-purple-700"></i>
  //               </button>
  //             </Link>
  //           </Tooltip>
  //         )}
  //       </div>
  //     );
  //   },
  // },
];

export const defaultData = [];
