// src/context/UserContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
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

  return (
    <UserContext.Provider value={{ user, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
