import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Checkbox, Select } from "antd";
import { TableComponent } from "@/components/table/TableComponent";
import { FormattedMessage } from "react-intl";
import { GetUnitData, GetAllContactCategory } from "@/services/apiServices";

const { Option } = Select;

// ─── Isolated input components — defined at MODULE scope, never remount ───────
const QuantityInput = ({ initialValue, onCommit }) => {
  const [value, setValue] = useState(initialValue);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) setValue(initialValue);
  }, [initialValue]);

  return (
    <input
      type="tel"
      className="input w-[120px]"
      value={value}
      onFocus={() => {
        isFocusedRef.current = true;
      }}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        isFocusedRef.current = false;
        onCommit(value);
      }}
    />
  );
};

const PriceInput = ({ initialValue, onCommit }) => {
  const [value, setValue] = useState(initialValue);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) setValue(initialValue);
  }, [initialValue]);

  return (
    <div className="flex items-center gap-1">
      ₹
      <input
        type="tel"
        className="input w-[120px]"
        value={value}
        onFocus={() => {
          isFocusedRef.current = true;
        }}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          isFocusedRef.current = false;
          onCommit(value);
        }}
      />
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const OutsideTable = ({ data = [], onDataChange, onSelectionChange }) => {
  const [tableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [unitList, setUnitList] = useState([]);
  const [contactCategoryList, setContactCategoryList] = useState([]);
  const isUpdatingRef = useRef(false);

  // ✅ Refs so columns useMemo never needs tableData/selectedRows as deps
  const tableDataRef = useRef(tableData);
  const selectedRowsRef = useRef(selectedRows);

  useEffect(() => {
    tableDataRef.current = tableData;
  }, [tableData]);
  useEffect(() => {
    selectedRowsRef.current = selectedRows;
  }, [selectedRows]);

  useEffect(() => {
    if (!isUpdatingRef.current) setTableData(data);
  }, [data]);

  useEffect(() => {
    if (onDataChange) {
      isUpdatingRef.current = true;
      onDataChange(tableData);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [tableData, onDataChange]);

  useEffect(() => {
    if (onSelectionChange) onSelectionChange(selectedRows);
  }, [selectedRows, onSelectionChange]);

  // ── Fetch units ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await GetUnitData(userId);
        const units =
          response?.data?.data?.["Unit Details"] &&
          Array.isArray(response.data.data["Unit Details"])
            ? response.data.data["Unit Details"]
            : [];
        setUnitList(units);
      } catch (err) {
        console.error("Error fetching units:", err);
        setUnitList([]);
      }
    };
    fetchUnits();
  }, []);

  // ── Fetch contact categories ───────────────────────────────────────────────
  useEffect(() => {
    const fetchContactCategories = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const response = await GetAllContactCategory(userId);
        const categories =
          response?.data?.data?.["Contact Category Details"] &&
          Array.isArray(response.data.data["Contact Category Details"])
            ? response.data.data["Contact Category Details"]
            : [];
        setContactCategoryList(categories);
      } catch (err) {
        console.error("Error fetching contact categories:", err);
        setContactCategoryList([]);
      }
    };
    fetchContactCategories();
  }, []);

  // ✅ Stable updaters — useCallback with [] so they never change reference
  const updateRowField = useCallback((rowId, field, value) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.id === rowId ? { ...item, [field]: value } : item,
      ),
    );
  }, []);

  const updateRowUnit = useCallback((rowId, value, units) => {
    const selectedUnit = units.find((u) => u.nameEnglish === value);
    setTableData((prev) =>
      prev.map((item) =>
        item.id === rowId
          ? { ...item, unit: value, unitId: selectedUnit?.id ?? 0 }
          : item,
      ),
    );
  }, []);

  const updateRowContactCategory = useCallback((rowId, value, categories) => {
    const selectedCategory = categories.find((c) => c.nameEnglish === value);
    setTableData((prev) =>
      prev.map((item) =>
        item.id === rowId
          ? {
              ...item,
              contactCategory: value,
              contactCategoryId: selectedCategory?.id ?? null,
            }
          : item,
      ),
    );
  }, []);

  // ✅ columns in useMemo — deps are ONLY stable values (no tableData/selectedRows)
  const columns = useMemo(
    () => [
      // ── Checkbox ──────────────────────────────────────────────────────────
      {
        id: "select",
        header: () => {
          const allSelected =
            tableDataRef.current.length > 0 &&
            selectedRowsRef.current.length === tableDataRef.current.length;
          const indeterminate =
            selectedRowsRef.current.length > 0 &&
            selectedRowsRef.current.length < tableDataRef.current.length;
          return (
            <Checkbox
              checked={allSelected}
              indeterminate={indeterminate}
              onChange={(e) =>
                setSelectedRows(
                  e.target.checked ? tableDataRef.current.map((r) => r.id) : [],
                )
              }
            />
          );
        },
        cell: ({ row }) => (
          <Checkbox
            checked={selectedRowsRef.current.includes(row.original.id)}
            onChange={(e) => {
              const id = row.original.id;
              setSelectedRows((prev) =>
                e.target.checked ? [...prev, id] : prev.filter((x) => x !== id),
              );
            }}
          />
        ),
      },

      // ── Menu Item ──────────────────────────────────────────────────────────
      {
        accessorKey: "itemName",
        header: () => (
          <FormattedMessage id="RAW_MATERIAL.NAME" defaultMessage="Menu Item" />
        ),
        cell: ({ row }) => (
          <span className="font-medium text-gray-900 text-sm">
            {row.original.itemName}
          </span>
        ),
      },

      // ── Menu Category ──────────────────────────────────────────────────────
      {
        accessorKey: "category",
        header: () => (
          <FormattedMessage
            id="RAW_MATERIAL.CATEGORY"
            defaultMessage="Menu Category"
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{row.original.category}</span>
        ),
      },

      // ── Type badge ─────────────────────────────────────────────────────────
      {
        id: "type",
        header: () => (
          <FormattedMessage id="RAW_MATERIAL.TYPE" defaultMessage="Type" />
        ),
        cell: () => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ">
            Outside
          </span>
        ),
      },

      // ── Vendor Allocate ────────────────────────────────────────────────────
      {
        accessorKey: "vendorAllocate",
        header: () => (
          <FormattedMessage
            id="RAW_MATERIAL.VENDOR"
            defaultMessage="Vendor Allocate"
          />
        ),
        cell: ({ row }) => {
          const vendor = row.original.vendorAllocate;
          return vendor && vendor !== "-" ? (
            <span className="text-sm font-medium text-gray-800">{vendor}</span>
          ) : (
            <span className="text-xs text-gray-400 italic">Not assigned</span>
          );
        },
      },

      // ── Contact Category (Select — no focus issue, it's a dropdown) ────────
      {
        accessorKey: "contactCategory",
        header: () => <span>Contact Category</span>,
        cell: ({ row }) => {
          const rowId = row.original.id;
          return (
            <Select
              showSearch
              className="w-[160px]"
              placeholder="Select contact category"
              value={row.original.contactCategory || undefined}
              onChange={(value) =>
                updateRowContactCategory(rowId, value, contactCategoryList)
              }
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {contactCategoryList.map((category) => (
                <Option key={category.id} value={category.nameEnglish}>
                  {category.nameEnglish}
                </Option>
              ))}
            </Select>
          );
        },
      },

      // ── Quantity — ✅ isolated component, owns its own state ───────────────
      {
        accessorKey: "quantity",
        header: () => (
          <FormattedMessage
            id="RAW_MATERIAL.QUANTITY"
            defaultMessage="Quantity"
          />
        ),
        cell: ({ row }) => {
          const rowId = row.original.id;
          return (
            <QuantityInput
              initialValue={row.original.quantity ?? ""}
              onCommit={(value) => updateRowField(rowId, "quantity", value)}
            />
          );
        },
      },

      // ── Price — ✅ isolated component, owns its own state ──────────────────
      {
        accessorKey: "price",
        header: () => (
          <FormattedMessage id="RAW_MATERIAL.PRICE" defaultMessage="Price" />
        ),
        cell: ({ row }) => {
          const rowId = row.original.id;
          return (
            <PriceInput
              initialValue={row.original.price ?? ""}
              onCommit={(value) => updateRowField(rowId, "price", value)}
            />
          );
        },
      },

      // ── Unit (Select — no focus issue) ─────────────────────────────────────
      {
        accessorKey: "unit",
        header: () => (
          <FormattedMessage id="RAW_MATERIAL.UNIT" defaultMessage="Unit" />
        ),
        cell: ({ row }) => {
          const rowId = row.original.id;
          return (
            <Select
              showSearch
              className="w-[120px]"
              placeholder="Select unit"
              value={row.original.unit || undefined}
              onChange={(value) => updateRowUnit(rowId, value, unitList)}
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {unitList.length > 0 ? (
                unitList.map((unit) => (
                  <Option key={unit.id} value={unit.nameEnglish}>
                    {unit.nameEnglish}
                  </Option>
                ))
              ) : (
                <Option value="" disabled>
                  No units available
                </Option>
              )}
            </Select>
          );
        },
      },

      // ── Total Price ────────────────────────────────────────────────────────
      {
        accessorKey: "totalPrice",
        header: () => (
          <FormattedMessage
            id="RAW_MATERIAL.TOTAL_PRICE"
            defaultMessage="Total Price"
          />
        ),
        cell: ({ row }) => {
          const quantity = Number(row.original.quantity) || 0;
          const price = Number(row.original.price) || 0;
          const total = quantity * price;
          return (
            <span
              className={`text-sm font-semibold ${
                total > 0 ? "text-green-700" : "text-gray-400"
              }`}
            >
              ₹{total.toFixed(2)}
            </span>
          );
        },
      },
    ],
    // ✅ tableData + selectedRows intentionally excluded — read via refs
    // unitList + contactCategoryList included because Select options depend on them
    [
      unitList,
      contactCategoryList,
      updateRowField,
      updateRowUnit,
      updateRowContactCategory,
    ],
  );

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

export default OutsideTable;
