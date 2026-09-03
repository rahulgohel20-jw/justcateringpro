import { TableComponent } from "@/components/table/TableComponent";
import { leadColumns, leadData } from "./constant";

const LeadReportTab = ({ filterType }) => {
  return (
    <TableComponent
      columns={leadColumns}
      data={leadData[filterType]}
      paginationSize={10}
    />
  );
};
export default LeadReportTab;
