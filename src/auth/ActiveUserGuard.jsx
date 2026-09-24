
import { Navigate, Outlet, useLocation } from "react-router";

const getIsActive = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return true; // no user info yet, let RequireAuth handle it
    const parsed = JSON.parse(authStorage);
    const isActive = parsed?.state?.user?.isActive;
    // treat undefined/null as active (don't block users whose payload doesn't send this field)
    return isActive === undefined || isActive === null ? true : !!isActive;
  } catch {
    return true;
  }
};

const ActiveUserGuard = () => {
  const location = useLocation();
  const isActive = getIsActive();

  if (!isActive && location.pathname !== "/approvepending") {
    return <Navigate to="/approvepending" replace />;
  }

  return <Outlet />;
};

export default ActiveUserGuard;