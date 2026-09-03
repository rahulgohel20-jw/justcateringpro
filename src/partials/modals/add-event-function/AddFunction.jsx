import { CustomModal } from "@/components/custom-modal/CustomModal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FunctionTypeDropdown from "@/components/dropdowns/FunctionTypeDropdown";
import { Textarea } from "@/components/ui/textarea";

const AddFunctionModel = ({
  isModalOpen,
  setIsModalOpen,
  eventData,
  setEventModalData,
  functionDataStore,
}) => {
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = ({ target: { value, name } }) => {
    setEventModalData({
      ...eventData,
      [name]: value,
    });
  };

  const handleDateChange = (date, name) => {
    setEventModalData({
      ...eventData,
      [name]: date,
    });
  };

  const handleModalSave = () => {
    functionDataStore();
    handleModalClose();
  };

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="Add Function"
        footer={[
          <div className="flex justify-between" key={"footer-buttons"}>
            <button
              key="cancel"
              className="btn btn-light"
              onClick={handleModalClose}
              title="Close"
            >
              Close
            </button>
            <button
              key="save"
              className="btn btn-success"
              title="Save Function"
              onClick={handleModalSave}
            >
              Save Function
            </button>
          </div>,
        ]}
      >
        <div className="flex flex-col gap-1">
          <div className="flex flex-col">
            <FunctionTypeDropdown
              label={"Function Name"}
              value={eventData.customer_id}
              name={"customer_id"}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
          <div className="flex flex-col">
            <label className="form-label">Start Date</label>
            <DatePicker
              className="input w-full"
              selected={eventData.start_date}
              onChange={(date) => handleDateChange(date, "start_date")}
              dateFormat="MM/dd/yyyy"
              placeholderText="Select start date"
            />
          </div>
          <div className="flex flex-col">
            <label className="form-label">End Date</label>
            <DatePicker
              className="input w-full"
              selected={eventData.end_date}
              onChange={(date) => handleDateChange(date, "end_date")}
              dateFormat="MM/dd/yyyy"
              placeholderText="Select end date"
              minDate={eventData.start_date}
            />
          </div>
          <div className="flex flex-col">
            <label className="form-label">Notes</label>
            <Textarea
              className="textarea h-full"
              placeholder="Notes"
              rows={3}
              name={"notes"}
              value={eventData.notes}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col">
            <label className="form-label">Location</label>
            <Textarea
              className="textarea h-full"
              placeholder="Location"
              rows={3}
              value={eventData.address}
              name={"address"}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </CustomModal>
    )
  );
};

export default AddFunctionModel;
