import * as yup from "yup";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);

const extractDateOnly = (dateTimeString) => {
  if (!dateTimeString) return null;
  return dateTimeString.split(" ")[0];
};

const functionItemSchema = yup.object().shape({
  functionId: yup
    .mixed()
    .required("Function Type is required")
    .test("is-valid", "Function Type is required", (val) => val != null && val !== ""),
  pax: yup
    .mixed()
    .required("Pax is required")
    .test("is-valid", "Pax is required", (val) => val != null && val !== ""),
});

const noDuplicateFunctionsTest = {
  name: "no-duplicate-functions",
  message: "",
  test: function (eventFunctions) {
    if (!eventFunctions || eventFunctions.length === 0) return true;
    const seen = new Map();
    for (let i = 0; i < eventFunctions.length; i++) {
      const func = eventFunctions[i];
      if (!func.functionId || !func.functionStartDateTime) continue;
      const dateOnly = extractDateOnly(func.functionStartDateTime);
      const key = `${func.functionId}-${dateOnly}`;
      if (seen.has(key)) {
        return this.createError({ path: this.path, message: "" });
      }
      seen.set(key, i);
    }
    return true;
  },
};

const dateTest = yup
  .string()
  .required("Event End Date is required")
  .test(
    "is-after-or-same",
    "End date must be after or same as start date",
    function (value) {
      const { eventStartDateTime } = this.parent;
      if (!eventStartDateTime || !value) return true;
      const startDate = dayjs(eventStartDateTime, "DD/MM/YYYY hh:mm A");
      const endDate = dayjs(value, "DD/MM/YYYY hh:mm A");
      if (!startDate.isValid() || !endDate.isValid()) return true;
      return endDate.isSame(startDate) || endDate.isAfter(startDate);
    }
  );

const eventFunctionSchema = (skipFunctions) =>
  skipFunctions
    ? yup.array().notRequired()
    : yup
        .array()
        .of(functionItemSchema)
        .min(1, "At least one function is required")
        .required("Functions is required")
        .test(noDuplicateFunctionsTest);

export const getEventValidationSchema = (skipFunctions = false) =>
  yup.object().shape({
    inquiryDate: yup.string().required("Inquiry Date is required"),
    status: yup.string().required("Status is required"),
    eventStartDateTime: yup.string().required("Event Start Date is required"),
    eventEndDateTime: dateTest,

    banquetId: yup.string().notRequired(),

    venueId: yup.string().when("banquetId", {
      is: (banquetId) => !banquetId || banquetId === "ODC",
      then: (schema) => schema.required("Venue is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    eventTypeId: yup.string().required("Event Type is required"),
    managerId: yup.string().required("Manager Name is required"),
    customer_name: yup.string().required("Customer Name is required"),
    mealTypeId: yup.string().required("Meal Type is required"),

    eventFunction: eventFunctionSchema(skipFunctions),
  });

// static fallback (used nowhere now, kept for safety)
export const eventValidationSchema = getEventValidationSchema(false);

export const stepValidationSchemas = {
  basic_info: yup.object().shape({
    status: yup.string().required("Status is required"),
    inquiryDate: yup.string().required("Inquiry Date is required"),
    eventStartDateTime: yup.string().required("Event Start Date is required"),
    eventEndDateTime: dateTest,

    banquetId: yup.string().notRequired(),

    venueId: yup.string().when("banquetId", {
      is: (banquetId) => !banquetId || banquetId === "ODC",
      then: (schema) => schema.required("Venue is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    eventTypeId: yup.string().required("Event Type is required"),
  }),

  client_info: yup.object().shape({
    customer_name: yup.string().required("Customer Name is required"),
  }),

  functions: yup.object().shape({
    eventFunction: yup
      .array()
      .of(functionItemSchema)
      .min(1, "At least one function is required")
      .required("Functions is required")
      .test(noDuplicateFunctionsTest),
  }),
};

export const getStepValidationSchemas = (skipFunctions = false) => ({
  basic_info: stepValidationSchemas.basic_info,
  client_info: stepValidationSchemas.client_info,
  functions: skipFunctions ? null : stepValidationSchemas.functions,
});

export { functionItemSchema };