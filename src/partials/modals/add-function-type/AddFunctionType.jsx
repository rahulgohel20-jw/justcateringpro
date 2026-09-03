import { useState, useEffect } from "react";
import { TimePicker, message } from "antd";
import dayjs from "dayjs";
import {
  AddFunction,
  EditFunctionById,
  Translateapi,
} from "@/services/apiServices";
import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { getLangConfig, extractTranslations } from "@/utils/langConfig"; 
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputbox";

const AddFunctionType = ({
  isOpen,
  onClose,
  selectedFunction,
  onSuccess = () => {},
}) => {
  const [debounceTimer, setDebounceTimer] = useState(null);
  const intl = useIntl();
  const langConfig = getLangConfig(); // ✅ Use shared util instead of local function

  const initialState = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
    startTime: null,
    endTime: null,
  };

  const capitalizeFirst = (value = "") =>
    value.charAt(0).toUpperCase() + value.slice(1);

  const validationSchema = Yup.object({
    nameEnglish: Yup.string().required("Name is required"),
    startTime: Yup.mixed().required("Start Time is required"),
    endTime: Yup.mixed().required("End Time is required"),
  });

  const formik = useFormik({
    initialValues: initialState,
    validationSchema,
    onSubmit: async (values) => {
      try {
        const Id = JSON.parse(localStorage.getItem("userId"));
        if (!Id) {
          message.error("User not logged in");
          return;
        }

        const payload = {
          nameEnglish: values.nameEnglish,
          nameGujarati: values.nameGujarati,
          nameHindi: values.nameHindi,
          startTime: values.startTime ? values.startTime.format("HH:mm A") : "",
          endTime: values.endTime ? values.endTime.format("HH:mm A") : "",
          userId: Id,
        };

        let res;

        if (selectedFunction) {
          res = await EditFunctionById(selectedFunction.id, payload);
          if (res?.data?.success === false) {
            Swal.fire("Error", res?.data?.msg || "Something went wrong", "error");
            return;
          }
          Swal.fire("Success", "Function updated successfully!", "success");
        } else {
          res = await AddFunction(payload);
          if (res?.data?.success === false) {
            Swal.fire("Error", res?.data?.msg || "Something went wrong", "error");
            return;
          }
          Swal.fire("Success", "Function added successfully!", "success");
        }

        onClose(false);
        onSuccess();
      } catch (err) {
        console.error("Error saving function:", err);
        Swal.fire("Error", "Failed to save function", "error");
      }
    },
    enableReinitialize: true,
  });

  const formData = {
    nameEnglish: formik.values.nameEnglish,
    nameGujarati: formik.values.nameGujarati,
    nameHindi: formik.values.nameHindi,
  };

  const setFormData = (updated) => {
    Object.entries(updated).forEach(([key, val]) => {
      if (key === "nameEnglish") {
        formik.setFieldValue(key, capitalizeFirst(val));
      } else {
        formik.setFieldValue(key, val);
      }
    });
  };

  const triggerTranslate = (text) => {
    if (!text?.trim()) return;
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      Translateapi(text)
        .then((res) => {
          const { regional, hindi } = extractTranslations(res.data); // ✅ Use shared util
          formik.setFieldValue("nameGujarati", regional);
          formik.setFieldValue("nameHindi", hindi);
        })
        .catch((err) => console.error("Translation error:", err));
    }, 500);

    setDebounceTimer(timer);
  };

  useEffect(() => {
    if (formik.values.nameEnglish) {
      triggerTranslate(formik.values.nameEnglish);
    }
  }, [formik.values.nameEnglish]);

  useEffect(() => {
    if (selectedFunction) {
      formik.setValues({
        nameEnglish: selectedFunction.function_name || "",
        nameGujarati: selectedFunction.nameGujarati || "",
        nameHindi: selectedFunction.nameHindi || "",
        startTime: selectedFunction.start_time
          ? dayjs(selectedFunction.start_time, "HH:mm A")
          : null,
        endTime: selectedFunction.end_time
          ? dayjs(selectedFunction.end_time, "HH:mm A")
          : null,
      });
    } else {
      formik.resetForm({ values: initialState });
    }
  }, [selectedFunction, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#F2F7FB] rounded-xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {selectedFunction ? (
              <FormattedMessage
                id="USER.MASTER.EDIT_FUNCTION"
                defaultMessage="Edit Function"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.NEW_FUNCTION"
                defaultMessage="Create New Function"
              />
            )}
          </h2>
          <button onClick={() => onClose(false)} className="text-2xl text-gray-600">
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit}>

          <MultiLangInputBox
            label={intl.formatMessage({
              id: "COMMON.NAME",
              defaultMessage: "Name",
            })}
            formData={formData}
            setFormData={setFormData}
            error={formik.touched.nameEnglish && formik.errors.nameEnglish}
            cols={3}
            keys={{
              english: "nameEnglish",
              regional: "nameGujarati",
              hindi: "nameHindi",
            }}
          />

          {/* Time Pickers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex flex-col">
              <label className="form-label text-gray-600">
                <FormattedMessage
                  id="USER.MASTER.START_TIME"
                  defaultMessage="Start Time"
                />
                <span className="mandatory ms-0.5 text-base text-red-500 font-medium">*</span>
              </label>
              <TimePicker
                className="input"
                format="HH:mm A"
                use12Hours
                value={formik.values.startTime}
                onChange={(time) => formik.setFieldValue("startTime", time)}
              />
              {formik.touched.startTime && formik.errors.startTime && (
                <span className="text-red-500 text-sm">{formik.errors.startTime}</span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="form-label text-gray-600">
                <FormattedMessage
                  id="USER.MASTER.END_TIME"
                  defaultMessage="End Time"
                />
                <span className="mandatory ms-0.5 text-base text-red-500 font-medium">*</span>
              </label>
              <TimePicker
                className="input"
                format="HH:mm A"
                use12Hours
                value={formik.values.endTime}
                onChange={(time) => formik.setFieldValue("endTime", time)}
              />
              {formik.touched.endTime && formik.errors.endTime && (
                <span className="text-red-500 text-sm">{formik.errors.endTime}</span>
              )}
            </div>
          </div>

          {/* Buttons */}
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
              className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
            >
              {selectedFunction ? (
                <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
              ) : (
                <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFunctionType;