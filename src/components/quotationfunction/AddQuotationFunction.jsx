import { useState, useEffect, useRef } from "react";  // ✅ add useRef
import { AddFunctionQuotation, Translateapi } from "@/services/apiServices";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { FormattedMessage } from "react-intl";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputBox"; // ✅ add
import { extractTranslations } from "@/utils/langConfig";                   // ✅ add

const AddQuotationFunction = ({
  
  isModalOpen,
  setIsModalOpen,
  refreshData = () => {},
  selectedEvent,
}) => {
  if (!isModalOpen) return null;


  const initialFormState = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
    price: "",
  };
  const debounceRef = useRef(null); // ✅ replace debounceTimer state with ref

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (selectedEvent) {
      setFormData({
        nameEnglish: selectedEvent.name || "",
        nameGujarati: selectedEvent.nameGujarati || "",
        nameHindi: selectedEvent.nameHindi || "",
        price: selectedEvent.price || 0,
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [selectedEvent]);

  // ✅ Translate useEffect — skip on edit
useEffect(() => {
  if (!formData.nameEnglish?.trim()) {
    setFormData((prev) => ({ ...prev, nameGujarati: "", nameHindi: "" }));
    return;
  }
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    Translateapi(formData.nameEnglish)
      .then((res) => {
        const { regional, hindi } = extractTranslations(res.data);
        setFormData((prev) => ({
          ...prev,
          nameGujarati: regional || prev.nameGujarati,
          nameHindi: hindi || prev.nameHindi,
        }));
      })
      .catch(() => console.warn("Translation failed"));
  }, 500);
}, [formData.nameEnglish]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    if (!formData.nameEnglish?.trim()) {
      Swal.fire("Required", "Please enter venue name in English", "warning");
      return;
    }

    let userId;
    try {
      userId = localStorage.getItem("userId");
    } catch (e) {
      console.error("Failed to parse userID:", e);
      Swal.fire("Error", "Invalid user session", "error");
      return;
    }

    if (!userId) {
      Swal.fire("Error", "User not logged in", "error");
      return;
    }

    const payload = {
      id: selectedEvent?.id || -1,
      name: formData.nameEnglish.trim(),
      nameGujarati: formData.nameGujarati?.trim() || "",
      nameHindi: formData.nameHindi?.trim() || "",
      price: formData.price || 0,
      userId: Number(userId),
    };

    try {
      let res = await AddFunctionQuotation(payload);

      if (res?.data?.success === false && res.data.msg?.includes("exists")) {
        Swal.fire(
          "Already Exists",
          `Venue with the name '${formData.nameEnglish}' already exists.`,
          "warning",
        );
        return;
      }

      if (res?.data?.success === false) {
        Swal.fire("Failed", res.data.msg || "Could not save", "error");
        return;
      }

      Swal.fire("Success!", "Venue type saved successfully", "success");
      setFormData(initialFormState);
      setIsModalOpen(false);
      refreshData(!selectedEvent?.venueid);
    } catch (err) {
      console.error("API Error:", err);
      Swal.fire("Error", err.response?.data?.msg || "Database error", "error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#F2F7FB] rounded-xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {selectedEvent ? (
              <FormattedMessage
                id="USER.MASTER.EDIT_EVENT_TYPE"
                defaultMessage="Edit Quotation Function"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.ADD_EVENT_TYPE"
                defaultMessage="Create Quotation Function"
              />
            )}
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

          {/* ✅ MultiLangInputBox replaces 3 separate name inputs */}
          <div className="md:col-span-2">
            <MultiLangInputBox
              label="Name"
              formData={formData}
              setFormData={setFormData}
              cols={3}
              keys={{
                english: "nameEnglish",
                regional: "nameGujarati",
                hindi: "nameHindi",
              }}
              error={errors.nameEnglish}
            />
          </div>

          {/* Price — unchanged */}
          <div>
            <label className="block mb-1 font-medium">Price</label>
            <input
              type="number"
              name="price"
              className="input w-full"
              placeholder="Enter Price"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

        </div>

        {/* Buttons */}
        <div className="flex w-full justify-end mt-6 gap-3">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
          </button>
          <button
            type="button"
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
            onClick={handleSubmit}
          >
            {selectedEvent ? (
              <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
            ) : (
              <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddQuotationFunction;