import { useState, useRef } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";

// ── Static waveform bars ──────────────────────────────────────────────────────
const StaticWaveform = () => {
  const heights = [
    4, 8, 14, 20, 28, 22, 16, 10, 6, 18, 30, 24, 12, 8, 20, 32, 26, 14, 8, 18,
    28, 20, 12, 6, 16, 24, 18, 10,
  ];
  return (
    <div className="flex items-center gap-[2.5px] h-8">
      {heights.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-blue-400/80"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
};

// ── Avatar placeholder ────────────────────────────────────────────────────────
const Avatar = ({
  initials,
  color = "bg-blue-100 text-blue-700",
  size = "w-8 h-8",
}) => (
  <div
    className={`${size} rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${color}`}
  >
    {initials}
  </div>
);

// ── Info chip ─────────────────────────────────────────────────────────────────
const InfoChip = ({ label, value, extra }) => (
  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex flex-col gap-0.5 flex-1 min-w-0">
    <span className="text-[10px] font-semibold uppercase tracking-wider">
      {label}
    </span>
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-800 truncate">
        {value}
      </span>
      {extra}
    </div>
  </div>
);

// ── Main Modal ─────────────────────────────────────────────────────────────────
const SuperAdminViewModal = ({ open, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <CustomModal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <span className="text-base font-bold text-gray-900">
            Issue Details
          </span>
        </div>
      }
      width={720}
      centered
      styles={{
        body: {
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          overflowX: "hidden",
          padding: 0,
        },
        wrapper: { overflow: "hidden" },
      }}
      footer={[
        <div
          key="footer"
          className="flex items-center justify-end gap-3 w-full"
        >
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Print Details
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-primary
             hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
          >
            Close
          </button>
        </div>,
      ]}
    >
      <div className="flex flex-col gap-0 divide-y divide-gray-100">
        {/* ── Section 1: Info chips ── */}
        <div className="p-4 flex gap-3 flex-wrap">
          <InfoChip label="INTERACTION" value="Complaint" />
          <InfoChip label="TICKET FROM" value="Call" />
          <InfoChip label="DEPARTMENT" value="Super Admin" />
          <InfoChip
            label="ASSIGN TO"
            value="Aarya"
            extra={
              <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-white shadow-sm bg-orange-200 flex items-center justify-center text-xs font-bold text-orange-700 flex-shrink-0">
                A
              </div>
            }
          />
        </div>

        {/* ── Section 2: Priority / Status / Timing / Actual Close + Expected ── */}
        <div className="px-4 py-3 flex items-stretch gap-3">
          {/* Left bordered box */}
          <div className="flex items-center gap-8 flex-1 border border-gray-200 rounded-xl px-5 py-3">
            {/* Priority */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Priority
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                High
              </span>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Status
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                Running
              </span>
            </div>

            {/* Timing */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Timing
              </span>
              <div className="flex items-center gap-1 text-sm ">
                <svg
                  className="w-3.5 h-3.5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">14:00</span>
              </div>
            </div>

            {/* Actual Close */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider">
                Actual Close
              </span>
              <span className="text-sm font-medium">--</span>
            </div>
          </div>

          {/* Right: Expected Close Date — blue card */}
          <div className="bg-primary text-white rounded-xl px-6 py-3 flex flex-col items-center justify-center min-w-[190px]">
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
              Expected Close Date
            </span>
            <span className="text-xl font-bold mt-1">May 20, 2024</span>
          </div>
        </div>

        {/* ── Section 3: Client Input ── */}
        <div className="px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3">
            Client Input
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">Description</p>
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm  leading-relaxed min-h-[90px]">
                The stock levels are not updating in real-time. We had multiple
                orders today where items were shown as available but were
                actually out of stock.
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">User Message</p>
              <div className="bg-white border-l-4 border-primary rounded-r-xl p-3 text-sm  leading-relaxed min-h-[30px] shadow-sm">
                "Please look into this urgently."
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 4: Media Attachments ── */}
        <div className="px-4 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3">
            Media Attachments
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Voice memo player */}
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex-1 min-w-[200px]">
              <button
                type="button"
                onClick={() => setIsPlaying((p) => !p)}
                className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0 hover:bg-blue-700 transition"
              >
                {isPlaying ? (
                  <div className="flex gap-[3px]">
                    <div className="w-[3px] h-3 bg-white rounded-sm" />
                    <div className="w-[3px] h-3 bg-white rounded-sm" />
                  </div>
                ) : (
                  <svg
                    className="w-3.5 h-3.5 text-white ml-0.5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <StaticWaveform />
                <span className="text-[10px] text-gray-400">
                  voice_memo_042.wav • 0:12
                </span>
              </div>
            </div>

            {/* Image thumbnails */}
            <div className="flex items-center gap-2">
              <div className="w-[72px] h-[72px] rounded-xl flex-shrink-0 border border-gray-200 overflow-hidden bg-gradient-to-br from-gray-700 to-gray-900" />
              <div className="w-[72px] h-[72px] rounded-xl flex-shrink-0 border border-gray-200 overflow-hidden bg-gradient-to-br from-gray-600 to-gray-800" />
              <div className="w-[72px] h-[72px] rounded-xl flex-shrink-0 border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                <span className="text-sm font-bold">+2</span>
                <span className="text-[10px]">More</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Section 5: Internal Team Notes ── */}
        <div className="px-4 py-4">
          {/* Header */}
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-4 border-b pb-2">
            Internal Team Notes
          </p>

          <div className="flex flex-col gap-3">
            {/* Card 1 */}
            <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <Avatar initials="IR" color="bg-gray-200 text-gray-600" />

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-800">
                    Interaction Remarks
                  </span>
                  <span className="text-[10px] text-gray-400">14:05</span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  Initial call received from client regarding API latency.
                  Logged as critical complaint.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <Avatar initials="MM" color="bg-blue-100 text-blue-700" />

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-gray-800">
                    Member Message
                  </span>
                  <span className="text-[10px] text-gray-400">14:22</span>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">
                  Checking the v2.4 patch logs. It seems the latency spikes are
                  localized to the Asia-Pacific node.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};

export default SuperAdminViewModal;
