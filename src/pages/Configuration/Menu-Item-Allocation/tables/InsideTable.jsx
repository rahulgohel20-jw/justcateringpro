import { useState, useEffect, useRef } from "react";
import { Checkbox } from "antd";
import { TableComponent } from "@/components/table/TableComponent";
import { FormattedMessage } from "react-intl";

// ─── Isolated input components ────────────────────────────────────────────────

const RemarksInput = ({ rowId, initialValue, onCommit }) => {
  const [value, setValue] = useState(initialValue);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setValue(initialValue);
    }
  }, [initialValue]);

  return (
    <input
      type="text"
      className="input w-full"
      placeholder="Enter remarks"
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

const NumberInput = ({ rowId, initialValue, onCommit }) => {
  const [value, setValue] = useState(initialValue);
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (!isFocusedRef.current) {
      setValue(initialValue);
    }
  }, [initialValue]);

  return (
    <input
      type="tel"
      className="input w-[200px]"
      placeholder="Enter number"
      step={1}
      value={value}
      onFocus={() => {
        isFocusedRef.current = true;
      }}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        isFocusedRef.current = false;
        // ✅ FIX: empty string or 0 → null, otherwise send the number
        const num = value === "" ? null : Number(value);
        onCommit(num === 0 ? null : num);
      }}
    />
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const InsideTable = ({ data = [], onDataChange, onSelectionChange }) => {
  const [tableData, setTableData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!isUpdatingRef.current) {
      setTableData(data);
    }
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
    if (onSelectionChange) {
      onSelectionChange(selectedRows);
    }
  }, [selectedRows, onSelectionChange]);

  const updateRowField = (rowId, field, value) => {
    setTableData((prev) =>
      prev.map((item) =>
        item.id === rowId ? { ...item, [field]: value } : item,
      ),
    );
  };

  const columns = [
    {
      id: "select",
      header: (
        <Checkbox
          checked={
            tableData.length > 0 && selectedRows.length === tableData.length
          }
          indeterminate={
            selectedRows.length > 0 && selectedRows.length < tableData.length
          }
          onChange={(e) =>
            setSelectedRows(
              e.target.checked ? tableData.map((row) => row.id) : [],
            )
          }
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedRows.includes(row.original.id)}
          onChange={(e) => {
            const id = row.original.id;
            setSelectedRows((prev) =>
              e.target.checked
                ? [...prev, id]
                : prev.filter((item) => item !== id),
            );
          }}
        />
      ),
    },
    {
      accessorKey: "menuItem",
      header: (
        <FormattedMessage id="RAW_MATERIAL.NAME" defaultMessage="Menu Item" />
      ),
    },
    {
      accessorKey: "category",
      header: (
        <FormattedMessage
          id="RAW_MATERIAL.CATEGORY"
          defaultMessage="Menu Category"
        />
      ),
    },
    {
      accessorKey: "remarks",
      header: (
        <FormattedMessage id="RAW_MATERIAL.REMAKS" defaultMessage="Remarks" />
      ),
      cell: ({ row }) => (
        <RemarksInput
          rowId={row.original.id}
          initialValue={row.original.remarks ?? ""}
          onCommit={(value) =>
            updateRowField(row.original.id, "remarks", value)
          }
        />
      ),
    },
    {
      accessorKey: "number",
      header: (
        <FormattedMessage id="RAW_MATERIAL.TYPE_NO" defaultMessage="Number" />
      ),
      cell: ({ row }) => (
        <NumberInput
          rowId={row.original.id}
          // ✅ FIX: was row.original.number which had "0" string from API
          // typeNo is already null-cleaned in mapApiItemToRow
          initialValue={row.original.typeNo ?? ""}
          onCommit={(value) => updateRowField(row.original.id, "typeNo", value)}
        />
      ),
    },
    {
      accessorKey: "vendorAllocate",
      header: (
        <FormattedMessage
          id="RAW_MATERIAL.VENDOR"
          defaultMessage="Vendor Allocate"
        />
      ),
      cell: ({ row }) => (
        <span className="text-sm text-gray-700">
          {row.original.vendorAllocate || "-"}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: <FormattedMessage id="RAW_MATERIAL.TYPE" defaultMessage="Type" />,
      cell: "Inside",
    },
  ];

  return (
    <div>
      <TableComponent columns={columns} data={tableData} paginationSize={10} />
      {selectedRows.length > 0 && (
        <div className="mt-2 text-sm text-gray-600">
          {selectedRows.length} row(s) selected
        </div>
      )}
    </div>
  );
};

export default InsideTable;
