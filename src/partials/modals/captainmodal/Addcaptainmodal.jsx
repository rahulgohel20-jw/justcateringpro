import { useState, useEffect, useCallback, useRef } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import {
  addupdatecaptainreceipe,
  SearchRawMaterial,
  Getunit,
  getCaptainReceipeById,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { Select } from "antd";
const { Option } = Select;
import { FormattedMessage, useIntl } from "react-intl";
import AddRawMaterial from "../add-raw-material/AddRawMaterial";
const antSelectCls = "w-full";
const antSelectSize = "middle";

/* ── Shared input style ── */
const inputCls =
  "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 outline-none focus:ring-2  bg-white transition-all placeholder:text-slate-300";

/* ── Section wrapper ── */
const Section = ({ icon, title, subtitle, accent = "blue", children }) => {
  const accentMap = {
    blue: "bg-primary  text-white",
  };
  const iconBg = {
    blue: "bg-primary text-white",
    emerald: "bg-emerald-100 text-emerald-600",
    violet: "bg-violet-100 text-violet-600",
  };
  return (
    <div className="rounded-xl border border-slate-200 shadow-sm">
      <div
        className={`flex items-center gap-3 px-4 py-3 border-b ${accentMap[accent]}`}
      >
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg[accent]}`}
        >
          <i className={`ki-filled ${icon} text-sm`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider">{title}</p>
          {subtitle && (
            <p className="text-[11px] font-normal opacity-70 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="p-4 bg-white">{children}</div>
    </div>
  );
};

/* ── Field label ── */
const FieldLabel = ({ children, hint }) => (
  <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-900 uppercase tracking-wider mb-1.5">
    {children}
    {hint && (
      <span className="normal-case font-normal text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">
        {hint}
      </span>
    )}
  </label>
);

export default function Addcaptaionmodal({
  isModalOpen,
  setIsModalOpen,
  refreshData,
  editData,
}) {
  const intl = useIntl();
  const [name, setName] = useState("");
  const [selectedRawItemId, setSelectedRawItemId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [recipeUnitId, setRecipeUnitId] = useState("");
  const [qty, setQty] = useState("");
  const [rate, setRate] = useState("");
  const [weight, setWeight] = useState("");
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const PAGE_SIZE = 5;

  const [rawMaterials, setRawMaterials] = useState([]);
  const [rawSearch, setRawSearch] = useState("");
  const [rawPage, setRawPage] = useState(1);
  const [rawTotalPages, setRawTotalPages] = useState(1);
  const [rawLoading, setRawLoading] = useState(false);
  const [rawSearchLoading, setRawSearchLoading] = useState(false);
  const rawSearchTimerRef = useRef(null);
  const abortRef = useRef(null);
  const RAW_PAGE_SIZE = 100;
  const userId = localStorage.getItem("userId");
  const lang = localStorage.getItem("lang") || "en";
  const [units, setUnits] = useState([]);
  const uidCounter = useRef(0);
  const nextUid = () => `new_${++uidCounter.current}`;
  const loadingMoreRef = useRef(false);
  const [resolvedUnitId, setResolvedUnitId] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [editingUid, setEditingUid] = useState(null);
const [isRawMaterialModalOpen, setIsRawMaterialModalOpen] = useState(false);
  const langField =
    lang === "hi"
      ? "nameHindi"
      : lang === "gu"
        ? "nameGujarati"
        : "nameEnglish";
const refreshRawMaterials = () => {
  setRawMaterials([]);
  setRawPage(1);
  fetchRawMaterials(1, rawSearch);
};
  const fetchUnits = useCallback(async () => {
    try {
      const res = await Getunit(userId);
      const list = res?.data?.data?.["Unit Details"] || [];
      setUnits(list);
    } catch (err) {
      console.error("Failed to fetch units:", err);
    }
  }, [userId]);

 const rawReqIdRef = useRef(0); 

const fetchRawMaterials = async (page = 1, search = "", append = false) => {
  if (abortRef.current) abortRef.current.abort();
  const controller = new AbortController();
  abortRef.current = controller;
  const reqId = ++rawReqIdRef.current; 

  try {
    page === 1 ? setRawLoading(true) : setRawSearchLoading(true);

    const res = await SearchRawMaterial(
      true,
      userId,
      page,
      RAW_PAGE_SIZE,
      search,
      controller.signal,
    );

    // if a newer request has started since this one was fired, drop this response
    if (reqId !== rawReqIdRef.current) return;

    const list = res?.data?.data?.["Raw Material Details"] || [];
    const totalPages = res?.data?.data?.totalPages || 1;

    setRawMaterials((prev) => (append ? [...prev, ...list] : list));
    setRawTotalPages(totalPages);
    setRawPage(page);
  } catch (err) {
    if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
    console.error(err);
  } finally {
    // only clear loading flags if this is still the latest request
    if (reqId === rawReqIdRef.current) {
      setRawLoading(false);
      setRawSearchLoading(false);
    }
  }
};

  useEffect(() => {
    if (isModalOpen) {
      setRawMaterials([]);
      setRawPage(1);
      setRawSearch("");
      fetchRawMaterials(1, "");
      fetchUnits();
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (!isModalOpen) return;
    if (editData) {
      setName(editData.name || "");
      setRecipeUnitId(editData.unitId || "");
      setWeight(editData.weight ? String(editData.weight) : "");
      setRate(editData.rate ? String(editData.rate) : "");
      setItems(
        (editData.rawMaterial || []).map((ri) => ({
          _uid: `existing_${ri.id}`,
          id: ri.id,
          _isNew: false,
          rawItemId: ri.rawItemId,
          unitId: ri.unitId,
          qty: ri.qty,
          rate: ri.rate ?? "",
          name: ri.rawItemName,
          unit: ri.unitName,
        })),
      );
    } else {
      setName("");
      setItems([]);
      setRecipeUnitId("");
      setWeight("");
      setRate("");
    }
    setSelectedRawItemId("");
    setSelectedUnitId("");
    setQty("");
    setSearch("");
    setPage(1);
    setRawSearch("");
  }, [editData, isModalOpen]);

  /* ── Rate Calculator ── */

  const calculateRate = (raw, selectedUnitId, qty) => {
    if (!raw || !qty || !selectedUnitId) return raw?.supplierRate ?? "";

    const masterRate = raw?.supplierRate ?? 0;
    const quantity = Number(qty) || 1;

    // The actual unit the supplier rate is based on (e.g. GRAM id: 3845)
    const masterUnitId = raw?.unit?.id;

    // Top of hierarchy (e.g. KILO id: 3844)
    const hierarchyRootId = raw?.unitHierarchy?.unitId;
    const hierarchyChildren = raw?.unitHierarchy?.children || [];

    // Case 1: Selected unit is same as master unit (GRAM → GRAM)
    // → rate * qty
    if (Number(selectedUnitId) === Number(masterUnitId)) {
      return (masterRate * quantity).toFixed(2);
    }

    // Case 2: Selected unit is the PARENT/ROOT (e.g. GRAM master, captain picks KILO)
    // → rate * 1000 * qty
    if (Number(selectedUnitId) === Number(hierarchyRootId)) {
      const childEntry = hierarchyChildren.find(
        (c) => Number(c.unitId) === Number(masterUnitId),
      );
      const factor = childEntry?.conversionFactor ?? childEntry?.factor ?? 1000;
      return (masterRate * factor * quantity).toFixed(2);
    }

    // Case 3: Selected unit is a sibling child (smaller than master, e.g. mg)
    // → rate / factor * qty
    const selectedChild = hierarchyChildren.find(
      (c) => Number(c.unitId) === Number(selectedUnitId),
    );
    if (selectedChild) {
      const factor =
        selectedChild?.conversionFactor ?? selectedChild?.factor ?? 1000;
      return ((masterRate / factor) * quantity).toFixed(2);
    }

    // Fallback
    return (masterRate * quantity).toFixed(2);
  };

 const handleAdd = () => {
  if (!selectedRawItemId) return;

  // ── Duplicate check (skip when editing existing row) ──
  if (!editingUid) {
    const alreadyExists = items.some((i) => i.rawItemId === selectedRawItemId);
    if (alreadyExists) {
      Swal.fire({
        icon: "warning",
        title: "Already Added",
        text: "This raw material is already in the recipe. Edit the existing row instead.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
  }

  const raw = rawMaterials.find((r) => r.id === selectedRawItemId);
  const selectedUnit = units.find(
    (u) => u.id === (selectedUnitId || resolvedUnitId),
  );
  const calculatedRate = calculateRate(raw, resolvedUnitId, qty);

  if (editingUid) {
    setItems((prev) =>
      prev.map((i) =>
        i._uid === editingUid
          ? {
              ...i,
              rawItemId: selectedRawItemId,
              unitId: Number(resolvedUnitId) || 0,
              qty: Number(qty) || 1,
              rate: calculatedRate,
              name: raw ? raw[langField] || raw.nameEnglish : i.name,
              unit: selectedUnit
                ? selectedUnit[langField] || selectedUnit.nameEnglish
                : i.unit,
            }
          : i,
      ),
    );
    setEditingUid(null);
  } else {
    setItems((prev) => [
      ...prev,
      {
        _uid: nextUid(),
        id: -1,
        _isNew: true,
        rawItemId: selectedRawItemId,
        unitId: Number(resolvedUnitId) || 0,
        qty: Number(qty) || 1,
        rate: calculatedRate,
        name: raw
          ? raw[langField] || raw.nameEnglish
          : `Item ${selectedRawItemId}`,
        unit: selectedUnit
          ? selectedUnit[langField] || selectedUnit.nameEnglish
          : "-",
      },
    ]);
  }

  setSelectedRawItemId("");
  setSelectedUnitId("");
  setQty("");
};
  const handleCancelEdit = () => {
    setEditingUid(null);
    setSelectedRawItemId("");
    setSelectedUnitId("");
    setResolvedUnitId("");
    setQty("");
  };
  const handleFieldChange = (_uid, field, value) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i._uid !== _uid) return i;

        // If qty changes → recalculate rate automatically
        if (field === "qty") {
          const raw = rawMaterials.find((r) => r.id === i.rawItemId);
          const newRate = raw ? calculateRate(raw, i.unitId, value) : i.rate;
          return { ...i, qty: value, rate: newRate };
        }

        return { ...i, [field]: value };
      }),
    );
  };

  const handleDelete = (_uid) =>
    setItems((prev) => prev.filter((i) => i._uid !== _uid));

  const handleEdit = (item) => {
    setEditingUid(item._uid);
    setSelectedRawItemId(item.rawItemId);
    setSelectedUnitId(item.unitId);
    setResolvedUnitId(item.unitId);
    setQty(String(item.qty));
  };

  const handleSave = async () => {
    // ── Validation ──
    if (!name.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please enter a recipe name.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (!weight || Number(weight) <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please enter a valid weight.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

  

    if (!recipeUnitId) {
      Swal.fire({
        icon: "warning",
        title: "Required",
        text: "Please select a recipe unit.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (items.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Ingredients",
        text: "Please add at least one raw material ingredient.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    // ── Payload & Save ──
    const payload = {
      id: editData?.id || -1,
      name,
      userId: Number(userId || 0),
      weight: Number(weight) || 0,
      rate: Number(rate) || 0,
      unitId: Number(recipeUnitId) || 0,
      rawItems: items.map((i) => ({
        id: i._isNew ? -1 : i.id,
        rawItemId: i.rawItemId,
        qty: Number(i.qty) || 1,
        unitId: Number(i.unitId) || 0,
        rate: Number(i.rate) || 0,
      })),
    };

    try {
      setLoading(true);
      const res = await addupdatecaptainreceipe(payload);

      if (res?.data?.success === true) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: res?.data?.msg || "Operation completed successfully.",
          confirmButtonColor: "#2563eb",
          timer: 2000,
          timerProgressBar: true,
        });
        refreshData?.();
        handleClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: res?.data?.msg || "Something went wrong. Please try again.",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (err) {
      console.error("Save failed:", err);
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Something went wrong. Please try again.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setName("");
    setItems([]);
    setSelectedRawItemId("");
    setSelectedUnitId("");
    setRecipeUnitId("");
    setQty("");
    setRate("");
    setWeight("");
    setSearch("");
    setPage(1);
    setRawSearch("");
    setRawPage(1);
  };

  useEffect(() => {
  const total = items.reduce((sum, i) => sum + (Number(i.rate) || 0), 0).toFixed(2);
  setRate(total);
}, [items]);
  const filtered = items.filter((i) =>
    (i.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleSync = async () => {
    if (!editData?.id) return;
    const confirm = await Swal.fire({
      icon: "question",
      title: "Sync Raw Materials?",
      text: "This will update rates existing ingredients from the master. Continue?",
      showCancelButton: true,
      confirmButtonText: "Yes, Sync",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
    });

    if (!confirm.isConfirmed) return;
    try {
      setSyncing(true);
      const res = await getCaptainReceipeById(editData.id, true); // isSync = true
      const synced = res?.data?.data?.rawMaterial || [];

      if (synced.length === 0) {
        Swal.fire({
          icon: "info",
          title: "Nothing to sync",
          text: "No updated raw materials found.",
          confirmButtonColor: "#2563eb",
          timer: 2000,
          timerProgressBar: true,
        });
        return;
      }

      // Merge: update existing items, append truly new ones
      setItems((prev) => {
        const existingMap = new Map(prev.map((i) => [i.rawItemId, i]));

        synced.forEach((ri) => {
          if (existingMap.has(ri.rawItemId)) {
            // Update rate on existing item
            const old = existingMap.get(ri.rawItemId);
            existingMap.set(ri.rawItemId, {
              ...old,
              rate: ri.rate ?? old.rate,
              unitId: ri.unitId ?? old.unitId,
              unit: ri.unitName ?? old.unit,
            });
          } else {
            // Append new item from sync
            existingMap.set(ri.rawItemId, {
              _uid: nextUid(),
              id: ri.id,
              _isNew: false,
              rawItemId: ri.rawItemId,
              unitId: ri.unitId,
              qty: ri.qty,
              rate: ri.rate ?? "",
              name: ri.rawItemName,
              unit: ri.unitName,
            });
          }
        });

        return Array.from(existingMap.values());
      });

      Swal.fire({
        icon: "success",
        title: "Synced!",
        text: "Raw materials synced successfully.",
        confirmButtonColor: "#2563eb",
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("Sync failed:", err);
      Swal.fire({
        icon: "error",
        title: "Sync Failed",
        text: "Something went wrong while syncing.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setSyncing(false);
    }
  };
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const footer = (
    <div className="flex items-center justify-between pt-1">
      {/* Legend */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5"></div>
        <div className="flex items-center gap-1.5"></div>
      </div>
      <div className="flex items-center gap-2.5">
        <button
          onClick={handleClose}
          className="px-5 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600  transition-all"
        >
          <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 rounded-lg text-sm font-semibold bg-primary text-white shadow-sm  transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {loading && (
            <svg
              className="animate-spin w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          )}
           {loading ? (
    <FormattedMessage id="CR.SAVING" defaultMessage="Saving…" />
  ) : editData ? (
    <FormattedMessage id="CR.UPDATE_RECIPE" defaultMessage="Update Recipe" />
  ) : (
    <FormattedMessage id="CR.SAVE_RECIPE" defaultMessage="Save Recipe" />
  )}
        </button>
      </div>
    </div>
  );

  return (
    <CustomModal
      open={isModalOpen}
      onClose={handleClose}
      width={960}
      title={
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ki-filled ki-notepad-edit text-white text-lg" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800">
             {editData ? (
          <FormattedMessage id="CR.EDIT_CAPTAIN_RECIPE" defaultMessage="Edit Captain Recipe" />
        ) : (
          <FormattedMessage id="CR.NEW_CAPTAIN_RECIPE" defaultMessage="New Captain Recipe" />
        )}
            </p>
            <p className="text-xs text-slate-400 font-normal">
               <FormattedMessage id="CR.BUILD_RECIPE_SUBTITLE" defaultMessage="Build your recipe by adding raw materials with qty, weight & rate" />
            </p>
          </div>
        </div>
      }
      footer={footer}
      bodyStyle={{ padding: 0, overflow: "hidden" }}
    >
      <div
        style={{ maxHeight: "65vh", overflowY: "auto", padding: "16px" }}
        className="flex flex-col gap-4 custom-scrollbar"
      >
        {" "}
        {/* ── SECTION 1: Recipe Details ── */}
     <Section icon="ki-document" title={intl.formatMessage({ id: "CR.RECIPE_DETAILS", defaultMessage: "Recipe Details" })} accent="blue">
  <div className="grid grid-cols-4 gap-3">
    <div>
      <FieldLabel>
        <FormattedMessage id="CR.RECIPE_NAME" defaultMessage="Recipe Name" />{" "}
        <span className="text-red-400 normal-case font-normal">*</span>
      </FieldLabel>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={intl.formatMessage({ id: "CR.RECIPE_NAME_PLACEHOLDER", defaultMessage: "e.g. Chicken Tikka Masala" })}
        className={inputCls}
      />
    </div>

    <div>
      <FieldLabel>
        <FormattedMessage id="COMMON.WEIGHT" defaultMessage="Weight" />
        <span className="text-red-400 normal-case font-normal">*</span>
      </FieldLabel>
      <input
        type="tel"
        min="0"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        placeholder="0"
        className={inputCls}
      />
    </div>

    <div>
      <FieldLabel>
        <FormattedMessage id="COMMON.RATE" defaultMessage="Rate" />{" "}
        <span className="text-red-400 normal-case font-normal">*</span>
      </FieldLabel>
      <input
        type="tel"
        min="0"
        value={rate}
        onChange={(e) => setRate(e.target.value)}
        placeholder="0.00"
        className={inputCls}
      />
    </div>

    <div>
      <FieldLabel>
        <FormattedMessage id="CR.RECIPE_UNIT" defaultMessage="Recipe Unit" />
        <span className="text-red-400 normal-case font-normal">*</span>
      </FieldLabel>
      <Select
        showSearch
        allowClear
        size={antSelectSize}
        className="w-full"
        placeholder={intl.formatMessage({ id: "CR.OUTPUT_UNIT_PLACEHOLDER", defaultMessage: "— Output unit —" })}
        value={recipeUnitId || undefined}
        onChange={(val) => setRecipeUnitId(val ?? "")}
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.children ?? "").toLowerCase().includes(input.toLowerCase())
        }
        getPopupContainer={() => document.body}
        popupMatchSelectWidth={false}
      >
        {units.map((u) => (
          <Option key={u.id} value={u.id}>
            {u[langField] || u.nameEnglish}
          </Option>
        ))}
      </Select>
    </div>
  </div>
</Section>
        {/* ── SECTION 2: Add Raw Material ── */}
        <Section icon="ki-plus-squared" title={intl.formatMessage({ id: "CR.ADD_RAW_MATERIAL", defaultMessage: "Add Raw Material" })} accent="blue">
          <div className="grid grid-cols-3 gap-3 items-end">
            {/* Raw Material Select */}
            {/* Raw Material Select */}
           <div>
  <FieldLabel>
    <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
      <FormattedMessage id="CR.RAW_MATERIAL" defaultMessage="Raw material" />
  </FieldLabel>
  <div className="flex items-center gap-2">
    <div className="flex-1 min-w-0">
      <Select
        showSearch
        allowClear
        size={antSelectSize}
        className={antSelectCls}
        loading={rawLoading}
        value={selectedRawItemId || undefined}
        placeholder="— Search & select ingredient —"
        filterOption={false} // ← disable client-side filter, API handles it
        onSearch={(val) => {
          // Debounce search → call API
          setRawSearch(val);
          if (rawSearchTimerRef.current)
            clearTimeout(rawSearchTimerRef.current);
          rawSearchTimerRef.current = setTimeout(() => {
            setRawMaterials([]);
            fetchRawMaterials(1, val);
          }, 400);
        }}
        onPopupScroll={(e) => {
          // Infinite scroll → load next page
          const { scrollTop, scrollHeight, clientHeight } = e.target;
          if (
            scrollHeight - scrollTop <= clientHeight + 50 &&
            !rawLoading &&
            !rawSearchLoading &&
            rawPage < rawTotalPages
          ) {
            fetchRawMaterials(rawPage + 1, rawSearch, true); // append=true
          }
        }}
        onChange={(val) => {
          setSelectedRawItemId(val ?? "");
          if (val) {
            const raw = rawMaterials.find((r) => r.id === val);
            const prefillId =
              raw?.unitHierarchy?.unitId ?? raw?.unit?.id ?? "";
            setSelectedUnitId(prefillId);
            setResolvedUnitId(prefillId);
          } else {
            setSelectedUnitId("");
            setResolvedUnitId("");
          }
        }}
        notFoundContent={
          rawLoading ? (
            <div className="text-center py-2 text-xs text-slate-400">
              Loading...
            </div>
          ) : (
            <div className="text-center py-2 text-xs text-slate-400">
              No results
            </div>
          )
        }
        dropdownRender={(menu) => (
          <>
            {menu}
            {rawSearchLoading && (
              <div className="text-center py-2 text-xs text-slate-400 border-t border-slate-100">
                Loading more...
              </div>
            )}
          </>
        )}
        getPopupContainer={() => document.body}
        popupMatchSelectWidth={false}
      >
        {rawMaterials.map((r) => (
          <Option key={r.id} value={r.id}>
            {r[langField] || r.nameEnglish}
          </Option>
        ))}
      </Select>
    </div>

    <button
      type="button"
      onClick={() => setIsRawMaterialModalOpen(true)}
      className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-primary text-white rounded-lg hover:opacity-90 transition-all"
      title="Add New Raw Material"
    >
      <i className="ki-filled ki-plus text-sm" />
    </button>
  </div>
</div>
            {/* Quantity */}
            <div>
              <FieldLabel><FormattedMessage id="CR.QUANTITY" defaultMessage="Quantity" /></FieldLabel>
              <input
                type="tel"
                min="1"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                placeholder="e.g. 500"
                className={inputCls}
              />
            </div>

            {/* Unit Select */}
            <div>
              <FieldLabel>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                   <FormattedMessage id="COMMON.UNIT" defaultMessage="Unit" />
              </FieldLabel>
              <Select
                showSearch
                allowClear
                size={antSelectSize}
                className={antSelectCls}
                placeholder="— Unit for this ingredient —"
                value={selectedUnitId || undefined}
                onChange={(val) => {
                  setSelectedUnitId(val ?? "");
                  setResolvedUnitId(val ?? "");
                }}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option?.children ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                getPopupContainer={() => document.body}
                popupMatchSelectWidth={false}
              >
                {(() => {
                  const raw = rawMaterials.find(
                    (r) => r.id === selectedRawItemId,
                  );
                  const hierarchy = raw?.unitHierarchy;
                  if (!hierarchy)
                    return units.map((u) => (
                      <Option key={u.id} value={u.id}>
                        {u[langField] || u.nameEnglish}
                      </Option>
                    ));
                  const hierarchyIds = new Set([
                    hierarchy.unitId,
                    ...(hierarchy.children || []).map((c) => c.unitId),
                  ]);
                  return units
                    .filter((u) => hierarchyIds.has(u.id))
                    .map((u) => (
                      <Option key={u.id} value={u.id}>
                        {u[langField] || u.nameEnglish}
                      </Option>
                    ));
                })()}
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <button
                onClick={handleAdd}
                disabled={!selectedRawItemId}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <i
                  className={`ki-filled ${editingUid ? "ki-check" : "ki-plus"} text-sm`}
                />
                {editingUid ? "Update Ingredient" : "Add Ingredient"}
              </button>
              {editingUid && (
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
                </button>
              )}
            </div>
            <button
              onClick={handleSync}
              disabled={syncing || !editData?.id}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold bg-primary text-white  transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {syncing ? (
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8z"
                  />
                </svg>
              ) : (
                <i className="ki-filled ki-arrows-circle text-sm" />
              )}
              {syncing ? "Syncing…" : "Sync"}
            </button>
          </div>
        </Section>
       
<Section icon="ki-element-9" title="Recipe Ingredients" accent="blue">
  {/* Table header row */}
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      {items.length > 0 && (
        <span className="text-xs bg-violet-100 text-violet-700 font-bold px-2.5 py-0.5 rounded-full">
          {items.length} ingredient{items.length !== 1 ? "s" : ""}
        </span>
      )}
    </div>
    <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50">
      <i className="ki-filled ki-magnifier text-slate-300 text-xs" />
      <input
        type="text"
        placeholder="Search ingredients…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="text-xs outline-none text-slate-600 w-32 bg-transparent placeholder:text-slate-300"
      />
    </div>
  </div>

  <div className="border border-slate-200 rounded-xl overflow-hidden">
    <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-50 border-b border-slate-200 shadow-[0_1px_0_0_theme(colors.slate.200)]">
            <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider w-10 bg-slate-50">
                <FormattedMessage id="COMMON.SR_NO" defaultMessage="#" />
            </th>
            <th className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
             <FormattedMessage id="CR.INGREDIENT_NAME" defaultMessage="Ingredient Name" />
            </th>
            <th className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
              <span className="flex items-center justify-center gap-1">
                 <FormattedMessage id="COMMON.UNIT" defaultMessage="Unit" />
              </span>
            </th>
            <th className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
                <FormattedMessage id="CR.QTY" defaultMessage="Qty" />
            </th>
            <th className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50">
            <FormattedMessage id="COMMON.RATE" defaultMessage="Rate" />
            </th>
            <th className="w-10 bg-slate-50" />
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {paged.map((item, idx) => (
            <tr
              key={item._uid}
              className="hover:bg-slate-50/60 transition-colors group"
            >
              <td className="px-3 py-2.5 text-xs text-slate-300 font-medium">
                {(page - 1) * PAGE_SIZE + idx + 1}
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <i className="ki-filled ki-abstract-26 text-slate-400 text-xs" />
                  </div>
                  <span className="font-semibold text-slate-800 text-[13px]">
                    {item.name}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2.5 text-center">
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {item.unit || "—"}
                </span>
              </td>
              <td className="px-3 py-2.5 text-center">
                <input
                  type="tel"
                  min="1"
                  value={item.qty}
                  onChange={(e) =>
                    handleFieldChange(item._uid, "qty", e.target.value)
                  }
                  className="w-16 text-center border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 transition-all"
                />
              </td>
              <td className="px-3 py-2.5 text-center">
                <input
                  type="tel"
                  min="0"
                  value={item.rate}
                  onChange={(e) =>
                    handleFieldChange(item._uid, "rate", e.target.value)
                  }
                  className="w-20 text-center border border-slate-200 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 transition-all"
                />
              </td>
              <td className="px-3 py-2.5 text-center">
                <button
                  onClick={() => handleEdit(item)}
                  className="w-7 h-7 border border-blue-100 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-50 hover:border-blue-200 transition-all"
                  title="Edit"
                >
                  <i className="ki-filled ki-pencil text-sm" />
                </button>
                <button
                  onClick={() => handleDelete(item._uid)}
                  className="w-7 h-7 border border-red-100 rounded-lg flex items-center justify-center mx-auto text-red-400 hover:bg-red-50 hover:border-red-200 transition-all opacity-0 group-hover:opacity-100"
                >
                  <i className="ki-filled ki-trash text-sm" />
                </button>
              </td>
            </tr>
          ))}

          {paged.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-10 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <i className="ki-filled ki-element-9 text-slate-300 text-xl" />
                  </div>
                  <p className="text-sm text-slate-400 font-medium">
                    No ingredients added yet
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Use the{" "}
                    <span className="font-semibold text-emerald-500">
                      Add Raw Material
                    </span>{" "}
                    section above
                  </p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* Pagination */}
  {filtered.length > PAGE_SIZE && (
    <div className="flex items-center justify-between mt-3">
      <span className="text-xs text-slate-400">
        Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
        –{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
        {filtered.length}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="w-7 h-7 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all text-xs"
        >
          ‹
        </button>
        <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-bold">
          {page}
        </div>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="w-7 h-7 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 disabled:opacity-30 hover:bg-slate-50 transition-all text-xs"
        >
          ›
        </button>
      </div>
    </div>
  )}
</Section>
      </div>
      <AddRawMaterial
        isOpen={isRawMaterialModalOpen}
        onClose={() => setIsRawMaterialModalOpen(false)}
        refreshData={refreshRawMaterials}
        rawmaterial={null}
      />
    </CustomModal>
  );
}
