import clsx from "clsx";
import { useFormik } from "formik";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { Alert, KeenIcon } from "@/components";
import { useLayout } from "@/providers";
import { requestPasswordResetLink } from "@/services/apiServices"; // ✅ import your API
import { message } from "antd";

const initialValues = {
  email: "",
};

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Wrong email format")
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
});

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(null); // null | string

  const { currentLayout } = useLayout();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues,
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      setHasErrors(undefined);

      try {
        const response = await requestPasswordResetLink(values.email);

        // ✅ Backend returns { success: true/false, msg: "..." }
        if (response?.data?.success) {
          message.success(response.data.msg);
          localStorage.setItem("successMsg", response.data.msg);
          setHasErrors(null); // no error

          // Save email + navigate
          const params = new URLSearchParams();
          params.append("email", values.email);
          localStorage.setItem("email", values.email);

          navigate({
            pathname:
              currentLayout?.name === "auth-branded"
                ? "/auth/2fa"
                : "/auth/classic/reset-password/check-email",
            search: params.toString(),
          });
        } else {
          console.log(
            "❌ Failed:",
            response?.data?.msg || "Something went wrong"
          );
          const failMsg =
            response?.data?.msg || "Password reset failed. Please try again.";
          // message.error(failMsg);
          setHasErrors(failMsg); // store error message
        }

        setLoading(false);
      } catch (error) {
        console.error("🚨 API Error:", error);

        const errorMsg =
          error.response?.data?.msg ||
          error.response?.data?.message ||
          "Something went wrong. Please try again.";

        setStatus(errorMsg);
        message.error(errorMsg);
        setHasErrors(errorMsg); // store error message
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="card max-w-[370px] w-full">
      <form
        className="card-body flex flex-col gap-2 p-5 md:p-7"
        noValidate
        onSubmit={formik.handleSubmit}
      >
        <div className="mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2">
            Forgot Password?
          </h3>
          <span className="text-sm text-gray-700">
            Don't worry! It happens. Please enter the email address associated
            with your account
          </span>
        </div>
        {hasErrors && <Alert variant="danger">{hasErrors}</Alert>}
        {/* {hasErrors === null && (
  <Alert variant="success">
    Password reset link sent. Please check your email to proceed
  </Alert>
)} */}

        <div className="flex flex-col">
          <label className="form-label">Email Address</label>
          <div className="input">
            <i className="ki-filled ki-sms"></i>
            <input
              type="email"
              placeholder="Enter email address"
              autoComplete="off"
              {...formik.getFieldProps("email")}
              className={clsx(
                "form-control bg-transparent",
                {
                  "is-invalid": formik.touched.email && formik.errors.email,
                },
                {
                  "is-valid": formik.touched.email && !formik.errors.email,
                }
              )}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.email}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4 items-stretch mt-3">
          <button
            type="submit"
            className="btn btn-primary flex justify-center grow"
            disabled={loading || formik.isSubmitting}
          >
            {loading ? "Please wait..." : "Submit"}
          </button>
          <Link
            to={
              currentLayout?.name === "auth-branded"
                ? "/auth/login"
                : "/auth/classic/login"
            }
            className="flex items-center justify-center text-sm gap-2 text-gray-700 hover:text-primary"
          >
            <KeenIcon icon="black-left" />
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
};

export { ResetPassword };
