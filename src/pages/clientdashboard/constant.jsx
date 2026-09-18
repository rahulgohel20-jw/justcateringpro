import React from "react";
import { DataGridColumnHeader } from "@/components";
import { FormattedMessage } from "react-intl";

// Status Badge Component
const STATUS_MAP = {
  0: "Inquiry",
  1: "Confirmed",
  2: "Cancelled",
  3: "Tentative",
};

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
  Tentative: {
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
    borderColor: "border-yellow-300",
  },
};

const StatusBadge = ({ status }) => {
  const label = STATUS_MAP[status] ?? "Inquiry";
  const config = statusConfig[label] || statusConfig.Inquiry;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
    >
      {label}
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
