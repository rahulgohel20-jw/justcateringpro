  import { Fragment, useEffect, useRef, useState } from "react";
  import { Container } from "@/components/container";
  import { toAbsoluteUrl } from "@/utils/Assets";
  import { KeenIcon } from "@/components";
  import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
  import { Tooltip, DatePicker, Popconfirm, message } from "antd";
  import { useLocation, useParams } from "react-router-dom";
  import { successMsgPopup } from "../../../underConstruction";
  import { useNavigate } from "react-router-dom";
  import { Link } from "react-router-dom";  

  import {
    GetQuotation,
    UpdateQuotation,
    DeleteQuotation,
    GetQuotationReport,
    GetAllEventRemarks,
    Getallquotationfunction,
    getDefaultExtraFunctionquotation,
    upadtelockinquotation,
    GetBankDetails,
    CashAccountGetAll,
    AddLogs,
    GetUserlogs,
    DeleteQuotationAdvancePayment,
    addupdateSecurityDeposit,   
  deleteSecurityDeposit, 
  } from "@/services/apiServices";
  import useStyles from "./style";
  import dayjs from "dayjs";
  import customParseFormat from "dayjs/plugin/customParseFormat";
  import Swal from "sweetalert2";
  import { FormattedMessage, useIntl } from "react-intl";
  dayjs.extend(customParseFormat);
  import "@react-pdf-viewer/core/lib/styles/index.css";
  import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
  import "@react-pdf-viewer/default-layout/lib/styles/index.css";
  import InvoiceTheme from "../AddInvoicePage/InvoiceTheme";
  import { Lock, Sparkles, Unlock } from "lucide-react";
  import { useModuleAccess } from "../../../hooks/useModuleAccess";
  import { usePermission } from "../../../hooks/usePermission";
import SecurityDepositModal from "./SecurityDepositModal";

  const QuotationPage = () => {
    const userId = localStorage.getItem("userId");
    const classes = useStyles();
  const location = useLocation();
  const isDecor = new URLSearchParams(location.search).get("type") === "decor";
     const OFFER_RATE_USER_IDS = ["501"];
     const TAX_USER = ["501"];
const VAT_USER = ["501", "334"];
const HIDE_TAX_COLUMNS_USER_IDS = ["356"]; //for tgb client not show tax ans amount 
const hideTaxColumns = HIDE_TAX_COLUMNS_USER_IDS.includes(String(userId));
     const isVatUser = VAT_USER.includes(String(userId));
     const isTaxUser = TAX_USER.includes(String(userId));
  const isOfferRateUser = OFFER_RATE_USER_IDS.includes(String(userId));
    const [quotationId, setQuotationId] = useState(null);
    const { eventId } = useParams();
    const [billingName, setBillingName] = useState("");
    const [gstNumber, setGstNumber] = useState("");
    const [dueDate, setDueDate] = useState(null);
    const todayDate = new Date().toLocaleDateString("en-GB");
    const [isEdited, setIsEdited] = useState(false);
    const [isQuotationDateEditing, setIsQuotationDateEditing] = useState(false);
    const [quotationDate, setQuotationDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [originalFunctions, setOriginalFunctions] = useState([]);
    const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
    const [pdfUrl, setPdfUrl] = useState("");
    const [loadingPdf, setLoadingPdf] = useState(false);
    const pdfPlugin = defaultLayoutPlugin();
    const navigate = useNavigate();
    const [isInvoiceThemeOpen, setIsInvoiceThemeOpen] = useState(false);
    const [cashPayment, setCashPayment] = useState(0);
    const [chequePayment, setChequePayment] = useState(0);
    const [transportationCharge, setTransportationCharge] = useState(0);
    const [invoiceThemeKey, setInvoiceThemeKey] = useState(0);
    const [isSaving, setIsSaving] = useState();
    const [remark, setRemark] = useState("");
    const intl = useIntl();
    const [eventRemarks, setEventRemarks] = useState([]);
    const [poojaRooms, setPoojaRooms] = useState("");
    const [ironService, setIronService] = useState("");
    const [venueTotal, setVenueTotal] = useState(0);
    const [isExtraFunction, setIsExtraFunction] = useState(false);
    const [extraFunctions, setExtraFunctions] = useState([]);
    const [loadingExtraFunctions, setLoadingExtraFunctions] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [postLockNewIds, setPostLockNewIds] = useState(new Set());
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyLogs, setHistoryLogs] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
    const [isSavingQuotation, setIsSavingQuotation] = useState(false);
const savingQuotationRef = useRef(false);
const initialQuotationSnapshotRef = useRef(null); 
const initialEventRemarksRef = useRef([]); 
const [foodTax, setFoodTax] = useState("0");
const [foodTaxAmount, setFoodTaxAmount] = useState("0");
const [foodTaxTotalAmount, setFoodTaxTotalAmount] = useState("0");
const [serviceTax, setServiceTax] = useState("0");
const [serviceTaxAmount, setServiceTaxAmount] = useState("0");
const [serviceTaxTotalAmount, setServiceTaxTotalAmount] = useState("0");
const [vatTax, setVatTax] = useState("0");
const [vatTaxAmount, setVatTaxAmount] = useState("0");
const [vatTaxTotalAmount, setVatTaxTotalAmount] = useState("0");
const [isDiscountPercentage, setIsDiscountPercentage] = useState(false);
const [securityDeposits, setSecurityDeposits] = useState([]);
const [savingDepositIdx, setSavingDepositIdx] = useState(null);
const [isSecurityDepositOpen, setIsSecurityDepositOpen] = useState(false);

    const [quotationData, setQuotationData] = useState({
      eventName: "",
      partyName: "",
      venueName: "",
      estimateDate: "",
      mobileNumber: "",
      banquetHallId: null,
      banquetHallName: "",

      functions: [
        {
          id: 1,
          name: "",
          date: null,
          persons: "",
          extraTax: "",
          taxRate: "0",
          rate: "",
          totalPrice: "",
          options: "",
          extraPax: 0,
        },
      ],
      taxDetails: [
          { label: "CGST", percentage: isDecor ? "9" : "2.5", amount: "0" },
    { label: "SGST", percentage: isDecor ? "9" : "2.5", amount: "0" },
        { label: "IGST", percentage: "", amount: "0" },
        { label: "Discount", percentage: "", amount: "0" },
        { label: "Round Off", percentage: "", amount: "0" },
      ],
      grandTotal: "0",
      advancePayments: [],
      totalPaid: "0",
      remainingPayment: "0",
      notes: "",
    });
    const [bankList, setBankList] = useState([]);
  const [cashAccountList, setCashAccountList] = useState([]);

    const { hasModuleAccess } = useModuleAccess();
      const canAccessBanquet = hasModuleAccess("Banquet");
    const canAccessMenuExtraFeature = hasModuleAccess("Menu Extra Features");
    const canAccessDecor = hasModuleAccess("Decor");
      const permissionQuotation = usePermission("Quotation")
      const canAccessecuritydeposit = hasModuleAccess("Security Deposit");


    const getErrorMessage = (error, fallback = "Something went wrong") => {
      return (
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.message ||
        fallback
      );
    };


    const buildQuotationChangeSummary = (prevSnapshot, current) => {
    if (!prevSnapshot) return "No baseline to compare.";

    const parts = [];
    const added = [];
    const removed = [];
    const fnLines = [];

    const keyOf = (fn) =>
      fn.id && fn.id !== 0 ? `id-${fn.id}` : fn._tempId || fn.name;

    const prevFnMap = new Map(
      (prevSnapshot.functions || []).map((fn) => [keyOf(fn), fn]),
    );
    const currFnMap = new Map(
      (current.functions || []).map((fn) => [keyOf(fn), fn]),
    );

    (current.functions || []).forEach((fn) => {
      const prevFn = prevFnMap.get(keyOf(fn));
      const label = fn.name || "Function";

      if (!prevFn) {
        added.push(`${label} (Pax: ${fn.persons || 0}, Rate: ${fn.rate || 0}, Total: ${fn.totalPrice || 0})`);
        return;
      }

      const changes = [];
      const fields = [
        ["persons", "Pax"],
        ["extraPax", "Extra Pax"],
        ["rate", "Rate"],
        ["offeredRate", "Offer Rate"],
        ["extraTax", "Tax %"],
        ["taxRate", "Extra Amount"],
        ["totalPrice", "Total Price"],
        ["customPackageName", "Package"],
      ];

      fields.forEach(([field, fieldLabel]) => {
        const prevVal = prevFn[field] ?? "-";
        const currVal = fn[field] ?? "-";
        if (String(prevVal) !== String(currVal)) {
          changes.push(`${fieldLabel}: ${prevVal} → ${currVal}`);
        }
      });

      const prevDate = prevFn.date ? dayjs(prevFn.date).format("DD/MM/YYYY hh:mm A") : "-";
      const currDate = fn.date ? dayjs(fn.date).format("DD/MM/YYYY hh:mm A") : "-";
      if (prevDate !== currDate) {
        changes.push(`Date: ${prevDate} → ${currDate}`);
      }

      if (changes.length) {
        fnLines.push(`${label} [${changes.join(", ")}]`);
      }
    });

    (prevSnapshot.functions || []).forEach((fn) => {
      if (!currFnMap.has(keyOf(fn))) {
        removed.push(fn.name || "Function");
      }
    });

    // ── Top-level fields ──
    const topFields = [
      ["billingname", "Billing Name", current.billingname ?? billingName],
      ["gstnumber", "GST Number", current.gstnumber ?? gstNumber],
      ["duedate", "Due Date", dueDate ? dueDate.format("DD/MM/YYYY") : current.duedate],
      ["notes", "Notes", current.notes],
    ];

    topFields.forEach(([field, label, currVal]) => {
      const prevVal = prevSnapshot[field] ?? "-";
      const cv = currVal ?? "-";
      if (String(prevVal) !== String(cv)) {
        fnLines.push(`${label}: ${prevVal} → ${cv}`);
      }
    });

    const numericFields = [
      ["transportationCharge", "Transportation Charge", transportationCharge],
      ["cashPayment", "Cash Payment", cashPayment],
      ["chequePayment", "Cheque Payment", chequePayment],
      ["foodTax", "Food Tax %", foodTax],
      ["foodTaxAmount", "Food Tax Amount", foodTaxAmount],
      ["serviceTax", "Service Tax %", serviceTax],
      ["serviceTaxAmount", "Service Tax Amount", serviceTaxAmount],
      ["vatTax", "VAT %", vatTax],
      ["vatTaxAmount", "VAT Amount", vatTaxAmount],
    ];

    numericFields.forEach(([field, label, currVal]) => {
      const prevVal = prevSnapshot[field] ?? "-";
      if (String(prevVal) !== String(currVal)) {
        fnLines.push(`${label}: ${prevVal} → ${currVal}`);
      }
    });

    // ── Tax details (CGST/SGST/IGST/Discount/Round Off) ──
    (current.taxDetails || []).forEach((tax) => {
      const prevTax = (prevSnapshot.taxDetails || []).find(
        (t) => t.label === tax.label,
      );
      if (!prevTax) return;
      if (String(prevTax.percentage ?? "-") !== String(tax.percentage ?? "-")) {
        fnLines.push(`${tax.label} %: ${prevTax.percentage ?? "-"} → ${tax.percentage ?? "-"}`);
      }
      if (String(prevTax.amount ?? "-") !== String(tax.amount ?? "-")) {
        fnLines.push(`${tax.label} Amount: ${prevTax.amount ?? "-"} → ${tax.amount ?? "-"}`);
      }
    });

    // ── Advance payments ──
   const keyOfPayment = (p, idx) => (p.id && p.id !== 0 ? `id-${p.id}` : `idx-${idx}`);
    const prevPayMap = new Map(
      (prevSnapshot.advancePayments || []).map((p, idx) => [keyOfPayment(p, idx), p]),
    );
    const currPayMap = new Map(
      (current.advancePayments || []).map((p, idx) => [keyOfPayment(p, idx), p]),
    );

    (current.advancePayments || []).forEach((p, idx) => {
      const key = keyOfPayment(p, idx);
      const prevP = prevPayMap.get(key);
      const label = `Advance Payment #${idx + 1}`;

      if (!prevP) {
        fnLines.push(`${label} Added (Amount: ₹${p.amount || 0}, Mode: ${p.paymentMode || "-"})`);
        return;
      }

      const payFields = [
        ["amount", "Amount"],
        ["paymentMode", "Payment Mode"],
        ["bankId", "Bank"],
        ["cashAccountId", "Cash Account"],
        ["description", "Description"],
      ];

      payFields.forEach(([field, fLabel]) => {
        const prevVal = prevP[field] ?? "-";
        const currVal = p[field] ?? "-";
        if (String(prevVal) !== String(currVal)) {
          fnLines.push(`${label} ${fLabel}: ${prevVal} → ${currVal}`);
        }
      });

      const prevPayDate = prevP.date ? dayjs(prevP.date).format("DD/MM/YYYY hh:mm A") : "-";
      const currPayDate = p.date ? dayjs(p.date).format("DD/MM/YYYY hh:mm A") : "-";
      if (prevPayDate !== currPayDate) {
        fnLines.push(`${label} Date: ${prevPayDate} → ${currPayDate}`);
      }
    });

    (prevSnapshot.advancePayments || []).forEach((p, idx) => {
      const key = keyOfPayment(p, idx);
      if (!currPayMap.has(key)) {
        fnLines.push(`Advance Payment removed (was ₹${p.amount || 0})`);
      }
    });

    // ── Venue Total ──
    const prevVenueTotal = prevSnapshot.venueTotal ?? "-";
    if (String(prevVenueTotal) !== String(venueTotal)) {
      fnLines.push(`Venue Total: ₹${prevVenueTotal} → ₹${venueTotal}`);
    }

    // ── Quotation Date ──
    const currQuotationDateFormatted = quotationDate
      ? dayjs(quotationDate, "YYYY-MM-DD").isValid()
        ? dayjs(quotationDate, "YYYY-MM-DD").format("DD/MM/YYYY")
        : quotationDate
      : current.QuotationDate || "-";
    const prevQuotationDateFormatted = prevSnapshot.quotationDateRaw
      ? dayjs(prevSnapshot.quotationDateRaw, ["DD/MM/YYYY", "YYYY-MM-DD"]).isValid()
        ? dayjs(prevSnapshot.quotationDateRaw, ["DD/MM/YYYY", "YYYY-MM-DD"]).format("DD/MM/YYYY")
        : prevSnapshot.quotationDateRaw
      : "-";
    if (prevQuotationDateFormatted !== currQuotationDateFormatted) {
      fnLines.push(`Quotation Date: ${prevQuotationDateFormatted} → ${currQuotationDateFormatted}`);
    }

    // ── Event Remarks (per-remark text edits) ──
    (eventRemarks || []).forEach((r) => {
      const prevR = (initialEventRemarksRef.current || []).find((pr) => pr.id === r.id);
      if (prevR && String(prevR.nameEnglish || "") !== String(r.nameEnglish || "")) {
        fnLines.push(`Remark (${r.type || "Remark"}): ${prevR.nameEnglish || "-"} → ${r.nameEnglish || "-"}`);
      }
    });

    if (fnLines.length) parts.push(`Changes: ${fnLines.join(" | ")}`);
    if (added.length) parts.push(`Added Functions: ${added.join(", ")}`);
    if (removed.length) parts.push(`Removed Functions: ${removed.join(", ")}`);

    return parts.length ? parts.join(" | ") : "No item-level changes detected.";
  };

const formatAccountLabel = (name, accountNumber) => {
  if (!accountNumber) return name;
  const acctStr = String(accountNumber);
  const last4 = acctStr.slice(-4);
  return `${name} (**** ${last4})`;
};
    const getUserEmail = () => {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (!authStorage) return "";
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.user?.email || "";
    } catch {
      return "";
    }
  };

  const getUserRoleId = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;
    const parsed = JSON.parse(authStorage);
    const roleId =
      parsed?.state?.user?.userBasicDetails?.role?.id ??
      parsed?.state?.userDetails?.role?.id ??
      null;
     
    return roleId != null ? Number(roleId) : null;
  } catch {
    return null;
  }
};

  const sendQuotationLog = async ({
    status,
    eventId,
    quotationId,
    quotationData,
    isDecor,
    extra = "",
    changedFields = [],
  }) => {
    try {
      const quotationType = isDecor ? "Decor Quotation" : "Menu Quotation";
      const eventName = quotationData?.eventName || "N/A";
      const partyName = quotationData?.partyName || "N/A";
      const venueName = quotationData?.venueName || "N/A";
      const grandTotal = totals?.grandTotal ?? quotationData?.grandTotal ?? 0;
      const totalPaid = totals?.totalPaid ?? quotationData?.totalPaid ?? 0;
      const remaining = totals?.remainingPayment ?? quotationData?.remainingPayment ?? 0;
      const functionsCount = quotationData?.functions?.length || 0;
      const userEmail = getUserEmail() || "Unknown User";

      // Build a readable, line-by-line description instead of one long pipe string
      const lines = [];
      lines.push(`Event: ${eventName} (ID: ${eventId})`);
      lines.push(`Party: ${partyName}`);
      lines.push(`Venue: ${venueName}`);

      let eventType = "";
      let actionLabel = "";

      switch (status) {
        case "SAVE_SUCCESS": {
          actionLabel = "Saved";
          lines.push(`Functions: ${functionsCount}`);
          lines.push(`Grand Total: ₹${grandTotal}`);
          lines.push(`Total Paid: ₹${totalPaid}`);
          lines.push(`Remaining: ₹${remaining}`);

          const changeSummary = buildQuotationChangeSummary(
            initialQuotationSnapshotRef.current,
            quotationData,
          );
          lines.push(changeSummary);

          lines.push(`Updated By: ${userEmail}`);
          eventType = isDecor ? "DecorQuotation_Save" : "MenuQuotation_Save";
          break;
        }

        case "SAVE_ERROR":
          actionLabel = "Save Failed";
          lines.push(`Attempted By: ${userEmail}`);
          if (extra) lines.push(`Error: ${extra}`);
          eventType = isDecor ? "DecorQuotation_Save_Error" : "MenuQuotation_Save_Error";
          break;

        case "LOCK_SUCCESS":
          actionLabel = "Locked";
          lines.push(`Quotation ID: ${quotationId}`);
          lines.push(`Grand Total: ₹${grandTotal}`);
          lines.push(`Locked By: ${userEmail}`);
          eventType = isDecor ? "DecorQuotation_Lock" : "MenuQuotation_Lock";
          break;

        case "LOCK_ERROR":
          actionLabel = "Lock Failed";
          lines.push(`Attempted By: ${userEmail}`);
          if (extra) lines.push(`Error: ${extra}`);
          eventType = isDecor ? "DecorQuotation_Lock_Error" : "MenuQuotation_Lock_Error";
          break;

          case "UNLOCK_SUCCESS":
  actionLabel = "Unlocked";
  lines.push(`Quotation ID: ${quotationId}`);
  lines.push(`Grand Total: ₹${grandTotal}`);
  lines.push(`Unlocked By: ${userEmail}`);
  eventType = isDecor ? "DecorQuotation_Unlock" : "MenuQuotation_Unlock";
  break;

case "UNLOCK_ERROR":
  actionLabel = "Unlock Failed";
  lines.push(`Attempted By: ${userEmail}`);
  if (extra) lines.push(`Error: ${extra}`);
  eventType = isDecor ? "DecorQuotation_Unlock_Error" : "MenuQuotation_Unlock_Error";
  break;

        default:
          actionLabel = "Action Performed";
          eventType = isDecor ? "DecorQuotation" : "MenuQuotation";
      }

      // Header line makes the action + type immediately clear when scanning history
      const description = `${quotationType} ${actionLabel}\n${lines.join("\n")}`;

      await AddLogs({
        description,
        eventType,
        id: 0,
        eventId: Number(eventId) || 0,
        user: userEmail,
      });
    } catch (logErr) {
      console.error("Failed to save log:", logErr);
    }
  };

    const fetchBankDetails = async () => {
    try {
      const res = await GetBankDetails(userId);
      const banks = res?.data?.data || res?.data || [];
      setBankList(Array.isArray(banks) ? banks : []);
    } catch (err) {
      console.error("Error fetching bank details:", err);
    }
  };

  const fetchCashAccounts = async () => {
    try {
      const res = await CashAccountGetAll(userId);
      const accounts = res?.data?.data || res?.data || [];
      setCashAccountList(Array.isArray(accounts) ? accounts : []);
    } catch (err) {
      console.error("Error fetching cash accounts:", err);
    }
  };

    const fetchExtraFunctions = async (isOn) => {
      const resolvedId = quotationId || quotationData?.quotationId;
      if (!resolvedId) return;
      setLoadingExtraFunctions(true);
      try {
        const res = await getDefaultExtraFunctionquotation(isOn, quotationId);
        const items = res?.data?.data["Default Functions Item Details"] || [];

        setExtraFunctions(
          items
            .filter((item) => item.isActive !== false)
            .map((item) => ({
              id: item.id ?? 0,
              defaultFunctionId: item.defaultFunctionId || null,
              isAddons: item.isAddons || false,
              itemId: item.itemId || null,
              menuCatId: item.menuCatId || null,
              eventFunctionId: item.eventFunctionId || null,
              name: item.functionName || "",
              date:
                item.functionDate &&
                dayjs(item.functionDate, "DD/MM/YYYY hh:mm A").isValid()
                  ? dayjs(item.functionDate, "DD/MM/YYYY hh:mm A")
                  : null,
              persons: item.pax != null ? item.pax.toString() : "",
              extra: item.extraPax ?? 0,
              rate: item.ratePerPlate != null ? item.ratePerPlate.toString() : "",
             extraTax: item.defaultFunctionId != null ? "0" : (item.extraTax ?? 0).toString(),
          taxRate: item.defaultFunctionId != null ? "0" : formatAmount(item.taxRate ?? 0),
              totalPrice: formatAmount(item.amount ?? 0),
              options: item.options || "",
              extraPax: item.extraPax ?? 0,
              customPackageId:
                item.customPackageId != null ? String(item.customPackageId) : "",
              customPackageName: item.customPackageName || "",
              customPackagePrice: item.customPackagePrice || 0,
              isFromQuotationItems: false,
              isExtraQuotationFunction: true,
              isNewFunction: true, 
            })),
        );
      } catch (err) {
        console.error("Error fetching extra functions:", err);
      } finally {
        setLoadingExtraFunctions(false);
      }
    };

  const handleExtraFunctionToggle = async (checked) => {
    if (!checked) {
      const result = await Swal.fire({
        title: "Remove Quotation Functions?",
        text: "Are you sure you want to remove all quotation functions from this quotation?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#005BA8",
        confirmButtonText: "Yes, Remove",
        cancelButtonText: "Cancel",
        background: "#f5faff",
        color: "#003f73",
        customClass: {
          popup: "rounded-2xl shadow-xl",
          title: "text-2xl font-bold",
          confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
          cancelButton: "px-6 py-2 text-white font-semibold rounded-lg",
        },
      });

      if (!result.isConfirmed) return;

      const resolvedId = quotationId || quotationData?.quotationId;
      if (!resolvedId) {
        console.error("No quotationId available for toggle-off API call");
        return;
      }

      try {
        await getDefaultExtraFunctionquotation(false, resolvedId);
      } catch (err) {
        console.error("Failed to toggle off extra functions:", err);
      }

      setIsExtraFunction(false);
      setQuotationData((prev) => ({
        ...prev,
        functions: prev.functions.filter((f) => !f.isExtraQuotationFunction),
      }));
      setOriginalFunctions((prev) =>
        prev.filter((f) => !f.isExtraQuotationFunction),
      );
      setIsEdited(true);
      return;
    }

    
    setIsExtraFunction(true);
    const alreadyHasExtra = quotationData.functions.some(
      (f) => f.isExtraQuotationFunction,
    );
    if (!alreadyHasExtra) {
      fetchExtraFunctions(true);
    }
    setIsEdited(true);
  };

    useEffect(() => {
      if (!isExtraFunction || extraFunctions.length === 0) return;

      setQuotationData((prev) => {
        const withoutExtra = prev.functions.filter(
          (f) => !f.isExtraQuotationFunction,
        );
        return { ...prev, functions: [...withoutExtra, ...extraFunctions] };
      });
      setOriginalFunctions((prev) => {
        const withoutExtra = prev.filter((f) => !f.isExtraQuotationFunction);
        return [...withoutExtra, ...extraFunctions];
      });
    }, [extraFunctions]);

    const fetchEventRemarks = async () => {
      try {
        const res = await GetAllEventRemarks("", userId);
        const remarks = res?.data?.data?.["EventRemarks Details"] || [];
        const EXCLUDED_TYPES = ["odc", "banquet"];
        const filtered = remarks
          .filter((r) => !EXCLUDED_TYPES.includes(r.type?.toLowerCase()))
          .map((r) => ({ ...r }));
        setEventRemarks(filtered);
        initialEventRemarksRef.current = JSON.parse(JSON.stringify(filtered)); // ← baseline for change diffing
      } catch (err) {
        console.error("Error fetching event remarks:", err);
      }
    };

    useEffect(() => {
      const timer = setTimeout(() => {
        if (!searchTerm.trim()) {
          setQuotationData((prev) => ({
            ...prev,
            functions: originalFunctions,
          }));
          return;
        }

        const normalize = (v = "") =>
          v.toString().toLowerCase().replace(/\s+/g, "");

        const filtered = originalFunctions.filter((fn) => {
          return (
            normalize(fn.name).includes(normalize(searchTerm)) ||
            (fn.date &&
              normalize(fn.date.format("DD/MM/YYYY hh:mm A")).includes(
                normalize(searchTerm),
              ))
          );
        });

        setQuotationData((prev) => ({
          ...prev,
          functions: filtered,
        }));
      }, 300);

      return () => clearTimeout(timer);
    }, [searchTerm, originalFunctions]);

    useEffect(() => {
      if (quotationData?.QuotationDate) {
        setQuotationDate(dayjs(quotationData.QuotationDate).format("YYYY-MM-DD"));
      }
    }, [quotationData?.QuotationDate]);

    useEffect(() => {
      // FetchGetQuotation();
      fetchEventRemarks();
      fetchBankDetails();
    fetchCashAccounts();
    }, []);

    useEffect(() => {
    FetchGetQuotation();
  }, [isDecor]);

    const formatAmount = (value) => {
      const num = Number(value) || 0;
      return num % 1 === 0 ? num.toString() : num.toFixed(2);
    };

    const calcGstOnAmount = (chequeAmt) => {
      const cgstPct = parseFloat(
        quotationData.taxDetails.find((t) => t.label === "CGST")?.percentage || 0,
      );
      const sgstPct = parseFloat(
        quotationData.taxDetails.find((t) => t.label === "SGST")?.percentage || 0,
      );
      const igstPct = parseFloat(
        quotationData.taxDetails.find((t) => t.label === "IGST")?.percentage || 0,
      );

      const totalGstPct = cgstPct + sgstPct + igstPct;

      const gstOnCheque = (chequeAmt * totalGstPct) / 100;

      return parseFloat((chequeAmt + gstOnCheque).toFixed(2));
    };


    // Shared base used for these three taxes (matches your existing calculateTotals logic)
const getFoodServiceVatBase = () => {
  const subtotal = quotationData.functions.reduce(
    (sum, fn) => sum + (parseFloat(fn.totalPrice) || 0),
    0,
  );
  const transportAmount = parseFloat(transportationCharge) || 0;
  const discountAmount = parseFloat(
    quotationData.taxDetails.find((tax) => tax.label === "Discount")?.amount || 0,
  );
  return subtotal + transportAmount - discountAmount; // = amountAfterDiscount
};

// FOOD TAX — amount is the base entered by user, % is the rate applied to it, total = amount * %/100
const handleFoodTaxChange = (value) => {
  setIsEdited(true);
  setFoodTax(value);
  const base = parseFloat(foodTaxAmount) || 0;
  const pct = parseFloat(value) || 0;
  const total = (base * pct) / 100;
  setFoodTaxTotalAmount(total % 1 === 0 ? total.toString() : total.toFixed(2));
};

const handleFoodTaxAmountChange = (value) => {
  setIsEdited(true);
  setFoodTaxAmount(value);
  const base = parseFloat(value) || 0;
  const pct = parseFloat(foodTax) || 0;
  const total = (base * pct) / 100;
  setFoodTaxTotalAmount(total % 1 === 0 ? total.toString() : total.toFixed(2));
};

// SERVICE TAX
const handleServiceTaxChange = (value) => {
  setIsEdited(true);
  setServiceTax(value);
  const base = parseFloat(serviceTaxAmount) || 0;
  const pct = parseFloat(value) || 0;
  const total = (base * pct) / 100;
  setServiceTaxTotalAmount(total % 1 === 0 ? total.toString() : total.toFixed(2));
};

const handleServiceTaxAmountChange = (value) => {
  setIsEdited(true);
  setServiceTaxAmount(value);
  const base = parseFloat(value) || 0;
  const pct = parseFloat(serviceTax) || 0;
  const total = (base * pct) / 100;
  setServiceTaxTotalAmount(total % 1 === 0 ? total.toString() : total.toFixed(2));
};

// VAT
const handleVatTaxChange = (value) => {
  setIsEdited(true);
  setVatTax(value);
  const base = parseFloat(vatTaxAmount) || 0;
  const pct = parseFloat(value) || 0;
  const total = (base * pct) / 100;
  setVatTaxTotalAmount(total % 1 === 0 ? total.toString() : total.toFixed(2));
};

const handleVatTaxAmountChange = (value) => {
  setIsEdited(true);
  setVatTaxAmount(value);
  const base = parseFloat(value) || 0;
  const pct = parseFloat(vatTax) || 0;
  const total = (base * pct) / 100;
  setVatTaxTotalAmount(total % 1 === 0 ? total.toString() : total.toFixed(2));
};

   const handleCashChange = (value) => {
  const cash = parseFloat(value) || 0;
  const base = parseFloat(totals.amountAfterDiscount) || 0;
  const cheque = parseFloat(Math.max(0, base - cash).toFixed(2));
  setCashPayment(cash);
  setChequePayment(cheque);
  setIsEdited(true);
};

const handleChequeChange = (value) => {
  const cheque = parseFloat(value) || 0;
  const base = parseFloat(totals.amountAfterDiscount) || 0;
  const cash = parseFloat(Math.max(0, base - cheque).toFixed(2));
  setChequePayment(cheque);
  setCashPayment(cash);
  setIsEdited(true);
};


   const handleTransportationChange = (value) => {
  const amount = parseFloat(value) || 0;
  setTransportationCharge(amount);
  setIsEdited(true);

  const subtotal = quotationData.functions.reduce(
    (sum, fn) => sum + (parseFloat(fn.totalPrice) || 0),
    0,
  );
  const discount = parseFloat(
    quotationData.taxDetails.find((tax) => tax.label === "Discount")?.amount || 0,
  );
  const newAmountAfterDiscount = subtotal + amount - discount;

  const cash = parseFloat(cashPayment) || 0;
  const newCheque = parseFloat(Math.max(0, newAmountAfterDiscount - cash).toFixed(2));
  setChequePayment(newCheque);
};

    const FetchGetQuotation = () => {
      setQuotationData((prev) => ({ ...prev, functions: [] }));
      setOriginalFunctions([]);

      return GetQuotation(eventId, 0, isDecor ? true : false)
        .then((res) => {
          const apiData = res?.data?.data?.["Event Functions Quotation Details"];

          if (apiData && apiData.length > 0) {
            const quotationInfo = apiData[0];
            const hasFunctionQuotationItems =
              quotationInfo.functionQuotationItems &&
              quotationInfo.functionQuotationItems.length > 0;

            const mappedFunctions = hasFunctionQuotationItems
              ? quotationInfo.functionQuotationItems.map((item) => {
                  const persons = item.pax ?? 0;
                  const packagePrice = item.customPackagePrice || 0;
                  const ratePerPax = item.ratePerPlate;
                  const rate =
                    ratePerPax > 0 ? (item.ratePerPlate ?? 0)  :packagePrice ;
                
                  const extraTax = item.extraTax ?? 0;

                  const calculatedTaxRate = item.taxRate ?? 0;
                  const totalPrice = item.amount ?? 0;
                  return {
                    id: item.id ?? 0,
                    defaultFunctionId: item.defaultFunctionId || null,
                    isAddons: item.isAddons || false,
                    itemId: item.itemId || null,
                    menuCatId: item.menuCatId || null,
                    eventFunctionId: item.eventFunctionId || 0,
                    isLocked: item.isLocked || false,
                    name: item.functionName || "",
                    date:
                      item.functionDate &&
                      dayjs(item.functionDate, "DD/MM/YYYY hh:mm A").isValid()
                        ? dayjs(item.functionDate, "DD/MM/YYYY hh:mm A")
                        : null,
                    persons: persons != null ? persons.toString() : "",
                    extra: item.extraPax ?? 0,
                    rate: rate != null ? rate.toString() : "0",
                     offeredRate:
                      item.offeredRate != null ? item.offeredRate.toString() : "",
                   extraTax: (item.defaultFunctionId != null && item.isEventFunction === false) ? "0" : extraTax.toString(),
taxRate: (item.defaultFunctionId != null && item.isEventFunction === false) ? "0" : formatAmount(calculatedTaxRate),
                    totalPrice: formatAmount(totalPrice),
                    options: item.options || "",
                    extraPax: item.extraPax ?? 0,
                    customPackageId:
                      item.customPackageId != null
                        ? String(item.customPackageId)
                        : "",
                    customPackageName: item.customPackageName || "",
                    customPackagePrice: packagePrice,
                    isFromQuotationItems: item.isEventFunction === true,
                    extraChargesId: item.extraChargesId ?? null,
isExtraCharges: item.isExtraCharges === true,
                    isExtraQuotationFunction:
                      item.defaultFunctionId != null &&
                      item.isEventFunction === false,
                    isNewFunction:
                      !item.isEventFunction &&
                      item.defaultFunctionId == null &&
                      (item.eventFunctionId === 0 ||
                        item.eventFunctionId === null),
                  };
                })
              : quotationInfo.event?.eventFunctions?.length > 0
                ? quotationInfo.event.eventFunctions.map((eventFunc) => {
                    const persons = eventFunc.pax ?? 0;
                    const rate = eventFunc.rate ?? 0;
                    const totalPrice = persons && rate ? persons * rate : 0;

                    return {
                      id: 0,
                      defaultFunctionId: eventFunc.defaultFunctionId || null,
                      isAddons: eventFunc.isAddons || false,
                      itemId: eventFunc.itemId || null,
                      menuCatId: eventFunc.menuCatId || null,
                      eventFunctionId: eventFunc.id || 0,
                      name: eventFunc.function?.nameEnglish || "",
                      date: eventFunc.functionStartDateTime
                        ? dayjs(
                            eventFunc.functionStartDateTime,
                            "DD/MM/YYYY hh:mm A",
                          )
                        : null,
                      persons: persons.toString(),
                      extra: 0,
                      rate: rate.toString(),
                      extraTax: "0",
                      taxRate: "0",
                      options: "",
                      extraPax: eventFunc.extraPax ?? 0,
                      customPackageId: "",
                      customPackageName: "",
                      extraChargesId: eventFunc.extraChargesId || null,
                      isExtraCharges: eventFunc.isExtraCharges || false,
                      customPackagePrice: 0,
                      totalPrice: formatAmount(totalPrice),
                      isFromQuotationItems: true,
                    };
                  })
                : [
                    {
                      id: 0,
                      name: "",
                      date: null,
                      persons: "",
                      extra: "",
                      rate: "",
                      extraTax: "0",
                      taxRate: "0",
                      totalPrice: "0",
                      customPackageId: "",
                      customPackageName: "",
                      customPackagePrice: 0,
                      isFromQuotationItems: false,
                      defaultFunctionId: null,
                      isAddons: false,
                      itemId: null,
                      menuCatId: null,
                    },
                  ];

            const deduplicatedFunctions = mappedFunctions.filter(
              (fn, index, self) =>
                fn.id === 0 ||
                index === self.findIndex((f) => f.id !== 0 && f.id === fn.id),
            );

            const mappedData = {
              quotationId: quotationInfo.id,
              QuotationDate:
                quotationInfo.quotationdate ||
                quotationInfo.createdAt ||
                todayDate,
              eventName: quotationInfo.event?.eventType?.nameEnglish || "Event",
              partyName: quotationInfo.event?.party?.nameEnglish || "",
              billingname: quotationInfo.billingname || "",
              gstnumber: quotationInfo.gstnumber || "",
              duedate: quotationInfo.duedate || "",
              venueName: quotationInfo.event?.venue?.nameEnglish || "",
              mobileNumber: quotationInfo.event?.mobileno || "-",
              estimateDate: quotationInfo.event?.eventStartDateTime
                ? new Date(
                    quotationInfo.event.eventStartDateTime,
                  ).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "",
              banquetHallId: quotationInfo.event?.banquetHallId ?? null,
              banquetHallName: quotationInfo.event?.banquetHallName || "",

              functions: deduplicatedFunctions,
              venueRemark: quotationInfo.event?.venue?.remark || "",
              venueRemarkHindi: quotationInfo.event?.venue?.remarkHindi || "",
              poojaRooms: quotationInfo.poojaRooms || "",
              ironService: quotationInfo.ironService || "",
              venueTotal: quotationInfo.venueTotal || 0,
              venueRemarkGujarati:
                quotationInfo.event?.venue?.remarkGujarati || "",
              taxDetails: [
                {
                  label: "CGST",
                  percentage: quotationInfo.cgst || (isDecor ? "9" : "2.5"),
                  amount: quotationInfo.cgstAmnt || 0,
                },
                {
                  label: "SGST",
                  percentage: quotationInfo.sgst || (isDecor ? "9" : "2.5"),
                  amount: quotationInfo.sgstAmnt || 0,
                },
                {
                  label: "IGST",
                  percentage: quotationInfo.igst || "0",
                  amount: quotationInfo.igstAmnt || 0,
                },
               {
  label: "Discount",
  percentage: Number(parseFloat(quotationInfo.discountPct) || 0), 
  amount: (quotationInfo.discount || 0).toFixed(2),
},
                {
                  label: "Round Off",
                  percentage: "0",
                  amount: quotationInfo.roundOff || 0,
                },
              ],

              grandTotal: quotationInfo.grandTotal || 0,
              totalPaid: quotationInfo.advancePayment || 0,
              remainingPayment: quotationInfo.remainingAmount || 0,

            advancePayments:
    quotationInfo.eventFunctionQuotationPayments?.length > 0
      ? quotationInfo.eventFunctionQuotationPayments.map((p) => ({
          id: p.id || 0,
          amount: p.advancePayment || 0,
          date:
            p.advancePaymentDate &&
            dayjs(p.advancePaymentDate, "DD/MM/YYYY hh:mm A").isValid()
              ? dayjs(p.advancePaymentDate, "DD/MM/YYYY hh:mm A")
              : null,
          description: p.advancePaymentNotes || "",
          paymentMode: p.paymentMode || "",
          bankId: p.bankId || null,
          cashAccountId: p.cashAccountId || null,
        }))
      : quotationInfo.advancePayment && Number(quotationInfo.advancePayment) > 0
        ? [
            {
              id: 0,
              amount: quotationInfo.advancePayment || 0,
              date:
                quotationInfo.advancePaymentDate &&
                dayjs(quotationInfo.advancePaymentDate, "DD/MM/YYYY hh:mm A").isValid()
                  ? dayjs(quotationInfo.advancePaymentDate, "DD/MM/YYYY hh:mm A")
                  : null,
              description: quotationInfo.advancePaymentNotes || "",
              paymentMode: quotationInfo.paymentMode || "",
              bankId: quotationInfo.bankId || null,
              cashAccountId: quotationInfo.cashAccountId || null,
            },
          ]
        : [],

              notes: quotationInfo.notes,
            };

            setQuotationId(mappedData.quotationId);
            setQuotationData(mappedData);
            setPoojaRooms(quotationInfo.poojaRooms || "");
            setIronService(quotationInfo.ironService || "");
            setVenueTotal(parseFloat(quotationInfo.venueTotal) || 0);
            setCashPayment(parseFloat(quotationInfo.cashPayment) || 0);
            setChequePayment(parseFloat(quotationInfo.chequePayment) || 0);
            setTransportationCharge(parseFloat(quotationInfo.transportation) || 0);
   
           const rawIsDiscountPercent = quotationInfo.isDiscountPercent;
const inferredIsPercent =
  rawIsDiscountPercent === true
    ? true
    : rawIsDiscountPercent === false
      ? false
      : parseFloat(quotationInfo.discountPct) > 0; 

setIsDiscountPercentage(inferredIsPercent); 
           setFoodTax(quotationInfo.foodTax || "0");
setServiceTax(quotationInfo.serviceTax || "0");
setVatTax(quotationInfo.vatTax || "0");
setFoodTaxAmount(formatAmount(quotationInfo.foodTaxAmount || 0));
setFoodTaxTotalAmount(formatAmount(quotationInfo.foodTaxTotalAmount || 0));
setServiceTaxAmount(formatAmount(quotationInfo.serviceTaxAmount || 0));
setServiceTaxTotalAmount(formatAmount(quotationInfo.serviceTaxTotalAmount || 0));
setVatTaxAmount(formatAmount(quotationInfo.vatTaxAmount || 0));
setVatTaxTotalAmount(formatAmount(quotationInfo.vatTaxTotalAmount || 0));
            setOriginalFunctions(deduplicatedFunctions);
            setIsExtraFunction(quotationInfo.isExtraFunction === true);
            setIsLocked(quotationInfo.isLocked === true);

            initialQuotationSnapshotRef.current = {
              functions: JSON.parse(JSON.stringify(deduplicatedFunctions)),
              taxDetails: JSON.parse(JSON.stringify(mappedData.taxDetails)),
             isDiscountPercentage: inferredIsPercent,
              venueTotal: parseFloat(quotationInfo.venueTotal) || 0,
              quotationDateRaw: quotationInfo.quotationdate || quotationInfo.createdAt || todayDate,
              transportationCharge: parseFloat(quotationInfo.transportation) || 0,
              cashPayment: parseFloat(quotationInfo.cashPayment) || 0,
              chequePayment: parseFloat(quotationInfo.chequePayment) || 0,
              foodTax: quotationInfo.foodTax || "0",
              foodTaxAmount: formatAmount(quotationInfo.foodTaxAmount || 0),
              serviceTax: quotationInfo.serviceTax || "0",
              serviceTaxAmount: formatAmount(quotationInfo.serviceTaxAmount || 0),
              vatTax: quotationInfo.vatTax || "0",
              vatTaxAmount: formatAmount(quotationInfo.vatTaxAmount || 0),
              billingname: quotationInfo.billingname || "",
              gstnumber: quotationInfo.gstnumber || "",
              duedate: quotationInfo.duedate || "",
              notes: quotationInfo.notes || "",
              advancePayments: JSON.parse(
                JSON.stringify(mappedData.advancePayments || []),
              ),
            };
          }
        })
        .catch((error) => {
          console.log("Error fetching quotation:", error);
        });
    };

    const calculateTotals = () => {
  const subtotal = quotationData.functions.reduce((sum, func) => {
    const total = parseFloat(func.totalPrice) || 0;
    return sum + total;
  }, 0);

  // NEW — transportation is added to subtotal before discount is applied
  const transportAmount = parseFloat(transportationCharge) || 0;
  const subtotalWithTransport = subtotal + transportAmount;

  const discountAmount = parseFloat(
    quotationData.taxDetails.find((tax) => tax.label === "Discount")
      ?.amount || 0,
  );

  // CHANGED — discount now applies to (subtotal + transportation), not subtotal alone
  const amountAfterDiscount = subtotalWithTransport - discountAmount;


  
  const foodTaxPercentage = parseFloat(foodTax) || 0;
  const serviceTaxPercentage = parseFloat(serviceTax) || 0;
  const vatTaxPercentage = parseFloat(vatTax) || 0;

 const foodTaxAmt = parseFloat(foodTaxAmount) || 0;
const serviceTaxAmt = parseFloat(serviceTaxAmount) || 0;
const vatTaxAmt = parseFloat(vatTaxAmount) || 0;

const foodTaxTotalAmt = (foodTaxAmt * foodTaxPercentage) / 100;
const serviceTaxTotalAmt = (serviceTaxAmt * serviceTaxPercentage) / 100;
const vatTaxTotalAmt = (vatTaxAmt * vatTaxPercentage) / 100;

const foodTaxTotalAmount = formatAmount(foodTaxTotalAmt);
const serviceTaxTotalAmount = formatAmount(serviceTaxTotalAmt);
const vatTaxTotalAmount = formatAmount(vatTaxTotalAmt);

  const cgstDetail = quotationData.taxDetails.find((tax) => tax.label === "CGST");
  const sgstDetail = quotationData.taxDetails.find((tax) => tax.label === "SGST");
  const igstDetail = quotationData.taxDetails.find((tax) => tax.label === "IGST");

  const cgstPercentage = parseFloat(cgstDetail?.percentage || 0);
  const sgstPercentage = parseFloat(sgstDetail?.percentage || 0);
  const igstPercentage = parseFloat(igstDetail?.percentage || 0);

  const gstBase = parseFloat(chequePayment) || 0; // tax applies to cheque portion only, never cash
const cgstAmount = (gstBase * cgstPercentage) / 100;
const sgstAmount = (gstBase * sgstPercentage) / 100;
const igstAmount = (gstBase * igstPercentage) / 100;

  const roundOffAmount = parseFloat(
    quotationData.taxDetails.find((tax) => tax.label === "Round Off")
      ?.amount || 0,
  );

  const totalTaxAmount = cgstAmount + sgstAmount + igstAmount;

  const grandTotal =
  amountAfterDiscount +
  totalTaxAmount +
  roundOffAmount +
  foodTaxTotalAmt +
  serviceTaxTotalAmt +
  vatTaxTotalAmt;

  const totalPaid = (quotationData.advancePayments || []).reduce((sum, p) => {
    const val = parseFloat(p.amount) || 0;
    return sum + val;
  }, 0);

  const remaining = Math.max(0, grandTotal - totalPaid);

  return {
    subtotal: formatAmount(subtotal),
    transportationCharge: formatAmount(transportAmount), 
    subtotalWithTransport: formatAmount(subtotalWithTransport), 
    discountAmount: formatAmount(discountAmount),
    amountAfterDiscount: formatAmount(amountAfterDiscount),
    cgstAmount: formatAmount(cgstAmount),
    sgstAmount: formatAmount(sgstAmount),
    igstAmount: formatAmount(igstAmount),
    foodTaxAmount: formatAmount(foodTaxAmt),
foodTaxTotalAmount: formatAmount(foodTaxTotalAmt),
serviceTaxAmount: formatAmount(serviceTaxAmt),
serviceTaxTotalAmount: formatAmount(serviceTaxTotalAmt),
vatTaxAmount: formatAmount(vatTaxAmt),
vatTaxTotalAmount: formatAmount(vatTaxTotalAmt),
    totalTaxAmount: formatAmount(totalTaxAmount),
    roundOffAmount: formatAmount(roundOffAmount),
    grandTotal: formatAmount(grandTotal),
    totalPaid: formatAmount(totalPaid),
    remainingPayment: formatAmount(remaining),
  };
};





    const totals = calculateTotals();
useEffect(() => {
  const cash = parseFloat(cashPayment) || 0;
  const afterDiscount = parseFloat(totals.amountAfterDiscount) || 0;
  const newCheque = parseFloat(Math.max(0, afterDiscount - cash).toFixed(2));

  setChequePayment((prev) => {
    const prevNum = parseFloat(prev) || 0;
    return prevNum !== newCheque ? newCheque : prev;
  });
}, [totals.amountAfterDiscount]);

    const handleAddFunction = () => {
      const eventStartDate = quotationData.estimateDate
        ? dayjs(quotationData.estimateDate, "DD MMMM YYYY")
        : null;
        const tempId = `new_${Date.now()}_${Math.random()}`;
          if (isLocked) {
      setPostLockNewIds((prev) => new Set([...prev, tempId]));
    }
      setQuotationData((prev) => ({
        ...prev,
        functions: [
          ...prev.functions,
          {
            id: 0,
            name: "",
            date: eventStartDate?.isValid() ? eventStartDate : null,
            persons: "",
            rate: "",
            offeredRate: "",
            totalPrice: "0",
            isFromQuotationItems: false,
            isNewFunction: true,
            isLocked: false,
            extraTax: "",
            taxRate: "0",
            customPackageId: "",
            customPackageName: "",
            customPackagePrice: 0,
            _tempId: tempId, 
          },
        ],
      }));
    };
  const isPostLockEditable = (fn) => fn.isLocked === false || postLockNewIds.has(fn._tempId);
    const handleDeleteFunction = (itemId, index) => {
      if (index === 0) return;

      if (itemId && itemId !== 0) {
        DeleteQuotation(itemId)
          .then((response) => {
            FetchGetQuotation();
            response.data?.msg && successMsgPopup(response.data.msg);
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        setQuotationData((prev) => {
          const updated = prev.functions.filter((_, idx) => idx !== index);

          const hasExtra = updated.some((f) => f.isExtraQuotationFunction);
          if (!hasExtra) setIsExtraFunction(false);

          return { ...prev, functions: updated };
        });
      }
    };


    const handleRateBlur = (index) => {
  if (!isOfferRateUser) return;

  const roleId = getUserRoleId();
  const restrictedRole = roleId !== null && roleId !== 1 && roleId !== 2;
  if (!restrictedRole) return;

  const currentFn = quotationData.functions[index];
  const original = originalFunctions.find((f) =>
    currentFn._tempId ? f._tempId === currentFn._tempId : f.id === currentFn.id,
  );

  const actualRate = parseFloat(original?.rate) || 0;
  const newRate = parseFloat(currentFn.rate) || 0;
  const decrease = actualRate - newRate;

  if (decrease > 25) {
    // message.error("You are not eligible to decrease the price by more than ₹45.");
    message.error("You are not eligible to decrease rate from limit");

    handleFunctionChange(index, "rate", actualRate.toString());
  }
};

   const handleFunctionChange = (index, field, value) => {
  setIsEdited(true);
  const newFunctions = [...quotationData.functions];
  const current = { ...newFunctions[index], [field]: value };

  if (
    field === "persons" ||
    field === "rate" ||
    field === "extraTax" ||
    field === "extraPax"
  ) {
    const persons = parseFloat(current.persons) || 0;
    const extraPax = parseFloat(current.extraPax) || 0;
    const rate =
      current.customPackagePrice > 0 && field !== "rate"
        ? parseFloat(current.customPackagePrice)
        : parseFloat(current.rate) || 0;
    const extraTax = parseFloat(current.extraTax) || 0;

    const effectivePax = persons + extraPax;
    const base = effectivePax * rate;
    const taxRate = (base * extraTax) / 100;
    const total = base + taxRate;

    newFunctions[index] = {
      ...current,
      rate: rate.toString(),
      taxRate: taxRate % 1 === 0 ? taxRate.toString() : taxRate.toFixed(2),
      totalPrice: total % 1 === 0 ? total.toString() : total.toFixed(2),
    };
  } else if (field === "taxRate") {
    const persons = parseFloat(current.persons) || 0;
    const extraPax = parseFloat(current.extraPax) || 0;
    const effectivePax = persons + extraPax;
    const rate = parseFloat(current.rate) || 0;
    const base = effectivePax * rate;
    const taxRateVal = parseFloat(value) || 0;
    const extraTax = base > 0 ? (taxRateVal / base) * 100 : 0;
    const total = base + taxRateVal;

    newFunctions[index] = {
      ...current,
      taxRate: value,
      extraTax:
        extraTax % 1 === 0 ? extraTax.toString() : extraTax.toFixed(2),
      totalPrice: total % 1 === 0 ? total.toString() : total.toFixed(2),
    };
  } else if (field === "totalPrice") {
    const persons = parseFloat(current.persons) || 0;
    const extraPax = parseFloat(current.extraPax) || 0;
    const effectivePax = persons + extraPax;
    const rate = parseFloat(current.rate) || 0;
    const base = effectivePax * rate;
    const total = parseFloat(value) || 0;

    if (base > 0) {
      const taxRateVal = total - base;
      const extraTax = (taxRateVal / base) * 100;

      newFunctions[index] = {
        ...current,
        totalPrice: value,
        taxRate:
          taxRateVal >= 0
            ? taxRateVal % 1 === 0
              ? taxRateVal.toString()
              : taxRateVal.toFixed(2)
            : "0",
        extraTax:
          extraTax >= 0
            ? extraTax % 1 === 0
              ? extraTax.toString()
              : extraTax.toFixed(2)
            : "0",
      };
    } else {
      // No pax×rate base yet (fresh row) — total price is just a flat entry,
      // don't attribute the whole amount to taxRate/extraTax
      newFunctions[index] = {
        ...current,
        totalPrice: value,
      };
    }
  }
  else if (field === "offeredRate") {
     
      newFunctions[index] = { ...current, offeredRate: value };
    } else {
    newFunctions[index] = current;
  }

  setQuotationData((prev) => ({ ...prev, functions: newFunctions }));
};

    const handleNotesChange = (e) => {
      const value = e.target.value;
      setQuotationData((prev) => ({ ...prev, notes: value }));
      setIsEdited(true);
    };

    const buildPayload = () => {
      let Id = localStorage.getItem("userId");
      const allFunctions = searchTerm.trim()
        ? originalFunctions
        : quotationData.functions;

      const subtotal = quotationData.functions.reduce((sum, fn) => {
        const total = parseFloat(fn.totalPrice) || 0;
        return sum + total;
      }, 0);

      const transportAmount = parseFloat(transportationCharge) || 0;

      const discount = parseFloat(
        quotationData.taxDetails.find((tax) => tax.label === "Discount")
          ?.amount || 0,
      );

      const amountAfterDiscount = subtotal + transportAmount - discount;


       const foodTaxPercentage = parseFloat(foodTax) || 0;
      const serviceTaxPercentage = parseFloat(serviceTax) || 0;
      const vatTaxPercentage = parseFloat(vatTax) || 0;

      const foodTaxAmnt = parseFloat(foodTaxAmount) || 0;
const serviceTaxAmnt = parseFloat(serviceTaxAmount) || 0;
const vatTaxAmnt = parseFloat(vatTaxAmount) || 0;

      const roundOff = parseFloat(
        quotationData.taxDetails.find((tax) => tax.label === "Round Off")
          ?.amount || 0,
      );

      const cgstDetail = quotationData.taxDetails.find(
        (tax) => tax.label === "CGST",
      );
      const sgstDetail = quotationData.taxDetails.find(
        (tax) => tax.label === "SGST",
      );
      const igstDetail = quotationData.taxDetails.find(
        (tax) => tax.label === "IGST",
      );

      const cgstPercentage = parseFloat(cgstDetail?.percentage || 0);
      const sgstPercentage = parseFloat(sgstDetail?.percentage || 0);
      const igstPercentage = parseFloat(igstDetail?.percentage || 0);

const gstBase = parseFloat(chequePayment) || 0;
const cgstAmnt = (gstBase * cgstPercentage) / 100;
const sgstAmnt = (gstBase * sgstPercentage) / 100;
const igstAmnt = (gstBase * igstPercentage) / 100;
      const totalAmount =
        amountAfterDiscount + cgstAmnt + sgstAmnt + igstAmnt + roundOff;


     const foodTaxTotalAmnt = (foodTaxAmnt * foodTaxPercentage) / 100;
const serviceTaxTotalAmnt = (serviceTaxAmnt * serviceTaxPercentage) / 100;
const vatTaxTotalAmnt = (vatTaxAmnt * vatTaxPercentage) / 100;

const grandTotal =
  amountAfterDiscount +
  cgstAmnt + sgstAmnt + igstAmnt +
  foodTaxTotalAmnt + serviceTaxTotalAmnt + vatTaxTotalAmnt +
  roundOff ;


      const payments = (quotationData.advancePayments || [])
        .filter((p) => parseFloat(p.amount) > 0)
        .map((p) => ({
          id: p.id || 0,
          advancePayment: parseFloat(p.amount) || 0,
          advancePaymentDate: p.date ? p.date.format("DD/MM/YYYY hh:mm A") : null,
          advancePaymentNotes: p.description || "",
          paymentMode: p.paymentMode || "",
      bankId: p.paymentMode === "Bank Transfer" ? Number(p.bankId) || null : null,
      cashAccountId: p.paymentMode === "Cash" ? Number(p.cashAccountId) || null : null,
        }));

      const totalPaid = (quotationData.advancePayments || []).reduce((sum, p) => {
        const val = parseFloat(p.amount) || 0;
        return sum + val;
      }, 0);

      const sumAdvance = payments.reduce(
        (s, p) => s + (p.advancePayment || 0),
        0,
      );

     
      
      const remainingAmount = Math.max(0, grandTotal - sumAdvance);

    
      let formattedQuotationDate;
      if (
        quotationDate &&
        quotationDate !== "Invalid Date" &&
        quotationDate.trim() !== ""
      ) {
        const parsed = dayjs(quotationDate, "YYYY-MM-DD");
        if (parsed.isValid()) {
          formattedQuotationDate = parsed.format("DD/MM/YYYY");
        } else {
          formattedQuotationDate =
            quotationData.QuotationDate || dayjs().format("DD/MM/YYYY");
        }
      } else if (quotationData.QuotationDate) {
        const parsed = dayjs(quotationData.QuotationDate, "DD/MM/YYYY");
        if (parsed.isValid()) {
          formattedQuotationDate = parsed.format("DD/MM/YYYY");
        } else {
          const parsedISO = dayjs(quotationData.QuotationDate);
          formattedQuotationDate = parsedISO.isValid()
            ? parsedISO.format("DD/MM/YYYY")
            : dayjs().format("DD/MM/YYYY");
        }
      } else {
        formattedQuotationDate = dayjs().format("DD/MM/YYYY");
      }

      const poojaRoomRemark = eventRemarks.find(
        (r) => r.type?.toUpperCase() === "POOJA_ROOM",
      );
      const ironRemark = eventRemarks.find(
        (r) => r.type?.toUpperCase() === "IRON",
      );
      const venueRemark = eventRemarks.find(
        (r) => r.type?.toUpperCase() === "VENUE",
      );

      
      

      const resolvedPoojaRooms =
        poojaRoomRemark?.nameEnglish ||
        poojaRooms ||
        quotationData.poojaRooms ||
        "";
      const resolvedIronService =
        ironRemark?.nameEnglish || ironService || quotationData.ironService || "";
      const resolvedVenueRemark =
        venueRemark?.nameEnglish || quotationData.venueRemark || "";

      const payload = {
        eventFunctionQuotationPayments: payments,
        discount: discount,
         discountPct: Number(
    parseFloat(
      quotationData.taxDetails.find((t) => t.label === "Discount")?.percentage || 0,
    ) || 0,
  ).toFixed(2), 
  isDiscountPercent: isDiscountPercentage,
        eventId: parseInt(eventId),
        isDecore: isDecor,
        functionQuotationItems: allFunctions.map((fn) => ({
          defaultFunctionId: fn.isExtraQuotationFunction
            ? fn.defaultFunctionId
            : fn.defaultFunctionId || null,
          isAddons: fn.isAddons || false,
          itemId: fn.itemId || null,
          menuCatId: fn.menuCatId || null,
          amount: parseFloat(fn.totalPrice) || 0,
          extraPax: parseInt(fn.extraPax) || 0,
          options: fn.options || "",
          functionDate: fn.date ? fn.date.format("DD/MM/YYYY hh:mm A") : null,
          functionName: fn.name,
          id: fn.id || 0,
          pax: parseInt(fn.persons) || 0,
          ratePerPlate: parseFloat(fn.rate) || 0,
          offeredRate: parseFloat(fn.offeredRate) || 0,
          isEventFunction: fn.isExtraQuotationFunction
            ? false
            : fn.isFromQuotationItems === true,
          isLocked: fn.isLocked || false,
          eventFunctionId: fn.isExtraQuotationFunction
            ? null
            : fn.eventFunctionId || 0,
           extraTax: fn.isExtraQuotationFunction ? 0 : (parseFloat(fn.extraTax) || 0),
  taxRate: fn.isExtraQuotationFunction ? 0 : (parseFloat(fn.taxRate) || 0),
          customPackageId: fn.customPackageId ? Number(fn.customPackageId) : null,
          customPackageName: fn.customPackageName || "",
          extraChargesId: fn.extraChargesId || null,
  isExtraCharges: fn.isExtraCharges || false,
          customPackagePrice: fn.customPackagePrice
            ? Number(fn.customPackagePrice)
            : 0,
        })),
        isLocked: isLocked,
        subTotal: parseFloat(subtotal),
        grandTotal: grandTotal,
        cgst: `${cgstPercentage}`,
        cgstAmnt: cgstAmnt,
        sgst: `${sgstPercentage}`,
        sgstAmnt: sgstAmnt,
        igst: `${igstPercentage}`,
        igstAmnt: igstAmnt,
        remainingAmount: remainingAmount,
        roundOff: roundOff,
        totalAmount: totalPaid,
        userId: parseInt(Id),
        isExtraFunction: isExtraFunction,
        billingname: billingName || quotationData.billingname || "",
        duedate: dueDate
          ? dueDate.format("DD/MM/YYYY")
          : quotationData.duedate || "",
        gstnumber: gstNumber || quotationData.gstnumber || "",
        quotationdate: formattedQuotationDate,
        cashPayment: cashPayment || 0,
        poojaRooms: resolvedPoojaRooms,
        ironService: resolvedIronService,
        venueRemark: resolvedVenueRemark,
        venueTotal: parseFloat(venueTotal) || 0,
        chequePayment:chequePayment || 0,
        transportation: transportAmount || 0,
        notes: quotationData.notes || "",
        foodTax: `${foodTaxPercentage}`,
foodTaxAmount: foodTaxAmnt,
foodTaxTotalAmount: (foodTaxAmnt * foodTaxPercentage) / 100,
serviceTax: `${serviceTaxPercentage}`,
serviceTaxAmount: serviceTaxAmnt,
serviceTaxTotalAmount: (serviceTaxAmnt * serviceTaxPercentage) / 100,
vatTax: `${vatTaxPercentage}`,
vatTaxAmount: vatTaxAmnt,
vatTaxTotalAmount: (vatTaxAmnt * vatTaxPercentage) / 100,
      };

      return payload;
    };

    const handleSaveNotes = () => {
  if (savingQuotationRef.current) return;
  savingQuotationRef.current = true;
  setIsSavingQuotation(true);

  const payload = buildPayload();
  if (!quotationId) {
    setIsSaving(true);
    console.error("No quotationId available to save notes");
    Swal.fire({
      title: "Error",
      text: "No quotation ID found. Please refresh and try again.",
      icon: "error",
      background: "#fff5f5",
      color: "#7a0000",
      confirmButtonText: "Okay",
      confirmButtonColor: "#d33",
      customClass: {
        popup: "rounded-2xl shadow-xl",
        title: "text-2xl font-bold",
        confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
      },
    });
    savingQuotationRef.current = false;
    setIsSavingQuotation(false);
    return;
  }

  UpdateQuotation(quotationId, payload, isDecor ? true : false)
    .then((response) => {
      if (response?.data?.success === true) {
        const successMsg =
          response?.data?.msg &&
          typeof response.data.msg === "string" &&
          response.data.msg.trim() !== ""
            ? response.data.msg
            : "Quotation saved successfully!";

        sendQuotationLog({
          status: "SAVE_SUCCESS",
          eventId,
          quotationId,
          quotationData,
          isDecor,
        });

        Swal.fire({
          title: "Success",
          text: successMsg,
          icon: "success",
          background: "#f5faff",
          color: "#003f73",
          confirmButtonText: "Okay",
          confirmButtonColor: "#005BA8",
          showClass: {
            popup: `
            animate__animated
            animate__fadeInDown
            animate__faster
          `,
          },
          hideClass: {
            popup: `
            animate__animated
            animate__fadeOutUp
            animate__faster
          `,
          },
          customClass: {
            popup: "rounded-2xl shadow-xl",
            title: "text-2xl font-bold",
            confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
          },
        });

       setIsEdited(false);
        setSearchTerm("");
        setBillingName("");
        setGstNumber("");
        setDueDate(null);
        setPostLockNewIds(new Set());
        initialEventRemarksRef.current = JSON.parse(JSON.stringify(eventRemarks)); // ← reset remarks baseline
        FetchGetQuotation();
      } else {
        const errorMsg = getErrorMessage(
          { response: { data: response?.data } },
          "Failed to save quotation. Please try again.",
        );
        sendQuotationLog({
          status: "SAVE_ERROR",
          eventId,
          quotationId,
          quotationData,
          isDecor,
          extra: errorMsg,
        });

        Swal.fire({
          title: "Save Failed",
          text: errorMsg,
          icon: "error",
          background: "#fff5f5",
          color: "#7a0000",
          confirmButtonText: "Okay",
          confirmButtonColor: "#d33",
          customClass: {
            popup: "rounded-2xl shadow-xl",
            title: "text-2xl font-bold",
            confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
          },
        });
      }
    })
    .catch((error) => {
      const beMsg = getErrorMessage(
        error,
        "Something went wrong while saving quotation",
      );

      sendQuotationLog({
        status: "SAVE_ERROR",
        eventId,
        quotationId,
        quotationData,
        isDecor,
        extra: beMsg,
      });
      Swal.fire({
        title: "Save Failed",
        text: beMsg,
        icon: "error",
        background: "#fff5f5",
        color: "#7a0000",
        confirmButtonText: "Okay",
        confirmButtonColor: "#d33",
        customClass: {
          popup: "rounded-2xl shadow-xl",
          title: "text-2xl font-bold",
          confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
        },
      });
    })
    .finally(() => {
      savingQuotationRef.current = false;
      setIsSavingQuotation(false);
    });
};

    const saveNotes = () => {
      const payload = buildPayload();

      if (!quotationId) {
        return Promise.reject("No quotationId");
      }

      return UpdateQuotation(quotationId, payload,isDecor ? true : false).then((response) => {
        if (
          response?.data?.msg?.toLowerCase().includes("successfully") ||
          response?.data?.success === true
        ) {
          setIsEdited(false);
          setSearchTerm("");
          setPostLockNewIds(new Set());
        }
        return response;
      });
    };

    const handleSaveAndOpenPdf = async () => {
  if (savingQuotationRef.current || loadingPdf) return;
  try {
    savingQuotationRef.current = true;
    setLoadingPdf(true);
    await saveNotes();
    await FetchGetQuotation();
    setInvoiceThemeKey((k) => k + 1);
    setIsInvoiceThemeOpen(true);
  } catch (error) {
    console.error("Save then open PDF failed", error);
    message.error("Failed to save before printing");
  } finally {
    setLoadingPdf(false);
    savingQuotationRef.current = false;
  }
};
  const handleAddAdvancePayment = () => {
    setQuotationData((prev) => ({
      ...prev,
      advancePayments: [
        ...prev.advancePayments,
        {
          id: 0,
          amount: "",
          date: null,
          description: "",
          paymentMode: "",
          bankId: null,
          cashAccountId: null,
        },
      ],
    }));
    setIsEdited(true);
  };

 const handleRemoveAdvancePayment = (idx) => {
  const payment = quotationData.advancePayments[idx];

  const removeLocally = () => {
    setQuotationData((prev) => {
      const copy = [...prev.advancePayments];
      copy.splice(idx, 1);
      return { ...prev, advancePayments: copy };
    });
    setIsEdited(true);
  };

  // Not yet saved to backend — just drop it from state
  if (!payment?.id || payment.id === 0) {
    removeLocally();
    return;
  }

  DeleteQuotationAdvancePayment(payment.id)
    .then((response) => {
      removeLocally();
      const msg = response?.data?.msg;
      if (msg) successMsgPopup(msg);
    })
    .catch((error) => {
      console.error("Failed to delete advance payment:", error);
      Swal.fire({
        title: "Error",
        text: getErrorMessage(error, "Failed to delete advance payment"),
        icon: "error",
        confirmButtonColor: "#d33",
        background: "#fff5f5",
        color: "#7a0000",
        customClass: {
          popup: "rounded-2xl shadow-xl",
          title: "text-2xl font-bold",
          confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
        },
      });
    });
};
    const handleAdvancePaymentChange = (idx, field, value) => {
      setIsEdited(true);
      setQuotationData((prev) => {
        const list = [...prev.advancePayments];
        list[idx] = { ...list[idx], [field]: value };
        return { ...prev, advancePayments: list };
      });
    };

    const handleAddSecurityDeposit = () => {
  setSecurityDeposits((prev) => [
    ...prev,
    {
      id: -1,
      amount: "",
      description: "",
      paymentMode: "",
      bankAccountId: null,
      entryType: "RECEIPT",
      cashAccountId: null,
      date: null,
    },
  ]);
};

const handleSecurityDepositChange = (idx, field, value) => {
  setSecurityDeposits((prev) => {
    const list = [...prev];
    list[idx] = { ...list[idx], [field]: value };
    return list;
  });
};

const handleSaveSecurityDeposit = async (idx) => {
  const dep = securityDeposits[idx];

  if (!dep.amount || parseFloat(dep.amount) <= 0) {
    message.error("Please enter a valid amount");
    return;
  }
  if (!dep.paymentMode) {
    message.error("Please select a payment mode");
    return;
  }

  setSavingDepositIdx(idx);

  const payload = {
    id: dep.id && dep.id > 0 ? dep.id : -1,
    eventId: Number(eventId),
    quotationId: quotationId,
    userId: Number(userId),
    amount: parseFloat(dep.amount) || 0,
    description: dep.description || "",
    paymentMode: dep.paymentMode === "Cash" ? "CASH" : "BANK_TRANSFER",
     entryType: dep.entryType === "PAYMENT" ? "PAYMENT" : "RECEIPT",
    bankAccountId:
      dep.paymentMode === "Bank Transfer" ? Number(dep.bankAccountId) || null : null,
    cashAccountId:
      dep.paymentMode === "Cash" ? Number(dep.cashAccountId) || null : null,
    paymentDateTime: dep.date ? dep.date.format("DD/MM/YYYY hh:mm:ss A") : null,
  };

  try {
    const res = await addupdateSecurityDeposit(payload);
    if (res?.data?.success !== false) {
      const savedId = res?.data?.data?.id ?? res?.data?.id;
      setSecurityDeposits((prev) => {
        const list = [...prev];
        list[idx] = { ...list[idx], id: savedId ?? list[idx].id };
        return list;
      });
      message.success(res?.data?.msg || "Security deposit saved");
    } else {
      message.error(res?.data?.msg || "Failed to save security deposit");
    }
  } catch (error) {
    message.error(getErrorMessage(error, "Failed to save security deposit"));
  } finally {
    setSavingDepositIdx(null);
  }
};

const handleRemoveSecurityDeposit = (idx) => {   // ← THIS function, replace its body
  const dep = securityDeposits[idx];

  const removeLocally = () => {
    setSecurityDeposits((prev) => prev.filter((_, i) => i !== idx));
  };

  if (!dep?.id || dep.id <= 0) {
    removeLocally();
    return Promise.resolve();
  }

  return deleteSecurityDeposit(dep.id)
    .then((response) => {
      removeLocally();
      message.success(response?.data?.msg || "Security deposit deleted");
    })
    .catch((error) => {
      message.error(getErrorMessage(error, "Failed to delete security deposit"));
      throw error;
    });
};

  const handleTaxChange = (index, field, value) => {
  setIsEdited(true);
  const newTaxDetails = [...quotationData.taxDetails];

const baseAmount = parseFloat(chequePayment) || 0; 

  const discountBase =
    quotationData.functions.reduce(
      (sum, fn) => sum + (parseFloat(fn.totalPrice) || 0),
      0,
    ) + (parseFloat(transportationCharge) || 0);

  if (
    field === "percentage" &&
    (newTaxDetails[index].label === "CGST" ||
      newTaxDetails[index].label === "SGST" ||
      newTaxDetails[index].label === "IGST")
  ) {
    newTaxDetails[index].percentage = value;
    const percentage = parseFloat(value) || 0;
    const calculatedAmount = (baseAmount * percentage) / 100;
    newTaxDetails[index].amount = calculatedAmount;
  } else if (field === "percentage" && newTaxDetails[index].label === "Discount") {
    // Discount percentage mode: base is subtotal + transportation (pre-discount)
    newTaxDetails[index].percentage = value;
    const percentage = parseFloat(value) || 0;
    const calculatedAmount = (discountBase * percentage) / 100;
    newTaxDetails[index].amount = calculatedAmount.toFixed(2);
  } else if (field === "amount") {
    newTaxDetails[index].amount = value;

    if (
      baseAmount > 0 &&
      (newTaxDetails[index].label === "CGST" ||
        newTaxDetails[index].label === "SGST" ||
        newTaxDetails[index].label === "IGST")
    ) {
      const enteredAmount = parseFloat(value) || 0;
      const percentage = (enteredAmount / baseAmount) * 100;
      newTaxDetails[index].percentage = percentage.toFixed(2);
    } else if (
      newTaxDetails[index].label === "CGST" ||
      newTaxDetails[index].label === "SGST" ||
      newTaxDetails[index].label === "IGST"
    ) {
      newTaxDetails[index].percentage = "0";
    } else if (newTaxDetails[index].label === "Discount" ) {
      
      if (discountBase > 0) {
        const enteredAmount = parseFloat(value) || 0;
        const percentage = (enteredAmount / discountBase) * 100;
        newTaxDetails[index].percentage = percentage.toFixed(2);
      } else {
        newTaxDetails[index].percentage = "0";
      }
    }
  } else {
    newTaxDetails[index][field] = value;
  }

  setQuotationData((prev) => ({
    ...prev,
    taxDetails: newTaxDetails,
  }));

  // keeps cash/cheque split in sync with the discount — unchanged
  if (newTaxDetails[index].label === "Discount") {
    const subtotal = quotationData.functions.reduce(
      (sum, fn) => sum + (parseFloat(fn.totalPrice) || 0),
      0,
    );
    const transportAmount = parseFloat(transportationCharge) || 0;
    const newDiscount = parseFloat(newTaxDetails[index].amount) || 0;
    const newAmountAfterDiscount = subtotal + transportAmount - newDiscount;

    const cash = parseFloat(cashPayment) || 0;
    const newCheque = parseFloat(
      Math.max(0, newAmountAfterDiscount - cash).toFixed(2),
    );
    setChequePayment(newCheque);
  }
};

    const handleGenrateReport = () => {
      setLoadingPdf(true);

      const userId = localStorage.getItem("userId");

      GetQuotationReport(eventId, userId, 0)
        .then((response) => {
          if (response.data) {
            const pdfPath = response.data?.report_path;
            setPdfUrl(pdfPath);
            setIsPdfModalVisible(true);
          }
        })
        .catch((error) => {
          console.error("Error generating report:", error);
          Swal.fire({
            title: "Error",
            text: "Failed to generate PDF report",
            icon: "error",
            confirmButtonColor: "#005BA8",
          });
        })
        .finally(() => {
          setLoadingPdf(false);
        });
    };

    const handleWhatsAppShare = (pdfUrl) => {
      const name = quotationData.partyName || "there";

      let mobile = quotationData.mobileNumber || "";

      const message = `Hi ${name},
      Hope you're doing well!
      
      Please find the quotation PDF below:
      ${pdfUrl}
      
      Thanks!`;

      const url = `https://api.whatsapp.com/send?phone=${mobile}&text=${encodeURIComponent(message)}`;

      window.open(url, "_blank", "noopener,noreferrer");
    };

  const handleCopyToInvoice = async () => {
  if (!quotationId) {
    Swal.fire({
      title: "Error",
      text: "Quotation not loaded yet. Please wait.",
      icon: "error",
      confirmButtonColor: "#005BA8",
    });
    return;
  }

  // ── If there are unsaved changes, save them first so the API has the latest numbers ──
  if (isEdited) {
    const saveFirst = await Swal.fire({
      title: "Unsaved Changes",
      text: "You have unsaved changes. Save before copying to invoice?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#005BA8",
      cancelButtonColor: "#d33",
      confirmButtonText: "Save & Continue",
      cancelButtonText: "Cancel",
      background: "#f5faff",
      color: "#003f73",
      customClass: {
        popup: "rounded-2xl shadow-xl",
        title: "text-2xl font-bold",
        confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
        cancelButton: "px-6 py-2 text-white font-semibold rounded-lg",
      },
    });

    if (!saveFirst.isConfirmed) return;

    try {
      await saveNotes(); // persists current form state to backend
    } catch (err) {
      Swal.fire({
        title: "Save Failed",
        text: getErrorMessage(err, "Could not save changes before copying."),
        icon: "error",
        confirmButtonColor: "#d33",
      });
      return;
    }
  }

  // ── Always re-fetch from the API so we calculate off server data, not stale frontend state ──
  Swal.fire({
    title: "Preparing Invoice...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    await FetchGetQuotation(); // refreshes quotationData, totals, foodTax/serviceTax/vatTax etc. from server
  } catch (err) {
    Swal.close();
    Swal.fire({
      title: "Error",
      text: "Failed to fetch latest quotation data.",
      icon: "error",
      confirmButtonColor: "#005BA8",
    });
    return;
  }

  Swal.close();

  const result = await Swal.fire({
    title: "Copy to Invoice?",
    text: "Do you want to copy this quotation data to the invoice?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Copy",
    cancelButtonText: "No",
    confirmButtonColor: "#005BA8",
    cancelButtonColor: "#d33",
    background: "#f5faff",
    color: "#003f73",
    customClass: {
      popup: "rounded-2xl shadow-xl",
      title: "text-2xl font-bold",
      confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
      cancelButton: "px-6 py-2 text-white font-semibold rounded-lg",
    },
  });

  if (result.isConfirmed) {
    navigate(`/add-invoice/${eventId}`, {
      state: {
        eventId,
        fromQuotation: true,
        quotationId: quotationId,
        quotationData: null, // Add Invoice page fetches fresh by quotationId — doesn't reuse frontend-calculated values
        isDecor: isDecor,
      },
    });
  }
};

 const handleLockQuotation = async (lock = true) => {
  if (!quotationId) return;

  if (isEdited) {
    Swal.fire({
      title: "Unsaved Changes",
      text: "You have unsaved changes. Please save your changes before locking the quotation.",
      icon: "warning",
      confirmButtonColor: "#005BA8",
      background: "#f5faff",
      color: "#003f73",
      confirmButtonText: "Okay",
      customClass: {
        popup: "rounded-2xl shadow-xl",
        title: "text-2xl font-bold",
        confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
      },
    });
    return;
  }

  if (lock && isLocked) {
    Swal.fire({
      title: "Already Locked",
      text: "This quotation is already locked.",
      icon: "info",
      confirmButtonColor: "#005BA8",
      background: "#f5faff",
      color: "#003f73",
      customClass: {
        popup: "rounded-2xl shadow-xl",
        title: "text-2xl font-bold",
        confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
      },
    });
    return;
  }

  if (!lock && !isLocked) {
    Swal.fire({
      title: "Already Unlocked",
      text: "This quotation is already unlocked.",
      icon: "info",
      confirmButtonColor: "#005BA8",
      background: "#f5faff",
      color: "#003f73",
      customClass: {
        popup: "rounded-2xl shadow-xl",
        title: "text-2xl font-bold",
        confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
      },
    });
    return;
  }

  const result = await Swal.fire({
    title: lock ? "Lock Quotation?" : "Unlock Quotation?",
    text: lock
      ? "Once locked, this quotation cannot be edited again."
      : "This will allow editing this quotation again.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#005BA8",
    cancelButtonColor: "#d33",
    confirmButtonText: lock ? "Yes, Lock" : "Yes, Unlock",
    cancelButtonText: "Cancel",
    background: "#f5faff",
    color: "#003f73",
    customClass: {
      popup: "rounded-2xl shadow-xl",
      title: "text-2xl font-bold",
      confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
      cancelButton: "px-6 py-2 text-white font-semibold rounded-lg",
    },
  });

  if (!result.isConfirmed) return;

  try {
    const res = await upadtelockinquotation(quotationId, lock);
    const resData = res?.data;

    if (resData?.success === true) {
      setIsLocked(lock);
      await FetchGetQuotation();
      sendQuotationLog({
        status: lock ? "LOCK_SUCCESS" : "UNLOCK_SUCCESS",
        eventId,
        quotationId,
        quotationData,
        isDecor,
      });
      Swal.fire({
        title: lock ? "Locked!" : "Unlocked!",
        text:
          resData?.msg ||
          (lock
            ? "This quotation has been locked."
            : "This quotation has been unlocked."),
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
        background: "#f5faff",
        color: "#003f73",
      });
    } else {
      sendQuotationLog({
        status: lock ? "LOCK_ERROR" : "UNLOCK_ERROR",
        eventId,
        quotationId,
        quotationData,
        isDecor,
        extra: resData?.msg,
      });

      Swal.fire({
        title: lock ? "Cannot Lock" : "Cannot Unlock",
        text: resData?.msg || `Failed to ${lock ? "lock" : "unlock"} quotation.`,
        icon: "error",
        confirmButtonColor: "#d33",
        background: "#fff5f5",
        color: "#7a0000",
        customClass: {
          popup: "rounded-2xl shadow-xl",
          title: "text-2xl font-bold",
          confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
        },
      });
    }
  } catch (err) {
    sendQuotationLog({
      status: lock ? "LOCK_ERROR" : "UNLOCK_ERROR",
      eventId,
      quotationId,
      quotationData,
      isDecor,
      extra: getErrorMessage(err),
    });

    Swal.fire({
      title: "Error",
      text: getErrorMessage(err, `Failed to ${lock ? "lock" : "unlock"} quotation`),
      icon: "error",
      confirmButtonColor: "#d33",
      background: "#fff5f5",
      color: "#7a0000",
      customClass: {
        popup: "rounded-2xl shadow-xl",
        title: "text-2xl font-bold",
        confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
      },
    });
  }
};
// Add this helper near your other handlers (e.g. near formatAmount)
const isValidTwoDecimal = (value) => /^\d*\.?\d{0,2}$/.test(value);

  const handleOpenHistory = async () => {
    setIsHistoryOpen(true);
    setHistoryLoading(true);
    try {
      const email = getUserEmail();
      if (!email) {
        setHistoryLogs([]);
        return;
      }
      const res = await GetUserlogs(email, "", "", eventId);
      const allLogs = res?.data?.data || [];

      const prefix = isDecor ? "DecorQuotation" : "MenuQuotation";
      const targetTypes = new Set([
        `${prefix}_Save`,
        `${prefix}_Save_Error`,
        `${prefix}_Lock`,
        `${prefix}_Lock_Error`,
      ]);

      const filtered = Array.isArray(allLogs)
        ? allLogs.filter((log) => targetTypes.has(log.eventType))
        : [];

      setHistoryLogs(filtered);
    } catch (err) {
      console.error("Failed to fetch quotation history:", err);
      setHistoryLogs([]);
    } finally {
      setHistoryLoading(false);
    }
  };

    return (
      <Fragment>
        <style>
          {`
              .user-access-bg {
                background-image: url('${toAbsoluteUrl("/images/bg_01.png")}');
              }
              .dark .user-access-bg {
                background-image: url('${toAbsoluteUrl("/images/bg_01_dark.png")}');
              }
              
              /* Custom responsive table styles */
              .responsive-table-container {
                width: 100%;
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
              }
              
              .responsive-table {
                min-width: 100%;
                width: max-content;
              }
              
              /* Responsive breakpoints */
              @media (max-width: 1200px) {
                .responsive-table {
                  min-width: 1000px;
                }
              }
              
              @media (max-width: 768px) {
                .responsive-table {
                  min-width: 800px;
                }
              }
            `}
        </style>

        <div className="w-full overflow-x-hidden">
          <Container>
            <div className="gap-2 mb-3">
              <Breadcrumbs
                items={[
                  {
                    title: intl.formatMessage({
                      id: "COMMON.QUOTATION",
                      defaultMessage: "Quotation ",
                    }),
                  },
                ]}
              />
            </div>

            {/* Event Details */}
            <div className="card min-w-full rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg mb-5">
              <div className="flex flex-col lg:flex items-start justify-between p-4 gap-4">

                <div className="w-full  flex justify-between gap-2">

  
  {/* Row 2: Menu Planning + Menu Execution */}
  <div className="flex flex-col lg:flex-row gap-2">
    <button
      onClick={() => navigate(`/menu-preparation/${eventId}`)}
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
    >
      <i className="ki-filled ki-menu text-primary text-sm"></i>
      <FormattedMessage
        id="MENU_PLANNING.BUTTON"
        defaultMessage="2. Menu Planning"
      />
    </button>

     {/* Row 3: Decor Quotation / Menu Quotation toggle */}
  {canAccessDecor && (
    <div className="flex flex-col lg:flex-row gap-2">
      {isDecor ? (
        <button
          className="btn btn-primary w-full lg:w-auto"
          onClick={() => {
            navigate(`/quotation/${eventId}?type=menu`);
          }}
        >
          <i className="ki-filled ki-notepad"></i>
    Decor Quotation
        </button>
      ) : (
        <button
          className="btn btn-primary w-full lg:w-auto"
          onClick={() => {
            navigate(`/quotation/${eventId}?type=decor`);
          }}
        >
          <i className="ki-filled ki-notepad"></i>
          Decor Quotation
        </button>
      )}
    </div>
  )}

  
    <Link to={`/edit-event/${eventId}`}>
     <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors">
       <i className="ki-filled ki-notepad-edit me-1"></i>
       <FormattedMessage
         id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_EDIT_EVENT_BUTTON"
         defaultMessage="Edit Event"
       />
     </button>
   </Link>
  </div>

 <div className="flex flex-col lg:flex-row gap-2">

  {canAccessecuritydeposit && (
  <button
    className="btn btn-primary w-full lg:w-auto"
    onClick={() => setIsSecurityDepositOpen(true)}
  >
    <i className="ki-filled ki-shield-tick"></i>
    Security Deposit
    
  </button>
)}
    {permissionQuotation.add && (
      <button
        className="btn btn-primary w-full lg:w-auto"
        onClick={handleCopyToInvoice}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <FormattedMessage
          id="COMMON.COPY_TO_INVOICE"
          defaultMessage="Copy to Invoice"
        />
      </button>
    )}  

  <button
      className="btn btn-primary w-full lg:w-auto"
      onClick={handleSaveAndOpenPdf}
      disabled={loadingPdf || isSavingQuotation}
    >
      {loadingPdf ? (
        <>
          <i className="ki-filled ki-loading animate-spin"></i>
          <FormattedMessage
            id="COMMON.LOADING"
            defaultMessage="Loading..."
          />
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
            <rect x="6" y="14" width="12" height="8" rx="1" />
          </svg>
          <FormattedMessage
            id="COMMON.PRINT"
            defaultMessage="Print"
          />
        </>
      )}
    </button>


   {permissionQuotation.add && (
      <button
        className="btn btn-success w-full sm:w-auto"
        onClick={handleSaveNotes}
        disabled={!isEdited || isSavingQuotation}
      >
        <i className="ki-filled ki-save-2"></i>
        {isSavingQuotation ? (
          <FormattedMessage
            id="COMMON.SAVING"
            defaultMessage="Saving..."
          />
        ) : (
          <FormattedMessage
            id="COMMON.SAVE"
            defaultMessage="Save"
          />
        )}
      </button>
    )}
 </div>

</div>
               
                {/* Right side - Print Button */}
                <div className="flex flex-col gap-3 w-full lg:w-auto">
                  <p className="text-base lg:text-lg font-semibold text-gray-900">
                    <FormattedMessage
                      id="COMMON.EVENT_NAME"
                      defaultMessage="Event Name: "
                    />
                    {quotationData.eventName}
                  </p>

                  {isDecor && (
    <span className="inline-flex items-center gap-1 text-sm font-semibold  text-pink-600 px-2 py-0.5 rounded-full">
      <Sparkles size={12} /> Decor Quotation
    </span>
  )}

                  {/* Grid - Responsive */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                    {/* Party Name */}
                    <div className="flex items-center gap-2">
                      <i className="ki-filled ki-user text-success text-lg"></i>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-gray-600">
                          <FormattedMessage
                            id="COMMON.PARTY_NAME"
                            defaultMessage="Party Name:"
                          />
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {quotationData.partyName}
                        </span>
                      </div>
                    </div>

                    {/* Venue */}
                    <div className="flex items-center gap-2">
                      <i className="ki-filled ki-geolocation-home text-success text-lg"></i>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-gray-600">
                          <FormattedMessage
                            id="COMMON.VENUE_NAME"
                            defaultMessage="Venue Name:"
                          />
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {quotationData.venueName}
                        </span>
                      </div>
                    </div>

                    {/* Event Date */}
                    <div className="flex items-center gap-2">
                      <i className="ki-filled ki-calendar-tick text-success text-lg"></i>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-gray-600">
                          <FormattedMessage
                            id="COMMON.EVENT_DATE"
                            defaultMessage="Event Date:"
                          />
                        </span>
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {quotationData.estimateDate}
                        </span>
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="flex items-center gap-2">
                      <i className="ki-filled ki-phone text-success text-lg"></i>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-gray-600">
                          <FormattedMessage
                            id="COMMON.MOBILE_NUMBER"
                            defaultMessage="Mobile Number:"
                          />
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {quotationData.mobileNumber}
                        </span>
                      </div>
                    </div>

                    {/* Quotation Date */}
                    <div className="flex items-center gap-2">
                      <i className="ki-filled ki-calendar-tick text-success text-lg"></i>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs text-gray-600">
                          <FormattedMessage
                            id="COMMON.QUOTATION_DATE"
                            defaultMessage="Quotation Date:"
                          />
                        </span>

                        <div className="flex items-center gap-2">
                          {!isQuotationDateEditing ? (
                            <>
                              <span className="text-sm font-medium text-gray-900">
                                {quotationData.QuotationDate}
                              </span>
                              <button
                                type="button"
                                className="text-primary hover:text-primary-dark"
                                onClick={() => setIsQuotationDateEditing(true)}
                              >
                                <i className="ki-filled ki-pencil text-sm"></i>
                              </button>
                            </>
                          ) : (
                            <>
                              <input
                                type="date"
                                value={quotationDate}
                                onChange={(e) => {
                                  setQuotationDate(e.target.value);
                                  setIsEdited(true);
                                }}
                                className="input text-sm py-1 px-2"
                                autoFocus
                              />
                              <button
                                type="button"
                                className="text-success"
                                onClick={() => setIsQuotationDateEditing(false)}
                              >
                                <i className="ki-filled ki-check text-sm"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
                    {/* Billing Name */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-700">
                        <FormattedMessage
                          id="COMMON.BILLING_NAME"
                          defaultMessage="Billing Name:"
                        />
                      </label>
                      <input
                        className="input text-sm"
                        type="text"
                        value={billingName || quotationData.billingname}
                        onChange={(e) => {
                          setBillingName(e.target.value);
                          setIsEdited(true);
                        }}
                      />
                    </div>

                    {/* GST Number */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-700">
                        <FormattedMessage
                          id="COMMON.GST_NUMBER"
                          defaultMessage="GST Number:"
                        />
                      </label>
                      <input
                        className="input text-sm"
                        type="text"
                        value={gstNumber || quotationData.gstnumber}
                        onChange={(e) => {
                          setGstNumber(e.target.value);
                          setIsEdited(true);
                        }}
                      />
                    </div>

                    {/* Due Date */}
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-700">
                        <FormattedMessage
                          id="COMMON.DUE_DATE"
                          defaultMessage="Due Date:"
                        />
                      </label>
                      <DatePicker
                        format="DD/MM/YYYY"
                        className="input w-full"
                        value={
                          dueDate ||
                          (quotationData.duedate
                            ? dayjs(quotationData.duedate, "DD/MM/YYYY")
                            : null)
                        }
                        onChange={(date) => {
                          setDueDate(date);
                          setIsEdited(true);
                        }}
                      />
                    </div>

                    {quotationData.banquetHallId !== null && (
                      <>
                        <div className="flex flex-col gap-1">
                          <label className="text-xs font-medium text-gray-700">
                            Banquet Hall
                          </label>
                          <input
                            className="input text-sm"
                            type="text"
                            value={quotationData.banquetHallName || ""}
                            readOnly
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                
               
              </div>
            </div>

            {/* Functions */}
            <div className="card min-w-full mb-9">
              <div className="flex flex-col flex-1">
                {/* Header */}
                <div className="rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg">
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 p-4">
                    {/* Search */}
                    <div className="relative w-full sm:w-auto">
                      <i className="ki-filled ki-magnifier absolute left-3 top-1/2 -translate-y-1/2 text-primary"></i>
                      <input
                        className="input pl-10 w-full sm:w-[300px]"
                        placeholder={intl.formatMessage({
                          id: "COMMON.SEARCH_FUNCTION",
                          defaultMessage: "Search function...",
                        })}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
              {!isDecor && permissionQuotation.add && (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div onClick={() => handleExtraFunctionToggle(!isExtraFunction)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
          ${isExtraFunction ? "bg-primary" : "bg-gray-300"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
          ${isExtraFunction ? "translate-x-5" : "translate-x-0"}`} />
      </div>
      <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
      {loadingExtraFunctions ? (
  <span className="flex items-center gap-1">
    <i className="ki-filled ki-loading animate-spin text-xs"></i>
    <FormattedMessage id="COMMON.LOADING" defaultMessage="Loading..." />
  </span>
) : (
  <FormattedMessage id="COMMON.QUOTATION_FUNCTIONS" defaultMessage="Quotation Functions" />
)}
      </span>
    </label>
  )}

  {permissionQuotation.add && (
    <button className="btn btn-primary w-full sm:w-auto" onClick={handleAddFunction}>
  <i className="ki-filled ki-plus"></i> <FormattedMessage id="COMMON.ADD_FUNCTION" defaultMessage="Add Function" />
</button>
  )}

  {/* Lock button — HIDE for decor */}
  {!isDecor && permissionQuotation.add && (
  <button
    className={`btn w-full sm:w-auto ${isLocked ? "btn-danger" : "btn-primary"}`}
    onClick={() => handleLockQuotation(!isLocked)}
    disabled={!quotationId}
  >
    {isLocked ? <Unlock size={16} /> : <Lock size={16} />}
    {isLocked ? (
      <FormattedMessage id="COMMON.UNLOCK" defaultMessage="Unlock" />
    ) : (
      <FormattedMessage id="COMMON.LOCK" defaultMessage="Lock" />
    )}
  </button>
)}

  {/* {permissionQuotation.view && (
  <button className="btn btn-light w-full sm:w-auto" onClick={handleOpenHistory}>
  <i className="ki-filled ki-time"></i>
  <FormattedMessage id="COMMON.HISTORY" defaultMessage="History" />
</button>
  )} */}

                    </div>
                  </div>
                </div>

                {/* Table Header - Desktop Only */}
            <div className="hidden md:flex items-center justify-between bg-gray-100 font-bold border-y border-gray-200 py-3 px-4">
  <div className="text-sm font-semibold text-gray-900 w-12">
    <FormattedMessage id="COMMON.NO" defaultMessage="No." />
  </div>
  <div className="text-sm font-semibold text-gray-900 flex-1 px-2">
    <FormattedMessage id="COMMON.FUNCTION" defaultMessage="Function" />
  </div>

  {!isDecor && (
    <div className="text-sm font-semibold text-gray-900 flex-1 px-2">
      <FormattedMessage id="COMMON.DATE" defaultMessage="Date" />
    </div>
  )}

  <div className="text-sm font-semibold text-gray-900 w-24 px-2">
    <FormattedMessage id="COMMON.PERSON" defaultMessage="Person" />
  </div>

  {!isDecor && (
    <div className="text-sm font-semibold text-gray-900 w-24 px-2">
      <FormattedMessage id="COMMON.EXTRA_PERSON" defaultMessage="Extra person" />
    </div>
  )}

   {isOfferRateUser && (
    <div className="text-sm font-semibold text-gray-900 w-24 px-2">
      <FormattedMessage id="COMMON.RATE" defaultMessage="Rate" />
    </div>
  )}


  <div className="text-sm font-semibold text-gray-900 w-24 px-2">
    {isOfferRateUser ? (
      <FormattedMessage id="COMMON.OFFER_RATE" defaultMessage="Offer Rate" />
    ) : (
      <FormattedMessage id="COMMON.RATE" defaultMessage="Rate" />
    )}
  </div>

 
  {!isDecor && quotationData.functions.some(fn => fn.customPackageName !== undefined && canAccessBanquet) && (
    <div className="text-sm font-semibold text-gray-900 w-32 px-2">
      <FormattedMessage id="COMMON.OPTION" defaultMessage="Option" />
    </div>
  )}

  {!isDecor &&  !hideTaxColumns &&(
    <>
      <div className="text-sm font-semibold text-gray-900 w-24 px-2">
        <FormattedMessage id="COMMON.TAX_PERCENT" defaultMessage="Tax %" />
      </div>
      <div className="text-sm font-semibold text-gray-900 w-24 px-2">
        <FormattedMessage id="COMMON.EXTRA_AMOUNT" defaultMessage="Extra Amount (₹)" />
      </div>
    </>
  )}

  <div className="text-sm font-semibold text-gray-900 w-28 px-2">
    <FormattedMessage id="COMMON.TOTAL_PRICE" defaultMessage="Total Price" />
  </div>
  <div className="text-sm font-semibold text-gray-900 w-16 text-center">
    <FormattedMessage id="COMMON.ACTION" defaultMessage="Action" />
  </div>
</div>


                {/* Function Rows - Responsive */}
                <div className="divide-y divide-gray-200">
                  {quotationData.functions.map((fn, index) => (
    <div
      key={fn._tempId || fn.id}
      className="flex flex-col md:flex-row md:items-center md:justify-between p-4 gap-3 md:gap-0 hover:bg-gray-50 transition-colors"
    >
      {/* Number */}
      <div className="hidden md:block w-12 text-sm font-medium text-gray-700">
        {index + 1}
      </div>
      <div className="md:hidden text-xs font-bold text-gray-500 mb-2">
        Function #{index + 1}
      </div>

      {/* Function Name */}
      <div className="flex-1 md:px-2">
        <label className="mobile-field-label md:hidden">Function</label>
        <input
          className="input w-full text-sm"
          value={fn.name}
          onChange={(e) => handleFunctionChange(index, "name", e.target.value)}
          placeholder="Function"
          readOnly={(isLocked && !isPostLockEditable(fn) && !fn.isExtraQuotationFunction)}
        />
      </div>

      {/* Date — HIDE for decor */}
      {!isDecor && !fn.isExtraQuotationFunction && !fn.isNewFunction && (
        <div className="flex-1 md:px-2">
          <label className="mobile-field-label md:hidden">Date</label>
          <DatePicker
            showTime={{ use12Hours: true, format: "hh:mm A" }}
            format="DD/MM/YYYY hh:mm A"
            value={fn.date}
            onChange={(date) => handleFunctionChange(index, "date", date)}
            placeholder="Select date & time"
            disabled={fn.isFromQuotationItems || (isLocked && !isPostLockEditable(fn))}
            className="input w-full"
          />
        </div>
      )}

      {/* Persons */}
      {!fn.isExtraQuotationFunction && (
        <div className="w-full md:w-24 md:px-2">
          <label className="mobile-field-label md:hidden">Person</label>
          <input
            className="input w-full text-sm"
            value={fn.persons}
            onChange={(e) => handleFunctionChange(index, "persons", e.target.value)}
            placeholder="Pax"
            readOnly={isLocked}
            type="tel"
            min="0"
          />
        </div>
      )}

      {/* Extra Person — HIDE for decor */}
      {!isDecor  &&   (
        <div className="w-full md:w-24 md:px-2">
          <label className="mobile-field-label md:hidden">Extra Person</label>
          <input
            className="input w-full text-sm"
            value={fn.extraPax ?? ""}
            onChange={(e) => handleFunctionChange(index, "extraPax", e.target.value)}
            placeholder="Extra Pax"
            type="tel"
            min="0"
          />
        </div>
      )}


      {isOfferRateUser && !fn.isExtraQuotationFunction && (
        <div className="w-full md:w-24 md:px-2">
          <label className="mobile-field-label md:hidden">Rate</label>
          <input
            className="input w-full text-sm"
            value={fn.offeredRate ?? ""}
            onChange={(e) => handleFunctionChange(index, "offeredRate", e.target.value)}
            placeholder="Rate"
            type="tel"
            min="0"
            readOnly
          />
        </div>
      )}

      {/* Rate */}
      {!fn.isExtraQuotationFunction && (
        <div className="w-full md:w-24 md:px-2">
          <label className="mobile-field-label md:hidden">
            {isOfferRateUser ? "Offer Rate" : "Rate"}
          </label>
          <input
            className="input w-full text-sm"
            value={fn.rate}
            onChange={(e) => handleFunctionChange(index, "rate", e.target.value)}
            onBlur={() => handleRateBlur(index)}
            placeholder={isOfferRateUser ? "Offer Rate" : "Rate"}
            type="tel"
            min="0"
            readOnly={isLocked}
          />
        </div>
      )}

    
      

      {/* Package/Option — HIDE for decor */}
      {!isDecor && fn.customPackageName !== undefined && canAccessBanquet && !fn.isNewFunction && !fn.isExtraQuotationFunction && (
        <div className="w-full md:w-32 md:px-2">
          <label className="mobile-field-label md:hidden">Package</label>
          <input
            className="input w-full text-sm"
            value={fn.customPackageName || ""}
            onChange={(e) => handleFunctionChange(index, "customPackageName", e.target.value)}
            placeholder="Package name"
            type="text"
            readOnly={isLocked}
          />
        </div>
      )}

      {/* Tax % — HIDE for decor */}
   {/* Tax % — HIDE for decor and for user 356 */}
      {!isDecor && !hideTaxColumns && !fn.isNewFunction && !fn.isExtraQuotationFunction && (
        <div className="w-full md:w-24 md:px-2">
          <label className="mobile-field-label md:hidden">Tax %</label>
          <input
            className="input w-full text-sm"
            value={fn.extraTax}
            onChange={(e) => handleFunctionChange(index, "extraTax", e.target.value)}
            placeholder="Tax %"
            type="tel"
            min="0"
            max="100"
            readOnly={isLocked}
          />
        </div>
      )}

      {/* Extra Amount — HIDE for decor */}
      {!isDecor && !fn.isNewFunction && !fn.isExtraQuotationFunction &&  !hideTaxColumns && (
        <div className="w-full md:w-24 md:px-2">
          <label className="mobile-field-label md:hidden">Extra Amount (₹)</label>
          <input
            className="input w-full text-sm"
            value={fn.taxRate ?? "0"}
            placeholder="0"
            type="tel"
            min="0"
            onChange={(e) => handleFunctionChange(index, "taxRate", e.target.value)}
            readOnly={isLocked}
          />
        </div>
      )}

      {/* Total Price */}
      <div className="w-full md:w-28 md:px-2">
        <label className="mobile-field-label md:hidden">Total Price</label>
        <input
          className="input w-full text-sm font-semibold"
          value={fn.totalPrice}
          onChange={(e) => {
            const value = e.target.value;
            if (value === "" || /^\d*\.?\d*$/.test(value)) {
              handleFunctionChange(index, "totalPrice", value);
            }
          }}
          placeholder="Total Price"
          type="tel"
          min="0"
          readOnly={fn.isFromQuotationItems || (isLocked && !isPostLockEditable(fn) && !fn.isExtraQuotationFunction)}
        />
      </div>

      {/* Actions */}
    {/* Actions */}
  <div className="w-full md:w-16 flex justify-end md:justify-center">
    <Tooltip title={fn.isFromQuotationItems ? "Cannot delete function from quotation items" : "Delete item"}>
      <Popconfirm
        title="Are you sure to delete this item?"
        onConfirm={() => handleDeleteFunction(fn.id, index)}
        okText="Yes"
        cancelText="No"
        disabled={fn.isFromQuotationItems}
      >
        {permissionQuotation.add && (
          <button
            disabled={fn.isFromQuotationItems || (isLocked && !isPostLockEditable(fn))}
            className={`btn btn-sm btn-icon btn-danger ${fn.isFromQuotationItems ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <KeenIcon icon="trash" />
          </button>
        )}
      </Popconfirm>
    </Tooltip>
  </div>
    </div>
  ))}

                </div>

                {/* Add Function Button */}
                <div className="p-4 flex justify-center">

                  {permissionQuotation.add && (
                  <button
                    className="btn btn-success rounded-full"
                    onClick={handleAddFunction}
                  >
                    <i className="ki-filled ki-plus"></i>
                    <FormattedMessage
                      id="COMMON.ADD_FUNCTION"
                      defaultMessage="Add Function"
                    />
                  </button>
                  )}
                </div>
              </div>
            </div>

            {/* Estimate Summary */}
            <div className="card min-w-full mb-7">
              <div className="flex flex-col flex-1">
                <div className="rtl:[background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg">
                  <h3 className="text-lg font-semibold leading-none text-gray-900 p-4">
                    <FormattedMessage
                      id="COMMON.ESTIMATE_SUMMARY"
                      defaultMessage="Estimate Summary"
                    />
                  </h3>
                </div>

                <div className="flex flex-col w-full">
                  {/* Subtotal Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end border-t border-gray-200 py-3 gap-2 px-4">
                    <div className="text-lg sm:text-xl font-bold text-primary">
                      <FormattedMessage
                        id="COMMON.SUBTOTAL"
                        defaultMessage="Subtotal"
                      />
                    </div>
                    <div className="text-base sm:text-lg font-semibold text-gray-900 sm:w-[220px] text-right">
                      &#8377; {totals.subtotal}
                    </div>
                  </div>

                  <div className="flex items-center justify-end border-t border-gray-200 py-3 gap-2 px-4">
  <div className="text-lg font-semibold text-gray-700 px-2">
    Transportation Charge
  </div>
  <div className="w-[220px] flex items-center justify-end px-2">
    <div className="flex items-center input text-base text-gray-900 w-[200px]">
      <span className="text-gray-500 ml-1">&#8377;</span>
      <input
        className="h-full text-gray-900 w-[140px] ml-1"
        value={transportationCharge}
        type="tel"
        min="0"
        placeholder="0"
        onChange={(e) => handleTransportationChange(e.target.value)}
      />
    </div>
  </div>
</div>

              
{/* Discount Row */}
{/* Discount Row */}
<div className="flex flex-col border-t border-gray-200 py-3">
  <div className="flex items-center justify-end gap-3">
    <div className="flex flex-col items-end px-2">
      <div className="text-lg font-semibold text-red-600">
        <FormattedMessage id="COMMON.DISCOUNT" defaultMessage="Discount" />
      </div>
      <span className="text-[11px] text-gray-400 leading-tight text-right max-w-[220px]">
        Click <b>%</b> to add discount by percentage, or <b>₹</b> to add discount by amount.
      </span>
    </div>

    {/* Toggle: % vs ₹ */}
    <div className="flex items-center gap-2">
      <span
        className={`text-xs font-medium cursor-pointer ${!isDiscountPercentage ? "text-primary font-bold" : "text-gray-400"}`}
        onClick={() => setIsDiscountPercentage(false)}
      >
        ₹
      </span>
      <div
        onClick={() => setIsDiscountPercentage((prev) => !prev)}
        className={`relative w-9 h-5 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer
          ${isDiscountPercentage ? "bg-primary" : "bg-gray-300"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200
            ${isDiscountPercentage ? "translate-x-4" : "translate-x-0"}`}
        />
      </div>
      <span
        className={`text-xs font-medium cursor-pointer ${isDiscountPercentage ? "text-primary font-bold" : "text-gray-400"}`}
        onClick={() => setIsDiscountPercentage(true)}
      >
        %
      </span>
    </div>

    <div className="w-[250px] flex items-center justify-end px-2">
      {isDiscountPercentage ? (
  <div className="flex items-center input text-base text-gray-900 w-[250px]">
    <div>
      <input
        className="h-full text-gray-900 w-[60px]"
        value={
          quotationData.taxDetails.find((tax) => tax.label === "Discount")
            ?.percentage || ""
        }
        placeholder="0.00"
        type="tel"
        min="0"
        onChange={(e) => {
          const discountIdx = quotationData.taxDetails.findIndex(
            (tax) => tax.label === "Discount",
          );
          handleTaxChange(discountIdx, "percentage", e.target.value);
        }}
      />
      <span className="text-gray-500">%</span>
    </div>

    <div className="flex items-center ml-3">
      <span className="text-gray-500 mr-1">&#8377;</span>
      <input
        className="h-full text-gray-900 w-[90px]"
        value={
          quotationData.taxDetails.find((tax) => tax.label === "Discount")
            ?.amount || ""
        }
        
        type="tel"
        min="0"
        placeholder="0"
        onChange={(e) => {
          const discountIdx = quotationData.taxDetails.findIndex(
            (tax) => tax.label === "Discount",
          );
          handleTaxChange(discountIdx, "amount", e.target.value);
        }}
      />
    </div>
  </div>
) : (
  <div className="flex items-center input text-base text-gray-900 w-[200px]">
    <span className="text-gray-500 ml-1">&#8377;</span>
    <input
      className="h-full text-gray-900 w-[140px] ml-1"
      value={
        quotationData.taxDetails.find((tax) => tax.label === "Discount")
          ?.amount || ""
      }
      type="tel"
      min="0"
      placeholder="0"
      onChange={(e) => {
        const discountIdx = quotationData.taxDetails.findIndex(
          (tax) => tax.label === "Discount",
        );
        handleTaxChange(discountIdx, "amount", e.target.value);
      }}
    />
  </div>
)}
    </div>
  </div>
</div>

                  {/* Taxable Amount Row */}
                  <div className="flex items-center justify-end border-t border-b-2 border-gray-300 py-3 gap-2 bg-blue-50">
                    <div className="text-lg font-bold text-gray-700 px-2">
                      <FormattedMessage
                        id="COMMON.TAXABLE_AMOUNT"
                        defaultMessage="Amount after Discount "
                      />
                    </div>
                    <div className="w-[220px] text-base font-bold text-blue-700 px-2">
                      &#8377; {totals.amountAfterDiscount}
                    </div>
                  </div>

                  <div className="flex flex-col border-y border-gray-200 border-dashed bg-gray-50 p-4 gap-2">
                    {/* Cash Payment */}
                    <div className="flex items-center justify-end gap-6 py-1">
                      <div className="text-base font-normal text-gray-700 w-[180px] text-right flex items-center justify-end gap-2">
                        Cash Payment
                      </div>
                      <div className="flex items-center input text-base text-gray-900 w-[200px]">
                        <span className="text-gray-500 ml-1">&#8377;</span>
                        <input
                          className="h-full text-gray-900 w-full ml-1"
                          value={cashPayment}
                          type="tel"
                          min="0"
                          placeholder="0"
                          onChange={(e) => handleCashChange(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Cheque Amount (base) */}
                    <div className="flex items-center justify-end gap-6 py-1">
                    <div className="text-base font-normal text-gray-700 w-[180px] text-right">
  <FormattedMessage id="COMMON.CHEQUE_AMOUNT" defaultMessage="Cheque Amount" />
</div>
                      <div className="flex items-center input text-base text-gray-900 w-[200px]">
                        <span className="text-gray-500 ml-1">&#8377;</span>
                        <input
                          className="h-full text-gray-900 w-full ml-1"
                          value={chequePayment}
                          type="tel"
                          min="0"
                          placeholder="0"
                          onChange={(e) => handleChequeChange(e.target.value)}
                        />
                      </div>
                    </div>

                    
                  </div>

                  <div className="flex flex-col border-y border-gray-200 border-dashed bg-gray-50 font-bold p-4">
                    {quotationData.taxDetails
                      .filter((tax) => tax.label !== "Discount")
                      .map((tax) => {
                        const originalIdx = quotationData.taxDetails.findIndex(
                          (t) => t.label === tax.label,
                        );
                        return (
                          <div
                            key={tax.label}
                            className="flex items-center justify-end gap-6 py-1"
                          >
                            <div className="text-base flex place-content-start font-normal text-gray-700">
                              {tax.label}
                            </div>
                            <div className="flex items-center input text-base text-gray-900 w-[250px]">
                              {tax.label === "CGST" ||
                              tax.label === "SGST" ||
                              tax.label === "IGST" ? (
                                <>
                                <div>
                                     <input
                                    className="h-full text-gray-900 w-[60px]"
                                    value={tax.percentage}
                                    type="tel"
                                    min="0"
                                    placeholder="0"
                                    onChange={(e) =>
                                      handleTaxChange(
                                        originalIdx,
                                        "percentage",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <span className="text-gray-500">%</span>
                                </div>
                                 
                                  <span className="ml-3">
                                    &#8377;{" "}
                                    {tax.label === "CGST"
                                      ? totals.cgstAmount
                                      : tax.label === "SGST"
                                        ? totals.sgstAmount
                                        : totals.igstAmount}
                                  </span>
                                </>
                              ) : (
                                <input
                                  className="h-full text-gray-900 w-[80px]"
                                  value={tax.amount}
                                  type="tel"
                                  onChange={(e) =>
                                    handleTaxChange(
                                      originalIdx,
                                      "amount",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="0"
                                />
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>

                    {/* Food / Service / VAT Tax — independent of GST */}
{/* Food / Service / VAT Tax — independent of GST */}

{(isTaxUser  || isVatUser )&& (
<div className="flex flex-col border-y border-gray-200 border-dashed bg-gray-50 font-bold p-4">
 {[
      ...(isTaxUser
        ? [
            { label: "Food Tax", pct: foodTax, onPctChange: handleFoodTaxChange, amt: foodTaxAmount, onAmtChange: handleFoodTaxAmountChange, total: totals.foodTaxTotalAmount },
            { label: "Service Tax", pct: serviceTax, onPctChange: handleServiceTaxChange, amt: serviceTaxAmount, onAmtChange: handleServiceTaxAmountChange, total: totals.serviceTaxTotalAmount },
          ]
        : []),
      ...(isVatUser
        ? [{ label: "VAT", pct: vatTax, onPctChange: handleVatTaxChange, amt: vatTaxAmount, onAmtChange: handleVatTaxAmountChange, total: totals.vatTaxTotalAmount }]
        : []),
  ].map((tax) => (
    <div key={tax.label} className="flex items-center justify-end gap-6 py-1">
      <div className="text-base flex place-content-start font-normal text-gray-700 w-[100px]">
        {tax.label}
      </div>

      {/* Percentage input */}
      <div className="flex items-center input text-base text-gray-900 w-[100px]">
        <input
          className="h-full text-gray-900 w-[60px]"
          value={tax.pct}
          type="tel"
          min="0"
          placeholder="0"
          onChange={(e) => tax.onPctChange(e.target.value)}
          readOnly={isLocked}
        />
        <span className="text-gray-500">%</span>
      </div>

      {/* Amount input — now editable */}
      <div className="flex items-center input text-base text-gray-900 w-[140px]">
        <span className="text-gray-500 ml-1">&#8377;</span>
        <input
          className="h-full text-gray-900 w-full ml-1"
          value={tax.amt}
          type="tel"
          min="0"
          placeholder="0"
          onChange={(e) => tax.onAmtChange(e.target.value)}
          readOnly={isLocked}
        />
      </div>

      {/* Total Amount — display only */}
      <div className="text-base font-bold text-gray-900 w-[160px] text-right">
        &#8377; {tax.total}
      </div>
    </div>
  ))}
</div>
)}


                  <div className="flex items-center justify-end gap-6 py-3 bg-green-50 px-4">
                  <div className="text-base font-semibold text-green-700 w-[180px] text-right">
  <FormattedMessage id="COMMON.CHEQUE_AMT_INCL_GST" defaultMessage="Cheque Amt (incl. GST)" />
</div>
                    <div className="w-[200px] text-base font-bold text-green-700 px-2">
                      &#8377; {calcGstOnAmount(chequePayment).toFixed(2)}
                    </div>
                  </div>

                 <div className="flex items-center justify-end py-5 gap-2">
  <div className="text-xl font-bold text-primary px-2">
    <FormattedMessage
      id="COMMON.GRAND_TOTAL"
      defaultMessage="Grand Total"
    />
  </div>
  <div className="w-[220px] px-2 text-right">
    <div className="text-lg font-bold text-primary">
      &#8377;{" "}
      {(
  (chequePayment > 0
    ? cashPayment + calcGstOnAmount(chequePayment) + parseFloat(totals.roundOffAmount)
    : parseFloat(totals.amountAfterDiscount) + parseFloat(totals.totalTaxAmount) + parseFloat(totals.roundOffAmount))
  + parseFloat(totals.foodTaxTotalAmount)
  + parseFloat(totals.serviceTaxTotalAmount)
  + parseFloat(totals.vatTaxTotalAmount)
).toFixed(2)}
    </div>
    {(parseFloat(totals.foodTaxTotalAmount) +
      parseFloat(totals.serviceTaxTotalAmount) +
      parseFloat(totals.vatTaxTotalAmount)) > 0 && (
      <div className="text-xs font-normal text-gray-500 mt-1">
        (incl. ₹
        {(
          parseFloat(totals.foodTaxTotalAmount) +
          parseFloat(totals.serviceTaxTotalAmount) +
          parseFloat(totals.vatTaxTotalAmount)
        ).toFixed(2)}{" "}
        Food/Service/VAT Tax)
      </div>
    )}
  </div>
</div>

{/* Advance Payment Section */}
<div className="flex flex-col border-y border-gray-200 border-dashed bg-gray-50 p-4">
  {/* Header row */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-3">
    <div className="text-base font-semibold text-gray-900">
      <FormattedMessage id="COMMON.PAYMENT_DETAILS" defaultMessage="Payment Details" />
    </div>
    {permissionQuotation.add && (
      <button
        type="button"
        className="btn btn-primary w-full sm:w-auto"
        onClick={handleAddAdvancePayment}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <FormattedMessage id="COMMON.ADD_ADVANCE_PAYMENT" defaultMessage="Add Advance Payment" />
      </button>
    )}
  </div>

  {/* Body */}
  {quotationData.advancePayments.length === 0 ? (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <line x1="6" y1="15" x2="10" y2="15" />
      </svg>
      <p className="text-sm">
        No advance payments added yet. Click "Add Advance Payment" to record one.
      </p>
    </div>
  ) : (
    (quotationData.advancePayments || []).map((pay, i) => (
      <div
        key={i}
        className={`flex gap-5 py-3 ${i > 0 ? "border-t border-gray-200 mt-3 pt-5" : ""}`}
      >
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-success mt-1">
          <i className="ki-filled ki-check text-white"></i>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="text-base font-normal text-gray-700">
              <FormattedMessage id="COMMON.ADVANCE_PAYMENT" defaultMessage="Advance Payment" />{" "}
              {quotationData.advancePayments.length > 1 ? `#${i + 1}` : ""}
            </div>

            <div className="flex items-center input text-base text-gray-900 w-full sm:w-[140px]">
              <span className="text-base font-semibold text-gray-900">&#8377;</span>
              <input
                className="h-full text-gray-900 w-full"
                value={pay.amount}
                type="text"
                step="0.01"
                min="0"
                onChange={(e) => handleAdvancePaymentChange(i, "amount", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          {/* Payment Mode + Bank/Cash Account */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
            <div className="flex flex-col gap-1 w-full sm:w-[160px]">
              <label className="text-xs font-medium text-gray-700">Payment Mode</label>
              <select
                className="input w-full text-sm"
                value={pay.paymentMode || ""}
                onChange={(e) => handleAdvancePaymentChange(i, "paymentMode", e.target.value)}
              >
                <option value="">Select Mode</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank</option>
              </select>
            </div>
{pay.paymentMode === "Bank Transfer" && (
  <div className="flex flex-col gap-1 w-full sm:w-[220px]">
    <label className="text-xs font-medium text-gray-700">Select Bank</label>
    <select
      className="input w-full text-sm"
      value={pay.bankId || ""}
      onChange={(e) => handleAdvancePaymentChange(i, "bankId", e.target.value)}
    >
      <option value="">Select Bank</option>
      {bankList.map((bank) => (
        <option key={bank.id} value={bank.id}>
          {formatAccountLabel(bank.bankName, bank.accountNo)}
        </option>
      ))}
    </select>
  </div>
)}
            {pay.paymentMode === "Cash" && (
              <div className="flex flex-col gap-1 w-full sm:w-[220px]">
                <label className="text-xs font-medium text-gray-700">Select Cash Account</label>
                <select
                  className="input w-full text-sm"
                  value={pay.cashAccountId || ""}
                  onChange={(e) => handleAdvancePaymentChange(i, "cashAccountId", e.target.value)}
                >
                  <option value="">Select Cash Account</option>
                  {cashAccountList.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name || acc.accountName || `Account ${acc.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div
            className="bg-white py-3 px-5 rounded-lg border border-gray-200 cursor-pointer"
            onClick={() => document.getElementById(`advance-payment-date-${i}`)}
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <i className="ki-filled ki-calendar text-gray-500"></i>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-medium text-gray-700">
                    {intl.formatMessage({ id: "COMMON.PAYMENT_DATE_TIME", defaultMessage: "Payment date & time" })}
                  </label>
                  <DatePicker
                    id={`advance-payment-date-${i}`}
                    className="input w-full"
                    showTime={{ use12Hours: true, format: "hh:mm A" }}
                    format="DD/MM/YYYY hh:mm A"
                    value={pay.date}
                    onChange={(date) => handleAdvancePaymentChange(i, "date", date)}
                    placeholder={intl.formatMessage({ id: "COMMON.PAYMENT_DATE_TIME", defaultMessage: "Payment date & time" })}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <i className="ki-filled ki-notepad text-gray-500"></i>
                <input
                  className="flex-1 mt-2 input text-xs font-normal text-gray-700 bg-transparent w-full"
                  value={pay.description}
                  onChange={(e) => handleAdvancePaymentChange(i, "description", e.target.value)}
                  placeholder={intl.formatMessage({ id: "COMMON.PAYMENT_DESCRIPTION", defaultMessage: "Payment description" })}
                  type="text"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Popconfirm
              title="Remove this payment?"
              onConfirm={() => handleRemoveAdvancePayment(i)}
              okText="Yes"
              cancelText="No"
            >
              <button className="btn btn-sm btn-danger" title="Remove">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                </svg>{" "}
                <FormattedMessage id="COMMON.REMOVE" defaultMessage="Remove" />
              </button>
            </Popconfirm>
          </div>
        </div>
      </div>
    ))
  )}
</div>



                  <div className="flex items-center justify-between py-5 px-2">
                    <div className="text-lg font-bold text-success px-2">
                      <FormattedMessage
                        id="COMMON.TOTAL_PAID"
                        defaultMessage="Total Paid"
                      />
                    </div>
                    <div className="text-base font-bold text-success px-2">
                      &#8377; {totals.totalPaid}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-y border-orange-100 border-dashed bg-orange-50 py-7 px-2">
                    <div className="text-xl font-bold text-orange-700 px-2">
                      <i className="ki-filled ki-notification-on"></i>{" "}
                      <FormattedMessage
                        id="COMMON.REMAINING_PAYMENT"
                        defaultMessage="Remaining Payment"
                      />
                    </div>
                    <div className="text-lg font-bold text-orange-700 px-2">
                      &#8377; {totals.remainingPayment}
                    </div>
                  </div>
                  {/* <div className="flex flex-col gap-4 py-5 px-4">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                      <i className="ki-filled ki-notepad text-primary"></i>
                      Remarks
                    </label>
                    <textarea
                      rows={5}
                      className="input w-full p-3"
                      placeholder={intl.formatMessage({
                        id: "COMMON.ADD_NOTES",
                        defaultMessage: "Add notes",
                      })}
                      value={quotationData.notes}
                      onChange={handleNotesChange}
                    />
                  </div> */}

                  {/* {canAccessecuritydeposit && (
                
<div className="flex flex-col border-y border-gray-200 border-dashed bg-gray-50 p-4">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 gap-3">
    <div className="text-base font-semibold text-gray-900">Security Deposit</div>
    {permissionQuotation.add && securityDeposits.length === 0 && (
      <button
        type="button"
        className="btn btn-primary w-full sm:w-auto"
        onClick={handleAddSecurityDeposit}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16" height="16" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Add Security Deposit
      </button>
    )}
  </div>

  {securityDeposits.length === 0 ? (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="32" height="32" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round"
      >
        <rect x="2" y="6" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <line x1="6" y1="15" x2="10" y2="15" />
      </svg>
      <p className="text-sm">No security deposits added yet. Click "Add Security Deposit" to record one.</p>
    </div>
  ) : (
    securityDeposits.map((dep, i) => (
      <div
        key={dep.id > 0 ? `dep-${dep.id}` : `dep-new-${i}`}
        className={`flex gap-5 py-3 ${i > 0 ? "border-t border-gray-200 mt-3 pt-5" : ""}`}
      >
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary mt-1">
          <i className="ki-filled ki-shield-tick text-white text-xs"></i>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="text-base font-normal text-gray-700">
              Security Deposit {securityDeposits.length > 1 ? `#${i + 1}` : ""}
            </div>
            <div className="flex items-center input text-base text-gray-900 w-full sm:w-[140px]">
              <span className="text-base font-semibold text-gray-900">&#8377;</span>
              <input
                className="h-full text-gray-900 w-full"
                value={dep.amount}
                type="text"
                onChange={(e) => handleSecurityDepositChange(i, "amount", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-2">
            <div className="flex flex-col gap-1 w-full sm:w-[160px]">
              <label className="text-xs font-medium text-gray-700">Payment Mode</label>
              <select
                className="input w-full text-sm"
                value={dep.paymentMode || ""}
                onChange={(e) => handleSecurityDepositChange(i, "paymentMode", e.target.value)}
              >
                <option value="">Select Mode</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank</option>
              </select>
            </div>

            {dep.paymentMode === "Bank Transfer" && (
              <div className="flex flex-col gap-1 w-full sm:w-[220px]">
                <label className="text-xs font-medium text-gray-700">Select Bank</label>
                <select
                  className="input w-full text-sm"
                  value={dep.bankAccountId || ""}
                  onChange={(e) => handleSecurityDepositChange(i, "bankAccountId", e.target.value)}
                >
                  <option value="">Select Bank</option>
                  {bankList.map((bank) => (
                    <option key={bank.id} value={bank.id}>
                      {formatAccountLabel(bank.bankName, bank.accountNo)}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {dep.paymentMode === "Cash" && (
              <div className="flex flex-col gap-1 w-full sm:w-[220px]">
                <label className="text-xs font-medium text-gray-700">Select Cash Account</label>
                <select
                  className="input w-full text-sm"
                  value={dep.cashAccountId || ""}
                  onChange={(e) => handleSecurityDepositChange(i, "cashAccountId", e.target.value)}
                >
                  <option value="">Select Cash Account</option>
                  {cashAccountList.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name || acc.accountName || `Account ${acc.id}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="bg-white py-3 px-5 rounded-lg border border-gray-200">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <i className="ki-filled ki-calendar text-gray-500"></i>
                <div className="flex flex-col gap-1 flex-1">
                  <label className="text-xs font-medium text-gray-700">Payment date & time</label>
                  <DatePicker
                    className="input w-full"
                    showTime={{ use12Hours: true, format: "hh:mm A" }}
                    format="DD/MM/YYYY hh:mm A"
                    value={dep.date}
                    onChange={(date) => handleSecurityDepositChange(i, "date", date)}
                    placeholder="Payment date & time"
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <i className="ki-filled ki-notepad text-gray-500"></i>
                <input
                  className="flex-1 mt-2 input text-xs font-normal text-gray-700 bg-transparent w-full"
                  value={dep.description}
                  onChange={(e) => handleSecurityDepositChange(i, "description", e.target.value)}
                  placeholder="Description"
                  type="text"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              className="btn btn-sm btn-success"
              onClick={() => handleSaveSecurityDeposit(i)}
              disabled={savingDepositIdx === i}
            >
              <i className="ki-filled ki-save-2"></i>
              {savingDepositIdx === i ? "Saving..." : dep.id > 0 ? "Update" : "Save"}
            </button>
            <Popconfirm
              title="Remove this security deposit?"
              onConfirm={() => handleRemoveSecurityDeposit(i)}
              okText="Yes"
              cancelText="No"
            >
              <button className="btn btn-sm btn-danger" title="Remove">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14" height="14" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                </svg>{" "}
                Remove
              </button>
            </Popconfirm>
          </div>
        </div>
      </div>
    ))
  )}
</div>
)} */}

                  {!isDecor && quotationData.banquetHallId !== null && eventRemarks.length > 0 && (
                      <div className=" mt-4 p-4 rounded-lg">
                        <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <i className="ki-filled ki-notepad text-primary"></i>
                          Remarks
                        </label>
                        {eventRemarks.map((r, idx) => (
                          <div
                            key={r.id}
                            className="flex flex-col gap-2 p-3 bg-white rounded-lg border border-gray-200 shadow-sm mt-3"
                          >
                            <label className="text-xs font-medium text-primary uppercase tracking-wide">
                              {r.type || `Remark ${idx + 1}`}
                            </label>

                            <div className="flex flex-col gap-1">
                              <span className="text-[10px] text-gray-500">
                                English
                              </span>

                              <textarea
                                className="input text-sm w-full"
                                type="text"
                                placeholder="English"
                                value={r.nameEnglish || ""}
                                onChange={(e) => {
                                  const updated = [...eventRemarks];
                                  updated[idx] = {
                                    ...updated[idx],
                                    nameEnglish: e.target.value,
                                  };
                                  setEventRemarks(updated);
                                  setIsEdited(true);
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  <div className="flex flex-col gap-4 py-5 px-4">
                    <label className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
  <i className="ki-filled ki-notepad text-primary"></i>
  <FormattedMessage id="COMMON.NOTES" defaultMessage="Notes" />
</label>
                    <textarea
                      rows={5}
                      className="input w-full p-3"
                      placeholder={intl.formatMessage({
                        id: "COMMON.ADD_NOTES",
                        defaultMessage: "Add notes",
                      })}
                      value={quotationData.notes}
                      onChange={handleNotesChange}
                    />
                    {!isDecor && quotationData.banquetHallId !== null && eventRemarks.length > 0 && (
    <div className="flex items-center justify-between border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
        <i className="ki-filled ki-home text-primary"></i>
        Venue Total
      </label>
      <div className="flex items-center input text-base text-gray-900 w-[200px]">
        <span className="text-gray-500 ml-1">₹</span>
        <input
          className="h-full text-gray-900 w-full ml-1"
          value={venueTotal}
          type="tel"
          min="0"
          placeholder="0"
          onChange={(e) => { setVenueTotal(e.target.value); setIsEdited(true); }}
        />
      </div>
    </div>
  )}
                    <div className="flex justify-end">
  {permissionQuotation.add && (
  <button
    className="btn btn-success w-full sm:w-auto"
    onClick={handleSaveNotes}
    disabled={!isEdited || isSavingQuotation}
  >
    <i className="ki-filled ki-save-2"></i>
    {isSavingQuotation ? (
      <FormattedMessage
        id="COMMON.SAVING"
        defaultMessage="Saving..."
      />
    ) : (
      <FormattedMessage
        id="COMMON.SAVE"
        defaultMessage="Save"
      />
    )}
  </button>
  )}
</div>
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </div>
        <InvoiceTheme
          key={invoiceThemeKey}
          open={isInvoiceThemeOpen}
          onClose={() => setIsInvoiceThemeOpen(false)}
          eventId={eventId}
          isinvoice={1}
          isDecor={isDecor ? true : false} 
        />
        {isSaving && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <img
              src={toAbsoluteUrl("/media/icons/loading.gif")}
              alt="Loading..."
              className="w-18 rounded-xl shadow-2xl"
            />
          </div>
        )}

        {isHistoryOpen && (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-50"
        onClick={() => setIsHistoryOpen(false)}
      />
      <div
        className="fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl shadow-2xl custom-scrollbar"
        style={{ transform: "translate(-50%,-50%)", width: "min(600px,95vw)", maxHeight: "80vh" }}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-800">
            {isDecor ? "Decor" : "Menu"} Quotation Save History
          </h3>
          <button
            onClick={() => setIsHistoryOpen(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: "60vh" }}>
          {historyLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : historyLogs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">
              No save history found for this quotation type.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {historyLogs.map((log) => {
    const isError = log.eventType?.includes("Error");
    const isLock = log.eventType?.includes("Lock");
    const badgeLabel = isLock ? "Lock" : "Save";
    const badgeColor = isError
      ? "bg-red-100 text-red-700"
      : isLock
        ? "bg-blue-100 text-blue-700"
        : "bg-green-100 text-green-700";

    return (
      <div
        key={log.id}
        className="border border-gray-200 rounded-lg p-3 bg-gray-50"
      >
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {badgeLabel}{isError ? " Failed" : ""}
          </span>
          <span className="text-xs text-gray-500">{log.createAt}</span>
        </div>
        {log.user && (
          <p className="text-xs text-gray-500 mb-1">By: {log.user}</p>
        )}
        <div className="text-sm text-gray-700 whitespace-pre-line">
          {log.description}
        </div>
      </div>
    );
  })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-500 hover:text-gray-700"
            onClick={() => setIsHistoryOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </>
  )}
<SecurityDepositModal
  open={isSecurityDepositOpen}
  onClose={() => setIsSecurityDepositOpen(false)}
  eventId={eventId}                    // ← is this line actually there?
  securityDeposits={securityDeposits}
  bankList={bankList}
  cashAccountList={cashAccountList}
  savingDepositIdx={savingDepositIdx}
  permissionQuotation={permissionQuotation}
  onAdd={handleAddSecurityDeposit}
  onChange={handleSecurityDepositChange}
  onSave={handleSaveSecurityDeposit}
  onRemove={handleRemoveSecurityDeposit}
  onDepositsLoaded={setSecurityDeposits}  
  formatAccountLabel={formatAccountLabel}
/>
      </Fragment>
    );
  };

  export default QuotationPage;
