// export const applyMenuRights = (menuItems, rights) => {
//   return menuItems
//     .map((item) => {
//       let children;
//       if (item.children) {
//         children = applyMenuRights(item.children, rights);
//       }

//       if (item.pageName) {
//         const canView = rights[item.pageName]?.view === true;
//         if (!canView) return null;
//       }

//       if (item.children && children.length === 0) return null;

//       return {
//         ...item,
//         children: item.children ? children : undefined,
//       };
//     })
//     .filter(Boolean);
// };



export const applyMenuRights = (menuItems, rights, activeModuleNames = []) => {
  const hasPageRight = (name) => {
    if (!name) return true;
    const clean = name.trim();
    if (rights?.[clean]?.view === true) return true;
    const lower = clean.toLowerCase();
    const matchedKey = Object.keys(rights || {}).find(
      (k) => k.trim().toLowerCase() === lower
    );
    if (matchedKey) return rights[matchedKey]?.view === true;

    if (lower === "dashboard") {
      const dashKey = Object.keys(rights || {}).find((k) => {
        const l = k.trim().toLowerCase();
        return l === "dashboard" || l === "super dashboard" || l === "client dashboard";
      });
      if (dashKey) return rights[dashKey]?.view === true;
    }

    return false;
  };

  return menuItems
    .map((item) => {
      let children;
      if (item.children) {
        children = applyMenuRights(item.children, rights, activeModuleNames);
      }

      if (item.pageName) {
        const isUpgradedModule =
          item.moduleName && activeModuleNames.includes(item.moduleName);

        if (!isUpgradedModule) {
          const canView = hasPageRight(item.pageName);
          if (!canView) return null;
        }
      }

      if (item.children && children.length === 0) return null;

      return {
        ...item,
        children: item.children ? children : undefined,
      };
    })
    .filter(Boolean);
};