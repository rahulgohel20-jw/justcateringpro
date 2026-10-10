  import {
    ArrowLeft,
    Plus,
    Save,
    X,
    Package,
    FileText,
    Hash,
    Calendar,
    User,
    Tag,
    AlignLeft,
    Trash2,
    ShoppingCart,
    Search,
    Activity,
    ChevronDown,
    ChevronUp,
  } from "lucide-react";
  import { Select, Switch } from "antd";
  import { Fragment, useEffect, useState, useRef, useCallback } from "react";
  import { FormattedMessage } from "react-intl";
  import {
    GetStockTypeByUserId,
    GetAllRawMaterial,
    getpartywitheventforstock,
    AddStorePO as AddStorePOApi,
    SearchRawMaterial,
    AddLogs,
    StatusStorePO,
    GetAllCrCodes,
    GetMaterialByCrcode,
    GetAllStorePOCode,
    GetByPoCode,
    addOrUpdateBatchWisestore,
    getAllRawMaterialByUserId,
  } from "@/services/apiServices";
  import { useLocation, useNavigate } from "react-router";
  import Swal from "sweetalert2";
  import AddContactName from "../../master/MenuItemMaster/components/AddContactName";
  import AddRawMaterial from "../../../partials/modals/add-raw-material/AddRawMaterial";
  import DatePicker from "react-datepicker";
  import { usePermission } from "../../../hooks/usePermission";
  import { useStockTypePermission } from "../../../hooks/useStockTypePermission";

  // ─────────────────────────────────────────────
  // Status options
  // ─────────────────────────────────────────────
  const STATUS_OPTIONS = [
    { value: "Pending", label: "Pending", color: "#f59e0b", bg: "#fef3c7" },
    { value: "Running", label: "Running", color: "#3b82f6", bg: "#dbeafe" },
    { value: "Completed", label: "Completed", color: "#10b981", bg: "#d1fae5" },
  ];

  // ── Inline Item Search Dropdown ─────────────────────────────────────────────
  const ItemSearchInput = ({
    menuItems,
    loadingItems,
    onSelect,
    existingItems,
  }) => {
    const [query, setQuery] = useState("");
    const [filtered, setFiltered] = useState([]);
    const [show, setShow] = useState(false);
    const [activeIdx, setActiveIdx] = useState(-1);
    const wrapRef = useRef(null);
    const listRef = useRef([]);

    useEffect(() => {
      if (!query.trim()) {
        setFiltered([]);
        setShow(false);
        return;
      }
      const q = query.toLowerCase();
      setFiltered(
        menuItems
          .filter((i) => i.nameEnglish?.toLowerCase().includes(q))
          .slice(0, 40),
      );
      setShow(true);
      setActiveIdx(-1);
    }, [query, menuItems]);

    useEffect(() => {
      if (activeIdx >= 0 && listRef.current[activeIdx])
        listRef.current[activeIdx].scrollIntoView({ block: "nearest" });
    }, [activeIdx]);

    useEffect(() => {
      const handler = (e) => {
        if (wrapRef.current && !wrapRef.current.contains(e.target))
          setShow(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelect = (item) => {
      onSelect(item);
      setQuery("");
      setShow(false);
      setActiveIdx(-1);
    };

    const handleKey = (e) => {
      if (!show || !filtered.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((p) => Math.min(p + 1, filtered.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((p) => Math.max(p - 1, -1));
      } else if (e.key === "Enter" && activeIdx >= 0)
        handleSelect(filtered[activeIdx]);
      else if (e.key === "Escape") setShow(false);
    };

    const isAlreadyAdded = (item) =>
      existingItems.some(
        (i) => i.rawMaterialId === (item.id || item.rawMaterialId),
      );

    return (
      <div ref={wrapRef} className="relative w-full max-w-md">
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            onFocus={() => query.trim() && setShow(true)}
            placeholder={loadingItems ? "Loading items…" : " Search & add item…"}
            disabled={loadingItems}
            className="w-full pl-9 pr-8 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
          />
          {loadingItems && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {query && !loadingItems && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setQuery("");
                setShow(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {show && (
          <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-sm text-slate-400 text-center">
                No items found
              </li>
            ) : (
              filtered.map((item, i) => {
                const added = isAlreadyAdded(item);
                return (
                  <li
                    key={item.id || i}
                    ref={(el) => (listRef.current[i] = el)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (!added) handleSelect(item);
                    }}
                    onMouseEnter={() => !added && setActiveIdx(i)}
                    className={`flex items-center justify-between px-4 py-2.5 border-b border-slate-50 last:border-0 transition-colors
                    ${added ? "opacity-50 cursor-not-allowed bg-slate-50" : activeIdx === i ? "bg-blue-600 cursor-pointer" : "hover:bg-blue-50 cursor-pointer"}`}
                  >
                    <div>
                      <span
                        className={`text-sm font-medium ${activeIdx === i && !added ? "text-white" : "text-slate-800"}`}
                      >
                        {item.nameEnglish}
                      </span>
                      {item.unit?.nameEnglish && (
                        <span
                          className={`ml-2 text-xs ${activeIdx === i && !added ? "text-blue-200" : "text-slate-400"}`}
                        >
                          · {item.unit.nameEnglish}
                        </span>
                      )}
                    </div>
                    {added ? (
                      <span className="text-xs text-slate-400 font-medium">
                        Already added
                      </span>
                    ) : (
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${activeIdx === i ? "bg-white/20 text-white" : "bg-blue-50 text-blue-600"}`}
                      >
                        + Add
                      </span>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────
  const getUserEmail = () => {
    try {
      const authStorage = localStorage.getItem("auth-storage");
      if (!authStorage) return "";
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.user?.email || "";
    } catch {
      return "";
    }
  };

  const getLogDescription = (status, form, items, isEdit, poId) => {
    const action = isEdit ? "Store Issue Updated" : "Store Issue Saved";
    const party = form.party_name || "-";
    const totalQty = items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0);
    const itemNamesPreview =
      items.length > 0
        ? items
            .slice(0, 5)
            .map((i) => `${i.item_name}(x${i.qty})`)
            .join(", ") + (items.length > 5 ? ` +${items.length - 5} more` : "")
        : "N/A";

    switch (status) {
      case "SAVE_SUCCESS":
        return (
          `${action} — PO Code: ${form.pocode || "N/A"} (ID: ${poId || 0}) | Party: ${party} | ` +
          `Status: ${form.status} | Items: ${items.length} | Total Qty: ${totalQty} | ` +
          `Details: ${itemNamesPreview} | Updated By: ${getUserEmail() || "Unknown User"}`
        );
      case "SAVE_ERROR":
        return (
          `${action} FAILED — PO Code: ${form.pocode || "N/A"} | Party: ${party} | ` +
          `Attempted By: ${getUserEmail() || "Unknown User"}`
        );
      default:
        return `${action} performed`;
    }
  };

  const getEventType = (status, isEdit) => {
    const prefix = isEdit ? "StoreIssue_Edit" : "StoreIssue_Add";
    return status === "SAVE_SUCCESS" ? `${prefix}_Success` : `${prefix}_Error`;
  };

  const sumRowsQty = (rows = []) => {
    const total = rows.reduce((s, r) => s + (parseFloat(r.qty) || 0), 0);
    return total > 0 ? String(Number(total.toFixed(3))) : "";
  };

  // ── Main Component ───────────────────────────────────────────────────────────
  const AddStorePO = () => {
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [supplier, setSupplier] = useState([]);
    const [stockTypes, setStockTypes] = useState([]);
    const [saving, setSaving] = useState(false);
    const [isBatchNoMode, setIsBatchNoMode] = useState(false);
    const [expandedItemIndex, setExpandedItemIndex] = useState(null);
    const [batchAddSelection, setBatchAddSelection] = useState({});

    // ── CR Code state ──────────────────────────
    const [crCodes, setCrCodes] = useState([]);
    const [loadingCR, setLoadingCR] = useState(false);
    const [selectedCrCode, setSelectedCrCode] = useState(null);
    const [loadingCRItems, setLoadingCRItems] = useState(false);
    const [selectedMainType, setSelectedMainType] = useState(null);

    // ── PO Code state ──────────────────────────
    const [poCodes, setPoCodes] = useState([]);
    const [loadingPO, setLoadingPO] = useState(false);
    const [selectedPoCode, setSelectedPoCode] = useState(null);
    const [loadingPOItems, setLoadingPOItems] = useState(false);

  const [allStockTypes, setAllStockTypes]     = useState([]);
  const [godownTypes, setGodownTypes]         = useState([]);
  const [kitchenTypes, setKitchenTypes]       = useState([]);

  const [selectedAllType, setSelectedAllType]         = useState(undefined);
  const [selectedGodownType, setSelectedGodownType]   = useState(undefined);
  const [selectedKitchenType, setSelectedKitchenType] = useState(undefined);

  const backDatePermission = usePermission("Lock Back Date Entry");
  const isBackDateLocked = backDatePermission.add || backDatePermission.edit;
  const { filterStockTypes } = useStockTypePermission();

  const todayStr = new Date().toISOString().split("T")[0];

    const TODAY = new Date();

    // ── Focus control refs ──────────────────────────────────────
  const searchSelectRef = useRef(null);
  const qtyInputRefs = useRef({});
  const [focusQtyIndex, setFocusQtyIndex] = useState(null);

  // New items are unshifted to index 0, so whenever focusQtyIndex
  // is set, focus that row's qty field right after it renders.
  useEffect(() => {
    if (focusQtyIndex === null) return;
    const el = qtyInputRefs.current[focusQtyIndex];
    if (el) {
      const t = setTimeout(() => {
        el.focus();
        el.select?.();
        setFocusQtyIndex(null); // ← reset so typing doesn't re-trigger select-all
      }, 0);
      return () => clearTimeout(t);
    } else {
      setFocusQtyIndex(null); // ← also reset if the ref wasn't ready yet
    }
  }, [items, focusQtyIndex]);

  const focusSearchInput = useCallback(() => {
    searchSelectRef.current?.focus?.();
  }, []);

    const [form, setForm] = useState({
      pocode: "",
      batch_no: "",
      date: TODAY,
      party_id: "",
      party_name: "",
      event_id:"",
      stock_type_id: "",
      invoice_type: "",
      remark: "",
      status: "Pending",
    });

    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");
    const BATCH_WISE_USER_ID = [233 , 376 , 3] ; //amoncar
const canUseBatchMode =  BATCH_WISE_USER_ID.find((id) => id === Number(userId));
    const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
    const isChildUser = authStorage?.state?.user?.ischilduser ?? false;
    const location = useLocation();
    const editData = location.state?.editData || null;
    const isEdit = !!editData;

    const [menuItems, setMenuItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [dropdownPage, setDropdownPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [batchRawMaterials, setBatchRawMaterials] = useState([]);
    const [loadingBatchMaterials, setLoadingBatchMaterials] = useState(false);
    const [batchPage, setBatchPage] = useState(0);
    const [batchHasMore, setBatchHasMore] = useState(false);

    const DROPDOWN_PAGE_SIZE = 100;

  const sendLog = async (status, currentItems = [], poId = 0) => {
    try {
      await AddLogs({
        description: getLogDescription(status, form, currentItems, isEdit, poId),
        eventType: getEventType(status, isEdit),
        id: 0,
        eventId:0,
        user: getUserEmail(),
      });
    } catch (logErr) {
      console.error("Failed to save log:", logErr);
    }
  };

    const FetchSearchDropdown = (searchTerm, page = 1, append = false) => {
      let currentSearch = searchTerm;
      page === 1 ? setLoadingItems(true) : setLoadingMore(true);
      SearchRawMaterial(true, userId, page, DROPDOWN_PAGE_SIZE, searchTerm)
        .then((res) => {
          if (currentSearch !== searchTerm) return;
          const data = res?.data?.data || {};
          const items = data["Raw Material Details"] || [];
          const total = data.totalItems || 0;
          setMenuItems((prev) => (append ? [...prev, ...items] : items));
          setDropdownPage(page);
          setHasMore(page * DROPDOWN_PAGE_SIZE < total);
        })
        .catch(() => {
          setMenuItems([]);
          setHasMore(false);
        })
        .finally(() => {
          setLoadingItems(false);
          setLoadingMore(false);
        });
    };

    const fetchBatchRawMaterials = useCallback(async (searchTerm = "", page = 0, append = false) => {
      try {
        setLoadingBatchMaterials(true);
        const res = await getAllRawMaterialByUserId(page, 100, userId, searchTerm);
        const container = res?.data?.data?.["city Details"] || res?.data?.data || {};
        const list = Array.isArray(container.content)
          ? container.content
          : Array.isArray(container.items)
            ? container.items
            : [];
        const totalItems = Number(container.totalElements || list.length || 0);
        const safePage = Number(page || 0);
        setBatchRawMaterials((prev) => (append ? [...prev, ...list] : list));
        setBatchPage(safePage);
        setBatchHasMore((safePage + 1) * 100 < totalItems);
      } catch (error) {
        console.log("fetchBatchRawMaterials error:", error);
        setBatchRawMaterials([]);
        setBatchHasMore(false);
      } finally {
        setLoadingBatchMaterials(false);
      }
    }, [userId]);

    useEffect(() => {
      const timer = setTimeout(() => {
        setDropdownPage(1);
        setMenuItems([]);
        setHasMore(false);
        FetchSearchDropdown(searchQuery.trim() ? searchQuery : "", 1, false);
      }, 400);
      return () => clearTimeout(timer);
    }, [searchQuery]);

  useEffect(() => {
    fetchSupplier();
    fetchCrCodes();
    fetchPoCodes();

    if (isBatchNoMode) {
      fetchBatchRawMaterials(searchValue || "", 0, false);
    }

    Promise.all([
      GetStockTypeByUserId(JSON.parse(userId), 0), 
      GetStockTypeByUserId(JSON.parse(userId), 1), 
    ]).then(([godownRes, kitchenRes]) => {
      const parse = (res) =>
        Array.isArray(res?.data?.data) ? res.data.data
        : Array.isArray(res?.data) ? res.data : [];
      setGodownTypes(filterStockTypes(parse(godownRes)));
      setKitchenTypes(filterStockTypes(parse(kitchenRes)));
    }).catch((err) => console.error("Failed to fetch stock types:", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

    useEffect(() => {
      if (!editData || !isEdit) return;
      if (editData.crcode) {
        setSelectedCrCode(editData.crcode);
      }
      if (editData.pocode) {
        setSelectedPoCode(editData.pocode);
      }
    }, [editData, crCodes, poCodes]);

  useEffect(() => {
    if (!editData) return;

    setForm({
      pocode: editData.pocode || "",
      date: editData.podate
        ? new Date(editData.podate.split("/").reverse().join("-"))
        : TODAY,
      party_id: editData.partyId || "",
      party_name: (() => {
    const match = supplier.find((s) => s.partyId === editData.partyId);
      return match ? match.partyName : editData.partyName || "";
      })(),
      event_id: editData.eventId || "",
      stock_type_id: editData.stockTypeId || "",
      invoice_type: editData.invoicetype || "",
      remark: editData.remarks || "",
      status: editData.status || "Pending",
    });

    // stockTypeId from API → Godown dropdown
    setSelectedGodownType(editData.stockTypeId || undefined);

    // kitchenTypeId from API → Kitchen dropdown
    setSelectedKitchenType(editData.kitchenTypeId || undefined);

    // clear the unused "all" type
    setSelectedAllType(undefined);

  const isBatchWise = !!editData.isBatchWise;
  setIsBatchNoMode(isBatchWise);

  if (isBatchWise) {
    setItems(
      (editData.batchWiseDetails || []).map((d) => {
        const rows = (d.batchList || []).map((b) => ({
          batchNo: b.batchNo || "",
          date: b.expiryDate || "",
          qty: b.qty ?? "",
          availableQty : b.availableQty  ?? "",
          
          unit: b.unitName || d.unitName || "",
        }));

        return {
          rawMaterialId: d.rawMaterialId || 0,
          item_name: d.rawMaterialName || "",
          qty: sumRowsQty(rows),
          unit: d.unitName || "",
          closingStock: d.closingStock ?? null,
          isAddInStock: d.isAddInStock ?? true,
          batchOptions: rows.map((r) => ({
            batchNo: r.batchNo,
            expiryDate: r.date,
            qty: r.qty,
            availableQty  : r.availableQty,
            unit: r.unit,
          })),
          detailRows: rows,
        };
      }),
    );
  } else {
    setItems(
      (editData.details || []).map((d) => ({
        rawMaterialId: d.rawMaterialId || 0,
        item_name: d.rawMaterialName || "",
        qty: d.qty || "",
        unit: d.unitName || "",
        originalQty: d.qty || 0,
        closingStock: d.closingStock ?? null,
        isAddInStock: d.isAddInStock ?? true,
      })),
    );
  }
  }, [editData, supplier, godownTypes, kitchenTypes]);

    const fetchSupplier = async () => {
      try {
        const res = await getpartywitheventforstock(userId);
        setSupplier(res?.data?.data || []);
      } catch (error) {
        console.log(error);
      }
    };

    // ── NEW: Fetch all CR codes ───────────────
    const fetchCrCodes = async () => {
      try {
        setLoadingCR(true);
        const data = await GetAllCrCodes(userId);
        setCrCodes(data?.data?.data || []);
      } catch (error) {
        console.log("fetchCrCodes error:", error);
      } finally {
        setLoadingCR(false);
      }
    };

    // ── NEW: Fetch all PO codes ───────────────
    const fetchPoCodes = async () => {
      try {
        setLoadingPO(true);
        const res = await GetAllStorePOCode(userId);
        setPoCodes(res?.data?.data || []);
      } catch (error) {
        console.log("fetchPoCodes error:", error);
      } finally {
        setLoadingPO(false);
      }
    };

    const handleCrCodeSelect = async (crcode) => {
      setSelectedCrCode(crcode || null);

      if (!crcode) {
        setItems([]);
        return;
      }

      try {
        setLoadingCRItems(true);
        const res = await GetMaterialByCrcode(crcode, userId);
        const data = res?.data?.data;
        if (!data) return;

        // ── Populate form from CR data ──
        const cr = Array.isArray(data) ? null : data;
        if (cr) {
          setForm((prev) => ({
            ...prev,
            party_id: cr.partyId || prev.party_id,
            party_name: cr.partyName || prev.party_name,
            stock_type_id: cr.stockTypeId || prev.stock_type_id,
            invoice_type: cr.invoicetype || prev.invoice_type,
            remark: cr.remarks || prev.remark,
            status: cr.status
              ? cr.status.charAt(0).toUpperCase() +
                cr.status.slice(1).toLowerCase()
              : prev.status,
          }));
        }

        // ── Populate items ──
        const rawList = Array.isArray(data) ? data : data.details || [];
        const mapped = rawList.map((detail) => ({
          rawMaterialId: detail.rawMaterialId || detail.materialId || 0,
          item_name: detail.rawMaterialName || detail.materialName || "",
          qty: detail.qty ?? "",
          unit: detail.unitName || detail.unit?.nameEnglish || "",
          originalQty: detail.qty ?? 0,
          closingStock: detail.closingStock ?? null,
          isAddInStock: detail.isAddInStock ?? true,
        }));

        setItems(mapped);
      } catch (error) {
        console.log("handleCrCodeSelect error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load materials for selected CR code.",
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        setLoadingCRItems(false);
      }
    };

    // ── NEW: On PO Code select, fetch that PO's data and populate the form ──
    const handlePoCodeSelect = async (pocode) => {
      setSelectedPoCode(pocode || null);

      if (!pocode) {
        setItems([]);
        return;
      }

      try {
        setLoadingPOItems(true);
        const res = await GetByPoCode(pocode, userId);
        const data = res?.data?.data;
        if (!data) return;

        // ── Populate form from PO data ──
        const po = Array.isArray(data) ? null : data;
        if (po) {
          setForm((prev) => ({
            ...prev,
            pocode: po.pocode || po.voucher || prev.pocode,
            party_id: po.partyId || prev.party_id,
            party_name: po.partyName || prev.party_name,
            event_id: po.eventId || prev.event_id,
            stock_type_id: po.stockTypeId || prev.stock_type_id,
            invoice_type: po.invoicetype || prev.invoice_type,
            remark: po.remarks || prev.remark,
            status: po.status
              ? po.status.charAt(0).toUpperCase() +
                po.status.slice(1).toLowerCase()
              : prev.status,
          }));

          setSelectedGodownType(po.stockTypeId || undefined);
          setSelectedKitchenType(po.kitchenTypeId || undefined);
        }

        // ── Populate items ──
        const rawList = Array.isArray(data) ? data : data.details || [];
        const mapped = rawList.map((detail) => ({
          rawMaterialId: detail.rawMaterialId || detail.materialId || 0,
          item_name: detail.rawMaterialName || detail.materialName || "",
          qty: detail.qty ?? "",
          unit: detail.unitName || detail.unit?.nameEnglish || "",
          originalQty: detail.qty ?? 0,
          closingStock: detail.closingStock ?? null,
          isAddInStock: detail.isAddInStock ?? true,
        }));

        setItems(mapped);
      } catch (error) {
        console.log("handlePoCodeSelect error:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load details for selected PO code.",
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        setLoadingPOItems(false);
      }
    };

  const handleSelectItem = useCallback(
    (rawItem) => {
      const id = rawItem.id || rawItem.rawMaterialId;
      const exists = items.some((i) => i.rawMaterialId === id);
      if (exists) {
        Swal.fire({
          icon: "warning",
          title: "Duplicate Item",
          text: "Item already added.",
          timer: 1500,
          showConfirmButton: false,
        });
        return;
      }

      const batchOptions = Array.isArray(rawItem.batchList)
        ? rawItem.batchList.map((batch) => ({
            batchNo: batch.batchNo || "",
            expiryDate: batch.expiryDate || "",
            qty:   batch.qty ?? batch.availableQty ??  "",
            availableQty : batch.availableQty ?? batch.qty ?? "",
            unit: batch.unitName || batch.unit || "",
            unitId: batch.unitId || 0,
          }))
        : [];

  const isBatchSelected = isBatchNoMode && batchOptions.length > 0;
const fallbackUnit =
  rawItem.unitName || rawItem.unit?.nameEnglish || rawItem.unit || "";

// batch mode: empty, the user adds batches. normal mode: single row as before
const initialRows = isBatchNoMode
  ? []
  : [{ batchNo: "", date: "", qty: "", unit: fallbackUnit }];

setItems((prev) => [
  {
    rawMaterialId: id,
    item_name: rawItem.rawMaterialName || rawItem.nameEnglish || "",
    qty: "",
    unit: fallbackUnit,
    // batch API returns total stock as `qty`; normal search API returns `closingStock`
    closingStock: isBatchNoMode
      ? (rawItem.qty ?? rawItem.closingStock ?? null)
      : (rawItem.closingStock ?? null),
    isAddInStock: true,
    batchOptions,
    detailRows: initialRows,
  },
  ...prev,
]);
setFocusQtyIndex(0);
if (isBatchNoMode) setExpandedItemIndex(0);
},
[items, isBatchNoMode],
);

const updateQty = useCallback((index, value) => {
      if (!/^\d*\.?\d*$/.test(value)) return;

      setItems((prev) => {
        const item = prev[index];
        if (!item) return prev;

        const parsedValue = parseFloat(value);
        const stock = item.closingStock;

        if (
          stock != null &&
          !isNaN(parsedValue) &&
          parsedValue > stock
        ) {
          Swal.fire({
            icon: "warning",
            title: "Quantity Exceeded",
            text: `Qty cannot be greater than available stock (${stock}).`,
            timer: 2000,
            showConfirmButton: false,
          });
          return prev; // reject the change, keep old qty
        }

        return prev.map((it, i) => (i === index ? { ...it, qty: value } : it));
      });
    }, []);
    const handleDeleteItem = useCallback((index) => {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const toggleAddInStock = useCallback((index, checked) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, isAddInStock: checked } : it,
      ),
    );
  }, []);

    const updateItemMeta = useCallback((index, field, value) => {
      setItems((prev) =>
        prev.map((it, i) => {
          if (i !== index) return it;

          if (field === "batchNo") {
            return { ...it, batchNo: value };
          }

          if (field === "expiryDate") {
            return { ...it, expiryDate: value };
          }

        if (field === "detailRows") {
    return { ...it, detailRows: value, qty: sumRowsQty(value) };
  }

          return it;
        }),
      );
    }, []);

   const addBatchRows = useCallback((index, selectedBatchNos = []) => {
  if (!Array.isArray(selectedBatchNos) || selectedBatchNos.length === 0) return;

  setItems((prev) =>
    prev.map((it, i) => {
      if (i !== index) return it;

      const rows = Array.isArray(it.detailRows) ? it.detailRows : [];
      const options = Array.isArray(it.batchOptions) ? it.batchOptions : [];
      const already = new Set(rows.map((r) => r.batchNo));

      const newRows = selectedBatchNos
        .filter((no) => !already.has(no))
        .map((no) => {
          const src = options.find((b) => b.batchNo === no) || {};
          return {
            batchNo: no,
            date: src.expiryDate || "",
            qty: "",
            unit: src.unit || it.unit || "",
          };
        });

      const nextRows = [...rows, ...newRows];
      return { ...it, detailRows: nextRows, qty: sumRowsQty(nextRows) };
    }),
  );

  setBatchAddSelection((prev) => ({ ...prev, [index]: [] }));
}, []);

    const typeOptions = stockTypes.map((t) => ({
      label: t.nameEnglish,
      value: t.stocktypeid ?? t.stockTypeId ?? t.id,
    }));

    const formatDateForApi = (date) => {
      if (!date) return "";
      const d = String(date.getDate()).padStart(2, "0");
      const m = String(date.getMonth() + 1).padStart(2, "0");
      return `${d}/${m}/${date.getFullYear()}`;
    };

    const toIsoDate = (date) => {
      if (!date) return "";
      if (typeof date === "string") return date;
      const value = new Date(date);
      if (Number.isNaN(value.getTime())) return "";
      return value.toISOString().split("T")[0];
    };

    const buildBatchWisePayload = () => {
    const details = items
      .map((item) => {
      const rows = Array.isArray(item.detailRows) ? item.detailRows : [];
        const batchList = rows
          .map((row) => ({
            batchNo: row.batchNo || "",
            qty: Number(row.qty || 0),
          }))
          .filter((row) => row.batchNo && row.qty > 0);

        return {
          rawMaterialId: item.rawMaterialId || 0,
          isAddInStock: item.isAddInStock ?? true,
          batchList,
        };
      })
      .filter((item) => item.batchList.length > 0);

    const resolvedCrId =
      (isEdit ? editData?.crId : null) ||
      crCodes.find((cr) => cr.crcode === selectedCrCode)?.id ||
      0;

    return {
      id: isEdit ? editData?.id || 0 : 0,
      crId: resolvedCrId,
      crcode: selectedCrCode || "",
      userId: Number(userId || 0),
      partyId: Number(form.party_id || 0),
      eventId: Number(form.event_id || 0),
      podate: formatDateForApi(form.date),
      stockTypeId: Number(selectedGodownType || 0),
      kitchenTypeId: Number(selectedKitchenType || 0),
      invoicetype: form.invoice_type || "",
      remarks: form.remark || "",
      status: form.status,
      voucher: form.pocode || form.batch_no || "",
      details,
    };
  };

    const handleSave = async () => {
      // if (!form.stock_type_id) {
      //   Swal.fire({
      //     icon: "warning",
      //     title: "Validation",
      //     text: "Please select a stock type.",
      //     confirmButtonColor: "#3085d6",
      //   });
      //   return;
      // }
      if (items.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "Validation",
          text: "Please add at least one item.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      if (isBackDateLocked && form.date) {
    const selectedDateStr = formatDateForApi(form.date).split("/").reverse().join("-"); // → YYYY-MM-DD
    if (selectedDateStr < todayStr) {
      Swal.fire({
        icon: "warning",
        title: "Validation",
        text: "Back-dated entries are not allowed.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }
  }

      if (isBatchNoMode) {
  const empty = items.find(
    (it) => !(it.detailRows || []).some((r) => r.batchNo && Number(r.qty) > 0),
  );
  if (empty) {
    Swal.fire({
      icon: "warning",
      title: "Validation",
      text: `Add at least one batch with qty for "${empty.item_name}".`,
      confirmButtonColor: "#3085d6",
    });
    return;
  }
   const batchPayload = buildBatchWisePayload();

  try {
    setSaving(true);
    const response = await addOrUpdateBatchWisestore(batchPayload);
    const result = response?.data;

    if (result?.success === true) {
      await sendLog("SAVE_SUCCESS", items, result?.data?.id || editData?.id || 0);
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: isEdit
          ? "Batch store issue updated successfully."
          : "Batch store issue saved successfully.",
        confirmButtonColor: "#16a34a",
      });
      navigate("/stock-management/store-po");
    } else {
      await sendLog("SAVE_ERROR", items, editData?.id || 0);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: result?.msg || "Failed to save batch-wise Store Issue.",
        confirmButtonColor: "#d33",
      });
    }
  } catch (error) {
    console.error("Batch save failed:", error);
    await sendLog("SAVE_ERROR", items, editData?.id || 0);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to save batch-wise Store Issue. Please try again.",
      confirmButtonColor: "#d33",
    });
  } finally {
    setSaving(false);
  }
  return;
}

try {
    setSaving(true);

    const resolvedCrId = isEdit
      ? editData.crId ||
        crCodes.find((cr) => cr.crcode === selectedCrCode)?.id ||
        0
      : crCodes.find((cr) => cr.crcode === selectedCrCode)?.id || 0;

    const payload = {
      id: isEdit ? editData.id : 0,
      crId: resolvedCrId,
      crcode: selectedCrCode || "",
      userId: parseInt(userId),
      partyId: form.party_id || null,
      eventId: form.event_id || null,
      podate: formatDateForApi(form.date),
      stockTypeId: selectedGodownType || null,
      kitchenTypeId: selectedKitchenType || null,
      invoicetype: form.invoice_type,
      remarks: form.remark,
      status: form.status,
      voucher: form.pocode || "",
      details: items.map((item) => ({
        rawMaterialId: item.rawMaterialId || 0,
        qty: Number(item.qty),
        isAddInStock: item.isAddInStock ?? true,
      })),
    };

    const response = await AddStorePOApi(payload);
    const result = response?.data; 

    if (result?.success === true) {
    const savedPoId = isEdit ? editData.id : (result?.data?.id || result?.id || 0);
    await sendLog("SAVE_SUCCESS", items, savedPoId);

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: isEdit
          ? "Store Issue updated successfully."
          : "Store Issue saved successfully.",
        confirmButtonColor: "#16a34a",
      });
      navigate("/stock-management/store-po");
    } else {
    await sendLog("SAVE_ERROR", items, isEdit ? editData.id : 0);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: result?.msg || "Failed to save Store Issue. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  } catch (error) {
    console.error("Save failed:", error);
    await sendLog("SAVE_ERROR", items, isEdit ? editData?.id : 0);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to save Store Issue. Please try again.",
      confirmButtonColor: "#d33",
    });
  } finally {
    setSaving(false);
  }
    };

    const fieldClass =
      "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";
    const labelClass =
      "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

    const currentStatus =
      STATUS_OPTIONS.find((s) => s.value === form.status) || STATUS_OPTIONS[0];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6 font-sans">
        <div className="mx-auto space-y-5">
          {/* ── Store Issue Information Card ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-700">
                  <FileText size={17} className="text-white" />
                </div>
                <h2 className="text-green-900 font-bold text-base tracking-tight">
                  {isEdit ? (
                    <FormattedMessage
                      id="STORE_ISSUE.EDIT"
                      defaultMessage="Edit Store Issue"
                    />
                  ) : (
                    <FormattedMessage
                      id="STORE_ISSUE.INFO"
                      defaultMessage="Store Issue Information"
                    />
                  )}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddItemModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <Plus size={16} />
                  <FormattedMessage
                    id="STORE_ISSUE.NEW_RAW_MATERIAL"
                    defaultMessage="New Raw Material"
                  />
                </button>
                <button
                  onClick={() => navigate("/stock-management/store-po")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors shadow-sm"
                >
                  <ArrowLeft size={16} />
                  <FormattedMessage id="COMMON.BACK" defaultMessage="Back" />
                </button>
              </div>
            </div>

            <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
           
             {canUseBatchMode && (
  <div className="col-span-1">
    <label className={labelClass}>
      <Hash size={16} /> Batch No
    </label>
    <div className="flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/60 h-[38px]">
      <span className="text-xs text-slate-600 leading-snug">Enable batch mode</span>
      <Switch
        size="small"
        checked={isBatchNoMode}
        disabled={isEdit}
        onChange={(checked) => setIsBatchNoMode(checked)}
      />
    </div>
  </div>
)}

              {!isBatchNoMode && (
                <div className="col-span-1">
                  <label className={labelClass}>
                    <Hash size={16} /> PO Code
                  </label>
                  <Select
                    showSearch
                    allowClear
                    placeholder="Select PO code"
                    style={{ width: "100%", height: "38px" }}
                    value={selectedPoCode || undefined}
                    onChange={handlePoCodeSelect}
                    disabled={isEdit}
                    loading={loadingPO}
                    filterOption={(input, option) =>
                      option?.label?.toLowerCase().includes(input.toLowerCase())
                    }
                    options={poCodes.map((po) => ({
                      value: po.pocode,
                      label: po.pocode,
                    }))}
                  />
                  {loadingPOItems && (
                    <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                      <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                      Loading details…
                    </p>
                  )}
                  {!isEdit && poCodes.length === 0 && !loadingPO && (
                    <p className="text-xs text-gray-400 mt-1">
                      No PO Codes available
                    </p>
                  )}
                </div>
              )}

              {/* ── NEW: CR Code ── */}
              <div className="col-span-1">
                <label className={labelClass}>
                  <Hash size={16} /> Chef Requisition
                </label>
                <Select
                  showSearch
                  allowClear
                  placeholder="Select CR code"
                  style={{ width: "100%", height: "38px" }}
                  value={selectedCrCode || undefined}
                  onChange={handleCrCodeSelect}
                  disabled={isEdit}
                  loading={loadingCR}
                  filterOption={(input, option) =>
                    option?.label?.toLowerCase().includes(input.toLowerCase())
                  }
                  options={crCodes.map((cr) => ({
                    value: cr.crcode,
                    label: cr.crcode,
                  }))}
                />
                {loadingCRItems && (
                  <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                    <span className="inline-block w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    Loading materials…
                  </p>
                )}
                {!isEdit && crCodes.length === 0 && !loadingCR && (
                  <p className="text-xs text-gray-400 mt-1">
                    No CR Codes available
                  </p>
                )}
              </div>

              {/* Date */}
              <div className="col-span-1">
              <label className={labelClass}>
                <Calendar size={16} />
                <FormattedMessage id="COMMON.DATE" defaultMessage="Date" />
              </label>
              <DatePicker
                selected={form.date}
                onChange={(date) => setForm((p) => ({ ...p, date }))}
                dateFormat="dd/MM/yyyy"
                className={fieldClass}
                wrapperClassName="w-full"
                minDate={isBackDateLocked ? new Date() : undefined}
                autoComplete="off"
              />
            </div>

              {/* Party Name */}
              <div className="col-span-2 lg:col-span-2">
                <label className={labelClass}>
                  <User size={16} />
                  <FormattedMessage
                    id="STORE_ISSUE.PARTY_NAME"
                    defaultMessage="Party Name"
                  />
                </label>
              <Select
    showSearch
    allowClear
    placeholder="Search party…"
    style={{ width: "100%", height: "38px" }}
    value={form.event_id || undefined}
    onChange={(val, option) =>
      setForm((p) => ({
        ...p,
        party_id: option?.raw?.partyId || "",
        party_name: option?.raw?.partyName || "",
        event_id: val,
      }))
    }
    filterOption={(input, option) =>
      option?.label?.toLowerCase().includes(input.toLowerCase())
    }
    options={supplier
      .map((s) => ({
        value: s.eventId,
        label: `${s.partyName} (${s.eventName}) (${s.eventDate})`,
        raw: s,
      }))}
  />
              </div>

        <div className="col-span-2 lg:col-span-4 grid grid-cols-3 gap-4">
  <div className="col-span-2 lg:col-span-4 grid grid-cols-2 gap-4">
    {/* ── Godown ── */}
    <div>
      <label className={labelClass}>
        <Tag size={16} /> Godown
      </label>
      <Select
        showSearch
        allowClear
        placeholder="Select Godown Type"
        style={{ width: "100%", height: "38px" }}
        value={selectedGodownType}
        onChange={(value) => setSelectedGodownType(value)}
    options={godownTypes.map((t) => ({
      label: t.nameEnglish,
      value: t.id,
    }))}
      
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
      />
    </div>

    {/* ── Kitchen ── */}
    <div>
      <label className={labelClass}>
        <Tag size={16} /> Kitchen
      </label>
      <Select
        showSearch
        allowClear
        placeholder="Select Kitchen Type"
        style={{ width: "100%", height: "38px" }}
        value={selectedKitchenType}
        onChange={(value) => {
          setSelectedKitchenType(value);
        }}
        options={kitchenTypes.map((t) => ({
      label: t.nameEnglish,
      value: t.stocktypeid ?? t.stockTypeId ?? t.id,
    }))}
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
      />
    </div>
  </div>


  </div>
              {/* ── NEW: Status ── */}
              <div className="col-span-1">
                <label className={labelClass}>
                  <Activity size={16} />
                  Status <span className="text-red-500">*</span>
                </label>
                <Select
                  style={{ width: "100%", height: "38px" }}
                  value={form.status}
                  onChange={async (val) => {
                    setForm((p) => ({ ...p, status: val }));
                    const poid = editData?.id || editData?.issueid;
                    console.log("POID", poid);

                    if (isEdit && editData?.id) {
                      try {
                        await StatusStorePO(poid, val);
                        Swal.fire({
                          toast: true,
                          position: "top-end",
                          icon: "success",
                          title: `Status updated to ${val}`,
                          showConfirmButton: false,
                          timer: 1500,
                        });
                      } catch (error) {
                        console.error("Status update failed:", error);
                        // Revert the dropdown back on failure
                        setForm((p) => ({
                          ...p,
                          status: editData?.status || "Pending",
                        }));
                        Swal.fire({
                          toast: true,
                          position: "top-end",
                          icon: "error",
                          title: "Failed to update status",
                          showConfirmButton: false,
                          timer: 2000,
                        });
                      }
                    }
                  }}
                  options={STATUS_OPTIONS.map((s) => ({
                    value: s.value,
                    label: s.label,
                  }))}
                  optionRender={(option) => {
                    const opt = STATUS_OPTIONS.find(
                      (s) => s.value === option.data.value,
                    );
                    return (
                      <div className="flex items-center gap-2">
                        <span
                          style={{
                            display: "inline-block",
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: opt?.color,
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ fontWeight: 500 }}>
                          {option.data.label}
                        </span>
                      </div>
                    );
                  }}
                  labelRender={() => (
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          backgroundColor: currentStatus.color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 600,
                          padding: "2px 8px",
                          borderRadius: "999px",
                          color: currentStatus.color,
                        }}
                      >
                        {currentStatus.label}
                      </span>
                    </div>
                  )}
                />
              </div>

              {/* Remark */}
              <div className="col-span-2 lg:col-span-4">
                <label className={labelClass}>
                  <AlignLeft size={16} />
                  <FormattedMessage id="COMMON.REMARK" defaultMessage="Remark" />
                </label>
                <input
                  name="remark"
                  value={form.remark}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, remark: e.target.value }))
                  }
                  placeholder="Optional remark…"
                  className={fieldClass}
                />
              </div>
            </div>
          </div>

          {/* ── Store Issue Details Card ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary">
                  <ShoppingCart size={17} className="text-white" />
                </div>
                <h2 className="text-blue-900 font-bold text-base tracking-tight">
                  <FormattedMessage
                    id="STORE_ISSUE.DETAILS"
                    defaultMessage="Store Issue Details"
                  />
                </h2>
                {items.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold transition-all hover:opacity-90 shadow-sm bg-green-700 disabled:opacity-60"
              >
                <Save size={16} />
                {saving ? (
                  <FormattedMessage
                    id="COMMON.SAVING"
                    defaultMessage="Saving..."
                  />
                ) : isEdit ? (
                  <FormattedMessage id="COMMON.UPDATE" defaultMessage="Update" />
                ) : (
                  <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
                )}
              </button>
            </div>

            {/* ── Search Bar ── */}
            <div className="px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center gap-3">
              <div className="relative w-full max-w-md">
                <Select
                  ref={searchSelectRef}
                  showSearch
                  placeholder={isBatchNoMode ? "Search raw material..." : "Search & add item..."}
                  value={searchValue || undefined}
                  filterOption={false}
                  onSearch={(value) => {
                    setSearchValue(value);
                    if (isBatchNoMode) {
                      setBatchRawMaterials([]);
                      fetchBatchRawMaterials(value, 0, false);
                      return;
                    }
                    setSearchQuery(value);
                  }}
                  onDropdownVisibleChange={(open) => {
                    if (isBatchNoMode) {
                      if (open && batchRawMaterials.length === 0 && !loadingBatchMaterials)
                        fetchBatchRawMaterials(searchValue || "", 0, false);
                      return;
                    }
                    if (open && menuItems.length === 0 && !loadingItems)
                      FetchSearchDropdown("", 1, false);
                  }}
                  onSelect={(value, option) => {
                    handleSelectItem(option.raw);
                    setSearchValue("");
                    setSearchQuery("");
                    if (isBatchNoMode) fetchBatchRawMaterials("", 0, false); 
                  }}
                  notFoundContent={isBatchNoMode ? (loadingBatchMaterials ? "Loading..." : "No items found") : (loadingItems ? "Loading..." : "No items found")}
                  style={{ width: "100%", maxWidth: "400px" }}
                  options={(isBatchNoMode ? batchRawMaterials : menuItems)
                    .filter((item) => {
                      const name = (item.rawMaterialName || item.nameEnglish || "").toLowerCase();
                      const q = (searchValue || "").toLowerCase();
                      return !q || name.includes(q);
                    })
                    .map((item) => {
                      const rawName = item.rawMaterialName || item.nameEnglish || "";
                      const unitName = item.unitName || item.unit?.nameEnglish || item.unit || "";
                      const isAdded = items.some((i) => i.rawMaterialId === (item.rawMaterialId || item.id));
                      return {
                        value: item.rawMaterialId || item.id,
                        label: (
                          <div className="flex justify-between">
                            <span className={isAdded ? "text-gray-400" : ""}>{rawName}</span>
                            <div className="flex gap-2 items-center">
                              {unitName && <span className="text-xs text-gray-400">{unitName}</span>}
                              {isAdded && <span className="text-xs text-red-400">Added</span>}
                            </div>
                          </div>
                        ),
                        raw: item,
                        disabled: isAdded,
                      };
                    })}
                  onPopupScroll={(e) => {
                    const target = e.target;
                    if (isBatchNoMode) {
                      if (
                        target.scrollTop + target.offsetHeight >=
                          target.scrollHeight - 10 &&
                        batchHasMore &&
                        !loadingBatchMaterials
                      ) {
                        fetchBatchRawMaterials(searchValue || "", batchPage + 1, true);
                      }
                      return;
                    }
                    if (
                      target.scrollTop + target.offsetHeight >=
                        target.scrollHeight - 10 &&
                      hasMore &&
                      !loadingMore
                    )
                      FetchSearchDropdown(searchQuery, dropdownPage + 1, true);
                  }}
                />
                {(loadingItems || loadingBatchMaterials) && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {loadingMore && (
                  <div className="text-xs text-gray-400 px-2 py-1">
                    Loading more...
                  </div>
                )}
              </div>
            </div>

            {/* ── Table ── */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {[
                      "#",
                      <FormattedMessage
                        id="STORE_ISSUE.ADD_ON_STOCK"
                        defaultMessage="Add to Stock"
                      />,
                      <FormattedMessage
                        id="STORE_ISSUE.ITEM_NAME"
                        defaultMessage="Item Name"
                      />,
                      <FormattedMessage id="COMMON.QTY" defaultMessage="Qty *" />,
                      " Available Stock",
                      <FormattedMessage id="COMMON.UNIT" defaultMessage="Unit" />,
                      "",
                    ].map((h, idx) => (
                      <th
                        key={idx}
                        className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-14 text-center text-slate-400 text-sm"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Package size={36} className="text-slate-200" />
                          <p className="font-medium text-slate-400">
                            No items added yet
                          </p>
                          <p className="text-xs text-slate-300">
                            {selectedCrCode
                              ? "No materials found for selected CR code."
                              : selectedPoCode
                              ? "No materials found for selected PO code."
                              : "Use the search bar above or select a CR/PO code to add items."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, i) => {
                     const detailRows = Array.isArray(item.detailRows) ? item.detailRows : [];
                      return (
                        <Fragment key={i}>
                          <tr
                            className="border-b text-center border-slate-50 hover:bg-blue-50/20 transition-colors group"
                          >
                            <td className="px-4 py-2 text-xs text-slate-400 font-medium w-8">
                              {i + 1}
                            </td>
                            <td className="px-4 py-2 w-20 text-center">
                              <input
                                type="checkbox"
                                checked={item.isAddInStock ?? true}
                                onChange={(e) => toggleAddInStock(i, e.target.checked)}
                                className="w-4 h-4 accent-blue-600 cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-2 font-semibold text-slate-800 w-64 max-w-xs">
                              <div className="flex items-center justify-between gap-2">
                                <span className="truncate block">{item.item_name}</span>
                                {/* <button
                                  type="button"
                                  onClick={() =>
                                    setExpandedItemIndex((prev) => (prev === i ? null : i))
                                  }
                                  className="text-[10px] font-bold uppercase tracking-wide text-blue-600 hover:text-blue-700"
                                >
                                  {expandedItemIndex === i ? "Hide" : "View"}
                                </button> */}
                              </div>
                            </td>
                            <td className="px-2 py-2 w-28">
                              <input
                                type="text"
                             inputMode="decimal"
readOnly={isBatchNoMode}
ref={(el) => (qtyInputRefs.current[i] = el)}
                                value={item.qty}
                                onChange={(e) => updateQty(i, e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    if (String(item.qty).endsWith("."))
                                      updateQty(i, String(parseFloat(item.qty)));
                                    focusSearchInput();
                                  }
                                }}
                                onBlur={() => {
                                  if (String(item.qty).endsWith("."))
                                    updateQty(i, String(parseFloat(item.qty)));
                                }}
                                placeholder="0"
                                className={`w-full px-3 py-1.5 text-sm border rounded-xl text-center transition-all focus:outline-none focus:ring-1
                                ${
                                  !item.qty || parseFloat(item.qty) <= 0
                                    ? "border-blue-300 bg-blue-50 text-blue-700 placeholder-blue-400 focus:border-blue-400 focus:ring-blue-200"
                                    : "border-slate-200 bg-white text-slate-800 focus:border-blue-400 focus:ring-blue-200"
                                }`}
                              />
                              {!isEdit && item.originalQty > 0 && (
                                <p className="text-xs text-slate-400 mt-0.5 text-center">
                                  min: {item.originalQty}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-2 w-28 text-center">
                              {item.closingStock != null ? (
                                <span
                                  className={`text-xs font-semibold px-2 py-1 rounded-lg inline-block
                                ${
                                  item.closingStock < 0
                                    ? "bg-red-100 text-red-600"
                                    : "bg-slate-50 text-slate-600"
                                }`}
                                >
                                  {item.closingStock}
                                </span>
                              ) : (
                                <span className="text-slate-300 text-xs">—</span>
                              )}
                            </td>
                            <td className="px-4 py-2 w-24">
                              <span className="text-xs text-slate-500 font-medium">
                                {item.unit || "—"}
                              </span>
                            </td>
                            <td className="px-4 py-2 w-20">
                              <div className="flex items-center justify-end gap-2">
                            {isBatchNoMode && (
    <button
      type="button"
      onClick={() =>
        setExpandedItemIndex((prev) => (prev === i ? null : i))
      }
      className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 flex items-center justify-center transition-colors"
      title={expandedItemIndex === i ? "Hide batch details" : "View batch details"}
    >
      {expandedItemIndex === i ? (
        <ChevronUp size={13} />
      ) : (
        <ChevronDown size={13} />
      )}
    </button>
  )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteItem(i)}
                                  className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                                  title="Delete item"
                                >
                                  <Trash2 size={13} className="text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {isBatchNoMode && expandedItemIndex === i && (
  <tr className="bg-blue-50/40">
    <td colSpan={7} className="px-4 py-4">
      <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-blue-100/40 to-blue-50 p-3 shadow-inner">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-blue-700">
            Batch Details
          </span>
          <div className="flex items-center gap-2">
            <Select
              mode="multiple"
              showSearch
              allowClear
              maxTagCount="responsive"
              placeholder="Select batches"
              value={batchAddSelection[i] || []}
              onChange={(vals) =>
                setBatchAddSelection((p) => ({ ...p, [i]: vals }))
              }
              style={{ width: 360 }}
              options={(item.batchOptions || []).map((b) => {
                const used = detailRows.some((r) => r.batchNo === b.batchNo);
                const text = `${b.batchNo}${b.expiryDate ? ` (${b.expiryDate})` : ""} • Stock: ${b.qty ?? 0}`;
                return {
                  value: b.batchNo,
                  searchLabel: text,
                  disabled: used,
                  label: (
                    <div className="flex justify-between items-center">
                      <span className={used ? "text-gray-400" : ""}>{text}</span>
                      {used && (
                        <span className="text-xs text-green-600 font-semibold">Added</span>
                      )}
                    </div>
                  ),
                };
              })}
              filterOption={(input, option) =>
                (option?.searchLabel ?? "").toLowerCase().includes(input.toLowerCase())
              }
            />
            <button
              type="button"
              onClick={() => addBatchRows(i, batchAddSelection[i])}
              disabled={!batchAddSelection[i]?.length}
              className="px-2.5 py-1.5 rounded-lg border border-blue-300 bg-white text-[10px] font-bold uppercase tracking-wide text-blue-700 shadow-sm hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              + Add {batchAddSelection[i]?.length > 1 ? `(${batchAddSelection[i].length})` : "Row"}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-[minmax(0,1fr)_100px_120px_120px_36px] gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
            <div className="px-2">Batch Number</div>
            <div className="px-2">Unit</div>
<div className="px-2">Available</div>
            <div className="px-2">Return Qty</div>

            <div className="px-2">Qty</div>
            <div />
          </div>

          {detailRows.length === 0 && (
            <div className="text-xs text-slate-400 px-2 py-2">
              Select batches above and click "+ Add Row".
            </div>
          )}

          {detailRows.map((row, rowIdx) => {
            // unit and available come from this item's batch list
            const src = (item.batchOptions || []).find((b) => b.batchNo === row.batchNo);
            const unit = src?.unit || row.unit || item.unit || "—";
            const available = src?.availableQty ?? null;

            return (
              <div
                key={`${i}-${row.batchNo}-${rowIdx}`}
                className="grid grid-cols-[minmax(0,1fr)_100px_120px_120px_36px] gap-2 items-center"
              >
                <div className="rounded-xl border border-blue-200 bg-slate-50 px-3 py-2 shadow-sm">
                  <span className="text-xs font-medium text-slate-700">
                    {`${row.batchNo}${row.date ? ` (${row.date})` : ""}`}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 cursor-not-allowed">
                  <span className="text-xs font-medium text-slate-600">{unit}</span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 cursor-not-allowed">
                  <span className="text-xs font-semibold text-slate-600">
                    {available ?? "—"}
                  </span>
                </div>

                <div className="rounded-xl border border-blue-200 bg-white px-2 py-1.5 shadow-sm">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={row.qty ?? ""}
                    placeholder="Qty"
                    className="w-full bg-transparent text-xs text-slate-700 focus:outline-none"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!/^\d*\.?\d*$/.test(val)) return;
                      const num = parseFloat(val);
                      if (available != null && !isNaN(num) && num > Number(available)) {
                        Swal.fire({
                          icon: "warning",
                          title: "Quantity Exceeded",
                          text: `Qty cannot be greater than available (${available}) for ${row.batchNo}.`,
                          timer: 2000,
                          showConfirmButton: false,
                        });
                        return;
                      }
                      updateItemMeta(
                        i,
                        "detailRows",
                        detailRows.map((r, idx) =>
                          idx === rowIdx ? { ...r, qty: val } : r,
                        ),
                      );
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    updateItemMeta(
                      i,
                      "detailRows",
                      detailRows.filter((_, idx) => idx !== rowIdx),
                    )
                  }
                  className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                  title="Delete row"
                >
                  <Trash2 size={13} className="text-red-500" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </td>
  </tr>
)}
                        </Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modals */}
        <AddContactName
          isModalOpen={isAccountModalOpen}
          setIsModalOpen={setIsAccountModalOpen}
          contactTypeId={3}
          onClose={() => setIsAccountModalOpen(false)}
          refreshData={fetchSupplier}
          concatId={3}
        />
        <AddRawMaterial
          isOpen={isAddItemModalOpen}
          onClose={() => setIsAddItemModalOpen(false)}
          setIsModalOpen={setIsAddItemModalOpen}
          refreshData={(newItem) => newItem && handleSelectItem(newItem)}
        />
      </div>
    );
  };

  export default AddStorePO;