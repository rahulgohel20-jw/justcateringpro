import {
  Translateapi,
  GetPlansByBillingCycle,
  AddupadteAItemplate,
} from "@/services/apiServices";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { extractTranslations } from "@/utils/langConfig";
import { useNavigate, useLocation } from "react-router-dom";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";

const INITIAL_VALUES = {
  nameEnglish: "",
  nameGujarati: "",
  nameHindi: "",
  instructionEnglish: "",
  instructionGujarati: "",
  instructionHindi: "",
  ruleEnglish: "",
  ruleGujarati: "",
  ruleHindi: "",
  queryInstruction: "",
  aiModel: "",
  billingCycle: "",
  price: 0,
  isActive: true,
};

const validationSchema = Yup.object().shape({
  nameEnglish: Yup.string().required("Name (English) is required"),
});

// ─── Section heading with left accent bar ─────────────────────────────────────
const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-2 mb-3 mt-1">
    <div
      className="w-1 h-4 rounded-full flex-shrink-0"
      style={{
        background: "linear-gradient(180deg, #594CEB 0%, #4BCBEB 100%)",
      }}
    />
    <p className="text-sm font-semibold text-gray-800 tracking-wide">
      {children}
    </p>
  </div>
);

// ─── Floating label input ─────────────────────────────────────────────────────
const FloatingInput = ({ label, name, type = "text", placeholder = "" }) => (
  <div className="relative">
    <span
      className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-semibold tracking-widest uppercase text-gray-400 z-10"
      style={{ color: "#0058BC" }}
    >
      {label}
    </span>
    <Field
      name={name}
      type={type}
      placeholder={placeholder}
      className="w-full border border-gray-200 rounded-xl px-3 pt-4 pb-2 text-sm text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition"
      style={{ "--tw-ring-color": "#594CEB22" }}
      onFocus={(e) => (e.target.style.boxShadow = "0 0 0 3px #594CEB22")}
      onBlur={(e) => (e.target.style.boxShadow = "")}
    />
    <ErrorMessage
      name={name}
      component="p"
      className="text-red-500 text-xs mt-1"
    />
  </div>
);

// ─── Floating label textarea ──────────────────────────────────────────────────
const FloatingTextarea = ({
  label,
  name,
  placeholder = "",
  muted = false,
  rows = 4,
}) => (
  <div className="relative">
    {label && (
      <span
        className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-semibold tracking-widest uppercase text-gray-400 z-10"
        style={{ color: "#6B38D4" }}
      >
        {label}
      </span>
    )}
    <Field
      as="textarea"
      name={name}
      rows={rows}
      placeholder={placeholder}
      className={`w-full border border-gray-200 rounded-xl px-3 pt-4 pb-2 text-sm resize-none placeholder-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition ${
        muted ? "bg-gray-50 text-gray-9s00" : "bg-white text-gray-800"
      }`}
      onFocus={(e) => (e.target.style.boxShadow = "0 0 0 3px #594CEB22")}
      onBlur={(e) => (e.target.style.boxShadow = "")}
    />
    <ErrorMessage
      name={name}
      component="p"
      className="text-red-500 text-xs mt-1"
    />
  </div>
);

// ─── Auto-translate hook ──────────────────────────────────────────────────────
const useAutoTranslate = (value, gujaratiKey, hindiKey, setFieldValue) => {
  useEffect(() => {
    if (!value?.trim()) return;
    const timer = setTimeout(() => {
      Translateapi(value)
        .then((res) => {
          const { regional, hindi } = extractTranslations(res.data);
          setFieldValue(gujaratiKey, regional);
          setFieldValue(hindiKey, hindi);
        })
        .catch(() => {});
    }, 500);
    return () => clearTimeout(timer);
  }, [value]);
};

// ─── Main Page Component ──────────────────────────────────────────────────────
const Addaimodal = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // If navigated with existing data for edit, it's passed via location.state
  const contactType = location.state?.contactType ?? null;

  const [billingOptions, setBillingOptions] = useState([]);

  useEffect(() => {
    GetPlansByBillingCycle("all")
      .then((res) => setBillingOptions(res.data || []))
      .catch((err) => console.error("Billing fetch error", err));
  }, []);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const userId = JSON.parse(localStorage.getItem("userId"));
      await AddupadteAItemplate({
        ...values,
        userId,
        id: contactType?.id ?? 0,
      });
      Swal.fire(
        "Success!",
        contactType ? "Updated successfully" : "Saved successfully",
        "success",
      );
      resetForm();
      navigate(-1); // Go back after save
    } catch (error) {
      console.error("Submit error:", error);
      Swal.fire("Error", "Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      {/* ── Breadcrumbs ── */}
      <div className="gap-2 pb-2 mb-3">
        <Breadcrumbs
          items={[
            { title: "AI Templates", href: -1 },
            { title: contactType ? "Edit AI Module" : "Create AI Module" },
          ]}
        />
      </div>

      {/* ── Page Card ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* ── Page Header ── */}
        <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Gradient icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #594CEB 0%, #4BCBEB 100%)",
              }}
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 3.75H6A2.25 2.25 0 003.75 6v3.75M3.75 14.25V18A2.25 2.25 0 006 20.25h3.75M14.25 3.75H18A2.25 2.25 0 0120.25 6v3.75M20.25 14.25V18A2.25 2.25 0 0118 20.25h-3.75"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {contactType ? "Edit AI Module" : "Create AI Module"}
              </h2>
              <p className="text-xs text-gray-500">
                Configure new neural capabilities
              </p>
            </div>
          </div>

          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back
          </button>
        </div>

        {/* ── Form Body ── */}
        <div className="px-6 py-6">
          <Formik
            initialValues={contactType ?? INITIAL_VALUES}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ values, setFieldValue, isSubmitting }) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              useAutoTranslate(
                values.nameEnglish,
                "nameGujarati",
                "nameHindi",
                setFieldValue,
              );
              // eslint-disable-next-line react-hooks/rules-of-hooks
              useAutoTranslate(
                values.instructionEnglish,
                "instructionGujarati",
                "instructionHindi",
                setFieldValue,
              );
              // eslint-disable-next-line react-hooks/rules-of-hooks
              useAutoTranslate(
                values.ruleEnglish,
                "ruleGujarati",
                "ruleHindi",
                setFieldValue,
              );

              return (
                <Form className="flex flex-col gap-6">
                  {/* ── Module Name ── */}
                  <div>
                    <SectionLabel>Module Name</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FloatingInput
                        label="English"
                        name="nameEnglish"
                        placeholder="English Name"
                      />
                      <FloatingInput
                        label="Hindi"
                        name="nameHindi"
                        placeholder="हिंदी नाम"
                      />
                      <FloatingInput
                        label="Gujarati"
                        name="nameGujarati"
                        placeholder="ગુજરાતી નામ"
                      />
                    </div>
                  </div>

                  {/* ── Instructions ── */}
                  <div>
                    <SectionLabel>Instructions</SectionLabel>
                    <div className="flex flex-col gap-3">
                      <FloatingTextarea
                        label="English"
                        name="instructionEnglish"
                        placeholder="Behavioral guidelines for the module..."
                        rows={4}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FloatingTextarea
                          label="Hindi"
                          name="instructionHindi"
                          placeholder="व्यवहार संबंधी निर्देश..."
                          muted
                          rows={3}
                        />
                        <FloatingTextarea
                          label="Gujarati"
                          name="instructionGujarati"
                          placeholder="વર્તન સંબંધી માર્ગદર્શિકા..."
                          muted
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Rules ── */}
                  <div>
                    <SectionLabel>Rules</SectionLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <FloatingInput
                        label="English"
                        name="ruleEnglish"
                        placeholder="Enter Rules in English"
                      />
                      <FloatingInput
                        label="Hindi"
                        name="ruleHindi"
                        placeholder="हिंदी नाम"
                      />
                      <FloatingInput
                        label="Gujarati"
                        name="ruleGujarati"
                        placeholder="ગુજરાતી નામ"
                      />
                    </div>
                  </div>

                  {/* ── Query Instruction + AI Model Type ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <SectionLabel>Query Instruction</SectionLabel>
                      <FloatingTextarea
                        name="queryInstruction"
                        placeholder="How should the AI parse incoming queries?"
                        rows={4}
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      {/* AI Model Type */}
                      <div>
                        <SectionLabel>AI Module Type</SectionLabel>
                        <div className="relative">
                          <Field
                            name="aiModel"
                            placeholder="Chat Assistant"
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-600 pr-9 focus:outline-none transition"
                            onFocus={(e) =>
                              (e.target.style.boxShadow = "0 0 0 3px #594CEB22")
                            }
                            onBlur={(e) => (e.target.style.boxShadow = "")}
                          />
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <svg
                              className="w-4 h-4 text-gray-300"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.75 3.75H6A2.25 2.25 0 003.75 6v3.75M14.25 3.75H18A2.25 2.25 0 0120.25 6v3.75M3.75 14.25V18A2.25 2.25 0 006 20.25h3.75M20.25 14.25V18A2.25 2.25 0 0118 20.25h-3.75"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Billing & Pricing */}
                      <div>
                        <SectionLabel>Billing & Pricing</SectionLabel>
                        <div className="flex gap-2">
                          {/* Billing cycle select */}
                          <div className="relative flex-1">
                            <Field
                              as="select"
                              name="billingCycle"
                              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 bg-white appearance-none focus:outline-none transition pr-8"
                              onFocus={(e) =>
                                (e.target.style.boxShadow =
                                  "0 0 0 3px #594CEB22")
                              }
                              onBlur={(e) => (e.target.style.boxShadow = "")}
                            >
                              <option value="">Select cycle</option>
                              {billingOptions.length > 0 ? (
                                billingOptions.map((opt) => (
                                  <option key={opt.id} value={opt.id}>
                                    {opt.label}
                                  </option>
                                ))
                              ) : (
                                <>
                                  <option value="MONTHLY">Monthly</option>
                                  <option value="WEEKLY">Weekly</option>
                                  <option value="ANNUAL">Annual</option>
                                </>
                              )}
                            </Field>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg
                                className="w-3.5 h-3.5 text-gray-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>

                          {/* Price input with ₹ prefix */}
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium pointer-events-none">
                              ₹
                            </span>
                            <Field
                              name="price"
                              type="tel"
                              className="w-full border border-gray-200 rounded-xl pl-7 pr-3 py-2.5 text-sm text-gray-800 focus:outline-none transition"
                              onFocus={(e) =>
                                (e.target.style.boxShadow =
                                  "0 0 0 3px #594CEB22")
                              }
                              onBlur={(e) => (e.target.style.boxShadow = "")}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Footer ── */}
                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="px-5 py-2 text-sm font-medium rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition"
                    >
                      Discard
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl text-white disabled:opacity-50 transition hover:opacity-90"
                      style={{
                        background:
                          "linear-gradient(135deg, #594CEB 0%, #4BCBEB 100%)",
                      }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          {contactType ? "Update Module" : "Save Module"}
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                            />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>
      </div>
    </Container>
  );
};

export default Addaimodal;
