import { useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
const AddCompany = ({ isModalOpen, setIsModalOpen }) => {
  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const [activeTab, setActiveTab] = useState("tab_1");

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="Add Company"
        width={640}
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
            <button key="save" className="btn btn-success" title="Save">
              Save
            </button>
          </div>,
        ]}
      >
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <label className="form-label">Company Name</label>
            <div className="input">
              <i className="ki-filled ki-user"></i>
              <input
                className="h-full"
                type="text"
                placeholder="Company Name"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Tax No</label>
            <div className="input">
              <i className="ki-filled ki-cheque"></i>
              <input className="h-full" type="text" placeholder="Tax No" />
            </div>
          </div>
          <div>
            <label className="form-label">Company Code</label>
            <div className="input">
              <i className="ki-filled ki-user"></i>
              <input
                className="h-full"
                type="text"
                placeholder="Company Code"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Website</label>
            <div className="input">
              <i className="ki-filled ki-dribbble"></i>
              <input className="h-full" type="text" placeholder="Enter URL" />
            </div>
          </div>
          <div>
            <label className="form-label">Country</label>
            <div className="input">
              <i className="ki-filled ki-bank"></i>
              <input className="h-full" type="text" placeholder="Country" />
            </div>
          </div>
          <div>
            <label className="form-label">State</label>
            <div className="input">
              <i className="ki-filled ki-bank"></i>
              <input className="h-full" type="text" placeholder="State" />
            </div>
          </div>
          <div>
            <label className="form-label">City</label>
            <div className="input">
              <i className="ki-filled ki-pointers"></i>
              <input className="h-full" type="text" placeholder="City" />
            </div>
          </div>
          <div>
            <label className="form-label">Pincode</label>
            <div className="input">
              <i className="ki-filled ki-geolocation"></i>
              <input className="h-full" type="tel" placeholder="Pincode" />
            </div>
          </div>
          <div>
            <label className="form-label">Billing Address</label>
            <div className="input">
              <i className="ki-filled ki-geolocation"></i>
              <input
                className="h-full"
                type="text"
                placeholder="Billing Address"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Shipping Address</label>
            <div className="input">
              <i className="ki-filled ki-geolocation"></i>
              <input
                className="h-full"
                type="text"
                placeholder="Shipping Address"
              />
            </div>
          </div>
        </div>
      </CustomModal>
    )
  );
};
export default AddCompany;
