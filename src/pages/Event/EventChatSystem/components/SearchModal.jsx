import React, { useState, useEffect, useRef } from "react";
import { SearchEventChatMessages } from "../api/chatApi";

export default function SearchModal({
  isOpen,
  onClose,
  eventId,
  onJumpToMessage,
}) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setKeyword("");
      setResults([]);
      setSearched(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    const query = keyword.trim();
    if (!query || !eventId) return;

    setSearching(true);
    try {
      const resp = await SearchEventChatMessages(eventId, query, 0, 30);
      const pageData = resp?.data?.data || resp?.data || resp;
      const items = pageData?.content || (Array.isArray(pageData) ? pageData : []);
      setResults(items);
      setSearched(true);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="echat-modal-overlay" onClick={onClose}>
      <div
        className="echat-search-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="echat-modal-header">
          <h4>Search in this Event Chat</h4>
          <button
            type="button"
            className="echat-modal-close"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>

        <form className="echat-modal-form" onSubmit={handleSearch}>
          <input
            ref={inputRef}
            type="text"
            className="echat-modal-input"
            placeholder="Type keyword and press Enter..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button
            type="submit"
            className="echat-modal-btn"
            disabled={!keyword.trim() || searching}
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        <div className="echat-modal-results">
          {searching && (
            <div className="echat-modal-msg">Searching messages...</div>
          )}

          {!searching && searched && results.length === 0 && (
            <div className="echat-modal-msg">No messages found matching "{keyword}"</div>
          )}

          {!searching && results.length > 0 && (
            <div className="echat-results-list">
              <span className="echat-results-count">
                Found {results.length} message{results.length > 1 ? "s" : ""}:
              </span>
              {results.map((item) => (
                <div
                  key={item.id}
                  className="echat-result-item"
                  onClick={() => {
                    onJumpToMessage(item.id);
                    onClose();
                  }}
                  title="Jump to message"
                >
                  <div className="echat-result-top">
                    <strong>{item.senderName}</strong>
                    <span className="echat-result-date">
                      {new Date(item.createdAt).toLocaleDateString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="echat-result-text">{item.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
