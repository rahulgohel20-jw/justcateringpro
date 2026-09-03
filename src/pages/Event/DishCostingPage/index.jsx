import { Fragment, useState, useEffect, useCallback } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import useStyles from "./style";
import DishCostingModal from "./CostingSidebar/DishCostingModal";
import TotalAgencySidebar from "./CostingSidebar/TotalAgencySidebar";
import { FormattedMessage, useIntl } from "react-intl";
import MenuReport from "@/partials/modals/menu-report/MenuReport";
import { useParams, useNavigate } from "react-router-dom";
import {
  GetEventMasterById,
  GetDishCostingByEventFunction,
} from "@/services/apiServices";
import SelectMenureport from "../../../partials/modals/menu-report/SelectMenureport";
import AllCustomerToogle from "@/components/modal/AllCustomerToggle";
import { Calendar } from "lucide-react";

const DishCostingPage = () => {
  const navigate = useNavigate();
  const classes = useStyles();
  const [eventData, setEventData] = useState(null);
  const [selectedFunctionPax, setSelectedFunctionPax] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dishCostingData, setDishCostingData] = useState(null);
  const [selectedFunctionId, setSelectedFunctionId] = useState(null);
  const { eventId } = useParams();
  const [activeTab, setActiveTab] = useState("Function Wise");
  const [viewType, setViewType] = useState("Function Wise");
  const [functionType, setFunctionType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [menuReportEventId, setMenuReportEventId] = useState(null);
  const [isMenuReport, setIsMenuReport] = useState(false);
  const [isSelectMenureport, setIsSelectMenuReport] = useState(false);
  const [allFunctionWiseCosting, setAllFunctionWiseCosting] = useState([]);
  const [agencySidebar, setAgencySidebar] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [isAllCustomerToogleOpen, setIsAllCustomerToogleOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);

  const handleTotalWiseClick = async () => {
    setViewType("Total Wise");

    setSelectedFunctionId(-1);
    setFunctionType("");

    try {
      const res = await GetDishCostingByEventFunction(eventId, -1);

      setDishCostingData(res?.data?.data || {});
      setSelectedFunctionPax(res?.data?.data?.pax || 0);
    } catch (err) {
      console.error("Error fetching total costing:", err);
    }
  };

  const openMenuReport = (eventId) => {
    setMenuReportEventId(eventId);
    setIsMenuReport(true);
  };

  const openSelectMenureport = useCallback(() => {
    setMenuReportEventId(eventId);
    setIsSelectMenuReport(true);
  }, [eventId]);

  const handleRawMaterialClick = () => {
    setIsModalOpen(true);
  };

  const handeAgencySidebarCLick = () => {
    setAgencySidebar(true);
  };
  const intl = useIntl();
  const isTotal = viewType === "Total Wise";

  const totalPax = isTotal
    ? Number(dishCostingData?.pax || 0)
    : selectedFunctionPax;

  const totalRaw = Number(dishCostingData?.rawmaterialcharge || 0);
  const totalAgency =
    Number(dishCostingData?.cheflaborcharge || 0) +
    Number(dishCostingData?.laborcharge || 0) +
    Number(dishCostingData?.outsideagencycharge || 0);
  const totalExtra = isTotal
    ? allFunctionWiseCosting.reduce((sum, f) => sum + Number(f.extra || 0), 0)
    : Number(dishCostingData?.extraexpensecharge || 0);

  const grandTotalComputed = totalRaw + totalAgency + totalExtra;

  const perPersonCost = totalPax
    ? (grandTotalComputed / totalPax).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  const chargesData = [
    {
      label: (
        <FormattedMessage
          id="COMMON.CHEF_LABOUR_CHARGES"
          defaultMessage="Total Raw Material Charges"
        />
      ),
      value: totalRaw.toLocaleString(),
      onClick: handleRawMaterialClick,
    },
    {
      label: (
        <FormattedMessage
          id="COMMON.LABOUR_CHARGES"
          defaultMessage="Total Agency Charges"
        />
      ),
      value: totalAgency.toLocaleString(),
      onClick: handeAgencySidebarCLick,
    },
    // {
    //   label: (
    //     <FormattedMessage
    //       id="COMMON.EXTRA_EXPENSES_CHARGES"
    //       defaultMessage="Total Extra Expense"
    //     />
    //   ),
    //   value: totalExtra.toLocaleString(),
    // },
  ];

  useEffect(() => {
    if (viewType === "Function Wise" && eventData?.eventFunctions?.length > 0) {
      const firstFunction = eventData.eventFunctions[0];
      setSelectedFunctionId(firstFunction.id);
      setFunctionType(firstFunction.function?.nameEnglish || "");
      setSelectedFunctionPax(firstFunction.pax || 0);
    }
  }, [viewType, eventData]);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const res = await GetEventMasterById(eventId);

        if (res?.data?.data?.["Event Details"]?.length > 0) {
          const event = res.data.data["Event Details"][0];
          setEventData(event);

          // Auto-select first function by default
        }
      } catch (error) {
        console.error("❌ Error fetching event details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchEventData();
  }, [eventId]);

  useEffect(() => {
    const fetchAllCosting = async () => {
      if (!eventData?.eventFunctions?.length) return;

      const allData = [];

      for (const func of eventData.eventFunctions) {
        try {
          const res = await GetDishCostingByEventFunction(eventId, func.id);
          const data = res.data.data;

          allData.push({
            eventFunctionId: func.id,
            name: func.function?.nameEnglish,
            pax: func.pax,
            raw: Number(data.rawmaterialcharge || 0),
            agency:
              Number(data.cheflaborcharge || 0) +
              Number(data.laborcharge || 0) +
              Number(data.outsideagencycharge || 0),
            extra: Number(data.extraexpensecharge || 0),
          });
        } catch (err) {
          console.error(`Error fetching costing for ${func.id}`, err);
        }
      }

      setAllFunctionWiseCosting(allData);
    };

    fetchAllCosting();
  }, [eventData, eventId]);

  useEffect(() => {
    if (viewType === "Total Wise") return;

    const fetchDishCosting = async () => {
      if (!eventId || !selectedFunctionId) return;

      try {
        const res = await GetDishCostingByEventFunction(
          eventId,
          selectedFunctionId,
        );

        setDishCostingData(res.data.data);
      } catch (err) {
        console.error("Error fetching dish costing:", err);
      }
    };

    fetchDishCosting();
  }, [eventId, selectedFunctionId, viewType]);

  const renderFunctionDateTime = () => {
    if (viewType === "Total Wise") {
      return <div className="flex flex-col gap-1">All Function</div>;
    }

    return (
      <span className="text-sm font-semibold text-gray-900">
        {dishCostingData?.eventFunction?.functionStartDateTime || "-"}{" "}
      </span>
    );
  };

  const handleEventSelect = async (newEventId) => {
    setSelectedEventId(newEventId);
    setIsAllCustomerToogleOpen(false);
    navigate(`/dish-costing/${newEventId}`);
  };

  return (
    <Fragment>
      <Container>
        {" "}
        {/* Breadcrumbs */}
        <div className="pb-2 mb-3">
          <div className="flex items-center  gap-6">
            <h2 className="text-xl text-black font-semibold">
              <FormattedMessage
                id="COMMON.DISH_COSTING"
                defaultMessage="6. Dish Costing"
              />
            </h2>

           <div className="hidden md:flex gap-2">
  <button
    onClick={() => navigate(`/menu-preparation/${eventId}`)}
    className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
  >
    <i className="ki-filled ki-menu text-primary text-sm"></i>
    <FormattedMessage
      id="MENU_PLANNING.BUTTON"
      defaultMessage="2. Menu Planning"
    />
  </button>

  <button
    onClick={() => navigate(`/menu-allocation/${eventId}`)}
    className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
  >
    <i className="ki-filled ki-menu text-primary text-sm"></i>
    <FormattedMessage
      id="MENU_EXECUTION.BUTTON"
      defaultMessage="3. Menu Execution"
    />
  </button>

  <button
    className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
    onClick={() => navigate(`/raw-material-allocation/${eventId}`)}
  >
    <i className="ki-filled ki-gift text-primary text-sm"></i>
    <FormattedMessage
      id="RAW_MATERIAL_DISTRIBUTION.BUTTON"
      defaultMessage="4. Raw Material Distribution"
    />
  </button>

  <button
    className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
    onClick={() => navigate(`/labour-and-other-management/${eventId}`)}
  >
    <i className="ki-filled ki-gift text-primary text-sm"></i>
    <FormattedMessage
      id="LABOUR_AND_OTHER_MANAGEMENT.BUTTON"
      defaultMessage=" 5. Agency Distribution"
    />
  </button>

  <button
    onClick={() => navigate("/")}
    className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
  >
    <Calendar size={16} className="text-primary" /> Back to Calendar
  </button>
</div>

            {/* MOBILE ONLY - Dropdown */}
            <div className="relative md:hidden">
  <button
    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
    className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
  >
    <i className="ki-filled ki-menu text-primary text-sm"></i>
    <span>Menu</span>
    <i
      className={`ki-filled ${isDropdownOpen ? "ki-up" : "ki-down"} text-gray-500 text-sm`}
    ></i>
  </button>

  {isDropdownOpen && (
    <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden">
      <button
        onClick={() => {
          navigate(`/menu-preparation/${eventId}`);
          setIsDropdownOpen(false);
        }}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-200 text-gray-700"
      >
        <i className="ki-filled ki-menu text-primary"></i>
        <FormattedMessage
          id="MENU_PLANNING.BUTTON"
          defaultMessage="2. Menu Planning"
        />
      </button>

      <button
        onClick={() => {
          navigate(`/menu-allocation/${eventId}`);
          setIsDropdownOpen(false);
        }}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-200 text-gray-700"
      >
        <i className="ki-filled ki-menu text-primary"></i>
        <FormattedMessage
          id="MENU_EXECUTION.BUTTON"
          defaultMessage="3. Menu Execution"
        />
      </button>

      <button
        onClick={() => {
          navigate(`/raw-material-allocation/${eventId}`);
          setIsDropdownOpen(false);
        }}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-200 text-gray-700"
      >
        <i className="ki-filled ki-gift text-primary"></i>
        <FormattedMessage
          id="RAW_MATERIAL_DISTRIBUTION.BUTTON"
          defaultMessage="4. Raw Material Distribution"
        />
      </button>

      <button
        onClick={() => {
          navigate(`/labour-and-other-management/${eventId}`);
          setIsDropdownOpen(false);
        }}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-200 text-gray-700"
      >
        <i className="ki-filled ki-gift text-primary"></i>
        <FormattedMessage
          id="LABOUR_AND_OTHER_MANAGEMENT.BUTTON"
          defaultMessage="5. Labour and Other Management"
        />
      </button>

      <button
        onClick={() => {
          navigate("/");
          setIsDropdownOpen(false);
        }}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
      >
        <Calendar size={16} className="text-primary" /> Back to Calendar
      </button>
    </div>
  )}
</div>
          </div>
        </div>
        <div className="card min-w-full rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg mb-5">
          <div className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center justify-between p-4 gap-3 md:gap-4 lg:gap-6">
            {" "}
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
                  {eventData?.party?.nameEnglish || "-"}
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
                  {eventData?.eventType?.nameEnglish || "-"}
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
                  {eventData?.venue?.nameEnglish || "-"}
                </span>
              </div>
            </div>
            {/* ROW 2 RIGHT — Buttons */}
            <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-gray-200 w-full md:w-auto">
              {" "}
              {/* Report Button */}
              <button
                onClick={openSelectMenureport}
                className="bg-[#05B723] hover:bg-[#049b1e] text-white text-sm font-medium px-5 py-2 rounded-md transition-colors"
                title="Report"
              >
                <i className="ki-filled ki-document "></i> Report
              </button>
              {/* Total Wise Button */}
              <div className="relative group">
                <button
                  className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                    viewType === "Total Wise"
                      ? "bg-[#005BA8] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={handleTotalWiseClick}
                >
                  <FormattedMessage
                    id="TOTAL_WISE.TITLE"
                    defaultMessage="Total Wise"
                  />
                </button>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-gray-900 text-white text-xs rounded-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
                  <FormattedMessage
                    id="FUNCTION_WISE.SUMMARY"
                    defaultMessage="Sum of all persons and all charges"
                  />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
              {/* Function Wise Button */}
              <div className="relative group">
                <button
                  className={`text-sm font-medium px-4 py-2 rounded-md transition-colors ${
                    viewType === "Function Wise"
                      ? "bg-[#005BA8] text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                  onClick={() => {
                    setViewType("Function Wise");

                    if (eventData?.eventFunctions?.length > 0) {
                      const firstFunction = eventData.eventFunctions[0];

                      setSelectedFunctionId(firstFunction.id);
                      setSelectedFunctionPax(firstFunction.pax || 0);
                      setFunctionType(
                        firstFunction.function?.nameEnglish || "",
                      );
                    }
                  }}
                >
                  <FormattedMessage
                    id="FUNCTION_WISE.TITLE"
                    defaultMessage="Function Wise"
                  />
                </button>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap bg-gray-900 text-white text-xs rounded-md px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
                  <FormattedMessage
                    id="FUNCTION_WISE.DESCRIPTION"
                    defaultMessage="Shows charges and persons for the selected function"
                  />
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Tabs */}
        {viewType === "Function Wise" && (
          <div className="w-[full] overflow-x-auto pb-2 my-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="flex gap-2 min-w-min">
              {eventData?.eventFunctions?.length > 0 ? (
                eventData.eventFunctions.map((func, index) => {
                  const funcName =
                    func.function?.nameEnglish || `Function ${index + 1}`;
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        setFunctionType(funcName);
                        setSelectedFunctionPax(func.pax || 0);
                        setSelectedFunctionId(func.id);
                      }}
                      className={`flex-shrink-0 sm:w-auto sm:min-w-[50px] sm:max-w-[200px] btn btn-sm p-5 whitespace-nowrap ${
                        selectedFunctionId === func.id
                          ? "btn-primary"
                          : "btn-light"
                      }`}
                    >
                      {funcName}
                    </button>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm">No functions found</p>
              )}
            </div>
          </div>
        )}
        {/* Date, Time, and Person Info */}
        <div className="card mb-5">
          <div className="card-body px-6 py-4">
            <div className="flex items-center gap-10 flex-wrapflex items-center gap-4 md:gap-6 lg:gap-10 flex-wrap">
              {/* Event Date & Time */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center mt-1">
                  <i className="ki-filled ki-calendar-tick text-success"></i>
                </div>

                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">
                    <FormattedMessage
                      id="FUNCTION.DATE_TIME"
                      defaultMessage="Function Date & Time"
                    />
                  </span>

                  {renderFunctionDateTime()}
                </div>
              </div>

              {/* Person (Pax) – NEXT TO DATE */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                  <i className="ki-filled ki-users text-primary"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">
                    <FormattedMessage
                      id="COMMON.PERSON"
                      defaultMessage="Person"
                    />
                  </span>
                  <span className="text-sm font-bold text-gray-900 bg-gray-200 rounded-md px-4 py-1">
                    {totalPax || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Charges Breakdown - Left Side */}
          <div className="col-span-1 lg:col-span-4">
            <div className="card">
              <div className="card-body">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  <FormattedMessage
                    id="COMMON.CHARGES_BREAKDOWN"
                    defaultMessage="Charges Breakdown"
                  />
                </h2>
                <div className="space-y-3">
                  {chargesData.map((charge, index) => (
                    <div
                      key={index}
                      onClick={charge.onClick}
                      className="flex items-center justify-between py-2 border-b border-gray-100
                                 cursor-pointer hover:bg-gray-50 transition"
                    >
                      <span className="text-sm text-gray-700">
                        {charge.label}
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹ {charge.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Summary Cards */}
          <div className="col-span-1 lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {" "}
              {/* Total Raw Material Charges */}
              <div
                className="bg-white-50 rounded-lg p-5 border border-blue-100 relative cursor-pointer hover:shadow-lg transition-shadow"
                onClick={handleRawMaterialClick}
              >
                <div className="absolute top-4 right-4 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="ki-filled ki-cube-2 text-blue-600 text-xl"></i>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <FormattedMessage
                    id="COMMON.TOTAL_RAW_MATERIAL_CHARGES"
                    defaultMessage="Total Raw Material Charges"
                  />
                </div>
                <div className="text-3xl font-bold text-gray-900 border-blue-600 rounded-md px-3 py-1 inline-block">
                  ₹ {totalRaw.toLocaleString()}
                </div>
              </div>
              {/* Total Agency Charges */}
              <div
                onClick={handeAgencySidebarCLick}
                className="bg-white-50 rounded-lg p-5 border border-green-100 relative"
              >
                <div className="absolute top-4 right-4 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ki-filled ki-people text-green-600 text-xl"></i>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <FormattedMessage
                    id="COMMON.TOTAL_AGENCY_CHARGES"
                    defaultMessage="Total Agency Charges"
                  />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  ₹ {totalAgency.toLocaleString()}
                </div>
              </div>
              {/* Total General Fix Charges
              <div className="bg-white-50 rounded-lg p-5 border border-purple-100 relative">
                <div className="absolute top-4 right-4 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <i className="ki-filled ki-setting-2 text-purple-600 text-xl"></i>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <FormattedMessage
                    id="COMMON.TOTAL_GENERAL_FIX_CHARGES"
                    defaultMessage="Total Extra Expense"
                  />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  ₹ {totalExtra.toLocaleString()}
                </div>
              </div> */}
            </div>

            {/* Bottom Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {" "}
              {/* Grand Total */}
              <div className="bg-blue-100 border-s-[6px] rounded-lg p-5 border-2 border-blue-500">
                <div className="text-base font-bold text-blue-600 mb-2">
                  <FormattedMessage
                    id="COMMON.GRAND_TOTAL"
                    defaultMessage="Grand Total"
                  />
                </div>
                <div className="text-3xl font-bold text-blue-500">
                  ₹ {grandTotalComputed.toLocaleString()}
                </div>
              </div>
              {/* Dish Costing */}
              <div className="bg-green-100 border-s-[6px] rounded-lg p-5 border-2 border-green-500 relative">
                <div className="text-base font-semibold text-green-600 mb-2">
                  <FormattedMessage
                    id="COMMON.DISH_COSTING"
                    defaultMessage="Dish Costing"
                  />
                </div>
                <div className="text-3xl font-bold text-green-500 border-green-600 rounded-md px-3 py-1 inline-block">
                  ₹ {perPersonCost}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DishCostingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          viewType={viewType}
          eventId={eventId}
          selectedFunctionId={selectedFunctionId}
        />
        <TotalAgencySidebar
          isOpen={agencySidebar}
          onClose={() => setAgencySidebar(false)}
          viewType={viewType}
          eventId={eventId}
          selectedFunctionId={selectedFunctionId}
          eventData={eventData}
        />
        <MenuReport
          isModalOpen={isMenuReport}
          setIsModalOpen={setIsMenuReport}
          eventId={menuReportEventId}
        />
        <SelectMenureport
          eventId={eventId}
          mode="costing" // ✅ THIS IS THE KEY
          isSelectMenureport={isSelectMenureport}
          setIsSelectMenuReport={setIsSelectMenuReport}
        />
        <AllCustomerToogle
          isModalOpen={isAllCustomerToogleOpen}
          setIsModalOpen={setIsAllCustomerToogleOpen}
          onEventSelect={handleEventSelect}
        />
      </Container>
    </Fragment>
  );
};

export default DishCostingPage;
