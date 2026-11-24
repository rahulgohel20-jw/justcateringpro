import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import tippy, { delegate } from "tippy.js";
import "tippy.js/dist/tippy.css";
import useStyles from "./style";
import { useIntl } from "react-intl";
import { useLanguage } from "@/i18n";
import { useEffect, useState, useRef, useMemo } from "react";

// Vite: import.meta.env.VITE_GOOGLE_CAL_KEY
const GOOGLE_CAL_API_KEY = import.meta.env.VITE_GOOGLE_CAL_KEY;

const FESTIVAL_CAL_ID = "en.indian#holiday@group.v.calendar.google.com";

const escapeHtml = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const toDateKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

// Fetch festivals for a date range and return { "YYYY-MM-DD": [names] }
const fetchFestivalRange = async (start, end) => {
  const url =
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(FESTIVAL_CAL_ID)}/events` +
    `?key=${GOOGLE_CAL_API_KEY}&singleEvents=true&orderBy=startTime&maxResults=250` +
    `&timeMin=${start.toISOString()}&timeMax=${end.toISOString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Festival fetch failed: ${res.status}`);
  const json = await res.json();

  const map = {};
  (json.items || []).forEach((it) => {
    const key = (it.start?.date || it.start?.dateTime || "").slice(0, 10);
    if (key) (map[key] = map[key] || []).push(it.summary);
  });
  return map;
};

const CalendarComponent = ({ data, openEvent, handleDateClick, handleMonthChange, loading, initialDate, extraFilters }) => {
  const classes = useStyles();
  const intl = useIntl();
  const { isRTL } = useLanguage();
  const calendarRef = useRef(null);
  const wrapperRef = useRef(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const prevDateRef = useRef(null);

  const now = new Date();

  const getEffectiveInitialDate = () => {
    if (initialDate instanceof Date && !isNaN(initialDate.getTime())) {
      return initialDate;
    }
    return new Date();
  };

  const initDate = useMemo(getEffectiveInitialDate, [initialDate]);
  const [selectedMonth, setSelectedMonth] = useState(initDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(initDate.getFullYear());
  const [toolbarTitle, setToolbarTitle] = useState("");

  // Festivals live in their own state, independent of the bookings `data`
  const [festivalMap, setFestivalMap] = useState({});
  const loadedRangesRef = useRef(new Set());

  const loadFestivals = async (start, end) => {
    if (!GOOGLE_CAL_API_KEY) return;
    const rangeKey = `${start.toISOString()}_${end.toISOString()}`;
    if (loadedRangesRef.current.has(rangeKey)) return;
    loadedRangesRef.current.add(rangeKey);
    try {
      const map = await fetchFestivalRange(start, end);
      setFestivalMap((prev) => ({ ...prev, ...map })); // merge, never reset
    } catch (err) {
      loadedRangesRef.current.delete(rangeKey); // allow retry
      console.error(err);
    }
  };

  // Festival hover tooltip (event delegation on the calendar wrapper)
  useEffect(() => {
    if (!wrapperRef.current) return;

    const instance = delegate(wrapperRef.current, {
      target: "[data-festival]",
      allowHTML: true,
      theme: "festival",
      placement: "top",
      arrow: true,
      delay: [100, 0],
      maxWidth: 260,
      appendTo: () => document.body,
      onShow(inst) {
        const el = inst.reference;
        let names = [];
        try {
          names = JSON.parse(el.dataset.festival || "[]");
        } catch { }
        const dateLabel = el.dataset.date
          ? new Date(`${el.dataset.date}T00:00:00`).toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
          : "";

        inst.setContent(`
          <div class="ftip">
            <div class="ftip__head">Festival${names.length > 1 ? "s" : ""}</div>
            <ul class="ftip__list">
              ${names.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}
            </ul>
            <div class="ftip__date">${escapeHtml(dateLabel)}</div>
          </div>
        `);
      },
    });

    return () => {
      (Array.isArray(instance) ? instance : [instance]).forEach((i) => i.destroy());
    };
  }, []);

  const monthNames = useMemo(
    () => [
      intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_MONTH_JAN", defaultMessage: "January" }),
      intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_MONTH_FEB", defaultMessage: "February" }),
      intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_MONTH_MAR", defaultMessage: "March" }),
      intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_MONTH_APR", defaultMessage: "April" }),
      intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_MONTH_MAY", defaultMessage: "May" }),
      intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_MONTH_JUN", defaultMessage: "June" }),
      intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_MONTH_JUL", defaultMessage: "July" }),
      intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_MONTH_AUG", defaultMessage: "August" }),
      intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_MONTH_SEP", defaultMessage: "September" }),
      intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_MONTH_OCT", defaultMessage: "October" }),
      intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_MONTH_NOV", defaultMessage: "November" }),
      intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_MONTH_DEC", defaultMessage: "December" }),
    ],
    [intl]
  );

  const yearOptions = useMemo(() => {
    const base = now.getFullYear();
    const years = [];
    for (let y = base - 5; y <= base + 5; y++) years.push(y);
    return years;
  }, []);

  const handleDatesSet = (info) => {
    loadFestivals(info.start, info.end); // always load festivals, even while bookings load

    if (loading) {
      if (prevDateRef.current && calendarRef.current) {
        calendarRef.current.getApi().gotoDate(prevDateRef.current);
      }
      return;
    }

    const mid = new Date((info.start.getTime() + info.end.getTime()) / 2);
    prevDateRef.current = mid;
    setSelectedMonth(mid.getMonth());
    setSelectedYear(mid.getFullYear());
    setToolbarTitle(info.view.title);
    handleMonthChange(info);
  };

  const jumpToMonth = (monthIndex, year) => {
    if (loading || !calendarRef.current) return;
    calendarRef.current.getApi().gotoDate(new Date(year, monthIndex, 1));
  };

  const handleMonthSelectChange = (e) => {
    const monthIndex = Number(e.target.value);
    setSelectedMonth(monthIndex);
    jumpToMonth(monthIndex, selectedYear);
  };

  const handleYearSelectChange = (e) => {
    const year = Number(e.target.value);
    setSelectedYear(year);
    jumpToMonth(selectedMonth, year);
  };

  const goPrev = () => {
    if (loading || !calendarRef.current) return;
    calendarRef.current.getApi().prev();
  };
  const goNext = () => {
    if (loading || !calendarRef.current) return;
    calendarRef.current.getApi().next();
  };
  const goToday = () => {
    if (loading || !calendarRef.current) return;
    calendarRef.current.getApi().today();
  };
  const changeView = (view) => {
    if (loading || !calendarRef.current) return;
    calendarRef.current.getApi().changeView(view);
    setCurrentView(view);
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getContentHeight = () => {
    return windowWidth < 768 ? "auto" : 650;
  };

  const viewButtons = [
    { view: "dayGridMonth", label: intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_MONTH", defaultMessage: "Month" }) },
    { view: "dayGridWeek", label: intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_WEEK", defaultMessage: "Week" }) },
    { view: "timeGridDay", label: intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_DAY", defaultMessage: "Day" }) },
    { view: "listWeek", label: intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_LIST", defaultMessage: "List" }) },
  ];

  const CustomToolbar = () => (
    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap md:flex-nowrap">
      {/* Left: view switcher pills + month/year dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex rounded-lg overflow-hidden border border-gray-300">
          {viewButtons.map(({ view, label }) => (
            <button
              key={view}
              type="button"
              disabled={loading}
              onClick={() => changeView(view)}
              className={`px-3 py-2 text-xs md:text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${currentView === view
                ? "bg-primary text-white"
                : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={selectedMonth}
          onChange={handleMonthSelectChange}
          disabled={loading}
          className="border border-gray-300 rounded-lg px-2.5 py-2 text-xs md:text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {monthNames.map((name, idx) => (
            <option key={name} value={idx}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={selectedYear}
          onChange={handleYearSelectChange}
          disabled={loading}
          className="border border-gray-300 rounded-lg px-2.5 py-2 text-xs md:text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {extraFilters}
      </div>

      {/* Center: title */}
      <div className="order-last md:order-none w-full md:w-auto text-center">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">{toolbarTitle}</h2>
      </div>

      {/* Right: prev / next / today */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={goPrev}
          disabled={loading}
          className="btn btn-light btn-icon border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous"
        >
          <i className="ki-filled ki-left" />
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={loading}
          className="btn btn-light btn-icon border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next"
        >
          <i className="ki-filled ki-right" />
        </button>
        <button
          type="button"
          onClick={goToday}
          disabled={loading}
          className="btn btn-primary text-sm px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {intl.formatMessage({ id: "USER.DASHBOARD.DASHBOARD_CALENDAR_TODAY", defaultMessage: "Today" })}
        </button>
      </div>
    </div>
  );

  return (
    <div ref={wrapperRef} className={`${classes.fullCalendar} fullCalendarCommon relative`}>
      {loading && (
        <div className="absolute inset-0 z-10 bg-white/60 flex items-center justify-center rounded-lg cursor-not-allowed">
          <div className="flex flex-col items-center gap-2 text-sm text-gray-500 font-medium">
            <svg className="animate-spin h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading Events...
          </div>
        </div>
      )}

      <CustomToolbar />

      <FullCalendar
        ref={calendarRef}
        datesSet={handleDatesSet}
        events={data}
        eventClick={(e) => openEvent(e)}
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        initialDate={initDate}
        headerToolbar={false}
        contentHeight={getContentHeight()}
        aspectRatio={windowWidth < 768 ? 1.2 : 1.8}
        dateClick={handleDateClick}
        viewDidMount={(info) => {
          setCurrentView(info.view.type);
          setToolbarTitle(info.view.title);
        }}
        dayCellClassNames={(arg) =>
          festivalMap[toDateKey(arg.date)] ? ["has-festival"] : []
        }
        dayCellContent={(arg) => {
          const key = toDateKey(arg.date);
          const names = festivalMap[key] || [];

          return (
            <div className="fday">
              <span
                className="fday__name"
                {...(names.length > 0
                  ? { "data-festival": JSON.stringify(names), "data-date": key }
                  : {})}
              >
                {names.length > 0 && (
                  <>
                    <i className="fday__mark">◆</i>
                    {names[0]}
                    {names.length > 1 && <b> +{names.length - 1}</b>}
                  </>
                )}
              </span>
              <span className="fday__num">{arg.dayNumberText}</span>
            </div>
          );
        }}
        eventDidMount={(info) => {
          const { event, el } = info;

          const raw = event.extendedProps.raw; // grouped follow-up items, if present
          const first = Array.isArray(raw) ? raw[0] : null;

          const company = event.extendedProps.company;
          const contact = event.extendedProps.contact;
          const email = event.extendedProps.email;

          const time = first?.followupDate || event.extendedProps.time || "";
          const address = event.extendedProps.address || "";
          const events = first?.description || event.extendedProps.event || "";
          const mobile = first?.managerName || event.extendedProps.mobile || "";
          const clientName = first?.clientName || event.extendedProps.clientName || "";
          const banquetHallName = event.extendedProps.banquetHallName || "";
          const locationText = banquetHallName || address;

          const tooltipContent =
            company || email || contact
              ? `
        <div class="p-1">
          <p class="mb-1"><strong>${event.title}</strong></p>
          <p class="mb-1"><i class="me-1 ki-filled ki-briefcase text-success"></i>
            <span>${company || "No Company"}</span></p>
          <p class="mb-1"><i class="me-1 ki-filled ki-call text-success"></i>
            <span>${contact || "N/A"}</span></p>
          <p class="mb-1"><i class="me-1 ki-filled ki-message text-success"></i>
            <span>${email || "N/A"}</span></p>
        </div>
      `
              : `
        <div class="p-1">
          <p class="mb-1"><strong>${event.title}</strong></p>
          ${clientName ? `<p class="mb-1"><i class="me-1 ki-filled ki-user text-success"></i><span>${clientName}</span></p>` : ""}
          <p class="mb-1"><i class="me-1 ki-filled ki-calendar-tick text-success"></i><span>${events}</span></p>
          <p class="mb-1"><i class="me-1 ki-filled ki-call text-success"></i><span>${mobile}</span></p>
          <p class="mb-1"><i class="me-1 ki-filled ki-time text-success"></i><span>${time}</span></p>
          ${locationText ? `<p class="mb-1"><i class="me-1 ki-filled ki-geolocation text-success"></i><span>${locationText}</span></p>` : ""}
        </div>
      `;

          tippy(el, {
            content: tooltipContent,
            allowHTML: true,
            theme: "light",
          });
        }}
      />
    </div>
  );
};

export default CalendarComponent;