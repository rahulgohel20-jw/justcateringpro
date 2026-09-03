import{ useState } from "react";
// components/modals/ApplyRegularization.jsx
import { DatePicker as AntDatePicker } from "antd"; 
import dayjs from "dayjs";
import { CustomModal } from "@/components/custom-modal/CustomModal";

const ApplyRegularization = ({ isModalOpen, setIsModalOpen }) => {
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const [date, setDate] = useState(null);

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="Apply Regularization"
        footer={[
          <div className="flex justify-between" key={"footer-buttons"}>
            <button
              className="btn btn-light"
              onClick={handleModalClose}
              title="Cancel"
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              title="Apply Regularization"
              onClick={() => {
                // handle apply logic here
                setIsModalOpen(false);
              }}
            >
              Apply
            </button>
          </div>,
        ]}
      >
        <div className="flex flex-col gap-y-4">
          {/* Select Date */}
          <div className="flex flex-col">
            <label className="form-label">Select Date</label>
          <AntDatePicker
            className="input w-full"
            value={date ? dayjs(date) : null}
            onChange={(date) => setDate(date ? date.toISOString() : null)}
            getPopupContainer={() => document.body}
          />
          </div>

          {/* Login & Logout Time */}
          <div className="grid grid-cols-2 gap-x-4">
            <div className="flex flex-col">
              <label className="form-label">Login Time</label>
              <div className="input">
                <i className="ki-filled ki-time"></i>
                <input type="time" className="h-full w-full" />
              </div>
            </div>
            <div className="flex flex-col">
              <label className="form-label">Logout Time</label>
              <div className="input">
                <i className="ki-filled ki-time"></i>
                <input type="time" className="h-full w-full" />
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div className="flex flex-col">
            <label className="form-label">Remarks</label>
            <textarea
              className="w-full h-full text-dark"
              placeholder="Write your reason..."
            />
          </div>
        </div>
      </CustomModal>
    )
  );
};

export default ApplyRegularization;
