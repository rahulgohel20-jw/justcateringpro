import {
  Copy,
  CopyPlus,
  Eye,
  ListOrdered,
  Logs,
  Pen,
  Plus,
  Trash,
} from "lucide-react";
import CardList from "@/components/card-list/CardList";
import { underConstruction } from "@/underConstruction";

import { useState } from "react";

const ExportLead = () => {
  const [timeRange, setTimeRange] = useState("This Month");
  const [pipeline, setPipeline] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  const handleExport = () => {
      underConstruction()
    // alert("Leads exported!");
  };

  return (
    <>
      <div className="grid grid-cols-9 gap-3 lg:gap-4 mt-5">
        <div className="col-span-3 col-start-4">
          <div className="card min-w-full py-5 px-6">
            <h2 className="text-lg font-semibold mb-3">Export Leads</h2>
            <div className="flex flex-col gap-y-3">
              <div className="flex flex-col">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="select pe-7.5"
                >
                  <option value="0">Select Month</option>
                  <option value="This Month">This Month</option>
                  <option value="Last Month">Last Month</option>
                  <option value="This Year">This Year</option>
                </select>
              </div>
              <div className="flex flex-col">
                <select
                  value={pipeline}
                  onChange={(e) => setPipeline(e.target.value)}
                  className="select pe-7.5"
                  // disabled
                >
                  <option value="0">Select Pipeline</option>
                  <option value="Pipeline 1">Pipeline 1</option>
                  <option value="Pipeline 2">Pipeline 2</option>
                  <option value="Pipeline 3">Pipeline 3</option>
                </select>
              </div>
              <div className="flex flex-col">
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="select pe-7.5"
                  // disabled
                >
                  <option value="0">Select User</option>
                  <option value="User 1">User 1</option>
                  <option value="User 2">User 2</option>
                  <option value="User 3">User 3</option>
                </select>
              </div>
              <div className="text-center">
                <button
                  onClick={handleExport}
                  className="btn btn-success justify-center w-full"
                  title="Export Leads"
                >
                  <i className="ki-filled ki-file-down"></i>
                  Export Leads
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export { ExportLead };
