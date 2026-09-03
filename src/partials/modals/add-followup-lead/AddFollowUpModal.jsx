import React, { useState, useEffect } from "react";
import { Modal, Select, Input, DatePicker, Button } from "antd";
import dayjs from "dayjs";
import { Fetchmanager } from "@/services/apiServices";

export default function AddFollowUpModal({
  isOpen,
  onClose,
  onSave,
  clientName,
  viewOnlyFollowUp,
  defaultManager,
  isSaving,
}) {
  const [customerName, setCustomerName] = useState("");
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [description, setDescription] = useState("");
  const [followType, setFollowType] = useState("Call");
  const [followupDate, setFollowupDate] = useState(null);

  const isViewOnly = !!viewOnlyFollowUp;

  useEffect(() => {
    if (!isOpen) return;
    if (viewOnlyFollowUp?.memberId) {
      setSelectedManager(Number(viewOnlyFollowUp.memberId));
    } else if (defaultManager) {
      setSelectedManager(Number(defaultManager));
    } else {
      setSelectedManager(null);
    }
  }, [isOpen, viewOnlyFollowUp, defaultManager]);

  useEffect(() => {
    if (!isOpen) return;
    Fetchmanager(1)
      .then((res) => {
        if (res?.data?.data?.userDetails) {
          setManagers(
            res.data.data.userDetails.map((man) => ({
              value: man.id,
              label: man.firstName || "-",
            })),
          );
        }
      })
      .catch((err) => {
        console.error("Failed to fetch managers:", err);
        setManagers([]);
      });
  }, [isOpen]);

  useEffect(() => {
    if (isViewOnly && viewOnlyFollowUp) {
      setCustomerName(clientName || "");
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

  // ✅ No onClose here — parent closes modal after API succeeds
  const handleSave = () => {
    if (!customerName || !followupDate) {
      alert("Customer Name and Followup Date are required");
      return;
    }
    onSave({
      customerName,
      clientRemarks: description,
      description,
      followUpType: followType,
      followupDate: dayjs(followupDate).format("DD/MM/YYYY hh:mm A"),
      managerId: selectedManager,
    });
  };

  return (
    <Modal
      title={isViewOnly ? "View Follow Up" : "Add Follow Up"}
      open={isOpen}
      onCancel={() => onClose(false)}
      footer={null}
      centered
      width={700}
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

        {/* Assign Member */}
        <div className="flex flex-col">
          <label className="form-label mb-1">Assign Member</label>
          <Select
            placeholder="Select Member"
            options={managers}
            value={selectedManager || undefined}
            onChange={(value) => setSelectedManager(value)}
            disabled={isViewOnly}
            className="w-full"
            showSearch
            optionFilterProp="label"
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
                disabled={isViewOnly}
                className={`py-2 rounded-lg text-sm border transition ${
                  followType === type
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-gray-100 text-gray-700"
                } ${isViewOnly ? "cursor-not-allowed opacity-60" : ""}`}
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

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <Button onClick={() => onClose(false)} disabled={isSaving}>
            Close
          </Button>
          {!isViewOnly && (
            <Button
              type="primary"
              onClick={handleSave}
              disabled={isSaving}
              loading={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
