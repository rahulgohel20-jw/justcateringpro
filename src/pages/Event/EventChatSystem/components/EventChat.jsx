import React, { useState, useEffect, useCallback, useRef } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import MessageComposer from "./MessageComposer";
import RightPanel from "./RightPanel";
import SearchModal from "./SearchModal";

import {
  GetEventChatMessages,
  SendEventChatMessage,
  UpdateEventChatMessage,
  DeleteEventChatMessage,
  MarkEventChatRead,
  GetEventChatParticipants,
  GetEventChatUnreadSummary,
  AddEventChatReaction,
  RemoveEventChatReaction,
  PinEventChatMessage,
  UnpinEventChatMessage,
  GetEventMasterForChat,
  GetEventMasterById,
} from "../api/chatApi";

import { connectEventChat } from "../services/chatSocket";
import "../styles/EventChat.css";

/**
 * Extracts logged-in user from Zustand 'auth-storage' or localStorage
 */
function getLoggedInUser() {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.user || null;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

export default function EventChat({
  env = {},
  eventId, // If provided, locks or selects this specific event
  events: initialEvents, // Optional external events list
  hideSidebar = false, // Set to true if rendering inside an event modal/tab
  currentUserId, // Optional override for logged in user ID
  onEventChange,
  className = "",
}) {
  const user = getLoggedInUser();
  const resolvedUserId = currentUserId || user?.id || 1;
  const isChildUser = user?.isChildUser || false;

  // 1. Events list state
  const [eventsList, setEventsList] = useState(initialEvents || []);
  const [loadingEvents, setLoadingEvents] = useState(false);

  // Fetch real events from existing EventMaster API if events not passed
  useEffect(() => {
    if (initialEvents && initialEvents.length > 0) {
      setEventsList(initialEvents);
      return;
    }

    let isMounted = true;
    const fetchUserEvents = async () => {
      setLoadingEvents(true);
      try {
        const resp = await GetEventMasterForChat(resolvedUserId, isChildUser);
        const data = resp?.data?.data || resp?.data || resp;
        const list = Array.isArray(data) ? data : data?.content || [];

        // Normalize event object: ensures id, eventNo, name exist
        const formatted = list.map((ev) => ({
          id: ev.id || ev.eventId,
          eventNo: ev.eventNo || `EVT-${ev.id}`,
          name: ev.partyName || ev.eventName || ev.eventTitle || `Event #${ev.id}`,
          eventDate: ev.eventDate || ev.startDate || "",
          unread: ev.unreadCount || 0,
        }));

        if (isMounted) {
          setEventsList(formatted);
        }
      } catch (err) {
        console.warn("Could not load events from EventMaster, using default:", err);
        if (isMounted && eventsList.length === 0) {
          setEventsList([
            { id: 101, eventNo: "EVT-001", name: "Royal Wedding Gala", unread: 0 },
            { id: 102, eventNo: "EVT-002", name: "Corporate Summit 2026", unread: 0 },
          ]);
        }
      } finally {
        if (isMounted) setLoadingEvents(false);
      }
    };

    fetchUserEvents();
    return () => {
      isMounted = false;
    };
  }, [initialEvents, resolvedUserId, isChildUser]);

  // 2. Selected event state
  const [selectedEvent, setSelectedEvent] = useState(() => {
    if (eventId) {
      const match = eventsList.find((e) => Number(e.id) === Number(eventId));
      return (
        match || {
          id: Number(eventId),
          eventNo: `EVT-${eventId}`,
          name: `Event #${eventId}`,
        }
      );
    }
    return eventsList[0] || null;
  });

  // Sync selected event when eventId prop or eventsList changes
  useEffect(() => {
    if (eventId) {
      const numId = Number(eventId);
      const match = eventsList.find((e) => Number(e.id) === numId);
      if (match) {
        setSelectedEvent(match);
      } else {
        // Fetch event directly by ID if not in list
        let isMounted = true;
        GetEventMasterById(numId)
          .then((res) => {
            if (!isMounted) return;
            const ev = res?.data?.data || res?.data || res;
            if (ev && (ev.id || ev.eventId)) {
              const formatted = {
                id: ev.id || ev.eventId || numId,
                eventNo: ev.eventNo || `EVT-${numId}`,
                name:
                  ev.partyName ||
                  ev.eventName ||
                  ev.eventTitle ||
                  `Event #${numId}`,
                eventDate: ev.eventDate || ev.startDate || "",
                unread: 0,
              };
              setSelectedEvent(formatted);
              setEventsList((prev) => {
                if (prev.some((item) => Number(item.id) === Number(formatted.id))) {
                  return prev;
                }
                return [formatted, ...prev];
              });
            }
          })
          .catch((err) => {
            console.warn("Could not load event by ID:", err);
          });

        return () => {
          isMounted = false;
        };
      }
    } else if (!selectedEvent && eventsList.length > 0) {
      setSelectedEvent(eventsList[0]);
    }
  }, [eventId, eventsList]);

  // 3. Core chat states
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [unreadSummary, setUnreadSummary] = useState({});

  // 4. Interaction states
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [activePanel, setActivePanel] = useState(null); // 'participants' | 'pinned' | null
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [socketStatus, setSocketStatus] = useState("disconnected");

  // Ref to latest selectedEvent ID for socket callbacks
  const selectedEventIdRef = useRef(selectedEvent?.id);
  useEffect(() => {
    selectedEventIdRef.current = selectedEvent?.id;
  }, [selectedEvent?.id]);

  // -------------------------------------------------------------
  // Data Fetching: Unread summary
  // -------------------------------------------------------------
  const loadUnreadSummary = useCallback(async () => {
    if (!eventsList || eventsList.length === 0) return;
    try {
      const ids = eventsList.map((e) => e.id).filter(Boolean);
      if (ids.length === 0) return;

      const resp = await GetEventChatUnreadSummary(ids);
      const data = resp?.data?.data || resp?.data || resp;
      if (Array.isArray(data)) {
        const summaryMap = {};
        data.forEach((item) => {
          summaryMap[item.eventId] = item.unreadCount;
        });
        setUnreadSummary(summaryMap);
      }
    } catch (err) {
      console.warn("Could not load unread summary:", err.message);
    }
  }, [eventsList]);

  useEffect(() => {
    loadUnreadSummary();
  }, [loadUnreadSummary]);

  // -------------------------------------------------------------
  // Data Fetching: Participants
  // -------------------------------------------------------------
  const loadParticipants = useCallback(async (evtId) => {
    if (!evtId) return;
    try {
      const resp = await GetEventChatParticipants(evtId);
      const list = resp?.data?.data || resp?.data || resp || [];
      setParticipants(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn("Could not load participants:", err.message);
    }
  }, []);

  // -------------------------------------------------------------
  // Data Fetching: Messages (Paginated)
  // -------------------------------------------------------------
  const loadMessages = useCallback(
    async (evtId, targetPage = 0, isLoadMore = false) => {
      if (!evtId) return;
      setLoading(true);
      try {
        const resp = await GetEventChatMessages(evtId, targetPage, 30);
        const pageData = resp?.data?.data || resp?.data || resp;
        const rawContent =
          pageData?.content || (Array.isArray(pageData) ? pageData : []);

        // Reverse newest-first into chronological order
        const isDescending =
          rawContent.length > 1 &&
          new Date(rawContent[0].createdAt || 0) >
            new Date(rawContent[rawContent.length - 1].createdAt || 0);
        const ordered = isDescending ? [...rawContent].reverse() : [...rawContent];

        setMessages((prev) => {
          const combined = isLoadMore ? [...ordered, ...prev] : ordered;
          const seen = new Set();
          return combined.filter((m) => {
            if (!m || !m.id) return false;
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
          });
        });

        setPage(targetPage);
        setHasMore(pageData?.last === false || rawContent.length === 30);

        // Mark read
        if (ordered.length > 0) {
          const newest = ordered[ordered.length - 1];
          MarkEventChatRead(evtId, newest.id)
            .then(() => {
              setUnreadSummary((prev) => ({ ...prev, [evtId]: 0 }));
            })
            .catch(() => {});
        }
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // -------------------------------------------------------------
  // Switch Event Effect
  // -------------------------------------------------------------
  useEffect(() => {
    if (!selectedEvent?.id) return;

    setMessages([]);
    setReplyingTo(null);
    setEditingMessage(null);
    setPage(0);
    setHasMore(false);

    loadMessages(selectedEvent.id, 0, false);
    loadParticipants(selectedEvent.id);

    if (onEventChange) {
      onEventChange(selectedEvent);
    }
  }, [selectedEvent?.id, loadMessages, loadParticipants, onEventChange]);

  // -------------------------------------------------------------
  // WebSocket Integration (STOMP via chatSocket)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!selectedEvent?.id) return;

    const disconnect = connectEventChat({
      eventId: selectedEvent.id,
      env,
      onStatusChange: (status) => setSocketStatus(status),
      onEvent: (socketPayload) => {
        if (!socketPayload) return;
        const { type, eventId: evId, messageId, data } = socketPayload;

        if (type === "POLL_REFRESH") {
          loadMessages(selectedEvent.id, 0, false);
          return;
        }

        if (Number(evId) !== Number(selectedEventIdRef.current)) {
          loadUnreadSummary();
          return;
        }

        switch (type) {
          case "MESSAGE_CREATED":
            if (data) {
              setMessages((prev) => {
                if (prev.some((m) => m.id === data.id)) return prev;
                return [...prev, data];
              });
              MarkEventChatRead(evId, data.id).catch(() => {});
            } else {
              loadMessages(selectedEvent.id, 0, false);
            }
            break;

          case "MESSAGE_UPDATED":
            if (data) {
              setMessages((prev) =>
                prev.map((m) => (m.id === data.id ? { ...m, ...data } : m))
              );
            } else {
              loadMessages(selectedEvent.id, 0, false);
            }
            break;

          case "MESSAGE_DELETED":
            setMessages((prev) => prev.filter((m) => m.id !== messageId));
            break;

          default:
            break;
        }
      },
    });

    return () => {
      disconnect();
    };
  }, [selectedEvent?.id, env, loadMessages, loadUnreadSummary]);

  // -------------------------------------------------------------
  // Chat Actions: Send, Edit, Delete, Reaction, Pin
  // -------------------------------------------------------------
  const handleSendMessage = async (text, parentId) => {
    if (!selectedEvent?.id || !text) return;
    try {
      const resp = await SendEventChatMessage({
        eventId: selectedEvent.id,
        message: text,
        parentMessageId: parentId,
      });

      const created = resp?.data?.data || resp?.data || resp;
      if (created && created.id) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === created.id)) return prev;
          return [...prev, { ...created, isOwnMessage: true }];
        });
      } else {
        loadMessages(selectedEvent.id, 0, false);
      }

      setReplyingTo(null);
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleSaveEdit = async (messageId, newText) => {
    try {
      const resp = await UpdateEventChatMessage(messageId, newText);
      const updated = resp?.data?.data || resp?.data || resp;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, ...updated, message: newText, isEdited: true }
            : m
        )
      );
      setEditingMessage(null);
    } catch (err) {
      console.error("Failed to update message:", err);
      alert("Failed to update message: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await DeleteEventChatMessage(messageId);
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (err) {
      console.error("Failed to delete message:", err);
      alert("Failed to delete message: " + (err.response?.data?.msg || err.message));
    }
  };

  const handleAddReaction = async (messageId, reactionType) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const counts = { ...(m.reactionCounts || {}) };
        counts[reactionType] = (counts[reactionType] || 0) + 1;
        const my = [...(m.myReactions || []), reactionType];
        return { ...m, reactionCounts: counts, myReactions: my };
      })
    );

    try {
      await AddEventChatReaction(messageId, reactionType);
    } catch (err) {
      console.error("Add reaction failed:", err);
      loadMessages(selectedEvent.id, page, false);
    }
  };

  const handleRemoveReaction = async (messageId, reactionType) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const counts = { ...(m.reactionCounts || {}) };
        if (counts[reactionType] > 1) {
          counts[reactionType] -= 1;
        } else {
          delete counts[reactionType];
        }
        const my = (m.myReactions || []).filter((r) => r !== reactionType);
        return { ...m, reactionCounts: counts, myReactions: my };
      })
    );

    try {
      await RemoveEventChatReaction(messageId, reactionType);
    } catch (err) {
      console.error("Remove reaction failed:", err);
      loadMessages(selectedEvent.id, page, false);
    }
  };

  const handleTogglePin = async (msg) => {
    const isPinned = !!msg.pinned;
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, pinned: !isPinned } : m))
    );

    try {
      if (isPinned) {
        await UnpinEventChatMessage(msg.id);
      } else {
        await PinEventChatMessage(msg.id);
      }
    } catch (err) {
      console.error("Pin toggle failed:", err);
      loadMessages(selectedEvent.id, page, false);
    }
  };

  const handleJumpToMessage = (targetMessageId) => {
    const el = document.getElementById(`echat-msg-${targetMessageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("echat-highlight-flash");
      setTimeout(() => el.classList.remove("echat-highlight-flash"), 2000);
    } else {
      alert("Message is from an older page. Click 'Load older messages' to view.");
    }
  };

  const pinnedMessages = messages.filter((m) => !!m.pinned);

  return (
    <div className={`echat-container ${className}`}>
      {/* 1. Left Sidebar (Shown unless hideSidebar is true) */}
      {!hideSidebar && (
        <ChatSidebar
          events={eventsList}
          selectedEventId={selectedEvent?.id}
          unreadSummary={unreadSummary}
          isOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onSelectEvent={(evt) => setSelectedEvent(evt)}
        />
      )}

      {/* 2. Main Chat Panel */}
      <main className="echat-main-chat">
        {/* Top Header */}
        <ChatHeader
          event={selectedEvent}
          socketStatus={socketStatus}
          pinnedCount={pinnedMessages.length}
          participantsCount={participants.length}
          activePanel={activePanel}
          onToggleMobileSidebar={
            !hideSidebar ? () => setMobileSidebarOpen(!mobileSidebarOpen) : null
          }
          onOpenSearch={() => setSearchOpen(true)}
          onRefresh={() => loadMessages(selectedEvent?.id, 0, false)}
          onTogglePinned={() =>
            setActivePanel((prev) => (prev === "pinned" ? null : "pinned"))
          }
          onToggleParticipants={() =>
            setActivePanel((prev) => (prev === "participants" ? null : "participants"))
          }
        />

        {/* Messages Body */}
        <MessageList
          messages={messages}
          currentUserId={resolvedUserId}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={() => loadMessages(selectedEvent?.id, page + 1, true)}
          onReply={(msg) => {
            setEditingMessage(null);
            setReplyingTo(msg);
          }}
          onStartEdit={(msg) => {
            setReplyingTo(null);
            setEditingMessage(msg);
          }}
          onDelete={handleDeleteMessage}
          onAddReaction={handleAddReaction}
          onRemoveReaction={handleRemoveReaction}
          onTogglePin={handleTogglePin}
        />

        {/* Message Composer Footer */}
        <MessageComposer
          onSendMessage={handleSendMessage}
          onSaveEdit={handleSaveEdit}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          editingMessage={editingMessage}
          onCancelEdit={() => setEditingMessage(null)}
        />
      </main>

      {/* 3. Right Drawer (Participants or Pinned messages) */}
      <RightPanel
        activePanel={activePanel}
        onClose={() => setActivePanel(null)}
        participants={participants}
        pinnedMessages={pinnedMessages}
        onJumpToMessage={handleJumpToMessage}
        onUnpinMessage={(id) => handleTogglePin({ id, pinned: true })}
      />

      {/* 4. Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        eventId={selectedEvent?.id}
        onJumpToMessage={handleJumpToMessage}
      />
    </div>
  );
}
