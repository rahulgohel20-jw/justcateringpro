import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { Checkbox } from "@mui/material";
import AddRoleModal from "../add-role-modal/AddRoleModal";
import { AddRights, GetAllRole, getUserById } from "@/services/apiServices";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuthContext } from "../../../auth";

const AddRole = ({ isModalOpen, setIsModalOpen, editData, onRoleAdded }) => {
  const [formData, setFormData] = useState({});
  const [openAddRoleModal, setOpenAddRoleModal] = useState(false);
  const [pages, setPages] = useState([]);
  const [roles, setRoles] = useState([]);
  const [rights, setRights] = useState({});
  const [activeTab, setActiveTab] = useState("pages");
  const [modules, setModules] = useState([]);
  const [currentRole, setCurrentRole] = useState([]);
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const userId = localStorage.getItem("userId");
  const { refreshRights } = useAuthContext();


  /* ---------------- RESET ---------------- */
  const resetForm = () => {
    setFormData({});
    setRights({});
    setActiveTab("pages");
  };

  const fetchuser = async () => {
    try {
      const res = await getUserById(userId);
      const roleId = res.data?.data["User Details"][0].userBasicDetails.role.id;

      setCurrentRole(roleId);

      fetchPages(roleId);
    } catch {
      setCurrentRole(null);
    }
  };

  /* ---------------- FETCH ROLES ---------------- */
  const fetchRoles = async () => {
    try {
      const res = await GetAllRole(userId);
      setRoles(res.data?.data?.["Role Details"] || []);
    } catch {
      setRoles([]);
    }
  };

  /* ---------------- FETCH PAGES ---------------- */
  const fetchPages = async (roleId) => {
    try {
      const istrue = roleId !== 1;
      const iscombo = roleId === 1 ? true : false;

      const res = await axios.get(
        `${API_BASE}/user-rights/getPages?isAdminRights=${istrue}&isCombine=false`,
      );

      setModules(res.data?.data?.ModuleWiseUserRights || []);
    } catch {
      setModules([]);
    }
  };

  /* ---------------- FETCH ROLE RIGHTS (EDIT) ---------------- */
  const fetchRoleRights = async (roleId) => {
    try {
      const res = await axios.get(
        `${API_BASE}/user-rights/getByRole?roleId=${roleId}`,
      );

      const data = res.data.data?.UserRights || {};

      const formatted = {};

      data.forEach((module) => {
        module.userRights.forEach((page) => {
          formatted[page.pageid] = {
            moduleId: module.moduleId,
            pageId: page.pageid, // ✅ normalize
            view: page.view,
            add: page.add,
            edit: page.edit,
            delete: page.delete,
          };
        });
      });

      setRights(formatted);
    } catch (err) {
      console.error("Error fetching role rights", err);
    }
  };

  /* ---------------- EFFECT ---------------- */
  useEffect(() => {
    if (!isModalOpen) return;
    fetchuser();
    fetchPages();
    fetchRoles();

    if (editData?.roleId) {
      setFormData({ role_name: editData.role_name });
      fetchRoleRights(editData.roleId); // ✅ correct
    } else {
      resetForm();
    }
  }, [isModalOpen, editData]);

  /* ---------------- HANDLERS ---------------- */
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // ✅ When department/role is selected, fetch its rights
    if (name === "role_name" && value) {
      const selectedRole = roles.find((r) => r.name === value);
      if (selectedRole?.id) {
        fetchRoleRights(selectedRole.id);
      }
    }
  };

  const handleCheckboxChange = (moduleId, pageId, action, checked) => {
    setRights((prev) => ({
      ...prev,
      [pageId]: {
        ...prev[pageId],
        moduleId,
        pageid: pageId,
        [action]: checked,
      },
    }));
  };

  const handleCheckAll = (moduleId, pageId, checked) => {
  setRights((prev) => ({
    ...prev,
    [pageId]: {
      ...prev[pageId],
      moduleId,
      pageid: pageId,
      view: checked,
      edit: checked,
      delete: checked,
      add: checked,
    },
  }));
};

  /* ---------------- HANDLE ROLE ADDED FROM NESTED MODAL ---------------- */
  const handleRoleAddedFromModal = async () => {
    await fetchRoles(); // Update AddRole's own dropdown

    // ✅ Notify parent (AddMember) to update its dropdown
    if (onRoleAdded) {
      onRoleAdded();
    }
  };
  const handleAddRole = async () => {
    const role = roles.find((r) => r.name === formData.role_name);

    if (!role) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Role not selected",
      });
      return;
    }

    const rightsList = [];

    modules.forEach((module) => {
      module.userRightsPages.forEach((page) => {
        const existing = rights[page.pageId] || {};

        rightsList.push({
          moduleId: module.moduleId,
          pageid: page.pageId,
          view: existing.view || false,
          edit: existing.edit || false,
          delete: existing.delete || false,
          add: existing.add || false,
        });
      });
    });

    const payload = {
      roleId: role.id,
      rightsList,
    };

    try {
      const res = await AddRights(payload);

      // ✅ Handle both success and failure from backend
      if (res?.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: res.data.msg,
          timer: 1500,
          showConfirmButton: false,
        });

        resetForm();
        handleModalClose();
        onRoleAdded?.(); 
         await refreshRights();
      } else {
        // ❌ Backend returned success: false
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.msg || "Something went wrong!", // <-- show BE msg
        });
      }
    } catch (err) {
      // ❌ catch network or server errors
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.msg || "Server error",
      });
    }
  };

  /* ---------------- UI ---------------- */
  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="Assign User Rights"
        width="min(650px, 95vw)"
        footer={[
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-2 w-full" key="footer">
  <button className="btn btn-light w-full sm:w-auto" onClick={handleModalClose}>Cancel</button>
  <button className="btn btn-success w-full sm:w-auto" onClick={handleAddRole}>Save</button>
</div>
        ]}
      >
        <div className="max-h-[65vh] sm:max-h-[60vh] overflow-y-auto px-1 sm:px-2">
          <div className="flex flex-col gap-y-3">
            {/* ROLE SELECT */}
            <div className="flex flex-col">
              <label className="form-label">Department</label>

              <div className="relative input flex items-center">
                <i className="ki-filled ki-user"></i>

                <select
                  className="h-full w-full bg-transparent outline-none pr-10"
                  name="role_name"
                  value={formData.role_name || ""}
                  onChange={handleInputChange}
                >
                  <option value="">Select Department</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setOpenAddRoleModal(true)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center"
                >
                  <i className="ki-filled ki-plus text-xs"></i>
                </button>
              </div>
            </div>

            {/* RIGHTS TABLE */}
            <div className="border rounded-lg overflow-hidden">
              {modules.map((module) => (
                <div key={module.moduleId} className="mb-4">
                  {/* MODULE HEADER */}
                  <div className="bg-gray-200 px-4 py-2 font-bold text-primary">
                    {module.moduleName}
                  </div>
                  <div className="overflow-x-auto">
                  {/* PAGES TABLE */}
                  <table className="min-w-full table-auto">
                    <thead className="bg-gray-100">
                      <tr>
                       
  <th className="p-2 sm:p-3 text-left text-xs sm:text-sm">
    Page Name
  </th>

   <th className="p-2 sm:p-3 text-center text-xs sm:text-sm">
    All
  </th>

  <th className="p-2 sm:p-3 text-center text-xs sm:text-sm">
    View
  </th>

  <th className="p-2 sm:p-3 text-center text-xs sm:text-sm">
    Edit
  </th>

  <th className="p-2 sm:p-3 text-center text-xs sm:text-sm">
    Delete
  </th>

  <th className="p-2 sm:p-3 text-center text-xs sm:text-sm">
    Add
  </th>
</tr>
                    </thead>

                    <tbody>
                      {module.userRightsPages.map((page) => (
                        <tr key={page.pageId} className="border-t">
                          

                         <td className="p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap">
  {page.pagename}
</td>

<td className="text-center p-1 sm:p-2">
  <Checkbox
    checked={
      Boolean(rights[page.pageId]?.view) &&
      Boolean(rights[page.pageId]?.edit) &&
      Boolean(rights[page.pageId]?.delete) &&
      Boolean(rights[page.pageId]?.add)
    }
    onChange={(e) =>
      handleCheckAll(
        module.moduleId,
        page.pageId,
        e.target.checked,
      )
    }
  />
</td>
{/* Individual Rights */}
{["view", "edit", "delete", "add"].map((action) => (
  <td key={action} className="text-center p-1 sm:p-2">
    <Checkbox
      checked={rights[page.pageId]?.[action] || false}
      onChange={(e) =>
        handleCheckboxChange(
          module.moduleId,
          page.pageId,
          action,
          e.target.checked,
        )
      }
    />
  </td>
))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ADD ROLE MODAL */}
        <AddRoleModal
          isModalOpen={openAddRoleModal}
          setIsModalOpen={setOpenAddRoleModal}
          onRoleAdded={handleRoleAddedFromModal} // ✅ Updated to use new handler
        />
      </CustomModal>
    )
  );
};

AddRole.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  editData: PropTypes.object,
  onRoleAdded: PropTypes.func, // ✅ ADD THIS
};

export default AddRole;
