import { Popconfirm, Tooltip } from "antd";
import { FormattedMessage } from "react-intl";

export const columns = (onEdit, onDelete, permissions = {}) => [
  {
    accessorKey: "sr_no",
    header: <FormattedMessage id="COMMON.SR_NO" defaultMessage="Sr No" />,
    meta: {
      headerClassName: "w-[5%]",
      cellClassName: "w-[5%]",
    },
  },
  {
    accessorKey: "name_english",
    header: (
      <FormattedMessage
        id="TABLE.ROOM_NAME_ENGLISH"
        defaultMessage="Name (English)"
      />
    ),
    meta: {
      headerClassName: "w-[20%]",
      cellClassName: "w-[20%]",
    },
  },
  {
    accessorKey: "name_gujarati",
    header: (
      <FormattedMessage
        id="TABLE.ROOM_NAME_GUJARATI"
        defaultMessage="Name (Gujarati)"
      />
    ),
    meta: {
      headerClassName: "w-[20%]",
      cellClassName: "w-[20%]",
    },
  },
  {
    accessorKey: "name_hindi",
    header: (
      <FormattedMessage
        id="TABLE.ROOM_NAME_HINDI"
        defaultMessage="Name (Hindi)"
      />
    ),
    meta: {
      headerClassName: "w-[20%]",
      cellClassName: "w-[20%]",
    },
  },
  {
    accessorKey: "price",
    header: (
      <FormattedMessage id="TABLE.ROOM_PRICE" defaultMessage="Price" />
    ),
    meta: {
      headerClassName: "w-[10%]",
      cellClassName: "w-[10%]",
    },
  },
//   {
//     accessorKey: "isActive",
//     header: <FormattedMessage id="COMMON.STATUS" defaultMessage="Status" />,
//     cell: ({ row }) => (
//       <div className="flex items-center justify-center">
//         <label className="switch switch-lg">
//           <input type="checkbox" readOnly checked={row.original.isActive} />
//         </label>
//       </div>
//     ),
//     meta: {
//       headerClassName: "w-[10%]",
//       cellClassName: "w-[10%]",
//     },
//   },
  {
    accessorKey: "action",
    header: <FormattedMessage id="COMMON.ACTIONS" defaultMessage="Action" />,
    cell: ({ row }) => (
      <div className="flex items-center justify-center gap-2">
        {permissions.edit && (
          <Tooltip title="Edit">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onEdit(row.original)}
            >
              <i className="ki-filled ki-notepad-edit text-primary"></i>
            </button>
          </Tooltip>
        )}

        {permissions.delete && (
          <Tooltip title="Delete">
            <button
              className="btn btn-sm btn-icon btn-clear"
              onClick={() => onDelete(row.original.id)}
            >
              <i className="ki-filled ki-trash text-danger"></i>
            </button>
          </Tooltip>
        )}
      </div>
    ),
    meta: {
      headerClassName: "w-[15%]",
      cellClassName: "w-[15%]",
    },
  },
];

// Optional: default data for testing
export const defaultData = [
  {
    id: 1,
    sr_no: 1,
    name_english: "Deluxe Room",
    name_gujarati: "ડીલક્સ રૂમ",
    name_hindi: "डीलक्स रूम",
    price: 2500,
    isActive: true,
  },
  {
    id: 2,
    sr_no: 2,
    name_english: "Suite Room",
    name_gujarati: "સ્યૂટ રૂમ",
    name_hindi: "सुइट रूम",
    price: 5000,
    isActive: true,
  },
];