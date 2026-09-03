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
          const canView = rights[item.pageName]?.view === true;
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