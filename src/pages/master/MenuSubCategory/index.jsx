import { Fragment, useEffect, useState, useRef } from "react";
import { buildSpellSuggestions, extractDictWords } from "@/utils";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import AddMenuSubCategory from "@/partials/modals/add-menu-sub-category/AddMenuSubCategory";
import {
  GetAllSubCategory,
  DeleteSubCategoryId,
  UpdateSubStatus,
} from "@/services/apiServices";
import { columns } from "./constant";
import { successMsgPopup } from "../../../underConstruction";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";

const MenuSubCategory = () => {
  const permissions = usePermission("Sub Category");
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedMenuCategory, setSelectedCategory] = useState(null);
  const [tableData, setTableData] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [originalData, setOriginalData] = useState([]);

  const intl = useIntl();

  // Spelling suggestion state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  const FetchSubCategoryData = () => {
    const Id = localStorage.getItem("userId");
    if (!Id) return;
    GetAllSubCategory({ userid: Id, menuSubCategoryName: searchQuery })
      .then((res) => {
        const list = res.data.data["Menu Sub Category Details"] || [];
        setOriginalData(list);
      })
      .catch((error) => console.error("Error fetching sub category:", error));
  };

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
        DeleteSubCategoryId(id)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchSubCategoryData();
              Swal.fire({
                title: "Removed!",
                text: "Menu Item Sub has been removed successfully.",
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
  const statusSubCategory = (id, status) => {
    UpdateSubStatus(id, status)
      .then((res) => {
        FetchSubCategoryData();
        res.data?.msg && successMsgPopup(res.data.msg);
      })
      .catch((error) => {
        console.error("Error deleting Event type:", error);
      });
  };
  const handleEdit = (category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      FetchSubCategoryData();
    }, 400);

    return () => clearTimeout(delay);
  }, [searchQuery]);

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

  useEffect(() => {
    const language = localStorage.getItem("lang");

    const languageMap = {
      en: "nameEnglish",
      hi: "nameHindi",
      gu: "nameGujarati",
    };

    const field = languageMap[language] || "nameEnglish";

    let mapped = originalData.map((item, index) => ({
      ...item,
      sr_no: index + 1,
      nameEnglish: item[field] || "-",
      category: item.menuCategory ? item.menuCategory[field] : "-",
    }));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      mapped = mapped.filter(
        (item) =>
          item[field]?.toLowerCase().includes(q) ||
          item.menuCategory?.[field]?.toLowerCase().includes(q) ||
          item.sequence?.toString().includes(q),
      );
    }

    setTableData(mapped);
  }, [originalData, searchQuery, localStorage.getItem("lang")]);

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="test-xl text-gray-900">
            <FormattedMessage
              id="MENU_ITEM_SUB_CATEGORY"
              defaultMessage="Menu Item Sub Category"
            />
          </h1>
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative" ref={searchBoxRef}>
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "SEARCH_SUB_CATEGORY",
                  defaultMessage: "Search Sub Category",
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
                        className={`px-3 py-2 cursor-pointer text-sm text-primary capitalize ${i === spellIndex ? "bg-gray-100" : "hover:bg-gray-50"
                          }`}
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
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
                  id="ADD_SUB_CATEGORY"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>
        <AddMenuSubCategory
          isModalOpen={isCategoryModalOpen}
          setIsModalOpen={setIsCategoryModalOpen}
          refreshData={FetchSubCategoryData}
          editData={selectedMenuCategory}
        />
        <TableComponent
          columns={columns(
            handleEdit,
            DeleteCategory,
            statusSubCategory,
            permissions,
          )}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};
export default MenuSubCategory;
