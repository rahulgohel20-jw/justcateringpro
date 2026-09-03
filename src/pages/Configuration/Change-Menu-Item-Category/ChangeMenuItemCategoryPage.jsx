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
} from "@/services/apiServices";
import Swal from "sweetalert2";

const ChangeMenuItemCategoryPage = () => {
  const intl = useIntl();

  const [isSaving, setIsSaving] = useState(false);
  const [fromCategory, setFromCategory] = useState([]); // ✅ array
  const [toCategory, setToCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState([]); // ✅ array
  const [categoryList, setCategoryList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

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

  // Fetch menu items when activeCategory changes
  useEffect(() => {
    const fetchMenuitem = async () => {
      // activeCategory is an array; empty = nothing selected
      if (!activeCategory || activeCategory.length === 0) {
        setTableData([]);
        return;
      }

      if (activeCategory === "all" && categoryList.length === 0) return;

      setLoading(true);
      try {
        const userId = localStorage.getItem("userId");

        // ✅ "all" → send all real IDs; otherwise send selected IDs array
        const menu_cat_ids =
          activeCategory === "all"
            ? categoryList.map((cat) => cat.id)
            : activeCategory; // already a clean array of numeric IDs

        const response = await Getmenuitemsusingcatidconfig(
          menu_cat_ids,
          userId,
          null, // ✅ null, not { type: null }
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
  }, [activeCategory, categoryList]);

  const staticCategories = [{ id: "all", name: "All Categories" }];
  const combinedCategories = [...staticCategories, ...categoryList];

  const handleFromCategoryChange = (val) => {
    // val is always an array from FromCategoryDropdown
    setFromCategory(val);

    if (val.length === 0) {
      setActiveCategory([]);
    } else if (val.includes("all")) {
      // ✅ "all" selected → trigger fetch of all categories
      setActiveCategory("all");
    } else {
      // ✅ specific categories → pass array of real IDs only
      setActiveCategory(val);
    }
  };

  const handleSaveChanges = async () => {
    if (!toCategory || selectedRows.length === 0) return;

    setIsSaving(true);
    try {
      const userId = localStorage.getItem("userId");

      const params = new URLSearchParams();
      params.append("new_cat_id", toCategory);
      params.append("user_id", userId);
      // ✅ don't append type at all, or append empty string if API requires it
      // params.append("type", "");

      selectedRows.forEach((id) => {
        params.append("menu_item_ids", id);
      });

      const response = await UpdtaemenuItemcatergoryconfig(params.toString());

      const successMsg =
        response?.data?.msg || "Menu item category updated successfully";

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: successMsg,
        confirmButtonColor: "#2563eb",
      });

      // Reload table with new category and reset state
      setActiveCategory([toCategory]);
      setSelectedRows([]);
      setFromCategory([]); // ✅ reset to array
      setToCategory("");
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
    setFromCategory([]); // ✅ reset to array
    setToCategory("");
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
                value={fromCategory} // ✅ always an array
                onChange={handleFromCategoryChange}
                options={combinedCategories}
                disabled={categoriesLoading}
              />
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
