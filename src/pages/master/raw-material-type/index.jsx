import { Fragment, useEffect, useState, useRef } from "react";
import { buildSpellSuggestions, extractDictWords } from "@/utils";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GetRawType,
  DeleteRawType,
  SearchContactCategory,
  updatestatusrawmaterialtype,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";

const RawMaterialType = () => {
  const [, setIsRawModalOpen] = useState(false);
  const [, setSelectedRawCategory] = useState(null);
  const [tableData, setTableData] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();
  const [rawOriginalData, setRawOriginalData] = useState([]);

  // Spelling suggestion state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  let userId = 1;

  const FetchRawTypeCategory = () => {
    GetRawType(userId)
      .then((res) => {
        const rawList =
          res.data.data["Raw Material Category Type Details"] || [];

        setRawOriginalData(rawList);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    FetchRawTypeCategory();
  }, []);

  // Extract dict words for suggestions
  useEffect(() => {
    if (!rawOriginalData || rawOriginalData.length === 0) return;
    const words = extractDictWords(rawOriginalData, [
      "nameEnglish",
      "nameHindi",
      "nameGujarati",
      "name",
    ]);
    setDictWords(words);
  }, [rawOriginalData]);

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
        FetchRawTypeCategory();
        return;
      }

      SearchContactCategory(searchQuery, userId)
        .then(({ data: { data } }) => {
          if (data && data["Contact Category Details"]) {
            const formatted = data["Contact Category Details"].map(
              (cust, index) => ({
                sr_no: index + 1,
                contact_name: cust.nameEnglish || "-",
                contactid: cust.id,
              }),
            );
            setTableData(formatted);
          } else {
            setTableData([]);
          }
        })
        .catch((error) => {
          console.error("Error searching customer:", error);
        });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const language = localStorage.getItem("lang");

    const languageMap = {
      en: "nameEnglish",
      hi: "nameHindi",
      gu: "nameGujarati",
    };

    const field = languageMap[language] || "nameEnglish";

    let mapped = rawOriginalData.map((cust, index) => ({
      sr_no: index + 1,
      name: cust[field] || "-",
      rawid: cust.id,
      status: cust.isActive,
    }));

    // 👀 Optional frontend filtering to keep UI instant
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      mapped = mapped.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.sr_no?.toString()?.includes(q),
      );
    }

    setTableData(mapped);
  }, [rawOriginalData, searchQuery, localStorage.getItem("lang")]);

  const DeleteRawMaterialType = (rawid) => {
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
        DeleteRawType(rawid)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchRawTypeCategory();
              Swal.fire({
                title: "Removed!",
                text: "Raw Material Type has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.message || "API call failed");
            }
          })
          .catch((error) => {
            console.error("Error deleting Event type:", error);
          });
      }
    });
  };

  const statusmenuitem = async (rawid, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await updatestatusrawmaterialtype(rawid, newStatus);
      FetchRawTypeCategory();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleEdit = (event) => {
    setSelectedRawCategory(event);
    setIsRawModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.RAW_MATERIAL_TYPE_TITLE"
              defaultMessage="Raw Material Type"
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
                  id: "USER.MASTER.RAW_MATERIAL_TYPE_SEARCH",
                  defaultMessage: " Search",
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
        </div>

        <TableComponent
          columns={columns(handleEdit, DeleteRawMaterialType, statusmenuitem)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};
export default RawMaterialType;
