import { useEffect } from "react";
import { Visible } from "@/services/apiServices";
import { useAuthContext } from "@/auth";
import { useModuleAccess } from "@/hooks/useModuleAccess";

const useVisibilityShortcut = (userId) => {
  const { logout } = useAuthContext();
  const { hasModuleAccess } = useModuleAccess();
  const canAccessTigerSecurity = hasModuleAccess("Tiger Security");

  useEffect(() => {
    if (!userId || !canAccessTigerSecurity) return;

    const handleKeyDown = async (e) => {
      if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === "1") {
        e.preventDefault();
        try {
          await Visible(userId, true);
          logout();
        } catch (err) {
          console.error("Visible API error:", err);
        }
      }

      if (e.ctrlKey && !e.shiftKey && !e.altKey && e.key === "0") {
        e.preventDefault();
        try {
          await Visible(userId, false);
          logout();
        } catch (err) {
          console.error("Visible API error:", err);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [userId, logout, canAccessTigerSecurity]);
};

export default useVisibilityShortcut;