import { superAdminMenuItems } from "@/config/menu.config";

export const hasRight = (rights, name, action = "view") => {
  if (!name) return true;
  const clean = String(name).trim();
  if (rights?.[clean]?.[action] === true) return true;
  const lower = clean.toLowerCase();
  const matchedKey = Object.keys(rights || {}).find(
    (k) => k.trim().toLowerCase() === lower
  );
  if (matchedKey) return rights[matchedKey]?.[action] === true;

  if (lower === "dashboard") {
    const dashKey = Object.keys(rights || {}).find((k) => {
      const l = k.trim().toLowerCase();
      return l === "dashboard" || l === "super dashboard" || l === "client dashboard";
    });
    if (dashKey) return rights[dashKey]?.[action] === true;
  }

  return false;
};

export const getFirstAuthorizedRoute = (menuItems, rights) => {
  const findPath = (items) => {
    for (const item of items || []) {
      if (item.path && item.path !== "#" && item.pageName) {
        if (hasRight(rights, item.pageName)) {
          return item.path;
        }
      }
      if (item.children && item.children.length > 0) {
        const childPath = findPath(item.children);
        if (childPath) return childPath;
      }
    }
    return null;
  };

  return findPath(menuItems);
};

export const getLandingRoute = (userDetails, rights) => {
  const roleId = Number(userDetails?.userBasicDetails?.role?.id);
  const clientId = Number(userDetails?.clientId ?? userDetails?.userBasicDetails?.clientId);

  // Platform Admin (role 1) always goes to super-dashboard
  if (roleId === 1) {
    return "/super-dashboard";
  }

  // Super Admin Member (clientId === 1 and roleId > 2)
  if (clientId === 1) {
    if (hasRight(rights, "Dashboard")) {
      return "/super-dashboard";
    }
    const firstAllowed = getFirstAuthorizedRoute(superAdminMenuItems, rights);
    return firstAllowed || "/403";
  }

  // Client Admin (role 2)
  if (roleId === 2) {
    return "/";
  }

  // Client Member (roleId > 2)
  if (roleId > 2) {
    return "/";
  }

  return "/";
};
