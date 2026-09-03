import { Tooltip, Popconfirm } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, onStatus) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr. No." />,
    meta: {
      headerClassName: "w-[4%]",
      cellClassName: "w-[4%]",
    },
  },
  {
    accessorKey: "unit",
    header: <FormattedMessage id="COMMON.NAME" defaultMessage="Name" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  {
    accessorKey: "symbol",
    header: <FormattedMessage id="COMMON.SYMBOL" defaultMessage="Symbol" />,
    meta: {
      headerClassName: "w-[8%]",
      cellClassName: "w-[8%]",
    },
  },
  // {
  //   accessorKey: "isActive",
  //   header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex items-center  gap-1">
  //         <Popconfirm
  //           title="Are you sure to change this status?"
  //           onConfirm={() =>
  //             onStatus(
  //               row.original.unitId,
  //               row.original.isActive ? false : true
  //             )
  //           }
  //           onCancel={() => console.log("Cancelled")}
  //           okText="Yes"
  //           cancelText="No"
  //         >
  //           <label className="switch switch-lg">
  //             <input
  //               type="checkbox"
  //               value="1"
  //               name="check"
  //               defaultChecked={row.original.isActive}
  //               readOnly
  //               checked={row.original.isActive}
  //             />
  //           </label>
  //         </Popconfirm>
  //       </div>
  //     );
  //   },
  //   meta: {
  //     headerClassName: "w-[10%]",
  //     cellClassName: "w-[10%]",
  //   },
  // },

  // {
  //   accessorKey: "action",
  //   header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Actions" />,
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex items-center  gap-1">
  //         <Tooltip className="cursor-pointer" title="Edit Contact">
  //           <button
  //             className="btn btn-sm btn-icon btn-clear"
  //             title="Edit"
  //             onClick={() => onEdit(row.original)}
  //           >
  //             <i className="ki-filled ki-notepad-edit text-primary"></i>
  //           </button>
  //         </Tooltip>

  //         <Tooltip title="Delete">
  //           <button
  //             className="btn btn-sm btn-icon btn-clear"
  //             title="Delete"
  //             onClick={() => onDelete(row.original.unitId)}
  //           >
  //             <i className="ki-filled ki-trash  text-danger"></i>
  //           </button>
  //         </Tooltip>
  //       </div>
  //     );
  //   },
  //   meta: {
  //     headerClassName: "w-[10%]",
  //     cellClassName: "w-[10%]",
  //   },
  // },
];

export const defaultData = [];
