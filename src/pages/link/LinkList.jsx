import { Fragment, useRef, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import TabComponent from "@/components/tab/TabComponent";
import LinkTable from "@/components/link/LinkTable";
import AddLink from "../../partials/modals/add-link/AddLink";
import { tab_value, defaultData } from "./constant";
const LinkList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const [tableData, setTableData] = useState(defaultData);
  
  const tabs = [
    {
      value: tab_value.sales,
      label: <><i className="ki-filled ki-chart-line"></i>
            Sales</>,
      children: <LinkTable  filterType={tab_value.sales} handleModalOpen={handleModalOpen} defaultData={tableData}/>,
    },
    {
      value: tab_value.marketing,
      label: <><i className="ki-filled ki-dollar"></i>
            Marketing</>,
      children: <LinkTable  filterType={tab_value.marketing} handleModalOpen={handleModalOpen} defaultData={tableData}/>,
    },
    {
      value: tab_value.customer_support,
      label: <> <i className="ki-filled ki-support"></i>
            Customer Support</>,
      children: <LinkTable  filterType={tab_value.customer_support} handleModalOpen={handleModalOpen} defaultData={tableData}/>,
    },
    {
      value: tab_value.hr_admin,
      label: <><i className="ki-filled ki-user-tick"></i>
            HR/Admin</>,
      children: <LinkTable  filterType={tab_value.hr_admin} handleModalOpen={handleModalOpen} defaultData={tableData}/>,
    },
    {
      value: tab_value.general,
      label: <> <i className="ki-filled ki-share"></i>
            General</>,
      children: <LinkTable  filterType={tab_value.general} handleModalOpen={handleModalOpen} defaultData={tableData}/>,
    },
    {
      value: tab_value.automation,
      label: <><i className="ki-filled ki-scan-barcode"></i>
            Automation</>,
      children: <LinkTable  filterType={tab_value.automation} handleModalOpen={handleModalOpen} defaultData={tableData}/>,
    },
    {
      value: tab_value.operation,
      label: <><i className="ki-filled ki-technology-4"></i>
            Operation</>,
      children: <LinkTable  filterType={tab_value.operation} handleModalOpen={handleModalOpen} defaultData={tableData}/>,
    },
  ];
  
  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Links" }]} />
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder="Search link"
                type="text"
              />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={handleModalOpen}
              title="Add Link"
            >
              <i className="ki-filled ki-plus"></i> Add Link
            </button>
          </div>
        </div>
        {/* Tabs */}
        <TabComponent tabs={tabs} />
      </Container>
      <AddLink isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </Fragment>
  );
};
export { LinkList };
