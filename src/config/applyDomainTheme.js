import { domainThemes, softTypeThemes } from "./domainThemes";

export const getSoftType = () => {
  try {
    const raw = localStorage.getItem("auth-storage");
    const softType = raw ? JSON.parse(raw)?.state?.user?.softType : null;
    console.log("getSoftType", softType);
    return softType ? String(softType).trim().toLowerCase() : null;
  } catch {
    return null;
  }
};

export const applyDomainTheme = (softTypeOverride) => {
  const softType = softTypeOverride
    ? String(softTypeOverride).trim().toLowerCase()
    : getSoftType();
  const theme =
    softTypeThemes[softType] ||                       // 1. user's softType
    domainThemes[window.location.hostname] ||         // 2. hostname
    domainThemes.default;                             // 3. default

  const root = document.documentElement;
  root.style.setProperty("--tw-primary", theme.primary);
  root.style.setProperty("--tw-primary-active", theme.primaryActive);
  root.style.setProperty("--tw-primary-light", theme.primaryLight);
  root.style.setProperty("--tw-primary-lighter", theme.primaryLighter);
  root.style.setProperty("--tw-primary-clarity", theme.primaryClarity);
  root.style.setProperty("--tw-primary-inverse", theme.primaryInverse);
};