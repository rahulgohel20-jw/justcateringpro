import { useState } from "react";
import { Input, Button } from "antd";
import { getEmployeeTableColumns } from "./getEmployeeTableColumns";
import { Progress } from "antd";

import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

import {
  AlarmClock,
  CheckCircle,
  Clock,
  Hourglass,
  InfoIcon,
} from "lucide-react";

import { TableComponent } from "@/components/table/TableComponent";

const EmployeeDashboard = () => {
  const [searchText, setSearchText] = useState("");

  /* ================= TABLE COLUMNS FROM CONSTANT ================= */

  const tablecolumns = getEmployeeTableColumns();

  /* ================= TABLE DATA ================= */

  const defaultTableData = [
    {
      id: 1,
      name: "Swapnil Godheswar",
      role: "Lead Server",
      totalTasks: 35,
      score: 90,
      overdue: 2,
      pending: 6,
      inProgress: 3,
    },
    {
      id: 2,
      name: "Sneha Desai",
      role: "Project Coordinator",
      totalTasks: 22,
      score: 88,
      overdue: 1,
      pending: 3,
      inProgress: 2,
    },
    {
      id: 3,
      name: "Priya Sharma",
      role: "Team Lead",
      totalTasks: 19,
      score: 85,
      overdue: 1,
      pending: 4,
      inProgress: 2,
    },
  ];

  /* ================= DASHBOARD TOTALS ================= */

  const totalOverdue = defaultTableData.reduce(
    (sum, emp) => sum + emp.overdue,
    0,
  );

  const totalPending = defaultTableData.reduce(
    (sum, emp) => sum + emp.pending,
    0,
  );

  const totalInProgress = defaultTableData.reduce(
    (sum, emp) => sum + emp.inProgress,
    0,
  );

  const totalInTime =
    defaultTableData.reduce((sum, emp) => sum + emp.totalTasks, 0) -
    (totalOverdue + totalPending + totalInProgress);

  const totalDelayed = totalOverdue;

  /* ================= SEARCH FILTER ================= */

  const filteredData = defaultTableData.filter((emp) =>
    emp.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  /* ================= DASHBOARD CARDS ================= */

  const dashboardStats = [
    {
      label: "Overdue",
      count: totalOverdue,
      icon: <InfoIcon className="w-5 h-5 text-red-600" />,
      iconBg: "bg-red-100",
    },
    {
      label: "Pending",
      count: totalPending,
      icon: <Clock className="w-5 h-5 text-gray-600" />,
      iconBg: "bg-gray-100",
    },
    {
      label: "In-Progress",
      count: totalInProgress,
      icon: <Hourglass className="w-5 h-5 text-yellow-600" />,
      iconBg: "bg-yellow-50",
    },
    {
      label: "In-Time",
      count: totalInTime,
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      iconBg: "bg-green-100",
    },
    {
      label: "Delayed",
      count: totalDelayed,
      icon: <AlarmClock className="w-5 h-5 text-orange-600" />,
      iconBg: "bg-orange-100",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ================= TOP CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {dashboardStats.map((item, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.iconBg}`}
            >
              {item.icon}
            </div>

            <p className="text-gray-600 text-sm">{item.label}</p>
            <h2 className="text-2xl font-bold">{item.count}</h2>
          </div>
        ))}
      </div>

      {/* ================= TABLE SECTION ================= */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Staff Productivity Table</h2>
            <p className="text-gray-500 text-sm">
              Performance metrics across all active staff
            </p>
          </div>

          <div className="flex gap-2">
            <Button icon={<FilterOutlined />}>Filter</Button>
            <Button icon={<DownloadOutlined />}>Export</Button>
          </div>
        </div>

        <div className="mb-4 w-80">
          <Input
            placeholder="Search team member..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <TableComponent
          columns={tablecolumns}
          data={filteredData}
          paginationSize={10}
        />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
