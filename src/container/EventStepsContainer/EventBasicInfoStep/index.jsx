import { useEffect, useState, useRef } from "react";
import { Form } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import dayjs from "dayjs";
import UserDropdown from "@/components/dropdowns/UserDropdown";
import VenueDropdown from "../../../components/dropdowns/VenueDropdown";
import AddVenueType from "../../../partials/modals/add-venue-type/AddVenueType";
import EventStatusDropdown from "@/components/dropdowns/EventStatusDropdown";
import SpeechToText from "@/components/form-inputs/SpeechToText";
import useStyles from "./style";
import AddEventType from "@/partials/modals/add-event-type/AddEventType";
import {
  GetEventType,
  GetVenueType,
  GetAllBanquet,
} from "@/services/apiServices";
import { FormattedMessage } from "react-intl";
import { useLanguage } from "@/i18n";
import { useModuleAccess } from "../../../hooks/useModuleAccess";
import { useLocation } from "react-router-dom";
import AddBanquetModal from "../../../partials/modals/add-banquet/AddBanquetModal";
import { useBanquetPermission } from "../../../hooks/useBanquetPermission";
import { usePermission } from "../../../hooks/usePermission";
const ODC_OPTION = { value: "ODC", label: "ODC" };

const EventBasicInfoStep = ({
  formData,
  setFormData,
  onInputChange,
  errors,
  prefillAppliedRef,
  enableAdvancedDateSync = false,
}) => {
  const classes = useStyles();
  const [eventTypes, setEventTypes] = useState([]);
  const [isEventTypeModalOpen, setIsEventTypeModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [venueList, setVenueList] = useState([]);
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [banquetList, setBanquetList] = useState([]);
  const { isRTL, locale } = useLanguage();
  const [isBanquetModalOpen, setIsBanquetModalOpen] = useState(false);
  const { hasModuleAccess } = useModuleAccess();
  const canAccessBanquet = hasModuleAccess("Banquet");
  const location = useLocation();
  const prefill = location.state || {};
  const { filterHalls } = useBanquetPermission();

  const backDatePermission = usePermission("Lock Back Date Entry");
  const isBackDateLocked = backDatePermission.add || backDatePermission.edit;
  const backDateMin = isBackDateLocked ? new Date() : undefined;

  let Id = JSON.parse(localStorage.getItem("userId"));
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  // ── Prefill ref: persistent (parent-passed) only for advanced-sync user,
  // otherwise a plain local ref like before ─────────────────────────────────
  const localPrefillRef = useRef(false);
  const eventPrefillRef = enableAdvancedDateSync
    ? (prefillAppliedRef || localPrefillRef)
    : localPrefillRef;

  useEffect(() => {
    if (enableAdvancedDateSync && eventPrefillRef.current) return;

    if (!prefill.banquetHallId || banquetList.length === 0) return;

    const banquetExists = banquetList.find(
      (b) => String(b.value) === String(prefill.banquetHallId)
    );
    if (!banquetExists) return;

    if (enableAdvancedDateSync) {
      eventPrefillRef.current = true;
    }

    const baseDate = prefill.event_date ? dayjs(prefill.event_date) : null;
    const shiftStart = prefill.shiftStartTime
      ? dayjs(prefill.shiftStartTime, ["HH:mm", "hh:mm A"])
      : null;
    const shiftEnd = prefill.shiftEndTime
      ? dayjs(prefill.shiftEndTime, ["HH:mm", "hh:mm A"])
      : null;

    const withTime = (time) =>
      baseDate
        ? (time ? baseDate.hour(time.hour()).minute(time.minute()) : baseDate).format(
            "DD/MM/YYYY hh:mm A",
          )
        : null;

    const newStart = withTime(shiftStart);
    const newEnd = withTime(shiftEnd);

    setFormData((prev) => ({
      ...prev,
      banquetId: prefill.banquetHallId,
      eventStartDateTime: newStart || prev.eventStartDateTime,
      eventEndDateTime: newEnd || prev.eventEndDateTime,
      eventFunction: (prev.eventFunction || []).map((func) => ({
        ...func,
        banquetHallId: prefill.banquetHallId,
        shiftId: prefill.shiftId || "",
        originalShiftId: prefill.shiftId || "",
        functionStartDateTime: newStart || func.functionStartDateTime,
        functionEndDateTime: newEnd || func.functionEndDateTime,
      })),
    }));
  }, [banquetList]);

  const getLabel = (item, field) => {
    switch (lang) {
      case "hi":
        return item[`${field}Hindi`] || item[`${field}English`] || "-";
      case "gu":
        return item[`${field}Gujarati`] || item[`${field}English`] || "-";
      default:
        return item[`${field}English`] || "-";
    }
  };

  const getSoftType = () => {
    try {
      const auth = JSON.parse(localStorage.getItem("auth-storage"));
      return auth?.state?.user?.softType || "";
    } catch {
      return "";
    }
  };

  useEffect(() => {
    fetchVenueTypes(false);
    Fetcheventtype(false);
    fetchBanquets();
  }, [lang]);

  const fetchBanquets = async () => {
    try {
      const res = await GetAllBanquet(Id);
      const items =
        res?.data?.data?.["Banquet Details"] ||
        res?.data?.data?.banquetHalls ||
        res?.data?.data ||
        [];
      const formatted = Array.isArray(items)
        ? items
            .filter((item) => item && item.id != null)
            .map((item) => ({
              value: item.id,
              label: item.hallName || item.name || `Banquet ${item.id}`,
            }))
        : [];
      setBanquetList(formatted);
    } catch (error) {
      console.error("Error fetching banquets:", error);
      setBanquetList([]);
    }
  };

  const Fetcheventtype = async (autoSelectLatest = false) => {
    try {
      const res = await GetEventType(Id);
      const items = res.data.data["EventTypes Details"] || [];
      const formattedEventTypes = items.map((event, index) => ({
        sr_no: index + 1,
        value: event.id,
        label: getLabel(event, "name"),
      }));
      setEventTypes(formattedEventTypes);
      if (autoSelectLatest && formattedEventTypes.length > 0) {
        const latestEventType =
          formattedEventTypes[formattedEventTypes.length - 1];
        setFormData((prev) => ({
          ...prev,
          eventTypeId: latestEventType.value,
        }));
      }
    } catch (error) {
      console.log("Error fetching Event Types:", error);
    }
  };

  const fetchVenueTypes = async (autoSelectLatest = false) => {
    try {
      const isActive = true;
      const res = await GetVenueType(isActive, Id);
      const venueArray = res?.data?.data?.["Venue Details"] || [];
      const venues = venueArray.map((item, index) => ({
        sr_no: index + 1,
        value: item.id,
        label: getLabel(item, "name"),
        rawData: item,
      }));
      setVenueList(venues);
      if (autoSelectLatest && venues.length > 0) {
        const latestVenue = venues[venues.length - 1];
        setFormData((prev) => ({ ...prev, venueId: latestVenue.value }));
      }
    } catch (error) {
      console.error("Error fetching Venues:", error);
    }
  };

  const handleFormDataChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDropdownChange = (fieldName, value) => {
    const syntheticEvent = { target: { name: fieldName, value } };
    onInputChange(syntheticEvent, fieldName);
  };

  const handleBanquetChange = (e) => {
    const value = e?.target?.value;

    setFormData((prev) => ({
      ...prev,
      banquetId: value,
      venueId: value === "ODC" ? prev.venueId : "",
      eventFunction: (prev.eventFunction || []).map((func) => ({
        ...func,
        banquetHallId: value === "ODC" ? "" : [String(value)],
        shiftId: "",
        shiftOptions: [],
        originalShiftId: "",
      })),
    }));
  };

  const softType = getSoftType();
  const hideODC = softType === "justbanq";

  const banquetOptions = hideODC
    ? filterHalls(banquetList)
    : [ODC_OPTION, ...filterHalls(banquetList)];

  const isODC =
    !hideODC &&
    (!canAccessBanquet || formData.banquetId === "ODC" || !formData.banquetId);

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const parsed = dayjs(dateStr, "DD/MM/YYYY hh:mm A", true);
      if (!parsed.isValid()) {
        const altParsed = dayjs(dateStr, "DD/MM/YYYY", true);
        return altParsed.isValid() ? altParsed.toDate() : null;
      }
      return parsed.toDate();
    } catch (error) {
      return null;
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    try {
      const formatted = dayjs(date);
      return formatted.isValid() ? formatted.format("DD/MM/YYYY hh:mm A") : "";
    } catch (error) {
      return "";
    }
  };

  return (
    <Form>
      <div className={`flex flex-col gap-y-2 gap-x-4 ${classes.basicInfo}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
          <div className="select__grp flex flex-col">
            <label className="form-label">
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_INQUIRY_DATE"
                defaultMessage="Inquiry Date"
              />
              <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                *
              </span>
            </label>
            <DatePicker
              disabled
              className="input w-full"
              dateFormat="dd/MM/yyyy"
              selected={parseDate(formData.inquiryDate)}
              onChange={(date) => {
                handleFormDataChange(
                  "inquiryDate",
                  date && dayjs(date).isValid()
                    ? dayjs(date).format("DD/MM/YYYY")
                    : "",
                );
              }}
              placeholderText="DD/MM/YYYY"
            />
            {errors.inquiryDate && (
              <span className="text-red-600 font-normal text-sm mt-0.5">
                {errors.inquiryDate}
              </span>
            )}
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="form-label">
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_STATUS_LABEL"
                defaultMessage="Status"
              />
              <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                *
              </span>
            </label>
            <EventStatusDropdown
              value={formData.status}
              className="w-full"
              onChange={onInputChange}
            />
            {errors.status && (
              <span className="text-red-600 font-normal text-sm mt-0.5">
                {errors.status}
              </span>
            )}
          </div>

          {/* Event Type */}
          <div className="select__grp flex flex-col">
            <label className="form-label">
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_EVENT_TYPE_LABEL"
                defaultMessage="Event Type"
              />
              <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                *
              </span>
            </label>
            <div className="sg__inner flex items-center gap-1 relative">
              <UserDropdown
                value={formData.eventTypeId}
                onChange={onInputChange}
                options={eventTypes}
                name="eventTypeId"
              />
              <button
                type="button"
                onClick={() => {
                  setSelectedEvent(null);
                  setIsEventTypeModalOpen(true);
                }}
                title="Add Event Type"
                className="sga__btn me-1 btn btn-primary flex items-center justify-center rounded-full p-0 w-8 h-8"
              >
                <i className="ki-filled ki-plus"></i>
              </button>
            </div>
            {errors.eventTypeId && (
              <span className="text-red-600 font-normal text-sm mt-0.5">
                {errors.eventTypeId}
              </span>
            )}
          </div>

          {/* Start Event Date */}
          <div className="flex flex-col">
            <label className="form-label">
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_START_EVENT_DATE_LABEL"
                defaultMessage="Start Event Date"
              />
              <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                *
              </span>
            </label>
            <DatePicker
              className="input w-full"
              showTimeSelect
              timeFormat="hh:mm aa"
              timeIntervals={30}
              dateFormat="dd/MM/yyyy hh:mm aa"
              selected={parseDate(formData.eventStartDateTime)}
              onChange={(date) => {
                if (enableAdvancedDateSync) {
                  const formatted = date ? formatDate(date) : "";
                  setFormData((prev) => ({
                    ...prev,
                    eventStartDateTime: formatted,
                    eventFunction: (prev.eventFunction || []).map((func) =>
                      func.dateTouched
                        ? func
                        : { ...func, functionStartDateTime: formatted }
                    ),
                  }));
                } else {
                  handleFormDataChange(
                    "eventStartDateTime",
                    date ? formatDate(date) : "",
                  );
                }
              }}
              minDate={backDateMin}
              timeCaption="Time"
              placeholderText="DD/MM/YYYY hh:mm AM/PM"
            />
            {errors.eventStartDateTime && (
              <span className="text-red-600 font-normal text-sm mt-0.5">
                {errors.eventStartDateTime}
              </span>
            )}
          </div>

          {/* End Event Date */}
          <div className="flex flex-col">
            <label className="form-label">
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_DETAILS_END_EVENT_DATE_LABEL"
                defaultMessage="End Event Date"
              />
              <span className="mandatory ms-0.5 text-base text-red-500 font-medium">
                *
              </span>
            </label>
            <DatePicker
              className="input w-full"
              showTimeSelect
              timeFormat="hh:mm aa"
              timeIntervals={30}
              dateFormat="dd/MM/yyyy hh:mm aa"
              selected={
                formData.eventEndDateTime
                  ? parseDate(formData.eventEndDateTime)
                  : formData.eventStartDateTime
                    ? parseDate(formData.eventStartDateTime)
                    : null
              }
              onChange={(date) => {
                if (enableAdvancedDateSync) {
                  const formatted = date ? formatDate(date) : "";
                  setFormData((prev) => ({
                    ...prev,
                    eventEndDateTime: formatted,
                    eventFunction: (prev.eventFunction || []).map((func) =>
                      func.dateTouched
                        ? func
                        : { ...func, functionEndDateTime: formatted }
                    ),
                  }));
                } else {
                  handleFormDataChange(
                    "eventEndDateTime",
                    date ? formatDate(date) : "",
                  );
                }
              }}
              minDate={
                formData.eventStartDateTime
                  ? parseDate(formData.eventStartDateTime) || backDateMin || new Date()
                  : backDateMin || new Date()
              }
              timeCaption="Time"
              placeholderText="DD/MM/YYYY hh:mm AM/PM"
            />
            {errors.eventEndDateTime && (
              <span className="text-red-600 font-normal text-sm mt-0.5">
                {errors.eventEndDateTime}
              </span>
            )}
          </div>

          {canAccessBanquet && (
            <div className="select__grp flex flex-col">
              <label className="form-label">Banquet Hall</label>
              <div className="flex items-center gap-1">
                <select
                  className="select w-full"
                  value={formData.banquetId || (hideODC ? banquetOptions[0]?.value : "ODC")}
                  onChange={handleBanquetChange}
                >
                  {banquetOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsBanquetModalOpen(true)}
                  title="Add Banquet"
                  className="sga__btn me-1 btn btn-primary flex items-center justify-center rounded-full p-0 w-8 h-8 flex-shrink-0"
                >
                  <i className="ki-filled ki-plus"></i>
                </button>
              </div>
            </div>
          )}

          {isODC && (
            <div className="select__grp flex flex-col">
              <label className="form-label">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_VENUE"
                  defaultMessage="Venue"
                />
                <span className="mandatory text-red-500">*</span>
              </label>
              <div className="sg__inner flex items-center gap-1">
                <VenueDropdown
                  value={formData.venueId}
                  onChange={(e) => onInputChange(e)}
                  options={venueList}
                />
                <button
                  type="button"
                  onClick={() => setIsVenueModalOpen(true)}
                  title="Add Venue"
                  className="btn btn-primary rounded-full p-0 w-8 h-8 flex items-center justify-center"
                >
                  <i className="ki-filled ki-plus"></i>
                </button>
              </div>
              {errors.venueId && (
                <span className="text-red-600 text-sm">{errors.venueId}</span>
              )}
            </div>
          )}
        </div>

        <AddEventType
          isModalOpen={isEventTypeModalOpen}
          setIsModalOpen={setIsEventTypeModalOpen}
          refreshData={() => Fetcheventtype(true)}
          selectedEvent={selectedEvent}
        />
        <AddVenueType
          isModalOpen={isVenueModalOpen}
          setIsModalOpen={setIsVenueModalOpen}
          refreshData={() => fetchVenueTypes(true)}
          selectedEvent={selectedVenue}
        />
        <AddBanquetModal
          isOpen={isBanquetModalOpen}
          onClose={() => setIsBanquetModalOpen(false)}
          refreshData={fetchBanquets}
          userId={Id}
        />
      </div>
    </Form>
  );
};

export default EventBasicInfoStep;