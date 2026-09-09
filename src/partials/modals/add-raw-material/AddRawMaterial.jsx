import { CustomModal } from "@/components/custom-modal/CustomModal";
import { useEffect, useState, useRef } from "react";
import { TableComponent } from "@/components/table/TableComponent";
import { columns, defaultData } from "./constant";
import useStyle from "./style";
import AddSupplier from "../add-supplier/AddSupplier";
import AddVendor from "../../../partials/modals/add-vendor/AddVendor";
import Select from "react-select";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputBox";
import AddRawMaterialCategory from "@/partials/modals/raw-material-category/AddRawMaterial";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";
import {
  GetRawMaterialcategory,
  GetUnitData,
  DeleteSuplier,
  Addrawmaterial,
  EditRawMaterial,
  Translateapi,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import DatePicker from "react-datepicker";

const validationSchema = Yup.object().shape({
  dailyConsumption: Yup.string().nullable(),
  nameEnglish: Yup.string().required(" Name is required"),
  rawCategoryId: Yup.string().required("Raw Material Category is required"),
  unitid: Yup.string().required("Unit is required"),
  supplierRate: Yup.number()
    .typeError("Supplier Rate must be a number")
    .positive("Supplier Rate must be positive")
    .nullable(),
  priority: Yup.number()
    .typeError("Priority must be a number")
    .integer("Priority must be an integer")
    .nullable(),
  weight: Yup.number()
    .typeError("Weight must be a number")
    .positive("Weight must be positive")
    .nullable(),
  openingBalance: Yup.number()
    .typeError("Opening Balance must be number")
    .min(0, "Must be >= 0")
    .nullable(),
  closingQty: Yup.number()
    .typeError("Closing Qty must be number")
    .min(0, "Must be >= 0")
    .nullable(),
  expiryDate: Yup.date().nullable(),
  // ← add these four
  cgst: Yup.number()
    .typeError("CGST must be a number")
    .min(0, "Must be >= 0")
    .max(100, "Must be <= 100")
    .nullable(),
  sgst: Yup.number()
    .typeError("SGST must be a number")
    .min(0, "Must be >= 0")
    .max(100, "Must be <= 100")
    .nullable(),
  igst: Yup.number()
    .typeError("IGST must be a number")
    .min(0, "Must be >= 0")
    .max(100, "Must be <= 100")
    .nullable(),
  cess: Yup.number()
    .typeError("CESS must be a number")
    .min(0, "Must be >= 0")
    .max(100, "Must be <= 100")
    .nullable(),
});

const AddRawMaterial = ({ isOpen, onClose, refreshData, rawmaterial }) => {
  const classes = useStyle();
  const [searchQuery, setSearchQuery] = useState("");
  const [tableData, setTableData] = useState(defaultData);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [rawCategory, setRawCategory] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [isRawCategoryModalOpen, setIsRawCategoryModalOpen] = useState(false);
  const [isVendorOpen, setIsVendorOpen] = useState(false);
  const [isSupplierOpen, setIsSupplierOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [translationCache, setTranslationCache] = useState({});
  const [selectedRawMaterialCategory, setSelectedRawMaterialCategory] =
    useState(null);
  const intl = useIntl();
  const langConfig = getLangConfig();
  let id = localStorage.getItem("userId");
  const isLoadingExistingData = useRef(false);

  const parseDate = (dateStr) => {
  if (!dateStr) return null;

  const [day, month, year] = dateStr.split("/");
  return new Date(year, month - 1, day);
};

  const formatDate = (date) => {
  if (!date) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

  const formik = useFormik({
    initialValues: {
  nameEnglish: "",
  nameGujarati: "",
  nameHindi: "",
  rawCategoryId: "",
  dailyConsumption : "",
  maxStock : "",
  leadTime : "",
  unitid: "",
  supplierRate: "",
  priority: "",
  generalFixAccess: false,
  weight: "",

 
  openingBalance: "",
  closingQty: "",
  expiryDate: null,
  isCalculate: false,
  cgst: "",
  sgst: "",
  igst: "",
  cess: "",
},
    validationSchema,
    onSubmit: async (values) => {
     
      const formData = new FormData();

      // Append basic fields
      formData.append("isGeneralFix", values.generalFixAccess);
      formData.append("nameEnglish", values.nameEnglish.trim());
      formData.append("nameGujarati", values.nameGujarati.trim() || "");
      formData.append("nameHindi", values.nameHindi.trim() || "");
      formData.append("rawMaterialCatId", parseInt(values.rawCategoryId));
      formData.append("sequence", parseInt(values.priority) || 0);
      formData.append("supplierRate", parseFloat(values.supplierRate) || 0);
      formData.append("unitId", parseInt(values.unitid));
      formData.append("userId", parseInt(id));
      formData.append("weightPer100Pax", parseFloat(values.weight) || 0);
      formData.append("dailyConsumption", values.dailyConsumption || "");
      formData.append("MaxStock", values.maxStock || 0);
      formData.append("LeadTime", values.leadTime || 0 );
      formData.append("opbStock", parseFloat(values.openingBalance) || 0);
      formData.append("minStock", parseFloat(values.closingQty) || 0);
      formData.append("expiryDate",  formatDate(values.expiryDate) || "");
      formData.append("isApplyCal", values.isCalculate);
      formData.append("cgst", parseFloat(values.cgst) || 0);
formData.append("sgst", parseFloat(values.sgst) || 0);
formData.append("igst", parseFloat(values.igst) || 0);
formData.append("cess", parseFloat(values.cess) || 0);

      // Append image file if exists
      if (imageFile) {
        formData.append("file", imageFile);
      }

      // Append supplier data separately
      tableData.forEach((supplier, index) => {
        formData.append(
          `rawMaterialSupplierRequestDtos[${index}].id`,
          supplier.backendId || 0,
        );
        formData.append(
          `rawMaterialSupplierRequestDtos[${index}].idDefault`,
          supplier.isDefault || false,
        );
        formData.append(
          `rawMaterialSupplierRequestDtos[${index}].partyId`,
          parseInt(supplier.supplierId),
        );
      });

      try {
        let response;
        if (rawmaterial) {
          response = await EditRawMaterial(
            rawmaterial.raw_material_id,
            formData,
          );
        } else {
          response = await Addrawmaterial(formData);
        }

        if (response && (response.success || response.data.success === true)) {
  Swal.fire({
    title: "Success!",
    text: `Raw material ${rawmaterial ? "updated" : "saved"} successfully.`,
    icon: "success",
    confirmButtonText: "OK",
    customClass: {
    container: "swal-on-top",
  },
  }).then(() => {
    onClose(false);
    if (refreshData) refreshData();
  });
} else {
  throw new Error(response?.data?.msg || "API call failed");
}
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text:
            error.message ||
            `Failed to ${rawmaterial ? "update" : "save"} raw material.`,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    },
  });

  // Handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          title: "Invalid File",
          text: "Please select an image file",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          title: "File Too Large",
          text: "Image size should be less than 5MB",
          icon: "warning",
          confirmButtonText: "OK",
        });
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  useEffect(() => {
    const englishName = formik.values.nameEnglish?.trim();

    if (!englishName) return;
    if (isLoadingExistingData.current) return; // ⛔ skip if loading backend data

    if (translationCache[englishName]) {
  formik.setFieldValue("nameGujarati", translationCache[englishName].gujarati || "");
  formik.setFieldValue("nameHindi",    translationCache[englishName].hindi    || "");
  return; 
}

    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      Translateapi(englishName)
  .then((res) => {
    const { regional, hindi } = extractTranslations(res.data);
    formik.setFieldValue("nameGujarati", regional);
    formik.setFieldValue("nameHindi", hindi);
    setTranslationCache((prev) => ({
      ...prev,
      [englishName]: { gujarati: regional, hindi },
    }));
  })
        .catch((err) => console.error("Translation error:", err));
    }, 500);

    setDebounceTimer(timer);
  }, [formik.values.nameEnglish]);

  

  useEffect(() => {
    if (!isOpen) {
      // modal closed → reset everything
      formik.resetForm();
      setTableData([]);
      setEditingSupplier(null);
      setImageFile(null);
      setImagePreview(null);
      return;
    }

    if (isOpen) {
      FetchRawMaterialCategory();
      FetchUnit();

      if (rawmaterial) {
        isLoadingExistingData.current = true;
       console.log("raw material ", rawmaterial);
       
        formik.setValues({
          nameEnglish: rawmaterial.raw_material_name || "",
          nameGujarati: rawmaterial.nameGujarati || "",
          nameHindi: rawmaterial.nameHindi || "",
          rawCategoryId: rawmaterial.raw_material_cat_id || "",
          unitid: rawmaterial.unitId || "",
          supplierRate: rawmaterial.rate || "",
          priority: rawmaterial.priority || "",
          generalFixAccess: rawmaterial.isGeneralFix || false,
          weight: rawmaterial.weightPer100Pax || "",
          openingBalance: rawmaterial.opbStock ?? "",
          closingQty: rawmaterial.minStock ?? "",
          expiryDate: parseDate(rawmaterial.expiryDate),
          isCalculate: rawmaterial.isCalculate ?? false,
          dailyConsumption: rawmaterial.dailyConsumption || "",
          maxStock: rawmaterial.maxStock || "",
          leadTime: rawmaterial.leadTime || "",
           cgst: rawmaterial.cgst ?? "",
  sgst: rawmaterial.sgst ?? "",
  igst: rawmaterial.igst ?? "",
  cess: rawmaterial.cess ?? "",
        });
        setTimeout(() => {
          isLoadingExistingData.current = false;
        }, 600);

        
        const imageUrl =
          rawmaterial.file || rawmaterial.imageUrl || rawmaterial.image;
        if (imageUrl) {
          // If it's a full URL, use it directly
          // If it's a relative path, construct the full URL
          const fullImageUrl = imageUrl.startsWith("http")
            ? imageUrl
            : `${import.meta.env.VITE_API_BASE_URL || ""}${imageUrl}`;

          setImagePreview(fullImageUrl);
          // Don't set imageFile when editing - only set preview
          setImageFile(null);
        }

        if (rawmaterial.suppliers?.length > 0) {
          const supplierTableData = rawmaterial.suppliers.map(
            (supplier, index) => ({
              sr_no: index + 1,
              supplierId: supplier.party.id,
              supplier_name: supplier.party.nameEnglish || `-`,
              backendId: supplier.id || 0,
              deleteId: supplier.id,
              isDefault: supplier.isDefault || false,
            }),
          );
          setTableData(supplierTableData);
        }
      } else {
        formik.resetForm();
        setTableData([]);
        setImageFile(null);
        setImagePreview(null);
      }
    }
  }, [isOpen, rawmaterial]);

  const FetchRawMaterialCategory = () => {
    GetRawMaterialcategory(id).then((response) => {
      const data = response?.data?.data["Raw Material Category Details"];
      setRawCategory(
        data.map((item) => ({ label: item.nameEnglish, value: item.id })),
      );
    });
  };

  const FetchUnit = () => {
    GetUnitData(id).then((response) => {
      const data = response?.data?.data["Unit Details"];
      setUnitList(
        data.map((item) => ({
          id: item.id,
          nameEnglish: item.nameEnglish,
          symbolEnglish: item.symbolEnglish,
        })),
      );
    });
  };

 const handleRemoveSupplier = (item) => {
  Swal.fire({
    title: "Are you sure?",
    text: "You want to remove this supplier?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, remove it!",
     customClass: {
    container: "swal-on-top",
  },
  }).then(async (result) => {
    if (!result.isConfirmed) return;

   
    if (item.backendId === 0) {
      setTableData((prevData) =>
        prevData.filter((dataItem) => dataItem.supplierId !== item.supplierId),
      );
      Swal.fire({
        title: "Removed!",
        text: "Supplier has been removed successfully.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }


    try {
      const response = await DeleteSuplier(item.backendId);
      if (response?.success || response?.data?.success === true) {
        setTableData((prevData) =>
          prevData.filter((dataItem) => dataItem.backendId !== item.backendId),
        );
        Swal.fire({
          title: "Removed!",
          text: "Supplier has been removed successfully.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(response?.message || "API call failed");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to delete supplier.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  });
};

  const handleSetDefaultSupplier = (supplierId) => {
    setTableData((prevData) =>
      prevData.map((item) => ({
        ...item,
        isDefault: item.supplierId === supplierId,
      })),
    );
  };

 const handleEditSupplier = (supplier) => {
  setEditingSupplier(supplier);
  setIsSupplierOpen(true); 
};
  const handleUpdateSupplier = (updatedSupplierData) => {
    setTableData((prevData) =>
      prevData.map((item) =>
        item.supplierId === editingSupplier?.supplierId
          ? {
              ...item,
              supplierId: updatedSupplierData.id,
              supplier_name: updatedSupplierData.name,
            }
          : item,
      ),
    );

    Swal.fire({
      title: "Success!",
      text: "Supplier updated successfully.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleAddSupplier = (supplierData) => {
    const existingSupplier = tableData.find(
      (item) => item.supplierId === supplierData.id,
    );

    if (existingSupplier) {
      Swal.fire({
        title: "Supplier Already Added",
        text: "This supplier is already added to the list.",
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    const newId =
      tableData.length > 0
        ? Math.max(...tableData.map((item) => item.id)) + 1
        : 1;

    const newSupplierEntry = {
      sr_no: newId,
      supplierId: supplierData.id,
      supplier_name: supplierData.name,
      backendId: 0,
      isDefault: true,
    };

    setTableData((prevData) => [...prevData, newSupplierEntry]);

    Swal.fire({
      title: "Success!",
      text: "Supplier added successfully.",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const handleSupplierAction = (supplierData) => {
    if (editingSupplier) {
      handleUpdateSupplier(supplierData);
    } else {
      handleAddSupplier(supplierData);
    }
  };

  const filteredTableData = tableData.filter((supplier) =>
    supplier.supplier_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const openSupplier = () => {
    setIsVendorOpen(false);
    setTimeout(() => setIsSupplierOpen(true), 150);
  };

  const openVendor = () => {
    setIsSupplierOpen(false);
    setTimeout(() => setIsVendorOpen(true), 150);
  };

  return (
    isOpen && (
      <CustomModal
        open={isOpen}
        width={1000}
        onClose={() => onClose(false)}
        title={
          rawmaterial ? (
            <FormattedMessage
              id="USER.RAWMATERIAL.EDIT_TITLE"
              defaultMessage="Edit Raw Material"
            />
          ) : (
            <FormattedMessage
              id="USER.RAWMATERIAL.NEW_TITLE"
              defaultMessage="New Raw Material"
            />
          )
        }
        footer={[
          <div className="flex justify-between " key="footer-buttons">
            <button className="btn btn-light" onClick={() => onClose(false)}>
              <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
            </button>
            <button className="btn btn-primary" onClick={formik.handleSubmit}>
              {rawmaterial ? (
                <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
              ) : (
                <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
              )}
            </button>
          </div>,
        ]}
      >
        <form
          onSubmit={formik.handleSubmit}
          className="flex flex-col gap-y-4 overflow-auto scrollable-y"
        >
          {/* Image Upload Section */}

     <MultiLangInputBox
  label="Name"
  formData={{
    nameEnglish: formik.values.nameEnglish,
    nameGujarati: formik.values.nameGujarati,
    nameHindi: formik.values.nameHindi,
  }}
  setFormData={(updated) => {
    if (updated.nameEnglish !== formik.values.nameEnglish)
      formik.setFieldValue("nameEnglish", updated.nameEnglish);
    if (updated.nameGujarati !== formik.values.nameGujarati)
      formik.setFieldValue("nameGujarati", updated.nameGujarati);
    if (updated.nameHindi !== formik.values.nameHindi)
      formik.setFieldValue("nameHindi", updated.nameHindi);
  }}
  cols={3}
  keys={{
    english: "nameEnglish",
    regional: "nameGujarati",
    hindi: "nameHindi",
  }}
  error={formik.touched.nameEnglish && formik.errors.nameEnglish}
/>
          {/* Raw Category */}
          <div className="flex flex-col">
            <label className="form-label">
              <FormattedMessage
                id="USER.RAWMATERIAL.CATEGORY"
                defaultMessage="Raw Material Category"
              />
              <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  options={rawCategory}
                  value={
                    rawCategory.find(
                      (c) => c.value === formik.values.rawCategoryId,
                    ) || null
                  }
                  onChange={(selected) =>
                    formik.setFieldValue("rawCategoryId", selected?.value || "")
                  }
                  placeholder={intl.formatMessage({
                    id: "USER.RAWMATERIAL.SELECT_CATEGORY",
                    defaultMessage: "Select Raw Material Category",
                  })}
                  isClearable
                  styles={{
                    control: (base) => ({ ...base, minHeight: "38px" }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>

              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full shadow hover:scale-105 transition"
                onClick={() => {
                  setSelectedRawMaterialCategory(null);
                  setIsRawCategoryModalOpen(true);
                }}
              >
                <i className="ki-filled ki-plus"></i>
              </button>
            </div>

            {formik.touched.rawCategoryId && formik.errors.rawCategoryId && (
              <span className="text-red-500 text-sm">
                {formik.errors.rawCategoryId}
              </span>
            )}
          </div>

          {/* Unit */}
          <div className="flex flex-col">
            <label className="form-label flex items-center gap-2">
              <FormattedMessage id="COMMON.UNIT" defaultMessage="Unit" />
              <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center gap-2">
              <div className="flex-1">
                <Select
                  options={unitList.map((u) => ({
                    value: u.id,
                    label: `${u.nameEnglish} (${u.symbolEnglish})`,
                  }))}
                  value={
                    unitList
                      .map((u) => ({
                        value: u.id,
                        label: `${u.nameEnglish} (${u.symbolEnglish})`,
                      }))
                      .find((u) => u.value === formik.values.unitid) || null
                  }
                  onChange={(selected) =>
                    formik.setFieldValue("unitid", selected?.value || "")
                  }
                  placeholder={intl.formatMessage({
                    id: "COMMON.SELECT_UNIT",
                    defaultMessage: "Select Unit",
                  })}
                  isClearable
                  styles={{
                    control: (base) => ({ ...base, minHeight: "38px" }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>
            </div>

            {formik.touched.unitid && formik.errors.unitid && (
              <span className="text-red-500 text-sm">
                {formik.errors.unitid}
              </span>
            )}
          </div>

<div className="grid grid-cols-5 gap-x-4">
  <div className="flex flex-col">
    <label className="form-label">
      <FormattedMessage id="COMMON.SUPPLIER_RATE" defaultMessage="Rate" />
    </label>
    <input
      type="tel"
      name="supplierRate"
      value={formik.values.supplierRate}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      placeholder="Enter Supplier Rate"
      className="input"
    />
    {formik.touched.supplierRate && formik.errors.supplierRate && (
      <span className="text-red-500 text-sm">
        {formik.errors.supplierRate}
      </span>
    )}
  </div>

  {/* 👈 new field, plain string input, not required */}
  <div className="flex flex-col">
    <label className="form-label">Daily Consumption</label>
    <input
      type="text"
      name="dailyConsumption"
      value={formik.values.dailyConsumption}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      placeholder="Enter Daily Consumption"
      className="input"
    />
  </div>

  <div className="flex flex-col">
    <label className="form-label">
      <FormattedMessage id="COMMON.PRIORITY" defaultMessage="Priority" />
    </label>
    <input
      type="tel"
      name="priority"
      value={formik.values.priority}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      placeholder="Enter Priority"
      className="input"
    />
    {formik.touched.priority && formik.errors.priority && (
      <span className="text-red-500 text-sm">
        {formik.errors.priority}
      </span>
    )}
  </div>
   <div className="flex flex-col">
    <label className="form-label">Max Stock</label>
    <input
      type="text"
      name="maxStock"
      value={formik.values.maxStock}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      placeholder="Enter Max Stock"
      className="input"
    />
  </div>
   <div className="flex flex-col">
    <label className="form-label">lead Time (In Days)</label>
    <input
      type="text"
      name="leadTime"
      value={formik.values.leadTime}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      placeholder="Enter Lead Time"
      className="input"
    />
  </div>
</div>


<div className="grid grid-cols-4 gap-x-4">
  <div className="flex flex-col">
    <label className="form-label">CGST (%)</label>
    <input
      type="tel"
      name="cgst"
      value={formik.values.cgst}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      placeholder="Enter CGST"
      className="input"
    />
    {formik.touched.cgst && formik.errors.cgst && (
      <span className="text-red-500 text-sm">{formik.errors.cgst}</span>
    )}
  </div>

  <div className="flex flex-col">
    <label className="form-label">SGST (%)</label>
    <input
      type="tel"
      name="sgst"
      value={formik.values.sgst}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      placeholder="Enter SGST"
      className="input"
    />
    {formik.touched.sgst && formik.errors.sgst && (
      <span className="text-red-500 text-sm">{formik.errors.sgst}</span>
    )}
  </div>

  <div className="flex flex-col">
    <label className="form-label">IGST (%)</label>
    <input
      type="tel"
      name="igst"
      value={formik.values.igst}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      placeholder="Enter IGST"
      className="input"
    />
    {formik.touched.igst && formik.errors.igst && (
      <span className="text-red-500 text-sm">{formik.errors.igst}</span>
    )}
  </div>

  <div className="flex flex-col">
    <label className="form-label">CESS (%)</label>
    <input
      type="tel"
      name="cess"
      value={formik.values.cess}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      placeholder="Enter CESS"
      className="input"
    />
    {formik.touched.cess && formik.errors.cess && (
      <span className="text-red-500 text-sm">{formik.errors.cess}</span>
    )}
  </div>
</div>

          
          <div className="grid grid-cols-2 gap-x-4">
            <div className="flex flex-col">
              <label className="form-label">Opening Balance</label>
              <input
                type="tel"
                name="openingBalance"
                value={formik.values.openingBalance}
                onChange={formik.handleChange}
                placeholder="Enter Opening Balance"
                className="input"
              />
            </div>

            <div className="flex flex-col">
              <label className="form-label">Closing Qty</label>
              <input
                type="tel"
                name="closingQty"
                value={formik.values.closingQty}
                onChange={formik.handleChange}
                placeholder="Enter Closing Qty"
                className="input"
              />
            </div>
          </div>

         <div className="grid grid-cols-2 gap-x-4">
          <div className="flex flex-col">
            <label className="form-label">Expiry Date</label>
            <DatePicker
  selected={formik.values.expiryDate}
  onChange={(date) => formik.setFieldValue("expiryDate", date)}
  dateFormat="dd/MM/yyyy"
  placeholderText="Select Expiry Date"
  className="input"
/>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <label className="form-label">Is Calculate</label>
            <label className="switch switch-lg">
              <input
  type="checkbox"
  name="isCalculate"
  checked={formik.values.isCalculate}
  onChange={(e) =>
    formik.setFieldValue("isCalculate", e.target.checked)
  }
/>
            </label>
          </div>
        </div>
          <div className="flex flex-col">
            <label className="form-label">
              <FormattedMessage
                id="USER.RAWMATERIAL.IMAGE"
                defaultMessage="Raw Material Image"
              />
            </label>
            <div className="flex items-center gap-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition"
                  >
                    <i className="ki-filled ki-cross text-xs"></i>
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="image-upload"
                  className="btn btn-light cursor-pointer"
                >
                  <i className="ki-filled ki-file-up"></i>
                  <FormattedMessage
                    id="COMMON.UPLOAD_IMAGE"
                    defaultMessage="Upload Image"
                  />
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <span className="text-xs text-gray-500">
                  Max size: 5MB | Formats: JPG, PNG, GIF
                </span>
              </div>
            </div>
          </div>
          {/* General Fix */}
          <div className="flex items-center gap-2 mt-2">
            <label className="form-label">
              <FormattedMessage
                id="USER.RAWMATERIAL.GENERAL_FIX"
                defaultMessage="General Fix Raw Material"
              />
            </label>
            <label className="switch switch-lg">
              <input
                type="checkbox"
                name="generalFixAccess"
                checked={formik.values.generalFixAccess}
                onChange={formik.handleChange}
              />
            </label>
          </div>

          {/* Weight */}
          {formik.values.generalFixAccess && (
            <div className="flex flex-col gap-y-4 mt-4">
              <div className="grid grid-cols-2 gap-x-4">
                <div className="flex flex-col">
                  <label className="form-label">
                    <FormattedMessage
                      id="USER.RAWMATERIAL.WEIGHT"
                      defaultMessage="Weight Per 100 Person"
                    />
                  </label>
                  <input
                    type="tel"
                    name="weight"
                    value={formik.values.weight}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Enter Weight"
                    className="input"
                  />
                  {formik.touched.weight && formik.errors.weight && (
                    <span className="text-red-500 text-sm">
                      {formik.errors.weight}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Supplier Table Section */}
          <div>
            <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
              <div
                className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}
              >
                <div className="filItems relative">
                  <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
                  <input
                    className="input pl-8"
                    placeholder={intl.formatMessage({
                      id: "USER.SUPPLIER.SEARCH_SUPPLIER",
                      defaultMessage: "Search Supplier...",
                    })}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={() => {
                    openSupplier();
                    setEditingSupplier(null);
                  }}
                  title="Add Supplier"
                >
                  <i className="ki-filled ki-plus"></i>{" "}
                  <FormattedMessage
                    id="USER.SUPPLIER.ADD_SUPPLIER"
                    defaultMessage="Add Supplier"
                  />
                </button>
              </div>
            </div>

            <TableComponent
              columns={columns(
                handleEditSupplier,
                handleRemoveSupplier,
                handleSetDefaultSupplier,
              )}
              data={filteredTableData}
              paginationSize={5}
            />
          </div>
        </form>

        {/* Supplier Modal */}
        <AddSupplier
          isOpen={isSupplierOpen}
          onClose={() => {
            setIsSupplierOpen(false);
            setEditingSupplier(null);
          }}
          onAddSupplier={handleSupplierAction}
          supplierData={editingSupplier}
          onOpenVendor={() => openVendor()}
        />

        <AddVendor
          isOpen={isVendorOpen}
          onClose={() => {
            setIsVendorOpen(false);
            openSupplier();
          }}
        />

        <AddRawMaterialCategory
          isOpen={isRawCategoryModalOpen}
          onClose={() => setIsRawCategoryModalOpen(false)}
          refreshData={FetchRawMaterialCategory}
          rawMaterialCategory={selectedRawMaterialCategory}
        />
      </CustomModal>
    )
  );
};

export default AddRawMaterial;
