import { useState } from "react";
import { Select } from "antd";
import { Trash } from "lucide-react";

// ── Isolated input — keeps local state so typing never loses focus ────────────
// onBlur/onKeyDown flush the value up to parent only when done typing
const AcceptedQtyInput = ({ detailId, initialValue, onCommit }) => {
  const [val, setVal] = useState(String(initialValue ?? ""));

  const commit = () => {
    const num = Number(val);
    if (!isNaN(num)) onCommit(detailId, "acceptedQty", num);
  };

  return (
    <input
      type="tel"
      value={val}
      onChange={(e) => setVal(e.target.value)}        // local only — no re-render of parent
      onBlur={commit}                                  // flush on blur
      onKeyDown={(e) => e.key === "Enter" && commit()} // flush on Enter
      className="border border-gray-200 rounded-lg px-2 py-1.5 w-24 text-sm focus:outline-none focus:ring-2 focus:ring-[#005BA8]/20 focus:border-[#005BA8] transition"
    />
  );
};

export const columns = (handleChange, handleDelete, agencies) => [
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
    meta: { headerClassName: "w-[22%]", cellClassName: "w-[22%]" },
  },
  // {
  //   accessorKey: "supplierId",
  //   header: "Supplier",
  //   cell: ({ row }) => (
  //     <Select
  //       className="w-full"
  //       placeholder="Select supplier"
  //       value={row.original.supplierId || undefined}
  //       onChange={(value) => handleChange(row.original.detailId, "supplierId", value)}
  //       options={agencies.map((a) => ({
  //         value: a.id,
  //         label: a.nameEnglish,
  //       }))}
  //       allowClear
  //     />
  //   ),
  //   meta: { headerClassName: "w-[20%]", cellClassName: "w-[20%]" },
  // },
  {
    accessorKey: "qty",
    header: "Required Qty",
    cell: ({ row }) => (
      <input
        type="tel"
        disabled
        value={row.original.qty}
        className="border border-gray-200 rounded-lg px-2 py-1.5 w-24 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
      />
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
  },
  {
    accessorKey: "acceptedQty",
    header: "Accepted Qty",
    cell: ({ row }) => (
      // key = detailId so component resets only when the row changes, not on every parent render
      <AcceptedQtyInput
        key={row.original.detailId}
        detailId={row.original.detailId}
        initialValue={row.original.acceptedQty ?? row.original.qty}
        onCommit={handleChange}
      />
    ),
    meta: { headerClassName: "w-[10%]", cellClassName: "w-[10%]" },
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
    accessorKey: "availableStock",
    header: "Available Stock",
    cell: ({ row }) => {
      const stock = row.original.availableStock;
      return (
        <span className={`font-semibold text-sm ${stock <= 0 ? "text-red-500" : "text-green-600"}`}>
          {stock} {row.original.unit}
        </span>
      );
    },
    meta: { headerClassName: "w-[12%]", cellClassName: "w-[12%]" },
  },
  {
    id: "action",
    header: "Action",
    cell: ({ row }) => (
      <button
        onClick={() => handleDelete(row.original.detailId)}
        className="text-white bg-red-600 hover:bg-red-700 p-1.5 rounded-lg transition-colors"
      >
        <Trash size={16} />
      </button>
    ),
    meta: { headerClassName: "w-[6%]", cellClassName: "w-[6%]" },
  },
];