import { DataGridColumnHeader } from "@/components";
import { FormattedMessage } from "react-intl";


// Status Badge Component with Amount and Arrow
const StatusBadge = ({ status, amount }) => {
  const statusConfig = {
    up: {
      textColor: "text-green-700",

      arrow: "↑",
      arrowColor: "text-green-700",
    },
    down: {
      textColor: "text-red-700",

      arrow: "↓",
      arrowColor: "text-red-700",
    },
    neutral: {
      textColor: "text-grey-700",

      arrow: "-",
      arrowColor: "text-grey-700",
    },
  };

  const config = statusConfig[status] || statusConfig.Medium;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm font-medium border  ${config.textColor}`}
    >
      <span>{amount}</span>
      <span className={`text-base font-bold ${config.arrowColor}`}>
        {config.arrow}
      </span>
    </span>
  );
};

export const itemcolumns = [
  {
    accessorKey: "no",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={<FormattedMessage id="ITEM.SR_NO" defaultMessage="Sr No#" />}
        column={column}
      />
    ),
  },
  {
    accessorKey: "item",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={<FormattedMessage id="ITEM.ITEM_NAME" defaultMessage="Item" />}
        column={column}
      />
    ),
  },
  {
    accessorKey: "quantity",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={
          <FormattedMessage
            id="ITEM.CURRENT_QUANTITY"
            defaultMessage="Current Quantity"
          />
        }
        column={column}
      />
    ),
  },
  {
    accessorKey: "selling",
    header: ({ column }) => (
      <DataGridColumnHeader
        title={<FormattedMessage id="ITEM.STATUS" defaultMessage="Status" />}
        column={column}
      />
    ),
    cell: ({ row }) => {
      const status = row.original?.selling;
      const amount = row.original?.amount;
      return <StatusBadge status={status} amount={amount} />;
    },
  },
];

export const defaultitemData = [
  {
    Invoice: "1",
    item: "Wedding Decoration Set",
    quantity: "200",
    selling: "up",
    amount: "1.5",
  },
  {
    Invoice: "2",
    item: "LED Lights Package",
    quantity: "150",
    selling: "High",
    amount: "3.5",
  },
  {
    Invoice: "3",
    item: "Sound System",
    quantity: "50",
    selling: "Low",
    amount: "1",
  },
  {
    Invoice: "4",
    item: "Catering Equipment",
    quantity: "100",
    selling: "Low",
    amount: "3",
  },
  {
    Invoice: "5",
    item: "Stage Setup",
    quantity: "75",
    selling: "High",
    amount: "2",
  },
  {
    Invoice: "6",
    item: "Furniture Rental",
    quantity: "300",
    selling: "Low",
    amount: "2.1",
  },
];
