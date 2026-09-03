import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";

import AddLeave from "../../../partials/modals/add-leave/AddLeave";

const MyLeaves = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleEdit = (data) => {
    

    setEditData(data);
    setIsModalOpen(true);
  };

  const removeContact = () => {
   
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "My Leaves" }]} />
        </div>
        {/* filters */}
        <div className="border py-7">
          <div className="filters flex flex-wrap items-center justify-center gap-2 mb-3">
            <div className="filItems">
              <select className="select pe-7" placeholder="Roles">
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={handleModalOpen}
                title="Add Contact"
              >
                <i className="ki-filled ki-plus"></i>
                <span className="text-base">Apply Leave</span>
              </button>
            </div>
          </div>
          <div className="filters flex flex-wrap items-center justify-center gap-5 my-7">
            <div className="border outline p-5">
              <span className="text-xl text-primary font-bold">Sick Leave</span>
              <i className="ki-solid ki-information-2 ms-1 text-2xl"></i>
              <div className="mt-1">
                <p className="text-lg text-center">Alloted:12</p>
                <p className="text-lg text-center">Balance:12</p>
              </div>
            </div>
            <div className="border outline p-5">
              <span className="text-xl text-primary font-bold">
                Casual Leave
              </span>
              <i className="ki-solid ki-information-2 ms-1 text-2xl"></i>
              <div className="mt-1">
                <p className="text-lg text-center">Alloted:12</p>
                <p className="text-lg text-center">Balance:12</p>
              </div>
            </div>
            <div className="border outline p-5">
              <span className="text-xl text-primary font-bold">
                Earned Leave
              </span>
              <i className="ki-solid ki-information-2 ms-1 text-2xl"></i>
              <div className="mt-1">
                <p className="text-lg text-center">Alloted:15</p>
                <p className="text-lg text-center">Balance:15</p>
              </div>
            </div>
            <div className="border outline p-5">
              <span className="text-xl text-primary font-bold">
                Leave Without Pay
              </span>
              <i className="ki-solid ki-information-2 ms-1 text-2xl"></i>
              <div className="mt-1">
                <p className="text-lg text-center">Alloted:6</p>
                <p className="text-lg text-center">Balance:6</p>
              </div>
            </div>
          </div>
        </div>

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
                <option value="0">Casual Leave</option>
                <option value="1">Earned Leave</option>
                <option value="2">Sick Leave</option>
                <option value="3">Leave Without Pay</option>
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
      </Container>
      <AddLeave
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        editData={editData}
      />
    </Fragment>
  );
};
export { MyLeaves };
