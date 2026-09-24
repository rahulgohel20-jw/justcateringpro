import React, { useState, useEffect } from "react";
import {
  Addcontactcategory,
  EditContactCategory,
  GetAllContactType,
} from "@/services/apiServices";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";

const AddContactCategory = ({
  isOpen,
  onClose,
  contactCategory,
  refreshData,
  labourOnly = false,
  excludeCustomerType = false,
}) => {
  if (!isOpen) return null;

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
      GetAllContactType(1)
        .then((res) => {
          let allTypes = res?.data?.data?.["Contact Type Details"] || [];
          if (labourOnly) {
            allTypes = allTypes.filter((type) => type.nameEnglish === "Labour");
          }
          setContactTypes(allTypes);
        })
        .catch((err) => console.error(err));
    }
  }, [Id, labourOnly]);

  const validationSchema = Yup.object().shape({
    nameEnglish: Yup.string().required("Name is required"),
    contcatTypeId: Yup.string().required("Contact Type is required"),
    sequence: Yup.number()
      .typeError("Sequence must be a number")
      .min(0, "Sequence cannot be a negative number")
      .nullable(),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      if (!Id) {
        alert("User data not found");
        return;
      }

      if (values.sequence !== "" && values.sequence !== null && Number(values.sequence) < 0) {
        Swal.fire("Error!", "Sequence cannot be a negative number.", "error");
        setSubmitting(false);
        return;
      }

      const matchedType = contactTypes.find(
        (t) => t.nameEnglish === values.contcatTypeId
      );

      const payload = {
        ...values,
        userId: Id,
        contcatTypeId: matchedType?.id ?? values.contcatTypeId,
      };

      if (contactCategory) {
        await EditContactCategory(contactCategory.contactid, payload);
        Swal.fire("Updated!", "Contact category updated successfully.", "success");
      } else {
        await Addcontactcategory(payload);
        Swal.fire("Saved!", "Contact category added successfully.", "success");
      }

      refreshData();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving category:", error);
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
          <button onClick={() => onClose(false)} className="text-2xl text-gray-600">
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
          {({ isSubmitting }) => {
            return (
              <Form>
                <div className="grid grid-cols-1 gap-4">
                  {/* Name (English) */}
                  <InputWithFormik
                    label={
                      <FormattedMessage
                        id="COMMON.NAME_ENGLISH"
                        defaultMessage="Name (English)"
                      />
                    }
                    name="nameEnglish"
                    type="text"
                    placeholder={intl.formatMessage({
                      id: "COMMON.NAME_ENGLISH",
                      defaultMessage: "Name (English)",
                    })}
                    required={true}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Contact Type Dropdown */}
                    <div className="flex flex-col">
                      <label className="block text-gray-600 mb-1">
                        <FormattedMessage
                          id="USER.MASTER.CONTACT_TYPE"
                          defaultMessage="Types"
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
                            <option key={type.id} value={type.nameEnglish}>
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

                    {/* Sequence */}
                    <InputWithFormik
                      label={
                        <FormattedMessage
                          id="USER.MASTER.PRIORITY"
                          defaultMessage="Sequence"
                        />
                      }
                      name="sequence"
                      type="number"
                      min="0"
                      onKeyDown={(e) => {
                        if (["-", "+", "e", "E"].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                      placeholder={intl.formatMessage({
                        id: "USER.MASTER.PRIORITY",
                        defaultMessage: "sequence",
                      })}
                      required={false}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex w-full justify-end mt-6 gap-3">
                  <button
                    type="button"
                    onClick={() => onClose(false)}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
                  >
                    {contactCategory ? (
                      <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
                    ) : (
                      <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
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
  required = true,
  min,
  onKeyDown,
}) => (
  <div className="flex flex-col">
    <label className="block text-gray-600 mb-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    <Field
      type={type}
      name={name}
      min={min}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className="border border-gray-300 rounded-lg p-2 w-full"
    />
    {required && (
      <ErrorMessage name={name} component="div" className="text-red-500 text-sm mt-1" />
    )}
  </div>
);

export default AddContactCategory;