import React from "react";
import { useNavigate } from "react-router-dom";
import EventChat from "./EventChat";

export default function EventChatModal({
  isOpen,
  onClose,
  eventId,
  eventName = "",
  eventNo = "",
}) {
  const navigate = useNavigate();

  if (!isOpen || !eventId) return null;

  const handleOpenFullPage = () => {
    onClose();
    navigate(`/event-chat/${eventId}`);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col w-full max-w-5xl h-[88vh] max-h-[820px] min-h-[500px] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
              <i className="ki-filled ki-messages text-xl"></i>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-800 leading-tight">
                  {eventName || `Event #${eventId}`}
                </h3>
                {eventNo && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {eventNo}
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-500">
                Event Team Communication & Real-time Chat
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenFullPage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Open full page view"
            >
              <i className="ki-filled ki-maximize text-sm"></i>
              <span className="hidden sm:inline">Full Page</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition text-lg"
              title="Close chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body: Embedded Event Chat */}
        <div className="flex-1 w-full h-full min-h-0 overflow-hidden relative">
          <EventChat eventId={eventId} hideSidebar={true} />
        </div>
      </div>
    </div>
  );
}
