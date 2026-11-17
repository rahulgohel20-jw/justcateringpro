import { useEffect, useState, useMemo, useRef } from "react";
import { message } from "antd";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { getColumns } from "./constant";
import DatabaseSidebar from "../databasesidebar";
import DatabaseAssign from "../databaseassign";
import AddMasterDatabaseFile from "../addmasterdatabasefile";
import ViewAssignDatabase from "../viewassigndatabase";
import { GetAllDb } from "@/services/apiServices";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

const Database = () => {
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [customerDatabase, setCustomerDatabase] = useState(false);
  const [openFile, setOpenFile] = useState(false);
  const [tabledata, setTabledata] = useState([]);
  const [viewAssignOpen, setViewAssignOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const searchBoxRef = useRef(null);
  const skipSuggestRef = useRef(false);

  useEffect(() => {
    FetchAllDb();
  }, []);

  const FetchAllDb = async () => {
    try {
      setLoading(true);

      const res = await GetAllDb();

      if (!res?.data?.data) {
        message.error("No data found!");
        setTabledata([]);
        return;
      }

      const dbList = res.data.data;

      const data = dbList.map((db, index) => ({
        sr_no: index + 1,
        database_name: db.dbName || "",
        state: db.state || "",
        version: db.version || "1.0",
        db_planning_id: db.db_planning_id,
      }));

      setTabledata(data);
    } catch (error) {
      console.error("Error fetching databases:", error);
      message.error("Failed to load databases");
    } finally {
      setLoading(false);
    }
  };

  const dictWords = useMemo(
    () => extractDictWords(tabledata, ["database_name", "state", "version"]),
    [tabledata]
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

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return tabledata;
    const q = searchQuery.toLowerCase().trim();
    return tabledata.filter(
      (item) =>
        item.database_name?.toLowerCase().includes(q) ||
        item.state?.toLowerCase().includes(q) ||
        item.version?.toString().toLowerCase().includes(q)
    );
  }, [tabledata, searchQuery]);

  const handleOpenSidebar = (row) => {
    setSelectedRow(row);
    setSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
    setSelectedRow(null);
  };

  const handleOpenCustomer = (row) => {
    setSelectedRow(row);
    setCustomerDatabase(true);
  };

  const handleCloseCustomer = () => {
    setCustomerDatabase(false);
    setSelectedRow(null);
  };

  const handleOpenFile = () => {
    setOpenFile(true);
  };

  const handleCloseFile = () => {
    setOpenFile(false);
  };

  const handleViewDatabase = (row) => {
    setSelectedRow(row);
    setViewAssignOpen(true);
  };

  const columns = getColumns(
    handleOpenSidebar,
    handleOpenCustomer,
    handleViewDatabase
  );

  return (
    <Container>
      <div className="gap-2 pb-2 mb-3">
        <Breadcrumbs items={[{ title: "Master Database" }]} />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div ref={searchBoxRef} className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search databases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => spellSuggestions.length > 0 && setShowSpell(true)}
            onKeyDown={handleSearchKeyDown}
            autoComplete="off"
            spellCheck={false}
            className="input input-sm w-full border border-gray-300 rounded px-3 py-1.5 text-sm"
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
        <div className="flex items-center gap-2">
          <button
            className="btn btn-primary flex items-center justify-center gap-1 w-full sm:w-auto"
            onClick={handleOpenFile}
          >
            <i className="ki-filled ki-plus"></i> Add Database
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <TableComponent
          columns={columns}
          data={filteredData}
          paginationSize={10}
        />
      </div>

      <DatabaseSidebar open={sidebarOpen} onClose={handleCloseSidebar} />
      <DatabaseAssign
        open={customerDatabase}
        onClose={handleCloseCustomer}
        selectedRow={selectedRow}
      />
      <AddMasterDatabaseFile
        open={openFile}
        onClose={handleCloseFile}
        selectedRow={selectedRow}
        setLoading={setLoading}
        fetchData={FetchAllDb}
        loading={loading}
      />

      <ViewAssignDatabase
        open={viewAssignOpen}
        onClose={() => setViewAssignOpen(false)}
        selectedRow={selectedRow}
      />
    </Container>
  );
};

export default Database;
