import { Fragment, useState } from "react";
import { Container } from "@/components/container";
import { TableComponent } from "@/components/table/TableComponent";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { columns, defaultData } from "./constant";
import AddRegisterFace from "@/partials/modals/add-register-face/AddRegisterFace";

const RegisterFace = () => {
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
          <Breadcrumbs items={[{ title: "Register Face" }]} />
        </div>
        {/* filters */}
        <div className="filters flex flex-wrap items-center justify-center gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="filItems relative">
              <i className="ki-filled ki-magnifier leading-none text-md text-primary absolute top-1/2 start-0 -translate-y-1/2 ms-3"></i>
              <input className="input pl-8" placeholder="Search" type="text" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn btn-primary"
                onClick={handleModalOpen}
                title=" Add Company"
              >
                <i className="ki-filled ki-users"></i> Add Member
              </button>
            </div>
          </div>
        </div>
        {/* TableComponent */}
        <TableComponent
          columns={columns}
          data={tableData}
          paginationSize={10}
        />
      </Container>
      {/* AddContact */}
      <AddRegisterFace
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />
    </Fragment>
  );
};
export { RegisterFace };
