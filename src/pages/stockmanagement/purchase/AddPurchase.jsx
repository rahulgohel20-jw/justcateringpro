import { useState, useEffect, useRef, useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import {
  ArrowLeft,
  Plus,
  Save,
  X,
  Package,
  FileText,
  Hash,
  Calendar,
  User,
  Receipt,
  Tag,
  AlignLeft,
  Trash2,
  ShoppingCart,
  Percent,
  DollarSign,
  BarChart2,
  Search,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router";
import {
  GetAllRawMaterial,
  OutsideContactName,
  AddPuchase,
  AddGenerateInvoice,
  SearchRawMaterial,
  AddLogs,
  GetStockTypeByUserId,
  getRawMaterialPriceforpurchase ,
   generateGrnNumber,
} from "../../../services/apiServices";
import AddContactName from "../../master/MenuItemMaster/components/AddContactName";
import Swal from "sweetalert2";
import AddRawMaterial from "../../../partials/modals/add-raw-material/AddRawMaterial";
import { Select, Switch } from "antd";
import { usePermission } from "../../../hooks/usePermission";
import { useStockTypePermission } from "../../../hooks/useStockTypePermission";

const EditableCell = ({
  value,
  onChange,
  type = "number",
  className = "",
  placeholder = "0",
}) => (
  <input
    type={type}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full px-2 py-1.5 text-sm border border-transparent rounded-lg bg-transparent
      hover:border-slate-200 hover:bg-slate-50
      focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-300
      transition-all text-center ${className}`}
  />
);

// ── GST-aware total calculation ───────────────────────────────────────────────
// total = (qty × price) + other_charges + GST on (qty × price)
const calcTotal = (qty, price, other, cgst, sgst, igst, cess) => {
  const base = (parseFloat(qty) || 0) * (parseFloat(price) || 0);
  const otherAmt = parseFloat(other) || 0;
  const gstRate =
    (parseFloat(cgst) || 0) +
    (parseFloat(sgst) || 0) +
    (parseFloat(igst) || 0) +
    (parseFloat(cess) || 0);
  const gstAmount = (base * gstRate) / 100;
  return (base + otherAmt + gstAmount).toFixed(2);
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

const getLogDescription = (status, form, items, isEdit, isFromPO) => {
  const action = isFromPO
    ? "Invoice"
    : isEdit
      ? "Purchase Edit"
      : "Purchase Add";
  const supplier = form.account_name || "-";
  const billNo = form.bill_no || "-";

  switch (status) {
    case "SAVE_SUCCESS": {
      const itemSummary = items
        .map((i) => `${i.item_name}(x${i.qty})`)
        .join(", ");
      return `${action} saved | Bill: ${billNo} | ${supplier} `; //${itemSummary} if rquired add this
    }
    case "SAVE_ERROR":
      return `${action} failed | Bill: ${billNo} | ${supplier}`;
    default:
      return `${action} performed`;
  }
};

const getEventType = (status, isEdit, isFromPO) => {
  const prefix = isFromPO
    ? "Invoice"
    : isEdit
      ? "Purchase_Edit"
      : "Purchase_Add";
  return status === "SAVE_SUCCESS" ? `${prefix}_Success` : `${prefix}_Error`;
};

// ── Main Component ────────────────────────────────────────────────────────────
const AddPurchase = () => {
  const intl = useIntl();
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [supplier, setSupplier] = useState([]);
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [menuItems, setMenuItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [dropdownPage, setDropdownPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stockTypes, setStockTypes] = useState([]);
  const DROPDOWN_PAGE_SIZE = 100;
  const [discountType, setDiscountType] = useState("percent");
  const { filterStockTypes } = useStockTypePermission();

  const debounceRef = useRef(null);

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const [form, setForm] = useState({
    voucher_no: "",
    date: "",
    bill_no: "",
    supplier_id: "",
    account_name: "",
    invoice_type: "Tax Invoice",
    remark: "",
    stock_type_id: "",
    priceUpdateMaster: false,
    grn_number: "",
  });

  const navigate = useNavigate();
  const [discount, setDiscount] = useState(0);
  const [adjustment, setAdjustment] = useState(0);
  const [saving, setSaving] = useState(false);
  const userId = localStorage.getItem("userId");

  const backDatePermission = usePermission("Lock Back Date Entry");
const isBackDateLocked = backDatePermission.add || backDatePermission.edit;

const todayStr = new Date().toISOString().split("T")[0];

  const location = useLocation();
  const editData = location.state?.editData || null;
  const poData = location.state?.poData || null;
  const isEdit = !!editData;
  const isFromPO = !!poData;
  const pageTitle = isEdit
    ? intl.formatMessage({
        id: "PURCHASE.EDIT",
        defaultMessage: "Edit Purchase",
      })
    : isFromPO
      ? intl.formatMessage({
          id: "PURCHASE.GENERATE",
          defaultMessage: "Generate Purchase Invoice",
        })
      : intl.formatMessage({
          id: "PURCHASE.ADD",
          defaultMessage: "Add Purchase",
        });

  const sendLog = useCallback(
    async (status, currentItems = []) => {
      try {
        const logPayload = {
          description: getLogDescription(
            status,
            form,
            currentItems,
            isEdit,
            isFromPO,
          ),
          eventId:0,
          eventType: getEventType(status, isEdit, isFromPO),
          id:  0,
          user: getUserEmail(),
        };
        await AddLogs(logPayload);
      } catch (logErr) {
        console.error("Failed to save log:", logErr);
      }
    },
    [userId, form, isEdit, isFromPO],
  );




  const FetchSearchDropdown = (searchTerm = "", page = 1, append = false) => {
    page === 1 ? setLoadingItems(true) : setLoadingMore(true);

    SearchRawMaterial(true, userId, page, DROPDOWN_PAGE_SIZE, searchTerm)
      .then((res) => {
        const data = res?.data?.data || {};
        const items = data["Raw Material Details"] || [];
        const total = data.totalItems || 0;
        setMenuItems((prev) => (append ? [...prev, ...items] : items));
        setDropdownPage(page);
        setHasMore(page * DROPDOWN_PAGE_SIZE < total);
      })
      .catch(() => {
        setMenuItems([]);
        setHasMore(false);
      })
      .finally(() => {
        setLoadingItems(false);
        setLoadingMore(false);
      });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setDropdownPage(1);
        setMenuItems([]);
        setHasMore(false);
        FetchSearchDropdown(searchQuery, 1, false);
      } else {
        setMenuItems([]);
        setHasMore(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Pre-fill editData ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!editData) return;
    setForm({
      voucher_no: editData.voucher || "",
      date: editData.podate
        ? editData.podate.split("/").reverse().join("-")
        : "",
      bill_no: editData.billno || "",
       grn_number: editData.grnNumber || "",
      supplier_id: editData.supplierId || "",
      account_name: editData.supplierName || "",
      invoice_type: editData.invoicetype || "Tax Invoice",
      remark: editData.remarks || "",
      stock_type_id: editData.stockTypeId || "",
       priceUpdateMaster: editData.priceUpdateMaster ?? true,
    });
    setDiscount(editData.discountper || 0);
    setAdjustment(editData.adjustamount || 0);
    setItems(
      (editData.details || []).map((d) => ({
        rawMaterialId: d.rawMaterialId || 0,
        item_name: d.rawMaterialName || "",
        hsc_sac: d.hsccode || "",
        cgst: d.cgst || 0,
        sgst: d.sgst || 0,
        igst: d.igst || 0,
        cess: d.cess || 0,  
        qty: d.qty || "",
        unit: d.unitName || "",
        unitId: d.unitId || 0,
        price_per_unit: d.price || "",
          originalPrice: d.oldPrice || d.price || "",
        other_charges: d.othercharge || 0,
        total_price: String(d.total || 0),
        originalQty: d.qty || 0,
        isAddInStock: d.isAddInStock ?? true,
      })),
    );
  }, [editData]);

  // ── Pre-fill poData ─────────────────────────────────────────────────────────
useEffect(() => {
  if (!poData) return;
  setForm((prev) => ({
    ...prev,
    voucher_no: poData.voucherNo || "",
    supplier_id: poData.partyId || "",
    account_name: poData.partyName || "",
  }));
  setItems(
    (poData.details || []).map((d) => {
      const cgst = d.cgst || 0;
      const sgst = d.sgst || 0;
      const igst = d.igst || 0;
      const cess = d.cess || 0;
      const price = d.price || "";
      const other = d.othercharge || 0;

      return {
        sotPoDetailId: d.id || 0,
        unitId: d.unitId || 0,
        rawMaterialId: d.rawMaterialId || 0,
        item_name: d.rawMaterialName || "",
        hsc_sac: d.hsccode || "",
        cgst,
        sgst,
        igst,
        cess,
        qty: d.qty || "",
        unit: d.unitName || "",
        originalPrice: price,
        price_per_unit: price,
        other_charges: other,
        total_price: calcTotal(d.qty, price, other, cgst, sgst, igst, cess),
        originalQty: d.qty || 0,
        isAddInStock:  d.isAddInStock ?? true,
      };
    }),
  );
}, [poData]);

useEffect(() => {
  fetchSupplier();
  GetStockTypeByUserId(JSON.parse(userId), "")
    .then((res) => {
      const data = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];
      const mainTypeFiltered = data.filter(
        (t) => (t.mainType ?? t.maintype) === 0,
      );
      setStockTypes(filterStockTypes(mainTypeFiltered)); // rights-filtered
    })
    .catch((err) => console.error("Failed to fetch stock types:", err));
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const fetchSupplier = async () => {
    try {
      const data = await OutsideContactName(3, userId);
      setSupplier(data?.data?.data["Party Details"] || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
  // Only auto-generate for a fresh purchase — not when editing or generating from a PO
  if (isEdit  || !userId) return;

  generateGrnNumber(userId)
    .then((res) => {
      const grn = res?.data?.grnNumber || "";
      if (grn) {
        setForm((p) => ({ ...p, grn_number: grn }));
      }
    })
    .catch((err) => console.error("Failed to generate GRN number:", err));
}, [isEdit, userId]);

 const handleSelectItem = useCallback(
  async (rawItem) => {
    const cgst = rawItem.cgst || 0;
    const sgst = rawItem.sgst || 0;
    const igst = rawItem.igst || 0;
    const cess = rawItem.cess || 0; 
    const rawMaterialId = rawItem.id || rawItem.rawMaterialId || 0;

    let price = rawItem.supplierRate || rawItem.price || "";

    // If a supplier is already selected, try to get party-specific price
    if (form.supplier_id && rawMaterialId) {
      try {
        const res = await getRawMaterialPriceforpurchase(
          form.supplier_id,
          rawMaterialId,
          userId,
        );
        const partyPrice = res?.data?.data?.price ?? res?.data?.price ?? null;
        if (partyPrice != null && partyPrice !== "") {
          price = partyPrice;
        }
      } catch (err) {
        console.error("Failed to fetch party-specific price:", err);
      }
    }

    const newRow = {
      rawMaterialId,
      item_name: rawItem.nameEnglish || "",
      hsc_sac: rawItem.hsc_sac || rawItem.hsn_sac || "",
      cgst,
      sgst,
      igst,
      cess,
      qty: "",
      unit: rawItem.unit?.nameEnglish || rawItem.unit || "",
      price_per_unit: price,
      originalPrice: price, // ✅ now set from getRawMaterialPriceforpurchase result too
      other_charges: 0,
      total_price: "0",
      unitId: rawItem.unitId || rawItem.unit?.id || 0,
      isAddInStock: true,
    };
    setItems((prev) => [newRow, ...prev]);
  },
  [form.supplier_id, userId],
);
  
  const updateItem = useCallback((index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        updated.total_price = calcTotal(
          updated.qty,
          updated.price_per_unit,
          updated.other_charges,
          updated.cgst,
          updated.sgst,
          updated.igst,
          updated.cess,
        );
        return updated;
      }),
    );
  }, []);

  const handleDeleteItem = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totalAmount = items.reduce(
    (s, i) => s + parseFloat(i.total_price || 0),
    0,
  );
  const discountAmount =
    discountType === "percent"
      ? (totalAmount * (parseFloat(discount) || 0)) / 100
      : parseFloat(discount) || 0;
  const finalAmount =
    totalAmount - discountAmount + (parseFloat(adjustment) || 0);

  // ── Save ────────────────────────────────────────────────────────────────────
 // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.supplier_id) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Please select a supplier.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    if (!form.date) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Please select a date.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (isBackDateLocked && form.date < todayStr) {
  Swal.fire({
    icon: "warning",
    title: "Validation",
    text: "Back-dated entries are not allowed.",
    confirmButtonColor: "#3085d6",
  });
  return;
}
   
    if (items.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Please add at least one item.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // ── Confirm master-price update only when the toggle is ON ──
    if (form.priceUpdateMaster) {
      const confirmResult = await Swal.fire({
        icon: "question",
        title: "Update Master Price?",
        text: "This will overwrite the price in Raw Material Master with the prices entered here. Are you sure you want to continue?",
        showCancelButton: true,
        confirmButtonText: "Yes, update it",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#16a34a",
        cancelButtonColor: "#94a3b8",
      });
      if (!confirmResult.isConfirmed) return;
    }

   try {
  setSaving(true);
  let res;
  if (isFromPO) {
    const payload = {
      userId: parseInt(userId),
      sotPoId: poData.id,
      billno: form.bill_no,
      podate: form.date ? form.date.split("-").reverse().join("/") : "",
      invoicetype: form.invoice_type,
      remarks: form.remark,
      subamount: totalAmount,
      grnNumber: form.grn_number,
      discountper:
        discountType === "percent" ? parseFloat(discount) || 0 : 0,
      discountval: discountAmount,
      adjustamount: parseFloat(adjustment) || 0,
      finalamount: finalAmount,
      stockTypeId: form.stock_type_id || 0,
      priceUpdateMaster: form.priceUpdateMaster,
      details: items.map((item) => ({
        sotPoDetailId: item.sotPoDetailId || 0,
        rawMaterialId: item.rawMaterialId || 0,
        unitId: item.unitId || 0,
        hsccode: item.hsc_sac || "",
        cgst: parseFloat(item.cgst) || 0,
        sgst: parseFloat(item.sgst) || 0,
        igst: parseFloat(item.igst) || 0,
        cess: parseFloat(item.cess) || 0,
        qty: parseFloat(item.qty) || 0,
        price: parseFloat(item.price_per_unit) || 0,
        oldPrice: parseFloat(item.originalPrice) || 0,
        othercharge: parseFloat(item.other_charges) || 0,
        total: parseFloat(item.total_price) || 0,
        isAddInStock: item.isAddInStock ?? true,
      })),
    };
    res = await AddGenerateInvoice(payload);
  } else {
    const payload = {
      id: isEdit ? editData.id : 0,
      userId: parseInt(userId),
      voucher: form.voucher_no,
      podate: form.date ? form.date.split("-").reverse().join("/") : "",
      billno: form.bill_no,
      grnNumber: form.grn_number,
      supplierId: form.supplier_id,
      invoicetype: form.invoice_type,
      remarks: form.remark,
      subamount: totalAmount,
      discountper: parseFloat(discount) || 0,
      discountval: discountAmount,
      adjustamount: parseFloat(adjustment) || 0,
      finalamount: finalAmount,
      stockTypeId: form.stock_type_id || 0,
      priceUpdateMaster: form.priceUpdateMaster,
      details: items.map((item) => ({
        rawMaterialId: item.rawMaterialId || 0,
        unitId: item.unitId || 0,
        hsccode: item.hsc_sac || "",
        cgst: parseFloat(item.cgst) || 0,
        sgst: parseFloat(item.sgst) || 0,
        igst: parseFloat(item.igst) || 0,
        cess: parseFloat(item.cess) || 0,
        qty: parseFloat(item.qty) || 0,
        price: parseFloat(item.price_per_unit) || 0,
        oldPrice: parseFloat(item.originalPrice) || 0,
        othercharge: parseFloat(item.other_charges) || 0,
        total: parseFloat(item.total_price) || 0,
        isAddInStock: item.isAddInStock ?? true,
      })),
    };
    res = await AddPuchase(payload);
  }


  const isSuccess = res?.data?.success ?? true; 
  if (!isSuccess) {
    await sendLog("SAVE_ERROR", items);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: res?.data?.msg || "Failed to save. Please try again.",
      confirmButtonColor: "#d33",
    });
    return; 
  }

  await sendLog("SAVE_SUCCESS", items);
  await Swal.fire({
    icon: "success",
    title: "Success!",
    text: isFromPO
      ? "Invoice generated successfully."
      : isEdit
        ? "Purchase updated."
        : "Purchase saved.",
    confirmButtonColor: "#16a34a",
  });
  navigate("/stock-management/purchase");
} catch (error) {
  console.error("Save failed:", error);
  await sendLog("SAVE_ERROR", items);
  Swal.fire({
    icon: "error",
    title: "Error",
    text: error?.response?.data?.msg || "Failed to save. Please try again.",
    confirmButtonColor: "#d33",
  });
} finally {
  setSaving(false);
}
  };

  const fieldClass =
    "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";
  const labelClass =
    "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen p-6 font-sans">
      <div className="mx-auto space-y-5">
        {/* ── Purchase Information Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-700">
                <FileText size={17} className="text-white" />
              </div>
              <h2 className="text-green-900 font-bold text-base tracking-tight">
                {pageTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAccountModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
              >
                <User size={16} />{" "}
                <FormattedMessage
                  id="COMMON.ADD_ACCOUNT"
                  defaultMessage="Add Account"
                />
              </button>
              <button
                onClick={() => setIsAddItemModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 shadow-sm bg-primary"
              >
                <Plus size={16} />{" "}
                <FormattedMessage
                  id="RAW_MATERIAL.ADD"
                  defaultMessage="New Raw Material"
                />
              </button>
              <button
                onClick={() => navigate("/stock-management/purchase")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors shadow-sm"
              >
                <ArrowLeft size={16} /> Back
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-3 gap-x-6 gap-y-4">
            {isEdit && (
              <div>
                <label className={labelClass}>
                  <Hash size={16} /> Voucher No.
                </label>
                <input
                  name="voucher_no"
                  disabled
                  value={form.voucher_no}
                  className={fieldClass}
                />
              </div>
            )}
            <div>
              <label className={labelClass}>
                <Calendar size={16} />{" "}
                <FormattedMessage id="COMMON.DATE" defaultMessage="Date" />{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                name="date"
                type="date"
                value={form.date}
                min={isBackDateLocked ? todayStr : undefined}
                onChange={(e) =>
                  setForm((p) => ({ ...p, date: e.target.value }))
                }
                className={fieldClass}
              />
            </div>
          <div>
  <label className={labelClass}>
    <Receipt size={16} />{" "}
    <FormattedMessage
      id="PURCHASE.GRN_NO"
      defaultMessage="GRN Number"
    />{" "}
  </label>
  <input
    name="grn_number"
    value={form.grn_number}
    onChange={(e) =>
      setForm((p) => ({ ...p, grn_number: e.target.value }))
    }
    placeholder="Auto-generated…"
    className={fieldClass}
  />
</div>
            <div>
              <label className={labelClass}>
                <Receipt size={16} />{" "}
                <FormattedMessage
                  id="PURCHASE.BILL_NO"
                  defaultMessage="Bill No."
                />{" "}
              </label>
              <input
                name="bill_no"
                value={form.bill_no}
                onChange={(e) =>
                  setForm((p) => ({ ...p, bill_no: e.target.value }))
                }
                placeholder="Enter bill number"
                className={fieldClass}
              />
            </div>
   

            <div className="col-span-2">
              <label className={labelClass}>
                <User size={16} />{" "}
                <FormattedMessage
                  id="PURCHASE.ACCOUNT_NAME"
                  defaultMessage="Account Name (Supplier)"
                />
              </label>
             <Select
  showSearch
  allowClear
  placeholder="Search supplier…"
  style={{ width: "100%", height: "38px" }}
  value={form.supplier_id || undefined}
  onChange={async (val, option) => {
    setForm((p) => ({
      ...p,
      supplier_id: val,
      account_name: option?.label || "",
    }));

    if (!val || items.length === 0) return;

    const updatedItems = await Promise.all(
      items.map(async (item) => {
        if (!item.rawMaterialId) return item;
        try {
          const res = await getRawMaterialPrice(val, item.rawMaterialId, userId);
          const partyPrice = res?.data?.data?.price ?? res?.data?.price ?? null;
          if (partyPrice != null && partyPrice !== "") {
            return {
              ...item,
              price_per_unit: partyPrice,
               originalPrice: partyPrice,
              total_price: calcTotal(
                item.qty,
                partyPrice,
                item.other_charges,
                item.cgst,
                item.sgst,
                item.igst,
              ),
            };
          }
        } catch (err) {
          console.error("Failed to fetch price for item on supplier change:", err);
        }
        return item;
      }),
    );

    setItems(updatedItems);
  }}
  filterOption={(input, option) =>
    option?.label?.toLowerCase().includes(input.toLowerCase())
  }
  options={supplier.map((s) => ({
    value: s.id,
    label: s.nameEnglish,
  }))}
/>  
            </div>
            <div>
              <label className={labelClass}>
                <Tag size={16} />{" "}
                <FormattedMessage
                  id="PURCHASE.INVOICE_TYPE"
                  defaultMessage="Invoice Type"
                />
              </label>
              <select
                name="invoice_type"
                value={form.invoice_type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, invoice_type: e.target.value }))
                }
                className={fieldClass}
              >
                <option>Tax Invoice</option>
                <option>Retail Invoice</option>
              </select>
            </div>
       <div className="col-span-2">
  <label className={labelClass}>
    <Tag size={16} /> Stock Type
  </label>
 <Select
  showSearch
  allowClear
  placeholder="Select stock type..."
  style={{ width: "100%", height: "38px" }}
  value={form.stock_type_id || undefined}
  onChange={(value) => setForm((p) => ({ ...p, stock_type_id: value }))}
  filterOption={(input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
  }
  options={stockTypes.map((t) => ({
    label: t.nameEnglish,
    value: t.stocktypeid ?? t.stockTypeId ?? t.id,
  }))}
/>
</div>
   <div>
  <label className={labelClass}>
     Update Master Price
  </label>
  <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 h-[38px]">
    <span className="text-xs text-slate-500 leading-snug">
      Reflects updated price in Raw Material Master
    </span>
    <Switch
      size="small"

      className="text-primary"
      checked={form.priceUpdateMaster}
      onChange={(checked) =>
        setForm((p) => ({ ...p, priceUpdateMaster: checked }))
      }
    />
  </div>
</div>
            <div className="col-span-3">
              <label className={labelClass}>
                <AlignLeft size={16} />{" "}
                <FormattedMessage id="COMMON.REMARK" defaultMessage="Remark" />
              </label>
              <input
                name="remark"
                value={form.remark}
                onChange={(e) =>
                  setForm((p) => ({ ...p, remark: e.target.value }))
                }
                placeholder="Optional remark…"
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        {/* ── Purchase Details Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary">
                <ShoppingCart size={17} className="text-white" />
              </div>
              <h2 className="text-primary font-bold text-base tracking-tight">
                <FormattedMessage
                  id="PURCHASE.DETAILS"
                  defaultMessage="Purchase Details"
                />
              </h2>
              {items.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 shadow-sm disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #16a34a, #15803d)",
              }}
            >
              <Save size={15} />
              {saving
                ? "Saving…"
                : isEdit
                  ? "Update"
                  : isFromPO
                    ? "Generate Invoice"
                    : "Save"}
            </button>
          </div>

          {/* ── Search Bar ── */}
          <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3">
            <div className="relative w-full max-w-md">
              <div className="relative">
                <Select
                  showSearch
                  placeholder={intl.formatMessage({
                    id: "PURCHASE.SEARCH_ITEM",
                    defaultMessage: "Search & add item...",
                  })}
                  value={undefined}
                  filterOption={false}
                  onSearch={handleSearch}
                  onDropdownVisibleChange={(open) => {
                    if (open && menuItems.length === 0)
                      FetchSearchDropdown("", 1, false);
                  }}
                  onSelect={(value, option) => {
                    handleSelectItem(option.raw);
                    setSearchQuery("");
                  }}
                  notFoundContent={
                    loadingItems
                      ? "Loading..."
                      : searchQuery
                        ? "No items found"
                        : "Start typing or select item"
                  }
                  style={{ width: "100%", maxWidth: "400px" }}
                  options={menuItems.map((item) => ({
                    value: item.id,
                    label: (
                      <div className="flex justify-between">
                        <span>{item.nameEnglish}</span>
                        {item.supplierRate > 0 && (
                          <span className="text-xs text-gray-400">
                            ₹{item.supplierRate}
                          </span>
                        )}
                      </div>
                    ),
                    raw: item,
                  }))}
                  onPopupScroll={(e) => {
                    const target = e.target;
                    if (
                      target.scrollTop + target.offsetHeight >=
                        target.scrollHeight - 10 &&
                      hasMore &&
                      !loadingMore
                    ) {
                      FetchSearchDropdown(searchQuery, dropdownPage + 1, true);
                    }
                  }}
                />
                {loadingItems && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                 {[
  <FormattedMessage id="COMMON.SR_NO" defaultMessage="#" />,
  <FormattedMessage id="PURCHASE.ADD_TO_STOCK" defaultMessage="Add to Stock" />,
  <FormattedMessage id="PURCHASE.ITEM_NAME" defaultMessage="Item Name" />,
  "HSC/SAC",
  "CGST%",
  "SGST%",
  "IGST%",
  "CESS%",
  <FormattedMessage id="COMMON.QTY" defaultMessage="Qty" />,
  <FormattedMessage id="COMMON.UNIT" defaultMessage="Unit" />,
  <FormattedMessage id="PURCHASE.PRICE_PER_UNIT" defaultMessage="Price/Unit" />,
  <FormattedMessage id="PURCHASE.OTHER_CHARGES" defaultMessage="Other ₹" />,
  <FormattedMessage id="PURCHASE.GST_AMOUNT" defaultMessage="GST Amt" />,
  <FormattedMessage id="COMMON.TOTAL" defaultMessage="Total" />,
  
  "",
].map((h) => (
  <th key={h} className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
    {h}
  </th>
))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                     colSpan={14}
                      className="px-4 py-14 text-center text-slate-400 text-sm"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Package size={36} className="text-slate-200" />
                        <p className="font-medium text-slate-400">
                          No items added yet
                        </p>
                        <p className="text-xs text-slate-300">
                          Use the search bar above to add items
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => {
                    // ── Per-row GST breakdown for display ──
                    const base =
                      (parseFloat(item.qty) || 0) *
                      (parseFloat(item.price_per_unit) || 0);
                    const gstRate =
                      (parseFloat(item.cgst) || 0) +
                      (parseFloat(item.sgst) || 0) +
                      (parseFloat(item.igst) || 0) +
                       (parseFloat(item.cess) || 0);
                    const gstAmt = (base * gstRate) / 100;

                    return (
                      <tr
                        key={i}
                        className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors group"
                      >
                        {/* # */}
                        <td className="px-3 py-2 text-xs text-slate-400 font-medium w-8">
                          {i + 1}
                        </td>
                       
  <td className="px-3 py-2 w-16 text-center">
    <input
      type="checkbox"
      checked={item.isAddInStock ?? true}
      onChange={(e) => updateItem(i, "isAddInStock", e.target.checked)}
      className="w-4 h-4 accent-blue-600 cursor-pointer"
    />
  </td>

                        {/* Item Name */}
            {/* Item Name */}
<td className="px-3 py-2 min-w-[160px]">
  <span className="font-semibold text-slate-800 text-sm">
    {item.item_name}
  </span>
</td>




{/* HSC/SAC */}
<td className="px-1 py-2 w-24">
  <EditableCell
    value={item.hsc_sac}
    onChange={(v) => updateItem(i, "hsc_sac", v)}
    type="text"
    placeholder="—"
    className="text-left"
  />
</td>

                        {/* CGST */}
                        <td className="px-1 py-2 w-16">
                          <EditableCell
                            value={item.cgst}
                            onChange={(v) => updateItem(i, "cgst", v)}
                          />
                        </td>

                        {/* SGST */}
                        <td className="px-1 py-2 w-16">
                          <EditableCell
                            value={item.sgst}
                            onChange={(v) => updateItem(i, "sgst", v)}
                          />
                        </td>

                        {/* IGST */}
                        <td className="px-1 py-2 w-16">
                          <EditableCell
                            value={item.igst}
                            onChange={(v) => updateItem(i, "igst", v)}
                          />
                          {/* cess */}
                        </td>
<td className="px-1 py-2 w-16">
  <EditableCell
    value={item.cess}
    onChange={(v) => updateItem(i, "cess", v)}
  />
</td>
                        {/* Qty */}
                        <td className="px-1 py-2 w-20">
                          <input
                            type="tel"
                            value={item.qty}
                            onChange={(e) =>
                              updateItem(i, "qty", e.target.value)
                            }
                            placeholder="0"
                            className={`w-full px-2 py-1.5 text-sm border rounded-lg text-center transition-all focus:outline-none focus:ring-1
                            ${
                              !item.qty
                                ? "border-amber-300 bg-amber-50 text-amber-700 placeholder-amber-400 focus:border-amber-400 focus:ring-amber-300"
                                : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-blue-300"
                            }`}
                          />
                        </td>

                        {/* Unit */}
                        <td className="px-3 py-2 w-20">
                          <span className="text-xs text-slate-500 font-medium">
                            {item.unit || "—"}
                          </span>
                        </td>

                        {/* Price/Unit */}
                        <td className="px-1 py-2 w-28">
                          <input
                            type="tel"
                            value={item.price_per_unit}
                            onChange={(e) =>
                              updateItem(i, "price_per_unit", e.target.value)
                            }
                            placeholder="0.00"
                            className={`w-full px-2 py-1.5 text-sm border rounded-lg text-center transition-all focus:outline-none focus:ring-1
                            ${
                              !item.price_per_unit
                                ? "border-amber-300 bg-amber-50 text-amber-700 placeholder-amber-400 focus:border-amber-400 focus:ring-amber-300"
                                : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-blue-300"
                            }`}
                          />
                        </td>

                        {/* Other Charges */}
                        <td className="px-1 py-2 w-24">
                          <EditableCell
                            value={item.other_charges}
                            onChange={(v) => updateItem(i, "other_charges", v)}
                            placeholder="0"
                          />
                        </td>

                        {/* GST Amount — read-only, info display */}
                        <td className="px-3 py-2 w-24">
                          <span
                            className={`text-xs font-semibold ${gstAmt > 0 ? "text-orange-500" : "text-slate-300"}`}
                          >
                            {gstAmt > 0 ? `₹ ${gstAmt.toFixed(2)}` : "—"}
                          </span>
                        </td>

                        {/* Total (includes GST) */}
                        <td className="px-3 py-2 w-28">
                          <span
                            className={`text-sm font-bold ${parseFloat(item.total_price) > 0 ? "text-blue-700" : "text-slate-300"}`}
                          >
                            ₹ {parseFloat(item.total_price || 0).toFixed(2)}
                          </span>
                        </td>

                        {/* Delete */}
                        <td className="px-3 py-2 w-10">
                          <button
                            onClick={() => handleDeleteItem(i)}
                            className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 size={13} className="text-red-500" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* ── Table Footer — GST summary row ── */}
              {items.length > 0 &&
                (() => {
                  const totalBase = items.reduce(
                    (s, item) =>
                      s +
                      (parseFloat(item.qty) || 0) *
                        (parseFloat(item.price_per_unit) || 0),
                    0,
                  );
                  const totalGst = items.reduce((s, item) => {
                    const base =
                      (parseFloat(item.qty) || 0) *
                      (parseFloat(item.price_per_unit) || 0);
                    const gstRate =
                      (parseFloat(item.cgst) || 0) +
                      (parseFloat(item.sgst) || 0) +
                      (parseFloat(item.igst) || 0) +
                      (parseFloat(item.cess) || 0);
                    return s + (base * gstRate) / 100;
                  }, 0);
                  const totalOther = items.reduce(
                    (s, item) => s + (parseFloat(item.other_charges) || 0),
                    0,
                  );

                  return (
                    <tfoot>
  <tr className="bg-slate-50/80 border-t border-slate-200">
    <td
      colSpan={10}
      className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
    >
      Totals
    </td>
    <td className="px-3 py-2 text-xs font-bold text-slate-700 text-center">
      ₹ {totalOther.toFixed(2)}
    </td>
    <td className="px-3 py-2 text-xs font-bold text-orange-500 text-left">
      ₹ {totalGst.toFixed(2)}
    </td>
    <td className="px-3 py-2 text-sm font-bold text-blue-700">
      ₹ {totalAmount.toFixed(2)}
    </td>
    <td />
    <td />
  </tr>
</tfoot>
                  );
                })()}
            </table>
          </div>

          {/* ── Summary Footer ── */}
          {items.length > 0 && (
            <div className="border-t border-slate-100 bg-slate-50/50">
              <div className="flex justify-end">
                <div className="w-80 divide-y divide-slate-100">
                  <div className="flex items-center justify-between px-6 py-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <FormattedMessage
                        id="COMMON.SUBTOTAL"
                        defaultMessage="Sub Total"
                      />
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      ₹ {totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 justify-between px-6 py-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                      <FormattedMessage
                        id="COMMON.DISCOUNT"
                        defaultMessage="Discount"
                      />
                    </span>
                    <div className="flex items-center w-full gap-2">
                      <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-semibold">
                        <button
                          onClick={() => {
                            setDiscountType("percent");
                            setDiscount(0);
                          }}
                          className={`px-2 py-1 transition-colors ${discountType === "percent" ? "bg-blue-500 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                        >
                          %
                        </button>
                        <button
                          onClick={() => {
                            setDiscountType("amount");
                            setDiscount(0);
                          }}
                          className={`px-2 py-1 transition-colors ${discountType === "amount" ? "bg-blue-500 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                        >
                          ₹
                        </button>
                      </div>
                      <input
                        type="tel"
                        value={discount}
                        onChange={(e) => setDiscount(e.target.value)}
                        className="w-24 px-2 py-1 text-xs text-start rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <span className="text-sm font-semibold text-red-500">
                        - ₹ {discountAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between px-6 py-3">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <FormattedMessage
                        id="COMMON.ADJUSTMENT"
                        defaultMessage="Adjustment"
                      />
                    </span>
                    <input
                      type="tel"
                      value={adjustment}
                      onChange={(e) => setAdjustment(e.target.value)}
                      className="w-24 px-2 py-1 text-xs text-right rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  <div
                    className="flex items-center justify-between px-6 py-4 rounded-b-2xl"
                    style={{
                      background:
                        "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
                    }}
                  >
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      <FormattedMessage
                        id="COMMON.FINAL_AMOUNT"
                        defaultMessage="Final Amount"
                      />
                    </span>
                    <span className="text-lg font-black text-white">
                      ₹ {finalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddContactName
        isModalOpen={isAccountModalOpen}
        setIsModalOpen={setIsAccountModalOpen}
        contactTypeId={3}
        onClose={() => setIsAccountModalOpen(false)}
        refreshData={fetchSupplier}
        concatId={3}
      />
      <AddRawMaterial
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        setIsModalOpen={setIsAddItemModalOpen}
        refreshData={(newItem) => newItem && handleSelectItem(newItem)}
      />
    </div>
  );
};

export default AddPurchase;

// import { useState, useEffect, useRef, useCallback } from "react";
// import {
//   ArrowLeft, Plus, Save, X, Package, FileText, Hash,
//   Calendar, User, Receipt, Tag, AlignLeft, Trash2,
//   ShoppingCart, Percent, DollarSign, BarChart2, Search,
// } from "lucide-react";
// import { Select } from "antd";
// import { useLocation, useNavigate } from "react-router";
// import {
//   GetAllRawMaterial,
//   OutsideContactName,
//   AddPuchase,
//   AddGenerateInvoice,
//   SearchRawMaterial,
// } from "../../../services/apiServices";
// import AddContactName from "../../master/MenuItemMaster/components/AddContactName";
// import Swal from "sweetalert2";
// import AddRawMaterial from "../../../partials/modals/add-raw-material/AddRawMaterial";

// const EditableCell = ({ value, onChange, type = "number", className = "", placeholder = "0" }) => (
//   <input
//     type={type}
//     value={value}
//     onChange={e => onChange(e.target.value)}
//     placeholder={placeholder}
//     className={`w-full px-2 py-1.5 text-sm border border-transparent rounded-lg bg-transparent
//       hover:border-slate-200 hover:bg-slate-50
//       focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-300
//       transition-all text-center ${className}`}
//   />
// );

// const AddPurchase = () => {
//   const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
//   const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
//   const [supplier, setSupplier] = useState([]);
//   const [items, setItems] = useState([]);
//   const [searchQuery, setSearchQuery]               = useState("");
// const [menuItems, setMenuItems]                   = useState([]);
// const [loadingItems, setLoadingItems]             = useState(false);
// const [dropdownPage, setDropdownPage]             = useState(1);
// const [hasMore, setHasMore]                       = useState(false);
// const [loadingMore, setLoadingMore]               = useState(false);

// const DROPDOWN_PAGE_SIZE = 100;

// const [discountType, setDiscountType] = useState("percent"); // "percent" | "amount"

// const debounceRef = useRef(null);

// const handleSearch = (value) => {
//   clearTimeout(debounceRef.current);
//   debounceRef.current = setTimeout(() => {
//     setSearchQuery(value);
//     FetchSearchDropdown(value, 1, false);
//   }, 400);
// };

//   const [form, setForm] = useState({
//     voucher_no: "", date: "", bill_no: "",
//     supplier_id: "", account_name: "",
//     invoice_type: "Tax Invoice", remark: "",
//   });

//   const navigate = useNavigate();
//   const [discount, setDiscount] = useState(0);
//   const [adjustment, setAdjustment] = useState(0);
//   const [saving, setSaving] = useState(false);
//   const userId = localStorage.getItem("userId");

//   const location = useLocation();
//   const editData = location.state?.editData || null;
//   const poData   = location.state?.poData   || null;
//   const isEdit   = !!editData;
//   const isFromPO = !!poData;
//   const pageTitle = isEdit ? "Edit Purchase" : isFromPO ? "Generate Purchase Invoice" : "Add Purchase";

//   // ── Fetch raw materials ────────────────────────────────────────────────────
//  const FetchSearchDropdown = (searchTerm = "", page = 1, append = false) => {
//   page === 1 ? setLoadingItems(true) : setLoadingMore(true);

//   SearchRawMaterial(userId, page, DROPDOWN_PAGE_SIZE, searchTerm)
//     .then((res) => {
//       const data  = res?.data?.data || {};
//       const items = data["Raw Material Details"] || [];
//       const total = data.totalItems || 0;

//       setMenuItems(prev => append ? [...prev, ...items] : items);
//       setDropdownPage(page);
//       setHasMore(page * DROPDOWN_PAGE_SIZE < total);
//     })
//     .catch(() => {
//       setMenuItems([]);
//       setHasMore(false);
//     })
//     .finally(() => {
//       setLoadingItems(false);
//       setLoadingMore(false);
//     });
// };

// useEffect(() => {
//   const timer = setTimeout(() => {
//     if (searchQuery.trim()) {
//       setDropdownPage(1); setMenuItems([]); setHasMore(false);
//       FetchSearchDropdown(searchQuery, 1, false);
//     } else {
//       setMenuItems([]);
//        setHasMore(false);
//     }
//   }, 500);
//   return () => clearTimeout(timer);
// }, [searchQuery]);

//   useEffect(() => {
//     if (!editData) return;
//     setForm({
//       voucher_no:   editData.voucher      || "",
//       date:         editData.podate ? editData.podate.split("/").reverse().join("-") : "",
//       bill_no:      editData.billno       || "",
//       supplier_id:  editData.supplierId   || "",
//       account_name: editData.supplierName || "",
//       invoice_type: editData.invoicetype  || "Tax Invoice",
//       remark:       editData.remarks      || "",
//     });
//     setDiscount(editData.discountper   || 0);
//     setItems((editData.details || []).map(d => {
//   const unitOptions = [
//     {
//       value: d.unitId,
//       label: d.unitName,
//     },
//   ];

//   return {
//     rawMaterialId: d.rawMaterialId || 0,
//     item_name: d.rawMaterialName || "",
//     hsc_sac: d.hsccode || "",
//     cgst: d.cgst || 0,
//     sgst: d.sgst || 0,
//     igst: d.igst || 0,
//     qty: d.qty || "",
//     unit: d.unitName || "",
//     unitId: d.unitId || 0,
//     unitOptions,
//     price_per_unit: d.price || "",
//     other_charges: d.othercharge || 0,
//     total_price: String(d.total || 0),
//   };
// }));
//   }, [editData]);

//   // ── Pre-fill poData ────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!poData) return;
//     setForm(prev => ({
//       ...prev,
//       voucher_no:   poData.voucherNo  || "",
//       supplier_id:  poData.partyId    || "",
//       account_name: poData.partyName  || "",
//     }));
//     setItems((poData.details || []).map(d => ({
//       sotPoDetailId:  d.id            || 0,
//       unitId:         d.unitId        || 0,
//       rawMaterialId:  d.rawMaterialId || 0,
//       item_name:      d.rawMaterialName || "",
//       hsc_sac:        "",
//       cgst:           0, sgst: 0, igst: 0,
//       qty:            d.qty      || "",
//       unit:           d.unitName || "",
//       price_per_unit: "",
//       other_charges:  0,
//       total_price:    "0",
//       originalQty:    d.qty || 0,
//     })));
//   }, [poData]);

//   useEffect(() => { fetchSupplier(); }, []);

//   const fetchSupplier = async () => {
//     try {
//       const data = await OutsideContactName(3, userId);
//       setSupplier(data?.data?.data["Party Details"] || []);
//     } catch (error) { console.log(error); }
//   };

//  const buildUnitOptions = (unitHierarchy) => {
//   if (!unitHierarchy) return [];

//   const parent = {
//     value: unitHierarchy.unitId,
//     label: unitHierarchy.nameEnglish,
//   };

//   const children = (unitHierarchy.children || []).map((child) => ({
//     value: child.unitId,
//     label: `${child.nameEnglish}`,
//   }));

//   return [parent, ...children];
// };

//  const handleSelectItem = useCallback((rawItem) => {
//   const unitOptions = buildUnitOptions(rawItem.unitHierarchy);

//   const newRow = {
//     rawMaterialId: rawItem.id || 0,
//     item_name: rawItem.nameEnglish || "",
//     hsc_sac: rawItem.hsc_sac || "",
//     cgst: rawItem.cgst || 0,
//     sgst: rawItem.sgst || 0,
//     igst: rawItem.igst || 0,
//     qty: "",
//     unit: rawItem.unit?.nameEnglish || "",
//     unitId: rawItem.unitHierarchy?.unitId || 0,
//     unitOptions,
//     price_per_unit: rawItem.supplierRate || "",
//     other_charges: 0,
//     total_price: "0",
//   };

//   setItems((prev) => [...prev, newRow]);
// }, []);

//   const updateItem = useCallback((index, field, value) => {
//     setItems(prev => prev.map((item, i) => {
//       if (i !== index) return item;
//       const updated = { ...item, [field]: value };
//       // recalc total
//       const qty   = parseFloat(field === "qty"            ? value : updated.qty)            || 0;
//       const price = parseFloat(field === "price_per_unit" ? value : updated.price_per_unit) || 0;
//       const other = parseFloat(field === "other_charges"  ? value : updated.other_charges)  || 0;
//       updated.total_price = (qty * price + other).toFixed(2);
//       return updated;
//     }));
//   }, []);

//   const handleDeleteItem = useCallback((index) => {
//     setItems(prev => prev.filter((_, i) => i !== index));
//   }, []);

//   // ── Totals ─────────────────────────────────────────────────────────────────
//   const totalAmount    = items.reduce((s, i) => s + parseFloat(i.total_price || 0), 0);
// const discountAmount =
//   discountType === "percent"
//     ? (totalAmount * (parseFloat(discount) || 0)) / 100
//     : parseFloat(discount) || 0;  const finalAmount    = totalAmount - discountAmount + (parseFloat(adjustment) || 0);

//   // ── Save ───────────────────────────────────────────────────────────────────
//   const handleSave = async () => {
//     if (!form.supplier_id) {
//       Swal.fire({ icon: "warning", title: "Validation", text: "Please select a supplier.", confirmButtonColor: "#3085d6" });
//       return;
//     }
//     if (!form.date) {
//     Swal.fire({ icon: "warning", title: "Validation", text: "Please select a date.", confirmButtonColor: "#3085d6" });
//     return;
//   }
//   if (!form.bill_no?.trim()) {
//     Swal.fire({ icon: "warning", title: "Validation", text: "Please enter a bill number.", confirmButtonColor: "#3085d6" });
//     return;
//   }
//     if (items.length === 0) {
//       Swal.fire({ icon: "warning", title: "Validation", text: "Please add at least one item.", confirmButtonColor: "#3085d6" });
//       return;
//     }
//     try {
//       setSaving(true);
//       if (isFromPO) {
//         const payload = {
//           userId:       parseInt(userId),
//           sotPoId:      poData.id,
//           billno:       form.bill_no,
//           podate:       form.date ? form.date.split("-").reverse().join("/") : "",
//           invoicetype:  form.invoice_type,
//           remarks:      form.remark,
//           subamount:    totalAmount,
//           discountper:  discountType === "percent" ? parseFloat(discount) || 0 : 0,
// discountval:  discountAmount,
//           adjustamount: parseFloat(adjustment) || 0,
//           finalamount:  finalAmount,
//           details: items.map(item => ({
//             sotPoDetailId:  item.sotPoDetailId  || 0,
//             rawMaterialId:  item.rawMaterialId  || 0,
//             unitId:         item.unitId         || 0,
//             hsccode:        item.hsc_sac        || "",
//             cgst:           parseFloat(item.cgst)           || 0,
//             sgst:           parseFloat(item.sgst)           || 0,
//             igst:           parseFloat(item.igst)           || 0,
//             qty:            parseFloat(item.qty)            || 0,
//             price:          parseFloat(item.price_per_unit) || 0,
//             othercharge:    parseFloat(item.other_charges)  || 0,
//             total:          parseFloat(item.total_price)    || 0,
//           })),
//         };
//         await AddGenerateInvoice(payload);
//       } else {
//         const payload = {
//           id:           isEdit ? editData.id : 0,
//           userId:       parseInt(userId),
//           voucher:      form.voucher_no,
//           podate:       form.date ? form.date.split("-").reverse().join("/") : "",
//           billno:       form.bill_no,
//           supplierId:   form.supplier_id,
//           invoicetype:  form.invoice_type,
//           remarks:      form.remark,
//           subamount:    totalAmount,
//           discountper:  parseFloat(discount)   || 0,
//           discountval:  discountAmount,
//           adjustamount: parseFloat(adjustment) || 0,
//           finalamount:  finalAmount,
//           details: items.map(item => ({
//             rawMaterialId:  item.rawMaterialId  || 0,
//             hsccode:        item.hsc_sac        || "",
//             unitId:         item.unitId         || 0,
//             cgst:           parseFloat(item.cgst)           || 0,
//             sgst:           parseFloat(item.sgst)           || 0,
//             igst:           parseFloat(item.igst)           || 0,
//             qty:            parseFloat(item.qty)            || 0,
//             price:          parseFloat(item.price_per_unit) || 0,
//             othercharge:    parseFloat(item.other_charges)  || 0,
//             total:          parseFloat(item.total_price)    || 0,
//           })),
//         };
//         await AddPuchase(payload);
//       }
//       await Swal.fire({
//         icon: "success", title: "Success!",
//         text: isFromPO ? "Invoice generated successfully." : isEdit ? "Purchase updated." : "Purchase saved.",
//         confirmButtonColor: "#16a34a",
//       });
//       navigate("/stock-management/purchase");
//     } catch (error) {
//       console.error("Save failed:", error);
//       Swal.fire({ icon: "error", title: "Error", text: "Failed to save. Please try again.", confirmButtonColor: "#d33" });
//     } finally {
//       setSaving(false);
//     }
//   };

//   const fieldClass = "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";
//   const labelClass = "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

//   return (
//     <div className="min-h-screen p-6 font-sans">
//       <div className="mx-auto space-y-5">

//         {/* ── Purchase Information Card ── */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
//           <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-700">
//                 <FileText size={17} className="text-white" />
//               </div>
//               <h2 className="text-green-900 font-bold text-base tracking-tight">{pageTitle}</h2>
//             </div>
//             <div className="flex items-center gap-2">
//               <button onClick={() => setIsAccountModalOpen(true)}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm">
//                 <User size={16} /> Add Account
//               </button>
//               <button onClick={() => setIsAddItemModalOpen(true)}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 shadow-sm bg-primary">
//                 <Plus size={16} /> New Raw Material
//               </button>
//               <button onClick={() => navigate("/stock-management/purchase")}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors shadow-sm">
//                 <ArrowLeft size={16} /> Back
//               </button>
//             </div>
//           </div>

//           <div className="p-6 grid grid-cols-3 gap-x-6 gap-y-4">
//             {isEdit && (
//               <div>
//                 <label className={labelClass}><Hash size={16} /> Voucher No.</label>
//                 <input name="voucher_no" disabled value={form.voucher_no} className={fieldClass} />
//               </div>
//             )}
//             <div>
//               <label className={labelClass}><Calendar size={16} /> Date <span className="text-red-500">*</span></label>
//               <input name="date" type="date" value={form.date}
//                 onChange={e => setForm(p => ({ ...p, date: e.target.value }))} className={fieldClass} />
//             </div>
//             <div>
//              <label className={labelClass}><Receipt size={16} /> Bill No. <span className="text-red-500">*</span></label>
//               <input name="bill_no" value={form.bill_no}
//                 onChange={e => setForm(p => ({ ...p, bill_no: e.target.value }))}
//                 placeholder="Enter bill number" className={fieldClass} />
//             </div>
//             <div className="col-span-2">
//               <label className={labelClass}><User size={16} /> Account Name (Supplier)</label>
//               <Select showSearch allowClear placeholder="Search supplier…"
//                 style={{ width: "100%", height: "38px" }}
//                 value={form.supplier_id || undefined}
//                 onChange={(val, option) => setForm(p => ({ ...p, supplier_id: val, account_name: option?.label || "" }))}
//                 filterOption={(input, option) => option?.label?.toLowerCase().includes(input.toLowerCase())}
//                 options={supplier.map(s => ({ value: s.id, label: s.nameEnglish }))}
//               />
//             </div>
//             <div>
//               <label className={labelClass}><Tag size={16} /> Invoice Type</label>
//               <select name="invoice_type" value={form.invoice_type}
//                 onChange={e => setForm(p => ({ ...p, invoice_type: e.target.value }))} className={fieldClass}>
//                 <option>Tax Invoice</option>
//                 <option>Retail Invoice</option>
//               </select>
//             </div>
//             <div className="col-span-3">
//               <label className={labelClass}><AlignLeft size={16} /> Remark</label>
//               <input name="remark" value={form.remark}
//                 onChange={e => setForm(p => ({ ...p, remark: e.target.value }))}
//                 placeholder="Optional remark…" className={fieldClass} />
//             </div>
//           </div>
//         </div>

//         {/* ── Purchase Details Card ── */}
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
//           {/* Card Header */}
//           <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
//             <div className="flex items-center gap-3">
//               <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary">
//                 <ShoppingCart size={17} className="text-white" />
//               </div>
//               <h2 className="text-primary font-bold text-base tracking-tight">Purchase Details</h2>
//               {items.length > 0 && (
//                 <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
//                   {items.length} item{items.length !== 1 ? "s" : ""}
//                 </span>
//               )}
//             </div>
//             <button onClick={handleSave} disabled={saving}
//               className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 shadow-sm disabled:opacity-60"
//               style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
//               <Save size={15} />
//               {saving ? "Saving…" : isEdit ? "Update" : isFromPO ? "Generate Invoice" : "Save"}
//             </button>
//           </div>

//           {/* ── Search Bar (inline add) ── */}
//           <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3">
//   <div  className="relative w-full max-w-md">
//     <div className="relative">

//       <Select
//           showSearch
//           placeholder="Search & add item..."
//           value={undefined}
//           filterOption={false}
//          onSearch={handleSearch}
//           onDropdownVisibleChange={(open) => {
//     if (open && menuItems.length === 0) {
//       FetchSearchDropdown("", 1, false); // 👈 load default items
//     }
//   }}
//           onSelect={(value, option) => {
//             handleSelectItem(option.raw);
//             setSearchQuery("");
//             setMenuItems([]);
//           }}
//           notFoundContent={
//   loadingItems
//     ? "Loading..."
//     : searchQuery
//     ? "No items found"
//     : "Start typing or select item"
// }
//           style={{ width: "100%", maxWidth: "400px" }}
//           options={menuItems.map(item => ({
//             value: item.id,
//             label: (
//               <div className="flex justify-between">
//                 <span>{item.nameEnglish}</span>
//                 {item.supplierRate > 0 && (
//                   <span className="text-xs text-gray-400">₹{item.supplierRate}</span>
//                 )}
//               </div>
//             ),
//             raw: item,
//           }))}

//           // ✅ Infinite scroll (REPLACES loaderRef logic)
//           onPopupScroll={(e) => {
//             const target = e.target;
//             if (
//               target.scrollTop + target.offsetHeight >= target.scrollHeight - 10 &&
//               hasMore &&
//               !loadingMore
//             ) {
//               FetchSearchDropdown(searchQuery, dropdownPage + 1, true);
//             }
//           }}
//         />
//       {loadingItems && (
//         <div className="absolute right-3 top-1/2 -translate-y-1/2">
//           <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
//         </div>
//       )}

//     </div>

//   </div>
// </div>

//           {/* ── Table ── */}
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="bg-slate-50 border-b border-slate-100">
//                   {["#", "Item Name", "HSC/SAC", "CGST%", "SGST%", "IGST%", "Qty *", "Unit", "Price/Unit *", "Other ₹", "Total", ""].map(h => (
//                     <th key={h} className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.length === 0 ? (
//                   <tr>
//                     <td colSpan={12} className="px-4 py-14 text-center text-slate-400 text-sm">
//                       <div className="flex flex-col items-center gap-2">
//                         <Package size={36} className="text-slate-200" />
//                         <p className="font-medium text-slate-400">No items added yet</p>
//                         <p className="text-xs text-slate-300">Use the search bar above to add items</p>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : items.map((item, i) => (
//                   <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors group">
//                     {/* # */}
//                     <td className="px-3 py-2 text-xs text-slate-400 font-medium w-8">{i + 1}</td>

//                     {/* Item Name — read-only */}
//                     <td className="px-3 py-2 min-w-[160px]">
//                       <span className="font-semibold text-slate-800 text-sm">{item.item_name}</span>
//                     </td>

//                     {/* HSC/SAC — editable */}
//                     <td className="px-1 py-2 w-24">
//                       <EditableCell
//                         value={item.hsc_sac}
//                         onChange={v => updateItem(i, "hsc_sac", v)}
//                         type="text"
//                         placeholder="—"
//                         className="text-left"
//                       />
//                     </td>

//                     {/* CGST */}
//                     <td className="px-1 py-2 w-16">
//                       <EditableCell value={item.cgst} onChange={v => updateItem(i, "cgst", v)} />
//                     </td>

//                     {/* SGST */}
//                     <td className="px-1 py-2 w-16">
//                       <EditableCell value={item.sgst} onChange={v => updateItem(i, "sgst", v)} />
//                     </td>

//                     {/* IGST */}
//                     <td className="px-1 py-2 w-16">
//                       <EditableCell value={item.igst} onChange={v => updateItem(i, "igst", v)} />
//                     </td>

//                     {/* Qty — editable, highlighted if empty */}
//                     <td className="px-1 py-2 w-20">
//                       <input
//                         type="tel"
//                         value={item.qty}
//                         onChange={e => updateItem(i, "qty", e.target.value)}
//                         placeholder="0"
//                         className={`w-full px-2 py-1.5 text-sm border rounded-lg text-center transition-all focus:outline-none focus:ring-1
//                           ${!item.qty
//                             ? "border-amber-300 bg-amber-50 text-amber-700 placeholder-amber-400 focus:border-amber-400 focus:ring-amber-300"
//                             : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-blue-300"
//                           }`}
//                       />
//                     </td>

//                     {/* Unit — read-only */}
//                     <td className="px-1 py-2 w-32">
//                       <Select
//   labelInValue
//   value={
//     item.unitId
//       ? { value: item.unitId, label: item.unit }
//       : undefined
//   }
//   onChange={(val) => {
//     updateItem(i, "unitId", val.value);
//     updateItem(i, "unit", val.label);
//   }}
//   options={item.unitOptions || []}
//   style={{ width: "100%" }}
//   size="medium"
// />
//                     </td>

//                     {/* Price/Unit — editable, highlighted if empty */}
//                     <td className="px-1 py-2 w-28">
//                       <input
//                         type="tel"
//                         value={item.price_per_unit}
//                         onChange={e => updateItem(i, "price_per_unit", e.target.value)}
//                         placeholder="0.00"
//                         className={`w-full px-2 py-1.5 text-sm border rounded-lg text-center transition-all focus:outline-none focus:ring-1
//                           ${!item.price_per_unit
//                             ? "border-amber-300 bg-amber-50 text-amber-700 placeholder-amber-400 focus:border-amber-400 focus:ring-amber-300"
//                             : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-blue-300"
//                           }`}
//                       />
//                     </td>

//                     {/* Other Charges */}
//                     <td className="px-1 py-2 w-24">
//                       <EditableCell value={item.other_charges} onChange={v => updateItem(i, "other_charges", v)} placeholder="0" />
//                     </td>

//                     {/* Total — computed, read-only */}
//                     <td className="px-3 py-2 w-28">
//                       <span className={`text-sm font-bold ${parseFloat(item.total_price) > 0 ? "text-blue-700" : "text-slate-300"}`}>
//                         ₹ {parseFloat(item.total_price || 0).toFixed(2)}
//                       </span>
//                     </td>

//                     {/* Delete */}
//                     <td className="px-3 py-2 w-10">
//                       <button onClick={() => handleDeleteItem(i)}
//                         className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
//                         <Trash2 size={13} className="text-red-500" />
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* ── Summary Footer ── */}
//           {items.length > 0 && (
//             <div className="border-t border-slate-100 bg-slate-50/50">
//               <div className="flex justify-end">
//                 <div className="w-80 divide-y divide-slate-100">
//                   <div className="flex items-center justify-between px-6 py-3">
//                     <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sub Total</span>
//                     <span className="text-sm font-bold text-slate-800">₹ {totalAmount.toFixed(2)}</span>
//                   </div>
//                  <div className="flex flex-col gap-2 justify-between px-6 py-3">
//   <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
//      Discount
//   </span>
//   <div className="flex items-center w-full gap-2">
//     {/* Toggle buttons */}
//     <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-semibold">
//       <button
//         onClick={() => { setDiscountType("percent"); setDiscount(0); }}
//         className={`px-2 py-1 transition-colors ${
//           discountType === "percent"
//             ? "bg-blue-500 text-white"
//             : "bg-white text-slate-500 hover:bg-slate-50"
//         }`}
//       >
//         %
//       </button>
//       <button
//         onClick={() => { setDiscountType("amount"); setDiscount(0); }}
//         className={`px-2 py-1 transition-colors ${
//           discountType === "amount"
//             ? "bg-blue-500 text-white"
//             : "bg-white text-slate-500 hover:bg-slate-50"
//         }`}
//       >
//         ₹
//       </button>
//     </div>

//     <input
//       type="tel"
//       value={discount}
//       onChange={e => setDiscount(e.target.value)}
//       className="w-24 px-2 py-1 text-xs text-start rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
//     />
//     <span className="text-sm font-semibold text-red-500">
//       - ₹ {discountAmount.toFixed(2)}
//     </span>
//   </div>
// </div>
//                   <div className="flex items-center justify-between px-6 py-3">
//                     <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Adjustment</span>
//                     <input type="tel" value={adjustment} onChange={e => setAdjustment(e.target.value)}
//                       className="w-24 px-2 py-1 text-xs text-right rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
//                   </div>
//                   <div className="flex items-center justify-between px-6 py-4 rounded-b-2xl"
//                     style={{ background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)" }}>
//                     <span className="text-xs font-bold text-white uppercase tracking-wider">Final Amount</span>
//                     <span className="text-lg font-black text-white">₹ {finalAmount.toFixed(2)}</span>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Modals */}
//       <AddContactName
//         isModalOpen={isAccountModalOpen}
//         setIsModalOpen={setIsAccountModalOpen}
//         contactTypeId={3}
//         onClose={() => setIsAccountModalOpen(false)}
//         refreshData={fetchSupplier}
//         concatId={3}
//       />
//       <AddRawMaterial
//         isOpen={isAddItemModalOpen}
//         onClose={() => setIsAddItemModalOpen(false)}
//         setIsModalOpen={setIsAddItemModalOpen}
//         refreshData={(newItem) => newItem && handleSelectItem(newItem)}
//       />
//     </div>
//   );
// };

// export default AddPurchase;
