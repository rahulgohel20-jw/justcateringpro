import React, { useState } from "react";
import ReactionPicker, { EMOJI_MAP } from "./ReactionPicker";

export default function MessageItem({
  message,
  currentUserId,
  onReply,
  onStartEdit,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  onTogglePin,
  onJumpToMessage,
}) {
  const [showPicker, setShowPicker] = useState(false);

  const isOwn = Boolean(
    message.isOwnMessage ||
      (currentUserId &&
        (String(message.senderId) === String(currentUserId) ||
          String(message.userId) === String(currentUserId)))
  );
  const isSystem = !!message.isSystemMessage;

  // Format time
  const timeFormatted = message.createdAt
    ? new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  if (isSystem) {
    return (
      <div className="echat-msg-system">
        <span>{message.message}</span>
      </div>
    );
  }

  // Get sender initial
  const initial = (message.senderName || "U").trim().charAt(0).toUpperCase();

  // Reaction toggle handler
  const handleReactionClick = (reactionType) => {
    const hasReacted =
      message.myReactions && message.myReactions.includes(reactionType);
    if (hasReacted) {
      onRemoveReaction(message.id, reactionType);
    } else {
      onAddReaction(message.id, reactionType);
    }
  };

  return (
    <div
      id={`echat-msg-${message.id}`}
      className={`echat-msg-row ${isOwn ? "echat-own" : ""}`}
    >
      {/* Avatar */}
      <div className="echat-avatar" title={message.senderName || "User"}>
        {initial}
      </div>

      <div className="echat-msg-bubble-wrap">
        {/* Sender Info Header */}
        <div className="echat-msg-info">
          <span className="echat-sender-name">
            {message.senderName || "User"}
          </span>
          {message.senderCode && (
            <span className="echat-sender-code">#{message.senderCode}</span>
          )}
          <span className="echat-timestamp">{timeFormatted}</span>
          {message.isEdited && (
            <span className="echat-edited-badge">edited</span>
          )}
          {message.pinned && (
            <span className="echat-pinned-badge" title="Pinned message">
              📌 Pinned
            </span>
          )}
        </div>

        {/* Quoted Parent Reply Banner */}
        {message.parentMessageId && (
          <div
            className="echat-quoted-parent"
            onClick={() => onJumpToMessage(message.parentMessageId)}
            title="Click to jump to parent message"
          >
            <div className="echat-quote-bar" />
            <div className="echat-quote-content">
              <span className="echat-quote-label">Replying to message</span>
              <p className="echat-quote-text">
                {message.parentMessagePreview || "Original message"}
              </p>
            </div>
          </div>
        )}

        {/* Message Bubble Content */}
        <div className="echat-msg-bubble">
          <div className="echat-text">{message.message}</div>

          {/* Attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="echat-attachments-list">
              {message.attachments.map((att) => (
                <div key={att.id} className="echat-attachment-chip">
                  📎 {att.fileName || "Attachment"}
                </div>
              ))}
            </div>
          )}

          {/* Reactions Bar (counts display) */}
          {message.reactionCounts &&
            Object.keys(message.reactionCounts).length > 0 && (
              <div className="echat-reactions-row">
                {Object.entries(message.reactionCounts).map(([type, count]) => {
                  const hasReacted =
                    message.myReactions &&
                    message.myReactions.includes(type);
                  return (
                    <button
                      key={type}
                      type="button"
                      className={`echat-reaction-chip ${
                        hasReacted ? "echat-active-reaction" : ""
                      }`}
                      onClick={() => handleReactionClick(type)}
                      title={`Reacted by ${count} people`}
                    >
                      <span>{EMOJI_MAP[type] || "👍"}</span>
                      <span className="echat-chip-count">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
        </div>

        {/* Floating Quick Action Bar */}
        <div className="echat-hover-actions">
          {/* Reaction Picker Trigger */}
          <div className="echat-picker-container">
            <button
              type="button"
              className="echat-action-icon"
              title="Add reaction"
              onClick={() => setShowPicker(!showPicker)}
            >
              😊
            </button>
            {showPicker && (
              <ReactionPicker
                onSelect={(type) => {
                  handleReactionClick(type);
                  setShowPicker(false);
                }}
                onClose={() => setShowPicker(false)}
              />
            )}
          </div>

          {/* Reply in thread / quote */}
          <button
            type="button"
            className="echat-action-icon"
            title="Reply"
            onClick={() => onReply(message)}
          >
            ↩️
          </button>

          {/* Pin / Unpin */}
          <button
            type="button"
            className={`echat-action-icon ${message.pinned ? "echat-pinned-active" : ""}`}
            title={message.pinned ? "Unpin message" : "Pin message"}
            onClick={() => onTogglePin(message)}
          >
            📌
          </button>

          {/* Edit (Own message only) */}
          {isOwn && (
            <button
              type="button"
              className="echat-action-icon"
              title="Edit message"
              onClick={() => onStartEdit(message)}
            >
              ✏️
            </button>
          )}

          {/* Delete (Own message only) */}
          {isOwn && (
            <button
              type="button"
              className="echat-action-icon echat-action-delete"
              title="Delete message"
              onClick={() => {
                if (window.confirm("Are you sure you want to delete this message?")) {
                  onDelete(message.id);
                }
              }}
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
