import { useState, useEffect } from "react";
import BaseInput from "../ui/BaseInput";
import BaseSelect from "../ui/BaseSelect";
import { OutsideContactName } from "@/services/apiServices";

export default function InHouseCookTable({
  menuItems,
  onUpdate,
  selectedItems,
  onItemSelect,
  vendorRefreshTrigger = 0,
  isAllFunctions,
}) {
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(false);

  useEffect(() => {
    fetchVendor();
  }, [vendorRefreshTrigger]);

  const fetchVendor = async () => {
    try {
      setLoadingVendors(true);
      const data = await OutsideContactName(7, localStorage.getItem("userId"));
      const vendorList = data?.data?.data["Party Details"] || [];
      setVendors(vendorList);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  };

  const handlePaxChange = (menuIndex, value) => {
    onUpdate(menuIndex, { ...menuItems[menuIndex], personCount: value });
  };

  const handleAllocationChange = (menuIndex, allocationIndex, field, value) => {
    const menuItem = menuItems[menuIndex];
    const updatedAllocations = [...menuItem.eventFunctionMenuAllocations];
    updatedAllocations[allocationIndex] = {
      ...updatedAllocations[allocationIndex],
      [field]: value,
    };
    onUpdate(menuIndex, { ...menuItem, eventFunctionMenuAllocations: updatedAllocations });
  };

  const handleContactChange = (menuIndex, allocationIndex, vendorId) => {
    const selectedVendor = vendors.find((v) => String(v.id) === String(vendorId));
    if (selectedVendor) {
      const menuItem = menuItems[menuIndex];
      const updatedAllocations = [...menuItem.eventFunctionMenuAllocations];
      updatedAllocations[allocationIndex] = {
        ...updatedAllocations[allocationIndex],
        partyId: selectedVendor.id || "",
        partyName: selectedVendor.nameEnglish || "",
        number: selectedVendor.mobileno || "",
      };
      onUpdate(menuIndex, { ...menuItem, eventFunctionMenuAllocations: updatedAllocations });
    }
  };

  const handleCheckboxChange = (menuIndex, allocationIndex, isChecked) => {
    const itemKey = `${menuIndex}-${allocationIndex}`;
    onItemSelect(itemKey, isChecked);
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    menuItems?.forEach((menuItem, menuIndex) => {
      menuItem.eventFunctionMenuAllocations?.forEach((_, allocationIndex) => {
        const itemKey = `${menuIndex}-${allocationIndex}`;
        onItemSelect(itemKey, isChecked);
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
            <col className="w-[100px]" />
            <col className="w-[220px]" />
            <col className="w-[160px]" />
            <col className="w-[130px]" />
            <col className="w-[140px]" />
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
              <th className="p-3 text-left">No.</th>
              {isAllFunctions && <th className="p-3 text-left">Function</th>}
              <th className="p-3 text-left">Item Name</th>
              <th className="p-3 text-left">Pax</th>
              <th className="p-3 text-left">Contact Name</th>
              <th className="p-3 text-left">Number</th>
              <th className="p-3 text-left">Shift/Trans</th>
              <th className="p-3 text-left">Remarks</th>
            </tr>
          </thead>

          <tbody>
            {menuItems.map((menuItem, menuIndex) => {
              let startingNumber = 0;
              for (let i = 0; i < menuIndex; i++) {
                startingNumber += menuItems[i].eventFunctionMenuAllocations?.length || 0;
              }

              return (
                <>
                  {menuItem.eventFunctionMenuAllocations?.map(
                    (allocation, allocationIndex) => {
                      const itemKey = `${menuIndex}-${allocationIndex}`;
                      const serialNumber = startingNumber + allocationIndex + 1;

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
                          <td className="p-3">{serialNumber}</td>

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
                              onChange={(e) => handlePaxChange(menuIndex, e.target.value)}
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
                            <BaseInput
                              type="tel"
                              placeholder="0"
                              value={allocation.counterQuantity || ""}
                              onChange={(e) =>
                                handleAllocationChange(menuIndex, allocationIndex, "counterQuantity", e.target.value)
                              }
                            />
                          </td>

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

                          <td className="p-2">
                            <BaseInput
                              placeholder="Enter Remarks"
                              value={allocation.remarks || ""}
                              onChange={(e) =>
                                handleAllocationChange(menuIndex, allocationIndex, "remarks", e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      );
                    },
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}