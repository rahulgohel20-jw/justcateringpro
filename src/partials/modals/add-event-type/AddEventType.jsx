import { useState, useEffect } from "react";
import { TimePicker } from "antd";
import {
  EditEventType,
  Addeventtype,
  AddFunction,
  Translateapi,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import * as Yup from "yup";
import { FormattedMessage, useIntl } from "react-intl";
import { extractTranslations } from "@/utils/langConfig";
import MultiLangInputBox from "../../../components/form-inputs/MultiLangInputbox";

const AddEventType = ({
  isModalOpen,
  setIsModalOpen,
  refreshData = () => {},
  selectedEvent,
}) => {
  const intl = useIntl();

  const [debounceTimer, setDebounceTimer] = useState(null);

  // Get logged-in user
  const userId = localStorage.getItem("userId");

  // ONLY user 356 can create Function
  const canSaveAsFunction = String(userId) === "356";

  // Toggle is OFF by default
const [alsoSaveAsFunction, setAlsoSaveAsFunction] =
  useState(canSaveAsFunction);
  const initialFormState = {
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
    startTime: null,
    endTime: null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const validationSchema = Yup.object().shape({
    nameEnglish: Yup.string().required("Name is required"),

    startTime: Yup.mixed().when([], {
      is: () => canSaveAsFunction && alsoSaveAsFunction,
      then: (schema) =>
        schema.required("Start Time is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    endTime: Yup.mixed().when([], {
      is: () => canSaveAsFunction && alsoSaveAsFunction,
      then: (schema) =>
        schema.required("End Time is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });

  // ----------------------------------------
  // Translation
  // ----------------------------------------
  const triggerTranslate = (text) => {
    if (!text?.trim()) return;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      Translateapi(text)
        .then((res) => {
          const { regional, hindi } = extractTranslations(res.data);

          setFormData((prev) => ({
            ...prev,
            nameGujarati: regional,
            nameHindi: hindi,
          }));
        })
        .catch((err) =>
          console.error("Translation error:", err)
        );
    }, 500);

    setDebounceTimer(timer);
  };

  // ----------------------------------------
  // Reset form
  // ----------------------------------------
  useEffect(() => {
    if (selectedEvent) {
      setFormData({
        nameEnglish: selectedEvent.event_type || "",
        nameGujarati: selectedEvent.nameGujarati || "",
        nameHindi: selectedEvent.nameHindi || "",
        startTime: null,
        endTime: null,
      });
    } else {
      setFormData(initialFormState);
    }

    setErrors({});

    // Always reset toggle
    setAlsoSaveAsFunction(canSaveAsFunction);
  }, [selectedEvent]);

  // ----------------------------------------
  // Translation when English name changes
  // ----------------------------------------
  useEffect(() => {
    if (formData.nameEnglish) {
      triggerTranslate(formData.nameEnglish);
    }
  }, [formData.nameEnglish]);

  // ----------------------------------------
  // Submit
  // ----------------------------------------
  const handleSubmit = async () => {
    try {
      await validationSchema.validate(formData, {
        abortEarly: false,
      });

      setErrors({});

      const Id = localStorage.getItem("userId");

      if (!Id) {
        Swal.fire(
          "Error",
          "User data not found",
          "error"
        );
        return;
      }

      // ----------------------------------------
      // EVENT TYPE PAYLOAD
      // This is called for EVERY USER
      // ----------------------------------------
      const payload = {
        nameEnglish: formData.nameEnglish,
        nameGujarati: formData.nameGujarati,
        nameHindi: formData.nameHindi,
        userId: Id,
      };

      const apiCalls = [];

      // Add / Edit Event Type
      const eventCallPromise = selectedEvent
        ? EditEventType(
            selectedEvent.eventid,
            payload
          )
        : Addeventtype(payload);

      apiCalls.push(eventCallPromise);

      // ----------------------------------------
      // FUNCTION API
      // ONLY USER 356 + TOGGLE ON
      // ----------------------------------------
      if (
        String(Id) === "356" &&
        alsoSaveAsFunction
      ) {
        const functionPayload = {
          nameEnglish: formData.nameEnglish,
          nameGujarati: formData.nameGujarati,
          nameHindi: formData.nameHindi,
          startTime: formData.startTime
            ? formData.startTime.format("HH:mm A")
            : "",
          endTime: formData.endTime
            ? formData.endTime.format("HH:mm A")
            : "",
          userId: Id,
        };

        apiCalls.push(
          AddFunction(functionPayload)
        );
      }

      // ----------------------------------------
      // Execute APIs
      // ----------------------------------------
      const results = await Promise.all(apiCalls);

      const failed = results.find(
        (res) => res?.data?.success === false
      );

      if (failed) {
        Swal.fire(
          "Error",
          failed?.data?.msg ||
            "Something went wrong",
          "error"
        );
        return;
      }

      // ----------------------------------------
      // Success message
      // ----------------------------------------
      let successMessage;

      if (
        String(Id) === "356" &&
        alsoSaveAsFunction
      ) {
        successMessage =
          "Event and Function saved successfully!";
      } else if (selectedEvent) {
        successMessage =
          "Event updated successfully!";
      } else {
        successMessage =
          "Event added successfully!";
      }

      Swal.fire(
        "Success",
        successMessage,
        "success"
      );

      setIsModalOpen(false);
      refreshData(!selectedEvent);
    } catch (err) {
      console.error("Submit Error:", err);

      if (err.inner) {
        const formErrors = {};

        err.inner.forEach(
          (validationError) => {
            formErrors[validationError.path] =
              validationError.message;
          }
        );

        setErrors(formErrors);
      }
    }
  };

  // Important: return AFTER hooks
  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#F2F7FB] rounded-xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">
            {selectedEvent ? (
              <FormattedMessage
                id="USER.MASTER.EDIT_EVENT_TYPE"
                defaultMessage="Edit Event"
              />
            ) : (
              <FormattedMessage
                id="USER.MASTER.ADD_EVENT_TYPE"
                defaultMessage="Create New Event"
              />
            )}
          </h2>

          <button
            onClick={() =>
              setIsModalOpen(false)
            }
            className="text-2xl text-gray-600"
          >
            &times;
          </button>
        </div>

        {/* Name */}
        <MultiLangInputBox
          label={intl.formatMessage({
            id: "COMMON.NAME",
            defaultMessage: "Name",
          })}
          formData={formData}
          setFormData={setFormData}
          error={errors.nameEnglish}
          cols={3}
          keys={{
            english: "nameEnglish",
            regional: "nameGujarati",
            hindi: "nameHindi",
          }}
        />

        {/* ----------------------------------------
            FUNCTION TOGGLE
            ONLY USER 356
        ---------------------------------------- */}
        {canSaveAsFunction && (
          <div className="flex items-center justify-between mt-6 bg-white rounded-lg px-4 py-3 border border-gray-200">
            <label className="text-gray-700 font-medium">
              <FormattedMessage
                id="USER.MASTER.ALSO_SAVE_AS_FUNCTION"
                defaultMessage="Also save as Function"
              />
            </label>

            <button
              type="button"
              role="switch"
              aria-checked={
                alsoSaveAsFunction
              }
              onClick={() =>
                setAlsoSaveAsFunction(
                  (prev) => !prev
                )
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                alsoSaveAsFunction
                  ? "bg-primary"
                  : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  alsoSaveAsFunction
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        )}

        {/* ----------------------------------------
            TIME PICKERS
            ONLY USER 356 + TOGGLE ON
        ---------------------------------------- */}
        {canSaveAsFunction &&
          alsoSaveAsFunction && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

              {/* Start Time */}
              <div className="flex flex-col">
                <label className="form-label text-gray-600">
                  <FormattedMessage
                    id="USER.MASTER.START_TIME"
                    defaultMessage="Start Time"
                  />

                  <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                    *
                  </span>
                </label>

                <TimePicker
                  className="input"
                  format="HH:mm A"
                  use12Hours
                  placeholder="Select time"
                  value={formData.startTime}
                  onChange={(time) =>
                    setFormData((prev) => ({
                      ...prev,
                      startTime: time,
                    }))
                  }
                />

                {errors.startTime && (
                  <span className="text-red-500 text-sm">
                    {errors.startTime}
                  </span>
                )}
              </div>

              {/* End Time */}
              <div className="flex flex-col">
                <label className="form-label text-gray-600">
                  <FormattedMessage
                    id="USER.MASTER.END_TIME"
                    defaultMessage="End Time"
                  />

                  <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                    *
                  </span>
                </label>

                <TimePicker
                  className="input"
                  format="HH:mm A"
                  use12Hours
                  placeholder="Select time"
                  value={formData.endTime}
                  onChange={(time) =>
                    setFormData((prev) => ({
                      ...prev,
                      endTime: time,
                    }))
                  }
                />

                {errors.endTime && (
                  <span className="text-red-500 text-sm">
                    {errors.endTime}
                  </span>
                )}
              </div>
            </div>
          )}

        {/* Buttons */}
        <div className="flex w-full justify-end mt-6 gap-3">
          <button
            type="button"
            onClick={() =>
              setIsModalOpen(false)
            }
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <FormattedMessage
              id="COMMON.CANCEL"
              defaultMessage="Cancel"
            />
          </button>

          <button
            type="button"
            className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-primary/90 transition"
            onClick={handleSubmit}
          >
            {selectedEvent ? (
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

      </div>
    </div>
  );
};

export default AddEventType;