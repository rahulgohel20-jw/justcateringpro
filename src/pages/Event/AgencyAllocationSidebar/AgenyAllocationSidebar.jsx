import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import ChefLabourSection from "./sections/ChefLabourSection";
import OutsideAgencySection from "./sections/OutsideAgencySection";
import InHouseCookSection from "./sections/InHouseCookSection";
import AddContactName from "../../master/MenuItemMaster/components/AddContactName";
import { Plus } from "lucide-react";

import { GetAllItemByType } from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage  , useIntl } from "react-intl";

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

    const sectionProps = {
    data: allocationData,
    close: handleClose,          
    vendorRefreshTrigger,
    isAllFunctions,
    onDirtyChange: setIsDirty,   
    isDirty,               
  };

    switch (tab) {
      case "chef":
        return (
          <ChefLabourSection
            data={allocationData}
            close={handleClose}   
            isDirty={isDirty} 
            vendorRefreshTrigger={vendorRefreshTrigger}
            isAllFunctions={isAllFunctions}
            onDirtyChange={setIsDirty}
            onSectionSave={(items) => onSectionSave?.(items, "chef")}
          />
        );
      case "outside":
        return (
          <OutsideAgencySection
            data={allocationData}
            close={handleClose}   
            isDirty={isDirty} 
            vendorRefreshTrigger={vendorRefreshTrigger}
            isAllFunctions={isAllFunctions}
            onDirtyChange={setIsDirty}
            onSectionSave={(items) => onSectionSave?.(items, "outside")}
          />
        );
      case "inside":
        return (
          <InHouseCookSection
            data={allocationData}
            close={handleClose}   
            isDirty={isDirty} 
            vendorRefreshTrigger={vendorRefreshTrigger}
            isAllFunctions={isAllFunctions}
            onDirtyChange={setIsDirty}
            onSectionSave={(items) => onSectionSave?.(items, "inside")}
          />
        );
      default:
        return null;
    }
  }, [
    tab,
    loading,
    allocationData,
     handleClose,       
  isDirty, 
    vendorRefreshTrigger,
    isAllFunctions,
  ]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            // onClick={onClose}
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
                <FormattedMessage id="AGENCY.AGENCY_ALLOCATION" defaultMessage="Agency Allocation" />
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
                      <p className="text-sm text-gray-500">     <FormattedMessage id="AGENCY.DATE_AND_TIME" defaultMessage="Date & Time" /></p>
                      <p className="font-semibold text-gray-900">
                        {eventFunctionData?.functionStartDateTime || "-"}
                      </p>
                    </div>

                    {eventFunctionData?.pax && (
                      <div>
                        <p className="text-sm text-gray-500"> <FormattedMessage id="COMMON.PAX" defaultMessage="PAX" /></p>
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
                <span>    <FormattedMessage id="COMMON.ADD_VENDOR" defaultMessage="Add Vendor" /></span>
                <Plus className="w-5 h-5  text-white rounded-full" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 px-6 py-4 border-b bg-gray-50">
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

            {/* Content */}
            <div className="flex-1 overflow-auto bg-gray-50">
              {renderSection}
            </div>
          </motion.div>
        </div>
      )}
      <AddContactName
        isModalOpen={isMemberModalOpen}
        setIsModalOpen={setIsMemberModalOpen}
        concatId={concatId}
        contactTypeId={contactTypeId}
        refreshData={handleVendorRefresh}
      />
    </AnimatePresence>
  );
}






// import { motion, AnimatePresence } from "framer-motion";
// import { useEffect, useState, useCallback, useMemo, useRef } from "react";
// import ChefLabourSection from "./sections/ChefLabourSection";
// import OutsideAgencySection from "./sections/OutsideAgencySection";
// import InHouseCookSection from "./sections/InHouseCookSection";
// import AddContactName from "../../master/MenuItemMaster/components/AddContactName";
// import { Plus } from "lucide-react";

// import { GetAllItemByType } from "@/services/apiServices";


// const CircularProgress = ({ value }) => {
//   const radius = 54;
//   const stroke = 7;
//   const normalizedRadius = radius - stroke / 2;
//   const circumference = 2 * Math.PI * normalizedRadius;
//   const strokeDashoffset = circumference - (value / 100) * circumference;

//   return (
//     <div className="relative flex items-center justify-center" style={{ width: 130, height: 130 }}>
//       <svg width="130" height="130" style={{ transform: "rotate(-90deg)" }}>
//         <circle cx="65" cy="65" r={normalizedRadius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
//         <circle
//           cx="65" cy="65" r={normalizedRadius}
//           fill="none" stroke="#005BA8" strokeWidth={stroke}
//           strokeLinecap="round"
//           strokeDasharray={circumference}
//           strokeDashoffset={strokeDashoffset}
//           style={{ transition: "stroke-dashoffset 0.4s ease" }}
//         />
//       </svg>
//       <span className="absolute text-2xl font-semibold text-[#005BA8]" style={{ letterSpacing: "-0.5px" }}>
//         {Math.min(value, 100)}%
//       </span>
//     </div>
//   );
// };

// const TABS = [
//   { id: "chef", label: "Chef Labour" },
//   { id: "outside", label: "Outsource Agency" },
//   { id: "inside", label: "Inside Kitchen" },
// ];

// export default function AgencyAllocationSidebar({
//   open,
//   onClose,
//   eventId,
//   eventFunctionId,
// }) {
//   const [tab, setTab] = useState("chef");
//   const [loading, setLoading] = useState(false);
//   const [allocationData, setAllocationData] = useState(null);
//   const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
//   const [concatId, setConcatId] = useState(null);
//   const [contactTypeId, setContactTypeId] = useState(null);
//   const [vendorRefreshTrigger, setVendorRefreshTrigger] = useState(0);
//   const allocationDataRef = useRef(null);
//   const [progress, setProgress] = useState(0);

//   useEffect(() => {
//     allocationDataRef.current = allocationData;
//   }, [allocationData]);

//   // Check if viewing all functions
//   const isAllFunctions = eventFunctionId === -1;

//   // Get event function data - handle both single and multiple functions
//   const eventFunctionData = useMemo(() => {
//     if (!allocationData || allocationData.length === 0) return null;

//     if (isAllFunctions) {
//       // For all functions, show combined info
//       return {
//         eventFunctionName: "All Functions",
//         functionStartDateTime: "-",
//         functionEndDateTime: "-",
//         pax: null,
//         totalFunctions: allocationData.length,
//       };
//     }

//     // For single function
//     const {
//       function: func,
//       functionStartDateTime,
//       functionEndDateTime,
//     } = allocationData[0].eventFunction;

//     return {
//       eventFunctionName: func?.nameEnglish || "-",
//       functionStartDateTime: functionStartDateTime || "-",
//       functionEndDateTime: functionEndDateTime || "-",
//       pax: allocationData[0].eventFunction.pax,
//     };
//   }, [allocationData, isAllFunctions]);

//   const handleVendorRefresh = useCallback(() => {
//     console.log("🔄 Refreshing vendor list only...");
//     setVendorRefreshTrigger((prev) => prev + 1);
//   }, []);

//  const fetchAllocationData = useCallback(
//   async (selectedTab, preserveSelections = false) => {
//     if (!eventId || eventFunctionId === undefined || eventFunctionId === null) {
//       console.warn("Missing required IDs:", { eventId, eventFunctionId });
//       return;
//     }

//     setLoading(true);
//     setProgress(0);

//     // Start fake progress up to 80% while API is in flight
//     const progressInterval = setInterval(() => {
//       setProgress((prev) => {
//         if (prev >= 80) {
//           clearInterval(progressInterval);
//           return 80;
//         }
//         return prev + Math.floor(Math.random() * 6) + 2;
//       });
//     }, 300);

//     try {
//       let currentSelections = {};
//       if (preserveSelections && allocationDataRef.current) {
//         allocationDataRef.current.forEach((functionData) => {
//           const functionKey = functionData.eventFunction?.id || "all";
//           currentSelections[functionKey] = {};

//           functionData.menuAllocation?.forEach((category) => {
//             const categoryKey = category.menuCategoryId;
//             currentSelections[functionKey][categoryKey] = {};

//             category.eventFunctionMenuAllocations?.forEach((item, idx) => {
//               const itemKey = `${category.id}-${idx}`;
//               if (item.isSelected) {
//                 currentSelections[functionKey][categoryKey][itemKey] = {
//                   isSelected: true,
//                   selectedContactId: item.partyId,
//                   selectedContactName: item.partyName,
//                 };
//               }
//             });
//           });
//         });
//       }

//       const res = await GetAllItemByType(eventFunctionId, eventId, selectedTab);
//       const details = res?.data?.data?.["Menu Allocation Details"];

//       // ── API done: jump to 100% then stop loader ──
//       clearInterval(progressInterval);
//       setProgress(100);

//       await new Promise((r) => setTimeout(r, 350)); // let 100% render briefly

//       if (!details || details.length === 0) {
//         console.warn("No allocation data found");
//         setAllocationData(null);
//         return; // finally will still run
//       }

//       if (preserveSelections && Object.keys(currentSelections).length > 0) {
//         const restoredData = details.map((functionData) => {
//           const functionKey = functionData.eventFunction?.id || "all";
//           const savedFunctionSelections = currentSelections[functionKey] || {};

//           return {
//             ...functionData,
//             menuAllocation: functionData.menuAllocation?.map((category) => {
//               const categoryKey = category.menuCategoryId;
//               const savedCategorySelections =
//                 savedFunctionSelections[categoryKey] || {};

//               return {
//                 ...category,
//                 eventFunctionMenuAllocations:
//                   category.eventFunctionMenuAllocations?.map((item, idx) => {
//                     const itemKey = `${category.id}-${idx}`;
//                     const savedItem = savedCategorySelections[itemKey];
//                     if (savedItem) {
//                       return {
//                         ...item,
//                         isSelected: savedItem.isSelected,
//                         partyId: savedItem.selectedContactId,
//                         partyName: savedItem.selectedContactName,
//                       };
//                     }
//                     return item;
//                   }),
//               };
//             }),
//           };
//         });

//         setAllocationData(restoredData);
//       } else {
//         setAllocationData(details);
//       }
//     } catch (error) {
//       console.error("API Error:", error?.message || error);
//       // On error: jump to 100% briefly then stop
//       clearInterval(progressInterval);
//       setProgress(100);
//       await new Promise((r) => setTimeout(r, 350));
//       setAllocationData(null);
//     } finally {
//       setLoading(false);
//       setProgress(0);
//     }
//   },
//   [eventId, eventFunctionId],
// );

//   useEffect(() => {
//     if (open) {
//       setTab("chef");
//       setAllocationData(null);
//       fetchAllocationData("chef");
//     }
//   }, [open, fetchAllocationData]);

//   const handleTabClick = useCallback(
//     (selectedTab) => {
//       if (selectedTab === tab) return;

//       setTab(selectedTab);
//       fetchAllocationData(selectedTab);
//     },
//     [tab, fetchAllocationData],
//   );

//   const renderSection = useMemo(() => {
//     if (loading) {
//   return (
//     <div className="flex flex-col items-center justify-center p-12 gap-4">
//       <CircularProgress value={progress} />
//       {/* <p className="text-gray-500 text-sm font-medium">Loading allocation data...</p> */}
//     </div>
//   );
// }

//     if (!allocationData) {
//       return (
//         <div className="flex items-center justify-center p-12">
//           <p className="text-gray-500">No data available</p>
//         </div>
//       );
//     }

//     switch (tab) {
//       case "chef":
//         return (
//           <ChefLabourSection
//             data={allocationData}
//             close={onClose}
//             vendorRefreshTrigger={vendorRefreshTrigger}
//             isAllFunctions={isAllFunctions}
//           />
//         );
//       case "outside":
//         return (
//           <OutsideAgencySection
//             data={allocationData}
//             close={onClose}
//             vendorRefreshTrigger={vendorRefreshTrigger}
//             isAllFunctions={isAllFunctions}
//           />
//         );
//       case "inside":
//         return (
//           <InHouseCookSection
//             data={allocationData}
//             close={onClose}
//             vendorRefreshTrigger={vendorRefreshTrigger}
//             isAllFunctions={isAllFunctions}
//           />
//         );
//       default:
//         return null;
//     }
//   }, [
//     tab,
//     loading,
//     progress,
//     allocationData,
//     onClose,
//     vendorRefreshTrigger,
//     isAllFunctions,
//   ]);

//   return (
//     <AnimatePresence>
//       {open && (
//         <div className="fixed inset-0 z-[100]">
//           {/* Overlay */}
//           <motion.div
//             className="absolute inset-0 bg-black/50"
//             onClick={onClose}
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.2 }}
//           />

//           {/* Sidebar */}
//           <motion.div
//             className="absolute top-6 bottom-6 right-6 w-[1300px] max-w-[95vw] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
//             initial={{ x: "110%" }}
//             animate={{ x: 0 }}
//             exit={{ x: "110%" }}
//             transition={{ type: "spring", damping: 25, stiffness: 300 }}
//           >
//             {/* Header */}
//             <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
//               <h2 className="text-lg font-semibold text-gray-800">
//                 Agency Allocation
//               </h2>
//               <button
//                 onClick={onClose}
//                 className="btn btn-danger"
//                 aria-label="Close sidebar"
//               >
//                 Close
//               </button>
//             </div>

//             {/* Event Info */}
//             <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
//               <div className="flex gap-20">
//                 <div>
//                   <p className="text-sm text-gray-500">Function</p>
//                   <p className="font-semibold text-gray-900">
//                     {eventFunctionData?.eventFunctionName || "-"}
//                   </p>
//                   {isAllFunctions && eventFunctionData?.totalFunctions && (
//                     <p className="text-xs text-gray-500 mt-1">
//                       {eventFunctionData.totalFunctions} function(s)
//                     </p>
//                   )}
//                 </div>

//                 {!isAllFunctions && (
//                   <>
//                     <div>
//                       <p className="text-sm text-gray-500">Date & Time</p>
//                       <p className="font-semibold text-gray-900">
//                         {eventFunctionData?.functionStartDateTime || "-"}
//                       </p>
//                     </div>

//                     {eventFunctionData?.pax && (
//                       <div>
//                         <p className="text-sm text-gray-500">PAX</p>
//                         <p className="font-semibold text-gray-900">
//                           {eventFunctionData.pax}
//                         </p>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>

//               <button
//                 onClick={() => {
//                   let typeId = null;

//                   if (tab === "chef") typeId = 5;
//                   if (tab === "outside") typeId = 6;
//                   if (tab === "inside") typeId = 7;

//                   setConcatId(typeId);
//                   setContactTypeId(typeId);
//                   setIsMemberModalOpen(true);
//                 }}
//                 className="flex items-center gap-1 p-2 rounded-lg bg-[#005BA8] text-md text-white font-semibold "
//               >
//                 <span>Add Vendor</span>
//                 <Plus className="w-5 h-5  text-white rounded-full" />
//               </button>
//             </div>

//             {/* Tabs */}
//             <div className="flex gap-3 px-6 py-4 border-b bg-gray-50">
//               {TABS.map(({ id, label }) => (
//                 <button
//                   key={id}
//                   onClick={() => handleTabClick(id)}
//                   disabled={loading}
//                   className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
//                     tab === id
//                       ? "bg-primary text-white shadow-sm"
//                       : "bg-blue-100 text-blue-700 hover:bg-blue-200"
//                   } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
//                   aria-selected={tab === id}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </div>

//             {/* Content */}
//             <div className="flex-1 overflow-auto bg-gray-50">
//               {renderSection}
//             </div>
//           </motion.div>
//         </div>
//       )}
//       <AddContactName
//         isModalOpen={isMemberModalOpen}
//         setIsModalOpen={setIsMemberModalOpen}
//         concatId={concatId}
//         contactTypeId={contactTypeId}
//         refreshData={handleVendorRefresh}
//       />
//     </AnimatePresence>
//   );
// }
