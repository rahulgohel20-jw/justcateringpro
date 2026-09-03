import { useFormik } from "formik";
import * as Yup from "yup";
import { Alert, KeenIcon } from "@/components";
import { useState } from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import { useLayout } from "@/providers";
import { AxiosError } from "axios";
import { resetPassword } from "@/services/apiServices"; // ✅ import service
import { message } from "antd";

const passwordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your new password"),
});

const ResetPasswordChange = () => {
  const { currentLayout } = useLayout();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState(undefined);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewPasswordConfirmation, setShowNewPasswordConfirmation] =
    useState(false);

  const formik = useFormik({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: passwordSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      setHasErrors(undefined);

      const emailId =
        localStorage.getItem("email") ||
        new URLSearchParams(window.location.search).get("email");

      if (!emailId) {
        setHasErrors(true);
        setStatus("Email is required to reset password");
        setLoading(false);
        setSubmitting(false);
        return;
      }

      try {
        // ✅ call API service
        const { data } = await resetPassword(
          emailId,
          values.newPassword,
          values.confirmPassword
        );

        if (!data.success) {
          throw new Error(data.message || "Password reset failed");
        }

        setHasErrors(false);
        navigate(
          currentLayout?.name === "auth-branded"
            ? "/auth/reset-password/changed"
            : "/auth/classic/reset-password/changed"
        );
        message.success(
          "Password reset successfully. Please login with your new password"
        );
        localStorage.removeItem("email");
        localStorage.removeItem("successMsg");
      } catch (error) {
        if (error instanceof AxiosError && error.response) {
          setStatus(error.response.data.message);
        } else {
          setStatus("Password reset failed. Please try again.");
        }
        setHasErrors(true);
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="card max-w-[370px] w-full">
      <form
        className="card-body flex flex-col gap-2 p-5 md:p-7"
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <div className="mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2.5">
            Reset Password
          </h3>
          <span className="text-sm text-gray-700">
            Your new password must be different from previously used passwords
          </span>
        </div>

        {hasErrors && <Alert variant="danger">{formik.status}</Alert>}

        {/* new password field */}
        <div className="flex flex-col">
          <label className="form-label">New Password</label>
          <label className="input">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="Enter new password"
              autoComplete="off"
              {...formik.getFieldProps("newPassword")}
              className={clsx("form-control bg-transparent", {
                "is-invalid":
                  formik.touched.newPassword && formik.errors.newPassword,
                "is-valid":
                  formik.touched.newPassword && !formik.errors.newPassword,
              })}
            />
            <button
              className="btn btn-icon"
              onClick={(e) => {
                e.preventDefault();
                setShowNewPassword(!showNewPassword);
              }}
            >
              <KeenIcon
                icon="eye"
                className={clsx("text-gray-500", { hidden: showNewPassword })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx("text-gray-500", {
                  hidden: !showNewPassword,
                })}
              />
            </button>
          </label>
          {formik.touched.newPassword && formik.errors.newPassword && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.newPassword}
            </span>
          )}
        </div>

        {/* confirm password field */}
        <div className="flex flex-col">
          <label className="form-label">Confirm New Password</label>
          <label className="input">
            <input
              type={showNewPasswordConfirmation ? "text" : "password"}
              placeholder="Confirm new password"
              autoComplete="off"
              {...formik.getFieldProps("confirmPassword")}
              className={clsx("form-control bg-transparent", {
                "is-invalid":
                  formik.touched.confirmPassword &&
                  formik.errors.confirmPassword,
                "is-valid":
                  formik.touched.confirmPassword &&
                  !formik.errors.confirmPassword,
              })}
            />
            <button
              className="btn btn-icon"
              onClick={(e) => {
                e.preventDefault();
                setShowNewPasswordConfirmation(!showNewPasswordConfirmation);
              }}
            >
              <KeenIcon
                icon="eye"
                className={clsx("text-gray-500", {
                  hidden: showNewPasswordConfirmation,
                })}
              />
              <KeenIcon
                icon="eye-slash"
                className={clsx("text-gray-500", {
                  hidden: !showNewPasswordConfirmation,
                })}
              />
            </button>
          </label>
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.confirmPassword}
            </span>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow mt-3"
          disabled={loading}
        >
          {loading ? "Please wait..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export { ResetPasswordChange };
