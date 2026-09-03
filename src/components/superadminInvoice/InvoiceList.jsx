import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GetSuperalladmininvoice } from "@/services/apiServices";
import { FormattedMessage } from "react-intl";

export default function InvoiceList({
  onSelectInvoice,
  selectedId,
  startDate,
  endDate,
}) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedPlanId, setSelectedPlanId] = useState(-1); // default ALL

  const fetchInvoices = async (
    startDate = "",
    endDate = "",
    customerId,
    planId = selectedPlanId,
  ) => {
    setLoading(true);
    try {
      const response = await GetSuperalladmininvoice(
        startDate,
        endDate,
        planId,
        customerId || "",
      );
      const apiData = response?.data?.data;
      const list = Array.isArray(apiData?.invoices) ? apiData.invoices : [];

      const invoiceList = list.map((item) => ({
        id: item.invoiceId,
        Invoice:
          item.invoiceCode || `INV-${String(item.invoiceId).padStart(4, "0")}`,
        CustomerName: item.customerName || "-", // ← was billingName
        plan: item.taxType || "-",
        invoiceDate: item.invoiceDate || "-",
        dueDate: item.dueDate || "-",
        Amount: `₹ ${item.totalAmount?.toLocaleString("en-IN") || 0}`,
        SubTotal: `₹ ${item.totalUnpaidAmount?.toLocaleString("en-IN") || 0}`,
        Discount: `₹ ${item.discountAmount?.toLocaleString("en-IN") || 0}`,
        GST: `₹ ${item.gstAmount?.toLocaleString("en-IN") || 0}`,
        city: item.billingAddress || "-",
      }));

      setInvoices(invoiceList);

      if (invoiceList.length > 0) {
        const match = invoiceList.find(
          (inv) => String(inv.id) === String(selectedId),
        );
        if (!selectedId && onSelectInvoice) {
          onSelectInvoice(invoiceList[0].id);
        } else if (match && onSelectInvoice) {
          onSelectInvoice(match.id);
        }
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!startDate || !endDate) return;
    fetchInvoices(startDate, endDate);
  }, [startDate, endDate]);
  const handleEventClick = (id) => {
    if (onSelectInvoice) onSelectInvoice(id);
  };

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 w-full lg:w-80 lg:max-w-xs flex flex-col h-full overflow-hidden">
      {" "}
      {/* Header */}
      <div className="w-full mb-3 sm:mb-4 flex-shrink-0">
        {/* <select
          defaultValue="0"
          className="select pe-7.5 w-full text-xs sm:text-sm py-1.5 sm:py-2"
        >
          <option value="0">
            <FormattedMessage
              id="SALES.ALL_INVOICE"
              defaultMessage="All Invoices"
            />
          </option>
          <option value="1">
            <FormattedMessage
              id="SALES.LAST_3_MONTHS"
              defaultMessage="Last 3 Months"
            />
          </option>
          <option value="2">
            <FormattedMessage
              id="SALES.LAST_6_MONTHS"
              defaultMessage="Last 6 Months"
            />
          </option>
          <option value="3">
            <FormattedMessage
              id="SALES.CUSTOM_DATE"
              defaultMessage="Custom Date"
            />
          </option>
        </select> */}
      </div>
      {loading && (
        <p className="text-xs text-gray-400 text-center py-4 flex-shrink-0">
          Loading...
        </p>
      )}
      {!loading && invoices.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4 flex-shrink-0">
          No invoices found.
        </p>
      )}
      {!loading && invoices.length > 0 && (
        <div
          className="flex-1 overflow-y-auto pr-1 space-y-3
              scrollbar-track-transparent
              hover:scrollbar-thumb-gray-400"
        >
          {invoices.map((inv) => {
            const isActive = String(inv.id) === String(selectedId);
            return (
              <div
                key={inv.id}
                onClick={() => handleEventClick(inv.id)}
                className={`border rounded-2xl transition-all duration-200 cursor-pointer p-3 sm:p-4 w-full mt-3
                  ${
                    isActive
                      ? "bg-[#005BA8]/5 border-[#005BA8] shadow-md -translate-y-0.5 ring-1 ring-[#005BA8]/20"
                      : "bg-white border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  }`}
              >
                {/* Invoice code + tax type */}
                <div className="flex justify-between items-center mb-2 gap-2">
                  <span
                    className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap
                    ${
                      isActive
                        ? "bg-[#005BA8] text-white"
                        : "bg-[#005BA8]/10 text-[#005BA8]"
                    }`}
                  >
                    {inv.Invoice}
                  </span>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {inv.plan}
                  </span>
                </div>

                {/* Customer + city */}
                <p
                  className={`font-semibold text-sm truncate ${isActive ? "text-[#005BA8]" : "text-gray-900"}`}
                >
                  {inv.CustomerName}
                </p>
                <p className="text-[10px] text-gray-400 truncate mb-2">
                  {inv.city} • Due: {inv.dueDate}
                </p>

                {/* Amount row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-green-600 font-semibold">
                    {inv.Amount}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    remaing: {inv.SubTotal}
                  </span>
                </div>

                {/* ✅ Active indicator bar at bottom */}
                {isActive && (
                  <div className="mt-2 h-0.5 w-full bg-[#005BA8]/30 rounded-full" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
