import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Container } from "@/components/container";
import EventChat from "./components/EventChat";
import EventChatModal from "./components/EventChatModal";

/**
 * Full Page Event Chat System Module
 * Can be accessed via:
 * - /event-chat (All events switcher)
 * - /event-chat/:eventId (Directly locked to a specific event)
 */
export function EventChatSystem() {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const activeEventId =
    eventId || location.state?.eventId || location.state?.id || null;

  return (
    <Container>
      <div className="flex flex-col gap-4 py-4 min-h-[calc(100vh-100px)]">
        {/* Page Top Bar */}
        <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition"
              title="Go back"
            >
              <i className="ki-filled ki-arrow-left text-lg"></i>
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                <span>Event Team Chat</span>
                {activeEventId && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                    Event #{activeEventId}
                  </span>
                )}
              </h2>
              <span className="text-xs text-slate-500">
                Live communication, discussions & updates for event teams
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/calendar")}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition"
            >
              <i className="ki-filled ki-calendar text-sm"></i>
              <span className="hidden sm:inline">Calendar</span>
            </button>
          </div>
        </div>

        {/* Chat System Container */}
        <div className="flex-1 w-full bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 min-h-[620px] h-[calc(100vh-190px)]">
          <EventChat
            eventId={activeEventId ? Number(activeEventId) : undefined}
            hideSidebar={false}
          />
        </div>
      </div>
    </Container>
  );
}

/**
 * Standalone embedded component for modals/tabs
 */
export function SingleEventChatExample({ currentEventId }) {
  return (
    <div
      style={{
        height: "700px",
        width: "100%",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <EventChat eventId={currentEventId || 101} hideSidebar={true} />
    </div>
  );
}

export { EventChat, EventChatModal };
export default EventChatSystem;
