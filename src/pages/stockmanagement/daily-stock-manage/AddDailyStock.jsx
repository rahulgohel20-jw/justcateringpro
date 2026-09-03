import { Fragment, useState, useEffect, useRef } from "react";
import { Container } from "@/components/container";
import { useParams, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import Swal from "sweetalert2";
import {
  GetDailyStockManage,
  AddDailyStockManage,
  GetRawMaterialcategory,
  SearchItemDailyStockManage,
  ViewDailyStock,
  GetStockTypeByUserId,
} from "@/services/apiServices";
import { Save } from "lucide-react";
import { useStockTypePermission } from "../../../hooks/useStockTypePermission";

const todayISO = () => new Date().toISOString().split("T")[0];

const PAGE_SIZE = 100;


const isValidDecimal2 = (v) => v === "" || /^\d*\.?\d{0,2}$/.test(v);

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

const AddDailyStock = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");

  const isViewMode = !!id;

  // ── View-mode data ──
  const [viewData, setViewData] = useState(null);
  const [viewLoading, setViewLoading] = useState(isViewMode);

  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [tabsLoading, setTabsLoading] = useState(false);

  const [rows, setRows] = useState([]);
  const [rowsMap, setRowsMap] = useState({});
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [manageDate, setManageDate] = useState(todayISO());
const [storeTypes, setStoreTypes] = useState([]);
const [storeTypeId, setStoreTypeId] = useState("");
  // True total item count per category, as reported by the server
  // (`totalElements`) — NOT the number of rows loaded on the client so far.
  const [categoryTotals, setCategoryTotals] = useState({});

  const sentinelRef = useRef(null);
  const observerRef = useRef(null);
  const loadingRef = useRef(false);
  const { filterStockTypes } = useStockTypePermission();

useEffect(() => {
  if (isViewMode || !userId) return;

  GetStockTypeByUserId(JSON.parse(userId), 0)
    .then((res) => {
      const list = Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      setStoreTypes(filterStockTypes(list)); 

      setStoreTypeId("");
    })
    .catch((err) => console.error(err));
}, []);


  // ── Fetch the view record ──
  useEffect(() => {
    if (!id) return;
    setViewLoading(true);
    ViewDailyStock(id)
      .then((res) => {
        const data = res?.data?.data ?? null;
        setViewData(data);
      })
      .catch((err) => {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load stock record.",
          confirmButtonColor: "#dc2626",
        });
      })
      .finally(() => setViewLoading(false));
  }, [id]);

  // ── When viewData is ready, populate tabs & rows from it ──
  useEffect(() => {
    if (!viewData) return;

    // Set manage date
    if (viewData.manageDate) {
      setManageDate(viewData.manageDate.split("/").reverse().join("-"));
    }
if (viewData.storeTypeId != null) {
  setStoreTypeId(viewData.storeTypeId);
}
    const categories = viewData.categories || [];

    // Build tabs from categories
    const tabList = categories.map((cat) => ({
      id: cat.catId,
      nameEnglish: cat.catName,
    }));
    setTabs(tabList);

    // Build rowsMap from all items across all categories
    const map = {};
    categories.forEach((cat) => {
      const rows = (cat.items || []).map((item) => ({
        _id: `${item.rawMaterialId}`,
        rawMaterialId: item.rawMaterialId,
        rawMaterialName: item.rawMaterialName,
        catId: item.catId,
        catName: item.catName,
        unitId: item.unitId ?? 0,
        unitName: item.unitName,
        storeQty: item.storeQty ?? 0,
        increaseQty: item.increaseQty ?? 0,
        wastageQty: item.wastageQty ?? 0,
        closingStock: item.closingStock ?? 0,
        remarks: item.remarks ?? "",
      }));
      map[cat.catId] = {
        rows,
        page: 0,
        hasMore: false,
      };
    });

    setRowsMap(map);

    // Set active tab to the first one and load its rows
    if (tabList.length > 0) {
      setActiveTab(tabList[0].id);
      setRows(map[tabList[0].id]?.rows || []);
      setHasMore(false);
    }
  }, [viewData]);

  // ── Tab switch (non-view mode: fetch items; view mode: from rowsMap) ──
  useEffect(() => {
    if (!activeTab) return;

    if (isViewMode) {
      // In view mode, load rows from the pre-built map
      const tabData = rowsMap[activeTab];
      setRows(tabData?.rows || []);
      setPage(0);
      setHasMore(false);
      setSearch("");
    } else {
      // Add mode: use cached or fetch
      if (rowsMap[activeTab]) {
        setRows(rowsMap[activeTab].rows);
        setPage(rowsMap[activeTab].page);
        setHasMore(rowsMap[activeTab].hasMore);
      } else {
        setRows([]);
        setPage(0);
        setHasMore(true);
        fetchItems(activeTab, 0, []);
      }
      setSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ── Fetch categories (add mode only; view mode uses data from API) ──
  useEffect(() => {
    if (isViewMode) return; // categories come from viewData
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    setTabsLoading(true);
    try {
      const res = await GetRawMaterialcategory(userId);
      const cats = res?.data?.data?.["Raw Material Category Details"] || [];
      setTabs(cats);
      if (cats.length > 0) setActiveTab(cats[0].id);
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load categories.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setTabsLoading(false);
    }
  };

  // ── Search (add mode only) ──
  const fetchSearchItems = async (catId, searchText, pageNum = 0) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setItemsLoading(true);
    try {
      const res = await SearchItemDailyStockManage(
        userId,
        searchText,
        catId,
        storeTypeId,
        pageNum,
        PAGE_SIZE
      );
      const catBlock = res?.data?.data?.[0];
      const items = catBlock?.items || [];
      const totalPages = res?.data?.totalPages ?? 1;

      const newRows = items.map((item) => ({
        _id: `${item.rawMaterialId}`,
        rawMaterialId: item.rawMaterialId,
        rawMaterialName: item.rawMaterialName,
        catId: item.catId,
        catName: item.catName,
        unitId: item.unitId ?? 0,
        unitName: item.unitName,
        storeQty: item.storeQty ?? 0,
        increaseQty: item.increaseQty ?? 0,
        wastageQty: item.wastageQty ?? 0,
        closingStock: item.closingStock ?? 0,
        remarks: item.remarks ?? "",
      }));

      if (pageNum === 0) {
        setRows(newRows);
      } else {
        setRows((prev) => [...prev, ...newRows]);
      }
      setPage(pageNum);
      setHasMore(pageNum < totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      loadingRef.current = false;
      setItemsLoading(false);
    }
  };

  // NOTE: This effect previously re-ran (and force-refetched fresh data from
  // the server) every time `activeTab` changed, even when the search box was
  // already empty — because `activeTab` is in the dependency array. That
  // wiped out any unsaved edits the moment you switched tabs, since the fresh
  // fetch had no idea about your local changes. Fix: when the search text is
  // empty, restore from `rowsMap` (which already holds your edits) instead of
  // hitting the server again. Only fetch fresh if this tab has never been
  // loaded before.
  useEffect(() => {
  if (isViewMode) return;
  if (!activeTab ) return;

  setRows([]);
  setRowsMap({});
  setCategoryTotals({});
  setPage(0);
  setHasMore(true);

  fetchItems(activeTab, 0, []);
}, [storeTypeId]);

  useEffect(() => {
    if (isViewMode) return; // no search in view mode
    const timer = setTimeout(() => {
      if (!activeTab || !storeTypeId) return;
      const searchText = search.trim();
      if (searchText.length >= 2) {
        setRows([]);
        setPage(0);
        setHasMore(true);
        fetchSearchItems(activeTab, searchText, 0);
      } else if (searchText.length === 0) {
        if (rowsMap[activeTab]) {
          // Already have (possibly edited) data cached for this tab — restore it
          setRows(rowsMap[activeTab].rows);
          setPage(rowsMap[activeTab].page);
          setHasMore(rowsMap[activeTab].hasMore);
        } else {
          // Never loaded this tab before — fetch fresh
          setRows([]);
          setPage(0);
          setHasMore(true);
          fetchItems(activeTab, 0, []);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeTab]);

  const fetchItems = async (catId, pageNum, existingRows) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setItemsLoading(true);
    try {
      const res = await GetDailyStockManage(userId, catId, storeTypeId, pageNum, PAGE_SIZE);
      const catBlock = res?.data?.data?.[0];
      const items = catBlock?.items || [];
      const totalPages = res?.data?.totalPages ?? 1;
      const totalElements = res?.data?.totalElements;

      const newRows = items.map((item) => ({
        _id: `${item.rawMaterialId}`,
        rawMaterialId: item.rawMaterialId,
        rawMaterialName: item.rawMaterialName,
        catId: item.catId,
        catName: item.catName,
        unitId: item.unitId ?? 0,
        unitName: item.unitName,
        storeQty: item.storeQty ?? 0,
        increaseQty: item.increaseQty ?? 0,
        wastageQty: item.wastageQty ?? 0,
        closingStock: item.closingStock ?? 0,
        remarks: item.remarks ?? "",
      }));

      const merged = [...existingRows, ...newRows];
      const noMore = pageNum >= totalPages;

      setRows(merged);
      setPage(pageNum);
      setHasMore(!noMore);

      setRowsMap((prev) => ({
        ...prev,
        [catId]: { rows: merged, page: pageNum, hasMore: !noMore },
      }));

      if (typeof totalElements === "number") {
        setCategoryTotals((prev) => ({ ...prev, [catId]: totalElements }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      loadingRef.current = false;
      setItemsLoading(false);
    }
  };

  // ── Infinite scroll observer (add mode only) ──
  useEffect(() => {
    if (isViewMode) return;
    // Guard: activeTab isn't ready yet (categories still loading). Without
    // this, the observer fires the moment the (empty) sentinel is mounted
    // and intersecting, calling fetchItems with catId=null and a stale
    // page+1 — the spurious 400 request seen alongside the real page=0 call.
    if (!activeTab) return;
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingRef.current &&
          activeTab
        ) {
          if (search.trim()) {
            fetchSearchItems(activeTab, search, page + 1);
          } else {
            fetchItems(activeTab, page + 1, rows);
          }
        }
      },
      { threshold: 0.1 }
    );
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);

    return () => observerRef.current?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, itemsLoading, page, rows, activeTab]);

  // Pure per-row transform, shared by both the on-screen `rows` update and
  // the master `rowsMap` update below, so the same edit logic is applied
  // consistently to whichever list contains the row.
  const applyFieldLogic = (row, field, rawValue) => {
    const next = { ...row, [field]: rawValue };
    const closing = Number(row.closingStock) || 0;

    if (field === "storeQty") {
      const newStore = Number(rawValue) || 0;
      const delta = round2(newStore - closing);
      if (delta > 0) {
        next.increaseQty = round2(delta);
        next.wastageQty = 0;
      } else if (delta < 0) {
        next.wastageQty = round2(Math.abs(delta));
        next.increaseQty = 0;
      } else {
        next.increaseQty = 0;
        next.wastageQty = 0;
      }
    } else if (field === "increaseQty") {
      const newIncrease = Number(rawValue) || 0;
      next.storeQty = round2(closing + newIncrease);
      next.wastageQty = 0;
    } else if (field === "wastageQty") {
      const newWastage = Number(rawValue) || 0;
      next.storeQty = round2(Math.max(0, closing - newWastage));
      next.increaseQty = 0;
    } else if (field === "remarks") {
      next.remarks = rawValue;
    }
    return next;
  };

  const handleChange = (_id, field, rawValue) => {
    // Keep Manage Qty / Wastage Qty capped at 2 decimal places while typing
    if (
      (field === "increaseQty" || field === "wastageQty") &&
      !isValidDecimal2(rawValue)
    ) {
      return; // reject the keystroke, don't update state
    }

    // Update whatever is currently displayed (could be the full category
    // list, or just a filtered search subset) so the input reflects the
    // change immediately.
    setRows((prev) =>
      prev.map((row) => (row._id === _id ? applyFieldLogic(row, field, rawValue) : row))
    );

    // IMPORTANT: merge the edit into the FULL master list for this category
    // in rowsMap, rather than overwriting rowsMap[activeTab].rows with
    // whatever `rows` currently holds. While a search is active, `rows` is
    // only the narrow filtered subset (fetchSearchItems never touches
    // rowsMap) — overwriting the master list with that subset would silently
    // drop every other item in the category, so only the last-searched item
    // would survive into the save payload.
    setRowsMap((m) => {
      const master = m[activeTab]?.rows || [];
      const idx = master.findIndex((row) => row._id === _id);
      let updatedMaster;
      if (idx !== -1) {
        updatedMaster = master.map((row, i) =>
          i === idx ? applyFieldLogic(row, field, rawValue) : row
        );
      } else {
        // Item isn't in the master list yet (e.g. edited straight from a
        // search result before the full list was ever loaded) — add it.
        const fromRows = rows.find((row) => row._id === _id);
        updatedMaster = fromRows
          ? [...master, applyFieldLogic(fromRows, field, rawValue)]
          : master;
      }
      return {
        ...m,
        [activeTab]: { ...m[activeTab], rows: updatedMaster },
      };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const snapshot = {
        ...rowsMap,
        [activeTab]: { ...rowsMap[activeTab], rows },
      };

      const allRows = Object.values(snapshot).flatMap((v) => v.rows ?? []);

      const changedItems = allRows
        .filter((r) => Number(r.storeQty) !== Number(r.closingStock))
        .map((r) => ({
          rawMaterialId: r.rawMaterialId,
          rawCatId: Number(r.catId) || 0,
          unitId: Number(r.unitId) || 0,
          storeQty: round2(r.storeQty) || 0,
          increaseQty: round2(r.increaseQty) || 0,
          wastageQty: round2(r.wastageQty) || 0,
          closingStock: Number(r.closingStock) || 0,
          remarks: r.remarks || "",
        }));

      if (changedItems.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Changes",
          text: "No items were modified.",
          confirmButtonColor: "#005BA8",
        });
        return;
      }

      const formatDate = (iso) => {
        const [y, m, d] = iso.split("-");
        return `${d}/${m}/${y}`;
      };

      const payload = {
        manageDate: formatDate(manageDate),
        userId: Number(userId) || 0,
         stockTypeId: Number(storeTypeId) || null,
        items: changedItems,
      };
console.log("storeTypeId:", storeTypeId);
      const res = await AddDailyStockManage(payload);
      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: res.data.msg || "Daily stock saved successfully.",
          confirmButtonColor: "#16a34a",
        }).then(() => navigate(-1));
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.data.msg || "Failed to save.",
          confirmButtonColor: "#dc2626",
        });
      }
    } catch (e) {
      console.error(e);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save. Please try again.",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRows = rows;

  const activeTabName = tabs.find((t) => t.id === activeTab)?.nameEnglish ?? "";
  const tabStore = rows.reduce((s, r) => s + (Number(r.storeQty) || 0), 0);
  const tabIncrease = rows.reduce((s, r) => s + (Number(r.increaseQty) || 0), 0);
  const tabWastage = rows.reduce((s, r) => s + (Number(r.wastageQty) || 0), 0);

  // ── Loading spinner while fetching view data ──
  if (isViewMode && viewLoading) {
    return (
      <Fragment>
        <Container>
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 text-gray-500 text-sm">
              <Spin size="large" />
              <span>Loading stock record…</span>
            </div>
          </div>
        </Container>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Container>
        <div className="bg-white border rounded-xl shadow-sm mb-4 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4">
            {/* Title */}
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-gray-900">
                {isViewMode ? "View Physical Stock" : "Physical Stock"}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {isViewMode
                  ? `Voucher: ${viewData?.voucherNo || "—"} | Read-only view of recorded stock.`
                  : "Record today's store quantities, increases, wastage and closing stock."}
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Manage Date</label>
              <input
                type="date"
                value={manageDate}
                max={todayISO()}
                readOnly={isViewMode}
                onChange={(e) => setManageDate(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition"
              />
            </div>
          <div className="flex flex-col gap-1">
  <label className="text-xs text-gray-500 font-medium">Stock Type</label>
{isViewMode ? (
  <div className="border border-gray-100 bg-gray-50 rounded-xl px-3 py-2 text-sm text-gray-600 select-none">
    {viewData?.stockTypeName || "—"}
  </div>
) : (
 <select
  value={storeTypeId}
  onChange={(e) => setStoreTypeId(e.target.value)}
>
  <option value="">Select Stock Type</option>

  {storeTypes.map((st) => (
    <option key={st.id} value={st.id}>
      {st.nameEnglish}
    </option>
  ))}
</select>
)}
</div>
            <div className="flex items-center gap-3 flex-wrap">
              {!isViewMode && (
                <div className="flex items-end gap-2 pb-0.5">
                  <button
                    onClick={() => navigate(-1)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving || itemsLoading}
                    className="px-4 py-2 bg-[#005BA8] hover:bg-[#004a8c] disabled:opacity-60 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors"
                  >
                    {isSaving ? <Spin size="small" /> : <Save size={16} />}
                    Save Physical Stock
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Sticky: Category Tabs + Search row ── */}
        <div className="sticky top-16 z-10 bg-gray-100 -mx-4 px-4 pt-2 pb-3 space-y-2">
          {tabsLoading ? (
            <div className="flex items-center gap-2">
              <Spin size="small" />
              <span className="text-sm text-gray-500">Loading categories…</span>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-[#005BA8] text-white shadow-sm"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-[#005BA8] hover:text-[#005BA8]"
                  }`}
                >
                  {tab.nameEnglish}
                  {(categoryTotals[tab.id] !== undefined || rowsMap[tab.id]) && (
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                        activeTab === tab.id
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {categoryTotals[tab.id] ?? rowsMap[tab.id].rows.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Search + Tab label (hidden in view mode) */}
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              {activeTabName}
              <span className="ml-2 text-xs font-normal text-gray-400">
                ({categoryTotals[activeTab] ?? rows.length} items)
              </span>
            </p>
            {!isViewMode && (
              <div className="relative w-full max-w-sm">
                <i className="ki-filled ki-magnifier absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search item name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Items Table ── */}
        <div className="bg-white border rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                {[
                  "#",
                  "Item Name",
                  "Unit",
                  "Actual Stock",
                  " Physical Stock Qty",
                  "Manage Qty",
                  "Wastage/Damage Qty",
                  "Remarks",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-left"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredRows.length === 0 && !itemsLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400 text-sm">
                    No items found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row, idx) => (
                  <tr key={row._id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-3 py-2.5 text-center text-gray-400 font-medium text-xs">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-gray-800 text-sm">
                      {row.rawMaterialName}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 font-medium">
                      {row.unitName}
                    </td>
                    {/* Actual Stock (closingStock) */}
                    <td className="px-3 py-2.5">
                      <div className="w-full border border-gray-100 bg-gray-50 rounded-lg px-2.5 py-1.5 text-sm font-medium text-right text-gray-500 select-none">
                        {row.closingStock}
                      </div>
                    </td>
                    {/* Physical Stock Qty */}
                    <td className="px-3 py-2.5">
                      {isViewMode ? (
                        <div className="w-full border border-gray-100 bg-gray-50 rounded-lg px-2.5 py-1.5 text-sm font-medium text-right text-gray-600 select-none">
                          {row.storeQty}
                        </div>
                      ) : (
                        <input
                          type="tel"
                          min={0}
                          step="0.01"
                          value={row.storeQty}
                          onChange={(e) => handleChange(row._id, "storeQty", e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition text-right text-gray-700"
                        />
                      )}
                    </td>
                    {/* Manage Qty (increaseQty) — max 2 decimal places */}
                    <td className="px-3 py-2.5">
                      {isViewMode ? (
                        <div className="w-full border border-green-100 bg-green-50 rounded-lg px-2.5 py-1.5 text-sm font-medium text-right text-green-700 select-none">
                          {row.increaseQty}
                        </div>
                      ) : (
                        <input
                          type="tel"
                          min={0}
                          step="0.01"
                          value={row.increaseQty}
                          onChange={(e) => handleChange(row._id, "increaseQty", e.target.value)}
                          className="w-full border border-green-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition text-right text-green-700"
                        />
                      )}
                    </td>
                    {/* Wastage Qty — max 2 decimal places */}
                    <td className="px-3 py-2.5">
                      {isViewMode ? (
                        <div className="w-full border border-red-100 bg-red-50 rounded-lg px-2.5 py-1.5 text-sm font-medium text-right text-red-600 select-none">
                          {row.wastageQty}
                        </div>
                      ) : (
                        <input
                          type="tel"
                          min={0}
                          step="0.01"
                          value={row.wastageQty}
                          onChange={(e) => handleChange(row._id, "wastageQty", e.target.value)}
                          className="w-full border border-red-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition text-right text-red-600"
                        />
                      )}
                    </td>
                    {/* Remarks */}
                    <td className="px-3 py-2.5">
                      {isViewMode ? (
                        <div className="w-full min-w-[140px] border border-gray-100 bg-gray-50 rounded-lg px-2.5 py-1.5 text-sm text-gray-600 select-none truncate">
                          {row.remarks || "—"}
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder="Optional remark…"
                          value={row.remarks}
                          onChange={(e) => handleChange(row._id, "remarks", e.target.value)}
                          className="w-full min-w-[140px] border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition text-gray-700"
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {/* Tab totals */}
            {rows.length > 0 && (
              <tfoot>
                <tr className="border-t bg-gray-50">
                  <td colSpan={3} className="px-3 py-3 text-xs font-semibold text-gray-500 uppercase">
                    Tab Total
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-bold text-gray-800">
                    {/* Total closing stock — not relevant as a "total", showing as dash */}
                    —
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-bold text-gray-800">
                    {round2(tabStore)}
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-bold text-green-700">
                    {round2(tabIncrease)}
                  </td>
                  <td className="px-3 py-3 text-right text-sm font-bold text-red-600">
                    {round2(tabWastage)}
                  </td>
                  <td className="px-3 py-3"></td>
                </tr>
              </tfoot>
            )}
          </table>

          {/* ── Infinite scroll sentinel (add mode only) ── */}
          <div ref={sentinelRef} className="py-3 flex justify-center">
            {itemsLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Spin size="small" />
                <span>Loading more items…</span>
              </div>
            )}
            {!hasMore && rows.length > 0 && !itemsLoading && (
              <p className="text-xs text-gray-400">All {rows.length} items loaded</p>
            )}
          </div>
        </div>

        {/* ── Bottom save bar (add mode only) ── */}
        {!isViewMode && (
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || itemsLoading}
              className="px-5 py-2.5 bg-[#005BA8] hover:bg-[#004a8c] disabled:opacity-60 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              {isSaving ? <Spin size="small" /> : <Save size={16} />}
              Save Physical Stock
            </button>
          </div>
        )}
      </Container>
    </Fragment>
  );
};

export default AddDailyStock;



