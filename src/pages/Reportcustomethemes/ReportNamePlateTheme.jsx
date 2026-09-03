import ThemeViewer from "./ThemeViewer";

const ReportNamePlateTheme = () => (
  <ThemeViewer
    title="Nameplate Themes"
    description="Browse all nameplate designs available for your reports."
    isNameplate={true}
    filterKeyword={null}
    badgeLabel="Nameplate"
    badgeColorClass="bg-blue-50 border-blue-200 text-blue-700"
     badgeDarkColor="bg-blue-600" 
  />
);

export default ReportNamePlateTheme;