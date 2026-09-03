import { useEffect, useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { Textarea } from "@/components/ui/textarea";

const AddLeadNote = ({ isModalOpen, setIsModalOpen, editData }) => {
  const [dateOfBirth, setDateOfBirth] = useState(null);
  const [formData, setFormData] = useState();

  const handInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const saveData = () => {
    // Save data logic here

    setIsModalOpen(false);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const [activeTab, setActiveTab] = useState("tab_1");

  useEffect(() => {
    if (isModalOpen) {
      setFormData(editData);
    } else {
      setFormData(null);
    }
  }, [isModalOpen]);

  return (
    isModalOpen && (
      <>
        <CustomModal
          open={isModalOpen}
          onClose={handleModalClose}
          title="Add Note"
          footer={[
            <button
              key="cancel"
              className="btn btn-light"
              onClick={handleModalClose}
              title="Cancel"
            >
              Cancel
            </button>,
            <button
              key="save"
              className="btn btn-success"
              title="Save Note"
              onClick={saveData}
            >
              Save Note
            </button>,
          ]}
        >
          <div className="flex flex-col gap-y-2">
            <div className="grid">
              <div className="flex flex-col">
                <label className="form-label">Description</label>
                <textarea
                  className="textarea h-full"
                  placeholder="Description"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </CustomModal>
      </>
    )
  );
};
export default AddLeadNote;
