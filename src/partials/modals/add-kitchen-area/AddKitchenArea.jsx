import { useState, useEffect } from "react";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import {
  AddKitchenArea,
  UpdateKitchenArea,
  Translateapi,
} from "@/services/apiServices";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";

const AddKitchenAreaModal = ({
  isModalOpen,
  setIsModalOpen,
  refreshData,
  selectedMenuCategory,
}) => {
  if (!isModalOpen) return null;
  const langConfig = getLangConfig();

  const initialFormState = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [typingTimeout, setTypingTimeout] = useState(null);

  const validationSchema = Yup.object().shape({
    nameEnglish: Yup.string().required("Name is required"),
  });

  const intl = useIntl();

  useEffect(() => {
    if (selectedMenuCategory) {
      setFormData({
        nameEnglish: selectedMenuCategory.nameEnglish || "",
        nameGujarati: selectedMenuCategory.nameGujarati || "",
        nameHindi: selectedMenuCategory.nameHindi || "",
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
    setTouched({});
  }, [selectedMenuCategory]);

  const autoTranslate = (englishText) => {
    if (!englishText) return;

    Translateapi(englishText)
      .then((res) => {
        const { regional, hindi } = extractTranslations(res.data);
        setFormData((prev) => ({
          ...prev,
          nameHindi: hindi,
          nameGujarati: regional,
        }));
      })
      .catch((err) => console.error("Translate API error:", err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // ------------------------------
    // 🌟 ONLY TRANSLATE FOR ENGLISH FIELD
    // ------------------------------
    if (name === "nameEnglish") {
      if (typingTimeout) clearTimeout(typingTimeout);

      const newTimeout = setTimeout(() => {
        autoTranslate(value);
      }, 300); // debounce 300ms

      setTypingTimeout(newTimeout);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name]);
  };

  const validateField = async (field, value) => {
    try {
      await Yup.reach(validationSchema, field).validate(value);
      setErrors((prev) => ({ ...prev, [field]: "" }));
    } catch (err) {
      setErrors((prev) => ({ ...prev, [field]: err.message }));
    }
  };

  const handleSubmit = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});

      const Id = JSON.parse(localStorage.getItem("userId"));
      if (!Id) {
        Swal.fire("Error", "User data not found", "error");
        return;
      }

      const payload = { ...formData, userId: Id };

      if (selectedMenuCategory) {
        await UpdateKitchenArea(selectedMenuCategory.id, payload);
        Swal.fire("Success", "Kitchen Area updated successfully!", "success");
      } else {
        await AddKitchenArea(payload);
        Swal.fire("Success", "Kitchen Area added successfully!", "success");
      }

      refreshData();
      setIsModalOpen(false);
    } catch (err) {
      if (err.name === "ValidationError") {
        const newErrors = {};
        err.inner.forEach((e) => {
          newErrors[e.path] = e.message;
        });
        setErrors(newErrors);
        setTouched({
          nameEnglish: true,
          nameGujarati: true,
          nameHindi: true,
        });
      } else {
        Swal.fire("Error", "Something went wrong while saving", "error");
        console.error("Error saving kitchen area:", err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {selectedMenuCategory ? (
              <FormattedMessage
                id="MASTER.EDIT_KITCHEN_AREA"
                defaultMessage="Edit Kitchen Area"
              />
            ) : (
              <FormattedMessage
                id="MASTER.NEW_KITCHEN_AREA"
                defaultMessage="New Kitchen Area"
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

        <div className="grid grid-cols-2 gap-4">
          <InputWithIcon
            label={
              <FormattedMessage
                id="COMMON.NAME_ENGLISH"
                defaultMessage="Name (English)"
              />
            }
            name="nameEnglish"
            value={formData.nameEnglish}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.nameEnglish && errors.nameEnglish}
            required
            placeholder={intl.formatMessage({
              id: "COMMON.NAME_ENGLISH",
              defaultMessage: "Name (English)",
            })}
          />

          <InputWithIcon
  label={
    <FormattedMessage
      id={langConfig.nameIntlId}
      defaultMessage={langConfig.label}
    />
  }
  name="nameGujarati"
  value={formData.nameGujarati}
  onChange={handleChange}
  onBlur={handleBlur}
  error={touched.nameGujarati && errors.nameGujarati}
  required
/>

          <InputWithIcon
            label={
              <FormattedMessage
                id="COMMON.NAME_HINDI"
                defaultMessage="Name (हिंदी)"
              />
            }
            name="nameHindi"
            value={formData.nameHindi}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.nameHindi && errors.nameHindi}
            required
          />
        </div>

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
            {selectedMenuCategory ? (
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

const InputWithIcon = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  required,
}) => (
  <div className="relative">
    <label className="block text-gray-600 mb-1">
      {label}
      {required && (
        <span className="mandatory ms-0.5 text-base text-red-500">*</span>
      )}
    </label>

    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className="border rounded-lg p-2 w-full border-gray-300"
      required={required}
    />

    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

export default AddKitchenAreaModal;
