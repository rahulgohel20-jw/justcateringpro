
import { useAuthStore } from "@/store/useAuthStore";

export const useModuleAccess = () => {
  const upgradedModules = useAuthStore((state) => state.upgradedModules);

  const hasModuleAccess = (moduleName) => {
    return upgradedModules?.some(
      (m) => m.moduleName === moduleName && m.isActive && m.isPayDone
    );
  };

  return { hasModuleAccess };
};