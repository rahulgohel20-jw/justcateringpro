import React from "react";
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
          setSelectedRows(e.target.checked ? data.map((row) => row.id) : []);
        }}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={selectedRows.includes(row.original.id)}
        onChange={(e) => {
          const id = row.original.id;
          setSelectedRows((prev) =>
            e.target.checked
              ? [...prev, id]
              : prev.filter((item) => item !== id)
          );
        }}
      />
    ),
  },
  {
    accessorKey: "menuItem", // ✅ FIXED
    header: (
      <FormattedMessage id="RAW_MATERIAL.NAME" defaultMessage="Menu Item" />
    ),
  },
  {
    accessorKey: "category",
    header: (
      <FormattedMessage id="RAW_MATERIAL.CATEGORY" defaultMessage="Category" />
    ),
  },
];
