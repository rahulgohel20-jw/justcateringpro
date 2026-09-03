import { useEffect, useState } from "react";
import {
  AddExtraExpenseApi,
  EditMealType,
  Translateapi,
  GetEventMasterById,
  UpdateExtraExpense,
} from "@/services/apiServices";
import InputToTextLang from "@/components/form-inputs/InputToTextLang";
import Swal from "sweetalert2";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FormattedMessage, useIntl } from "react-intl";
import { getLangConfig, extractTranslations } from "@/utils/langConfig";

const validationSchema = Yup.object().shape({
  nameEnglish: Yup.string().required("Name is required"),
  quantity: Yup.number()
    .required("Quantity is required")
    .min(1, "Must be greater than 0"),
  price: Yup.number()
    .required("Price is required")
    .min(0, "Must be greater than or equal to 0"),
});

const AddExtraExpense = ({
  isOpen,
  onClose,
  refreshData,
  selectedMeal,
  eventData: propEventData,
}) => {
  const intl = useIntl();
  const langConfig = getLangConfig();
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [eventData, setEventData] = useState(null);

  const initialValues = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
    quantity: "",
    price: "",
    total: "",
  };

  // ✅ Auto-translate when typing English name
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

      const eventId = eventData?.eventId || eventData?.id || 0;
      const eventFunctionId = eventData?.eventFunctionId || 0;

      const payload = {
        eventFunctionId,
        eventId,
        nameEnglish: values.nameEnglish,
        nameGujarati: values.nameGujarati,
        nameHindi: values.nameHindi,
        price: Number(values.price),
        qty: Number(values.quantity),
        totalprice: Number(values.quantity) * Number(values.price),
        userId: Id,
      };

      try {
        if (selectedMeal) {
          const res = await UpdateExtraExpense(selectedMeal.id, payload);

          if (res?.data.success === false) {
            Swal.fire("Error", res.data.msg || "Something went wrong", "error");
            return;
          }

          Swal.fire({
            text: intl.formatMessage({
              id: "USER.MASTER.MEAL_UPDATED_SUCCESS",
              defaultMessage: "Expense updated successfully",
            }),
            icon: "success",
          });
        } else {
          const res = await AddExtraExpenseApi(payload);
          if (res?.data.success === false) {
            Swal.fire("Error", res.data.msg || "Something went wrong", "error");
            return;
          }

          Swal.fire({
            text: intl.formatMessage({
              id: "USER.MASTER.MEAL_ADDED_SUCCESS",
              defaultMessage: "Expense added successfully",
            }),
            icon: "success",
          });
        }

        // Call refreshData only if it's provided
        if (typeof refreshData === "function") {
          refreshData();
        }

        onClose(false);
      } catch (err) {
        console.error("Error submitting expense:", err);
        Swal.fire("Error", "Something went wrong", "error");
      }
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    if (isOpen && !propEventData) {
      const eventId =
        localStorage.getItem("currentEventId") ||
        new URLSearchParams(window.location.search).get("eventId");
      if (eventId) {
        GetEventMasterById(eventId)
          .then((res) => {
            const eventDetails = res?.data?.data?.["Event Details"]?.[0];
            if (eventDetails) {
              const eventFunctionId =
                eventDetails?.eventFunctions?.[0]?.id || 0;
              setEventData({
                ...eventDetails,
                eventId: eventDetails.id,
                eventFunctionId,
              });
            }
          })
          .catch((err) => console.error("Error fetching event:", err));
      }
    } else if (propEventData) {
      const eventFunctionId =
        propEventData?.eventFunctions?.[0]?.id ||
        propEventData?.eventFunctionId ||
        0;
      setEventData({
        ...propEventData,
        eventFunctionId,
        eventId: propEventData?.id || 0,
      });
    }
  }, [isOpen, propEventData]);

  // ✅ Auto-translate name when typing
  useEffect(() => {
    if (formik.values.nameEnglish) {
      triggerTranslate(formik.values.nameEnglish);
    }
  }, [formik.values.nameEnglish]);

  // ✅ Pre-fill data when editing
  useEffect(() => {
    if (selectedMeal) {
      formik.setValues({
        nameEnglish:
          selectedMeal.nameEnglish ||
          selectedMeal.name ||
          selectedMeal.name_en ||
          "",
        nameGujarati: selectedMeal.nameGujarati || selectedMeal.name_gu || "",
        nameHindi: selectedMeal.nameHindi || selectedMeal.name_hi || "",
        quantity: selectedMeal.qty || selectedMeal.quantity || "",
        price: selectedMeal.price || selectedMeal.rate || "",
        total:
          selectedMeal.totalprice ||
          selectedMeal.total ||
          (selectedMeal.qty || selectedMeal.quantity || 0) *
            (selectedMeal.price || selectedMeal.rate || 0) ||
          "",
      });
    } else {
      formik.resetForm();
    }
  }, [selectedMeal, isOpen]);

  // ✅ Prevent rendering when modal is closed
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
                defaultMessage="Edit Expense"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.NEW_MEAL"
                defaultMessage="New Expense"
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

        {/* Form */}
        <form onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* English */}
            <InputToTextLang
              label={
                <FormattedMessage
                  id="COMMON.NAME_ENGLISH"
                  defaultMessage="Name (English)"
                />
              }
              placeholder={intl.formatMessage({
                id: "COMMON.ENTER_NAME_ENGLISH",
                defaultMessage: "Enter Name (English)",
              })}
              name="nameEnglish"
              value={formik.values.nameEnglish}
              onChange={(e) =>
                formik.setFieldValue("nameEnglish", e.target.value)
              }
              lng="en-US"
              required
              error={formik.touched.nameEnglish && formik.errors.nameEnglish}
            />

            {/* Gujarati */}
            <InputToTextLang
  label={
    <FormattedMessage
      id={langConfig.nameIntlId}
      defaultMessage={langConfig.label}
    />
  }
  placeholder={intl.formatMessage({
    id:             langConfig.nameIntlId,
    defaultMessage: langConfig.placeholder,
  })}
  name="nameGujarati"
  value={formik.values.nameGujarati}
  onChange={(e) => formik.setFieldValue("nameGujarati", e.target.value)}
  lng={langConfig.lng}
/>

            {/* Hindi */}
            <InputToTextLang
              label={
                <FormattedMessage
                  id="COMMON.NAME_HINDI"
                  defaultMessage="Name (हिंदी)"
                />
              }
              placeholder={intl.formatMessage({
                id: "COMMON.ENTER_NAME_HINDI",
                defaultMessage: "Enter Name (हिंदी)",
              })}
              name="nameHindi"
              value={formik.values.nameHindi}
              onChange={(e) =>
                formik.setFieldValue("nameHindi", e.target.value)
              }
              lng="hi"
            />
          </div>

          {/* Quantity / Price / Total */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <FormattedMessage id="COMMON.QTY" defaultMessage="Quantity *" />
              </label>
              <input
                type="tel"
                name="quantity"
                value={formik.values.quantity || ""}
                onChange={(e) => {
                  const qty = Number(e.target.value);
                  const price = Number(formik.values.price || 0);
                  formik.setFieldValue("quantity", qty);
                  formik.setFieldValue("total", qty * price);
                }}
                className="input input-sm w-full border border-gray-300 rounded-md px-4 py-4 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Enter quantity"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <FormattedMessage id="COMMON.PRICE" defaultMessage="Price *" />
              </label>
              <input
                type="tel"
                name="price"
                value={formik.values.price || ""}
                onChange={(e) => {
                  const price = Number(e.target.value);
                  const qty = Number(formik.values.quantity || 0);
                  formik.setFieldValue("price", price);
                  formik.setFieldValue("total", qty * price);
                }}
                className="input input-sm w-full border border-gray-300 rounded-md px-4 py-4 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Enter price"
                required
              />
            </div>

            {/* Total */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <FormattedMessage id="COMMON.TOTAL" defaultMessage="Total *" />
              </label>
              <input
                type="tel"
                name="total"
                value={formik.values.total || ""}
                readOnly
                className="input input-sm w-full border border-gray-300 rounded-md px-4 py-4"
                placeholder="Auto calculated"
              />
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

export default AddExtraExpense;
