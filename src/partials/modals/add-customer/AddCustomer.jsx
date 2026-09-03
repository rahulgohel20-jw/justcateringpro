
import { useRef, useState, useEffect, useCallback } from "react";
import * as Yup from "yup";
import Select from "react-select";
import Swal from "sweetalert2";
import {
  AddCustomerapi,
  EditCustomerApi,
  GetAllContactCategorybycontacttype,
  Translateapi,
} from "@/services/apiServices";
import InputToTextLang from "@/components/form-inputs/InputToTextLang";
import AddContactCategory from "@/partials/modals/add-contact-category/AddContactCategory";
import { FormattedMessage, useIntl } from "react-intl";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";

const AddCustomer = ({
  isModalOpen,
  setIsModalOpen,
  selectedCustomer,
  refreshData = () => {},
}) => {
  if (!isModalOpen) return null;
  const intl = useIntl();
const langConfig = getLangConfig();
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [isconatctModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Yup validation schema
  const validationSchema = Yup.object().shape({
    nameEnglish: Yup.string().required("Name (English) is required"),
    // mobileno: Yup.string()
    //   .required("Mobile number is required")
    //   .matches(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
    contactCategoryId: Yup.string().required("Contact category is required"),
  });

  // Initial form state
  const initialFormState = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
    addressEnglish: "",
    addressGujarati: "",
    addressHindi: "",
    email: "",
    mobileno: "",
    altMobileno: "",
    gst: "",
    bdate: "",
    pan:"",
    contactCategoryId: "",
    document: "",
    opb: "",
    opbDate: "",
    type: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const parseBirthdate = useCallback((birthdateString) => {
    if (!birthdateString || birthdateString === "-") return "";
    try {
      let dateStr = birthdateString.trim();

      if (dateStr.includes(",")) {
        dateStr = dateStr.split(",")[0].trim();
      }

      if (dateStr.includes("/")) {
        const [day, month, year] = dateStr.split("/");
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      }

      if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateStr;
      }

      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const da = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${da}`;
      }

      return "";
    } catch {
      return "";
    }
  }, []);

  const Id = localStorage.getItem("userId");

  const triggerTranslate = (text, fieldType) => {
    if (!text?.trim()) return;

    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      Translateapi(text)
        .then((res) => {
  if (fieldType === "name") {
    const { regional, hindi } = extractTranslations(res.data);
    setFormData((prev) => ({
      ...prev,
      nameGujarati: regional,
      nameHindi: hindi,
    }));
  }
  if (fieldType === "address") {
    const { regional, hindi } = extractTranslations(res.data);
    setFormData((prev) => ({
      ...prev,
      addressGujarati: regional,
      addressHindi: hindi,
    }));
  }
})
        .catch((err) => console.error("Translation error:", err));
    }, 500);

    setDebounceTimer(timer);
  };

  useEffect(() => {
    if (formData.nameEnglish) {
      triggerTranslate(formData.nameEnglish, "name");
    }
  }, [formData.nameEnglish]);

  useEffect(() => {
    if (formData.addressEnglish) {
      triggerTranslate(formData.addressEnglish, "address");
    }
  }, [formData.addressEnglish]);

  useEffect(() => {
    if (isModalOpen && categories.length === 0) {
      fetchCategories();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      if (selectedCustomer) {
        const parsedDate = parseBirthdate(selectedCustomer.birthdate);

        setFormData({
          id: selectedCustomer.customerid || "",
          nameEnglish: selectedCustomer.customer || "",
          nameGujarati: selectedCustomer.nameGujarati || "",
          nameHindi: selectedCustomer.nameHindi || "",
          addressEnglish: selectedCustomer.address || "",
          addressGujarati: selectedCustomer.addressGujarati || "",
          addressHindi: selectedCustomer.addressHindi || "",
          email: selectedCustomer.email || "",
          mobileno: selectedCustomer.mobile || "",
          altMobileno: selectedCustomer.altMobileno || "",
          gst: selectedCustomer.gst || "",
          bdate: parsedDate,
          document: selectedCustomer.document || "",
          contactCategoryId: selectedCustomer.contactCategoryId || "",
opb: selectedCustomer.opb ?? "",
opbDate: parseBirthdate(selectedCustomer.opbDate) || "",  
type: selectedCustomer.type || "",
 pan: selectedCustomer.pan || "",
        });

        if (selectedCustomer.image) {
          setImagePreview(`/uploads/${selectedCustomer.image}`);
        }
      } else {
        setFormData(initialFormState);
        setImagePreview(null);
        setSelectedFile(null);
      }
      setErrors({});
    }
  }, [selectedCustomer, isModalOpen, parseBirthdate]);

  const fetchCategories = async () => {
    try {
      const concatId = 1;
      const {
        data: { data },
      } = await GetAllContactCategorybycontacttype(concatId, Id);

      const allCategories = data["Contact Category Details"] || [];
      const filteredCategories = allCategories.filter((cat) => {
        return cat.contactType?.nameEnglish?.toLowerCase() === "customer";
      });

      setCategories(allCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (!isModalOpen) {
        Swal.fire({
          icon: "warning",
          title: "Warning",
          text: "Please add at least one customer category.",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    }
  };

  const handleIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";

      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  const validateForm = async () => {
    try {
      await validationSchema.validate(formData, { abortEarly: false });
      setErrors({});
      return true;
    } catch (validationErrors) {
      const errorObject = {};
      validationErrors.inner.forEach((error) => {
        errorObject[error.path] = error.message;
      });
      setErrors(errorObject);
      return false;
    }
  };

  const CustomerAddApi = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    setIsLoading(true);
    try {
      if (!Id) {
        throw new Error("User data not found");
      }

      const formDataObj = new FormData();

      // ✅ append all form fields
      Object.entries({
        ...formData,
        userId: Id,
        bdate: formatDateToDDMMYYYY(formData.bdate),
        opbDate: formatDateToDDMMYYYY(formData.opbDate),
      }).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formDataObj.append(key, value);
        }
      });

      // ✅ append file
      if (selectedFile) {
        formDataObj.append("file", selectedFile);
      }

      if (formData.id) {
        const res = await EditCustomerApi(formData.id, formDataObj);
        if (res?.data.success === false) {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: res.data.msg || "Failed to update customer",
            timer: 2000,
            showConfirmButton: false,
          });
          setIsModalOpen(true);
        } else {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: res.data.msg || "Customer updated successfully!",
            timer: 2000,
            showConfirmButton: false,
          });
          setIsModalOpen(false);
          refreshData();
          setFormData(initialFormState);
          setImagePreview(null);
          setSelectedFile(null);
          setErrors({});
        }
      } else {
        const res = await AddCustomerapi(formDataObj);
        if (res?.data.success === false) {
          Swal.fire({
            icon: "error",
            title: "Error!",
            text: res.data.msg || "Failed to add customer",
            timer: 2000,
            showConfirmButton: false,
          });
          setIsModalOpen(true);
        } else {
          Swal.fire({
            icon: "success",
            title: "Success!",
            text: res.data.msg || "Customer added successfully!",
            timer: 2000,
            showConfirmButton: false,
          });
          setIsModalOpen(false);
          refreshData();
          setFormData(initialFormState);
          setImagePreview(null);
          setSelectedFile(null);
          setErrors({});
        }
      }
    } catch (error) {
  Swal.fire({
    icon: "error",
    title: "Error!",
    text: error?.response?.data?.msg || error.message || "Failed to save customer",
    timer: 3000,
    showConfirmButton: false,
  });
} finally {
  setIsLoading(false);
}
  };

  const handleModalClose = () => {
    const hasFormData = Object.values(formData).some(
      (value) =>
        value &&
        value !== "" &&
        value !==
          initialFormState[
            Object.keys(formData).find((key) => formData[key] === value)
          ],
    );

    if (hasFormData && !formData.id) {
      Swal.fire({
        title: "Are you sure?",
        text: "You have unsaved changes. Do you want to close without saving?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, close it!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          setIsModalOpen(false);
          setFormData(initialFormState);
          setImagePreview(null);
          setSelectedFile(null);
          setErrors({});
        }
      });
    } else {
      setIsModalOpen(false);
      setFormData(initialFormState);
      setImagePreview(null);
      setSelectedFile(null);
      setErrors({});
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#F2F7FB] rounded-xl w-full max-w-5xl p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {formData.id ? (
              <FormattedMessage
                id="USER.MASTER.EDIT_CUSTOMER"
                defaultMessage="Edit Customer"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.NEW_CUSTOMER"
                defaultMessage="New Customer"
              />
            )}
          </h2>
          <button
            onClick={handleModalClose}
            className="text-2xl text-gray-600 hover:text-gray-800"
            disabled={isLoading}
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <div className="overflow-y-auto max-h-[90vh]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Name fields */}
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
                placeholder={intl.formatMessage({
                  id: "COMMON.NAME_ENGLISH",
                  defaultMessage: "Name (English)",
                })}
                lng="en-US"
                required
              />
              {errors.nameEnglish && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.nameEnglish}
                </p>
              )}
            </div>
<InputToTextLang
  label={
    <FormattedMessage
      id={langConfig.nameIntlId}
      defaultMessage={langConfig.label}
    />
  }
  name="nameGujarati"
  placeholder={langConfig.label}
  value={formData.nameGujarati}
  onChange={handleChange}
  lng="gu"
/>
            <InputToTextLang
              label={
                <FormattedMessage
                  id="COMMON.NAME_HINDI"
                  defaultMessage="Name (हिंदी)"
                />
              }
              name="nameHindi"
              placeholder={intl.formatMessage({
                id: "COMMON.NAME_HINDI",
                defaultMessage: "Name (हिंदी)",
              })}
              value={formData.nameHindi}
              onChange={handleChange}
              lng="hi"
            />

            {/* Home Address */}
            <InputToTextLang
              label={
                <FormattedMessage
                  id="COMMON.HOME_ADDRESS_ENGLISH"
                  defaultMessage="Home Address (English)"
                />
              }
              name="addressEnglish"
              placeholder={intl.formatMessage({
                id: "COMMON.HOME_ADDRESS_ENGLISH",
                defaultMessage: "Home Address (English)",
              })}
              value={formData.addressEnglish}
              onChange={handleChange}
              lng="en-US"
            />
            <InputToTextLang
  label={
    <FormattedMessage
      id={langConfig.addressIntlId}
      defaultMessage={`Home Address (${langConfig.label})`}
    />
  }
  name="addressGujarati"
  placeholder={`Home Address (${langConfig.label})`}
  value={formData.addressGujarati}
  onChange={handleChange}
  lng="gu"
/>
            <InputToTextLang
              label={
                <FormattedMessage
                  id="COMMON.HOME_ADDRESS_HINDI"
                  defaultMessage="Home Address (हिंदी)"
                />
              }
              name="addressHindi"
              placeholder={intl.formatMessage({
                id: "COMMON.NAME_HINDI",
                defaultMessage: "Name (हिंदी)",
              })}
              value={formData.addressHindi}
              onChange={handleChange}
              lng="hi"
            />

            {/* Contact Category */}
            <div className="flex flex-col gap-1">
              <label className="text-gray-600">
                <FormattedMessage
                  id="USER.MASTER.CONTACT_CATEGORY"
                  defaultMessage="Contact Category"
                />
                <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                  *
                </span>
              </label>
              <div className="flex items-center gap-2">
                <Select
                  options={categories.map((cat) => ({
                    value: cat.id,
                    label: cat.nameEnglish,
                  }))}
                  value={
                    formData.contactCategoryId
                      ? {
                          value: formData.contactCategoryId,
                          label: categories.find(
                            (c) => c.id === formData.contactCategoryId,
                          )?.nameEnglish,
                        }
                      : null
                  }
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactCategoryId: selected?.value || "",
                    }))
                  }
                  placeholder={intl.formatMessage({
                    id: "USER.MASTER.SELECT_CATEGORY",
                    defaultMessage: "-- Select Category --",
                  })}
                  className={`w-full ${errors.contactCategoryId ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 text-xl leading-none"
                  onClick={() => setIsContactModalOpen(true)}
                >
                  +
                </button>
              </div>
              {errors.contactCategoryId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.contactCategoryId}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <InputSimple
                label={
                  <FormattedMessage
                    id="USER.MASTER.EMAIL"
                    defaultMessage="Email"
                  />
                }
                name="email"
                type="email"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.EMAIL",
                  defaultMessage: "Mail",
                })}
                value={formData.email}
                onChange={handleChange}
                required={true}
                error={errors.email}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Mobile */}
            <div>
              <InputSimple
                label={
                  <FormattedMessage
                    id="USER.MASTER.MOBILE_NO"
                    defaultMessage="Mobile Number"
                  />
                }
                name="mobileno"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.MOBILE_NO",
                  defaultMessage: "Mobile Number",
                })}
                type="tel"
                value={formData.mobileno}
                onChange={handleChange}
                required
                error={errors.mobileno}
              />
              {errors.mobileno && (
                <p className="text-red-500 text-sm mt-1">{errors.mobileno}</p>
              )}
            </div>

            <div>
              <InputSimple
                label={
                  <FormattedMessage
                    id="USER.MASTER.ALTERNATIVE_NO"
                    defaultMessage="Alternative Number"
                  />
                }
                name="altMobileno"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.ALTERNATIVE_NO",
                  defaultMessage: "Alternative Number",
                })}
                type="tel"
                value={formData.altMobileno}
                onChange={handleChange}
                error={errors.altMobileno}
              />
              {errors.altMobileno && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.altMobileno}
                </p>
              )}
            </div>

            <div>
              <InputSimple
                label={
                  <FormattedMessage
                    id="USER.MASTER.GST_NO"
                    defaultMessage="GST Number"
                  />
                }
                name="gst"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.GST_NO",
                  defaultMessage: "GST Number",
                })}
                type="text"
                value={formData.gst}
                onChange={handleChange}
                error={errors.gst}
              />
              {errors.gst && (
                <p className="text-red-500 text-sm mt-1">{errors.gst}</p>
              )}
            </div>


           <div>
              <InputSimple
                label={
                  <FormattedMessage
                    id="USER.MASTER.PAN_NO"
                    defaultMessage="PAN Number"
                  />
                }
                name="pan"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.PAN_NO",
                  defaultMessage: "PAN Number",
                })}
                type="text"
                value={formData.pan}
                onChange={(e) =>
                  handleChange({
                    target: {
                      name: "pan",
                      value: e.target.value.toUpperCase(),
                    },
                  })
                }
                error={errors.pan}
              />
              {errors.pan && (
                <p className="text-red-500 text-sm mt-1">{errors.pan}</p>
              )}
            </div>
            {/* Birth Date */}
            <div className="relative">
              <label htmlFor="birth_date" className="block text-gray-600 mb-1">
                <FormattedMessage
                  id="USER.MASTER.BIRTHDATE"
                  defaultMessage="Birth Date"
                />
              </label>
              <input
                type="date"
                placeholder="{intl.formatMessage({ id: 'USER.MASTER.BIRTHDATE', defaultMessage: 'Birth Date' })}"
                name="bdate"
                className="border border-gray-300 rounded-lg p-2 w-full pr-10 text-gray-600"
                value={formData.bdate}
                onChange={handleChange}
              />
            </div>

            {/* Document Type */}
            <div className="flex flex-col w-full">
              <label className="text-gray-600">
                <FormattedMessage
                  id="USER.MASTER.SELECT_DOCUMENT"
                  defaultMessage="Select Document"
                />
              </label>
              <select
                name="document"
                value={formData.document}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-2 w-full"
              >
                <option value="">
                  <FormattedMessage
                    id="USER.MASTER.SELECT_DOCUMENT_OPTION"
                    defaultMessage="-- Select Document --"
                  />
                </option>
                <option value="aadhar">
                  <FormattedMessage
                    id="USER.MASTER.AADHAR_CARD"
                    defaultMessage="Aadhar Card"
                  />
                </option>
                <option value="pan">
                  <FormattedMessage
                    id="USER.MASTER.PAN_CARD"
                    defaultMessage="PAN Card"
                  />
                </option>
                <option value="passport">
                  <FormattedMessage
                    id="USER.MASTER.PASSPORT"
                    defaultMessage="Passport"
                  />
                </option>
                <option value="driving">
                  <FormattedMessage
                    id="USER.MASTER.DRIVING_LICENSE"
                    defaultMessage="Driving License"
                  />
                </option>
              </select>
            </div>

            {/* Document Upload */}
            <div className="flex flex-col">
              <label className="text-gray-600">
                <FormattedMessage
                  id="USER.MASTER.UPLOAD_DOCUMENTS"
                  defaultMessage="Upload Documents"
                />
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handleIconClick}
                  className="w-full h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V7.414a2 2 0 00-.586-1.414l-2.414-2.414A2 2 0 0013.586 3H4zm5 10a3 3 0 110-6 3 3 0 010 6zm5-5a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                </button>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-lg object-cover border border-gray-300"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <InputSimple
                label={
                  <FormattedMessage
                    id="USER.MASTER.OPENING_BALANCE"
                    defaultMessage="Opening Balance"
                  />
                }
                name="opb"
                type="tel"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.OPENING_BALANCE",
                  defaultMessage: "Opening Balance",
                })}
                value={formData.opb}
                onChange={handleChange}
                error={errors.opb}
              />
              {errors.opb && (
                <p className="text-red-500 text-sm mt-1">{errors.opb}</p>
              )}
            </div>

            {/* Opening Date */}
            <div className="relative">
              <label
                htmlFor="opening_date"
                className="block text-gray-600 mb-1"
              >
                <FormattedMessage
                  id="USER.MASTER.OPENING_DATE"
                  defaultMessage="Opening Date"
                />
              </label>
              <input
                type="date"
                name="opbDate"
                className="border border-gray-300 rounded-lg p-2 w-full pr-10 text-gray-600"
                value={formData.opbDate}
                onChange={handleChange}
              />
            </div>

            {/* Balance Type */}
            <div className="flex flex-col w-full">
              <label className="text-gray-600">
                <FormattedMessage
                  id="USER.MASTER.BALANCE_TYPE"
                  defaultMessage="Balance Type"
                />
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg p-2 w-full"
              >
                <option value="">
                  <FormattedMessage
                    id="USER.MASTER.SELECT_BALANCE_TYPE"
                    defaultMessage="-- Select Type --"
                  />
                </option>
                <option value="CR">
                  <FormattedMessage
                    id="USER.MASTER.CREDIT"
                    defaultMessage="Credit"
                  />
                </option>
                <option value="DR">
                  <FormattedMessage
                    id="USER.MASTER.DEBIT"
                    defaultMessage="Debit"
                  />
                </option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full justify-end mt-6 gap-3">
            <button
              type="button"
              onClick={handleModalClose}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={CustomerAddApi}
              disabled={isLoading}
            >
              {isLoading ? (
                <FormattedMessage
                  id="COMMON.SAVING"
                  defaultMessage="Saving..."
                />
              ) : formData.id ? (
                <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
              ) : (
                <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
              )}
            </button>
          </div>
        </div>
      </div>
      <AddContactCategory
        isOpen={isconatctModalOpen}
        onClose={setIsContactModalOpen}
        refreshData={fetchCategories}
      />
    </div>
  );
};

const InputSimple = ({
  label,
  name,
  value,
  onChange,
  required,
  type = "text",
  error,
  placeholder,
}) => (
  <div>
    <label className="block text-gray-600 mb-1">
      {label}
      {required && type !== "email" && (
        <span className="mandatory ms-0.5 text-base text-red-500 font-medium ml-1">
          *
        </span>
      )}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className={`border rounded-lg p-2 w-full ${
        error ? "border-red-500" : "border-gray-300"
      }`}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

export default AddCustomer;
