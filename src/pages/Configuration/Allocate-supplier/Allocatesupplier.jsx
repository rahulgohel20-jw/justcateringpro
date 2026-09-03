import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { FormattedMessage, useIntl } from "react-intl";
import { columns } from "./constant";
import FromCategoryDropdown from "../../../components/form-inputs/FromCategoryDropdown/FromCategoryDropdown";
import {
  Getrawmaterialitembycat,
  GetRawMaterialcategory,
  GetAllCustomer,
  Updateallocatesupplier,
} from "@/services/apiServices";
import Swal from "sweetalert2";

const Allocatesupplier = () => {
  const intl = useIntl();
  const [activeCategory, setActiveCategory] = useState([]);
  const [supplierList, setSupplierList] = useState([]);
  const [supplierLoading, setSupplierLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [fromCategory, setFromCategory] = useState([]);
  const [toCategory, setToCategory] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [activeCategory, pageSize]); // ← reset page when page size changes
  useEffect(() => {
    const fetchSuppliers = async () => {
      setSupplierLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        const res = await GetAllCustomer(userId);

        const list = res?.data?.data?.["Party Details"] || [];

        // ✅ ONLY Outside Supplier (Food)
        const suppliers = list.filter(
          (party) => party?.contact?.contactType?.id === 3,
        );

        setSupplierList(
          suppliers.map((party) => ({
            id: party.id,
            name: `${party.nameEnglish?.trim() || "N/A"} (${
              party?.contact?.contactType?.nameEnglish || "Outside Supplier"
            })`,
          })),
        );
      } catch (err) {
        console.error("Failed to fetch suppliers", err);
      } finally {
        setSupplierLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

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

  // 3️⃣ Fetch raw materials (single useEffect — no duplicate!)
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
          supplier: item.partyNameEnglish || "N/A",
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
  const staticCategories = [{ id: "all", name: "All Categories" }];

  const combinedCategories = [...staticCategories, ...categoryList];

  const handleSaveChanges = async () => {
    if (!selectedSupplier || selectedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Warning",
        text: "Please select at least one raw material and a supplier",
      });
      return;
    }

    const fromCategoryName = fromCategory.includes("all")
      ? "All Categories"
      : fromCategory
          .map((id) => combinedCategories.find((c) => c.id === id)?.name)
          .filter(Boolean)
          .join(", ");

    const supplierName =
      supplierList.find((s) => String(s.id) === String(selectedSupplier))
        ?.name || "Selected Supplier";

    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      html: `
        <div style="text-align:left">
          <p>You are about to allocate raw materials:</p>
          <ul>
            <li><b>From Category:</b> ${fromCategoryName}</li>
            <li><b>To Supplier:</b> ${supplierName}</li>
            <li><b>Items Selected:</b> ${selectedRows.length}</li>
          </ul>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Allocate",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#6b7280",
    });

    if (!confirmResult.isConfirmed) return;

    setIsSaving(true);

    try {
      const userId = localStorage.getItem("userId");

      const params = new URLSearchParams();
      params.append("supplierId", selectedSupplier);
      params.append("userId", userId);

      selectedRows.forEach((id) => {
        params.append("raw_material_id_list", id);
      });

      const response = await Updateallocatesupplier(params.toString());

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: response?.data?.msg || "Supplier allocated successfully",
        confirmButtonColor: "#2563eb",
      });
      setTableData((prev) =>
        prev.map((row) =>
          selectedRows.includes(row.id)
            ? { ...row, supplier: supplierName }
            : row,
        ),
      );

      setSelectedRows([]);
      setFromCategory([]);
      setSelectedSupplier("");
      setActiveCategory([]);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.msg || "Failed to allocate supplier",
        confirmButtonColor: "#dc2626",
      });
    } finally {
      setIsSaving(false);
    }
  };
  const filteredTableData = tableData.filter((item) => {
    if (!searchQuery) return true; // no search, show all

    const query = searchQuery.toLowerCase();

    return (
      item.rawMaterial.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      (item.supplier || "").toLowerCase().includes(query)
    );
  });

  return (
    <Fragment>
      <Container>
        <div className="gap-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="ALLOCATE_SUPPLIER"
              defaultMessage="Allocate Supplier"
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
                  defaultMessage="To Vendor Supplier"
                />
              </label>

              <div className="relative">
                <select
                  className="input appearance-none pr-10"
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  disabled={supplierLoading}
                >
                  <option value="">
                    {supplierLoading
                      ? "Loading suppliers..."
                      : "Select Supplier"}
                  </option>

                  {supplierList.map((sup) => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name}
                    </option>
                  ))}
                </select>

                {/* Dropdown Icon */}
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
                defaultMessage="Raw Material Item List"
              />
            </h2>

            <div className="relative">
              <i className="ki-filled ki-magnifier text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={intl.formatMessage({
                  id: "RAW_MATERIAL.SEARCH",
                  defaultMessage: "To search, type here...",
                })}
              />
            </div>
          </div>

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
                  {[100, 50, 10].map((size) => (
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
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 mb-10">
          <button
            className="btn btn-primary"
            disabled={
              !selectedSupplier || selectedRows.length === 0 || isSaving
            }
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

export { Allocatesupplier };
