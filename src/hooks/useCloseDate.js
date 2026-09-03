import { useQuery, useMutation, useQueryClient } from "react-query";
import { Closedate, saveclosedate } from "@/services/apiServices";

// ─── Always reads from localStorage ──────────────────────────────────────────
const getStoredUserId = () => {
  const mainId = localStorage.getItem("mainId");
  const userId = localStorage.getItem("userId");
  const resolved = Number(mainId || userId);
  return Number.isFinite(resolved) && resolved > 0 ? resolved : null;
};

// ─── Query keys ───────────────────────────────────────────────────────────────
export const closeDateKeys = {
  all: (year, userId) => ["closeDate", "all", year, userId],
  single: (month, year, userId) => ["closeDate", "single", month, year, userId],
};

// ─── Shapers ──────────────────────────────────────────────────────────────────
const shapeAllResponse = (res) => {
  const dates = res?.data?.closeDate?.dates ?? [];
  if (dates.length === 0) return {};

  return dates.reduce((map, d) => {
    const key = `${d.year}-${d.month}`;
    map[key] = {
      key,
      closeDateId: d.closeDateId,
      month: d.month,        
      year: d.year,
      startDate: d.startDate,
      closeDate: d.closeDate,
      closeDay: d.closeDate
        ? parseInt(d.closeDate.split("/")[0], 10)
        : null,
      isActive: d.isActive ?? false,
    };
    return map;
  }, {});
};

const shapeSingleResponse = (res) => {
  const d = res?.data?.closeDate ?? null;
  if (!d) return null;
  return {
    key: `${d.year}-${d.month}`,
    closeDateId: d.closeDateId,
    month: d.month,          // 1-based
    year: d.year,
    startDate: d.startDate,
    closeDate: d.closeDate,
    closeDay: d.closeDate
      ? parseInt(d.closeDate.split("/")[0], 10)
      : null,
    isActive: d.isActive ?? false,
  };
};

// ─── useCloseDateAll ──────────────────────────────────────────────────────────
// userId param is optional — always falls back to localStorage
export const useCloseDateAll = (year, userId = undefined, options = {}) => {
  // If caller passes explicit userId use it, otherwise read localStorage
  const resolvedUserId = userId ?? getStoredUserId();

  const { data, isLoading, isError, refetch } = useQuery(
    closeDateKeys.all(year, resolvedUserId),
    () => Closedate(-1, year, resolvedUserId),
    {
      select: shapeAllResponse,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      enabled: !!year && !!resolvedUserId,  // waits for valid userId
      ...options,
    },
  );

  return {
    monthCloseDates: data ?? {},
    isLoading,
    isError,
    refetch,
  };
};

// ─── useCloseDateSingle ───────────────────────────────────────────────────────
export const useCloseDateSingle = (
  month,
  year,
  userId = undefined,
  options = {},
) => {
  const resolvedUserId = userId ?? getStoredUserId();

  const { data, isLoading, isError, refetch } = useQuery(
    closeDateKeys.single(month, year, resolvedUserId),
    () => Closedate(month + 1, year, resolvedUserId),
    {
      select: shapeSingleResponse,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      enabled: month != null && !!year && !!resolvedUserId,
      ...options,
    },
  );

  return {
    closeDateEntry: data ?? null,
    isLoading,
    isError,
    refetch,
  };
};

// ─── useSaveCloseDate ─────────────────────────────────────────────────────────
export const useSaveCloseDate = (month, year, userId = undefined) => {
  const resolvedUserId = userId ?? getStoredUserId();
  const queryClient = useQueryClient();

  const {
    mutate,
    mutateAsync,
    isLoading: isSaving,
    isError,
    error,
  } = useMutation(
    ({ startDate, endDate }) =>
      saveclosedate(startDate, endDate, resolvedUserId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(closeDateKeys.all(year, resolvedUserId));
        queryClient.invalidateQueries(
          closeDateKeys.single(month, year, resolvedUserId),
        );
      },
    },
  );

  return {
    saveCloseDate: mutate,
    saveDateAsync: mutateAsync,
    isSaving,
    isError,
    error,
  };
};

// ─── Default hook ─────────────────────────────────────────────────────────────
// Usage on ANY page — userId always comes from localStorage automatically:
//
//   useCloseDate(month, year)              ← reads localStorage automatically
//   useCloseDate(month, year, explicitId)  ← uses explicit id (still valid)
//
const useCloseDate = (month, year, userId = undefined) => {
  const resolvedUserId = userId ?? getStoredUserId();

  const { monthCloseDates, isLoading, isError, refetch } = useCloseDateAll(
    year,
    resolvedUserId,
  );
  const { saveCloseDate, isSaving } = useSaveCloseDate(
    month,
    year,
    resolvedUserId,
  );

  return {
    monthCloseDates,
    isLoading,
    isError,
    refetch,
    isSaving,
    saveCloseDate: (payload, callbacks) => saveCloseDate(payload, callbacks),
  };
};

export default useCloseDate;