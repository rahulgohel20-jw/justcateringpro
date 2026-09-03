import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import AllocateRowOutside from "../components/AllocateRowOutside";
import OutsideAgencyTable from "../components/OutsideAgencyTable";
import { MenuAllocationSave, AddLogs  } from "@/services/apiServices";
import Swal from "sweetalert2";

export default function OutsideAgencySection({
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
  const menuItemsRef = useRef([]);

  useEffect(() => {
    menuItemsRef.current = menuItems;
  }, [menuItems]);

  

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
        (alloc) => ({ ...alloc, reportingTime: formatTime24hr(alloc.reportingTime || "") }),
      ),
    }));
  });
  setMenuItems(allMenuItems);
  initialMenuItemsRef.current = JSON.parse(JSON.stringify(allMenuItems));
} else {
  const allocations = (data[0]?.menuAllocation || []).map((allocation) => ({
    ...allocation,
    eventFunctionMenuAllocations: allocation.eventFunctionMenuAllocations?.map(
      (alloc) => ({ ...alloc, reportingTime: formatTime24hr(alloc.reportingTime || "") }),
    ),
  }));
  setMenuItems(allocations);
  initialMenuItemsRef.current = JSON.parse(JSON.stringify(allocations));
}
    } else {
      setMenuItems([]);
      initialMenuItemsRef.current = [];
    }
    changedPaxItemsRef.current.clear();
  }, [data, isAllFunctions]);

  const selectedCount = useMemo(
    () => Object.values(selectedItems).filter(Boolean).length,
    [selectedItems],
  );

  const handleItemSelect = useCallback((itemKey, isChecked, menuIndex, allocationIndex) => {
    setSelectedItems((prev) => ({ ...prev, [itemKey]: isChecked }));
  }, []);

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

  const handleAllocate = useCallback(
    (allocationData) => {
      const hasSelectedItems = Object.values(selectedItems).some(Boolean);
      if (!hasSelectedItems) {
        Swal.fire({ title: "Warning", text: "Please select at least one item to allocate", icon: "warning" });
        return false;
      }

      if (
  !allocationData.partyId &&
  !allocationData.quantity &&
  allocationData.shiftTransPrice === undefined
  && !allocationData.unitId
) {
        Swal.fire({ title: "Warning", text: "Please provide at least one allocation value", icon: "warning" });
        return false;
      }

      let allocatedCount = 0;
      const current = menuItemsRef.current;

      const updatedMenuItems = current.map((menuItem, menuIndex) => {
        const updatedAllocations = menuItem.eventFunctionMenuAllocations.map(
          (allocation, allocationIndex) => {
            const itemKey = `${menuIndex}-${allocationIndex}`;
            if (!selectedItems[itemKey]) return allocation;

            allocatedCount++;
            const updates = {};

            if (allocationData.partyId !== undefined) {
              updates.partyId = allocationData.partyId;
              updates.partyName = allocationData.partyName || "";
            }
            if (allocationData.quantity !== undefined) updates.quantity = allocationData.quantity;
            if (allocationData.shiftTransPrice !== undefined)
              updates.shiftTransPrice = allocationData.shiftTransPrice;

            if (allocationData.unitId !== undefined)   
  updates.unitId = allocationData.unitId;
            const merged = { ...allocation, ...updates };
            const qty = parseFloat(merged.quantity) || 0;
            const price = parseFloat(merged.price) || 0;
            const shiftTrans = parseFloat(merged.shiftTransPrice) || 0;
            updates.totalPrice = qty * price + shiftTrans;

            return { ...allocation, ...updates };
          },
        );

        const hasUpdatedAllocations = menuItem.eventFunctionMenuAllocations.some(
          (_, allocationIndex) => selectedItems[`${menuIndex}-${allocationIndex}`],
        );

       if (hasUpdatedAllocations && allocationData.quantity !== undefined) {
  const itemKey = `${menuItem.menuItemId}-${menuItem.menuCategoryId}-${menuItem.eventFunctionId}`;
  const initialItem = initialMenuItemsRef.current[menuIndex];
  if (initialItem && initialItem.personCount !== allocationData.quantity) {
    changedPaxItemsRef.current.add(itemKey);
  }
}

        return {
  ...menuItem,
  eventFunctionMenuAllocations: updatedAllocations,
  ...(hasUpdatedAllocations &&
    allocationData.quantity !== undefined && { personCount: allocationData.quantity }),
};
      });

      setMenuItems(updatedMenuItems);

      onDirtyChange?.(true);
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
    [selectedItems],
  );

  const handleMenuItemUpdate = useCallback((menuIndex, updatedMenuItem) => {
    const initialItem = initialMenuItemsRef.current[menuIndex];
    if (initialItem && initialItem.personCount !== updatedMenuItem.personCount) {
      const itemKey = `${updatedMenuItem.menuItemId}-${updatedMenuItem.menuCategoryId}-${updatedMenuItem.eventFunctionId}`;
      changedPaxItemsRef.current.add(itemKey);
    }
    setMenuItems((prev) => {
      const updatedData = [...prev];
      updatedData[menuIndex] = updatedMenuItem;
      return updatedData;
    });
    onDirtyChange?.(true);
  }, []);

  const buildPayload = useCallback(() => {
    const userId = Number(localStorage.getItem("userId"));

    return menuItemsRef.current.map((menuItem) => {
      const itemKey = `${menuItem.menuItemId}-${menuItem.menuCategoryId}-${menuItem.eventFunctionId}`;
      const isPaxChange = changedPaxItemsRef.current.has(itemKey);

      return {
        chefLabour: false,
        eventFunctionId: menuItem.eventFunctionId || 0,
        eventId: menuItem.eventId || 0,
        id: menuItem.id || 0,
        inside: false,
        outside: true,
        instructions: menuItem.instructions || "",
        menuCategoryId: menuItem.menuCategoryId || 0,
        menuItemId: menuItem.menuItemId || 0,
        personCount: menuItem.personCount || 0,
        oldPersonCount: menuItem.oldPersonCount || 0,
        isPaxChange,
        place: menuItem.place || "",
        menuItemRawMaterials: [],
        userId,
        // menuAllocationOrders:
        //   menuItem.eventFunctionMenuAllocations?.map((allocation) => ({
        //     id: allocation.id || 0,
        //     partyId: allocation.partyId || 0,
        //     number: allocation.number || "",
        //     serviceType: "",
        //     quantity: allocation.quantity,
        //     price: allocation.price || 0,
        //     counterQuantity: 0,
        //     counterPrice: 0,
        //     helperQuantity: 0,
        //     helperPrice: 0,
        //     shiftTransPrice: parseFloat(allocation.shiftTransPrice) || 0,
        //     totalPrice: allocation.totalPrice || 0,
        //     unitId: allocation.unitId || 0,
        //     remarks: "",
        //     menuItemRawMaterials: [],
        //     isOutside: true,
        //   })) || [],

        menuAllocationOrders:
  menuItem.eventFunctionMenuAllocations?.map((allocation) => {
    const shiftTrans = parseFloat(allocation.shiftTransPrice) || 0;

    // Always recalculate totalPrice to ensure it's never 0/null on save
    let totalPrice = parseFloat(allocation.totalPrice) || 0;
    if (!totalPrice) {
      const qty = parseFloat(allocation.quantity) || 0;
      const price = parseFloat(allocation.price) || 0;
      totalPrice = qty * price + shiftTrans;
    }

    return {
      id: allocation.id || 0,
      partyId: allocation.partyId || 0,
      number: allocation.number || "",
      serviceType: "",
      quantity: allocation.quantity,
      price: allocation.price || 0,
      counterQuantity: 0,
      counterPrice: 0,
      helperQuantity: 0,
      helperPrice: 0,
      shiftTransPrice: shiftTrans,
      totalPrice, 
      unitId: allocation.unitId || 0,
      remarks: "",
      menuItemRawMaterials: [],
      isOutside: true,
            reportingTime: formatTime12hr(allocation.reportingTime || ""),
    };
  }) || [],
      };
    });
  }, []);

  const userEmail = (() => {
  try {
    return (
      JSON.parse(localStorage.getItem("auth-storage"))?.state?.user?.email || ""
    );
  } catch {
    return "";
  }
})();

const buildOutsideAgencyChangeSummary = (prevItems, currentItems) => {
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
        ["quantity", "Qty"],
        ["price", "Price"],
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
      const isUpdate = menuItemsRef.current.some((m) => (m.id || 0) !== 0);
      const changeSummary = buildOutsideAgencyChangeSummary(
        initialMenuItemsRef.current,
        menuItemsRef.current,
      );

      try {
        await AddLogs({
          id: 0,
          eventId: menuItemsRef.current[0]?.eventId || 0,
          description:
            `Outside Agency ${isUpdate ? "updated" : "saved"} | Function: ${
              menuItemsRef.current[0]?.eventFunctionName || menuItemsRef.current[0]?._functionName || "-"
            } | Saved By: ${userEmail || "Unknown User"} | Total Items: ${menuItemsRef.current.length} | Changes: ${changeSummary}`,
          eventType: isUpdate ? "Outside Agency Update" : "Outside Agency Save",
          user: userEmail,
        });
      } catch (logErr) {
        console.error("Log failed (non-blocking):", logErr);
      }

      Swal.fire({
        title: "Success",
        text: res?.data?.message || "Allocation saved successfully",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
      changedPaxItemsRef.current.clear();
      initialMenuItemsRef.current = JSON.parse(JSON.stringify(menuItemsRef.current));
      if (onDataUpdate) onDataUpdate(menuItemsRef.current);
      onDirtyChange?.(false);
      const taggedItems = menuItemsRef.current.map((item) => ({
        ...item,
        eventFunctionMenuAllocations: (item.eventFunctionMenuAllocations || []).map((alloc) => ({
          ...alloc,
          isChefLabour: false,
          isOutside: true,
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
      <AllocateRowOutside
        onAllocate={handleAllocate}
        vendorRefreshTrigger={vendorRefreshTrigger}
        selectedCount={selectedCount}
      />
      <div className="flex-1 overflow-auto">
        <OutsideAgencyTable
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