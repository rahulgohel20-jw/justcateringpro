import { useState, useEffect } from "react";
import { AddDecorItem, GetAllDecorCategory, Translateapi } from "@/services/apiServices";
import { CustomModal } from "../../../components/custom-modal/CustomModal";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputbox";
import { formValidation } from "../../../lib/utils";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { extractTranslations } from "@/utils/langConfig";

const AddDecorItemModal = ({
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
    instructionEnglish: "",
    instructionGujarati: "",
    instructionHindi: "",
    slogan: "",
    price: "",
    sequence: "",
    decoreMainCategoryId: "",
    url: "",
    remarks: "",
    files: [],
  };

  const requiredFields = ["nameEnglish", "decoreMainCategoryId"];

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  


  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const res = await GetAllDecorCategory(userId);
      const list =
        res?.data?.data?.["Decore Main Category Details"] ||
        res?.data?.data ||
        [];
      setCategories(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* -------------------- INPUT CHANGE -------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  useEffect(() => {
  const timer = setTimeout(() => {
    handleTranslation(
      formData.nameEnglish,
      "nameGujarati",
      "nameHindi"
    );
  }, 500);

  return () => clearTimeout(timer);
}, [formData.nameEnglish]);

useEffect(() => {
  const timer = setTimeout(() => {
    handleTranslation(
      formData.instructionEnglish,
      "instructionGujarati",
      "instructionHindi"
    );
  }, 500);

  return () => clearTimeout(timer);
}, [formData.instructionEnglish]);

  const handleTranslation = async (
  text,
  gujaratiKey,
  hindiKey
) => {
  if (!text?.trim()) return;

  try {
    const res = await Translateapi(text);

    const { regional, hindi } = extractTranslations(res.data);

    setFormData((prev) => ({
      ...prev,
      [gujaratiKey]: regional || prev[gujaratiKey],
      [hindiKey]: hindi || prev[hindiKey],
    }));
  } catch (err) {
    console.error("Translation error:", err);
  }
};

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
    fd.append("instructionEnglish", data.instructionEnglish || "");
    fd.append("instructionGujarati", data.instructionGujarati || "");
    fd.append("instructionHindi", data.instructionHindi || "");
    fd.append("slogan", data.slogan || "");
    fd.append("price", data.price || "");
    fd.append("sequence", data.sequence || "");
    fd.append("decoreMainCategoryId", data.decoreMainCategoryId || "");
    fd.append("url", data.url || "");
    fd.append("remarks", data.remarks || "");
 if (data.files && data.files.length > 0) {
    data.files.forEach((file, idx) =>
      fd.append(`imagesPath[${idx}].imagePath`, file)
    );
  } else if (editData?.imagesPath) {
    // ✅ Edit mode with existing images → re-send existing URLs
    const existing = Array.isArray(editData.imagesPath)
      ? editData.imagesPath
      : [editData.imagesPath];
    existing.forEach((url, idx) =>
      fd.append(`imagesPath[${idx}].imagePath`, url)
    );
  }


    return fd;
  };

  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = () => {
    if (!checkErrors()) return;

    if (!userId) {
      Swal.fire("Error", "User data not found", "error");
      return;
    }

    setSaving(true);
    const payload = buildFormData(formData, userId);

    AddDecorItem(payload)
      .then((res) => {
        if (res.data?.success === true) {
          Swal.fire(
            "Success",
            res.data.msg || "Decor item saved successfully",
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
      })
      .finally(() => {
        setSaving(false);
      });
  };

  /* -------------------- PREFILL EDIT -------------------- */
  useEffect(() => {
    if (editData) {
      setFormData({
        nameEnglish: editData.nameEnglish || "",
        nameGujarati: editData.nameGujarati || "",
        nameHindi: editData.nameHindi || "",
        instructionEnglish: editData.instructionEnglish || "",
        instructionGujarati: editData.instructionGujarati || "",
        instructionHindi: editData.instructionHindi || "",
        slogan: editData.slogan || "",
        price: editData.price ?? "",
        sequence: editData.sequence ?? "",
        decoreMainCategoryId: editData.decoreMainCategoryId ?? "",
        url: editData.url || "",
        remarks: editData.remarks || "",
        files: [],
      });
    } else {
      setFormData(initialFormState);
    }
  }, [isModalOpen]);

  /* -------------------- UI -------------------- */
  return (
    <CustomModal
      open={isModalOpen}
      width={1000}
      title={editData ? "Edit Decor Item" : "Create New Decor Item"}
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
          disabled={saving}
          className="btn-success text-white px-5 py-2 rounded-lg disabled:opacity-50"
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
        {/* Name — full width, 3 languages */}
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

        {/* Instruction — full width, 3 languages */}
        <div className="md:col-span-2" key={`instr-${editData?.id || "new"}-${isModalOpen}`}>
  <MultiLangInputBox
    formData={formData}
    setFormData={setFormData}
    label={intl.formatMessage({
      id: "DECOR_ITEM.INSTRUCTION",
      defaultMessage: "Instruction",
    })}
    cols={3}
    type="textarea"
    keys={{
      english: "instructionEnglish",
      regional: "instructionGujarati",
      hindi: "instructionHindi",
    }}
  />
</div>

        {/* Category Dropdown */}
        <div>
          <label className="block mb-1">
            <FormattedMessage
              id="DECOR_ITEM.CATEGORY"
              defaultMessage="Decor Main Category *"
            />
          </label>
          <select
            name="decoreMainCategoryId"
            value={formData.decoreMainCategoryId}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            disabled={categoriesLoading}
          >
            <option value="">
              {categoriesLoading
                ? "Loading..."
                : "-- Select Category --"}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nameEnglish}
              </option>
            ))}
          </select>
          {errors.decoreMainCategoryId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.decoreMainCategoryId}
            </p>
          )}
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

        {/* Slogan */}
        <div>
          <label className="block mb-1">
            <FormattedMessage id="COMMON.SLOGAN" defaultMessage="Slogan" />
          </label>
          <input
            type="text"
            name="slogan"
            value={formData.slogan}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* Sequence */}
        <div>
          <label className="block mb-1">
            <FormattedMessage
              id="COMMON.PRIORITY"
              defaultMessage="Sequence"
            />
          </label>
          <input
            type="tel"
            name="sequence"
            value={formData.sequence}
            onChange={handleChange}
            className="border p-2 w-full rounded"
          />
        </div>

        {/* URL */}
        <div className="md:col-span-2">
          <label className="block mb-1">
            <FormattedMessage id="COMMON.URL" defaultMessage="URL" />
          </label>
          <input
            type="text"
            name="url"
            value={formData.url}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            placeholder="https://..."
          />
        </div>

        {/* Remarks */}
        <div className="md:col-span-2">
          <label className="block mb-1">
            <FormattedMessage id="COMMON.REMARKS" defaultMessage="Remarks" />
          </label>
          <textarea
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            className="border p-2 w-full rounded"
            rows={2}
          />
        </div>

        {/* Image */}
        <div className="md:col-span-2">
  <label className="block mb-1">
    <FormattedMessage id="COMMON.IMAGE" defaultMessage="Image" />
  </label>
  <div
    onDragOver={(e) => e.preventDefault()}
    onDrop={(e) => {
      e.preventDefault();
      const dropped = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (dropped.length > 0) {
        setFormData((prev) => ({ ...prev, files: [...prev.files, ...dropped] }));
      }
    }}
    className="border-2 border-dashed border-gray-300 rounded p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
    onClick={() => document.getElementById("decorItemImageInput").click()}
  >
    {formData.files.length > 0 ? (
      <div className="flex flex-wrap gap-3 justify-center">
        {formData.files.map((file, idx) => (
          <div key={idx} className="relative group">
            <img
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="h-20 w-20 object-cover rounded border"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFormData((prev) => ({
                  ...prev,
                  files: prev.files.filter((_, i) => i !== idx),
                }));
              }}
              className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
        {/* Existing edit previews if no new files selected yet */}
        <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-2xl">
          +
        </div>
      </div>
    ) : editData?.imagesPath ? (
      <div className="flex flex-wrap gap-3 justify-center">
        {(Array.isArray(editData.imagesPath)
          ? editData.imagesPath
          : [editData.imagesPath]
        ).map((url, idx) => (
          <img
            key={idx}
            src={url}
            alt={`Preview ${idx + 1}`}
            className="h-20 w-20 object-cover rounded border"
          />
        ))}
        <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400 text-2xl">
          +
        </div>
      </div>
    ) : (
      <p className="text-sm text-gray-400">
        Drag & drop images here, or click to select multiple
      </p>
    )}
    <input
      id="decorItemImageInput"
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={(e) => {
        const selected = Array.from(e.target.files);
        setFormData((prev) => ({ ...prev, files: [...prev.files, ...selected] }));
        e.target.value = "";
      }}
    />
  </div>
</div>
      </div>
    </CustomModal>
  );
};

export default AddDecorItemModal;
