import { Fragment, useEffect, useState, useMemo, useRef } from "react";
import { buildSpellSuggestions, extractDictWords } from "@/utils";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import Swal from "sweetalert2";
import {
  GetAllDecorCategory,
  DeleteDecorCategory,
  UpdateDecorCategoryStatus,
} from "@/services/apiServices";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { Spin } from "antd";
import { usePermission } from "../../../hooks/usePermission";
import AddDecorCategoryModal from "../../../partials/modals/add-decor-category/AddDecorCategory";

const DecorCategory = () => {
  const permissions = usePermission("Decor Category");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedDecorCategory, setSelectedDecorCategory] = useState(null);
  const [allTableData, setAllTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter] = useState("all");

  const intl = useIntl();
  const userId = localStorage.getItem("userId");

  // Spelling suggestion state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  const FetchCategoryData = async () => {
    setLoading(true);
    try {
      const res = await GetAllDecorCategory(userId);
      const list =
        res?.data?.data?.["Decore Main Category Details"] ||
        res?.data?.data ||
        [];
      setOriginalData(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error fetching decor category:", error);
      setOriginalData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    FetchCategoryData();
  }, []);

  useEffect(() => {
    const language = localStorage.getItem("lang");

    const languageMap = {
      en: "nameEnglish",
      hi: "nameHindi",
      gu: "nameGujarati",
    };

    const field = languageMap[language] || "nameEnglish";

    const mapped = originalData.map((item, index) => ({
      ...item,
      sr_no: index + 1,
      displayName: item[field] || "-",
      nameEnglish: item.nameEnglish || "",
      nameHindi: item.nameHindi || "",
      nameGujarati: item.nameGujarati || "",
      imagePath: item.imagePath || "",
    }));

    setAllTableData(mapped);
  }, [originalData]);

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

  // Client-side filtering
  const filteredTableData = useMemo(() => {
    return allTableData.filter((item) => {
      // Status filter
      if (activeFilter === "active" && !item.isActive) return false;
      if (activeFilter === "inactive" && item.isActive) return false;

      // Search across all languages
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      return (
        (item.nameEnglish || "").toLowerCase().includes(query) ||
        (item.nameHindi || "").toLowerCase().includes(query) ||
        (item.nameGujarati || "").toLowerCase().includes(query)
      );
    });
  }, [allTableData, searchQuery, activeFilter]);

  const deleteDecorCategory = (id) => {
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
        DeleteDecorCategory(id)
          .then((response) => {
            if (response && (response.success || response.data?.success)) {
              FetchCategoryData();
              Swal.fire({
                title: "Removed!",
                text: "Decor Category has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                title: "Error",
                text: response?.data?.msg || "Failed to delete",
                icon: "error",
                showConfirmButton: true,
              });
            }
          })
          .catch((error) => {
            console.error("Error deleting Decor Category:", error);
          });
      }
    });
  };

  const toggleStatus = (id, currentStatus) => {
    UpdateDecorCategoryStatus(id, !currentStatus)
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
    setSelectedDecorCategory(category);
    setIsCategoryModalOpen(true);
  };

  const refreshData = () => {
    FetchCategoryData();
  };

  return (
    <Fragment>
      <Container>
        <div className="gap-2 pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="DECOR_CATEGORY.MASTER"
              defaultMessage="Decor Category Master"
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
                  id: "DECOR_CATEGORY.SEARCH_PLACEHOLDER",
                  defaultMessage: "Search Decor Category...",
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

          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedDecorCategory(null);
                  setIsCategoryModalOpen(true);
                }}
                title="Add Decor Category"
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="COMMON.CREATE_NEW"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>

        <AddDecorCategoryModal
          isModalOpen={isCategoryModalOpen}
          setIsModalOpen={setIsCategoryModalOpen}
          refreshData={refreshData}
          editData={selectedDecorCategory}
        />

        <TableComponent
          columns={columns(
            handleEdit,
            deleteDecorCategory,
            toggleStatus,
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

export default DecorCategory;
