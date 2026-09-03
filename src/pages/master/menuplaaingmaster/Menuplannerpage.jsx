import { useState, useEffect, useRef } from "react";
import LeftPanel from "./components/Leftpanel";
import MiddlePanel from "./components/Middlepanel";
import RightPanel from "./components/Rightpanel";
import Swal from "sweetalert2";
import {
  addupadtemenuplanningmaster,
  getmenuplanningmaster,
  GetAllMenuItems,
} from "@/services/apiServices";
import { Save, Loader2, UtensilsCrossed } from "lucide-react";
import { FormattedMessage, useIntl } from "react-intl";
 import { getLocalizedName } from "@/utils/langConfig";

const SaveButton = ({ onClick, saving, disabled, size = "md" }) => {
  const sizeClass =
    size === "sm" ? "px-4 py-2 text-xs gap-2" : "px-6 py-2.5 text-sm gap-2.5";

  return (
    <button
      onClick={onClick}
      disabled={saving || disabled}
      className={`relative flex items-center font-bold text-white rounded-xl shadow-lg transition-all duration-200 overflow-hidden group ${sizeClass}
        ${
          disabled
            ? "bg-slate-300 cursor-not-allowed shadow-none"
            : "bg-primary hover:from-blue-700 hover:to-blue-600 hover:shadow-xl hover:shadow-blue-200/60 active:scale-95"
        }`}
    >
      {!disabled && (
        <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/15 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500 rounded-xl" />
      )}
      {saving ? (
        <Loader2 size={size === "sm" ? 14 : 16} className="animate-spin" />
      ) : (
        <Save size={size === "sm" ? 14 : 16} />
      )}
      <span>
        {saving ? (
          <FormattedMessage id="MENU_PLANNER.SAVING" defaultMessage="Saving…" />
        ) : (
          <FormattedMessage id="MENU_PLANNER.SAVE_PLAN" defaultMessage="Save Plan" />
        )}
      </span>
    </button>
  );
};

const MenuPlannerPage = () => {
  const intl = useIntl();
  const [basicSelected, setBasicSelected] = useState([]);
  const [premiumSelected, setPremiumSelected] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]); // ← single source for panels
  const [loadingItems, setLoadingItems] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const debounceRef = useRef(null);

  // ─── Single API call ───────────────────────────────────────────────
const fetchAllMenuItems = async (itemName = "") => {
  try {
    setLoadingItems(true);
    const userId = localStorage.getItem("userId") ?? 1;
    const res = await GetAllMenuItems({
      isAsc: 1,
      userId,
      itemName,
      menuCatId: "",
      subCategoryId: "",
      isWithRecipe: "",
      page: 1,
      size: 1000,
    });
    const items = res?.data?.data?.items || [];
    const mapped = items.map((item) => ({
      id: item.id,
      name: getLocalizedName(item, intl.locale),
      category: getLocalizedName(item.menuCategory, intl.locale),
      categoryId: item.menuCategory?.id || null,
      image: item.imagePath || "https://placehold.co/100x100/png",
    }));
    setMenuItems(mapped);
  } catch (err) {
    console.error("Menu fetch failed:", err);
  } finally {
    setLoadingItems(false);
  }
};

  // Debounce search → single fetch
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAllMenuItems(search);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // ─── Saved plan ────────────────────────────────────────────────────
  const loadSavedPlan = async () => {
    try {
      const userId = localStorage.getItem("userId") ?? 1;
      const res = await getmenuplanningmaster(userId);
      const data = res?.data?.data;
      if (!data) return;

      const basicIds = [];
      const premiumIds = [];
      const savedItems = [];

      (data.basicPackage ?? []).forEach((pkg) => {
        pkg.items.forEach((item) => {
          basicIds.push(item.menuItemId);
          savedItems.push({
            id: item.menuItemId,
            name: item.menuItemName,
            category: pkg.menuCategoryName,
            categoryId: pkg.menuCategoryId,
            image: "https://placehold.co/100x100/png",
          });
        });
      });

      (data.premiumPackage ?? []).forEach((pkg) => {
        pkg.items.forEach((item) => {
          premiumIds.push(item.menuItemId);
          savedItems.push({
            id: item.menuItemId,
            name: item.menuItemName,
            category: pkg.menuCategoryName,
            categoryId: pkg.menuCategoryId,
            image: "https://placehold.co/100x100/png",
          });
        });
      });

      setBasicSelected(basicIds);
      setPremiumSelected(premiumIds);
      setAllMenuItems(savedItems);
    } catch (err) {
      console.error("Failed to load saved plan:", err);
    }
  };

  useEffect(() => {
    loadSavedPlan();
  }, []);

  // ─── Toggle helpers ────────────────────────────────────────────────
  const toggleBasic = (id, itemMeta) =>
    setBasicSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (itemMeta) {
        setAllMenuItems((items) => {
          const exists = items.find((i) => i.id === id);
          if (exists)
            return items.map((i) => (i.id === id ? { ...i, ...itemMeta } : i));
          return [...items, itemMeta];
        });
      }
      return [...prev, id];
    });

  const togglePremium = (id, itemMeta) =>
    setPremiumSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (itemMeta) {
        setAllMenuItems((items) => {
          const exists = items.find((i) => i.id === id);
          if (exists)
            return items.map((i) => (i.id === id ? { ...i, ...itemMeta } : i));
          return [...items, itemMeta];
        });
      }
      return [...prev, id];
    });

  // ─── Save ──────────────────────────────────────────────────────────
  const buildPayload = () => {
    const userId = parseInt(localStorage.getItem("userId") ?? "1", 10);

    const groupByCategory = (ids) => {
      const items = ids
        .map((id) => allMenuItems.find((i) => i.id === id))
        .filter(Boolean);

      const map = {};
      items.forEach((item) => {
        const catId = item.categoryId ?? item.category;
        if (!map[catId]) {
          map[catId] = {
            menuCategoryId: item.categoryId ?? null,
            menuCategoryName: item.category ?? "",
            items: [],
          };
        }
        map[catId].items.push({
          menuItemId: item.id,
          menuItemName: item.name,
        });
      });

      return Object.values(map);
    };

    return {
      basicPackage: groupByCategory(basicSelected),
      premiumPackage: groupByCategory(premiumSelected),
      userId,
    };
  };

  const handleSave = async () => {
    if (basicSelected.length === 0 && premiumSelected.length === 0) return;
    try {
      setSaving(true);
      const payload = buildPayload();
      const res = await addupadtemenuplanningmaster(payload);
      const message =
        res?.data?.msg ||
        intl.formatMessage({
          id: "MENU_PLANNER.SAVE_SUCCESS",
          defaultMessage: "Menu plan saved successfully!",
        });

      await Swal.fire({
        icon: "success",
        title: intl.formatMessage({ id: "MENU_PLANNER.SAVED_TITLE", defaultMessage: "Saved!" }),
        text: message,
        confirmButtonColor: "#2563eb",
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false,
      });

      await loadSavedPlan();
    } catch (err) {
      const message =
        err?.response?.data?.msg ||
        intl.formatMessage({
          id: "MENU_PLANNER.SAVE_FAILED",
          defaultMessage: "Failed to save. Please try again.",
        });
      Swal.fire({
        icon: "error",
        title: intl.formatMessage({ id: "COMMON.ERROR", defaultMessage: "Error" }),
        text: message,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalSelected = basicSelected.length + premiumSelected.length;

  return (
    <div className="h-screen overflow-hidden to-slate-100 p-4 flex flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-300/40">
            <UtensilsCrossed size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
              <FormattedMessage
                id="MENU_PLANNER.TITLE"
                defaultMessage="Menu Planning Master"
              />
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              <FormattedMessage
                id="MENU_PLANNER.SUBTITLE"
                defaultMessage="Configure Basic & Premium packages · select items from both sides"
              />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-px h-8 bg-slate-200 mx-1" />
          <SaveButton
            onClick={handleSave}
            saving={saving}
            disabled={totalSelected === 0}
          />
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-5" />

      <div
        className="grid gap-4 flex-1 min-h-0"
        style={{
          gridTemplateColumns: "340px 1fr 340px",
          height: "calc(100vh - 130px)",
        }}
      >
        <LeftPanel
          menuItems={menuItems}
          loading={loadingItems}
          selectedIds={basicSelected}
          onToggle={toggleBasic}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categoryList={categoryList}
          setCategoryList={setCategoryList}
          search={search}
          setSearch={setSearch}
        />

        <MiddlePanel
          basicSelected={basicSelected}
          premiumSelected={premiumSelected}
          onRemoveBasic={toggleBasic}
          onRemovePremium={togglePremium}
          allMenuItems={allMenuItems}
        />

        <RightPanel
          menuItems={menuItems}
          loading={loadingItems}
          selectedIds={premiumSelected}
          onToggle={togglePremium}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categoryList={categoryList}
          search={search}
          setSearch={setSearch}
        />
      </div>
    </div>
  );
};

export default MenuPlannerPage;