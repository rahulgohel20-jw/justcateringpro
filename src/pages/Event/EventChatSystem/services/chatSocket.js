/**
 * Real-time Chat WebSocket & Polling Service
 * Connects to event chat channel with automatic fallback to polling
 */
export function connectEventChat({
  eventId,
  env = {},
  onStatusChange = () => {},
  onEvent = () => {},
  pollingIntervalMs = 6000,
}) {
  let ws = null;
  let isClosed = false;
  let pollTimer = null;
  let reconnectTimer = null;

  // Resolve WS URL
  const getWsUrl = () => {
    if (env.WS_URL) return env.WS_URL;
    const viteWs = import.meta.env?.VITE_WS_URL;
    if (viteWs) return viteWs;

    // Derive from VITE_API_BASE_URL or window.location
    const apiBase = import.meta.env?.VITE_API_BASE_URL || "";
    if (apiBase.startsWith("http")) {
      try {
        const parsed = new URL(apiBase);
        const wsProtocol = parsed.protocol === "https:" ? "wss:" : "ws:";
        return `${wsProtocol}//${parsed.host}/ws/event-chat?eventId=${eventId}`;
      } catch {
        // fallback
      }
    }

    const wsProto = window.location.protocol === "https:" ? "wss:" : "ws:";
    return `${wsProto}//${window.location.host}/ws/event-chat?eventId=${eventId}`;
  };

  const startPolling = () => {
    if (pollTimer) clearInterval(pollTimer);
    // Poll every interval when WS is offline or not supported
    pollTimer = setInterval(() => {
      if (isClosed) return;
      onEvent({
        type: "POLL_REFRESH",
        eventId,
      });
    }, pollingIntervalMs);
  };

  const stopPolling = () => {
    if (pollTimer) {
      clearInterval(pollTimer);
      pollTimer = null;
    }
  };

  const tryConnectWs = () => {
    if (isClosed || !eventId) return;

    // In browser environment check WebSocket support
    if (typeof WebSocket === "undefined") {
      onStatusChange("disconnected");
      startPolling();
      return;
    }

    try {
      const baseUrl = getWsUrl();
      onStatusChange("connecting");

      const token =
        localStorage.getItem("userToken") || localStorage.getItem("token");
      const fullUrl =
        token && !baseUrl.includes("token=")
          ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}token=${encodeURIComponent(token)}`
          : baseUrl;

      ws = new WebSocket(fullUrl);

      ws.onopen = () => {
        if (isClosed) {
          try {
            ws.close();
          } catch {}
          return;
        }
        onStatusChange("connected");
        stopPolling();

        // Send subscribe action
        try {
          ws.send(JSON.stringify({ action: "SUBSCRIBE", eventId }));
        } catch {
          // ignore
        }
      };

      ws.onmessage = (event) => {
        if (isClosed || !event.data) return;
        try {
          const payload = JSON.parse(event.data);
          onEvent(payload);
        } catch {
          // Non-JSON or raw text
        }
      };

      ws.onerror = () => {
        onStatusChange("disconnected");
        startPolling();
      };

      ws.onclose = () => {
        if (isClosed) return;
        onStatusChange("disconnected");
        startPolling();

        // Attempt reconnect after 15s
        reconnectTimer = setTimeout(() => {
          if (!isClosed) tryConnectWs();
        }, 15000);
      };
    } catch {
      onStatusChange("disconnected");
      startPolling();
    }
  };

  // Trigger initial connection
  tryConnectWs();

  // Return clean disconnect callback
  return () => {
    isClosed = true;
    stopPolling();
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws) {
      try {
        ws.close();
      } catch {}
      ws = null;
    }
    onStatusChange("disconnected");
  };
}

export default {
  connectEventChat,
};
