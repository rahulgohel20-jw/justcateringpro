import { useState } from "react";
import { DatePicker as AntDatePicker } from "antd";
import dayjs from "dayjs";
import { CustomModal } from "@/components/custom-modal/CustomModal";

const AddLeave = ({ isModalOpen, setIsModalOpen }) => {
  const [taskAccess, setTaskAccess] = useState(true);
  const [leaveAccess, setLeaveAccess] = useState(true);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const [activeTab, setActiveTab] = useState("tab_1");

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="Add New Team Member"
        footer={[
          <div className="flex justify-between" key={"footer-buttons"}>
            <button
              key="cancel"
              className="btn btn-light"
              onClick={handleModalClose}
              title="Cancel"
            >
              Cancel
            </button>
            <button key="save" className="btn btn-success" title="Apply">
              Apply
            </button>
          </div>,
        ]}
      >
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-col">
            <label className="form-label">Leave Type</label>
            <select className="select pe-7.5">
              <option value="CL">Casual Leave</option>
              <option value="SL">Sick Leave</option>
              <option value="EL">Earned Leave</option>
              <option value="LWP">Leave Without Pay</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            <div className="flex flex-col">
              <label className="form-label">From Date</label>
              <AntDatePicker
                className="input w-full"
                value={fromDate ? dayjs(fromDate) : null}
                onChange={(date) =>
                  setFromDate(date ? date.toISOString() : null)
                }
                getPopupContainer={() => document.body}
              />
            </div>
            <div className="flex flex-col">
              <label className="form-label">To Date</label>
              <AntDatePicker
                className="input w-full"
                value={toDate ? dayjs(toDate) : null}
                onChange={(date) => setToDate(date ? date.toISOString() : null)}
                getPopupContainer={() => document.body}
              />
            </div>
          </div>
          <div className="mt-3">
            <label className="form-label">Write Reason</label>
            <div className="w-full">
              <textarea
                className="h-full w-full text-dark"
                placeholder="Reason of Leave"
              />
            </div>
          </div>
        </div>
        {/* 
        <label className="text-black">LTask Access</label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={taskAccess}
            onChange={() => setTaskAccess(!taskAccess)}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-rose-500 transition duration-300"></div>
          <div
            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
              taskAccess ? "translate-x-5" : ""
            }`}
          ></div>
        </label>

        <label className="text-black">Leave & Attendance Access</label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={leaveAccess}
            onChange={() => setLeaveAccess(!leaveAccess)}
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-rose-500 transition duration-300"></div>
          <div
            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
              leaveAccess ? "translate-x-5" : ""
            }`}
          ></div>
        </label> */}
      </CustomModal>
    )
  );
};
export default AddLeave;
