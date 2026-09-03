import { useState } from "react";
import InputToTextLang from "@/components/form-inputs/InputToTextLang";
import * as Yup from "yup";
import { FormattedMessage } from "react-intl";
import { Addrole } from "@/services/apiServices";
import Swal from "sweetalert2";

const AddRoleModal = ({ isModalOpen, setIsModalOpen, selectedEvent, onRoleAdded,   }) => {
  if (!isModalOpen) return null;

  const initialFormState = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const validationSchema = Yup.object().shape({
    nameEnglish: Yup.string().required("Name is required"),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      const userid = localStorage.getItem("userId");

      const payload = {
        name: formData.nameEnglish,
        userId: userid,
      };

      const res = await Addrole(payload);

      if (res?.data.success == true) {
        Swal.fire({
          icon: "success",
          title: "Role added successfully!",
          timer: 1500,
          showConfirmButton: false,
        });

        setFormData(initialFormState);
        setIsModalOpen(false);
      
        if (onRoleAdded) {
          onRoleAdded();
        }
      
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed to add role",
          text: res?.data?.message || "Something went wrong",
        });
      }
    } catch (err) {
      if (err.inner) {
        const formErrors = {};
        err.inner.forEach((error) => {
          formErrors[error.path] = error.message;
        });
        setErrors(formErrors);
        return;
      }

      // API error
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.response?.data?.message || "Something went wrong",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#F2F7FB] rounded-xl w-full max-w-xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {selectedEvent ? (
              <FormattedMessage
                id="USER.MASTER.EDITROLE"
                defaultMessage="Edit Role"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.ADDROLE"
                defaultMessage="Create New Department "
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
        <div>
          {/* English */}
          <div>
            <InputToTextLang
              label={
                <FormattedMessage
                  id="COMMON.NAME_ENGLISH"
                  defaultMessage="Name (English)"
                />
              }
              name="nameEnglish"
              value={formData.nameEnglish}
              onChange={handleChange}
              lang={"en-US"}
              required
            />
            {errors.nameEnglish && (
              <p className="text-red-500 text-sm mt-1">{errors.nameEnglish}</p>
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

export default AddRoleModal;
