 import { useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
  import { DatePicker as AntDatePicker } from "antd"; 
import dayjs from "dayjs";

const AddHoliday = ({ isModalOpen, setIsModalOpen }) => {
const [date, setDate] = useState(null);
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  
  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="Add New Holiday"
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
            <button key="save" className="btn btn-primary" title="Add Holiday">
              Add Holiday
            </button>
          </div>,
        ]}
      >
        <div className="flex flex-col gap-y-5">
          <div className="grid grid-cols-1 gap-x-4">
            <div className="flex flex-col">
              <label className="form-label">Holiday Name</label>
              <div className="input">
                <i className="ki-filled ki-pencil"></i>
                <input
                  type="text"
                  className="h-full"
                  placeholder="Holiday name"
                />
              </div>
            </div>            
          </div>
          <div className="grid grid-cols-1 gap-x-4">
            <div className="flex flex-col">
              <label className="form-label">Select Date</label>
            <AntDatePicker
            className="input w-full"
            value={date ? dayjs(date) : null}
            onChange={(date) => setDate(date ? date.toISOString() : null)}
            getPopupContainer={() => document.body}
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
export default AddHoliday;
