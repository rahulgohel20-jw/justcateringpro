import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import TabComponent from "@/components/tab/TabComponent";
import LeaveApplication from "@/pages/Leave/approval/leaveapplication/constant";

import AddLeave from "../../../partials/modals/add-leave/AddLeave";

const Approval = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData] = useState(null);

  const tabs = [
    {
      value: "leave-application",
      label: (
        <>
          <i className="ki-filled ki-calendar"></i>
          Leave Application
        </>
      ),
      children: <LeaveApplication />,
    },
    {
      value: "regularization",
      label: (
        <>
          <i className="ki-filled ki-time"></i>
          Regularization
        </>
      ),
      children: <constant />,
    },
  ];

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Approval" }]} />
        </div>

        {/* Filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 my-7">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems">
              <button className="btn btn-light" title="Filter">
                <i className="ki-filled ki-cross"></i> Clear
              </button>
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="this week">This Week</option>
                <option value="last week">Last Week</option>
                <option value="this month">This Month</option>
                <option value="last month">Last Month</option>
                <option value="next week">Next Week</option>
                <option value="next month">Next Month</option>
                <option value="all time">All Time</option>
              </select>
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="0">Employee</option>
                <option value="1">Nikki</option>
                <option value="2">Zankhna</option>
                <option value="3">Ritesh</option>
              </select>
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="0">All</option>
                <option value="1">Pending</option>
                <option value="2">Approved</option>
                <option value="3">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center items-center ">
          <TabComponent tabs={tabs} />
        </div>
      </Container>

      {/* Add Leave Modal */}
      <AddLeave
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        editData={editData}
      />
    </Fragment>
  );
};

export { Approval };
