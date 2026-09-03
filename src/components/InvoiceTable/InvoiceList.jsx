import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { GeteventInvoicedata } from "@/services/apiServices";
import { FormattedMessage } from "react-intl";

export default function InvoiceList({ onSelectInvoice }) {
  const [invoices, setInvoices] = useState([]);
  const { PartyId } = useParams();

  const fetchInvoices = async () => {
    try {
      const response = await GeteventInvoicedata(PartyId);

      const invoiceList =
        response?.data?.data?.["Event Details"]?.map((event) => ({
          eventId: event?.id || "-",
          EventNo: event?.eventNo || "-",
          date: event?.eventStartDateTime || "-",
          name: event?.party?.nameEnglish || "-",
          Event: event?.eventType?.nameEnglish || "-",
          Venue: event?.venue?.nameEnglish || "-",
        })) || [];

      setInvoices(invoiceList);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoices([]);
    }
  };

  useEffect(() => {
    if (PartyId) {
      fetchInvoices();
    }
  }, [PartyId]);

  const handleEventClick = (eventId) => {
    if (onSelectInvoice) {
      onSelectInvoice(eventId);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-3 sm:p-4 w-full lg:w-80 lg:max-w-xs">
      {/* Header */}
      <div className="w-full mb-3 sm:mb-4 lg:mb-6">
        <select
          defaultValue="All Invoice"
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
        </select>
      </div>

      {/* Invoice Items - Fixed width container with horizontal scroll */}
      <div className="w-full max-w-[450px] lg:max-w-none overflow-hidden">
        <div className="flex lg:flex-col gap-3 sm:gap-4 overflow-x-auto lg:overflow-x-visible pb-3 lg:pb-0 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500">
          {invoices.map((inv) => (
            <div
              key={inv.eventId}
              onClick={() => handleEventClick(inv.eventId)}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer p-3 sm:p-4 flex-shrink-0 w-[260px] lg:w-full"
            >
              <div className="flex justify-between items-center mb-2 gap-2">
                <span className="text-[10px] sm:text-xs font-semibold bg-[#005BA8]/10 text-[#005BA8] px-2 sm:px-3 py-1 rounded-full uppercase tracking-wide whitespace-nowrap">
                  {inv.Event}
                </span>
              </div>

              <div className="flex justify-between items-end">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {inv.name}
                  </p>
                  <span className="text-xs sm:text-sm text-gray-500 block truncate">
                    {inv.date}
                  </span>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1 truncate">
                    {inv.EventNo} • {inv.Venue}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
