import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import AllocateRowChef from "../components/AllocateRowChef";
import ChefLabourTable from "../components/ChefLabourTable";
import { MenuAllocationSave, AddLogs  } from "@/services/apiServices";
import Swal from "sweetalert2";

export default function ChefLabourSection({
  data,
  onDataUpdate,
  close,
  vendorRefreshTrigger,
  isAllFunctions,
  onDirtyChange,
  isDirty,
  onSectionSave,
}) {
  const [selectedItems, setSelectedItems] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [saving, setSaving] = useState(false);

  const changedPaxItemsRef = useRef(new Set());
  const initialMenuItemsRef = useRef([]);


  const mapAllocation = (alloc, personCount) => {
  const quantity = alloc.quantity || personCount || 0;
  const rawServiceType = alloc.serviceType || "";
  const serviceType = rawServiceType.toLowerCase().replace(/\s+/g, "_");
  const shiftTrans = parseFloat(alloc.shiftTransPrice) || 0;

  let calculatedTotal = 0;
  if (alloc.totalPrice == null) {
    if (serviceType === "counter_wise") {
      calculatedTotal =
        (parseFloat(alloc.counterQuantity) || 0) * (parseFloat(alloc.counterPrice) || 0) +
        (parseFloat(alloc.helperQuantity) || 0) * (parseFloat(alloc.helperPrice) || 0) +
        shiftTrans;
    } else {
      calculatedTotal =
        (parseFloat(quantity) || 0) * (parseFloat(alloc.price) || 0) + shiftTrans;
    }
  }

  return {
    ...alloc,
    quantity,
    serviceType,
    totalPrice: alloc.totalPrice ?? calculatedTotal,
      reportingTime: formatTime24hr(alloc.reportingTime || ""),

  };
};

const formatTime24hr = (time12) => {
  if (!time12) return "";
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return time12; 
  let [, h, m, period] = match;
  h = parseInt(h, 10);
  if (period.toUpperCase() === "PM" && h !== 12) h += 12;
  if (period.toUpperCase() === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${m}`;
};


const formatTime12hr = (time24) => {
  if (!time24) return "";
  if (/AM|PM/i.test(time24)) return time24; 
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  if (isNaN(hour)) return time24;
  const period = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${minuteStr} ${period}`;
};

useEffect(() => {
  if (data && Array.isArray(data)) {
    if (isAllFunctions) {
      const allMenuItems = data.flatMap((functionData, functionIndex) => {
        const allocations = functionData?.menuAllocation || [];
        return allocations.map((allocation) => ({
          ...allocation,
          _functionIndex: functionIndex,
          _functionId: functionData.eventFunction?.id,
          _functionName: functionData.eventFunction?.function?.nameEnglish,
          _functionPax: functionData.eventFunction?.pax,
          eventFunctionId: functionData.eventFunction?.id,
          eventFunctionName: functionData.eventFunction?.function?.nameEnglish,
          eventFunctionMenuAllocations: allocation.eventFunctionMenuAllocations?.map(
            (alloc) => mapAllocation(alloc, allocation.personCount)  
          ),
        }));
      });
      setMenuItems(allMenuItems);
      initialMenuItemsRef.current = JSON.parse(JSON.stringify(allMenuItems));
    } else {
      const allocations = data[0]?.menuAllocation || [];
      const allocationsWithDefaults = allocations.map((allocation) => ({
        ...allocation,
        eventFunctionMenuAllocations: allocation.eventFunctionMenuAllocations?.map(
          (alloc) => mapAllocation(alloc, allocation.personCount)  
        ),
      }));
      setMenuItems(allocationsWithDefaults);
      initialMenuItemsRef.current = JSON.parse(JSON.stringify(allocationsWithDefaults));
    }
  } else {
    setMenuItems([]);
    initialMenuItemsRef.current = [];
  }
  changedPaxItemsRef.current.clear();
}, [data, isAllFunctions]);

  // useEffect(() => {
  //   if (data && Array.isArray(data)) {
  //     if (isAllFunctions) {
  //       const allMenuItems = data.flatMap((functionData, functionIndex) => {
  //         const allocations = functionData?.menuAllocation || [];
  //         return allocations.map((allocation) => ({
  //           ...allocation,
  //           _functionIndex: functionIndex,
  //           _functionId: functionData.eventFunction?.id,
  //           _functionName: functionData.eventFunction?.function?.nameEnglish,
  //           _functionPax: functionData.eventFunction?.pax,
  //           eventFunctionId: functionData.eventFunction?.id,
  //           eventFunctionName: functionData.eventFunction?.function?.nameEnglish,
  //           eventFunctionMenuAllocations:
  //             allocation.eventFunctionMenuAllocations?.map((alloc) => ({
  //               ...alloc,
  //               quantity: alloc.quantity || allocation.personCount || 0,
  //             })),
  //         }));
  //       });
  //       setMenuItems(allMenuItems);
  //       initialMenuItemsRef.current = JSON.parse(JSON.stringify(allMenuItems));
  //     } else {
  //       const allocations = data[0]?.menuAllocation || [];
  //       const allocationsWithDefaults = allocations.map((allocation) => ({
  //         ...allocation,
  //         eventFunctionMenuAllocations:
  //           allocation.eventFunctionMenuAllocations?.map((alloc) => ({
  //             ...alloc,
  //             quantity: alloc.quantity || allocation.personCount || 0,
  //           })),
  //       }));
  //       setMenuItems(allocationsWithDefaults);
  //       initialMenuItemsRef.current = JSON.parse(JSON.stringify(allocationsWithDefaults));
  //     }
  //   } else {
  //     setMenuItems([]);
  //     initialMenuItemsRef.current = [];
  //   }
  //   changedPaxItemsRef.current.clear();
  // }, [data, isAllFunctions]);

  const selectedCount = useMemo(
    () => Object.values(selectedItems).filter(Boolean).length,
    [selectedItems],
  );

  const handleItemSelect = useCallback((itemKey, isChecked) => {
    setSelectedItems((prev) => ({ ...prev, [itemKey]: isChecked }));
  }, []);

  const handleAllocate = useCallback(
    (allocationData) => {
      const hasSelectedItems = Object.values(selectedItems).some(Boolean);
      if (!hasSelectedItems) {
        Swal.fire({ title: "Warning", text: "Please select at least one item to allocate", icon: "warning" });
        return false;
      }

      if (
        !allocationData.partyId &&
        !allocationData.serviceType &&
        !allocationData.pax &&
        !allocationData.quantity &&
        allocationData.shiftTransPrice === undefined
      ) {
        Swal.fire({ title: "Warning", text: "Please provide at least one allocation value", icon: "warning" });
        return false;
      }

      let allocatedCount = 0;

      const updatedMenuItems = menuItems.map((menuItem, menuIndex) => {
        if (!Array.isArray(menuItem.eventFunctionMenuAllocations)) return menuItem;

        const updatedAllocations = menuItem.eventFunctionMenuAllocations.map(
          (allocation, allocationIndex) => {
            const itemKey = `${menuIndex}-${allocationIndex}`;
            if (!selectedItems[itemKey]) return allocation;

            allocatedCount++;
            const updates = {};

            if (allocationData.partyId !== undefined) {
              updates.partyId = allocationData.partyId;
              updates.partyName = allocationData.partyName || "";
              updates.number = allocationData.number || "";
            }
            if (allocationData.serviceType !== undefined) updates.serviceType = allocationData.serviceType;
            if (allocationData.pax !== undefined) updates.quantity = allocationData.pax;
            if (allocationData.quantity !== undefined) updates.quantity = allocationData.quantity;
            if (allocationData.shiftTransPrice !== undefined)
              updates.shiftTransPrice = allocationData.shiftTransPrice;

            const effectiveType = updates.serviceType ?? allocation.serviceType ?? "plate_wise";
            const merged = { ...allocation, ...updates };
            const shiftTrans = parseFloat(merged.shiftTransPrice) || 0;

            if (!effectiveType || effectiveType === "plate_wise") {
              const qty = parseFloat(merged.quantity) || 0;
              const price = parseFloat(merged.price) || 0;
              updates.totalPrice = qty * price + shiftTrans;
            } else if (effectiveType === "counter_wise") {
              const cQty = parseFloat(merged.counterQuantity) || 0;
              const hQty = parseFloat(merged.helperQuantity) || 0;
              const cPrice = parseFloat(merged.counterPrice) || 0;
              const hPrice = parseFloat(merged.helperPrice) || 0;
              updates.totalPrice = cQty * cPrice + hQty * hPrice + shiftTrans;
            }

            return { ...allocation, ...updates };
          },
        );

        const hasUpdatedAllocations = menuItem.eventFunctionMenuAllocations.some(
          (_, allocationIndex) => selectedItems[`${menuIndex}-${allocationIndex}`],
        );

        if (hasUpdatedAllocations && allocationData.pax !== undefined) {
          const itemKey = `${menuItem.menuItemId}-${menuItem.menuCategoryId}-${menuItem.eventFunctionId}`;
          const initialItem = initialMenuItemsRef.current[menuIndex];
          if (initialItem && initialItem.personCount !== allocationData.pax) {
            changedPaxItemsRef.current.add(itemKey);
          }
        }

        return {
          ...menuItem,
          eventFunctionMenuAllocations: updatedAllocations,
          ...(hasUpdatedAllocations &&
            allocationData.pax !== undefined && { personCount: allocationData.pax }),
        };
      });

      setMenuItems(updatedMenuItems);
       onDirtyChange?.(true);
      if (onDataUpdate) onDataUpdate(updatedMenuItems);
      setSelectedItems({});

      Swal.fire({
        title: "Success",
        text: `Updated ${allocatedCount} selected item(s) successfully`,
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      return true;
    },
    [menuItems, selectedItems, onDataUpdate],
  );

const handleCancel = useCallback(() => {
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
        close?.();
      }
    });
  } else {
    close?.();
  }
}, [isDirty, close]);

  const handleMenuItemUpdate = useCallback(
    (menuIndex, updatedMenuItem) => {
      setMenuItems((prev) => {
        const updated = [...prev];
        const initialItem = initialMenuItemsRef.current[menuIndex];
        if (initialItem && initialItem.personCount !== updatedMenuItem.personCount) {
          const itemKey = `${updatedMenuItem.menuItemId}-${updatedMenuItem.menuCategoryId}-${updatedMenuItem.eventFunctionId}`;
          changedPaxItemsRef.current.add(itemKey);
        }
        updated[menuIndex] = updatedMenuItem;
        return updated;
      });

      onDirtyChange?.(true); 

      if (onDataUpdate) {
        const updated = [...menuItems];
        updated[menuIndex] = updatedMenuItem;
        onDataUpdate(updated);
      }
    },
    [menuItems, onDataUpdate],
  );

  const buildPayload = useCallback(() => {
    const userId = Number(localStorage.getItem("userId"));

    return menuItems.map((menuItem) => {
      const itemKey = `${menuItem.menuItemId}-${menuItem.menuCategoryId}-${menuItem.eventFunctionId}`;
      const isPaxChange = changedPaxItemsRef.current.has(itemKey);

      return {
        chefLabour: true,
        eventFunctionId: menuItem.eventFunctionId || 0,
        eventId: menuItem.eventId || 0,
        id: menuItem.id || 0,
        inside: false,
        outside: false,
        instructions: menuItem.instructions || "",
        menuCategoryId: menuItem.menuCategoryId || 0,
        menuItemId: menuItem.menuItemId || 0,
        personCount: menuItem.personCount || 0,
        oldPersonCount: menuItem.oldPersonCount || 0,
        isPaxChange,
        menuItemRawMaterials: [],
        place: menuItem.place || "",
        userId,
        // menuAllocationOrders:
        //   menuItem.eventFunctionMenuAllocations?.map((allocation) => ({
        //     id: allocation.id || 0,
        //     partyId: allocation.partyId || 0,
        //     number: "",
        //     serviceType: allocation.serviceType || "plate_wise",
        //     quantity: allocation.quantity || 0,
        //     price: allocation.price || 0,
        //     counterQuantity: allocation.counterQuantity || 0,
        //     counterPrice: allocation.counterPrice || 0,
        //     helperQuantity: allocation.helperQuantity || 0,
        //     helperPrice: allocation.helperPrice || 0,
        //     shiftTransPrice: parseFloat(allocation.shiftTransPrice) || 0,
        //     totalPrice: allocation.totalPrice || 0,
        //     unitId: allocation.unitId || 0,
        //     remarks: "",
        //     isOutside: false,
        //   })) || [],


        menuAllocationOrders:
  menuItem.eventFunctionMenuAllocations?.map((allocation) => {
    const shiftTrans = parseFloat(allocation.shiftTransPrice) || 0;
    const serviceType = (allocation.serviceType || "plate_wise").toLowerCase().replace(/\s+/g, "_");

    // Always recalculate totalPrice to ensure it's never 0/null on save
    let totalPrice = parseFloat(allocation.totalPrice) || 0;
    if (!totalPrice) {
      if (serviceType === "counter_wise") {
        totalPrice =
          (parseFloat(allocation.counterQuantity) || 0) * (parseFloat(allocation.counterPrice) || 0) +
          (parseFloat(allocation.helperQuantity) || 0) * (parseFloat(allocation.helperPrice) || 0) +
          shiftTrans;
      } else {
        totalPrice =
          (parseFloat(allocation.quantity) || 0) * (parseFloat(allocation.price) || 0) +
          shiftTrans;
      }
    }

    return {
      id: allocation.id || 0,
      partyId: allocation.partyId || 0,
      number: "",
      serviceType: allocation.serviceType || "plate_wise",
      quantity: allocation.quantity || 0,
      price: allocation.price || 0,
      counterQuantity: allocation.counterQuantity || 0,
      counterPrice: allocation.counterPrice || 0,
      helperQuantity: allocation.helperQuantity || 0,
      helperPrice: allocation.helperPrice || 0,
      shiftTransPrice: shiftTrans,
      totalPrice, 
      unitId: allocation.unitId || 0,
      remarks: "",
      isOutside: false,
        reportingTime: formatTime12hr(allocation.reportingTime || ""),
      
    };
  }) || [],
      };
    });
  }, [menuItems]);


  const userEmail = (() => {
  try {
    return (
      JSON.parse(localStorage.getItem("auth-storage"))?.state?.user?.email || ""
    );
  } catch {
    return "";
  }
})();

const buildChefLabourChangeSummary = (prevItems, currentItems) => {
  const parts = [];
  const personChanges = [];
  const allocationChanges = [];
  const instructionChanges = [];

  currentItems.forEach((item, idx) => {
    const prev = prevItems[idx];
    if (!prev) return;

    const itemLabel = item.itemName || item.menuItemName || `Item ${item.menuItemId}`;

    if (Number(prev.personCount || 0) !== Number(item.personCount || 0)) {
      personChanges.push(`${itemLabel}: ${prev.personCount || 0} → ${item.personCount || 0}`);
    }

    if ((prev.instructions || "") !== (item.instructions || "")) {
      instructionChanges.push(`${itemLabel}: "${item.instructions || "cleared"}"`);
    }

    const prevAllocs = prev.eventFunctionMenuAllocations || [];
    const currAllocs = item.eventFunctionMenuAllocations || [];
    const maxLen = Math.max(prevAllocs.length, currAllocs.length);

    for (let i = 0; i < maxLen; i++) {
      const pa = prevAllocs[i];
      const ca = currAllocs[i];

      if (!pa && ca) {
        allocationChanges.push(`${itemLabel}: added party ${ca.partyName || ca.partyId || "-"}`);
        continue;
      }
      if (pa && !ca) {
        allocationChanges.push(`${itemLabel}: removed party ${pa.partyName || pa.partyId || "-"}`);
        continue;
      }
      if (!pa || !ca) continue;

      const partyLabel = ca.partyName || pa.partyName || "party";
      const fields = [
        ["partyName", "Party"], 
        ["serviceType", "Service Type"],
        ["quantity", "Qty"],
        ["price", "Price"],
        ["counterQuantity", "Counter Qty"],
        ["counterPrice", "Counter Price"],
        ["helperQuantity", "Helper Qty"],
        ["helperPrice", "Helper Price"],
        ["shiftTransPrice", "Transport"],
        ["totalPrice", "Total Price"],
        ["unitId", "Unit"],
        ["reportingTime", "Reporting Time"],
      ];

      fields.forEach(([field, label]) => {
        const prevVal = pa[field] ?? "-";
        const currVal = ca[field] ?? "-";
        if (String(prevVal) !== String(currVal)) {
          allocationChanges.push(`${itemLabel} (${partyLabel}) ${label}: ${prevVal} → ${currVal}`);
        }
      });
    }
  });

  if (personChanges.length) parts.push(`Person Count Changed: ${personChanges.join(", ")}`);
  if (allocationChanges.length) parts.push(`Allocation Changed: ${allocationChanges.join(", ")}`);
  if (instructionChanges.length) parts.push(`Instructions Changed: ${instructionChanges.join(", ")}`);

  return parts.length ? parts.join(" | ") : "No item-level changes detected.";
};



 const handleSave = async () => {
  try {
    setSaving(true);
    const payload = buildPayload();
    const res = await MenuAllocationSave(payload);

    if (res?.data?.success === true) {
      const isUpdate = menuItems.some((m) => (m.id || 0) !== 0);
      const changeSummary = buildChefLabourChangeSummary(initialMenuItemsRef.current, menuItems);

      try {
        await AddLogs({
          id: 0,
          eventId: menuItems[0]?.eventId || 0,
          description:
            `Chef Labour ${isUpdate ? "updated" : "saved"} | Function: ${
              menuItems[0]?.eventFunctionName || menuItems[0]?._functionName || "-"
            } | Saved By: ${userEmail || "Unknown User"} | Total Items: ${menuItems.length} | Changes: ${changeSummary}`,
          eventType: isUpdate ? "Chef Labour Update" : "Chef Labour Save",
          user: userEmail,
        });
      } catch (logErr) {
        console.error("Log failed (non-blocking):", logErr);
      }

      Swal.fire({
        title: "Success",
        text: res?.data?.message || "Chef labour allocation saved successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      changedPaxItemsRef.current.clear();
      initialMenuItemsRef.current = JSON.parse(JSON.stringify(menuItems));
      onDirtyChange?.(false);
      const taggedItems = menuItems.map((item) => ({
        ...item,
        eventFunctionMenuAllocations: (item.eventFunctionMenuAllocations || []).map((alloc) => ({
          ...alloc,
          isChefLabour: true,
          isOutside: false,
          isInside: false,
        })),
      }));
      onSectionSave?.(taggedItems);
    } else {
      Swal.fire({ title: "Error", text: res?.data?.message || "Failed to save allocation", icon: "error" });
    }
  } catch (error) {
    console.error("❌ Save failed:", error);
    Swal.fire({ title: "Error", text: "Failed to save allocation", icon: "error" });
  } finally {
    setSaving(false);
  }
};

  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No menu items available for allocation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <AllocateRowChef
        onAllocate={handleAllocate}
        vendorRefreshTrigger={vendorRefreshTrigger}
        selectedCount={selectedCount}
      />
      <div className="flex-1 overflow-auto">
        <ChefLabourTable
          menuItems={menuItems}
          onUpdate={handleMenuItemUpdate}
          selectedItems={selectedItems}
          onItemSelect={handleItemSelect}
          vendorRefreshTrigger={vendorRefreshTrigger}
          isAllFunctions={isAllFunctions}
        />
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white">
        {/* <button className="btn btn-danger" aria-label="Cancel" onClick={handleCancel}>
          Cancel
        </button> */}
        <button className="btn btn-primary" aria-label="Save changes" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}