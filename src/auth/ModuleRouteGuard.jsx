// auth/ModuleRouteGuard.jsx
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthContext } from "@/auth";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { MODULE_ROUTES } from "./moduleRouteMap";

const PLATFORM_ADMIN_ROLE = 1; // same value as in ProtectedRoute

export default function ModuleRouteGuard() {
  const { pathname } = useLocation();
  const token = useAuthStore((s) => s.token);
  const { currentUser } = useAuthContext();
  const { hasModuleAccess } = useModuleAccess();

  // Logged out or logging out: go to login, never to 403
  if (!token || !currentUser) return <Navigate to="/auth/login" replace />;

  // Platform admin skips the module check
  const roleId = Number(currentUser?.userBasicDetails?.role?.id);
  if (roleId === PLATFORM_ADMIN_ROLE) return <Outlet />;

  const path = pathname.toLowerCase();

  const match = Object.entries(MODULE_ROUTES).find(([, prefixes]) =>
    prefixes.some((p) => {
      const q = p.toLowerCase();
      return path === q || path.startsWith(q + "/");
    })
  );

  if (match && !hasModuleAccess(match[0])) {
    return <Navigate to="/403" replace state={{ reason: "module" }} />;
  }

  return <Outlet />;
}