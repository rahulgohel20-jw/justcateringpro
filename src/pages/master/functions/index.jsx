import { Fragment, useEffect, useState, useRef } from "react";
import { BadgeDollarSign, FileText, Receipt } from "lucide-react";
import { Tooltip } from "antd";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import useStyle from "./style";
import { Link } from "react-router-dom";
import { underConstruction } from "@/underConstruction";
import AddFunctionType from "@/partials/modals/add-function-type/AddFunctionType";
import {
  GetAllFunctionsByUserId,
  DeleteFunctionType,
} from "@/services/apiServices";
import { buildSpellSuggestions, extractDictWords } from "@/utils";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";

const FunctionsMaster = () => {
  const permissions = usePermission("Function");
  const classes = useStyle();
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [originalData, setOriginalData] = useState([]);

  const intl = useIntl();

  // Spelling suggestion state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  // 🔥 Load language and set up listener for changes
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  // 🔥 Listen for language changes in localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = localStorage.getItem("lang") || "en";
      setLang(newLang);
    };

    // Listen for custom language change events
    window.addEventListener("languageChanged", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("languageChanged", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 🔥 Helper to get function name based on language
  const getFunctionNameByLang = (item) => {
    if (!item) return "-";

    switch (lang) {
      case "hi":
        return item.nameHindi || item.nameEnglish || "-";
      case "gu":
        return item.nameGujarati || item.nameEnglish || "-";
      default:
        return item.nameEnglish || "-";
    }
  };

  const formatData = (apiData) =>
    apiData.map((item, index) => ({
      sr_no: index + 1,
      id: item.id,
      function_name: getFunctionNameByLang(item), // 🔥 Language-based name
      start_time: item.startTime,
      end_time: item.endTime,
      // Store all language versions for editing
      nameEnglish: item.nameEnglish,
      nameHindi: item.nameHindi,
      nameGujarati: item.nameGujarati,
      imgPath: item.imgPath, 
      proforma_invoice: (
        <Tooltip
          className="cursor-pointer"
          title={intl.formatMessage({
            id: "USER.MASTER.PROFORMA_INVOICE",
            defaultMessage: "Proforma Invoice",
          })}
        >
          <div
            className="flex justify-center items-center w-full"
            onClick={underConstruction}
          >
            <FileText className="w-5 h-5 text-primary" />
          </div>
        </Tooltip>
      ),
      invoice: (
        <Link to="/invoice-dashboard">
          <Tooltip
            className="cursor-pointer"
            title={intl.formatMessage({
              id: "USER.MASTER.INVOICE",
              defaultMessage: "Invoice",
            })}
          >
            <div className="flex justify-center items-center w-full">
              <Receipt className="w-5 h-5 text-success" />
            </div>
          </Tooltip>
        </Link>
      ),
      quotation: (
        <Link to="/quotation">
          <Tooltip
            className="cursor-pointer"
            title={intl.formatMessage({
              id: "USER.MASTER.QUOTATION",
              defaultMessage: "Quotation",
            })}
          >
            <div className="flex justify-center items-center w-full">
              <BadgeDollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </Tooltip>
        </Link>
      ),
    }));

  const fetchFunctions = () => {
    const Id = JSON.parse(localStorage.getItem("userId"));

    GetAllFunctionsByUserId(Id)
      .then((res) => {
        const list = res?.data?.data?.["Function Details"] || [];
        const formatted = formatData(list);

        setOriginalData(formatted);
        setTableData(formatted);
      })
      .catch((err) => {
        console.error("Error fetching functions:", err);
        setOriginalData([]);
        setTableData([]);
      });
  };

  // 🔥 Initial fetch
  useEffect(() => {
    fetchFunctions();
  }, [lang]);

  // Extract dict words for suggestions
  useEffect(() => {
    if (!originalData || originalData.length === 0) return;
    const words = extractDictWords(originalData, [
      "nameEnglish",
      "nameHindi",
      "nameGujarati",
      "function_name",
    ]);
    setDictWords(words);
  }, [originalData]);

  // Build suggestions while typing
  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false;
      return;
    }
    const q = (searchTerm || "").trim().toLowerCase();
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
  }, [searchTerm, dictWords]);

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
    setSearchTerm(text);
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

  // 🔥 Debounced search (search across original data)
  useEffect(() => {
    const handler = setTimeout(() => {
      const query = searchTerm.trim().toLowerCase();

      if (!query) {
        setTableData(originalData);
        return;
      }

      const normalize = (str = "") =>
        str.toLowerCase().replace(/[\s.,()-]/g, "");

      const filtered = originalData.filter((item) =>
        normalize(item.function_name).includes(normalize(query)),
      );

      setTableData(filtered);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, originalData]);

  // 🔥 Re-fetch on backend search when user types (debounced)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchFunctions();
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const handleEdit = (functionType) => {
    setSelectedFunction(functionType);
    setIsMemberModalOpen(true);
  };

  const DeleteFunction = (functionId) => {
    Swal.fire({
      title: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_TITLE",
        defaultMessage: "Are you sure?",
      }),
      text: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_TEXT",
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
        DeleteFunctionType(functionId)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              fetchFunctions();
              Swal.fire({
                title: intl.formatMessage({
                  id: "USER.MASTER.DELETE_SUCCESS_TITLE",
                  defaultMessage: "Removed!",
                }),
                text: intl.formatMessage({
                  id: "USER.MASTER.FUNCTION_DELETE_SUCCESS",
                  defaultMessage: "Function has been removed successfully.",
                }),
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.message || "API call failed");
            }
          })
          .catch((error) => {
            console.error("Error deleting function:", error);
          });
      }
    });
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.FUNCTIONS"
              defaultMessage="Functions Master"
            />
          </h1>
        </div>

        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}
          >
            <div className="filItems relative" ref={searchBoxRef}>
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_FUNCTION",
                  defaultMessage: "Search Function",
                })}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
                  setSelectedFunction(null);
                  setIsMemberModalOpen(true);
                }}
                title={intl.formatMessage({
                  id: "USER.MASTER.ADD_FUNCTION",
                  defaultMessage: "Add Function",
                })}
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

        <AddFunctionType
          isModalOpen={isMemberModalOpen}
          setIsModalOpen={setIsMemberModalOpen}
          refreshData={fetchFunctions}
          editData={selectedFunction}
        />
        <TableComponent
          columns={columns(handleEdit, DeleteFunction, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};
export default FunctionsMaster;
