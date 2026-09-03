import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { VerifyMenuLink, AddMenuprep } from "@/services/apiServices";
import Swal from "sweetalert2";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Save,
  Eye,
  EyeOff,
  UtensilsCrossed,
  ListChecks,
  X,
  MapPin,
  Users,
  Calendar,
  Tag,
  ArrowRight,
  Leaf,
  Flame,
} from "lucide-react";
import { getNewToken } from "../../../services/axiosInstance";

// ─── Verify Modal ──────────────────────────────────────────────────────────────
const VerifyModal = ({ token, onVerified }) => {
  const [accessCode, setAccessCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleVerify = async () => {
    if (!accessCode.trim()) {
      Swal.fire({ icon: "warning", title: "Please enter the access code" });
      return;
    }
    try {
      setVerifying(true);
      const res = await VerifyMenuLink({ token, accessCode });
      if (res?.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Access Granted!",
          text: res?.data?.msg || "Welcome! You can now view and select menu items.",
          timer: 1500,
          showConfirmButton: false,
        });
        onVerified(res.data.data);
      } else {
        Swal.fire({
          icon: "error",
          title: res?.data?.msg || "Invalid code or expired link",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err?.response?.data?.msg || "Verification failed",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-10 border border-gray-100">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-primary flex items-center justify-center">
            <UtensilsCrossed size={28} className="text-white" />
          </div>
          <h2 className="text-[22px] font-bold text-gray-800 m-0">
            Menu Access
          </h2>
          <p className="text-sm text-gray-500 mt-1.5">
            Enter the access code shared with you to view the menu
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block mb-1.5">
              Access Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full h-11 px-3 rounded-xl border text-[15px] font-bold font-mono tracking-widest text-primary bg-gray-50 outline-none transition-colors ${focused ? "border-primary" : "border-gray-200"}`}
              placeholder="e.g. MKC145D260027"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              autoFocus
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
            />
          </div>
          <button
            className={`w-full h-11 rounded-xl border-none text-white text-[15px] font-bold flex items-center justify-center gap-2 transition-colors ${verifying ? "bg-gray-400 cursor-not-allowed" : "bg-primary cursor-pointer"}`}
            onClick={handleVerify}
            disabled={verifying}
          >
            {verifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              "Access Menu →"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Item Card (redesigned: taller image on top, full-width-grid friendly) ─────
const ItemCard = ({ item, isSelected, onToggle, showImage }) => (
  <div
    onClick={() => onToggle(item.menuItemId)}
    className={[
      "relative flex flex-col rounded-2xl border cursor-pointer select-none transition-all overflow-hidden h-full",
      isSelected
        ? "border-primary/50 bg-primary/[0.03] ring-1 ring-primary/30"
        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md",
    ].join(" ")}
  >
    {/* Image */}
    {showImage && (
      <div className="relative w-full h-36 bg-gray-100 shrink-0 overflow-hidden">
        {item.imagePath &&
        item.imagePath !== "null" &&
        /\.(jpg|jpeg|png|webp|gif)$/i.test(item.imagePath) ? (
          <img
            src={item.imagePath}
            alt={item.menuItemName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-300 bg-gray-50">
            {(item.menuItemName || "?").charAt(0)}
          </div>
        )}

        {/* Checkbox overlay */}
        <div
          className={`absolute top-2.5 left-2.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all shadow-sm ${
            isSelected
              ? "border-primary bg-primary"
              : "border-white bg-white/90"
          }`}
        >
          {isSelected && (
            <Check size={12} className="text-white" strokeWidth={3.5} />
          )}
        </div>

        {/* Added badge */}
        {isSelected && (
          <span className="absolute top-2.5 right-2.5 text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full leading-none flex items-center gap-1 shadow-sm">
            <Check size={9} strokeWidth={3.5} /> Added
          </span>
        )}
      </div>
    )}

    {/* Text content */}
    <div className="flex-1 flex flex-col p-3.5 relative">
      {/* If no image, still show checkbox/badge inline */}
      {!showImage && (
        <div className="flex items-center justify-between mb-1.5">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
              isSelected ? "border-primary bg-primary" : "border-gray-300 bg-white"
            }`}
          >
            {isSelected && (
              <Check size={12} className="text-white" strokeWidth={3.5} />
            )}
          </div>
          {isSelected && (
            <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full leading-none flex items-center gap-1">
              <Check size={9} strokeWidth={3.5} /> Added
            </span>
          )}
        </div>
      )}

      <p className="font-bold text-[13.5px] leading-snug text-gray-800 m-0">
        {item.menuItemName}
      </p>

      {item.itemType && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-0.5 m-0">
          {item.itemType}
        </p>
      )}

      {item.itemSlogan && (
        <p className="text-[12px] text-gray-500 mt-1 leading-snug line-clamp-2 m-0">
          {item.itemSlogan}
        </p>
      )}

      {(item.isVeg !== undefined || item.isSpicy !== undefined) && (
        <div className="flex items-center gap-2 mt-auto pt-1.5">
          {item.isVeg && (
            <span className="w-4 h-4 rounded-full border border-green-500 flex items-center justify-center">
              <Leaf size={9} className="text-green-500" />
            </span>
          )}
          {item.isSpicy && (
            <span className="w-4 h-4 rounded-full border border-red-400 flex items-center justify-center">
              <Flame size={9} className="text-red-400" />
            </span>
          )}
        </div>
      )}
    </div>
  </div>
);

// ─── Mobile Item Card (horizontal: checkbox, image, title, tag, ADDED badge, description) ──
const MobileItemCard = ({ item, isSelected, onToggle, showImage }) => (
  <div
    onClick={() => onToggle(item.menuItemId)}
    className={[
      "relative flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer select-none transition-all bg-white",
      isSelected
        ? "border-primary/40 border-l-4 border-l-primary bg-primary/[0.03]"
        : "border-gray-200",
    ].join(" ")}
  >
    {/* Checkbox */}
    <div
      className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
        isSelected ? "border-primary bg-primary" : "border-gray-300 bg-white"
      }`}
    >
      {isSelected && <Check size={12} className="text-white" strokeWidth={3.5} />}
    </div>

    {/* Thumbnail */}
    {showImage && (
      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
        {item.imagePath &&
        item.imagePath !== "null" &&
        /\.(jpg|jpeg|png|webp|gif)$/i.test(item.imagePath) ? (
          <img
            src={item.imagePath}
            alt={item.menuItemName}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-300">
            {(item.menuItemName || "?").charAt(0)}
          </div>
        )}
      </div>
    )}

    {/* Text content */}
    <div className="flex-1 min-w-0 pr-16">
      <p className="font-bold text-[14px] leading-snug text-gray-800 m-0">
        {item.menuItemName}
      </p>

      {item.itemType && (
        <p className="text-[12.5px] font-semibold text-primary mt-1 m-0">
          {item.itemType}
        </p>
      )}

      {item.itemSlogan && (
        <p className="text-[12.5px] text-gray-500 mt-1 leading-snug line-clamp-2 m-0">
          {item.itemSlogan}
        </p>
      )}

      {(item.isVeg !== undefined || item.isSpicy !== undefined) && (
        <div className="flex items-center gap-2 mt-1.5">
          {item.isVeg && (
            <span className="w-4 h-4 rounded-full border border-green-500 flex items-center justify-center">
              <Leaf size={9} className="text-green-500" />
            </span>
          )}
          {item.isSpicy && (
            <span className="w-4 h-4 rounded-full border border-red-400 flex items-center justify-center">
              <Flame size={9} className="text-red-400" />
            </span>
          )}
        </div>
      )}
    </div>

    {/* Added badge */}
    {isSelected && (
      <span className="absolute top-3.5 right-3.5 shrink-0 text-[10px] bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full leading-none tracking-wide">
        ADDED
      </span>
    )}
  </div>
);

// ─── Category dropdown list (shared between desktop pill + mobile card) ────────
const CategoryDropdownList = ({ grouped, selectedIds, activeCatName, onSelect }) => (
  <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden max-h-72 overflow-y-auto">
    {grouped.map((g) => {
      const count = g.allItems.filter((it) => selectedIds.has(it.menuItemId)).length;
      const done = count === g.allItems.length && g.allItems.length > 0;
      const active = g.catName === activeCatName;
      return (
        <button
          key={g.catName}
          type="button"
          onClick={() => onSelect(g.catName)}
          className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left text-[13px] font-semibold border-b border-gray-50 last:border-b-0 transition-colors ${
            active ? "bg-primary/5 text-primary" : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <span className="truncate">{g.catName}</span>
          <span
            className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full leading-none ${
              done ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}
          >
            {count}/{g.allItems.length}
          </span>
        </button>
      );
    })}
  </div>
);

// ─── Selections list content (shared between desktop sidebar + mobile modal) ───
const SelectionsListContent = ({ grouped, selectedIds }) => {
  const selectedGroups = grouped
    .map((g) => ({
      ...g,
      chosen: g.allItems.filter((it) => selectedIds.has(it.menuItemId)),
    }))
    .filter((g) => g.chosen.length > 0);

  if (selectedGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
          <UtensilsCrossed size={28} className="text-gray-300" />
        </div>
        <p className="text-sm font-semibold text-gray-500 m-0">
          Nothing selected yet
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Tap items on the menu to add them
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      {selectedGroups.map((g) => (
        <div key={g.catName}>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[11px] font-bold text-primary uppercase tracking-wider m-0">
              {g.catName}
            </p>
            <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full leading-none">
              {g.chosen.length} item{g.chosen.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {g.chosen.map((item) => (
              <div key={item.menuItemId} className="flex items-center gap-2">
                <Check size={13} className="text-green-500 shrink-0" strokeWidth={3} />
                <p className="text-[13px] text-gray-700 font-medium m-0 leading-tight truncate">
                  {item.menuItemName}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Desktop slide-in sidebar ("Your Selections") ───────────────────────────────
const SelectionsSidebar = ({ open, onClose, grouped, selectedIds, totalSelected }) => {
  if (!open) return null;
  return (
    <div className="hidden md:flex fixed inset-0 z-[10000]">
      <div className="flex-1 bg-black/30" onClick={onClose} />
      <div className="w-[380px] shrink-0 bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right">
        <div className="shrink-0 flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100">
          <div>
            <p className="text-lg font-bold text-gray-800 m-0">Your Selections</p>
            <p className="text-xs text-gray-400 mt-0.5 m-0">
              {totalSelected} items selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-none cursor-pointer"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0">
          <SelectionsListContent grouped={grouped} selectedIds={selectedIds} />
        </div>
        <div className="shrink-0 p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl border-none bg-primary text-white text-sm font-bold cursor-pointer hover:opacity-90"
          >
            Return to Workspace
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Mobile full-screen selections modal ────────────────────────────────────────
const SelectionsModalMobile = ({ open, onClose, grouped, selectedIds, totalSelected }) => {
  if (!open) return null;
  const stationCount = grouped.filter((g) =>
    g.allItems.some((it) => selectedIds.has(it.menuItemId)),
  ).length;

  return (
    <div className="flex md:hidden fixed inset-0 z-[10000] bg-white flex-col">
      <div className="shrink-0 flex justify-center pt-2.5 pb-1">
        <div className="w-10 h-1 rounded-full bg-gray-200" />
      </div>
      <div className="shrink-0 flex items-start justify-between px-5 pb-4 border-b border-gray-100">
        <div>
          <p className="text-lg font-bold text-gray-800 m-0">Your Selections</p>
          <p className="text-xs text-gray-400 mt-0.5 m-0">
            {totalSelected} items selected across {stationCount} station
            {stationCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 border-none cursor-pointer"
        >
          <X size={16} className="text-gray-500" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <SelectionsListContent grouped={grouped} selectedIds={selectedIds} />
      </div>
      <div className="shrink-0 p-4 border-t border-gray-100">
        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl border-none bg-primary text-white text-sm font-bold cursor-pointer"
        >
          Return to Workspace
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const MenuViewPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const ut = searchParams.get("ut");
  const [ready, setReady] = useState(false);
  const [menuData, setMenuData] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showImage, setShowImage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const [activeCatName, setActiveCatName] = useState("");
  const [catPickerOpen, setCatPickerOpen] = useState(false);
  const [showSelections, setShowSelections] = useState(false);
  const [eventSummaryOpen, setEventSummaryOpen] = useState(true);

  // NOTE: separate refs for desktop vs mobile category picker.
  // The old code only tracked the desktop ref, so on mobile every
  // tap (including taps on category options) was seen as "outside"
  // and closed the dropdown on mousedown before onClick could fire.
  const desktopCatPickerRef = useRef(null);
  const mobileCatPickerRef = useRef(null);

  useEffect(() => {
    const selectors = [
      "[class*='sidebar']",
      "[id*='sidebar']",
      "[class*='Sidebar']",
      "[id*='Sidebar']",
      "aside",
      "nav",
      "[class*='layout']",
      "[class*='Layout']",
      "[class*='drawer']",
      "[class*='Drawer']",
    ];
    const hidden = [];
    selectors.forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        if (!el.closest("#menu-share-page")) {
          hidden.push({ el, prev: el.style.display });
          el.style.display = "none";
        }
      });
    });
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      hidden.forEach(({ el, prev }) => {
        el.style.display = prev;
      });
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      if (ut) {
        sessionStorage.setItem("shareToken", decodeURIComponent(ut));
      }
      const existing = localStorage.getItem("token");
      if (!existing) {
        try {
          await getNewToken();
        } catch (e) {
          console.error("Failed to get system token", e);
        }
      }
      setReady(true);
    };
    init();

    return () => {
      sessionStorage.removeItem("shareToken");
    };
  }, [ut, token]);

  // Close category dropdown on outside click — checks BOTH desktop and
  // mobile containers so a tap inside either one isn't treated as "outside".
  useEffect(() => {
    const handler = (e) => {
      const insideDesktop =
        desktopCatPickerRef.current && desktopCatPickerRef.current.contains(e.target);
      const insideMobile =
        mobileCatPickerRef.current && mobileCatPickerRef.current.contains(e.target);
      if (!insideDesktop && !insideMobile) {
        setCatPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleVerified = (data) => {
    setMenuData(data);
    const pre = new Set();
    (data.selectedMenuPreparationItems || []).forEach((cat) => {
      (cat.selectedMenuPreparationItems || []).forEach((it) =>
        pre.add(it.menuItemId),
      );
    });
    setSelectedIds(pre);
  };

  const grouped = useMemo(() => {
    if (!menuData) return [];
    const map = new Map();
    (menuData.menuPreparationItems || []).forEach((catGroup) => {
      const key = catGroup.nameEnglish || "Other";
      if (!map.has(key)) {
        map.set(key, {
          catName: key,
          catId: catGroup.categoryId || 0,
          catNameHindi: catGroup.nameHindi || key,
          catNameGujarati: catGroup.nameGujarati || key,
          slogan: catGroup.items?.[0]?.categorySlogan || "",
          allItems: [],
        });
      }
      (catGroup.items || []).forEach((it) => {
        map.get(key).allItems.push({
          menuItemId: it.menuItemId,
          menuItemName: it.menuItemName,
          menuItemNameHindi: it.menuItemNameHindi || it.menuItemName,
          menuItemNameGujarati: it.menuItemNameGujarati || it.menuItemName,
          menuCategoryId: it.menuCategoryId,
          menuCategoryName: key,
          menuCategoryNameHindi: catGroup.nameHindi || key,
          menuCategoryNameGujarati: catGroup.nameGujarati || key,
          imagePath: it.imagePath || "",
          itemSlogan: it.itemSlogan || "",
          itemPrice: it.itemPrice || 0,
          itemType: it.itemType || it.cuisineType || "",
          isVeg: typeof it.isVeg === "boolean" ? it.isVeg : undefined,
          isSpicy: typeof it.isSpicy === "boolean" ? it.isSpicy : undefined,
        });
      });
    });
    return Array.from(map.values());
  }, [menuData]);

  useEffect(() => {
    if (grouped.length > 0 && !grouped.find((g) => g.catName === activeCatName)) {
      setActiveCatName(grouped[0].catName);
    }
  }, [grouped, activeCatName]);

  const activeGroup = grouped.find((g) => g.catName === activeCatName) || grouped[0];

  const totalItems = useMemo(
    () => grouped.reduce((s, g) => s + g.allItems.length, 0),
    [grouped],
  );
  const totalSelected = selectedIds.size;
  const selectionPct = totalItems
    ? Math.round((totalSelected / totalItems) * 100)
    : 0;
  const activeSelectedCount =
    activeGroup?.allItems.filter((it) => selectedIds.has(it.menuItemId)).length || 0;

  const handleToggle = (id) => {
    setIsDirty(true);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Shared category select handler — closes the picker after selection.
  const handleCategorySelect = (name) => {
    setActiveCatName(name);
    setCatPickerOpen(false);
  };

  const buildPayload = () => {
    if (!menuData) return null;
    const prep = menuData.menuPreparation || {};
    return {
      id: prep.id || 0,
      token,
      eventFunctionId: menuData.eventFunctionId,
      pax: prep.pax || 0,
      defaultPrice: prep.defaultPrice || 0,
      price: prep.price || 0,
      sortorder: prep.sortorder || 0,
      isPackage: prep.isPackage || false,
      packageId: prep.packageId || 0,
      packageName: prep.packageName || "",
      packagePrice: prep.packagePrice || 0,
      selectedMenuPreparation: grouped.map((group, ci) => ({
        menuCategoryId: Number(group.catId || 0),
        menuCategoryName: group.catName,
        menuCategoryNameHindi: group.catNameHindi,
        menuCategoryNameGujarati: group.catNameGujarati,
        menuNotes: "",
        menuNotesHindi: "",
        menuNotesGujarati: "",
        menuSlogan: group.slogan || "",
        menuSortOrder: ci,
        startTime: "",
        isMenuCatAddons: false,
        bgImgId: 0,
        catImgId: 0,
        catSpace: 0,
        subCat: "",
        subCatHindi: "",
        subCatGujarati: "",
        selectedMenuPreparationItems: group.allItems
          .filter((it) => selectedIds.has(it.menuItemId))
          .map((it, ii) => ({
            id: 0,
            itemNotes: "",
            itemNotesHindi: "",
            itemNotesGujarati: "",
            itemSlogan: it.itemSlogan || "",
            itemSortOrder: ii,
            itemPrice: Number(it.itemPrice || 0),
            menuItemId: Number(it.menuItemId),
            menuItemName: it.menuItemName || "",
            menuItemNameHindi: it.menuItemNameHindi || it.menuItemName || "",
            menuItemNameGujarati:
              it.menuItemNameGujarati || it.menuItemName || "",
            isItemAddons: false,
            itemSpace: 0,
            subItem: "",
            subItemHindi: "",
            subItemGujarati: "",
          })),
      })),
    };
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = buildPayload();
      if (!payload) return;
      const res = await AddMenuprep(payload);
      if (res?.data?.success) {
        setIsDirty(false);
        Swal.fire({
          icon: "success",
          title: "Menu saved!",
          text: res?.data?.msg || "Your selection has been submitted.",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: res?.data?.msg || "Failed to save",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: err?.response?.data?.msg || "Something went wrong",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!ready)
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!menuData)
    return <VerifyModal token={token} onVerified={handleVerified} />;

  const prep = menuData.menuPreparation || {};
  const func = prep.eventFunction || {};

  const eventFields = [
    { key: "function", label: "Function", value: func.nameEnglish, icon: UtensilsCrossed },
    {
      key: "package",
      label: "Package",
      value: prep.packageName,
      sub: prep.packagePrice > 0 ? `₹${prep.packagePrice}/Person` : null,
      icon: Tag,
      accent: true,
    },
    { key: "location", label: "Location", value: func.function_venue || func.venue, icon: MapPin },
    { key: "persons", label: "Persons", value: func.pax, icon: Users },
    { key: "datetime", label: "Date & Time", value: func.functionStartDateTime, icon: Calendar },
  ].filter((f) => f.value);

  // ═══ TOP BRAND BAR (shared) ═══════════════════════════════════════════════
  const topBar = (
    <div className="shrink-0 bg-white border-b border-gray-200 z-10">
      <div className="flex items-center justify-between px-4 h-[52px] gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl shrink-0 bg-primary flex items-center justify-center">
            <UtensilsCrossed size={15} className="text-white" />
          </div>
          <p className="m-0 text-sm font-bold text-gray-800 leading-tight">
            Menu Planning
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowImage((v) => !v)}
            className="hidden sm:flex h-8 px-3 rounded-lg border border-gray-200 bg-white text-[11px] font-semibold text-gray-500 items-center gap-1.5 cursor-pointer hover:bg-gray-50"
          >
            {showImage ? <EyeOff size={12} /> : <Eye size={12} />}
            {showImage ? "Hide" : "Show"} Images
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={`h-9 px-4 rounded-xl border-none text-xs font-bold flex items-center gap-1.5 transition-all ${
              isDirty && !saving
                ? "bg-primary text-white cursor-pointer hover:opacity-90"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Save size={13} />
            <span className="hidden sm:inline">Save Changes</span>
            <span className="sm:hidden">Save</span>
          </button>
        </div>
      </div>
      <div className="h-[3px] bg-gray-100">
        <div
          className="h-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${selectionPct}%` }}
        />
      </div>
    </div>
  );

  // ═══ DESKTOP EVENT INFO STRIP ════════════════════════════════════════════
  const desktopEventStrip = eventFields.length > 0 && (
    <div className="shrink-0 mx-4 mt-4 mb-2 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex divide-x divide-gray-100">
        {eventFields.map((f) => (
          <div key={f.key} className="flex-1 px-4 py-2.5 min-w-0">
            <p className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest m-0">
              <f.icon size={10} /> {f.label}
            </p>
            <p
              className={`text-sm font-bold m-0 mt-0.5 truncate ${f.accent ? "text-primary" : "text-gray-800"}`}
            >
              {f.value}
            </p>
            {f.sub && <p className="text-[11px] text-primary/70 m-0">{f.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );

  // ═══ DESKTOP category selector + "Your Selections" pill ════════════════════
  const desktopCategoryRow = (
    <div className="shrink-0 flex items-center justify-between gap-3 px-4 pb-2">
      <div className="relative" ref={desktopCatPickerRef}>
        <button
          onClick={() => setCatPickerOpen((v) => !v)}
          className="flex items-center gap-2.5 h-10 px-3.5 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50"
        >
          <span className="w-3.5 h-3.5 rounded-full border-2 border-primary shrink-0" />
          <span className="text-[13px] font-bold text-gray-800">
            {activeGroup?.catName}
          </span>
          <span className="text-[12px] text-gray-400">
            — {activeSelectedCount} of {activeGroup?.allItems.length || 0} Selected
          </span>
          {catPickerOpen ? (
            <ChevronUp size={14} className="text-gray-400" />
          ) : (
            <ChevronDown size={14} className="text-gray-400" />
          )}
        </button>
        {catPickerOpen && (
          <div className="absolute top-[calc(100%+6px)] left-0 z-20 w-72">
            <CategoryDropdownList
              grouped={grouped}
              selectedIds={selectedIds}
              activeCatName={activeCatName}
              onSelect={handleCategorySelect}
            />
          </div>
        )}
      </div>

      <button
        onClick={() => setShowSelections(true)}
        className="flex items-center gap-3 h-10 pl-3 pr-4 rounded-xl border border-gray-200 bg-white cursor-pointer hover:bg-gray-50"
      >
        <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Check size={13} className="text-primary" strokeWidth={3} />
        </span>
        <span className="text-left">
          <span className="block text-[12px] font-bold text-gray-800 leading-tight">
            Your Selections
          </span>
          <span className="block text-[11px] text-gray-400 leading-tight">
            {totalSelected} items
          </span>
        </span>
        <span className="text-[12px] font-bold text-primary flex items-center gap-0.5">
          View <ArrowRight size={12} />
        </span>
      </button>
    </div>
  );

  // ═══════════════════════════════════ DESKTOP LAYOUT ═══════════════════════
  const desktopLayout = (
    <div className="hidden md:flex flex-col h-full overflow-hidden">
      {topBar}
      <div className="flex-1 flex flex-col overflow-hidden">
        {desktopEventStrip}
        {desktopCategoryRow}

        <div className="shrink-0 px-4 pb-2 flex items-baseline gap-2">
          <h2 className="text-lg font-bold text-gray-800 m-0">
            {activeGroup?.catName}
          </h2>
          {activeGroup?.slogan && (
            <span className="text-[13px] text-gray-400">{activeGroup.slogan}</span>
          )}
        </div>

        {/* Full-width responsive grid — no more max-w cap */}
        <div className="flex-1 overflow-y-auto min-h-0 px-4 py-6">
          {(!activeGroup || activeGroup.allItems.length === 0) ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400">
              <UtensilsCrossed size={36} className="mx-auto mb-3 opacity-20" />
              <p className="m-0 text-sm">No menu items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
              {activeGroup.allItems.map((item) => (
                <ItemCard
                  key={item.menuItemId}
                  item={item}
                  isSelected={selectedIds.has(item.menuItemId)}
                  onToggle={handleToggle}
                  showImage={showImage}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {isDirty && (
        <div className="shrink-0 z-20 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.07)] px-6 py-3 flex items-center justify-between">
          <p className="text-sm text-red-500 font-medium m-0">
            You have unsaved changes
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`h-10 px-6 rounded-xl border-none text-sm font-bold flex items-center gap-2 ${saving ? "bg-gray-300 text-gray-400 cursor-not-allowed" : "bg-primary text-white cursor-pointer hover:opacity-90"}`}
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );

  // ═══════════════════════════════════ MOBILE LAYOUT ════════════════════════
  const mobileLayout = (
    <div className="flex md:hidden flex-col h-full overflow-hidden">
      {topBar}

      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Event Summary (collapsible) */}
        {eventFields.length > 0 && (
          <div className="mx-3 mt-3 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setEventSummaryOpen((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-transparent border-none cursor-pointer"
            >
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                Event Summary
              </span>
              {eventSummaryOpen ? (
                <ChevronUp size={14} className="text-gray-400" />
              ) : (
                <ChevronDown size={14} className="text-gray-400" />
              )}
            </button>
            {eventSummaryOpen && (
              <div className="grid grid-cols-2 divide-x divide-y divide-gray-100 border-t border-gray-100">
                {eventFields.map((f) => (
                  <div key={f.key} className="px-4 py-2.5">
                    <p className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-widest m-0">
                      <f.icon size={10} /> {f.label}
                    </p>
                    <p
                      className={`text-sm font-bold m-0 mt-0.5 ${f.accent ? "text-primary" : "text-gray-800"}`}
                    >
                      {f.value}
                    </p>
                    {f.sub && (
                      <p className="text-[11px] text-primary/70 m-0">{f.sub}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Current Category card — now with its own ref, fixing the tap bug */}
        <div className="mx-3 mt-3 relative" ref={mobileCatPickerRef}>
          <button
            type="button"
            onClick={() => setCatPickerOpen((v) => !v)}
            className="w-full flex items-center justify-between gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <UtensilsCrossed size={16} className="text-primary" />
              </span>
              <span className="text-left min-w-0">
                <span className="block text-sm font-bold text-gray-800 truncate">
                  {activeGroup?.catName}
                </span>
                {activeGroup?.slogan && (
                  <span className="block text-[11px] text-gray-400 truncate">
                    {activeGroup.slogan}
                  </span>
                )}
              </span>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full leading-none whitespace-nowrap">
                {activeSelectedCount} of {activeGroup?.allItems.length || 0} Selected
              </span>
              {catPickerOpen ? (
                <ChevronUp size={14} className="text-gray-400" />
              ) : (
                <ChevronDown size={14} className="text-gray-400" />
              )}
            </div>
          </button>
          {catPickerOpen && (
            <div className="mt-1.5">
              <CategoryDropdownList
                grouped={grouped}
                selectedIds={selectedIds}
                activeCatName={activeCatName}
                onSelect={handleCategorySelect}
              />
            </div>
          )}
        </div>

        {/* Overall progress */}
        <div className="mx-3 mt-3 bg-gray-50 rounded-xl border border-gray-100 px-4 py-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest m-0">
            Overall Progress
          </p>
          <p className="text-[15px] font-bold text-gray-800 m-0 mt-0.5">
            {totalSelected} Items Selected
          </p>
          <button
            onClick={() => setShowSelections(true)}
            className="w-full mt-2.5 h-9 rounded-lg border-none bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ListChecks size={13} />
            View All Selections
          </button>
        </div>

        {/* Item list — single column horizontal cards */}
        <div className="px-3 py-3 flex flex-col gap-2.5">
          {(!activeGroup || activeGroup.allItems.length === 0) ? (
            <div className="bg-white rounded-2xl p-10 text-center text-gray-400">
              <UtensilsCrossed size={32} className="mx-auto mb-3 opacity-20" />
              <p className="m-0 text-sm">No menu items found</p>
            </div>
          ) : (
            activeGroup.allItems.map((item) => (
              <MobileItemCard
                key={item.menuItemId}
                item={item}
                isSelected={selectedIds.has(item.menuItemId)}
                onToggle={handleToggle}
                showImage={showImage}
              />
            ))
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="shrink-0 bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] px-3 py-2.5 flex flex-col gap-1.5">
        {isDirty && (
          <p className="text-[11px] text-red-500 font-medium m-0 text-center">
            You have unsaved changes
          </p>
        )}
        <button
          onClick={handleSave}
          disabled={saving || !isDirty}
          className={`w-full h-10 rounded-xl border-none text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            isDirty && !saving
              ? "bg-primary text-white cursor-pointer"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          {saving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save size={13} />
              {isDirty ? "Save Changes" : "All Saved"}
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div
      id="menu-share-page"
      className="fixed inset-0 z-[9990] bg-[#f8f9ff]"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {desktopLayout}
      {mobileLayout}

      <SelectionsSidebar
        open={showSelections}
        onClose={() => setShowSelections(false)}
        grouped={grouped}
        selectedIds={selectedIds}
        totalSelected={totalSelected}
      />
      <SelectionsModalMobile
        open={showSelections}
        onClose={() => setShowSelections(false)}
        grouped={grouped}
        selectedIds={selectedIds}
        totalSelected={totalSelected}
      />
    </div>
  );
};

export default MenuViewPage;