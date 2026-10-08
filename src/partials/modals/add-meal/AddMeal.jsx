import { useEffect, useRef } from "react";
import {
  AddMealType,
  EditMealType,
  Translateapi,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormattedMessage, useIntl } from "react-intl";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputbox";

const validationSchema = Yup.object().shape({
  nameEnglish: Yup.string().required("Name is required"),
});

const AddMeal = ({ isOpen, onClose, refreshData, selectedMeal }) => {
  const intl = useIntl();
  const langConfig = getLangConfig();
  const loadedEnglishRef = useRef("");
  const debounceRef = useRef(null);

  const initialValues = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
    isJainSlogan: false,
  };

  // 1. formik must be declared BEFORE any effect that reads it
  const formik = useFormik({
    initialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      const Id = localStorage.getItem("userId");
      if (!Id) {
        Swal.fire("Error", "User data not found", "error");
        return;
      }

      try {
        const payload = { ...values, userId: Id };
        const res = selectedMeal
          ? await EditMealType(selectedMeal.mealid, payload)
          : await AddMealType(payload);

        if (res?.data?.success === false) {
          Swal.fire("Error", res.data.msg || "Something went wrong", "error");
          return;
        }

        await Swal.fire(
          "Success",
          selectedMeal
            ? "Meal Type updated successfully"
            : "Meal Type added successfully",
          "success",
        );

        onClose(false);
        refreshData(true); // re-calls GetMealType in MealMaster
      } catch (err) {
        console.error("Error submitting meal:", err);
        Swal.fire("Error", "Something went wrong", "error");
      }
    },
  });

  // 2. translate helper (runs later, so it can safely use formik)
  const triggerTranslate = (text) => {
    if (!text?.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      Translateapi(text)
        .then((res) => {
          const { regional, hindi } = extractTranslations(res.data);
          formik.setFieldValue("nameGujarati", regional);
          formik.setFieldValue("nameHindi", hindi);
        })
        .catch((err) => console.error("Translation error:", err));
    }, 500);
  };

  // 3. effects (one of each)
  useEffect(() => {
    const text = formik.values.nameEnglish;
    if (!text || text === loadedEnglishRef.current) return;
    triggerTranslate(text);
  }, [formik.values.nameEnglish]);

  useEffect(() => {
    if (selectedMeal) {
      loadedEnglishRef.current = selectedMeal.nameEnglish || "";
      formik.setValues({
        nameEnglish: selectedMeal.nameEnglish || "",
        nameGujarati: selectedMeal.nameGujarati || "",
        nameHindi: selectedMeal.nameHindi || "",
        isJainSlogan: !!selectedMeal.isJainSlogan,
      });
    } else {
      loadedEnglishRef.current = "";
      formik.resetForm();
    }
  }, [selectedMeal, isOpen]);

  // clear pending timer on unmount
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  const formData = {
    nameEnglish: formik.values.nameEnglish,
    nameGujarati: formik.values.nameGujarati,
    nameHindi: formik.values.nameHindi,
  };

  const setFormData = (updated) => {
    Object.entries(updated).forEach(([key, val]) => {
      formik.setFieldValue(key, val);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#F2F7FB] rounded-xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {selectedMeal ? (
              <FormattedMessage
                id="USER.MASTER.EDIT_MEAL"
                defaultMessage="Edit Food Prefrence"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.NEW_MEAL"
                defaultMessage="Create New Food Prefrence"
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
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={formik.values.isJainSlogan}
              onClick={() =>
                formik.setFieldValue("isJainSlogan", !formik.values.isJainSlogan)
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formik.values.isJainSlogan ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  formik.values.isJainSlogan ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-gray-700">Jain</span>
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
              {selectedMeal ? (
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

export default AddMeal;