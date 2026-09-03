import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { columns, defaultData } from "./constant";
import AddEventType from "@/partials/modals/add-event-type/AddEventType";
import {
  GetEventType,
  DeleteEventType,
  SearchEventType,
} from "@/services/apiServices";
import Swal from "sweetalert2";
import { FormattedMessage } from "react-intl";
import { useIntl } from "react-intl";
import { usePermission } from "../../../hooks/usePermission";

const EventTypeMaster = () => {
  const permissions = usePermission("Events");
  const [isEventTypeModalOpen, setIsEventTypeModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const intl = useIntl();

  let Id = localStorage.getItem("userId");

  // 🔥 Load language
  const lang = localStorage.getItem("lang") || "en";

  // 🔥 Helper to get event type name based on language
  const getEventTypeByLang = (event) => {
    if (!event) return "-";

    switch (lang) {
      case "hi":
        return event.nameHindi || event.nameEnglish || "-";
      case "gu":
        return event.nameGujarati || event.nameEnglish || "-";
      default:
        return event.nameEnglish || "-";
    }
  };

  const formatEventData = (events) => {
    return events.map((event, index) => ({
      sr_no: index + 1,
      event_type: getEventTypeByLang(event),
      eventid: event.id,
      // Store all language versions for editing
      nameEnglish: event.nameEnglish,
      nameHindi: event.nameHindi,
      nameGujarati: event.nameGujarati,
    }));
  };

  const FetchEventType = () => {
    GetEventType(Id)
      .then((res) => {
        if (res?.data?.data?.["EventTypes Details"]) {
          const formatted = formatEventData(
            res.data.data["EventTypes Details"],
          );
          setTableData(formatted);
        } else {
          setTableData([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching event type:", error);
        setTableData([]);
      });
  };

  // ✅ Initial load - fetch all (re-fetch when language changes)
  useEffect(() => {
    FetchEventType();
  }, [lang]); // 🔥 Re-fetch when language changes

  // ✅ Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!searchQuery.trim()) {
        FetchEventType();
        return;
      }

      SearchEventType(searchQuery, Id)
        .then(({ data: { data } }) => {
          if (data && data["EventTypes Details"]) {
            const formatted = formatEventData(data["EventTypes Details"]);
            setTableData(formatted);
          } else {
            setTableData([]);
          }
        })
        .catch((error) => {
          console.error("Error searching event type:", error);
          setTableData([]);
        });
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, lang]); // 🔥 Also update on language change

  const DeleteEventtype = (eventid) => {
    Swal.fire({
      title: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_TITLE",
        defaultMessage: "Are you sure?",
      }),
      text: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_TEXT",
        defaultMessage: "You won't be able to revert this!",
      }),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: intl.formatMessage({
        id: "USER.MASTER.DELETE_CONFIRM_BUTTON",
        defaultMessage: "Yes, delete it!",
      }),
      cancelButtonText: intl.formatMessage({
        id: "USER.MASTER.CANCEL_BUTTON",
        defaultMessage: "Cancel",
      }),
    }).then((result) => {
      if (result.isConfirmed) {
        DeleteEventType(eventid)
          .then((response) => {
            if (
              response &&
              (response.success || response.data.success === true)
            ) {
              FetchEventType();
              Swal.fire({
                title: intl.formatMessage({
                  id: "USER.MASTER.DELETE_SUCCESS_TITLE",
                  defaultMessage: "Removed!",
                }),
                text: intl.formatMessage({
                  id: "USER.MASTER.EVENT_TYPE_DELETE_SUCCESS",
                  defaultMessage: "Event type has been removed successfully.",
                }),
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
              });
            } else {
              throw new Error(response?.message || "API call failed");
            }
          })
          .catch((error) => {
            console.error("Error deleting Event type:", error);
          });
      }
    });
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setIsEventTypeModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEventTypeModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className=" pb-2 mb-3">
          <h1 className="text-xl text-gray-900">
            <FormattedMessage
              id="USER.MASTER.EVENT_TYPE_MASTER"
              defaultMessage="Event Master"
            />
          </h1>
        </div>

        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className={`flex flex-wrap items-center gap-2`}>
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder={intl.formatMessage({
                  id: "USER.MASTER.SEARCH_EVENT_TYPE",
                  defaultMessage: "Search Event Type",
                })}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          {permissions.add && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSelectedEvent(null);
                  setIsEventTypeModalOpen(true);
                }}
                title={intl.formatMessage({
                  id: "USER.MASTER.ADD_EVENT_TYPE",
                  defaultMessage: "Add Event Type",
                })}
              >
                <i className="ki-filled ki-plus"></i>{" "}
                <FormattedMessage
                  id="USER.MASTER.ADD_CONTACT_CATEGORY"
                  defaultMessage="Create New"
                />
              </button>
            </div>
          )}
        </div>

        <AddEventType
          isModalOpen={isEventTypeModalOpen}
          setIsModalOpen={handleModalClose}
          refreshData={FetchEventType}
          selectedEvent={selectedEvent}
        />

        <TableComponent
          columns={columns(handleEdit, DeleteEventtype, permissions)}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default EventTypeMaster;
