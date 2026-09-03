import ThemeViewer from "./ThemeViewer";

const InvoiceTheme = () => (
  <ThemeViewer
    title="Invoice Report Themes"
    description="Browse all invoice report designs."
    isNameplate={false}
    filterKeyword="INVOICE"
    badgeLabel="Invoice"
    badgeColorClass="bg-green-50 border-green-200 text-green-700"
    badgeDarkColor="bg-green-600"
  />
);

export default InvoiceTheme;