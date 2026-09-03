import { TableComponent } from "@/components/table/TableComponent";
import { columns as salesColumns, salesData } from "./constant";

const ReportTab = ({ filterType }) => {
  return (
    <TableComponent
      columns={salesColumns}
      data={salesData[filterType]}
      paginationSize={10}
    />
  );
};
export default ReportTab;
