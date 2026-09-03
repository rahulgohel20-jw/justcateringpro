import { AddModuleRights, UpdateModuleRights } from "@/services/apiServices";
import Swal from "sweetalert2";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FormattedMessage } from "react-intl";

const AddModuleRight = ({ isOpen, onClose, rawdata, refreshData }) => {
  if (!isOpen) return null;
  const SelectWithFormikBoolean = ({ label, name }) => (
    <div className="flex flex-col mt-4">
      <label className="block text-gray-600 mb-1">
        {label} <span className="text-red-500">*</span>
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
  const initialValues = {
    name: rawdata?.name || "",
    isAdminModule:
      rawdata?.isAdminModule !== undefined
        ? String(rawdata.isAdminModule)
        : "false",
  };
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    isAdminModule: Yup.boolean().required("Required"),
  });
  const handleSubmit = async (values, { setSubmitting }) => {
    const payload = {
      name: values.name,
      isAdminModule: values.isAdminModule === "true",
    };

    try {
      const response = rawdata
        ? await UpdateModuleRights(rawdata.rawid, payload)
        : await AddModuleRights(payload);

      if (
        response?.data?.status === true ||
        response?.data?.msg?.toLowerCase().includes("success")
      ) {
        Swal.fire({
          title: response?.data?.msg || (rawdata ? "Updated!" : "Saved!"),
          icon: "success",
          confirmButtonColor: "#005BA8",
        });

        refreshData();
        onClose(false);
      } else {
        Swal.fire({
          title: response?.data?.msg || "Error!",
          icon: "error",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Something went wrong",
        icon: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-[90%] md:w-[60%] lg:w-[40%] xl:w-[35%] p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {rawdata ? (
              <FormattedMessage
                id="USER.MASTER.EDIT_MODULE_RIGHT"
                defaultMessage="Edit Module Right"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.NEW_MODULE_RIGHT"
                defaultMessage="Add Module Right"
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

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form>
              <label className="block text-gray-600 mb-1">
                Name <span className="text-red-500">*</span>
              </label>

              <Field
                type="text"
                name="name"
                placeholder="Enter Module Right Name"
                className="border border-gray-300 rounded-lg p-2 w-full"
              />

              <ErrorMessage
                name="name"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
              <SelectWithFormikBoolean
                label="Is Admin Module"
                name="isAdminModule"
              />
              <div className="flex justify-end gap-3 mt-6">
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
                  className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90"
                >
                  {rawdata ? (
                    <FormattedMessage
                      id="COMMON.UPDATE"
                      defaultMessage="Update"
                    />
                  ) : (
                    <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default AddModuleRight;
