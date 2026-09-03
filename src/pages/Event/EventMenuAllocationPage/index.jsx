import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { Container } from "@/components/container";
import SidebarChefModal from "../../../components/sidebarchefmodal/SidebarChefModal";
import Swal from "sweetalert2";
import { Input, Checkbox, Card, Badge, Tooltip, Spin } from "antd";
import SidebarModal from "../../../components/SidebarModal/SidebarModal";
import CategorySidebarModal from "../CategorySidebar/CategorySidebarModal";
import SidebarInsideModal from "../../../components/SidebarInsidemodal/SidebarInsideModal ";
import WhatsappSidebarMenu from "../whatsappsidebar/WhatsappSidebarMenu";
import MenuReport from "@/partials/modals/menu-report/MenuReport";
import SelectMenureport from "../../../partials/modals/menu-report/SelectMenureport";
import SummaryItemModalchefoutside from "@/components/sidebarchefoutsidemodal/SummaryItemModalchefoutside";
import SummaryItemModalOutsideAgency from "@/components/sidebarOutSideAgency/SummaryItemModalOutSideAgency";
import SummaryItemModalInHousecook from "@/components/sidebarmodalinhousecook/SummaryItemModalInHousecook";
import {
  GetEventMasterById,
  GetMenuAllocation,
  SelectedItemNameMenuAllocation,
  MenuAllocationSave,
  SyncRawmaterialMenuallocation,
  MenuAllocationTypeSummary,
  GETallGodown,
  GettemplatebyuserId,
  GetAllCustomThemeByUserIdAndModuleId,
  FetchCalc,
  Deletesyncmenuallocationandrawmaterial,
  SyncItemWiseRawMaterial,
} from "@/services/apiServices";
import { useParams, useNavigate, useBlocker } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import PlaceSelect from "../../../components/PlaceSelect/PlaceSelect";
import AgencyAllocationSidebar from "../AgencyAllocationSidebar/AgenyAllocationSidebar";
import { message } from "antd";
import { toAbsoluteUrl } from "@/utils/Assets";
import AllVendor from "./components/AllVendor";
import AllCustomerToogle from "@/components/modal/AllCustomerToggle";
import { usePermission } from "../../../hooks/usePermission";
import { AddLogs } from "../../../services/apiServices";
import { AlertTriangle, Calendar, Globe, IndianRupee, Languages, RefreshCw } from "lucide-react";
import { useModuleAccess } from "../../../hooks/useModuleAccess";
import TranslateInstructionModal from "./TranslateInstructionModal";

/**
 * Get the current language from localStorage
 * @returns {string} - Language code (e.g., 'en', 'gu', 'hi')
 */
const getCurrentLanguage = () => {
  return localStorage.getItem("lang") || "en"; // Default to English
};

/**
 * Get localized value from an object
 * @param {Object} obj - Object containing the data
 * @param {string} baseFieldName - Base field name
 * @param {string} fallbackValue - Fallback value if field not found
 * @returns {string} - Localized value
 */
const getLocalizedValue = (obj, baseFieldName, fallbackValue = "-") => {
  if (!obj) return fallbackValue;

  const lang = getCurrentLanguage();

  if (lang !== "en") {
    const languageMap = {
      gu: "Gujarati",
      mr: "Gujarati", 
      ta: "Gujarati", 
      te: "Gujarati", 
      ml: "Gujarati", 
      hi: "Hindi",
    };

    const suffix = languageMap[lang];
    if (suffix) {
      const localizedField = `${baseFieldName}${suffix}`;
      if (obj[localizedField]) {
        return obj[localizedField];
      }
    }
  }

  return obj[baseFieldName] || fallbackValue;
};

/**
 * @param {Object} row
 * @param {string} fieldType
 * @returns {string}
 */
const getDisplayName = (row, fieldType) => {
  const lang = getCurrentLanguage();
  const langMap = {
    en: fieldType + "En",
    hi: fieldType + "Hi",
    gu: fieldType + "Gu",
    mr: fieldType + "Gu", 
    ta: fieldType + "Gu", 
    te: fieldType + "Gu", 
    ml: fieldType + "Gu", 
  };
  return row[langMap[lang]] || row[langMap["en"]] || row[fieldType] || "";
};

const getPartyName = (party) => {
  if (!party) return "-";
  const lang = getCurrentLanguage();

  if (lang === "hi") return party.nameHindi || party.nameEnglish || "-";
  if (lang === "gu") return party.nameGujarati || party.nameEnglish || "-";
  return party.nameEnglish || "-";
};

const getEventTypeName = (eventType) => {
  if (!eventType) return "N/A";
  const lang = getCurrentLanguage();

  if (lang === "hi")
    return eventType.nameHindi || eventType.nameEnglish || "N/A";
  if (lang === "gu")
    return eventType.nameGujarati || eventType.nameEnglish || "N/A";
  return eventType.nameEnglish || "N/A";
};

const getVenueName = (venue) => {
  if (!venue) return "-";
  const lang = getCurrentLanguage();

  if (lang === "hi") return venue.nameHindi || venue.nameEnglish || "-";
  if (lang === "gu") return venue.nameGujarati || venue.nameEnglish || "-";
  return venue.nameEnglish || "-";
};

const getFunctionName = (functionObj) => {
  if (!functionObj) return "Unnamed";
  const lang = getCurrentLanguage();

  if (lang === "hi")
    return functionObj.nameHindi || functionObj.nameEnglish || "Unnamed";
  if (lang === "gu")
    return functionObj.nameGujarati || functionObj.nameEnglish || "Unnamed";
  return functionObj.nameEnglish || "Unnamed";
};

const TopTabs = ({ value, onChange, functions, tableLoading }) => {
  return (
    <Container>
      <div className="flex gap-2 overflow-x-auto scrollbar-thin custom-scrollbar scrollbar-thumb-primary/30 scrollbar-track-gray-100 pb-1.5 px-0.5">
        {functions.map((item) => {
          const dateTime = item?.functionStartDateTime || "";
          const parts = dateTime.split(" ");
          const date = parts[0];
          const time = parts.length >= 3 ? `${parts[1]} ${parts[2]}` : "";
          const isActive = value?.id === item.id;

          const isDisabled = tableLoading && !isActive;

          return (
            <button
              key={item.id || item.function?.id}
              onClick={() => !isDisabled && onChange(item)}
              disabled={isDisabled}
              className={`min-w-[100px] max-w-[140px] flex-shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition-all border ${
                isActive
                  ? "bg-primary text-white border-primary shadow-md"
                  : isDisabled
                    ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
              }`}
            >
              <p className="font-semibold text-xs truncate text-center">
                {getFunctionName(item.function)}
              </p>
              {date && (
                <p
                  className={`text-center mt-0.5 ${isActive ? "text-white/80" : "text-gray-400"}`}
                >
                  {date}
                </p>
              )}
              {time && (
                <p
                  className={`text-center ${isActive ? "text-white/70" : "text-gray-400"}`}
                >
                  {time}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </Container>
  );
};

const OrderSummary = ({
  groups,
  onItemClick,
  loading,
  pax,
  groupedByFunction,
  rows,
  eventId, 
  activeEventFunctionId,         
  onSyncSuccess
}) => {

const eventFunctionId = activeEventFunctionId;
  const [syncingKey, setSyncingKey] = useState(null); // tracks which item is syncing

  const handleSyncItem = async (item, eventFunctionId) => {
    const result = await Swal.fire({
      title: "Sync Raw Material?",
      text: "This will sync raw material for this item. Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Sync",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    const key = `${item.menuItemId}-${eventFunctionId}`;
    setSyncingKey(key);

    try {
      const res = await SyncItemWiseRawMaterial(
        eventFunctionId,
        eventId,
        item.menuItemId,
      );

      if (res?.data?.success) {
        await Swal.fire({
          icon: "success",
          title: "Synced Successfully",
          text: "Raw material synced for this item.",
          confirmButtonColor: "#3085d6",
        });
        onSyncSuccess?.(eventFunctionId);
      } else {
        throw new Error(res?.data?.message || "Sync failed");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to sync raw material",
        confirmButtonColor: "#d33",
      });
    } finally {
      setSyncingKey(null);
    }
  };
  const getItemName = (item) => {
    return getLocalizedValue(item, "menuItemName", item.menuItemName);
  };

  const getCategoryName = (category) => {
    const lang = getCurrentLanguage();
    switch (lang) {
      case "hi":
        return (
          category.categoryNameHindi ||
          category.menuCategoryNameHindi ||
          category.categoryName ||
          category.menuCategoryName ||
          ""
        );
      case "gu":
      case "mr":
      case "ta":
      case "te":
      case "ml":
        return (
          category.categoryNameGujarati ||
          category.menuCategoryNameGujarati ||
          category.categoryName ||
          category.menuCategoryName ||
          ""
        );
      default:
        return category.categoryName || category.menuCategoryName || "";
    }
  };

  // const calculateItemPrice = (item, matchingRow) => {
  //   if (!matchingRow) return item.totalPrice || 0;

  //   const basePrice = Number(item.totalPrice) || 0;

  //   if (matchingRow.inside) {
      
  //     const transportCost =
  //       matchingRow.eventFunctionMenuAllocations
  //         ?.filter((a) => a.isInside)
  //         .reduce((sum, a) => sum + (Number(a.shiftTransPrice) || 0), 0) || 0;
  //     return basePrice + transportCost;
  //   }

  //   if (matchingRow.outside) {
  //     return (
  //       matchingRow.eventFunctionMenuAllocations
  //         ?.filter((a) => a.isOutside)
  //         .reduce((sum, a) => sum + (a.totalPrice || 0), 0) || 0
  //     );
  //   }

  //   if (matchingRow.chefLabour) {
  //     const chefCost =
  //       matchingRow.eventFunctionMenuAllocations
  //         ?.filter((a) => a.isChefLabour)
  //         .reduce((sum, a) => sum + (a.totalPrice || 0), 0) || 0;
  //     return basePrice + chefCost;
  //   }

  //   return basePrice;
  // };

 
//   const calculateItemPrice = (item, matchingRow) => {

//     if (item.typeName === "OUTSIDE") return 0;
//   if (!matchingRow) return item.totalPrice || 0;

//   const basePrice = Number(item.totalPrice) || 0;

//   if (matchingRow.inside) {
//     const transportCost =
//       matchingRow.eventFunctionMenuAllocations
//         ?.filter((a) => a.isInside)
//         .reduce((sum, a) => sum + (Number(a.shiftTransPrice) || 0), 0) || 0;
//     return basePrice + transportCost;
//   }

//   return basePrice; 
// };



const calculateItemPrice = (item, matchingRow) => {
  if (item.typeName === "OUTSIDE") return 0;
  if (!matchingRow) return item.totalPrice || 0;

  const basePrice = Number(item.totalPrice) || 0;

  if (matchingRow.inside) {
    const transportCost =
      matchingRow.eventFunctionMenuAllocations
        ?.filter((a) => a.isInside)
        .reduce((sum, a) => sum + (Number(a.shiftTransPrice) || 0), 0) || 0;
    return basePrice + transportCost;
  }

  if (matchingRow.chefLabour) {
    const chefCost =
      matchingRow.eventFunctionMenuAllocations
        ?.filter((a) => a.isChefLabour)
        .reduce((sum, a) => sum + (Number(a.totalPrice) || 0), 0) || 0;
    return basePrice + chefCost;  // ← add chef cost to base
  }

  return basePrice;
};

  const grandTotal = useMemo(() => {
    if (groupedByFunction) {
     
      return Math.round(
        groupedByFunction.reduce((total, functionGroup) => {
          const functionTotal = functionGroup.selectedItemDetails.reduce(
            (ftotal, category) => {
              const categoryTotal =
                category.selectedMenuPreparationItems.reduce((sum, item) => {
                  // Find the matching row for this specific function
                  const matchingRow = rows.find(
                    (r) =>
                      r.menuItemId === item.menuItemId &&
                      r.eventFunctionId === functionGroup.eventFunctionId,
                  );

                  const itemPrice = calculateItemPrice(item, matchingRow);
                  return sum + itemPrice;
                }, 0);
              return ftotal + categoryTotal;
            },
            0,
          );
          return total + functionTotal;
        }, 0),
      );
    } else {
      
      return Math.round(
        groups.reduce((total, group) => {
          const groupTotal = group.items.reduce((sum, item) => {
            if (item.typeName === "OUTSIDE") return sum;
            return sum + (item.totalPrice || 0);
          }, 0);
          return total + groupTotal;
        }, 0),
      );
    }
  }, [groups, groupedByFunction, rows]);

  const dishCosting = pax > 0 ? Math.round(grandTotal / pax) : 0;
  let totalChefPrice = groups[0]?.totalChefPrice || 0;
  let totalOutSidePrice = groups[0]?.totalOutSidePrice || 0;

  return (
    <div className="flex flex-col gap-2 no-scrollbar">
      <Card
        className="w-full border border-gray-200 shadow-sm"
        bodyStyle={{ padding: 0 }}
        title={
          <div className="flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              ✱
            </span>
            <span className="text-gray-800">
              <FormattedMessage
                id="EVENT_MENU_ALLOCATION.ORDER_SUMMARY"
                defaultMessage="Order Summary"
              />
            </span>
          </div>
        }
      >
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Spin />
          </div>
        ) : groups.length === 0 && !groupedByFunction ? (
          <div className="p-4 text-center text-gray-500">
            <FormattedMessage
              id="EVENT_MENU_ALLOCATION.NO_ITEMS"
              defaultMessage="No items available"
            />
          </div>
        ) : groupedByFunction ? (
        
          <>
            <div className="divide-y">
              {groupedByFunction.map((functionGroup, fIdx) => {
                // Calculate function total with proper row matching
                const functionTotal = functionGroup.selectedItemDetails.reduce(
                  (total, category) => {
                    const categoryTotal =
                      category.selectedMenuPreparationItems.reduce(
                        (sum, item) => {
                          // Find the matching row for this specific function
                          const matchingRow = rows.find(
                            (r) =>
                              r.menuItemId === item.menuItemId &&
                              r.eventFunctionId ===
                                functionGroup.eventFunctionId,
                          );

                          const itemPrice = calculateItemPrice(
                            item,
                            matchingRow,
                          );
                          return sum + itemPrice;
                        },
                        0,
                      );
                    return total + categoryTotal;
                  },
                  0,
                );

                const functionDishCosting =
                  functionGroup.pax > 0
                    ? Math.round(functionTotal / functionGroup.pax)
                    : 0;

                const totalChefPrice = functionGroup?.totalChefPrice || 0;
                const totalOutSidePrice = functionGroup?.totalOutSidePrice || 0;
                return (
                  <div
                    key={`function-summary-${functionGroup.eventFunctionId}-${fIdx}`}
                    className="border-b-2 border-gray-300 last:border-b-0"
                  >
                    {/* Function Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-l-4 border-primary">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className="ki-filled ki-calendar text-primary"></i>
                          <span className="font-bold text-gray-800 uppercase text-sm">
                            {functionGroup.functionName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-md">
                          <i className="ki-filled ki-people text-primary text-xs"></i>
                          <span className="text-xs font-semibold text-primary">
                            {functionGroup.pax}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Categories for this function */}
                    {functionGroup.selectedItemDetails.map((category, cIdx) => (
                      <div
                        key={`${functionGroup.eventFunctionId}-${category.menuCategoryId}-${cIdx}`}
                        className="p-4"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <Badge color="#22c55e" />
                          <span className="font-medium text-gray-900">
                            {getCategoryName(category)}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-12 gap-y-2 text-sm text-gray-700 cursor-pointer">
  {category.selectedMenuPreparationItems.map((item, iIdx) => {
    const matchingRow = rows.find(
      (r) =>
        r.menuItemId === item.menuItemId &&
        r.eventFunctionId === functionGroup.eventFunctionId,
    );

    const displayPrice = calculateItemPrice(item, matchingRow);
    const syncKey = `${item.menuItemId}-${functionGroup.eventFunctionId}`;

    return (
      <Fragment
        key={`${category.menuCategoryId}-${item.menuItemId}-${iIdx}`}
      >
        <div className="col-span-1 flex items-center justify-center">
          <Tooltip title="Sync raw material for this item">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSyncItem(item, functionGroup.eventFunctionId);
              }}
              disabled={syncingKey === syncKey}
              className="p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-primary transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={syncingKey === syncKey ? "animate-spin" : ""}
              />
            </button>
          </Tooltip>
        </div>
        <div
          className="col-span-8 pl-2 hover:text-primary"
          onClick={() =>
            onItemClick(item, category, functionGroup.eventFunctionId)
          }
        >
          {getItemName(item)}
          <span className="ml-1 text-primary font-bold">
            - {item.typeName}
          </span>
        </div>
        <div className="col-span-3 text-right tabular-nums">
          ₹{displayPrice.toFixed(2)}
        </div>
      </Fragment>
    );
  })}
</div>
                      </div>
                    ))}

                    {/* Function Subtotal */}
                    <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <div className="flex gap-1">
                          <span className="font-medium text-gray-700">
                            <FormattedMessage
                              id="EVENT_MENU_ALLOCATION.DISH_COSTING"
                              defaultMessage="Dish Costing :"
                            />
                          </span>
                          <span className="font-semibold text-gray-800">
                            <IndianRupee size={12} />{functionDishCosting.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <span className="font-medium text-gray-700">
                            <FormattedMessage
                              id="EVENT_MENU_ALLOCATION.SUBTOTAL"
                              defaultMessage="Subtotal :"
                            />
                          </span>
                          <span className="font-semibold text-primary">
                            <IndianRupee size={12} />{Math.round(functionTotal).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                      <div className="flex justify-between text-sm">
                        <div className="flex gap-1">
                          <span className="font-medium text-gray-700">
                            Total Chef Price:
                          </span>
                          <span className="font-semibold text-primary">
                            {totalChefPrice}
                          </span>
                        </div>

                        <div className="flex gap-1">
                          <span className="font-medium text-gray-700">
                            Total OutSide Price:
                          </span>
                          <span className="font-semibold text-primary">
                            {totalOutSidePrice}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Grand Total for All Functions */}
            <div className="card flex flex-row justify-between p-4 bg-[#FAFAFA] border-t-2 border-primary">
              <div className="flex flex-row gap-1">
                <span className="font-bold text-gray-900">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.GRAND_TOTAL"
                    defaultMessage="Grand Total :"
                  />
                </span>
                <span className="font-bold text-primary text-lg">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        ) : (
          // SINGLE FUNCTION VIEW (Original)
          <>
            <div className="divide-y">
              {groups.map((g, gi) => (
                <div key={gi} className="p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Badge color="#22c55e" />
                    <span className="font-medium text-gray-900">
                      {getCategoryName(g)}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-12 gap-y-2 text-sm text-gray-700 cursor-pointer">
                    {g.items.map((it, ii) => {
                      const eventFunctionId = activeEventFunctionId;   // 👈 ADD IT HERE
                      const syncKey = `${it.menuItemId}-${eventFunctionId}`;

                      return (
                        <Fragment key={`${g.categoryId}-${it.menuItemId}`}>
                          <div className="col-span-1 flex items-center justify-center">
                            <Tooltip title="Sync raw material for this item">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSyncItem(it, eventFunctionId);
                                }}
                                disabled={syncingKey === syncKey}
                                className="p-1 rounded hover:bg-blue-50 text-gray-700 hover:text-primary transition-colors disabled:opacity-50"
                              >
                                <RefreshCw
                                  size={14}
                                  className={syncingKey === syncKey ? "animate-spin" : ""}
                                />
                              </button>
                            </Tooltip>
                          </div>
                          <div
                            className="col-span-8 pl-2 hover:text-primary"
                            onClick={() => onItemClick(it, g, null)}
                          >
                            {getItemName(it)}{" "}
                            <span className="text-primary font-bold">
                              - {it.typeName}
                            </span>
                          </div>
                          <div className="col-span-3 text-right tabular-nums">
                            ₹{it.typeName === "OUTSIDE" ? 0 : it.totalPrice?.toFixed(2) || "0.00"}
                          </div>
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
              <div className="flex justify-between text-sm">
                <div className="flex gap-1">
                  <span className="font-medium text-gray-700">
                    Total Chef Price:
                  </span>
                  <span className="font-semibold text-primary">
                    {totalChefPrice}
                  </span>
                </div>

                <div className="flex gap-1">
                  <span className="font-medium text-gray-700">
                    Total OutSide Price:
                  </span>
                  <span className="font-semibold text-primary">
                    {totalOutSidePrice}
                  </span>
                </div>
              </div>
            </div>

            <div className="card flex flex-col justify-between p-4 bg-[#FAFAFA]">
              <div className="flex flex-row gap-1">
                <span className="font-medium text-gray-900">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.TOTAL"
                    defaultMessage="Total :"
                  />
                </span>
                <span className="font-semibold text-primary">
                  ₹{grandTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-row gap-1">
                <span className="font-medium text-gray-900">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.DISH_COSTING"
                    defaultMessage="Total Raw Material Cost Per Dish :"
                  />
                </span>
                <span className="font-semibold text-gray-900">
                  ₹{dishCosting.toFixed(2)}
                </span>
              </div>
              
            </div>

            
          </>
        )}
      </Card>
    </div>
  );
};

const TableHeader = ({
  onChefCheckAll,
  onOutsourceCheckAll,
  onInsideCheckAll,
  allChefChecked,
  allOutsourceChecked,
  allInsideChecked,
}) => {
  const handleChefCheck = (checked) => {
    if (checked) {
      onOutsourceCheckAll(false);
      onInsideCheckAll(false);
    }
    onChefCheckAll(checked);
  };

  const handleOutsourceCheck = (checked) => {
    if (checked) {
      onChefCheckAll(false);
      onInsideCheckAll(false);
    }
    onOutsourceCheckAll(checked);
  };

  const handleInsideCheck = (checked) => {
    if (checked) {
      onChefCheckAll(false);
      onOutsourceCheckAll(false);
    }
    onInsideCheckAll(checked);
  };

  return (
    <div
      className="grid grid-cols-12 items-center gap-2 border-b border-gray-200 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 bg-gray-50 sticky z-10 rounded-t-xl"
      style={{ top: "220px" }}
    >
      {/* Name — col 1-3 */}
      <div className="col-span-3 text-left">
        <FormattedMessage id="COMMON.NAME" defaultMessage="Name" />
      </div>

      {/* Chef — col 4 */}
      <div className="col-span-1 text-center">
        <div className="flex flex-col items-center gap-1">
          <span>
            <FormattedMessage id="COMMON.CHEF_LABOUR" defaultMessage="Chef" />
          </span>
          <Checkbox
            checked={allChefChecked}
            onChange={(e) => handleChefCheck(e.target.checked)}
          />
        </div>
      </div>

      {/* Outsource — col 5 */}
      <div className="col-span-1 text-center">
        <div className="flex flex-col items-center gap-1">
          <span>
            <FormattedMessage id="COMMON.OUTSIDE" defaultMessage="Outsource" />
          </span>
          <Checkbox
            checked={allOutsourceChecked}
            onChange={(e) => handleOutsourceCheck(e.target.checked)}
          />
        </div>
      </div>

      {/* Inside — col 6 */}
      <div className="col-span-1 text-center">
        <div className="flex flex-col items-center gap-1">
          <span>
            <FormattedMessage id="COMMON.INSIDE" defaultMessage="Inside" />
          </span>
          <Checkbox
            checked={allInsideChecked}
            onChange={(e) => handleInsideCheck(e.target.checked)}
          />
        </div>
      </div>

      {/* Person — col 7 */}
      <div className="col-span-1 text-center">
        <FormattedMessage id="COMMON.PERSON" defaultMessage="Person" />
      </div>

      {/* Place — col 8-9 */}
      <div className="col-span-2 text-center">
        <FormattedMessage id="COMMON.PLACE" defaultMessage="Place" />
      </div>

      {/* Total Price — col 10 */}
      <div className="col-span-1 text-center" style={{display:"none"}}>
        <FormattedMessage id="COMMON.TOTAL_PRICE" defaultMessage="Total Price" />
      </div>

      {/* Instructions — col 11-12 */}
      <div className="col-span-2 text-left">
        <FormattedMessage id="COMMON.INSTRUCTIONS" defaultMessage="Instructions" />
      </div>
    </div>
  );
};

const TableRow = ({ row, onChange, disabled, placeOptions = [] }) => {
  const [localPersonCount, setLocalPersonCount] = useState(row.personCount);
  const [hasError, setHasError] = useState(false);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);

  const translateTimer = useRef(null);
  const rowTotalPrice = useMemo(() => {
  const allocs = row.eventFunctionMenuAllocations || [];

  if (row.chefLabour) {
    return allocs.reduce((sum, a) => {
      const serviceType = (a.serviceType || "plate_wise")
        .toLowerCase()
        .replace(/\s+/g, "_");
      if (serviceType === "counter_wise") {
        return sum +
          (Number(a.counterQuantity) || 0) * (Number(a.counterPrice) || 0) +
          (Number(a.helperQuantity) || 0) * (Number(a.helperPrice) || 0) +
          (Number(a.shiftTransPrice) || 0);
      }
      // plate_wise: totalPrice already has the correct value
      return sum + (Number(a.totalPrice) || 0);
    }, 0);
  }

  if (row.outside) {
    return allocs.reduce((sum, a) => sum + (Number(a.totalPrice) || 0), 0);
  }

  if (row.inside) {
    return allocs.reduce((sum, a) => sum + (Number(a.shiftTransPrice) || 0), 0);
  }

  return 0;
}, [row.eventFunctionMenuAllocations, row.chefLabour, row.outside, row.inside]);

  useEffect(() => {
    setLocalPersonCount(row.personCount);
    setHasError(false);
  }, [row.personCount]);

  // const handleCheckboxChange = (type, checked) => {
  //   onChange({
  //     ...row,
  //     chefLabour: type === "chef" ? checked : false,
  //     outside: type === "outside" ? checked : false,
  //     inside: type === "inside" ? checked : false,
  //   });
  // };

  const handleCheckboxChange = (type, checked) => {
    const hasOutsideData = row.eventFunctionMenuAllocations?.some(
      (a) => a.isOutside && (a.partyId || a.price || a.quantity),
    );
    const hasChefData = row.eventFunctionMenuAllocations?.some(
      (a) =>
        a.isChefLabour && (a.partyId || a.counterQuantity || a.counterPrice),
    );
    const hasInsideData = row.eventFunctionMenuAllocations?.some(
      (a) => a.isInside && (a.partyId || a.number || a.remarks),
    );

    if (checked) {
      const switchingAwayFromOutside =
        row.outside && hasOutsideData && type !== "outside";
      const switchingAwayFromChef =
        row.chefLabour && hasChefData && type !== "chef";
      const switchingAwayFromInside =
        row.inside && hasInsideData && type !== "inside";

      if (
        switchingAwayFromOutside ||
        switchingAwayFromChef ||
        switchingAwayFromInside
      ) {
        const currentType = row.outside
          ? "Outsource"
          : row.chefLabour
            ? "Chef Labour"
            : "Inside";

        Swal.fire({
          title: "Switch Type?",
          html: `You have saved data in <b>${currentType}</b>.<br/>Switching will clear that allocation data.<br/>Are you sure?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Yes, Switch",
          cancelButtonText: "Cancel",
        }).then((result) => {
          if (result.isConfirmed) {
            onChange({
              ...row,
              chefLabour: type === "chef" ? checked : false,
              outside: type === "outside" ? checked : false,
              inside: type === "inside" ? checked : false,
              eventFunctionMenuAllocations:
                row.eventFunctionMenuAllocations?.filter((a) => {
                  if (type === "chef") return !a.isOutside && !a.isInside;
                  if (type === "outside") return !a.isChefLabour && !a.isInside;
                  if (type === "inside") return !a.isOutside && !a.isChefLabour;
                  return true;
                }) || [],
            });
          }
        });
        return; // Don't proceed until user confirms
      }
    }

    onChange({
      ...row,
      chefLabour: type === "chef" ? checked : false,
      outside: type === "outside" ? checked : false,
      inside: type === "inside" ? checked : false,
    });
  };

  const handlePersonCountChange = (e) => {
    setLocalPersonCount(Number(e.target.value) || 0);
    setHasError(false);
  };

  const handlePersonCountBlur = () => {
    const value = Number(localPersonCount);
    if (value === 0) {
      setHasError(true);
      message.error("Value cannot be zero");
      return;
    }
    if (isNaN(value) || value < 0) {
      setHasError(true);
      message.error("Invalid person value");
      return;
    }
    if (value !== row.personCount)
      onChange({ ...row, personCount: value }, true);
  };

const handleInstructionChange = (e) => {
  const val = e.target.value;
  onChange({ ...row, instructions: val });

  // Auto-translate with debounce
  if (translateTimer.current) clearTimeout(translateTimer.current);

  if (!val.trim()) {
    onChange({ ...row, instructions: val, instructionsHindi: "", instructionsGujarati: "" });
    return;
  }

  translateTimer.current = setTimeout(async () => {
    try {
      const { Translateapi } = await import("@/services/apiServices");
      const res = await Translateapi(val);
      const data = res?.data || {};
      onChange({
        ...row,
        instructions: val,
        instructionsHindi: data.hindi || "",
        instructionsGujarati: data.gujarati || "",
      });
    } catch (err) {
      console.error("Translation error:", err);
    }
  }, 600);
};
 

  return (
    <>
<TranslateInstructionModal
  isOpen={isTranslateOpen}
  onClose={() => setIsTranslateOpen(false)}
  sourceText={row.instructions}
  valueHindi={row.instructionsHindi}
  valueGujarati={row.instructionsGujarati}
  onChange={(fields) => onChange({ ...row, ...fields })}
/>
<div className="grid grid-cols-12 items-center gap-2 border-b border-gray-100 px-4 py-3 text-sm hover:bg-blue-50/40 transition-colors group">
  {/* Name — col-span-3 */}
  <div className="col-span-3 font-medium text-gray-800">
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-gray-400 uppercase tracking-wide">
        {getDisplayName(row, "categoryName")}
      </span>
      <span className="text-sm font-semibold text-gray-800 leading-tight">
        {getDisplayName(row, "itemName")}
      </span>
    </div>
  </div>

  {/* Chef — col-span-1 */}
  <div className="col-span-1 flex justify-center items-center">
    <Checkbox
      checked={row.chefLabour}
      disabled={disabled}
      onChange={(e) => handleCheckboxChange("chef", e.target.checked)}
    />
  </div>

  {/* Outside — col-span-1 */}
  <div className="col-span-1 flex justify-center items-center">
    <Checkbox
      checked={row.outside}
      disabled={disabled}
      onChange={(e) => handleCheckboxChange("outside", e.target.checked)}
    />
  </div>

  {/* Inside — col-span-1 */}
  <div className="col-span-1 flex justify-center items-center">
    <Checkbox
      checked={row.inside}
      disabled={disabled}
      onChange={(e) => handleCheckboxChange("inside", e.target.checked)}
    />
  </div>

  {/* Person — col-span-1 */}
  <div className="col-span-1 flex justify-center">
    <Input
      min={0}
      type="text"
      value={localPersonCount}
      onChange={handlePersonCountChange}
      onBlur={handlePersonCountBlur}
      status={hasError ? "error" : ""}
      className="w-14 text-center text-sm p-1"
    />
  </div>


<div className="col-span-2">
    <select
      value={row.place || "0"}
      onChange={(e) => onChange({ ...row, place: e.target.value })}
      className="w-full text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
    >
      {placeOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>

  {/* Total Price — col-span-1 */}
  <div className="col-span-1 text-center d-none" style={{display:"none"}}>
    <span className={`text-sm font-semibold ${rowTotalPrice > 0 ? "text-primary" : "text-gray-400"}`}>
      ₹{rowTotalPrice.toFixed(2)}
    </span>
  </div>

<div className="col-span-2 flex items-center gap-1">
  <Input
    size="small"
    placeholder="Add note..."
    value={row.instructions}
    onChange={handleInstructionChange}
    className="w-full text-sm"
    onDoubleClick={() => setIsTranslateOpen(true)}
  />
  <button
    type="button"
    onClick={() => setIsTranslateOpen(true)}
    className="flex-shrink-0 p-1 rounded hover:bg-blue-50 text-gray-400 hover:text-blue-500 transition-colors"
    title="View/edit translations"
  >
    <Languages size={16} />
  </button>
</div>
</div>
</>
  );
};

const FunctionSectionLabel = ({ functionName, functionDateTime, pax }) => {
  return (
    <div
      className="sticky bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-primary px-5 py-3 shadow-sm"
      style={{ top: "268px", zIndex: 4 }} // ← lowered zIndex below TableHeader (z-10)
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <i className="ki-filled ki-calendar text-primary text-lg" />
          <div>
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              {functionName}
            </h3>
            {functionDateTime && (
              <p className="text-xs text-gray-500 mt-0.5">{functionDateTime}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-gray-100">
          <i className="ki-filled ki-people text-primary text-sm" />
          <span className="text-xs text-gray-500">
            <FormattedMessage id="COMMON.PAX" defaultMessage="Pax:" />
          </span>
          <span className="text-sm font-bold text-primary">{pax}</span>
        </div>
      </div>
    </div>
  );
};

const EventMenuAllocationPage = ({ mode }) => {
  let { eventId } = useParams();
  const navigate = useNavigate();
  const saveTimeoutRef = useRef(null);

  const [activeFunction, setActiveFunction] = useState(null);
  const [rows, setRows] = useState([]);
  const [orderSummaryGroups, setOrderSummaryGroups] = useState([]);
  const [percentage, setPercentage] = useState("");
  const [open, setOpen] = useState(false);
  const [isChefModal, setIsChefModal] = useState(false);
  const [isCategoryModal, setIsCategoryModal] = useState(false);
  const [iswhatsAppSidebar, setIsWhatsAppSidebar] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [allocationData, setAllocationData] = useState({});
  const [menuReportEventId, setMenuReportEventId] = useState(null);
  const [isMenuReport, setIsMenuReport] = useState(false);
  const [isSelectMenureport, setIsSelectMenuReport] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOutsideAgencyModalOpen, setIsOutsideAgencyModalOpen] =
    useState(false);
  const [isInHouseCookModalOpen, setIsInHouseCookModalOpen] = useState(false);
  const [isInsideModal, setIsInsideModal] = useState(false);
  const intl = useIntl();
  const [searchTerm, setSearchTerm] = useState("");
  const [chefsummary, setchefsummary] = useState([]);
  const [outsidesummary, setoutsidesummary] = useState([]);
  const [insidesummary, setinsidesummary] = useState([]);
  const [isAgencyAllocationModal, setIsAgencyAllocationModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialRows, setInitialRows] = useState([]);
  const [chefModalData, setChefModalData] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [allMenuData, setAllMenuData] = useState([]);
  const [placeOptions, setPlaceOptions] = useState([
    { value: "0", label: "At venue", id: 0 },
  ]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const personSaveTimeoutRef = useRef(null);
  const [allVendor, setAllVendor] = useState(false);
  const [menuForHMModuleId, setMenuForHMModuleId] = useState(null);
  const [menuForHMMappingId, setMenuForHMMappingId] = useState(null);
  const [menuForHMTemplateId, setMenuForHMTemplateId] = useState(null);

  // ============= LANGUAGE STATE =============
  const [currentLang, setCurrentLang] = useState(getCurrentLanguage());
  const lastSavedPersonRef = useRef({});
  const isInitialLoadRef = useRef(true);
  const [allChefChecked, setAllChefChecked] = useState(false);
  const [allOutsourceChecked, setAllOutsourceChecked] = useState(false);
  const [allInsideChecked, setAllInsideChecked] = useState(false);
  const [isAllCustomerToogleOpen, setIsAllCustomerToogleOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isMenuForHMOpen, setIsMenuForHMOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [saveCooldown, setSaveCooldown] = useState(false);
const saveCooldownRef = useRef(false);
const saveCooldownTimerRef = useRef(null);

const [syncCooldown, setSyncCooldown] = useState(false);
const syncCooldownRef = useRef(false);
const syncCooldownTimerRef = useRef(null);

  const permMenuPlanning = usePermission("Menu Planning");
  const { hasModuleAccess } = useModuleAccess();
  const canAccessAccounting = hasModuleAccess("Account");
  const permRawMaterial = usePermission("Raw Material Distribution");
  const permAgencyDistribution = usePermission("Labour Agency Order");
  const permPerDishCosting = usePermission("Per Dish Costing");
  const isSavingRef = useRef(false);
  const saveClickCountRef = useRef(0);
  const [saveProgress, setSaveProgress] = useState(0);
  const saveProgressRef = useRef(0);
  const progressAnimRef = useRef(null);
  const isSubmittingRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasUnsavedChanges && currentLocation.pathname !== nextLocation.pathname,
  );
  const userEmail = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("auth-storage"))?.state?.user?.email ||
        ""
      );
    } catch {
      return "";
    }
  })();

useEffect(() => {
  return () => {
    if (saveCooldownTimerRef.current) clearTimeout(saveCooldownTimerRef.current);
    if (syncCooldownTimerRef.current) clearTimeout(syncCooldownTimerRef.current);
  };
}, []);
  
 
  const changedPaxRowsRef = useRef(new Set());

  const fetchMenuForHMModule = async () => {
    try {
      const res = await GettemplatebyuserId();

      if (res?.data?.success && res?.data?.data) {
        const menuForHMModule = res.data.data.find(
          (module) =>
            module.nameEnglish === "Menu For HM" &&
            module.isActive &&
            !module.isDelete,
        );

        if (menuForHMModule) {
          setMenuForHMModuleId(menuForHMModule.id);

          const templatesRes = await GetAllCustomThemeByUserIdAndModuleId(
            localStorage.getItem("userId"),
            menuForHMModule.id,
          );

          // ✅ ADD THIS DEBUG CODE

          // templatesRes?.data?.data?.forEach((template, index) => {
          //   console.log(`Template ${index}:`, {
          //     name: template.templateMaster?.name,
          //     mappingId: template.templateMappingResponseDto?.id,
          //   });
          // });

          if (
            templatesRes?.data?.success &&
            templatesRes?.data?.data?.length > 0
          ) {
            const firstTemplate = templatesRes.data.data[0];

            const templateId = firstTemplate.id; // 446
            const mappingId =
              firstTemplate.templateMappingResponseDto?.id || firstTemplate.id; // 49

            setMenuForHMTemplateId(templateId);
            setMenuForHMMappingId(mappingId);
          }
        }
      }
    } catch (error) {
      console.error("Error:");
    }
  };
  useEffect(() => {
    if (eventId) fetchMenuForHMModule();
  }, [eventId]);
  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = getCurrentLanguage();
      if (newLang !== currentLang) {
        setCurrentLang(newLang);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const interval = setInterval(() => {
      const newLang = getCurrentLanguage();
      if (newLang !== currentLang) {
        setCurrentLang(newLang);
      }
    }, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [currentLang]);

  useEffect(() => {
    if (eventId) fetchMenuForHMModule();
  }, [eventId]);
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  const handleChefCheckAll = (checked) => {
    setAllChefChecked(checked);
    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) => ({
        ...row,
        chefLabour: checked,
        outside: false,
        inside: false,
      }));
      setHasUnsavedChanges(checkForChanges(updatedRows, initialRows));
      return updatedRows;
    });
  };

  const handleOutsourceCheckAll = (checked) => {
    setAllOutsourceChecked(checked);
    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) => ({
        ...row,
        chefLabour: false,
        outside: checked,
        inside: false,
      }));
      setHasUnsavedChanges(checkForChanges(updatedRows, initialRows));
      return updatedRows;
    });
  };

  const handleInsideCheckAll = (checked) => {
    setAllInsideChecked(checked);
    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) => ({
        ...row,
        chefLabour: false,
        outside: false,
        inside: checked,
      }));
      setHasUnsavedChanges(checkForChanges(updatedRows, initialRows));
      return updatedRows;
    });
  };

  // const allFunctionTab = useMemo(
  //   () => ({
  //     id: -1,
  //     function: { id: -1, nameEnglish: "All Functions" },
  //     functionStartDateTime: "",
  //     allFunctionIds: eventData?.eventFunctions?.map((f) => f.id) || [],
  //   }),
  //   [eventData?.eventFunctions],
  // );

  const getEventFunctionId = (functionItem) => {
    if (!functionItem) return null;
    return functionItem.id;
  };

  // const isAllFunctions = activeFunction?.id === -1;

  // const groupedByFunction = useMemo(() => {
  //   if (activeFunction?.id !== -1 || !allMenuData.length) return null;

  //   return allMenuData.map((detail) => {
  //     const firstItem = detail.menuAllocation[0];
  //     const totalChefPrice = detail.totalChefPrice;
  //     const totalOutSidePrice = detail.totalOutSidePrice;
  //     return {
  //       eventFunctionId: firstItem?.eventFunctionId,
  //       functionName: firstItem?.eventFunctionName,
  //       functionDateTime: "",
  //       pax: 0,
  //       menuAllocation: detail.menuAllocation,
  //       selectedItemDetails: detail.selectedItemDetails,
  //       totalChefPrice: totalChefPrice,
  //       totalOutSidePrice: totalOutSidePrice,
  //     };
  //   });
  // }, [allMenuData, activeFunction]);

  // const enrichedGroupedByFunction = useMemo(() => {
  //   if (!groupedByFunction || !eventData?.eventFunctions) return null;

  //   return groupedByFunction.map((group) => {
  //     const functionDetail = eventData.eventFunctions.find(
  //       (f) => f.id === group.eventFunctionId,
  //     );
  //     return {
  //       ...group,
  //       functionDateTime: functionDetail?.functionStartDateTime || "",
  //       pax: functionDetail?.pax || 0,
  //     };
  //   });
  // }, [groupedByFunction, eventData]);

  useEffect(() => {
    const FetchEventDetails = async () => {
      try {
        setLoading(true);
        const res = await GetEventMasterById(eventId);

        if (res?.data?.data && res.data.data["Event Details"]?.length > 0) {
          const event = res.data.data["Event Details"][0];
          setEventData(event);
        } else {
          console.warn("No event data found.");
        }
      } catch (error) {
        console.error("Error fetching event details:");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      FetchEventDetails();
    }
  }, [eventId]);

  const handleOrderSummaryItemClick = async (
    item,
    category,
    clickedFunctionId,
  ) => {
    try {
      let eventFunctionId;

      eventFunctionId = getEventFunctionId(activeFunction);

      const menuItemId = item.menuItemId || item.id;

      const matchingRow = rows.find(
        (r) =>
          r.menuItemId === menuItemId && r.eventFunctionId === eventFunctionId,
      );

      if (matchingRow?.outside) {
        return;
      }

      let allocationType = "inside";
      if (matchingRow?.chefLabour) {
        allocationType = "chef";
      } else if (matchingRow?.outside) {
        allocationType = "outsource";
      } else if (matchingRow?.inside) {
        allocationType = "inside";
      }

      setSelectedRow({
        "MenuItem RawMaterial Details": [],
        menuItemName: item.menuItemName || "-",
        menuItemId: menuItemId,
        eventFunctionId: eventFunctionId,
        eventId: eventId,
        allocationType: allocationType,
      });

      setIsCategoryModal(true);
      setMenuLoading(true);

      const res = await SelectedItemNameMenuAllocation(
        eventFunctionId,
        menuItemId,
      );

      if (res?.data?.success) {
        const apiData = res.data.data;

        const rawMaterials =
          apiData["MenuItem RawMaterial Details"] ||
          apiData.menuItemRawMaterials ||
          [];

        setSelectedRow({
          ...apiData,
          "MenuItem RawMaterial Details": rawMaterials,
          menuItemName: item.menuItemName || apiData.menuItemName || "-",
          menuItemId: menuItemId,
          eventFunctionId: eventFunctionId,
          eventId: eventId,
          allocationType: allocationType,
        });
      }
    } catch (error) {
      console.error("Error opening category sidebar:");
    } finally {
      setMenuLoading(false);
    }
  };

  const fetchMenuAllocation = async (eventFunctionId) => {
    try {
      setMenuLoading(true);
      setTableLoading(true);

      let allMenuDataResponse = [];

      const menudata = await GetMenuAllocation(eventId, eventFunctionId);
      if (
        menudata?.data?.success &&
        menudata.data.data["Menu Allocation Details"]?.length > 0
      ) {
        allMenuDataResponse = menudata.data.data["Menu Allocation Details"];
        setAllMenuData(allMenuDataResponse);
      }

      if (allMenuDataResponse.length === 0) {
        setRows([]);
        setOrderSummaryGroups([]);
        setAllMenuData([]);
        return;
      }

      const mergedMenuAllocation = allMenuDataResponse.flatMap(
        (d) => d.menuAllocation || [],
      );

      const transformedRows = mergedMenuAllocation.map((item) => ({
        key: `${item.menuItemId}-${item.menuCategoryId}-${item.eventFunctionId}`,
        id: item.id,
        categoryName: getLocalizedValue(item, "menuCategoryName", ""),
        categoryNameEn: item.menuCategoryName,
        categoryNameGu: item.menuCategoryNameGujarati,
        categoryNameHi: item.menuCategoryNameHindi,

        itemName: getLocalizedValue(item, "menuItemName", ""),
        itemNameEn: item.menuItemName,
        itemNameGu: item.menuItemNameGujarati,
        itemNameHi: item.menuItemNameHindi,

        chefLabour: item.chefLabour || false,
        inside: item.inside || false,
        outside: item.outside || false,
        personCount: item.personCount || 0,
       place: (() => {
  const placeNum = Number(item.place);
  if (!placeNum || isNaN(placeNum)) return "0";
  return String(placeNum);
})(),
        instructions: item.instructions || "",
        instructionsHindi: item.instructionsHindi || "",      
  instructionsGujarati: item.instructionsGujarati || "",
        eventId: item.eventId,
        eventFunctionId: item.eventFunctionId,
        menuCategoryId: item.menuCategoryId,
        menuItemId: item.menuItemId,
        eventFunctionMenuAllocations: item.eventFunctionMenuAllocations?.map((alloc) => {
  const isChefLabour = item.chefLabour && !item.outside && !item.inside;
  const isOutside = item.outside;
  const isInside = item.inside;

  const serviceType = (alloc.serviceType || "plate_wise")
    .toLowerCase()
    .replace(/\s+/g, "_");

  let allocationTotal = 0;

  if (isChefLabour) {
    if (serviceType === "counter_wise") {
      allocationTotal =
        (Number(alloc.counterPrice) || 0) * (Number(alloc.counterQuantity) || 0) +
        (Number(alloc.helperPrice) || 0) * (Number(alloc.helperQuantity) || 0);
    } else {
      // plate_wise chef: use quantity * price
      allocationTotal =
        (Number(alloc.quantity) || 0) * (Number(alloc.price) || 0);
    }
  } else {
    allocationTotal =
      (Number(alloc.price) || 0) * (Number(alloc.quantity) || 0);
  }

  allocationTotal += Number(alloc.shiftTransPrice) || 0;

  return {
    id: alloc.id || null,
    partyId: alloc.partyId,
    partyName: alloc.partyName,
    menuAllocationId: item.id,
    price: Number(alloc.price) || 0,
    quantity: Number(alloc.quantity) || 0,
    unitId: alloc.unitId ?? null,
    unitName: alloc.unitName ?? null,
    serviceType: alloc.serviceType || "",
    counterQuantity: alloc.counterQuantity || 0,
    helperQuantity: alloc.helperQuantity || 0,
    counterPrice: alloc.counterPrice || 0,
    helperPrice: alloc.helperPrice || 0,
    totalPrice: allocationTotal,  
    shiftTransPrice: alloc.shiftTransPrice ?? 0,
      reportingTime: alloc.reportingTime ?? "",
    isOutside,
    isChefLabour,
    isInside,
    number: alloc.number ?? null,
    remarks: alloc.remarks ?? null,
    pax: alloc.pax ?? null,
  };
}) || [],
        menuItemRawMaterials: [],
        itemSortorder: item.itemSortorder ?? null,
        menuSortorder: item.menuSortorder ?? null,
      }));

      setRows(transformedRows);

      setInitialRows(JSON.parse(JSON.stringify(transformedRows)));
isInitialLoadRef.current = false;

      const allSelectedItems = allMenuDataResponse.flatMap(
        (detail) => detail?.selectedItemDetails || [],
      );

      const totalChefPrice = allMenuDataResponse[0].totalChefPrice;
      const totalOutSidePrice = allMenuDataResponse[0].totalOutSidePrice;

      const categoryMap = new Map();

      allSelectedItems.forEach((category) => {
        const categoryId = category.menuCategoryId;

        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, {
            categoryId: category.menuCategoryId,
            categoryName: category.menuCategoryName,
            categoryNameHindi:
              category.menuCategoryNameHindi || category.menuCategoryName,
            categoryNameGujarati:
              category.menuCategoryNameGujarati || category.menuCategoryName,
            itemsMap: new Map(),
          });
        }

        const existingCategory = categoryMap.get(categoryId);

        category.selectedMenuPreparationItems?.forEach((item) => {
          if (!existingCategory.itemsMap.has(item.menuItemId)) {
            existingCategory.itemsMap.set(item.menuItemId, item);
          }
        });
      });

      const summaryGroups =
        Array.from(categoryMap.values())?.map((category) => ({
          categoryId: category.categoryId,
          categoryName: category.categoryName,
          categoryNameHindi: category.categoryNameHindi,
          categoryNameGujarati: category.categoryNameGujarati,
          totalChefPrice,
          totalOutSidePrice,
          items:
            Array.from(category.itemsMap.values())?.map((summaryItem) => {
              const matchingRows = transformedRows.filter(
                (r) => r.menuItemId === summaryItem.menuItemId,
              );

              const basePrice = Number(summaryItem.totalPrice) || 0;
              let finalPrice = basePrice;

              if (matchingRows.length > 0) {
                finalPrice = matchingRows.reduce((total, matchingRow) => {
                  let rowPrice = basePrice;

                  if (matchingRow.inside) {
                    const transportCost =
                      matchingRow.eventFunctionMenuAllocations
                        ?.filter((a) => a.isInside)
                        .reduce(
                          (sum, a) => sum + (Number(a.shiftTransPrice) || 0),
                          0,
                        ) || 0;
                    rowPrice = basePrice + transportCost;
                  }
                  //  else if (matchingRow.outside) {
                  //   rowPrice =
                  //     matchingRow.eventFunctionMenuAllocations
                  //       ?.filter((a) => a.isOutside)
                  //       .reduce((sum, a) => sum + (a.totalPrice || 0), 0) || 0;
                  // } 

                  else if (matchingRow.outside) {
  rowPrice = basePrice; // was: summing isOutside allocations
}

                  // else if (matchingRow.chefLabour) {
                  //   const chefCost =
                  //     matchingRow.eventFunctionMenuAllocations
                  //       ?.filter((a) => a.isChefLabour)
                  //       .reduce((sum, a) => sum + (a.totalPrice || 0), 0) || 0;
                  //   rowPrice = basePrice + chefCost;
                  // }

                  else if (matchingRow.chefLabour) {
  rowPrice = basePrice; // was: basePrice + chefCost
}

else if (matchingRow.chefLabour) {
  const chefCost =
    matchingRow.eventFunctionMenuAllocations
      ?.filter((a) => a.isChefLabour)
      .reduce((sum, allocation) => sum + (allocation.totalPrice || 0), 0) || 0;
  rowPrice = basePrice + chefCost;
}

                  return total + rowPrice;
                }, 0);
              }

              return {
                ...summaryItem,
                originalTotalPrice: basePrice,
                totalPrice: finalPrice,
                totalChefPrice,
                totalOutSidePrice,
              };
            }) || [],
        })) || [];

      setOrderSummaryGroups(summaryGroups);
    } catch (error) {
      console.error("Error fetching menu allocation:");
      setRows([]);
      setOrderSummaryGroups([]);
      setAllMenuData([]);
    } finally {
      setMenuLoading(false);
      setTableLoading(false);
    }
  };

  const getValidFunctionId = (functionItem) => {
    if (!functionItem) return null;

    if (functionItem.id === -1) {
      return eventData?.eventFunctions?.[0]?.id || null;
    }

    return functionItem.id;
  };

  useEffect(() => {
    if (eventData?.eventFunctions?.length > 0) {
      setActiveFunction(eventData.eventFunctions[0]);
      changedPaxRowsRef.current.clear();
      fetchMenuAllocation(eventData.eventFunctions[0].id);
    }
  }, [eventData?.eventFunctions]);

  // useEffect(() => {
  //   if (isInitialLoadRef.current) return;
  //   if (rows.length === 0) return;
  //   if (isSaving) return;

  //   // Only fire when at least one PAX row was actually changed
  //   const hasPaxChanged = changedPaxRowsRef.current.size > 0;
  //   if (!hasPaxChanged) return;

  //   // Block save only if a *changed* row still has 0 — not all rows
  //   const changedRowsHaveZero = rows.some(
  //     (r) => changedPaxRowsRef.current.has(r.key) && r.personCount === 0,
  //   );
  //   if (changedRowsHaveZero) return;

  //   if (saveTimeoutRef.current) {
  //     clearTimeout(saveTimeoutRef.current);
  //   }

  //   saveTimeoutRef.current = setTimeout(() => {
  //     handleMainSave();
  //   }, 1000);

  //   return () => {
  //     if (saveTimeoutRef.current) {
  //       clearTimeout(saveTimeoutRef.current);
  //     }
  //   };
  // }, [rows, isSaving]);

  const totalPax = useMemo(() => {
    return activeFunction?.pax || 0;
  }, [activeFunction]);

  const checkForChanges = (currentRows, originalRows) => {
    if (currentRows.length !== originalRows.length) return true;

    return currentRows.some((row, index) => {
      const original = originalRows[index];
      if (!original) return true;

      if (
        row.chefLabour !== original.chefLabour ||
        row.outside !== original.outside ||
        row.inside !== original.inside ||
        row.personCount !== original.personCount ||
        row.place !== original.place ||
        row.instructions !== original.instructions
      ) {
        return true;
      }

      const currentAllocations = row.eventFunctionMenuAllocations || [];
      const originalAllocations = original.eventFunctionMenuAllocations || [];

      if (currentAllocations.length !== originalAllocations.length) return true;

      return currentAllocations.some((alloc, i) => {
        const origAlloc = originalAllocations[i];
        if (!origAlloc) return true;

        return (
          alloc.partyId !== origAlloc.partyId ||
          alloc.price !== origAlloc.price ||
          alloc.quantity !== origAlloc.quantity ||
          alloc.counterQuantity !== origAlloc.counterQuantity ||
          alloc.helperQuantity !== origAlloc.helperQuantity ||
          alloc.counterPrice !== origAlloc.counterPrice ||
          alloc.helperPrice !== origAlloc.helperPrice ||
          alloc.shiftTransPrice !== origAlloc.shiftTransPrice
        );
      });
    });
  };

  const updateRow = async (updated, isPersonCountBlur = false) => {
    setRows((prevRows) => {
      const updatedRows = prevRows.map((x) => {
        if (x.key === updated.key) {
          if (x.personCount !== updated.personCount) {
            changedPaxRowsRef.current.add(updated.key);
          }
          return updated;
        }
        return x;
      });

      updateOrderSummaryPrices(updated.menuItemId, updatedRows);
      setHasUnsavedChanges(checkForChanges(updatedRows, initialRows));

      return updatedRows;
    });

    if (isPersonCountBlur && updated.personCount > 0) {
      try {
        const userId = Number(localStorage.getItem("userId")) || 0;

        const payload = {
          eventFunctionId: updated.eventFunctionId,
          eventId: Number(eventId),
          isPaxChange: true,
          isOutSide: updated.outside === true,
          menuItemId: updated.menuItemId,
          personCount: updated.personCount,
          userId,
        };

        const calcRes = await FetchCalc(payload);

        if (calcRes?.data?.success) {
          const totalamt = calcRes?.data?.data ?? null;

          if (totalamt !== null) {
            // Update single-function order summary
            setOrderSummaryGroups((prevGroups) =>
              prevGroups.map((group) => ({
                ...group,
                items: group.items.map((item) => {
                  if (item.menuItemId !== updated.menuItemId) return item;
                  return {
                    ...item,
                    totalPrice: Number(totalamt),
                    originalTotalPrice: Number(totalamt),
                  };
                }),
              })),
            );

            // Update all-functions grouped view
            setAllMenuData((prevAllMenuData) =>
              prevAllMenuData.map((detail) => {
                const belongsToSameFunction =
                  detail.menuAllocation?.[0]?.eventFunctionId ===
                  updated.eventFunctionId;

                if (!belongsToSameFunction) return detail;

                return {
                  ...detail,
                  selectedItemDetails: detail.selectedItemDetails.map(
                    (category) => ({
                      ...category,
                      selectedMenuPreparationItems:
                        category.selectedMenuPreparationItems.map((item) => {
                          if (item.menuItemId !== updated.menuItemId)
                            return item;
                          return {
                            ...item,
                            totalPrice: Number(totalamt),
                          };
                        }),
                    }),
                  ),
                };
              }),
            );
          }
        }
      } catch (err) {
        console.error("FetchCalc error:");
      }
    }
  };

  const handleFunctionChange = async (functionItem) => {
    if (hasUnsavedChanges) {
      const result = await Swal.fire({
        title: "Unsaved Changes",
        text: "You have unsaved changes. Do you want to save before leaving?",
        icon: "warning",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: "Save & Leave",
        denyButtonText: "Leave Without Saving",
        cancelButtonText: "Stay",
        confirmButtonColor: "#3085d6",
        denyButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
      });

      if (result.isConfirmed) {
        await handleMainSave();
        setActiveFunction(functionItem);
        changedPaxRowsRef.current.clear();
        fetchMenuAllocation(functionItem?.id);
      } else if (result.isDenied) {
        setHasUnsavedChanges(false);
        setActiveFunction(functionItem);
        changedPaxRowsRef.current.clear();
        fetchMenuAllocation(functionItem?.id);
      }
    } else {
      setActiveFunction(functionItem);
      changedPaxRowsRef.current.clear();
      fetchMenuAllocation(functionItem?.id);
    }
  };

  const handleAdjustPerson = () => {
    const adjustment = Number(percentage);
    if (isNaN(adjustment) || adjustment === 0) return;

    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) => {
        changedPaxRowsRef.current.add(row.key); // ✅ Mark all rows as having PAX changes
        return {
          ...row,
          personCount: Math.max(0, (row.personCount || 0) + adjustment),
        };
      });

      setHasUnsavedChanges(checkForChanges(updatedRows, initialRows));

      return updatedRows;
    });

    setPercentage("");
  };

  const filtered = useMemo(() => {
    const filteredRows = rows.filter((r) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        getDisplayName(r, "itemName").toLowerCase().includes(term) ||
        getDisplayName(r, "categoryName")?.toLowerCase().includes(term)
      );
    });

    return filteredRows.map((r) => ({
      ...r,

      openChefSidebar: () => {
        setOpen(false);
        setIsChefModal(false);
        setIsInsideModal(false);

        setChefModalData({
          menuItemId: r.menuItemId,
          menuCategoryId: r.menuCategoryId,
          itemName: getDisplayName(r, "itemName"),
          personCount: r.personCount,
          eventFunctionMenuAllocations: r.eventFunctionMenuAllocations || [],
          chefLabour: r.chefLabour,
        });

        setSelectedRow({
          ...r,
          eventId,
          eventFunctionId: getEventFunctionId(activeFunction),
        });
        setTimeout(() => setIsChefModal(true), 0);
      },
      openSidebar: () => {
        setOpen(true);
        setIsChefModal(false);
        setIsInsideModal(false);
        setSelectedRow({
          ...r,
          eventId,
          eventFunctionId: getEventFunctionId(activeFunction),
        });
      },
      openInsideSidebar: () => {
        setOpen(false);
        setIsChefModal(false);
        setIsInsideModal(true);
        setSelectedRow({
          ...r,
          eventId,
          eventFunctionId: getEventFunctionId(activeFunction),
        });
      },
      // onPaxBlur: () => {
      //   if (personSaveTimeoutRef.current) {
      //     clearTimeout(personSaveTimeoutRef.current);
      //   }

      //   personSaveTimeoutRef.current = setTimeout(() => {
      //     handleMainSave();
      //   }, 1000);
      // },
    }));
  }, [
    rows,
    eventId,
    activeFunction,
    searchTerm,
    currentLang,
    placeOptions,
    placeLoading,
  ]);

  const handleInsideSave = (saveData) => {
    setAllocationData((prev) => ({
      ...prev,
      [`${saveData.menuItemId}-${saveData.menuCategoryId}-inside`]: saveData,
    }));

    setRows((prevRows) => {
      const updatedRows = prevRows.map((r) => {
        if (
          r.menuItemId === saveData.menuItemId &&
          r.menuCategoryId === saveData.menuCategoryId
        ) {
          return {
            ...r,
            eventFunctionMenuAllocations: [
              ...(r.eventFunctionMenuAllocations || []).filter(
                (a) => a.isChefLabour === true,
              ),
              ...(r.eventFunctionMenuAllocations || []).filter(
                (a) => a.isOutside === true,
              ),
              ...saveData.allocations.map((alloc) => ({
                ...alloc,
                isInside: true,
                isChefLabour: false,
                isOutside: false,
              })),
            ],
          };
        }
        return r;
      });

      updateOrderSummaryPrices(saveData.menuItemId, updatedRows);
      // setHasUnsavedChanges(checkForChanges(updatedRows, initialRows));
      setHasUnsavedChanges(true);

      return updatedRows;
    });

    setIsInsideModal(false);
  };

  const updateOrderSummaryPrices = (
    menuItemId,
    currentRows = rows,
    specificFunctionId = null,
  ) => {
    setOrderSummaryGroups((prevGroups) =>
      prevGroups.map((group) => ({
        ...group,
        items: group.items.map((item) => {
          if (item.menuItemId !== menuItemId) return item;

          const matchingRows = currentRows.filter(
            (row) =>
              row.menuItemId === menuItemId &&
              (specificFunctionId
                ? row.eventFunctionId === specificFunctionId
                : true),
          );

          if (matchingRows.length === 0) return item;

          const totalPrice = matchingRows.reduce((total, matchingRow) => {
            const basePrice = item.originalTotalPrice || 0;
            if (matchingRow.inside) {
              const transportCost =
                matchingRow.eventFunctionMenuAllocations
                  ?.filter((a) => a.isInside)
                  .reduce(
                    (sum, a) => sum + (Number(a.shiftTransPrice) || 0),
                    0,
                  ) || 0;
              return basePrice + transportCost;
            }

            // if (matchingRow.inside) {
            //   return total + basePrice;
            // }

            // if (matchingRow.outside) {
            //   const additionalCost =
            //     matchingRow.eventFunctionMenuAllocations
            //       ?.filter((a) => a.isOutside)
            //       .reduce(
            //         (sum, allocation) => sum + (allocation.totalPrice || 0),
            //         0,
            //       ) || 0;
            //   return total + additionalCost;
            // }

            if (matchingRow.outside) {
  return total + basePrice; // removed outside allocation sum
}

            // if (matchingRow.chefLabour) {
            //   const chefLabourCost =
            //     matchingRow.eventFunctionMenuAllocations
            //       ?.filter((a) => a.isChefLabour)
            //       .reduce(
            //         (sum, allocation) => sum + (allocation.totalPrice || 0),
            //         0,
            //       ) || 0;
            //   return total + (basePrice + chefLabourCost);
            // }

//             if (matchingRow.chefLabour) {
//   return total + basePrice; // removed chef labour cost addition
// }


if (matchingRow.chefLabour) {
  const chefLabourCost =
    matchingRow.eventFunctionMenuAllocations
      ?.filter((a) => a.isChefLabour)
      .reduce((sum, allocation) => sum + (allocation.totalPrice || 0), 0) || 0;
  return total + (basePrice + chefLabourCost);
}


            return total + basePrice;
          }, 0);

          return { ...item, totalPrice };
        }),
      })),
    );
  };

 // REPLACE the entire handleAgencyAllocationSave:
const handleAgencyAllocationSave = useCallback((savedMenuItems, type) => {
  setRows((prevRows) => {
    const updatedRows = prevRows.map((row) => {
      const matchingItem = savedMenuItems.find(
        (item) =>
          item.menuItemId === row.menuItemId &&
          item.eventFunctionId === row.eventFunctionId &&
          item.menuCategoryId === row.menuCategoryId,
      );

      if (!matchingItem) return row;

      // Build new allocations tagged with the correct type
      const newTypeAllocations = (matchingItem.eventFunctionMenuAllocations || []).map((alloc) => ({
        ...alloc,
        isChefLabour: type === "chef",
        isOutside: type === "outside",
        isInside: type === "inside",
      }));

      // Keep allocations of OTHER types, replace only the saved type
      const keptOtherAllocations = (row.eventFunctionMenuAllocations || []).filter((alloc) => {
        if (type === "chef") return !alloc.isChefLabour;
        if (type === "outside") return !alloc.isOutside;
        if (type === "inside") return !alloc.isInside;
        return true;
      });

      return {
        ...row,
        // Update the type flags on the row itself from the saved item
        chefLabour: type === "chef" ? matchingItem.chefLabour ?? row.chefLabour : row.chefLabour,
        outside: type === "outside" ? matchingItem.outside ?? row.outside : row.outside,
        inside: type === "inside" ? matchingItem.inside ?? row.inside : row.inside,
        eventFunctionMenuAllocations: [...keptOtherAllocations, ...newTypeAllocations],
      };
    });

    const affectedMenuItemIds = [...new Set(savedMenuItems.map((i) => i.menuItemId))];
    affectedMenuItemIds.forEach((menuItemId) => {
      updateOrderSummaryPrices(menuItemId, updatedRows);
    });

    

    return updatedRows;
  });
}, [updateOrderSummaryPrices]);

  // const calculateAllFunctionsPrices = () => {
  //   if (!enrichedGroupedByFunction) return;

  //   setOrderSummaryGroups((prevGroups) =>
  //     prevGroups.map((group) => ({
  //       ...group,
  //       items: group.items.map((item) => {
  //         const matchingRows = rows.filter(
  //           (row) => row.menuItemId === item.menuItemId,
  //         );

  //         if (matchingRows.length === 0) return item;

  //         const totalPrice = matchingRows.reduce((total, matchingRow) => {
  //           const basePrice = item.originalTotalPrice || 0;

  //           if (matchingRow.inside) {
  //             return total + basePrice;
  //           }

  //           if (matchingRow.outside) {
  //             const additionalCost =
  //               matchingRow.eventFunctionMenuAllocations
  //                 ?.filter((a) => a.isOutside)
  //                 .reduce(
  //                   (sum, allocation) => sum + (allocation.totalPrice || 0),
  //                   0,
  //                 ) || 0;
  //             return total + additionalCost;
  //           }

  //           if (matchingRow.chefLabour) {
  //             const chefLabourCost =
  //               matchingRow.eventFunctionMenuAllocations
  //                 ?.filter((a) => a.isChefLabour)
  //                 .reduce(
  //                   (sum, allocation) => sum + (allocation.totalPrice || 0),
  //                   0,
  //                 ) || 0;
  //             return total + (basePrice + chefLabourCost);
  //           }

  //           return total + basePrice;
  //         }, 0);

  //         return { ...item, totalPrice };
  //       }),
  //     })),
  //   );
  // };

  // useEffect(() => {
  //   if (isAllFunctions && rows.length > 0) {
  //     calculateAllFunctionsPrices();
  //   }
  // }, [rows, isAllFunctions]);

  const handleOutsideSave = (saveData) => {
    setAllocationData((prev) => ({
      ...prev,
      [`${saveData.menuItemId}-${saveData.menuCategoryId}-outside`]: saveData,
    }));

    setRows((prevRows) => {
      const updatedRows = prevRows.map((r) => {
        if (
          r.menuItemId === saveData.menuItemId &&
          r.menuCategoryId === saveData.menuCategoryId
        ) {
          return {
            ...r,
            eventFunctionMenuAllocations: [
              ...(r.eventFunctionMenuAllocations || []).filter(
                (a) => a.isChefLabour === true,
              ),
              ...(r.eventFunctionMenuAllocations || []).filter(
                (a) => a.isInside === true,
              ),
              ...saveData.allocations.map((alloc) => ({
                ...alloc,
                isOutside: true,
                isChefLabour: false,
                isInside: false,
              })),
            ],
          };
        }
        return r;
      });

      updateOrderSummaryPrices(saveData.menuItemId, updatedRows);
      // setHasUnsavedChanges(checkForChanges(updatedRows, initialRows));
      setHasUnsavedChanges(true);
      return updatedRows;
    });

    setOpen(false);
  };

  const handleChefLabourSave = (saveData) => {
    setAllocationData((prev) => ({
      ...prev,
      [`${saveData.menuItemId}-${saveData.menuCategoryId}-chef`]: saveData,
    }));

    setRows((prevRows) => {
      const updatedRows = prevRows.map((r) => {
        if (
          r.menuItemId === saveData.menuItemId &&
          r.menuCategoryId === saveData.menuCategoryId
        ) {
          return {
            ...r,
            eventFunctionMenuAllocations: [
              ...(r.eventFunctionMenuAllocations || []).filter(
                (a) => a.isOutside === true,
              ),
              ...(r.eventFunctionMenuAllocations || []).filter(
                (a) => a.isInside === true,
              ),
              ...saveData.allocations.map((alloc) => ({
                ...alloc,
                isChefLabour: true,
                isOutside: false,
                isInside: false,
              })),
            ],
          };
        }
        return r;
      });

      updateOrderSummaryPrices(saveData.menuItemId, updatedRows);
      // setHasUnsavedChanges(checkForChanges(updatedRows, initialRows));
      setHasUnsavedChanges(true);
      return updatedRows;
    });

    setIsChefModal(false);
  };

  const handleCategorySave = async (saveData) => {
    setAllocationData((prev) => {
      const updated = {
        ...prev,
        [`${saveData.menuItemId}-category`]: {
          ...saveData,
          response: {
            isFromNewTable: saveData.isFromNewTable || false,
          },
        },
      };
      return updated;
    });

    setRows((prevRows) => {
      const updatedRows = prevRows.map((r) => {
        if (r.menuItemId === saveData.menuItemId) {
          return {
            ...r,
            menuItemRawMaterials: saveData.rawMaterials || [],
            isFromNewTable: saveData.isFromNewTable || false,
          };
        }
        return r;
      });

      setHasUnsavedChanges(checkForChanges(updatedRows, initialRows));
      return updatedRows;
    });

    setIsCategoryModal(false);

    if (saveData.shouldRefresh) {
      const currentActiveFunctionId = activeFunction?.id;

      if (currentActiveFunctionId) {
        setTableLoading(true);

        try {
          await fetchMenuAllocation(currentActiveFunctionId);
        } catch (error) {
          console.error("Error refreshing data after category save:");
          Swal.fire({
            icon: "error",
            title: "Refresh Error",
            text: "Data was saved but failed to refresh. Please reload the page.",
            confirmButtonColor: "#d33",
          });
        } finally {
          setTableLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    const fetchGodowns = async () => {
      try {
        setPlaceLoading(true);

        const userId = localStorage.getItem("userId");

        if (!userId || userId === "undefined" || userId === "null") {
          console.warn("No valid userId found, skipping godown fetch");
          return;
        }

        const res = await GETallGodown(userId);
        
        if (res?.data?.data?.length) {
          const godownOptions = res?.data?.data.map((g) => ({
            value: String(g.id),
            label: g.nameEnglish,
            id: g.id,
          }));

          setPlaceOptions([
            { value: "0", label: "At venue", id: 0 },
            ...godownOptions,
          ]);
        }
      } catch (err) {
        console.error("Error fetching godowns:");
      } finally {
        setPlaceLoading(false);
      }
    };

    fetchGodowns();
  }, []);
  const animateProgress = (from, to, duration = 600) => {
    return new Promise((resolve) => {
      if (progressAnimRef.current) clearInterval(progressAnimRef.current);

      const steps = to - from;
      if (steps <= 0) {
        setSaveProgress(to);
        saveProgressRef.current = to;
        resolve();
        return;
      }

      const intervalMs = Math.floor(duration / steps);
      let current = from;

      progressAnimRef.current = setInterval(() => {
        current += 1;
        setSaveProgress(current);
        saveProgressRef.current = current;

        if (current >= to) {
          clearInterval(progressAnimRef.current);
          progressAnimRef.current = null;
          resolve();
        }
      }, intervalMs);
    });
  };

const buildMenuExecutionChangeSummary = (prevRows, currentRows) => {
  const prevByKey = new Map(prevRows.map((r) => [r.key, r]));
  const currByKey = new Map(currentRows.map((r) => [r.key, r]));
  const parts = [];

  const typeChanges = [];
  const personChanges = [];
  const placeChanges = [];
  const instructionChanges = [];
  const allocationChanges = [];
  const newItems = [];
  const removedItems = [];

  const getType = (r) =>
    r.chefLabour ? "Chef Labour" : r.outside ? "Outsource" : r.inside ? "Inside" : "None";

  const getPlaceLabel = (placeVal) =>
    placeOptions.find((p) => p.value === String(placeVal))?.label || placeVal || "-";

  // ── Detect newly added items (present now, not in previous save) ──
  currentRows.forEach((row) => {
    if (!prevByKey.has(row.key)) {
      newItems.push(
        `${getDisplayName(row, "itemName")} (Type: ${getType(row)}, Person: ${row.personCount || 0})`,
      );
    }
  });

  // ── Detect removed items (were in previous save, missing now) ──
  prevRows.forEach((row) => {
    if (!currByKey.has(row.key)) {
      removedItems.push(`${getDisplayName(row, "itemName")}`);
    }
  });

  currentRows.forEach((row) => {
    const prev = prevByKey.get(row.key);
    if (!prev) return; // already logged as a new item above

    const itemLabel = `${getDisplayName(row, "itemName")}`;

    const prevType = getType(prev);
    const currType = getType(row);
    if (prevType !== currType) {
      typeChanges.push(`${itemLabel}: ${prevType} → ${currType}`);
    }

    if (Number(prev.personCount || 0) !== Number(row.personCount || 0)) {
      personChanges.push(`${itemLabel}: ${prev.personCount || 0} → ${row.personCount || 0}`);
    }

    if (String(prev.place) !== String(row.place)) {
      placeChanges.push(
        `${itemLabel}: ${getPlaceLabel(prev.place)} → ${getPlaceLabel(row.place)}`,
      );
    }

    if ((prev.instructions || "") !== (row.instructions || "")) {
      const newNote = (row.instructions || "").trim();
      instructionChanges.push(
        newNote ? `${itemLabel}: "${newNote}"` : `${itemLabel}: cleared`,
      );
    }

    // ── Allocation-level diff (party / price / qty / transport / unit / reporting time / service type) ──
    const prevAllocs = prev.eventFunctionMenuAllocations || [];
    const currAllocs = row.eventFunctionMenuAllocations || [];

    if (currType !== "None") {
      const maxLen = Math.max(prevAllocs.length, currAllocs.length);
      for (let i = 0; i < maxLen; i++) {
        const pa = prevAllocs[i];
        const ca = currAllocs[i];

        if (!pa && ca) {
          allocationChanges.push(
            `${itemLabel}: added party ${ca.partyName || ca.partyId || "-"}`,
          );
          continue;
        }
        if (pa && !ca) {
          allocationChanges.push(
            `${itemLabel}: removed party ${pa.partyName || pa.partyId || "-"}`,
          );
          continue;
        }
        if (!pa || !ca) continue;

        const partyLabel = ca.partyName || pa.partyName || "party";

        const fieldsToCheck = [
          ["partyId", "Party"],
          ["serviceType", "Service Type"],
          ["price", "Price"],
          ["quantity", "Qty"],
          ["counterQuantity", "Counter Qty"],
          ["counterPrice", "Counter Price"],
          ["helperQuantity", "Helper Qty"],
          ["helperPrice", "Helper Price"],
          ["shiftTransPrice", "Transport"],
          ["totalPrice", "Total Price"],
          ["unitId", "Unit"],
          ["reportingTime", "Reporting Time"],
          ["number", "Number"],
          ["remarks", "Remarks"],
        ];

        fieldsToCheck.forEach(([field, label]) => {
          const prevRaw = pa[field];
          const currRaw = ca[field];

          const isNumericField = [
            "price",
            "quantity",
            "counterQuantity",
            "counterPrice",
            "helperQuantity",
            "helperPrice",
            "shiftTransPrice",
            "totalPrice",
          ].includes(field);

          const prevVal = isNumericField ? Number(prevRaw || 0) : (prevRaw ?? "-");
          const currVal = isNumericField ? Number(currRaw || 0) : (currRaw ?? "-");

          if (String(prevVal) !== String(currVal)) {
            allocationChanges.push(
              `${itemLabel} (${partyLabel}) ${label}: ${prevVal} → ${currVal}`,
            );
          }
        });
      }
    }
  });

  if (newItems.length) parts.push(`New Items Added: ${newItems.join(", ")}`);
  if (removedItems.length) parts.push(`Items Removed: ${removedItems.join(", ")}`);
  if (typeChanges.length) parts.push(`Type Changed: ${typeChanges.join(", ")}`);
  if (personChanges.length) parts.push(`Person Count Changed: ${personChanges.join(", ")}`);
  if (placeChanges.length) parts.push(`Place Changed: ${placeChanges.join(", ")}`);
  if (allocationChanges.length) parts.push(`Allocation Changed: ${allocationChanges.join(", ")}`);
  if (instructionChanges.length) parts.push(`Instructions Changed: ${instructionChanges.join(", ")}`);

  return parts.length > 0 ? parts.join(" | ") : "No item-level changes detected.";
};



  const handleMainSave = async () => {
    if (saveCooldownRef.current) return;
    saveClickCountRef.current += 1;
    if (isSavingRef.current) return;
      saveCooldownRef.current = true;
  setSaveCooldown(true);
  if (saveCooldownTimerRef.current) clearTimeout(saveCooldownTimerRef.current);
  saveCooldownTimerRef.current = setTimeout(() => {
    saveCooldownRef.current = false;
    setSaveCooldown(false);
  }, 3000);
    isSavingRef.current = true;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setIsSaving(true);
    setSaveProgress(0);
    saveProgressRef.current = 0;

    let currentActiveFunctionId = null;
    let saveSucceeded = false;

    try {
      const Id = localStorage.getItem("userId");
      const validEventId = Number(eventId);
      const validEventFunctionId = getValidFunctionId(activeFunction);
      const hasInvalidPerson = rows.some((r) => r.personCount === 0);

      if (hasInvalidPerson) {
        Swal.fire({
          icon: "error",
          title: "Invalid Person Count",
          text: "Person value cannot be zero. Please fix it before saving.",
        });
        return;
      }

      currentActiveFunctionId = activeFunction?.id;

      if (!validEventId || !validEventFunctionId) {
        Swal.fire({
          title: "Error!",
          text: "Missing event or function information. Please refresh and try again.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
        return;
      }

      const payload = rows.map((r) => {
  // Derive flags directly from row booleans - don't trust alloc-level flags
  const menuAllocationOrders = (r.eventFunctionMenuAllocations || []).map((alloc) => {
    if (r.chefLabour) {
      return {
        counterPrice: alloc.counterPrice ?? 0,
        counterQuantity: alloc.counterQuantity ?? 0,
        helperPrice: alloc.helperPrice ?? 0,
        helperQuantity: alloc.helperQuantity ?? 0,
        id: 0,
        isOutside: false,
        partyId: alloc.partyId ?? 0,
        price: alloc.price ?? 0,
        quantity: alloc.quantity ?? 0,
        serviceType: alloc.serviceType || "",
        totalPrice: alloc.totalPrice ?? 0,
        shiftTransPrice: alloc.shiftTransPrice ?? 0,
         reportingTime: alloc.reportingTime || "",
        unitId: alloc.unitId ?? 0,
      };
    }
    if (r.outside) {
      return {
        counterPrice: alloc.counterPrice ?? 0,
        counterQuantity: alloc.counterQuantity ?? 0,
        helperPrice: alloc.helperPrice ?? 0,
        helperQuantity: alloc.helperQuantity ?? 0,
        id: 0,
        isOutside: true,
        partyId: alloc.partyId ?? 0,
        price: alloc.price ?? 0,
        quantity: alloc.quantity ?? 0,
        serviceType: alloc.serviceType || "",
        shiftTransPrice: alloc.shiftTransPrice ?? 0,
        totalPrice: alloc.totalPrice ?? 0,
         reportingTime: alloc.reportingTime || "", 
        unitId: alloc.unitId ?? 0,
      };
    }
    if (r.inside) {
      return {
        counterPrice: alloc.counterPrice || 0,
        counterQuantity: alloc.counterQuantity || 0,
        helperPrice: alloc.helperPrice || 0,
        helperQuantity: alloc.helperQuantity || 0,
        id: 0,
        isOutside: false,
        number: alloc.number || "",
        remarks: alloc.remarks || "",
        partyId: alloc.partyId || 0,
        price: alloc.price || 0,
        quantity: alloc.quantity || 0,
        serviceType: alloc.serviceType || "",
        totalPrice: alloc.totalPrice || 0,
        shiftTransPrice: alloc.shiftTransPrice || 0,
         reportingTime: alloc.reportingTime || "",
        unitId: alloc.unitId || 0,
      };
    }
    return null;
  }).filter(Boolean);

  const rowHadPaxChange = changedPaxRowsRef.current.has(r.key);
  return {
    chefLabour: r.chefLabour || false,
    eventFunctionId: r.eventFunctionId,
    eventId: validEventId,
    id: r.id || 0,
    inside: r.inside || false,
    instructions: r.instructions || "",
    instructionsHindi: r.instructionsHindi || "",      
  instructionsGujarati: r.instructionsGujarati || "", 
    isPaxChange: rowHadPaxChange,
    menuAllocationOrders,
    menuCategoryId: r.menuCategoryId || 0,
    menuItemId: r.menuItemId || 0,
    menuItemRawMaterials: [],
    outside: r.outside || false,
    personCount: r.personCount || 0,
    place: r.place === "0" || !r.place ? "venue" : r.place,
    userId: Number(Id) || 0,
    itemSortorder: r.itemSortorder ?? null,
    menuSortorder: r.menuSortorder ?? null,
  };
});

      
      animateProgress(0, 70, 800);

      
payload.forEach((item, i) => {
 
  item.menuAllocationOrders.forEach((order, j) => {
  });
});


rows.forEach((r, i) => {
 
  r.eventFunctionMenuAllocations?.forEach((a, j) => {
  });
});

      const res = await MenuAllocationSave(payload); 

      
      if (progressAnimRef.current) {
        clearInterval(progressAnimRef.current);
        progressAnimRef.current = null;
      }
      setSaveProgress(100);
      saveProgressRef.current = 100;
      setIsSubmitting(false);
      isSubmittingRef.current = false;

      if (res?.data?.success === true) {
  const isUpdate = rows.some((r) => (r.id || 0) !== 0);

  // ── Build detailed change summary against last-saved rows ──
  const changeSummary = buildMenuExecutionChangeSummary(initialRows, rows);

  try {
    await AddLogs({
      id: 0,
      eventId: Number(eventId),
      description:
        `${isUpdate ? "Menu Execution updated" : "Menu Execution saved"} for Event No: ${
          eventData?.eventNo || eventId
        } | Party: ${getPartyName(eventData?.party)} | Function: ${getFunctionName(
          activeFunction?.function,
        )} | Saved By: ${userEmail || "Unknown User"} | Total Items: ${rows.length} | Changes: ${changeSummary}`,
      eventType: isUpdate ? "Menu Execution Update" : "Menu Execution Save",
      user: userEmail,
    });
  } catch (logErr) {
    console.error("Log failed (non-blocking):", logErr);
  }

  changedPaxRowsRef.current.clear();

        
        await new Promise((r) => setTimeout(r, 150));

        await Swal.fire({
          title: isUpdate ? "Updated Successfully!" : "Saved Successfully!",
          text: "Menu Allocation details have been saved.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });

        const personSnapshot = {};
        rows.forEach((r) => {
          personSnapshot[r.key] = r.personCount;
        });
        lastSavedPersonRef.current = personSnapshot;
        setHasUnsavedChanges(false);
        setInitialRows(JSON.parse(JSON.stringify(rows)));
        saveSucceeded = true;
      } else {
        Swal.fire({
          title: "Save Failed!",
          text:
            res?.data?.msg ||
            res?.data?.message ||
            "Failed to save menu allocation details.",
          icon: "error",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      Swal.close();
      console.error("❌ Error saving menu allocation:", error);
      Swal.fire({
        title: "Error!",
        text: error.message || "Failed to save menu allocation details.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
    } finally {
      if (progressAnimRef.current) {
        clearInterval(progressAnimRef.current);
        progressAnimRef.current = null;
      }
      isSavingRef.current = false;
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      setIsSaving(false);
      await new Promise((r) => setTimeout(r, 50));
      setSaveProgress(0);
      saveProgressRef.current = 0;

      if (saveSucceeded && currentActiveFunctionId) {
        await fetchMenuAllocation(currentActiveFunctionId);
      }
    }
  };



  const handleSilentSave = useCallback(async () => {
    if (!hasUnsavedChanges) return true;

    try {
      let Id = localStorage.getItem("userId");
      const validEventId = Number(eventId);
      const validEventFunctionId = getValidFunctionId(activeFunction);

      if (!validEventId || !validEventFunctionId) return false;

      const hasInvalidPerson = rows.some((r) => r.personCount === 0);
      if (hasInvalidPerson) return false;

      const payload = rows.map((r) => {
  const menuAllocationOrders = [];

  if (r.outside) {
    menuAllocationOrders.push(
      ...(r.eventFunctionMenuAllocations
        ?.filter((a) => !a.isChefLabour)  // ← was: a.isOutside
        .map((alloc) => ({
          counterPrice: alloc.counterPrice ?? 0,
          counterQuantity: alloc.counterQuantity ?? 0,
          helperPrice: alloc.helperPrice ?? 0,
          helperQuantity: alloc.helperQuantity ?? 0,
          id: 0,
          isOutside: true,              // ← always force true for outside rows
          partyId: alloc.partyId ?? 0,
          price: alloc.price ?? 0,
          quantity: alloc.quantity ?? 0,
          serviceType: alloc.serviceType || "",
          shiftTransPrice: alloc.shiftTransPrice ?? 0,
          totalPrice: alloc.totalPrice ?? 0,
               reportingTime: alloc.reportingTime || "",
          unitId: alloc.unitId ?? 0,
        })) || []),
    );
  }

  if (r.chefLabour) {
    menuAllocationOrders.push(
      ...(r.eventFunctionMenuAllocations
        ?.filter((a) => !a.isOutside && !a.isInside)  // ← was: a.isChefLabour
        .map((alloc) => ({
          counterPrice: alloc.counterPrice ?? 0,
          counterQuantity: alloc.counterQuantity ?? 0,
          helperPrice: alloc.helperPrice ?? 0,
          helperQuantity: alloc.helperQuantity ?? 0,
          id: 0,
          isOutside: false,
          partyId: alloc.partyId ?? 0,
          price: alloc.price ?? 0,
          quantity: alloc.quantity ?? 0,
          serviceType: alloc.serviceType || "",
          totalPrice: alloc.totalPrice ?? 0,
          shiftTransPrice: alloc.shiftTransPrice ?? 0,
               reportingTime: alloc.reportingTime || "",
          unitId: alloc.unitId ?? 0,
        })) || []),
    );
  }

  if (r.inside) {
    menuAllocationOrders.push(
      ...(r.eventFunctionMenuAllocations
        ?.filter((a) => !a.isOutside && !a.isChefLabour)  // ← was: a.isInside
        .map((alloc) => ({
          counterPrice: alloc.counterPrice || 0,
          counterQuantity: alloc.counterQuantity || 0,
          helperPrice: alloc.helperPrice || 0,
          helperQuantity: alloc.helperQuantity || 0,
          id: 0,
          isOutside: false,
          number: alloc.number || "",
          remarks: alloc.remarks || "",
          partyId: alloc.partyId || 0,
          price: alloc.price || 0,
          quantity: alloc.quantity || 0,
          serviceType: alloc.serviceType || "",
          totalPrice: alloc.totalPrice || 0,
          shiftTransPrice: alloc.shiftTransPrice || 0,
               reportingTime: alloc.reportingTime || "",
          unitId: alloc.unitId || 0,
        })) || []),
    );
  }

  return {
    chefLabour: r.chefLabour || false,
    eventFunctionId: r.eventFunctionId,
    eventId: validEventId,
    id: r.id || 0,
    inside: r.inside || false,
    instructions: r.instructions || "",
    instructionsHindi: r.instructionsHindi || "",      
  instructionsGujarati: r.instructionsGujarati || "",
    isPaxChange: changedPaxRowsRef.current.has(r.key),
    menuAllocationOrders,
    menuCategoryId: r.menuCategoryId || 0,
    menuItemId: r.menuItemId || 0,
    menuItemRawMaterials: [],
    outside: r.outside || false,
    personCount: r.personCount || 0,
    place: r.place === "0" || !r.place ? "venue" : r.place,
    userId: Number(Id) || 0,
    itemSortorder: r.itemSortorder ?? null,
    menuSortorder: r.menuSortorder ?? null,
  };
});

      const res = await MenuAllocationSave(payload);
      if (res?.data?.success === true) {
        changedPaxRowsRef.current.clear();
        setHasUnsavedChanges(false);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [hasUnsavedChanges, eventId, activeFunction, rows]);
  const handleNavigateWithWarning = useCallback(
    async (path, state = null) => {
      if (hasUnsavedChanges) {
        // silently save first
        const saved = await handleSilentSave();

        if (!saved) {
          // save failed — ask user what to do
          const result = await Swal.fire({
            title: "Auto-save Failed",
            text: "Could not save automatically. Leave without saving?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Leave Without Saving",
            cancelButtonText: "Stay & Fix",
            confirmButtonColor: "#d33",
            cancelButtonColor: "#6c757d",
          });
          if (!result.isConfirmed) return; // stay on page
        }
      }

      // either saved successfully or user chose to leave anyway
      if (state) {
        navigate(path, { state });
      } else {
        navigate(path);
      }
    },
    [hasUnsavedChanges, handleSilentSave, navigate],
  );
  function openSelectMenureport() {
    setMenuReportEventId(eventId);
    setIsSelectMenuReport(true);
  }

  const openSummaryItemModalchefoutside = async () => {
    const functionId = getEventFunctionId(activeFunction);
    const res = await MenuAllocationTypeSummary(functionId, eventId, "Chef");
    setchefsummary(res.data.data["Menu Allocation Details"] || []);
    setIsModalOpen(true);
  };

  const openSummaryItemModalOustsideAgency = async () => {
    const functionId = getEventFunctionId(activeFunction);
    const res = await MenuAllocationTypeSummary(functionId, eventId, "Outside");
    setoutsidesummary(res.data.data["Menu Allocation Details"] || []);
    setIsOutsideAgencyModalOpen(true);
  };

  const openSummaryItemModalInHouseCook = async () => {
    const functionId = getEventFunctionId(activeFunction);
    const res = await MenuAllocationTypeSummary(functionId, eventId, "Inside");
    setinsidesummary(res?.data?.data["Menu Allocation Details"] || []);
    setIsInHouseCookModalOpen(true);
  };

  const handleSyncRawMaterial = async () => {
  if (syncCooldownRef.current) return;

  try {
    const eventFunctionId = activeFunction?.id || -1;

    if (!eventFunctionId) {
      Swal.fire({
        icon: "error",
        title: "Missing data",
        text: "Event or function information missing",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to sync raw materials for this function?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Sync",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    // Lock now that the user has actually confirmed
    syncCooldownRef.current = true;
    setSyncCooldown(true);
    if (syncCooldownTimerRef.current) clearTimeout(syncCooldownTimerRef.current);
    syncCooldownTimerRef.current = setTimeout(() => {
      syncCooldownRef.current = false;
      setSyncCooldown(false);
    }, 3000);

    Swal.fire({
      title: "Syncing Raw Materials...",
      text: "Please wait",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const res = await SyncRawmaterialMenuallocation(eventFunctionId, eventId);

    Swal.close();

    if (res?.data?.success) {
      Swal.fire({
        icon: "success",
        title: "Synced Successfully",
        text: "Raw materials synced successfully",
        confirmButtonColor: "#3085d6",
      });

      fetchMenuAllocation(eventFunctionId);
    } else {
      throw new Error(res?.data?.message || "Sync failed");
    }
  } catch (error) {
    Swal.close();
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.message || "Failed to sync raw materials",
      confirmButtonColor: "#d33",
    });
  }
};

  const handleDeleteSyncWithPasswordCheck = async () => {
    const { value: password, isConfirmed: passwordConfirmed } = await Swal.fire(
      {
        title: "Enter Password",
        input: "password",
        inputLabel: "This action requires authorization",
        inputPlaceholder: "Enter password",
        inputAttributes: { autocomplete: "new-password" },
        showCancelButton: true,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
      },
    );

    if (!passwordConfirmed) return;

    if (password !== "Just@123_4") {
      Swal.fire({
        icon: "error",
        title: "Incorrect Password",
        text: "You are not authorized to perform this action.",
        confirmButtonColor: "#d33",
      });
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete menu allocation and raw materials Distribution for this event.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Sync",
      cancelButtonText: "Cancel",
    });

    if (!isConfirmed) return;

    try {
      if (!eventId) {
        Swal.fire({
          icon: "error",
          title: "Missing data",
          text: "Event information missing",
        });
        return;
      }

      // ✅ Show loader
      setIsSyncing(true);
      setSaveProgress(0);
      animateProgress(0, 70, 800);

      const res = await Deletesyncmenuallocationandrawmaterial(eventId);

      // ✅ Jump to 100%
      if (progressAnimRef.current) {
        clearInterval(progressAnimRef.current);
        progressAnimRef.current = null;
      }
      setSaveProgress(100);

      await new Promise((r) => setTimeout(r, 300));
      setIsSyncing(false);
      setSaveProgress(0);

      if (res?.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Synced Successfully",
          text: "Menu allocation and raw materials synced successfully",
          confirmButtonColor: "#3085d6",
        });

        const eventFunctionId = getEventFunctionId(activeFunction);
        if (eventFunctionId) await fetchMenuAllocation(eventFunctionId);
      } else {
        throw new Error(res?.data?.message || "Sync failed");
      }
    } catch (error) {
      if (progressAnimRef.current) {
        clearInterval(progressAnimRef.current);
        progressAnimRef.current = null;
      }
      setIsSyncing(false);
      setSaveProgress(0);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.message || "Failed to sync menu allocation and raw materials",
        confirmButtonColor: "#d33",
      });
    }
  };
  const handleEventSelect = async (newEventId) => {
    setSelectedEventId(newEventId);
    setIsAllCustomerToogleOpen(false);
    navigate(`/menu-allocation/${newEventId}`);
  };

  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </Container>
    );
  }
  {
    isSaving && (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
        onClickCapture={(e) => e.stopPropagation()}
        style={{ cursor: "not-allowed" }}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="6"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke="white"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - saveProgress / 100)}`}
                style={{ transition: "stroke-dashoffset 0.4s ease" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
              {saveProgress}%
            </span>
          </div>
          <span className="text-white text-sm font-medium tracking-wide">
            {saveProgress < 30
              ? "Preparing..."
              : saveProgress < 75
                ? "Saving..."
                : saveProgress < 100
                  ? "Finishing..."
                  : "Done!"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      {/* Unsaved Changes Warning Modal */}
      {blocker.state === "blocked" && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center">
                <i className="ki-filled ki-information-2 text-yellow-500 text-lg" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                Unsaved Changes
              </h3>
            </div>
            <p className="text-gray-600 text-sm mb-5">
              You have unsaved changes. Do you want to save before leaving?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-sm btn-light"
                onClick={() => blocker.reset()}
              >
                Stay
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => blocker.proceed()}
              >
                Leave Without Saving
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={async () => {
                  await handleMainSave();
                  blocker.proceed();
                }}
              >
                Save & Leave
              </button>
            </div>
          </div>
        </div>
      )}
      <Container>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-6">
            <h2 className="text-xl text-black font-semibold">
              3. Menu Execution
            </h2>

           <div className="flex gap-2">
  {permMenuPlanning.view && (
    <button
      onClick={() =>
        handleNavigateWithWarning(`/menu-preparation/${eventId}`)
      }
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
    >
      <i className="ki-filled ki-menu text-primary text-sm"></i>
      2. Menu Planning
    </button>
  )}

  {permRawMaterial.view && (
    <button
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
      onClick={() =>
        handleNavigateWithWarning(
          `/raw-material-allocation/${eventId}`,
        )
      }
    >
      <i className="ki-filled ki-gift text-primary text-sm"></i>
      4. Raw Material Distribution
    </button>
  )}

  {permAgencyDistribution.view && (
    <button
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
      onClick={() =>
        handleNavigateWithWarning(
          `/labour-and-other-management/${eventId}`,
        )
      }
    >
      <i className="ki-filled ki-gift text-primary text-sm"></i>
      5. Agency Distribution
    </button>
  )}

  {permPerDishCosting.view && (
    <button
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
      onClick={() =>
        handleNavigateWithWarning(`/dish-costing/${eventId}`)
      }
    >
      <i className="ki-filled ki-grid text-primary text-sm"></i>
      6. Per Dish-costing
    </button>
  )}
</div>
            <button
              onClick={() => navigate("/")} // OR navigate('/calendar')
              className="btn border border-gray-300 text-gray-700 bg-white font-semibold hover:bg-gray-100"
            >
              <Calendar size={16} /> Back to Calendar
            </button>
          </div>
        </div>

        <div className=" card min-w-full bg-white border border-gray-200 shadow-sm rounded-xl mb-5">
          <div className="flex flex-wrap items-center justify-between px-5 py-4 gap-4">
            {/* Event Info Grid */}
            <div className="flex flex-wrap gap-6 flex-1">
              {[
                {
                  icon: "ki-calendar-tick",
                  label: (
                    <FormattedMessage
                      id="EVENT_MENU_ALLOCATION.EVENT_ID"
                      defaultMessage="Event ID"
                    />
                  ),
                  value: (
                    <span
                      className="underline cursor-pointer text-primary font-semibold"
                      onClick={() => setIsAllCustomerToogleOpen(true)}
                    >
                      {eventData?.eventNo || "-"}
                    </span>
                  ),
                },
                {
                  icon: "ki-user",
                  label: (
                    <FormattedMessage
                      id="EVENT_MENU_ALLOCATION.PARTY_NAME"
                      defaultMessage="Party"
                    />
                  ),
                  value: getPartyName(eventData?.party),
                },
                {
                  icon: "ki-geolocation-home",
                  label: (
                    <FormattedMessage
                      id="EVENT_MENU_ALLOCATION.EVENT_NAME"
                      defaultMessage="Event"
                    />
                  ),
                  value: getEventTypeName(eventData?.eventType),
                },
                {
                  icon: "ki-calendar-tick",
                  label: (
                    <FormattedMessage
                      id="EVENT_MENU_ALLOCATION.EVENT_DATE_TIME"
                      defaultMessage="Date & Time"
                    />
                  ),
                  value: eventData?.eventStartDateTime || "-",
                },
                {
                  icon: "ki-calendar-tick",
                  label: (
                    <FormattedMessage
                      id="EVENT_MENU_ALLOCATION.EVENT_VENUE"
                      defaultMessage="Venue"
                    />
                  ),
                  value: getVenueName(eventData?.venue),
                },
              ].map((field, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 min-w-[140px]"
                >
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                    <i
                      className={`ki-filled ${field.icon} text-success text-sm`}
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{field.label}</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {field.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                className="btn btn-sm btn-primary"
                onClick={handleMainSave}
                disabled={
                  isSubmittingRef.current ||
                  isSaving ||
                  saveCooldown ||
                  loading ||
                  tableLoading ||
                  menuLoading ||
                  !activeFunction
                }
              >
               {isSubmittingRef.current || isSaving ? (
    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
  ) : (
    <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
  )}
</button>

              <button
  className="btn btn-sm btn-primary"
  onClick={handleSyncRawMaterial}
  disabled={
    syncCooldown || loading || tableLoading || menuLoading || !activeFunction
  }
>
  <FormattedMessage
    id="EVENT_MENU_ALLOCATION.SYNC_RAW_MATERIAL"
    defaultMessage="Sync Raw Material"
  />
</button>
          

<button
  className="btn btn-sm bg-white border border-red-700 text-red-700 flex items-center gap-1.5"
  onClick={handleDeleteSyncWithPasswordCheck}
  disabled={isSyncing}
>
  <AlertTriangle size={18} className="text-red-700 shrink-0" />
  <FormattedMessage
    id="EVENT_MENU_ALLOCATION.SYNC_RAW_MATERIAL"
    defaultMessage="Sync Raw Material and Menu allocation"
  />
</button>
              {canAccessAccounting && (
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => setAllVendor(true)}
                >
                  <img
                    src={toAbsoluteUrl("/media/icons/payall.png")}
                    className="size-4"
                    alt=""
                  />
                  <FormattedMessage
                    id="COMMON.SAVE"
                    defaultMessage="Pay Vendor"
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-10 gap-4">
          <div className="col-span-7 flex flex-col">
            <div className="bg-[#FAFAFA] p-3 rounded-lg mb-3">
              <TopTabs
                value={activeFunction}
                onChange={handleFunctionChange}
                tableLoading={tableLoading}
                functions={eventData?.eventFunctions || []}
              />
            </div>
            <div
              className="sticky z-10 bg-white pb-2 rounded-lg shadow-sm mb-3"
              style={{ top: "70px" }}
            >
              <div className="flex flex-row gap-4 p-4 border-b border-gray-200">
                <div className="flex flex-row gap-4 items-end">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">
                      <FormattedMessage
                        id="EVENT_MENU_ALLOCATION.DATE_TIME"
                        defaultMessage="Date & Time"
                      />
                    </span>
                    <Input
                      className="p-1 w-[200px] text-black"
                      type="text"
                      readOnly
                      value={
                        activeFunction?.id === -1
                          ? ""
                          : activeFunction?.functionStartDateTime || "-"
                      }
                    />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-sm text-gray-600">
                      <FormattedMessage
                        id="COMMON.PERSON"
                        defaultMessage="Person"
                      />
                    </span>
                    <Input
                      className="p-1 w-[70px] text-black text-center"
                      type="text"
                      readOnly
                      value={totalPax}
                    />
                  </div>
                </div>

                <div className="flex flex-row gap-4 items-end flex-1 justify-between">
                  <div className="flex flex-row gap-4 items-end">
                    <Input
                      placeholder={intl.formatMessage({
                        id: "EVENT_MENU_ALLOCATION.ENTER_PERSON",
                        defaultMessage: "Enter Person",
                      })}
                      value={percentage}
                      onChange={(e) => setPercentage(e.target.value)}
                      className="p-1 pl-2 w-28"
                    />
                    <Tooltip title="It will increase or decrease the number of persons by the entered number.">
                      <button
                        className="btn btn-sm btn-primary"
                        title="Adjust Person"
                        onClick={handleAdjustPerson}
                      >
                        <FormattedMessage
                          id="EVENT_MENU_ALLOCATION.ADJUST_PERSON"
                          defaultMessage="Adjust Person"
                        />
                      </button>
                    </Tooltip>
                  </div>

                  {/* <button
                      onClick={() => {
                        console.log("🔘 Menu for HM BUTTON CLICKED!");
                        console.log("📋 Debug Info:", {
                          moduleId: menuForHMModuleId,
                          mappingId: menuForHMMappingId,
                          eventId: eventId,
                          activeFunction: activeFunction?.id,
                        });

                        if (!menuForHMMappingId) {
                          Swal.fire({
                            icon: "error",
                            title: "Configuration Missing",
                            text: "Menu for HM template is not configured. Please set up the template first.",
                            confirmButtonColor: "#d33",
                          });
                          return;
                        }

                        if (!eventId) {
                          Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: "Event ID is missing. Please refresh the page.",
                            confirmButtonColor: "#d33",
                          });
                          return;
                        }

                        setIsMenuForHMOpen(true);
                      }}
                      className="bg-primary text-white text-sm px-3 py-2 rounded-md transition "
                      title="Menu for HM"
                    >
                      <FormattedMessage
                        id="EVENT_MENU_ALLOCATION.MENU_FOR_HM"
                        defaultMessage="Menu for HM"
                      />
                    </button> */}
                </div>
              </div>

              <div className="flex gap-2 p-4">
                <div className="flex w-fit items-center gap-3">
                  <div className="filItems relative">
                    <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
                    <input
                      className="input pl-8"
                      placeholder={intl.formatMessage({
                        id: "EVENT_MENU_ALLOCATION.SEARCH_ITEM",
                        defaultMessage: "Search item",
                      })}
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex w-full items-center justify-start gap-2 md:justify-end">
                  <button
                    onClick={() => setIsAgencyAllocationModal(true)}
                    className="btn btn-primary text-white text-sm px-3 py-2 rounded-md transition"
                    title="Agency Allocation"
                  >
                    <FormattedMessage
                      id="EVENT_MENU_ALLOCATION.AGENCY"
                      defaultMessage="Agency Allocation"
                    />
                  </button>
                  <button
                    onClick={openSummaryItemModalchefoutside}
                    className="btn btn-primary text-white text-sm px-3 py-2 rounded-md transition"
                    title="Chef Labour"
                  >
                    <FormattedMessage
                      id="COMMON.CHEF_LABOUR"
                      defaultMessage="Chef Labour"
                    />
                  </button>
                  <button
                    onClick={openSummaryItemModalOustsideAgency}
                    className="btn btn-primary text-white text-sm px-3 py-2 rounded-md transition"
                    title="Outsource Agency"
                  >
                    <FormattedMessage
                      id="COMMON.OUTSIDE"
                      defaultMessage="Outsource Agency"
                    />
                  </button>
                  <button
                    onClick={openSummaryItemModalInHouseCook}
                    className="btn btn-primary text-white text-sm px-3 py-2 rounded-md transition"
                    title="Inside Kitchen"
                  >
                    <FormattedMessage
                      id="COMMON.INSIDE"
                      defaultMessage="Inside Kitchen"
                    />
                  </button>
                  <button
                    onClick={openSelectMenureport}
                    className="bg-[#05B723] text-white text-sm px-3 py-2 rounded-md transition"
                    title="Report"
                  >
                    <FormattedMessage
                      id="EVENT_MENU_ALLOCATION.REPORT"
                      defaultMessage="Report"
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <TableHeader
                onChefCheckAll={handleChefCheckAll}
                onOutsourceCheckAll={handleOutsourceCheckAll}
                onInsideCheckAll={handleInsideCheckAll}
                allChefChecked={allChefChecked}
                allOutsourceChecked={allOutsourceChecked}
                allInsideChecked={allInsideChecked}
              />

              {tableLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Spin />
                </div>
              ) : (
                (() => {
                  const currentFunctionRows = filtered.filter(
                    (row) =>
                      row.eventFunctionId ===
                      getEventFunctionId(activeFunction),
                  );

                  return currentFunctionRows.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      No menu items available for this function
                    </div>
                  ) : (
                    currentFunctionRows.map((row, index) => (
                      <TableRow
                        key={`${row.menuItemId}-${row.menuCategoryId}-${index}`}
                        row={row}
                        onChange={updateRow}
                        placeOptions={placeOptions}
                      />
                    ))
                  );
                })()
              )}
            </div>
          </div>

          <div className="col-span-3">
            <div className="sticky bg-white " style={{ top: "70px" }}>
              <div className="max-h-[calc(100vh-100px)] overflow-y-auto no-scrollbar">
                <OrderSummary
  groups={orderSummaryGroups}
  loading={menuLoading}
  onItemClick={handleOrderSummaryItemClick}
  pax={totalPax}
  groupedByFunction={null}
  rows={rows}
  eventId={eventId}
  activeEventFunctionId={getEventFunctionId(activeFunction)}
  onSyncSuccess={(fnId) =>
    fetchMenuAllocation(fnId || getEventFunctionId(activeFunction))
  }
/>
              </div>
            </div>
          </div>
        </div>

        <div className="  ">
          <div className="flex justify-end p-4">
            <button
  className="btn btn-primary px-6 py-2"
  onClick={handleMainSave}
  disabled={
    isSaving ||
    isSubmittingRef.current ||
    saveCooldown ||
    loading ||
    tableLoading ||
    menuLoading ||
    !activeFunction
  }
>
  {isSaving ? (
    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
  ) : (
    <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
  )}
</button>
          </div>
        </div>

        <SidebarModal
          open={open}
          onClose={() => setOpen(false)}
          eventId={selectedRow?.eventId}
          eventFunctionId={selectedRow?.eventFunctionId}
          row={selectedRow}
          functionName={getFunctionName(activeFunction?.function)}
          functionDateTime={activeFunction?.functionStartDateTime}
          onSave={handleOutsideSave}
          personCount={selectedRow?.personCount}
          HasUnsavedChanges={hasUnsavedChanges}
        />
        <SidebarChefModal
          open={isChefModal}
          onClose={() => {
            setIsChefModal(false);
            setChefModalData(null);
          }}
          eventId={selectedRow?.eventId}
          eventFunctionId={selectedRow?.eventFunctionId}
          row={selectedRow}
          chefModalData={chefModalData}
          functionName={getFunctionName(activeFunction?.function)}
          functionDateTime={activeFunction?.functionStartDateTime}
          onSave={handleChefLabourSave}
        />
        <SidebarInsideModal
          open={isInsideModal}
          onClose={() => setIsInsideModal(false)}
          eventId={selectedRow?.eventId}
          eventFunctionId={selectedRow?.eventFunctionId}
          row={selectedRow}
          functionName={getFunctionName(activeFunction?.function)}
          functionDateTime={activeFunction?.functionStartDateTime}
          onSave={handleInsideSave}
          personCount={selectedRow?.personCount}
        />
        <CategorySidebarModal
          open={isCategoryModal}
          onClose={() => setIsCategoryModal(false)}
          selectedRowData={selectedRow}
          eventFunctionId={selectedRow?.eventFunctionId}
          eventId={eventId}
          onSave={handleCategorySave}
          allocationType={selectedRow?.allocationType}
          eventDate={eventData?.eventStartDateTime}
          pax={activeFunction?.pax || 0} 
        />
        <WhatsappSidebarMenu
          open={iswhatsAppSidebar}
          onClose={() => setIsWhatsAppSidebar(false)}
        />

        <MenuReport
          isModalOpen={isMenuForHMOpen}
          setIsModalOpen={setIsMenuForHMOpen}
          eventId={eventId}
          eventFunctionId={getEventFunctionId(activeFunction)}
          moduleId={menuForHMModuleId}
          mappingId={menuForHMMappingId}
          selectedTemplateId={menuForHMTemplateId}
          eventName={eventData?.party?.nameEnglish}
          selectedTemplateName="Menu for HM"
          PartyNumber={eventData?.party?.mobileno}
          isNamePlateTheme={false}
          agencyType={null}
          isAdminModuleReport={true}
          adminTemplateModuleId={menuForHMMappingId}
        />
        <SelectMenureport
          isSelectMenureport={isSelectMenureport}
          setIsSelectMenuReport={setIsSelectMenuReport}
          onConfirm={() => {
            setIsSelectMenuReport(false);
            setIsMenuReport(true);
          }}
          setEventFunctionId={-1}
          mode={mode}
        />
        <SummaryItemModalchefoutside
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          chefsummary={chefsummary}
          eventFunctionId={getEventFunctionId(activeFunction)}
          eventId={eventId}
          type={"chef"}
        />
        <SummaryItemModalOutsideAgency
          open={isOutsideAgencyModalOpen}
          onClose={() => setIsOutsideAgencyModalOpen(false)}
          outsidesummary={outsidesummary}
          eventFunctionId={getEventFunctionId(activeFunction)}
          eventId={eventId}
          type={"outside"}
        />
        <SummaryItemModalInHousecook
          open={isInHouseCookModalOpen}
          onClose={() => setIsInHouseCookModalOpen(false)}
          insidesummary={insidesummary}
          eventFunctionId={getEventFunctionId(activeFunction)}
          eventId={eventId}
          type={"inside"}
        />
        <AgencyAllocationSidebar
          open={isAgencyAllocationModal}
          onClose={() => {
            setIsAgencyAllocationModal(false);

            const functionId = getEventFunctionId(activeFunction);
            if (functionId) {
              fetchMenuAllocation(functionId);
            }
          }}
          eventId={eventId}
          eventFunctionId={getEventFunctionId(activeFunction)}
          onSectionSave={handleAgencyAllocationSave}
        />
        <AllVendor
          isOpen={allVendor}
          onClose={() => setAllVendor(false)}
          eventId={eventId}
        />
        <AllCustomerToogle
          isModalOpen={isAllCustomerToogleOpen}
          setIsModalOpen={setIsAllCustomerToogleOpen}
          onEventSelect={handleEventSelect}
        />
      </Container>
      {isSaving && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
          onClickCapture={(e) => e.stopPropagation()}
          style={{ cursor: "not-allowed" }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - saveProgress / 100)}`}
                  style={{ transition: "stroke-dashoffset 0.4s ease" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
                {saveProgress}%
              </span>
            </div>
            <span className="text-white text-sm font-medium tracking-wide">
              {saveProgress < 30
                ? "Preparing..."
                : saveProgress < 75
                  ? "Saving..."
                  : saveProgress < 100
                    ? "Finishing..."
                    : "Done!"}
            </span>
          </div>
        </div>
      )}
    </Fragment>
  );
};

export default EventMenuAllocationPage;
