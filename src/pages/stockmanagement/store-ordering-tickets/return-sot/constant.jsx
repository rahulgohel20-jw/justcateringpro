import { useState } from "react";
import { Select } from "antd";

// ── Isolated input — local state prevents focus loss on parent re-render ──────
const ReturnQtyInput = ({ detailId, initialValue, onCommit }) => {
  const [val, setVal] = useState(String(initialValue ?? 0));

  const commit = () => {
    const num = parseFloat(val);
    if (!isNaN(num)) onCommit(detailId, "returnQty", num);
  };

  return (
    <input
      type="tel"
      value={val}
      min={0}
      step="0.001"
      placeholder="0.000"
      onChange={(e) => setVal(e.target.value)}         // local only — no parent re-render
      onBlur={commit}                                   // flush on blur
      onKeyDown={(e) => e.key === "Enter" && commit()}  // flush on Enter
      className="border border-gray-200 rounded-lg px-2 py-1.5 w-28 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition bg-white"
    />
  );
};

export const columns = (handleChange, agencies) => [
  {
    accessorKey: "id",
    header: "#",
    meta: { headerClassName: "w-[4%]", cellClassName: "w-[4%] text-gray-500 font-medium" },
  },
  {
    accessorKey: "itemName",
    header: "Item Name",
    cell: ({ row }) => (
      <div>
        <p className="font-semibold text-gray-800 text-sm">{row.original.itemName}</p>
        <p className="text-xs text-gray-400 mt-0.5">{row.original.categoryName}</p>
      </div>
    ),
    meta: { headerClassName: "w-[28%]", cellClassName: "w-[28%]" },
  },
  {
    accessorKey: "supplierId",
    header: "Supplier",
    cell: ({ row }) => (
      <Select
        className="w-full"
        placeholder="Select supplier"
        value={row.original.supplierId || undefined}
        onChange={(value) => handleChange(row.original.detailId, "supplierId", value)}
        options={agencies.map((a) => ({
          value: a.id,
          label: a.nameEnglish,
        }))}
        allowClear
      />
    ),
    meta: { headerClassName: "w-[22%]", cellClassName: "w-[22%]" },
  },
  {
    accessorKey: "qty",
    header: "Accepted Qty",
    cell: ({ row }) => (
      <input
        type="tel"
        disabled
        value={row.original.acceptedQty ?? row.original.qty}
        className="border border-gray-200 rounded-lg px-2 py-1.5 w-24 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
      />
    ),
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">{row.original.unit}</span>
    ),
    meta: { headerClassName: "w-[8%]", cellClassName: "w-[8%]" },
  },
  {
    accessorKey: "returnQty",
    header: "Return Qty",
    cell: ({ row }) => (
      // key = detailId so component resets only when row changes
      <ReturnQtyInput
        key={row.original.detailId}
        detailId={row.original.detailId}
        initialValue={row.original.returnQty ?? 0}
        onCommit={handleChange}
      />
    ),
    meta: { headerClassName: "w-[14%]", cellClassName: "w-[14%]" },
  },
];