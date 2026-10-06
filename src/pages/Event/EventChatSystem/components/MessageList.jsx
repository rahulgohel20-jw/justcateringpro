import React, { useEffect, useRef } from "react";
import MessageItem from "./MessageItem";

function formatDateSeparator(dateString) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) {
    return "Today";
  } else if (d.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function MessageList({
  messages,
  currentUserId,
  loading,
  hasMore,
  onLoadMore,
  onReply,
  onStartEdit,
  onDelete,
  onAddReaction,
  onRemoveReaction,
  onTogglePin,
}) {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const prevMessagesLength = useRef(messages.length);

  // Scroll to bottom on initial load or when new message appended
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessagesLength.current = messages.length;
  }, [messages.length]);

  // Jump to specific message by ID and briefly flash highlight
  const handleJumpToMessage = (messageId) => {
    const el = document.getElementById(`echat-msg-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("echat-highlight-flash");
      setTimeout(() => {
        el.classList.remove("echat-highlight-flash");
      }, 2000);
    }
  };

  // Group messages by calendar date
  let lastDate = "";

  return (
    <div className="echat-message-list-container" ref={containerRef}>
      {/* Load More older messages button */}
      {hasMore && (
        <div className="echat-load-more-wrap">
          <button
            type="button"
            className="echat-load-more-btn"
            onClick={onLoadMore}
            disabled={loading}
          >
            {loading ? "Loading older messages..." : "↑ Load older messages"}
          </button>
        </div>
      )}

      {/* Messages */}
      {messages.length === 0 && !loading ? (
        <div className="echat-empty-state">
          <div className="echat-empty-icon">💬</div>
          <h4>No messages yet</h4>
          <p>Be the first one to say hello to the event team!</p>
        </div>
      ) : (
        messages.map((msg) => {
          const dateStr = formatDateSeparator(msg.createdAt);
          const showSeparator = dateStr && dateStr !== lastDate;
          if (showSeparator) {
            lastDate = dateStr;
          }

          return (
            <React.Fragment key={msg.id}>
              {showSeparator && (
                <div className="echat-date-separator">
                  <span>{dateStr}</span>
                </div>
              )}
              <MessageItem
                key={msg.id}
                message={msg}
                currentUserId={currentUserId}
                onReply={onReply}
                onStartEdit={onStartEdit}
                onDelete={onDelete}
                onAddReaction={onAddReaction}
                onRemoveReaction={onRemoveReaction}
                onTogglePin={onTogglePin}
                onJumpToMessage={handleJumpToMessage}
              />
            </React.Fragment>
          );
        })
      )}

      <div ref={bottomRef} />
    </div>
  );
}
