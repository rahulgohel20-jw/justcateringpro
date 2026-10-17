// auth/RightsRouteGuard.jsx
import { useLocation } from "react-router";
import ProtectedRoute from "./ProtectedRoute";
import { findRule } from "./routeAccess";

export default function RightsRouteGuard() {
  const { pathname } = useLocation();
  const rule = findRule(pathname);
  // No rule means no pageName, so ProtectedRoute lets it through
  return <ProtectedRoute pageName={rule?.pageName} />;
}