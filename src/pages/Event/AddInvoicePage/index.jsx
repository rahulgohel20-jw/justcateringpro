import { Fragment, useState, useEffect, useRef } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { DatePicker, Input, Switch, Button, Spin } from "antd";
import ItemTable from "@/components/InvoiceTable/ItemTable";
import InvoiceFooter from "@/components/InvoiceTable/InvoiceFooter";
import {
  invoicecodeforadmin ,
  UpdateInvoice,
  GetInvoiceByEventId,
  GetQuotation,
  CashAccountGetAll,
    AddLogs,
} from "@/services/apiServices";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import Swal from "sweetalert2";

import { Tooltip, message } from "antd";
import { EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useLocation  , useNavigate   } from "react-router";
import { Link } from "react-router-dom";  
import { FormattedMessage, useIntl } from "react-intl";
import InvoiceTheme from "./InvoiceTheme";
import { GetbankdetailsbyuserId } from "../../../services/apiServices";
import { usePermission } from "../../../hooks/usePermission";
dayjs.extend(customParseFormat);

const { TextArea } = Input;

const AddInvoicePage = () => {
  const [invoiceCode, setInvoiceCode] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const intl = useIntl();
const initializedRef = useRef(false);
   const OFFER_RATE_USER_IDS = ["501"]; 
 
const [foodTax, setFoodTax] = useState("0");
const [foodTaxAmount, setFoodTaxAmount] = useState("0");
const [foodTaxTotalAmount, setFoodTaxTotalAmount] = useState("0");
const [serviceTax, setServiceTax] = useState("0");
const [serviceTaxAmount, setServiceTaxAmount] = useState("0");
const [serviceTaxTotalAmount, setServiceTaxTotalAmount] = useState("0");
const [vatTax, setVatTax] = useState("0");
const [vatTaxAmount, setVatTaxAmount] = useState("0");
const [vatTaxTotalAmount, setVatTaxTotalAmount] = useState("0");
  const invoiceUserId = localStorage.getItem("userId");
  const isOfferRateUser = OFFER_RATE_USER_IDS.includes(String(invoiceUserId))
  const [originalRows, setOriginalRows] = useState([]);
    const TAX_USER = ["501"];
    const VAT_USER = ["501", "334"];
    
const HIDE_TAX_COLUMNS_USER_IDS = ["356"]; //for tgb client not show tax ans amount 
const hideTaxColumns = HIDE_TAX_COLUMNS_USER_IDS.includes(String(invoiceUserId));

    const isVatUser = VAT_USER.includes(String(invoiceUserId));
  
const isTaxUser = TAX_USER.includes(String(invoiceUserId));
  
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

  const formatAmount = (value) => {
        const num = Number(value) || 0;
        return num % 1 === 0 ? num.toString() : num.toFixed(2);
      };

const buildInvoiceChangeSummary = (prevSnapshot, current) => {
    if (!prevSnapshot) return "No baseline to compare.";

    const parts = [];
    const added = [];
    const removed = [];
    const lines = [];

    const keyOf = (row) =>
      row.id && row.id !== 0 ? `id-${row.id}` : row.key;

    const prevRowMap = new Map(
      (prevSnapshot.rows || []).map((r) => [keyOf(r), r]),
    );
    const currRowMap = new Map(
      (current.rows || []).map((r) => [keyOf(r), r]),
    );

    (current.rows || []).forEach((row) => {
      const prevRow = prevRowMap.get(keyOf(row));
      const label = row.name || "Function";

      if (!prevRow) {
        added.push(`${label} (Pax: ${row.person || 0}, Rate: ${row.rate || 0}, Amount: ${row.amount || 0})`);
        return;
      }

      const changes = [];
      const fields = [
        ["person", "Pax"],
        ["extra", "Extra Pax"],
        ["rate", "Rate"],
        ["offeredRate", "Offer Rate"],
        ["amount", "Amount"],
        ["date", "Date"],
      ];

      fields.forEach(([field, label2]) => {
        const prevVal = prevRow[field] ?? "-";
        const currVal = row[field] ?? "-";
        if (String(prevVal) !== String(currVal)) {
          changes.push(`${label2}: ${prevVal} → ${currVal}`);
        }
      });

      if (changes.length) {
        lines.push(`${label} [${changes.join(", ")}]`);
      }
    });

    (prevSnapshot.rows || []).forEach((row) => {
      if (!currRowMap.has(keyOf(row))) {
        removed.push(row.name || "Function");
      }
    });

    // ── Billing / GST / dates ──
    const topFields = [
      ["billingname", "Billing Name", current.billingname],
      ["billingaddress", "Billing Address", current.billingaddress],
      ["shipname", "Ship Name", current.shipname],
      ["shipaddress", "Ship Address", current.shipaddress],
      ["gstnumber", "GST Number", current.gstnumber],
      ["invoiceCode", "Invoice Code", current.invoiceCode],
      ["invoiceDate", "Invoice Date", current.invoiceDate],
      ["dueDate", "Due Date", current.dueDate],
      ["notes", "Notes", current.notes],
    ];

    topFields.forEach(([field, label, currVal]) => {
      const prevVal = prevSnapshot[field] ?? "-";
      const cv = currVal ?? "-";
      if (String(prevVal) !== String(cv)) {
        lines.push(`${label}: ${prevVal} → ${cv}`);
      }
    });

    // ── Footer / tax fields ──
    const numericFields = [
      ["cgst", "CGST %", current.cgst],
      ["cgstAmnt", "CGST Amount", current.cgstAmnt],
      ["sgst", "SGST %", current.sgst],
      ["sgstAmnt", "SGST Amount", current.sgstAmnt],
      ["igst", "IGST %", current.igst],
      ["igstAmnt", "IGST Amount", current.igstAmnt],
      ["discount", "Discount", current.discount],
        ["discountPct", "Discount %", current.discountPct],           
      ["isDiscountPercent", "Discount Mode", current.isDiscountPercent],
      ["roundOff", "Round Off", current.roundOff],
      ["subTotal", "Subtotal", current.subTotal],
      ["grandTotal", "Grand Total", current.grandTotal],
      ["cashPayment", "Cash Payment", current.cashPayment],
      ["chequePayment", "Cheque Payment", current.chequePayment],
      ["foodTax", "Food Tax %", current.foodTax],
      ["foodTaxAmount", "Food Tax Amount", current.foodTaxAmount],
      ["serviceTax", "Service Tax %", current.serviceTax],
      ["serviceTaxAmount", "Service Tax Amount", current.serviceTaxAmount],
      ["vatTax", "VAT %", current.vatTax],
      ["vatTaxAmount", "VAT Amount", current.vatTaxAmount],
    ];

    numericFields.forEach(([field, label, currVal]) => {
      const prevVal = prevSnapshot[field] ?? "-";
      if (String(prevVal) !== String(currVal)) {
        lines.push(`${label}: ${prevVal} → ${currVal}`);
      }
    });

    // ── Advance payments (per-field diff) ──
    const keyOfPayment = (p, idx) => (p.id && p.id !== 0 ? `id-${p.id}` : `idx-${idx}`);
    const prevPayMap = new Map(
      (prevSnapshot.payments || []).map((p, idx) => [keyOfPayment(p, idx), p]),
    );
    const currPayMap = new Map(
      (current.payments || []).map((p, idx) => [keyOfPayment(p, idx), p]),
    );

    (current.payments || []).forEach((p, idx) => {
      const key = keyOfPayment(p, idx);
      const prevP = prevPayMap.get(key);
      const label = `Advance Payment #${idx + 1}`;

      if (!prevP) {
        lines.push(`${label} Added (Amount: ₹${p.advancePayment || 0}, Mode: ${p.paymentMode || "-"})`);
        return;
      }

      const payFields = [
        ["advancePayment", "Amount"],
        ["advancePaymentDate", "Date"],
        ["advancePaymentNotes", "Notes"],
        ["paymentMode", "Payment Mode"],
        ["bankId", "Bank"],
        ["cashAccountId", "Cash Account"],
      ];

      payFields.forEach(([field, fLabel]) => {
        const prevVal = prevP[field] ?? "-";
        const currVal = p[field] ?? "-";
        if (String(prevVal) !== String(currVal)) {
          lines.push(`${label} ${fLabel}: ${prevVal} → ${currVal}`);
        }
      });
    });

    (prevSnapshot.payments || []).forEach((p, idx) => {
      const key = keyOfPayment(p, idx);
      if (!currPayMap.has(key)) {
        lines.push(`Advance Payment removed (was ₹${p.advancePayment || 0})`);
      }
    });

    if (lines.length) parts.push(`Changes: ${lines.join(" | ")}`);
    if (added.length) parts.push(`Added Functions: ${added.join(", ")}`);
    if (removed.length) parts.push(`Removed Functions: ${removed.join(", ")}`);

    return parts.length ? parts.join(" | ") : "No item-level changes detected.";
  };

  const {
    eventId,
    eventTypeId,
    fromQuotation,
    quotationData: passedQuotationData,
    isDecor: isDecorFromState,  
  } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [isEdited, setIsEdited] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [invoiceDate, setInvoiceDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [isInvoiceThemeOpen, setIsInvoiceThemeOpen] = useState(false);
  const [bankDetails, setBankDetails] = useState([]);
  const [payments, setPayments] = useState([]);
  const [footerData, setFooterData] = useState({
    notes: "Thanks for your Business...",
    gst: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    discount: 0,
    roundOff: 0,
    subTotal: 0,
    totalAmount: 0,
    cgstAmnt: 0,
    sgstAmnt: 0,
    igstAmnt: 0,
    grandTotal: 0,
    cashPayment: 0,    
  chequePayment: 0, 
  });
  const [cashAccountList, setCashAccountList] = useState([]);
  
  const permissionInvoice = usePermission("Invoice")
  const [cashPayment, setCashPayment] = useState(0);
const [chequePayment, setChequePayment] = useState(0);
const initialInvoiceSnapshotRef = useRef(null);

  useEffect(() => {
    fetchBankDetails();
    fetchCashAccounts();
  }, []);

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

  const responsiveStyles = `
  @media (max-width: 768px) {
    .event-info-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; }
    .event-info-item { flex-direction: column; align-items: flex-start !important; gap: 0.25rem; }
    .billing-grid { grid-template-columns: 1fr !important; }
    .billing-section { border-right: none !important; border-bottom: 1px solid #e5e7eb; }
    .mobile-field-label { display: block; font-size: 0.75rem; font-weight: 600; color: #6b7280; margin-bottom: 0.25rem; text-transform: uppercase; }
    .edit-actions { flex-direction: row; gap: 0.5rem; }
    .action-buttons { flex-direction: column; width: 100%; }
    .action-buttons button { width: 100%; justify-content: center; }
    .ant-modal { max-width: 95vw !important; margin: 0 auto; }
  }
  @media (min-width: 769px) {
    .mobile-field-label { display: none; }
  }
`;

  const [rows, setRows] = useState([
    {
      key: 1,
      name: "",
      date: "",
      person: "",
      extra: "",
      rate: "",
      amount: "",
      offeredRate: "",
    },
  ]);


  const [editStates, setEditStates] = useState({
    billingAddress: false,
    shippingAddress: false,
    billingName: false,
    gstNumber: false,
  });


  const [tempValues, setTempValues] = useState({
    billingaddress: "",
    billingname: "",
    shipaddress: "",
    shipname: "",
    gstnumber: "",
  });

  const totalAdvancePaid = payments.reduce(
    (sum, p) => sum + (Number(p.advancePayment) || 0),
    0,
  );
  const remainingAmount = footerData.grandTotal - totalAdvancePaid;

  const extraTaxTotal =
  (parseFloat(foodTaxTotalAmount) || 0) +
  (parseFloat(serviceTaxTotalAmount) || 0) +
  (parseFloat(vatTaxTotalAmount) || 0);

const finalGrandTotal = footerData.grandTotal || 0;
const finalRemainingAmount = finalGrandTotal - totalAdvancePaid;

  useEffect(() => {
  fetchInvoiceCode();
}, []);


const fetchCashAccounts = async () => {
  try {
    const userId = localStorage.getItem("userId");
    const res = await CashAccountGetAll(userId);
    const accounts = res?.data?.data || res?.data || [];
    setCashAccountList(Array.isArray(accounts) ? accounts : []);
  } catch (err) {
    console.error("Error fetching cash accounts:", err);
  }
};


const fetchInvoiceCode = async () => {
  try {
    const res = await invoicecodeforadmin();

    if (res?.data?.success) {
      setInvoiceCode(res.data.data || "");
    }
  } catch (error) {
    console.error("Invoice code fetch error:", error);
  }
};

  const fetchBankDetails = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) return;

      const res = await GetbankdetailsbyuserId(userId);

      if (res?.data?.success) {
        setBankDetails(res?.data?.data || []);
      }
    } catch (error) {
      console.error("Bank details error:", error);
    }
  };

  const primaryBank = bankDetails.find((b) => b.isPrimary) || bankDetails[0];

  useEffect(() => {
    if (invoiceData?.createdAt) {
      setInvoiceDate(invoiceData.createdAt.split("T")[0]);
    }
  }, [invoiceData]);

  useEffect(() => {
    if (invoiceData) {
      setTempValues({
        billingaddress: invoiceData.billingaddress || "",
        billingname: invoiceData.billingname || "",
        shipaddress: invoiceData.shipaddress || "",
        shipname: invoiceData.shipname || "",
        gstnumber: invoiceData.gstnumber || "",
      });
    }
  }, [invoiceData]);
  useEffect(() => {
    if (!eventId) return;

    if (fromQuotation) {
      fetchFromQuotation();
    } else {
      fetchInvoiceData();
    }
  }, [eventId]);


  // FOOD TAX
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


  const fetchFromQuotation = async () => {
    try {
      setLoading(true);
const res = await GetQuotation(eventId, 1, isDecorFromState ?? false);
      // copyToInvoice = 1
      const apiData = res?.data?.data?.["Event Functions Quotation Details"];

      if (!apiData || apiData.length === 0) {
        message.warning("No quotation data found");
        return;
      }

      const qInfo = apiData[0];

      // const formatAmount = (value) => {
      //   const num = Number(value) || 0;
      //   return num % 1 === 0 ? num.toString() : num.toFixed(2);
      // };

      // Map functionQuotationItems → invoice rows
      const hasFunctionItems =
        qInfo.functionQuotationItems && qInfo.functionQuotationItems.length > 0;

      const mappedRows = hasFunctionItems
        ? qInfo.functionQuotationItems.map((item, index) => {
            // Convert "DD/MM/YYYY hh:mm A" string → display string
            let dateStr = "";
            if (item.functionDate) {
              const parsed = dayjs(item.functionDate, "DD/MM/YYYY hh:mm A");
              dateStr = parsed.isValid()
                ? parsed.format("DD MMM YYYY") // matches formatDateForDisplay output
                : item.functionDate;
            }
            return {
              key: `${index + 1}-${Math.random()}`,
              name: item.functionName || "",
              date: dateStr,
              person: item.pax ?? 0,
              extra: item.extraPax ?? 0,
              rate: item.ratePerPlate ?? 0,
               offeredRate: item.offeredRate ?? 0,
              amount: item.amount ?? 0,
               extraTaxPct: item.extraTax ?? 0,  
               extraChargesId: item.extraChargesId ?? null,
isExtraCharges: item.isExtraCharges === true,
        taxRate: item.taxRate ?? 0, 
              isCustom: false,
              isEventFunction: item.isEventFunction === true,
              id: 0, // new invoice rows — no existing invoice item id
              isNewRow: false,
            };
          })
        : qInfo.event?.eventFunctions?.length > 0
          ? qInfo.event.eventFunctions.map((fn, index) => ({
              key: `${index + 1}-${Math.random()}`,
              name: fn.function?.nameEnglish || "",
              date: fn.functionStartDateTime
                ? dayjs(fn.functionStartDateTime).format("DD MMM YYYY")
                : "",
              person: fn.pax ?? 0,
              extra: 0,
              rate: fn.rate ?? 0,
              offeredRate: 0,
              amount: (fn.pax ?? 0) * (fn.rate ?? 0),
              isCustom: false,
              isEventFunction: true,
              id: 0,
              isNewRow: false,
            }))
          : [
              {
                key: 1,
                name: "",
                date: "",
                person: "",
                extra: "",
                rate: "",
                offeredRate: "",
                amount: "",
                isCustom: true,
                isEventFunction: false,
                id: 0,
                isNewRow: true,
              },
            ];

      setRows(mappedRows);
      setOriginalRows(mappedRows); 

     const prevExtraTax =
  (parseFloat(qInfo.foodTaxTotalAmount) || 0) +
  (parseFloat(qInfo.serviceTaxTotalAmount) || 0) +
  (parseFloat(qInfo.vatTaxTotalAmount) || 0);
const baseGrandTotal = (parseFloat(qInfo.grandTotal) || 0) - prevExtraTax;
const rawIsDiscountPercent = qInfo.isDiscountPercent;
const inferredIsPercent =
  rawIsDiscountPercent === true
    ? true
    : rawIsDiscountPercent === false
      ? false
      : parseFloat(qInfo.discountPct) > 0;

setFooterData({
  notes: qInfo.notes || "Thanks for your Business...",
  gst: 0,
  cgst: parseFloat(qInfo.cgst) || 0,
  sgst: parseFloat(qInfo.sgst) || 0,
  igst: parseFloat(qInfo.igst) || 0,
  discount: parseFloat(qInfo.discount) || 0,
  discountPercentage: Number(parseFloat(qInfo.discountPct) || 0).toFixed(2), // ✅ was "invoiceDetails" — fixed to qInfo
  isDiscountPercentage: inferredIsPercent,
  roundOff: parseFloat(qInfo.roundOff) || 0,
  subTotal: parseFloat(qInfo.subTotal) || 0,
  totalAmount: baseGrandTotal,
  cgstAmnt: parseFloat(qInfo.cgstAmnt) || 0,
  sgstAmnt: parseFloat(qInfo.sgstAmnt) || 0,
  igstAmnt: parseFloat(qInfo.igstAmnt) || 0,
  grandTotal: baseGrandTotal,
   cashPayment: parseFloat(qInfo.cashPayment) || 0,      
chequePayment: parseFloat(qInfo.chequePayment) || 0,
});

      setFoodTax(qInfo.foodTax || "0");
setServiceTax(qInfo.serviceTax || "0");
setVatTax(qInfo.vatTax || "0");
setFoodTaxAmount(formatAmount(qInfo.foodTaxAmount || 0));
setFoodTaxTotalAmount(formatAmount(qInfo.foodTaxTotalAmount || 0));
setServiceTaxAmount(formatAmount(qInfo.serviceTaxAmount || 0));
setServiceTaxTotalAmount(formatAmount(qInfo.serviceTaxTotalAmount || 0));
setVatTaxAmount(formatAmount(qInfo.vatTaxAmount || 0));
setVatTaxTotalAmount(formatAmount(qInfo.vatTaxTotalAmount || 0));

      // Billing fields
      setTempValues({
        billingaddress: qInfo.billingaddress || "",
        billingname: qInfo.billingname || "",
        shipaddress: qInfo.shipaddress || "",
        shipname: qInfo.shipname || "",
        gstnumber: qInfo.gstnumber || "",
      });

      // Due date
      if (qInfo.duedate) {
        const parsed = dayjs(qInfo.duedate, "DD/MM/YYYY");
        if (parsed.isValid()) setDueDate(parsed);
      }

      // Invoice date = today (new invoice)
      setInvoiceDate(dayjs().format("YYYY-MM-DD"));

      // Build synthetic invoiceData so the JSX renders party/venue/event info
      setInvoiceData({
        id: qInfo.invoiceId || null, // null = new invoice
        billingname: qInfo.billingname || "",
        billingaddress: qInfo.billingaddress || "",
        shipname: qInfo.shipname || "",
        shipaddress: qInfo.shipaddress || "",
        gstnumber: qInfo.gstnumber || "",
        notes: qInfo.notes || "",
        duedate: qInfo.duedate || "",
        createdAt: new Date().toISOString(),
        eventInvoiceFunctionPayments: [],
        event: qInfo.event || {
          inquiryDate: "",
          mobileno: qInfo.event?.mobileno || "",
          eventType: { nameEnglish: qInfo.event?.eventType?.nameEnglish || "" },
          party: {
            nameEnglish: qInfo.event?.party?.nameEnglish || "",
            mobileno: qInfo.event?.party?.mobileno || "",
          },
          venue: { nameEnglish: qInfo.event?.venue?.nameEnglish || "" },
        },
      });

      const mappedPayments =
        qInfo.eventFunctionQuotationPayments?.length > 0
          ? qInfo.eventFunctionQuotationPayments.map((p) => ({
              id: p.id || 0,
              advancePayment: p.advancePayment || 0,
              advancePaymentDate: p.advancePaymentDate || "",
              advancePaymentNotes: p.advancePaymentNotes || "",
              paymentMode: p.paymentMode || "",
              bankId: p.bankId || null,
              cashAccountId: p.cashAccountId || null,
               vendorCode: p.vendorCode || "",
            }))
          : [];
      setPayments(mappedPayments);

      initialInvoiceSnapshotRef.current = {
        rows: JSON.parse(JSON.stringify(mappedRows)),
        billingname: qInfo.billingname || "",
        billingaddress: qInfo.billingaddress || "",
        shipname: qInfo.shipname || "",
        shipaddress: qInfo.shipaddress || "",
        gstnumber: qInfo.gstnumber || "",
        invoiceCode: invoiceCode || "",
        invoiceDate: dayjs().format("YYYY-MM-DD"),
        dueDate: qInfo.duedate || "",
        notes: qInfo.notes || "",
        cgst: qInfo.cgst || 0,
        cgstAmnt: qInfo.cgstAmnt || 0,
        sgst: qInfo.sgst || 0,
        sgstAmnt: qInfo.sgstAmnt || 0,
        igst: qInfo.igst || 0,
        igstAmnt: qInfo.igstAmnt || 0,
        discount: qInfo.discount || 0,
          discountPct: qInfo.discountPct || 0,        
  isDiscountPercent: inferredIsPercent,
        roundOff: qInfo.roundOff || 0,
        subTotal: qInfo.subTotal || 0,
        grandTotal: baseGrandTotal,
        cashPayment: parseFloat(qInfo.cashPayment) || 0,
        chequePayment: parseFloat(qInfo.chequePayment) || 0,
        foodTax: qInfo.foodTax || "0",
        foodTaxAmount: formatAmount(qInfo.foodTaxAmount || 0),
        serviceTax: qInfo.serviceTax || "0",
        serviceTaxAmount: formatAmount(qInfo.serviceTaxAmount || 0),
        vatTax: qInfo.vatTax || "0",
        vatTaxAmount: formatAmount(qInfo.vatTaxAmount || 0),
        payments: JSON.parse(JSON.stringify(mappedPayments)),
      }; // ← baseline for a brand-new invoice copied from quotation
    } catch (error) {
      console.error("Error fetching quotation for invoice:", error);
      message.error("Failed to load quotation data");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      const response = await GetInvoiceByEventId(eventId);

      if (response.status === 200 && response.data.data) {
        const invoiceDetailsArray =
          response?.data?.data?.["Event Invoice Details"];

        if (invoiceDetailsArray && invoiceDetailsArray.length > 0) {
          const invoiceDetails = invoiceDetailsArray[0];
          setInvoiceData(invoiceDetails);

if (invoiceDetails.invoiceCode) {
  setInvoiceCode(invoiceDetails.invoiceCode);
}
          setPayments(
            invoiceDetails?.eventInvoicePayments?.length > 0
              ? invoiceDetails.eventInvoicePayments.map((p) => ({
                  id: p.id || 0,
                  advancePayment: p.advancePayment || 0,
                  advancePaymentDate: p.advancePaymentDate || "",
                  advancePaymentNotes: p.advancePaymentNotes || "",
                  paymentMode: p.paymentMode || "",
        bankId: p.bankId || null,
        cashAccountId: p.cashAccountId || null,
          vendorCode: p.vendorCode || "",
                }))
              : [],
          );

          if (invoiceDetails.duedate) {
            setDueDate(dayjs(invoiceDetails.duedate, "DD/MM/YYYY"));
          }

          let mappedRows = [];

          const formatDateForDisplay = (dateString) => {
            if (!dateString) return "";
            try {
              let datePart = dateString.includes(" ")
                ? dateString.split(" ")[0]
                : dateString;
              const [day, month, year] = datePart.split("/");
              const date = new Date(year, month - 1, day);
              return date.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              });
            } catch (error) {
              console.error("Error formatting date:", dateString, error);
              return dateString;
            }
          };
          
          if (invoiceDetails?.invoiceFunctionItems?.length > 0) {
            mappedRows = invoiceDetails.invoiceFunctionItems.map(
              (item, index) => {
                const isManuallyAdded =
                  item.isEventFunction === false ||
                  (item.id > 0 && !item.isEventFunction);
                return {
                  key: `${index + 1}-${Math.random()}`,
                  name: item.functionName || item.name || "",
                  date: formatDateForDisplay(item.functionDate || item.date),
                  person: item.pax || item.person || 0,
                  extra: item.extraPax || item.extra || 0,
                  rate: item.ratePerPlate || item.rate || 0,
                  offeredRate: item.offeredRate ?? 0,
                  amount: item.amount ?? 0,
                    extraTaxPct: item.extraTax ?? 0,   // ✅ carry forward if the invoice API returns it
    taxRate: item.taxRate ?? 0, 
                  isCustom: isManuallyAdded,
                  isEventFunction: item.isEventFunction === true,
                  id: item.id || 0,
                  isNewRow: false,
                };
              },
            );
          } else if (invoiceDetails?.invoiceFunctionItems?.length < 1) {
       
           
            

            mappedRows = invoiceDetails.event.eventFunctions.map(
              (func, index) => ({
                key: `${index + 1}-${Math.random()}`,
                name: func.function?.nameEnglish || "N/A",
                date: formatDateForDisplay(func.functionStartDateTime),
                person: func.pax || 0,
                extra: 0,
                rate: func.rate || 0,
                offeredRate: func.rate || 0, 
                amount: (Number(func.pax || 0) + 0) * Number(func.rate || 0),
                isCustom: false,
                isEventFunction: true,
                id: 0,
              }),
            );
          }

          setRows(mappedRows.length > 0 ? mappedRows : rows);
          setOriginalRows(mappedRows.length > 0 ? mappedRows : rows); 

          setTempValues({
            billingaddress: invoiceDetails.billingaddress || "",
            billingname: invoiceDetails.billingname || "",
            shipaddress: invoiceDetails.shipaddress || "",
            shipname: invoiceDetails.shipname || "",
            gstnumber: invoiceDetails.gstnumber || "",
          });

         const prevExtraTax =
  (parseFloat(invoiceDetails.foodTaxTotalAmount) || 0) +
  (parseFloat(invoiceDetails.serviceTaxTotalAmount) || 0) +
  (parseFloat(invoiceDetails.vatTaxTotalAmount) || 0);
const baseGrandTotal = (parseFloat(invoiceDetails.grandTotal) || 0) - prevExtraTax;
const rawIsDiscountPercent = invoiceDetails.isDiscountPercent;
const inferredIsPercent =
  rawIsDiscountPercent === true
    ? true
    : rawIsDiscountPercent === false
      ? false
      : parseFloat(invoiceDetails.discountPct) > 0;

setFooterData({
  notes: invoiceDetails.notes || "Thanks for your Business...",
  gst: 0,
  cgst: parseFloat(invoiceDetails.cgst) || 0,
  sgst: parseFloat(invoiceDetails.sgst) || 0,
  igst: parseFloat(invoiceDetails.igst) || 0,
  discount: parseFloat(invoiceDetails.discount) || 0,
  discountPercentage: Number(parseFloat(invoiceDetails.discountPct) || 0).toFixed(2), 
  isDiscountPercentage: inferredIsPercent,
  roundOff: parseFloat(invoiceDetails.roundOff) || 0,
  subTotal: parseFloat(invoiceDetails.subTotal) || 0,
  totalAmount: baseGrandTotal,
  cgstAmnt: parseFloat(invoiceDetails.cgstAmnt) || 0,
  sgstAmnt: parseFloat(invoiceDetails.sgstAmnt) || 0,
  igstAmnt: parseFloat(invoiceDetails.igstAmnt) || 0,
  grandTotal: baseGrandTotal,
  cashPayment: parseFloat(invoiceDetails.cashPayment) || 0,     
chequePayment: parseFloat(invoiceDetails.chequePayment) || 0,
});

          setFoodTax(invoiceDetails.foodTax || "0");
setServiceTax(invoiceDetails.serviceTax || "0");
setVatTax(invoiceDetails.vatTax || "0");
setFoodTaxAmount(formatAmount(invoiceDetails.foodTaxAmount || 0));
setFoodTaxTotalAmount(formatAmount(invoiceDetails.foodTaxTotalAmount || 0));
setServiceTaxAmount(formatAmount(invoiceDetails.serviceTaxAmount || 0));
setServiceTaxTotalAmount(formatAmount(invoiceDetails.serviceTaxTotalAmount || 0));
setVatTaxAmount(formatAmount(invoiceDetails.vatTaxAmount || 0));
setVatTaxTotalAmount(formatAmount(invoiceDetails.vatTaxTotalAmount || 0));
 initialInvoiceSnapshotRef.current = {
            rows: JSON.parse(JSON.stringify(mappedRows.length > 0 ? mappedRows : rows)),
            billingname: invoiceDetails.billingname || "",
            billingaddress: invoiceDetails.billingaddress || "",
            shipname: invoiceDetails.shipname || "",
            shipaddress: invoiceDetails.shipaddress || "",
            gstnumber: invoiceDetails.gstnumber || "",
            invoiceCode: invoiceDetails.invoiceCode || "",
            invoiceDate: invoiceDetails.createdAt ? invoiceDetails.createdAt.split("T")[0] : "",
            dueDate: invoiceDetails.duedate || "",
            notes: invoiceDetails.notes || "",
            cgst: invoiceDetails.cgst || 0,
            cgstAmnt: invoiceDetails.cgstAmnt || 0,
            sgst: invoiceDetails.sgst || 0,
            sgstAmnt: invoiceDetails.sgstAmnt || 0,
            igst: invoiceDetails.igst || 0,
            igstAmnt: invoiceDetails.igstAmnt || 0,
            discount: invoiceDetails.discount || 0,
            discountPct: invoiceDetails.discountPct || 0,      
isDiscountPercent: inferredIsPercent,   
            roundOff: invoiceDetails.roundOff || 0,
            subTotal: invoiceDetails.subTotal || 0,
            grandTotal: baseGrandTotal,
            cashPayment: parseFloat(invoiceDetails.cashPayment) || 0,
            chequePayment: parseFloat(invoiceDetails.chequePayment) || 0,
            foodTax: invoiceDetails.foodTax || "0",
            foodTaxAmount: formatAmount(invoiceDetails.foodTaxAmount || 0),
            serviceTax: invoiceDetails.serviceTax || "0",
            serviceTaxAmount: formatAmount(invoiceDetails.serviceTaxAmount || 0),
            vatTax: invoiceDetails.vatTax || "0",
            vatTaxAmount: formatAmount(invoiceDetails.vatTaxAmount || 0),
            payments: JSON.parse(
              JSON.stringify(
                invoiceDetails?.eventInvoicePayments?.length > 0
                  ? invoiceDetails.eventInvoicePayments.map((p) => ({
                      id: p.id || 0,
                      advancePayment: p.advancePayment || 0,
                      advancePaymentDate: p.advancePaymentDate || "",
                      advancePaymentNotes: p.advancePaymentNotes || "",
                      paymentMode: p.paymentMode || "",
                      bankId: p.bankId || null,
                      cashAccountId: p.cashAccountId || null,
                    }))
                  : [],
              ),
            ),
          };
        } else {
          message.warning("No invoice data found");
        }
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error);
      message.error("Failed to load invoice data");
    } finally {
      setLoading(false);
    }
  };

 const handleInputChange = (index, field, value) => {
  setIsEdited(true);
  const updatedRows = rows.map((row, i) =>
    i === index ? { ...row, [field]: value } : row,
  );

  if (field === "person" || field === "extra" || field === "rate" || field === "extraTaxPct") {
    const person = parseFloat(updatedRows[index].person) || 0;
    const extra = parseFloat(updatedRows[index].extra) || 0;
    const rate = parseFloat(updatedRows[index].rate) || 0;
    const extraTaxPct = parseFloat(updatedRows[index].extraTaxPct) || 0;

    if (person > 0 || rate > 0) {
      const base = (person + extra) * rate;
      const taxAmt = (base * extraTaxPct) / 100;
      updatedRows[index] = {
        ...updatedRows[index],
        taxRate: taxAmt,
        amount: base + taxAmt,
      };
    }
  } else if (field === "taxRate") {
    // manual override of the tax amount — recompute amount from base + manual tax
    const person = parseFloat(updatedRows[index].person) || 0;
    const extra = parseFloat(updatedRows[index].extra) || 0;
    const rate = parseFloat(updatedRows[index].rate) || 0;
    const manualTax = parseFloat(value) || 0;
    const base = (person + extra) * rate;
    updatedRows[index] = {
      ...updatedRows[index],
      amount: base + manualTax,
    };
  }

  setRows(updatedRows);
};
  

  const handleRateBlur = (index) => {
  if (!isOfferRateUser) return;

  const roleId = getUserRoleId();
  const restrictedRole = roleId !== null && roleId !== 1 && roleId !== 2;
  if (!restrictedRole) return;

  const currentRow = rows[index];
  const original = originalRows.find((r) => r.key === currentRow.key);

  const actualRate = parseFloat(original?.rate) || 0;
  const newRate = parseFloat(currentRow.rate) || 0;
  const decrease = actualRate - newRate;

  if (decrease > 25) {
    message.error("You are not eligible to decrease rate from limit");
    handleInputChange(index, "rate", actualRate.toString());
  }
};

  const handleDeleteRow = (key) => {
    setIsEdited(true);
    setRows(rows.filter((row) => row.key !== key));
  };

  const handleAddRow = () => {
    setIsEdited(true);
    setRows([
      ...rows,
      {
        key: `${rows.length + 1}-${Math.random()}`,
        name: "",
        date: "",
        person: "",
        extra: 0,
        rate: 0,
         offeredRate: 0,
        amount: 0,
        isCustom: true,
        isEventFunction: false,
        id: 0,
        isNewRow: true,
      },
    ]);
  };

  const handleFooterDataChange = (newFooterData) => {
    setIsEdited(true);
    setFooterData(newFooterData);
  };

  const toggleEdit = (field) => {
    setEditStates((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleTempValueChange = (field, value) => {
    setIsEdited(true);
    setTempValues((prev) => ({ ...prev, [field]: value }));
  };

  const saveChanges = (field) => {
    setInvoiceData((prev) => ({ ...prev, ...tempValues }));
    toggleEdit(field);
    message.success("Changes saved successfully");
  };

  const cancelChanges = (field) => {
    setTempValues({
      billingaddress: invoiceData?.billingaddress || "",
      billingname: invoiceData?.billingname || "",
      shipaddress: invoiceData?.shipaddress || "",
      shipname: invoiceData?.shipname || "",
      gstnumber: invoiceData?.gstnumber || "",
    });
    toggleEdit(field);
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    // already DD/MM/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      return dateString;
    }

    // ISO date support
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };
  if (loading) {
    return (
      <Container>
        <div className="flex justify-center items-center h-96">
          <Spin size="large" />
        </div>
      </Container>
    );
  }

  const handleSaveInvoice = async (silent = false) => {
    const UserId = localStorage.getItem("userId");

    try {
      setIsSaving(true);
      const formatDateForAPI = (date) => {
        if (!date) return null;
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const hours = d.getHours();
        const minutes = String(d.getMinutes()).padStart(2, "0");
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = String(hours % 12 || 12).padStart(2, "0");
        return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
      };

      const convertDisplayDateToAPI = (displayDate) => {
        if (!displayDate) return null;
        try {
          if (/^\d{2}\/\d{2}\/\d{4}$/.test(displayDate))
            return `${displayDate} 12:00 AM`;
          if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2} (AM|PM)$/.test(displayDate))
            return displayDate;
          const monthMap = {
            Jan: "01",
            Feb: "02",
            Mar: "03",
            Apr: "04",
            May: "05",
            Jun: "06",
            Jul: "07",
            Aug: "08",
            Sep: "09",
            Oct: "10",
            Nov: "11",
            Dec: "12",
          };
          const parts = displayDate.split(" ");
          if (parts.length === 3) {
            const day = parts[0].padStart(2, "0");
            const month = monthMap[parts[1]];
            const year = parts[2];
            if (month) return `${day}/${month}/${year} 12:00 AM`;
          }
          const date = new Date(displayDate);
          if (!isNaN(date.getTime())) {
            const d = String(date.getDate()).padStart(2, "0");
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const y = date.getFullYear();
            return `${d}/${m}/${y} 12:00 AM`;
          }
          return null;
        } catch (error) {
          console.error("Error converting date:", displayDate, error);
          return null;
        }
      };

      const foodTaxPct = parseFloat(foodTax) || 0;
const serviceTaxPct = parseFloat(serviceTax) || 0;
const vatTaxPct = parseFloat(vatTax) || 0;
const foodTaxAmt = parseFloat(foodTaxAmount) || 0;
const serviceTaxAmt = parseFloat(serviceTaxAmount) || 0;
const vatTaxAmt = parseFloat(vatTaxAmount) || 0;

const foodTaxTotalAmt = (foodTaxAmt * foodTaxPct) / 100;
const serviceTaxTotalAmt = (serviceTaxAmt * serviceTaxPct) / 100;
const vatTaxTotalAmt = (vatTaxAmt * vatTaxPct) / 100;

const combinedGrandTotal =
  (footerData.grandTotal || 0) +
  foodTaxTotalAmt +
  serviceTaxTotalAmt +
  vatTaxTotalAmt;
const combinedRemaining = combinedGrandTotal - totalAdvancePaid;

      const payload = {
        billingaddress: tempValues.billingaddress || "",
        billingname: tempValues.billingname || "",
        cgst: String(footerData.cgst),
        cgstAmnt: footerData.cgstAmnt,
        discount: footerData.discount,
 discountPct: Number(parseFloat(footerData.discountPercentage) || 0).toFixed(2),
isDiscountPercent: footerData.isDiscountPercentage || false,
         cashPayment: footerData.cashPayment || 0,     
  chequePayment: footerData.chequePayment || 0,
        duedate: dueDate ? dueDate.format("DD/MM/YYYY") : "",
        eventId: eventId,
        eventInvoiceFunctionPayments:
  payments.length > 0
    ? payments.map((p) => ({
        advancePayment: Number(p.advancePayment) || 0,
        advancePaymentDate:
          p.advancePaymentDate || formatDateForAPI(new Date()),
        advancePaymentNotes: p.advancePaymentNotes || "",
        paymentMode: p.paymentMode || "",
        bankId: p.paymentMode === "Bank Transfer" ? Number(p.bankId) || null : null,
        cashAccountId: p.paymentMode === "Cash" ? Number(p.cashAccountId) || null : null,
        id: p.id || 0,
        vendorCode: p.vendorCode || "",
      }))
    : [
        {
          advancePayment: 0,
          advancePaymentDate: formatDateForAPI(new Date()),
          advancePaymentNotes: "",
          id: 0,
          paymentMode: "",
          bankId: null,
          cashAccountId: null,
          vendorCode: "",
        },
      ],
        grandTotal: combinedGrandTotal,
  remainingAmount: combinedRemaining,
  totalAmount: combinedGrandTotal - combinedRemaining,
  foodTax: `${foodTaxPct}`,
  foodTaxAmount: foodTaxAmt,
  foodTaxTotalAmount: foodTaxTotalAmt,
  serviceTax: `${serviceTaxPct}`,
  serviceTaxAmount: serviceTaxAmt,
  serviceTaxTotalAmount: serviceTaxTotalAmt,
  vatTax: `${vatTaxPct}`,
  vatTaxAmount: vatTaxAmt,
  vatTaxTotalAmount: vatTaxTotalAmt,
        gstnumber: tempValues.gstnumber || "",
        igst: String(footerData.igst),
        invoiceCode : invoiceCode,
        igstAmnt: footerData.igstAmnt,
        invoiceFunctionItems: rows.map((r) => ({
          amount: Number(r.amount) || 0,
          extraPax: Number(r.extra) || 0,
          functionDate: convertDisplayDateToAPI(r.date),
          functionName: r.name || "",
          id: r.id || 0,
          isEventFunction: !r.isCustom,
          pax: Number(r.person) || 0,
          ratePerPlate: Number(r.rate) || 0,
          offeredRate: Number(r.offeredRate) || 0,
          extraTax: Number(r.extraTaxPct) || 0,
          taxRate: Number(r.taxRate) || 0, 
          extraChargesId: r.extraChargesId || null,
    isExtraCharges: r.isExtraCharges || false,
        })),
        notes: footerData.notes,
        
        roundOff: footerData.roundOff,
        sgst: String(footerData.sgst),
        sgstAmnt: footerData.sgstAmnt,
        shipaddress: tempValues.shipaddress || "",
        shipname: tempValues.shipname || "",
        subTotal: footerData.subTotal,
        
        userId: UserId,
      };

      const invId = invoiceData?.id || -1;
      const response = await UpdateInvoice(invId, payload);

       if (response?.data?.success === true) {
        const isUpdate = !!invoiceData?.id;

        try {
          const changeSummary = buildInvoiceChangeSummary(
            initialInvoiceSnapshotRef.current,
            {
              rows,
              billingname: tempValues.billingname,
              billingaddress: tempValues.billingaddress,
              shipname: tempValues.shipname,
              shipaddress: tempValues.shipaddress,
              gstnumber: tempValues.gstnumber,
              invoiceCode,
              invoiceDate,
              dueDate: dueDate ? dueDate.format("DD/MM/YYYY") : "",
              notes: footerData.notes,
              cgst: footerData.cgst,
              cgstAmnt: footerData.cgstAmnt,
              sgst: footerData.sgst,
              sgstAmnt: footerData.sgstAmnt,
              igst: footerData.igst,
              igstAmnt: footerData.igstAmnt,
              discount: footerData.discount,
               discountPct: footerData.discountPercentage || 0,          
              isDiscountPercent: footerData.isDiscountPercentage || false,
              roundOff: footerData.roundOff,
              subTotal: footerData.subTotal,
              grandTotal: combinedGrandTotal,
              cashPayment: footerData.cashPayment,
              chequePayment: footerData.chequePayment,
              foodTax: foodTaxPct,
              foodTaxAmount: foodTaxAmt,
              serviceTax: serviceTaxPct,
              serviceTaxAmount: serviceTaxAmt,
              vatTax: vatTaxPct,
              vatTaxAmount: vatTaxAmt,
              payments,
            },
          );

          const userEmail = getUserEmail() || "Unknown User";
          const description =
            `Invoice ${isUpdate ? "Updated" : "Saved"}\n` +
            `Event: ${invoiceData?.event?.eventType?.nameEnglish || "N/A"} (ID: ${eventId})\n` +
            `Party: ${invoiceData?.event?.party?.nameEnglish || "N/A"}\n` +
            `Venue: ${invoiceData?.event?.venue?.nameEnglish || "N/A"}\n` +
            `Grand Total: ₹${combinedGrandTotal}\n` +
            `Total Advance: ₹${totalAdvancePaid}\n` +
            `Remaining: ₹${combinedRemaining}\n` +
            `${changeSummary}\n` +
            `Updated By: ${userEmail}`;

          await AddLogs({
            id: 0,
            eventId: Number(eventId) || 0,
            description,
            eventType: isUpdate ? "Invoice_Update" : "Invoice_Save",
            user: userEmail,
          });
        } catch (logErr) {
          console.error("Invoice log failed (non-blocking):", logErr);
        }

        setIsEdited(false);
        setRows((prevRows) =>
          prevRows.map((row) => ({ ...row, isNewRow: false, isCustom: true })),
        );
        await fetchInvoiceData();
        message.success("Invoice saved successfully!");

        if (silent) {
          setIsInvoiceThemeOpen(true); // ✅ Only open modal when called from print
        }
      } else {
        message.error(response?.data?.msg || "Failed to save invoice");
      }
    } catch (error) {
      console.error("Full error:", error);
      message.error("Something went wrong while saving");
    } finally {
      setIsSaving(false);
      setLoadingPdf(false);
    }
  };

  const handlePrintClick = async () => {
    setLoadingPdf(true);
    try {
      await handleSaveInvoice(true);
    } catch (error) {
      message.error("Failed to save invoice before printing");
    } finally {
      setLoadingPdf(false);
    }
  };
  return (
    <Fragment>
      <style>{responsiveStyles}</style>
      <Container>
        <div className="gap-2 mb-3">
          <Breadcrumbs
            items={[
              {
                title: (
                  <FormattedMessage
                    id="INVOICE.TAX_INVOICE"
                    defaultMessage="Tax Invoice"
                  />
                ),
              },
            ]}
          />
        </div>

        <div className="flex flex-col bg-gray-100 rounded mb-7">
          <div className="flex flex-col bg-white rounded ">
            <div className="card min-w-full rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg mb-5">
              <div className="flex flex-col p-4 gap-4">
                {/* Event Name - Full Width */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
  <div>
    <p className="text-base lg:text-lg font-semibold text-gray-900">
      <FormattedMessage
        id="INVOICE.EVENT_NAME"
        defaultMessage="Event Name"
      />
      : {invoiceData?.event?.eventType?.nameEnglish || "Sangeet"}
    </p>
  </div>

<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
        Invoice Code
      </label>

      <input
        type="text"
          value={invoiceCode}
        onChange={(e) => setInvoiceCode(e.target.value)}
        className="input input-sm min-w-[180px]"
        placeholder="Invoice Code"
      />
    </div>

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
  <Link to={`/edit-event/${eventId}`}>
  <button className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors">
    <i className="ki-filled ki-notepad-edit me-1"></i>
    <FormattedMessage
      id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_EDIT_EVENT_BUTTON"
      defaultMessage="Edit Event"
    />
  </button>
</Link>
    <button
      className="btn btn-primary w-full sm:w-auto"
      onClick={handlePrintClick}
      disabled={loadingPdf}
    >
      <i className="ki-filled ki-printer"></i>
      {loadingPdf ? (
        "Saving..."
      ) : (
        <FormattedMessage
          id="COMMON.PRINT"
          defaultMessage="Print"
        />
      )}
    </button>
  </div>
</div>

                {/* Event Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  <div className="flex items-start gap-3">
                    <i className="ki-filled ki-user text-success text-lg flex-shrink-0 mt-1"></i>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-gray-600">
                        <FormattedMessage
                          id="INVOICE.PARTY_NAME"
                          defaultMessage="Party name"
                        />
                        :
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {invoiceData?.event?.party?.nameEnglish || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <i className="ki-filled ki-geolocation-home text-success text-lg flex-shrink-0 mt-1"></i>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-gray-600">
                        <FormattedMessage
                          id="INVOICE.VENUE_NAME"
                          defaultMessage="Venue name"
                        />
                        :
                      </span>
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {invoiceData?.event?.venue?.nameEnglish || "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <i className="ki-filled ki-calendar-tick text-success text-lg flex-shrink-0 mt-1"></i>
                    <div className="flex flex-col min-w-0 w-full">
                      <span className="text-xs text-gray-600">
                        <FormattedMessage
                          id="INVOICE.INVOICE_DATE"
                          defaultMessage="Invoice Date"
                        />
                        :
                      </span>
                      <div className="flex items-center gap-2 w-full">
                        {!isEditing ? (
                          <>
                            <span className="text-sm font-medium text-gray-900">
                              {invoiceDate}
                            </span>
                            <button
                              type="button"
                              className="text-primary hover:text-primary-dark"
                              onClick={() => setIsEditing(true)}
                            >
                              <i className="ki-filled ki-pencil text-sm"></i>
                            </button>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 w-full">
                            <input
                              type="date"
                              value={invoiceDate}
                              onChange={(e) => {
                                setInvoiceDate(e.target.value);
                                setIsEdited(true);
                              }}
                              className="input text-sm py-1 px-2 flex-1"
                              autoFocus
                            />
                            <button
                              type="button"
                              className="text-success hover:text-success-dark"
                              onClick={() => setIsEditing(false)}
                            >
                              <i className="ki-filled ki-check text-sm"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <i className="ki-filled ki-calendar-tick text-success text-lg flex-shrink-0 mt-1"></i>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-gray-600">
                        <FormattedMessage
                          id="INVOICE.EVENT_DATE"
                          defaultMessage="Event Date"
                        />
                        :
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(invoiceData?.event?.eventStartDateTime)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <i className="ki-filled ki-calendar-tick text-success text-lg flex-shrink-0 mt-1"></i>
                    <div className="flex flex-col min-w-0 w-full">
                      <span className="text-xs text-gray-600">
                        <FormattedMessage
                          id="INVOICE.DUE_DATE"
                          defaultMessage="Due Date"
                        />
                        :
                      </span>
                      <DatePicker
                        format="DD/MM/YYYY"
                        className="input w-full text-sm"
                        value={dueDate}
                        placeholder="Select due date"
                        onChange={(date) => {
                          setDueDate(date);
                          setIsEdited(true);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Billing */}
            <div className="flex flex-col border rounded-xl mb-5">
              <div className="grid md:grid-cols-2 rounded">
                {/* Billing Address */}
                <div className="border-r p-4 rounded">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    <FormattedMessage
                      id="INVOICE.CATERING_DETAILS"
                      defaultMessage="Catering Details"
                    />
                    :
                    {editStates.billingAddress ? (
                      <>
                        <Tooltip title={<FormattedMessage id="COMMON.SAVE" />}>
                          <CheckOutlined
                            className="text-green-600 ms-2 cursor-pointer"
                            onClick={() => saveChanges("billingAddress")}
                          />
                        </Tooltip>
                        <Tooltip
                          title={<FormattedMessage id="COMMON.CANCEL" />}
                        >
                          <CloseOutlined
                            className="text-red-600 ms-2 cursor-pointer"
                            onClick={() => cancelChanges("billingAddress")}
                          />
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title={<FormattedMessage id="COMMON.EDIT" />}>
                        <EditOutlined
                          className="text-primary ms-2 cursor-pointer"
                          onClick={() => toggleEdit("billingAddress")}
                        />
                      </Tooltip>
                    )}
                  </h4>
                  {editStates.billingAddress ? (
                    <div className="space-y-2">
                      <TextArea
                        value={tempValues.billingaddress}
                        onChange={(e) =>
                          handleTempValueChange(
                            "billingaddress",
                            e.target.value,
                          )
                        }
                        placeholder={intl.formatMessage({
                          id: "PLACEHOLDER.ENTER_BILLING_ADDRESS",
                          defaultMessage: "Enter billing address",
                        })}
                        rows={3}
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">
                      {invoiceData?.billingaddress || (
                        <FormattedMessage id="COMMON.NA" />
                      )}
                      <br />
                    </p>
                  )}
                </div>

                {/* Shipping Address */}
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3">
                    <FormattedMessage
                      id="INVOICE.BILLING_TO"
                      defaultMessage="Billing To"
                    />
                    :
                    {editStates.shippingAddress ? (
                      <>
                        <Tooltip title={<FormattedMessage id="COMMON.SAVE" />}>
                          <CheckOutlined
                            className="text-green-600 ms-2 cursor-pointer"
                            onClick={() => saveChanges("shippingAddress")}
                          />
                        </Tooltip>
                        <Tooltip
                          title={<FormattedMessage id="COMMON.CANCEL" />}
                        >
                          <CloseOutlined
                            className="text-red-600 ms-2 cursor-pointer"
                            onClick={() => cancelChanges("shippingAddress")}
                          />
                        </Tooltip>
                      </>
                    ) : (
                      <Tooltip title={<FormattedMessage id="COMMON.EDIT" />}>
                        <EditOutlined
                          className="text-primary ms-2 cursor-pointer"
                          onClick={() => toggleEdit("shippingAddress")}
                        />
                      </Tooltip>
                    )}
                  </h4>
                  <div className="flex items-start">
                    {editStates.shippingAddress ? (
                      <div className="space-y-2 w-full">
                        <TextArea
                          value={tempValues.shipaddress}
                          onChange={(e) =>
                            handleTempValueChange("shipaddress", e.target.value)
                          }
                          placeholder={intl.formatMessage({
                            id: "PLACEHOLDER.ENTER_SHIPPING_ADDRESS",
                            defaultMessage: "Enter shipping address",
                          })}
                          rows={3}
                        />
                        <Input
                          value={tempValues.shipname}
                          onChange={(e) =>
                            handleTempValueChange("shipname", e.target.value)
                          }
                          placeholder={intl.formatMessage({
                            id: "PLACEHOLDER.ENTER_SHIPPING_NAME",
                            defaultMessage: "Enter shipping name",
                          })}
                        />
                      </div>
                    ) : invoiceData?.shipaddress ? (
                      <p className="text-sm text-gray-700">
                        {invoiceData.shipaddress}
                        <br />
                        {invoiceData.shipname || ""}
                      </p>
                    ) : (
                      <div>
                        <span className="text-sm text-primary">+</span>
                        <span className="text-sm text-primary cursor-pointer ms-1 hover:underline">
                          <FormattedMessage
                            id="INVOICE.ADD_NEW_ADDRESS"
                            defaultMessage="Add a New Address"
                          />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* GST Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 border-t">
                <div className="p-4 border-b md:border-b-0 md:border-r">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        <FormattedMessage
                          id="INVOICE.BILLING_NAME"
                          defaultMessage="Billing Name"
                        />
                      </span>
                      {!editStates.billingName && (
                        <Tooltip title={<FormattedMessage id="COMMON.EDIT" />}>
                          <button
                            className="text-primary hover:text-primary-dark p-1"
                            onClick={() => toggleEdit("billingName")}
                          >
                            <EditOutlined />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                    {editStates.billingName ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={tempValues.billingname}
                          onChange={(e) =>
                            handleTempValueChange("billingname", e.target.value)
                          }
                          placeholder={intl.formatMessage({
                            id: "PLACEHOLDER.ENTER_BILLING_NAME",
                            defaultMessage: "Enter billing name",
                          })}
                          className="flex-1"
                        />
                        <Tooltip title={<FormattedMessage id="COMMON.SAVE" />}>
                          <button
                            className="text-green-600 hover:text-green-700 p-1"
                            onClick={() => saveChanges("billingName")}
                          >
                            <CheckOutlined />
                          </button>
                        </Tooltip>
                        <Tooltip
                          title={<FormattedMessage id="COMMON.CANCEL" />}
                        >
                          <button
                            className="text-red-600 hover:text-red-700 p-1"
                            onClick={() => cancelChanges("billingName")}
                          >
                            <CloseOutlined />
                          </button>
                        </Tooltip>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-700">
                        {tempValues.billingname || (
                          <FormattedMessage id="COMMON.NA" />
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        <FormattedMessage
                          id="INVOICE.GST_NUMBER"
                          defaultMessage="GST Number"
                        />
                      </span>
                      {!editStates.gstNumber && (
                        <Tooltip title={<FormattedMessage id="COMMON.EDIT" />}>
                          <button
                            className="text-primary hover:text-primary-dark p-1"
                            onClick={() => toggleEdit("gstNumber")}
                          >
                            <EditOutlined />
                          </button>
                        </Tooltip>
                      )}
                    </div>
                    {editStates.gstNumber ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={tempValues.gstnumber}
                          onChange={(e) =>
                            handleTempValueChange("gstnumber", e.target.value)
                          }
                          placeholder={intl.formatMessage({
                            id: "PLACEHOLDER.ENTER_GST_NUMBER",
                            defaultMessage: "Enter GST number",
                          })}
                          className="flex-1"
                        />
                        <Tooltip title={<FormattedMessage id="COMMON.SAVE" />}>
                          <button
                            className="text-green-600 hover:text-green-700 p-1"
                            onClick={() => saveChanges("gstNumber")}
                          >
                            <CheckOutlined />
                          </button>
                        </Tooltip>
                        <Tooltip
                          title={<FormattedMessage id="COMMON.CANCEL" />}
                        >
                          <button
                            className="text-red-600 hover:text-red-700 p-1"
                            onClick={() => cancelChanges("gstNumber")}
                          >
                            <CloseOutlined />
                          </button>
                        </Tooltip>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-700">
                        {tempValues.gstnumber || (
                          <FormattedMessage id="COMMON.NA" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <ItemTable
  rows={rows}
  onInputChange={handleInputChange}
  onAddRow={handleAddRow}
  onDeleteRow={handleDeleteRow}
  isOfferRateUser={isOfferRateUser}
  onRateBlur={handleRateBlur}
  hideTaxColumns={hideTaxColumns}
/>
            {/* Advance Payments Section */}
            <div className="border rounded-xl mb-5 p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-900">
                  Advance Payments
                </h4>
                <button
  className="btn btn-sm btn-primary"
  onClick={() =>
    setPayments((prev) => [
      ...prev,
      {
        id: 0,
        advancePayment: 0,
        advancePaymentDate: dayjs().format("DD/MM/YYYY hh:mm A"),
        advancePaymentNotes: "",
        paymentMode: "",
        bankId: null,
        cashAccountId: null,
        vendorCode: "",
      },
    ])
  }
>
  + Add Payment
</button>
              </div>

              {payments.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No advance payments added.
                </p>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-3 gap-3 border rounded-lg p-3 bg-gray-50"
                    >
                      {/* Amount */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">
                          Amount (₹)
                        </label>
                        <Input
                          type="tel"
                          value={payment.advancePayment}
                          onChange={(e) => {
                            const updated = [...payments];
                            updated[index].advancePayment =
                              Number(e.target.value) || 0;
                            setPayments(updated);
                            setIsEdited(true);
                          }}
                          placeholder="Enter amount"
                        />
                      </div>

                      {/* Date */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">
                          Payment Date
                        </label>
                        <DatePicker
                          format="DD/MM/YYYY"
                          className="w-full"
                          value={
                            payment.advancePaymentDate
                              ? dayjs(payment.advancePaymentDate, [
                                  "DD/MM/YYYY hh:mm A",
                                  "DD/MM/YYYY",
                                ])
                              : null
                          }
                          onChange={(date) => {
                            const updated = [...payments];
                            updated[index].advancePaymentDate = date
                              ? date.format("DD/MM/YYYY hh:mm A")
                              : "";
                            setPayments(updated);
                            setIsEdited(true);
                          }}
                        />
                      </div>

                      {/* Notes + Delete */}
                      <div>
                        <label className="text-xs font-semibold text-gray-500 mb-1 block">
                          Notes
                        </label>
                        <div className="flex gap-2">
                          <Input
                            value={payment.advancePaymentNotes}
                            onChange={(e) => {
                              const updated = [...payments];
                              updated[index].advancePaymentNotes =
                                e.target.value;
                              setPayments(updated);
                              setIsEdited(true);
                            }}
                            placeholder="Notes (optional)"
                          />
                          <button
                            className="text-red-500 hover:text-red-700 px-2"
                            onClick={() => {
                              setPayments((prev) =>
                                prev.filter((_, i) => i !== index),
                              );
                              setIsEdited(true);
                            }}
                          >
                            <i className="ki-filled ki-trash text-sm"></i>
                          </button>
                        </div>
                      </div>
                      {/* Payment Mode */}
<div>
  <label className="text-xs font-semibold text-gray-500 mb-1 block">
    Payment Mode
  </label>
  <select
    className="input w-full"
    value={payment.paymentMode || ""}
    onChange={(e) => {
      const updated = [...payments];
      updated[index].paymentMode = e.target.value;
      updated[index].bankId = null;
      updated[index].cashAccountId = null;
      setPayments(updated);
      setIsEdited(true);
    }}
  >
    <option value="">Select Mode</option>
    <option value="Cash">Cash</option>
    <option value="Bank Transfer">Bank</option>
  </select>
</div>

{/* Bank dropdown */}
{payment.paymentMode === "Bank Transfer" && (
  <div>
    <label className="text-xs font-semibold text-gray-500 mb-1 block">
      Select Bank
    </label>
    <select
      className="input w-full"
      value={payment.bankId || ""}
      onChange={(e) => {
        const updated = [...payments];
        updated[index].bankId = e.target.value;
        setPayments(updated);
        setIsEdited(true);
      }}
    >
      <option value="">Select Bank</option>
      {bankDetails.map((bank) => (
        <option key={bank.id} value={bank.id}>
          {bank.bankName || bank.accountHolderName || bank.name || `Bank ${bank.id}`}
        </option>
      ))}
    </select>
  </div>
)}

{/* Cash Account dropdown */}
{payment.paymentMode === "Cash" && (
  <div>
    <label className="text-xs font-semibold text-gray-500 mb-1 block">
      Select Cash Account
    </label>
    <select
      className="input w-full"
      value={payment.cashAccountId || ""}
      onChange={(e) => {
        const updated = [...payments];
        updated[index].cashAccountId = e.target.value;
        setPayments(updated);
        setIsEdited(true);
      }}
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
                  ))}
                </div>
              )}

              {/* Summary */}
              <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-end text-sm font-medium">
  <span className="text-gray-600">
    Grand Total:{" "}
    <span className="text-gray-900 font-bold">
      ₹{finalGrandTotal.toFixed(2)}
    </span>
  </span>
  <span className="text-gray-600">
    Total Advance:{" "}
    <span className="text-green-600 font-bold">
      ₹{totalAdvancePaid.toFixed(2)}
    </span>
  </span>
  <span className="text-gray-600">
    Remaining Amount:{" "}
    <span className="font-bold text-red-600">
      ₹{finalRemainingAmount.toFixed(2)}
    </span>
  </span>
</div>
            </div>

             {(isTaxUser || isVatUser) && (
  <div className="flex flex-col border rounded-xl mb-5 bg-gray-50 font-bold p-4">
   {[
  ...(isTaxUser
    ? [
        { label: "Food Tax", pct: foodTax, onPctChange: handleFoodTaxChange, amt: foodTaxAmount, onAmtChange: handleFoodTaxAmountChange, total: foodTaxTotalAmount },
        { label: "Service Tax", pct: serviceTax, onPctChange: handleServiceTaxChange, amt: serviceTaxAmount, onAmtChange: handleServiceTaxAmountChange, total: serviceTaxTotalAmount },
      ]
    : []),
  ...(isVatUser
    ? [{ label: "VAT", pct: vatTax, onPctChange: handleVatTaxChange, amt: vatTaxAmount, onAmtChange: handleVatTaxAmountChange, total: vatTaxTotalAmount }]
    : []),

    ].map((tax) => (
      <div key={tax.label} className="flex items-center justify-end gap-6 py-1">
        <div className="text-base flex place-content-start font-normal text-gray-700 w-[100px]">
          {tax.label}
        </div>
        <div className="flex items-center input text-base text-gray-900 w-[100px]">
          <input
            className="h-full text-gray-900 w-[60px]"
            value={tax.pct}
            type="tel"
            min="0"
            placeholder="0"
            onChange={(e) => tax.onPctChange(e.target.value)}
          />
          <span className="text-gray-500">%</span>
        </div>
        <div className="flex items-center input text-base text-gray-900 w-[140px]">
          <span className="text-gray-500 ml-1">&#8377;</span>
          <input
            className="h-full text-gray-900 w-full ml-1"
            value={tax.amt}
            type="tel"
            min="0"
            placeholder="0"
            onChange={(e) => tax.onAmtChange(e.target.value)}
          />
        </div>
        <div className="text-base font-bold text-gray-900 w-[160px] text-right">
          &#8377; {tax.total}
        </div>
      </div>
    ))}
  </div>
)}

            <InvoiceFooter
  invoiceData={invoiceData}
  rows={rows}
  permissionInvoice={permissionInvoice}
  footerData={footerData}
  onFooterDataChange={handleFooterDataChange}
  onSave={() => handleSaveInvoice(false)}
  isEdited={isEdited}
  bankDetails={primaryBank}
  extraTaxTotal={extraTaxTotal}
/>

          
          </div>
        </div>
      </Container>
      <InvoiceTheme
        open={isInvoiceThemeOpen}
        onClose={() => setIsInvoiceThemeOpen(false)}
        eventId={eventId}
        isinvoice={0}
         mobileNumber={invoiceData?.event?.mobileno || invoiceData?.event?.party?.mobileno}
  partyName={invoiceData?.event?.party?.nameEnglish}
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
    </Fragment>
  );
};

export default AddInvoicePage;
