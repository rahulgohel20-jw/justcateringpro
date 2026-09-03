import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { OverAllAvailabilityCheck, GetAllBanquet } from "@/services/apiServices";
import { useNavigate } from "react-router-dom";
import { CheckCircleFilled, RightCircleFilled } from "@ant-design/icons";
import { Ban, CheckCircle, CheckCircle2, CirclePlus, CrossIcon, XCircle } from "lucide-react";
import { useBanquetPermission } from "../../../hooks/useBanquetPermission";
import { FormattedMessage, useIntl } from "react-intl";

const AvailabilityModal = ({ isOpen, onClose, userId }) => {
  const intl = useIntl();
  const getBookingStatusInfo = (status, intl) => {
  if (status === 3) {
    return {
      label: intl.formatMessage({
        id: "USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_TENTATIVE_BOOKED",
        defaultMessage: "Tentative Booked",
      }),
      bgClass: "bg-orange-400",
    };
  }
  if (status === 1) {
    return {
      label: intl.formatMessage({
        id: "USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_CONFIRM_BOOKED",
        defaultMessage: "Confirm Booked",
      }),
      bgClass: "bg-red-400",
    };
  }
  return {
    label: intl.formatMessage({
      id: "USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_BOOKED",
      defaultMessage: "Booked",
    }),
    bgClass: "bg-gray-400",
  };
};

  const { isHallAllowed } = useBanquetPermission();
  const now = new Date();
  const todayStr = dayjs().format("YYYY-MM-DD");
  const [selectedMonth, setSelectedMonth] = useState(
  `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
);
  const [startDate, setStartDate] = useState(todayStr);  
const [endDate, setEndDate] = useState(todayStr);       
  const [banquetList, setBanquetList] = useState([]);
  const [availabilityData, setAvailabilityData] = useState({});
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();
  const [searchBanquet, setSearchBanquet] = useState("");


useEffect(() => {
  if (!selectedMonth) return;
  const [year, month] = selectedMonth.split("-");
  const first = dayjs(`${year}-${month}-01`);
  const last = first.endOf("month");
  setStartDate(first.format("YYYY-MM-DD"));
  setEndDate(last.format("YYYY-MM-DD"));
  setChecked(false);
  setAvailabilityData({});
}, [selectedMonth]);

  useEffect(() => {
  if (isOpen && startDate && endDate && userId) {
    handleCheck();
  }
}, [isOpen]);
  
useEffect(() => {
  if (isOpen && userId) {
    setStartDate(todayStr);
    setEndDate(todayStr);
  }
}, [isOpen]);

const filteredBanquets = banquetList.filter((b) =>
  b.label.toLowerCase().includes(searchBanquet.toLowerCase())
);


  const handleSlotClick = (banquet, shift, date) => {
  if (!shift.isAvailable) return; 
  navigate("/add-event", {
    state: {
      event_date: date.toDate(),
      banquetHallId: banquet.id,
      banquetHallName: banquet.label,
      shiftId: shift.shiftId,
      shiftName: shift.shiftName,
      shiftStartTime: shift.startTime,
      shiftEndTime: shift.endTime,
    },
  });
  onClose();
};

const handleCheck = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    setChecked(false);

    try {
      const formattedStart = dayjs(startDate).format("DD/MM/YYYY");
      const formattedEnd = dayjs(endDate).format("DD/MM/YYYY");

      const res = await OverAllAvailabilityCheck(userId, formattedEnd, formattedStart);
      const rawData = res?.data?.data || [];

      const result = {};
      const banquetMap = new Map();

      rawData.forEach((dayEntry) => {
        const dateKey = dayEntry.date;

        dayEntry.halls.forEach((hall) => {
          const hallId = hall.hallId;

          if (!isHallAllowed(hallId)) return; // ← skip disallowed halls

          if (!banquetMap.has(hallId)) {
            banquetMap.set(hallId, hall.hallName);
          }

          if (!result[hallId]) result[hallId] = {};
          result[hallId][dateKey] = hall.shifts;
        });
      });

      const banquetsFromResponse = Array.from(banquetMap.entries()).map(
        ([id, label]) => ({ id, label })
      );
      setBanquetList(banquetsFromResponse);

      setAvailabilityData(result);
      setChecked(true);
    } catch (err) {
      console.error("Availability check error:", err);
    } finally {
      setLoading(false);
    }
  };

  const dateColumns = (() => {
    if (!startDate || !endDate) return [];
    const cols = [];
    let cur = dayjs(startDate);
    const end = dayjs(endDate);
    while (cur.isBefore(end) || cur.isSame(end, "day")) {
      cols.push(cur);
      cur = cur.add(1, "day");
    }
    return cols;
  })();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden"
        style={{ width: "96vw", maxWidth: "1400px", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-800">
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_TITLE"
                defaultMessage="Banquet Availability"
              />
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_SUBTITLE"
                defaultMessage="Check shift-wise availability across all banquet halls"
              />
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500"
          >
            <i className="ki-filled ki-cross text-sm"></i>
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-end gap-4 px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_MONTH_LABEL"
                defaultMessage="Month"
              />
            </label>
            <input
              type="month"
              className="input w-[180px] text-sm"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
    <FormattedMessage
      id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_START_DATE_LABEL"
      defaultMessage="Start Date"
    />
  </label>
  <input
    type="date"
    className="input w-[160px] text-sm"
    value={startDate}
    onChange={(e) => {
      setStartDate(e.target.value);
      setEndDate(e.target.value); 
      setChecked(false);
    }}
  />
</div>

<div className="flex flex-col gap-1">
  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
    <FormattedMessage
      id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_END_DATE_LABEL"
      defaultMessage="End Date"
    />
  </label>
  <input
    type="date"
    className="input w-[160px] text-sm"
    value={endDate}   
    min={startDate}
    onChange={(e) => {
      setEndDate(e.target.value);
      setChecked(false);
    }}
  />
</div>

          <button
            onClick={handleCheck}
            disabled={loading || !startDate || !endDate}
            className="btn btn-primary px-6 py-2 text-sm flex items-center gap-2"
          >
            {loading ? (
              <>
                <i className="ki-filled ki-loading animate-spin"></i>
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_CHECKING"
                  defaultMessage="Checking..."
                />
              </>
            ) : (
              <>
                <i className="ki-filled ki-calendar-tick"></i>
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_CHECK_AVAILABILITY_BUTTON"
                  defaultMessage="Check Availability"
                />
              </>
            )}
          </button>

          {checked && !loading && banquetList.length > 0 && (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
      <FormattedMessage
        id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_SEARCH_LABEL"
        defaultMessage="Search Banquet"
      />
    </label>
    <div className="relative">
      <i className="ki-filled ki-magnifier absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"></i>
      <input
        type="text"
        className="input pl-8 w-[200px] text-sm"
        placeholder={intl.formatMessage({
          id: "USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_SEARCH_PLACEHOLDER",
          defaultMessage: "Search banquet...",
        })}
        value={searchBanquet}
        onChange={(e) => setSearchBanquet(e.target.value)}
      />
      {searchBanquet && (
        <button
          onClick={() => setSearchBanquet("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <i className="ki-filled ki-cross text-xs"></i>
        </button>
      )}
    </div>
  </div>
)}

          {checked && (
  <div className="flex items-center gap-3 ml-auto flex-wrap">
    <div className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
      <span className="text-xs text-gray-600">
        <FormattedMessage
          id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_AVAILABLE"
          defaultMessage="Available"
        />
      </span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
      <span className="text-xs text-gray-600">
        <FormattedMessage
          id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_CONFIRM_BOOKED"
          defaultMessage="Confirm Booked"
        />
      </span>
    </div>
    <div className="flex items-center gap-1.5">
      <span className="w-3 h-3 rounded-full bg-orange-400 inline-block"></span>
      <span className="text-xs text-gray-600">
        <FormattedMessage
          id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_TENTATIVE_BOOKED"
          defaultMessage="Tentative Booked"
        />
      </span>
    </div>
  </div>
)}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto px-4 py-4">
          {!checked && !loading && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-3">
              <i className="ki-filled ki-calendar text-5xl"></i>
              <p className="text-sm">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_SELECT_PROMPT"
                  defaultMessage='Select a month and click "Check Availability"'
                />
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <i className="ki-filled ki-loading animate-spin text-4xl text-primary"></i>
              <p className="text-sm text-gray-400">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_FETCHING"
                  defaultMessage="Fetching availability data..."
                />
              </p>
            </div>
          )}

          {checked && !loading && banquetList.length === 0 && (
            <div className="flex flex-col items-center justify-center h-48 text-gray-400">
              <p className="text-sm">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_NO_HALLS"
                  defaultMessage="No banquet halls found."
                />
              </p>
            </div>
          )}

          {checked && !loading && banquetList.length > 0 && (
            <div className="space-y-6">
             {filteredBanquets.length === 0 ? (
  <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-2">
    <i className="ki-filled ki-magnifier text-4xl"></i>
    <p className="text-sm">
      <FormattedMessage
        id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_NO_BANQUET_FOUND"
        defaultMessage='No banquet found for "{search}"'
        values={{ search: <span className="font-medium">{searchBanquet}</span> }}
      />
    </p>
    <button onClick={() => setSearchBanquet("")} className="text-xs text-primary underline">
      <FormattedMessage
        id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_CLEAR_SEARCH"
        defaultMessage="Clear search"
      />
    </button>
  </div>
) : filteredBanquets.map((banquet) => {
                const banquetData = availabilityData[banquet.id] || {};

                // Collect all unique shifts across dates
                const allShifts = [];
                const shiftSeen = new Set();
                dateColumns.forEach((date) => {
                  const dateKey = date.format("DD/MM/YYYY");
                  (banquetData[dateKey] || []).forEach((s) => {
                    if (!shiftSeen.has(s.shiftId)) {
                      shiftSeen.add(s.shiftId);
                      allShifts.push(s);
                    }
                  });
                });

                return (
                  <div
                    key={banquet.id}
                    className="border border-gray-200 rounded-xl overflow-hidden shadow-sm"
                  >
                    {/* Banquet Header */}
                    <div className="bg-primary px-4 py-2.5 flex items-center gap-2">
                      <i className="ki-filled ki-home-3 text-white text-sm"></i>
                      <span className="text-sm font-bold text-white">
                        {banquet.label}
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="text-xs border-collapse min-w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="sticky left-0 z-10 bg-gray-100 border border-gray-200 px-3 py-2 text-left font-bold text-gray-700 min-w-[120px]">
                              <FormattedMessage
                                id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_SHIFT_LABEL"
                                defaultMessage="Shift"
                              />
                            </th>
                            {dateColumns.map((date) => {
                              const isToday = date.isSame(dayjs(), "day");
                              const isWeekend =
                                date.day() === 0 || date.day() === 6;
                              return (
                                <th
                                  key={date.format("YYYY-MM-DD")}
                                  className={`border border-gray-200 px-2 py-2 text-center font-semibold min-w-[68px]
                                    ${isToday ? "bg-blue-100 text-blue-700" : isWeekend ? "bg-orange-50 text-orange-600" : "text-gray-700"}`}
                                >
                                  <div>{date.format("DD")}</div>
                                  <div className="text-[10px] font-normal">
                                    {date.format("ddd")}
                                  </div>
                                </th>
                              );
                            })}
                          </tr>
                        </thead>

                        <tbody>
                          {allShifts.length === 0 ? (
                            <tr>
                              <td
                                colSpan={dateColumns.length + 1}
                                className="text-center text-gray-400 py-6 border border-gray-200"
                              >
                                <FormattedMessage
                                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_NO_SHIFT_DATA"
                                  defaultMessage="No shift data available"
                                />
                              </td>
                            </tr>
                          ) : (
                            allShifts.map((shift) => (
                              <tr key={shift.shiftId} className="hover:bg-gray-50">
                                {/* Shift Label */}
                                <td className="sticky left-0 z-10 bg-white border border-gray-200 px-3 py-2 font-medium text-gray-700 whitespace-nowrap">
                                  <div className="font-semibold">
                                    {shift.shiftName}
                                  </div>
                                  <div className="text-[10px] text-gray-400">
                                    {shift.startTime} – {shift.endTime}
                                  </div>
                                </td>

                                {/* Per-day cells */}
                               {dateColumns.map((date) => {
  const dateKey = date.format("DD/MM/YYYY");
  const shifts = banquetData[dateKey] || [];
  const match = shifts.find((s) => s.shiftId === shift.shiftId);
  const isAvailable = match?.isAvailable ?? true;

  return (
    <td
      key={date.format("YYYY-MM-DD")}
      className="border border-gray-200 px-2 py-2 text-center"
    >
      {match ? (
  isAvailable ? (
    <button
      onClick={() => handleSlotClick(banquet, { ...shift, isAvailable }, date)}
      className="inline-flex flex-col items-center justify-center w-full gap-0.5 group"
      title={intl.formatMessage(
        {
          id: "USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_BOOK_TOOLTIP",
          defaultMessage: "Book: {hall} · {shift} · {date}",
        },
        {
          hall: banquet.label,
          shift: shift.shiftName,
          date: date.format("DD MMM YYYY"),
        }
      )}
    >
      <span className="inline-flex items-center justify-center rounded-full bg-green-600 text-white font-bold group-hover:bg-green-700 transition">
        <CirclePlus size={24} />
      </span>
      <span className="text-green-700 text-xs">
        Available
      </span>
      {/* <span className="text-[9px] text-green-700 font-medium opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
        <FormattedMessage
          id="USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_BOOK_LABEL"
          defaultMessage="Book"
        />
      </span> */}
    </button>
  ) : (
  // ── Booked — not clickable, color/label depends on status ──
  (() => {
    const statusInfo = getBookingStatusInfo(match.status, intl);
    return (
      <span
        className="inline-flex flex-col items-center justify-center w-full gap-0.5 cursor-not-allowed"
        title={
          match.bookedByPartyName
            ? intl.formatMessage(
                {
                  id: "USER.DASHBOARD.DASHBOARD_CALENDAR_AVAILABILITY_BOOKED_BY",
                  defaultMessage: "{status} by: {party} ({eventNo})",
                },
                {
                  status: statusInfo.label,
                  party: match.bookedByPartyName,
                  eventNo: match.bookedByEventNo,
                }
              )
            : statusInfo.label
        }
      >
        <span
          className={`inline-flex items-center justify-center rounded-full ${statusInfo.bgClass} text-white font-bold`}
        >
          <Ban size={24} />
        </span>
        <span className="text-xs text-gray-700 font-medium whitespace-nowrap">
          {statusInfo.label}
        </span>
      </span>
    );
  })()
)
) : (
  <span className="text-gray-300">—</span>
)}    </td>
  );
})}
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;