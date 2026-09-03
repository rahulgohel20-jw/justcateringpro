import { DataGridColumnHeader } from "@/components";
import { Link } from "react-router-dom";
import { Tooltip } from "antd";

export const columns = (permissions = {}) => [
  {
    accessorKey: "Invoice",
    header: ({ column }) => (
      <DataGridColumnHeader title="Sr No#" column={column} />
    ),
  },
  {
    accessorKey: "CustomerName",
    header: ({ column }) => (
      <DataGridColumnHeader title="Customer Name" column={column} />
    ),
  },
  {
    accessorKey: "Eventname",
    header: ({ column }) => (
      <DataGridColumnHeader title="Event Name" column={column} />
    ),
  },
  {
    accessorKey: "eventDate",
    header: ({ column }) => (
      <DataGridColumnHeader title="Event Date" column={column} />
    ),
  },
  {
    accessorKey: "invoiceDate",
    header: ({ column }) => (
      <DataGridColumnHeader title="Invoice Date" column={column} />
    ),
  },

  {
    accessorKey: "Amount",
    header: ({ column }) => (
      <DataGridColumnHeader title="Total Paid" column={column} />
    ),
  },
  {
    accessorKey: "BalanceDue",
    header: ({ column }) => (
      <DataGridColumnHeader title="Balance Due" column={column} />
    ),
  },
  
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const PartyId = row.original?.PartyId;
      const eventId = row.original?.EventId;
      return (
        <div className="flex items-center gap-2">
          {permissions.view && (
            <Tooltip title="View">
              <Link to={`/sales/invoice-list`}>
                <button
                  className="btn btn-sm btn-icon btn-clear text-primary border border-[#E3E3E3]"
                  title="View"
                >
                  <i className="ki-filled ki-eye text-purple-700"></i>
                </button>
              </Link>
            </Tooltip>
          )}
        </div>
      );
    },
  },
];

export const defaultData = [
  {
    Invoice: "INV-0001",
    CustomerName: "John Doe",
    Eventname: "Wedding Ceremony",
    eventDate: "2023-10-15",
    invoiceDate: "2023-09-30",
    Amount: "₹ 1,00,000.00",
    BalanceDue: "₹ 20,000.00",
  },
];
