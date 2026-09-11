import { useState, useEffect, useRef, Fragment } from "react";
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
  Pencil,
} from "lucide-react";
import { Select, Switch  } from "antd";
import { useLocation, useNavigate } from "react-router";
import {
  GetAllRawMaterial,
  OutsideContactName,
  AddAutoManualPOApi,
  GetAllApprovedPurchase,
} from "@/services/apiServices";
import AddContactName from "@/pages/master/MenuItemMaster/components/AddContactName";
import Swal from "sweetalert2";
import AddRawMaterial from "@/partials/modals/add-raw-material/AddRawMaterial";
import { Container } from "@/components/container";
import { SearchRawMaterial } from "@/services/apiServices";
import { usePermission } from "../../../hooks/usePermission";
import { useModuleAccess } from "../../../hooks/useModuleAccess";




const AddAutoManualPO = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [supplier, setSupplier] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    voucher_no: "",
    date: "",
    bill_no: "",
    supplier_id: "",
    account_name: "",
    invoice_type: "Tax Invoice",
    remark: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
const [menuItems, setMenuItems] = useState([]);
const [loadingItems, setLoadingItems] = useState(false);
const [dropdownPage, setDropdownPage] = useState(1);
const [hasMore, setHasMore] = useState(false);
const [loadingMore, setLoadingMore] = useState(false);
const [discountType, setDiscountType] = useState("percent");
const DROPDOWN_PAGE_SIZE = 100;

const [isPurchaseApproved, setIsPurchaseApproved] = useState(false);
 const [selectedApprovedPurchaseId, setSelectedApprovedPurchaseId] = useState(null);
 const [approvedPurchaseList, setApprovedPurchaseList] = useState([]);
 const [approvedPurchaseLoading, setApprovedPurchaseLoading] = useState(false);
 const [approvedPurchasePage, setApprovedPurchasePage] = useState(1);
 const [approvedPurchaseHasMore, setApprovedPurchaseHasMore] = useState(false);
 const [approvedPurchaseLoadingMore, setApprovedPurchaseLoadingMore] = useState(false);
 const APPROVED_PURCHASE_PAGE_SIZE = 50;

  const { hasModuleAccess } = useModuleAccess();
 const canAccessPurchaseApprove = hasModuleAccess("Purchase Approve");

  const navigate = useNavigate();
  const [discount, setDiscount] = useState(0);
  const [adjustment, setAdjustment] = useState(0);
  const userId = localStorage.getItem("userId");

  const location = useLocation();
  const editData = location.state?.editData || null;
  const isEdit = !!editData;

  const backDatePermission = usePermission("Lock Back Date Entry");
const isBackDateLocked = backDatePermission.add || backDatePermission.edit;
const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (!editData) return;
    setForm({
      voucher_no: editData.voucher || "",
      date: editData.podate
        ? editData.podate.split("/").reverse().join("-") // dd/mm/yyyy → yyyy-mm-dd
        : "",
      bill_no: editData.billno || "",
      supplier_id: editData.supplierId || "",
      account_name: editData.supplierName || "",
      invoice_type: editData.invoicetype || "Tax Invoice",
      remark: editData.remarks || "",
    });
    setDiscount(editData.discountper || 0);
    setAdjustment(editData.adjustamount || 0);

    setIsPurchaseApproved(!!editData.isPurchaseApprove);
  setSelectedApprovedPurchaseId(editData.purchaseApproveRequestId || null);

    const prefilledItems = (editData.details || []).map((d) => ({
  rawMaterialId: d.rawMaterialId || 0,
  rawMaterialCatId: d.rawMaterialCatId || 0,   
  unitId: d.unitId || 0,                        
  item_name: d.rawMaterialName || "",
  hsc_sac: d.hsccode || "",
  cgst: d.cgst || 0,
  sgst: d.sgst || 0,
  igst: d.igst || 0,
  qty: d.qty || "",
  unit: d.unitName || "",
  price_per_unit: d.price || "",
  other_charges: d.othercharge || 0,
  total_price: String(d.total || 0),
  originalQty: d.qty || 0,
}));

    setItems(prefilledItems);
  }, [editData]);

  useEffect(() => {
    fetchSupplier();
  }, []);

  const fetchSupplier = async () => {
    try {
      const data = await OutsideContactName(3, userId);
      setSupplier(data?.data?.data["Party Details"] || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };


const fetchApprovedPurchases = (page = 0, append = false) => {
  page === 0 ? setApprovedPurchaseLoading(true) : setApprovedPurchaseLoadingMore(true);
  GetAllApprovedPurchase(userId, page, APPROVED_PURCHASE_PAGE_SIZE)
    .then((res) => {
      const data = res?.data?.data || {};
    const list = data.content || [];
    setApprovedPurchaseList((prev) => (append ? [...prev, ...list] : list));
    setApprovedPurchasePage(page);
   
    setApprovedPurchaseHasMore(data.last === false);
    })
    .catch(() => {
      setApprovedPurchaseList([]);
      setApprovedPurchaseHasMore(false);
    })
    .finally(() => {
      setApprovedPurchaseLoading(false);
      setApprovedPurchaseLoadingMore(false);
    });
};


useEffect(() => {
  if (isPurchaseApproved && approvedPurchaseList.length === 0) {
    fetchApprovedPurchases(0, false);
  }
}, [isPurchaseApproved]);

const handleTogglePurchaseApproved = (checked) => {
  setIsPurchaseApproved(checked);
  setSelectedApprovedPurchaseId(null);

  setDropdownPage(0);
  setMenuItems([]);
  setHasMore(false);
  FetchSearchDropdown(searchQuery, 1, false, checked); 
};



const FetchSearchDropdown = (
searchTerm = "",
page = 1,
append = false,
purchaseApprovedOverride = isPurchaseApproved,
purchaseApproveIdOverride = selectedApprovedPurchaseId,
) => {
  page === 1 ? setLoadingItems(true) : setLoadingMore(true);
 SearchRawMaterial(
   true,
   userId,
   page,
   DROPDOWN_PAGE_SIZE,
   searchTerm,
   undefined,
   purchaseApprovedOverride,
   purchaseApprovedOverride ? purchaseApproveIdOverride || "" : "",
 )
     .then((res) => {
      const data = res?.data?.data || {};
      const items = data["Raw Material Details"] || [];
      const total = data.totalItems || 0;
      setMenuItems((prev) => (append ? [...prev, ...items] : items));
      setDropdownPage(page);
      setHasMore(page * DROPDOWN_PAGE_SIZE < total);
    })
    .catch(() => { setMenuItems([]); setHasMore(false); })
    .finally(() => { setLoadingItems(false); setLoadingMore(false); });
};

useEffect(() => {
  const timer = setTimeout(() => {
    if (searchQuery.trim()) {
      setDropdownPage(0); setMenuItems([]); setHasMore(false);
      FetchSearchDropdown(searchQuery, 1, false, isPurchaseApproved);
    } else {
      setMenuItems([]); setHasMore(false);
    }
  }, 500);
  return () => clearTimeout(timer);
}, [searchQuery, isPurchaseApproved]);


useEffect(() => {
  if (!isPurchaseApproved) return;
  setDropdownPage(0);
  setMenuItems([]);
  setHasMore(false);
  FetchSearchDropdown(searchQuery, 1, false, true, selectedApprovedPurchaseId);
}, [selectedApprovedPurchaseId]);


const calcTotal = (qty, price, other, cgst, sgst, igst) => {
  const base = (parseFloat(qty) || 0) * (parseFloat(price) || 0);
  const otherAmt = parseFloat(other) || 0;
  const gstRate = (parseFloat(cgst) || 0) + (parseFloat(sgst) || 0) + (parseFloat(igst) || 0);
  return (base + otherAmt + (base * gstRate) / 100).toFixed(2);
};

const handleSelectItem = (rawItem) => {
  const newRow = {
    rawMaterialId: rawItem.id || rawItem.rawMaterialId || 0,
    rawMaterialCatId: rawItem.rawMaterialCatId || rawItem.categoryId || 0, // ← add this
    item_name: rawItem.nameEnglish || "",
    hsc_sac: rawItem.hsc_sac || rawItem.hsn_sac || "",
    cgst: rawItem.cgst || 0,
    sgst: rawItem.sgst || 0,
    igst: rawItem.igst || 0,
    qty: "",
    unit: rawItem.unit?.nameEnglish || rawItem.unit || "",
    unitId: rawItem.unitId || rawItem.unit?.id || 0,  // ← already there, confirm key name
    price_per_unit: rawItem.supplierRate || rawItem.price || "",
    other_charges: 0,
    total_price: "0",
  };
  setItems((prev) => [...prev, newRow]);
};
const updateItem = (index, field, value) => {
  setItems((prev) =>
    prev.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      updated.total_price = calcTotal(
        updated.qty, updated.price_per_unit, updated.other_charges,
        updated.cgst, updated.sgst, updated.igst,
      );
      return updated;
    }),
  );
};

  const handleAddItem = (item, index = null) => {
    if (!item) return; 
    if (index !== null) {
      setItems((prev) =>
        prev.map((it, i) =>
          i === index ? { ...item, originalQty: it.originalQty ?? it.qty } : it,
        ),
      );
    } else {
      setItems((prev) => [...prev, item]);
    }
    setEditingIndex(null);
    setEditingItem(null);
  };

  const handleDeleteItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + parseFloat(item?.total_price || 0),
    0,
  );
  const discountAmount =
  discountType === "percent"
    ? (totalAmount * (parseFloat(discount) || 0)) / 100
    : parseFloat(discount) || 0;
  const finalAmount =
    totalAmount - discountAmount + (parseFloat(adjustment) || 0);

  const [saving, setSaving] = useState(false);

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


   if (isBackDateLocked && form.date && form.date < todayStr) {
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

  if (isPurchaseApproved && !selectedApprovedPurchaseId) {
 Swal.fire({
   icon: "warning",
   title: "Validation",
   text: "Please select an approved purchase request.",
   confirmButtonColor: "#3085d6",
 });
 return;
 }


  try {
    setSaving(true);

    const payload = {
      id: isEdit ? editData.id : -1,
      userId: parseInt(userId),
      partyId: form.supplier_id,         
      voucherDate: form.date               
        ? form.date.split("-").reverse().join("/")
        : "",
      billno: form.bill_no,
      invoicetype: form.invoice_type,
      remarks: form.remark,
      subamount: totalAmount,
      discountper: parseFloat(discount) || 0,
      discountval: discountAmount,
      adjustamount: parseFloat(adjustment) || 0,
      finalamount: finalAmount,
      status: "",                          
      sotId: null,                            
      eventId: null,   
      isPurchaseApprove: isPurchaseApproved,
     purchaseApproveRequestId: isPurchaseApproved ? selectedApprovedPurchaseId : 0,                       
      details: items.map((item) => ({
        id: 0,
        rawMaterialId: item.rawMaterialId || 0,
        rawMaterialCatId: item.rawMaterialCatId || 0,  
        unitId: item.unitId || 0,          
        partyId: form.supplier_id,         
        hsccode: item.hsc_sac || "",
        cgst: parseFloat(item.cgst) || 0,
        sgst: parseFloat(item.sgst) || 0,
        igst: parseFloat(item.igst) || 0,
        qty: parseFloat(item.qty) || 0,
        price: parseFloat(item.price_per_unit) || 0,
        othercharge: parseFloat(item.other_charges) || 0,
        total: parseFloat(item.total_price) || 0,
      })),
    };

  const response = await AddAutoManualPOApi(payload);

if (response?.data?.success === true) {
  await Swal.fire({
    icon: "success",
    title: "Success!",
    text: response?.data?.message || (isEdit
      ? "Auto Manual PO updated successfully."
      : "Auto Manual PO saved successfully."),
    confirmButtonColor: "#16a34a",
  });
  navigate("/stock-management/automanualpo");
} else {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: response?.data?.message || "Something went wrong. Please try again.",
    confirmButtonColor: "#d33",
  });
}
  } catch (error) {
    console.error("Save failed:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to save auto manual PO. Please try again.",
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
    <Fragment>

        <Container>


        <div className="mx-auto space-y-5">
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 rounded-t-2xl overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-700">
                  <FileText size={17} className="text-white" />
                </div>
                <h2 className="text-green-900 font-bold text-base tracking-tight">
                  {isEdit ? "Edit Auto Manual PO" : "Auto manual PO Information"}
                </h2>{" "}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAccountModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <User size={16} /> Add Account
                </button>
                <button
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 shadow-sm bg-primary"
                >
                  <Plus size={16} /> Add Item
                </button>
                <button
                  onClick={() => navigate("/stock-management/automanualpo")}
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
        onChange={handleFormChange}
        className={fieldClass}
      />
    </div>
  )}
              <div>
                <label className={labelClass}>
                  <Calendar size={16} /> Date
                </label>
                <input
                  name="date"
                  type="date"
                    min={isBackDateLocked ? todayStr : undefined}
                  value={form.date}
                  onChange={handleFormChange}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  <Receipt size={16} /> Bill No.
                </label>
                <input
                  name="bill_no"
                  value={form.bill_no}
                  onChange={handleFormChange}
                  placeholder="Enter bill number"
                  className={fieldClass}
                />
              </div>
  
              {/* ── Account Name (Supplier) ── */}
              <div className="col-span-2">
                <label className={labelClass}>
                  <User size={16} /> Account Name (Supplier)
                </label>
                <Select
                  showSearch
                  allowClear
                  placeholder="Search supplier..."
                  style={{ width: "100%", height: "38px" }}
                  value={form.supplier_id || undefined}
                  onChange={(val, option) =>
                    setForm((prev) => ({
                      ...prev,
                      supplier_id: val,
                      account_name: option?.label || "",
                    }))
                  }
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  options={supplier.map((s) => ({
                    value: s.id,
                    label: s.nameEnglish,
                  }))}
                  dropdownRender={(menu) => <>{menu}</>}
                />
              </div>
  
              <div>
                <label className={labelClass}>
                  <Tag size={16} /> Invoice Type
                </label>
                <select
                  name="invoice_type"
                  value={form.invoice_type}
                  onChange={handleFormChange}
                  className={fieldClass}
                >
                  <option>Tax Invoice</option>
                  <option>Retail Invoice</option>
                </select>
              </div>
              <div>
    {canAccessPurchaseApprove && (   
      <div>

   <label className={labelClass}>
    <Tag size={16} /> Purchase Approved
  </label>
  <div className="flex items-center h-9">
    <Switch
      checked={isPurchaseApproved}
      onChange={handleTogglePurchaseApproved}
    />
    <span className="ml-2 text-xs text-slate-500">
      {isPurchaseApproved ? "On" : "Off"}
    </span>
  </div> 
      </div>        
    )}
</div>

{isPurchaseApproved && (
  <div className="col-span-2">
    <label className={labelClass}>
      <FileText size={16} /> Approved Purchase Request
      <span className="text-red-500">*</span>
    </label>
    <Select
      showSearch={false}
      placeholder="Select approved purchase request..."
      style={{ width: "100%", height: "38px" }}
      value={selectedApprovedPurchaseId || undefined}
      loading={approvedPurchaseLoading}
      status={!selectedApprovedPurchaseId ? "warning" : ""}
      onChange={(val) => setSelectedApprovedPurchaseId(val)}
      
      options={approvedPurchaseList.map((p) => ({
      value: p.id,
      label: `${p.requestCode || `Request #${p.id}`}${
        p.startDate ? ` (${p.startDate}${p.endDate && p.endDate !== p.startDate ? " – " + p.endDate : ""})` : ""
      }`,
    }))}
      
      onPopupScroll={(e) => {
     const target = e.target;
     if (
       target.scrollTop + target.offsetHeight >= target.scrollHeight - 10 &&
       approvedPurchaseHasMore &&
       !approvedPurchaseLoadingMore
     ) {
       FetchSearchDropdown(searchQuery, dropdownPage + 1, true, isPurchaseApproved, selectedApprovedPurchaseId);
     }
   }}
   notFoundContent={
     approvedPurchaseLoading
       ? "Loading..."
       : "No approved requests found"
   }
   dropdownRender={(menu) => (
     <>
       {menu}
       {approvedPurchaseLoadingMore && (
         <div className="text-center text-xs text-slate-400 py-2">
           Loading more…
         </div>
       )}
     </>
   )}
    />
  </div>
)}
  
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
  
          {/* ── Purchase Details Card ── */}
         {/* ── Purchase Details Card ── */}
<div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary">
        <ShoppingCart size={17} className="text-white" />
      </div>
      <h2 className="text-primary font-bold text-base tracking-tight">
        Auto Manual PO Details
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
      style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}
    >
      <Save size={15} />
      {saving ? "Saving…" : isEdit ? "Update" : "Save"}
    </button>
  </div>

  {/* Search Bar */}
  <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3">
    <div className="relative w-full max-w-md">
      <Select
        showSearch
        placeholder="Search & add item..."
        value={undefined}
        filterOption={false}
        onSearch={(val) => setSearchQuery(val)}
        onDropdownVisibleChange={(open) => {
          if (open && menuItems.length === 0) FetchSearchDropdown("", 1, false, isPurchaseApproved);
        }}
        onSelect={(value, option) => {
          handleSelectItem(option.raw);
          setSearchQuery("");
        }}
        notFoundContent={loadingItems ? "Loading..." : searchQuery ? "No items found" : "Start typing or select item"}
        style={{ width: "100%", maxWidth: "400px" }}
        options={menuItems.map((item) => ({
          value: item.id,
          label: (
            <div className="flex justify-between">
              <span>{item.nameEnglish}</span>
              {item.supplierRate > 0 && <span className="text-xs text-gray-400">₹{item.supplierRate}</span>}
            </div>
          ),
          raw: item,
        }))}
        onPopupScroll={(e) => {
          const target = e.target;
          if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10 && hasMore && !loadingMore) {
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

  {/* Table */}
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-100">
          {["#", "Item Name", "HSC/SAC", "CGST%", "SGST%", "IGST%", "Qty", "Unit", "Price/Unit", "Other ₹", "GST Amt", "Total", ""].map((h) => (
            <th key={h} className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={13} className="px-4 py-14 text-center text-slate-400 text-sm">
              <div className="flex flex-col items-center gap-2">
                <Package size={36} className="text-slate-200" />
                <p className="font-medium text-slate-400">No items added yet</p>
                <p className="text-xs text-slate-300">Use the search bar above to add items</p>
              </div>
            </td>
          </tr>
        ) : (
          items.map((item, i) => {
           if (!item) return null; // skip any corrupted/undefined row entirely
         const base = (parseFloat(item.qty) || 0) * (parseFloat(item.price_per_unit) || 0);
         const gstRate = (parseFloat(item.cgst) || 0) + (parseFloat(item.sgst) || 0) + (parseFloat(item.igst) || 0);
            const gstAmt = (base * gstRate) / 100;
            return (
              <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors group">
                <td className="px-3 py-2 text-xs text-slate-400 font-medium w-8">{i + 1}</td>
                <td className="px-3 py-2 min-w-[160px]"><span className="font-semibold text-slate-800 text-sm">{item.item_name}</span></td>
                <td className="px-1 py-2 w-24">
                  <input type="text" value={item.hsc_sac} onChange={(e) => updateItem(i, "hsc_sac", e.target.value)} placeholder="—"
                    className="w-full px-2 py-1.5 text-sm border border-transparent rounded-lg bg-transparent hover:border-slate-200 hover:bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-300 transition-all text-left" />
                </td>
                {["cgst", "sgst", "igst"].map((tax) => (
                  <td key={tax} className="px-1 py-2 w-16">
                    <input type="number" value={item[tax]} onChange={(e) => updateItem(i, tax, e.target.value)} placeholder="0"
                      className="w-full px-2 py-1.5 text-sm border border-transparent rounded-lg bg-transparent hover:border-slate-200 hover:bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-300 transition-all text-center" />
                  </td>
                ))}
                <td className="px-1 py-2 w-20">
                  <input type="tel" value={item.qty} onChange={(e) => updateItem(i, "qty", e.target.value)} placeholder="0"
                    className={`w-full px-2 py-1.5 text-sm border rounded-lg text-center transition-all focus:outline-none focus:ring-1 ${!item.qty ? "border-amber-300 bg-amber-50 text-amber-700 placeholder-amber-400" : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-blue-300"}`} />
                </td>
                <td className="px-3 py-2 w-20"><span className="text-xs text-slate-500 font-medium">{item.unit || "—"}</span></td>
                <td className="px-1 py-2 w-28">
                  <input type="tel" value={item.price_per_unit} onChange={(e) => updateItem(i, "price_per_unit", e.target.value)} placeholder="0.00"
                    className={`w-full px-2 py-1.5 text-sm border rounded-lg text-center transition-all focus:outline-none focus:ring-1 ${!item.price_per_unit ? "border-amber-300 bg-amber-50 text-amber-700 placeholder-amber-400" : "border-transparent bg-transparent hover:border-slate-200 hover:bg-slate-50 focus:border-blue-400 focus:bg-white focus:ring-blue-300"}`} />
                </td>
                <td className="px-1 py-2 w-24">
                  <input type="number" value={item.other_charges} onChange={(e) => updateItem(i, "other_charges", e.target.value)} placeholder="0"
                    className="w-full px-2 py-1.5 text-sm border border-transparent rounded-lg bg-transparent hover:border-slate-200 hover:bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-300 transition-all text-center" />
                </td>
                <td className="px-3 py-2 w-24">
                  <span className={`text-xs font-semibold ${gstAmt > 0 ? "text-orange-500" : "text-slate-300"}`}>
                    {gstAmt > 0 ? `₹ ${gstAmt.toFixed(2)}` : "—"}
                  </span>
                </td>
                <td className="px-3 py-2 w-28">
                  <span className={`text-sm font-bold ${parseFloat(item.total_price) > 0 ? "text-blue-700" : "text-slate-300"}`}>
                    ₹ {parseFloat(item.total_price || 0).toFixed(2)}
                  </span>
                </td>
                <td className="px-3 py-2 w-10">
                  <button onClick={() => handleDeleteItem(i)}
                    className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 size={13} className="text-red-500" />
                  </button>
                </td>
              </tr>
            );
          })
        )}
      </tbody>

      {/* Table footer totals row */}
      {items.length > 0 && (() => {
        const totalGst = items.reduce((s, item) => {
          const base = (parseFloat(item.qty) || 0) * (parseFloat(item.price_per_unit) || 0);
          const gstRate = (parseFloat(item.cgst) || 0) + (parseFloat(item.sgst) || 0) + (parseFloat(item.igst) || 0);
          return s + (base * gstRate) / 100;
        }, 0);
        const totalOther = items.reduce((s, item) => s + (parseFloat(item?.other_charges) || 0), 0);
        return (
          <tfoot>
            <tr className="bg-slate-50/80 border-t border-slate-200">
              <td colSpan={9} className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Totals</td>
              <td className="px-3 py-2 text-xs font-bold text-slate-700 text-center">₹ {totalOther.toFixed(2)}</td>
              <td className="px-3 py-2 text-xs font-bold text-orange-500">₹ {totalGst.toFixed(2)}</td>
              <td className="px-3 py-2 text-sm font-bold text-blue-700">₹ {totalAmount.toFixed(2)}</td>
              <td />
            </tr>
          </tfoot>
        );
      })()}
    </table>
  </div>

  {/* Summary Footer */}
  {items.length > 0 && (
    <div className="border-t border-slate-100 bg-slate-50/50">
      <div className="flex justify-end">
        <div className="w-80 divide-y divide-slate-100">
          <div className="flex items-center justify-between px-6 py-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sub Total</span>
            <span className="text-sm font-bold text-slate-800">₹ {totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex flex-col gap-2 px-6 py-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Discount</span>
            <div className="flex items-center w-full gap-2">
              <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs font-semibold">
                <button onClick={() => { setDiscountType("percent"); setDiscount(0); }}
                  className={`px-2 py-1 transition-colors ${discountType === "percent" ? "bg-blue-500 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>%</button>
                <button onClick={() => { setDiscountType("amount"); setDiscount(0); }}
                  className={`px-2 py-1 transition-colors ${discountType === "amount" ? "bg-blue-500 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>₹</button>
              </div>
              <input type="tel" value={discount} onChange={(e) => setDiscount(e.target.value)}
                className="w-24 px-2 py-1 text-xs text-start rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <span className="text-sm font-semibold text-red-500">- ₹ {discountAmount.toFixed(2)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Adjustment</span>
            <input type="tel" value={adjustment} onChange={(e) => setAdjustment(e.target.value)}
              className="w-24 px-2 py-1 text-xs text-right rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
          </div>
          <div className="flex items-center justify-between px-6 py-4 rounded-b-2xl"
            style={{ background: "linear-gradient(135deg, #0f766e 0%, #0d9488 100%)" }}>
            <span className="text-xs font-bold text-white uppercase tracking-wider">Final Amount</span>
            <span className="text-lg font-black text-white">₹ {finalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
        </div>
  
        {/* Add New Supplier Modal */}
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
          refreshData={handleAddItem}
        />
       
        </Container>

    </Fragment>
  
  );
};

export default AddAutoManualPO;
