import { AddUserRightsPage, GetModuleRights } from "@/services/apiServices";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";

const AddPage = ({ isOpen, onClose, page, refreshData }) => {
  

  if (!isOpen) return null;

  const [modules, setModules] = useState([]);

  useEffect(() => {
    GetModuleRights()
      .then((res) => {
        setModules(res.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching modules:", error);
      });
  }, []);

  const initialFormState = {
    pagename: "",
    moduleId: "",
    isActive: true,
    isAdmin: false,
  };

  const validationSchema = Yup.object().shape({
    pagename: Yup.string().required("Page name is required"),
    moduleId: Yup.string().required("Module is required"),
    isAdmin: Yup.boolean().required("Admin selection is required"),
  });

  
const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  try {
    const Id = JSON.parse(localStorage.getItem("userId"));
    if (!Id) {
      alert("User data not found");
      return;
    }

    const payload = {
      pagename: values.pagename,
      moduleId: parseInt(values.moduleId),
      isActive: values.isActive,
    };

    if (page) {
      // ✅ Same API, just add pageid to payload
      await AddUserRightsPage({ ...payload, pageid: page.pageid });
      Swal.fire("Updated!", "Page updated successfully.", "success");
    } else {
      await AddUserRightsPage(payload);
      Swal.fire("Saved!", "Page added successfully.", "success");
    }

    refreshData();
    onClose();
    resetForm();
  } catch (error) {
    console.error("Error saving page:", error);
    Swal.fire("Error!", "Failed to save page.", "error");
  } finally {
    setSubmitting(false);
  }
};
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {page ? (
              <FormattedMessage
                id="USER.MASTER.EDIT_PAGE"
                defaultMessage="Edit Page"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.NEW_PAGE"
                defaultMessage="New Page"
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
            page
              ? {
                  pagename: page.pagename || "",
                  moduleId: page.moduleId || "",
                  isActive: page.isActive !== undefined ? page.isActive : true,
                  isAdmin: page.isAdmin !== undefined ? page.isAdmin : false,
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWithFormik
                    label={
                      <FormattedMessage
                        id="USER.MASTER.PAGE_NAME"
                        defaultMessage="Page Name"
                      />
                    }
                    name="pagename"
                    placeholder="Enter page name"
                  />

                  <SelectWithFormik
                    label={
                      <FormattedMessage
                        id="USER.MASTER.MODULE"
                        defaultMessage="Module"
                      />
                    }
                    name="moduleId"
                    options={modules}
                  />

                  {/* <SelectWithFormikBoolean label="Is Admin" name="isAdmin" /> */}
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
                    {page ? (
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

const InputWithFormik = ({ label, name, placeholder }) => (
  <div className="flex flex-col">
    <label className="block text-gray-600 mb-1">
      {label}
      <span className="text-red-500">*</span>
    </label>
    <Field
      type="text"
      name={name}
      placeholder={placeholder || label}
      className="border border-gray-300 rounded-lg p-2 w-full"
    />
    <ErrorMessage
      name={name}
      component="div"
      className="text-red-500 text-sm mt-1"
    />
  </div>
);

const SelectWithFormikBoolean = ({ label, name }) => (
  <div className="flex flex-col">
    <label className="block text-gray-600 mb-1">
      {label}
      <span className="text-red-500">*</span>
    </label>
    <Field
      as="select"
      name={name}
      className="border border-gray-300 rounded-lg p-2 w-full"
    >
      <option value="">Select Option</option>
      <option value="true">True</option>
      <option value="false">False</option>
    </Field>
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
      className="border border-gray-300 rounded-lg p-2 w-full"
    >
      <option value="">Select Module</option>
      {options.map((module) => (
        <option key={module.id} value={module.id}>
          {module.moduleName || module.name}
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

export default AddPage;
