import { useState } from "react";
import PropTypes from "prop-types";
import { CustomModal } from "@/components/custom-modal/CustomModal";

const AddBulkDataImport = ({
  isModalOpen,
  setIsModalOpen,
  type
}) => {
  const [formData, setFormData] = useState({});
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
     handleModalClose()
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title={ type ? "Upload document" : "Download sample file"}
        width={650}
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
            <button
              key="save"
              className="btn btn-success"
              title={type ? "Upload" : "Download"}
              onClick={handleSave}
            >
              {type ? "Upload" : "Download"}
            </button>
          </div>,
        ]}
      >
        <div className="flex flex-col gap-y-2 max-h-[500px] overflow-auto scrollable-y">
          <div className="flex flex-col">
            <label className="form-label">Select Module</label>
            <select
              className="select pe-7.5"
              name="module_name"
              value={formData.module_name || "all"}
              onChange={handleInputChange}
            >
              <option value="leads">Leads</option>
              <option value="contacts">Contacts</option>
              <option value="products">Products</option>
            </select>
          </div>
          {type && (
            <div className="flex flex-col">
              <label className="form-label">Upalod File</label>
              <input type="file" name="document" />
            </div>
          )}
        </div>
      </CustomModal>
    )
  );
};
AddBulkDataImport.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
};

export default AddBulkDataImport;
