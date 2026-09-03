import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { FormattedMessage, useIntl } from "react-intl";
import { columns } from "./constant";
import FromCategoryDropdown from "../../../components/form-inputs/FromCategoryDropdown/FromCategoryDropdown";
import {
  GetRawMaterialcategory,
  Getrawmaterialitembycat,
  UpdateRawMaterialCategory,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import NoData from "../../../components/Nodata";

const ChangeRawMaterialCategoryPage = () => {
  const intl = useIntl();
  const [activeCategory, setActiveCategory] = useState([]);
  const [fromCategory, setFromCategory] = useState([]);
  const [toCategory, setToCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [hasNext, setHasNext] = useState(false);

  const staticCategories = [{ id: "all", name: "All Categories" }];

  useEffect(() => {
    setPage(0);
  }, [activeCategory, pageSize]);

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        const response = await GetRawMaterialcategory(userId);
        const categoriesData =
          response?.data?.data?.["Raw Material Category Details"] || [];
        const categories = categoriesData.map((cat) => ({
          id: cat.id,
          name: cat.nameEnglish?.trim(),
        }));
        setCategoryList(categories);
      } catch (error) {
        console.error("❌ Error fetching categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchRawMaterials = async () => {
      if (!activeCategory.length) {
        setTableData([]);
        setTotalCount(0);
        return;
      }
      if (categoryList.length === 0) return;

      setLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        const cat_id_list = activeCategory.includes("all")
          ? categoryList.map((cat) => cat.id)
          : activeCategory;

        const response = await Getrawmaterialitembycat(
          cat_id_list,
          userId,
          page,
          pageSize,
        );

        const rawMaterialsData = response?.data?.data || [];
        const total = response?.data?.totalRawMaterialItems ?? 0;

        setTotalCount(total);
        setHasNext(response?.data?.hasNext ?? false);

        const formattedData = rawMaterialsData.map((item, index) => ({
          id: item.id || index,
          categoryId: item.rawMaterialCatId || item.category_id,
          rawMaterial: item.nameEnglish?.trim() || "N/A",
          category: item.rawMaterialCatNameEnglish?.trim() || "N/A",
        }));

        setTableData(formattedData);
      } catch (error) {
        console.error("❌ Error fetching raw materials", error);
        setTableData([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchRawMaterials();
  }, [activeCategory, categoryList, page, pageSize]);

  const combinedCategories = [...staticCategories, ...categoryList];

  const handleSaveChanges = async () => {
    if (!toCategory || selectedRows.length === 0) return;
    setIsSaving(true);
    try {
      const userId = localStorage.getItem("userId");
      const params = new URLSearchParams();
      params.append("new_cat_id", toCategory);
      params.append("userId", userId);
      selectedRows.forEach((row) => {
        params.append("raw_material_id_list", row.id);
      });
      const response = await UpdateRawMaterialCategory(params.toString());
      const successMsg = response?.data?.msg || "Category updated successfully";
      await Swal.fire({
        icon: "success",
        title: "Success",
        text: successMsg,
        confirmButtonColor: "#2563eb",
      });
      setActiveCategory(toCategory);
      setSelectedRows([]);
      setFromCategory([]);
      setToCategory("");
    } catch (error) {
      const errorMsg =
        error?.response?.data?.msg || "Failed to update raw material category";
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMsg,
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTableData = tableData.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.rawMaterial.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    );
  });

  return (
    <Fragment>
      <Container>
        <div className="mb-3">
          <h1 className="test-xxl text-gray-900">
            <FormattedMessage
              id="RAW_MATERIAL.CHANGE_CATEGORY"
              defaultMessage="Change Raw Material Category"
            />
          </h1>
        </div>

        <div className="card min-w-full p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="form-label">
                <FormattedMessage
                  id="FROM_CATEGORY"
                  defaultMessage="From Category"
                />
              </label>
              <FromCategoryDropdown
                value={fromCategory}
                onChange={(val) => {
                  setFromCategory(val);
                  setActiveCategory(val);
                }}
                options={combinedCategories}
                disabled={categoriesLoading}
              />
            </div>
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
                    {categoriesLoading
                      ? intl.formatMessage({
                          id: "COMMON.LOADING",
                          defaultMessage: "Loading...",
                        })
                      : intl.formatMessage({
                          id: "COMMON.SELECT_CATEGORY",
                          defaultMessage: "Select a category",
                        })}
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

        <div className="card min-w-full p-4 mb-10">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="text-black text-lg font-semibold">
              <FormattedMessage
                id="RAW_MATERIAL.LIST"
                defaultMessage="Raw Material List"
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
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearchQuery(e.target.value);
                }}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="spinner-border" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : tableData.length === 0 && fromCategory.length > 0 ? (
            <NoData
              text={intl.formatMessage({
                id: "RAW_MATERIAL.SELECT_CATEGORY",
                defaultMessage: "No raw materials found for this category",
              })}
            />
          ) : tableData.length === 0 ? (
            <NoData
              text={intl.formatMessage({
                id: "RAW_MATERIAL.SELECT_CATEGORY",
                defaultMessage:
                  "Please select a category to view raw materials",
              })}
            />
          ) : (
            <div>
              <TableComponent
                columns={columns({
                  selectedRows,
                  setSelectedRows,
                  data: filteredTableData,
                })}
                data={filteredTableData}
                hidePagination={true}
                paginationSize={filteredTableData.length}
              />

              {/* Pagination controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {totalCount === 0
                      ? "0"
                      : `${page * pageSize + 1}–${Math.min(
                          (page + 1) * pageSize,
                          totalCount,
                        )} of ${totalCount}`}
                  </span>

                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPage(0);
                      setPageSize(Number(e.target.value));
                    }}
                    className="btn btn-sm btn-light text-sm"
                  >
                    {[10, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size} / page
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 items-center">
                  <button
                    className="btn btn-sm btn-light"
                    disabled={page === 0}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    &laquo; Previous
                  </button>

                  {/* Page number buttons */}
                  {Array.from({ length: Math.ceil(totalCount / pageSize) })
                    .slice(
                      Math.max(0, page - 2),
                      Math.min(Math.ceil(totalCount / pageSize), page + 3),
                    )
                    .map((_, i) => {
                      const pageNum = Math.max(0, page - 2) + i;
                      return (
                        <button
                          key={pageNum}
                          className={`btn btn-sm ${page === pageNum ? "btn-primary" : "btn-light"}`}
                          onClick={() => setPage(pageNum)}
                        >
                          {pageNum + 1}
                        </button>
                      );
                    })}

                  <button
                    className="btn btn-sm btn-light"
                    disabled={!hasNext}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next &raquo;
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mb-10">
          <button
            className="btn btn-light"
            onClick={() => {
              setSelectedRows([]);
              setFromCategory([]);
              setActiveCategory([]);
              setToCategory("");
            }}
          >
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

export { ChangeRawMaterialCategoryPage };
