import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { columns, defaultData } from "./constant";
import AddSales from "@/partials/modals/add-sales/AddSales";

const SalesTeamList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titleModal, setTitleModal] = useState('Add Member');

  const handleModalOpen = () => {
    setIsModalOpen(true);
    setTitleModal('Add Member')
  };
  const handleModalShowOpen = () => {
    setIsModalOpen(true);
    setTitleModal('View Member')
  };

  const responseFormate = () => {
    const data = defaultData.map((item) => {
      return {
        ...item,
        handleModalOpen: handleModalOpen,
        handleModalShowOpen:handleModalShowOpen
      };
    });
    return data;
  };

  const [tableData, setTableData] = useState(responseFormate());

  return (
    <Fragment>
      <Container>
        {/* Breadcrumbs */}
        <div className="gap-2 mb-3">
          <Breadcrumbs items={[{ title: "Sales Team" }]} />
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input
                className="input pl-8"
                placeholder="Search member"
                type="text"
              />
            </div>
            <div className="filItems">
              <select className="select pe-7.5" placeholder="Roles">
                <option value="Manager">Manager</option>
                <option value="Sales Person">Sales Person</option>
                <option value="Test">Test</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={handleModalOpen}
              title="Add Member"
            >
              <i className="ki-filled ki-plus"></i> Add Member
            </button>
          </div>
        </div>
        <TableComponent
          columns={columns}
          data={tableData}
          paginationSize={10}
        />
      </Container>
      <AddSales isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} titleModal={titleModal}/>
    </Fragment>
  );
};
export { SalesTeamList };
