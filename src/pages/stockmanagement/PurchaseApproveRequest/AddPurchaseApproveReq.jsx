import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { FormattedMessage } from "react-intl";
import {
  ArrowLeft,
  Save,
  FileText,
  Hash,
  Calendar,
  Tag,
  AlignLeft,
  Trash2,
  ShoppingCart,
  Search,
} from "lucide-react";
import { DatePicker, Select, Spin } from "antd";
import dayjs from "dayjs";
import { TableComponent } from "../../../components/table/TableComponent";
import {
  GetAllRawMaterialcategory,
  generatePurchaseRequestCode,
  getRawMaterialbyPurchaseRequestId,
  getpurchaseapprovalbyid,
  addUpdatePurchaseRequest,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { useNavigate, useLocation } from "react-router";

const UNIT_OPTIONS = ["kg", "g", "L", "ml", "pcs"];
const STATUS_OPTIONS_DEFAULT = ["PENDING"];
const STATUS_OPTIONS_APPROVE = ["PENDING", "APPROVED"];

const CATEGORY_SEARCH_DEBOUNCE_MS = 400;
const ITEM_NAME_SEARCH_DEBOUNCE_MS = 400;
const CATEGORY_TYPE_ID = 0; // TODO: confirm real categoryTypeId if this should be scoped (e.g. Food Category = 1)
const CATEGORY_IS_ACTIVE = true;

const ITEMS_PAGE_SIZE = 10;
const DISPLAY_DATE_FORMAT = "DD/MM/YYYY";
const API_DATE_FORMAT = "YYYY-MM-DD"; // TODO: confirm the backend's expected date format
const NEW_REQUEST_ID = -1; // sent as `id` for a request that hasn't been saved yet

// TODO: confirm real unit IDs from your raw-material-unit master and replace this map
const UNIT_ID_BY_NAME = { kg: 1, g: 2, L: 3, ml: 4, pcs: 5 };

const AddPurchaseApproveReq = () => {
  // userId lives in localStorage (Zustand auth state supplements it there per project convention)
  const userId = localStorage.getItem("userId");
  const mainId = localStorage.getItem("mainId");

  // ── Header fields ────────────────────────────────────────────────────────
  const [requestCode, setRequestCode] = useState("");
  const [requestCodeLoading, setRequestCodeLoading] = useState(false);
  // Default both to today so the filters are "ready" as soon as a category is picked
  const [startDate, setStartDate] = useState(() => dayjs());
  const [endDate, setEndDate] = useState(() => dayjs());
  const [status, setStatus] = useState("PENDING");
  const [remarks, setRemarks] = useState("");

  // ── Category dropdown: search ────────────────────────────────────────────
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null); // category id, or null = all
  const categorySearchDebounceRef = useRef(null);
  const categoryRequestIdRef = useRef(0);

  // ── Line items — accumulated across every page visited, keyed by rawMaterialId ──
  const [itemsById, setItemsById] = useState({});
  const [touchedIds, setTouchedIds] = useState(() => new Set());
  const [currentPageIds, setCurrentPageIds] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemNameSearch, setItemNameSearch] = useState(""); // free-text search, sent to the same API
  const itemNameSearchDebounceRef = useRef(null);
  // 1-based for display/UI; converted to the API's 0-based pageNumber at call time
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsTotalPages, setItemsTotalPages] = useState(0);
  const [itemsTotalElements, setItemsTotalElements] = useState(0);
  const itemsRequestIdRef = useRef(0);

  // Derived view of the current page, built from the accumulated map
  const items = useMemo(
    () => currentPageIds.map((id) => itemsById[id]).filter(Boolean),
    [currentPageIds, itemsById]
  );

  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode; // "approve" | "edit" | undefined
  const isApproveMode = mode === "approve";
  const isEditMode = mode === "edit";
  const isExistingRequest = isApproveMode || isEditMode;
  const existingRequestId = location.state?.requestId ?? null;

  // ── Whole-request identity (for the save/update payload) ────────────────
  const [requestId, setRequestId] = useState(
    isExistingRequest ? existingRequestId : NEW_REQUEST_ID
  );
  const [approvedBy, setApprovedBy] = useState(0); // TODO: default from logged-in user context if you track one
  const [requestLoading, setRequestLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Request code ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (isApproveMode) return; // approving an existing request — code already assigned

    let isCurrent = true;
    setRequestCodeLoading(true);

    generatePurchaseRequestCode(mainId)
      .then((res) => {
        if (!isCurrent) return;
        const code = res?.data?.data ?? res?.data ?? res;
        if (typeof code === "string") setRequestCode(code);
      })
      .catch((err) => {
        console.error("Failed to generate purchase request code:", err);
      })
      .finally(() => {
        if (isCurrent) setRequestCodeLoading(false);
      });

    return () => {
      isCurrent = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainId, isApproveMode]);

      // ── Category dropdown ────────────────────────────────────────────────────
  const fetchCategories = useCallback(
    async (search) => {
      const requestId = ++categoryRequestIdRef.current;
      setCategoryLoading(true);

      // Add & Edit → isAllData: true (full category list)
      // Approve    → isAllData: false (scoped to this request)
      const isAllData = !isApproveMode;

      // Add   → no request exists yet, so pass empty
      // Edit  → pass the request being edited
      // Approve → pass the request being approved
      const purchaseRequestId = isExistingRequest ? existingRequestId : "";

      try {
        const res = await GetAllRawMaterialcategory(
          CATEGORY_TYPE_ID,
          userId,
          CATEGORY_IS_ACTIVE,
          search,
          isAllData,
          purchaseRequestId
        );

        if (requestId !== categoryRequestIdRef.current) return;

        const responseData = res?.data?.data ?? res?.data ?? res;
        const list = responseData?.["Raw Material Category Details"] ?? [];

        setCategoryOptions(list);
      } catch (err) {
        console.error("Failed to load categories:", err);
        setCategoryOptions([]);
      } finally {
        if (requestId === categoryRequestIdRef.current) {
          setCategoryLoading(false);
        }
      }
    },
    [userId, isApproveMode, isExistingRequest, existingRequestId]
  );

  // Initial load
  useEffect(() => {
    fetchCategories("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);



  const handleCategorySearch = (value) => {
    setCategorySearch(value);
    if (categorySearchDebounceRef.current) clearTimeout(categorySearchDebounceRef.current);
    categorySearchDebounceRef.current = setTimeout(() => {
      fetchCategories(value);
    }, CATEGORY_SEARCH_DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (categorySearchDebounceRef.current) clearTimeout(categorySearchDebounceRef.current);
    };
  }, []);

  const flattenUnitHierarchy = (node) => {
    if (!node) return [];
    const { children, ...unit } = node;
    const flat = [unit];
    if (Array.isArray(children)) {
      children.forEach((child) => {
        flat.push(...flattenUnitHierarchy(child));
      });
    }
    return flat;
  };

  const mapRawMaterialRow = (r) => {
    // requestUnitHierarchy is the "real" source when present; sysUnitHierarchy
    // is what your sample responses actually populate, so fall back to it.
    const storeHierarchySource = r.requestUnitHierarchy ?? r.sysUnitHierarchy ?? null;
    const storeUnitOptionsFlat = flattenUnitHierarchy(storeHierarchySource);
    const storeUnitOptions = storeUnitOptionsFlat.length > 1 ? storeUnitOptionsFlat : null;

    const matchedStoreUnit = storeUnitOptionsFlat.find(
      (u) => u.unitId === r.requestQtyUnitId || u.nameEnglish === r.requestQtyUnitName
    );
    const storeUnitId = matchedStoreUnit ? matchedStoreUnit.unitId : r.requestQtyUnitId ?? null;
    const storeUnit = matchedStoreUnit ? matchedStoreUnit.nameEnglish : r.requestQtyUnitName ?? "";

    const approvedHierarchySource = r.approvedUnitHierarchy ?? r.sysUnitHierarchy ?? null;
    const approvedUnitOptionsFlat = flattenUnitHierarchy(approvedHierarchySource);
    const approvedUnitOptions = approvedUnitOptionsFlat.length > 1 ? approvedUnitOptionsFlat : null;

    const fallbackApprovedId = r.approvedQtyUnitId ?? r.requestQtyUnitId;
    const fallbackApprovedName = r.approvedQtyUnitName ?? r.requestQtyUnitName;
    const matchedApprovedUnit = approvedUnitOptionsFlat.find(
      (u) => u.unitId === fallbackApprovedId || u.nameEnglish === fallbackApprovedName
    );
    const approvedUnitId = matchedApprovedUnit ? matchedApprovedUnit.unitId : fallbackApprovedId ?? null;
    const approvedUnit = matchedApprovedUnit ? matchedApprovedUnit.nameEnglish : fallbackApprovedName ?? "";

    return {
      id: r.rawMaterialId,
      detailId: r.id ?? 0,
      itemName: r.rawMaterialName,
      avgDailyCons: r.avgDailyCons ?? 0,
      unit: r.requestQtyUnitName ?? "",
      leadTime: r.leadTime ?? 0,
      minQty: r.minQty ?? 0,
      maxQty: r.maxQty ?? 0,
      todaysStock: r.todaysStock ?? 0,
      reqQtySys: r.sysReqQty ?? 0,
      unitSys: r.sysUnit ?? "",
      reqQtyToStore: r.requestQty != null ? String(r.requestQty) : "",
      storeUnit,
      storeUnitId,
      storeUnitOptions, // null → no hierarchy, plain label; array → dropdown
      approvedQty: r.approvedQty ?? "",
      approvedUnit,
      approvedUnitId,
      approvedUnitOptions,
    };
  };

    const fetchRawMaterialItems = useCallback(
    async (pageNo) => {
      // pageNo is 1-based (UI page number)
      if (!startDate || !endDate || !selectedCategory) return;

      const requestId = ++itemsRequestIdRef.current;
      setItemsLoading(true);

      // Add & Edit → isAllData: true (full item list for the date/category range)
      // Approve    → isAllData: false (scoped to this request)
      const isAllData = !isApproveMode;

      // Add   → no request exists yet, so pass empty
      // Edit  → pass the request being edited
      // Approve → pass the request being approved
      const purchaseRequestId = isExistingRequest ? existingRequestId : "";

      try {
        const res = await getRawMaterialbyPurchaseRequestId(
          endDate.format(DISPLAY_DATE_FORMAT), // API expects DD/MM/YYYY
          selectedCategory,
          startDate.format(DISPLAY_DATE_FORMAT), // API expects DD/MM/YYYY
          pageNo - 1, // convert to the API's 0-based pageNumber
          ITEMS_PAGE_SIZE,
          itemNameSearch, // TODO: confirm this is the correct param name/position for your API
          purchaseRequestId,
          isAllData
        );

        if (requestId !== itemsRequestIdRef.current) return;

        const responseData = res?.data?.data ?? res?.data ?? res;
        const list = responseData?.content ?? [];
        const mapped = list.map(mapRawMaterialRow);

        // Merge into the accumulated map — keep any qty/unit the user already
        // typed for a row if they'd visited it on a previous page.
        setItemsById((prev) => {
          const next = { ...prev };
          mapped.forEach((row) => {
            const existing = next[row.id];
            next[row.id] = existing
              ? {
                  ...row,
                  reqQtyToStore: existing.reqQtyToStore,
                  storeUnit: existing.storeUnit,
                  approvedQty: existing.approvedQty,
                  approvedUnit: existing.approvedUnit,
                }
              : row;
          });
          return next;
        });
        setCurrentPageIds(mapped.map((row) => row.id));
        setItemsTotalPages(responseData?.totalPages ?? 0);
        setItemsTotalElements(responseData?.totalElements ?? 0);
        setItemsPage(pageNo);
      } catch (err) {
        console.error("Failed to load raw materials for request:", err);
        setCurrentPageIds([]);
        setItemsTotalPages(0);
        setItemsTotalElements(0);
      } finally {
        if (requestId === itemsRequestIdRef.current) {
          setItemsLoading(false);
        }
      }
    },
    [startDate, endDate, selectedCategory, itemNameSearch, isApproveMode, isExistingRequest, existingRequestId]
  );

  useEffect(() => {
    if (!(startDate && endDate && selectedCategory)) {
      if (!isExistingRequest) {
        setCurrentPageIds([]);
        setItemsPage(1);
        setItemsTotalPages(0);
        setItemsTotalElements(0);
      }
      return;
    }

    if (itemNameSearchDebounceRef.current) clearTimeout(itemNameSearchDebounceRef.current);
    itemNameSearchDebounceRef.current = setTimeout(() => {
      fetchRawMaterialItems(1);
    }, ITEM_NAME_SEARCH_DEBOUNCE_MS);

    return () => {
      if (itemNameSearchDebounceRef.current) clearTimeout(itemNameSearchDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, selectedCategory, itemNameSearch]);

  const handleItemsPageChange = (nextPage) => {
    fetchRawMaterialItems(nextPage);
  };


  useEffect(() => {
    if (!isExistingRequest || !existingRequestId) return;

    let isCurrent = true;
    setRequestLoading(true);

    getpurchaseapprovalbyid(existingRequestId)
      .then((res) => {
        if (!isCurrent) return;
        const data = res?.data?.data ?? res?.data ?? res;

        setRequestId(data?.id ?? existingRequestId);
        setRequestCode(data?.requestCode ?? "");
        setStartDate(data?.startDate ? dayjs(data.startDate, DISPLAY_DATE_FORMAT) : null);
        setEndDate(data?.endDate ? dayjs(data.endDate, DISPLAY_DATE_FORMAT) : null);
        setStatus(data?.status ?? "PENDING");
        setRemarks(data?.remarks ?? "");
        setApprovedBy(data?.approvedBy ?? 0);

        const details = data?.requestDetails ?? [];
        // Reuse mapRawMaterialRow — requestDetails rows have the same shape
        // (unit hierarchies, requestQty/approvedQty, etc.) as the raw-material
        // list endpoint, so this correctly resolves storeUnitId/approvedUnitId
        // and the dropdown options instead of dropping them.
        const mappedDetails = details.map(mapRawMaterialRow);

        setItemsById(Object.fromEntries(mappedDetails.map((row) => [row.id, row])));
        setCurrentPageIds(mappedDetails.map((row) => row.id));
        // Pre-existing detail rows are already "in" the request — they should
        // be included in the save payload even if the user doesn't retouch them.
        setTouchedIds(new Set(mappedDetails.map((row) => row.id)));
      })
      .catch((err) => {
        console.error("Failed to load purchase request:", err);
      })
      .finally(() => {
        if (isCurrent) setRequestLoading(false);
      });

    return () => {
      isCurrent = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExistingRequest, existingRequestId]);
const handleRowChange = (id, field, value) => {
  setItemsById((prev) => ({
    ...prev,
    [id]: { ...prev[id], [field]: value },
  }));
  setTouchedIds((prev) => {
    const next = new Set(prev);
    next.add(id);
    return next;
  });

  // If the user was searching by item name and just entered a qty
  // (i.e. "selected" that item), clear the search box so the list
  // resets back to showing everything again.
  if (field === "reqQtyToStore" && itemNameSearch) {
    setItemNameSearch("");
  }
};

  const handleUnitChange = (id, kind, selectedUnitId, options) => {
    const selected = options.find((u) => String(u.unitId) === String(selectedUnitId));
    if (!selected) return;
    setItemsById((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [`${kind}UnitId`]: selected.unitId,
        [`${kind}Unit`]: selected.nameEnglish,
      },
    }));
    setTouchedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const handleRemoveRow = (id) => {
    setItemsById((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setCurrentPageIds((prev) => prev.filter((rowId) => rowId !== id));
  };

  const buildRequestPayload = () => ({
    id: requestId,
    requestCode,
    startDate: startDate ? startDate.format(DISPLAY_DATE_FORMAT) : "",
    endDate: endDate ? endDate.format(DISPLAY_DATE_FORMAT) : "",
    status,
    remarks,
    approvedBy: Number(mainId) || 0,
    userId: Number(mainId) || 0,
   requestDetails: Object.values(itemsById)
  .filter((item) => touchedIds.has(item.id) && Number(item.reqQtyToStore) > 0)
  .map((item) => ({
    id: item.detailId ?? -1,
    rawMaterialId: item.id,
    requestQty: Number(item.reqQtyToStore) || 0,
    requestQtyUnitId: item.storeUnitId ?? 0,
    approvedQty: Number(item.approvedQty) || 0,
    approvedQtyUnitId: item.approvedUnitId ?? 0,
  })),
  });

  const handleSave = async () => {
  const payload = buildRequestPayload();
  try {
    setSaving(true);
    const res = await addUpdatePurchaseRequest(payload);
    const data = res?.data?.data ?? res?.data ?? res;
    const responseMsg = res?.data?.msg ?? res?.msg ?? "Purchase request raised successfully.";
    const isSuccess = res?.data?.success ?? res?.success ?? true;

    if (data?.id != null) setRequestId(data.id);
    if (data?.requestCode) setRequestCode(data.requestCode);

    Swal.fire({
      icon: isSuccess ? "success" : "error",
      title: isSuccess ? "Saved" : "Save failed",
      text: responseMsg,
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (err) {
    console.error("Failed to save purchase request:", err);
    const errorMsg = err?.response?.data?.msg ?? err?.message ?? "Something went wrong.";
    Swal.fire({
      icon: "error",
      title: "Save failed",
      text: errorMsg,
    });
  } finally {
    setSaving(false);
  }
};

const handleSaveRequest = async () => {
  const payload = buildRequestPayload();
  try {
    setSaving(true);
    const res = await addUpdatePurchaseRequest(payload);
    const responseMsg = res?.data?.msg ?? res?.msg ?? "Purchase request raised successfully.";
    const isSuccess = res?.data?.success ?? res?.success ?? true;

    await Swal.fire({
      icon: isSuccess ? "success" : "error",
      title: isSuccess ? "Saved" : "Save failed",
      text: responseMsg,
      timer: 2000,
      showConfirmButton: false,
    });

    if (isSuccess) navigate(-1); // only leave the page on actual success
  } catch (err) {
    console.error("Failed to save purchase request:", err);
    const errorMsg = err?.response?.data?.msg ?? err?.message ?? "Something went wrong.";
    Swal.fire({
      icon: "error",
      title: "Save failed",
      text: errorMsg,
    });
  } finally {
    setSaving(false);
  }
};

  // ── Table columns (TanStack-shaped, consumed by DataGrid) ───────────────
 const columns = useMemo(
  () => [
    {
      id: "srNo",
      header: "Sr. No.",
      cell: ({ row }) => (
        <span className="text-xs text-slate-400 font-medium">{row.index + 1}</span>
      ),
    },
    {
      id: "itemName",
      accessorKey: "itemName",
      header: "Item Name",
      cell: ({ getValue }) => (
        <span className="font-semibold text-slate-800 text-sm">{getValue()}</span>
      ),
    },
    {
      id: "avgDailyCons",
      header: "Avg Daily Cons.",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 font-medium">
          {row.original.avgDailyCons.toFixed(2)} {row.original.unit}
        </span>
      ),
    },
    {
      id: "leadTime",
      accessorKey: "leadTime",
      header: "Lead Time (Days)",
    },
    {
      id: "minQty",
      accessorKey: "minQty",
      header: "Min Qty",
    },
    {
      id: "maxQty",
      accessorKey: "maxQty",
      header: "Max Qty",
    },
    {
      id: "todaysStock",
      accessorKey: "todaysStock",
      header: "Today's Stock",
      cell: ({ getValue }) => (
        <span className="text-xs text-slate-500 font-medium">{getValue().toFixed(2)}</span>
      ),
    },
    {
      id: "reqQtySys",
      header: "Req Qty (SYS)",
      cell: ({ row }) => (
        <span className="text-xs text-slate-500 font-medium">
          {row.original.reqQtySys.toFixed(2)} {row.original.unitSys}
        </span>
      ),
    },
      {
  id: "reqQtyToStore",
  accessorKey: "reqQtyToStore",
  header: "Req Qty to Store",
  cell: ({ row, getValue }) => {
    const value = getValue();
    const isEmpty = !value;
    const { storeUnit, storeUnitId, storeUnitOptions } = row.original;
    const hasHierarchy = Array.isArray(storeUnitOptions) && storeUnitOptions.length > 0;

    // In approve mode, this field is read-only — only Approved Qty is editable
    if (isApproveMode) {
      return (
        <div className="flex items-center h-11 border rounded-lg overflow-hidden border-gray-200 bg-slate-50">
          <span className="w-20 h-full px-3 flex items-center text-gray-600">
            {value || "0"}
          </span>
          <span className="h-full flex items-center px-2 border-l border-gray-200 bg-slate-100 text-xs font-medium text-gray-500 whitespace-nowrap">
            {storeUnit}
          </span>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center h-11 border rounded-lg overflow-hidden transition-colors ${
          isEmpty ? "border-amber-300 bg-amber-50" : "border-gray-300 bg-white"
        }`}
      >
        <input
          type="tel"
          value={value}
          onChange={(e) =>
            handleRowChange(row.original.id, "reqQtyToStore", e.target.value)
          }
          placeholder="0"
          className={`w-20 h-full px-3 outline-none border-none bg-transparent ${
            isEmpty ? "text-amber-700 placeholder-amber-400" : "text-gray-800"
          }`}
        />
        {hasHierarchy ? (
          <select
            value={storeUnitId ?? ""}
            onChange={(e) =>
              handleUnitChange(row.original.id, "store", e.target.value, storeUnitOptions)
            }
            className={`h-full px-2 outline-none border-none border-l cursor-pointer ${
              isEmpty
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-gray-200 bg-white text-gray-500"
            }`}
          >
            {storeUnitOptions.map((u) => (
              <option key={u.unitId} value={u.unitId}>
                {u.nameEnglish}
              </option>
            ))}
          </select>
        ) : (
          <span
            className={`h-full flex items-center px-2 border-l text-xs font-medium whitespace-nowrap ${
              isEmpty
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-gray-200 bg-slate-50 text-gray-500"
            }`}
          >
            {storeUnit}
          </span>
        )}
      </div>
    );
  },
},
      ...(isApproveMode
        ? [
            {
              id: "approvedQty",
              header: "Approved Qty",
              cell: ({ row }) => {
                const { approvedQty, approvedUnit, approvedUnitId, approvedUnitOptions } =
                  row.original;
                const isEmpty = !approvedQty;
                const hasHierarchy =
                  Array.isArray(approvedUnitOptions) && approvedUnitOptions.length > 0;

                return (
                  <div
                    className={`flex items-center h-11 border rounded-lg overflow-hidden transition-colors ${
                      isEmpty ? "border-blue-300 bg-blue-50" : "border-gray-300 bg-white"
                    }`}
                  >
                    <input
                      type="tel"
                      value={approvedQty ?? ""}
                      onChange={(e) =>
                        handleRowChange(row.original.id, "approvedQty", e.target.value)
                      }
                      placeholder="0"
                      className={`w-20 h-full px-3 outline-none border-none bg-transparent ${
                        isEmpty ? "text-blue-700 placeholder-blue-400" : "text-gray-800"
                      }`}
                    />
                    {hasHierarchy ? (
                      <select
                        value={approvedUnitId ?? ""}
                        onChange={(e) =>
                          handleUnitChange(
                            row.original.id,
                            "approved",
                            e.target.value,
                            approvedUnitOptions
                          )
                        }
                        className={`h-full px-2 outline-none border-none border-l cursor-pointer ${
                          isEmpty
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-500"
                        }`}
                      >
                        {approvedUnitOptions.map((u) => (
                          <option key={u.unitId} value={u.unitId}>
                            {u.nameEnglish}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`h-full flex items-center px-2 border-l text-xs font-medium whitespace-nowrap ${
                          isEmpty
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-slate-50 text-gray-500"
                        }`}
                      >
                        {approvedUnit}
                      </span>
                    )}
                  </div>
                );
              },
            },
          ]
        : []),
      // {
      //   id: "actions",
      //   header: "",
      //   cell: ({ row }) => (
      //     <button
      //       onClick={() => handleRemoveRow(row.original.id)}
      //       className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all"
      //     >
      //       <Trash2 size={13} className="text-red-500" />
      //     </button>
      //   ),
      // },
    ],
    [isApproveMode] // handleRowChange/handleRemoveRow update state functionally, so only isApproveMode matters
  );

  const fieldClass =
    "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";
  const labelClass =
    "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

  const filtersReady = isExistingRequest || Boolean(startDate && endDate && selectedCategory);
  const isLoadingItems = itemsLoading || requestLoading;

  return (
    <div className="min-h-screen w-full overflow-x-hidden px-6 font-sans">
      <div className="mx-auto space-y-5">
        {/* ── Request Information Card ── */}
        <div className="min-w-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-visible">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-700">
                <FileText size={17} className="text-white" />
              </div>
              <div>
                <h2 className="text-green-900 font-bold text-base tracking-tight">
                  <FormattedMessage
                    id="PURCHASE.APPROVAL_REQUEST.ADD_TITLE"
                    defaultMessage="Add Purchase Request"
                  />
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Create a purchase request based on current stock and system requirements.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors shadow-sm"
            >
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <label className={labelClass}>
                <Hash size={16} /> Request Code
              </label>
              <input
                disabled
                value={requestCodeLoading ? "Generating..." : requestCode}
                className={`${fieldClass} bg-slate-50 text-slate-400`}
              />
            </div>

            <div>
              <label className={labelClass}>
                <Calendar size={16} /> Start Date
              </label>
              <DatePicker
                className={fieldClass}
                style={{ height: "38px" }}
                format={DISPLAY_DATE_FORMAT}
                placeholder="Select date"
                value={startDate}
                onChange={(date) => setStartDate(date)}
              />
            </div>

            <div>
              <label className={labelClass}>
                <Calendar size={16} /> End Date
              </label>
              <DatePicker
                className={fieldClass}
                style={{ height: "38px" }}
                format={DISPLAY_DATE_FORMAT}
                placeholder="Select date"
                value={endDate}
                onChange={(date) => setEndDate(date)}
              />
            </div>

           <div>
  <label className={labelClass}>
    <Tag size={16} /> Status
  </label>
  <Select
    style={{ width: "100%", height: "38px" }}
    value={status}
    onChange={setStatus}
    options={(isApproveMode ? STATUS_OPTIONS_APPROVE : STATUS_OPTIONS_DEFAULT).map((s) => ({
      value: s,
      label: s,
    }))}
  />
</div>

            <div className="sm:col-span-2">
              <label className={labelClass}>
                <AlignLeft size={16} /> Remarks
              </label>
              <input
                className={fieldClass}
                type="text"
                placeholder="Enter remarks here..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Purchase Request Details Card ── */}
        <div className="min-w-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary">
                <ShoppingCart size={17} className="text-white" />
              </div>
              <h2 className="text-primary font-bold text-base tracking-tight">
                Purchase Request Details
              </h2>
              {items.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                  {itemsTotalElements} item{itemsTotalElements !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={itemNameSearch}
                  onChange={(e) => setItemNameSearch(e.target.value)}
                  placeholder="Search item name"
                  className="pl-8 pr-3 h-[38px] w-56 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>

              <Select
                style={{ width: 220, minHeight: 38 }}
                placeholder="Filter by category"
                value={selectedCategory}
                onChange={setSelectedCategory}
                allowClear
                showSearch
                filterOption={false}
                onSearch={handleCategorySearch}
                loading={categoryLoading}
                notFoundContent={categoryLoading ? <Spin size="small" /> : "No categories found"}
                options={categoryOptions.map((c) => ({
                  value: c.id,
                  label: c.nameEnglish,
                }))}
              />

              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 shadow-sm disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #16a34a, #15803d)",
                }}
              >
                <Save size={15} />
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* ── Table ── */}
          {!filtersReady ? (
            <div className="px-6 py-10 text-center text-sm text-slate-400">
              Please select a start date, end date, and raw material category to load items.
            </div>
          ) : isLoadingItems ? (
            <div className="px-6 py-16 flex flex-col items-center justify-center gap-3 text-sm text-slate-400">
              <Spin size="large" />
              <span>Loading raw materials...</span>
            </div>
          ) : items.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-slate-400">
              No raw materials found for the selected filters.
            </div>
          ) : (
            <>
              <TableComponent
                columns={columns}
                data={items}
                loading={itemsLoading}
                hidePagination
              />

              {/* TODO: wire these to TableComponent's actual pagination props/pattern
                  if it supports server-driven pagination natively — this is a plain
                  fallback pager built on itemsPage / itemsTotalPages (both 1-based). */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <span className="text-xs text-slate-400">
                  Page {itemsTotalPages === 0 ? 0 : itemsPage} of {itemsTotalPages}
                  {" · "}
                  {itemsTotalElements} total
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleItemsPageChange(itemsPage - 1)}
                    disabled={itemsLoading || itemsPage <= 1}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handleItemsPageChange(itemsPage + 1)}
                    disabled={itemsLoading || itemsPage >= itemsTotalPages}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Footer Actions ── */}
        <div className="flex justify-end gap-3 pb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 shadow-sm disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #005BA8, #003f73)" }}
          >
            {saving ? "Saving..." : "Save Purchase Request"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddPurchaseApproveReq;