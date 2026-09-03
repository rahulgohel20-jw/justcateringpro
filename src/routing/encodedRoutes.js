export const encodePath = (path) =>
  '/' + btoa(path).replace(/=+$/, '');

// Decode a base64 segment → real path
export const decodePath = (encoded) => {
  try {
    const raw = encoded.startsWith('/')
      ? encoded.slice(1)
      : encoded;
    return atob(raw);
  } catch {
    return null;
  }
};

// Central map: key → encoded path
// Use ROUTES.xxx everywhere instead of plain strings
export const ROUTES = {
  home:              encodePath('/'),
  dashboard:         encodePath('/dashboard'),
  event:             encodePath('/event'),
  addEvent:          encodePath('/add-event'),
  eventOverview:     encodePath('/event-overview'),
  contacts:          encodePath('/contacts'),
  contactDetails:    encodePath('/contacts/details'),
  lead:              encodePath('/lead'),
  leadDetails:       encodePath('/lead/details'),
  payments:          encodePath('/Payments'),
  account:           encodePath('/account'),
  menuPlanning:      encodePath('/menuplaaningmaster'),
  menuItems:         encodePath('/master/menu-items'),
  approvePending:    encodePath('/approvepending'),
  captainRecipe:     encodePath('/captainrecipe'),
  gstReport:         encodePath('/gst-report'),
  journalVoucher:    encodePath('/journal-voucher'),
  addJournal:        encodePath('/journal-voucher/add'),
  plans:             encodePath('/plans'),
  company:           encodePath('/company'),
  product:           encodePath('/product'),
  salesTeam:         encodePath('/team/seals-team'),
  allMembers:        encodePath('/team/all-members'),
  superDashboard:    encodePath('/super-dashboard'),
  overview:          encodePath('/overview'),
  pushNotification:  encodePath('/PushNotification'),
  aiTemplate:        encodePath('/ai-templatemaster'),
  vendor:            encodePath('/vendor'),
  database:          encodePath('/database'),
};