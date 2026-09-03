import React, { useState, useEffect } from "react";
import {
  Addcontactcategory,
  EditContactCategory,
  GetAllContactTypeById,
  Translateapi,
} from "@/services/apiServices";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";


const getLangConfig = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth-storage"));
    const lang = auth?.state?.user?.lang || "Gujarati";
    const langMap = {
      Gujarati:  { label: "Name (ગુજરાતી)", placeholder: "Name (ગુજરાતી)", apiKey: "gujarati" },
      Tamil:     { label: "Name (தமிழ்)",   placeholder: "Name (தமிழ்)",   apiKey: "ta"       },
      Telugu:    { label: "Name (తెలుగు)",  placeholder: "Name (తెలుగు)",  apiKey: "te"       },
      Malayalam: { label: "Name (മലയാളം)",  placeholder: "Name (മലയാളം)",  apiKey: "ml"       },
      Marathi:   { label: "Name (मराठी)",   placeholder: "Name (मराठी)",   apiKey: "mr"       },
    };
    return langMap[lang] || langMap["Gujarati"];
  } catch {
    return { label: "Name (ગુજરાતી)", placeholder: "Name (ગુજરાતી)", apiKey: "gujarati" };
  }
};

const AddContactCategory = ({
  isOpen,
  onClose,
  contactCategory,
  refreshData,
  excludeCustomerType = false,
  concatId,
}) => {
  if (!isOpen) return null;

  const langConfig = getLangConfig(); 

  const initialFormState = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
    sequence: "",
    contcatTypeId: "",
  };
  const intl = useIntl();

  const [contactTypes, setContactTypes] = useState([]);
  const Id = JSON.parse(localStorage.getItem("userId"));

  useEffect(() => {
    if (Id) {
      GetAllContactTypeById(concatId)
        .then((res) => {
          const allTypes = res?.data?.data?.["Contact Type Details"] || [];

          const filteredTypes = excludeCustomerType
            ? allTypes.filter((type) => type.id != 2)
            : allTypes;

          setContactTypes(filteredTypes);
        })
        .catch((err) => {
          console.error("Error fetching contact types:", err);
        });
    }
  }, [Id, excludeCustomerType]);

  // ✅ Validation schema
  const validationSchema = Yup.object().shape({
    nameEnglish: Yup.string().required("Name is required"),
    contcatTypeId: Yup.string().required("Contact Type is required"),
  });

  // ✅ Submit handler
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (!Id) {
        alert("User data not found");
        return;
      }

      const payload = { ...values, userId: Id };

      if (contactCategory) {
        const res = await EditContactCategory(
          contactCategory.contactid,
          payload,
        );

        if (res?.data?.success === true) {
          Swal.fire(
            "Updated!",
            "Contact category updated successfully.",
            "success",
          );
        }
      } else {
        const res = await Addcontactcategory(payload);
        if (res?.data?.success === true) {
          Swal.fire(
            "Saved!",
            "Contact category added successfully.",
            "success",
          );
        }
      }

      refreshData();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving category:", error);
      Swal.fire("Error", "Something went wrong!", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-101 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {contactCategory ? (
              <FormattedMessage
                id="USER.MASTER.EDIT_CONTACT_CATEGORY"
                defaultMessage="Edit Category"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.NEW_CONTACT_CATEGORY"
                defaultMessage="Create New Category"
              />
            )}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-2xl text-gray-600"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <Formik
          initialValues={
            contactCategory
              ? {
                  nameEnglish: contactCategory.contact_name || "",
                  nameGujarati: contactCategory.nameGujarati || "",
                  nameHindi: contactCategory.nameHindi || "",
                  sequence: contactCategory.sequence || "",
                  contcatTypeId: contactCategory.contcatTypeId || "",
                }
              : initialFormState
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, setFieldValue }) => {
            const [debounceTimer, setDebounceTimer] = useState(null);
            useEffect(() => {
              if (!values.nameEnglish?.trim()) return;

              if (debounceTimer) clearTimeout(debounceTimer);

              const timer = setTimeout(() => {
                Translateapi(values.nameEnglish)
  .then((res) => {
    setFieldValue("nameGujarati", res.data[langConfig.apiKey] || "");
    setFieldValue("nameHindi", res.data.hindi || "");
  })
                  .catch((err) => console.error("Translation error:", err));
              }, 500);

              setDebounceTimer(timer);

              return () => clearTimeout(timer);
            }, [values.nameEnglish]);
            return (
              <Form>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWithFormik
                    label={
                      <FormattedMessage
                        id="COMMON.NAME_ENGLISH"
                        defaultMessage="Name (English)"
                      />
                    }
                    name="nameEnglish"
                    placeholder={intl.formatMessage({
                      id: "COMMON.NAME_ENGLISH",
                      defaultMessage: "Name (English)",
                    })}
                  />
                  <InputWithFormik
  label={langConfig.label}
  name="nameGujarati"
  placeholder={langConfig.placeholder}
/>
                  <InputWithFormik
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
                  />

                  {/* Dropdown */}
                  <div className="flex flex-col">
                    <label className="block text-gray-600 mb-1">
                      <FormattedMessage
                        id="USER.MASTER.CONTACT_TYPE"
                        defaultMessage="Contact Type"
                      />
                      <span className="text-red-500">*</span>
                    </label>
                    <Field
                      as="select"
                      name="contcatTypeId"
                      className="border border-gray-300 rounded-lg p-2 w-full"
                    >
                      <option value="">
                        <FormattedMessage
                          id="USER.MASTER.SELECT_CONTACT_TYPE"
                          defaultMessage="-- Select Contact Type --"
                        />
                      </option>
                      {contactTypes
                        .filter((type) => type.isActive)
                        .map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.nameEnglish || "Unnamed"}
                          </option>
                        ))}
                    </Field>
                    <ErrorMessage
                      name="contcatTypeId"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>

                  {/* Priority */}
                  <InputWithFormik
                    label={
                      <FormattedMessage
                        id="USER.MASTER.PRIORITY"
                        defaultMessage="Priority"
                      />
                    }
                    name="sequence"
                    type="tel"
                    required={false}
                    placeholder={intl.formatMessage({
                      id: "USER.MASTER.PRIORITY",
                      defaultMessage: "Priority",
                    })}
                  />
                </div>

                {/* Actions */}
                <div className="flex w-full justify-end mt-6 gap-3">
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
                    {contactCategory ? (
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
      </div>
    </div>
  );
};

const InputWithFormik = ({
  label,
  name,
  type = "text",
  placeholder,
  required = true, // 👈 default true
}) => (
  <div className="flex flex-col">
    <label className="block text-gray-600 mb-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <Field
      type={type}
      name={name}
      placeholder={placeholder}
      className="border border-gray-300 rounded-lg p-2 w-full"
    />
    <ErrorMessage
      name={name}
      component="div"
      className="text-red-500 text-sm mt-1"
    />
  </div>
);

export default AddContactCategory;
