import { Fragment, useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Container } from "@/components/container";
import { GETALLaiteplate, Deleteaitemplate } from "@/services/apiServices";
import Addaitemplate from "../../../../partials/modals/AddAitemplatemodal/Addaitemplate";
import { usePermission } from "../../../../hooks/usePermission";
import Swal from "sweetalert2";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { useNavigate } from "react-router-dom";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

// ─── Main Component ───────────────────────────────────────────────────────────
const AiTemplateMaster = () => {
  const permissions = usePermission("Categories");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplate] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const searchBoxRef = useRef(null);
  const skipSuggestRef = useRef(false);

  const navigate = useNavigate();

  const lang = localStorage.getItem("lang") || "en";
  const handleEdit = (row) => {
    navigate("/Ai-module/addaitemplate", {
      state: { contactType: row.original ?? row },
    });
  };
  const getNameByLang = useCallback((item) => {
    switch (lang) {
      case "hi":
        return item.nameHindi || item.nameEnglish || "-";
      case "gu":
        return item.nameGujarati || item.nameEnglish || "-";
      default:
        return item.nameEnglish || "-";
    }
  }, [lang]);

  const fetchTemplates = useCallback(() => {
    GETALLaiteplate()
      .then((res) => {
        const list = res?.data?.data?.AITemplates || [];
        const formatted = list.map((item, index) => ({
          sr_no: index + 1,
          name: getNameByLang(item),
          id: item.id,
          isActive: item.isActive,
          billingCycle: item.billingCycle,
          price: item.price,
          aiModel: item.aiModel,
          original: item,
        }));
        setTableData(formatted);
      })
      .catch((err) => console.error("Error fetching AI templates:", err));
  }, [getNameByLang]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const dictWords = useMemo(
    () => extractDictWords(tableData, ["name", "aiModel", "billingCycle"]),
    [tableData]
  );

  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const suggestions = buildSpellSuggestions(searchQuery, dictWords);
      setSpellSuggestions(suggestions);
      setShowSpell(suggestions.length > 0);
      setSpellIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery, dictWords]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSpell(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const applySpellSuggestion = (word) => {
    skipSuggestRef.current = true;
    setSearchQuery(word);
    setShowSpell(false);
    setSpellIndex(-1);
  };

  const handleSearchKeyDown = (e) => {
    if (!showSpell || spellSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSpellIndex((prev) => (prev + 1) % spellSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSpellIndex((prev) =>
        prev <= 0 ? spellSuggestions.length - 1 : prev - 1
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

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This template will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      customClass: { popup: "!rounded-2xl" },
    }).then((result) => {
      if (result.isConfirmed) {
        Deleteaitemplate(id)
          .then(() => {
            Swal.fire({
              title: "Deleted!",
              icon: "success",
              timer: 1500,
              showConfirmButton: false,
              customClass: { popup: "!rounded-2xl" },
            });
            fetchTemplates();
          })
          .catch(() => Swal.fire("Error", "Failed to delete.", "error"));
      }
    });
  };

  const filtered = tableData.filter(
    (t) =>
      t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.aiModel?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <Fragment>
      <Container>
        <div className="py-6">
          {/* ── Page Header ── */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                AI Template
              </h1>
              <p className="text-sm text-gray-700 mt-1 max-w-sm">
                Manage and orchestrate your enterprise AI processing units with
                real-time throughput monitoring.
              </p>
            </div>
            {permissions.add && (
              <button
                onClick={() => navigate("/Ai-module/addaitemplate")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background:
                    "linear-gradient(135deg, #594CEB 0%, #4BCBEB 100%)",
                }}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create New Module
              </button>
            )}
          </div>

          {/* ── Search ── */}
          <div ref={searchBoxRef} className="relative mb-6 max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
              />
            </svg>
            <input
              className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              placeholder="Search modules..."
              value={searchQuery}
              onChange={handleSearch}
              onFocus={() => spellSuggestions.length > 0 && setShowSpell(true)}
              onKeyDown={handleSearchKeyDown}
              autoComplete="off"
              spellCheck={false}
            />

            {showSpell && spellSuggestions.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50">
                <div className="px-3 pt-2 pb-1 text-xs text-gray-400">Suggestions:</div>
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

          {/* ── Table Card ── */}
        </div>
        {/* ── Modal ── */}
        <Addaitemplate
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          refreshData={fetchTemplates}
          contactType={selectedTemplate}
        />
        <TableComponent
          columns={columns(
            handleEdit,
            handleDelete,
            permissions,
            fetchTemplates
          )}
          data={filtered}
        />
      </Container>
    </Fragment>
  );
};

export default AiTemplateMaster;
