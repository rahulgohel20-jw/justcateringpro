import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FormattedMessage } from "react-intl";
import { toAbsoluteUrl } from "@/utils";
import {
  GetOutsideSummary,
  AddExclusiveReport,
  GetSelectedItemsForReportFilter,
  GetAllRawMaterialAllocationCategory,
} from "@/services/apiServices";
import SelectMenureport from "../../partials/modals/menu-report/SelectMenureport";
import { createPortal } from "react-dom";
import { WhatsAppPdf } from "../../services/apiServices";



const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M20.52 3.48A11.92 11.92 0 0 0 12.04 0C5.44.03.16 5.32.16 11.93c0 2.1.55 4.14 1.6 5.95L0 24l6.29-1.73a11.9 11.9 0 0 0 5.75 1.48h.01c6.59 0 11.86-5.28 11.89-11.88a11.87 11.87 0 0 0-3.42-8.39ZM12.05 21.2h-.01a9.27 9.27 0 0 1-4.73-1.29l-.34-.2-3.73 1.03 1-3.64-.22-.37A9.25 9.25 0 0 1 2.78 11.9c0-5.11 4.16-9.28 9.29-9.3 2.48 0 4.81.97 6.56 2.72a9.26 9.26 0 0 1 2.72 6.56c-.02 5.12-4.18 9.3-9.3 9.31Zm5.32-6.93c-.29-.15-1.7-.84-1.96-.94-.26-.09-.45-.15-.65.15-.2.29-.74.94-.91 1.13-.17.19-.34.21-.63.08-.29-.14-1.2-.44-2.29-1.41-.85-.76-1.43-1.7-1.6-1.98-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.09-.19.05-.36-.02-.51-.07-.15-.65-1.57-.89-2.15-.24-.58-.48-.5-.65-.5l-.56-.01c-.19 0-.5.07-.76.36-.26.29-.99.97-.99 2.36s1.02 2.74 1.16 2.93c.14.19 2 3.06 4.85 4.29.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.11.55-.08 1.7-.7 1.94-1.37.24-.68.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34Z" />
  </svg>
);

const WhatsAppModal = ({ isOpen, onClose, onSend }) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const handleSend = () => {
    const cleaned = mobile.replace(/\D/g, "");
    if (!cleaned || cleaned.length < 10) {
      setError("Please enter a valid mobile number (min 10 digits).");
      return;
    }
    setError("");
    onSend(`+91${cleaned}`, name.trim());
    setName("");
    setMobile("");
  };

  const handleClose = () => {
    setName(""); setMobile(""); setError(""); onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="bg-green-600 px-6 py-4 flex items-center gap-3">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <h2 className="text-white font-semibold text-lg">Share via WhatsApp</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <p className="text-gray-600 text-sm">Enter the recipient's WhatsApp number to share the report PDF.</p>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Name</label>
            <input
              type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="e.g. Rahul"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">Mobile Number</label>
            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-green-500 transition">
              <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">+91</span>
              <input
                type="tel" value={mobile} maxLength={10}
                onChange={(e) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="9876543210"
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            <p className="text-gray-400 text-xs mt-1">Enter 10 digit mobile number</p>
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button onClick={handleClose} className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">Cancel</button>
          <button onClick={handleSend} className="px-5 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Send
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const PdfPreviewModal = ({ isOpen, onClose, pdfUrl, onWhatsAppShare }) => {
  const pdfPlugin = defaultLayoutPlugin();
  const isPrintingRef = useRef(false);

  // Same print intercept logic as MenuReport
  useEffect(() => {
    if (!pdfUrl || !isOpen) return;
    const originalPrint = window.print.bind(window);

    const interceptedPrint = async () => {
      if (isPrintingRef.current) return;
      isPrintingRef.current = true;
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error("Failed to fetch PDF");
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const isEdge = /Edg\//.test(navigator.userAgent);

        if (isEdge) {
          const newTab = window.open(blobUrl, "_blank");
          if (newTab) {
            newTab.onload = () => setTimeout(() => { newTab.focus(); newTab.print(); }, 1000);
          }
          const onFocusBack = () => {
            setTimeout(() => { isPrintingRef.current = false; }, 500);
            window.removeEventListener("focus", onFocusBack);
          };
          window.addEventListener("focus", onFocusBack);
          return;
        }

        const iframe = document.createElement("iframe");
        iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
        iframe.src = blobUrl;
        document.body.appendChild(iframe);

        iframe.onload = () => {
          setTimeout(() => {
            try { iframe.contentWindow.focus(); iframe.contentWindow.print(); }
            catch { window.open(blobUrl, "_blank"); }
          }, 800);

          const onBeforePrint = () => { isPrintingRef.current = true; };
          const onAfterPrint = () => {
            setTimeout(() => {
              isPrintingRef.current = false;
              document.body.removeChild(iframe);
              URL.revokeObjectURL(blobUrl);
            }, 500);
            window.removeEventListener("beforeprint", onBeforePrint);
            window.removeEventListener("afterprint", onAfterPrint);
          };
          window.addEventListener("beforeprint", onBeforePrint);
          window.addEventListener("afterprint", onAfterPrint);

          const armFocusGuard = () => {
            const onWindowFocus = () => {
              setTimeout(() => { if (!isPrintingRef.current) return; isPrintingRef.current = false; }, 800);
              window.removeEventListener("focus", onWindowFocus);
            };
            window.addEventListener("focus", onWindowFocus);
          };
          armFocusGuard();
        };
        iframe.onerror = () => { window.open(pdfUrl, "_blank"); isPrintingRef.current = false; };
      } catch {
        window.open(pdfUrl, "_blank");
        isPrintingRef.current = false;
      }
    };

    window.print = interceptedPrint;
    return () => { window.print = originalPrint; };
  }, [pdfUrl, isOpen]);

  if (!isOpen || !pdfUrl) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60">
      <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">Report Preview</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onWhatsAppShare}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Share on WhatsApp
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
  {pdfUrl?.startsWith("http://") ? (
   
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <p className="text-gray-600 text-sm">Preview not available for this URL.</p>
      <a
        href={pdfUrl}
        target="_blank"
        rel="noreferrer"
        className="px-5 py-2 bg-[#005BA8] text-white rounded-lg text-sm font-medium hover:bg-[#004a8d] transition"
      > 
        Open PDF in New Tab
      </a>
    </div>
  ) : (
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <Viewer fileUrl={pdfUrl} plugins={[pdfPlugin]} />
    </Worker>
  )}
</div>
      </div>
    </div>,
    document.body,
  );
};

const getCompanyAuthInfo = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return { companyMobileNo: "", companyName: "" };
    const parsed = JSON.parse(authStorage);
    const user = parsed?.state?.user || {};
    return {
      companyMobileNo:
        user.userBasicDetails?.officeNo ||
        user.company?.mobileNo ||
        user.mobileNo ||
        user.mobile ||
        "",
      companyName:
        user.userBasicDetails?.companyName ||
        user.company?.nameEnglish ||
        user.company?.name ||
        "",
    };
  } catch {
    return { companyMobileNo: "", companyName: "" };
  }
};

export default function SummaryItemModalchefoutside({
  open,
  onClose,
  eventFunctionId,
  eventId,
  type,
}) {
  const [expandedItems, setExpandedItems] = useState({});
  const [apiData, setApiData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isShowingAllFunctions = eventFunctionId === -1;
  const [selectedMobile, setSelectedMobile] = useState(null);
  const [selectedAgencyId, setSelectedAgencyId] = useState(null);
  const mode = "allocation";
  const [isSelectMenureport, setIsSelectMenuReport] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ── WhatsApp + Preview state ──────────────────────────────────────────────
  const [whatsAppItem, setWhatsAppItem] = useState(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingRowIndex, setGeneratingRowIndex] = useState(null);
  const [showLangSelect, setShowLangSelect] = useState(false);
const [selectedItemForLang, setSelectedItemForLang] = useState(null);
const [selectedIndexForLang, setSelectedIndexForLang] = useState(null);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
  if (!successMessage) return;
  const timer = setTimeout(() => setSuccessMessage(""), 3000);
  return () => clearTimeout(timer);
}, [successMessage]);

  useEffect(() => {
    if (!open) return;
    const handleEscape = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await GetOutsideSummary(eventFunctionId, eventId, type);
        const menuAllocationDetails = response.data.data["Menu Allocation Details"];
        if (menuAllocationDetails?.length > 0) setApiData(menuAllocationDetails);
      } catch (error) {
        console.error("Error fetching summary data:", error);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [open, eventFunctionId, eventId, type]);


  const handleLangSelect = (lang) => {
  setShowLangSelect(false);

  if (selectedItemForLang !== null) {
    handleWhatsAppClick(selectedItemForLang, selectedIndexForLang, lang);
  }
};

  const displayData = apiData
    ? isShowingAllFunctions
      ? apiData.flatMap((functionData) =>
          functionData.agencyResponse.map((item) => ({
            ...item,
            functionName: functionData.eventFunction?.function?.nameEnglish || "N/A",
            functionDateTime: functionData.eventFunction?.functionStartDateTime || "N/A",
          })),
        )
      : apiData[0]?.agencyResponse || []
    : [];

  const singleFunctionInfo =
    !isShowingAllFunctions && apiData?.[0]
      ? {
          functionName: apiData[0].eventFunction?.function?.nameEnglish || "N/A",
          functionDateTime: apiData[0].eventFunction?.functionStartDateTime || "N/A",
        }
      : null;

  const toggleItems = (index) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };
const handleWhatsAppClick = async (item, index, lang = 0) => {
  

 
//  if (item._cachedPdfUrl) {
//   try {
//     const { companyMobileNo, companyName } = getCompanyAuthInfo();
//     const phoneRaw = item.number || item.mobile || item.contactNumber || "";
//     await WhatsAppPdf({
//       companyMobileNo,
//       companyName,
//       mobileNo: phoneRaw.replace(/\D/g, ""),
//       moduleName: "Order Report",
//       partyName: item.contactName || "",
//       url: item._cachedPdfUrl,
//       userId: Number(userId) || 0,
//     });
//   } catch (err) {
//     console.error("WhatsAppPdf notify failed:", err);
//   }
//   const phone = item.number || item.mobile || item.contactNumber || "";
//   const greeting = item.contactName || "there";
//   const message = `Hi ${greeting},\nPlease find the attached PDF.\n\n${item._cachedPdfUrl}`;
//   window.open(`https://wa.me/${phone.replace(/\D/g,"")}?text=${encodeURIComponent(message)}`, "_blank");
//   return;
// }

  setGeneratingPdf(true);
  setGeneratingRowIndex(index);

  try {
    const agencyId = item.agencyId || item.agency?.id || item.id || item.contactId || null;
    

    let allItemIds = [];
    if (agencyId) {
      const itemsRes = await GetSelectedItemsForReportFilter(eventFunctionId, eventId, [agencyId]);
      allItemIds = itemsRes?.data?.success && itemsRes?.data?.data
        ? itemsRes.data.data.map((i) => i.id)
        : [];
    }

    const categoryRes = await GetAllRawMaterialAllocationCategory(eventId);
    const allCategoryIds = categoryRes?.data?.success && categoryRes?.data?.data
      ? categoryRes.data.data["Raw Material Category Details"].map((c) => c.id)
      : [];

    const formData = new FormData();
formData.append("eventId", eventId);
formData.append("partyId", -1);
formData.append("eventFunctionId", eventFunctionId ?? -1);
formData.append("adminTemplateModuleId", 7);
formData.append("type", "chef");
formData.append("userId", userId);
formData.append("lang", lang);
formData.append("isCategoryImage", 1);
formData.append("isCategoryInstruction", 0);
formData.append("isCategorySlogan", 1);
formData.append("isItemImage", 1);
formData.append("isCombo", 0);
formData.append("isItemInstruction", 0);
formData.append("isItemSlogan", 1);
formData.append("isCompanyDetails", 1);
formData.append("isCompanyLogo", 0);
formData.append("isPartyDetails", 0);
formData.append("isWithQty", 0);
formData.append("pageSize", "");
formData.append("isWithPrice", 1);

formData.append("isDoc", 0);
formData.append("isExcel", 0);
formData.append("isExtraCharges", 0);
formData.append("isTermsCond", 0);
formData.append("isHalfPax", 0);
formData.append("is3Column", 0);
formData.append("isFunctionNextPage", 0);
formData.append("isAddDecoration", 0);
formData.append("isOnePage", 0);
formData.append("isShowEventRemarks", 0);
formData.append("showAdditional", 0);
 formData.append("isAgencyNextPage", 0);
 formData.append("storeIssueWise" , 0);
 formData.append("isAddStoreIssue",0);
 formData.append("is5Column",0);
 formData.append("isContactNoVisible", 1);
 formData.append("isAddMenu", 0);
 formData.append("isNotes",0);
 formData.append("isAdvancePayment",0);
 formData.append("showAddOnLabel",0);
 formData.append("showLastPage", 0);
 formData.append("isSignatureVisible", 0);

formData.append("leadAssignId", 0);
formData.append("priority", "");
formData.append("sourceId", 0);
formData.append("statusId", 0);

if (agencyId) formData.append("agencyId[]", agencyId);
allItemIds.forEach((id) => formData.append("itemId[]", id));
allCategoryIds.forEach((id) => formData.append("rawMaterialCatIds[]", id));

if (eventFunctionId != null && eventFunctionId !== -1) {
  formData.append("eventFunctionIds[]", eventFunctionId);
}

formData.append("catFontId", -1);
formData.append("itemFontId", -1);
formData.append("sloganFontId", -1);
formData.append("catFontSize", -1);
formData.append("itemFontSize", -1);
formData.append("sloganFontSize", -1);

   const data = await AddExclusiveReport(formData);

if (data?.data?.success) {
  item._cachedPdfUrl = data?.data?.report_path;

  // ── NEW: notify via WhatsAppPdf API ──
  try {
    const { companyMobileNo, companyName } = getCompanyAuthInfo();
    const phoneRaw = item.number || item.mobile || item.contactNumber || "";
    const wres = await WhatsAppPdf({
      companyMobileNo,
      companyName,
      mobileNo: phoneRaw.replace(/\D/g, ""),
      moduleName: "Order Report",
      partyName: item.contactName || "",
      url: data?.data?.report_path,
      userId: Number(userId) || 0,
    });
    if(wres?.data?.success) {
        setSuccessMessage("Report sent successfully!");
        } else {
          setSuccessMessage("Report not sent!");
        }
  } catch (whatsAppErr) {
    console.error("WhatsAppPdf notify failed:", whatsAppErr);
    // non-blocking — don't stop the wa.me flow if this fails
  }

  // const phone = item.number || item.mobile || item.contactNumber || "";
  // const greeting = item.contactName || "there";
  // const message = `Hi ${greeting},\nPlease find the attached PDF.\n\n${data?.data?.report_path}`;
  // window.open(
  //   `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
  //   "_blank"
  // );
} else {
  errorMsgPopup(data?.data?.msg || "Failed to generate report");
}
  } catch (err) {
    errorMsgPopup(err?.response?.data?.msg || "Something went wrong");
  } finally {
    setGeneratingPdf(false);
    setGeneratingRowIndex(null);
  }
};






  const handleWhatsAppSend = (mobile, recipientName) => {
  const greeting = recipientName || "there";
  const message = `Hi ${greeting},\nPlease find the report here:\n\n${previewPdfUrl}`;
  window.open(
    `https://wa.me/${mobile.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
  setShowWhatsAppModal(false);
};



  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-4">
            <motion.div
              role="dialog" aria-modal="true"
              className="pointer-events-auto absolute top-6 bottom-6 right-6 w-[1200px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
              initial={{ x: "110%" }} animate={{ x: 0 }} exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
               <h2 className="text-xl font-semibold text-gray-800">
  <FormattedMessage
    id="CHEF_LABOUR.SUMMARY_ITEM_TITLE"
    defaultMessage="Summary Item - Chef Labour"
  />
  {isShowingAllFunctions && (
    <>
      {" "}
      (
      <FormattedMessage
        id="COMMON.ALL_FUNCTIONS"
        defaultMessage="All Functions"
      />
      )
    </>
  )}
</h2>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="p-6">
                  {loading && (
                    <div className="flex justify-center items-center py-8">
                      <div className="text-gray-600">Loading...</div>
                    </div>
                  )}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                      <p className="text-red-600">{error}</p>
                    </div>
                  )}

                  {!loading && !error && (
                    <>
                      {!isShowingAllFunctions && singleFunctionInfo && (
                        <div className="flex items-center gap-6 mb-4">
                          <button className="btn btn-sm btn-primary w-[100px] flex justify-center mt-3">
                            {singleFunctionInfo.functionName}
                          </button>
                          <div className="flex flex-col mb-4">
                            <div className="text-[12px] text-gray-600">
                              <FormattedMessage id="SIDEBAR_MODAL.DATE_TIME" defaultMessage="Date and Time" />
                            </div>
                            <div>
                              <input className="input" type="text" value={singleFunctionInfo.functionDateTime} readOnly />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-xl p-5 mb-6 border border-gray-200">
                        {/* Table Header */}
                       
<div
  className={`grid ${
    isShowingAllFunctions
      ? "grid-cols-[40px_1.2fr_1.2fr_1.2fr_2fr_2fr_1fr_1.5fr_140px]"
      : "grid-cols-[40px_1.5fr_1.5fr_2fr_2fr_1fr_1.5fr_140px]"
  } mt-3 items-center`}
>
  <div className="text-sm font-semibold text-gray-700 text-center">#</div>
  {isShowingAllFunctions && (
    <div className="text-sm font-semibold text-gray-700 ps-3">
      <FormattedMessage id="COMMON.FUNCTION" defaultMessage="Function" />
    </div>
  )}
  <div className="text-sm font-semibold text-gray-700 ps-3">
    <FormattedMessage id="COMMON.CONTACT_NAME" defaultMessage="Contact Name" />
  </div>
  <div className="text-sm font-semibold text-gray-700 ps-3">
    <FormattedMessage id="COMMON.TYPE" defaultMessage="Type" />
  </div>
  <div className="flex flex-col items-center">
    <span className="text-sm font-semibold text-gray-700">
      <FormattedMessage id="COMMON.COUNTER" defaultMessage="Counter" />
    </span>
    <div className="grid grid-cols-2 gap-4 mt-1 text-xs text-gray-600">
      <span>
        <FormattedMessage id="COMMON.QUANTITY" defaultMessage="Quantity" />
      </span>
      <span>
        <FormattedMessage id="COMMON.PRICE" defaultMessage="Price" />
      </span>
    </div>
  </div>
  <div className="flex flex-col items-center">
    <span className="text-sm font-semibold text-gray-700">
      <FormattedMessage id="COMMON.HELPER" defaultMessage="Helper" />
    </span>
    <div className="grid grid-cols-2 gap-4 mt-1 text-xs text-gray-600">
      <span>
        <FormattedMessage id="COMMON.QUANTITY" defaultMessage="Quantity" />
      </span>
      <span>
        <FormattedMessage id="COMMON.PRICE" defaultMessage="Price" />
      </span>
    </div>
  </div>
  <div className="text-sm font-semibold text-gray-700 text-center">
    <FormattedMessage id="COMMON.TOTAL_PAX" defaultMessage="Total Pax" />
  </div>
  <div className="text-sm font-semibold text-gray-700 text-center">
    <FormattedMessage id="COMMON.TOTAL_PRICE" defaultMessage="Total Price" />
  </div>
  <div className="text-sm font-semibold text-gray-700 text-center">
    <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />
  </div>
</div>

                        {displayData.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">No data available</div>
                        ) : (
                          displayData.map((item, index) => (
                            <div key={index}>
                              <div className={`grid ${isShowingAllFunctions ? "grid-cols-[40px_1.2fr_1.2fr_1.2fr_2fr_2fr_1fr_1.5fr_140px]" : "grid-cols-[40px_1.5fr_1.5fr_2fr_2fr_1fr_1.5fr_140px]"} mt-3 items-center bg-white p-3 rounded-lg shadow-sm border`}>
                                <div className="text-sm text-gray-800 text-center flex justify-start ps-1">{index + 1}</div>
                                {isShowingAllFunctions && <div className="text-sm font-medium text-gray-900">{item.functionName}</div>}
                                <div className="text-sm font-medium text-gray-900">{item.contactName || "N/A"}</div>
                                <div className="text-sm text-gray-800">{item.type || "N/A"}</div>
                                <div className="flex justify-center space-x-2 gap-9 text-gray-700">
                                  <span>{item.totalCounterQty || 0}</span><span>{item.totalCounterPrice || 0}</span>
                                </div>
                                <div className="flex justify-center space-x-2 gap-9 text-gray-700">
                                  <span>{item.totalHelperQty || 0}</span><span>{item.totalHeplerPrice || 0}</span>
                                </div>
                                <div className="text-gray-700 text-center">{item.totalPax || 0}</div>
                                <div className="text-sm font-semibold text-gray-900 text-center ps-7">{item.totalPrice || 0}</div>

                                <div className="flex items-center justify-center space-x-2">
                                  {/* ── WhatsApp: generate PDF → preview → send ── */}
                                  <button
                                   onClick={() => {
                                    setSelectedItemForLang(item);
                                    setSelectedIndexForLang(index);
                                    setShowLangSelect(true);
                                  }}
                                    disabled={generatingPdf}
                                    className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Generate & Share via WhatsApp"
                                  >
                                    {generatingPdf && generatingRowIndex === index ? (
                                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                      </svg>
                                    ) : (
                                      <WhatsAppIcon />
                                    )}
                                  </button>



                                  {/* PDF button → SelectMenureport */}
                                  <button
                                    className="p-2 flex items-center justify-center"
                                   onClick={() => {
  setSelectedMobile(item.number || null);
  setSelectedAgencyId(item.contactId || null); 
  setIsSelectMenuReport(true);
}}
                                  >
                                    <img
                                      src={toAbsoluteUrl("/media/icons/PDFIcon.png")}
                                      className="w-6 h-6 object-contain"
                                      alt="PDF Icon"
                                    />
                                  </button>

                                  {/* Expand toggle */}
                                  <button onClick={() => toggleItems(index)} className="text-blue-600 hover:text-gray-600 transition-transform">
                                    <motion.svg
                                      className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                      animate={{ rotate: expandedItems[index] ? 180 : 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </motion.svg>
                                  </button>
                                </div>
                              </div>

                              {/* Expandable sub-items */}
                              <AnimatePresence>
                                {expandedItems[index] && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden mt-7"
                                  >
                                    <div className="grid grid-cols-7 gap-4 bg-gray-50 px-5 py-3 border-[#ffffff]">
                                      <div className="text-sm font-semibold text-gray-700">#</div>
                                      <div className="text-sm font-semibold text-gray-700 col-span-2">Menu Item Name</div>
                                      <div className="flex flex-col items-center justify-start">
                                        <span className="text-sm font-semibold text-gray-700">Quantity</span>
                                        <div className="grid grid-cols-2 gap-4 mt-1 text-xs text-gray-600"><span>Counter</span><span>Helper</span></div>
                                      </div>
                                      <div className="flex flex-col items-center">
                                        <span className="text-sm font-semibold text-gray-700">Price</span>
                                        <div className="grid grid-cols-2 gap-4 mt-1 text-xs text-gray-600"><span>Counter</span><span>Helper</span></div>
                                      </div>
                                      <div className="text-sm font-semibold text-gray-700 flex justify-center">Pax</div>
                                      <div className="text-sm font-semibold text-gray-700 flex justify-center">Notes</div>
                                    </div>
                                    <div style={{ maxHeight: item.allocationItems?.length > 3 ? "150px" : "auto", overflowY: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }} className="scroll-hidden">
                                      {item.allocationItems?.map((allocItem, allocIndex) => (
                                        <motion.div
                                          key={allocIndex}
                                          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                          transition={{ delay: allocIndex * 0.05 }}
                                          className="grid grid-cols-7 gap-4 px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                          <div className="text-sm text-gray-700">{allocIndex + 1}</div>
                                          <div className="text-sm font-medium text-gray-900 col-span-2">{allocItem.itemName || "N/A"}</div>
                                          <div className="flex justify-center space-x-2 gap-9 text-gray-700"><span>{allocItem.counterQty || 0}</span><span>{allocItem.helperQty || 0}</span></div>
                                          <div className="flex justify-center space-x-2 gap-9 text-gray-700"><span>{allocItem.counterPrice || 0}</span><span>{allocItem.helperPrice || 0}</span></div>
                                          <div className="text-sm text-gray-700 flex justify-center">{allocItem.pax || 0}</div>
                                          <div className="text-sm text-gray-700 flex justify-center">{allocItem.notes || "N/A"}</div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}


                                <AnimatePresence>
  {successMessage && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] bg-green-600 text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium"
    >
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      {successMessage}
    </motion.div>
  )}
</AnimatePresence>
                              </AnimatePresence>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
                    {showLangSelect && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
    <div className="bg-white rounded-xl shadow-xl p-6 w-[300px]">
      <h3 className="text-lg font-semibold mb-4 text-center">
        Select Language
      </h3>

      <div className="flex flex-col gap-3">
        <button
          onClick={() => handleLangSelect(0)}
          className="px-4 py-2 text-gray-800 bg-blue-50 border-2 border-primary hover:bg-blue-200 rounded-lg"
        >
          English
        </button>

        <button
          onClick={() => handleLangSelect(1)}
          className="px-4 py-2 text-gray-800 bg-blue-50 border-2 border-primary hover:bg-blue-200 rounded-lg"
        >
          Hindi
        </button>

        <button
          onClick={() => handleLangSelect(2)}
          className="px-4 py-2 text-gray-800 bg-blue-50 border-2 border-primary hover:bg-blue-200 rounded-lg"
        >
          Gujarati
        </button>
      </div>

      <button
        onClick={() => setShowLangSelect(false)}
        className="mt-4 text-sm text-gray-500 w-full"
      >
        Cancel
      </button>
    </div>
  </div>
)}

          {/* ── WhatsApp number entry modal ── */}
          <WhatsAppModal
            isOpen={showWhatsAppModal}
            onClose={() => setShowWhatsAppModal(false)}
            onSend={handleWhatsAppSend}
          />

          {/* PDF button → SelectMenureport */}
          <SelectMenureport
            isSelectMenureport={isSelectMenureport}
            setIsSelectMenuReport={setIsSelectMenuReport}
            onConfirm={() => setIsSelectMenuReport(false)}
            setEventFunctionId={eventFunctionId}
            mode={mode}
            ischef={true}
            mobileNumber={selectedMobile}
            preSelectedAgencyId={selectedAgencyId}
          />
        </div>
      )}
    </AnimatePresence>
  );
}