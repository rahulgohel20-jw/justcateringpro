import { useState, useEffect, useRef, useCallback } from "react";
import { FormattedMessage } from "react-intl";
import {
  ArrowLeft,
  Plus,
  Save,
  Package,
  FileText,
  Hash,
  Calendar,
  User,
  Tag,
  AlignLeft,
  Trash2,
  ShoppingCart,
  Store,
} from "lucide-react";
import { Select } from "antd";
import DatePicker from "react-datepicker";
import { useLocation, useNavigate } from "react-router";
import Swal from "sweetalert2";
import {
  GetNormalPOById,
  DeleteNormalPODetails,
  AddNormalPO as AddNormalPOApi,
  GetStockTypeByUserId,
  getpartywitheventforstock,
  OutsideContactName,
} from "../../../services/apiServices";
import { usePermission } from "../../../hooks/usePermission";
import { useStockTypePermission } from "../../../hooks/useStockTypePermission";

const fieldClass =
  "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";
const labelClass =
  "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5";
const cellClass =
  "w-full px-2 py-1.5 text-sm border border-transparent rounded-lg bg-transparent hover:border-slate-200 hover:bg-slate-50 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-300 transition-all";

const isDecimal = (v) => /^\d*\.?\d*$/.test(v);
const calcTotal = (qty, rate) =>
  ((parseFloat(qty) || 0) * (parseFloat(rate) || 0)).toFixed(2);

// Accepts "yyyy-MM-dd" or "dd/MM/yyyy" (with optional time part)
const parseApiDate = (d) => {
  if (!d) return new Date();
  const s = String(d).split("T")[0];
  if (s.includes("/")) {
    const [dd, mm, yyyy] = s.split("/");
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  const [yyyy, mm, dd] = s.split("-");
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
};

const formatDateForApi = (date) => {
  if (!date) return "";
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}/${date.getFullYear()}`;
};

const emptyEntry = { particular: "", qty: "", rate: "", remarks: "" };

const AddNormalPO = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const editData = location.state?.editData || null;
  const isEdit = !!editData;

  const backDatePermission = usePermission("Lock Back Date Entry");
  const isBackDateLocked = backDatePermission.add || backDatePermission.edit;
  const { filterStockTypes } = useStockTypePermission();

  const [form, setForm] = useState({
    voucher: "",
    date: new Date(),
    remark: "",
    stock_type_id: "",
    event_id: "",
    supplier_id: "",
  });
  const [entry, setEntry] = useState(emptyEntry);
  const [items, setItems] = useState([]);
  const [stockTypes, setStockTypes] = useState([]);
  const [parties, setParties] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);

  const particularRef = useRef(null);

  // ── Dropdown data ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return;

    GetStockTypeByUserId(JSON.parse(userId), "")
      .then((res) => {
        const data = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];
        setStockTypes(filterStockTypes(data));
      })
      .catch((err) => console.error("Failed to fetch types:", err));

    getpartywitheventforstock(userId)
      .then((res) => {
        setParties(res?.data?.data || []);
      })
      .catch((err) => console.error("Failed to fetch parties:", err));

    OutsideContactName(3, userId)
      .then((res) => setVendors(res?.data?.data?.["Party Details"] || []))
      .catch((err) => console.error("Failed to fetch vendors:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Edit: load the full record by id ───────────────────────────────────────
  useEffect(() => {
    if (!editData?.id) return;
    let cancelled = false;

    (async () => {
      try {
        setLoadingEdit(true);
        const res = await GetNormalPOById(editData.id);
        const d = res?.data?.data || editData;
        if (cancelled) return;

        setForm({
          voucher: d.pocode || d.voucher || "",
          date: parseApiDate(d.podate),
          remark: d.remark || "",
          stock_type_id: d.stockTypeId || "",
          event_id: d.eventId || "",
          supplier_id: d.supplierId || "",
        });
        setItems(
          (d.details || []).map((x) => ({
            id: x.id || 0,
            particular: x.particular || "",
            qty: x.qty ?? "",
            rate: x.price ?? "", // API field is "price"
            remarks: x.remark || "", // API field is "remark"
          })),
        );
      } catch (error) {
        console.error("Failed to load Normal PO:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load Normal PO details.",
          confirmButtonColor: "#d33",
        });
      } finally {
        if (!cancelled) setLoadingEdit(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [editData?.id]);

  // ── Detail rows ────────────────────────────────────────────────────────────
  const handleAddItem = () => {
    if (!entry.particular.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Please enter a particular.",
        confirmButtonColor: "#3085d6",
      });
      particularRef.current?.focus();
      return;
    }
    setItems((prev) => [{ id: 0, ...entry }, ...prev]);
    setEntry(emptyEntry);
    particularRef.current?.focus();
  };

  const updateItem = useCallback((index, field, value) => {
    if ((field === "qty" || field === "rate") && !isDecimal(value)) return;
    setItems((prev) =>
      prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
    );
  }, []);

  const handleDeleteItem = async (index) => {
    const item = items[index];

    // Saved rows must be removed on the server too
    if (item?.id) {
      const confirm = await Swal.fire({
        icon: "warning",
        title: "Delete this row?",
        text: "This row will be removed permanently.",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });
      if (!confirm.isConfirmed) return;
      try {
        const res = await DeleteNormalPODetails(item.id);
        if (res?.data?.success === false) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: res?.data?.msg || "Failed to delete row.",
            confirmButtonColor: "#d33",
          });
          return;
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error?.response?.data?.msg || "Failed to delete row.",
          confirmButtonColor: "#d33",
        });
        return;
      }
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const grandTotal = items.reduce(
    (s, i) => s + parseFloat(calcTotal(i.qty, i.rate)),
    0,
  );

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.date) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Please select a date.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
    if (isBackDateLocked) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const picked = new Date(form.date);
      picked.setHours(0, 0, 0, 0);
      if (picked < today) {
        Swal.fire({
          icon: "warning",
          title: "Validation",
          text: "Back-dated entries are not allowed.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }
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
    if (items.some((i) => !i.particular?.trim())) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Particular cannot be empty.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    // Matches POST /normalpo/add-update
    const payload = {
      id: isEdit ? editData.id : null,
      userId: parseInt(userId),
      voucher: form.voucher || "",
      billno: "", // no bill no field on this screen
      podate: formatDateForApi(form.date),
      remark: form.remark,
      stockTypeId: form.stock_type_id || null,
      eventId: form.event_id || 0,
      supplierId: form.supplier_id || null,
      details: items.map((i) => ({
        id: i.id || null,
        particular: i.particular.trim(),
        qty: parseFloat(i.qty) || 0,
        price: parseFloat(i.rate) || 0,
        remark: i.remarks || "",
      })),
    };

    try {
      setSaving(true);
      const res = await AddNormalPOApi(payload);
      if (res?.data?.success === false) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.msg || "Failed to save. Please try again.",
          confirmButtonColor: "#d33",
        });
        return;
      }
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: isEdit ? "Normal PO updated." : "Normal PO saved.",
        confirmButtonColor: "#16a34a",
      });
      navigate("/stock-management/normal-po");
    } catch (error) {
      console.error("Save failed:", error);
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

  const filterByLabel = (input, option) =>
    (option?.label ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <div className="min-h-screen p-6 font-sans">
      <div className="mx-auto space-y-5">
        {/* ── Normal PO Information ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-700">
                <FileText size={17} className="text-white" />
              </div>
              <h2 className="text-green-900 font-bold text-base tracking-tight">
                {isEdit ? (
                  <FormattedMessage
                    id="NORMAL_PO.EDIT"
                    defaultMessage="Edit Normal PO"
                  />
                ) : (
                  <FormattedMessage
                    id="NORMAL_PO.INFO"
                    defaultMessage="Normal PO Information"
                  />
                )}
              </h2>
            </div>
            <button
              onClick={() => navigate("/stock-management/normal-po")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors shadow-sm"
            >
              <ArrowLeft size={16} />
              <FormattedMessage id="COMMON.BACK" defaultMessage="Back" />
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {/* Voucher No. */}
            <div>
              <label className={labelClass}>
                <Hash size={16} /> Voucher No.
              </label>
              <input
                name="voucher"
                disabled
                value={form.voucher}
                placeholder="Auto-generated"
                className={fieldClass}
              />
            </div>

            {/* Date */}
            <div>
              <label className={labelClass}>
                <Calendar size={16} />
                <FormattedMessage id="COMMON.DATE" defaultMessage="Date" />
                <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={form.date}
                onChange={(date) => setForm((p) => ({ ...p, date }))}
                dateFormat="dd/MM/yyyy"
                className={fieldClass}
                wrapperClassName="w-full"
                minDate={isBackDateLocked ? new Date() : undefined}
                autoComplete="off"
              />
            </div>

            {/* Type */}
            <div>
              <label className={labelClass}>
                <Tag size={16} /> Type
              </label>
              <Select
                showSearch
                allowClear
                placeholder="Select type..."
                style={{ width: "100%", height: "38px" }}
                value={form.stock_type_id || undefined}
                onChange={(v) =>
                  setForm((p) => ({ ...p, stock_type_id: v || "" }))
                }
                filterOption={filterByLabel}
                options={stockTypes.map((t) => ({
                  label: t.nameEnglish,
                  value: t.stocktypeid ?? t.stockTypeId ?? t.id,
                }))}
              />
            </div>

            {/* Remark */}
            <div className="lg:col-span-3 md:col-span-2">
              <label className={labelClass}>
                <AlignLeft size={16} />
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

            {/* Party Name */}
            <div className="lg:col-span-3 md:col-span-2">
              <label className={labelClass}>
                <User size={16} /> Party Name
              </label>
              <Select
                showSearch
                allowClear
                placeholder="Search party…"
                style={{ width: "100%", height: "38px" }}
                value={form.event_id || undefined}
                onChange={(v) => setForm((p) => ({ ...p, event_id: v || "" }))}
                filterOption={filterByLabel}
                options={parties.map((p) => ({
                  value: p.eventId,
                  label: `${p.partyName} (${p.eventName}) (${p.eventDate})`,
                }))}
              />
            </div>

            {/* Vendor Name */}
            <div className="lg:col-span-3 md:col-span-2">
              <label className={labelClass}>
                <Store size={16} /> Vendor Name
              </label>
              <Select
                showSearch
                allowClear
                placeholder="Search vendor…"
                style={{ width: "100%", height: "38px" }}
                value={form.supplier_id || undefined}
                onChange={(v) =>
                  setForm((p) => ({ ...p, supplier_id: v || "" }))
                }
                filterOption={filterByLabel}
                options={vendors.map((v) => ({
                  value: v.id,
                  label: v.nameEnglish,
                }))}
              />
            </div>
          </div>
        </div>

        {/* ── Normal PO Details ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary">
                <ShoppingCart size={17} className="text-white" />
              </div>
              <h2 className="text-primary font-bold text-base tracking-tight">
                <FormattedMessage
                  id="NORMAL_PO.DETAILS"
                  defaultMessage="Normal PO Details"
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
              disabled={saving || loadingEdit}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 shadow-sm bg-green-700 disabled:opacity-60"
            >
              <Save size={16} />
              {saving ? (
                <FormattedMessage
                  id="COMMON.SAVING"
                  defaultMessage="Saving..."
                />
              ) : isEdit ? (
                <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
              ) : (
                <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
              )}
            </button>
          </div>

          {/* ── Entry row: Particular | Qty | Rate | Total | Remark | Add ── */}
          <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 grid grid-cols-12 gap-3 items-end">
            <div className="col-span-12 md:col-span-4">
              <label className={labelClass}>Particular</label>
              <input
                ref={particularRef}
                value={entry.particular}
                onChange={(e) =>
                  setEntry((p) => ({ ...p, particular: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.preventDefault();
                }}
                placeholder="Enter particular"
                className={fieldClass}
              />
            </div>
            <div className="col-span-4 md:col-span-1">
              <label className={labelClass}>Qty</label>
              <input
                type="text"
                inputMode="decimal"
                value={entry.qty}
                onChange={(e) =>
                  isDecimal(e.target.value) &&
                  setEntry((p) => ({ ...p, qty: e.target.value }))
                }
                placeholder="0"
                className={fieldClass}
              />
            </div>
            <div className="col-span-4 md:col-span-2">
              <label className={labelClass}>Rate</label>
              <input
                type="text"
                inputMode="decimal"
                value={entry.rate}
                onChange={(e) =>
                  isDecimal(e.target.value) &&
                  setEntry((p) => ({ ...p, rate: e.target.value }))
                }
                placeholder="0.00"
                className={fieldClass}
              />
            </div>
            <div className="col-span-4 md:col-span-2">
              <label className={labelClass}>Total</label>
              <input
                disabled
                value={calcTotal(entry.qty, entry.rate)}
                className={fieldClass}
              />
            </div>
            <div className="col-span-8 md:col-span-2">
              <label className={labelClass}>Remark</label>
              <input
                value={entry.remarks}
                onChange={(e) =>
                  setEntry((p) => ({ ...p, remarks: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddItem();
                  }
                }}
                placeholder="Optional"
                className={fieldClass}
              />
            </div>
            <div className="col-span-4 md:col-span-1">
              <button
                type="button"
                onClick={handleAddItem}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-white text-xs font-bold bg-primary hover:opacity-90 transition-all shadow-sm"
              >
                <Plus size={15} />
                <FormattedMessage id="COMMON.ADD" defaultMessage="Add" />
              </button>
            </div>
          </div>

          {/* ── Table ── */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["#", "Particular", "Qty", "Rate", "Total", "Remark", ""].map(
                    (h, idx) => (
                      <th
                        key={idx}
                        className="px-3 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {loadingEdit ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-14 text-center text-slate-400 text-sm"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-14 text-center text-slate-400 text-sm"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <Package size={36} className="text-slate-200" />
                        <p className="font-medium text-slate-400">
                          No items added yet
                        </p>
                        <p className="text-xs text-slate-300">
                          Enter a particular above and press Add
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item, i) => (
                    <tr
                      key={item.id || `new-${i}`}
                      className="border-b border-slate-50 hover:bg-blue-50/20 transition-colors group"
                    >
                      <td className="px-3 py-2 text-xs text-slate-400 font-medium w-8">
                        {i + 1}
                      </td>
                      <td className="px-1 py-2 min-w-[220px]">
                        <input
                          value={item.particular}
                          onChange={(e) =>
                            updateItem(i, "particular", e.target.value)
                          }
                          className={cellClass}
                        />
                      </td>
                      <td className="px-1 py-2 w-24">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={item.qty}
                          onChange={(e) => updateItem(i, "qty", e.target.value)}
                          className={`${cellClass} text-center`}
                        />
                      </td>
                      <td className="px-1 py-2 w-28">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(i, "rate", e.target.value)
                          }
                          className={`${cellClass} text-center`}
                        />
                      </td>
                      <td className="px-3 py-2 w-28">
                        <span className="text-sm font-bold text-blue-700">
                          ₹ {calcTotal(item.qty, item.rate)}
                        </span>
                      </td>
                      <td className="px-1 py-2 min-w-[160px]">
                        <input
                          value={item.remarks}
                          onChange={(e) =>
                            updateItem(i, "remarks", e.target.value)
                          }
                          className={cellClass}
                        />
                      </td>
                      <td className="px-3 py-2 w-10">
                        <button
                          onClick={() => handleDeleteItem(i)}
                          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={13} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {items.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50/80 border-t border-slate-200">
                    <td
                      colSpan={4}
                      className="px-3 py-2 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      Total
                    </td>
                    <td className="px-3 py-2 text-sm font-bold text-blue-700">
                      ₹ {grandTotal.toFixed(2)}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddNormalPO;