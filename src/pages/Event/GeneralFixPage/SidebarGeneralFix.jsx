import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { OutsideContactName } from "@/services/apiServices";
import { Plus } from "lucide-react";
import PlaceSelect from "../../../components/PlaceSelect/PlaceSelect";
import AddContactName from "../../master/MenuItemMaster/components/AddContactName";
import Swal from "sweetalert2";

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

export default function SidebarGeneralFix({
  open,
  onClose,
  selectedRow,
  onSave,
}) {
  const [functionRows, setFunctionRows] = useState([]);
  const [extraQty, setExtraQty] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  // =========================================================
  // Build unitToBase map from a unit hierarchy:
  // unitToBase[baseUnitId] = 1
  // unitToBase[childUnitId] = 1 / child.equivalentValue
  // (e.g. base = KILO, child = GRAM, equivalentValue = 1000
  //  -> 1 GRAM = 1/1000 KILO)
  // =========================================================
 const buildUnitToBase = (hierarchy) => {
  const map = {};
  if (!hierarchy) return map;
  map[hierarchy.unitId] = 1;
  (hierarchy.children || []).forEach((child) => {
    map[child.unitId] = 1 / child.equivalentValue;
  });
  return map;
};

  // =========================================================
  // Build per-function rows from selectedRow.eventFunctionGeneralFixRaws
  // Price is always derived from supplierRate (price PER BASE UNIT,
  // e.g. per KILO / per LITRE), never from an aggregate basePrice.
  // =========================================================
useEffect(() => {
  if (!selectedRow || !open) return;

  const functions = selectedRow.eventFunctionGeneralFixRaws || [];

  const totalFunctionQty = functions.reduce(
    (sum, func) => sum + (parseFloat(func.weight) || 0),
    0,
  );

  const calculatedExtra = Math.max(
    0,
    (Number(selectedRow.finalQty) || 0) - totalFunctionQty,
  );
  setExtraQty(calculatedExtra || 0);

  // The unit hierarchy belongs to the MATERIAL, not to each function
  // row — always take it from selectedRow so it survives a save/reopen
  // cycle even though individual function entries stop carrying it.
  const unitHierarchy = selectedRow.unitHierarchyDto || null;
  const unitToBase = buildUnitToBase(unitHierarchy);

  const resolveUnitName = (unitId) => {
    if (!unitHierarchy) return selectedRow.unit || "KILO";
    if (unitHierarchy.unitId === unitId) return unitHierarchy.nameEnglish;
    return (
      unitHierarchy.children?.find((c) => c.unitId === unitId)
        ?.nameEnglish || selectedRow.unit || "KILO"
    );
  };

  const rows = functions.map((func, index) => {
    // Prefer func.unitId (present after our own save), fall back to
    // func.unit?.id (present on a fresh fetch from the API), then to
    // the hierarchy's/outer row's unit as a last resort.
    const rowUnitId =
      func.unitId ||
      func.unit?.id ||
      unitHierarchy?.unitId ||
      selectedRow.unitId ||
      1;

    const supplierRate =
      parseFloat(func.supplierRate) ||
      parseFloat(selectedRow.supplierRate) ||
      0;

    const rowBasePricePerUnit = supplierRate * (unitToBase[rowUnitId] ?? 1);

    return {
      // ---- payload fields ----
      id: func.id ?? 0,
      rawId: func.rawId ?? selectedRow.rawMaterialId ?? 0,
      rawCatId: func.rawCatId ?? selectedRow.rawCatId ?? 0,
      eventFunctionId: func.eventFunctionId || 0,
      unitId: rowUnitId,
      weight: func.weight ?? 0,
      price: parseFloat(func.price) || 0,

      // ---- display-only / calc context ----
      sr: index + 1,
      functionType: func.functionNameEnglish || "",
      menuItemName: func.rawNameEnglish || selectedRow.material || "",
      unit: resolveUnitName(rowUnitId),
      unitObject: { id: rowUnitId, nameEnglish: resolveUnitName(rowUnitId) },
      unitHierarchyDto: unitHierarchy,
      supplierRate,
      basePricePerUnit: rowBasePricePerUnit,
      weightPer100pax: func.weightPer100pax ?? null,
    };
  });

  setFunctionRows(rows);
   setIsDirty(false);
}, [selectedRow, open]);


const markDirty = () => setIsDirty(true);


  useEffect(() => {
    if (!open) setFunctionRows([]);
  }, [open]);

  const handleExtraQtyChange = (newExtraValue) => {
    markDirty();
  const parsedExtra = parseFloat(newExtraValue) || 0; 
  setExtraQty(parsedExtra);
};



const handleCloseAttempt = () => {
  if (!isDirty) {
    onClose();
    return;
  }
  Swal.fire({
    title: "Unsaved Changes",
    text: "You have unsaved changes in this row. Close without saving?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Discard & Close",
    cancelButtonText: "Keep Editing",
    confirmButtonColor: "#d33",
  }).then((result) => {
    if (result.isConfirmed) {
      setIsDirty(false);
      onClose();
    }
  });
};

  // Qty change: same unit, so just weight × price-per-current-unit
  const handleQtyChange = (idx, value) => {
    markDirty();
    setFunctionRows((prev) =>
      prev.map((row, i) => {
        if (i !== idx) return row;
        const weight = parseFloat(value) || 0;
        return {
          ...row,
          weight,
          price: weight * (row.basePricePerUnit || 0),
        };
      }),
    );
  };

  // Unit change: recompute price-per-unit from supplierRate for the
  // NEW unit, then re-price using the (unchanged) weight number.
  const handleUnitChange = (idx, selectedId) => {
    if (!selectedId) return;
    markDirty();
    setFunctionRows((prev) =>
      prev.map((r, i) => {
        if (i !== idx) return r;

        const hierarchy = r.unitHierarchyDto;
        const unitToBase = buildUnitToBase(hierarchy);

        const newBasePricePerUnit =
          r.supplierRate * (unitToBase[selectedId] ?? 1);

        let selectedUnitName = "";
        if (hierarchy) {
          selectedUnitName =
            hierarchy.unitId === selectedId
              ? hierarchy.nameEnglish
              : hierarchy.children?.find((c) => c.unitId === selectedId)
                  ?.nameEnglish || "";
        }

        const weight = parseFloat(r.weight) || 0;

        return {
          ...r,
          unitId: selectedId,
          unit: selectedUnitName,
          unitObject: { id: selectedId, nameEnglish: selectedUnitName },
          basePricePerUnit: newBasePricePerUnit,
          price: weight * newBasePricePerUnit,
        };
      }),
    );
  };

  // =========================================================
  // Save — build exactly the AddUpdateGeneralFix row shape
  // =========================================================
  const handleSave = () => {
    const totalFunctionQty = functionRows.reduce(
      (sum, row) => sum + (parseFloat(row.weight) || 0),
      0,
    );
    const finalCalculatedQty = totalFunctionQty + extraQty;

    const eventFunctionGeneralFixRaws = functionRows.map((row) => ({
      eventFunctionId: row.eventFunctionId || 0,
      id: row.id || 0,
      price: parseFloat(row.price) || 0,
      rawCatId: row.rawCatId || 0,
      rawId: row.rawId || 0,
      unitId: row.unitId || 0,
      weight: parseFloat(row.weight) || 0,
      // kept only for display continuity if sidebar reopens pre-fetch
      functionNameEnglish: row.functionType || "",
      rawNameEnglish: row.menuItemName || "",
      supplierRate: row.supplierRate || 0,
    }));

    const totalPrice = eventFunctionGeneralFixRaws.reduce(
      (sum, fn) => sum + fn.price,
      0,
    );

    const aggregateUnitId =
      functionRows[0]?.unitId || selectedRow.unitId || 0;
    const aggregateRawCatId =
      functionRows[0]?.rawCatId || selectedRow.rawCatId || 0;
    const aggregateRawId =
      functionRows[0]?.rawId || selectedRow.rawMaterialId || 0;

    onSave?.({
      ...selectedRow,
      id: selectedRow.id || 0,
      price: totalPrice,
      rawCatId: aggregateRawCatId,
      rawId: aggregateRawId,
      unitId: aggregateUnitId,
      weight: finalCalculatedQty,
      eventFunctionGeneralFixRaws,

      finalQty: finalCalculatedQty,
      finalQtyInput: String(finalCalculatedQty),
      total: totalPrice,
      extraQty,
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
            onClick={handleCloseAttempt}
          />

          <motion.div
            className="absolute top-6 bottom-6 right-6 w-[900px] max-w-[95vw] bg-white rounded-2xl shadow-2xl flex flex-col"
            initial={{ x: "110%" }}
            animate={{ x: 0 }}
            exit={{ x: "110%" }}
            
          >
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                General Fix — Function Wise Allocation
              </h2>
              <button
                className="px-3 py-1 border rounded hover:bg-gray-50"
                onClick={handleCloseAttempt}
              >
                Close
              </button>
            </div>

            <div className="p-2 flex-1 overflow-auto">
              <div className="border rounded-xl overflow-x-auto">
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-3 flex justify-between items-center">
                  {/* <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Extra Quantity:
                    </span>
                    <input
                      type="tel"
                      readOnly
                      value={extraQty}
                      onChange={(e) => handleExtraQtyChange(e.target.value)}
                      className="w-32 h-9 rounded-md border border-gray-300 bg-white px-2 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005BA8]/40 focus:border-[#005BA8]"
                    />
                  </div>

                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Total Qty:</span>{" "}
                    <span className="text-[#005BA8] font-semibold">
                      {functionRows
                        .reduce(
                          (sum, row) => sum + (parseFloat(row.weight) || 0),
                          0,
                        )
                        .toFixed(2)}{" "}
                      {functionRows[0]?.unit || ""}
                    </span>
                  </div> */}
                </div>

                <table className="w-full border-collapse">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr className="text-sm font-semibold text-gray-700">
                      <th className="p-3 text-left">Sr.</th>
                      <th className="p-3 text-left">Function</th>
                      <th className="p-3 text-left">Item Name</th>
                      <th className="p-3 text-left">Qty</th>
                      <th className="p-3 text-left">Unit</th>
                      <th className="p-3 text-left">Price</th>
                    </tr>
                  </thead>

                  <tbody>
                    {functionRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="p-8 text-center text-gray-500"
                        >
                          No function data available
                        </td>
                      </tr>
                    ) : (
                      functionRows.map((row, idx) => (
                        <tr key={idx} className="border-t hover:bg-gray-50">
                          <td className="p-3">{row.sr}.</td>
                          <td className="p-3">{row.functionType || "-"}</td>
                          <td className="p-3 whitespace-normal break-words max-w-[320px]">
                            {row.menuItemName || "-"}
                          </td>

                          <td className="p-3 w-[100px]">
                            <BaseInput
                              type="tel"
                              value={row.weight}
                              onChange={(e) =>
                                handleQtyChange(idx, e.target.value)
                              }
                            />
                          </td>

                          <td className="p-3 w-[130px]">
                            <BaseSelect
                              value={row.unitId}
                              onChange={(e) =>
                                handleUnitChange(idx, Number(e.target.value))
                              }
                            >
                              <option value="">Select Unit</option>
                              {row.unitHierarchyDto && (
                                <option value={row.unitHierarchyDto.unitId}>
                                  {row.unitHierarchyDto.nameEnglish}
                                </option>
                              )}
                              {row.unitHierarchyDto?.children?.map((child) => (
                                <option
                                  key={child.unitId}
                                  value={child.unitId}
                                >
                                  {child.nameEnglish}
                                </option>
                              ))}
                            </BaseSelect>
                          </td>

                          <td className="p-3 w-[120px]">
                            <BaseInput
                              readOnly
                              type="text"
                              value={(parseFloat(row.price) || 0).toFixed(2)}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-6 py-4 border-t flex justify-end gap-3">
              <button
                className="px-4 py-2 border rounded hover:bg-gray-50"
                onClick={handleCloseAttempt}
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
    </AnimatePresence>
  );
}