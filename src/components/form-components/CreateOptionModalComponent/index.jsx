import { CustomModal } from "@/components/custom-modal/CustomModal";

const CreateOptionModalComponent = ({ isModalOpen, setIsModalOpen }) => {
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <CustomModal
      open={isModalOpen}
      onClose={handleModalClose}
      title="Add New Option"
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
          <button key="save" className="btn btn-success" title="Create">
            Save
          </button>
        </div>,
      ]}
    >
      <div className="input">
        <label className="form-label">Name</label>
        <input />
      </div>
    </CustomModal>
  );
};

export default CreateOptionModalComponent;
