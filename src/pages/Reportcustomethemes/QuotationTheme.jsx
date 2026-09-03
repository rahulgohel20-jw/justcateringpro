import ThemeViewer from "./ThemeViewer";

const QuotationTheme = () => (
  <ThemeViewer
    title="Quotation Report Themes"
    description="Browse all quotation report designs."
    isNameplate={false}
    filterKeyword="QUOTATION"
    badgeLabel="Quotation"
    badgeColorClass="bg-purple-50 border-purple-200 text-purple-700"
    
    badgeDarkColor="bg-purple-600"
  />
);

export default QuotationTheme;