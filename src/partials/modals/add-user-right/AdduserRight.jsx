import {
  AddContactMasterType,
  EditContactType,
  Translateapi,
} from "@/services/apiServices";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { extractTranslations } from "@/utils/langConfig";

const AdduserRight = ({ isOpen, onClose, contactType, refreshData }) => {
  if (!isOpen) return null;

  const initialFormState = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
    isActive: true,
  };

  const validationSchema = Yup.object().shape({
    nameEnglish: Yup.string().required("Name is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const userID = localStorage.getItem("userId");
      if (!userID) {
        alert("User data not found");
        return;
      }

      const payload = { ...values, userId: userID };

      if (contactType) {
        await EditContactType(contactType.contacttypeid, payload);
        Swal.fire("Updated!", "Contact type updated successfully.", "success");
      } else {
        await AddContactMasterType(payload);
        Swal.fire("Saved!", "Contact type added successfully.", "success");
      }

      refreshData();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving contact type:", error);
      Swal.fire("Error", "Something went wrong!", "error");
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
            {contactType ? (
              <FormattedMessage
                id="USER.MASTER.EDIT_CONTACT_TYPE"
                defaultMessage="Edit Contact Type"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.NEW_CONTACT_TYPE"
                defaultMessage="Add Security Groups"
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
            contactType
              ? {
                  nameEnglish: contactType.contact_type || "",
                  nameGujarati: contactType.nameGujarati || "",
                  nameHindi: contactType.nameHindi || "",
                  isActive: contactType.isActive || false,
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
    const { regional, hindi } = extractTranslations(res.data);
    setFieldValue("nameGujarati", regional);
    setFieldValue("nameHindi", hindi);
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
                        defaultMessage="Security Group Name"
                      />
                    }
                    name="Security Group Name"
                  />
                  <SelectWithFormik
                    label={
                      <FormattedMessage
                        id="COMMON.ACTIVE_STATUS"
                        defaultMessage="Active?"
                      />
                    }
                    name="isActive"
                    options={[
                      { label: "Active", value: true },
                      { label: "Inactive", value: false },
                    ]}
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
                      id="USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_CANCEL"
                      defaultMessage="Cancel"
                    />
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
                  >
                    {contactType ? (
                      <FormattedMessage
                        id="COMMON.UPDATE"
                        defaultMessage="Update"
                      />
                    ) : (
                      <FormattedMessage
                        id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_SAVE_BUTTON"
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

const InputWithFormik = ({ label, name }) => (
  <div className="flex flex-col">
    <label className="block text-gray-600 mb-1">
      {label}
      <span className="text-red-500">*</span>
    </label>
    <Field
      type="text"
      name={name}
      placeholder={label}
      className="border border-gray-300 rounded-lg p-2 w-full"
    />
    <ErrorMessage
      name={name}
      component="div"
      className="text-red-500 text-sm mt-1"
    />
  </div>
);

const SelectWithFormik = ({ label, name, options }) => (
  <div className="flex flex-col">
    <label className="block text-gray-600 mb-1">
      {label}
      <span className="text-red-500">*</span>
    </label>
    <Field
      as="select"
      name={name}
      className="border border-gray-300 rounded-lg p-2 w-full bg-white"
    >
      <option value="">Select an option</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </Field>
    <ErrorMessage
      name={name}
      component="div"
      className="text-red-500 text-sm mt-1"
    />
  </div>
);

export default AdduserRight;
