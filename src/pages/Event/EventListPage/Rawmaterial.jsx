import React, { useState } from "react";

const inventoryData = [
  {
    id: 1,
    date: "Oct 24, 2023",
    agencyName: "Global Logistics Corp",
    quantity: "1,240 Units",
    total: 100,
    iconBg: "bg-indigo-50",
    iconColor: "#4F6EF7",
    icon: "building",
  },
  {
    id: 2,
    date: "Oct 22, 2023",
    agencyName: "SteelCraft Industries",
    total: 100,
    quantity: "850 Units",
    iconBg: "bg-orange-50",
    iconColor: "#E07A3A",
    icon: "factory",
  },
  {
    id: 3,
    date: "Oct 21, 2023",
    agencyName: "Apex Raw Materials",
    total: 100,
    quantity: "2,100 Units",
    iconBg: "bg-indigo-50",
    iconColor: "#4F6EF7",
    icon: "building",
  },
  {
    id: 4,
    date: "Oct 18, 2023",
    agencyName: "Foundry Solutions",
    total: 100,
    quantity: "430 Units",
    iconBg: "bg-orange-50",
    iconColor: "#E07A3A",
    icon: "warehouse",
  },
  {
    id: 5,
    date: "Oct 15, 2023",
    agencyName: "Summit Distribution",
    total: 100,
    quantity: "3,200 Units",

    iconBg: "bg-indigo-50",
    iconColor: "#4F6EF7",
    icon: "building",
  },
];

const BuildingIcon = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="2"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
    />
    <path d="M9 9h2v2H9zM13 9h2v2h-2zM9 13h2v2H9zM13 13h2v2h-2z" fill={color} />
    <path d="M10 21v-4h4v4" stroke={color} strokeWidth="1.8" fill="none" />
  </svg>
);

const FactoryIcon = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M2 20V9l5-3v3l5-3v3l5-3v14H2z"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
      strokeLinejoin="round"
    />
    <rect x="6" y="14" width="2" height="3" fill={color} />
    <rect x="11" y="14" width="2" height="3" fill={color} />
    <rect x="16" y="14" width="2" height="3" fill={color} />
  </svg>
);

const WarehouseIcon = ({ color }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 10L12 4l9 6v10H3V10z"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
      strokeLinejoin="round"
    />
    <rect
      x="9"
      y="14"
      width="6"
      height="6"
      stroke={color}
      strokeWidth="1.8"
      fill="none"
    />
  </svg>
);

const AgencyIcon = ({ icon, iconBg, iconColor }) => {
  const IconComp =
    icon === "factory"
      ? FactoryIcon
      : icon === "warehouse"
        ? WarehouseIcon
        : BuildingIcon;
  return (
    <div
      className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}
    >
      <IconComp color={iconColor} />
    </div>
  );
};

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="2" />
    <path
      d="M16.5 16.5L21 21"
      stroke="#9CA3AF"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ChevronLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 18l-6-6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 18l6-6-6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TOTAL_ENTRIES = 24;
const PER_PAGE = 5;
const TOTAL_PAGES = Math.ceil(TOTAL_ENTRIES / PER_PAGE);

export default function Rawmaterial() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = inventoryData.filter(
    (item) =>
      item.agencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.agencyType.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between  border-gray-100 gap-3 flex-wrap mb-6">
        <div className="flex items-center gap-2 text-md font-semibold text-gray-900 ">
          Inventory
        </div>
        <div className="flex items-center gap-2 p-2  border border-gray-200 rounded-xl px-3.5 py-2 flex-1 min-w-0 max-w-xs">
          <SearchIcon />
          <input
            className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-full"
            placeholder="Search agencies..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="hidden sm:grid grid-cols-4 gap-3   ">
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
          Date
        </span>
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
          Agency Name
        </span>
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase ">
          Quantity
        </span>
        <span className="text-xs font-bold tracking-widest text-gray-500 uppercase ">
          Total
        </span>
      </div>
      {/* Rows */}
      {filtered.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">
          No results found.
        </div>
      ) : (
        filtered.map((item) => (
          <div
            key={item.id}
            className="h-16 grid grid-cols-1 sm:grid-cols-4 items-center gap-3 pt-4 border-b  transition-colors duration-150"
          >
            <span className="text-sm font-semibold text-gray-900">
              {item.date}
            </span>
            <div className="flex items-center gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900 leading-snug">
                  {item.agencyName}
                </div>
              </div>
            </div>
            <div className="">
              <div className="text-sm font-bold text-gray-900">
                {item.quantity}
              </div>
            </div>
            <div className="">
              <div className="text-sm font-bold text-gray-900">
                {item.total}
              </div>
            </div>
          </div>
        ))
      )}
      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/60 flex-wrap gap-2.5 mt-3">
        <span className="text-sm text-gray-500">
          Showing {PER_PAGE} of {TOTAL_ENTRIES} entries
        </span>
        <div className="flex items-center gap-1">
          <button
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-35 disabled:cursor-default transition-colors"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft />
          </button>
          {Array.from({ length: TOTAL_PAGES }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 rounded-lg border text-sm font-medium transition-colors ${
                currentPage === page
                  ? "bg-blue-800 text-white border-gray-900 font-semibold"
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-35 disabled:cursor-default transition-colors"
            disabled={currentPage === TOTAL_PAGES}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
