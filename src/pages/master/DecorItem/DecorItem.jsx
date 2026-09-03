import { Fragment, useEffect, useState, useCallback, useRef } from "react";
import { Container } from "@/components/container";
import { Select, Button, Spin } from "antd";
import {
  GetAllDecorItem,
  DeleteDecorItem,
  UpdateDecorItemStatus,
  GetAllDecorCategory,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import AddDecorItemModal from "../../../partials/modals/add-decor-item/AddDecorItem";

const ITEMS_PER_PAGE = 100;

const DecorItem = () => {
  const permissions = usePermission("Decor Items");
  const intl = useIntl();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedDecorItem, setSelectedDecorItem] = useState(null);

  const userId = localStorage.getItem("userId");

  /* -------------------- FETCH CATEGORIES FOR FILTER -------------------- */
  const fetchCategoryList = async () => {
    try {
      const res = await GetAllDecorCategory(userId);
      const list =
        res?.data?.["Decore Main Category Details"] ||
        res?.data?.data ||
        [];
      setCategoryList(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategoryList([]);
    }
  };

  /* -------------------- FETCH ITEMS -------------------- */
  const fetchItems = useCallback(
    async (page, search, category) => {
      setLoading(true);
      try {
        const response = await GetAllDecorItem(userId);

        console.log("DecorItem API response:", response); // 🔍 debug

        // Try all possible response shapes
        let allItems = [];

        if (response?.data?.data?.items) {
          // axios: response.data.data.items
          allItems = response.data.data.items;
        } else if (response?.data?.items) {
          allItems = response.data.items;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          allItems = response.data.data;
        } else if (response?.data?.["Decore Item Details"]) {
          allItems = response.data["Decore Item Details"];
        } else if (Array.isArray(response?.data)) {
          allItems = response.data;
        }

        console.log("Extracted items:", allItems.length); // 🔍 debug

        // Client-side filtering
        if (search) {
          const q = search.toLowerCase();
          allItems = allItems.filter(
            (item) =>
              (item.nameEnglish || "").toLowerCase().includes(q) ||
              (item.nameHindi || "").toLowerCase().includes(q) ||
              (item.nameGujarati || "").toLowerCase().includes(q),
          );
        }

        if (category) {
          allItems = allItems.filter(
            (item) => String(item.decoreMainCategoryId) === String(category),
          );
        }

        const total = allItems.length;
        setTotalItems(total);

        // Client-side pagination slice
        const start = (page - 1) * ITEMS_PER_PAGE;
        const sliced = allItems.slice(start, start + ITEMS_PER_PAGE);

        const language = localStorage.getItem("lang");
        const languageMap = {
          en: "nameEnglish",
          hi: "nameHindi",
          gu: "nameGujarati",
        };
        const field = languageMap[language] || "nameEnglish";

        const mapped = sliced.map((item, index) => ({
          ...item,
          sr_no: start + index + 1,
          displayName: item[field] || "-",
          nameEnglish: item.nameEnglish || "",
          nameHindi: item.nameHindi || "",
          nameGujarati: item.nameGujarati || "",
          imagesPath:
            item.imagesPath ||
            (item.images && item.images[0]?.imagePath) ||
            "",
          categoryName:
            item.decoreMainCategoryName || item.decoreMainCategoryId || "-",
        }));

        setTableData(mapped);
      } catch (error) {
        console.error("Error fetching decor items:", error);
        setTableData([]);
        setTotalItems(0);
      } finally {
        setLoading(false);
      }
    },
    [userId],
  );

  /* -------------------- INITIAL LOAD -------------------- */
  useEffect(() => {
    fetchCategoryList();
    fetchItems(currentPage, searchQuery, categoryFilter);
  }, []);

  /* -------------------- SEARCH DEBOUNCE -------------------- */
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchItems(1, searchQuery, categoryFilter);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  /* -------------------- DELETE -------------------- */
  const handleDelete = (id) => {
    if (!id || isNaN(id)) return;
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        DeleteDecorItem(id)
          .then((response) => {
            if (response?.data?.success === true) {
              fetchItems(currentPage, searchQuery, categoryFilter);
              Swal.fire({
                title: "Removed!",
                text: "Decor Item has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                title: "Error",
                text: response?.data?.msg || "Failed to delete",
                icon: "error",
              });
            }
          })
          .catch((error) => {
            Swal.fire({
              title: "Error",
              text: error?.response?.data?.msg || "Something went wrong",
              icon: "error",
            });
          });
      }
    });
  };

  /* -------------------- TOGGLE STATUS -------------------- */
  const toggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await UpdateDecorItemStatus(id, newStatus);
      setTableData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, isActive: newStatus } : item,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  /* -------------------- EDIT -------------------- */
  const handleEdit = (item) => {
    setSelectedDecorItem(item);
    setIsItemModalOpen(true);
  };

  /* -------------------- PAGINATION -------------------- */
  const handlePagination = (page) => {
    setCurrentPage(page);
    fetchItems(page, searchQuery, categoryFilter);
  };

  const refreshData = () => {
    fetchItems(currentPage, searchQuery, categoryFilter);
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="DECOR_ITEM.MASTER"
              defaultMessage="Decor Item Master"
            />
          </h1>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <i className="ki-filled ki-magnifier leading-none text-sm text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-2.5" />
              <input
                className="input pl-7 h-8 text-sm w-[180px]"
                placeholder={intl.formatMessage({
                  id: "DECOR_ITEM.SEARCH_PLACEHOLDER",
                  defaultMessage: "Search Decor Items",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select
              size="small"
              className="w-[200px]"
              showSearch
              allowClear
              placeholder="All Categories"
              optionFilterProp="label"
              value={categoryFilter || undefined}
              onChange={(value) => {
                const selected = value || "";
                setCategoryFilter(selected);
                setCurrentPage(1);
                fetchItems(1, searchQuery, selected);
              }}
              options={[
                { value: "", label: "All Categories" },
                ...categoryList.map((item) => ({
                  value: item.id,
                  label: item.nameEnglish || "-",
                })),
              ]}
            />
          </div>

          {permissions.add && (
            <Button
              size="medium"
              type="primary"
              icon={<i className="ki-filled ki-plus text-xs" />}
              onClick={() => {
                setSelectedDecorItem(null);
                setIsItemModalOpen(true);
              }}
              className="bg-primary px-5 rounded-md text-xs"
            >
             <FormattedMessage
                              id="COMMON.CREATE_NEW"
                              defaultMessage="Create New"
                            />
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table table-auto">
                <thead>
                <tr className="bg-gray-50">
  <th className="text-left py-4 px-6 font-semibold text-gray-700">
    <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr. No." />
  </th>

  <th className="text-left py-4 px-6 font-semibold text-gray-700">
    <FormattedMessage id="COMMON.IMAGE" defaultMessage="Image" />
  </th>

  <th className="text-left py-4 px-6 font-semibold text-gray-700">
    <FormattedMessage id="COMMON.NAME" defaultMessage="Name" />
  </th>

  <th className="text-left py-4 px-6 font-semibold text-gray-700">
    <FormattedMessage id="DECOR_ITEM.CATEGORY" defaultMessage="Category" />
  </th>

  <th className="text-left py-4 px-6 font-semibold text-gray-700">
    <FormattedMessage id="COMMON.PRICE" defaultMessage="Price" />
  </th>

  <th className="text-left py-4 px-6 font-semibold text-gray-700">
    <FormattedMessage id="COMMON.SLOGAN" defaultMessage="Slogan" />
  </th>

  <th className="text-left py-4 px-6 font-semibold text-gray-700">
    <FormattedMessage id="USER.MASTER.SEQUENCE" defaultMessage="Sequence" />
  </th>

  <th className="text-left py-4 px-6 font-semibold text-gray-700">
    <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />
  </th>

  <th className="text-left py-4 px-6 font-semibold text-gray-700">
    <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />
  </th>
</tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="9" className="text-center py-8">
                        <Spin size="large" />
                        <p className="mt-2 text-gray-600">Loading...</p>
                      </td>
                    </tr>
                  ) : tableData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="9"
                        className="text-center py-8 text-gray-500"
                      >
                        No decor items found
                      </td>
                    </tr>
                  ) : (
                    tableData.map((item) => (
                      <tr
                        key={item.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-6 text-gray-800">
                          {item.sr_no}
                        </td>
                        <td className="py-4 px-6">
                          {item.imagesPath ? (
                            <img
                              src={item.imagesPath}
                              alt={item.nameEnglish}
                              className="w-16 h-16 object-cover rounded-md border"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-md border flex items-center justify-center text-gray-400 text-xs">
                              No img
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-800 font-medium">
                          {item.displayName}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {item.categoryName}
                        </td>
                        <td className="py-4 px-6 text-gray-800">
                          {item.price ?? "-"}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          <span className="line-clamp-1 max-w-[150px]">
                            {item.slogan || "-"}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-800">
                          {item.sequence ?? "-"}
                        </td>
                        <td className="py-4 px-6">
                          <label className="switch switch-sm">
                            <input
                              type="checkbox"
                              checked={item.isActive}
                              onChange={() =>
                                toggleStatus(item.id, item.isActive)
                              }
                            />
                            <span className="slider"></span>
                          </label>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            {permissions.edit && (
                              <button
                                className="w-9 h-9 flex items-center justify-center rounded hover:bg-blue-50 text-blue-600 transition-colors"
                                onClick={() => handleEdit(item)}
                                title="Edit"
                              >
                                <i className="ki-filled ki-notepad-edit text-lg"></i>
                              </button>
                            )}
                            {permissions.delete && (
                              <button
                                className="w-9 h-9 flex items-center justify-center rounded hover:bg-red-50 text-red-600 transition-colors"
                                onClick={() => handleDelete(item.id)}
                                title="Delete"
                              >
                                <i className="ki-filled ki-trash text-lg"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {!loading && tableData.length > 0 && (
            <div className="card-footer justify-between">
              <div className="text-sm text-gray-600">
                Showing {startItem} to {endItem} of {totalItems} items
              </div>
              <div className="flex gap-2 items-center">
                <button
                  className="btn btn-sm btn-light"
                  onClick={() => handlePagination(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <i className="ki-filled ki-left"></i>
                  Previous
                </button>

                <div className="flex gap-1">
                  {Array.from(
                    { length: Math.min(5, totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          className={`btn btn-sm ${
                            currentPage === pageNum
                              ? "btn-primary"
                              : "btn-light"
                          }`}
                          onClick={() => handlePagination(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    },
                  )}
                </div>

                <button
                  className="btn btn-sm btn-light"
                  onClick={() => handlePagination(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <i className="ki-filled ki-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        <AddDecorItemModal
          isModalOpen={isItemModalOpen}
          setIsModalOpen={setIsItemModalOpen}
          refreshData={refreshData}
          editData={selectedDecorItem}
        />
      </Container>
    </Fragment>
  );
};

export default DecorItem;
