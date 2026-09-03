import { useAuthStore } from "@/store/useAuthStore";
import { useAuthContext } from "@/auth";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ pageName, children }) => {
  const { currentUser } = useAuthContext();
  const rights = useAuthStore((state) => state.rights);

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  const roleId = Number(currentUser?.userBasicDetails?.role?.id);

  // Super admin / admin always have full access
  if (roleId === 1 || roleId === 2) {
    return children;
  }

  // No pageName = unprotected route (dashboard etc.)
  if (!pageName) return children;

  const canView = rights[pageName]?.view === true;

  if (!canView) {
    return <Navigate to="/403" replace />;
  }

  return children;
};

export default ProtectedRoute;
