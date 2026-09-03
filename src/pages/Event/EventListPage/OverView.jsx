import { useState } from "react";
import MenuAllocation from "./MenuAllocation";
import Rawmaterial from "./Rawmaterial";
import AgencyAllocation from "./AgencyAllocation";
const IconFileText = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);
const IconUpload = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const IconSelect = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

function SelectDropdown({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
        {label}
      </label>
      <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 cursor-pointer min-w-[190px] hover:border-blue-300 transition-colors">
        <span className="text-[13.5px] font-medium text-slate-800 flex-1">
          {value}
        </span>
        <span className="text-slate-400">
          <IconSelect />
        </span>
      </div>
    </div>
  );
}
export default function OverView() {
  const [activeTab, setActiveTab] = useState("Execution");
  const tabs = ["Execution", "Raw Material", "Agency Distribution"];

  return (
    <div>
      <div className="bg-white   pr-8 pl-8 flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-4 flex-wrap">
          <SelectDropdown label="Party Name" value="Royal Caterers" />
          <SelectDropdown label="Events" value="Annual Leadership Summit" />
        </div>

        <div className="flex flex-col gap-2 items-end">
          <button className="flex items-center gap-2 bg-primary text-white text-[13px] font-semibold px-4 py-2 rounded-lg shadow shadow-blue-200 transition-colors whitespace-nowrap">
            <IconFileText /> Generate Overall Report
          </button>
        </div>
      </div>

      <div className="pr-8 pl-8 pt-8 ">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="text-[22px] font-bold text-slate-900 leading-tight">
              Menu Execution
            </h1>
            <p className="text-[13px] text-slate-400 mt-1 font-normal">
              Real-time monitoring of personnel and deployment
            </p>
          </div>

          <div className="flex items-start  gap-4">
            <div className="flex bg-slate-100 rounded-xl p-1 gap-0.5 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-[13px] font-medium rounded-lg transition-all whitespace-nowrap
                  ${
                    activeTab === tab
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700 bg-transparent"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div>
              <button className="flex items-center gap-2 bg-white hover:bg-blue-50 text-primary border  text-[13px] font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap">
                <IconUpload /> Report
              </button>
            </div>
          </div>
        </div>
        {activeTab === "Execution" ? <MenuAllocation /> : ""}
        {activeTab === "Raw Material" ? <Rawmaterial /> : ""}
        {activeTab === "Agency Distribution" ? <AgencyAllocation /> : ""}
      </div>
    </div>
  );
}
