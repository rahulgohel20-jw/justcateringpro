import { createContext, useState, useEffect, useRef } from "react";
import { LoginUser, getUserById, LoginOutUser } from "@/services/apiServices";
import * as authHelper from "../_helpers";
import { message } from "antd";
import { useAuthStore } from "@/store/useAuthStore";
import { normalizeRights } from "@/utils/normalizeRights";
import { getSoftType } from "../../config/getSoftType ";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(authHelper.getAuth());
  const [currentUser, setCurrentUser] = useState(null);
  const inactivityTimerRef = useRef(null);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const INACTIVITY_LIMIT = 10 * 60 * 60 * 1000;

  const saveAuth = (auth) => {
    setAuth(auth);
    if (auth) authHelper.setAuth(auth);
    else authHelper.removeAuth();
  };

  const verify = async () => {
    const token = localStorage.getItem("userToken");
    const userId = localStorage.getItem("mainId");

    if (!token || !userId) {
      saveAuth(undefined);
      setCurrentUser(undefined);
      setLoading(false);
      return;
    }

    try {
    const response = await getUserById(userId);
    if (response?.data?.success) {
      const user = response.data.data["User Details"][0];
      setCurrentUser(user);
      const normalizedRights = normalizeRights(user?.userRights || []);
      const upgradedModules = user?.userUpgradedModule || [];
      const roleReportRights = user?.roleReportRights || null; 

      useAuthStore
        .getState()
        .setAuth(user, user.token, normalizedRights, upgradedModules, roleReportRights); 
    } else {
      logout();
    }
  } catch (error) {
    console.error("Verify failed:", error);
    logout();
  } finally {
    setLoading(false);
  }
};


const refreshRights = async () => {
  const userId = localStorage.getItem("mainId");
  if (!userId) return;

  try {
    const response = await getUserById(userId);
    if (response?.data?.success) {
      const user = response.data.data["User Details"][0];
      const normalizedRights = normalizeRights(user?.userRights || []);
      const upgradedModules = user?.userUpgradedModule || [];
      const roleReportRights = user?.roleReportRights || null;

      useAuthStore.getState().setAuth(
        user,
        user.token,
        normalizedRights,
        upgradedModules,
        roleReportRights,
      );
      setCurrentUser(user);
    }
  } catch (err) {
    console.error("Rights refresh failed:", err);
  }
};

  useEffect(() => {
    verify();
  }, []);


const login = async (uniqueCode, email, password) => {
  try {
    const response = await LoginUser({
      uniqueCode,
      email,
      password,
      otp: "",
      softType: getSoftType(),
    });

    if (!response.data.success) {
      throw new Error(response.data.msg || "Login failed. Please try again.");
    }

    if (response.data.success && response.data.data["User Details"]) {
      return await handleAuthSuccess(response);
    }

    throw new Error("Invalid login response");
  } catch (error) {
    saveAuth(undefined);
    setCurrentUser(undefined);
    throw new Error(
      error.response?.data?.msg ||
        error.message ||
        "Login failed. Please try again.",
    );
  }
};

  const loginWithOtp = async (email, password, otp) => {
    try {
      const response = await LoginUser({
        email,
        password,
        otp,
        softType: getSoftType(),
      });

      if (response.data.success && response.data.data["User Details"]) {
        return await handleAuthSuccess(response);
      }

      throw new Error("Invalid OTP or login failed");
    } catch (error) {
      saveAuth(undefined);
      setCurrentUser(undefined);
      throw new Error(
        error.response?.data?.msg ||
          error.message ||
          "OTP verification failed.",
      );
    }
  };

const handleAuthSuccess = async (response) => {
  const userData = response.data.data["User Details"][0];

  const authData = {
    userId: userData.id,
    access_token: userData.token,
    token_type: userData.tokenType,
    expires_in: userData.expiresIn,
  };

  saveAuth(authData);
  localStorage.setItem("userToken", userData.token);
  localStorage.setItem("lang", "en");

  const finalUserId = (userData.clientId === 0 || userData.clientId === -1)
    ? userData.id
    : userData.clientId;
  localStorage.setItem("userId", finalUserId.toString());
  localStorage.setItem("mainId", userData.id);

  setCurrentUser(userData);

  const normalizedRights   = normalizeRights(userData?.userRights || []);
  const upgradedModules     = userData?.userUpgradedModule || [];
  const roleReportRights    = userData?.roleReportRights || null;

  useAuthStore.getState().setAuth(
    userData, userData.token, normalizedRights, upgradedModules, roleReportRights
  );

  try { await LoginOutUser(userData.email, "login"); 
   }
     catch {}

  startInactivityTimer();


  return { ...authData, userDetails: userData };
};

  const logout = async () => {
    const email = currentUser?.email;
    try {
      if (email) await LoginOutUser(email, "logout");
    } catch (err) {
      console.error("Logout notification failed:", err);
    }

    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("lang");

    clearAuth();
    saveAuth(undefined);
    setCurrentUser(undefined);
    clearInactivityTimer();
  };

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => logout(), INACTIVITY_LIMIT);
  };

  const startInactivityTimer = () => {
    resetInactivityTimer();
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    const onActivity = () => resetInactivityTimer();
    events.forEach((e) => window.addEventListener(e, onActivity));
    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearInactivityTimer();
    };
  };

  const clearInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  };

  useEffect(() => {
    if (currentUser) {
      const cleanup = startInactivityTimer();
      return cleanup;
    } else clearInactivityTimer();
  }, [currentUser]);

  const loginWithToken = async (token, userId) => {
  try {
    if (!token || !userId) {
      throw new Error("Missing SSO token or user id.");
    }

    // Store the incoming token/id first so the API client's auth
    // interceptor picks it up on the getUserById call below
    localStorage.setItem("userToken", token);
    localStorage.setItem("mainId", userId);
    localStorage.setItem("lang", "en");

    const response = await getUserById(userId);
    if (!response?.data?.success) {
      throw new Error(response?.data?.msg || "SSO login failed.");
    }

    const userData = response.data.data["User Details"][0];

    const authData = {
      userId: userData.id,
      access_token: token,
    };

    saveAuth(authData);

    const finalUserId =
      userData.clientId === 0 || userData.clientId === -1
        ? userData.id
        : userData.clientId;
    localStorage.setItem("userId", finalUserId.toString());
    localStorage.setItem("mainId", userData.id);

    setCurrentUser(userData);

    const normalizedRights = normalizeRights(userData?.userRights || []);
    const upgradedModules = userData?.userUpgradedModule || [];
    const roleReportRights = userData?.roleReportRights || null;

    useAuthStore
      .getState()
      .setAuth(userData, token, normalizedRights, upgradedModules, roleReportRights);

    startInactivityTimer();

    return { ...authData, userDetails: userData };
  } catch (error) {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("mainId");
    saveAuth(undefined);
    setCurrentUser(undefined);
    throw new Error(
      error.response?.data?.msg || error.message || "SSO login failed."
    );
  }
};

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        currentUser,
        setCurrentUser,
        saveAuth,
        login,
        loginWithOtp, 
        loginWithToken,
        logout,
        verify,
        refreshRights,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };