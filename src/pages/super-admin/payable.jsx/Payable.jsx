import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { TableComponent } from "@/components/table/TableComponent";
import { payableColumns } from "./constant";
import { CheckCircle2, Clock3 } from "lucide-react";
import { getreceivablepayable } from "@/services/apiServices";

export default function SuperPayable() {
  const [tableData, setTableData] = useState([]);
  const [summary, setSummary] = useState({
    totalAmount: 0,
    paidAmount: 0,
    unpaidAmount: 0,
  });
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
       
        const response = await getreceivablepayable(userId, "", "", "PAYMENT");

        

      
        const payload = response?.data?.data ?? {};
        const block = payload["Payment"] ?? {};
        const months = Array.isArray(block.months) ? block.months : [];

        const mapped = months.map((item) => {
          const expense = item.totalAmount || 0;
          const paid = item.paidAmount || 0;
          const pending = item.pendingAmount ?? Math.max(expense - paid, 0);

          return {
            month: item.month,
            expense: `₹${expense.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
            paid: `₹${paid.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
            pending: `₹${Math.max(pending, 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
            status: item.status || "PENDING",
          };
        });

        setTableData(mapped);
        setSummary({
          totalAmount: block.totalAmount ?? 0,
          paidAmount: block.paidAmount ?? 0,
          unpaidAmount: block.unpaidAmount ?? 0,
        });
      } catch (error) {
        console.error("Failed to fetch payable data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fmt = (n) =>
    "₹" +
    Number(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const paidPercent =
    summary.totalAmount > 0
      ? Math.round((summary.paidAmount / summary.totalAmount) * 100)
      : 0;

  return (
    <div className="p-6 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl text-black font-bold">Payable Overview</h1>
      </div>

      {/* Top Summary Cards — 6 cards matching API fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Invoice Amount */}
        <div className="rounded-2xl bg-primary text-white shadow-lg p-4">
          <CheckCircle2 className="text-white mb-3" />
          <p className="text-sm opacity-80">TOTAL PAYABLE AMOUNT</p>
          <h2 className="text-2xl font-bold mt-2">
            {fmt(summary.totalAmount)}
          </h2>
        </div>

        {/* Total Paid Amount */}
        <div className="rounded-2xl shadow-sm border p-4 bg-white">
          <CheckCircle2 className="text-green-600 mb-3" />
          <p className="text-sm ">Total Paid Amount</p>
          <h3 className="text-2xl font-bold">{fmt(summary.paidAmount)}</h3>
        </div>

        {/* Total Pending Amount */}
        <div className="rounded-2xl shadow-sm border p-4 bg-white">
          <Clock3 className="text-amber-600 mb-3" />
          <p className="text-sm">Total Pending Amount</p>
          <h3 className="text-2xl font-bold">{fmt(summary.unpaidAmount)}</h3>
        </div>
      </div>
      {/* Table */}
      <div className="rounded-2xl shadow-sm border bg-white mb-6">
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-lg">Payment Schedule</h2>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500 py-4 text-center">
              Loading...
            </p>
          ) : tableData.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">
              No payable data found.
            </p>
          ) : (
            <TableComponent
              columns={payableColumns}
              data={tableData}
              hidePagination
            />
          )}
        </div>
      </div>
    </div>
  );
}
