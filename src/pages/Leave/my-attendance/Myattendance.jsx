import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import TabComponent from "@/components/tab/TabComponent";
import { DailyReport } from "./daily-report/constant";
import AddLeave from "../../../partials/modals/add-leave/AddLeave";
import ApplyRegularization from "../../../partials/modals/my-attendance/apply-regularization";
import RegisterFace from "../../../partials/modals/my-attendance/Register-face";

const Myattendance = () => {
  const [isRegularizationModalOpen, setIsRegularizationModalOpen] =
    useState(false);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData] = useState(null);

  const tabs = [
    {
      value: "leave-application",
      label: (
        <>
          <i className="ki-filled ki-calendar"></i>
          Daily Report
        </>
      ),
      children: <DailyReport />,
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
          <Breadcrumbs items={[{ title: "My Attendance" }]} />
        </div>

        <div className="text-center text-white flex flex-col items-center justify-center">
          {/* Card box */}

          <button
            className="btn btn-primary"
            onClick={() => setIsFaceModalOpen(true)}
            title="Add Contact"
          >
            <i className="ki-filled ki-plus"></i>
            <span
              className="text-base 
"
            >
              {" "}
              Register your Face{" "}
            </span>
          </button>
          <div className="bg-[#1E1F26] border border-[#2A2B30] rounded-lg p-10 w-full max-w-xl mb-6">
            <div className="flex justify-center mb-4">
              <img
                src="/images/no-entries.png"
                alt="No Entries"
                className="w-28"
              />
            </div>
            <h2 className="text-lg font-semibold mb-1">
              No Entries for Today!
            </h2>
            <p className="text-sm text-gray-400">
              Please login to mark today attendance
            </p>
          </div>

          {/* Apply Regularization Button */}

          <button
            className="btn btn-primary"
            onClick={() => setIsRegularizationModalOpen(true)}
            title="Add Contact"
          >
            <i className="ki-filled ki-plus"></i>
            <span className="text-base">Apply Regularization </span>
          </button>
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
                <option value="0">All</option>
                <option value="1">Pending</option>
                <option value="2">Approved</option>
                <option value="3">Rejected</option>
              </select>
            </div>
          </div>
        </div>
        <RegisterFace
          isModalOpen={isFaceModalOpen}
          setIsModalOpen={setIsFaceModalOpen}
        />

        <ApplyRegularization
          isModalOpen={isRegularizationModalOpen}
          setIsModalOpen={setIsRegularizationModalOpen}
        />

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

export { Myattendance };
