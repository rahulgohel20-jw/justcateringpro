import { useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthContext } from "@/auth";

export const useStockTypePermission = () => {
  const stockTypeRights = useAuthStore((state) => state.stockTypeRights);
  const { currentUser } = useAuthContext();

  const roleId = Number(currentUser?.userBasicDetails?.role?.id);
  const isSuperUser = roleId === 1 || roleId === 2;

  // Unlike banquetRights (which carries an isAllow flag per record),
  // stockTypeRights only lists the stock types the user IS allowed to see —
  // presence in the array means allowed.
  const allowedStockTypeIds = useMemo(() => {
    if (isSuperUser) return null;
    if (!stockTypeRights?.length) return new Set();

    const ids = new Set();
    stockTypeRights.forEach((r) => {
      ids.add(r.stockTypeId);
    });
    return ids;
  }, [stockTypeRights, isSuperUser]);

  // Check if a specific stock type is allowed
  const isStockTypeAllowed = (stockTypeId) => {
    if (allowedStockTypeIds === null) return true;
    return allowedStockTypeIds.has(stockTypeId);
  };

  // Filter a list of stock types down to only the allowed ones
  const filterStockTypes = (stockTypes) => {
    if (allowedStockTypeIds === null) return stockTypes;
    return stockTypes.filter((st) =>
      allowedStockTypeIds.has(st.value ?? st.id ?? st.stockTypeId),
    );
  };

  return {
    isSuperUser,
    allowedStockTypeIds,
    isStockTypeAllowed,
    filterStockTypes,
  };
};