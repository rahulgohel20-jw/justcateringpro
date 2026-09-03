import { GeteventQuoataiondata } from "@/services/apiServices";
import { useState, useEffect } from "react";
import { FormattedMessage } from "react-intl";
import { useParams } from "react-router-dom";

export default function QuotationList({ onEventSelect }) {
  const [eventData, setEventData] = useState([]);
  const { PartyId } = useParams();
  const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
  const isChildUser = authStorage?.state?.user?.ischilduser ?? false;

  const fetchEventData = async () => {
    try {
      const response = await GeteventQuoataiondata(PartyId, isChildUser);

      const eventList =
        response?.data?.data["Event Details"]?.map((event) => ({
          eventId: event?.id || "-",
          EventNo: event?.eventNo || "-",
          date: event?.eventStartDateTime || "-",
          name: event?.party?.nameEnglish || "-",
          Event: event?.eventType?.nameEnglish || "-",
          Venue: event?.venue.nameEnglish || "-",
        })) || [];

      setEventData(eventList);
    } catch (error) {
      console.error("Error fetching event data:", error);
      setEventData([]);
    }
  };

  useEffect(() => {
    if (PartyId) {
      fetchEventData();
    }
  }, [PartyId]);

  const handleEventClick = (eventId) => {
    if (onEventSelect) {
      onEventSelect(eventId);
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
              id="SALES.ALL_QUOTATION"
              defaultMessage="All Quotations"
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
          {eventData.map((inv) => (
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
