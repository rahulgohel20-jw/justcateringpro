import { Fragment, useEffect, useState, useMemo, useRef } from "react";
import { buildSpellSuggestions, extractDictWords } from "@/utils";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import AddMenuCategory from "@/partials/modals/add-menu-category/AddMenuCategory";
import Swal from "sweetalert2";
import {
  GetAllCategory,
  DeleteCategoryId,
  UpdateStatus,
  Getgenerateusermenuitemrawmaterialexcel
} from "@/services/apiServices";
import ViewMenuCategory from "../../../partials/modals/view-menu-category/ViewMenuCategory";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { Spin } from "antd";
import { usePermission } from "../../../hooks/usePermission";

const MenuCategory = () => {
  const permissions = usePermission("Category");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isViewCategoryModalOpen, setIsViewCategoryModalOpen] = useState(false);
  const [selectedMenuCategory, setSelectedCategory] = useState(null);
  const [allTableData, setAllTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const intl = useIntl();

  // Spelling suggestion state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  let Id = localStorage.getItem("userId");

  // Fetch ALL categories
  const FetchCategoryData = async () => {
    setLoading(true);
    try {
      const res = await GetAllCategory({
        userid: Id,
        menuCategoryName: "",
      });

      const list = res.data.data["Menu Category Details"] || [];
      setOriginalData(list);
    } catch (error) {
      console.error("Error fetching category:", error);
      setOriginalData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    FetchCategoryData();
  }, []);

  // Map data based on language
  useEffect(() => {
    const languageMap = {
      en: "nameEnglish",
      hi: "nameHindi",
      gu: "nameGujarati",
    };

    const field = languageMap[intl.locale] || "nameEnglish";

    const mapped = originalData.map((item, index) => ({
      ...item,
      sr_no: index + 1,
      // Display name based on current language
      displayName: item[field] || "-",
      // IMPORTANT: Keep all original language fields for search
      nameEnglish: item.nameEnglish || "",
      nameHindi: item.nameHindi || "",
      nameGujarati: item.nameGujarati || "",
      imagePath: item.imagePath || "",
    }));

    setAllTableData(mapped);
  }, [originalData, intl.locale]);

  // Extract dict words for suggestions
  useEffect(() => {
    if (!originalData || originalData.length === 0) return;
    const words = extractDictWords(originalData, [
      "nameEnglish",
      "nameHindi",
      "nameGujarati",
      "name",
    ]);
    setDictWords(words);
  }, [originalData]);

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

  // Client-side filtering - searches across ALL language fields
  const filteredTableData = useMemo(() => {
    if (!searchQuery.trim()) {
      return allTableData;
    }

    const query = searchQuery.toLowerCase().trim();

    const filtered = allTableData.filter((item) => {
      // Search across all language fields
      const searchInEnglish = (item.nameEnglish || "")
        .toLowerCase()
        .includes(query);
      const searchInHindi = (item.nameHindi || "")
        .toLowerCase()
        .includes(query);
      const searchInGujarati = (item.nameGujarati || "")
        .toLowerCase()
        .includes(query);

      const matchesSearch =
        searchInEnglish || searchInHindi || searchInGujarati;

      return matchesSearch;
    });

    return filtered;
  }, [allTableData, searchQuery]);

  const DeleteCategory = (id) => {
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
        DeleteCategoryId(id)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchCategoryData();
              Swal.fire({
                title: "Removed!",
                text: "Menu Category has been removed successfully.",
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
          .catch((error) => {
            console.error("Error deleting Event type:", error);
          });
      }
    });
  };

  const statusCategory = (id, status) => {
    UpdateStatus(id, status)
      .then((res) => {
        FetchCategoryData();
        if (res.data?.msg) {
          Swal.fire({
            title: "Success!",
            text: res.data.msg,
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        }
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleView = (category) => {
    setSelectedCategory(category);
    setIsViewCategoryModalOpen(true);
  };

  const handleExportExcel = async () => {
    const payload = {
      isCaptainReceipe: false,
      isCaptainReceipeRawMaterial: false,
      isMenuCategory: true, // only Menu Category
      isMenuItem: false,
      isMenuItemRawMaterial: false,
      isRawMaterial: false,
      isRawMaterialCat: false,
      isUnit: false,
    };

    try {
      setIsExporting(true);
      const res = await Getgenerateusermenuitemrawmaterialexcel(Id, payload);

      const d = res?.data;
      const fileUrl =
        d?.report_path ||
        d?.data?.report_path ||
        d?.excel_path ||
        d?.data?.excel_path ||
        d?.file_path ||
        d?.data?.file_path ||
        d?.url ||
        (typeof d?.data === "string" ? d.data : null);

      if (fileUrl) {
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = "Menu_Category.xlsx";
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.log("Export response:", res?.data);
        throw new Error("No file URL returned");
      }
    } catch (error) {
      console.error("Export error:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to export Excel.",
        icon: "error",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const refreshData = () => {
    FetchCategoryData();
  };

  return (
    <Fragment>
      <Container>
        <div className="gap-2 pb-2 mb-3">
          <h1 className="test-xl text-gray-900">
            <FormattedMessage
              id="MENU_CATEGORY.MASTER"
              defaultMessage="Menu Category Master"
            />
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative" ref={searchBoxRef}>
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "MENU_CATEGORY.SEARCH_PLACEHOLDER",
                  defaultMessage: "Search Category...",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                }}
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
            {loading && (
              <div className="flex items-center gap-2 text-primary">
                <Spin size="small" />
                <span className="text-sm">
                  <FormattedMessage
                    id="COMMON.LOADING"
                    defaultMessage="Loading..."
                  />
                </span>
              </div>
            )}

            {!loading && (
              <span className="text-sm text-gray-600">
                <FormattedMessage
                  id="COMMON.SHOWING_CATEGORIES"
                  defaultMessage="Showing {shown} of {total} categories"
                  values={{
                    shown: filteredTableData.length,
                    total: allTableData.length,
                  }}
                />
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-light"
              onClick={handleExportExcel}
              disabled={isExporting}
            >
              <i className="ki-filled ki-file-down"></i>{" "}
              {isExporting ? "Exporting..." : "Excel"}
            </button>

            {permissions.add && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                title="Add Category"
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="MENU_CATEGORY.ADD_CATEGORY_BUTTON"
                  defaultMessage="Create New"
                />
              </button>
            )}
          </div>
        </div>

        <AddMenuCategory
          isModalOpen={isCategoryModalOpen}
          setIsModalOpen={setIsCategoryModalOpen}
          refreshData={refreshData}
          editData={selectedMenuCategory}
        />

        <ViewMenuCategory
          isModalOpen={isViewCategoryModalOpen}
          setIsModalOpen={setIsViewCategoryModalOpen}
          editData={selectedMenuCategory}
        />

        <TableComponent
          columns={columns(
            handleEdit,
            DeleteCategory,
            statusCategory,
            handleView,
            permissions,
          )}
          data={filteredTableData}
          loading={loading}
          pagination={false}
        />
      </Container>
    </Fragment>
  );
};

export default MenuCategory;
