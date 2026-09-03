import { useEffect, useState } from "react";
import { Modal, Checkbox, Spin } from "antd";
import Swal from "sweetalert2";
import {
  GetRoleTree,
  GetAllRole,
  AddChildRole,
  GetChildRolesByParentId,
  DeleteChildRole,
} from "@/services/apiServices";

const AddChildRoleModal = ({ isOpen, onClose, parentRole, onSaved }) => {
  const userId = localStorage.getItem("userId");

  const [allRoles, setAllRoles] = useState([]);
  const [existingChildren, setExistingChildren] = useState([]); // already assigned
  const [ancestorIds, setAncestorIds] = useState(new Set()); // blocked (ancestors)
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingChildrenData, setExistingChildrenData] = useState([]); 

  useEffect(() => {
    if (!isOpen || !parentRole) return;
    loadData();
  }, [isOpen, parentRole]);

 const loadData = async () => {
  setLoading(true);
  setSelectedIds([]);
  try {
    const rolesRes = await GetAllRole(userId);
    const roles = rolesRes?.data?.data?.["Role Details"] || [];

    const blocked = new Set();
    blocked.add(Number(parentRole.roleId));
    setAncestorIds(blocked);

    try {
      const childRes = await GetChildRolesByParentId(parentRole.roleId, userId);
      if (childRes?.data?.success) {
  const children = childRes?.data?.data?.childrenRole || [];
  const childIds = children.map((c) => Number(c.childRoleId));
  setExistingChildrenData(children); 
  setExistingChildren(childIds);
  setSelectedIds(childIds);
} else {
  setExistingChildrenData([]);
  setExistingChildren([]);
  setSelectedIds([]);
}
    } catch {
    
      setExistingChildren([]);
      setSelectedIds([]);
    }

    setAllRoles(roles);
  } catch (err) {
    console.error("Failed to load data:", err);
  } finally {
    setLoading(false);
  }
};

  const collectAncestors = (tree, targetId, blocked) => {
    const findParents = (nodes, childId) => {
      for (const node of nodes) {
        if (Number(node.id) === childId || Number(node.roleId) === childId) {
          return true;
        }
        if (node.children?.length) {
          if (findParents(node.children, childId)) {
            blocked.add(Number(node.id ?? node.roleId));
            return true;
          }
        }
      }
      return false;
    };
    findParents(tree, targetId);
  };

  const toggleRole = (roleId) => {
    const id = Number(roleId);
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };


  const handleDeleteChild = async (child) => {
  const result = await Swal.fire({
    icon: "warning",
    title: "Remove Child Role?",
    text: `Are you sure you want to remove "${child.childRoleName}"?`,
    showCancelButton: true,
    confirmButtonText: "Yes, Remove",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;

  try {
    const res = await DeleteChildRole(child.hierarchyId);
    if (res?.data?.success) {
      Swal.fire({ icon: "success", title: res?.data?.msg || "Removed!", timer: 1200, showConfirmButton: false });
      loadData(); // refresh
    } else {
      Swal.fire({ icon: "error", title: res?.data?.msg || "Failed to remove." });
    }
  } catch (err) {
    Swal.fire({ icon: "error", title: err?.response?.data?.msg || "Failed to remove." });
  }
};

 const handleSave = async () => {
  if (selectedIds.length === 0) {
    Swal.fire({ icon: "warning", title: "Select at least one child role." });
    return;
  }
  setSaving(true);

  
  try {
   const payload = selectedIds.map((childId) => {
  const existing = existingChildrenData.find(
    (c) => Number(c.childRoleId) === childId
  );
  return {
    childRoleId: childId,
    hierarchyId: existing ? existing.hierarchyId : 0,
    parentRoleId: Number(parentRole.roleId),
    userId: Number(userId),
  };
});

    const res = await AddChildRole(payload);

    if (res?.data?.success) {
      Swal.fire({
        icon: "success",
        title: res?.data?.msg || "Child roles saved!",
        timer: 1200,
        showConfirmButton: false,
      });
      onSaved?.();
      onClose();
    } else {
      Swal.fire({
        icon: "error",
        title: res?.data?.msg || "Failed to save child roles.",
      });
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: err?.response?.data?.msg || "Failed to save child roles.",
    });
  } finally {
    setSaving(false);
  }
};

  const availableRoles = allRoles.filter(
    (r) => !ancestorIds.has(Number(r.id))
  );

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2">
          <i className="ki-filled ki-graph-up text-success text-lg" />
          <span>
            Add Child Roles for{" "}
            <span className="text-primary font-bold">
              {parentRole?.role_name}
            </span>
          </span>
        </div>
      }
      footer={null}
      width={480}
      destroyOnClose
    >
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
  
 
  {existingChildrenData.length > 0 && (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">Already Assigned</p>
      <div className="border rounded-lg overflow-hidden divide-y">
        {existingChildrenData.map((child) => (
          <div
            key={child.hierarchyId}
            className="flex items-center justify-between px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
              <span className="text-sm font-medium text-gray-700">
                {child.childRoleName}
              </span>
            </div>
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => handleDeleteChild(child)}
            >
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </div>
        ))}
      </div>
    </div>
  )}


  <div>
    <p className="text-xs font-semibold text-gray-500 mb-2">Add New Child Roles</p>
    <div className="border rounded-lg overflow-hidden divide-y max-h-60 overflow-y-auto no-scrollbar">
      {availableRoles.filter(r => !existingChildren.includes(Number(r.id))).length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-gray-400">
          No roles available to assign.
        </div>
      ) : (
        availableRoles
          .filter((r) => !existingChildren.includes(Number(r.id))) // hide already assigned
          .map((role) => {
            const id = Number(role.id);
            const isChecked = selectedIds.includes(id);
            return (
              <label
                key={role.id}
                className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition
                  ${isChecked ? "bg-primary/5" : "hover:bg-gray-50"}`}
              >
                <Checkbox
                  checked={isChecked}
                  onChange={() => toggleRole(role.id)}
                />
                <span className={`text-sm font-medium ${isChecked ? "text-primary" : "text-gray-700"}`}>
                  {role.name}
                </span>
              </label>
            );
          })
      )}
    </div>
  </div>

  <div className="flex justify-end gap-2 pt-2">
    <button
      className="btn border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm"
      onClick={onClose}
    >
      Cancel
    </button>
    <button
      className="btn bg-primary text-white px-6 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
      onClick={handleSave}
      disabled={saving || selectedIds.filter(id => !existingChildren.includes(id)).length === 0}
    >
      {saving ? "Saving..." : "Save"}
    </button>
  </div>
</div>
      )}
    </Modal>
  );
};

export default AddChildRoleModal;