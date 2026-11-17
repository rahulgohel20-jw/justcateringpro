import { Fragment, useEffect, useState, useRef } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import {
  GetAllBanquetShift,
  DeleteBanquetShift,
  BanquetShiftStatus,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";
import AddBanquetShiftModal from "../../../partials/modals/add-banquet-shift/AddBanquetShiftModal";
import { buildSpellSuggestions, extractDictWords } from "@/utils";

const BanquetShiftMaster = () => {
  const permissions = usePermission("Banquet Shift");
  const intl = useIntl();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const userId = localStorage.getItem("userId");

  // Suggestions state
  const [dictWords, setDictWords] = useState([]);
  const [spellSuggestions, setSpellSuggestions] = useState([]);
  const [showSpell, setShowSpell] = useState(false);
  const [spellIndex, setSpellIndex] = useState(-1);
  const skipSuggestRef = useRef(false);
  const searchBoxRef = useRef(null);

  // ─── Format raw API data into table rows ───────────────────────────────────
  const formatShiftData = (shifts) =>
    shifts.map((shift, index) => ({
      ...shift,
      sr_no: index + 1,
      shift_name: shift.shiftName || "-",
      start_time: shift.startTime || "-",
      end_time: shift.endTime || "-",
      sortorder:
        shift.sortorder !== undefined && shift.sortorder !== null
          ? shift.sortorder
          : shift.sortOrder !== undefined && shift.sortOrder !== null
          ? shift.sortOrder
          : "-",
      isActive: shift.isActive !== undefined ? shift.isActive : true,
      id: shift.id,
    }));

  // ─── Fetch all banquet shifts ──────────────────────────────────────────────
  const fetchBanquetShifts = () => {
    if (!userId) return;

    GetAllBanquetShift(userId)
      .then((res) => {
        const shifts = res?.data?.data || res?.data || [];
        setOriginalData(shifts);
        setTableData(formatShiftData(shifts));
        const words = extractDictWords(shifts, ["shiftName"]);
        setDictWords(words);
      })
      .catch((error) => {
        console.error("Error fetching banquet shifts:", error);
      });
  };

  useEffect(() => {
    fetchBanquetShifts();
  }, [userId]);

  // ─── Search with debounce ──────────────────────────────────────────────────
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        setTableData(formatShiftData(originalData));
        return;
      }

      const searchLower = searchQuery.toLowerCase();
      const filtered = originalData.filter(
        (shift) =>
          (shift.shiftName &&
            shift.shiftName.toLowerCase().includes(searchLower)) ||
          (shift.startTime &&
            shift.startTime.toLowerCase().includes(searchLower)) ||
          (shift.endTime &&
            shift.endTime.toLowerCase().includes(searchLower)) ||
          (shift.sortorder !== undefined &&
            shift.sortorder !== null &&
            shift.sortorder.toString().includes(searchLower)) ||
          (shift.sortOrder !== undefined &&
            shift.sortOrder !== null &&
            shift.sortOrder.toString().includes(searchLower))
      );

      setTableData(formatShiftData(filtered));
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, originalData]);

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

  // ─── Toggle status ─────────────────────────────────────────────────────────
  const handleStatusChange = (shiftId) => {
    BanquetShiftStatus(shiftId)
      .then((response) => {
        if (
          response &&
          (response.status === 200 || response?.data?.success === true)
        ) {
          fetchBanquetShifts();
          Swal.fire({
            title: "Updated!",
            text: "Shift status has been updated successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          throw new Error(response?.data?.msg || "Status update failed");
        }
      })
      .catch((error) => {
        console.error("Error toggling banquet shift status:", error);
        Swal.fire("Error!", "Failed to update shift status.", "error");
      });
  };

  // ─── Delete shift ──────────────────────────────────────────────────────────
  const handleDelete = (shiftId) => {
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
        DeleteBanquetShift(shiftId)
          .then((response) => {
            if (
              response &&
              (response.success ||
                response.status === 200 ||
                response?.data?.success === true)
            ) {
              fetchBanquetShifts();
              Swal.fire({
                title: "Deleted!",
                text: "Banquet shift has been deleted successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.message || "Delete failed");
            }
          })
          .catch((error) => {
            console.error("Error deleting banquet shift:", error);
            Swal.fire("Error!", "Failed to delete the shift.", "error");
          });
      }
    });
  };

  // ─── Open edit modal ───────────────────────────────────────────────────────
  const handleEdit = (shift) => {
    setSelectedShift(shift);
    setIsModalOpen(true);
  };

  // ─── Open add modal ────────────────────────────────────────────────────────
  const handleAddNew = () => {
    setSelectedShift(null);
    setIsModalOpen(true);
  };

  return (
    <Fragment>
      <Container>
        {/* Page Title */}
        <div className="pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.BANQUET_SHIFT_MASTER"
              defaultMessage="Banquet Shift Master"
            />
          </h1>
        </div>

        {/* Filters & Actions */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          {/* Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative" ref={searchBoxRef}>
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_BANQUET_SHIFT",
                  defaultMessage: "Search Banquet Shift",
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

          {/* Add Button */}
          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button className="btn btn-primary" onClick={handleAddNew}>
                <i className="ki-filled ki-plus"></i>
                <FormattedMessage
                  id="COMMON.CREATE_NEW"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>

        {/* Add / Edit Modal */}
        <AddBanquetShiftModal
          isOpen={isModalOpen}
          onClose={setIsModalOpen}
          refreshData={fetchBanquetShifts}
          shiftData={selectedShift}
        />

        {/* Data Table */}
        <TableComponent
          columns={columns(handleEdit, handleDelete, handleStatusChange, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default BanquetShiftMaster;
