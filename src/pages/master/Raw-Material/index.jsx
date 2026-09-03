import { Fragment, useEffect, useState, useMemo, useRef } from "react";
import { Container } from "@/components/container";
import { columns } from "./constant";
import { toAbsoluteUrl } from "@/utils/Assets";
import {
  GetAllRawMaterial,
  Deleterawmaterial,
  updateRawMaterialStatus,
  GetRawMaterialcategory,
  UpdateSequence,
  SearchRawMaterial,
  Getallgeneralfix,
} from "@/services/apiServices";
import useStyle from "./style";
import AddRawMaterial from "@/partials/modals/add-raw-material/AddRawMaterial";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { Select } from "antd";
import { usePermission } from "../../../hooks/usePermission";

const RawMaterial = () => {
  const permissions = usePermission("Items");
  const abortControllerRef = useRef(null);
  const isFirstRender = useRef(true);
  const classes = useStyle();
  const [isRawMaterialModalOpen, setIsRawMaterialModalOpen] = useState(false);
  const [selectedRawMaterial, setSelectedRawMaterial] = useState(null);
  const [allTableData, setAllTableData] = useState([]);
  const [displayData, setDisplayData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const intl = useIntl();
  const [rawOriginalData, setRawOriginalData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [generalFixFilter, setGeneralFixFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortOrder, setSortOrder] = useState("");
  let Id = localStorage.getItem("userId");

  const field = useMemo(() => {
  const languageMap = {
    en: "nameEnglish",
    hi: "nameHindi",
    gu: "nameGujarati",
  };
  return languageMap[intl.locale] || "nameEnglish";
}, [intl.locale]);

  const ITEMS_PER_PAGE = 100;

  const FetchRawMaterial = (
    page = currentPage,
    categoryId = 0,
    isAsc = sortOrder,
  ) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setLoading(true);
    GetAllRawMaterial(isAsc, page, ITEMS_PER_PAGE, categoryId, Id)
      .then((res) => {
        const data = res?.data?.data || {};
        setRawOriginalData(data["Raw Material Details"] || []);
        setTotalRecords(data.totalItems || 0);
      })
      .catch((err) => {
        if (err?.code === "ERR_CANCELED" || signal.aborted) return;
        setRawOriginalData([]);
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });
  };

  const FetchSearchRawMaterial = (
    searchTerm,
    page = currentPage,
    isAsc = sortOrder,
  ) => {
    if (!searchTerm.trim()) {
      FetchRawMaterial(page);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    setLoading(true);
    SearchRawMaterial(isAsc, Id, page, ITEMS_PER_PAGE, searchTerm)
      .then((res) => {
        if (signal.aborted) return;
        const data = res?.data?.data || {};
        setRawOriginalData(data["Raw Material Details"] || []);
        setTotalRecords(data.totalItems || 0);
      })
      .catch((err) => {
        if (err?.code === "ERR_CANCELED" || signal.aborted) return;
        setRawOriginalData([]);
        setTotalRecords(0);
      })
      .finally(() => {
        if (!signal.aborted) setLoading(false);
      });
  };

  const FetchGeneralFix = async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    try {
      setLoading(true);
      const res = await Getallgeneralfix(Id, signal);
      if (signal.aborted) return;
      const items = res?.data?.data?.items || [];
      setRawOriginalData(items);
      setTotalRecords(items.length);
    } catch (error) {
      if (error?.code === "ERR_CANCELED" || signal.aborted) return;
      console.error("Error fetching general fix:", error);
      setRawOriginalData([]);
      setTotalRecords(0);
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  };

  const FetchCategories = () => {
    GetRawMaterialcategory(Id)
      .then((res) => {
        const list = res.data.data["Raw Material Category Details"] || [];
        setCategories(list);
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        setCategories([]);
      });
  };

  useEffect(() => {
    FetchCategories();
  }, []);

  useEffect(() => {
    if (generalFixFilter) {
      FetchGeneralFix(sortOrder);
    } else if (searchQuery.trim()) {
      FetchSearchRawMaterial(searchQuery, currentPage, sortOrder);
    } else {
      FetchRawMaterial(currentPage, categoryFilter || 0, sortOrder);
    }
  }, [currentPage, categoryFilter, sortOrder, generalFixFilter]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (generalFixFilter) return;
    const timer = setTimeout(() => {
      setCurrentPage(1);
      if (searchQuery.trim()) {
        FetchSearchRawMaterial(searchQuery, 1, sortOrder);
      } else {
        FetchRawMaterial(1, categoryFilter || 0, sortOrder);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
  const languageMap = {
    en: "nameEnglish",
    hi: "nameHindi",
    gu: "nameGujarati",
  };
  const f = languageMap[intl.locale] || "nameEnglish";

  const mapped = rawOriginalData.map((raw, index) => ({
    sr_no: (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
    raw_material_id: raw.id,
    raw_material_cat_id: raw.rawMaterialCat?.id,
    raw_material_name: raw[f] || "-",
    raw_material_category: raw.rawMaterialCat?.[f] || "-",
    isActive: raw.isActive,
    unit: raw.unit?.[f] || "-",
    unitId: raw.unit?.id,
    priority: raw.sequence,
    rate: raw.supplierRate,
    suppliers: raw.rawMaterialSuppliers,
    weightPer100Pax: raw.weightPer100Pax,
    isGeneralFix: raw.isGeneralFix,
    nameEnglish: raw.nameEnglish || "",
    nameGujarati: raw.nameGujarati || "",
    nameHindi: raw.nameHindi || "",
    file: raw.file || "",
    opbStock: raw.opbStock ?? "",
    minStock: raw.minStock ?? "",
    expiryDate: raw.expiryDate || "",
    isCalculate: raw.isApplyCal ?? false,
    dailyConsumption: raw.dailyConsumption || "",
    cgst: raw.cgst ?? "",
  sgst: raw.sgst ?? "",
  igst: raw.igst ?? "",
  cess: raw.cess ?? "",
  }));

  setAllTableData(mapped);
  setDisplayData(mapped);
}, [rawOriginalData, currentPage, intl.locale]);
  const totalPages = Math.ceil(totalRecords / ITEMS_PER_PAGE);

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      return;
    }

    const reorderedData = [...displayData];
    const [draggedItem] = reorderedData.splice(draggedIndex, 1);
    reorderedData.splice(dropIndex, 0, draggedItem);
    setDisplayData(reorderedData);

    const updatePayload = reorderedData.map((item, index) => ({
      rawMaterialCatId: item.raw_material_cat_id || 0,
      rawMaterialId: item.raw_material_id,
      sequence: index + 1,
    }));

    UpdateSequence(updatePayload)
      .then(() => handleRefreshData())
      .catch(() => {
        setDisplayData(allTableData);
        Swal.fire({
          title: "Error!",
          text: "Failed to update sequence.",
          icon: "error",
        });
      });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const DeleteRawMaterial = (raw_material_id) => {
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
        Deleterawmaterial(raw_material_id)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              handleRefreshData();
              Swal.fire({
                title: "Removed!",
                text: "Raw material has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                title: "Error",
                text: response?.data.msg,
                icon: "error",
              });
            }
          })
          .catch((error) =>
            console.error("Error deleting raw material:", error),
          );
      }
    });
  };

  const handleEdit = (raw_material_id) => {
    setSelectedRawMaterial(raw_material_id);
    setIsRawMaterialModalOpen(true);
  };

  const statusRaw = (raw_material_id, status) => {
    updateRawMaterialStatus(raw_material_id, status)
      .then(() => handleRefreshData())
      .catch((error) => console.error("Error status update:", error));
  };

  const handleRefreshData = () => {
    if (generalFixFilter) {
      FetchGeneralFix(sortOrder);
    } else if (searchQuery.trim()) {
      FetchSearchRawMaterial(searchQuery, currentPage, sortOrder);
    } else {
      FetchRawMaterial(currentPage, categoryFilter || 0, sortOrder);
    }
  };

  const tableColumns = columns(
    handleEdit,
    DeleteRawMaterial,
    statusRaw,
    permissions,
  );

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="COMMON.RAW_MATERIAL_ITEM_MASTER"
              defaultMessage="Raw Material Item Master"
            />
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}
          >
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "COMMON.RAW_MATERIAL_SEARCH",
                  defaultMessage: "Raw Material Search...",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filItems">
              <Select
                className="min-w-[220px]"
                showSearch
                allowClear
                placeholder={intl.formatMessage({
                  id: "COMMON.ALL_CATEGORIES",
                  defaultMessage: "All Categories",
                })}
                optionFilterProp="label"
                value={categoryFilter || undefined}
                onChange={(value) => {
                  setCategoryFilter(value || "");
                  setCurrentPage(1);
                }}
                options={[
                  {
                    value: "",
                    label: intl.formatMessage({
                      id: "COMMON.ALL_CATEGORIES",
                      defaultMessage: "All Categories",
                    }),
                  },
                  ...categories.map((cat) => ({
                    value: cat.id,
                    label: cat[field],
                  })),
                ]}
              />
            </div>

            <button
              className={`btn ${generalFixFilter ? "btn-primary" : "btn-secondary"}`}
              onClick={() => {
                setGeneralFixFilter((prev) => !prev);
                setCurrentPage(1);
              }}
            >
              <FormattedMessage
                id={generalFixFilter ? "COMMON.SHOW_ALL" : "COMMON.GENERAL_FIX"}
                defaultMessage={generalFixFilter ? "Show All" : "General Fix"}
              />
            </button>

            {(searchQuery || generalFixFilter) && (
              <span className="text-sm text-gray-600">
                {displayData.length} of {totalRecords} items
              </span>
            )}
          </div>

          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedRawMaterial(null);
                  setIsRawMaterialModalOpen(true);
                }}
              >
                <i className="ki-filled ki-plus"></i>
                <FormattedMessage
                  id="USER.MASTER.ADD_CONTACT_CATEGORY"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>

        <AddRawMaterial
          isOpen={isRawMaterialModalOpen}
          onClose={setIsRawMaterialModalOpen}
          refreshData={handleRefreshData}
          rawmaterial={selectedRawMaterial}
        />

        <div className="card">
          <div className="table-responsive">
            <div className="relative">
              {loading && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                  <img
                    src={toAbsoluteUrl("/media/icons/loading.gif")}
                    alt="Loading..."
                    className="w-18 rounded-xl shadow-2xl"
                  />
                </div>
              )}
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th className="w-10">
                      <i className="ki-filled ki-sort-vertical text-gray-500"></i>
                    </th>
                    {tableColumns.map((col, index) => (
                      <th key={index}>
                        {col.accessorKey === "raw_material_name" ? (
                          <div
                            className="flex items-center gap-3 cursor-pointer select-none"
                            onClick={() =>
                              setSortOrder((prev) =>
                                prev === ""
                                  ? "true"
                                  : prev === "true"
                                    ? "false"
                                    : "",
                              )
                            }
                          >
                            {col.header}
                            <span className="flex flex-col leading-none text-gray-400">
                              {sortOrder === "" && (
                                <i className="ki-filled ki-arrow-up-down text-sm text-gray-400" />
                              )}
                              {sortOrder === "true" && (
                                <i className="ki-filled ki-arrow-up text-sm text-primary" />
                              )}
                              {sortOrder === "false" && (
                                <i className="ki-filled ki-arrow-down text-sm text-primary" />
                              )}
                            </span>
                          </div>
                        ) : (
                          col.header
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayData.length === 0 ? (
                    <tr>
                      <td
                        colSpan={tableColumns.length + 1}
                        className="text-center py-10 text-gray-500"
                      >
                        No data available
                      </td>
                    </tr>
                  ) : (
                    displayData.map((row, rowIndex) => (
                      <tr
                        key={row.raw_material_id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, rowIndex)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, rowIndex)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, rowIndex)}
                        className={`cursor-grab transition-all ${
                          dragOverIndex === rowIndex
                            ? "border-t-2 border-primary"
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            draggedIndex === rowIndex
                              ? "#f3f4f6"
                              : "transparent",
                        }}
                      >
                        <td className="text-center cursor-grab active:cursor-grabbing">
                          ⋮⋮
                        </td>
                        {tableColumns.map((col, colIndex) => (
                          <td key={colIndex}>
                            {col.cell
                              ? col.cell({ row: { original: row } })
                              : row[col.accessorKey]}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {!generalFixFilter && (
                <div className="flex justify-end gap-2 p-3">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="py-1 px-3 rounded-lg bg-[#005BA8] text-white disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span className="text-sm flex items-center">
                    Page {currentPage} of {totalPages || 1}
                  </span>
                  <button
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className="py-1 px-3 rounded-lg bg-[#005BA8] text-white disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </Fragment>
  );
};

export default RawMaterial;
