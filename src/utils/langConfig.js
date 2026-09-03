export const LANG_KEY_MAP = {
  Gujarati:  { apiKey: "gujarati", lng: "gu" },
  Tamil:     { apiKey: "ta",       lng: "ta" },
  Telugu:    { apiKey: "te",       lng: "te" },
  Malayalam: { apiKey: "ml",       lng: "ml" },
  Marathi:   { apiKey: "mr",       lng: "mr" },
};


export const LANG_LABEL_MAP = {
  Gujarati:  { name: "Name (ગુજરાતી)", address: "Home Address (ગુજરાતી)", notes: "Notes (ગુજરાતી)", symbol: "Symbol (ગુજરાતી), " , script: "ગુજરાતી"},
  Tamil:     { name: "Name (தமிழ்)",   address: "Home Address (தமிழ்)",   notes: "Notes (தமிழ்)",   symbol: "Symbol (தமிழ்)" , script: "தமிழ்"  },
  Telugu:    { name: "Name (తెలుగు)",  address: "Home Address (తెలుగు)",  notes: "Notes (తెలుగు)",  symbol: "Symbol (తెలుగు)"  , script: "తెలుగు"},
  Malayalam: { name: "Name (മലയാളം)",  address: "Home Address (മലയാളം)",  notes: "Notes (മലയാളം)",  symbol: "Symbol (മലയാളം)" , script: "മലയാളം" },
  Marathi:   { name: "Name (मराठी)",   address: "Home Address (मराठी)",   notes: "Notes (मराठी)",   symbol: "Symbol (मराठी)" , script: "मराठी"  },
};

export const LANG_INTL_MAP = {
  Gujarati:  { nameId: "COMMON.NAME_GUJARATI",  addressId: "COMMON.HOME_ADDRESS_GUJARATI",  notesId: "COMMON.NOTES_GUJARATI"  },
  Tamil:     { nameId: "COMMON.NAME_TAMIL",     addressId: "COMMON.HOME_ADDRESS_TAMIL",     notesId: "COMMON.NOTES_TAMIL"     },
  Telugu:    { nameId: "COMMON.NAME_TELUGU",    addressId: "COMMON.HOME_ADDRESS_TELUGU",    notesId: "COMMON.NOTES_TELUGU"    },
  Malayalam: { nameId: "COMMON.NAME_MALAYALAM", addressId: "COMMON.HOME_ADDRESS_MALAYALAM", notesId: "COMMON.NOTES_MALAYALAM" },
  Marathi:   { nameId: "COMMON.NAME_MARATHI",   addressId: "COMMON.HOME_ADDRESS_MARATHI",   notesId: "COMMON.NOTES_MARATHI"   },
};


/**
 * @returns {{ label: string, addressLabel: string, placeholder: string,
 *             addressPlaceholder: string, lng: string, apiKey: string }}
 */
export const getLangConfig = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("auth-storage"));
    const lang = auth?.state?.user?.lang || "Gujarati";

    const keys   = LANG_KEY_MAP[lang]   || LANG_KEY_MAP["Gujarati"];
    const labels = LANG_LABEL_MAP[lang] || LANG_LABEL_MAP["Gujarati"];
    const intl   = LANG_INTL_MAP[lang]  || LANG_INTL_MAP["Gujarati"];

    return {
  label:              labels.name,
  addressLabel:       labels.address,
  notesLabel:         labels.notes,           
  placeholder:        labels.name,
  addressPlaceholder: labels.address,
  notesPlaceholder:   labels.notes,           
  lng:                keys.lng,
  apiKey:             keys.apiKey,
  nameIntlId:         intl.nameId,
  addressIntlId:      intl.addressId,
  notesIntlId:        intl.notesId,  
  symbolLabel:      labels.symbol,       
symbolPlaceholder: labels.symbol, 
script: labels.script,         
};
  } catch {
    return {
  label:              "Name (ગુજરાતી)",
  addressLabel:       "Home Address (ગુજરાતી)",
  notesLabel:         "Notes (ગુજરાતી)",     
  placeholder:        "Name (ગુજરાતી)",
  addressPlaceholder: "Home Address (ગુજરાતી)",
  notesPlaceholder:   "Notes (ગુજરાતી)",     
  lng:                "gu",
  apiKey:             "gujarati",
  nameIntlId:         "COMMON.NAME_GUJARATI",
  addressIntlId:      "COMMON.HOME_ADDRESS_GUJARATI",
  notesIntlId:        "COMMON.NOTES_GUJARATI",
  symbolLabel:      labels.symbol,       
symbolPlaceholder: labels.symbol,
script: labels.script, 
};
  }
};

/**
 * Pass raw Translateapi response → returns { regional, hindi }
 * so callers never need to know the dynamic key.
 *
 * Usage:
 *   const { regional, hindi } = extractTranslations(res.data);
 */
export const extractTranslations = (data) => {
  const { apiKey } = getLangConfig();
  return {
    regional: data?.[apiKey] || "",
    hindi:    data?.hindi    || "",
  };
};

export const getLocalizedName = (obj, locale) => {
  if (!obj) return "";
  if (locale === "hi") return obj.nameHindi || obj.nameEnglish;
  if (locale === "gu") return obj.nameGujarati || obj.nameEnglish;
  return obj.nameEnglish;
};