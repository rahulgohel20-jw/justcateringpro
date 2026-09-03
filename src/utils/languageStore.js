let currentLang = localStorage.getItem("lang") || "en";
const listeners = new Set();

export const getLang = () => currentLang;

export const setLang = (lang) => {
  currentLang = lang;
  localStorage.setItem("lang", lang);

  listeners.forEach((callback) => callback(lang));
};

export const subscribeLang = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};
