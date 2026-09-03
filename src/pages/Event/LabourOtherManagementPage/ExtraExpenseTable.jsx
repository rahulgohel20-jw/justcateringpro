import { useState } from "react";
import { toAbsoluteUrl } from "@/utils";

const ExtraExpenseTable = ({ data, onEdit, onDelete, onAddExpense }) => {
  return (
    <div className="card">
      <div className="card-body p-0">
        <div className="overflow-x-auto">
          <div className="flex justify-between items-center px-4 mt-4 mb-3">
            <h5 className="font-semibold">Extra Expenses</h5>
            <button
              className="bg-primary text-white text-sm px-4 py-2 rounded-lg"
              onClick={onAddExpense}
            >
              + Add Extra Expense
            </button>
          </div>
          <table className="table table-auto w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-center w-[4%]">#</th>
                <th className="px-3 py-2 w-[20%]">Expense Type</th>
                <th className="px-3 py-2 w-[10%]">Qty</th>
                <th className="px-3 py-2 w-[10%]">Rate</th>
                <th className="px-3 py-2 w-[10%]">Total</th>
                <th className="px-3 py-2 w-[15%]">Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(data) && data.length > 0 ? (
                data.map((row, index) => (
                  <ExtraExpenseRow
                    key={row.id}
                    row={row}
                    index={index}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="relative py-10">
                    {/* Absolute Image */}
                    <img
                      src={toAbsoluteUrl(
                        "/media/illustrations/nodatafound.png"
                      )} // replace with your image path
                      alt="No Data"
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20 max-h-[120px] dark:hidden"
                    />
                    {/* Text */}
                    <span className="relative z-10 text-gray-500 block text-center">
                      No extra expenses found.
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ExtraExpenseRow = ({ row, index, onEdit, onDelete }) => {
  return (
    <tr key={row.id}>
      <td className="text-center">{index + 1}</td>
      <td>{row.name}</td>
      <td>{row.qty}</td>
      <td>{row.rate}</td>
      <td>{row.total}</td>
      <td className="flex gap-1">
        <button onClick={() => onEdit(row)}>
          <i className="ki-filled ki-notepad-edit text-primary text-lg"></i>
        </button>
        <button onClick={() => onDelete(row.id)}>
          <i className="ki-filled ki-trash text-danger text-lg"></i>
        </button>
      </td>
    </tr>
  );
};

export default ExtraExpenseTable;
