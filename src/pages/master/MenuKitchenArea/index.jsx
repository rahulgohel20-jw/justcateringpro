import { Fragment, useEffect, useState, useRef } from "react";
import { buildSpellSuggestions, extractDictWords } from "@/utils";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import AddKitchenArea from "@/partials/modals/add-kitchen-area/AddKitchenArea";
import { GetAllKitchenAreaById } from "@/services/apiServices";
import {
  DeleteKitchenArea,
  UpdateStatusKitchenArea,
} from "../../../services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";

const MenuKitchenArea = () => {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedMenuCategory, setSelectedCategory] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();
  const [originalData, setOriginalData] = useState([]);

  // Spelling suggestion state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  let Id = localStorage.getItem("userId");

  const FetchCategoryData = async () => {
    try {
      const res = await GetAllKitchenAreaById(Id);

      let list = Array.isArray(res?.data?.data?.["KitchenAreas Details"])
        ? res.data.data["KitchenAreas Details"]
        : [];

      if (searchQuery.trim()) {
        list = list.filter((item) =>
          item.nameEnglish?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setOriginalData(list);
    } catch (error) {
      console.error("Error fetching kitchen area:", error);
      setOriginalData([]);
    }
  };

  useEffect(() => {
    FetchCategoryData();
  }, [searchQuery]);

  // Extract dict words for suggestions
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await GetAllKitchenAreaById(Id);
        if (cancelled) return;
        const list = Array.isArray(res?.data?.data?.["KitchenAreas Details"])
          ? res.data.data["KitchenAreas Details"]
          : [];
        const words = extractDictWords(list, [
          "nameEnglish",
          "nameHindi",
          "nameGujarati",
          "name",
        ]);
        setDictWords(words);
      } catch (err) {
        console.error("Failed to load spelling dictionary:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [Id]);

  useEffect(() => {
    if (originalData && originalData.length > 0) {
      const words = extractDictWords(originalData, [
        "nameEnglish",
        "nameHindi",
        "nameGujarati",
        "name",
      ]);
      if (words.length > 0) {
        setDictWords((prev) => Array.from(new Set([...prev, ...words])));
      }
    }
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

    const mapped = originalData.map((item, index) => ({
      id: item.id,
      sr_no: index + 1,
      category: item[field] || "-",
      createdAt: item.createdAt,
      userName: `${item.user?.firstName || ""} ${item.user?.lastName || ""}`,
      plan: item.user?.plan?.name || "-",
      role: item.user?.userBasicDetails?.role?.name || "-",
      isActive: item.isActive ?? item.status ?? false,
      raw: item,
    }));

    setTableData(mapped);
  }, [originalData, localStorage.getItem("lang")]);

  const statusKitchen = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus; // toggle
      await UpdateStatusKitchenArea(id, newStatus);
      FetchCategoryData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  const DeleteCategory = async (id) => {
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
        DeleteKitchenArea(id)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchCategoryData();
              Swal.fire({
                title: "Removed!",
                text: "Kitchen Area has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.message || "API call failed");
            }
          })
          .catch((err) => {
            console.error("Delete error:", err);
          });
      }
    });
  };

  const handleEdit = (categoryRow) => {
    setSelectedCategory(categoryRow.raw);
    setIsCategoryModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs
            items={[
              {
                title: (
                  <FormattedMessage
                    id="COMMON.KITCHEN_AREA"
                    defaultMessage="Kitchen Area"
                  />
                ),
              },
            ]}
          />
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative" ref={searchBoxRef}>
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "COMMON.SEARCH_KITCHEN_AREA",
                  defaultMessage: "Search",
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
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedCategory(null);
                setIsCategoryModalOpen(true);
              }}
              title="Add Kitchen Area"
            >
              <i className="ki-filled ki-plus"></i>{" "}
              <FormattedMessage
                id="COMMON.ADD_KITCHEN_AREA"
                defaultMessage="Add Kitchen Area"
              />
            </button>
          </div>
        </div>
        <AddKitchenArea
          isModalOpen={isCategoryModalOpen}
          setIsModalOpen={setIsCategoryModalOpen}
          refreshData={FetchCategoryData}
          selectedMenuCategory={selectedMenuCategory}
        />
        <TableComponent
          columns={columns(handleEdit, DeleteCategory, statusKitchen)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};
export default MenuKitchenArea;
