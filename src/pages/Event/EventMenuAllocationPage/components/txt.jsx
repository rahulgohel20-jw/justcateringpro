import { Fragment, useEffect, useMemo, useState, useRef } from "react";
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
} from "@/services/apiServices";
import { useParams, useNavigate, useBlocker } from "react-router-dom";
import { FormattedMessage, useIntl } from "react-intl";
import PlaceSelect from "../../../components/PlaceSelect/PlaceSelect";
import AgencyAllocationSidebar from "../AgencyAllocationSidebar/AgenyAllocationSidebar";
import { message } from "antd";
import { toAbsoluteUrl } from "@/utils/Assets";
import AllVendor from "./components/AllVendor";
import AllCustomerToogle from "@/components/modal/AllCustomerToggle";

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

  // Try language-specific field first
  if (lang !== "en") {
    const languageMap = {
      gu: "Gujarati",
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

  // Fallback to base field (English) or fallback value
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
    gu: fieldType + "Gu",
    hi: fieldType + "Hi",
  };
  return row[langMap[lang]] || row[fieldType] || "";
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

const TopTabs = ({ value, onChange, functions }) => {
  return (
    <div className="flex gap-3 overflow-x-auto">
      {functions.map((item) => {
        const dateTime = item?.functionStartDateTime || "";
        const parts = dateTime.split(" ");

        const date = parts[0]; // 26/12/2025
        const time = parts.length >= 3 ? `${parts[1]} ${parts[2]}` : "";

        return (
          <button
            key={item.id || item.function?.id}
            onClick={() => onChange(item)}
            className={
              "min-w-[96px] rounded-md px-5 py-2 text-sm font-medium transition whitespace-nowrap " +
              (value?.id === item.id
                ? "bg-primary text-white shadow"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50")
            }
          >
            <p className="font-semibold">
              {getFunctionName(item.function)} {/* ✅ Updated */}
            </p>

            <p
              className={
                value?.id === item.id
                  ? "bg-primary text-white shadow"
                  : "bg-white text-gray-700  hover:bg-gray-50"
              }
            >
              {date}
            </p>
            <p
              className={
                value?.id === item.id
                  ? "bg-primary text-white shadow"
                  : "bg-white text-gray-700  hover:bg-gray-50"
              }
            >
              {time}
            </p>
          </button>
        );
      })}
    </div>
  );
};
const OrderSummary = ({
  groups,
  onItemClick,
  loading,
  pax,
  groupedByFunction,
  rows,
}) => {
  // Helper function to get localized names

  const getItemName = (item) => {
    return getLocalizedValue(item, "menuItemName", item.menuItemName);
  };

  const getCategoryName = (category) => {
    return getLocalizedValue(
      category,
      "menuCategoryName",
      category.menuCategoryName,
    );
  };

  // Helper function to calculate item price based on row configuration
  const calculateItemPrice = (item, matchingRow) => {
    if (!matchingRow) return item.totalPrice || 0;

    const basePrice = Number(item.totalPrice) || 0;

    if (matchingRow.inside) {
      return basePrice;
    }

    if (matchingRow.outside) {
      return (
        matchingRow.eventFunctionMenuAllocations
          ?.filter((a) => a.isOutside)
          .reduce((sum, a) => sum + (a.totalPrice || 0), 0) || 0
      );
    }

    if (matchingRow.chefLabour) {
      const chefCost =
        matchingRow.eventFunctionMenuAllocations
          ?.filter((a) => a.isChefLabour)
          .reduce((sum, a) => sum + (a.totalPrice || 0), 0) || 0;
      return basePrice + chefCost;
    }

    return basePrice;
  };

  // Calculate grand total
  const grandTotal = useMemo(() => {
    if (groupedByFunction) {
      // For "All Functions" view, sum across all functions
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
      // For single function view
      return Math.round(
        groups.reduce((total, group) => {
          const groupTotal = group.items.reduce((sum, item) => {
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
          // FUNCTION-WISE VIEW
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
                          {category.selectedMenuPreparationItems.map(
                            (item, iIdx) => {
                              // Find the matching row for price calculation
                              const matchingRow = rows.find(
                                (r) =>
                                  r.menuItemId === item.menuItemId &&
                                  r.eventFunctionId ===
                                    functionGroup.eventFunctionId,
                              );

                              const displayPrice = calculateItemPrice(
                                item,
                                matchingRow,
                              );

                              return (
                                <Fragment
                                  key={`${category.menuCategoryId}-${item.menuItemId}-${iIdx}`}
                                >
                                  <div
                                    className="col-span-9 pl-6 hover:text-primary"
                                    onClick={() =>
                                      onItemClick(
                                        item,
                                        category,
                                        functionGroup.eventFunctionId,
                                      )
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
                            },
                          )}
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
                            ₹{functionDishCosting.toFixed(2)}
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
                            ₹{Math.round(functionTotal).toFixed(2)}
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
                      {g.categoryName}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-12 gap-y-2 text-sm text-gray-700 cursor-pointer">
                    {g.items.map((it, ii) => (
                      <Fragment key={`${g.categoryId}-${it.menuItemId}`}>
                        <div
                          className="col-span-9 pl-6 hover:text-primary"
                          onClick={() => onItemClick(it, g, null)}
                        >
                          {it.menuItemName}{" "}
                          <span className="text-primary font-bold">
                            - {it.typeName}
                          </span>
                        </div>
                        <div className="col-span-3 text-right tabular-nums">
                          ₹{it.totalPrice?.toFixed(2) || "0.00"}
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="card flex flex-row justify-between p-4 bg-[#FAFAFA]">
              <div className="flex flex-row gap-1">
                <span className="font-medium text-gray-900">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.DISH_COSTING"
                    defaultMessage="Dish Costing :"
                  />
                </span>
                <span className="font-semibold text-gray-900">
                  ₹{dishCosting.toFixed(2)}
                </span>
              </div>
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
}) => (
  <div
    className="grid grid-cols-12 items-center gap-3 border-b border-gray-200 px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500 bg-white sticky z-10"
    style={{ top: "230px" }}
  >
    <div className="col-span-2">
      <FormattedMessage id="COMMON.NAME" defaultMessage="Name" />
    </div>
    <div className="col-span-1 text-center">
      <div className="flex flex-col items-center gap-1">
        <FormattedMessage id="COMMON.CHEF_LABOUR" defaultMessage="Chef" />
        <Checkbox
          checked={allChefChecked}
          onChange={(e) => onChefCheckAll(e.target.checked)}
        />
      </div>
    </div>
    <div className="col-span-2 text-center">
      <div className="flex flex-col items-center gap-1">
        <FormattedMessage id="COMMON.OUTSIDE" defaultMessage="Outsource" />
        <Checkbox
          checked={allOutsourceChecked}
          onChange={(e) => onOutsourceCheckAll(e.target.checked)}
        />
      </div>
    </div>
    <div className="col-span-2 text-center">
      <div className="flex flex-col items-center gap-1">
        <FormattedMessage id="COMMON.INSIDE" defaultMessage="Inside kitchen" />
        <Checkbox
          checked={allInsideChecked}
          onChange={(e) => onInsideCheckAll(e.target.checked)}
        />
      </div>
    </div>
    <div className="col-span-1 text-center">
      <FormattedMessage id="COMMON.PERSON" defaultMessage="Person" />
    </div>
    <div className="col-span-2 text-center">
      <FormattedMessage id="COMMON.PLACE" defaultMessage="Place" />
    </div>
    <div className="col-span-2">
      <FormattedMessage
        id="COMMON.INSTRUCTIONS"
        defaultMessage="Instructions"
      />
    </div>
  </div>
);

const TableRow = ({ row, onChange, disabled }) => {
  const [localPersonCount, setLocalPersonCount] = useState(row.personCount); // ✅ Added missing state
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    setLocalPersonCount(row.personCount);
    setHasError(false);
  }, [row.personCount]);
  const handleCheckboxChange = (type, checked) => {
    const updated = {
      ...row,
      chefLabour: type === "chef" ? checked : false,
      outside: type === "outside" ? checked : false,
      inside: type === "inside" ? checked : false,
    };

    onChange(updated);
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

    if (value !== row.personCount) {
      onChange({ ...row, personCount: value });
    }
  };

  return (
    <div className="grid grid-cols-12 items-center gap-3 border-b border-gray-100 px-4 py-4 text-sm">
      <div className="col-span-2 font-medium text-gray-800">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">
            {getDisplayName(row, "categoryName")}
          </span>
          <span>{getDisplayName(row, "itemName")}</span>
        </div>
      </div>

      <div className="col-span-1 flex justify-center items-center gap-2">
        <Checkbox
          checked={row.chefLabour}
          disabled={disabled}
          onChange={(e) => handleCheckboxChange("chef", e.target.checked)}
        />

        {row.chefLabour && !disabled && (
          <button
            type="button"
            onClick={() => row.openChefSidebar && row.openChefSidebar()}
            className="text-blue-500 hover:text-blue-700"
            title="Edit Chef Labour Details"
          >
            <i className="ki-filled ki-notepad-edit text-primary"></i>
          </button>
        )}
      </div>

      <div className="col-span-2 flex justify-center items-center gap-2">
        <Checkbox
          checked={row.outside}
          disabled={disabled}
          onChange={(e) => handleCheckboxChange("outside", e.target.checked)}
        />
        {row.outside && (
          <button
            type="button"
            onClick={() => row.openSidebar && row.openSidebar()}
            className="text-blue-500 hover:text-blue-700"
            title="Edit Outside Details"
          >
            <i className="ki-filled ki-notepad-edit text-primary"></i>
          </button>
        )}
      </div>

      <div className="col-span-2 flex justify-center items-center gap-2">
        <Checkbox
          checked={row.inside}
          disabled={disabled}
          onChange={(e) => handleCheckboxChange("inside", e.target.checked)}
        />
        {row.inside && (
          <button
            type="button"
            onClick={() => row.openInsideSidebar && row.openInsideSidebar()}
            className="text-blue-500 hover:text-blue-700"
            title="Edit Inside Details"
          >
            <i className="ki-filled ki-notepad-edit text-primary"></i>
          </button>
        )}
      </div>

      <div className="col-span-1 flex justify-center">
        <Input
          min={0}
          type="text"
          value={localPersonCount}
          onChange={handlePersonCountChange}
          onBlur={handlePersonCountBlur}
          status={hasError ? "error" : ""}
          className="w-16 p-1 text-center"
        />
      </div>

      <div className="col-span-2">
        <PlaceSelect
          value={row.place}
          onChange={(val) => onChange({ ...row, place: val })}
        />
      </div>

      <div className="col-span-2">
        <Input
          size="small"
          placeholder="Add..."
          value={row.instructions}
          onChange={(e) => onChange({ ...row, instructions: e.target.value })}
          className="w-full p-1"
        />
      </div>
    </div>
  );
};

const FunctionSectionLabel = ({ functionName, functionDateTime, pax }) => {
  return (
    <div
      className="sticky bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-primary px-6 py-4 mb-2 shadow-sm"
      style={{ top: "280px", zIndex: 5 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <i className="ki-filled ki-calendar text-primary text-xl"></i>
            <div>
              <h3 className="text-lg font-bold text-gray-800 uppercase">
                {functionName} {/* This will now show localized name */}
              </h3>
              <p className="text-sm text-gray-600">{functionDateTime}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
          <i className="ki-filled ki-people text-primary"></i>
          <span className="text-sm font-medium text-gray-700">
            <FormattedMessage id="COMMON.PAX" defaultMessage="Pax:" />
          </span>
          <span className="text-lg font-bold text-primary">{pax}</span>
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
    { value: "venue", label: "At venue", id: "venue" },
  ]);
  const [placeLoading, setPlaceLoading] = useState(false);
  const personSaveTimeoutRef = useRef(null);
  const [allVendor, setAllVendor] = useState(false);

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
  const [menuForHMModuleId, setMenuForHMModuleId] = useState(null);
  const [menuForHMMappingId, setMenuForHMMappingId] = useState(null);
  const [menuForHMTemplateId, setMenuForHMTemplateId] = useState(null);

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
          // console.log("📦 All Templates:", templatesRes?.data?.data);
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

            setMenuForHMTemplateId(templateId); // ✅ Store 446
            setMenuForHMMappingId(mappingId); // ✅ Store 49
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    if (eventId) fetchMenuForHMModule();
  }, [eventId]); // ============= LISTEN FOR LANGUAGE CHANGES =============
  useEffect(() => {
    const handleStorageChange = () => {
      const newLang = getCurrentLanguage();
      if (newLang !== currentLang) {
        setCurrentLang(newLang);
      }
    };

    // Listen for storage changes from other tabs
    window.addEventListener("storage", handleStorageChange);

    // Also check on interval (in case same tab changes it)
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
  const handleNavigateWithWarning = async (path, state = null) => {
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
        if (state) {
          navigate(path, { state });
        } else {
          navigate(path);
        }
      } else if (result.isDenied) {
        if (state) {
          navigate(path, { state });
        } else {
          navigate(path);
        }
      }
    } else {
      if (state) {
        navigate(path, { state });
      } else {
        navigate(path);
      }
    }
  };

  const allFunctionTab = useMemo(
    () => ({
      id: -1,
      function: { id: -1, nameEnglish: "All Functions" },
      functionStartDateTime: "",
      allFunctionIds: eventData?.eventFunctions?.map((f) => f.id) || [],
    }),
    [eventData?.eventFunctions],
  );

  const getEventFunctionId = (functionItem) => {
    if (!functionItem) return null;
    return functionItem.id;
  };

  const isAllFunctions = activeFunction?.id === -1;

  const groupedByFunction = useMemo(() => {
    if (activeFunction?.id !== -1 || !allMenuData.length) return null;

    return allMenuData.map((detail) => {
      const firstItem = detail.menuAllocation[0];
      const totalChefPrice = detail.totalChefPrice;
      const totalOutSidePrice = detail.totalOutSidePrice;
      return {
        eventFunctionId: firstItem?.eventFunctionId,
        functionName: firstItem?.eventFunctionName,
        functionDateTime: "",
        pax: 0,
        menuAllocation: detail.menuAllocation,
        selectedItemDetails: detail.selectedItemDetails,
        totalChefPrice: totalChefPrice,
        totalOutSidePrice: totalOutSidePrice,
      };
    });
  }, [allMenuData, activeFunction]);

  const enrichedGroupedByFunction = useMemo(() => {
    if (!groupedByFunction || !eventData?.eventFunctions) return null;

    return groupedByFunction.map((group) => {
      const functionDetail = eventData.eventFunctions.find(
        (f) => f.id === group.eventFunctionId,
      );
      return {
        ...group,
        functionDateTime: functionDetail?.functionStartDateTime || "",
        pax: functionDetail?.pax || 0,
      };
    });
  }, [groupedByFunction, eventData]);

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
        console.error("Error fetching event details:", error);
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

      if (isAllFunctions && clickedFunctionId) {
        eventFunctionId = clickedFunctionId;
      } else {
        eventFunctionId = getEventFunctionId(activeFunction);
      }

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
      console.error("Error opening category sidebar:", error);
    } finally {
      setMenuLoading(false);
    }
  };

  const fetchMenuAllocation = async (eventFunctionId) => {
    try {
      setMenuLoading(true);
      setTableLoading(true);

      const isAllFunctions = eventFunctionId === -1;

      let allMenuDataResponse = [];

      if (isAllFunctions) {
        const menudata = await GetMenuAllocation(eventId, -1);

        if (
          menudata?.data?.success &&
          menudata.data.data["Menu Allocation Details"]?.length > 0
        ) {
          allMenuDataResponse = menudata.data.data["Menu Allocation Details"];
          setAllMenuData(allMenuDataResponse);
        }
      } else {
        const menudata = await GetMenuAllocation(eventId, eventFunctionId);
        if (
          menudata?.data?.success &&
          menudata.data.data["Menu Allocation Details"]?.length > 0
        ) {
          allMenuDataResponse = menudata.data.data["Menu Allocation Details"];
          setAllMenuData(allMenuDataResponse);
        }
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

      // ============= UPDATED: Store all language variants =============
      const transformedRows = mergedMenuAllocation.map((item) => ({
        key: `${item.menuItemId}-${item.menuCategoryId}-${item.eventFunctionId}`,
        id: item.id,
        // Store all language variants
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
        place: item.place || "venue",
        instructions: item.instructions || "",
        eventId: item.eventId,
        eventFunctionId: item.eventFunctionId,
        menuCategoryId: item.menuCategoryId,
        menuItemId: item.menuItemId,
        eventFunctionMenuAllocations:
          item.eventFunctionMenuAllocations?.map((alloc) => {
            const isChefLabour =
              item.chefLabour && !item.outside && !item.inside;
            const isOutside = item.outside;
            const isInside = item.inside;

            let allocationTotal = 0;

            if (isChefLabour) {
              allocationTotal =
                (Number(alloc.counterPrice) || 0) *
                  (Number(alloc.counterQuantity) || 0) +
                (Number(alloc.helperPrice) || 0) *
                  (Number(alloc.helperQuantity) || 0);
            } else {
              allocationTotal =
                (Number(alloc.price) || 0) * (Number(alloc.quantity) || 0);
            }

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
              isOutside,
              isChefLabour,
              isInside,
              number: alloc.number ?? null,
              remarks: alloc.remarks ?? null,
              pax: alloc.pax ?? null,
            };
          }) || [],

        menuItemRawMaterials: [],
      }));

      setRows(transformedRows);

      if (isAllFunctions) {
        setOrderSummaryGroups([]);
      } else {
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
                      rowPrice = basePrice;
                    } else if (matchingRow.outside) {
                      rowPrice =
                        matchingRow.eventFunctionMenuAllocations
                          ?.filter((a) => a.isOutside)
                          .reduce((sum, a) => sum + (a.totalPrice || 0), 0) ||
                        0;
                    } else if (matchingRow.chefLabour) {
                      const chefCost =
                        matchingRow.eventFunctionMenuAllocations
                          ?.filter((a) => a.isChefLabour)
                          .reduce((sum, a) => sum + (a.totalPrice || 0), 0) ||
                        0;

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
      }

      const updatedRowsPromises = transformedRows.map(async (row) => {
        try {
          const res = await SelectedItemNameMenuAllocation(
            row.eventFunctionId,
            row.menuItemId,
          );

          if (res?.data?.success) {
            const apiData = res.data.data;
            const rawMaterials =
              apiData["MenuItem RawMaterial Details"] ||
              apiData.menuItemRawMaterials ||
              [];

            return {
              ...row,
              menuItemRawMaterials: rawMaterials,
            };
          }
        } catch (error) {
          console.error(
            `Error fetching raw materials for item ${row.menuItemId}:`,
            error,
          );
        }
        return row;
      });

      const updatedRows = await Promise.all(updatedRowsPromises);
      setRows(updatedRows);
      setInitialRows(JSON.parse(JSON.stringify(updatedRows)));

      const personSnapshot = {};
      updatedRows.forEach((r) => {
        personSnapshot[r.key] = r.personCount;
      });
      lastSavedPersonRef.current = personSnapshot;

      isInitialLoadRef.current = false;
    } catch (error) {
      console.error("Error fetching menu allocation:", error);
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
      setActiveFunction(allFunctionTab);
      fetchMenuAllocation(-1);
    }
  }, [eventData?.eventFunctions]);

  useEffect(() => {
    if (isInitialLoadRef.current) return;

    if (rows.length === 0) return;

    if (rows.length > 0) {
      const allChef = rows.every((row) => row.chefLabour);
      const allOutside = rows.every((row) => row.outside);
      const allInside = rows.every((row) => row.inside);

      setAllChefChecked(allChef);
      setAllOutsourceChecked(allOutside);
      setAllInsideChecked(allInside);
    }

    if (rows.some((r) => r.personCount === 0)) return;

    const hasPersonChanged = rows.some(
      (r) => lastSavedPersonRef.current[r.key] !== r.personCount,
    );

    if (!hasPersonChanged) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      handleMainSave();
    }, 1000);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [rows]);

  const totalPax = useMemo(() => {
    if (activeFunction?.id === -1) {
      return "";
    }
    return activeFunction?.pax || 0;
  }, [activeFunction, eventData?.eventFunctions]);

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
          alloc.helperPrice !== origAlloc.helperPrice
        );
      });
    });
  };

  const updateRow = (updated) => {
    setRows((prevRows) => {
      const updatedRows = prevRows.map((x) =>
        x.key === updated.key ? updated : x,
      );

      updateOrderSummaryPrices(updated.menuItemId, updatedRows);
      setHasUnsavedChanges(checkForChanges(updatedRows, initialRows));

      return updatedRows;
    });
  };

  const handleFunctionChange = (functionItem) => {
    setActiveFunction(functionItem);
    const functionId = functionItem?.id;
    fetchMenuAllocation(functionId);
  };

  const handleAdjustPerson = () => {
    const adjustment = Number(percentage);
    if (isNaN(adjustment) || adjustment === 0) return;

    setRows((prevRows) => {
      const updatedRows = prevRows.map((row) => ({
        ...row,
        personCount: Math.max(0, (row.personCount || 0) + adjustment),
      }));

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
      onPaxBlur: () => {
        if (personSaveTimeoutRef.current) {
          clearTimeout(personSaveTimeoutRef.current);
        }

        personSaveTimeoutRef.current = setTimeout(() => {
          handleMainSave();
        }, 1000);
      },
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
      setHasUnsavedChanges(checkForChanges(updatedRows, initialRows));

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
              return total + basePrice;
            }

            if (matchingRow.outside) {
              const additionalCost =
                matchingRow.eventFunctionMenuAllocations
                  ?.filter((a) => a.isOutside)
                  .reduce(
                    (sum, allocation) => sum + (allocation.totalPrice || 0),
                    0,
                  ) || 0;
              return total + additionalCost;
            }

            if (matchingRow.chefLabour) {
              const chefLabourCost =
                matchingRow.eventFunctionMenuAllocations
                  ?.filter((a) => a.isChefLabour)
                  .reduce(
                    (sum, allocation) => sum + (allocation.totalPrice || 0),
                    0,
                  ) || 0;
              return total + (basePrice + chefLabourCost);
            }

            return total + basePrice;
          }, 0);

          return { ...item, totalPrice };
        }),
      })),
    );
  };

  const calculateAllFunctionsPrices = () => {
    if (!enrichedGroupedByFunction) return;

    setOrderSummaryGroups((prevGroups) =>
      prevGroups.map((group) => ({
        ...group,
        items: group.items.map((item) => {
          const matchingRows = rows.filter(
            (row) => row.menuItemId === item.menuItemId,
          );

          if (matchingRows.length === 0) return item;

          const totalPrice = matchingRows.reduce((total, matchingRow) => {
            const basePrice = item.originalTotalPrice || 0;

            if (matchingRow.inside) {
              return total + basePrice;
            }

            if (matchingRow.outside) {
              const additionalCost =
                matchingRow.eventFunctionMenuAllocations
                  ?.filter((a) => a.isOutside)
                  .reduce(
                    (sum, allocation) => sum + (allocation.totalPrice || 0),
                    0,
                  ) || 0;
              return total + additionalCost;
            }

            if (matchingRow.chefLabour) {
              const chefLabourCost =
                matchingRow.eventFunctionMenuAllocations
                  ?.filter((a) => a.isChefLabour)
                  .reduce(
                    (sum, allocation) => sum + (allocation.totalPrice || 0),
                    0,
                  ) || 0;
              return total + (basePrice + chefLabourCost);
            }

            return total + basePrice;
          }, 0);

          return { ...item, totalPrice };
        }),
      })),
    );
  };

  useEffect(() => {
    if (isAllFunctions && rows.length > 0) {
      calculateAllFunctionsPrices();
    }
  }, [rows, isAllFunctions]);

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
      setHasUnsavedChanges(checkForChanges(updatedRows, initialRows));

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
      setHasUnsavedChanges(checkForChanges(updatedRows, initialRows));

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

    // ✅ NEW: Refresh all data if shouldRefresh flag is true
    if (saveData.shouldRefresh) {
      const currentActiveFunctionId = activeFunction?.id;

      if (currentActiveFunctionId) {
        // Show loading indicator
        setTableLoading(true);

        try {
          // Refresh the menu allocation data
          await fetchMenuAllocation(currentActiveFunctionId);

          // Optional: Show success message
        } catch (error) {
          console.error("Error refreshing data after category save:", error);
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

        // Get userId from localStorage
        const userId = localStorage.getItem("userId");

        // Validate userId
        if (!userId || userId === "undefined" || userId === "null") {
          console.warn("No valid userId found, skipping godown fetch");
          return;
        }

        // Pass userId to the API call
        const res = await GETallGodown(userId);

        if (res?.data?.data?.length) {
          const godownOptions = res.data.data.map((g) => ({
            value: g.nameEnglish,
            label: g.nameEnglish,
            id: g.id,
          }));

          setPlaceOptions([
            { value: "venue", label: "At venue", id: "venue" },
            ...godownOptions,
          ]);
        }
      } catch (err) {
        console.error("Error fetching godowns:", err);
      } finally {
        setPlaceLoading(false);
      }
    };

    fetchGodowns();
  }, []);
  if (loading) {
    return (
      <Container>
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </Container>
    );
  }

  const handleMainSave = async () => {
    try {
      let Id = localStorage.getItem("userId");

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
      const currentActiveFunctionId = activeFunction?.id;
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
        const menuAllocationOrders = [];

        if (r.outside) {
          const outsideAllocations =
            r.eventFunctionMenuAllocations
              ?.filter((a) => a.isOutside)
              .map((alloc) => ({
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
                totalPrice: alloc.totalPrice ?? 0,
                unitId: alloc.unitId ?? 0,
              })) || [];
          menuAllocationOrders.push(...outsideAllocations);
        }

        if (r.chefLabour) {
          const chefLabourAllocations =
            r.eventFunctionMenuAllocations
              ?.filter((a) => a.isChefLabour)
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
                unitId: alloc.unitId ?? 0,
              })) || [];
          menuAllocationOrders.push(...chefLabourAllocations);
        }

        if (r.inside) {
          const insideAllocations =
            r.eventFunctionMenuAllocations
              ?.filter((a) => a.isInside)
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
                unitId: alloc.unitId || 0,
              })) || [];
          menuAllocationOrders.push(...insideAllocations);
        }

        const rawMaterialsSource =
          allocationData[`${r.menuItemId}-category`]?.rawMaterials?.length > 0
            ? allocationData[`${r.menuItemId}-category`].rawMaterials
            : r.menuItemRawMaterials || [];

        const menuItemRawMaterials = rawMaterialsSource.map((rm) => ({
          dateTime: rm.dateTime || "",
          eventFunctionId: r.eventFunctionId,
          eventId: validEventId,
          id: rm.id ?? 0,
          menuItemId: rm.menuItemId || r.menuItemId || 0,
          partyId: rm.partyId || rm.party_id || rm.party?.id || 0,
          place: rm.place || "",
          rate: rm.rate || 0,
          rawMaterialId: rm.rawMaterialId || 0,
          rawmaterial_rate: rm.rawmaterial_rate || 0,
          rawmaterial_weight: rm.rawmaterial_weight || 0,
          unitId: rm.unitId || rm.unit_id || rm.unit?.id || 0,
          weight: rm.weight || 0,
        }));

        return {
          chefLabour: r.chefLabour || false,
          eventFunctionId: r.eventFunctionId,
          eventId: validEventId,
          id: r.id || 0,
          inside: r.inside || false,
          instructions: r.instructions || "",
          menuAllocationOrders,
          menuCategoryId: r.menuCategoryId || 0,
          menuItemId: r.menuItemId || 0,
          menuItemRawMaterials,
          outside: r.outside || false,
          personCount: r.personCount || 0,
          place: r.place || "venue",
          userId: Number(Id) || 0,
        };
      });

      const res = await MenuAllocationSave(payload);

      if (res?.data?.success === true) {
        Swal.fire({
          title: "Saved Successfully!",
          text: "Menu Allocation details have been saved.",
          icon: "success",
          confirmButtonColor: "#3085d6",
        });

        await fetchMenuAllocation(currentActiveFunctionId);
        const personSnapshot = {};
        rows.forEach((r) => {
          personSnapshot[r.key] = r.personCount;
        });
        lastSavedPersonRef.current = personSnapshot;
        setHasUnsavedChanges(false);
        setInitialRows(JSON.parse(JSON.stringify(rows)));
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
    }
  };
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

  const handleEventSelect = async (newEventId) => {
    setSelectedEventId(newEventId);
    setIsAllCustomerToogleOpen(false);
    navigate(`/menu-allocation/${newEventId}`);
  };

  return (
    <Fragment>
      <Container>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-6">
            <h2 className="text-xl text-black font-semibold">
              3. Menu Execution
            </h2>

            <div className="flex gap-2">
              <button
                onClick={() =>
                  handleNavigateWithWarning(`/menu-preparation/${eventId}`)
                }
                className="btn btn-light text-white bg-primary font-semibold hover:!bg-primary hover:!text-white hover:!border-primary"
              >
                <i
                  className="ki-filled ki-menu "
                  style={{ color: "white" }}
                ></i>{" "}
                2. Menu Planning
              </button>

              <button
                className="btn btn-light text-white bg-primary font-semibold hover:!bg-primary hover:!text-white hover:!border-primary"
                onClick={() =>
                  handleNavigateWithWarning(
                    `/raw-material-allocation/${eventId}`,
                  )
                }
              >
                <i className="ki-filled ki-gift" style={{ color: "white" }}></i>{" "}
                4. Raw Material Distribution
              </button>

              <button
                className="btn btn-light text-white bg-primary font-semibold hover:!bg-primary hover:!text-white hover:!border-primary "
                onClick={() =>
                  handleNavigateWithWarning(
                    `/labour-and-other-management/${eventId}`,
                  )
                }
              >
                <i
                  className="ki-filled ki-gift hover:!text-gray-400"
                  style={{ color: "white" }}
                ></i>{" "}
                5. Agency Distribution
              </button>
              <button
                className="btn btn-light text-white bg-primary font-semibold hover:!bg-primary hover:!text-white hover:!border-primary "
                onClick={() =>
                  handleNavigateWithWarning(`/dish-costing/${eventId}`)
                }
              >
                <i
                  className="ki-filled ki-grid hover:!text-gray-400"
                  style={{ color: "white" }}
                ></i>{" "}
                6. Per Dish-costng
              </button>
            </div>
          </div>
        </div>

        <div className="card min-w-full rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg mb-5">
          <div className="flex flex-wrap items-center justify-between p-4 gap-3">
            {/* ROW 1 */}
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-calendar-tick text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.EVENT_ID"
                    defaultMessage="Event ID:"
                  />
                </span>
                <span
                  className="text-sm font-medium text-gray-900 underline cursor-pointer"
                  onClick={() => setIsAllCustomerToogleOpen(true)}
                >
                  {eventData?.eventNo || "-"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <i className="ki-filled ki-user text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.PARTY_NAME"
                    defaultMessage="Party Name:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {getPartyName(eventData?.party)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <i className="ki-filled ki-geolocation-home text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.EVENT_NAME"
                    defaultMessage="Event Name:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {getEventTypeName(eventData?.eventType)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <i className="ki-filled ki-calendar-tick text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.EVENT_DATE_TIME"
                    defaultMessage="Event Date & Time:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {eventData?.eventStartDateTime || ""}
                </span>
              </div>
            </div>

            {/* FORCE NEW ROW */}
            <div className="w-full h-0"></div>

            {/* ROW 2 LEFT — Event Venue */}
            <div className="flex items-center gap-3">
              <i className="ki-filled ki-calendar-tick text-success text-lg"></i>
              <div className="flex flex-col">
                <span className="text-sm">
                  <FormattedMessage
                    id="EVENT_MENU_ALLOCATION.EVENT_VENUE"
                    defaultMessage="Event Venue:"
                  />
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {getVenueName(eventData?.venue)}
                </span>
              </div>
            </div>

            {/* ROW 2 RIGHT — Buttons */}
            <div className="ml-auto flex items-center gap-2">
              {permission.edit && (
                <button
                  className="btn btn-sm btn-primary"
                  title="Save"
                  onClick={handleMainSave}
                  disabled={!hasUnsavedChanges}
                >
                  <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
                </button>
              )}
              <button
                className="btn btn-sm btn-primary"
                title="Sync Raw Material"
                onClick={handleSyncRawMaterial}
              >
                <FormattedMessage
                  id="EVENT_MENU_ALLOCATION.SYNC_RAW_MATERIAL"
                  defaultMessage="Sync Raw Material"
                />
              </button>

              <button
                disabled={true}
                className="btn btn-sm btn-success"
                title="Pay Vendor"
                onClick={() => setAllVendor(true)}
              >
                <img
                  src={toAbsoluteUrl("/media/icons/payall.png")}
                  className="size-6"
                  alt=""
                />
                <FormattedMessage
                  id="COMMON.SAVE"
                  defaultMessage="Pay Vendor"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="w-[70%] flex flex-col">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-[#FAFAFA] p-3 rounded-lg overflow-x-auto mb-3">
              <TopTabs
                value={activeFunction}
                onChange={handleFunctionChange}
                functions={[
                  allFunctionTab,
                  ...(eventData?.eventFunctions || []),
                ]}
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
                  <div className="flex items-end gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600">
                        <FormattedMessage
                          id="EVENT_MENU_ALLOCATION.ENTER_PERSON"
                          defaultMessage="Enter Person"
                        />
                      </span>
                      <Input
                        placeholder={intl.formatMessage({
                          id: "EVENT_MENU_ALLOCATION.ENTER_PERSON",
                          defaultMessage: "Enter Person",
                        })}
                        value={percentage}
                        onChange={(e) => setPercentage(e.target.value)}
                        className="p-1 pl-2 w-28"
                      />
                    </div>
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
                  <button
                    onClick={() => {
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
                  </button>
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
              ) : isAllFunctions && enrichedGroupedByFunction ? (
                enrichedGroupedByFunction.map((functionGroup, idx) => {
                  const functionRows = filtered.filter(
                    (row) =>
                      row.eventFunctionId === functionGroup.eventFunctionId,
                  );

                  return (
                    <div
                      key={`function-${functionGroup.eventFunctionId}-${idx}`}
                    >
                      <FunctionSectionLabel
                        functionName={functionGroup.functionName}
                        functionDateTime={functionGroup.functionDateTime}
                        pax={functionGroup.pax}
                      />
                      {functionRows.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          No menu items available for this function
                        </div>
                      ) : (
                        functionRows.map((row, rowIdx) => (
                          <TableRow
                            key={`${row.menuItemId}-${row.menuCategoryId}-${row.eventFunctionId}-${rowIdx}`}
                            row={row}
                            onChange={updateRow}
                          />
                        ))
                      )}
                    </div>
                  );
                })
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
                      />
                    ))
                  );
                })()
              )}
            </div>
          </div>

          <div className="w-[30%]">
            <div className="sticky bg-white " style={{ top: "70px" }}>
              <div className="max-h-[calc(100vh-100px)] overflow-y-auto">
                <OrderSummary
                  groups={orderSummaryGroups}
                  loading={menuLoading}
                  onItemClick={handleOrderSummaryItemClick}
                  pax={totalPax}
                  groupedByFunction={enrichedGroupedByFunction}
                  rows={rows}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="  ">
          <div className="flex justify-end p-4">
            <button
              className="btn btn-primary px-6 py-2"
              title="Save"
              onClick={handleMainSave}
              disabled={!hasUnsavedChanges}
            >
              <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
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
        />
        <AllVendor isOpen={allVendor} onClose={() => setAllVendor(false)} />
        <AllCustomerToogle
          isModalOpen={isAllCustomerToogleOpen}
          setIsModalOpen={setIsAllCustomerToogleOpen}
          onEventSelect={handleEventSelect}
        />
      </Container>
    </Fragment>
  );
};

export default EventMenuAllocationPage;
