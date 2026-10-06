import React, { useState, useEffect, useRef } from "react";

export default function MessageComposer({
  onSendMessage,
  onSaveEdit,
  replyingTo,
  onCancelReply,
  editingMessage,
  onCancelEdit,
  disabled = false,
}) {
  const [text, setText] = useState("");
  const textareaRef = useRef(null);

  // Sync text when entering or leaving edit mode
  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.message || "");
      textareaRef.current?.focus();
    } else if (replyingTo) {
      textareaRef.current?.focus();
    }
  }, [editingMessage, replyingTo]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const cleanText = text.trim();
    if (!cleanText || disabled) return;

    if (editingMessage) {
      onSaveEdit(editingMessage.id, cleanText);
      setText("");
    } else {
      onSendMessage(cleanText, replyingTo ? replyingTo.id : null);
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Escape") {
      if (editingMessage) onCancelEdit();
      if (replyingTo) onCancelReply();
    }
  };

  return (
    <footer className="echat-composer-container">
      {/* Replying Banner */}
      {replyingTo && !editingMessage && (
        <div className="echat-banner echat-reply-banner">
          <div className="echat-banner-info">
            <span className="echat-banner-tag">Replying to {replyingTo.senderName || "User"}</span>
            <span className="echat-banner-snippet">
              "{replyingTo.message ? replyingTo.message.slice(0, 80) : "Message"}"
            </span>
          </div>
          <button
            type="button"
            className="echat-banner-close"
            onClick={onCancelReply}
            title="Cancel reply"
          >
            ✕
          </button>
        </div>
      )}

      {/* Editing Banner */}
      {editingMessage && (
        <div className="echat-banner echat-edit-banner">
          <div className="echat-banner-info">
            <span className="echat-banner-tag">Editing message</span>
            <span className="echat-banner-snippet">Press Enter to save, Esc to cancel</span>
          </div>
          <button
            type="button"
            className="echat-banner-close"
            onClick={onCancelEdit}
            title="Cancel edit"
          >
            ✕
          </button>
        </div>
      )}

      {/* Input row */}
      <form className="echat-composer-form" onSubmit={handleSubmit}>
        <div className="echat-composer-input-wrap">
          <textarea
            ref={textareaRef}
            className="echat-textarea"
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              editingMessage
                ? "Edit your message..."
                : replyingTo
                ? `Reply to ${replyingTo.senderName}...`
                : "Type a message... (Enter to send, Shift+Enter for new line)"
            }
            disabled={disabled}
          />
        </div>

        <button
          type="submit"
          className="echat-send-btn"
          disabled={!text.trim() || disabled}
          title={editingMessage ? "Save edit" : "Send message"}
        >
          {editingMessage ? "✓" : "➤"}
        </button>
      </form>
    </footer>
  );
}
