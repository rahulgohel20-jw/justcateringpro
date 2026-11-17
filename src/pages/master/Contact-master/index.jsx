import { Fragment, useEffect, useState, useRef } from "react";
import { buildSpellSuggestions, extractDictWords } from "@/utils";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GetAllContactType,
  DeleteContactTypeMaster,
  updateContactTypeStatus,
} from "@/services/apiServices";
import useStyle from "./style";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";

const ContactTypeMaster = () => {
  const classes = useStyle();
  const [, setIsContactModalOpen] = useState(false);
  const [, setSelectedcontactType] = useState(null);
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

  // 🔥 Load language from localStorage
  const lang = localStorage.getItem("lang") || "en";

  // 🔥 Function to get translated name dynamically
  const getNameByLang = (cust) => {
    switch (lang) {
      case "hi":
        return cust.nameHindi || cust.nameEnglish || "-";
      case "gu":
        return cust.nameGujarati || cust.nameEnglish || "-";
      default:
        return cust.nameEnglish || "-";
    }
  };

  const FetchContactType = () => {
    GetAllContactType(1)
      .then((res) => {
        const formatted = res.data.data["Contact Type Details"].map(
          (cust, index) => ({
            sr_no: index + 1,
            contact_type: getNameByLang(cust),
            contacttypeid: cust.id,
            isActive: cust.isActive,
            nameEnglish: cust.nameEnglish,
            nameHindi: cust.nameHindi,
            nameGujarati: cust.nameGujarati,
          })
        );

        setOriginalData(formatted);
        setTableData(formatted);
      })
      .catch((error) => {
        console.error("Error fetching contact types:", error);
      });
  };

  useEffect(() => {
    FetchContactType();
  }, [lang]);

  // Extract dict words for suggestions
  useEffect(() => {
    if (!originalData || originalData.length === 0) return;
    const words = extractDictWords(originalData, [
      "nameEnglish",
      "nameHindi",
      "nameGujarati",
      "contact_type",
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
    const handler = setTimeout(() => {
      const query = searchQuery.trim().toLowerCase();

      if (!query) {
        setTableData(originalData);
        return;
      }

      const normalize = (str) => str.toLowerCase().replace(/[\s.,()-]/g, "");

      const filtered = originalData.filter((item) =>
        normalize(item.contact_type).includes(normalize(query))
      );

      setTableData(filtered);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, originalData]);

  const DeleteContactType = (contacttypeid) => {
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
        DeleteContactTypeMaster(contacttypeid)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchContactType();
              Swal.fire({
                title: "Removed!",
                text: "Contact type removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            }
          })
          .catch((error) => {
            console.error("Error deleting contact type:", error);
          });
      }
    });
  };

  const handleEdit = (event) => {
    setSelectedcontactType(event);
    setIsContactModalOpen(true);
  };

  const statusCategory = (id, status) => {
    updateContactTypeStatus(id, status)
      .then(() => {
        FetchContactType();
      })
      .catch((error) => {
        console.error("Error updating status:", error);
      });
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="pb-2 mb-3">
          <h1 className="text-xl  text-gray-900">
            <FormattedMessage
              id="USER.MASTER.CONTACT_TYPE_MASTER"
              defaultMessage="Contact Type Master"
            />
          </h1>
        </div>

        {/* Search + Add */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div
            className={`flex flex-wrap items-center gap-2 ${classes.customStyle}`}
          >
            <div className="filItems relative" ref={searchBoxRef}>
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_CONTACT_TYPE",
                  defaultMessage: "Search Contact Type",
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
          columns={columns(handleEdit, DeleteContactType, statusCategory)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default ContactTypeMaster;
