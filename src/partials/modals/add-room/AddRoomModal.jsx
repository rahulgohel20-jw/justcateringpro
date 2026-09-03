import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useEffect, useRef, useState } from "react";
import { AddRoom, UpdateRoom, Translateapi } from "../../../services/apiServices";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputBox";
import { FormattedMessage, useIntl } from "react-intl";

const AddRoomModal = ({ isOpen, onClose, roomData, refreshData }) => {
  if (!isOpen) return null;

  const intl = useIntl();
  const [isTranslating, setIsTranslating] = useState(false);
  const translateTimerRef = useRef(null);

  const initialFormState = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
    price: "",
    isActive: true,
  };

  const validationSchema = Yup.object().shape({
    nameEnglish: Yup.string()
      .trim()
      .required(
        intl.formatMessage({
          id: "ROOM.VALIDATION.NAME_ENGLISH_REQUIRED",
          defaultMessage: "Room name (English) is required",
        })
      ),
    nameGujarati: Yup.string()
      .trim()
      .required(
        intl.formatMessage({
          id: "ROOM.VALIDATION.NAME_GUJARATI_REQUIRED",
          defaultMessage: "Room name (Gujarati) is required",
        })
      ),
    nameHindi: Yup.string()
      .trim()
      .required(
        intl.formatMessage({
          id: "ROOM.VALIDATION.NAME_HINDI_REQUIRED",
          defaultMessage: "Room name (Hindi) is required",
        })
      ),
    price: Yup.number()
      .typeError(
        intl.formatMessage({
          id: "ROOM.VALIDATION.PRICE_NUMBER",
          defaultMessage: "Price must be a number",
        })
      )
      .min(
        0,
        intl.formatMessage({
          id: "ROOM.VALIDATION.PRICE_NEGATIVE",
          defaultMessage: "Price cannot be negative",
        })
      )
      .required(
        intl.formatMessage({
          id: "ROOM.VALIDATION.PRICE_REQUIRED",
          defaultMessage: "Price is required",
        })
      ),
  });

  // ─── Debounced translation on English input ────────────────────────────────
  const handleEnglishChange = (e, setFieldValue) => {
    const value = e.target.value;
    setFieldValue("nameEnglish", value);

    if (translateTimerRef.current) clearTimeout(translateTimerRef.current);

    if (!value.trim()) {
      setFieldValue("nameGujarati", "");
      setFieldValue("nameHindi", "");
      return;
    }

    translateTimerRef.current = setTimeout(async () => {
      try {
        setIsTranslating(true);
        const res = await Translateapi(encodeURIComponent(value.trim()));
        const data = res?.data?.data || res?.data || {};

        if (data.gujarati) setFieldValue("nameGujarati", data.gujarati);
        if (data.hindi) setFieldValue("nameHindi", data.hindi);
      } catch (err) {
        console.error("Translation failed:", err);
      } finally {
        setIsTranslating(false);
      }
    }, 600);
  };

  useEffect(() => {
    return () => {
      if (translateTimerRef.current) clearTimeout(translateTimerRef.current);
    };
  }, []);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId)
        return alert(
          intl.formatMessage({
            id: "COMMON.USER_DATA_NOT_FOUND",
            defaultMessage: "User data not found",
          })
        );

      const payload = {
        nameEnglish: values.nameEnglish.trim(),
        nameGujarati: values.nameGujarati.trim(),
        nameHindi: values.nameHindi.trim(),
        price: Number(values.price),
        isActive: values.isActive,
        userId: Number(userId),
      };

      let response;

      if (roomData) {
        response = await UpdateRoom(roomData.id, payload);
      } else {
        response = await AddRoom(payload);
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
          timer: 1500,
          showConfirmButton: false,
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
      console.error("Error saving room:", error);
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
            {roomData ? (
              <FormattedMessage id="ROOM.EDIT_ROOM" defaultMessage="Edit Room" />
            ) : (
              <FormattedMessage id="ROOM.CREATE_ROOM" defaultMessage="Create Room" />
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
            roomData
              ? {
                  nameEnglish: roomData.name_english || "",
                  nameGujarati: roomData.name_gujarati || "",
                  nameHindi: roomData.name_hindi || "",
                  price: roomData.price !== "-" ? roomData.price : "",
                  isActive: roomData.isActive ?? true,
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
                <MultiLangInputBox
                  label={intl.formatMessage({
                    id: "ROOM.ROOM_NAME",
                    defaultMessage: "Room Name",
                  })}
                  formData={values}
                  setFormData={(updated) => {
                    const englishChanged =
                      updated.nameEnglish !== values.nameEnglish;

                    setFieldValue("nameEnglish", updated.nameEnglish);
                    setFieldValue("nameGujarati", updated.nameGujarati);
                    setFieldValue("nameHindi", updated.nameHindi);

                    if (englishChanged) {
                      if (translateTimerRef.current)
                        clearTimeout(translateTimerRef.current);

                      if (!updated.nameEnglish.trim()) {
                        setFieldValue("nameGujarati", "");
                        setFieldValue("nameHindi", "");
                        return;
                      }

                      translateTimerRef.current = setTimeout(async () => {
                        try {
                          setIsTranslating(true);
                          const res = await Translateapi(
                            encodeURIComponent(updated.nameEnglish.trim())
                          );
                          const data = res?.data?.data || res?.data || {};
                          if (data.gujarati)
                            setFieldValue("nameGujarati", data.gujarati);
                          if (data.hindi) setFieldValue("nameHindi", data.hindi);
                        } catch (err) {
                          console.error("Translation failed:", err);
                        } finally {
                          setIsTranslating(false);
                        }
                      }, 600);
                    }
                  }}
                  cols={1}
                  keys={{
                    english: "nameEnglish",
                    regional: "nameGujarati",
                    hindi: "nameHindi",
                  }}
                  error={undefined}
                />

                {/* Price */}
                <InputWithFormik
                  label={intl.formatMessage({
                    id: "ROOM.PRICE_LABEL",
                    defaultMessage: "Price *",
                  })}
                  name="price"
                  type="number"
                  placeholder={intl.formatMessage({
                    id: "ROOM.PRICE_PLACEHOLDER",
                    defaultMessage: "e.g. 2500",
                  })}
                />

                {/* Is Active Toggle */}
                <div className="flex items-center gap-3">
                  <label className="text-gray-600 font-medium">
                    <FormattedMessage id="COMMON.ACTIVE" defaultMessage="Active" />
                  </label>
                  <label className="switch switch-lg">
                    <input
                      type="checkbox"
                      checked={values.isActive}
                      onChange={(e) =>
                        setFieldValue("isActive", e.target.checked)
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
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
                  ) : roomData ? (
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

// ─── Reusable Components ───────────────────────────────────────────────────────

const InputWithFormik = ({ label, name, type = "text", placeholder = "" }) => (
  <div className="flex flex-col">
    <label className="text-gray-600 mb-1">{label}</label>
    <Field
      type={type}
      name={name}
      placeholder={placeholder || label}
      className="border border-gray-300 rounded-lg p-2 w-full"
    />
    <ErrorMessage
      name={name}
      component="div"
      className="text-red-500 text-sm mt-1"
    />
  </div>
);

export default AddRoomModal;