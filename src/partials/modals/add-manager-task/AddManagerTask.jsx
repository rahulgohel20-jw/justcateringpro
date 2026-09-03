import { useEffect, useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { AddManagerTask } from "@/services/apiServices";
import Swal from "sweetalert2";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const TYPE_OPTIONS = ["PRE", "POST", "RUNNING"];
const PRIORITY_OPTIONS = ["HIGH", "MEDIUM", "LOW"];

const emptyRow = () => ({
  id: 0,
  name: "",
  description: "",
  type: "PRE",
  priority: "MEDIUM",
  sequence: 0,
});

const AddManagerTaskModal = ({
  isModalOpen,
  setIsModalOpen,
  refreshData,
  editData = null,
}) => {
  const isEditMode = !!editData;
  const userId = Number(localStorage.getItem("userId"));

  const [rows, setRows] = useState([emptyRow()]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isModalOpen) return;
    if (isEditMode && editData) {
      setRows([
        {
          id: editData.id || 0,
          name: editData.name || "",
          description: editData.description || "",
          type: editData.type || "PRE",
          priority: editData.priority || "MEDIUM",
          sequence: editData.sequence ?? 0,
        },
      ]);
    } else {
      setRows([emptyRow()]);
    }
    setErrors({});
  }, [isModalOpen, isEditMode, editData]);

  const updateRow = (index, field, value) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);

  const removeRow = (index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const err = {};
    rows.forEach((row, i) => {
      if (!row.name?.trim()) err[`name-${i}`] = "Name is required";
      if (!row.type) err[`type-${i}`] = "Type is required";
      if (!row.priority) err[`priority-${i}`] = "Priority is required";
    });
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleClose = () => {
    setRows([emptyRow()]);
    setErrors({});
    setIsModalOpen(false);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      const payload = rows.map((row) => ({
        id: row.id || -1,
        name: row.name.trim(),
        description: row.description || "",
        type: row.type,
        priority: row.priority,
        sequence: Number(row.sequence) || 0,
        userId,
      }));

      // AddManagerTask accepts an array — single or multiple in one call
      const res = await AddManagerTask(payload);
      const data = res?.data;
      const success = data?.success !== false;

      if (success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text:
            data?.msg ||
            `Task${rows.length > 1 ? "s" : ""} ${isEditMode ? "updated" : "added"} successfully`,
          timer: 1500,
          showConfirmButton: false,
        });
        handleClose();
        refreshData && refreshData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data?.msg || "Something went wrong.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Something went wrong.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleClose}
        title={isEditMode ? "Edit Manager Task" : "Add Manager Task(s)"}
        width="min(800px, 95vw)"
        footer={[
          <div
            key="footer"
            className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 w-full"
          >
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 w-full sm:w-auto"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded-md w-full sm:w-auto  disabled:bg-gray-400"
              disabled={isLoading}
            >
              {isLoading
                ? "Saving..."
                : isEditMode
                  ? "Update Task"
                  : `Save ${rows.length > 1 ? `${rows.length} Tasks` : "Task"}`}
            </button>
          </div>,
        ]}
      >
        <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-4">
          {rows.map((row, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
              {!isEditMode && rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeRow(index)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                >
                  <DeleteOutlined />
                </button>
              )}

              {!isEditMode && (
                <div className="text-xs font-semibold text-gray-600 uppercase mb-3">
                  Task {index + 1}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => updateRow(index, "name", e.target.value)}
                    placeholder="Enter task name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors[`name-${index}`] && (
                    <div className="text-red-500 text-sm mt-1">{errors[`name-${index}`]}</div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={row.description}
                    onChange={(e) => updateRow(index, "description", e.target.value)}
                    placeholder="Enter description (optional)"
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={row.type}
                    onChange={(e) => updateRow(index, "type", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors[`type-${index}`] && (
                    <div className="text-red-500 text-sm mt-1">{errors[`type-${index}`]}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={row.priority}
                    onChange={(e) => updateRow(index, "priority", e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITY_OPTIONS.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {errors[`priority-${index}`] && (
                    <div className="text-red-500 text-sm mt-1">{errors[`priority-${index}`]}</div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium mb-1">Sequence</label>
                  <input
                    type="tel"
                    value={row.sequence}
                    onChange={(e) => updateRow(index, "sequence", e.target.value)}
                    placeholder="0"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}

          {!isEditMode && (
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-2 text-primary font-medium text-sm hover:underline"
            >
              <PlusOutlined /> Add Another Task
            </button>
          )}
        </div>
      </CustomModal>
    )
  );
};

export default AddManagerTaskModal;