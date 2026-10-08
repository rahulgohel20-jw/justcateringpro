import { Fragment, useState, useEffect } from "react";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Select } from "antd";
import { useNavigate, useLocation } from "react-router";
import {
  GetAllStoreIssueReturnPOCode,
  GetIssueDetailbyPOCode,
  AddStoreIssueReturn,
  addOrUpdateBatchWisestoreissue,
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

const sumRowsQty = (rows = []) => {
  const total = rows.reduce((s, r) => s + (parseFloat(r.qty) || 0), 0);
  return total > 0 ? String(Number(total.toFixed(3))) : "";
};

const buildNewItem = (sel) =>
  sel.isBatchWise
    ? { ...sel, qty: "", total_price: "0.00", detailRows: [] }
    : {
        ...sel,
        qty: sel.remainingQty,
        total_price: (sel.remainingQty * sel.price_per_unit).toFixed(2),
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
const [expandedItemIndex, setExpandedItemIndex] = useState(null);
const [batchAddSelection, setBatchAddSelection] = useState({});
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
const getPODetails = (data) =>
  data?.isBatchWise ? data.batchWiseDetails || [] : data?.details || [];
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const currentUserId = Number(userId || 0);
  const BATCH_ACCESS_USER_IDS = [233, 376];
const isBatchAccessUser = BATCH_ACCESS_USER_IDS.includes(currentUserId);
  const isBatchWisePO = (po) => {
    if (!po) return false;

    const values = [
      po?.isBatchWise,
      po?.batch,
      po?.batchWise,
      po?.isBatchwise,
      po?.batchwise,
    ];

    return values.some((value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === "string") {
        return value.toLowerCase() === "true" || value === "1";
      }
      return value === true || value === 1;
    });
  };

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
        const poList = data?.data?.data?.pocodes || [];
        setPOCode(poList);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingPO(false);
      }
    };
    fetchPOCode();
  }, [userId]);

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
    const raw = res?.data?.data;
const data = Array.isArray(raw)
  ? raw.find((r) => Number(r.id) === Number(id))
  : raw;
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

const batchSource = data.batchDetails ?? data.batchWiseDetails ?? [];
const isBatch = !!data.isBatchWise || batchSource.length > 0;
const issuedDetails = isBatch ? batchSource : (data.details ?? []);

const returnedItems = issuedDetails.map((detail) => {
  const batchList = detail.batchList || [];

  let detailRows = [];
  if (isBatch) {
    const withReturn = batchList.filter((b) => Number(b.returnedQty) > 0);
    if (withReturn.length > 0) {
      detailRows = withReturn.map((b) => ({
        batchNo: b.batchNo || "",
        date: b.expiryDate || "",
        qty: String(b.returnedQty),
        maxQty: Number(b.qty || 0) + Number(b.returnedQty || 0),
      }));
    } else if (batchList.length === 1 && Number(detail.returnedQty) > 0) {
      // only one batch, so the whole returned qty belongs to it
      const b = batchList[0];
      detailRows = [
        {
          batchNo: b.batchNo || "",
          date: b.expiryDate || "",
          qty: String(detail.returnedQty),
          maxQty: Number(b.qty || 0) + Number(detail.returnedQty || 0),
        },
      ];
    }
  }

  return {
    rawMaterialId: detail.rawMaterialId,
    item_name: detail.rawMaterialName || "",
    hsc_sac: "",
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalqty: detail.qty ?? 0,
    qty: isBatch ? sumRowsQty(detailRows) : (detail.returnedQty ?? 0),
    returnedQty: detail.returnedQty ?? 0,
    remainingQty: detail.remainingQty ?? 0,
    maxQty: (detail.remainingQty ?? 0) + (detail.returnedQty ?? 0),
    unit: detail.unitName || "",
    price_per_unit: 0,
    total_price: "0.00",
    isBatchWise: isBatch,
    batchList,
    detailRows,
  };
});
setItems(returnedItems);
      setItems(returnedItems);

  const poCode = data.storeIssuePocode || data.pocode;
if (poCode) {
  const poRes = await GetIssueDetailbyPOCode(poCode, userId);
  const poData = poRes?.data?.data;
  const poDetails = getPODetails(poData);

  if (poDetails.length > 0) {
    const allPOItems = poDetails.map((detail) => ({
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
      isBatchWise: !!poData.isBatchWise,
      batchList: detail.batchList || [],
    }));
    setAvailableItems(allPOItems);

    // give edit items the full batch list from the PO
    setItems((prev) =>
      prev.map((it) => {
        if (!it.isBatchWise) return it;
        const po = allPOItems.find((p) => p.rawMaterialId === it.rawMaterialId);
        const merged = [...(po?.batchList || [])];
        (it.batchList || []).forEach((b) => {
          if (!merged.some((m) => m.batchNo === b.batchNo)) merged.push(b);
        });
        return {
          ...it,
          batchList: merged,
          detailRows: (it.detailRows || []).map((r) => {
            const src = merged.find((m) => m.batchNo === r.batchNo);
            return src
              ? { ...r, maxQty: Number(src.qty || 0) + Number(r.qty || 0) }
              : r;
          }),
        };
      }),
    );
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

      const mapped = getPODetails(data).map((detail) => ({
        
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
  total_price: ((detail.remainingQty ?? 0) * (detail.price ?? 0)).toFixed(2),
  isBatchWise: !!data.isBatchWise,
  batchList: detail.batchList || [],
}));
console.log("mapped:", mapped);
      const filtered = mapped.filter((item) => item.remainingQty > 0);
      console.log("filtered:", filtered);   
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
  .filter((sel) => !items.some((i) => i.rawMaterialId === sel.rawMaterialId))
  .map(buildNewItem);

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
const addBatchRows = (index, batchNos = []) => {
  if (!Array.isArray(batchNos) || batchNos.length === 0) return;
  setItems((prev) =>
    prev.map((it, i) => {
      if (i !== index) return it;
      const rows = it.detailRows || [];
      const already = new Set(rows.map((r) => r.batchNo));
      const newRows = batchNos
        .filter((no) => !already.has(no))
        .map((no) => {
          const src = (it.batchList || []).find((b) => b.batchNo === no) || {};
          return {
            batchNo: no,
            date: src.expiryDate || "",
            qty: "",
            maxQty: Number(src.qty) || 0, // available
            unit: src.unitName || it.unit || "",
          };
        });
      const next = [...rows, ...newRows];
      return { ...it, detailRows: next, qty: sumRowsQty(next) };
    }),
  );
  setBatchAddSelection((p) => ({ ...p, [index]: [] }));
};

const updateBatchRowQty = (itemIdx, rowIdx, value) => {
  if (!/^\d*\.?\d*$/.test(value)) return;
  const row = items[itemIdx]?.detailRows?.[rowIdx];
  const parsed = parseFloat(value);
  if (row && !isNaN(parsed) && parsed > row.maxQty) {
    Swal.fire({
      icon: "warning",
      title: "Quantity Exceeded",
      text: `Max allowed qty for this batch is ${row.maxQty}`,
      timer: 2000,
      showConfirmButton: false,
    });
    return;
  }
  setItems((prev) =>
    prev.map((it, i) => {
      if (i !== itemIdx) return it;
      const rows = it.detailRows.map((r, idx) =>
        idx === rowIdx ? { ...r, qty: value } : r,
      );
      return { ...it, detailRows: rows, qty: sumRowsQty(rows) };
    }),
  );
};

const removeBatchRow = (itemIdx, rowIdx) => {
  setItems((prev) =>
    prev.map((it, i) => {
      if (i !== itemIdx) return it;
      const rows = it.detailRows.filter((_, idx) => idx !== rowIdx);
      return { ...it, detailRows: rows, qty: sumRowsQty(rows) };
    }),
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

    const shouldUseBatchSave =
      isBatchAccessUser &&
      (Array.isArray(items) ? items.some((item) => Boolean(item.isBatchWise)) : false);

    if (shouldUseBatchSave) {
      const invalidBatchItem = items.find(
        (item) =>
          Boolean(item.isBatchWise) &&
          !(item.detailRows || []).some(
            (row) => row.batchNo && Number(row.qty || 0) > 0,
          ),
      );

      if (invalidBatchItem) {
        Swal.fire({
          icon: "warning",
          title: "Batch Qty Required",
          text: `Add at least one batch quantity for "${invalidBatchItem.item_name}".`,
        });
        return;
      }
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

  const batchPayload = {
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
    details: items
      .filter((item) => Boolean(item.isBatchWise) || isBatchWisePO(item))
      .map((item) => ({
        rawMaterialId: item.rawMaterialId || 0,
        qty: Number(item.qty) || 0,
        batchList: (item.detailRows || [])
          .filter((row) => row.batchNo && Number(row.qty || 0) > 0)
          .map((row) => ({
            batchNo: row.batchNo,
            qty: Number(row.qty || 0),
          })),
      }))
      .filter((item) => item.batchList.length > 0),
  };

  const payload = {
    id: isEdit ? Number(editData.id) : -1,
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

  const response = shouldUseBatchSave
    ? await addOrUpdateBatchWisestoreissue(batchPayload)
    : await AddStoreIssueReturn(payload);

  if (response?.data?.success) {
  const savedSirId = isEdit ? editData.id : (response?.data?.data?.id || 0);
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
    text: response?.data?.msg || "Something went wrong",
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
                           .map(buildNewItem);

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
                items.map((item, i) => {
  const detailRows = item.detailRows || [];
  return (
    <Fragment key={item.rawMaterialId}>
      <tr className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors group">
        <td className="px-4 py-3 text-slate-400 text-xs">{i + 1}</td>
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
          <input
            type="text"
            inputMode="decimal"
            readOnly={item.isBatchWise}
            value={item.qty}
            onChange={(e) => handleQtyChange(i, e.target.value)}
            onBlur={() => {
              if (item.isBatchWise) return; // batch items: qty comes from batch rows
              const parsed = parseFloat(item.qty);
              if (item.qty === "" || item.qty === "." || isNaN(parsed) || parsed <= 0) {
                setItems((prev) =>
                  prev.map((it, idx) =>
                    idx === i
                      ? { ...it, qty: 1, total_price: (1 * it.price_per_unit).toFixed(2) }
                      : it,
                  ),
                );
              } else if (String(item.qty).endsWith(".")) {
                setItems((prev) =>
                  prev.map((it, idx) =>
                    idx === i
                      ? { ...it, qty: parsed, total_price: (parsed * it.price_per_unit).toFixed(2) }
                      : it,
                  ),
                );
              }
            }}
            className={`w-[100px] text-center px-1 py-1 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 ${item.isBatchWise ? "bg-slate-50" : ""}`}
          />
        </td>
        <td className="px-4 py-3 text-slate-500">{item.unit}</td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-2">
            {item.isBatchWise && (
              <button
                type="button"
                onClick={() => setExpandedItemIndex((p) => (p === i ? null : i))}
                className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 flex items-center justify-center"
                title={expandedItemIndex === i ? "Hide batch details" : "View batch details"}
              >
                {expandedItemIndex === i ? <ChevronUp size={13} /> : <ChevronDown  size={13} />}
              </button>
            )}
            <button
              onClick={() => handleDeleteItem(i)}
              className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
            >
              <Trash2 size={13} className="text-red-500" />
            </button>
          </div>
        </td>
      </tr>

      {item.isBatchWise && expandedItemIndex === i && (
        <tr className="bg-blue-50/40">
          <td colSpan={7} className="px-4 py-4">
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-blue-150 to-blue-50 p-3 shadow-inner">
            <div className="flex items-center justify-between gap-3 mb-3">
  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
    Batch Details
  </span>
  <div className="flex items-center gap-2">
    <Select
      mode="multiple"
      showSearch
      allowClear
      maxTagCount="responsive"
      placeholder="Select batches"
      value={batchAddSelection[i] || []}
      onChange={(vals) => setBatchAddSelection((p) => ({ ...p, [i]: vals }))}
      style={{ width: 360 }}
      options={(item.batchList || []).map((b) => {
        const used = detailRows.some((r) => r.batchNo === b.batchNo);
        const text = `${b.batchNo}${b.expiryDate ? ` (${b.expiryDate})` : ""} • Qty: ${b.qty ?? 0}`;
        return {
          value: b.batchNo,
          searchLabel: text,
          disabled: used,
          label: (
            <div className="flex justify-between items-center">
              <span className={used ? "text-gray-400" : ""}>{text}</span>
              {used && <span className="text-xs text-green-600 font-semibold">Added</span>}
            </div>
          ),
        };
      })}
      filterOption={(input, option) =>
        (option?.searchLabel ?? "").toLowerCase().includes(input.toLowerCase())
      }
    />
    <button
      type="button"
      onClick={() => addBatchRows(i, batchAddSelection[i])}
      disabled={!batchAddSelection[i]?.length}
      className="px-2.5 py-1.5 rounded-lg border border-blue-300 bg-white text-[10px] font-bold uppercase tracking-wide text-blue-700 shadow-sm hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      + Add {batchAddSelection[i]?.length > 1 ? `(${batchAddSelection[i].length})` : "Row"}
    </button>
  </div>
</div>

<div className="space-y-2">
  <div className="grid grid-cols-[minmax(0,1fr)_100px_120px_120px_36px] gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
    <div className="px-2">Batch Number</div>
    <div className="px-2">Unit</div>
    <div className="px-2">Available</div>
    <div className="px-2">Return Qty</div>
    <div />
  </div>

  {detailRows.length === 0 && (
    <div className="text-xs text-slate-400 px-2 py-2">
      Select batches above and click "+ Add Row".
    </div>
  )}

  {detailRows.map((row, rowIdx) => (
    <div
      key={`${i}-${row.batchNo}-${rowIdx}`}
      className="grid grid-cols-[minmax(0,1fr)_100px_120px_120px_36px] gap-2 items-center"
    >
      <div className="rounded-xl border border-blue-200 bg-slate-50 px-3 py-2 shadow-sm">
        <span className="text-xs font-medium text-slate-700">
          {`${row.batchNo}${row.date ? ` (${row.date})` : ""}`}
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 cursor-not-allowed">
        <span className="text-xs font-medium text-slate-600">
          {row.unit || item.unit || "—"}
        </span>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 cursor-not-allowed">
        <span className="text-xs font-semibold text-slate-600">{row.maxQty ?? "—"}</span>
      </div>

      <div className="rounded-xl border border-blue-200 bg-white px-2 py-1.5 shadow-sm">
        <input
          type="text"
          inputMode="decimal"
          value={row.qty ?? ""}
          onChange={(e) => updateBatchRowQty(i, rowIdx, e.target.value)}
          placeholder="Qty"
          className="w-full bg-transparent text-xs text-slate-700 focus:outline-none"
        />
      </div>

      <button
        type="button"
        onClick={() => removeBatchRow(i, rowIdx)}
        className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center"
        title="Delete row"
      >
        <Trash2 size={13} className="text-red-500" />
      </button>
    </div>
  ))}
</div>

             
            </div>
          </td>
        </tr>
      )}
    </Fragment>
  );
})
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
