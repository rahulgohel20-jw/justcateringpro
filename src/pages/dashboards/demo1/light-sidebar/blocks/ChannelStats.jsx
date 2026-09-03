import { useEffect, useState } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";
import {
  GetAllPlans,
  SuperAdminDashboardTotalUserAndPlan,
} from "@/services/apiServices";

const ChannelStats = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [stats, setStats] = useState(null);

  /* ---------------- Fetch Plans ---------------- */
  useEffect(() => {
    const fetchPlans = async () => {
      const res = await GetAllPlans();
      if (res?.data?.success) {
        const planList = res.data.data["Plan Details"];
        setPlans(planList);

        const lite = planList.find((p) => p.name.toLowerCase() === "lite");
        setSelectedPlanId(lite?.id ?? planList[0]?.id);
      }
    };
    fetchPlans();
  }, []);

  /* ---------------- Fetch Stats ---------------- */
  useEffect(() => {
    if (!selectedPlanId) return;

    const fetchStats = async () => {
      const res = await SuperAdminDashboardTotalUserAndPlan(selectedPlanId);
      if (res?.data?.success) {
        setStats(res.data.data);
      }
    };
    fetchStats();
  }, [selectedPlanId]);

  if (!stats) return null;

  const items = [
    {
      icon: "dashsuper2.png",
      value: `${stats.totalAllUser}k`,
      label: "Total Users",
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      icon: "dashsuper.png",
      value: `${stats.totalActiveUser}k`,
      label: "Total Active Users",
      iconBg: "bg-green-100 text-green-600",
    },
    {
      icon: "superadmin.png",
      value: "8000",
      // value: `${stats.totalAmount}`,
      label: "Total Amount",
      iconBg: "bg-blue-100 text-blue-600",
    },
    {
      icon: "super.png",
      value: "8000",
      // value: `${stats.totalPaid}`,
      label: "Total Paid Amount",
      iconBg: "bg-green-100 text-green-600",
    },
    {
      icon: "dashsuper1.png",
      value: "8000",
      // value: ` ${stats.totalUnpaid}`,
      label: "Total Unpaid Amount",
      iconBg: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* ---------- Dropdown ---------- */}
      <select
        className="w-36 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm"
        value={selectedPlanId}
        onChange={(e) => setSelectedPlanId(Number(e.target.value))}
      >
        {plans.map((plan) => (
          <option key={plan.id} value={plan.id}>
            {plan.name}
          </option>
        ))}
      </select>

      {/* ---------- Cards ---------- */}
      <div className="flex gap-4 overflow-x-auto">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center  min-w-[200px] rounded-xl border border-blue-200 bg-white px-4 py-3 shadow-sm"
          >
            {/* Icon */}
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg ${item.iconBg}`}
            >
              <img
                src={toAbsoluteUrl(`/media/icons/${item.icon}`)}
                className="h-6 w-6"
              />
            </div>

            {/* Text */}
            <div className="flex-1 ms-3 ">
              <div className=" ps-2 text-lg font-semibold text-gray-900">
                {item.value}
              </div>
              <div className="ps-2 text-sm text-gray-00">{item.label}</div>
            </div>

            {/* Growth */}
            <div className="text-sm font-medium text-green-600">↑ 2.1%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export { ChannelStats };
