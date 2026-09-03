import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import clsx from "clsx";
import * as Yup from "yup";
import { useFormik } from "formik";
import { KeenIcon } from "@/components";
import { useAuthContext } from "@/auth";
import { useLayout } from "@/providers";
import { Alert } from "@/components";
import PlanExpire from "../../../partials/modals/planExpire/PlanExpire";

const loginSchema = Yup.object().shape({
  userCode: Yup.string()
    .min(2, "Minimum 2 symbols")
    .max(30, "Maximum 30 symbols")
    .required("User code is required"),
  email: Yup.string()
    .email("Wrong email format")
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Minimum 6 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password is required"),
});

const initialValues = { userCode: "", email: "", password: "" };

const Login = () => {
  const [loading, setLoading]           = useState(false);
  const [modalOpen, setModalOpen]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login }         = useAuthContext();
  const navigate          = useNavigate();
  const { currentLayout } = useLayout();

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      setStatus(null);

      try {
        const auth = await login( values.userCode,values.email, values.password);

        if (!auth?.userId) throw new Error("User ID not found after login.");

        const userDetails = auth?.userDetails;
        if (!userDetails) throw new Error("Failed to fetch user details.");

        const clientId  = userDetails?.clientId;
        const roleId    = Number(userDetails?.userBasicDetails?.role?.id);
        const userPlan  = userDetails?.userPlan?.plan ?? null;
        const plan      = userDetails?.plan ?? null;
        const isApprove = userDetails?.isApprove;

        if (roleId === 1 || clientId === 1) {
          navigate("/super-dashboard", { replace: true });

        } else if (roleId === 2) {
           const userPlan = userDetails?.plan ?? null;

          const hasValidPlan =
            userPlan != null &&
            userPlan !== "" &&
            userPlan !== "null" &&
            (typeof userPlan === "object" ? Object.keys(userPlan).length > 0 : true);

       if (!hasValidPlan) {
    navigate("/price", { replace: true });
  } else if (isApprove === false) {
    navigate("/approvepending", { replace: true });
  } else {
    navigate("/", { replace: true });
  }
        } else if (roleId > 2) {
          if (plan === "null" || plan == null) {
            setModalOpen(true);
          } else {
            navigate("/", { replace: true });
          }

        } else {
          navigate("/", { replace: true });
        }

      } catch (error) {
        console.error("Login error:", error);

        let errorMessage = "The login details are incorrect";
        if (error.message?.includes("Network Error")) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (error.message?.includes("timeout")) {
          errorMessage = "Request timed out. Please try again.";
        } else if (error.message) {
          errorMessage = error.message;
        }

        setStatus(errorMessage);
        setSubmitting(false);
      } finally {
        setLoading(false);
      }
    },
  });

  const togglePassword = (e) => {
    e.preventDefault();
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      formik.setFieldValue("email", rememberedEmail);
    }
  }, []);

  return (
    <div className="card max-w-[700px]">
      <form
        className="card-body flex flex-col gap-2 p-5 md:p-7"
        onSubmit={formik.handleSubmit}
        noValidate
      >
        <div className="mb-2.5">
          <h3 className="text-2xl font-semibold text-gray-900 leading-none mb-2.5">Sign In</h3>
          <h3 className="flex text-lg gap-2 align-center font-semibold">Welcome back</h3>
          <span className="text-lg text-gray-700">
            Hey, Enter your details below to sign in and access your account securely and easily.
          </span>
        </div>

        {formik.status && <Alert variant="danger">{formik.status}</Alert>}

       
        <div className="flex flex-col">
          <label className="form-label text-md">Unique Code</label>
          <div className="input">
            <i className="ki-filled ki-badge" />
            <input
              placeholder="Enter unique code"
              autoComplete="off"
              {...formik.getFieldProps("userCode")}
              className={clsx("form-control", {
                "is-invalid": formik.touched.userCode && formik.errors.userCode,
              })}
            />
          </div>
          {formik.touched.userCode && formik.errors.userCode && (
            <span role="alert" className="text-danger text-sm mt-1">
              {formik.errors.userCode}
            </span>
          )}
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <label className="form-label text-md">Email Address</label>
          <div className="input">
            <i className="ki-filled ki-sms" />
            <input
              placeholder="Enter username"
              autoComplete="off"
              {...formik.getFieldProps("email")}
              className={clsx("form-control", {
                "is-invalid": formik.touched.email && formik.errors.email,
              })}
            />
          </div>
          {formik.touched.email && formik.errors.email && (
            <span role="alert" className="text-danger text-sm mt-1">{formik.errors.email}</span>
          )}
        </div>

        {/* Password */}
        <div className="flex flex-col">
          <label className="form-label text-md">Password</label>
          <div className="input">
            <i className="ki-filled ki-lock-2" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              autoComplete="off"
              {...formik.getFieldProps("password")}
              className={clsx("form-control", {
                "is-invalid": formik.touched.password && formik.errors.password,
              })}
            />
            <button type="button" className="btn btn-icon" onClick={togglePassword}>
              <KeenIcon icon="eye"       className={clsx("text-gray-500", { hidden: !showPassword })} />
              <KeenIcon icon="eye-slash" className={clsx("text-gray-500", { hidden: showPassword })} />
            </button>
          </div>
          {formik.touched.password && formik.errors.password && (
            <span role="alert" className="text-danger text-sm mt-1">{formik.errors.password}</span>
          )}
        </div>

        {/* Links */}
        <div className="flex items-center justify-between gap-1">
          <Link
            to={currentLayout?.name === "auth-branded" ? "/auth/otp-login" : "/auth/classic/reset-password"}
            className="text-sm link shrink-0 hover:underline no-underline"
          >
            Login with OTP instead
          </Link>
          <Link
            to={currentLayout?.name === "auth-branded" ? "/auth/reset-password" : "/auth/classic/reset-password"}
            className="text-sm link shrink-0 hover:underline no-underline"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          className="btn btn-primary flex justify-center grow mt-3"
          disabled={loading || formik.isSubmitting}
        >
          {loading ? "Please wait..." : "Login to Your Account"}
        </button>

        <div className="flex items-center gap-2 my-2">
          <span className="border-t border-gray-200 w-full" />
          <span className="text-md text-gray-500 font-medium uppercase">Or</span>
          <span className="border-t border-gray-200 w-full" />
        </div>

        <div className="flex items-center justify-center">
          <span className="text-md text-gray-700 me-1.5">Don't have an account?</span>
          <Link
            to={currentLayout?.name === "auth-branded" ? "/auth/signup" : "/auth/classic/signup"}
            className="text-md link hover:underline font-medium no-underline"
          >
            Sign Up
          </Link>
        </div>
      </form>

      <PlanExpire open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

export { Login };