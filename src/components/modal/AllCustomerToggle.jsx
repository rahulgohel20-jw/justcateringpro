import { useState, useEffect } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { GetEventMaster } from "@/services/apiServices";

const AllCustomerToogle = ({ isModalOpen, setIsModalOpen, onEventSelect }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
  const isChildUser = authStorage?.state?.user?.ischilduser ?? false;

  const getEventColor = (status, isRMenu) => {
    if (isRMenu === true && status === 1) return "#E75480";
    switch (status) {
      case 0:
        return "#17A2B8";
      case 1:
        return "#28A745";
      case 2:
        return "#BF2225";
      default:
        return "#005BA8";
    }
  };

  // Converts any date string to "dd/mm/yyyy" for display & search
  const formatDateToDDMMYYYY = (dateStr) => {
    if (!dateStr || dateStr === "-") return "-";
    const date = new Date(dateStr);
    if (isNaN(date)) return dateStr;
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yyyy = date.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  useEffect(() => {
    if (!isModalOpen) return;

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await GetEventMaster(localStorage.getItem("userId"), isChildUser);
        const events = response.data.data["Event Details"];
        const formattedEvents = events.map((event) => ({
          id: event.id,
          name: event.party.nameEnglish || "-",
          code: event.eventNo || "-",
          date: formatDateToDDMMYYYY(event.eventStartDateTime) || "-",
          type: event.eventType.nameEnglish || "-",
          status: event.status || "-",
          isRMenu: event.isRMenu || "-",
          color: getEventColor(event.status, event.isRMenu),
        }));
        setEvents(formattedEvents);
      } catch (error) {
        console.error("Failed to fetch events", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [isModalOpen]);

  const filteredEvents = events.filter((event) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const dateOnly = event.date?.split(" ")[0]?.toLowerCase() || "";

    return (
      event.name?.toLowerCase().includes(query) ||
      event.type?.toLowerCase().includes(query) ||
      event.code?.toLowerCase().includes(query) ||
      dateOnly.includes(query)
    );
  });

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title="Events"
        width={800}
        footer={[]}
      >
        <div className="w-full">
          {/* Search Input */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search by name, code, type or date (dd/mm/yyyy)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
            />
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <div className="w-8 h-8 border-[3px] border-gray-200 border-t-primary rounded-full animate-spin" />
              <span className="text-sm text-gray-500">Loading events...</span>
            </div>
          )}

          {/* Events List */}
          {!loading && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => onEventSelect(event.id)}
                  className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  {/* Color Circle */}
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-lg"
                    style={{ backgroundColor: event.color }}
                  >
                    {event.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 text-base">
                      {event.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {event.code} - {event.date} - {event.type}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && filteredEvents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No events found
            </div>
          )}
        </div>
      </CustomModal>
    )
  );
};

export default AllCustomerToogle;