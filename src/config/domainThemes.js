const blue = {
  primary: "rgba(0, 91, 168, 1)",
  primaryActive: "rgba(0, 73, 134, 1)",
  primaryLight: "rgba(51, 124, 185, 1)",
  primaryLighter: "rgba(230, 239, 246, 1)",
  primaryClarity: "rgba(0, 91, 168, 0.10)",
  primaryInverse: "rgba(255, 255, 255, 1)",
};

const teal = {
  primary: "#0891B2",
  primaryActive: "#0E7490",
  primaryLight: "#22D3EE",
  primaryLighter: "#CFFAFE",
  primaryClarity: "rgba(8, 145, 178, 0.10)",
  primaryInverse: "#FFFFFF",
};

const purple = {
  primary: "rgba(102, 51, 153, 1)",
  primaryActive: "rgba(82, 41, 122, 1)",
  primaryLight: "rgba(153, 102, 204, 1)",
  primaryLighter: "rgba(240, 230, 255, 1)",
  primaryClarity: "rgba(102, 51, 153, 0.10)",
  primaryInverse: "rgba(255, 255, 255, 1)",
};

const orange = {
  primary: "#EA580C",
  primaryActive: "#C2410C",
  primaryLight: "#FB923C",
  primaryLighter: "#FFEDD5",
  primaryClarity: "rgba(234, 88, 12, 0.10)",
  primaryInverse: "#FFFFFF",
};

// Keyed by softType (lowercase). Swap the colors to whatever you want.
export const softTypeThemes = {
  jcx: blue,
  jcxplus: teal,
  jcxpro: orange,
  jcxproplus: purple,
};

// Existing hostname themes, now used only as a fallback
export const domainThemes = {
  "app.justcatering.in": blue,
  "app.justcateringpro.in": purple,
  "app.justbanq.in": {
    primary: "rgba(204, 51, 51, 1)",
    primaryActive: "rgba(163, 41, 41, 1)",
    primaryLight: "rgba(224, 102, 102, 1)",
    primaryLighter: "rgba(255, 235, 235, 1)",
    primaryClarity: "rgba(204, 51, 51, 0.10)",
    primaryInverse: "rgba(255, 255, 255, 1)",
  },
  default: purple,
};