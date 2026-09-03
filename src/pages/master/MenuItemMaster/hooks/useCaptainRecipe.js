import { useState, useMemo } from "react";
import { message } from "antd";

export default function useCaptainRecipe() {
  const [captainTableData, setCaptainTableData] = useState([]);
  const [captainSearchTerm, setCaptainSearchTerm] = useState("");
  const [selectedCaptainRows, setSelectedCaptainRows] = useState([]);
  const [selectedCaptainRecipe, setSelectedCaptainRecipe] = useState(null);
  const [captainWeight, setCaptainWeight] = useState("");
  const [captainUnit, setCaptainUnit] = useState(null);
  const [editingCaptainRow, setEditingCaptainRow] = useState(null);

  const filteredCaptainData = useMemo(() =>
    captainTableData.filter((i) =>
      (i.name || "").toLowerCase().includes(captainSearchTerm.toLowerCase())
    ), [captainTableData, captainSearchTerm]
  );

  /* ── Rate calculator: scales the recipe's BASE rate by the
     entered weight, converting units via the recipe's own hierarchy ── */
  const calculateCaptainRate = (recipe, weightValue, selectedUnitId) => {
    if (!recipe) return 0;

    const baseRate = Number(recipe.weight != null ? recipe.rate : recipe.rate) || 0;
    const baseWeight = Number(recipe.weight) || 0;
    const qty = Number(weightValue) || 0;

    if (!qty || !selectedUnitId || baseWeight <= 0) return baseRate;

    const baseUnitId = recipe.unitId ?? recipe.unitHierarchy?.unitId;
    const hierarchyRootId = recipe.unitHierarchy?.unitId;
    const hierarchyChildren = recipe.unitHierarchy?.children || [];

    const getFactor = (child) =>
      child?.conversionFactor ?? child?.factor ?? child?.equivalentValue ?? 1;

    let weightInBaseUnit = qty;

    if (Number(selectedUnitId) === Number(baseUnitId)) {
      weightInBaseUnit = qty;
    } else if (
      Number(selectedUnitId) === Number(hierarchyRootId) &&
      Number(hierarchyRootId) !== Number(baseUnitId)
    ) {
      const childEntry = hierarchyChildren.find(
        (c) => Number(c.unitId) === Number(baseUnitId)
      );
      const factor = getFactor(childEntry) || 1;
      weightInBaseUnit = qty * factor;
    } else {
      const selectedChild = hierarchyChildren.find(
        (c) => Number(c.unitId) === Number(selectedUnitId)
      );
      if (selectedChild) {
        const factor = getFactor(selectedChild) || 1;
        weightInBaseUnit = qty / factor;
      }
    }

    const ratio = weightInBaseUnit / baseWeight;
    return Number((ratio * baseRate).toFixed(2));
  };

  const handleAddCaptainItems = (recipe, weight, unitId, unitName) => {
    if (!recipe) {
      message.warning("Please select a Captain Recipe");
      return;
    }
    if (!weight || String(weight).trim() === "") {
      message.warning("Please enter Weight");
      return;
    }
    if (!unitId) {
      message.warning("Please select a Unit");
      return;
    }

    const calculatedRate = calculateCaptainRate(recipe, weight, unitId);

    if (editingCaptainRow !== null) {
      setCaptainTableData((prev) =>
        prev.map((r) =>
          r.sr_no === editingCaptainRow
            ? {
                ...r,
                captainReceipeId: recipe.id,
                name: recipe.name,
                category: "Gravy",
                weight,
                unitId,
                unit: unitName,
                rate: calculatedRate,
                // keep the ORIGINAL base snapshot untouched so future
                // edits (and further unit switches) stay accurate
                baseWeight: r.baseWeight ?? recipe.weight,
                baseRate: r.baseRate ?? recipe.rate,
                baseUnitId: r.baseUnitId ?? (recipe.unitId ?? recipe.unitHierarchy?.unitId),
                unitHierarchy: r.unitHierarchy ?? recipe.unitHierarchy,
              }
            : r
        )
      );
      message.success("Captain recipe updated");
      setEditingCaptainRow(null);
    } else {
      const alreadyExists = captainTableData.some(
        (row) => row.captainReceipeId === recipe.id
      );
      if (alreadyExists) {
        message.warning("This captain recipe is already added");
        return;
      }

      const nextSrNo =
        captainTableData.length > 0
          ? Math.max(...captainTableData.map((r) => r.sr_no)) + 1
          : 1;

      const newRow = {
        sr_no: nextSrNo,
        menuRmId: 0,
        captainReceipeId: recipe.id,
        name: recipe.name,
        category: "Gravy",
        weight,
        unitId,
        unit: unitName,
        rate: calculatedRate,
        venueId: 0,
        venue: "At Venue",
        // snapshot of the recipe's ORIGINAL base data — never overwritten
        baseWeight: recipe.weight,
        baseRate: recipe.rate,
        baseUnitId: recipe.unitId ?? recipe.unitHierarchy?.unitId,
        unitHierarchy: recipe.unitHierarchy,
      };
      setCaptainTableData((prev) => [...prev, newRow]);
      message.success("Captain recipe added");
    }

    setSelectedCaptainRecipe(null);
    setCaptainWeight("");
    setCaptainUnit(null);
  };

  const handleDeleteCaptainRow = (rowOrSrNo) => {
    const srNo = typeof rowOrSrNo === "object" ? rowOrSrNo.sr_no : rowOrSrNo;
    setCaptainTableData((prev) =>
      prev
        .filter((r) => r.sr_no !== srNo)
        .map((r, idx) => ({ ...r, sr_no: idx + 1 }))
    );
    message.success("Deleted successfully");
  };

  const handleEditCaptainRow = (row) => {
    // rebuild the "recipe" object from the row's ORIGINAL base snapshot,
    // not its current display weight/rate/unit — so recalculation is
    // always relative to the true base, and unit switches convert correctly
    setSelectedCaptainRecipe({
      id: row.captainReceipeId,
      name: row.name,
      unitId: row.baseUnitId ?? row.unitId,
      unitName: row.unit,
      weight: row.baseWeight ?? row.weight,
      rate: row.baseRate ?? row.rate,
      unitHierarchy: row.unitHierarchy,
    });
    setCaptainWeight(String(row.weight));
    setCaptainUnit({ id: row.unitId, name: row.unit });
    setEditingCaptainRow(row.sr_no);
  };

  const handleCancelCaptainEdit = () => {
    setSelectedCaptainRecipe(null);
    setCaptainWeight("");
    setCaptainUnit(null);
    setEditingCaptainRow(null);
  };

  return {
    captainTableData, setCaptainTableData,
    filteredCaptainData,
    captainSearchTerm, setCaptainSearchTerm,
    selectedCaptainRows, setSelectedCaptainRows,
    selectedCaptainRecipe, setSelectedCaptainRecipe,
    captainWeight, setCaptainWeight,
    captainUnit, setCaptainUnit,
    editingCaptainRow,
    handleAddCaptainItems,
    handleDeleteCaptainRow,
    handleEditCaptainRow,
    handleCancelCaptainEdit,
  };
}