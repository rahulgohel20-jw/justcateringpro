// auth/ModuleRouteGuard.jsx
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthContext } from "@/auth";
import { useModuleAccess } from "@/hooks/useModuleAccess";
import { MODULE_ROUTES } from "./moduleRouteMap";
import { PLATFORM_ADMIN_ROLE, SUPER_ADMIN_ROLE } from "./roles"; // CHANGE 1: import the new constant

export default function ModuleRouteGuard() {
  const { pathname } = useLocation();
  const token = useAuthStore((s) => s.token);
  const { currentUser } = useAuthContext();
  const { hasModuleAccess } = useModuleAccess();

  if (!token || !currentUser) return <Navigate to="/auth/login" replace />;

  const roleId = Number(currentUser?.userBasicDetails?.role?.id);
  const clientId = Number(currentUser?.clientId ?? currentUser?.userBasicDetails?.clientId);

  // Platform admin, super admin, and super admin members (clientId === 1) skip the module check
  if (roleId === PLATFORM_ADMIN_ROLE || roleId === SUPER_ADMIN_ROLE || clientId === 1) {
    return <Outlet />;
  }

  const path = pathname.toLowerCase().replace(/\/$/, "");

  const matches = Object.entries(MODULE_ROUTES).filter(([, prefixes]) =>
    prefixes.some((p) => {
      const q = p.toLowerCase();
      return path === q || path.startsWith(q + "/");
    })
  );

  if (matches.length > 0 && !matches.some(([name]) => hasModuleAccess(name))) {
    return <Navigate to="/403" replace state={{ reason: "module" }} />;
  }

  return <Outlet />;
}