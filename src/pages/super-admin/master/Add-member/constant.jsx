import { Popconfirm, Tooltip } from "antd";
import { Link } from "react-router-dom";
import { underConstruction } from "@/underConstruction";
import { useEffect, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, handleView, permissions) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr. No." />,
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "full_name",
    header: (
      <FormattedMessage id="COMMON.FULL_NAME" defaultMessage="Full Name" />
    ),
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "city",
    header: <FormattedMessage id="COMMON.CITY" defaultMessage="City" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "state",
    header: <FormattedMessage id="COMMON.STATE" defaultMessage="State" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },

  {
    accessorKey: "country",
    header: <FormattedMessage id="COMMON.COUNTRY" defaultMessage="Country" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "contact",
    header: (
      <FormattedMessage id="COMMON.CONTACT" defaultMessage="Contact No" />
    ),
    meta: {
      headerClassName: "w-[8]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "role",
    header: <FormattedMessage id="COMMON.ROLE" defaultMessage="Role" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "email",
    header: <FormattedMessage id="COMMON.EMAIL" defaultMessage="Email" />,
    meta: {
      headerClassName: "w-[12%]",
      cellClassName: "w-[12%]",
    },
  },

  // {
  //   accessorKey: "task_access",
  //   header: (
  //     <FormattedMessage id="COMMON.TASK_ACCESS" defaultMessage="Task Access" />
  //   ),
  //   meta: {
  //     headerClassName: "w-[10%]",
  //     cellClassName: "w-[10%]",
  //   },
  // },
  // {
  //   accessorKey: "leave_attendence_access",
  //   header: (
  //     <FormattedMessage
  //       id="COMMON.LEAVE_ATTENDANCE_ACCESS"
  //       defaultMessage="Leave Attendance Access"
  //     />
  //   ),
  //   meta: {
  //     headerClassName: "w-[10%]",
  //     cellClassName: "w-[10%]",
  //   },
  // },

  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => {
      return (
        <div className="flex items-center justify-center gap-1">
          {/* <Tooltip className="cursor-pointer" title="View Member">
            <button
              className="btn btn-sm btn-icon btn-clear"
              title=""
              onClick={() => handleView(row.original)}
            >
              <i className="ki-filled ki-eye text-success"></i>
            </button>
          </Tooltip> */}
          {permissions.view && (
            <Tooltip className="cursor-pointer" title="View Member">
              <button
                className="btn btn-sm btn-icon btn-clear"
                title=""
                onClick={() => handleView(row.original)}
              >
                <i className="ki-filled ki-eye text-success"></i>
              </button>
            </Tooltip>
          )}
          {permissions.edit && (
            <Tooltip className="cursor-pointer" title="Edit Member">
              <button
                className="btn btn-sm btn-icon btn-clear"
                title=""
                onClick={() => onEdit(row.original)}
              >
                <i className="ki-filled ki-notepad-edit text-primary"></i>
              </button>
            </Tooltip>
          )}

          <Popconfirm
            title="Are you sure to delete this function?"
            onConfirm={() => onDelete(row.original.id)} // ✅ confirm triggers delete
            okText="Yes"
            cancelText="No"
          >
            {/* <Tooltip title="Delete Member">
    <button className="btn btn-sm btn-icon btn-clear" title="">
      <i className="ki-filled ki-trash text-danger"></i>
    </button>
  </Tooltip> */}
          </Popconfirm>
        </div>
      );
    },
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
];

export const defaultData = [];
