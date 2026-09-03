import { Fragment, useState } from "react";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { Container } from "@/components/container";
import { Button, Select, Tabs, Tooltip } from "antd";
import {
  PlusOutlined,
  BarChartOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  FilterOutlined,
} from "@ant-design/icons";

const { Option } = Select;

const TaskListPage = () => {
  const [view, setView] = useState("list");
  const [expandedTask, setExpandedTask] = useState(null);

  const taskStats = [
    { key: "overdue", label: "OverDue", count: 7, color: "text-red-500" },
    { key: "pending", label: "Pending", count: 0, color: "text-gray-400" },
    {
      key: "inprogress",
      label: "In Progress",
      count: 0,
      color: "text-orange-500",
    },
    { key: "completed", label: "Completed", count: 0, color: "text-green-500" },
  ];

  const tasks = [
    { id: 1, title: "Krishnai", ago: "6 months ago" },
    ,
    { id: 2, title: "Gala Caterers", ago: "6 months ago" },
    {
      id: 5,
      title: "Nikhil Caterers",
      assignedBy: "Dev Soni",
      date: "Wed, Mar 5 10:15 PM",
      ago: "6 months ago",
      tags: ["Automation", "High", "Daily"],
    },
    { id: 4, title: "Krishnai", ago: "6 months ago" },
    { id: 10, title: "Shrim Riddhi Siddhi", ago: "6 months ago" },
    { id: 6, title: "Gala Caterers", ago: "6 months ago" },
    { id: 8, title: "Chef Touch", ago: "6 months ago" },
    { id: 18, title: "Webinar for GMB @ 7 PM", ago: "6 months ago" },
    { id: 31, title: "test", ago: "3 months ago" },
  ];

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs items={[{ title: "All Task" }]} />
        </div>

        <div className="p-4 bg-gradient-to-b  rounded-lg">
          <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
            <div className="flex  items-center  items-center gap-3">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="bg-primary hover:bg-primary rounded-md"
              >
                Assign Task
              </Button>
              <Select defaultValue="This Month" className="w-40">
                <Option value="today">Today</Option>
                <Option value="thisWeek">This Week</Option>
                <Option value="thisMonth">This Month</Option>
              </Select>

              <Button
                icon={<FilterOutlined />}
                className="bg-primary text-white rounded-md"
              >
                Filter
              </Button>

              <div className="flex items-center bg-white rounded-md border">
                <Tooltip title="List View">
                  <Button
                    type={view === "list" ? "primary" : "text"}
                    icon={<UnorderedListOutlined />}
                    onClick={() => setView("list")}
                  />
                </Tooltip>
                <Tooltip title="Bar View">
                  <Button
                    type={view === "bar" ? "primary" : "text"}
                    icon={<BarChartOutlined />}
                    onClick={() => setView("bar")}
                  />
                </Tooltip>
                <Tooltip title="Calendar View">
                  <Button
                    type={view === "calendar" ? "primary" : "text"}
                    icon={<CalendarOutlined />}
                    onClick={() => setView("calendar")}
                  />
                </Tooltip>
              </div>

              <div className="flex items-center bg-white rounded-md  gap-2">
                <Button className="btn-primary">Import</Button>
                <Button className="btn-primary">Export</Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 border-b border-gray-300 pb-2 mb-4">
            {taskStats.map((stat) => (
              <div
                key={stat.key}
                className={`flex items-center gap-1 cursor-pointer ${stat.color}`}
              >
                <span className="font-medium">
                  {stat.label} - {stat.count}
                </span>
              </div>
            ))}
          </div>

          {view === "list" && (
            <div className="flex flex-col gap-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() =>
                    setExpandedTask(expandedTask === task.id ? null : task.id)
                  }
                  className={`cursor-pointer bg-white rounded-md border border-primary p-3 transition-all duration-300 
                ${expandedTask === task.id ? "shadow-lg scale-[1.01]" : "hover:shadow-md"}`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">
                      T - {task.id} &nbsp; {task.title}
                    </span>
                    <span className="text-red-400 text-sm">{task.ago}</span>
                  </div>

                  {expandedTask === task.id && (
                    <div className="mt-3 text-sm text-gray-600">
                      {task.assignedBy && (
                        <p>
                          Assigned By{" "}
                          <span className="font-semibold">
                            {task.assignedBy}
                          </span>{" "}
                          | {task.date} | {task.ago}
                        </p>
                      )}

                      <div className="flex gap-2 mt-2 flex-wrap">
                        {task.tags?.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs border rounded-md bg-gray-50"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button
                          size="small"
                          className="bg-orange-100 text-orange-600 border-orange-300"
                        >
                          In Progress
                        </Button>
                        <Button
                          size="small"
                          className="bg-green-100 text-green-600 border-green-300"
                        >
                          Complete
                        </Button>
                        <Button
                          size="small"
                          className="border-pink-300 text-pink-600"
                        >
                          Create Template
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {view === "bar" && (
            <div className="p-6 bg-white rounded-md border border-gray-200">
              📊 Bar Chart View
            </div>
          )}

          {view === "calendar" && (
            <div className="p-6 bg-white rounded-md border border-gray-200">
              📅 Calendar View
            </div>
          )}
        </div>
      </Container>
    </Fragment>
  );
};

export { TaskListPage };
