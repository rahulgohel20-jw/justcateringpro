import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";

import AddMember from "@/partials/modals/add-member/AddMember";
import { underConstruction } from "@/underConstruction";
import { columns, defaultData } from "./constant";

const MemberList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const responseFormate = () => {
    const data = defaultData.map((item) => {
      return {
        ...item,
        handleModalOpen: handleModalOpen,
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
          <Breadcrumbs items={[{ title: "All Members" }]} />
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
              <select className="select pe-7.5">
                <option value="0">Reporting Manager</option>
                <option value="1">Devon Lane</option>
                <option value="2">Kathryn Murphy</option>
                <option value="3">Albert Flores</option>
                <option value="4">Wade Warren</option>
              </select>
            </div>
            <div className="filItems">
              <select className="select pe-7.5">
                <option value="0">All</option>
                <option value="1">Admin</option>
                <option value="2">Manager</option>
                <option value="3">Team Manager</option>
              </select>
            </div>
            <div className="filItems">
              <button
                className="btn btn-primary"
                onClick={underConstruction}
                title="Clear Filter"
              >
                <i className="ki-filled ki-filter"></i> Clear Filter
              </button>
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
      <AddMember isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </Fragment>
  );
};
export { MemberList };
