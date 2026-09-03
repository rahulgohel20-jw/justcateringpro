import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Select } from "antd";
import { SearchRawMaterial } from "@/services/apiServices";

const AddRawMaterial = ({
  isOpen,
  onClose,
  onSave,
  agencies,
  unit,
  eventFunctions = [],
  existingMaterials = [],
}) => {
  const existingIds = new Set(
    existingMaterials
      .filter((m) => !m.isNewRow && m.rawMaterialId)
      .map((m) => m.rawMaterialId),
  );
  const existingNames = new Set(
    existingMaterials.map((m) => (m.material || "").trim().toLowerCase()),
  );

  const isAlreadyAdded = (item) => {
    const itemName = (item.nameEnglish || item.name || "").trim().toLowerCase();
    return existingIds.has(item.id) || existingNames.has(itemName);
  };
  const userId = localStorage.getItem("userId");

  // ── Search state ──
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null); // { id, name }
  const debounceRef = useRef(null);
  const [showDropdown, setShowDropdown] = useState(false);
  // ── Form fields ──
  const [eventFunctionId, setEventFunctionId] = useState(0);
  const [qty, setQty] = useState("");
  const [unitId, setUnitId] = useState(unit[0]?.id || 1);
  const [errors, setErrors] = useState({});

 
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSearchResults([]);
      setShowDropdown(false);
      setSelectedMaterial(null);
      setEventFunctionId(0);
      setQty("");
      setUnitId(unit[0]?.id || 1);
      setErrors({});
    }
  }, [isOpen]);

  
  useEffect(() => {
    if (unit.length > 0 && !unitId) {
      setUnitId(unit[0].id);
    }
  }, [unit]);

 
  const handleSearchInput = (value) => {
    setSearchTerm(value);
    setSelectedMaterial(null);
    setErrors((prev) => ({ ...prev, material: "" }));

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await SearchRawMaterial(true, userId, 1, 20, value.trim());
        const items = res?.data?.data?.["Raw Material Details"] || [];
        setSearchResults(items);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 350);
  };

  const handleSelectMaterial = (item) => {
    if (isAlreadyAdded(item)) {
      setErrors((prev) => ({
        ...prev,
        material: "This material is already added.",
      }));
      setShowDropdown(false);
      return;
    }
    setSelectedMaterial({
      id: item.id,
      name: item.nameEnglish || item.name || "",
      unitId: item.units?.id || item.unitId || unitId,
      unitName: item.units?.nameEnglish || "",
      unitHierarchy: item.unitHierarchy || null,
      supplierRate: item.supplierRate || 0,
    });
    setSearchTerm(item.nameEnglish || item.name || "");

    if (item.unitHierarchy?.unitId) setUnitId(item.unitHierarchy.unitId);
    else if (item.unit?.id) setUnitId(item.unit.id);
    setShowDropdown(false);
    setErrors((prev) => ({ ...prev, material: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!selectedMaterial) newErrors.material = "Please select an item";
    if (!eventFunctionId)
      newErrors.eventFunctionId = "Please select a function";
    if (!qty || parseFloat(qty) <= 0)
      newErrors.qty = "Qty must be greater than 0";
    if (!unitId) newErrors.unitId = "Please select a unit";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getEffectiveRate = () => {
  const baseRate = selectedMaterial?.supplierRate || 0;
  const hierarchy = selectedMaterial?.unitHierarchy;
  if (!hierarchy) return baseRate;

  // Parent/base unit selected → rate as-is
  if (Number(unitId) === hierarchy.unitId) return baseRate;

  // Child unit selected → divide by its equivalentValue
  const child = (hierarchy.children || []).find(
    (c) => c.unitId === Number(unitId),
  );
  if (child?.equivalentValue) {
    return baseRate / child.equivalentValue;
  }
  return baseRate;
};

const effectiveRate = getEffectiveRate();

 const handleSave = () => {
  if (!validate()) return;

  const hierarchyUnits = selectedMaterial?.unitHierarchy
    ? [
        {
          unitId: selectedMaterial.unitHierarchy.unitId,
          nameEnglish: selectedMaterial.unitHierarchy.nameEnglish,
        },
        ...(selectedMaterial.unitHierarchy.children || []),
      ]
    : unit.map((u) => ({ unitId: u.id, nameEnglish: u.nameEnglish }));

  const selectedUnitObj = hierarchyUnits.find(
    (u) => u.unitId === Number(unitId),
  );

  const supplierRate = getEffectiveRate(); // ← was: selectedMaterial?.supplierRate || 0
  const parsedQty = parseFloat(qty) || 0;

  const newRowData = {
    rowKey: `new_${Date.now()}_${Math.random()}`,
    id: Date.now(),
    rawMaterialId: null,
    material: selectedMaterial.name,
    qty: parsedQty,
    finalQty: parsedQty,
    finalQtyInput: String(parsedQty),
    total: supplierRate * parsedQty,
    basePricePerUnit: supplierRate,
    unit: selectedUnitObj?.nameEnglish || selectedMaterial.unitName || "KG",
    unitId: Number(unitId),
    units: {
      id: Number(unitId),
      nameEnglish: selectedUnitObj?.nameEnglish || "",
    },
    unitHierarchyDto: selectedMaterial.unitHierarchy || null,
    agency: "",
    supplierId: 0,
    place: "",
    placeId: 0,
    date: null,
    eventFunctionId,
    isNewRow: true,
    eventRawMaterialFunctions: [],
  };

  onSave(newRowData);
  onClose();
};

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">Add Extra Item</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={480}
      centered
    >
      <div className="space-y-5 mt-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Item Name <span className="text-red-500">*</span>
          </label>
          <Select
            showSearch
            className="w-full"
            placeholder="Search item..."
            value={selectedMaterial?.id || undefined}
            filterOption={false}
            onSearch={handleSearchInput}
            onChange={(value) => {
              const item = searchResults.find((r) => r.id === value);
              if (item) handleSelectMaterial(item);
            }}
            notFoundContent={isSearching ? "Searching..." : "No items found"}
            status={errors.material ? "error" : ""}
            options={searchResults.map((item) => ({
              label: `${item.nameEnglish || item.name}${item.units?.nameEnglish ? ` (${item.units.nameEnglish})` : ""}${isAlreadyAdded(item) ? " - Already added" : ""}`,
              value: item.id,
              disabled: isAlreadyAdded(item),
            }))}
          />
          {errors.material && (
            <p className="text-red-500 text-xs mt-1">{errors.material}</p>
          )}
        </div>

        {/* ── Function Name ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Function Name <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full border ${errors.eventFunctionId ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400`}
            value={eventFunctionId}
            onChange={(e) => {
              setEventFunctionId(Number(e.target.value));
              setErrors((prev) => ({ ...prev, eventFunctionId: "" }));
            }}
          >
            <option value={0}>Select Function</option>
            {eventFunctions.map((func) => (
              <option key={func.eventFunctionId} value={func.eventFunctionId}>
                {func.functionName}
              </option>
            ))}
          </select>
          {errors.eventFunctionId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.eventFunctionId}
            </p>
          )}
        </div>

        {/* ── Qty ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Qty <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            className={`w-full border ${errors.qty ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400`}
            value={qty}
            onChange={(e) => {
              setQty(e.target.value);
              setErrors((prev) => ({ ...prev, qty: "" }));
            }}
            placeholder="Enter quantity"
          />
          {selectedMaterial && qty && parseFloat(qty) > 0 && (
            <p className="text-xs font-bold text-green-700 mt-1">
              Rate: ₹{effectiveRate.toFixed(2)} /{" "}
              {
                [
                  {
                    unitId: selectedMaterial?.unitHierarchy?.unitId,
                    nameEnglish: selectedMaterial?.unitHierarchy?.nameEnglish,
                  },
                  ...(selectedMaterial?.unitHierarchy?.children || []),
                ].find((u) => u.unitId === Number(unitId))?.nameEnglish || ""
              }
              {" — Total: ₹"}
              {(effectiveRate * parseFloat(qty)).toFixed(2)}
            </p>
          )}
          {errors.qty && (
            <p className="text-red-500 text-xs mt-1">{errors.qty}</p>
          )}
        </div>

        {/* ── Unit ── */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Unit <span className="text-red-500">*</span>
          </label>
          <select
            className={`w-full border ${errors.unitId ? "border-red-500" : "border-gray-300"} rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400`}
            value={unitId}
            onChange={(e) => {
              setUnitId(Number(e.target.value));
              setErrors((prev) => ({ ...prev, unitId: "" }));
            }}
          >
            {selectedMaterial?.unitHierarchy
              ? [
                  // Parent unit
                  {
                    unitId: selectedMaterial.unitHierarchy.unitId,
                    nameEnglish: selectedMaterial.unitHierarchy.nameEnglish,
                  },
                  // Children units
                  ...(selectedMaterial.unitHierarchy.children || []),
                ].map((u) => (
                  <option key={u.unitId} value={u.unitId}>
                    {u.nameEnglish}
                  </option>
                ))
              : unit.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nameEnglish}
                  </option>
                ))}
          </select>
          {errors.unitId && (
            <p className="text-red-500 text-xs mt-1">{errors.unitId}</p>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
          >
            Add Item
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AddRawMaterial;
