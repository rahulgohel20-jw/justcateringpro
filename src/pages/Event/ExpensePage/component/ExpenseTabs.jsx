export default function ExpenseTabs({ activeTab, setActiveTab }) {
  const tabs = ["manager", "supplier", "customer"];

  return (
    <div className="bg-gradient-to-br to-slate-100 pb-3">
      <div className="max-w-1xl mx-auto">
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-5 py-2 rounded-xl text-[15px] transition-all duration-200
                ${
                  activeTab === tab
                    ? "bg-white font-semibold text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-800"
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
