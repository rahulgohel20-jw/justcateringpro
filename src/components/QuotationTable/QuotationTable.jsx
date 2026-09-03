import { TableComponent } from "@/components/table/TableComponent";

export default function QuotationTable({ columns, data }) {
  return (
    <>
      <TableComponent columns={columns} data={data} paginationSize={10} />
    </>
  );
}
