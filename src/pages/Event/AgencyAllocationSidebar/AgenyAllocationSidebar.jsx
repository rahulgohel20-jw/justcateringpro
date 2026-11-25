import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import ChefLabourSection from "./sections/ChefLabourSection";
import OutsideAgencySection from "./sections/OutsideAgencySection";
import InHouseCookSection from "./sections/InHouseCookSection";
import AddContactName from "../../master/MenuItemMaster/components/AddContactName";
import { Plus, Search, X } from "lucide-react";

import { GetAllItemByType } from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage, useIntl } from "react-intl";

const TABS = [
  { id: "chef", label: "Chef Labour" },
  { id: "outside", label: "Outsource Agency" },
  { id: "inside", label: "Inside Kitchen" },
];

export default function AgencyAllocationSidebar({
  open,
  onClose,
  eventId,
  eventFunctionId,
  onSectionSave,
}) {
  const intl = useIntl();
  const [tab, setTab] = useState("chef");
  const [loading, setLoading] = useState(false);
  const [allocationData, setAllocationData] = useState(null);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [concatId, setConcatId] = useState(null);
  const [contactTypeId, setContactTypeId] = useState(null);
  const [vendorRefreshTrigger, setVendorRefreshTrigger] = useState(0);
  const allocationDataRef = useRef(null);

  const [isDirty, setIsDirty] = useState(false);

  // Item name search (shared by all three tabs)
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    allocationDataRef.current = allocationData;
  }, [allocationData]);

  const isAllFunctions = eventFunctionId === -1;

  const eventFunctionData = useMemo(() => {
    if (!allocationData || allocationData.length === 0) return null;

    if (isAllFunctions) {
      // For all functions, show combined info
      return {
        eventFunctionName: "All Functions",
        functionStartDateTime: "-",
        functionEndDateTime: "-",
        pax: null,
        totalFunctions: allocationData.length,
      };
    }

    const {
      function: func,
      functionStartDateTime,
      functionEndDateTime,
    } = allocationData[0].eventFunction;

    return {
      eventFunctionName: func?.nameEnglish || "-",
      functionStartDateTime: functionStartDateTime || "-",
      functionEndDateTime: functionEndDateTime || "-",
      pax: allocationData[0].eventFunction.pax,
    };
  }, [allocationData, isAllFunctions]);

  // Item name search: keeps only matching items (and categories/functions that still have items).
  // If your item name is stored under a different key, add it to the list below.
  const filteredData = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q || !allocationData) return allocationData;

    // Item name keys: menuItemName / menuItemNameHindi / menuItemNameGujarati / itemName / nameEnglish ...
    // (unit, party, vendor, category names are NOT matched)
    const NAME_KEY = /^(menuItem|item)?name(english|hindi|gujarati)?$/i;
    const ownNames = (obj) => {
      if (!obj || typeof obj !== "object") return [];
      const out = [];
      Object.entries(obj).forEach(([key, val]) => {
        if (typeof val === "string" && NAME_KEY.test(key)) out.push(val);
      });
      // name may also sit on a nested menuItem / item object
      [obj.menuItem, obj.item].forEach((nested) => {
        if (nested && typeof nested === "object") out.push(...ownNames(nested));
      });
      return out;
    };
    const nameMatches = (obj) =>
      ownNames(obj).join(" ").toLowerCase().includes(q);

    // Each menuAllocation entry is an item: keep it whole (so row indexes/ids stay the same).
    // Fallback: if the entry has no name of its own, filter its child rows instead.
    const filterEntry = (entry) => {
      if (ownNames(entry).length > 0) return nameMatches(entry) ? entry : null;
      const children = (entry.eventFunctionMenuAllocations || []).filter(
        nameMatches,
      );
      return children.length
        ? { ...entry, eventFunctionMenuAllocations: children }
        : null;
    };

    return allocationData
      .map((functionData) => ({
        ...functionData,
        menuAllocation: (functionData.menuAllocation || [])
          .map(filterEntry)
          .filter(Boolean),
      }))
      .filter((functionData) => functionData.menuAllocation.length > 0);
  }, [allocationData, searchQuery]);

  const handleVendorRefresh = useCallback(() => {
    setVendorRefreshTrigger((prev) => prev + 1);
  }, []);

  const fetchAllocationData = useCallback(
    async (selectedTab, preserveSelections = false) => {
      if (
        !eventId ||
        eventFunctionId === undefined ||
        eventFunctionId === null
      ) {
        console.warn(" Missing required IDs:", { eventId, eventFunctionId });
        return;
      }

      try {
        setLoading(true);

        let currentSelections = {};
        if (preserveSelections && allocationDataRef.current) {
          allocationDataRef.current.forEach((functionData) => {
            const functionKey = functionData.eventFunction?.id || "all";
            currentSelections[functionKey] = {};

            functionData.menuAllocation?.forEach((category) => {
              const categoryKey = category.menuCategoryId;
              currentSelections[functionKey][categoryKey] = {};

              category.eventFunctionMenuAllocations?.forEach((item, idx) => {
                const itemKey = `${category.id}-${idx}`;
                if (item.isSelected) {
                  currentSelections[functionKey][categoryKey][itemKey] = {
                    isSelected: true,
                    selectedContactId: item.partyId,
                    selectedContactName: item.partyName,
                  };
                }
              });
            });
          });
        }

        const res = await GetAllItemByType(
          eventFunctionId,
          eventId,
          selectedTab,
        );

        const details = res?.data?.data?.["Menu Allocation Details"];

        if (!details || details.length === 0) {
          console.warn(" No allocation data found");
          setAllocationData(null);
          return;
        }

        if (preserveSelections && Object.keys(currentSelections).length > 0) {
          const restoredData = details.map((functionData) => {
            const functionKey = functionData.eventFunction?.id || "all";
            const savedFunctionSelections =
              currentSelections[functionKey] || {};

            return {
              ...functionData,
              menuAllocation: functionData.menuAllocation?.map((category) => {
                const categoryKey = category.menuCategoryId;
                const savedCategorySelections =
                  savedFunctionSelections[categoryKey] || {};

                return {
                  ...category,
                  eventFunctionMenuAllocations:
                    category.eventFunctionMenuAllocations?.map((item, idx) => {
                      const itemKey = `${category.id}-${idx}`;
                      const savedItem = savedCategorySelections[itemKey];
                      if (savedItem) {
                        return {
                          ...item,
                          isSelected: savedItem.isSelected,
                          partyId: savedItem.selectedContactId,
                          partyName: savedItem.selectedContactName,
                        };
                      }
                      return item;
                    }),
                };
              }),
            };
          });

          setAllocationData(restoredData);
          setIsDirty(false);
        } else {
          setAllocationData(details);
          setIsDirty(false);
        }
      } catch (error) {
        console.error("❌ API Error:", error?.message || error);
        setAllocationData(null);
      } finally {
        setLoading(false);
      }
    },
    [eventId, eventFunctionId],
  );

  useEffect(() => {
    if (open) {
      setTab("chef");
      setIsDirty(false);
      setSearchQuery("");
      setAllocationData(null);
      fetchAllocationData("chef");
    }
  }, [open, fetchAllocationData]);

  const handleTabClick = useCallback(
    (selectedTab) => {
      if (selectedTab === tab) return;

      if (isDirty) {
        Swal.fire({
          title: "Unsaved Changes",
          text: "You have unsaved changes. Are you sure you want to switch tabs without saving?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonText: "Switch Without Saving",
          cancelButtonText: "Stay",
          confirmButtonColor: "#d33",
          cancelButtonColor: "#6c757d",
        }).then((result) => {
          if (result.isConfirmed) {
            setIsDirty(false);
            setTab(selectedTab);
            fetchAllocationData(selectedTab);
          }
        });
      } else {
        setIsDirty(false);
        setTab(selectedTab);
        fetchAllocationData(selectedTab);
      }
    },
    [tab, isDirty, fetchAllocationData],
  );

  const handleClose = useCallback(() => {
    if (isDirty) {
      Swal.fire({
        title: "Unsaved Changes",
        text: "You have unsaved changes. Are you sure you want to close without saving?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Close Without Saving",
        cancelButtonText: "Stay",
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
      }).then((result) => {
        if (result.isConfirmed) {
          setIsDirty(false);
          onClose();
        }
      });
    } else {
      onClose();
    }
  }, [isDirty, onClose]);

  const renderSection = useMemo(() => {
    if (loading) {
      return (
        <div className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-2"></div>
            <p className="text-gray-500">Loading allocation data...</p>
          </div>
        </div>
      );
    }

    if (!allocationData) {
      return (
        <div className="flex items-center justify-center p-12">
          <p className="text-gray-500">No data available</p>
        </div>
      );
    }

    switch (tab) {
      case "chef":
        return (
          <ChefLabourSection
            data={filteredData}
            close={handleClose}
            isDirty={isDirty}
            vendorRefreshTrigger={vendorRefreshTrigger}
            isAllFunctions={isAllFunctions}
            onDirtyChange={setIsDirty}
            onSectionSave={(items) => onSectionSave?.(items, "chef")}
            functionStartDateTime={eventFunctionData?.functionStartDateTime}          />
        );
      case "outside":
        return (
          <OutsideAgencySection
            data={filteredData}
            close={handleClose}
            isDirty={isDirty}
            vendorRefreshTrigger={vendorRefreshTrigger}
            isAllFunctions={isAllFunctions}
            onDirtyChange={setIsDirty}
            onSectionSave={(items) => onSectionSave?.(items, "outside")}
            functionStartDateTime={eventFunctionData?.functionStartDateTime}          />
        );
      case "inside":
        return (
          <InHouseCookSection
            data={filteredData}
            close={handleClose}
            isDirty={isDirty}
            vendorRefreshTrigger={vendorRefreshTrigger}
            isAllFunctions={isAllFunctions}
            onDirtyChange={setIsDirty}
            onSectionSave={(items) => onSectionSave?.(items, "inside")}          />
        );
      default:
        return null;
    }
  }, [
    tab,
    loading,
    filteredData,
    handleClose,
    isDirty,
    vendorRefreshTrigger,
    isAllFunctions,
    searchQuery,
  ]);

  return (
    <>
    <AnimatePresence>
      {open && (
        <div key="agency-allocation-sidebar" className="fixed inset-0 z-[100]">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Sidebar */}
          <motion.div
            className="absolute top-6 bottom-6 right-6 w-[1300px] max-w-[95vw] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            initial={{ x: "110%" }}
            animate={{ x: 0 }}
            exit={{ x: "110%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">
                <FormattedMessage
                  id="AGENCY.AGENCY_ALLOCATION"
                  defaultMessage="Agency Allocation"
                />
              </h2>
              <button
                onClick={handleClose}
                className="btn btn-danger"
                aria-label={intl.formatMessage({
                  id: "AGENCY.CLOSE_SIDEBAR",
                  defaultMessage: "Close sidebar",
                })}
              >
                <FormattedMessage id="COMMON.CLOSE" defaultMessage="Close" />
              </button>
            </div>

            {/* Event Info */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
              <div className="flex gap-20">
                <div>
                  <p className="text-sm text-gray-500">Function</p>
                  <p className="font-semibold text-gray-900">
                    {eventFunctionData?.eventFunctionName || "-"}
                  </p>
                  {isAllFunctions && eventFunctionData?.totalFunctions && (
                    <p className="text-xs text-gray-500 mt-1">
                      {eventFunctionData.totalFunctions} function(s)
                    </p>
                  )}
                </div>

                {!isAllFunctions && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">
                        <FormattedMessage
                          id="AGENCY.DATE_AND_TIME"
                          defaultMessage="Date & Time"
                        />
                      </p>
                      <p className="font-semibold text-gray-900">
                        {eventFunctionData?.functionStartDateTime || "-"}
                      </p>
                    </div>

                    {eventFunctionData?.pax && (
                      <div>
                        <p className="text-sm text-gray-500">
                          <FormattedMessage
                            id="COMMON.PAX"
                            defaultMessage="PAX"
                          />
                        </p>
                        <p className="font-semibold text-gray-900">
                          {eventFunctionData.pax}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>

              <button
                onClick={() => {
                  let typeId = null;

                  if (tab === "chef") typeId = 5;
                  if (tab === "outside") typeId = 6;
                  if (tab === "inside") typeId = 7;

                  setConcatId(typeId);
                  setContactTypeId(typeId);
                  setIsMemberModalOpen(true);
                }}
                className="flex items-center gap-1 p-2 rounded-lg bg-[#005BA8] text-md text-white font-semibold "
              >
                <span>
                  <FormattedMessage
                    id="COMMON.ADD_VENDOR"
                    defaultMessage="Add Vendor"
                  />
                </span>
                <Plus className="w-5 h-5  text-white rounded-full" />
              </button>
            </div>

            {/* Tabs + Item search */}
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b bg-gray-50">
              <div className="flex gap-3">
                {TABS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => handleTabClick(id)}
                    disabled={loading}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      tab === id
                        ? "bg-primary text-white shadow-sm"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    aria-selected={tab === id}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="relative w-72">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={intl.formatMessage({
                    id: "AGENCY.SEARCH_ITEM_NAME",
                    defaultMessage: "Search item name...",
                  })}
                  className="w-full pl-9 pr-8 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-50">
              {renderSection}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
      <AddContactName
        isModalOpen={isMemberModalOpen}
        setIsModalOpen={setIsMemberModalOpen}
        concatId={concatId}
        contactTypeId={contactTypeId}
        refreshData={handleVendorRefresh}
      />
    </>
  );
}