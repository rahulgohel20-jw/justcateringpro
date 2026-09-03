import { useState, useRef, useEffect } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { GetUsersByRoleId } from "@/services/apiServices"; // adjust import path
import Swal from "sweetalert2";

const PRIORITY_LEVELS = ["Low", "Medium", "High"];

// ── Static module options ──────────────────────────────
const MODULE_OPTIONS = [
  { value: "services", label: "Services" },
  { value: "renewal", label: "Renewal" },
  { value: "issue_bug", label: "Issue / Bug" },
];

const priorityColors = {
  Low: {
    active: "bg-green-50 border-green-400 text-green-600",
    dot: "bg-green-400",
  },
  Medium: {
    active: "bg-orange-50 border-orange-400 text-orange-500",
    dot: "bg-orange-400",
  },
  High: {
    active: "bg-red-50 border-red-400 text-red-600",
    dot: "bg-red-400",
  },
};
const ClientRaiseNewIssue = ({ open, onClose, onSubmit }) => {
  const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
  const currentUserRoleId =
    authStorage?.state?.user?.userBasicDetails?.role?.id;
  const isSuperAdmin = currentUserRoleId !== 2; // true = superadmin, false = admin

  const [module, setModule] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  // ✅ Fix — restore ALL the original recording state & refs
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [barHeights, setBarHeights] = useState(Array(28).fill(3));
  const MAX_RECORD_SECONDS = 60;

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const animationFrameRef = useRef(null);
  const analyserRef = useRef(null);
  const fileInputRef = useRef(null);
  // ── NEW: user list state ────────────────────────────
  const [assignTo, setAssignTo] = useState("");
  const [userList, setUserList] = useState([]); // users with roleId !== 2
  const [usersLoading, setUsersLoading] = useState(false);

  // … recording state unchanged …
  // ── cleanup on unmount ──
  useEffect(
    () => () => {
      clearInterval(timerRef.current);
    },
    [],
  );

  // ── Recording helpers ──
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const animate = () => {
        analyser.getByteFrequencyData(dataArray);
        const bars = Array.from({ length: 28 }, (_, i) => {
          const val = dataArray[i % dataArray.length] || 0;
          return Math.max(3, (val / 255) * 40);
        });
        setBarHeights(bars);
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      animate();

      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        const name = `memo_${Date.now()}.wav`;
        setRecordedBlob({ blob, url, name });
        stream.getTracks().forEach((t) => t.stop());
        cancelAnimationFrame(animationFrameRef.current);
        setBarHeights(Array(28).fill(3));
      };

      mr.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => {
          if (t + 1 >= MAX_RECORD_SECONDS) {
            stopRecording();
            return MAX_RECORD_SECONDS;
          }
          return t + 1;
        });
      }, 1000);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Microphone access denied",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    clearInterval(timerRef.current);
    cancelAnimationFrame(animationFrameRef.current);
    setIsRecording(false);
  };

  const removeRecording = () => {
    if (recordedBlob?.url) URL.revokeObjectURL(recordedBlob.url);
    setRecordedBlob(null);
    setRecordingTime(0);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const fmtTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Image helpers ──
  const handleImageAdd = (files) => {
    const arr = Array.from(files);
    if (images.length + arr.length > 5) {
      Swal.fire({
        icon: "warning",
        title: "Max 5 images",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }
    const valid = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    for (const f of arr) {
      if (!valid.includes(f.type)) {
        Swal.fire({
          icon: "error",
          title: `${f.name} is not a valid image`,
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }
    }
    const newImgs = arr.map((f) => ({ file: f, url: URL.createObjectURL(f) }));
    setImages((prev) => [...prev, ...newImgs]);
  };

  const removeImage = (idx) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // ── Validation ──
  const validate = () => {
    const err = {};
    if (!module) err.module = "Please select a module";
    if (!description.trim()) err.description = "Description is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ── handleClose ──
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ── Waveform component ──
  const WaveformBars = ({ active, heights = [] }) => (
    <div className="flex items-center gap-[2px] h-10">
      {Array.from({ length: 28 }).map((_, i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full transition-all duration-75 ${active ? "bg-blue-500" : "bg-gray-300"}`}
          style={{
            height: active
              ? `${heights[i] ?? 3}px`
              : `${4 + Math.abs(Math.sin(i * 0.5)) * 10}px`,
          }}
        />
      ))}
    </div>
  );
  useEffect(() => {
    if (!open) return;
    if (!isSuperAdmin) return;

    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await GetUsersByRoleId();

        // ✅ Correct path — note the double .data.data
        const users = res?.data?.data?.["User Details"]?.users ?? [];
        setUserList(users);
      } catch {
        Swal.fire({
          icon: "error",
          title: "Failed to load users",
          timer: 1500,
          showConfirmButton: false,
        });
      } finally {
        setUsersLoading(false);
      }
    };
    fetchUsers();
  }, [open]);

  // … all your existing helpers unchanged …

  const resetForm = () => {
    setModule("");
    setDescription("");
    setPriority("Medium");
    setImages([]);
    setErrors({});
    setAssignTo("");
    removeRecording();
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const formData = new FormData();
    formData.append("module", module);
    formData.append("description", description);
    formData.append("priority", priority);
    formData.append("assignTo", assignTo); // ← new field
    if (recordedBlob)
      formData.append("voiceMemo", recordedBlob.blob, recordedBlob.name);
    images.forEach((img) => formData.append("screenshots", img.file));
    onSubmit?.(formData);
  };

  return (
    // ✅ Fix
    <CustomModal
      open={open}
      onClose={handleClose}
      title={
        <div>
          <p className="text-base font-bold text-gray-900">Raise New Issue</p>
          <p className="text-xs text-gray-400 font-normal mt-0.5">
            Fill in the details to track your request.
          </p>
        </div>
      }
      width={540}
      centered
      styles={{
        body: {
          maxHeight: "calc(100vh - 220px)",
          overflowY: "auto",
          overflowX: "hidden",
        },
        wrapper: { overflow: "hidden" },
      }}
      footer={[
        <div key="footer" className="flex items-center justify-between w-full">
          <button
            onClick={handleClose}
            className="px-5 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            Save Issue
          </button>
        </div>,
      ]}
    >
      <div className="flex flex-col gap-5 p-3">
        {/* ── MODULE (static list) ── */}
        <div>
          <label className="block text-[11px] font-semibold text-black uppercase tracking-wide mb-1.5">
            Module
          </label>
          <div className="relative">
            <select
              value={module}
              onChange={(e) => {
                setModule(e.target.value);
                setErrors((p) => ({ ...p, module: "" }));
              }}
              className="w-full border border-gray-200 bg-[#F8FAFC] rounded-lg px-3 py-2.5 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Project Module</option>
              {MODULE_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            {/* chevron svg unchanged */}
          </div>
          {errors.module && (
            <p className="text-red-500 text-xs mt-1">{errors.module}</p>
          )}
        </div>

        {/* ── ASSIGN TO (users where roleId !== 2) ── */}
        {/* ── ASSIGN TO — only visible to superadmin (roleId !== 2) ── */}
        {isSuperAdmin && (
          <div>
            <label className="block text-[11px] font-semibold text-black uppercase tracking-wide mb-1.5">
              Assign To
            </label>
            <div className="relative">
              <select
                value={assignTo}
                onChange={(e) => setAssignTo(e.target.value)}
                disabled={usersLoading}
                className="w-full border border-gray-200 bg-[#F8FAFC] rounded-lg px-3 py-2.5 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="">
                  {usersLoading ? "Loading users…" : "Select a person"}
                </option>
                {userList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.userBasicDetails?.companyName ??
                      `${u.firstName} ${u.lastName}`}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-3.5 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        )}

        {/* DESCRIPTION */}
        <div>
          <label className="block text-[11px] font-semibold text-black uppercase tracking-wide mb-1.5">
            Description
          </label>
          <div className="relative">
            <textarea
              rows={4}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setErrors((p) => ({ ...p, description: "" }));
              }}
              placeholder="What seems to be the issue?"
              className="w-full border bg-[#F8FAFC] border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <svg
              className="absolute bottom-3 right-3 w-4 h-4 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        {/* VOICE MEMO */}
        <div>
          <label className="block text-[11px] font-semibold text-black uppercase tracking-wide mb-1.5">
            Voice Memo Attachment
          </label>
          <div className="border bg-[#F8FAFC] border-gray-200 rounded-xl overflow-hidden">
            {/* Record button row */}
            <div className="bg-[#F8FAFC] flex items-center justify-between px-4 py-3 ">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={` bg-[#F8FAFC] w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition ${
                    isRecording ? "bg-red-500 animate-pulse" : "bg-red-100"
                  }`}
                >
                  <div
                    className={`rounded-full ${isRecording ? "w-3 h-3 bg-white rounded-sm" : "w-3.5 h-3.5 bg-red-500 rounded-full"}`}
                  />
                </button>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Record Voice Memo
                  </p>
                  <p className="text-xs text-gray-400">
                    {isRecording ? "Recording..." : "Click to start recording"}
                  </p>
                </div>
              </div>
              {isRecording && (
                <button
                  onClick={stopRecording}
                  className="text-xs font-semibold text-gray-500 border border-gray-300 px-3 py-1 rounded-lg hover:bg-gray-50"
                >
                  STOP
                </button>
              )}
            </div>

            {/* Waveform row */}
            {(isRecording || recordedBlob) && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <WaveformBars active={isRecording} />
                <span className="text-xs text-gray-500 font-mono ml-3">
                  {fmtTime(recordingTime)} / {fmtTime(MAX_RECORD_SECONDS)}
                </span>
              </div>
            )}

            {/* Preview row */}
            {recordedBlob && (
              <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0"
                  >
                    {isPlaying ? (
                      <div className="flex gap-0.5">
                        <div className="w-1 h-3 bg-white rounded" />
                        <div className="w-1 h-3 bg-white rounded" />
                      </div>
                    ) : (
                      <svg
                        className="w-3 h-3 text-white ml-0.5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>
                  <span className="text-xs text-gray-600 truncate max-w-[140px]">
                    Previewing {recordedBlob.name}
                  </span>
                </div>
                <button
                  onClick={removeRecording}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
                <audio
                  ref={audioRef}
                  src={recordedBlob.url}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
              </div>
            )}
          </div>
        </div>

        {/* ATTACHMENTS */}
        <div>
          <label className="block text-[11px] font-semibold text-black uppercase tracking-wide mb-1.5">
            Attachments (Screenshots)
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Upload slot */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-400 transition flex-shrink-0"
            >
              <svg
                className="w-5 h-5 mb-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-[10px] font-medium">UPLOAD</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                handleImageAdd(e.target.files);
                e.target.value = "";
              }}
            />

            {/* Previews */}
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0"
              >
                <img
                  src={img.url}
                  alt={`screenshot-${idx}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-5 h-5 bg-gray-900/60 rounded-full flex items-center justify-center hover:bg-red-500 transition"
                >
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* PRIORITY */}
        <div>
          <label className="block text-[11px] font-semibold text-black uppercase tracking-wide mb-1.5">
            Priority Level
          </label>
          <div className="flex gap-3">
            {PRIORITY_LEVELS.map((p) => {
              const isActive = priority === p;
              const cfg = priorityColors[p];
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    isActive
                      ? cfg.active + " border-2"
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? cfg.dot : "bg-gray-300"}`}
                  />
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default ClientRaiseNewIssue;
