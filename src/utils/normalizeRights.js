export const normalizeRights = (modules = []) => {
  const rightsMap = {};

  modules.forEach((module) => {
    (module.userRights || []).forEach((page) => {  
      if (!page.pageName) return;                  

      const existing = rightsMap[page.pageName];
      if (existing) {
        rightsMap[page.pageName] = {
          view:   existing.view   || !!page.view,
          add:    existing.add    || !!page.add,
          edit:   existing.edit   || !!page.edit,
          delete: existing.delete || !!page.delete,
        };
      } else {
        rightsMap[page.pageName] = {
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