// auth/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthContext } from "@/auth";
import { useModuleAccess } from "@/hooks/useModuleAccess";

const PLATFORM_ADMIN_ROLE = 1;
const CLIENT_ADMIN_ROLE = 2;

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
  const content = children ?? <Outlet />;

  if (roleId === PLATFORM_ADMIN_ROLE) return content;

  // 1. Company must have the module active (applies to client admins too)
  if (moduleName && !hasModuleAccess(moduleName)) {
    return <Navigate to="/403" replace state={{ reason: "module" }} />;
  }

  if (roleId === CLIENT_ADMIN_ROLE) return content;

  // 2. Role must have the right
  if (pageName && rights?.[pageName]?.[action] !== true) {
    return <Navigate to="/403" replace state={{ reason: "rights" }} />;
  }

  return content;
};

export default ProtectedRoute;