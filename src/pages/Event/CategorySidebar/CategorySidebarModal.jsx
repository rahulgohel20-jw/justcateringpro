import { useEffect, useState, useRef  } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Swal from "sweetalert2";
import AddContactName from "../../master/MenuItemMaster/components/AddContactName";
import { Plus } from "lucide-react";
import dayjs from "dayjs";
import {
  OutsideContactName,
  GetUnitData,
  SelectedRawMenuallocation,
  DeleteRawMaterialItem,
  SelectedItemNameMenuAllocation,
  AddLogs
} from "@/services/apiServices";
import PlaceSelect from "../../../components/PlaceSelect/PlaceSelect";
import { Select } from "antd";
import { SearchRawMaterial } from "@/services/apiServices";
import AddRawMaterial from "@/partials/modals/add-raw-material/AddRawMaterial";
import { FormattedMessage, useIntl } from "react-intl";

const baseField =
  "h-10 w-full rounded-md border border-gray-300 bg-white px-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500";

const BaseInput = (props) => <input {...props} className={baseField} />;
const BaseSelect = ({ children, ...props }) => (
  <select {...props} className={baseField}>
    {children}
  </select>
);

const GRID = "grid grid-cols-[64px_repeat(6,minmax(0,1fr))_80px]";

export default function CategorySidebarModal({
  open,
  onClose,
  selectedRowData,
  eventFunctionId,
  eventId,
  onSave,
  allocationType,
  eventDate,
  pax,
}) {
  const [suppliers, setSuppliers] = useState([]);
  const [unit, setUnit] = useState([]);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState("");
  const [selectedPlace, setSelectedPlace] = useState("");
  const intl = useIntl();
  const [contactType, setContactType] = useState(); // Default: Outside
  const [contactTypeName, setContactTypeName] = useState("Outside");

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  const [rmSearchQuery, setRmSearchQuery] = useState({});
  const [rmMenuItems, setRmMenuItems] = useState({});
  const [rmLoading, setRmLoading] = useState({});
  const [rmHasMore, setRmHasMore] = useState({});
  const [rmPage, setRmPage] = useState({});
  const RM_PAGE_SIZE = 50;

  const [isAddRawMaterialOpen, setIsAddRawMaterialOpen] = useState(false);
  const [lastNewRowId, setLastNewRowId] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialRawMaterialsRef = useRef([]);

const userEmail = (() => {
  try {
    return (
      JSON.parse(localStorage.getItem("auth-storage"))?.state?.user?.email || ""
    );
  } catch {
    return "";
  }
})();

  const handleClose = async () => {
     if (isSubmitting) return;
    if (hasUnsavedChanges) {
      const result = await Swal.fire({
        title: "Unsaved Changes",
        text: "You have unsaved changes. Are you sure you want to close without saving?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Leave Without Saving",
        cancelButtonText: "Stay",
      });
      if (!result.isConfirmed) return;
    }
    setHasUnsavedChanges(false);
    onClose?.();
  };

  const fetchRMForRow = (rowId, searchTerm = "", page = 1, append = false) => {
    const isFirstPage = page === 1;
    setRmLoading((prev) => ({ ...prev, [rowId]: true }));

    SearchRawMaterial(
      true,
      localStorage.getItem("userId"),
      page,
      RM_PAGE_SIZE,
      searchTerm,
    )
      .then((res) => {
        const data = res?.data?.data || {};
        const items = data["Raw Material Details"] || [];
        const total = data.totalItems || 0;
        setRmMenuItems((prev) => ({
          ...prev,
          [rowId]: append ? [...(prev[rowId] || []), ...items] : items,
        }));
        setRmPage((prev) => ({ ...prev, [rowId]: page }));
        setRmHasMore((prev) => ({
          ...prev,
          [rowId]: page * RM_PAGE_SIZE < total,
        }));
      })
      .catch(() => {
        setRmMenuItems((prev) => ({ ...prev, [rowId]: [] }));
        setRmHasMore((prev) => ({ ...prev, [rowId]: false }));
      })
      .finally(() => setRmLoading((prev) => ({ ...prev, [rowId]: false })));
  };

  let concatId = null;
  if (allocationType === "inside") {
    concatId = 7;
  } else if (allocationType === "chef") {
    concatId = 5;
  } else if (allocationType === "outsource") {
    concatId = 6;
  }

  useEffect(() => {
    if (!selectedRowData) return;

    if (selectedRowData.allocationType === "inside") {
      setContactType(3);
      setContactTypeName("Inside Kitchen");
    } else if (selectedRowData.allocationType === "chef") {
      setContactType(3);
      setContactTypeName("Chef Labour");
    } else if (selectedRowData.allocationType === "outsource") {
      setContactType(3);
      setContactTypeName("Outside");
    }
  }, [selectedRowData]);
  const FetchAllSuplier = async () => {
    setLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      // Use dynamic contactType instead of hardcoded 5
      const res = await OutsideContactName(contactType, userId);

      const supplierData = res?.data?.data?.["Party Details"] || [];

      setSuppliers(supplierData);

      const unitRes = await GetUnitData(userId);
      const unitData = unitRes?.data?.data?.["Unit Details"] || [];
      setUnit(unitData);
    } catch (err) {
      console.error("Error fetching suppliers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      FetchAllSuplier();
    }
  }, [contactType, open]);

  const parseDateToObject = (value) => {
    if (!value) return null;
    if (value instanceof Date) return value;

    const parsed = dayjs(value, "DD/MM/YYYY hh:mm A", true);
    return parsed.isValid() ? parsed.toDate() : null;
  };

  useEffect(() => {
    if (!open) return;

    setHasUnsavedChanges(false);

    if (!selectedRowData) {
      setRawMaterials([]);
      initialRawMaterialsRef.current = []; 
      return;
    }

    const rawMaterialDetails = selectedRowData["MenuItem RawMaterial Details"];

    if (rawMaterialDetails && rawMaterialDetails.length > 0) {
      const details = rawMaterialDetails.map((item, index) => {
        const hierarchy = item.unitHierarchyDto || item.unitHierarchy || null;

        const hierarchyUnits = [];
        if (hierarchy) {
          hierarchyUnits.push({
            id: hierarchy.unitId,
            nameEnglish: hierarchy.nameEnglish,
          });
          (hierarchy.children || []).forEach((child) => {
            hierarchyUnits.push({
              id: child.unitId,
              nameEnglish: child.nameEnglish,
            });
          });
        }

        return {
          id: `row-${Date.now()}-${index}`,
          itemId: item.id || 0,
          name: item.rawMaterialName || "",
          menuItemName: item.menuItemName || "-",
          isNewRaw: item.isNewRaw ?? false,
          isCaptainReceipe: item.isCaptainReceipe ?? false,
          agency: item.partyName || "",
          dateTime: parseDateToObject(item.dateTime),
          weight: item.weight || 0,
          unit: item.unitName || item.units?.nameEnglish || "",
          place: item.place || "",
          rawMaterialId: item.rawMaterialId || 0,
          menuItemId: item.menuItemId || 0,
          rate: item.rate || 0,
          rawmaterial_rate: item.rate || 0, // ← use item.rate (backend calculated)
          rawmaterial_weight: item.rawmaterial_weight || 0,
          supplierRate: item.supRate || item.supplierRate || 0,
          unitHierarchy: item.unitHierarchy || null, // ← directly on item, not nested
          hierarchyUnits: (() => {
            const hierarchy = item.unitHierarchy || null;
            const units = [];
            if (hierarchy) {
              units.push({
                id: hierarchy.unitId,
                nameEnglish: hierarchy.nameEnglish,
              });
              (hierarchy.children || []).forEach((child) => {
                units.push({
                  id: child.unitId,
                  nameEnglish: child.nameEnglish,
                });
              });
            }
            return units;
          })(),
        };
      });

      setRawMaterials(details);
      initialRawMaterialsRef.current = JSON.parse(JSON.stringify(details));
    } else {
      setRawMaterials([]);
      initialRawMaterialsRef.current = [];
    }
  }, [selectedRowData, open]);


  const buildRawMaterialChangeSummary = (prevItems, currentItems) => {
  const parts = [];
  const added = [];
  const removed = [];
  const fieldChanges = [];

  const keyOf = (item) =>
    item.itemId && item.itemId !== 0 ? `id-${item.itemId}` : item.id;

  const prevMap = new Map((prevItems || []).map((item) => [keyOf(item), item]));
  const currMap = new Map((currentItems || []).map((item) => [keyOf(item), item]));

  (currentItems || []).forEach((item) => {
    const prev = prevMap.get(keyOf(item));
    const itemLabel = item.name || item.menuItemName || "Raw Material";

    if (!prev) {
      added.push(`${itemLabel} (Weight: ${item.weight || 0} ${item.unit || ""})`);
      return;
    }

    const fields = [
      ["agency", "Agency"],
      ["weight", "Weight"],
      ["unit", "Unit"],
      ["place", "Place"],
      
    ];

    fields.forEach(([field, label]) => {
      const prevVal = prev[field] ?? "-";
      const currVal = item[field] ?? "-";
      if (String(prevVal) !== String(currVal)) {
        fieldChanges.push(`${itemLabel} ${label}: ${prevVal} → ${currVal}`);
      }
    });

    const prevDate = prev.dateTime ? dayjs(prev.dateTime).format("DD/MM/YYYY hh:mm A") : "-";
    const currDate = item.dateTime ? dayjs(item.dateTime).format("DD/MM/YYYY hh:mm A") : "-";
    if (prevDate !== currDate) {
      fieldChanges.push(`${itemLabel} Date & Time: ${prevDate} → ${currDate}`);
    }
  });

  (prevItems || []).forEach((item) => {
    if (!currMap.has(keyOf(item))) {
      removed.push(item.name || item.menuItemName || "Raw Material");
    }
  });

  if (added.length) parts.push(`Added: ${added.join(", ")}`);
  if (removed.length) parts.push(`Removed: ${removed.join(", ")}`);
  if (fieldChanges.length) parts.push(`Changed: ${fieldChanges.join(", ")}`);

  return parts.length ? parts.join(" | ") : "No item-level changes detected.";
};

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && handleClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, hasUnsavedChanges]);

  const handleRemoveRow = async (id) => {
    const rowToDelete = rawMaterials.find((r) => r.id === id);

    if (rowToDelete?.itemId && rowToDelete.itemId !== 0) {
      const result = await Swal.fire({
        title: intl.formatMessage({
          id: "COMMON.ARE_YOU_SURE",
          defaultMessage: "Are you sure?",
        }),
        text: intl.formatMessage({
          id: "SIDEBAR_MODAL.DELETE_RAW_MATERIAL_WARNING",
          defaultMessage:
            "This will permanently delete this raw material item.",
        }),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: intl.formatMessage({
          id: "COMMON.YES_DELETE",
          defaultMessage: "Yes, delete it!",
        }),
        cancelButtonText: intl.formatMessage({
          id: "COMMON.CANCEL",
          defaultMessage: "Cancel",
        }),
      });

      if (!result.isConfirmed) {
        return;
      }

      try {
        const response = await DeleteRawMaterialItem(
          eventFunctionId,
          eventId,
          rowToDelete.itemId,
          rowToDelete.menuItemId,
        );

        if (response?.data?.success) {
          setRawMaterials((prev) => prev.filter((r) => r.id !== id));
          setHasUnsavedChanges(true);

          Swal.fire({
            title: intl.formatMessage({
              id: "COMMON.DELETED",
              defaultMessage: "Deleted!",
            }),
            text: intl.formatMessage({
              id: "SIDEBAR_MODAL.RAW_MATERIAL_DELETED",
              defaultMessage: "Raw material item has been deleted.",
            }),
            icon: "success",
            timer: 1500,
            showConfirmButton: false,
          });
        } else {
          throw new Error(response?.data?.message || "Delete failed");
        }
      } catch (error) {
        console.error("Error deleting raw material:", error);
        Swal.fire({
          title: intl.formatMessage({
            id: "COMMON.ERROR",
            defaultMessage: "Error",
          }),
          text:
            error.message ||
            intl.formatMessage({
              id: "SIDEBAR_MODAL.DELETE_FAILED",
              defaultMessage: "Failed to delete raw material item.",
            }),
          icon: "error",
        });
      }
    } else {
      setRawMaterials((prev) => prev.filter((r) => r.id !== id));
      setHasUnsavedChanges(true);
    }
  };

  const handleChange = (id, field, value) => {
    setHasUnsavedChanges(true);
    setRawMaterials((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;

        const updated = { ...r, [field]: value };

        if (field === "weight") {
          const weight = parseFloat(value) || 0;
          const supplierRate = r.supplierRate || 0;
          const hierarchy = r.unitHierarchy;
          const currentUnit = r.unit;

          let weightInBase = weight;
          if (hierarchy && currentUnit) {
            const masterUnitName = hierarchy.nameEnglish;
            if (currentUnit !== masterUnitName) {
              const childUnit = (hierarchy.children || []).find(
                (c) => c.nameEnglish === currentUnit,
              );
              const equivalentValue = childUnit?.equivalentValue ?? 1;
              weightInBase = weight / equivalentValue;
            }
          }
          updated.rawmaterial_rate = parseFloat(
            (supplierRate * weightInBase).toFixed(2),
          );
        }

        // ← ONLY ONE unit block
        if (field === "unit") {
          const hierarchy = r.unitHierarchy;
          if (hierarchy) {
            const allUnits = [
              { id: hierarchy.unitId, nameEnglish: hierarchy.nameEnglish },
              ...(hierarchy.children || []).map((c) => ({
                id: c.unitId,
                nameEnglish: c.nameEnglish,
              })),
            ];

            const toUnit = allUnits.find((u) => u.nameEnglish === value);
            updated.unitId = toUnit?.id;

            const supplierRate = r.supplierRate || 0;
            const currentWeight = parseFloat(r.weight) || 0;
            const masterUnitName = hierarchy.nameEnglish;

            let weightInBase = currentWeight;
            if (value !== masterUnitName) {
              const childUnit = (hierarchy.children || []).find(
                (c) => c.nameEnglish === value,
              );
              const equivalentValue = childUnit?.equivalentValue ?? 1;
              weightInBase = currentWeight / equivalentValue;
            }

            updated.rawmaterial_rate = parseFloat(
              (supplierRate * weightInBase).toFixed(2),
            );
          }
        }

        return updated;
      }),
    );
  };

  const handleAllocateAgency = () => {
    if (!selectedAgency) {
      Swal.fire({
        icon: "warning",
        title: intl.formatMessage({
          id: "COMMON.WARNING",
          defaultMessage: "Warning",
        }),
        text: intl.formatMessage({
          id: "SIDEBAR_MODAL.SELECT_AGENCY_FIRST",
          defaultMessage: "Please select an agency first",
        }),
      });
      return;
    }

    setRawMaterials((prev) =>
      prev.map((r) => ({ ...r, agency: selectedAgency })),
    );

    setHasUnsavedChanges(true);

    Swal.fire({
      icon: "success",
      title: intl.formatMessage({
        id: "COMMON.SUCCESS",
        defaultMessage: "Success",
      }),
      text: intl.formatMessage({
        id: "SIDEBAR_MODAL.AGENCY_ALLOCATED",
        defaultMessage: "Agency allocated to all items successfully",
      }),
      timer: 1500,
      showConfirmButton: false,
    });

    setSelectedAgency("");
  };

  const handleAllocatePlace = () => {
    if (!selectedPlace) {
      Swal.fire({
        icon: "warning",
        title: intl.formatMessage({
          id: "COMMON.WARNING",
          defaultMessage: "Warning",
        }),
        text: intl.formatMessage({
          id: "SIDEBAR_MODAL.SELECT_PLACE_FIRST",
          defaultMessage: "Please select a place first",
        }),
      });
      return;
    }

    setRawMaterials((prev) =>
      prev.map((r) => ({ ...r, place: selectedPlace })),
    );

    setHasUnsavedChanges(true);

    Swal.fire({
      icon: "success",
      title: intl.formatMessage({
        id: "COMMON.SUCCESS",
        defaultMessage: "Success",
      }),
      text: intl.formatMessage({
        id: "SIDEBAR_MODAL.PLACE_ALLOCATED",
        defaultMessage: "Place allocated to all items successfully",
      }),
      timer: 1500,
      showConfirmButton: false,
    });

    setSelectedPlace("");
  };

  const handleAddRow = () => {
  setHasUnsavedChanges(true);
  const newId = `row-${Date.now()}-new`;
  setLastNewRowId(newId);

  // Inherit dateTime from the most recent row that has one; fallback to eventDate
  const lastRowWithDate = [...rawMaterials].reverse().find((r) => r.dateTime);
  let defaultDate = lastRowWithDate?.dateTime || null;

  if (!defaultDate && eventDate) {
    const parsed = dayjs(eventDate, [
      "DD/MM/YYYY HH:mm:ss",
      "DD/MM/YYYY",
      "YYYY-MM-DDTHH:mm:ss",
      "YYYY-MM-DD HH:mm:ss",
      "YYYY-MM-DD",
    ]);
    defaultDate = parsed.isValid() ? parsed.toDate() : null;
  }

  setRawMaterials((prev) => [
    ...prev,
    {
      id: newId,
      itemId: 0,
      name: "",
      menuItemName: prev[0]?.menuItemName || "",
      agency: "",
      dateTime: defaultDate, // ← now inherited from last row, not always eventDate
      weight: "",
      unit: "",
      place: "",
      rawMaterialId: 0,
      menuItemId: selectedRowData?.menuItemId || prev[0]?.menuItemId || 0,
      rate: 0,
      rawmaterial_rate: 0,
      rawmaterial_weight: 0,
      isNew: true,
      isNewRaw: true,
      supplierRate: 0,
      hierarchyUnits: [],
      unitHierarchy: null,
    },
  ]);

  setTimeout(() => {
    const el = document.getElementById(`new-row-${newId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
    }
  }, 100);
};

  const handleRawMaterialAdded = () => {
    if (lastNewRowId) {
      setRmMenuItems((prev) => ({ ...prev, [lastNewRowId]: [] }));
      fetchRMForRow(lastNewRowId, "", 1, false);
    }
  };

 const handleSubmit = async () => {
  if (isSubmitting) return; 
  setIsSubmitting(true);
    try {
      if (
        !selectedRowData ||
        !selectedRowData["MenuItem RawMaterial Details"]
      ) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Missing required data. Please try again.",
        });
        return;
      }

      const payload = rawMaterials.map((item) => {
        const partyId =
          suppliers.find((s) => s.nameEnglish === item.agency)?.id || 0;
        const unitId =
          unit.find((u) => u.nameEnglish === item.unit)?.id || item.unitId || 0;
        const masterRawUnitId = item.unitHierarchy?.unitId || 0;

        const supplierRate = item.supplierRate || 0;
        const weight = parseFloat(item.weight) || 0;
        const hierarchy = item.unitHierarchy;
        const currentUnit = item.unit;

        let weightInBase = weight;
        if (hierarchy && currentUnit) {
          const masterUnitName = hierarchy.nameEnglish;
          if (currentUnit !== masterUnitName) {
            const childUnit = (hierarchy.children || []).find(
              (c) => c.nameEnglish === currentUnit,
            );
            const equivalentValue = childUnit?.equivalentValue ?? 1;
            weightInBase = weight / equivalentValue;
          }
        }

        const calculatedRate =
          supplierRate > 0 && weight > 0
            ? parseFloat((supplierRate * weightInBase).toFixed(2))
            : item.rawmaterial_rate || 0;

        return {
          id: item.itemId || 0,
          eventId: eventId || 0,
          eventFunctionId: eventFunctionId || 0,
          menuItemId: item.menuItemId || 0,
          rawMaterialId: item.rawMaterialId || 0,
          partyId,
          unitId,
          dateTime: item.dateTime
            ? dayjs(item.dateTime).format("DD/MM/YYYY hh:mm A")
            : "",
          weight: Number(item.weight) || 0,
          rawmaterial_weight: Number(item.rawmaterial_weight) || 1,
          rate: calculatedRate, 
          rawmaterial_rate: 0,
          place: item.place || "",
          isCaptainReceipe: item.isCaptainReceipe ?? false,
          isNewRaw: item.isNewRaw ?? false,
          supRate: item.supplierRate || 0,
          masterRawUnitId,
        };
      });

      // ── Build a log-friendly view that mirrors EXACTLY what's in payload ──
      // (same order as rawMaterials.map above, so index-align them)
      const loggedItems = payload.map((p, idx) => {
        const original = rawMaterials[idx] || {};
        return {
          id: original.id,
          itemId: original.itemId || 0,
          name: original.name || original.menuItemName || "Raw Material",
          menuItemName: original.menuItemName || "",
          agency: original.agency || "",
          weight: p.weight,               
          unit: original.unit || "",
          place: p.place,                 
          rawmaterial_rate: p.rate,        
          dateTime: original.dateTime,
        };
      });

      const hasInvalidData = payload.some(
        (item) =>
          !item.eventId ||
          !item.eventFunctionId ||
          !item.menuItemId ||
          !item.rawMaterialId,
      );

      if (hasInvalidData) {
        Swal.fire({
          icon: "warning",
          title: "Incomplete Data",
          text: "Please ensure all required fields are filled.",
        });
        return;
      }

      const res = await SelectedRawMenuallocation(payload);

      if (res?.data?.success === true) {
        setHasUnsavedChanges(false);
        Swal.fire({ icon: "success", title: "Saved!", text: "Raw material data saved successfully." });

      
        try {
          const changeSummary = buildRawMaterialChangeSummary(
            initialRawMaterialsRef.current,
            loggedItems,
          );

          await AddLogs({
            id: 0,
            eventId: eventId || 0,
            description: `Raw Material Allocation (${allocationType || "-"}) saved | Menu Item: ${
              rawMaterials[0]?.menuItemName || selectedRowData?.menuItemName || "-"
            } | Saved By: ${userEmail || "Unknown User"} | Total Items: ${
              rawMaterials.length
            } | Changes: ${changeSummary}`,
            eventType: "Raw Material Allocation Update",
            user: userEmail,
          });
        } catch (logErr) {
          console.error("Log failed (non-blocking):", logErr);
        }

        let freshData = [];

        try {
          const refresh = await SelectedItemNameMenuAllocation(
            eventFunctionId,
            payload[0]?.menuItemId,
          );

          if (refresh?.data?.success) {
            freshData =
              refresh.data.data["MenuItem RawMaterial Details"] ||
              refresh.data.data.menuItemRawMaterials ||
              [];

            const refreshedRows = freshData.map((item, index) => {
              const hierarchy = item.unitHierarchy || null;
              const hierarchyUnits = [];
              if (hierarchy) {
                hierarchyUnits.push({
                  id: hierarchy.unitId,
                  nameEnglish: hierarchy.nameEnglish,
                });
                (hierarchy.children || []).forEach((child) => {
                  hierarchyUnits.push({
                    id: child.unitId,
                    nameEnglish: child.nameEnglish,
                  });
                });
              }
              return {
                id: `row-${Date.now()}-${index}`,
                itemId: item.id || 0,
                name: item.rawMaterialName || "",
                menuItemName: item.menuItemName || "-",
                agency: item.partyName || "",
                dateTime: parseDateToObject(item.dateTime),
                weight: item.weight || "",
                unit: item.unitName || item.units?.nameEnglish || "",
                place: item.place || "",
                rawMaterialId: item.rawMaterialId || 0,
                menuItemId: item.menuItemId || 0,
                rate: item.rate || 0,
                rawmaterial_rate: item.rate || 0,
                rawmaterial_weight: item.rawmaterial_weight || 0,
                supplierRate: item.supRate || item.supplierRate || 0,
                unitHierarchy: hierarchy,
                hierarchyUnits,
                isNewRaw: item.isNewRaw ?? false,
              };
            });

            setRawMaterials(refreshedRows);
            initialRawMaterialsRef.current = JSON.parse(
              JSON.stringify(refreshedRows),
            );
          }
        } catch (err) {
          console.error("Error refresh raw materials:", err);
        }

        if (onSave) {
          onSave({
            menuItemId: payload[0]?.menuItemId,
            eventFunctionId,
            eventId,
            rawMaterials: freshData,
            response: res.data,
            shouldRefresh: true,
          });
        }

        onClose();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res?.data?.message || "An unexpected error occurred.",
        });
      }
    } catch (err) {
      console.error("Submit Error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "An unexpected error occurred.",
      });
    }
    finally {
    setIsSubmitting(false); 
  }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              role="dialog"
              aria-modal="true"
              className="pointer-events-auto absolute top-6 bottom-6 right-6 w-[1300px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
              initial={{ x: "110%" }}
              animate={{ x: 0 }}
              exit={{ x: "110%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[18px] font-semibold text-gray-800">
                    {rawMaterials.length > 0
                      ? rawMaterials[0].menuItemName || "—"
                      : selectedRowData?.menuItemName || "—"}
                  </div>
                </div>
                <button
  className="h-9 px-3 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
  onClick={handleClose}
  disabled={isSubmitting}
  autoFocus
>
  <FormattedMessage id="COMMON.CLOSE" defaultMessage="Close" />
</button>
              </div>

              <div className="flex flex-col flex-1 min-h-0">
                <div className="p-5 flex-shrink-0">
                  <div className="flex items-start justify-between gap-4 mt-4">
                    {/* LEFT SIDE CONTROLS */}
                    <div className="flex items-end gap-4">
                      {/* Agency */}
                      <div className="flex items-end gap-2">
                        <select
                          className="select pe-7.5"
                          value={selectedAgency}
                          onChange={(e) => setSelectedAgency(e.target.value)}
                        >
                          <option value="">
                            <FormattedMessage
                              id="SIDEBAR_MODAL.SELECT_AGENCY"
                              defaultMessage="Select Agency"
                            />
                          </option>

                          {loading && (
                            <option>
                              <FormattedMessage
                                id="SIDEBAR_MODAL.LOADING"
                                defaultMessage="Loading..."
                              />
                            </option>
                          )}

                          {!loading && suppliers.length > 0
                            ? suppliers.map((agency) => (
                                <option
                                  key={agency.id}
                                  value={agency.nameEnglish}
                                >
                                  {agency.nameEnglish}
                                </option>
                              ))
                            : !loading && (
                                <option>
                                  <FormattedMessage
                                    id="COMMON.NO_AGENCY_FOUND"
                                    defaultMessage="No agencies found"
                                  />
                                </option>
                              )}
                        </select>

                        <button
                          className="btn btn-primary"
                          onClick={handleAllocateAgency}
                          disabled={!selectedAgency}
                        >
                          <FormattedMessage
                            id="COMMON.ALLOCATE"
                            defaultMessage="Allocate"
                          />
                        </button>
                      </div>

                      {/* Place */}
                      <div className="flex items-end gap-2 w-[200px] h-10">
                        <PlaceSelect
                          className="h-10"
                          placeholder="Select venue"
                          value={selectedPlace}
                          onChange={(value) => setSelectedPlace(value)}
                        />

                        <button
                          className="btn btn-primary"
                          onClick={handleAllocatePlace}
                          disabled={!selectedPlace}
                        >
                          <FormattedMessage
                            id="COMMON.ALLOCATE"
                            defaultMessage="Allocate"
                          />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                        onClick={handleAddRow}
                      >
                        <span>Add Row</span>
                        <Plus className="w-5 h-5" />
                      </button>
                      <button
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#005BA8] text-white font-semibold hover:bg-[#004a8a]"
                        onClick={() => setIsMemberModalOpen(true)}
                      >
                        <span>Add Vendor</span>
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-5 min-h-0">
                  {rawMaterials.length === 0 ? (
                    <div className="flex items-center justify-center h-full p-8">
                      <div className="text-center">
                        <i className="ki-filled ki-information-2 text-6xl text-gray-300 mb-4"></i>
                        <p className="text-lg font-medium text-gray-700 mb-2">
                          <FormattedMessage
                            id="SIDEBAR_MODAL.NO_RAW_MATERIALS"
                            defaultMessage="No raw materials found for this item"
                          />
                        </p>
                        <p className="text-sm text-gray-500">
                          <FormattedMessage
                            id="SIDEBAR_MODAL.NO_RAW_MATERIALS_DESC"
                            defaultMessage="This menu item doesn't have any raw materials allocated yet."
                          />
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                      <div
                        className={`${GRID} items-center px-5 py-3 bg-[#F9FAFC] text-[13px] font-medium text-gray-900`}
                      >
                        <div>
                          <FormattedMessage
                            id="SIDEBAR_MODAL.NO"
                            defaultMessage="No."
                          />
                        </div>
                        <div className="pl-6 flex items-center gap-2">
                          <FormattedMessage
                            id="SIDEBAR_MODAL.ITEM_NAME"
                            defaultMessage="Item Name"
                          />
                          <button
                            type="button"
                            onClick={() => setIsAddRawMaterialOpen(true)}
                            className="w-6 h-6 rounded-full p-1 bg-blue-600 hover:bg-blue-700 flex items-center justify-center flex-shrink-0"
                            title="Add new raw material"
                          >
                            <Plus size={24} className=" text-white " />
                          </button>
                        </div>
                        <div className="pl-4">
                          <FormattedMessage
                            id="SIDEBAR_MODAL.AGENCY"
                            defaultMessage="Agency"
                          />
                        </div>
                        <div className="pl-4">
                          <FormattedMessage
                            id="SIDEBAR_MODAL.DATE_TIME"
                            defaultMessage="Date &amp; Time"
                          />
                        </div>
                        <div className="pl-3">
                          <FormattedMessage
                            id="SIDEBAR_MODAL.WEIGHT"
                            defaultMessage="Weight"
                          />
                        </div>
                        <div className="pl-2">
                          <FormattedMessage
                            id="SIDEBAR_MODAL.UNIT"
                            defaultMessage="Unit"
                          />
                        </div>
                        <div className="pl-2">
                          <FormattedMessage
                            id="SIDEBAR_MODAL.PLACE"
                            defaultMessage="Place"
                          />
                        </div>
                        <div className="text-center">
                          <FormattedMessage
                            id="SIDEBAR_MODAL.ACTIONS"
                            defaultMessage="Action"
                          />
                        </div>
                      </div>

                      {rawMaterials.map((row, idx) => (
                        <div
                          key={row.id}
                          id={row.isNew ? `new-row-${row.id}` : undefined}
                          className={`${GRID} items-center gap-4 px-5 py-3 border-t border-gray-100 hover:bg-gray-50/60`}
                        >
                          <div className="text-[13px] text-gray-700">
                            {idx + 1}.
                          </div>
                          <div className="pl-2">
                            {row.isNew ? (
                              <Select
                                autoFocus
                                defaultOpen
                                showSearch
                                placeholder="Search item..."
                                value={row.rawMaterialId || undefined}
                                filterOption={false}
                                style={{ width: "100%", minWidth: 160 }}
                                onSearch={(val) => {
                                  setRmSearchQuery((prev) => ({
                                    ...prev,
                                    [row.id]: val,
                                  }));
                                  fetchRMForRow(row.id, val, 1, false);
                                }}
                                onDropdownVisibleChange={(open) => {
                                  if (open && !rmMenuItems[row.id]?.length) {
                                    fetchRMForRow(row.id, "", 1, false);
                                  }
                                }}
                                onSelect={(value, option) => {
                                  setHasUnsavedChanges(true);
                                  setRawMaterials((prev) => {
                                    const alreadyExists = prev.some(
                                      (r) =>
                                        r.rawMaterialId === value &&
                                        r.id !== row.id,
                                    );

                                    if (alreadyExists) {
                                      Swal.fire({
                                        icon: "warning",
                                        title: intl.formatMessage({
                                          id: "COMMON.WARNING",
                                          defaultMessage: "Warning",
                                        }),
                                        text: intl.formatMessage({
                                          id: "SIDEBAR_MODAL.DUPLICATE_RAW_MATERIAL",
                                          defaultMessage:
                                            "This raw material is already added.",
                                        }),
                                      });
                                      return prev;
                                    }

                                    const raw = option.raw;
                                    const hierarchy = raw.unitHierarchy || null;

                                    const hierarchyUnits = [];
                                    if (hierarchy) {
                                      hierarchyUnits.push({
                                        id: hierarchy.unitId,
                                        nameEnglish: hierarchy.nameEnglish,
                                      });
                                      (hierarchy.children || []).forEach(
                                        (child) => {
                                          hierarchyUnits.push({
                                            id: child.unitId,
                                            nameEnglish: child.nameEnglish,
                                          });
                                        },
                                      );
                                    }

                                    return prev.map((r) => {
                                      if (r.id !== row.id) return r;

                                      const supplierRate =
                                        raw.supRate || raw.supplierRate || 0;
                                      const defaultUnitName =
                                        raw.unit?.nameEnglish || "";
                                      const currentWeight =
                                        parseFloat(r.weight) || 0;
                                      const masterUnitName =
                                        hierarchy?.nameEnglish || "";

                                      // ── Calculate rate immediately if weight already exists ──
                                      let rawmaterial_rate = 0;
                                      if (
                                        currentWeight > 0 &&
                                        supplierRate > 0
                                      ) {
                                        let weightInBase = currentWeight;
                                        if (
                                          hierarchy &&
                                          defaultUnitName &&
                                          defaultUnitName !== masterUnitName
                                        ) {
                                          const childUnit = (
                                            hierarchy.children || []
                                          ).find(
                                            (c) =>
                                              c.nameEnglish === defaultUnitName,
                                          );
                                          const equivalentValue =
                                            childUnit?.equivalentValue ?? 1;
                                          weightInBase =
                                            currentWeight / equivalentValue;
                                        }
                                        rawmaterial_rate = parseFloat(
                                          (supplierRate * weightInBase).toFixed(
                                            2,
                                          ),
                                        );
                                      }

                                      return {
                                        ...r,
                                        name: raw.nameEnglish || "",
                                        rawMaterialId: raw.id || 0,
                                        rawMaterialCatId:
                                          raw.rawMaterialCat?.id || 0,
                                        unit: defaultUnitName,
                                        unitId: raw.unit?.id || 0,
                                        unitHierarchy: hierarchy,
                                        hierarchyUnits,
                                        supplierRate,
                                        masterRawUnitId:
                                          hierarchy?.unitId ||
                                          raw.unit?.id ||
                                          0,
                                        rawmaterial_rate, // ← calculated immediately on select
                                      };
                                    });
                                  });
                                }}
                                notFoundContent={
                                  rmLoading[row.id]
                                    ? "Loading..."
                                    : "No items found"
                                }
                                options={(rmMenuItems[row.id] || []).map(
                                  (item) => ({
                                    value: item.id,
                                    label: item.nameEnglish,
                                    raw: item,
                                  }),
                                )}
                                onPopupScroll={(e) => {
                                  const t = e.target;
                                  if (
                                    t.scrollTop + t.offsetHeight >=
                                      t.scrollHeight - 10 &&
                                    rmHasMore[row.id] &&
                                    !rmLoading[row.id]
                                  ) {
                                    fetchRMForRow(
                                      row.id,
                                      rmSearchQuery[row.id] || "",
                                      (rmPage[row.id] || 1) + 1,
                                      true,
                                    );
                                  }
                                }}
                              />
                            ) : (
                              <span className="text-[13px] text-gray-800">
                                {row.name || "—"}
                              </span>
                            )}
                          </div>

                          <div>
                            <BaseSelect
                              value={row.agency || ""}
                              onChange={(e) =>
                                handleChange(row.id, "agency", e.target.value)
                              }
                            >
                              <option value="">
                                <FormattedMessage
                                  id="SIDEBAR_MODAL.SELECT_AGENCY"
                                  defaultMessage="Select Agency"
                                />
                              </option>
                              {suppliers.map((s, i) => (
                                <option key={i} value={s.nameEnglish}>
                                  {s.nameEnglish}
                                </option>
                              ))}
                            </BaseSelect>
                          </div>

                          <div>
                            <DatePicker
                              selected={row.dateTime}
                              onChange={(date) =>
                                handleChange(row.id, "dateTime", date)
                              }
                              showTimeSelect
                              timeFormat="hh:mm aa"
                              timeIntervals={15}
                              dateFormat="dd/MM/yyyy hh:mm aa"
                              className={baseField}
                              placeholderText="Select date & time"
                            />
                          </div>

                          <div>
                            <BaseInput
                              type="text"
                              value={row.weight || ""}
                              onChange={(e) =>
                                handleChange(row.id, "weight", e.target.value)
                              }
                              placeholder={intl.formatMessage({
                                id: "SIDEBAR_MODAL.WEIGHT_PLACEHOLDER",
                                defaultMessage: "Enter weight",
                              })}
                            />
                          </div>

                          <div>
                            <BaseSelect
                              value={row.unit || ""}
                              onChange={(e) =>
                                handleChange(row.id, "unit", e.target.value)
                              }
                            >
                              <option value="">Select Unit</option>
                              {(row.hierarchyUnits?.length
                                ? row.hierarchyUnits
                                : unit
                              ).map((u, i) => (
                                <option key={i} value={u.nameEnglish}>
                                  {u.nameEnglish}
                                </option>
                              ))}
                            </BaseSelect>
                          </div>

                          <div>
  <PlaceSelect
    value={row.place || ""}
    placeholder="Select venue"
    onChange={(val) =>
      handleChange(row.id, "place", val)
    }
  />
</div>

                          <div className="flex items-center justify-center">
                            <Tooltip title="Remove">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(row.id)}
                                className="btn btn-sm btn-icon btn-danger btn-clear"
                              >
                                <i className="ki-filled ki-trash"></i>
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 p-5 border-t border-gray-200 bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <button
  onClick={handleClose}
  disabled={isSubmitting}
  className="h-9 px-4 rounded-md border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
>
  <FormattedMessage id="COMMON.CANCEL" defaultMessage="Cancel" />
</button>
                   <button
  onClick={handleSubmit}
  className="h-9 px-4 rounded-md bg-primary text-white text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
  disabled={rawMaterials.length === 0 || isSubmitting}
>
  {isSubmitting ? (
    <FormattedMessage id="COMMON.SAVING" defaultMessage="Saving..." />
  ) : (
    <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
  )}
</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}{" "}
      <AddContactName
        isModalOpen={isMemberModalOpen}
        setIsModalOpen={setIsMemberModalOpen}
        refreshData={FetchAllSuplier}
        concatId={concatId}
      />
      <AddRawMaterial
        isOpen={isAddRawMaterialOpen}
        onClose={() => setIsAddRawMaterialOpen(false)}
        setIsModalOpen={setIsAddRawMaterialOpen}
        refreshData={handleRawMaterialAdded}
      />
    </AnimatePresence>
  );
}
