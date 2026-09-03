import { useState } from "react";

import { CustomModal } from "@/components/custom-modal/CustomModal";

const AddSales = ({ isModalOpen, setIsModalOpen , titleModal="Add Member"}) => {
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    setIsModalOpen(false);
  }

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title={titleModal}
        width={500}
        footer={[
          <button key="add" className="btn btn-success" title="Save" onClick={handleSave}>Save</button>,
        ]}
      >
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-col">
            <label className="form-label">Team Member</label>
            <select className="select w-full" placeholder="Select Team Member">
              <option value="1">Henry Mark </option>
              <option value="2">Garix Fen</option>
              <option value="2">John Mep</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="form-label">Role</label>
            <select className="select w-full" placeholder="User Role">
              <option value="1">Sales Person </option>
              <option value="2">Manager</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="form-label">Manager</label>
            <select className="select w-full" placeholder="Select Manager Name">
              <option value="1">Manan Gandhi </option>
              <option value="2">Ken Jark</option>
            </select>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <label className="form-label">Assing Online Leads</label>
            <label className="switch switch-lg">
              <input
                type="checkbox"
                value="1"
                name="check"
                defaultChecked
                readOnly
              />
            </label>
          </div>
        </div>
      </CustomModal>
    )
  );
};
export default AddSales;
