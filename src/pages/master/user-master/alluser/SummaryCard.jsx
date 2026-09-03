const SummaryCards = ({ data }) => {
  const totalUsers = data.totalUser || 0;
  const totalAmount = data.totalAmount || 0;
  const totalPaid = data.totalPaidAmount || 0;
  const totalUnpaid = data.totalUnPaidAmount || 0;

  const cards = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: (
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-blue-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a4 4 0 00-5-5M9 20H4v-2a4 4 0 015-5m6-5a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        </div>
      ),
      prefix: "",
    },
    {
      label: "Total Amount",
      value: `₹${totalAmount.toLocaleString("en-IN")}`,
      icon: (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      ),
    },
    {
      label: "Total Paid Amount",
      value: `₹${totalPaid.toLocaleString("en-IN")}`,
      icon: (
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      ),
    },
    {
      label: "Total Unpaid Amount",
      value: `₹${totalUnpaid.toLocaleString("en-IN")}`,
      icon: (
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <svg
            className="w-5 h-5 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-gray-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
          </div>
          {card.icon}
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
