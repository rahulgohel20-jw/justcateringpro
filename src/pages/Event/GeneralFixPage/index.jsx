import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useBlocker } from "react-router-dom";
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
import Swal from "sweetalert2";
import SidebarGeneralFix from "./SidebarGeneralFix";
import SelectMenureport from "@/partials/modals/menu-report/SelectMenureport";

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
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");


  // ---------------------------------------------------------
  // Changes
  // ---------------------------------------------------------
  const [hasChanges, setHasChanges] = useState(false);

  // ---------------------------------------------------------
  // Saving state (mirrors RawMaterialAllocation)
  // ---------------------------------------------------------
  const [isSaving, setIsSaving] = useState(false);

  // ---------------------------------------------------------
  // Guards
  // ---------------------------------------------------------
  const isInitialLoadRef = useRef(true);

  // ---------------------------------------------------------
  // Permissions
  // ---------------------------------------------------------
  const permMenuPlanning = usePermission("Menu Planning");
  const permMenuExecution = usePermission("Menu Execution");
  const permRawMaterial = usePermission("Raw Material Distribution");
  const permAgencyDistribution = usePermission("Labour Agency Order");
  const permPerDishCosting = usePermission("Per Dish Costing");

 const [isSelectMenureportOpen, setIsSelectMenureportOpen] = useState(false);




  // ---------------------------------------------------------
  // Navigation blocker for unsaved changes (same pattern as RawMaterialAllocation)
  // ---------------------------------------------------------
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      hasChanges && currentLocation.pathname !== nextLocation.pathname,
  );

  const handleOpenGeneralFixReport = async () => {
  if (!eventId) return;

  setReportLoading(true);

  try {
    // 1. Find the "Raw Material Theme" module
    const moduleRes = await GettemplatebyuserId();
    const modules = (moduleRes?.data?.data || []).filter(
      (m) => m.isActive && !m.isDelete
    );
    const rawMaterialModule = modules.find(
      (m) => m.nameEnglish === "Raw Material Theme"
    );

    if (!rawMaterialModule) {
      Swal.fire({
        icon: "warning",
        title: "Not Found",
        text: "Raw Material Theme module not found.",
      });
      return;
    }

    // 2. Fetch templates for that module and find "Type 1"
    const userId = localStorage.getItem("userId");
    const templateRes = await GetAllCustomThemeByUserIdAndModuleId(
      userId,
      rawMaterialModule.id
    );

    const templates = templateRes?.data?.data || [];
    const type1Template = templates.find(
      (t) => t.templateMappingResponseDto?.nameEnglish === "Type 3"
    );

    if (!type1Template) {
      Swal.fire({
        icon: "warning",
        title: "Not Found",
        text: "Type 1 report is not configured for Raw Material Theme.",
      });
      return;
    }

    // 3. Open MenuReport directly with that template
    setReportModuleId(rawMaterialModule.id);
    setReportTemplateId(type1Template.id);
    setReportMappingId(
      type1Template.templateMappingResponseDto?.id || type1Template.id
    );
    setReportTemplateName(type1Template.templateMaster?.name || "Report");
    setIsMenuReportOpen(true);
  } catch (error) {
    console.error("Error opening General Fix report:", error);
    Swal.fire({
      icon: "error",
      title: "Failed",
      text: "Could not load the report. Please try again.",
    });
  } finally {
    setReportLoading(false);
  }
};


  const confirmUnsavedChanges = async () => {
  const result = await Swal.fire({
    title: "Unsaved Changes",
    text: "You have unsaved changes. Do you want to save them before continuing?",
    icon: "warning",
    showCancelButton: true,
    showDenyButton: true,
    confirmButtonText: "Save & Continue",
    denyButtonText: "Discard Changes",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#3085d6",
    denyButtonColor: "#d33",
  });

  if (result.isConfirmed) {
    const saveResult = await autoSave();
    return saveResult.success ? "saved" : "cancel"; // don't proceed if save failed
  }
  if (result.isDenied) {
    setHasChanges(false);
    return "discarded";
  }
  return "cancel";
};


  const getLocalizedRawName = (item) => {
  switch (lang) {
    case "hi":
      return item.rawNameHindi || item.rawNameEnglish || "N/A";
    case "gu":
      return item.rawNameGujarati || item.rawNameEnglish || "N/A";
    default:
      return item.rawNameEnglish || "N/A";
  }
}

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

        setAgencies(agencyResponse?.data?.data?.["Party Details"] || []);
        setUnit(unitResponse?.data?.data?.["Unit Details"] || []);
      } catch (error) {
        console.error("Error fetching General Fix editor data:", error);
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
        const event = response?.data?.data?.["Event Details"]?.[0] || null;
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
    const response = await GetGeneralFix(
      Number(categoryId),
      eventFunctionIds,
      Number(eventId)
    );

    console.log("GetGeneralFix Response:", response);

    const responseData = response?.data?.data || response?.data || {};
    const rawRows = Array.isArray(responseData.eventGeneralFixRaws)
      ? responseData.eventGeneralFixRaws
      : [];

    // "All Function" means every functionId is selected, in which case
    // we can just use the top-level aggregate weight/price on each row.
    const isAllFunctionsSelected =
      functions.length > 0 && eventFunctionIds.length === functions.length;

    const mappedItems = rawRows
      .map((item, index) => {
        const unitObj = item.unit || {};
        const unitHierarchy = item.unitHierarchyDto || null;

        let finalQty;
        let total;
        let pax = 0;

        if (isAllFunctionsSelected) {
          // Use the row's own aggregate values (already sum of all functions)
          finalQty = Number(item.weight) || 0;
          total = Number(item.price) || 0;
          pax = (item.eventFunctionGeneralFixRaws || []).reduce(
            (sum, fn) => sum + (Number(fn.pax) || 0),
            0
          );
        } else {
          // Sum only the function breakdowns matching the selected functions
          const matchingFns = (item.eventFunctionGeneralFixRaws || []).filter(
            (fn) => eventFunctionIds.includes(Number(fn.eventFunctionId))
          );

          finalQty = matchingFns.reduce(
            (sum, fn) => sum + (Number(fn.weight) || 0),
            0
          );
          total = matchingFns.reduce(
            (sum, fn) => sum + (Number(fn.price) || 0),
            0
          );
          pax = matchingFns.reduce(
            (sum, fn) => sum + (Number(fn.pax) || 0),
            0
          );
        }

        const basePrice = finalQty > 0 ? total / finalQty : 0;

        return {
          id: item.id,
          displayId: index + 1,
          rawMaterialId: item.rawId,
          rawCatId: item.rawCatId,
          material: getLocalizedRawName(item),
          rawNameEnglish: item.rawNameEnglish,
          rawNameHindi: item.rawNameHindi,
          rawNameGujarati: item.rawNameGujarati,
          qty: Number(item.weight) || 0, // original aggregate, read-only display
          finalQty,
          finalQtyInput: String(finalQty),
          total,
          basePrice,
          pax,
          weightPer100pax: item.weightPer100pax ?? null,
          supplierRate: item.supplierRate ?? null,
          unit: unitObj.nameEnglish || unitHierarchy?.nameEnglish || "KILO",
          unitId: unitObj.id || unitHierarchy?.unitId || 1,
          units: unitObj,
          unitHierarchyDto: unitHierarchy,
          eventFunctionGeneralFixRaws: item.eventFunctionGeneralFixRaws || [],
        };
      })
      // If a specific function is selected and this raw material has no
      // matching breakdown at all, drop it rather than show an empty row.
      .filter(
        (item) =>
          isAllFunctionsSelected ||
          item.eventFunctionGeneralFixRaws.some((fn) =>
            eventFunctionIds.includes(Number(fn.eventFunctionId))
          )
      );

    setItems(mappedItems);
    setHasChanges(false);
  } catch (error) {
    console.error("Error fetching General Fix items:", error);
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
  // Initial load ONLY.
  // =========================================================
  useEffect(() => {
    if (!activeTab || !eventId || selectedFunctionIds.length === 0) {
      return;
    }
    if (!isInitialLoadRef.current) return;

    const activeCategory = tabs.find((tab) => tab.value === activeTab);
    if (!activeCategory?.categoryId) return;

    fetchGeneralFixItems(activeCategory.categoryId, selectedFunctionIds);
    isInitialLoadRef.current = false;
  }, [activeTab, selectedFunctionIds, eventId, tabs]);

  // =========================================================
  // Auto-save helper (mirrors RawMaterialAllocation's autoSave)
  //
  // Builds the payload in the { eventId, generalFixRaws: [...] } shape
  // required by the API, including the nested per-function breakdown
  // (eventFunctionGeneralFixRaws) for every raw material row.
  // =========================================================
  const autoSave = async () => {
    if (!eventId || !activeTab || selectedFunctionIds.length === 0) {
      return { success: true }; // nothing meaningful to save, don't block switching
    }

    const isAllFunctionsSelected =
      functions.length > 0 && selectedFunctionIds.length === functions.length;
    const selectedIdSet = new Set(selectedFunctionIds.map(Number));

    try {
      const payload = {
        eventId: Number(eventId),

        generalFixRaws: items.map((item) => {
          const sourceFnRaws = item.eventFunctionGeneralFixRaws || [];

          // Which per-function rows does this edit apply to?
          const matchingEntries = sourceFnRaws.filter(
            (fn) =>
              isAllFunctionsSelected ||
              selectedIdSet.has(Number(fn.eventFunctionId))
          );

          // Original combined weight of just the matching rows, used to
          // split the new finalQty back across them proportionally.
          const origMatchWeight = matchingEntries.reduce(
            (sum, fn) => sum + (Number(fn.weight) || 0),
            0
          );
          const matchCount = matchingEntries.length || 1;

          const updatedFnRaws = sourceFnRaws.map((fn) => ({
    eventFunctionId: Number(fn.eventFunctionId) || 0,
    id: fn.id || 0,
    price: Number(fn.price) || 0,
    rawCatId: fn.rawCatId ?? item.rawCatId ?? 0,
    rawId: fn.rawId ?? item.rawMaterialId ?? 0,
    unitId: fn.unitId || item.unitId || 0, // each row's OWN unit, not the aggregate
    weight: Number(fn.weight) || 0,
  }));

           return {
    id: item.id || 0,
    price: Number(item.total) || 0,
    rawCatId: item.rawCatId || 0,
    rawId: item.rawMaterialId || 0,
    unitId: item.unitId || 0,
    weight: Number(item.finalQty) || 0,
    eventFunctionGeneralFixRaws: updatedFnRaws,
  };
}),
      };

      console.log("AddUpdateGeneralFix (autoSave) Payload:", payload);

      const response = await AddUpdateGeneralFix(payload);

      console.log("AddUpdateGeneralFix (autoSave) Response:", response);

      const isSuccess =
        response?.data?.success === true ||
        response?.status === 200 ||
        response?.status === 201;

      const message =
        response?.data?.msg ||
        response?.data?.message ||
        (isSuccess
          ? "General Fix data saved successfully!"
          : "Something went wrong while saving.");

      if (isSuccess) {
        setHasChanges(false);
        return { success: true, message };
      }

      console.error("❌ Auto-save failed:", response);
      return { success: false, message };
    } catch (error) {
      console.error("❌ Error during auto-save:", error);
      return {
        success: false,
        message:
          error?.response?.data?.msg ||
          error?.response?.data?.message ||
          "Something went wrong while saving.",
      };
    }
  };

  // =========================================================
  // Function Dropdown Change
  // =========================================================
  const handleFunctionChange = async (event) => {
  const value = event.target.value;

  if (hasChanges) {
    const action = await confirmUnsavedChanges();
    if (action === "cancel") return; // dropdown stays on old value since it's controlled
  }

  setSelectedFunction(value);

  let functionIds =
    value === "all"
      ? functions.map((item) => Number(item.value))
      : [Number(value)];

  setSelectedFunctionIds(functionIds);

  const activeCategory = tabs.find((tab) => tab.value === activeTab);
  if (activeCategory?.categoryId) {
    await fetchGeneralFixItems(activeCategory.categoryId, functionIds);
  }
};

  // =========================================================
  // Category Tab Change
  // =========================================================
  const handleTabSwitch = async (tab) => {
  if (activeTab === tab.value) return;

  if (hasChanges) {
    const action = await confirmUnsavedChanges();
    if (action === "cancel") return; // stay on current category
  }

  setActiveTab(tab.value);

  if (tab.categoryId && selectedFunctionIds.length > 0) {
    await fetchGeneralFixItems(tab.categoryId, selectedFunctionIds);
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
  const getRowId = (item) => item.rawMaterialId || item.id;

  // =========================================================
  // Final Quantity Change
  // =========================================================
    const handleFinalQtyChange = (itemId, value) => {
 // "All Function" is disabled in the UI, but guard here too in case
 // this is ever triggered programmatically.
 if (selectedFunction === "all") return;

 const activeFunctionId = Number(selectedFunctionIds[0]);
+
    setItems((previous) =>
      previous.map((item) => {
        if (getRowId(item) !== itemId) {
          return item;
        }

        const finalQty = value === "" ? 0 : Number(value) || 0;
     const newTotal = finalQty * (item.basePrice || 0);

     // Keep the per-function breakdown in sync so SidebarGeneralFix
     // shows the correct weight/price for THIS function if it's
     // opened right after this edit.
     const existingFnRaws = item.eventFunctionGeneralFixRaws || [];
     const hasMatch = existingFnRaws.some(
       (fn) => Number(fn.eventFunctionId) === activeFunctionId,
     );

     const updatedFnRaws = hasMatch
       ? existingFnRaws.map((fn) =>
           Number(fn.eventFunctionId) === activeFunctionId
             ? { ...fn, weight: finalQty, price: newTotal }
             : fn,
         )
       : [
           ...existingFnRaws,
           {
             eventFunctionId: activeFunctionId,
             id: 0,
             weight: finalQty,
             price: newTotal,
             unitId: item.unitId,
             rawCatId: item.rawCatId,
             rawId: item.rawMaterialId,
           },
         ];

        return {
          ...item,
          finalQtyInput: value,
          finalQty,
       total: newTotal,
       eventFunctionGeneralFixRaws: updatedFnRaws,
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
      if (value && !options.some((option) => option.value === value)) {
        options.push({ value, label });
      }
    };

    addOption(item.units?.id, item.units?.nameEnglish);
    addOption(item.unitHierarchyDto?.unitId, item.unitHierarchyDto?.nameEnglish);

    (item.unitHierarchyDto?.children || []).forEach((child) => {
      addOption(child.unitId, child.nameEnglish);
    });

    addOption(item.unitId, item.unit);

    return options;
  };

  // =========================================================
  // Unit Change
  // =========================================================
 const handleUnitChange = (itemId, value) => {
  setItems((previous) =>
    previous.map((item) => {
      if (getRowId(item) !== itemId) return item;

      const unitValue = Number(value);
      const selectedUnit = getUnitOptions(item).find(
        (option) => Number(option.value) === unitValue,
      );

      
      const hierarchy = item.unitHierarchyDto;
      const unitToBase = {};
      if (hierarchy) {
        unitToBase[hierarchy.unitId] = 1;
        (hierarchy.children || []).forEach((child) => {
          unitToBase[child.unitId] = 1 / child.equivalentValue;
        });
      }

      const supplierRate = parseFloat(item.supplierRate) || 0;
      const newBasePrice = supplierRate * (unitToBase[unitValue] ?? 1);
      const weight = parseFloat(item.finalQty) || 0;

      return {
        ...item,
        unitId: unitValue,
        unit: selectedUnit?.label || item.unit,
        basePrice: newBasePrice,
        total: weight * newBasePrice,
      };
    }),
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
 const handleSaveFromSidebar = (updatedRow) => {
  setItems((previous) =>
    previous.map((item) => {
      if (getRowId(item) !== getRowId(updatedRow)) return item;

      if (!updatedRow.qtyWasModified) {
        return { ...item, ...updatedRow, id: item.id };
      }

      const functions = updatedRow.eventFunctionGeneralFixRaws || [];
      const hierarchy = item.unitHierarchyDto;

      const unitToBase = {};
      if (hierarchy) {
        unitToBase[hierarchy.unitId] = 1;
        (hierarchy.children || []).forEach((child) => {
          unitToBase[child.unitId] = 1 / child.equivalentValue;
        });
      }

      // Always aggregate to the material's BASE unit (e.g. KILO) —
      // this way mixed-unit function rows (some KILO, some GRAM) sum
      // correctly instead of assuming they're all the same unit.
      const baseUnitId = hierarchy?.unitId || item.unitId;
      const supplierRate = parseFloat(item.supplierRate) || 0;

      const totalFunctionWeightInBase = functions.reduce((sum, fn) => {
        const fnUnitId = fn.unitId || baseUnitId;
        const factor = unitToBase[fnUnitId] ?? 1;
        return sum + (parseFloat(fn.weight) || 0) * factor;
      }, 0);

      const functionPriceSum = functions.reduce(
        (sum, fn) => sum + (parseFloat(fn.price) || 0),
        0,
      );

      const extraQty = parseFloat(updatedRow.extraQty) || 0; // in base unit
      const newFinalQty = totalFunctionWeightInBase + extraQty;
      const newTotal = functionPriceSum + extraQty * supplierRate;

      const baseUnitLabel = hierarchy?.nameEnglish || item.unit;

      return {
        ...item,
        id: item.id,
        unitId: baseUnitId,
        unit: baseUnitLabel,
        basePrice: supplierRate, // price per base unit, by definition
        finalQty: newFinalQty,
        finalQtyInput: String(newFinalQty),
        total: newTotal,
        eventFunctionGeneralFixRaws: functions,
      };
    }),
  );

  setHasChanges(true);
  setIsRawSidebar(false);

  Swal.fire({
    icon: "success",
    title: "Updated",
    text: "Row updated successfully. Changes will be saved when you click Save.",
    timer: 2000,
    showConfirmButton: false,
  });
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
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (!result.isConfirmed) return;

      setItems((previous) =>
        previous.filter((item) => getRowId(item) !== getRowId(row))
      );

      setHasChanges(true);

      Swal.fire("Deleted!", "Row has been deleted.", "success");
    });
  };

  // =========================================================
  // SAVE GENERAL FIX (manual Save button)
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

    setIsSaving(true);
    setTableLoading(true);

    try {
      const result = await autoSave();

      if (result.success) {
        const activeCategory = tabs.find((tab) => tab.value === activeTab);

        if (activeCategory?.categoryId) {
          await fetchGeneralFixItems(
            activeCategory.categoryId,
            selectedFunctionIds
          );
        }

        Swal.fire({
          icon: "success",
          title: "Saved",
          text: result.message || "General Fix data saved successfully!",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: result.message || "Something went wrong while saving.",
        });
      }
    } finally {
      setIsSaving(false);
      setTableLoading(false);
    }
  };

  // =========================================================
  // Total
  // =========================================================
  const totalPrice = filteredItems.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0
  );

  // =========================================================
  // Function Venues
  // =========================================================
  const functionVenues = (eventData?.eventFunctions || [])
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
        options.findIndex((item) => item.value === option.value) === index
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
    <>
      {/* =====================================================
          UNSAVED CHANGES BLOCKER MODAL (same as RawMaterialAllocation)
      ====================================================== */}
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
                  await handleSave();
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
                    onClick={() => navigate(`/menu-preparation/${eventId}`)}
                    className={stepButtonClass}
                  >
                    <i className="ki-filled ki-menu text-primary text-md"></i>
                    2. Menu Planning
                  </button>
                )}

                {permMenuExecution.view && (
                  <button
                    type="button"
                    onClick={() => navigate(`/menu-allocation/${eventId}`)}
                    className={stepButtonClass}
                  >
                    <i className="ki-filled ki-gift text-primary text-md"></i>
                    3. Menu Execution
                  </button>
                )}

                {permRawMaterial.view && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/raw-material-allocation/${eventId}`)
                    }
                    className={stepButtonClass}
                  >
                    <i className="ki-filled ki-box text-primary text-md"></i>
                    4. Raw Material Distribution
                  </button>
                )}

                {permAgencyDistribution.view && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/labour-and-other-management/${eventId}`)
                    }
                    className={stepButtonClass}
                  >
                    <i className="ki-filled ki-gift text-primary text-md"></i>
                    5. Agency Distribution
                  </button>
                )}

                {permPerDishCosting.view && (
                  <button
                    type="button"
                    onClick={() => navigate(`/dish-costing/${eventId}`)}
                    className={stepButtonClass}
                  >
                    <i className="ki-filled ki-grid text-primary text-md"></i>
                    6. Per Dish-costing
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => navigate("/")}
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
                <span className="text-sm">Event ID:</span>

                <span className="text-sm font-medium text-gray-900 underline">
                  {eventData?.eventNo || "-"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <i className="ki-filled ki-user text-success text-lg"></i>

              <div className="flex flex-col">
                <span className="text-sm">Party Name:</span>

                <span className="text-sm font-medium text-gray-900">
                  {eventData?.party?.nameEnglish || "-"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <i className="ki-filled ki-geolocation-home text-success text-lg"></i>

              <div className="flex flex-col">
                <span className="text-sm">Event Name:</span>

                <span className="text-sm font-medium text-gray-900">
                  {eventData?.eventType?.nameEnglish || "-"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <i className="ki-filled ki-calendar-tick text-success text-lg"></i>

              <div className="flex flex-col">
                <span className="text-sm">Event Date &amp; Time:</span>

                <span className="text-sm font-medium text-gray-900">
                  {eventData?.eventStartDateTime || "-"}
                </span>
              </div>
            </div>

            <div className="w-full h-0"></div>

            <div className="flex items-center gap-3">
              <i className="ki-filled ki-calendar-tick text-success text-lg"></i>

              <div className="flex flex-col">
                <span className="text-sm">Event Venue:</span>

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

        <div className="flex gap-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm font-semibold text-gray-700">
            Function:
          </label>

          <select
            value={selectedFunction}
            onChange={handleFunctionChange}
            disabled={functions.length === 0}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[240px] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All Function</option>

            {functions.map((func) => (
              <option key={func.value} value={func.value}>
                {func.label}
              </option>
            ))}
          </select>

          {/* {selectedFunction === "all" && functions.length > 0 && (
            <span className="text-xs text-gray-500">
              {functions.length} functions selected
            </span>
          )} */}
        </div>

         <div className="flex items-center gap-3 mb-3">
  <label className="text-sm font-semibold text-gray-700">Category:</label>

  <select
    value={activeTab || ""}
    onChange={(e) => {
      const tab = tabs.find((t) => t.value === e.target.value);
      if (tab) handleTabSwitch(tab);
    }}
    disabled={tabs.length === 0}
    className="border border-gray-300 rounded-lg px-3 py-2 text-sm min-w-[240px] bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-primary"
  >
    {tabs.length === 0 && <option value="">No categories found</option>}
    {tabs.map((tab) => (
      <option key={tab.value} value={tab.value}>
        {tab.label}
      </option>
    ))}
  </select>
</div>

        </div>

        {/* =====================================================
            CATEGORY DROPDOWN
        ====================================================== */}
       

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
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>
          <button
  onClick={() => setIsSelectMenureportOpen(true)}
  className="bg-[#05B723] text-white text-sm px-5 py-2 rounded-md transition"
  title="Report"
>
  Report
</button>
        </div>

        {/* =====================================================
            TABLE
        ====================================================== */}
        <div className="bg-white rounded-xl shadow border border-gray-200">
          <div className="max-h-[380px] overflow-y-auto">
            <table className="min-w-full table-fixed text-sm text-gray-700">
   <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold sticky top-0 z-1">
  <tr>
    <th className="w-16 px-4 py-3 text-left">ID</th>
    <th className="w-48 px-4 py-3 text-left">Raw Material</th>
    <th className="w-28 px-4 py-3 text-left">Weight</th>
    <th className="w-32 px-4 py-3 text-left">Unit</th>
    <th className="w-20 px-4 py-3 text-left">Pax</th>
    {/* <th className="w-40 px-4 py-3 text-left">Agency</th>
    <th className="w-36 px-4 py-3 text-left">Place</th>
    <th className="w-52 px-4 py-3 text-left">Date</th>
    <th className="w-44 px-4 py-3 text-left">Remarks</th> */}
    <th className="w-28 px-4 py-3 text-left">Total</th>
    <th className="w-24 px-4 py-3 text-center">Action</th>
  </tr>
</thead>

              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan="11" className="text-center py-6 text-gray-500">
                      No materials found
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, index) => {
                    const rowId = getRowId(item);
                    const unitOptions = getUnitOptions(item);

                    return (
                      <tr
                        key={rowId || index}
                        className="border-b border-gray-200"
                      >
                        <td className="px-4 py-3">{item.displayId}</td>

                        <td
                          className="px-4 py-2 text-xs text-gray-700 truncate"
                          title={item.material}
                        >
                          {item.material}
                        </td>

                        <td className="px-4 py-3">
  <input
    type="number"
    step="any"
    value={item.finalQtyInput}
    onChange={(event) => handleFinalQtyChange(rowId, event.target.value)}
    disabled={selectedFunction === "all"}
  title={
    selectedFunction === "all"
      ? "Select a specific function to edit quantity"
      : ""
  }
  className={`w-[80px] border rounded px-2 py-1 ${
    selectedFunction === "all"
      ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
      : "border-gray-300"
  }`}
  />
</td>

                        <td className="px-4 py-3">
  <select
    value={item.unitId}
    onChange={(event) => handleUnitChange(rowId, event.target.value)}
    className="w-[100px] border border-gray-300 rounded px-2 py-1 text-xs"
  >
    {unitOptions.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
 </td>
                        <td className="px-4 py-3">
  {item.pax ?? 0}
</td>

                      {/*  <td className="px-4 py-3">
                          {item.supplierName || "-"}
                        </td>

                        <td className="px-4 py-3">{item.place || "NA"}</td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          {item.date
                            ? dayjs(item.date).format("DD/MM/YYYY hh:mm A")
                            : "-"}
                        </td>

                        <td
                          className="px-4 py-3 text-xs text-gray-600 truncate"
                          title={item.remarksEnglish || ""}
                        >
                          <div className="flex items-center gap-2">
                            <span>{item.remarksEnglish || "-"}</span>

                            <button
                              type="button"
                              className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600"
                            >
                              <i className="ki-filled ki-notepad-edit text-xs"></i>
                            </button>
                          </div>
                        </td> */}

                        <td className="px-4 py-3">
                          {Number(item.total || 0).toFixed(2)}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <i
                              className="ki-filled ki-notepad-edit text-primary cursor-pointer hover:text-blue-700"
                              onClick={() => handleEditRow(item)}
                              title="Edit"
                            ></i>

                            {/* <i
                              className="ki-filled ki-trash text-red-500 cursor-pointer hover:text-red-700"
                              onClick={() => handleDeleteRow(item)}
                              title="Delete"
                            ></i> */}
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
                {totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={
                !hasChanges || tableLoading || selectedFunctionIds.length === 0
              }
              className={`text-sm px-5 py-2 rounded-md ${
                hasChanges && !tableLoading && selectedFunctionIds.length > 0
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
       <SidebarGeneralFix
  open={isRawSidebar}
  onClose={() => setIsRawSidebar(false)}
  selectedRow={selectedRow}
  onSave={handleSaveFromSidebar}
/>

<SelectMenureport
  isSelectMenureport={isSelectMenureportOpen}
  setIsSelectMenuReport={setIsSelectMenureportOpen}
  eventId={eventId}
  mode="raw"
  restrictToType="Type 7"
/>
      </Container>

      {/* =====================================================
          LOADING / SAVING OVERLAY
      ====================================================== */}
      {(tableLoading || isSaving) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <img
            src={toAbsoluteUrl("/media/icons/loading.gif")}
            alt="Loading..."
            className="w-18 rounded-xl shadow-2xl"
          />
        </div>
      )}
    </>
  );
};

export default GeneralFixPage;