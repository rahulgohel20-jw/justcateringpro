const blue = {
  primary: "rgba(0, 91, 168, 1)",
  primaryActive: "rgba(0, 73, 134, 1)",
  primaryLight: "rgba(51, 124, 185, 1)",
  primaryLighter: "rgba(230, 239, 246, 1)",
  primaryClarity: "rgba(0, 91, 168, 0.10)",
  primaryInverse: "rgba(255, 255, 255, 1)",
};

const teal = {
 primary: "#45634A",
primaryActive: "#526F57",
primaryLight: "#8BB191",
primaryLighter: "#E6F0E7",
primaryClarity: "rgba(101, 134, 106, 0.10)",
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
  primary: "#326B78",
primaryActive: "#26515B",
primaryLight: "#53B2C7",
primaryLighter: "#DEF2F7",
primaryClarity: "rgba(50, 107, 120, 0.10)",
primaryInverse: "#FFFFFF",
};

// const orange = {
//   primary: "#233E63",
// primaryActive: "#1A2D49",
// primaryLight: "#4780CE",
// primaryLighter: "#DDE8F8",
// primaryClarity: "rgba(35, 62, 99, 0.10)",
// primaryInverse: "#FFFFFF",
// };




// Keyed by softType (lowercase). Swap the colors to whatever you want.
export const softTypeThemes = {
  jcx: blue,
  jcxplus: blue,
  jcxpro: blue,
  jcxproplus: blue,
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
  default: blue,
};
