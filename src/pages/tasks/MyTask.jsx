import { Fragment, useState } from "react";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { Container } from "@/components/container";
import TabComponent from "@/components/tab/TabComponent";
import { CommonHexagonBadge } from "@/partials/common";
import { Button, Select, Tabs, Tooltip } from "antd";
import {
  PlusOutlined,
  BarChartOutlined,
  UnorderedListOutlined,
  CalendarOutlined,
  FilterOutlined,
} from "@ant-design/icons";
const { Option } = Select;
const MyTask = () => {
  const [view, setView] = useState("list");
  const [expandedTask, setExpandedTask] = useState(null);
  const taskStats = [
    {
      key: "overdue",
      label: "Overdue",
      value: 32,
      color: "danger",
      border: "border-s-danger",
    },
    {
      key: "pending",
      label: "Pending",
      value: 0,
      color: "warning",
      border: "border-s-warning",
    },
    {
      key: "inprogress",
      label: "In Progress",
      value: 0,
      color: "info",
      border: "border-s-info",
    },
    {
      key: "completed",
      label: "Completed",
      value: 0,
      color: "success",
      border: "border-s-success",
    },
  ];
  const tasks = [
    { id: 1, title: "Task 1" },
    { id: 2, title: "Task 2" },
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
  const TaskView = [
    {
      label: (
        <>
          <i className="ki-filled ki-row-horizontal"></i>
          List
        </>
      ),
      value: "list",
      children: "",
    },
    {
      label: (
        <>
          <i className="ki-filled ki-bar-chart"></i>
          Bar
        </>
      ),
      value: "bar",
      children: "",
    },
    {
      label: (
        <>
          <i className="ki-filled ki-calendar"></i>
          Calendar
        </>
      ),
      value: "calendar",
      children: "",
    },
  ];

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs items={[{ title: "My Task" }]} />
        </div>
        {/* status */}
        <div className="flex items-center justify-start gap-3 lg:gap-4 mb-4">
          {taskStats.map((stat, index) => (
            <div
              key={index}
              className={`grow border border-y-gray-200 border-e-gray-200 ${stat.border} border-l-4 rounded-xl py-2.5 px-3 rtl:[background-position:-10px_center] [background-position:10px_center] bg-no-repeat bg-[length:400px] user-access-bg`}
            >
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-gray-900">
                  {stat.label}
                </div>
                <h3 className={`text-xl font-semibold text-${stat.color}`}>
                  {stat.value}
                </h3>
              </div>
            </div>
          ))}
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder="Search task"
                type="text"
              />
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="0" selected>
                  This Month
                </option>
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
              </select>
            </div>
            <div className="filItems">
              <button className="btn btn-light" title="Filter">
                <i className="ki-filled ki-setting-4"></i> Filter
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="filters__right flex flex-wrap items-center gap-2">
              <TabComponent tabs={TaskView} />
            </div>
            <button className="btn btn-primary" title="Assign Task">
              <i className="ki-filled ki-plus"></i>Assign Task
            </button>
          </div>
        </div>
        <div className="">
          {/* <div className="flex items-center justify-center gap-3 flex-wrap mb-4">
            <div className="flex items-center items-center gap-3">
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
          </div> */}
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

export { MyTask };
