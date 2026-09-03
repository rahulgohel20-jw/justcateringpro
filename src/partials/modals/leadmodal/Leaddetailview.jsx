import { useState, useEffect } from "react";
import FollowUpModal from "../../../partials/modals/add-followup-lead/FollowUpModal";

const Leaddetailview = ({
  isOpen,
  onClose,
  lead = {},
  followUps = [],
  onNewFollowUp,
  onSaveFollowUp,
  onEdit,
  onDelete,
  permissions,
}) => {
  const [activeTab, setActiveTab] = useState("details");
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Resolve follow-ups from prop OR from lead.followUpDetails
  const resolvedFollowUps =
    followUps.length > 0 ? followUps : lead.followUpDetails || [];

  useEffect(() => {
    if (isOpen) setActiveTab("details");
  }, [isOpen, lead?.id]);

  if (!isOpen) return null;

  /* ── helpers ─────────────────────────────────────── */
  const formatDate = (dateStr) => {
    if (!dateStr) return "NA";
    try {
      if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
        const [datePart, ...rest] = dateStr.split(" ");
        const [day, month, year] = datePart.split("/");
        const isoDate = new Date(`${year}-${month}-${day} ${rest.join(" ")}`);
        return isoDate.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
      return new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  const stagePillColor = (name = "") => {
    const n = name.toLowerCase();
    if (n.includes("hot")) return { bg: "#EFF6FF", text: "#2563EB" };
    if (n.includes("cold")) return { bg: "#F5F3FF", text: "#7C3AED" };
    if (n.includes("new") || n.includes("inquiry"))
      return { bg: "#FFF7ED", text: "#EA580C" };
    if (n.includes("won") || n.includes("confirm"))
      return { bg: "#F0FDF4", text: "#16A34A" };
    if (n.includes("cancel") || n.includes("lost"))
      return { bg: "#FEF2F2", text: "#DC2626" };
    if (n.includes("follow")) return { bg: "#EFF6FF", text: "#2563EB" };
    return { bg: "#F0FDF4", text: "#22C55E" };
  };

  const followUpColor = (type = "") => {
    if (type === "Call") return { bg: "#EFF6FF", text: "#2563EB", icon: "📞" };
    if (type === "WhatsApp")
      return { bg: "#F0FDF4", text: "#16A34A", icon: "💬" };
    if (type === "Email") return { bg: "#FFF7ED", text: "#EA580C", icon: "✉️" };
    return { bg: "#F9FAFB", text: "#6B7280", icon: "📋" };
  };

  /* ── tabs config ─────────────────────────────────── */
  const TABS = [
    { key: "details", label: "Lead Details", icon: null },
    {
      key: "followup",
      label: "Follow-Up",
      count: resolvedFollowUps.length,
      icon: (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <path
            d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ];

  /* ── InfoRow ─────────────────────────────────────── */
  const InfoRow = ({ label, children }) => (
    <div className="flex items-start py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-400 w-32 flex-shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-gray-800 flex-1">{children}</span>
    </div>
  );

  /* ── Tab: Lead Details ───────────────────────────── */
  const LeadDetailsTab = () => {
    const [note, setNote] = useState(
      lead.leadRemark || lead.overallRemark || "",
    );
    const [noteFile, setNoteFile] = useState(null);
    const [isSavingNote, setIsSavingNote] = useState(false);

    // Derive source name safely
    const sourceName =
      typeof lead.leadSource === "object"
        ? lead.leadSource?.sourceName || "—"
        : lead.leadSource || "—";

    // Derive sub-source name safely
    const subSourceName =
      typeof lead.leadSubSource === "object"
        ? lead.leadSubSource?.subSourceName || null
        : null;

    const handleSaveNote = async () => {
      setIsSavingNote(true);
      try {
        
        console.log("Note saved:", note, noteFile);
      } finally {
        setIsSavingNote(false);
      }
    };

    // Stage color based on closeStageName
    const stageColors = stagePillColor(lead.closeStageName || "");

    return (
      <div className="flex flex-col gap-0 overflow-y-auto flex-1 px-4 py-3">
        {/* Lead header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
            {lead.leadCode || "L-000"}
          </span>
          <span className="text-base font-semibold text-gray-800">
            {lead.clientName || "—"}
          </span>
        </div>

        {/* Pipeline info */}
        <div className="rounded-xl px-4 py-3 mb-4">
          <InfoRow label="Pipeline">
            <span
              className="inline-flex px-3 py-0.5 rounded-full text-xs font-semibold"
              style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
            >
              {lead.pipelineName || "Pipeline"}
            </span>
          </InfoRow>

          <InfoRow label="Stage">
            {lead.closeStageName ? (
              <span
                className="inline-flex px-3 py-0.5 rounded-full text-xs font-semibold capitalize"
                style={{
                  backgroundColor: stageColors.bg,
                  color: stageColors.text,
                }}
              >
                {lead.closeStageName}
              </span>
            ) : (
              <div className="relative inline-block">
                <select
                  className="appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1 pr-7 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-400"
                  defaultValue=""
                >
                  <option value="">Select Stage</option>
                  <option>New Inquiry</option>
                  <option>Cold Lead</option>
                  <option>Hot Lead</option>
                  <option>Proposal sent</option>
                  <option>Client Demo</option>
                  <option>Follow up</option>
                  <option>Won</option>
                  <option>Lost</option>
                </select>
                <svg
                  className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            )}
          </InfoRow>

          <InfoRow label="Assigned To">
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs font-bold text-green-700">
                {(lead.leadAssignName || "M")[0]?.toUpperCase()}
              </span>
              {lead.leadAssignName || "—"}
            </span>
          </InfoRow>

          <InfoRow label="Amount">
            ₹{(lead.estimateAmount ?? 0).toLocaleString("en-IN")}
          </InfoRow>

          <InfoRow label="Source">{sourceName}</InfoRow>

          {subSourceName && (
            <InfoRow label="Sub Source">{subSourceName}</InfoRow>
          )}

          {lead.eventTypeName && (
            <InfoRow label="Event Type">{lead.eventTypeName}</InfoRow>
          )}

          {lead.functionName && (
            <InfoRow label="Function">{lead.functionName}</InfoRow>
          )}

          <InfoRow label="Inquiry Date">{lead.inquiryDate || "NA"}</InfoRow>

          {lead.tentEventDate && lead.tentEventDate.length > 0 && (
            <InfoRow label="Event Date(s)">
              {lead.tentEventDate.join(", ")}
            </InfoRow>
          )}
        </div>

        {/* Contact Details section */}
        <p className="text-sm font-semibold mb-2" style={{ color: "#22C55E" }}>
          Contact Details
        </p>
        <div className="rounded-xl px-4 py-3 mb-4">
          <InfoRow label="Name">{lead.clientName || "—"}</InfoRow>
          <InfoRow label="Email">{lead.emailId || "—"}</InfoRow>
          <InfoRow label="Contact No">{lead.contactNumber || "—"}</InfoRow>
          {lead.companyName && (
            <InfoRow label="Company">{lead.companyName}</InfoRow>
          )}
          {lead.address && <InfoRow label="Address">{lead.address}</InfoRow>}
          {lead.cityName && <InfoRow label="City">{lead.cityName}</InfoRow>}
          {lead.stateName && <InfoRow label="State">{lead.stateName}</InfoRow>}
          {lead.pinCode && <InfoRow label="Pin Code">{lead.pinCode}</InfoRow>}
          <InfoRow label="Created at">{formatDate(lead.createdAt)}</InfoRow>
        </div>

        {/* Capacity Details (if available) */}
        {(lead.minPax || lead.maxPax) && (
          <>
            <p
              className="text-sm font-semibold mb-2"
              style={{ color: "#22C55E" }}
            >
              Capacity
            </p>
            <div className="rounded-xl px-4 py-3 mb-4">
              {lead.minPax && <InfoRow label="Min Pax">{lead.minPax}</InfoRow>}
              {lead.maxPax && <InfoRow label="Max Pax">{lead.maxPax}</InfoRow>}
            </div>
          </>
        )}

        {/* Notes section */}
        <p className="text-sm font-semibold mb-2" style={{ color: "#22C55E" }}>
          Notes
        </p>
        <hr className="border-gray-100 mb-3" />

        {/* Notes textarea */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 mb-3">
          <textarea
            rows={4}
            className="w-full bg-transparent px-4 py-3 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none rounded-xl"
            placeholder="Add Notes..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        {/* Voice + Attach icons */}
      </div>
    );
  };

  /* ── Tab: Follow-Up ──────────────────────────────── */
  const FollowUpTab = () => {
    const parseFollowUpDate = (dateStr) => {
      if (!dateStr) return null;
      if (/^\d{2}\/\d{2}\/\d{4}/.test(dateStr)) {
        const [datePart, time, meridiem] = dateStr.split(" ");
        const [day, month, year] = datePart.split("/");
        return new Date(
          `${year}-${month}-${day} ${time || ""} ${meridiem || ""}`.trim(),
        );
      }
      return new Date(dateStr);
    };

    const formatFollowUpDate = (dateStr) => {
      const d = parseFollowUpDate(dateStr);
      if (!d || isNaN(d)) return dateStr || "—";
      return d.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    };

    const formatFollowUpTime = (dateStr) => {
      const d = parseFollowUpDate(dateStr);
      if (!d || isNaN(d)) return "";
      return d.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Follow-up list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {resolvedFollowUps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <svg
                width="72"
                height="72"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#9CA3AF"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <polyline points="9 15 11 17 15 13" strokeWidth="1.5" />
              </svg>
              <p className="text-lg font-semibold text-gray-700">
                No Follow-up Here
              </p>
              <p className="text-sm text-gray-400 text-center max-w-[220px]">
                It seems that you don't have any follow-up in this list
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-1">
              {resolvedFollowUps.map((fu, i) => {
                const colors = followUpColor(fu.followUpType);
                return (
                  <div
                    key={fu.id || i}
                    className="rounded-xl border border-gray-100 bg-white p-3 shadow-sm"
                  >
                    {/* Row 1: Type badge + Date */}
                    <div className="flex items-center justify-between mb-2">
                      {/* <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                        style={{
                          backgroundColor: colors.bg,
                          color: colors.text,
                        }}
                      >
                        {colors.icon} {fu.followUpType || "Follow-up"}
                      </span> */}
                      <div className="text-right">
                        {fu.followUpDate ? (
                          <>
                            <p className="text-xs font-medium text-gray-600">
                              {formatFollowUpDate(fu.followUpDate)}
                            </p>
                            {formatFollowUpTime(fu.followUpDate) && (
                              <p className="text-[10px] text-gray-400">
                                {formatFollowUpTime(fu.followUpDate)}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-xs text-gray-400">No date set</p>
                        )}
                      </div>
                    </div>

                    {/* Client Remarks */}
                    {fu.clientRemarks && (
                      <p className="text-sm text-gray-600 leading-relaxed mb-2">
                        {fu.clientRemarks}
                      </p>
                    )}

                    {/* Row 2: Status + Assigned member */}
                    <div className="flex items-center justify-between mt-1">
                      {/* <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor:
                            fu.followUpStatus === "Open"
                              ? "#EFF6FF"
                              : fu.followUpStatus === "Close"
                                ? "#F0FDF4"
                                : "#F9FAFB",
                          color:
                            fu.followUpStatus === "Open"
                              ? "#2563EB"
                              : fu.followUpStatus === "Close"
                                ? "#16A34A"
                                : "#6B7280",
                        }}
                      >
                        {fu.followUpStatus || "Open"}
                      </span> */}

                      {fu.memberName && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <span className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-[10px] font-bold text-green-700">
                            {fu.memberName[0]?.toUpperCase()}
                          </span>
                          {fu.memberName}
                        </span>
                      )}
                    </div>

                    {/* Employee Remarks */}
                    {fu.employeeRemarks && (
                      <p className="text-xs text-gray-400 italic mt-1.5 truncate">
                        {fu.employeeRemarks}
                      </p>
                    )}

                    {/* Created at */}
                    {fu.createdAt && (
                      <p className="text-[10px] text-gray-300 mt-1.5">
                        Added: {fu.createdAt}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ── render ──────────────────────────────────────── */
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[1040] bg-black/30" onClick={onClose} />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full z-[1050] bg-white flex flex-col shadow-2xl"
        style={{ width: 520 }}
      >
        {/* ── Top bar ────────────────────────────── */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          <div className="flex items-center gap-2 flex-1 mx-3">
            <span className="text-xs font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
              {lead.leadCode || "L-000"}
            </span>
            <span className="text-sm font-semibold text-gray-800 truncate">
              {lead.clientName || "Lead Detail"}
            </span>
            {/* Stage badge in header */}
            {lead.closeStageName &&
              (() => {
                const c = stagePillColor(lead.closeStageName);
                return (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0"
                    style={{ backgroundColor: c.bg, color: c.text }}
                  >
                    {lead.closeStageName}
                  </span>
                );
              })()}
          </div>
        </div>

        {/* ── Tabs ───────────────────────────────── */}
        <div className="flex border-b border-gray-100 flex-shrink-0 bg-white">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all relative ${
                  isActive
                    ? "text-gray-800"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {tab.icon && (
                  <span
                    style={{
                      color: isActive
                        ? tab.key === "followup"
                          ? "#EA580C"
                          : "#22C55E"
                        : "currentColor",
                    }}
                  >
                    {tab.icon}
                  </span>
                )}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-xs ${isActive ? "text-gray-500" : "text-gray-400"}`}
                  >
                    [{tab.count}]
                  </span>
                )}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: "#22C55E" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {activeTab === "details" && <LeadDetailsTab />}
          {activeTab === "followup" && <FollowUpTab />}
        </div>
      </div>

      {/* ── Follow-Up Modal ────────────────────── */}
      {isFollowUpModalOpen && (
        <FollowUpModal
          isOpen={isFollowUpModalOpen}
          onClose={() => setIsFollowUpModalOpen(false)}
          onSave={(followUpData) => {
            onSaveFollowUp?.(followUpData);
            setIsFollowUpModalOpen(false);
          }}
          clientName={lead.clientName}
          leadData={{
            leadId: lead.id || lead.leadId,
            clientName: lead.clientName,
            leadCode: lead.leadCode,
            contactNumber: lead.contactNumber,
            emailId: lead.emailId,
            leadAssignId: lead.leadAssignId,
            followUps: resolvedFollowUps,
          }}
          existingFollowUps={resolvedFollowUps}
          zIndex={1100}
        />
      )}
    </>
  );
};

export default Leaddetailview;
