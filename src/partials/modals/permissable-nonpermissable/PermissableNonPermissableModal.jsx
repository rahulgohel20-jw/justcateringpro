import { useState, useEffect, useRef, useCallback } from "react";
import { Trash2, Plus, ChevronDown, Search } from "lucide-react";
import Swal from "sweetalert2";
import {
  GetRawMaterialByCategoryId,
  getEventPermissionRawMaterial,
  addOrUpdatePermissableNotPermissableItem,
} from "@/services/apiServices";

const TABS = [
  { key: "permissables", label: "Permissable in Jain" },
  { key: "notPermissables", label: "Non Permissable in Jain" },
];

const RM_PAGE_SIZE = 50;

const PermissableNonPermissableModal = ({
  isOpen,
  onClose,
  rawMaterials = [],
  categories = [],
  onSave,
  onLoadMore,
  hasMore = false,
  loading = false,
  onCategoryChange,
  selectedCategoryId: parentCategoryId = 0,
  userId,
  eventFunctionId,
  eventId,
  eventFunctions = [],
  initialData = null,
}) => {
  const [activeTab, setActiveTab] = useState("permissables");
  const [selectedRawMaterialIds, setSelectedRawMaterialIds] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [permissables, setPermissables] = useState([]);
  const [notPermissables, setNotPermissables] = useState([]);
  const [showRmDropdown, setShowRmDropdown] = useState(false);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [rmSearch, setRmSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedFunctionIds, setSelectedFunctionIds] = useState([]);
  const [showFnDropdown, setShowFnDropdown] = useState(false);
  const fnDropdownRef = useRef(null);
  const selectionTimerRef = useRef(null);
  const dropdownRef = useRef(null);
  const catDropdownRef = useRef(null);

  // ── Permissable/Non-Permissable data fetch ──
  const [dataLoading, setDataLoading] = useState(false);
  const fetchAbortRef = useRef(null);

  const getRawMaterialName = (item) =>
    item?.rawMaterialNameEnglish ||
    item?.rawMaterialName ||
    item?.nameEnglish ||
    item?.name ||
    item?.materialName ||
    `RM #${item?.rawMaterialId || ""}`;

  const getCategoryName = (item) =>
    item?.rawCatNameEnglish || // ← what the API actually returns
    item?.categoryName ||
    item?.categoryNameEnglish ||
    item?.rawMaterialCatNameEnglish ||
    item?.rawMaterialCat?.nameEnglish ||
    item?.rawMaterialCategory?.nameEnglish ||
    item?.rawMaterialCatName ||
    item?.rawMaterialCategoryName ||
    "—";

  const mapItems = (list = []) =>
    list.map((item) => ({
      rawMaterialId: item.rawMaterialId,
      rawMaterialName: getRawMaterialName(item),
      rawMaterialNameGujarati: item.rawMaterialNameGujarati || "",
      rawMaterialNameHindi: item.rawMaterialNameHindi || "",
      categoryId: item.rawCatId,
      categoryName: getCategoryName(item),
    }));

  // Loads the saved lists for the given function ids from the server
  // and returns them already mapped for the table.
  const loadPermissable = useCallback(
    async (ids) => {
      const res = await getEventPermissionRawMaterial(ids, eventId, userId);
      const data = res?.data?.data;
      const unique = (list) => {
        const seen = new Set();
        return list.filter((i) => {
          const key = Number(i.rawMaterialId);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      };
      return {
        permissables: unique(mapItems(data?.permissables)),
        notPermissables: unique(mapItems(data?.notPermissables)),
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eventId, userId],
  );

const fetchPermissableData = useCallback(
  async (ids) => {
    const targetIds =
      ids?.length ? ids : eventFunctionId ? [Number(eventFunctionId)] : [];
    if (!targetIds.length || !eventId) return;

    if (fetchAbortRef.current) fetchAbortRef.current.abort();
    const controller = new AbortController();
    fetchAbortRef.current = controller;

    setDataLoading(true);
    try {
      const fresh = await loadPermissable(targetIds);
      if (controller.signal.aborted) return;
      setPermissables(fresh.permissables);
      setNotPermissables(fresh.notPermissables);
    } catch (err) {
      console.error("Failed to fetch permissable data:", err);
    } finally {
      if (!controller.signal.aborted) setDataLoading(false);
    }
  },
  [eventFunctionId, eventId, loadPermissable],
);
  // ── Raw material search (API-driven, now category-aware) ──
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(true);
  const searchAbortRef = useRef(null);

  const fetchRawMaterialSearch = useCallback(
    async (query, page = 1, append = false, categoryId = 0) => {
      if (!userId) return;

      if (searchAbortRef.current) {
        searchAbortRef.current.abort();
      }
      const controller = new AbortController();
      searchAbortRef.current = controller;

      setSearchLoading(true);
      try {
        // ⚠️ ADJUST THIS: pass categoryId in whatever position/shape
        // your real SearchRawMaterial signature expects. This assumes
        // an extra trailing param — confirm against your apiServices.js.
        const res = await GetRawMaterialByCategoryId(
          true,
          userId,
          page,
          RM_PAGE_SIZE,
          query || "",
          controller.signal,
          categoryId || undefined,
        );
        const data = res?.data?.data || {};
        const items = data["Raw Material Details"] || [];
        const total = data.totalItems || 0;

        setSearchResults((prev) => (append ? [...prev, ...items] : items));
        setSearchHasMore(page * RM_PAGE_SIZE < total);
        setSearchPage(page);
      } catch (err) {
        if (err?.name !== "CanceledError" && err?.code !== "ERR_CANCELED") {
          console.error("Raw material search failed:", err);
        }
      } finally {
        setSearchLoading(false);
      }
    },
    [userId],
  );

  const prevIsOpenRef = useRef(false);

  useEffect(() => {
  const justOpened = isOpen && !prevIsOpenRef.current;
  prevIsOpenRef.current = isOpen;

  if (!isOpen || !justOpened) return;

  const allIds = eventFunctions.length
    ? eventFunctions.map((f) => Number(f.id))
    : eventFunctionId
      ? [Number(eventFunctionId)]
      : [];

  setActiveTab("permissables");
  setSelectedFunctionIds(allIds);
  setShowFnDropdown(false);
  setSelectedRawMaterialIds([]);
  setShowRmDropdown(false);
  setShowCatDropdown(false);
  setCatSearch("");
  setRmSearch("");
  setSearchResults([]);
  setSearchPage(1);
  setSearchHasMore(true);

  if (initialData) {
    setPermissables(initialData.permissables || []);
    setNotPermissables(initialData.notPermissables || []);
  } else {
    setPermissables([]);
    setNotPermissables([]);
  }

  fetchPermissableData(allIds);
}, [isOpen, initialData, fetchPermissableData, eventFunctionId, eventFunctions]);
  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;

    if (!isOpen) return;

    if (justOpened) {
      setActiveTab("permissables");
      setSelectedFunctionIds(allIds); 
      setSelectedFunctionIds(eventFunctionId ? [Number(eventFunctionId)] : []);
      setShowFnDropdown(false);
      setSelectedRawMaterialIds([]);
      setShowRmDropdown(false);
      setShowCatDropdown(false);
      setCatSearch("");
      setRmSearch("");
      setSearchResults([]);
      setSearchPage(1);
      setSearchHasMore(true);
      setSelectedFunctionIds(allIds); 

      if (initialData) {
        // show what the page already has while the fresh GET runs
        setPermissables(initialData.permissables || []);
        setNotPermissables(initialData.notPermissables || []);
      } else {
        setPermissables([]);
        setNotPermissables([]);
      }
      fetchPermissableData();
    }
  }, [isOpen, initialData, fetchPermissableData, eventFunctionId]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowRmDropdown(false);
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target)) {
        setShowCatDropdown(false);
      }
      if (fnDropdownRef.current && !fnDropdownRef.current.contains(e.target)) {
        setShowFnDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCategoryId(parentCategoryId || "");
  }, [isOpen, parentCategoryId]);

  // Re-fetch whenever the search text OR the selected category changes,
  // as long as the RM dropdown is open.
  useEffect(() => {
    if (!showRmDropdown) return;
    const timer = setTimeout(() => {
      fetchRawMaterialSearch(rmSearch, 1, false, selectedCategoryId);
    }, 300);
    return () => clearTimeout(timer);
  }, [rmSearch, selectedCategoryId, showRmDropdown, fetchRawMaterialSearch]);

  const currentList = activeTab === "permissables" ? permissables : notPermissables;

  const filteredCategories = categories.filter((cat) => {
    if (!catSearch.trim()) return true;
    const name = (cat.nameEnglish || cat.name || "").toLowerCase();
    return name.includes(catSearch.toLowerCase());
  });

  // Fallback client-side filter — kept as a safety net in case the API
  // doesn't actually scope by category server-side.
  const filteredRawMaterials = searchResults.filter((rm) => {
    if (!selectedCategoryId) return true;
    const catId =
      rm.rawMaterialCat?.id ??
      rm.rawMaterialCatId ??
      rm.categoryId ??
      rm.rawCatId ??
      rm.category?.id;
    // If we truly can't find a category field on the item, don't hide it —
    // better to over-show than to silently filter everything out.
    if (catId === undefined || catId === null) return true;
    return Number(catId) === Number(selectedCategoryId);
  });

  const selectedCatObj = categories.find((c) => Number(c.id) === Number(selectedCategoryId));

  const handleToggleRawMaterial = (rmId) => {
    setSelectedRawMaterialIds((prev) =>
      prev.includes(rmId) ? prev.filter((id) => id !== rmId) : [...prev, rmId]
    );
  };

  const handleRmDropdownScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 50 && searchHasMore && !searchLoading) {
      fetchRawMaterialSearch(rmSearch, searchPage + 1, true, selectedCategoryId);
    }
  };

  const handleAddAll = () => {
    if (selectedRawMaterialIds.length === 0) {
      Swal.fire({ icon: "warning", title: "Select raw materials", timer: 1200, showConfirmButton: false });
      return;
    }

    const newItems = [];
    const skipped = [];

    selectedRawMaterialIds.forEach((rmId) => {
      const alreadyExists = currentList.some(
        (item) => Number(item.rawMaterialId) === Number(rmId)
      );
      if (alreadyExists) {
        skipped.push(rmId);
        return;
      }
      const rawMat =
        searchResults.find((rm) => Number(rm.id) === Number(rmId)) ||
        rawMaterials.find((rm) => Number(rm.id) === Number(rmId));
      newItems.push({
        rawMaterialId: Number(rmId),
        rawMaterialName:
          rawMat?.nameEnglish ||
          rawMat?.name ||
          rawMat?.rawMaterialNameEnglish ||
          rawMat?.rawMaterialName ||
          `RM #${rmId}`,
        categoryName:
          rawMat?.rawMaterialCat?.nameEnglish ||
          rawMat?.rawMaterialCatNameEnglish ||
          rawMat?.categoryName ||
          rawMat?.category?.nameEnglish ||
          selectedCatObj?.nameEnglish ||
          "—",
      });
    });

    if (activeTab === "permissables") {
      setPermissables((prev) => [...prev, ...newItems]);
    } else {
      setNotPermissables((prev) => [...prev, ...newItems]);
    }

    setSelectedRawMaterialIds([]);
    setShowRmDropdown(false);

    if (skipped.length > 0) {
      Swal.fire({ icon: "info", title: `${skipped.length} item(s) already added`, timer: 1200, showConfirmButton: false });
    }
  };

  const handleRemove = (rawMaterialId) => {
    if (activeTab === "permissables") {
      setPermissables((prev) => prev.filter((item) => Number(item.rawMaterialId) !== Number(rawMaterialId)));
    } else {
      setNotPermissables((prev) => prev.filter((item) => Number(item.rawMaterialId) !== Number(rawMaterialId)));
    }
  };

  const getFunctionLabel = (fn) =>
    fn?.function?.nameEnglish || fn?.nameEnglish || `Function #${fn?.id}`;

  // Re-calls the GET with ALL selected function ids (debounced).
  const reloadForSelection = (ids) => {
    if (selectionTimerRef.current) clearTimeout(selectionTimerRef.current);
    if (!ids.length || !eventId) return; // nothing selected -> keep current lists

    selectionTimerRef.current = setTimeout(async () => {
      if (fetchAbortRef.current) fetchAbortRef.current.abort();
      const controller = new AbortController();
      fetchAbortRef.current = controller;

      setDataLoading(true);
      try {
        const fresh = await loadPermissable(ids);
        if (controller.signal.aborted) return;
        setPermissables(fresh.permissables);
        setNotPermissables(fresh.notPermissables);
      } catch (err) {
        console.error("Failed to load for selected functions:", err);
      } finally {
        if (!controller.signal.aborted) setDataLoading(false);
      }
    }, 300);
  };

  const applyFunctionSelection = (next) => {
    setSelectedFunctionIds(next);
    reloadForSelection(next);
  };

  const toggleFunction = (id) =>
    applyFunctionSelection(
      selectedFunctionIds.includes(id)
        ? selectedFunctionIds.filter((x) => x !== id)
        : [...selectedFunctionIds, id],
    );

  const allFunctionsSelected =
    eventFunctions.length > 0 && selectedFunctionIds.length === eventFunctions.length;

  const handleSave = async () => {
     if (!selectedFunctionIds.length) {
    Swal.fire({ icon: "warning", title: "Select at least one function", timer: 1500, showConfirmButton: false });
    return;
  }
    const ids = selectedFunctionIds;

    const lists = {
      permissables: permissables.map((i) => ({
        rawMaterialId: Number(i.rawMaterialId),
      })),
      notPermissables: notPermissables.map((i) => ({
        rawMaterialId: Number(i.rawMaterialId),
      })),
    };

    const payload = {
      eventId: Number(eventId),
      userId: Number(userId),
      eventFunction: ids.map((id) => ({ eventFunctionId: id, ...lists })),
    };

    try {
      setSaving(true);
      const res = await addOrUpdatePermissableNotPermissableItem(payload);

      if (res?.data?.success === false) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.message || res?.data?.msg || "Failed to save",
        });
        return;
      }

      // 1) success message from the API
      Swal.fire({
        icon: "success",
        title: res?.data?.msg || "Saved successfully",
        timer: 1800,
        showConfirmButton: false,
      });

      // 2) reload saved lists from the server (current function)
      let fresh = null;
      try {
        fresh = await loadPermissable(ids);
        setPermissables(fresh.permissables);
        setNotPermissables(fresh.notPermissables);
      } catch (reloadErr) {
        console.error("Reload after save failed:", reloadErr);
      }

      // 3) let the parent update its state / close the modal
      onSave?.(
        fresh || {
          permissables,
          notPermissables,
        },
      );
    } catch (err) {
      console.error("Save failed:", err);
      Swal.fire({ icon: "error", title: "Error", text: "Failed to save" });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl shadow-2xl w-[750px] max-w-[95vw] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <h3 className="text-base font-bold text-gray-900">Permissable / Non Permissable</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100">
            <i className="ki-filled ki-cross text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-6 py-4 flex flex-col min-h-0">
          {/* Functions — multi-select dropdown */}
          {eventFunctions.length > 0 && (
            <div className="mb-3 flex-shrink-0" ref={fnDropdownRef}>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                Functions {selectedFunctionIds.length > 0 && `(${selectedFunctionIds.length} selected)`}
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  onClick={() => {
                    setShowFnDropdown((prev) => !prev);
                    setShowCatDropdown(false);
                    setShowRmDropdown(false);
                  }}
                >
                  <span className={selectedFunctionIds.length > 0 ? "text-gray-800 truncate" : "text-gray-400"}>
                    {selectedFunctionIds.length === 0
                      ? "Select functions"
                      : selectedFunctionIds.length === 1
                        ? getFunctionLabel(
                            eventFunctions.find((f) => Number(f.id) === selectedFunctionIds[0]),
                          )
                        : `${selectedFunctionIds.length} functions selected`}
                  </span>
                  <ChevronDown size={14} className="text-gray-400 flex-shrink-0" />
                </button>

                {showFnDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] overflow-hidden">
                    <div
                     onClick={() =>
  applyFunctionSelection(
    allFunctionsSelected ? [] : eventFunctions.map((f) => Number(f.id)),
  )
}
                      className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 border-b border-gray-100 font-semibold text-gray-700"
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        allFunctionsSelected ? "bg-primary border-primary" : "border-gray-300"
                      }`}>
                        {allFunctionsSelected && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      Select all
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {eventFunctions.map((fn) => {
                        const id = Number(fn.id);
                        const isSelected = selectedFunctionIds.includes(id);
                        return (
                          <div
                            key={id}
                            onClick={() => toggleFunction(id)}
                            className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                              isSelected ? "bg-primary/5" : ""
                            }`}
                          >
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "bg-primary border-primary" : "border-gray-300"
                            }`}>
                              {isSelected && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-gray-700 truncate">{getFunctionLabel(fn)}</div>
                              {fn.functionStartDateTime && (
                                <div className="text-[11px] text-gray-400 truncate">{fn.functionStartDateTime}</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4 flex-shrink-0">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2.5 text-sm font-semibold border-b-2 transition ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  {tab.key === "permissables" ? permissables.length : notPermissables.length}
                </span>
              </button>
            ))}
          </div>

          {/* Add Form */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-4 items-end flex-shrink-0">
            {/* Category — Search Dropdown */}
            <div className="sm:col-span-5" ref={catDropdownRef}>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">Category</label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  onClick={() => { setShowCatDropdown((prev) => !prev); setShowRmDropdown(false); setShowFnDropdown(false); }}
                >
                  <span className={selectedCategoryId ? "text-gray-800" : "text-gray-400"}>
                    {selectedCategoryId
                      ? selectedCatObj?.nameEnglish || `Category #${selectedCategoryId}`
                      : "All Categories"}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {showCatDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                      <Search size={14} className="text-gray-400" />
                      <input
                        autoFocus
                        className="flex-1 text-sm outline-none bg-transparent"
                        placeholder="Search categories..."
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      <div
                        onClick={() => {
                          setSelectedCategoryId("");
                          setSelectedRawMaterialIds([]);
                          setShowCatDropdown(false);
                          setCatSearch("");
                          onCategoryChange?.(0);
                        }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                          !selectedCategoryId ? "bg-primary/10 text-primary font-semibold" : "text-gray-700"
                        }`}
                      >
                        All Categories
                      </div>
                      {filteredCategories.map((cat) => (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategoryId(cat.id);
                            setSelectedRawMaterialIds([]);
                            setShowCatDropdown(false);
                            setCatSearch("");
                            onCategoryChange?.(cat.id);
                          }}
                          className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                            Number(selectedCategoryId) === Number(cat.id) ? "bg-primary/10 text-primary font-semibold" : "text-gray-700"
                          }`}
                        >
                          {cat.nameEnglish || cat.name || `Category #${cat.id}`}
                        </div>
                      ))}
                      {filteredCategories.length === 0 && (
                        <div className="px-3 py-2 text-sm text-gray-400">No categories found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Raw Material — Multi-select Search Dropdown (API-driven) */}
            <div className="sm:col-span-5" ref={dropdownRef}>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
                Raw Material {selectedRawMaterialIds.length > 0 && `(${selectedRawMaterialIds.length} selected)`}
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  onClick={() => {
                    setShowRmDropdown((prev) => {
                      const next = !prev;
                      if (next) fetchRawMaterialSearch(rmSearch, 1, false, selectedCategoryId);
                      return next;
                    });
                    setShowCatDropdown(false);
                    setShowFnDropdown(false);
                  }}
                >
                  <span className={selectedRawMaterialIds.length > 0 ? "text-gray-800" : "text-gray-400"}>
                    {selectedRawMaterialIds.length > 0
                      ? `${selectedRawMaterialIds.length} selected`
                      : "Select raw materials"}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {showRmDropdown && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100">
                      <Search size={14} className="text-gray-400" />
                      <input
                        autoFocus
                        className="flex-1 text-sm outline-none bg-transparent"
                        placeholder="Search raw materials..."
                        value={rmSearch}
                        onChange={(e) => setRmSearch(e.target.value)}
                      />
                    </div>
                    <div
                      className="max-h-52 overflow-y-auto"
                      onScroll={handleRmDropdownScroll}
                    >
                      {filteredRawMaterials.length === 0 && !searchLoading ? (
                        <div className="px-3 py-2 text-sm text-gray-400">No raw materials found</div>
                      ) : (
                        filteredRawMaterials.map((rm) => {
                          const isSelected = selectedRawMaterialIds.includes(rm.id);
                          return (
                            <div
                              key={rm.id}
                              onClick={() => handleToggleRawMaterial(rm.id)}
                              className={`flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                                isSelected ? "bg-primary/5" : ""
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isSelected ? "bg-primary border-primary" : "border-gray-300"
                              }`}>
                                {isSelected && (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                  </svg>
                                )}
                              </div>
                              <span className="text-gray-700">{rm.nameEnglish || rm.name || ""}</span>
                            </div>
                          );
                        })
                      )}
                      {searchLoading && (
                        <div className="px-3 py-2 text-sm text-gray-400 text-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mx-auto" />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <button
                type="button"
                onClick={handleAddAll}
                disabled={selectedRawMaterialIds.length === 0}
                className="w-full btn btn-primary text-sm h-9 flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <Plus size={15} /> Add
              </button>
            </div>
          </div>

          {/* Table — scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">#</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Raw Material</th>
                    <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase">Category</th>
                    <th className="text-center px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase w-16">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {dataLoading ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary mx-auto" />
                      </td>
                    </tr>
                  ) : currentList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-sm text-gray-400">No items added yet.</td>
                    </tr>
                  ) : (
                    currentList.map((item, idx) => (
                      <tr key={item.rawMaterialId} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-2.5 text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-800">
                          {item.rawMaterialName}
                          {item.rawMaterialNameGujarati && (
                            <div className="text-xs font-normal text-gray-500">{item.rawMaterialNameGujarati}</div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-gray-500">{item.categoryName}</td>
                        <td className="px-4 py-2.5 text-center">
                          <button onClick={() => handleRemove(item.rawMaterialId)} className="text-red-500 hover:text-red-700 transition">
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 flex-shrink-0">
          <button type="button" onClick={onClose} className="btn btn-light text-sm h-9 px-4">Cancel</button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn btn-primary text-sm h-9 px-5 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </>
  );
};

export default PermissableNonPermissableModal;