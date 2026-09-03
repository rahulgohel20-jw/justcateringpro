import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { OutsideContactName } from "@/services/apiServices";
import PlaceSelect from "../../../../components/PlaceSelect/PlaceSelect";
import { Plus } from "lucide-react";
import AddContactName from "../../../master/MenuItemMaster/components/AddContactName";



const FieldLabel = ({ children }) => (
  <div className="text-sm text-gray-800 font-medium truncate">{children}</div>
);

const BaseInput = (props) => (
  <input
    {...props}
    className="h-9 w-full rounded-md border border-gray-300 bg-white px-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
  />
);

const BaseSelect = (props) => (
  <select
    {...props}
    className="h-9 w-full rounded-md border border-gray-300 bg-white px-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500"
  >
    {props.children}
  </select>
);

export default function SidebarRawMaterial({
  open,
  onClose,
  selectedRow,
  onSave,
  sidebarunit,
}) {
  const [functionRows, setFunctionRows] = useState([]);
  const [unit, setUnit] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [supplier, setSupplier] = useState([]);
  const userId = localStorage.getItem("userId");
  const [extraQty, setExtraQty] = useState(0);

  useEffect(() => {
    if (sidebarunit && Array.isArray(sidebarunit)) {
      setUnit(sidebarunit);
    }
  }, [sidebarunit]);

  useEffect(() => {
    if (!selectedRow || !open) return;

    const functions = selectedRow.eventRawMaterialFunctions || [];


    const totalFunctionQty = functions.reduce(
      (sum, func) => sum + (parseFloat(func.qty) || 0),
      0,
    );


    const calculatedExtra = Math.max(
      0,
      (selectedRow.finalQty || 0) - totalFunctionQty,
    );
    setExtraQty(calculatedExtra);

    // latest 

    // const rows = functions.map((func, index) => {
    //   const unitHierarchy =
    //     func.unitHierarchyDto || selectedRow.unitHierarchyDto || null;

    //   const baseUnit = func.unit || selectedRow.units || null;

    //   return {
    //     id: index + 1,
    //     functionType: func.functionName || "",
    //     menuItemName: func.itemName || "",
    //     qty: func.qty ?? selectedRow.qty ?? "",
    //     price: func.price ?? 0,
    //     supplierId: func.supplierId ?? selectedRow.supplierId ?? "",
    //     agency: func.supplierName ?? selectedRow.agency ?? "",
    //     unitId: baseUnit?.id || unitHierarchy?.unitId || 1,
    //     unit: baseUnit?.nameEnglish || unitHierarchy?.nameEnglish || "KILO",
    //     unitObject: baseUnit,
    //     unitHierarchyDto: unitHierarchy,
    //     place: func.place || selectedRow.place || "",
    //     dateTime:
    //       func.functiondatetime && dayjs(func.functiondatetime).isValid()
    //         ? dayjs(func.functiondatetime)
    //         : null,
    //     functionId: func.functionId || null,
    //     eventFunctionId: func.eventFunctionId || null,
    //     isExtraField: func.isExtraField || false,
    //   };
    // });

    
    
    const rows = functions.map((func, index) => {
  const unitHierarchy =
    func.unitHierarchyDto || selectedRow.unitHierarchyDto || null;
  const baseUnit = func.unit || selectedRow.units || null;

  // Build unitToBase map to convert basePricePerUnit to this row's unit
  const outsideUnitId = selectedRow.unitId;
  const outsideBasePricePerUnit = selectedRow.basePricePerUnit || 0;

  const unitToBase = {};
  if (unitHierarchy) {
    unitToBase[unitHierarchy.unitId] = 1;
    (unitHierarchy.children || []).forEach((child) => {
      unitToBase[child.unitId] = 1 / child.equivalentValue;
    });
  }

  const rowUnitId = baseUnit?.id || unitHierarchy?.unitId || 1;

  // Convert outside price/unit → this row's unit price
  const outsideUnitInBase = unitToBase[outsideUnitId] ?? 1;
  const rowUnitInBase = unitToBase[rowUnitId] ?? 1;
  // pricePerBase = outsideBasePricePerUnit / outsideUnitInBase
  // pricePerRowUnit = pricePerBase * rowUnitInBase
  const rowBasePricePerUnit =
    outsideUnitInBase !== 0
      ? (outsideBasePricePerUnit / outsideUnitInBase) * rowUnitInBase
      : outsideBasePricePerUnit;

  const qty = func.qty ?? selectedRow.qty ?? 0;

  return {
    id: index + 1,
    functionType: func.functionName || "",
    menuItemName: func.itemName || "",
    qty: qty,
    price: parseFloat(func.price) || 0,
    // price: parseFloat(qty) * rowBasePricePerUnit || func.price || 0, // calculated
    supplierId: func.supplierId ?? selectedRow.supplierId ?? "",
    agency: func.supplierName ?? selectedRow.agency ?? "",
    unitId: rowUnitId,
    unit: baseUnit?.nameEnglish || unitHierarchy?.nameEnglish || "KILO",
    unitObject: baseUnit,
    unitHierarchyDto: unitHierarchy,
    basePricePerUnit: rowBasePricePerUnit, // ✅ store for recalculation
    outsideBasePricePerUnit: outsideBasePricePerUnit, // ✅ keep original for unit change
    outsideUnitId: outsideUnitId, // ✅ keep for reference
    place: func.place || selectedRow.place || "",
    dateTime:
      func.functiondatetime && dayjs(func.functiondatetime).isValid()
        ? dayjs(func.functiondatetime)
        : null,
    functionId: func.functionId || null,
    eventFunctionId: func.eventFunctionId || null,
    isExtraField: func.isExtraField || false,
  };
});
    
    
    setFunctionRows(rows);
  }, [selectedRow, open]);

  useEffect(() => {
    if (!open) setFunctionRows([]);
  }, [open]);

  useEffect(() => {
    fetchSupplier();
  }, []);

  const fetchSupplier = async () => {
    try {
      const data = await OutsideContactName(3, userId);
      setSupplier(data?.data?.data["Party Details"] || []);
    } catch (error) {
      console.log(error);
    }
  };

  const handleExtraQtyChange = (newExtraValue) => {
    const parsedExtra = parseFloat(newExtraValue) || "";
    setExtraQty(parsedExtra);
  };



  // latest

  // const handleInputChange = (rowIndex, field, value) => {
  //   setFunctionRows((prev) => {
  //     const updated = prev.map((row, index) =>
  //       index === rowIndex ? { ...row, [field]: value } : row,
  //     );

  //     // Recalculate extra qty whenever qty changes
  //     // if (field === "qty") {
  //     //   const totalFunctionQty = updated.reduce(
  //     //     (sum, row) => sum + (parseFloat(row.qty) || 0),
  //     //     0,
  //     //   );
  //     //   const calculatedExtra = Math.max(
  //     //     0,
  //     //     (selectedRow.finalQty || 0) - totalFunctionQty,
  //     //   );
  //     //   setExtraQty(calculatedExtra);
  //     // }

  //     return updated;
  //   });
  // };


  const handleInputChange = (rowIndex, field, value) => {
  setFunctionRows((prev) =>
    prev.map((row, index) => {
      if (index !== rowIndex) return row;

      const updated = { ...row, [field]: value };


      if (field === "qty") {
        const qty = parseFloat(value) || 0;
        updated.price = qty * (row.basePricePerUnit || 0);
      }

      return updated;
    }),
  );
};

  const handleSave = () => {
    const totalFunctionQty = functionRows.reduce(
      (sum, row) => sum + (parseFloat(row.qty) || 0),
      0,
    );

   
    const finalCalculatedQty = totalFunctionQty + extraQty;

    const enrichedRows = functionRows.map((row) => ({
      functionId: row.functionId || 0,
      eventFunctionId: row.eventFunctionId || 0,
      functionName: row.functionType || "",
      itemName: row.menuItemName || "",
      qty: parseFloat(row.qty) || 0,
      price: parseFloat(row.price) || 0,
      supplierId: row.supplierId || 0,
      supplierName: row.agency || "",
      unitId: row.unitId,
      unitName: row.unit,
      unit: row.unitObject,
      unitHierarchyDto: row.unitHierarchyDto,
      place: row.place,
      functiondatetime: row.dateTime
        ? dayjs(row.dateTime).format("YYYY-MM-DD HH:mm:ss.0")
        : "",
      isExtraField: row.isExtraField || false,
    }));

    onSave?.({
      ...selectedRow,
      eventRawMaterialFunctions: enrichedRows,
      calculatedFinalQty: finalCalculatedQty, 
      extraQty: extraQty, 
      qtyWasModified: true,
    });

    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="absolute top-6 bottom-6 right-6 w-[1200px] max-w-[95vw] bg-white rounded-2xl shadow-2xl flex flex-col"
            initial={{ x: "110%" }}
            animate={{ x: 0 }}
            exit={{ x: "110%" }}
          >
            {/* HEADER */}
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Raw Material Allocation</h2>
              <button
                className="px-3 py-1 border rounded hover:bg-gray-50"
                onClick={onClose}
              >
                Close
              </button>
            </div>

          
            <div className="p-2 flex-1 overflow-auto">
              <div className="border rounded-xl overflow-x-auto">
                
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Extra Quantity:
                    </span>
                    <input
                      type="tel"
                      readOnly
                      value={extraQty}
                      onChange={(e) => handleExtraQtyChange(e.target.value)}
                      className="w-32 h-9 rounded-md border border-gray-300 bg-white px-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005BA8]/40 focus:border-[#005BA8]"
                      placeholder=""
                    />
                  </div>
                <div className="text-sm text-gray-600">
  <span className="font-medium">Total Functions Qty:</span>{" "}
  <span className="text-[#005BA8] font-semibold">
    {(() => {
    
      const hierarchy = functionRows[0]?.unitHierarchyDto;
      
      const unitToBase = {};
      if (hierarchy) {
        unitToBase[hierarchy.unitId] = 1;
        (hierarchy.children || []).forEach((child) => {
          unitToBase[child.unitId] = 1 / child.equivalentValue;
        });
      }

      
      const totalInBase = functionRows.reduce((sum, row) => {
        const qty = parseFloat(row.qty) || 0;
        const factor = unitToBase[row.unitId] ?? 1;
        return sum + qty * factor;
      }, 0);

      
      const baseUnitName = hierarchy
        ? hierarchy.nameEnglish
        : functionRows[0]?.unit || "";

      return `${totalInBase.toFixed(2)} ${baseUnitName}`;
    })()}
  </span>
</div>
                </div>

                <table className="w-full border-collapse">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr className="text-sm font-semibold text-gray-700">
                      <th className="p-3 text-left">Sr.</th>
                      <th className="p-3 text-left">Function</th>
                      <th className="p-3 text-left">Item Name</th>
                      <th className="p-3 text-left">
                        <div className="flex items-center gap-2">
                          <span>Agency</span>
                          <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                            title="Add Agency"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </th>
                      <th className="p-3 text-left">Qty</th>
                      <th className="p-3 text-left">Unit</th>
                      <th className="p-3 text-left">Place</th>
                      <th className="p-3 text-left">Date & Time</th>
                      <th className="p-3 text-left">Price</th>
                    </tr>
                  </thead>

                  <tbody>
                    {functionRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="p-8 text-center text-gray-500"
                        >
                          No function data available
                        </td>
                      </tr>
                    ) : (
                      <>
                        {functionRows.map((row, idx) => (
                          <tr
                            key={idx}
                            className={`border-t ${
                              row.isExtraField
                                ? "bg-yellow-50"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            <td className="p-3">{row.id}.</td>
                            <td className="p-3">{row.functionType || "-"}</td>
                            <td className="p-3 whitespace-normal break-words max-w-[320px]">
                              {row.menuItemName || "-"}
                            </td>

                            <td className="p-3">
                              <BaseSelect
                                value={row.supplierId || ""}
                                onChange={(e) => {
                                  const s = supplier.find(
                                    (x) => x.id === Number(e.target.value),
                                  );
                                  handleInputChange(
                                    idx,
                                    "supplierId",
                                    s?.id || "",
                                  );
                                  handleInputChange(
                                    idx,
                                    "agency",
                                    s?.nameEnglish || "",
                                  );
                                }}
                              >
                                <option value="">Select Agency</option>
                                {supplier.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.nameEnglish}
                                  </option>
                                ))}
                              </BaseSelect>
                            </td>

                            <td className="p-3 w-[90px]">
                              <BaseInput
                                type="tel"
                                value={row.qty}
                                onChange={(e) =>
                                  handleInputChange(idx, "qty", e.target.value)
                                }
                              />
                            </td>

                            <td className="p-3 w-[130px]">
                              <BaseSelect
                              
                                value={row.unitId}
//                                 onChange={(e) => {
//   const selectedId = Number(e.target.value);
//   if (!selectedId) return;

//   // ── Use the ORIGINAL hierarchy from the row (never mutate it) ──
//   const hierarchy = row.unitHierarchyDto;
//   if (!hierarchy) return;

//   // ── Build unitToBase map ──
//   const unitToBase = {};
//   unitToBase[hierarchy.unitId] = 1;
//   (hierarchy.children || []).forEach((child) => {
//     unitToBase[child.unitId] = 1 / child.equivalentValue;
//   });

//   // ── Convert qty ──
//   const currentQty = parseFloat(row.qty) || 0;
//   const currentUnitId = row.unitId;
//   const amountInBase = currentQty * (unitToBase[currentUnitId] ?? 1);
//   const newUnitInBase = unitToBase[selectedId] ?? 1;
//   const convertedQty = amountInBase / newUnitInBase;

//   // ── Find selected unit label ──
//   let selectedUnitName = "";
//   if (hierarchy.unitId === selectedId) {
//     selectedUnitName = hierarchy.nameEnglish;
//   } else {
//     selectedUnitName = hierarchy.children?.find(
//       (c) => c.unitId === selectedId
//     )?.nameEnglish || "";
//   }

//   // ── Only update qty, unitId, unit — NOT unitHierarchyDto ──
//   setFunctionRows((prev) =>
//     prev.map((r, i) =>
//       i === idx
//         ? {
//             ...r,
//             qty: parseFloat(convertedQty.toFixed(4)),
//             unitId: selectedId,
//             unit: selectedUnitName,
//             unitObject: {
//               id: selectedId,
//               nameEnglish: selectedUnitName,
//             },
//             // ✅ unitHierarchyDto stays untouched — keeps original options intact
//           }
//         : r
//     )
//   );
// }}


// 1st onChanege version (no price recalculation, only unit label change):

// onChange={(e) => {
//   const selectedId = Number(e.target.value);
//   if (!selectedId) return;

//   const hierarchy = row.unitHierarchyDto;

//   // Find selected unit label only — no qty conversion
//   let selectedUnitName = "";
//   if (hierarchy) {
//     if (hierarchy.unitId === selectedId) {
//       selectedUnitName = hierarchy.nameEnglish;
//     } else {
//       selectedUnitName = hierarchy.children?.find(
//         (c) => c.unitId === selectedId
//       )?.nameEnglish || "";
//     }
//   } else {
//     // fallback to sidebarunit list
//     const found = unit.find((u) => u.id === selectedId);
//     selectedUnitName = found?.nameEnglish || "";
//   }

//   // Only update unitId and unit label — qty stays unchanged
//   setFunctionRows((prev) =>
//     prev.map((r, i) =>
//       i === idx
//         ? {
//             ...r,
//             unitId: selectedId,
//             unit: selectedUnitName,
//             unitObject: {
//               id: selectedId,
//               nameEnglish: selectedUnitName,
//             },
//             // unitHierarchyDto stays untouched
//           }
//         : r
//     )
//   );
// }}

// 2nd onChange version with price recalculation based on new unit:

onChange={(e) => {
  const selectedId = Number(e.target.value);
  if (!selectedId) return;

  const hierarchy = row.unitHierarchyDto;

  // Build unitToBase map
  const unitToBase = {};
  if (hierarchy) {
    unitToBase[hierarchy.unitId] = 1;
    (hierarchy.children || []).forEach((child) => {
      unitToBase[child.unitId] = 1 / child.equivalentValue;
    });
  }

  // Recalculate basePricePerUnit for the new unit
  // using the original outside price as source of truth
  const outsideBasePricePerUnit = row.outsideBasePricePerUnit || 0;
  const outsideUnitId = row.outsideUnitId;
  const outsideUnitInBase = unitToBase[outsideUnitId] ?? 1;
  const newUnitInBase = unitToBase[selectedId] ?? 1;
  const newBasePricePerUnit =
    outsideUnitInBase !== 0
      ? (outsideBasePricePerUnit / outsideUnitInBase) * newUnitInBase
      : outsideBasePricePerUnit;

  // Find unit label
  let selectedUnitName = "";
  if (hierarchy) {
    if (hierarchy.unitId === selectedId) {
      selectedUnitName = hierarchy.nameEnglish;
    } else {
      selectedUnitName =
        hierarchy.children?.find((c) => c.unitId === selectedId)
          ?.nameEnglish || "";
    }
  }

  const qty = parseFloat(row.qty) || 0;

  setFunctionRows((prev) =>
    prev.map((r, i) =>
      i === idx
        ? {
            ...r,
            unitId: selectedId,
            unit: selectedUnitName,
            unitObject: { id: selectedId, nameEnglish: selectedUnitName },
            basePricePerUnit: newBasePricePerUnit,
            price: qty * newBasePricePerUnit, // ✅ recalculated
            // unitHierarchyDto stays untouched
          }
        : r
    )
  );
}}
                              >
                                <option value="">Select Unit</option>
                                {row.unitHierarchyDto && (
                                  <option value={row.unitHierarchyDto.unitId}>
                                    {row.unitHierarchyDto.nameEnglish}
                                  </option>
                                )}
                                {row.unitHierarchyDto?.children?.map(
                                  (child) => (
                                    <option
                                      key={child.unitId}
                                      value={child.unitId}
                                    >
                                      {child.nameEnglish}
                                    </option>
                                  ),
                                )}
                              </BaseSelect>
                            </td>

                            <td className="p-3 w-[140px]">
                              <PlaceSelect
                                value={row.place}
                                onChange={(value) =>
                                  handleInputChange(idx, "place", value)
                                }
                              />
                            </td>

                            <td className="p-3 w-[200px]">
                              <DatePicker
                                className="h-9 w-full"
                                showTime
                                value={row.dateTime}
                                onChange={(date) =>
                                  handleInputChange(idx, "dateTime", date)
                                }
                                popupClassName="z-[9999]"
                              />
                            </td>

                            <td className="p-3 w-[120px]">
                              <BaseInput
                                readOnly
                                type="text"
                                value={(parseFloat(row.price) || 0).toFixed(2)}
                                onChange={(e) =>
                                  handleInputChange(idx, "price", e.target.value)
                                }
                              />
                            </td>
                          </tr>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-50"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSave}
              >
                Save
              </button>
            </div>
          </motion.div>
        </div>
      )}
      <AddContactName
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        contactTypeId={3} // 👈 Supplier / Vendor ONLY
        refreshData={fetchSupplier}
        concatId={3}
      />
    </AnimatePresence>
  );
}
