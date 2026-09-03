import { DataGridColumnHeader } from "@/components";
import { FormattedMessage } from "react-intl";

// Reusable Status Dropdown component

export const columns = [
  {
    accessorKey: "Sr",
    header: ({ column }) => <DataGridColumnHeader title={<FormattedMessage id="COMMON.SR" defaultMessage="Sr" />} column={column} />,
  },
  {
    accessorKey: "Date",
    header: ({ column }) => (
      <DataGridColumnHeader title={<FormattedMessage id="COMMON.DATE" defaultMessage="Date" />} column={column} />
    ),
  },
  {
    accessorKey: "Time",
    header: ({ column }) => (
      <DataGridColumnHeader title={<FormattedMessage id="COMMON.TIME" defaultMessage="Time" />} column={column} />
    ),
  },
  {
    accessorKey: "Username",
    header: ({ column }) => (
      <DataGridColumnHeader title={<FormattedMessage id="COMMON.USERNAME" defaultMessage="Username" />} column={column} />
    ),
  },
  {
    accessorKey: "ip_Address",
    header: ({ column }) => (
      <DataGridColumnHeader title={<FormattedMessage id="COMMON.IP_ADDRESS" defaultMessage="IP Address" />} column={column} />
    ),
  },
];

export const defaultData = [
  {
    id: 1,
    Sr: "1",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
  {
    id: 2,
    Sr: "2",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
  {
    id: 3,
    Sr: "3",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
  {
    id: 4,
    Sr: "4",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
  {
    id: 5,
    Sr: "5",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
  {
    id: 6,
    Sr: "6",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
  {
    id: 7,
    Sr: "7",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
  {
    id: 8,
    Sr: "8",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
  {
    id: 9,
    Sr: "9",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
  {
    id: 10,
    Sr: "10",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
  {
    id: 11,
    Sr: "11",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
  {
    id: 12,
    Sr: "12",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
  {
    id: 13,
    Sr: "13",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
  {
    id: 14,
    Sr: "14",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
  {
    id: 15,
    Sr: "15",
    Date: "05/08/2025",
    Time: "01:20 AM",
    Username: "Swapnilghodeswar",
    ip_Address: "103.85.10.208",
  },
];
