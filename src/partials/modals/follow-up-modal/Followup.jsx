import React, { useState, useEffect } from "react";
import { Modal, Input, Select, DatePicker } from "antd";
import dayjs from "dayjs";
import Swal from "sweetalert2";
import AddFollowUpModal from "../add-followup-lead/FollowUpModal";
import { Deletebyfollowupid } from "@/services/apiServices";
const { TextArea } = Input;
const { Option } = Select;

const FollowUp = ({
  isOpen,
  onClose,
  onSave,
  clientName,
  leadData,
  viewOnlyFollowUp = null,
  existingFollowUps = [],
  onRefresh,
  isSaving,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [localFollowUps, setLocalFollowUps] = useState(existingFollowUps);
  const [searchText, setSearchText] = useState("");
  const handleDelete = async (followUpId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await Deletebyfollowupid(followUpId);

        await Swal.fire({
          title: "Deleted!",
          text: "Follow-up has been deleted.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        if (onRefresh) {
          await onRefresh();
        }
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Something went wrong.",
          icon: "error",
        });
      }
    }
  };

  const isViewMode = !!viewOnlyFollowUp;

  // ✅ Add logging to debug
  useEffect(() => {
    setLocalFollowUps(existingFollowUps);
  }, [existingFollowUps]);

  // ✅ Add logging
  useEffect(() => {}, [localFollowUps]);

  const handleSaveFromAddModal = async (followUpData) => {
    // Call the parent's onSave (which will call the API)
    await onSave(followUpData);

    // Close add modal
    setIsAddModalOpen(false);

    // Refresh
    if (onRefresh) {
      await onRefresh();
    }
  };
  const filteredFollowUps = localFollowUps.filter((item) => {
    const search = searchText.trim().toLowerCase();

    if (!search) return true;

    return (
      clientName?.toLowerCase().includes(search) ||
      item?.followUpType?.toLowerCase().includes(search) ||
      item?.clientRemarks?.toLowerCase().includes(search) ||
      item?.memberNameEnglish?.toLowerCase().includes(search) ||
      item?.followUpDate?.toLowerCase().includes(search)
    );
  });

  return (
    <>
      <Modal
        title={
          <div className="text-lg font-semibold text-gray-900">Follow Up</div>
        }
        open={isOpen}
        onCancel={onClose}
        footer={null}
        width={900}
        destroyOnClose
      >
        <div className="space-y-4 pt-4">
          {/* Filter Section */}
          <div className="flex flex-wrap gap-3 items-center mb-6">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder="Search follow-ups"
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="flex gap-3 ml-auto">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 text-sm font-medium"
              >
                <i className="ki-filled ki-plus"></i> Add Follow Up
              </button>
            </div>
          </div>

          {/* Follow-Up List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {/* ✅ Add debug info */}

            {filteredFollowUps && filteredFollowUps.length > 0 ? (
              filteredFollowUps.map((item, index) => (
                <div
                  key={index}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-lg flex-shrink-0">
                      {clientName?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base">
                            {clientName || "N/A"}
                          </h3>
                          <span> {item.clientRemarks}</span>
                        </div>

                        <div className="text-right ml-4">
                          <div className="flex items-center gap-1 text-sm">
                            <span className="text-gray-500">Type:</span>
                            <span className="text-gray-900 font-medium">
                              {item.followUpType || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm mt-1">
                            <span className="text-gray-500">Reminder:</span>
                            <span className="text-gray-900 font-medium">
                              {item.followUpDate || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-sm mt-1">
                            <span className="text-gray-500">Created At:</span>
                            <span className="text-gray-900 font-medium">
                              {item.createdAt || "N/A"}
                            </span>
                          </div>
                        </div>

                        {/* Status Dropdown */}
                      </div>

                      <hr className="my-3 border-gray-200" />

                      {/* Contact Info */}
                      <div className="flex items-center gap-6 text-sm text-gray-600 flex-wrap">
                        <div className="flex items-center gap-2">
                          <i className="ki-filled ki-sms text-gray-400"></i>
                          <span>{leadData?.emailId || "No Email"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <i className="ki-filled ki-phone text-gray-400"></i>
                          <span>{leadData?.contactNumber || "No Contact"}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="ml-auto flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-gray-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50"
                          >
                            <i className="ki-filled ki-trash text-lg"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <i className="ki-filled ki-calendar-remove text-6xl mb-3 text-gray-300"></i>
                <p className="text-sm">No Follow-Up Found</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* ✅ CHANGE: Use AddFollowUpModal instead of FollowUpModal */}
      {isAddModalOpen && (
        <AddFollowUpModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveFromAddModal}
          clientName={clientName}
          viewOnlyFollowUp={null}
          defaultManager={leadData.leadAssignId}
          isSaving={isSaving}
          calledFromFollowUp={true}
          leadId={leadData?.leadId}
          onRefresh={onRefresh}
        />
      )}
    </>
  );
};

export default FollowUp;
