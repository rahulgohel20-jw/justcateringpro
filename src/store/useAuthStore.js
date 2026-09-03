import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      rights: {},
      normalizedRights: {},
      upgradedModules: [],
      roleReportRights: null,
      banquetRights: [],
      stockTypeRights: [],

      setAuth: (user, token, rights, upgradedModules = [], roleReportRights = null) =>
        set({
          user,
          token,
          rights,
          normalizedRights: rights,
          upgradedModules,
          roleReportRights,
          banquetRights: user?.banquetRights || [],
          stockTypeRights: user?.stockTypeRights || [],
        }),

      clearAuth: () =>
        set({
          user: null,
          token: null,
          rights: {},
          normalizedRights: {},
          upgradedModules: [],
          roleReportRights: null,
          banquetRights: [],
          stockTypeRights: [],
        }),
    }),
    {
      name: "auth-storage",
    },
  ),
);