
import { domainThemes } from "./domainThemes";

export const applyDomainTheme = () => {
  const hostname = window.location.hostname;
  const theme = domainThemes[hostname] || domainThemes["default"];

  const root = document.documentElement;

  root.style.setProperty("--tw-primary", theme.primary);
  root.style.setProperty("--tw-primary-active", theme.primaryActive);
  root.style.setProperty("--tw-primary-light", theme.primaryLight);
  root.style.setProperty("--tw-primary-lighter", theme.primaryLighter);
  root.style.setProperty("--tw-primary-clarity", theme.primaryClarity);
  root.style.setProperty("--tw-primary-inverse", theme.primaryInverse);
};