import { Fragment, useMemo, useState } from "react";
import { Eye, Plus, Trash, ChevronDown } from "lucide-react";

const PAGE_SIZE = 10;

// Details shown under an expanded row: only these 6 columns
function ExpenseDetailsPanel({ items }) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-500 py-6 text-center">
        No item details found
      </p>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-x-auto bg-white">
      <table className="w-full text-sm text-gray-700 border-collapse min-w-[700px]">
        <thead>
          <tr className="text-left text-black bg-blue-50 border-b">
            <th className="py-3 px-4 font-semibold">Supplier</th>
            <th className="py-3 px-4 font-semibold">Item</th>
            <th className="py-3 px-4 font-semibold">Date</th>
            <th className="py-3 px-4 font-semibold">Price</th>
            <th className="py-3 px-4 font-semibold">Payment Type</th>
            <th className="py-3 px-4 font-semibold">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.expenseItemId ?? idx}
              className="border-b last:border-b-0"
            >
              <td className="py-3 px-4">
                {item.supplierName || item.supplierId || "-"}
              </td>
              <td className="py-3 px-4">{item.itemName || "-"}</td>
              <td className="py-3 px-4 whitespace-nowrap">
                {item.itemPurchaseDate || "-"}
              </td>
              <td className="py-3 px-4">
                {item.amount ? `Rs. ${item.amount}` : "-"}
              </td>
              <td className="py-3 px-4">{item.paymentType || "-"}</td>
              <td className="py-3 px-4">{item.remarks || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ExpenseTable({
  activeTab,
  data,
  onAddExpense,
  onView,
  onDelete,
}) {
  const isManager = activeTab === "manager";
  const [page, setPage] = useState(0);
  // rows are closed by default; expanded = { [expenseId]: true }
  const [expanded, setExpanded] = useState({});

  const sorted = useMemo(
    () =>
      [...data].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [data],
  );

  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const rows = sorted.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE,
  );

  const toggleRow = (row) => {
    setExpanded((p) => ({ ...p, [row.id]: !p[row.id] }));
  };

  const colCount = isManager ? 7 : 5;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-200 text-sm text-gray-600">
            <th className="py-3 px-2">
              {isManager ? "Manager Name" : "Name"}
            </th>
            {isManager && <th className="py-3 px-2">Role</th>}
            {isManager && <th className="py-3 px-2">Mobile</th>}
            <th className="py-3 px-2">Date</th>
            <th className="py-3 px-2">Amount</th>
            <th className="py-3 px-2">Payment Type</th>
            <th className="py-3 px-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row) => {
            const isOpen = !!expanded[row.id];

            return (
              <Fragment key={row.id}>
                <tr
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${row.bgColor} ${row.textColor} flex items-center justify-center font-semibold text-xs md:text-sm flex-shrink-0`}
                      >
                        {row.initials}
                      </div>
                      <span className="font-medium text-gray-900 text-sm md:text-base truncate">
                        {row.name}
                      </span>
                    </div>
                  </td>

                  {isManager && (
                    <td className="py-3 px-2 text-sm md:text-base">
                      {row.role}
                    </td>
                  )}
                  {isManager && (
                    <td className="py-3 px-2 text-sm md:text-base">
                      {row.mobile}
                    </td>
                  )}

                  <td className="py-3 px-2 text-sm md:text-base whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-3 px-2 font-medium text-sm md:text-base">
                    {row.amount}
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 md:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        row.paymentType === "Cash"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {row.paymentType}
                    </span>
                  </td>

                  <td className="py-3 px-2">
                    <div className="flex gap-2 items-center">
                      {isManager && (
                        <>
                          {/* <Eye
                            className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0"
                            onClick={() => onView(row)}
                          /> */}
                          <ChevronDown
                            aria-label="Toggle details"
                            className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                            onClick={() => toggleRow(row)}
                          />
                          <Plus
                            className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0"
                            onClick={() => onAddExpense(row.name, row.id)}
                          />
                        </>
                      )}
                      <Trash
                        className="w-4 h-4 md:w-5 md:h-5 text-gray-400 hover:text-red-600 cursor-pointer flex-shrink-0"
                        onClick={() => onDelete(row.id)}
                      />
                    </div>
                  </td>
                </tr>

                {isManager && isOpen && (
                  <tr className="bg-gray-50">
                    <td colSpan={colCount} className="p-4">
                      <ExpenseDetailsPanel items={row.items || []} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>

      {pageCount > 1 && (
        <div className="flex items-center justify-end gap-3 pt-4 text-sm text-gray-600">
          <button
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
            className="px-3 py-1 border rounded-md disabled:opacity-40"
          >
            Prev
          </button>
          <span>
            Page {safePage + 1} of {pageCount}
          </span>
          <button
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
            className="px-3 py-1 border rounded-md disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}