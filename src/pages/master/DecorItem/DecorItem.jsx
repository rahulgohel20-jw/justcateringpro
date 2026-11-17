import { Fragment, useEffect, useState, useCallback, useRef } from "react";
import { buildSpellSuggestions, extractDictWords } from "@/utils";
import { Container } from "@/components/container";
import { Select, Button, Spin } from "antd";
import {
  SearchDecorItem,
  DeleteDecorItem,
  UpdateDecorItemStatus,
  GetAllDecorCategory,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import AddDecorItemModal from "../../../partials/modals/add-decor-item/AddDecorItem";

const ITEMS_PER_PAGE = 10;

// Pull the total record count out of whatever shape the API returns.
// Looks for keys like totalCount / totalRecords / totalItems / total / count,
// in response.data, response.data.data, and any pagination/meta object.
const TOTAL_KEY = /^(total(count|records?|items?|elements|rows)?|count|recordsTotal)$/i;

const findTotalIn = (obj) => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return null;
  for (const key of Object.keys(obj)) {
    if (TOTAL_KEY.test(key) && obj[key] !== null && obj[key] !== "" && !isNaN(Number(obj[key]))) {
      return Number(obj[key]);
    }
  }
  return null;
};

const extractTotal = (response) => {
  const d = response?.data;
  const inner = d?.data;
  const places = [
    inner,
    d,
    inner?.pagination,
    inner?.meta,
    inner?.pageInfo,
    d?.pagination,
    d?.meta,
    d?.pageInfo,
  ];
  for (const place of places) {
    const found = findTotalIn(place);
    if (found !== null) return found;
  }
  return null;
};

// Pull the items array out of whatever shape the API returns.
const extractItems = (response) => {
  const d = response?.data;
  if (Array.isArray(d?.data?.items)) return d.data.items;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.["Decore Item Details"])) return d["Decore Item Details"];
  if (Array.isArray(d)) return d;
  return [];
};

const DecorItem = () => {
  const permissions = usePermission("Decor Items");
  const intl = useIntl();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalKnown, setTotalKnown] = useState(true);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedDecorItem, setSelectedDecorItem] = useState(null);
  // Spelling suggestion state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  const userId = localStorage.getItem("userId");
  const requestId = useRef(0);

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

  /* -------------------- FETCH ITEMS (server-side page / search / category) -------------------- */
  const fetchItems = useCallback(async () => {
    const thisRequest = ++requestId.current;
    setLoading(true);
    try {
      const response = await SearchDecorItem({
        userId,
        page: currentPage,
        size: ITEMS_PER_PAGE,
        itemName: debouncedSearch,
        categoryId: categoryFilter,
      });

      // Ignore stale responses (e.g. user typed again before this one returned)
      if (thisRequest !== requestId.current) return;

      const items = extractItems(response);

      let total = extractTotal(response);
      setTotalKnown(total !== null);
      if (total === null) {
        // API didn't send a total: infer enough to keep Next/Previous working.
        total =
          (currentPage - 1) * ITEMS_PER_PAGE +
          items.length +
          (items.length === ITEMS_PER_PAGE ? 1 : 0);
      }
      setTotalItems(total);

      const language = localStorage.getItem("lang");
      const languageMap = {
        en: "nameEnglish",
        hi: "nameHindi",
        gu: "nameGujarati",
      };
      const field = languageMap[language] || "nameEnglish";
      const offset = (currentPage - 1) * ITEMS_PER_PAGE;

      const mapped = items.map((item, index) => ({
        ...item,
        sr_no: offset + index + 1,
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
      if (thisRequest !== requestId.current) return;
      console.error("Error fetching decor items:", error);
      setTableData([]);
      setTotalItems(0);
    } finally {
      if (thisRequest === requestId.current) setLoading(false);
    }
  }, [userId, currentPage, debouncedSearch, categoryFilter]);

  /* -------------------- INITIAL LOAD: categories -------------------- */
  useEffect(() => {
    fetchCategoryList();
  }, []);

  /* -------------------- SEARCH DEBOUNCE -------------------- */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Load word dictionary on mount and update from tableData
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await SearchDecorItem({
          userId,
          page: 1,
          size: 1000,
          itemName: "",
          categoryId: "",
        });
        if (cancelled) return;
        const items = extractItems(res);
        const words = extractDictWords(items, [
          "nameEnglish",
          "nameHindi",
          "nameGujarati",
          "name",
          "decoreMainCategoryName",
        ]);
        setDictWords(words);
      } catch (err) {
        console.error("Failed to load spelling dictionary:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      const words = extractDictWords(tableData, [
        "nameEnglish",
        "nameHindi",
        "nameGujarati",
        "displayName",
        "categoryName",
      ]);
      if (words.length > 0) {
        setDictWords((prev) => Array.from(new Set([...prev, ...words])));
      }
    }
  }, [tableData]);

  // Build suggestions while typing
  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false;
      return;
    }
    const q = (searchQuery || "").trim().toLowerCase();
    if (q.length < 2 || dictWords.length === 0) {
      setSpellSuggestions([]);
      setShowSpell(false);
      return;
    }
    const timeoutId = setTimeout(() => {
      const results = buildSpellSuggestions(q, dictWords, 6);
      setSpellSuggestions(results);
      setSpellIndex(-1);
      setShowSpell(results.length > 0);
    }, 200);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, dictWords]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSpell(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const applySpellSuggestion = (text) => {
    skipSuggestRef.current = true;
    setSearchQuery(text);
    setShowSpell(false);
    setSpellIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSpell || spellSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSpellIndex((i) => (i + 1) % spellSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSpellIndex((i) => (i <= 0 ? spellSuggestions.length - 1 : i - 1));
    } else if (e.key === "Tab" || (e.key === "Enter" && spellIndex >= 0)) {
      if (spellIndex >= 0) {
        e.preventDefault();
        applySpellSuggestion(spellSuggestions[spellIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSpell(false);
    }
  };

  /* -------------------- LOAD ON PAGE / SEARCH / CATEGORY CHANGE -------------------- */
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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
              // If that was the last row on this page, step back one page
              if (tableData.length === 1 && currentPage > 1) {
                setCurrentPage((p) => p - 1);
              } else {
                fetchItems();
              }
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
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const refreshData = () => {
    fetchItems();
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
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
            <div className="relative" ref={searchBoxRef}>
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
                onFocus={() => spellSuggestions.length > 0 && setShowSpell(true)}
                onKeyDown={handleSearchKeyDown}
                autoComplete="off"
                spellCheck={false}
              />

              {showSpell && spellSuggestions.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-[260px] bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="px-3 pt-2 pb-1 text-xs text-gray-400">
                    Suggestions:
                  </div>
                  <ul>
                    {spellSuggestions.map((s, i) => (
                      <li
                        key={s}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          applySpellSuggestion(s);
                        }}
                        onMouseEnter={() => setSpellIndex(i)}
                        className={`px-3 py-2 cursor-pointer text-sm text-primary capitalize ${
                          i === spellIndex ? "bg-gray-100" : "hover:bg-gray-50"
                        }`}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
                setCategoryFilter(value || "");
                setCurrentPage(1);
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

          {/* Footer: item count + pagination (always visible) */}
          <div className="card-footer justify-between">
            <div className="text-sm text-gray-600">
              {loading ? (
                "Loading..."
              ) : tableData.length === 0 ? (
                "Showing 0 items"
              ) : totalKnown ? (
                `Showing ${startItem} to ${endItem} of ${totalItems} items`
              ) : (
                `Showing ${startItem} to ${startItem + tableData.length - 1} items`
              )}
            </div>

            {!loading && tableData.length > 0 && (
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
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                          currentPage === pageNum ? "btn-primary" : "btn-light"
                        }`}
                        onClick={() => handlePagination(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="btn btn-sm btn-light"
                  onClick={() => handlePagination(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                  <i className="ki-filled ki-right"></i>
                </button>
              </div>
            )}
          </div>
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
