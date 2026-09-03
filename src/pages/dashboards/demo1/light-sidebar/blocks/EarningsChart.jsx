import { useEffect, useState } from "react";
import ApexChart from "react-apexcharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormattedMessage } from "react-intl";
import {
  SuperAdminDashboardMonthWiseData,
  GetAllPlans,
} from "@/services/apiServices";
import { DatePicker } from "antd";
import dayjs from "dayjs";

const EarningsChart = () => {
  const [charData, setCharData] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(dayjs());

  const categories = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthIndex = {
    January: 0,
    February: 1,
    March: 2,
    April: 3,
    May: 4,
    June: 5,
    July: 6,
    August: 7,
    September: 8,
    October: 9,
    November: 10,
    December: 11,
  };

  // Fetch chart data
  const fetchChartData = async () => {
    if (!startDate || !endDate || !selectedPlan) return;

    try {
      const res = await SuperAdminDashboardMonthWiseData(
        endDate.format("DD/MM/YYYY"),
        selectedPlan,
        startDate.format("DD/MM/YYYY")
      );

      if (res?.data?.success) {
        const apiData = res.data.data;
        const updated = Array(12).fill(0);

        apiData.forEach((item) => {
          const idx = monthIndex[item.month];
          if (idx !== undefined) updated[idx] = item.total / 1000;
        });

        setCharData(updated);
      }
    } catch (err) {
      console.error("Error fetching month data:", err);
    }
  };

  // Fetch plans for dropdown
  const fetchPlans = async () => {
    try {
      const res = await GetAllPlans();
      if (res?.data?.success) {
        const planList = res.data.data["Plan Details"] || [];
        setPlans(planList);

        // Set default selected plan
        if (planList.length > 0) setSelectedPlan(planList[0].id.toString());
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchChartData();
  }, [selectedPlan, startDate, endDate]);

  const maxValue = Math.ceil(Math.max(...charData) / 20) * 20;

  const options = {
    series: [
      {
        name:
          plans.find((plan) => plan.id.toString() === selectedPlan)?.name || "",
        data: charData ?? [],
      },
    ],
    chart: { height: 250, type: "area", toolbar: { show: false } },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { curve: "smooth", width: 3, colors: ["var(--tw-primary)"] },
    xaxis: { categories },
    yaxis: {
      min: 0,
      max: maxValue,
      tickAmount: 5,
      labels: { formatter: (v) => `$${v}K` },
    },
  };

  return (
    <div className="card h-full">
      {" "}
      <div className="card-header">
        {" "}
        <h3 className="card-title">
          {" "}
          <FormattedMessage
            id="USER.DASHBOARD.DASHBOARD_EARNINGS"
            defaultMessage="Earnings"
          />{" "}
        </h3>
        <div className="flex items-center gap-5">
          {/* PLAN DROPDOWN */}
          <Select
            value={selectedPlan}
            onValueChange={(value) => setSelectedPlan(value)}
          >
            <SelectTrigger className="w-28" size="sm">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="w-32">
              {plans.map((plan) => (
                <SelectItem key={plan.id} value={plan.id.toString()}>
                  {plan.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* START DATE */}
          <DatePicker
            value={startDate}
            onChange={(value) => setStartDate(value)}
            className="w-32"
            size="sm"
            placeholder="Start Date"
          />

          {/* END DATE */}
          <DatePicker
            value={endDate}
            onChange={(value) => setEndDate(value)}
            className="w-32"
            size="sm"
            placeholder="End Date"
          />
        </div>
      </div>
      <div className="card-body flex flex-col justify-end px-3 py-1">
        <ApexChart
          id="earnings_chart"
          options={options}
          series={options.series}
          type="area"
          height="250"
        />
      </div>
    </div>
  );
};

export { EarningsChart };
