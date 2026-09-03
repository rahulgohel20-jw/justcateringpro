import { useState, useEffect } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { Plus, Trash2 } from "lucide-react";
import { Fetchmanager, CreatePipeline } from "@/services/apiServices";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const OPEN_STAGE_OPTIONS = ["Hot", "Cold", "Inquiry"];
const CLOSE_STAGE_OPTIONS = ["Cancel", "Confirmed"];

const Addpipeline = ({ isModalOpen, setIsModalOpen, onSuccess, editData }) => {
  const [pipelineName, setPipelineName] = useState("");
  const [openStages, setOpenStages] = useState([""]);
  const [closeStages, setCloseStages] = useState([""]);
  const [openStagesEnabled, setOpenStagesEnabled] = useState([true]);
  const [closeStagesEnabled, setCloseStagesEnabled] = useState([true]);
  const [managers, setManagers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const userId = localStorage.getItem("userId");
  const [openStageIds, setOpenStageIds] = useState([0]);
  const [closeStageIds, setCloseStageIds] = useState([0]);

  const navigate = useNavigate();
  const isEditMode = !!editData;

  const resetForm = () => {
    setPipelineName("");
    setOpenStages([""]);
    setCloseStages([""]);
    setOpenStagesEnabled([true]);
    setCloseStagesEnabled([true]);
    setOpenStageIds([0]);
    setCloseStageIds([0]);
    setSelectedMember("");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (!isModalOpen) return;

    fetchManagers();
    setErrors({});

    if (editData) {
      setPipelineName(editData.pipelineName || "");

      const osRaw =
        Array.isArray(editData.openStages) && editData.openStages.length > 0
          ? editData.openStages
          : [{ stageId: -1, stageName: "" }];

      const csRaw =
        Array.isArray(editData.closeStages) && editData.closeStages.length > 0
          ? editData.closeStages
          : [{ stageId: -1, stageName: "" }];

      setOpenStages(osRaw.map((s) => s.stageName));
      setCloseStages(csRaw.map((s) => s.stageName));
      setOpenStageIds(osRaw.map((s) => s.stageId ?? -1));
      setCloseStageIds(csRaw.map((s) => s.stageId ?? -1));
      setOpenStagesEnabled(osRaw.map(() => true));
      setCloseStagesEnabled(csRaw.map(() => true));
      setSelectedMember(editData.userId ? String(editData.userId) : "");
    } else {
      setPipelineName("");
      setOpenStages([""]);
      setCloseStages([""]);
      setOpenStagesEnabled([true]);
      setCloseStagesEnabled([true]);
      setOpenStageIds([-1]);
      setCloseStageIds([-1]);
      setSelectedMember("");
    }
  }, [isModalOpen, editData]);

  const fetchManagers = () => {
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
      .catch(() => setManagers([]));
  };

  // Get options not already selected in other rows (excluding current index)
  const getAvailableOpenOptions = (currentIndex) => {
    const selectedElsewhere = openStages.filter((_, i) => i !== currentIndex);
    return OPEN_STAGE_OPTIONS.filter((opt) => !selectedElsewhere.includes(opt));
  };

  const getAvailableCloseOptions = (currentIndex) => {
    const selectedElsewhere = closeStages.filter((_, i) => i !== currentIndex);
    return CLOSE_STAGE_OPTIONS.filter(
      (opt) => !selectedElsewhere.includes(opt),
    );
  };

  const addOpenStage = () => {
    if (openStages.length >= OPEN_STAGE_OPTIONS.length) return; // max 3
    setOpenStages([...openStages, ""]);
    setOpenStagesEnabled([...openStagesEnabled, true]);
    setOpenStageIds([...openStageIds, 0]);
  };

  const addCloseStage = () => {
    if (closeStages.length >= CLOSE_STAGE_OPTIONS.length) return; // max 2
    setCloseStages([...closeStages, ""]);
    setCloseStagesEnabled([...closeStagesEnabled, true]);
    setCloseStageIds([...closeStageIds, 0]);
  };

  const handleStageChange = (index, value, type) => {
    if (type === "open") {
      const updated = [...openStages];
      updated[index] = value;
      setOpenStages(updated);
    } else {
      const updated = [...closeStages];
      updated[index] = value;
      setCloseStages(updated);
    }
  };

  const handleDeleteStage = (index, type) => {
    if (type === "open") {
      if (openStages.length === 1) return;
      setOpenStages(openStages.filter((_, i) => i !== index));
      setOpenStagesEnabled(openStagesEnabled.filter((_, i) => i !== index));
      setOpenStageIds(openStageIds.filter((_, i) => i !== index));
    } else {
      if (closeStages.length === 1) return;
      setCloseStages(closeStages.filter((_, i) => i !== index));
      setCloseStagesEnabled(closeStagesEnabled.filter((_, i) => i !== index));
      setCloseStageIds(closeStageIds.filter((_, i) => i !== index));
    }
  };

  const toggleOpenStage = (index) => {
    const updated = [...openStagesEnabled];
    updated[index] = !updated[index];
    setOpenStagesEnabled(updated);
  };

  const toggleCloseStage = (index) => {
    const updated = [...closeStagesEnabled];
    updated[index] = !updated[index];
    setCloseStagesEnabled(updated);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!pipelineName.trim())
      newErrors.pipelineName = "Pipeline name is required";
    if (!selectedMember)
      newErrors.selectedMember = "Please select created by member";
    if (openStages.some((s, i) => openStagesEnabled[i] && !s.trim()))
      newErrors.openStages = "All enabled open stages must be selected";
    if (closeStages.some((s, i) => closeStagesEnabled[i] && !s.trim()))
      newErrors.closeStages = "All enabled close stages must be selected";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaving(true);

    const payload = {
      id: isEditMode ? editData.id : -1,
      pipelineName: pipelineName.trim(),
      userId: Number(selectedMember),
      openStages: openStages
        .filter((_, i) => openStagesEnabled[i])
        .map((s, i) => ({
          id: openStageIds[i] ?? -1,
          stage: s.trim(),
        })),
      closeStages: closeStages
        .filter((_, i) => closeStagesEnabled[i])
        .map((s, i) => ({
          id: closeStageIds[i] ?? -1,
          stage: s.trim(),
        })),
    };

    try {
      const res = await CreatePipeline(payload);
      const data = res?.data;

      if (data?.success === true) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text:
            data?.msg ||
            (isEditMode
              ? "Pipeline updated successfully"
              : "Pipeline created successfully"),
        });
        handleClose();
        onSuccess && onSuccess();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data?.msg || "Something went wrong. Please try again.",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleClose}
        width="900px"
        title={isEditMode ? "Edit Pipeline" : "Create Pipeline"}
      >
        <div className="rounded-lg">
          {/* Pipeline Name */}
          <div className="mb-6">
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              maxLength={100}
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              placeholder="Pipeline Name"
              className={`w-full p-3 rounded-md border ${
                errors.pipelineName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.pipelineName && (
              <p className="text-red-500 text-sm mt-1">{errors.pipelineName}</p>
            )}
            <div className="text-right text-sm text-gray-500 mt-1">
              {pipelineName.length}/100
            </div>
          </div>

          {/* Open Stages */}
          <div className="mb-6 border rounded-md overflow-hidden">
            <div className="flex justify-between items-center bg-[#EFF6FF] px-4 py-2">
              <span className="font-medium">
                Open Stages{" "}
                <span className="text-xs text-gray-500 font-normal">
                  ({openStages.length}/{OPEN_STAGE_OPTIONS.length})
                </span>
              </span>
              <button
                onClick={addOpenStage}
                disabled={openStages.length >= OPEN_STAGE_OPTIONS.length}
                className="bg-green-500 text-white p-2 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                title={
                  openStages.length >= OPEN_STAGE_OPTIONS.length
                    ? "All open stages added"
                    : "Add open stage"
                }
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {openStages.map((stage, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={stage}
                    onChange={(e) =>
                      handleStageChange(index, e.target.value, "open")
                    }
                    disabled={!openStagesEnabled[index]}
                    className={`w-full p-2 rounded-md border transition-opacity ${
                      errors.openStages && openStagesEnabled[index] && !stage
                        ? "border-red-500"
                        : "border-gray-300"
                    } ${!openStagesEnabled[index] ? "opacity-40 bg-gray-50" : "bg-white"}`}
                  >
                    <option value="">Select Open Stage</option>
                    {getAvailableOpenOptions(index).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    {/* Keep current value visible even if "taken" by another row in edit mode */}
                    {stage &&
                      !getAvailableOpenOptions(index).includes(stage) && (
                        <option value={stage}>{stage}</option>
                      )}
                  </select>
                  <button
                    onClick={() => handleDeleteStage(index, "open")}
                    disabled={openStages.length === 1}
                    className="text-red-500 disabled:opacity-40 flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {errors.openStages && (
                <p className="text-red-500 text-sm">{errors.openStages}</p>
              )}
            </div>
          </div>

          {/* Close Stages */}
          <div className="mb-6 border rounded-md overflow-hidden">
            <div className="flex justify-between items-center bg-[#EFF6FF] px-4 py-2">
              <span className="font-medium">
                Close Stages{" "}
                <span className="text-xs text-gray-500 font-normal">
                  ({closeStages.length}/{CLOSE_STAGE_OPTIONS.length})
                </span>
              </span>
              <button
                onClick={addCloseStage}
                disabled={closeStages.length >= CLOSE_STAGE_OPTIONS.length}
                className="bg-green-500 text-white p-2 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                title={
                  closeStages.length >= CLOSE_STAGE_OPTIONS.length
                    ? "All close stages added"
                    : "Add close stage"
                }
              >
                <Plus size={16} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {closeStages.map((stage, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={stage}
                    onChange={(e) =>
                      handleStageChange(index, e.target.value, "close")
                    }
                    disabled={!closeStagesEnabled[index]}
                    className={`w-full p-2 rounded-md border transition-opacity ${
                      errors.closeStages && closeStagesEnabled[index] && !stage
                        ? "border-red-500"
                        : "border-gray-300"
                    } ${!closeStagesEnabled[index] ? "opacity-40 bg-gray-50" : "bg-white"}`}
                  >
                    <option value="">Select Close Stage</option>
                    {getAvailableCloseOptions(index).map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                    {/* Keep current value visible in edit mode */}
                    {stage &&
                      !getAvailableCloseOptions(index).includes(stage) && (
                        <option value={stage}>{stage}</option>
                      )}
                  </select>
                  <button
                    onClick={() => handleDeleteStage(index, "close")}
                    disabled={closeStages.length === 1}
                    className="text-red-500 disabled:opacity-40 flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {errors.closeStages && (
                <p className="text-red-500 text-sm">{errors.closeStages}</p>
              )}
            </div>
          </div>

          {/* Created By */}
          <div className="mb-6">
            <select
              className={`w-full p-3 rounded-md border ${
                errors.selectedMember ? "border-red-500" : "border-gray-300"
              }`}
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <option value="">Select Created By Member</option>
              {managers.map((manager) => (
                <option key={manager.value} value={manager.value}>
                  {manager.label}
                </option>
              ))}
            </select>
            {errors.selectedMember && (
              <p className="text-red-500 text-sm mt-1">
                {errors.selectedMember}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-gray-400 text-white rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-2 rounded-md text-white ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary hover:bg-blue-700"
              }`}
            >
              {saving
                ? isEditMode
                  ? "Updating..."
                  : "Saving..."
                : isEditMode
                  ? "Update"
                  : "Save"}
            </button>
          </div>
        </div>
      </CustomModal>
    )
  );
};

export default Addpipeline;
