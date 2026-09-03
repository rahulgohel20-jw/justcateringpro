import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import AllocateRowInHouse from "../components/AllocateRowInHouse";
import InHouseCookTable from "../components/InHouseCookTable";
import { MenuAllocationSave, AddLogs  } from "@/services/apiServices";
import Swal from "sweetalert2";

export default function InHouseCookSection({
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
          }));
        });
        setMenuItems(allMenuItems);
        initialMenuItemsRef.current = JSON.parse(JSON.stringify(allMenuItems));
      } else {
        const allocations = data[0]?.menuAllocation || [];
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
        !allocationData.pax &&
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
            if (allocationData.pax !== undefined) updates.pax = allocationData.pax;
            if (allocationData.shiftTransPrice !== undefined)
              updates.shiftTransPrice = allocationData.shiftTransPrice;

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
        chefLabour: false,
        eventFunctionId: menuItem.eventFunctionId || 0,
        eventId: menuItem.eventId || 0,
        id: menuItem.id || 0,
        inside: true,
        outside: false,
        instructions: menuItem.instructions || "",
        menuCategoryId: menuItem.menuCategoryId || 0,
        menuItemId: menuItem.menuItemId || 0,
        personCount: menuItem.personCount || 0,
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
        //     quantity: 0,
        //     price: 0,
        //     counterQuantity: 0,
        //     counterPrice: 0,
        //     helperQuantity: 0,
        //     helperPrice: 0,
        //     shiftTransPrice: parseFloat(allocation.shiftTransPrice) || 0,
        //     totalPrice: 0,
        //     unitId: 0,
        //     remarks: allocation.remarks || "",
        //     menuItemRawMaterials: [],
        //     isOutside: false,
        //   })) || [],


        menuAllocationOrders:
  menuItem.eventFunctionMenuAllocations?.map((allocation) => {
    const shiftTrans = parseFloat(allocation.shiftTransPrice) || 0;

    return {
      id: allocation.id || 0,
      partyId: allocation.partyId || 0,
      number: allocation.number || "",
      serviceType: "",
      quantity: 0,
      price: 0,
      counterQuantity: 0,
      counterPrice: 0,
      helperQuantity: 0,
      helperPrice: 0,
      shiftTransPrice: shiftTrans,
      totalPrice: shiftTrans, 
      unitId: 0,
      remarks: allocation.remarks || "",
      menuItemRawMaterials: [],
      isOutside: false,
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

const buildInHouseCookChangeSummary = (prevItems, currentItems) => {
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
        ["shiftTransPrice", "Transport"],
        ["number", "Number"],
        ["remarks", "Remarks"],
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
      const changeSummary = buildInHouseCookChangeSummary(initialMenuItemsRef.current, menuItems);

      try {
        await AddLogs({
          id: 0,
          eventId: menuItems[0]?.eventId || 0,
          description:
            `In-House Cook ${isUpdate ? "updated" : "saved"} | Function: ${
              menuItems[0]?.eventFunctionName || menuItems[0]?._functionName || "-"
            } | Saved By: ${userEmail || "Unknown User"} | Total Items: ${menuItems.length} | Changes: ${changeSummary}`,
          eventType: isUpdate ? "In-House Cook Update" : "In-House Cook Save",
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
      initialMenuItemsRef.current = JSON.parse(JSON.stringify(menuItems));
      onDirtyChange?.(false);
      const taggedItems = menuItems.map((item) => ({
        ...item,
        eventFunctionMenuAllocations: (item.eventFunctionMenuAllocations || []).map((alloc) => ({
          ...alloc,
          isChefLabour: false,
          isOutside: false,
          isInside: true,
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
      <AllocateRowInHouse
        onAllocate={handleAllocate}
        vendorRefreshTrigger={vendorRefreshTrigger}
        selectedCount={selectedCount}
      />
      <div className="flex-1 overflow-auto">
        <InHouseCookTable
          menuItems={menuItems}
          onUpdate={handleMenuItemUpdate}
          selectedItems={selectedItems}
          onItemSelect={handleItemSelect}
          vendorRefreshTrigger={vendorRefreshTrigger}
          isAllFunctions={isAllFunctions}
        />
      </div>
      <div className="flex justify-end gap-3 px-6 py-4 border-t bg-white">
        {/* <button className="btn btn-danger" aria-label="Cancel" onClick={handleCancel} 
        
        >Cancel</button> */}
        <button className="btn btn-primary" aria-label="Save changes" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}