import { useEffect, useRef, useState } from "react";
import { Input, Tooltip } from "antd";
import ReactSelect from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import { Plus, X, MapPin } from "lucide-react";
import { createPortal } from "react-dom";
import FunctionTypeDropdown from "@/components/dropdowns/FunctionTypeDropdown";
import AddFunctionType from "@/partials/modals/add-function-type/AddFunctionType";
import AddNotes from "@/partials/modals/add-notes/AddNotes";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GetAllFunctionsByUserId,
  deleteFunction,
  GetVenueType,
  GetAllBanquet,                  
  AvailabilityCheckByFunction,   
  Translateapi,
  AvailabilityCheck,
  GetCustomPackageapi,
  getpriceininfunctionadd ,
  GetEventType,   
} from "@/services/apiServices";
import { FormattedMessage } from "react-intl";
import Swal from "sweetalert2";
import { useLanguage } from "@/i18n";
import { useModuleAccess } from "../../../hooks/useModuleAccess";
import { useLocation } from "react-router-dom";
import { useBanquetPermission } from "../../../hooks/useBanquetPermission";
import { usePermission } from "../../../hooks/usePermission";



const VenueNamesModal = ({ isOpen, onClose, venueEnglish, venueHindi, venueGujarati, onSave, onTranslatingChange = () => {} }) => {
  const [english, setEnglish] = useState("");
  const [hindi, setHindi] = useState("");
  const [gujarati, setGujarati] = useState("");
  const [isTranslating, setIsTranslating] = useState(false); // ← add this
  const autoSaveTimer = useRef(null);
  const isManualEdit = useRef(false); 
// ✅ Event Type list (raw, with nameEnglish/nameGujarati/nameHindi) — used to auto-match a Function
const [eventTypeRawList, setEventTypeRawList] = useState([]);
const autoMatchedEventTypeRef = useRef(null);


  useEffect(() => {
    if (isOpen) {
      setEnglish(venueEnglish || "");
      setHindi(venueHindi || "");
      setGujarati(venueGujarati || "");
      setIsTranslating(false);
      isManualEdit.current = false;
    }
  }, [isOpen, venueEnglish, venueHindi, venueGujarati]);

  
   useEffect(() => {
    if (!isOpen) return;
    if (isTranslating) return;
    if (isManualEdit.current) return;  
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      const trimmedEnglish = english.trim();
      onSave({
        english: trimmedEnglish,
        hindi: trimmedEnglish ? hindi : "",
        gujarati: trimmedEnglish ? gujarati : "",
      });
    }, 400);
    return () => clearTimeout(autoSaveTimer.current);
  }, [english, hindi, gujarati, isOpen, isTranslating]);
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-5 w-[350px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Edit Venue Names</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block mb-1">
              English
            </label>
            <Input
              value={english}
              onChange={async (e) => {
                const value = e.target.value;
                setEnglish(value);
                if (!value.trim()) {
                  setHindi("");
                  setGujarati("");
                  setIsTranslating(false);
                  return;
                }
                setIsTranslating(true); 
                onTranslatingChange(true); 
                try {
                  const res = await Translateapi(value);
                  const translations = res?.data || {};
                  setHindi(translations.hindi || "");
                  setGujarati(translations.gujarati || "");
                } catch (err) {
                  console.error("Translation error:", err);
                } finally {
                  setIsTranslating(false); 
                  onTranslatingChange(false); 
                }
              }}
              placeholder="English Name"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block mb-1">
              Hindi
            </label>
            <Input 
              value={hindi} 
              onChange={(e) => {
                setHindi(e.target.value);
                isManualEdit.current = true;  // ← ADD THIS
              }} 
              placeholder="Hindi Name" 
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-900 uppercase tracking-wider block mb-1">
              Gujarati
            </label>
            <Input 
              value={gujarati} 
              onChange={(e) => {
                setGujarati(e.target.value);
                isManualEdit.current = true;  // ← ADD THIS
              }} 
              placeholder="Gujarati Name" 
            />
          </div>
          {isTranslating && (
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <span className="animate-spin inline-block w-3 h-3 border-2 border-gray-300 border-t-gray-500 rounded-full"></span>
              Translating...
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm">
            Cancel
          </button>
                    <button
            disabled={isTranslating}
            onClick={() => {
              const trimmedEnglish = english.trim();
              onSave({
                english: trimmedEnglish,
                hindi: trimmedEnglish ? hindi : "",
                gujarati: trimmedEnglish ? gujarati : "",
              });
              onClose();
            }}
            className={`flex-1 py-2 rounded-lg text-white text-sm font-medium transition ${
              isTranslating
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#005BA8] hover:bg-[#004a8c]"
            }`}
          >
            Save
          </button>

        </div>
      </div>
    </div>,
    document.body,
  );
};


const SortableRow = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, cursor: "default" };

  return (
    <tr ref={setNodeRef} style={style}>
      <td className="p-1.5 border-b border-gray-200 cursor-grab w-8" {...attributes} {...listeners}>
        <span className="text-gray-400 hover:text-gray-600" title="Drag to reorder">⠿</span>
      </td>
      {children}
    </tr>
  );
};


const getLangConfig = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth-storage"));
    const lang = auth?.state?.user?.lang || "Gujarati";
    const langMap = {
      Gujarati: { apiKey: "gujarati" },
      Tamil: { apiKey: "ta" },
      Telugu: { apiKey: "te" },
      Malayalam: { apiKey: "ml" },
      Marathi: { apiKey: "mr" },
    };
    return langMap[lang] || langMap["Gujarati"];
  } catch {
    return { apiKey: "gujarati" };
  }
};



const BanquetSelect = ({ value, options, onChange, menuPortalTarget }) => {
  const selectedValues = (Array.isArray(value) ? value : value ? [value] : [])
    .map((id) => {
      const found = options.find((b) => String(b.value) === String(id));
      return found ? { value: String(found.value), label: found.label } : null;
    })
    .filter(Boolean);

  return (
    <ReactSelect
      isMulti
      options={options.map((opt) => ({ value: String(opt.value), label: opt.label }))}
      value={selectedValues}
      onChange={(selected) => onChange((selected || []).map((s) => s.value))}
      placeholder="Select Hall(s)"
      menuPortalTarget={menuPortalTarget || document.body}
      closeMenuOnSelect={false}
      hideSelectedOptions={false}
      controlShouldRenderValue={false}  // ← hides all tags from control
      styles={{
        control: (base) => ({
          ...base,
          minHeight: "34px",
          fontSize: "12px",
          borderColor: "#d1d5db",
          borderRadius: "6px",
          cursor: "pointer",
          boxShadow: "none",
          "&:hover": { borderColor: "#005BA8" },
        }),
        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        menu: (base) => ({ ...base, fontSize: "12px" }),
        option: (base, state) => ({
          ...base,
          fontSize: "12px",
          backgroundColor: state.isSelected ? "#e0edff" : state.isFocused ? "#f0f7ff" : "white",
          color: state.isSelected ? "#005BA8" : "#111827",
          fontWeight: state.isSelected ? 600 : 400,
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          "::before": {
            content: state.isSelected ? '"✓"' : '""',
            color: "#005BA8",
            fontWeight: 700,
            width: "12px",
            display: "inline-block",
          },
        }),
        placeholder: (base) => ({ ...base, fontSize: "12px", color: "#9ca3af" }),
        indicatorSeparator: () => ({ display: "none" }),
        dropdownIndicator: (base) => ({ ...base, padding: "0 6px", color: "#9ca3af" }),
      }}
      // Show summary text in control instead of tags
      components={{
        ValueContainer: ({ children, getValue }) => {
          const selected = getValue();
          return (
            <div style={{ display: "flex", alignItems: "center", padding: "2px 8px", flex: 1 }}>
              {selected.length === 0 ? (
                <span style={{ color: "#9ca3af", fontSize: "12px" }}>Select Hall(s)</span>
              ) : (
                <span style={{ color: "#005BA8", fontSize: "12px", fontWeight: 600 }}>
                  {selected.length === 1
                    ? selected[0].label
                    : `${selected.length} halls selected`}
                </span>
              )}
              {/* keep the hidden input react-select needs internally */}
              {children[children.length - 1]}
            </div>
          );
        },
      }}
    />
  );
};


const FunctionsDetails = ({
  formData,
  setFormData,
  eventStartDateTime,
  eventEndDateTime,
  errors = {},
  eventId,
  originalShiftId,
   setErrors,
   shiftRefreshTrigger,
   skipFunctionsStep = false,
    onTranslatingChange = () => {},
   prefillAppliedRef, 
}) => {
  const { isRTL, locale } = useLanguage();
  const [showFunctionModal, setShowFunctionModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [options, setOptions] = useState([]);
  const [selectedFunctionIndex, setSelectedFunctionIndex] = useState(null);
  const [venueList, setVenueList] = useState([]);
  const [selectedVenueName, setSelectedVenueName] = useState("");
  const [activeRowIndex, setActiveRowIndex] = useState(null);
  const [venueModalOpen, setVenueModalOpen] = useState(false);
  const [venueModalIndex, setVenueModalIndex] = useState(null);
const [banquetNotesModal, setBanquetNotesModal] = useState({ open: false, index: null });
  const [banquetList, setBanquetList] = useState([]);
  const loadedRowsRef = useRef(new Set());
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");
  const langConfig = getLangConfig();
    const initialShiftsLoadedRef = useRef(false);

    const { hasModuleAccess } = useModuleAccess();
const canAccessBanquet = hasModuleAccess("Banquet") && 
  formData.banquetId && 
  formData.banquetId !== "ODC";
  const canShowPackage = hasModuleAccess("Banquet");
  const [packageList, setPackageList] = useState([]);
  const location = useLocation();
const prefill = location.state || {};
const localPrefillRef = useRef(false);
const functionPrefillRef = prefillAppliedRef || localPrefillRef;

const { filterHalls } = useBanquetPermission();
const filteredBanquetList = filterHalls(banquetList);

const canAccessEventFlow = hasModuleAccess("Event Flow");

const backDatePermission = usePermission("Lock Back Date Entry");
const isBackDateLocked = backDatePermission.add || backDatePermission.edit;
const backDateMin = isBackDateLocked ? new Date() : undefined;

const defaultRowSeededRef = useRef(false);
const [eventTypeRawList, setEventTypeRawList] = useState([]);
const autoMatchedEventTypeRef = useRef(null);

const currentUserId = localStorage.getItem("userId");
const CAN_EDIT_RATE_WITH_PACKAGE = currentUserId == 356; 


  useEffect(() => {
    const storedLang = localStorage.getItem("lang") || "en";
    setLang(storedLang);
  }, [isRTL, locale]);

useEffect(() => {
    if (functionPrefillRef.current) return;
    if (!prefill.shiftId || !prefill.banquetHallId) return;
    if (!formData.eventFunction?.length && canAccessEventFlow) return;
    if (!formData.eventFunction?.length) return;

    functionPrefillRef.current = true;

    const baseDate = prefill.event_date ? dayjs(prefill.event_date) : null;
    const shiftStart = prefill.shiftStartTime
      ? dayjs(prefill.shiftStartTime, ["HH:mm", "hh:mm A"])
      : null;
    const shiftEnd = prefill.shiftEndTime
      ? dayjs(prefill.shiftEndTime, ["HH:mm", "hh:mm A"])
      : null;

    const withTime = (time) =>
      baseDate
        ? (time ? baseDate.hour(time.hour()).minute(time.minute()) : baseDate).format(
            "DD/MM/YYYY hh:mm A",
          )
        : null;

    const newStart = withTime(shiftStart);
    const newEnd = withTime(shiftEnd);

    setFormData((prev) => ({
      ...prev,
      eventFunction: prev.eventFunction.map((func, i) => {
        if (i !== 0) return func;
        return {
          ...func,
          banquetHallId: prefill.banquetHallId,
          shiftId: String(prefill.shiftId),
          originalShiftId: String(prefill.shiftId),
          functionStartDateTime: newStart || func.functionStartDateTime,
          functionEndDateTime: newEnd || func.functionEndDateTime,
        };
      }),
    }));

    fetchShiftOptionsForRow(
      0,
      prefill.banquetHallId,
      newStart || (baseDate ? baseDate.format("DD/MM/YYYY hh:mm A") : null),
      String(prefill.shiftId),
    );
  }, [formData.eventFunction?.length, banquetList.length]);


useEffect(() => {
  const fetchPackages = async () => {
    try {
      const Id = localStorage.getItem("userId");
      const res = await GetCustomPackageapi(Id);
      const items =
        res?.data?.data?.["Package Details"] ||
        res?.data?.data?.packages ||
        res?.data?.data ||
        [];
      const formatted = Array.isArray(items)
        ? items
            .filter((item) => item && item.id != null)
            .map((item) => ({
              value: item.id,
              label: item.nameEnglish || item.name || `Package ${item.id}`,
              price: item.price ?? "",
            }))
        : [];
      setPackageList(formatted);
    } catch (error) {
      console.error("Error fetching packages:", error);
    }
  };
  fetchPackages();
}, []);
useEffect(() => {
  const fetchEventTypesRaw = async () => {
    try {
      const Id = localStorage.getItem("userId");
      const res = await GetEventType(Id);
      const items = res?.data?.data?.["EventTypes Details"] || [];
      setEventTypeRawList(items);
    } catch (err) {
      console.error("Error fetching event types for auto-match:", err);
    }
  };
  fetchEventTypesRaw();
}, []);

  useEffect(() => {
  if (!shiftRefreshTrigger) return; 

  formData.eventFunction?.forEach((func, index) => {
    if (func.banquetHallId && func.banquetHallId !== "") {
      fetchShiftOptionsForRow(index, func.banquetHallId);
    }
  });
}, [shiftRefreshTrigger]);



useEffect(() => {
  if (initialShiftsLoadedRef.current) return;
  if (!formData.eventFunction?.length) return;

  const hasExistingRows = formData.eventFunction.some(
    (f) => f.eventFuncId && f.eventFuncId !== 0
  );
  if (!hasExistingRows) return;

  initialShiftsLoadedRef.current = true;

  formData.eventFunction.forEach((func, index) => {
    if (func.banquetHallId && func.banquetHallId !== "") {
      fetchShiftOptionsForRow(index, func.banquetHallId);
    }
  });
}, [formData.eventFunction.length]);

useEffect(() => {
  formData.eventFunction?.forEach((func, index) => {
    const hasBanquet =
      Array.isArray(func.banquetHallId)
        ? func.banquetHallId.length > 0
        : !!func.banquetHallId;
    const hasNoOptions = !func.shiftOptions || func.shiftOptions.length === 0;

    if (hasBanquet && hasNoOptions) {
      const currentDate =
        func?.functionStartDateTime ||
        func?.bookingDate ||
        eventStartDateTime ||
        "";
      fetchShiftOptionsForRow(index, func.banquetHallId, currentDate);
    }
  });
}, [formData.eventFunction?.map((f) =>
    Array.isArray(f.banquetHallId) ? f.banquetHallId.join("-") : f.banquetHallId
  ).join(",")
]);


useEffect(() => {
  if (!originalShiftId) return; // event-level originalShiftId, skip if null

  setFormData((prev) => ({
    ...prev,
    eventFunction: prev.eventFunction.map((func) => ({
      ...func,
     
      originalShiftId: func.originalShiftId || originalShiftId,
    })),
  }));
}, [originalShiftId]);

const prevBanquetIdRef = useRef(formData.banquetId);

useEffect(() => {
  const prevBanquet = prevBanquetIdRef.current;
  const newBanquet = formData.banquetId;

  if (prevBanquet === newBanquet) return;
  prevBanquetIdRef.current = newBanquet;

  if (!newBanquet || newBanquet === "ODC") return;

  setFormData((prev) => ({
    ...prev,
    eventFunction: prev.eventFunction.map((func) => ({
      ...func,
      banquetHallId: [String(newBanquet)],
      shiftId: "",
      shiftOptions: [],       // ← empty so watcher effect fires
      shiftAvailabilityByHall: [],
      originalShiftId: "",
    })),
  }));
  // ← no direct fetchShiftOptionsForRow here either
}, [formData.banquetId]);
 



  const getLocalizedField = (item, fieldName) => {
    if (!item) return "";
    switch (lang) {
      case "hi": return item[`${fieldName}Hindi`] || item[`${fieldName}English`] || "";
      case "gu": return item[`${fieldName}Gujarati`] || item[`${fieldName}English`] || "";
      default: return item[`${fieldName}English`] || "";
    }
  };

  const activeVenue =
    activeRowIndex !== null
      ? formData.eventFunction?.[activeRowIndex]?.function_venue
      : null;

 // ── Translate active venue ────────────────────────────────────────────────
const venueManualEditRef = useRef({});

useEffect(() => {
    if (activeRowIndex === null) return;
    
    // Skip if this row was manually edited via the venue modal
    if (venueManualEditRef.current[activeRowIndex]) return;
    
    // Also check current formData
    const currentFunc = formData.eventFunction?.[activeRowIndex];
    if (currentFunc?.venueManualEdit) {
      venueManualEditRef.current[activeRowIndex] = true;
      return;
    }
    
    if (!activeVenue?.trim()) {
      setFormData((prev) => {
        const updatedArray = [...prev.eventFunction];
        updatedArray[activeRowIndex] = {
          ...updatedArray[activeRowIndex],
          function_venueGujarati: "",
          function_venueHindi: "",
        };
        return { ...prev, eventFunction: updatedArray };
      });
      return;
    }
    onTranslatingChange(true);
     const timer = setTimeout(() => {
      Translateapi(activeVenue)
        .then((res) => {
          const translations = res?.data || {};
          setFormData((prev) => {
            const updatedArray = [...prev.eventFunction];
            if (updatedArray[activeRowIndex]?.venueManualEdit) return prev;
            updatedArray[activeRowIndex] = {
              ...updatedArray[activeRowIndex],
              function_venueGujarati: translations.gujarati || "",
              function_venueHindi: translations.hindi || "",
            };
            return { ...prev, eventFunction: updatedArray };
          });
        })
        .catch((err) => console.error("Venue translation error:", err))
        .finally(() => {
          onTranslatingChange(false); 
        });
    }, 500);
    return () => clearTimeout(timer);
}, [activeVenue, activeRowIndex]);


  const getLocalizedVenueName = (venue) => {
    if (!venue) return "";
    return getLocalizedField(venue, "name");
  };

  // ── Fetch venues ──────────────────────────────────────────────────────────
useEffect(() => {
    const fetchVenues = async () => {
      try {
        const Id = localStorage.getItem("userId");
        const res = await GetVenueType(true, Id);
        const venueArray = res?.data?.data?.["Venue Details"] || [];
        setVenueList(venueArray);
        if (formData.venueId) {
          const selectedVenue = venueArray.find((v) => v.id === formData.venueId);
          if (selectedVenue) {
            setSelectedVenueName(getLocalizedVenueName(selectedVenue));
          }
        } else {
          // ✅ CRITICAL FIX: Clear selectedVenueName when venue is removed from event details
          setSelectedVenueName("");
        }
      } catch (error) {
        console.error("❌ Error fetching venues:", error);
      }
    };
    fetchVenues();
  }, [formData.venueId, lang]);


  // ── ✅ NEW: Fetch banquets ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchBanquets = async () => {
      try {
        const Id = localStorage.getItem("userId");
        const res = await GetAllBanquet(Id);
        const items =
          res?.data?.data?.["Banquet Details"] ||
          res?.data?.data?.banquetHalls ||
          res?.data?.data ||
          [];
        const formatted = Array.isArray(items)
          ? items
              .filter((item) => item && item.id != null)
              .map((item) => ({
                value: item.id,
                label: item.hallName || item.name || `Banquet ${item.id}`,
              }))
          : [];
        setBanquetList(formatted);
      } catch (error) {
        console.error("Error fetching banquets:", error);
      }
    };
    fetchBanquets();
  }, []);

const fetchShiftOptionsForRow = async (index, banquetId, explicitDate = null, overrideOriginalShiftId = undefined) => {
  const ids = Array.isArray(banquetId) ? banquetId : banquetId ? [banquetId] : [];
  if (ids.length === 0) {
    setFormData((prev) => {
      const updated = [...prev.eventFunction];
      const isExisting = updated[index]?.eventFuncId && updated[index].eventFuncId !== 0;
      updated[index] = {
        ...updated[index],
        shiftOptions: [],
        shiftAvailabilityByHall: [], // ← clear hall data too
        shiftId: isExisting ? updated[index].shiftId : "",
      };
      return { ...prev, eventFunction: updated };
    });
    return;
  }

  try {
    const userId = localStorage.getItem("userId");
    const rawDate = explicitDate || eventStartDateTime || "";
    const bookingDate = rawDate
      ? dayjs(rawDate, ["DD/MM/YYYY hh:mm A", "DD/MM/YYYY"]).format("DD/MM/YYYY")
      : "";
    const currentEventId = eventId ? Number(eventId) : 0;

    const res = await AvailabilityCheck(userId, bookingDate, ids, currentEventId);
    // API returns { date, halls: [{ hallId, hallName, shifts: [...] }] }
    const hallsData = res?.data?.data?.halls || [];

    // Build shiftOptions: a shift is selectable if ALL halls have it available
    const shiftMap = {};
    hallsData.forEach((hall) => {
      (hall.shifts || []).forEach((shift) => {
        if (!shiftMap[shift.shiftId]) {
          shiftMap[shift.shiftId] = {
            value: shift.shiftId,
            shiftName: shift.shiftName,
            startTime: shift.startTime,
            endTime: shift.endTime,
            isAvailable: shift.isAvailable,
            bookedInHalls: [],
          };
        }
        if (!shift.isAvailable) {
          shiftMap[shift.shiftId].isAvailable = false;
          shiftMap[shift.shiftId].bookedInHalls.push({
            hallName: hall.hallName,
            eventNo: shift.bookedByEventNo,
            partyName: shift.bookedByPartyName,
          });
        }
      });
    });

    const formatted = Object.values(shiftMap);

    setFormData((prev) => {
      const updated = [...prev.eventFunction];
      const effectiveOriginalShiftId =
        overrideOriginalShiftId !== undefined
          ? overrideOriginalShiftId
          : updated[index]?.originalShiftId;

      updated[index] = {
        ...updated[index],
        shiftOptions: formatted,
        shiftAvailabilityByHall: hallsData, // store raw hall data
        originalShiftId: effectiveOriginalShiftId,
      };
      return { ...prev, eventFunction: updated };
    });
  } catch (err) {
    console.error("Error fetching shift availability:", err);
  }
};

const handleFunctionBanquetChange = async (index, banquetIds) => {
  const ids = Array.isArray(banquetIds) ? banquetIds : banquetIds ? [banquetIds] : [];
  const currentFunc = formData.eventFunction[index];
  const currentDate =
    currentFunc?.functionStartDateTime ||
    currentFunc?.bookingDate ||
    eventStartDateTime ||
    "";

  const fullVenue = selectedVenueName
    ? venueList.find(
        (v) =>
          v.nameEnglish === selectedVenueName ||
          v.nameHindi === selectedVenueName ||
          v.nameGujarati === selectedVenueName
      )
    : null;

  setFormData((prev) => {
    const updated = [...prev.eventFunction];
    updated[index] = {
      ...updated[index],
      banquetHallId: ids,
      shiftId: "",
      shiftOptions: [],
      originalShiftId: "",
      function_venue: ids.length ? "" : "",
      function_venueGujarati: ids.length ? "" : (fullVenue?.nameGujarati || ""),
      function_venueHindi: ids.length ? "" : (fullVenue?.nameHindi || ""),
      venueManualEdit: false,
      venueTouched: true,
    };
    return { ...prev, eventFunction: updated };
  });
  // ✅ Re-fetch price if package + pax already set
  const packageId = currentFunc?.customPackageId;
  const pax = currentFunc?.pax;
  const hallId = ids[0];

  if (hallId && packageId && pax && Number(pax) > 0) {
    try {
      const res = await getpriceininfunctionadd(Number(pax), hallId, packageId);
      const price = res?.data?.success ? (res?.data?.data?.price ?? null) : null;
      const fallbackPrice = packageList.find((p) => String(p.value) === String(packageId))?.price;
      const finalRate = price != null ? String(price) : fallbackPrice != null ? String(fallbackPrice) : null;

      if (finalRate != null) {
        setFormData((prev) => {
          const arr = [...prev.eventFunction];
          arr[index] = { ...arr[index], rate: finalRate };
          return { ...prev, eventFunction: arr };
        });
      }
    } catch (err) {
      console.error("Error fetching price on banquet change:", err);
    }
  }
};


  const getVenueAllNames = (index) => {
  const func = formData.eventFunction[index];
  const currentValue = func?.function_venue || "";
  const matched = venueList.find(
    (v) =>
      v.nameEnglish === currentValue ||
      v.nameHindi === currentValue ||
      v.nameGujarati === currentValue,
  );
  return {
    english: currentValue || matched?.nameEnglish || "",
    hindi: func?.function_venueHindi || matched?.nameHindi || "",
    gujarati: func?.function_venueGujarati || matched?.nameGujarati || "",
  };
};


  const getVenueByName = (name) => {
  if (!name || !venueList?.length) return null;
  return venueList.find(
    (v) =>
      v.nameEnglish === name ||
      v.nameHindi === name ||
      v.nameGujarati === name
  );
};
  

const createEmptyRow = () => {
  // Look up full venue data for Hindi/Gujarati
  const fullVenue = selectedVenueName
    ? venueList.find(
        (v) =>
          v.nameEnglish === selectedVenueName ||
          v.nameHindi === selectedVenueName ||
          v.nameGujarati === selectedVenueName
      )
    : null;

  return {
    eventFuncId: 0,
    functionId: null,
    banquetHallId:
      canAccessBanquet && formData.banquetId && formData.banquetId !== "ODC"
        ? [formData.banquetId]
        : [],
    shiftId: formData.shiftId || "",
    originalShiftId: formData.shiftId || "",
    functionStartDateTime: eventStartDateTime || null,   
    functionEndDateTime: eventEndDateTime || null, 
    pax: "",
    rate: "",
    function_venue: selectedVenueName,
    function_venueHindi: fullVenue?.nameHindi || "",
    function_venueGujarati: fullVenue?.nameGujarati || "",
    notesEnglish: "",
    notesGujarati: "",
    notesHindi: "",
    banquetNotes: "",
    sortorder: (formData?.eventFunction?.length || 0) + 1,
    id: Date.now() + Math.random(),
    customPackageId: "",
    venueManualEdit: false,
    venueTouched: false, 
    functionTouched: false,
    dateTouched: false,
  };
};


// ── Auto-sync function dates from event-level Start/End Date ──────────────

useEffect(() => {
  if (!formData?.eventFunction?.length) return;
  if (!eventStartDateTime && !eventEndDateTime) return;

  const needsUpdate = formData.eventFunction.some(
    (func) =>
      !func.dateTouched &&
      (func.functionStartDateTime !== eventStartDateTime ||
        func.functionEndDateTime !== eventEndDateTime)
  );

  if (!needsUpdate) return;

  setFormData((prev) => ({
    ...prev,
    eventFunction: prev.eventFunction.map((func) =>
      func.dateTouched
        ? func
        : {
            ...func,
            functionStartDateTime: eventStartDateTime || func.functionStartDateTime,
            functionEndDateTime: eventEndDateTime || func.functionEndDateTime,
          }
    ),
  }));
}, [eventStartDateTime, eventEndDateTime, formData.eventFunction?.length])

  
// ── Auto-fill venue from event-level venue selection ──
useEffect(() => {
  if (!venueList?.length || !formData?.eventFunction?.length) return;

  const venueId = formData.venueId;

  if (!venueId) {
    // Event-level venue was cleared — clear function-level venues too
    const needsClear = formData.eventFunction.some(
      (func) => !func.venueTouched && func.function_venue && func.function_venue !== ""
    );
    if (needsClear) {
      setFormData((prev) => ({
        ...prev,
        eventFunction: prev.eventFunction.map((func) =>
          !func.venueTouched
            ? {
                ...func,
                function_venue: "",
                function_venueHindi: "",
                function_venueGujarati: "",
              }
            : func
        ),
      }));
    }
    return;
  }

  // Find the venue by ID (always reliable)
  const fullVenue = venueList.find((v) => v.id === venueId);
  if (!fullVenue) return;

  const venueEnglishName = fullVenue.nameEnglish || "";
  const venueHindiName = fullVenue.nameHindi || "";
  const venueGujaratiName = fullVenue.nameGujarati || "";

  // Check if any non-touched row needs the venue set OR UPDATED
  const needsUpdate = formData.eventFunction.some(
  (func) =>
    !func.venueTouched &&
    (func.function_venue !== venueEnglishName ||
     func.function_venueHindi !== venueHindiName ||
     func.function_venueGujarati !== venueGujaratiName)
);

  if (needsUpdate) {
    setFormData((prev) => ({
      ...prev,
      eventFunction: prev.eventFunction.map((func) =>
        !func.venueTouched
          ? {
              ...func,
              function_venue: venueEnglishName,
              function_venueHindi: venueHindiName,
              function_venueGujarati: venueGujaratiName,
            }
          : func
      ),
    }));
  }
}, [formData.venueId, venueList, formData.eventFunction]);


 const handleVenueModalSave = (updatedVenue) => {
    if (venueModalIndex === null) return;
    venueManualEditRef.current[venueModalIndex] = true;  
    setFormData((prev) => {
      const updatedFunctions = [...prev.eventFunction];
      updatedFunctions[venueModalIndex] = {
        ...updatedFunctions[venueModalIndex],
        function_venue: updatedVenue.english,
        function_venueHindi: updatedVenue.hindi,
        function_venueGujarati: updatedVenue.gujarati,
        venueManualEdit: true,
        venueTouched: true,   // ← add this
      };
      return { ...prev, eventFunction: updatedFunctions };
    });
};
  // ── Date helpers ──────────────────────────────────────────────────────────
  const extractDateOnly = (dateTimeString) => {
    if (!dateTimeString) return null;
    return dateTimeString.split(" ")[0];
  };

  const getDuplicateIndices = () => {
    const functions = formData?.eventFunction || [];
    const duplicates = new Set();
    const seen = new Map();
    functions.forEach((func, index) => {
      if (!func.functionId || !func.functionStartDateTime) return;
      const dateOnly = extractDateOnly(func.functionStartDateTime);
      const key = `${func.functionId}-${dateOnly}`;
      if (seen.has(key)) {
        duplicates.add(seen.get(key));
        duplicates.add(index);
      } else {
        seen.set(key, index);
      }
    });
    return duplicates;
  };

  const duplicateIndices = getDuplicateIndices();

  const getFunctionFieldError = (index, field) =>
    errors[`eventFunction[${index}].${field}`] ||
    errors[`eventFunction.${index}.${field}`];

  // ── FetchFunction ──────────────────────────────────────────────────────────
  const FetchFunction = (autoSelectLatest = false) => {
    const Id = localStorage.getItem("userId");
    GetAllFunctionsByUserId(Id)
      .then((res) => {
        const data = res?.data?.data?.["Function Details"] || [];
        const functionOptions = data.map((item) => ({
          label: getLocalizedField(item, "name"),
          value: item.id,
          functionstartTime: item.startTime,
          functionendTime: item.endTime,
        }));
        setOptions(functionOptions);

        if (!autoSelectLatest || functionOptions.length === 0) return;
        const latestFunction = functionOptions[functionOptions.length - 1];

        setFormData((prev) => {
          const updated = [...prev.eventFunction];
          let targetIndex = activeRowIndex;
          if (targetIndex === null || !updated[targetIndex]) {
            updated.push(createEmptyRow());
            targetIndex = updated.length - 1;
          }
          const row = updated[targetIndex];
          const eventStartDate = dayjs(eventStartDateTime, "DD/MM/YYYY hh:mm A");
          const eventEndDate = dayjs(eventEndDateTime, "DD/MM/YYYY hh:mm A");
          const startTime = dayjs(latestFunction.functionstartTime, "HH:mm");
          const endTime = dayjs(latestFunction.functionendTime, "HH:mm");
          const baseStartDate = row.functionStartDateTime
            ? dayjs(row.functionStartDateTime, "DD/MM/YYYY hh:mm A")
            : eventStartDate;
          const baseEndDate = row.functionEndDateTime
            ? dayjs(row.functionEndDateTime, "DD/MM/YYYY hh:mm A")
            : eventEndDate;
          updated[targetIndex] = {
            ...row,
            functionId: latestFunction.value,
            functionStartDateTime: baseStartDate
              .hour(startTime.hour())
              .minute(startTime.minute())
              .format("DD/MM/YYYY hh:mm A"),
            functionEndDateTime: baseEndDate
              .hour(endTime.hour())
              .minute(endTime.minute())
              .format("DD/MM/YYYY hh:mm A"),
          };
          return { ...prev, eventFunction: updated };
        });
      })
      .catch((err) => console.error("Error fetching functions:", err));
  };
useEffect(() => {
  FetchFunction();
  if (defaultRowSeededRef.current) return;
  defaultRowSeededRef.current = true;

  setFormData((prev) => {
    if (!prev.eventFunction || prev.eventFunction.length === 0) {
      if (canAccessEventFlow) return prev; 
      return { ...prev, eventFunction: [createEmptyRow()] };
    }
    return prev;
  });
}, [selectedVenueName, lang]);

useEffect(() => {
  if (!formData.eventTypeId) return;
  if (!eventTypeRawList.length || !options.length) return;
  if (autoMatchedEventTypeRef.current === formData.eventTypeId) return;
  const selectedEventType = eventTypeRawList.find(
    (e) => String(e.id) === String(formData.eventTypeId)
  );
  if (!selectedEventType) return;
  const eventTypeName = getLocalizedField(selectedEventType, "name");
  if (!eventTypeName) return;
  const matchedFunction = options.find(
    (opt) => opt.label?.trim().toLowerCase() === eventTypeName.trim().toLowerCase()
  );
  if (!matchedFunction) return;
  autoMatchedEventTypeRef.current = formData.eventTypeId;
  setFormData((prev) => {
    const updated = [...(prev.eventFunction || [])];
    if (updated.length === 0) {
      updated.push(createEmptyRow());
    }
           if (!updated[0].functionTouched) {
      // Prefer the row's already-selected shift timing over the Function Type's own time
      const existingShift = (updated[0].shiftOptions || []).find(
        (o) => String(o.value) === String(updated[0].shiftId)
      );
      const startTime = existingShift
        ? dayjs(existingShift.startTime, "HH:mm")
        : dayjs(matchedFunction.functionstartTime, "HH:mm");
      const endTime = existingShift
        ? dayjs(existingShift.endTime, "HH:mm")
        : dayjs(matchedFunction.functionendTime, "HH:mm");

      const baseDate = updated[0].functionStartDateTime
        ? dayjs(updated[0].functionStartDateTime, "DD/MM/YYYY hh:mm A")
        : dayjs(eventStartDateTime, "DD/MM/YYYY hh:mm A");
      updated[0] = {
        ...updated[0],
        functionId: matchedFunction.value,
        functionStartDateTime: baseDate
          .hour(startTime.hour())
          .minute(startTime.minute())
          .format("DD/MM/YYYY hh:mm A"),
        functionEndDateTime: baseDate
          .hour(endTime.hour())
          .minute(endTime.minute())
          .format("DD/MM/YYYY hh:mm A"),
      };
    }
    return { ...prev, eventFunction: updated };
  });
}, [formData.eventTypeId, eventTypeRawList, options]);

const handleAddClick = () => setShowFunctionModal(true);

  const handleSaveNotes = (notes) => {
    if (selectedFunctionIndex === null) return;
    const updatedArray = [...formData.eventFunction];
    updatedArray[selectedFunctionIndex].notesEnglish = notes.notesEnglish;
    updatedArray[selectedFunctionIndex].notesGujarati = notes.notesGujarati;
    updatedArray[selectedFunctionIndex].notesHindi = notes.notesHindi;
    setFormData({ ...formData, eventFunction: updatedArray });
    setShowNoteModal(false);
    setSelectedFunctionIndex(null);
  };

  const handleAddFunction = () => {
    setFormData({
      ...formData,
      eventFunction: [...(formData.eventFunction || []), createEmptyRow()],
    });
  };

  const handleRemoveFunction = async (index) => {
    const functionToRemove = formData.eventFunction[index];
    const hasEventFuncId =
      functionToRemove.eventFuncId && functionToRemove.eventFuncId !== 0;

    if (hasEventFuncId) {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to delete this function?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#005BA8",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "Cancel",
        background: "#f5faff",
        color: "#003f73",
        customClass: {
          popup: "rounded-2xl shadow-xl",
          title: "text-2xl font-bold",
          confirmButton: "px-6 py-2 text-white font-semibold rounded-lg",
          cancelButton: "px-6 py-2 text-white font-semibold rounded-lg",
        },
      });
      if (!result.isConfirmed) return;

      try {
        const response = await deleteFunction(functionToRemove.eventFuncId);
        if (
          response?.data?.msg?.toLowerCase().includes("success") ||
          response?.data?.status === 200 ||
          response?.status === 200
        ) {
          setFormData((prev) => {
            const updated = prev.eventFunction.filter((_, i) => i !== index);
            return { ...prev, eventFunction: updated.length > 0 ? updated : (canAccessEventFlow ? [] : [createEmptyRow()]) };
          });
          Swal.fire({
            title: "Deleted!",
            text: "Function deleted successfully.",
            icon: "success",
            confirmButtonColor: "#005BA8",
            background: "#f5faff",
            color: "#003f73",
            timer: 2000,
            showConfirmButton: false,
            customClass: { popup: "rounded-2xl shadow-xl" },
          });
        } else {
          Swal.fire({
            title: "Delete Failed!",
            text: response?.data?.msg || "Failed to delete.",
            icon: "error",
            confirmButtonColor: "#005BA8",
            background: "#f5faff",
            color: "#003f73",
            customClass: { popup: "rounded-2xl shadow-xl", title: "text-2xl font-bold", confirmButton: "px-6 py-2 text-white font-semibold rounded-lg" },
          });
        }
      } catch (err) {
        console.error("Error deleting function:", err);
        let errorMessage = "An error occurred.";
        if (err.code === "ERR_NETWORK") errorMessage = "Network error.";
        else if (err.response) errorMessage = err.response?.data?.msg || `Server error: ${err.response.status}`;
        else if (err.message) errorMessage = err.message;
        Swal.fire({
          title: "Delete Failed!",
          text: errorMessage,
          icon: "error",
          confirmButtonColor: "#005BA8",
          background: "#f5faff",
          color: "#003f73",
          customClass: { popup: "rounded-2xl shadow-xl", title: "text-2xl font-bold", confirmButton: "px-6 py-2 text-white font-semibold rounded-lg" },
        });
      }
    } else {
      setFormData((prev) => {
        const updated = prev.eventFunction.filter((_, i) => i !== index);
        return { ...prev, eventFunction: updated.length > 0 ? updated : [createEmptyRow()] };
      });
    }
  };

const priceDebounceRef = useRef({});

const handleInputChange = async (index, field, value) => {
  const updatedArray = [...formData.eventFunction];
  updatedArray[index] = { ...updatedArray[index], [field]: value }; 


   if (field === "functionStartDateTime" || field === "functionEndDateTime") {
    updatedArray[index].dateTouched = true;   
  }

  if (field === "functionStartDateTime" && updatedArray[index].banquetHallId) {
    fetchShiftOptionsForRow(index, updatedArray[index].banquetHallId, value);
  }

  // re-fetch price when pax changes and package is selected
  if (field === "pax" && updatedArray[index].customPackageId) {
    const func = updatedArray[index];
    const hallId = Array.isArray(func.banquetHallId)
      ? func.banquetHallId[0]
      : func.banquetHallId;
    const packageId = func.customPackageId;
    const paxNum = Number(value);

    // Clear previous debounce for this row
    if (priceDebounceRef.current[index]) {
      clearTimeout(priceDebounceRef.current[index]);
    }

    if (hallId && value && paxNum > 0) {
  priceDebounceRef.current[index] = setTimeout(async () => {
    try {
      const res = await getpriceininfunctionadd(paxNum, hallId, packageId);
      const price = res?.data?.success ? (res?.data?.data?.price ?? null) : null;
      const fallbackPrice = packageList.find((p) => String(p.value) === String(packageId))?.price;
      const finalRate = price != null ? String(price) : (fallbackPrice != null ? String(fallbackPrice) : null);

      if (finalRate != null) {
        setFormData((prev) => {
          const arr = [...prev.eventFunction];
          arr[index] = { ...arr[index], rate: finalRate };
          return { ...prev, eventFunction: arr };
        });
      }
    } catch (err) {
      console.error("Error fetching hall package price on pax change:", err);
    }
  }, 600);
}
  }

  const functionsWithSortOrder = updatedArray.map((func, idx) => ({
    ...func,
    sortorder: idx + 1,
  }));
  setFormData({ ...formData, eventFunction: functionsWithSortOrder });
};

const handlePackageChange = async (index, packageId) => {
  const updatedArray = [...formData.eventFunction];
  updatedArray[index] = { ...updatedArray[index], customPackageId: packageId };

  if (packageId) {
    const func = updatedArray[index];
    const hallId = Array.isArray(func.banquetHallId)
      ? func.banquetHallId[0]
      : func.banquetHallId;
    const pax = func.pax;
    const fallbackPrice = packageList.find((p) => String(p.value) === String(packageId))?.price;

    if (hallId && pax) {
      try {
        const res = await getpriceininfunctionadd(pax, hallId, packageId);
        const price = res?.data?.success ? (res?.data?.data?.price ?? null) : null;
        updatedArray[index].rate = price != null ? String(price) : (fallbackPrice != null ? String(fallbackPrice) : "");
      } catch (err) {
        console.error("Error fetching hall package price:", err);
        updatedArray[index].rate = fallbackPrice != null ? String(fallbackPrice) : "";
      }
    } else {
      updatedArray[index].rate = fallbackPrice != null ? String(fallbackPrice) : "";
    }
  } else {
    updatedArray[index].rate = "";
  }

  setFormData({ ...formData, eventFunction: updatedArray });
};

 const handleFunctionSelect = (index, functionId) => {
  const selected = options.find((opt) => opt.value === functionId);
  const updatedArray = [...formData.eventFunction];
  if (!selected) return;

  const currentRow = updatedArray[index];

  const selectedShift = (currentRow.shiftOptions || []).find(
    (o) => String(o.value) === String(currentRow.shiftId)
  );
  const startTime = selectedShift
    ? dayjs(selectedShift.startTime, "HH:mm")
    : dayjs(selected.functionstartTime, "HH:mm");
  const endTime = selectedShift
    ? dayjs(selectedShift.endTime, "HH:mm")
    : dayjs(selected.functionendTime, "HH:mm");

  // Check if same functionId already exists in other rows
  const existingRows = updatedArray.filter(
    (f, i) => i !== index && f.functionId === functionId
  );

  let baseStartDate;

  if (existingRows.length > 0) {
    // Find the latest start date among existing rows with same function
    const latestDate = existingRows.reduce((latest, f) => {
      const d = dayjs(f.functionStartDateTime, "DD/MM/YYYY hh:mm A");
      return d.isAfter(latest) ? d : latest;
    }, dayjs(existingRows[0].functionStartDateTime, "DD/MM/YYYY hh:mm A"));

    // Set base start date to next day after the latest existing row
    baseStartDate = latestDate.add(1, "day");
  } else if (currentRow.functionStartDateTime) {
    // Use current row's existing start date
    baseStartDate = dayjs(currentRow.functionStartDateTime, "DD/MM/YYYY hh:mm A");
  } else {
    // Fall back to event start date
    baseStartDate = dayjs(eventStartDateTime, "DD/MM/YYYY hh:mm A");
  }

  // Apply the function's start time to the base date
  const newStartDateTime = baseStartDate
    .hour(startTime.hour())
    .minute(startTime.minute())
    .format("DD/MM/YYYY hh:mm A");

  // End date = same day as start date (NOT event end date)
  const newEndDateTime = baseStartDate
    .hour(endTime.hour())
    .minute(endTime.minute())
    .format("DD/MM/YYYY hh:mm A");

  updatedArray[index] = {
    ...currentRow,
    functionId,
    functionStartDateTime: newStartDateTime,
    functionEndDateTime: newEndDateTime,
     functionTouched: true, 
  };

  setFormData({ ...formData, eventFunction: updatedArray });
};



  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = formData.eventFunction.findIndex((f) => f.id === active.id);
    const newIndex = formData.eventFunction.findIndex((f) => f.id === over.id);
    const reordered = arrayMove(formData.eventFunction, oldIndex, newIndex).map(
      (func, index) => ({ ...func, sortorder: index + 1 }),
    );
    setFormData({ ...formData, eventFunction: reordered });
  };

  const hasDuplicateError =
    errors.eventFunction &&
    typeof errors.eventFunction === "string" &&
    errors.eventFunction.toLowerCase().includes("duplicate");

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const parsed = dayjs(dateStr, "DD/MM/YYYY hh:mm A", true);
      return parsed.isValid() ? parsed.toDate() : null;
    } catch {
      return null;
    }
  };


const BanquetNotesModal = ({ isOpen, onClose, value, onSave }) => {
  const [notes, setNotes] = useState(value || "");

  useEffect(() => {
    if (isOpen) setNotes(value || "");
  }, [isOpen, value]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl p-5 w-[400px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-800">Banquet Notes</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        <textarea
          rows={5}
          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Enter banquet notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(notes); onClose(); }}
            className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};


const renderBanquetShiftCells = (func, index, isDuplicate) => {
const isODCRow =
  !canAccessBanquet ||
  !func.banquetHallId ||
  (Array.isArray(func.banquetHallId) ? func.banquetHallId.length === 0 : !func.banquetHallId);


  const cellClass = `p-1.5 border-b ${isDuplicate ? "bg-red-50 border-red-200" : "border-gray-200"}`;

  const shiftIdsUsedInThisEvent = new Set(
    formData.eventFunction
      .filter((f, i) => i !== index && f.shiftId && f.banquetHallId === func.banquetHallId)
      .map((f) => String(f.shiftId))
  );

  
  const shiftError = getFunctionFieldError(index, "shiftId");

  return (
    <>
 {canAccessBanquet && (
  <td className={cellClass}>
    <BanquetSelect
      value={func.banquetHallId}
      options={filteredBanquetList}
      onChange={(ids) => handleFunctionBanquetChange(index, ids)}
      menuPortalTarget={document.body}
    />
  </td>
)}

     {canShowPackage && (
  <td className={cellClass}>
    <select
      className="select w-full text-xs py-1 px-1.5"
      value={func.customPackageId || ""}
      onChange={(e) => handlePackageChange(index, e.target.value)}
    >
      <option value="">— Select Package —</option>
      {packageList.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </td>
)}

      <td className={cellClass}>
        {isODCRow ? (
          <div className="flex items-center gap-1.5">
            <Input
  className="w-full"
  value={func.function_venue}
  type="text"
  placeholder="Function Venue"
  onChange={(e) => {
    setActiveRowIndex(index);
    const updatedArray = [...formData.eventFunction];
    updatedArray[index] = {
      ...updatedArray[index],
      function_venue: e.target.value,
      venueManualEdit: false,
      venueTouched: true,
    };
    setFormData({ ...formData, eventFunction: updatedArray });
  }}
/>
            <Tooltip title="View in all languages">
              <button
                type="button"
                onClick={() => { setVenueModalIndex(index); setVenueModalOpen(true); }}
                className="flex-shrink-0 w-7 h-7 rounded-md border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-300 flex items-center justify-center transition"
              >
                <MapPin size={16} className="text-gray-500 hover:text-blue-600" />
              </button>
            </Tooltip>
          </div>
        ) : (
          <div>
            <select
              className={`select w-full text-xs py-1 px-1.5 ${shiftError ? "border-red-500 border" : ""}`}
              value={func.shiftId || ""}
              onChange={(e) => {
  const val = e.target.value;
  const selected = (func.shiftOptions || []).find(
    (o) => String(o.value) === String(val)
  );
  const isOriginal = String(val) === String(func.originalShiftId);
  const isUsedInThisEvent = shiftIdsUsedInThisEvent.has(String(val));

  if (selected && !selected.isAvailable && !isOriginal && !isUsedInThisEvent) {
    // Show which halls have it booked
    const bookedIn = selected.bookedInHalls || [];
    const hallLines = bookedIn
      .map((h) => `• ${h.hallName}${h.eventNo ? ` (${h.eventNo})` : ""}`)
      .join("\n");
    Swal.fire({
      title: "Shift Already Booked",
      html: `This shift is already booked in:<br/><br/><strong>${bookedIn.map(h => `${h.hallName}${h.eventNo ? ` (${h.eventNo})` : ""}`).join("<br/>")}</strong>`,
      icon: "warning",
      confirmButtonColor: "#005BA8",
      background: "#f5faff",
      color: "#003f73",
      customClass: { popup: "rounded-2xl shadow-xl" },
    });
    return;
  }

  setErrors((prev) => {
    const updated = { ...prev };
    delete updated[`eventFunction[${index}].shiftId`];
    return updated;
  });

 if (selected) {
  const baseDate = func.functionStartDateTime
    ? dayjs(func.functionStartDateTime, "DD/MM/YYYY hh:mm A")
    : dayjs(eventStartDateTime, "DD/MM/YYYY hh:mm A");
  const shiftStart = dayjs(selected.startTime, "HH:mm");
  const shiftEnd = dayjs(selected.endTime, "HH:mm");

  const updatedArray = [...formData.eventFunction];
  updatedArray[index] = {
    ...updatedArray[index],
    shiftId: val,
    functionStartDateTime: baseDate.hour(shiftStart.hour()).minute(shiftStart.minute()).format("DD/MM/YYYY hh:mm A"),
    functionEndDateTime: baseDate.hour(shiftEnd.hour()).minute(shiftEnd.minute()).format("DD/MM/YYYY hh:mm A"),
  };
  setFormData({ ...formData, eventFunction: updatedArray });
} else {
  handleInputChange(index, "shiftId", val);
}
}}
            >
              <option value="">— Select Shift —</option>
              {(func.shiftOptions || []).map((opt) => {
                const isOriginal = String(opt.value) === String(func.originalShiftId);
                const isUsedInThisEvent = shiftIdsUsedInThisEvent.has(String(opt.value));
                const available = opt.isAvailable || isOriginal || isUsedInThisEvent;

                return (
                  <option key={opt.value} value={opt.value} disabled={!available}>
                    {available
                      ? `${opt.shiftName} (${opt.startTime} - ${opt.endTime})`
                      : `${opt.shiftName} (${opt.startTime} - ${opt.endTime}) [Booked]`}
                  </option>
                );
              })}
            </select>

            {/* ✅ Show shift conflict error inline */}
            {shiftError && (
              <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <span>⚠️</span>
                <span>{shiftError}</span>
              </div>
            )}
          </div>
        )}
      </td>
    </>
  );
};

  // ─────────────────────────────────────────────────────────────────────────
  // MobileFunctionCard
  // ─────────────────────────────────────────────────────────────────────────
  const MobileFunctionCard = ({ func, index, isDuplicate }) => {

    const shiftError = getFunctionFieldError(index, "shiftId");
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id: func.id });
    const style = { transform: CSS.Transform.toString(transform), transition };
const isODCRow =
  !canAccessBanquet ||
  !func.banquetHallId ||
  (Array.isArray(func.banquetHallId) ? func.banquetHallId.length === 0 : !func.banquetHallId);


    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`m-2 sm:m-3 p-3 sm:p-4 border rounded-lg ${
          isDuplicate ? "bg-red-50 border-red-300" : "bg-white border-gray-200"
        }`}
      >
        {/* Card Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 text-lg">⠿</span>
            <span className="text-sm font-semibold text-gray-700">
              <FormattedMessage id="USER.DASHBOARD.FUNCTION" defaultMessage="Function" /> #{index + 1}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Tooltip title="Add Notes">
              <button className="btn btn-xs btn-icon btn-clear btn-success" onClick={() => { setSelectedFunctionIndex(index); setShowNoteModal(true); }}>
                <i className="ki-filled ki-add-files text-sm"></i>
              </button>
            </Tooltip>
           {canAccessBanquet && (
  <Tooltip title="Banquet Notes">
    <button
      className="btn btn-xs btn-icon btn-clear btn-primary"
      onClick={() => setBanquetNotesModal({ open: true, index })}
    >
      <i className="ki-filled ki-note-2"></i>
    </button>
  </Tooltip>
)}
            <Tooltip title="Remove">
              <button
                onClick={() => handleRemoveFunction(index)}
                disabled={formData.eventFunction.length === 1}
                className={formData.eventFunction.length === 1 ? "btn btn-xs btn-icon btn-clear btn-danger opacity-50 cursor-not-allowed" : "btn btn-xs btn-icon btn-clear btn-danger"}
              >
                <i className="ki-filled ki-trash text-sm"></i>
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Function Type */}
        <div className="mb-3">
          <label className="text-xs font-medium text-gray-600 mb-1 block">
            <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_FUNCTION_TYPE" defaultMessage="Functions" />
            <span className="text-red-500 ml-0.5">*</span>
          </label>
          <FunctionTypeDropdown
            value={func.functionId || undefined}
            onChange={(value) => handleFunctionSelect(index, value)}
            onFocus={() => setActiveRowIndex(index)}
            options={options}
            placeholder="Select Function"
            className="w-full"
            style={{ borderColor: isDuplicate || getFunctionFieldError(index, "functionId") ? "#ef4444" : undefined }}
          />
          {getFunctionFieldError(index, "functionId") && (
            <span className="text-red-500 text-xs mt-1 block">{getFunctionFieldError(index, "functionId")}</span>
          )}
          {isDuplicate && duplicateIndices.has(index) && (
            <span className="text-red-500 text-xs mt-1 block">⚠️ Duplicate function on same date</span>
          )}
        </div>

        {/* Start / End Date */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_START_DATE" defaultMessage="Start Date" />
            </label>
           <DatePicker
  className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
  showTimeSelect timeFormat="hh:mm aa" timeIntervals={30} dateFormat="dd/MM/yyyy hh:mm aa"
  selected={parseDate(func.functionStartDateTime)}
  onChange={(date) => handleInputChange(index, "functionStartDateTime", date ? dayjs(date).format("DD/MM/YYYY hh:mm A") : null)}
  minDate={backDateMin}
  placeholderText="Start date"
/>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_END_DATE" defaultMessage="End Date" />
            </label>
            <DatePicker
  className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs"
  showTimeSelect timeFormat="hh:mm aa" timeIntervals={30} dateFormat="dd/MM/yyyy hh:mm aa"
  selected={parseDate(func.functionEndDateTime)}
  onChange={(date) => handleInputChange(index, "functionEndDateTime", date ? dayjs(date).format("DD/MM/YYYY hh:mm A") : null)}
  minDate={parseDate(func.functionStartDateTime) || backDateMin}
  placeholderText="End date"
/>
          </div>
        </div>

        {/* Pax / Rate */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_PERSON" defaultMessage="Person" />
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <Input className="w-full text-xs" value={func.pax} type="text" placeholder="Person" onChange={(e) => handleInputChange(index, "pax", e.target.value)} />
            {getFunctionFieldError(index, "pax") && <div className="text-red-500 text-xs mt-1">{getFunctionFieldError(index, "pax")}</div>}
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_RATE" defaultMessage="Rate" />
            </label>
<Input
  className="w-full text-xs"
  value={func.rate}
  type="text"
  placeholder="Rate"
  readOnly={!!func.customPackageId && !CAN_EDIT_RATE_WITH_PACKAGE}
  style={func.customPackageId && !CAN_EDIT_RATE_WITH_PACKAGE ? { background: "#f3f4f6", cursor: "not-allowed" } : {}}
  onChange={(e) => handleInputChange(index, "rate", e.target.value)}
/>          </div>
        </div>

 {canAccessBanquet && (
  <div className="mb-3">
    <label className="text-xs font-medium text-gray-600 mb-1 block">Banquet Hall</label>
    <BanquetSelect
      value={func.banquetHallId}
      options={filteredBanquetList}
      onChange={(ids) => handleFunctionBanquetChange(index, ids)}
      menuPortalTarget={document.body}
    />
  </div>
)}
        {canAccessBanquet && (
  <div className="mb-3">
    <label className="text-xs font-medium text-gray-600 mb-1 block">Package</label>
    <select
      className="select w-full text-xs"
      value={func.customPackageId || ""}
      onChange={(e) => handlePackageChange(index, e.target.value)}
    >
      <option value="">— Select Package —</option>
      {packageList.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
)}

        {isODCRow ? (
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-600 mb-1 block">
              <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_VENUE" defaultMessage="Venue" />
            </label>
            <Input
              className="w-full text-xs"
              value={func.function_venue}
              type="text"
              placeholder="Venue"
              onChange={(e) => {
  setActiveRowIndex(index);
  const updatedArray = [...formData.eventFunction];
  updatedArray[index] = {
    ...updatedArray[index],
    function_venue: e.target.value,
    venueManualEdit: false, 
    venueTouched: true,
  };
  setFormData({ ...formData, eventFunction: updatedArray });
}}
            />
          </div>
        ) : (
          <div className="mb-3">
            <label className="text-xs font-medium text-gray-600 mb-1 block">Shift</label>
            <select
              className="select w-full text-xs"
              value={func.shiftId || ""}
            onChange={(e) => {
  const val = e.target.value;
  const selected = (func.shiftOptions || []).find(
    (o) => String(o.value) === String(val)
  );
  const isOriginal = String(val) === String(func.originalShiftId);
  const isUsedInThisEvent = shiftIdsUsedInThisEvent.has(String(val));

  if (selected && !selected.isAvailable && !isOriginal && !isUsedInThisEvent) {
    // Show which halls have it booked
    const bookedIn = selected.bookedInHalls || [];
    const hallLines = bookedIn
      .map((h) => `• ${h.hallName}${h.eventNo ? ` (${h.eventNo})` : ""}`)
      .join("\n");
    Swal.fire({
      title: "Shift Already Booked",
      html: `This shift is already booked in:<br/><br/><strong>${bookedIn.map(h => `${h.hallName}${h.eventNo ? ` (${h.eventNo})` : ""}`).join("<br/>")}</strong>`,
      icon: "warning",
      confirmButtonColor: "#005BA8",
      background: "#f5faff",
      color: "#003f73",
      customClass: { popup: "rounded-2xl shadow-xl" },
    });
    return;
  }

  setErrors((prev) => {
  const updated = { ...prev };
  delete updated[`eventFunction[${index}].shiftId`];
  return updated;
});

if (selected) {
  const baseDate = func.functionStartDateTime
    ? dayjs(func.functionStartDateTime, "DD/MM/YYYY hh:mm A")
    : dayjs(eventStartDateTime, "DD/MM/YYYY hh:mm A");
  const shiftStart = dayjs(selected.startTime, "HH:mm");
  const shiftEnd = dayjs(selected.endTime, "HH:mm");

  const updatedArray = [...formData.eventFunction];
  updatedArray[index] = {
    ...updatedArray[index],
    shiftId: val,
    functionStartDateTime: baseDate.hour(shiftStart.hour()).minute(shiftStart.minute()).format("DD/MM/YYYY hh:mm A"),
    functionEndDateTime: baseDate.hour(shiftEnd.hour()).minute(shiftEnd.minute()).format("DD/MM/YYYY hh:mm A"),
    // dateTouched line removed — no longer locks the row
  };
  setFormData({ ...formData, eventFunction: updatedArray });
} else {
  handleInputChange(index, "shiftId", val);
}
}}
            >
              <option value="">— Select Shift —</option>
   {(func.shiftOptions || []).map((opt) => {
  const isOriginal = String(opt.value) === String(func.originalShiftId);
  const shiftIdsUsedInThisEvent = new Set(
    formData.eventFunction
      .filter((f, i) => i !== index && f.shiftId && f.banquetHallId === func.banquetHallId)
      .map((f) => String(f.shiftId))
  );
  const isUsedInThisEvent = shiftIdsUsedInThisEvent.has(String(opt.value));
  const available = opt.isAvailable || isOriginal || isUsedInThisEvent;

  return (
    <option key={opt.value} value={opt.value} disabled={!available}>
      {available
        ? `${opt.shiftName} (${opt.startTime} - ${opt.endTime})`
        : `${opt.shiftName} (${opt.startTime} - ${opt.endTime}) [Booked]`}
    </option>
  );
})}
            </select>
            {shiftError && (
        <div className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <span>⚠️</span>
          <span>{shiftError}</span>
        </div>
      )}
          </div>
        )}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="rounded-md border border-gray-200 bg-white">
      {/* Header */}
      <div className="p-2 sm:p-3 flex justify-between items-center flex-wrap gap-2">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900">
          <FormattedMessage id="USER.DASHBOARD.FUNCTIONS_LIST" defaultMessage="Functions List" />
        </h3>
        <Tooltip title={<FormattedMessage id="USER.DASHBOARD.ADD_FUNCTION" defaultMessage="Add Function" />}>
          <button className="btn btn-primary btn-sm text-xs sm:text-sm" onClick={handleAddFunction}>
            <Plus size={14} className="sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">
              <FormattedMessage id="USER.DASHBOARD.CREATE_NEW_FUNCTION" defaultMessage="Create New Function" />
            </span>
            <span className="sm:hidden">
              <FormattedMessage id="COMMON.ADD" defaultMessage="Add" />
            </span>
          </button>
        </Tooltip>
      </div>

  {errors.eventFunction && typeof errors.eventFunction === "string" && !canAccessEventFlow && (
  <div className="mx-2 sm:mx-3 mb-2 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-xs sm:text-sm">
    <strong>⚠️ {errors.eventFunction}</strong>
  </div>
)}

      {canAccessEventFlow && (!formData.eventFunction || formData.eventFunction.length === 0) && (
  <div className="mx-2 sm:mx-3 mb-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-xs sm:text-sm">
    No functions added. You can add functions or proceed to the next step.
  </div>
)}

      {/* ── Desktop Table ── */}
      <div className="hidden lg:block overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          {formData.eventFunction?.length > 0 && (
           <table className="w-full text-sm text-left border-gray-200 border-t table-fixed">
            <thead className="text-black font-bold border-b border-gray-200 bg-gray-100">
              <tr>
                <th className="text-sm font-semibold text-gray-900 p-3 w-8"></th>
                {/* Function type */}
                <th className="text-sm font-semibold text-gray-900 p-2 sm:p-3 min-w-[130px] max-w-[150px]">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center">
                      <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_FUNCTION_TYPE" defaultMessage="Functions" />
                      <span className="mandatory ms-0.5 text-base text-red-500 font-medium">*</span>
                    </span>
                    <button type="button" onClick={handleAddClick} title="Add Function Type" className="btn btn-primary flex items-center justify-center rounded-full p-0 w-6 h-6">
                      <i className="ki-filled ki-plus"></i>
                    </button>
                  </div>
                </th>
                <th className="text-sm font-semibold text-gray-900 p-2 sm:p-3 min-w-[155px] max-w-[165px]">
                  <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_START_DATE" defaultMessage="Start Date" />
                </th>
                <th className="text-sm font-semibold text-gray-900 p-2 sm:p-3 min-w-[155px] max-w-[165px]">
                  <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_END_DATE" defaultMessage="End Date" />
                </th>
                <th className="text-sm font-semibold text-gray-900 p-2 sm:p-3 w-[80px]">
                  <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_PERSON" defaultMessage="Person" />
                  <span className="mandatory ms-0.5 text-base text-red-500 font-medium">*</span>
                </th>
                <th className="text-sm font-semibold text-gray-900 p-2 sm:p-3 w-[80px]">
                  <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_RATE" defaultMessage="Rate" />
                </th>
           
                {canAccessBanquet && (
   <th className="text-sm font-semibold text-gray-900 p-2 sm:p-3 min-w-[120px] max-w-[130px]">
    Banquet Hall
  </th>
)}
{canShowPackage && (
   <th className="text-sm font-semibold text-gray-900 p-2 sm:p-3 min-w-[120px] max-w-[130px]">
    Package
  </th>
)}
                <th className="text-sm font-semibold text-gray-900 p-2 sm:p-3 min-w-[140px] max-w-[160px]">
                  <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_VENUE" defaultMessage="Venue" /> / Shift
                </th>
                <th className="text-sm font-semibold text-gray-900 p-2 sm:p-3 text-center w-[90px]">
                  <FormattedMessage id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_FUNCTION_DETAILS_ACTIONS" defaultMessage="Actions" />
                </th>
              </tr>
            </thead>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext
                items={formData.eventFunction?.map((f) => f.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {formData?.eventFunction?.map((func, index) => {
                    const isDuplicate = duplicateIndices.has(index) || hasDuplicateError;
                    const cellClass = `p-1.5 border-b ${isDuplicate ? "bg-red-50 border-red-200" : "border-gray-200"}`;

                    return (
                      <SortableRow key={func.id || index} id={func.id || index}>
                        {/* Function dropdown */}
                        <td className={cellClass}>
                          <FunctionTypeDropdown
                            value={func.functionId || undefined}
                            onChange={(value) => handleFunctionSelect(index, value)}
                            onFocus={() => setActiveRowIndex(index)}
                            options={options}
                            placeholder="Select Function"
                            style={{ borderColor: isDuplicate || getFunctionFieldError(index, "functionId") ? "#ef4444" : undefined, width: "100%" }}
                          />
                          {getFunctionFieldError(index, "functionId") && (
                            <span className="text-red-500 text-xs mt-1 block">{getFunctionFieldError(index, "functionId")}</span>
                          )}
                          {isDuplicate && duplicateIndices.has(index) && (
                            <span className="text-red-500 text-xs mt-1 block">⚠️ Duplicate function on same date</span>
                          )}
                        </td>

                        {/* Start Date */}
                        <td className={cellClass}>
                          <DatePicker
  className="w-full border border-gray-500 rounded px-1.5 py-1 text-xs"
  showTimeSelect timeFormat="hh:mm aa" timeIntervals={30} dateFormat="dd/MM/yyyy hh:mm aa"
  selected={parseDate(func.functionStartDateTime)}
  onChange={(date) => handleInputChange(index, "functionStartDateTime", date ? dayjs(date).format("DD/MM/YYYY hh:mm A") : null)}
  minDate={backDateMin}
  placeholderText="Select start date"
/>
                        </td>

                        {/* End Date */}
                        <td className={cellClass}>
                          <DatePicker
  className="w-full border border-gray-500 rounded px-1.5 py-1 text-xs"
  showTimeSelect timeFormat="hh:mm aa" timeIntervals={30} dateFormat="dd/MM/yyyy hh:mm aa"
  selected={parseDate(func.functionEndDateTime)}
  onChange={(date) => handleInputChange(index, "functionEndDateTime", date ? dayjs(date).format("DD/MM/YYYY hh:mm A") : null)}
  minDate={parseDate(func.functionStartDateTime) || backDateMin}
  placeholderText="Select end date"
/>
                          {getFunctionFieldError(index, "functionStartDateTime") && (
                            <div className="text-red-500 text-xs mt-1">{getFunctionFieldError(index, "functionStartDateTime")}</div>
                          )}
                          {getFunctionFieldError(index, "functionEndDateTime") && (
                            <div className="text-red-500 text-xs mt-1">{getFunctionFieldError(index, "functionEndDateTime")}</div>
                          )}
                        </td>

                        {/* Pax */}
                        <td className={cellClass}>
                          <Input className="w-full text-center text-xs px-1" value={func.pax} type="text" onChange={(e) => handleInputChange(index, "pax", e.target.value)} required />
                          {getFunctionFieldError(index, "pax") && <div className="text-red-500 text-xs mt-1">{getFunctionFieldError(index, "pax")}</div>}
                        </td>

                       
                       {/* Rate */}
<td className={cellClass}>
  <Input
  className="w-full text-center text-xs px-1"
  value={func.rate}
  type="text"
  placeholder="Rate"
  readOnly={!!func.customPackageId && !CAN_EDIT_RATE_WITH_PACKAGE}
  style={func.customPackageId && !CAN_EDIT_RATE_WITH_PACKAGE ? { background: "#f3f4f6", cursor: "not-allowed" } : {}}
  onChange={(e) => handleInputChange(index, "rate", e.target.value)}
/>
</td>

                       
                        {renderBanquetShiftCells(func, index, isDuplicate)}

                        {/* Actions */}
                        <td className={cellClass}>
                          <div className="flex justify-center items-center gap-1 sm:gap-2">
                            <Tooltip title="Add Notes">
                              <button className="btn btn-sm btn-icon btn-clear btn-success" onClick={() => { setSelectedFunctionIndex(index); setShowNoteModal(true); }}>
                                <i className="ki-filled ki-add-files"></i>
                              </button>
                            </Tooltip>
                            {canAccessBanquet && (
  <Tooltip title="Banquet Notes">
    <button
      className="btn btn-sm btn-icon btn-clear btn-primary"
      onClick={() => setBanquetNotesModal({ open: true, index })}
    >
      <i className="ki-filled ki-note-2"></i>
    </button>
  </Tooltip>
)}
                            <Tooltip title="Remove">
                              <button
                                onClick={() => handleRemoveFunction(index)}
                                disabled={formData.eventFunction.length === 1}
                                className={formData.eventFunction.length === 1 ? "btn btn-sm btn-icon btn-clear btn-danger opacity-50 cursor-not-allowed" : "btn btn-sm btn-icon btn-clear btn-danger"}
                              >
                                <i className="ki-filled ki-trash"></i>
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </SortableRow>
                    );
                  })}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
          )}
        </div>
      </div>

      {/* ── Mobile Card View ── */}
      <div className="lg:hidden">
        {formData.eventFunction?.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={formData.eventFunction?.map((f) => f.id) || []}
            strategy={verticalListSortingStrategy}
          >
            {formData?.eventFunction?.map((func, index) => {
              const isDuplicate = duplicateIndices.has(index) || hasDuplicateError;
              return (
                <MobileFunctionCard
                  key={func.id || index}
                  func={func}
                  index={index}
                  isDuplicate={isDuplicate}
                />
              );
            })}
          </SortableContext>
        </DndContext>
        )}
      </div>

      {/* Footer add button */}
     <div className={`p-2 sm:p-3 flex justify-center ${formData.eventFunction?.length > 0 ? "border-t border-gray-200" : ""}`}>
        <Tooltip title="Add Function">
          <button className="btn btn-primary btn-sm text-xs sm:text-sm w-full sm:w-auto" onClick={handleAddFunction}>
            <Plus size={14} className="sm:w-4 sm:h-4" />
            <FormattedMessage id="USER.DASHBOARD.CREATE_NEW" defaultMessage="Create New" />
          </button>
        </Tooltip>
      </div>

      {/* Modals */}
      <AddFunctionType
        isOpen={showFunctionModal}
        onClose={() => setShowFunctionModal(false)}
        onSuccess={() => FetchFunction(true)}
        refreshData={() => FetchFunction(true)}
      />
      <AddNotes
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        initialNotes={
          selectedFunctionIndex !== null
            ? {
                notesEnglish: formData.eventFunction[selectedFunctionIndex]?.notesEnglish || "",
                notesGujarati: formData.eventFunction[selectedFunctionIndex]?.notesGujarati || "",
                notesHindi: formData.eventFunction[selectedFunctionIndex]?.notesHindi || "",
              }
            : { notesEnglish: "", notesGujarati: "", notesHindi: "" }
        }
        onSave={handleSaveNotes}
      />
      <VenueNamesModal
        isOpen={venueModalOpen}
        onClose={() => { setVenueModalOpen(false); setVenueModalIndex(null); }}
        venueEnglish={venueModalIndex !== null ? getVenueAllNames(venueModalIndex).english : ""}
        venueHindi={venueModalIndex !== null ? getVenueAllNames(venueModalIndex).hindi : ""}
        venueGujarati={venueModalIndex !== null ? getVenueAllNames(venueModalIndex).gujarati : ""}
        onSave={handleVenueModalSave}
        onTranslatingChange={onTranslatingChange}
      />
      <BanquetNotesModal
  isOpen={banquetNotesModal.open}
  onClose={() => setBanquetNotesModal({ open: false, index: null })}
  value={
    banquetNotesModal.index !== null
      ? formData.eventFunction[banquetNotesModal.index]?.banquetNotes || ""
      : ""
  }
  onSave={(val) => {
    if (banquetNotesModal.index === null) return;
    const updated = [...formData.eventFunction];
    updated[banquetNotesModal.index] = {
      ...updated[banquetNotesModal.index],
      banquetNotes: val,
    };
    setFormData({ ...formData, eventFunction: updated });
  }}
/>
    </div>
  );
};

export default FunctionsDetails;