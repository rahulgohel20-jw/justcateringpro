import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AssignDb } from "@/services/apiServices";
import { Select, Input, message } from "antd";

export default function DatabaseAssigntocustomer({
  open,
  onClose,
  selectedRow,
  allUsers = [],
}) {
  const [formData, setFormData] = useState({
    selectedCustomer: undefined,
    instructions: "",
  });
  const [saving, setSaving] = useState(false);

  const sourceDb = selectedRow?.databaseRaw || null;

  useEffect(() => {
    if (open) {
      setFormData({
        selectedCustomer: undefined,
        instructions: sourceDb?.instructions || "",
      });
    }
  }, [open, selectedRow]);

  const handleSave = async () => {
    if (!formData.selectedCustomer) {
      message.error("Please select a customer to assign the database to");
      return;
    }
    if (!sourceDb?.id) {
      message.error("No database found for this source user");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        dbPlanningId: sourceDb.id.toString(), // ✅ database.id = 78
        userId: formData.selectedCustomer.toString(), // ✅ receiver's userId
        //    instructions: formData.instructions || "",
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
    setFormData({ selectedCustomer: undefined, instructions: "" });
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
              <div className="p-4 md:p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ✅ SOURCE USER — read-only, from clicked row */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source User
                      <span className="ml-1 text-xs text-gray-400 font-normal">
                        (selected from table)
                      </span>
                    </label>
                    <Input
                      value={
                        selectedRow?.fullName
                          ? `${selectedRow.fullName} · ${selectedRow.userCode}`
                          : ""
                      }
                      disabled
                      className="bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      ID: {selectedRow?.id}
                    </p>
                  </div>

                  {/* ✅ DATABASE — read-only, auto-filled from selectedRow.databaseRaw */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source Database
                      <span className="ml-1 text-xs text-gray-400 font-normal">
                        (auto-filled from source user)
                      </span>
                    </label>
                    <Input
                      value={sourceDb?.dbName || ""}
                      disabled
                      placeholder="No database found for this user"
                      className="bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    {sourceDb?.dbName && (
                      <p className="text-xs text-gray-400 mt-1">
                        DB Name:{" "}
                        <span className="font-medium text-gray-600">{""}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* ✅ DB info strip — always shown if sourceDb exists */}
                {sourceDb && (
                  <div className="grid grid-cols-3 gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div>
                      <p className="text-xs text-gray-500">DB ID</p>
                      <p className="text-sm font-medium text-gray-700">
                        {sourceDb.id}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">State</p>
                      <p className="text-sm font-medium text-gray-700">
                        {sourceDb.state || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Currently Used By</p>
                      <p className="text-sm font-medium text-gray-700">
                        {sourceDb.userName || "-"}
                      </p>
                    </div>
                  </div>
                )}

                {/* ✅ ASSIGN TO — dropdown, user picks who receives the DB */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign Database To
                    <span className="ml-1 text-xs text-gray-400 font-normal">
                      (select customer who will receive this database)
                    </span>
                  </label>
                  <Select
                    showSearch
                    placeholder="Search and select customer..."
                    value={formData.selectedCustomer}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        selectedCustomer: value,
                      }))
                    }
                    className="w-full"
                    optionFilterProp="label"
                    options={allUsers
                      // ✅ Exclude the source user from the list
                      .filter((c) => c.id !== selectedRow?.id)
                      .map((c) => ({
                        value: c.id,
                        label: c.fullName + " (" + c.companyName + ")",
                      }))}
                  />
                </div>

                {/* Instructions */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions{" "}
                    <span className="text-gray-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <Input
                    name="instructions"
                    value={formData.instructions}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        instructions: e.target.value,
                      }))
                    }
                    placeholder="Add any instructions..."
                  />
                </div> */}
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
                  disabled={
                    saving || !formData.selectedCustomer || !sourceDb?.id
                  }
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Assigning..." : "Assign Database to Customer"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
