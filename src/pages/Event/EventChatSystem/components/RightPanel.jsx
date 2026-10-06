import React from "react";

export default function RightPanel({
  activePanel, // 'participants' | 'pinned'
  onClose,
  participants = [],
  pinnedMessages = [],
  onJumpToMessage,
  onUnpinMessage,
}) {
  if (!activePanel) return null;

  return (
    <aside className="echat-right-panel">
      {/* Panel Header */}
      <div className="echat-right-header">
        <h4>{activePanel === "participants" ? "Team Participants" : "Pinned Messages"}</h4>
        <button
          type="button"
          className="echat-right-close-btn"
          onClick={onClose}
          title="Close panel"
        >
          ✕
        </button>
      </div>

      {/* Participants View */}
      {activePanel === "participants" && (
        <div className="echat-panel-content">
          <div className="echat-panel-section-title">
            Members ({participants.length})
          </div>

          {participants.length === 0 ? (
            <div className="echat-panel-empty">No participants found</div>
          ) : (
            <div className="echat-participants-list">
              {participants.map((person) => {
                const initial = (person.userName || "U").trim().charAt(0).toUpperCase();

                return (
                  <div key={person.userId} className="echat-participant-row">
                    <div className="echat-participant-avatar">
                      {initial}
                      <span
                        className={`echat-online-indicator ${
                          person.online ? "echat-online-true" : "echat-online-false"
                        }`}
                        title={person.online ? "Online" : "Offline"}
                      />
                    </div>

                    <div className="echat-participant-details">
                      <div className="echat-participant-name-row">
                        <span className="echat-participant-name">{person.userName}</span>
                        {person.admin && (
                          <span className="echat-admin-badge">Admin</span>
                        )}
                      </div>
                      <div className="echat-participant-meta">
                        {person.userCode && <span>#{person.userCode}</span>}
                        {person.email && <span> • {person.email}</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pinned Messages View */}
      {activePanel === "pinned" && (
        <div className="echat-panel-content">
          <div className="echat-panel-section-title">
            Pinned ({pinnedMessages.length})
          </div>

          {pinnedMessages.length === 0 ? (
            <div className="echat-panel-empty">No pinned messages yet</div>
          ) : (
            <div className="echat-pinned-list">
              {pinnedMessages.map((msg) => (
                <div key={msg.id} className="echat-pinned-item">
                  <div className="echat-pinned-item-header">
                    <span className="echat-pinned-sender">{msg.senderName}</span>
                    <button
                      type="button"
                      className="echat-unpin-btn"
                      onClick={() => onUnpinMessage(msg.id)}
                      title="Unpin message"
                    >
                      Unpin
                    </button>
                  </div>
                  <p
                    className="echat-pinned-text"
                    onClick={() => onJumpToMessage(msg.id)}
                    title="Click to jump to message in chat"
                  >
                    {msg.message}
                  </p>
                  <span className="echat-pinned-date">
                    {msg.createdAt
                      ? new Date(msg.createdAt).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
