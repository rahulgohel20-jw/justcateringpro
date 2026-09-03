import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserById, LoginWithOtp } from "@/services/apiServices";
import { useAuthStore } from "@/store/useAuthStore";
import { normalizeRights } from "@/utils/normalizeRights";
import { Alert } from "@/components";
import { useAuthContext } from "@/auth";
import { message } from "antd";

const Loginwithotp = () => {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phone, setPhone] = useState("");
  const [alertMsg, setAlertMsg] = useState(null);
  const { loginWithOtp } = useAuthContext();
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const email = localStorage.getItem("otp_email");
  const password = localStorage.getItem("otp_password");

  // ✅ Step 1: On mount — read phone from localStorage and send OTP
  useEffect(() => {
    if (!email || !password) {
      navigate("/auth/login", { replace: true });
      return;
    }

    const savedPhone = localStorage.getItem("otp_phone");
    if (!savedPhone) {
      setAlertMsg("Phone number not found. Please login again.");
      return;
    }

    setPhone(savedPhone);
    sendOtp(savedPhone);
  }, []);

  // ✅ Step 2: Send OTP to phone
  const sendOtp = async (phoneNumber) => {
    setLoading(true);
    setAlertMsg(null);
    try {
      const response = await LoginWithOtp(phoneNumber);
      if (response?.data?.success) {
        setOtpSent(true);
        message.success("OTP sent to your registered mobile number");
      } else {
        setAlertMsg(response?.data?.msg || "Unable to send OTP");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setAlertMsg("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 2: Enter OTP → call LoginUser({ email, password, otp }) directly
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setAlertMsg("Please enter a valid OTP");
      return;
    }

    setLoading(true);
    setAlertMsg(null);

    try {
      // ✅ Direct login with email + password + otp (no separate verify step)
      const auth = await loginWithOtp(email, password, otp);
      

      const userId = auth?.userId;
      if (!userId) throw new Error("User ID not found.");

      const userResponse = await getUserById(userId);
      const userData = userResponse?.data.data["User Details"];

      if (!Array.isArray(userData) || userData.length === 0) {
        throw new Error("Failed to fetch user details.");
      }

      const userDetails = userData[0];
      const clientId = userDetails?.clientId;
      const rawRights = userDetails?.userRights || [];
      const roleId = Number(userDetails?.userBasicDetails?.role?.id);
      const upgradedModules = userDetails?.userUpgradedModule || [];
      const normalizedRights = normalizeRights(rawRights);

      setAuth(
        { id: userId, roleId, clientId },
        auth?.access_token,
        normalizedRights,
        upgradedModules,
      );

      localStorage.removeItem("otp_email");
      localStorage.removeItem("otp_password");
      localStorage.removeItem("otp_phone");

      message.success("Login successful!");
      navigate("/super-dashboard", { replace: true });
    } catch (error) {
      console.error("OTP verify error:", error);
      setAlertMsg(error.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card max-w-[390px] w-full">
      <div className="card-body flex flex-col gap-4 p-5 md:p-7">
        <div className="mb-2.5">
          <h3 className="text-lg font-semibold text-gray-900 leading-none mb-2">
            OTP Verification
          </h3>
          <span className="text-sm text-gray-700">
            {otpSent
              ? "OTP has been sent to your registered mobile number."
              : "Sending OTP to your registered mobile number..."}
          </span>
        </div>

        {alertMsg && <Alert variant="danger">{alertMsg}</Alert>}

        <div className="flex flex-col">
          <label className="form-label">Enter OTP</label>
          <div className="input">
            <i className="ki-filled ki-shield-tick"></i>
            <input
              placeholder="Enter OTP received on phone"
              autoComplete="off"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              disabled={!otpSent || loading}
              className="form-control"
            />
          </div>
        </div>

        {otpSent && (
          <button
            type="button"
            className="text-sm link text-left hover:underline w-fit"
            onClick={() => sendOtp(phone)}
            disabled={loading}
          >
            Resend OTP
          </button>
        )}

        <button
          type="button"
          className="btn btn-primary flex justify-center grow mt-2"
          onClick={handleVerifyOtp}
          disabled={loading || !otpSent || !otp}
        >
          {loading ? "Please wait..." : "Verify OTP & Login"}
        </button>

        <div className="flex items-center justify-center mt-1">
          <span className="text-sm text-gray-700 me-1.5">Back to</span>
          <Link
            to="/auth/login"
            className="text-sm link hover:underline font-medium no-underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export { Loginwithotp };
