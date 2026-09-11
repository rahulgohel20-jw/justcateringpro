import { useEffect, useMemo, useState } from "react";
import { message } from "antd";
import { deleteRawmatrialcatidInmenuitem } from "@/services/apiServices";

export default function useRecipe(rawmaterialList, initialData = [], captainTableData = []) {
  const [tableData, setTableData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRaw, setSelectedRaw] = useState(null);
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState(null);
  const [unitOptions, setUnitOptions] = useState([]);
  const [rowCounter, setRowCounter] = useState(
    initialData && initialData.length ? initialData.length + 1 : 1
  );
  const [editingRowId, setEditingRowId] = useState(null);
  const [totalRate, setTotalRate] = useState(0);
  const [dishCosting, setDishCosting] = useState(0);

  const filteredTableData = useMemo(() => {
    if (!searchTerm) return tableData;
    return tableData.filter((item) =>
      (item.name || "")
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [tableData, searchTerm]);


useEffect(() => {
  const rawTotal = tableData.reduce((sum, item) => sum + Number(item.rate || 0), 0);
  const captainTotal = captainTableData.reduce((sum, item) => sum + Number(item.rate || 0), 0);
  const total = rawTotal + captainTotal;
  setTotalRate(total);
  setDishCosting(total > 0 ? total / 100 : 0);
}, [tableData, captainTableData]);

    const calculateRate = (raw, weightValue, selectedUnitId) => {
    const supplierRate = raw?.supplierRate || 0;
    const unitHierarchy = raw?.unitHierarchy;
    const nativeUnitId = raw?.unitId; // unit the supplierRate is actually priced in

    if (!unitHierarchy || !nativeUnitId) {
      return weightValue * supplierRate;
    }

    if (selectedUnitId === nativeUnitId) {
      // already in the native unit — no conversion needed
      return weightValue * supplierRate;
    }

    // Step 1: convert selected unit's weight into "parent unit" terms
    let weightInParentUnits;
    if (selectedUnitId === unitHierarchy.unitId) {
      weightInParentUnits = weightValue;
    } else {
      const selectedChild = unitHierarchy.children?.find(
        (c) => c.unitId === selectedUnitId
      );
      weightInParentUnits = selectedChild?.equivalentValue
        ? weightValue / selectedChild.equivalentValue
        : weightValue;
    }

    // Step 2: convert parent-unit terms into the native unit
    let weightInNativeUnit;
    if (nativeUnitId === unitHierarchy.unitId) {
      weightInNativeUnit = weightInParentUnits;
    } else {
      const nativeChild = unitHierarchy.children?.find(
        (c) => c.unitId === nativeUnitId
      );
      weightInNativeUnit = nativeChild?.equivalentValue
        ? weightInParentUnits * nativeChild.equivalentValue
        : weightInParentUnits;
    }

    return weightInNativeUnit * supplierRate;
  };



  const convertWeightBetweenUnits = (raw, weightValue, fromUnitId, toUnitId) => {
  const unitHierarchy = raw?.unitHierarchy;
  if (!unitHierarchy || fromUnitId === toUnitId) return weightValue;

  // Step 1: convert `fromUnitId` weight into parent-unit terms
  let weightInParent;
  if (fromUnitId === unitHierarchy.unitId) {
    weightInParent = weightValue;
  } else {
    const fromChild = unitHierarchy.children?.find((c) => c.unitId === fromUnitId);
    weightInParent = fromChild?.equivalentValue
      ? weightValue / fromChild.equivalentValue
      : weightValue;
  }

  // Step 2: convert parent-unit terms into `toUnitId`
  if (toUnitId === unitHierarchy.unitId) {
    return weightInParent;
  }
  const toChild = unitHierarchy.children?.find((c) => c.unitId === toUnitId);
  return toChild?.equivalentValue
    ? weightInParent * toChild.equivalentValue
    : weightInParent;
};

  const handleAddRecipe = () => {
    if (!selectedRaw || !weight || !unit) {
      return message.error("Please fill all recipe fields");
    }

    const raw = rawmaterialList.find((r) => r.rawMaterialId === selectedRaw);
    if (!raw) {
      return message.error("Invalid raw material selected");
    }

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0) {
      return message.error("Please enter a valid weight");
    }

    const unitName = unitOptions.find((u) => u.value === unit)?.label || "";
    const supplierRate = raw?.supplierRate || 0;

    const rate = calculateRate(raw, weightValue, unit);

    const duplicate = tableData.find(
      (r) => r.rawMaterialId === raw.rawMaterialId
    );
    if (!editingRowId && duplicate) {
      return message.error("This raw material is already added.");
    }

    if (editingRowId) {
      const updatedRows = tableData.map((row) =>
        row.sr_no === editingRowId
          ? {
            ...row,
            category: raw.category,
            name: raw.name,
            weight: weightValue,
            unit: unitName,
            unitId: unit,
            supplierRate,
            rate: Number(rate.toFixed(2)), 
            rawMaterialId: raw.rawMaterialId, 
          }
          : row
      );

      setTableData(updatedRows);
      setEditingRowId(null);
      message.success("Recipe updated");
    } else {
      const newRow = {
        sr_no: rowCounter,
        category: raw.category,
        name: raw.name,
        weight: weightValue,
        unit: unitName,
        unitId: unit,
        supplierRate,
        rate: Number(rate.toFixed(2)), 
        menuRmId: null,
        rawMaterialId: raw.rawMaterialId,
      };

setTableData((prev) => {
  const updated = [newRow, ...prev];
  return updated.map((row, idx) => ({ ...row, sr_no: idx + 1 }));
});
setRowCounter((prev) => prev + 1);
      message.success("Recipe added");
    }

    setSelectedRaw(null);
    setWeight("");
    setUnit(null);
    setUnitOptions([]); 
  };

  const handleDeleteRow = async (row) => {
    if (!row.menuRmId) {
      setTableData((prev) => prev.filter((item) => item.sr_no !== row.sr_no));
      return message.success("Deleted successfully");
    }

    try {
      const payload = {
        id: [row.menuRmId],
      };
      await deleteRawmatrialcatidInmenuitem(payload);
      setTableData((prev) => prev.filter((item) => item.sr_no !== row.sr_no));
      message.success("Deleted successfully");
    } catch (error) {
      console.error(error);
      message.error("Failed to delete");
    }
  };

  const handleEditRow = (row) => {
    setEditingRowId(row.sr_no);
    const raw = rawmaterialList.find((r) => r.rawMaterialId === row.rawMaterialId);

    if (!raw) return;

    setSelectedRaw(raw.rawMaterialId);

    const unitHierarchy = raw.unitHierarchy;
    if (unitHierarchy) {
      const options = [
        {
          label: unitHierarchy.nameEnglish,
          value: unitHierarchy.unitId,
        },
        ...(unitHierarchy.children?.map((child) => ({
          label: child.nameEnglish,
          value: child.unitId,
        })) || []),
      ];
      setUnitOptions(options);
    } else {
      setUnitOptions([{ label: raw.unit, value: raw.unitId }]);
    }

    setUnit(row.unitId);
    setWeight(row.weight);
  };

  return {
    tableData,
    setTableData,
    filteredTableData,
    searchTerm,
    setSearchTerm,
    selectedRaw,
    setSelectedRaw,
    weight,
    setWeight,
    unit,
    setUnit,
    unitOptions,
    setUnitOptions,
    totalRate,
    dishCosting,
    handleAddRecipe,
    handleDeleteRow,
    handleEditRow,
    calculateRate,         
  convertWeightBetweenUnits,
  };
}
