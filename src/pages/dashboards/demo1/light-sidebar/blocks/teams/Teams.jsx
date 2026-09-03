import React, { useMemo, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  DataGrid,
  KeenIcon,
  DataGridRowSelect,
  DataGridRowSelectAll,
  DataGridColumnHeader,
  useDataGrid,
} from "@/components";
import { CommonRating } from "@/partials/common";
import axios from "axios";
import { formatIsoDate } from "@/utils/Date";
import { TeamUsers } from "./TeamUsers";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Teams = ({ data }) => {
  const intl = useIntl();

  const columns = useMemo(
    () => [
      {
        accessorFn: (row, index) => index + 1,
        id: "srNo",
        header: () =>
          intl.formatMessage({ id: "TEAMS.SR_NO", defaultMessage: "Sr No." }),
        enableSorting: false,
        cell: ({ row, table }) => {
          const pageIndex = table.getState().pagination.pageIndex;
          const pageSize = table.getState().pagination.pageSize;
          return pageIndex * pageSize + row.index + 1;
        },
        meta: { headerClassName: "w-20" },
      },
      {
        accessorFn: (row) => row.name,
        id: "name",
        header: ({ column }) => (
          <DataGridColumnHeader
            title={intl.formatMessage({
              id: "TEAMS.NAME",
              defaultMessage: "Name",
            })}
            column={column}
          />
        ),
        enableSorting: true,
        cell: (info) => (
          <span className="text-sm text-gray-900">
            {info.row.original.name}
          </span>
        ),
        meta: { headerClassName: "min-w-[180px]" },
      },
      {
        accessorFn: (row) => row.company_name,
        id: "company_name",
        header: ({ column }) => (
          <DataGridColumnHeader
            title={intl.formatMessage({
              id: "TEAMS.COMPANY_NAME",
              defaultMessage: "Company Name",
            })}
            column={column}
          />
        ),
        enableSorting: true,
        cell: (info) => (
          <span className="text-sm text-gray-900">
            {info.row.original.company_name}
          </span>
        ),
        meta: { headerClassName: "min-w-[180px]" },
      },
      {
        accessorFn: (row) => row.phone,
        id: "phone",
        header: ({ column }) => (
          <DataGridColumnHeader
            title={intl.formatMessage({
              id: "TEAMS.PHONE_NO",
              defaultMessage: "Phone no.",
            })}
            column={column}
          />
        ),
        cell: (info) => (
          <span className="text-sm text-gray-700">
            {info.row.original.phone}
          </span>
        ),
        meta: { className: "min-w-[150px]" },
      },
      {
        accessorFn: (row) => row.city,
        id: "city",
        header: ({ column }) => (
          <DataGridColumnHeader
            title={intl.formatMessage({
              id: "TEAMS.CITY",
              defaultMessage: "City",
            })}
            column={column}
          />
        ),
        cell: (info) => (
          <span className="text-sm text-gray-700">
            {info.row.original.city}
          </span>
        ),
        meta: { className: "min-w-[150px]" },
      },
      {
        accessorFn: (row) => row.is_active,
        id: "is_active",
        header: ({ column }) => (
          <DataGridColumnHeader
            title={intl.formatMessage({
              id: "TEAMS.ACTIVE_USER",
              defaultMessage: "Active User",
            })}
            column={column}
          />
        ),
        cell: (info) => (
          <span
            className={`text-sm font-medium ${info.row.original.is_active ? "text-green-600" : "text-red-600"}`}
          >
            {info.row.original.is_active
              ? intl.formatMessage({
                  id: "TEAMS.ACTIVE",
                  defaultMessage: "Active",
                })
              : intl.formatMessage({
                  id: "TEAMS.DEACTIVE",
                  defaultMessage: "Deactive",
                })}
          </span>
        ),
        meta: { className: "min-w-[120px]" },
      },
      {
        accessorFn: (row) => row.created_at_iso,
        id: "created_at",
        header: ({ column }) => (
          <DataGridColumnHeader
            title={intl.formatMessage({
              id: "TEAMS.DATE",
              defaultMessage: "Date",
            })}
            column={column}
          />
        ),
        cell: (info) => (
          <span className="text-sm text-gray-600">
            {info.row.original.created_at_iso
              ? formatIsoDate(info.row.original.created_at_iso)
              : "N/A"}
          </span>
        ),
        meta: { className: "min-w-[120px]" },
      },
    ],
    [intl]
  );

  return (
    <DataGrid
      columns={columns}
      data={data} // ✅ use data prop here
      rowSelection={false}
      getRowId={(row) => row.id}
      pagination={{ size: 50 }}
      layout={{ card: true }}
    />
  );
};

export { Teams };
