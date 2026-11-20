import { useLocation } from "react-router";
import ProtectedRoute from "./ProtectedRoute";
import { findRule } from "./routeAccess";

// Pages every logged-in user can open, with no rights check
const OPEN_ROUTES = ["/account/home/user-profile"];

export default function RightsRouteGuard() {
  const { pathname } = useLocation();
  const path = pathname.toLowerCase().replace(/\/$/, "");

  const rule = OPEN_ROUTES.includes(path) ? null : findRule(pathname);

  return <ProtectedRoute pageName={rule?.pageName} />;
}