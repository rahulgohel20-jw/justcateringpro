import { CustomModal } from "@/components/custom-modal/CustomModal";
import { useState, useEffect, useRef } from "react";
import {   Form, Input, InputNumber, Select, Upload, Button, message, Modal, Skeleton,
} from "antd";
import {
  GetAllCategoryformenu,
  Getmenusubcategory,
  AddMenuItems,
  Translateapi,
  Aislogsfirmenuitemandcategory,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import {
  InboxOutlined, ReloadOutlined, DeleteOutlined, PlusOutlined, SyncOutlined,
  ThunderboltOutlined, CheckCircleFilled,
} from "@ant-design/icons";
import AddMenuCategory from "@/partials/modals/add-menu-category/AddMenuCategory";
import AddMenuSubCategory from "@/partials/modals/add-menu-sub-category/AddMenuSubCategory";
import { Plus } from "lucide-react";
import { extractTranslations } from "@/utils/langConfig";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputbox";
import { useModuleAccess } from "@/hooks/useModuleAccess";

const { Dragger } = Upload;

const initialFormData = {
  nameEnglish: "",
  nameGujarati: "",
  nameHindi: "",
  slogan: "",
  price: "",
  priority: "",
  menuCategory: "",
  menuSubCategory: "",
  remarks: "",
  image: null,
  url: "",
};

const AddMenuItem = ({ isModalOpen, setIsModalOpen, refreshData }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSubCategoryModalOpen, setIsSubCategoryModalOpen] = useState(false);
const { hasModuleAccess } = useModuleAccess();
const canAccessGenerateWithAiSlogan = hasModuleAccess("Generate with Ai Solgan");

const [isSloganModalOpen, setIsSloganModalOpen] = useState(false);
const [sloganOptions, setSloganOptions] = useState([]);
const [sloganLoading, setSloganLoading] = useState(false);
  const debounceRef = useRef(null);
  const userId = localStorage.getItem("userId");

  // ── Translation ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!formData.nameEnglish?.trim()) {
      setFormData((prev) => ({ ...prev, nameGujarati: "", nameHindi: "" }));
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await Translateapi(formData.nameEnglish);
        const { regional, hindi } = extractTranslations(res?.data?.data || res?.data || {});
        setFormData((prev) => ({ ...prev, nameGujarati: regional, nameHindi: hindi }));
      } catch (err) {
        console.error("Translation error:", err);
      }
    }, 500);

    return () => clearTimeout(debounceRef.current);
  }, [formData.nameEnglish]);
useEffect(() => {
  if (isModalOpen) {
    fetchCategories();
    setFormData(initialFormData);
    setErrors({});
    setSubCategoryOptions([]);
    setIsSloganModalOpen(false);
    setSloganOptions([]);
  }
}, [isModalOpen]);
  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      const res = await GetAllCategoryformenu(userId);
      const options = res?.data?.data?.["Menu Category Details"]?.map((item) => ({
        label: item.nameEnglish,
        value: item.id,
      })) || [];
      setCategoryOptions(options);
    } catch {}
  };

  const fetchSubCategories = async (categoryId) => {
    try {
      setLoadingSubCategories(true);
      const res = await Getmenusubcategory(categoryId, userId);
      const options = res?.data?.data?.["Menu Sub Category Details"]?.map((item) => ({
        label: item.nameEnglish,
        value: item.id,
      })) || [];
      setSubCategoryOptions(options);
    } catch {
      setSubCategoryOptions([]);
    } finally {
      setLoadingSubCategories(false);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      fetchCategories();
      setFormData(initialFormData);
      setErrors({});
      setSubCategoryOptions([]);
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!isCategoryModalOpen && isModalOpen) fetchCategories();
  }, [isCategoryModalOpen]);

  useEffect(() => {
    if (!isSubCategoryModalOpen && isModalOpen && formData.menuCategory) {
      fetchSubCategories(formData.menuCategory);
    }
  }, [isSubCategoryModalOpen]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({ ...prev, menuCategory: value, menuSubCategory: "" }));
    setSubCategoryOptions([]);
    if (value) fetchSubCategories(value);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.nameEnglish?.trim()) newErrors.nameEnglish = "Please enter English name";
    if (!formData.menuCategory) newErrors.menuCategory = "Please select a category";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
const handleGenerateSlogan = async () => {
  const itemName = (formData.nameEnglish || "").trim();
  if (!itemName) {
    message.warning("Please enter the menu item name first");
    return;
  }

  try {
    setSloganLoading(true);
    setIsSloganModalOpen(true);
    setSloganOptions([]);

    const res = await Aislogsfirmenuitemandcategory({
      name: itemName,
      type: "ITEM",
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
  setFormData((prev) => ({ ...prev, slogan }));
  setIsSloganModalOpen(false);
  message.success("Slogan selected");
};
  const handleSave = async () => {
    if (!validate()) return;

    try {
      const data = new FormData();
      data.append("userId", Number(userId));
      data.append("menuCategoryId", formData.menuCategory);
      data.append("menuSubCategoryId", formData.menuSubCategory || "");
      data.append("nameEnglish", formData.nameEnglish || "");
      data.append("nameGujarati", formData.nameGujarati || "");
      data.append("nameHindi", formData.nameHindi || "");
      data.append("slogan", formData.slogan || "");
      data.append("price", formData.price || 0);
      data.append("sequence", Number(formData.priority) || 0);
      if (formData.image) data.append("file", formData.image);

      const res = await AddMenuItems(data);

      Swal.fire({
        title: res?.data?.success ? "Success!" : "Failed",
        text: res?.data?.msg,
        icon: res?.data?.success ? "success" : "error",
      });

      if (res?.data?.success) {
        refreshData();
        setIsModalOpen(false);
        setFormData(initialFormData);
      }
    } catch {}
  };

  return (
    <CustomModal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={<span className="text-black text-base font-medium">Add Menu Item</span>}
      width={1000}
      className="add-menu-modal"
      footer={
        <div className="flex justify-end gap-2 py-2">
          <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      }
    >
      <div className="space-y-5">

        {/* ── Name fields ── */}
        <MultiLangInputBox
          formData={formData}
          setFormData={setFormData}
          label="Name"
          cols={3}
          keys={{ english: "nameEnglish", regional: "nameGujarati", hindi: "nameHindi" }}
          error={errors.nameEnglish}
        />

      {/* ── Slogan ── */}
<div className="flex flex-col gap-1">
  <div className="flex items-center justify-between">
    <label className="text-sm font-normal text-black">Slogan</label>
    {canAccessGenerateWithAiSlogan && (
      <button
        type="button"
        onClick={handleGenerateSlogan}
        disabled={sloganLoading}
        className="inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium text-white
          bg-gradient-to-r from-violet-600 to-indigo-500 shadow-sm
          hover:shadow-md hover:from-violet-700 hover:to-indigo-600 transition disabled:opacity-60"
      >
        <ThunderboltOutlined />
        {sloganLoading ? "Generating..." : "Generate with AI"}
      </button>
    )}
  </div>
  <div className="input">
    <input
      name="slogan"
      placeholder="Write a slogan or generate one with AI"
      value={formData.slogan}
      onChange={handleChange}
      className="h-full w-full"
    />
  </div>
</div>

        {/* ── Price & Priority ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-normal text-black">Price</label>
            <div className="input">
              <input
                type="tel"
                name="price"
                placeholder="Enter Price"
                value={formData.price}
                onChange={handleChange}
                className="h-full w-full"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-normal text-black">Priority</label>
            <div className="input">
              <input
                type="tel"
                name="priority"
                placeholder="Enter Priority"
                value={formData.priority}
                onChange={handleChange}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>

        {/* ── Category & Sub Category ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-normal text-black">
              Menu Category <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Select
                placeholder="Select Category"
                options={categoryOptions}
                onChange={handleCategoryChange}
                value={formData.menuCategory || undefined}
                className="w-full"
                showSearch
                optionFilterProp="label"
              />
              <button
                type="button"
                className="bg-blue-900 px-2 py-1 rounded-full text-white hover:bg-blue-800"
                onClick={() => setIsCategoryModalOpen(true)}
              >
                <Plus size={16} />
              </button>
            </div>
            {errors.menuCategory && (
              <span className="text-red-500 text-sm">{errors.menuCategory}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-normal text-black">Menu Sub Category</label>
            <div className="flex gap-2">
              <Select
                placeholder="Select Sub Category"
                options={subCategoryOptions}
                loading={loadingSubCategories}
                disabled={!formData.menuCategory}
                onChange={(value) => setFormData((prev) => ({ ...prev, menuSubCategory: value }))}
                value={formData.menuSubCategory || undefined}
                className="w-full"
                showSearch
                optionFilterProp="label"
              />
              <button
                type="button"
                className="bg-blue-900 px-2 py-1 rounded-full text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setIsSubCategoryModalOpen(true)}
                disabled={!formData.menuCategory}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Remarks ── */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-normal text-black">Remarks</label>
          <textarea
            name="remarks"
            placeholder="Enter Remarks"
            rows={3}
            value={formData.remarks}
            onChange={handleChange}
            className="border border-gray-300 rounded-lg p-2 w-full resize-none"
          />
        </div>

        {/* ── Image ── */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-normal text-black">Image</label>
          <Dragger
            beforeUpload={(file) => {
              setFormData((prev) => ({ ...prev, image: file }));
              return false;
            }}
            maxCount={1}
            accept="image/*"
            listType="picture"
            onRemove={() => setFormData((prev) => ({ ...prev, image: null }))}
          >
            <p className="ant-upload-drag-icon"><InboxOutlined /></p>
            <p className="ant-upload-text">Click or drag image to upload</p>
            <p className="ant-upload-hint">Support for JPG, PNG, GIF (Max 5MB)</p>
          </Dragger>
        </div>

        {/* ── URL ── */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-normal text-black">URL</label>
          <div className="input">
            <input
              name="url"
              placeholder="Enter URL"
              value={formData.url}
              onChange={handleChange}
              className="h-full w-full"
            />
          </div>
        </div>
      </div>

      <AddMenuCategory
        isModalOpen={isCategoryModalOpen}
        setIsModalOpen={setIsCategoryModalOpen}
        refreshData={fetchCategories}
      />
      <AddMenuSubCategory
        isModalOpen={isSubCategoryModalOpen}
        setIsModalOpen={setIsSubCategoryModalOpen}
        refreshData={() => {
          if (formData.menuCategory) fetchSubCategories(formData.menuCategory);
        }}
      />
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
          const selected = formData.slogan === s;
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

export default AddMenuItem;