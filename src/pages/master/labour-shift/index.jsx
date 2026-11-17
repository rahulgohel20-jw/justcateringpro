import { Fragment, useEffect, useState, useRef } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GetAllLabourShift,
  deleteLabourShiftById,
} from "@/services/apiServices";
import useStyle from "./style";
import AddLabourshift from "@/partials/modals/add-labour-shift/AddLabourshift";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

const Labourshiftmaster = () => {
  const permissions = usePermission("Labour Shift");
  const classes = useStyle();
  const intl = useIntl();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedcontactType, setSelectedcontactType] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const Id = localStorage.getItem("userId");

  // Suggestions state
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

  const formatShiftData = (shifts) => {
    return shifts.map((shift, index) => ({
      sr_no: index + 1,
      shift_name: getTranslatedName(shift),
      shift_time: shift.shiftTime || "-",
      isActive: shift.isActive !== undefined ? shift.isActive : true,
      id: shift.id,
      nameEnglish: shift.nameEnglish || "",
      nameHindi: shift.nameHindi || "",
      nameGujarati: shift.nameGujarati || "",
      transportationPrice: shift.price ?? "",
    }));
  };

  const FetchLabourShift = () => {
    if (!Id) return;

    GetAllLabourShift(Id)
      .then((res) => {
        const shifts = res?.data?.data?.["Function Details"] || [];
        setOriginalData(shifts);
        setTableData(formatShiftData(shifts));
        const words = extractDictWords(shifts, [
          "nameEnglish",
          "nameHindi",
          "nameGujarati",
          "shiftTime",
        ]);
        setDictWords(words);
      })
      .catch((error) => {
        console.error("Error fetching labour shifts:", error);
      });
  };

  useEffect(() => {
    FetchLabourShift();
  }, [Id]);

  useEffect(() => {
    if (originalData.length > 0) {
      if (searchQuery.trim()) {
        const filtered = originalData.filter((item) => {
          const searchLower = searchQuery.toLowerCase();
          return (
            (item.nameEnglish &&
              item.nameEnglish.toLowerCase().includes(searchLower)) ||
            (item.nameHindi &&
              item.nameHindi.toLowerCase().includes(searchLower)) ||
            (item.nameGujarati &&
              item.nameGujarati.toLowerCase().includes(searchLower)) ||
            (item.shiftTime &&
              item.shiftTime.toLowerCase().includes(searchLower))
          );
        });
        setTableData(formatShiftData(filtered));
      } else {
        setTableData(formatShiftData(originalData));
      }
    }
  }, [intl.locale]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        setTableData(formatShiftData(originalData));
        return;
      }

      const filtered = originalData.filter((item) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          (item.nameEnglish &&
            item.nameEnglish.toLowerCase().includes(searchLower)) ||
          (item.nameHindi &&
            item.nameHindi.toLowerCase().includes(searchLower)) ||
          (item.nameGujarati &&
            item.nameGujarati.toLowerCase().includes(searchLower)) ||
          (item.shiftTime && item.shiftTime.toLowerCase().includes(searchLower))
        );
      });

      setTableData(formatShiftData(filtered));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, originalData, intl.locale]);

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
    const timer = setTimeout(() => {
      const suggestions = buildSpellSuggestions(q, dictWords, 6);
      setSpellSuggestions(suggestions);
      setShowSpell(suggestions.length > 0);
      setSpellIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, dictWords]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSpell(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const applySpellSuggestion = (word) => {
    skipSuggestRef.current = true;
    setSearchQuery(word);
    setShowSpell(false);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSpell || spellSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev < spellSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev > 0 ? prev - 1 : spellSuggestions.length - 1
      );
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (spellIndex >= 0 && spellIndex < spellSuggestions.length) {
        e.preventDefault();
        applySpellSuggestion(spellSuggestions[spellIndex]);
      }
    } else if (e.key === "Escape") {
      setShowSpell(false);
    }
  };

  const DeleteShift = (shiftId) => {
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
        deleteLabourShiftById(shiftId)
          .then((response) => {
            if (
              response &&
              (response.success ||
                response.status === 200 ||
                response?.data?.success === true)
            ) {
              FetchLabourShift();
              Swal.fire({
                title: "Removed!",
                text: "Shift has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.message || "API call failed");
            }
          })
          .catch((error) => {
            console.error("Error deleting shift:", error);
          });
      }
    });
  };

  const handleEdit = (shift) => {
    setSelectedcontactType(shift);
    setIsContactModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.LABOUR_SHIFT_MASTER"
              defaultMessage="Labour Shift Master"
            />
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}
          >
            <div className="filItems relative" ref={searchBoxRef}>
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_SHIFT",
                  defaultMessage: "Search Shift",
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
                  setSelectedcontactType(null);
                  setIsContactModalOpen(true);
                }}
              >
                <i className="ki-filled ki-plus"></i>
                <FormattedMessage
                  id="USER.MASTER.ADD_SHIFT"
                  defaultMessage="Create New "
                />
              </button>
            </div>
          )}
        </div>

        <AddLabourshift
          isOpen={isContactModalOpen}
          onClose={setIsContactModalOpen}
          refreshData={FetchLabourShift}
          shiftData={selectedcontactType}
        />

        <TableComponent
          columns={columns(handleEdit, DeleteShift, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default Labourshiftmaster;
