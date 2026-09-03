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
          if (e.target.checked) {
            setSelectedRows(data.map((row) => row.id));
          } else {
            setSelectedRows([]);
          }
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
    accessorKey: "rawMaterial",
    header: (
      <FormattedMessage id="RAW_MATERIAL.NAME" defaultMessage="Raw Material" />
    ),
  },
  {
    accessorKey: "category",
    header: (
      <FormattedMessage
        id="RAW_MATERIAL.CATEGORY"
        defaultMessage="Raw Material Category"
      />
    ),
  },
  {
    accessorKey: "supplier",
    header: (
      <FormattedMessage id="RAW_MATERIAL.SUPPLIER" defaultMessage="Supplier" />
    ),
    cell: ({ row }) => row.original.supplier || "N/A", // display supplier name or "N/A"
  },
];
