import { Fragment } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import TabComponent from "@/components/tab/TabComponent";

import { Attendance } from "@/container/setting";
import { Regularization } from "@/container/setting";
import { RegisterFace } from "@/container/setting";
import { Reminder } from "@/container/setting/AttendanceSetting/Reminder";

const AttendanceSetting = () => {
  const tabs = [
    {
      value: "roleandpermission",
      label: (
        <>
          {/* <User className="text-primary" /> */}
          Register Face
        </>
      ),
      children: <RegisterFace />,
    },
    {
      value: "bulkdata",
      label: (
        <>
          {/* <DatabaseIcon className="text-primary" /> */}
          Reminder
        </>
      ),
      children: <Reminder />,
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
export { AttendanceSetting };
