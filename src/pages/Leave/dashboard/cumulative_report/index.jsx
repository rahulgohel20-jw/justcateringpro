import { TableComponent } from "@/components/table/TableComponent";
import {
  cumulativeReportColumns,
  cumulativeReportData,
} from "./Cumulative_constant";

const CumulativeReportTable = () => {
  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white text-black px-4 py-2 border border-blue-500 rounded shadow text-sm font-medium">
         Total Days: <span className="font-bold">0</span>
        </div>
        <div className="bg-white text-black px-4 py-2 border border-red-500 rounded shadow text-sm font-medium">
        working: <span className="font-bold">0</span>
        </div>
        <div className="bg-white text-black px-4 py-2 border border-yellow-500 rounded shadow text-sm font-medium">
        Week Offs <span className="font-bold">24</span>
        </div>
        <div className="bg-white text-black px-4 py-2 border border-pink-500 rounded shadow text-sm font-medium">
          Holidays: <span className="font-bold">0</span>
        </div>
      </div>
      <TableComponent
        columns={cumulativeReportColumns}
        data={cumulativeReportData}
        paginationSize={10}
        headerClassName="bg-black text-white"
      />
    </div>
  );
};

export default CumulativeReportTable;
