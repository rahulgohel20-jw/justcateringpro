import { AddCoupon as AddCouponApi } from "@/services/apiServices";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";

const AddCoupon = ({ isOpen, onClose, payment, refreshData }) => {
  if (!isOpen) return null;

  // Convert dd-mm-yyyy HH:mm:ss to yyyy-mm-ddTHH:mm for input[type="datetime-local"]
  const convertToInputDateTime = (dateStr) => {
    if (!dateStr) return "";

    // Handle format: dd-mm-yyyy HH:mm:ss or dd/mm/yyyy HH:mm:ss
    const dateTimeParts = dateStr.split(" ");
    if (dateTimeParts.length >= 2) {
      const datePart = dateTimeParts[0];
      const timePart = dateTimeParts[1];

      // Split date part (support both - and /)
      const dateParts = datePart.split(/[-/]/);
      if (dateParts.length === 3) {
        const [day, month, year] = dateParts;
        // Get HH:mm from HH:mm:ss
        const timeFormatted = timePart.substring(0, 5);
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${timeFormatted}`;
      }
    }
    return dateStr;
  };

  // Convert yyyy-mm-ddTHH:mm to dd-mm-yyyy HH:mm:ss for API
  const convertToApiDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "";

    // Handle datetime-local format: yyyy-mm-ddTHH:mm
    const parts = dateTimeStr.split("T");
    if (parts.length === 2) {
      const [datePart, timePart] = parts;
      const dateParts = datePart.split("-");
      if (dateParts.length === 3) {
        const [year, month, day] = dateParts;
        // Add seconds :00 to time
        return `${day}/${month}/${year} ${timePart}`;
      }
    }
    return dateTimeStr;
  };

  const initialFormState = {
    coupenCode: "",
    coupenName: "",
    expireDate: "",
    maxUser: "",
    price: "",
  };

  const validationSchema = Yup.object().shape({
    coupenCode: Yup.string().required("Coupon code is required"),
    coupenName: Yup.string().required("Coupon name is required"),
    expireDate: Yup.string().required("Expire date and time is required"),
    maxUser: Yup.number()
      .required("Max user is required")
      .min(0, "Max user must be 0 or greater")
      .typeError("Max user must be a number"),
    price: Yup.number()
      .required("Price is required")
      .min(0, "Price must be 0 or greater")
      .typeError("Price must be a number"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const payload = {
        id: payment?.id || -1,
        coupenCode: values.coupenCode,
        coupenName: values.coupenName,
        expireDate: convertToApiDateTime(values.expireDate),
        maxUser: parseInt(values.maxUser),
        price: parseFloat(values.price),
      };

      await AddCouponApi(payload);

      Swal.fire(
        payment?.id ? "Updated!" : "Saved!",
        payment?.id
          ? "Coupon updated successfully."
          : "Coupon added successfully.",
        "success"
      );

      refreshData();
      onClose();
      resetForm();
    } catch (error) {
      console.error("Error saving coupon:", error);
      Swal.fire("Error!", "Failed to save coupon.", "error");
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
                id="USER.MASTER.EDIT_COUPON"
                defaultMessage="Edit Coupon"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.NEW_COUPON"
                defaultMessage="New Coupon"
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
                  coupenCode: payment.coupenCode || "",
                  coupenName: payment.coupenName || "",
                  expireDate: convertToInputDateTime(payment.expireDate) || "",
                  maxUser: payment.maxUser || "",
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
                        id="USER.MASTER.COUPON_CODE"
                        defaultMessage="Coupon Code"
                      />
                    }
                    name="coupenCode"
                    placeholder="Enter coupon code"
                  />

                  <InputWithFormik
                    label={
                      <FormattedMessage
                        id="USER.MASTER.COUPON_NAME"
                        defaultMessage="Coupon Name"
                      />
                    }
                    name="coupenName"
                    placeholder="Enter coupon name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputWithFormik
                    label={
                      <FormattedMessage
                        id="USER.MASTER.EXPIRE_DATE"
                        defaultMessage="Expire Date & Time"
                      />
                    }
                    name="expireDate"
                    type="datetime-local"
                    placeholder="Select expire date and time"
                  />

                  <InputWithFormik
                    label={
                      <FormattedMessage
                        id="USER.MASTER.MAX_USER"
                        defaultMessage="Max User"
                      />
                    }
                    name="maxUser"
                    type="tel"
                    placeholder="Enter max user"
                  />
                </div>

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

export default AddCoupon;
