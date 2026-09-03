import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Package,
  FileText,
  Hash,
  Calendar,
  Tag,
  AlignLeft,
  Trash2,
  ShoppingCart,
  Plus,
  User,
} from "lucide-react";
import { Select } from "antd";
import { useNavigate, useLocation } from "react-router";
import {
  GetAllStoreIssueReturnPOCode,
  GetIssueDetailbyPOCode,
  AddStoreIssueReturn,
  GetSIRById,
  GetStockTypeByUserId,
  AddLogs
} from "../../../services/apiServices";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import { FormattedMessage, useIntl } from "react-intl";



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

const getLogDescription = (status, form, items, isEdit, sirId) => {
  const action = isEdit ? "Store Issue Return Updated" : "Store Issue Return Saved";
  const party = form.party_name || "-";
  const voucher = form.voucher_no || "-";
  const totalQty = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
  const itemsPreview =
    items.length > 0
      ? items
          .slice(0, 5)
          .map((i) => `${i.item_name}(x${i.qty})`)
          .join(", ") + (items.length > 5 ? ` +${items.length - 5} more` : "")
      : "N/A";

  switch (status) {
    case "SAVE_SUCCESS":
      return (
        `${action} — Voucher: ${voucher} (ID: ${sirId || 0}) | Party: ${party} | ` +
        `Items: ${items.length} | Total Return Qty: ${totalQty} | Details: ${itemsPreview} | ` +
        `Updated By: ${getUserEmail() || "Unknown User"}`
      );
    case "SAVE_ERROR":
      return (
        `${action} FAILED — Voucher: ${voucher} | Party: ${party} | ` +
        `Attempted By: ${getUserEmail() || "Unknown User"}`
      );
    default:
      return `${action} performed`;
  }
};

const getEventType = (status, isEdit) => {
  const prefix = isEdit ? "StoreIssueReturn_Edit" : "StoreIssueReturn_Add";
  return status === "SAVE_SUCCESS" ? `${prefix}_Success` : `${prefix}_Error`;
};

const AddStorePOReturn = () => {
  const intl = useIntl();
  const location = useLocation();
  const editData = location.state?.editData;
  const isEdit = Boolean(editData);

  const [POCode, setPOCode] = useState([]);
  const [availableItems, setAvailableItems] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [stockTypes, setStockTypes] = useState([]);
  const [loadingPO, setLoadingPO] = useState(false);
  const [loading, setLoading] = useState(false);
  const [poDate, setPoDate] = useState(null);

  const [form, setForm] = useState({
    voucher_no: "",
    date: null,
    poId: "",
    stock_type_id: "",
    party_id: "",
    party_name: "",
    event_id: "",
    remark: "",
  });

  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");



  const sendLog = async (status, currentItems = [], sirId = 0) => {
  try {
    await AddLogs({
      description: getLogDescription(status, form, currentItems, isEdit, sirId),
      eventType: getEventType(status, isEdit),
      id:  0,
      eventId:0,
      user: getUserEmail(),
    });
  } catch (logErr) {
    console.error("Failed to save log:", logErr);
  }
};

  // ── Fetch stock types ──
 useEffect(() => {
  GetStockTypeByUserId(JSON.parse(userId), '')
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
  // ── Fetch PO codes ──
  useEffect(() => {
    const fetchPOCode = async () => {
      try {
        setLoadingPO(true);
        const data = await GetAllStoreIssueReturnPOCode(userId);
        setPOCode(data?.data?.data?.pocodes || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingPO(false);
      }
    };
    fetchPOCode();
  }, []);

  // ── Fetch edit data ──
  useEffect(() => {
    if (isEdit) fetchEditData(editData.id);
  }, []);

  const mapDetail = (detail) => ({
    rawMaterialId: detail.rawMaterialId,
    item_name: detail.rawMaterialName || "",
    hsc_sac: detail.hsccode || "",
    cgst: detail.cgst ?? 0,
    sgst: detail.sgst ?? 0,
    igst: detail.igst ?? 0,
    totalqty: detail.qty ?? 0,
    qty: detail.returnedQty ?? 0,
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
      const res = await GetSIRById(id);
      const data = res?.data?.data;

      if (!data) return;

      setForm({
        voucher_no: data.voucher || data.sircode || "",
        date: data.returndate
          ? (() => {
              if (data.returndate.includes("/")) {
                const [day, month, year] = data.returndate.split("/");
                return new Date(`${year}-${month}-${day}T00:00:00`);
              }
              return new Date(data.returndate + "T00:00:00");
            })()
          : null,
        poId: data.storeIssueId || "",
        stock_type_id: data.stockTypeId || "",
        party_id: data.partyId || "",
        party_name: data.partyName || "",
        event_id: data.eventId || "",
        remark: data.remarks || "",
      });

      const returnedItems = (data.details || []).map((detail) => ({
        rawMaterialId: detail.rawMaterialId,
        item_name: detail.rawMaterialName || "",
        hsc_sac: "",
        cgst: 0,
        sgst: 0,
        igst: 0,
        totalqty: detail.qty ?? 0,
        qty: detail.returnedQty ?? 0,
        returnedQty: detail.returnedQty ?? 0,
        remainingQty: detail.remainingQty ?? 0,
        maxQty: (detail.remainingQty ?? 0) + (detail.returnedQty ?? 0),
        unit: detail.unitName || "",
        price_per_unit: 0,
        total_price: "0.00",
      }));
      setItems(returnedItems);

      if (data.storeIssuePocode) {
        const poRes = await GetIssueDetailbyPOCode(
          data.storeIssuePocode,
          userId,
        );
        const poData = poRes?.data?.data;
        if (poData?.details) {
          const allPOItems = poData.details.map((detail) => ({
            rawMaterialId: detail.rawMaterialId,
            item_name: detail.rawMaterialName || "",
            hsc_sac: "",
            cgst: 0,
            sgst: 0,
            igst: 0,
            totalqty: detail.qty ?? 0,
            qty: detail.remainingQty ?? 0,
            returnedQty: detail.returnedQty ?? 0,
            remainingQty: detail.remainingQty ?? 0,
            maxQty: (detail.remainingQty ?? 0) + (detail.returnedQty ?? 0),
            unit: detail.unitName || "",
            price_per_unit: 0,
            total_price: "0.00",
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

  const handlePOSelect = async (pocode) => {
    if (!pocode) {
      setAvailableItems([]);
      setItems([]);
      setSelectedItems([]);
      setForm((prev) => ({
        ...prev,
        voucher_no: "",
        poId: "",
        stock_type_id: "",
        remark: "",
        date: null,
        event_id: "",
      }));
      setPoDate(null);
      return;
    }

    try {
      const res = await GetIssueDetailbyPOCode(pocode, userId);
      const data = res?.data?.data;
      if (!data) return;

      const parsedPoDate = data.podate
        ? (() => {
            const [day, month, year] = data.podate.split("/");
            return new Date(`${year}-${month}-${day}T00:00:00`);
          })()
        : null;

      setPoDate(parsedPoDate);

      setForm((prev) => ({
        ...prev,
        voucher_no: data.pocode || pocode,
        poId: data.id,
        stock_type_id: data.stockTypeId || "",
        party_id: data.partyId || "",
        party_name: data.partyName || "",
        event_id: data.eventId || "",
        remark: data.remarks || "",
        date: parsedPoDate,
      }));

      const mapped = (data.details || []).map((detail) => ({
        rawMaterialId: detail.rawMaterialId,
        item_name: detail.rawMaterialName || "",
        hsc_sac: detail.hsccode || "",
        cgst: detail.cgst ?? 0,
        sgst: detail.sgst ?? 0,
        igst: detail.igst ?? 0,
        totalqty: detail.qty ?? 0,
        qty: detail.remainingQty ?? 0,
        returnedQty: detail.returnedQty ?? 0,
        remainingQty: detail.remainingQty ?? 0,
        maxQty: detail.remainingQty ?? 0,
        unit: detail.unitName || "",
        price_per_unit: detail.price ?? 0,
        total_price: ((detail.remainingQty ?? 0) * (detail.price ?? 0)).toFixed(
          2,
        ),
      }));
      const filtered = mapped.filter((item) => item.remainingQty > 0);
      setAvailableItems(filtered);
      setItems([]);
      setSelectedItems([]);
    } catch (error) {
      console.log("handlePOSelect error:", error);
    }
  };

  // ── Add selected items to table ──
  const handleAddItems = () => {
    if (selectedItems.length === 0) return;

    const newItems = selectedItems
      .filter(
        (sel) => !items.some((i) => i.rawMaterialId === sel.rawMaterialId),
      )
      .map((sel) => ({
        ...sel,
        qty: sel.remainingQty,
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

    if (!/^\d*\.?\d*$/.test(value)) return;

    if (value === "") {
      setItems((prev) =>
        prev.map((it, i) => (i === index ? { ...it, qty: "" } : it)),
      );
      return;
    }

    // ✅ Allow trailing dot while user is still typing "0." → "0.5"
    if (value.endsWith(".")) {
      setItems((prev) =>
        prev.map((it, i) => (i === index ? { ...it, qty: value } : it)),
      );
      return;
    }

    const parsed = parseFloat(value);

    if (isNaN(parsed) || parsed < 0) return;

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
  // ── Delete item ──
  const handleDeleteItem = (index) => {
    const removed = items[index];
    setItems((prev) => prev.filter((_, i) => i !== index));
    setSelectedItems((prev) =>
      prev.filter((i) => i.rawMaterialId !== removed.rawMaterialId),
    );
  };

  const formatDate = (date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}/${date.getFullYear()}`;
  };

  // ── Save ──
  const handleSave = async () => {
    if (!form.poId) {
      Swal.fire({
        icon: "warning",
        title: "Missing PO",
        text: "Please select a voucher/PO code.",
      });
      return;
    }
    if (items.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Items",
        text: "Please add at least one item.",
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

  const payload = {
    id: isEdit ? Number(editData.id) : 0,
    storeIssueId: form.poId,
    stockTypeId: Number(form.stock_type_id) || null,
    voucher: form.voucher_no || "",
    invoicetype: "",
    partyId: form.party_id || null,
    eventId: form.event_id || null,
    remarks: form.remark || "",
    returndate: formatDate(form.date),
    userId: Number(userId),
    details: items.map((item) => ({
      rawMaterialId: item.rawMaterialId || 0,
      qty: Number(item.qty) || 0,
    })),
  };

  const res = await AddStoreIssueReturn(payload);

  if (res?.data?.success) {
  const savedSirId = isEdit ? editData.id : (res?.data?.data?.id || 0);
  await sendLog("SAVE_SUCCESS", items, savedSirId);

  Swal.fire({
    icon: "success",
    title: "Success",
    text: isEdit
      ? "Store Issue Return Updated Successfully"
      : "Store Issue Return Saved Successfully",
    timer: 2000,
    showConfirmButton: false,
  });
  setTimeout(() => navigate("/stock-management/store-po-return"), 2000);
} else {
  await sendLog("SAVE_ERROR", items, isEdit ? editData.id : 0);

  Swal.fire({
    icon: "error",
    title: "Error",
    text: res?.data?.msg || "Something went wrong",
  });
}
} catch (error) {
  console.error("Save Error:", error);

   await sendLog("SAVE_ERROR", items, isEdit ? editData?.id : 0);

  Swal.fire({
    icon: "error",
    title: "Error",
    text: "Failed to save. Please try again.",
  });
}
  };

  const handleFormChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const totalAmount = items.reduce(
    (sum, item) => sum + parseFloat(item.total_price || 0),
    0,
  );

  const typeOptions = stockTypes.map((t) => ({
    label: t.nameEnglish,
    value: t.stocktypeid ?? t.stockTypeId ?? t.id,
  }));

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
      <div className="mx-auto space-y-5">
        {/* ── Information Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 rounded-t-2xl overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-700">
                <FileText size={17} className="text-white" />
              </div>
              <h2 className="text-green-900 font-bold text-base tracking-tight">
                {isEdit ? (
                  <FormattedMessage
                    id="STORE_RETURN.EDIT"
                    defaultMessage="Edit Store Issue Return"
                  />
                ) : (
                  <FormattedMessage
                    id="STORE_RETURN.ADD"
                    defaultMessage="Add Store Issue Return"
                  />
                )}{" "}
              </h2>
            </div>
            <button
              onClick={() => navigate("/stock-management/store-po-return")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors shadow-sm"
            >
              <ArrowLeft size={16} />
              <FormattedMessage id="COMMON.BACK" defaultMessage="Back" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-3 gap-x-6 gap-y-4">
            {/* Voucher / PO Code */}
            <div>
              <label className={labelClass}>
                <Hash size={16} /> Voucher / PO Code
              </label>
              <Select
                showSearch
                allowClear
                placeholder="Select PO code"
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

            {/* Return Date */}
            <div>
              <label className={labelClass}>
                <Calendar size={16} /> Return Date
              </label>
             <DatePicker
                selected={form.date}
                onChange={(date) => setForm((prev) => ({ ...prev, date }))}
                dateFormat="dd/MM/yyyy"
                placeholderText={
                  form.voucher_no ? "DD/MM/YYYY" : "Select PO code first…"
                }
                disabled={!form.voucher_no}
                minDate={poDate || undefined}
                className={`${fieldClass} ${!form.voucher_no ? "bg-slate-50 cursor-not-allowed" : ""}`}
              />
            </div>

            {/* Stock Type */}
            <div>
              <label className={labelClass}>
                <Tag size={16} /> Type
              </label>
              <Select
                showSearch
                allowClear
                disabled
                placeholder="Select Type"
                style={{ width: "100%", height: "38px" }}
                options={typeOptions}
                value={form.stock_type_id || undefined}
                onChange={(value) =>
                  setForm((prev) => ({ ...prev, stock_type_id: value }))
                }
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </div>

            <div className="col-span-2">
              <label className={labelClass}>
                <User size={16} /> Party
              </label>
              <input
                value={form.party_name || ""}
                disabled
                placeholder="Auto-filled from PO"
                className={`${fieldClass} bg-slate-50`}
              />
            </div>

            {/* Remark */}
            <div className="col-span-3">
              <label className={labelClass}>
                <AlignLeft size={16} /> Remark
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

        {/* ── Details Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary">
                <ShoppingCart size={17} className="text-white" />
              </div>
              <h2 className="text-blue-900 font-bold text-base tracking-tight">
                Store Issue Return Details
              </h2>
            </div>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 shadow-sm bg-green-700"
            >
              <Save size={16} /> {isEdit ? "Update" : "Save"}
            </button>
          </div>

          {/* ── Item selector row ── */}
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
                // ── Enter key: confirm selection and trigger Add ──
                onInputKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setTimeout(() => {
                      setSelectedItems((current) => {
                        if (current.length > 0) {
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

          {/* ── Table ── */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {[
                    "#",
                    "Item Name",
                    "Issue Qty",
                    "Returned",
                    "Return Qty",
                    "Unit",
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
                      colSpan={9}
                      className="px-4 py-14 text-center text-slate-400 text-sm"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Package size={32} className="text-slate-300" />
                        <p className="font-medium">No items added yet.</p>
                        <p className="text-xs text-slate-300">
                          {availableItems.length === 0
                            ? "Select a PO code above to load items."
                            : "Pick an item from the dropdown and click Add Items."}
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

                      {/* Issue Qty */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-orange-50 text-orange-600 whitespace-nowrap">
                          {item.totalqty} Qty
                        </span>
                      </td>

                      {/* Already Returned */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-orange-50 text-orange-600 whitespace-nowrap">
                          {item.returnedQty} returned
                        </span>
                      </td>

                      {/* Return Qty +/- input */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {/* <button
                            onClick={() => handleQtyChange(i, item.qty - 1)}
                            disabled={item.qty <= 1}
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          >−</button> */}
                          <input
                            type="text"
                            inputMode="decimal"
                            value={item.qty}
                            onChange={(e) => handleQtyChange(i, e.target.value)}
                            onBlur={() => {
                              const parsed = parseFloat(item.qty);

                              if (
                                item.qty === "" ||
                                item.qty === "." ||
                                isNaN(parsed) ||
                                parsed <= 0
                              ) {
                                // Reset to 1 if completely empty or nonsensical
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
                              } else if (String(item.qty).endsWith(".")) {
                                // Finalize "0." → 0 when user tabs away
                                setItems((prev) =>
                                  prev.map((it, idx) =>
                                    idx === i
                                      ? {
                                          ...it,
                                          qty: parsed,
                                          total_price: (
                                            parsed * it.price_per_unit
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
                            className="w-6 h-6 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm disabled:opacity-30 transition-colors"
                          >+</button> */}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-500">{item.unit}</td>

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
        </div>
      </div>
    </div>
  );
};

export default AddStorePOReturn;
