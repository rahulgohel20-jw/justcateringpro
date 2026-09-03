import React, { useState, useEffect } from "react";
import { Modal, Select, Input, DatePicker, Button } from "antd";
import dayjs from "dayjs";
import { Fetchmanager, addupdatefollowupmodal } from "@/services/apiServices";
import Swal from "sweetalert2";
export default function AddFollowUpModal({
  isOpen,
  onClose,
  onSave,
  clientName,
  viewOnlyFollowUp,
  defaultManager,
  zIndex,
  calledFromFollowUp,
  leadId,
  onRefresh,
}) {
  const [customerName, setCustomerName] = useState("");
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);

  const [description, setDescription] = useState("");
  const [followType, setFollowType] = useState("Call");
  const [followupDate, setFollowupDate] = useState(null);
  const [isSavingLocal, setIsSavingLocal] = useState(false);
  // Determine if modal is view-only
  const isViewOnly = !!viewOnlyFollowUp;

  useEffect(() => {
    if (isOpen) {
      if (viewOnlyFollowUp?.memberId) {
        setSelectedManager(viewOnlyFollowUp.memberId);
      } else if (defaultManager) {
        setSelectedManager(defaultManager);
      }
    }
  }, [isOpen, defaultManager, viewOnlyFollowUp]);

  useEffect(() => {
    const FetchManager = () => {
      const userId = localStorage.getItem("userId");
      Fetchmanager(userId)
        .then((res) => {
          if (res?.data?.data?.userDetails) {
            const managerList = res.data.data.userDetails.map((man) => ({
              value: man.id,
              label: man.firstName || "-",
            }));
            setManagers(managerList);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch managers:", err);
          setManagers([]);
        });
    };

    if (isOpen) {
      FetchManager();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isViewOnly && viewOnlyFollowUp) {
      setCustomerName(clientName || ""); // use lead clientName
      setDescription(viewOnlyFollowUp.clientRemarks || "");
      setFollowType(viewOnlyFollowUp.followUpType || "Call");
      setFollowupDate(
        viewOnlyFollowUp.followUpDate
          ? dayjs(viewOnlyFollowUp.followUpDate)
          : null,
      );
    } else if (clientName) {
      setCustomerName(clientName);
      setDescription("");
      setFollowType("Call");
      setFollowupDate(null);
    }
  }, [viewOnlyFollowUp, clientName, isOpen]);

  const handleSave = async () => {
    if (!customerName || !followupDate) {
      alert("Customer Name and Followup Date are required");
      return;
    }

    const followUpPayload = {
      clientRemarks: description,
      employeeRemarks: "",
      followUpDate: dayjs(followupDate).format("DD/MM/YYYY hh:mm A"),
      followUpStatus: "Open",
      followUpType: followType,
      id: 0,
      leadId: leadId,
      memberId: selectedManager || 0,
    };

    if (calledFromFollowUp) {
      try {
        setIsSavingLocal(true);
        await addupdatefollowupmodal([followUpPayload]);
        Swal.fire({
          title: "Success",
          text: "Follow-up added successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });

        setCustomerName("");
        setDescription("");
        setFollowType("Call");
        setFollowupDate(null);
        setSelectedManager(null);

        onClose(false);
        if (onRefresh) await onRefresh();
      } catch (err) {
        Swal.fire("Error", "Failed to save follow-up.", "error");
      } finally {
        setIsSavingLocal(false);
      }
    } else {
      onSave({
        customerName,
        clientRemarks: description,
        description,
        followUpType: followType,
        followupDate: dayjs(followupDate).format("DD/MM/YYYY hh:mm A"),
        memberId: selectedManager,
      });

      setCustomerName("");
      setDescription("");
      setFollowType("Call");
      setFollowupDate(null);
      setSelectedManager(null);

      onClose(false);
    }
  };

  return (
    <Modal
      title={isViewOnly ? "View Follow Up" : "Add Follow Up"}
      open={isOpen}
      onCancel={() => onClose(false)}
      footer={null}
      centered
      width={700}
      zIndex={zIndex || 1100}
    >
      <div className="space-y-5 p-2">
        {/* Customer Name */}
        <div className="flex flex-col">
          <label className="form-label mb-1">Customer Name</label>
          <Input
            placeholder="Enter customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            readOnly={isViewOnly}
          />
        </div>
        {/* Manager Dropdown */}
        <div className="flex flex-col">
          <label className="form-label mb-1">Assign Member</label>
          <Select
            placeholder="Select Member"
            options={managers}
            value={selectedManager}
            onChange={(value) => setSelectedManager(value)}
            disabled={isViewOnly}
            className="w-full"
          />
        </div>

        {/* Description */}
        <Input.TextArea
          rows={4}
          placeholder="Follow Up Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          readOnly={isViewOnly}
        />

        {/* Follow Type */}
        <div>
          <p className="text-gray-700 mb-2">Follow Up Type</p>
          <div className="grid grid-cols-3 gap-3">
            {["Call", "WhatsApp", "Email"].map((type) => (
              <button
                key={type}
                onClick={() => !isViewOnly && setFollowType(type)}
                className={`py-2 rounded-lg text-sm border transition ${
                  followType === type
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-gray-100 text-gray-700"
                } ${isViewOnly ? "cursor-not-allowed text-gray-400" : ""}`}
                disabled={isViewOnly}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Followup Date */}
        <div>
          <p className="text-gray-700 mb-2">Followup Date</p>
          <DatePicker
            className="w-full h-11"
            showTime={{ format: "hh:mm A" }}
            format="DD/MM/YYYY hh:mm A"
            value={followupDate}
            onChange={setFollowupDate}
            disabled={isViewOnly}
          />
        </div>

        {/* Footer Buttons */}
        <div
          className="flex justify-end g
        ap-3 mt-6"
        >
          <Button onClick={() => onClose(false)}>Close</Button>
          {!isViewOnly && (
            <Button
              type="primary"
              onClick={handleSave}
              loading={isSavingLocal}
              disabled={isSavingLocal}
            >
              Save
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
