import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import CalendarComponent from "@/components/CalendarComponent";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import EventViewModal from "@/partials/modals/calendar-event/EventView";
import { useNavigate } from "react-router-dom";
import { GetEventMaster } from "@/services/apiServices";
import { FormattedMessage, useIntl } from "react-intl";
import { useLanguage } from "@/i18n";
import { usePermission } from "../../../hooks/usePermission";
import { useModuleAccess } from "../../../hooks/useModuleAccess";
import AvailabilityModal from "../../../partials/modals/availabilty/AvailabilityModal";
import { useLocation } from "react-router-dom";
import DayAvailabilityModal from "../../../partials/modals/availabilty/DayAvailabilityModal";
import { useBanquetPermission } from "../../../hooks/useBanquetPermission";

const CalendarPage = () => {
  const permissions = usePermission("Calendar");
  const isFollowUpPermission = usePermission("Follow Up");
  const navigate = useNavigate();
  const intl = useIntl();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventModalData, setEventModalData] = useState(false);
  const [data, setData] = useState([]);
  const [events, setEvents] = useState([]);
  const { hasModuleAccess } = useModuleAccess();
  const canAccessBanquet = hasModuleAccess("Banquet");
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const location = useLocation();
const prefill = location.state || {};
const [isDayModalOpen, setIsDayModalOpen] = useState(false);
const [selectedDay, setSelectedDay] = useState(null);
const [statusFilter, setStatusFilter] = useState(-1);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return String(now.getMonth() + 1).padStart(2, "0"); // "06"
  });
  const [currentYear, setCurrentYear] = useState(() => {
    return String(new Date().getFullYear()); // "2026"
  });
const [loadingEvents, setLoadingEvents] = useState(false);

  const openEvent = (data) => {
    setEventModalData(data);
    setIsModalOpen(true);
  };

  let Id = localStorage.getItem("userId");
  const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
const isChildUser = authStorage?.state?.user?.ischilduser ?? false;
const isInquiryVisible = authStorage?.state?.user?.isInquiryVisible ?? false;


  const { isRTL, locale } = useLanguage();

const { isHallAllowed } = useBanquetPermission()

  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  useEffect(() => {
    const storedLang = localStorage.getItem("lang") || "en";
    setLang(storedLang);
  }, [isRTL]);

  const getLocalizedText = (obj, field) => {
    if (!obj) return "";

    switch (lang) {
      case "hi":
        return obj[`${field}Hindi`] || obj[`${field}English`] || "";
      case "gu":
      case "mr":
      case "ta":
      case "te":
      case "ml":
        return obj[`${field}Gujarati`] || obj[`${field}English`] || "";
      default:
        return obj[`${field}English`] || "";
    }
  };

  const getStatusColor = (statusCode, isRMenu) => {
    if (statusCode === 2) {
      return "rgba(191, 34, 37, 1)";
    }

    if (isRMenu === true && statusCode === 1) {
      return "#E75480";
    }

    switch (statusCode) {
      case 0:
        return "#3788d8";
      case 1:
        return "rgba(40, 167, 69, 1)";
      default:
        return "#6b7280";
    }
  };

  const splitDateTime = (dateTimeString) => {
    if (!dateTimeString) {
      const today = new Date();
      return {
        date: today.toISOString().split("T")[0],
        time24: "00:00",
        time12: "12:00 am",
      };
    }

    try {
      const [datePart, timePart, ampm] = dateTimeString.trim().split(" ");
      const [day, month, year] = datePart.split("/");

      const formattedDate = `${year}-${month.padStart(2, "0")}-${day.padStart(
        2,
        "0",
      )}`;

      let [hours, minutes] = timePart.split(":");
      hours = parseInt(hours, 10);

      let hours24 = hours;
      if (ampm.toLowerCase() === "pm" && hours !== 12) {
        hours24 += 12;
      }
      if (ampm.toLowerCase() === "am" && hours === 12) {
        hours24 = 0;
      }

      const formattedTime24 = `${String(hours24).padStart(2, "0")}:${minutes}`;
      const formattedTime12 = `${timePart} ${ampm}`;

      return {
        date: formattedDate,
        time24: formattedTime24,
        time12: formattedTime12,
      };
    } catch (error) {
      console.warn("Invalid datetime:", dateTimeString, error);
      const today = new Date();
      return {
        date: today.toISOString().split("T")[0],
        time24: "00:00",
        time12: "12:00 am",
      };
    }
  };

  const addOneDay = (dateStr) => {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + 1);
    return date.toISOString().split("T")[0];
  };

 useEffect(() => {
    FetchEventdetails(currentMonth, currentYear, statusFilter);
  }, [lang, currentMonth, currentYear, statusFilter]);


  const handleMonthChange = (info) => {
    const date = new Date(info.start);
    const mid = new Date((info.start.getTime() + info.end.getTime()) / 2);
    const month = String(mid.getMonth() + 1).padStart(2, "0");
    const year = String(mid.getFullYear());
    setCurrentMonth(month);
    setCurrentYear(year);
  };

const FetchEventdetails = (month = currentMonth, year = currentYear, status = statusFilter) => {
  setLoadingEvents(true);
  
    GetEventMaster(Id, isChildUser, month, year, status === -1 ? null : status )
      .then((res) => {
        const eventdata = res?.data?.data?.["Event Details"] || [];

        setData(
  eventdata
    .map((item, index) => {
      try {
        const { date: startDate, time12 } = splitDateTime(item.eventStartDateTime);
        const { date: endDate } = splitDateTime(item.eventEndDateTime || item.eventStartDateTime);
        const color = getStatusColor(item.status, item.isRMenu);
        const hasODC = canAccessBanquet
          ? (item.banquetHallId === null || item.banquetHallId === 0 || !item.banquetHallId)
          : false;
        const banquetSuffix = hasODC ? " = " : "";

        return {
          eventid: item.id,
          eventTypeId: item.eventType?.id || null,
          title:
            banquetSuffix +
            (item.prefix || "") +
            getLocalizedText(item.party, "name") +
            " - " +
            getLocalizedText(item.eventType, "name"),
          start: startDate,
          end: addOneDay(endDate),
          time: time12,
          mobile: item.party?.mobileno || "N/A",
          statusCode: item.status,
          isRMenu: item?.isRMenu,
          banquetHallId: item.banquetHallId || null,
          banquetHallName: item.banquetHallId ? item.banquetHallName : null,
          address: getLocalizedText(item.venue, "name"),
          event: getLocalizedText(item.eventType, "name"),
          eventRooms: item.eventRooms || [],
          remark: item.remark || "",
          remarksGujarati: item.remarksGujarati || "",
          remarksHindi: item.remarksHindi || "",
          color: color,
          allDay: true,
          createdAt: item.createdAt,
        };
      } catch (error) {
        console.error(`Error processing event item ${index}:`, item, error);
        return null;
      }
    })
    .filter((item) => item !== null)
    .filter((item) => {
      if (!canAccessBanquet) return true;           // non-banquet users see all events
      return isHallAllowed(item.banquetHallId || 0); // banquet users: check hall rights
    })
    .filter((item) => {
      if (isInquiryVisible) return true;   // allowed to see inquiries
      return item.statusCode !== 0;        // status 0 = Inquiry, hide it otherwise
    })
);

        setEvents(res.data);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
      setLoadingEvents(false); 
    });
  };

 const handleDateClick = (info) => {
  if (canAccessBanquet) {
    setSelectedDay(new Date(info.dateStr));
    setIsDayModalOpen(true);
  } else {
    navigate("/add-event", {
      state: { event_date: new Date(info.dateStr) },
    });
  }
};

  return (
    <Fragment>
      <Container>
        {/* Status Legend - Improved Mobile Layout */}
        <div className="calendar-status-legend mb-4">
          {/* Mobile: 2x2 Grid */}
          <div className="grid grid-cols-2 gap-2 md:hidden">
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "#17a2b8" }}
              ></span>
              <span className="text-xs font-medium text-gray-700">
                {intl.formatMessage({
                  id: "USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_INQUIRY",
                  defaultMessage: "Inquiry",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <span className="w-3 h-3 rounded-full bg-[#E75480]"></span>
              <span className="text-xs font-medium text-gray-700">
                {intl.formatMessage({
                  id: "USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_CONFIRM_WITHOUT_MENU",
                  defaultMessage: "Remaining Menu",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "rgba(40, 167, 69, 1)" }}
              ></span>
              <span className="text-xs font-medium text-gray-700">
                {intl.formatMessage({
                  id: "USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_COMPLETED",
                  defaultMessage: "Confirm",
                })}
              </span>
            </div>
             <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <span className="w-3 h-3 rounded-full bg-[#E75480]"></span>
              <span className="text-xs font-medium text-gray-700">
                {intl.formatMessage({
                  id: "USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_TENTATIVE",
                  defaultMessage: "Tentative",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: "rgba(191, 34, 37, 1)" }}
              ></span>
              <span className="text-xs font-medium text-gray-700">
                {intl.formatMessage({
                  id: "USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_CANCEL",
                  defaultMessage: "Cancel",
                })}
              </span>
            </div>
          </div>

          {/* Desktop: Horizontal Pills with Create Button */}
          <div className="hidden md:flex md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium bg-[#3788d8] rounded-lg px-4 py-2 text-white">
                {intl.formatMessage({
                  id: "USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_INQUIRY",
                  defaultMessage: "Inquiry",
                })}
              </span>
              <span className="text-sm font-medium bg-[#E75480] rounded-lg px-4 py-2 text-white">
                {intl.formatMessage({
                  id: "USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_CONFIRM_WITHOUT_MENU",
                  defaultMessage: "Remaining Menu",
                })}
              </span>
              <span className="text-sm font-medium bg-success rounded-lg px-4 py-2 text-white">
                {intl.formatMessage({
                  id: "USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_COMPLETED",
                  defaultMessage: "Confirm",
                })}
              </span>
              <span className="text-sm font-medium bg-[#757677] rounded-lg px-4 py-2 text-white">
                {intl.formatMessage({
                  id: "USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_TENTATIVE",
                  defaultMessage: "Tentative",
                })}
              </span>
              <span className="text-sm font-medium bg-danger rounded-lg px-4 py-2 text-white">
                {intl.formatMessage({
                  id: "USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_CANCEL",
                  defaultMessage: "Cancel",
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
                          {/* Status Filter Dropdown */}
<select
  value={statusFilter}
  onChange={(e) => setStatusFilter(Number(e.target.value))}
  className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
>
  <option value={-1}>All</option>
  <option value={0}>Inquiry</option>
  <option value={1}>Confirm</option>
  <option value={2}>Cancel</option>
  <option value={3}>Tentative</option>
</select>


                {canAccessBanquet && (
              <button
  className="btn btn-light border border-primary text-primary text-sm py-2 px-4 flex items-center gap-2 rounded-lg hover:bg-primary hover:text-white transition"
  onClick={() => setIsAvailabilityOpen(true)}
>
  <i className="ki-filled ki-calendar-tick"></i>
  <span>
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_CHECK_AVAILABILITY_BUTTON"
                    defaultMessage="Check Availability"
                  />
                </span>
</button>
              
                )}

                {isFollowUpPermission.view && (
                <button
  className="btn btn-light border border-primary text-primary text-sm py-2 px-4 flex items-center gap-2 rounded-lg hover:bg-primary hover:text-white transition"
  onClick={() => navigate("/followup-calendar")}
>
  <i className="ki-filled ki-calendar-tick"></i>
  <span>
    <FormattedMessage
      id="USER.DASHBOARD.FOLLOWUP_CALENDAR_BUTTON"
      defaultMessage="Follow Up Calendar"
    />
  </span>
</button>
                )}

{permissions.add && (
              
              <button
                className="btn btn-primary text-sm py-2.5 px-6 flex items-center gap-2 rounded-lg"
                onClick={() => navigate("/add-event")}
              >
                <i className="ki-filled ki-plus text-lg"></i>
                <span>
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_ADD_EVENT_BUTTON"
                    defaultMessage="Add Event"
                  />
                </span>
              </button>
              
            )}
            </div>
                  
            
          </div>
        </div>

        {/* Create Event Button - Mobile Full Width */}
        <div className="md:hidden mb-4">
          <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(Number(e.target.value))}
    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white mb-3 focus:outline-none focus:ring-2 focus:ring-primary"
  >
    <option value={-1}>All</option>
    <option value={0}>Inquiry</option>
    <option value={1}>Confirm</option>
    <option value={2}>Cancel</option>
    <option value={3}>Tentative</option>
  </select>
          <button
            className="btn btn-primary w-full py-3 px-4 flex items-center justify-center gap-2 rounded-lg text-base font-semibold"
            onClick={() => navigate("/add-event")}
          >
            <i className="ki-filled ki-plus text-xl"></i>
            <span>
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_ADD_EVENT_BUTTON"
                defaultMessage="Create New Event"
              />
            </span>
          </button>
          {/* <button
  className="btn btn-light border border-primary text-primary w-full py-3 px-4 flex items-center justify-center gap-2 rounded-lg text-base font-semibold"
  onClick={() => setIsAvailabilityOpen(true)}
>
  <i className="ki-filled ki-calendar-tick text-xl"></i>
  Check Availability
</button> */}
        </div>
            
        {/* Calendar Component - Clean Container */}
        <div className="calendar-container bg-white rounded-lg shadow-sm  md:p-2">
          <CalendarComponent
            data={data}
            openEvent={openEvent}
            handleDateClick={handleDateClick}
            handleMonthChange={handleMonthChange}
            lang={lang}
            loading={loadingEvents}
          />
        </div>
      </Container>

      {/* Event Modal */}
      {isModalOpen && (
        <EventViewModal
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          eventData={eventModalData}
          onEventsUpdated={FetchEventdetails}
        />
      )}

      <DayAvailabilityModal
  isOpen={isDayModalOpen}
  onClose={() => setIsDayModalOpen(false)}
  date={selectedDay}
  userId={Id}
/>

      <AvailabilityModal
  isOpen={isAvailabilityOpen}
  onClose={() => setIsAvailabilityOpen(false)}
  userId={Id}
/>
    </Fragment>
  );
};

export default CalendarPage;
