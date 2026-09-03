import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import CalendarComponent from "@/components/CalendarComponent";
import { FormattedMessage, useIntl } from "react-intl";
import { GetAllFollowUp } from "@/services/apiServices";
import { usePermission } from "../../../hooks/usePermission";

import dayjs from "dayjs";

const statusColor = (isDone) => (isDone ? "rgba(40, 167, 69, 1)" : "#3788d8");

const FollowUpCalendarPage = () => {
   const permissions = usePermission("followup");
  const intl = useIntl();
  const [data, setData] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const Id = localStorage.getItem("userId");

  const fetchFollowUps = () => {
  setLoading(true);
  GetAllFollowUp(Id)
    .then((res) => {
      const list =
        res?.data?.data?.["Event Followup Details"] ||
        res?.data?.data ||
        res?.data ||
        [];

      const listArr = Array.isArray(list) ? list : [];
      setAllItems(listArr); // ← keep the full, ungrouped list around

      const groupsMap = listArr.reduce((acc, item) => {
        const parsed = item.followupDate
          ? dayjs(item.followupDate, "DD/MM/YYYY", true)
          : null;
        if (!parsed || !parsed.isValid()) return acc;

        const dateKey = parsed.format("YYYY-MM-DD");
        const key = `${item.eventId}_${dateKey}`;

        if (!acc[key]) {
          acc[key] = {
            key,
            date: dateKey,
            eventName: item.eventName,
            managerName: item.managerName,
            items: [],
          };
        }
        acc[key].items.push(item);
        return acc;
      }, {});

      const mapped = Object.values(groupsMap).map((g) => {
        const allDone = g.items.every((i) => i.isDone);
        return {
          id: g.key,
          title: `${g.eventName || ""} - ${g.managerName || ""}${
            g.items.length > 1 ? ` (${g.items.length})` : ""
          }`.trim(),
          start: g.date,
          end: g.date,
          allDay: true,
          color: statusColor(allDone),
          extendedProps: {
            eventId: g.items[0]?.eventId, // ← add this
            raw: g.items,
          },
        };
      });

      setData(mapped);
    })
    .catch((err) => {
      console.error("Failed to fetch follow-ups:", err);
      setData([]);
      setAllItems([]);
    })
    .finally(() => setLoading(false));
};

  useEffect(() => {
    if (Id) fetchFollowUps();
  }, [Id]);

  const openFollowUp = (clickInfo) => {
  const eventId = clickInfo?.event?.extendedProps?.eventId;
  if (!eventId) return;

  const items = allItems.filter((i) => i.eventId === eventId);
  if (!items.length) return;

  // sort chronologically so 26th shows before 27th, etc.
  const sorted = [...items].sort((a, b) =>
    dayjs(a.followupDate, "DD/MM/YYYY").diff(dayjs(b.followupDate, "DD/MM/YYYY")),
  );

  setSelectedGroup(sorted);
  setIsModalOpen(true);
};

  return (
    <Fragment>
      <Container>
        <div className="calendar-container bg-white rounded-lg shadow-sm md:p-2">
          <CalendarComponent
            data={data}
            openEvent={openFollowUp}
            handleDateClick={() => {}}
            handleMonthChange={() => {}}
            lang={localStorage.getItem("lang") || "en"}
            loading={loading}
          />
        </div>
      </Container>

      {isModalOpen && selectedGroup && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{ background: "rgba(0,0,0,.45)", backdropFilter: "blur(4px)" }}
            onClick={() => setIsModalOpen(false)}
          />
          <div
            className="fixed top-1/2 left-1/2 z-50 bg-white rounded-2xl p-6 max-h-[80vh] overflow-y-auto"
            style={{ transform: "translate(-50%,-50%)", width: "min(460px,95vw)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-base">{selectedGroup[0]?.eventName}</p>
              <span className="text-xs font-medium text-gray-400">
                {selectedGroup.length}{" "}
                <FormattedMessage id="USER.FOLLOWUP.COUNT" defaultMessage="follow-up(s)" />
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {selectedGroup.map((fu, idx) => (
                <div key={fu.id ?? idx} className="border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800 text-sm">{fu.managerName}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        fu.isDone
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {fu.isDone ? (
                        <FormattedMessage id="USER.FOLLOWUP.DONE" defaultMessage="Done" />
                      ) : (
                        <FormattedMessage id="USER.FOLLOWUP.PENDING" defaultMessage="Pending" />
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        <FormattedMessage id="USER.FOLLOWUP.FOLLOW_DATE" defaultMessage="Follow Date" />
                      </span>
                      <span className="font-medium text-gray-800">{fu.followupDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        <FormattedMessage id="USER.FOLLOWUP.CREATED_AT_LABEL" defaultMessage="Created" />
                      </span>
                      <span className="font-medium text-gray-800">{fu.createdAt}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">
                        <FormattedMessage id="USER.FOLLOWUP.DESCRIPTION_LABEL" defaultMessage="Description" />
                      </span>
                      <span className="text-gray-800">{fu.description}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end w-full">
              <button
                className="flex btn btn-light text-sm mt-4"
                onClick={() => setIsModalOpen(false)}
              >
                <FormattedMessage id="USER.FOLLOWUP.CLOSE_BTN" defaultMessage="Close" />
              </button>
            </div>
          </div>
        </>
      )}
    </Fragment>
  );
};

export default FollowUpCalendarPage;