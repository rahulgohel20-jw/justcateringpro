import { Fragment, useEffect, useState, useCallback, useRef } from "react";
import { Container } from "@/components/container";
import { Select, Button, Spin } from "antd";
import {
  GetAllMenuItems,
  DeleteMenuItem,
  updatestatusmneuitem,
  uploadFileformenu,
  GetAllSubCategory,
  GetAllCategory,
  Getallsyncitems,
  syncallcaptainreceiperate,
} from "@/services/apiServices";
import { SyncOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";
import { toAbsoluteUrl } from "@/utils/Assets";
import { useModuleAccess } from "../../../hooks/useModuleAccess";


const ITEMS_PER_PAGE = 100;

const MenuItems = () => {
    const { hasModuleAccess } = useModuleAccess();
  const canAccessCaptainRecipe = hasModuleAccess("Captain Recipe");
  const permissions = usePermission("Items With Recipe");
  const navigate = useNavigate();
  const intl = useIntl();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [filtersLoading, setFiltersLoading] = useState(false);
  const [subCategoryFilter, setSubCategoryFilter] = useState("");
  const [subCategoryList, setSubCategoryList] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categoryList, setCategoryList] = useState([]);
  const [syncLoading, setSyncLoading] = useState(false);
  let Id = localStorage.getItem("userId");
  const [sortField, setSortField] = useState("");
  const [isAsc, setIsAsc] = useState("");
  const [captainSyncLoading, setCaptainSyncLoading] = useState(false);
  const [isWithRecipe, setIsWithRecipe] = useState("");
  const [rawItems, setRawItems] = useState([]);

  const [videoModal, setVideoModal] = useState({ open: false, url: "" });

const openVideoModal = (url) => {
  const embedUrl = getYoutubeEmbedUrl(url);
  if (!embedUrl) {
    Swal.fire("No Video", "No video is available for this item.", "info");
    return;
  }
  setVideoModal({ open: true, url: embedUrl });
};

const closeVideoModal = () => setVideoModal({ open: false, url: "" });

  const syncrawmatrial = async () => {
    const confirm = await Swal.fire({
      title: "Sync Raw Materials?",
      text: "This will update all raw material rates. Continue?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Sync",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
    });

    if (!confirm.isConfirmed) return;

    try {
      setSyncLoading(true);
      const userId = localStorage.getItem("userId");
      const res = await Getallsyncitems(userId);

      Swal.fire({
        title: "Success!",
        text: res?.data?.msg || "Raw materials synced successfully",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchPage(currentPage, searchQuery, categoryFilter, subCategoryFilter);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.msg || "Sync failed", "error");
    } finally {
      setSyncLoading(false);
    }
  };
const getYoutubeEmbedUrl = (url) => {
  if (!url) return "";
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  const videoId = match ? match[1] : null;
  if (!videoId) return "";

  const listMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  const listParam = listMatch ? `&list=${listMatch[1]}` : "";

  return `https://www.youtube.com/embed/${videoId}?autoplay=1${listParam}`;
};

  const syncCaptainRecipe = async () => {
    const confirm = await Swal.fire({
      title: "Sync Captain Recipes?",
      text: "This will update all captain recipe rates. Continue?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Sync",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      
      cancelButtonColor: "#64748b",
    });

    if (!confirm.isConfirmed) return;

    try {
      setCaptainSyncLoading(true);
      const userId = localStorage.getItem("userId");
      const res = await syncallcaptainreceiperate(userId);

      if (res?.data?.success === true) {
        Swal.fire({
          title: "Success!",
          text: res?.data?.msg || "Captain recipes synced successfully",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchPage(currentPage, searchQuery, categoryFilter, subCategoryFilter);
      } else {
        Swal.fire("Error", res?.data?.msg || "Sync failed", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err?.response?.data?.msg || "Sync failed", "error");
    } finally {
      setCaptainSyncLoading(false);
    }
  };

  const FetchCategoryData = async () => {
    setFiltersLoading(true);
    try {
      const res = await GetAllCategory({
        userid: Id,
        menuCategoryName: "",
      });

      const list = res.data.data["Menu Category Details"] || [];
      setCategoryList(list);
    } catch (error) {
      console.error("Error fetching category:", error);
      setCategoryList([]);
    } finally {
      setFiltersLoading(false);
    }
  };

  const FetchSubCategoryData = () => {
    setFiltersLoading(true);
    GetAllSubCategory({ userid: Id })
      .then((res) => {
        const list = res.data.data["Menu Sub Category Details"] || [];
        setSubCategoryList(list);
      })
      .catch((error) => console.error("Error fetching sub category:", error))
      .finally(() => setFiltersLoading(false));
  };

  const mapMenuItems = useCallback(
  (items, page, locale) => {
    const languageMap = {
      en: "nameEnglish",
      hi: "nameHindi",
      gu: "nameGujarati",
    };
    const field = languageMap[locale] || "nameEnglish";

    return items.map((item, index) => ({
      sr_no: (page - 1) * ITEMS_PER_PAGE + index + 1,
      id: item.id,
      name: item[field] || "-",
      category: item.menuCategory?.[field] || "-",
      subCategory: item.menuSubCategory?.[field] || "-",
      kitchenArea: item.kitchenArea?.[field] || "-",
      slogan: item.slogan || "-",
       video: item.url || "",
      price: (() => {
        const allocation = item.menuItemAllocationConfigs;
        const outside = allocation?.outsideItem;
        if (!allocation || !outside) return item.totalRate || "-";
        const pricePerHelper = Number(outside.pricePerHelper) || 0;
        const quantityPer100Person = Number(outside.quantityPer100Person) || 0;
        return pricePerHelper * quantityPer100Person;
      })(),
      sequence: item.sequence || "-",
      cost: item.dishCosting || 0,
      image: item.imagePath || "",
      status: item.isActive,
      rawdata: item.menuItemRawMaterials || [],
      menuAllocation: item.menuItemAllocationConfigs || [],
      _originalItem: item,
    }));
  },
  [],
);

  const fetchPage = useCallback(
    async (
      page,
      search,
      category,
      subCat,
      sortBy = sortField,
      sortAsc = isAsc,
      withRecipe = isWithRecipe,
    ) => {
      setLoading(true);

      try {
        const response = await GetAllMenuItems({
          isAsc: sortAsc ?? "",
          userId: Id,
          itemName: search || "",
          menuCatId: category || "",
          subCategoryId: subCat || "",
          isWithRecipe:
            withRecipe === true || withRecipe === false ? withRecipe : "",
          page: page,
          size: ITEMS_PER_PAGE,
        });

      const items = response?.data?.data?.items || [];
const total = response?.data?.data?.totalItems || 0;
setTotalItems(total);
setRawItems(items);
setTableData(mapMenuItems(items, page, intl.locale));

        // Map items to table format
        const language = localStorage.getItem("lang");
        const languageMap = {
          en: "nameEnglish",
          hi: "nameHindi",
          gu: "nameGujarati",
        };
        const field = languageMap[language] || "nameEnglish";

        const mapped = items.map((item, index) => ({
          sr_no: (page - 1) * ITEMS_PER_PAGE + index + 1,
          id: item.id,
          name: item[field] || "-",
          category: item.menuCategory?.[field] || "-",
          subCategory: item.menuSubCategory?.[field] || "-",
          kitchenArea: item.kitchenArea?.[field] || "-",
          slogan: item.slogan || "-",
          video: item.url || "",
          price: (() => {
            const allocation = item.menuItemAllocationConfigs;
            const outside = allocation?.outsideItem;

            if (!allocation || !outside) {
              return item.totalRate || "-";
            }

            const pricePerHelper = Number(outside.pricePerHelper) || 0;
            const quantityPer100Person =
              Number(outside.quantityPer100Person) || 0;

            return pricePerHelper * quantityPer100Person;
          })(),

          sequence: item.sequence || "-",
          cost: item.dishCosting || 0,
          image: item.imagePath || "",
          status: item.isActive,
          rawdata: item.menuItemRawMaterials || [],
          menuAllocation: item.menuItemAllocationConfigs || [],
          _originalItem: item,
        }));

        setTableData(mapped);
      } catch (error) {
        console.error("Error loading page:", error);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    },
    [Id, searchQuery, categoryFilter, subCategoryFilter, isWithRecipe],
  );
useEffect(() => {
  if (rawItems.length) {
    setTableData(mapMenuItems(rawItems, currentPage, intl.locale));
  }
}, [intl.locale]);
  const handleSort = (field) => {
    let newIsAsc;

    if (sortField !== field) {
      newIsAsc = true;
    } else if (isAsc === true) {
      newIsAsc = false;
    } else if (isAsc === false) {
      newIsAsc = "";
      setSortField("");
      setIsAsc("");
      fetchPage(
        currentPage,
        searchQuery,
        categoryFilter,
        subCategoryFilter,
        "",
        "",
      );
      return;
    }

    setSortField(field);
    setIsAsc(newIsAsc);
    fetchPage(
      currentPage,
      searchQuery,
      categoryFilter,
      subCategoryFilter,
      field,
      newIsAsc,
    );
  };

  const handleWithRecipeToggle = (value) => {
    setIsWithRecipe(value);
    setCurrentPage(1);
    fetchPage(
      1,
      searchQuery,
      categoryFilter,
      subCategoryFilter,
      sortField,
      isAsc,
      value,
    );
  };

  // ✅ FIX: Restore saved page on mount (persists across edit navigation)
  useEffect(() => {
    const savedPage = parseInt(localStorage.getItem("menuItemsPage")) || 1;
    localStorage.removeItem("menuItemsPage");
    setCurrentPage(savedPage);
    fetchPage(savedPage, searchQuery, categoryFilter, subCategoryFilter);
    FetchCategoryData();
    FetchSubCategoryData();
  }, []);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchPage(1, searchQuery, categoryFilter, subCategoryFilter);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleDelete = (id) => {
    if (!id || isNaN(id)) {
      console.error("❌ Invalid ID passed to delete:", id);
      return;
    }
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
        DeleteMenuItem(id)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              fetchPage(
                currentPage,
                searchQuery,
                categoryFilter,
                subCategoryFilter,
              );

              Swal.fire({
                title: "Removed!",
                text: "Menu Item has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                title: "Error",
                text: response?.data.msg,
                icon: "error",
                showConfirmButton: true,
              });
            }
          })
          .catch((err) => {
            console.error("Delete error:", err);
          });
      }
    });
  };

  const uploadImage = async (moduleRecordId, file) => {
    if (!file) return;

    if (!(file instanceof File || file instanceof Blob)) {
      Swal.fire("Error", "File must be binary", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file, file.name);
      formData.append("fileType", "IMAGE");
      formData.append("moduleName", "MENUITEM");
      formData.append("moduleRecordId", moduleRecordId);
      formData.append("userId", Id);

      const response = await uploadFileformenu(formData);

      if (response?.data?.success !== true) {
        throw new Error(response?.data?.msg || "Image upload failed");
      }

      const imagePath = response.data.fullPath;

      setTableData((prev) =>
        prev.map((item) =>
          item.id === moduleRecordId ? { ...item, image: imagePath } : item,
        ),
      );

      Swal.fire({
        title: "Uploaded!",
        text: response.data.msg,
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Upload failed:", error);

      Swal.fire(
        "Error",
        error.response?.data?.msg || error.message || "Image upload failed",
        "error",
      );
    }
  };

  const handlePagination = (page) => {
    setCurrentPage(page);
    fetchPage(page, searchQuery, categoryFilter, subCategoryFilter);
  };

  // ✅ FIX: Save current page before navigating to edit
  const handleEdit = (menuItem) => {
    localStorage.setItem("menuItemsPage", currentPage);
    navigate("/master/menu-items", {
      state: { editData: menuItem._originalItem },
    });
  };

  const statusmenuitem = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await updatestatusmneuitem(id, newStatus);

      setTableData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item,
        ),
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleImageUpload = (e, itemId) => {
    const file = e.target.files[0];
    if (file) {
      uploadImage(itemId, file);
    }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);

  return (
    <Fragment>
      <Container>
        {syncLoading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
            <img
              src={toAbsoluteUrl("/media/icons/loading.gif")}
              alt="Loading..."
              className="w-18 rounded-xl shadow-2xl"
            />
          </div>
        )}
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="COMMON.MENU_ITEM_RECIPE_MASTER"
              defaultMessage="Menu Item Recipe Master"
            />
          </h1>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <i className="ki-filled ki-magnifier leading-none text-sm text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-2.5" />
              <input
                className="input pl-7 h-8 text-sm w-[160px]"
                placeholder={intl.formatMessage({
                  id: "MASTER.SEARCH_MENU_ITEMS",
                  defaultMessage: "Search Menu Items",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select
              size="small"
              className="w-[160px]"
              showSearch
              allowClear
              placeholder="All Categories"
              optionFilterProp="label"
              value={categoryFilter || undefined}
              onChange={(value) => {
                const selected = value || "";
                setCategoryFilter(selected);
                setSubCategoryFilter("");
                setCurrentPage(1);
                fetchPage(1, searchQuery, selected, "");
              }}
              options={[
                { value: "", label: "All Categories" },
                ...categoryList.map((item) => ({
                  value: item.id,
                  label: item.nameEnglish || "-",
                })),
              ]}
            />

            <Select
              size="small"
              className="w-[160px]"
              showSearch
              allowClear
              placeholder="All Subcategories"
              optionFilterProp="label"
              value={subCategoryFilter || undefined}
              onChange={(value) => {
                const selected = value || "";
                setSubCategoryFilter(selected);
                setCurrentPage(1);
                fetchPage(1, searchQuery, categoryFilter, selected);
              }}
              options={[
                { value: "", label: "All Subcategories" },
                ...(subCategoryList || []).map((item) => ({
                  value: item.id,
                  label: item.nameEnglish || item.name || "-",
                })),
              ]}
            />

            <Select
              size="small"
              className="w-[160px]"
              placeholder="With Recipe"
              value={isWithRecipe}
              onChange={(value) => handleWithRecipeToggle(value)}
              options={[
                { value: "", label: "All" },
                { value: true, label: "With Recipe" },
                { value: false, label: "Without Recipe" },
              ]}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
          {canAccessCaptainRecipe && permissions.add && (
           
              <Button
                size="medium"
                type="primary"
                icon={<SyncOutlined spin={captainSyncLoading} />}
                loading={captainSyncLoading}
                onClick={syncCaptainRecipe}
                className="bg-primary px-5 rounded-md text-xs"
              >
                Sync Captain
              </Button>
            
          )}
            {permissions.add && (
              <Button
                size="medium"
                type="primary"
                icon={<SyncOutlined spin={syncLoading} />}
                loading={syncLoading}
                onClick={syncrawmatrial}
                className="bg-primary px-5 rounded-md text-xs"
              >
                Sync Raw Material
              </Button>
            )}

            {permissions.add && (
              <Button
                size="medium"
                type="primary"
                icon={<i className="ki-filled ki-plus text-xs" />}
                onClick={() => navigate("/master/menu-items")}
                className="bg-primary px-5 rounded-md text-xs"
              >
                Create New
              </Button>
            )}
          </div>
        </div>

        {/* Native Table */}
        <div className="card">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="table table-auto">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Sr. No.
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Image
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      <button
                        className="flex items-center gap-3 hover:text-primary transition-colors"
                        onClick={() => handleSort("nameEnglish")}
                      >
                        <span>Name</span>

                        <span className="flex flex-col leading-none">
                          <i
                            className={`ki-filled ki-up text-[10px] ${sortField === "nameEnglish" && isAsc === true ? "text-primary" : "text-gray-300"}`}
                          />
                          <i
                            className={`ki-filled ki-down text-[10px] ${sortField === "nameEnglish" && isAsc === false ? "text-primary" : "text-gray-300"}`}
                          />
                        </span>
                      </button>
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Sub Category
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Price (100 Pax)
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Sequence
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-gray-700">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" className="text-center py-8">
                        <Spin size="large" />
                        <p className="mt-2 text-gray-600">Loading...</p>
                      </td>
                    </tr>
                  ) : tableData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center py-8 text-gray-500"
                      >
                        No menu items found
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
                          <div className="relative inline-block w-20 h-20 group">
                            <img
                              src={item.image || "/no-image.png"}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-md border"
                            />
                            <label className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center cursor-pointer shadow-md hover:bg-primary/90 transition-all">
                              <i className="ki-filled ki-cloud-add text-white text-xs"></i>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, item.id)}
                              />
                            </label>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-800 font-medium">
                          {item.name}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {item.category}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {item.subCategory}
                        </td>
                        <td className="py-4 px-6 text-gray-800">
                          {item.price}
                        </td>
                        <td className="py-4 px-6 text-gray-800">
                          {item.sequence}
                        </td>
                        <td className="py-4 px-6">
                          <label className="switch switch-sm">
                            <input
                              type="checkbox"
                              checked={item.status}
                              onChange={() =>
                                statusmenuitem(item.id, item.status)
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

    {item.video && (
      <button
        className="w-9 h-9 flex items-center justify-center rounded hover:bg-red-50 text-red-600 transition-colors"
        onClick={() => openVideoModal(item.video)}
        title="Watch Video"
      >
        <i className="ki-filled ki-youtube text-lg"></i>
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
                  disabled={currentPage === totalPages}
                >
                  Next
                  <i className="ki-filled ki-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        {videoModal.open && (
  <div
    className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4"
    onClick={closeVideoModal}
  >
    <div
      className="relative w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={closeVideoModal}
        className="absolute -top-10 right-0 text-white text-2xl leading-none hover:text-gray-300"
        aria-label="Close"
      >
        &times;
      </button>
      <iframe
        src={videoModal.url}
        title="Menu Item Video"
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  </div>
)}
      </Container>
    </Fragment>
  );
};

export default MenuItems;