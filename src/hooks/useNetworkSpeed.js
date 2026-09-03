import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

const SLOW_THRESHOLD_MS = 1500; 
const CHECK_INTERVAL_MS = 30000; 
const PING_URL = "/favicon.ico"; 

export const useNetworkSpeed = ({ enabled = true } = {}) => {
  const [isSlow, setIsSlow] = useState(false);
  const lastWarnedRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const checkSpeed = async () => {
      
      if (!navigator.onLine) {
        triggerSlowWarning("You appear to be offline.");
        return;
      }

      
      const conn =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      if (conn?.effectiveType && ["slow-2g", "2g"].includes(conn.effectiveType)) {
        triggerSlowWarning("Your network connection seems very slow.");
        return;
      }

     
      const start = performance.now();
      try {
        await fetch(`${PING_URL}?_=${Date.now()}`, {
          method: "GET",
          cache: "no-store",
        });
        const elapsed = performance.now() - start;
        setIsSlow(elapsed > SLOW_THRESHOLD_MS);
        if (elapsed > SLOW_THRESHOLD_MS) {
          triggerSlowWarning("Your internet connection seems slow right now.");
        }
      } catch {
        triggerSlowWarning("Unable to reach the server. Check your connection.");
      }
    };

    const triggerSlowWarning = (message) => {
      const now = Date.now();
      // Avoid spamming alerts — only warn once per minute
      if (now - lastWarnedRef.current < 60000) return;
      lastWarnedRef.current = now;
      setIsSlow(true);

      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: message,
        showConfirmButton: false,
        timer: 4000,
      });
    };

    checkSpeed();
    const interval = setInterval(checkSpeed, CHECK_INTERVAL_MS);

    window.addEventListener("offline", () =>
      triggerSlowWarning("You appear to be offline."),
    );

    return () => {
      clearInterval(interval);
    };
  }, [enabled]);

  return { isSlow };
};