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
  accessorKey: "description",
  header: ({ column }) => (
    <DataGridColumnHeader title="Description" column={column} />
  ),
  cell: ({ row }) => {
    const text = row.original.description;
    return (
      <span
        className="block max-w-[260px] truncate"
        title={text || ""}
      >
        {text || "-"}
      </span>
    );
  },
},
{
  accessorKey: "features",
  header: ({ column }) => (
    <DataGridColumnHeader title="Features" column={column} />
  ),
  enableSorting: false,
  cell: ({ row }) => {
    const features = row.original.features || [];
    if (features.length === 0) return <span>-</span>;

    const visible = features.slice(0, 2);
    const extra = features.length - visible.length;
    const allText = features.map((f) => f.featureText).join(", ");

    return (
      <div className="flex flex-wrap items-center gap-1 max-w-[260px]" title={allText}>
        {visible.map((f) => (
          <span
            key={f.id}
            className="px-2 py-0.5 text-xs rounded-full bg-blue-50 text-primary border border-blue-100 truncate max-w-[120px]"
          >
            {f.featureText}
          </span>
        ))}
        {extra > 0 && (
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
            +{extra} more
          </span>
        )}
      </div>
    );
  },
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
