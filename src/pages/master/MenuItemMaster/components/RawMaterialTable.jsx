import { useMemo } from "react";
import { TableComponent } from "@/components/table/TableComponent";
import { columns } from "../constant";

const RawMaterialTable = ({
  data,
  onEditRow,
  onDeleteRow,
  selectedRows = [],
  setSelectedRows,
  godownOptions = [],
  onVenueChange,
  onVisibleChange = () => {},
  showVisibleColumn = true,   
}) => {
  const handleSelectAll = (checked) => {
    if (checked) setSelectedRows([...data]);
    else setSelectedRows([]);
  };

  const handleRowSelect = (row, checked) => {
    if (checked) setSelectedRows((prev) => [...prev, row]);
    else
      setSelectedRows((prev) =>
        prev.filter((item) => item.sr_no !== row.sr_no),
      );
  };

  const isRowSelected = (row) =>
    selectedRows.some((item) => item.sr_no === row.sr_no);

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;

  const tableColumns = useMemo(
    () =>
      columns(
        onEditRow,
        onDeleteRow,
        {
          onSelectAll: handleSelectAll,
          onRowSelect: handleRowSelect,
          isRowSelected,
          isAllSelected,
        },
        godownOptions,
        onVenueChange,
        onVisibleChange,
        showVisibleColumn,   
      ),
    [
      onEditRow,
      onDeleteRow,
      selectedRows,
      data,
      godownOptions,
      onVenueChange,
      onVisibleChange,
      showVisibleColumn,   
    ],
  );

  return (
    <TableComponent columns={tableColumns} data={data} paginationSize={10} />
  );
};

export default RawMaterialTable;