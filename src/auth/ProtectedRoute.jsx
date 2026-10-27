// auth/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthContext } from "@/auth";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { PLATFORM_ADMIN_ROLE, CLIENT_ADMIN_ROLE } from "./roles";

const ProtectedRoute = ({ pageName, moduleName, action = "view", children }) => {
  const { currentUser } = useAuthContext();
  const token = useAuthStore((s) => s.token);
  const rights = useAuthStore((s) => s.rights);
  const { hasModuleAccess } = useModuleAccess();

  // Logged out or logging out: go to login, never to 403.
  // `token` is cleared in the same store update as rights/modules,
  // so this check can't see "user present but no rights".
  if (!token || !currentUser) return <Navigate to="/auth/login" replace />;

  const roleId = Number(currentUser?.userBasicDetails?.role?.id);
  const clientId = Number(currentUser?.clientId ?? currentUser?.userBasicDetails?.clientId);
  const content = children ?? <Outlet />;

  if (roleId === PLATFORM_ADMIN_ROLE) return content;

  console.log("PROTECTED", { pageName, action, roleId, right: rights?.[pageName], keys: Object.keys(rights || {}) });

  // 1. Company must have the module active (applies to client admins too, but not SuperAdmin system)
  if (moduleName && clientId !== 1 && !hasModuleAccess(moduleName)) {
    return <Navigate to="/403" replace state={{ reason: "module" }} />;
  }

  if (roleId === CLIENT_ADMIN_ROLE) return content;

  // 2. Role must have the right (supports exact, trimmed, case-insensitive, and dashboard variants)
  const hasPageRight = (name) => {
    if (!name) return true;
    const clean = name.trim();
    if (rights?.[clean]?.[action] === true) return true;
    const lower = clean.toLowerCase();
    const matchedKey = Object.keys(rights || {}).find(
      (k) => k.trim().toLowerCase() === lower
    );
    if (matchedKey) return rights[matchedKey]?.[action] === true;

    if (lower === "dashboard") {
      const dashKey = Object.keys(rights || {}).find((k) => {
        const l = k.trim().toLowerCase();
        return l === "dashboard" || l === "super dashboard" || l === "client dashboard";
      });
      if (dashKey) return rights[dashKey]?.[action] === true;
    }

    return false;
  };

  if (pageName && !hasPageRight(pageName)) {
    return <Navigate to="/403" replace state={{ reason: "rights" }} />;
  }

  return content;
};

export default ProtectedRoute;