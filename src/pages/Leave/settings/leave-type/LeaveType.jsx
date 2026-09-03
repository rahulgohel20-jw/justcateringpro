import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";

import AddLeaveType from "@/partials/modals/add-leavetype/AddLeaveType";

const LeaveType = () => {
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
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={handleModalOpen}
                title="Add Contact"
              >
                <i className="ki-filled ki-plus"></i>
                <span className="text-base">New Leave Type</span>
              </button>
            </div>
          </div>
          <div className="text-center mt-9">
            <p className="text-lg">Total Leave Alloted : 46</p>
          </div>
          <div className="filters flex flex-wrap items-center justify-center gap-5 my-7">
            <div className="border outline p-5">
              <span className="text-xl text-primary font-bold">Sick Leave</span>
              <div className="grid grid-cols-2 gap-7 py-3">
                <div>
                  <span className="bg-primary p-2 text-white rounded-lg">
                    Paid
                  </span>
                </div>
                <div className=" gap-3">
                  <span className="px-3">
                    <button>
                      <i className="ki-filled ki-pencil"></i>
                    </button>
                  </span>

                  <span className="px-2">
                    <button>
                      <i className="ki-filled ki-trash"></i>
                    </button>
                  </span>
                </div>
              </div>
              <div className="mt-1">
                <p className="text-md ">Leave Alloted:12</p>
              </div>
            </div>
            <div className="border outline p-5">
              <span className="text-xl text-primary font-bold">
                Leave Without Pay
              </span>
              <div className="grid grid-cols-2 gap-7 py-3">
                <div>
                  <span className="bg-danger p-2 text-white rounded-lg">
                    Unpaid
                  </span>
                </div>
                <div className=" gap-3">
                  <span className="px-3 ">
                    <button>
                      <i className="ki-filled ki-pencil"></i>
                    </button>
                  </span>

                  <span className="px-2">
                    <button>
                      <i className="ki-filled ki-trash"></i>
                    </button>
                  </span>
                </div>
              </div>
              <div className="mt-1">
                <p className="text-md ">Leave Alloted:12</p>
              </div>
            </div>
            <div className="border outline p-5">
              <span className="text-xl text-primary font-bold">
                Casual Leave
              </span>
              <div className="grid grid-cols-2 gap-7 py-3">
                <div>
                  <span className="bg-primary p-2 text-white rounded-lg">
                    Paid
                  </span>
                </div>
                <div className=" gap-3">
                  <span className="px-3">
                    <button>
                      <i className="ki-filled ki-pencil"></i>
                    </button>
                  </span>

                  <span className="px-2">
                    <button>
                      <i className="ki-filled ki-trash"></i>
                    </button>
                  </span>
                </div>
              </div>
              <div className="mt-1">
                <p className="text-md ">Leave Alloted:12</p>
              </div>
            </div>
            <div className="border outline p-5">
              <span className="text-xl text-primary font-bold">
                Earned Leave
              </span>
              <div className="grid grid-cols-2 gap-7 py-3">
                <div>
                  <span className="bg-primary p-2 text-white rounded-lg">
                    Paid
                  </span>
                </div>
                <div className=" gap-3">
                  <span className="px-3">
                    <button>
                      <i className="ki-filled ki-pencil"></i>
                    </button>
                  </span>

                  <span className="px-2">
                    <button>
                      <i className="ki-filled ki-trash"></i>
                    </button>
                  </span>
                </div>
              </div>
              <div className="mt-1">
                <p className="text-md ">Leave Alloted:12</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
      <AddLeaveType
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        editData={editData}
      />
    </Fragment>
  );
};
export { LeaveType };
