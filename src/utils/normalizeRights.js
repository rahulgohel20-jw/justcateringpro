export const normalizeRights = (modules = []) => {
  const rightsMap = {};

  modules.forEach((module) => {
    (module.userRights || []).forEach((page) => {  
      const pageKey = (page.pageName || page.pagename || "").trim();
      if (!pageKey) return;                  

      const existing = rightsMap[pageKey];
      if (existing) {
        rightsMap[pageKey] = {
          view:   existing.view   || !!page.view,
          add:    existing.add    || !!page.add,
          edit:   existing.edit   || !!page.edit,
          delete: existing.delete || !!page.delete,
        };
      } else {
        rightsMap[pageKey] = {
          view:   !!page.view,
          add:    !!page.add,
          edit:   !!page.edit,
          delete: !!page.delete,
        };
      }
    });
  });

  return rightsMap;
};