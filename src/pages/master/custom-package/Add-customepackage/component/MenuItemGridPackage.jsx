import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Search, Check, Loader2, Plus } from "lucide-react";
import { toAbsoluteUrl } from "@/utils";

function MenuItemGridPackage({
  onToggleItem,
  selectedItemIds = new Set(),
  selectedCategory,
  Getmenuitemsusingcatid,
  onAddMenuItem,
}) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // ── NEW dropdown state ────────────────────────────────────────────────
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const itemRefs = useRef([]);
  const searchWrapRef = useRef(null);
  // ─────────────────────────────────────────────────────────────────────

  const USER_ID = localStorage.getItem("userId");
  const PAGE_SIZE = 100;
  const observerRef = useRef();
  const gridContainerRef = useRef(null);
  const isFetchingRef = useRef(false);

  // Re-fetch whenever category changes OR search query changes (debounced)
  useEffect(() => {
    const delay = searchQuery === "" ? 0 : 400;
    const timer = setTimeout(() => {
      setMenuItems([]);
      setPage(1);
      setHasMore(true);
      isFetchingRef.current = false;
      // Search = all categories, browse = selected category
      const catForFetch = searchQuery.trim() ? "" : selectedCategory;
      fetchMenuItems(catForFetch, 1, searchQuery);
    }, delay);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  const fetchMenuItems = useCallback(
    async (category, pageNum, search = "") => {
      if (isFetchingRef.current) return;
      isFetchingRef.current = true;
      setLoading(true);
      try {
        // Resolve the actual category ID to send to the API
        const menuCatId =
          !category || category === "all" ? "" : String(category);

        const response = await Getmenuitemsusingcatid({
          page: pageNum,
          size: PAGE_SIZE,
          userId: USER_ID,
          menuCatId,
          itemName: search,
        });
        const newItems = response.data?.data?.items || [];
        const totalCount = response.data?.data?.totalItems || 0;
        setMenuItems((prev) => (pageNum === 1 ? newItems : [...prev, ...newItems]));
        const isEnd = pageNum * PAGE_SIZE >= totalCount || newItems.length < PAGE_SIZE;
        setHasMore(!isEnd);
        if (!isEnd) setPage(pageNum + 1);
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
      }
    },
    [USER_ID, Getmenuitemsusingcatid],
  );

  useEffect(() => {
    const target = observerRef.current;
    if (!target || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isFetchingRef.current) {
          fetchMenuItems(selectedCategory, page);
        }
      },
      { root: gridContainerRef.current, rootMargin: "200px", threshold: 0.1 },
    );
    observer.observe(target);
    return () => observer.unobserve(target);
  }, [hasMore, selectedCategory, fetchMenuItems, page]);

  // ── NEW: dropdown items = current menuItems filtered by query ─────────
  const dropdownItems = useMemo(() => {
    if (!searchQuery.trim()) return menuItems.slice(0, 8); // show first 8 when no query
    const q = searchQuery.trim().toLowerCase();
    return menuItems.filter((item) => {
      const name = item.nameEnglish || item.name || "";
      return name.toLowerCase().includes(q);
    });
  }, [menuItems, searchQuery]);

  // ── NEW: close dropdown on outside click ──────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── NEW: scroll active dropdown item into view ────────────────────────
  useEffect(() => {
    if (activeIdx >= 0 && itemRefs.current[activeIdx]) {
      itemRefs.current[activeIdx].scrollIntoView({ block: "nearest" });
    }
  }, [activeIdx]);

  // ── NEW: keyboard navigation ──────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((p) => Math.min(p + 1, dropdownItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((p) => Math.max(p - 1, -1));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      const item = dropdownItems[activeIdx];
      if (item) {
        onToggleItem(item);
        setSearchQuery("");
        setShowDropdown(false);
        setActiveIdx(-1);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const selectedCount = useMemo(() => selectedItemIds.size, [selectedItemIds]);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Search bar */}
      <div className="p-3 border-b border-gray-100 bg-white sticky top-0 z-10">
        {/* ── CHANGED: wrap in ref div for outside-click detection ── */}
        <div className="flex items-center gap-2" ref={searchWrapRef}>
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search menu items..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              value={searchQuery}
              autoComplete="off"
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
                setActiveIdx(-1);
              }}
              onFocus={() => { setShowDropdown(true); setActiveIdx(-1); }}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); setSearchQuery(""); setShowDropdown(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}

            {/* ── NEW: inline dropdown ───────────────────────────── */}
            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                {loading && menuItems.length === 0 ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs">Searching…</span>
                  </div>
                ) : dropdownItems.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-gray-400 text-center">
                    No items found{searchQuery ? ` for "${searchQuery}"` : ""}
                  </div>
                ) : (
                  <>
                    {!searchQuery && (
                      <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                          Suggestions
                        </span>
                      </div>
                    )}
                    {dropdownItems.map((item, idx) => {
                      const isActive = activeIdx === idx;
                      const isSelected =
                        selectedItemIds.has(item.id) ||
                        selectedItemIds.has(String(item.id));
                      const name = item.nameEnglish || item.name || "—";

                      const imgSrc =
                        item?.imagePath &&
                        typeof item.imagePath === "string" &&
                        item.imagePath.trim() !== "" &&
                        item.imagePath !== "null" &&
                        item.imagePath !== "undefined" &&
                        !item.imagePath.toLowerCase().includes("/null") &&
                        /\.(jpg|jpeg|png|webp|gif)$/i.test(item.imagePath)
                          ? item.imagePath
                          : toAbsoluteUrl("/media/menu/noImage.jpg");

                      return (
                        <div
                          key={item.id}
                          ref={(el) => (itemRefs.current[idx] = el)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            onToggleItem(item);
                            setSearchQuery("");
                            setShowDropdown(false);
                            setActiveIdx(-1);
                          }}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer border-b border-gray-50 last:border-0 transition-colors
                            ${isActive ? "bg-primary" : isSelected ? "bg-green-50" : "hover:bg-gray-50"}`}
                        >
                          {/* Thumbnail */}
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden bg-gray-100">
                            <img
                              src={imgSrc}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <span className={`flex-1 text-sm truncate font-medium
                            ${isActive ? "text-white" : isSelected ? "text-green-700" : "text-gray-700"}`}
                          >
                            {name}
                          </span>

                          {isSelected && (
                            <Check className={`flex-shrink-0 w-3.5 h-3.5 ${isActive ? "text-white" : "text-green-500"}`} />
                          )}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
            {/* ── END dropdown ───────────────────────────────────── */}
          </div>

          <button
            type="button"
            onClick={onAddMenuItem}
            title="Add Item"
            className="flex-shrink-0 w-8 h-8 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {selectedCount > 0 && (
          <div className="mt-2 text-xs text-green-700 font-medium bg-green-50 border border-green-100 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5">
            <Check className="w-3 h-3" />
            {selectedCount} {selectedCount === 1 ? "item" : "items"} selected
          </div>
        )}
      </div>

      {/* Grid — unchanged from original */}
      <div ref={gridContainerRef} className="flex-1 overflow-y-auto p-3">
        {menuItems.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-48 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">
              {searchQuery ? `No items for "${searchQuery}"` : "No items available"}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {menuItems.map((item) => {
            const isSelected = selectedItemIds.has(item.id);
            const imgSrc =
              item?.imagePath &&
              typeof item.imagePath === "string" &&
              item.imagePath.trim() !== "" &&
              item.imagePath !== "null" &&
              item.imagePath !== "undefined" &&
              !item.imagePath.toLowerCase().includes("/null") &&
              /\.(jpg|jpeg|png|webp|gif)$/i.test(item.imagePath)
                ? item.imagePath
                : toAbsoluteUrl("/media/menu/noImage.jpg");

            return (
              <div
                key={item.id}
                onClick={() => onToggleItem(item)}
                className={`relative bg-white rounded-xl cursor-pointer transition-all overflow-hidden group
                  ${isSelected
                    ? "ring-2 ring-green-500 shadow-md"
                    : "border border-gray-150 hover:border-primary/40 hover:shadow-sm"
                  }`}
              >
                <div className="relative aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={item.nameEnglish || item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-green-500/15 flex items-center justify-center">
                      <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                  {!isSelected && (
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/8 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100">
                      <div className="w-7 h-7 bg-primary/90 rounded-full flex items-center justify-center shadow">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
                <div className={`px-2 py-1.5 border-t ${isSelected ? "border-green-200 bg-green-50/50" : "border-gray-100"}`}>
                  <p className={`text-xs font-medium text-center line-clamp-2 leading-tight ${isSelected ? "text-green-700" : "text-gray-700"}`}>
                    {item.nameEnglish || item.name}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && (
          <div ref={observerRef} className="py-6 flex items-center justify-center">
            {loading && (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-xs">Loading more...</span>
              </div>
            )}
          </div>
        )}

        {!hasMore && menuItems.length > 0 && (
          <p className="text-center text-xs text-gray-400 py-4">
            All {menuItems.length} items loaded
          </p>
        )}
      </div>
    </div>
  );
}

export default MenuItemGridPackage;