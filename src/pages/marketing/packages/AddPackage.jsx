import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Check, Search, ChevronRight, Loader2, Package,
  Users, DollarSign, Tag, ShoppingBag, Grid3X3, List,
  Minus, AlertCircle
} from "lucide-react";
import { GetAllCategoryformenu, Getmenuitemsusingcatid } from "@/services/apiServices";
import { toAbsoluteUrl } from "@/utils";

// ─── language hook ─────────────────────────────────────────────────────────
const useLang = () => {
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  useEffect(() => {
    const sync = () => setLang(localStorage.getItem("lang") || "en");
    window.addEventListener("languageChange", sync);
    window.addEventListener("storage", sync);
    const t = setInterval(sync, 500);
    return () => {
      window.removeEventListener("languageChange", sync);
      window.removeEventListener("storage", sync);
      clearInterval(t);
    };
  }, []);
  return lang;
};

// ─── Step indicator ────────────────────────────────────────────────────────
const steps = ["Package Info", "Select Items", "Review"];

const StepBar = ({ current }) => (
  <div className="flex items-center gap-0 px-7 py-3 bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-100">
    {steps.map((label, i) => (
      <div key={i} className="flex items-center">
        <div className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-all duration-300
            ${i < current ? "bg-emerald-500 text-white" :
              i === current ? "bg-blue-600 text-white ring-4 ring-blue-100" :
              "bg-slate-200 text-slate-400"}`}>
            {i < current ? <Check size={12} strokeWidth={3} /> : i + 1}
          </div>
          <span className={`text-xs font-semibold transition-colors duration-300
            ${i === current ? "text-blue-700" : i < current ? "text-emerald-600" : "text-slate-400"}`}>
            {label}
          </span>
        </div>
        {i < steps.length - 1 && (
          <div className={`w-12 h-[2px] mx-3 rounded-full transition-all duration-500
            ${i < current ? "bg-emerald-400" : "bg-slate-200"}`} />
        )}
      </div>
    ))}
  </div>
);

// ─── Category sidebar item ─────────────────────────────────────────────────
const CategoryTab = ({ cat, isActive, selectedCount, onClick, getCatName }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 flex items-center justify-between group transition-all duration-150 border-l-2
      ${isActive
        ? "bg-blue-600 border-blue-600"
        : selectedCount > 0
          ? "bg-emerald-50 border-emerald-400 hover:bg-emerald-100"
          : "border-transparent hover:bg-slate-100 hover:border-slate-300"
      }`}
  >
    <span className={`text-sm font-medium truncate pr-2 leading-tight
      ${isActive ? "text-white" : selectedCount > 0 ? "text-emerald-800" : "text-slate-700 group-hover:text-slate-900"}`}>
      {getCatName(cat)}
    </span>
    {selectedCount > 0 && !isActive && (
      <span className="shrink-0 bg-emerald-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
        {selectedCount > 9 ? "9+" : selectedCount}
      </span>
    )}
    {isActive && (
      <ChevronRight size={14} className="text-blue-200 shrink-0" />
    )}
  </button>
);

// ─── Item card ─────────────────────────────────────────────────────────────
const ItemCard = ({ item, isSel, onToggle, getItemName, safeImg, viewMode }) => {
  const name = getItemName(item);
  const price = item.itemPrice ?? item.rate ?? 0;

  if (viewMode === "list") {
    return (
      <motion.div
        layout
        onClick={onToggle}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150
          ${isSel
            ? "border-blue-400 bg-blue-50 shadow-sm"
            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-sm"
          }`}
      >
        <div className={`w-10 h-10 rounded-lg overflow-hidden shrink-0 border
          ${isSel ? "border-blue-300" : "border-slate-100"}`}>
          <img
            src={safeImg(item.imagePath)}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = toAbsoluteUrl("/media/menu/noImage.jpg"); }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-tight truncate ${isSel ? "text-blue-800" : "text-slate-800"}`}>
            {name}
          </p>
          {Number(price) > 0 && (
            <p className={`text-xs mt-0.5 font-medium ${isSel ? "text-blue-500" : "text-slate-400"}`}>₹{price}</p>
          )}
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200
          ${isSel ? "bg-blue-600 border-blue-600" : "border-slate-300 bg-white"}`}>
          {isSel && <Check size={12} className="text-white" strokeWidth={3} />}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      onClick={onToggle}
      whileTap={{ scale: 0.96 }}
      className={`relative flex flex-col rounded-xl border cursor-pointer transition-all duration-150 overflow-hidden
        ${isSel
          ? "border-green-500 bg-green-50 shadow-md ring-1 ring-green-200"
          : "border-slate-200 bg-white hover:border-green-200 hover:shadow-md hover:bg-green-50/20"
        }`}
    >
      <div className="w-full h-20 overflow-hidden bg-slate-100 relative">
        <img
          src={safeImg(item.imagePath)}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          onError={(e) => { e.target.src = toAbsoluteUrl("/media/menu/noImage.jpg"); }}
        />
        {item.isPackage && (
          <span className="absolute top-1 left-1 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            PKG
          </span>
        )}
        <AnimatePresence>
          {isSel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-green-600/20 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center shadow-lg"
              >
                <Check size={16} className="text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="p-2">
        <p className={`text-xs font-semibold leading-tight line-clamp-2 ${isSel ? "text-green-800" : "text-slate-800"}`}>
          {name}
        </p>
        {Number(price) > 0 && (
          <p className={`text-[11px] font-bold mt-1 ${isSel ? "text-green-600" : "text-slate-400"}`}>₹{price}</p>
        )}
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
export default function AddPackages({ open, onClose, onSave, selectedFunctionId }) {
  const lang = useLang();
  const [step, setStep] = useState(0);

  const [form, setForm] = useState({ packageName: "", price: "", guestMin: "", guestMax: "" });
  const [formErrors, setFormErrors] = useState({});

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);

  // ── Per-category item state (from MenuItemGridPackage approach) ───────────
  const [itemsByCategory, setItemsByCategory] = useState({});
  const itemsByCategoryRef = useRef({});         // raw items array per catId
  const [loadingCats, setLoadingCats] = useState({});
  const [hasMoreByCat, setHasMoreByCat] = useState({});  // infinite scroll per cat
  const [pageByCat, setPageByCat] = useState({});         // current page per cat
  const isFetchingByCatRef = useRef({});          // in-flight guard per catId
  const observerRef = useRef(null);               // sentinel element ref
  const itemsPanelRef = useRef(null);             // scroll container ref

  const PAGE_SIZE = 100;
  const USER_ID = localStorage.getItem("userId");

  const [selected, setSelected] = useState({});
  const [activeCatId, setActiveCatId] = useState(null);

  const [catSearch, setCatSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // ── reset on open ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setForm({ packageName: "", price: "", guestMin: "", guestMax: "" });
    setFormErrors({});
    setSelected({});
    setActiveCatId(null);
    setItemsByCategory({});
    itemsByCategoryRef.current = {};
    setLoadingCats({});
    setHasMoreByCat({});
    setPageByCat({});
    isFetchingByCatRef.current = {};
    setCatSearch("");
    setItemSearch("");
  }, [open]);

  // ── ESC close ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);

  // ── fetchItems — mirrors MenuItemGridPackage.fetchMenuItems ─────────────
  // Uses Getmenuitemsusingcatid(page, pageSize, userId, categoryId)
  // Items have: item.id, item.nameEnglish || item.name, item.imagePath
  const fetchItems = useCallback(async (catId, pageNum) => {
    if (isFetchingByCatRef.current[catId]) return;

    isFetchingByCatRef.current[catId] = true;
    setLoadingCats((p) => ({ ...p, [catId]: true }));

    try {
      // Pass 0 for "all", otherwise the numeric category ID
      const categoryIdToPass = catId === "all" ? 0 : Number(catId);

      const response = await Getmenuitemsusingcatid(
        pageNum,
        PAGE_SIZE,
        USER_ID,
        categoryIdToPass,
      );

      const newItems = response?.data?.data?.items || [];
      const totalCount = response?.data?.data?.totalItems || 0;

      // Merge or replace based on page number
      const merged = pageNum === 1
        ? newItems
        : [...(itemsByCategoryRef.current[catId] || []), ...newItems];

      itemsByCategoryRef.current[catId] = merged;
      setItemsByCategory((p) => ({ ...p, [catId]: merged }));

      const isEnd = pageNum * PAGE_SIZE >= totalCount || newItems.length < PAGE_SIZE;

      if (isEnd) {
        setHasMoreByCat((p) => ({ ...p, [catId]: false }));
      } else {
        setPageByCat((p) => ({ ...p, [catId]: pageNum + 1 }));
        setHasMoreByCat((p) => ({ ...p, [catId]: true }));
      }
    } catch (err) {
      console.error("[AddPackages] fetchItems failed for catId", catId, err);
      if (pageNum === 1) {
        itemsByCategoryRef.current[catId] = [];
        setItemsByCategory((p) => ({ ...p, [catId]: [] }));
      }
      setHasMoreByCat((p) => ({ ...p, [catId]: false }));
    } finally {
      setLoadingCats((p) => ({ ...p, [catId]: false }));
      isFetchingByCatRef.current[catId] = false;
    }
  }, [USER_ID]);

  // ── loadItems — entry point (first page only if not yet fetched) ────────
  const loadItems = useCallback((catId) => {
    // Already fetched at least once — skip (infinite scroll handles subsequent pages)
    if (itemsByCategoryRef.current[catId] !== undefined) return;
    // Mark as initialised so concurrent calls don't double-fetch
    itemsByCategoryRef.current[catId] = null; // sentinel "in progress"
    setPageByCat((p) => ({ ...p, [catId]: 1 }));
    setHasMoreByCat((p) => ({ ...p, [catId]: true }));
    fetchItems(catId, 1);
  }, [fetchItems]);

  // ── Infinite scroll for active category ────────────────────────────────
  useEffect(() => {
    const sentinel = observerRef.current;
    if (!sentinel || !activeCatId) return;

    const hasMore = hasMoreByCat[activeCatId];
    const currentPage = pageByCat[activeCatId] ?? 1;

    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMoreByCat[activeCatId] &&
          !isFetchingByCatRef.current[activeCatId]
        ) {
          fetchItems(activeCatId, currentPage);
        }
      },
      {
        root: itemsPanelRef.current,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.unobserve(sentinel);
  }, [activeCatId, hasMoreByCat, pageByCat, fetchItems]);

  // ── Load categories on open ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const uid = localStorage.getItem("userId");
    (async () => {
      setCatLoading(true);
      try {
        const resp = await GetAllCategoryformenu(uid);
        const raw = resp?.data?.data?.["Menu Category Details"] || [];
        const cats = raw.map((cat) => ({
          id: cat.id,
          nameEnglish: cat.nameEnglish || "",
          nameHindi: cat.nameHindi || "",
          nameGujarati: cat.nameGujarati || "",
        }));
        setCategories(cats);
        if (cats.length > 0) {
          const firstId = cats[0].id;
          setActiveCatId(firstId);
          loadItems(firstId);
        }
      } catch (e) {
        console.error("[AddPackages] GetAllCategoryformenu failed:", e);
        setCategories([]);
      } finally {
        setCatLoading(false);
      }
    })();
  }, [open, loadItems]);

  // ── helpers ─────────────────────────────────────────────────────────────
  const getCatName = useCallback((cat) => {
    const map = { en: "nameEnglish", hi: "nameHindi", gu: "nameGujarati" };
    return cat[map[lang] || "nameEnglish"] || cat.nameEnglish || "";
  }, [lang]);

  // Item name: MenuItemGridPackage uses nameEnglish || name
  const getItemName = useCallback((item) => {
    return item.nameEnglish || item.name || "";
  }, []);

  const filteredCats = useMemo(() => {
    if (!catSearch.trim()) return categories;
    const q = catSearch.toLowerCase();
    return categories.filter((c) =>
      [c.nameEnglish, c.nameHindi, c.nameGujarati].filter(Boolean).some((n) => n.toLowerCase().includes(q))
    );
  }, [categories, catSearch]);

  const handleCatClick = useCallback((catId) => {
    setActiveCatId(catId);
    setItemSearch("");
    loadItems(catId);
  }, [loadItems]);

  // Item ID field: MenuItemGridPackage uses item.id
  const toggleItem = useCallback((catId, itemId) => {
    setSelected((prev) => {
      const s = new Set(prev[catId] || []);
      s.has(itemId) ? s.delete(itemId) : s.add(itemId);
      return { ...prev, [catId]: s };
    });
  }, []);

  const totalSelected = useMemo(() =>
    Object.values(selected).reduce((n, s) => n + s.size, 0), [selected]);
  const activeCatCount = useMemo(() =>
    Object.values(selected).filter((s) => s.size > 0).length, [selected]);
  const estimatedTotal = parseFloat(form.price || 0) * (parseInt(form.guestMin || 0) || 1);

  const activeItems = useMemo(() => {
    if (!activeCatId) return [];
    const items = itemsByCategory[activeCatId] || [];
    if (!itemSearch.trim()) return items;
    const q = itemSearch.toLowerCase();
    return items.filter((it) =>
      (it.nameEnglish || it.name || "").toLowerCase().includes(q)
    );
  }, [activeCatId, itemsByCategory, itemSearch]);

  const activeCatSel = useMemo(() =>
    selected[activeCatId] || new Set(), [selected, activeCatId]);

  const safeImg = (path) => {
    if (
      path && typeof path === "string" && path.trim() !== "" &&
      path !== "null" && path !== "undefined" &&
      !path.toLowerCase().includes("/null") &&
      /\.(jpg|jpeg|png|webp|gif)$/i.test(path)
    ) return path;
    return toAbsoluteUrl("/media/menu/noImage.jpg");
  };

  // ── validation ──────────────────────────────────────────────────────────
  const validateStep0 = () => {
    const errs = {};
    if (!form.packageName.trim()) errs.packageName = "Package name is required";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) errs.price = "Enter a valid price";
    if (form.guestMin && form.guestMax && Number(form.guestMin) > Number(form.guestMax))
      errs.guestMin = "Min guests cannot exceed max";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    setStep((s) => Math.min(s + 1, 2));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 0));

  // ── Save — build payload using item.id (MenuItemGridPackage field) ──────
  const handleSave = () => {
    if (!form.packageName.trim() || totalSelected === 0) return;
    const customPackageDetails = categories
      .filter((cat) => (selected[cat.id]?.size || 0) > 0)
      .map((cat) => {
        const allItems = itemsByCategoryRef.current[cat.id] || [];
        const selIds = selected[cat.id] || new Set();
        return {
          menuId: cat.id,
          menuName: cat.nameEnglish,
          menuNameHindi: cat.nameHindi || cat.nameEnglish,
          menuNameGujarati: cat.nameGujarati || cat.nameEnglish,
          customPackageMenuItemDetails: allItems
            .filter((it) => selIds.has(Number(it.id)))
            .map((it) => ({
              menuItemId: Number(it.id),
              itemName: it.nameEnglish || it.name || "",
              itemNameHindi: it.nameHindi || it.nameEnglish || it.name || "",
              itemNameGujarati: it.nameGujarati || it.nameEnglish || it.name || "",
              itemPrice: Number(it.itemPrice ?? it.rate ?? 0),
            })),
        };
      });
    onSave?.({
      packageName: form.packageName,
      price: parseFloat(form.price || 0),
      guestMin: parseInt(form.guestMin || 0),
      guestMax: parseInt(form.guestMax || 0),
      customPackageDetails,
      totalSelectedItems: totalSelected,
    });
    onClose?.();
  };

  const inputCls = (err) =>
    `w-full h-10 rounded-lg border px-3 text-sm text-slate-800 placeholder-slate-400
     focus:outline-none focus:ring-2 transition bg-white
     ${err ? "border-red-300 focus:ring-red-200 focus:border-red-400" : "border-slate-200 focus:ring-blue-200 focus:border-blue-400"}`;

 
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full sm:w-[1040px] sm:max-w-[96vw] h-[95vh] sm:max-h-[90vh] bg-white sm:rounded-2xl
                       shadow-2xl border border-slate-100 overflow-hidden flex flex-col z-10"
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* ── Header ── */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
                  <Package size={17} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 leading-tight">Create Custom Package</h2>
                  <p className="text-[11px] text-slate-400">
                    {step === 0 ? "Enter package details" : step === 1 ? "Choose categories & items" : "Review your selection"}
                  </p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                <X size={16} />
              </button>
            </div>

            <StepBar current={step} />

            {/* ── Body ── */}
            <div className="flex-1 overflow-hidden min-h-0">
              <AnimatePresence mode="wait">

                {/* STEP 0 — Package Info */}
                {step === 0 && (
                  <motion.div key="step0"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="h-full overflow-y-auto px-8 py-6"
                  >
                    <div className=" mx-auto flex flex-col gap-5">
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-blue-700">Fill in the package details below, then proceed to select menu items in the next step.</p>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                          <Tag size={12} /> Package Name <span className="text-red-400">*</span>
                        </label>
                        <input className={inputCls(formErrors.packageName)} placeholder="e.g. Royal Wedding Feast"
                          value={form.packageName}
                          onChange={(e) => { setForm((f) => ({ ...f, packageName: e.target.value })); setFormErrors((f) => ({ ...f, packageName: "" })); }} />
                        {formErrors.packageName && <p className="text-[11px] text-red-500 mt-1">{formErrors.packageName}</p>}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                          <DollarSign size={12} /> Price per Plate (₹) <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">₹</span>
                          <input className={`${inputCls(formErrors.price)} pl-6`} placeholder="0" type="tel" min="0"
                            value={form.price}
                            onChange={(e) => { setForm((f) => ({ ...f, price: e.target.value })); setFormErrors((f) => ({ ...f, price: "" })); }} />
                        </div>
                        {formErrors.price && <p className="text-[11px] text-red-500 mt-1">{formErrors.price}</p>}
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-slate-600 mb-1.5 flex items-center gap-1.5">
                          <Users size={12} /> Guest Range (optional)
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <input className={inputCls(formErrors.guestMin)} placeholder="Min guests" type="tel" min="0"
                              value={form.guestMin}
                              onChange={(e) => { setForm((f) => ({ ...f, guestMin: e.target.value })); setFormErrors((f) => ({ ...f, guestMin: "" })); }} />
                          </div>
                          <Minus size={14} className="text-slate-300 shrink-0" />
                          <div className="flex-1">
                            <input className={inputCls()} placeholder="Max guests" type="tel" min="0"
                              value={form.guestMax}
                              onChange={(e) => setForm((f) => ({ ...f, guestMax: e.target.value }))} />
                          </div>
                        </div>
                        {formErrors.guestMin && <p className="text-[11px] text-red-500 mt-1">{formErrors.guestMin}</p>}
                      </div>

                      {(form.packageName || form.price) && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50 p-4">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Preview</p>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="text-base font-bold text-slate-900">{form.packageName || "Package Name"}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{form.guestMin || "—"} – {form.guestMax || "—"} guests</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-extrabold text-blue-700">₹{form.price || "0"}</p>
                              <p className="text-[10px] text-slate-400">per plate</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* STEP 1 — Menu Selection */}
                {step === 1 && (
                  <motion.div key="step1"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="h-full flex min-h-0"
                  >
                    {/* Category Sidebar */}
                    <div className="w-52 shrink-0 border-r border-slate-100 flex flex-col bg-slate-50 min-h-0">
                      <div className="px-3 py-3 border-b border-slate-100 shrink-0">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Categories</p>
                        <div className="relative">
                          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input className="w-full h-7 pl-7 pr-2 text-[11px] border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 bg-white"
                            placeholder="Search…" value={catSearch} onChange={(e) => setCatSearch(e.target.value)} />
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto">
                        {catLoading ? (
                          <div className="flex items-center justify-center h-32 gap-2 text-slate-400 text-xs">
                            <Loader2 size={14} className="animate-spin" /> Loading…
                          </div>
                        ) : filteredCats.length === 0 ? (
                          <div className="text-center py-8 text-slate-400 text-xs px-3">
                            {catSearch ? "No categories found" : "No categories available"}
                          </div>
                        ) : (
                          filteredCats.map((cat) => (
                            <CategoryTab key={cat.id} cat={cat} isActive={activeCatId === cat.id}
                              selectedCount={selected[cat.id]?.size || 0}
                              onClick={() => handleCatClick(cat.id)} getCatName={getCatName} />
                          ))
                        )}
                      </div>

                      {totalSelected > 0 && (
                        <div className="px-3 py-3 border-t border-slate-200 bg-white shrink-0">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Selected</span>
                            <span className="font-bold text-blue-700">{totalSelected} items</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] mt-0.5">
                            <span className="text-slate-500">Categories</span>
                            <span className="font-bold text-emerald-600">{activeCatCount}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Items Panel */}
                    <div className="flex-1 flex flex-col min-h-0 min-w-0">
                      <div className="px-5 py-3 border-b border-slate-100 shrink-0 flex items-center gap-3 bg-white">
                        <div className="flex-1 relative">
                          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                          <input className="w-full h-8 pl-8 pr-3 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-300 bg-slate-50"
                            placeholder={activeCatId ? `Search in ${getCatName(categories.find(c => c.id === activeCatId) || {})}…` : "Search items…"}
                            value={itemSearch} onChange={(e) => setItemSearch(e.target.value)} />
                        </div>
                        {activeItems.length > 0 && (
                          <button
                            onClick={() => {
                              // Item ID field is item.id (from Getmenuitemsusingcatid)
                              const allIds = activeItems.map((it) => Number(it.id));
                              const allSel = allIds.every((id) => activeCatSel.has(id));
                              setSelected((prev) => ({ ...prev, [activeCatId]: allSel ? new Set() : new Set(allIds) }));
                            }}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-800 whitespace-nowrap border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition shrink-0"
                          >
                            {activeItems.every((it) => activeCatSel.has(Number(it.id))) ? "Deselect All" : "Select All"}
                          </button>
                        )}
                        <div className="flex border border-slate-200 rounded-lg overflow-hidden shrink-0">
                          <button onClick={() => setViewMode("grid")}
                            className={`px-2.5 py-1.5 transition ${viewMode === "grid" ? "bg-blue-600 text-white" : "bg-white text-slate-400 hover:bg-slate-50"}`}>
                            <Grid3X3 size={13} />
                          </button>
                          <button onClick={() => setViewMode("list")}
                            className={`px-2.5 py-1.5 transition ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-white text-slate-400 hover:bg-slate-50"}`}>
                            <List size={13} />
                          </button>
                        </div>
                      </div>

                      {activeCatId && (
                        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-800">
                              {getCatName(categories.find((c) => c.id === activeCatId) || {})}
                            </span>
                            {!loadingCats[activeCatId] && (
                              <span className="text-[11px] text-slate-400">
                                {activeItems.length} {activeItems.length === 1 ? "item" : "items"}
                                {itemSearch && ` matching "${itemSearch}"`}
                              </span>
                            )}
                          </div>
                          {activeCatSel.size > 0 && (
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                              {activeCatSel.size} selected
                            </span>
                          )}
                        </div>
                      )}

                      {/* Scrollable items area with sentinel for infinite scroll */}
                      <div ref={itemsPanelRef} className="flex-1 overflow-y-auto p-4">
                        {!activeCatId ? (
                          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                            <ShoppingBag size={32} className="text-slate-200" />
                            <p className="text-sm">Select a category to view items</p>
                          </div>
                        ) : loadingCats[activeCatId] && (itemsByCategory[activeCatId] || []).length === 0 ? (
                          <div className="h-40 flex items-center justify-center gap-2 text-slate-400 text-sm">
                            <Loader2 size={18} className="animate-spin" /> Loading items…
                          </div>
                        ) : activeItems.length === 0 ? (
                          <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-1">
                            <ShoppingBag size={24} className="text-slate-200" />
                            <p className="text-sm">{itemSearch ? "No items match your search" : "No items in this category"}</p>
                          </div>
                        ) : (
                          <>
                            <div className={viewMode === "grid"
                              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"
                              : "flex flex-col gap-2"
                            }>
                              {activeItems.map((item) => {
                                const itemId = Number(item.id);
                                const isSel = activeCatSel.has(itemId);
                                return (
                                  <ItemCard key={itemId} item={item} isSel={isSel}
                                    onToggle={() => toggleItem(activeCatId, itemId)}
                                    getItemName={getItemName} safeImg={safeImg} viewMode={viewMode} />
                                );
                              })}
                            </div>

                            {/* Infinite scroll sentinel */}
                            {hasMoreByCat[activeCatId] && (
                              <div ref={observerRef} className="py-4 flex items-center justify-center">
                                {loadingCats[activeCatId] && (
                                  <>
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                    <span className="ml-2 text-sm text-slate-500">Loading more items…</span>
                                  </>
                                )}
                              </div>
                            )}

                            {!hasMoreByCat[activeCatId] && (itemsByCategory[activeCatId] || []).length > 0 && !itemSearch && (
                              <p className="text-center text-[11px] text-slate-400 py-4">
                                All items loaded ({(itemsByCategory[activeCatId] || []).length} total)
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2 — Review */}
                {step === 2 && (
                  <motion.div key="step2"
                    initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    className="h-full overflow-y-auto px-6 py-5"
                  >
                    <div className="max-w-2xl mx-auto flex flex-col gap-4">
                      {totalSelected === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                          <ShoppingBag size={40} className="text-slate-200" />
                          <p className="text-sm font-medium">No items selected yet</p>
                          <button onClick={() => setStep(1)} className="text-sm text-blue-600 font-semibold hover:underline">
                            Go back to select items
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-5">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Package Details</p>
                                <h3 className="text-xl font-extrabold text-slate-900">{form.packageName}</h3>
                                <p className="text-sm text-slate-500 mt-1">
                                  {form.guestMin && form.guestMax ? `${form.guestMin} – ${form.guestMax} guests`
                                    : form.guestMin ? `From ${form.guestMin} guests` : "Any guest count"}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-extrabold text-blue-700">₹{form.price}</p>
                                <p className="text-xs text-slate-400">per plate</p>
                                {form.price && form.guestMin && (
                                  <p className="text-xs font-semibold text-slate-600 mt-1">
                                    Min. ₹{estimatedTotal.toLocaleString("en-IN")} total
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Selected Items — {totalSelected} total across {activeCatCount} {activeCatCount === 1 ? "category" : "categories"}
                          </p>

                          {categories.filter((cat) => (selected[cat.id]?.size || 0) > 0).map((cat) => {
                            const allItems = itemsByCategoryRef.current[cat.id] || [];
                            const selIds = selected[cat.id] || new Set();
                            // Use item.id (from Getmenuitemsusingcatid)
                            const selItems = allItems.filter((it) => selIds.has(Number(it.id)));
                            return (
                              <div key={cat.id} className="rounded-xl border border-slate-200 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100">
                                  <p className="text-sm font-bold text-slate-800">{getCatName(cat)}</p>
                                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                                    {selItems.length} items
                                  </span>
                                </div>
                                <div className="p-3 flex flex-wrap gap-2">
                                  {selItems.map((item) => (
                                    <div key={item.id}
                                      className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
                                      <div className="w-6 h-6 rounded overflow-hidden shrink-0 bg-slate-100">
                                        <img src={safeImg(item.imagePath)} alt=""
                                          className="w-full h-full object-cover"
                                          onError={(e) => { e.target.src = toAbsoluteUrl("/media/menu/noImage.jpg"); }} />
                                      </div>
                                      <span className="text-xs font-medium text-slate-700">{getItemName(item)}</span>
                                      <button onClick={() => toggleItem(cat.id, Number(item.id))}
                                        className="text-slate-300 hover:text-red-500 transition ml-0.5">
                                        <X size={11} />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* ── Footer ── */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white shrink-0">
              <button onClick={step === 0 ? onClose : handleBack}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 rounded-xl px-5 py-2 transition flex items-center gap-1.5">
                {step === 0 ? <><X size={14} /> Cancel</> : <><ChevronRight size={14} className="rotate-180" /> Back</>}
              </button>

              <div className="flex items-center gap-3">
                {step === 1 && totalSelected > 0 && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-xl">
                    <Check size={13} className="text-emerald-500" />
                    {totalSelected} items in {activeCatCount} {activeCatCount === 1 ? "category" : "categories"}
                  </motion.div>
                )}
                {step < 2 ? (
                  <button onClick={handleNext} disabled={step === 1 && totalSelected === 0}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-2.5 rounded-xl transition shadow-md flex items-center gap-2">
                    {step === 0 ? "Next: Select Items" : "Review Package"}
                    <ChevronRight size={15} />
                  </button>
                ) : (
                  <button onClick={handleSave} disabled={!form.packageName.trim() || totalSelected === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-7 py-2.5 rounded-xl transition shadow-md flex items-center gap-2">
                    <Check size={15} />
                    Save Package
                    <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{totalSelected}</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}