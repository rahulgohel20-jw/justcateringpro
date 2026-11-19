import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { Checkbox } from "@mui/material";
import AddRoleModal from "../add-role-modal/AddRoleModal";
import { AddRights, GetAllRole, getUserById } from "@/services/apiServices";
import axios from "axios";
import Swal from "sweetalert2";
import { useAuthContext } from "../../../auth";

const ACTIONS = ["view", "edit", "delete", "add"];
const ACTION_LABELS = { view: "View", edit: "Edit", delete: "Delete", add: "Add" };

const AddRole = ({ isModalOpen, setIsModalOpen, editData, onRoleAdded }) => {
  const [formData, setFormData] = useState({});
  const [openAddRoleModal, setOpenAddRoleModal] = useState(false);
  const [pages, setPages] = useState([]);
  const [roles, setRoles] = useState([]);
  const [rights, setRights] = useState({});
  const [activeTab, setActiveTab] = useState("pages");
  const [modules, setModules] = useState([]);
  const [currentRole, setCurrentRole] = useState([]);
  const [search, setSearch] = useState(""); // searches module name + page name
  const API_BASE = import.meta.env.VITE_API_BASE_URL;
  const userId = localStorage.getItem("userId");
  const { refreshRights } = useAuthContext();

  /* ---------------- RESET ---------------- */
  const resetForm = () => {
    setFormData({});
    setRights({});
    setActiveTab("pages");
    setSearch("");
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

  // "All" for one row: view + edit + delete + add
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

  /* ---------------- SEARCH + BULK SELECT ---------------- */
  const query = search.trim().toLowerCase();

  // module name matches -> show all its pages; otherwise only pages whose name matches
  const getVisiblePages = (module) => {
    const all = module.userRightsPages || [];
    if (!query) return all;
    if ((module.moduleName || "").toLowerCase().includes(query)) return all;
    return all.filter((p) => (p.pagename || "").toLowerCase().includes(query));
  };

  const filteredModules = modules
    .map((m) => ({ ...m, visiblePages: getVisiblePages(m) }))
    .filter((m) => m.visiblePages.length > 0);

  // set the given actions on many pages at once. items = [{ moduleId, pageId }]
  const setBulk = (items, actions, checked) => {
    setRights((prev) => {
      const next = { ...prev };
      items.forEach(({ moduleId, pageId }) => {
        const patch = {};
        actions.forEach((a) => (patch[a] = checked));
        next[pageId] = { ...next[pageId], moduleId, pageid: pageId, ...patch };
      });
      return next;
    });
  };

  const toItems = (moduleId, pagesList) =>
    pagesList.map((p) => ({ moduleId, pageId: p.pageId }));

  const allItems = filteredModules.flatMap((m) => toItems(m.moduleId, m.visiblePages));

  // state helpers for the header checkboxes
  const isChecked = (items, actions) =>
    items.length > 0 &&
    items.every(({ pageId }) => actions.every((a) => Boolean(rights[pageId]?.[a])));
  const isPartial = (items, actions) =>
    !isChecked(items, actions) &&
    items.some(({ pageId }) => actions.some((a) => Boolean(rights[pageId]?.[a])));

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

    // uses ALL modules/pages (not just the searched ones), so searching never drops rights
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

            {/* SEARCH + SELECT ALL (everything shown below) */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="input flex items-center gap-2 flex-1">
                <i className="ki-filled ki-magnifier"></i>
                <input
                  type="text"
                  className="h-full w-full bg-transparent outline-none"
                  placeholder="Search module or page name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <i className="ki-filled ki-cross text-xs"></i>
                  </button>
                )}
              </div>

              <label className="flex items-center text-sm font-semibold text-gray-700 cursor-pointer whitespace-nowrap">
                <Checkbox
                  size="small"
                  checked={isChecked(allItems, ACTIONS)}
                  indeterminate={isPartial(allItems, ACTIONS)}
                  disabled={allItems.length === 0}
                  onChange={(e) => setBulk(allItems, ACTIONS, e.target.checked)}
                />
                Select All
              </label>
            </div>

            {/* RIGHTS TABLE */}
            <div className="border rounded-lg overflow-hidden">
              {filteredModules.length === 0 && (
                <div className="p-6 text-center text-sm text-gray-500">
                  No modules or pages found
                </div>
              )}

              {filteredModules.map((module) => {
                const items = toItems(module.moduleId, module.visiblePages);

                return (
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

                            {/* All: ticks view + edit + delete + add for every page in this module */}
                            <th className="p-1 sm:p-2 text-center text-xs sm:text-sm">
                              <label className="inline-flex items-center cursor-pointer">
                                <Checkbox
                                  size="small"
                                  checked={isChecked(items, ACTIONS)}
                                  indeterminate={isPartial(items, ACTIONS)}
                                  onChange={(e) => setBulk(items, ACTIONS, e.target.checked)}
                                />
                                All
                              </label>
                            </th>

                            {/* View / Edit / Delete / Add: whole column for this module */}
                            {ACTIONS.map((action) => (
                              <th key={action} className="p-1 sm:p-2 text-center text-xs sm:text-sm">
                                <label className="inline-flex items-center cursor-pointer">
                                  <Checkbox
                                    size="small"
                                    checked={isChecked(items, [action])}
                                    indeterminate={isPartial(items, [action])}
                                    onChange={(e) => setBulk(items, [action], e.target.checked)}
                                  />
                                  {ACTION_LABELS[action]}
                                </label>
                              </th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {module.visiblePages.map((page) => (
                            <tr key={page.pageId} className="border-t">
                              <td className="p-2 sm:p-3 text-xs sm:text-sm whitespace-nowrap">
                                {page.pagename}
                              </td>

                              <td className="text-center p-1 sm:p-2">
                                <Checkbox
                                  checked={ACTIONS.every((a) => Boolean(rights[page.pageId]?.[a]))}
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
                              {ACTIONS.map((action) => (
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
                );
              })}
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