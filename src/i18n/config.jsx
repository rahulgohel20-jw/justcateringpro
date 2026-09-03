import { toAbsoluteUrl } from "@/utils";

import arMessages from "./messages/ar.json";
import enMessages from "./messages/en.json";
import frMessages from "./messages/fr.json";
import zhMessages from "./messages/zh.json";
import hiMessages from "./messages/hi.json";
import guMessages from "./messages/gu.json";
import mrMessages from "./messages/mr.json";
import taMessages from "./messages/ta.json";
import teMessages from "./messages/te.json";
import mlMessages from "./messages/ml.json";

const I18N_MESSAGES = {
  en: enMessages,
  ar: arMessages,
  fr: frMessages,
  zh: zhMessages,
  hi: hiMessages,
  gu: guMessages,
  mr: mrMessages,
  ta: taMessages,
  te: teMessages,
  ml: mlMessages,
};

const ALL_I18N_LANGUAGES = [
  {
    label: "English",
    code: "en",
    direction: "ltr",
    flag: toAbsoluteUrl("/media/flags/united-states.svg"),
    messages: I18N_MESSAGES.en,
  },
  {
    label: "Hindi",
    code: "hi",
    direction: "ltr",
    flag: toAbsoluteUrl("/media/flags/india.svg"),
    messages: I18N_MESSAGES.hi,
  },
  {
    label: "Gujarati",
    code: "gu",
    direction: "ltr",
    flag: toAbsoluteUrl("/media/flags/india.svg"),
    messages: I18N_MESSAGES.gu,
  },
  {
    label: "Marathi",
    code: "gu",
    direction: "ltr",
    flag: toAbsoluteUrl("/media/flags/india.svg"),
    messages: I18N_MESSAGES.mr,
  },
  {
    label: "Tamil",
    code: "gu",
    direction: "ltr",
    flag: toAbsoluteUrl("/media/flags/india.svg"),
    messages: I18N_MESSAGES.ta,
  },
  {
    label: "Telugu",
    code: "gu",
    direction: "ltr",
    flag: toAbsoluteUrl("/media/flags/india.svg"),
    messages: I18N_MESSAGES.te,
  },
  {
    label: "Malayalam",
    code: "gu",
    direction: "ltr",
    flag: toAbsoluteUrl("/media/flags/india.svg"),
    messages: I18N_MESSAGES.ml,
  },
];

// ✅ Read user's preferred language from auth storage
const auth = (() => {
  try {
    return JSON.parse(localStorage.getItem("auth-storage"));
  } catch {
    return null;
  }
})();

const userLang = auth?.state?.user?.lang;


const I18N_LANGUAGES = (() => {
  // No language selected → show English + Hindi + Gujarati
  if (!userLang) {
    
    return ALL_I18N_LANGUAGES.filter((l) =>
      ["English", "Hindi", "Gujarati"].includes(l.label),
    );
  }

  const matched = ALL_I18N_LANGUAGES.find(
    (l) => l.label.toLowerCase() === userLang.toLowerCase(),
  );

  console.log(
    "[i18n] Matched language:",
    matched ?? "No match found — showing English + Hindi only",
  );

  // Language selected → always English + Hindi + selected lang (no duplicates)
  const base = ["English", "Hindi"];
  const selectedLabel = matched?.label;

  const labelsToShow = selectedLabel
    ? [...new Set([...base, selectedLabel])]
    : base;

  return ALL_I18N_LANGUAGES.filter((l) => labelsToShow.includes(l.label));
})();

const I18N_DEFAULT_LANGUAGE = I18N_LANGUAGES[0];

const I18N_CONFIG_KEY = "i18nConfig";

export {
  I18N_CONFIG_KEY,
  I18N_DEFAULT_LANGUAGE,
  I18N_LANGUAGES,
  I18N_MESSAGES,
};
