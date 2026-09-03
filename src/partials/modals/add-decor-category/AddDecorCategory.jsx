import { useState, useEffect } from "react";
import { AddDecorCategory, Translateapi } from "@/services/apiServices";
import { CustomModal } from "../../../components/custom-modal/CustomModal";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputbox";
import { formValidation } from "../../../lib/utils";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";

const AddDecorCategoryModal = ({
  isModalOpen,
  setIsModalOpen,
  refreshData,
  editData,
}) => {
  if (!isModalOpen) return null;

  const intl = useIntl();

  const initialFormState = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
    categorySlogan: "",
    price: "",
    sequence: "",
    file: null,
  };

  const requiredFields = ["nameEnglish"];

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [debounceTimer, setDebounceTimer] = useState(null);

  /* -------------------- INPUT CHANGE -------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* -------------------- AUTO TRANSLATE -------------------- */
  useEffect(() => {
    if (!formData.nameEnglish) return;

    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      Translateapi(formData.nameEnglish)
        .then((res) => {
          const { regional, hindi } = extractTranslations(res.data);
          setFormData((prev) => ({
            ...prev,
            nameGujarati: regional,
            nameHindi: hindi,
          }));
        })
        .catch((err) => console.error("Translation error:", err));
    }, 500);

    setDebounceTimer(timer);
  }, [formData.nameEnglish]);

  /* -------------------- FORM VALIDATION -------------------- */
  const checkErrors = () => {
    const errorObject = formValidation(requiredFields, formData);
    if (Object.keys(errorObject).length > 0) {
      setErrors(errorObject);
      return false;
    }
    setErrors({});
    return true;
  };

  /* -------------------- BUILD FORMDATA -------------------- */
  const buildFormData = (data, userId) => {
    const fd = new FormData();

    fd.append("id", editData?.id || 0);
    fd.append("userId", userId);
    fd.append("nameEnglish", data.nameEnglish || "");
    fd.append("nameGujarati", data.nameGujarati || "");
    fd.append("nameHindi", data.nameHindi || "");
    fd.append("categorySlogan", data.categorySlogan || "");
    fd.append("price", data.price || "");
    fd.append("sequence", data.sequence || "");

    if (data.file) {
      // User selected a new image → send binary file
      fd.append("imagePath", data.file);
    } else if (editData?.imagePath) {
      // Edit mode, no new file → send existing URL string
      fd.append("imagePath", editData.imagePath);
    } else {
      fd.append("imagePath", null);
    }

    return fd;
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = () => {
    if (!checkErrors()) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire("Error", "User data not found", "error");
      return;
    }

    const payload = buildFormData(formData, userId);

    AddDecorCategory(payload)
      .then((res) => {
        if (res.data?.success === true) {
          Swal.fire(
            "Success",
            res.data.msg || "Decor category saved successfully",
            "success",
          );
          refreshData();
          setIsModalOpen(false);
          return;
        }
        Swal.fire("Error", res.data?.msg || "Something went wrong", "error");
      })
      .catch((error) => {
        const msg = error?.response?.data?.msg || "Something went wrong";
        Swal.fire("Error", msg, "error");
      });
  };

  /* -------------------- PREFILL EDIT -------------------- */
  useEffect(() => {
    if (editData) {
      setFormData({
        nameEnglish: editData.nameEnglish || "",
        nameGujarati: editData.nameGujarati || "",
        nameHindi: editData.nameHindi || "",
        categorySlogan: editData.categorySlogan || "",
        price: editData.price ?? "",
        sequence: editData.sequence ?? "",
        file: null,
      });
    } else {
      setFormData(initialFormState);
    }
  }, [isModalOpen]);

  /* -------------------- UI -------------------- */
  return (
    <CustomModal
      open={isModalOpen}
      width={800}
      title={editData ? "Edit Decor Category" : "Create New Decor Category"}
      onClose={() => setIsModalOpen(false)}
      footer={[
        <button
          key="cancel"
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
        >
          <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
        </button>,
        <button
          key="save"
          type="button"
          onClick={handleSubmit}
          className="btn-success text-white px-5 py-2 rounded-lg"
        >
          {editData ? (
            <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
          ) : (
            <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
          )}
        </button>,
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full width name row */}
        <div className="md:col-span-2">
          <MultiLangInputBox
            formData={formData}
            setFormData={setFormData}
            label={intl.formatMessage({
              id: "COMMON.NAME",
              defaultMessage: "Name",
            })}
            cols={3}
            keys={{
              english: "nameEnglish",
              regional: "nameGujarati",
              hindi: "nameHindi",
            }}
            error={errors.nameEnglish}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block mb-1">
            <FormattedMessage id="COMMON.PRICE" defaultMessage="Price" />
          </label>
          <input
            type="tel"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Sequence */}
        <div>
          <label className="block mb-1">
            <FormattedMessage id="COMMON.PRIORITY" defaultMessage="Sequence" />
          </label>
          <input
            type="tel"
            name="sequence"
            value={formData.sequence}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Image */}
        <div>
          <label className="block mb-1">
            <FormattedMessage id="COMMON.IMAGE" defaultMessage="Image" />
          </label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file && file.type.startsWith("image/")) {
                setFormData((prev) => ({ ...prev, file }));
              }
            }}
            className="border-2 border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
            onClick={() =>
              document.getElementById("decorCategoryImageInput").click()
            }
          >
            {formData.file ? (
              <p className="text-sm text-gray-700">{formData.file.name}</p>
            ) : editData?.imagePath ? (
              <img
                src={editData.imagePath}
                alt="Preview"
                className="mx-auto max-h-20 object-cover rounded"
              />
            ) : (
              <p className="text-sm text-gray-400">
                Drag & drop an image here, or click to select
              </p>
            )}
            <input
              id="decorCategoryImageInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, file: e.target.files[0] }))
              }
            />
          </div>
        </div>

        {/* Category Slogan — full width */}
        <div className="md:col-span-2">
          <label className="block mb-1">
            <FormattedMessage
              id="COMMON.SLOGAN"
              defaultMessage="Category Slogan"
            />
          </label>
          <textarea
            name="categorySlogan"
            value={formData.categorySlogan}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            rows={3}
          />
        </div>
      </div>
    </CustomModal>
  );
};

export default AddDecorCategoryModal;
