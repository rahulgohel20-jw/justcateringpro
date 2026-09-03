import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Checkbox } from "antd";
import { TableComponent } from "@/components/table/TableComponent";
import { FormattedMessage } from "react-intl";
import { GetUnitData } from "@/services/apiServices";

const NumberInput = ({ initialValue, onCommit, width = "90px", placeholder = "0" }) => {
  const [value, setValue] = useState(initialValue);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) setValue(initialValue);
  }, [initialValue]);

  return (
    <input
      className="input"
      style={{ width }}
      type="tel"
      min="0"
      placeholder={placeholder}
      value={value}
      onFocus={() => { isFocusedRef.current = true; }}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        isFocusedRef.current = false;
        onCommit(value);
      }}
    />
  );
};

const ChefLabourTable = ({ data = [], onDataChange, onSelectionChange }) => {
  const [tableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const isUpdatingRef = useRef(false);

  // Fetch unit dropdown data
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const res = await GetUnitData(userId);
        const raw = res?.data?.data?.["Unit Details"];
setUnitList(Array.isArray(raw) ? raw : []);
      } catch (err) {
        console.error("Failed to fetch units", err);
      }
    };
    fetchUnits();
  }, []);

  useEffect(() => {
    if (!isUpdatingRef.current) setTableData(data);
  }, [data]);

  useEffect(() => {
    if (onDataChange) {
      isUpdatingRef.current = true;
      onDataChange(tableData);
      setTimeout(() => { isUpdatingRef.current = false; }, 0);
    }
  }, [tableData, onDataChange]);

  useEffect(() => {
    if (onSelectionChange) onSelectionChange(selectedRows);
  }, [selectedRows, onSelectionChange]);

  const updateRowField = useCallback((rowId, field, value) => {
    setTableData((prev) =>
      prev.map((item) => item.id === rowId ? { ...item, [field]: value } : item)
    );
  }, []);

  const handleAllocationTypeChange = useCallback((rowId, newType) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.id === rowId
          ? {
              ...item,
              allocationType: newType,
              pricePerHelper: newType === "plate_wise" ? 0 : item.pricePerHelper,
              // reset counter/helper when switching modes
              helperNo: newType === "plate_wise" ? 0 : item.helperNo,
            }
          : item
      )
    );
  }, []);

  const columns = useMemo(() => [
    {
      id: "select",
      header: (
        <Checkbox
          checked={tableData.length > 0 && selectedRows.length === tableData.length}
          indeterminate={selectedRows.length > 0 && selectedRows.length < tableData.length}
          onChange={(e) =>
            setSelectedRows(e.target.checked ? tableData.map((r) => r.id) : [])
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRows.includes(row.original.id)}
          onChange={(e) => {
            const id = row.original.id;
            setSelectedRows((prev) =>
              e.target.checked ? [...prev, id] : prev.filter((x) => x !== id)
            );
          }}
        />
      ),
    },

    {
      accessorKey: "menuItem",
      header: <FormattedMessage id="RAW_MATERIAL.NAME" defaultMessage="Menu Item" />,
      cell: ({ row }) => (
        <span className="font-medium text-gray-900 text-sm">{row.original.menuItem}</span>
      ),
    },

    {
      accessorKey: "category",
      header: <FormattedMessage id="RAW_MATERIAL.CATEGORY" defaultMessage="Menu Category" />,
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">{row.original.category}</span>
      ),
    },

    {
      accessorKey: "vendorAllocate",
      header: <FormattedMessage id="RAW_MATERIAL.VENDOR" defaultMessage="Vendor Allocate" />,
      cell: ({ row }) => {
        const vendor = row.original.vendorAllocate;
        return vendor && vendor !== "-"
          ? <span className="text-sm font-medium text-gray-800">{vendor}</span>
          : <span className="text-xs text-gray-400 italic">Not assigned</span>;
      },
    },

    // Allocation Type per row
    {
      id: "allocationType",
      header: () => <div className="font-semibold text-gray-700">Allocation Type</div>,
      cell: ({ row }) => {
        const rowId = row.original.id;
        const currentType = row.original.allocationType || "plate_wise";
        return (
          <select
            className="select text-xs py-1 px-2 w-[130px]"
            value={currentType}
            onChange={(e) => handleAllocationTypeChange(rowId, e.target.value)}
          >
            <option value="plate_wise">Plate Wise</option>
            <option value="counter_wise">Counter Wise</option>
          </select>
        );
      },
    },

    // Unit — plate_wise only
    {
      id: "unitId",
      header: () => (
        <div>
          <div className="font-semibold text-gray-700">Unit</div>
          <div className="text-xs text-gray-400 font-normal mt-1">plate wise only</div>
        </div>
      ),
      cell: ({ row }) => {
       const allocType = row.original.allocationType;
const isPlateWise = !allocType || allocType === "plate_wise" || allocType === "plate wise";
if (!isPlateWise) {
  return <span className="text-xs text-gray-300 italic">—</span>;
}
        return (
          <select
            className="select text-xs py-1 px-2 w-[110px]"
            value={row.original.unitId || ""}
            onChange={(e) => updateRowField(row.original.id, "unitId", Number(e.target.value))}
          >
            <option value="">Select</option>
            {(unitList || []).map((u) => (
  <option key={u.id} value={u.id}>
    {u.nameEnglish || u.name}
  </option>
))}
          </select>
        );
      },
    },

    // Pax (counterNo) — plate_wise label "Pax", counter_wise label "Counter No"
    {
      id: "counterNo",
      header: ({ table }) => {
        // Determine dominant type across all rows for header label
        const rows = table.getRowModel().rows;
        const allPlate = rows.every(
          (r) => (r.original.allocationType || "plate_wise") === "plate_wise"
        );
        const allCounter = rows.every(
          (r) => r.original.allocationType === "counter_wise"
        );
        const label = allPlate ? "Pax" : allCounter ? "Counter No" : "Pax / Counter No";
        return <div className="font-semibold text-gray-700">{label}</div>;
      },
      cell: ({ row }) => {
        const isPlateWise = (row.original.allocationType || "plate_wise") === "plate_wise";
        return (
          <div>
            <div className="text-[10px] text-gray-400 mb-0.5">
              {/* {isPlateWise ? "Pax" : "Counter No"} */}
            </div>
            <NumberInput
              initialValue={row.original.counterNo ?? ""}
              onCommit={(value) => updateRowField(row.original.id, "counterNo", value)}
              width="80px"
            />
          </div>
        );
      },
    },

    // Helper No — counter_wise only
    {
      id: "helperNo",
      header: () => (
        <div>
          <div className="font-semibold text-gray-700">Helper No</div>
          <div className="text-xs text-gray-400 font-normal mt-1">counter wise only</div>
        </div>
      ),
      cell: ({ row }) => {
        const isCounterWise = row.original.allocationType === "counter_wise" || 
                      row.original.allocationType === "counter wise";
        if (!isCounterWise) {
          return <span className="text-xs text-gray-300 italic">—</span>;
        }
        return (
          <NumberInput
            initialValue={row.original.helperNo ?? ""}
            onCommit={(value) => updateRowField(row.original.id, "helperNo", value)}
            width="80px"
          />
        );
      },
    },

    // Price Per Helper — counter_wise only
    {
      id: "pricePerHelper",
      header: () => (
        <div>
          <div className="font-semibold text-gray-700">Price/Helper</div>
          <div className="text-xs text-gray-400 font-normal mt-1">counter wise only</div>
        </div>
      ),
      cell: ({ row }) => {
        const isCounterWise = row.original.allocationType === "counter_wise" || 
                      row.original.allocationType === "counter wise";
        if (!isCounterWise) {
          return <span className="text-xs text-gray-300 italic">—</span>;
        }
        return (
          <NumberInput
            initialValue={row.original.pricePerHelper ?? ""}
            onCommit={(value) => updateRowField(row.original.id, "pricePerHelper", value)}
            width="100px"
            placeholder="0.00"
          />
        );
      },
    },

    // Price Per Labour — label is "Price" for plate_wise, "Price/Labour" for counter_wise
    {
      id: "pricePerLabour",
      header: ({ table }) => {
        const rows = table.getRowModel().rows;
        const allPlate = rows.every(
          (r) => (r.original.allocationType || "plate_wise") === "plate_wise"
        );
        const allCounter = rows.every(
          (r) => r.original.allocationType === "counter_wise"
        );
        const label = allPlate ? "Price" : allCounter ? "Price/Labour" : "Price / Price per Labour";
        return <div className="font-semibold text-gray-700">{label}</div>;
      },
      cell: ({ row }) => {
        const isPlateWise = (row.original.allocationType || "plate_wise") === "plate_wise";
        return (
          <div>
            <div className="text-[10px] text-gray-400 mb-0.5">
              {/* {isPlateWise ? "Price" : "Price/Labour"} */}
            </div>
            <NumberInput
              initialValue={row.original.pricePerLabour ?? ""}
              onCommit={(value) => updateRowField(row.original.id, "pricePerLabour", value)}
              width="100px"
              placeholder="0.00"
            />
          </div>
        );
      },
    },

    // Total Price
    {
      accessorKey: "totalPrice",
      header: <FormattedMessage id="RAW_MATERIAL.TOTAL_PRICE" defaultMessage="Total Price" />,
      cell: ({ row }) => {
        const isCounterWise = row.original.allocationType === "counter_wise";
        const counterNo      = Number(row.original.counterNo)      || 0;
        const helperNo       = Number(row.original.helperNo)        || 0;
        const pricePerLabour = Number(row.original.pricePerLabour)  || 0;
        const pricePerHelper = Number(row.original.pricePerHelper)  || 0;

        // plate_wise: pax (counterNo) * price (pricePerLabour)
        // counter_wise: (counterNo * pricePerLabour) + (helperNo * pricePerHelper)
        const total = isCounterWise
          ? counterNo * pricePerLabour + helperNo * pricePerHelper
          : counterNo * pricePerLabour;

        return (
          <span className={`text-sm font-semibold ${total > 0 ? "text-green-700" : "text-gray-400"}`}>
            ₹{total.toFixed(2)}
          </span>
        );
      },
    },

  ], [tableData, selectedRows, unitList, updateRowField, handleAllocationTypeChange]);

  return (
    <div>
      <TableComponent columns={columns} data={tableData} paginationSize={10} />
      {selectedRows.length > 0 && (
        <div className="mt-2 text-sm text-gray-500 flex items-center gap-1">
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            {selectedRows.length}
          </span>
          row(s) selected
        </div>
      )}
    </div>
  );
};

export default ChefLabourTable;