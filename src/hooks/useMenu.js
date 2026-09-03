import { applyMenuRights } from "@/utils/applyMenuRights";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthContext } from "@/auth";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  allMenuItems,
  superAdminMenuItems,
  disableMenuItems,
} from "../config/menu.config";
import { recipeMenuItems } from "../config/menu.recipe";

// Modules shown in HeaderTopbar when isVisible=true — hidden from sidebar
const HEADER_OWNED_TITLES = [
  "Master",
  "Banquet",
  "Vendor",
  "Menu Item",
  "Raw Material",
  "Stock",
  "Account",
];

const applyUpgradedModules = (menuItems, upgradedModules, currentUser) => {
  const GATED_MODULES = ["Account", "Stock", "CRM", "AI Menu", "Menu Share Link", "Banquet" , "Captain Recipe" , "Assign Manager", "Food Taste Festival", "Event Flow", "Decor", "Menu Extra Features" , "kyc" , "followup" , "Security Deposit"];

  const modules =
    upgradedModules?.length > 0
      ? upgradedModules
      : currentUser?.userUpgradedModule || [];

  const activeModuleNames = modules
    .filter((m) => m.isActive && m.isPayDone)
    .map((m) => m.moduleName);

  return menuItems.filter((item) => {
    if (!item.moduleName) return true;
    if (!GATED_MODULES.includes(item.moduleName)) return true;
    return activeModuleNames.includes(item.moduleName);
  });
};

const HIDDEN_WHEN_NOT_VISIBLE = [
  "Dashboard", "Report", "Custom Themes", "Configuration",
  "Account", "Stock", "CRM", "Banquet", "Sales",
];

const applyVisibilityFilter = (menuItems, isVisible) => {
  if (isVisible !== false) return menuItems;
  return menuItems.filter((item) => {
    const pageName = item.pageName || "";
    const moduleName = item.moduleName || "";
    const titleStr = typeof item.title === "string" ? item.title : "";
    return !HIDDEN_WHEN_NOT_VISIBLE.some(
      (hidden) =>
        pageName === hidden ||
        moduleName === hidden ||
        titleStr === hidden
    );
  });
};


const applyHeaderOwned = (menuItems, isVisible) => {
  if (!isVisible) return menuItems; // isVisible=false → keep in sidebar
  return menuItems.filter((item) => {
    const pageName  = item.pageName  || "";
    const moduleName = item.moduleName || "";
    return !HEADER_OWNED_TITLES.some(
      (t) => pageName === t || moduleName === t
    );
  });
};

export const useMenu = () => {
  const { currentUser, loading } = useAuthContext();
  const rights = useAuthStore((state) => state.rights);
  const upgradedModules = useAuthStore((state) => state.upgradedModules);
  const location = useLocation();
  const navigate = useNavigate();

  const menu = useMemo(() => {
    const isRecipeModule = location.pathname.startsWith("/recipe");

    if (!currentUser) {
      return disableMenuItems(
        isRecipeModule ? recipeMenuItems : allMenuItems(navigate)
      );
    }

    const roleId   = Number(currentUser?.userBasicDetails?.role?.id);
    const clientId = currentUser?.clientId;
    const plan     = currentUser?.plan;
    const isApproved = currentUser?.isApprove === true;
    const isSuperSystem = roleId === 1 || clientId === 1;
    const isVisible = currentUser?.isVisible ?? true;
      const authStorage = JSON.parse(localStorage.getItem("auth-storage") || "{}");
const isHeaderOwned = ["jcxpro", "justbanq"].includes(authStorage?.state?.user?.softType);
    let baseMenu;
    if (isRecipeModule) {
      baseMenu = recipeMenuItems;
    } else {
      baseMenu = isSuperSystem ? superAdminMenuItems : allMenuItems(navigate);
    }

    if (!plan || !isApproved) {
      return disableMenuItems(baseMenu);
    }

    if (roleId >= 2) {
      baseMenu = applyUpgradedModules(baseMenu, upgradedModules, currentUser);
    }

    baseMenu = applyVisibilityFilter(baseMenu, isVisible);

   
    baseMenu = applyHeaderOwned(baseMenu, isHeaderOwned);

    if (roleId === 1 || roleId === 2) {
      return baseMenu;
    }

    const modules =
      upgradedModules?.length > 0
        ? upgradedModules
        : currentUser?.userUpgradedModule || [];

    const activeModuleNames = modules
      .filter((m) => m.isActive && m.isPayDone)
      .map((m) => m.moduleName);

    return applyMenuRights(baseMenu, rights, activeModuleNames);
  }, [currentUser, rights, upgradedModules, location.pathname]);

  return { menu, loading };
};