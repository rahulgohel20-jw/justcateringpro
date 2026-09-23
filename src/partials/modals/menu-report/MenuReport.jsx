import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { PDFDocument } from "pdf-lib";
import { getLangConfig } from "@/utils/langConfig";
import { CustomModal } from "../../../components/custom-modal/CustomModal";
import NamePlateReport from "./NamePlateReport";
import {
  AddExclusiveReport,
  GetReportConfiguration,
  GetAgenciesForReportFilter,
  GetSelectedItemsForReportFilter,
  GetAllRawMaterialAllocationCategory,
  Fetchmanager,
  GetRawMaterialcategory,
  GetActiveFonts,
  CustomPackagePdf,
    getallmenuselecteditem,
    GettemplatebyuserId,                    
  GetAllCustomThemeByUserIdAndModuleId, 
} from "@/services/apiServices";
import { successMsgPopup, errorMsgPopup } from "../../../underConstruction";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "react-datepicker/dist/react-datepicker.css";
import { Select } from "antd";
import { TeamOutlined, AppstoreOutlined } from "@ant-design/icons";
import { useModuleAccess } from "../../../hooks/useModuleAccess";  
import { WhatsAppPdf } from "../../../services/apiServices";
import dayjs from "dayjs";

const WhatsAppModal = ({ isOpen, onClose, onSend, mobileNumber, mode = "api" }) => {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const handleSend = () => {
    const cleaned = mobile.replace(/\D/g, "");
    if (!cleaned || cleaned.length < 10) {
      setError("Please enter a valid mobile number (min 10 digits).");
      return;
    }
    const fullNumber = `+91${cleaned}`;
    setError("");
    onSend(fullNumber, name.trim());
    setName("");
    setMobile("");
  };



  const handleClose = () => {
    setName("");
    setMobile("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-green-600 px-6 py-4 flex items-center gap-3">
          <svg
            className="w-6 h-6 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <h2 className="text-white font-semibold text-lg">
            {mode === "web" ? "Open in WhatsApp Web" : "Share via WhatsApp"}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-gray-600 text-sm">
            Enter the recipient's WhatsApp number to share the report PDF.
          </p>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="e.g. Rahul"
              className="w-full border-2 border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide">
              Mobile Number
            </label>

            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-green-500 transition">
              {/* Fixed +91 */}
              <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-sm border-r border-gray-200">
                +91
              </span>

              <input
                type="tel"
                value={mobile}
                maxLength={10}
                onChange={(e) => {
                  // Allow only digits & max 10 digits
                  const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                  setMobile(value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="9876543210"
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-white"
                autoFocus
              />
            </div>

            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

            <p className="text-gray-400 text-xs mt-1">
              Enter 10 digit mobile number
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3 justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-5 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c..." />
            </svg>
            {mode === "web" ? "Open WhatsApp" : "Send"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const formatWaDate = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  const parsed = dayjs(dateTimeStr, ["DD/MM/YYYY hh:mm A", "DD/MM/YYYY"]);
  return parsed.isValid() ? parsed.format("DD.MM.YYYY") : "";
};

const formatWaTime = (dateTimeStr) => {
  if (!dateTimeStr) return "";
  const parsed = dayjs(dateTimeStr, ["DD/MM/YYYY hh:mm A", "DD/MM/YYYY"]);
  return parsed.isValid() ? parsed.format("hh:mm A") : "";
};

const buildWaMessage = ({ greeting, functionName, functionDateTime, venueName, pdfUrl }) => {
  const dateStr = formatWaDate(functionDateTime);
  const timeStr = formatWaTime(functionDateTime);
  const lines = [
    `TO ${(greeting || "THERE").toUpperCase()},`,
    dateStr ? ` Date : ${dateStr} ` : null,
    venueName ? ` At Venue : ${venueName}` : null,
    functionName
      ? `${functionName.toUpperCase()}${timeStr ? ` at ${timeStr}` : ""} Ready,`
      : null,
    "",
    pdfUrl,
  ].filter((line) => line !== null);
  return lines.join("\n");
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

const mergePdfs = async (urls) => {
  const merged = await PDFDocument.create();

  for (const url of urls) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch PDF: ${url}`);
    const bytes = await res.arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }

  const out = await merged.save();
  return URL.createObjectURL(new Blob([out], { type: "application/pdf" }));
};


  const SHORT_MENU_MODULE_NAME = "Back Office Theme";
const SHORT_MENU_TEMPLATE_NAME = "Short Menu Report";

const isFlagOn = (v) => v === true || v === 1 || v === "1" || v === "true";   // NEW

const buildOptionsFromConfig = (config, { isDefaultHalfPaxOn, canAccessStock }) => ({
  categorySlogan: config.isCategorySlogan === 0,
  categoryInstruction: config.isCategoryInstruction === 1,
  categoryImage: config.isCategoryImage === 0,
  itemSlogan: config.isItemSlogan === 0,
  itemInstruction: config.isItemInstruction === 1,
  CompanyInfo: config.isCompanyDetails === 0,
  companyLogo: config.isCompanyLogo === 1,
  itemImage: config.isItemImage === 0,
  isCombo: config.isCombo === 0,
  partyDetails: config.isPartyDetails === 1,
  isWithQty: config.isWithQty === 1,
  isExtraCharges: config.isExtraCharges === 1,
  isExcel: config.isExcel === 0,
  isDoc: config.isDoc === 0,
  isTermsCond: config.isTermsCond === 0,
  size1: { label: config.size1, enabled: Boolean(config.size1 === 1) },
  size2: { label: config.size2, enabled: Boolean(config.size2 === 0) },
  size3: { label: config.size3, enabled: Boolean(config.size3 === 0) },
  isWithPrice: config.isWithPrice === 0,
  isHalfPax: isDefaultHalfPaxOn ? true : config.isHalfPax === 1,
  is3Column: config.is3Column === 0,
  isFunctionNextPage: config.isFunctionNextPage === 1,
  isAddDecoration: config.isAddDecoration === 0,
  isOnePage: config.isOnePage === 0,
  isShowEventRemarks: config.isShowEventRemarks === 0,
  showAdditional: config.showAdditional === 0,
  isAgencyNextPage: config.isAgencyNextPage === 1,
  storeIssueWise: canAccessStock ? config.storeIssueWise === 0 : false,
  isAddStoreIssue: canAccessStock ? config.isAddStoreIssue === 0 : false,
  is5Column: config.is5Column === 0,
  isContactNoVisible: config.isContactNoVisible === 0,
  isSignatureVisible: config.isSignatureVisible === 0,
  isAddMenu: config.isAddMenu === 1,
  isAdvancePayment: config.isAdvancePayment === 1,
  showAddOnLabel: config.showAddOnLabel === 0,
  withOutBg: config.withOutBg === 0,
  withVendor: config.withVendor === 0,
  isAllItemTogether: config.isAllItemTogether === 0,
  isShowFunctionImg:config.isShowFunctionImg === 0,
  isNotes: config.isNotes === 0,
  showLastPage: false,
});

const getVisibleOptionKeys = (config, { isDefaultHalfPaxOn, canAccessStock }) =>
  Object.entries({
    CompanyInfo: config.isCompanyDetails,
    categorySlogan: config.isCategorySlogan,
    categoryInstruction: config.isCategoryInstruction,
    categoryImage: config.isCategoryImage,
    itemSlogan: config.isItemSlogan,
    itemInstruction: config.isItemInstruction,
    companyLogo: config.isCompanyLogo,
    itemImage: config.isItemImage,
    isCombo: config.isCombo,
    partyDetails: config.isPartyDetails,
    isWithQty: config.isWithQty,
    size1: !!config.size1,
    size2: !!config.size2,
    size3: !!config.size3,
    isWithPrice: config.isWithPrice,
    isExtraCharges: config.isExtraCharges,
    isExcel: config.isExcel,
    isTermsCond: config.isTermsCond,
    isDoc: config.isDoc,
    isHalfPax: isDefaultHalfPaxOn ? true : config.isHalfPax,
    is3Column: config.is3Column,
    isFunctionNextPage: config.isFunctionNextPage,
    isAddDecoration: config.isAddDecoration,
    isOnePage: config.isOnePage,
    isShowEventRemarks: config.isShowEventRemarks,
    showAdditional: config.showAdditional,
    isAgencyNextPage: config.isAgencyNextPage,
    storeIssueWise: canAccessStock ? config.storeIssueWise : false,
    isAddStoreIssue: canAccessStock ? config.isAddStoreIssue : false,
    is5Column: config.is5Column,
    isContactNoVisible: config.isContactNoVisible,
    isSignatureVisible: config.isSignatureVisible,
    isAddMenu: config.isAddMenu,
    isAdvancePayment: config.isAdvancePayment,
    isNotes: config.isNotes,
    showAddOnLabel: config.showAddOnLabel,
    withOutBg: config.withOutBg,
    withVendor: config.withVendor,
    isAllItemTogether: config.isAllItemTogether,
    isShowFunctionImg: config.isShowFunctionImg,
    isAddShortMenu: isFlagOn(config.isAddShortMenu),  
  })
    .filter(([, value]) => value)
    .map(([key]) => key);

// Pure version of your toggleOne logic so both option sets can share it
const applyToggle = (prev, key) => {
  if (key === "size1")
    return { ...prev, size1: { ...prev.size1, enabled: true }, size2: { ...prev.size2, enabled: false } };
  if (key === "size2")
    return { ...prev, size1: { ...prev.size1, enabled: false }, size2: { ...prev.size2, enabled: true } };
  if (key === "size3")
    return {
      ...prev,
      size1: { ...prev.size1, enabled: false },
      size2: { ...prev.size2, enabled: false },
      size3: { ...prev.size3, enabled: true },
    };
  if (key === "is3Column") {
    const next = !prev.is3Column;
    return { ...prev, is3Column: next, is5Column: next ? false : prev.is5Column };
  }
  if (key === "is5Column") {
    const next = !prev.is5Column;
    return { ...prev, is5Column: next, is3Column: next ? false : prev.is3Column };
  }
  return { ...prev, [key]: !prev[key] };
};

const MenuReport = ({
  isModalOpen,
  setIsModalOpen,
  eventId,
  eventFunctionId,
  moduleId,
  mappingId,
  selectedTemplateId,
  eventName,
  selectedTemplateName,
  isNamePlateTheme,
  startDate: adminStartDate,
  endDate: adminEndDate,
  agencyType,
  isAdminModuleReport = false,
  selectedParty,
  isManager,
  exclusive,
  mobileNumber,
  catFontIds,
  catFontSizes,
  itemFontIds,
  itemFontSizes,
  sloganFontIds,
  sloganFontSizes,
  preSelectedAgencyId,
    customPackageId,                
  customPackageTemplateMasterId,
   functionName,        
  functionDateTime,   
  venueName,       
}) => {
  const pdfPlugin = defaultLayoutPlugin();
  const userId = localStorage.getItem("userId");
  const defaultHalfPaxOnUserIds = ["298", "299"];
const isDefaultHalfPaxOn = defaultHalfPaxOnUserIds.includes(String(userId)); 
  const [visibleOptions, setVisibleOptions] = useState([]);
  const [reportType, setReportType] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [loading, setLoading] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [options, setOptions] = useState({});
  const [showNamePlateUI, setShowNamePlateUI] = useState(false);
  const [isDropdownStatus, setisDropdownStatus] = useState();
  const [showAgencyDropdown, setShowAgencyDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [isDateStatus, setisDateStatus] = useState();
  const [agencies, setAgencies] = useState([]);
  const [manager, setManager] = useState([]);
  const [category, setCategory] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState([]);
  const [selectedManager, setSelectedManager] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState([]);
  const isPrintingRef = useRef(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsAppSendMode, setWhatsAppSendMode] = useState("api");
  const [fonts, setFonts] = useState([]);
  const [fontsLoading, setFontsLoading] = useState(false);
  const [catFontId, setcatFontId] = useState(-1);
  const [itemFontId, setItemFontId] = useState(-1);
  const [sloganFontId, setSloganFontId] = useState(-1);
const [catFontSize, setcatFontSize] = useState(-1);   
const [itemFontSize, setItemFontSize] = useState(-1); 
const [sloganFontSize, setSloganFontSize] = useState(-1); 
const [mappingType, setMappingType] = useState(null);
const [moduleType, setModuleType] = useState(null);
const { hasModuleAccess } = useModuleAccess();          
  const canAccessStock = hasModuleAccess("Stock"); 
  const [autoAgencyContact, setAutoAgencyContact] = useState(null);

const [shortMenuTemplate, setShortMenuTemplate] = useState(null); // { id, name, type }
const [shortMenuOptions, setShortMenuOptions] = useState({});
const [shortMenuVisibleOptions, setShortMenuVisibleOptions] = useState([]);
const [shortMenuHasItems, setShortMenuHasItems] = useState(false);
const [shortMenuItems, setShortMenuItems] = useState([]);
const [shortMenuSelectedItems, setShortMenuSelectedItems] = useState([]);
const [mainUrl, setMainUrl] = useState(null);
const [shortMenuUrl, setShortMenuUrl] = useState(null);
const addShortMenu =
  visibleOptions.includes("isAddShortMenu") && !!options.isAddShortMenu;



const langConfig = getLangConfig();
const languageOptions = [
  { value: "english", label: "English" },
  { value: "hindi", label: "Hindi" },
  { value: "regional", label: langConfig.script }, 
];
  const optionDisplayLabels = {
    isExtraCharges: "Is Extra Charges",
    isExcel: "Is Excel",
    isWithPrice: "Is With Price",
    isWithQty: "With Quantity",
    isTermsCond: "Terms & Condition",
    isContactNoVisible: "Contact No Visible",
    isAddMenu : "is Add Menu",
    isAdvancePayment : "is Advance Payment",
    isNotes : "is Notes",
    showLastPage :"show Last Page",
    showAddOnLabel : "Show Add On Label",
    withOutBg : "With Out Background",
    withVendor : "With Vendor",
    isAllItemTogether :"All Item Together",
    isShowFunctionImg: "Show Function Img",
     isAddShortMenu: "Add Short Menu", 
  };

  const fetchFonts = async () => {
    setFontsLoading(true);
    try {
      const response = await GetActiveFonts();
      setFonts(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching fonts:", error);
    } finally {
      setFontsLoading(false);
    }
  };

 useEffect(() => {
  if (isModalOpen) {
    fetchFonts();
    setcatFontId(catFontIds ?? -1);
    setItemFontId(itemFontIds ?? -1);
    setSloganFontId(sloganFontIds ?? -1);
    // Convert to number; use -1 if null/undefined/invalid
    setcatFontSize(catFontSizes != null && catFontSizes !== -1 ? Number(catFontSizes) : -1);
    setItemFontSize(itemFontSizes != null && itemFontSizes !== -1 ? Number(itemFontSizes) : -1);
    setSloganFontSize(sloganFontSizes != null && sloganFontSizes !== -1 ? Number(sloganFontSizes) : -1);
  }
}, [isModalOpen, catFontIds, catFontSizes, itemFontIds, itemFontSizes, sloganFontIds, sloganFontSizes]);

  useEffect(() => {
    fetchFonts();
  }, [isModalOpen, exclusive]);

  useEffect(() => {
    if (!pdfUrl) return;

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
            newTab.onload = () => {
              setTimeout(() => {
                newTab.focus();
                newTab.print();
              }, 1000);
            };
          }
          // For Edge: release guard when focus returns to this window
          const onFocusBack = () => {
            setTimeout(() => {
              isPrintingRef.current = false;
            }, 500);
            window.removeEventListener("focus", onFocusBack);
          };
          window.addEventListener("focus", onFocusBack);
          return;
        }

        const iframe = document.createElement("iframe");
        iframe.style.cssText =
          "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;";
        iframe.src = blobUrl;
        document.body.appendChild(iframe);

        iframe.onload = () => {
          setTimeout(() => {
            try {
              iframe.contentWindow.focus();
              iframe.contentWindow.print();
            } catch {
              window.open(blobUrl, "_blank");
            }
          }, 800);

          // ── KEY FIX: listen for focus returning to the main window ───────
          // This fires every time the print dialog closes (including after
          // the user changes odd/even pages and re-opens the dialog).
          // We re-arm the listener each time so it works for multiple
          // interactions without ever releasing the guard early.
          const armFocusGuard = () => {
            const onWindowFocus = () => {
              // User dismissed the print dialog — keep guard on briefly
              // then re-arm in case they open print again
              setTimeout(() => {
                // Only release if print was not re-triggered
                if (!isPrintingRef.current) return;
                isPrintingRef.current = false;
              }, 800);
              window.removeEventListener("focus", onWindowFocus);
            };
            window.addEventListener("focus", onWindowFocus);
          };

          // Also use beforeprint / afterprint for better browser support
          const onBeforePrint = () => {
            isPrintingRef.current = true;
          };
          const onAfterPrint = () => {
            // Small delay so the modal doesn't close the instant dialog closes
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
          armFocusGuard();
        };

        iframe.onerror = () => {
          window.open(pdfUrl, "_blank");
          isPrintingRef.current = false;
        };
      } catch {
        window.open(pdfUrl, "_blank");
        isPrintingRef.current = false;
      }
    };

    window.print = interceptedPrint;

    return () => {
      window.print = originalPrint;
    };
  }, [pdfUrl]);

  useEffect(() => {
    if (!isModalOpen || !mappingId) return;

    const fetchConfig = async () => {
      try {
        const res = await GetReportConfiguration(mappingId, moduleId);
        const config = res?.data?.data?.[0];
if (!config) {
        // NEW: no configuration found — fall back to all-off defaults
        setReportType(null);
        setMappingType(null);
        setModuleType(null);
        setisDropdownStatus(0);
        setShowAgencyDropdown(false);
        setShowItemDropdown(false);
        setShowCategoryDropdown(false);
        setisDateStatus(0);
        setShowStatusDropdown(false);
        setSelectedStatus([]);
        setOptions({
          categorySlogan: false,
          categoryInstruction: false,
          categoryImage: false,
          itemSlogan: false,
          itemInstruction: false,
          CompanyInfo: false,
          companyLogo: false,
          itemImage: false,
          isCombo: false,
          partyDetails: false,
          isWithQty: false,
          isExtraCharges: false,
          isExcel: false,
          isDoc: false,
          isTermsCond: false,
          size1: { label: null, enabled: false },
          size2: { label: null, enabled: false },
          size3: { label: null, enabled: false },
          isWithPrice: false,
          isHalfPax: false,
          is3Column: false,
          isFunctionNextPage: false,
          isAddDecoration: false,
          isOnePage: false,
          isShowEventRemarks: false,
          showAdditional: false,
          isAgencyNextPage: false,
          storeIssueWise: false,
          isAddStoreIssue:false,
          is5Column:false,
          isContactNoVisible: false,
          isSignatureVisible: false,
          isAddMenu:false,
          isAdvancePayment:false,
          isNotes : false,
          showLastPage: false,
          showAddOnLabel: false,
          withOutBg: false,
          withVendor: false,
          isAllItemTogether: false,
          isShowFunctionImg: false,
        });
        setVisibleOptions([]);
        return;
      }

        setReportType(config.type);
        setMappingType(config.mappingNameEnglish || null);
        setModuleType(config.moduleNameEnglish || null);
       
        
        if (config.isRawMaterialCat === 1) {
          setisDropdownStatus(1);
          setShowCategoryDropdown(true);
          setShowAgencyDropdown(false);
          setShowItemDropdown(false);
        }

      if (isAdminModuleReport) {
  setisDropdownStatus(0);
  setShowAgencyDropdown(false);
  setShowItemDropdown(false);
  setShowCategoryDropdown(false);
} else if (config.isRawMaterialCat === 1) {
  setisDropdownStatus(1);
  setShowCategoryDropdown(true);
  setShowAgencyDropdown(false);
  setShowItemDropdown(false);
} else {
  // Agency dropdown only makes sense when we actually have an agencyType
  // to filter by — it stays independent of Item/Category below.
  const canShowAgency = config.isAgency === 1 && agencyType != null;
  const canShowItem = config.isItem === 1;

  setShowAgencyDropdown(canShowAgency);
  setShowItemDropdown(canShowItem);
  setShowCategoryDropdown(false);
  setisDropdownStatus(canShowAgency || canShowItem ? 1 : 0);
}

if (config.isDate === 1 || config.isStartDate === 1 || config.isEndDate === 1) {
  setisDateStatus(1);
} else {
  setisDateStatus(0);
}if (config.isStatus == 1) {
          setShowStatusDropdown(true);
          setSelectedStatus([0, 1, 2, 3]);
          setShowAgencyDropdown(false);
          setShowItemDropdown(false);
          setShowCategoryDropdown(false);
        } else {
          setShowStatusDropdown(false);
          setSelectedStatus([]);
        }

        setOptions({
          categorySlogan: config.isCategorySlogan === 0,
          categoryInstruction: config.isCategoryInstruction === 1,
          categoryImage: config.isCategoryImage === 0,
          itemSlogan: config.isItemSlogan === 0,
          itemInstruction: config.isItemInstruction === 1,
          CompanyInfo: config.isCompanyDetails === 0,
          companyLogo: config.isCompanyLogo === 1,
          itemImage: config.isItemImage === 0,
          isCombo: config.isCombo === 0,
          partyDetails: config.isPartyDetails === 1,
          isWithQty: config.isWithQty === 1,
          isExtraCharges: config.isExtraCharges === 1,
          isExcel: config.isExcel === 0,
          isDoc: config.isDoc === 0,
          isTermsCond: config.isTermsCond === 0,
          size1: { label: config.size1, enabled: Boolean(config.size1 === 1) },
          size2: { label: config.size2, enabled: Boolean(config.size2 === 0) },
          size3: { label: config.size3, enabled: Boolean(config.size3 === 0) },
          isWithPrice: config.isWithPrice === 0,
         isHalfPax: isDefaultHalfPaxOn ? true : config.isHalfPax === 1,
          is3Column:config.is3Column === 0 ,
          isFunctionNextPage:config.isFunctionNextPage === 1 , 
          isAddDecoration:config.isAddDecoration === 0,
          isOnePage:config.isOnePage === 0 ,
          isShowEventRemarks:config.isShowEventRemarks === 0 , 
          showAdditional:config.showAdditional === 0 ,
          isAgencyNextPage:config.isAgencyNextPage === 1, 
          storeIssueWise: canAccessStock ? config.storeIssueWise === 0 : false,
          isAddStoreIssue:canAccessStock ? config.isAddStoreIssue ===0 : false,
          is5Column:config.is5Column === 0 , 
          isContactNoVisible: config.isContactNoVisible === 0,
          isSignatureVisible : config.isSignatureVisible === 0,
          isAddMenu  : config.isAddMenu === 1,
          isAdvancePayment : config.isAdvancePayment === 1,
          showAddOnLabel : config.showAddOnLabel === 0,
          withOutBg : config.withOutBg === 0,
          withVendor : config.withVendor === 0,
          isAllItemTogether: config.isAllItemTogether === 0,
          isShowFunctionImg :config.isShowFunctionImg === 0,
          isNotes : config.isNotes === 0,
          isAddShortMenu: false,        
  showLastPage:  false,
        });

        setVisibleOptions(
          Object.entries({
            CompanyInfo: config.isCompanyDetails,
            categorySlogan: config.isCategorySlogan,
            categoryInstruction: config.isCategoryInstruction,
            categoryImage: config.isCategoryImage,
            itemSlogan: config.isItemSlogan,
            itemInstruction: config.isItemInstruction,
            companyLogo: config.isCompanyLogo,
            itemImage: config.isItemImage,
            isCombo: config.isCombo,
            partyDetails: config.isPartyDetails,
            isWithQty: config.isWithQty,
            size1: !!config.size1,
            size2: !!config.size2,
            size3: !!config.size3,
            isWithPrice: config.isWithPrice,
            isExtraCharges: config.isExtraCharges,
            isExcel: config.isExcel,
            isTermsCond: config.isTermsCond,
            isDoc: config.isDoc,
             isHalfPax: isDefaultHalfPaxOn ? true : config.isHalfPax, 
            is3Column:config.is3Column,
            isFunctionNextPage :config.isFunctionNextPage ,
            isAddDecoration:config.isAddDecoration, 
            isOnePage:config.isOnePage,
            isShowEventRemarks:config.isShowEventRemarks, 
            showAdditional:config.showAdditional,
            isAgencyNextPage:config.isAgencyNextPage, 
storeIssueWise: canAccessStock ? config.storeIssueWise : false,
isAddStoreIssue : canAccessStock ? config.isAddStoreIssue : false,
is5Column :config.is5Column,
isContactNoVisible: config.isContactNoVisible,     
isSignatureVisible : config.isSignatureVisible ,
isAddMenu : config.isAddMenu, 
isAdvancePayment : config.isAdvancePayment,
isNotes : config.isNotes,
showAddOnLabel : config.showAddOnLabel,
withOutBg : config.withOutBg,
withVendor : config.withVendor,
isAllItemTogether: config.isAllItemTogether,
isShowFunctionImg: config.isShowFunctionImg,
isAddShortMenu: isFlagOn(config.isAddShortMenu),
 })
            .filter(([_, value]) => value)
            .map(([key]) => key),
        );
      } catch (err) {
        console.error("Config fetch error", err);
      }
    };
    fetchConfig();
  }, [isModalOpen, mappingId, moduleId, isAdminModuleReport, agencyType , isDefaultHalfPaxOn]);

  useEffect(() => {
    if (!isModalOpen || isDropdownStatus !== 1 || isAdminModuleReport) return;

    const fetchAgencies = async () => {
      setLoadingFilters(true);
      try {
        const userId = localStorage.getItem("userId");
        const functionIds = Array.isArray(eventFunctionId)
  ? eventFunctionId.filter((id) => id !== -1)
  : eventFunctionId === -1
    ? []
    : [eventFunctionId];

const agencyRes = await GetAgenciesForReportFilter(
  functionIds,
  eventId,
  agencyType,
  userId,
);
        if (agencyRes?.data?.success && agencyRes?.data?.data) {
          const agencyList = agencyRes.data.data;
          setAgencies(agencyList);

          if (preSelectedAgencyId) {
            setSelectedAgency([preSelectedAgencyId]);
          } else {
            setSelectedAgency(agencyList.map((a) => a.id));
          }
        } else {
          setAgencies([]);
          setSelectedAgency([]);
        }
      } catch (err) {
        errorMsgPopup("Failed to load agencies");
        setAgencies([]);
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchAgencies();
  }, [
     isModalOpen,
  showAgencyDropdown,
  eventFunctionId,
  eventId,
  agencyType,
  isAdminModuleReport,
  preSelectedAgencyId,
]);

  useEffect(() => {
    if (!isModalOpen || isAdminModuleReport) return;

    const Fetchmanagers = async () => {
      setLoadingFilters(true);
      try {
        const userId = localStorage.getItem("userId");
        const managerres = await Fetchmanager(userId);
        if (managerres?.data?.success && managerres?.data?.data) {
          const managerList = managerres.data.data["userDetails"];

          setManager(managerList);
        } else {
          setManager([]);
        }
      } catch (err) {
        errorMsgPopup("Failed to load agencies");
        setManager([]);
      } finally {
        setLoadingFilters(false);
      }
    };

    Fetchmanagers();
  }, [isModalOpen, eventFunctionId, eventId, isAdminModuleReport]);

useEffect(() => {
  if (!isModalOpen || isDropdownStatus !== 1) return;

  const isRawMaterialTab = agencyType === "raw_material" ;

  const fetchcategory = async () => {
    setLoadingFilters(true);
    try {
      const categoryres = isRawMaterialTab
        ? await GetRawMaterialcategory(userId)
        : await GetAllRawMaterialAllocationCategory(eventId);

      if (categoryres?.data?.success && categoryres?.data?.data) {
        const categoryList = isRawMaterialTab
          ? categoryres.data.data["Raw Material Category Details"] 
          : categoryres.data.data["Raw Material Category Details"];

        setCategory(categoryList || []);
        setSelectedCategory((categoryList || []).map((a) => a.id));
      } else {
        setCategory([]);
        setSelectedCategory([]);
      }
    } catch (err) {
      errorMsgPopup("Failed to load category");
      setCategory([]);
    } finally {
      setLoadingFilters(false);
    }
  };

  fetchcategory();
}, [isModalOpen, isDropdownStatus, eventId, agencyType, userId]);

  useEffect(() => {
  if (!isModalOpen || isDropdownStatus !== 1 || !showItemDropdown || isAdminModuleReport) {
    setItems([]);
    setSelectedItems([]);
    return;
  }

  // No Agency dropdown (e.g. date-driven configs, or any isItem-only config)
  // → fetch all items via the simpler menu-preparation endpoint, no party filter.
  const fetchWithoutAgencyFilter = !showAgencyDropdown;

  if (!fetchWithoutAgencyFilter && selectedAgency.length === 0) {
    setItems([]);
    setSelectedItems([]);
    return;
  }

  const singleFunctionId = Array.isArray(eventFunctionId)
    ? (eventFunctionId.find((id) => id !== -1) ?? -1)
    : (eventFunctionId ?? -1);

 const fetchItems = async () => {
  setLoadingFilters(true);
  try {
    const itemsRes = fetchWithoutAgencyFilter
      ? await getallmenuselecteditem(eventId, singleFunctionId)
      : await GetSelectedItemsForReportFilter(eventFunctionId, eventId, selectedAgency);

    if (itemsRes?.data?.success && itemsRes?.data?.data) {
      // getallmenuselecteditem returns menuItemId instead of id — normalize
      // so the rest of the component (Select options, payload.itemId) can
      // treat both endpoints' results the same way.
      const normalizedItems = fetchWithoutAgencyFilter
        ? itemsRes.data.data.map((i) => ({
            ...i,
            id: i.menuItemId,
          }))
        : itemsRes.data.data;

      setItems(normalizedItems);
      if (fetchWithoutAgencyFilter) {
        setSelectedItems(normalizedItems.map((i) => i.id));
      }
    } else {
      setItems([]);
    }
  } catch (err) {
    errorMsgPopup("Failed to load items");
    setItems([]);
  } finally {
    setLoadingFilters(false);
  }
};
  fetchItems();
}, [
  isModalOpen,
  isDropdownStatus,
  showItemDropdown,
  showAgencyDropdown,
  eventFunctionId,
  eventId,
  selectedAgency,
  isAdminModuleReport,
]);

// Load Short Menu template + its configuration when the flag is on
useEffect(() => {
  if (!isModalOpen || !addShortMenu) {
    setShortMenuTemplate(null);
    return;
  }
  let cancelled = false;

  const loadShortMenu = async () => {
    try {
      const modRes = await GettemplatebyuserId();
      const backOffice = modRes?.data?.data?.find(
        (m) => m.nameEnglish === SHORT_MENU_MODULE_NAME && m.isActive && !m.isDelete,
      );
      if (!backOffice) {
        errorMsgPopup("Back Office Theme not found for Short Menu Report");
        return;
      }

      const themeRes = await GetAllCustomThemeByUserIdAndModuleId(userId, backOffice.id);
      const theme = themeRes?.data?.data?.find(
        (t) => t.templateMaster?.name === SHORT_MENU_TEMPLATE_NAME,
        // or: t.templateMappingResponseDto?.nameEnglish === "Type 5"
      );
      if (!theme) {
        errorMsgPopup("Short Menu Report template not found");
        return;
      }

      const shortMappingId = theme.templateMappingResponseDto?.id || theme.id;
      const cfgRes = await GetReportConfiguration(shortMappingId, backOffice.id);
      const cfg = cfgRes?.data?.data?.[0];
      if (!cfg || cancelled) return;

      const ctx = { isDefaultHalfPaxOn, canAccessStock };
      setShortMenuOptions(buildOptionsFromConfig(cfg, ctx));
      setShortMenuVisibleOptions(getVisibleOptionKeys(cfg, ctx));
      setShortMenuHasItems(cfg.isItem === 1);
      setShortMenuTemplate({
        id: theme.id, // this is the adminTemplateModuleId (5146 in your sample)
        name: theme.templateMaster?.name || SHORT_MENU_TEMPLATE_NAME,
        type: cfg.type || null,
      });
    } catch (err) {
      console.error("Short menu config error", err);
      errorMsgPopup("Failed to load Short Menu Report configuration");
    }
  };

  loadShortMenu();
  return () => {
    cancelled = true;
  };
}, [isModalOpen, addShortMenu, userId, isDefaultHalfPaxOn, canAccessStock]);

// Load items for the Short Menu (its config has isItem = 1)
useEffect(() => {
  if (!isModalOpen || !addShortMenu || !shortMenuHasItems) {
    setShortMenuItems([]);
    setShortMenuSelectedItems([]);
    return;
  }
  const fnId = Array.isArray(eventFunctionId)
    ? (eventFunctionId.find((id) => id !== -1) ?? -1)
    : (eventFunctionId ?? -1);

  (async () => {
    try {
      const res = await getallmenuselecteditem(eventId, fnId);
      if (res?.data?.success && res?.data?.data) {
        const list = res.data.data.map((i) => ({ ...i, id: i.menuItemId }));
        setShortMenuItems(list);
        setShortMenuSelectedItems(list.map((i) => i.id)); // all selected by default
      }
    } catch {
      errorMsgPopup("Failed to load Short Menu items");
    }
  })();
}, [isModalOpen, addShortMenu, shortMenuHasItems, eventId, eventFunctionId]);


const openWebWhatsApp = (mobile, recipientName) => {
  const greeting = recipientName || eventName || "there";
  const message = buildWaMessage({
    greeting,
    functionName,
    functionDateTime,
    venueName,
    pdfUrl,
  });
  const cleanedMobile = mobile.replace(/\D/g, "");
  const waUrl = `https://wa.me/${cleanedMobile}?text=${encodeURIComponent(message)}`;
  window.open(waUrl, "_blank", "noopener,noreferrer");
  setShowWhatsAppModal(false);
};
  const formatAdminDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  const toggleAll = (checked) => {
    setOptions((prev) => {
      const updated = { ...prev };
      visibleOptions.forEach((key) => {
        if (key !== "size1" && key !== "size2" && key !== "size3")
          updated[key] = checked;
      });
      return updated;
    });
  };

  const toggleOne = (key) => setOptions((prev) => applyToggle(prev, key));

const toggleShortMenuOne = (key) =>
  setShortMenuOptions((prev) => applyToggle(prev, key));

const toggleAllShortMenu = (checked) =>
  setShortMenuOptions((prev) => {
    const updated = { ...prev };
    shortMenuVisibleOptions.forEach((key) => {
      if (key !== "size1" && key !== "size2" && key !== "size3") updated[key] = checked;
    });
    return updated;
  });

const isShortMenuCheckAll =
  shortMenuVisibleOptions.length > 0 &&
  shortMenuVisibleOptions.every((key) => shortMenuOptions[key]);

  const isCheckAll =
    visibleOptions.length > 0 && visibleOptions.every((key) => options[key]);

 const buildPayload = (opts, visible, overrides = {}) => {
  const pageSize = opts.size1?.enabled
    ? opts.size1.label
    : opts.size2?.enabled
      ? opts.size2.label
      : opts.size3?.enabled
        ? opts.size3.label
        : "";

  return {
    eventId: eventId || -1,
    customPackageId: customPackageId || 0,
    partyId: selectedParty || -1,
    eventFunctionId: Array.isArray(eventFunctionId)
      ? (eventFunctionId[0] ?? -1)
      : (eventFunctionId ?? -1),
    eventFunctionIds: Array.isArray(eventFunctionId)
      ? eventFunctionId.filter((id) => id !== -1)
      : [],
    adminTemplateModuleId: isAdminModuleReport
      ? (selectedTemplateId ?? mappingId)
      : (selectedTemplateId ?? 0),
    type: reportType || null,
    userId,
    lang: selectedLanguage === "english" ? 0 : selectedLanguage === "hindi" ? 1 : 2,
    isCategoryImage: opts.categoryImage,
    isCategoryInstruction: opts.categoryInstruction,
    isCategorySlogan: opts.categorySlogan,
    isItemImage: opts.itemImage,
    isCombo: opts.isCombo,
    isItemInstruction: opts.itemInstruction,
    isItemSlogan: opts.itemSlogan,
    isCompanyDetails: opts.CompanyInfo,
    isCompanyLogo: opts.companyLogo,
    isPartyDetails: opts.partyDetails,
    isWithQty: opts.isWithQty,
    isDoc: visible.includes("isDoc") ? opts.isDoc : false,
    isExcel: visible.includes("isExcel") ? opts.isExcel : false,
    pageSize,
    isWithPrice: opts.isWithPrice,
    isExtraCharges: opts.isExtraCharges,
    isTermsCond: opts.isTermsCond,
    isHalfPax: opts.isHalfPax,
    is3Column: opts.is3Column,
    isFunctionNextPage: opts.isFunctionNextPage,
    isAddDecoration: opts.isAddDecoration,
    isOnePage: opts.isOnePage,
    isShowEventRemarks: opts.isShowEventRemarks,
    showAdditional: opts.showAdditional,
    isAgencyNextPage: opts.isAgencyNextPage,
    storeIssueWise: opts.storeIssueWise,
    isAddStoreIssue: opts.isAddStoreIssue,
    is5Column: opts.is5Column,
    isContactNoVisible: opts.isContactNoVisible,
    isAddMenu: opts.isAddMenu,
    isAdvancePayment: opts.isAdvancePayment,
    withOutBg: opts.withOutBg,
    withVendor: opts.withVendor,
    isAllItemTogether: opts.isAllItemTogether,
    isShowFunctionImg: opts.isShowFunctionImg,
    isNotes: opts.isNotes,
    showAddOnLabel: opts.showAddOnLabel,
    showLastPage: 1,
    isSignatureVisible: opts.isSignatureVisible,
    agencyId: selectedAgency,
    managerIds: selectedManager,
    itemId: selectedItems,
    rawMaterialCatIds: selectedCategory,
    ...(adminStartDate
      ? { startDate: formatAdminDate(adminStartDate) }
      : startDate
        ? { startDate: formatAdminDate(startDate) }
        : {}),
    ...(adminEndDate
      ? { endDate: formatAdminDate(adminEndDate) }
      : endDate
        ? { endDate: formatAdminDate(endDate) }
        : {}),
    ...(showStatusDropdown && { eventStatus: selectedStatus }),
    catFontId: catFontId || -1,
    itemFontId: itemFontId || -1,
    sloganFontId: sloganFontId || -1,
    catFontSize: catFontSize || -1,
    itemFontSize: itemFontSize || -1,
    sloganFontSize: sloganFontSize || -1,
    leadAssignId: 0,
    priority: "",
    sourceId: 0,
    statusId: 0,
    ...overrides,
  };
};

const submitReport = async (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(`${key}[]`, v));
    } else {
      formData.append(key, value === true ? "1" : value === false ? "0" : value);
    }
  });
  const { data } = await AddExclusiveReport(formData);
  return data;
};

const handleReport = async () => {
  if (isNamePlateTheme) {
    setShowNamePlateUI(true);
    return;
  }

  const payload = buildPayload(options, visibleOptions);

  if (!customPackageId && !payload.eventId) {
    errorMsgPopup("Missing required data");
    return;
  }
  if (!payload.adminTemplateModuleId) {
    errorMsgPopup("Missing required data");
    return;
  }

  // Short Menu payload (only when isAddShortMenu = 1)
  let shortMenuPayload = null;
  if (addShortMenu) {
    if (!shortMenuTemplate) {
      errorMsgPopup("Short Menu Report is still loading, please try again");
      return;
    }
    if (shortMenuHasItems && shortMenuSelectedItems.length === 0) {
      errorMsgPopup("Please select items for Short Menu Report");
      return;
    }
    shortMenuPayload = buildPayload(shortMenuOptions, shortMenuVisibleOptions, {
      adminTemplateModuleId: shortMenuTemplate.id,
      type: shortMenuTemplate.type,
      isDoc: false,   // short menu is always a PDF
      isExcel: false,
      agencyId: [],
      rawMaterialCatIds: [],
      itemId: shortMenuSelectedItems,
    });
  }

  setLoading(true);
  try {
    const data = await submitReport(payload);

    if (data?.success && data?.report_path) {
      successMsgPopup(data?.msg || "Report generated");

      const agencyContact =
        Array.isArray(data?.data) && data.data.length === 1 && data.data[0]?.contactNo
          ? data.data[0]
          : null;
      setAutoAgencyContact(agencyContact);

      const fileName = data.report_path.split("/").pop() || "";
      const isPdf = fileName.toLowerCase().endsWith(".pdf");
      const isFileDownload = (options.isDoc || options.isExcel) && !isPdf;

      if (isFileDownload) {
        try {
          const response = await fetch(data.report_path);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.setAttribute(
            "download",
            fileName || (options.isExcel ? "report.xlsx" : "report.docx"),
          );
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);
        } catch {
          window.open(data.report_path, "_blank");
        }
      } else {
        setPdfUrl(data.report_path);
        setMainUrl(data.report_path);

        if (agencyContact?.contactNo) {
          await handleWhatsAppSend(
            `+91${agencyContact.contactNo.replace(/\D/g, "")}`,
            agencyContact.nameEnglish || "",
            data.report_path,
          );
        }
      }

      // ---- NEW: second API call for Short Menu Report ----
      if (shortMenuPayload) {
  try {
    const shortData = await submitReport(shortMenuPayload);

    if (shortData?.success && shortData?.report_path) {
      if (isFileDownload) {
        // main was an Excel/Doc download, so just show the short menu
        setShortMenuUrl(shortData.report_path);
        setPdfUrl(shortData.report_path);
      } else {
        try {
          // Raw Material first, Short Menu appended after it
          const mergedUrl = await mergePdfs([
            data.report_path,
            shortData.report_path,
          ]);
          setPdfUrl(mergedUrl);
        } catch (mergeErr) {
          console.error("PDF merge failed", mergeErr);
          setShortMenuUrl(shortData.report_path); // fallback: tabs
          errorMsgPopup("Could not combine the reports, showing them separately");
        }
      }
    } else {
      errorMsgPopup(shortData?.msg || "Failed to generate Short Menu Report");
    }
  } catch (err) {
    errorMsgPopup(
      err?.response?.data?.msg || "Failed to generate Short Menu Report",
    );
  }
}
    } else {
      errorMsgPopup(data?.msg || "Failed to generate report");
    }
  } catch (err) {
    errorMsgPopup(err?.response?.data?.msg || "Something went wrong");
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    if (isPrintingRef.current || document.hidden) return;
    if (pdfUrl?.startsWith("blob:")) URL.revokeObjectURL(pdfUrl);
    setPdfUrl(null);
    setMainUrl(null);
setShortMenuUrl(null);
setShortMenuTemplate(null);
setShortMenuSelectedItems([]);
    setShowNamePlateUI(false);
    setIsModalOpen(false);
    setSelectedAgency([]);
    setSelectedAgency([]);
    setSelectedManager([]);
    setSelectedItems([]);
    setStartDate(null);
    setEndDate(null);
    setSelectedStatus([]);
    setShowStatusDropdown(false);
    setcatFontId(null);
    setItemFontId(null);
    setSloganFontId(null);
    setcatFontSize(null);
    setItemFontSize(null);
    setSloganFontSize(null);
    setAutoAgencyContact(null);
     setWhatsAppSendMode("api");
  };

const handleWhatsAppShare = (mode = "api") => {
  setWhatsAppSendMode(mode);

  if (selectedAgency.length === 1) {
    const agency = agencies.find((a) => a.id === selectedAgency[0]);
    if (agency?.contactNo) {
      const fullNumber = `+91${agency.contactNo.replace(/\D/g, "")}`;
      if (mode === "web") {
        openWebWhatsApp(fullNumber, agency.nameEnglish || "");
      } else {
        handleWhatsAppSend(fullNumber, agency.nameEnglish || "");
      }
      return;
    }
  }
  setShowWhatsAppModal(true);
};

const handleWhatsAppSend = async (mobile, recipientName) => {
  const greeting = recipientName || eventName || "there";
  const message = buildWaMessage({
    greeting,
    functionName,
    functionDateTime,
    venueName,
    pdfUrl,
  });

  try {
    const { companyMobileNo, companyName } = getCompanyAuthInfo();
    const cleanedMobile = mobile.replace(/\D/g, "");
    const res = await WhatsAppPdf({
      companyMobileNo,
      companyName,
      mobileNo: cleanedMobile,
      moduleName: "Menu Report",
      partyName: recipientName || "",
      url: pdfUrl,
      userId: Number(userId) || 0,
    });

    if (res?.data?.success) {
      successMsgPopup("Report sent successfully!");
    } else {
      errorMsgPopup(res?.data?.msg || "Failed to send report");
    }
  } catch (err) {
    console.error("WhatsAppPdf notify failed:", err);
    errorMsgPopup(err?.response?.data?.msg || "Failed to send report");
  }

  setShowWhatsAppModal(false); 
};

  const Toggle = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={disabled ? undefined : onChange}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
      checked ? "bg-blue-600" : "bg-gray-300"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
        checked ? "translate-x-5" : "translate-x-1"
      }`}
    />
  </button>
);

  return (
    <>
      <WhatsAppModal
  isOpen={showWhatsAppModal}
  onClose={() => setShowWhatsAppModal(false)}
  onSend={whatsAppSendMode === "web" ? openWebWhatsApp : handleWhatsAppSend}
  mobileNumber={mobileNumber}
  mode={whatsAppSendMode}
/>
      <CustomModal
        open={isModalOpen}
        title={selectedTemplateName || "Report"}
        onClose={handleClose}
        width={900}
        maskClosable={false}
        keyboard={false}
        footer={
          pdfUrl ? (
            <div className="flex justify-end gap-2">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Close
              </button>
              
{pdfUrl && !pdfUrl.toLowerCase().endsWith(".docx") && !pdfUrl.toLowerCase().endsWith(".xlsx") && (
  <>
    <button
      onClick={() => handleWhatsAppShare("api")}
      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
    >
      Share on WhatsApp
    </button>
    <button
      onClick={() => handleWhatsAppShare("web")}
      className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 transition"
      title="Opens web.whatsapp.com with the message pre-filled — you send it manually"
    >
      Web WhatsApp
    </button>
  </>
)}
            </div>
          ) : (
            <button
              onClick={handleReport}
              disabled={loading}
              className={`px-6 py-2 text-white rounded transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#005BA8] hover:bg-[#004a8d]"
              }`}
            >
              {loading ? "Generating..." : "Generate Report"}
            </button>
          )
        }
      >
        {showNamePlateUI ? (
          <NamePlateReport onClose={() => setShowNamePlateUI(false)} />
        ) : !pdfUrl ? (
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                Select Language
              </label>
              <div className="flex border rounded-lg overflow-hidden shadow-sm">
  {languageOptions.map((lang) => (
    <button
      key={lang.value}
      onClick={() => setSelectedLanguage(lang.value)}
      className={`flex-1 py-2.5 font-medium transition ${
        selectedLanguage === lang.value
          ? "bg-[#005BA8] text-white"
          : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {lang.label}
    </button>
  ))}
</div>
              {/* <div className="flex border rounded-lg overflow-hidden shadow-sm">
                {["english", "hindi", "gujarati"].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLanguage(lang)}
                    className={`flex-1 py-2.5 font-medium transition ${selectedLanguage === lang ? "bg-[#005BA8] text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                  >
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </button>
                ))}
              </div> */}
            </div>

           
{(exclusive === true || moduleType === "Decoration Theme") && (
  <div className="grid grid-cols-3 gap-4">
    <div>
      <label className="block font-medium mb-2 text-gray-700">
        Category Font Family
      </label>
      <Select
        className="w-full"
        value={catFontId ?? undefined}
        onChange={(val) => setcatFontId(val)}
        options={[
          { value: -1, label: "Default" },
          ...fonts.map((f) => ({ value: f.fontId, label: f.fontName })),
        ]}
      />
    </div>
    <div>
      <label className="block font-medium mb-2 text-gray-700">
        Item Font Family
      </label>
      <Select
        className="w-full"
        value={itemFontId ?? undefined}
        onChange={(val) => setItemFontId(val)}
        options={[
          { value: -1, label: "Default" },
          ...fonts.map((f) => ({ value: f.fontId, label: f.fontName })),
        ]}
      />
    </div>
    <div>
      <label className="block font-medium mb-2 text-gray-700">
        Slogan Font Family
      </label>
      <Select
        className="w-full"
        value={sloganFontId ?? undefined}
        onChange={(val) => setSloganFontId(val)}
        options={[
          { value: -1, label: "Default" },
          ...fonts.map((f) => ({ value: f.fontId, label: f.fontName })),
        ]}
      />
    </div>
  </div>
)}

{(exclusive === true ||
  moduleType === "Decoration Theme" ||
  (moduleType === "Back Office Theme" && mappingType === "Type 12")) && (
  <div className="grid grid-cols-3 gap-4">
    <div>
      <label className="block font-medium mb-2 text-gray-700">Category Font Size</label>
      <Select
        className="w-full"
        value={catFontSize ?? -1}
        onChange={(val) => setcatFontSize(val)}
        options={[
          { value: -1, label: "Default" },
          { value: 9, label: "9" }, { value: 10, label: "10" },
          { value: 11, label: "11" }, { value: 12, label: "12" },
          { value: 14, label: "14" }, { value: 16, label: "16" },
          { value: 18, label: "18" }, { value: 20, label: "20" },
          { value: 22, label: "22" }, { value: 23, label: "23" },
          { value: 24, label: "24" }, { value: 26, label: "26" },
        ]}
      />
    </div>
    <div>
      <label className="block font-medium mb-2 text-gray-700">Item Font Size</label>
      <Select
        className="w-full"
        value={itemFontSize ?? -1}
        onChange={(val) => setItemFontSize(val)}
        options={[
          { value: -1, label: "Default" },
          { value: 9, label: "9" }, { value: 10, label: "10" },
          { value: 11, label: "11" }, { value: 12, label: "12" },
          { value: 14, label: "14" }, { value: 16, label: "16" },
          { value: 18, label: "18" }, { value: 20, label: "20" },
          { value: 22, label: "22" }, { value: 23, label: "23" },
          { value: 24, label: "24" }, { value: 26, label: "26" },
        ]}
      />
    </div>
    <div>
      <label className="block font-medium mb-2 text-gray-700">Slogan Font Size</label>
      <Select
        className="w-full"
        value={sloganFontSize ?? -1}
        onChange={(val) => setSloganFontSize(val)}
        options={[
          { value: -1, label: "Default" },
          { value: 9, label: "9" }, { value: 10, label: "10" },
          { value: 11, label: "11" }, { value: 12, label: "12" },
          { value: 14, label: "14" }, { value: 16, label: "16" },
          { value: 18, label: "18" }, { value: 20, label: "20" },
          { value: 22, label: "22" }, { value: 23, label: "23" },
          { value: 24, label: "24" }, { value: 26, label: "26" },
        ]}
      />
    </div>
  </div>
)}          

             {!isAdminModuleReport && (isDateStatus === 1 ) && (
  <div className="p-5 rounded-xl border-2">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            Start Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={startDate || ""}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
            End Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          value={endDate || ""}
          onChange={(e) => setEndDate(e.target.value)}
          min={startDate || undefined}
          disabled={!startDate}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      </div>
    </div>
  </div>
)}
            {!isAdminModuleReport &&
              (
                showAgencyDropdown ||
                showItemDropdown ||
                showCategoryDropdown) && (
                <div className="p-5 rounded-xl border-2">
                  <div className="grid grid-cols-2 gap-4">
                   {showAgencyDropdown && (
  <div>
    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
      <TeamOutlined className="mr-1" />
      Agency
    </label>
    <Select
      mode="multiple"
      value={selectedAgency}
      onChange={setSelectedAgency}
      placeholder="Select agencies..."
      className="w-full"
      size="large"
      loading={loadingFilters}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      options={agencies.map((a) => ({ value: a.id, label: a.nameEnglish }))}
      getPopupContainer={() => document.body}
      dropdownStyle={{ zIndex: 10000 }}
      maxTagCount="responsive"
      allowClear
    />
  </div>
)}

{showItemDropdown && (
  <div>
    <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
      <AppstoreOutlined className="mr-1" />
      Items <span className="text-red-500">*</span>
    </label>
    <Select
      mode="multiple"
      value={selectedItems}
      onChange={setSelectedItems}
      placeholder="Select items..."
      className="w-full"
      size="large"
      loading={loadingFilters}
      showSearch
      optionFilterProp="children"
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      options={items.map((i) => ({ value: i.id, label: i.nameEnglish }))}
      getPopupContainer={() => document.body}
      dropdownStyle={{ zIndex: 10000 }}
      maxTagCount="responsive"
      allowClear
      disabled={showAgencyDropdown && selectedAgency.length === 0}
    />
  </div>
)}
                    {showCategoryDropdown && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                          <AppstoreOutlined className="mr-1" />
                          Category
                        </label>
                        <Select
                          mode="multiple"
                          value={selectedCategory}
                          onChange={setSelectedCategory}
                          placeholder="Select items..."
                          className="w-full"
                          size="large"
                          loading={loadingFilters}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={category.map((i) => ({
                            value: i.id,
                            label: i.nameEnglish,
                          }))}
                          getPopupContainer={() => document.body}
  dropdownStyle={{ zIndex: 10000 }}
                          maxTagCount="responsive"
                          allowClear
                          disabled={setSelectedCategory.length === 0}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

            {!isAdminModuleReport &&
              isManager &&
              !(
                isDateStatus === 1 ||
                showAgencyDropdown ||
                showItemDropdown ||
                showCategoryDropdown
              ) && (
                <div className="p-5 rounded-xl border-2">
                  <div className="grid grid-cols-2 gap-4">
                    {isManager && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                          <TeamOutlined className="mr-1" />
                          Manager
                        </label>
                        <Select
                          mode="multiple"
                          value={selectedManager}
                          onChange={setSelectedManager}
                          placeholder="Select manager..."
                          className="w-full"
                          size="large"
                          loading={loadingFilters}
                          showSearch
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            (option?.label ?? "")
                              .toLowerCase()
                              .includes(input.toLowerCase())
                          }
                          options={manager.map((a) => ({
                            value: a.id,
                            label: a.firstName,
                          }))}
                          getPopupContainer={() => document.body}
                            dropdownStyle={{ zIndex: 10000 }}
                          maxTagCount="responsive"
                          allowClear
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

            {showStatusDropdown && (
              <div className="grid grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Status
                  </label>
                  <Select
                    mode="multiple"
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    placeholder="Select status..."
                    className="w-full"
                    size="large"
                    options={[
                      { value: 0, label: "Inquiry" },
                      { value: 3, label: "Tentative" },
                      { value: 1, label: "Confirm" },
                      { value: 2, label: "Cancel" },
                    ]}
                    allowClear
                    maxTagCount="responsive"
                    getPopupContainer={(trigger) => trigger.parentNode}
                    dropdownStyle={{ zIndex: 9999 }}
                  />
                </div>
              </div>
            )}

            {!isNamePlateTheme && (
              <>
                <div className="flex justify-between items-center border-b pb-3 mb-3">
                  <span className="font-semibold text-gray-700">
                    Check All Options
                  </span>
                  <Toggle
                    checked={isCheckAll}
                    onChange={() => toggleAll(!isCheckAll)}
                  />
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {visibleOptions.map((key) => (
                    <div
                      key={key}
                      className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition"
                    >
                      <span className="capitalize text-gray-700">
                        {key === "size1" || key === "size2" || key === "size3"
                          ? `Size ${options[key]?.label}`
                          : optionDisplayLabels[key] ||
                            key.replace(/([A-Z])/g, " $1")}
                      </span>
                     <Toggle
  checked={
    key === "size1" || key === "size2" || key === "size3"
      ? options[key]?.enabled
      : options[key]
  }
  disabled={key === "showLastPage" && exclusive}
  onChange={() => toggleOne(key)}
/>
                    </div>
                  ))}
                </div>
              </>
              
            )}


            {!isNamePlateTheme && addShortMenu && (
  <div className="p-5 rounded-xl border-2 space-y-4">
    <h3 className="font-semibold text-gray-800">Short Menu Report Configuration</h3>

    {!shortMenuTemplate ? (
      <p className="text-sm text-gray-500">Loading Short Menu configuration...</p>
    ) : (
      <>
        {shortMenuHasItems && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
              <AppstoreOutlined className="mr-1" />
              Items <span className="text-red-500">*</span>
            </label>
            <Select
              mode="multiple"
              value={shortMenuSelectedItems}
              onChange={setShortMenuSelectedItems}
              placeholder="Select items..."
              className="w-full"
              size="large"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
              }
              options={shortMenuItems.map((i) => ({ value: i.id, label: i.nameEnglish }))}
              getPopupContainer={() => document.body}
              dropdownStyle={{ zIndex: 10000 }}
              maxTagCount="responsive"
              allowClear
            />
          </div>
        )}

        <div className="flex justify-between items-center border-b pb-3">
          <span className="font-semibold text-gray-700">Check All Options</span>
          <Toggle
            checked={isShortMenuCheckAll}
            onChange={() => toggleAllShortMenu(!isShortMenuCheckAll)}
          />
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {shortMenuVisibleOptions.map((key) => (
            <div
              key={key}
              className="flex justify-between items-center py-2 px-3 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="capitalize text-gray-700">
                {key === "size1" || key === "size2" || key === "size3"
                  ? `Size ${shortMenuOptions[key]?.label}`
                  : optionDisplayLabels[key] || key.replace(/([A-Z])/g, " $1")}
              </span>
              <Toggle
                checked={
                  key === "size1" || key === "size2" || key === "size3"
                    ? shortMenuOptions[key]?.enabled
                    : shortMenuOptions[key]
                }
                onChange={() => toggleShortMenuOne(key)}
              />
            </div>
          ))}
        </div>
      </>
    )}
  </div>
)}
          </div>
        ) : (
          // <div style={{ height: "80vh" }}>
          //   <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          //     <Viewer fileUrl={pdfUrl} plugins={[pdfPlugin]} />
          //   </Worker>
          // </div>

          /* <div className="flex flex-col items-center justify-center h-[300px] gap-5">
  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
    <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  </div>

  <div className="text-center">
    <p className="text-lg font-semibold text-gray-800">Report Generated Successfully!</p>
    <p className="text-sm text-gray-500 mt-1">Click below to open the PDF in a new tab</p>
  </div>

  <button
    onClick={() => window.open(pdfUrl, "_blank")}
    className="flex items-center gap-2 px-6 py-3 bg-[#005BA8] text-white rounded-xl hover:bg-[#004a8d] transition font-medium shadow"
  >
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
    Open PDF
  </button>
</div> */

          <>
  {mainUrl && shortMenuUrl && (
    <div className="flex gap-2 mb-3">
      {[
        { label: selectedTemplateName || "Report", url: mainUrl },
        { label: "Short Menu Report", url: shortMenuUrl },
      ].map((t) => (
        <button
          key={t.label}
          onClick={() => setPdfUrl(t.url)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            pdfUrl === t.url
              ? "bg-[#005BA8] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )}

  <div style={{ height: "75vh" }}>
    <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
      <Viewer
        key={pdfUrl}
        fileUrl={pdfUrl}
        plugins={[pdfPlugin]}
        renderLoader={(percentages) => (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">
              Loading PDF... {Math.round(percentages)}%
            </p>
          </div>
        )}
      />
    </Worker>
  </div>
</>
        )}
      </CustomModal>
    </>
  );
};

export default MenuReport;
