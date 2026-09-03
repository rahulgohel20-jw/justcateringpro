import Swal from "sweetalert2";
import { AddRights } from "@/services/apiServices";
import { useAuthContext } from "../../../auth";

const AddPermission = ({
  isOpen,
  onClose,
  role,
  permissions,
  setPermissions,
  refreshData,
}) => {
  if (!isOpen || !role) return null;
  const { refreshRights } = useAuthContext();

  const groupedPermissions = permissions.reduce((acc, item) => {
    acc[item.moduleName] = acc[item.moduleName] || [];
    acc[item.moduleName].push(item);
    return acc;
  }, {});
  
  
  const togglePermission = (index, field) => {
    setPermissions((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: !item[field] } : item
      )
    );
  };
  
  

  const handleSubmit = async () => {
    try {
      const payload = {
        roleId: role.roleId,
        rightsList: permissions.map((p) => ({
          moduleId: p.moduleId,    
          pageid: p.pageId,         
          add: Boolean(p.add),
          edit: Boolean(p.edit),
          view: Boolean(p.view),
          delete: Boolean(p.delete),
        })),
      };
  
      const res = await AddRights(payload);
  
      if (res?.data?.success) {
        Swal.fire("Success", "Permissions updated successfully!", "success");
        refreshData();
        onClose();
        await refreshRights();
      } else {
        Swal.fire(
          "Error",
          res?.data?.message || "Failed to update permissions",
          "error"
        );
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "API Failed", "error");
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-5xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Permissions – {role.role}
          </h2>
          <button onClick={onClose} className="text-2xl">
            ×
          </button>
        </div>
        <div className="border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-5 bg-[#005BA8] text-white py-2 font-medium">
          <div className="pl-4">Permission</div>
          <div className="text-center">Add</div>
          <div className="text-center">Edit</div>
          <div className="text-center">View</div>
          <div className="text-center">Delete</div>
        </div>

        {/* Modules */}
        {Object.entries(groupedPermissions).map(([moduleName, pages]) => (
          <div key={moduleName}>
            {/* Module Header */}
            <div className="bg-gray-100 px-4 py-2 font-semibold text-gray-700">
              {moduleName}
            </div>

            {/* Pages */}
            {pages.map((perm) => {
              const index = permissions.findIndex(
                (p) => p.pageId === perm.pageId
              );

              return (
                <div
                  key={perm.pageId}
                  className="grid grid-cols-5 py-3 border-t hover:bg-gray-50"
                >
                  <div className="pl-8 text-gray-700">{perm.name}</div>

                  {["add", "edit", "view", "delete"].map((field) => (
                    <div key={field} className="text-center">
                      <input
                        type="checkbox"
                        checked={perm[field] === true}   // ✅ auto check
                        onChange={() => togglePermission(index, field)}
                        className="w-5 h-5 accent-[#005BA8]"
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>



        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-[#005BA8] text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPermission;
