import { ArrowLeft, Plus, Save, X, Package, FileText, Hash, Calendar, User, Tag, AlignLeft, ShoppingCart } from "lucide-react";
import { Select } from "antd";
import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router";
import { FormattedMessage } from "react-intl";
import { GetAllRawMaterials, GetEventMaster, GetRawMaterialcategory, GetStockTypeByUserId, AddStoreReq } from "@/services/apiServices";
import { usePermission } from "@/hooks/usePermission";
import { useStockTypePermission } from "@/hooks/useStockTypePermission";
import AddRawMaterial from "@/partials/modals/add-raw-material/AddRawMaterial";

const nameFor = (item, language) => language === "gu" ? item.nameGujarati || item.rawMaterialNameGuj || item.nameEnglish || item.item_name || "" : language === "hi" ? item.nameHindi || item.rawMaterialNameHin || item.nameEnglish || item.item_name || "" : item.nameEnglish || item.rawMaterialNameEng || item.item_name || "Unnamed Item";

const AddStoreRequisition = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editData = location.state?.editData;
  const isEdit = Boolean(editData);
  const userId = localStorage.getItem("userId");
  const auth = JSON.parse(localStorage.getItem("auth-storage") || "{}");
  const isChildUser = auth?.state?.user?.ischilduser ?? false;
  const { filterStockTypes } = useStockTypePermission();
  const backDatePermission = usePermission("Lock Back Date Entry");
  const [language, setLanguage] = useState(localStorage.getItem("lang") || "en");
  const [suppliers, setSuppliers] = useState([]);
  const [stockTypes, setStockTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("ALL");
  const [catalog, setCatalog] = useState([]);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [addRawMaterial, setAddRawMaterial] = useState(false);
  const [form, setForm] = useState({ voucher: "", date: new Date(), party_id: null, party_name: "", stock_type_id: "", invoice_type: "", remark: "" });

  useEffect(() => {
    const handler = () => setLanguage(localStorage.getItem("lang") || "en");
    window.addEventListener("languageChange", handler);
    return () => window.removeEventListener("languageChange", handler);
  }, []);

  useEffect(() => {
    GetStockTypeByUserId(Number(userId), "").then((response) => setStockTypes(Array.isArray(response?.data?.data) ? response.data.data : [])).catch(console.error);
    GetEventMaster(userId, isChildUser).then((response) => setSuppliers(response?.data?.data?.["Event Details"] || [])).catch(console.error);
    GetRawMaterialcategory(userId).then((response) => setCategories(response?.data?.data?.["Raw Material Category Details"] || [])).catch(console.error);
  }, []);

  useEffect(() => {
    if (!editData || !suppliers.length) return;
    setForm({ voucher: editData.crcode || "", date: editData.crdate ? new Date(editData.crdate.split("/").reverse().join("-")) : new Date(), party_id: editData.partyId || null, party_name: editData.partyName || "", stock_type_id: editData.stockTypeId || "", invoice_type: editData.invoicetype || "", remark: editData.remarks || "" });
    setItems((editData.details || []).map((item) => ({ rawMaterialId: item.rawMaterialId, item_name: item.rawMaterialName || item.rawMaterialNameEng || "", nameEnglish: item.rawMaterialNameEng || item.rawMaterialName || "", nameGujarati: item.rawMaterialNameGuj || "", nameHindi: item.rawMaterialNameHin || "", qty: item.qty || "", unit: item.unitName || "", originalQty: item.qty || 0 })));
  }, [editData, suppliers]);

  const fetchRawMaterials = (page = 1, append = false) => {
    if (!categoryId) return;

    if (page === 1) {
      setLoadingItems(true);
    } else {
      setLoadingMore(true);
    }

    GetAllRawMaterials(page, 100, categoryId === "ALL" ? 0 : categoryId, query, userId)
      .then((response) => {
        const payload = response?.data?.data || response?.data || response || {};
        const data = payload?.["Raw Material Details"] || [];
        const totalPages = payload?.totalPages ?? 1;

        setCatalog((current) => (append ? [...current, ...data] : data));
        setPageNo(page);
        setHasMore(page < totalPages);
      })
      .catch(() => {
        setCatalog((current) => (append ? current : []));
        setHasMore(false);
      })
      .finally(() => {
        setLoadingItems(false);
        setLoadingMore(false);
      });
  };

  useEffect(() => {
    if (!categoryId) {
      setCatalog([]);
      setHasMore(false);
      return;
    }

    const timer = setTimeout(() => {
      fetchRawMaterials(1, false);
    }, 300);

    return () => clearTimeout(timer);
  }, [categoryId, query]);

  const addItem = (raw) => {
    const id = raw.id || raw.rawMaterialId;
    if (items.some((item) => item.rawMaterialId === id)) return;
    setItems((current) => [...current, { rawMaterialId: id, item_name: nameFor(raw, language), nameEnglish: raw.nameEnglish || "", nameGujarati: raw.nameGujarati || "", nameHindi: raw.nameHindi || "", qty: "", unit: raw.unit?.nameEnglish || raw.unit || "" }]);
  };
  const updateQty = (id, qty) => setItems((current) => current.map((item) => item.rawMaterialId === id ? { ...item, qty } : item));
  const addOrUpdateQty = (raw, qty) => setItems((current) => {
    const id = raw.id || raw.rawMaterialId;
    const existing = current.find((item) => item.rawMaterialId === id);
    if (existing) return current.map((item) => item.rawMaterialId === id ? { ...item, qty } : item);
    return [...current, { rawMaterialId: id, item_name: nameFor(raw, language), nameEnglish: raw.nameEnglish || "", nameGujarati: raw.nameGujarati || "", nameHindi: raw.nameHindi || "", qty, unit: raw.unit?.nameEnglish || raw.unit || "" }];
  });
  const formatDate = (date) => `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;

  const save = async () => {
    if (!form.stock_type_id) return Swal.fire({ icon: "warning", title: "Validation", text: "Please select a stock type." });
    const selected = items.filter((item) => Number(item.qty) > 0);
    if (!selected.length) return Swal.fire({ icon: "warning", title: "Validation", text: "Please enter a quantity for at least one item." });
    if (backDatePermission.add || backDatePermission.edit) {
      const chosen = formatDate(form.date).split("/").reverse().join("-");
      if (chosen < new Date().toISOString().split("T")[0]) return Swal.fire({ icon: "warning", title: "Validation", text: "Back-dated entries are not allowed." });
    }
    try {
      setSaving(true);
      await AddStoreReq({ id: isEdit ? editData.id : 0, userId: Number(userId), voucher: form.voucher, crdate: formatDate(form.date), partyId: form.party_id, stockTypeId: form.stock_type_id, invoicetype: form.invoice_type, remarks: form.remark, details: selected.map((item) => ({ rawMaterialId: item.rawMaterialId, qty: Number(item.qty) })) });
      await Swal.fire({ icon: "success", title: "Success!", text: isEdit ? "Store Requisition updated successfully." : "Store Requisition saved successfully.", confirmButtonColor: "#16a34a" });
      navigate("/stock-management/store-requisition");
    } catch (error) { console.error(error); Swal.fire({ icon: "error", title: "Error", text: "Failed to save Store Requisition." }); } finally { setSaving(false); }
  };

  const field = "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400";
  const label = "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5";
  const allowedTypes = filterStockTypes(stockTypes).map((type) => ({ value: type.stocktypeid ?? type.stockTypeId ?? type.id, label: nameFor(type, language) }));

  return <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6">
    <div className="mx-auto space-y-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-700"><FileText size={17} className="text-white" /></div><h2 className="text-blue-900 font-bold"><FormattedMessage id="STORE_REQUISITION.ADD" defaultMessage={isEdit ? "Edit Store Requisition" : "Add Store Requisition"} /></h2></div><div className="flex items-center gap-2"><button onClick={() => setAddRawMaterial(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"><Plus size={16} /><FormattedMessage id="RAW_MATERIAL.ADD" defaultMessage="New Raw Material" /></button><button onClick={() => navigate("/stock-management/store-requisition")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"><FormattedMessage id="COMMON.BACK" defaultMessage="Back" /><ArrowLeft size={16} /></button></div></div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {isEdit && <div><label className={label}><Hash size={16} /> SR Code</label><input disabled value={form.voucher} className={field} /></div>}
          <div><label className={label}><Calendar size={16} /> Date</label><DatePicker selected={form.date} onChange={(date) => setForm({ ...form, date })} dateFormat="dd/MM/yyyy" className={field} wrapperClassName="w-full" minDate={(backDatePermission.add || backDatePermission.edit) ? new Date() : undefined} /></div>
          <div className={isEdit ? "" : "md:col-span-2"}><label className={label}><User size={16} /> Party Name</label><Select showSearch allowClear placeholder="Search party..." style={{ width: "100%", height: "38px" }} value={form.party_id} onChange={(value, option) => setForm({ ...form, party_id: value, party_name: option?.label || "" })} filterOption={(input, option) => option?.searchText?.toLowerCase().includes(input.toLowerCase())} options={suppliers.map((entry) => ({ value: entry.party.id, label: nameFor(entry.party, language), searchText: `${entry.party.nameEnglish || ""} ${entry.party.nameGujarati || ""} ${entry.party.nameHindi || ""} ${entry.venue?.nameEnglish || ""}`, raw: entry }))} optionRender={(option) => { const entry = option.data.raw; return <div className="flex flex-col py-0.5"><span className="font-semibold text-slate-800 text-sm">{nameFor(entry.party, language)}</span><div className="flex items-center gap-2 mt-0.5">{entry.eventStartDateTime && <span className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={11} />{entry.eventStartDateTime.split(" ")[0]}</span>}{entry.venue?.nameEnglish && <span className="text-xs text-blue-500 font-medium">· {nameFor(entry.venue, language)}</span>}</div></div>; }} /></div>
          <div><label className={label}><Tag size={16} /> Stock Type</label><Select showSearch allowClear className="w-full" value={form.stock_type_id || undefined} onChange={(value) => setForm({ ...form, stock_type_id: value })} options={allowedTypes} /></div>
          <div className="md:col-span-3"><label className={label}><AlignLeft size={16} /> Remarks</label><input value={form.remark} onChange={(event) => setForm({ ...form, remark: event.target.value })} className={field} placeholder="Optional remark..." /></div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"><div className="flex items-center justify-between px-6 py-4 border-b border-slate-100"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary"><ShoppingCart size={17} className="text-white" /></div><h2 className="text-blue-900 font-bold text-base tracking-tight">Store Requisition Details</h2>{items.length > 0 && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">{items.length} item{items.length !== 1 ? "s" : ""}</span>}</div><button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold bg-green-700 disabled:bg-gray-400"><Save size={16} />{saving ? "Saving..." : <FormattedMessage id={isEdit ? "COMMON.UPDATE" : "COMMON.SAVE"} defaultMessage={isEdit ? "Update" : "Save"} />}</button></div>
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center gap-3">
          <Select showSearch value={categoryId || "ALL"} onChange={(value) => { setCategoryId(value || "ALL"); setQuery(""); }} className="w-56" options={[{ label: "All", value: "ALL" }, ...categories.map((category) => ({ label: nameFor(category, language), value: category.id }))]} />
          {categoryId === "ALL" ? (
            <Select
              showSearch
              filterOption={false}
              showArrow={false}
              loading={loadingItems}
              placeholder="Search & add item..."
              searchValue={query}
              onSearch={setQuery}
              onSelect={(value, option) => addItem(option.raw)}
              onPopupScroll={(event) => {
                const target = event.target;
                if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10 && hasMore && !loadingMore) {
                  fetchRawMaterials(pageNo + 1, true);
                }
              }}
              notFoundContent={loadingItems ? <div className="flex items-center gap-2 text-xs text-slate-500"><span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" /> Loading...</div> : "Type to search"}
              className="flex-1"
              options={catalog.map((item) => ({ value: item.id, label: nameFor(item, language), raw: item }))}
            />
          ) : (
            <input type="text" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search item name..." className="w-full max-w-sm px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
          )}
        </div>
        {categoryId !== "ALL" && <div className="px-6 py-3 border-b border-slate-100">{loadingItems ? <div className="flex items-center gap-2 py-4 text-sm text-slate-400"><span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" /> Loading items...</div> : catalog.length === 0 ? <p className="py-4 text-sm text-slate-400">No items found.</p> : <div className="rounded-xl border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-50 border-b border-slate-100">{[0, 1, 2].map((column) => <div key={column} className={`grid grid-cols-[2.5rem_1fr_6rem_4.5rem] px-3 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider ${column > 0 ? "md:border-l md:border-slate-100" : ""}`}><span className="text-center">Sr</span><span>Item Name</span><span className="text-center">Qty</span><span className="text-center">Unit</span></div>)}</div>
          <div className="max-h-[520px] overflow-y-auto" onScroll={(event) => {
            const target = event.target;
            if (target.scrollTop + target.clientHeight >= target.scrollHeight - 10 && hasMore && !loadingMore) {
              fetchRawMaterials(pageNo + 1, true);
            }
          }}><div className="grid grid-cols-1 md:grid-cols-3">{catalog.map((item, index) => { const selected = items.find((row) => row.rawMaterialId === item.id); const column = index % 3; const displayName = nameFor(item, language); const filled = selected?.qty !== undefined && selected?.qty !== "" && Number(selected.qty) > 0; return <div key={item.id} className={`grid grid-cols-[2.5rem_1fr_6rem_4.5rem] items-center px-3 py-2 border-b border-slate-50 transition-colors ${column > 0 ? "md:border-l md:border-slate-100" : ""} ${filled ? "bg-emerald-50/40" : "hover:bg-blue-50/20"}`}><span className="text-center text-xs text-slate-400 font-medium">{index + 1}</span><span className="font-semibold text-slate-800 text-sm truncate pr-2" title={displayName}>{displayName}</span><input type="tel" value={selected?.qty || ""} onChange={(event) => addOrUpdateQty(item, event.target.value)} placeholder="0" className={`w-full px-2 py-1 text-sm border rounded-lg text-center transition-all focus:outline-none focus:ring-1 ${filled ? "border-emerald-300 bg-white text-emerald-700 focus:border-emerald-400 focus:ring-emerald-200" : "border-blue-300 bg-blue-50 text-blue-700 placeholder-blue-400 focus:border-blue-400 focus:ring-blue-200"}`} /><span className="text-center text-xs text-slate-500 font-medium truncate">{item.unit?.nameEnglish || "—"}</span></div>; })}</div>{loadingMore && <div className="flex items-center justify-center gap-2 py-3 text-xs text-slate-400"><span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500" /> Loading more...</div>}</div>
        </div>}</div>}
        {items.length === 0 ? <div className="px-6 py-14 text-center text-slate-400"><Package size={36} className="mx-auto text-slate-200" /><p className="mt-2">No items added yet</p></div> : <div className="grid grid-cols-1 md:grid-cols-3">{items.map((item, index) => { const filled = item.qty !== "" && Number(item.qty) > 0; return <div key={item.rawMaterialId} className={`grid grid-cols-[2.5rem_1fr_6rem_4rem_2rem] items-center gap-2 px-4 py-3 border-b border-slate-100 ${filled ? "bg-emerald-50/40" : ""}`}><span className="text-xs text-slate-400">{index + 1}</span><span className="font-semibold text-sm truncate" title={nameFor(item, language)}>{nameFor(item, language)}</span><input type="tel" value={item.qty} onChange={(event) => updateQty(item.rawMaterialId, event.target.value)} className={`px-2 py-1 text-sm border rounded-lg text-center transition-all focus:outline-none focus:ring-1 ${filled ? "border-emerald-300 bg-white text-emerald-700 focus:border-emerald-400 focus:ring-emerald-200" : "border-blue-300 bg-blue-50 text-blue-700 placeholder-blue-400 focus:border-blue-400 focus:ring-blue-200"}`} placeholder="0" /><span className="text-xs text-slate-500 truncate">{item.unit || "-"}</span><button onClick={() => setItems(items.filter((row) => row.rawMaterialId !== item.rawMaterialId))}><X size={14} className="text-red-500" /></button></div>; })}</div>}
      </div>
    </div>
    <AddRawMaterial isOpen={addRawMaterial} onClose={() => setAddRawMaterial(false)} setIsModalOpen={setAddRawMaterial} refreshData={(item) => item && addItem(item)} />
  </div>;
};

export default AddStoreRequisition;
