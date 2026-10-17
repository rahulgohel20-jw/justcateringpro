// auth/routeAccess.js

import { allMenuItems } from "../config/menu.config";


const flatten = (items) =>
  items.flatMap((i) => [
    ...(i.path && i.path !== "#" && i.path !== "/" && i.pageName
      ? [{ path: i.path.toLowerCase(), pageName: i.pageName }]
      : []),
    ...flatten(i.children ?? []),
  ]);

// Explicit rules. These win over the menu, and cover pages that aren't in the menu.
// pageName must match the key in your `rights` object exactly.
const OVERRIDES = [
  { path: "/labour-and-other-management", pageName: "Labour Agency Order" },
  { path: "/allreports", pageName: "Events Report" },
  { path: "/expense-management", pageName: "Expense Management" },
  { path: "/add-invoice", pageName: "Invoice" },
  { path: "/stock-management/purchase/add", pageName: "Purchase" },
  { path: "/journal-voucher/add", pageName: "Journal Voucher" },
  // add more as you find them
];

let rules;
const getRules = () => {
  if (!rules) {
    const map = new Map();
    flatten(allMenuItems(() => {})).forEach((r) => map.set(r.path, r));
    OVERRIDES.forEach((r) => map.set(r.path, r)); // overrides replace menu entries
    rules = [...map.values()].sort((a, b) => b.path.length - a.path.length); // longest prefix wins
  }
  return rules;
};

export const findRule = (pathname) => {
  const p = pathname.toLowerCase().replace(/\/$/, "");
  return getRules().find((r) => p === r.path || p.startsWith(r.path + "/"));
};