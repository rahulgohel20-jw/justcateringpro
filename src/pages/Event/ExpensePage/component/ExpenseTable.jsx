import { Eye, Plus, Trash } from "lucide-react";
import { TableComponent } from "@/components/table/TableComponent";

export default function ExpenseTable({
  activeTab,
  data,
  onAddExpense,
  onView,
  onDelete,
}) {
  // Define columns based on activeTab
  const getColumns = () => {
    const baseColumns = [
      {
        accessorKey: "name",
        header: activeTab === "manager" ? "Manager Name" : "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-2 md:gap-3">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${row.original.bgColor} ${row.original.textColor} flex items-center justify-center font-semibold text-xs md:text-sm flex-shrink-0`}
            >
              {row.original.initials}
            </div>
            <span className="font-medium text-gray-900 text-sm md:text-base truncate">
              {row.original.name}
            </span>
          </div>
        ),
      },
    ];

    // Add manager-specific columns
    if (activeTab === "manager") {
      baseColumns.push(
        {
          accessorKey: "role",
          header: "Role",
          cell: ({ row }) => (
            <span className="text-sm md:text-base">{row.original.role}</span>
          ),
        },
        {
          accessorKey: "mobile",
          header: "Mobile",
          cell: ({ row }) => (
            <span className="text-sm md:text-base">{row.original.mobile}</span>
          ),
        },
      );
    }

    // Add common columns
    baseColumns.push(
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => (
          <span className="text-sm md:text-base whitespace-nowrap">
            {row.original.date}
          </span>
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <span className="font-medium text-sm md:text-base">
            {row.original.amount}
          </span>
        ),
      },
      {
        accessorKey: "paymentType",
        header: "Payment Type",
        cell: ({ row }) => (
          <span
            className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
              row.original.paymentType === "Cash"
                ? "bg-purple-100 text-purple-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {row.original.paymentType}
          </span>
        ),
      },
      {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
          <div className="flex gap-2 items-center">
            {activeTab === "manager" && (
              <>
                <Eye
                  className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0"
                  onClick={() => onView(row.original)}
                />
                <Plus
                  className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0"
                  onClick={() =>
                    onAddExpense(row.original.name, row.original.id)
                  }
                />
              </>
            )}
            <Trash
              className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-red-600 cursor-pointer flex-shrink-0"
              onClick={() => onDelete(row.original.id)}
            />
          </div>
        ),
      },
    );

    return baseColumns;
  };

  return (
    <div className="overflow-x-auto h-auto md:h-[500px] lg:h-[600px]">
      <TableComponent
        columns={getColumns()}
        data={data}
        paginationSize={10}
        defaultSorting={[{ id: "date", desc: true }]}
        toolbar={false}
        expandable={false}
      />
    </div>
  );
}
