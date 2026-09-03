import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { getAllByRoleIdData, AssignDb } from "@/services/apiServices";
import { Select, Input, message } from "antd";

export default function DatabaseAssign({ open, onClose, selectedRow }) {
  const [formData, setFormData] = useState({
    databaseName: selectedRow?.database_name || "",
    customer: selectedRow?.customer || "",
    instructions: "",
  });

  const [customers, setCustomers] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (selectedRow) {
        setFormData({
          databaseName: selectedRow.database_name || "",
          customer: selectedRow.customer || "",
          instructions: selectedRow.instructions || "",
        });
      }

      fetchCustomers();
    }
  }, [open, selectedRow]);

  const fetchCustomers = async () => {
    try {
      const res = await getAllByRoleIdData(2, "All");
      const users = Array.isArray(res.data.data["User Details"].users)
        ? res.data.data["User Details"].users
        : [];
  

      setCustomers(users);
    } catch (err) {
      console.error("❌ Error fetching role-based users:", err);
      setCustomers([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.customer) {
      message.error("Please select a customer");
      return;
    }

    if (!selectedRow?.db_planning_id) {
      message.error("Database ID is missing");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        dbPlanningId: selectedRow.db_planning_id.toString(), // as string
        userId: formData.customer.toString(), // customer/user ID
      };

      const res = await AssignDb(payload);

      if (res?.data?.success) {
        message.success("Database assigned successfully!");
        onClose();
      } else {
        message.error(res?.data?.msg || "Failed to assign database");
      }
    } catch (err) {
      console.error("❌ Error assigning database:", err);
      message.error(err?.response?.data?.msg || "Error assigning database");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      databaseName: "",
      customer: "",
      instructions: "",
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto w-full max-w-[700px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
                  Assign Database to Customer
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6 space-y-4 md:space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Selected Database */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Database
                    </label>
                    <Input
                      name="databaseName"
                      value={formData.databaseName}
                      placeholder="Database name"
                      disabled
                      className="bg-gray-100 text-black cursor-not-allowed"
                    />
                  </div>

                  {/* Customer Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name
                    </label>
                    <Select
                      showSearch
                      className="w-full"
                      placeholder="Search Customer"
                      value={formData.customer || undefined}
                      onChange={(value) =>
                        setFormData((prev) => ({ ...prev, customer: value }))
                      }
                      filterOption={(input, option) => {
                        const customer = customers.find(
                          (c) => c.id === option.value,
                        );
                        if (!customer) return false;

                        const search = input.toLowerCase();
                        const firstName =
                          customer.firstName?.toLowerCase() || "";
                        const lastName = customer.lastName?.toLowerCase() || "";
                        const company =
                          customer.userBasicDetails?.companyName?.toLowerCase() ||
                          "";
                        const email = customer.email?.toLowerCase() || "";

                        return (
                          firstName.includes(search) ||
                          lastName.includes(search) ||
                          `${firstName} ${lastName}`.includes(search) ||
                          company.includes(search) ||
                          email.includes(search)
                        );
                      }}
                      options={customers.map((c) => ({
                        value: c.id,
                        label:
                          c.firstName && c.lastName
                            ? `${c.firstName} ${c.lastName} (${c.userBasicDetails?.companyName})`
                            : c.firstName || c.lastName || c.email,
                      }))}
                    />
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <Input
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    placeholder="Instructions for customer"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-4 md:p-6 flex gap-3 justify-center bg-white">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
