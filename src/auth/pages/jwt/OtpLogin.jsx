import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clsx from "clsx";
import * as Yup from "yup";
import { useFormik } from "formik";
import { Alert } from "@/components";
import { useAuthContext } from "@/auth";
import { useLayout } from "@/providers";
import { message } from "antd";
import { LoginWithOtp } from "@/services/apiServices";

const loginSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
    .required("Phone number is required"),
});

const initialValues = {
  phone: "",
  remember: false,
};

const OtpLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/auth/2fa";
  const { currentLayout } = useLayout();

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        if (!login) {
          throw new Error("JWTProvider is required for this form.");
        }

   
        const response = await LoginWithOtp(values.phone);

        if (response?.data?.success) {
          localStorage.setItem("phone", values.phone); 
          message.success("OTP sent to your mobile number");
          navigate(from, { replace: true });
        } else {
          setStatus(response?.data?.msg || "Unable to send OTP");
        }
      } catch (error) {
        console.error("OTP Login error:", error);
        setStatus("The login details are incorrect");
      } finally {
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  return (
    <div className="card max-w-[390px] w-full">
      <form
        className="card-body flex flex-col gap-2 p-5 md:p-7"
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <div className="mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2">
            Login with OTP instead
          </h3>
          <span className="text-sm text-gray-700">
            Enter your phone number to receive an OTP code for account
            verification.
          </span>
        </div>

        {formik.status && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col">
          <label className="form-label">Phone Number</label>
          <div className="input">
            <i className="ki-filled ki-phone"></i>
            <input
              placeholder="Enter phone number"
              autoComplete="off"
              {...formik.getFieldProps("phone")}
              className={clsx("form-control", {
                "is-invalid": formik.touched.phone && formik.errors.phone,
              })}
            />
          </div>
          {formik.touched.phone && formik.errors.phone && (
            <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.phone}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-1">
          <Link
            to={"/auth/login"}
            className="text-sm link shrink-0 hover:underline no-underline"
          >
            Login with Email instead
          </Link>
        </div>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow mt-3"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? "Please wait..." : "Send your OTP"}
        </button>

        <div className="flex items-center justify-center mt-3">
          <span className="text-sm text-gray-700 me-1.5">
            Don't have an account?
          </span>
          <Link
            to={
              currentLayout?.name === "auth-branded"
                ? "/auth/signup"
                : "/auth/classic/signup"
            }
            className="text-2sm link hover:underline font-medium no-underline"
          >
            Sign Up
          </Link>
        </div>
      </form>
    </div>
  );
};

export { OtpLogin };
