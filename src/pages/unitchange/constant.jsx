  import { FormattedMessage } from "react-intl";
  import React from "react";

  const FinalQtyInput = ({ value, srNo, onFieldChange }) => {
    const [localValue, setLocalValue] = React.useState(value);

    React.useEffect(() => {
      setLocalValue(value);
    }, [value]);

    return (
      <input
        type="text"
        className="input input-sm w-full"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={(e) => onFieldChange(srNo, "final_qyt", e.target.value)}
      />
    );
  };

  const FinalUnitSelect = ({ value, srNo, unit, onFieldChange }) => {
    const unitOptions = buildUnitOptions(unit);
    const [localValue, setLocalValue] = React.useState(value);

    React.useEffect(() => {
      setLocalValue(value);
    }, [value]);

    return (
      <select
        className="select select-sm w-full"
        value={localValue}
        onChange={(e) => {
          const selectedOption = unitOptions.find(
            (opt) => opt.value === Number(e.target.value),
          );
          const newUnitId = Number(e.target.value);
          setLocalValue(newUnitId);
          onFieldChange(srNo, {
            final_unit_id: newUnitId,
            final_unit: selectedOption?.label ?? "",
          });
        }}
      >
        {unitOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  };

  export const columns = (
    onFieldChange,
    selectedRows,
    onRowSelect,
    onSelectAll,
    tableData,
  ) => [
    {
      id: "checkbox",
      // ✅ Select-all checkbox in header
      header: () => {
        const allSelected =
          tableData?.length > 0 && selectedRows?.size === tableData?.length;
        const someSelected =
          selectedRows?.size > 0 && selectedRows?.size < tableData?.length;

        return (
          <input
            type="checkbox"
            className="checkbox checkbox-sm"
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected; // ✅ indeterminate state
            }}
            onChange={(e) => onSelectAll(e.target.checked)}
          />
        );
      },
      // ✅ Individual row checkbox
      cell: ({ row }) => (
        <input
          type="checkbox"
          className="checkbox checkbox-sm"
          checked={selectedRows?.has(row.original.sr_no) ?? false}
          onChange={(e) => onRowSelect(row.original.sr_no, e.target.checked)}
        />
      ),
      meta: {
        headerClassName: "w-[3%] text-center",
        cellClassName: "w-[3%] text-center",
      },
    },
    {
  accessorKey: "sr_no",
  header: (
    <FormattedMessage
      id="COMMON.SR_NO"
      defaultMessage="Sr No"
    />
  ),
  meta: { headerClassName: "w-[4%]", cellClassName: "w-[4%]" },
},
{
  accessorKey: "rawmaterialname",
  header: (
    <FormattedMessage
      id="COMMON.RAWMATERIALNAME"
      defaultMessage="Raw Material Name"
    />
  ),
  meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
},
{
  accessorKey: "item_name",
  header: (
    <FormattedMessage
      id="COMMON.ITEMNAME"
      defaultMessage="Item Name"
    />
  ),
  meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
},
{
  accessorKey: "quantity",
  header: (
    <FormattedMessage
      id="COMMON.QUANTITY"
      defaultMessage="Quantity"
    />
  ),
  meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
},
{
  accessorKey: "itemraw_unit",
  header: (
    <FormattedMessage
      id="COMMON.ITEMRAWMATERIALUNIT"
      defaultMessage="Item Raw Material Unit"
    />
  ),
  meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
},
{
  accessorKey: "raw_unit",
  header: (
    <FormattedMessage
      id="COMMON.RAWMATERIALUNIT"
      defaultMessage="Raw Material Unit"
    />
  ),
  meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
},
{
  accessorKey: "final_qyt",
  header: (
    <FormattedMessage
      id="COMMON.FINALQUANTITY"
      defaultMessage="Final Quantity"
    />
  ),
  cell: ({ row }) => (
    <FinalQtyInput
      value={row.original.final_qyt}
      srNo={row.original.sr_no}
      onFieldChange={onFieldChange}
    />
  ),
  meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
},
{
  accessorKey: "final_unit",
  header: (
    <FormattedMessage
      id="COMMON.FINALUNIT"
      defaultMessage="Final Unit"
    />
  ),
  cell: ({ row }) => (
    <FinalUnitSelect
      value={row.original.final_unit_id}
      srNo={row.original.sr_no}
      unit={row.original.unit}
      onFieldChange={onFieldChange}
    />
  ),
  meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
},
  ];

  const buildUnitOptions = (unit) => {
    if (!unit) return [];
    const options = [{ value: unit.unitId, label: unit.nameEnglish }];
    if (unit.children?.length > 0) {
      unit.children.forEach((child) => {
        options.push({ value: child.unitId, label: child.nameEnglish });
      });
    }
    return options;
  };
