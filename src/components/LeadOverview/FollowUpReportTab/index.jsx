import { TableComponent } from "@/components/table/TableComponent";
import { followUpColumns, followUpData } from "./constant";

const FollowUpReportTab = ({ filterType }) => {
  return (
    <TableComponent
      columns={followUpColumns}
      data={followUpData[filterType]}
      paginationSize={10}
    />
  );
};
export default FollowUpReportTab;
