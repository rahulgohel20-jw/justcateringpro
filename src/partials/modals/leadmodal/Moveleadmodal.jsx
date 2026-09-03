import { useState, useEffect, useRef } from "react";
import { DatePicker as AntDatePicker } from "antd";
import dayjs from "dayjs";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import FollowupRemindersModal from "./Followupremindersmodal ";
import { Fetchmanager } from "@/services/apiServices";

const MoveLeadModal = ({
  isOpen,
  onClose,
  onConfirm,
  lead,
  fromColumn,
  toColumn,
  managers = [],
  boardColumns = [],
}) => {
  const isManualMove = fromColumn?.id === toColumn?.id;

  /* ── state ───────────────────────────────────────── */
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [remarks, setRemarks] = useState("");

  // Follow-up section
  const [followUpOpen, setFollowUpOpen] = useState(false);
  const [followUpType, setFollowUpType] = useState("Call");
  const [followUpDate, setFollowUpDate] = useState(null);
  const [followUpReminders, setFollowUpReminders] = useState([]);
  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const [internalManagers, setInternalManagers] = useState([]);
  const [selectedToColumn, setSelectedToColumn] = useState("");

  // ── Voice Note state ──
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const recognitionRef = useRef(null);
  const userId = localStorage.getItem("userId");
  useEffect(() => {
    if (isOpen && lead) {
      setRemarks("");
      setFollowUpOpen(false);
      setFollowUpType("Call");
      setFollowUpDate(null);
      setFollowUpReminders([]);
      setAttachedFile(null);
      setSelectedToColumn("");
      setVoiceError("");
      stopRecording();

      Fetchmanager(userId)
        .then((res) => {
          if (res?.data?.data?.userDetails) {
            const list = res.data.data.userDetails.map((man) => ({
              value: String(man.id),
              label: man.firstName || "-",
            }));
            setInternalManagers(list);
            setSelectedAssignee(
              lead.leadAssignId ? String(lead.leadAssignId) : "",
            );
          }
        })
        .catch(() => {
          setInternalManagers([]);
          setSelectedAssignee("");
        });
    }

    // Cleanup on modal close
    return () => {
      stopRecording();
    };
  }, [isOpen, lead]);

  /* ── Voice Note helpers ── */
  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const toggleVoiceNote = () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    // Check browser support
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice recognition is not supported in this browser.");
      return;
    }

    setVoiceError("");

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US"; // Change to desired language
    recognition.interimResults = false; // Only final results
    recognition.continuous = false; // Stop after one phrase (set true for continuous)

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(" ");

      // Append transcribed text to existing remarks
      setRemarks((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = (event) => {
      setVoiceError(
        event.error === "not-allowed"
          ? "Microphone permission denied. Please allow access."
          : `Voice error: ${event.error}`,
      );
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const FOLLOW_UP_TYPES = ["Call", "WhatsApp", "Email"];

  const stagePillColor = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("hot")) return "#2563EB";
    if (n.includes("cold")) return "#7C3AED";
    if (n.includes("new") || n.includes("inquiry")) return "#F97316";
    if (n.includes("won") || n.includes("confirm")) return "#16A34A";
    if (n.includes("cancel") || n.includes("lost")) return "#DC2626";
    if (n.includes("pending")) return "#D97706";
    if (n.includes("open")) return "#0891B2";
    if (n.includes("close")) return "#6B7280";
    return "#64748B";
  };

  const handleConfirm = () => {
    stopRecording();

    if (isManualMove && !selectedToColumn) {
      alert("Please select a destination stage first.");
      return;
    }

    // ✅ Find full column object including stageId
    const resolvedToColumn = isManualMove
      ? boardColumns.find((col) => col.name === selectedToColumn) || {
          id: selectedToColumn,
          name: selectedToColumn,
        }
      : toColumn;

   

    const formattedFollowUpDate = followUpDate
      ? followUpDate.includes(" ")
        ? followUpDate
        : `${followUpDate} 12:00 AM`
      : null;

    onConfirm?.({
      leadId: lead?.leadId || lead?.id,
      toStatus: resolvedToColumn?.id,
      toColumn: resolvedToColumn, // ✅ passes full object with stageId: 11
      assignedTo: selectedAssignee,
      remarks,
      followUp:
        followUpOpen && formattedFollowUpDate
          ? {
              type: followUpType,
              date: formattedFollowUpDate,
              reminders: followUpReminders,
            }
          : null,
      attachment: attachedFile,
    });
  };

  /* ── render ──────────────────────────────────────── */
  return (
    <>
      <CustomModal
        open={isOpen}
        onClose={() => {
          stopRecording();
          onClose();
        }}
        title="Move Lead"
        width={520}
        footer={
          <div
            className="flex items-center justify-between w-full"
            key="footer-buttons"
          >
            {/* <div className="flex items-center gap-2">
              <label
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer transition-colors"
                title="Attach file"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setAttachedFile(e.target.files?.[0] || null)}
                />
              </label>
              {attachedFile && (
                <span className="text-xs text-gray-500 truncate max-w-[110px]">
                  {attachedFile.name}
                </span>
              )}

              <button
                type="button"
                onClick={toggleVoiceNote}
                className={`flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200 ${
                  isRecording
                    ? "bg-red-100 hover:bg-red-200 ring-2 ring-red-400 ring-offset-1"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                title={isRecording ? "Stop recording" : "Start voice note"}
              >
                {isRecording ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="#EF4444"
                    stroke="#EF4444"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: "pulse 1s infinite" }}
                  >
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#6B7280"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                )}
              </button>

              {isRecording && (
                <span className="text-xs text-red-500 font-medium animate-pulse">
                  Listening…
                </span>
              )}

              {voiceError && !isRecording && (
                <span
                  className="text-xs text-red-500 max-w-[140px] truncate"
                  title={voiceError}
                >
                  {voiceError}
                </span>
              )}
            </div> */}

            {/* Right: CTA */}
            <button
              key="confirm"
              type="button"
              onClick={handleConfirm}
              className="btn flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-all active:scale-[0.98] hover:opacity-90"
              style={{ backgroundColor: "#22C55E" }}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              Move Lead
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-y-4">
          {/* Lead meta + stage pills */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-gray-700">Title : </span>
              {lead?.title || lead?.clientName || "—"}
            </p>
            {/* <p className="text-sm text-gray-500 mt-0.5">
                <span className="font-semibold text-gray-700">Pipeline : </span>
                {lead?.pipelineName || lead?.pipeline || "—"}
              </p> */}
            <div className="rounded-xl bg-gray-50 border border-gray-100 px-4 py-3">
              {isManualMove ? (
                <div className="flex items-center justify-center gap-4 mt-3">
                  <span
                    className="px-4 py-1.5 rounded-full text-white text-sm font-semibold flex-shrink-0"
                    style={{
                      backgroundColor: stagePillColor(fromColumn?.name),
                    }}
                  >
                    {fromColumn?.name || "—"}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  <select
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={selectedToColumn}
                    onChange={(e) => setSelectedToColumn(e.target.value)}
                  >
                    <option value="">Select Stage</option>
                    {boardColumns
                      .filter((col) => col.name !== fromColumn?.name)
                      .map((col) => (
                        <option key={col.id} value={col.name}>
                          {col.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-8 mt-3">
                  <span
                    className="px-4 py-1.5 rounded-full text-white text-sm font-semibold"
                    style={{
                      backgroundColor: stagePillColor(fromColumn?.name),
                    }}
                  >
                    {fromColumn?.name || "—"}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                  <span
                    className="px-4 py-1.5 rounded-full text-white text-sm font-semibold"
                    style={{ backgroundColor: stagePillColor(toColumn?.name) }}
                  >
                    {toColumn?.name || "—"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Assignee */}
          <div className="flex flex-col">
            <label className="form-label mb-1">Assign To</label>
            <select
              className="select border border-gray-300 rounded-lg px-3 py-2 text-sm"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
            >
              <option value="">Select Member</option>
              {internalManagers.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Remarks — voice transcription lands here */}
          <div className="flex flex-col">
            <label className="form-label mb-1 flex items-center gap-2">
              Remarks
              {isRecording && (
                <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
                  Recording…
                </span>
              )}
            </label>
            <textarea
              rows={3}
              className={`textarea h-full transition-all duration-200 ${
                isRecording ? "ring-2 ring-red-400 border-red-300" : ""
              }`}
              placeholder={
                isRecording
                  ? "Speak now… your words will appear here"
                  : "Add a remark…"
              }
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* ── Follow-up accordion ── */}
          {/* <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                type="button"
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                onClick={() => setFollowUpOpen((v) => !v)}
              >
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 3.62 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 8 8l1.06-1.06a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  Add Next Followup
                </span>
                <i
                  className={`ki-filled ki-down text-gray-400 transition-transform duration-200 ${followUpOpen ? "rotate-180" : ""}`}
                />
              </button>

              {followUpOpen && (
                <div className="bg-white flex flex-col border-t border-gray-100 px-4 py-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-800">
                      Customer Name
                    </label>
                    <input
                      type="text"
                      className="input border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50"
                      value={lead?.clientName || lead?.title || ""}
                      readOnly
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-800">
                      Assign Member
                    </label>
                    <select
                      className="select border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={selectedAssignee}
                      onChange={(e) => setSelectedAssignee(e.target.value)}
                    >
                      <option value="">Select Member</option>
                      {internalManagers.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <textarea
                    rows={4}
                    className="textarea border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="Follow Up Description"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />

                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-800">
                      Follow Up Type
                    </label>
                    <div className="flex gap-3">
                      {FOLLOW_UP_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFollowUpType(type)}
                          className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            followUpType === type
                              ? "bg-green-500 text-white"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-semibold text-gray-800">
                      Followup Date & Time
                    </label>
                    <AntDatePicker
                      showTime={{ format: "hh:mm A", use12Hours: true }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      value={
                        followUpDate
                          ? dayjs(followUpDate, "DD/MM/YYYY hh:mm A")
                          : null
                      }
                      onChange={(date) =>
                        setFollowUpDate(
                          date ? dayjs(date).format("DD/MM/YYYY hh:mm A") : null,
                        )
                      }
                      format="DD/MM/YYYY hh:mm A"
                      getPopupContainer={() => document.body}
                      placeholder="Select date & time"
                    />
                  </div>
                </div>
              )}
            </div> */}
        </div>
      </CustomModal>

      <FollowupRemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        onSave={(reminders) => {
          setFollowUpReminders(reminders);
          setIsRemindersModalOpen(false);
        }}
      />
    </>
  );
};

export default MoveLeadModal;
