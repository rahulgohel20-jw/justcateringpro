
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
  Search,
  Sparkles,
  ChefHat,
  Wheat,
  Cake,
  GlassWater,
  Soup,
  Salad,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { getNewToken } from "../../../services/axiosInstance";

// ─── SweetAlert Theme (Clean White & Primary Color) ───────────────────────────
const swalClean = Swal.mixin({
  background: "#ffffff",
  color: "#1f2937",
  customClass: {
    popup: "border border-gray-100 rounded-3xl shadow-2xl p-6",
    title: "text-gray-900 font-bold text-xl",
    htmlContainer: "text-gray-600 text-sm",
    confirmButton:
      "bg-primary text-white font-bold px-6 py-2.5 rounded-xl border-none shadow-md hover:opacity-90 cursor-pointer",
    cancelButton:
      "bg-gray-100 text-gray-700 font-bold px-6 py-2.5 rounded-xl border-none cursor-pointer",
  },
  buttonsStyling: false,
});

// ─── Category Icon Resolver (food-tasting layout) ──────────────────────────────
const getCategoryIcon = (name = "") => {
  const n = name.toLowerCase();
  if (
    n.includes("starter") ||
    n.includes("snack") ||
    n.includes("appetizer") ||
    n.includes("kebab")
  )
    return ChefHat;
  if (
    n.includes("main") ||
    n.includes("course") ||
    n.includes("curry") ||
    n.includes("sabji") ||
    n.includes("gravy")
  )
    return UtensilsCrossed;
  if (
    n.includes("sweet") ||
    n.includes("dessert") ||
    n.includes("mithai") ||
    n.includes("cake") ||
    n.includes("halwa") ||
    n.includes("ice")
  )
    return Cake;
  if (
    n.includes("drink") ||
    n.includes("beverage") ||
    n.includes("mocktail") ||
    n.includes("juice") ||
    n.includes("water") ||
    n.includes("shake")
  )
    return GlassWater;
  if (
    n.includes("bread") ||
    n.includes("roti") ||
    n.includes("naan") ||
    n.includes("puri") ||
    n.includes("paratha") ||
    n.includes("wheat")
  )
    return Wheat;
  if (n.includes("soup") || n.includes("shorba")) return Soup;
  if (n.includes("salad") || n.includes("chaat") || n.includes("raita")) return Salad;
  if (
    n.includes("live") ||
    n.includes("tandoor") ||
    n.includes("barbeque") ||
    n.includes("bbq") ||
    n.includes("flame")
  )
    return Flame;
  return Sparkles;
};

// ─── Verify Access Code Modal (White & Primary Color) ─────────────────────────
const VerifyModal = ({ token, onVerified }) => {
  const [accessCode, setAccessCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleVerify = async () => {
    if (!accessCode.trim()) {
      swalClean.fire({
        icon: "warning",
        title: "Access Code Required",
        text: "Please enter your shared access code",
      });
      return;
    }
    try {
      setVerifying(true);
      const res = await VerifyMenuLink({ token, accessCode });
      if (res?.data?.success) {
        swalClean.fire({
          icon: "success",
          title: "Access Granted",
          text: res?.data?.msg || "Welcome! You can now customize your menu selections.",
          timer: 1600,
          showConfirmButton: false,
        });
        onVerified(res.data.data);
      } else {
        swalClean.fire({
          icon: "error",
          title: "Access Denied",
          text: res?.data?.msg || "Invalid code or expired menu link",
        });
      }
    } catch (err) {
      swalClean.fire({
        icon: "error",
        title: "Verification Failed",
        text: err?.response?.data?.msg || "Unable to verify access code. Please try again.",
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 border border-gray-100 text-gray-800 relative">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
            <UtensilsCrossed size={28} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight m-0">
            Menu Planning
          </h2>
          <p className="text-xs text-gray-500 mt-2">
            Enter the unique access code shared with you to view and curate the menu
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-[11px] font-bold text-primary uppercase tracking-widest block mb-1.5">
              Access Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`w-full h-12 px-3.5 rounded-xl border text-base font-bold font-mono tracking-widest text-primary bg-slate-50/70 outline-none transition-all placeholder:text-gray-400 ${focused ? "border-primary bg-white ring-2 ring-primary/20" : "border-gray-200"
                }`}
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
            className={`w-full h-12 rounded-xl border-none text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${verifying
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-primary hover:opacity-90 active:scale-[0.99] cursor-pointer"
              }`}
            onClick={handleVerify}
            disabled={verifying}
          >
            {verifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying Access...
              </>
            ) : (
              <>
                <span>Access Menu</span>
                <ArrowRight size={15} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const toTitleCase = (s = "") =>
  s.toLowerCase().replace(/(^|\s|\(|-)([a-z])/g, (_, p, c) => p + c.toUpperCase());

const VegMark = ({ isVeg }) => {
  if (isVeg === undefined) return null;
  const color = isVeg ? "border-green-600" : "border-red-600";
  const dot = isVeg ? "bg-green-600" : "bg-red-600";
  return (
    <span
      title={isVeg ? "Veg" : "Non-Veg"}
      className={`w-4 h-4 rounded-[4px] border-2 ${color} flex items-center justify-center shrink-0`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
    </span>
  );
};

const DishCard = ({ item, isSelected, onToggle, showImage }) => {
  const hasImage =
    item.imagePath &&
    item.imagePath !== "null" &&
    /\.(jpg|jpeg|png|webp|gif)$/i.test(item.imagePath);

  return (
    <div
      onClick={() => onToggle(item.menuItemId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(item.menuItemId);
        }
      }}
      className={[
        "group h-full flex flex-col rounded-2xl overflow-hidden cursor-pointer select-none border",
        "shadow-sm transition-all duration-200 hover:shadow-md",
        isSelected
          ? "bg-primary/[0.04] border-primary/50"
          : "bg-white border-gray-200 hover:border-primary/30",
      ].join(" ")}
    >
      {/* Image only when the dish has one */}
      {showImage && hasImage && (
        <div className="h-32 w-full bg-gray-50 overflow-hidden shrink-0">
          <img
            src={item.imagePath}
            alt={item.menuItemName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => (e.target.parentElement.style.display = "none")}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col p-4 gap-2">
        {/* Top row */}
        <div className="flex items-center justify-between min-h-[20px]">
          <div className="flex items-center gap-2 min-w-0">
            <VegMark isVeg={item.isVeg} />
            {item.itemType && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 truncate">
                {item.itemType}
              </span>
            )}
            {item.isSpicy && <Flame size={12} className="text-red-500 shrink-0" />}
          </div>
          <span
            className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${isSelected ? "bg-primary text-white" : "bg-gray-100 text-transparent"
              }`}
          >
            <Check size={12} strokeWidth={3.5} />
          </span>
        </div>

        {/* Title: always reserves 2 lines, clamps long names */}
        <h4
          title={item.menuItemName}
          className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2 min-h-[2.75rem] m-0"
        >
          {toTitleCase(item.menuItemName)}
        </h4>

        {item.itemSlogan && (
          <p className="text-xs text-gray-500 leading-snug line-clamp-1 m-0">
            {item.itemSlogan}
          </p>
        )}

        {/* Button always pinned to the bottom */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.menuItemId);
          }}
          className={`mt-auto shrink-0 w-full h-9 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${isSelected
            ? "bg-primary text-white hover:opacity-90"
            : "bg-white text-primary border border-primary/40 hover:bg-primary hover:text-white"
            }`}
        >
          {isSelected ? (
            <>
              <Check size={14} strokeWidth={3} /> Added to Menu
            </>
          ) : (
            <>
              <Heart size={14} /> Add to Menu
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ─── Selections List Content (Shared between Desktop Sidebar & Mobile Modal) ───
const SelectionsListContent = ({ grouped, selectedIds }) => {
  const selectedGroups = grouped
    .map((g) => ({
      ...g,
      chosen: g.allItems.filter((it) => selectedIds.has(it.menuItemId)),
    }))
    .filter((g) => g.chosen.length > 0);

  if (selectedGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 py-16">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 text-primary">
          <UtensilsCrossed size={28} />
        </div>
        <p className="text-sm font-bold text-gray-700 m-0">
          Nothing Selected Yet
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Tap items on the menu to curate your catering selection
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3.5 p-4 sm:p-5">
      {selectedGroups.map((g) => (
        <div key={g.catName} className="bg-gray-50/90 border border-gray-200/80 rounded-2xl p-3.5">
          <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-200/60">
            <p className="text-xs font-bold text-primary uppercase tracking-wider m-0 flex items-center gap-1.5">
              <Sparkles size={12} className="text-primary" />
              {g.catName}
            </p>
            <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full leading-none">
              {g.chosen.length} item{g.chosen.length > 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {g.chosen.map((item) => (
              <div key={item.menuItemId} className="flex items-center gap-2.5 py-1">
                <span className="w-5 h-5 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center shrink-0">
                  <Check size={11} className="text-primary" strokeWidth={3} />
                </span>
                <p className="text-xs text-gray-800 font-semibold m-0 leading-tight truncate">
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

// ─── Desktop Selections Sidebar (Drawer) ───────────────────────────────────────
const SelectionsSidebar = ({ open, onClose, grouped, selectedIds, totalSelected }) => {
  if (!open) return null;
  return (
    <div className="hidden lg:flex fixed inset-0 z-[10000]">
      <div className="flex-1 bg-black/40 backdrop-blur-xs" onClick={onClose} />
      <div className="w-[400px] shrink-0 bg-white border-l border-gray-200 h-full flex flex-col shadow-2xl animate-in slide-in-from-right text-gray-800">
        <div className="shrink-0 flex items-start justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <p className="text-lg font-bold text-gray-900 m-0 tracking-tight">
              Your Selections
            </p>
            <p className="text-xs text-primary font-bold mt-1 m-0">
              {totalSelected} dishes chosen
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 border-none cursor-pointer text-gray-500 hover:text-gray-900 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto min-h-0 bg-white">
          <SelectionsListContent grouped={grouped} selectedIds={selectedIds} />
        </div>
        <div className="shrink-0 p-5 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-xl border-none bg-primary text-white text-xs font-bold uppercase tracking-wider cursor-pointer hover:opacity-90 transition-opacity shadow-md"
          >
            Return to Menu
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Mobile Selections Modal / Bottom Sheet ────────────────────────────────────
const SelectionsModalMobile = ({ open, onClose, grouped, selectedIds, totalSelected }) => {
  if (!open) return null;
  const stationCount = grouped.filter((g) =>
    g.allItems.some((it) => selectedIds.has(it.menuItemId)),
  ).length;

  return (
    <div className="flex lg:hidden fixed inset-0 z-[10000] bg-white flex-col text-gray-800">
      <div className="shrink-0 flex justify-center pt-3 pb-1">
        <div className="w-10 h-1 rounded-full bg-gray-300" />
      </div>
      <div className="shrink-0 flex items-start justify-between px-5 pb-4 border-b border-gray-100">
        <div>
          <p className="text-lg font-bold text-gray-900 m-0">Your Selections</p>
          <p className="text-xs text-primary mt-1 m-0 font-bold">
            {totalSelected} dishes selected across {stationCount} category{stationCount !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 border-none cursor-pointer text-gray-500"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 bg-white">
        <SelectionsListContent grouped={grouped} selectedIds={selectedIds} />
      </div>
      <div className="shrink-0 p-4 border-t border-gray-100 bg-gray-50/50">
        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl border-none bg-primary text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
        >
          Return to Menu
        </button>
      </div>
    </div>
  );
};



const SaveLoader = ({ open }) => {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[20000] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4"
      style={{ cursor: "wait" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="bg-white rounded-2xl shadow-2xl px-8 py-7 flex flex-col items-center gap-4 w-full max-w-[280px]">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
          <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          <UtensilsCrossed size={20} className="absolute inset-0 m-auto text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-gray-900 m-0">Saving your menu...</p>
          <p className="text-xs text-gray-500 mt-1 m-0">Please wait, do not close this page</p>
        </div>
      </div>
    </div>
  );
};




// ─── Main MenuViewPage Component (White & Primary Theme) ───────────────────────
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
  const [showSelections, setShowSelections] = useState(false);
  const [eventSummaryOpen, setEventSummaryOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Lock scrollbars outside container
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

  // System Token Init
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

  const handleVerified = (data) => {
    setMenuData(data);
    setSelectedIds(new Set()); // every item starts unselected
    setIsDirty(false);
  };

  // Group items by category
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

  // Set default active category
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

  // Filtered dishes for active category based on search query
  const displayedDishes = useMemo(() => {
    if (!activeGroup?.allItems) return [];
    if (!searchQuery.trim()) return activeGroup.allItems;
    const q = searchQuery.toLowerCase().trim();
    return activeGroup.allItems.filter((it) => {
      const matchName = it.menuItemName?.toLowerCase().includes(q);
      const matchType = it.itemType?.toLowerCase().includes(q);
      const matchSlogan = it.itemSlogan?.toLowerCase().includes(q);
      return matchName || matchType || matchSlogan;
    });
  }, [activeGroup, searchQuery]);

  const handleToggle = (id) => {
    setIsDirty(true);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Build exact save payload
  const buildPayload = () => {
    if (!menuData) return null;
    const prep = menuData.menuPreparation || {};

    return {
      id: prep.id || 0,
      // token, // remove if the backend doesn't need it
      eventFunctionId: menuData.eventFunctionId || 0,
      pax: prep.pax || 0,
      defaultPrice: prep.defaultPrice || 0,
      price: prep.price || 0,
      sortorder: prep.sortorder || 0,
      isPackage: prep.isPackage || false,
      packageId: prep.packageId || 0,
      packageName: prep.packageName || "",
      packagePrice: prep.packagePrice || 0,

      permissionRawMaterials: {
        permissables: [],
        notPermissables: [],
        userId: Number(localStorage.getItem("userId")) || 0,
      },

      selectedMenuPreparation: grouped.map((group, ci) => ({
        anyItem: 0,
        bgImgId: 0,
        catHeadingEnglish: "",
        catHeadingGujarati: "",
        catHeadingHindi: "",
        catImgId: 0,
        catNickNameEnglish: "",
        catNickNameGujarati: "",
        catNickNameHindi: "",
        catSpace: 0,
        categoryPrice: 0,
        categoryStatus: "NORMAL",
        changedAfterCompletion: false,
        isMenuCatAddons: false,
        menuCategoryId: Number(group.catId || 0),
        menuCategoryName: group.catName,
        menuCategoryNameGujarati: group.catNameGujarati,
        menuCategoryNameHindi: group.catNameHindi,
        menuNotes: "",
        menuNotesGujarati: "",
        menuNotesHindi: "",
        menuSlogan: group.slogan || "",
        menuSortOrder: ci,
        multiImageMenuItems: [],
        startTime: "",
        subCat: "",
        subCatGujarati: "",
        subCatHindi: "",
        selectedMenuPreparationItems: group.allItems
          .filter((it) => selectedIds.has(it.menuItemId))
          .map((it, ii) => ({
            changedAfterCompletion: false,
            id: 0,
            isCatImage: false,
            isItemAddons: false,
            itemHeading: "",
            itemHeadingGujarati: "",
            itemHeadingHindi: "",
            itemNickNameEnglish: "",
            itemNickNameGujarati: "",
            itemNickNameHindi: "",
            itemNotes: "",
            itemNotesGujarati: "",
            itemNotesHindi: "",
            itemPrice: Number(it.itemPrice || 0),
            itemSlogan: it.itemSlogan || "",
            itemSortOrder: ii,
            itemSpace: 0,
            itemStatus: "NORMAL",
            menuItemId: Number(it.menuItemId),
            menuItemName: it.menuItemName || "",
            menuItemNameGujarati: it.menuItemNameGujarati || it.menuItemName || "",
            menuItemNameHindi: it.menuItemNameHindi || it.menuItemName || "",
            subItem: "",
            subItemGujarati: "",
            subItemHindi: "",
          })),
      })),
    };
  };

  const handleSave = async () => {
    if (saving) return;
    const payload = buildPayload();
    if (!payload) return;

    try {
      setSaving(true);
      const res = await AddMenuprep(payload);

      if (res?.data?.success) {
        setIsDirty(false);
        await swalClean.fire({
          icon: "success",
          title: "Menu Saved Successfully",
          text: res?.data?.msg || res?.data?.message || "Your selected menu has been submitted.",
          timer: 2200,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      } else {
        swalClean.fire({
          icon: "error",
          title: "Save Failed",
          text: res?.data?.msg || res?.data?.message || "Failed to save menu preparation.",
        });
      }
    } catch (err) {
      swalClean.fire({
        icon: "error",
        title: "Error",
        text:
          err?.response?.data?.msg ||
          err?.response?.data?.message ||
          "Something went wrong while saving your menu.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8f9fc]">
        <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!menuData) {
    return <VerifyModal token={token} onVerified={handleVerified} />;
  }

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
    { key: "persons", label: "Guests", value: func.pax, icon: Users },
    { key: "datetime", label: "Date & Time", value: func.functionStartDateTime, icon: Calendar },
  ].filter((f) => f.value);

  return (
    <div
      id="menu-share-page"
      className="fixed inset-0 z-[9990] bg-[#f8f9fc] text-gray-800 flex flex-col overflow-hidden"
      style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}
    >
      {/* ─── 1. TOP BRAND HEADER STRIP ("Menu Planning" in White & Primary) ── */}
      <header className="shrink-0 bg-white border-b border-gray-200/90 select-none z-30 shadow-xs">
        <div className="flex items-center justify-between px-3.5 sm:px-6 h-[54px] gap-3">
          {/* Header Title: "Menu Planning" */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
              <UtensilsCrossed size={16} className="text-primary" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-base font-bold text-gray-900 tracking-tight leading-tight truncate">
                Menu Planning
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 font-medium leading-none truncate">
                Catering Selection & Review
              </span>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowImage((v) => !v)}
              className="min-h-[34px] sm:min-h-[36px] px-2.5 sm:px-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title={showImage ? "Hide dish images" : "Show dish images"}
            >
              {showImage ? <EyeOff size={13} className="text-gray-500" /> : <Eye size={13} className="text-primary" />}
              <span className="hidden sm:inline">{showImage ? "Hide Images" : "Show Images"}</span>
            </button>

            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className={`min-h-[34px] sm:min-h-[36px] px-3 sm:px-4 rounded-xl border-none text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${isDirty && !saving
                ? "bg-primary text-white hover:opacity-90 active:scale-[0.98] cursor-pointer"
                : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                }`}
            >
              <Save size={13} />
              <span className="hidden sm:inline">Save Changes</span>
              <span className="sm:hidden">Save</span>
            </button>
          </div>
        </div>

        {/* Primary Accent Progress Line */}
        <div className="h-[2px] bg-gray-100 w-full">
          <div
            className="h-full bg-primary transition-all duration-500 ease-out shadow-xs"
            style={{ width: `${selectionPct}%` }}
          />
        </div>
      </header>

      {/* ─── 2. MAIN LAYOUT: CategoryRail + Content Area ────────────────────── */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* ── Category Rail (Desktop Left Sidebar) ── */}
        <aside
          aria-label="Catering Categories"
          className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-gray-200/90 shrink-0 z-10"
        >
          <div className="p-3.5 border-b border-gray-100">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary px-1">
              Catering Categories
            </span>
          </div>

          <nav className="flex flex-col overflow-y-auto p-2.5 gap-2 pb-2.5 scrollbar-none flex-1">
            {grouped.map((g) => {
              const isActive = g.catName === activeCatName;
              const count = g.allItems.filter((it) => selectedIds.has(it.menuItemId)).length;
              const IconComp = getCategoryIcon(g.catName);

              return (
                <button
                  key={g.catName}
                  onClick={() => setActiveCatName(g.catName)}
                  className={`min-h-[54px] px-3.5 py-2.5 rounded-xl flex items-center justify-between text-left transition-all duration-200 border cursor-pointer ${isActive
                    ? "bg-primary text-white border-primary shadow-md font-semibold scale-[1.01]"
                    : "bg-white text-gray-700 border-gray-200/80 hover:border-primary/50 hover:bg-primary/[0.02] hover:text-gray-900 shadow-2xs"
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-1">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${isActive
                        ? "bg-white/20 text-white"
                        : "bg-primary/10 text-primary border border-primary/20"
                        }`}
                    >
                      <IconComp size={16} />
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-xs sm:text-sm font-bold leading-tight truncate">
                        {g.catName}
                      </span>
                      {g.slogan && (
                        <span
                          className={`text-[10px] truncate mt-0.5 ${isActive ? "text-white/80" : "text-gray-400"
                            }`}
                        >
                          {g.slogan}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selected count badge */}
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ml-1.5 ${isActive
                      ? "bg-white text-primary shadow-xs"
                      : count > 0
                        ? "bg-primary text-white shadow-xs"
                        : "bg-gray-100 text-gray-500"
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ── Category Rail (Mobile Top Horizontal Swipeable Bar) ── */}
        <div className="flex lg:hidden flex-row overflow-x-auto p-2 gap-2 scrollbar-none bg-white border-b border-gray-200/90 shrink-0 shadow-2xs">
          {grouped.map((g) => {
            const isActive = g.catName === activeCatName;
            const count = g.allItems.filter((it) => selectedIds.has(it.menuItemId)).length;
            const IconComp = getCategoryIcon(g.catName);

            return (
              <button
                key={g.catName}
                onClick={() => setActiveCatName(g.catName)}
                className={`min-h-[40px] px-3 py-1.5 rounded-xl flex items-center gap-2 shrink-0 border whitespace-nowrap cursor-pointer transition-all ${isActive
                  ? "bg-primary text-white border-primary shadow-xs font-semibold"
                  : "bg-white text-gray-700 border-gray-200 hover:border-primary/50"
                  }`}
              >
                <IconComp size={14} className={isActive ? "text-white" : "text-primary"} />
                <span className="text-xs font-bold">{g.catName}</span>
                {count > 0 && (
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${isActive ? "bg-white text-primary" : "bg-primary text-white"
                      }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Main Content Area ── */}
        <main className="flex-1 flex flex-col bg-[#f8f9fc] min-w-0 overflow-y-auto">
          {/* Event Details Card Strip (Clean White) */}
          {eventFields.length > 0 && (
            <div className="mx-3 sm:mx-6 mt-3 sm:mt-4 bg-white rounded-2xl border border-gray-200/90 overflow-hidden shadow-xs">
              {/* Mobile collapse header */}
              <button
                onClick={() => setEventSummaryOpen((v) => !v)}
                className="w-full flex sm:hidden items-center justify-between px-4 py-2.5 bg-transparent border-none text-gray-800 cursor-pointer"
              >
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Event Summary
                </span>
                {eventSummaryOpen ? (
                  <ChevronUp size={14} className="text-gray-400" />
                ) : (
                  <ChevronDown size={14} className="text-gray-400" />
                )}
              </button>

              <div
                className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-gray-100 ${eventSummaryOpen ? "block" : "hidden sm:grid"
                  }`}
              >
                {eventFields.map((f) => (
                  <div key={f.key} className="px-3.5 sm:px-4 py-2.5 min-w-0">
                    <p className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest m-0">
                      <f.icon size={11} className="text-primary shrink-0" />
                      <span className="truncate">{f.label}</span>
                    </p>
                    <p
                      className={`text-xs sm:text-sm font-bold m-0 mt-0.5 truncate ${f.accent ? "text-primary" : "text-gray-900"
                        }`}
                    >
                      {f.value}
                    </p>
                    {f.sub && <p className="text-[11px] text-primary/80 font-semibold m-0 truncate">{f.sub}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subheader Toolbar: Category Title, Search, and Selected Count */}
          <div className="bg-white border border-gray-200/90 px-3.5 sm:px-6 py-2.5 sm:py-3 mx-3 sm:mx-6 mt-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <h2 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight m-0">
                  {activeGroup?.catName}
                </h2>
              </div>
              {activeGroup?.slogan && (
                <p className="text-xs text-gray-500 mt-0.5 m-0 line-clamp-1">
                  {activeGroup.slogan}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Category Counter Pill */}
              <span className="text-[11px] font-bold text-primary bg-primary/10 border border-primary/25 px-3 py-1 rounded-full whitespace-nowrap">
                {activeSelectedCount} of {activeGroup?.allItems.length || 0} Selected
              </span>

              {/* Client-side Search Bar */}
              <div className="relative min-w-[140px] sm:min-w-[180px] md:min-w-[220px]">
                <Search size={13} className="text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search dishes..."
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl pl-8 pr-6 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 text-xs border-none bg-transparent cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Dishes Grid */}
          <div className="flex-1 p-3.5 sm:p-6 pb-6">
            {!activeGroup || displayedDishes.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 shadow-xs">
                <UtensilsCrossed size={36} className="mx-auto mb-3 opacity-30 text-primary" />
                <p className="m-0 text-sm font-semibold text-gray-600">No menu items found</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-2 text-xs text-primary underline border-none bg-transparent cursor-pointer font-bold"
                  >
                    Clear search filter
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-5">
                {displayedDishes.map((item) => (
                  <DishCard
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
        </main>
      </div>

      {/* ─── 3. STICKY BOTTOM SUMMARY BAR (White & Primary Color) ──────────── */}
      <footer
        aria-label="Selection summary bar"
        className="shrink-0 bg-white border-t border-gray-200 px-3.5 sm:px-6 py-3 flex items-center justify-between z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      >
        {/* Selected Items Counter */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
            <CheckCircle2 size={20} className="text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-baseline gap-1.5 leading-tight">
              <span className="text-xl sm:text-2xl font-bold text-primary">
                {totalSelected}
              </span>
              <span className="text-xs sm:text-sm font-bold text-gray-900">
                Items Selected
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] text-gray-500 truncate">
              {isDirty ? (
                <span className="text-amber-600 font-semibold">You have unsaved selections</span>
              ) : (
                "Tap dishes to record your catering preferences"
              )}
            </span>
          </div>
        </div>

        {/* Action Buttons: View All Selections + Save Changes */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setShowSelections(true)}
            className="min-h-[42px] sm:min-h-[46px] px-3 sm:px-4 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-primary/50 text-gray-700 hover:text-gray-900 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
          >
            <ListChecks size={15} className="text-primary" />
            <span className="hidden sm:inline">View Selections</span>
            <span className="sm:hidden">View</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !isDirty}
            className={`min-h-[42px] sm:min-h-[46px] px-4 sm:px-8 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center gap-2 select-none ${isDirty && !saving
              ? "bg-primary text-white hover:opacity-90 active:scale-[0.98] cursor-pointer"
              : "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
              }`}
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>{isDirty ? "Save Changes" : "Saved"}</span>
              </>
            )}
          </button>
        </div>
      </footer>

      {/* ─── 4. SELECTIONS SIDEBAR & MODAL ─────────────────────────────────── */}
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

      <SaveLoader open={saving} />
    </div>
  );
};

export default MenuViewPage;