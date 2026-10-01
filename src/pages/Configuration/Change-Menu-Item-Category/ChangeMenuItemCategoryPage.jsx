import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { FormattedMessage, useIntl } from "react-intl";
import { columns } from "./constant";
import FromCategoryDropdown from "../../../components/form-inputs/FromCategoryDropdown/FromCategoryDropdown";
import {
  GetMenuCategoryByUserId,
  Getmenuitemsusingcatidconfig,
  UpdtaemenuItemcatergoryconfig,
  Getmenusubcategory,
  UpdtaemenuItemsubcatergoryconfig,
} from "@/services/apiServices";
import Swal from "sweetalert2";

const ChangeMenuItemCategoryPage = () => {
  const intl = useIntl();

  const [isSaving, setIsSaving] = useState(false);
  const [fromCategory, setFromCategory] = useState([]); // array
  const [toCategory, setToCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState([]); // array or "all"
  const [categoryList, setCategoryList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Sub-category state
  const [fromSubCategory, setFromSubCategory] = useState([]); // multi
  const [fromSubList, setFromSubList] = useState([]);
  const [toSubCategory, setToSubCategory] = useState(""); // single
  const [toSubList, setToSubList] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  // Fetch sub-categories for one or more category ids
  const fetchSubs = async (catIds) => {
    const userId = localStorage.getItem("userId");
    const results = await Promise.all(
      catIds.map((id) =>
        Getmenusubcategory(id, userId)
          .then((r) => r?.data?.data?.["Menu Sub Category Details"] || [])
          .catch(() => []),
      ),
    );
    return results
      .flat()
      .map((s) => ({ id: s.id, name: s.nameEnglish?.trim() }));
  };

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        const response = await GetMenuCategoryByUserId(userId);

        const categoriesData =
          response?.data?.data?.["Menu Category Details"] || [];

        const categories = categoriesData.map((cat) => ({
          id: cat.id,
          name: cat.nameEnglish?.trim(),
        }));

        setCategoryList(categories);
      } catch (error) {
        console.error("Error fetching menu categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // From side: load sub-categories when From category changes
  // (hidden for "All Categories")
  useEffect(() => {
    const ids = Array.isArray(activeCategory) ? activeCategory : [];
    if (ids.length === 0) {
      setFromSubList([]);
      setFromSubCategory([]);
      return;
    }
    setSubLoading(true);
    fetchSubs(ids)
      .then(setFromSubList)
      .finally(() => setSubLoading(false));
  }, [activeCategory]);

  // To side: load sub-categories when To category changes
  useEffect(() => {
    setToSubCategory("");
    if (!toCategory) {
      setToSubList([]);
      return;
    }
    fetchSubs([toCategory]).then(setToSubList);
  }, [toCategory]);

  // Fetch menu items when category / sub-category selection changes
  useEffect(() => {
    const fetchMenuitem = async () => {
      if (!activeCategory || activeCategory.length === 0) {
        setTableData([]);
        return;
      }

      if (activeCategory === "all" && categoryList.length === 0) return;

      setLoading(true);
      try {
        const userId = localStorage.getItem("userId");

        const menu_cat_ids =
          activeCategory === "all"
            ? categoryList.map((cat) => cat.id)
            : activeCategory;

        // "all" is a UI-only value from the dropdown, so swap it for real sub-category ids
        const subIds = fromSubCategory.includes("all")
          ? fromSubList.map((s) => s.id)
          : fromSubCategory.filter((id) => id !== "all");

        // Send category ids together with sub-category ids
        const response = await Getmenuitemsusingcatidconfig(
          menu_cat_ids,
          userId,
          null,
          subIds,
        );

        const menuItemsData =
          response?.data?.data || response?.data?.darta || [];

        const formattedData = menuItemsData.map((item) => ({
          id: item.id,
          menuItem: item.nameEnglish?.trim() ?? "N/A",
          category: item.menuCategoryNameEnglish?.trim() ?? "N/A",
        }));

        setTableData(formattedData);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuitem();
  }, [activeCategory, categoryList, fromSubCategory, fromSubList]);

  const staticCategories = [{ id: "all", name: "All Categories" }];
  const combinedCategories = [...staticCategories, ...categoryList];

  const handleFromCategoryChange = (val) => {
    // val is always an array from FromCategoryDropdown
    setFromCategory(val);
    setFromSubCategory([]);
    setSelectedRows([]);

    if (val.length === 0) {
      setActiveCategory([]);
    } else if (val.includes("all")) {
      setActiveCategory("all");
    } else {
      setActiveCategory(val);
    }
  };

  const handleSaveChanges = async () => {
    if (!toCategory || selectedRows.length === 0) return;

    setIsSaving(true);
    try {
      const userId = localStorage.getItem("userId");
      const params = new URLSearchParams();
      let response;

      if (toSubCategory) {
        // Transfer to a sub-category
        params.append("new_menu_subcat_ids", toSubCategory);
        params.append("userId", userId);
        selectedRows.forEach((id) => params.append("menu_item_ids", id));
        response = await UpdtaemenuItemsubcatergoryconfig(params.toString());
      } else {
        // Transfer to a category
        params.append("new_cat_id", toCategory);
        params.append("user_id", userId);
        selectedRows.forEach((id) => params.append("menu_item_ids", id));
        response = await UpdtaemenuItemcatergoryconfig(params.toString());
      }

      await Swal.fire({
        icon: "success",
        title: "Success",
        text:
          response?.data?.msg || "Menu item category updated successfully",
        confirmButtonColor: "#2563eb",
      });

      // Reload table with new category and reset state
      setActiveCategory([toCategory]);
      setSelectedRows([]);
      setFromCategory([]);
      setFromSubCategory([]);
      setToCategory("");
      setToSubCategory("");
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.response?.data?.message ||
          "Failed to update menu item category",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedRows([]);
    setFromCategory([]);
    setFromSubCategory([]);
    setToCategory("");
    setToSubCategory("");
    setActiveCategory([]);
    setTableData([]);
  };

  const filteredTableData = tableData.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.menuItem.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });

  return (
    <Fragment>
      <Container>
        {/* Header */}
        <div className="gap-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="MENUITEM.CHANGE_CATEGORY"
              defaultMessage="Change Menu Item Category"
            />
          </h1>
        </div>

        {/* FROM / TO CATEGORY CARD */}
        <div className="card min-w-full p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* From Category */}
            <div>
              <label className="form-label">
                <FormattedMessage
                  id="FROM_CATEGORY"
                  defaultMessage="From Category"
                />
              </label>

              <FromCategoryDropdown
                value={fromCategory}
                onChange={handleFromCategoryChange}
                options={combinedCategories}
                disabled={categoriesLoading}
              />

              {Array.isArray(activeCategory) && activeCategory.length > 0 && (
                <div className="mt-4">
                  <label className="form-label">From Sub Category</label>
                  <FromCategoryDropdown
                    value={fromSubCategory}
                    onChange={(val) => {
                      setFromSubCategory(val);
                      setSelectedRows([]);
                    }}
                    options={fromSubList}
                    disabled={subLoading || fromSubList.length === 0}
                  />
                  {!subLoading && fromSubList.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      No sub categories for the selected category.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* To Category */}
            <div>
              <label className="form-label">
                <FormattedMessage
                  id="TO_CATEGORY"
                  defaultMessage="To Category"
                />
              </label>

              <div className="relative">
                <select
                  className="input appearance-none pr-10"
                  value={toCategory}
                  onChange={(e) => setToCategory(e.target.value)}
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? "Loading..." : "Select a category"}
                  </option>
                  {categoryList.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <i className="ki-filled ki-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"></i>
              </div>

              {toCategory && (
                <div className="mt-4">
                  <label className="form-label">To Sub Category</label>
                  <div className="relative">
                    <select
                      className="input appearance-none pr-10"
                      value={toSubCategory}
                      onChange={(e) => setToSubCategory(e.target.value)}
                      disabled={toSubList.length === 0}
                    >
                      <option value="">None (move to category only)</option>
                      {toSubList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <i className="ki-filled ki-down absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"></i>
                  </div>
                  {toSubList.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      No sub categories for the selected category.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* MENU ITEM LIST CARD */}
        <div className="card min-w-full p-4 mb-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-black text-lg font-semibold">
              <FormattedMessage
                id="MENUITEM.LIST"
                defaultMessage="Menu Item List"
              />
            </h2>

            <div className="relative">
              <i className="ki-filled ki-magnifier text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                type="text"
                placeholder={intl.formatMessage({
                  id: "RAW_MATERIAL.SEARCH",
                  defaultMessage: "To search, type and press Enter.",
                })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <span className="spinner-border text-primary" />
            </div>
          ) : (
            <TableComponent
              columns={columns({
                selectedRows,
                setSelectedRows,
                data: filteredTableData,
              })}
              data={filteredTableData}
              paginationSize={10}
            />
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 mb-10">
          <button className="btn btn-light" onClick={handleCancel}>
            <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
          </button>

          <button
            className="btn btn-primary"
            disabled={!toCategory || selectedRows.length === 0 || isSaving}
            onClick={handleSaveChanges}
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                <FormattedMessage
                  id="COMMON.SAVING"
                  defaultMessage="Saving..."
                />
              </>
            ) : (
              <FormattedMessage
                id="COMMON.SAVE_CHANGES"
                defaultMessage="Save Changes"
              />
            )}
          </button>
        </div>
      </Container>
    </Fragment>
  );
};

export { ChangeMenuItemCategoryPage };