import { Fragment } from "react";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";

// Import your table components
import DailyReportTable from "@/pages/Leave/dashboard/daily_report";
import CumulativeReportTable from "@/pages/Leave/dashboard/cumulative_report";
import MonthlyReportTable from "@/pages/Leave/dashboard/montly_report";

const Leavedashboard = () => {
  return (
    <Fragment>
      <div className="px-4 py-6">
        <Breadcrumbs items={[{ title: "Leave Dashboard" }]} />
        <div className="filters flex flex-wrap items-center justify-between gap-2 my-7">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems">
              <button className="btn btn-light" title="Filter">
                <i className="ki-filled ki-cross"></i> Clear
              </button>
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="today">Empolyee</option>
                <option value="yesterday">Ritesh </option>
                <option value="this week">Jay</option>
                <option value="last week">Meet</option>
                <option value="this month">Rahul</option>
              </select>
            </div>

            <div className="filItems">
              <select className="select pe-7.5">
                <option value="0">Manager</option>
                <option value="3">op1</option>
                <option value="2">op2</option>
              </select>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-6">
          {/* Daily Report */}
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Daily Report</h2>
              <button className="btn btn-success">Download Attendance</button>
            </div>
            <DailyReportTable />
          </div>

          {/* Cumulative Report */}
          <div className="bg-white rounded-xl border p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Cumulative Report</h2>
              <div className="filters flex flex-wrap items-center justify-between gap-2 my-7">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="filItems">
                    <button className="btn btn-light" title="Filter">
                      <i className="ki-filled ki-cross"></i> Clear
                    </button>
                  </div>
                  <div className="filItems">
                    <select className="select pe-7.5">
                      <option value="today">This Month</option>
                      <option value="yesterday">This Week </option>
                      <option value="this week">This Year</option>
                      <option value="last week">Last Week </option>
                      <option value="this month">Custom</option>
                    </select>
                  </div>

                
                </div>
              </div>
              <button className="btn btn-success">Download Attendance</button>
            </div>

            <CumulativeReportTable />
          </div>
        </div>

        {/* Monthly Report */}
        <div className="bg-white rounded-xl border p-5 shadow-sm mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Monthly Report</h2>
            <button className="btn btn-success">Download Report</button>
          </div>
          <MonthlyReportTable />
        </div>
      </div>
    </Fragment>
  );
};

export default Leavedashboard;
