import { AddExtraPayment } from "@/services/apiServices";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";

const AddExtraPaymentModal = ({ isOpen, onClose, payment, refreshData }) => {
  if (!isOpen) return null;

  const initialFormState = {
    description: "",
    name: "",
    price: "",
  };

  const validationSchema = Yup.object().shape({
    description: Yup.string().required("Description is required"),
    name: Yup.string().required("Name is required"),
    price: Yup.number()
      .required("Price is required")
      .positive("Price must be positive")
      .typeError("Price must be a number"),
  });

 const handleSubmit = async (values, { setSubmitting, resetForm }) => {
  try {
    const formData = new FormData();
    formData.append("id", payment?.id || -1);
    formData.append("description", values.description);
    formData.append("name", values.name);
    formData.append("price", parseFloat(values.price));

    const response = await AddExtraPayment(formData);

    if (response?.data?.success) {
      Swal.fire(
        payment?.id ? "Updated!" : "Saved!",
        payment?.id
          ? "Extra payment updated successfully."
          : "Extra payment added successfully.",
        "success"
      );

      refreshData();
      onClose();
      resetForm();
    } else {
      Swal.fire(
        "Error!",
        response?.data?.message || "Failed to save extra payment.",
        "error"
      );
    }
  } catch (error) {
    console.error("Error saving extra payment:", error);
    Swal.fire("Error!", "Failed to save extra payment.", "error");
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
            {payment ? (
              <FormattedMessage
                id="USER.MASTER.EDIT_EXTRA_PAYMENT"
                defaultMessage="Edit Extra Payment"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.NEW_EXTRA_PAYMENT"
                defaultMessage="New Extra Payment"
              />
            )}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-2xl text-gray-600 hover:text-gray-800"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <Formik
          initialValues={
            payment
              ? {
                  description: payment.description || "",
                  name: payment.name || "",
                  price: payment.price || "",
                }
              : initialFormState
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting }) => (
            <Form>
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWithFormik
                    label={
                      <FormattedMessage
                        id="USER.MASTER.NAME"
                        defaultMessage="Name"
                      />
                    }
                    name="name"
                    placeholder="Enter name"
                  />

                  <InputWithFormik
                    label={
                      <FormattedMessage
                        id="USER.MASTER.PRICE"
                        defaultMessage="Price"
                      />
                    }
                    name="price"
                    type="tel"
                    placeholder="Enter price"
                  />
                </div>
                <InputWithFormik
                  label={
                    <FormattedMessage
                      id="USER.MASTER.DESCRIPTION"
                      defaultMessage="Description"
                    />
                  }
                  name="description"
                  placeholder="Enter description"
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
                  className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                >
                  {payment ? (
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
          )}
        </Formik>
      </div>
    </div>
  );
};

const InputWithFormik = ({ label, name, placeholder, type = "text" }) => (
  <div className="flex flex-col">
    <label className="block text-gray-600 mb-1">
      {label}
      <span className="text-red-500">*</span>
    </label>
    <Field
      type={type}
      name={name}
      placeholder={placeholder || label}
      className="border border-gray-300 rounded-lg p-2 w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
    />
    <ErrorMessage
      name={name}
      component="div"
      className="text-red-500 text-sm mt-1"
    />
  </div>
);

export default AddExtraPaymentModal;
