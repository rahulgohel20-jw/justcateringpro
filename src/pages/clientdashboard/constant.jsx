import { DataGridColumnHeader } from "@/components";
import { FormattedMessage } from "react-intl";
import dayjs from "dayjs";

// Status Badge Component
export const STATUS_MAP = {
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

// Formats an incoming date/time string (e.g. "21/09/2026 08:00 AM") to "DD/MM/YYYY"
export const formatEventDate = (value) => {
  if (!value) return "-";
  const parsed = dayjs(value, ["DD/MM/YYYY hh:mm A", "DD/MM/YYYY"]);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : value;
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
    accessorKey: "eventStartDateTime",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={
          <FormattedMessage
            id="TABLE.EVENT_START_DATE"
            defaultMessage="Event Start Date"
          />
        }
      />
    ),
    cell: ({ row }) => formatEventDate(row.original?.eventStartDateTime),
  },
  {
    accessorKey: "eventEndDateTime",
    header: ({ column }) => (
      <DataGridColumnHeader
        column={column}
        title={
          <FormattedMessage
            id="TABLE.EVENT_END_DATE"
            defaultMessage="Event End Date"
          />
        }
      />
    ),
    cell: ({ row }) => formatEventDate(row.original?.eventEndDateTime),
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