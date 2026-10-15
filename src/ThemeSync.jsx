import { useEffect } from "react";
import { useAuthContext } from "@/auth";
import { applyDomainTheme } from "@/config/applyDomainTheme";

export const ThemeSync = () => {
  const { currentUser } = useAuthContext();

  useEffect(() => {
    applyDomainTheme(currentUser?.softType);
  }, [currentUser?.softType]);

  return null;
};