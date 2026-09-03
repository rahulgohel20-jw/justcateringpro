import { useState, useEffect } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { getUserById } from "@/services/apiServices";

const ViewMember = ({ isModalOpen, setIsModalOpen, selectedMember }) => {
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen && selectedMember?.id) {
      setLoading(true);
      getUserById(selectedMember.id)
        .then((res) => {
          const member = res.data.data["User Details"][0];
          setMemberData((prev) => ({
            ...member,
          }));
        })
        .catch((err) => console.error("Error fetching member:", err))
        .finally(() => setLoading(false));
    }
  }, [isModalOpen]);

  return (
    <CustomModal
      open={isModalOpen}
      onClose={handleModalClose}
      title={"View Member"}
      width={700}
      footer={[
        <div className="flex justify-between" key={"footer-buttons"}>
          <button
            key="cancel"
            className="btn btn-light"
            onClick={handleModalClose}
            title="Cancel"
          >
            Cancel
          </button>
        </div>,
      ]}
    >
      {!loading && memberData && (
        <div
          key={memberData?.id}
          className="border rounded-xl shadow-sm p-4 bg-white"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b pb-2 mb-2">
            <h2 className="text-lg font-semibold">
              {memberData?.firstName} {memberData?.lastName}
            </h2>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                memberData?.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {memberData?.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <p>
              <span className="font-semibold">Email:</span> {memberData?.email}
            </p>
            <p>
              <span className="font-semibold">WhatsApp No:</span>{" "}
              {memberData?.contactNo}
            </p>
            <p>
              <span className="font-semibold">Company:</span>{" "}
              {memberData?.userBasicDetails?.companyName}
            </p>
            <p>
              <span className="font-semibold">Office No:</span>{" "}
              {memberData?.userBasicDetails?.officeNo}
            </p>
            <p>
              <span className="font-semibold">Company Email:</span>{" "}
              {memberData?.userBasicDetails?.companyEmail}
            </p>
            <p>
              <span className="font-semibold">Address:</span>{" "}
              {memberData?.userBasicDetails?.address}
            </p>
            <p>
              <span className="font-semibold">Role:</span>{" "}
              {memberData?.userBasicDetails?.role?.name}
            </p>
            <p>
              <span className="font-semibold">Created At:</span>{" "}
              {memberData?.createdAt}
            </p>
          </div>

          {/* Location */}
          <div className="mt-3 text-sm">
            <p>
              <span className="font-semibold">Country:</span>{" "}
              {(selectedMember, "ASd")}
              {memberData?.userBasicDetails?.country?.name}
            </p>
            <p>
              <span className="font-semibold">State:</span>{" "}
              {memberData?.userBasicDetails?.state?.name}
            </p>
            <p>
              <span className="font-semibold">City:</span>{" "}
              {memberData?.userBasicDetails?.city?.name}
            </p>
          </div>

          {/* Plan Info */}
          <div className="mt-3 p-3 border rounded-lg bg-gray-50">
            <p className="font-semibold">
              Plan: {memberData?.plan?.name} (₹{memberData?.plan?.price}/
              {memberData?.plan?.billingCycle})
            </p>
            <p className="text-sm">{memberData?.plan?.description}</p>
            <ul className="list-disc pl-5 text-sm mt-1">
              {memberData?.plan?.features?.map((f) => (
                <li key={f.id}>{f.featureText}</li>
              ))}
            </ul>
          </div>

          {/* Access */}
          <div className="mt-3 flex gap-4 text-sm">
            <p>
              <span className="font-semibold">Task Access:</span>{" "}
              {memberData?.userBasicDetails?.isTaskAccess ? "Yes" : "No"}
            </p>
            <p>
              <span className="font-semibold">Leave & Attendance Access:</span>{" "}
              {memberData?.userBasicDetails?.isAttendanceLeaveAccess
                ? "Yes"
                : "No"}
            </p>
          </div>
        </div>
      )}
    </CustomModal>
  );
};

export default ViewMember;
