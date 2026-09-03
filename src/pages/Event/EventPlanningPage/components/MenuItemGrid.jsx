import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getbymenucategorywithtype } from "@/services/apiServices";
import { toAbsoluteUrl } from "@/utils";
import ShowMenuItems from "./ShowMenuItems";
import { Eye } from "lucide-react";

const PAGE_SIZE = 200;

const MenuItemGrid = ({
  fetchItemsFn = null,           // cfg.api.getItems — back to fetching internally
  fields = null,
  refreshKey,
  category = "All",
  categoryId = 0,
  searchTerm = "",
  selectedIdsSet = new Set(),
  onToggleSelect = () => {},
  selectedFunctionId = null,
  packageCategories = [],
  selectedItemsData = {},
  onLoadingChange = () => {},
  onItemsLoaded = () => {},
}) => {
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem("lang") || "en",
  );
  const [packageType, setPackageType] = useState(null);
  const [packageFilterIds, setPackageFilterIds] = useState(null);
  const [packageTypeLoading, setPackageTypeLoading] = useState(false);

  const sentinelRef = useRef(null);
  const isFetchingRef = useRef(false);

  const userId = localStorage.getItem("userId");
  const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
  const userLogo = authStorage?.state?.user?.logo || "";

  const f = fields || {
    itemId: "menuItemId", itemName: "menuItemName",
    itemNameHindi: "menuItemNameHindi", itemNameGujarati: "menuItemNameGujarati",
    categoryId: "menuCategoryId", categoryName: "menuCategoryName",
    categoryNameHindi: "menuCategoryNameHindi", categoryNameGujarati: "menuCategoryNameGujarati",
    itemPrice: "itemPrice", itemSlogan: "itemSlogan", itemSortOrder: "itemSortOrder",
  };

  const adaptItem = useCallback(
    (it) => ({
      ...it,
      id: it[f.itemId] ?? it.id,
      menuItemId: it[f.itemId] ?? it.id,
      menuItemName: it[f.itemName] ?? it.menuItemName ?? "",
      menuItemNameHindi: it[f.itemNameHindi] ?? it.menuItemNameHindi ?? "",
      menuItemNameGujarati: it[f.itemNameGujarati] ?? it.menuItemNameGujarati ?? "",
      menuCategoryId: it[f.categoryId] ?? it.menuCategoryId ?? 0,
      menuCategoryName: it[f.categoryName] ?? it.menuCategoryName ?? "Uncategorized",
      menuCategoryNameHindi: it[f.categoryNameHindi] ?? it.menuCategoryNameHindi ?? "",
      menuCategoryNameGujarati: it[f.categoryNameGujarati] ?? it.menuCategoryNameGujarati ?? "",
      itemPrice: Number(it[f.itemPrice] ?? it.itemPrice ?? 0),
      itemSlogan: it[f.itemSlogan] ?? it.itemSlogan ?? "",
      itemSortOrder: it[f.itemSortOrder] ?? it.itemSortOrder ?? null,
      isPackageItem: !!it.isPackage,
    }),
    [f],
  );

  // ── Language ──────────────────────────────────────────────────────────
  useEffect(() => {
    const sync = () => setCurrentLanguage(localStorage.getItem("lang") || "en");
    window.addEventListener("languageChange", sync);
    window.addEventListener("storage", sync);
    const id = setInterval(() => {
      const l = localStorage.getItem("lang") || "en";
      if (l !== currentLanguage) setCurrentLanguage(l);
    }, 500);
    return () => {
      window.removeEventListener("languageChange", sync);
      window.removeEventListener("storage", sync);
      clearInterval(id);
    };
  }, [currentLanguage]);

  const getLocalizedName = useMemo(
    () => (item) => {
      const field = { en: "menuItemName", hi: "menuItemNameHindi", gu: "menuItemNameGujarati" }[currentLanguage] || "menuItemName";
      return item[field] || item.menuItemName || "";
    },
    [currentLanguage],
  );

  const getLocalizedCategoryName = useMemo(
    () => (item) => {
      const field = { en: "menuCategoryName", hi: "menuCategoryNameHindi", gu: "menuCategoryNameGujarati" }[currentLanguage] || "menuCategoryName";
      if (item.menuCategory) return item.menuCategory[field] || item.menuCategory.nameEnglish || item.menuCategory.name;
      return item[field] || item.menuCategoryName || "Uncategorized";
    },
    [currentLanguage],
  );

  // ── Fetch a single page (200 items) ───────────────────────────────────
  
const requestIdRef = useRef(0);

const fetchPage = useCallback(
  async (pageNo, isFirstPage) => {
    if (!selectedFunctionId || !userId || !fetchItemsFn) {
      setLoading(false);
      onLoadingChange(false);
      return;
    }
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    // ── ADD: capture this request's id ──
    const myRequestId = ++requestIdRef.current;

    if (isFirstPage) {
      setLoading(true);
      onLoadingChange(true);
    } else {
      setLoadingMore(true);
    }
    setError(null);

    try {
      const { rawItems, prepMeta } = await fetchItemsFn(
        selectedFunctionId, searchTerm, categoryId, pageNo, PAGE_SIZE, userId,
      );

      // ── ADD: bail if a newer request has since started ──
      if (myRequestId !== requestIdRef.current) return;

      const adapted = (rawItems || []).map((it) =>
        adaptItem({ ...it, isPackageItem: !!it.isPackage }),
      );

      setAllMenuItems((prev) => (isFirstPage ? adapted : [...prev, ...adapted]));

      const tp = Number(prepMeta?.totalPage ?? 1);
      const ti = Number(prepMeta?.totalItem ?? adapted.length);
      const cp = Number(prepMeta?.currentPage ?? pageNo);

      setTotalPage(tp);
      setTotalItems(ti);
      setCurrentPage(cp);

      if (isFirstPage) {
        onItemsLoaded(adapted);
      }
    } catch (err) {
      if (myRequestId !== requestIdRef.current) return; // ← also guard the error path
      console.error("Failed to load items:", err);
      setError("Failed to load items");
      if (isFirstPage) {
        setAllMenuItems([]);
        onItemsLoaded([]);
      }
    } finally {
      isFetchingRef.current = false;
      if (myRequestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
        onLoadingChange(false);
      }
    }
  },
  [selectedFunctionId, userId, searchTerm, categoryId, fetchItemsFn, adaptItem, onLoadingChange, onItemsLoaded],
);

  // ── Reset + fetch page 1 whenever filters change ──────────────────────
  useEffect(() => {
  const timer = setTimeout(() => {
    setAllMenuItems([]);
    setCurrentPage(1);
    setTotalPage(1);
    setTotalItems(0);
    setPackageType(null);
    setPackageFilterIds(null);
    fetchPage(1, true);
  }, 300); // wait for the user to pause typing

  return () => clearTimeout(timer);
}, [searchTerm, categoryId, refreshKey, selectedFunctionId, fetchItemsFn]);

  // ── IntersectionObserver: fetch NEXT PAGE from API when sentinel hits ──
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !loading &&
          !loadingMore &&
          currentPage < totalPage
        ) {
          fetchPage(currentPage + 1, false);
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadingMore, currentPage, totalPage, fetchPage]);

  // ── Package toggle ─────────────────────────────────────────────────────
  const handlePackageTypeToggle = useCallback(
    async (type) => {
      if (packageType === type) {
        setPackageType(null);
        setPackageFilterIds(null);
        return;
      }
      setPackageType(type);
      setPackageTypeLoading(true);
      try {
        const resp = await getbymenucategorywithtype(categoryId, type, userId);
        const ids = (resp?.data?.data || []).map((it) => Number(it.menuItemId));
        setPackageFilterIds(ids);
      } catch (err) {
        setPackageFilterIds([]);
      } finally {
        setPackageTypeLoading(false);
      }
    },
    [packageType, categoryId, userId],
  );

  // ── Sorted & filtered (operates on what's been loaded so far) ─────────
  const sortedItems = useMemo(() => {
    return [...allMenuItems].sort((a, b) => {
      const ap = a.isPackageItem ? 0 : 1;
      const bp = b.isPackageItem ? 0 : 1;
      if (ap !== bp) return ap - bp;
      const ai = packageCategories.indexOf(getLocalizedCategoryName(a));
      const bi = packageCategories.indexOf(getLocalizedCategoryName(b));
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [allMenuItems, packageCategories, getLocalizedCategoryName, currentLanguage]);

  
const displayedItems = useMemo(() => {
  let items = packageFilterIds === null
    ? sortedItems
    : sortedItems.filter((it) => packageFilterIds.includes(Number(it.menuItemId || it.id)));

  // ── Sort by search relevance when searchTerm is active ──
  if (searchTerm.trim()) {
    const lower = searchTerm.trim().toLowerCase();
    items = [...items].sort((a, b) => {
      const score = (item) => {
        const name = (item.menuItemName || "").toLowerCase();
        const nameHi = (item.menuItemNameHindi || "").toLowerCase();
        const nameGu = (item.menuItemNameGujarati || "").toLowerCase();

        if (name === lower || nameHi === lower || nameGu === lower) return 0;        // exact match
        if (name.startsWith(lower) || nameHi.startsWith(lower) || nameGu.startsWith(lower)) return 1; // starts with
        return 2; // contains
      };
      return score(a) - score(b);
    });
  }

  return items;
}, [sortedItems, packageFilterIds, searchTerm]);

  const hasMore = currentPage < totalPage;

  // ── Enter quick select ─────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== "Enter" || !searchTerm.trim()) return;
      const lower = searchTerm.trim().toLowerCase();
      const exact = allMenuItems.find(
        (it) =>
          (it.menuItemName || "").toLowerCase() === lower ||
          (it.menuItemNameHindi || "").toLowerCase() === lower ||
          (it.menuItemNameGujarati || "").toLowerCase() === lower,
      );
      const hit = exact || (allMenuItems.length === 1 ? allMenuItems[0] : null);
      if (hit) {
        const cat = category !== "All" ? category : getLocalizedCategoryName(hit);
        onToggleSelect(hit, cat);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchTerm, allMenuItems, category, getLocalizedCategoryName, onToggleSelect]);

  const getItemWithSlogan = useCallback(
    (item) => {
      const itemId = Number(item.menuItemId || item.id);
      if (selectedItemsData?.categories) {
        for (const catItems of Object.values(selectedItemsData.categories)) {
          const found = catItems.find((it) => Number(it.id) === itemId);
          if (found) return { ...item, itemSlogan: found.itemSlogan || "", itemNotes: found.itemNotes || "" };
        }
      }
      return item;
    },
    [selectedItemsData],
  );

  const onItemClick = useCallback(
    (item) => {
      const cat = category !== "All" ? category : getLocalizedCategoryName(item);
      onToggleSelect(item, cat);
    },
    [onToggleSelect, category, getLocalizedCategoryName],
  );

  // ── Render ─────────────────────────────────────────────────────────────
  if (loading && allMenuItems.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin h-12 w-12 rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  if (displayedItems.length === 0) {
  return (
    <div>
      {categoryId !== 0 && (
        <div className="flex items-center justify-center mb-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-1 flex items-center shadow-sm">
            <button onClick={() => handlePackageTypeToggle("BASIC")} disabled={packageTypeLoading}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all ${packageType === "BASIC" ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>
              {packageTypeLoading && packageType === "BASIC" ? "Loading..." : "Basic Items"}
            </button>
            <button onClick={() => handlePackageTypeToggle("PREMIUM")} disabled={packageTypeLoading}
              className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all ${packageType === "PREMIUM" ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>
              {packageTypeLoading && packageType === "PREMIUM" ? "Loading..." : "Premium Items"}
            </button>
          </div>
        </div>
      )}
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500 text-sm">{searchTerm ? "No items found" : "No items available"}</p>
      </div>
    </div>
  );
}

 return (
  <div>
    {categoryId !== 0 && (
      <div className="flex items-center justify-center mb-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-1 flex items-center shadow-sm">
          <button onClick={() => handlePackageTypeToggle("BASIC")} disabled={packageTypeLoading}
            className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all ${packageType === "BASIC" ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>
            {packageTypeLoading && packageType === "BASIC" ? "Loading..." : "Basic Items"}
          </button>
          <button onClick={() => handlePackageTypeToggle("PREMIUM")} disabled={packageTypeLoading}
            className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all ${packageType === "PREMIUM" ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-50"}`}>
            {packageTypeLoading && packageType === "PREMIUM" ? "Loading..." : "Premium Items"}
          </button>
        </div>
      </div>
    )}

    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-2">
        {displayedItems.map((item) => {
          const id = item.menuItemId || item.id;
          const name = getLocalizedName(item);
          const numericId = Number(id);
          const isSelected = selectedIdsSet.has(numericId) || selectedIdsSet.has(String(numericId));

          return (
            <div
              key={id}
              onClick={() => onItemClick(item)}
              className={`relative flex flex-col items-start border rounded-lg cursor-pointer transition-colors ${
                isSelected ? "border-green-500 bg-green-100/30" : "hover:bg-blue-100/40 hover:border-blue-300"
              }`}
            >
              {item.isPackageItem && (
                <div className="absolute top-0 left-0">
                  <div className="bg-purple-600 text-white text-[10px] font-semibold px-6 py-[2px] transform -rotate-45 translate-x-[-20px] translate-y-[6px] shadow-md">PKG</div>
                </div>
              )}
              <div className="relative w-full h-28 bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-lg">
                <img
                  src={
                    item?.imagePath && typeof item.imagePath === "string" && item.imagePath.trim() !== "" &&
                    item.imagePath !== "null" && item.imagePath !== "undefined" &&
                    !item.imagePath.toLowerCase().includes("/null") &&
                    /\.(jpg|jpeg|png|webp|gif)$/i.test(item.imagePath)
                      ? item.imagePath : userLogo || toAbsoluteUrl("/media/menu/noImage.jpg")
                  }
                  alt="" className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedItem(getItemWithSlogan(item)); setIsModalOpen(true); }}
                  className="absolute top-1 left-1 text-white px-1 py-[2px] text-[11px] rounded flex items-center gap-1"
                >
                  <Eye className="text-white bg-primary p-1 rounded-lg" size={20} />
                </button>
              </div>
              <div className="w-full text-center text-sm font-medium p-1.5 line-clamp-4 leading-tight">{name}</div>
              {isSelected && (
                <span className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md">✓</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Sentinel — triggers next-page API call */}
      <div ref={sentinelRef} className="h-8 flex items-center justify-center mt-4">
        {loadingMore && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="animate-spin h-4 w-4 rounded-full border-b-2 border-blue-600" />
            <span>Loading more... (page {currentPage} of {totalPage})</span>
          </div>
        )}
        {!hasMore && allMenuItems.length > 0 && (
          <p className="text-gray-400 text-xs">All {totalItems} items loaded</p>
        )}
      </div>

      <ShowMenuItems isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} item={selectedItem} />
    </div>
  );
};

export default MenuItemGrid;