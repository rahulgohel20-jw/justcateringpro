import { Fragment, useState, useEffect, useRef } from "react";
import { Container } from "@/components/container";
import AddGrossary from "@/partials/modals/event/add-grossary/AddGrossary";
import MenuReport from "@/partials/modals/menu-report/MenuReport";
import SelectMenureport from "../../../partials/modals/menu-report/SelectMenureport";
import { useNavigate } from "react-router-dom";
import PlaceSelect from "../../../components/PlaceSelect/PlaceSelect";
import { useParams, useBlocker } from "react-router-dom";
import { GetUnitData } from "@/services/apiServices";
import {
  GetAllRawMaterialAllocationCategory,
  GetAllRawMaterialAllocationItems,
  GetAllSupllierVendors,
  RawMaterialallocation,
  GetEventMasterById,
  GenerateSOT,
  Translateapi ,
  CheckSOT,
} from "@/services/apiServices";
import { Spin } from "antd";
import Swal from "sweetalert2";
import SidebarRawMaterial from "./sidebarrawmaterialmodal/SidebarRawMaterial";
import { FormattedMessage, useIntl } from "react-intl";
import dayjs from "dayjs";
import DatePicker from "react-datepicker";
import AddRawMaterial from "./AddRawMaterial";
import AllCustomerToogle from "@/components/modal/AllCustomerToggle";
import { toAbsoluteUrl } from "@/utils/Assets";
import { useModuleAccess } from "../../../hooks/useModuleAccess";
import { usePermission } from "../../../hooks/usePermission";
import { AddLogs } from "../../../services/apiServices";
import { Calendar } from "lucide-react";
import MultiLangInputBox from "@/components/form-inputs/MultiLangInputbox";
import { extractTranslations } from "@/utils/langConfig";

const formatItems = (items, lang) =>
  items.map((item, index) => {
    const functionDate =
      item.eventRawMaterialFunctions &&
      item.eventRawMaterialFunctions.length > 0
        ? item.eventRawMaterialFunctions[0].functiondatetime
        : null;

    const resolvedDate = functionDate || item.date || null;

    const originalQty = item.qty || 0;
    const originalTotal = item.totalprice || 0;
    const originalFinalQty = item.finalQty || item.qty || 0;
    const basePricePerUnit =
      originalFinalQty > 0 ? originalTotal / originalFinalQty : 0;
    const originalPricePerUnit =
      originalQty > 0 ? originalTotal / originalQty : 0;

    return {
      id: index + 1,
      rawMaterialId: item.rawMaterialId || item.id || 0,
      isExtraItem: !!item.extraItemName,
      material:
        (lang === "gu"
          ? item.rawMaterialNameGuj
          : lang === "hi"
            ? item.rawMaterialNameHin
            : item.rawMaterialNameEng) ||
        item.extraItemName ||
        "N/A",
      qty: item.qty || 0,
      finalQty: originalFinalQty,
      total: originalTotal,
      basePricePerUnit,
      unitHierarchyDto: item.unitHierarchyDto,
      units: item.units,
      unit:
        item.units?.nameEnglish || item.unitHierarchyDto?.nameEnglish || "KILO",
      unitId:
        item.units?.id || item.unitHierarchyDto?.unitId || item.unitId || 1,
      agency: item.supplierName || "-",
      supplierId: item.supplierId || 0,
      place: item.place || "NA",
      remarksEnglish: item.remarksEnglish || "",
remarksHindi: item.remarksHindi || "",
remarksGujarati: item.remarksGujarati || "",
      date: resolvedDate
        ? dayjs(
            resolvedDate,
            [
              "DD/MM/YYYY HH:mm:ss",
              "YYYY-MM-DD HH:mm:ss.S",
              "YYYY-MM-DDTHH:mm:ss",
            ],
            true,
          ).isValid()
          ? dayjs(
              resolvedDate,
              [
                "DD/MM/YYYY HH:mm:ss",
                "YYYY-MM-DD HH:mm:ss.S",
                "YYYY-MM-DDTHH:mm:ss",
              ],
              true,
            )
          : dayjs(resolvedDate).isValid()
            ? dayjs(resolvedDate)
            : null
        : null,
      originalPricePerUnit,
      eventRawMaterialFunctions: item.eventRawMaterialFunctions || [],
    };
  });
const formatTabs = (categories, lang) =>
  categories.map((category) => ({
    value: category.id?.toString(),
    label:
      (lang === "gu"
        ? category.nameGujarati
        : lang === "hi"
          ? category.nameHindi
          : category.nameEnglish) || "N/A",
    categoryId: category.id,
  }));

const RemarksPopup = ({ data, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    remarksEnglish: data.remarksEnglish || "",
    remarksHindi: data.remarksHindi || "",
    remarksGujarati: data.remarksGujarati || "",
  });
  const translateTimerRef = useRef(null);

  useEffect(() => {
    if (translateTimerRef.current) clearTimeout(translateTimerRef.current);

    if (!formData.remarksEnglish?.trim()) {
      setFormData((prev) => ({ ...prev, remarksHindi: "", remarksGujarati: "" }));
      return;
    }

    translateTimerRef.current = setTimeout(async () => {
      try {
        const res = await Translateapi(formData.remarksEnglish);
        const { regional, hindi } = extractTranslations(res?.data?.data || res?.data || {});
        setFormData((prev) => ({ ...prev, remarksHindi: hindi, remarksGujarati: regional }));
      } catch (err) {
        console.error("Translation error:", err);
      }
    }, 700);

    return () => clearTimeout(translateTimerRef.current);
  }, [formData.remarksEnglish]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-[700px] max-w-[95vw] z-10 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="text-sm font-bold text-gray-800">Edit Remarks</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[580px]">
              {data.material}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500"
          >
            <i className="ki-filled ki-cross text-sm"></i>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <MultiLangInputBox
            formData={formData}
            setFormData={setFormData}
            label="Remarks"
            cols={1}
            type="text"
            keys={{
              english: "remarksEnglish",
              regional: "remarksGujarati",
              hindi: "remarksHindi",
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button onClick={onClose} className="btn btn-light text-sm">
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="btn btn-primary text-sm"
          >
            Save Remarks
          </button>
        </div>
      </div>
    </div>
  );
};

const RawMaterialAllocation = ({ mode }) => {
  let { eventId } = useParams();
  const navigate = useNavigate();
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [isRawSidebar, setIsRawSidebar] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [menuReportEventId, setMenuReportEventId] = useState(null);
  const [isMenuReport, setIsMenuReport] = useState(false);
  const [isSelectMenureport, setIsSelectMenuReport] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState(null);
  const [unit, setUnit] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [originalData, setOriginalData] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isAddMaterialModal, setIsAddMaterialModal] = useState(false);
  const [eventFunctions, setEventFunctions] = useState([]);
  const [isAllCustomerToogleOpen, setIsAllCustomerToogleOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const prevEventIdRef = useRef(null);
  const isInitialLoadRef = useRef(true);
  const intl = useIntl();
  let userId = localStorage.getItem("userId");
  const [isRemarksPopupOpen, setIsRemarksPopupOpen] = useState(false);
const [remarksPopupData, setRemarksPopupData] = useState(null);
const [remarksPopupIndex, setRemarksPopupIndex] = useState(null);
const [isSotLocked, setIsSotLocked] = useState(false);

  const isSavingRef = useRef(false);
  const saveClickCountRef = useRef(0);
  const [saveProgress, setSaveProgress] = useState(0);
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

  const permMenuPlanning = usePermission("Menu Planning");
  const permMenuExecution = usePermission("Menu Execution");
  const permAgencyDistribution = usePermission("Labour Agency Order");
  const permPerDishCosting = usePermission("Per Dish Costing");

  const rawItemsRef = useRef([]);
  const rawCategoriesRef = useRef([]);
  const initialDataRef = useRef([]);

  const [currentLanguage, setCurrentLanguage] = useState(
    localStorage.getItem("lang") || "en",
  );
  const progressAnimRef = useRef(null);

  useEffect(() => {
    const handleLanguageChange = () => {
      const newLang = localStorage.getItem("lang") || "en";
      setCurrentLanguage(newLang);
    };

    window.addEventListener("languageChange", handleLanguageChange);
    window.addEventListener("storage", handleLanguageChange);

    const intervalId = setInterval(() => {
      const current = localStorage.getItem("lang") || "en";
      if (current !== currentLanguage) {
        setCurrentLanguage(current);
      }
    }, 500);

    return () => {
      window.removeEventListener("languageChange", handleLanguageChange);
      window.removeEventListener("storage", handleLanguageChange);
      clearInterval(intervalId);
    };
  }, [currentLanguage]);

  const { hasModuleAccess } = useModuleAccess();

  const canAccessStock = hasModuleAccess("Stock");
  

  const fetchEventData = async () => {
    if (!eventId) return;

    try {
      const eventData = await GetEventMasterById(eventId);
      const data = eventData.data.data["Event Details"] || [];

      if (data && data.length > 0) {
        const event = eventData.data.data["Event Details"][0];
        setEventData(event);
      } else {
        console.error("error in fetching event data");
        setEventData([]);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      setEventData([]);
    }
  };

  const fetchEventFunctions = async () => {
    if (!eventId) return;

    try {
      const response = await GetEventMasterById(eventId);
      const eventDetails = response?.data?.data?.["Event Details"];

      if (eventDetails && eventDetails.length > 0) {
        const functions = eventDetails[0].eventFunctions || [];

        const transformedFunctions = functions.map((fn) => ({
          eventFunctionId: fn.id,
          functionId: fn.function.id,
          functionName: fn.function.nameEnglish,
          functiondatetime: fn.functionStartDateTime,
          pax: fn.pax,
          venue: fn.function_venue,
        }));

        setEventFunctions(transformedFunctions);
      } else {
        setEventFunctions([]);
      }
    } catch (error) {
      console.error("Error fetching event functions:", error);
      setEventFunctions([]);
    }
  };

  const fetchCategories = async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      const res = await GetAllRawMaterialAllocationCategory(eventId);
      const categories =
        res?.data?.data?.["Raw Material Category Details"] || [];

      if (!Array.isArray(categories) || categories.length === 0) {
        console.warn("No categories found");
        setTabs([]);
        setActiveTab(null);
        setData([]);
        setOriginalData([]);
        rawCategoriesRef.current = [];
        return;
      }

      rawCategoriesRef.current = categories; 
      const dynamicTabs = formatTabs(categories, currentLanguage);

      setTabs(dynamicTabs);
      setActiveTab(dynamicTabs[0]?.value);

      if (dynamicTabs[0]?.categoryId) {
        await fetchRawMaterialItems(dynamicTabs[0].categoryId);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setTabs([]);
      setActiveTab(null);
      setData([]);
      setOriginalData([]);
      rawCategoriesRef.current = [];
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencies = async () => {
    try {
      const response = await GetAllSupllierVendors(userId);
      const list = response?.data?.data?.["Party Details"] || [];
      setAgencies(list);
    } catch (error) {
      console.error("Error fetching agencies:", error);
      setAgencies([]);
    }
  };

  const FetchUnit = async () => {
    try {
      const data = await GetUnitData(userId);
      setUnit(data?.data?.data["Unit Details"] || []);
    } catch (error) {
      console.log(error);
      setUnit([]);
    }
  };

const checkSotStatus = async () => {
  if (!eventId || !userId) return;
  try {
    const res = await CheckSOT(eventId, userId);
    const locked = res?.data;
     
    setIsSotLocked(locked);
  } catch (error) {
    console.error("Error checking SOT status:", error);
    setIsSotLocked(true); 
  }
};

  useEffect(() => {
    if (rawCategoriesRef.current.length > 0) {
      const newTabs = formatTabs(rawCategoriesRef.current, currentLanguage);
      setTabs(newTabs);
    }

    if (rawItemsRef.current.length > 0) {
      const formatted = formatItems(rawItemsRef.current, currentLanguage);
      setData(formatted);
      setOriginalData(formatted);
    }
  }, [currentLanguage]);

  useEffect(() => {
    const loadEventData = async () => {
      if (!eventId) return;

      const hasEventIdChanged = prevEventIdRef.current !== eventId;

      if (hasEventIdChanged || isInitialLoadRef.current) {
      

        setData([]);
        setOriginalData([]);
        setTabs([]);
        setActiveTab(null);
        setHasUnsavedChanges(false);
        setSearchTerm("");
        setSelectedRows([]);
        setIsNavigating(false);

        await Promise.all([
          fetchEventData(),
          fetchEventFunctions(),
          fetchCategories(),
          checkSotStatus(),
        ]);

        prevEventIdRef.current = eventId;
        isInitialLoadRef.current = false;
      }
    };

    loadEventData();
  }, [eventId, currentLanguage]);

  useEffect(() => {
    fetchAgencies();
    FetchUnit();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      const query = searchTerm.trim().toLowerCase();

      if (!query) {
        setData(originalData);
        return;
      }

      const normalize = (val = "") =>
        val.toString().toLowerCase().replace(/\s+/g, "");

      const filtered = originalData.filter(
        (item) =>
          normalize(item.material).includes(normalize(query)) ||
          normalize(item.agency).includes(normalize(query)) ||
          normalize(item.place).includes(normalize(query)),
      );

      setData(filtered);
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm, originalData]);

  const handleAddNewRow = () => {
    setIsAddMaterialModal(true);
  };

  const handleSaveNewMaterial = (newRowData) => {
    const newRow = { ...newRowData, id: data.length + 1 };
    setData((prev) => [...prev, newRow]);
    setOriginalData((prev) => [...prev, newRow]);
    setHasUnsavedChanges(true);
  };

  const handleDeleteRow = (index) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this row?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const rowToDelete = data[index]; // ← get before filtering
        const updated = data.filter((_, i) => i !== index);
        const reordered = updated.map((item, idx) => ({
          ...item,
          id: idx + 1,
        }));
        setData(reordered);

        // ← ALSO remove from originalData
        setOriginalData((prev) =>
          prev.filter((r) => {
            const isSameRow = rowToDelete.rowKey
              ? r.rowKey === rowToDelete.rowKey
              : r.rawMaterialId === rowToDelete.rawMaterialId;
            return !isSameRow;
          }),
        );

        setHasUnsavedChanges(true);
        Swal.fire("Deleted!", "Row has been deleted.", "success");
      }
    });
  };
  const toggleRowSelection = (rawMaterialId) => {
    setSelectedRows((prev) =>
      prev.includes(rawMaterialId)
        ? prev.filter((id) => id !== rawMaterialId)
        : [...prev, rawMaterialId],
    );
  };

  const toggleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((item) => item.rawMaterialId));
    }
  };

  const buildUnitOptions = (
    unitsObject,
    unitHierarchyDto,
    currentUnitId,
    currentUnitName,
  ) => {
    const options = [];

    if (unitsObject && unitsObject.id) {
      options.push({
        value: unitsObject.id,
        label: unitsObject.nameEnglish,
      });
    }

    if (unitHierarchyDto) {
      if (!options.some((o) => o.value === unitHierarchyDto.unitId)) {
        options.push({
          value: unitHierarchyDto.unitId,
          label: unitHierarchyDto.nameEnglish,
        });
      }

      if (Array.isArray(unitHierarchyDto.children)) {
        unitHierarchyDto.children.forEach((child) => {
          if (!options.some((o) => o.value === child.unitId)) {
            options.push({
              value: child.unitId,
              label: child.nameEnglish,
            });
          }
        });
      }
    }

    if (currentUnitId && !options.some((o) => o.value === currentUnitId)) {
      options.unshift({
        value: currentUnitId,
        label: currentUnitName || "Unit",
      });
    }

    return options;
  };


 const buildRawMaterialLogSummary = (prevItems, currentItems) => {
    const itemLines = [];
    const removed = [];

    const keyOf = (item) =>
      item.rawMaterialId && item.rawMaterialId !== 0
        ? `id-${item.rawMaterialId}`
        : item.rowKey || `new-${item.material}`;

    const prevMap = new Map((prevItems || []).map((item) => [keyOf(item), item]));
    const currMap = new Map((currentItems || []).map((item) => [keyOf(item), item]));

    const fields = [
      ["agency", "Agency"],
      ["place", "Place"],
      ["finalQty", "Final Qty"],
      ["unit", "Unit"],
      ["remarksEnglish", "Remarks"],
    ];

    (currentItems || []).forEach((item) => {
      const prev = prevMap.get(keyOf(item)) || {}; // empty object → all fields read as "-"
      const itemLabel = item.material || "Raw Material";
      const changes = [];

      fields.forEach(([field, label]) => {
        const prevVal = prev[field] ?? "-";
        const currVal = item[field] ?? "-";
        if (String(prevVal) !== String(currVal)) {
          changes.push(`${label}: ${prevVal} → ${currVal}`);
        }
      });

      const prevDate =
        prev.date && dayjs(prev.date).isValid()
          ? dayjs(prev.date).format("DD/MM/YYYY hh:mm A")
          : "-";
      const currDate =
        item.date && dayjs(item.date).isValid()
          ? dayjs(item.date).format("DD/MM/YYYY hh:mm A")
          : "-";
      if (prevDate !== currDate) {
        changes.push(`Date: ${prevDate} → ${currDate}`);
      }

      if (changes.length) {
        itemLines.push(`${itemLabel} [${changes.join(", ")}]`);
      }
    });

    (prevItems || []).forEach((item) => {
      if (!currMap.has(keyOf(item))) {
        removed.push(item.material || "Raw Material");
      }
    });

    const parts = [];
    if (itemLines.length) parts.push(`Changes: ${itemLines.join(" | ")}`);
    if (removed.length) parts.push(`Removed: ${removed.join(", ")}`);

    return parts.length ? parts.join(" | ") : "No item-level changes detected.";
  };

  const fetchRawMaterialItems = async (categoryId) => {
    if (!eventId || !categoryId) return;

    setTableLoading(true);
    try {
      const response = await GetAllRawMaterialAllocationItems(
        eventId,
        categoryId,
      );
      const items =
        response?.data?.data?.["Event_RAW_MATERIAL_ALLOCATION"] || [];

      if (Array.isArray(items)) {
        rawItemsRef.current = items; 
        const formatted = formatItems(items, currentLanguage);
        setData(formatted);
        setOriginalData(formatted);
        initialDataRef.current = JSON.parse(JSON.stringify(formatted)); // ← baseline for change diff
        setHasUnsavedChanges(false);
      } else {
        rawItemsRef.current = [];
        setData([]);
        setOriginalData([]);
      }
    } catch (error) {
      console.error("Error fetching raw material items:", error);
      rawItemsRef.current = [];
      setData([]);
      setOriginalData([]);
    } finally {
      setTableLoading(false);
    }
  };

  const getEquivalentValue = (fromUnitId, toUnitId, unitHierarchyDto) => {
    if (!unitHierarchyDto) return 1;

    if (fromUnitId === toUnitId) return 1;

    const child = unitHierarchyDto.children?.find((c) => c.unitId === toUnitId);
    if (child) return child.equivalentValue;

    const isChild = unitHierarchyDto.children?.some(
      (c) => c.unitId === fromUnitId,
    );
    if (isChild && unitHierarchyDto.unitId === toUnitId) {
      const childUnit = unitHierarchyDto.children.find(
        (c) => c.unitId === fromUnitId,
      );
      return 1 / childUnit.equivalentValue;
    }

    return 1;
  };

  const handleChange = (index, field, value) => {
    const updated = [...data];
    const row = updated[index];
    const basePrice = Number(row.basePricePerUnit) || 0;

    if (field === "finalQty") {
      const newFinalQty = Number(value) || 0;
      row.finalQty = newFinalQty;
      row.total = newFinalQty > 0 ? basePrice * newFinalQty : 0;
      setData(updated);
      setOriginalData((prev) =>
        prev.map((r) =>
          r.rawMaterialId === row.rawMaterialId ? { ...row } : r,
        ),
      );
      setHasUnsavedChanges(true);
      return;
    }

    // if (field === "unitId") {
    //   const newUnitId = Number(value);
    //   const oldUnitId = row.unitId;
    //   const factor = getEquivalentValue(
    //     oldUnitId,
    //     newUnitId,
    //     row.unitHierarchyDto,
    //   );
    //   const newFinalQty = (Number(row.finalQty) || 0) * factor;
    //   const newPricePerUnit = factor !== 0 ? basePrice / factor : basePrice;
    //   row.unitId = newUnitId;
    //   row.finalQty = newFinalQty;
    //   row.finalQtyInput = String(newFinalQty);
    //   row.basePricePerUnit = newPricePerUnit;
    //   row.total = newFinalQty > 0 ? newFinalQty * newPricePerUnit : 0;

    //   const unitOptions = buildUnitOptions(
    //     row.units,
    //     row.unitHierarchyDto,
    //     newUnitId,
    //     row.unit,
    //   );
    //   const selectedUnit = unitOptions.find((u) => u.value === newUnitId);
    //   if (selectedUnit) {
    //     row.unit = selectedUnit.label;
    //     row.units = {
    //       ...row.units,
    //       id: newUnitId,
    //       nameEnglish: selectedUnit.label,
    //     };
    //   }

    //   setData([...updated]);
    //   setOriginalData((prev) =>
    //     prev.map((r) =>
    //       r.rawMaterialId === row.rawMaterialId ? { ...row } : r,
    //     ),
    //   );
    //   setHasUnsavedChanges(true);
    //   return;
    // }


    if (field === "unitId") {
  const newUnitId = Number(value);
  const oldUnitId = row.unitId;
  const hierarchy = row.unitHierarchyDto;

  // Find price per base unit first, then convert to new unit's price
  const getBasePriceInNewUnit = (oldBasePricePerUnit, fromUnitId, toUnitId) => {
    if (fromUnitId === toUnitId || !hierarchy) return oldBasePricePerUnit;

    const baseUnitId = hierarchy.unitId;

    // Build unitId → multiplier to convert to BASE unit quantity
    // e.g. if 1 KG = 1000 grams, then gram's multiplier = 1/1000
    const unitToBase = { [baseUnitId]: 1 };
    (hierarchy.children || []).forEach((child) => {
      unitToBase[child.unitId] = 1 / child.equivalentValue;
    });

    // price per fromUnit → price per base unit → price per toUnit
    // price per base = oldBasePricePerUnit / unitToBase[fromUnitId]
    // price per toUnit = pricePerBase * unitToBase[toUnitId]
    const pricePerBase = oldBasePricePerUnit / (unitToBase[fromUnitId] ?? 1);
    const newPricePerUnit = pricePerBase * (unitToBase[toUnitId] ?? 1);
    return newPricePerUnit;
  };

  const newBasePricePerUnit = getBasePriceInNewUnit(
    Number(row.basePricePerUnit) || 0,
    oldUnitId,
    newUnitId,
  );

  row.unitId = newUnitId;
  row.basePricePerUnit = newBasePricePerUnit;
  // finalQty stays unchanged — no auto conversion
  row.total = (Number(row.finalQty) || 0) * newBasePricePerUnit;

  const unitOptions = buildUnitOptions(
    row.units,
    row.unitHierarchyDto,
    newUnitId,
    row.unit,
  );
  const selectedUnit = unitOptions.find((u) => u.value === newUnitId);
  if (selectedUnit) {
    row.unit = selectedUnit.label;
    row.units = {
      ...row.units,
      id: newUnitId,
      nameEnglish: selectedUnit.label,
    };
  }

  setData([...updated]);
  setOriginalData((prev) =>
    prev.map((r) =>
      r.rawMaterialId === row.rawMaterialId ? { ...row } : r,
    ),
  );
  setHasUnsavedChanges(true);
  return;
}

    row[field] = value;
    setData(updated);
    setOriginalData((prev) =>
      prev.map((r) => {
        const isSameRow = row.rowKey
          ? r.rowKey === row.rowKey
          : r.rawMaterialId === row.rawMaterialId;
        return isSameRow ? { ...row } : r;
      }),
    );
    setHasUnsavedChanges(true);
  };

  const handleAgencyChange = (index, value) => {
    const updated = [...data];
    const row = updated[index];
    row.agency = value;
    setData(updated);
    setOriginalData((prev) =>
      prev.map((r) => {
        const isSameRow = row.rowKey
          ? r.rowKey === row.rowKey
          : r.rawMaterialId === row.rawMaterialId;
        return isSameRow ? { ...row } : r;
      }),
    );
    setHasUnsavedChanges(true);
  };

  const autoSave = async (showNotification = false) => {
    try {
      if (!eventId) {
        console.warn("Missing Event ID, skipping auto-save");
        return false;
      }

      if (!data || data.length === 0) {
        console.warn("No data to save, skipping auto-save");
        return false;
      }

      const newRow = data.find((item) => item.isNewRow);
      const payloadEventFunctionId = newRow?.eventFunctionId || 0;


      // Build payload Backup (in case we need to revert)
//       const payload = {
//         eventFunctionId: payloadEventFunctionId || (eventFunctions[0]?.eventFunctionId) || 0,
//         eventId: parseInt(eventId),
//         rawMaterialCategoryId: parseInt(activeTab || 0),
//         eventRawMaterial: originalData.map((item) => {
//           const supplierId =
//             agencies.find(
//               (a) => a.nameEnglish === item.agency || a.name === item.agency,
//             )?.id ||
//             item.supplierId ||
//             0;

//           const eventRawMatFunctions = item.isNewRow
//             ? []
//             : (item.eventRawMaterialFunctions || []).map((fn) => ({
//       menuItemId: fn.menuItemId,
//       eventFunctionId: fn.eventFunctionId || 0,
//       functionId: fn.functionId || 0,
//       functiondatetime: fn.functiondatetime
//         ? dayjs(fn.functiondatetime).isValid()
//           ? dayjs(fn.functiondatetime).format("YYYY-MM-DD HH:mm:ss.0")
//           : ""
//         : item.date && dayjs(item.date).isValid()
//           ? dayjs(item.date).format("YYYY-MM-DD HH:mm:ss.0")
//           : "",
//       isExtraField: fn.isExtraField === true,
//       rawMaterialRate: fn.rawMaterialRate || fn.rawMaterialPrice,
//       itemName: fn.itemName || item.material || "",
//       place: fn.place || item.place || "",
//       price: parseFloat(fn.price) || 0,
//       qty: parseFloat(fn.qty) || 0,
//       supplierId: fn.supplierId || supplierId,
//       unitId: fn.unitId || item.unitId || 0,
//     }));

//         return {
//   eventRawMatFunctions,
//  extraItem: (item.isNewRow || item.isExtraItem) ? item.material : "",
//   finalQty: parseFloat(item.finalQty) || 0,
//   place: item.place || "",
//   qty: parseFloat(item.qty) || 0,
//   rawMaterialId: (item.isNewRow || item.isExtraItem) ? null : (item.rawMaterialId || null),
//   supplierId,
//   totalprice: parseFloat(item.total) || 0,
//   unitId: item.unitId || 0,
//   date:
//     item.date && dayjs(item.date).isValid()
//       ? dayjs(item.date).format("YYYY-MM-DD HH:mm:ss.0")
//       : "",
// };
//         }),
//       };





const payload = {
  eventFunctionId: payloadEventFunctionId || (eventFunctions[0]?.eventFunctionId) || 0,
  eventId: parseInt(eventId),
  rawMaterialCategoryId: parseInt(activeTab || 0),
  eventRawMaterial: originalData.map((item) => {  
    const supplierId =
  agencies.find(
    (a) =>
      a.nameEnglish === item.agency ||
      a.name === item.agency ||
      a.id === item.supplierId, 
  )?.id ||
  item.supplierId ||
  0;

    const eventRawMatFunctions = item.isNewRow
      ? []
      : (item.eventRawMaterialFunctions || []).map((fn) => ({
          menuItemId: fn.menuItemId,
          eventFunctionId: fn.eventFunctionId || 0,
          functionId: fn.functionId || 0,
          functiondatetime: fn.functiondatetime
            ? dayjs(fn.functiondatetime).isValid()
              ? dayjs(fn.functiondatetime).format("YYYY-MM-DD HH:mm:ss.0")
              : ""
            : item.date && dayjs(item.date).isValid()
              ? dayjs(item.date).format("YYYY-MM-DD HH:mm:ss.0")
              : "",
          isExtraField: fn.isExtraField === true,
          rawMaterialRate: fn.rawMaterialRate || fn.rawMaterialPrice,
          itemName: fn.itemName || item.material || "",
          place: fn.place || item.place || "",
          price: parseFloat(fn.price) || 0,
          qty: parseFloat(fn.qty) || 0,        
          supplierId: fn.supplierId || supplierId,
          unitId: fn.unitId || item.unitId || 0, 
        }));

    return {
      eventRawMatFunctions,
      extraItem: (item.isNewRow || item.isExtraItem) ? item.material : "",
      finalQty: parseFloat(item.finalQty) || 0,  
      place: item.place || "",
      qty: parseFloat(item.qty) || 0,
      rawMaterialId: (item.isNewRow || item.isExtraItem) ? null : (item.rawMaterialId || null),
      supplierId,
      totalprice: parseFloat(item.total) || 0,
      unitId: item.unitId || 0,
      date:
        item.date && dayjs(item.date).isValid()
          ? dayjs(item.date).format("YYYY-MM-DD HH:mm:ss.0")
          : "",
          remarksEnglish: item.remarksEnglish || "",   
  remarksHindi: item.remarksHindi || "",        
  remarksGujarati: item.remarksGujarati || "", 
    };
  }),
};

      const response = await RawMaterialallocation(payload);

      if (
        response?.data?.success === true ||
        response?.status === 200 ||
        response?.status === 201
      ) {
        setHasUnsavedChanges(false);

        const isUpdate = data.some(
          (item) => !item.isNewRow && item.rawMaterialId,
        );

         try {
  const activeTabLabel = tabs.find((t) => t.value === activeTab)?.label || "N/A";
  const totalItems = originalData.length;
  const totalMaterialCost = originalData.reduce(
    (sum, item) => sum + (Number(item.total) || 0),
    0,
  );

const changeSummary = buildRawMaterialLogSummary(
    initialDataRef.current,
    originalData,
  );

  const description =
    `Raw Material Distribution ${isUpdate ? "Updated" : "Saved"} — ` +
    `Event No: ${eventData?.eventNo || eventId} | Customer: ${eventData?.party?.nameEnglish || "N/A"} | ` +
    `Venue: ${eventData?.venue?.nameEnglish || "N/A"} | Category: ${activeTabLabel} | ` +
    `Items: ${totalItems} | Total Cost: ₹${totalMaterialCost.toFixed(2)} | ` +
    `Updated By: ${userEmail || "Unknown User"} | ${changeSummary}`;

  await AddLogs({
    id: 0,
    eventId: Number(eventId) || 0,
    description,
    eventType: isUpdate
      ? "Raw Material Distribution Update"
      : "Raw Material Distribution Save",
    user: userEmail,
  });

  // Reset baseline to just-saved state so the next save's diff stays accurate
  initialDataRef.current = JSON.parse(JSON.stringify(originalData));
} catch (logErr) {
  console.error("Log failed (non-blocking):", logErr);
}

        if (showNotification) {
          Swal.fire({
            icon: "success",
            title: "Saved",
            text: "Data saved successfully!",
            timer: 1500,
            showConfirmButton: false,
          });
        }
        setSearchTerm("");
        return true;
      } else {
        console.error("❌ Auto-save failed:", response);
        return false;
      }
    } catch (error) {
      console.error("❌ Error during auto-save:", error);
      return false;
    }
  };

  // const handleDateChange = (index, date) => {
  //   const updated = [...data];
  //   updated[index].date = date ? dayjs(date) : null;
  //   setData(updated);
  //   setHasUnsavedChanges(true);
  // };

  const handleDateChange = (index, date) => {
  const updated = [...data];
  updated[index].date = date ? dayjs(date) : null;
  setData(updated);
  setOriginalData((prev) =>
    prev.map((r) =>
      r.rawMaterialId === updated[index].rawMaterialId
        ? { ...updated[index] }
        : r,
    ),
  );
  setHasUnsavedChanges(true);
};

  const handleGenerateSOT = async () => {
    try {
      setIsSaving(true);

      const saved = await autoSave(false);
      if (!saved) {
        Swal.fire({
          icon: "error",
          title: "Save Failed",
          text: "Could not save data before generating SOT. Please try again.",
          confirmButtonColor: "#d33",
        });
        return;
      }

      const payload = {
        eventId: parseInt(eventId),
        userId: parseInt(userId),
      };
      const response = await GenerateSOT(payload);

      if (response?.data?.success === true) {
        Swal.fire({
          icon: "success",
          title: "SOT Generated",
          text: "Data saved and SOT generated successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
        checkSotStatus();
      } else {
        Swal.fire({
          icon: "warning",
          title: "SOT Not Generated",
          text:
            response?.data?.msg || "Something went wrong. Please try again.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("SOT generation failed:", error);
      Swal.fire({
        icon: "error",
        title: "Failed",
        text:
          error?.response?.data?.msg ||
          "Could not generate SOT. Please try again.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const animateProgress = (from, to, duration = 600) => {
    return new Promise((resolve) => {
      if (progressAnimRef.current) clearInterval(progressAnimRef.current);

      const steps = to - from;
      if (steps <= 0) {
        setSaveProgress(to);
        resolve();
        return;
      }

      const intervalMs = Math.floor(duration / steps);
      let current = from;

      progressAnimRef.current = setInterval(() => {
        current += 1;
        setSaveProgress(current);
        if (current >= to) {
          clearInterval(progressAnimRef.current);
          progressAnimRef.current = null;
          resolve();
        }
      }, intervalMs);
    });
  };

  const handleSave = async () => {
    saveClickCountRef.current += 1;
    if (isSavingRef.current) return;

    isSavingRef.current = true;
    setIsSaving(true);
    setSaveProgress(0);

    animateProgress(0, 60, 800);

    const success = await autoSave(false);

    if (progressAnimRef.current) clearInterval(progressAnimRef.current);

    if (success) {
      setSaveProgress(100);

      await new Promise((res) => setTimeout(res, 600));

      isSavingRef.current = false;
      setIsSaving(false);
      setSaveProgress(0);

      Swal.fire({
        icon: "success",
        title: "Saved",
        text: "Data saved successfully!",
        timer: 1500,
        showConfirmButton: false,
      });

      const currentTab = tabs.find((tab) => tab.value === activeTab);
      if (currentTab?.categoryId) {
        fetchRawMaterialItems(currentTab.categoryId);
      }
    } else {
      isSavingRef.current = false;
      setIsSaving(false);

      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Something went wrong while saving.",
      });
    }
  };

  const handleTabSwitch = async (tab) => {
    if (hasUnsavedChanges && data.length > 0) {
      const success = await autoSave(false);

      if (!success) {
      } else {
        console.warn("⚠️ Auto-save failed, but continuing with tab switch");
      }
    }

    setActiveTab(tab.value);
    await fetchRawMaterialItems(tab.categoryId);
  };

  function openSelectMenureport() {
    setIsSelectMenuReport(true);
  }

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleAllocateAgency = (agency) => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Please select at least one raw material.",
      });
      return;
    }

    const updated = data.map((item) =>
      selectedRows.includes(item.rawMaterialId) ? { ...item, agency } : item,
    );

    setData(updated);
    setOriginalData(updated);
    setHasUnsavedChanges(true);
  };

  const handleAllocatePlace = (placeName, placeId) => {
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Please select at least one raw material.",
      });
      return;
    }

    const updated = data.map((item) =>
      selectedRows.includes(item.rawMaterialId)
        ? {
            ...item,
            place: placeName,
            placeId: Number(placeId) || 0,
          }
        : item,
    );

    setData(updated);
    setOriginalData(updated);
    setHasUnsavedChanges(true);
  };

  const handleAllocateDate = (date) => {
    if (!date) return;

    if (selectedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Please select at least one raw material.",
      });
      return;
    }

    const allocatedDate = dayjs(date);

    const updated = data.map((item) =>
      selectedRows.includes(item.rawMaterialId)
        ? { ...item, date: allocatedDate }
        : item,
    );

    setData(updated);
    setOriginalData(updated);
    setHasUnsavedChanges(true);
  };


  const handleAllocateRemarks = ({ remarksEnglish, remarksHindi, remarksGujarati }) => {
  if (selectedRows.length === 0) {
    Swal.fire({ icon: "warning", title: "No Selection", text: "Please select at least one raw material." });
    return;
  }
  const updated = data.map((item) =>
    selectedRows.includes(item.rawMaterialId)
      ? { ...item, remarksEnglish, remarksHindi, remarksGujarati }
      : item
  );
  setData(updated);
  setOriginalData(updated);
  setHasUnsavedChanges(true);
};

const handleOpenRemarksModal = (item, index) => {
  setRemarksPopupData({ ...item });
  setRemarksPopupIndex(index);
  setIsRemarksPopupOpen(true);
};

const handleSaveRemarksPopup = (updatedRemarks) => {
  const updated = data.map((item, i) =>
    i === remarksPopupIndex
      ? { ...item, ...updatedRemarks }
      : item
  );
  setData(updated);
  setOriginalData((prev) =>
    prev.map((r) =>
      r.rawMaterialId === data[remarksPopupIndex]?.rawMaterialId
        ? { ...r, ...updatedRemarks }
        : r
    )
  );
  setHasUnsavedChanges(true);
  setIsRemarksPopupOpen(false);
};

  const renderModalData = () => {
    return (
      <div className="overflow-x-auto h-[60vh]">
        <div className="inline-block w-full align-middle">
          <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full divide-y divide-gray-200 h-[100px] overflow-x-scroll">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={
                        selectedRows.length === data.length && data.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    SRNO
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Raw Material
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Agency
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Place
                  </th>

                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-4 text-left text-xs font-bold text-gray-700 uppercase">
  Remarks (EN)
</th>
                </tr>
              </thead>

              <tbody>
                {tableLoading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8">
                      <Spin />
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-6 text-gray-500">
                      No materials found
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(item.rawMaterialId)}
                          onChange={() =>
                            toggleRowSelection(item.rawMaterialId)
                          }
                        />
                      </td>

                      <td className="px-4 py-3">{item.id}</td>

                      <td
                        className="px-4 py-2 text-xs text-gray-700 truncate max-w-[150px]"
                        title={item.material}
                      >
                        {item.material}
                      </td>

                      <td>
                        <select
                          className="select w-[200px]"
                          value={item.agency || ""}
                          onChange={(e) =>
                            handleAgencyChange(index, e.target.value)
                          }
                        >
                          <option value="">Select Agency</option>
                          {agencies.map((agency) => (
                            <option
                              key={agency.id}
                              value={agency.nameEnglish || agency.name}
                            >
                              {agency.nameEnglish || agency.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        <PlaceSelect
                          value={item.place || ""}
                          onChange={(value, placeId) => {
                            const updated = [...data];
                            updated[index].place = value;
                            updated[index].placeId = placeId || 0;
                            setData(updated);
                            setHasUnsavedChanges(true);
                          }}
                        />
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <DatePicker
                          selected={
                            item.date ? dayjs(item.date).toDate() : null
                          }
                          onChange={(date) => handleDateChange(index, date)}
                          showTimeSelect
                          timeFormat="hh:mm aa"
                          dateFormat="MM/dd/yyyy hh:mm "
                          className="border px-2 py-1 w-[180px]"
                          placeholderText="-"
                        />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 max-w-[160px] truncate" title={item.remarksEnglish || ""}>
  {item.remarksEnglish || "-"}
</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const handleEditRow = (row) => {
    setSelectedRow(row);
    setIsRawSidebar(true);
  };


  // For BAckup - in case we want to revert to old logic of updating row on sidebar save instead of inline edit
  // const handleSaveFromSidebar = (updatedRow) => {
  //   const updatedData = data.map((item) => {
  //     if (
  //       item.id === updatedRow.id ||
  //       item.rawMaterialId === updatedRow.rawMaterialId
  //     ) {
  //       const newFinalQty = updatedRow.qtyWasModified
  //         ? updatedRow.calculatedFinalQty
  //         : item.finalQty;

  //       const newTotal = newFinalQty * (item.basePricePerUnit || 0);

  //       return {
  //         ...item,
  //         ...updatedRow,
  //         rawMaterialId: item.rawMaterialId,
  //         id: item.id,
  //         finalQty: newFinalQty,
  //         total: newTotal,
  //       };
  //     }
  //     return item;
  //   });

  //   setData(updatedData);
  //   setHasUnsavedChanges(true);

  //   Swal.fire({
  //     icon: "success",
  //     title: "Updated",
  //     text: updatedRow.qtyWasModified
  //       ? `Row updated successfully. Final Qty updated to ${updatedRow.calculatedFinalQty.toFixed(2)} (including extra: ${updatedRow.extraQty || 0}). Changes will be saved when switching tabs or clicking Save.`
  //       : "Row updated successfully. Changes will be saved when switching tabs or clicking Save.",
  //     timer: 2500,
  //     showConfirmButton: false,
  //   });
  // };




 const handleSaveFromSidebar = (updatedRow) => {
  const updatedData = data.map((item) => {
    if (
      item.id !== updatedRow.id &&
      item.rawMaterialId !== updatedRow.rawMaterialId
    ) {
      return item;
    }

    if (!updatedRow.qtyWasModified) {
      return {
        ...item,
        ...updatedRow,
        rawMaterialId: item.rawMaterialId,
        id: item.id,
      };
    }

    const functions = updatedRow.eventRawMaterialFunctions || [];
    const hierarchy = item.unitHierarchyDto;
    const outsideUnitId = item.unitId; // ✅ outside table's unit — never changes

    // ── Convert any qty from any unit → outside table unit ──
    const convertToOutsideUnit = (qty, fromUnitId) => {
      const amount = parseFloat(qty) || 0;

      // Same unit, no conversion
      if (fromUnitId === outsideUnitId) return amount;
      if (!hierarchy) return amount;

      const baseUnitId = hierarchy.unitId;
      const baseEqValue = 1; // base is always 1 of itself

      // Build a flat map: unitId → value in BASE unit
      // e.g. KG=1 (base), gram=0.001 (1/1000)
      const unitToBase = {};
      unitToBase[baseUnitId] = 1;
      (hierarchy.children || []).forEach((child) => {
        // equivalentValue means: 1 base = equivalentValue child
        // so 1 child = 1/equivalentValue base
        unitToBase[child.unitId] = 1 / child.equivalentValue;
      });

      // Build reverse: unitId → value in each other unit
      // Convert: amount (fromUnit) → base → outsideUnit
      const amountInBase = amount * (unitToBase[fromUnitId] ?? 1);
      const outsideUnitInBase = unitToBase[outsideUnitId] ?? 1;

      // outsideUnitInBase = how much 1 outsideUnit is worth in base
      // so: amountInBase / outsideUnitInBase = amount in outsideUnit
      return amountInBase / outsideUnitInBase;
    };

    // ── Case 1: 2.5kg outside, sidebar 500→700g → 2.7kg ──
    // convertToOutsideUnit(700, gramId) → 700/1000 = 0.7 KG
    // total functions in KG = 0.7 (only one fn changed)
    // + extraQty (in outside unit) = rest
    // = 2.7 KG ✅

    // ── Case 2: 500g outside, sidebar 500→700g → 700g ──
    // convertToOutsideUnit(700, gramId) → 700g (same unit)
    // = 700g ✅

    // ── Case 3: 1000g outside, sidebar 1kg→2.5kg → 2500g ──
    // convertToOutsideUnit(2.5, kgId) → 2.5 * 1000 = 2500g
    // = 2500g ✅

    const totalFunctionQtyInOutsideUnit = functions.reduce((sum, fn) => {
      const fnUnitId = fn.unitId || outsideUnitId;
      const converted = convertToOutsideUnit(fn.qty, fnUnitId);
      return sum + converted;
    }, 0);

    const extraQty = parseFloat(updatedRow.extraQty) || 0;
    // extraQty assumed in outside unit
    const newFinalQty = totalFunctionQtyInOutsideUnit + extraQty;
    const newTotal = newFinalQty * (item.basePricePerUnit || 0);

    

    return {
      ...item,
      ...updatedRow,
      rawMaterialId: item.rawMaterialId,
      id: item.id,
      unitId: outsideUnitId,   
      unit: item.unit,        
      finalQty: newFinalQty,
      finalQtyInput: String(newFinalQty),
      total: newTotal,
      eventRawMaterialFunctions: updatedRow.eventRawMaterialFunctions,
    };
  });

  setData(updatedData);
  setOriginalData((prev) =>
    prev.map((r) => {
      const match = updatedData.find(
        (u) =>
          u.rawMaterialId === r.rawMaterialId ||
          (u.rowKey && u.rowKey === r.rowKey)
      );
      return match || r;
    })
  );
  setHasUnsavedChanges(true);

  const resultRow = updatedData.find(
    (u) => u.id === updatedRow.id || u.rawMaterialId === updatedRow.rawMaterialId
  );

  Swal.fire({
    icon: "success",
    title: "Updated",
    text: `Final Qty updated to ${resultRow?.finalQty?.toFixed(3)} ${resultRow?.unit}.`,
    timer: 2500,
    showConfirmButton: false,
  });
};

  const totalPrice = data.reduce(
    (acc, item) => acc + Number(item.total || 0),
    0,
  );

  const handleEventSelect = async (newEventId) => {
    // Check for unsaved changes
    if (hasUnsavedChanges) {
      const result = await Swal.fire({
        title: "Unsaved Changes",
        text: "You have unsaved changes. Do you want to save before switching events?",
        icon: "warning",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        denyButtonColor: "#6c757d",
        confirmButtonText: "Save & Switch",
        denyButtonText: "Switch Without Saving",
        cancelButtonText: "Cancel",
      });

      if (result.isConfirmed) {
        const success = await autoSave(false);
        if (!success) {
          Swal.fire({
            icon: "error",
            title: "Save Failed",
            text: "Could not save changes. Please try again.",
          });
          return;
        }
      } else if (
        result.isDismissed ||
        result.dismiss === Swal.DismissReason.cancel
      ) {
        return;
      }
    }

    // Start navigation
    setIsNavigating(true);
    setSelectedEventId(newEventId);
    setIsAllCustomerToogleOpen(false);

    // Navigate to new event
    navigate(`/raw-material-allocation/${newEventId}`);
  };

  if (isNavigating || (loading && !data.length)) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <img
          src={toAbsoluteUrl("/media/icons/loading.gif")}
          alt="Loading..."
          className="w-18 rounded-xl shadow-2xl"
        />
      </div>
    );
  }

  if (tableLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
        <img
          src={toAbsoluteUrl("/media/icons/loading.gif")}
          alt="Loading..."
          className="w-18 rounded-xl shadow-2xl"
        />
      </div>
    );
  }
  return (
    <Fragment>
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
                className={`btn btn-sm btn-primary ${isSotLocked === true
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-primary text-white cursor-pointer"}`}
                disabled={isSotLocked}
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
        <div className="gap-2 mb-3">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-6">
              <h2 className="text-xl text-black font-semibold">
                4. Raw Material Distribution
              </h2>

              <div className="flex gap-2">
  {permMenuPlanning.view && (
    <button
      onClick={() => navigate(`/menu-preparation/${eventId}`)}
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
    >
      <i className="ki-filled ki-menu text-primary text-md"></i>
      2. Menu Planning
    </button>
  )}

  {permMenuExecution.view && (
    <button
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
      onClick={() => navigate(`/menu-allocation/${eventId}`)}
    >
      <i className="ki-filled ki-gift text-primary text-md"></i>
      3. Menu Execution
    </button>
  )}

  {permAgencyDistribution.view && (
    <button
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
      onClick={() =>
        navigate(`/labour-and-other-management/${eventId}`)
      }
    >
      <i className="ki-filled ki-gift text-primary text-md"></i>
      5. Agency Distribution
    </button>
  )}

  {permPerDishCosting.view && (
    <button
      className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:border-gray-400 transition-colors"
      onClick={() => navigate(`/dish-costing/${eventId}`)}
    >
      <i className="ki-filled ki-grid text-primary text-md"></i>
      6. Per Dish-costing
    </button>
  )}
</div>
              <button
                onClick={() => navigate("/")}  // OR navigate('/calendar')
                className="btn border border-gray-300 text-gray-700 bg-white font-semibold hover:bg-gray-100"
              >
                <Calendar size={16} /> Back to Calendar
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

            
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-gray-200">
              
              <div className="flex flex-row items-end gap-2">
                {canAccessStock && (
                <button
                  type="button"
                  onClick={() => navigate(`/general-fix/${eventId}`)}
                  className="bg-orange-800 text-white text-sm px-5 py-2 rounded-md transition cursor-pointer"
                >
                  General Fix
                </button>
                )}
                {canAccessStock && (
                <button
                  onClick={handleGenerateSOT}
                  disabled={isSaving || isSotLocked === true}
                  className={`text-sm px-5 py-2 rounded-md transition ${
                    isSotLocked === true
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-orange-800 text-white cursor-pointer"
                  }`}
                  title={isSotLocked === false ? "Not available" : "Report"}
                >
                    {isSaving ? (
                      <>
                        <i className="ki-filled ki-loading animate-spin"></i>
                        <FormattedMessage
                          id="COMMON.GENERATING"
                          defaultMessage="Generating..."
                        />
                      </>
                    ) : (
                      <FormattedMessage
                        id="COMMON.GENERATE_SOT"
                        defaultMessage="Generate SOT"
                      />
                    )}
                  </button>
                )}

                <button
                  onClick={openSelectMenureport}
                  className="bg-[#05B723] text-white text-sm px-5 py-2 rounded-md transition"
                  title="Report"
                >
                  Report
                </button>
                <button
                  onClick={handleSave}
                  disabled={!hasUnsavedChanges || isSaving || isSotLocked === true}
                  className={`text-sm px-5 py-2 rounded-md transition flex items-center gap-2 ${
                    hasUnsavedChanges && !isSaving && isSotLocked !== true
                      ? "bg-primary text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  title={isSotLocked === true ? "Not available" : hasUnsavedChanges ? "Save" : "No changes to save"}
                >
                  {isSaving ? (
                    <>
                      <i className="ki-filled ki-loading animate-spin"></i>
                      <FormattedMessage
                        id="COMMON.SAVING"
                        defaultMessage="Saving..."
                      />
                    </>
                  ) : (
                    <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap mb-3 border-gray-200 gap-1 rounded-lg">
          {tabs.length === 0 ? (
            <p className="text-gray-500 text-sm px-3">
              <FormattedMessage
                id="RAW_MATERIAL_ALLOCATION.NO_CATEGORY_FOUND"
                defaultMessage="No categories found"
              />
            </p>
          ) : (
            tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabSwitch(tab)}
                className={`px-4 py-2 text-sm font-medium border border-gray-200 ${
                  activeTab === tab.value
                    ? "bg-primary text-white"
                    : "bg-gray-50 text-gray-600"
                }`}
              >
                {tab.label}
              </button>
            ))
          )}
        </div>

        <div className="flex justify-between mb-4">
          <div className="flex w-fit items-center gap-3">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "COMMON.SEARCH",
                  defaultMessage: "Search Items",
                })}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            {/* ADD THIS BUTTON */}
            <button
              className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
              onClick={handleAddNewRow}
            >
              <i className="ki-filled ki-plus"></i>
              <FormattedMessage
                id="RAW_MATERIAL_ALLOCATION.ADD_NEW_ROW"
                defaultMessage="Add New Row"
              />
            </button>
            <button
              className="bg-primary text-white text-sm px-4 py-2 rounded-lg"
              onClick={handleModalOpen}
            >
              <FormattedMessage
                id="RAW_MATERIAL_ALLOCATION.ADD_AGENCY_PLACE_DATE"
                defaultMessage="+ Supplier Allocation"
              />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow border border-gray-200">
          <div className="max-h-[380px] overflow-y-auto ">
            <table className="min-w-full table-fixed text-sm text-gray-700">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold sticky top-0 z-1">
              <tr>
  <th className="w-16 px-4 py-3 text-left">
    <FormattedMessage id="COMMON.ID" defaultMessage="ID" />
  </th>

  <th className="w-48 px-4 py-3 text-left">
    <FormattedMessage
      id="COMMON.RAW_MATERIAL"
      defaultMessage="Raw Material"
    />
  </th>

  <th className="w-24 px-4 py-3 text-left">
    <FormattedMessage id="COMMON.QTY" defaultMessage="Qty" />
  </th>

  <th className="w-28 px-4 py-3 text-left">
    <FormattedMessage
      id="COMMON.FINAL_QTY"
      defaultMessage="Final Qty"
    />
  </th>

  <th className="w-32 px-4 py-3 text-left">
    <FormattedMessage id="COMMON.UNIT" defaultMessage="Unit" />
  </th>

  <th className="w-40 px-4 py-3 text-left">
    <FormattedMessage id="COMMON.AGENCY" defaultMessage="Agency" />
  </th>

  <th className="w-36 px-4 py-3 text-left">
    <FormattedMessage id="COMMON.PLACE" defaultMessage="Place" />
  </th>

  <th className="w-52 px-4 py-3 text-left">
    <FormattedMessage id="COMMON.DATE" defaultMessage="Date" />
  </th>

  <th className="w-44 px-4 py-3 text-left">
    <FormattedMessage id="COMMON.REMARKS" defaultMessage="Remarks" />
  </th>

  <th className="w-28 px-4 py-3 text-left">
    <FormattedMessage id="COMMON.TOTAL" defaultMessage="Total" />
  </th>

  <th className="w-24 px-4 py-3 text-center">
    <FormattedMessage id="COMMON.ACTION" defaultMessage="Action" />
  </th>
</tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8">
                      <Spin />
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-6 text-gray-500">
                      No materials found
                    </td>
                  </tr>
                ) : (
                  data.map((item, index) => (
                    <tr
                      key={index}
                      className={`border-b border-gray-200 ${item.isNewRow ? "bg-green-50" : ""}`}
                    >
                      <td className="px-4 py-3">{item.id}</td>

                      <td className="px-4 py-2 text-xs text-gray-700">
                        {item.isNewRow ? (
                          <input
                            type="text"
                            value={item.material}
                            onChange={(e) =>
                              handleChange(index, "material", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded px-2 py-2"
                            placeholder="Enter material name"
                          />
                        ) : (
                          <span
                            className="truncate max-w-[150px] block"
                            title={item.material}
                          >
                            {item.material}
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {item.isNewRow ? (
                          <input
                            type="tel"
                            value={item.qty}
                            onChange={(e) =>
                              handleChange(index, "qty", e.target.value)
                            }
                            className="w-full border border-gray-300 rounded px-2 py-1"
                            placeholder="0"
                          />
                        ) : (
                          item.qty
                        )}
                      </td>

                      {/* <td className="px-4 py-3">
                        <input
                          type="tel"
                          value={item.finalQty}
                          onChange={(e) =>
                            handleChange(index, "finalQty", e.target.value)
                          }
                          className="w-[80px] border border-gray-300 rounded px-2 py-1"
                        />
                      </td> */}
                      <td className="px-4 py-3">
                        <input
                          type="tel"
                          step="any"
                          value={
                            item.finalQtyInput !== undefined
                              ? item.finalQtyInput
                              : item.finalQty
                          }
                          

onChange={(e) => {
  const raw = e.target.value;
  const updated = [...data];
  updated[index].finalQtyInput = raw;
  updated[index].finalQty = raw === "" ? 0 : parseFloat(raw) || 0;
  updated[index].total = updated[index].finalQty * (updated[index].basePricePerUnit || 0);
  setData(updated);
  const row = updated[index];
  setOriginalData((prev) =>
    prev.map((r) => {
      const isSameRow = row.rowKey   
        ? r.rowKey === row.rowKey
        : r.rawMaterialId === row.rawMaterialId;
      return isSameRow ? { ...row } : r;
    })
  );
  setHasUnsavedChanges(true);
}}                     onFocus={(e) => {
                            
                            if (item.finalQty === 0) {
                              const updated = [...data];
                              updated[index].finalQtyInput = "";
                              setData(updated);
                            }
                          }}
                          onBlur={(e) => {
                            
                            if (e.target.value === "") {
                              const updated = [...data];
                              updated[index].finalQtyInput = "0";
                              updated[index].finalQty = 0;
                              setData(updated);
                            }
                          }}
                          className="w-[80px] border border-gray-300 rounded px-2 py-1"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.unitId}
                          onChange={(e) =>
                            handleChange(
                              index,
                              "unitId",
                              Number(e.target.value),
                            )
                          }
                          className="w-[100px] border border-gray-300 rounded px-2 py-1 text-xs"
                        >
                          {buildUnitOptions(
                            item.units,
                            item.unitHierarchyDto,
                            item.unitId,
                            item.unit,
                          ).map((u) => (
                            <option key={u.value} value={u.value}>
                              {u.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-4 py-3">
                        {item.isNewRow ? (
                          <select
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                            value={item.agency || ""}
                            onChange={(e) =>
                              handleAgencyChange(index, e.target.value)
                            }
                          >
                            <option value="">Select Agency</option>
                            {agencies.map((agency) => (
                              <option
                                key={agency.id}
                                value={agency.nameEnglish || agency.name}
                              >
                                {agency.nameEnglish || agency.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          item.agency
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {item.isNewRow ? (
                          <PlaceSelect
                            value={item.place || ""}
                            onChange={(value, placeId) => {
                              const updated = [...data];
                              updated[index].place = value;
                              updated[index].placeId = placeId || 0;
                              setData(updated);
                              setHasUnsavedChanges(true);
                            }}
                          />
                        ) : (
                          item.place
                        )}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        {item.isNewRow ? (
                          // <DatePicker
                          //   selected={item.date ? dayjs(item.date).toDate() : null}
                          //   onChange={(date) => handleDateChange(index, date)}
                          //   showTimeSelect
                          //   timeFormat="hh:mm aa"
                          //   dateFormat="dd/MM/yyyy hh:mm aa"
                          //   className="border px-2 py-1 w-[180px]"
                          //   placeholderText="Select date"
                          // />
                          <span className="text-xs text-gray-400 italic"></span>
                        ) : item.date ? (
                          dayjs(item.date).format("DD/MM/YYYY hh:mm A")
                        ) : (
                          "-"
                        )}
                      </td>

                      <td className="px-4 py-3">
  <div className="flex items-center gap-2">
    <span
      className="text-xs text-gray-600 truncate max-w-[120px] block"
      title={item.remarksEnglish || ""}
    >
      {item.remarksEnglish || "-"}
    </span>
    <button
      onClick={() => handleOpenRemarksModal(item, index)}
      className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex-shrink-0"
      title="View / Edit Remarks"
    >
      <i className="ki-filled ki-notepad-edit text-xs"></i>
    </button>
  </div>
</td>

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
                          {/* {item.isNewRow && ( */}
                            <i
                              className="ki-filled ki-trash text-red-500 cursor-pointer hover:text-red-700"
                              onClick={() => handleDeleteRow(index)}
                              title="Delete"
                            ></i>
                          {/* )} */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center px-4 py-4 border-t bg-gray-50">
            <div className="text-sm font-medium">
              Total Price:{" "}
              <span className="font-semibold text-blue-700">
                {totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleSave}
              disabled={!hasUnsavedChanges || isSaving || isSotLocked === true}
              className={`text-sm px-5 py-2 rounded-md transition flex items-center gap-2 ${
                hasUnsavedChanges && !isSaving && isSotLocked !== true
                  ? "bg-primary text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              title={isSotLocked === true ? "Not available" : hasUnsavedChanges ? "Save" : "No changes to save"}
            >
              {isSaving ? (
                <>
                  <i className="ki-filled ki-loading animate-spin"></i>
                  <FormattedMessage
                    id="COMMON.SAVING"
                    defaultMessage="Saving..."
                  />
                </>
              ) : (
                <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
              )}
            </button>
          </div>
        </div>

        <AddGrossary
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          agencies={agencies}
          loading={loading}
          modalData={renderModalData}
          onAllocateAgency={handleAllocateAgency}
          onAllocatePlace={handleAllocatePlace}
          onAllocateDate={handleAllocateDate}
          FetchSuplier={fetchAgencies}
          onAllocateRemarks={handleAllocateRemarks}
        />

        <SidebarRawMaterial
          open={isRawSidebar}
          onClose={() => setIsRawSidebar(false)}
          selectedRow={selectedRow}
          onSave={handleSaveFromSidebar}
          sidebarunit={unit}
        />
        <MenuReport
          isModalOpen={isMenuReport}
          setIsModalOpen={setIsMenuReport}
          eventId={eventId}
        />
        <SelectMenureport
          isSelectMenureport={isSelectMenureport}
          setIsSelectMenuReport={setIsSelectMenuReport}
          eventId={eventId}
          onConfirm={(reportType) => {
            setIsSelectMenuReport(false);
            setSelectedReportType(reportType);
            setMenuReportEventId(eventId);
            setIsMenuReport(true);
          }}
          mode={mode}
        />
        <AllCustomerToogle
          isModalOpen={isAllCustomerToogleOpen}
          setIsModalOpen={setIsAllCustomerToogleOpen}
          onEventSelect={handleEventSelect}
        />

        <AddRawMaterial
          isOpen={isAddMaterialModal}
          onClose={() => setIsAddMaterialModal(false)}
          onSave={handleSaveNewMaterial}
          agencies={agencies}
          unit={unit}
          eventFunctions={eventFunctions}
          existingMaterials={originalData}
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


   
{isRemarksPopupOpen && remarksPopupData && (
  <RemarksPopup
    data={remarksPopupData}
    onClose={() => setIsRemarksPopupOpen(false)}
    onSave={handleSaveRemarksPopup}
  />
)}
    </Fragment>
  );
};

export default RawMaterialAllocation;
