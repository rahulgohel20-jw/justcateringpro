import { useEffect, useState } from "react";
import {
  AddThemeType,
  Translateapi,
  GettemplatebyuserId,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import AddTemplateName from "../Template-modal/AddTemplateName";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";


const TemplateType = ({ isOpen, onClose, rawdata, refreshData }) => {
  if (!isOpen) return null;
  const langConfig = getLangConfig();
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isRawModalOpen, setIsRawModalOpen] = useState(false);


  const initialValues = {
    templateModuleId: rawdata?.templateModuleId || "",
    nameEnglish: rawdata?.nameEnglish || "",
    nameGujarati: rawdata?.nameGujarati || "",
    nameHindi: rawdata?.nameHindi || "",
    sequence: rawdata?.sortorder || "",
    namePlateType: rawdata?.namePlateType || "",
    isDate:rawdata?.isDate || "",
  };

  const validationSchema = Yup.object().shape({
    templateModuleId: Yup.string().required("Category is required"),
    nameEnglish: Yup.string().required("Name is required"),
    sequence: Yup.number().required("Sequence is required"),
  });

  useEffect(() => {
    FetchCategories();
  }, []);

  const FetchCategories = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const res = await GettemplatebyuserId(userId);
      setCategories(res?.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const triggerTranslate = (text, setFieldValue) => {
    if (!text?.trim()) return;
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
     Translateapi(text).then((res) => {
  const { regional, hindi } = extractTranslations(res.data);
  setFieldValue("nameGujarati", regional);
  setFieldValue("nameHindi", hindi);
});
    }, 500);

    setDebounceTimer(timer);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const payload = {
        id: rawdata?.rawid ?? -1,
        nameEnglish: values.nameEnglish,
        nameGujarati: values.nameGujarati,
        nameHindi: values.nameHindi,
        templateModuleId: Number(values.templateModuleId),
        sortorder: Number(values.sequence),
        namePlateType: values.namePlateType,
        isDate:values.isDate,
      };

      const response = await AddThemeType(payload);

      if (response?.data?.success === true) {
        Swal.fire({
          title: response?.data?.msg || "Success",
          icon: "success",
          confirmButtonColor: "#005BA8",
        });
        refreshData();
        onClose();
      } else {
        Swal.fire({
          title: response?.data?.msg || "Error",
          icon: "error",
        });
      }
    } catch (error) {
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
      <div className="bg-white rounded-xl w-[90%] md:w-[60%] lg:w-[40%] xl:w-[35%] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {rawdata ? "Edit Template Name" : "Create Theme Type"}
          </h2>
          <button onClick={() => onClose(false)} className="text-2xl">
            &times;
          </button>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, setFieldValue, isSubmitting }) => {
            useEffect(() => {
              if (values.nameEnglish) {
                triggerTranslate(values.nameEnglish, setFieldValue);
              }
            }, [values.nameEnglish]);

            return (
              <Form>
                {/* CATEGORY */}
                <label className="block mb-1">
                  Template Category<span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Field
                    as="select"
                    name="templateModuleId"
                    className="border rounded-lg p-2 w-full"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.nameEnglish}
                      </option>
                    ))}
                  </Field>

                  <button
                    type="button"
                    className="w-10 h-10 border rounded-lg text-xl font-bold"
                    onClick={() => {
                      setIsRawModalOpen(true);
                    }}
                  >
                    +
                  </button>
                </div>
                <ErrorMessage
                  name="templateModuleId"
                  component="div"
                  className="text-red-500 text-sm"
                />

                {/* NAME */}
                <label className="block mt-4 mb-1">
                  English Name<span className="text-red-500">*</span>
                </label>
                <Field
                  name="nameEnglish"
                  className="border rounded-lg p-2 w-full"
                />
                <ErrorMessage
                  name="nameEnglish"
                  component="div"
                  className="text-red-500 text-sm"
                />

                <label className="block mt-4 mb-1">{langConfig.label}</label>
<Field
  name="nameGujarati"
  disabled
  placeholder={langConfig.label}
  className="border rounded-lg p-2 w-full"
/>

                <label className="block mt-4 mb-1">Hindi Name</label>
                <Field
                  name="nameHindi"
                  disabled
                  className="border rounded-lg p-2 w-full"
                />

                <label className="block mt-4 mb-1">
                  Sequence<span className="text-red-500">*</span>
                </label>
                <Field
                  name="sequence"
                  className="border rounded-lg p-2 w-full"
                />
                <ErrorMessage
                  name="sequence"
                  component="div"
                  className="text-red-500 text-sm"
                />
                <label className="block mt-4 mb-1">Name Plate Type</label>
                <Field
                  name="namePlateType"
                  className="border rounded-lg p-2 w-full"
                />
                   <label className="block mt-4 mb-1">Date Type</label>
                <Field
                  name="isDate"
                  className="border rounded-lg p-2 w-full"
                />

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
  <button type="button" onClick={() => onClose(false)} className="border px-4 py-2 rounded-lg w-full sm:w-auto">
    Cancel
  </button>
  <button type="submit" disabled={isSubmitting} className="bg-primary text-white px-5 py-2 rounded-lg w-full sm:w-auto">
    {rawdata ? "Update" : "Save"}
  </button>
</div>
              </Form>
            );
          }}
        </Formik>
      </div>

      <AddTemplateName
        isOpen={isRawModalOpen}
        onClose={setIsRawModalOpen}
        refreshData={FetchCategories}
      />
    </div>
  );
};

export default TemplateType;
