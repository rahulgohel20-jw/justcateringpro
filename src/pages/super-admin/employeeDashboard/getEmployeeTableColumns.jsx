import { Progress } from "antd";

export const getEmployeeTableColumns = () => [
  {
    header: "Staff Member",
    accessorKey: "name",
    cell: ({ row }) => {
      const { name, role, score } = row.original;

      const getColor = () => {
        if (score >= 80) return "#16a34a"; // green
        if (score >= 50) return "#2563eb"; // blue
        return "#dc2626"; // red
      };

      return (
        <div className="flex items-center gap-4 ">
          {/* Circular Progress */}
          <Progress
            type="circle"
            percent={score}
            width={60}
            strokeColor={getColor()}
            format={(percent) => `${percent} %`}
          />

          {/* Name + Role */}
          <div>
            <div className=" text-gray-800">{name}</div>
            <div className="text-gray-500 text-sm">{role}</div>
          </div>
        </div>
      );
    },
  },

  {
    header: "Total Tasks",
    accessorKey: "totalTasks",
  },
  {
    header: "Performance Score",
    accessorKey: "score",
    cell: ({ row }) => <span className="">{row.original.score}%</span>,
  },
  {
    header: "Overdue",
    accessorKey: "overdue",
    cell: ({ row }) => (
      <span className="text-red-600 ">
        {row.original.overdue.toString().padStart(2, "0")}
      </span>
    ),
  },
  {
    header: "Pending",
    accessorKey: "pending",
  },
  {
    header: "In Progress",
    accessorKey: "inProgress",
    cell: ({ row }) => (
      <span className="text-orange-500 ">
        {row.original.inProgress.toString().padStart(2, "0")}
      </span>
    ),
  },
];
