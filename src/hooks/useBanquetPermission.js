import { useMemo } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAuthContext } from "@/auth";

export const useBanquetPermission = () => {
  const banquetRights = useAuthStore((state) => state.banquetRights);
  const { currentUser } = useAuthContext();

  const roleId = Number(currentUser?.userBasicDetails?.role?.id);
  const isSuperUser = roleId === 1 || roleId === 2;

const allowedHallIds = useMemo(() => {
  if (isSuperUser) return null;
  if (!banquetRights?.length) return new Set();

  const ids = new Set();
  banquetRights.forEach((r) => {
    if (r.isAllow) ids.add(r.banquetHallId); 
  });
  return ids;
}, [banquetRights, isSuperUser]);

  // Check if a specific hall is allowed
  const isHallAllowed = (banquetHallId) => {
    if (allowedHallIds === null) return true; 
    return allowedHallIds.has(banquetHallId);
  };

 
  const filterHalls = (halls) => {
    if (allowedHallIds === null) return halls; 
    return halls.filter((h) => allowedHallIds.has(h.value ?? h.id));
  };

  return {
    isSuperUser,
    allowedHallIds,
    isHallAllowed,
    filterHalls,
  };
};