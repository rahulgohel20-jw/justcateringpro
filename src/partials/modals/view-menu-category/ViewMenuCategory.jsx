import { CustomModal } from "@/components/custom-modal/CustomModal";

const ViewMenuCategory = ({ isModalOpen, setIsModalOpen, editData }) => {
  if (!isModalOpen) return null;

  return (
    <CustomModal
      open={isModalOpen}
      title="View Menu Category"
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
          <span className="w-28 font-semibold text-gray-700">Name:</span>
          <span className="text-gray-800">{editData?.nameEnglish || "-"}</span>
        </div>

        {/* Slogan */}
        <div className="flex">
          <span className="w-28 font-semibold text-gray-700">Slogan:</span>
          <span className="text-gray-800">{editData?.menuSlogan || "-"}</span>
        </div>

        {/* Price */}
        <div className="flex">
          <span className="w-28 font-semibold text-gray-700">Price:</span>
          <span className="text-gray-800">{editData?.price || "-"}</span>
        </div>

        {/* Priority */}
        <div className="flex">
          <span className="w-28 font-semibold text-gray-700">Priority:</span>
          <span className="text-gray-800">{editData?.sequence || "-"}</span>
        </div>

        {/* Image */}
        <div className="flex items-start">
          <span className="w-28 font-semibold text-gray-700">Image:</span>
          {editData?.imagePath ? (
            <img
              src={editData.imagePath}
              alt="Category"
              className="rounded-lg w-32 h-32 object-cover border border-gray-300"
            />
          ) : (
            <span className="text-gray-400">No image</span>
          )}
        </div>
      </div>
    </CustomModal>
  );
};

export default ViewMenuCategory;
