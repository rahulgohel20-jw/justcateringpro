import { DataGridColumnHeader } from "@/components";
export const columns = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <DataGridColumnHeader title="Timestamp" column={column} />
    ),
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataGridColumnHeader title="Type" column={column} />
    ),
  },
  {
    accessorKey: "remarks",
    header: ({ column }) => (
      <DataGridColumnHeader title="Remarks" column={column} />
    ),
  },
  {
    accessorKey: "amount",
    header: ({ column }) => (
      <DataGridColumnHeader title="Amount" column={column} />
    ),
  },
  
];
export const defaultData = [
 
];
