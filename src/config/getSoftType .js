
export const DEFAULT_SOFT_TYPE = "jcx";

export const getSoftType = () => {
  const hostname =
    typeof window !== "undefined" ? window.location?.hostname : null;

  if (!hostname) return DEFAULT_SOFT_TYPE;

  return hostname === "app.justcateringpro.in" ? "jcxpro" : DEFAULT_SOFT_TYPE;
};