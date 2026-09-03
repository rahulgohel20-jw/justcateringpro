import { useEffect, useState } from "react";
import { message, Spin } from "antd";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { planColumns } from "./constant";
import { getAllByRoleIdData } from "@/services/apiServices";

const PlanTable = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [filteredPlans, setFilteredPlans] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    const fetchAdmins = async () => {
      setLoading(true);

      try {
        const response = await getAllByRoleIdData(1, "member");

        if (response.data.success) {
          let admins = response?.data?.data?.["User Details"];

          if (!Array.isArray(admins)) {
            admins = [admins];
          }

          const planData = admins.map((user) => ({
            id: user.id,
            customerName: `${user.firstName || "-"} ${user.lastName || "-"}`,
            planName: user.plan?.name || "-",
            planPrice: user.plan?.price || "-",
            billingCycle: user.plan?.billingCycle || "-",
            planDescription: user.plan?.description || "-",
            isPopular: user.plan?.isPopular ? "Yes" : "No",
          }));

          setPlans(planData);
          setFilteredPlans(planData);
        } else {
          message.error(response.data.msg || "No admins found");
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
        message.error("Error fetching admins");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchText(value);

    const filtered = plans.filter((plan) =>
      plan.customerName.toLowerCase().includes(value.toLowerCase()),
    );
    setFilteredPlans(filtered);
  };

  return (
    <Container>
      <div className="gap-2 pb-2 mb-3">
        <Breadcrumbs items={[{ title: "User Plans" }]} />
      </div>
      <div className="w-[200px] filItems relative mb-4">
        <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
        <input
          className="input pl-8"
          placeholder="Search invoice"
          type="text"
          value={searchText}
          onChange={handleSearch}
        />
      </div>

      <Spin spinning={loading}>
        <TableComponent
          columns={planColumns}
          data={filteredPlans}
          paginationSize={10}
        />
      </Spin>
    </Container>
  );
};

export default PlanTable;
