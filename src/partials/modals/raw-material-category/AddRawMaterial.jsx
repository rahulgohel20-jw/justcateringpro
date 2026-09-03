import { useEffect, useState } from "react";
import {
  AddRawMaterialCat,
  EditRawMaterialCat,
  GetRawType,
  Translateapi,
} from "@/services/apiServices";
import RawMaterialDropdown from "@/components/dropdowns/MealTypeDropdown";
import { Checkbox } from "antd";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { Plus } from "lucide-react";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputBox";
import { useRef } from "react";


const validationSchema = Yup.object().shape({
  nameEnglish: Yup.string().required("Name (English) is required"),
  nameGujarati: Yup.string().required("Name (ગુજરાતી) is required"),
  nameHindi: Yup.string().required("Name (हिंदी) is required"),

  rawMaterialCatTypeId: Yup.string().required("Type is required"),
});

const AddRawMaterial = ({
  isOpen,
  onClose,
  rawMaterialCategory,
  refreshData,
}) => {
  if (!isOpen) return null;
  const intl = useIntl();
  const langConfig = getLangConfig();
  const [options, setOptions] = useState([]);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [selectedRawCategory, setSelectedRawCategory] = useState(null);
  let userId = localStorage.getItem("userId");
const debounceRef = useRef(null);

useEffect(() => {
  return () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };
}, []);
  // Translate function for Name fields
const triggerTranslate = (text, setFieldValue) => {
  if (!text?.trim()) return;
  if (debounceRef.current) clearTimeout(debounceRef.current);

  debounceRef.current = setTimeout(() => {
    Translateapi(text)
      .then((res) => {
        const { regional, hindi } = extractTranslations(res.data);
        setFieldValue("nameGujarati", regional);
        setFieldValue("nameHindi", hindi);
      })
      .catch((err) => console.error("Translation error:", err));
  }, 500);
};

  // Function to fetch dropdown options
  const FetchRawTypeCategory = () => {
    GetRawType(1)
      .then((res) => {
        const rawData =
          res?.data?.data?.["Raw Material Category Type Details"] || [];
        setOptions(
          rawData.map((item) => ({
            label: item.nameEnglish,
            value: item.id,
          }))
        );
      })
      .catch((error) => console.error("Error fetching raw type:", error));
  };

  // Fetch dropdown options on mount
  useEffect(() => {
    FetchRawTypeCategory();
  }, [userId]);

  // Initial values
  const initialValues = {
    nameEnglish: rawMaterialCategory?.name || "",
    nameGujarati: rawMaterialCategory?.nameGujarati || "",
    nameHindi: rawMaterialCategory?.nameHindi || "",
    sequence: rawMaterialCategory?.priority || "",
    rawMaterialCatTypeId: rawMaterialCategory?.rawtypeid || "",
    isDirect: rawMaterialCategory?.isDirect || false,
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      if (!userId) {
        Swal.fire("Error", "User data not found", "error");
        return;
      }

      const payload = { ...values, userId: userId };

      let response;
      if (rawMaterialCategory) {
        response = await EditRawMaterialCat(
          rawMaterialCategory.rawCatid,
          payload
        );
      } else {
        response = await AddRawMaterialCat(payload);
      }

      if (
        response?.data?.msg?.toLowerCase().includes("successfully") ||
        response?.data?.status === true
      ) {
        Swal.fire({
          title: response?.data?.msg || "Success",
          icon: "success",
          background: "#f5faff",
          color: "#003f73",
          confirmButtonText: "Okay",
          confirmButtonColor: "#005BA8",
        });
        refreshData();
        onClose(false);
      } else {
        Swal.fire(
          "Error",
          response?.data?.msg || "Something went wrong",
          "error"
        );
      }
    } catch (error) {
      Swal.fire(
        "Error",
        error.response?.data?.msg || "Something went wrong",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {rawMaterialCategory ? (
              <FormattedMessage
                id="USER.MASTER.EDIT_RAW_MATERIAL_CATEGORY"
                defaultMessage="Edit Raw Material Category"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.NEW_RAW_MATERIAL_CATEGORY"
                defaultMessage="Create New Raw Material Category"
              />
            )}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-500 hover:text-red-500 transition"
          >
            <i className="ki-filled ki-cross text-2xl"></i>
          </button>
        </div>

        {/* Formik Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, isSubmitting }) => {
            // Watch English field & auto-translate
            useEffect(() => {
              if (values.nameEnglish) {
                triggerTranslate(values.nameEnglish, setFieldValue);
              }
            }, [values.nameEnglish]);

            return (
              <Form className="space-y-6">
                {/* Name fields in 1 row (3 columns) */}
                <MultiLangInputBox
  label="Name"
  formData={{
    nameEnglish: values.nameEnglish,
    nameGujarati: values.nameGujarati,
    nameHindi: values.nameHindi,
  }}
  setFormData={(updated) => {
    const englishChanged = updated.nameEnglish !== values.nameEnglish;

    setFieldValue("nameEnglish", updated.nameEnglish);
    setFieldValue("nameGujarati", updated.nameGujarati);
    setFieldValue("nameHindi", updated.nameHindi);

    // Only translate on add, not edit
    if (englishChanged && !rawMaterialCategory) {
      if (!updated.nameEnglish.trim()) {
        setFieldValue("nameGujarati", "");
        setFieldValue("nameHindi", "");
        return;
      }
      triggerTranslate(updated.nameEnglish, setFieldValue);
    }
  }}
  cols={3}
  keys={{
    english: "nameEnglish",
    regional: "nameGujarati",
    hindi: "nameHindi",
  }}
/>

                {/* Sequence field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWithIcon
                    label={
                      <FormattedMessage
                        id="COMMON.SEQUENCE"
                        defaultMessage="Sequence"
                      />
                    }
                    name="sequence"
                    type="tel"
                    placeholder={intl.formatMessage({
                      id: "COMMON.SEQUENCE",
                      defaultMessage: "Sequence",
                    })}
                  />

                  {/* Type field with Add button */}
                  <div>
                    <label className="block text-gray-600 font-medium mb-1">
                      <FormattedMessage
                        id="USER.MASTER.RAW_MATERIAL_TYPE"
                        defaultMessage="Type"
                      />{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <RawMaterialDropdown
  value={values.rawMaterialCatTypeId}
  onChange={(val) => setFieldValue("rawMaterialCatTypeId", val)}
  options={options}
/>
                      </div>
                    </div>

                    <ErrorMessage
                      name="rawMaterialCatTypeId"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                </div>

                {/* isDirect Checkbox */}
                {/* <div className="flex items-center gap-2">
                  <Field name="isDirect">
                    {({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onChange={(e) =>
                          setFieldValue("isDirect", e.target.checked)
                        }
                      >
                        <FormattedMessage
                          id="USER.MASTER.IS_DIRECT"
                          defaultMessage="Is Direct"
                        />
                      </Checkbox>
                    )}
                  </Field>
                </div> */}

                {/* Buttons */}
                <div className="flex justify-end mt-6 gap-3">
                  <button
                    type="button"
                    onClick={() => onClose(false)}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <FormattedMessage
                      id="COMMON.CANCEL"
                      defaultMessage="Cancel"
                    />
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
                  >
                    {rawMaterialCategory ? (
                      <FormattedMessage
                        id="COMMON.UPDATE"
                        defaultMessage="Update"
                      />
                    ) : (
                      <FormattedMessage
                        id="COMMON.SAVE"
                        defaultMessage="Save"
                      />
                    )}
                  </button>
                </div>
              </Form>
            );
          }}
        </Formik>

        {/* Add Raw Material Type Modal */}
      </div>
    </div>
  );
};

const InputWithIcon = ({ label, name, placeholder, type = "text" }) => (
  <div className="relative">
    <label className="block text-gray-600 mb-1">
      {label}
      <span className="text-red-500">*</span>
    </label>
    <Field
      type={type}
      name={name}
      className="border border-gray-300 rounded-lg p-2 w-full"
      placeholder={placeholder}
    />
    <ErrorMessage
      name={name}
      component="div"
      className="text-red-500 text-sm mt-1"
    />
    {/* Mic icon */}
    <span className="absolute right-2 top-9 text-blue-500 cursor-pointer">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 14a4 4 0 004-4V5a4 4 0 10-8 0v5a4 4 0 004 4zm1 2.93a7 7 0 01-5.2-2.11A1 1 0 104.8 16.8 9 9 0 0010 19a9 9 0 005.2-2.2 1 1 0 00-1.4-1.4A7 7 0 0111 16.93z" />
      </svg>
    </span>
  </div>
);

export default AddRawMaterial;
