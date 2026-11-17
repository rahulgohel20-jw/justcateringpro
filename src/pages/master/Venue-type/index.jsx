import { Fragment, useEffect, useState, useMemo, useRef } from "react";
import { buildSpellSuggestions, extractDictWords } from "@/utils";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import AddVenueType from "../../../partials/modals/add-venue-type/AddVenueType";
import {
  GetVenueType,
  DeleteVenueTypeApi,
  UpdateVenueStatusApi,
} from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import Swal from "sweetalert2";
import { usePermission } from "../../../hooks/usePermission";

const VenueTypeMaster = () => {
  const permissions = usePermission("Venue");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const userId = useMemo(() => {
    try {
      const userID = localStorage.getItem("userId");
      return userID;
    } catch (e) {
      console.error("Error parsing userid", e);
      return null;
    }
  }, []);

  // 🔥 Helper to get venue type name based on language
  const getVenueTypeByLang = (venue) => {
    if (!venue) return "-";

    switch (lang) {
      case "hi":
        return venue.nameHindi || venue.nameEnglish || "-";
      case "gu":
        return venue.nameGujarati || venue.nameEnglish || "-";
      default:
        return venue.nameEnglish || "-";
    }
  };

  // 🔥 Helper to validate venue image URL (backend sometimes returns "https://justcatering.innull")
  const getValidVenueImg = (img) => {
    if (!img) return "";
    if (img.trim().toLowerCase().endsWith("null")) return "";
    return img;
  };

  const fetchVenueTypes = async () => {
    if (!userId) return;

    try {
      const res = await GetVenueType("", userId);
      if (res.data?.data?.["Venue Details"]) {
        const formatted = res?.data?.data["Venue Details"].map(
          (item, index) => ({
            sr_no: index + 1,
            venue_type: getVenueTypeByLang(item), // 🔥 Language-based name
            venueid: item.id,
            isDelete: item.isDelete ?? false,
            isActive: item.isActive ?? false,
            // Store all language versions for editing
            nameEnglish: item.nameEnglish,
            nameHindi: item.nameHindi,
            nameGujarati: item.nameGujarati,
            venueImg: getValidVenueImg(item.venueImg),
          }),
        );

        setTableData(formatted);
      } else {
        setTableData([]);
      }
    } catch (error) {
      console.error("Error fetching venue types:", error);
      setTableData([]);
    }
  };

  // ✅ Initial load - fetch all (re-fetch when language changes)
  useEffect(() => {
    if (userId) fetchVenueTypes();
  }, [userId, lang]); // 🔥 Re-fetch when language changes

  // Extract dict words for suggestions
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!userId) return;
      try {
        const res = await GetVenueType("", userId);
        if (cancelled) return;
        const list = res?.data?.data?.["Venue Details"] || [];
        const words = extractDictWords(list, [
          "nameEnglish",
          "nameHindi",
          "nameGujarati",
          "venue_type",
        ]);
        setDictWords(words);
      } catch (err) {
        console.error("Failed to load spelling dictionary:", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (tableData && tableData.length > 0) {
      const words = extractDictWords(tableData, [
        "nameEnglish",
        "nameHindi",
        "nameGujarati",
        "venue_type",
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

  const handleEdit = (venue) => {
    setSelectedVenue(venue);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedVenue(null);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = !currentStatus;

    try {
      const res = await UpdateVenueStatusApi(id, newStatus);

      if (res.data?.success == true) {
        Swal.fire(
          intl.formatMessage({
            id: "USER.MASTER.SUCCESS",
            defaultMessage: "Success",
          }),
          intl.formatMessage({
            id: "USER.MASTER.STATUS_UPDATE_SUCCESS",
            defaultMessage: "Status updated successfully",
          }),
          "success",
        );
        fetchVenueTypes();
      } else {
        Swal.fire(
          intl.formatMessage({
            id: "USER.MASTER.ERROR",
            defaultMessage: "Error",
          }),
          res.data?.message ||
            intl.formatMessage({
              id: "USER.MASTER.STATUS_UPDATE_ERROR",
              defaultMessage: "Failed to update status",
            }),
          "error",
        );
      }
    } catch (error) {
      console.error("Error updating status:", error);
      Swal.fire(
        intl.formatMessage({
          id: "USER.MASTER.ERROR",
          defaultMessage: "Error",
        }),
        intl.formatMessage({
          id: "USER.MASTER.STATUS_UPDATE_ERROR",
          defaultMessage: "Failed to update status",
        }),
        "error",
      );
    }
  };

  const handleDelete = async (venueid) => {
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
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await DeleteVenueTypeApi(venueid);

          if (res.data?.success == true) {
            Swal.fire(
              intl.formatMessage({
                id: "USER.MASTER.DELETED",
                defaultMessage: "Deleted!",
              }),
              intl.formatMessage({
                id: "USER.MASTER.DELETE_SUCCESS",
                defaultMessage: "Venue type has been deleted.",
              }),
              "success",
            );
            fetchVenueTypes();
          } else {
            Swal.fire(
              intl.formatMessage({
                id: "USER.MASTER.ERROR",
                defaultMessage: "Error",
              }),
              res.data?.message ||
                intl.formatMessage({
                  id: "USER.MASTER.DELETE_ERROR",
                  defaultMessage: "Failed to delete venue type.",
                }),
              "error",
            );
          }
        } catch (error) {
          console.error("Error deleting venue type:", error);
          Swal.fire(
            intl.formatMessage({
              id: "USER.MASTER.ERROR",
              defaultMessage: "Error",
            }),
            intl.formatMessage({
              id: "USER.MASTER.DELETE_ERROR",
              defaultMessage: "Something went wrong while deleting.",
            }),
            "error",
          );
        }
      }
    });
  };

  // 🔥 Filter table data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return tableData;

    return tableData.filter((item) =>
      item.venue_type.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [tableData, searchQuery]);

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.VENUE_TYPE_MASTER"
              defaultMessage="Venue Master"
            />
          </h1>
        </div>

        {/* Filters & Add Button */}
        <div className="filters flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative" ref={searchBoxRef}>
              <i className="ki-filled ki-magnifier text-primary absolute left-3 top-1/2 -translate-y-1/2"></i>
              <input
                className="input pl-10 pr-4"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_VENUE_TYPE",
                  defaultMessage: "Search Venue Type",
                })}
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
            <button
              className="btn btn-primary flex items-center gap-2"
              onClick={handleAdd}
            >
              <i className="ki-filled ki-plus"></i>
              <FormattedMessage
                id="USER.MASTER.ADD_CONTACT_CATEGORY"
                defaultMessage="Create New "
              />
            </button>
          )}
        </div>

        {/* Modal */}
        <AddVenueType
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          refreshData={fetchVenueTypes}
          selectedEvent={selectedVenue}
        />

        {/* Table */}
        <TableComponent
          columns={columns(
            handleEdit,
            handleDelete,
            handleStatusChange,
            permissions,
          )}
          data={filteredData || []}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default VenueTypeMaster;
