import { useState } from "react";
import { CustomModal } from "../../../components/custom-modal/CustomModal";

const ViewCustomer = ({ isModalOpen, setIsModalOpen, selectedCustomer }) => {
  if (!isModalOpen) return null;

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <CustomModal
      title={"View Customer"}
      open={isModalOpen}
      onClose={handleModalClose}
      width={900}
      footer={[
        <button
          key="close"
          onClick={handleModalClose}
          className="btn btn-secondary"
        >
          Close
        </button>,
      ]}
    >
      <div className="overflow-y-auto max-h-[90vh]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name Fields */}
          <div className="flex">
            <span className="w-48 font-semibold text-gray-700">
              Name (English):
            </span>
            <span className="text-gray-800">
              {selectedCustomer?.customer || "-"}
            </span>
          </div>
          <div className="flex">
            <span className="w-48 font-semibold text-gray-700">
              Name (ગુજરાતી):
            </span>
            <span className="text-gray-800">
              {selectedCustomer?.nameGujarati || "-"}
            </span>
          </div>
          <div className="flex">
            <span className="w-48 font-semibold text-gray-700">
              Name (हिंदी):
            </span>
            <span className="text-gray-800">
              {selectedCustomer?.nameHindi || "-"}
            </span>
          </div>

          {/* Address */}
          <div className="flex">
            <span className="w-48 font-semibold text-gray-700">
              Address (English):
            </span>
            <span className="text-gray-800">
              {selectedCustomer?.customer || "-"}
            </span>
          </div>
          <div className="flex">
            <span className="w-48 font-semibold text-gray-700">
              Address (ગુજરાતી):
            </span>
            <span className="text-gray-800">
              {selectedCustomer?.addressGujarati || "-"}
            </span>
          </div>
          <div className="flex">
            <span className="w-48 font-semibold text-gray-700">
              Address (हिंदी):
            </span>
            <span className="text-gray-800">
              {selectedCustomer?.addressHindi || "-"}
            </span>
          </div>

          {/* Contact Category */}
          <div className="flex">
            <span className="w-48 font-semibold text-gray-700">
              Contact Category:
            </span>
            <span className="text-gray-800">
              {selectedCustomer.contact_type || "-"}
            </span>
          </div>

          {/* Email */}
          <div className="flex">
            <span className="w-48 font-semibold text-gray-700">Email:</span>
            <span className="text-gray-800">
              {selectedCustomer?.email || "-"}
            </span>
          </div>

          {/* Mobile Numbers */}
          <div className="flex">
            <span className="w-48 font-semibold text-gray-700">
              Mobile Number:
            </span>
            <span className="text-gray-800">
              {selectedCustomer?.mobileno || "-"}
            </span>
          </div>
          <div className="flex">
            <span className="w-48 font-semibold text-gray-700">
              Alternative Number:
            </span>
            <span className="text-gray-800">
              {selectedCustomer?.altMobileno || "-"}
            </span>
          </div>

          {/* GST */}
          <div className="flex">
            <span className="w-48 font-semibold text-gray-700">
              GST Number:
            </span>
            <span className="text-gray-800">
              {selectedCustomer?.gst || "-"}
            </span>
          </div>

          {/* Birth Date */}
          <div className="flex">
            <span className="w-48 font-semibold text-gray-700">
              Birth Date:
            </span>
            <span className="text-gray-800">
              {selectedCustomer?.birthdate || "-"}
            </span>
          </div>

          {/* Document Type */}
          <div className="flex">
            <span className="w-48 font-semibold text-gray-700">Document:</span>
            <span className="text-gray-800">
              {selectedCustomer?.document || "-"}
            </span>
          </div>

          {/* Document Upload */}
          <div className="flex items-start">
            <span className="w-48 font-semibold text-gray-700">
              Uploaded Document:
            </span>
            {selectedCustomer?.docPath ? (
              <img
                src={selectedCustomer?.docPath}
                alt="Preview"
                className="w-20 h-20 rounded-lg object-cover border border-gray-300"
              />
            ) : (
              <span className="text-gray-400">No document uploaded</span>
            )}
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default ViewCustomer;
