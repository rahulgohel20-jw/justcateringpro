import { Fragment, useEffect, useState, useRef } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { GetAllManagerTask } from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import AddManagerTaskModal from "../../../partials/modals/add-manager-task/AddManagerTask";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

const TYPE_OPTIONS = [
  { label: "All Types", value: "" },
  { label: "Pre", value: "PRE" },
  { label: "Post", value: "POST" },
  { label: "Running", value: "RUNNING" },
];

const ManagerTaskMaster = () => {
  const permissions = usePermission("Manager Task Master");
  const intl = useIntl();
  const mainId = localStorage.getItem("mainId");

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Suggestions state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  const fetchTasks = () => {
    setLoading(true);
    GetAllManagerTask(mainId)
      .then((res) => {
        const list = res?.data?.data["ManagerTasks"] ?? res?.data ?? [];
        const arr = Array.isArray(list) ? list : [];
        const formatted = arr.map((task, index) => ({
          ...task,
          sr_no: index + 1,
        }));
        setTableData(formatted);
        const words = extractDictWords(formatted, ["name"]);
        setDictWords(words);
      })
      .catch((err) => {
        console.error("Error fetching manager tasks:", err);
        setTableData([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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
    const timer = setTimeout(() => {
      const suggestions = buildSpellSuggestions(q, dictWords, 6);
      setSpellSuggestions(suggestions);
      setShowSpell(suggestions.length > 0);
      setSpellIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchTerm, dictWords]);

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
    setSearchTerm(word);
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

  const filtered = tableData.filter((item) => {
    const matchesSearch = (item.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesType = typeFilter ? item.type === typeFilter : true;
    return matchesSearch && matchesType;
  });

  const handleEdit = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="COMMON.MANAGER_TASK_MASTER"
              defaultMessage="Manager Task Master"
            />
          </h1>
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative" ref={searchBoxRef}>
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3" />
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "COMMON.SEARCH_TASK",
                  defaultMessage: "Search task...",
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

            <div className="filItems">
              <select
                className="select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {permissions.add && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setSelectedTask(null);
                setIsModalOpen(true);
              }}
            >
              <i className="ki-filled ki-plus" />
              <FormattedMessage id="COMMON.CREATE_NEW" defaultMessage="Create New" />
            </button>
          )}
        </div>

        <AddManagerTaskModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          refreshData={fetchTasks}
          editData={selectedTask}
        />

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <TableComponent
            columns={columns(handleEdit, fetchTasks, permissions)}
            data={filtered}
            paginationSize={10}
          />
        )}
      </Container>
    </Fragment>
  );
};

export default ManagerTaskMaster;
