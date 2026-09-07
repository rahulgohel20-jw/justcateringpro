import { Fragment, useState, useCallback, useMemo, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Container } from "@/components/container";
import StepsComponent from "@/components/StepsComponents";
import EventBasicInfoStep from "@/container/EventStepsContainer/EventBasicInfoStep";
import OtherInfoStep from "@/container/EventStepsContainer/OtherInfoStep";
import ClientDetailsStep from "@/container/EventStepsContainer/ClientDetailsStep";
import FunctionsDetails from "@/container/EventStepsContainer/FunctionDetails";
import {
  getEventValidationSchema,
  getStepValidationSchemas,
} from "./eventValidationSchema"
import {
  CreateEventMaster,
  GetEventMasterById,
  UpdateEventMaster,
  AddLogs,
  AvailabilityCheck,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import RoomDetailsStep from "../../../container/EventStepsContainer/RoomDetailsStep/RoomDetailsStep";
import { useModuleAccess } from "../../../hooks/useModuleAccess";

// const STEP_KEYS = ["basic_info", "client_info", "functions", "other"];

const getUserEmail = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return "";
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.user?.email || "";
  } catch {
    return "";
  }
};

const CreateEventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [originalShiftId, setOriginalShiftId] = useState(null);
  const { hasModuleAccess } = useModuleAccess();
const canAccessEventFlow = hasModuleAccess("Event Flow"); 
const [submitting, setSubmitting] = useState(false);  
const [eventid, setEventid] = useState(0);
const [isVenueTranslating, setIsVenueTranslating] = useState(false);

  const currentUserId = localStorage.getItem("userId");
  const ENABLE_ADVANCED_DATE_SYNC = currentUserId == 356;

  const eventPrefillAppliedRef = useRef(false);
  const functionPrefillAppliedRef = useRef(false);




  const mode = location.pathname.includes("/copy")
    ? "copy"
    : eventId
      ? "edit"
      : "create";

  const selectedDateFromCalendar = location.state?.event_date;

  const initialFormData = useMemo(() => {
    const today = dayjs();
    const defaultStartTime = today.hour(8).minute(0).second(0);
    const defaultEndTime = today.hour(12).minute(0).second(0);







    return {
      inquiryDate: dayjs().format("DD/MM/YYYY"),
      eventStartDateTime: defaultStartTime.format("DD/MM/YYYY hh:mm A"),
      eventEndDateTime: defaultEndTime.format("DD/MM/YYYY hh:mm A"),
      billingNameEnglish: "",
      prefix: "Mr.",
      billingNameGujarati: "",
      billingNameHindi: "",
      cordinatorPersonNameEnglish: "",
cordinatorPersonNameGujarati: "",
cordinatorPersonNameHindi: "",
cordinatorPersonContactNo: "",
      venueId: "",
      eventTypeId: "",
      managerId: "",
      partyId: "",
      customer_name: "",
      address: "",
      mobileno: "",
      eventFunction: [],
      mealTypeId: "",
      meal_notes: "",
      meal_notes_gujarati: "",
      meal_notes_hindi: "",
      remarksGujarati: "",
      service: "",
      serviceGujarati: "",
      serviceHindi: "",
      theme: "",
      themeGujarati: "",
      themeHindi: "",
      remark: "",
      banquetId: "ODC",
      shiftId: "",
      permissable_item: "",
not_permissable_item: "",
internal_staff_discussion: "",
rate_discussion: "",

    };
  }, []);

  const [formData, setFormData] = useState(initialFormData);
  const [current, setCurrent] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [shiftRefreshTrigger, setShiftRefreshTrigger] = useState(0);

const isPro = useMemo(() => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth-storage"));
    return ["jcxpro", "justbanq"].includes(auth?.state?.user?.softType);
  } catch {
    return false;
  }
}, []);


const skipFunctionsStep = canAccessEventFlow && String(formData.status) === "0"; 

const skipFunctionsValidation = canAccessEventFlow && 
  (String(formData.status) === "0" || String(formData.status) === "1");

const activeStepKeys = useMemo(() => {
  const keys = ["basic_info", "client_info"];
  if (!skipFunctionsStep) keys.push("functions");
  if (isPro) keys.push("room_info"); 
  keys.push("other");
  return keys;
}, [skipFunctionsStep, isPro]);


const eventSchema = useMemo(
  () => getEventValidationSchema(skipFunctionsValidation),
  [skipFunctionsValidation]
);

const dynamicStepSchemas = useMemo(
  () => getStepValidationSchemas(skipFunctionsValidation),
  [skipFunctionsValidation]
);

  let STATUS_NAME_TO_ID = {
    Inquiry: "0",
    Confirm: "1",
    Cancel: "2",
    Tentative: "3",
  };

  // ── Set dates from calendar ─────────────────────────────────────────────
  useEffect(() => {
    if (mode === "create") {
      if (selectedDateFromCalendar) {
        const selectedDate = dayjs(selectedDateFromCalendar);
        const startDateTime = selectedDate.hour(8).minute(0);
        const endDateTime = selectedDate.hour(12).minute(0);
        setFormData((prev) => ({
          ...prev,
          eventStartDateTime: startDateTime.format("DD/MM/YYYY hh:mm A"),
          eventEndDateTime: endDateTime.format("DD/MM/YYYY hh:mm A"),
        }));
      } else if (!formData.eventStartDateTime && !formData.eventEndDateTime) {
        const today = dayjs();
        const startDateTime = today.hour(8).minute(0).second(0);
        const endDateTime = today.hour(12).minute(0).second(0);
        setFormData((prev) => ({
          ...prev,
          eventStartDateTime: startDateTime.format("DD/MM/YYYY hh:mm A"),
          eventEndDateTime: endDateTime.format("DD/MM/YYYY hh:mm A"),
        }));
      }
    }
  }, [mode, selectedDateFromCalendar]);

  // ── Load event for edit/copy ────────────────────────────────────────────
  useEffect(() => {
    if ((mode === "edit" || mode === "copy") && eventId) {
      setLoading(true);
      GetEventMasterById(eventId)
        .then((res) => {
          const event = res.data.data["Event Details"][0];

          const statusId =
            event?.status != null
              ? String(event.status)
              : (STATUS_NAME_TO_ID[event?.status] ?? "0");

          setFormData((prev) => ({
            ...prev,
            inquiryDate: event.inquiryDate
              ? dayjs(event.inquiryDate, "DD/MM/YYYY").format("DD/MM/YYYY")
              : prev.inquiryDate,
              prefix: event.prefix || "Mr.",
            eventStartDateTime: event.eventStartDateTime.replace(
              /am|pm/i,
              (match) => match.toUpperCase(),
            ),
            eventEndDateTime: event.eventEndDateTime.replace(
              /am|pm/i,
              (match) => match.toUpperCase(),
            ),
            status: statusId,
            reference: event.reference || "",
            billingNameEnglish: event.billingNameEnglish || "",
            billingNameGujarati: event.billingNameGujarati || "",
            billingNameHindi: event.billingNameHindi || "",
            cordinatorPersonNameEnglish: event.cordinatorPersonNameEnglish || "",
cordinatorPersonNameGujarati: event.cordinatorPersonNameGujarati || "",
cordinatorPersonNameHindi: event.cordinatorPersonNameHindi || "",
cordinatorPersonContactNo: event.cordinatorPersonContactNo || "",
            venueId: event.venue?.id || "",
            eventTypeId: event.eventType?.id || "",
            managerId: event.managerId || "",
            partyId: event.party?.id || "",
            customer_name: event.party?.nameEnglish || "",
            address: event.address || event.party?.addressEnglish || "",
            mobileno: event.mobileno || event.party?.mobileno || "",
            isHighPriority: event.isHighPriority,
            eventFunction: (event.eventFunctions || []).map((f) => {
              // Support both new banquetHallShifts array and old flat fields
              const shifts = f.banquetHallShifts || [];
              const firstShift = shifts[0];

              // Collect all unique banquetHallIds from shifts array
              const banquetIds =
                shifts.length > 0
                  ? [
                      ...new Set(
                        shifts
                          .map((s) => String(s.banquetHallId))
                          .filter(Boolean),
                      ),
                    ]
                  : f.banquetHallId
                    ? [String(f.banquetHallId)]
                    : [];

              const shiftId =
                firstShift?.shiftId != null
                  ? String(firstShift.shiftId)
                  : f.shiftId != null
                    ? String(f.shiftId)
                    : "";

              return {
  function_venueGujarati: f.function_venue_gujarati || "",
  function_venueHindi: f.function_venue_hindi || "",
  eventFuncId: mode === "copy" ? 0 : f.id,
  functionId: f.function?.id ?? f.functionId ?? null,
  functionName: f.function?.nameEnglish ?? "",
  functionStartDateTime: f.functionStartDateTime
    ? f.functionStartDateTime.replace(/am|pm/i, (match) =>
        match.toUpperCase(),
      )
    : "",
  functionEndDateTime: f.functionEndDateTime
    ? f.functionEndDateTime.replace(/am|pm/i, (match) =>
        match.toUpperCase(),
      )
    : "",
  pax: f.pax || "",
  rate: f.rate || "",
  banquetHallId: banquetIds,
  shiftId,
  originalShiftId: shiftId,
  bookingDate: f.bookingDate || "",
  function_venue: f.function_venue || "",
  notesEnglish: f.notesEnglish || "",
  notesGujarati: f.notesGujarati || "",
  notesHindi: f.notesHindi || "",
  banquetNotes: f.banquentNotes || "",
  id: f.id,
  customPackageId:
    f.customPackageId != null ? String(f.customPackageId) : "",
  venueTouched: !!(f.function_venue && f.function_venue.trim()), // ← add this
   functionTouched: !!(f.function?.id ?? f.functionId ?? null),
};
            }),

            eventRooms: (event.eventRooms || []).map((room) => ({
              id: room.id || Date.now() + Math.random(),
              eventId: room.eventId || 0,
              roomId: room.roomId ? String(room.roomId) : "",
              qty: room.qty || 1,
              price: room.price || 0,
              total: room.total || 0,
              bookingdate: room.bookingdate || "",
              bookingcheckoutdate: room.bookingcheckoutdate || "",
            })),
            mealTypeId: event.mealType?.id || "",
            meal_notes: event.meal_notes || "",
            meal_notes_gujarati: event.meal_notes_gujarati || "",
            meal_notes_hindi: event.meal_notes_hindi || "",
            permissable_item: event.permissable_item || "",
            not_permissable_item: event.not_permissable_item || "",
            internal_staff_discussion: event.internal_staff_discussion || "",
              rate_discussion: event.rate_discussion || "",
            service: event.service || "",
            serviceGujarati: event.serviceGujarati || "",
            serviceHindi: event.serviceHindi || "",
            theme: event.theme || "",
            themeGujarati: event.themeGujarati || "",
            themeHindi: event.themeHindi || "",
            remark: event.remark || "",
            remarksHindi: event.remarksHindi || "",
            remarksGujarati: event.remarksGujarati || "",
            groomName: event.groomName || "",
            groomInstaLink: event.groomInstaLink || "",
            groomBirthDate: event.groomBirthDate || "",
            groom_community: event.groom_community || "",
            groomMobileno: event.groomMobileno || "",
            brideName: event.brideName || "",
            brideInstaLink: event.brideInstaLink || "",
            brideBirthDate: event.brideBirthDate || "",
            bride_community: event.bride_community || "",
            brideMobileno: event.brideMobileno || "",
            banquetId: event.banquetHallId || "ODC",
            shiftId: event.shiftId || "",
          }));
          setOriginalShiftId(event.shiftId ? String(event.shiftId) : null);
        })
        .catch((err) => console.error("Error fetching event:", err))
        .finally(() => setLoading(false));
    }
  }, [mode, eventId]);

  const validateWithYup = useCallback(async (data, schema) => {
    try {
      await schema.validate(data, { abortEarly: false });
      return {};
    } catch (err) {
      console.error("Yup raw error:", err);
      const validationErrors = {};
      if (err.name === "ValidationError") {
        if (err.inner && Array.isArray(err.inner) && err.inner.length > 0) {
          err.inner.forEach((error) => {
            if (error.path) validationErrors[error.path] = error.message;
          });
        } else if (err.path && err.message) {
          validationErrors[err.path] = err.message;
        } else if (err.message) {
          validationErrors.general = err.message;
        }
      } else {
        console.error("Schema crash (not a ValidationError):", err);
        validationErrors.general = err.message || "Validation failed";
      }
      return validationErrors;
    }
  }, []);

 const validateStep = useCallback(
  async (step) => {
    const stepKey = activeStepKeys[step];
    if (!stepKey) return true;
    const stepSchema = dynamicStepSchemas[stepKey];
      if (!stepSchema) return true;
      try {
        const validationErrors = await validateWithYup(formData, stepSchema);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
      } catch (error) {
        console.error("Error during step validation:", error);
        return false;
      }
    },
    [formData, validateWithYup, activeStepKeys, dynamicStepSchemas],
  );


const validateAllSteps = useCallback(async () => {
  try {
    const shouldSkipFunctionsValidation = canAccessEventFlow &&
      (String(formData.status) === "0" || String(formData.status) === "1");
    const schema = getEventValidationSchema(shouldSkipFunctionsValidation);

    const validationErrors = await validateWithYup(formData, schema);

    if (formData.eventEndDateTime && formData.eventStartDateTime) {
      const start = dayjs(formData.eventStartDateTime, "DD/MM/YYYY hh:mm A");
      const end = dayjs(formData.eventEndDateTime, "DD/MM/YYYY hh:mm A");
      if (end.isSame(start) || end.isAfter(start)) {
        delete validationErrors.eventEndDateTime;
      }
    }
    if (formData.banquetId && formData.banquetId !== "ODC") {
      delete validationErrors.venueId;
    }
    if (shouldSkipFunctionsValidation) {
      Object.keys(validationErrors).forEach((key) => {
        if (key.startsWith("eventFunction")) delete validationErrors[key];
      });
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  } catch (error) {
    console.error("validateAllSteps CRASH:", error);
    return false;
  }
}, [formData, validateWithYup, canAccessEventFlow]);

  const validateShiftAvailabilityBeforeSave = useCallback(async () => {
    const userId = localStorage.getItem("userId");
    const currentEventId = eventId ? Number(eventId) : 0;
    const shiftErrors = {};

    const checks = (formData.eventFunction || []).map(async (f, index) => {
      const banquetIds = Array.isArray(f.banquetHallId)
        ? f.banquetHallId
        : f.banquetHallId
          ? [f.banquetHallId]
          : [];

      if (banquetIds.length === 0 || !f.shiftId) return;

      const rawDate = f.functionStartDateTime || f.bookingDate || "";
      const bookingDate = rawDate
        ? dayjs(rawDate, ["DD/MM/YYYY hh:mm A", "DD/MM/YYYY"]).format(
            "DD/MM/YYYY",
          )
        : "";

      if (!bookingDate) return;

      try {
        const res = await AvailabilityCheck(
          userId,
          bookingDate,
          banquetIds,
          currentEventId,
        );
        const hallsData = res?.data?.data?.halls || [];

        hallsData.forEach((hall) => {
          const matchedShift = (hall.shifts || []).find(
            (item) => String(item.shiftId) === String(f.shiftId),
          );
          if (matchedShift && !matchedShift.isAvailable) {
            shiftErrors[`eventFunction[${index}].shiftId`] =
              `Shift "${matchedShift.shiftName} (${matchedShift.startTime} - ${matchedShift.endTime})" is already booked in ${hall.hallName}. Please select a different shift.`;
          }
        });
      } catch (err) {
        console.error(
          `Availability check failed for function row ${index}:`,
          err,
        );
      }
    });

    await Promise.all(checks);
    return shiftErrors;
  }, [formData.eventFunction, eventId]);

  const handleNext = useCallback(async () => {
    const stepKey = activeStepKeys[current];
    const stepSchema = dynamicStepSchemas[stepKey];

     if (stepKey === "functions" && canAccessEventFlow) {
    setCurrent((prev) => prev + 1);
    return;
  }

    if (!stepSchema) {
      setCurrent((prev) => prev + 1);
      return;
    }

    const validationErrors = await validateWithYup(formData, stepSchema);

    if (current === 0 && formData.banquetId && formData.banquetId !== "ODC") {
      delete validationErrors.venueId;
    }

    if (
      validationErrors.eventEndDateTime &&
      formData.eventEndDateTime &&
      formData.eventStartDateTime
    ) {
      const start = dayjs(formData.eventStartDateTime, "DD/MM/YYYY hh:mm A");
      const end = dayjs(formData.eventEndDateTime, "DD/MM/YYYY hh:mm A");
      if (end.isSame(start) || end.isAfter(start)) {
        delete validationErrors.eventEndDateTime;
      }
    }

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setCurrent((prev) => prev + 1);
    }
  }, [current, formData, validateWithYup, activeStepKeys,dynamicStepSchemas,canAccessEventFlow]);

  const handlePrev = useCallback(() => {
    setCurrent((prev) => prev - 1);
    setErrors({});
  }, []);

  // ── Log helpers ─────────────────────────────────────────────────────────
  const getLogDescription = (status, isUpdate = false, eventId, userEmail) => {
    const statusId = String(status);
    const action = isUpdate ? "updated" : "created";
    let base;
    switch (statusId) {
      case "0":
        base = `Event inquiry ${action}`;
        break;
      case "1":
        base = `Event confirmed and ${action}`;
        break;
      case "2":
        base = `Event cancelled and ${action}`;
        break;
      default:
        base = `Event ${action}`;
    }

    // Include who did it, which event, and when — so any misuse (e.g. a
    // status changed by someone who shouldn't have, or at an odd time) can
    // be traced back later just by reading the log, without needing to
    // cross-reference other tables.
    const evtPart = eventId ? ` [Event ID: ${eventId}]` : "";
    const actorPart = userEmail ? ` by ${userEmail}` : " by unknown user";
    const timePart = ` at ${dayjs().format("DD/MM/YYYY hh:mm A")}`;

    return `${base}${evtPart}${actorPart}${timePart}`;
  };

  const getEventType = (isUpdate) => {
  return isUpdate ? "Event Update" : "Event Create";
};

const sendLog = useCallback(
  async (eventId, status, isUpdate = false) => {
    try {
      const userEmail = getUserEmail();
      const logPayload = {
        description: getLogDescription(status, isUpdate, eventId, userEmail),
        eventType: getEventType(isUpdate),
        id:0,
        eventId: eventId ? Number(eventId) : 0,
        user: userEmail,
      };
      await AddLogs(logPayload);
    } catch (logErr) {
      console.error("Failed to save log:", logErr);
    }
  },
  [],
);

  // ── Swal helpers ────────────────────────────────────────────────────────
  const getStatusMessage = (status, isUpdate = false) => {
    const statusId = String(status);
    const action = isUpdate ? "updated" : "created";
    const actionCaps = isUpdate ? "Updated" : "Created";
    switch (statusId) {
      case "0":
        return {
          title: `Event Inquiry ${actionCaps} Successfully!`,
          text: `Your event inquiry has been ${action} and saved to the calendar.`,
        };
      case "1":
        return {
          title: `Event Confirmed Successfully!`,
          text: `Your event has been confirmed and ${action} in the calendar.`,
        };
      case "2":
        return {
          title: `Event Cancelled Successfully!`,
          text: `Your event has been cancelled and ${action} in the calendar.`,
        };
      default:
        return {
          title: `Event ${actionCaps} Successfully!`,
          text: `Your event has been ${action} in the calendar.`,
        };
    }
  };

  const swalSuccess = (status, isUpdate) => {
    const statusMessage = getStatusMessage(status, isUpdate);
    return Swal.fire({
      title: statusMessage.title,
      text: statusMessage.text,
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
  };

  const swalError = (title, msg) => {
    return Swal.fire({
      title,
      text: msg || "An unexpected error occurred. Please try again.",
      icon: "error",
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
  };

  const handleFinish = useCallback(async () => {
    if (submitting) return; 
  setSubmitting(true);    
    const isValid = await validateAllSteps();

    if (!isValid) {
      // Navigate to the first failing step
      for (let i = 0; i < activeStepKeys.length; i++) {
        const stepSchema = dynamicStepSchemas[activeStepKeys[i]];
        if (!stepSchema) continue;
        const stepErrors = await validateWithYup(formData, stepSchema);
        if (Object.keys(stepErrors).length > 0) {
          setCurrent(i);
          break;
        }
      }

      Swal.fire({
        title: "Validation Error!",
        text: errors.general || "Please fill in all required fields.",
        icon: "warning",
        confirmButtonColor: "#005BA8",
      });
      return;
    }

    const shiftErrors = await validateShiftAvailabilityBeforeSave();
    console.log("shiftErrors:", shiftErrors);
    if (Object.keys(shiftErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...shiftErrors }));
      setCurrent(2);
      setShiftRefreshTrigger((prev) => prev + 1);

      Swal.fire({
        title: "Shift Already Booked!",
        text: "One or more shifts were just booked by someone else. Please select available shifts and try again.",
        icon: "warning",
        confirmButtonColor: "#005BA8",
        background: "#f5faff",
        color: "#003f73",
        confirmButtonText: "Review Shifts",
        customClass: {
          popup: "rounded-2xl shadow-xl",
          title: "text-2xl font-bold",
          confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
        },
      });
      return;
    }

    // Build payload
    const userId = localStorage.getItem("userId");
    const { banquetId, customer_name, ...restFormData } = formData;
    const isBanquet = banquetId && banquetId !== "ODC";

    const payload = {
      ...restFormData,
      userId,
      status: Number(formData.status) || 0,
      eventTypeId: formData.eventTypeId ? Number(formData.eventTypeId) : 0,
      managerId: formData.managerId ? Number(formData.managerId) : 0,
      mealTypeId: formData.mealTypeId ? Number(formData.mealTypeId) : 0,
      partyId: formData.partyId ? Number(formData.partyId) : 0,
      venueId: isBanquet
        ? 0
        : formData.venueId === "" || formData.venueId == null
          ? null
          : Number(formData.venueId),
     
      banquetHallId: isBanquet ? Number(banquetId) : null,
      shiftId:
        isBanquet && formData.shiftId ? Number(formData.shiftId) : null,
      bookingDate: formData.eventStartDateTime
        ? formData.eventStartDateTime.split(" ")[0]
        : null,

      eventFunction: (formData.eventFunction || []).map((f, index) => {
       const banquetIds = Array.isArray(f.banquetHallId)
  ? f.banquetHallId.filter(Boolean) 
  : f.banquetHallId && f.banquetHallId !== "" && f.banquetHallId !== "ODC"
    ? [f.banquetHallId]
    : [];
        const hasBanquet = isBanquet && banquetIds.length > 0;

        const banquetHallShifts = hasBanquet
          ? banquetIds.map((hallId) => ({
              banquetHallId: Number(hallId),
              shiftId: f.shiftId ? Number(f.shiftId) : 0,
              bookingDate: f.functionStartDateTime
                ? f.functionStartDateTime.split(" ")[0]
                : "",
            }))
          : [];

        return {
  eventFuncId: f.eventFuncId || 0,
  functionId: f.functionId != null ? Number(f.functionId) : null,
  functionStartDateTime: f.functionStartDateTime || "",
  functionEndDateTime: f.functionEndDateTime || "",
  pax: f.pax ? Number(f.pax) : 0,
  rate: f.rate ? Number(f.rate) : 0,
  sortorder: index + 1,
  banquetHallShifts,
  customPackageId: f.customPackageId ? Number(f.customPackageId) : 0, 
  function_venue: hasBanquet ? "" : f.function_venue || "",          
  function_venue_gujarati: hasBanquet ? "" : f.function_venueGujarati || "",
  function_venue_hindi: hasBanquet ? "" : f.function_venueHindi || "",
  notesEnglish: f.notesEnglish || "",
  notesGujarati: f.notesGujarati || "",
  notesHindi: f.notesHindi || "",
  banquentNotes: f.banquetNotes || "",
};
      }),

      eventRooms: (formData.eventRooms || []).map((room) => ({
        eventId: mode === "edit" && eventId ? Number(eventId) : 0,
        roomId: Number(room.roomId) || 0,
        qty: Number(room.qty) || 0,
        price: Number(room.price) || 0,
        total: Number(room.total) || 0,
        bookingdate: room.bookingdate || "",
        bookingcheckoutdate: room.bookingcheckoutdate || "",
      })),
    };

    try {
      let response;

      if (mode === "edit" && eventId) {
        response = await UpdateEventMaster(eventId, payload);
        if (
          response?.data?.msg?.toLowerCase().includes("success") ||
          response?.data?.data?.success === true ||
          response?.data?.success === true
        ) {
          await sendLog(eventId, formData.status, true);
          swalSuccess(formData.status, true);
          navigate("/");
        } else {
          swalError(
            "Event Update Failed!",
            response?.data?.msg ||
              "Failed to update event. Please try again.",
          );
          console.error("Backend returned an error:", response);
        }
      } else {
        response = await CreateEventMaster(payload);
        if (response?.data?.success === true) {
          const createdEventId =
            response?.data?.data?.id || response?.data?.id || 0;

            
          await sendLog(createdEventId, formData.status, false);

          setFormData((prev) => ({
            ...prev,
            eventFunction: prev.eventFunction.map((f) => ({
              ...f,
              originalShiftId: f.shiftId ? String(f.shiftId) : "",
            })),
          }));

          swalSuccess(formData.status, false);
          navigate("/");
        } else {
          swalError(
            "Event Creation Failed!",
            response?.data?.msg ||
              "Failed to create event. Please try again.",
          );
          console.error("Backend returned an error:", response);
        }
      }
    } catch (err) {
      console.error(
        `Error ${mode === "edit" ? "updating" : "creating"} event:`,
        err,
      );
      swalError(
        `Event ${mode === "edit" ? "Update" : "Creation"} Failed!`,
        err?.response?.data?.msg ||
          err?.message ||
          "An unexpected error occurred. Please try again.",
      );
    }
    finally {
    setSubmitting(false); 
  }
  }, [
    submitting,
    formData,
    mode,
    eventId,
    navigate,
    validateAllSteps,
    validateShiftAvailabilityBeforeSave,
    sendLog,
    setShiftRefreshTrigger,
    dynamicStepSchemas,
    skipFunctionsStep, canAccessEventFlow,
  ]);

  // ── Input handlers ──────────────────────────────────────────────────────
  const handleInputChange = useCallback(
    ({ target: { value, name } }) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    },
    [errors],
  );

  const onInputChange = useCallback(
    (e, key) => {
      const { value } = e.target;
      setFormData((prev) => ({ ...prev, [key]: value }));
      if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [errors],
  );

  // ── Steps ───────────────────────────────────────────────────────────────
  const steps = useMemo(
  () => {
    const baseSteps = [
      {
        title: (
          <FormattedMessage
            id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_EVENT_INFO_STEP_TITLE"
            defaultMessage="Event Information"
          />
        ),
       content: (
  <EventBasicInfoStep
    formData={formData}
    setFormData={setFormData}
    onInputChange={handleInputChange}
    errors={errors}
    eventId={eventId}
    originalShiftId={originalShiftId}
    prefillAppliedRef={eventPrefillAppliedRef}
    enableAdvancedDateSync={ENABLE_ADVANCED_DATE_SYNC}
  />
),        icon: <i className="ki-filled ki-calendar"></i>,
      },
      {
        title: (
          <FormattedMessage
            id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_CLIENT_DETAILS_STEP_TITLE"
            defaultMessage="Client Details"
          />
        ),
        content: (
          <ClientDetailsStep
            formData={formData}
            setFormData={setFormData}
            onInputChange={onInputChange}
            handleInputChange={handleInputChange}
            errors={errors}
          />
        ),
        icon: <i className="ki-filled ki-security-user" />,
      },
      ...(!skipFunctionsStep
      ? [{
          title: (
            <FormattedMessage
              id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_FUNCTIONS_STEP_TITLE"
              defaultMessage="Functions"
            />
          ),
         content: (
  <FunctionsDetails
    formData={formData}
    setFormData={setFormData}
    onInputChange={handleInputChange}
    errors={errors}
    setErrors={setErrors}
    eventStartDateTime={formData.eventStartDateTime}
    eventEndDateTime={formData.eventEndDateTime}
    eventId={eventId}
    originalShiftId={originalShiftId}
    shiftRefreshTrigger={shiftRefreshTrigger}
    skipFunctionsStep={skipFunctionsStep}
    prefillAppliedRef={functionPrefillAppliedRef}
    enableAdvancedDateSync={ENABLE_ADVANCED_DATE_SYNC}
  />
),
          icon: <i className="ki-filled ki-setting-4" />,
        }]
      : []),
      ...(isPro && !skipFunctionsStep
        ? [{
            title: "Room Allocation",
            content: (
              <RoomDetailsStep
                formData={formData}
                setFormData={setFormData}
                eventStartDateTime={formData.eventStartDateTime}
              />
            ),
            icon: <i className="ki-filled ki-home" />,
          }]
        : []),
      {
        title: (
          <FormattedMessage
            id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_OTHER_DETAILS_STEP_TITLE"
            defaultMessage="Other Details"
          />
        ),
        content: (
          <OtherInfoStep
            formData={formData}
            setFormData={setFormData}
            onInputChange={handleInputChange}
            errors={errors}
            eventStartDateTime={formData.eventStartDateTime}
          />
        ),
        icon: <i className="ki-filled ki-information-4" />,
      },
    ];

    return baseSteps;
  },
  [formData, errors, onInputChange, handleInputChange, isPro, skipFunctionsStep],
);

  return (
    <Fragment>
      <Container >
        <div className="pb-2 mb-3 px-3 sm:px-0">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
            {mode === "edit" ? (
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_EDIT_EVENT_BUTTON"
                defaultMessage="Edit Event"
              />
            ) : (
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_CREATE_EVENT_BUTTON"
                defaultMessage="Create Event"
              />
            )}
          </h1>
        </div>

        <StepsComponent
          direction="vertical"
          current={current}
          steps={steps}
          onNext={handleNext}
          onPrev={handlePrev}
          onFinish={handleFinish}
          hideStepsOnMobile={true}
          finishDisabled={submitting} 
          nextDisabled={isVenueTranslating} 
        />
      </Container>
    </Fragment>
  );
};

export default CreateEventPage;