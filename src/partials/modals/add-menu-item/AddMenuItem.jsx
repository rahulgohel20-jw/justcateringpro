import { CustomModal } from "@/components/custom-modal/CustomModal";
import { useState, useEffect, useRef } from "react";
import { InboxOutlined } from "@ant-design/icons";
import { Select, Upload } from "antd";
import {
  GetAllCategoryformenu,
  Getmenusubcategory,
  AddMenuItems,
  Translateapi,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import AddMenuCategory from "@/partials/modals/add-menu-category/AddMenuCategory";
import AddMenuSubCategory from "@/partials/modals/add-menu-sub-category/AddMenuSubCategory";
import { Plus } from "lucide-react";
import { extractTranslations } from "@/utils/langConfig";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputbox";

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
          <label className="text-sm font-normal text-black">Slogan</label>
          <div className="input">
            <input
              name="slogan"
              placeholder="Enter Slogan"
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
    </CustomModal>
  );
};

export default AddMenuItem;