import { useState, useMemo, useEffect, useRef } from "react";
import CategoryListpackage from "./component/CategoryListpackage";
import MenuItemGridPackage from "./component/MenuItemGridPackage";
import SelectedItemPackage from "./component/SelectedItemPackage";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AddDecorPackage as AddDecorPackageApi,
  GetAllDecorItem,
  GetAllDecorCategory,
  Translateapi,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import MultiLangInputBox from "../../../../components/form-inputs/MultiLangInputBox";
import { extractTranslations } from "@/utils/langConfig";
import { GetDecorPackageById } from "../../../../services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import { getLangConfig } from "@/utils/langConfig";

function AddDecorPackage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packageId = searchParams.get("id");
  const intl = useIntl();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [categoryItemCounts, setCategoryItemCounts] = useState({});
  const [categoryOrder, setCategoryOrder] = useState([]);
  const [allDecorItems, setAllDecorItems] = useState([]);
  const [isLoadingPackage, setIsLoadingPackage] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState(0);
  const debounceRef = useRef(null);

  const [formData, setFormData] = useState({
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
    price: "",
  });
  const [errors, setErrors] = useState({});


const getLocalizedName = (obj, locale) => {
  if (!obj) return "";
  if (locale === "hi") return obj.nameHindi || obj.nameEnglish;
  if (locale === "gu") return obj.nameGujarati || obj.nameEnglish;
  return obj.nameEnglish;
};

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchAllDecorItems();
  }, []);

  useEffect(() => {
    if (packageId) loadPackageData(packageId);
  }, [packageId]);

  // ─── Auto-translate English name ───────────────────────────────────────────
  useEffect(() => {
    if (!formData.nameEnglish?.trim()) {
      setFormData((prev) => ({ ...prev, nameGujarati: "", nameHindi: "" }));
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      Translateapi(formData.nameEnglish)
        .then((res) => {
          const { regional, hindi } = extractTranslations(res.data);
          setFormData((prev) => ({
            ...prev,
            nameGujarati: regional || prev.nameGujarati,
            nameHindi: hindi || prev.nameHindi,
          }));
        })
        .catch(() => console.warn("Translation failed"));
    }, 500);
  }, [formData.nameEnglish]);

  // ─── Fetch categories ──────────────────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      const userId = localStorage.getItem("userId") || 1;
      const res = await GetAllDecorCategory(userId);
      if (res?.data) {
        const fetched = res?.data?.data?.["Decore Main Category Details"] || [];
        setCategories(fetched);
        setCategoryItemCounts((prev) => {
          const counts = { ...prev };
          counts["all"] = counts["all"] ?? 0;
          fetched.forEach((cat) => {
            const key = String(cat.id);
            counts[key] = counts[key] ?? 0;
          });
          return counts;
        });
      }
    } catch (err) {
      console.error("Error loading decor categories:", err);
    }
  };

  // ─── Fetch all decor items (flat list) ────────────────────────────────────
  const fetchAllDecorItems = async () => {
    try {
      const userId = localStorage.getItem("userId") || 1;
      const res = await GetAllDecorItem(userId);
      if (res?.data) {
        setAllDecorItems(res.data.data.items || []);
      }
    } catch (err) {
      console.error("Error loading decor items:", err);
    }
  };

  // ─── Load existing package (edit mode) ───────────────────────────────────
  const loadPackageData = async (id) => {
    setIsLoadingPackage(true);
    try {
      // Use AddDecorPackage with id to GET — adjust if you have a separate GetById
      // Assuming the same addorupdate endpoint with GET or a dedicated GetDecorPackageById
      // Replace below with GetDecorPackageById(id) when available
      const response = await GetDecorPackageById(Number(id)); // placeholder — swap with real GET
      if (response?.data?.success && response.data.data) {
        const packageData =
  response?.data?.data?.["Decore Package Details"]?.[0];

if (!packageData) {
  throw new Error("Package data not found");
}

        setFormData({
          nameEnglish: packageData.nameEnglish || "",
          nameGujarati: packageData.nameGujarati || "",
          nameHindi: packageData.nameHindi || "",
          price: packageData.price?.toString() || "",
        });

        const itemsToSelect = [];
        const restoredCategoryIds = new Set();
        const sortedDetails = [...(packageData.decorePackageDetails || [])].sort(
          (a, b) => a.menuSortOrder - b.menuSortOrder,
        );

        setCategoryOrder(sortedDetails.map((d) => String(d.decoreMainCategoryId)));

        // Fetch fresh items list for lookup
        const userId = localStorage.getItem("userId") || 1;
        const itemsRes = await GetAllDecorItem(userId);
        const allItems = itemsRes?.data?.items || [];

        for (const detail of sortedDetails) {
          const categoryId = String(detail.decoreMainCategoryId);
          restoredCategoryIds.add(categoryId);

          const sortedItems = [...(detail.items || [])].sort(
            (a, b) => a.itemSortOrder - b.itemSortOrder,
          );

          for (const item of sortedItems) {
            const fullItem = allItems.find((i) => i.id === item.decoreItemId);
            itemsToSelect.push(
              fullItem
                ? {
                    ...fullItem,
                    rate: item.itemPrice || 0,
                    category: categoryId,
                  }
                : {
                    id: item.decoreItemId,
                    nameEnglish: item.nameEnglish || `Item ${item.decoreItemId}`,
                    rate: item.itemPrice || 0,
                    category: categoryId,
                  },
            );
          }
        }

        setSelectedItems(itemsToSelect);
        setSelectedCategories(restoredCategoryIds);
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load decor package data" });
    } finally {
      setIsLoadingPackage(false);
    }
  };

  // ─── Category toggle ───────────────────────────────────────────────────────
  const handleToggleCategory = (categoryId) => {
    const id = String(categoryId);
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setSelectedItems((items) => items.filter((item) => String(item.category) !== id));
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // ─── Item toggle ───────────────────────────────────────────────────────────
  const handleToggleItem = (item) => {
    const existingIndex = selectedItems.findIndex((s) => s.id === item.id);
    if (existingIndex !== -1) {
      setSelectedItems(selectedItems.filter((_, idx) => idx !== existingIndex));
      return;
    }
    const categoryId =
      selectedCategory !== "all"
        ? String(selectedCategory)
        : String(item.decoreMainCategoryId || item.category);
    setSelectedCategories((prev) => new Set([...prev, categoryId]));
    setSelectedItems([...selectedItems, { ...item, rate: 0, category: categoryId }]);
  };

  const handleRemoveItem = (index) =>
    setSelectedItems(selectedItems.filter((_, idx) => idx !== index));

  const handleUpdateRate = (index, rate) => {
    const updated = [...selectedItems];
    updated[index] = { ...updated[index], rate };
    setSelectedItems(updated);
  };

  const handleReorder = (reorderedItems) => setSelectedItems([...reorderedItems]);

  const handleReorderCategories = (newCategoryOrder) => {
  setCategoryOrder(newCategoryOrder);
};

  // ─── Form input ────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ─── Build payload ─────────────────────────────────────────────────────────
  const buildPackagePayload = () => {
    const userId = Number(localStorage.getItem("userId"));

    const grouped = {};
    selectedItems.forEach((item) => {
      const cat = String(item.category);
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(item);
    });

  const allCategoryIds =
  categoryOrder.length > 0
    ? categoryOrder.filter((id) =>
        selectedCategories.has(String(id))
      )
    : [
        ...new Set([
          ...[...selectedCategories].map(String),
          ...selectedItems.map((i) => String(i.category)),
        ]),
      ];

  const decorePackageDetails = allCategoryIds.map((catId) => {
  const items = grouped[catId] || [];

  return {
    decoreMainCategoryId: Number(catId),

    menuSortOrder:
      allCategoryIds.indexOf(String(catId)) + 1,

    items: items.map((it, i) => ({
      decoreItemId: Number(it.id),
      itemPrice: Number(it.rate || 0),
      itemSortOrder: i + 1,
    })),
  };
});

    return {
      id: packageId ? Number(packageId) : 0,
      nameEnglish: formData.nameEnglish,
      nameGujarati: formData.nameGujarati,
      nameHindi: formData.nameHindi,
      price: Number(formData.price),
      sequence: 1,
      userId,
      
      decorePackageDetails,
    };
  };

  // ─── Save / cancel ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    const newErrors = {};
    if (!formData.nameEnglish?.trim()) newErrors.nameEnglish = "Package name is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    const payload = buildPackagePayload();
    try {
      const response = await AddDecorPackageApi(payload);
      if (response?.data?.success === true) {
        Swal.fire({
          icon: "success",
          title: packageId ? "Package Updated!" : "Package Saved!",
          text: response.data.msg,
          timer: 2000,
          showConfirmButton: false,
        }).then(() => navigate("/master/decor-package"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.data?.msg || "Failed to save package",
        });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "An error occurred while saving the package" });
    }
  };

  const handleCancel = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "All changes will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, cancel",
      cancelButtonText: "No, stay",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) navigate("/master/decor-package");
    });
  };

  // ─── Memos ─────────────────────────────────────────────────────────────────
  const selectedItemIds = useMemo(
    () => new Set(selectedItems.map((item) => item.id)),
    [selectedItems],
  );

 const categoryMap = useMemo(() => {
  const map = {};
  map["all"] = intl.formatMessage({ id: "COMMON.ALL", defaultMessage: "All" });
  categories.forEach((cat) => {
    map[cat.id] = getLocalizedName(cat, intl.locale);
  });
  return map;
}, [categories, intl.locale]);

  // Filter items shown in grid based on selected category
  const filteredDecorItems = useMemo(() => {
    if (selectedCategory === "all") return allDecorItems;
    return allDecorItems.filter(
      (item) => String(item.decoreMainCategoryId) === String(selectedCategory),
    );
  }, [allDecorItems, selectedCategory]);

  const selectedCount = selectedItems.length;
  const categoryCount = selectedCategories.size;

  // ─── Loading ───────────────────────────────────────────────────────────────
  if (isLoadingPackage) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading package data...</p>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full" style={{ height: "100vh", overflow: "hidden" }}>

      {/* ── Top Header Bar ── */}
      <div className="flex-shrink-0 px-4 py-2 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/master/decor-package")}
              className="btn btn-sm border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 flex items-center gap-1"
            >
              <i className="ki-filled ki-left text-sm" />
 <FormattedMessage id="COMMON.BACK" defaultMessage="Back" />            </button>
            <h2 className="text-lg font-semibold text-gray-900">
{packageId ? (
    <FormattedMessage id="DECOR_PACKAGE.EDIT_TITLE" defaultMessage="Edit Decor Package" />
  ) : (
    <FormattedMessage id="DECOR_PACKAGE.ADD_TITLE" defaultMessage="Add Decor Package" />
  )}            </h2>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleCancel}
              className="btn border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 text-sm px-4 py-2 rounded-lg"
            >
  <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />            </button>
            <button
              onClick={handleSave}
              className="btn bg-primary text-white text-sm px-6 py-2 rounded-lg hover:opacity-90 font-semibold"
            >
 {packageId ? (
    <FormattedMessage id="DECOR_PACKAGE.UPDATE_PACKAGE" defaultMessage="Update Package" />
  ) : (
    <FormattedMessage id="DECOR_PACKAGE.SAVE_PACKAGE" defaultMessage="Save Package" />
  )}            </button>
          </div>
        </div>

        {/* ── Package info row ── */}
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div className="md:col-span-3">
              <MultiLangInputBox
label={intl.formatMessage({ id: "DECOR_PACKAGE.PACKAGE_NAME", defaultMessage: "Package Name" })}
                 formData={formData}
                setFormData={setFormData}
                cols={3}
                keys={{ english: "nameEnglish", regional: "nameGujarati", hindi: "nameHindi" }}
                error={errors.nameEnglish}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
  <FormattedMessage id="DECOR_PACKAGE.PRICE_LABEL" defaultMessage="Price (₹) *" />              </label>
              <input
                type="tel"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className={`input w-full ${errors.price ? "border-red-500" : ""}`}
                placeholder="0"
                min="0"
              />
              {errors.price && <p className="text-red-500 text-xs mt-0.5">{errors.price}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile tab bar ── */}
      <div className="flex md:hidden border-b border-gray-200 bg-white flex-shrink-0">
        {["Categories", "Decor Items", "Selected"].map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveMobileTab(i)}
            className={`flex-1 py-3 text-sm font-medium transition
              ${activeMobileTab === i ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab}
            {tab === "Selected" && selectedCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-blue-600 text-white rounded-full">
                {selectedCount}
              </span>
            )}
            {tab === "Categories" && categoryCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-green-600 text-white rounded-full">
                {categoryCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Main 3-panel layout ── */}
      <div className="flex-1 overflow-hidden">

        {/* DESKTOP */}
        <div className="hidden md:grid h-full" style={{ gridTemplateColumns: "260px 1fr 340px" }}>

          {/* Panel 1: Categories */}
          <div className="border-r bg-white flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
  <FormattedMessage id="DECOR_PACKAGE.CATEGORIES" defaultMessage="Decor Categories" />              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CategoryListpackage
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categories={categories}
                setCategories={setCategories}
                categoryItemCounts={categoryItemCounts}
                onCategoryItemCountChange={(catId, count) =>
                  setCategoryItemCounts((prev) => ({ ...prev, [String(catId)]: Number(count) }))
                }
                onReorderCategories={handleReorderCategories}
                onAddCategory={null} // no add-category modal for decor; pass handler if needed
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
              />
            </div>
          </div>

          {/* Panel 2: Decor items grid (flat filtered list) */}
          <div className="flex flex-col overflow-hidden border-r bg-gray-50">
            <div className="px-3 py-2 border-b bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
  <FormattedMessage id="DECOR_PACKAGE.ITEMS" defaultMessage="Decor Items" />              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <DecorItemGrid
                items={filteredDecorItems}
                selectedItemIds={selectedItemIds}
                onToggleItem={handleToggleItem}
              />
            </div>
          </div>

          {/* Panel 3: Selected items */}
          <div className="flex flex-col overflow-hidden bg-white">
            <div className="px-3 py-2 border-b bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                 <FormattedMessage id="DECOR_PACKAGE.SELECTED_ITEMS" defaultMessage="Selected Items" />
              </span>
              {selectedCount > 0 && (
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                  {selectedCount} items
                </span>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <SelectedItemPackage
                selectedItems={selectedItems}
                onRemoveItem={handleRemoveItem}
                onUpdateRate={handleUpdateRate}
                categoryMap={categoryMap}
                categoryItemCounts={categoryItemCounts}
                onReorder={handleReorder}
                onOpenNotes={null}         // decor has no notes
                categoryOrder={categoryOrder}
                onReorderCategories={handleReorderCategories}
                onOpenCategoryNotes={null} // decor has no category notes
                selectedCategories={selectedCategories}
                onRemoveCategory={handleToggleCategory}
              />
            </div>
          </div>
        </div>

        {/* MOBILE */}
        <div className="md:hidden h-full overflow-hidden">
          {activeMobileTab === 0 && (
            <div className="h-full overflow-y-auto">
              <CategoryListpackage
                selectedCategory={selectedCategory}
                onSelectCategory={(val) => { setSelectedCategory(val); setActiveMobileTab(1); }}
                categories={categories}
                setCategories={setCategories}
                categoryItemCounts={categoryItemCounts}
                onCategoryItemCountChange={(catId, count) =>
                  setCategoryItemCounts((prev) => ({ ...prev, [String(catId)]: Number(count) }))
                }
                onReorderCategories={handleReorderCategories}
                onAddCategory={null}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
              />
            </div>
          )}
          {activeMobileTab === 1 && (
            <div className="h-full overflow-y-auto p-3">
              <DecorItemGrid
                items={filteredDecorItems}
                selectedItemIds={selectedItemIds}
                onToggleItem={handleToggleItem}
              />
            </div>
          )}
          {activeMobileTab === 2 && (
            <div className="h-full overflow-hidden">
              <SelectedItemPackage
                selectedItems={selectedItems}
                onRemoveItem={handleRemoveItem}
                onUpdateRate={handleUpdateRate}
                categoryMap={categoryMap}
                categoryItemCounts={categoryItemCounts}
                onReorder={handleReorder}
                onOpenNotes={null}
                categoryOrder={categoryOrder}
                onReorderCategories={handleReorderCategories}
                onOpenCategoryNotes={null}
                selectedCategories={selectedCategories}
                onRemoveCategory={handleToggleCategory}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky footer ── */}
      <div className="flex-shrink-0 border-t bg-white px-4 py-3 flex items-center justify-end">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="btn border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 text-sm px-4 py-2 rounded-lg"
          >
  <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />          </button>
          <button
            onClick={handleSave}
            className="btn bg-success text-white text-sm px-6 py-2 rounded-lg hover:opacity-90 font-semibold flex items-center gap-2"
          >
            <i className="ki-filled ki-save-2" />
             {packageId ? (
    <FormattedMessage id="DECOR_PACKAGE.UPDATE_PACKAGE" defaultMessage="Update Package" />
  ) : (
    <FormattedMessage id="DECOR_PACKAGE.SAVE_PACKAGE" defaultMessage="Save Package" />
  )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Inline DecorItemGrid ──────────────────────────────────────────────────
// Replaces MenuItemGridPackage since decor items are a flat list (no pagination/search needed).
// If your item count grows, extract this into its own file.
function DecorItemGrid({ items, selectedItemIds, onToggleItem }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.nameEnglish?.toLowerCase().includes(q));
  }, [items, search]);

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <i className="ki-filled ki-abstract-26 text-3xl mb-2" />
        <p className="text-sm">No decor items found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Search */}
      <div className="relative">
        <i className="ki-filled ki-magnifier absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search decor items..."
          className="input w-full pl-8 text-sm"
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto">
        {filtered.map((item) => {
          const isSelected = selectedItemIds.has(item.id);
          return (
            <button
              key={item.id}
              onClick={() => onToggleItem(item)}
              className={`relative text-left p-3 rounded-lg border transition text-sm
                ${isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                }`}
            >
              {isSelected && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                  <i className="ki-filled ki-check text-white text-[10px]" />
                </span>
              )}
              <p className="font-medium leading-snug line-clamp-2">{item.nameEnglish}</p>
              {item.nameGujarati && (
                <p className="text-xs text-gray-400 mt-0.5 truncate">{item.nameGujarati}</p>
              )}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 && search && (
        <p className="text-sm text-gray-400 text-center py-4">No items match "{search}"</p>
      )}
    </div>
  );
}

export default AddDecorPackage;