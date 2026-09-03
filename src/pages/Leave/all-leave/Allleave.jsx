import { Fragment } from "react";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import TabComponent from "@/components/tab/TabComponent";
import { Container } from "@/components/container";
import LeaveBalanceTable from "./leavebalance";
import AllLeaveApplications from "./all-leaveapplication/constant";
const AllLeave = () => {
  const tabs = [
    {
      value: "leave-balance",
      label: <>Leave Balance</>,
      children: <LeaveBalanceTable />,
    },
    {
      value: "all-leaves",
      label: <>All Leave Applications</>,
      children: <AllLeaveApplications />,
    },
  ];

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "All Leaves" }]} />
        </div>
        <TabComponent tabs={tabs} />
      </Container>
    </Fragment>
  );
};

export default AllLeave;
