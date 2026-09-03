import { DataGridColumnHeader } from "@/components";

export const getColumns = (onDelete, onEdit, onView) => [
  {
    accessorKey: "sr_no",
    header: ({ column }) => (
      <DataGridColumnHeader title="SR_NO" column={column} />
    ),
  },
  {
    accessorKey: "plan_name",
    header: ({ column }) => (
      <DataGridColumnHeader title="Plan Name" column={column} />
    ),
  },
  {
    accessorKey: "billingCycle",
    header: ({ column }) => (
      <DataGridColumnHeader title="Billing Cycle" column={column} />
    ),
  },
  {
    accessorKey: "isPopular",
    header: ({ column }) => (
      <DataGridColumnHeader title="Is Popular" column={column} />
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataGridColumnHeader title="Price" column={column} />
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => {
      const plan = row.original;
      return (
        <div className="flex items-center justify-center gap-1">
          {/* {permissions.view && ( */}
          <button
            className="btn btn-sm btn-icon btn-clear"
            title="View"
            onClick={() => onView(plan)}
          >
            <i className="ki-filled ki-eye text-success"></i>
          </button>
          {/* )} */}

          {/* {permissions.edit && ( */}
          <button
            className="btn btn-sm btn-icon btn-clear"
            title="Edit"
            onClick={() => onEdit(plan)} // ✅ Trigger edit
          >
            <i className="ki-filled ki-notepad-edit text-primary"></i>
          </button>
          {/* )} */}

          {/* {permissions.delete && ( */}
          {/* <button
            className="btn btn-sm btn-icon btn-clear"
            title="Delete"
            onClick={() => onDelete(plan.id)} // ✅ Trigger delete
          >
            <i className="ki-filled ki-trash text-danger"></i>
          </button> */}
          {/* )} */}
        </div>
      );
    },
  },
];
