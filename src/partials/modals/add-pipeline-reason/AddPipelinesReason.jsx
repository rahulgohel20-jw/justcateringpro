import { useEffect, useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { GetAllRole } from "@/services/apiServices"; // <-- adjust path if needed
import { set } from "date-fns";

const AddPipelinesReason = ({ isModalOpen, setIsModalOpen }) => {
  const [taskAccess, setTaskAccess] = useState(true);
  const [leaveAccess, setLeaveAccess] = useState(true);

  const [roles, setRoles] = useState([]); // store roles from API
  const [selectedRole, setSelectedRole] = useState("");

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSave = () => {
    setIsModalOpen(false);
  };
  useEffect(() => {
    if (isModalOpen) {
      GetAllRole()
        .then((res) => {
          setRoles(res.data.data["Role Details"]);
        })
        .catch((err) => {
          console.error("Error fetching roles:", err);
          setRoles([]);
        });
    }
  }, [isModalOpen]);

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="Add new reason"
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
              title="Save"
              onClick={handleModalSave}
            >
              Save
            </button>
          </div>,
        ]}
      >
        <div className="flex flex-col gap-y-2">
          <div className="flex flex-col">
            <label className="form-label">Name</label>
            <input type="text" className="input" placeholder="Name" />
          </div>
          {/* <div className="flex flex-col">
              <label className="form-label">Role</label>
              <select
                className="select pe-7.5"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="">Select Role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.name}>
                    {role.name}
                  </option>
                ))}
              </select>
          </div> */}
        </div>
      </CustomModal>
    )
  );
};
export default AddPipelinesReason;
