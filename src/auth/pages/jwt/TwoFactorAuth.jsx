import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils";
import { KeenIcon } from "@/components";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuthContext } from "../../useAuthContext";
import { verifyOtp, verifyMobileOtp } from "@/services/apiServices";
import { message } from "antd";
import { useAuthStore } from "@/store/useAuthStore";
import { normalizeRights } from "@/utils/normalizeRights";

const TwoFactorAuth = () => {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const [codeInputs, setCodeInputs] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);

  const handleInputChange = (index, value) => {
    if (value.length > 1 || isNaN(value)) return;
    const updatedInputs = [...codeInputs];
    updatedInputs[index] = value;
    setCodeInputs(updatedInputs);

    const otp = updatedInputs.join("");
    formik.setFieldValue("otp", otp);

    if (value && index < codeInputs.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !codeInputs[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const formik = useFormik({
    initialValues: {
      otp: "",
      uniqueCode: "", 
    },
    validationSchema: Yup.object().shape({
      otp: Yup.string()
        .length(6, "OTP must be exactly 6 digits")
        .required("OTP is required"),
      uniqueCode: Yup.string().when([], {
        is: () => !!localStorage.getItem("phone"),
        then: (schema) => schema.required("Unique code is required"),
        otherwise: (schema) => schema.notRequired(),
      }), // ✅ Required only for mobile OTP flow
    }),

    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        const otp = codeInputs.join("");
        if (otp.length !== 6) {
          throw new Error("Please enter a valid 6-digit OTP.");
        }

        const email = localStorage.getItem("email");
        const phone = localStorage.getItem("phone");

        let data;

     if (phone) {
  const response = await verifyMobileOtp({
    phone,
    otp,
    uniqueCode: values.uniqueCode,
  });
  data = response.data;

  if (!data.success) throw new Error(data.msg || "Invalid OTP");

  // ✅ Reuse the same handleAuthSuccess flow via a fake response shape
  const userDetails = data.data?.["User Details"]?.[0];
  if (!userDetails) throw new Error("User details not found in response");

  // ✅ Store the same keys handleAuthSuccess stores
  localStorage.setItem("userToken", userDetails.token);
  localStorage.setItem("mainId", userDetails.id);
  localStorage.setItem("lang", "en");

  const finalUserId =
    userDetails.clientId === 0 || userDetails.clientId === -1
      ? userDetails.id
      : userDetails.clientId;
  localStorage.setItem("userId", finalUserId.toString());

  // ✅ Set Zustand auth-storage the same way handleAuthSuccess does
  const { normalizeRights } = await import("@/utils/normalizeRights");
  const normalizedRights = normalizeRights(userDetails?.userRights || []);
  const upgradedModules = userDetails?.userUpgradedModule || [];
  const roleReportRights = userDetails?.roleReportRights || null;

  const { useAuthStore } = await import("@/store/useAuthStore");
  useAuthStore
    .getState()
    .setAuth(userDetails, userDetails.token, normalizedRights, upgradedModules, roleReportRights);

  message.success(data.msg || "Mobile login successful");
  localStorage.removeItem("phone");

  // ✅ Same role-based redirect as Login.jsx
  const clientId = userDetails.clientId;
  const roleId = Number(userDetails.userBasicDetails?.role?.id);
  const userPlan = userDetails.userPlan?.plan ?? null;
  const plan = userDetails.plan ?? null;
  const isApprove = userDetails.isApprove;

  if (roleId === 1 || clientId === 1) {
    navigate("/super-dashboard", { replace: true });
  } else if (roleId === 2) {
    const hasValidPlan =
      userPlan != null &&
      userPlan !== "" &&
      userPlan !== "null" &&
      (typeof userPlan === "object" ? Object.keys(userPlan).length > 0 : true);

    if (!hasValidPlan || isApprove === false) {
      navigate("/approvepending", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  } else if (roleId > 2) {
    if (plan === "null" || plan == null) {
      navigate("/approvepending", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  } else {
    navigate("/", { replace: true });
  }
} else if (email) {
          const response = await verifyOtp({ email, otp });
          data = response.data;

          if (!data.success) throw new Error(data.msg || "Invalid OTP");

          if (data.token) {
            localStorage.setItem("authToken", data.token);
          }

          message.success(data.msg || "OTP verified successfully");
          navigate("/auth/reset-password/change", { replace: true });
        } else {
          throw new Error("No phone or email found in localStorage");
        }
      } catch (error) {
        console.error("OTP verification error:", error);
        setStatus(error.message || "OTP verification failed");
        setSubmitting(false);
      }
      setLoading(false);
    },
  });

  return (
    <div className="card max-w-[370px] w-full">
      <form
        className="card-body flex items-start flex-col gap-2 p-7"
        onSubmit={formik.handleSubmit}
      >
        <img
          src={toAbsoluteUrl("/media/illustrations/34.svg")}
          className="dark:hidden h-12 mb-2"
          alt=""
        />
        <img
          src={toAbsoluteUrl("/media/illustrations/34-dark.svg")}
          className="light:hidden h-12 mb-2"
          alt=""
        />
        <div className="mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2">
            OTP Verification
          </h3>
          <div className="flex flex-col">
            <span className="text-sm text-gray-700">
              Please enter the one time password to verify your account.
            </span>
            <span className="text-sm text-gray-700 mt-2">
              A code has been sent to
              <span className="ms-1">
                {localStorage.getItem("email")
                  ? localStorage.getItem("email")
                  : localStorage.getItem("phone")}
              </span>
            </span>
          </div>
        </div>

        {/* OTP inputs */}
        <div className="flex flex-wrap justify-center gap-2.5">
          {codeInputs.map((value, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              maxLength={1}
              className="input text-base text-gray-900 focus:border-primary-clarity focus:ring focus:ring-primary-clarity size-10 shrink-0 px-0 text-center"
              value={value}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
            />
          ))}
          {formik.touched.otp && formik.errors.otp && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.otp}
            </span>
          )}
        </div>

        {/* ✅ Unique Code field — only shown for mobile OTP flow */}
        {localStorage.getItem("phone") && (
          <div className="flex flex-col gap-1 w-full mt-2">
            <label className="text-sm font-medium text-gray-700">
              Unique Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="Enter unique code"
              {...formik.getFieldProps("uniqueCode")}
            />
            {formik.touched.uniqueCode && formik.errors.uniqueCode && (
              <span role="alert" className="text-danger text-xs mt-1">
                {formik.errors.uniqueCode}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-center text-center w-full mt-2">
          <span className="text-sm text-gray-700 me-1.5">
            Didn't receive a code? (37s)
          </span>
          <Link
            to={
              localStorage.getItem("phone") ? "/auth/otp-login" : "/auth/login"
            }
            className="text-sm link hover:underline no-underline"
          >
            Resend OTP
          </Link>
        </div>

        {formik.status && (
          <span role="alert" className="text-danger text-xs text-center w-full">
            {formik.status}
          </span>
        )}

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow mt-3 w-full"
          disabled={loading}
        >
          {loading ? "Loading..." : "Verify & Proceed"}
        </button>
        <div className="text-center w-full">
          <Link
            to={
              localStorage.getItem("phone") ? "/auth/otp-login" : "/auth/login"
            }
            className="flex items-center justify-center text-sm gap-2 text-gray-700 hover:text-primary mt-2"
          >
            <KeenIcon icon="black-left" />
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export { TwoFactorAuth };