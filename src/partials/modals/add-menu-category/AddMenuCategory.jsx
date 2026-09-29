import { useState, useEffect } from "react";
import {
  editCategory,
  AddCategory,
  Translateapi,
  uploadFile,
  Aislogsfirmenuitemandcategory,
} from "@/services/apiServices";
import { errorMsgPopup, successMsgPopup } from "../../../underConstruction";
import { CustomModal } from "../../../components/custom-modal/CustomModal";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputbox";
import { formValidation } from "../../../lib/utils";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";
import { Modal, Button, Skeleton, message } from "antd";
import { ThunderboltOutlined, CheckCircleFilled, ReloadOutlined } from "@ant-design/icons";
import { useModuleAccess } from "@/hooks/useModuleAccess";

const AddMenuCategory = ({
  isModalOpen,
  setIsModalOpen,
  refreshData,
  editData,
}) => {
  if (!isModalOpen) return null;
  const langConfig = getLangConfig();

  const intl = useIntl();
const initialFormState = {
  nameEnglish: "",
  nameGujarati: "",
  nameHindi: "",
  reportNameEnglish: "",
  reportNameGujarati: "",
  reportNameHindi: "",
  menuSlogan: "",
  price: "",
  sequence: "",
  file: null,
};
  const requiredFields = ["nameEnglish"];
const { hasModuleAccess } = useModuleAccess();
const canAccessgenratewithaislogan = hasModuleAccess("Generate with Ai Solgan");
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [debounceTimer, setDebounceTimer] = useState(null);
const [isSloganModalOpen, setIsSloganModalOpen] = useState(false);
const [sloganOptions, setSloganOptions] = useState([]);
const [sloganLoading, setSloganLoading] = useState(false);
const [reportDebounceTimer, setReportDebounceTimer] = useState(null);
  /* -------------------- INPUT CHANGE -------------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /* -------------------- AUTO TRANSLATE -------------------- */

/* -------------------- AUTO TRANSLATE: NAME -------------------- */
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

/* -------------------- AUTO TRANSLATE: REPORT NAME -------------------- */
useEffect(() => {
  if (!formData.reportNameEnglish) return;

  if (reportDebounceTimer) clearTimeout(reportDebounceTimer);

  const timer = setTimeout(() => {
    Translateapi(formData.reportNameEnglish)
      .then((res) => {
        const { regional, hindi } = extractTranslations(res.data);
        setFormData((prev) => ({
          ...prev,
          reportNameGujarati: regional,
          reportNameHindi: hindi,
        }));
      })
      .catch((err) => console.error("Translation error:", err));
  }, 500);

  setReportDebounceTimer(timer);
}, [formData.reportNameEnglish]);

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

    Object.keys(data).forEach((key) => {
      if (key === "file") {
        if (data.file) fd.append("file", data.file);
      } else {
        fd.append(key, data[key] ?? "");
      }
    });

    fd.append("userId", userId);
    return fd;
  };
const handleGenerateSlogan = async () => {
  const categoryName = (formData.nameEnglish || "").trim();
  if (!categoryName) {
    message.warning("Please enter the category name first");
    return;
  }

  try {
    setSloganLoading(true);
    setIsSloganModalOpen(true);
    setSloganOptions([]);

    const res = await Aislogsfirmenuitemandcategory({
      name: categoryName,
      type: "CATEGORY",
    });

    if (!res?.data?.success) {
      throw new Error(res?.data?.msg || "Failed to generate slogans");
    }
    setSloganOptions(res?.data?.data?.slogans || []);
  } catch (err) {
    console.error("AI slogan error:", err);
    message.error(err?.response?.data?.msg || err.message || "Failed to generate slogans");
    setIsSloganModalOpen(false);
  } finally {
    setSloganLoading(false);
  }
};

const handleSelectSlogan = (slogan) => {
  setFormData((prev) => ({ ...prev, menuSlogan: slogan }));
  setIsSloganModalOpen(false);
  message.success("Slogan selected");
};
  /* -------------------- SUBMIT -------------------- */
  const handleSubmit = () => {
    if (!checkErrors()) return;

    const userId = localStorage.getItem("userId");
    if (!userId) {
      Swal.fire("Error", "User data not found", "error");
      return;
    }

    const payload = buildFormData(
      {
        ...formData,
        slogan: formData.menuSlogan,
      },
      userId,
    );

    /* -------- EDIT -------- */
    if (editData) {
      editCategory(editData.id, payload)
        .then((res) => {
          if (res.data?.success === true) {
            Swal.fire("Success", res.data.msg, "success");
            refreshData();
            setIsModalOpen(false);
          }
        })
        .catch((error) => {
          const msg = error?.response?.data?.msg || "Something went wrong";
          Swal.fire("Error", msg, "error");
        });
    } else {
      /* -------- ADD -------- */
      AddCategory(payload)
        .then((res) => {
          if (res.data?.success === true) {
            Swal.fire("Success", res.data.msg, "success");
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
    }
  };

  /* -------------------- PREFILL EDIT -------------------- */
  useEffect(() => {
    if (editData) {
      setFormData({
        ...editData,
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
      width={1000}
      title={editData ? "Edit Menu Category" : "Create New Menu Category"}
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
{/* Full width name row */}
<div className="md:col-span-2">
  <MultiLangInputBox
    formData={formData}
    setFormData={setFormData}
    label={intl.formatMessage({ id: "COMMON.NAME", defaultMessage: "Name" })}
    cols={3}
    keys={{
      english: "nameEnglish",
      regional: "nameGujarati",
      hindi: "nameHindi",
    }}
    error={errors.nameEnglish}
  />
</div>

{/* Full width sub name row */}
{/* Full width report name row */}
<div className="md:col-span-2">
  <MultiLangInputBox
    formData={formData}
    setFormData={setFormData}
    label={intl.formatMessage({ id: "COMMON.REPORT_NAME", defaultMessage: "Report Name" })}
    cols={3}
    keys={{
      english: "reportNameEnglish",
      regional: "reportNameGujarati",
      hindi: "reportNameHindi",
    }}
    error={errors.reportNameEnglish}
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
      onClick={() => document.getElementById("categoryImageInput").click()}
    >
      {formData.file ? (
        <p className="text-sm text-gray-700">{formData.file.name}</p>
      ) : (
        <p className="text-sm text-gray-400">
          Drag & drop an image here, or click to select
        </p>
      )}
      <input
        id="categoryImageInput"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) =>
          setFormData((prev) => ({ ...prev, file: e.target.files[0] }))
        }
      />
    </div>
  </div>

{/* Slogan — full width */}
<div className="md:col-span-2">
  <div className="mb-1 flex items-center justify-between">
    <label className="block">
      <FormattedMessage id="COMMON.SLOGAN" defaultMessage="Slogan" />
    </label>
    {canAccessgenratewithaislogan && (
    <button
      type="button"
      onClick={handleGenerateSlogan}
      disabled={sloganLoading}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-white
        bg-gradient-to-r from-violet-600 to-indigo-500 shadow-sm
        hover:shadow-md hover:from-violet-700 hover:to-indigo-600 transition disabled:opacity-60"
    >
      <ThunderboltOutlined />
      {sloganLoading ? "Generating..." : "Generate with AI"}
    </button>
    )}
  </div>
  <textarea
    name="menuSlogan"
    value={formData.menuSlogan}
    onChange={handleChange}
    placeholder="Write a slogan or generate one with AI"
    className="border p-2 w-full rounded"
  />
</div>

</div>
<Modal
  open={isSloganModalOpen}
  onCancel={() => setIsSloganModalOpen(false)}
  width={680}
  centered
  zIndex={2000}
  title={
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center text-white">
        <ThunderboltOutlined />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-base font-semibold text-gray-900">AI Slogan Suggestions</span>
        <span className="text-xs font-normal text-gray-500">
          For "{formData.nameEnglish}" · click one to use it
        </span>
      </div>
    </div>
  }
  footer={
    <div className="flex items-center justify-between">
      <Button icon={<ReloadOutlined />} onClick={handleGenerateSlogan} loading={sloganLoading}>
        Regenerate
      </Button>
      <Button onClick={() => setIsSloganModalOpen(false)}>Close</Button>
    </div>
  }
>
  <div className="flex flex-col gap-3 max-h-[60vh] overflow-y-auto pr-1 mt-4">
    {sloganLoading
      ? [1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-xl border border-gray-100 p-4">
            <Skeleton active title={false} paragraph={{ rows: 2 }} />
          </div>
        ))
      : sloganOptions.map((s, idx) => {
          const selected = formData.menuSlogan === s;
          return (
            <div
              key={idx}
              onClick={() => handleSelectSlogan(s)}
              className={`group cursor-pointer flex items-start gap-3 rounded-xl border p-4 transition-all
                hover:shadow-md hover:-translate-y-0.5 ${
                  selected
                    ? "border-violet-500 bg-violet-50 shadow-sm"
                    : "border-gray-200 bg-white hover:border-violet-300"
                }`}
            >
              <span
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold ${
                  selected
                    ? "bg-violet-600 text-white"
                    : "bg-gray-100 text-gray-600 group-hover:bg-violet-100 group-hover:text-violet-700"
                }`}
              >
                {idx + 1}
              </span>
              <p className="flex-1 text-sm leading-relaxed text-gray-700">{s}</p>
              {selected && <CheckCircleFilled className="text-violet-600 text-lg mt-0.5" />}
            </div>
          );
        })}
  </div>
</Modal>
    </CustomModal>
  );
};

export default AddMenuCategory;
