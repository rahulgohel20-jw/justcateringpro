import React from "react";
import { DataGridColumnHeader } from "@/components";
import { FormattedMessage } from "react-intl";

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    Confirmed: {
      bgColor: "bg-green-100",
      textColor: "text-green-700",
      borderColor: "border-green-300",
    },
    Inquiry: {
      bgColor: "bg-blue-100",
      textColor: "text-blue-700",
      borderColor: "border-gray-300",
    },
    Cancelled: {
      bgColor: "bg-red-100",
      textColor: "text-red-700",
      borderColor: "border-red-300",
    },
  };

  const config = statusConfig[status] || statusConfig.Inquiry;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {status}
    </span>
  );
};

export const columns = [
  {
    accessorKey: "Invoice",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={<FormattedMessage id="TABLE.SR_NO" defaultMessage="Sr No#" />}
      />
    ),
  },
  {
    accessorKey: "CustomerName",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={
          <FormattedMessage
            id="TABLE.CLIENT_NAME"
            defaultMessage="Client Name"
          />
        }
      />
    ),
  },
  {
    accessorKey: "Eventname",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={
          <FormattedMessage id="TABLE.EVENT_NAME" defaultMessage="Event Name" />
        }
      />
    ),
  },
  {
    accessorKey: "eventDate",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={
          <FormattedMessage
            id="TABLE.EVENT_DATE_TIME"
            defaultMessage="Event Date & Time"
          />
        }
      />
    ),
  },
  {
    accessorKey: "Venue",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={<FormattedMessage id="TABLE.VENUE" defaultMessage="Venue" />}
      />
    ),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={<FormattedMessage id="TABLE.STATUS" defaultMessage="Status" />}
      />
    ),
    cell: ({ row }) => {
      const status = row.original?.status;
      return <StatusBadge status={status} />;
    },
  },
];

export const defaultData = [];
