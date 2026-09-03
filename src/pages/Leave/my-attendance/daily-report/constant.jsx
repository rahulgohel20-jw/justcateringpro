export const DailyReport = () => {
  return (
    <div className="p-4">
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="bg-white text-black px-4 py-2 border border-blue-500 rounded shadow text-sm font-medium">
          Days: <span className="font-bold">0</span>
        </div>
        <div className="bg-white text-black px-4 py-2 border border-blue-500 rounded shadow text-sm font-medium">
          Verified: <span className="font-bold">0</span>
        </div>
        <div className="bg-white text-black px-4 py-2 border border-blue-500 rounded shadow text-sm font-medium">
          Regularized: <span className="font-bold">0</span>
        </div>
        <div className="bg-white text-black px-4 py-2 border border-blue-500 rounded shadow text-sm font-medium">
          Hours: <span className="font-bold">00:00:00</span>
        </div>
      </div>
    </div>
  );
};
