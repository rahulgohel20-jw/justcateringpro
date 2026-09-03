import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useEffect } from "react";
import {
  AddLabourShift,
  EditLabourShiftAPI,
  Translateapi,
} from "@/services/apiServices";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputBox"; 

const AddLabourshift = ({ isOpen, onClose, shiftData, refreshData }) => {
  if (!isOpen) return null;
  const langConfig = getLangConfig();

  const initialFormState = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
    time: "",
    isActive: true,
    transportationPrice: "",
  };

  const validationSchema = Yup.object().shape({
    nameEnglish: Yup.string().required("Shift name is required"),
    time: Yup.string().matches(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Time must be in HH:mm 24-hour format",
    ),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const Id = localStorage.getItem("userId");
      if (!Id) return alert("User data not found");

      const payload = {
        nameEnglish: values.nameEnglish,
        nameGujarati: values.nameGujarati,
        nameHindi: values.nameHindi,
        shifttime: values.time,
        userId: Id,
        price: Number(values.transportationPrice),
      };

      let response;
      if (shiftData) {
        response = await EditLabourShiftAPI(shiftData.id, payload);
      } else {
        response = await AddLabourShift(payload);
      }

      if (response?.data?.success == true) {
        Swal.fire("Success!", response.data.msg || "Operation successful", "success");
        refreshData();
        onClose();
        resetForm();
      } else {
        Swal.fire("Error!", error.response?.data?.msg || "Something went wrong!", "error");
      }
    } catch (error) {
 
  Swal.fire(
    "Error!",
    error.response?.data?.msg || "Something went wrong!", 
    "error"
  );
} finally {
  setSubmitting(false);
}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {shiftData ? "Edit Labour Shift" : "Create Labour Shift"}
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
                  nameEnglish: shiftData.shift_name || "",
                  nameGujarati: shiftData.nameGujarati || "",
                  nameHindi: shiftData.nameHindi || "",
                  time: shiftData.shift_time || "",
                  isActive: shiftData.isActive ?? true,
                  transportationPrice: shiftData?.transportationPrice || "",
                }
              : initialFormState
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, errors, touched, isSubmitting }) => {
            
            const formData = {
              nameEnglish: values.nameEnglish,
              nameGujarati: values.nameGujarati,
              nameHindi: values.nameHindi,
            };

            const setFormData = (updated) => {
              if (updated.nameEnglish !== values.nameEnglish)
                setFieldValue("nameEnglish", updated.nameEnglish);
              if (updated.nameGujarati !== values.nameGujarati)
                setFieldValue("nameGujarati", updated.nameGujarati);
              if (updated.nameHindi !== values.nameHindi)
                setFieldValue("nameHindi", updated.nameHindi);
            };

         
         useEffect(() => {
  if (!values.nameEnglish?.trim()) return;
  const timer = setTimeout(() => {
    Translateapi(values.nameEnglish)
      .then((res) => {
        const { regional, hindi } = extractTranslations(res.data);
        setFieldValue("nameGujarati", regional);
        setFieldValue("nameHindi", hindi);
      })
      .catch(() => console.warn("Translation failed"));
  }, 500);
  return () => clearTimeout(timer);
}, [values.nameEnglish]); // ← removed shiftData from deps, removed early return

            return (
              <Form>
                <div className="grid grid-cols-1 gap-4 mb-4">

                  {/* ✅ MultiLangInputBox replaces the 3 separate name fields */}
                  <MultiLangInputBox
                    label="Shift Name"
                    formData={formData}
                    setFormData={setFormData}
                    cols={1}  // ✅ one column as requested
                    keys={{
                      english: "nameEnglish",
                      regional: "nameGujarati",
                      hindi: "nameHindi",
                    }}
                    error={touched.nameEnglish && errors.nameEnglish}
                  />

                  <InputWithFormik
                    label="Transportation Price"
                    name="transportationPrice"
                    type="tel"
                  />
                </div>

                <TimePickerField
                  name="time"
                  label="Time (HH:mm)*"
                  value={values.time}
                  setFieldValue={setFieldValue}
                />

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => onClose(false)}
                    className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                  >
                    {shiftData ? "Update" : "Save"}
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

// kept for Transportation Price
const InputWithFormik = ({ label, name, type = "text" }) => (
  <div className="flex flex-col">
    <label className="text-gray-600 mb-1">{label}</label>
    <Field
      type={type}
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

const TimePickerField = ({ name, label, value, setFieldValue }) => (
  <div className="mb-6">
    <label className="text-gray-700 mb-1 block">{label}:</label>
    <Field
      type="time"
      name={name}
      value={value}
      onChange={(e) => setFieldValue(name, e.target.value)}
      className="border border-gray-300 rounded-lg p-2 w-48"
      placeholder="HH:mm"
    />
    <ErrorMessage
      name={name}
      component="div"
      className="text-red-500 text-sm mt-1"
    />
  </div>
);

export default AddLabourshift;