import { useEffect, useState, useCallback } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { GetAllGuest, GenerateTesterLink, GetAllGeneratedLinkGuest } from "@/services/apiServices";
import { Copy, Loader2, Search, X, Users, Link2, Plus, Share2, BarChart2, FileText } from "lucide-react";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";

import MenuReport from "../menu-report/MenuReport";
import AddGuestModal from "../add-guest/AddGuestModal";

const TABS = { SHARE: "share", REPORT: "report" };

const TASTING_REPORT_TEMPLATE = {
  selectedTemplateId: 9503,
  mappingId: 80,
  moduleId: 7,
  catFontIds: 12,
  itemFontIds: 11,
  sloganFontIds: 1,
  catFontSizes: 18,
  itemFontSizes: 14,
  sloganFontSizes: 12,
};

// ── ReportTab ────────────────────────────────────────────────────────────────
const ReportTab = ({ eventId, selectedFunction, onGenerateReport }) => {
  const intl = useIntl();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = useCallback(async () => {
    if (!eventId || !selectedFunction) return;
    setLoading(true);
    try {
      const res = await GetAllGeneratedLinkGuest(eventId, selectedFunction);
      setRecords(res?.data?.data || []);
    } catch (err) {
      console.error("Report fetch error:", err);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [eventId, selectedFunction]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-gray-400 text-sm">
        <Loader2 size={18} className="animate-spin" />
        <FormattedMessage id="USER.FOOD_FESTIVAL.LOADING_REPORT" defaultMessage="Loading report..." />
      </div>
    );
  }

  if (!records.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2 text-gray-400 text-sm">
        <BarChart2 size={32} className="opacity-25" />
        <FormattedMessage id="USER.FOOD_FESTIVAL.NO_LINKS_GENERATED" defaultMessage="No tasting links generated yet." />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Refresh */}
      <div className="flex justify-end">
        <button
          className="btn btn-sm btn-light flex items-center gap-1.5 text-xs"
          onClick={fetchReport}
        >
          <Loader2 size={12} />
          <FormattedMessage id="USER.FOOD_FESTIVAL.REFRESH" defaultMessage="Refresh" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-500 uppercase tracking-wide text-[10px]">
              <th className="px-3 py-2 text-left font-semibold">#</th>
              <th className="px-3 py-2 text-left font-semibold">
                <FormattedMessage id="USER.FOOD_FESTIVAL.GUEST" defaultMessage="Guest" />
              </th>
              <th className="px-3 py-2 text-center font-semibold">
                <FormattedMessage id="USER.FOOD_FESTIVAL.MEMBERS" defaultMessage="Members" />
              </th>
              <th className="px-3 py-2 text-center font-semibold">
                <FormattedMessage id="USER.FOOD_FESTIVAL.REPORT" defaultMessage="Report" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {records.map((rec, i) => (
              <tr key={rec.testerId ?? i} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2.5 text-gray-400">{i + 1}</td>

                {/* Guest */}
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{ background: "var(--bs-primary, #7c3aed)" }}
                    >
                      {(rec.testerName || "?").slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800 truncate max-w-[140px]">
                      {rec.testerName || "-"}
                    </span>
                  </div>
                </td>

                {/* Members */}
                <td className="px-3 py-2.5 text-center text-gray-600 font-medium">
                  {rec.members ?? "-"}
                </td>

                {/* Generate Report button */}
                <td className="px-3 py-2.5 text-center">
                  <button
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition hover:opacity-90"
                    style={{ background: "var(--bs-primary, #7c3aed)" }}
                    onClick={() => onGenerateReport(rec)}
                  >
                    <FileText size={11} />
                    <FormattedMessage id="USER.FOOD_FESTIVAL.REPORT" defaultMessage="Report" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 text-xs text-gray-400 px-1">
        <span>
          <FormattedMessage id="USER.FOOD_FESTIVAL.TOTAL" defaultMessage="Total" />
          : <strong className="text-gray-600">{records.length}</strong>
        </span>
        <span>
          <FormattedMessage id="USER.FOOD_FESTIVAL.MEMBERS" defaultMessage="Members" />
          : <strong className="text-gray-600">{records.reduce((s, r) => s + (r.members || 0), 0)}</strong>
        </span>
      </div>
    </div>
  );
};

// ── FoodFestivalModal ────────────────────────────────────────────────────────
const FoodFestivalModal = ({
  isOpen,
  onClose,
  eventId,
  selectedFunction,
  selectedTemplateName,
  eventName,
  agencyType,
  isManager,
  mobileNumber,
}) => {
  const intl = useIntl();
  const [activeTab, setActiveTab] = useState(TABS.SHARE);
  const [guests, setGuests] = useState([]);
  const [guestSearch, setGuestSearch] = useState("");
  const [guestLoading, setGuestLoading] = useState(false);
  const [memberCounts, setMemberCounts] = useState({});
  const [generatingId, setGeneratingId] = useState(null);
  const [guestLinks, setGuestLinks] = useState({});
  const [addGuestOpen, setAddGuestOpen] = useState(false);

  // ── MenuReport state ──────────────────────────────────────────────────────
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportPartyId, setReportPartyId] = useState(null);
  const [reportPartyName, setReportPartyName] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!isOpen) return;
    setActiveTab(TABS.SHARE);
    setGuestSearch("");
    setMemberCounts({});
    setGuestLinks({});
    fetchGuests("");
  }, [isOpen]);

  const fetchGuests = async (term) => {
    setGuestLoading(true);
    try {
      const res = await GetAllGuest(userId);
      const list = res?.data?.data || [];
      const filtered = term.trim()
        ? list.filter(
            (g) =>
              (g.nameEnglish || "").toLowerCase().includes(term.toLowerCase()) ||
              (g.nameHindi || "").toLowerCase().includes(term.toLowerCase()) ||
              (g.nameGujarati || "").toLowerCase().includes(term.toLowerCase()) ||
              (g.contactNo || "").includes(term) ||
              (g.email || "").toLowerCase().includes(term.toLowerCase())
          )
        : list;
      setGuests(filtered);
    } catch (err) {
      console.error("Guest fetch error:", err);
      setGuests([]);
    } finally {
      setGuestLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => fetchGuests(guestSearch), 400);
    return () => clearTimeout(timer);
  }, [guestSearch, isOpen]);

  const handleGenerate = async (guest) => {
    setGeneratingId(guest.id);
    try {
      const payload = {
        eventFunctionId: Number(selectedFunction),
        eventId: Number(eventId),
        testerId: Number(guest.id),
        members: Number(memberCounts[guest.id] || 0),
        userId: Number(userId),
      };
      const res = await GenerateTesterLink(payload);
      if (res?.data?.success) {
        const token = res.data.data.token;
        const code = res.data.data.accessCode || "";
        setGuestLinks((prev) => ({
          ...prev,
          [guest.id]: {
            link: `${window.location.origin}/menu-review?token=${token}`,
            code,
          },
        }));
      } else {
        Swal.fire({
          icon: "error",
          title: res?.data?.msg || intl.formatMessage({ id: "USER.FOOD_FESTIVAL.LINK_FAILED", defaultMessage: "Failed to generate link" }),
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err?.response?.data?.msg || intl.formatMessage({ id: "USER.FOOD_FESTIVAL.SOMETHING_WRONG", defaultMessage: "Something went wrong" }),
      });
    } finally {
      setGeneratingId(null);
    }
  };

  const copyToClipboard = (text, label) => {
    const showSuccess = () =>
      Swal.fire({
        icon: "success",
        title: label || intl.formatMessage({ id: "USER.FOOD_FESTIVAL.COPIED", defaultMessage: "Copied!" }),
        timer: 1200,
        showConfirmButton: false,
      });
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(showSuccess);
      return;
    }
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.cssText = "position:fixed;top:-9999px;opacity:0";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      showSuccess();
    } catch {
      Swal.fire({
        icon: "error",
        title: intl.formatMessage({ id: "USER.FOOD_FESTIVAL.COPY_FAILED", defaultMessage: "Copy failed" }),
      });
    }
  };

  const handleGenerateReport = (rec) => {
    setReportPartyId(rec.testerId);
    setReportPartyName(rec.testerName || "");
    setReportModalOpen(true);
  };

  return (
    <>
      <CustomModal
        open={isOpen}
        onClose={onClose}
        title={intl.formatMessage({ id: "USER.FOOD_FESTIVAL.MODAL_TITLE", defaultMessage: "Food Festival — Generate Tasting Links" })}
        width="min(680px, 95vw)"
        footer={
          <div className="flex justify-end">
            <button className="btn btn-light" onClick={onClose}>
              <FormattedMessage id="COMMON.CLOSE" defaultMessage="Close" />
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-3" style={{ height: "70vh", maxHeight: "600px" }}>
          <div className="flex gap-1 p-1 rounded-xl bg-gray-100 w-fit flex-shrink-0">
            {[
              { key: TABS.SHARE, icon: <Share2 size={14} />, labelId: "USER.FOOD_FESTIVAL.SHARE_LINK", labelDefault: "Share Link" },
              { key: TABS.REPORT, icon: <BarChart2 size={14} />, labelId: "USER.FOOD_FESTIVAL.REPORT", labelDefault: "Report" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: activeTab === tab.key ? "#fff" : "transparent",
                  color: activeTab === tab.key ? "var(--bs-primary, #7c3aed)" : "#6b7280",
                  boxShadow: activeTab === tab.key ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {tab.icon}
                <FormattedMessage id={tab.labelId} defaultMessage={tab.labelDefault} />
              </button>
            ))}
          </div>

          {activeTab === TABS.SHARE && (
            <div className="flex flex-col gap-3 flex-1 min-h-0">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    className="input w-full pl-9 pr-8"
                    placeholder={intl.formatMessage({
                      id: "USER.FOOD_FESTIVAL.SEARCH_GUESTS_PLACEHOLDER",
                      defaultMessage: "Search guests by name, phone, email...",
                    })}
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                  />
                  {guestLoading ? (
                    <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                  ) : guestSearch ? (
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={() => setGuestSearch("")}>
                      <X size={14} />
                    </button>
                  ) : null}
                </div>
                <button
                  className="btn btn-sm flex items-center gap-1.5 flex-shrink-0"
                  style={{ background: "var(--bs-primary, #7c3aed)", color: "#fff", border: "none", height: "38px", paddingInline: "16px" }}
                  onClick={() => setAddGuestOpen(true)}
                >
                  <Plus size={15} />
                  <FormattedMessage id="USER.FOOD_FESTIVAL.ADD" defaultMessage="Add" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1">
                <div className="flex flex-col gap-2">
                  {guestLoading && guests.length === 0 ? (
                    <div className="flex items-center justify-center py-12 gap-2 text-gray-400 text-sm">
                      <Loader2 size={16} className="animate-spin" />
                      <FormattedMessage id="USER.FOOD_FESTIVAL.LOADING_GUESTS" defaultMessage="Loading guests..." />
                    </div>
                  ) : guests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400 text-sm">
                      <Search size={24} className="opacity-30" />
                      <FormattedMessage id="USER.FOOD_FESTIVAL.NO_GUESTS_FOUND" defaultMessage="No guests found" />
                    </div>
                  ) : (
                    guests.map((guest) => {
                      const isGenerating = generatingId === guest.id;
                      const linkData = guestLinks[guest.id];
                      const memberCount = memberCounts[guest.id] ?? "";

                      return (
                        <div
                          key={guest.id}
                          className="border rounded-2xl flex-shrink-0"
                          style={{
                            borderColor: linkData ? "#86efac" : "#e5e7eb",
                            background: linkData ? "#f0fdf4" : "#fff",
                          }}
                        >
                          {/* Top row */}
                          <div className="flex items-center gap-3 px-4 py-3">
                            {/* Avatar */}
                            <div
                              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                              style={{ background: "var(--bs-primary, #7c3aed)" }}
                            >
                              {(guest.nameEnglish || "?").slice(0, 2).toUpperCase()}
                            </div>

                            {/* Name */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">
                                {guest.nameEnglish || "-"}
                              </p>
                              <p className="text-xs text-gray-400 truncate">
                                {guest.contactNo || guest.email || "-"}
                              </p>
                            </div>

                            <div
                              className="flex items-center gap-1.5 flex-shrink-0"
                              style={{ width: "120px" }}
                            >
                              <Users size={14} className="text-gray-400 flex-shrink-0" />
                              <input
                                type="tel"
                                min={0}
                                placeholder={intl.formatMessage({
                                  id: "USER.FOOD_FESTIVAL.MEMBERS",
                                  defaultMessage: "Members",
                                })}
                                className="input input-sm text-center flex-1 min-w-0"
                                value={memberCount}
                                onChange={(e) =>
                                  setMemberCounts((prev) => ({ ...prev, [guest.id]: e.target.value }))
                                }
                              />
                            </div>

                            <button
                              className="btn btn-sm flex items-center justify-center gap-1.5 flex-shrink-0"
                              style={{
                                background: linkData ? "#16a34a" : "var(--bs-primary, #7c3aed)",
                                color: "#fff",
                                border: "none",
                                width: "108px",
                                height: "34px",
                              }}
                              disabled={isGenerating}
                              onClick={() => handleGenerate(guest)}
                            >
                              {isGenerating ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span className="text-xs">
                                    <FormattedMessage id="USER.FOOD_FESTIVAL.GENERATING" defaultMessage="Generating" />
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Link2 size={13} />
                                  <span className="text-xs">
                                    <FormattedMessage id="USER.FOOD_FESTIVAL.SHARE_LINK_BTN" defaultMessage="Share Link" />
                                  </span>
                                </>
                              )}
                            </button>
                          </div>

                          {linkData && (
                            <div
                              className="px-4 pb-3 pt-2 flex flex-col gap-2"
                              style={{ borderTop: "1px dashed #86efac" }}
                            >
                              {/* Link row */}
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-gray-500 flex-shrink-0 w-9">
                                  <FormattedMessage id="USER.FOOD_FESTIVAL.LINK" defaultMessage="Link" />
                                </span>
                                <input
                                  readOnly
                                  className="h-8 px-3 rounded-lg border border-gray-200 text-xs bg-white flex-1 min-w-0 outline-none truncate font-mono"
                                  value={linkData.link}
                                />
                                <button
                                  className="h-8 px-3 rounded-lg text-white text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                                  style={{ background: "var(--bs-primary, #7c3aed)" }}
                                  onClick={() =>
                                    copyToClipboard(
                                      linkData.link,
                                      intl.formatMessage({ id: "USER.FOOD_FESTIVAL.LINK_COPIED", defaultMessage: "Link copied!" })
                                    )
                                  }
                                >
                                  <Copy size={12} />
                                  <FormattedMessage id="USER.FOOD_FESTIVAL.COPY" defaultMessage="Copy" />
                                </button>
                              </div>

                              {linkData.code && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-gray-500 flex-shrink-0 w-9">
                                    <FormattedMessage id="USER.FOOD_FESTIVAL.CODE" defaultMessage="Code" />
                                  </span>
                                  <input
                                    readOnly
                                    className="h-8 px-3 rounded-lg border border-gray-200 text-xs bg-white flex-1 min-w-0 outline-none font-mono font-bold tracking-widest"
                                    style={{ color: "var(--bs-primary, #7c3aed)" }}
                                    value={linkData.code}
                                  />
                                  <button
                                    className="h-8 px-3 rounded-lg text-white text-xs font-semibold flex items-center gap-1 flex-shrink-0"
                                    style={{ background: "var(--bs-primary, #7c3aed)" }}
                                    onClick={() =>
                                      copyToClipboard(
                                        linkData.code,
                                        intl.formatMessage({ id: "USER.FOOD_FESTIVAL.CODE_COPIED", defaultMessage: "Code copied!" })
                                      )
                                    }
                                  >
                                    <Copy size={12} />
                                    <FormattedMessage id="USER.FOOD_FESTIVAL.COPY" defaultMessage="Copy" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === TABS.REPORT && (
            <div className="flex-1 min-h-0 overflow-y-auto">
              <ReportTab
                eventId={eventId}
                selectedFunction={selectedFunction}
                onGenerateReport={handleGenerateReport}
              />
            </div>
          )}
        </div>
      </CustomModal>

      {reportModalOpen && (
        <MenuReport
          isModalOpen={reportModalOpen}
          setIsModalOpen={setReportModalOpen}
          eventId={eventId}
          eventFunctionId={selectedFunction}
          moduleId={TASTING_REPORT_TEMPLATE.moduleId}
          mappingId={TASTING_REPORT_TEMPLATE.mappingId}
          selectedTemplateId={TASTING_REPORT_TEMPLATE.selectedTemplateId}
          selectedTemplateName={selectedTemplateName || `${intl.formatMessage({ id: "USER.FOOD_FESTIVAL.TASTING_REPORT_PREFIX", defaultMessage: "Exclusive Food Tasting Report" })} — ${reportPartyName}`}
          eventName={eventName}
          agencyType={agencyType}
          isAdminModuleReport={false}
          selectedParty={reportPartyId}
          isManager={isManager}
          exclusive={true}
          mobileNumber={mobileNumber}
          catFontIds={TASTING_REPORT_TEMPLATE.catFontIds}
          catFontSizes={TASTING_REPORT_TEMPLATE.catFontSizes}
          itemFontIds={TASTING_REPORT_TEMPLATE.itemFontIds}
          itemFontSizes={TASTING_REPORT_TEMPLATE.itemFontSizes}
          sloganFontIds={TASTING_REPORT_TEMPLATE.sloganFontIds}
          sloganFontSizes={TASTING_REPORT_TEMPLATE.sloganFontSizes}
        />
      )}

      {addGuestOpen && (
        <AddGuestModal
          isModalOpen={addGuestOpen}
          setIsModalOpen={setAddGuestOpen}
          onSuccess={() => fetchGuests(guestSearch)}
        />
      )}
    </>
  );
};

export default FoodFestivalModal;
