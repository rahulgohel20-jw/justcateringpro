import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, XCircle, Sun, Sunset, Clock, X, Plus, MoreVertical } from "lucide-react";
import { OverAllAvailabilityCheck } from "@/services/apiServices";
import { useModuleAccess } from "../../../hooks/useModuleAccess";
import EventViewModal from "@/partials/modals/calendar-event/EventView";
import { useBanquetPermission } from "../../../hooks/useBanquetPermission";


const getSoftType = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth-storage"));
    return auth?.state?.user?.softType || "";
  } catch {
    return "";
  }
};

const DayAvailabilityModal = ({ isOpen, onClose, date, userId }) => {
  const { isHallAllowed } = useBanquetPermission();
  const navigate = useNavigate();
  const { hasModuleAccess } = useModuleAccess();
  const canAccessBanquet = hasModuleAccess("Banquet");
  const hideODC = getSoftType() === "justbanq";
  const [isEventViewOpen, setIsEventViewOpen] = useState(false);
const [eventViewData, setEventViewData] = useState(null);

  const [selectedHallId, setSelectedHallId] = useState(null);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(date);

const dateFormatted = currentDate ? dayjs(currentDate).format("DD/MM/YYYY") : "";
const dateDisplay = currentDate ? dayjs(currentDate).format("DD/MM/YYYY") : "";


useEffect(() => {
  if (isOpen) {
    setHalls([]);
    setSelectedHallId(null);
    setLoading(true);
  }
}, [isOpen]);

  useEffect(() => {
  setCurrentDate(date);
}, [date]);

  useEffect(() => {
  if (!isOpen || !currentDate || !canAccessBanquet) return;
  const timer = setTimeout(fetchData, 200); 
  return () => clearTimeout(timer);
}, [isOpen, currentDate]);

  const requestIdRef = useRef(0);

const fetchData = async () => {
  const requestId = ++requestIdRef.current; // stamp this call
  setLoading(true);
  try {
    const formatted = dayjs(currentDate).format("DD/MM/YYYY");
    const res = await OverAllAvailabilityCheck(userId, formatted, formatted);

    // stale response (a newer date was selected meanwhile) — ignore it
    if (requestId !== requestIdRef.current) return;

    const rawData = res?.data?.data || [];
    const dayEntry = rawData.find((d) => d.date === formatted) || rawData[0];
    const hallList = (dayEntry?.halls || []).filter((h) => isHallAllowed(h.hallId));

    setHalls(hallList);
    setSelectedHallId(hallList.length > 0 ? hallList[0].hallId : null);
  } catch (err) {
    if (requestId === requestIdRef.current) {
      console.error("DayAvailabilityModal fetch error:", err);
    }
  } finally {
    if (requestId === requestIdRef.current) {
      setLoading(false);
    }
  }
};

  const selectedHall = halls.find((h) => h.hallId === selectedHallId) || null;

  const getShiftIcon = (shiftName) => {
    const name = shiftName?.toUpperCase() || "";
    if (name.includes("MORNING")) return <Sun size={16} className="text-yellow-500" />;
    if (name.includes("EVENING")) return <Sunset size={16} className="text-orange-500" />;
    return <Clock size={16} className="text-blue-500" />;
  };

  const getBookingStatusLabel = (status) => {
  switch (status) {
    case 1:
      return { label: "Confirm Booked", badgeClass: "bg-green-600 text-white" };
    case 3:
      return { label: "Tentative Booked", badgeClass: "bg-orange-500 text-white" };
    default:
      return { label: "Booked", badgeClass: "bg-red-600 text-white" };
  }
};

  const handleBookSlot = (hall, shift) => {
    navigate("/add-event", {
      state: {
       event_date: dayjs(currentDate).toDate(),
        banquetHallId: hall.hallId,
        banquetHallName: hall.hallName,
        shiftId: shift.shiftId,
        shiftName: shift.shiftName,
        shiftStartTime: shift.startTime,
        shiftEndTime: shift.endTime,
      },
    });
    onClose();
  };

  // Collect all booked events for selected hall
 const bookedEvents = selectedHall?.shifts
  ?.filter((s) => !s.isAvailable && s.bookedByEventId)
  ?.map((s) => ({
    shiftName: s.shiftName,
    eventNo: s.bookedByEventNo,
    partyName: s.bookedByPartyName,
    eventId: s.bookedByEventId,
    startTime: s.startTime,
    endTime: s.endTime,
    status: s.status,
  })) || [];

const handleNavigateToEvent = (event) => {
 
  const fakeEventData = {
    event: {
      _def: {
        title: event.partyName || "",
        extendedProps: {
          eventid: Number(event.eventId),
          id: Number(event.eventId),
          mobile: "",
          address: "",
          event: event.shiftName || "",
          statusCode: null,
          eventTypeId: null,
          time: `${event.startTime} - ${event.endTime}`,
        },
      },
     start: currentDate ? new Date(dayjs(currentDate).toDate()) : new Date(),
    },
  };

  setEventViewData(fakeEventData);
  setIsEventViewOpen(true);
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden"
        style={{ width: "92vw", maxWidth: "1200px", maxHeight: "88vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sun size={18} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-800">View Event Details</h3>
              <p className="text-xs text-gray-500">Manage Rights. Maintain Security.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            
<input
  type="date"
  className="input text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 bg-white"
  value={currentDate ? dayjs(currentDate).format("YYYY-MM-DD") : ""}
 onChange={(e) => {
  if (!e.target.value) return;
  setLoading(true);      
  setSelectedHallId(null);
  setHalls([]);
  setCurrentDate(new Date(e.target.value)); 
}}
/>
            {/* New Inquiry button */}
            <button
              onClick={() => {
                navigate("/add-event", {
                  state: { event_date: dayjs(currentDate).toDate() },

                });
                onClose();
              }}
              className="btn btn-primary w-full text-xs px-4 py-2 flex items-center gap-1.5 rounded-lg"
            >
              <Plus size={14} />
              New Inquiry
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left: Hall List ── */}
          {/* ── Left: Hall List ── */}
{canAccessBanquet && (
  <div className="w-[180px] flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-gray-50">
    {/* Outdoor option */}
    {!hideODC && (
      <button
        onClick={() => setSelectedHallId("ODC")}
        className={`w-full text-left px-4 py-3 text-sm font-medium border-b border-gray-100 transition
          ${selectedHallId === "ODC" ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"}`}
      >
        Outdoor
      </button>
    )}

    {loading ? (
      <div className="flex items-center justify-center py-8">
        <i className="ki-filled ki-loading animate-spin text-primary text-xl"></i>
      </div>
    ) : (
      halls.map((hall) => (
        <button
          key={hall.hallId}
          onClick={() => setSelectedHallId(hall.hallId)}
          className={`w-full text-left px-4 py-3 text-sm border-b border-gray-100 transition
            ${selectedHallId === hall.hallId
              ? "bg-blue-50 text-primary font-semibold border-l-2 border-l-primary"
              : "text-gray-600 hover:bg-gray-100 font-normal"}`}
        >
          {hall.hallName}
        </button>
      ))
    )}
  </div>
)}

          {/* ── Right: Content ── */}
          <div className="flex-1 overflow-y-auto flex flex-col">
            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <i className="ki-filled ki-loading animate-spin text-primary text-3xl"></i>
              </div>
            ) : selectedHallId === "ODC" && !hideODC  ? (
              /* ODC / Outdoor view */
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3 p-8">
                <Sun size={40} className="text-gray-300" />
                <p className="text-sm">Outdoor / ODC events have no shift restrictions.</p>
                <button
                  onClick={() => {
                    navigate("/add-event", {
                     state: { event_date: dayjs(currentDate).toDate() },
                    });
                    onClose();
                  }}
                  className="btn btn-primary text-sm px-5 py-2 mt-2 flex items-center gap-2"
                >
                  <Plus size={14} />
                  Create Event
                </button>
              </div>
            ) : selectedHall ? (
              <div className="flex flex-col gap-0">
                {/* Shift Cards */}
               {/* Shift Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 border-b border-gray-100">
  {selectedHall.shifts.map((shift) => {
    // A shift can be unavailable for two different reasons:
    // 1) It's directly booked (has a bookedByEventId) — show who booked it.
    // 2) It's blocked only because it overlaps another booked shift on the
    //    same day (no bookedByEventId) — don't attribute it to that party.
    const isDirectlyBooked = !shift.isAvailable && shift.bookedByEventId;
    const isBlockedByOverlap = !shift.isAvailable && !shift.bookedByEventId;
    const statusInfo = getBookingStatusLabel(shift.status);

    return (
      <div
        key={shift.shiftId}
        className={`rounded-xl border p-4 flex flex-col gap-2.5
          ${shift.isAvailable
            ? "border-green-200 bg-green-50"
            : shift.status === 3
              ? "border-orange-200 bg-orange-50"
              : "border-red-200 bg-red-50"}`}
      >
        {/* Header row: icon+name on the left, badge on its own line if needed */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {getShiftIcon(shift.shiftName)}
            <span
              className="text-sm font-bold text-gray-800 truncate"
              title={shift.shiftName}
            >
              {shift.shiftName}
            </span>
          </div>
          <span
            className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap
              ${shift.isAvailable
                ? "bg-green-600 text-white"
                : statusInfo.badgeClass}`}
          >
            {shift.isAvailable ? "Available" : statusInfo.label}
          </span>
        </div>

        <p className="text-xs text-gray-500">
          {shift.startTime} - {shift.endTime}
        </p>

        {shift.isAvailable ? (
          <button
            onClick={() => handleBookSlot(selectedHall, shift)}
            className="mt-1 w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-1.5 rounded-lg transition"
          >
            <CheckCircle2 size={13} />
            Book Slot
          </button>
        ) : isDirectlyBooked ? (
          <div
            className={`mt-1 flex items-center gap-1.5 text-xs ${
              shift.status === 3 ? "text-orange-600" : "text-red-600"
            }`}
            title={`${shift.bookedByPartyName} — ${statusInfo.label}`}
          >
            <XCircle size={13} className="shrink-0" />
            <span className="truncate">
              {shift.bookedByPartyName}
            </span>
          </div>
        ) : (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <XCircle size={13} className="shrink-0" />
            <span>Blocked — overlaps another booking</span>
          </div>
        )}
      </div>
    );
  })}
</div>

                {/* Booked Events Table */}
                <div className="flex-1 px-4 py-3">
                  {bookedEvents.length > 0 ? (
                    <>
                      <table className="w-full text-sm">
  <thead>
    <tr className="border-b border-gray-200">
      <th className="text-left text-xs font-bold text-gray-500 uppercase pb-2 w-8">#</th>
      <th className="text-left text-xs font-bold text-gray-500 uppercase pb-2">Account Name</th>
      <th className="text-left text-xs font-bold text-gray-500 uppercase pb-2">Date</th>
      <th className="text-left text-xs font-bold text-gray-500 uppercase pb-2">Time</th>
      <th className="text-left text-xs font-bold text-gray-500 uppercase pb-2">Hall</th>
      <th className="text-left text-xs font-bold text-gray-500 uppercase pb-2">Status</th>
      <th className="text-right text-xs font-bold text-gray-500 uppercase pb-2">Action</th>
    </tr>
  </thead>
  <tbody>
    {bookedEvents.map((event, idx) => (
      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-3 text-xs text-gray-500">{idx + 1}.</td>
        <td className="py-3 text-sm font-medium text-gray-800 max-w-[180px]">
  <div className="truncate" title={event.partyName}>
    {event.partyName}
    {event.eventNo && (
      <span className="ml-1 text-xs text-gray-400">({event.eventNo})</span>
    )}
  </div>
</td>
        <td className="py-3 text-xs text-gray-600">{dateDisplay}</td>
        <td className="py-3 text-xs text-gray-600">{event.shiftName}</td>
        <td className="py-3 text-xs text-gray-600">{selectedHall.hallName}</td>
        <td className="py-3 text-xs">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              getBookingStatusLabel(event.status).badgeClass
            }`}
          >
            {getBookingStatusLabel(event.status).label}
          </span>
        </td>
        <td className="py-3 text-right">
          <button
            onClick={() => handleNavigateToEvent({
              eventId: event.eventId,
              partyName: event.partyName,
              shiftName: event.shiftName,
              startTime: event.startTime,
              endTime: event.endTime,
            })}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 ml-auto"
            title="View Event"
          >
            <MoreVertical size={14} />
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>

                      <p className="text-xs text-gray-400 mt-3">
                        Showing 1 to {bookedEvents.length} of {bookedEvents.length} results.
                      </p>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400 gap-2">
                      <CheckCircle2 size={32} className="text-green-300" />
                      <p className="text-sm">No bookings for this hall on this date.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <p className="text-sm">Select a hall to view availability.</p>
              </div>
            )}
          </div>
        </div>
      </div>
     {isEventViewOpen && (
  <EventViewModal
    isModalOpen={isEventViewOpen}
    setIsModalOpen={(val) => {
      setIsEventViewOpen(val);
      if (!val) fetchData();
    }}
    eventData={eventViewData}
    onEventsUpdated={fetchData}
  />
)}
    </div>
  );
};

export default DayAvailabilityModal;