import { useEffect, useState } from "react";
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
  const [debounceTimer, setDebounceTimer] = useState(null);
  const langConfig = getLangConfig();

  const initialValues = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
  };

  const triggerTranslate = (text) => {
    if (!text?.trim()) return;
    if (debounceTimer) clearTimeout(debounceTimer);

    const timer = setTimeout(() => {
      Translateapi(text)
        .then((res) => {
          const { regional, hindi } = extractTranslations(res.data);
          formik.setFieldValue("nameGujarati", regional);
          formik.setFieldValue("nameHindi", hindi);
        })
        .catch((err) => console.error("Translation error:", err));
    }, 500);

    setDebounceTimer(timer);
  };

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const Id = localStorage.getItem("userId");
      if (!Id) {
        Swal.fire("Error", "User data not found", "error");
        return;
      }

      try {
        const payload = { ...values, userId: Id };

        if (selectedMeal) {
          const res = await EditMealType(selectedMeal.mealid, payload);
          if (res?.data.success === false) {
            Swal.fire("Error", res.data.msg || "Something went wrong", "error");
            return;
          }
          Swal.fire(
            intl.formatMessage({ id: "COMMON.SUCCESS" }),
            intl.formatMessage({ id: "USER.MASTER.MEAL_UPDATED_SUCCESS" }),
            "success",
          );
        } else {
          const res = await AddMealType(payload);
          if (res?.data.success === false) {
            Swal.fire("Error", res.data.msg || "Something went wrong", "error");
            return;
          }
          Swal.fire(
            intl.formatMessage({ id: "COMMON.SUCCESS", defaultMessage: "Save" }),
            intl.formatMessage({
              id: "USER.MASTER.MEAL_ADDED_SUCCESS",
              defaultMessage: "Meal Type is Added Successfull",
            }),
            "success",
          );

          onClose();
          refreshData(true);
        }
      } catch (err) {
        console.error("Error submitting meal:", err);
        Swal.fire("Error", "Something went wrong", "error");
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
      formik.setFieldValue(key, val);
    });
  };

  useEffect(() => {
    if (formik.values.nameEnglish) {
      triggerTranslate(formik.values.nameEnglish);
    }
  }, [formik.values.nameEnglish]);

  useEffect(() => {
    if (selectedMeal) {
      formik.setValues({
        nameEnglish: selectedMeal.meal_type || "",
        nameGujarati: selectedMeal.nameGujarati || "",
        nameHindi: selectedMeal.nameHindi || "",
      });
    } else {
      formik.resetForm();
    }
  }, [selectedMeal, isOpen]);

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