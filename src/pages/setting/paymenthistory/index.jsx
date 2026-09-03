import { Fragment, useEffect, useState } from "react";
import { Container } from "@/components/container";
import { Breadcrumbs } from "@/layouts/demo1/breadcrumbs/Breadcrumbs";
import { TableComponent } from "@/components/table/TableComponent";
import { usePaymentColumns } from "./constant"; // ✅ updated import

const PaymentHistory = () => {
  const [tableData, setTableData] = useState([]);
  const lang = localStorage.getItem("lang") || "en";

  const handleEdit = (row) => {
    /* your edit logic */
  };
  const handleDelete = (id) => {
    /* your delete logic */
  };

  // ✅ use hook to get columns dynamically
  const columns = usePaymentColumns(handleEdit, handleDelete, lang);

  return (
    <Fragment>
      <Container>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Payment History</h2>
        </div>

        <TableComponent
          columns={columns}
          data={tableData}
          paginationSize={10}
        />
      </Container>
    </Fragment>
  );
};

export default PaymentHistory;
