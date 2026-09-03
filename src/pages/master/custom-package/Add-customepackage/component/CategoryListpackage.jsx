import { useState, useMemo, useRef, useEffect } from "react";
import { GripVertical, Plus, Search, Hash } from "lucide-react";

function CategoryListpackage({
  selectedCategory,
  onSelectCategory,
  categories,
  setCategories,
  categoryItemCounts,
  onCategoryItemCountChange,
  onReorderCategories,
  onAddCategory,
  selectedCategories = new Set(),
  onToggleCategory,
  // NEW: pass items of selected categories so they appear in the dropdown
  selectedCategoryItems = {}, // { [catId]: Item[] }
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [activeIdx, setActiveIdx] = useState(-1);
  const dropdownRef = useRef(null);
  const itemRefs = useRef([]);

  const displayCategories = useMemo(
    () => [{ id: "all", nameEnglish: "All" }, ...categories],
    [categories],
  );

  // ── NEW: flatten all items from selected categories for dropdown ──────
  const allSelectedItems = useMemo(() => {
    const result = [];
    Object.entries(selectedCategoryItems).forEach(([catId, items]) => {
      const cat = categories.find((c) => String(c.id) === String(catId));
      const catName = cat?.nameEnglish || catId;
      (items || []).forEach((item) => {
        result.push({ ...item, _catId: catId, _catName: catName });
      });
    });
    return result;
  }, [selectedCategoryItems, categories]);

  // ── Dropdown: split into category matches + item matches ─────────────
  const { filteredCats, filteredItems } = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      return { filteredCats: displayCategories, filteredItems: [] };
    }
    return {
      filteredCats: displayCategories.filter((cat) =>
        cat.nameEnglish?.toLowerCase().includes(q),
      ),
      filteredItems: allSelectedItems.filter((item) => {
        const name = item.nameEnglish || item.menuItemName || item.name || "";
        return name.toLowerCase().includes(q);
      }),
    };
  }, [displayCategories, searchQuery, allSelectedItems]);

  // Combined flat list for keyboard nav
  const dropdownList = useMemo(() => [
    ...filteredCats.map((c) => ({ type: "cat", data: c })),
    ...(filteredItems.length > 0
      ? [{ type: "divider", label: "Items in package" },
         ...filteredItems.map((i) => ({ type: "item", data: i }))]
      : []),
  ], [filteredCats, filteredItems]);

  // Only navigable rows (skip dividers)
  const navigableIndexes = useMemo(
    () => dropdownList.reduce((acc, row, idx) => {
      if (row.type !== "divider") acc.push(idx);
      return acc;
    }, []),
    [dropdownList],
  );

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (activeIdx >= 0 && itemRefs.current[activeIdx])
      itemRefs.current[activeIdx].scrollIntoView({ block: "nearest" });
  }, [activeIdx]);

  const handleKeyDown = (e) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((p) => {
        const pos = navigableIndexes.indexOf(p);
        return navigableIndexes[Math.min(pos + 1, navigableIndexes.length - 1)] ?? p;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((p) => {
        const pos = navigableIndexes.indexOf(p);
        return navigableIndexes[Math.max(pos - 1, 0)] ?? p;
      });
    } else if (e.key === "Enter" && activeIdx >= 0) {
      const row = dropdownList[activeIdx];
      if (row?.type === "cat") {
        onSelectCategory(row.data.id);
      }
      setSearchQuery(""); setShowDropdown(false); setActiveIdx(-1);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  const handleDragStart = (e, index) => { setDraggedIndex(index); e.dataTransfer.effectAllowed = "move"; };
  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newCategories = [...categories];
    const draggedItem = newCategories.splice(draggedIndex, 1)[0];
    newCategories.splice(index, 0, draggedItem);
    setDraggedIndex(index);
    onReorderCategories(newCategories);
  };
  const handleDragEnd = () => setDraggedIndex(null);

  const checkedCount = selectedCategories.size;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Search with dropdown */}
      <div className="p-2.5 border-b border-gray-100" ref={dropdownRef}>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search categories or items..."
              className="w-full pl-8 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              value={searchQuery}
              autoComplete="off"
              onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); setActiveIdx(-1); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              onKeyDown={handleKeyDown}
            />
            {searchQuery && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-base leading-none"
                onMouseDown={(e) => { e.preventDefault(); setSearchQuery(""); }}
              >×</button>
            )}

            {showDropdown && (
              <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
                {dropdownList.length === 0 ? (
                  <div className="px-3 py-3 text-xs text-gray-400 text-center">Nothing found</div>
                ) : (
                  dropdownList.map((row, idx) => {
                    // ── Divider ──────────────────────────────────────────
                    if (row.type === "divider") {
                      return (
                        <div key="divider-items" className="px-3 py-1.5 bg-gray-50 border-t border-b border-gray-100">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                            {row.label}
                          </span>
                        </div>
                      );
                    }

                    const isActive = activeIdx === idx;

                    // ── Category row ─────────────────────────────────────
                    if (row.type === "cat") {
                      const cat = row.data;
                      const isSelected = cat.id !== "all" && selectedCategories.has(String(cat.id));
                      const isCurrent = selectedCategory === cat.id;
                      return (
                        <div
                          key={`cat-${cat.id}`}
                          ref={(el) => (itemRefs.current[idx] = el)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            onSelectCategory(cat.id);
                            setSearchQuery(""); setShowDropdown(false); setActiveIdx(-1);
                          }}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`flex items-center gap-2 px-3 py-2 cursor-pointer border-b border-gray-50 last:border-0 transition-colors
                            ${isActive ? "bg-primary" : isCurrent ? "bg-primary/8" : "hover:bg-gray-50"}`}
                        >
                          {cat.id !== "all" && (
                            <div
                              onClick={(e) => { e.stopPropagation(); onToggleCategory?.(cat.id); }}
                              className={`flex-shrink-0 w-3.5 h-3.5 rounded border-2 flex items-center justify-center cursor-pointer transition-all
                                ${isSelected ? "bg-primary border-primary" : isActive ? "border-white/60 bg-white/10" : "border-gray-300 hover:border-primary"}`}
                            >
                              {isSelected && (
                                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 12 12">
                                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </div>
                          )}
                          {cat.id === "all" && <div className="w-3.5 flex-shrink-0" />}
                          <span className={`flex-1 text-sm truncate ${isActive ? "text-white font-medium" : isCurrent ? "text-primary font-semibold" : "text-gray-700"}`}>
                            {cat.nameEnglish}
                          </span>
                          {isSelected && !isActive && (
                            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded-full leading-none">✓</span>
                          )}
                        </div>
                      );
                    }

                    // ── Item row ─────────────────────────────────────────
                    if (row.type === "item") {
                      const item = row.data;
                      const name = item.nameEnglish || item.menuItemName || item.name || "—";
                      return (
                        <div
                          key={`item-${item.id || idx}`}
                          ref={(el) => (itemRefs.current[idx] = el)}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            // Navigate to its category
                            onSelectCategory(item._catId);
                            setSearchQuery(""); setShowDropdown(false); setActiveIdx(-1);
                          }}
                          onMouseEnter={() => setActiveIdx(idx)}
                          className={`flex items-center gap-2.5 px-3 py-2 cursor-pointer border-b border-gray-50 last:border-0 transition-colors
                            ${isActive ? "bg-primary" : "hover:bg-gray-50"}`}
                        >
                          {/* Colour dot to distinguish from category rows */}
                          <span className={`flex-shrink-0 w-2 h-2 rounded-full ${isActive ? "bg-white/60" : "bg-primary/40"}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-medium truncate ${isActive ? "text-white" : "text-gray-700"}`}>
                              {name}
                            </p>
                            <p className={`text-[10px] truncate ${isActive ? "text-white/70" : "text-gray-400"}`}>
                              {item._catName}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onAddCategory}
            title="Add Category"
            className="flex-shrink-0 w-8 h-8 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center justify-center transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {checkedCount > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-primary font-medium bg-blue-50 border border-blue-100 rounded-lg px-2.5 py-1">
            <span className="w-4 h-4 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0">
              {checkedCount}
            </span>
            {checkedCount === 1 ? "category" : "categories"} in package
          </div>
        )}
      </div>

      {/* List — unchanged from original */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2 space-y-0.5">
          {displayCategories.map((cat, index) => {
            const isSelected = cat.id !== "all" && selectedCategories.has(String(cat.id));
            const isActive = selectedCategory === cat.id;
            const countEntry = categoryItemCounts[cat.id];
            const count = typeof countEntry === "object" ? countEntry?.anyItem : countEntry;
            const realIndex = index - 1;

            return (
              <div
                key={cat.id}
                draggable={cat.id !== "all"}
                onDragStart={(e) => cat.id !== "all" && handleDragStart(e, realIndex)}
                onDragOver={(e) => cat.id !== "all" && handleDragOver(e, realIndex)}
                onDragEnd={handleDragEnd}
                className={draggedIndex === realIndex ? "opacity-40" : ""}
              >
                <div
                  className={`flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer transition-all group
                    ${isActive ? "bg-primary/10 border border-primary/20" : "hover:bg-gray-50 border border-transparent"}`}
                >
                  {cat.id !== "all"
                    ? <GripVertical className="w-3 h-3 text-gray-200 group-hover:text-gray-400 flex-shrink-0 cursor-grab" />
                    : <div className="w-3 flex-shrink-0" />
                  }

                  {cat.id !== "all" ? (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onToggleCategory?.(cat.id); }}
                      className={`flex-shrink-0 w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all
                        ${isSelected ? "bg-primary border-primary" : "border-gray-300 hover:border-primary/60"}`}
                    >
                      {isSelected && (
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 12 12">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  ) : <div className="w-3.5 flex-shrink-0" />}

                  <button
                    onClick={() => onSelectCategory(cat.id)}
                    className={`flex-1 text-left text-sm truncate min-w-0
                      ${isActive ? "text-primary font-semibold" : isSelected ? "text-gray-800 font-medium" : "text-gray-600"}`}
                  >
                    {cat.nameEnglish}
                  </button>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    {count > 0 && (
                      <span className="text-[10px] bg-orange-100 text-orange-600 font-bold px-1.5 py-0.5 rounded-full leading-none">
                        {count}
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-[10px] bg-green-100 text-green-600 font-bold px-1 py-0.5 rounded-full leading-none">✓</span>
                    )}
                  </div>
                </div>

                {isActive && cat.id !== "all" && (
                  <div className="mx-2 mb-1 mt-0.5 flex items-center gap-2 px-2.5 py-1.5 border border-gray-500 rounded-lg">
                    <Hash className="w-3 h-3 flex-shrink-0" />
                    <input
                      type="tel"
                      value={categoryItemCounts[cat.id] || ""}
                      onChange={(e) => onCategoryItemCountChange(cat.id, Number(e.target.value))}
                      placeholder="Any items"
                      className="flex-1 bg-transparent text-xs placeholder-gray-300 font-medium focus:outline-none min-w-0"
                      min="0"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default CategoryListpackage;