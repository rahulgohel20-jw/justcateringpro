import { useEffect, useState, useMemo } from "react";
import Swal from "sweetalert2";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import { AssignEventsToChild, GetEventMaster } from "@/services/apiServices";

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i); // e.g. 2025–2029

const AssignEventsModal = ({ isModalOpen, setIsModalOpen, members = [] }) => {
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [search, setSearch] = useState("");

  // API filters
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  // Client-side date range filter
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const Id = localStorage.getItem("userId");
  const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
  const isChildUser = authStorage?.state?.user?.ischilduser ?? false;
  const [paxPercentage, setPaxPercentage] = useState("");


  useEffect(() => {
    if (isModalOpen) fetchEvents();
  }, [isModalOpen, selectedMonth, selectedYear]);

 const fetchEvents = async () => {
  try {
    const month = selectedMonth ? selectedMonth : undefined;
    const year = selectedYear ? selectedYear : undefined;
    const res = await GetEventMaster(Id, isChildUser, month, year);
    const list = res?.data?.data?.["Event Details"] || [];
    setEvents(list);
  } catch (error) {
    setEvents([]);
  }
};

 
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.eventNo?.toLowerCase().includes(search.toLowerCase()) ||
        event.party?.nameEnglish?.toLowerCase().includes(search.toLowerCase()) ||
        event.eventType?.nameEnglish?.toLowerCase().includes(search.toLowerCase());

      
      let matchesDate = true;
      if (fromDate || toDate) {
        const rawDate = event.eventStartDateTime?.split(" ")[0]; // "DD/MM/YYYY"
        if (rawDate) {
          const [dd, mm, yyyy] = rawDate.split("/");
          const eventDate = new Date(`${yyyy}-${mm}-${dd}`);
          if (fromDate) matchesDate = matchesDate && eventDate >= new Date(fromDate);
          if (toDate) matchesDate = matchesDate && eventDate <= new Date(toDate);
        }
      }

      return matchesSearch && matchesDate;
    });
  }, [events, search, fromDate, toDate]);

  const handleSave = async () => {
    if (!selectedEvents.length) {
      Swal.fire({ icon: "error", title: "Validation Error", text: "Please select at least one event" });
      return;
    }
    try {
      setLoading(true);
      const payload = {
        childUserId: Number(Id),
        eventIds: selectedEvents.map((e) => Number(e.value)),
          paxPercentage: paxPercentage ? Number(paxPercentage) : undefined,

      
      };
      const res = await AssignEventsToChild(payload);
      if (res?.data?.success) {
        Swal.fire({ icon: "success", title: "Success", text: res?.data?.message || "Events assigned successfully" });
        setIsModalOpen(false);
        setSelectedEvents([]);
      } else {
        Swal.fire({ icon: "error", title: "Error", text: res?.data?.message || "Something went wrong" });
      }
    } catch (error) {
      Swal.fire({ icon: "error", title: "Error", text: error?.response?.data?.message || "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedMonth("");
    setSelectedYear(String(currentYear));
    setFromDate("");
    setToDate("");
    setSearch("");
    setPaxPercentage("");
  };

  return (
    <CustomModal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Assign Events"
      width="min(700px,95vw)"
      footer={[
        <div key="footer" className="flex justify-end gap-2">
          <button className="btn btn-light" onClick={() => setIsModalOpen(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? "Please wait..." : "Assign"}
          </button>
        </div>,
      ]}
    >
      <div className="flex flex-col gap-4">

        {/* Month / Year filters — changing either triggers API re-fetch */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="form-label text-xs">Month</label>
            <select
              className="select"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="form-label text-xs">Year</label>
            <select
              className="select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="">All Years</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date range filter — client-side, auto-filters via useMemo */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="form-label text-xs">From Date</label>
            <input
              type="date"
              className="input"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="form-label text-xs">To Date</label>
            <input
              type="date"
              className="input"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
  <label className="form-label text-xs">Pax Percentage</label>
  <input
    type="tel"
    className="input"
    placeholder="Enter pax percentage"
    min="0"
    max="100"
    value={paxPercentage}
    onChange={(e) => setPaxPercentage(e.target.value)}
  />
</div>

        {/* Search + Clear — search auto-filters via useMemo */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <i className="ki-filled ki-magnifier absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"></i>
            <input
              type="text"
              className="input pl-9"
              placeholder="Search event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            className="btn btn-light text-xs px-3"
            onClick={handleClearFilters}
          >
            Clear
          </button>
        </div>

        {/* Events List */}
        <div className="flex flex-col gap-1">
          <label className="form-label">
            Select Events
            {filteredEvents.length > 0 && (
              <span className="ml-2 text-xs text-gray-400">({filteredEvents.length} events)</span>
            )}
          </label>

          <div className="border rounded-lg max-h-[300px] overflow-y-auto p-2 flex flex-col gap-1">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const isChecked = selectedEvents.some((e) => e.value === event.id);
                return (
                  <label
                    key={event.id}
                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedEvents((prev) => [
                            ...prev,
                            { value: event.id, label: `${event.eventNo} - ${event.party?.nameEnglish}` },
                          ]);
                        } else {
                          setSelectedEvents((prev) => prev.filter((x) => x.value !== event.id));
                        }
                      }}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {event.eventNo} - {event.party?.nameEnglish}
                      </span>
                      <span className="text-xs text-gray-500">
                        {event.eventType?.nameEnglish} · {event.eventStartDateTime?.split(" ")[0]}
                      </span>
                    </div>
                  </label>
                );
              })
            ) : (
              <div className="text-center text-gray-500 py-4">No events found</div>
            )}
          </div>
        </div>

      </div>
    </CustomModal>
  );
};

export default AssignEventsModal;