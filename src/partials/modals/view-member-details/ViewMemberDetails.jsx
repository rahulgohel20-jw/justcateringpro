import { CustomModal } from "@/components/custom-modal/CustomModal";

const ViewMemberDetails = ({ isModalOpen, setIsModalOpen, memberData }) => {
  if (!isModalOpen) return null;

  return (
    <CustomModal
      open={isModalOpen}
      title="View Member Details"
      onClose={() => setIsModalOpen(false)}
      footer={[
        <button
          key="close-btn"
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md mr-2"
        >
          Close
        </button>,
      ]}
    >
      <div className="space-y-3">
        {/* Name */}
        <div className="flex">
          <span className="w-28 font-semibold text-gray-700">Full Name:</span>
          <span className="text-gray-800">{memberData.full_name || "-"}</span>
        </div>

        {/* Slogan */}
        <div className="flex">
          <span className="w-28 font-semibold text-gray-700">Last Name:</span>
          <span className="text-gray-800">{memberData.lastName || "-"}</span>
        </div>

        {/* Price */}
        <div className="flex">
          <span className="w-28 font-semibold text-gray-700">Price:</span>
          <span className="text-gray-800">{memberData.price || "-"}</span>
        </div>

        {/* Priority */}
        <div className="flex">
          <span className="w-28 font-semibold text-gray-700">Priority:</span>
          <span className="text-gray-800">{memberData.sequence || "-"}</span>
        </div>
      </div>
    </CustomModal>
  );
};

export default ViewMemberDetails;
