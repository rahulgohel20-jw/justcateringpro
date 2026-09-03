import { TranslateHindi, TranslateGujarati } from "@/services/apiServices";

export const useAutoTranslation = () => {
  const getLanguage = () => {
    try {
      const config = JSON.parse(localStorage.getItem("i18nConfig"));
      return config?.code || "en";
    } catch {
      return "en";
    }
  };

  const translate = async (text) => {
    if (!text) return "";

    const lang = getLanguage();

    if (lang === "en") return text;

    try {
      if (lang === "hi") {
        const res = await TranslateHindi({ text });
        return (
          res?.data?.text ||
          res?.data?.translatedText ||
          res?.translatedText ||
          res?.data?.translated_text ||
          res?.translated_text ||
          text
        );
      }

      if (lang === "gu") {
        const res = await TranslateGujarati({ text });
        return (
          res?.data?.text ||
          res?.data?.translatedText ||
          res?.translatedText ||
          res?.data?.translated_text ||
          res?.translated_text ||
          text
        );
      }

      return text;
    } catch (e) {
      return text;
    }
  };

  return { translate };
};
