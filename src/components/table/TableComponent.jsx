import { DataGrid } from "@/components";

const TableComponent = ({
  columns,
  data,
  paginationSize,
  defaultSorting,
  toolbar,
  expandable,
  hidePagination,
  getRowClassName,
}) => {
  return (
    <DataGrid
      columns={columns}
      data={data}
      pagination={{
        
        size: hidePagination ? data.length || 9999 : (paginationSize ?? 10),
      }}
      sorting={defaultSorting}
      expandable={expandable}
      toolbar={toolbar}
      layout={{ card: true }}
      hidePagination={hidePagination}
      getRowClassName={getRowClassName}
    />
  );
};

export { TableComponent };
