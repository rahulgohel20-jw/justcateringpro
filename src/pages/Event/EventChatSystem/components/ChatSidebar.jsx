import React, { useState } from "react";

export default function ChatSidebar({
  events = [],
  selectedEventId,
  onSelectEvent,
  unreadSummary = {},
  isOpen = true,
  onCloseMobile,
}) {
  const [filter, setFilter] = useState("");

  const filteredEvents = events.filter((ev) => {
    const term = filter.toLowerCase();
    return (
      (ev.name && ev.name.toLowerCase().includes(term)) ||
      (ev.eventNo && ev.eventNo.toLowerCase().includes(term))
    );
  });

  return (
    <aside className={`echat-sidebar ${isOpen ? "echat-sidebar-open" : ""}`}>
      {/* Brand Header */}
      <div className="echat-sidebar-header">
        <div className="echat-brand">
          <span className="echat-brand-icon">💬</span>
          <span className="echat-brand-title">Event Chat</span>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            className="echat-sidebar-close-btn"
            onClick={onCloseMobile}
            title="Close sidebar"
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter / Search events */}
      <div className="echat-sidebar-search-wrap">
        <input
          type="text"
          className="echat-sidebar-search"
          placeholder="Search events or ID..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Events List */}
      <div className="echat-event-list">
        {filteredEvents.length === 0 ? (
          <div className="echat-event-empty">No events found</div>
        ) : (
          filteredEvents.map((evt) => {
            const isSelected = evt.id === selectedEventId;
            const unread =
              typeof unreadSummary[evt.id] === "number"
                ? unreadSummary[evt.id]
                : evt.unread || 0;

            return (
              <button
                key={evt.id}
                type="button"
                className={`echat-event-card ${isSelected ? "echat-event-active" : ""}`}
                onClick={() => {
                  onSelectEvent(evt);
                  if (onCloseMobile) onCloseMobile();
                }}
              >
                <div className="echat-event-card-info">
                  <span className="echat-event-card-name">{evt.name}</span>
                  <span className="echat-event-card-code">{evt.eventNo}</span>
                </div>

                {unread > 0 && (
                  <span className="echat-unread-badge" title={`${unread} unread messages`}>
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
