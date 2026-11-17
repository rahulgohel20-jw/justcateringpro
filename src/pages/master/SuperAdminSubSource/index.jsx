import { Fragment, useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns, defaultData } from "./constant";
import { FormattedMessage } from "react-intl";
import AddSubSource from "../../../partials/modals/add-source/AddSubSource";
import {
  Getallsubsource,
  DeleteLeadsubsource,
  GetAllLeadSource,
  GetLeadSubSourceBysubSourceId, 
} from "@/services/apiServices";
import { usePermission } from "../../../hooks/usePermission.js";
import Swal from "sweetalert2";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

const SuperAdminSubSource = () => {
  const permissions = usePermission("SubSources");

  const [tableData, setTableData] = useState(defaultData);
  const [isFontModalOpen, setIsFontModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [sourceOptions, setSourceOptions] = useState([]);
  const [selectedSourceId] = useState("");
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const searchBoxRef = useRef(null);
  const skipSuggestRef = useRef(false);

  const userId = localStorage.getItem("userId");

  const formatTableData = (data) =>
    data.map((item, index) => ({
      sr_no: index + 1,
      leadSubSourceId: item.leadSubSourceId,
      subSourceName: item.name,
      sourceName: item.leadSource?.sourceName || "",
      leadSourceId: item.leadSource?.leadSourceId || "",
      dateTime: item.dateTime,
      description: item.description,
    }));

  const fetchAllSubSources = useCallback(async () => {
    try {
      const response = await Getallsubsource(userId);
      const data = response?.data?.data || [];
      setTableData(formatTableData(data));
    } catch (error) {
      console.error("Error fetching sub sources:", error);
    }
  }, [userId]);

  const fetchSubSourcesBySourceId = useCallback(async (leadSourceId) => {
    try {
      const response = await GetLeadSubSourceBysubSourceId(leadSourceId);
      const data = response?.data?.data || response?.data || [];
      setTableData(formatTableData(data));
    } catch (error) {
      console.error("Error fetching sub sources by source:", error);
    }
  }, []);

  const fetchAllSources = useCallback(async () => {
    try {
      const response = await GetAllLeadSource(userId);
      const data = response?.data?.data || [];
      setSourceOptions(
        data.map((item) => ({
          leadSourceId: item.leadSourceId,
          sourceName: item.sourceName,
        }))
      );
    } catch (error) {
      console.error("Error fetching sources:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchAllSources();
  }, [fetchAllSources]);

  // ✅ Trigger fetch when source filter changes
  useEffect(() => {
    if (selectedSourceId) {
      fetchSubSourcesBySourceId(selectedSourceId);
    } else {
      fetchAllSubSources();
    }
  }, [selectedSourceId, fetchSubSourcesBySourceId, fetchAllSubSources]);

  const dictWords = useMemo(
    () => extractDictWords(tableData, ["subSourceName", "sourceName"]),
    [tableData]
  );

  useEffect(() => {
    if (skipSuggestRef.current) {
      skipSuggestRef.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const suggestions = buildSpellSuggestions(search, dictWords);
      setSpellSuggestions(suggestions);
      setShowSpell(suggestions.length > 0);
      setSpellIndex(-1);
    }, 150);
    return () => clearTimeout(timer);
  }, [search, dictWords]);

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
    setSearch(word);
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

  const handleDelete = async (leadSubSourceId) => {
    try {
      const response = await DeleteLeadsubsource(leadSubSourceId);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Deleted",
          text: response?.data?.msg || "Sub Source deleted successfully",
          confirmButtonColor: "#2563eb",
        });
        // ✅ Re-fetch based on current filter
        selectedSourceId
          ? fetchSubSourcesBySourceId(selectedSourceId)
          : fetchAllSubSources();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response?.data?.msg || "Failed to delete sub source.",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error?.message || "Failed to delete sub source. Please try again.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const handleEdit = (rowData) => {
    setEditData(rowData);
    setIsFontModalOpen(true);
  };

  const filteredData = tableData.filter(
    (item) =>
      item.subSourceName?.toLowerCase().includes(search.toLowerCase()) ||
      item.sourceName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Fragment>
      <Container>
        <div className="gap-2 pb-2 mb-3">
          <Breadcrumbs
            items={[
              {
                title: (
                  <FormattedMessage
                    id="USER.MASTER.COUPON_MASTER"
                    defaultMessage="Sub Source Master"
                  />
                ),
              },
            ]}
          />
        </div>

        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div ref={searchBoxRef} className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder="Search Sub Sources"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => spellSuggestions.length > 0 && setShowSpell(true)}
                onKeyDown={handleSearchKeyDown}
                autoComplete="off"
                spellCheck={false}
              />
              {showSpell && spellSuggestions.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-[260px] bg-white border border-gray-200 rounded-md shadow-lg z-50">
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
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {permissions.add && (
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditData(null);
                  setIsFontModalOpen(true);
                }}
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="USER.MASTER.ADD_COUPON"
                  defaultMessage="Add Sub Source"
                />
              </button>
            )}
          </div>
        </div>

        <TableComponent
          columns={columns(handleDelete, handleEdit, permissions)}
          data={filteredData}
          paginationSize={10}
        />

        <AddSubSource
          isOpen={isFontModalOpen}
          onClose={(val) => {
            setIsFontModalOpen(val);
            if (!val) setEditData(null);
          }}
          editData={editData}
          onSuccess={() =>
            selectedSourceId
              ? fetchSubSourcesBySourceId(selectedSourceId)
              : fetchAllSubSources()
          } // ✅ respect active filter on success
          sourceOptions={sourceOptions}
        />
      </Container>
    </Fragment>
  );
};

export default SuperAdminSubSource;
