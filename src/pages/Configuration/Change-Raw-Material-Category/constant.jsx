// In constant.js or wherever columns are defined
import { Checkbox } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = ({ selectedRows, setSelectedRows, data }) => [
  {
    accessorKey: "select",
    header: (
      <Checkbox
        checked={data.length > 0 && selectedRows.length === data.length}
        indeterminate={
          selectedRows.length > 0 && selectedRows.length < data.length
        }
        onChange={(e) => {
          if (e.target.checked) {
            // Store full row objects
            setSelectedRows(data);
          } else {
            setSelectedRows([]);
          }
        }}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={selectedRows.some((item) => item.id === row.original.id)}
        onChange={(e) => {
          if (e.target.checked) {
            // Add full row object
            setSelectedRows((prev) => [...prev, row.original]);
          } else {
            // Remove by ID
            setSelectedRows((prev) =>
              prev.filter((item) => item.id !== row.original.id)
            );
          }
        }}
      />
    ),
  },
  {
    accessorKey: "rawMaterial",
    header: (
      <FormattedMessage id="RAW_MATERIAL.NAME" defaultMessage="Raw Material" />
    ),
  },
  {
    accessorKey: "category",
    header: (
      <FormattedMessage id="RAW_MATERIAL.CATEGORY" defaultMessage="Category" />
    ),
  },
];
