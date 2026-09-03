import { useCallback } from "react";
import {
  GetRawmaterialforitem,
  GetUnitData,
  GetAllContactCategorybycontacttype,
  OutsideContactName,
  GetAllCategoryformenu,
  Getmenusubcategory,
  GetPartyMasterByCatId,
} from "@/services/apiServices";

export default function useMenuApi(userId) {
  const getRawMaterial = useCallback(
    () => GetRawmaterialforitem(userId),
    [userId]
  );

  const getUnits = useCallback(() => GetUnitData(userId), []);
  const getContactCategory = useCallback(
    () => GetAllContactCategorybycontacttype(6, userId),
    [userId]
  );
  const getContactNames = useCallback(
    (type) => OutsideContactName(type, userId),
    [userId]
  );
  const getCategories = useCallback(
    () => GetAllCategoryformenu(userId),
    [userId]
  );
  const getSubCategories = useCallback(
    (id) => Getmenusubcategory(id, userId),
    [userId]
  );
  const getPartyByCategory = useCallback(
    (id) => GetPartyMasterByCatId(id, userId),
    [userId]
  );

  return {
    getRawMaterial,
    getUnits,
    getContactCategory,
    getContactNames,
    getCategories,
    getSubCategories,
    getPartyByCategory,
  };
}
