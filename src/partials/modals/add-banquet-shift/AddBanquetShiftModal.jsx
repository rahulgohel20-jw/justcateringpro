import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useEffect } from "react";
import { AddBanquetShiftApi } from "../../../services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";

const AddBanquetShiftModal = ({ isOpen, onClose, shiftData, refreshData }) => {
  if (!isOpen) return null;
  const intl = useIntl();

  const initialFormState = {
    shiftName: "",
    startTime: "",
    endTime: "",
    sortorder: "",
    isActive: true,
  };

  const validationSchema = Yup.object().shape({
    shiftName: Yup.string()
      .trim()
      .required(
        intl.formatMessage({
          id: "BANQUET_SHIFT.SHIFT_NAME_REQUIRED",
          defaultMessage: "Shift name is required",
        })
      ),

    startTime: Yup.string()
      .matches(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        intl.formatMessage({
          id: "BANQUET_SHIFT.START_TIME_FORMAT",
          defaultMessage: "Start time must be in HH:mm 24-hour format",
        })
      )
      .required(
        intl.formatMessage({
          id: "BANQUET_SHIFT.START_TIME_REQUIRED",
          defaultMessage: "Start time is required",
        })
      ),

    endTime: Yup.string()
      .matches(
        /^([01]\d|2[0-3]):([0-5]\d)$/,
        intl.formatMessage({
          id: "BANQUET_SHIFT.END_TIME_FORMAT",
          defaultMessage: "End time must be in HH:mm 24-hour format",
        })
      )
      .required(
        intl.formatMessage({
          id: "BANQUET_SHIFT.END_TIME_REQUIRED",
          defaultMessage: "End time is required",
        })
      )
      .test(
        "end-after-start",
        intl.formatMessage({
          id: "BANQUET_SHIFT.END_AFTER_START",
          defaultMessage: "End time must be after start time",
        }),
        function (endTime) {
          const { startTime } = this.parent;
          if (!startTime || !endTime) return true;
          return endTime > startTime;
        }
      ),

    sortorder: Yup.number()
      .typeError(
        intl.formatMessage({
          id: "BANQUET_SHIFT.SORT_ORDER_NUMBER",
          defaultMessage: "Sequence must be a number",
        })
      )
      .min(
        0,
        intl.formatMessage({
          id: "BANQUET_SHIFT.SORT_ORDER_NON_NEGATIVE",
          defaultMessage: "Sequence cannot be negative",
        })
      )
      .integer(
        intl.formatMessage({
          id: "BANQUET_SHIFT.SORT_ORDER_INTEGER",
          defaultMessage: "Sequence must be an integer",
        })
      )
      .required(
        intl.formatMessage({
          id: "BANQUET_SHIFT.SORT_ORDER_REQUIRED",
          defaultMessage: "Sequence is required",
        })
      ),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        return alert(
          intl.formatMessage({
            id: "COMMON.USER_DATA_NOT_FOUND",
            defaultMessage: "User data not found",
          })
        );
      }
      const payload = {
        shiftName: values.shiftName.trim(),
        startTime: values.startTime,
        endTime: values.endTime,
        sortorder: Number(values.sortorder),
        isActive: values.isActive,
        userId: Number(userId),
      };

      let response;

      if (shiftData) {
        response = await AddBanquetShiftApi({ ...payload, id: shiftData.id });
      } else {
        response = await AddBanquetShiftApi(payload);
      }

      if (response?.data?.success === true) {
        Swal.fire({
          title: intl.formatMessage({
            id: "COMMON.SUCCESS",
            defaultMessage: "Success!",
          }),
          text:
            response.data.msg ||
            intl.formatMessage({
              id: "COMMON.OPERATION_SUCCESSFUL",
              defaultMessage: "Operation successful",
            }),
          icon: "success",
        });
        refreshData();
        onClose(false);
        resetForm();
      } else {
        Swal.fire(
          intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error!" }),
          response?.data?.msg ||
            intl.formatMessage({
              id: "COMMON.SOMETHING_WENT_WRONG",
              defaultMessage: "Something went wrong!",
            }),
          "error"
        );
      }
    } catch (error) {
      console.error("Error saving banquet shift:", error);
      Swal.fire(
        intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error!" }),
        intl.formatMessage({
          id: "COMMON.SOMETHING_WENT_WRONG",
          defaultMessage: "Something went wrong!",
        }),
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-lg p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {shiftData ? (
              <FormattedMessage id="BANQUET_SHIFT.EDIT" defaultMessage="Edit Banquet Shift" />
            ) : (
              <FormattedMessage id="BANQUET_SHIFT.CREATE" defaultMessage="Create Banquet Shift" />
            )}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-2xl text-gray-600 hover:text-gray-800"
          >
            &times;
          </button>
        </div>

        <Formik
          initialValues={
            shiftData
              ? {
                  shiftName: shiftData.shift_name || shiftData.shiftName || "",
                  startTime: shiftData.start_time || shiftData.startTime || "",
                  endTime: shiftData.end_time || shiftData.endTime || "",
                  sortorder:
                    shiftData.sortorder !== undefined &&
                    shiftData.sortorder !== null &&
                    shiftData.sortorder !== "-"
                      ? shiftData.sortorder
                      : shiftData.sortOrder !== undefined &&
                        shiftData.sortOrder !== null &&
                        shiftData.sortOrder !== "-"
                      ? shiftData.sortOrder
                      : "",
                  isActive: shiftData.isActive ?? true,
                }
              : initialFormState
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, isSubmitting }) => (
            <Form>
              <div className="grid grid-cols-1 gap-4 mb-4">
                <InputWithFormik
                  label={intl.formatMessage({
                    id: "BANQUET_SHIFT.SHIFT_NAME",
                    defaultMessage: "Shift Name",
                  })}
                  name="shiftName"
                  placeholder={intl.formatMessage({
                    id: "BANQUET_SHIFT.SHIFT_NAME_PLACEHOLDER",
                    defaultMessage: "e.g. Morning Banquet",
                  })}
                />

                <TimePickerField
                  name="startTime"
                  label={intl.formatMessage({
                    id: "BANQUET_SHIFT.START_TIME",
                    defaultMessage: "Start Time (HH:mm)",
                  })}
                  value={values.startTime}
                  setFieldValue={setFieldValue}
                />

                <TimePickerField
                  name="endTime"
                  label={intl.formatMessage({
                    id: "BANQUET_SHIFT.END_TIME",
                    defaultMessage: "End Time (HH:mm)",
                  })}
                  value={values.endTime}
                  setFieldValue={setFieldValue}
                />

                <InputWithFormik
                  label={intl.formatMessage({
                    id: "COMMON.SEQUENCE",
                    defaultMessage: "Sequence",
                  })}
                  name="sortorder"
                  type="number"
                  min="0"
                  step="1"
                  placeholder={intl.formatMessage({
                    id: "BANQUET_SHIFT.SORT_ORDER_PLACEHOLDER",
                    defaultMessage: "e.g. 1",
                  })}
                  onKeyDown={(e) => {
                    // Disallow negative sign, plus sign, exponent, and decimal point
                    if (["-", "+", "e", "E", "."].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e, form) => {
                    const cleanVal = e.target.value.replace(/\D/g, "");
                    form.setFieldValue("sortorder", cleanVal);
                  }}
                />

                <div className="flex items-center gap-3">
                  <label className="text-gray-600 font-medium">
                    <FormattedMessage id="COMMON.ACTIVE" defaultMessage="Active" />
                  </label>
                  <label className="switch switch-lg">
                    <input
                      type="checkbox"
                      checked={values.isActive}
                      onChange={(e) => setFieldValue("isActive", e.target.checked)}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => onClose(false)}
                  className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600"
                >
                  <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <FormattedMessage id="COMMON.SAVING" defaultMessage="Saving..." />
                  ) : shiftData ? (
                    <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
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

const InputWithFormik = ({
  label,
  name,
  type = "text",
  placeholder = "",
  min,
  step,
  onKeyDown,
  onChange,
}) => (
  <div className="flex flex-col">
    <label className="text-gray-600 mb-1">{label}</label>
    <Field name={name}>
      {({ field, form }) => (
        <input
          {...field}
          type={type}
          placeholder={placeholder || label}
          className="border border-gray-300 rounded-lg p-2 w-full"
          {...(min !== undefined ? { min } : {})}
          {...(step !== undefined ? { step } : {})}
          onKeyDown={onKeyDown}
          onChange={(e) => {
            if (onChange) {
              onChange(e, form);
            } else {
              field.onChange(e);
            }
          }}
        />
      )}
    </Field>
    <ErrorMessage name={name} component="div" className="text-red-500 text-sm mt-1" />
  </div>
);

const TimePickerField = ({ name, label, value, setFieldValue }) => (
  <div className="flex flex-col">
    <label className="text-gray-700 mb-1">{label}</label>
    <Field
      type="time"
      name={name}
      value={value}
      onChange={(e) => setFieldValue(name, e.target.value)}
      className="border border-gray-300 rounded-lg p-2 w-48"
    />
    <ErrorMessage name={name} component="div" className="text-red-500 text-sm mt-1" />
  </div>
);

export default AddBanquetShiftModal;