import { Fragment } from "react";
import { useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import AddBulkDataImport from "@/partials/modals/add-bulk-data-import/AddBulkDataImport";
import { TableComponent } from "@/components/table/TableComponent";
import { columns, defaultData } from "./constant";

const BulkDataImport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const [isTypeMode, setIsTypeMode] = useState(false);

  const handleEditClick = () => {
    setIsTypeMode(true);
    setIsModalOpen(true);
  };

  const responseFormate = () => {
    const data = defaultData.map((item) => {
      return {
        ...item,
        handleEditClick: handleEditClick,
      };
    });
    return data;
  };

  const [tableData, setTableData] = useState(responseFormate());
  return (
    <>
      {/* filters */}
      <div className="filters flex flex-wrap items-center justify-end gap-2 mb-3">
        <div className="filItems relative">
           <button
            className="btn btn-primary"
            title="Download Sample"
            onClick={() => {
              handleModalOpen();
              setIsTypeMode(false)
            }}
          >
            <i className="ki-filled ki-cloud-download"></i> Download Sample
          </button>
          </div>
          <div className="filItems relative">
          <button
            className="btn btn-primary"
            title="Upload CSV"
            onClick={() => {
              setIsTypeMode(true);
              handleModalOpen();
            }}
          >
            <i className="ki-filled ki-file-up"></i> Upload CSV
          </button>
        </div>
      </div>
      <TableComponent columns={columns} data={tableData} paginationSize={10} />
      <AddBulkDataImport
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        type={isTypeMode}
      />
    </>
  );
};
export { BulkDataImport };
