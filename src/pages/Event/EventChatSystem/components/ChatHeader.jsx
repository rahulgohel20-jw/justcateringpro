import React from "react";

export default function ChatHeader({
  event,
  socketStatus,
  onOpenSearch,
  onToggleParticipants,
  onTogglePinned,
  onRefresh,
  activePanel, // 'participants' | 'pinned' | null
  pinnedCount = 0,
  participantsCount = 0,
  onToggleMobileSidebar,
}) {
  const getStatusBadge = () => {
    switch (socketStatus) {
      case "connected":
        return <span className="echat-status echat-status-connected" title="Real-time connected">● Live</span>;
      case "connecting":
        return <span className="echat-status echat-status-connecting" title="Connecting...">○ Connecting</span>;
      case "error":
      case "disconnected":
      default:
        return <span className="echat-status echat-status-disconnected" title="Disconnected">○ Offline</span>;
    }
  };

  return (
    <header className="echat-header">
      <div className="echat-header-left">
        {onToggleMobileSidebar && (
          <button
            type="button"
            className="echat-header-btn echat-mobile-toggle"
            onClick={onToggleMobileSidebar}
            title="Toggle events sidebar"
          >
            ☰
          </button>
        )}
        <div className="echat-header-titles">
          <div className="echat-header-main-title">
            <h3>{event ? event.name : "Select an Event"}</h3>
            {getStatusBadge()}
          </div>
          {event && (
            <span className="echat-header-subtitle">
              {event.eventNo} • Event Team Communication
            </span>
          )}
        </div>
      </div>

      <div className="echat-header-actions">
        {/* Search */}
        <button
          type="button"
          className="echat-header-btn"
          onClick={onOpenSearch}
          title="Search messages"
        >
          🔍 Search
        </button>

        {/* Pinned Messages */}
        <button
          type="button"
          className={`echat-header-btn ${activePanel === "pinned" ? "echat-header-btn-active" : ""}`}
          onClick={onTogglePinned}
          title="View pinned messages"
        >
          📌 Pins {pinnedCount > 0 ? `(${pinnedCount})` : ""}
        </button>

        {/* Participants */}
        <button
          type="button"
          className={`echat-header-btn ${activePanel === "participants" ? "echat-header-btn-active" : ""}`}
          onClick={onToggleParticipants}
          title="View participants"
        >
          👥 Team {participantsCount > 0 ? `(${participantsCount})` : ""}
        </button>

        {/* Refresh */}
        <button
          type="button"
          className="echat-header-btn echat-header-btn-icon"
          onClick={onRefresh}
          title="Refresh messages"
        >
          🔄
        </button>
      </div>
    </header>
  );
}
