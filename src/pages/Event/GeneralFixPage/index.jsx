
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container } from "@/components/container";
import {
  GetrawMaterialCatIdbytypeid,
  GetAllSupllierVendors,
  GetUnitData,
  GetEventMasterById,
  GetGeneralFix,
  AddUpdateGeneralFix,
} from "@/services/apiServices";
import { usePermission } from "@/hooks/usePermission";
import { Calendar } from "lucide-react";
import { toAbsoluteUrl } from "@/utils/Assets";
import dayjs from "dayjs";
import SidebarRawMaterial from "../RawMaterialAllocationPage/sidebarrawmaterialmodal/SidebarRawMaterial";
import Swal from "sweetalert2";

const GeneralFixPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // ---------------------------------------------------------
  // Event
  // ---------------------------------------------------------
  const [eventData, setEventData] = useState(null);

  // ---------------------------------------------------------
  // Categories
  // ---------------------------------------------------------
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  // ---------------------------------------------------------
  // Functions
  // ---------------------------------------------------------
  const [functions, setFunctions] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState("all");
  const [selectedFunctionIds, setSelectedFunctionIds] = useState([]);

  // ---------------------------------------------------------
  // Items
  // ---------------------------------------------------------
  const [items, setItems] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ---------------------------------------------------------
  // Master data
  // ---------------------------------------------------------
  const [agencies, setAgencies] = useState([]);
  const [unit, setUnit] = useState([]);

  // ---------------------------------------------------------
  // Sidebar
  // ---------------------------------------------------------
  const [selectedRow, setSelectedRow] = useState(null);
  const [isRawSidebar, setIsRawSidebar] = useState(false);

  // ---------------------------------------------------------
  // Changes
  // ---------------------------------------------------------
  const [hasChanges, setHasChanges] = useState(false);

  // ---------------------------------------------------------
  // Permissions
  // ---------------------------------------------------------
  const permMenuPlanning = usePermission("Menu Planning");
  const permMenuExecution = usePermission("Menu Execution");
  const permRawMaterial = usePermission("Raw Material Distribution");
  const permAgencyDistribution = usePermission("Labour Agency Order");
  const permPerDishCosting = usePermission("Per Dish Costing");

  // =========================================================
  // Fetch editor master data
  // =========================================================
  useEffect(() => {
    const fetchEditorData = async () => {
      const userId = localStorage.getItem("userId");

      try {
        const [agencyResponse, unitResponse] = await Promise.all([
          GetAllSupllierVendors(userId),
          GetUnitData(userId),
        ]);

        setAgencies(
          agencyResponse?.data?.data?.["Party Details"] || []
        );

        setUnit(
          unitResponse?.data?.data?.["Unit Details"] || []
        );
      } catch (error) {
        console.error(
          "Error fetching General Fix editor data:",
          error
        );
      }
    };

    fetchEditorData();
  }, []);

  // =========================================================
  // Fetch Event Details
  // =========================================================
  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;

      try {
        const response = await GetEventMasterById(eventId);

        const event =
          response?.data?.data?.["Event Details"]?.[0] || null;

        setEventData(event);
      } catch (error) {
        console.error("Error fetching event data:", error);
        setEventData(null);
      }
    };

    fetchEventData();
  }, [eventId]);

  // =========================================================
  // Build Function Dropdown
  //
  // eventFunction.id is used here.
  //
  // Example:
  // Dinner          -> 14158
  // Evening Snacks  -> 14295
  // =========================================================
  useEffect(() => {
    if (!eventData?.eventFunctions) {
      setFunctions([]);
      setSelectedFunction("all");
      setSelectedFunctionIds([]);
      return;
    }

    const eventFunctionOptions = eventData.eventFunctions
      .filter((item) => item?.id)
      .map((item) => ({
        value: Number(item.id),

        label:
          item.function?.nameEnglish ||
          item.functionName ||
          `Function ${item.id}`,

        startDateTime: item.functionStartDateTime,
        endDateTime: item.functionEndDateTime,
      }));

    setFunctions(eventFunctionOptions);

    // Default selection = All Function
    setSelectedFunction("all");

    // All eventFunction IDs
    setSelectedFunctionIds(
      eventFunctionOptions.map((item) => Number(item.value))
    );
  }, [eventData]);

  // =========================================================
  // Fetch General Fix Items
  // =========================================================
  const fetchGeneralFixItems = async (
    categoryId,
    functionIds = selectedFunctionIds
  ) => {
    if (!eventId || !categoryId) return;

    const eventFunctionIds = (functionIds || [])
      .map(Number)
      .filter(Boolean);

    if (eventFunctionIds.length === 0) {
      setItems([]);
      return;
    }

    setTableLoading(true);

    try {
      console.log("GetGeneralFix Parameters:", {
        rawCatIds: categoryId,
        eventFunctionIds,
        eventId: Number(eventId),
      });

      const response = await GetGeneralFix(
        Number(categoryId),
        eventFunctionIds,
        Number(eventId)
      );

      console.log("GetGeneralFix Response:", response);

      /*
       * Adjust this key if your actual API response
       * uses a different response property.
       */
      const responseData = response?.data?.data;

      const generalFixItems =
        responseData?.["Event_RAW_MATERIAL_ALLOCATION"] ||
        responseData?.["Event General Fix"] ||
        responseData?.["General Fix"] ||
        (Array.isArray(responseData) ? responseData : []) ||
        [];

      const mappedItems = Array.isArray(generalFixItems)
        ? generalFixItems.map((item, index) => {
            const finalQty = Number(
              item.finalQty ?? item.qty ?? 0
            );

            const total = Number(
              item.totalprice ??
                item.totalPrice ??
                item.total ??
                0
            );

            const basePrice =
              finalQty > 0 ? total / finalQty : 0;

            return {
              ...item,

              displayId: index + 1,

              material:
                item.rawMaterialNameEng ||
                item.rawMaterialNameEnglish ||
                item.extraItemName ||
                "N/A",

              finalQty,

              finalQtyInput: String(finalQty),

              total,

              basePrice,

              unitId:
                item.units?.id ||
                item.unitHierarchyDto?.unitId ||
                item.unitId ||
                1,

              unit:
                item.units?.nameEnglish ||
                item.unitHierarchyDto?.nameEnglish ||
                item.unit ||
                "KILO",
            };
          })
        : [];

      setItems(mappedItems);

      // Data loaded from API, therefore no unsaved changes
      setHasChanges(false);
    } catch (error) {
      console.error(
        "Error fetching General Fix items:",
        error
      );

      setItems([]);
    } finally {
      setTableLoading(false);
    }
  };

  // =========================================================
  // Fetch Raw Material Categories
  // =========================================================
  useEffect(() => {
    const fetchGeneralFixCategories = async () => {
      if (!eventId) return;

      try {
        const userId = localStorage.getItem("userId");

        const response = await GetrawMaterialCatIdbytypeid(
          1,
          userId
        );

        const categories =
          response?.data?.data?.[
            "Raw Material Category Details"
          ] || [];

        const dynamicTabs = categories.map((category) => ({
          value: category.id?.toString(),
          label: category.nameEnglish || "N/A",
          categoryId: category.id,
        }));

        setTabs(dynamicTabs);

        if (dynamicTabs.length > 0) {
          setActiveTab(dynamicTabs[0].value);
        } else {
          setActiveTab(null);
        }
      } catch (error) {
        console.error(
          "Error fetching general fix categories:",
          error
        );

        setTabs([]);
        setActiveTab(null);
        setItems([]);
      }
    };

    fetchGeneralFixCategories();
  }, [eventId]);

  // =========================================================
  // Load General Fix whenever:
  //
  // 1. Category changes
  // 2. Function changes
  // =========================================================
  useEffect(() => {
    if (
      !activeTab ||
      !eventId ||
      selectedFunctionIds.length === 0
    ) {
      return;
    }

    const activeCategory = tabs.find(
      (tab) => tab.value === activeTab
    );

    if (!activeCategory?.categoryId) return;

    fetchGeneralFixItems(
      activeCategory.categoryId,
      selectedFunctionIds
    );
  }, [
    activeTab,
    selectedFunctionIds,
    eventId,
  ]);

  // =========================================================
  // Function Dropdown Change
  // =========================================================
  const handleFunctionChange = async (event) => {
    const value = event.target.value;

    setSelectedFunction(value);

    let functionIds = [];

    if (value === "all") {
      // All Function
      functionIds = functions.map((item) =>
        Number(item.value)
      );
    } else {
      // Single Function
      functionIds = [Number(value)];
    }

    setSelectedFunctionIds(functionIds);
  };

  // =========================================================
  // Category Tab Change
  // =========================================================
  const handleTabSwitch = async (tab) => {
    setActiveTab(tab.value);

    if (tab.categoryId && selectedFunctionIds.length > 0) {
      await fetchGeneralFixItems(
        tab.categoryId,
        selectedFunctionIds
      );
    }
  };

  // =========================================================
  // Search
  // =========================================================
  const filteredItems = items.filter((item) => {
    const query = searchTerm
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "");

    if (!query) return true;

    return [
      item.rawMaterialNameEng,
      item.rawMaterialNameEnglish,
      item.material,
      item.extraItemName,
      item.supplierName,
      item.place,
      item.remarksEnglish,
    ].some((value) =>
      String(value || "")
        .toLowerCase()
        .replace(/\s+/g, "")
        .includes(query)
    );
  });

  // =========================================================
  // Row ID
  // =========================================================
  const getRowId = (item) =>
    item.rawMaterialId || item.id;

  // =========================================================
  // Final Quantity Change
  // =========================================================
  const handleFinalQtyChange = (itemId, value) => {
    setItems((previous) =>
      previous.map((item) => {
        if (getRowId(item) !== itemId) {
          return item;
        }

        const finalQty =
          value === ""
            ? 0
            : Number(value) || 0;

        return {
          ...item,

          finalQtyInput: value,

          finalQty,

          total:
            finalQty * (item.basePrice || 0),
        };
      })
    );

    setHasChanges(true);
  };

  // =========================================================
  // Unit Options
  // =========================================================
  const getUnitOptions = (item) => {
    const options = [];

    const addOption = (value, label) => {
      if (
        value &&
        !options.some(
          (option) => option.value === value
        )
      ) {
        options.push({
          value,
          label,
        });
      }
    };

    addOption(
      item.units?.id,
      item.units?.nameEnglish
    );

    addOption(
      item.unitHierarchyDto?.unitId,
      item.unitHierarchyDto?.nameEnglish
    );

    (
      item.unitHierarchyDto?.children || []
    ).forEach((child) => {
      addOption(
        child.unitId,
        child.nameEnglish
      );
    });

    addOption(
      item.unitId,
      item.unit
    );

    return options;
  };

  // =========================================================
  // Unit Change
  // =========================================================
  const handleUnitChange = (
    itemId,
    value
  ) => {
    setItems((previous) =>
      previous.map((item) => {
        if (
          getRowId(item) !== itemId
        ) {
          return item;
        }

        const unitValue = Number(value);

        const selectedUnit =
          getUnitOptions(item).find(
            (option) =>
              Number(option.value) ===
              unitValue
          );

        return {
          ...item,

          unitId: unitValue,

          unit:
            selectedUnit?.label ||
            item.unit,
        };
      })
    );

    setHasChanges(true);
  };

  // =========================================================
  // Edit Row
  // =========================================================
  const handleEditRow = (row) => {
    setSelectedRow(row);
    setIsRawSidebar(true);
  };

  // =========================================================
  // Save From Sidebar
  // =========================================================
  const handleSaveFromSidebar = (
    updatedRow
  ) => {
    setItems((previous) =>
      previous.map((item) =>
        getRowId(item) ===
        getRowId(updatedRow)
          ? {
              ...item,
              ...updatedRow,
            }
          : item
      )
    );

    setHasChanges(true);
    setIsRawSidebar(false);
  };

  // =========================================================
  // Delete Row
  // =========================================================
  const handleDeleteRow = (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this row?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText:
        "Yes, delete it!",
    }).then((result) => {
      if (!result.isConfirmed) return;

      setItems((previous) =>
        previous.filter(
          (item) =>
            getRowId(item) !==
            getRowId(row)
        )
      );

      setHasChanges(true);

      Swal.fire(
        "Deleted!",
        "Row has been deleted.",
        "success"
      );
    });
  };

  // =========================================================
  // SAVE GENERAL FIX
  // =========================================================
  const handleSave = async () => {
    if (
      !eventId ||
      !activeTab ||
      !hasChanges ||
      selectedFunctionIds.length === 0
    ) {
      return;
    }

    setTableLoading(true);

    try {
      /*
       * If one function is selected:
       *
       * eventFunctionId = selected function ID
       *
       * If All Function is selected:
       *
       * eventFunctionId = 0
       *
       * eventFunctionIds = all selected IDs
       */
      const payload = {
        eventFunctionId:
          selectedFunctionIds.length === 1
            ? Number(selectedFunctionIds[0])
            : 0,

        eventFunctionIds:
          selectedFunctionIds.map(Number),

        eventId: Number(eventId),

        rawMaterialCategoryId:
          Number(activeTab),

        eventRawMaterial: items.map(
          (item) => ({
            eventRawMatFunctions:
              item.eventRawMaterialFunctions ||
              [],

            extraItem:
              item.isExtraItem
                ? item.material
                : "",

            finalQty:
              Number(item.finalQty) || 0,

            place:
              item.place || "",

            qty:
              Number(item.qty) || 0,

            rawMaterialId:
              item.isExtraItem
                ? null
                : item.rawMaterialId ||
                  null,

            supplierId:
              item.supplierId || 0,

            totalprice:
              Number(item.total) || 0,

            unitId:
              item.unitId || 0,

            date:
              item.date &&
              dayjs(item.date).isValid()
                ? dayjs(item.date).format(
                    "YYYY-MM-DD HH:mm:ss.0"
                  )
                : "",

            remarksEnglish:
              item.remarksEnglish || "",

            remarksHindi:
              item.remarksHindi || "",

            remarksGujarati:
              item.remarksGujarati || "",
          })
        ),
      };

      console.log(
        "AddUpdateGeneralFix Payload:",
        payload
      );

      const response =
        await AddUpdateGeneralFix(
          payload
        );

      console.log(
        "AddUpdateGeneralFix Response:",
        response
      );

      if (
        response?.data?.success === true ||
        response?.status === 200 ||
        response?.status === 201
      ) {
        setHasChanges(false);

        const activeCategory =
          tabs.find(
            (tab) =>
              tab.value === activeTab
          );

        if (
          activeCategory?.categoryId
        ) {
          await fetchGeneralFixItems(
            activeCategory.categoryId,
            selectedFunctionIds
          );
        }

        Swal.fire({
          icon: "success",
          title: "Saved",
          text:
            "General Fix data saved successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        throw new Error(
          "Save failed"
        );
      }
    } catch (error) {
      console.error(
        "Error saving General Fix data:",
        error
      );

      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text:
          "Something went wrong while saving.",
      });
    } finally {
      setTableLoading(false);
    }
  };

  // =========================================================
  // Total
  // =========================================================
  const totalPrice =
    filteredItems.reduce(
      (sum, item) =>
        sum +
        (Number(item.total) || 0),
      0
    );

  // =========================================================
  // Function Venues
  // =========================================================
  const functionVenues = (
    eventData?.eventFunctions || []
  )
    .map((eventFunction) => {
      const venue =
        eventFunction.function_venue ||
        eventFunction.functionVenue ||
        eventFunction.venue;

      const value =
        typeof venue === "string"
          ? venue
          : venue?.nameEnglish ||
            venue?.name ||
            venue?.venueName ||
            venue?.venueNameEnglish;

      return value
        ? {
            value,
            label: value,
            id: venue?.id || value,
          }
        : null;
    })
    .filter(
      (option, index, options) =>
        option &&
        options.findIndex(
          (item) =>
            item.value ===
            option.value
        ) === index
    );

  const eventVenue =
    functionVenues[0]?.label ||
    eventData?.venue?.nameEnglish ||
    "-";

  // =========================================================
  // Step Button
  // =========================================================
  const stepButtonClass =
    "flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors";

  // =========================================================
  // UI
  // =========================================================
  return (
    <Container>
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}
      <div className="gap-2 mb-3">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-6">
            <h2 className="text-xl text-black font-semibold">
              General Fix
            </h2>

            <div className="flex flex-wrap gap-2">
              {permMenuPlanning.view && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/menu-preparation/${eventId}`
                    )
                  }
                  className={
                    stepButtonClass
                  }
                >
                  <i className="ki-filled ki-menu text-primary text-md"></i>
                  2. Menu Planning
                </button>
              )}

              {permMenuExecution.view && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/menu-allocation/${eventId}`
                    )
                  }
                  className={
                    stepButtonClass
                  }
                >
                  <i className="ki-filled ki-gift text-primary text-md"></i>
                  3. Menu Execution
                </button>
              )}

              {permRawMaterial.view && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/raw-material-allocation/${eventId}`
                    )
                  }
                  className={
                    stepButtonClass
                  }
                >
                  <i className="ki-filled ki-box text-primary text-md"></i>
                  4. Raw Material Distribution
                </button>
              )}

              {permAgencyDistribution.view && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/labour-and-other-management/${eventId}`
                    )
                  }
                  className={
                    stepButtonClass
                  }
                >
                  <i className="ki-filled ki-gift text-primary text-md"></i>
                  5. Agency Distribution
                </button>
              )}

              {permPerDishCosting.view && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/dish-costing/${eventId}`
                    )
                  }
                  className={
                    stepButtonClass
                  }
                >
                  <i className="ki-filled ki-grid text-primary text-md"></i>
                  6. Per Dish-costing
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                navigate("/")
              }
              className="btn border border-gray-300 text-gray-700 bg-white font-semibold hover:bg-gray-100"
            >
              <Calendar size={16} />
              Back to Calendar
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          EVENT DETAILS
      ====================================================== */}
      <div className="card min-w-full rtl:[background-position:right_center] [background-position:right_center] bg-no-repeat bg-[length:500px] user-access-bg mb-5">
        <div className="flex flex-wrap items-center justify-between p-4 gap-3">
          <div className="flex items-center gap-3">
            <i className="ki-filled ki-calendar-tick text-success text-lg"></i>

            <div className="flex flex-col">
              <span className="text-sm">
                Event ID:
              </span>

              <span className="text-sm font-medium text-gray-900 underline">
                {eventData?.eventNo || "-"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <i className="ki-filled ki-user text-success text-lg"></i>

            <div className="flex flex-col">
              <span className="text-sm">
                Party Name:
              </span>

              <span className="text-sm font-medium text-gray-900">
                {eventData?.party
                  ?.nameEnglish || "-"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <i className="ki-filled ki-geolocation-home text-success text-lg"></i>

            <div className="flex flex-col">
              <span className="text-sm">
                Event Name:
              </span>

              <span className="text-sm font-medium text-gray-900">
                {eventData?.eventType
                  ?.nameEnglish || "-"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <i className="ki-filled ki-calendar-tick text-success text-lg"></i>

            <div className="flex flex-col">
              <span className="text-sm">
                Event Date &amp; Time:
              </span>

              <span className="text-sm font-medium text-gray-900">
                {eventData?.eventStartDateTime ||
                  "-"}
              </span>
            </div>
          </div>

          <div className="w-full h-0"></div>

          <div className="flex items-center gap-3">
            <i className="ki-filled ki-calendar-tick text-success text-lg"></i>

            <div className="flex flex-col">
              <span className="text-sm">
                Event Venue:
              </span>

              <span className="text-sm font-medium text-gray-900">
                {eventVenue}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          FUNCTION DROPDOWN
      ====================================================== */}
      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm font-semibold text-gray-700">
          Function:
        </label>

        <select
          value={selectedFunction}
          onChange={
            handleFunctionChange
          }
          disabled={
            functions.length === 0
          }
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[240px] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="all">
            All Function
          </option>

          {functions.map(
            (func) => (
              <option
                key={func.value}
                value={func.value}
              >
                {func.label}
              </option>
            )
          )}
        </select>

        {selectedFunction ===
          "all" &&
          functions.length > 0 && (
            <span className="text-xs text-gray-500">
              {functions.length} functions selected
            </span>
          )}
      </div>

      {/* =====================================================
          CATEGORY TABS
      ====================================================== */}
      <div className="flex flex-wrap mb-3 border-gray-200 gap-1 rounded-lg">
        {tabs.length === 0 ? (
          <p className="text-gray-500 text-sm px-3">
            No categories found
          </p>
        ) : (
          tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() =>
                handleTabSwitch(
                  tab
                )
              }
              className={`px-4 py-2 text-sm font-medium border border-gray-200 ${
                activeTab ===
                tab.value
                  ? "bg-primary text-white"
                  : "bg-gray-50 text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))
        )}
      </div>

      {/* =====================================================
          SEARCH
      ====================================================== */}
      <div className="flex justify-between mb-4">
        <div className="flex w-fit items-center gap-3">
          <div className="filItems relative">
            <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>

            <input
              className="input pl-8"
              placeholder="Search Items"
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          TABLE
      ====================================================== */}
      <div className="bg-white rounded-xl shadow border border-gray-200">
        <div className="max-h-[380px] overflow-y-auto">
          <table className="min-w-full table-fixed text-sm text-gray-700">
            <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold sticky top-0 z-1">
              <tr>
                <th className="w-16 px-4 py-3 text-left">
                  ID
                </th>

                <th className="w-48 px-4 py-3 text-left">
                  Raw Material
                </th>

                <th className="w-24 px-4 py-3 text-left">
                  Qty
                </th>

                <th className="w-28 px-4 py-3 text-left">
                  Final Qty
                </th>

                <th className="w-32 px-4 py-3 text-left">
                  Unit
                </th>

                <th className="w-40 px-4 py-3 text-left">
                  Agency
                </th>

                <th className="w-36 px-4 py-3 text-left">
                  Place
                </th>

                <th className="w-52 px-4 py-3 text-left">
                  Date
                </th>

                <th className="w-44 px-4 py-3 text-left">
                  Remarks
                </th>

                <th className="w-28 px-4 py-3 text-left">
                  Total
                </th>

                <th className="w-24 px-4 py-3 text-center">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center py-6 text-gray-500"
                  >
                    No materials found
                  </td>
                </tr>
              ) : (
                filteredItems.map(
                  (
                    item,
                    index
                  ) => {
                    const rowId =
                      getRowId(
                        item
                      );

                    const unitOptions =
                      getUnitOptions(
                        item
                      );

                    return (
                      <tr
                        key={
                          rowId ||
                          index
                        }
                        className="border-b border-gray-200"
                      >
                        <td className="px-4 py-3">
                          {
                            item.displayId
                          }
                        </td>

                        <td
                          className="px-4 py-2 text-xs text-gray-700 truncate"
                          title={
                            item.material
                          }
                        >
                          {
                            item.material
                          }
                        </td>

                        <td className="px-4 py-3">
                          {item.qty ??
                            0}
                        </td>

                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="any"
                            value={
                              item.finalQtyInput
                            }
                            onChange={(
                              event
                            ) =>
                              handleFinalQtyChange(
                                rowId,
                                event
                                  .target
                                  .value
                              )
                            }
                            className="w-[80px] border border-gray-300 rounded px-2 py-1"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={
                              item.unitId
                            }
                            onChange={(
                              event
                            ) =>
                              handleUnitChange(
                                rowId,
                                event
                                  .target
                                  .value
                              )
                            }
                            className="w-[100px] border border-gray-300 rounded px-2 py-1 text-xs"
                          >
                            {unitOptions.map(
                              (
                                option
                              ) => (
                                <option
                                  key={
                                    option.value
                                  }
                                  value={
                                    option.value
                                  }
                                >
                                  {
                                    option.label
                                  }
                                </option>
                              )
                            )}
                          </select>
                        </td>

                        <td className="px-4 py-3">
                          {item.supplierName ||
                            "-"}
                        </td>

                        <td className="px-4 py-3">
                          {item.place ||
                            "NA"}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.date
                            ? dayjs(
                                item.date
                              ).format(
                                "DD/MM/YYYY hh:mm A"
                              )
                            : "-"}
                        </td>

                        <td
                          className="px-4 py-3 text-xs text-gray-600 truncate"
                          title={
                            item.remarksEnglish ||
                            ""
                          }
                        >
                          <div className="flex items-center gap-2">
                            <span>
                              {item.remarksEnglish ||
                                "-"}
                            </span>

                            <button
                              type="button"
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600"
                            >
                              <i className="ki-filled ki-notepad-edit text-xs"></i>
                            </button>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {Number(
                            item.total ||
                              0
                          ).toFixed(
                            2
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <i
                              className="ki-filled ki-notepad-edit text-primary cursor-pointer hover:text-blue-700"
                              onClick={() =>
                                handleEditRow(
                                  item
                                )
                              }
                              title="Edit"
                            ></i>

                            <i
                              className="ki-filled ki-trash text-red-500 cursor-pointer hover:text-red-700"
                              onClick={() =>
                                handleDeleteRow(
                                  item
                                )
                              }
                              title="Delete"
                            ></i>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
        </div>

        {/* ===================================================
            FOOTER
        ==================================================== */}
        <div className="flex justify-between items-center px-4 py-4 border-t bg-gray-50">
          <div className="text-sm font-medium">
            Total Price:

            <span className="font-semibold text-blue-700 ml-1">
              {totalPrice.toFixed(
                2
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={
              handleSave
            }
            disabled={
              !hasChanges ||
              tableLoading ||
              selectedFunctionIds.length ===
                0
            }
            className={`text-sm px-5 py-2 rounded-md ${
              hasChanges &&
              !tableLoading &&
              selectedFunctionIds.length >
                0
                ? "bg-primary text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>
      </div>

      {/* =====================================================
          SIDEBAR
      ====================================================== */}
      <SidebarRawMaterial
        open={
          isRawSidebar
        }
        onClose={() =>
          setIsRawSidebar(
            false
          )
        }
        selectedRow={
          selectedRow
        }
        onSave={
          handleSaveFromSidebar
        }
        sidebarunit={
          unit
        }
        functionVenues={
          functionVenues
        }
      />

      {/* =====================================================
          LOADING
      ====================================================== */}
      {tableLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <img
            src={toAbsoluteUrl(
              "/media/icons/loading.gif"
            )}
            alt="Loading..."
            className="w-18 rounded-xl shadow-2xl"
          />
        </div>
      )}
    </Container>
  );
};

export default GeneralFixPage;
