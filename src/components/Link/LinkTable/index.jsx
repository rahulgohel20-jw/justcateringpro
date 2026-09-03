import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "./constant";
import { useState } from "react";
const LinkTable = ({ filterType, handleModalOpen, defaultData }) => {

  const responseFormate = () => {    
    const data = defaultData.filter((items,i) => items.type === filterType).map((item) => {
      return {
        ...item,
        handleModalOpen: handleModalOpen,
      };
    });
    return data;
  };
  return (
    <TableComponent
          columns={columns}
          data={responseFormate()}
          paginationSize={10}
        />
  );
};
export default LinkTable;
