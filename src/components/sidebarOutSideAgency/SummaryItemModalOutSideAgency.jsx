import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import {
  GetOutsideSummary,
  AddExclusiveReport,
  GetSelectedItemsForReportFilter,
  GetAllRawMaterialAllocationCategory,
} from "@/services/apiServices";
import SelectMenureport from "../../partials/modals/menu-report/SelectMenureport";
import { FormattedMessage } from "react-intl";
import { WhatsAppPdf } from "../../services/apiServices";


const WhatsAppIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
    <path d="M20.52 3.48A11.92 11.92 0 0 0 12.04 0C5.44.03.16 5.32.16 11.93c0 2.1.55 4.14 1.6 5.95L0 24l6.29-1.73a11.9 11.9 0 0 0 5.75 1.48h.01c6.59 0 11.86-5.28 11.89-11.88a11.87 11.87 0 0 0-3.42-8.39ZM12.05 21.2h-.01a9.27 9.27 0 0 1-4.73-1.29l-.34-.2-3.73 1.03 1-3.64-.22-.37A9.25 9.25 0 0 1 2.78 11.9c0-5.11 4.16-9.28 9.29-9.3 2.48 0 4.81.97 6.56 2.72a9.26 9.26 0 0 1 2.72 6.56c-.02 5.12-4.18 9.3-9.3 9.31Zm5.32-6.93c-.29-.15-1.7-.84-1.96-.94-.26-.09-.45-.15-.65.15-.2.29-.74.94-.91 1.13-.17.19-.34.21-.63.08-.29-.14-1.2-.44-2.29-1.41-.85-.76-1.43-1.7-1.6-1.98-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.09-.19.05-.36-.02-.51-.07-.15-.65-1.57-.89-2.15-.24-.58-.48-.5-.65-.5l-.56-.01c-.19 0-.5.07-.76.36-.26.29-.99.97-.99 2.36s1.02 2.74 1.16 2.93c.14.19 2 3.06 4.85 4.29.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.11.55-.08 1.7-.7 1.94-1.37.24-.68.24-1.25.17-1.37-.07-.12-.26-.19-.55-.34Z" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// ── Language Select Modal ─────────────────────────────────────────────────────
const LangSelectModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;
  const langs = [
    { label: "English", value: 0 },
    { label: "Hindi", value: 1 },
    { label: "Gujarati", value: 2 },
  ];
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[300px]">
        <h3 className="text-lg font-semibold mb-4 text-center">Select Language</h3>
        <div className="flex flex-col gap-3">
          {langs.map((lang) => (
            <button
              key={lang.value}
              onClick={() => onSelect(lang.value)}
              className="px-4 py-2 text-gray-800 bg-blue-50 border-2 border-primary hover:bg-blue-200 rounded-lg font-medium transition"
            >
              {lang.label}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-4 text-sm text-gray-500 w-full hover:text-gray-700 transition">
          Cancel
        </button>
      </div>
    </div>,
    document.body
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

export default function SummaryItemModalOutsideAgency({
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
  const [isSelectMenureport, setIsSelectMenuReport] = useState(false);
  const isShowingAllFunctions = eventFunctionId === -1;
  const [selectedMobile, setSelectedMobile] = useState(null);
  const mode = "allocation";

  // ── WhatsApp + PDF state ──────────────────────────────────────────────────
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingRowIndex, setGeneratingRowIndex] = useState(null);
  const [generatingType, setGeneratingType] = useState(null); // "whatsapp" | "pdf"
  const [showLangSelect, setShowLangSelect] = useState(false);
  const [selectedItemForLang, setSelectedItemForLang] = useState(null);
  const [selectedIndexForLang, setSelectedIndexForLang] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

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

  const displayData = apiData
    ? isShowingAllFunctions
      ? apiData.flatMap((functionData) =>
          functionData.agencyResponse.map((agency) => ({
            ...agency,
            functionName: functionData.eventFunction?.function?.nameEnglish || "N/A",
            functionDateTime: functionData.eventFunction?.functionStartDateTime || "N/A",
            venue: functionData.eventFunction?.function_venue || "N/A",
          }))
        )
      : apiData[0]?.agencyResponse || []
    : [];

  const singleFunctionInfo =
    !isShowingAllFunctions && apiData?.[0]
      ? {
          functionName: apiData[0].eventFunction?.function?.nameEnglish || "N/A",
          functionDateTime: apiData[0].eventFunction?.functionStartDateTime || "N/A",
          venue: apiData[0].eventFunction?.function_venue || "N/A",
        }
      : null;

  const toggleItems = (index) => {
    setExpandedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const buildFormData = async (item, lang) => {
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
  formData.append("adminTemplateModuleId", 10);
  formData.append("type", "outside");
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
  formData.append("isContactNoVisible", 1); 
  formData.append("isAddMenu", 0);
  formData.append("isNotes", 0);
  formData.append("isAdvancePayment",0);
  formData.append("withOutBg",0);
 formData.append("withVendor",0);
  formData.append("showAddOnLabel",0);
  formData.append("showLastPage",0);
  formData.append("isSignatureVisible" ,0);
  formData.append("isDoc", 0);
  formData.append("isExtraCharges", 0);
  formData.append("isExcel", 0);
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
  formData.append("is5Column" , 0);
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
  // managerIds[] intentionally omitted (no manager selector in this modal)

  formData.append("catFontId", -1);
  formData.append("itemFontId", -1);
  formData.append("sloganFontId", -1);
  formData.append("catFontSize", -1);
  formData.append("itemFontSize", -1);
  formData.append("sloganFontSize", -1);

  return formData;
};

  // ── WhatsApp: open lang modal ─────────────────────────────────────────────
  const handleWhatsAppClick = (item, index) => {
    setSelectedItemForLang(item);
    setSelectedIndexForLang(index);
    setGeneratingType("whatsapp");
    setShowLangSelect(true);
  };

  // ── PDF: open lang modal ──────────────────────────────────────────────────
  const handlePdfClick = (item, index) => {
    setSelectedItemForLang(item);
    setSelectedIndexForLang(index);
    setGeneratingType("pdf");
    setShowLangSelect(true);
  };

  // ── Lang selected: generate + act ────────────────────────────────────────
  const handleLangSelect = async (lang) => {
  setShowLangSelect(false);
  const item = selectedItemForLang;
  const index = selectedIndexForLang;
  const actionType = generatingType;


const notifyWhatsApp = async (url) => {
  try {
    const { companyMobileNo, companyName } = getCompanyAuthInfo();
    const phoneRaw = item.number || item.mobile || item.contactNumber || "";
   const wres = await WhatsAppPdf({
      companyMobileNo,
      companyName,
      mobileNo: phoneRaw.replace(/\D/g, ""),
      moduleName: "Order Report",
      partyName: item.contactName || "",
      url,
      userId: Number(userId) || 0,
    });
    if(wres?.data?.success) {
        setSuccessMessage("Report sent successfully!");
        } else {
          setSuccessMessage("Report not sent!");
        }
  } catch (err) {
    console.error("WhatsAppPdf notify failed:", err);
  }
};

  // if (item._cachedPdfUrl) {
  //   if (actionType === "whatsapp") {
  //     await notifyWhatsApp(item._cachedPdfUrl);
  //     const phone = item.number || item.mobile || item.contactNumber || "";
  //     const greeting = item.contactName || "there";
  //     const message = `Hi ${greeting},\nPlease find the attached PDF.\n\n${item._cachedPdfUrl}`;
  //     window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
  //   } else {
  //     window.open(item._cachedPdfUrl, "_blank");
  //   }
  //   return;
  // }

  setGeneratingPdf(true);
  setGeneratingRowIndex(index);

  try {
    const formData = await buildFormData(item, lang);
    const data = await AddExclusiveReport(formData);

    if (data?.data?.success) {
      item._cachedPdfUrl = data?.data?.report_path;

      if (actionType === "whatsapp") {
        await notifyWhatsApp(data?.data?.report_path);
        // const phone = item.number || item.mobile || item.contactNumber || "";
        // const greeting = item.contactName || "there";
        // const message = `Hi ${greeting},\nPlease find the attached PDF.\n\n${data?.data?.report_path}`;
        // window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`, "_blank");
      } else {
        window.open(data?.data?.report_path, "_blank");
      }
    } else {
      errorMsgPopup(data?.data?.msg || "Failed to generate report");
    }
  } catch (err) {
  console.error(err);
  setSuccessMessage(err?.response?.data?.msg || "Something went wrong");
} finally {
    setGeneratingPdf(false);
    setGeneratingRowIndex(null);
    setGeneratingType(null);
  }
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
              className="pointer-events-auto absolute top-6 bottom-6 right-6 w-[1200px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
              initial={{ x: "110%" }} animate={{ x: 0 }} exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              {/* Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-800">
  <FormattedMessage
    id="COMMON.SUMMARY_ITEM_OUTSIDE_AGENCY"
    defaultMessage="Summary Item - Outside Agency"
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

              {/* Content */}
              <div className="overflow-y-auto flex-1">
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
                        <div className="flex items-center gap-6 mb-6">
                          <div className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold">
                            {singleFunctionInfo.functionName}
                          </div>
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-600 mb-1">  <FormattedMessage
    id="COMMON.DATE_AND_TIME"
    defaultMessage="Date and Time"
  /></div>
                            <div className="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                              {singleFunctionInfo.functionDateTime}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-600 mb-1">  <FormattedMessage
    id="COMMON.VENUE"
    defaultMessage="Venue"
  /></div>
                            <div className="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                              {singleFunctionInfo.venue}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                        {/* Table Header */}
                        <div className={`grid ${isShowingAllFunctions ? "grid-cols-7" : "grid-cols-6"} gap-4 mb-3 pb-3 border-b border-gray-300`}>
                          <div className="text-sm font-semibold text-gray-700">#</div>
                          {isShowingAllFunctions && <div className="text-sm font-semibold text-gray-700">Function</div>}
                       <div className="text-sm font-semibold text-gray-700">
  <FormattedMessage
    id="COMMON.SR_NO_SYMBOL"
    defaultMessage="#"
  />
</div>

{isShowingAllFunctions && (
  <div className="text-sm font-semibold text-gray-700">
    <FormattedMessage
      id="COMMON.FUNCTION"
      defaultMessage="Function"
    />
  </div>
)}

<div className="text-sm font-semibold text-gray-700">
  <FormattedMessage
    id="COMMON.CONTACT_NAME"
    defaultMessage="Contact Name"
  />
</div>

<div className="text-sm font-semibold text-gray-700 text-center">
  <FormattedMessage
    id="COMMON.TOTAL_PERSON"
    defaultMessage="Total Person"
  />
</div>

<div className="text-sm font-semibold text-gray-700 text-center">
  <FormattedMessage
    id="COMMON.TOTAL_QUANTITY"
    defaultMessage="Total Quantity"
  />
</div>

<div className="text-sm font-semibold text-gray-700 text-center">
  <FormattedMessage
    id="COMMON.TOTAL_PRICE"
    defaultMessage="Total Price"
  />
</div>

<div className="text-sm font-semibold text-gray-700 text-center">
  <FormattedMessage
    id="COMMON.ACTIONS"
    defaultMessage="Actions"
  />
</div>
                        </div>

                        {displayData.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">No data available</div>
                        ) : (
                          displayData.map((agency, index) => (
                            <div key={index}>
                              <div className={`grid ${isShowingAllFunctions ? "grid-cols-7" : "grid-cols-6"} gap-4 items-center bg-white p-4 rounded-lg shadow-sm mb-3`}>
                                <div className="text-sm text-gray-800 font-medium">{index + 1}</div>
                                {isShowingAllFunctions && (
                                  <div className="text-sm font-medium text-gray-900">{agency.functionName}</div>
                                )}
                                <div className="flex flex-col">
                                  <div className="text-sm font-semibold text-gray-900">{agency.contactName || "N/A"}</div>
                                  <div className="text-xs text-gray-500">{agency.number || "N/A"}</div>
                                </div>
                                <div className="text-sm text-gray-800 text-center font-medium">{agency.totalPax || 0}</div>
                                <div className="text-sm text-gray-800 text-center font-medium">{agency.totalQty || 0}</div>
                                <div className="text-sm font-semibold text-gray-900 text-center">₹{agency.totalPrice || 0}</div>

                                {/* Action Buttons */}
                                <div className="flex justify-center gap-2">
                                  {/* WhatsApp Button */}
                                  <button
                                    onClick={() => handleWhatsAppClick(agency, index)}
                                    disabled={generatingPdf}
                                    className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Send via WhatsApp"
                                  >
                                    {generatingPdf && generatingRowIndex === index && generatingType === "whatsapp" ? (
                                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                      </svg>
                                    ) : (
                                      <WhatsAppIcon />
                                    )}
                                  </button>

                                  {/* PDF Button */}
                                  <button
                                    onClick={() => handlePdfClick(agency, index)}
                                    disabled={generatingPdf}
                                    className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Download PDF"
                                  >
                                    {generatingPdf && generatingRowIndex === index && generatingType === "pdf" ? (
                                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                      </svg>
                                    ) : (
                                      <DownloadIcon />
                                    )}
                                  </button>

                                  {/* Expand Button */}
                                  <button
                                    onClick={() => toggleItems(index)}
                                    className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                                    title="Toggle Items"
                                  >
                                    <motion.svg
                                      className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                      animate={{ rotate: expandedItems[index] ? 180 : 0 }}
                                      transition={{ duration: 0.3 }}
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </motion.svg>
                                  </button>
                                </div>
                              </div>

                              {/* Expandable Items */}
                              <AnimatePresence>
                                {expandedItems[index] && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 overflow-hidden"
                                  >
                                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                      <div className="grid grid-cols-8 gap-4 bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b border-gray-200">
                                        <div className="text-sm font-semibold text-gray-700">#</div>
                                        <div className="text-sm font-semibold text-gray-700 col-span-2">Menu Item Name</div>
                                        <div className="text-sm font-semibold text-gray-700 text-center">Person</div>
                                        <div className="text-sm font-semibold text-gray-700 text-center">Quantity</div>
                                        <div className="text-sm font-semibold text-gray-700 text-center">Unit</div>
                                        <div className="text-sm font-semibold text-gray-700 text-center">Price</div>
                                        <div className="text-sm font-semibold text-gray-700 text-center">Notes</div>
                                      </div>
                                      <div className="max-h-[250px] overflow-y-auto">
                                        {agency.allocationItems?.length > 0 ? (
                                          agency.allocationItems.map((item, itemIndex) => (
                                            <motion.div
                                              key={item.itemId + "-" + itemIndex}
                                              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                              transition={{ delay: itemIndex * 0.05 }}
                                              className="grid grid-cols-8 gap-4 px-5 py-4 border-b border-gray-100 hover:bg-blue-50 transition-colors"
                                            >
                                              <div className="text-sm text-gray-700 font-medium">{itemIndex + 1}</div>
                                              <div className="text-sm font-medium text-gray-900 col-span-2">{item.itemName || "N/A"}</div>
                                              <div className="text-sm text-gray-700 text-center">{item.pax || 0}</div>
                                              <div className="text-sm text-gray-700 text-center">{item.qty || 0}</div>
                                              <div className="text-sm text-gray-700 text-center">{item.unitName || "N/A"}</div>
                                              <div className="text-sm text-gray-700 text-center font-semibold">₹{item.price || 0}</div>
                                              <div className="text-sm text-gray-500 text-center">{item.notes || item.remarks || "-"}</div>
                                            </motion.div>
                                          ))
                                        ) : (
                                          <div className="px-5 py-8 text-center text-gray-500">No items found</div>
                                        )}
                                      </div>
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

              <SelectMenureport
                isSelectMenureport={isSelectMenureport}
                setIsSelectMenuReport={setIsSelectMenuReport}
                onConfirm={() => setIsSelectMenuReport(false)}
                setEventFunctionId={eventFunctionId}
                mode={mode}
                isOutside={true}
                mobileNumber={selectedMobile}
              />
            </motion.div>
          </div>

          {/* ── Language Select Modal ── */}
          <LangSelectModal
            isOpen={showLangSelect}
            onClose={() => setShowLangSelect(false)}
            onSelect={handleLangSelect}
          />
        </div>
      )}
    </AnimatePresence>
  );
}