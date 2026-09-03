import { useState, useMemo } from "react";
import { Modal, Select, InputNumber, message } from "antd";
import dayjs from "dayjs";
import { UpdateUserPlan } from "../../../../services/apiServices";

const ExtendDate = ({
  isModalOpen,
  setIsModalOpen,
  userId,
  openOtpModal,
  setExtendPayload,
  Alluser,
}) => {
  const [type, setType] = useState("days");
  const [value, setValue] = useState(1);
  const [loading, setLoading] = useState(false);

  const selectedUser = useMemo(
    () => Alluser?.find((user) => user.id === userId),
    [Alluser, userId],
  );

  const currentEndDate = useMemo(() => {
    const rawDate = selectedUser?.enddate;
    if (!rawDate) return dayjs();
    const parsed = dayjs(rawDate, "DD/MM/YYYY hh:mm A");
    return parsed.isValid() ? parsed : dayjs();
  }, [selectedUser]);

  const extendedDate = useMemo(() => {
    if (!value) return currentEndDate;
    switch (type) {
      case "days":
        return currentEndDate.add(value, "day");
      case "weeks":
        return currentEndDate.add(value, "week");
      case "months":
        return currentEndDate.add(value, "month");
      default:
        return currentEndDate;
    }
  }, [type, value, currentEndDate]);

  const handleSave = async () => {
    const formattedDate = extendedDate.format("DD/MM/YYYY");
    try {
      setLoading(true);
      const res = await UpdateUserPlan(formattedDate, userId, "-1", {});

      if (res?.data?.msg === "User Plan Date Updated Failed") {
        message.success("OTP sent successfully");
        setExtendPayload({ date: formattedDate, userId, data: {} });
        setIsModalOpen(false);
        openOtpModal();
      } else {
        message.error(res?.data?.msg || "Failed to send OTP");
      }
    } catch (error) {
      console.error(error);
      message.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setValue(1);
    setType("days");
  };

  return (
    <Modal
      open={isModalOpen}
      onCancel={handleClose}
      getContainer={document.body}
      centered
      maskClosable={false}
      keyboard={false}
      footer={null}
      closable={false}
      width={500}
      title={
        <div>
          <div className="flex justify-between items-center pb-2">
            <span className="text-base font-medium">Extend Subscription</span>
            <button
              type="button"
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="ki-filled ki-cross text-xl"></i>
            </button>
          </div>
          <hr className="border-0 h-[1px] bg-[#BABABAB2]" />
        </div>
      }
    >
      <div className="flex flex-col gap-4 p-2">
        {/* Current End Date from selected user */}
        <p className="text-l text-black">
          Current End Date:
          <span className="font-medium">
            {" "}
            {currentEndDate.format("DD MMM YYYY")}
          </span>
        </p>

        {/* Input Section */}
        <div className="flex gap-3 items-center">
          <InputNumber
            min={1}
            value={value}
            onChange={setValue}
            className="w-32"
            placeholder="Enter number"
          />
          <Select
            value={type}
            onChange={setType}
            className="w-40"
            getPopupContainer={() => document.body}
            options={[
              { label: "Days", value: "days" },
              { label: "Weeks", value: "weeks" },
              { label: "Months", value: "months" },
            ]}
          />
        </div>

        {/* Extended Date Preview */}
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-black font-bold">New End Date</p>
          <p className="text-lg font-semibold text-primary">
            {extendedDate.format("DD MMM YYYY")}
          </p>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-3">
          <button
            className="btn btn-primary"
            disabled={loading}
            onClick={handleSave}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ExtendDate;
