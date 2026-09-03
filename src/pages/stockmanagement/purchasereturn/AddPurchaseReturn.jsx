import { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import {
  ArrowLeft,
  Save,
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
  Plus,
} from "lucide-react";
import { Select } from "antd";
import { useNavigate, useLocation } from "react-router";
import {
  GetAllStorePOCode,
  OutsideContactName,
  GetDetailbyPOCode,
  AddStorePOReturn,
  GetPORById,
  AddLogs,
  GetStockTypeByUserId,
} from "../../../services/apiServices";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";






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

const getLogDescription = (status, form, items, isEdit) => {
  const action = isEdit ? "Purchase Return Edit" : "Purchase Return Add";
  const supplier = form.account_name || "-";
  const billNo = form.bill_no || "-";

  switch (status) {
    case "SAVE_SUCCESS": {
      const itemSummary = items.map((i) => `${i.item_name}(x${i.qty})`).join(", ");
      return `${action} saved | Bill: ${billNo} | ${supplier} | ${itemSummary}`;
    }
    case "SAVE_ERROR":
      return `${action} failed | Bill: ${billNo} | ${supplier}`;
    default:
      return `${action} performed`;
  }
};

const getEventType = (status, isEdit) => {
  const prefix = isEdit ? "PurchaseReturn_Edit" : "PurchaseReturn_Add";
  return status === "SAVE_SUCCESS" ? `${prefix}_Success` : `${prefix}_Error`;
};

const AddPurchaseReturn = () => {
  const location = useLocation();
  const editData = location.state?.editData;
  const isEdit = Boolean(editData);

  const [supplier, setSupplier] = useState([]);
  const [POCode, setPOCode] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingPO, setLoadingPO] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [stockTypes, setStockTypes] = useState([]);
const [selectedMainType, setSelectedMainType] = useState(null);



useEffect(() => {
  fetchSupplier();
  fetchPOCode();
  if (isEdit) fetchEditData(editData.purchaseid);

  GetStockTypeByUserId(JSON.parse(userId), selectedMainType ?? '')
    .then((res) => {
      const data = Array.isArray(res?.data?.data)
        ? res.data.data
        : Array.isArray(res?.data)
          ? res.data
          : [];
      setStockTypes(data);
    })
    .catch((err) => console.error("Failed to fetch stock types:", err));
}, []);

  const sendLog = async (status, currentItems = []) => {
  try {
    await AddLogs({
      description: getLogDescription(status, form, currentItems, isEdit),
      eventType: getEventType(status, isEdit),
      eventId:0,
      id:  0,
      user: getUserEmail(),
    });
  } catch (logErr) {
    console.error("Failed to save log:", logErr);
  }
};

  const [form, setForm] = useState({
    voucher_no: "",
    date: null,
    poId: "",
    bill_no: "",
    supplier_id: "",
    account_name: "",
    invoice_type: "Tax Invoice",
    remark: "",
    stock_type_id: "",
  stock_type_name: "",
  });

  const navigate = useNavigate();
  const [discount, setDiscount] = useState(0);
  const [adjustment, setAdjustment] = useState(0);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchSupplier();
    fetchPOCode();
    if (isEdit) fetchEditData(editData.purchaseid);
  }, []);

  const mapDetail = (detail) => ({
    rawMaterialId: detail.rawMaterialId,
    item_name: detail.rawMaterialName,
    hsc_sac: detail.hsccode || "",
    cgst: detail.cgst ?? 0,
    sgst: detail.sgst ?? 0,
    igst: detail.igst ?? 0,
    totalqty: detail.qty ?? 0,
    qty: detail.remainingQty ?? 0,
    returnedQty: detail.returnedQty ?? 0,
    remainingQty: detail.remainingQty ?? 0,
    maxQty: (detail.remainingQty ?? 0) + (detail.returnedQty ?? 0),
    unit: detail.unitName || "",
    price_per_unit: detail.price ?? 0,
    total_price: ((detail.returnedQty ?? 0) * (detail.price ?? 0)).toFixed(2),
  });

  const fetchEditData = async (id) => {
    try {
      setLoading(true);
      const res = await GetPORById(id);
      const list = res?.data?.data ?? [];

      const data = Array.isArray(list)
        ? (list.find((item) => item.id === Number(id)) ?? list[0])
        : list;

      if (!data) return;

      setForm({
        voucher_no: data.voucher || "",
        date: data.returndate ? new Date(data.returndate) : null,
        poId: data.poId || "",
        bill_no: data.billno || "",
        supplier_id: data.supplierId || "",
        account_name: data.supplierName || "",
        invoice_type: data.invoicetype || "Tax Invoice",
        remark: data.remarks || "",
        stock_type_id: data.stockTypeId || "",
         stock_type_name: data.stockTypeName || "",
      });

      setDiscount(data.discountper ?? 0);
      setAdjustment(data.adjustamount ?? 0);

      const returnedItems = (data.details || []).map(mapDetail);
      setItems(returnedItems);

      if (data.pocode) {
        const poRes = await GetDetailbyPOCode(data.pocode, userId);
        const poData = poRes?.data?.data;

        if (poData?.details) {
          const allPOItems = poData.details.map((detail) => ({
            rawMaterialId: detail.rawMaterialId,
            item_name: detail.rawMaterialName,
            hsc_sac: detail.hsccode || "",
            cgst: detail.cgst ?? 0,
            sgst: detail.sgst ?? 0,
            igst: detail.igst ?? 0,
            qty: detail.remainingQty ?? 0,
            returnedQty: detail.returnedQty ?? 0,
            remainingQty: detail.remainingQty ?? 0,
            maxQty: detail.remainingQty ?? 0,
            unit: detail.unitName || "",
            price_per_unit: detail.price ?? 0,
            total_price: (1 * (detail.price ?? 0)).toFixed(2),
          }));

          setAvailableItems(allPOItems);
        }
      }
    } catch (error) {
      console.error("fetchEditData error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()}`;
  };

  // const mapDetail = (detail) => ({
  //   rawMaterialId: detail.rawMaterialId,
  //   item_name: detail.rawMaterialName,
  //   hsc_sac: detail.hsccode || "",
  //   cgst: detail.cgst ?? 0,
  //   sgst: detail.sgst ?? 0,
  //   igst: detail.igst ?? 0,
  //   totalqty: detail.qty ?? 0,
  //   qty: detail.returnedQty ?? 0,
  //   returnedQty: detail.returnedQty ?? 0,
  //   remainingQty: detail.remainingQty ?? 0,
  //   maxQty: (detail.remainingQty ?? 0) + (detail.returnedQty ?? 0),
  //   unit: detail.unitName || "",
  //   price_per_unit: detail.price ?? 0,
  //   total_price: ((detail.returnedQty ?? 0) * (detail.price ?? 0)).toFixed(2),
  // });

  // const fetchEditData = async (id) => {
  //   try {
  //     setLoading(true);
  //     const res = await GetPORById(id);
  //     const list = res?.data?.data ?? [];

  //     const data = Array.isArray(list)
  //       ? (list.find((item) => item.id === Number(id)) ?? list[0])
  //       : list;

  //     if (!data) return;

  //     setForm({
  //       voucher_no: data.voucher || "",
  //       date: data.returndate ? new Date(data.returndate) : null,
  //       poId: data.poId || "",
  //       bill_no: data.billno || "",
  //       supplier_id: data.supplierId || "",
  //       account_name: data.supplierName || "",
  //       invoice_type: data.invoicetype || "Tax Invoice",
  //       remark: data.remarks || "",
  //     });

  //     setDiscount(data.discountper ?? 0);
  //     setAdjustment(data.adjustamount ?? 0);

  //     const returnedItems = (data.details || []).map(mapDetail);
  //     setItems(returnedItems);

  //     if (data.pocode) {
  //       const poRes = await GetDetailbyPOCode(data.pocode);
  //       const poData = poRes?.data?.data;

  //       if (poData?.details) {
  //         const allPOItems = poData.details.map((detail) => ({
  //           rawMaterialId: detail.rawMaterialId,
  //           item_name: detail.rawMaterialName,
  //           hsc_sac: detail.hsccode || "",
  //           cgst: detail.cgst ?? 0,
  //           sgst: detail.sgst ?? 0,
  //           igst: detail.igst ?? 0,
  //           qty: detail.remainingQty ?? 0,
  //           returnedQty: detail.returnedQty ?? 0,
  //           remainingQty: detail.remainingQty ?? 0,
  //           maxQty: detail.remainingQty ?? 0,
  //           unit: detail.unitName || "",
  //           price_per_unit: detail.price ?? 0,
  //           total_price: (1 * (detail.price ?? 0)).toFixed(2),
  //         }));

  //         setAvailableItems(allPOItems);
  //       }
  //     }
  //   } catch (error) {
  //     console.error("fetchEditData error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const formatDate = (date) => {
  //   if (!date) return "";
  //   const day = String(date.getDate()).padStart(2, "0");
  //   const month = String(date.getMonth() + 1).padStart(2, "0");
  //   return `${day}/${month}/${date.getFullYear()}`;
  // };

  const fetchSupplier = async () => {
    try {
      const data = await OutsideContactName(3, userId);
      setSupplier(data?.data?.data["Party Details"] || []);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchPOCode = async () => {
    try {
      setLoadingPO(true);
      const data = await GetAllStorePOCode(userId);
      setPOCode(data?.data?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingPO(false);
    }
  };

  const handlePOSelect = async (pocode) => {
    if (!pocode) {
    setAvailableItems([]);
    setItems([]);
    setSelectedItems([]);
    setForm((prev) => ({
      ...prev,
      voucher_no: "",
      poId: "",
      bill_no: "",
      supplier_id: "",
      account_name: "",
      invoice_type: "Tax Invoice",
      remark: "",
      date: null,
      stock_type_id: "",    
      stock_type_name: "", 
    }));
    setDiscount(0);
    setAdjustment(0);
    return;
  }

    try {
    const res = await GetDetailbyPOCode(pocode, userId);
    const data = res?.data?.data;
    if (!data) return;

    setForm((prev) => ({
      ...prev,
      voucher_no: data.pocode,
      poId: data.id,
      bill_no: data.billno,
      supplier_id: data.supplierId,
      account_name: data.supplierName,
      invoice_type: data.invoicetype,
      remark: data.remarks,
      date: data.podate ? new Date(data.podate) : null,
      stock_type_id: data.stockTypeId || "",    
      stock_type_name: data.stockTypeName || "", 
    }));

      const mapped = (data.details || []).map((detail) => ({
        rawMaterialId: detail.rawMaterialId,
        item_name: detail.rawMaterialName,
        hsc_sac: detail.hsccode || "",
        cgst: detail.cgst ?? 0,
        sgst: detail.sgst ?? 0,
        igst: detail.igst ?? 0,
        totalqty: detail.qty ?? 0, // ← purchase qty, locked
        qty: detail.remainingQty ?? 0, // ← return qty, editable
        returnedQty: detail.returnedQty ?? 0,
        remainingQty: detail.remainingQty ?? 0,
        maxQty: detail.remainingQty ?? 0,
        unit: detail.unitName || "",
        price_per_unit: detail.price ?? 0,
        total_price: (1 * (detail.price ?? 0)).toFixed(2),
      }));

      const filtered = mapped.filter((item) => item.remainingQty > 0);
      setAvailableItems(filtered);
      setItems([]);
      setSelectedItems([]);

      setDiscount(data.discountper ?? 0);
      setAdjustment(data.adjustamount ?? 0);
    } catch (error) {
      console.log("handlePOSelect error:", error);
    }
  };

  const handleAddItems = () => {
    if (selectedItems.length === 0) return;

    const newItems = selectedItems
      .filter(
        (sel) => !items.some((i) => i.rawMaterialId === sel.rawMaterialId),
      )
      .map((sel) => ({
        rawMaterialId: sel.rawMaterialId,
        item_name: sel.item_name,
        hsc_sac: sel.hsc_sac,
        cgst: sel.cgst,
        sgst: sel.sgst,
        igst: sel.igst,
        totalqty: sel.totalqty,
        qty: sel.remainingQty,
        returnedQty: sel.returnedQty,
        remainingQty: sel.remainingQty,
        maxQty: sel.maxQty,
        unit: sel.unit,
        price_per_unit: sel.price_per_unit,
        total_price: (sel.remainingQty * sel.price_per_unit).toFixed(2),
      }));

    if (newItems.length === 0) {
      Swal.fire({
        icon: "info",
        title: "Already Added",
        text: "All selected items are already in the table.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    setItems((prev) => [...prev, ...newItems]);
    setSelectedItems([]);
  };

  const handleQtyChange = (index, value) => {
    const item = items[index];

    if (value === "" || value === "." || value === "0" || value === "0.") {
      setItems((prev) =>
        prev.map((it, i) => (i === index ? { ...it, qty: value } : it)),
      );
      return;
    }

    const parsed = parseFloat(value);

    if (isNaN(parsed) || parsed <= 0) return;

    if (parsed > item.maxQty) {
      Swal.fire({
        icon: "warning",
        title: "Quantity Exceeded",
        text: `Max allowed qty is ${item.maxQty}`,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    setItems((prev) =>
      prev.map((it, i) =>
        i === index
          ? {
              ...it,
              qty: value,
              total_price: (parsed * it.price_per_unit).toFixed(2),
            }
          : it,
      ),
    );
  };

  const handleDeleteItem = (index) => {
    const removed = items[index];
    setItems((prev) => prev.filter((_, i) => i !== index));

    setSelectedItems((prev) =>
      prev.filter((i) => i.rawMaterialId !== removed.rawMaterialId),
    );
  };

  const handleSave = async () => {
    if (!form.supplier_id) {
      Swal.fire({
        icon: "warning",
        title: "Missing Supplier",
        text: "Please select a supplier",
      });
      return;
    }
    if (!form.date) {
      Swal.fire({
        icon: "warning",
        title: "Missing Date",
        text: "Please select a return date.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    
    if (items.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Items",
        text: "Please add at least one item",
      });
      return;
    }

   try {
  const details = items.map((item) => ({
    rawMaterialId: item.rawMaterialId || 0,
    hsccode: item.hsc_sac || "",
    cgst: Number(item.cgst) || 0,
    sgst: Number(item.sgst) || 0,
    igst: Number(item.igst) || 0,
    qty: Number(item.qty) || 0,
    price: Number(item.price_per_unit) || 0,
    othercharge: 0,
    total: Number(item.total_price) || 0,
  }));

  const subamount = items.reduce((sum, i) => sum + Number(i.total_price || 0), 0);
  const discountval = (subamount * (Number(discount) || 0)) / 100;
  const finalamount = subamount - discountval + (Number(adjustment) || 0);

  const payload = {
    id: isEdit ? Number(editData.purchaseid) : 0,
    poId: form.poId,
    supplierId: form.supplier_id,
    voucher: form.voucher_no,
    billno: form.bill_no,
    invoicetype: form.invoice_type,
    remarks: form.remark,
    returndate: formatDate(form.date),
    userId,
    subamount,
    discountper: Number(discount) || 0,
    discountval,
    adjustamount: Number(adjustment) || 0,
    finalamount,
    stockTypeId: Number(form.stock_type_id) || 0,
    details,
  };

  const res = await AddStorePOReturn(payload);

  if (res?.data?.success) {
    
    await sendLog("SAVE_SUCCESS", items);

    Swal.fire({
      icon: "success",
      title: "Success",
      text: isEdit
        ? "Purchase Return Updated Successfully"
        : "Purchase Return Saved Successfully",
      timer: 2000,
      showConfirmButton: false,
    });
    setTimeout(() => navigate("/stock-management/purchase-return"), 2000);
  } else {
    // ✅ Log error
    await sendLog("SAVE_ERROR");

    Swal.fire({
      icon: "error",
      title: "Error",
      text: res?.data?.msg || "Something went wrong",
    });
  }
} catch (error) {
  console.error("Save Error:", error);

  
  
}
  };

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const totalAmount = items.reduce(
    (sum, item) => sum + parseFloat(item.total_price || 0),
    0,
  );
  const discountAmount = (totalAmount * (parseFloat(discount) || 0)) / 100;
  const finalAmount =
    totalAmount - discountAmount + (parseFloat(adjustment) || 0);

  const fieldClass =
    "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";
  const labelClass =
    "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-400 gap-2">
        <i className="ki-filled ki-arrows-circle animate-spin text-2xl"></i>{" "}
        Loading…
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6 font-sans">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); * { font-family: 'DM Sans', sans-serif; }`}</style>

      <div className="mx-auto space-y-5">
        {/* ── Purchase Information Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 rounded-t-2xl overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-700">
                <FileText size={17} className="text-white" />
              </div>
              <h2 className="text-green-900 font-bold text-base tracking-tight">
                {isEdit ? (
                  <FormattedMessage
                    id="purchaseReturn.edit"
                    defaultMessage="Edit Purchase Return"
                  />
                ) : (
                  <FormattedMessage
                    id="purchaseReturn.add"
                    defaultMessage="Add Purchase Return"
                  />
                )}{" "}
              </h2>
            </div>
            <button
              onClick={() => navigate("/stock-management/purchase-return")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors shadow-sm"
            >
              <ArrowLeft size={16} />
              <FormattedMessage id="common.back" defaultMessage="Back" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <label className={labelClass}>
                <Hash size={16} />
                <FormattedMessage
                  id="voucher.no"
                  defaultMessage="Voucher No."
                />
              </label>
              <Select
                showSearch
                allowClear
                placeholder="Select Voucher code"
                style={{ width: "100%", height: "38px" }}
                value={form.voucher_no || undefined}
                onChange={handlePOSelect}
                disabled={isEdit}
                loading={loadingPO}
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
                options={POCode.map((po) => ({
                  value: po.pocode,
                  label: po.pocode,
                  returned: po.returned,
                  disabled: po.returned,
                }))}
                optionRender={(option) => (
                  <div className="flex items-center justify-between w-full py-0.5">
                    <span
                      style={{
                        color: option.data.returned ? "#94a3b8" : "#1e293b",
                        fontWeight: 500,
                        fontSize: "14px",
                        opacity: option.data.returned ? 0.5 : 1,
                      }}
                    >
                      {option.data.label}
                    </span>
                    {option.data.returned && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "999px",
                          marginLeft: "8px",
                          whiteSpace: "nowrap",
                          backgroundColor: "#fee2e2",
                          color: "#ef4444",
                        }}
                      >
                        Already Returned
                      </span>
                    )}
                  </div>
                )}
              />
              {!isEdit && POCode.length === 0 && !loadingPO && (
                <p className="text-xs text-gray-400 mt-1">
                  No PO Codes available
                </p>
              )}
            </div>

            <div className="grid grid-col-1">
  <label className={labelClass}>
    <Calendar size={16} />
    <FormattedMessage
      id="return.date"
      defaultMessage="Return Date"
    />{" "}
    <span className="text-red-500">*</span>
  </label>
  <DatePicker
    selected={form.date}
    onChange={(date) => setForm((prev) => ({ ...prev, date }))}
    dateFormat="dd/MM/yyyy"
    placeholderText={
      form.voucher_no ? "DD/MM/YYYY" : "Select voucher first…"
    }
    disabled={!form.voucher_no}
    minDate={form.date || undefined}
    className={`${fieldClass} ${!form.voucher_no ? "bg-slate-50 cursor-not-allowed" : ""}`}
  />
</div>

            <div>
              <label className={labelClass}>
                <Receipt size={16} />
                <FormattedMessage id="bill.no" defaultMessage="Bill No." />{" "}
                
              </label>
              <input
                name="bill_no"
                disabled
                value={form.bill_no}
                onChange={handleFormChange}
                placeholder="Auto-filled from PO"
                className={`${fieldClass} bg-slate-50`}
              />
            </div>

            <div className="col-span-2">
              <label className={labelClass}>
                <User size={16} />{" "}
                <FormattedMessage
                  id="PURCHASE.ACCOUNT_NAME"
                  defaultMessage="Account Name"
                />{" "}
                <FormattedMessage id="(Supplier)" defaultMessage="(Supplier)" />
              </label>
              <Select
                showSearch
                allowClear
                disabled
                placeholder="Auto-filled from PO"
                style={{ width: "100%", height: "38px" }}
                value={form.supplier_id || undefined}
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
                <Tag size={16} />
                <FormattedMessage
                  id="PURCHASE.INVOICE_TYPE"
                  defaultMessage=" Invoice Type"
                />
              </label>
              <input
                name="invoice_type"
                disabled
                value={form.invoice_type}
                className={`${fieldClass} bg-slate-50`}
              />
            </div>
            {/* Stock Type — view only */}
<div>
  <label className={labelClass}>
    <Tag size={16} /> Stock Type
  </label>
  <input
    disabled
   value={form.stock_type_name || ""} 
    placeholder="Auto-filled from PO"
    className={`${fieldClass} bg-slate-50 text-slate-500 cursor-not-allowed`}
  />
</div>

            <div className="col-span-3">
              <label className={labelClass}>
                <AlignLeft size={16} />{" "}
                <FormattedMessage
                  id="PURCHASE.REMARK"
                  defaultMessage="Remark"
                />
              </label>
              <input
                name="remark"
                value={form.remark}
                onChange={handleFormChange}
                placeholder="Optional remark..."
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        {/* ── Purchase Details Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary">
                <ShoppingCart size={17} className="text-white" />
              </div>
              <h2 className="text-blue-900 font-bold text-base tracking-tight">
                <FormattedMessage
                  id="USER.PURCHASE_RETURN.TITL"
                  defaultMessage="Purchase Return Details"
                />
              </h2>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 shadow-sm bg-green-700"
            >
              <Save size={16} />
              {isEdit ? (
                <FormattedMessage id="common.update" defaultMessage="Update" />
              ) : (
                <FormattedMessage id="common.save" defaultMessage="Save" />
              )}
            </button>
          </div>

          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-end gap-3">
            <div className="flex-1">
              <label className={labelClass}>
                <Package size={14} /> Select Items to Add
              </label>
              <Select
                mode="multiple"
                showSearch
                allowClear
                placeholder={
                  availableItems.length === 0
                    ? "Select a PO code first…"
                    : "Search and select items…"
                }
                style={{ width: "100%", minHeight: "38px" }}
                value={selectedItems.map((i) => i.rawMaterialId)}
                disabled={availableItems.length === 0}
                onChange={(vals) => {
                  const found = vals
                    .map((val) =>
                      availableItems.find((i) => i.rawMaterialId === val),
                    )
                    .filter(Boolean);
                  setSelectedItems(found);
                }}
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().includes(input.toLowerCase())
                }
                options={availableItems.map((i) => ({
                  value: i.rawMaterialId,
                  label: i.item_name,
                  remainingQty: i.remainingQty,
                  disabled: items.some(
                    (t) => t.rawMaterialId === i.rawMaterialId,
                  ),
                }))}
                // ── Enter key: confirm selection and trigger Add ──────────────────
                onInputKeyDown={(e) => {
                  if (e.key === "Enter") {
                    // Small delay to let Ant Design process the selection first
                    setTimeout(() => {
                      setSelectedItems((current) => {
                        if (current.length > 0) {
                          // Trigger add inline after selection is confirmed
                          const newItems = current
                            .filter(
                              (sel) =>
                                !items.some(
                                  (i) => i.rawMaterialId === sel.rawMaterialId,
                                ),
                            )
                            .map((sel) => ({
                              ...sel,
                              qty: sel.remainingQty,
                              total_price: (
                                sel.remainingQty * sel.price_per_unit
                              ).toFixed(2),
                            }));

                          if (newItems.length > 0) {
                            setItems((prev) => [...prev, ...newItems]);
                          }
                          return []; // clear selection after adding
                        }
                        return current;
                      });
                    }, 100);
                  }
                }}
                optionRender={(option) => {
                  const isDisabled = option.data.disabled;
                  const remaining = option.data.remainingQty ?? 0;
                  const isSelected = selectedItems.some(
                    (s) => s.rawMaterialId === option.data.value,
                  );

                  return (
                    <div className="flex items-center justify-between w-full py-0.5">
                      <span
                        style={{
                          color: isSelected
                            ? "#ffffff"
                            : isDisabled
                              ? "#94a3b8"
                              : "#1e293b",
                          fontSize: "14px",
                          fontWeight: 500,
                        }}
                      >
                        {option.data.label}
                      </span>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "999px",
                          marginLeft: "8px",
                          whiteSpace: "nowrap",
                          backgroundColor: isSelected
                            ? "rgba(255,255,255,0.25)"
                            : isDisabled
                              ? "#f1f5f9"
                              : remaining === 0
                                ? "#fee2e2"
                                : remaining <= 3
                                  ? "#ffedd5"
                                  : "#dcfce7",
                          color: isSelected
                            ? "#ffffff"
                            : isDisabled
                              ? "#94a3b8"
                              : remaining === 0
                                ? "#ef4444"
                                : remaining <= 3
                                  ? "#ea580c"
                                  : "#16a34a",
                        }}
                      >
                        {isDisabled
                          ? "Already Added"
                          : `${remaining} remaining`}
                      </span>
                    </div>
                  );
                }}
              />
            </div>
            <button
              onClick={handleAddItems}
              disabled={selectedItems.length === 0}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold bg-primary transition-all hover:opacity-90 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ height: "38px" }}
            >
              <Plus size={15} /> Add{" "}
              {selectedItems.length > 0 ? `(${selectedItems.length})` : "Items"}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    "#",
                    <FormattedMessage
                      id="item.name"
                      defaultMessage="Item Name"
                    />,
                    <FormattedMessage
                      id="purchase.qty"
                      defaultMessage="Purchase Qty"
                    />,
                    <FormattedMessage
                      id="returned.qty"
                      defaultMessage="Returned"
                    />,
                    <FormattedMessage
                      id="return.qty"
                      defaultMessage="Return Qty"
                    />,
                    <FormattedMessage id="unit" defaultMessage="Unit" />,
                    <FormattedMessage
                      id="price.unit"
                      defaultMessage="Price/Unit"
                    />,
                    <FormattedMessage
                      id="total.price"
                      defaultMessage="Total Price"
                    />,
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-14 text-center text-slate-400 text-sm"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Package size={32} className="text-slate-300" />
                        <p className="font-medium">No items added yet.</p>
                        <p className="text-xs text-slate-300">
                          {availableItems.length === 0
                            ? "Select a PO code above to load items."
                            : "Pick an item from the dropdown and click Add Item."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => (
                    <tr
                      key={item.rawMaterialId}
                      className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group"
                    >
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">
                        {item.item_name}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-orange-50 text-orange-600 whitespace-nowrap">
                          {item.totalqty} Qty
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-orange-50 text-orange-600 whitespace-nowrap">
                          {item.returnedQty} returned
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* <button
                            onClick={() => handleQtyChange(i, item.qty - 1)}
                            disabled={item.qty <= 1}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >
                            −
                          </button> */}
                          <input
                            type="tel"
                            value={item.qty}
                            onChange={(e) => handleQtyChange(i, e.target.value)}
                            onBlur={() => {
                              const parsed = parseFloat(item.qty);
                              if (!item.qty || isNaN(parsed) || parsed <= 0) {
                                setItems((prev) =>
                                  prev.map((it, idx) =>
                                    idx === i
                                      ? {
                                          ...it,
                                          qty: 1,
                                          total_price: (
                                            1 * it.price_per_unit
                                          ).toFixed(2),
                                        }
                                      : it,
                                  ),
                                );
                              }
                            }}
                            className="w-[100px] text-center px-1 py-1 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700"
                          />
                          {/* <button
                            onClick={() => handleQtyChange(i, item.qty + 1)}
                            disabled={item.qty >= item.maxQty}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm disabled:opacity-30"
                          >
                            +
                          </button> */}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-500">{item.unit}</td>
                      <td className="px-4 py-3 text-slate-600">
                        ₹ {item.price_per_unit}
                      </td>
                      <td className="px-4 py-3 font-bold text-primary whitespace-nowrap">
                        ₹ {item.total_price}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDeleteItem(i)}
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={13} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/50">
            <div className="flex justify-end">
              <div className="w-80">
                <div
                  className="flex items-center justify-between px-6 py-4 mt-3"
                  style={{
                    background:
                      "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)",
                  }}
                >
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Total Amount
                  </span>
                  <span className="text-lg font-black text-white">
                    ₹ {finalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPurchaseReturn;
