import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { GetUnitData, GetAllRawMaterial } from "@/services/apiServices";
import AddRawMaterial from "@/partials/modals/add-raw-material/AddRawMaterial";

const ItemRawmaterial = ({
  isModalOpen,
  setIsModalOpen,
  refreshData = () => {},
  selectedEvent,
  existingRawMaterials = [], // Add this prop to receive existing raw materials
}) => {
  const initialFormState = {
    rawMaterial: "",
    weight: "",
    unit: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [rawMaterialOptions, setRawMaterialOptions] = useState([]);
  const [unitOptions, setUnitOptions] = useState([]);
  const [isRawMaterialModalOpen, setIsRawMaterialModalOpen] = useState(false);

  let userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!isModalOpen) return;

    if (selectedEvent) {
      setFormData({
        rawMaterial: selectedEvent.name,
        weight: selectedEvent.weight,
        unit: selectedEvent.unit,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [selectedEvent, isModalOpen]);

  useEffect(() => {
    if (!userId) return;
    const page = 1;
    const ITEMS_PER_PAGE = 999;
    const categoryId = 0;

    GetAllRawMaterial(page, ITEMS_PER_PAGE, categoryId, userId)
      .then((res) => {
        const materials = res.data.data["Raw Material Details"].map((raw) => ({
          id: raw.id,
          name: raw.nameEnglish || "-",
          rate: raw.supplierRate,
        }));
        setRawMaterialOptions(materials);
      })
      .catch((err) => {
        console.error("Error fetching raw materials:", err);
      });

    GetUnitData(userId)
      .then((res) => {
        const units = res.data.data["Unit Details"].map((unit) => ({
          id: unit.id,
          nameEnglish: unit.nameEnglish,
          symbolEnglish: unit.symbolEnglish,
        }));
        setUnitOptions(units);
      })
      .catch((err) => {
        console.error("Error fetching unit data:", err);
      });
  }, [userId]);

  const schema = Yup.object().shape({
    rawMaterial: Yup.string().required("Raw Material is required"),
    weight: Yup.number()
      .typeError("Weight must be a number")
      .positive("Weight must be positive")
      .required("Weight is required"),
    unit: Yup.string().required("Unit is required"),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    try {
      await schema.validate(formData, { abortEarly: false });

      const selectedMaterial = rawMaterialOptions.find(
        (rm) => rm.name === formData.rawMaterial,
      );
      const selectedUnit = unitOptions.find(
        (u) => u.id === Number(formData.unit),
      );

      // Check for duplicate raw material (skip check if editing)
      if (!selectedEvent) {
        const isDuplicate = existingRawMaterials.some(
          (existing) => existing.name === formData.rawMaterial,
        );

        if (isDuplicate) {
          // Set error instead of showing SweetAlert
          setErrors((prev) => ({
            ...prev,
            rawMaterial: `${formData.rawMaterial} has already been added. Please select a different raw material.`,
          }));
          return;
        }
      } else {
        // If editing, check if the new selection is different and already exists
        const isDuplicate = existingRawMaterials.some(
          (existing) =>
            existing.name === formData.rawMaterial &&
            existing.id !== selectedEvent.id,
        );

        if (isDuplicate) {
          // Set error instead of showing SweetAlert
          setErrors((prev) => ({
            ...prev,
            rawMaterial: `${formData.rawMaterial} has already been added. Please select a different raw material.`,
          }));
          return;
        }
      }

      const weightNum = Number(formData.weight);
      const rateNum = selectedMaterial?.rate || 0;

      const totalRate = weightNum * rateNum;

      const newRow = {
        id: selectedEvent?.id || Date.now(),
        rawMaterialId: selectedMaterial.id,
        name: formData.rawMaterial,
        weight: weightNum,
        unit: selectedUnit?.nameEnglish || "",
        unitId: selectedUnit?.id || "",
        rate: totalRate,
      };

      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: `Raw Material ${formData.rawMaterial} ${
          selectedEvent ? "updated" : "added"
        } successfully!`,
      });

      refreshData(newRow);
      setIsModalOpen(false);
      setFormData(initialFormState);
    } catch (validationErrors) {
      if (validationErrors.inner) {
        const newErrors = {};
        validationErrors.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
      }
    }
  };

  return (
    <>
      {/* Main Modal (hidden via CSS instead of unmounting) */}
      <div
        className={`fixed inset-0 z-[2000] flex items-center justify-center bg-black/50 ${
          isModalOpen ? "block" : "hidden"
        }`}
      >
        <div className="bg-[#F2F7FB] rounded-xl w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh]">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {selectedEvent ? "Edit Raw Material" : "New Raw Material"}
            </h2>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-2xl text-gray-600"
            >
              &times;
            </button>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Raw Material */}
            <div>
              <label className="block mb-1 font-medium">Raw Material*</label>
              <div className="flex">
                <select
                  name="rawMaterial"
                  value={formData.rawMaterial}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-l-lg px-3 py-2"
                >
                  <option value="">Select Raw Material</option>
                  {rawMaterialOptions.map((rm) => (
                    <option key={rm.id} value={rm.name}>
                      {rm.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsRawMaterialModalOpen(true);
                  }}
                  className="bg-primary text-white border border-gray-300 border-l-0 rounded-r-lg px-3"
                >
                  +
                </button>
              </div>
              {errors.rawMaterial && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.rawMaterial}
                </p>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="block mb-1 font-medium">Weight*</label>
              <input
                type="text"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Enter weight"
              />
              {errors.weight && (
                <p className="text-red-500 text-sm mt-1">{errors.weight}</p>
              )}
            </div>

            {/* Unit */}
            <div>
              <label className="block mb-1 font-medium">Unit*</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select Unit</option>
                {unitOptions.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.nameEnglish} ({unit.symbolEnglish})
                  </option>
                ))}
              </select>

              {errors.unit && (
                <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex w-full justify-end mt-6 gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
              onClick={handleSubmit}
            >
              {selectedEvent ? "Update" : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Add Raw Material Modal */}
      <AddRawMaterial
        isOpen={isRawMaterialModalOpen}
        onClose={() => {
          setIsRawMaterialModalOpen(false);
          setIsModalOpen(true);
        }}
      />
    </>
  );
};

export default ItemRawmaterial;
