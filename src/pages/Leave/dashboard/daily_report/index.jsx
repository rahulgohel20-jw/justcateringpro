import { TableComponent } from "@/components/table/TableComponent";
import { dailyReportData, dailyReportColumns } from "./Daily_constant";

const DailyReportTable = () => {
  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white text-black px-4 py-2 border border-blue-500 rounded shadow text-sm font-medium">
         Total: <span className="font-bold">5</span>
        </div>
        <div className="bg-white text-black px-4 py-2 border border-red-500 rounded shadow text-sm font-medium">
          On Leave: <span className="font-bold">0</span>
        </div>
        <div className="bg-white text-black px-4 py-2 border border-yellow-500 rounded shadow text-sm font-medium">
          Present: <span className="font-bold">0</span>
        </div>
        <div className="bg-white text-black px-4 py-2 border border-green-500 rounded shadow text-sm font-medium">
          Absent: <span className="font-bold">5</span>
        </div>
      </div>
      <TableComponent
        columns={dailyReportColumns}
        data={dailyReportData}
        paginationSize={10}
      />
    </div>
  );
};

export default DailyReportTable;
