import { useState, useEffect, useRef } from "react";
import {
  AddCategoryImages,
} from "@/services/apiServices";
import { CustomModal } from "../../../components/custom-modal/CustomModal";
import { formValidation } from "../../../lib/utils";
import { FormattedMessage, useIntl } from "react-intl";
import Swal from "sweetalert2";

const AddCategoryImage = ({
  isModalOpen,
  setIsModalOpen,
  refreshData,
  editData,
}) => {
  if (!isModalOpen) return null;

  const intl = useIntl();
  const fileInputRef = useRef(null);

  const initialFormState = {
    categoryName: "",
    isCatImg: false,
    file: null,
    previewUrl: "",
  };
  const userId = localStorage.getItem("userId");
  const requiredFields = ["categoryName"];

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        categoryName: editData.categoryName || "",
        isCatImg: editData.isCatImg ?? false,
        file: null,
        previewUrl: editData.imagePath || "",
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [isModalOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const applyFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, file, previewUrl: url }));
    if (errors.file) setErrors((prev) => ({ ...prev, file: "" }));
  };

  const handleFileChange = (e) => applyFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    applyFile(e.dataTransfer.files[0]);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, file: null, previewUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const checkErrors = () => {
    const errorObject = formValidation(requiredFields, formData);

    if (!formData.isCatImg && !formData.file && !formData.previewUrl) {
      errorObject.file = intl.formatMessage({
        id: "VALIDATION.IMAGE_REQUIRED",
        defaultMessage: "Please upload an image",
      });
    }

    if (Object.keys(errorObject).length > 0) {
      setErrors(errorObject);
      return false;
    }
    setErrors({});
    return true;
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("categoryName", formData.categoryName);
    fd.append("isCatImg", formData.isCatImg ? "1" : "0");
    fd.append("id", editData?.id ?? -1);
    fd.append("userId", userId ?? "");
    if (formData.file) fd.append("image", formData.file);
    return fd;
  };

  const handleSubmit = () => {
    if (!checkErrors()) return;

    const payload = buildFormData();
    setLoading(true);

    AddCategoryImages(payload)
      .then((res) => {
        if (res?.data?.success === true) {
          Swal.fire({
            title: intl.formatMessage({
              id: "COMMON.SUCCESS",
              defaultMessage: "Success",
            }),
            text:
              res.data.msg ||
              intl.formatMessage({
                id: "COMMON.SAVED_SUCCESSFULLY",
                defaultMessage: "Saved successfully",
              }),
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });

          refreshData();
          setIsModalOpen(false);
        } else {
          Swal.fire(
            intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error" }),
            res?.data?.msg ||
              intl.formatMessage({
                id: "COMMON.SOMETHING_WENT_WRONG",
                defaultMessage: "Something went wrong",
              }),
            "error"
          );
        }
      })
      .catch((error) => {
        console.error("API ERROR:", error);

        Swal.fire(
          intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error" }),
          error?.response?.data?.msg ||
            intl.formatMessage({
              id: "COMMON.SOMETHING_WENT_WRONG",
              defaultMessage: "Something went wrong",
            }),
          "error"
        );
      })
      .finally(() => setLoading(false));
  };

  return (
    <CustomModal
      open={isModalOpen}
      width={800}
      title={
        editData
          ? intl.formatMessage({
              id: "CATEGORY_IMAGE.EDIT_TITLE",
              defaultMessage: "Edit Category Image",
            })
          : intl.formatMessage({
              id: "CATEGORY_IMAGE.ADD_TITLE",
              defaultMessage: "Create Category Image",
            })
      }
      onClose={() => setIsModalOpen(false)}
      footer={[
        <button
          key="cancel"
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
          disabled={loading}
        >
          <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
        </button>,
        <button
          key="save"
          type="button"
          onClick={handleSubmit}
          className="btn-success text-white px-5 py-2 rounded-lg"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              <FormattedMessage id="COMMON.SAVING" defaultMessage="Saving..." />
            </span>
          ) : editData ? (
            <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
          ) : (
            <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
          )}
        </button>,
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ── Category Name ── */}
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium">
            <FormattedMessage
              id="CATEGORY_IMAGE.CATEGORY_NAME"
              defaultMessage="Category Name"
            />
            <span className="text-danger ms-1">*</span>
          </label>
          <input
            type="text"
            name="categoryName"
            value={formData.categoryName}
            onChange={handleChange}
            placeholder={intl.formatMessage({
              id: "CATEGORY_IMAGE.ENTER_CATEGORY",
              defaultMessage: "Enter Category Name",
            })}
            className={`border p-2 w-full rounded ${
              errors.categoryName ? "border-danger" : "border-gray-300"
            }`}
          />
          {errors.categoryName && (
            <p className="text-danger text-xs mt-1">{errors.categoryName}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="block font-medium">
            <FormattedMessage
              id="CATEGORY_IMAGE.IS_CAT_IMG"
              defaultMessage="Select Image Type"
            />
          </label>

          <div className="flex gap-6 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="imageType"
                checked={!formData.isCatImg}
                onChange={() =>
                  setFormData((prev) => ({ ...prev, isCatImg: false }))
                }
              />
              <span className="text-primary font-semibold">
                <FormattedMessage
                  id="CATEGORY_IMAGE.BACKGROUND_IMAGE"
                  defaultMessage="Background Image"
                />
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="imageType"
                checked={formData.isCatImg}
                onChange={() =>
                  setFormData((prev) => ({ ...prev, isCatImg: true }))
                }
              />
              <span className="text-primary font-semibold">
                <FormattedMessage
                  id="CATEGORY_IMAGE.CATEGORY_IMAGE"
                  defaultMessage="Category Image"
                />
              </span>
            </label>
          </div>
        </div>

        {/* ── Image Upload ── */}
        <div className="md:col-span-2">
          <label className="block mb-1 font-medium">
            <FormattedMessage id="COMMON.IMAGE" defaultMessage="Image" />
            <span className="text-danger ms-1">*</span>
          </label>

          {formData.previewUrl && (
            <div className="relative inline-block mb-3">
              <img
                src={formData.previewUrl}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-danger text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:opacity-80 transition-opacity"
                title={intl.formatMessage({
                  id: "CATEGORY_IMAGE.REMOVE_IMAGE",
                  defaultMessage: "Remove image",
                })}
              >
                ×
              </button>
            </div>
          )}

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-primary bg-primary-light"
                : errors.file
                  ? "border-danger bg-red-50"
                  : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100"
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <i className="ki-filled ki-picture text-3xl text-gray-400" />
              {formData.file ? (
                <p className="text-sm text-gray-700 font-medium">
                  {formData.file.name}
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage
                      id="COMMON.DRAG_DROP"
                      defaultMessage="Drag & drop an image here, or"
                    />{" "}
                    <span className="text-primary font-medium">
                      <FormattedMessage id="COMMON.BROWSE" defaultMessage="browse" />
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    <FormattedMessage
                      id="CATEGORY_IMAGE.FILE_SIZE_HINT"
                      defaultMessage="PNG, JPG, WEBP — max 5 MB"
                    />
                  </p>
                </>
              )}
            </div>
            <input
              ref={fileInputRef}
              id="categoryBgImageInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {errors.file && (
            <p className="text-danger text-xs mt-1">{errors.file}</p>
          )}
        </div>
      </div>
    </CustomModal>
  );
};

export default AddCategoryImage;