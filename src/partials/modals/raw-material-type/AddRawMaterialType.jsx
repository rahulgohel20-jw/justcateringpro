import { useEffect, useState } from "react";
import { AddRawType, EditRawType, Translateapi } from "@/services/apiServices"; // ✅ added Translateapi
import Swal from "sweetalert2";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { FormattedMessage, useIntl } from "react-intl";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";
const AddRawMaterialType = ({ isOpen, onClose, rawdata, refreshData }) => {
  if (!isOpen) return null;
const langConfig = getLangConfig();
  const [debounceTimer, setDebounceTimer] = useState(null);
  const intl = useIntl();
  const initialValues = {
    nameEnglish: rawdata?.name || "",
    nameGujarati: rawdata?.nameGujarati || "",
    nameHindi: rawdata?.nameHindi || "",
    priority: rawdata?.rawid || "",
  };

  const validationSchema = Yup.object().shape({
    nameEnglish: Yup.string().required("Name is required"),
    priority: Yup.number()
      .typeError("Priority must be a number")
      .required("Priority is required"),
  });

  // ✅ Translation function
  const triggerTranslate = (text, setFieldValue) => {
    if (!text?.trim()) return;
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      Translateapi(text)
      .then((res) => {
  const { regional, hindi } = extractTranslations(res.data);
  setFieldValue("nameGujarati", regional);
  setFieldValue("nameHindi", hindi);
})
        .catch((err) => console.error("Translation error:", err));
    }, 500);

    setDebounceTimer(timer);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("User data not found");
      setSubmitting(false);
      return;
    }

    const payload = { ...values, userId: userId };

    try {
      const response = rawdata
        ? await EditRawType(rawdata.rawid, payload)
        : await AddRawType(payload);

      if (
        response?.data?.msg?.toLowerCase().includes("successfully") ||
        response?.data?.status === true
      ) {
        Swal.fire({
          title: response?.data?.msg || (rawdata ? "Updated!" : "Saved!"),
          icon: "success",
          background: "#f5faff",
          color: "#003f73",
          confirmButtonText: "Okay",
          confirmButtonColor: "#005BA8",
          showClass: {
            popup: "animate__animated animate__fadeInDown animate__faster",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOutUp animate__faster",
          },
          customClass: {
            popup: "rounded-2xl shadow-xl",
            title: "text-2xl font-bold",
            confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
          },
        });
        refreshData();
        onClose();
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
      <div className="bg-white rounded-xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {rawdata ? (
              <FormattedMessage
                id="USER.MASTER.EDIT_RAW_MATERIAL_TYPE"
                defaultMessage="Edit Raw Material type"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.NEW_RAW_MATERIAL_TYPE "
                defaultMessage="Raw Material Type"
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

        {/* Formik Form */}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, values, setFieldValue }) => {
            // ✅ watch English field & auto-translate
            useEffect(() => {
              if (values.nameEnglish) {
                triggerTranslate(values.nameEnglish, setFieldValue);
              }
            }, [values.nameEnglish]);

            return (
              <Form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* English */}
                <div>
                  <label className="block text-gray-600 mb-1">
                    <FormattedMessage
                      id="COMMON.NAME_ENGLISH"
                      defaultMessage=" Name English"
                    />
                    <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="text"
                    name="nameEnglish"
                    placeholder={intl.formatMessage({
                      id: "COMMON.NAME_ENGLISH",
                      defaultMessage: "Name english",
                    })}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  />
                  <ErrorMessage
                    name="nameEnglish"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Gujarati */}
                <div>
                  <label className="block text-gray-600 mb-1">
  <FormattedMessage
    id={langConfig.nameIntlId}
    defaultMessage={langConfig.label}
  />
  <span className="text-red-500">*</span>
</label>
<Field
  type="text"
  name="nameGujarati"
  placeholder={langConfig.label}
  className="border border-gray-300 rounded-lg p-2 w-full"
/>
                  <ErrorMessage
                    name="nameGujarati"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Hindi */}
                <div>
                  <label className="block text-gray-600 mb-1">
                    <FormattedMessage
                      id="COMMON.NAME_HINDI"
                      defaultMessage="Name Hindi"
                    />
                    <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="text"
                    name="nameHindi"
                    placeholder={intl.formatMessage({
                      id: "COMMON.NAME_HINDI",
                      defaultMessage: "Name Hindi",
                    })}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  />
                  <ErrorMessage
                    name="nameHindi"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-gray-600 mb-1">
                    <FormattedMessage
                      id="COMMON.PRIORITY"
                      defaultMessage="Priority"
                    />
                    <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="text"
                    name="priority"
                    placeholder={intl.formatMessage({
                      id: "COMMON.PRIORITY",
                      defaultMessage: "Priority",
                    })}
                    className="border border-gray-300 rounded-lg p-2 w-full"
                  />
                  <ErrorMessage
                    name="priority"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Buttons */}
                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => onClose(false)}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
                  >
                    <FormattedMessage
                      id="COMMON.CANCEL"
                      defaultMessage="cancel"
                    />
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
                  >
                    {rawdata ? (
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

export default AddRawMaterialType;
