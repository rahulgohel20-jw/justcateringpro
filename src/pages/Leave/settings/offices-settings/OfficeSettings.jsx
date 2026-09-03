import { Fragment } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import TabComponent from "@/components/tab/TabComponent";

import { LoginLogoutTime } from "@/container/setting";
import { Location } from "@/container/setting";

const OfficeSetting = () => {
  const tabs = [
    {
      value: "roleandpermission",
      label: (
        <>
          {/* <User className="text-primary" /> */}
          Login-Logout Time
        </>
      ),
      children: <LoginLogoutTime />,
    },
    {
      value: "bulkdata",
      label: (
        <>
          {/* <DatabaseIcon className="text-primary" /> */}
          Office Location
        </>
      ),
      children: <Location />,
    },
  ];
  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Attendance Settings" }]} />
        </div>
        <TabComponent tabs={tabs} />
      </Container>
    </Fragment>
  );
};
export { OfficeSetting };
