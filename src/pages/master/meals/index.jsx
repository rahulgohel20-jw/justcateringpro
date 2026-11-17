import { Fragment, useEffect, useState, useRef } from "react";
import { buildSpellSuggestions, extractDictWords } from "@/utils";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import useStyle from "./style";
import {
  GetMealType,
  DeleteMealType,
  SearchMealtype,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import AddMeal from "@/partials/modals/add-meal/AddMeal";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";

const MealMaster = () => {
  const permissions = usePermission("Food Prefrence");
  const classes = useStyle();
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const intl = useIntl();
  const Id = localStorage.getItem("userId");

  // Spelling suggestion state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  const getTranslatedName = (item) => {
    switch (intl.locale) {
      case "hi":
        return item.nameHindi || item.nameEnglish || "-";
      case "gu":
        return item.nameGujarati || item.nameEnglish || "-";
      default:
        return item.nameEnglish || "-";
    }
  };

  const FetchMealType = () => {
    GetMealType(Id)
      .then((res) => {
        const mealData = res.data?.data?.["MealType Details"] || [];

        const formatMeal = (item, index) => ({
          sr_no: index + 1,
          meal_type: getTranslatedName(item),
          mealid: item.id,
          nameEnglish: item.nameEnglish || "",
          nameGujarati: item.nameGujarati || "",
          nameHindi: item.nameHindi || "",
          isJainSlogan: item.isJainSlogan,
        });

        setTableData(mealData.map(formatMeal));
      })
      .catch((error) => {
        console.error("Error fetching meal types:", error);
      });
  };

  useEffect(() => {
    FetchMealType();
  }, []);

  // Extract dict words for suggestions
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await GetMealType(Id);
        if (cancelled) return;
        const list = res?.data?.data?.["MealType Details"] || [];
        const words = extractDictWords(list, [
          "nameEnglish",
          "nameHindi",
          "nameGujarati",
          "meal_type",
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
    if (tableData && tableData.length > 0) {
      const words = extractDictWords(tableData, [
        "nameEnglish",
        "nameHindi",
        "nameGujarati",
        "meal_type",
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

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        FetchMealType();
        return;
      }

      SearchMealtype(searchQuery, Id)
        .then(({ data: { data } }) => {
          const mealData = data?.["MealType Details"] || [];

          const formatMeal = (item, index) => ({
            sr_no: index + 1,
            meal_type: getTranslatedName(item),
            mealid: item.id,
            nameEnglish: item.nameEnglish || "",
            nameGujarati: item.nameGujarati || "",
            nameHindi: item.nameHindi || "",
            isJainSlogan: item.isJainSlogan,
          });
          setTableData(mealData.map(formatMeal));
        })
        .catch((error) => {
          console.error("Error searching meal:", error);
        });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const DeleteMealtype = (mealid) => {
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
        DeleteMealType(mealid)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchMealType();
              Swal.fire({
                title: "Removed!",
                text: "Meal has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.message || "API call failed");
            }
          })
          .catch((error) => {
            console.error("Error deleting meal:", error);
          });
      }
    });
  };

  const handleEdit = (meal) => {
    setSelectedMeal(meal);
    setIsMemberModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gpb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="COMMON.MEALSIDEBAR_TYPE"
              defaultMessage="Food Prefrences"
            />
          </h1>
        </div>

        {/* Filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}
          >
            <div className="filItems relative" ref={searchBoxRef}>
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_MEAL",
                  defaultMessage: "Search Meal",
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
          </div>
          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedMeal(null);
                  setIsMemberModalOpen(true);
                }}
              >
                <i className="ki-filled ki-plus"></i>
                <FormattedMessage
                  id="USER.MASTER.ADD_CONTACT_CATEGORY"
                  defaultMessage="Create New "
                />
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        <AddMeal
          isOpen={isMemberModalOpen}
          onClose={setIsMemberModalOpen}
          refreshData={FetchMealType}
          selectedMeal={selectedMeal}
        />

        {/* Table */}
        <TableComponent
          columns={columns(handleEdit, DeleteMealtype, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default MealMaster;
