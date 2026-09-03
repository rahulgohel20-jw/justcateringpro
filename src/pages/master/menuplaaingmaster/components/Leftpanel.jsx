import { useEffect } from "react";
import { ClipboardList, Search, Check } from "lucide-react";
import { GetMenuCategoryByUserId } from "@/services/apiServices";
import { Select } from "antd";
import { FormattedMessage, useIntl } from "react-intl";
 import { getLocalizedName } from "@/utils/langConfig";

const { Option } = Select;

const LeftPanel = ({
  menuItems,
  loading,
  selectedIds,
  onToggle,
  selectedCategory,
  setSelectedCategory,
  categoryList,
  setCategoryList,
  search,
  setSearch,
}) => {
  const intl = useIntl();

  useEffect(() => {
    fetchMenuCategories();
  }, []);

  

  const fetchMenuCategories = async () => {
    try {
      const userId = localStorage.getItem("userId") ?? 1;
      const res = await GetMenuCategoryByUserId(userId);
      const categories = res?.data?.data?.["Menu Category Details"] || [];
      const sorted = [...categories].sort(
        (a, b) => (a.sequence || 0) - (b.sequence || 0),
      );
      setCategoryList(sorted);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Failed to fetch menu categories:", error);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md flex flex-col overflow-hidden h-full min-h-0 border border-slate-100">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-primary text-white flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
          <ClipboardList size={18} />
        </div>
        <h3 className="text-sm font-semibold">
          <FormattedMessage id="MENU_PLANNER.BASIC_ITEMS" defaultMessage="Basic Items" />
        </h3>
      </div>

      {/* CATEGORY */}
      <div className="px-4 pt-4 pb-2 flex-shrink-0">
        <p className="text-[10px] font-bold text-slate-400 tracking-widest mb-2">
          <FormattedMessage id="MENU_PLANNER.FILTER_BY_CATEGORY" defaultMessage="FILTER BY CATEGORY" />
        </p>
        <Select
          value={selectedCategory || undefined}
          onChange={(val) => setSelectedCategory(val ?? null)}
          placeholder={intl.formatMessage({ id: "MENU_PLANNER.ALL_CATEGORIES", defaultMessage: "All categories" })}
          showSearch
          allowClear
          optionFilterProp="children"
          className="w-full"
          size="large"
          styles={{ popup: { root: { zIndex: 9999 } } }}
        >
          {categoryList.map((category) => (
            <Option key={category.id} value={category.id}>
              {getLocalizedName(category, intl.locale)}
            </Option>
          ))}
        </Select>
      </div>

      {/* SEARCH */}
      <div className="relative px-4 pb-2 flex-shrink-0">
        <Search
          size={16}
          className="absolute left-7 top-1/3 -translate-y-1/2 text-slate-400"
        />
        <input
          className="w-full border border-slate-200 rounded-xl pl-10 pr-3 py-2 text-sm bg-slate-50"
          placeholder={intl.formatMessage({ id: "MENU_PLANNER.SEARCH_ITEMS", defaultMessage: "Search items..." })}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* COUNT */}
      <div className="px-4 pb-1 flex-shrink-0">
        <p className="text-[10px] text-slate-400">
          {loading ? (
            <FormattedMessage id="COMMON.LOADING" defaultMessage="Loading..." />
          ) : menuItems.length === 1 ? (
            <FormattedMessage
              id="MENU_PLANNER.ITEM_COUNT_SINGULAR"
              defaultMessage="{count} item across all categories"
              values={{ count: menuItems.length }}
            />
          ) : (
            <FormattedMessage
              id="MENU_PLANNER.ITEM_COUNT_PLURAL"
              defaultMessage="{count} items across all categories"
              values={{ count: menuItems.length }}
            />
          )}
        </p>
      </div>

      {/* ITEMS LIST */}
      <div className="flex-1 min-h-0 overflow-y-auto py-1 no-scrollbar">
        {loading ? (
          <div className="px-2 py-1 space-y-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 rounded-xl border border-transparent"
              >
                <div className="w-5 h-5 rounded-md bg-slate-200 animate-pulse flex-shrink-0" />
                <div className="w-11 h-11 rounded-xl bg-slate-200 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div
                    className="h-3 bg-slate-200 animate-pulse rounded-full"
                    style={{ width: `${55 + (i % 4) * 10}%` }}
                  />
                  <div className="h-2.5 bg-slate-100 animate-pulse rounded-full w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : menuItems.length === 0 ? (
          <div className="p-4 text-sm text-slate-400">
            <FormattedMessage id="MENU_PLANNER.NO_ITEMS_FOUND" defaultMessage="No items found." />
          </div>
        ) : (
          menuItems.map((item) => {
            const checked = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() =>
                  onToggle(item.id, {
                    ...item,
                    category: selectedCategory
                      ? (getLocalizedName(
                          categoryList.find((c) => c.id === selectedCategory),
                          intl.locale,
                        ) || item.category)
                      : item.category,
                    categoryId: selectedCategory ?? item.categoryId,
                  })
                }
                className={`mx-2 mb-1 flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer border transition-all
                  ${checked ? "border-blue-100 bg-blue-50" : "hover:bg-slate-50 border-transparent"}`}
              >
                <span
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0
                  ${checked ? "bg-blue-500 border-blue-500" : "border-slate-300"}`}
                >
                  {checked && <Check size={12} className="text-white" />}
                </span>
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-11 h-11 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                  onError={(e) => {
                    e.target.src = "https://placehold.co/100x100/png";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-400">{item.category}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LeftPanel;