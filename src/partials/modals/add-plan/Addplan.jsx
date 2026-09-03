import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { message } from "antd";
import { AddNewPlan, UpdatePlanById } from "@/services/apiServices";

export default function AddPlan({ open, onCancel, onSuccess, editPlan }) {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    billingCycle: "",
    description: "",
    isPopular: false,
    features: [""],
  });

  useEffect(() => {
    if (editPlan) {
      setFormData({
        name: editPlan.name || editPlan.plan_name || "",
        price: editPlan.price || "",
        billingCycle: editPlan.billingCycle || "",
        description: editPlan.description || "",
        isPopular:
          editPlan.isPopular === true ||
          editPlan.isPopular === "Yes" ||
          editPlan.isPopular === "yes",
        features:
          editPlan.features && editPlan.features.length > 0
            ? editPlan.features.map((f) =>
                typeof f === "object" ? f.featureText || "" : f
              )
            : [""],
      });
    } else {
      // reset when adding new plan
      setFormData({
        name: "",
        price: "",
        billingCycle: "",
        description: "",
        isPopular: false,
        features: [""],
      });
    }
  }, [editPlan, open]);

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeatureChange = (index, value) => {
    const updated = [...formData.features];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, features: updated }));
  };

  const addFeatureField = () => {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }));
  };

  const removeFeatureField = (index) => {
    const updated = formData.features.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, features: updated }));
  };

  // ✅ SweetAlert2 on Save
  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.billingCycle) {
      message.warning("Please fill all required fields");
      return;
    }

    const payload = {
      name: formData.name,
      price: Number(formData.price),
      billingCycle: formData.billingCycle,
      description: formData.description,
      isPopular: formData.isPopular,
      features: formData.features
        .filter((f) => f.trim() !== "")
        .map((f) => ({ featureText: f })),
    };

    setLoading(true);
    try {
      let res;
      if (editPlan) {
        res = await UpdatePlanById(editPlan.id, payload);
      } else {
        res = await AddNewPlan(payload);
      }

      const data = res?.data;

      if (data?.success === true) {
        // ✅ SweetAlert2 Success
        await Swal.fire({
          title: "Success!",
          text: data?.msg || "Plan created successfully!",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });

        onSuccess?.(); // refresh plan list
        onCancel?.();

        // Reset form
        setFormData({
          name: "",
          price: "",
          billingCycle: "",
          description: "",
          isPopular: false,
          features: [""],
        });
      } else {
        Swal.fire("Error!", data?.msg || "Failed to add plan", "error");
      }
    } catch (error) {
      console.error("❌ Add Plan Error:", error);
      Swal.fire("Error!", "Something went wrong while adding plan", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      price: "",
      billingCycle: "",
      description: "",
      isPopular: false,
      features: [""],
    });
    onCancel?.();
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
            onClick={onCancel}
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto w-full max-w-[700px] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  {editPlan ? "Edit Plan" : "Add New Plan"}
                </h2>{" "}
                <button
                  onClick={onCancel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
                {/* Plan Name + Price Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plan Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter plan name"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Enter plan price"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Billing Cycle + Description Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Billing Cycle <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="  text"
                      name="billingCycle"
                      value={formData.billingCycle}
                      onChange={handleInputChange}
                      placeholder="Enter billing cycle"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter plan description"
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Features Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Features
                    </label>
                    <button
                      type="button"
                      onClick={addFeatureField}
                      className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline"
                    >
                      <Plus className="w-4 h-4" /> Add Feature
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) =>
                            handleFeatureChange(index, e.target.value)
                          }
                          placeholder={`Feature ${index + 1}`}
                          className="flex-1 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeatureField(index)}
                            className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Plan Switch */}
                <div className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    name="isPopular"
                    checked={formData.isPopular}
                    onChange={handleInputChange}
                    id="isPopular"
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                  <label htmlFor="isPopular" className="text-sm text-gray-700">
                    Mark as Popular Plan
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 p-5 flex justify-center gap-3 bg-white">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  disabled={loading}
                  onClick={handleSave}
                  className={`px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 text-sm ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
