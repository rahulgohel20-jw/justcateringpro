import { useEffect, useRef, useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { updateStatusApprove } from "@/services/apiServices";
import { message } from "antd";
import {
  UpdateUserPlan,
  DeleteUserById,
  UserBlock,
  transfermember,
  isActiveUpgradeModule,
  isActiveUserNotification,
} from "../../../../services/apiServices";
import Swal from "sweetalert2";

const OTP_LENGTH = 6;

const ApproveOtp = ({
  isModalOpen,
  setIsModalOpen,
  userId,
  refreshData,
  action,
  extendPayload,
  upgradePayload,
  toggleActivePayload,
}) => {
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(37);
  const [convertType, setConvertType] = useState("demo");
  const inputsRef = useRef([]);

  useEffect(() => {
    if (!isModalOpen || timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) {
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimer(37);
      setConvertType("demo");
    }
  }, [isModalOpen]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }

    if (index === OTP_LENGTH - 1 && value) {
      const enteredOtp = newOtp.join("");
      if (enteredOtp.length === OTP_LENGTH) {
        handleVerify(enteredOtp);
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      const enteredOtp = otp.join("");
      if (enteredOtp.length === OTP_LENGTH) {
        handleVerify(enteredOtp);
      }
    }
  };

  const handleVerify = async (otpOverride) => {
    const enteredOtp = otpOverride ?? otp.join("");
    if (enteredOtp.length !== OTP_LENGTH) {
      message.warning("Please enter complete OTP");
      return;
    }

    try {
      let res;

      if (action === "extend") {
        res = await UpdateUserPlan(
          extendPayload.date,
          extendPayload.userId,
          enteredOtp,
        );

        if (res?.data?.success) {
          message.success("Plan extended successfully");
          setIsModalOpen(false);
          setOtp(Array(OTP_LENGTH).fill(""));
          refreshData();
        } else {
          message.error(res?.data?.msg || "Invalid OTP");
        }
      } else if (action === "delete") {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "This user will be permanently deleted. This action cannot be undone!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Yes, delete it!",
          cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        res = await DeleteUserById(userId, enteredOtp, true);

        if (res?.data?.success) {
          await Swal.fire({
            title: "Deleted!",
            text: "User has been deleted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          setIsModalOpen(false);
          setOtp(Array(OTP_LENGTH).fill(""));
          refreshData();
        } else {
          Swal.fire({
            title: "Failed!",
            text: res?.data?.msg || "Invalid OTP or deletion failed.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        }
      } else if (action === "convert") {
        res = await transfermember(enteredOtp, convertType, userId);

        if (res?.data?.success) {
          await Swal.fire({
            title: "Converted!",
            text: "User has been converted successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          setIsModalOpen(false);
          setOtp(Array(OTP_LENGTH).fill(""));
          refreshData();
        } else {
          Swal.fire({
            title: "Failed!",
            text: res?.data?.msg || "Invalid OTP or conversion failed.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        }
      } else if (action === "block") {
        const result = await Swal.fire({
          title: "Are you sure?",
          text: "This user will be Block.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Yes, block it!",
          cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        res = await UserBlock(userId, enteredOtp);

        if (res?.data?.success) {
          await Swal.fire({
            title: "Blocked!",
            text: "User has been Blocked successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          setIsModalOpen(false);
          setOtp(Array(OTP_LENGTH).fill(""));
          refreshData();
        } else {
          Swal.fire({
            title: "Failed!",
            text: res?.data?.msg || "Invalid OTP or User block failed.",
            icon: "error",
            confirmButtonColor: "#d33",
          });
        }
     } else if (action === "toggleModuleActive") {
  // ── Split modules: isConfig ones go through isActiveUserNotification, rest through isActiveUpgradeModule ──
  const configModuleIds = toggleActivePayload
    .filter((m) => m.isConfig === true)
    .map((m) => m.moduleId);
  const regularModuleIds = toggleActivePayload
    .filter((m) => m.isConfig !== true)
    .map((m) => m.moduleId);

  let allSuccess = true;
  let failMsg = "";

  // ── Config modules — activate via isActiveUserNotification (form data) ──
  if (configModuleIds.length > 0) {
    const configFormData = new FormData();
    configFormData.append("isActive", true);
    configModuleIds.forEach((id) => configFormData.append("moduleId", id)); // array[integer]
    configFormData.append("otp", enteredOtp);
    configFormData.append("userId", userId);

    const configRes = await isActiveUserNotification(configFormData);

    if (!configRes?.data?.success) {
      allSuccess = false;
      failMsg = configRes?.data?.msg || "Invalid OTP or activation failed.";
    }
  }

  // ── Regular modules — verified via OTP through isActiveUpgradeModule ──
  if (allSuccess && regularModuleIds.length > 0) {
    res = await isActiveUpgradeModule(
      true,
      enteredOtp,
      userId,
      regularModuleIds, // ✅ [1, 2] — API accepts array[integer]
    );

    if (!res?.data?.success) {
      allSuccess = false;
      failMsg = res?.data?.msg || "Invalid OTP or activation failed.";
    }
  }

  if (allSuccess) {
    await Swal.fire({
      title: "Success!",
      text: "Modules activated successfully.",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
    setIsModalOpen(false);
    setOtp(Array(OTP_LENGTH).fill(""));
    refreshData();
  } else {
    Swal.fire({
      title: "Failed!",
      text: failMsg,
      icon: "error",
      confirmButtonColor: "#d33",
    });
  }
} else {
        res = await updateStatusApprove(enteredOtp, userId);

        if (res?.data?.success) {
          await Swal.fire({
            title: "Approved",
            text: "User has been Approved successfully.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
          setIsModalOpen(false);
          setOtp(Array(OTP_LENGTH).fill(""));
          refreshData();
        }
      }
    } catch (error) {
      message.error("Failed to verify OTP");
    }
  };

  const handleResend = () => {
    setOtp(Array(OTP_LENGTH).fill(""));
    setTimer(37);
    inputsRef.current[0]?.focus();
  };

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`OTP for ${action?.toUpperCase()}`}
        width={420}
        footer={null}
      >
        <div className="flex flex-col items-center px-4 sm:px-6 py-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            OTP Verification For{" "}
            {action?.charAt(0).toUpperCase() + action?.slice(1)}
          </h2>

          <p className="mt-2 text-sm text-gray-500 max-w-xs">
            Please enter the one time password to verify your account.
          </p>

          <p className="mt-3 text-sm text-gray-700">
            A code has been sent to{" "}
            <span className="font-semibold">8866889580</span>
          </p>

          {action === "convert" && (
            <div className="mt-4 w-full max-w-sm text-left">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Convert To
              </label>
              <select
                value={convertType}
                onChange={(e) => setConvertType(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-primary"
              >
                <option value="demo">Demo</option>
                <option value="lead">Lead</option>
                <option value="member">Member</option>
              </select>
            </div>
          )}

          <div className="mt-6 flex gap-2 sm:gap-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="
                  w-10 h-12 sm:w-12 sm:h-14
                  rounded-lg border border-gray-300
                  text-center text-lg font-semibold
                  focus:outline-none focus:border-primary
                "
              />
            ))}
          </div>

          <button
            onClick={() => handleVerify()}
            className="
              mt-6 w-full max-w-sm
              rounded-lg bg-primary py-3
              text-sm font-semibold text-white
              hover:bg-Primary transition
            "
          >
            Verify &amp; Proceed
          </button>
        </div>
      </CustomModal>
    )
  );
};

export default ApproveOtp;