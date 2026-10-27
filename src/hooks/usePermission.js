import { useAuthStore } from "@/store/useAuthStore";
import { useAuthContext } from "@/auth";

// Pages listed here are NEVER auto-granted by the Super Admin / Admin
// bypass below - they always reflect whatever was actually assigned in
// rights, even for role 1 / 2. Add more page names here if you need the
// same "no free pass" behaviour for other toggles in future.
const EXCLUDED_FROM_SUPERUSER_BYPASS = ["Lock Back Date Entry"];

const DEFAULT_RIGHTS = {
  view: false,
  add: false,
  edit: false,
  delete: false,
};

export const usePermission = (pageName) => {
  const rights = useAuthStore((state) => state.rights);

  const { currentUser } = useAuthContext();

  const roleId = Number(currentUser?.userBasicDetails?.role?.id);

  const isSuperUser = roleId === 1 || roleId === 2;

  if (isSuperUser && !EXCLUDED_FROM_SUPERUSER_BYPASS.includes(pageName)) {
    return {
      view: true,
      add: true,
      edit: true,
      delete: true,
    };
  }

  if (!pageName) return DEFAULT_RIGHTS;
  const clean = pageName.trim();
  if (rights?.[clean]) return rights[clean];
  const lower = clean.toLowerCase();
  const matchedKey = Object.keys(rights || {}).find(
    (k) => k.trim().toLowerCase() === lower
  );
  return matchedKey ? rights[matchedKey] : DEFAULT_RIGHTS;
};