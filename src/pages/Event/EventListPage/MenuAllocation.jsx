import { useState } from "react";

const chefLabourData = [
  {
    date: "Oct 24, 2023",
    name: "Executive Chef Marcus",
    number: "9998989880",
    persons: "12 Persons",
  },
  {
    date: "Oct 24, 2023",
    name: "Sous Chef Elena",
    number: "9998989880",
    persons: "08 Persons",
  },
  {
    date: "Oct 25, 2023",
    name: "Chef de Partie Julian",
    number: "9998989880",
    persons: "15 Persons",
  },
  {
    date: "Oct 25, 2023",
    name: "Patisserie Lead Sarah",
    number: "9998989880",
    persons: "06 Persons",
  },
];

const IconChef = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#3B6FD4"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21a1 1 0 0 0 1-1v-5.35c0-.457.316-.844.727-1.041a4 4 0 0 0-2.134-7.589 5 5 0 0 0-9.186 0 4 4 0 0 0-2.134 7.588c.411.198.727.585.727 1.041V20a1 1 0 0 0 1 1Z" />
    <path d="M8 21h8" />
    <path d="M12 11v10" />
  </svg>
);
const IconHome = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#3B6FD4"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconMonitor = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#3B6FD4"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);
const IconChevronDown = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconChevronUp = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

function CollapsibleSection({ icon, title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            {icon}
          </span>
          <span className="text-[15px] font-semibold text-slate-800">
            {title}
          </span>
        </div>
        <span className="text-slate-400">
          {open ? <IconChevronUp /> : <IconChevronDown />}
        </span>
      </button>

      {open && children}
    </div>
  );
}

function MenuAllocation() {
  return (
    <div className="flex flex-col gap-3">
      {/* Chef Labour */}
      <CollapsibleSection
        icon={<IconChef />}
        title="Chef Labour"
        defaultOpen={true}
      >
        {/* Table Header */}
        <div className="grid grid-cols-4 px-5 py-2.5 bg-slate-50 border-t border-b border-slate-100">
          {["DATE", "NAME", "NUMBER", "NO. OF PERSONS"].map((h) => (
            <span
              key={h}
              className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider"
            >
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-slate-50">
          {chefLabourData.map((row, i) => (
            <div key={i} className="grid grid-cols-4 px-5 py-3.5 items-center">
              <span className="text-[13px] text-slate-500">{row.date}</span>
              <span className="text-[13.5px] font-semibold text-slate-800">
                {row.name}
              </span>
              <span className="text-[13px] text-slate-500">{row.number}</span>
              <span>
                <span className="inline-block bg-blue-50 text-primary text-[12px] font-medium px-3 py-1 rounded-full">
                  {row.persons}
                </span>
              </span>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      {/* Outside */}
      <CollapsibleSection
        icon={<IconHome />}
        title="Outside"
        defaultOpen={false}
      >
        <div className="px-5 py-5 text-[13px] text-slate-400 border-t border-slate-100">
          No outside data available.
        </div>
      </CollapsibleSection>

      {/* Inside */}
      <CollapsibleSection
        icon={<IconMonitor />}
        title="Inside"
        defaultOpen={false}
      >
        <div className="px-5 py-5 text-[13px] text-slate-400 border-t border-slate-100">
          No inside data available.
        </div>
      </CollapsibleSection>
    </div>
  );
}

export default MenuAllocation;
