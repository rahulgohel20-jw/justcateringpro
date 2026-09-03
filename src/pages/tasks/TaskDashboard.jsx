import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import TabComponent from "@/components/tab/TabComponent";
import { CommonHexagonBadge } from "@/partials/common";
import { Select } from "antd";
import { TableComponent } from "@/components/table/TableComponent";
import { columns, defaultData } from "./constant";
import { toAbsoluteUrl } from "@/utils";
const { Option } = Select;
const TaskDashboard = () => {
  const [selectedView, setSelectedView] = useState("Table");
  const [tableData, setTableData] = useState(defaultData);
  const taskStats = [
    {
      label: "Overdue",
      value: 32,
      color: "danger",
      icon: <i className="ki-filled ki-timer text-xl text-danger"></i>,
      border: "border-s-danger",
    },
    {
      label: "Pending",
      value: 0,
      color: "warning",
      border: "border-s-warning",
    },
    {
      label: "In Progress",
      value: 0,
      color: "info",
      icon: <i className="ki-filled ki-arrows-circle text-xl text-info"></i>,
      border: "border-s-info",
    },
    {
      label: "Completed",
      value: 0,
      color: "success",
      icon: <i className="ki-filled ki-check-circle text-xl text-success"></i>,
      border: "border-s-success",
    },
    {
      label: "In Time",
      value: 0,
      color: "primary",
      icon: <i className="ki-filled ki-time text-xl text-primary"></i>,
      border: "border-s-primary",
    },
    {
      label: "Delayed",
      value: 0,
      color: "indigo",
      icon: <i className="ki-filled ki-information-4 text-xl text-indigo"></i>,
      border: "border-s-indigo",
    },
  ];
  const tasks = [
    "Today",
    "Yesterday",
    "This Week",
    "Last Week",
    "This Month",
    "Last Month",
    "This Year",
    "All Time",
    "Custom",
  ];
  const taskViewTabs = [
    {
      label: (
        <>
          <i className="ki-filled ki-element-7"></i>
          Table
        </>
      ),
      value: "table",
      children: "",
    },
    {
      label: (
        <>
          <i className="ki-filled ki-bar-chart"></i>
          Bar Chart
        </>
      ),
      value: "barChart",
      children: "",
    },
  ];
  return (
    <Fragment>
      <style>
        {`
          .user-access-bg {
            background-image: url('${toAbsoluteUrl("/images/bg_01.png")}');
          }
          .dark .user-access-bg {
            background-image: url('${toAbsoluteUrl("/images/bg_01_dark.png")}');
          }
        `}
      </style>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs items={[{ title: "Task Dashboard" }]} />
        </div>
        {/* status */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4 mb-4">
          {taskStats.map((stat, index) => (
            <div
              key={index}
              className={`col-span-1 flex items-center flex-wrap sm:flex-nowrap grow border border-y-gray-200 border-e-gray-200 ${stat.border} border-l-4 rounded-xl gap-3 py-5 px-4 rtl:[background-position:-10px_center] [background-position:10px_center] bg-no-repeat bg-[length:400px] user-access-bg`}
            >
              <CommonHexagonBadge
                stroke={`stroke-${stat.color}-clarity`}
                fill="fill-light"
                size="size-[46px]"
                badge={stat.icon}
              />
              <div className="flex flex-col">
                <div className="font-sm form-info text-gray-800">
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
                <option value="0">Today</option>
                <option value="1">Yesterday</option>
                <option value="2">This Week</option>
                <option value="3">This Month</option>
                <option value="4">Last Month</option>
                <option value="5">This Year</option>
                <option value="6">All</option>
              </select>
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="0">Assigned to</option>
                <option value="1">User one</option>
                <option value="2">User two</option>
                <option value="3">User three</option>
              </select>
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="0">Category</option>
                <option value="1">Category one</option>
                <option value="2">Category two</option>
                <option value="3">Category three</option>
              </select>
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="0">Frequency</option>
                <option value="1">Daily</option>
                <option value="2">Weekly</option>
                <option value="3">Monthly</option>
              </select>
            </div>
            <div className="filItems">
              <button className="btn btn-primary" title="Refresh">
                <i className="ki-filled ki-arrows-circle"></i>
              </button>
            </div>
          </div>
          <div className="filters__right flex flex-wrap items-center gap-2">
            <TabComponent tabs={taskViewTabs} />
          </div>
        </div>
        {/* <div className="flex flex-wrap gap-2 justify-center mb-6">
          {tasks.map((label, i) => (
            <Button
              key={i}
              type={label === "This Week" ? "primary" : "default"}
              className={`rounded-full px-4 ${
                label === "This Week"
                  ? "bg-primary text-white border-none"
                  : "bg-gray-100 text-[#000000a6] font-medium"
              }`}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <Select placeholder="Assigned To" className="w-40">
            <Option value="user1">User 1</Option>
            <Option value="user2">User 2</Option>
          </Select>
          <Select placeholder="Category" className="w-40">
            <Option value="cat1">Category 1</Option>
            <Option value="cat2">Category 2</Option>
          </Select>
          <Select placeholder="Frequency" className="w-40">
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="monthly">Monthly</Option>
          </Select>
          <Input.Search placeholder="Search..." className="w-56" />
          <Button>Clear</Button>
        </div>
        <div className="flex gap-2 justify-center mb-6">
          <Button
            type={selectedView === "Table" ? "primary" : "default"}
            className="rounded-full px-6"
            onClick={() => setSelectedView("Table")}
            classNames="btn btn-primary"
          >
            Table
          </Button>
          <Button
            type={selectedView === "Bar Chart" ? "primary" : "default"}
            className="rounded-full px-6"
            onClick={() => setSelectedView("Bar Chart")}
            classNames="btn bg-primary"
          >
            Bar Chart
          </Button>
        </div> */}
        <TableComponent
          columns={columns}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export { TaskDashboard };
