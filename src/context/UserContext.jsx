import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { getUserById } from "@/services/apiServices";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const refreshUser = useCallback(async () => {
    const userId = localStorage.getItem("mainId");
    if (!userId) return;

    const res = await getUserById(userId);
    const data = res?.data?.data?.["User Details"]?.[0];
    setUser(data);
  }, []);

  const value = useMemo(() => ({ user, refreshUser }), [user, refreshUser]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);