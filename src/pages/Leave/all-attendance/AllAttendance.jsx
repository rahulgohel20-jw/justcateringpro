import { Fragment } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import TabComponent from "@/components/tab/TabComponent";

import { Attendance } from "@/container/setting";
import { Regularization } from "@/container/setting";

const AllAttendance = () => {
  const tabs = [
    {
      value: "roleandpermission",
      label: (
        <>
          {/* <User className="text-primary" /> */}
          All Attendance
        </>
      ),
      children: <Attendance />,
    },
    {
      value: "bulkdata",
      label: (
        <>
          {/* <DatabaseIcon className="text-primary" /> */}
          All Regularization
        </>
      ),
      children: <Regularization />,
    },
  ];
  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "All Attendance" }]} />
        </div>
        <div className="filters flex flex-wrap items-center justify-between gap-2 my-7">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this week">This Week</option>
                <option value="last week">Last Week</option>
                <option value="this month">This Month</option>
                <option value="last month">Last Month</option>
                <option value="all time">All Time</option>
              </select>
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="Manager" selected disabled>
                  Manager
                </option>
                <option value="0">Manan Gandhi</option>
                <option value="1">Zankhna Patel</option>
                <option value="2">Ritesh Sharma</option>
              </select>
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="Manager" selected disabled>
                  Employees
                </option>
                <option value="0">Rahul</option>
                <option value="1">Aarya</option>
                <option value="2">Zainab</option>
                <option value="3">Swapnil</option>
              </select>
            </div>
          </div>
        </div>
        <TabComponent tabs={tabs} />
      </Container>
    </Fragment>
  );
};
export { AllAttendance };
