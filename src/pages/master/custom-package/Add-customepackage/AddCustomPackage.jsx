import { useState, useMemo, useEffect, useRef } from "react";
import CategoryListpackage from "./component/CategoryListpackage";
import MenuItemGridPackage from "./component/MenuItemGridPackage";
import SelectedItemPackage from "./component/SelectedItemPackage";
import { useNavigate, useSearchParams } from "react-router-dom";
import AddMenuCategory from "../../../../partials/modals/add-menu-category/AddMenuCategory";
import {
  AddCustomPackageapi,
  GetCustomPackageById,
  UpdateCustomPackage,
  GetAllCategoryformenu,
  Getmenuitemsusingcatidanditemname,
  Translateapi,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import AddMenuItem from "../../../../partials/modals/add-menu-item/AddMenuItem";
import MenuNotes from "../../../../partials/modals/menu-notes/MenuNotes";
import MultiLangInputBox from "../../../../components/form-inputs/MultiLangInputBox";
import { extractTranslations } from "@/utils/langConfig";

function AddCustomPackage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const packageId = searchParams.get("id");

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [categories, setCategories] = useState([]);
  const [categoryItemCounts, setCategoryItemCounts] = useState({});
  const [categoryOrder, setCategoryOrder] = useState([]);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isLoadingPackage, setIsLoadingPackage] = useState(false);
  const [menuRefreshKey, setMenuRefreshKey] = useState(0);
  const [activeMobileTab, setActiveMobileTab] = useState(0);
  const debounceRef = useRef(null);
  const [isDirty, setIsDirty] = useState(false);

  const [notesModal, setNotesModal] = useState({
    isOpen: false,
    itemIndex: null,
    notes: { itemsNotes: "", itemSlogan: "" },
  });

  const [formData, setFormData] = useState({
    nameEnglish: "",
    nameGujarati: "",
    nameHindi: "",
    price: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  useEffect(() => {
    if (packageId) loadPackageData(packageId);
  }, [packageId]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // ─── Auto-translate English name ─────────────────────────────────────────────
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

  // ─── Notes handlers ───────────────────────────────────────────────────────────
  const handleSaveNotes = (newNotes) => {
  setIsDirty(true); // ✅
  if (String(notesModal.itemIndex).startsWith("cat-")) {
    const categoryId = notesModal.itemIndex.replace("cat-", "");
    setCategoryItemCounts((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        menuInstruction: newNotes.itemsNotes || "",
      },
    }));
  } else {
    setSelectedItems((prev) =>
      prev.map((item, idx) =>
        idx === notesModal.itemIndex
          ? { ...item, itemsNotes: newNotes.itemsNotes || "", itemSlogan: newNotes.itemSlogan || "" }
          : item,
      ),
    );
  }
  setNotesModal({ isOpen: false, itemIndex: null, notes: { itemsNotes: "", itemSlogan: "" } });
};

  const handleOpenCategoryNotes = (categoryId) => {
    const entry = categoryItemCounts[categoryId];
    setNotesModal({
      isOpen: true,
      itemIndex: `cat-${categoryId}`,
      notes: { itemsNotes: typeof entry === "object" ? entry?.menuInstruction || "" : "", itemSlogan: "" },
    });
  };

  const handleOpenNotes = (index) => {
    const item = selectedItems[index];
    setNotesModal({
      isOpen: true,
      itemIndex: index,
      notes: { itemsNotes: item?.itemsNotes || "", itemSlogan: item?.itemSlogan || "" },
    });
  };

  // ─── Load existing package ────────────────────────────────────────────────────
  const loadPackageData = async (id) => {
    setIsLoadingPackage(true);
    try {
      const response = await GetCustomPackageById(id);
      if (response?.data?.success && response.data.data["Package Details"]?.[0]) {
        const packageData = response.data.data["Package Details"][0];
        setFormData({
          nameEnglish: packageData.nameEnglish || "",
          nameGujarati: packageData.nameGujarati || "",
          nameHindi: packageData.nameHindi || "",
          price: packageData.price?.toString() || "",
        });

        await fetchCategories();

        const itemsToSelect = [];
        const counts = {};
        const restoredCategoryIds = new Set();
        const sortedDetails = [...packageData.customPackageDetails].sort(
          (a, b) => a.menuSortOrder - b.menuSortOrder,
        );

        setCategoryOrder(sortedDetails.map((d) => String(d.menuId)));

        const categoryFetches = await Promise.all(
          sortedDetails.map((detail) =>
            Getmenuitemsusingcatidanditemname({
              page: 1, size: 100,
              userId: localStorage.getItem("userId") || 1,
              menuCatId: detail.menuId,
            })
              .then((res) => ({ categoryId: String(detail.menuId), items: res.data?.data?.items || [] }))
              .catch(() => ({ categoryId: String(detail.menuId), items: [] })),
          ),
        );

        const categoryItemsMap = {};
        categoryFetches.forEach(({ categoryId, items }) => {
          categoryItemsMap[categoryId] = items;
        });

        for (const detail of sortedDetails) {
          const categoryId = String(detail.menuId);
          restoredCategoryIds.add(categoryId);
          if (detail.anyItem) counts[categoryId] = detail.anyItem;

          const sortedItems = [...detail.customPackageMenuItemDetails].sort(
            (a, b) => a.itemSortOrder - b.itemSortOrder,
          );
          const fetchedItems = categoryItemsMap[categoryId] || [];

          for (const item of sortedItems) {
            const fullItem = fetchedItems.find((i) => i.id === item.menuItemId);
            itemsToSelect.push(
              fullItem
                ? { ...fullItem, rate: item.itemPrice || 0, category: categoryId, itemsNotes: item.itemInstruction || "", itemSlogan: "" }
                : { id: item.menuItemId, nameEnglish: item.itemName, rate: item.itemPrice || 0, category: categoryId, itemsNotes: item.itemInstruction || "", itemSlogan: "", menuCategory: { id: detail.menuId, nameEnglish: detail.menuName } },
            );
          }
        }

        setSelectedItems(itemsToSelect);
        setCategoryItemCounts(counts);
        setSelectedCategories(restoredCategoryIds);
        setIsDirty(false); 
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: "Failed to load package data" });
    } finally {
      setIsLoadingPackage(false);
    }
  };

  // ─── Fetch categories ─────────────────────────────────────────────────────────
  const fetchCategories = async () => {
    try {
      const userId = localStorage.getItem("userId") || 1;
      const res = await GetAllCategoryformenu(userId);
      if (res?.data) {
        const fetchedCategories = res.data.data["Menu Category Details"] || [];
        setCategories(fetchedCategories);
        const counts = {};
        counts["all"] = categoryItemCounts["all"] ?? 0;
        fetchedCategories.forEach((cat) => {
          const key = String(cat.id);
          counts[key] = categoryItemCounts[key] ?? 0;
        });
        setCategoryItemCounts(counts);
      }
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const refreshMenuItems = () => setMenuRefreshKey((prev) => prev + 1);

  // ─── Category toggle ──────────────────────────────────────────────────────────
// ─── Category toggle ──────────────────────────────────────────────────────────
const handleToggleCategory = (categoryId) => {
  const id = String(categoryId);
  setIsDirty(true); // ✅
  setSelectedCategories((prev) => {
    const next = new Set(prev);
    if (next.has(id)) {
      next.delete(id);
      setSelectedItems((items) => items.filter((item) => String(item.category) !== id));
      setCategoryOrder((prevOrder) => prevOrder.filter((catId) => String(catId) !== id));
      setCategoryItemCounts((prevCounts) => {
        const nextCounts = { ...prevCounts };
        delete nextCounts[id];
        return nextCounts;
      });
    } else {
      next.add(id);
    }
    return next;
  });
};

// ─── Item toggle ──────────────────────────────────────────────────────────────
const handleToggleItem = (item) => {
  setIsDirty(true); // ✅
  const existingIndex = selectedItems.findIndex((s) => s.id === item.id);
  if (existingIndex !== -1) {
    setSelectedItems(selectedItems.filter((_, idx) => idx !== existingIndex));
    return;
  }
  const categoryId =
    selectedCategory !== "all" ? String(selectedCategory) : String(item.menuCategory?.id);
  setSelectedCategories((prev) => new Set([...prev, categoryId]));
  setSelectedItems([...selectedItems, { ...item, rate: 0, category: categoryId, itemsNotes: "", itemSlogan: "" }]);
};

const handleRemoveItem = (index) => {
  setIsDirty(true); // ✅
  setSelectedItems(selectedItems.filter((_, idx) => idx !== index));
};

const handleUpdateRate = (index, rate) => {
  setIsDirty(true); // ✅
  const updated = [...selectedItems];
  updated[index] = { ...updated[index], rate };
  setSelectedItems(updated);
};

const handleCategoryItemCountChange = (categoryId, count) => {
  setIsDirty(true); // ✅
  setCategoryItemCounts((prev) => ({ ...prev, [String(categoryId)]: Number(count) }));
};

const handleReorder = (reorderedItems) => {
  setIsDirty(true); // ✅
  setSelectedItems([...reorderedItems]);
};

const handleReorderCategories = (newOrder) => {
  setIsDirty(true); // ✅
  setCategoryOrder(newOrder);
};

// ─── Form input ───────────────────────────────────────────────────────────────
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setIsDirty(true); // ✅
  setFormData((prev) => ({ ...prev, [name]: value }));
  if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
};
  // ─── Build payload ────────────────────────────────────────────────────────────
 const buildPackagePayload = () => {
  const userId = Number(localStorage.getItem("userId"));
  const grouped = {};
  selectedItems.forEach((item) => {
    const cat = String(item.category);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

const existingOrderIds = categoryOrder.map(String);
const allKnownCategoryIds = [
  ...new Set([
    ...[...selectedCategories].map(String),
    ...selectedItems.map((i) => String(i.category)),
  ]),
];
const missingFromOrder = allKnownCategoryIds.filter(
  (id) => !existingOrderIds.includes(id),
);
// filter out any order ids that are no longer selected/have items
const allCategoryIds = [
  ...existingOrderIds.filter((id) => allKnownCategoryIds.includes(id)),
  ...missingFromOrder,
];

  const customPackageDetails = allCategoryIds.map((catId, index) => {
    const items = grouped[catId] || [];
    const countEntry = categoryItemCounts[catId];
    const anyItem = typeof countEntry === "object" ? Number(countEntry?.anyItem || 0) : Number(countEntry || 0);
    const menuInstruction = typeof countEntry === "object" ? countEntry?.menuInstruction || "" : "";

    return {
      anyItem,
      menuId: Number(catId),
      menuName: categoryMap[catId] || "Category",
      menuInstruction,
      menuSortOrder: index + 1, // use actual position in allCategoryIds, not stale categoryOrder.indexOf
      customPackageMenuItemDetails: items.map((it, i) => ({
        id: it.id || 0,
        itemInstruction: it.itemsNotes || "",
        itemName: it.itemName || it.nameEnglish,
        itemPrice: Number(it.rate || 0),
        itemSortOrder: i + 1,
        menuItemId: Number(it.id),
        userId,
      })),
    };
  });

  return {
    nameEnglish: formData.nameEnglish,
    nameGujarati: formData.nameGujarati,
    nameHindi: formData.nameHindi,
    price: Number(formData.price),
    sequence: 1,
    userId,
    customPackageDetails,
  };
};

  // ─── Save / cancel ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const payload = buildPackagePayload();
    try {
      let response;
      if (packageId) {
        response = await UpdateCustomPackage(packageId, payload);
      } else {
        response = await AddCustomPackageapi(payload);
      }
      if (response?.data?.success === true) {
        setIsDirty(false);
        Swal.fire({ icon: "success", title: packageId ? "Package Updated!" : "Package Saved!", text: response.data.msg, timer: 2000, showConfirmButton: false })
          .then(() => navigate("/master/custom-package"));
      } else {
        Swal.fire({ icon: "error", title: "Error", text: response?.data?.msg || "Failed to save package" });
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "An error occurred while saving the package" });
    }
  };

 const handleCancel = () => {
  if (!isDirty) {
    navigate("/master/custom-package");
    return;
  }
  Swal.fire({
    title: "Are you sure?", text: "All changes will be lost.", icon: "warning",
    showCancelButton: true, confirmButtonText: "Yes, cancel", cancelButtonText: "No, stay",
    confirmButtonColor: "#d33", cancelButtonColor: "#3085d6", reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) navigate("/master/custom-package");
  });
};

  // ─── Memos ────────────────────────────────────────────────────────────────────
  const selectedItemIds = useMemo(() => new Set(selectedItems.map((item) => item.id)), [selectedItems]);

  const categoryMap = useMemo(() => {
    const map = {};
    map["all"] = "All";
    categories.forEach((cat) => { map[cat.id] = cat.nameEnglish; });
    return map;
  }, [categories]);

  const selectedCount = selectedItems.length;
  const categoryCount = selectedCategories.size;

  // ─── Loading ──────────────────────────────────────────────────────────────────
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

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col w-full" style={{ height: "100vh", overflow: "hidden" }}>

      {/* ── Top Header Bar (mirrors menu planning header) ── */}
      <div className="flex-shrink-0 px-4 py-2 border-b bg-white shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-2">
          {/* Left: title + breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/master/custom-package")}
              className="btn btn-sm border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 flex items-center gap-1"
            >
              <i className="ki-filled ki-left text-sm" />
              Back
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {packageId ? "Edit Package" : "Add Package"}
            </h2>
          </div>

          {/* Right: stats + action buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            

            <button
              onClick={handleCancel}
              className="btn border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 text-sm px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn bg-primary text-white text-sm px-6 py-2 rounded-lg hover:opacity-90 font-semibold"
            >
              {packageId ? "Update Package" : "Save Package"}
            </button>
          </div>
        </div>

        {/* ── Package info row (name + price inline) ── */}
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            {/* MultiLangInputBox spans 3 cols */}
            <div className="md:col-span-3">
              <MultiLangInputBox
                label="Package Name"
                formData={formData}
                setFormData={setFormData}
                cols={3}
                keys={{ english: "nameEnglish", regional: "nameGujarati", hindi: "nameHindi" }}
                error={errors.nameEnglish}
              />
            </div>

            {/* Price in the 4th col */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Price (₹) *
              </label>
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
        {["Categories", "Menu Items", "Selected"].map((tab, i) => (
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

      {/* ── Main 3-panel layout (mirrors menu planning grid) ── */}
      <div className="flex-1 overflow-hidden">

        {/* DESKTOP: 3 panels side by side */}
        <div
          className="hidden md:grid h-full"
          style={{ gridTemplateColumns: "260px 1fr 340px" }}
        >
          {/* Panel 1: Categories */}
          <div className="border-r bg-white flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b bg-gray-50">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Categories
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CategoryListpackage
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                categories={categories}
                setCategories={setCategories}
                categoryItemCounts={categoryItemCounts}
                onCategoryItemCountChange={handleCategoryItemCountChange}
                onReorderCategories={handleReorderCategories}
                onAddCategory={() => setIsAddCategoryModalOpen(true)}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
              />
            </div>
          </div>

          {/* Panel 2: Menu items grid */}
          <div className="flex flex-col overflow-hidden border-r bg-gray-50">
            <div className="px-3 py-2 border-b bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Menu Items
              </span>
              
            </div>
            <div className="flex-1 overflow-hidden">
              <MenuItemGridPackage
                key={menuRefreshKey}
                selectedCategory={selectedCategory}
                onToggleItem={handleToggleItem}
                selectedItemIds={selectedItemIds}
                Getmenuitemsusingcatid={Getmenuitemsusingcatidanditemname}
                onAddMenuItem={() => setIsAddItemModalOpen(true)}
              />
            </div>
          </div>

          {/* Panel 3: Selected items */}
          <div className="flex flex-col overflow-hidden bg-white">
            <div className="px-3 py-2 border-b bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Selected Items
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
                onOpenNotes={handleOpenNotes}
                categoryOrder={categoryOrder}
                onReorderCategories={handleReorderCategories}
                onOpenCategoryNotes={handleOpenCategoryNotes}
                selectedCategories={selectedCategories}
                onRemoveCategory={handleToggleCategory}
              />
            </div>
          </div>
        </div>

        {/* MOBILE: one panel at a time */}
        <div className="md:hidden h-full overflow-hidden">
          {activeMobileTab === 0 && (
            <div className="h-full overflow-y-auto">
              <CategoryListpackage
                selectedCategory={selectedCategory}
                onSelectCategory={(val) => { setSelectedCategory(val); setActiveMobileTab(1); }}
                categories={categories}
                setCategories={setCategories}
                categoryItemCounts={categoryItemCounts}
                onCategoryItemCountChange={handleCategoryItemCountChange}
                onReorderCategories={handleReorderCategories}
                onAddCategory={() => setIsAddCategoryModalOpen(true)}
                selectedCategories={selectedCategories}
                onToggleCategory={handleToggleCategory}
              />
            </div>
          )}
          {activeMobileTab === 1 && (
            <div className="h-full overflow-hidden">
              <MenuItemGridPackage
                key={menuRefreshKey}
                selectedCategory={selectedCategory}
                onToggleItem={handleToggleItem}
                selectedItemIds={selectedItemIds}
                Getmenuitemsusingcatid={Getmenuitemsusingcatidanditemname}
                onAddMenuItem={() => setIsAddItemModalOpen(true)}
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
                onOpenNotes={handleOpenNotes}
                categoryOrder={categoryOrder}
                onReorderCategories={handleReorderCategories}
                onOpenCategoryNotes={handleOpenCategoryNotes}
                selectedCategories={selectedCategories}
                onRemoveCategory={handleToggleCategory}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky footer (same pattern as menu planning) ── */}
      <div className="flex-shrink-0 border-t bg-white px-4 py-3 flex items-center justify-end">
       
        <div className="flex items-center gap-2">
          <button
            onClick={handleCancel}
            className="btn border border-gray-300 text-gray-600 bg-white hover:bg-gray-100 text-sm px-4 py-2 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="btn bg-success text-white text-sm px-6 py-2 rounded-lg hover:opacity-90 font-semibold flex items-center gap-2"
          >
            <i className="ki-filled ki-save-2" />
            {packageId ? "Update Package" : "Save Package"}
          </button>
        </div>
      </div>

      {/* ── Modals ── */}
      <AddMenuCategory
        isModalOpen={isAddCategoryModalOpen}
        setIsModalOpen={setIsAddCategoryModalOpen}
        refreshData={fetchCategories}
        editData={null}
      />
      <AddMenuItem
        isModalOpen={isAddItemModalOpen}
        setIsModalOpen={setIsAddItemModalOpen}
        refreshData={refreshMenuItems}
        selectedMenuItem={null}
      />
      {notesModal.isOpen && (
        <MenuNotes
          isOpen={notesModal.isOpen}
          notes={notesModal.notes}
          onClose={() => setNotesModal({ isOpen: false, itemIndex: null, notes: null })}
          onSave={handleSaveNotes}
        />
      )}
    </div>
  );
}

export default AddCustomPackage;