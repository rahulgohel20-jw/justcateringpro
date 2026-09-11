import { useState, useEffect } from "react";
import { CustomModal } from "@/components/custom-modal/CustomModal";
import SelectMenureport from "../../../partials/modals/menu-report/SelectMenureport";

import { Link } from "react-router-dom";
import {
  DeleteEventMaster,
  StatusChange,
  TranslateHindi,
  TranslateGujarati,
  AddLogs,
  updateeventmaster,
  GetUserlogs ,
} from "@/services/apiServices";
import { errorMsgPopup, successMsgPopup } from "../../../underConstruction";
import MenuReport from "@/partials/modals/menu-report/MenuReport";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils";
import { FormattedMessage } from "react-intl";
import { useLanguage } from "@/i18n";
import { usePermission } from "../../../hooks/usePermission";
import { AssignEventsToChild, GetPreparationStatus } from "../../../services/apiServices";
import RoomDetailsModal from "../room-details/RoomDetailsModal";
import { useModuleAccess } from "../../../hooks/useModuleAccess";
import EventNotes from "../menu-notes/Event-Notes";
import FollowUpTrackModal from "../followup-track/FollowUpTrackModal";

const getUserEmail = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return "";
    const parsed = JSON.parse(authStorage);
    return parsed?.state?.user?.email || "";
  } catch {
    return "";
  }
};

const EventViewModal = ({
  isModalOpen,
  setIsModalOpen,
  eventData,
  onEventsUpdated,
}) => {
  const permissions = usePermission("Calendar");
  const permFollowUp = usePermission("Follow Up");

  const permissionMenuPlanning = usePermission("Menu Planning");
  const permissionMenuExecution = usePermission("Menu Execution");
  const permissionRawMaterial = usePermission("Raw Material Distribution");
  const permissionLabourManagement = usePermission("Labour Agency Order");
  const permissionDishCosting = usePermission("Per Dish Costing");
  const permissionMenuReport = usePermission("Events Report");
  const permissionQuotation = usePermission("Quotation");
  const permissionInvoice = usePermission("Invoice");
  const permissionExpense = usePermission("Expense Management");
  const permissionCrockeryCutlery = usePermission("Crockery Cutlery");
  const permissionRoomDetails = usePermission("Room Details");
  const navigate = useNavigate();
  const eventDataAll = eventData?.event?._def?.extendedProps || {};
  const eventFunctionId = 108;
  const eventTypeId = eventDataAll?.eventTypeId ?? null;
  const safeEventId =
    eventDataAll?.eventid ?? eventDataAll?.id ?? eventData?.event?.id ?? null;
  const [statusId, setStatusId] = useState(eventDataAll?.statusCode ?? "0");
  const [isMenuReport, setIsMenuReport] = useState(false);
  const [menuReportEventId, setMenuReportEventId] = useState(null);
  const [translatedTitle, setTranslatedTitle] = useState("");
  const [translatedAddress, setTranslatedAddress] = useState("");
  const [isSelectMenuReport, setIsSelectMenuReport] = useState(false);
  const [isRoomModal, setIsRoomModal] = useState(false);
const [isRemarksModal, setIsRemarksModal] = useState(false);
const [remarks, setRemarks] = useState({ english: "", gujarati: "", hindi: "" });
const [isEventHistoryOpen, setIsEventHistoryOpen] = useState(false);
const [eventHistoryLogs, setEventHistoryLogs] = useState([]);
const [eventHistoryLoading, setEventHistoryLoading] = useState(false);
const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
const userId = localStorage.getItem("userId");
const [contextMenu, setContextMenu] = useState(null); 

const handleItemContextMenu = (e, item) => {
  if (item.disabled || !item.path) return;
  e.preventDefault();
  setContextMenu({ x: e.clientX, y: e.clientY, path: item.path });
};

useEffect(() => {
  if (!contextMenu) return;
  const close = () => setContextMenu(null);
  window.addEventListener("click", close);
  window.addEventListener("scroll", close, true);
  window.addEventListener("keydown", (e) => e.key === "Escape" && close());
  return () => {
    window.removeEventListener("click", close);
    window.removeEventListener("scroll", close, true);
  };
}, [contextMenu]);

const handleOpenInNewTab = () => {
  if (contextMenu?.path) {
    window.open(contextMenu.path, "_blank", "noopener,noreferrer");
  }
  setContextMenu(null);
};

useEffect(() => {
  if (isModalOpen) {
    setRemarks({
      english: eventDataAll?.remark || "",
      gujarati: eventDataAll?.remarksGujarati || "",
      hindi: eventDataAll?.remarksHindi || "",
    });
  }
}, [isModalOpen, eventDataAll?.remark, eventDataAll?.remarksGujarati, eventDataAll?.remarksHindi]);

  const { hasModuleAccess } = useModuleAccess();
    const canAccessBanquet = hasModuleAccess("Banquet" );
    const canAccessAssignManger = hasModuleAccess("Assign Manager");
    const canAccessMenuExtraFeature = hasModuleAccess("Menu Extra Features");
    const canAccessfollowup = hasModuleAccess("followup");

    const [prepStatus, setPrepStatus] = useState(null);

useEffect(() => {
  const fetchStatus = async () => {
    if (!safeEventId) return;
    try {
      const res = await GetPreparationStatus(safeEventId);
      setPrepStatus(res?.data?.data ?? null);
    } catch (err) {
      console.error("Failed to fetch prep status:", err);
    }
  };
  if (isModalOpen && safeEventId) {
    fetchStatus();
  }
}, [isModalOpen, safeEventId]);

const isCompleted = prepStatus === "COMPLETED";


  useEffect(() => {
    const translateText = async (text) => {
      if (!text) {
        return "";
      }

      const popoverEl = document.querySelector(".fc-popover");
      if (isModalOpen) {
        if (popoverEl) {
          popoverEl.style.zIndex = "1";
        }
      } else {
        if (popoverEl) {
          popoverEl.style.zIndex = "";
        }
      }

    
      const i18nConfig = localStorage.getItem("i18nConfig");
      let selectedLang = "en";

      if (i18nConfig) {
        try {
          const parsedConfig = JSON.parse(i18nConfig);
          selectedLang = parsedConfig.code || "en";
        } catch (e) {
          selectedLang = "en";
        }
      }

      if (selectedLang === "en") {
        return text;
      }

      try {
        switch (selectedLang) {
          case "hi":
            const resHindi = await TranslateHindi({ text });

            const translatedText =
              resHindi?.data?.text ||
              resHindi?.data?.translatedText ||
              resHindi?.translatedText ||
              resHindi?.data?.translated_text ||
              resHindi?.translated_text ||
              text;

            return translatedText;

          case "gu":
            const resGujarati = await TranslateGujarati({ text });

            const translatedTextGu =
              resGujarati?.data?.text ||
              resGujarati?.data?.translatedText ||
              resGujarati?.translatedText ||
              resGujarati?.data?.translated_text ||
              resGujarati?.translated_text ||
              text;

            return translatedTextGu;

          default:
            return text;
        }
      } catch (error) {
        return text;
      }
    };

    const doTranslate = async () => {
      const title = eventData?.event?._def?.title || "";
      const address = eventData?.event?._def?.extendedProps?.address || "";

      if (title) {
        const translatedTitleResult = await translateText(title);
        setTranslatedTitle(translatedTitleResult);
      } else {
        setTranslatedTitle("");
      }

      if (address) {
        const translatedAddressResult = await translateText(address);
        setTranslatedAddress(translatedAddressResult);
      } else {
        setTranslatedAddress("");
      }
    };

    const shouldTranslate = isModalOpen && eventData?.event;

    if (shouldTranslate) {
      doTranslate();
    } else {
      setTranslatedTitle("");
      setTranslatedAddress("");
    }
  }, [eventData, isModalOpen]);

  useEffect(() => {
  if (isModalOpen) {
    setRemarks({
      english: eventDataAll?.remark || "",
      gujarati: eventDataAll?.remarksGujarati || "",
      hindi: eventDataAll?.remarksHindi || "",
    });
  }
}, [isModalOpen, eventDataAll?.remark, eventDataAll?.remarksGujarati, eventDataAll?.remarksHindi]);

  const hasPermission = (rightsList, pageId, type = "view") => {
    const page = rightsList?.find((p) => p.pageid === pageId);
    return page ? page[type] === true : false;
  };

  const formatCreatedDate = (ddmmyyyy) => {
  if (!ddmmyyyy) return "N/A";
  const [day, month, year] = ddmmyyyy.split("/");
  if (!day || !month || !year) return ddmmyyyy;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

const handleOpenEventHistory = async () => {
  if (!safeEventId) {
    errorMsgPopup("Event ID missing.");
    return;
  }
  setIsEventHistoryOpen(true);
  setEventHistoryLoading(true);
  try {
    const email = getUserEmail();
    const res = await GetUserlogs("", "", "", safeEventId, userId);
    const allLogs = res?.data?.data || [];
    // Show every log tied to this event — menu planning, quotation, invoice,
    // deletion, etc. — sorted newest first.
    const sorted = Array.isArray(allLogs)
      ? [...allLogs].sort(
          (a, b) => new Date(b.createAt) - new Date(a.createAt)
        )
      : [];
    setEventHistoryLogs(sorted);
  } catch (err) {
    console.error("Failed to fetch event history:", err);
    setEventHistoryLogs([]);
  } finally {
    setEventHistoryLoading(false);
  }
};


  const handleModalClose = () => {
    setIsModalOpen(false);
    const popoverEl = document.querySelector(".fc-popover");
    if (popoverEl) {
      popoverEl.style.zIndex = "";
    }
  };

  const handleCopyWithPlanning = async () => {
    if (!safeEventId) {
      errorMsgPopup("Event ID missing.");
      return;
    }

    const result = await Swal.fire({
      title: "Copy Event",
      text: "Are you sure you want to copy this event?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#005BA8",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, copy it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const payload = {
        childUserId: 0,
        eventIds: [Number(safeEventId)], 
      };

      const response = await AssignEventsToChild(payload);

      if (response?.data?.success) {
        successMsgPopup("Event copied successfully!");
        onEventsUpdated?.();
        setIsModalOpen(false);
      } else {
        errorMsgPopup(response?.data?.msg || "Failed to copy event.");
      }
    } catch (error) {
      errorMsgPopup(error?.data?.msg || "Something went wrong.");
      console.error("Copy event error:", error);
    }
  };

  const handleStatusChange = () => {
    if (!safeEventId) {
      errorMsgPopup("Event ID missing.");
      return;
    }

    Swal.fire({
      title: "Confirm Status Change",
      text: "Are you sure you want to change the status?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, change it",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        StatusChange(safeEventId, statusId)
          .then((res) => {
            successMsgPopup("Status changed successfully!");
            onEventsUpdated?.();
          })
          .catch((error) => {
            console.error("Error changing status:", error);
            errorMsgPopup(error?.data?.msg || "Failed to change status");
          });
      }
    });
  };

const handleSaveRemarks = async (data) => {
  if (!safeEventId) {
    errorMsgPopup("Event ID missing.");
    return;
  }
  try {
    const payload = {
      eventId: Number(safeEventId),
      nameEnglish: data.english,
      nameGujarati: data.gujarati,
      nameHindi: data.hindi,
    };

    const response = await updateeventmaster(payload);

    if (response?.data?.success || response?.success) {
      setRemarks(data);
      successMsgPopup("Remarks saved successfully!");
      setIsRemarksModal(false);
      onEventsUpdated?.();
    } else {
      errorMsgPopup(response?.data?.msg || "Failed to save remarks.");
    }
  } catch (error) {
    errorMsgPopup(error?.data?.msg || "Something went wrong.");
    console.error("Error saving remarks:", error);
  }
};

  const DeleteEvent = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        const eventId = safeEventId;
        if (!eventId) {
          errorMsgPopup("Event ID missing.");
          return;
        }

       
        const customerName = eventData?.event?._def?.title || "N/A";
        const eventNo = eventDataAll?.eventNo || `#${eventId}`;
        const venueName = eventDataAll?.address || "N/A";
        const eventDate =
          eventData?.event?.start?.toLocaleDateString?.("en-CA") || "N/A";
        const statusMap = { 0: "Inquiry", 1: "Confirm", 2: "Cancel" };
        const currentStatus =
          statusMap[String(eventDataAll?.statusCode ?? statusId)] || "Unknown";

        DeleteEventMaster(eventId)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              AddLogs({
                description:
                  `Event Deleted — ` +
                  `Event No: ${eventNo} | Customer: ${customerName} | ` +
                  `Venue: ${venueName} | Date: ${eventDate} | ` +
                  `Status at deletion: ${currentStatus}`,
                eventType: "Delete",
                id: Number(eventId) || 0,
                user: getUserEmail(),
              }).catch((err) => console.error("Failed to save log:", err));

              setIsModalOpen(false);
              onEventsUpdated?.();
              Swal.fire({
                title: "Removed!",
                text: "Event has been removed successfully.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.message || "API call failed");
            }
          })
          .catch((error) => {
            error?.data?.msg && errorMsgPopup(error.data.msg);
            console.error("Error deleting event:", error);
          });
      }
    });
  };

  return (
    isModalOpen && (
      <CustomModal
        open={isModalOpen}
        onClose={handleModalClose}
        title={
          <FormattedMessage
            id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_TITLE"
            defaultMessage="Event Details"
          />
        }
        className="calendar-event-modal "
        width={1200}
      >
        <div className="p-2 grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          <div className="col-span-1 lg:col-span-1 flex flex-col gap-4 md:gap-6 mb-1">
            <div className="bg-white p-4 rounded-xl shadow">
              <p className="text-gray-600 font-larger">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_NAME"
                  defaultMessage="Client Name"
                />
              </p>
              <h3 className="font-semibold text-base mb-2">
                {translatedTitle ||
                  eventData?.event?._def?.title ||
                  "Loading..."}
              </h3>
              <p className="text-xs text-gray-400"></p>

              <p className="text-gray-600">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_MOBILE"
                  defaultMessage="Mobile No."
                />
              </p>
              <h3 className="font-semibold text-base mb-2">
                {eventDataAll?.mobile}
              </h3>

              <p className="text-gray-600">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_DATE"
                  defaultMessage="Date"
                />
              </p>
              <h3 className="font-semibold text-base mb-2">
                {eventData?.event?.start?.toLocaleDateString?.("en-CA")}
              </h3>

              <p className="text-gray-600">
  {eventDataAll?.banquetHallName ? (
  <FormattedMessage
    id="USER.DASHBOARD.EVENT_VIEW.BANQUET"
    defaultMessage="Banquet"
  />
) : (
  <FormattedMessage
    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_VENUE"
    defaultMessage="Venue"
  />
)}
</p>
<h3 className="font-semibold text-base mb-2">
  {eventDataAll?.banquetHallName
    ? eventDataAll.banquetHallName
    : translatedAddress || eventDataAll?.address || "N/A"}
</h3>

<p className="text-gray-600">
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_CREATED_DATE"
                  defaultMessage="Created Date"
                />
              </p>
              <h3 className="font-semibold text-base mb-2">
  {formatCreatedDate(eventDataAll?.createdAt)}
</h3>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-2">
  <button
  onClick={() => setIsRemarksModal(true)}
  className="w-full flex items-center justify-between bg-amber-50 hover:bg-amber-100 transition-all rounded-2xl px-2 py-1 group"
>
  <div className="flex items-center gap-3">
    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm border border-amber-100">
      <i className="ki-filled ki-note text-amber-600 text-xl"></i>
    </div>
    <div className="flex flex-col items-start">
      <span className="text-amber-600 font-semibold text-sm">
  <FormattedMessage
    id="USER.DASHBOARD.EVENT_VIEW.REMARKS"
    defaultMessage="Event Remarks"
  />
</span>

    </div>
  </div>
  <i className="ki-filled ki-right text-amber-600 text-sm group-hover:translate-x-1 transition-transform"></i>
</button>


              {/* Manager View and All Task Button — goes straight to the Manager Details page, which now hosts the All Task / Chef, Outside & Labour View picker */}
              {canAccessAssignManger && (
              <button
                onClick={() => navigate(`/event-view/assginMemberview/${safeEventId}`)}
                className="w-full flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 transition-all rounded-2xl px-2 py-1 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm border border-indigo-100">
                    <i className="ki-filled ki-profile-circle text-primary text-xl"></i>
                  </div>

                  <div className="flex flex-col items-start">
                    <span className="text-primary font-semibold text-sm">
                      <FormattedMessage
                         id="USER.DASHBOARD.EVENT_VIEW.MANAGER_VIEW_ALL_TASK"
                        defaultMessage="Manager View & Task"
                      />
                    </span>
                  </div>
                </div>


                <i className="ki-filled ki-right text-primary text-sm group-hover:translate-x-1 transition-transform"></i>
              </button>
               )} 


{ canAccessfollowup &&  (
                <button
  onClick={() => setIsFollowUpModalOpen(true)}
  className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 transition-all rounded-2xl px-2 py-1 group"
>
  <div className="flex items-center gap-3">
    <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm border border-blue-100">
      <i className="ki-filled ki-note text-blue-600 text-xl"></i>
    </div>
    <div className="flex flex-col items-start">
      <span className="text-blue-600 font-semibold text-sm">
  <FormattedMessage
    id="USER.DASHBOARD.EVENT_VIEW.REMARKS"
    defaultMessage="Event Follow Up"
  />
</span>

    </div>
  </div>
  <i className="ki-filled ki-right text-blue-600 text-sm group-hover:translate-x-1 transition-transform"></i>
</button> 
)}

              {/* Status Section */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide ">
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_STATUS"
                    defaultMessage="Status"
                  />
                </label>

                <select
                  className="w-full border border-gray-200 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  value={statusId}
                  onChange={(e) => setStatusId(e.target.value)}
                >
                  <option value="0">
                    <FormattedMessage
                      id="USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_INQUIRY"
                      defaultMessage="Inquiry"
                    />
                  </option>
                  <option value="3">
  <FormattedMessage
    id="USER.DASHBOARD.EVENT_VIEW.STATUS_TENTATIVE"
    defaultMessage="Tentative"
  />
</option>

                  <option value="1">
                    <FormattedMessage
                      id="USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_CONFIRM"
                      defaultMessage="Confirm"
                    />
                  </option>

                  <option value="2">
                    <FormattedMessage
                      id="USER.DASHBOARD.DASHBOARD_CALENDAR_FILTER_CANCEL"
                      defaultMessage="Cancel"
                    />
                  </option>
                  
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm"
                  onClick={handleStatusChange}
                >
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_SAVE_BUTTON"
                    defaultMessage="Save"
                  />
                </button>

                <button
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm"
                  onClick={() => setStatusId(eventDataAll?.statusId ?? "0")}
                >
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_CANCEL_BUTTON"
                    defaultMessage="Cancel"
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="col-span-1 lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
            {[
              {
                label: (
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_MENU_PREPARATION"
                    defaultMessage="Menu Planning"
                  />
                ),
                icon: "/media/eventviewicon/menuprep.png",
                path: `/menu-preparation/${safeEventId}`,
                onClick: () => navigate(`/menu-preparation/${safeEventId}`),
                show: permissionMenuPlanning.view,
              },
              {
                label: (
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_MENU_ALLOCATION"
                    defaultMessage="Menu Execution"
                  />
                ),
                icon: "/media/eventviewicon/menuallocation.png",
                path: `/menu-allocation/${safeEventId}`,
                onClick: () => navigate(`/menu-allocation/${safeEventId}`),
                show: permissionMenuExecution.view,
                disabled: canAccessMenuExtraFeature ? !isCompleted : false,
              },
              {
                label: (
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_RAW_MATERIAL_ALLOCATION"
                    defaultMessage="Raw Material Distribution"
                  />
                ),
                icon: "/media/eventviewicon/rawmaterial.png",
                path: `/raw-material-allocation/${safeEventId}`,
                onClick: () =>
                  navigate(`/raw-material-allocation/${safeEventId}`),
                show: permissionRawMaterial.view,
                disabled: canAccessMenuExtraFeature ? !isCompleted : false,
              },
              {
                label: (
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_LABOUR_OTHER_MANAGEMENT"
                    defaultMessage="Labour Agency Order"
                  />
                ),
                icon: "/media/eventviewicon/labour.png",
                 path: `/labour-and-other-management/${safeEventId}`,
                onClick: () =>
                  navigate(`/labour-and-other-management/${safeEventId}`),
                show: permissionLabourManagement.view,
                disabled: canAccessMenuExtraFeature ? !isCompleted : false,
              },
              {
                label: (
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_DISH_COSTING"
                    defaultMessage="Per Dish Costing"
                  />
                ),
                icon: "/media/eventviewicon/dishcost.png",
                 path: `/dish-costing/${safeEventId}`,
                onClick: () => navigate(`/dish-costing/${safeEventId}`),
                show: permissionDishCosting.view,
              },
              {
                label: (
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_MENU_REPORT"
                    defaultMessage="Events Report"
                  />
                ),
                icon: "/media/eventviewicon/menureport.png",
                path: `/allreports/${safeEventId}`,
                onClick: () => navigate(`/allreports/${safeEventId}`),
                show: permissionMenuReport.view,
                // onClick: () => {
                //   setIsSelectMenuReport(true);
                //   setMenuReportEventId(safeEventId);
                // }
              },
              {
                label: (
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_QUOTATION"
                    defaultMessage="Quotation"
                  />
                ),
                icon: "/media/eventviewicon/quotation.png",
                path: `/quotation/${safeEventId}`,
                onClick: () => navigate(`/quotation/${safeEventId}`),
                show: permissionQuotation.view,
              },
              {
                label: (
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_INVOICE"
                    defaultMessage="Invoice"
                  />
                ),
                icon: "/media/eventviewicon/invoice.png",
                path: `/add-invoice/${safeEventId}`,
                onClick: () =>
                  navigate(`/add-invoice/${safeEventId}`, {
                    state: {
                      eventId: safeEventId,
                      eventTypeId: eventTypeId,
                    },
                  }),
                show: permissionInvoice.view,
              },
              {
                label: (
                  <FormattedMessage
                    id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_INVOICE"
                    defaultMessage="Expense"
                  />
                ),
                icon: "/media/eventviewicon/icon.png",
                onClick: () =>
                  navigate(`/expense-management/${safeEventId}`, {
                    state: {
                      eventId: safeEventId,
                      eventTypeId: eventTypeId,
                    },
                  }),
                show: permissionExpense.view,
              },
            ]
              .filter((item) => item.show !== false)
              .map((item, idx) => (
  <div
    key={idx}
    onClick={item.disabled ? undefined : item.onClick}
    onContextMenu={(e) => handleItemContextMenu(e, item)}
    className={`bg-white p-4 md:p-6 rounded-xl shadow flex flex-col items-center justify-center min-h-[120px] transition
      ${item.disabled 
        ? "opacity-40 cursor-not-allowed" 
        : "cursor-pointer hover:shadow-md"
      }`}
  >
    <div className="text-blue-600 text-3xl mb-2">
      <img
        src={toAbsoluteUrl(item.icon)}
        alt={item.label}
        className="w-8 h-8 md:w-10 md:h-10"
      />
    </div>
    <p className="font-large text-gray font-bold text-center">{item.label}</p>
  </div>
))}
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-6 mt-3 px-2">
          {permissions.edit && (
            <Link to={`/edit-event/${safeEventId}`}>
              <button className="bg-primary text-white w-full sm:w-[250px] md:w-[300px] h-12 rounded-md font-medium">
                <i className="ki-filled ki-notepad-edit me-1"></i>
                <FormattedMessage
                  id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_EDIT_EVENT_BUTTON"
                  defaultMessage="Edit Event"
                />
              </button>
            </Link>
          )}

          {/* {permissions.add && (
            <button
              className="bg-success text-white w-full sm:w-[250px] md:w-[300px] h-12 rounded-md font-medium"
              onClick={() => navigate(`/edit-event/${safeEventId}/copy`)}
            >
              <i className="ki-filled ki-copy me-1"></i>{" "}
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_COPY_EVENT_BUTTON"
                defaultMessage="Copy Event"
              />
            </button>
          )} */}

          <button
  className="bg-gray-700 text-white w-full sm:w-[250px] md:w-[300px] h-12 rounded-md font-medium"
  onClick={handleOpenEventHistory}
>
  <i className="ki-filled ki-time"></i>{" "}
  <FormattedMessage
    id="USER.DASHBOARD.EVENT_VIEW.HISTORY"
    defaultMessage="Event History"
  />
</button>



          {permissions.add && (
            <button
              className="bg-success text-white w-full sm:w-[250px] md:w-[300px] h-12 rounded-md font-medium"
              onClick={handleCopyWithPlanning}
            >
              <i className="ki-filled ki-copy me-1"></i>{" "}
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_COPY_EVENT_PLANNING_BUTTON"
                defaultMessage="Copy Event"
              />
            </button>
          )}
          {permissionCrockeryCutlery.view && (
            <button
              onClick={() =>
                navigate("/configuration/CrockeryConfigurationnew", {
                  state: {
                    eventId: safeEventId ? Number(safeEventId) : null,
                    functionId: eventTypeId,
                  },
                })
              }
              className="bg-primary text-white w-full sm:w-[250px] md:w-[300px] h-12 rounded-md font-medium"
            >
              <FormattedMessage
  id="USER.DASHBOARD.EVENT_VIEW.CROCKERY_CONFIGURATION"
  defaultMessage="Crockery Configuration"
/>
            </button>
          )}

     {canAccessBanquet && permissionRoomDetails.view && (
  <button
    className="bg-[#0891b2] text-white w-full sm:w-[250px] md:w-[300px] h-12 rounded-md font-medium"
    onClick={() => setIsRoomModal(true)}
  >
    <i className="ki-filled ki-home me-1"></i>
    <FormattedMessage
  id="USER.DASHBOARD.EVENT_VIEW.ROOM_DETAILS"
  defaultMessage="Room Details"
/>
  </button>

     )}

     {permissions.edit && canAccessAssignManger && (
  <button
    className="bg-[#4F46E5] text-white w-full sm:w-[250px] md:w-[300px] h-12 rounded-md font-medium"
    onClick={() => navigate(`/event-view/eventassignmember/${safeEventId}`)}
  >
    <i className="ki-filled ki-people me-1"></i>{" "}
    <FormattedMessage
      id="USER.DASHBOARD.EVENT_VIEW.ASSIGN_MANAGER"
      defaultMessage="Assign Manager"
    />
  </button>
)}
          
          {permissions.delete && (
            <button
              className="bg-danger text-white w-full sm:w-[250px] md:w-[300px] h-12 rounded-md font-medium"
              onClick={DeleteEvent}
            >
              <i className="ki-filled ki-trash me-1"></i>{" "}
              <FormattedMessage
                id="USER.DASHBOARD.DASHBOARD_CALENDAR_EVENT_VIEW_DETAILS_DELETE_EVENT_BUTTON"
                defaultMessage="Delete Event"
              />
            </button>
          )}
        </div>
        <SelectMenureport
          eventId={safeEventId}
          isSelectMenureport={isSelectMenuReport}
          setIsSelectMenuReport={setIsSelectMenuReport}
          onConfirm={() => {
            setIsSelectMenuReport(false);
            setMenuReportEventId(safeEventId);
            setIsMenuReport(true);
          }}
        />

        <MenuReport
          eventFunctionId={eventFunctionId}
          isModalOpen={isMenuReport}
          setIsModalOpen={setIsMenuReport}
          eventId={menuReportEventId}
        />

       <FollowUpTrackModal
  isOpen={isFollowUpModalOpen}
  onClose={() => setIsFollowUpModalOpen(false)}
  eventId={safeEventId}
  userId={localStorage.getItem("userId")}
  canAdd={permFollowUp.add}
  canEdit={permFollowUp.edit}
  canDelete={permFollowUp.delete}

  eventInfo={{
    customerName: translatedTitle || eventData?.event?._def?.title || "",
    mobile: eventDataAll?.mobile || "",
    eventName: eventDataAll?.banquetHallName
      ? eventDataAll.banquetHallName
      : translatedAddress || eventDataAll?.address || "",
    eventDate: eventData?.event?.start?.toLocaleDateString?.("en-CA") || "",
  }}
/>

        <RoomDetailsModal
  isOpen={isRoomModal}
  onClose={() => setIsRoomModal(false)}
  eventRooms={eventDataAll?.eventRooms || []}
/>
<EventNotes
  isOpen={isRemarksModal}
  onClose={() => setIsRemarksModal(false)}
  notes={remarks}
  onSave={handleSaveRemarks}
  itemId={safeEventId}
/>


          {isEventHistoryOpen && (
  <>
    <div
      className="fixed inset-0 bg-black/40 z-50"
      onClick={() => setIsEventHistoryOpen(false)}
    />
    <div
      className="fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl shadow-2xl custom-scrollbar"
      style={{ transform: "translate(-50%,-50%)", width: "min(600px,95vw)", maxHeight: "80vh" }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-800">
          Event History
        </h3>
        <button
          onClick={() => setIsEventHistoryOpen(false)}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100"
        >
          ✕
        </button>
      </div>

      <div className="px-6 py-4 overflow-y-auto" style={{ maxHeight: "60vh" }}>
        {eventHistoryLoading ? (
          <div className="flex justify-center items-center py-10">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : eventHistoryLogs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-10">
            No history found for this event.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {eventHistoryLogs.map((log) => {
              const isError = log.eventType?.includes("Error");
              const isLock = log.eventType?.includes("Lock");
              const isDelete = log.eventType?.toLowerCase().includes("delete");

              // Derive a readable label + color from the raw eventType string
              // (e.g. "MenuQuotation_Save" -> "Menu Quotation", "Delete" -> "Delete")
              const moduleLabel = log.eventType
                ?.replace(/_Save_Error|_Save|_Lock_Error|_Lock/g, "")
                ?.replace(/([a-z])([A-Z])/g, "$1 $2") || "Activity";

              const badgeColor = isError
                ? "bg-red-100 text-red-700"
                : isDelete
                  ? "bg-red-100 text-red-700"
                  : isLock
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700";

              return (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-3 bg-gray-50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                      {moduleLabel}
                      {isError ? " Failed" : ""}
                    </span>
                    <span className="text-xs text-gray-500">{log.createAt}</span>
                  </div>
                  {log.user && (
                    <p className="text-xs text-gray-500 mb-1">By: {log.user}</p>
                  )}
                  <div className="text-sm text-gray-700 whitespace-pre-line">
                    {log.description}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
        <button
          className="h-9 px-4 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-500 hover:text-gray-700"
          onClick={() => setIsEventHistoryOpen(false)}
        >
          Close
        </button>
      </div>
    </div>
  </>
)}

{contextMenu && (
  <div
    className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[180px]"
    style={{ top: contextMenu.y, left: contextMenu.x }}
    onClick={(e) => e.stopPropagation()}
  >
    <button
      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
      onClick={handleOpenInNewTab}
    >
      <i className="ki-filled ki-exit-right-corner text-primary"></i>
      Open in New Tab
    </button>
  </div>
)}

      </CustomModal>
    )
  );
};

export default EventViewModal;