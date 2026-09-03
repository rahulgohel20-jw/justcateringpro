import { TableComponent } from "@/components/table/TableComponent";

import { Download } from "lucide-react";
export default function InvoiceTable({ columns, data }) {
  return (
    <>
      {/* filters */}
      <div className="filters flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-2"></div>
      </div>

      <TableComponent columns={columns} data={data} paginationSize={10} />
    </>
  );
}
