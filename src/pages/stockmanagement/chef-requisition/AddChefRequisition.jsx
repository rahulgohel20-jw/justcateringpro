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
  ShoppingCart,
} from "lucide-react";
import { Select } from "antd";
import { useEffect, useState } from "react";
import {
  GetStockTypeByUserId,
  GetEventMaster,
  AddChefReq,
  AddLogs,
  GetRawMaterialcategory,
  GetAllRawMaterials,
} from "@/services/apiServices";
import { useLocation, useNavigate } from "react-router";
import Swal from "sweetalert2";
import AddContactName from "../../master/MenuItemMaster/components/AddContactName";
import AddRawMaterial from "../../../partials/modals/add-raw-material/AddRawMaterial";
import DatePicker from "react-datepicker";
import { FormattedMessage } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import { useStockTypePermission } from "../../../hooks/useStockTypePermission";

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

const getLogDescription = (status, form, items, isEdit) => {
  const action = isEdit ? "Chef Requisition Edit" : "Chef Requisition Add";
  const party = form.party_name || "-";

  switch (status) {
    case "SAVE_SUCCESS": {
      const itemSummary = items.map((i) => `${i.item_name}(x${i.qty})`).join(", ");
      return `${action} saved | Party: ${party} | ${itemSummary}`;
    }
    case "SAVE_ERROR":
      return `${action} failed | Party: ${party}`;
    default:
      return `${action} performed`;
  }
};

const getEventType = (status, isEdit) => {
  const prefix = isEdit ? "ChefReq_Edit" : "ChefReq_Add";
  return status === "SAVE_SUCCESS" ? `${prefix}_Success` : `${prefix}_Error`;
};

const resolveLocalizedName = (obj, lang) => {
  if (!obj) return "";

  if (lang === "gu") {
    return (
      obj.nameGujarati || obj.rawMaterialNameGuj || obj.nameEnglish || obj.rawMaterialNameEng || obj.item_name || ""
    );
  }

  if (lang === "hi") {
    return (
      obj.nameHindi || obj.rawMaterialNameHin || obj.nameEnglish || obj.rawMaterialNameEng || obj.item_name || ""
    );
  }

  return (
    obj.nameEnglish || obj.rawMaterialNameEng || obj.item_name || "Unnamed Item"
  );
};

const AddChefRequisition = () => {
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [supplier, setSupplier] = useState([]);
  const [stockTypes, setStockTypes] = useState([]);
  const [saving, setSaving] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownPage, setDropdownPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const DROPDOWN_PAGE_SIZE = 100;
  const TODAY = new Date();
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
  const isChildUser = authStorage?.state?.user?.ischilduser ?? false;
  const location = useLocation();
  const editData = location.state?.editData || null;
  const isEdit = !!editData;
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("ALL");

  const backDatePermission = usePermission("Lock Back Date Entry");
const isBackDateLocked = backDatePermission.add || backDatePermission.edit;
const { isSuperUser, filterStockTypes } = useStockTypePermission();
const todayStr = new Date().toISOString().split("T")[0];

  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem("lang") || "en",
  );

  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = localStorage.getItem("lang") || "en";
      setCurrentLanguage(newLang);
    };

    window.addEventListener("languageChange", handleLanguageChange);
    window.addEventListener("storage", handleLanguageChange);

    const intervalId = setInterval(() => {
      const current = localStorage.getItem("lang") || "en";
      if (current !== currentLanguage) {
        setCurrentLanguage(current);
      }
    }, 500);

    return () => {
      window.removeEventListener("languageChange", handleLanguageChange);
      window.removeEventListener("storage", handleLanguageChange);
      clearInterval(intervalId);
    };
  }, [currentLanguage]);

  // Convenience wrapper bound to the current language
  const getLocalizedName = (obj) => resolveLocalizedName(obj, currentLanguage);

  const sendLog = async (status, currentItems = []) => {
    try {
      await AddLogs({
        description: getLogDescription(status, form, currentItems, isEdit),
        eventType: getEventType(status, isEdit),
        id: 0,
        eventId: 0,
        user: getUserEmail(),
      });
    } catch (logErr) {
      console.error("Failed to save log:", logErr);
    }
  };

  const [form, setForm] = useState({
    voucher: "",
    date: TODAY,
    party_id: null,
    party_name: "",
    stock_type_id: "",
    invoice_type: "",
    remark: "",
  });

  // ── Fetch items for the currently selected category (or "ALL") ─────────────
  const FetchSearchDropdown = (page = 1, append = false, categoryId = selectedCategoryId) => {
    if (!categoryId) {
      setMenuItems([]);
      setHasMore(false);
      return;
    }

    page === 1 ? setLoadingItems(true) : setLoadingMore(true);

    // "ALL" maps to 0 — no category filter on the backend
    const catIdToFetch = categoryId === "ALL" ? 0 : categoryId;

    GetAllRawMaterials(page, DROPDOWN_PAGE_SIZE, catIdToFetch, searchQuery || "", userId)
      .then((res) => {
        const payload = res?.data?.["Raw Material Details"]
          ? res.data
          : res?.data?.data?.["Raw Material Details"]
            ? res.data.data
            : {};

        const fetchedItems = payload["Raw Material Details"] || [];
        const totalPages = payload.totalPages ?? 1;

        // Sort once, at fetch time, using whatever qty is already in `items` right now —
        // not recalculated afterward while the user types.
        const sortedFetched = [...fetchedItems].sort((a, b) => {
          const aId = a.id || a.rawMaterialId || 0;
          const bId = b.id || b.rawMaterialId || 0;
          const aFilled = parseFloat(items.find((i) => i.rawMaterialId === aId)?.qty) > 0 ? 1 : 0;
          const bFilled = parseFloat(items.find((i) => i.rawMaterialId === bId)?.qty) > 0 ? 1 : 0;
          return bFilled - aFilled;
        });

        setMenuItems((prev) => (append ? [...prev, ...sortedFetched] : sortedFetched));
        setDropdownPage(page);
        setHasMore(page < totalPages);
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

  useEffect(() => {
    if (!editData) return;
    setForm({
      voucher: editData.crcode || "",
      date: editData.crdate ? new Date(editData.crdate.split("/").reverse().join("-")) : TODAY,
      party_id: editData.partyId || "",
      party_name: (() => {
        const match = supplier.find((s) => s.id === editData.partyId);
        return match ? getLocalizedName(match.party) : editData.partyName || "";
      })(),
      stock_type_id: editData.stockTypeId || "",
      invoice_type: editData.invoicetype || "",
      remark: editData.remarks || "",
    });

    setItems(
      (editData.details || []).map((d) => ({
        rawMaterialId: d.rawMaterialId || 0,
        nameEnglish: d.rawMaterialNameEng || d.rawMaterialName || "",
        nameGujarati: d.rawMaterialNameGuj || "",
        nameHindi: d.rawMaterialNameHin || "",
        item_name: d.rawMaterialName || "",
        qty: d.qty || "",
        unit: d.unitName || "",
        originalQty: d.qty || 0,
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData, supplier, currentLanguage]);

  useEffect(() => {
    GetStockTypeByUserId(JSON.parse(userId), "")
      .then((res) => {
        const data = Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : [];
        setStockTypes(data);
      })
      .catch((err) => console.error("Failed to fetch stock types:", err));
  }, []);

  useEffect(() => {
    fetchSupplier();
  }, []);

  // Debounced server-side search — fires for typing in the search dropdown.
  // For a real category, this also covers the initial load (handled above) and re-searches.
  // For "ALL", nothing fetches until the user actually types something.
  useEffect(() => {
    if (!selectedCategoryId) return;

    const timer = setTimeout(() => {
      setDropdownPage(1);
      setMenuItems([]);
      FetchSearchDropdown(1, false, selectedCategoryId);
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategoryId]);

  const fetchSupplier = async () => {
    try {
      const data = await GetEventMaster(userId, isChildUser);
      setSupplier(data?.data?.data["Event Details"] || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSelectItem = (rawItem) => {
    const id = rawItem.id || rawItem.rawMaterialId || 0;

    const exists = items.some((i) => i.rawMaterialId === id);
    if (exists) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Item",
        text: "This item is already added.",
        timer: 1500,
        showConfirmButton: false,
      });
      return;
    }

    const newRow = {
      rawMaterialId: id,
      nameEnglish: rawItem.nameEnglish || "",
      nameGujarati: rawItem.nameGujarati || "",
      nameHindi: rawItem.nameHindi || "",
      item_name: resolveLocalizedName(rawItem, currentLanguage),
      qty: "",
      unit: rawItem.unit?.nameEnglish || rawItem.unit || "",
    };
    setItems((prev) => [...prev, newRow]);
  };

 const handleGridQtyChange = (rawItem, value) => {
  const id = rawItem.id || rawItem.rawMaterialId || 0;

  setItems((prev) => {
    const idx = prev.findIndex((i) => i.rawMaterialId === id);
    const isEmpty = value === "" || parseFloat(value) <= 0;

    if (idx === -1) {
      if (isEmpty) return prev;
      return [
        ...prev,
        {
          rawMaterialId: id,
          nameEnglish: rawItem.nameEnglish || "",
          nameGujarati: rawItem.nameGujarati || "",
          nameHindi: rawItem.nameHindi || "",
          item_name: resolveLocalizedName(rawItem, currentLanguage),
          qty: value,
          unit: rawItem.unit?.nameEnglish || rawItem.unit || "",
        },
      ];
    }

    const existing = prev[idx];

    if (isEmpty) {
      if (isEdit && existing.originalQty > 0) return prev;
      return prev.filter((_, i) => i !== idx);
    }

    const updated = [...prev];
    updated[idx] = { ...existing, qty: value };
    return updated;
  });
};

  const getGridQty = (rawItem) => {
    const id = rawItem.id || rawItem.rawMaterialId || 0;
    const found = items.find((i) => i.rawMaterialId === id);
    return found?.qty ?? "";
  };

  const updateItemQty = (rawMaterialId, value) => {
  setItems((prev) => {
    const idx = prev.findIndex((i) => i.rawMaterialId === rawMaterialId);
    if (idx === -1) return prev;
    const existing = prev[idx];

    const updated = [...prev];
    updated[idx] = { ...existing, qty: value };
    return updated;
  });
};

  const handleDeleteItem = (rawMaterialId) => {
    setItems((prev) => prev.filter((i) => i.rawMaterialId !== rawMaterialId));
  };

 const allowedStockTypes = filterStockTypes(stockTypes);

const typeOptions = allowedStockTypes.map((t) => ({
  label: getLocalizedName(t),
  value: t.stocktypeid ?? t.stockTypeId ?? t.id,
}));

  const formatDateForApi = (date) => {
    if (!date) return "";
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    return `${d}/${m}/${date.getFullYear()}`;
  };

  useEffect(() => {
    GetRawMaterialcategory(userId)
      .then((res) => {
        const list = res?.data?.data?.["Raw Material Category Details"] ?? [];
        setCategoryList(list);
      })
      .catch((err) => console.error("Failed to fetch raw material categories:", err));
  }, []);

  const handleSave = async () => {
    // if (!form.party_id) {
    //   Swal.fire({ icon: "warning", title: "Validation", text: "Please select a party.", confirmButtonColor: "#3085d6" });
    //   return;
    // }
    // if (!form.stock_type_id) {
    //   Swal.fire({ icon: "warning", title: "Validation", text: "Please select a stock type.", confirmButtonColor: "#3085d6" });
    //   return;
    // }

    if (isBackDateLocked && form.date) {
  const todayStr = new Date().toISOString().split("T")[0];
  const selectedStr = formatDateForApi(form.date).split("/").reverse().join("-"); // DD/MM/YYYY → YYYY-MM-DD
  if (selectedStr < todayStr) {
    Swal.fire({ icon: "warning", title: "Validation", text: "Back-dated entries are not allowed.", confirmButtonColor: "#3085d6" });
    return;
  }
}
    if (items.length === 0) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Please add at least one item.", confirmButtonColor: "#3085d6" });
      return;
    }
    const itemsWithQty = items.filter((i) => i.qty && parseFloat(i.qty) > 0);
    if (itemsWithQty.length === 0) {
      Swal.fire({ icon: "warning", title: "Validation", text: "Please enter a quantity for at least one item.", confirmButtonColor: "#3085d6" });
      return;
    }
    try {
      setSaving(true);
      const payload = {
        id: isEdit ? editData.id : 0,
        userId: parseInt(userId),
        voucher: form.voucher,
        crdate: formatDateForApi(form.date),
        partyId: form.party_id,
        stockTypeId: form.stock_type_id,
        invoicetype: form.invoice_type,
        remarks: form.remark,
        details: itemsWithQty.map((item) => ({
          rawMaterialId: item.rawMaterialId || 0,
          qty: parseFloat(item.qty) || 0,
        })),
      };

      await AddChefReq(payload);
      await sendLog("SAVE_SUCCESS", itemsWithQty);

      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: isEdit ? "Chef Requisition updated successfully." : "Chef Requisition saved successfully.",
        confirmButtonColor: "#16a34a",
      });
      navigate("/stock-management/chef-requisition");
    } catch (error) {
      console.error("Save failed:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to save Chef Requisition. Please try again.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    "w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all";
  const labelClass = "text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 p-6 font-sans">
      <div className="mx-auto space-y-5">
        {/* ── Chef Requisition Information Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-visible">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-green-700">
                <FileText size={17} className="text-white" />
              </div>
              <FormattedMessage
                id={isEdit ? "CHEF_REQUISITION.EDIT" : "CHEF_REQUISITION.ADD"}
                defaultMessage={isEdit ? "Edit Chef Requisition" : "Add Chef Requisition"}
                />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddItemModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Plus size={16} />
                <FormattedMessage
                  id="RAW_MATERIAL.ADD"
                  defaultMessage="New Raw Material"
                />
              </button>
              <button
                onClick={() => navigate("/stock-management/chef-requisition")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition-colors shadow-sm"
              >
              <FormattedMessage
                  id="COMMON.BACK"
                  defaultMessage="Back"
              />
                <ArrowLeft size={16} />
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-3 gap-x-6 gap-y-4">
            {isEdit && (
              <div>
                <label className={labelClass}>
                  <Hash size={16} /> CR Code
                </label>
                <input name="voucher" disabled value={form.voucher} className={fieldClass} />
              </div>
            )}

            <div>
              <label className={labelClass}>
                <Calendar size={16} /> <FormattedMessage
                  id="COMMON.DATE"
                  defaultMessage="Date"
                />
              </label>
              <DatePicker
                selected={form.date}
                onChange={(date) => setForm((prev) => ({ ...prev, date }))}
                dateFormat="dd/MM/yyyy"
                className={fieldClass}
                wrapperClassName="w-full"
                    minDate={isBackDateLocked ? new Date() : undefined}

                autoComplete="off"
              />
            </div>

            <div className={isEdit ? "col-span-1" : "col-span-2"}>
              <label className={labelClass}>
                <User size={16} /> <FormattedMessage
                  id="COMMON.PARTY_NAME"
                  defaultMessage="Party Name"
                />
              </label>
              <Select
                showSearch
                allowClear
                placeholder="Search party…"
                style={{ width: "100%", height: "38px" }}
                value={form.party_id }
                onChange={(val, option) => setForm((prev) => ({ ...prev, party_id: val, party_name: option?.label || "" }))}
                filterOption={(input, option) => option?.searchText?.toLowerCase().includes(input.toLowerCase())}
                options={supplier.map((s) => ({
                  value: s.party.id,
                  label: getLocalizedName(s.party),
                  searchText: `${s.party.nameEnglish || ""} ${s.party.nameGujarati || ""} ${s.party.nameHindi || ""} ${s.venue?.nameEnglish || ""}`,
                  raw: s,
                }))}
                optionRender={(option) => {
                  const s = option.data.raw;
                  return (
                    <div className="flex flex-col py-0.5">
                      <span className="font-semibold text-slate-800 text-sm">{getLocalizedName(s.party)}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {s.eventStartDateTime && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Calendar size={11} />
                            {s.eventStartDateTime.split(" ")[0]}
                          </span>
                        )}
                        {s.venue?.nameEnglish && <span className="text-xs text-blue-500 font-medium">· {getLocalizedName(s.venue)}</span>}
                      </div>
                    </div>
                  );
                }}
              />
            </div>

            <div>
              <label className={labelClass}>
                <Tag size={16} /> <FormattedMessage
                  id="COMMON.STOCK_TYPE"
                  defaultMessage="Stock Type"
                  />
              </label>
              <Select
                showSearch
                allowClear
                placeholder="Select Type"
                style={{ width: "100%", height: "38px" }}
                options={typeOptions}
                value={form.stock_type_id || undefined}
                onChange={(value) => setForm((prev) => ({ ...prev, stock_type_id: value }))}
                filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
              />
            </div>

            <div className="col-span-3">
              <label className={labelClass}>
                <AlignLeft size={16} /> <FormattedMessage
                  id="COMMON.REMARKS"
                  defaultMessage="Remarks"
                  />
              </label>
              <input
                name="remark"
                value={form.remark}
                onChange={(e) => setForm((prev) => ({ ...prev, remark: e.target.value }))}
                placeholder="Optional remark..."
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        {/* ── Chef Requisition Details Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary">
                <ShoppingCart size={17} className="text-white" />
              </div>
              <h2 className="text-blue-900 font-bold text-base tracking-tight">
                  <FormattedMessage
                  id="CHEF_REQUISITION.DETAILS"
                  defaultMessage="Chef Requisition Details"
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
              className={`flex items-center gap-2 px-5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-sm
                ${saving ? "bg-gray-400 cursor-not-allowed" : "bg-green-700 hover:opacity-90"}`}
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} /> 
                  <FormattedMessage
                    id={isEdit ? "COMMON.UPDATE" : "COMMON.SAVE"}
                    defaultMessage={isEdit ? "Update" : "Save"}
                  />
                </>
              )}
            </button>
          </div>

          {/* ── Search Bar ── */}
          <div className="sticky top-0 z-999 px-6 py-3 bg-slate-50/95 backdrop-blur-sm border-b border-slate-100 flex items-center gap-3">
            {/* Category filter — includes "All" */}
            <div className="shrink-0">
              <Select
                showSearch
                allowClear
                placeholder="Filter by category"
                style={{ width: 220, height: "34px" }}
                value={selectedCategoryId || "ALL"}
                onChange={(value) => {
                  const catId = value ?? "ALL";
                  setSelectedCategoryId(catId);
                  setSearchQuery("");
                  setMenuItems([]);
                  setDropdownPage(1);
                  setHasMore(false);
                  // Fetching for the new category is handled by the debounced
                  // useEffect below (keyed on selectedCategoryId) — don't fetch here too.
                }}
                filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                options={[
                  { label: "All", value: "ALL" },
                  ...categoryList.map((c) => ({
                    label: getLocalizedName(c),
                    value: c.id,
                  })),
                ]}
              />
            </div>

            {/* Plain filter box — narrows the grid when a specific category is selected */}
            {selectedCategoryId && selectedCategoryId !== "ALL" && (
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search item name..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                ) : (
                  loadingItems && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )
                )}
              </div>
            )}

            {/* Search & add dropdown — only used in "All" mode */}
            {selectedCategoryId === "ALL" && (
              <div className="relative flex-1 max-w-md">
                <Select
                  showSearch
                  placeholder="Search & add item..."
                  value={undefined}
                  searchValue={searchQuery}
                  filterOption={false}
                  onSearch={(value) => setSearchQuery(value)}
                  onSelect={(value, option) => {
                    handleSelectItem(option.raw);
                  }}
                  notFoundContent={loadingItems ? "Loading..." : searchQuery.trim() ? "No items found" : "Type to search"}
                  style={{ width: "100%" }}
                  options={menuItems.map((item) => {
                    const isAdded = items.some((i) => i.rawMaterialId === item.id);
                    return {
                      value: item.id,
                      label: (
                        <div className="flex justify-between">
                          <span className={isAdded ? "text-gray-400" : ""}>{getLocalizedName(item)}</span>
                          <div className="flex gap-2 items-center">
                            {item.unit?.nameEnglish && <span className="text-xs text-gray-400">{item.unit.nameEnglish}</span>}
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
                    if (target.scrollTop + target.offsetHeight >= target.scrollHeight - 10 && hasMore && !loadingMore) {
                      FetchSearchDropdown(dropdownPage + 1, true, selectedCategoryId);
                    }
                  }}
                />
                {loadingItems && (
                  <div className="absolute right-8 top-1/2 -translate-y-1/2">
                    <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Grid: full catalog for a specific category ── */}
          {selectedCategoryId && selectedCategoryId !== "ALL" && (
            <div className="px-6 py-3 border-b border-slate-100">
              {loadingItems ? (
                <div className="flex items-center gap-2 text-slate-400 text-sm py-4">
                  <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  Loading items...
                </div>
              ) : menuItems.length === 0 ? (
                <p className="text-slate-400 text-sm py-4">No items found.</p>
              ) : (
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-50 border-b border-slate-100">
                    {[0, 1, 2].map((col) => (
                      <div
                        key={col}
                        className={`grid grid-cols-[2.5rem_1fr_6rem_4.5rem] px-3 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider ${
                          col > 0 ? "md:border-l md:border-slate-100" : ""
                        }`}
                      >
                        <span className="text-center">Sr</span>
                        <span>Item Name</span>
                        <span className="text-center">Qty</span>
                        
                        <span className="text-center">Unit</span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="max-h-[520px] overflow-y-auto"
                    onScroll={(e) => {
                      const el = e.target;
                      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40 && hasMore && !loadingMore) {
                        FetchSearchDropdown(dropdownPage + 1, true, selectedCategoryId);
                      }
                    }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3">
                      {menuItems.map((rawItem, i) => {
                        const qtyVal = getGridQty(rawItem);
                        const isFilled = qtyVal !== "" && parseFloat(qtyVal) > 0;
                        const col = i % 3;
                        const displayName = getLocalizedName(rawItem);
                        return (
                          <div
                            key={rawItem.id ?? i}
                            className={`grid grid-cols-[2.5rem_1fr_6rem_4.5rem] items-center px-3 py-2 border-b border-slate-50 transition-colors ${
                              col > 0 ? "md:border-l md:border-slate-100" : ""
                            } ${isFilled ? "bg-emerald-50/40" : "hover:bg-blue-50/20"}`}
                          >
                            <span className="text-center text-xs text-slate-400 font-medium">{i + 1}</span>
                            <span className="font-semibold text-slate-800 text-sm truncate pr-2" title={displayName}>
                              {displayName}
                            </span>
                            <input
                              type="tel"
                              value={qtyVal}
                              onChange={(e) => handleGridQtyChange(rawItem, e.target.value)}
                              placeholder="0"
                              className={`w-full px-2 py-1 text-sm border rounded-lg text-center transition-all focus:outline-none focus:ring-1
                                ${
                                  isFilled
                                    ? "border-emerald-300 bg-white text-emerald-700 focus:border-emerald-400 focus:ring-emerald-200"
                                    : "border-blue-300 bg-blue-50 text-blue-700 placeholder-blue-400 focus:border-blue-400 focus:ring-blue-200"
                                }`}
                            />
                            <span className="text-center text-xs text-slate-500 font-medium truncate">
                              {rawItem.unit?.nameEnglish || (typeof rawItem.unit === "string" ? rawItem.unit : "—")}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {loadingMore && (
                      <div className="flex items-center justify-center gap-2 py-3 border-t border-slate-100 text-slate-400 text-xs font-medium">
                        <div className="w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                        Loading more items...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Grid: "All" mode — only items the user has explicitly searched & added ── */}
          {selectedCategoryId === "ALL" && (
            <div className="px-6 py-3 border-b border-slate-100">
              {items.length === 0 ? (
                <div className="px-4 py-14 text-center text-slate-400 text-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Package size={36} className="text-slate-200" />
                    <p className="font-medium text-slate-400">
                      <FormattedMessage 
                      id="COMMON.NO_ITEMS_ADDED_YET" 
                      defaultMessage="No items added yet" 
                      />
                    </p>
                    <p className="text-xs text-slate-300">
                      <FormattedMessage
                        id="COMMON.SEARCH_AND_ADD_ITEMS"
                        defaultMessage="Search and add items from the dropdown above"
                      />
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-slate-100 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 bg-slate-50 border-b border-slate-100">
                    {[0, 1, 2].map((col) => (
                      <div
                        key={col}
                        className={`grid grid-cols-[2.5rem_1fr_6rem_4.5rem_2rem] px-3 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider ${
                          col > 0 ? "md:border-l md:border-slate-100" : ""
                        }`}
                      >
                        <span className="text-center">Sr</span>
                        <span>Item Name</span>
                        <span className="text-center">Qty</span>
                        <span className="text-center">Unit</span>
                        <span></span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3">
                    {items.map((item, i) => {
                      const qtyVal = item.qty ?? "";
                      const isFilled = qtyVal !== "" && parseFloat(qtyVal) > 0;
                      const col = i % 3;
                      const displayName = getLocalizedName(item);
                      return (
                        <div
                          key={item.rawMaterialId ?? i}
                          className={`grid grid-cols-[2.5rem_1fr_6rem_4.5rem_2rem] items-center px-3 py-2 border-b border-slate-50 transition-colors group ${
                            col > 0 ? "md:border-l md:border-slate-100" : ""
                          } ${isFilled ? "bg-emerald-50/40" : "hover:bg-blue-50/20"}`}
                        >
                          <span className="text-center text-xs text-slate-400 font-medium">{i + 1}</span>
                          <span className="font-semibold text-slate-800 text-sm truncate pr-2" title={displayName}>
                            {displayName}
                          </span>
                          <input
                            type="tel"
                            value={qtyVal}
                            onChange={(e) => updateItemQty(item.rawMaterialId, e.target.value)}
                            placeholder="0"
                            className={`w-full px-2 py-1 text-sm border rounded-lg text-center transition-all focus:outline-none focus:ring-1
                              ${
                                isFilled
                                  ? "border-emerald-300 bg-white text-emerald-700 focus:border-emerald-400 focus:ring-emerald-200"
                                  : "border-blue-300 bg-blue-50 text-blue-700 placeholder-blue-400 focus:border-blue-400 focus:ring-blue-200"
                              }`}
                          />
                          <span className="text-center text-xs text-slate-500 font-medium truncate">{item.unit || "—"}</span>
                          <button
                            onClick={() => handleDeleteItem(item.rawMaterialId)}
                            className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all justify-self-center"
                          >
                            <X size={12} className="text-red-500" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {!selectedCategoryId && (
            <div className="px-6 py-14 text-center text-slate-400 text-sm">
              <div className="flex flex-col items-center gap-2">
                <Package size={36} className="text-slate-200" />
                <p className="font-medium text-slate-400">No category selected</p>
                <p className="text-xs text-slate-300">Choose "All" or a category above to see items</p>
              </div>
            </div>
          )}
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

export default AddChefRequisition;