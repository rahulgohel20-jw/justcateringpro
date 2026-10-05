import { useCallback, useMemo } from "react";

const readAuthState = () => {
  try {
    return JSON.parse(localStorage.getItem("auth-storage"))?.state ?? {};
  } catch {
    return {};
  }
};

export const useExpensePermission = () => {
  const { isSuperUser, allowedIds, allowedNames } = useMemo(() => {
    const state = readAuthState();
    const roleId = Number(state?.roleReportRights?.roleId);

    const allowed = (state?.expenseRights ?? []).filter(
      (r) => r.isAllow === true,
    );

    return {
      isSuperUser: roleId === 1 || roleId === 2,
      allowedIds: new Set(allowed.map((r) => Number(r.expenseId ?? r.id))),
      allowedNames: new Set(
        allowed.map((r) => String(r.expenseName ?? "").trim().toLowerCase()),
      ),
    };
  }, []);

  // Super users see everything; others match by id, then by name
  const isExpenseAllowed = useCallback(
    (id, name) => {
      if (isSuperUser) return true;
      if (id != null && allowedIds.has(Number(id))) return true;
      if (name && allowedNames.has(String(name).trim().toLowerCase())) {
        return true;
      }
      return false;
    },
    [isSuperUser, allowedIds, allowedNames],
  );

  // "all" and "trip" have no type id, so they are always kept
  const filterTabs = useCallback(
  (tabs) =>
    tabs.filter((t) => {
      if (t.id == null && !t.typeId && !t.incomeExpenseTypeId) return true; // all / trip
      const ids = [t.id, t.typeId, t.incomeExpenseTypeId];
      const names = [t.label, t.key, t.name];
      return (
        isSuperUser ||
        ids.some((v) => v != null && allowedIds.has(Number(v))) ||
        names.some((v) => v && allowedNames.has(String(v).trim().toLowerCase()))
      );
    }),
  [isSuperUser, allowedIds, allowedNames],
);

  return { isSuperUser, isExpenseAllowed, filterTabs };
};