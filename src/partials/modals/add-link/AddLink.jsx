import { useState } from "react";

import { CustomModal } from "@/components/custom-modal/CustomModal";
import FileUploadComponent from "@/components/form-components/FileUploadComponent";

const AddLink = ({ isModalOpen, setIsModalOpen }) => {
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const [formData, setFormData] = useState({
      type:"",
      name:'',
      description:'',
      url:''
    });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("tab_1");

  const handleInputChange = ({ target: { value, name } }) => {
    setFormData({ ...formData, [name]: value });
  };
  const handleSave = () =>{

    setIsModalOpen(false);
  }
  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="Add New Link"
        width={500}
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
            <button key="save" className="btn btn-success" title="Save" onClick={handleSave}>
              Save Link
            </button>
          </div>,
        ]}
      >
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-col">
            <label className="form-label">Select Type</label>
            <select className="select pe-7.5">
              <option value="0">Please select</option>
              <option value="1">Sales</option>
              <option value="2">Marketing</option>
              <option value="3">Customer Support</option>
              <option value="4">HR/Admin</option>
              <option value="5">General</option>
              <option value="6">Automation</option>
              <option value="7">Operations</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="form-label">Link Name</label>
            <div className="input">
              <input className="h-full" type="text" value={formData.name} name={'name'} onChange={handleInputChange} placeholder="Link Name" />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="form-label">Description</label>
            <textarea
              rows={4}
              type="text"
              value={formData.description} 
              name={'description'} 
              onChange={handleInputChange}
              className="textarea h-full"
              placeholder="Description here"
            />
          </div>
          <div className="flex flex-col">
            <label className="form-label">URL</label>
            <div className="input">
              <input className="h-full" type="text"
              value={formData.url} 
              name={'url'} 
              onChange={handleInputChange}
              placeholder="URl" />
            </div>
          </div>
          <div className="flex flex-col">
            <label className="form-label">Document</label>
            <FileUploadComponent type="file" />
          </div>
        </div>
      </CustomModal>
    )
  );
};
export default AddLink;
