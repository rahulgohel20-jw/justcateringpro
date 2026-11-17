import { Fragment, useEffect, useState, useRef } from "react";
import { buildSpellSuggestions, extractDictWords } from "@/utils";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import AddUnit from "@/partials/modals/add-unit/AddUnit";
import {
  Getunit,
  DeleteUnit,
  SearchUnit,
  GetUnitById,
  Getgenerateusermenuitemrawmaterialexcel
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";

const UnitMaster = () => {
  const permissions = usePermission("Unit");
  const [isEventTypeModalOpen, setIsEventTypeModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUnit, setIsLoadingUnit] = useState(false);
  const intl = useIntl();
  const [isExporting, setIsExporting] = useState(false);
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  // Spelling suggestion state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = localStorage.getItem("lang") || "en";
      setLang(newLang);
    };

    window.addEventListener("languageChanged", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("languageChanged", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  let Id = localStorage.getItem("userId");

  const getUnitNameByLang = (unit) => {
    if (!unit) return "-";

    switch (lang) {
      case "hi":
        return unit.nameHindi || unit.nameEnglish || "-";
      case "gu":
        return unit.nameGujarati || unit.nameEnglish || "-";
      default:
        return unit.nameEnglish || "-";
    }
  };

  const getSymbolByLang = (unit) => {
    if (!unit) return "-";

    switch (lang) {
      case "hi":
        return unit.symbolHindi || unit.symbolEnglish || "-";
      case "gu":
        return unit.symbolGujarati || unit.symbolEnglish || "-";
      default:
        return unit.symbolEnglish || "-";
    }
  };

  const Fetchunit = () => {
    Getunit(Id)
      .then((res) => {
        if (res.data?.data?.["Unit Details"]) {
          const formatted = res.data.data["Unit Details"].map(
            (cust, index) => ({
              sr_no: index + 1,
              unit: getUnitNameByLang(cust),
              symbol: getSymbolByLang(cust),
              unitId: cust.id,
              isActive: cust.isActive,
            }),
          );

          setTableData(formatted);
        } else {
          setTableData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching units:", error);
        setTableData([]);
      });
  };

  useEffect(() => {
    Fetchunit();
  }, [lang]);

  // Extract dict words for suggestions
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await Getunit(Id);
        if (cancelled) return;
        const list = res?.data?.data?.["Unit Details"] || [];
        const words = extractDictWords(list, [
          "nameEnglish",
          "nameHindi",
          "nameGujarati",
          "symbolEnglish",
          "symbolHindi",
          "symbolGujarati",
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
        "unit",
        "symbol",
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
        Fetchunit();
        return;
      }

      SearchUnit(searchQuery, Id)
        .then(({ data: { data } }) => {
          if (data && data["Unit Details"]) {
            const formatted = data["Unit Details"].map((cust, index) => ({
              sr_no: index + 1,
              unit: getUnitNameByLang(cust),
              symbol: getSymbolByLang(cust),
              unitId: cust.id,
              isActive: cust.isActive,
            }));
            setTableData(formatted);
          } else {
            setTableData([]);
          }
        })
        .catch((error) => {
          console.error("Error searching unit:", error);
          setTableData([]);
        });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const DeleteUnitrow = (unitId) => {
    Swal.fire({
      title: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_TITLE",
        defaultMessage: "Are you sure?",
      }),
      text: intl.formatMessage({
        id: "USER.MASTER.DELETE_UNIT_CONFIRM_TEXT",
        defaultMessage: "You won't be able to revert this!",
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_BUTTON",
        defaultMessage: "Yes, delete it!",
      }),
      cancelButtonText: intl.formatMessage({
        id: "USER.MASTER.CANCEL_BUTTON",
        defaultMessage: "Cancel",
      }),
    }).then((result) => {
      if (result.isConfirmed) {
        DeleteUnit(unitId)
          .then((response) => {
            if (
              response &&
              (response.success || response.data?.success === true)
            ) {
              Fetchunit();
              Swal.fire({
                title: intl.formatMessage({
                  id: "USER.MASTER.DELETE_SUCCESS_TITLE",
                  defaultMessage: "Removed!",
                }),
                text: intl.formatMessage({
                  id: "USER.MASTER.UNIT_DELETE_SUCCESS",
                  defaultMessage: "Unit has been removed successfully.",
                }),
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                title: intl.formatMessage({
                  id: "USER.MASTER.ERROR",
                  defaultMessage: "Error",
                }),
                text:
                  response?.data?.msg ||
                  intl.formatMessage({
                    id: "USER.MASTER.DELETE_FAILED",
                    defaultMessage: "Failed to delete unit.",
                  }),
                icon: "error",
              });
            }
          })
          .catch((error) => {
            console.error("Error deleting unit:", error);
            Swal.fire({
              title: intl.formatMessage({
                id: "USER.MASTER.ERROR",
                defaultMessage: "Error",
              }),
              text:
                error?.response?.data?.msg ||
                intl.formatMessage({
                  id: "USER.MASTER.DELETE_FAILED",
                  defaultMessage: "Failed to delete unit.",
                }),
              icon: "error",
            });
          });
      }
    });
  };

  const statusUnit = () => {
    //
  };

  const handleEdit = async (unit) => {
    try {
      setIsLoadingUnit(true);
      const res = await GetUnitById(unit.unitId);

      if (res?.data?.success && res?.data?.data) {
        const fullUnitData = res.data.data;
        setSelectedUnit(fullUnitData);
        setIsEventTypeModalOpen(true);
      } else {
        console.warn("Could not fetch full unit details, using table data");
        setSelectedUnit(unit);
        setIsEventTypeModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching unit details:", error);
      setSelectedUnit(unit);
      setIsEventTypeModalOpen(true);
    } finally {
      setIsLoadingUnit(false);
    }
  };

  const handleExportExcel = async () => {
    const payload = {
      isCaptainReceipe: false,
      isCaptainReceipeRawMaterial: false,
      isMenuCategory: false,
      isMenuItem: false,
      isMenuItemRawMaterial: false,
      isRawMaterial: false,
      isRawMaterialCat: false,
      isUnit: true, // Only Unit
    };

    try {
      setIsExporting(true);
      const res = await Getgenerateusermenuitemrawmaterialexcel(Id, payload);
      const d = res?.data;

      // API returned failure
      if (d?.success === false) {
        throw new Error(d?.msg || d?.message || "Failed to export Excel.");
      }

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
        a.download = "Units.xlsx";
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else {
        console.log("Export response:", d);
        throw new Error(d?.msg || d?.message || "No file URL returned");
      }
    } catch (error) {
      console.error("Export error:", error);
      const apiMsg =
        error?.response?.data?.msg ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to export Excel.";
      Swal.fire({ title: "Error", text: apiMsg, icon: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.UNIT_MASTER"
              defaultMessage="Unit Master"
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
                  id: "COMMON.SEARCH_UNIT",
                  defaultMessage: "Search Unit...",
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
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setIsEventTypeModalOpen(true);
                    setSelectedUnit(null);
                  }}
                >
                  <i className="ki-filled ki-plus"></i>{" "}
                  <FormattedMessage
                    id="USER.MASTER.ADD_CONTACT_CATEGORY"
                    defaultMessage="Create New"
                  />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Show loading indicator */}
        {isLoadingUnit && (
          <div className="flex justify-center items-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}

        <AddUnit
          isModalOpen={isEventTypeModalOpen}
          setIsModalOpen={setIsEventTypeModalOpen}
          refreshData={Fetchunit}
          selectedUnit={selectedUnit}
        />

        <TableComponent
          columns={columns(handleEdit, DeleteUnitrow, statusUnit, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default UnitMaster;
