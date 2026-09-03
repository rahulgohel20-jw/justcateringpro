import React, { useState, useRef, useEffect } from "react";
import { DatePicker } from "antd";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { UploadOutlined } from "@ant-design/icons";
import { message } from "antd";
import { FormattedMessage } from "react-intl";
import { Input } from "antd";
import {
  SuperAdminAddInvoice,
  GetbankdetailsbyuserId,
  GetAllMemberByUserId,
  getAllByRoleId,
  GetALLMemberDetailsByID,
  updateSuperAdminInvoice,
  GETSuperadmininvoicebyid,
  getsuperadmingenerateInvoiceCode,
} from "@/services/apiServices";

const { TextArea } = Input;


const log = (label, data) => {
  const time = new Date().toISOString().split("T")[1].split(".")[0];

};
const logErr = (label, err) => {
  const time = new Date().toISOString().split("T")[1].split(".")[0];
  console.error(`[${time}] 🔴 ${label}`, err);
  console.error(`[${time}] 🔴 response:`, err?.response?.data);
  console.error(`[${time}] 🔴 status:`, err?.response?.status);
  console.error(`[${time}] 🔴 url:`, err?.config?.url);
};

const EditIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const PlusIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const ChevronDown = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const InfoIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);
const GripIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="9" cy="5" r="1" />
    <circle cx="9" cy="12" r="1" />
    <circle cx="9" cy="19" r="1" />
    <circle cx="15" cy="5" r="1" />
    <circle cx="15" cy="12" r="1" />
    <circle cx="15" cy="19" r="1" />
  </svg>
);

const Err = ({ msg }) =>
  msg ? (
    <p className="text-[10.5px] text-red-500 mt-0.5 leading-none">{msg}</p>
  ) : null;

const Addinvoice = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const invoiceId = searchParams.get("id");
  const today = dayjs().format("DD/MM/YYYY");

  // ✅ SEPARATE loading states — this is the main fix
  const [loading, setLoading] = useState(false); // submit only
  const [fetchingParty, setFetchingParty] = useState(false); // party fetch only
  const [fetchingInvoice, setFetchingInvoice] = useState(false); // edit load only

  const [errors, setErrors] = useState({});
  const [partyName, setPartyName] = useState("");
  const [showAddressSection, setShowAddressSection] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [billingAddress, setBillingAddress] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [isEditingShipping, setIsEditingShipping] = useState(false);
  const [billingName, setBillingName] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(today);
  const [dueDate, setDueDate] = useState(today);
  const [terms, setTerms] = useState("Due on Receipt");
  const [salesperson, setSalesperson] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [data, setData] = useState([]);
  const [discount, setDiscount] = useState("");
  const [taxPercent, setTaxPercent] = useState("0");
  const [adjustment, setAdjustment] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [partyList, setPartyList] = useState([]);
  const [loadingParties, setLoadingParties] = useState(false);
  const [partySearch, setPartySearch] = useState("");
  const [showPartyDrop, setShowPartyDrop] = useState(false);
  const [partyId, setPartyId] = useState(null);
  const [bankDetails, setBankDetails] = useState(null);
  const [salespersonList, setSalespersonList] = useState([]);
  const [expandedKey, setExpandedKey] = useState(null);

  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [draggingKey, setDraggingKey] = useState(null);
  const addressRef = useRef(null);
  const shippingRef = useRef(null);
  const userId = localStorage.getItem("userId");

  const subTotal = data.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
  const discountAmt = subTotal * ((parseFloat(discount) || 0) / 100);
  const taxableAmount = subTotal - discountAmt;
  const gstAmt = taxableAmount * ((parseFloat(taxPercent) || 0) / 100);
  const adjustmentAmt = parseFloat(adjustment) || 0;
  const grandTotal = taxableAmount + gstAmt + adjustmentAmt;

  const toggleExpand = (key) =>
    setExpandedKey((prev) => (prev === key ? null : key));

  const clearErr = (key) =>
    setErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });

  // ✅ Log initial state on mount
  useEffect(() => {
    log("COMPONENT MOUNT", {
      invoiceId,
      userId,
      today,
      env: import.meta.env.MODE,
      apiBase: import.meta.env.VITE_API_BASE_URL || "NOT SET",
    });
  }, []);

  const validate = () => {
    log("VALIDATE called", {
      partyName,
      billingAddress,
      billingName,
      invoiceNo,
      invoiceDate,
      dueDate,
      salesperson,
      itemCount: data.length,
    });

    const e = {};
    if (!partyName.trim()) e.partyName = "Customer name is required";
    if (!billingAddress.trim())
      e.billingAddress = "Billing address is required";
    if (!billingName.trim()) e.billingName = "Billing name is required";
    if (!invoiceNo.trim()) e.invoiceNo = "Invoice # is required";
    if (!invoiceDate.trim()) e.invoiceDate = "Invoice date is required";
    if (!dueDate.trim()) e.dueDate = "Due date is required";
    if (!salesperson || String(salesperson).trim() === "")
      e.salesperson = "Salesperson is required";

    if (data.length === 0) {
      e.items = "Add at least one item";
    } else {
      data.forEach((item, i) => {
        if (!item.item.trim()) e[`item_${i}_name`] = "Required";
        if (!item.itemtype) e[`item_${i}_type`] = "Required";
        const isPlan = item.itemtype === "PLAN";
        if (isPlan) {
          if (!item.amount || parseFloat(item.amount) <= 0)
            e[`item_${i}_amount`] = "Required";
        } else {
          if (!item.rate || parseFloat(item.rate) <= 0)
            e[`item_${i}_rate`] = "Required";
          if (!item.qty || parseFloat(item.qty) <= 0)
            e[`item_${i}_qty`] = "Required";
        }
      });
    }

    const isValid = Object.keys(e).length === 0;
    log("VALIDATE result", { isValid, errors: e });
    setErrors(e);
    return isValid;
  };

  const eb = (key) =>
    errors[key] ? "border-red-400 focus:border-red-400" : "";

  const addDaysToDate = (dateStr, days) => {
    if (!dateStr) return "";
    const [day, month, year] = dateStr.split("/").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const fetchInvoiceCode = async () => {
    if (invoiceId) {
      log("fetchInvoiceCode SKIP — edit mode");
      return;
    }
    log("fetchInvoiceCode START");
    try {
      const res = await getsuperadmingenerateInvoiceCode();
      log("fetchInvoiceCode RESPONSE", res?.data);
      if (res?.data?.success) setInvoiceNo(res.data.invoiceCode);
      else log("fetchInvoiceCode — success:false", res?.data);
    } catch (err) {
      logErr("fetchInvoiceCode FAILED", err);
    }
  };

  const fetchSalespersons = async () => {
    log("fetchSalespersons START", { userId });
    try {
      if (!userId) {
        log("fetchSalespersons SKIP — no userId");
        return;
      }
      const response = await GetAllMemberByUserId(userId);
      log("fetchSalespersons RESPONSE", response?.data);
      if (response?.data?.success) {
        const users = response.data.data.userDetails.UserDetails;
        if (Array.isArray(users)) {
          setSalespersonList(
            users.map((u) => ({
              value: u.id,
              label:
                `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
                u.email ||
                "Unknown",
            })),
          );
          log("fetchSalespersons SET", { count: users.length });
        } else {
          log("fetchSalespersons — UserDetails not array", users);
        }
      }
    } catch (err) {
      logErr("fetchSalespersons FAILED", err);
      setSalespersonList([]);
    }
  };

  const fetchParties = async () => {
    log("fetchParties START");
    try {
      setLoadingParties(true);
      const response = await getAllByRoleId(2, "member");
      log("fetchParties RESPONSE", response?.data);
      const users = response?.data?.data?.["User Details"]?.users;
      if (Array.isArray(users)) {
        setPartyList(
          users.map((m) => ({
            value: m.id,
            label:
              m.userBasicDetails?.companyName ||
              `${m.firstName || ""} ${m.lastName || ""}`.trim() ||
              "Unknown",
          })),
        );
        log("fetchParties SET", { count: users.length });
      } else {
        log("fetchParties — users not array", users);
      }
    } catch (err) {
      logErr("fetchParties FAILED", err);
      setPartyList([]);
    } finally {
      setLoadingParties(false);
    }
  };

  // ✅ Uses fetchingParty — does NOT touch loading
  const fetchPartyDetails = async (pid) => {
    log("fetchPartyDetails START", { pid });
    try {
      setFetchingParty(true);
      const response = await GetALLMemberDetailsByID(pid);
      log("fetchPartyDetails RESPONSE", response?.data);
      if (response?.data?.success) {
        const list = response.data.data?.["User Details"];
        if (Array.isArray(list) && list.length > 0) {
          const d = list[0];
          log("fetchPartyDetails DATA", {
            address: d.address,
            companyName: d.companyName,
            gstNumber: d.gstNumber,
            hasPlan: !!d.userPlan?.plan,
          });
          if (d.address) {
            setBillingAddress(d.address);
            setShippingAddress(d.address);
          }
          const fullName = `${d.firstName || ""} ${d.lastName || ""}`.trim();
          setBillingName(d.companyName || fullName);
          if (d.gstNumber) setGstNumber(d.gstNumber);
          if (d.userPlan?.plan) {
            const { plan } = d.userPlan;
            setData([
              {
                key: Date.now(),
                item: plan.name || "N/A",
                qty: "1",
                rate: plan.price?.toString() || "0",
                taxAmount: "0",
                amount: (plan.price || 0).toFixed(2),
                itemtype: "PLAN",
                planHistoryId: d.userPlan.id || "",
                tax: "18",
              },
            ]);
          }
          message.success("Customer details loaded");
        } else {
          log("fetchPartyDetails — empty list");
        }
      } else {
        log("fetchPartyDetails — success:false", response?.data);
      }
    } catch (err) {
      logErr("fetchPartyDetails FAILED", err);
      message.error("Failed to load customer details");
    } finally {
      setFetchingParty(false); // ✅ never blocks submit button
      log("fetchPartyDetails DONE");
    }
  };

  // ✅ Uses fetchingInvoice — does NOT touch loading
  useEffect(() => {
    if (!invoiceId) return;
    const loadInvoice = async () => {
      log("loadInvoice START", { invoiceId });
      try {
        setFetchingInvoice(true);
        const res = await GETSuperadmininvoicebyid(invoiceId);
        log("loadInvoice RESPONSE", res?.data);
        const inv = res?.data?.data;
        if (!inv) {
          log("loadInvoice — no data");
          return;
        }

        setPartyId(inv.customerId || null);
        setPartyName(inv.billingName || "");
        setShowAddressSection(true);
        setBillingAddress(inv.billingAddress || "");
        setShippingAddress(inv.shippingAddress || "");
        setBillingName(inv.billingName || "");
        setGstNumber(inv.gstNumber || "");
        setInvoiceNo(inv.invoiceCode || "");
        setInvoiceDate(inv.invoiceDate || "");
        setDueDate(inv.dueDate || "");
        setTerms(inv.terms || "Due on Receipt");
        setSalesperson(inv.salesPersonId?.toString() || "");
        setCustomerNotes(inv.customerNotes || "");
        setDiscount(inv.discountPer?.toString() || "");
        setTaxPercent(inv.gstPercent?.toString() || "0");
        setAdjustment(inv.adjust_amount?.toString() || "");

        if (Array.isArray(inv.items) && inv.items.length > 0) {
          setData(
            inv.items.map((item, i) => ({
              key: Date.now() + i,
              item: item.itemName || "",
              description: item.description || "",
              hsn: item.hsnCode || "",
              qty: item.qty?.toString() || "1",
              rate: item.rate?.toString() || "0",
              amount: item.amount?.toString() || "0",
              itemtype:
                item.itemType || (item.planHistoryId ? "PLAN" : "EXTRA"),
              tax: item.taxPercent?.toString() || "18",
              planHistoryId: item.planHistoryId || "",
              invoiceItemId: item.invoiceItemId || -1,
              taxAmount: item.taxAmount || "0",
            })),
          );
        }
        log("loadInvoice DONE", { itemCount: inv.items?.length });
      } catch (err) {
        logErr("loadInvoice FAILED", err);
        message.error("Failed to load invoice");
      } finally {
        setFetchingInvoice(false); // ✅ never blocks submit button
      }
    };
    loadInvoice();
  }, [invoiceId]);

  const handleDragStart = (key) => {
    dragItem.current = key;
    setDraggingKey(key);
  };
  const handleDragEnter = (key) => {
    dragOverItem.current = key;
  };
  const handleDragEnd = () => {
    const fromKey = dragItem.current,
      toKey = dragOverItem.current;
    if (!fromKey || !toKey || fromKey === toKey) {
      setDraggingKey(null);
      return;
    }
    const updated = [...data];
    const fi = updated.findIndex((r) => r.key === fromKey);
    const ti = updated.findIndex((r) => r.key === toKey);
    const [moved] = updated.splice(fi, 1);
    updated.splice(ti, 0, moved);
    setData(updated);
    dragItem.current = null;
    dragOverItem.current = null;
    setDraggingKey(null);
  };

  useEffect(() => {
    if (isEditingAddress && addressRef.current) {
      addressRef.current.focus();
      const l = addressRef.current.value.length;
      addressRef.current.setSelectionRange(l, l);
    }
  }, [isEditingAddress]);

  useEffect(() => {
    if (isEditingShipping && shippingRef.current) {
      shippingRef.current.focus();
      const l = shippingRef.current.value.length;
      shippingRef.current.setSelectionRange(l, l);
    }
  }, [isEditingShipping]);

  useEffect(() => {
    log("INIT useEffect — fetching code, bank, salespersons, parties");
    fetchInvoiceCode();
    fetchBankDetails();
    fetchSalespersons();
    fetchParties();
  }, []);

  const fetchBankDetails = async () => {
    log("fetchBankDetails START");
    try {
      const uid = localStorage.getItem("userId");
      if (!uid) {
        log("fetchBankDetails SKIP — no userId");
        return;
      }
      const response = await GetbankdetailsbyuserId(uid);
      log("fetchBankDetails RESPONSE", response?.data);
      if (response?.data?.success && response?.data?.data?.length > 0)
        setBankDetails(response.data.data[0]);
    } catch (err) {
      logErr("fetchBankDetails FAILED", err);
    }
  };

  const handleCellChange = (key, field, val) => {
    const rowIndex = data.findIndex((r) => r.key === key);
    if (rowIndex !== -1) clearErr(`item_${rowIndex}_${field}`);
    setData((prev) =>
      prev.map((r) => {
        if (r.key !== key) return r;
        const updated = { ...r, [field]: val };
        if (field === "itemtype" && val === "PLAN") {
          updated.qty = "";
          updated.rate = "";
        }
        if (updated.itemtype === "PLAN") {
          const qty = parseFloat(field === "qty" ? val : updated.qty) || 1;
          const baseRate =
            parseFloat(field === "rate" ? val : updated.rate) || 0;
          return {
            ...updated,
            qty: String(qty),
            rate: field === "rate" ? val : updated.rate,
            taxAmount: "0",
            amount: (qty * baseRate).toFixed(2),
          };
        }
        const qty = parseFloat(field === "qty" ? val : updated.qty) || 0;
        const rate = parseFloat(field === "rate" ? val : updated.rate) || 0;
        return { ...updated, amount: (qty * rate).toFixed(2), taxAmount: "0" };
      }),
    );
  };

  const addRow = () =>
    setData((p) => [
      ...p,
      {
        key: Date.now(),
        item: "",
        description: "",
        hsn: "",
        qty: "1",
        rate: "0",
        amount: "0",
        itemtype: "EXTRA",
        tax: "18",
        taxAmount: "0",
      },
    ]);
  const deleteRow = (key) => setData((p) => p.filter((r) => r.key !== key));
  const handleFileChange = (e) => setUploadedFiles(Array.from(e.target.files));

  const handleSubmit = async () => {
    log("═══ handleSubmit CALLED ═══", {
      invoiceId,
      partyId,
      partyName,
      billingName,
      billingAddress: billingAddress?.slice(0, 30),
      invoiceNo,
      invoiceDate,
      dueDate,
      salesperson,
      itemCount: data.length,
      grandTotal,
      loading, // ✅ should be false
      fetchingParty, // ✅ should be false
      fetchingInvoice, // ✅ should be false
    });

    if (!validate()) {
      log("handleSubmit BLOCKED — validation failed");
      message.error("Please fill in all required fields");
      return;
    }

    log("handleSubmit — validation passed, proceeding");

    try {
      setLoading(true);
      const tncValue = "";

      // ✅ Helper to build FormData and log all entries
      const buildFormData = (isUpdate) => {
        const fd = new FormData();
        if (isUpdate) fd.append("invoiceId", parseInt(invoiceId));
        fd.append("adjust_amount", adjustmentAmt.toFixed(2));
        fd.append("billingAddress", billingAddress);
        fd.append("billingName", billingName);
        fd.append("customerName", partyName);
        fd.append("customerId", partyId ?? "");
        fd.append("customerNotes", customerNotes);
        fd.append("discountAmount", discountAmt.toFixed(2));
        fd.append("discountPer", parseFloat(discount) || 0);
        fd.append("due_date", dueDate || "");
        fd.append("gstAmount", gstAmt.toFixed(2));
        fd.append("gstNumber", gstNumber || "");
        fd.append("gstPercent", parseFloat(taxPercent) || 0);
        fd.append("invoiceCode", invoiceNo);
        fd.append("invoice_date", invoiceDate);
        fd.append("salesPersonId", salesperson || "");
        fd.append("shippingAddress", shippingAddress || "");
        fd.append("subTotal", subTotal.toFixed(2));
        fd.append("terms", terms);
        fd.append("tnc", tncValue);
        fd.append("totalAmount", grandTotal.toFixed(2));
        fd.append("taxType", "GST");

        data.forEach((item, index) => {
          const k = (f) => `invoiceItems[${index}].${f}`;
          fd.append(
            k("invoiceItemId"),
            isUpdate ? item.invoiceItemId || -1 : -1,
          );
          fd.append(k("itemName"), item.item || "");
          fd.append(k("description"), item.description || "");
          fd.append(k("hsnCode"), item.hsn || "");
          fd.append(k("taxPercent"), item.tax || "18");
          fd.append(k("taxAmount"), item.taxAmount || "0");
          fd.append(k("itemType"), item.itemtype || "PLAN");
          fd.append(k("planHistoryId"), item.planHistoryId || "");
          fd.append(k("qty"), item.itemtype === "PLAN" ? "1" : item.qty || "1");
          fd.append(
            k("rate"),
            item.itemtype === "PLAN" ? item.amount : item.rate || "0",
          );
          fd.append(k("amount"), item.amount || "0");
        });

        if (uploadedFiles.length > 0)
          uploadedFiles.forEach((file) => fd.append("doc", file));

        // ✅ Log everything being sent
        const fdEntries = {};
        for (let [key, value] of fd.entries()) fdEntries[key] = value;
        log("FormData entries", fdEntries);

        return fd;
      };

      if (invoiceId) {
        log("handleSubmit — UPDATE flow", { invoiceId });
        const formData = buildFormData(true);
        const response = await updateSuperAdminInvoice(formData);
        log("updateSuperAdminInvoice RESPONSE", response?.data);

        if (response?.data?.success) {
          log("UPDATE SUCCESS");
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Invoice updated successfully!",
            timer: 1500,
            showConfirmButton: false,
          });
          navigate("/admin-invoice");
        } else {
          log("UPDATE FAILED — success:false", response?.data);
          message.error(response?.data?.msg || "Update failed");
        }
      } else {
        log("handleSubmit — CREATE flow");
        const formData = buildFormData(false);
        const response = await SuperAdminAddInvoice(formData);
        log("SuperAdminAddInvoice RESPONSE", response?.data);

        if (response?.data?.success) {
          log("CREATE SUCCESS");
          await Swal.fire({
            icon: "success",
            title: "Success",
            text: "Invoice created successfully!",
            timer: 1500,
            showConfirmButton: false,
          });
          navigate("/admin-invoice");
        } else {
          log("CREATE FAILED — success:false", response?.data);
          message.error(response?.data?.msg || "Failed to create invoice");
        }
      }
    } catch (err) {
      logErr("handleSubmit EXCEPTION", err);
      message.error(
        err?.response?.data?.msg || err?.message || "Failed to save invoice",
      );
    } finally {
      setLoading(false);
      log("handleSubmit DONE — loading reset to false");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white mx-auto shadow-md">
      {/* ✅ DEBUG BANNER — visible in production, remove after fix */}
      {/* <div className="fixed top-0 right-0 z-[9999] bg-black/80 text-white text-[10px] px-3 py-1.5 rounded-bl-lg font-mono space-y-0.5">
        <div>loading: <span className={loading ? "text-red-400" : "text-green-400"}>{String(loading)}</span></div>
        <div>fetchingParty: <span className={fetchingParty ? "text-yellow-400" : "text-green-400"}>{String(fetchingParty)}</span></div>
        <div>fetchingInvoice: <span className={fetchingInvoice ? "text-yellow-400" : "text-green-400"}>{String(fetchingInvoice)}</span></div>
        <div>invoiceId: <span className="text-blue-400">{invoiceId || "null"}</span></div>
        <div>partyId: <span className="text-blue-400">{partyId || "null"}</span></div>
        <div>items: <span className="text-blue-400">{data.length}</span></div>
      </div> */}

      {/* Top Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6b7280"
            strokeWidth="1.5"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span className="text-[15px] font-semibold text-gray-800">
            {invoiceId ? "Edit Invoice" : "New Invoice"}
          </span>
          {fetchingInvoice && (
            <span className="text-xs text-blue-500 ml-2">
              Loading invoice...
            </span>
          )}
          {fetchingParty && (
            <span className="text-xs text-blue-500 ml-2">
              Loading customer...
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Customer Name + Address */}
        <div className="pb-5 px-8 py-5 border-b border-gray-100 mb-5">
          <div className="flex items-start mb-4">
            <label className="w-40 flex-shrink-0 text-sm font-medium pt-1.5">
              Customer Name <span className="text-red-500">*</span>
            </label>
            <div className="flex-1 flex flex-col gap-0.5">
              <div className="relative w-[550px]">
                <div
                  className={`flex items-center justify-between h-8 border rounded px-2.5 cursor-pointer bg-white hover:border-blue-400 transition-colors ${errors.partyName ? "border-red-400" : "border-gray-300"}`}
                  onClick={() => setShowPartyDrop((v) => !v)}
                >
                  <span
                    className={`text-sm ${partyName ? "text-gray-800" : "text-gray-400"}`}
                  >
                    {loadingParties
                      ? "Loading..."
                      : partyName || "Select a customer"}
                  </span>
                  <ChevronDown />
                </div>
                {showPartyDrop && (
                  <div className="absolute top-9 left-0 w-full bg-white border border-gray-200 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
                    <input
                      className="w-full border-b border-gray-100 px-3 py-2 text-sm outline-none placeholder-gray-400"
                      placeholder="Search..."
                      value={partySearch}
                      onChange={(e) => setPartySearch(e.target.value)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                    {partyList
                      .filter((p) =>
                        p.label
                          .toLowerCase()
                          .includes(partySearch.toLowerCase()),
                      )
                      .map((p) => (
                        <div
                          key={p.value}
                          className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          onClick={() => {
                            log("PARTY SELECTED", {
                              id: p.value,
                              label: p.label,
                            });
                            setPartyId(p.value);
                            setPartyName(p.label);
                            setShowPartyDrop(false);
                            setPartySearch("");
                            setShowAddressSection(true);
                            clearErr("partyName");
                            fetchPartyDetails(p.value);
                          }}
                        >
                          {p.label}
                        </div>
                      ))}
                    {partyList.filter((p) =>
                      p.label.toLowerCase().includes(partySearch.toLowerCase()),
                    ).length === 0 && (
                      <div className="px-3 py-2 text-sm text-gray-400">
                        No customers found
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Err msg={errors.partyName} />
            </div>
          </div>

          {showAddressSection && (
            <div className="flex items-start">
              <div className="w-40 flex-shrink-0"></div>
              <div className="flex-1 grid grid-cols-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10.5px] font-semibold text-gray-500 uppercase tracking-wide">
                      Billing Address <span className="text-red-500">*</span>
                    </span>
                    <span
                      className="text-gray-400 cursor-pointer hover:text-blue-500 transition-colors"
                      onClick={() => setIsEditingAddress(true)}
                    >
                      <EditIcon />
                    </span>
                  </div>
                  {isEditingAddress ? (
                    <>
                      <textarea
                        ref={addressRef}
                        className={`w-full border rounded-md px-2.5 py-2 text-sm text-gray-700 outline-none resize-none leading-5 transition-colors ${errors.billingAddress ? "border-red-400 bg-red-50/20" : "border-blue-400 focus:bg-white"}`}
                        value={billingAddress}
                        rows={4}
                        onChange={(e) => {
                          setBillingAddress(e.target.value);
                          clearErr("billingAddress");
                        }}
                        onBlur={() => setIsEditingAddress(false)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setIsEditingAddress(false);
                          if (e.key === "Enter" && e.ctrlKey)
                            setIsEditingAddress(false);
                        }}
                      />
                      <div className="flex items-center gap-2 mt-1.5">
                        {/* ✅ FIXED — only closes edit mode, does NOT call handleSubmit */}
                        <button
                          className="h-8 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setIsEditingAddress(false);
                          }}
                        >
                          Done
                        </button>
                        <button
                          className="text-xs text-gray-500 hover:text-gray-700 rounded px-2 py-1 transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setIsEditingAddress(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <p
                      className="text-sm text-gray-700 whitespace-pre-line leading-5 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 py-0.5 transition-colors"
                      onClick={() => setIsEditingAddress(true)}
                    >
                      {billingAddress || (
                        <span className="text-gray-400 italic">
                          Click to add billing address...
                        </span>
                      )}
                    </p>
                  )}
                  <Err msg={errors.billingAddress} />
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="text-[10.5px] font-semibold text-gray-500 uppercase tracking-wide ps-1">
                      Shipping Address
                    </span>
                    {shippingAddress && (
                      <span
                        className="text-gray-400 cursor-pointer hover:text-blue-500 transition-colors"
                        onClick={() => setIsEditingShipping(true)}
                      >
                        <EditIcon />
                      </span>
                    )}
                  </div>
                  {isEditingShipping ? (
                    <>
                      <textarea
                        ref={shippingRef}
                        className="w-full border border-blue-400 rounded-md px-2.5 py-2 text-sm text-gray-700 outline-none resize-none leading-5 focus:bg-white transition-colors ps-2"
                        value={
                          shippingAddress.trim() === "" ? "" : shippingAddress
                        }
                        rows={4}
                        placeholder="Enter shipping address..."
                        onChange={(e) => setShippingAddress(e.target.value)}
                        onBlur={() => {
                          if (!shippingAddress.trim()) setShippingAddress("");
                          setIsEditingShipping(false);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            if (!shippingAddress.trim()) setShippingAddress("");
                            setIsEditingShipping(false);
                          }
                          if (e.key === "Enter" && e.ctrlKey)
                            setIsEditingShipping(false);
                        }}
                      />
                      <div className="flex items-center gap-2 mt-1.5">
                        <button
                          className="text-xs text-white bg-blue-600 hover:bg-blue-700 rounded px-2.5 py-1 transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (!shippingAddress.trim()) setShippingAddress("");
                            setIsEditingShipping(false);
                          }}
                        >
                          Save
                        </button>
                        <button
                          className="text-xs text-gray-500 hover:text-gray-700 rounded px-2 py-1 transition-colors"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (!shippingAddress.trim()) setShippingAddress("");
                            setIsEditingShipping(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : shippingAddress.trim() ? (
                    <p
                      className="text-sm text-gray-700 whitespace-pre-line leading-5 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 py-0.5 transition-colors"
                      onClick={() => setIsEditingShipping(true)}
                    >
                      {shippingAddress}
                    </p>
                  ) : (
                    <span
                      className="text-blue-500 text-sm cursor-pointer hover:underline ps-5"
                      onClick={() => {
                        setShippingAddress("");
                        setIsEditingShipping(true);
                      }}
                    >
                      + New Address
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Billing Name + GST */}
        <div className="pb-4 px-8 py-5 border-b border-gray-100 mb-4 flex flex-col gap-3">
          <div className="flex items-start">
            <label className="w-40 flex-shrink-0 text-sm pt-1">
              Billing Name <span className="text-red-500">*</span>
            </label>
            <div>
              <input
                className={`w-72 h-8 border rounded px-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white transition-colors ${eb("billingName")}`}
                value={billingName}
                onChange={(e) => {
                  setBillingName(e.target.value);
                  clearErr("billingName");
                }}
                placeholder="Enter billing name"
              />
              <Err msg={errors.billingName} />
            </div>
          </div>
          <div className="flex items-center">
            <label className="w-40 flex-shrink-0 text-sm">GST Number</label>
            <input
              className="w-72 h-8 border border-gray-300 rounded px-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white transition-colors"
              value={gstNumber}
              onChange={(e) => setGstNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Invoice Meta */}
        <div className="pb-4 px-8 py-5 border-b border-gray-100 mb-4 flex flex-col gap-4">
          <div className="flex items-start">
            <label className="w-40 flex-shrink-0 text-sm font-medium pt-1">
              Invoice# <span className="text-red-500">*</span>
            </label>
            <div>
              <div
                className={`flex h-8 w-72 border rounded overflow-hidden focus-within:border-blue-400 transition-colors ${errors.invoiceNo ? "border-red-400" : "border-gray-300"}`}
              >
                <input
                  className="flex-1 px-2.5 text-sm text-gray-800 outline-none bg-white"
                  value={invoiceNo}
                  onChange={(e) => {
                    setInvoiceNo(e.target.value);
                    clearErr("invoiceNo");
                  }}
                  placeholder="Auto-generated, editable"
                />
              </div>
              <Err msg={errors.invoiceNo} />
            </div>
          </div>

          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex items-start">
              <label className="w-40 flex-shrink-0 text-sm font-medium pt-1">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <div>
                <DatePicker
                  format="DD/MM/YYYY"
                  value={invoiceDate ? dayjs(invoiceDate, "DD/MM/YYYY") : null}
                  onChange={(date) => {
                    const formatted = date ? date.format("DD/MM/YYYY") : "";
                    setInvoiceDate(formatted);
                    clearErr("invoiceDate");
                    if (terms && date) {
                      const days =
                        terms === "Net 15"
                          ? 15
                          : terms === "Net 30"
                            ? 30
                            : terms === "Net 60"
                              ? 60
                              : 0;
                      setDueDate(addDaysToDate(formatted, days));
                    }
                  }}
                  className={`h-8 w-48 ${eb("invoiceDate")}`}
                  placeholder="DD/MM/YYYY"
                />
                <Err msg={errors.invoiceDate} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Terms</span>
              <div className="relative">
                <select
                  className="h-8 border border-gray-300 rounded pl-2.5 pr-7 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white appearance-none cursor-pointer w-44 transition-colors"
                  value={terms}
                  onChange={(e) => {
                    const value = e.target.value;
                    setTerms(value);
                    if (!invoiceDate) return;
                    const days =
                      value === "Net 15"
                        ? 15
                        : value === "Net 30"
                          ? 30
                          : value === "Net 60"
                            ? 60
                            : 0;
                    setDueDate(addDaysToDate(invoiceDate, days));
                  }}
                >
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 60">Net 60</option>
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown />
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-sm pt-1">
                Due Date <span className="text-red-500">*</span>
              </span>
              <div>
                <DatePicker
                  format="DD/MM/YYYY"
                  value={dueDate ? dayjs(dueDate, "DD/MM/YYYY") : null}
                  onChange={(date) => {
                    setDueDate(date ? date.format("DD/MM/YYYY") : "");
                    clearErr("dueDate");
                  }}
                  className={`h-8 w-40 ${eb("dueDate")}`}
                  placeholder="DD/MM/YYYY"
                />
                <Err msg={errors.dueDate} />
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <label className="w-40 flex-shrink-0 text-sm pt-1">
              Salesperson <span className="text-red-500">*</span>
            </label>
            <div>
              <div className="relative w-72">
                <select
                  className={`w-full h-8 border rounded pl-2.5 pr-7 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white appearance-none cursor-pointer transition-colors ${eb("salesperson")}`}
                  value={salesperson}
                  onChange={(e) => {
                    log("SALESPERSON SELECTED", e.target.value);
                    setSalesperson(e.target.value);
                    clearErr("salesperson");
                  }}
                >
                  <option value="">Select Salesperson</option>
                  {salespersonList.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown />
                </span>
              </div>
              <Err msg={errors.salesperson} />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-4 px-8 py-5">
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-6 px-1 py-2.5"></th>
                  <th className="text-left px-3 py-2.5 text-[12.5px] font-semibold text-black uppercase tracking-wide">
                    Item Details <span className="text-red-500">*</span>
                  </th>
                  <th className="text-right px-3 py-2.5 text-[12.5px] font-semibold text-black uppercase tracking-wide w-20">
                    Quantity
                  </th>
                  <th className="text-right px-3 py-2.5 text-[12.5px] font-semibold text-black uppercase tracking-wide w-32">
                    Rate <span className="text-red-500">*</span>
                  </th>
                  <th className="text-right px-3 py-2.5 text-[12.5px] font-semibold text-black uppercase tracking-wide w-24">
                    Amount <span className="text-red-500">*</span>
                  </th>
                  <th className="w-8 px-1 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => {
                  const isExpanded = expandedKey === row.key;
                  return (
                    <React.Fragment key={row.key}>
                      <tr
                        draggable
                        onDragStart={() => handleDragStart(row.key)}
                        onDragEnter={() => handleDragEnter(row.key)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        className="border-b border-gray-100 last:border-0 transition-colors group"
                      >
                        <td className="px-2 py-2 text-gray-300 group-hover:text-gray-400 border border-gray-200">
                          <GripIcon />
                        </td>
                        <td className="px-3 py-1.5 border border-gray-200">
                          <div className="flex items-start gap-1">
                            <div className="flex-1 min-w-0">
                              <textarea
                                rows={1}
                                className={`w-full border rounded px-1.5 py-1 text-sm text-gray-700 outline-none hover:border-gray-200 focus:border-blue-400 focus:bg-white bg-transparent transition-colors placeholder-gray-300 resize-none overflow-hidden leading-5 ${errors[`item_${index}_name`] ? "border-red-400" : "border-transparent"}`}
                                value={row.item}
                                onChange={(e) => {
                                  e.target.style.height = "auto";
                                  e.target.style.height =
                                    e.target.scrollHeight + "px";
                                  handleCellChange(
                                    row.key,
                                    "item",
                                    e.target.value,
                                  );
                                }}
                                onFocus={(e) => {
                                  e.target.style.height = "auto";
                                  e.target.style.height =
                                    e.target.scrollHeight + "px";
                                }}
                                placeholder="Type or click to select an item."
                              />
                              {isExpanded && (
                                <div className="mt-1.5">
                                  <textarea
                                    rows={2}
                                    autoFocus
                                    placeholder="Add a description to your item"
                                    className="w-full border border-blue-300 rounded px-2 py-1.5 text-xs text-gray-600 placeholder-gray-400 outline-none focus:border-blue-500 bg-white resize-none transition-colors"
                                    value={row.description || ""}
                                    onChange={(e) =>
                                      handleCellChange(
                                        row.key,
                                        "description",
                                        e.target.value,
                                      )
                                    }
                                  />
                                  <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-blue-600 flex items-center gap-1">
                                      HSN Code:
                                      <input
                                        className="border-b border-dashed border-gray-400 bg-transparent outline-none text-[11px] text-blue-600 w-20 focus:border-blue-500"
                                        value={row.hsn || ""}
                                        onChange={(e) =>
                                          handleCellChange(
                                            row.key,
                                            "hsn",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="Update"
                                      />
                                    </span>
                                  </div>
                                </div>
                              )}
                              {!isExpanded && row.description && (
                                <p className="text-[11px] text-gray-400 px-1.5 mt-0.5 truncate">
                                  {row.description}
                                </p>
                              )}
                              {!isExpanded && row.hsn && (
                                <p className="text-[11px] text-gray-400 px-1.5 mt-0.5">
                                  HSN:{" "}
                                  <span className="text-blue-500">
                                    {row.hsn}
                                  </span>
                                </p>
                              )}
                            </div>
                            {row.item && (
                              <div className="flex items-center gap-0.5 mt-1 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => toggleExpand(row.key)}
                                  className={`w-5 h-5 rounded-full border text-[10px] flex items-center justify-center transition-colors ${isExpanded ? "border-blue-400 text-blue-500 bg-blue-100" : "border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500"}`}
                                >
                                  {isExpanded ? "−" : "+"}
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-1.5 border border-gray-200 align-top">
                          <input
                            type="text"
                            className={`w-full border rounded px-1.5 py-1 text-sm text-gray-700 text-right outline-none border-gray-300 focus:border-blue-500 focus:bg-white bg-white ${errors[`item_${index}_qty`] ? "border-red-400" : ""}`}
                            value={row.qty}
                            onChange={(e) =>
                              handleCellChange(row.key, "qty", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-1.5 border border-gray-200 align-top">
                          <input
                            type="text"
                            className={`w-full min-w-[80px] border rounded px-1.5 py-1 text-sm text-gray-700 text-right outline-none border-gray-300 focus:border-blue-500 focus:bg-white bg-white ${errors[`item_${index}_rate`] ? "border-red-400" : ""}`}
                            value={row.rate}
                            onChange={(e) =>
                              handleCellChange(row.key, "rate", e.target.value)
                            }
                          />
                        </td>
                        <td className="px-3 py-1.5 border border-gray-200 align-top">
                          <span className="block text-right text-sm font-semibold text-gray-700 px-1.5">
                            {parseFloat(row.amount || 0)}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 border border-gray-200">
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              className="w-5 h-5 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors text-xs"
                              onClick={() => deleteRow(row.key)}
                            >
                              ✕
                            </button>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 text-blue-600 text-xs font-medium border border-dashed border-blue-400 rounded px-3 py-1.5 hover:bg-blue-50 transition-colors"
            >
              <PlusIcon /> Add New Row
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-5 px-8 py-5 items-stretch">
          <div className="min-w-full flex flex-col h-full">
            <h4 className="text-base font-semibold leading-none text-gray-900 mb-2">
              <FormattedMessage
                id="COMMON.NOTES"
                defaultMessage="Terms & conditions"
              />
            </h4>
            <TextArea
              placeholder="Thanks for your Business..."
              className="flex-1 resize-none"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
            />
          </div>
          <div className="min-w-full flex flex-col h-full">
            <h4 className="text-base font-semibold leading-none text-gray-900 mb-2">
              <FormattedMessage id="COMMON.SUMMARY" defaultMessage="Summary" />
            </h4>
            <div className="border rounded-lg min-w-full p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-900">
                  <FormattedMessage
                    id="COMMON.SUBTOTAL"
                    defaultMessage="Subtotal"
                  />
                </span>
                <span className="font-semibold">
                  ₹{" "}
                  <span
                    className={`text-sm font-semibold text-right ${errors.subTotal ? "text-red-500" : "text-gray-700"}`}
                  >
                    {subTotal.toFixed(2)}
                  </span>
                </span>
              </div>
              <div className="grid grid-cols-3 items-center md-4">
                <span className="text-sm text-gray-900">Discount</span>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    className="w-16 h-8 border border-gray-300 rounded px-2 text-sm text-right outline-none focus:border-blue-400"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
                <span className="text-sm text-red-500 text-right">
                  {discountAmt > 0 ? "- " : ""}
                  {discountAmt.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2 pb-2 border-b px-2 py-1 rounded">
                <span className="text-sm font-semibold text-gray-900">
                  <FormattedMessage
                    id="COMMON.TAXABLE_AMOUNT"
                    defaultMessage="Taxable Amount"
                  />
                </span>
                <span className="font-bold text-blue-700">
                  ₹{taxableAmount.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center mb-2">
                <span className="text-sm text-gray-900 font-medium">GST</span>
                <div className="flex items-center gap-1.5">
                  <input
                    className="w-16 h-8 border border-gray-300 rounded px-2 text-sm text-right outline-none focus:border-blue-400"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    placeholder="0"
                  />
                  <span className="text-sm text-gray-500">%</span>
                </div>
                <span className="text-sm text-right font-medium text-green-600">
                  + ₹{gstAmt.toFixed(2)}
                </span>
              </div>
              <div className="grid grid-cols-3 items-center">
                <span className="text-sm text-gray-700">Adjustment</span>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    className="w-24 h-8 border border-gray-300 rounded px-2 text-sm text-right outline-none focus:border-blue-400"
                    value={adjustment}
                    onChange={(e) => setAdjustment(e.target.value)}
                  />
                  <span className="text-gray-400">
                    <InfoIcon />
                  </span>
                </div>
                <span
                  className={`text-sm text-right ${adjustmentAmt < 0 ? "text-red-500" : adjustmentAmt > 0 ? "text-green-600" : "text-gray-700"}`}
                >
                  {adjustmentAmt > 0 ? "+ " : ""}
                </span>
              </div>
              <div className="flex justify-between pt-2 font-semibold">
                <span className="text-base text-primary">
                  <FormattedMessage
                    id="COMMON.GRAND_TOTAL"
                    defaultMessage="Grand Total"
                  />
                </span>
                <span className="text-lg text-primary font-bold">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-5 px-8 py-5">
          <div className="min-w-full">
            <div className="p-3 border rounded-lg whitespace-pre-line text-sm">
              <h4 className="text-base font-semibold leading-none text-gray-900 mb-2">
                <FormattedMessage
                  id="COMMON.TERMS_AND_CONDITIONS"
                  defaultMessage="Bank Details"
                />
              </h4>
              {bankDetails && (
                <div className="text-gray-700">
                  AC NO. :- {bankDetails.accountNo?.toUpperCase()} <br />
                  BRANCH :- {bankDetails.branchName?.toUpperCase()} <br />
                  IFSC CODE :- {bankDetails.ifscCode?.toUpperCase()} <br />
                  AC NAME :- {bankDetails.accountHolderName?.toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <div className="min-w-full">
            <div className="border rounded-lg min-w-full h-full p-4">
              <h4 className="text-base font-semibold leading-none text-gray-900 mb-3">
                <FormattedMessage
                  id="COMMON.ATTACH_FILES_TO_INVOICE"
                  defaultMessage="Attach Files to Invoice"
                />
              </h4>
              <div className="rounded-md flex flex-col gap-2">
                <label className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1.5 text-xs bg-white hover:border-blue-400 hover:text-blue-500 w-fit transition-colors cursor-pointer">
                  <UploadOutlined />
                  <FormattedMessage
                    id="COMMON.UPLOAD_FILE"
                    defaultMessage="Upload File"
                  />
                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
                {uploadedFiles.length > 0 && (
                  <ul className="text-[11px] text-gray-500 space-y-1 mt-1">
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <span>📎</span>
                        <span className="truncate max-w-[200px]">
                          {file.name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-[10.5px] text-gray-400">
                  <FormattedMessage
                    id="COMMON.UPLOAD_MAX_FILE_SIZE"
                    defaultMessage="You can upload a maximum of 10 files, 10MB each"
                  />
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <button
            className="h-8 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60 rounded"
            onClick={() => {
              log("SAVE BUTTON CLICKED", {
                loading,
                fetchingParty,
                fetchingInvoice,
              });
              handleSubmit();
            }}
            disabled={loading} // ✅ only disabled during actual submit
          >
            {loading ? "Saving…" : invoiceId ? "Update Invoice" : "Save"}
          </button>
          <button
            onClick={() => navigate("/admin-invoice")}
            className="h-8 px-4 text-sm font-medium bg-white border border-gray-300 rounded hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500">
            Total Amount:{" "}
            <span className="font-semibold text-gray-700">
              ₹ {grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Addinvoice;

// import React, { useState, useRef, useEffect } from "react";
// import { DatePicker } from "antd";
// import { useSearchParams } from "react-router-dom";
// import Swal from "sweetalert2";
// import { useNavigate } from "react-router-dom";
// import dayjs from "dayjs";
// import {
//   CloseOutlined,
//   SaveOutlined,
//   SendOutlined,
//   UploadOutlined,
// } from "@ant-design/icons";
// import { message } from "antd";
// import { FormattedMessage, useIntl } from "react-intl";
// import { Button, Select, Radio, Input } from "antd";
// import {
//   SuperAdminAddInvoice,
//   GetbankdetailsbyuserId,
//   GetAllMemberByUserId,
//   getAllByRoleId,
//   GetALLMemberDetailsByID,
//   updateSuperAdminInvoice,
//   GETSuperadmininvoicebyid,
//   getsuperadmingenerateInvoiceCode,
// } from "@/services/apiServices";

// const { TextArea } = Input;
// const EditIcon = () => (
//   <svg
//     width="12"
//     height="12"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//     strokeLinecap="round"
//     strokeLinejoin="round"
//   >
//     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
//     <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
//   </svg>
// );
// const PlusIcon = () => (
//   <svg
//     width="13"
//     height="13"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2.5"
//   >
//     <line x1="12" y1="5" x2="12" y2="19" />
//     <line x1="5" y1="12" x2="19" y2="12" />
//   </svg>
// );
// const ChevronDown = () => (
//   <svg
//     width="12"
//     height="12"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2.5"
//   >
//     <polyline points="6 9 12 15 18 9" />
//   </svg>
// );
// const UploadIcon = () => (
//   <svg
//     width="13"
//     height="13"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//   >
//     <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//     <polyline points="17 8 12 3 7 8" />
//     <line x1="12" y1="3" x2="12" y2="15" />
//   </svg>
// );
// const InfoIcon = () => (
//   <svg
//     width="13"
//     height="13"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//   >
//     <circle cx="12" cy="12" r="10" />
//     <line x1="12" y1="16" x2="12" y2="12" />
//     <line x1="12" y1="8" x2="12.01" y2="8" />
//   </svg>
// );
// const GripIcon = () => (
//   <svg
//     width="12"
//     height="12"
//     viewBox="0 0 24 24"
//     fill="none"
//     stroke="currentColor"
//     strokeWidth="2"
//   >
//     <circle cx="9" cy="5" r="1" />
//     <circle cx="9" cy="12" r="1" />
//     <circle cx="9" cy="19" r="1" />
//     <circle cx="15" cy="5" r="1" />
//     <circle cx="15" cy="12" r="1" />
//     <circle cx="15" cy="19" r="1" />
//   </svg>
// );

// const Err = ({ msg }) =>
//   msg ? (
//     <p className="text-[10.5px] text-red-500 mt-0.5 leading-none">{msg}</p>
//   ) : null;

// const Addinvoice = () => {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const invoiceId = searchParams.get("id");
//   const today = dayjs().format("DD/MM/YYYY");
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   // ── Customer ───────────────────────────────────────────────────────────────
//   const [partyName, setPartyName] = useState(""); // plain text now
//   const [showAddressSection, setShowAddressSection] = useState(false);

//   // ── Address ────────────────────────────────────────────────────────────────
//   const [isEditingAddress, setIsEditingAddress] = useState(false);
//   const [billingAddress, setBillingAddress] = useState("");
//   const [shippingAddress, setShippingAddress] = useState("");
//   const [isEditingShipping, setIsEditingShipping] = useState(false);

//   // ── Invoice fields ─────────────────────────────────────────────────────────
//   const [billingName, setBillingName] = useState("");
//   const [gstNumber, setGstNumber] = useState("");
//   const [invoiceNo, setInvoiceNo] = useState("");
//   const [invoiceDate, setInvoiceDate] = useState(today);
//   const [dueDate, setDueDate] = useState(today);
//   const [terms, setTerms] = useState("Due on Receipt");
//   const [salesperson, setSalesperson] = useState("");
//   const [subject, setSubject] = useState("");
//   const [customerNotes, setCustomerNotes] = useState("");
//   const [termsConditions, setTermsConditions] = useState("");
//   const [data, setData] = useState([]);
//   const [discount, setDiscount] = useState("");
//   // const [taxType, setTaxType] = useState("TDS");
//   const [taxPercent, setTaxPercent] = useState("0"); // ← default 18
//   const [adjustment, setAdjustment] = useState("");
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const [partyList, setPartyList] = useState([]);
//   const [loadingParties, setLoadingParties] = useState(false);
//   const [partySearch, setPartySearch] = useState("");
//   const [showPartyDrop, setShowPartyDrop] = useState(false);
//   const [partyId, setPartyId] = useState(null);

//   // ── Computed totals ────────────────────────────────────────────────────────
//   const subTotal = data.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
//   const discountAmt = subTotal * ((parseFloat(discount) || 0) / 100);
//   const taxableAmount = subTotal - discountAmt;
//   const gstAmt = taxableAmount * ((parseFloat(taxPercent) || 0) / 100);
//   const adjustmentAmt = parseFloat(adjustment) || 0;
//   const grandTotal = taxableAmount + gstAmt + adjustmentAmt;
//   // ── Misc ───────────────────────────────────────────────────────────────────
//   const dragItem = useRef(null);
//   const dragOverItem = useRef(null);
//   const [draggingKey, setDraggingKey] = useState(null);
//   const addressRef = useRef(null);
//   const shippingRef = useRef(null);
//   const [bankDetails, setBankDetails] = useState(null);
//   const [salespersonList, setSalespersonList] = useState([]);
//   const [expandedKey, setExpandedKey] = useState(null);
//   const toggleExpand = (key) =>
//     setExpandedKey((prev) => (prev === key ? null : key));
//   const userId = localStorage.getItem("userId");

//   const clearErr = (key) =>
//     setErrors((prev) => {
//       const n = { ...prev };
//       delete n[key];
//       return n;
//     });

//   // ── Validation ─────────────────────────────────────────────────────────────
//   const validate = () => {
//     const e = {};
//     if (!partyName.trim()) e.partyName = "Customer name is required";
//     if (!billingAddress.trim())
//       e.billingAddress = "Billing address is required";
//     if (!billingName.trim()) e.billingName = "Billing name is required";
//     if (!invoiceNo.trim()) e.invoiceNo = "Invoice # is required";
//     if (!invoiceDate.trim()) e.invoiceDate = "Invoice date is required";
//     if (!dueDate.trim()) e.dueDate = "Due date is required";
//     if (!salesperson) e.salesperson = "Salesperson is required";

//     if (data.length === 0) {
//       e.items = "Add at least one item";
//     } else {
//       data.forEach((item, i) => {
//         if (!item.item.trim()) e[`item_${i}_name`] = "Required";
//         if (!item.itemtype) e[`item_${i}_type`] = "Required";
//         const isPlan = item.itemtype === "PLAN";
//         if (isPlan) {
//           if (!item.amount || parseFloat(item.amount) <= 0)
//             e[`item_${i}_amount`] = "Required";
//         } else {
//           if (!item.rate || parseFloat(item.rate) <= 0)
//             e[`item_${i}_rate`] = "Required";
//           if (!item.qty || parseFloat(item.qty) <= 0)
//             e[`item_${i}_qty`] = "Required";
//         }
//       });
//     }
//     setErrors(e);
//     return Object.keys(e).length === 0;
//   };

//   const eb = (key) =>
//     errors[key] ? "border-red-400 focus:border-red-400" : "";

//   const addDaysToDate = (dateStr, days) => {
//     if (!dateStr) return "";
//     const [day, month, year] = dateStr.split("/").map(Number);
//     const date = new Date(year, month - 1, day);
//     date.setDate(date.getDate() + days);
//     return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
//   };

//   // After fetchBankDetails function, add:
//   const fetchInvoiceCode = async () => {
//     if (invoiceId) return; // skip for edit mode
//     try {
//       const res = await getsuperadmingenerateInvoiceCode();
//       console.log(res);

//       if (res?.data?.success) {
//         setInvoiceNo(res.data.invoiceCode); // adjust based on actual response shape
//       }
//     } catch {
//       // keep default fallback
//     }
//   };

//   // ── Salesperson list ───────────────────────────────────────────────────────
//   const fetchSalespersons = async () => {
//     try {
//       if (!userId) return;
//       const response = await GetAllMemberByUserId(userId);
//       if (response?.data?.success) {
//         const users = response.data.data.userDetails.UserDetails;
//         if (Array.isArray(users)) {
//           setSalespersonList(
//             users.map((u) => ({
//               value: u.id,
//               label:
//                 `${u.firstName || ""} ${u.lastName || ""}`.trim() ||
//                 u.email ||
//                 "Unknown",
//             })),
//           );
//         }
//       }
//     } catch {
//       setSalespersonList([]);
//     }
//   };

//   // 3. ADD fetchParties function (after fetchSalespersons)
//   const fetchParties = async () => {
//     try {
//       setLoadingParties(true);
//       const response = await getAllByRoleId(2, "member");
//       const users = response?.data?.data?.["User Details"]?.users;
//       if (Array.isArray(users)) {
//         setPartyList(
//           users.map((m) => ({
//             value: m.id,
//             label:
//               m.userBasicDetails?.companyName ||
//               `${m.firstName || ""} ${m.lastName || ""}`.trim() ||
//               "Unknown",
//           })),
//         );
//       }
//     } catch {
//       setPartyList([]);
//     } finally {
//       setLoadingParties(false);
//     }
//   };

//   const fetchPartyDetails = async (pid) => {
//     try {
//       setLoading(true);
//       const response = await GetALLMemberDetailsByID(pid);
//       if (response?.data?.success) {
//         const list = response.data.data?.["User Details"];
//         if (Array.isArray(list) && list.length > 0) {
//           const d = list[0];

//           // Billing / Shipping address
//           if (d.address) {
//             setBillingAddress(d.address);
//             setShippingAddress(d.address);
//           }

//           // Billing name — prefer companyName, fall back to full name
//           const fullName = `${d.firstName || ""} ${d.lastName || ""}`.trim();
//           setBillingName(d.companyName || fullName);

//           // GST
//           if (d.gstNumber) setGstNumber(d.gstNumber);

//           // Pre-fill item from active plan
//           if (d.userPlan?.plan) {
//             const { plan, startDate, endDate } = d.userPlan;
//             setData([
//               {
//                 key: Date.now(),
//                 item: plan.name || "N/A",
//                 qty: "1",
//                 rate: plan.price?.toString() || "0",
//                 taxAmount: ((plan.price || 0) * 0.18).toFixed(2),
//                 amount: (plan.price * 1.18).toFixed(2), // rate × qty + 18% GST
//                 itemtype: "PLAN",
//                 planHistoryId: d.userPlan.id || "",
//                 tax: "18",
//               },
//             ]);
//           }

//           message.success("Customer details loaded");
//         }
//       }
//     } catch {
//       message.error("Failed to load customer details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ✅ Prefill form when editing existing invoice
//   useEffect(() => {
//     if (!invoiceId) return;

//     const loadInvoice = async () => {
//       try {
//         setLoading(true);
//         const res = await GETSuperadmininvoicebyid(invoiceId);
//         const inv = res?.data?.data;
//         if (!inv) return;

//         // Customer
//         setPartyId(inv.customerId || null);
//         setPartyName(inv.billingName || "");
//         setShowAddressSection(true);

//         // Addresses
//         setBillingAddress(inv.billingAddress || "");
//         setShippingAddress(inv.shippingAddress || "");

//         // Invoice fields
//         setBillingName(inv.billingName || "");
//         setGstNumber(inv.gstNumber || "");
//         setInvoiceNo(inv.invoiceCode || "");
//         setInvoiceDate(inv.invoiceDate || "");
//         setDueDate(inv.dueDate || "");
//         setTerms(inv.terms || "Due on Receipt");
//         setSalesperson(inv.salesPersonId?.toString() || "");
//         setCustomerNotes(inv.customerNotes || "");
//         // setTaxType(inv.taxType || "TDS");
//         setDiscount(inv.discountPer?.toString() || "");
//         setTaxPercent(inv.gstPercent?.toString() || "0");
//         setAdjustment(inv.adjust_amount?.toString() || "");

//         // Items
//         if (Array.isArray(inv.items) && inv.items.length > 0) {
//           setData(
//             inv.items.map((item, i) => ({
//               key: Date.now() + i,
//               item: item.itemName || "",
//               description: item.description || "",
//               hsn: item.hsnCode || "", // ✅ hsnCode → hsn
//               qty: item.qty?.toString() || "1",
//               rate: item.rate?.toString() || "0",
//               amount: item.amount?.toString() || "0",
//               itemtype:
//                 item.itemType || (item.planHistoryId ? "PLAN" : "EXTRA"), // ✅ smart fallback
//               tax: item.taxPercent?.toString() || "18", // ✅ number → string
//               planHistoryId: item.planHistoryId || "",
//               invoiceItemId: item.invoiceItemId || -1,
//               taxAmount: item.taxAmount || "0",
//             })),
//           );
//         }
//       } catch (err) {
//         console.error("Failed to load invoice for edit:", err);
//         message.error("Failed to load invoice");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadInvoice();
//   }, [invoiceId]);

//   // ── Drag handlers ──────────────────────────────────────────────────────────
//   const handleDragStart = (key) => {
//     dragItem.current = key;
//     setDraggingKey(key);
//   };
//   const handleDragEnter = (key) => {
//     dragOverItem.current = key;
//   };
//   const handleDragEnd = () => {
//     const fromKey = dragItem.current,
//       toKey = dragOverItem.current;
//     if (!fromKey || !toKey || fromKey === toKey) {
//       setDraggingKey(null);
//       return;
//     }
//     const updated = [...data];
//     const fi = updated.findIndex((r) => r.key === fromKey);
//     const ti = updated.findIndex((r) => r.key === toKey);
//     const [moved] = updated.splice(fi, 1);
//     updated.splice(ti, 0, moved);
//     setData(updated);
//     dragItem.current = null;
//     dragOverItem.current = null;
//     setDraggingKey(null);
//   };

//   useEffect(() => {
//     if (isEditingAddress && addressRef.current) {
//       addressRef.current.focus();
//       const l = addressRef.current.value.length;
//       addressRef.current.setSelectionRange(l, l);
//     }
//   }, [isEditingAddress]);

//   useEffect(() => {
//     if (isEditingShipping && shippingRef.current) {
//       shippingRef.current.focus();
//       const l = shippingRef.current.value.length;
//       shippingRef.current.setSelectionRange(l, l);
//     }
//   }, [isEditingShipping]);

//   useEffect(() => {
//     fetchInvoiceCode();
//     fetchBankDetails();
//     fetchSalespersons();
//     fetchParties();
//   }, []);

//   const fetchBankDetails = async () => {
//     try {
//       const uid = localStorage.getItem("userId");
//       if (!uid) return;
//       const response = await GetbankdetailsbyuserId(uid);
//       if (response?.data?.success && response?.data?.data?.length > 0)
//         setBankDetails(response.data.data[0]);
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   // ── Item table handlers ────────────────────────────────────────────────────
//   const handleCellChange = (key, field, val) => {
//     const rowIndex = data.findIndex((r) => r.key === key);
//     if (rowIndex !== -1) clearErr(`item_${rowIndex}_${field}`);

//     setData((prev) =>
//       prev.map((r) => {
//         if (r.key !== key) return r;

//         const updated = { ...r, [field]: val };

//         // ─── PLAN TYPE ───
//         if (field === "itemtype") {
//           if (val === "PLAN") {
//             updated.qty = "";
//             updated.rate = "";
//           }
//         }

//         if (updated.itemtype === "PLAN") {
//           const qty = parseFloat(field === "qty" ? val : updated.qty) || 1;
//           const baseRate =
//             parseFloat(field === "rate" ? val : updated.rate) || 0;
//           const baseAmount = qty * baseRate;

//           return {
//             ...updated,
//             qty: String(qty),
//             rate: field === "rate" ? val : updated.rate,
//             taxAmount: "0",
//             amount: baseAmount.toFixed(2), // ← no tax
//           };
//         }

//         // ─── NORMAL ITEM ───
//         const qty = parseFloat(field === "qty" ? val : updated.qty) || 0;
//         const rate = parseFloat(field === "rate" ? val : updated.rate) || 0;
//         const baseAmount = qty * rate;

//         return {
//           ...updated,
//           amount: baseAmount.toFixed(2), // ← no tax
//           taxAmount: "0",
//         };
//         // Final amount
//         const totalAmount = baseAmount + taxAmount;
//       }),
//     );
//   };
//   const addRow = () =>
//     setData((p) => [
//       ...p,
//       {
//         key: Date.now(),
//         item: "",
//         description: "",
//         hsn: "",
//         qty: "1",
//         rate: "0",
//         amount: "0",
//         itemtype: "EXTRA",
//         tax: "18",
//         taxAmount: "0",
//       },
//     ]);

//   const deleteRow = (key) => setData((p) => p.filter((r) => r.key !== key));
//   const handleFileChange = (e) => setUploadedFiles(Array.from(e.target.files));

//   // ── Submit ─────────────────────────────────────────────────────────────────
//   const handleSubmit = async () => {
//     if (!validate()) {
//       message.error("Please fill in all required fields");
//       return;
//     }
//     try {
//       setLoading(true);
//       const tncValue = "";
//       if (invoiceId) {
//         // ✅ UPDATE flow — JSON payload

//         const formData = new FormData();
//         formData.append("invoiceId", parseInt(invoiceId));
//         formData.append("adjust_amount", adjustmentAmt.toFixed(2));
//         formData.append("billingAddress", billingAddress);
//         formData.append("billingName", billingName);
//         formData.append("customerName", partyName);
//         formData.append("customerId", partyId || "");
//         formData.append("customerNotes", customerNotes);
//         formData.append("discountAmount", discountAmt.toFixed(2));
//         formData.append("discountPer", parseFloat(discount) || 0);
//         formData.append("due_date", dueDate || "");
//         formData.append("gstAmount", gstAmt.toFixed(2));
//         formData.append("gstNumber", gstNumber || "");
//         formData.append("gstPercent", parseFloat(taxPercent) || 0);
//         formData.append("invoiceCode", invoiceNo);
//         formData.append("invoice_date", invoiceDate);
//         formData.append("salesPersonId", salesperson || "");
//         formData.append("shippingAddress", shippingAddress || "");
//         formData.append("subTotal", subTotal.toFixed(2));
//         formData.append("terms", terms);
//         formData.append("tnc", tncValue);
//         formData.append("totalAmount", grandTotal.toFixed(2));
//         formData.append("taxType", "GST");

//         data.forEach((item, index) => {
//           formData.append(
//             `invoiceItems[${index}].invoiceItemId`,
//             item.invoiceItemId || -1,
//           );
//           formData.append(`invoiceItems[${index}].itemName`, item.item || "");
//           formData.append(
//             `invoiceItems[${index}].description`,
//             item.description || "",
//           ); // ✅ dot fixed
//           formData.append(`invoiceItems[${index}].hsnCode`, item.hsn || ""); // ✅ use item.hsn (your state field)
//           formData.append(
//             `invoiceItems[${index}].taxPercent`,
//             item.tax || "18",
//           );
//           formData.append(
//             `invoiceItems[${index}].taxAmount`,
//             item.taxAmount || "0",
//           );
//           formData.append(
//             `invoiceItems[${index}].itemType`,
//             item.itemtype || "PLAN",
//           );
//           formData.append(
//             `invoiceItems[${index}].planHistoryId`,
//             item.planHistoryId || "",
//           );
//           formData.append(
//             `invoiceItems[${index}].qty`,
//             item.itemtype === "PLAN" ? "1" : item.qty || "1",
//           );
//           formData.append(
//             `invoiceItems[${index}].rate`,
//             item.itemtype === "PLAN" ? item.amount : item.rate || "0",
//           );
//           formData.append(`invoiceItems[${index}].amount`, item.amount || "0");
//         });

//         if (uploadedFiles.length > 0)
//           uploadedFiles.forEach((file) => formData.append("doc", file));

//         const response = await updateSuperAdminInvoice(formData);

//         if (response?.data?.success) {
//           await Swal.fire({
//             icon: "success",
//             title: "Success",
//             text: "Invoice updated successfully!",
//             timer: 1500,
//             showConfirmButton: false,
//           });

//           navigate("/admin-invoice"); // 🔥 redirect
//         } else {
//           message.error(response?.data?.msg || "Update failed");
//         }
//       } else {
//         // ✅ CREATE flow — FormData (unchanged)
//         const formData = new FormData();
//         formData.append("adjust_amount", adjustmentAmt.toFixed(2));
//         formData.append("billingAddress", billingAddress);
//         formData.append("billingName", billingName);
//         formData.append("customerName", partyName);
//         formData.append("customerId", partyId || "");
//         formData.append("customerNotes", customerNotes);
//         formData.append("discountAmount", discountAmt.toFixed(2));
//         formData.append("discountPer", parseFloat(discount) || 0);
//         formData.append("due_date", dueDate || "");
//         formData.append("gstAmount", gstAmt.toFixed(2));
//         formData.append("gstNumber", gstNumber || "");
//         formData.append("gstPercent", parseFloat(taxPercent) || 0);
//         formData.append("invoiceCode", invoiceNo);
//         formData.append("invoice_date", invoiceDate);
//         formData.append("salesPersonId", salesperson || "");
//         formData.append("shippingAddress", shippingAddress || "");
//         formData.append("subTotal", subTotal.toFixed(2));
//         formData.append("terms", terms);
//         formData.append("tnc", tncValue);
//         formData.append("totalAmount", grandTotal.toFixed(2));
//         formData.append("taxType", "GST");
//         data.forEach((item, index) => {
//           formData.append(`invoiceItems[${index}].invoiceItemId`, -1);
//           formData.append(`invoiceItems[${index}].itemName`, item.item || "");
//           formData.append(
//             `invoiceItems[${index}].description`,
//             item.description || "",
//           );
//           formData.append(`invoiceItems[${index}].hsnCode`, item.hsn || ""); // ✅ ADD
//           formData.append(
//             `invoiceItems[${index}].taxPercent`,
//             item.tax || "18",
//           );
//           formData.append(
//             `invoiceItems[${index}].taxAmount`,
//             item.taxAmount || "0",
//           );
//           formData.append(
//             `invoiceItems[${index}].itemType`,
//             item.itemtype || "PLAN",
//           );
//           formData.append(
//             `invoiceItems[${index}].planHistoryId`,
//             item.planHistoryId || "",
//           );
//           formData.append(
//             `invoiceItems[${index}].qty`,
//             item.itemtype === "PLAN" ? "1" : item.qty || "1",
//           );
//           formData.append(
//             `invoiceItems[${index}].rate`,
//             item.itemtype === "PLAN" ? item.amount : item.rate || "0",
//           );
//           formData.append(`invoiceItems[${index}].amount`, item.amount || "0");
//         });
//         if (uploadedFiles.length > 0)
//           uploadedFiles.forEach((file) => formData.append("doc", file));

//         const response = await SuperAdminAddInvoice(formData);
//         if (response?.data?.success) {
//           await Swal.fire({
//             icon: "success",
//             title: "Success",
//             text: "Invoice created successfully!",
//             timer: 1500,
//             showConfirmButton: false,
//           });

//           navigate("/admin-invoice"); // 🔥 redirect
//         } else {
//           message.error(response?.data?.msg || "Failed to create invoice");
//         }
//       }
//     } catch (error) {
//       message.error(error?.response?.data?.msg || "Failed to save invoice");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const labelCls =
//     "block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5";

//   return (
//     <div className="flex flex-col min-h-screen bg-white mx-auto shadow-md">
//       {/* Top Bar */}
//       <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200 bg-white">
//         <div className="flex items-center gap-2">
//           <svg
//             width="18"
//             height="18"
//             viewBox="0 0 24 24"
//             fill="none"
//             stroke="#6b7280"
//             strokeWidth="1.5"
//           >
//             <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//             <polyline points="14 2 14 8 20 8" />
//             <line x1="16" y1="13" x2="8" y2="13" />
//             <line x1="16" y1="17" x2="8" y2="17" />
//           </svg>
//           <span className="text-[15px] font-semibold text-gray-800">
//             New Invoice
//           </span>
//         </div>
//       </div>

//       <div className="flex-1 flex flex-col">
//         {/* Customer Name + Address */}
//         <div className="pb-5 px-8 py-5 border-b border-gray-100 mb-5">
//           {/* ── Customer Name (plain text input) ── */}
//           <div className="flex items-start mb-4">
//             <label className="w-40 flex-shrink-0 text-sm font-medium pt-1.5">
//               Customer Name <span className="text-red-500">*</span>
//             </label>
//             <div className="flex-1 flex flex-col gap-0.5">
//               <div className="relative w-[550px]">
//                 <div
//                   className={`flex items-center justify-between h-8 border rounded px-2.5 cursor-pointer bg-white hover:border-blue-400 transition-colors ${errors.partyName ? "border-red-400" : "border-gray-300"}`}
//                   onClick={() => setShowPartyDrop((v) => !v)}
//                 >
//                   <span
//                     className={`text-sm ${partyName ? "text-gray-800" : "text-gray-400"}`}
//                   >
//                     {loadingParties
//                       ? "Loading..."
//                       : partyName || "Select a customer"}
//                   </span>
//                   <ChevronDown />
//                 </div>

//                 {showPartyDrop && (
//                   <div className="absolute top-9 left-0 w-full bg-white border border-gray-200 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
//                     <input
//                       className="w-full border-b border-gray-100 px-3 py-2 text-sm outline-none placeholder-gray-400"
//                       placeholder="Search..."
//                       value={partySearch}
//                       onChange={(e) => setPartySearch(e.target.value)}
//                       autoFocus
//                       onClick={(e) => e.stopPropagation()}
//                     />
//                     {partyList
//                       .filter((p) =>
//                         p.label
//                           .toLowerCase()
//                           .includes(partySearch.toLowerCase()),
//                       )
//                       .map((p) => (
//                         <div
//                           key={p.value}
//                           className="px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors"
//                           onClick={() => {
//                             setPartyId(p.value); // ← add
//                             setPartyName(p.label);
//                             setShowPartyDrop(false);
//                             setPartySearch("");
//                             setShowAddressSection(true);
//                             clearErr("partyName");
//                             fetchPartyDetails(p.value); // ← add
//                           }}
//                         >
//                           {p.label}
//                         </div>
//                       ))}
//                     {partyList.filter((p) =>
//                       p.label.toLowerCase().includes(partySearch.toLowerCase()),
//                     ).length === 0 && (
//                       <div className="px-3 py-2 text-sm text-gray-400">
//                         No customers found
//                       </div>
//                     )}
//                   </div>
//                 )}
//               </div>
//               <Err msg={errors.partyName} />
//             </div>
//           </div>

//           {/* ── Addresses (shown once name has value) ── */}
//           {showAddressSection && (
//             <div className="flex items-start">
//               <div className="w-40 flex-shrink-0"></div>
//               <div className="flex-1 grid grid-cols-3">
//                 {/* Billing Address */}
//                 <div>
//                   <div className="flex items-center gap-1.5 mb-1.5">
//                     <span className="text-[10.5px] font-semibold text-gray-500 uppercase tracking-wide">
//                       Billing Address <span className="text-red-500">*</span>
//                     </span>
//                     <span
//                       className="text-gray-400 cursor-pointer hover:text-blue-500 transition-colors"
//                       onClick={() => setIsEditingAddress(true)}
//                     >
//                       <EditIcon />
//                     </span>
//                   </div>
//                   {isEditingAddress ? (
//                     <>
//                       <textarea
//                         ref={addressRef}
//                         className={`w-full border rounded-md px-2.5 py-2 text-sm text-gray-700 outline-none resize-none leading-5 transition-colors ${errors.billingAddress ? "border-red-400 bg-red-50/20" : "border-blue-400  focus:bg-white"}`}
//                         value={billingAddress}
//                         rows={4}
//                         onChange={(e) => {
//                           setBillingAddress(e.target.value);
//                           clearErr("billingAddress");
//                         }}
//                         onBlur={() => setIsEditingAddress(false)}
//                         onKeyDown={(e) => {
//                           if (e.key === "Escape") setIsEditingAddress(false);
//                           if (e.key === "Enter" && e.ctrlKey)
//                             setIsEditingAddress(false);
//                         }}
//                       />
//                       <div className="flex items-center gap-2 mt-1.5">
//                         <button
//                           className="h-8 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60 rounded"
//                           onClick={handleSubmit}
//                           disabled={loading}
//                         >
//                           {loading ? "Saving…" : invoiceId ? "Update" : "Save"}{" "}
//                           {/* ✅ */}
//                         </button>
//                         <button
//                           className="text-xs text-gray-500 hover:text-gray-700 rounded px-2 py-1 transition-colors"
//                           onMouseDown={(e) => {
//                             e.preventDefault();
//                             setIsEditingAddress(false);
//                           }}
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </>
//                   ) : (
//                     <p
//                       className="text-sm text-gray-700 whitespace-pre-line leading-5 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 py-0.5 transition-colors"
//                       onClick={() => setIsEditingAddress(true)}
//                     >
//                       {billingAddress || (
//                         <span className="text-gray-400 italic">
//                           Click to add billing address...
//                         </span>
//                       )}
//                     </p>
//                   )}
//                   <Err msg={errors.billingAddress} />
//                 </div>

//                 {/* Shipping Address */}
//                 <div>
//                   <div className="flex items-center gap-1.5 mb-1.5">
//                     <span className="text-[10.5px] font-semibold text-gray-500 uppercase tracking-wide ps-1">
//                       Shipping Address
//                     </span>
//                     {shippingAddress && (
//                       <span
//                         className="text-gray-400 cursor-pointer hover:text-blue-500 transition-colors"
//                         onClick={() => setIsEditingShipping(true)}
//                       >
//                         <EditIcon />
//                       </span>
//                     )}
//                   </div>
//                   {isEditingShipping ? (
//                     <>
//                       <textarea
//                         ref={shippingRef}
//                         className="w-full border border-blue-400 rounded-md px-2.5 py-2 text-sm text-gray-700 outline-none resize-none leading-5  focus:bg-white transition-colors ps-2"
//                         value={
//                           shippingAddress.trim() === "" ? "" : shippingAddress
//                         }
//                         rows={4}
//                         placeholder="Enter shipping address..."
//                         onChange={(e) => setShippingAddress(e.target.value)}
//                         onBlur={() => {
//                           if (!shippingAddress.trim()) setShippingAddress("");
//                           setIsEditingShipping(false);
//                         }}
//                         onKeyDown={(e) => {
//                           if (e.key === "Escape") {
//                             if (!shippingAddress.trim()) setShippingAddress("");
//                             setIsEditingShipping(false);
//                           }
//                           if (e.key === "Enter" && e.ctrlKey)
//                             setIsEditingShipping(false);
//                         }}
//                       />
//                       <div className="flex items-center gap-2 mt-1.5">
//                         <button
//                           className="text-xs text-white bg-blue-600 hover:bg-blue-700 rounded px-2.5 py-1 transition-colors"
//                           onMouseDown={(e) => {
//                             e.preventDefault();
//                             if (!shippingAddress.trim()) setShippingAddress("");
//                             setIsEditingShipping(false);
//                           }}
//                         >
//                           Save
//                         </button>
//                         <button
//                           className="text-xs text-gray-500 hover:text-gray-700 rounded px-2 py-1 transition-colors"
//                           onMouseDown={(e) => {
//                             e.preventDefault();
//                             if (!shippingAddress.trim()) setShippingAddress("");
//                             setIsEditingShipping(false);
//                           }}
//                         >
//                           Cancel
//                         </button>
//                       </div>
//                     </>
//                   ) : shippingAddress.trim() ? (
//                     <p
//                       className="text-sm text-gray-700 whitespace-pre-line leading-5 cursor-pointer hover:bg-gray-50 rounded px-1 -mx-1 py-0.5 transition-colors"
//                       onClick={() => setIsEditingShipping(true)}
//                     >
//                       {shippingAddress}
//                     </p>
//                   ) : (
//                     <span
//                       className="text-blue-500 text-sm cursor-pointer hover:underline ps-5"
//                       onClick={() => {
//                         setShippingAddress("");
//                         setIsEditingShipping(true);
//                       }}
//                     >
//                       + New Address
//                     </span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Billing Name + GST */}
//         <div className="pb-4 px-8 py-5 border-b border-gray-100 mb-4 flex flex-col gap-3">
//           <div className="flex items-start">
//             <label className="w-40 flex-shrink-0 text-sm pt-1">
//               Billing Name <span className="text-red-500">*</span>
//             </label>
//             <div>
//               <input
//                 className={`w-72 h-8 border rounded px-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white transition-colors ${eb("billingName")}`}
//                 value={billingName}
//                 onChange={(e) => {
//                   setBillingName(e.target.value);
//                   clearErr("billingName");
//                 }}
//                 placeholder="Enter billing name"
//               />
//               <Err msg={errors.billingName} />
//             </div>
//           </div>
//           <div className="flex items-center">
//             <label className="w-40 flex-shrink-0 text-sm">GST Number</label>
//             <input
//               className="w-72 h-8 border border-gray-300 rounded px-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white transition-colors"
//               value={gstNumber}
//               onChange={(e) => setGstNumber(e.target.value)}
//             />
//           </div>
//         </div>

//         {/* Invoice Meta */}
//         <div className="pb-4 px-8 py-5 border-b border-gray-100 mb-4 flex flex-col gap-4">
//           <div className="flex items-start">
//             <label className="w-40 flex-shrink-0 text-sm font-medium pt-1">
//               Invoice# <span className="text-red-500">*</span>
//             </label>
//             <div>
//               <div
//                 className={`flex h-8 w-72 border rounded overflow-hidden focus-within:border-blue-400 transition-colors ${
//                   errors.invoiceNo ? "border-red-400" : "border-gray-300"
//                 }`}
//               >
//                 <input
//                   className="flex-1 px-2.5 text-sm text-gray-800 outline-none bg-white"
//                   value={invoiceNo}
//                   onChange={(e) => {
//                     setInvoiceNo(e.target.value);
//                     clearErr("invoiceNo");
//                   }}
//                   placeholder="Auto-generated, editable"
//                 />
//               </div>
//               <Err msg={errors.invoiceNo} />
//             </div>
//           </div>

//           <div className="flex items-start gap-4 flex-wrap">
//             <div className="flex items-start">
//               <label className="w-40 flex-shrink-0 text-sm font-medium pt-1">
//                 Invoice Date <span className="text-red-500">*</span>
//               </label>
//               <div>
//                 <DatePicker
//                   format="DD/MM/YYYY"
//                   value={invoiceDate ? dayjs(invoiceDate, "DD/MM/YYYY") : null}
//                   onChange={(date) => {
//                     const formatted = date ? date.format("DD/MM/YYYY") : "";
//                     setInvoiceDate(formatted);
//                     clearErr("invoiceDate");
//                     if (terms && date) {
//                       const days =
//                         terms === "Net 15"
//                           ? 15
//                           : terms === "Net 30"
//                             ? 30
//                             : terms === "Net 60"
//                               ? 60
//                               : 0;
//                       setDueDate(addDaysToDate(formatted, days));
//                     }
//                   }}
//                   className={`h-8 w-48 ${eb("invoiceDate")}`}
//                   placeholder="DD/MM/YYYY"
//                 />
//                 <Err msg={errors.invoiceDate} />
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-sm">Terms</span>
//               <div className="relative">
//                 <select
//                   className="h-8 border border-gray-300 rounded pl-2.5 pr-7 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white appearance-none cursor-pointer w-44 transition-colors"
//                   value={terms}
//                   onChange={(e) => {
//                     const value = e.target.value;
//                     setTerms(value);
//                     if (!invoiceDate) return;
//                     const days =
//                       value === "Net 15"
//                         ? 15
//                         : value === "Net 30"
//                           ? 30
//                           : value === "Net 60"
//                             ? 60
//                             : 0;
//                     setDueDate(addDaysToDate(invoiceDate, days));
//                   }}
//                 >
//                   <option value="Due on Receipt">Due on Receipt</option>
//                   <option value="Net 15">Net 15</option>
//                   <option value="Net 30">Net 30</option>
//                   <option value="Net 60">Net 60</option>
//                 </select>
//                 <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
//                   <ChevronDown />
//                 </span>
//               </div>
//             </div>
//             <div className="flex items-start gap-2">
//               <span className="text-sm pt-1">
//                 Due Date <span className="text-red-500">*</span>
//               </span>
//               <div>
//                 <DatePicker
//                   format="DD/MM/YYYY"
//                   value={dueDate ? dayjs(dueDate, "DD/MM/YYYY") : null}
//                   onChange={(date) => {
//                     setDueDate(date ? date.format("DD/MM/YYYY") : "");
//                     clearErr("dueDate");
//                   }}
//                   className={`h-8 w-40 ${eb("dueDate")}`}
//                   placeholder="DD/MM/YYYY"
//                 />
//                 <Err msg={errors.dueDate} />
//               </div>
//             </div>
//           </div>

//           <div className="flex items-start">
//             <label className="w-40 flex-shrink-0 text-sm pt-1">
//               Salesperson <span className="text-red-500">*</span>
//             </label>
//             <div>
//               <div className="relative w-72">
//                 <select
//                   className={`w-full h-8 border rounded pl-2.5 pr-7 text-sm text-gray-800 outline-none focus:border-blue-400 bg-white appearance-none cursor-pointer transition-colors ${eb("salesperson")}`}
//                   value={salesperson}
//                   onChange={(e) => {
//                     setSalesperson(e.target.value);
//                     clearErr("salesperson");
//                   }}
//                 >
//                   <option value="">Select Salesperson</option>
//                   {salespersonList.map((s) => (
//                     <option key={s.value} value={s.value}>
//                       {s.label}
//                     </option>
//                   ))}
//                 </select>
//                 <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
//                   <ChevronDown />
//                 </span>
//               </div>
//               <Err msg={errors.salesperson} />
//             </div>
//           </div>
//         </div>

//         {/* Items Table */}
//         <div className="mb-4 px-8 py-5">
//           <div className="border border-gray-200 rounded-md overflow-hidden">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-gray-50 border-b border-gray-200">
//                   <th className="w-6 px-1 py-2.5"></th>
//                   <th className="text-left px-3 py-2.5 text-[12.5px] font-semibold text-black uppercase tracking-wide">
//                     Item Details <span className="text-red-500">*</span>
//                   </th>
//                   <th className="text-right px-3 py-2.5 text-[12.5px] font-semibold text-black uppercase tracking-wide w-20">
//                     Quantity
//                   </th>
//                   <th className="text-right px-3 py-2.5 text-[12.5px] font-semibold text-black uppercase tracking-wide w-32">
//                     Rate <span className="text-red-500">*</span>
//                   </th>

//                   <th className="text-right px-3 py-2.5 text-[12.5px] font-semibold text-black uppercase tracking-wide w-24">
//                     Amount <span className="text-red-500">*</span>
//                   </th>
//                   <th className="w-8 px-1 py-2.5"></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {data.map((row, index) => {
//                   const isPlan = row.itemtype === "PLAN";
//                   const isExpanded = expandedKey === row.key;
//                   return (
//                     <React.Fragment key={row.key}>
//                       {/* ── Main Row ── */}
//                       <tr
//                         draggable
//                         onDragStart={() => handleDragStart(row.key)}
//                         onDragEnter={() => handleDragEnter(row.key)}
//                         onDragEnd={handleDragEnd}
//                         onDragOver={(e) => e.preventDefault()}
//                         className={`border-b border-gray-100 last:border-0 transition-colors group `}
//                       >
//                         {/* Grip */}
//                         <td className="px-2 py-2 text-gray-300 group-hover:text-gray-400 border border-gray-200">
//                           <GripIcon />
//                         </td>

//                         {/* Item Details cell — name + inline expand */}
//                         <td className="px-3 py-1.5 border border-gray-200">
//                           <div className="flex items-start gap-1">
//                             <div className="flex-1 min-w-0">
//                               {/* Item name input */}
//                               <textarea
//                                 rows={1}
//                                 className={`w-full border rounded px-1.5 py-1 text-sm text-gray-700 outline-none hover:border-gray-200 focus:border-blue-400 focus:bg-white bg-transparent transition-colors placeholder-gray-300 resize-none overflow-hidden leading-5 ${
//                                   errors[`item_${index}_name`]
//                                     ? "border-red-400"
//                                     : "border-transparent"
//                                 }`}
//                                 value={row.item}
//                                 onChange={(e) => {
//                                   e.target.style.height = "auto";
//                                   e.target.style.height =
//                                     e.target.scrollHeight + "px";
//                                   handleCellChange(
//                                     row.key,
//                                     "item",
//                                     e.target.value,
//                                   );
//                                 }}
//                                 onFocus={(e) => {
//                                   e.target.style.height = "auto";
//                                   e.target.style.height =
//                                     e.target.scrollHeight + "px";
//                                 }}
//                                 placeholder="Type or click to select an item."
//                               />

//                               {/* Inline expanded panel */}
//                               {isExpanded && (
//                                 <div className="mt-1.5 ">
//                                   <textarea
//                                     rows={2}
//                                     autoFocus
//                                     placeholder="Add a description to your item"
//                                     className="w-full border border-blue-300 rounded px-2 py-1.5 text-xs text-gray-600 placeholder-gray-400 outline-none focus:border-blue-500 bg-white resize-none transition-colors"
//                                     value={row.description || ""}
//                                     onChange={(e) =>
//                                       handleCellChange(
//                                         row.key,
//                                         "description",
//                                         e.target.value,
//                                       )
//                                     }
//                                   />
//                                   <div className="flex items-center gap-2">
//                                     <span className="text-[11px] text-blue-600 flex items-center gap-1">
//                                       HSN Code:
//                                       <input
//                                         className="border-b border-dashed border-gray-400 bg-transparent outline-none text-[11px] text-blue-600 w-20 focus:border-blue-500"
//                                         value={row.hsn || ""}
//                                         onChange={(e) =>
//                                           handleCellChange(
//                                             row.key,
//                                             "hsn",
//                                             e.target.value,
//                                           )
//                                         }
//                                         placeholder="Update"
//                                       />
//                                     </span>
//                                   </div>
//                                 </div>
//                               )}

//                               {/* Description preview when collapsed */}
//                               {!isExpanded && row.description && (
//                                 <p className="text-[11px] text-gray-400 px-1.5 mt-0.5 truncate">
//                                   {row.description}
//                                 </p>
//                               )}
//                               {!isExpanded && row.hsn && (
//                                 <p className="text-[11px] text-gray-400 px-1.5 mt-0.5">
//                                   HSN:{" "}
//                                   <span className="text-blue-500">
//                                     {row.hsn}
//                                   </span>
//                                 </p>
//                               )}
//                             </div>

//                             {/* Expand + clear buttons — shown when item has a name */}
//                             {row.item && (
//                               <div className="flex items-center gap-0.5 mt-1 flex-shrink-0">
//                                 <button
//                                   type="button"
//                                   onClick={() => toggleExpand(row.key)}
//                                   title="Add description"
//                                   className={`w-5 h-5 rounded-full border text-[10px] flex items-center justify-center transition-colors ${
//                                     isExpanded
//                                       ? "border-blue-400 text-blue-500 bg-blue-100"
//                                       : "border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500"
//                                   }`}
//                                 >
//                                   {isExpanded ? "−" : "+"}
//                                 </button>
//                               </div>
//                             )}
//                           </div>
//                         </td>

//                         {/* Type */}
//                         {/* <td className="px-3 py-1.5 border border-gray-200">
//                           <select
//                             className={`w-full border rounded px-1.5 py-1 text-sm text-gray-700 outline-none hover:border-gray-200 focus:border-blue-400 bg-transparent transition-colors cursor-pointer ${
//                               errors[`item_${index}_type`]
//                                 ? "border-red-400"
//                                 : "border-transparent"
//                             }`}
//                             value={row.itemtype}
//                             onChange={(e) =>
//                               handleCellChange(
//                                 row.key,
//                                 "itemtype",
//                                 e.target.value,
//                               )
//                             }
//                           >
//                             <option value="PLAN">Plan</option>
//                             <option value="EXTRA">Service</option>
//                           </select>
//                         </td> */}

//                         <td className="px-3 py-1.5 border border-gray-200 align-top">
//                           <input
//                             type="text"
//                             className={`w-full border rounded px-1.5 py-1 text-sm text-gray-700 text-right outline-none
//       border-gray-300 focus:border-blue-500 focus:bg-white bg-white
//       ${errors[`item_${index}_qty`] ? "border-red-400" : ""}`}
//                             value={row.qty}
//                             onChange={(e) =>
//                               handleCellChange(row.key, "qty", e.target.value)
//                             }
//                           />
//                         </td>

//                         <td className="px-3 py-1.5 border border-gray-200 align-top">
//                           <input
//                             type="text"
//                             className={`w-full min-w-[80px] border rounded px-1.5 py-1 text-sm text-gray-700 text-right outline-none
//                              border-gray-300 focus:border-blue-500 focus:bg-white bg-white
//                               ${errors[`item_${index}_rate`] ? "border-red-400" : ""}`}
//                             value={row.rate}
//                             onChange={(e) =>
//                               handleCellChange(row.key, "rate", e.target.value)
//                             }
//                           />
//                         </td>

//                         {/* Tax */}
//                         {/* <td className="px-3 py-1.5 border border-gray-200  align-top">
//                           <select
//                             value={String(row.tax ?? "18")}
//                             onChange={
//                               (e) =>
//                                 handleCellChange(row.key, "tax", e.target.value) // ← remove Number(), keep as string
//                             }
//                           >
//                             <option value="18">IGST 18%</option>
//                             <option value="12">IGST 12%</option>
//                             <option value="5">IGST 5%</option>
//                             <option value="0">IGST 0%</option>
//                           </select>
//                         </td>
//                         <td className="px-3 py-1.5 border text-right text-sm  align-top">
//                           {parseFloat(row.taxAmount || 0)}
//                         </td> */}
//                         {/* Amount */}
//                         <td className="px-3 py-1.5 border border-gray-200 align-top">
//                           <span className="block text-right text-sm font-semibold text-gray-700 px-1.5">
//                             {parseFloat(row.amount || 0)}
//                           </span>
//                         </td>

//                         {/* Delete */}
//                         <td className="px-2 py-1.5 border border-gray-200">
//                           <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
//                             <button
//                               type="button"
//                               className="w-5 h-5 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors text-xs"
//                               onClick={() => deleteRow(row.key)}
//                             >
//                               ✕
//                             </button>
//                           </div>
//                         </td>
//                       </tr>

//                       {/* ── Expanded sub-row: Stock + Recent Transactions ── */}
//                     </React.Fragment>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//           <div className="flex items-center gap-2 mt-3">
//             <button
//               type="button"
//               onClick={addRow}
//               className="flex items-center gap-1.5 text-blue-600 text-xs font-medium border border-dashed border-blue-400 rounded px-3 py-1.5 hover:bg-blue-50 transition-colors"
//             >
//               <PlusIcon /> Add New Row
//             </button>
//           </div>
//         </div>
//         <div className="grid md:grid-cols-2 gap-3 mb-5 px-8 py-5 items-stretch">
//           <div className="min-w-full flex flex-col h-full">
//             <h4 className="text-base font-semibold leading-none text-gray-900 mb-2">
//               <FormattedMessage
//                 id="COMMON.NOTES"
//                 defaultMessage="Terms & conditions "
//               />
//             </h4>

//             <TextArea
//               placeholder="Thanks for your Business..."
//               className="flex-1 resize-none"
//               value={customerNotes}
//               onChange={(e) => setCustomerNotes(e.target.value)}
//             />
//           </div>
//           <div className="min-w-full flex flex-col h-full">
//             <h4 className="text-base font-semibold leading-none text-gray-900 mb-2">
//               <FormattedMessage id="COMMON.SUMMARY" defaultMessage="Summary" />
//             </h4>
//             <div className="border rounded-lg min-w-full p-4">
//               {/* Subtotal */}
//               <div className="flex justify-between items-center mb-2">
//                 <span className="text-sm text-gray-900">
//                   <FormattedMessage
//                     id="COMMON.SUBTOTAL"
//                     defaultMessage="Subtotal"
//                   />
//                 </span>
//                 <span className="font-semibold">
//                   ₹{" "}
//                   <span
//                     className={`text-sm font-semibold text-right ${errors.subTotal ? "text-red-500" : "text-gray-700"}`}
//                   >
//                     {subTotal.toFixed(2)}
//                   </span>
//                 </span>
//               </div>

//               {/* Discount */}

//               <div className="grid grid-cols-3 items-center md-4">
//                 <span className="text-sm text-gray-900">Discount</span>
//                 <div className="flex items-center gap-2 mb-2">
//                   <input
//                     className="w-16 h-8 border border-gray-300 rounded px-2 text-sm text-right outline-none focus:border-blue-400"
//                     value={discount}
//                     onChange={(e) => setDiscount(e.target.value)}
//                     placeholder="0"
//                   />
//                   <span className="text-sm text-gray-500">%</span>
//                 </div>
//                 <span className="text-sm text-red-500 text-right">
//                   {discountAmt > 0 ? "- " : ""}
//                   {discountAmt.toFixed(2)}
//                 </span>
//               </div>

//               {/* Taxable Amount */}
//               <div className="flex justify-between items-center mb-2 pb-2 border-b  px-2 py-1 rounded">
//                 <span className="text-sm font-semibold text-gray-900">
//                   <FormattedMessage
//                     id="COMMON.TAXABLE_AMOUNT"
//                     defaultMessage="Taxable Amount"
//                   />
//                 </span>
//                 <span className="font-bold text-blue-700">
//                   ₹{taxableAmount.toFixed(2)}
//                 </span>
//               </div>
//               {/* GST */}
//               <div className="grid grid-cols-3 items-center mb-2">
//                 <span className="text-sm text-gray-900 font-medium">GST</span>
//                 <div className="flex items-center gap-1.5">
//                   <input
//                     className="w-16 h-8 border border-gray-300 rounded px-2 text-sm text-right outline-none focus:border-blue-400"
//                     value={taxPercent}
//                     onChange={(e) => setTaxPercent(e.target.value)}
//                     placeholder="0"
//                   />
//                   <span className="text-sm text-gray-500">%</span>
//                 </div>
//                 <span className="text-sm text-right font-medium text-green-600">
//                   + ₹{gstAmt.toFixed(2)}
//                 </span>
//               </div>

//               {/* Round Off - Manual input, adds to grand total */}
//               <div className="grid grid-cols-3 items-center">
//                 <span className="text-sm text-gray-700">Adjustment</span>
//                 <div className="flex items-center gap-2 mt-2">
//                   <input
//                     className="w-24 h-8 border border-gray-300 rounded px-2 text-sm text-right outline-none focus:border-blue-400"
//                     value={adjustment}
//                     onChange={(e) => setAdjustment(e.target.value)}
//                   />
//                   <span className="text-gray-400">
//                     <InfoIcon />
//                   </span>
//                 </div>
//                 <span
//                   className={`text-sm text-right ${adjustmentAmt < 0 ? "text-red-500" : adjustmentAmt > 0 ? "text-green-600" : "text-gray-700"}`}
//                 >
//                   {adjustmentAmt > 0 ? "+ " : ""}
//                 </span>
//               </div>

//               {/* Grand Total */}
//               <div className="flex justify-between pt-2 font-semibold">
//                 <span className="text-base text-primary">
//                   <FormattedMessage
//                     id="COMMON.GRAND_TOTAL"
//                     defaultMessage="Grand Total"
//                   />
//                 </span>
//                 <span className="text-lg text-primary font-bold">
//                   ₹{grandTotal.toFixed(2)}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="grid md:grid-cols-2 gap-3 mb-5 px-8 py-5">
//           <div className="min-w-full">
//             <div className="p-3 border rounded-lg whitespace-pre-line text-sm">
//               <h4 className="text-base font-semibold leading-none text-gray-900 mb-2">
//                 <FormattedMessage
//                   id="COMMON.TERMS_AND_CONDITIONS"
//                   defaultMessage="Bank Details"
//                 />
//               </h4>
//               {bankDetails && (
//                 <div className="text-gray-700">
//                   AC NO. :- {bankDetails.accountNo?.toUpperCase()} <br />
//                   BRANCH :- {bankDetails.branchName?.toUpperCase()} <br />
//                   IFSC CODE :- {bankDetails.ifscCode?.toUpperCase()} <br />
//                   AC NAME :- {bankDetails.accountHolderName?.toUpperCase()}
//                 </div>
//               )}
//             </div>
//           </div>
//           <div className="min-w-full">
//             <div className="border rounded-lg min-w-full h-full p-4">
//               {/* Title */}
//               <h4 className="text-base font-semibold leading-none text-gray-900 mb-3">
//                 <FormattedMessage
//                   id="COMMON.ATTACH_FILES_TO_INVOICE"
//                   defaultMessage="Attach Files to Invoice"
//                 />
//               </h4>

//               {/* Upload Area */}
//               <div className=" rounded-md  flex flex-col gap-2">
//                 {/* Upload Button */}
//                 <label className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1.5 text-xs bg-white hover:border-blue-400 hover:text-blue-500 w-fit transition-colors cursor-pointer">
//                   <UploadOutlined />
//                   <FormattedMessage
//                     id="COMMON.UPLOAD_FILE"
//                     defaultMessage="Upload File"
//                   />

//                   <input
//                     type="file"
//                     multiple
//                     className="hidden"
//                     onChange={handleFileChange}
//                   />
//                 </label>

//                 {/* Uploaded Files List */}
//                 {uploadedFiles.length > 0 && (
//                   <ul className="text-[11px] text-gray-500 space-y-1 mt-1">
//                     {uploadedFiles.map((file, index) => (
//                       <li key={index} className="flex items-center gap-2">
//                         <span>📎</span>
//                         <span className="truncate max-w-[200px]">
//                           {file.name}
//                         </span>
//                       </li>
//                     ))}
//                   </ul>
//                 )}

//                 {/* Helper Text */}
//                 <p className="text-[10.5px] text-gray-400">
//                   <FormattedMessage
//                     id="COMMON.UPLOAD_MAX_FILE_SIZE"
//                     defaultMessage="You can upload a maximum of 10 files, 10MB each"
//                   />
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Terms & File Upload */}
//       </div>

//       {/* Footer */}
//       <div className="sticky bottom-0 flex items-center justify-between px-5 py-3 border-t border-gray-200 bg-gray-50">
//         <div className="flex items-center gap-2">
//           <button
//             className="h-8 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60 rounded"
//             onClick={handleSubmit}
//             disabled={loading}
//           >
//             {loading ? "Saving…" : "Save"}
//           </button>
//           <button
//             onClick={() => navigate("/admin-invoice")}
//             className="h-8 px-4 text-sm font-medium bg-white border border-gray-300 rounded hover:border-gray-400 hover:bg-gray-50 transition-colors"
//           >
//             Cancel
//           </button>
//         </div>
//         <div className="text-right">
//           <div className="text-xs text-gray-500">
//             Total Amount:{" "}
//             <span className="font-semibold text-gray-700">
//               ₹ {grandTotal.toFixed(2)}
//             </span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Addinvoice;
