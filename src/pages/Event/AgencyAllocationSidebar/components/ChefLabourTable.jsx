import { useState, useEffect } from "react";
import BaseInput from "../ui/BaseInput";
import BaseSelect from "../ui/BaseSelect";
import { OutsideContactName, GetUnitData } from "@/services/apiServices";
import { useModuleAccess } from "../../../../hooks/useModuleAccess";

export default function ChefLabourTable({
  menuItems,
  onUpdate,
  selectedItems,
  onItemSelect,
  vendorRefreshTrigger = 0,
  isAllFunctions,
}) {
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const [unit, setUnit] = useState([]);
  const {hasModuleAccess} = useModuleAccess();
  const canAccessAssignManager = hasModuleAccess("Assign Manager")

  useEffect(() => {
    fetchVendor();
    fetchUnit();
  }, [vendorRefreshTrigger]);

  const fetchUnit = async () => {
    try {
      const data = await GetUnitData(localStorage.getItem("userId"));
      const unitData = data?.data?.data["Unit Details"] || [];
      setUnit(unitData);

      const paxUnit = unitData.find(
        (u) => u.nameEnglish?.toLowerCase() === "pax",
      );

      if (paxUnit) {
        menuItems.forEach((menuItem, menuIndex) => {
          const allocations = menuItem.eventFunctionMenuAllocations;
          if (!Array.isArray(allocations)) return;

          let needsUpdate = false;
          const updatedAllocations = allocations.map((alloc) => {
            if (!alloc.unitId) {
              needsUpdate = true;
              return { ...alloc, unitId: paxUnit.id, unitName: paxUnit.nameEnglish };
            }
            return alloc;
          });

          if (needsUpdate) {
            onUpdate(menuIndex, { ...menuItem, eventFunctionMenuAllocations: updatedAllocations });
          }
        });
      }
    } catch (error) {
      console.log("error ", error);
    }
  };

  const fetchVendor = async () => {
    try {
      setLoadingVendors(true);
      const data = await OutsideContactName(5, localStorage.getItem("userId"));
      const vendorList = data?.data?.data["Party Details"] || [];
      setVendors(vendorList);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  };

  // ── Total calculation: basePrice + shiftTransPrice ─────────────────────────
  const calcTotal = (allocation) => {
    const effectiveType = allocation.serviceType || "plate_wise";
    const shiftTrans = parseFloat(allocation.shiftTransPrice) || 0;
    let basePrice = 0;

    if (effectiveType === "plate_wise") {
      const qty = parseFloat(allocation.quantity) || 0;
      const price = parseFloat(allocation.price) || 0;
      basePrice = qty * price;
    } else if (effectiveType === "counter_wise") {
      const counterQty = parseFloat(allocation.counterQuantity) || 0;
      const helperQty = parseFloat(allocation.helperQuantity) || 0;
      const counterPrice = parseFloat(allocation.counterPrice) || 0;
      const helperPrice = parseFloat(allocation.helperPrice) || 0;
      basePrice = counterQty * counterPrice + helperQty * helperPrice;
    }

    return basePrice + shiftTrans;
  };

  const handleAllocationChange = (menuIndex, allocationIndex, field, value) => {
    const menuItem = menuItems[menuIndex];
    const updatedAllocations = [...menuItem.eventFunctionMenuAllocations];

    updatedAllocations[allocationIndex] = {
      ...updatedAllocations[allocationIndex],
      [field]: value,
    };

    const allocation = updatedAllocations[allocationIndex];
    const effectiveType = allocation.serviceType || "plate_wise";

    if (field === "pax") {
      if (effectiveType === "plate_wise") {
        updatedAllocations[allocationIndex].quantity = value;
      } else if (effectiveType === "counter_wise") {
        updatedAllocations[allocationIndex].counterQuantity = value;
      }
    }

    // Recalculate totalPrice including shiftTransPrice
    updatedAllocations[allocationIndex].totalPrice = calcTotal(
      updatedAllocations[allocationIndex],
    );

    const updatedMenuItem = {
      ...menuItem,
      eventFunctionMenuAllocations: updatedAllocations,
      ...(field === "pax" && { personCount: value }),
    };

    onUpdate(menuIndex, updatedMenuItem);
  };

const handleContactChange = (menuIndex, allocationIndex, vendorId) => {
  const selectedVendor = vendors.find((v) => String(v.id) === String(vendorId));
  if (selectedVendor) {
    const menuItem = menuItems[menuIndex];
    const updatedAllocations = [...menuItem.eventFunctionMenuAllocations];
    const existing = updatedAllocations[allocationIndex];

    const updatedAllocation = {
      ...existing,
      partyId: selectedVendor.id || "",
      partyName: selectedVendor.nameEnglish || "",
      number: selectedVendor.mobileno || "",
      // set every pricing variant up front, regardless of current serviceType,
      // so switching Type later still has the right values available
      price: selectedVendor.price ?? existing.price ?? 0,
      counterPrice: selectedVendor.counterPrice ?? existing.counterPrice ?? 0,
      helperPrice: selectedVendor.helperPrice ?? existing.helperPrice ?? 0,
    };

    updatedAllocation.totalPrice = calcTotal(updatedAllocation);

    updatedAllocations[allocationIndex] = updatedAllocation;
    onUpdate(menuIndex, { ...menuItem, eventFunctionMenuAllocations: updatedAllocations });
  }
};
  const handleCheckboxChange = (menuIndex, allocationIndex, isChecked) => {
    const itemKey = `${menuIndex}-${allocationIndex}`;
    onItemSelect(itemKey, isChecked, menuIndex, allocationIndex);
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    menuItems?.forEach((menuItem, menuIndex) => {
      menuItem.eventFunctionMenuAllocations?.forEach((_, allocationIndex) => {
        const itemKey = `${menuIndex}-${allocationIndex}`;
        onItemSelect(itemKey, isChecked, menuIndex, allocationIndex);
      });
    });
  };

  if (!menuItems || menuItems.length === 0) return null;

  const allSelected =
    Array.isArray(menuItems) &&
    menuItems.length > 0 &&
    menuItems.every((menuItem, menuIndex) => {
      const allocations = menuItem?.eventFunctionMenuAllocations;
      if (!Array.isArray(allocations) || allocations.length === 0) return false;
      return allocations.every((_, allocationIndex) => {
        const itemKey = `${menuIndex}-${allocationIndex}`;
        return selectedItems[itemKey] === true;
      });
    });

  return (
    <div className="mt-3 px-6 pb-6 overflow-x-auto">
      <div className="border rounded-xl bg-white overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <colgroup>
            <col className="w-[44px]" />
            <col className="w-[60px]" />
            {isAllFunctions && <col className="w-[150px]" />}
            <col className="w-[200px]" />
            <col className="w-[120px]" />
            <col className="w-[220px]" />
            <col className="w-[170px]" />
             <col className="w-[110px]" /> 
            <col className="w-[120px]" />
            <col className="w-[120px]" />
            <col className="w-[120px]" />
            <col className="w-[120px]" />
            <col className="w-[130px]" />
            <col className="w-[120px]" />
          </colgroup>

          <thead className="bg-gray-50 border-b">
            <tr className="text-gray-600 text-xs font-semibold">
              <th className="p-3 text-center">
                <input
                  type="checkbox"
                  checked={allSelected || false}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="p-3 text-left">SRNo.</th>
              {isAllFunctions && <th className="p-3 text-left">Function</th>}
              <th className="p-3 text-left">Item Name</th>
              <th className="p-3 text-left">Pax</th>
              <th className="p-3 text-left">Contact Name</th>
              <th className="p-3 text-left">Type</th>
              
              <th className="p-3 text-left">
                Time </th>
              
              <th className="p-3 text-center border-l" colSpan={2}>Quantity</th>
              <th className="p-3 text-center border-l" colSpan={2}>Price</th>
              <th className="p-3 text-left border-l">Shift/Trans</th>
              <th className="p-3 text-left border-l">Total</th>
            </tr>
            <tr className="text-gray-600 text-xs font-semibold bg-gray-50">
            <th colSpan={isAllFunctions ? 8 : 7}></th> 
              <th className="p-3 text-center border-l">Labour/Qty</th>
              <th className="p-3 text-center">Helper/Unit</th>
              <th className="p-3 text-center border-l">Labour/Price</th>
              <th className="p-3 text-center">Helper</th>
              <th></th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {(() => {
              let srNo = 0;
              return menuItems.map((menuItem, menuIndex) => (
                <>
                  {menuItem.eventFunctionMenuAllocations?.map(
                    (allocation, allocationIndex) => {
                      srNo++;
                      const itemKey = `${menuIndex}-${allocationIndex}`;
                      const effectiveType = allocation.serviceType || "plate_wise";
                      const isPlateWise = effectiveType === "plate_wise";
                      const totalPrice = calcTotal(allocation);

                      return (
                        <tr
                          key={`${menuIndex}-${allocationIndex}`}
                          className={`border-b hover:bg-gray-50 align-middle ${
                            selectedItems[itemKey] ? "bg-blue-50" : ""
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={selectedItems[itemKey] || false}
                              onChange={(e) =>
                                handleCheckboxChange(menuIndex, allocationIndex, e.target.checked)
                              }
                            />
                          </td>
                          <td className="p-3">{srNo}</td>
                          {isAllFunctions && (
                            <td className="p-3">
                              <div className="text-xs">
                                <div className="font-medium text-gray-900">
                                  {menuItem._functionName || "-"}
                                </div>
                                {menuItem._functionPax && (
                                  <div className="text-gray-500">PAX: {menuItem._functionPax}</div>
                                )}
                              </div>
                            </td>
                          )}
                          <td className="p-3 font-medium text-gray-900">
                            {menuItem.menuItemName || "-"}
                          </td>
                          <td className="p-2">
                            <BaseInput
                              type="tel"
                              placeholder="0"
                              value={menuItem.personCount || ""}
                              onChange={(e) =>
                                handleAllocationChange(menuIndex, allocationIndex, "pax", e.target.value)
                              }
                            />
                          </td>
                          <td className="p-2">
                            <BaseSelect
                              value={allocation.partyId || ""}
                              onChange={(e) =>
                                handleContactChange(menuIndex, allocationIndex, e.target.value)
                              }
                              disabled={loadingVendors}
                            >
                              <option value="">
                                {loadingVendors ? "Loading..." : "Select Name"}
                              </option>
                              {allocation.partyId &&
                                !vendors.some((v) => String(v.id) === String(allocation.partyId)) && (
                                  <option value={allocation.partyId}>
                                    {allocation.partyName || "Selected contact"}
                                  </option>
                                )}
                              {vendors.map((vendor) => (
                                <option key={vendor.id} value={vendor.id}>
                                  {vendor.nameEnglish}
                                </option>
                              ))}
                            </BaseSelect>
                          </td>
                          <td className="p-2">
                            <BaseSelect
                              value={allocation.serviceType || "plate_wise"}
                              onChange={(e) =>
                                handleAllocationChange(menuIndex, allocationIndex, "serviceType", e.target.value)
                              }
                            >
                              <option value="plate_wise">Plate Wise</option>
                              <option value="counter_wise">Counter Wise</option>
                            </BaseSelect>
                          </td>
                          
<td className="p-2">
  <BaseInput
    type="time"
    placeholder="Time"
   value={allocation.reportingTime || ""}
    onChange={(e) =>
      handleAllocationChange(menuIndex, allocationIndex, "reportingTime", e.target.value)
    }
  />
</td>
                        
                          {isPlateWise ? (
                            <>
                              <td className="p-2">
                                <BaseInput
                                  type="tel"
                                  placeholder="Quantity"
                                  value={allocation.quantity || ""}
                                  onChange={(e) =>
                                    handleAllocationChange(menuIndex, allocationIndex, "quantity", e.target.value)
                                  }
                                />
                              </td>
                              <td className="p-2">
                                <BaseSelect
                                  value={allocation.unitId || ""}
                                  onChange={(e) => {
                                    const selectedUnit = unit.find(
                                      (u) => String(u.id) === String(e.target.value),
                                    );
                                    const menuItemCurrent = menuItems[menuIndex];
                                    const updatedAllocations = [
                                      ...menuItemCurrent.eventFunctionMenuAllocations,
                                    ];
                                    updatedAllocations[allocationIndex] = {
                                      ...updatedAllocations[allocationIndex],
                                      unitId: selectedUnit?.id || "",
                                      unitName: selectedUnit?.nameEnglish || "",
                                    };
                                    onUpdate(menuIndex, {
                                      ...menuItemCurrent,
                                      eventFunctionMenuAllocations: updatedAllocations,
                                    });
                                  }}
                                >
                                  <option value="">Select Unit</option>
                                  {unit.map((u) => (
                                    <option key={u.id} value={u.id}>
                                      {u.nameEnglish}
                                    </option>
                                  ))}
                                </BaseSelect>
                              </td>
                              <td className="p-2">
                                <BaseInput
                                  type="tel"
                                  placeholder="Price"
                                  value={allocation.price || ""}
                                  onChange={(e) =>
                                    handleAllocationChange(menuIndex, allocationIndex, "price", e.target.value)
                                  }
                                />
                              </td>
                              <td className="p-2"></td>
                            </>
                          ) : (
                            <>
                              <td className="p-2">
                                <BaseInput
                                  type="tel"
                                  placeholder="Labour"
                                  value={allocation.counterQuantity || ""}
                                  onChange={(e) =>
                                    handleAllocationChange(menuIndex, allocationIndex, "counterQuantity", e.target.value)
                                  }
                                />
                              </td>
                              <td className="p-2">
                                <BaseInput
                                  type="tel"
                                  placeholder="Helper"
                                  value={allocation.helperQuantity || ""}
                                  onChange={(e) =>
                                    handleAllocationChange(menuIndex, allocationIndex, "helperQuantity", e.target.value)
                                  }
                                />
                              </td>
                              <td className="p-2">
                                <BaseInput
                                  type="tel"
                                  placeholder="Labour price"
                                  value={allocation.counterPrice || ""}
                                  onChange={(e) =>
                                    handleAllocationChange(menuIndex, allocationIndex, "counterPrice", e.target.value)
                                  }
                                />
                              </td>
                              <td className="p-2">
                                <BaseInput
                                  type="tel"
                                  placeholder="Helper Price"
                                  value={allocation.helperPrice || ""}
                                  onChange={(e) =>
                                    handleAllocationChange(menuIndex, allocationIndex, "helperPrice", e.target.value)
                                  }
                                />
                              </td>
                            </>
                          )}

                          {/* Shift/Trans Price */}
                          <td className="p-2">
                            <BaseInput
                              type="tel"
                              placeholder="0"
                              value={allocation.shiftTransPrice || ""}
                              onChange={(e) =>
                                handleAllocationChange(menuIndex, allocationIndex, "shiftTransPrice", e.target.value)
                              }
                            />
                          </td>

                          {/* Total = base + shiftTransPrice */}
                          <td className="p-2">
                            <BaseInput
                              disabled
                              placeholder="0"
                              value={totalPrice.toFixed(2)}
                              className="bg-gray-100"
                            />
                          </td>
                        </tr>
                      );
                    },
                  )}
                </>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}