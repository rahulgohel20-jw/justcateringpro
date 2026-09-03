// data.js
export const dashboardData = {
  supplier: {
    TotalExpenses: "₹75,000.00",
    usedAmount: "₹45,250.00",
    remaining: "₹29,750.00",
  },
  customer: {
    TotalExpenses: "₹60,000.00",
    usedAmount: "₹38,900.00",
    remaining: "₹21,100.00",
  },
  manager: {
    totalGiven: "₹50,000.00",
    usedAmount: "₹32,750.00",
    remaining: "₹17,250.00",
  },
};

export const expensesData = {
  supplier: [
    {
      id: 1,
      initials: "SK",
      name: "Steel Kingdom",
      date: "16 Oct 2023",
      amount: "₹15,000.00",
      paymentType: "Online",
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
    },
  ],

  customer: [
    {
      id: 1,
      initials: "RK",
      name: "Rajesh Kumar",
      date: "17 Oct 2023",
      amount: "₹20,000.00",
      paymentType: "Online",
      bgColor: "bg-pink-100",
      textColor: "text-pink-600",
    },
  ],

  manager: [
    {
      id: 1,
      initials: "AR",
      name: "Anand Sharma",
      role: "Field Manager",
      mobile: "9876543210",
      date: "15 Oct 2023",
      amount: "₹1,250.00",
      paymentType: "Cash",
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
  ],
};
