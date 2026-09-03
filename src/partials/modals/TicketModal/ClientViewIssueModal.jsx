import { useEffect, useState } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";

const MOCK_ISSUE = {
  id: "ISSUE-#4092",
  createdAt: "Created May 12, 2024",
  moduleName: "Inventory Control",
  priority: "High",
  status: "RUNNING",
  description:
    "The stock levels are not updating in real-time when a bulk order is processed through the API. We've noticed a latency of up to 15 minutes, causing potential overselling during high-traffic periods. This started happening after the v2.4 patch last Tuesday.",
  voiceNote: { current: "0:24", total: "1:12", progress: 34 },
  sharedImages: [
    { id: 1, alt: "Chart screenshot" },
    { id: 2, alt: "Code diff" },
    { id: 3, alt: "Terminal output" },
  ],
  remark:
    "Investigated the cache invalidation logic for bulk endpoints. It seems the Redis queue is prioritizing standard UI transactions over API-triggered updates. Working on a patch to elevate the priority of bulk update hooks. Estimated fix deployment: Thursday EOD.",
};

const PRIORITY_CONFIG = {
  High: {
    dot: "bg-red-500",
    text: "text-red-600",
    bg: "bg-red-50 border border-red-200",
  },
  Medium: {
    dot: "bg-yellow-400",
    text: "text-yellow-700",
    bg: "bg-yellow-50 border border-yellow-200",
  },
  Low: {
    dot: "bg-green-500",
    text: "text-green-700",
    bg: "bg-green-50 border border-green-200",
  },
};

const STATUS_CONFIG = {
  RUNNING: "text-blue-600 bg-blue-50 border border-blue-200",
  PENDING: "text-yellow-700 bg-yellow-50 border border-yellow-200",
  RESOLVED: "text-green-700 bg-green-50 border border-green-200",
};

const SectionHeader = ({ title }) => (
  <div className="flex items-center gap-2 mb-3">
    <div className="w-[3px] h-4 bg-blue-500 rounded-sm" />
    <span className="text-sm font-medium text-gray-800">{title}</span>
  </div>
);

// ── Waveform Player ──────────────────────────────────────────────────────────
const WaveformPlayer = ({ current, total, progress }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(progress);
  const bars = 42;
  const playedCount = Math.floor(bars * (currentProgress / 100));

  const heights = [
    4, 7, 12, 18, 14, 9, 16, 22, 17, 11, 8, 20, 24, 19, 13, 7, 15, 21, 16, 10,
    6, 18, 23, 20, 14, 9, 17, 22, 18, 12, 8, 19, 25, 20, 15, 10, 7, 16, 21, 17,
    11, 6,
  ];

  return (
    <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
      <button
        onClick={() => setIsPlaying((p) => !p)}
        className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 hover:bg-blue-600 transition-colors shadow-sm"
      >
        {isPlaying ? (
          <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
            <rect x="0" y="0" width="3" height="12" rx="1" />
            <rect x="6" y="0" width="3" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="10" height="12" viewBox="0 0 10 12" fill="white">
            <polygon points="1,0 10,6 1,12" />
          </svg>
        )}
      </button>

      <div className="flex-1 flex items-center gap-[2px] h-8">
        {heights.map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}px` }}
            className={`w-[3px] rounded-full flex-shrink-0 transition-colors ${
              i < playedCount ? "bg-blue-500" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0 font-medium">
        {current} / {total}
      </span>
    </div>
  );
};

// ── Image Placeholders ────────────────────────────────────────────────────────
const ImagePlaceholder = ({ index }) => {
  const themes = [
    { bg: "#0d1b2e", content: "chart" },
    { bg: "#0d1117", content: "code" },
    { bg: "#1a0a2e", content: "terminal" },
  ];
  const theme = themes[index % themes.length];

  return (
    <div
      className="aspect-square rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center"
      style={{ background: theme.bg }}
    >
      {theme.content === "chart" && (
        <svg width="80" height="60" viewBox="0 0 80 60">
          <rect x="0" y="0" width="80" height="60" fill="#0d1b2e" />
          {/* Grid lines */}
          <line
            x1="8"
            y1="10"
            x2="8"
            y2="50"
            stroke="#1e3a5f"
            strokeWidth="0.5"
          />
          <line
            x1="8"
            y1="50"
            x2="75"
            y2="50"
            stroke="#1e3a5f"
            strokeWidth="0.5"
          />
          <line
            x1="8"
            y1="35"
            x2="75"
            y2="35"
            stroke="#1e3a5f"
            strokeWidth="0.3"
          />
          <line
            x1="8"
            y1="22"
            x2="75"
            y2="22"
            stroke="#1e3a5f"
            strokeWidth="0.3"
          />
          {/* Bar chart */}
          <rect
            x="12"
            y="30"
            width="8"
            height="20"
            fill="#1d6fa4"
            opacity="0.9"
            rx="1"
          />
          <rect
            x="24"
            y="20"
            width="8"
            height="30"
            fill="#2196F3"
            opacity="0.9"
            rx="1"
          />
          <rect
            x="36"
            y="25"
            width="8"
            height="25"
            fill="#1d6fa4"
            opacity="0.9"
            rx="1"
          />
          <rect
            x="48"
            y="15"
            width="8"
            height="35"
            fill="#2196F3"
            opacity="0.9"
            rx="1"
          />
          <rect
            x="60"
            y="22"
            width="8"
            height="28"
            fill="#1d6fa4"
            opacity="0.9"
            rx="1"
          />
          {/* Line overlay */}
          <polyline
            points="16,30 28,20 40,25 52,15 64,22"
            fill="none"
            stroke="#64b5f6"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {[
            [16, 30],
            [28, 20],
            [40, 25],
            [52, 15],
            [64, 22],
          ].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2" fill="#64b5f6" />
          ))}
        </svg>
      )}

      {theme.content === "code" && (
        <svg width="80" height="60" viewBox="0 0 80 60">
          <rect x="0" y="0" width="80" height="60" fill="#0d1117" />
          {/* Line numbers */}
          <text x="4" y="14" fontSize="4" fill="#484f58">
            1
          </text>
          <text x="4" y="22" fontSize="4" fill="#484f58">
            2
          </text>
          <text x="4" y="30" fontSize="4" fill="#484f58">
            3
          </text>
          <text x="4" y="38" fontSize="4" fill="#484f58">
            4
          </text>
          <text x="4" y="46" fontSize="4" fill="#484f58">
            5
          </text>
          {/* Code lines */}
          <rect
            x="12"
            y="10"
            width="12"
            height="3"
            rx="1"
            fill="#ff7b72"
            opacity="0.9"
          />
          <rect
            x="26"
            y="10"
            width="18"
            height="3"
            rx="1"
            fill="#79c0ff"
            opacity="0.9"
          />
          <rect
            x="46"
            y="10"
            width="8"
            height="3"
            rx="1"
            fill="#a5f3fc"
            opacity="0.7"
          />

          <rect
            x="14"
            y="18"
            width="8"
            height="3"
            rx="1"
            fill="#d2a8ff"
            opacity="0.9"
          />
          <rect
            x="24"
            y="18"
            width="14"
            height="3"
            rx="1"
            fill="#79c0ff"
            opacity="0.9"
          />
          <rect
            x="40"
            y="18"
            width="20"
            height="3"
            rx="1"
            fill="#a8ff78"
            opacity="0.7"
          />

          <rect
            x="14"
            y="26"
            width="22"
            height="3"
            rx="1"
            fill="#ffa657"
            opacity="0.9"
          />
          <rect
            x="38"
            y="26"
            width="10"
            height="3"
            rx="1"
            fill="#79c0ff"
            opacity="0.9"
          />

          <rect
            x="14"
            y="34"
            width="16"
            height="3"
            rx="1"
            fill="#4ade80"
            opacity="0.8"
          />
          <rect
            x="32"
            y="34"
            width="24"
            height="3"
            rx="1"
            fill="#a8ff78"
            opacity="0.6"
          />

          <rect
            x="12"
            y="42"
            width="10"
            height="3"
            rx="1"
            fill="#ff7b72"
            opacity="0.9"
          />
          <rect
            x="24"
            y="42"
            width="30"
            height="3"
            rx="1"
            fill="#6ee7b7"
            opacity="0.5"
          />
        </svg>
      )}

      {theme.content === "terminal" && (
        <svg width="80" height="60" viewBox="0 0 80 60">
          <rect x="0" y="0" width="80" height="60" fill="#1a0a2e" />
          {/* Terminal header dots */}
          <circle cx="8" cy="7" r="2.5" fill="#ff5f57" />
          <circle cx="16" cy="7" r="2.5" fill="#febc2e" />
          <circle cx="24" cy="7" r="2.5" fill="#28c840" />
          <line
            x1="0"
            y1="13"
            x2="80"
            y2="13"
            stroke="#3d1f6b"
            strokeWidth="0.5"
          />
          {/* Terminal content */}
          <text
            x="4"
            y="22"
            fontSize="4.5"
            fill="#c084fc"
            fontFamily="monospace"
          >
            $ node server.js
          </text>
          <text x="4" y="30" fontSize="4" fill="#86efac" fontFamily="monospace">
            ✓ Server started
          </text>
          <text x="4" y="37" fontSize="4" fill="#6ee7b7" fontFamily="monospace">
            {" "}
            Port: 3000
          </text>
          <text x="4" y="44" fontSize="4" fill="#fbbf24" fontFamily="monospace">
            ⚠ Cache miss: /api
          </text>
          <text x="4" y="51" fontSize="4" fill="#f87171" fontFamily="monospace">
            ✗ Redis timeout
          </text>
          {/* Cursor blink */}
          <rect
            x="4"
            y="54"
            width="4"
            height="3"
            rx="0.5"
            fill="#c084fc"
            opacity="0.8"
          />
        </svg>
      )}
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────
const ClintViewIssueModal = ({ open, onClose, issue }) => {
  const [deferredOpen, setDeferredOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const id = setTimeout(() => setDeferredOpen(true), 0);
      return () => clearTimeout(id);
    } else {
      setDeferredOpen(false);
    }
  }, [open]);

  // ✅ merge passed issue with MOCK_ISSUE fallback for every field
  const data = { ...MOCK_ISSUE, ...issue };

  const priorityCfg = PRIORITY_CONFIG[data.priority] || PRIORITY_CONFIG.High;
  const statusCls = STATUS_CONFIG[data.status] || STATUS_CONFIG.RUNNING;

  // ✅ guard — don't render anything until data is safe
  if (!open && !deferredOpen) return null;

  const footer = (
    <div className="flex justify-end">
      <button
        onClick={onClose}
        className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
      >
        Close
      </button>
    </div>
  );

  const header = (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6" stroke="#378ADD" strokeWidth="1.5" />
          <line
            x1="8"
            y1="5"
            x2="8"
            y2="9"
            stroke="#378ADD"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="8" cy="11" r="0.75" fill="#378ADD" />
        </svg>
      </div>
      <div>
        <div className="text-sm font-semibold text-gray-900 leading-tight">
          View Issue Details
        </div>
        <div className="text-[11px] text-gray-400 mt-0.5">
          {data.id} · {data.createdAt}
        </div>
      </div>
    </div>
  );

  return (
    <CustomModal
      open={deferredOpen}
      onClose={onClose}
      title={header}
      footer={footer}
      width={520}
      styles={{
        body: { padding: "0", maxHeight: "60vh", overflowY: "auto" },
        footer: { borderTop: "0.5px solid #e5e7eb" },
      }}
    >
      {/* ── Meta row ── */}
      <div className="grid grid-cols-3 gap-3 px-5 py-4 border-b border-gray-100">
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Module Name
          </p>
          <p className="text-[13px] font-semibold text-gray-800">
            {data.moduleName}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Priority
          </p>
          <span
            className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-0.5 rounded-md ${priorityCfg.bg} ${priorityCfg.text}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
            {data.priority}
          </span>
        </div>
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
            Status
          </p>
          <span
            className={`text-[11px] font-bold px-2.5 py-1 rounded-md ${statusCls}`}
          >
            {data.status}
          </span>
        </div>
      </div>

      {/* ── Description ── */}
      <div className="px-5 py-4 border-b border-gray-100">
        <SectionHeader title="Description (Client Input)" />
        <p className="text-[12.5px] text-gray-500 leading-relaxed bg-gray-50 border border-gray-100 rounded-lg px-3 py-2.5">
          {data.description}
        </p>
      </div>

      {/* ── Media Attachments ── */}
      <div className="px-5 py-4 border-b border-gray-100">
        <SectionHeader title="Media Attachments" />
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
          Voice Notes
        </p>
        <WaveformPlayer
          current={data.voiceNote.current}
          total={data.voiceNote.total}
          progress={data.voiceNote.progress}
        />
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-2">
          Shared Images
        </p>
        <div className="grid grid-cols-3 gap-2">
          {data.sharedImages.map((img, idx) => (
            <ImagePlaceholder key={img.id} index={idx} />
          ))}
        </div>
      </div>

      {/* ── Remarks ── */}
      <div className="px-5 py-4">
        <SectionHeader title="Remarks (From Developers)" />
        <div className="flex gap-2.5">
          <div className="flex-shrink-0 mt-0.5">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <path
                d="M0 14V8.4C0 6.93 0.35 5.57 1.05 4.32C1.75 3.05 2.73 2.03 3.99 1.26C5.27 0.47 6.73 0.04 8.37 0L9 1.68C7.8 1.94 6.77 2.39 5.91 3.03C5.05 3.65 4.43 4.42 4.05 5.34H7V14H0ZM11 14V8.4C11 6.93 11.35 5.57 12.05 4.32C12.75 3.05 13.73 2.03 14.99 1.26C16.27 0.47 17.73 0.04 19.37 0L20 1.68C18.8 1.94 17.77 2.39 16.91 3.03C16.05 3.65 15.43 4.42 15.05 5.34H18V14H11Z"
                fill="#d1d5db"
              />
            </svg>
          </div>
          <p className="text-[12.5px] text-gray-500 leading-relaxed">
            {data.remark}
          </p>
        </div>
      </div>
    </CustomModal>
  );
};

export default ClintViewIssueModal;
